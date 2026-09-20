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

Every AES stage **of the solved chain** uses `openssl enc -aes-256-cbc -a` with
`EVP_BytesToKey` over **SHA-256**, one iteration — not the MD5 default that older
write-ups assume. (Correction: upstream reports the large "Cosmic Duality" blob is
the exception and needs MD5, so neither digest can be assumed for an unopened blob.
Both are tried here.)
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
| `tools/oracle.py` | PKCS#7 padding filter and full decrypt for both 80-byte locks |
| `tools/brain.c` | Candidate to private key to P2PKH, against the planted addresses |
| `tools/matsum.py` | Row and column sums of the 16x16 object |
| `tools/gen_yinyang.py` | Matrix sums as text indices, first pass |
| `tools/wide.py`, `tools/wide2.py` | The same route at full breadth (section 23) |
| `tools/drop29.py` | Every reading of the 29 dropped letters (section 24) |
| `tools/gen_family.py`, `tools/gen_family2.py` | Yellow/Blue, primes, zeroed out (section 25) |
| `tools/lastwords.py` | Suffixes of both Architect texts, with reversal (section 27) |
| `tools/windows.py` | All word windows in exact published casing (section 27) |
| `tools/issue108.py` | Reproduces and refutes the community's small-blob decrypt (section 28) |
| `tools/yinyang29.py` | The 9/15 rows, the 29-char phrase and the 29-bit mask (section 29) |
| `tools/table.c` | Brute-forces the phase-2 variable table's four unknowns (section 30) |
| `tools/cosmic.py` | The recovered Cosmic Duality blob, its decrypt and the control (section 31) |
| `tools/ccrack.c` | Password search on a long blob via the printable-first-block filter (section 32) |

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

---

## 19. Images, the phase-2 blob, and an unused clue

**Every puzzle image is clean.** The four PNGs and the Decentraland photo were
scanned for metadata chunks, data appended after `IEND`, and the near-duplicate
colour trick that `puzzle.png` uses. None carries any: the only chunks present are
`IHDR`, `sRGB`, `gAMA`, `pHYs`, `IDAT` and `IEND`, nothing follows `IEND`, and the
only rare near-duplicate colours are anti-aliasing at counts of one to three. The
image on the final page is a browser screenshot of that page, showing the two
titles, the token grid and the large blob. It hides nothing of its own.

**The phase-2 blob, recovered and independently decrypted.** Upstream's
`tools/oracle.py` embeds it as a certification vector; it is not in the community
README, which publishes only the decrypted text. Decrypting it here with
`sha256("causality")` reproduces that text exactly, so the transcription everyone
works from is now verified against the ciphertext rather than trusted. Stored as
`data/phase2.b64` and `data/phase2.txt`.

Its substrings were then swept as blob passwords. Upstream covered the puzzle texts
as *word windows*; this is the character-level pass, which also reaches the
whitespace-stripped concatenations the creator's answers are always built from.
2,330,568 candidates per blob over the phase 2 and phase 3 plaintexts in raw,
lowercased and alphanumeric-only forms. Nothing survives.

**An unused clue, worth flagging.** The phase 2 plaintext contains a line the
community never consumed:

```
# X 2 S H 4 Y 0 Q B 15 #
Q -> extend the name of a hackers' swordless fish, the I and W are below.
B -> ((BV80605001911AP)- (sqrt(-1)))^2
H -> (Answer to only this puzzle but nothing else) * -1
S -> cha' + (vagh * jav)
```

Two of the four are settled: `S` is Klingon arithmetic, `cha'` + `vagh` × `jav`
= 2 + 5 × 6 = 32, and `B` is an Intel i5 part number, so (5i − i)² = −16. `X`, `Y`,
`H` and `Q` are open. Phase 3 was solved by the seven-part route instead, so this
line was never needed and never resolved.

That is unusual. In a puzzle whose final answer is missing, an explicitly posed
sub-riddle that no stage ever consumed is a candidate for where the missing answer
comes from. It is recorded here as an open question, not a result: nothing tested
so far connects it to either blob.

---

## 20. The author's tool, and its whole menu swept

Upstream's lead 4 says an authenticated statement from the author claims the same
software built every phase, and that the cipher conventions point at one specific
public tool whose Bifid uses a period equal to the full message length and whose
cipher list is short. The tool is not named there. This section identifies a
candidate and then spends it.

**`secretpy` matches.** Its Bifid defaults to a period of the full message length,
its default alphabet merges `i`/`j`, which is exactly the square the puzzle uses, and
its menu of 35 ciphers contains every cipher the puzzle is confirmed to use: Bifid,
Beaufort and Vic, the straddling checkerboard. Decrypting the 570-letter segment with
`secretpy` under the recovered square reproduces our own output **byte for byte**,
including the `btcseed` opening.

That is corroboration, not proof: a period defaulting to full length is a convention
several implementations share. But it is the first public name attached to that lead,
and if it is right the remaining cipher space is these 35, not the space of all
published ciphers.

