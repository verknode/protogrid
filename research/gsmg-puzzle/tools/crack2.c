// Enumerate all substrings of each corpus line, test as AES password candidates (4 derivation modes)
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <openssl/sha.h>
#include <openssl/aes.h>

static unsigned char salt[8], ct[80]; static int ctlen;
static unsigned long long tried=0, padhits=0; static int minpr=85;
static const char*HL="0123456789abcdef";
static const char*HU="0123456789ABCDEF";
static void hx(const unsigned char*d,char*o,int up){const char*H=up?HU:HL;for(int i=0;i<32;i++){o[2*i]=H[d[i]>>4];o[2*i+1]=H[d[i]&15];}o[64]=0;}

static void btk(const unsigned char*pw,int pwl,unsigned char*key,unsigned char*iv){
  unsigned char d1[32],d2[32]; SHA256_CTX c;
  SHA256_Init(&c);SHA256_Update(&c,pw,pwl);SHA256_Update(&c,salt,8);SHA256_Final(d1,&c);
  SHA256_Init(&c);SHA256_Update(&c,d1,32);SHA256_Update(&c,pw,pwl);SHA256_Update(&c,salt,8);SHA256_Final(d2,&c);
  memcpy(key,d1,32);memcpy(iv,d2,16);
}
static void tryit(const unsigned char*pw,int pwl,const char*phrase,int plen,int mode){
  unsigned char key[32],iv[16],last[16],plain[128]; AES_KEY ak;
  btk(pw,pwl,key,iv); AES_set_decrypt_key(key,256,&ak);
  AES_decrypt(ct+ctlen-16,last,&ak);
  for(int i=0;i<16;i++) last[i]^=ct[ctlen-32+i];
  tried++;
  int p=last[15]; if(p<1||p>16) return;
  for(int i=0;i<p;i++) if(last[15-i]!=p) return;
  padhits++;
  unsigned char prev[16]; memcpy(prev,iv,16);
  for(int b=0;b<ctlen;b+=16){AES_decrypt(ct+b,plain+b,&ak);for(int i=0;i<16;i++)plain[b+i]^=prev[i];memcpy(prev,ct+b,16);}
  int pl=ctlen-p,pr=0; for(int i=0;i<pl;i++) if(plain[i]>=32&&plain[i]<127)pr++;
  if(pl==0||pr*100/pl<minpr) return;
  printf("HIT mode=%d printable=%d/%d phrase=[%.*s] plain=",mode,pr,pl,plen,phrase);
  for(int i=0;i<pl;i++) putchar(plain[i]>=32&&plain[i]<127?plain[i]:'.');
  printf("\n"); fflush(stdout);
}
int main(int argc,char**argv){
  if(argc<6){fprintf(stderr,"usage: crack2 <salthex> <cthex> <corpus> <maxlen> <minprintable%%>\n");return 1;}
  for(int i=0;i<8;i++){unsigned v;sscanf(argv[1]+2*i,"%2x",&v);salt[i]=v;}
  ctlen=strlen(argv[2])/2;
  for(int i=0;i<ctlen;i++){unsigned v;sscanf(argv[2]+2*i,"%2x",&v);ct[i]=v;}
  int maxlen=atoi(argv[4]); minpr=atoi(argv[5]);
  FILE*fp=fopen(argv[3],"r"); if(!fp){perror("corpus");return 1;}
  static char line[1<<20]; unsigned char h[32],h2[32]; char hex1[65],hex2[65];
  while(fgets(line,sizeof line,fp)){
    int L=strlen(line); while(L>0&&(line[L-1]=='\n'||line[L-1]=='\r'))line[--L]=0;
    for(int i=0;i<L;i++){
      int mx = L-i; if(mx>maxlen) mx=maxlen;
      for(int n=1;n<=mx;n++){
        const char*sub=line+i;
        SHA256((unsigned char*)sub,n,h); hx(h,hex1,0);
        tryit((unsigned char*)hex1,64,sub,n,0);
        tryit((unsigned char*)sub,n,sub,n,1);
        hx(h,hex2,1); tryit((unsigned char*)hex2,64,sub,n,2);
        SHA256((unsigned char*)hex1,64,h2); hx(h2,hex2,0); tryit((unsigned char*)hex2,64,sub,n,3);
      }
    }
  }
  fprintf(stderr,"tried=%llu padhits=%llu\n",tried,padhits);
  return 0;
}
