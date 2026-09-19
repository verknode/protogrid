import hashlib, itertools, json
obj = open('object256.txt').read().strip()
assert len(obj)==256
M = [obj[i*16:(i+1)*16] for i in range(16)]

# letter->number schemes
A1Z26 = {c: ord(c)-64 for c in map(chr, range(65,91))}
alpha23 = sorted(set(obj))              # 23 letters, missing I J O
rank23 = {c:i+1 for i,c in enumerate(alpha23)}
SQ = "DBIFHCEGAKLMNPQRSTUVWXYZ"  # bifid square keyed DBIFHCEG, I/J merged, no J -> 25 letters
SQ = "DBIFH" "CEGAK" "LMNPQ" "RSTUV" "WXYZ"[:5]
SQ = "DBIFHCEGAKLMNPQRSTUVWXYZ"
# build proper 25-char square
key="DBIFHCEG"
seen=[];
for c in key+"ABCDEFGHIKLMNOPQRSTUVWXYZ":
    if c=='J': continue
    if c not in seen: seen.append(c)
SQUARE=''.join(seen); assert len(SQUARE)==25, SQUARE
pos = {c:i for i,c in enumerate(SQUARE)}
PR=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83]
prime23 = {c:PR[i] for i,c in enumerate(alpha23)}

schemes = {
 'a1z26':   lambda c: A1Z26[c],
 'rank23':  lambda c: rank23[c],
 'sqidx':   lambda c: pos[c],
 'sqrow':   lambda c: pos[c]//5+1,
 'sqcol':   lambda c: pos[c]%5+1,
 'prime23': lambda c: prime23[c],
}
out={}
for name,f in schemes.items():
    rows=[sum(f(c) for c in M[r]) for r in range(16)]
    cols=[sum(f(M[r][c]) for r in range(16)) for c in range(16)]
    out[name]=(rows,cols)
    print(name, 'rowsum', rows)
    print(name, 'colsum', cols)
    print('   total', sum(rows), sum(cols))
json.dump(out, open('matsums.json','w'))
