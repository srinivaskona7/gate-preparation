# Lexical analysis: derivations

## Longest match, then rule order: the scanner is well defined and one DFA implements it
<!-- topics: cd-lexical-analysis.maximal-munch, cd-lexical-analysis.lexer-role, cd-lexical-analysis.lex-flex -->

**Claim.** Let the token rules be $p_1, \dots, p_m$ in specification order, each a regular expression, and let $s$ be the input with the lexer at position $i$. Define the candidate set $M_i = \{(j, k) : s[i..j) \in L(p_k),\ j > i\}$. If $M_i$ is nonempty, the lexer emits the pair with the largest $j$, and among pairs with that $j$ the smallest $k$; this pair is unique. If $M_i$ is empty the input has a lexical error at $i$. A single DFA built from the union of the patterns, whose accepting states are labelled with the lowest-numbered rule they accept, finds this pair in one forward scan that stops at the dead state.

**Proof.** Uniqueness: $M_i$ is finite because $j \le \lvert s \rvert$, so a largest $j$ exists, and the set of rules matching exactly $s[i..j)$ is a nonempty finite set of integers with a least element. Longest match is applied first, so a rule listed early never wins against a longer match by a later rule.

Construction: join the NFAs $N(p_1), \dots, N(p_m)$ under a new start state with an ε-edge to each start, and tag each accepting NFA state with its rule number. Apply the subset construction. A DFA state $S$ is a set of NFA states; it is accepting if it contains a tagged state, and its label is the least tag in $S$. After reading $x = s[i..j)$ the DFA is in the set of NFA states reachable on $x$ (subset construction section), so $S$ contains an accepting state of $N(p_k)$ exactly when $x \in L(p_k)$, and its label is the least such $k$.

