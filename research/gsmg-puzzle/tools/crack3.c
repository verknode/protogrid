// XOR-of-sha256(token) subset space -> hex string -> AES password (raw + sha256'd)
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <openssl/sha.h>
#include <openssl/aes.h>
static unsigned char salt[8],ct[80]; static int ctlen,minpr;
static unsigned long long tried=0,padhits=0;
static void hx(const unsigned char*d,char*o){const char*H="0123456789abcdef";for(int i=0;i<32;i++){o[2*i]=H[d[i]>>4];o[2*i+1]=H[d[i]&15];}o[64]=0;}
static void btk(const unsigned char*pw,int pwl,unsigned char*k,unsigned char*iv){
  unsigned char d1[32],d2[32];SHA256_CTX c;
  SHA256_Init(&c);SHA256_Update(&c,pw,pwl);SHA256_Update(&c,salt,8);SHA256_Final(d1,&c);
  SHA256_Init(&c);SHA256_Update(&c,d1,32);SHA256_Update(&c,pw,pwl);SHA256_Update(&c,salt,8);SHA256_Final(d2,&c);
  memcpy(k,d1,32);memcpy(iv,d2,16);}
static void tryit(const unsigned char*pw,int pwl,unsigned long long mask,int mode){
  unsigned char key[32],iv[16],last[16],plain[128];AES_KEY ak;
  btk(pw,pwl,key,iv);AES_set_decrypt_key(key,256,&ak);
  AES_decrypt(ct+ctlen-16,last,&ak);
  for(int i=0;i<16;i++)last[i]^=ct[ctlen-32+i];
  tried++;int p=last[15];if(p<1||p>16)return;
  for(int i=0;i<p;i++)if(last[15-i]!=p)return;
  padhits++;
  unsigned char prev[16];memcpy(prev,iv,16);
  for(int b=0;b<ctlen;b+=16){AES_decrypt(ct+b,plain+b,&ak);for(int i=0;i<16;i++)plain[b+i]^=prev[i];memcpy(prev,ct+b,16);}
  int pl=ctlen-p,pr=0;for(int i=0;i<pl;i++)if(plain[i]>=32&&plain[i]<127)pr++;
  if(pl==0||pr*100/pl<minpr)return;
  printf("HIT mode=%d mask=0x%llx pw=%.*s printable=%d/%d plain=",mode,mask,pwl,pw,pr,pl);
  for(int i=0;i<pl;i++)putchar(plain[i]>=32&&plain[i]<127?plain[i]:'.');
  printf("\n");fflush(stdout);}
int main(int argc,char**argv){
  if(argc<6){fprintf(stderr,"usage: crack3 <salt> <ct> <tokens> <minpr> <maxtokens>\n");return 1;}
  for(int i=0;i<8;i++){unsigned v;sscanf(argv[1]+2*i,"%2x",&v);salt[i]=v;}
  ctlen=strlen(argv[2])/2;
  for(int i=0;i<ctlen;i++){unsigned v;sscanf(argv[2]+2*i,"%2x",&v);ct[i]=v;}
  minpr=atoi(argv[4]);
  FILE*f=fopen(argv[3],"r");char line[512];
  static unsigned char dg[32][32];int n=0;
  while(fgets(line,sizeof line,f)&&n<32){int L=strlen(line);while(L>0&&(line[L-1]=='\n'||line[L-1]=='\r'))line[--L]=0;
    if(!L)continue;SHA256((unsigned char*)line,L,dg[n]);n++;}
  fclose(f);
  int mx=atoi(argv[5]); if(n>mx)n=mx;
  fprintf(stderr,"tokens=%d subsets=%llu\n",n,1ULL<<n);
  unsigned char acc[32];char hex[65],hex2[65];unsigned char h2[32];
  for(unsigned long long m=1;m<(1ULL<<n);m++){
    memset(acc,0,32);
    for(int i=0;i<n;i++) if(m>>i&1) for(int j=0;j<32;j++) acc[j]^=dg[i][j];
    hx(acc,hex);
    tryit((unsigned char*)hex,64,m,1);
    SHA256((unsigned char*)hex,64,h2);hx(h2,hex2);
    tryit((unsigned char*)hex2,64,m,0);
    tryit(acc,32,m,2);          // raw 32 bytes as password
  }
  fprintf(stderr,"tried=%llu padhits=%llu\n",tried,padhits);return 0;}
