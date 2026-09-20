import hashlib, importlib.util
spec=importlib.util.spec_from_file_location('btc','btc.py'); btc=importlib.util.module_from_spec(spec); spec.loader.exec_module(btc)
N=btc.N
def addr_of(k):
    k%=N
    if not k: return None,None
    P=btc.mul(k); u=b'\x04'+P[0].to_bytes(32,'big')+P[1].to_bytes(32,'big'); c=bytes([2+(P[1]&1)])+P[0].to_bytes(32,'big')
    return btc.addr(u),btc.addr(c)
T="1NULY7DhzuNvSDtPkFzNo6oRTZQWBqXNE9"
# every gsmg.io path / door string under many constructions
STR=["gsmg.io/theseedisplanted","gsmg.io/theseedisplanted/","theseedisplanted",
 "gsmg.io/puzzle","gsmg.io/choiceisanillusioncreatedbetweenthosewithpowerandthosewithoutaveryspecialdessertiwroteitmyself",
 "https://gsmg.io/theseedisplanted","www.gsmg.io/theseedisplanted","GSMG.IO/THESEEDISPLANTED",
 "gsmg.io/89727c598b9cd1cf8873f27cb7057f050645ddb6a7a157a110239ac0152f6a32",
 "thethirddoor","thirddoor","gsmg.io/thethirddoor","gsmg.io/thirddoor",
 "thedoortoyourright","gsmg.io/thedoortoyourright"]
def bitrev(b): return bytes(int(f'{x:08b}'[::-1],2) for x in b)[::-1]
hit=0; n=0
for s in STR:
    b=s.encode()
    ks=set()
    ks.add(int.from_bytes(b.rjust(32,b'\0'),'big'))          # raw left-pad
    ks.add(int.from_bytes(b.ljust(32,b'\0'),'big'))          # raw right-pad
    ks.add(int.from_bytes(bitrev(b).rjust(32,b'\0'),'big'))  # bit-reversed L
    ks.add(int.from_bytes(bitrev(b).ljust(32,b'\0'),'big'))  # bit-reversed R
    ks.add(int.from_bytes(b[::-1].rjust(32,b'\0'),'big'))    # byte-reversed L
    ks.add(int.from_bytes(b[::-1].ljust(32,b'\0'),'big'))    # byte-reversed R
    ks.add(int.from_bytes(hashlib.sha256(b).digest(),'big')) # sha256
    ks.add(int.from_bytes(hashlib.sha256(b[::-1]).digest(),'big'))
    ks.add(int.from_bytes(bitrev(hashlib.sha256(b).digest()),'big'))
    ks.add(int.from_bytes(hashlib.sha256(hashlib.sha256(b).digest()).digest(),'big'))
    for k in ks:
        n+=1; u,c=addr_of(k)
        if T in (u,c): print("*** MATCH",s,hex(k%N)); hit+=1
print(f"tested {n} keys over {len(STR)} strings, matches {hit}")
