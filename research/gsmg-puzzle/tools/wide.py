import sys, re, json, hashlib, itertools
sys.path.insert(0,'.')
import oracle

obj = open('object256.txt').read().strip()
M=[obj[i*16:(i+1)*16] for i in range(16)]
alpha23 = sorted(set(obj))
key="DBIFHCEG"; seen=[]
for c in key+"ABCDEFGHIKLMNOPQRSTUVWXYZ":
    if c!='J' and c not in seen: seen.append(c)
SQUARE=''.join(seen); pos={c:i for i,c in enumerate(SQUARE)}
PR=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83]
prime23={c:PR[i] for i,c in enumerate(alpha23)}
rank23={c:i+1 for i,c in enumerate(alpha23)}
rank23z={c:i for i,c in enumerate(alpha23)}

SCH = {
 'a1z26': lambda c: ord(c)-64,
 'a0z25': lambda c: ord(c)-65,
 'rank23': lambda c: rank23[c],
 'rank23z': lambda c: rank23z[c],
 'sqidx': lambda c: pos[c],
 'sqidx1': lambda c: pos[c]+1,
 'sqrow': lambda c: pos[c]//5+1,
 'sqcol': lambda c: pos[c]%5+1,
 'sqrc': lambda c: (pos[c]//5+1)*10+(pos[c]%5+1),
 'prime23': lambda c: prime23[c],
 'ascii': lambda c: ord(c),
 'revrank': lambda c: 24-rank23[c],
}

def sums(f):
    rows=[sum(f(c) for c in M[r]) for r in range(16)]
    cols=[sum(f(M[r][c]) for r in range(16)) for c in range(16)]
    return rows, cols

# ---------- texts ----------
beau=open('beaufort_plain.txt').read().strip()
p32b=open('phase32.txt','rb').read()
p32=''.join(chr(b) for b in p32b if 32<=b<127 or b==10)
prose=p32.split('One for one, four for one.')[0]+'One for one, four for one.'
ans227=open('ans227.txt').read().strip()
bif=open('bifid_out.txt').read().strip()
seg0=open('seg0.txt').read().strip()
ARCH_FILM=("hello neo you have many questions and although the process has altered your "
 "consciousness you remain irrevocably human ergo some of my answers you will understand "
 "and some of them you will not concordantly while your first question may be the most "
 "pertinent you may or may not realize it is also the most irrelevant "
 "your life is the sum of a remainder of an unbalanced equation inherent to the programming of the matrix "
 "the door to your right leads to the source and the salvation of zion "
 "the door to your left leads back to the matrix to her and to the end of your species")

def L(s): return re.sub(r'[^A-Za-z]','',s)
TEXTS={}
TEXTS['beau']=beau
TEXTS['beauUP']=beau.upper()
TEXTS['beaurev']=beau[::-1]
TEXTS['prose']=L(prose).lower()
TEXTS['proseUP']=L(prose).upper()
TEXTS['prose_ns']=''.join(prose.split())
TEXTS['prose_full']=prose
TEXTS['p32all']=p32
TEXTS['ans227']=ans227
TEXTS['bifid']=bif
TEXTS['seg0']=seg0
TEXTS['obj256']=obj
TEXTS['film']=L(ARCH_FILM).lower()
TEXTS['filmUP']=L(ARCH_FILM).upper()
TEXTS['beau_tail']=beau[-256:]
TEXTS['beau_head']=beau[:256]
# "last words before the architect choice" - segment around the key/choice sentence
i=beau.find('pleaseifyoufindaway')
TEXTS['beau_choice']=beau[i:i+256]
TEXTS['beau_choiceUP']=beau[i:i+256].upper()

def idxs(vals, n):
    yield 'mod0',[v%n for v in vals]
    yield 'mod1',[(v-1)%n for v in vals]
    yield 'mod26',[(v%26)%n for v in vals]
    c=0; cum=[]
    for v in vals: c+=v; cum.append(c%n)
    yield 'cum',cum
    yield 'rev',[(n-1-(v%n)) for v in vals]
    yield 'sorted',[v%n for v in sorted(vals)]

def combos(yin,yang):
    yield 'yin',yin
    yield 'yang',yang
    yield 'yy',yin+yang
    yield 'yyr',yang+yin
    yield 'yrY',yin+yang[::-1]
    yield 'rYy',yin[::-1]+yang
    yield 'il',''.join(a+b for a,b in zip(yin,yang))
    yield 'il2',''.join(b+a for a,b in zip(yin,yang))
    yield 'yy_',yin+'_'+yang
    yield 'yysp',yin+' '+yang
    yield 'xor',''.join(chr(((ord(a)^ord(b))%26)+97) for a,b in zip(yin,yang))
    yield 'add',''.join(chr(((ord(a)+ord(b))%26)+97) for a,b in zip(yin,yang))

def forms(s):
    b=s.encode()
    yield s
    yield s.lower()
    yield s.upper()
    yield hashlib.sha256(b).hexdigest()
    yield hashlib.sha256(b).hexdigest().upper()
    yield hashlib.md5(b).hexdigest()
    yield hashlib.sha256(s.lower().encode()).hexdigest()
    yield hashlib.sha256(s.upper().encode()).hexdigest()

BL=[('salphaseion','sha256'),('salphaseion','md5'),('phase322','sha256'),('phase322','md5')]
n=0; hits=[]
for sname,f in SCH.items():
    rows,cols=sums(f)
    for tname,T in TEXTS.items():
        Ln=len(T)
        if Ln<2: continue
        ri=dict(idxs(rows,Ln)); ci=dict(idxs(cols,Ln))
        for conv in ri:
            yin=''.join(T[i] for i in ri[conv])
            yang=''.join(T[i] for i in ci[conv])
            for cname,s in combos(yin,yang):
                for pw in forms(s):
                    for blob,dg in BL:
                        n+=1
                        if oracle.check(pw,blob,dg):
                            pt=oracle.full(pw,blob,dg); p=pt[-1]; body=pt[:-p]
                            pr=sum(1 for c in body if 32<=c<127)/max(1,len(body))
                            if pr>0.85:
                                print('*** READABLE',sname,tname,conv,cname,blob,dg,repr(pw)[:100],body[:100],flush=True)
                            hits.append(1)
print('tested',n,'padhits',len(hits))