**So the menu was spent.** Every cipher in it was applied to every unsolved object,
under both the standard English square and the puzzle's own recovered square:

| Axis | Values |
|---|---|
| Ciphers | 33 instantiable of the 35 |
| Objects | `object256`, `odd285`, `even285`, `bifid570`, `seg0`, `seg0` remainder, `seg2` |
| Keys | 18 puzzle words, the integers 0 to 25, and no key |
| Alphabets | English square, recovered `DBIFHCEG` square |

Scored with the quadgram model that recovers real English at -5.0 to -6.0 per
quadgram and puts random text near -8.7, **nothing reached -6.2**. Not one
combination produces anything language-like.

Two readings, and the second is the useful one. Either the tool identification is
wrong, or the next step is not "another cipher from the menu applied to these objects
with a puzzle word as the key". Given the Bifid match, the second is more likely, and
it argues that what is missing is an input nobody has yet, rather than a
transformation nobody has yet tried.

## 21. The phase-2 riddle line, bounded and spent

Section 19 flagged the unconsumed line `# X 2 S H 4 Y 0 Q B 15 #`. It was then
parameterised and swept: `S` fixed at 32 and `B` at ±16, `H` at ±42, `Q` over the
fish-cipher readings and their block sizes, and `X` and `Y` over 0 to 50 plus a few
symbolic values, concatenated in the line's own order. With the literal forms of the
line itself that is 146,074 candidates, tested under four password derivations
against both blobs.

Padding survivors came in at 550 to 600 per run, which is the 1-in-256 rate chance
predicts, and not one exceeded 60 printable characters of 78. The line is spent under
this parameterisation. It stays interesting only because `X`, `Y`, `H` and `Q` are
still genuinely unresolved, not because any reading of them has been made to work.

---

## 22. A verified correction to the community README

The creator left a checksum on chain. One of the planted addresses carries the
`OP_RETURN` message **"GSMG.io: You are here because 227 chars were correct"**, and
its private key is the SHA-256 of the phase 3 answer. So the answer is exactly 227
characters and can be checked byte-for-byte offline.

Reconstructing it from the community README's parts list gives **229**. The error is
in part 6. The README states it twice and the two copies disagree:

| Where | Length | Decodes to |
|---|---|---|
| Parts list, "6part is 0x736B616E6162…" | 140 | `skanab rof tuoliab…` |
| Its own quote of line 1616 of `main.cpp` | 138 | `sknab rof tuoliab…` |

The parts-list copy carries an extra `61`, turning the reversed `banks` into
`skanab`. The line-1616 quote is correct and equals the byte-reversed genesis
coinbase exactly.

With the correct hex, everything lines up at once:

- the answer is **exactly 227 characters**, matching the on-chain checksum;
- its SHA-256 is `1a57c572…2ec30d5`, the phase 3 password the README itself states;
- it re-derives the planted address `1M5ypvDbp124ZtKPbg3GJg1JqNs1x7TPoN` exactly.

Anyone rebuilding the answer from the parts list gets a 229-character string and a
hash that is wrong in every bit. The correct string is in `data/ans227.txt` and
`tools/verify_stages.py` rebuilds and checks it.

**The whole pipeline is now certified against the creator's own oracle.** All eight
planted addresses with published preimages re-derive: the flower sentence, causality,
the 227-character answer, the phase 3.2 passphrase, the 149 digits, the hashed prize
address, and the image URL in raw and bit-reversed form. The ninth, funded
2020-04-07 with no message, remains without a preimage.

**Negative, as usual.** The verified answer, its lowercase and reversed forms, its
digest, and every substring of all of them: 537,856 candidates per blob, nothing
surviving. The typo'd variant was swept alongside it for completeness.

## 23. The matrix-sum / yin-yang indexing route, and a sum that does not reproduce

A reader proposed a chain worth testing end to end: Yellow carries the number 9 and
Blue carries 15, those are the alphabet positions of `I` and `O`, `I` and `O` are the
two letters removed to reach the 256-symbol object, exactly 29 letters are removed and
29 is prime, 256 is 16x16, so take the 16 row sums and 16 column sums of that matrix
and use the resulting 32 numbers not as a key directly but as *indices into the
Architect's text*, split into two YIN and YANG halves.

Three parts of that chain check out against the extraction certified in section 4
(the one whose counter-clockwise spiral reads `gsmg.io/theseedisplanted`):

- Yellow = 9 = `I` and Blue = 15 = `O`, and `I`/`O` are exactly the dropped pair;
- exactly 29 letters are dropped, all of them `I` or `O`, and 29 is prime;
- the object's alphabet is 23 letters, missing `I`, `J` and `O`.

One part does not. The proposal reports the 14x14 grid's row sums as
`6 10 8 7 6 6 5 4 9 9 7 8 7 9` and its column sums as
`8 10 8 10 8 7 3 6 7 5 9 6 6 8`, both totalling 101, and reads that prime as
confirmation. On `data/grid_sym.txt` the sums are

