# GSMG.IO 5 BTC puzzle — analysis session

Self-contained research notes, data and tooling from one working session on the
[GSMG.IO 5 BTC puzzle](https://github.com/puzzlehunt/gsmgio-5btc-puzzle).
Unrelated to the ProtoGrid product; kept here only so the work survives.

**Outcome: the puzzle was not solved, and nothing found here is new to the
community.** What this directory does contribute is independent verification,
reproducible tooling, and one refuted public claim.

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

## 5. Dead end worth recording

The two undecoded letter blocks in SalPhaseIon (`data/seg0.txt`, 91 chars;
`data/seg2.txt`, 570 chars, alphabet `a`–`i`) resist the method that solves the
neighbouring blocks. `seg4` and `seg6` decode by mapping `a`–`i`,`o` to 1–9,0,
reading the result as a decimal integer, converting to hex and reading ASCII —
giving `lastwordsbeforearchichoice` and `thispassword`. That fails here, and the
total absence of a zero digit across 661 characters rules the big-integer
reading out on its own.

Tried and rejected: base-9 and bijective base-9 integers, digit pairs and
triples in base 9 and base 10 across all offsets, cumulative sums mod 26, and —
following the embedded `matrixsumlist` label literally — row and column sums for
every factorisation of both blocks, under both `a=0` and `a=1`.

One observation that may be worth more than the failures: the two blocks have
**very different statistics**. `seg0` has an index of coincidence of 0.151
against 0.111 for uniform, so it looks like a per-character encoding of
structured data. `seg2` sits at 0.118, near uniform, which is what a
big-integer encoding or key material looks like, not text. They may well need
different treatment rather than one shared decoding.

## 6. Tools

| File | Purpose |
|---|---|
| `tools/decode_beaufort.py` | Recovers the Beaufort block from the crib |
| `tools/crack.c` | Tests candidate phrases from stdin |
| `tools/crack2.c` | Enumerates all substrings of a corpus |
| `tools/crack3.c` | Enumerates XOR subsets of token hashes |

Build: `gcc -O3 -march=native -o crack2 crack2.c -lcrypto`.
Throughput is roughly 750k candidates per second per core.

Each tool self-validates against the solved phase 3.2 blob before use; a run
that cannot rediscover `jacquefrescogiveitjustonesecondheisenbergsuncertaintyprinciple`
is misconfigured.
