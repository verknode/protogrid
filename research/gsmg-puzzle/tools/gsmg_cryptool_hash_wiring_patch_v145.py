"""v145 patch: CrypTool Hash-Functions / YINYANG wiring families not covered before.

No v144 artifact exists anywhere in this repository or session -- there is nothing to
"not redo". This script implements the v145 instructions fresh, against the two real
candidate 32-byte objects actually in our data:

    HALF, BETTERHALF  -- the 103x103-matrix output over the recovered Cosmic Duality
                          "plaintext" (`data/cosmic-duality.b64`).

IMPORTANT CAVEAT, established before this script was written (not by it): that
plaintext is the one README.md section 31 ("The Cosmic Duality blob, recovered -- and
its 'solution' refuted first-hand") measures as a padding-accident / statistical noise
decrypt -- entropy 7.870 bits/byte, 40,000 random keys reproduce the same single-0x01
padding shape at the chance rate (0.412% vs 0.391% expected). This script's own
plaintext-SHA256 self-test below reproduces that exact published digest, confirming
HALF/BETTERHALF sit on the refuted object, not on any independently-established one.
Run anyway, per instruction, as a cheap "just in case" control -- not because the prior
refutation is in doubt.

Everything here is NEW relative to tools/oracle.py, tools/table.c, tools/intertwine.py,
tools/yinyang29.py (read first, not duplicated): the reciprocal XOR/AND/OR/concat/
interleave merges of HALF and BETTERHALF, a hash160-payload oracle, Tiger and Whirlpool
(absent from the prior sweeps in this repo), raw-vs-ASCII-hex representation controls,
and a phase-2-table routing-selector reading of HALF/BETTERHALF distinct from table.c's
password-string reading.
"""
import ctypes, ctypes.util, hashlib, json, sys, zlib
from Crypto.Hash import keccak, RIPEMD160, SHA3_256, BLAKE2b, BLAKE2s

sys.path.insert(0, ".")
import btc
import oracle as aes_oracle

N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141

# ---------------------------------------------------------------- source objects --
HALF = bytes.fromhex("0423d9115a1dc756d5d08d2de880ab508bd4745fc97709f4fcb513f2cb8fcc35")
BETTER = bytes.fromhex("48cc46e66bdd36b09ae344552f606a761f9d90681f20dfefe2b43db18b623971")
TRAIL = bytes.fromhex("fc0c1b02")
TABLE = [-4, 2, 32, 12, 4, 27, 0, 2, -16, 15]  # literal tokens of "# X 2 S H 4 Y 0 Q B 15 #"
assert len(HALF) == 32 and len(BETTER) == 32 and len(TRAIL) == 4

COSMIC_PT_SHA256 = "4f7a1e4efe4bf6c5581e32505c019657cb7b030e90232d33f011aca6a5e9c081"

# ---------------------------------------------------------------------- hash kit --
_gcry = ctypes.CDLL("libgcrypt.so.20")
_gcry.gcry_check_version.restype = ctypes.c_char_p
_gcry.gcry_check_version(None)
_gcry.gcry_md_get_algo_dlen.argtypes = [ctypes.c_int]
_gcry.gcry_md_get_algo_dlen.restype = ctypes.c_uint
GCRY_MD_TIGER, GCRY_MD_WHIRLPOOL, GCRY_MD_CRC32 = 6, 305, 302


def _gcry_hash(algo, data):
    dlen = _gcry.gcry_md_get_algo_dlen(algo)
    buf = ctypes.create_string_buffer(dlen)
    _gcry.gcry_md_hash_buffer(ctypes.c_int(algo), buf, data, ctypes.c_size_t(len(data)))
    return bytes(buf.raw[:dlen])


def tiger(b):
    return _gcry_hash(GCRY_MD_TIGER, b)          # 24 bytes


def whirlpool(b):
    return _gcry_hash(GCRY_MD_WHIRLPOOL, b)      # 64 bytes


def crc32_be(b):
    return zlib.crc32(b).to_bytes(4, "big")      # 4 bytes, CRC-32/ISO-HDLC (zlib default)