```
rows: 6 10 8 7 6 6 5 5 9 9 7 8 7 9    total 102
cols: 8 10 8 10 8 7 4 6 7 5 9 6 6 8   total 102
```

The two lists differ from the proposal in exactly one place each — row 7 (5 against 4)
and column 6 (4 against 3) — which is one single cell, at row 7 column 6. That cell is
`K` (black, 1) in the certified grid; row 7 reads `BKKWwWKWWWKWYW`. Setting it to 0 is
what produces 101. **102 is not prime**, so on this extraction the primality
observation does not hold. Worth noting: row 7 is also the row holding the
RGB(254,254,254) near-white cell at column 4 (section 6), so it is a plausible place
for two transcriptions to diverge — but a divergence is what it is, not a signal.

### The indexing route itself, run out

The step the proposal called unexhausted was run at breadth. Row and column sums of
the 16x16 object were computed under twelve letter-to-number schemes (A1Z26 in both
origins, 23-letter rank in both origins, Bifid-square reading index, square row and
column coordinates, the two-digit row/column pair, the first 23 primes, raw ASCII, and
reversed rank), over six matrix layouts (row-major, column-major, boustrophedon,
spiral, and the two reversed readings). The 32 resulting numbers were used as indices
into eighteen texts — the recovered Beaufort monologue in three casings and reversed,
the phase 3.2 prose with and without punctuation, the film's Architect lines, the
227-character answer, the Bifid output, `seg0`, the object itself, the monologue's
first and last 256 letters, and the 256 letters starting at the Architect's offer of
the key, which is the closest thing in the puzzle to "the last words before the
choice" — under six index conventions (0- and 1-based, mod 26, cumulative, digit-sum,
sorted, reversed), and at both character and word granularity. Each pair of halves was
combined twelve ways (yin, yang, both concatenations, both with one half reversed, two
interleavings, two joined forms, XOR and modular addition of the halves) and each
result hashed six to eight ways.

**834,624 password candidates against both 80-byte locks, under both the SHA-256 and
the MD5 key derivation.** The PKCS#7 filter accepted 3,075 of them, which is 0.368% —
the false-positive rate of a one-block padding test is 0.39%, so the acceptance is
chance to within noise. Decrypting all 3,075 gives **zero** plaintexts that are even
85% printable. The route is spent at this breadth.

## 24. The 29 dropped letters are positionally mechanical

The community's open leads list "read the 29 dropped symbols as a message in their own
right" as untried. Read in extraction order they are

```
OOIIOOOIIOOIOIIOIOOOOIOIIOIOI
```

and their positions in the 570-character Bifid output are all **odd**: 9, 37, 43, 45,
109, 135, ... 567. That looks planted and is not. Section 15 established that the
Bifid output splits as

```
even[j] = square[ row(ct[j]) ][ row(ct[285+j]) ]
odd [j] = square[ col(ct[j]) ][ col(ct[285+j]) ]
```

and that the ciphertext alphabet `A`–`I` occupies only rows 0 and 1 of the square, so
every even-position letter is drawn from `square[{0,1}][{0,1}]` = {`D`,`B`,`C`,`E`}.
`I` sits at square index 2 and `O` at index 13; neither is reachable from an even
position. **All 29 drops are forced onto odd positions by the cipher, not placed
there.** As with the 4-letter even stream in section 8, the pattern is an artefact of
the mechanism.

The 29 letters were still read out: as a 29-bit word in both polarities, as an integer
and a hex string, as Yellow/Blue and yin/yang expansions, as their position list, as
their odd-stream index list, as their gap sequence, as gaps mapped to letters and to
half-letters, and each of those as indices into ten texts — 82 readings, each in seven
password forms against both locks under both digests, and each as a brainwallet key.
Nothing.

## 25. Yellow, Blue, primes and "zeroed out" on the non-textual objects

The community's highest-ranked open lead is the ninth planted address,
`1NULY7DhzuNvSDtPkFzNo6oRTZQWBqXNE9`, funded 2020-04-07 with no message and named by
the creator a year later as still live. It is an exact offline oracle: hash a
candidate, derive the address, compare. The lead's own kill condition is the creator's
rules from that window — "Yellow has a number and so does Blue", "primes", "zeroed
out" — read on a *non-textual* object and exhausted. That is the same family the
reader's chain is in, so it was run.

`tools/brain.c` is the checker: it reads candidates on stdin and tries each as
SHA-256, as SHA-256 of the lower- and upper-cased form, as a raw phrase left- and
right-padded to 32 bytes, as a literal 64-hex key, and as the bit-reversal of each,
against all ten planted addresses in compressed and uncompressed P2PKH form. It is
validated by the known preimage: feeding it `data/ans227.txt` reproduces
`1M5ypvDbp124ZtKPbg3GJg1JqNs1x7TPoN` on the first try.