Scan invariant: the scanner keeps $(\mathit{last}, \mathit{rule})$, the longest accepted prefix seen so far and its label. After reading $s[i..j)$ the invariant is that $\mathit{last}$ is the largest $j' \le j$ with $s[i..j')$ accepted by some rule, and $\mathit{rule}$ is the least rule accepting $s[i..\mathit{last})$. Reading one more character updates the pair exactly when the new state is accepting, which preserves the invariant. The scan stops when the DFA enters the dead state $\varnothing$: then no extension of $s[i..j)$ is a prefix of any pattern string, so no $(j', k)$ with $j' > j$ lies in $M_i$, and the stored pair is the answer. The scanner then retracts its forward pointer to $\mathit{last}$. If the dead state comes before any accepting state, $M_i$ is empty.

Lex and Flex implement this rule: the patterns of the `%%`-delimited rules section are compiled into one DFA table, `yylex()` runs the scan above, `yytext` and `yyleng` hold $s[i..\mathit{last})$ and its length, and an action that does not `return` (whitespace) makes `yylex()` start the next scan at once. Keywords before the identifier rule therefore win only on a tie. The alternative of matching only the identifier rule and looking the lexeme up in a table of reserved words gives the same output.

**GATE use.** Questions give a short rule list and an input and ask for the token sequence, or ask whether while1 is a keyword. The trap is applying rule order first: the first rule that matches anything is not the winner unless no later rule matches longer.

**Check.** With rules KW = int | while | if, then ID = [A-Za-z_][A-Za-z0-9_]*, a script returned while1 as one ID (6 characters against KW's 5), while alone as KW (a tie of 5, broken by order) and ifx as ID. With $T_1 = a(b|c)^*$, $T_2 = (a|b)^*c$, $T_3 = c^+b$ on aabcbcca, the longest matches are aabc ($T_2$; $T_1$ reaches only a), bc ($T_2$), c ($T_2$) and a ($T_1$), giving $T_2\,T_2\,T_2\,T_1$. Taking the shortest match instead gave the six tokens $T_1\,T_1\,T_2\,T_2\,T_2\,T_1$.

## Counting tokens in a fragment
<!-- topics: cd-lexical-analysis.token-counting, cd-lexical-analysis.tokens-lexemes-patterns -->

**Claim.** For a C fragment, the number of tokens equals the number of lexemes in the maximal-munch partition of the input, minus those matched by discarded rules (whitespace and comments). In particular a string literal is exactly one token whatever it contains, and a multi-character operator such as ++, >= or && is one token.

**Proof.** The partition is unique: by the previous section each step picks one lexeme deterministically, and the next step starts where it ends. A new token can begin only at a lexeme boundary, so nothing inside a lexeme can become a token of its own.

For string literals take the C-style pattern `"([^"\\\n]|\\.)*"`. Starting at an opening quote, a match must end at a quote that is not consumed by an escape, and every character between the quotes is either an ordinary non-quote character or an escape pair. The longest match therefore runs to the first unescaped closing quote: a longer prefix would contain that quote as an interior character, which the pattern forbids, and a shorter one does not end in a quote. No other rule matches a string starting with a quote, so the whole literal, spaces, commas and % signs included, is the lexeme. For operators, the operator rule matches ++ at length 2 and + at length 1, so longest match takes ++. Whitespace and comments are matched by rules whose action returns nothing, so they consume characters without producing a token.

Each lexeme carries a token name; identifiers and numbers also carry an attribute (a symbol-table pointer or the value). In count = 100 the lexemes are count, = and 100, with token names IDENTIFIER, ASSIGN and NUMBER, and IDENTIFIER's pattern is letter(letter | digit)*.

**GATE use.** The 1-mark NAT "how many tokens in this statement" is the standard question. Delete comments and whitespace, then munch left to right. The traps are splitting a string literal at its spaces or format specifier, counting ++ as two tokens, and forgetting punctuation: parentheses, commas and the final semicolon each count.

**Check.** A maximal-munch tokenizer with C-like rules produced 5 tokens for `int x = 5;`, 6 for `if(x>0)`, and 10 for `printf("sum = %d\n", a+++b);`: printf, (, the literal, the comma, a, ++, +, b, ) and ;. It produced 4 for `a /* c */ += b;`, where the comment yields nothing and += is one token.

## Maximal munch is greedy: it can reject a valid split and can cost quadratic time
<!-- topics: cd-lexical-analysis.maximal-munch -->

**Claim.** (1) A maximal-munch scanner never revisits a token boundary, so it can fail on an input that has a valid tokenization. In C, x+++++y is scanned as x ++ ++ + y, although x ++ + ++ y is also a split into valid tokens and parses legally. (2) With a DFA scanner of the previous section, scanning an input of length $n$ costs at most $n(n+1)/2$ character reads, and the bound is attained: rules $T_1 = a$, $T_2 = a^*b$ on input $a^n$ cost exactly $n(n+1)/2$ reads.

**Proof.** (1) At the first +, the operator rule matches ++ (length 2), so ++ is emitted; the same happens at the third +; the fifth + is alone. Because a boundary, once placed, is never moved, the scanner never considers the split ++ + ++. The parser then sees x ++ ++ + y, which groups as ((x++)++) + y. Applying ++ to x++, which is not an lvalue, is rejected in semantic analysis. The legal split x ++ + ++ y means (x++) + (++y), but the scanner never produces it.

(2) Upper bound: the token starting at $i$ is found by a forward scan that reads at most $n - i$ characters (0-based $i$), and the next token starts at least one character later, so the total is at most $\sum_{i=0}^{n-1} (n - i) = n(n+1)/2$. Lower bound: at any position $i$ of $a^n$, the remaining input $a^{n-i}$ is a prefix of a string in $L(a^*b)$, so the DFA never enters the dead state and reads all $n - i$ characters. No b occurs, so the only accepted prefix is the single a of $T_1$, which is the token; the scanner retracts to $i + 1$. Each of the $n$ tokens costs $n - i$ reads, for a total of $n(n+1)/2$.

**GATE use.** MCQs ask how x+++++y, a---b (a -- - b) or a+++b (a ++ + b) is lexed and what the compiler then does. The trap is assuming the lexer looks for a split that makes the program legal; it does not, and the error appears later. The quadratic case explains why real token sets are designed so that a dead state comes soon after each lexeme.

**Check.** Enumerating every split of +++++ into + and ++ gave 8 splits, among them ++ + ++; the tokenizer returned ++ ++ +. Simulating the $\{a, a^*b\}$ DFA with last-accept tracking on $a^n$ counted 10, 55, 5050 and 500,500 reads for $n = 4, 10, 100, 1000$, equal to $n(n+1)/2$ each time, and emitted $n$ tokens.

## Thompson's construction: invariants and state count
<!-- topics: cd-lexical-analysis.thompson-construction -->

**Claim.** Build $N(r)$ by the rules: a symbol $a$ or ε gives two states joined by one edge; $s|t$ adds a new start with ε-edges to both starts and a new accept fed by ε-edges from both accepts; $st$ identifies the accept of $N(s)$ with the start of $N(t)$; $s^*$ adds a new start and accept with ε-edges start to $N(s)$, $N(s)$ to accept, start to accept, and the accept of $N(s)$ back to its start. Then $N(r)$ accepts $L(r)$, has one start state with no incoming edges and one accept state with no outgoing edges, and every state has at most two outgoing edges. With $n_\sigma$ symbol and ε leaves, $n_|$ unions, $n_*$ stars and $n_\cdot$ concatenations,

$$\lvert Q_N \rvert = 2(n_\sigma + n_| + n_*) - n_\cdot \le 2r,$$

where $r = n_\sigma + n_| + n_*$ (counting concatenations in $r$ only loosens the bound). The construction runs in $O(\lvert r \rvert)$ time and space.

**Proof.** Structural induction on $r$, following Aho, Lam, Sethi and Ullman (section 3.7.4).

Base: two states and one edge; the start has no incoming and the accept no outgoing edge; $\lvert Q \rvert = 2$ with $n_\sigma = 1$.

Union: by induction each $N(s)$, $N(t)$ satisfies the invariants. The new start has no incoming edges and two outgoing ε-edges; the new accept has no outgoing edges; the old accepts each get one outgoing edge, where they had none. An accepting path must leave the new start into exactly one sub-NFA and can leave it only through its accept, since the old starts have no incoming edges and the old accepts no outgoing edges other than the new ones, so the language is $L(s) \cup L(t)$. States: $\lvert N(s) \rvert + \lvert N(t) \rvert + 2$.

Concatenation: the merge is safe because the accept of $N(s)$ had no outgoing edges and the start of $N(t)$ had no incoming edges. A path through the merged state therefore enters it from $N(s)$ and leaves it into $N(t)$, never re-entering $N(s)$, so accepting paths spell exactly a word of $L(s)$ followed by a word of $L(t)$. The merged state's out-edges are those of the old start of $N(t)$, at most two. States: $\lvert N(s) \rvert + \lvert N(t) \rvert - 1$.

Star: the new start has two outgoing ε-edges and no incoming ones (the back edge goes to the old start of $N(s)$, not to the new start), and the new accept has none outgoing. The old accept gets two edges, back and to the new accept. Paths spell ε via the skip edge, or one or more passes through $N(s)$ via the back edge, so the language is $L(s)^*$. States: $\lvert N(s) \rvert + 2$.

Adding up, each leaf, union and star contributes 2 states and each concatenation removes 1, which is the formula; $n_\cdot \ge 0$ gives the bound. Each state has at most 2 outgoing edges, so there are at most $2\lvert Q \rvert \le 4r$ edges, and each operator costs constant work.

**GATE use.** A 2-mark NAT asks for the state count of a Thompson NFA. The trap is the concatenation convention: in the merging version each concatenation saves one state, while a variant that joins fragments with an ε-edge saves none. Read the question's definition.

**Check.** For $(a|b)^*abb$: $n_\sigma = 5$, $n_| = 1$, $n_* = 1$, $n_\cdot = 3$, so $2 \cdot 7 - 3 = 11$, the 11 states 0 to 10 of the Dragon Book figure. Step by step: $a|b$ has $2 + 2 + 2 = 6$, the star 8, then $8 + 2 - 1 = 9$, 10 and 11. A script built the NFA and found 11 states, maximum out-degree 2, no edge into the start and none out of the accept. On 400 random expressions the count equalled the formula, never exceeded $2r$, and the NFA (after subset construction) agreed with Python's regex engine on every string over $\{a, b\}$ of length up to 6.

## Subset construction: correctness and the $2^n$ bound
<!-- topics: cd-lexical-analysis.subset-construction -->

**Claim.** Let an ε-NFA have states $Q_N$, start $q_0$, transitions $\delta$ and accepting set $F_N$. Define the DFA with start $\varepsilon\text{-closure}(\{q_0\})$, transitions

$$D(S, a) = \varepsilon\text{-closure}\Big(\bigcup_{q \in S} \delta(q, a)\Big),$$

and a set accepting if it meets $F_N$. Then after reading $x$ the DFA is in the set $R(x)$ of NFA states reachable from $q_0$ by a path spelling $x$, so it accepts the same language. Building only reachable sets gives at most $2^{\lvert Q_N \rvert}$ states, counting $\varnothing$ as the dead state. Simulating the NFA directly on $x$ costs $O(\lvert x \rvert (n + m))$ for $n$ states and $m$ edges; the DFA costs $O(\lvert x \rvert)$ with $O(\lvert Q_D \rvert \cdot \lvert \Sigma \rvert)$ table space.

**Proof.** Induction on $\lvert x \rvert$. For $x = \varepsilon$, the states reachable on a path spelling ε are those reachable by ε-edges alone, which is $\varepsilon\text{-closure}(\{q_0\})$. For $xa$: a path spelling $xa$ consists of a path spelling $x$ to some $q \in R(x)$, one $a$-edge to some $q' \in \delta(q, a)$, then ε-edges. The ε-edges before the $a$-edge are already absorbed into $R(x)$, which is ε-closed. So $R(xa) = \varepsilon\text{-closure}(\bigcup_{q \in R(x)} \delta(q, a)) = D(R(x), a)$. The NFA accepts $x$ iff some path spelling $x$ ends in $F_N$, iff $R(x) \cap F_N \neq \varnothing$, which is the DFA's acceptance rule. Each DFA state is a subset of $Q_N$, so there are at most $2^{\lvert Q_N \rvert}$.

Costs: simulating the NFA keeps the current set; one step computes the moves and an ε-closure by graph search, $O(n + m)$, and there are $\lvert x \rvert$ steps. A DFA step is one table lookup. The bound is nearly tight: strings whose $k$-th symbol from the right is a have a $(k+1)$-state NFA but need $2^k$ DFA states (state-count section).

**GATE use.** Scanners are DFAs because the per-character cost is constant. NAT questions ask for the number of DFA states from the subset construction; the traps are starting from $q_0$ instead of its ε-closure, and taking the subset DFA as minimal.

**Check.** On the 11-state Thompson NFA for $(a|b)^*abb$ a script built 5 reachable subsets, of sizes 5, 7, 6, 7 and 7, the same as A to E in the Dragon Book. Transitions: A goes to B on a and C on b; B to B and D; C to B and C; D to B and E; E (accepting) to B and C. A and C have the same row, and minimisation leaves 4 states.

## Direct DFA from a regular expression: nullable, firstpos, lastpos, followpos
<!-- topics: cd-lexical-analysis.direct-dfa -->

**Claim.** Augment $r$ to $(r)\#$ and number the symbol occurrences as positions $1, \dots, p$, with $\#$ last. Compute bottom-up on the syntax tree:

| node | nullable | firstpos | lastpos |
|---|---|---|---|
| leaf $i$ | false | $\{i\}$ | $\{i\}$ |
| $c_1 \mid c_2$ | either is nullable | union | union |
| $c_1 c_2$ | both are nullable | $F_1 \cup F_2$ if $c_1$ nullable, else $F_1$ | $L_1 \cup L_2$ if $c_2$ nullable, else $L_2$ |
| $c^*$ | true | $F$ | $L$ |

and set followpos by two rules only: at $c_1 c_2$, every $i \in \mathrm{lastpos}(c_1)$ gets $\mathrm{firstpos}(c_2)$; at $c^*$, every $i \in \mathrm{lastpos}(c)$ gets $\mathrm{firstpos}(c)$. Then the DFA whose states are sets of positions, with start $\mathrm{firstpos}(\text{root})$, transition from $S$ on $a$ to $\bigcup \{\mathrm{followpos}(i) : i \in S, \text{position } i \text{ is } a\}$, and accepting states those containing $\#$, accepts $L(r)$. It is not always minimal.

**Proof.** Treat each position as a distinct letter, so $(r)\#$ denotes a language $\hat L$ of position strings, and $L(r)\#$ is its image under erasing the numbers. For a node $c$ with marked language $\hat L(c)$ the claim is: nullable says $\varepsilon \in \hat L(c)$; firstpos and lastpos are the sets of first and last letters of words in $\hat L(c)$; and a word $i_1 \cdots i_t$ is in $\hat L(c)$ iff $i_1 \in \mathrm{firstpos}$, $i_t \in \mathrm{lastpos}$ and each adjacent pair $(i_s, i_{s+1})$ is a followpos pair created inside $c$ (with ε handled by nullable). The proof is induction on the tree.

At a leaf this is immediate. At $c_1 \mid c_2$, the positions of the two sides are disjoint, so a word uses one side only and no new adjacent pair arises. At $c_1 c_2$, a word is $uv$ with $u \in \hat L(c_1)$, $v \in \hat L(c_2)$. Its first letter comes from $u$, or from $v$ when $u = \varepsilon$, which needs $c_1$ nullable: this is the firstpos rule, and lastpos is its mirror image. The only new adjacent pair is (last letter of $u$, first letter of $v$), which is exactly the concatenation followpos rule. At $c^*$, a word is $u_1 \cdots u_t$, and the only new pairs join the last letter of one $u_s$ to the first letter of the next: the star rule. Because positions are distinct, pairs created in disjoint subtrees never interfere, which is where the numbering is needed.

So $\hat L((r)\#)$ is local: membership is decided by the first letter, the adjacent pairs, and ending at $\#$ (which is the unique last letter, since $\#$ is not nullable and ends every word). A DFA state $S$ is the set of positions allowed next; reading $a$ chooses some allowed position labelled $a$, and the set allowed after it is the union of their followpos sets. This is the subset construction applied to the position automaton, so the DFA accepts the erased language. A word of $L(r)$ is complete exactly when $\#$ is allowed next, which is the acceptance rule.

**GATE use.** MCQs ask for one followpos set or for the number of DFA states. The traps are adding followpos at union nodes (none are created there) and forgetting the star's self-loop, which puts $1$ and $2$ into $\mathrm{followpos}(1)$ for $(a|b)^*$.

**Check.** For $(a|b)^*abb\#$ with positions a = 1, b = 2, a = 3, b = 4, b = 5, # = 6, a script computed followpos $1 \mapsto \{1,2,3\}$, $2 \mapsto \{1,2,3\}$, $3 \mapsto \{4\}$, $4 \mapsto \{5\}$, $5 \mapsto \{6\}$, $6 \mapsto \varnothing$, and $\mathrm{firstpos}(\text{root}) = \{1,2,3\}$. The DFA has the 4 states $\{1,2,3\}$, $\{1,2,3,4\}$, $\{1,2,3,5\}$, $\{1,2,3,6\}$, which is minimal. For $ab|bb$ the direct DFA has 5 states, counting $\varnothing$, and the after-a and after-b states $\{2\}$ and $\{4\}$ are equivalent, so the minimal DFA has 4. On 400 random expressions the direct DFA agreed with Python's regex engine on all strings over $\{a, b\}$ of length up to 6.

## Myhill–Nerode and minimisation by table filling
<!-- topics: cd-lexical-analysis.dfa-minimisation -->

**Claim.** In a complete DFA with every state reachable, call states $p, q$ distinguishable if some $z$ has exactly one of $\delta(p, z), \delta(q, z)$ accepting. The table-filling algorithm (mark every (accepting, non-accepting) pair; repeatedly mark $(p, q)$ if some symbol $c$ leads to a marked pair $(\delta(p,c), \delta(q,c))$; stop when a round marks nothing) marks exactly the distinguishable pairs. Merging unmarked pairs gives the minimal DFA, whose state count is the number of classes of $x \equiv_L y \iff \forall z\, (xz \in L \Leftrightarrow yz \in L)$; it is unique up to renaming. Partition refinement computes the same partition.

**Proof.** Sound: by induction on the round, every marked pair has a distinguishing word. Round 0 pairs are distinguished by ε; a pair marked in round $t$ via $c$ is distinguished by $cz$ where $z$ distinguishes the successor pair.

Complete: induction on the length of a shortest distinguishing word $w$. If $w = \varepsilon$ the pair is marked in round 0. If $w = cz$, then $z$ distinguishes $(\delta(p,c), \delta(q,c))$ and is shorter, so that pair is marked by induction, and the next round marks $(p, q)$. Unmarked therefore means indistinguishable, an equivalence relation that respects transitions: if $p \equiv q$ then $\delta(p,c) \equiv \delta(q,c)$, since a word distinguishing the successors would distinguish $p, q$ after prefixing $c$. So the quotient DFA is well defined and accepts the same language.

Minimality: if $x \not\equiv_L y$ then every DFA for $L$ sends $x$ and $y$ to different states, or the distinguishing suffix would give the same answer for both. Any DFA therefore has at least as many states as $\equiv_L$ has classes. In the quotient, two states reached by $x$ and $y$ are merged iff $x \equiv_L y$, so it has exactly that many, and the map from classes to states fixes it up to renaming. Partition refinement starts from {accepting, non-accepting} and splits a block when its members go to different blocks on some symbol. After $t$ rounds two states share a block iff no word of length at most $t$ distinguishes them, so it ends at the same partition. Cost of table filling with dependency lists: there are fewer than $n^2$ pairs. For each pair $(p, q)$ and symbol $c$, append $(p, q)$ to the list of the successor pair $(\delta(p,c), \delta(q,c))$, which is $\lvert \Sigma \rvert n^2$ list entries in all. Instead of repeated rounds, keep a worklist of newly marked pairs; when a pair is marked, mark every unmarked pair on its list and push it. Each pair is marked and pushed at most once, so each list is walked at most once and every entry is touched once, which gives $O(\lvert \Sigma \rvert n^2)$. Repeating full rounds instead can cost $n$ rounds of $\lvert \Sigma \rvert n^2$ each. Hopcroft's refinement runs in $O(\lvert \Sigma \rvert n \log n)$, following Hopcroft (1971), sketched here rather than proved in full. Splitting by a block $B$ on symbol $c$ costs time proportional to the number of $c$-transitions into $B$. After a block splits, only the smaller half needs to go on the worklist, so each time a state lies in a processed splitter block, that block is at most half the size of the previous one. A state therefore lies in at most $\log_2 n + 1$ splitters per symbol, and since the $c$-transitions into all states number $n$, the total is $O(\lvert \Sigma \rvert n \log n)$.

**GATE use.** Given a DFA table, find the number of states after minimisation. Remove unreachable states first: table filling alone does not delete them. The trap is merging states that agree on acceptance but not on their successors' blocks.

**Check.** On the subset DFA A to E for $(a|b)^*abb$ (E accepting), a script's table filling marked the 4 pairs with E in round 0; in round 1, (A,D), (B,D) and (C,D), since D goes to E on b; in round 2, (A,B) and (B,C), since B goes to D on b. Only (A,C) stayed unmarked, so the minimal DFA has 4 states.

## State counts of standard minimal DFAs
<!-- topics: cd-lexical-analysis.dfa-minimisation, cd-lexical-analysis.subset-construction -->

**Claim.** Over $\Sigma = \{a, b\}$, counting complete DFAs (dead state included when it exists):

1. $(a|b)^*$ needs 1 state.
2. $\Sigma^* w$, the strings ending in a fixed word $w$, needs $\lvert w \rvert + 1$, with no dead state.
3. $(a|b)^* a (a|b)^{k-1}$, the $k$-th symbol from the right is a, needs $2^k$, although an NFA has $k + 1$.
4. $(a|b)^{k-1} a (a|b)^*$, the $k$-th symbol from the left is a, needs $k + 2$.
5. $a^*b^*$ needs 3, and $a(a|b)^*b$ needs 4.

**Proof.** Each count is the number of $\equiv_L$ classes: give an automaton with that many states (upper bound) and that many pairwise distinguishable prefixes (lower bound).

1. Every string is accepted after every prefix, so there is one class.

2. Upper: let the state after $x$ be the longest suffix of $x$ that is a prefix of $w$ (the KMP automaton). It determines the next state, because the longest suffix of $xc$ that is a prefix of $w$ is a suffix of (state)$\,c$. It also determines acceptance, since $x$ ends in $w$ iff the state is $w$. Lower: take prefixes $u, v$ of $w$ with $\lvert u \rvert \lt \lvert v \rvert$ and $z$ with $vz = w$. Then $vz \in L$, while $uz$ is shorter than $w$ and is not in $L$. No dead state is needed, since from any state reading $w$ accepts.

3. Upper: let the state be the last $k$ symbols of $b^k x$. If $\lvert z \rvert \ge k$, membership of $xz$ depends only on $z$; otherwise the deciding symbol is the $(k - \lvert z \rvert)$-th from the right of $x$, which the window holds. A padded b correctly gives rejection when $xz$ is too short. Lower: two windows $u \ne v$ differ at some position $i$ counted from the left. Appending $a^{i-1}$ moves that position to $k$-th from the right, so one of $ua^{i-1}$, $va^{i-1}$ is accepted and the other is not. All $2^k$ windows are reachable by reading the window itself. The NFA guesses the a and counts $k - 1$ more symbols: $k + 1$ states.

4. States: $j = 0, \dots, k-1$ symbols read, an accepting sink and a dead sink. Counters $j \lt j'$ differ on $b^{k-1-j'}a$, which puts an a at position $k$ after $j'$ symbols but leaves the string too short after $j$. A counter differs from the accepting sink on ε and from the dead sink on $a^{k-j}$, and the two sinks differ on ε.

5. For $a^*b^*$: "only a's so far" and "some b, no a after it" are accepting and differ on a; the dead state, entered on a after b, differs from both on ε. For $a(a|b)^*b$: start, dead (first symbol b), "began with a, last symbol a" and "began with a, last symbol b" (accepting). The accepting state differs from the other three on ε. Start and the third state differ on b, the third state and dead also differ on b, and start and dead differ on ab.

**GATE use.** The 1-mark NAT "minimal DFA states for this language" leans on these counts. Describe what must be remembered and count the classes. The traps are leaving out the dead state for $a^*b^*$ (the answer is 3, not 2) and adding one to $\Sigma^*abb$, which has none. A related trap is answering $k + 1$ for the $k$-th symbol from the right: that is the NFA count.

**Check.** A script computed $\equiv_L$ classes by brute force (prefixes up to length 10, suffixes up to 9, stable against 8 and 7). It got 1 for $(a|b)^*$, 4 for ending in abb, 3 for $a^*b^*$, 4 for $a(a|b)^*b$, $2, 4, 8, 16, 32$ for the $k$-th from the right and $3, 4, 5, 6, 7$ for the $k$-th from the left with $k = 1, \dots, 5$, and $\lvert w \rvert + 1$ for 60 random suffixes $w$ of length 1 to 5. For the third symbol from the right it confirmed that every pair of the 8 windows is separated by $a^{i-1}$.

## Input buffering: what the sentinel saves, and the lookahead limit
<!-- topics: cd-lexical-analysis.input-buffering -->

**Claim.** Use a buffer of two halves of $N$ characters, reloaded alternately, with pointers lexemeBegin and forward. (1) Without sentinels, each advance of forward makes two tests (end of this half? end of input?), $2n$ tests for $n$ characters. With an eof sentinel after each half the loop makes one test per character read, sentinels included, plus at most two more each time it reads eof. It reads eof exactly $\lfloor n/N \rfloor + 1$ times, so it makes at most $n + 3(\lfloor n/N \rfloor + 1)$ tests. (2) A lexeme is never overwritten before it is finished provided the span from lexemeBegin to forward never exceeds $N$ characters, that is, lexeme length plus lookahead is at most $N$.

**Derivation.** (1) In the sentinel loop the only per-character test is whether the character is eof. A true eof inside a half is the end of input, and an eof at the end of a half triggers the reload. Only on a hit does the code ask which half ended, reloading the other half, or whether the input really ended. A half-end sentinel is read after each full block of $N$ characters, which happens $\lfloor n/N \rfloor$ times. When $N$ divides $n$ the last of these reloads loads nothing, and the eof it leaves at the start of the next half is the true end. The true eof is one more hit, so there are $\lfloor n/N \rfloor + 1$ hits in all, not $\lceil n/N \rceil$. Each hit is one per-character test plus at most two further tests: one when the first half ended, two when the second half ended or the input really ended.

(2) Number the source characters globally. When forward crosses into a half and that half is reloaded with characters $[p, p+N)$, its previous contents were $[p - 2N, p - N)$, and the other half holds $[p - N, p)$. Characters still needed are those from lexemeBegin on; they survive iff $\text{lexemeBegin} \ge p - N$. At that moment $\text{forward} = p$, so the condition is $\text{forward} - \text{lexemeBegin} \le N$. The span is the lexeme read so far plus the lookahead past it, which gives the stated limit.

**GATE use.** The MCQ asks what the sentinel achieves: one comparison per character in the common case. It does not increase lookahead, mark the lexeme start, or remove reloads. The lookahead limit explains why a single fixed buffer cannot handle arbitrarily long lexemes.

**Check.** A script simulating the sentinel loop counted every comparison. For $n = 10^6$ and $N = 4096$ it got $2{,}000{,}000$ tests without sentinels and $1{,}000{,}613$ with them: $n$, plus 245 eof reads, plus 122 tests at first-half ends, 244 at second-half ends and 2 at the true eof. The bound $n + 3 \cdot 245 = 1{,}000{,}735$ holds. For $n = N = 4096$ there were 2 eof hits and 4101 tests, so a bound built on $\lceil n/N \rceil = 1$ hit fails. The hit count $\lfloor n/N \rfloor + 1$ matched for every $n < 300$ and $N < 20$. For $n = 10{,}000$ the counts were $20{,}000$ and $10{,}008$.

## The symbol table: expected cost of a hashed lookup, and who uses it
<!-- topics: cd-lexical-analysis.symbol-table, cd-lexical-analysis.compiler-phases -->

**Claim.** Store $n$ identifiers in a hash table with $m$ chained buckets under simple uniform hashing, with load factor $\alpha = n/m$. An unsuccessful lookup (a new identifier) examines $\alpha$ entries on average, and a successful lookup of a random stored identifier examines $1 + \frac{\alpha}{2} - \frac{1}{2m}$ entries on average. With $m$ proportional to $n$ both are $O(1)$. The table is shared by the phases: the lexer enters identifiers, the parser and semantic analyser add type and scope, and the code generator reads storage locations. The lexer itself runs as the parser's getNextToken subroutine, not as a separate pass.

**Derivation.** Following CLRS (Theorem 11.2). Unsuccessful: the identifier hashes to a uniformly random bucket and the whole chain is scanned; chain lengths sum to $n$ over $m$ buckets, so the expected length is $n/m = \alpha$. Successful: suppose new entries go to the head of their chain, and let $x_i$ be the $i$-th inserted. A lookup of $x_i$ examines $x_i$ plus every $x_j$ with $j \gt i$ in the same bucket, and each such $x_j$ shares the bucket with probability $1/m$. Averaging over $i$:

$$\frac{1}{n} \sum_{i=1}^{n} \Big(1 + \sum_{j=i+1}^{n} \frac{1}{m}\Big) = 1 + \frac{1}{nm} \cdot \frac{n(n-1)}{2} = 1 + \frac{\alpha}{2} - \frac{1}{2m}.$$

Appending at the tail instead swaps "after" for "before" and gives the same average by symmetry. For block structure, keep one table per scope on a stack and search from the innermost scope outward, so an inner declaration hides an outer one and popping a scope discards its names.

**GATE use.** MCQs ask which data structure suits a symbol table (a hash table) and which phases use it (all of them, with the error handler also shared). Keywords can be pre-loaded as reserved entries, so the identifier rule plus one lookup separates keyword from identifier.

**Check.** With $m = 256$ and $n = 1000$ ($\alpha = 3.90625$), 200 simulated tables gave a mean successful cost of 2.95116 against the formula's 2.95117, and a mean chain length of exactly 3.90625.

## What a lexer can and cannot detect
<!-- topics: cd-lexical-analysis.lexer-limits, cd-lexical-analysis.lexical-errors, cd-lexical-analysis.compiler-phases -->

**Claim.** In the rule model of the first section, a lexical error occurs exactly when, at some position, no rule matches any nonempty prefix of the remaining input. An illegal character such as @ outside a literal, or an unterminated string, is a lexical error by this criterion. An unterminated comment is not: under C's rules `/` and `*` are operators, so `/* abc` splits into `/`, `*`, `abc`. Real lexers report it because they commit on `/*` with a dedicated start condition or rule that reports an error when it reaches end of input inside the comment. A misspelt keyword, a missing semicolon, unbalanced parentheses, an undeclared variable and a type mismatch are not: the input still splits into valid lexemes. The parser catches the arrangement errors (syntax) and semantic analysis the declaration and type errors. No lexer can check that parentheses balance, because that language is not regular.

**Proof.** By the first section the scanner fails only when $M_i = \varnothing$. A stray @ matches no C rule. For `/* abc` with no closing `*/` the comment rule matches nothing, but the division rule matches `/`, so $M_i \ne \varnothing$ and maximal munch goes on without an error; only an added open-comment rule, which takes the longest match from `/*` to end of input, turns it into a reported error. An opening quote with no closing quote matches no prefix of the string rule, since every match must end in a quote, and no other rule starts with a quote. fi and whlie match the identifier rule, so they are lexemes; the parser later finds an identifier where a keyword was expected, or semantic analysis finds an undeclared name. A missing semicolon removes a token without making any remaining prefix unmatchable. Declarations and types are not visible in a single lexeme.

Balanced parentheses: the prefixes $(^i$ for $i \ge 0$ are pairwise inequivalent under $\equiv_L$, because $(^i)^i$ is balanced while $(^j)^i$ is not for $j \ne i$. So the language has infinitely many classes and no DFA recognises it. A scanner is a DFA, and the check needs the parser's stack.

Recovery: panic mode deletes characters from the remaining input until some rule matches a prefix again, often resuming at a delimiter such as ; or a newline. It terminates because each step removes one character. Finer recovery tries one edit (delete, insert, replace or transpose two adjacent characters) and keeps it if scanning can then continue. A catch-all rule `.` at the end of a Lex specification turns every stray character into a reportable token instead of a failure.

**GATE use.** MSQs list errors and ask which are lexical; only the ones visible inside a single character sequence (illegal character, unterminated literal) qualify. The trap is calling fi a lexical error. Phase questions follow the order lexical, syntax, semantic, intermediate code, optimisation, code generation, with keywords recognised in lexical analysis.

**Check.** The script's C tokenizer raised an error at position 4 for `x = @;` and at the quote for `s = "abc;`, and returned fi as an ID token. A maximal-munch lexer with comment, identifier and operator rules split `x = a /* unterminated` into x, =, a, /, *, unterminated with no error; adding an open-comment rule made it report the comment. It confirmed that $(^i)^i$ is balanced and $(^j)^i$ is not for all $i \ne j$ below 12. The pattern `[0-9]+(.[0-9]+)?` matched 3x5 because the unescaped dot matches any character, while `[0-9]+(\.[0-9]+)?` rejected it.
