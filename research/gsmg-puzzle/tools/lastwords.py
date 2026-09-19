"""SalPhaseIon page reads:  lastwordsbeforearchichoice z thispassword z shabef
   ourfirsthintisyourlastcommand.
   -> password = sha256( the last words before the Architect's choice ),
      with 'esrever' (reverse) applied as the last command.
   Enumerate every suffix of both Architect texts under many normalisations."""
import sys, re, hashlib
sys.path.insert(0,'.')
import oracle

# Film: the Architect's closing passage, up to the point where Neo chooses.
FILM = open('film_arch.txt').read().strip()
# The puzzle's own adaptation (phase 3.2.1 plaintext, letters only).
PUZ  = open('beaufort_plain.txt').read().strip()
PUZ_WORDS = open('puz_words.txt').read().strip()   # same text, re-spaced

def norms(s):
    """every plausible normalisation of a phrase"""
    out=set()
    base=[s, s.lower(), s.upper()]
    for b in base:
        out.add(b)
        out.add(re.sub(r'\s+',' ',b).strip())
        out.add(re.sub(r'\s+','',b))
        nop=re.sub(r"[^A-Za-z0-9\s]",'',b)
        out.add(re.sub(r'\s+',' ',nop).strip())
        out.add(re.sub(r'\s+','',nop))
        noap=b.replace("'","")
        out.add(re.sub(r'\s+',' ',noap).strip())
        out.add(re.sub(r'\s+','',noap))
    return {x for x in out if x}

def suffixes(text):
    w=text.split()
    for k in range(1, min(len(w),80)+1):
        yield ' '.join(w[-k:])
    # sentence suffixes
    sents=[x.strip() for x in re.split(r'(?<=[.!?])\s+', text) if x.strip()]
    for k in range(1, len(sents)+1):
        yield ' '.join(sents[-k:])

def letter_suffixes(text, maxn=400):
    for k in range(1, min(len(text),maxn)+1):
        yield text[-k:]

BL=[('salphaseion','sha256'),('salphaseion','md5'),('phase322','sha256'),('phase322','md5')]

def pw_forms(s):
    e=s.encode()
    d=hashlib.sha256(e).hexdigest()
    yield d
    yield d.upper()
    yield d[::-1]
    yield d.upper()[::-1]
    yield hashlib.sha256(d.encode()).hexdigest()
    yield hashlib.sha256(hashlib.sha256(e).digest()).hexdigest()
    yield s

def esrever(s):
    yield s
    yield s[::-1]
    yield ' '.join(s.split()[::-1])
    yield ' '.join(w[::-1] for w in s.split())

n=h=r=0
seen=set()
for src, gen in (('film',suffixes(FILM)), ('film_l',letter_suffixes(re.sub(r'[^A-Za-z]','',FILM).lower())),
                 ('puz',suffixes(PUZ_WORDS)), ('puz_l',letter_suffixes(PUZ))):
    for phrase in gen:
        for rv in esrever(phrase):
            for s in norms(rv):
                if s in seen: continue
                seen.add(s)
                for pw in pw_forms(s):
                    for blob,dg in BL:
                        n+=1
                        if oracle.check(pw,blob,dg):
                            h+=1
                            pt=oracle.full(pw,blob,dg); p=pt[-1]; body=pt[:-p]
                            if sum(1 for c in body if 32<=c<127)/max(1,len(body))>0.80:
                                r+=1
                                print('*** READABLE',src,blob,dg,repr(s)[:90],'->',body[:110],flush=True)
print('phrases',len(seen),'tested',n,'padhits',h,'readable',r)