`tools/gen_family.py` and `tools/gen_family2.py` generate the family. The colour grid
is read in 20 spatial orders — rows, reversed rows, boustrophedon and columns, each on
the identity, the transpose, all three rotations and both mirrors, plus both spirals
and both diagonal readings. Under each order, Yellow and Blue are assigned their
numbers ten ways (9/15, 15/9, 25/2, 2/25, 9/0, 0/15, 1/0, 0/1, 9/2, 25/15) with White
and Black filled four ways (0/1, 1/0, both zero, both dropped), and the resulting
sequence is masked seven ways for "zeroed out" and "primes" — keep prime indices, keep
non-prime indices, in both index origins, zero the primes, zero the non-primes, or
leave it whole. Each masked sequence is packed six ways into key material. The second
generator adds the same prime and zeroing masks, the prime-rank substitutions, and the
"esrever" readings across the object, the Bifid output, the dropped 29, the row bits,
the base-5 column values, the 149 VIC digits and the QR modules.

**31,320 candidates, about 150,000 derived keys, against all ten planted addresses:
no match.** The same candidates were then run against both 80-byte locks in three
password forms under both digests — 375,840 tests, 1,485 padding acceptances (0.395%,
again chance), **zero** readable plaintexts.

That closes the "Yellow/Blue + primes + zeroed out on a non-textual object" family at
the breadth described. It does not close the third-door lead itself, which remains the
best-shaped open target in the puzzle: an exact oracle, free to query, with a preimage
that the creator has said exists.

## 26. What the SalPhaseIon page actually instructs, and a retraction chain worth knowing

The final page's token stream, split on its `z` separators, reads:

```
seg0 | matrixsumlist | seg2 | z | lastwordsbeforearchichoice | z | thispassword
| z | shabef ourfirsthintisyourlastcommand
```

with a second `abba` run inside the blob decoding to `enter`, and a trailing
`shabefanstoo`. `shabef` is the creator's own spelling of SHA-256 (b=2, e=5, f=6).
Read literally the page says: *the last words before the Architect choice — this
password — SHA-256 — our first hint is your last command*. The first hint of the
puzzle is `esrever`, so the last command is **reverse**.

That is the reading a reader proposed, and it is the obvious one. It needs one caveat
that is easy to miss and that took following a chain of three upstream sections to
establish:

- Upstream **section 11** reports the large Cosmic Duality blob as decrypted, with a
  key that is the XOR of the SHA-256 digests of seven tokens, four of them these very
  page strings. It concludes that `lastwordsbeforearchichoice` and `thispassword` are
  *ingredients in a key derivation*, not an instruction, and that the last-words
  reading is therefore probably wrong.
- The XOR key does reproduce. Recomputed here it is
  `a795de11…52e50735`, matching the published value exactly. Note in passing that two
  of the seven tokens are the same string, `matrixsumlist`, so it cancels under XOR and
  the key is really a five-token chain.
- Upstream **section 14** then retracts section 11 (and section 31 now confirms this
  first-hand, on the recovered bytes): those 32 raw bytes passed to
  `EVP_BytesToKey` with MD5 is a convention the puzzle never uses, and 93 of 20,000
  random 32-byte keys clear the same padding test, 92 of them with exactly one padding
  byte — which is the signature of a 1328-minus-1 = 1327-byte "plaintext". The decrypt
  is a padding accident and the 103x103 matrix read out of it is noise.

**So the argument against the last-words reading does not survive.** It was resting on
section 11, and section 14 pulls that out. The reading is not closed by reasoning —
only by sweeping, which upstream did (section 15, 405,287 candidates, 0 match) and
which this session extended below.

## 27. The last-words directive, extended along two axes upstream did not sweep

Upstream's section 15 swept word windows of these texts in **three** forms — lowercase
joined, lowercase spaced, uppercase joined — under 7 password forms. Two axes are
missing from that, and both matter for this creator:

1. **Exact published casing and punctuation.** The phase 3 answer proved that case is
   load-bearing: `causality`, `Safenet`, `Luna`, `HSM` had to be typed exactly. The
   monologue is published in uppercase *with* apostrophes and a hyphen, and none of the
   three swept forms is that string.
2. **The reversal the page itself asks for.** `ourfirsthintisyourlastcommand` names
   `esrever` as the final operation, and a reversal applied to the phrase *before*
   hashing is a different candidate from one applied after.

Both were run. Every contiguous window of 1 to 20 words of the puzzle's own Architect
monologue, of the phase 3.2 introduction, and of the film scene's closing passage,
each under sixteen normalisations (exact, lowercase and uppercase, each spaced and
joined, punctuation-stripped, apostrophe-stripped) and three reversals (none, string
reversed, word order reversed), in four password forms, against both locks under both
key derivations.

**182,164 distinct phrases, 2,914,624 decryptions.** 11,289 padding acceptances, which
is 0.387% against a theoretical 0.39%. **Zero** readable plaintexts. A separate,
narrower pass over every suffix of both monologues with digest-reversal added
(8,256 phrases, 231,168 decryptions) is also negative.

