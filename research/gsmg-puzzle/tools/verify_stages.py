#!/usr/bin/env python3
"""Re-derive every planted address whose preimage the creator published.

The creator funded one address per stage answer from a vanity wallet, with the
private key set to the SHA-256 of that answer (or, for two of them, to the raw and
bit-reversed bytes of the image URL). Those addresses are an exact, offline oracle
for whether a reconstructed stage answer is byte-correct.

Using it turns up an error in the community README. Its parts list gives phase 3's
part 6 as

    0x736B616E616220726F662074756F6C6961 ...

which carries an extra `61` and decodes to `skanab`, not `sknab`. The README's own
quote of line 1616 of main.cpp is correct. Reconstructing the answer from the parts
list gives 229 characters; the creator's on-chain message says "You are here because
227 chars were correct". With the correct hex the answer is exactly 227 characters,
its SHA-256 is the published phase 3 password, and it re-derives the planted address.

Usage: verify_stages.py
"""
import hashlib

GENESIS = b"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"
DIGITS_149 = ("15165943121972409169171213758951813141543131412428154191312181219433"
              "121171617137149110916631213131281491109166131412199114371612126021"
              "664313711154112")
IMAGE_URL = "gsmg.io/theseedisplanted"

PHASE3_PARTS = [
    "causality", "Safenet", "Luna", "HSM", "11110",
    "0x" + GENESIS[::-1].hex().upper(),
    "B5KR/1r5B/2R5/2b1p1p1/2P1k1P1/1p2P2p/1P2P2P/3N1N2 b - - 0 1",
]

P = 2 ** 256 - 2 ** 32 - 977
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
G = (0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798,
     0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8)
B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def _add(p, q):
    if p is None or q is None:
        return p or q
    if p[0] == q[0] and (p[1] + q[1]) % P == 0:
        return None
    if p == q:
        lam = 3 * p[0] * p[0] * pow(2 * p[1], P - 2, P) % P
    else:
        lam = (q[1] - p[1]) * pow(q[0] - p[0], P - 2, P) % P
    x = (lam * lam - p[0] - q[0]) % P
    return x, (lam * (p[0] - x) - p[1]) % P


def _mul(k):
    r, p = None, G
    while k:
        if k & 1:
            r = _add(r, p)
        p = _add(p, p)
        k >>= 1
    return r


def address(k, compressed=True):
    x, y = _mul(k % N)
    pub = (bytes([2 + (y & 1)]) + x.to_bytes(32, "big") if compressed
           else b"\x04" + x.to_bytes(32, "big") + y.to_bytes(32, "big"))
    h = b"\x00" + hashlib.new("ripemd160", hashlib.sha256(pub).digest()).digest()
    full = h + hashlib.sha256(hashlib.sha256(h).digest()).digest()[:4]
    n, out = int.from_bytes(full, "big"), ""
    while n:
        n, r = divmod(n, 58)
        out = B58[r] + out
    return "1" * (len(full) - len(full.lstrip(b"\0"))) + out


def sha_key(text):
    return int.from_bytes(hashlib.sha256(text.encode()).digest(), "big")


def main():
    answer = "".join(PHASE3_PARTS)
    print(f"phase 3 answer: {len(answer)} characters "
          f"(the creator's on-chain checksum says 227)")
    print(f"  sha256 = {hashlib.sha256(answer.encode()).hexdigest()}")

    url_bits = "".join(format(b, "08b") for b in IMAGE_URL.encode())
    cases = [
        ("1AD2wfwXukZ1kUAy848hTQQ72aSBZPB75r", "sha256(flower sentence)",
         sha_key("theflowerblossomsthroughwhatseemstobeaconcretesurface")),
        ("1Jqq37KkZEt4F3Dt6qXdtyiMEFBBdawbkJ", "sha256(causality)", sha_key("causality")),
        ("1M5ypvDbp124ZtKPbg3GJg1JqNs1x7TPoN", "sha256(227-char answer)", sha_key(answer)),
        ("1K23RS1y2fnuZRkhw5nUpFr5Jk5WN11Zeq", "sha256(phase 3.2 answer)",
         sha_key("jacquefrescogiveitjustonesecondheisenbergsuncertaintyprinciple")),
        ("18CchrjA3Uzfrzy4DFqao9ric6YfK4hjdc", "sha256(149 digits)", sha_key(DIGITS_149)),
        ("1GyT5WrLYpwFkuiVoPDJZa1Q6jtjbjuBff", "sha256(prize address)",
         sha_key("1GSMG1JC9wtdSwfwApgj2xcmJPAwx7prBe")),
        ("148XH2YBmLr4oAJXQcG84FpNYoBmqnVPHQ", "raw URL bytes",
         int.from_bytes(IMAGE_URL.encode(), "big")),
        ("13HGhjkmKUkP8sk9k63BLmhkxRjy7uK4Rp", "URL bits reversed", int(url_bits[::-1], 2)),
    ]
    ok = 0
    for addr, label, k in cases:
        hit = addr in (address(k), address(k, compressed=False))
        ok += hit
        print(f"  {'OK  ' if hit else 'MISS'} {addr}  {label}")
    print(f"\n{ok} of {len(cases)} re-derived")
    print("the ninth planted address, funded 2020-04-07 with no message, "
          "has no known preimage")


if __name__ == "__main__":
    main()
