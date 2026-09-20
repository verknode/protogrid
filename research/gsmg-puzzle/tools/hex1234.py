import hashlib, sys
S=set()
def A(x):
    x=x.strip()
    if x: S.add(x)

V = 305452017  # 0x1234D3F1
bits29 = "10010001101001101001111110001"
A("1234D3F1"); A("1234d3f1"); A("0x1234D3F1"); A(str(V)); A("D3F1"); A("d3f1")
A(hex(V)[2:]); A(bits29); A(bits29[::-1])
A(str(0x1234)); A(str(0xD3F1)); A("1234"); A(str(54257))

# byte-level constructions
b4 = V.to_bytes(4,'big')
b4l = V.to_bytes(4,'little')
A(b4.hex()); A(b4l.hex())
# 32-byte forms: left/right pad, both endian
for b in (b4, b4l):
    A(b.rjust(32, b'\0').hex())
    A(b.ljust(32, b'\0').hex())
# 29-bit string as raw bytes (packed) both directions
def pack(bs):
    n = len(bs)
    padded = bs + '0'*((8-n%8)%8)
    return bytes(int(padded[i:i+8],2) for i in range(0,len(padded),8))
A(pack(bits29).hex())
A(pack(bits29[::-1]).hex())
A(pack(bits29).rjust(32,b'\0').hex() if False else '')
# D3F1 as index -- separate handling below

# digests
for s in list(S):
    e = s.encode() if not all(c in '0123456789abcdefABCDEF' for c in s) else s.encode()
    A(hashlib.sha256(e).hexdigest())
    A(hashlib.md5(e).hexdigest())
# raw bytes hashed too
for b in (b4, b4l, pack(bits29)):
    A(hashlib.sha256(b).hexdigest())
    A(hashlib.sha256(b).hexdigest().upper())

for s in sorted(x for x in S if x):
    print(s)