One structural note for whoever picks this up. Both locks carry exactly 80 bytes of
ciphertext. If the plaintext is two 32-byte keys — which is what *"the private keys
belong to half and better half"* says, and it sits directly above the first of the two
blobs — then it is exactly 64 bytes, and PKCS#7 gives it a **full** 16-byte padding
block. Under that assumption the right filter is not "valid padding" but "the final
block decrypts to sixteen bytes of `0x10`", which no wrong key will ever pass by
chance. It does not speed up the search, but it means a hit needs no adjudication.

`tools/lastwords.py` and `tools/windows.py` run these sweeps. They read the film
passage from a local file that is deliberately not committed here; supply your own.

## 28. The "SalPhaseIon typos" decrypt (community issue #108) is a padding accident

A 2026 issue on the community repository reports the small blob solved: two typos on the
live page had allegedly corrupted the base64 for years, and the corrected blob opens
under `EVP_BytesToKey`/MD5 with the page's own tokens concatenated as the password,

```
matrixsumlist | enter | lastwordsbeforearchichoice | thispassword | matrixsumlist
```

yielding 79 bytes read as two 32-byte keys `K_C1`, `K_C2` and a 15-byte `E_C`. It is
checkable entirely offline, so it was checked.

**The premise is wrong.** The "corrected" blob is byte-identical to the one the
community README has always carried. Position 18 already reads `J` and position 51
already reads `s`. Nothing was corrected; the diff is empty.

**The decrypt itself reproduces exactly.** That password under MD5 gives precisely the
79 bytes the issue publishes, `9fa9db91…` and `15173896…` and `38d4f4c9…`.

**And it is noise.** Every independent check fails:

| Check | Result |
|---|---|
| `K_C1`, `K_C2` and 22 derivatives (double, half, ±1, byte- and hex-reversals, digests, their XOR) as private keys against all 10 planted addresses and the prize | 0 match |
| `E_C` in 56 forms as the password of either 80-byte lock, both digests | 0 padding-valid |
| Plaintext entropy | 6.13 bits/byte over 72 distinct values in 79 bytes — uniform to within sampling |
| Container marker (`Salted__` / `U2FsdGVk`) anywhere in the plaintext | none |
| The claimed corroboration, "`K_C1` matches the WIF key from issue #68" | issue #68 publishes no such key; its own comments state the private key remains undiscovered, and it repeats the master XOR key and Cosmic Duality hash that section 26 shows are noise |

The statistical signature is the giveaway, and it was measured rather than assumed.
Decrypting the small blob under MD5 with **40,000 random passwords**:

```
valid PKCS#7 padding : 160 of 40,000  = 0.400%   (chance: 1/256 = 0.391%)
of those, exactly one 0x01 pad byte  : 160 of 160
```

A second draw of 40,000 gave 139 and 138 — the rate is sampling noise around 1/256,
not a constant. Essentially every chance hit has exactly one padding byte, because a
trailing `0x02` needs two bytes to agree, a `0x03` three, and so on. So "the plaintext came out 79 bytes"
is not a sign of success — it is what failure looks like. The issue's result has that
signature and nothing else.

### How many more of these are waiting

The same family was then exhausted, to show this is not a one-off. Every ordered
concatenation of up to four of the nine tokens the final page yields — `matrixsumlist`,
`enter`, `lastwordsbeforearchichoice`, `thispassword`, `shabef`,
`ourfirsthintisyourlastcommand`, `shabefanstoo`, plus the two the community's XOR key
invents, `yourlastcommand` and `secondanswer` — under four joiners and four casing and
digest forms, against both locks under both derivations:

```
57,636 distinct passwords, 230,544 decryptions
padding-valid : 937  = 0.406%   (chance 0.391%)
one 0x01 byte : 933 of 937
```

**There are roughly 900 further "solutions" of exactly the #108 kind sitting in that
space**, each as reproducible and as meaningless — `shabefthispassword`,
`MATRIXSUMLIST SECONDANSWER`, `lastwordsbeforearchichoice-yourlastcommand` and so on.
Anyone concatenating page tokens and stopping at "valid padding" will keep finding them
indefinitely.

**The rule this suggests.** On an 80-byte lock, valid padding is not evidence. A claim
is only worth reporting when the plaintext does something: derives a funded or planted
address, opens the next container, or carries a structure that could not have been
imposed afterwards. Under the two-32-byte-key hypothesis of section 27 the plaintext
would be exactly 64 bytes with a **full** 16-byte pad block, and that filter has no
false positives at all — it is the one worth running.

Both locks remain closed.

## 29. The 9/15 → rows → 29 chain: arithmetic confirmed, significance deflated, step exhausted

A reader proposed a tighter chain than section 23's: score the 16x16 object not by an
invented alphabet but by each letter's **column coordinate in the confirmed Bifid
square**, which is the natural choice because the object is a repacking of column
coordinates in the first place.

