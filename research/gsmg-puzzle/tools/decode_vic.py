#!/usr/bin/env python3
"""Decode the 149-digit straddling-checkerboard string in the phase 3.2 plaintext.

Alphabet and the two row-prefix digits come from the puzzle's own riddle:
"A fubcd-king & oracle-queen, thingky mvps, on a sad board but as wide as the
first one seen." The 28 symbols fill an 8-column first row plus two full rows of
ten, which is exactly the 28-letter alphabet below with prefixes 1 and 4.

Usage: decode_vic.py <vic_digits.txt>
"""
import sys

ALPHA = "FUBCDORA.LETHINGKYMVPS/JQZXW"
D1, D2 = 1, 4


def main(path: str) -> None:
    digits = open(path).read().strip()
    table, i = {}, 0
    for col in (c for c in range(10) if c not in (D1, D2)):
        table[str(col)] = ALPHA[i]
        i += 1
    for prefix in (D1, D2):
        for col in range(10):
            table[f"{prefix}{col}"] = ALPHA[i]
            i += 1
    assert len(table) == len(ALPHA)

    out, j = [], 0
    while j < len(digits):
        if int(digits[j]) in (D1, D2):
            out.append(table[digits[j:j + 2]])
            j += 2
        else:
            out.append(table[digits[j]])
            j += 1
    print("".join(out))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "vic_digits.txt")
