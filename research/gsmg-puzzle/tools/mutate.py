import re, sys, itertools
D='/home/user/protogrid/research/gsmg-puzzle/data/'

# ---- base vocabulary ----
base=set()
def B(w):
    w=w.strip()
    if 2<=len(w)<=40 and re.fullmatch(r'[A-Za-z0-9.\'/-]+',w): base.add(w)

# 1. words from every held text
texts=['beaufort_plain.txt','ans227.txt','phase2.txt','seg0.txt','object256.txt']
for f in texts:
    try:
        for w in re.findall(r"[A-Za-z']{3,}", open(D+f).read()): B(w.lower())
    except: pass
p32=open(D+'phase32_plaintext.bin','rb').read()
for w in re.findall(r"[A-Za-z']{3,}", ''.join(chr(b) for b in p32 if 32<=b<127)): B(w.lower())

# 2. Matrix universe + author/theme vocabulary (the puzzle is Matrix + Zeitgeist themed)
THEME="""neo trinity morpheus architect keymaker merovingian oracle cypher smith agent
zion matrix thematrix theone theoracle nebuchadnezzar redpill bluepill whiterabbit
followthewhiterabbit thereisnospoon wakeup unplug construct sentinel machinecity
persephone niobe seraph link tank dozer switch mouse apoc thelastfreecity
jacquefresco thevenusproject venusproject zeitgeist thezeitgeistmovement
resourcebasedeconomy peterjoseph rbe technocracy automation abundance
satoshi satoshinakamoto bitcoin genesis blockchain privatekey seed mnemonic
gsmg gsmgio fivebtc 5btc puzzle causality safenet luna hsm heisenberg
uncertaintyprinciple flowerblossoms theflowerblossoms concretesurface
theseedisplanted seedisplanted salphaseion cosmicduality yinyang yin yang
halfandbetterhalf betterhalf prime primeprogram sixteenfemale sevenmale
matrixsumlist lastwordsbeforearchichoice thispassword ourfirsthintisyourlastcommand
esrever reverse choiceisanillusion choice thechoiceisanillusion
theflowerblossomsthroughwhatseemstobeaconcretesurface""".split()
for w in THEME: B(w)

# 3. multi-word phrases the film/author use, joined
PHRASES=["thereisnospoon","followthewhiterabbit","wakeupneo","thematrixhasyou",
 "knockknockneo","thechoiceisanillusion","onlythechoiceistrue","onefortoneforfourforone",
 "theprivatekeysbelongtohalfandbetterhalf","halfandbetterhalf",
 "iamsorrytotellyou","denialisthemostpredictable","ciaobella","ciaobellao"]
for w in PHRASES: B(w)

base=sorted(base)
sys.stderr.write("base words %d\n"%len(base))

# ---- mutations ----
LEET=str.maketrans("aeiost","4310$7")
DIGITS=[str(i) for i in range(0,10)]+["01","11","15","29","42","123","2019","2021","5btc"]
AFFIX=["giveit","the","gsmg","gsmgio",""]
SUF=["","!","1","123","2019","2021",".","_"]

emitted=set()
def E(s):
    if 3<=len(s)<=60 and s not in emitted:
        emitted.add(s); sys.stdout.write(s+"\n")

for w in base:
    forms=[w, w.lower(), w.upper(), w.capitalize(), w[::-1], w.lower()[::-1]]
    for f in forms: E(f)
    # leet
    E(w.lower().translate(LEET))
    # affixes
    for a in AFFIX:
        if a:
            E(a+w); E(w+a); E((a+w).lower()); E((w+a).lower())
    # doubled
    E(w+w); E((w+w).lower())
    # trailing digits/suffix
    for d in DIGITS: E(w+d); E(w.lower()+d)
    for s in SUF:
        if s: E(w+s)

sys.stderr.write("emitted %d\n"%len(emitted))
