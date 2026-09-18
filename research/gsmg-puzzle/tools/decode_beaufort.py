#!/usr/bin/env python3
"""Recover the GSMG phase-3.2 Beaufort block from scratch.

The block is 1539 bytes over a 26-symbol EBCDIC-ish alphabet. The substitution
table is unknown, but the plaintext is the Architect monologue, so ~78 chars of
crib recover 23 of 26 symbols; the remaining 3 fall out of a 6-way search.

Usage: decode_beaufort.py <beaufort_raw.bin>
"""
import sys, itertools

KEY = "THEMATRIXHASYOU"
CRIB = "yourlifeisthesumofaremainderofanunbalancedequationinherenttotheprogrammingofthispuzzle"[:78]
WORDS = ["the", "and", "that", "you", "are", "this", "have", "been", "which",
         "with", "from", "not", "private", "key", "puzzle", "source", "cipher"]


def main(path: str) -> None:
    blk = open(path, "rb").read().rstrip(b"\r")
    k = [ord(c) - 65 for c in KEY]

    # Beaufort: plain = key - cipher (mod 26). Crib gives sub-table entries.
    table = {}
    for i, ch in enumerate(CRIB):
        table[blk[i]] = (k[i % len(k)] - (ord(ch) - 97)) % 26

    unknown = [b for b in sorted(set(blk)) if b not in table]
    free = [v for v in range(26) if v not in set(table.values())]

    best = None
    for perm in itertools.permutations(free, len(unknown)):
        cand = table.copy()
        cand.update(zip(unknown, perm))
        txt = "".join(chr((k[i % len(k)] - cand[c]) % 26 + 97)
                      for i, c in enumerate(blk))
        score = sum(txt.count(w) for w in WORDS)
        if best is None or score > best[0]:
            best = (score, txt)

    print(best[1])


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "beaufort_raw.bin")
