import sys, re, hashlib, itertools
sys.path.insert(0,'.')
import oracle
bif=open('bifid_out.txt').read().strip()
pos=[i for i,c in enumerate(bif) if c in 'IO']
seq=''.join(bif[i] for i in pos)
oddidx=[(p-1)//2 for p in pos]
beau=open('beaufort_plain.txt').read().strip()
p32b=open('phase32.txt','rb').read()
p32=''.join(chr(b) for b in p32b if 32<=b<127 or b==10)
prose=p32.split('One for one, four for one.')[0]+'One for one, four for one.'
def Lo(s): return re.sub(r'[^A-Za-z]','',s)
obj=open('object256.txt').read().strip()
ARCH=("your life is the sum of a remainder of an unbalanced equation inherent to the programming of the matrix "
 "the door to your right leads to the source and the salvation of zion the door to your left leads back to "
 "the matrix to her and to the end of your species")
TEXTS={'beau':beau,'beauUP':beau.upper(),'prose':Lo(prose).lower(),'proseUP':Lo(prose).upper(),
 'prose_full':prose,'arch':Lo(ARCH),'archUP':Lo(ARCH).upper(),'obj':obj,'bif':bif,
 'ans227':open('ans227.txt').read().strip()}

cands={}
cands['seq']=seq
cands['seqrev']=seq[::-1]
cands['seq10']=''.join('1' if c=='I' else '0' for c in seq)
cands['seq01']=''.join('0' if c=='I' else '1' for c in seq)
cands['seq_yb']=''.join('Y' if c=='I' else 'B' for c in seq)   # yellow/blue
cands['seq_yin']=''.join('yin' if c=='I' else 'yang' for c in seq)
for nm in ['seq10','seq01']:
    b=cands[nm]
    cands[nm+'_int']=str(int(b,2)); cands[nm+'_hex']='%x'%int(b,2)
cands['pos']=','.join(map(str,pos))
cands['pos_']=''.join(map(str,pos))
cands['odd']=','.join(map(str,oddidx))
cands['odd_']=''.join(map(str,oddidx))
gaps=[pos[0]]+[pos[i]-pos[i-1] for i in range(1,len(pos))]
cands['gaps']=','.join(map(str,gaps))
cands['gaps_']=''.join(map(str,gaps))
cands['gapch']=''.join(chr(64+g) if 1<=g<=26 else '' for g in gaps)
cands['gaphalf']=''.join(chr(64+g//2) if 1<=g//2<=26 else '' for g in gaps)
# index-into-text readings
for tn,T in TEXTS.items():
    n=len(T)
    for ln,L in [('pos',pos),('odd',oddidx),('gap',gaps)]:
        cands[f'{tn}/{ln}/m0']=''.join(T[i%n] for i in L)
        cands[f'{tn}/{ln}/m1']=''.join(T[(i-1)%n] for i in L)
# 29 bits padded to 32 -> 4 bytes; also repeated to 256 bits
for nm in ['seq10','seq01']:
    b=cands[nm]
    cands[nm+'_pad']= (b+'000')
    cands[nm+'_rep']=(b*9)[:256]

def forms(s):
    e=s.encode()
    yield s; yield s.lower(); yield s.upper()
    yield hashlib.sha256(e).hexdigest(); yield hashlib.sha256(e).hexdigest().upper()
    yield hashlib.md5(e).hexdigest(); yield hashlib.md5(e).hexdigest().upper()
BL=[('salphaseion','sha256'),('salphaseion','md5'),('phase322','sha256'),('phase322','md5')]
n=0;h=0
for name,s in cands.items():
    if not s: continue
    for pw in forms(s):
        for blob,dg in BL:
            n+=1
            if oracle.check(pw,blob,dg):
                h+=1
                pt=oracle.full(pw,blob,dg); p=pt[-1]; body=pt[:-p]
                if sum(1 for c in body if 32<=c<127)/max(1,len(body))>0.85:
                    print('*** READABLE',name,blob,dg,repr(pw)[:90],body[:110],flush=True)
print('tested',n,'padhits',h,'candidates',len(cands))

# --- address check ---
import importlib.util
spec=importlib.util.spec_from_file_location('btc','btc.py'); btc=importlib.util.module_from_spec(spec); spec.loader.exec_module(btc)
TARGETS={'1GSMG1JC9wtdSwfwApgj2xcmJPAwx7prBe'}
try:
    import csv
    for row in open('/home/user/floflo777/open-crypto-puzzles/1-big-prizes/gsmg-io-5btc-puzzle/data/planted-addresses.csv'):
        for tok in row.replace(',',' ').split():
            if tok.startswith('1') and 25<=len(tok)<=34: TARGETS.add(tok)
except Exception as e: print('csv',e)
print('targets',len(TARGETS))
found=0; m=0
for name,s in cands.items():
    if not s: continue
    for pw in set(forms(s)):
        for kb in (hashlib.sha256(pw.encode()).digest(), hashlib.sha256(pw.encode().lower()).digest()):
            k=int.from_bytes(kb,'big')
            if not (0<k<btc.N): continue
            m+=1
            for a in btc.keys(k) if hasattr(btc,'keys') else []:
                pass
            try:
                pt=btc.mul(k)
                pubu=b'\x04'+pt[0].to_bytes(32,'big')+pt[1].to_bytes(32,'big')
                pubc=bytes([2+(pt[1]&1)])+pt[0].to_bytes(32,'big')
                for pub in (pubu,pubc):
                    a=btc.addr(pub)
                    if a in TARGETS:
                        found+=1; print('*** ADDRESS MATCH',name,repr(pw)[:80],a,flush=True)
            except Exception: pass
print('keys checked',m,'matches',found)
