// Cracker for a long "Salted__" blob where the PASSWORD is raw bytes (not text),
// fed to EVP_BytesToKey. This is the construction the community's (accidental) MD5
// result used: a 32-byte value as the password, not an ASCII string.
// stdin: one hex-encoded password per line (any even length). Tries MD5 and SHA256
// derivation. Filter = printable bytes in plaintext block 0.
// usage: rawcrack <blob.b64> <minprintable>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>
#include <openssl/sha.h>
#include <openssl/md5.h>
#include <openssl/aes.h>
static unsigned char salt[8], ct[4096]; static int ctlen;
static unsigned long long tried=0, hit=0; static int MINPR=13;
static void btk(const unsigned char*pw,int n,int md5,unsigned char*key,unsigned char*iv){
  unsigned char d[48],prev[32]; int have=0,plen=0;
  while(have<48){
    if(md5){MD5_CTX c;MD5_Init(&c);if(plen)MD5_Update(&c,prev,plen);
      MD5_Update(&c,pw,n);MD5_Update(&c,salt,8);MD5_Final(prev,&c);plen=16;}
    else{SHA256_CTX c;SHA256_Init(&c);if(plen)SHA256_Update(&c,prev,plen);
      SHA256_Update(&c,pw,n);SHA256_Update(&c,salt,8);SHA256_Final(prev,&c);plen=32;}
    int t=(48-have<plen)?48-have:plen; memcpy(d+have,prev,t); have+=t;}
  memcpy(key,d,32); memcpy(iv,d+32,16);
}
static void check(const unsigned char*pw,int n,int md5,const char*orig){
  unsigned char key[32],iv[16],b0[16],pt0[16],lb[16]; AES_KEY ak;
  btk(pw,n,md5,key,iv); AES_set_decrypt_key(key,256,&ak);
  AES_decrypt(ct,b0,&ak);
  int pr=0; for(int i=0;i<16;i++){pt0[i]=b0[i]^iv[i]; if(pt0[i]>=32&&pt0[i]<127)pr++;}
  tried++;
  if(pr>=MINPR){ hit++;
    AES_decrypt(ct+ctlen-16,b0,&ak);
    for(int i=0;i<16;i++) lb[i]=b0[i]^ct[ctlen-32+i];
    int p=lb[15], pad=(p>=1&&p<=16); for(int i=16-p;pad&&i<16;i++) if(lb[i]!=p) pad=0;
    printf("HIT pr=%d/16 %s pad=%s b0=\"",pr,md5?"md5":"sha256",pad?"ok":"no");
    for(int i=0;i<16;i++) putchar(pt0[i]>=32&&pt0[i]<127?pt0[i]:'.');
    printf("\" pw=%.72s\n",orig); fflush(stdout);
  }
}
int main(int argc,char**argv){
  static const char*A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  FILE*f=fopen(argv[1],"r"); char b64[8192]; int bl=0,c;
  while((c=fgetc(f))!=EOF) if(!isspace(c)) b64[bl++]=c; b64[bl]=0; fclose(f);
  unsigned char raw[6144]; int o=0; unsigned acc=0; int bits=0;
  for(int i=0;i<bl;i++){const char*q=strchr(A,b64[i]); if(!q)continue;
    acc=(acc<<6)|(q-A); bits+=6; if(bits>=8){bits-=8; raw[o++]=(acc>>bits)&0xFF;}}
  memcpy(salt,raw+8,8); ctlen=o-16; memcpy(ct,raw+16,ctlen);
  if(argc>2) MINPR=atoi(argv[2]);
  fprintf(stderr,"blob %d ct bytes, salt ",ctlen);
  for(int i=0;i<8;i++)fprintf(stderr,"%02x",salt[i]); fprintf(stderr,", minpr %d\n",MINPR);
  char line[8192]; unsigned char pw[4096];
  while(fgets(line,sizeof line,stdin)){
    int n=strlen(line); while(n&&isspace((unsigned char)line[n-1]))line[--n]=0;
    if(n<2||n%2) continue;
    int pn=0,ok=1;
    for(int i=0;i<n;i+=2){int hi=line[i],lo=line[i+1];
      #define HX(x) ((x>='0'&&x<='9')?x-'0':(x>='a'&&x<='f')?x-'a'+10:(x>='A'&&x<='F')?x-'A'+10:-1)
      int a=HX(hi),b=HX(lo); if(a<0||b<0){ok=0;break;} pw[pn++]=(a<<4)|b;}
    if(!ok) continue;
    check(pw,pn,1,line);   // MD5 derivation (the community's construction)
    check(pw,pn,0,line);   // SHA256 derivation
  }
  fprintf(stderr,"tried %llu, reported %llu\n",tried,hit);
  return 0;
}
