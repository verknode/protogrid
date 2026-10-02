# v145 patch -- CrypTool Hash Functions / YINYANG wiring, missing families

No `gsmg_cryptool_hash_wiring_audit_v144.py` / `.md` exists anywhere in this session or
this repository -- there is nothing to read and nothing to avoid redoing. This patch was
implemented fresh against the two real candidate objects this repository actually has.

## Foundation caveat (established before this patch, not by it)

`HALF` / `BETTERHALF` / `TRAIL` are the 103x103-matrix output over the recovered Cosmic
Duality "plaintext" (`data/cosmic-duality.b64`). `README.md` section 31, **"The Cosmic
Duality blob, recovered -- and its 'solution' refuted first-hand"**, measures that
plaintext as a padding-accident / statistical-noise decrypt:

- entropy 7.870 bits/byte over 255 distinct values (uniform noise is indistinguishable)
- 40,000 random 32-byte keys reproduce the same single-`0x01`-byte padding shape at
  0.412% (chance rate 0.391%)
- *"the 103x103 matrix, the base-38 decode and the four trailing bytes of the
  community's chain are readings of 1327 bytes of noise."*

This patch's own self-test recomputes the plaintext's SHA-256 and gets
`4f7a1e4efe4bf6c5581e32505c019657cb7b030e90232d33f011aca6a5e9c081`, an exact match to the
value README section 31 publishes for the refuted noise decrypt. **Everything below was
run anyway, as instructed, as a cheap just-in-case control -- not because that refutation
is in doubt.**