```
D B I F H
C E G A K      column = 0 1 2 3 4
L M N O P
Q R S T U
V W X Y Z
```

**Every arithmetic claim reproduces on the certified extraction.** Unlike the "sums
total 101" claim of section 23, this one is exact:

```
row sums : 36 31 26 35 36 29 37 17 29 26 25 29 20 27 29 33
col sums : 34 32 22 19 25 30 39 37 26 31 29 29 29 28 24 31
```

Seven row sums are prime (rows 2, 6, 7, 8, 9, 12, 15) and seven column sums are prime
(columns 4, 8, 10, 11, 12, 13, 16). Rows **9** and **15** — Yellow and Blue — both sum
to **29**, which is prime and is also the count of letters dropped in the reduction.
Columns 9 and 15 sum to 26 and 24, neither prime, so the numbers do pick out the row
direction rather than the column one.

### What the numbers are worth

Two honest deflations, both measured rather than asserted.

**The 7-and-7 is real but modest.** Shuffling the object's own 256 letters and
recomputing, 200,000 times:

| Outcome | Frequency |
|---|---|
| exactly 7 prime rows and 7 prime columns | 327 / 200,000 = 0.164% |
| at least 7 and 7 | 726 / 200,000 = 0.363% |

So about 1 in 600 — genuinely uncommon. But "exactly seven" was chosen *after* seeing
the data, because seven matches the Architect's line. Sums in the 17–39 band are prime
about a quarter of the time, so 4 is the expected count and 7 is a good roll, not a
signature. Against the number of structural readings already tried on this object, 1 in
600 does not survive as evidence on its own.

**The 29/29 is much weaker than it looks.** 29 is the **modal** row sum: four of the
sixteen rows carry it — rows 6, **9**, 12 and **15**. Picking two named rows and having
both land on the modal value has probability 4/16 × 3/15 = **5%**. Rows 6 and 12 give 29
too and no part of the hint points at them.

### The last-words alignment, and a fragility in it

The chain then observes that the Architect's closing seven words before Neo chooses run
to 23 letters and 29 characters counting spaces, matching the 29 dropped symbols, and
that the full sentence is 15 words and its tail 9 — Blue and Yellow. The counts are
right as quoted.

**They depend on which transcript you use.** Published transcripts of that line differ
by one word: some read "nothing you can do", others "nothing **that** you can do". With
the second, the sentence is 16 words and the tail 10, and the 15/9 correspondence
disappears entirely. The alignment is therefore contingent on a transcription choice,
which is the same failure mode as the 101-versus-102 cell in section 23. Both variants
were carried through the sweep below so that nothing rests on the choice.

### The step itself, run out

The last arrow — the YIN/YANG operation joining the two 16-character rows, the
29-character phrase and the 29-symbol mask — is a small, well-specified space, so it was
exhausted rather than sampled. The mask was applied in both polarities, forward and
reversed, over both the 29 characters and the 23 letters; as a selector, as a case
toggle, and as a **two-value Vigenere key with shifts 9 and 15** in both assignments and
both directions, which is the reading "Yellow has a number and so does Blue" most
directly suggests and which the proposal had not tried. The rows were taken alone,
concatenated both ways, interleaved, reversed, XORed and added mod 26, and used as
Vigenere and Beaufort keys over the phrase and vice versa, in four transcript variants.

```
742 distinct candidates, 14,840 decryptions against both locks under both derivations
padding-valid        : 49  (0.330%, chance 0.391%)
full 16-byte pad block: 0
readable plaintexts  : 0
same candidates as private keys, 5,178 keys vs the ten planted addresses: 0 match
```

The 9/15 Vigenere readings are worth recording as plainly dead, since they are the most
natural thing the hint could mean: over the 23 letters they give `CDCQXCVHXJRJCMXIXHIDERI`
and its three siblings, none of them language.

**Verdict.** The chain's arithmetic is correct and the row direction really is selected
by 9 and 15, which is more than section 23 could say. But the two coincidences carrying
it are a 5% event and a post-hoc 1-in-600 event resting on a contested transcript, and
the operation they point at produces nothing on either lock or any planted address. It
is a better-shaped hypothesis than its predecessors and it is still negative.

## 30. The phase-2 variable table, resolved by exhaustion rather than by riddle

Section 19 flagged the phase-2 table as the one explicitly posed sub-riddle that no
solved stage ever consumed. That flag is now firmer, because the rest of the text
around it **was** consumed and can be traced.

The phase-2 plaintext uses inline digits as part markers — `2name`, `3Moon`,
`4How so mate?` — and each one supplies a part of the phase-3 answer: the keymakers'
ironic name is `Safenet`, the Latin moon is `Luna`, and the fourth is `HSM`. Part 1,
`causality`, comes from the phase-3 text's own `1name` marker, and part 5, `11110`, is
JFK's Executive Order 11110, not the table. So every element of that page has a
destination **except** the table and its four definitions:

