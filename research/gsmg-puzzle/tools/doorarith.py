import hashlib, importlib.util
spec=importlib.util.spec_from_file_location('btc','btc.py'); btc=importlib.util.module_from_spec(spec); spec.loader.exec_module(btc)
N=btc.N
def addr_of(k):
    k%=N
    if k==0: return None,None
    P=btc.mul(k)
    u=b'\x04'+P[0].to_bytes(32,'big')+P[1].to_bytes(32,'big')
    c=bytes([2+(P[1]&1)])+P[0].to_bytes(32,'big')
    return btc.addr(u), btc.addr(c)
TARGET="1NULY7DhzuNvSDtPkFzNo6oRTZQWBqXNE9"

pre=b"gsmg.io/theseedisplanted"
k_raw=int.from_bytes(pre.rjust(32,b'\0'),'big')          # left-padded raw
k_rawR=int.from_bytes(pre.ljust(32,b'\0'),'big')         # right-padded raw
# bit reversed (192-bit string backwards): reverse bits of each byte, reverse byte order, over 24 bytes then pad
def bitrev_bytes(b):
    rb=bytes(int(f'{x:08b}'[::-1],2) for x in b)[::-1]
    return rb
k_rev=int.from_bytes(bitrev_bytes(pre).rjust(32,b'\0'),'big')
k_revL=int.from_bytes(bitrev_bytes(pre).ljust(32,b'\0'),'big')

base={'k_raw':k_raw,'k_rawR':k_rawR,'k_rev':k_rev,'k_revL':k_revL}
cands={}
for n,k in base.items():
    cands[n]=k
    cands[n+'*2']=k*2%N
    cands[n+'/2']=k*pow(2,N-2,N)%N
    cands[n+'+1']=k+1
    cands[n+'-1']=k-1
    cands[n+'_neg']=N-k
    cands['sha_'+n]=int.from_bytes(hashlib.sha256(k.to_bytes(32,'big')).digest(),'big')
# pairwise relations
for a in base:
    for b in base:
        if a<b:
            cands[f'{a}^{b}']=base[a]^base[b]
            cands[f'{a}+{b}']=(base[a]+base[b])%N
            cands[f'{a}-{b}']=(base[a]-base[b])%N
            cands['sha_'+a+b]=int.from_bytes(hashlib.sha256(base[a].to_bytes(32,'big')+base[b].to_bytes(32,'big')).digest(),'big')
            cands['sha_'+a+b+'concatascii']=int.from_bytes(hashlib.sha256((pre+pre).ljust(32,b'\0')).digest(),'big')
# also sha256 of the two door ADDRESSES / opreturn "Good job, Neo!"
for s in ["Good job, Neo!","GoodjobNeo","goodjobneo","148XH2YBmLr4oAJXQcG84FpNYoBmqnVPHQ13HGhjkmKUkP8sk9k63BLmhkxRjy7uK4Rp"]:
    cands['sha_'+s[:12]]=int.from_bytes(hashlib.sha256(s.encode()).digest(),'big')
hit=0
for n,k in cands.items():
    u,c=addr_of(k)
    if u==TARGET or c==TARGET:
        print("*** THIRD DOOR MATCH:",n,hex(k%N)); hit+=1
print(f"tested {len(cands)} arithmetic relations, matches {hit}")
