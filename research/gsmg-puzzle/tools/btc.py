import hashlib
P=2**256-2**32-977
N=0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
Gx=0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
Gy=0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8
def inv(a,m=P): return pow(a,m-2,m)
def add(p,q):
    if p is None: return q
    if q is None: return p
    if p[0]==q[0] and (p[1]+q[1])%P==0: return None
    if p==q: l=(3*p[0]*p[0])*inv(2*p[1])%P
    else: l=(q[1]-p[1])*inv(q[0]-p[0])%P
    x=(l*l-p[0]-q[0])%P
    return (x,(l*(p[0]-x)-p[1])%P)
def mul(k,p=(Gx,Gy)):
    r=None
    while k:
        if k&1: r=add(r,p)
        p=add(p,p); k>>=1
    return r
B58="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
def b58c(b):
    n=int.from_bytes(b,'big'); s=""
    while n: n,r=divmod(n,58); s=B58[r]+s
    return "1"*(len(b)-len(b.lstrip(b'\0')))+s
def h160(b): return hashlib.new('ripemd160',hashlib.sha256(b).digest()).digest()
def addr(pub):
    pl=b'\x00'+h160(pub)
    return b58c(pl+hashlib.sha256(hashlib.sha256(pl).digest()).digest()[:4])
def keys(k):
    """return (uncompressed_addr, compressed_addr) for private scalar k"""
    if not (0<k<N): return None,None
    pt=mul(k)
    x,y=pt
    unc=b'\x04'+x.to_bytes(32,'big')+y.to_bytes(32,'big')
    com=bytes([2+(y&1)])+x.to_bytes(32,'big')
    return addr(unc),addr(com)
