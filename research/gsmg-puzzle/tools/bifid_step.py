#!/usr/bin/env python3
"""Reproduce the GSMG Bifid step and split out its two interleaved streams.

The 570-character SalPhaseIon segment is Bifid ciphertext over a 5x5 square keyed
`DBIFHCEG`, period equal to the full segment. The segment's alphabet is only A-I
because those nine letters are exactly the ones the key places in the square's
first two rows.

Decoding gives 570 letters starting `BTCSEED`, which split by parity into:

  odd  positions -> 285 letters, 25-letter alphabet; dropping I and O leaves the
                    known 256-symbol, 23-letter object
  even positions -> 285 letters over exactly {B, C, D, E}

Those four letters occupy the square's top-left 2x2 corner, so each is a (row, col)
pair with both coordinates in {0, 1}. The even stream is therefore a 2-bit-per-symbol
channel. Dropping the same 29 positions the odd stream drops leaves exactly 256
symbols, i.e. 512 bits.

Usage: bifid_step.py <seg2.txt>
"""
import sys

KEY = "DBIFHCEG"


def square(key: str):
    alpha = []
    for c in key + "ABCDEFGHIKLMNOPQRSTUVWXYZ":
        if c not in alpha:
            alpha.append(c)
    assert len(alpha) == 25
    return [alpha[i * 5:(i + 1) * 5] for i in range(5)]


def bifid_decrypt(ct: str, sq) -> str:
    pos = {sq[r][c]: (r, c) for r in range(5) for c in range(5)}
    seq = []
    for ch in ct:
        r, c = pos[ch]
        seq += [r, c]
    n = len(ct)
    rows, cols = seq[:n], seq[n:]
    return "".join(sq[rows[i]][cols[i]] for i in range(n))


def main(path: str) -> None:
    ct = open(path).read().strip().upper()
    pt = bifid_decrypt(ct, square(KEY))
    assert pt.startswith("BTCSEED"), pt[:20]

    odd, even = pt[1::2], pt[0::2]
    drop = [i for i, c in enumerate(odd) if c in "IO"]
    obj = "".join(c for c in odd if c not in "IO")
    even_reduced = "".join(c for i, c in enumerate(even) if i not in set(drop))
    bits = "".join(f"{['D','B','C','E'].index(c):02b}" for c in even_reduced)

    print(f"bifid output      : {len(pt)} chars, starts {pt[:7]}")
    print(f"odd stream        : {len(odd)} chars, alphabet {len(set(odd))}")
    print(f"256-symbol object : {len(obj)} chars, alphabet {len(set(obj))}")
    print(f"dropped letters   : {''.join(odd[i] for i in drop)}")
    print(f"dropped positions : {drop}")
    print(f"even stream       : {len(even)} chars, alphabet {''.join(sorted(set(even)))}")
    print(f"even reduced      : {len(even_reduced)} symbols -> {len(bits)} bits")
    print(f"bits              : {bits[:64]}...")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "seg2.txt")