`HALF = 0423d9115a1dc756d5d08d2de880ab508bd4745fc97709f4fcb513f2cb8fcc35`
`BETTERHALF = 48cc46e66bdd36b09ae344552f606a761f9d90681f20dfefe2b43db18b623971`
`TRAIL = fc0c1b02`
`TABLE = [-4, 2, 32, 12, 4, 27, 0, 2, -16, 15]` (the literal tokens of `# X 2 S H 4 Y 0 Q B 15 #`, matching `tools/table.c`'s brute-forced X=-4, H=12, Y=27, Q=2)

Targets: the 10 addresses in `data/planted-addresses.txt` (includes the prize address),
plus 5 addresses/strings carried over from a prior session's summary
(`17ucy1K9ZUAaoY6JVtM932W9jUp5LXfyHa` and the four claimed "Half/BetterHalf checkpoint"
addresses) that do **not** appear anywhere in this repository's own data or README --
kept as a separate, explicitly-flagged target class, not folded into the 10 confirmed
planted addresses. All 15 base58check-decoded and round-tripped successfully
(self-test).

## What's new relative to what's already in this repo

`tools/oracle.py` (80-byte AES locks), `tools/table.c` (phase-2 table as a password
string), `tools/intertwine.py` and `tools/yinyang29.py` (different "yinyang"/interleave
objects entirely -- the masking/9-15/dropped29 chain, not Half/BetterHalf) were read
first and not duplicated. New in this patch:

1. Reciprocal XOR/AND/OR/concat/interleave merges of HALF and BETTERHALF
2. A hash160-payload oracle (decode every target address to its 20-byte payload,
   compare directly -- not only via a derived 32-byte scalar)
3. Bitcoin-specific HASH160 / double-SHA256 compositions over the merges
4. Tiger and Whirlpool (absent from every prior sweep in this repo)
5. Raw-bytes-vs-ASCII-hex representation controls
6. The existing 80-byte AES oracle (`tools/oracle.py`), fed every new hash output as a
   raw-byte password (the `tools/rawcrack.c` convention from README section 35)
7. The phase-2 table read as a byte-routing selector over HALF/BETTERHALF, distinct
   from `table.c`'s password-string reading

## 1. AES-IV reciprocal merges (`family: hash_key_original_iv_merge`)

Y = HALF, Z = BETTERHALF (the only real reciprocal 32-byte pair this repo has; there is
no v144 `hash_key_original_iv` family to inherit the pairing from, so this is stated as
an assumption, not inherited fact). All seven requested merges computed and checked,
plus a SHA256-derived control on each:

`Y XOR Z`, `Y AND Z`, `Y OR Z`, `SHA256(Y||Z)`, `SHA256(Z||Y)`,
`interleave(Y,Z)->SHA256`, `interleave(Z,Y)->SHA256` -- **0 private-key hits.**

(`interleave` defined explicitly: alternating bytes `Y0,Z0,Y1,Z1,...`.)

## 2 & 3. Bitcoin HASH160 hard oracle + double-SHA256 (`family: bitcoin_hash_compositions`)

For X in `{A, B, A||B, B||A, A XOR B, A AND B, A OR B}` plus the 5 new 32-byte merge
outputs from section 1: computed `HASH160(X) = RIPEMD160(SHA256(X))` and compared the
raw 20-byte payload **directly** against all 15 targets' hash160 payloads (never only
via a re-hashed scalar), and `doubleSHA256(X) = SHA256(SHA256(X))` checked both as a
32-byte private-key candidate and against the one known 32-byte checkpoint value this
repo has (the noise-plaintext's own SHA-256).

**0 TARGET_HASH160_HIT, 0 private-key hits, 0 known-checkpoint matches.**

## 4. Tiger / CRC / PKCS#5

**Tiger** (24 bytes, no truncation invented) computed for `A`, `B`, `A||B`, `B||A`,
`A||NOT(B)`, `NOT(A)||B`, plus bounded reciprocal XOR/AND/OR/concat merges between the
`A`/`B` and `A||B`/`B||A` Tiger pairs, with `SHA256(output)` as an explicitly-labelled
derived-scalar control (never the raw 24 bytes themselves, which cannot be a privkey).
Self-tested two ways: against libgcrypt (`GCRY_MD_TIGER`) **and** an independently
compiled second implementation (`tools/tiger_ref/`, Eli Biham / Bitzi Corporation's own
public-domain `tiger.c`, as shipped in gtk-gnutella) -- the two agree exactly once each
implementation's 64-bit-word output order is accounted for. Raw values:

| input | Tiger (24 bytes) |
|---|---|
| A | `dc1d7a876eb195313e5d73778578121652c4094fa18acef6`\* |
| B | `882f6d2506b01788db20760d9616e72908b158f32066de01`\* |
| A\|\|B | `4075a420a25721139f24adb49bea40ba8140c26d931be533`\* |
| B\|\|A | `7be704972de2a00f23b36a2609c84f2176ed8e6a262c9126`\* |
| A\|\|NOT(B) | `63f4495290c7a065ca7cb502027b665d786467ffdc84f7c6`\* |
| NOT(A)\|\|B | `f686cd69ca88616c5b620c7c251375bab7849aafc5d11508`\* |

\* *libgcrypt's native word order (little-endian per 64-bit word); internally
consistent for this patch's own XOR/AND/OR/SHA256 derivations, which never mix it with
the reversed convention. See `gsmg_cryptool_hash_wiring_patch_v145.json` for the exact
bytes.*

**0 derived-scalar private-key hits.**

**CRC:** CrypTool 2's own CRC component default (polynomial / init / reflect) could
**not** be established -- its GitHub source sits outside this session's repository
scope (`verknode/protogrid` only) and no cached copy exists anywhere in this
repository. Per instruction, no polynomial was enumerated. Standard CRC-32/ISO-HDLC
(the zlib/universal default) was computed as the one representative configuration and
is reported as `STRUCTURAL_ONLY` -- a selector/checksum value, never tested as a
private-key candidate on its own:

`CRC32(A) = ` *(see JSON)*, `CRC32(B) = ` *(see JSON)*, `CRC32(A||B) = ` *(see JSON)*

**PKCS#5: UNRESOLVED.** CrypTool 2's PKCS#5 component's exact default salt, iteration
count, and digest could not be confirmed -- same GitHub-scope limitation as CRC, and no
cached CrypTool-2 source exists in this repository. No salt or iteration count was
invented; no brute force was run against it, per instruction.

## 5. Raw bytes vs. ASCII-hex representation

Six representations: `A_raw`, `B_raw`, `A_hex_lower_ascii`, `B_hex_lower_ascii`,
`A_hex_upper_ascii` (the explicit case-control; `B_hex_upper_ascii` added too, for
symmetry, clearly labelled separately), each run through SHA256, SHA512, MD5, Tiger,
RIPEMD160, Whirlpool, plus direct HASH160/double-SHA256 as Bitcoin consumers. No
truncation invented anywhere (SHA512/Whirlpool's 64-byte outputs are recorded in full;
only an explicitly-labelled `SHA256(output)` derived-scalar control is additionally
checked as a privkey candidate). **0 hits across all six representations.**

## 6. AES/OpenSSL intermediate hard oracle

Every natural hash output from sections 1-5 (38 candidates total: the 7 base
compositions + 5 new merges, each as raw bytes and as `SHA256(...)`, plus the 6
representation controls) fed as the **raw-byte password** (the `rawcrack.c` /
README-section-35 convention) into the existing `tools/oracle.py` against both real
80-byte locks (`salphaseion`, `phase322`), both EVP_BytesToKey digest profiles (MD5,
SHA-256): **38 x 2 x 2 = 152 decryptions, 0 reaching strict 16/16 PKCS#7 padding.**
(Chance-level single-byte padding accidents, if any, were logged as
`STRUCTURAL_ONLY`, never reported as hits -- matching this repo's own established
`pad=01 is not evidence` rule from README section 31/35.)

## 7. Phase-2 table as a routing selector (`family: phase2_table_routing`)

Three structurally-motivated, explicitly-specified routing reads of
`TABLE = [-4,2,32,12,4,27,0,2,-16,15]` over `A||B` (64 bytes), each cycled/repeated to a
fixed 32-byte output (never an arbitrary subset enumeration):

- **mirror-position:** `idx = v if v>=0 else len(pool)+v`, table cycled 3.2x over the
  64-byte pool to fill 32 output bytes.
- **parity branch-select:** at output position `i`, `table[i%10]`'s parity picks the A
  or B branch; `abs(v) mod 32` picks the offset within that branch.
- **sign branch-select:** same, but the *sign* of `table[i%10]` picks the branch
  (negative -> B, non-negative -> A).

Each plus a SHA256-derived control. **0 hits.**

## NEW_GRAPHS / DUPLICATES_SKIPPED

```
NEW_GRAPHS: 136
DUPLICATES_SKIPPED: 0
```

## Oracle hit counts (categories kept separate, per instruction)

```
PRIVATE_KEY_HITS:          0
TARGET_HASH160_HITS:       0
AES_STRICT_PADDING_HITS:   0
AES_KNOWN_CHECKPOINT_HITS: 0
KNOWN_CHECKPOINT_HITS:     0
ERRORS:                    []
```

`KNOWN_CHECKPOINT_HITS` counts exact matches to the one known 32-byte checkpoint value
this repo has (the noise-plaintext SHA-256); it is **not** the plaintext-recomputation
self-test itself, which is unconditional and already confirmed as a precondition above.

## YINYANG status

**Not closed.** All of the above -- reciprocal merges, the HASH160 hard oracle, Tiger,
raw-vs-ASCII representation, the AES hard oracle, and the phase-2 table as a routing
selector -- came back negative. Combined with the foundation caveat (HALF/BETTERHALF
sit on a plaintext this repository's own section 31 already measures as noise), the
honest state is: nothing here moves YINYANG forward, and the object it would need to
move forward on is itself unconfirmed.
