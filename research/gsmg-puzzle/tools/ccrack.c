// Password cracker for a long OpenSSL "Salted__" blob.
// Filter is the FIRST plaintext block, not the padding: for a text plaintext it is
// printable ASCII, which costs one AES op and rejects ~2^-23 of wrong keys, against
// 1/256 for a padding test. Padding is reported as a secondary signal only.
//
// usage: ccrack <blob.b64> <minprintable>      candidates on stdin, one per line
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>
#include <openssl/sha.h>
#include <openssl/md5.h>
#include <openssl/aes.h>

static unsigned char salt[8], ct[4096]; static int ctlen;
static unsigned long long tried=0, hit=0;
static int MINPR=12;

static void hx(const unsigned char*d,char*o,int up){
  const char*H=up?"0123456789ABCDEF":"0123456789abcdef";
  for(int i=0;i<32;i++){o[2*i]=H[d[i]>>4];o[2*i+1]=H[d[i]&15];}
  o[64]=0;
}
static void btk(const unsigned char*pw,int n,int md5,unsigned char*key,unsigned char*iv){
  unsigned char d[48],prev[32]; int have=0,plen=0;
  while(have<48){
    if(md5){MD5_CTX c;MD5_Init(&c);if(plen)MD5_Update(&c,prev,plen);
      MD5_Update(&c,pw,n);MD5_Update(&c,salt,8);MD5_Final(prev,&c);plen=16;}
    else{SHA256_CTX c;SHA256_Init(&c);if(plen)SHA256_Update(&c,prev,plen);
      SHA256_Update(&c,pw,n);SHA256_Update(&c,salt,8);SHA256_Final(prev,&c);plen=32;}
    int t=(48-have<plen)?48-have:plen; memcpy(d+have,prev,t); have+=t;
  }
  memcpy(key,d,32); memcpy(iv,d+32,16);
}
static void check(const unsigned char*pw,int n,int md5,const char*tag,const char*orig){
  unsigned char key[32],iv[16],b0[16],pt0[16],lb[16]; AES_KEY ak;
  btk(pw,n,md5,key,iv);
  AES_set_decrypt_key(key,256,&ak);
  AES_decrypt(ct,b0,&ak);
  int pr=0;
  for(int i=0;i<16;i++){pt0[i]=b0[i]^iv[i]; if(pt0[i]>=32&&pt0[i]<127)pr++;}
  tried++;
  if(pr>=MINPR){
    hit++;
    AES_decrypt(ct+ctlen-16,b0,&ak);
    for(int i=0;i<16;i++) lb[i]=b0[i]^ct[ctlen-32+i];
    int p=lb[15], padok=(p>=1&&p<=16);
    for(int i=16-p;padok&&i<16;i++) if(lb[i]!=p) padok=0;
    printf("HIT pr=%d/16 %s %s pad=%s block0=\"",pr,md5?"md5":"sha256",tag,padok?"ok":"no");
    for(int i=0;i<16;i++) putchar(pt0[i]>=32&&pt0[i]<127?pt0[i]:'.');
    printf("\"  pw=%.60s\n",orig); fflush(stdout);
  }
}
int main(int argc,char**argv){
  static const char*A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  FILE*f=fopen(argv[1],"r"); char b64[8192]; int bl=0,c;
  while((c=fgetc(f))!=EOF) if(!isspace(c)) b64[bl++]=c;
  b64[bl]=0; fclose(f);
  unsigned char raw[6144]; int o=0; unsigned acc=0; int bits=0;
  for(int i=0;i<bl;i++){const char*q=strchr(A,b64[i]); if(!q)continue;
    acc=(acc<<6)|(q-A); bits+=6; if(bits>=8){bits-=8; raw[o++]=(acc>>bits)&0xFF;}}
  memcpy(salt,raw+8,8); ctlen=o-16; memcpy(ct,raw+16,ctlen);
  if(argc>2) MINPR=atoi(argv[2]);
  fprintf(stderr,"blob: %d ct bytes, salt ",ctlen);
  for(int i=0;i<8;i++)fprintf(stderr,"%02x",salt[i]);
  fprintf(stderr,", minprintable %d\n",MINPR);
  char line[4096],hlo[65],hup[65]; unsigned char dg[32];
  while(fgets(line,sizeof line,stdin)){
    int n=strlen(line); while(n&&(line[n-1]=='\n'||line[n-1]=='\r'))line[--n]=0;
    if(!n) continue;
    SHA256((unsigned char*)line,n,dg); hx(dg,hlo,0); hx(dg,hup,1);
    for(int m=0;m<2;m++){
      check((unsigned char*)line,n,m,"raw",line);
      check((unsigned char*)hlo,64,m,"shalo",line);
      check((unsigned char*)hup,64,m,"shaup",line);
    }
  }
  fprintf(stderr,"tried %llu, reported %llu\n",tried,hit);
  return 0;
}