```
# X 2 S H 4 Y 0 Q B 15 #
Q -> extend the name of a hackers' swordless fish, the I and W are below.
B -> ((BV80605001911AP)- (sqrt(-1)))^2
H -> (Answer to only this puzzle but nothing else) * -1
S -> cha' + (vagh * jav)
```

Two are settled. `S` is Klingon arithmetic, *cha'* + *vagh* × *jav* = 2 + 5 × 6 = **32**.
`B` names an Intel spec code whose processor is an i5, so (5i − i)² = (4i)² = **−16**.
`X`, `H`, `Y` and `Q` have no agreed reading, and `X` and `Y` are not even given a
definition line — they appear in the table and nowhere else.

The closing line, *"on the highway, let put it in the worst gear"*, is the puzzle's
`esrever` again: reverse is the worst gear on a highway. So every rendering is also
tried backwards.

### Reading the two open definitions

`Q` is most likely **2**. The fish ciphers are Blowfish, Twofish and Threefish; the
hacker film is *Swordfish*, so "swordless fish" strips the sword and leaves the family.
"The I and W are below" fits `TWOFISH` and `BLOWFISH` and rules out `THREEFISH`, which
has no W — which points at the Two/Blow pair and so at the number two.

`H` resists. "The answer to only this puzzle but nothing else" plays on the answer to
life, the universe and everything, narrowed to a single puzzle, and there is no
defensible value: 42 negated, the phase number, the prize in BTC and a self-referential
zero all fit the wording equally.

### So it was not read — it was exhausted

Rather than argue, the whole table was brute-forced. `X`, `H` and `Y` over **−50 to
+50** and `Q` over {2, 3, 4}, with `S` and `B` fixed at their settled values, rendered
seven ways — joined, absolute values, space-separated, hash-delimited, and reversed in
three of those forms — and each rendering tried raw **and as the lowercase and
uppercase hex SHA-256 of itself**, which is the creator's own documented convention
(*"parts 1..7 → sha-256 → dgst is the password"*). Against both 80-byte locks, under
both key derivations.

```
combinations   3,090,903          (101 x 101 x 101 x 3)
decryptions  259,635,852
padding-valid    1,017,387  = 0.3918%   (chance 0.3906%)
full 16-byte padding block         0
```

`tools/table.c` runs it, sharded across cores. Its key derivation was checked against
`tools/oracle.py` byte for byte on both digests before the run, because a sweep that
cannot derive a key correctly produces exactly this result for the wrong reason.

**Nothing.** Acceptance sits on the theoretical rate to four significant figures, and
not one candidate in 260 million produced the full 16-byte padding block that the
two-32-byte-key hypothesis of section 27 requires. Whatever the table is for, its
resolved value is not the password of either lock under any assignment in that range
and any of those renderings.

The independent oracle says the same. The same renderings over the narrower range
**X, H, Y in -12..+12** were put through `tools/brain.c` against all ten planted
addresses and the prize, in its six key constructions (SHA-256, of the lower- and
upper-cased form, raw left- and right-padded to 32 bytes, and the bit-reversal of
each): **240,966 strings, roughly 1.4 million keys, no match.**

That is worth having as a bounded negative: the open sub-riddle can now be set aside as
a *direct* password source and as a direct preimage, which is where anyone finding it
would naturally take it first. Its four unknowns remain unresolved, and the table
remains unconsumed.

## 31. The Cosmic Duality blob, recovered — and its "solution" refuted first-hand

Every statement this file has made about the large blob until now came from upstream's
description of it. The bytes themselves were never in hand: they are on a live page
that the network here cannot reach, and neither the community README nor upstream's
oracle carries them. Section 26 therefore had to take the refutation on trust.

**The blob is now recovered**, from a fork of the community repository that archives
saved copies of the live page. It is carried byte-identically by seven independent
files in that repository — the September 2026 capture of the live page body, a saved
`salphaseion.html`, and five archived snapshots of the endgame page dated 2023-06-01,
2023-11-27, 2024-11-23, 2025-10-31 and 2026-04-05. All seven agree exactly.

```
total            1344 bytes  =  "Salted__" + 8-byte salt + 1328 bytes of ciphertext
salt             2d3f6fe06dc950e6
ciphertext       83 AES blocks
sha256(file)     b18950551a4dd0cb8a9378f0906ba18c03a15f0ee83eb98c6bc90165c5f79805
```

Two checks were run before trusting it: the first 24 base64 characters match what is
legible in the page screenshot committed to the community repository, and the salt
matches the value reported independently in community discussion. Stored as
`data/cosmic-duality.b64`.

### The community decrypt reproduces exactly

With the blob in hand the claim can be run rather than described. The key is the XOR of
the SHA-256 digests of seven tokens, passed as **32 raw bytes** to `EVP_BytesToKey`
under **MD5**:

