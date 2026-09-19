"""Yellow/Blue + primes + zeroed-out readings of the puzzle's NON-TEXTUAL objects.
Emits candidate lines for ./brain2 (phrases, and 64-hex raw keys)."""
import sys, re, itertools, hashlib

grid=[l.strip() for l in open('grid_sym.txt') if l.strip()]
grid=[l.upper() for l in grid]
G=''.join(grid); R=len(grid); C=len(grid[0])
obj=open('object256.txt').read().strip()
bif=open('bifid_out.txt').read().strip()
rowbits=open('rowbits.txt').read().strip()
colvals=open('colvals.txt').read().strip()
vic=open('vic_digits.txt').read().strip()
qr=''.join(l.strip() for l in open('qr_modules.txt') if l.strip())
drop=''.join(c for c in bif if c in 'IO')

def primes_upto(n):
    s=[True]*(n+1); s[0]=s[1]=False
    for i in range(2,int(n**.5)+1):
        if s[i]:
            for j in range(i*i,n+1,i): s[j]=False
    return [i for i in range(n+1) if s[i]]
PRIMES=set(primes_upto(100000))

out=[]
def emit(s):
    if s: out.append(s)
def emit_bits(bits, tag=''):
    """bits: string of 0/1 -> pack several ways into 32-byte keys"""
    if len(bits)<8: return
    for b in (bits, bits[::-1]):
        n=int(b,2)
        emit('%064x'%(n % (1<<256)))
        # left-aligned
        bb=(b+'0'*256)[:256]; emit('%064x'%int(bb,2))
        emit(hashlib.sha256(b.encode()).hexdigest())
        emit(b)
def emit_digits(ds):
    emit(ds); emit(ds[::-1])
    try:
        emit('%064x'%(int(ds)%(1<<256)))
    except Exception: pass
    emit(hashlib.sha256(ds.encode()).hexdigest())
    # base-N digits packed
    for base in (3,4,5,6,8,10,16):
        if all(int(c)<base for c in ds):
            v=int(ds,base); emit('%064x'%(v%(1<<256)))

# ---- 1. Yellow/Blue numbering on the colour grid ----
YB = {'Y':9,'B':15}
fills = [('WK',{'W':0,'K':1}), ('WK2',{'W':1,'K':0}),
         ('zero',{'W':0,'K':0}), ('skip',None)]
for fname,fill in fills:
    for yv,bv in [(9,15),(15,9),(9,0),(0,9)]:
        seq=[]
        for ch in G:
            if ch=='Y': seq.append(yv)
            elif ch=='B': seq.append(bv)
            elif fill is None: continue
            else: seq.append(fill[ch])
        if not seq: continue
        emit_digits(''.join(str(v) for v in seq))
        emit('%064x'%(int.from_bytes(bytes(v%256 for v in seq),'big')%(1<<256)))
        emit(hashlib.sha256(bytes(v%256 for v in seq)).hexdigest())

# ---- 2. Yellow/Blue as pure bits, everything else dropped ----
for one,zero in (('Y','B'),('B','Y')):
    bits=''.join('1' if c==one else '0' for c in G if c in 'YB')
    emit_bits(bits)
# positions of Y and B in the grid
ypos=[i for i,c in enumerate(G) if c=='Y']; bpos=[i for i,c in enumerate(G) if c=='B']
for L in (ypos,bpos,ypos+bpos,bpos+ypos,sorted(ypos+bpos)):
    emit(','.join(map(str,L))); emit(''.join(map(str,L)))
    emit('%064x'%(int.from_bytes(bytes(v%256 for v in L),'big')%(1<<256)))

# ---- 3. "zeroed out": zero prime / non-prime positions of each object ----
OBJS={'obj':obj,'bif':bif,'grid':G,'drop':drop,'rowbits':rowbits,'colvals':colvals,'vic':vic,'qr':qr}
for on,O in OBJS.items():
    for base in (0,1):
        for mode in ('zeroprime','zerononprime','keepprime','keepnonprime'):
            s=[]
            for i,ch in enumerate(O):
                p=(i+base) in PRIMES
                if mode=='zeroprime':      s.append('0' if p else ch)
                elif mode=='zerononprime': s.append('0' if not p else ch)
                elif mode=='keepprime':    s.append(ch if p else '')
                else:                      s.append(ch if not p else '')
            t=''.join(s)
            if not t: continue
            emit(t); emit(t.lower())
            emit(hashlib.sha256(t.encode()).hexdigest())
            if set(t)<=set('01'): emit_bits(t)
            if set(t)<=set('0123456789'): emit_digits(t)

# ---- 4. primes indexed by object letters ----
alpha=sorted(set(obj)); PR=primes_upto(400)
pr23={c:PR[i] for i,c in enumerate(alpha)}
for O,name in ((obj,'obj'),(bif,'bif')):
    a=sorted(set(O)); prm={c:PR[i] for i,c in enumerate(a)}
    ds=''.join(str(prm[c]) for c in O)
    emit_digits(ds)
    emit('%064x'%(int.from_bytes(bytes(prm[c]%256 for c in O),'big')%(1<<256)))
    emit(hashlib.sha256(bytes(prm[c]%256 for c in O)).hexdigest())

# ---- 5. grid read at prime positions only, Y/B numbered ----
for base in (0,1):
    seq=[ (9 if G[i]=='Y' else 15 if G[i]=='B' else 0) for i in range(len(G)) if (i+base) in PRIMES]
    emit(''.join(map(str,seq)))
    emit('%064x'%(int.from_bytes(bytes(v%256 for v in seq),'big')%(1<<256)))

# ---- 6. "esrever": every object reversed, plus bit reversal ----
for on,O in OBJS.items():
    emit(O[::-1]); emit(O[::-1].lower()); emit(hashlib.sha256(O[::-1].encode()).hexdigest())
    if set(O)<=set('01'): emit_bits(O)

seen=set(); n=0
for s in out:
    if s in seen: continue
    seen.add(s); print(s); n+=1
sys.stderr.write('candidates %d\n'%n)
