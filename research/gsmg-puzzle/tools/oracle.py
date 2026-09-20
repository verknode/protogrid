"""The two open 80-byte locks, with a PKCS#7 filter and a full decrypt.

Both blobs are published on the puzzle's own pages; they are the objects the final
gate is built on, so they are carried here rather than read from a scratch file.
`check` does one AES block operation on the final ciphertext block and is the cheap
filter; `full` decrypts the whole thing.  Both digests are offered because an
unopened blob cannot assume one -- see notes sections 26 and 28.
"""
import base64, ctypes, ctypes.util, hashlib

BLOBS = {
    # SalPhaseIon page, 2021
    "salphaseion": ("U2FsdGVkX186tYU0hVJBXXUnBUO7C0+X4KUWnWkCvoZSxbRD3wNsGWVHefvdrd9z"
                    "QvX0t8v3jPB4okpspxebRi6sE1BMl5HI8Rku+KejUqTvdWOX6nQjSpepXwGuN/jJ"),
    # phase 3.2.2, inside the phase 3.2 plaintext, 2019
    "phase322":    ("U2FsdGVkX1+0Wl49gnWTyiimluu7V3+vl7st0gUt9sWDzNLxDmlPMsDSiuW2a46z"
                    "gKlIi8aaqY5gpJPPEzW1n9n3/26qs4zstWtPKF8Zs/BTNN4IiEh4qu18mdC0NAv4"),
}
SALTS, CTS = {}, {}
for _name, _b64 in BLOBS.items():
    _raw = base64.b64decode(_b64)
    assert _raw[:8] == b"Salted__" and len(_raw) == 96, _name
    SALTS[_name], CTS[_name] = _raw[8:16], _raw[16:]

_lib = ctypes.CDLL(ctypes.util.find_library("crypto"))

class _AES_KEY(ctypes.Structure):
    _fields_ = [("rd_key", ctypes.c_uint * 60), ("rounds", ctypes.c_int)]

_lib.AES_set_decrypt_key.argtypes = [ctypes.c_char_p, ctypes.c_int,
                                     ctypes.POINTER(_AES_KEY)]
_lib.AES_decrypt.argtypes = [ctypes.c_char_p, ctypes.c_char_p,
                             ctypes.POINTER(_AES_KEY)]

def btk(pw, salt, digest):
    """EVP_BytesToKey, count 1, for a 32-byte key and a 16-byte IV."""
    out, prev = b"", b""
    while len(out) < 48:
        prev = hashlib.new(digest, prev + pw + salt).digest()
        out += prev
    return out[:32], out[32:48]

def _block(key, ct):
    ak = _AES_KEY()
    _lib.AES_set_decrypt_key(key, 256, ctypes.byref(ak))
    buf = ctypes.create_string_buffer(16)
    _lib.AES_decrypt(ct, buf, ctypes.byref(ak))
    return bytes(buf.raw[:16])

def check(pw, blob, digest):
    """True if the final block decrypts to something with valid PKCS#7 padding.

    Roughly 1 in 256 wrong passwords pass, and essentially all of those pass with a
    single 0x01 byte, so this is a filter and never on its own a result.
    """
    if isinstance(pw, str):
        pw = pw.encode()
    key, _ = btk(pw, SALTS[blob], digest)
    ct = CTS[blob]
    last = bytes(a ^ b for a, b in zip(_block(key, ct[-16:]), ct[-32:-16]))
    p = last[-1]
    return 1 <= p <= 16 and all(c == p for c in last[16 - p:])

def full(pw, blob, digest):
    if isinstance(pw, str):
        pw = pw.encode()
    key, iv = btk(pw, SALTS[blob], digest)
    ct, out, prev = CTS[blob], b"", iv
    for i in range(0, len(ct), 16):
        out += bytes(a ^ b for a, b in zip(_block(key, ct[i:i + 16]), prev))
        prev = ct[i:i + 16]
    return out
