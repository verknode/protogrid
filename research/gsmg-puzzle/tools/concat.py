import itertools, sys
# the token pool: page tokens, stage answers, theme words the author actually used
TOK=["matrixsumlist","enter","lastwordsbeforearchichoice","thispassword","yourlastcommand",
 "secondanswer","shabef","ourfirsthintisyourlastcommand","theseedisplanted",
 "causality","safenet","luna","hsm","yinyang","yin","yang","hashthetext",
 "jacquefresco","giveit","heisenberg","uncertaintyprinciple","halfandbetterhalf",
 "betterhalf","half","prime","primeprogram","thematrixhasyou","esrever","reverse",
 "theflowerblossomsthroughwhatseemstobeaconcretesurface","choice","thechoiceisanillusion",
 "neo","trinity","architect","keymaker","merovingian","oracle","zion","cosmicduality",
 "salphaseion","onefortoneforfourforone","sixteen","seven","twentythree"]
sys.stderr.write("pool %d\n"%len(TOK))
seen=set()
def E(s):
    if 6<=len(s)<=80 and s not in seen:
        seen.add(s); sys.stdout.write(s+"\n")
# singles + reversed
for a in TOK: E(a); E(a[::-1])
# pairs (ordered) raw and reversed-whole
for a,b in itertools.permutations(TOK,2):
    s=a+b; E(s); E(s[::-1])
# triples (ordered) — sample to keep it bounded: all triples is 45*44*43=85k, fine
for a,b,c in itertools.permutations(TOK,3):
    E(a+b+c)
sys.stderr.write("emitted %d\n"%len(seen))
