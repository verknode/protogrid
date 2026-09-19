#!/usr/bin/env python3
"""Show that seg0's opening spells the Bifid key square's reading order.

seg0 is the 91-letter block that sits immediately before the `matrixsumlist`
marker on the SalPhaseIon page, over the alphabet a-i. No public write-up explains
what it is for.

The keyed square that decrypts the neighbouring 570-letter block is built from
`DBIFHCEG`. Its first nine cells, read left to right and top to bottom, are
`D B I F H / C E G A`, which is exactly seg0's nine-letter alphabet. That ordering
appears as a subsequence of seg0's first seventeen letters, with only filler
letters skipped:

    D B b I b F b H C c b E G b i h A
    ^ ^   ^   ^   ^ ^     ^ ^       ^

Two independent significance tests:

  * against shuffles of seg0's own letters, the ordering never completes that
    early in 200,000 trials;
  * of all 9! orderings of the nine letters, only 18 complete by that index, so an
    externally specified ordering landing in that set has probability about 1 in
    20,000.

Usage: seg0_key.py <seg0.txt>
"""
import itertools
import random
import sys

KEY = "DBIFHCEG"
SQUARE_ORDER = "DBIFHCEGA"          # the square's first nine cells, in reading order
TRIALS = 200000


def completion_index(hay, needle):
    i = 0
    for pos, ch in enumerate(hay):
        if ch == needle[i]:
            i += 1
            if i == len(needle):
                return pos
    return None


def main(path):
    s = open(path).read().strip().upper()
    print("seg0:", s.lower())

    for needle in (KEY, SQUARE_ORDER):
        end = completion_index(s, needle)
        idx, i = [], 0
        for pos, ch in enumerate(s):
            if i < len(needle) and ch == needle[i]:
                idx.append(pos)
                i += 1
        skipped = "".join(s[p] for p in range(end + 1) if p not in set(idx))
        rnd = random.Random(7)
        pool = list(s)
        hits = 0
        for _ in range(TRIALS):
            rnd.shuffle(pool)
            q = completion_index(pool, needle)
            if q is not None and q <= end:
                hits += 1
        print(f"\n{needle}: completes at index {end}")
        print(f"  match indices : {idx}")
        print(f"  letters skipped: {skipped.lower()}")
        print(f"  shuffle p     : {hits / TRIALS:.6f}  ({hits} of {TRIALS})")

    end = completion_index(s, SQUARE_ORDER)
    early = sum(1 for p in itertools.permutations("ABCDEFGHI")
                if (completion_index(s, "".join(p)) or 10 ** 6) <= end)
    total = 362880
    print(f"\norderings of A-I completing by index {end}: {early} of {total}"
          f"  ({early / total:.6%})")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "seg0.txt")
