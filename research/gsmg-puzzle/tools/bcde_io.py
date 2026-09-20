"""The I/O -> AND/OR selector over the paired B/C/D/E even-stream letters.

Reproduces, on the certified data (data/bifid_out.txt), the full chain a reader
proposed: the 29 dropped I/O letters (section 24) paired with the even-position
letter immediately preceding each drop (always in {B,C,D,E}, per section 15's own
mechanical account), read as 2-bit Bifid-square coordinates, combined with AND when
the paired symbol is 'O' and OR when it is 'I'.

Includes the decomposition that shows what the AND/OR framing reduces to, and three
permutation-null variants for the claimed "1234" prefix's rarity.
"""
import collections, random

def load():
    bif = open('data/bifid_out.txt').read().strip()
    dropped_pos = [i for i, c in enumerate(bif) if c in 'IO']
    io_seq = ''.join(bif[p] for p in dropped_pos)
    bcde = ''.join(bif[p - 1] for p in dropped_pos)
    return io_seq, bcde

COORD = {'D': (0, 0), 'B': (0, 1), 'C': (1, 0), 'E': (1, 1)}

def compute(io_seq, bcde):
    bits = []
    for io, ch in zip(io_seq, bcde):
        b0, b1 = COORD[ch]
        bits.append((b0 & b1) if io == 'O' else (b0 | b1))
    return ''.join(str(b) for b in bits)

if __name__ == '__main__':
    io_seq, bcde = load()
    result = compute(io_seq, bcde)
    print('io_seq:', io_seq)
    print('bcde  :', bcde)
    print('result:', result, '=', hex(int(result, 2)))

    print()
    print('bcde letter frequency:', collections.Counter(bcde))
    print("decomposition: at 'O' (AND) positions, bit = (letter == 'E');",
          "at 'I' (OR) positions, bit = (letter != 'D')")

    print()
    N = 300000
    prefix = result[:13]
    io_list, bc_list = list(io_seq), list(bcde)
    for label, shuffle_io, shuffle_bc in (
        ('shuffle both', True, True),
        ('shuffle bcde only (io fixed)', False, True),
        ('shuffle io only (bcde fixed)', True, False),
    ):
        random.seed(hash(label) & 0xffffffff)
        hits = 0
        for _ in range(N):
            if shuffle_io: random.shuffle(io_list)
            if shuffle_bc: random.shuffle(bc_list)
            r = compute(''.join(io_list) if shuffle_io else io_seq,
                        ''.join(bc_list) if shuffle_bc else bcde)
            if r.startswith(prefix):
                hits += 1
        print(f'{label:32}: {hits}/{N} = {hits/N:.2e} (1 in {N/max(hits,1):.0f})')
