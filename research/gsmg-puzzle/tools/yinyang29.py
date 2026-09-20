"""The 9/15 -> rows -> 29 -> dropped29 chain: exhaust the final YIN/YANG step.

Objects are small and specific: two 16-character rows of the 16x16 object, the
29-character phrase the 'last words' hint names, and the 29-symbol I/O mask.
Both transcript variants of the phrase are carried, because the 15/9 word counts
the chain leans on only hold for one of them.
"""
import sys, re, hashlib, itertools
sys.path.insert(0,'.')
import oracle

MASK = "OOIIOOOIIOOIOIIOIOOOOIOIIOIOI"
ROW9  = "LGAWYAPGNYBGLRBR"
ROW15 = "EUNELLAPPMXXRGBM"
PHRASES = {
 'p29'   : "NOTHING YOU CAN DO TO STOP IT",          # 29 chars, the chain's variant
 'p_that': "NOTHING THAT YOU CAN DO TO STOP IT",     # the other transcript
 'p9'    : "THERE IS NOTHING YOU CAN DO TO STOP IT",
 'p15'   : "SHE IS GOING TO DIE AND THERE IS NOTHING YOU CAN DO TO STOP IT",
}

def norms(s):
    out={s, s.lower(), s.upper()}
    j=re.sub(r'\s+','',s); out |= {j, j.lower(), j.upper()}
    return {x for x in out if x}

def mask_ops(txt, mask):
    """every way the 29-bit mask can act on a string"""
    res=set()
    for m in (mask, mask[::-1]):
        for t in (txt, txt[::-1]):
            if len(t)!=len(m):
                pairs=list(zip(t,m))
            else:
                pairs=list(zip(t,m))
            selI=''.join(c for c,b in pairs if b=='I')
            selO=''.join(c for c,b in pairs if b=='O')
            for v in (selI, selO, selI+selO, selO+selI,
                      selI.replace(' ',''), selO.replace(' ',''),
                      (selI+selO).replace(' ',''), (selO+selI).replace(' ','')):
                res.add(v)
            # case toggling by mask
            res.add(''.join(c.upper() if b=='I' else c.lower() for c,b in pairs))
            res.add(''.join(c.lower() if b=='I' else c.upper() for c,b in pairs))
            # 9/15 shifts, both polarities, both directions
            for a,b2 in ((9,15),(15,9)):
                for sg in (1,-1):
                    res.add(''.join(
                        chr((ord(c)-65+sg*(a if bb=='I' else b2))%26+65) if c.isalpha() else c
                        for c,bb in pairs))
    return {x for x in res if x}

def vig(text, key, sign):
    ks=[c for c in key if c.isalpha()]
    if not ks: return ''
    out=[]; i=0
    for c in text:
        if not c.isalpha(): out.append(c); continue
        k=ord(ks[i%len(ks)])-65; i+=1
        out.append(chr((ord(c.upper())-65+sign*k)%26+65))
    return ''.join(out)

def beaufort(text, key):
    ks=[c for c in key if c.isalpha()]
    out=[]; i=0
    for c in text:
        if not c.isalpha(): out.append(c); continue
        k=ord(ks[i%len(ks)])-65; i+=1
        out.append(chr((k-(ord(c.upper())-65))%26+65))
    return ''.join(out)

cands=set()
def add(s):
    if s: cands.add(s)

# rows alone and combined
for a,b in ((ROW9,ROW15),(ROW15,ROW9)):
    for s in (a, a+b, a+' '+b, ''.join(x+y for x,y in zip(a,b)), a[::-1], (a+b)[::-1]):
        for n in norms(s): add(n)
    add(''.join(chr(((ord(x)-65)^(ord(y)-65))%26+65) for x,y in zip(a,b)))
    add(''.join(chr(((ord(x)-65+ord(y)-65)%26)+65) for x,y in zip(a,b)))

# phrases, masked every way
for pname,P in PHRASES.items():
    for n in norms(P): add(n)
    for v in mask_ops(P, MASK): 
        for n in norms(v): add(n)
    # phrase keyed by the rows, and rows keyed by the phrase
    for key in (ROW9, ROW15, ROW9+ROW15, ROW15+ROW9):
        for sg in (1,-1):
            add(vig(re.sub(r'\s+','',P), key, sg))
        add(beaufort(re.sub(r'\s+','',P), key))
        for sg in (1,-1):
            add(vig(key, re.sub(r'\s+','',P), sg))
        add(beaufort(key, re.sub(r'\s+','',P)))

# the mask itself, and the rows masked
for v in mask_ops(MASK, MASK): add(v)
for r in (ROW9, ROW15, ROW9+ROW15):
    for v in mask_ops(r, MASK): add(v)

def forms(s):
    e=s.encode()
    yield s
    yield hashlib.sha256(e).hexdigest()
    yield hashlib.sha256(e).hexdigest().upper()
    yield hashlib.md5(e).hexdigest()
    yield hashlib.sha256(s.encode()).hexdigest()[::-1]

BL=[('salphaseion','sha256'),('salphaseion','md5'),('phase322','sha256'),('phase322','md5')]
n=h=full16=read=0
for s in cands:
    for pw in set(forms(s)):
        for blob,dg in BL:
            n+=1
            if oracle.check(pw,blob,dg):
                h+=1
                pt=oracle.full(pw,blob,dg); p=pt[-1]
                if p==16: full16+=1; print('*** FULL PAD BLOCK', blob,dg,repr(s)[:70])
                body=pt[:-p]
                if sum(1 for c in body if 32<=c<127)/max(1,len(body))>0.80:
                    read+=1; print('*** READABLE',blob,dg,repr(s)[:70],'->',body[:90])
print(f'candidates {len(cands)}, decryptions {n}')
print(f'padding-valid {h} ({100*h/n:.3f}%, chance 0.391%), full 16-byte pad block {full16}, readable {read}')