def sha256(b): return hashlib.sha256(b).digest()
def sha512(b): return hashlib.sha512(b).digest()
def md5(b): return hashlib.md5(b).digest()
def ripemd160(b): return RIPEMD160.new(data=b).digest()
def keccak256(b): return keccak.new(digest_bits=256, data=b).digest()
def sha3_256(b): return SHA3_256.new(data=b).digest()
def blake2b256(b): return BLAKE2b.new(digest_bits=256, data=b).digest()
def blake2s256(b): return BLAKE2s.new(data=b).digest()
def hash160(b): return ripemd160(sha256(b))
def dsha256(b): return sha256(sha256(b))


def _reverse_64bit_words(b):
    return b"".join(b[i:i + 8][::-1] for i in range(0, len(b), 8))


def selftest_hashes():
    # Tiger: cross-check libgcrypt against an independently compiled second
    # implementation (Eli Biham / Bitzi Corporation's public-domain tiger.c, as
    # shipped in gtk-gnutella) rather than a hand-typed vector -- a 48-hex-digit
    # string is exactly the kind of thing that is easy to mistype and hard to
    # proofread by eye (this happened twice while drafting this script).
    # tools/tiger_ref/ holds the untouched source; compiled and run fresh here.
    import subprocess, pathlib
    ref_dir = pathlib.Path(__file__).parent / "tiger_ref"
    ref_bin = ref_dir / "tiger_standalone"
    subprocess.run(["gcc", "-O2", "-I", str(ref_dir), "-o", str(ref_bin),
                     str(ref_dir / "tiger_standalone.c")], check=True)
    ref_out = subprocess.run([str(ref_bin)], capture_output=True, text=True, check=True).stdout
    ref_lines = [l for l in ref_out.strip().split("\n") if l]
    tiger_empty_canonical = bytes.fromhex(ref_lines[0].split("=")[1].strip())
    tiger_empty_reversed = _reverse_64bit_words(tiger_empty_canonical)

    checks = {
        "tiger('')": (tiger(b""), tiger_empty_reversed,
                      "libgcrypt vs. the independently-compiled tools/tiger_ref/ "
                      "reference (Biham/Bitzi public-domain tiger.c), reversed "
                      "per 64-bit word to account for the two implementations' "
                      "differing output serialisation"),
        "whirlpool('')": (whirlpool(b""), bytes.fromhex(
            "19fa61d75522a4669b44e39c1d2e1726c530232130d407f"
            "89afee0964997f7a73e83be698b288febcf88e3e03c4f07"
            "57ea8964e59b63d93708b138cc42a66eb3"), "ISO/IEC 10118-3 published vector"),
        "ripemd160('abc')": (ripemd160(b"abc"), bytes.fromhex("8eb208f7e05d987a9b044a8e98c6b087f15a0bfc"),
                             "standard vector"),
        "keccak256('abc')": (keccak256(b"abc"),
                             bytes.fromhex("4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45"),
                             "standard vector"),
        "sha3_256('abc')": (sha3_256(b"abc"),
                            bytes.fromhex("3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532"),
                            "FIPS 202 vector"),
        "crc32('123456789')": (crc32_be(b"123456789"), bytes.fromhex("cbf43926"),
                               "CRC-32/ISO-HDLC check value"),
    }
    ok = True
    for name, (got, want, note) in checks.items():
        m = got == want
        ok &= m
        print(f"  self-test {name}: {'OK' if m else 'FAIL'}  ({note})")
    return ok


# ------------------------------------------------------------------ bitcoin oracle --
B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def b58decode_check(s):
    n = 0
    for c in s:
        n = n * 58 + B58.index(c)
    full = n.to_bytes(25, "big")
    pad = len(s) - len(s.lstrip("1"))
    full = b"\x00" * pad + full[-(25 - pad):] if pad else full
    payload, chk = full[:-4], full[-4:]
    assert hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4] == chk, s
    return payload[1:]  # strip version byte -> 20-byte hash160


def b58encode_check(version_payload):
    chk = hashlib.sha256(hashlib.sha256(version_payload).digest()).digest()[:4]
    full = version_payload + chk
    n = int.from_bytes(full, "big")
    out = ""
    while n:
        n, r = divmod(n, 58)
        out = B58[r] + out
    pad = len(full) - len(full.lstrip(b"\x00"))
    return "1" * pad + out


with open("data/planted-addresses.txt") as f:
    PLANTED = [l.strip() for l in f if l.strip()]

