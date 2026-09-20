"""'Seven intertwined passwords' -- character-by-character interleaving of the
phase-3 answer's seven parts, under all 5040 orderings, rather than the
straight concatenation that produces the 227-char answer.

Also interleaves the seven planted-address stage preimages as a second,
distinct reading of "seven".
"""
import itertools, hashlib, sys

PARTS3 = [
    "causality", "Safenet", "Luna", "HSM", "11110",
    "0x736B6E616220726F662074756F6C69616220646E6F63657320666F206B6E697262206E6F20726F6C6C65636E61684320393030322F6E614A2F33302073656D695420656854",
    "B5KR/1r5B/2R5/2b1p1p1/2P1k1P1/1p2P2p/1P2P2P/3N1N2 b - - 0 1",
]
STAGES7 = [
    "theflowerblossomsthroughwhatseemstobeaconcretesurface",
    "causality",
    "jacquefrescogiveitjustonesecondheisenbergsuncertaintyprinciple",
    "gsmg.io/theseedisplanted",
    "1GSMG1JC9wtdSwfwApgj2xcmJPAwx7prBe",
    "matrixsumlist",
    "yinyang",
]

def roundrobin(parts):
    """character-by-character interleave, cycling through parts, skipping
    exhausted ones, stopping when all are exhausted."""
    iters = [iter(p) for p in parts]
    out = []
    active = list(range(len(iters)))
    while active:
        nxt = []
        for i in active:
            try:
                out.append(next(iters[i]))
                nxt.append(i)
            except StopIteration:
                pass
        active = nxt
    return ''.join(out)

def gen(parts, tag):
    seen = set()
    for perm in itertools.permutations(range(len(parts))):
        ordered = [parts[i] for i in perm]
        s = roundrobin(ordered)
        if s not in seen:
            seen.add(s)
            yield s
    sys.stderr.write(f"{tag}: {len(seen)} distinct interleavings\n")

if __name__ == "__main__":
    for s in gen(PARTS3, "phase3-parts"):
        print(s)
    for s in gen(STAGES7, "stage-answers"):
        print(s)
