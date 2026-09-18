# GSMG.IO 5 BTC puzzle — analysis session

Self-contained research notes, data and tooling from one working session on the
[GSMG.IO 5 BTC puzzle](https://github.com/puzzlehunt/gsmgio-5btc-puzzle).
Unrelated to the ProtoGrid product; kept here only so the work survives.

**Outcome: the puzzle was not solved.** What this directory contributes is
independent verification, reproducible tooling, one refuted public claim, and two
structural observations that do not appear in the two community repositories
checked (sections 7 and 8).

The most complete public research is
[floflo777/open-crypto-puzzles](https://github.com/floflo777/open-crypto-puzzles/tree/main/1-big-prizes/gsmg-io-5btc-puzzle),
which maintains a tested-and-negative log and a ranked list of open leads. Read it
before repeating anything here.

---

## 1. Key derivation, pinned down

Every AES stage uses `openssl enc -aes-256-cbc -a` with `EVP_BytesToKey` over
**SHA-256**, one iteration — not the MD5 default that older write-ups assume.
Verified against the already-solved phase 3.2 blob:

```
openssl enc -aes-256-cbc -d -a -in data/phase32.b64 -md sha256 \
  -pass pass:250f37726d6862939f723edc4f993fde9d33c6004aab4f2203d9ee489d61ce4c
```

MD5, SHA-1 and SHA-512 all produce garbage on the same input. This matters:
a brute-force run using the wrong digest silently tests nothing.

## 2. The Beaufort block, recovered from scratch

`tools/decode_beaufort.py` reconstructs the 1539-character block inside the
phase 3.2 plaintext without being given the substitution table. The block is a
26-symbol alphabet over EBCDIC-range bytes; the Beaufort key is `THEMATRIXHASYOU`.

Method: treat the opening as a crib. The Architect line *"your life is the sum of
a remainder of an unbalanced equation..."* stays self-consistent for 78
characters, while every other candidate opening tested collapses within 1–3
characters. Those 78 characters fix 23 of the 26 symbols; the last 3 fall out of
a six-way search scored on English.

Output is in `data/beaufort_plain.txt` and reproduces byte-for-byte. The text
ends with operational hints that constrain any brute-force effort:

> ...after which you will be required to select from over twenty three ciphers
> sixteen encryptions and or seven intertwined passwords to find the actual
> private key note that also brute forcing might be required...

This decryption is already known to the community; treat it as confirmation,
not discovery.

## 3. Refuted: the "master XOR key" of issue #69

[Issue #69](https://github.com/puzzlehunt/gsmgio-5btc-puzzle/issues/69) claims a
master key `818af53d...d76bb402`, built as the XOR of `sha256()` over seven
tokens.

Two findings:

1. **The value reproduces exactly**, so the construction is stated correctly.
2. **The construction is vacuous.** `matrixsumlist` appears twice in the token
   list, and XOR is self-inverse, so it cancels. The "seven-token" key is really
   a five-token key.

The key does **not** decrypt either open blob, under any tested reading
(raw hex string, `sha256()` of the hex string, raw 32 bytes), with SHA-256 or
MD5 derivation. Both fail with `bad decrypt` on padding.

## 4. Search space actually eliminated

Two blobs remain open, both 96 bytes — `Salted__` + 8-byte salt + 80 bytes of
ciphertext:

| Blob | Salt | Source |
|---|---|---|
| SalPhaseIon | `3ab585348552415d` | `data/salphaseion.b64` |
| Phase 3.2.2 | `b45a5e3d827593ca` | `data/phase322.b64` |

Testing is cheap: only the final ciphertext block needs decrypting to check
PKCS#7 padding, so one AES block operation rejects ~99.6% of candidates.
Survivors get a full decrypt and a printability test.

Ruled out against both blobs, nothing surviving:

- **22,056,216 candidates each** — every substring up to 250 characters of the
  Beaufort plaintext, the phase 3.2 ASCII text, and all ordered concatenations
  of the ten core puzzle tokens, under four password derivations
  (`tools/crack2.c`, corpus in `data/corpus.txt`).
- **3,145,725 candidates each** — all XOR subsets of `sha256()` over 20 puzzle
  tokens, as hex, hashed hex, and raw bytes (`tools/crack3.c`).

All padding survivors failed the printability filter, which is the expected
false-positive rate for random plaintext and not evidence of a near miss.

## 5. The two `a`–`i` blocks need different treatment

SalPhaseIon carries two letter blocks over the alphabet `a`–`i`: `data/seg0.txt`
at 91 characters and `data/seg2.txt` at 570. Neither yields to the method that
solves the neighbouring blocks, where `seg4` and `seg6` map `a`–`i`,`o` to 1–9,0,
read as a decimal integer, convert to hex and read as ASCII, giving
`lastwordsbeforearchichoice` and `thispassword`. The total absence of a zero digit
across all 661 characters rules that big-integer reading out on its own.

**`seg2` is the Bifid segment** and is solved: see section 8. `seg0` is still open.

Tried and rejected on `seg0`: base-9 and bijective base-9 integers, digit pairs and
triples in base 9 and base 10 across all offsets, cumulative sums mod 26, a
dictionary-scored a1z26 parse, and — following the embedded `matrixsumlist` label
literally — row and column sums for every factorisation, under both `a=0` and `a=1`.

The statistics say the two blocks are different objects. `seg0` has an index of
coincidence of 0.151 against 0.111 for uniform, so it looks like a per-character
encoding of structured data. `seg2` sits at 0.118, near uniform, which is what
Bifid ciphertext looks like and is consistent with section 8.

One structural check worth having: the page's 1075 single-character tokens are fully
accounted for by this transcription, at 91 + 104 + 570 + 3 separators + 63 + 29 + 35,
then 128 base64 characters with a 40-character run between them, then 12. Nothing on
the page is unread.

## 6. Tools

| File | Purpose |
|---|---|
| `tools/decode_beaufort.py` | Recovers the Beaufort block from the crib |
| `tools/decode_vic.py` | Straddling checkerboard over the 149 digits |
| `tools/bifid_step.py` | Bifid step, stream split, dropped letters, 2-bit channel |
| `tools/btc.py` | secp256k1 and P2PKH address oracle |
| `tools/crack.c` | Tests candidate phrases from stdin |
| `tools/crack2.c` | Enumerates all substrings of a corpus |
| `tools/crack3.c` | Enumerates XOR subsets of token hashes |

Build: `gcc -O3 -march=native -o crack2 crack2.c -lcrypto`.
Throughput is roughly 750k candidates per second per core.

Each tool self-validates against the solved phase 3.2 blob before use; a run
that cannot rediscover `jacquefrescogiveitjustonesecondheisenbergsuncertaintyprinciple`
is misconfigured.

---

## 7. Lead 6 executed: the 29 dropped letters are a binary string

The upstream leads file lists this as never done, cost "minutes": the reduction
from the 285-letter stream to the 256-symbol object drops 29 letters, and nobody
had read them as an object in their own right.

They are **exclusively `I` and `O`**, in extraction order:

```
OOIIOOOIIOOIOIIOIOOOOIOIIOIOI
```

That is a 29-bit binary string, not a discard. The two readings give:

| Mapping | Integer | Hex |
|---|---|---|
| `I`=1, `O`=0 | 103993525 | `632d0b5` |
| `O`=1, `I`=0 | 432877386 | `19cd2f4a` |

`I` and `O` are removed precisely because they are the Base58-ambiguous letters,
and they are also the two letters that read as `1` and `0`. Whether that is design
or coincidence is open, but the object is binary, and 29 bits is too short to be a
key on its own. Their positions are in `data/dropped29.txt` and printed by
`tools/bifid_step.py`.

## 8. The even-position stream is a 2-bit channel

`tools/bifid_step.py` reproduces the Bifid step from scratch: a 5x5 square keyed
`DBIFHCEG`, period equal to the full 570 characters, output starting `BTCSEED`.
The segment's alphabet is only `A`–`I` because the key places exactly those nine
letters in the square's first two rows.

Splitting the output by parity is known. What does not appear upstream is what the
even half is made of. Its alphabet is **exactly four letters, `{B, C, D, E}`**, and
in the keyed square those four are precisely the top-left 2x2 corner:

```
D B I F H        D = (0,0)    B = (0,1)
C E G A K        C = (1,0)    E = (1,1)
...
```

So every even-position symbol is a coordinate pair with both coordinates in
`{0, 1}`. The even stream is a clean 2 bits per symbol channel, and the square
itself supplies the mapping. Upstream tests the even stream as *text*, hashing its
substrings; it is not read as base 4 anywhere in the tested log.

Removing the same 29 positions the odd stream drops leaves **exactly 256 symbols,
or 512 bits** — the right shape for the two keys that "the private keys belong to
half and better half" announces.

That shape is suggestive but unconfirmed. The channel is high entropy, with an
index of coincidence of 0.2537 against 0.25 for uniform, so it is not text, and it
does not decode to ASCII under any of the 24 letter-to-value assignments crossed
with both bit directions and all eight bit offsets.

## 9. What was tested against the new objects, all negative

A Bitcoin oracle (`tools/btc.py`, pure-Python secp256k1) was certified end to end
before use: it re-derives two planted addresses from their published preimages,
`sha256("causality")` and the phase 3.2 passphrase.

Tested against the prize address, the halving address and the unmessaged third-door
address, nothing matching:

- 1,584 candidate private keys from the 512-bit channel, over all 24 letter-value
  assignments, both bit directions, both halves, their XOR, sum and difference, the
  whole value modulo the curve order, and each candidate's double, half and
  plus-or-minus-one neighbours.
- Hashes of the 256-symbol object, the even stream, the odd stream, the full Bifid
  output and the 29-bit object, in four casing and reversal forms.

Also checked and absent: any exact `2x`, `x/2` or off-by-one relation *between* the
two 256-bit halves. Had the channel really been a key and its double, that relation
would hold identically, so its absence is evidence against the simplest reading of
"half and better half".

A further 6.0M AES password candidates were eliminated on both blobs using a corpus
extended with the straddling-checkerboard plaintext, which
`tools/decode_vic.py` reproduces from the 149 digits:

> IN CASE YOU MANAGE TO CRACK THIS THE PRIVATE KEYS BELONG TO HALF AND BETTER HALF
> AND THEY ALSO NEED FUNDS TO LIVE
