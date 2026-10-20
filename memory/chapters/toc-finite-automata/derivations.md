# Regular languages and finite automata: derivations

## Counting strings and DFAs, and why complement needs a total DFA
<!-- topics: toc-finite-automata.strings-languages, toc-finite-automata.dfa-definition -->

**Claim.** Let $\Sigma$ have $k$ symbols. There are $k^n$ strings of length exactly $n$, and for $k \ge 2$ there are

$$\sum_{i=0}^{n} k^i = \frac{k^{n+1}-1}{k-1}$$

strings of length at most $n$ (for $k = 1$ the count is $n + 1$). With a fixed start state, the number of DFAs with $n$ named states over $k$ symbols, counted as (transition table, accepting set) pairs, is $N = n^{nk} \cdot 2^n$. For a DFA $M = (Q, \Sigma, \delta, q_0, F)$ the extended function $\delta^*(q, \varepsilon) = q$, $\delta^*(q, wa) = \delta(\delta^*(q, w), a)$ is well defined and satisfies $\delta^*(q, uv) = \delta^*(\delta^*(q, u), v)$, and when $\delta$ is total the DFA $(Q, \Sigma, \delta, q_0, Q \setminus F)$ accepts exactly $\Sigma^* \setminus L(M)$.

**Proof.** A string of length $n$ is a sequence of $n$ independent choices from $k$ symbols, so there are $k^n$. Summing over $i = 0, \dots, n$ is a geometric series: if $S = \sum_{i=0}^n k^i$ then $kS - S = k^{n+1} - 1$, which gives the formula when $k \ne 1$. For the DFA count, $\delta$ is a function on the $nk$ pairs $(q, a)$, and each pair independently picks one of $n$ targets, giving $n^{nk}$ tables; $F$ is any of the $2^n$ subsets of $Q$, independent of $\delta$. If the start state is also free, multiply by $n$.

The recursion defines $\delta^*(q, w)$ by induction on $\lvert w \rvert$, and because $\delta$ is a function it returns exactly one state. The law $\delta^*(q, uv) = \delta^*(\delta^*(q, u), v)$ follows by induction on $\lvert v \rvert$: it is the definition of $\delta^*(q, u)$ when $v = \varepsilon$, and for $v = v'a$ both sides equal $\delta$ applied to the case $v'$ with symbol $a$. For complement, totality means every $w$ drives $q_0$ to exactly one state $\delta^*(q_0, w)$, which lies in $F$ or in $Q \setminus F$ and not both; swapping $F$ therefore flips the verdict on every string. If some move is missing, a string that falls off the diagram is rejected by both machines, so the swap does not complement. Adding a dead state that loops on every symbol restores totality without changing $L(M)$.

**GATE use.** NATs ask for the number of strings of length $\le n$, or the number of DFAs with two states. The traps are counting DFAs as languages (many tables define the same language), forgetting the $2^n$ choices of $F$, and complementing a partially drawn DFA.

**Check.** Over $\{0, 1\}$ there are $2^3 = 8$ strings of length 3 and $1 + 2 + 4 + 8 = 15 = (2^4 - 1)/1$ of length at most 3; over three symbols, $1 + 3 + 9 = 13 = (3^3 - 1)/2$ of length at most 2. Two states over $\{a, b\}$ give $2^{4} \cdot 2^{2} = 64$ tables, confirmed by enumeration, but those 64 machines accept only 26 distinct languages. The DFA with $q_0 \xrightarrow{a} q_1$, $q_1$ looping and accepting, and no move on $b$ from $q_0$ accepts $a(a+b)^*$; swapping $F$ without a dead state accepts only $\varepsilon$, not the true complement $\varepsilon + b(a+b)^*$.

## Pattern languages: contains $w$ or ends with $w$ needs $\lvert w \rvert + 1$ states
<!-- topics: toc-finite-automata.dfa-design, toc-finite-automata.myhill-nerode -->

**Claim.** Let $w = w_1 w_2 \cdots w_m$ be a fixed non-empty string over $\Sigma$, and write $u_i = w_1 \cdots w_i$ for its prefixes ($u_0 = \varepsilon$). The minimal complete DFA for $\Sigma^* w \Sigma^*$ (contains $w$) and the minimal complete DFA for $\Sigma^* w$ (ends with $w$) each have exactly $m + 1$ states. For $w \Sigma^*$ (starts with $w$) with $\lvert\Sigma\rvert \ge 2$ the count is $m + 2$, because a dead state is needed; over a one-letter alphabet $a^m\Sigma^* = a^m a^*$ has no dead strings and needs only $m + 1$.

**Proof.** *Upper bound.* For an input $x$ let $f(x)$ be the length of the longest prefix of $w$ that is a suffix of $x$, so $0 \le f(x) \le m$. The value $f(xa)$ depends only on $f(x)$ and $a$: if $u_j$ is a suffix of $xa$ with $j \ge 1$, then $u_{j-1}$ is a suffix of $x$ and a prefix of $w$, so $j - 1 \le f(x)$, which makes $u_{j-1}$ a suffix of $u_{f(x)}$ and $u_j$ a suffix of $u_{f(x)} a$. Hence $f(xa)$ is the length of the longest prefix of $w$ that is a suffix of $u_{f(x)}a$, a function of $(f(x), a)$ only. States $0, \dots, m$ with that transition form a DFA (the KMP automaton). For "ends with $w$" accept at state $m$; $x$ ends with $w$ exactly when $f(x) = m$. For "contains $w$" make state $m$ an accepting sink: $x$ contains $w$ exactly when some prefix of $x$ reached $f = m$.

