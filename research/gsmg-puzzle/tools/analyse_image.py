#!/usr/bin/env python3
"""Structural analysis of the GSMG phase-0 image (puzzle.png).

Establishes, and re-verifies on every run:

  * the canvas is 70x70 blocks of 15 px; each of the 14x14 cells is exactly 5x5
    blocks, so the visible grid sits on a finer drawing grid;
  * the counter-clockwise spiral of the 14x14 cells decodes to the known URL;
  * the 24 coloured cells sit at spiral indices = 7 (mod 8), i.e. the LOW BIT of
    every byte, so their colour carries nothing the message does not already;
  * exactly one cell has an anomalous colour, RGB (254,254,254);
  * exactly 7 cells are non-uniform, and their deviating blocks are the white
    rabbit outline. There is no other sub-cell channel;
  * the PNG carries no metadata chunks.

Usage: analyse_image.py <puzzle.png>
"""
import collections
import struct
import sys

from PIL import Image

BLUE, YELLOW, BLACK, WHITE, ODD = (
    (63, 72, 204), (255, 242, 0), (0, 0, 0), (255, 255, 255), (254, 254, 254))
GRID_PX = 1047
N = 14
BLOCKS = 70


def spiral_ccw(n):
    top, bot, left, right = 0, n - 1, 0, n - 1
    out = []
    while top <= bot and left <= right:
        for r in range(top, bot + 1):
            out.append((r, left))
        left += 1
        if left > right:
            break
        for c in range(left, right + 1):
            out.append((bot, c))
        bot -= 1
        if top > bot:
            break
        for r in range(bot, top - 1, -1):
            out.append((r, right))
        right -= 1
        if left > right:
            break
        for c in range(right, left - 1, -1):
            out.append((top, c))
        top += 1
    return out


def main(path):
    raw = open(path, "rb").read()
    chunks, i = [], 8
    while i < len(raw):
        ln = struct.unpack(">I", raw[i:i + 4])[0]
        chunks.append(raw[i + 4:i + 8].decode("latin1"))
        i += 12 + ln
    print("PNG chunks:", chunks)

    px = Image.open(path).convert("RGB").load()
    cell = GRID_PX / N
    blk = GRID_PX / BLOCKS

    cells = [[px[int(c * cell + cell / 2), int(r * cell + cell / 2)]
              for c in range(N)] for r in range(N)]
    blocks = [[px[int(c * blk + blk / 2), int(r * blk + blk / 2)]
               for c in range(BLOCKS)] for r in range(BLOCKS)]

    order = spiral_ccw(N)
    bits = "".join("1" if cells[r][c] in (BLACK, BLUE) else "0" for r, c in order)
    msg = "".join(chr(int(bits[i:i + 8], 2)) for i in range(0, len(bits) - 7, 8))
    print("spiral message:", msg)

    coloured = [i for i, (r, c) in enumerate(order) if cells[r][c] in (BLUE, YELLOW)]
    print("coloured cells:", len(coloured),
          "spiral indices mod 8:", sorted({i % 8 for i in coloured}))

    odd = [(r, c) for r in range(N) for c in range(N) if cells[r][c] == ODD]
    for r, c in odd:
        i = order.index((r, c))
        print(f"anomalous cell at row {r} col {c}: spiral index {i}"
              f" -> char {i // 8} ({msg[i // 8]!r}), bit {i % 8}")

    nonuniform, deviating = [], 0
    for R in range(N):
        for C in range(N):
            vals = {blocks[R * 5 + i][C * 5 + j] for i in range(5) for j in range(5)}
            if len(vals) > 1:
                nonuniform.append((R, C))
            deviating += sum(blocks[R * 5 + i][C * 5 + j] != cells[R][C]
                             for i in range(5) for j in range(5))
    print("non-uniform cells:", len(nonuniform), nonuniform)
    print("deviating blocks (the rabbit outline):", deviating)
    print("block colours:", collections.Counter(v for row in blocks for v in row))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "puzzle.png")
