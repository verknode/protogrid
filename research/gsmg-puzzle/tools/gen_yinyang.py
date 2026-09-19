import json, hashlib, itertools, re, sys, os
sys.path.insert(0,'.')
import oracle

sums = json.load(open('matsums.json'))

# ---- texts to index into ----
beau = open('beaufort_plain.txt').read().strip()
p32raw = open('phase32.txt','rb').read()
p32txt = ''.join(chr(b) for b in p32raw if 32<=b<127 or b==10)
# prose part only (before the symbol soup)
prose = p32txt.split('One for one, four for one.')[0] + 'One for one, four for one.'
prose_letters = re.sub(r'[^A-Za-z]','',prose)
beau_letters = beau  # already letters only

TEXTS = {
 'beaufort': beau_letters,
 'beaufort_up': beau_letters.upper(),
 'prose_letters': prose_letters,
 'prose_letters_up': prose_letters.upper(),
 'prose_raw': ''.join(prose.split()),   # no spaces, keeps punctuation/case
 'prose_full': prose,
}
# "last words before the architect choice": tail of the beaufort monologue
TEXTS['beau_tail'] = beau_letters[-256:]
TEXTS['beau_tail_up'] = beau_letters[-256:].upper()

def idx_variants(vals, L):
    """yield lists of indices under several conventions"""
    yield 'mod0', [v % L for v in vals]
    yield 'mod1', [(v-1) % L for v in vals]
    if all(v < L for v in vals):
        yield 'dir0', [v for v in vals]
        yield 'dir1', [v-1 for v in vals]

def cands():
    for scheme,(rows,cols) in sums.items():
        for tname, T in TEXTS.items():
            L=len(T)
            for conv, ridx in idx_variants(rows, L):
                yin = ''.join(T[i] for i in ridx)
                for conv2, cidx in idx_variants(cols, L):
                    if conv2!=conv: continue
                    yang = ''.join(T[i] for i in cidx)
                    tag = f'{scheme}/{tname}/{conv}'
                    for label, s in [
                        ('yin', yin), ('yang', yang),
                        ('yin+yang', yin+yang), ('yang+yin', yang+yin),
                        ('yin+revyang', yin+yang[::-1]),
                        ('revyin+yang', yin[::-1]+yang),
                        ('interleave', ''.join(a+b for a,b in zip(yin,yang))),
                        ('interleave2', ''.join(b+a for a,b in zip(yin,yang))),
                        ('xorpairs', ''.join(chr(((ord(a)^ord(b))%26)+97) for a,b in zip(yin,yang))),
                    ]:
                        yield tag+'/'+label, s

def pw_forms(s):
    b=s.encode()
    yield s
    yield hashlib.sha256(b).hexdigest()
    yield hashlib.sha256(b).hexdigest().upper()
    yield hashlib.md5(b).hexdigest()
    yield s.lower(); yield s.upper()

hits=[]; n=0
for tag, s in cands():
    for pw in pw_forms(s):
        for blob in ('salphaseion','phase322'):
            for dg in ('sha256','md5'):
                n+=1
                if oracle.check(pw, blob, dg):
                    hits.append((tag,pw,blob,dg))
                    print('PADHIT', tag, blob, dg, repr(pw)[:120], flush=True)
print('tested', n, 'padhits', len(hits))