*Lower bound.* The $m + 1$ prefixes $u_0, \dots, u_m$ are pairwise distinguishable. Take $i < j$ and the suffix $z = w_{j+1} \cdots w_m$. Then $u_j z = w$ lies in both languages, while $u_i z$ has length $m - (j - i) < m$ and so neither contains nor ends with $w$. By the Myhill–Nerode lower bound (pairwise distinguishable strings need distinct states), every DFA needs $m + 1$ states.

For "starts with $w$" with $\lvert\Sigma\rvert \ge 2$ the prefixes $u_0, \dots, u_m$ are again distinguishable (by $z$ as above), and any string that has already deviated from $w$, such as $u_{j}c$ with $c \ne w_{j+1}$, accepts no extension at all, which separates it from all $u_i$ (each $u_i$ has the extension $w_{i+1} \cdots w_m$). That gives $m + 2$, and the obvious chain plus dead state achieves it.

**GATE use.** "Minimal DFA for strings containing / ending with a given pattern" is a frequent NAT. The trap is the prefix version: starts with $ab$ needs 4 states, not 3, because the dead state counts. A second trap is assuming $m + 1$ for patterns combined with other conditions; then apply the product bound of the next section and test distinguishability.

**Check.** A Nerode-class count by brute force (all prefixes up to length 7, separated by all suffixes up to length 7) gives: ends in $01$, 3 classes; contains $aab$, 4; ends in $aab$, 4; contains $abab$, 5; starts with $ab$, 4. For contains $aab$ the transitions are $0 \xrightarrow{a} 1$, $0 \xrightarrow{b} 0$, $1 \xrightarrow{a} 2$, $1 \xrightarrow{b} 0$, $2 \xrightarrow{a} 2$ (the last two symbols are still $aa$), $2 \xrightarrow{b} 3$, and 3 loops.

## Counters, binary divisibility and the product construction
<!-- topics: toc-finite-automata.dfa-design -->

**Claim.** (i) Over $\{a, b\}$, the language $\#_a(w) \equiv i \pmod m$ and $\#_b(w) \equiv j \pmod n$ has a minimal DFA of exactly $mn$ states; length divisible by $k$ needs exactly $k$. (ii) Reading a binary string most significant bit first, with $\varepsilon$ read as 0, the remainder modulo $n$ evolves by $\delta(r, b) = (2r + b) \bmod n$; for odd $n$ the minimal DFA for multiples of $n$ has exactly $n$ states, and for even $n$ it can have fewer. (iii) For DFAs $M_1, M_2$ over the same alphabet, the product DFA on $Q_1 \times Q_2$ with $\delta((p, q), a) = (\delta_1(p, a), \delta_2(q, a))$ recognises $L_1 \cap L_2$, $L_1 \cup L_2$ or $L_1 \setminus L_2$ depending on the accepting pairs, with at most $\lvert Q_1 \rvert \cdot \lvert Q_2 \rvert$ states.

**Proof.** (iii) By induction on $\lvert w \rvert$, $\delta^*((p_0, q_0), w) = (\delta_1^*(p_0, w), \delta_2^*(q_0, w))$: the case $\varepsilon$ is immediate and each symbol moves both coordinates by definition. So the product knows both verdicts after any input. Accepting $F_1 \times F_2$ gives intersection, $(F_1 \times Q_2) \cup (Q_1 \times F_2)$ gives union, $F_1 \times (Q_2 \setminus F_2)$ gives difference. Both machines must be total for the union and difference cases.

(i) The product of an $m$-state counter for $a$'s and an $n$-state counter for $b$'s gives $mn$ states $(x, y)$, $x = \#_a \bmod m$, $y = \#_b \bmod n$. For the lower bound take two different pairs $(x, y) \ne (x', y')$, say $x \ne x'$. Append $z = a^{\alpha} b^{\beta}$ with $\alpha \equiv i - x \pmod m$ and $\beta \equiv j - y \pmod n$. From $(x, y)$ this reaches $(i, j)$ and accepts; from $(x', y')$ the first coordinate becomes $x' + \alpha \not\equiv i$, so it rejects. The case $y \ne y'$ is symmetric. All $mn$ pairs are reachable, so none can be merged. Length mod $k$ is the same argument with one counter.

(ii) If $x$ denotes the number $v$, then $xb$ denotes $2v + b$, so $(2v + b) \bmod n$ depends only on $v \bmod n$ and $b$: the remainders $0, \dots, n - 1$ form a DFA with start and accept 0. For odd $n$, $\gcd(2, n) = 1$, so $2^L$ is invertible mod $n$. Let $r \ne s$ and pick $L$ with $2^L \ge n$. Appending an $L$-bit suffix of value $v$ sends remainder $r$ to $(2^L r + v) \bmod n$. Choose $v \in [0, n) \subseteq [0, 2^L)$ with $v \equiv -2^L r$; then $r$ goes to 0 and $s$ goes to $2^L(s - r) \bmod n$, which is non-zero because $2^L$ is invertible and $s - r \not\equiv 0$. So all $n$ remainders are pairwise distinguishable. For $n = 4$, remainders 1 and 3 both move to $(2 + b) \bmod 4$ on bit $b$ and both reject now, so they merge, while 0 (accepts $\varepsilon$) and 2 (accepts after one 0) stay separate: 3 states.