# carried over from the prior session's summary; absent from this repo's own data/
# README anywhere -- kept as a separate, clearly-flagged class of target, not folded
# into the 10 confirmed planted addresses.
UNVERIFIED_EXTRA = [
    "17ucy1K9ZUAaoY6JVtM932W9jUp5LXfyHa",
    "1JG648yaB7Wp2dpUfcZoRSD4q35oq47vCu",
    "15E3pcDDXSKhvi3CLVhRTHEgd8dbVKvSZg",
    "145ZQ9siLrsXBKf465wjdyQYAP5dRwhRhQ",
    "1FhbJnrdq1FmeiXrpTqnpQ8jvYV7naze96",
]

ALL_TARGET_ADDRS = PLANTED + UNVERIFIED_EXTRA
TARGET_HASH160 = {}
for addr in ALL_TARGET_ADDRS:
    h160 = b58decode_check(addr)
    assert b58encode_check(b"\x00" + h160) == addr, f"self-test round-trip failed: {addr}"
    TARGET_HASH160[h160] = addr
print(f"base58 self-test OK: {len(ALL_TARGET_ADDRS)} addresses round-trip "
      f"({len(PLANTED)} planted + {len(UNVERIFIED_EXTRA)} unverified-extra)")

TARGET_ADDR_SET = set(ALL_TARGET_ADDRS)


def privkey_hit(k32):
    if len(k32) != 32:
        return None
    k = int.from_bytes(k32, "big") % N
    if k == 0:
        return None
    u, c = btc.keys(k)
    if u in TARGET_ADDR_SET:
        return u
    if c in TARGET_ADDR_SET:
        return c
    return None


findings = {
    "PRIVATE_KEY_HIT": [],
    "TARGET_HASH160_HIT": [],
    "AES_CHECKPOINT_HIT": [],
    "KNOWN_32BYTE_CHECKPOINT_HIT": [],
    "STRUCTURAL_ONLY": [],
}
new_graphs = 0
duplicates_skipped = 0
_seen_graph_keys = set()
errors = []


def record_graph(family, desc, value):
    """Every new graph is logged once; identical (family, desc) pairs are duplicates."""
    global new_graphs, duplicates_skipped
    key = (family, desc)
    if key in _seen_graph_keys:
        duplicates_skipped += 1
        return
    _seen_graph_keys.add(key)
    new_graphs += 1
    tag = f"[{family}] {desc}"
    if len(value) == 32:
        hit = privkey_hit(value)
        if hit:
            findings["PRIVATE_KEY_HIT"].append({"graph": tag, "value": value.hex(), "address": hit})
            print("*** PRIVATE_KEY_HIT ***", tag, hit)
        if value.hex() == COSMIC_PT_SHA256:
            findings["KNOWN_32BYTE_CHECKPOINT_HIT"].append({"graph": tag, "value": value.hex()})
            print("*** KNOWN_32BYTE_CHECKPOINT_HIT ***", tag)
    elif len(value) == 20:
        if value in TARGET_HASH160:
            findings["TARGET_HASH160_HIT"].append({
                "graph": tag, "payload_hex": value.hex(),
                "target_hash160_name": TARGET_HASH160[value]})
            print("*** TARGET_HASH160_HIT ***", tag, TARGET_HASH160[value])
    return tag


def interleave(p, q):
    out = bytearray()
    for a, b in zip(p, q):
        out.append(a)
        out.append(b)
    return bytes(out)


def notbytes(b):
    return bytes(x ^ 0xFF for x in b)


# =========================================================== 1. reciprocal merges --
Y, Z = HALF, BETTER
MERGE = {
    "Y XOR Z": bytes(a ^ b for a, b in zip(Y, Z)),
    "Y AND Z": bytes(a & b for a, b in zip(Y, Z)),
    "Y OR Z": bytes(a | b for a, b in zip(Y, Z)),
    "SHA256(Y||Z)": sha256(Y + Z),
    "SHA256(Z||Y)": sha256(Z + Y),
    "interleave(Y,Z)->SHA256": sha256(interleave(Y, Z)),
    "interleave(Z,Y)->SHA256": sha256(interleave(Z, Y)),
}
FAMILY1 = "hash_key_original_iv_merge"
for desc, val in MERGE.items():
    record_graph(FAMILY1, desc, val)
    if len(val) == 32:
        record_graph(FAMILY1, desc + " [[SHA256-derived control]]", sha256(val))

