// Brainwallet / raw-key address checker for the GSMG planted addresses.
// stdin: one candidate phrase per line. Modes are applied to every line:
//   key = sha256(phrase), sha256(lowercase), sha256(uppercase),
//         raw phrase left-padded to 32 bytes, raw phrase right-padded to 32 bytes,
//         and the bit-reversal of each of those.
// Prints a line only on a hash160 match against the target set.
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>
#include <openssl/sha.h>
#include <openssl/ripemd.h>
#include <openssl/ec.h>
#include <openssl/bn.h>
#include <openssl/obj_mac.h>

#define NT 64
static unsigned char targets[NT][20]; static char tstr[NT][64]; static int ntarget=0;
static EC_GROUP *grp; static BN_CTX *ctx;
static unsigned long long tried=0;

static int b58dec(const char*s, unsigned char*out, int outlen){
  static const char*A="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  BIGNUM*n=BN_new(); BN_zero(n); BIGNUM*b=BN_new(); BN_set_word(b,58);
  for(const char*p=s;*p;p++){ const char*q=strchr(A,*p); if(!q){BN_free(n);BN_free(b);return 0;}
    BN_mul(n,n,b,ctx); BIGNUM*d=BN_new(); BN_set_word(d,(unsigned long)(q-A)); BN_add(n,n,d); BN_free(d); }
  int len=BN_num_bytes(n); if(len>outlen){BN_free(n);BN_free(b);return 0;}
  memset(out,0,outlen); BN_bn2bin(n,out+outlen-len); BN_free(n); BN_free(b); return 1;
}

static void h160(const unsigned char*d,int n,unsigned char*o){
  unsigned char s[32]; SHA256(d,n,s); RIPEMD160(s,32,o);
}

static void check_key(const unsigned char*kb, const char*tag){
  BIGNUM*k=BN_bin2bn(kb,32,NULL);
  if(BN_is_zero(k)){BN_free(k);return;}
  EC_POINT*P=EC_POINT_new(grp);
  if(EC_POINT_mul(grp,P,k,NULL,NULL,ctx)){
    unsigned char pub[65]; unsigned char hh[20];
    size_t l=EC_POINT_point2oct(grp,P,POINT_CONVERSION_UNCOMPRESSED,pub,65,ctx);
    if(l==65){ h160(pub,65,hh);
      for(int i=0;i<ntarget;i++) if(!memcmp(hh,targets[i],20)){
        printf("MATCH uncompressed %s %s key=",tstr[i],tag);
        for(int j=0;j<32;j++)printf("%02x",kb[j]); printf("\n"); fflush(stdout);} }
    l=EC_POINT_point2oct(grp,P,POINT_CONVERSION_COMPRESSED,pub,33,ctx);
    if(l==33){ h160(pub,33,hh);
      for(int i=0;i<ntarget;i++) if(!memcmp(hh,targets[i],20)){
        printf("MATCH compressed %s %s key=",tstr[i],tag);
        for(int j=0;j<32;j++)printf("%02x",kb[j]); printf("\n"); fflush(stdout);} }
  }
  EC_POINT_free(P); BN_free(k); tried++;
}

static unsigned char revbits(unsigned char b){
  b=(b&0xF0)>>4|(b&0x0F)<<4; b=(b&0xCC)>>2|(b&0x33)<<2; b=(b&0xAA)>>1|(b&0x55)<<1; return b;
}
static void bitrev32(const unsigned char*in,unsigned char*out){
  for(int i=0;i<32;i++) out[i]=revbits(in[31-i]);
}

int main(int argc,char**argv){
  ctx=BN_CTX_new(); grp=EC_GROUP_new_by_curve_name(NID_secp256k1);
  EC_GROUP_precompute_mult(grp,ctx);
  FILE*tf=fopen(argv[1],"r"); char line[256];
  while(fgets(line,sizeof line,tf)){
    char*p=strtok(line," \t\r\n"); if(!p||!*p) continue;
    unsigned char raw[25]; if(!b58dec(p,raw,25)) continue;
    memcpy(targets[ntarget],raw+1,20); strncpy(tstr[ntarget],p,63); ntarget++;
    if(ntarget>=NT) break;
  }
  fclose(tf);
  fprintf(stderr,"targets: %d\n",ntarget);
  unsigned char kb[32],rb[32]; char buf[4096], lo[4096], up[4096];
  while(fgets(buf,sizeof buf,stdin)){
    int n=strlen(buf); while(n&&(buf[n-1]=='\n'||buf[n-1]=='\r'))buf[--n]=0;
    if(!n) continue;
    for(int i=0;i<=n;i++){lo[i]=tolower((unsigned char)buf[i]); up[i]=toupper((unsigned char)buf[i]);}
    SHA256((unsigned char*)buf,n,kb); check_key(kb,"sha"); bitrev32(kb,rb); check_key(rb,"sha.rev");
    if(strcmp(lo,buf)){SHA256((unsigned char*)lo,n,kb); check_key(kb,"shalo");}
    if(strcmp(up,buf)){SHA256((unsigned char*)up,n,kb); check_key(kb,"shaup");}
    if(n==64){ int ok=1; unsigned char hk[32];
      for(int i=0;i<64;i++){char c=buf[i]; int v; if(c>='0'&&c<='9')v=c-'0'; else if(c>='a'&&c<='f')v=c-'a'+10; else if(c>='A'&&c<='F')v=c-'A'+10; else {ok=0;break;} if(i%2==0)hk[i/2]=v<<4; else hk[i/2]|=v;}
      if(ok){check_key(hk,"hexraw"); bitrev32(hk,rb); check_key(rb,"hexraw.rev");} }
    if(n<=32){
      memset(kb,0,32); memcpy(kb+32-n,buf,n); check_key(kb,"rpad"); bitrev32(kb,rb); check_key(rb,"rpad.rev");
      memset(kb,0,32); memcpy(kb,buf,n); check_key(kb,"lpad"); bitrev32(kb,rb); check_key(rb,"lpad.rev");
    }
  }
  fprintf(stderr,"keys tried: %llu\n",tried);
  return 0;
}