**GATE use.** NATs on "at least one 0 and at least one 1", "even number of $a$'s and number of $b$'s divisible by 3", and "binary multiples of 5". The traps are adding the counts instead of multiplying, and quoting $n$ states for an even modulus.

**Check.** Brute-force Nerode counts: length mod 3 gives 3; $\#_a$ even and $\#_b \equiv 0 \pmod 3$ gives $2 \cdot 3 = 6$; at least one 0 and one 1 gives $2 \cdot 2 = 4$; binary multiples of 3, 5 and 7 give 3, 5 and 7, while multiples of 4, 6 and 8 give 3, 4 and 4.

## Subset construction and ε-closure
<!-- topics: toc-finite-automata.nfa-epsilon-nfa, toc-finite-automata.subset-construction -->

**Claim.** Let $N = (Q, \Sigma, \delta_N, q_0, F)$ be an ε-NFA, and for a set $S$ let $E(S)$ be its ε-closure, the states reachable from $S$ by zero or more ε-moves. Define the DFA $D$ with start $q_D = E(\{q_0\})$, transitions

$$\delta_D(S, a) = E\Big(\bigcup_{q \in S} \delta_N(q, a)\Big),$$

and accepting sets those that meet $F$. Then $L(D) = L(N)$, $D$ has at most $2^{\lvert Q \rvert}$ states, and simulating $N$ directly on $w$ takes $O(\lvert w \rvert (n + m))$ time for $n$ states and $m$ transitions. The bound is tight: "the $n$-th symbol from the end is 1" has an $(n + 1)$-state NFA, and its minimal DFA has $2^n$ states.

**Proof.** Let $R(w)$ be the set of states $q$ such that some path from $q_0$ to $q$ spells $w$, with ε-moves allowed anywhere. Invariant: $\delta_D^*(q_D, w) = R(w)$. For $w = \varepsilon$, $R(\varepsilon)$ is the ε-closure of $q_0$, which is $q_D$. For $wa$: a path spelling $wa$ is a path spelling $w$ to some $p$ (closed under trailing ε-moves, so $p \in R(w)$), then one $a$-move, then any number of ε-moves. That is exactly $E(\bigcup_{p \in R(w)} \delta_N(p, a)) = \delta_D(R(w), a)$, and by induction $R(w) = \delta_D^*(q_D, w)$. $N$ accepts $w$ iff $R(w) \cap F \ne \emptyset$, which is $D$'s acceptance condition. The DFA states are subsets of $Q$, hence at most $2^{\lvert Q \rvert}$; a worklist that starts from $q_D$ builds only the reachable ones, and $\emptyset$, if reached, is the dead state. Running the same invariant online, one step costs one pass over the transitions plus a closure search, $O(n + m)$.

Tightness: the NFA stays in state 0 on both symbols, guesses on a 1 to move to state 1, and then advances $1 \to 2 \to \cdots \to n$ on any symbol; state $n$ accepts. So $n + 1$ states suffice nondeterministically. For the DFA, take two different strings $x, y$ of length $n$ that first differ at position $j$ from the left, $x_j = 1$ and $y_j = 0$. Append $z = 0^{j-1}$: position $j$ becomes the $n$-th from the end of $xz$ and $yz$, so $xz \in L$ and $yz \notin L$. The $2^n$ strings of length $n$ are pairwise distinguishable, so every DFA needs $2^n$ states, and the DFA that remembers the last $n$ symbols (padding with 0) achieves it. This follows Sipser's and Hopcroft–Ullman's treatment.

**GATE use.** "How many states does the subset construction produce" for a small ε-NFA. The traps are taking the closure only at the start and not after each move, forgetting to count $\emptyset$ when it is reached, and reporting the subset count when the question asks for the minimal DFA.

**Check.** The ε-NFA with $0 \xrightarrow{\varepsilon} 2$, $0 \xrightarrow{a} 1$, $1 \xrightarrow{b} \{1, 3\}$, $2 \xrightarrow{a} 2$, $2 \xrightarrow{b} 3$, $3 \xrightarrow{\varepsilon} 0$ and accept 3 yields the 5 reachable subsets $\{0,2\}, \{1,2\}, \{2\}, \{0,2,3\}, \{0,1,2,3\}$, and $\emptyset$ is never reached. The language is the set of strings ending in $b$, so this DFA minimises to 2 states. For the $n$-th symbol from the end with $n = 2, 3, 4$, the subset construction yields exactly 4, 8 and 16 reachable subsets and minimisation leaves all of them.

## Myhill–Nerode: classes of $\equiv_L$ are the states of the minimal DFA
<!-- topics: toc-finite-automata.myhill-nerode, toc-finite-automata.minimization -->

**Claim.** For $L \subseteq \Sigma^*$ define $x \equiv_L y$ when, for every $z \in \Sigma^*$, $xz \in L \iff yz \in L$. Then $L$ is regular iff $\equiv_L$ has finitely many classes, and the number of classes equals the number of states of the minimal complete DFA for $L$ (dead state included). That DFA is unique up to renaming of states. Consequently, $k$ pairwise distinguishable strings force at least $k$ states.

**Proof.** $\equiv_L$ is an equivalence relation, and it is right-invariant: if $x \equiv_L y$ then $xa \equiv_L ya$, because any test suffix $z$ for $xa$ is the test suffix $az$ for $x$.

