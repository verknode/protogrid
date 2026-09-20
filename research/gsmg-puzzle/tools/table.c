// Phase-2 variable table  # X 2 S H 4 Y 0 Q B 15 #  brute-forced over its unknowns.
// S=32 (Klingon), B=-16 (Intel). X,H,Y in [-LO,HI], Q in {2,3,4}.
// Each rendering is tried raw, as lowercase and uppercase hex sha256 (the creator's
// documented convention), against both 80-byte locks under SHA-256 and MD5.
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <openssl/sha.h>
#include <openssl/md5.h>
#include <openssl/aes.h>

typedef struct { unsigned char salt[8], ct[80]; } Blob;
static Blob blobs[2];
static const char *bnames[2] = {"salphaseion","phase322"};
static unsigned long long tried=0, pad=0, full=0;

static void hx(const unsigned char*d,char*o,int up){
  const char*H = up?"0123456789ABCDEF":"0123456789abcdef";
  for(int i=0;i<32;i++){o[2*i]=H[d[i]>>4];o[2*i+1]=H[d[i]&15];}
  o[64]=0;
}
// EVP_BytesToKey, count 1, 32-byte key + 16-byte iv
static void btk(const unsigned char*pw,int n,const unsigned char*salt,int md5,
                unsigned char*key,unsigned char*iv){
  unsigned char d[48]; int have=0; unsigned char prev[32]; int plen=0;
  while(have<48){
    if(md5){ MD5_CTX c; MD5_Init(&c); if(plen)MD5_Update(&c,prev,plen);
      MD5_Update(&c,pw,n); MD5_Update(&c,salt,8); MD5_Final(prev,&c); plen=16; }
    else { SHA256_CTX c; SHA256_Init(&c); if(plen)SHA256_Update(&c,prev,plen);
      SHA256_Update(&c,pw,n); SHA256_Update(&c,salt,8); SHA256_Final(prev,&c); plen=32; }
    int take = (48-have<plen)?48-have:plen;
    memcpy(d+have,prev,take); have+=take;
  }
  memcpy(key,d,32); memcpy(iv,d+32,16);
}
static int try_pw(const unsigned char*pw,int n,int bi,int md5,const char*tag){
  unsigned char key[32],iv[16],out[16],last[16]; AES_KEY ak;
  Blob*b=&blobs[bi];
  btk(pw,n,b->salt,md5,key,iv);
  AES_set_decrypt_key(key,256,&ak);
  AES_decrypt(b->ct+64,out,&ak);
  for(int i=0;i<16;i++) last[i]=out[i]^b->ct[48+i];
  tried++;
  int p=last[15];
  if(p<1||p>16) return 0;
  for(int i=16-p;i<16;i++) if(last[i]!=p) return 0;
  pad++;
  if(p==16){ full++;
    printf("FULL PAD BLOCK %s %s pw=%.*s\n",bnames[bi],md5?"md5":"sha256",n,pw);
    fflush(stdout); }
  return 1;
}
int main(int argc,char**argv){
  const char*B64[2]={
   "U2FsdGVkX186tYU0hVJBXXUnBUO7C0+X4KUWnWkCvoZSxbRD3wNsGWVHefvdrd9zQvX0t8v3jPB4okpspxebRi6sE1BMl5HI8Rku+KejUqTvdWOX6nQjSpepXwGuN/jJ",
   "U2FsdGVkX1+0Wl49gnWTyiimluu7V3+vl7st0gUt9sWDzNLxDmlPMsDSiuW2a46zgKlIi8aaqY5gpJPPEzW1n9n3/26qs4zstWtPKF8Zs/BTNN4IiEh4qu18mdC0NAv4"};
  static const char*A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for(int k=0;k<2;k++){
    unsigned char raw[96]; int o=0; unsigned int acc=0; int bits=0;
    for(const char*p=B64[k];*p;p++){ const char*q=strchr(A,*p); if(!q)continue;
      acc=(acc<<6)|(q-A); bits+=6; if(bits>=8){bits-=8; raw[o++]=(acc>>bits)&0xFF;} }
    memcpy(blobs[k].salt,raw+8,8); memcpy(blobs[k].ct,raw+16,80);
  }
  int LO=atoi(argv[1]), HI=atoi(argv[2]);
  int XLO=(argc>4)?atoi(argv[3]):LO, XHI=(argc>4)?atoi(argv[4]):HI;
  char buf[256], hlo[65], hup[65]; unsigned char dg[32];
  int QS[3]={2,3,4};
  for(int x=XLO;x<=XHI;x++) for(int h=LO;h<=HI;h++) for(int y=LO;y<=HI;y++)
  for(int qi=0;qi<3;qi++){
    int q=QS[qi];
    int seq[10]={x,2,32,h,4,y,0,q,-16,15};
    char joined[128]={0}, absj[128]={0}, spaced[160]={0}, rev[128]={0}, arev[128]={0};
    for(int i=0;i<10;i++){
      sprintf(joined+strlen(joined),"%d",seq[i]);
      sprintf(absj  +strlen(absj),  "%d",seq[i]<0?-seq[i]:seq[i]);
      sprintf(spaced+strlen(spaced),i?" %d":"%d",seq[i]);
      sprintf(rev   +strlen(rev),   "%d",seq[9-i]);
      sprintf(arev  +strlen(arev),  "%d",seq[9-i]<0?-seq[9-i]:seq[9-i]);
    }
    char hashed[128]; strcpy(hashed,joined);
    for(int i=0,j=strlen(joined)-1;i<j;i++,j--){char t=hashed[i];hashed[i]=hashed[j];hashed[j]=t;}
    const char*rend[7]={joined,absj,spaced,rev,arev,hashed,NULL};
    char withhash[160]; snprintf(withhash,sizeof withhash,"#%s#",joined);
    rend[6]=withhash;
    for(int r=0;r<7;r++){
      const char*s=rend[r]; int n=strlen(s);
      SHA256((const unsigned char*)s,n,dg); hx(dg,hlo,0); hx(dg,hup,1);
      for(int bi=0;bi<2;bi++) for(int md5=0;md5<2;md5++){
        try_pw((const unsigned char*)s,n,bi,md5,"raw");
        try_pw((const unsigned char*)hlo,64,bi,md5,"shalo");
        try_pw((const unsigned char*)hup,64,bi,md5,"shaup");
      }
    }
  }
  fprintf(stderr,"range [%d,%d]  decryptions %llu  padding-valid %llu (%.3f%%, chance 0.391%%)  full pad block %llu\n",
          LO,HI,tried,pad,100.0*pad/tried,full);
  return 0;
}