# ================================================= 2 & 3. bitcoin hash compositions --
BASE_X = {"A": Y, "B": Z, "A||B": Y + Z, "B||A": Z + Y,
          "A XOR B": MERGE["Y XOR Z"], "A AND B": MERGE["Y AND Z"], "A OR B": MERGE["Y OR Z"]}
MERGE_X = {k: v for k, v in MERGE.items() if len(v) == 32}  # the new reciprocal outputs
ALL_X = {**BASE_X, **MERGE_X}
FAMILY23 = "bitcoin_hash_compositions"
for name, x in ALL_X.items():
    h160 = hash160(x)
    record_graph(FAMILY23, f"HASH160({name})", h160)
    ds = dsha256(x)
    record_graph(FAMILY23, f"doubleSHA256({name})", ds)

# ===================================================== 4. Tiger / CRC / PKCS#5 -------
FAMILY4T = "tiger_family"
TIGER_INPUTS = {
    "A": Y, "B": Z, "A||B": Y + Z, "B||A": Z + Y,
    "A||NOT(B)": Y + notbytes(Z), "NOT(A)||B": notbytes(Y) + Z,
}
tiger_out = {}
for name, x in TIGER_INPUTS.items():
    t = tiger(x)
    tiger_out[name] = t
    tag = record_graph(FAMILY4T, f"Tiger({name})  [24 bytes, no truncation]", b"")  # log only, 24B not scalar-checked directly
    print(f"  Tiger({name}) = {t.hex()}")
    record_graph(FAMILY4T, f"SHA256(Tiger({name})) [[derived-scalar control]]", sha256(t))

for (n1, n2) in [("A", "B"), ("A||B", "B||A")]:
    t1, t2 = tiger_out[n1], tiger_out[n2]
    for op, fn in [("XOR", lambda a, b: bytes(x ^ y for x, y in zip(a, b))),
                   ("AND", lambda a, b: bytes(x & y for x, y in zip(a, b))),
                   ("OR", lambda a, b: bytes(x | y for x, y in zip(a, b)))]:
        v = fn(t1, t2)
        record_graph(FAMILY4T, f"Tiger({n1}) {op} Tiger({n2}) [[24 bytes]]", b"")
        print(f"  Tiger({n1}) {op} Tiger({n2}) = {v.hex()}")
        record_graph(FAMILY4T, f"SHA256(Tiger({n1}) {op} Tiger({n2})) [[derived-scalar]]", sha256(v))
    record_graph(FAMILY4T, f"SHA256(Tiger({n1})||Tiger({n2})) [[derived-scalar]]", sha256(t1 + t2))
    record_graph(FAMILY4T, f"SHA256(Tiger({n2})||Tiger({n1})) [[derived-scalar]]", sha256(t2 + t1))

CRC_RESULTS = {name: crc32_be(x).hex() for name, x in {"A": Y, "B": Z, "A||B": Y + Z}.items()}
for name, v in CRC_RESULTS.items():
    findings["STRUCTURAL_ONLY"].append({
        "graph": f"[crc32_selector] CRC32({name})", "value_hex": v,
        "note": "CRC-32/ISO-HDLC (zlib default) used as the one universal default; "
                "CrypTool 2's own CRC component default polynomial/init/reflect could "
                "not be confirmed from source in this session (GitHub access here is "
                "scoped to verknode/protogrid only, so CrypTool-2's own repository is "
                "unreachable) -- treated as selector/checksum info only, never as a "
                "private-key candidate on its own."})

PKCS5_STATUS = ("UNRESOLVED: CrypTool 2's PKCS#5 component's exact default salt / "
                "iteration count / digest could not be established -- its own GitHub "
                "source is outside this session's repository scope (verknode/protogrid "
                "only) and no cached copy of CrypTool-2's Pkcs5 component source exists "
                "anywhere in this repository. Per the v145 instructions, no salt/"
                "iteration count was invented and no brute force was run.")
print("PKCS#5:", PKCS5_STATUS)

# ======================================= 5. raw bytes vs ASCII-hex representation ----
A_HEX_LOWER = HALF.hex().encode()
B_HEX_LOWER = BETTER.hex().encode()
A_HEX_UPPER = HALF.hex().upper().encode()   # the one explicit case-control
B_HEX_UPPER = BETTER.hex().upper().encode()  # kept too, for symmetry -- clearly labelled
assert A_HEX_LOWER == b"0423d9115a1dc756d5d08d2de880ab508bd4745fc97709f4fcb513f2cb8fcc35"
assert B_HEX_LOWER == b"48cc46e66bdd36b09ae344552f606a761f9d90681f20dfefe2b43db18b623971"