*DFA to classes.* Let $M$ be a complete DFA for $L$. If $\delta^*(q_0, x) = \delta^*(q_0, y)$ then for every $z$, $\delta^*(q_0, xz) = \delta^*(q_0, yz)$ by the composition law, so $x \equiv_L y$. Strings reaching the same state are equivalent, so the number of classes is at most the number of reachable states of $M$. In contrapositive form: pairwise inequivalent strings reach pairwise different states, which is the lower-bound tool.

*Classes to DFA.* If there are finitely many classes, build $M_L$ with states the classes $[x]$, start $[\varepsilon]$, $\delta([x], a) = [xa]$ (well defined by right-invariance) and accepting classes $\{[x] : x \in L\}$ (well defined by taking $z = \varepsilon$). By induction $\delta^*([\varepsilon], w) = [w]$, so $M_L$ accepts $w$ iff $w \in L$. Hence $L$ is regular and the class count is achieved.

*Uniqueness.* Let $M$ be a complete DFA for $L$ with exactly as many states as classes. Every state is reachable, otherwise deleting it would beat the lower bound. Map each state $q$ to the class of any string reaching it; this is well defined by the first part and onto because every class contains strings and each reaches some state. A map onto a set of equal size is a bijection, and it commutes with transitions because $\delta(q, a)$ is reached by $xa$. So $M$ is $M_L$ with renamed states.

**GATE use.** Lower bounds for state counts, and non-regularity. For $\{a^n b^n : n \ge 0\}$, the strings $a^i$ are pairwise distinguishable: $a^i b^i \in L$ and $a^j b^i \notin L$ for $j \ne i$. Infinitely many classes means not regular. The trap is quoting the index of an NFA: the theorem counts complete DFA states.

**Check.** For the third symbol from the end being 1, the brute-force class count is 8 and the subset construction from the 4-state NFA also gives 8. For $\{a^n b^n\}$, the strings $a, a^2, \dots, a^6$ are separated pairwise by $b, b^2, \dots, b^6$.

## Minimization by partition refinement and table filling
<!-- topics: toc-finite-automata.minimization, toc-finite-automata.decision-properties -->

**Claim.** Given a complete DFA, delete the states unreachable from $q_0$, start with the partition $\{F, Q \setminus F\}$, and repeatedly split a block whenever two of its states move into different blocks on some symbol. Refinement stops after at most $n - 2$ splitting rounds for $n$ states, and when it stops two states share a block exactly when they are indistinguishable (no suffix is accepted from one and rejected from the other). Merging each block into one state yields the minimal DFA. Table filling computes the same relation from the other side: it marks exactly the distinguishable pairs. Round-by-round refinement (Moore) costs $O(kn)$ per round and $O(kn^2)$ in total; Hopcroft's version runs in $O(k\, n \log n)$.

**Proof.** Invariant: after round $t$, $p$ and $q$ share a block iff no string of length $\le t$ distinguishes them. Round 0 separates exactly the pairs split by $\varepsilon$. A string $az$ of length $t + 1$ distinguishes $p$ and $q$ iff $z$, of length $t$, distinguishes $\delta(p, a)$ and $\delta(q, a)$, which by the invariant means they sit in different blocks after round $t$; that is the splitting rule, so the invariant holds after round $t + 1$. If some round splits nothing, the partition repeats forever, so states sharing a block are not distinguished by strings of any length. The number of blocks starts at most 2, grows by at least 1 each splitting round and cannot pass $n$, which bounds the splitting rounds by $n - 2$.

The quotient is well defined: two states in one block are indistinguishable, so their successors on $a$ are too and lie in one block, and the blocks are either wholly accepting or wholly non-accepting. Each block corresponds to one Myhill–Nerode class, because all remaining states are reachable and the string reaching a state is equivalent to the strings reaching another state iff the states are indistinguishable. So the quotient has as many states as classes and is minimal by the previous section. Table filling marks $(p, q)$ when exactly one is accepting, then marks $(p, q)$ whenever some $(\delta(p, a), \delta(q, a))$ is marked; by induction on the length of the shortest distinguishing string, a pair is eventually marked iff it is distinguishable.

The bound also decides equivalence. Put two DFAs with $n_1$ and $n_2$ states side by side; their start states are equivalent iff refinement on the combined $n_1 + n_2$ states never separates them, and by the invariant a separating string has length at most $n_1 + n_2 - 2$.

**GATE use.** "Minimise this transition table" NATs. The traps are counting an unreachable state, merging two states because their immediate successors look alike before the partition is stable, and forgetting that the dead state is a state of the minimal complete DFA.

**Check.** Start A, accepting D and E, transitions on (0, 1): A (B, C), B (D, E), C (E, D), D (F, F), E (F, F), F (F, F), G (D, A). G is unreachable. Round 0: $\{D, E\}$, $\{A, B, C, F\}$. Round 1 splits the second block into $\{A, F\}$ and $\{B, C\}$. Round 2 splits A from F (A moves to $\{B, C\}$, F to itself). Round 3 changes nothing: 4 states, accepting exactly the strings of length 2, matching the script. Two-state DFAs over $\{a, b\}$ are equivalent iff they agree on strings of length $\le 2$; comparing on all strings of length $\le 4$ also gave 26 languages among the 64 tables.

## Regular expressions: identities and counterexamples
<!-- topics: toc-finite-automata.regular-expressions, toc-finite-automata.regex-identities -->

