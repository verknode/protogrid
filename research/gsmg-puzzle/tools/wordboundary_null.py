"""Independent significance check for the 'AND-position letter equals the prime
difference, and the position right after it is a real word start' observation
(section 42), replacing the reader's own 1-in-48 orientation sweep with a
random-pair permutation null over the same certified monologue.
"""
import random

def load_word_starts():
    beau = open('data/beaufort_plain.txt').read().strip()
    readme = open('/home/user/puzzlehunt/gsmgio-5btc-puzzle/README.md').read()
    i = readme.find("YOUR LIFE IS THE SUM")
    j = readme.find("CIAO BELLA O") + len("CIAO BELLA O")
    mono = readme[i:j]
    starts = set(); count = 0; prev_space = True
    for ch in mono:
        if ch.isalpha():
            if prev_space: starts.add(count)
            count += 1; prev_space = False
        else:
            prev_space = True
    return beau, starts

def a1z26(c):
    return ord(c) - 96

def check(beau, word_starts, and_pos, diff):
    if not (0 <= and_pos < len(beau)):
        return False
    return a1z26(beau[and_pos]) == diff and (and_pos + 1) in word_starts

if __name__ == '__main__':
    beau, word_starts = load_word_starts()
    print('real case (AND=452, diff=5):', check(beau, word_starts, 452, 5))

    random.seed(2024)
    N = 200000
    hits = 0
    for _ in range(N):
        a = random.randint(200, 800)
        d = random.randint(1, 26)
        b = a + d if random.random() < 0.5 else a - d
        if b < 0:
            continue
        if check(beau, word_starts, a & b, abs(a - b)):
            hits += 1
    print(f'random-pair null: {hits}/{N} = {hits/N:.2e} (1 in {N/max(hits,1):.0f})')

    hits2 = N2 = 0
    for a in range(200, 800):
        for sign in (1, -1):
            b = a + sign * 5
            if b < 0:
                continue
            N2 += 1
            if check(beau, word_starts, a & b, 5):
                hits2 += 1
    print(f'diff-fixed-at-5 sweep: {hits2}/{N2} = {hits2/N2:.2e} (1 in {N2/max(hits2,1):.0f})')
