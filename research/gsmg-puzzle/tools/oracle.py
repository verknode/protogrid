import hashlib, subprocess, os
SALTS = {
 'salphaseion': bytes.fromhex('3ab585348552415d'),
 'phase322'   : bytes.fromhex('b45a5e3d827593ca'),
}
CTS = {}
CTS['salphaseion'] = bytes.fromhex(open('salph_ct.txt').read().strip())
CTS['phase322']    = bytes.fromhex(open('p322_ct.txt').read().strip())

def btk(pw, salt, digest):
    d=b''; prev=b''
    while len(d) < 48:
        prev = hashlib.new(digest, prev+pw+salt).digest()
        d += prev
    return d[:32], d[32:48]

# pure-python AES-128/256 decrypt of last block only would be complex; use openssl CLI? too slow.
# Instead use ctypes on libcrypto.
import ctypes, ctypes.util
lib = ctypes.CDLL(ctypes.util.find_library('crypto'))
class AES_KEY(ctypes.Structure):
    _fields_=[('rd_key', ctypes.c_uint*60), ('rounds', ctypes.c_int)]
lib.AES_set_decrypt_key.argtypes=[ctypes.c_char_p, ctypes.c_int, ctypes.POINTER(AES_KEY)]
lib.AES_decrypt.argtypes=[ctypes.c_char_p, ctypes.c_char_p, ctypes.POINTER(AES_KEY)]

def dec_last(key, ct):
    ak=AES_KEY()
    lib.AES_set_decrypt_key(key, 256, ctypes.byref(ak))
    out=ctypes.create_string_buffer(16)
    lib.AES_decrypt(ct[-16:], out, ctypes.byref(ak))
    b=bytes(out.raw[:16])
    return bytes(x^y for x,y in zip(b, ct[-32:-16]))

def check(pw, blob, digest):
    if isinstance(pw,str): pw=pw.encode()
    key,iv = btk(pw, SALTS[blob], digest)
    last = dec_last(key, CTS[blob])
    p = last[-1]
    if 1 <= p <= 16 and all(c==p for c in last[16-p:]):
        return True
    return False

def full(pw, blob, digest):
    if isinstance(pw,str): pw=pw.encode()
    key,iv=btk(pw,SALTS[blob],digest)
    ak=AES_KEY(); lib.AES_set_decrypt_key(key,256,ctypes.byref(ak))
    ct=CTS[blob]; out=b''; prev=iv
    for i in range(0,len(ct),16):
        buf=ctypes.create_string_buffer(16)
        lib.AES_decrypt(ct[i:i+16], buf, ctypes.byref(ak))
        out += bytes(x^y for x,y in zip(bytes(buf.raw[:16]), prev))
        prev = ct[i:i+16]
    return out
