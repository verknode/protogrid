"""Every contiguous word window of the Architect texts, in EXACT published casing and
punctuation as well as the usual normalisations, with 'esrever' applied as the last
command.  Upstream section 15 swept 3 forms (lowercase joined, lowercase spaced,
uppercase joined); this adds exact-case, punctuation-preserving, apostrophe-stripped
and title-case forms, and the reversal axis."""
import sys, re, hashlib
sys.path.insert(0,'.')
import oracle

PUZ = open('puz_words.txt').read().strip()          # page casing: uppercase + punctuation
FILM= open('film_arch.txt').read().strip()
P32 = open('phase32.txt','rb').read()
P32 = ''.join(chr(b) for b in P32 if 32<=b<127 or b==10)
INTRO = P32.split('One for one, four for one.')[0]+'One for one, four for one.'
INTRO = re.sub(r'\s+',' ',INTRO).strip()

BL=[('salphaseion','sha256'),('salphaseion','md5'),('phase322','sha256'),('phase322','md5')]

def forms(s):
    """normalisation variants of one window"""
    yield s                                   # exact, as published
    yield s.lower()
    yield s.upper()
    yield re.sub(r'\s+','',s)                 # exact case, joined
    yield re.sub(r'\s+','',s).lower()
    yield re.sub(r'\s+','',s).upper()
    n=re.sub(r"[^A-Za-z0-9 ]",'',s)
    yield n; yield n.lower(); yield n.upper()
    yield re.sub(r'\s+','',n); yield re.sub(r'\s+','',n).lower(); yield re.sub(r'\s+','',n).upper()
    a=s.replace("'",'')
    yield a; yield a.lower(); yield re.sub(r'\s+','',a).lower(); yield re.sub(r'\s+','',a).upper()

def rev(s):
    yield s
    yield s[::-1]
    yield ' '.join(s.split()[::-1])

def pw_forms(s):
    e=s.encode()
    d=hashlib.sha256(e).hexdigest()
    yield d; yield d.upper(); yield d[::-1]; yield s

n=h=r=0; seen=set()
for name,T,maxw in (('puz',PUZ,20),('film',FILM,20),('intro',INTRO,20)):
    w=T.split()
    for i in range(len(w)):
        for k in range(1,min(maxw,len(w)-i)+1):
            win=' '.join(w[i:i+k])
            for rv in rev(win):
                for s in forms(rv):
                    if not s or s in seen: continue
                    seen.add(s)
                    for pw in pw_forms(s):
                        for blob,dg in BL:
                            n+=1
                            if oracle.check(pw,blob,dg):
                                h+=1
                                pt=oracle.full(pw,blob,dg); p=pt[-1]; body=pt[:-p]
                                if sum(1 for c in body if 32<=c<127)/max(1,len(body))>0.80:
                                    r+=1
                                    print('*** READABLE',name,blob,dg,repr(s)[:90],'->',body[:110],flush=True)
print('phrases',len(seen),'tested',n,'padhits',h,'readable',r)