**Claim.** For regular expressions $r, s$ (read as languages): $\emptyset^* = \varepsilon^* = \varepsilon$; $r\emptyset = \emptyset r = \emptyset$; $r\varepsilon = r$; $r + \emptyset = r$; $r^+ = rr^* = r^*r$; $(r^*)^* = r^*$; $r^*r^* = r^*$; and

$$(a+b)^* = (a^*b^*)^* = (a^* + b^*)^* = a^*(ba^*)^* = (a^*b)^*a^*.$$

In general $(r + s)^* \ne r^* + s^*$ and $(rs)^* \ne r^*s^*$. Strings over $\{0, 1\}$ without $11$ are exactly $(0 + 10)^*(\varepsilon + 1)$. Precedence is star, then concatenation, then union.

**Proof.** $L^* = \bigcup_{i \ge 0} L^i$ with $L^0 = \{\varepsilon\}$. For $L = \emptyset$, $L^i = \emptyset$ for $i \ge 1$ since a concatenation needs a member from each factor, so $\emptyset^* = \{\varepsilon\}$, and $\{\varepsilon\}^i = \{\varepsilon\}$ for all $i$. The same reason gives $r\emptyset = \emptyset$. $rr^* = \bigcup_{i \ge 1} r^i = r^+$, and $r^* r$ gives the same union. For $r^*r^* = r^*$: the right side is contained in the left since $\varepsilon \in r^*$; a concatenation of two products of $r$-words is again a product of $r$-words. $(r^*)^* = r^*$ follows the same way, since $r^* \subseteq (r^*)^*$ and a product of products of $r$-words is a product of $r$-words.

For the five forms of $\Sigma^*$ over $\{a, b\}$, each right-hand side is contained in $\Sigma^*$, so only the reverse inclusion needs proof. $a, b \in a^*b^*$ and $a, b \in a^* + b^*$, so any string is a product of single letters, each in the starred base. For $a^*(ba^*)^*$, cut $w$ just before each $b$: the first piece is in $a^*$ and every later piece is $b$ followed by $a$'s. For $(a^*b)^*a^*$, cut just after each $b$.

Counterexamples: $ab \in (a + b)^*$ but $ab \notin a^* + b^*$; $abab \in (ab)^*$ but not in $a^*b^*$, and $aabb \in a^*b^*$ but not in $(ab)^*$.

No $11$: in such a string every 1 except possibly the last symbol is followed by 0. Parse left to right into tokens: 0 becomes the token $0$, a 1 with a following 0 becomes $10$, and a final 1 is left over. This gives a word of $(0 + 10)^*(\varepsilon + 1)$. Conversely, each token $0$ or $10$ ends in 0, so a 1 inside the word is always followed by 0 (inside its token) and the optional final 1 follows a 0 or nothing. The number of such strings of length $n$ satisfies $f(n) = f(n-1) + f(n-2)$ (last token $0$ or $10$, or by the final symbol), the Fibonacci numbers.

**GATE use.** "Which regex denotes this language" and "which pair is equivalent" MCQs. Test each option on $\varepsilon$, length-1 strings and the first string a candidate misses. The trap options agree on long strings and differ on $\varepsilon$ or a boundary string, such as $(0 + 10)^*$ missing $1$ and $01$, or $(ab + b)^*a^*$ missing $aab$.

**Check.** Enumeration to length 8 confirms all five forms of $(a + b)^*$, plus $(a + b)^*ab(a + b)^* + b^*a^*$, and that $(ab + b)^*a^*$ misses $aab$. $(0 + 10)^*(\varepsilon + 1)$ matches the no-$11$ predicate on every string up to length 10; there are $1 + 2 + 3 + 5 + \cdots + 144 = 375$ of them. $a(a+b)^*a + b(a+b)^*b + a + b$ is exactly the non-empty strings whose first and last symbols agree, to length 8.

## Thompson's construction and state elimination
<!-- topics: toc-finite-automata.regex-fa-conversion -->

**Claim.** (i) Every regex $r$ has an ε-NFA with one start state that has no incoming edges, one accepting state that has no outgoing edges, and at most $2\lvert r \rvert$ states, where $\lvert r \rvert$ counts symbols and operators; it is built in $O(\lvert r \rvert)$ time. (ii) In a generalised NFA whose edges carry regexes, removing a state $q$ (not the start or accept) and replacing every label by

$$R'(p, s) = R(p, s) + R(p, q)\, R(q, q)^*\, R(q, s)$$

for all remaining $p, s$ preserves the language. Eliminating all inner states leaves one edge whose label is a regex for the automaton.

**Proof.** (i) Structural induction (Hopcroft–Ullman). Base: for $a$, $\varepsilon$ or $\emptyset$, two states, start and accept, joined by an $a$-edge, an ε-edge or nothing. Union $r + s$: a new start with ε-edges to both fragment starts, and both fragment accepts with ε-edges to a new accept; 2 new states. Concatenation $rs$: an ε-edge from the accept of $r$ to the start of $s$; no new states. Star $r^*$: a new start and accept, with ε-edges new start to old start, old accept to new accept, old accept back to old start, and new start to new accept for the zero-iteration case; 2 new states. The isolation invariant (no edge into the start, none out of the accept) holds for each fragment, which is what stops a star loop from leaking into a surrounding union. Each fragment's language is the operator applied to its parts, by inspecting the paths. The states total $2 \times$ (symbols + unions + stars) $\le 2\lvert r \rvert$, and each step is constant work.