REPRS = {
    "A_raw": HALF, "B_raw": BETTER,
    "A_hex_lower_ascii": A_HEX_LOWER, "B_hex_lower_ascii": B_HEX_LOWER,
    "A_hex_upper_ascii": A_HEX_UPPER, "B_hex_upper_ascii": B_HEX_UPPER,
}
FAMILY5 = "raw_vs_ascii_representation"
REPR_HASHFUNCS = {"SHA256": sha256, "SHA512": sha512, "MD5": md5,
                   "Tiger": tiger, "RIPEMD160": ripemd160, "Whirlpool": whirlpool}
for rname, rval in REPRS.items():
    for hname, hf in REPR_HASHFUNCS.items():
        out = hf(rval)
        tag = f"{hname}({rname})"
        if len(out) in (32, 20):
            record_graph(FAMILY5, tag, out)
        else:
            record_graph(FAMILY5, tag + " [[no scalar check, wrong size]]", b"")
            if len(out) == 64:  # SHA512/Whirlpool -- no invented truncation
                record_graph(FAMILY5, f"SHA256({tag}) [[derived-scalar control]]", sha256(out))
    record_graph(FAMILY5, f"HASH160({rname}) [direct Bitcoin consumer]", hash160(rval))
    record_graph(FAMILY5, f"doubleSHA256({rname}) [direct Bitcoin consumer]", dsha256(rval))

# ================================================== 6. AES / OpenSSL hard oracle ----
FAMILY6 = "aes_openssl_hard_oracle"
AES_CANDIDATES = {}
for name, x in {**ALL_X, "Tiger(A)": tiger_out["A"], "Tiger(B)": tiger_out["B"]}.items():
    AES_CANDIDATES[f"raw-bytes({name})"] = x
    AES_CANDIDATES[f"SHA256({name})"] = sha256(x)
for rname, rval in REPRS.items():
    AES_CANDIDATES[f"raw-bytes({rname})"] = rval

aes_hits = 0
for cname, pwbytes in AES_CANDIDATES.items():
    for blob in ("salphaseion", "phase322"):
        for digest in ("md5", "sha256"):
            if aes_oracle.check(pwbytes, blob, digest):
                pt = aes_oracle.full(pwbytes, blob, digest)
                p = pt[-1]
                strict = 1 <= p <= 16 and all(c == p for c in pt[-p:])
                body = pt[:-p] if strict else pt
                body_sha = hashlib.sha256(body).digest().hex()
                hit = {"graph": f"[{FAMILY6}] {cname} -> {blob}/{digest}",
                       "pad_len": p, "strict_pkcs7": strict,
                       "plaintext_sha256": body_sha,
                       "matches_known_checkpoint": body_sha == COSMIC_PT_SHA256}
                if strict and p == 16:
                    aes_hits += 1
                    findings["AES_CHECKPOINT_HIT"].append(hit)
                    print("*** AES strict-pad hit ***", hit)
                else:
                    findings["STRUCTURAL_ONLY"].append({
                        "graph": hit["graph"], "note": "chance-level padding (p=%d), not a hard hit" % p})
print(f"AES oracle: {len(AES_CANDIDATES)} candidates x 2 blobs x 2 digests = "
      f"{len(AES_CANDIDATES)*4} decryptions, strict pad=16 hits: {aes_hits}")

# ===================================================== 7. phase-2 table routing -----
FAMILY7 = "phase2_table_routing"
AB = Y + Z  # 64-byte pool, A||B


def route_mirror(table, pool):
    """idx = v if v>=0 else len(pool)+v (signed/mirror position), table cycled to 32 bytes."""
    out = bytearray()
    for i in range(32):
        v = table[i % len(table)]
        idx = v if v >= 0 else (len(pool) + v)
        out.append(pool[idx % len(pool)])
    return bytes(out)


