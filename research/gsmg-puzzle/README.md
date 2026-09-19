# GSMG.IO 5 BTC puzzle — analysis session

Self-contained research notes, data and tooling from one working session on the
[GSMG.IO 5 BTC puzzle](https://github.com/puzzlehunt/gsmgio-5btc-puzzle).
Unrelated to the ProtoGrid product; kept here only so the work survives.

**Outcome: the puzzle was not solved.** What this directory contributes is
independent verification, reproducible tooling, one refuted public claim, two
structural observations absent from the community repositories checked (sections 7
and 8), a close-out of the phase-0 image and its QR code as hiding places (sections
10 and 11), and a statistical case that the object the largest search families
target is not the kind of object they assume (section 13). The strongest single
result is section 16: the 91-letter block nobody had explained is the key to the
cipher next to it.

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

**`seg2` is the Bifid segment** and is solved: see section 8. **`seg0` is the key to it:
see section 16.** The attempts below treat `seg0` as an encoded message, which
section 16 shows is the wrong kind of object; they are kept as a record.

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
| `tools/analyse_image.py` | Grid, block canvas, colour roles, sub-cell channel |
| `tools/verify_qr.py` | QR modules, segments and Reed-Solomon parity |
| `tools/object_stats.py` | Index of coincidence baselines and the period-4 test |
| `tools/seg0_key.py` | Shows seg0 spells the keyed square's reading order |
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

## 8. The even-position stream is a 2-bit channel (mechanical, see section 15)

> **Correction.** This section originally read the four-letter alphabet as a channel
> the creator planted. Section 15 shows it is forced by the cipher: it carries no
> information beyond `seg2`'s own row bits. The measurements below stand; the
> interpretation does not.


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

---

## 10. The phase-0 image, gone over exhaustively

`tools/analyse_image.py` re-derives everything below from `puzzle.png` on each run.
The upstream leads file says what would open the third door is a rule of the
creator's from early 2020 read on a **non-textual object**, and the 2020 poem points
at this image, so it is worth knowing exactly what the image does and does not hold.

**The canvas is finer than the puzzle grid.** Every drawn run is a multiple of 15
pixels, so the real canvas is 70x70 blocks and each of the 14x14 cells is exactly
5x5 blocks. That leaves room for a sub-cell channel, and there is none: exactly 7
cells of 196 are non-uniform, their 50 deviating blocks draw the white rabbit
outline, and every other cell is a perfectly uniform 5x5 block.

**The coloured cells mark the low bit of every byte.** In the reading order that
actually decodes the message, a counter-clockwise spiral from the top-left, the 24
coloured cells sit at spiral indices congruent to 7 mod 8. Issue #111 reports the
same 24 cells as "spiral index 5 mod 8 clockwise"; stated against the decoding
order, they are the least significant bit of each of the 24 characters. Blue is 1
and yellow is 0, so the colours carry nothing the message does not already say.

**The one anomalous cell does not hide a second URL.** Exactly one cell is
RGB (254,254,254) rather than white, at row 7, column 4. Its spiral index is 163,
which is character 20, bit 3. Character 20 is `n`, and flipping that bit gives `~`,
so `gsmg.io/theseedispla~ted` is not a door. Whatever the cell marks, it is not a
one-bit variant of the URL.

**No metadata.** The PNG carries only IHDR, sRGB, gAMA, pHYs, IDAT and IEND. There
is no text, EXIF or trailing-data chunk.

## 11. The QR code is standard, byte for byte

Issue #107 lists QR decoding as an untried next step. `tools/verify_qr.py` settles
it, reading the module matrix straight from the pixels rather than trusting a
library:

| Property | Value |
|---|---|
| Version, EC level, mask | 4, L, 2 |
| Segments | ECI designator 26 (UTF-8), then byte mode, length 73 |
| Payload | `https://www.blockchain.com/btc/address/1GSMG1JC9wtdSwfwApgj2xcmJPAwx7prBe` |
| Padding after terminator | `EC 11 EC`, the standard pad bytes |
| Reed-Solomon parity | recomputed from scratch, matches all 20 codewords |

The ECI header is why a naive re-encode of the same URL differs in roughly a third
of its modules, and why OpenCV warns while decoding. It is not tampering. With
standard padding and matching parity there is no room left in the symbol for hidden
data, so the QR can be closed as a channel.

## 12. Further negatives from this pass

- **Bifid on `seg0`.** The same square that solves the 570-character segment,
  applied to the 91-character one at every plausible period, gives nothing.
- **`seg0` against the 91-letter phrase.** Both are exactly 91 characters, which
  looks like a lead and is not. No positional relation survives: the letter-to-letter
  map conflicts 59 times, and no modular or square-coordinate relation beats chance.
- **Bifid-object substrings as blob passwords.** Upstream tested substrings of the
  Bifid output and its two streams as address-key preimages, not as AES passwords.
  That gap is now closed: 5,424,880 candidates per blob, nothing surviving.

---

## 13. The 256-symbol object is not what the main search families assume

Upstream's largest search families all treat the 256-symbol object as a homogeneous
thing to reduce to a 32-byte key, and roughly 335 million candidates have been spent
that way with no match. Two measurements say why that is unlikely to work.
`tools/object_stats.py` re-derives both.

**It is neither a key encoding nor English.** For 256-character samples the index of
coincidence separates cleanly: English with `i`, `j`, `o` removed sits around 0.075
with a 5th percentile near 0.069, and uniform random over the 23-letter alphabet sits
at 0.0435 with a 95th percentile of 0.0455. The object measures **0.0563**, outside
both. A raw encoding of a random private key would be uniform, and a monoalphabetic
substitution of English would be much peakier. The object is neither.

That is confirmed independently by a calibrated substitution solver, which recovers
real English at this length: a 256-character English passage under a random
substitution is solved back to a readable plaintext at -4.99 per quadgram. The
puzzle's objects reach only:

| Object | Best score per quadgram |
|---|---|
| English control at n=256 | -4.99, readable |
| `object256` | -6.55 |
| the 192 non-quarter symbols | -6.57 |
| `odd285` | -6.80 |
| `bifid570` | -5.84 |

**It is not homogeneous either.** Splitting the object by position, the symbols at
indices congruent to 0 mod 4 form a 64-symbol stream with an index of coincidence of
**0.1047**, while the other three quarters are statistically indistinguishable from
uniform. No shuffle of the object's own letters reached that value in 20,000 trials,
and correcting for the whole scan of periods 2 to 6 leaves p near 0.002 to 0.003.
The test shuffles the object's own letters rather than comparing against uniform, so
the result is about arrangement, not about the overall letter skew.

The quarter is concentrated in the keyed square's rows 2 and 3 and its column 2,
which is to say on `N` and `S`. Against the other three quarters that is a
chi-square of 20.1 on rows and 21.8 on columns, at 4 degrees of freedom where the
1% critical value is 13.3.

The structure appears only after `I` and `O` are removed. In the 285-letter stream
before the reduction there is no period-4 signal at all, so the removal does not
merely filter the stream, it aligns it. That is independent evidence that the
community's reduction step is the intended one.

What the quarter is **not**: readable text. Solved as a substitution it reaches
-4.89, which looks good until it is compared against its own shuffles, which reach
-4.79 to -5.32. At 64 characters with 18 distinct symbols the solver overfits, and
the quarter sits inside its own null.

## 14. Rejected this pass

- **BIP39.** The Bifid output opens with the literal word `BTCSEED`, so the 2-bit
  channel was swept for mnemonics: every symbol-aligned 264-bit window over all 24
  letter-value assignments and both bit directions. 47 windows pass the 8-bit
  checksum, which is what chance predicts. None matches a target address, as raw
  entropy or through `m/44'/0'/0'/0/0`, `m/0` or `m/0'/0'/0'`.
- **One bit per symbol.** Taking a single bit from each of the 256 even-channel
  symbols gives exactly 256 bits, which is the natural shape of a 32-byte key. All
  14 non-constant letter-to-bit maps, crossed with seven reading orders over a 16x16
  arrangement and both directions, are negative.
- **Base-23 numbers.** The quarter, the remaining 192 symbols and the whole object,
  read as base-23 integers under four alphabet orderings and both directions, taken
  modulo the curve order and as high and low 256-bit slices: negative.

---

## 15. What the Bifid step actually does, and a correction

Writing the decryption out coordinate by coordinate explains the stream split
completely, and corrects section 8.

With period equal to the full length, plaintext letter `i` takes its row from
position `i` of the flattened coordinate sequence and its column from position
`n + i`. Working that through gives, for every `j`, exactly:

```
even[j] = square[ row(ct[j]) ][ row(ct[285+j]) ]
odd [j] = square[ col(ct[j]) ][ col(ct[285+j]) ]
```

Both hold for all 285 positions, checked directly. So the Bifid step is not adding
anything: it splits `seg2` into its **row bits** and its **column values**, pairing
each position with the one 285 later.

The consequence is that **the four-letter even stream is forced, not planted.**
Every ciphertext letter is one of `A`–`I`, and in the keyed square those nine
letters occupy only rows 0 and 1. So both coordinates of an even-position letter
are bits, and the letter must be one of the four in the top-left corner. Section 8
read this as a deliberate 2-bit channel. It is a mechanical consequence of the
ciphertext alphabet, and the bits it carries are just `seg2`'s own row bits
reordered.

That also means the 256-symbol object is a repackaging of `seg2`'s **column**
coordinates, so searching the object is searching `seg2`'s columns in a different
costume.

### The period-4 result, on a much stronger null

Section 13 tested the period-4 anomaly against shuffles of the object's own letters.
The better null runs the **whole pipeline** on shuffled `seg2`: Bifid, parity split,
`I`/`O` removal. That matters, because removing symbols by value can induce
structure by itself.

It survives. Under 4,000 pipeline runs on shuffled `seg2`, the period-4 offset-0
stream has mean index of coincidence 0.055; the real value is 0.1047, a z-score of
6.49. Correcting across the **whole family actually examined**, 4 objects crossed
with periods 2 to 6, which is 80 streams, by a max-T permutation procedure:

| Quantity | Value |
|---|---|
| Strongest stream | `object256`, period 4, offset 0 |
| Observed max z | 6.49 |
| Null 95th / 99th percentile | 4.83 / 6.20 |
| **Family-wise p** | **0.0073** |

So the honest figure is about 0.007, not the 0.002 that section 13 quotes from the
weaker null. Solid, but one finding at p 0.007 after a wide search.

### Where it does not come from

- **`seg2` itself has no periodic structure.** Its letters, row bits and column
  values all scan clean over periods 2 to 12, with scan-corrected p values of 0.63,
  0.59 and 0.82.
- **The two halves of `seg2` are independent.** The pairing is `j` with `j+285`, so
  an association there would explain everything. There is none: chi-square 57.0 on
  64 degrees of freedom, permutation p 0.735. Other lags look the same.
- **The object landing on exactly 256 is only mildly suggestive.** Over 3,000
  shuffles of `seg2` the reduced length ranges from 232 to 267 with mean 251, and
  hits exactly 256 in 4.9% of runs, against 8.3% for the mode. The case for 256
  being designed rests on it being a round number over a Base58-safe alphabet, not
  on it being improbable.

### Also negative

The row bits and the column values, taken in `seg2`'s **natural** order rather than
the interleaved order the Bifid step produces, are a new pair of objects and were
not previously tested. The 570 row bits give no ASCII, and 1,100 candidate keys drawn
from both, as 256-bit windows in both directions, whole values modulo the curve
order, inverted, hashed, and as base-5 windows, match no target address.

---

## 16. `seg0` is the key to `seg2`

This is the strongest result in this directory, and it answers a question no public
write-up addresses: what the 91-letter block is for.

`seg0` sits immediately before the `matrixsumlist` marker on the SalPhaseIon page,
over the alphabet `a`–`i`. Section 5 left it open. The keyed square that decrypts the
neighbouring 570-letter block is built from `DBIFHCEG`, and its first nine cells in
reading order are `D B I F H / C E G A`, which is **exactly `seg0`'s nine-letter
alphabet**. That ordering is spelled out by `seg0`'s opening, with filler letters
in between:

```
D B b I b F b H C c b E G b i h A
^ ^   ^   ^   ^ ^     ^ ^       ^
```

The eight-letter key alone completes at index 12, skipping `b b b c b`. The full
nine-cell order completes at index 16, skipping `b b b c b b i h`. Read row by row,
the first eight letters carry the square's whole top row, `D B I F H`, in column
order with `b` as the only filler.

`tools/seg0_key.py` reproduces it and runs both significance tests.

| Test | Result |
|---|---|
| `DBIFHCEG` completes at index | 12 |
| `DBIFHCEGA` completes at index | 16 |
| Shuffle p for `DBIFHCEG` (200,000 shuffles of seg0's own letters) | 0.000005 |
| Shuffle p for `DBIFHCEGA` | 0 of 200,000 |
| Orderings of `A`–`I` completing by index 16 | 18 of 362,880, or 0.005% |

The second test is the one that matters, because it removes the worry that the
result is an artefact of seg0 simply opening with a run of row-0 letters. Of every
possible ordering of the nine letters, only 18 complete that early. The square's
order was fixed independently, by whoever first decrypted the 570-letter block, so
its landing in that set of 18 is a one-in-twenty-thousand event.

Two consequences:

1. **`seg0` is key material, not a separate payload.** The page publishes the cipher
   key beside the ciphertext it unlocks. Every attempt in section 5 to read `seg0`
   as an encoded message was aimed at the wrong kind of object.
2. **The community's `DBIFHCEG` is corroborated by the page itself.** Until now that
   key rested on the decryption working. The page independently spells it.

The effect is confined to the opening. The remaining 74 letters show nothing
comparable: their earliest-completing ordering needs 36 more letters, and nothing
recognisable appears among the leaders. Whether the filler letters carry anything of
their own is open.

---

## 17. Correcting the period-4 significance, and a refuted idea

### The period-4 result is marginal, not established

Section 15 quotes family-wise p 0.0073 for the period-4 anomaly, computed over 4
objects crossed with periods 2 to 6, which is 80 streams. Widening the family to
periods 2 to 12, which is 308 streams and is no less defensible a choice, moves it:

| Family | Streams | Family-wise p |
|---|---|---|
| Periods 2 to 6 | 80 | 0.0073 |
| Periods 2 to 12 | 308 | 0.0495 |

The effect itself is unchanged: `object256` positions congruent to 0 mod 4 have an
index of coincidence of 0.1047 against a pipeline-null mean of 0.055, a z of 6.4.
What moves is the correction, and it moves by a factor of seven on a choice that was
never pre-registered. The nested streams at periods 8 and 12 offset 0 are the same
effect seen again, not independent support.

**Treat the period-4 structure as suggestive at best.** There is no mechanism behind
it: `seg2` is aperiodic, its halves are independent, and nothing in the pipeline
predicts a period. A single marginal statistic after a wide search is what a fluke
looks like. This is the honest reading, and it supersedes the figure in sections 13
and 15.

By contrast the `seg0` result in section 16 does not have this weakness. Its target
was fixed externally, by whoever first decrypted the 570-letter block, and the test
counts how many of all 362,880 orderings do as well. Nothing there depends on which
family of tests is drawn.

### Refuted: the even stream as a Base58 case bit

An attractive idea, because it would explain two things at once. The object's
23-letter alphabet is Base58-valid but all uppercase, and upstream rejects the
literal Base58 reading on exactly that ground: an all-uppercase Base58 string is
astronomically unlikely to be an encoding of 32 bytes. Meanwhile the even stream
supplies two spare bits at every position. If one of them were the case bit, the
object would become a mixed-case Base58 string and the objection would vanish.

It fails on a single clean test. Lowercase `l` is not a Base58 character, so a
correct case rule must leave every `L` uppercase. The object has 18 of them, and:

- all six rules derived from the even symbol's coordinates (row, column, their XOR,
  each in both polarities) lowercase between 5 and 13 of the 18;
- none of the 15 non-empty subsets of `{D, B, C, E}` avoids lowercasing an `L`;
- the `L` positions pair with all four even symbols, at 9, 4, 3 and 2.

So the even stream cannot be a case bit. Separately, 13,080 windows of the cased
strings of lengths 51, 52, 34, 33 and 25, in both directions, were tested as
Base58Check payloads; the four-byte checksum passed on none.

---

## 18. Further dead ends

Kept so nobody spends the time again.

**Seven intertwined passwords.** The Beaufort text says the answer requires selecting
"from over twenty three ciphers, sixteen encryptions and or seven intertwined
passwords", and the SalPhaseIon page decodes to exactly seven English runs:
`matrixsumlist`, `lastwordsbeforearchichoice`, `thispassword`, `shabef`,
`ourfirsthintisyourlastcommand`, `enter`, `anstoo`. Earlier sweeps only covered
concatenations of up to four tokens. Every ordering of every subset up to all seven
was tested, both concatenated and **interleaved** character by character, which is
the reading "intertwined" invites: 38,620 candidates under four password
derivations against both blobs. Every padding survivor fails printability.

**The salts are not derived.** In OpenSSL the salt is random, but a puzzle author
could choose it, and nobody appears to have checked. The test runs on the *solved*
phase 3.2 blob, where the password is known: its salt `eefc4c5befc1656a` appears
nowhere in the MD5, SHA-1, SHA-256 or SHA-512 digest of its own password, in either
raw or hex form. So the salts carry nothing, and the same applies to the two open
blobs.

**The page titles are not anagrams.** `SalPhaseIon` and `Cosmic Duality` are the only
page content not otherwise analysed. An exact anagram search over a 40,000-word list
splits `salphaseion` 14,400 ways and `cosmicduality` 1,602 ways. At that density the
space cannot carry signal, so any "meaningful" split is selection, not discovery. The
name is far more likely a plain pun on salt, phase and ion, which matches the
`Salted__` header the page's blob carries.

**The `seg0` subsequence scheme does not repeat in `seg2`.** This is the control for
section 16, and it comes out the right way. The square's reading order completes in
`seg2` only at index 76, with shuffle p 0.44, ranking 176,571st of the 362,880
orderings. The encoding is specific to the block that carries the key, exactly as it
should be if `seg0` is key material and `seg2` is ciphertext.
