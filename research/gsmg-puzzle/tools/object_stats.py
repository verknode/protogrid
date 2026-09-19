#!/usr/bin/env python3
"""Statistical characterisation of the 256-symbol object.

Two results, both re-derived here:

1. Its index of coincidence, 0.0563, falls OUTSIDE both reference distributions
   for 256-character samples: English with i, j, o removed sits at 0.0730 with a
   5th percentile of 0.0652, and uniform random over the 23-letter alphabet sits
   at 0.0435 with a 95th percentile of 0.0455. So the object is neither a raw
   encoding of a random 32-byte key nor a monoalphabetic substitution of English.

2. It is not homogeneous. The symbols at positions congruent to 0 mod 4 form a
   64-symbol stream with an index of coincidence of 0.1047, which no shuffle of
   the object's own letters reached in 20,000 trials; correcting for the whole
   scan of periods 2 to 6 leaves p about 0.0017. The other three quarters are
   statistically indistinguishable from uniform.

Usage: object_stats.py <object256.txt> <english_sample.txt>
"""
import collections
import random
import sys

ALPHA = "ABCDEFGHKLMNPQRSTUVWXYZ"
TRIALS = 20000


def ic(s):
    c = collections.Counter(s)
    n = len(s)
    return sum(v * (v - 1) for v in c.values()) / (n * (n - 1)) if n > 1 else 0.0


def percentiles(vals):
    vals = sorted(vals)
    return vals[len(vals) // 20], sum(vals) / len(vals), vals[19 * len(vals) // 20]


def main(obj_path, eng_path):
    obj = open(obj_path).read().strip()
    eng = "".join(c for c in open(eng_path).read().lower() if c.isalpha() and c not in "ijo")
    rnd = random.Random(1)

    eng_ic = [ic(eng[i:i + 256]) for i in
              (rnd.randrange(0, len(eng) - 256) for _ in range(2000))]
    uni_ic = [ic("".join(rnd.choice(ALPHA) for _ in range(256))) for _ in range(2000)]

    print(f"object256 IC           : {ic(obj):.4f}")
    print("English(-ijo) n=256    : 5th %.4f  mean %.4f  95th %.4f" % percentiles(eng_ic))
    print("uniform-23 n=256       : 5th %.4f  mean %.4f  95th %.4f" % percentiles(uni_ic))

    print("\nperiod scan (IC of each residue stream):")
    for p in range(2, 7):
        print(f"  period {p}: " + "  ".join(f"{ic(obj[i::p]):.4f}" for i in range(p)))

    obs = ic(obj[0::4])
    pool = list(obj)
    hits = worst = 0
    for _ in range(TRIALS):
        rnd.shuffle(pool)
        s = "".join(pool)
        if ic(s[0::4]) >= obs:
            hits += 1
        if max(ic(s[i::p]) for p in range(2, 7) for i in range(p)) >= obs:
            worst += 1
    print(f"\nperiod-4 offset-0 IC   : {obs:.4f}")
    print(f"  p vs shuffles        : {hits / TRIALS:.5f}")
    print(f"  p corrected for scan : {worst / TRIALS:.5f}")


if __name__ == "__main__":
    main(*(sys.argv[1:3] or ["object256.txt", "beaufort_plain.txt"]))