(ii) Consider any accepting path in the generalised automaton. Cut it at the visits to states other than $q$: each piece goes $p \to s$ directly, or $p \to q$, loops at $q$ some number of times, then $q \to s$. The strings the second kind can spell are exactly $R(p, q)R(q, q)^*R(q, s)$, so the new label covers both kinds and nothing else. The language of paths between the remaining states is unchanged.

The resulting regex depends on the elimination order, but every order gives an equivalent regex. The conversion is linear only in the direction regex to NFA; state elimination can produce an expression exponentially longer than the automaton, and Ehrenfeucht and Zeiger exhibited DFAs whose every equivalent regex is that long.

**GATE use.** Identifying the regex of a small automaton (eliminate the states with the fewest connections first), and claims about conversion cost. The trap is believing both directions are polynomial, or that Thompson's construction outputs a DFA: it outputs an ε-NFA, which the subset construction then determinises.

**Check.** $(a + b)^*abb$ has 5 symbols, 1 union and 1 star, so the ε-linked Thompson NFA has $2(5 + 1 + 1) = 14$ states, matched by a parser-based count, against $2\lvert r \rvert = 20$ when the 3 concatenations are counted as operators. In the two-state DFA with $q_0$ start and accepting, $q_0 \xrightarrow{a} q_1$, $q_1 \xrightarrow{a} q_0$ and $b$-loops on both, eliminating $q_1$ adds $a\,b^*\,a$ to the $q_0$ loop, giving $(b + ab^*a)^*$, the strings with an even number of $a$'s, confirmed to length 8.

## Arden's theorem
<!-- topics: toc-finite-automata.arden-theorem, toc-finite-automata.regex-fa-conversion -->

**Claim.** Let $P$ and $Q$ be languages with $\varepsilon \notin P$. Then the equation $R = Q + RP$ has exactly one solution, $R = QP^*$. If $\varepsilon \in P$, $QP^*$ is still a solution (the least one) but not the only one.

**Proof.** *Existence.* $P^* = \varepsilon + P^*P$, so $Q + QP^*P = Q(\varepsilon + P^*P) = QP^*$.

*Every solution contains $QP^*$.* Substitute the equation into itself $k$ times:

$$R = Q + QP + QP^2 + \cdots + QP^k + RP^{k+1}.$$

So $QP^i \subseteq R$ for every $i$, hence $QP^* \subseteq R$. This part does not need $\varepsilon \notin P$, which is why $QP^*$ is the least solution in general.

*Every solution is contained in $QP^*$.* Let $w \in R$ with $\lvert w \rvert = \ell$ and expand with $k = \ell$. Every string of $P$ has length at least 1 because $\varepsilon \notin P$, so every string of $RP^{\ell+1}$ has length at least $\ell + 1$, and $w$ is not one of them. Therefore $w \in Q + QP + \cdots + QP^{\ell} \subseteq QP^*$. Both inclusions give $R = QP^*$.

If $\varepsilon \in P$, say $P = \{\varepsilon\}$, the equation reads $R = Q + R$, which every $R \supseteq Q$ satisfies, so uniqueness fails.

*Using it on a DFA.* For each state $q$ let $X_q$ be the set of strings that drive the start state to $q$. A string reaches $q$ iff it is $\varepsilon$ and $q$ is the start, or it is $xa$ with $x$ reaching some $p$ and $p \xrightarrow{a} q$. So $X_q = [q = q_0]\varepsilon + \sum_{p \xrightarrow{a} q} X_p a$. Each self-loop term has the form $X_q P$ with $\varepsilon \notin P$ (edge labels are symbols), so Arden applies; solve one variable at a time and take the union of $X_q$ over accepting $q$.

**GATE use.** "Which regex does this DFA accept" MCQs. The trap options differ in where a $b$ may stand: $b^*(ab^*a)^*$ looks like even $a$'s but misses $abab$, and $(b^*ab^*a)^*$ misses $b$.

**Check.** For the even-$a$ DFA, $X_1 = X_0 a + X_1 b$ gives $X_1 = X_0ab^*$, and then $X_0 = \varepsilon + X_0 b + X_0 ab^*a = \varepsilon + X_0(b + ab^*a)$, so $X_0 = (b + ab^*a)^*$ (here $Q = \varepsilon$, $P = b + ab^*a$, and $\varepsilon \notin P$). Enumeration to length 8 confirms that $X_0$ is the even-$a$ strings, that $(b + ab^*a)^*ab^*$ is the odd-$a$ strings ($X_1$), that $abab \notin b^*(ab^*a)^*$, and that $b \notin (b^*ab^*a)^*$.

## Closure properties of regular languages
<!-- topics: toc-finite-automata.closure-properties -->

**Claim.** If $L_1, L_2$ are regular, so are $L_1 \cup L_2$, $L_1 \cap L_2$, $\overline{L_1}$, $L_1 \setminus L_2$, $L_1 \triangle L_2$, $L_1L_2$, $L_1^*$, $L_1^R$, $h(L_1)$ for a homomorphism $h$, and $h^{-1}(L_1)$. Regular languages are not closed under infinite union, nor under taking subsets. If $L$ is regular and $C$ is context-free, $L \cap C$ is context-free but need not be regular.

