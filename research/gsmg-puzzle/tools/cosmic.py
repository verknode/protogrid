import hashlib, os, ctypes, ctypes.util, collections, math
raw=open('cosmic.bin','rb').read(); SALT=raw[8:16]; CT=raw[16:]
lib=ctypes.CDLL(ctypes.util.find_library('crypto'))
class AK(ctypes.Structure): _fields_=[('rd',ctypes.c_uint*60),('r',ctypes.c_int)]
lib.AES_set_decrypt_key.argtypes=[ctypes.c_char_p,ctypes.c_int,ctypes.POINTER(AK)]
lib.AES_decrypt.argtypes=[ctypes.c_char_p,ctypes.c_char_p,ctypes.POINTER(AK)]
def btk(pw,dg):
    o=b''; p=b''
    while len(o)<48: p=hashlib.new(dg,p+pw+SALT).digest(); o+=p
    return o[:32],o[32:48]
def decrypt(pw,dg):
    key,iv=btk(pw,dg)
    ak=AK(); lib.AES_set_decrypt_key(key,256,ctypes.byref(ak))
    out=b''; prev=iv
    for i in range(0,len(CT),16):
        b=ctypes.create_string_buffer(16); lib.AES_decrypt(CT[i:i+16],b,ctypes.byref(ak))
        out+=bytes(x^y for x,y in zip(bytes(b.raw[:16]),prev)); prev=CT[i:i+16]
    return out
def padok(pt):
    p=pt[-1]
    return (1<=p<=16 and all(c==p for c in pt[-p:])), p