def route_branch_parity(table, a, b):
    """at stream position i, table[i%10] parity picks A or B; |v| mod 32 picks the offset
    within that half. Zero-indexed selection, explicit per-element consumption."""
    out = bytearray()
    for i in range(32):
        v = table[i % len(table)]
        src = a if (v % 2 == 0) else b
        out.append(src[abs(v) % 32])
    return bytes(out)


def route_branch_sign(table, a, b):
    """at stream position i, sign of table[i%10] picks the branch (neg->B, pos/zero->A);
    the value's absolute magnitude mod 32 picks the offset within that branch."""
    out = bytearray()
    for i in range(32):
        v = table[i % len(table)]
        src = b if v < 0 else a
        out.append(src[abs(v) % 32])
    return bytes(out)


ROUTES = {
    "mirror-position over A||B, table cycled x3.2 to 32 bytes": route_mirror(TABLE, AB),
    "parity(table[i%10]) selects A/B branch, |v| mod 32 offset": route_branch_parity(TABLE, Y, Z),
    "sign(table[i%10]) selects A/B branch, |v| mod 32 offset": route_branch_sign(TABLE, Y, Z),
}
for desc, val in ROUTES.items():
    record_graph(FAMILY7, desc, val)
    record_graph(FAMILY7, desc + " [[SHA256-derived control]]", sha256(val))

# ================================================================ output + report ---
report = {
    "half_hex": HALF.hex(), "better_hex": BETTER.hex(), "trail_hex": TRAIL.hex(),
    "table": TABLE,
    "foundation_caveat": (
        "HALF/BETTERHALF/TRAIL are derived from the Cosmic Duality 'plaintext' that "
        "README.md section 31 measures as a padding-accident / statistical-noise "
        "decrypt, not a real solve. This script's own plaintext SHA-256 recomputation "
        "(see below) reproduces the exact published noise-plaintext digest, confirming "
        "it. Everything below was still run, per explicit instruction, as a cheap "
        "just-in-case control."
    ),
    "new_graphs": new_graphs,
    "duplicates_skipped": duplicates_skipped,
    "private_key_hits": len(findings["PRIVATE_KEY_HIT"]),
    "target_hash160_hits": len(findings["TARGET_HASH160_HIT"]),
    "aes_strict_padding_hits": aes_hits,
    "aes_known_checkpoint_hits": sum(1 for h in findings["AES_CHECKPOINT_HIT"] if h["matches_known_checkpoint"]),
    "known_checkpoint_hits": len(findings["KNOWN_32BYTE_CHECKPOINT_HIT"]),
    "errors": errors,
    "findings": findings,
    "pkcs5_status": PKCS5_STATUS,
    "crc_results": CRC_RESULTS,
    "tiger_results": {k: v.hex() for k, v in tiger_out.items()},
    "unverified_extra_targets": UNVERIFIED_EXTRA,
}

if __name__ == "__main__":
    print("\n=== hash primitive self-tests ===")
    all_ok = selftest_hashes()
    print(f"\nall hash self-tests passed: {all_ok}")

    pt = bytes.fromhex(open(
        "/tmp/claude-0/-home-user-protogrid/1efb0940-9144-5574-936b-2deca1dbf4c2/"
        "scratchpad/cosmic_full_plaintext.txt").read().strip())
    actual = hashlib.sha256(pt).hexdigest()
    print(f"\ncosmic-duality noise-plaintext SHA256 recomputed: {actual}")
    print(f"matches README section-31 published value: {actual == COSMIC_PT_SHA256}")

    print("\n=== NEW_GRAPHS / DUPLICATES_SKIPPED ===")
    print("NEW_GRAPHS:", new_graphs)
    print("DUPLICATES_SKIPPED:", duplicates_skipped)
    print("\n=== oracle hit counts ===")
    print("PRIVATE_KEY_HITS:", report["private_key_hits"])
    print("TARGET_HASH160_HITS:", report["target_hash160_hits"])
    print("AES_STRICT_PADDING_HITS:", report["aes_strict_padding_hits"])
    print("AES_KNOWN_CHECKPOINT_HITS:", report["aes_known_checkpoint_hits"])
    print("KNOWN_CHECKPOINT_HITS:", report["known_checkpoint_hits"])
    print("ERRORS:", errors)

    with open("gsmg_cryptool_hash_wiring_patch_v145.json", "w") as f:
        json.dump(report, f, indent=2)
    print("\nwrote gsmg_cryptool_hash_wiring_patch_v145.json")
