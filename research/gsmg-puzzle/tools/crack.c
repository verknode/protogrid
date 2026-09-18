// GSMG salphaseion / phase3.2.2 candidate password tester
// Reads candidate PHRASES on stdin (one per line).
// Modes: 0 = password is lowercase hex sha256(phrase); 1 = password is phrase itself;
//        2 = password is uppercase hex sha256(phrase); 3 = password is hex sha256(hex sha256(phrase))
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <openssl/evp.h>
#include <openssl/sha.h>
#include <openssl/aes.h>

static unsigned char salt[8], ct[80];
static int ctlen;
static int mode = 0;
static unsigned long long tried = 0, padhits = 0;

static void hexlo(const unsigned char*d,int n,char*out,int up){
  const char*H = up? "0123456789ABCDEF":"0123456789abcdef";
  for(int i=0;i<n;i++){out[2*i]=H[d[i]>>4];out[2*i+1]=H[d[i]&15];}
  out[2*n]=0;
}

// EVP_BytesToKey with sha256, count=1, for 32-byte key + 16-byte iv
static void btk(const unsigned char*pw,int pwl,unsigned char*key,unsigned char*iv){
  unsigned char d1[32],d2[32];
  SHA256_CTX c;
  SHA256_Init(&c); SHA256_Update(&c,pw,pwl); SHA256_Update(&c,salt,8); SHA256_Final(d1,&c);
  SHA256_Init(&c); SHA256_Update(&c,d1,32); SHA256_Update(&c,pw,pwl); SHA256_Update(&c,salt,8); SHA256_Final(d2,&c);
  memcpy(key,d1,32); memcpy(iv,d2,16);
}

int main(int argc,char**argv){
  if(argc<4){fprintf(stderr,"usage: crack <salthex> <cthex> <mode>\n");return 1;}
  for(int i=0;i<8;i++){unsigned v;sscanf(argv[1]+2*i,"%2x",&v);salt[i]=v;}
  int n=strlen(argv[2])/2; ctlen=n;
  for(int i=0;i<n;i++){unsigned v;sscanf(argv[2]+2*i,"%2x",&v);ct[i]=v;}
  mode=atoi(argv[3]);
  char line[4096], pwbuf[256];
  unsigned char key[32],iv[16],h[32],h2[32],last[16],plain[128];
  AES_KEY ak;
  while(fgets(line,sizeof line,stdin)){
    int L=strlen(line); while(L>0&&(line[L-1]=='\n'||line[L-1]=='\r'))line[--L]=0;
    if(L==0) continue;
    const unsigned char*pw; int pwl;
    if(mode==1){ pw=(unsigned char*)line; pwl=L; }
    else if(mode==3){ SHA256((unsigned char*)line,L,h); hexlo(h,32,pwbuf,0);
                      SHA256((unsigned char*)pwbuf,64,h2); hexlo(h2,32,pwbuf,0);
                      pw=(unsigned char*)pwbuf; pwl=64; }
    else { SHA256((unsigned char*)line,L,h); hexlo(h,32,pwbuf,mode==2); pw=(unsigned char*)pwbuf; pwl=64; }
    btk(pw,pwl,key,iv);
    AES_set_decrypt_key(key,256,&ak);
    // decrypt only final block
    AES_decrypt(ct+ctlen-16,last,&ak);
    for(int i=0;i<16;i++) last[i]^=ct[ctlen-32+i];
    tried++;
    int p=last[15];
    if(p<1||p>16) continue;
    int ok=1; for(int i=0;i<p;i++) if(last[15-i]!=p){ok=0;break;}
    if(!ok) continue;
    padhits++;
    // full decrypt
    unsigned char prev[16]; memcpy(prev,iv,16);
    for(int b=0;b<ctlen;b+=16){
      AES_decrypt(ct+b,plain+b,&ak);
      for(int i=0;i<16;i++) plain[b+i]^=prev[i];
      memcpy(prev,ct+b,16);
    }
    int pl=ctlen-p, pr=0;
    for(int i=0;i<pl;i++) if(plain[i]>=32&&plain[i]<127) pr++;
    printf("PADHIT mode=%d phrase=%s pw=%s printable=%d/%d plain=",mode,line,(mode==1?line:pwbuf),pr,pl);
    for(int i=0;i<pl;i++) putchar(plain[i]>=32&&plain[i]<127?plain[i]:'.');
    printf("\n"); fflush(stdout);
  }
  fprintf(stderr,"tried=%llu padhits=%llu\n",tried,padhits);
  return 0;
}
