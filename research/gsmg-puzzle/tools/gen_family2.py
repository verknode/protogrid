"""Full Yellow/Blue + primes + 'zeroed out' + esrever sweep over the colour grid,
read in 20 spatial orders, with every plausible colour->number assignment."""
import sys, hashlib, itertools

grid=[l.strip().upper() for l in open('grid_sym.txt') if l.strip()]
R=len(grid); C=len(grid[0])

def primes_upto(n):
    s=[True]*(n+1); s[0]=s[1]=False
    for i in range(2,int(n**.5)+1):
        if s[i]:
            for j in range(i*i,n+1,i): s[j]=False
    return [i for i in range(n+1) if s[i]]
PRIMES=set(primes_upto(4096))

def T(g): return [''.join(g[r][c] for r in range(len(g))) for c in range(len(g[0]))]
def rot(g): return [''.join(g[len(g)-1-r][c] for r in range(len(g))) for c in range(len(g[0]))]
def spiral(g, cw=True):
    g=[list(r) for r in g]; out=[]
    t,b,l,r=0,len(g)-1,0,len(g[0])-1
    while t<=b and l<=r:
        for c in range(l,r+1): out.append(g[t][c])
        t+=1
        for rr in range(t,b+1): out.append(g[rr][r])
        r-=1
        if t<=b:
            for c in range(r,l-1,-1): out.append(g[b][c])
            b-=1
        if l<=r:
            for rr in range(b,t-1,-1): out.append(g[rr][l])
            l+=1
    s=''.join(out)
    return s if cw else s[::-1]
def diag(g):
    n,m=len(g),len(g[0]); out=[]
    for d in range(n+m-1):
        for r in range(n):
            c=d-r
            if 0<=c<m: out.append(g[r][c])
    return ''.join(out)

ORDERS={}
base=grid
for gname,g in [('id',base),('t',T(base)),('r90',rot(base)),('r180',rot(rot(base))),
                ('r270',rot(rot(rot(base)))),('flipH',[r[::-1] for r in base]),
                ('flipV',base[::-1])]:
    ORDERS[gname+'.rows']=''.join(g)
    ORDERS[gname+'.rowsrev']=''.join(g)[::-1]
    ORDERS[gname+'.bou']=''.join(r if i%2==0 else r[::-1] for i,r in enumerate(g))
    ORDERS[gname+'.cols']=''.join(T(g))
ORDERS['spiralCW']=spiral(base,True)
ORDERS['spiralCCW']=spiral(base,False)
ORDERS['diag']=diag(base)
ORDERS['diagT']=diag(T(base))

# colour -> number assignments. Y,B carry "their number"; W,K are structure.
NUMS=[]
for yv,bv in [(9,15),(15,9),(25,2),(2,25),(9,0),(0,15),(1,0),(0,1),(9,2),(25,15)]:
    for wv,kv in [(0,1),(1,0),(0,0),(None,None)]:
        NUMS.append((yv,bv,wv,kv))

MASKS=['all','prime0','prime1','nonprime0','nonprime1','zeroprime','zerononprime']

def apply_mask(seq, mask):
    if mask=='all': return seq
    if mask=='prime0':     return [v for i,v in enumerate(seq) if i in PRIMES]
    if mask=='prime1':     return [v for i,v in enumerate(seq) if i+1 in PRIMES]
    if mask=='nonprime0':  return [v for i,v in enumerate(seq) if i not in PRIMES]
    if mask=='nonprime1':  return [v for i,v in enumerate(seq) if i+1 not in PRIMES]
    if mask=='zeroprime':  return [0 if i in PRIMES else v for i,v in enumerate(seq)]
    if mask=='zerononprime':return [v if i in PRIMES else 0 for i,v in enumerate(seq)]

def pack(seq, emit):
    if not seq: return
    ds=''.join(str(v) for v in seq)
    emit(ds); emit(ds[::-1])
    bs=bytes(v%256 for v in seq)
    emit('%064x'%(int.from_bytes(bs,'big')%(1<<256)))
    emit('%064x'%(int.from_bytes(bs[::-1],'big')%(1<<256)))
    emit(hashlib.sha256(bs).hexdigest())
    emit(hashlib.sha256(ds.encode()).hexdigest())
    if max(seq)<2:
        b=''.join(str(v) for v in seq)
        emit('%064x'%(int(b,2)%(1<<256)))
        emit('%064x'%(int(b[::-1],2)%(1<<256)))
        emit('%064x'%(int((b+'0'*256)[:256],2)))
    if len(ds)<=64 and set(ds)<=set('0123456789abcdefABCDEF'):
        emit(ds.rjust(64,'0')); emit(ds.ljust(64,'0'))

seen=set(); n=0
def emit(s):
    global n
    if s and s not in seen:
        seen.add(s); sys.stdout.write(s+'\n'); n+=1

for oname,O in ORDERS.items():
    for (yv,bv,wv,kv) in NUMS:
        seq=[]
        for ch in O:
            if ch=='Y': seq.append(yv)
            elif ch=='B': seq.append(bv)
            elif wv is None: continue
            elif ch=='W': seq.append(wv)
            else: seq.append(kv)
        for m in MASKS:
            pack(apply_mask(seq,m), emit)
sys.stderr.write('candidates %d\n'%n)