**Proof.** Union, intersection and difference come from the product DFA (third section); symmetric difference is $(L_1 \setminus L_2) \cup (L_2 \setminus L_1)$; complement is the swap on a total DFA (first section). Concatenation and star follow from Thompson's fragments: an ε-edge from the accept of $L_1$'s ε-NFA to the start of $L_2$'s, or the star gadget.

Reversal: take an NFA for $L_1$, reverse every edge, add a new start with ε-edges to each old accepting state, and make the old start the only accepting state. A path $q_0 \to f$ spelling $w$ becomes a path $f \to q_0$ spelling $w^R$, and conversely, so the new NFA accepts exactly $L_1^R$.

Homomorphism: $h$ maps each symbol to a string and extends by $h(xy) = h(x)h(y)$. Replace each symbol $a$ in a regex $r$ by the regex for $h(a)$. By induction on $r$, the new regex denotes $h(L(r))$, because $h$ commutes with union, concatenation and star ($h(L^*) = h(L)^*$ since $h$ of a product of words is the product of their images).

Inverse homomorphism: from a DFA $M$ for $L_1$ build $M'$ with the same states and $\delta'(q, a) = \delta^*(q, h(a))$. By induction $\delta'^*(q_0, w) = \delta^*(q_0, h(w))$, so $M'$ accepts $w$ iff $h(w) \in L_1$.

Infinite union fails: each $\{a^nb^n\}$ for fixed $n$ is finite and regular, but $\bigcup_n \{a^nb^n\}$ is non-regular (Myhill–Nerode section). Subsets fail: $\{a^nb^n\} \subseteq a^*b^*$. For regular $\cap$ CFL, run the DFA in the PDA's finite control: states become pairs, the PDA moves the DFA component on each consumed input symbol and leaves it unchanged on ε-moves, and accepts when both components accept. With $L = \Sigma^*$ the intersection is $C$ itself, which can be non-regular.

**GATE use.** MSQs listing operations, and quick non-regularity proofs: if $L$ were regular, so would be $L \cap a^*b^*$; showing that intersection is $\{a^nb^n\}$ settles it. Traps: infinite union, subsets of regular languages, and claiming regular $\cap$ CFL is regular.

