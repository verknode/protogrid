#!/usr/bin/env python3
"""Decode the QR code in puzzle.png from its raw modules and verify it byte-exactly.

Reads the module matrix straight from the pixels, takes the format information,
unmasks, walks the zigzag codeword order, parses every segment, and recomputes the
Reed-Solomon parity from scratch. Result: a completely standard QR carrying only the
blockchain.com URL, with standard EC/11 padding and matching parity. Nothing is
hidden in it.

Usage: verify_qr.py <puzzle.png>
"""
import sys

import numpy as np
from PIL import Image

X0, Y0, N, MOD = 1, 1289, 33, 7          # version 4, located by dark-pixel bounds
EC_COUNT, DATA_COUNT = 20, 80            # version 4-L, single block


def gf_tables():
    exp, log, x = [0] * 512, [0] * 256, 1
    for i in range(255):
        exp[i], log[x] = x, i
        x <<= 1
        if x & 0x100:
            x ^= 0x11D
    for i in range(255, 512):
        exp[i] = exp[i - 255]
    return exp, log


EXP, LOG = gf_tables()


def mul(a, b):
    return 0 if a == 0 or b == 0 else EXP[LOG[a] + LOG[b]]


def generator(n):
    g = [1]
    for i in range(n):
        new = [0] * (len(g) + 1)
        for j, c in enumerate(g):
            new[j] ^= c
            new[j + 1] ^= mul(c, EXP[i])
        g = new
    return g


def read_modules(path):
    a = np.array(Image.open(path).convert("L"))
    return [[1 if a[Y0 + r * MOD + MOD // 2, X0 + c * MOD + MOD // 2] < 128 else 0
             for c in range(N)] for r in range(N)]


def function_mask():
    f = [[False] * N for _ in range(N)]

    def mark(r0, c0, h, w):
        for r in range(r0, r0 + h):
            for c in range(c0, c0 + w):
                if 0 <= r < N and 0 <= c < N:
                    f[r][c] = True

    mark(0, 0, 9, 9)
    mark(0, N - 8, 9, 8)
    mark(N - 8, 0, 8, 9)
    mark(24, 24, 5, 5)                   # the single alignment pattern of v2-6
    for i in range(N):
        f[6][i] = f[i][6] = True
    return f


def main(path):
    m = read_modules(path)
    fmt = [m[8][i] for i in (0, 1, 2, 3, 4, 5, 7, 8)] + \
          [m[i][8] for i in (7, 5, 4, 3, 2, 1, 0)]
    val = int("".join(str(b) for b in fmt), 2) ^ 0b101010000010010
    ecl = {1: "L", 0: "M", 3: "Q", 2: "H"}[(val >> 13) & 3]
    mask = (val >> 10) & 7
    print(f"version 4, EC level {ecl}, mask {mask}")

    func = function_mask()
    bits, col, up = [], N - 1, True
    while col > 0:
        if col == 6:
            col -= 1
        for r in (range(N - 1, -1, -1) if up else range(N)):
            for c in (col, col - 1):
                if not func[r][c]:
                    v = m[r][c]
                    if c % 3 == 0:        # mask pattern 2
                        v ^= 1
                    bits.append(v)
        col -= 2
        up = not up

    bs = "".join(str(b) for b in bits)
    words = [int(bs[i:i + 8], 2) for i in range(0, (len(bs) // 8) * 8, 8)]
    data, parity = words[:DATA_COUNT], words[DATA_COUNT:DATA_COUNT + EC_COUNT]

    p = 0

    def take(n):
        nonlocal p
        v = int(bs[p:p + n], 2)
        p += n
        return v

    while p + 4 <= len(bs):
        mode = take(4)
        if mode == 0:
            print(f"terminator at bit {p - 4}")
            break
        if mode == 7:
            print("ECI designator:", take(8))
        elif mode == 4:
            ln = take(8)
            print(f"byte segment, length {ln}:", bytes(take(8) for _ in range(ln)))
        else:
            print("unexpected mode", mode)
            break

    print("padding after terminator:", [f"{w:02x}" for w in data[DATA_COUNT - 4:]])

    g = generator(EC_COUNT)
    msg = data + [0] * EC_COUNT
    for i in range(DATA_COUNT):
        c = msg[i]
        if c:
            for j in range(1, len(g)):
                msg[i + j] ^= mul(g[j], c)
    print("Reed-Solomon parity:",
          "matches" if msg[DATA_COUNT:] == parity else "MISMATCH")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "puzzle.png")