| | |
|---|---|
| derived key | `a795de11…52e50735` |
| padding | **valid**, a single `0x01` byte |
| plaintext length | 1327 bytes |
| plaintext SHA-256 | `4f7a1e4efe4bf6c5581e32505c019657cb7b030e90232d33f011aca6a5e9c081` |

That is the published value, bit for bit. Under SHA-256 the same key gives no valid
padding at all, so the result exists only under a derivation the creator never uses.

### And it is noise — measured on the blob itself

| Check | Result |
|---|---|
| plaintext entropy | **7.870 bits/byte** over 255 distinct values in 1327 bytes |
| printable fraction | 0.389 — what uniform bytes give |
| container marker (`Salted__` / `U2FsdGVk`) | none |
| 40,000 random 32-byte keys, MD5, **on this blob** | 165 valid paddings = 0.412% (chance 0.391%) |
| of those, exactly one `0x01` pad byte | **165 of 165** |

So one random key in roughly 250 produces a result with exactly this shape, and every
one of them lands on a single `0x01` byte — which is the entire signature of the
published decrypt. The 103x103 matrix, the base-38 decode and the four trailing bytes
of the community's chain are readings of 1327 bytes of noise.

Two other keys circulating for this blob were tried and fail outright, with no valid
padding under either derivation: `818af53d…d76bb402`, and the "theseedisplanted plus
three rounds of SHA-256" construction in four iteration counts and two base strings.

**This upgrades section 26 from second-hand to first-hand.** The refutation no longer
rests on anyone's account of the bytes. The large blob is closed, with an unknown key,
and it is now in `data/` so the next person does not have to go looking for it.
`tools/cosmic.py` holds the decrypt, the padding test and the control.

## 32. Attacking the recovered Cosmic Duality blob directly

AES-256-CBC has no shortcut, so "breaking it directly" means searching the password
space — but the recovered blob makes that search far sharper than it is on the small
locks. It is 1328 ciphertext bytes, and its solved sibling (the phase 3.2 blob) decrypts
to text whose first block is `I've been waitin` — 16 of 16 printable. So if this blob is
text too, the **first plaintext block is printable ASCII**, and that is a filter of
about 2^-23, three orders of magnitude tighter than the 1/256 a padding test gives.

That difference is the whole point. Everyone who has run a dictionary at this blob used
padding as the filter and drowned in ~1-in-256 false hits they could not adjudicate.
With a printable-first-block filter the same dictionaries clear cleanly.

`tools/ccrack.c` implements it: one AES block per candidate, counting printable bytes in
plaintext block 0, across raw / lowercase-hex-SHA-256 / uppercase-hex-SHA-256 passwords
under both digests. It was validated on the phase 3.2 blob, where the known password
`sha256("jacque…principle")` is recovered at 16/16 with valid padding, and nothing else
reaches the threshold.

The false-positive rate was measured, not assumed. 200,000 random passwords
(1.2M decryptions) against this blob:

| printable bytes in block 0 | count | rate |
|---|---|---|
| >= 13 | 438 | 3.7e-4 |
| >= 14 | 68 | 5.7e-5 |
| >= 15 | 0 | < 8e-7 |

A real text plaintext scores 16. Noise essentially never reaches 15.

Three candidate spaces were run:

| Space | Candidates | Decryptions | Hits >= 15/16 | Language, valid padding |
|---|---|---|---|---|
| Curated: the community's known tokens and stage answers, every word and 2-4-gram of every held text, ordered concatenations of the 12 page tokens, the XOR chain and its hex | 2,862 | 17,172 | 0 | 0 |
| The `corpus*` and `tokens7` lists (the earlier password work) | 43,580 | 261,480 | 0 | 0 |
| **Every substring of length 3 to 40** of the Beaufort monologue, the 227-answer, the object, the Bifid output, `seg0`, `seg2`, the phase-2 and phase-3.2 plaintexts, and the Architect film lines | 192,554 | 1,155,324 | 4 | 0 |

The four hits in the substring pass sit at exactly 15/16, all with invalid padding and a
block-0 that is not language (`eDm$oi.1(L&<t.],`, `>JPU|yQGV.]l)tUV`, …). At 1.15M
decryptions and a measured >=15 rate under 8e-7 the expected count of pure-noise hits at
15 is order one, so four zero-padding non-language hits is exactly noise and nothing more.

**Negative, and this time with headroom.** The substring hypothesis — that the password
is a run of characters from some text the solver already holds — is the most natural
remaining guess, and upstream could only test it against the small locks and the planted
addresses. Here it is cleared against the large blob under a filter that would not have
hidden a real hit: a correct password would have surfaced at 16/16 printable with valid
padding, the way the phase 3.2 password does. It did not appear. The blob's password is
not a substring of any text the puzzle has so far yielded.

`tools/ccrack.c` is the reusable piece: point it at any of the three `Salted__` blobs in
`data/` and pipe candidates at it, and a genuine text plaintext cannot hide behind the
noise the way it does under a padding-only test.
