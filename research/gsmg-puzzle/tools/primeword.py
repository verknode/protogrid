"""The prime-A1Z26 word filter on the Architect's closing line, and the index-479 check.

Claims tested (a reader's chain, 2026):
  - the last 9 / 15 words, keeping only words whose A1Z26 letter-sum is prime,
    spell "YOU DO IT" / "AND YOU DO IT";
  - index 479 of the Beaufort monologue begins "privatekeyyouveearnedit";
  - "yellow primes = 479, blue = 484" -- NOT reproduced here.
"""
import os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','data')
def a1z26(w): return sum(ord(c)-64 for c in w.upper())
def isp(n): return n>=2 and all(n%i for i in range(2,int(n**.5)+1))

for label, line in [("last 9",  "IS NOTHING THAT YOU CAN DO TO STOP IT"),
                    ("last 15", "IS GOING TO DIE AND THERE IS NOTHING THAT YOU CAN DO TO STOP IT")]:
    keep=[w for w in line.split() if isp(a1z26(w))]
    print(f"{label:8}: {' '.join(keep)}")

beau=open(os.path.join(D,'beaufort_plain.txt')).read().strip()
i=beau.find("privatekeyyouveearnedit")
print(f"index of 'privatekeyyouveearnedit' in the monologue: {i}  (prime: {isp(i)})")
