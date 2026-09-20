"""Reproduce and refute the community's small-blob decrypt (repo issue #108).

Four steps, all offline:
  1. the "corrected" blob against the one the README has always carried;
  2. the published password under MD5, against the published 79 bytes;
  3. what those bytes do -- as private keys, and as the other lock's password;
  4. the padding-acceptance rate under random passwords, which is the control.

Needs tools/oracle.py (the two locks) and a compiled tools/brain.c for step 3.
"""
import collections, hashlib, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import oracle

BLOB = ("U2FsdGVkX186tYU0hVJBXXUnBUO7C0+X4KUWnWkCvoZSxbRD3wNsGWVHefvdrd9z"
        "QvX0t8v3jPB4okpspxebRi6sE1BMl5HI8Rku+KejUqTvdWOX6nQjSpepXwGuN/jJ")
PW = "matrixsumlistenterlastwordsbeforearchichoicethispasswordmatrixsumlist"
CLAIM = bytes.fromhex(
    "9fa9db91a9dee0e38b93694ec874630b30f32f33671987543b1cf913f4746439"
    "1517389608d55021dc436b66ec513a617c4f14cb0fed4708b535641a6dfe8210"
    "38d4f4c90cb45fdfc8cff50d0ed1c5")

def step1(claimed_corrected):
    same = claimed_corrected == BLOB
    print(f"1. blob identical to the standard one: {same}")
    print(f"   position 18 = {BLOB[18]!r}, position 51 = {BLOB[51]!r}")

def step2():
    pt = oracle.full(PW, "salphaseion", "md5")
    body = pt[:-pt[-1]]
    print(f"2. decrypt reproduces the published bytes: {body == CLAIM}")
    print(f"   plaintext {len(body)} bytes, padding byte 0x{pt[-1]:02x}")
    c = collections.Counter(body)
    H = -sum(v / len(body) * math.log2(v / len(body)) for v in c.values())
    print(f"   {len(c)} distinct values, entropy {H:.2f} bits/byte "
          f"(uniform ceiling for {len(body)} samples ~{math.log2(len(body)):.2f})")
    print(f"   container marker present: "
          f"{b'Salted__' in body or b'U2FsdGVk' in body}")
    return body

def step3(body):
    """K_C1/K_C2 as keys -> feed to brain; E_C as the other lock's password."""
    k1, k2, ec = body[:32], body[32:64], body[64:]
    N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
    keys = set()
    for b in (k1, k2):
        v = int.from_bytes(b, "big")
        for k in (v, v * 2 % N, v * pow(2, N - 2, N) % N, (v + 1) % N, (v - 1) % N):
            if 0 < k < N:
                keys.add("%064x" % k)
        keys.add(b[::-1].hex())
        keys.add(hashlib.sha256(b).hexdigest())
    keys.add(bytes(a ^ b for a, b in zip(k1, k2)).hex())
    with open("issue108_keys.txt", "w") as fh:
        fh.write("\n".join(sorted(keys)) + "\n")
    print(f"3. {len(keys)} key candidates written to issue108_keys.txt; "
          f"check with:  ./brain ../data/planted-addresses.txt < issue108_keys.txt")
    hits = 0
    for form in (ec.hex(), ec.hex().upper(), ec[::-1].hex(), ec):
        for blob in ("salphaseion", "phase322"):
            for dg in ("md5", "sha256"):
                if oracle.check(form, blob, dg):
                    hits += 1
    print(f"   E_C as either lock's password: {hits} padding-valid")
    return keys

def step4(trials=40000):
    ok = one = 0
    for _ in range(trials):
        pw = os.urandom(24).hex()
        if oracle.check(pw, "salphaseion", "md5"):
            ok += 1
            if oracle.full(pw, "salphaseion", "md5")[-1] == 1:
                one += 1
    print(f"4. {trials} random passwords: {ok} padding-valid "
          f"({100 * ok / trials:.3f}%, chance {100 / 256:.3f}%)")
    print(f"   of those, exactly one 0x01 pad byte: {one}/{ok}")

if __name__ == "__main__":
    step1(BLOB)
    body = step2()
    step3(body)
    step4()
