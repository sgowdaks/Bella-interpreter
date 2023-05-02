# Bella-interpreter
## Homework 5

```
n:Numeral
i:Identifier
uop: UnaryOp = ! | -
bop: BinaryOp = < | <= | == | != | >= | >
e:Expression=n|i|true|false| uop e| e1 bop e2| ie∗|e ? e1:e2 | [e*] | e[e]
s: Statement = let i = e | func i i* = e | i = e | print e | while e b
b: Blocl = block s*
p = Program = program b  
```


## Denotational semantics

```
E [[n]] m = n 
E [[i]] m = if m(i) = (x, _) then x else ⊥ 
E[[true]]m = 1
E[[false]]m = 0
E [[- e]] m = -E e m
E [[!e]] m = ¬ E e m
E[[e1<e2]]m = Ee1m < Ee2m 
E[[e1≤e2]]m = Ee1m ≤ Ee2m 
E[[e1=e2]]m = Ee1m = Ee2m 
E[[e1!=e2]]m = Ee1m ≠ Ee2m 
E[[e1≥e2]]m = Ee1m ≥ Ee2m
E[[e1>e2]]m = Ee1m > Ee2m 
E[[e1?e2:e3]]m=if Ee1m ≠ 0 then Ee2 m else Ee3 m
E[[e*]]m =  Ee*m 
E[[e1…en]]m = Let xi = Eeim in (x1....xn)

S [[let i e]] (m,o)  = if m(i) ≠ UNDEF then ⊥ else(m[(Eem/i],o)
S [[fun i i* e]] (m,o) = (m[i*, e], o)
S [[i = e]] (m,o) = (m[E[[e]] m/i], o)
S [[print e]] (m,o) = (m, o + Eem)
S [[while e b]] (m,o) = let x = Eem in if x = False then (m, o) else ([[b ]]  (m, o))

B[[b]](m,o) = sn(....s1(m,o)....)
```


