import sys, re, hashlib
sys.path.insert(0,'.')
import oracle

obj=open('object256.txt').read().strip()
alpha23=sorted(set(obj))
key="DBIFHCEG"; seen=[]
for c in key+"ABCDEFGHIKLMNOPQRSTUVWXYZ":
    if c!='J' and c not in seen: seen.append(c)
SQUARE=''.join(seen); pos={c:i for i,c in enumerate(SQUARE)}
PR=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83]
rank23={c:i+1 for i,c in enumerate(alpha23)}
prime23={c:PR[i] for i,c in enumerate(alpha23)}
SCH={'a1z26':lambda c:ord(c)-64,'rank23':lambda c:rank23[c],'sqidx':lambda c:pos[c],
     'sqrow':lambda c:pos[c]//5+1,'sqcol':lambda c:pos[c]%5+1,'prime23':lambda c:prime23[c]}

# matrix layouts of the 256 chars
def rowmajor(s): return [s[i*16:(i+1)*16] for i in range(16)]
def colmajor(s):
    R=rowmajor(s); return [''.join(R[r][c] for r in range(16)) for c in range(16)]
def boustro(s):
    R=rowmajor(s); return [r if i%2==0 else r[::-1] for i,r in enumerate(R)]
def spiral(s):
    g=[[None]*16 for _ in range(16)]; it=iter(s)
    t,b,l,r=0,15,0,15
    while t<=b and l<=r:
        for c in range(l,r+1): g[t][c]=next(it)
        t+=1
        for rr in range(t,b+1): g[rr][r]=next(it)
        r-=1
        for c in range(r,l-1,-1): g[b][c]=next(it)
        b-=1
        for rr in range(b,t-1,-1): g[rr][l]=next(it)
        l+=1
    return [''.join(row) for row in g]
LAYOUTS={'row':rowmajor,'col':colmajor,'bou':boustro,'spi':spiral,
         'rowrev':lambda s:rowmajor(s[::-1]),'colrev':lambda s:colmajor(s[::-1])}

beau=open('beaufort_plain.txt').read().strip()
p32b=open('phase32.txt','rb').read()
p32=''.join(chr(b) for b in p32b if 32<=b<127 or b==10)
prose=p32.split('One for one, four for one.')[0]+'One for one, four for one.'
def Lo(s): return re.sub(r'[^A-Za-z]','',s)
ARCH=("your life is the sum of a remainder of an unbalanced equation inherent to the programming of the matrix "
 "the door to your right leads to the source and the salvation of zion the door to your left leads back to the matrix to her and to the end of your species")
CHARTEXTS={'beau':beau,'beauUP':beau.upper(),'prose':Lo(prose).lower(),'proseUP':Lo(prose).upper(),
  'prose_full':prose,'arch':Lo(ARCH),'archUP':Lo(ARCH).upper(),'obj':obj,
  'beautail':beau[-256:],'ans227':open('ans227.txt').read().strip()}
# word-level texts
WORDTEXTS={'prosew':prose.split(),'archw':ARCH.split(),
  'beauw':re.findall(r'.{1,6}',beau)}

def idxs(vals,n):
    yield 'mod0',[v%n for v in vals]
    yield 'mod1',[(v-1)%n for v in vals]
    yield 'cum',[__import__('itertools').accumulate(vals)]
    c=0;cum=[]
    for v in vals: c+=v; cum.append(c%n)
    yield 'cumm',cum
    yield 'd10',[(v%100)%n for v in vals]
    yield 'dsum',[(sum(int(d) for d in str(v)))%n for v in vals]

def combos(a,b):
    yield 'yy',a+b
    yield 'yyr',b+a
    yield 'yin',a
    yield 'yang',b
    yield 'il',''.join(x+y for x,y in zip(a,b))
    yield 'yrY',a+b[::-1]

def forms(s):
    e=s.encode()
    yield s; yield s.lower(); yield s.upper()
    yield hashlib.sha256(e).hexdigest(); yield hashlib.sha256(e).hexdigest().upper()
    yield hashlib.md5(e).hexdigest()
BL=[('salphaseion','sha256'),('salphaseion','md5'),('phase322','sha256'),('phase322','md5')]
n=0;h=0
for lname,lay in LAYOUTS.items():
    G=lay(obj)
    for sname,f in SCH.items():
        rows=[sum(f(c) for c in G[r]) for r in range(16)]
        cols=[sum(f(G[r][c]) for r in range(16)) for c in range(16)]
        for tname,T in list(CHARTEXTS.items())+list(WORDTEXTS.items()):
            N=len(T); join = '' if isinstance(T,str) else ' '
            ri=dict(x for x in idxs(rows,N) if x[0]!='cum')
            ci=dict(x for x in idxs(cols,N) if x[0]!='cum')
            for conv in ri:
                a=join.join(T[i] for i in ri[conv]); b=join.join(T[i] for i in ci[conv])
                for cname,s in combos(a,b):
                    for pw in forms(s):
                        for blob,dg in BL:
                            n+=1
                            if oracle.check(pw,blob,dg):
                                h+=1
                                pt=oracle.full(pw,blob,dg); p=pt[-1]; body=pt[:-p]
                                if sum(1 for c in body if 32<=c<127)/max(1,len(body))>0.85:
                                    print('*** READABLE',lname,sname,tname,conv,cname,blob,dg,repr(pw)[:100],body[:110],flush=True)
print('tested',n,'padhits',h)
