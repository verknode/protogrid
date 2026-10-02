#include <stdio.h>
#include <stdint.h>
#include <string.h>
typedef uint64_t uint64;
typedef uint8_t uint8;
typedef unsigned long ulong;
#define IS_BIG_ENDIAN 0
#define G_HOT
#define G_COLD

static void poke_le64(void *p, uint64 v) {
    uint8 *b = (uint8*)p;
    for (int i = 0; i < 8; i++) { b[i] = (uint8)(v & 0xFF); v >>= 8; }
}

#include "tiger_sboxes.h"

#define U64_FROM_2xU32(hi, lo) (((uint64) (hi) << 32) | (lo))
#define t1 (tiger_sboxes)
#define t2 (&tiger_sboxes[256])
#define t3 (&tiger_sboxes[256*2])
#define t4 (&tiger_sboxes[256*3])

#define save_abc aa = a; bb = b; cc = c;
#define round(a,b,c,x,mul) \
      c ^= x; \
      a -= t1[((c)>>(0*8))&0xFF] ^ t2[((c)>>(2*8))&0xFF] ^ \
	   t3[((c)>>(4*8))&0xFF] ^ t4[((c)>>(6*8))&0xFF] ; \
      b += t4[((c)>>(1*8))&0xFF] ^ t3[((c)>>(3*8))&0xFF] ^ \
	   t2[((c)>>(5*8))&0xFF] ^ t1[((c)>>(7*8))&0xFF] ; \
      b *= mul;
#define pass(a,b,c,mul) \
      round(a,b,c,x[0],mul) \
      round(b,c,a,x[1],mul) \
      round(c,a,b,x[2],mul) \
      round(a,b,c,x[3],mul) \
      round(b,c,a,x[4],mul) \
      round(c,a,b,x[5],mul) \
      round(a,b,c,x[6],mul) \
      round(b,c,a,x[7],mul)
#define key_schedule \
      x[0] -= x[7] ^ U64_FROM_2xU32(0xA5A5A5A5UL, 0xA5A5A5A5UL); \
      x[1] ^= x[0]; \
      x[2] += x[1]; \
      x[3] -= x[2] ^ ((~x[1])<<19); \
      x[4] ^= x[3]; \
      x[5] += x[4]; \
      x[6] -= x[5] ^ ((~x[4])>>23); \
      x[7] ^= x[6]; \
      x[0] += x[7]; \
      x[1] -= x[0] ^ ((~x[7])<<19); \
      x[2] ^= x[1]; \
      x[3] += x[2]; \
      x[4] -= x[3] ^ ((~x[2])>>23); \
      x[5] ^= x[4]; \
      x[6] += x[5]; \
      x[7] -= x[6] ^ U64_FROM_2xU32(0x01234567UL,  0x89ABCDEFUL);
#define feedforward a ^= aa; b -= bb; c += cc;
#define PASSES 3
#define compress \
      save_abc \
      pass(a,b,c,5) \
      key_schedule \
      pass(c,a,b,7) \
      key_schedule \
      pass(b,c,a,9) \
      for(pass_no=3; pass_no<PASSES; pass_no++) { \
        key_schedule \
	pass(a,b,c,9) \
	tmpa=a; a=c; c=b; b=tmpa;} \
      feedforward

static void G_HOT
tiger_compress(const uint64 *str, uint64 state[3])
{
  uint64 a, b, c, tmpa;
  uint64 aa, bb, cc;
  uint64 x[8];
  int pass_no, i;
  a = state[0]; b = state[1]; c = state[2];
  for (i = 0; i < 8; i++) x[i] = str[i];
  compress;
  state[0] = a; state[1] = b; state[2] = c;
}

void
tiger(const void *data, uint64 length, char hash[24])
{
  uint64 i, j, res[3];
  const uint8 *data_u8 = data;
  union { uint64 u64[8]; uint8 u8[64]; } temp;

  res[0] = U64_FROM_2xU32(0x01234567UL, 0x89ABCDEFUL);
  res[1] = U64_FROM_2xU32(0xFEDCBA98UL, 0x76543210UL);
  res[2] = U64_FROM_2xU32(0xF096A5B4UL, 0xC3B2E187UL);

  if ((ulong) data & 7) {
    for (i = length; i >= 64; i -= 64) {
      memcpy(temp.u64, data_u8, 64);
      tiger_compress(temp.u64, res);
      data_u8 += 64;
    }
  } else {
    for (i = length; i >= 64; i -= 64) {
      tiger_compress((const uint64*) data_u8, res);
      data_u8 += 64;
    }
  }

  for(j = 0; j < i; j++) temp.u8[j] = data_u8[j];
  temp.u8[j++] = 0x01;
  for (; j & 7; j++) temp.u8[j] = 0;

  if (j > 56) {
    for (; j < 64; j++) temp.u8[j] = 0;
    tiger_compress(temp.u64, res);
    j = 0;
  }
  for (; j < 56; j++) temp.u8[j] = 0;
  temp.u64[7] = length << 3;
  tiger_compress(temp.u64, res);

  for (i = 0; i < 3; i++) poke_le64(&hash[i * 8], res[i]);
}

static void printhex(const char *buf, int n) {
    for (int i = 0; i < n; i++) printf("%02x", (unsigned char)buf[i]);
    printf("\n");
}

int main(void) {
    char h[24];
    tiger("", 0, h);
    printf("tiger('')   = "); printhex(h, 24);
    tiger("abc", 3, h);
    printf("tiger('abc')= "); printhex(h, 24);
    return 0;
}