**Check.** With $L_{eq} = \{w : \#_a(w) = \#_b(w)\}$, enumeration to length 10 confirms $L_{eq} \cap a^*b^* = \{a^nb^n : n \le 5\}$ on those lengths, so $L_{eq}$ is non-regular by closure under intersection. For $h(a) = ab$, $h(b) = b$ and $L_1 = (a + b)^*$, the regex substitution gives $(ab + b)^*$, the image language, which misses $aab$.

## Pumping lemma and quick regularity tests
<!-- topics: toc-finite-automata.pumping-lemma, toc-finite-automata.recognising-regular -->

**Claim.** If $L$ is regular, there is $p \ge 1$ such that every $w \in L$ with $\lvert w \rvert \ge p$ splits as $w = xyz$ with $\lvert xy \rvert \le p$, $\lvert y \rvert \ge 1$, and $xy^iz \in L$ for all $i \ge 0$. The condition is necessary but not sufficient. A unary language $L \subseteq a^*$ is regular iff its set of lengths is eventually periodic: there are $t \ge 0$ and $d \ge 1$ with $n \in S \iff n + d \in S$ for all $n \ge t$.

**Proof.** Let $M$ be a DFA for $L$ with $p$ states. Reading the first $p$ symbols of $w$ visits $q_0, q_1, \dots, q_p$, which is $p + 1$ states, so by pigeonhole $q_i = q_j$ for some $0 \le i < j \le p$. Let $x = w_1 \cdots w_i$, $y = w_{i+1} \cdots w_j$ and $z$ the rest. Then $\lvert xy \rvert = j \le p$, $\lvert y \rvert = j - i \ge 1$, and $y$ takes $q_i$ back to itself, so $xy^iz$ follows the same route to the same final state for every $i \ge 0$. The quantifiers are $\exists p\, \forall w\, \exists$ split $\forall i$; to refute regularity, choose $w$ in terms of $p$ and defeat every legal split.

Applications. $\{0^n1^n\}$: take $w = 0^p1^p$. Since $\lvert xy \rvert \le p$, $y = 0^k$ with $k \ge 1$, and $xz = 0^{p-k}1^p \notin L$. $\{a^{n^2}\}$: take $w = a^{p^2}$ and $\lvert y \rvert = k$ with $1 \le k \le p$; $xy^2z$ has length $p^2 + k$, and $p^2 < p^2 + k \le p^2 + p < (p + 1)^2$, so it is not a square. Primes: take $w = a^q$ with $q$ prime and $q \ge p + 2$, $\lvert y \rvert = k$, and pump $i = q - k$: the length is $q - k + (q - k)k = (q - k)(k + 1)$, a product of two factors each at least 2 (since $k \le p \le q - 2$), hence composite.

Not sufficient: $L = \{a^ib^jc^k : i = 1 \Rightarrow j = k\}$ satisfies the lemma with $p = 2$. If $i = 0$, pump the first symbol, which keeps $i = 0$. If $i = 1$, pump $y = a$: the count of $a$'s becomes $t$ for pumping count $t$, and either $t = 1$ (the string is $w$ itself) or $t \ne 1$ and the condition no longer applies. If $i = 2$, pump $y = aa$, keeping $i$ even. If $i \ge 3$, pump one $a$, keeping $i \ge 2$. Yet $L \cap ab^*c^* = \{ab^nc^n\}$ is non-regular, so $L$ is non-regular.

Unary languages: a DFA over one letter follows a single path $q_0, q_1, q_2, \dots$, which must revisit a state, so it is a tail of length $t$ followed by a cycle of length $d$, and for $n \ge t$ the state after $a^n$ depends only on $n \bmod d$; the length set is eventually periodic. Conversely an eventually periodic set is a finite part below $t$ plus finitely many residue classes $a^{t + r}(a^d)^*$, a regex. The squares are not eventually periodic: for large $m$ the gap $2m + 1$ exceeds $d$, so $m^2 \in S$ would force $m^2 + d \in S$ strictly between consecutive squares.

**GATE use.** MSQs "which of these are regular". Simplify first. Every finite language is regular. $\{ww : w \in a^*\} = (aa)^*$. $\{wxw^R : w, x \in \{a, b\}^+\}$ collapses: take $w$ to be the first symbol, so it is the strings of length at least 3 whose first and last symbols agree. $\{a^nb^m : n \equiv m \pmod 3\}$ is regular (counters mod 3), while $\{a^nb^m : n \le m\}$ is not ($a^j$ for distinct $j$ are separated by $b^i$). Traps: picking the split yourself in a pumping proof, pumping with $i = 1$, and using the lemma to "prove" regularity.

**Check.** For $p = 6$, every legal split of $0^61^6$ gives $xz \notin L$. For $p < 30$, every $p^2 + k$ with $1 \le k \le p$ lies strictly between $p^2$ and $(p+1)^2$; for $p < 40$ the pumped prime lengths $(q - k)(k + 1)$ are all composite. Every member of $L = \{a^ib^jc^k : i = 1 \Rightarrow j = k\}$ of length 2 to 9 has a split with $\lvert xy \rvert \le 2$ that survives pumping counts 0 to 6. The $wxw^R$ collapse agrees with the direct definition on all strings to length 8, and $\{a^nb^m : n \equiv m \pmod 3\}$ has 7 Nerode classes (3 while reading $a$'s, 3 while reading $b$'s, and a dead state).

## Decision properties: emptiness, finiteness, equivalence
<!-- topics: toc-finite-automata.decision-properties -->

**Claim.** For a DFA $M$ with $n$ states over $k$ symbols: membership of $w$ takes $O(\lvert w \rvert)$ steps; $L(M) \ne \emptyset$ iff an accepting state is reachable from $q_0$, and then some accepted string has length $< n$; $L(M)$ is infinite iff $M$ accepts some string $w$ with $n \le \lvert w \rvert \le 2n - 1$, equivalently iff some cycle lies on a path from $q_0$ to an accepting state. Emptiness and finiteness take $O(nk)$ time. $L(M_1) = L(M_2)$ iff no reachable product pair has exactly one accepting component, in $O(k\, n_1 n_2)$ time, and $L_1 \subseteq L_2$ iff $L_1 \cap \overline{L_2} = \emptyset$.

**Proof.** Membership runs $\delta$ once per symbol. Emptiness: an accepted string is a path from $q_0$ to an accepting state, so $L \ne \emptyset$ iff BFS or DFS over the $nk$ edges reaches $F$. A shortest accepted string visits no state twice (a repeat could be cut out, as in the pumping argument), so it has fewer than $n$ symbols.

Finiteness. If $M$ accepts $w$ with $\lvert w \rvert \ge n$, the pumping lemma with $p = n$ gives a split with $xy^iz \in L$ for all $i$, infinitely many strings. Conversely, let $L$ be infinite. It then contains strings of length $\ge n$; let $w$ be a shortest one. Suppose $\lvert w \rvert \ge 2n$. Apply the pigeonhole argument to the first $n$ symbols: $w = xyz$ with $1 \le \lvert y \rvert \le n$ and $xz \in L$. Then $\lvert xz \rvert \ge 2n - n = n$ and $\lvert xz \rvert < \lvert w \rvert$, contradicting the choice of $w$. So $n \le \lvert w \rvert \le 2n - 1$. In graph terms, restrict to useful states (reachable from $q_0$ and able to reach $F$); a string of length $\ge n$ on such states repeats a state and so traces a cycle, and a useful cycle can be pumped, so infinite iff the useful subgraph has a cycle. Reachability, co-reachability and a DFS cycle check are each $O(nk)$.

Equivalence: $L_1 \ne L_2$ iff the symmetric difference is non-empty, iff the product DFA reaches a pair with exactly one accepting component; BFS over $n_1 n_2$ pairs with $k$ edges each. Alternatively minimise both and compare up to renaming, which is correct by the uniqueness in Myhill–Nerode. Inclusion is emptiness of a product with the complement. All of these are decidable for regular languages; for context-free languages equivalence and inclusion are undecidable.

**GATE use.** "Which of these problems is decidable" MCQs, and the finiteness window. The trap is the window: a string of length exactly $n$ is not required, and the range ends at $2n - 1$, not $n$.

**Check.** Over 3000 random DFAs with 1 to 5 states on $\{a, b\}$, "accepts some string of length in $[n, 2n - 1]$" agreed with "the useful subgraph has a cycle" in every case. The 6-state minimisation example above accepts only strings of length 2: its useful subgraph (A, B, C, D, E) is acyclic, and no string of length 6 to 11 is accepted, so the language is finite.
