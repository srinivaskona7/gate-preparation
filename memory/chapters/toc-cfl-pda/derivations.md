# Context-free languages and pushdown automata: derivations

## Parse trees, leftmost derivations and the language of a grammar
<!-- topics: toc-cfl-pda.cfg-definition, toc-cfl-pda.derivations-parse-trees -->

**Claim.** Let $G = (V, T, P, S)$ be a CFG. A derivation step replaces one occurrence of a variable $A$ in a sentential form by the body $\alpha$ of a production $A \to \alpha$; a derivation is leftmost when every step rewrites the leftmost variable. For every variable $A$ and terminal string $w$:

1. the parse trees with root $A$ and yield $w$ are in one-to-one correspondence with the leftmost derivations $A \Rightarrow^*_{lm} w$, and likewise with the rightmost derivations;
2. a single tree generally has many derivations that are neither leftmost nor rightmost, so counting arbitrary derivations overcounts;
3. $S \to aSb \mid \varepsilon$ generates exactly $\{a^n b^n \mid n \ge 0\}$.

**Proof.** (1) From a tree to a leftmost derivation: start with the root alone, whose frontier is $A$. Repeatedly take the leftmost variable on the frontier of the part built so far and attach its children from the tree. Each frontier is a sentential form, each attachment applies the production recorded at that node, and the variable expanded is the leftmost one, so the sequence is a leftmost derivation ending in the yield $w$. From a leftmost derivation to a tree: induction on its length, adding the children of the leaf that the step rewrites. The two maps are inverse to each other. Two different trees have a first node, in preorder, at which they apply different productions; the leftmost derivations agree up to the step that expands that node and differ there, so the correspondence is injective in both directions. The rightmost case is the mirror image (expand the rightmost frontier variable). Context-freeness is what makes this work: a variable is rewritten the same way whatever surrounds it, so the tree records everything about a derivation except the order of independent steps.

(2) A tree with internal nodes $x$ and $y$, neither an ancestor of the other, can expand $x$ before $y$ or after, and both orders are derivations of the same tree. With $S \to AB$, $A \to a$, $B \to b$ the string $ab$ has the derivations $S \Rightarrow AB \Rightarrow aB \Rightarrow ab$ and $S \Rightarrow AB \Rightarrow Ab \Rightarrow ab$ but only one tree.

(3) Every sentential form reachable from $S$ is $a^k S b^k$ or $a^k b^k$: true for $S$ itself ($k = 0$), and the two productions turn $a^k S b^k$ into $a^{k+1} S b^{k+1}$ or $a^k b^k$, while $a^k b^k$ has no variable left. So $L(G) \subseteq \{a^n b^n\}$. Conversely $n$ uses of $S \to aSb$ and one of $S \to \varepsilon$ derive $a^n b^n$.

**GATE use.** Ambiguity is defined by two parse trees, equivalently two leftmost derivations, of one string. The trap is accepting two different derivations as proof of ambiguity, as in the $ab$ example: a leftmost and a rightmost derivation of the same tree, or two derivation orders, are not two trees. Language-of-a-grammar MCQs are settled by the invariant method of part 3: find the shape of every sentential form.

**Check.** A script computed $L(G)$ up to length 12 for $S \to aSb \mid \varepsilon$ and got exactly $a^n b^n$, $0 \le n \le 6$. For $S \to 0S0 \mid 1S1 \mid 0 \mid 1 \mid \varepsilon$ it got exactly the 93 binary palindromes of length at most 9 ($\sum_{n=0}^{9} 2^{\lceil n/2 \rceil} = 93$). For $S \to SS \mid a$ it enumerated the leftmost derivations of $a^n$, $n \le 7$, and their number equalled the number of parse trees each time.

## Counting parse trees: the Catalan recurrence
<!-- topics: toc-cfl-pda.ambiguity -->

**Claim.** In a grammar without $\varepsilon$-productions, let $N(n)$ be the number of parse trees of $a^n$ from $S$.

1. For $S \to SS \mid a$: $N(1) = 1$ and $N(n) = \sum_{k=1}^{n-1} N(k)\,N(n-k)$ for $n \ge 2$, so $N(n) = C_{n-1} = \frac{1}{n}\binom{2n-2}{n-1}$, giving $1, 1, 2, 5, 14, 42$ for $n = 1, \dots, 6$.
2. For $S \to aS \mid Sa \mid a$: $N(n) = 2^{n-1}$.
3. For $E \to E + E \mid E * E \mid a$, a string with $k$ operators has $C_k$ trees; the layered grammar $E \to E + T \mid T$, $T \to T * F \mid F$, $F \to a$ gives every string exactly one tree.

**Proof.** (1) For $n = 1$ only $S \to a$ applies. For $n \ge 2$ the root must use $S \to SS$, since $S \to a$ yields one symbol. The left child yields a prefix $a^k$ and the right child the suffix $a^{n-k}$. With no $\varepsilon$-production every variable yields at least one symbol, so $1 \le k \le n - 1$. For a fixed $k$ the two subtrees are chosen independently, $N(k) N(n-k)$ ways, and trees with different $k$ or different subtrees are different trees; summing over $k$ gives the recurrence. The Catalan numbers satisfy $C_0 = 1$ and $C_m = \sum_{i=0}^{m-1} C_i C_{m-1-i}$. Put $N(n) = C_{n-1}$: then $\sum_{k=1}^{n-1} C_{k-1} C_{n-k-1} = \sum_{i=0}^{n-2} C_i C_{n-2-i} = C_{n-1}$, so the recurrence and the base case match. For the closed form, the generating function $c(x) = \sum_m C_m x^m$ satisfies $c = 1 + x c^2$, so $c(x) = \frac{1 - \sqrt{1 - 4x}}{2x}$ (the root that is finite at $x = 0$). Expanding $\sqrt{1-4x}$ by the binomial series, the coefficient of $x^{m+1}$ is $-\frac{2}{m+1}\binom{2m}{m}$, which gives $C_m = \frac{1}{m+1}\binom{2m}{m}$; with $m = n - 1$ this is $\frac1n\binom{2n-2}{n-1}$.

(2) For $n \ge 2$ the root uses $S \to aS$ or $S \to Sa$, and in either case the single child $S$ yields $a^{n-1}$. So $N(n) = 2N(n-1)$ with $N(1) = 1$.

(3) A tree of $E \to E+E \mid E*E \mid a$ for $k$ operators chooses one operator as the root and splits the remaining operators into the left and right operand, which is the recurrence of part 1 with $k + 1$ operands. The layered grammar forces $+$ above $*$ and makes both left-associative: the root of an $E$ subtree is the last $+$ outside every $T$, which is a unique position, and the same holds for $*$ inside $T$.

**GATE use.** The 2-mark NAT "how many parse trees does $aaaa$ have under $S \to SS \mid a$" has answer 5, not 4 or 6. The general recipe is $N(w) = \sum$ over root productions and splits of $w$ of the product of the subcounts. To show a grammar ambiguous one string with two trees is enough, such as $aaa$ above or $a + a * a$; for $S \to aS \mid Sa \mid a$ the string $aa$ already has two. Inherent ambiguity is a property of the language: for $\{a^n b^n c^m\} \cup \{a^n b^m c^m\}$ every grammar gives some string $a^n b^n c^n$ two trees (Hopcroft and Ullman prove it with Ogden's lemma), so no unambiguous grammar exists.

**Check.** A tree-counting script gave $1, 1, 2, 5, 14, 42, 132, 429$ for $a^1, \dots, a^8$ under $S \to SS \mid a$, equal to $\frac1n\binom{2n-2}{n-1}$ each time, and $1, 2, 4, \dots, 128$ under $S \to aS \mid Sa \mid a$. Under $E \to E+E \mid E*E \mid a$ it found 2 trees for $a+a*a$ and $5 = C_3$ for $a+a+a+a$; the layered grammar gave one tree for $a+a*a$, $a*a+a*a$ and $a+a+a+a$.

## Simplification: nullable symbols and the safe order of removals
<!-- topics: toc-cfl-pda.simplification -->

**Claim.** For a CFG $G$ with start symbol $S$:

1. The fixpoint that first marks every $A$ with $A \to \varepsilon$ and then every $A$ with a body made only of marked variables marks exactly the nullable variables ($A \Rightarrow^* \varepsilon$).
2. Replacing each production $A \to X_1 \cdots X_k$ by every version with some subset of its nullable occurrences deleted, discarding empty bodies, gives $G'$ with $L(G') = L(G) - \{\varepsilon\}$. A body with $j$ nullable occurrences yields $2^j$ versions, one fewer when the body consists only of nullable symbols; the production count is the number of distinct bodies, so identical versions, or a version equal to an existing production, count once.
3. Giving each $A$ every non-unit body of every $B$ with $A \Rightarrow^* B$ by unit productions, and dropping all unit productions, preserves the language.
4. Removing non-generating symbols and then unreachable symbols leaves no useless symbol; the reverse order can leave one.
5. The order $\varepsilon$-productions, unit productions, useless symbols ends with none of the three.

**Proof.** (1) Each marked variable is nullable, by induction on the round in which it was marked. Conversely, if $A \Rightarrow^* \varepsilon$ by a tree of height $h$, every child of the root yields $\varepsilon$ by a tree of smaller height, so by induction all of them are marked, and $A$ is marked in the next round.

(2) $L(G') \subseteq L(G)$: a new production $A \to \beta'$ is simulated by the original $A \to \beta$ followed by deriving $\varepsilon$ from each deleted occurrence. $L(G) - \{\varepsilon\} \subseteq L(G')$: take a tree of $G$ for a nonempty $w$ and delete every subtree whose yield is $\varepsilon$. Each deleted child is nullable, every remaining internal node still has a nonempty yield and hence at least one child, and its remaining children spell a version of its original body, so the pruned tree is a tree of $G'$ with the same yield. The count: each of the $j$ nullable occurrences is kept or deleted, $2^j$ ways, and the empty choice is discarded when nothing else is left in the body.

(3) Every new production is simulated by a chain of unit steps followed by a non-unit step of $G$. Conversely, in a tree of $G$ a maximal chain of nodes $A \to B_1 \to \cdots \to B_r$ in which each has a single variable child ends in a node using a non-unit body $\alpha$ of $B_r$; collapse the chain to one node using $A \to \alpha$, which is in the new grammar.

(4) After the non-generating symbols and every production that mentions one are deleted, each remaining variable still generates, because its generating tree used only generating symbols. Deleting unreachable symbols next cannot spoil this: the generating tree of a reachable $X$ uses only symbols reachable from $X$, which are reachable from $S$. So every remaining $X$ satisfies $S \Rightarrow^* \alpha X \beta$ with every symbol of $\alpha X \beta$ generating, and $X$ occurs in a derivation of a terminal string. In the other order, take $S \to AB \mid a$, $A \to b$, $B \to Bb$: every symbol is reachable, $B$ is non-generating, and deleting it removes $S \to AB$, after which $A$ is unreachable and stays behind.

(5) Each removal can create work for the later ones but not for the earlier ones. $\varepsilon$-removal creates unit productions ($S \to AB$ with $A$ nullable gives $S \to B$) and can leave a variable with no productions: $S \to AB$, $A \to \varepsilon$, $B \to b$ becomes $S \to AB \mid B$ with $A$ non-generating. Unit removal can make a variable unreachable ($S \to B$, $B \to b$ becomes $S \to b$) but never adds an $\varepsilon$-body. Useless-symbol removal only deletes productions, so it creates neither $\varepsilon$- nor unit productions. Doing useless symbols first, as some lists do, can leave useless symbols at the end.

**GATE use.** NAT questions count nullable variables or the productions of one variable after $\varepsilon$-removal, using the $2^j$ rule, counting distinct bodies only ($S \to AA$ with $A$ nullable gives $S \to AA \mid A$, 2 productions, not $2^2 - 1 = 3$), and remembering that $S \to \varepsilon$ is added back only when $\varepsilon \in L$ and is often excluded from the count. MCQs ask for the order of the three removals; the answer is $\varepsilon$, unit, useless.

**Check.** For $S \to ABC$, $A \to aA \mid \varepsilon$, $B \to bB \mid C$, $C \to c \mid \varepsilon$, $D \to d$ the script marked $A, C$, then $B$, then $S$: 4 nullable variables. For $S \to AB$, $A \to aA \mid \varepsilon$, $B \to bB \mid \varepsilon$ it produced $S \to AB \mid A \mid B$, 3 productions ($2^2 - 1$). The errata grammar became $S \to AB \mid B$ with $A$ useless. On 400 random grammars over 4 variables the order $\varepsilon$, unit, useless preserved $L - \{\varepsilon\}$ on every string up to length 5 and left no $\varepsilon$-production, unit production or useless symbol; running useless removal first left useless symbols in 157 of them.

## Normal forms: derivation lengths and conversion counts
<!-- topics: toc-cfl-pda.cnf, toc-cfl-pda.gnf -->

**Claim.** Let $w$ be a terminal string with $|w| = n \ge 1$.

1. In a CNF grammar (productions $A \to BC$ and $A \to a$, and no $\varepsilon$-production except possibly $S \to \varepsilon$, which is not used for $w$), every derivation of $w$, leftmost or not, has exactly $n - 1$ steps of the form $A \to BC$ and $n$ of the form $A \to a$: $2n - 1$ steps. Its parse tree has $2n - 1$ internal nodes.
2. In a GNF grammar (every production $A \to a\alpha$ with $\alpha \in V^*$), every derivation of $w$ has exactly $n$ steps.
3. Converting a body $X_1 \cdots X_k$ of length $k \ge 3$ to CNF adds $k - 2$ new variables and replaces one production by $k - 1$ binary ones; each terminal inside a body of length at least 2 is replaced by a variable $X_a$ with the single production $X_a \to a$.

**Proof.** (1) Track the number $v$ of variables and $t$ of terminals in the sentential form. A step $A \to BC$ changes $(v, t)$ by $(+1, 0)$, a step $A \to a$ by $(-1, +1)$. The derivation starts at $(1, 0)$ and ends at $(0, n)$. If it uses $b$ binary and $c$ terminal steps then $t$ gives $c = n$ and $v$ gives $1 + b - c = 0$, so $b = n - 1$ and the total is $2n - 1$. Nothing here depends on the order of the steps, so the count is the same for every derivation and for every string of length $n$, ambiguous or not. Each step is one internal node of the tree.

(2) Each step $A \to a\alpha$ adds exactly one terminal, and $w$ has $n$ terminals.

(3) Replace $A \to X_1 X_2 \cdots X_k$ by $A \to X_1 Y_1$, $Y_1 \to X_2 Y_2$, …, $Y_{k-2} \to X_{k-1} X_k$, with fresh $Y_1, \dots, Y_{k-2}$. Each $Y_i$ has one production, so $Y_1 \Rightarrow^* X_2 \cdots X_k$ in exactly one way and the language is unchanged. A terminal $a$ inside a long body cannot stay there in CNF; $X_a \to a$ has one production, so the substitution again changes no language.

**GATE use.** The 1-mark NAT "a CNF grammar derives a string of length 6 in how many steps" has answer 11. The traps are $2n$ (counting the start symbol as a step) and $2n + 1$; for GNF the answer is $n$. Conversion questions count new variables or productions with the $k - 2$ and $X_a$ rules. A GNF grammar has no left recursion, because every body starts with a terminal.

**Check.** For the CNF grammar $S \to AB \mid BC$, $A \to BA \mid a$, $B \to CC \mid b$, $C \to AB \mid a$ a script enumerated every leftmost derivation of every string over $\{a, b\}$ of length 1 to 6, and each had $2n - 1$ steps. The conversion of $S \to aSb \mid ab$ to $S \to X_a Y \mid X_a X_b$, $Y \to S X_b$, $X_a \to a$, $X_b \to b$ generated exactly $a^n b^n$, $1 \le n \le 6$, and derived $aabb$ in 7 steps. The GNF grammar $S \to aSB \mid aB$, $B \to b$ derived each $a^n b^n$, $n \le 5$, in exactly $2n$ steps.

## CYK: the table invariant and the cost
<!-- topics: toc-cfl-pda.cyk -->

**Claim.** Let $G$ be in CNF and $w = w_1 \cdots w_n$. CYK fills cells $T[i, j]$, $1 \le i \le j \le n$, by $T[i, i] = \{A : A \to w_i\}$ and, for $j > i$,
$$T[i, j] = \{A : A \to BC,\ B \in T[i, k],\ C \in T[k+1, j] \text{ for some } i \le k < j\}.$$
Then $T[i, j] = \{A : A \Rightarrow^* w_i \cdots w_j\}$, so $w \in L(G)$ exactly when $S \in T[1, n]$. The table has $\frac{n(n+1)}{2}$ cells, the splits examined number $\sum_{l=1}^{n} (n - l + 1)(l - 1) = \frac{n^3 - n}{6}$, and with $|G|$ productions the time is $O(n^3 |G|)$ and the space $O(n^2)$.

**Proof.** Induction on the length $l = j - i + 1$. For $l = 1$: in CNF without $\varepsilon$-productions a body $BC$ yields at least two symbols, so $A \Rightarrow^* w_i$ only through $A \to w_i$. For $l \ge 2$: a derivation $A \Rightarrow^* w_i \cdots w_j$ cannot start with $A \to a$, so it starts with some $A \to BC$; $B$ yields a nonempty prefix $w_i \cdots w_k$ and $C$ the nonempty rest, both shorter than $l$, so by induction $B \in T[i, k]$ and $C \in T[k+1, j]$ and $A$ is put in the cell. Conversely, every $A$ put in the cell has such a derivation. Both directions use CNF: with a unit production $A \to B$ a variable could derive a substring without splitting it, and with $\varepsilon$-productions a split part could be empty, so the recurrence would miss variables. There are $n - l + 1$ cells of length $l$, which sum to $\frac{n(n+1)}{2}$, and each has $l - 1$ splits. With $m = l - 1$,
$$\sum_{m=0}^{n-1} (n - m)\,m = n \cdot \frac{n(n-1)}{2} - \frac{(n-1)n(2n-1)}{6} = \frac{n(n-1)\,[3n - (2n - 1)]}{6} = \frac{(n-1)\,n\,(n+1)}{6}.$$
Each split scans the productions once, which gives $O(n^3 |G|)$; the table itself holds $O(n^2)$ sets of at most $|V|$ variables.

**GATE use.** A 2-mark question gives a CNF grammar and a string and asks for one cell or the top cell. Fill by increasing length and try all $l - 1$ splits per cell; missing a split is the usual slip. A 1-mark MCQ asks what CYK needs and costs: CNF and $O(n^3)$. Running CYK on a GNF grammar or any non-CNF grammar is the trap.

**Check.** For the grammar of the previous check and $w = baaba$ the script filled length 1: $\{B\}, \{A, C\}, \{A, C\}, \{B\}, \{A, C\}$; length 2: $\{S, A\}, \{B\}, \{S, C\}, \{S, A\}$; length 3: $\emptyset, \{B\}, \{B\}$; length 4: $\emptyset, \{S, A, C\}$; length 5: $\{S, A, C\}$, so $baaba \in L$. CYK agreed with membership computed from the grammar on all 126 strings of length 1 to 6. For $n = 5$ there are 15 cells and 20 splits, and the closed forms held for every $n \le 11$.

## The CNF yield bound and the pumping lemma
<!-- topics: toc-cfl-pda.cnf, toc-cfl-pda.pumping-lemma -->

**Claim.** (1) If the longest root-to-leaf path of a CNF parse tree has $h$ edges, its yield has length at most $2^{h-1}$. (2) Pumping lemma: let $L$ be context-free and let $G$ be a CNF grammar with $m$ variables for $L - \{\varepsilon\}$. With $p = 2^m$, every $s \in L$ with $|s| \ge p$ can be written $s = uvxyz$ with $|vxy| \le p$, $|vy| \ge 1$ and $uv^i x y^i z \in L$ for every $i \ge 0$.

**Proof.** (1) Induction on $h$. If $h = 1$ the root uses $A \to a$ and the yield has length 1. If $h \ge 2$ the root uses $A \to BC$, both subtrees have longest paths of at most $h - 1$ edges, and the yield has length at most $2 \cdot 2^{h-2} = 2^{h-1}$.

(2) Take any parse tree of $s$ and let $h$ be the number of edges on its longest path $\pi$. By (1), $2^{h-1} \ge |s| \ge 2^m$, so $h \ge m + 1$. The path $\pi$ has $h + 1$ nodes, the last a terminal leaf, so it has $h \ge m + 1$ variable nodes. Look at the lowest $m + 1$ of them: by pigeonhole two carry the same variable $R$. Call the upper one $R_1$ and the lower one $R_2$. Let $x$ be the yield of $R_2$ and $vxy$ the yield of $R_1$, and let $s = uvxyz$.

- $|vxy| \le p$: the longest path below $R_1$ has at most $m + 1$ edges, because $\pi$ is a longest path of the whole tree and $R_1$ lies among its lowest $m + 1$ variables. By (1) the yield of $R_1$ has length at most $2^m = p$.
- $|vy| \ge 1$: $R_1$ has a variable descendant, so it uses some $R \to BC$. One child's subtree contains $R_2$; the other child yields a nonempty string (CNF has no $\varepsilon$-production), and that string is part of $v$ or of $y$.
- Pumping: $R \Rightarrow^* vRy$ and $R \Rightarrow^* x$. Replacing the subtree of $R_2$ by a copy of the subtree of $R_1$, $i - 1$ times, gives a tree for $uv^i x y^i z$; replacing the subtree of $R_1$ by that of $R_2$ gives $uxz$, the case $i = 0$.

The lemma is a necessary condition only. $\{a^i b^j c^k d^l \mid i = 0 \text{ or } j = k = l\}$ satisfies it (when $i \ge 1$ pump the first $a$ alone; when $i = 0$ pump inside one block), yet intersecting it with the regular set $a^+ b^* c^* d^*$ gives $\{a^i b^n c^n d^n \mid i \ge 1\}$, which is not context-free: the homomorphism that erases $a$ and renames $b, c, d$ to $a, b, c$ maps it onto $\{a^n b^n c^n \mid n \ge 0\}$, CFLs are closed under homomorphism, and the next section shows $a^n b^n c^n$ is not context-free.

**GATE use.** MCQs ask which conditions the lemma imposes; the usual wrong options drop $|vy| \ge 1$, write $|vy| \le p$ in place of $|vxy| \le p$, or pump $v$ and $y$ by different exponents. MSQs ask what a passing language proves: nothing. The yield bound also gives the formula $p = 2^m$ asked as a NAT.

**Check.** A script computed the maximum yield of $S \to SS \mid a$ trees with longest path $h$ as $1, 2, 4, 8, 16, 32$ for $h = 1, \dots, 6$, equal to $2^{h-1}$ up to $h = 11$. For $\{a^i b^j c^k d^l \mid i = 0 \text{ or } j = k = l\}$ it found, for $p = 1, 2, 3$, a split surviving $i = 0, \dots, 4$ for every member of length up to 8.

## Pumping arguments for the standard non-CFLs
<!-- topics: toc-cfl-pda.pumping-lemma, toc-cfl-pda.classifying-languages -->

**Claim.** None of the following is context-free, with the string $s$ that defeats every split:

1. $\{a^n b^n c^n \mid n \ge 0\}$ with $s = a^p b^p c^p$;
2. $\{a^m b^n c^m d^n \mid m, n \ge 0\}$ (crossing counts) with $s = a^p b^p c^p d^p$;
3. $\{ww \mid w \in \{a, b\}^*\}$ with $s = a^p b^p a^p b^p$;
4. $\{a^q \mid q \text{ prime}\}$ with $s = a^r$ for a prime $r \ge p$.

For $\{ww\}$ the string $a^p b a^p b$ does not work: $u = a^{p-1}$, $v = a$, $x = b$, $y = a$, $z = a^{p-1}b$ pumps.

**Proof.** In each case assume a pumping length $p$ and any split $s = uvxyz$ with $|vxy| \le p$ and $|vy| = k \ge 1$. Pumping down, $s' = uxz$, deletes $k$ symbols from the window $vxy$ and keeps the order of the rest.

(1) The window has length at most $p$ and each block has length $p$, so it meets at most two of the three blocks. In $s'$ the untouched block still has $p$ letters and some touched block has fewer, so the counts are unequal and $s' \notin L$.

(2) Again the window meets at most two adjacent blocks: $(a, b)$, $(b, c)$ or $(c, d)$. No adjacent pair is a matched pair, since the matches are $a$ with $c$ and $b$ with $d$. Deleting at least one symbol from one or two adjacent blocks therefore changes a block whose partner is untouched, and $s' \in a^* b^* c^* d^*$ breaks $\#a = \#c$ or $\#b = \#d$.

(3) If $k$ is odd, $|s'| = 4p - k$ is odd and $s' \notin L$. Let $k$ be even, so the half length of $s'$ is $2p - k/2$, and $k/2 \le p/2$. The window lies in the first $a^p b^p$, in the middle $b^p a^p$, or in the last $a^p b^p$.
- First half of $s$: $s' = a^{p-k_1} b^{p-k_2} a^p b^p$ with $k_1 + k_2 = k$. Its second half, the last $2p - k/2$ symbols, is $a^{p-k/2} b^p$ and ends in $b$. Its first half consists of the $2p - k$ symbols before the third block and then $k/2 \ge 1$ symbols of that block, so it ends in $a$. The halves differ.
- Last half of $s$: $s' = a^p b^p a^{p-k_1} b^{p-k_2}$. Its first half is $a^p b^{p-k/2}$ and starts with $a$; its second half starts with the last $k/2 \ge 1$ symbols of the second block, so it starts with $b$. The halves differ.
- Middle: $s' = a^p b^{p-k_1} a^{p-k_2} b^p$. If $s' = ww$ then $w$ starts with $a$ and ends with $b$, as $s'$ does. The first half ends in $b$, so the midpoint lies inside or at the end of the block $b^{p-k_1}$; the second half starts with $a$, so the midpoint is exactly at the end of that block. Then $w = a^p b^{p-k_1}$ and $w = a^{p-k_2} b^p$, which forces $k_1 = k_2 = 0$, contradicting $k \ge 1$.

(4) Pump up with $i = r + 1$: $|uv^{r+1}xy^{r+1}z| = r + rk = r(1 + k)$, a product of two factors at least 2, hence not prime.

For $a^p b a^p b$ with the split given: $uv^i x y^i z = a^{p-1+i}\, b\, a^{p-1+i}\, b = ww$ with $w = a^{p-1+i} b$, and $|vxy| = 3 \le p$ once $p \ge 3$. The prover chooses only $s$, and the lemma promises that some split pumps, so this $s$ proves nothing.

**GATE use.** Classification MSQs. One stack can check one count relation or one nested (mirrored) structure: $a^n b^{2n}$, $a^n b^m c^{n+m}$, $\{a^i b^j c^k \mid i = j \text{ or } j = k\}$ and $ww^R$ are CFLs. Two relations that must hold together ($i = j$ and $j = k$), crossing matches and copies are not. Over a one-letter alphabet every CFL is regular (a consequence of Parikh's theorem), so $a^{\text{prime}}$ and $a^{n^2}$ are not CFLs either. The trap is a string choice that admits a pumpable split, as with $a^p b a^p b$.

**Check.** A script tried every split with $|vxy| \le p$ and $|vy| \ge 1$, for $p = 1, \dots, 7$: none of $a^p b^p c^p$, $a^p b^p c^p d^p$ and $a^p b^p a^p b^p$ survived $i \in \{0, 2\}$, and for $p \le 8$ the case $i = 0$ alone defeated every split of $a^p b^p c^p$ and of $a^p b^p a^p b^p$. For $a^r$ with $r$ the least prime at least $p$, $p \le 11$, no split survived $i = 0, \dots, r + 1$. For $a^p b a^p b$, $p = 3, \dots, 7$, it found pumpable splits, and the split above stayed in $\{ww\}$ for $i = 0, \dots, 9$.

## Acceptance by final state and by empty stack
<!-- topics: toc-cfl-pda.pda-model, toc-cfl-pda.dcfl -->

**Claim.** A PDA is $(Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$ with $\delta : Q \times (\Sigma \cup \{\varepsilon\}) \times \Gamma \to$ finite subsets of $Q \times \Gamma^*$; a move pops the top symbol and pushes a string. A string is accepted by final state if some run consumes it and ends in a state of $F$, and by empty stack if some run consumes it and empties the stack.

1. For nondeterministic PDAs the two modes accept the same languages.
2. If a DPDA accepts $L$ by empty stack, $L$ is prefix-free: no string of $L$ is a proper prefix of another. So $\{a^n b^m \mid n \ge m\}$, a DCFL containing $a$ and $aa$, is accepted by no empty-stack DPDA, which is why DPDAs are defined with final-state acceptance.

**Proof.** (1) Final state to empty stack: add a new start state that pushes $Z_0$ above a new bottom symbol $X_0$ and enters $q_0$; from every state of $F$ add $\varepsilon$-moves into a new state $e$, and in $e$ pop every symbol, $X_0$ included. If the original run consumes $w$ and reaches $F$, the new run continues into $e$ and empties the stack. Conversely the stack can become empty only in $e$, because $X_0$ is popped nowhere else, so the original machine emptying its own stack in a non-final state does not count; $e$ has no input moves and is entered only from $F$, so an emptied stack after consuming $w$ means the original run reached $F$ after consuming $w$.

Empty stack to final state: again put a new bottom $X_0$ under $Z_0$, and from every state add an $\varepsilon$-move to a new final state $f$ when $X_0$ is on top. $X_0$ is on top exactly when the original stack is empty, so the new machine reaches $f$ after consuming $w$ exactly when the original empties its stack after consuming $w$. Neither construction needs determinism of the original, but the drain loop of the first adds $\varepsilon$-moves that can clash with input moves, which is where the deterministic case breaks.

(2) Suppose a DPDA accepts $x$ and $xy$ by empty stack with $y \ne \varepsilon$. In each configuration a DPDA has at most one move, and no input move when an $\varepsilon$-move is defined. So the run on $xy$ reads $x$ exactly as the run on $x$ does and then takes the same forced $\varepsilon$-moves, reaching the configuration with empty stack while $y$ is unread. No move is defined on an empty stack, so $xy$ is rejected, a contradiction.

**GATE use.** MSQs on PDA facts: the two modes are equivalent for NPDAs only; an empty-stack DPDA accepts a DCFL only when it is prefix-free, and appending an end marker $\$$ makes any DCFL prefix-free. The transition-function MCQ tests the signature: one input symbol or $\varepsilon$, one popped symbol, a pushed string in $\Gamma^*$.

**Check.** A PDA simulator ran a final-state DPDA for $\{a^n b^{2n} \mid n \ge 1\}$, its empty-stack conversion and the conversion back to final state; all three agreed with the definition on every string over $\{a, b\}$ of length up to 10. Over strings up to length 8, $\{a^n b^n \mid n \ge 1\}$ was prefix-free and $\{a^n b^m \mid n \ge m\}$ was not.

## Designing PDAs: the stack invariant of each standard machine
<!-- topics: toc-cfl-pda.pda-design -->

**Claim.** Each machine below starts with $Z_0$ on the stack, accepts by final state, and is proved by the stated invariant on the configuration after a prefix of the input.

1. $\{a^n b^{2n} \mid n \ge 1\}$: push $XX$ per $a$, pop one $X$ per $b$. After $a^i b^j$ with $j \le 2i$ the stack is $X^{2i-j} Z_0$.
2. $\{a^{2n} b^n \mid n \ge 1\}$: push one $X$ per $a$ and pop two per $b$ (the second pop is an $\varepsilon$-move from an intermediate state), or push on every second $a$ and pop one per $b$. After $a^i b^j$ with $2j \le i$ the stack is $X^{i-2j} Z_0$.
3. Equal numbers of $a$'s and $b$'s: with $d = \#a - \#b$ the stack above $Z_0$ holds $|d|$ copies of $A$ if $d > 0$ and of $B$ if $d < 0$. Marking the bottom copy lets the machine return to its accepting state exactly when $d$ returns to 0, and every move reads input, so it is deterministic.
4. $\{wcw^R\}$: push symbols until $c$, then pop and compare. Deterministic.
5. $\{ww^R\}$: the same, but the switch from pushing to popping is a guessed $\varepsilon$-move. An accepting run exists exactly when the guess is the true middle.

**Proof.** (1) Each $a$ adds two $X$'s and each $b$ removes one, which gives the invariant; a $b$ arriving with $Z_0$ on top has no move, and an $a$ after a $b$ has no move. The input is accepted when $Z_0$ is back on top after at least one $b$, that is when $2i - j = 0$ with $i \ge 1$. (2) The same count with $+1$ per $a$ and $-2$ per $b$ gives $i - 2j$, and acceptance at $i = 2j$, $j \ge 1$. Popping one $X$ for every two $b$'s instead gives $i - j/2$ and acceptance at $j = 2i$, which is $a^n b^{2n}$, the wrong language. (3) A matching letter pushes, an opposite letter pops, so the stack always encodes $d$. (4) After $u c v$, while the comparison has not failed, the stack is the unmatched part of $u$, read from its end, above $Z_0$; it is empty of letters exactly when $v = u^R$. (5) For $x = ww^R$ the run that switches after $w$ is the run of (4) with the marker removed. Conversely a run that switches after a prefix $u$ and empties the stack has read $u u^R$.

**GATE use.** A 2-mark MCQ describes a PDA in words and asks for its language: track the stack height per symbol, the condition on the stack top at acceptance, and the empty-input case. Design MCQs ask which languages need nondeterminism: $ww^R$ does, $wcw^R$ and the counting languages do not.

**Check.** The simulator agreed with the definition on every string up to length 10 over $\{a, b\}$ for machines 1, 2, 3 and 5, and up to length 8 over $\{a, b, c\}$ for machine 4; machines 1 to 4 passed a determinism check (at most one move per state, input and top, and no input move beside an $\varepsilon$-move) and machine 5 did not. The machine that pops one $X$ per two $b$'s accepted exactly $abb$, $aabbbb$ and $aaabbbbbb$ up to length 9. The PDA that pushes two $X$'s per $a$ and pops one per $b$, accepting with $Z_0$ on top in the pop state, accepts $a^n b^{2n}$, $n \ge 1$.

## From grammar to PDA and back
<!-- topics: toc-cfl-pda.cfg-pda-equivalence, toc-cfl-pda.gnf -->

**Claim.** (1) For a CFG $G$, the one-state PDA with stack alphabet $V \cup T$, start symbol $S$, a move $\delta(q, \varepsilon, A) \ni (q, \alpha)$ for each production $A \to \alpha$ and $\delta(q, a, a) = \{(q, \varepsilon)\}$ for each terminal accepts $L(G)$ by empty stack. If $G$ is in GNF, the moves $\delta(q, a, A) \ni (q, \alpha)$ for $A \to a\alpha$ do the same and every move reads input. (2) For a PDA $P$ that accepts by empty stack, the grammar with start symbol $S$ and variables $[pXq]$, $p, q \in Q$, $X \in \Gamma$, and productions
$$S \to [q_0 Z_0 q] \text{ for every } q, \qquad [p X r_k] \to a\,[r Y_1 r_1][r_1 Y_2 r_2] \cdots [r_{k-1} Y_k r_k]$$
for every move $(r, Y_1 \cdots Y_k) \in \delta(p, a, X)$, $a \in \Sigma \cup \{\varepsilon\}$, and every choice of states $r_1, \dots, r_k$ (for $k = 0$ the production is $[p X r] \to a$), generates exactly $L(P)$. It has $|Q|^2 |\Gamma| + 1$ variables.

**Proof.** (1) Invariant: after the PDA has consumed $u$ with stack $\gamma$ (top first), $S \Rightarrow^*_{lm} u\gamma$; and every leftmost derivation $S \Rightarrow^*_{lm} u\gamma$ in which $\gamma$ is empty or starts with a variable is reached this way. Expanding the variable on top is one leftmost step, because everything left of it is already-matched input; matching a terminal moves it from the stack to the consumed part. Acceptance by empty stack after consuming $w$ is $S \Rightarrow^*_{lm} w$. In the GNF version one move performs the step $A \to a\alpha$ and the match of $a$ together.

(2) Claim: $[pXq] \Rightarrow^* w$ if and only if $P$, started in $p$ with $X$ on top, can consume $w$ and end in $q$ with that $X$ popped and the stack below it never touched. Only if: induction on the derivation; the first production corresponds to a move that reads $a$ and replaces $X$ by $Y_1 \cdots Y_k$, and each $[r_{i-1} Y_i r_i]$ derives a piece of input during which $Y_i$ is popped while going from $r_{i-1}$ to $r_i$; running the pieces in order pops $Y_1, \dots, Y_k$ and ends in $r_k$. If: induction on the number of moves; the first move replaces $X$ by $Y_1 \cdots Y_k$, and the rest of the computation splits at the moments the stack first shrinks below $Y_2 \cdots Y_k$, then below $Y_3 \cdots Y_k$, and so on, each piece popping one $Y_i$ net, which by induction is derived by $[r_{i-1} Y_i r_i]$ with the intermediate states read off the run. Taking $p = q_0$, $X = Z_0$ and any final $q$ gives $L(P)$.

**GATE use.** MCQs state the equivalence CFG = NPDA and its limits: DPDAs capture only DCFLs, and a PDA with two stacks simulates a Turing machine, so it leaves the class. Counting questions ask for the number of $[pXq]$ variables, $|Q|^2 |\Gamma|$ plus the start symbol.

**Check.** The one-state PDA built from $S \to aSa \mid bSb \mid a \mid b \mid \varepsilon$ accepted exactly the palindromes among all strings up to length 9. The $[pXq]$ construction applied to a 2-state empty-stack PDA for $\{a^n b^n \mid n \ge 1\}$ produced a grammar whose language up to length 10 was exactly $\{a^n b^n \mid 1 \le n \le 5\}$.

## Closure properties of context-free languages
<!-- topics: toc-cfl-pda.closure -->

**Claim.** If $L_1, L_2$ are CFLs and $R$ is regular, then $L_1 \cup L_2$, $L_1 L_2$, $L_1^*$, $L_1^R$, $h(L_1)$ for a homomorphism $h$, $h^{-1}(L_1)$, $L_1 \cap R$ and $L_1 - R$ are CFLs. $L_1 \cap L_2$, $\overline{L_1}$ and $L_1 - L_2$ need not be.

**Proof.** With grammars $G_1, G_2$ on disjoint variable sets and start symbols $S_1, S_2$: $S \to S_1 \mid S_2$ gives the union, $S \to S_1 S_2$ the concatenation, and $S \to S S_1 \mid \varepsilon$ the star. Reversing every body reverses every parse tree left to right, so it generates $L_1^R$. Replacing each terminal $a$ in every body by the string $h(a)$ generates $h(L_1)$. For $h^{-1}$, a PDA reads $a$, stores $h(a)$ in its finite control, and feeds it to the PDA for $L_1$ one symbol at a time.

$L_1 \cap R$: let $P$ accept $L_1$ by final state and let $D$ be a DFA for $R$ with transition function $\delta_D$. The product PDA has states $(q, s)$ and the stack of $P$. On a move of $P$ that reads $a$ the DFA part goes to $\delta_D(s, a)$; on an $\varepsilon$-move of $P$ it stays. Accepting states are $F_P \times F_D$. Invariant, by induction on moves: the product reaches $((q, s), \gamma)$ after consuming $u$ exactly when $P$ reaches $(q, \gamma)$ after consuming $u$ and $s = \delta_D^*(s_0, u)$. A DFA needs no stack of its own, which is why this works while the product of two PDAs would need two stacks. $L_1 - R = L_1 \cap \overline{R}$ and $\overline{R}$ is regular.

Non-closure: $\{a^n b^n c^m\}$ and $\{a^m b^n c^n\}$ are CFLs and their intersection is $\{a^n b^n c^n\}$, not a CFL by the pumping argument. If complement preserved CFLs, then $L_1 \cap L_2 = \overline{\overline{L_1} \cup \overline{L_2}}$ would too. Since $\Sigma^*$ is a CFL and $\overline{L} = \Sigma^* - L$, difference fails as well. Non-closure means only that the result is not always a CFL; the complement of any DCFL, for instance, is a CFL.

**GATE use.** Closure MCQs and MSQs: write the class of each operand and look up the operation. The traps are treating $\cap$ regular like $\cap$ CFL, and reading "not closed" as "never a CFL". CFL $\cap$ CFL need not be a CFL but is always context-sensitive: every CFL is a CSL, and an LBA runs the first LBA and then the second on the same tape, so CSLs are closed under $\cap$. The smallest class guaranteed is CSL, and hence recursive.

**Check.** A script listed the strings up to length 9 over $\{a, b, c\}$ in both $\{a^n b^n c^m\}$ and $\{a^m b^n c^n\}$: $\varepsilon$, $abc$, $aabbcc$, $aaabbbccc$, which is $\{a^n b^n c^n\}$. It built the product of a deterministic PDA for equal numbers of $a$'s and $b$'s with the DFA for $a^* b^*$; the product accepted exactly $\{a^n b^n\}$ among all strings up to length 10.

## Deterministic CFLs: closure and a CFL that no DPDA accepts
<!-- topics: toc-cfl-pda.dcfl, toc-cfl-pda.closure -->

**Claim.** (1) DCFLs are closed under intersection with a regular set and under complement. (2) They are not closed under intersection or union. (3) $L = \{a^n b^n \mid n \ge 1\} \cup \{a^n b^{2n} \mid n \ge 1\}$ is a CFL but not a DCFL, so $\text{DCFL} \subsetneq \text{CFL}$. (4) Membership in a DCFL takes $O(n)$ moves of a DPDA.

**Proof.** (1) In the product construction of the previous section the DFA part is deterministic and does not move on $\varepsilon$, so the product has at most one move wherever the DPDA has at most one, and an $\varepsilon$-move only where the DPDA has one: the product is a DPDA. For complement, swapping accepting and non-accepting states fails for two reasons: a DPDA may stop or loop on $\varepsilon$-moves before reading all its input, and after the last symbol it may pass through both kinds of state by $\varepsilon$-moves. Hopcroft and Ullman first normalise the DPDA so that it always reads its whole input, then record in the state whether an accepting state has been visited since the last input symbol, and accept the complement in the states that record no such visit.

(2) $\{a^n b^n c^m\}$ and $\{a^m b^n c^n\}$ are DCFLs (one counter, the switch points visible), and their intersection $\{a^n b^n c^n\}$ is not even a CFL. If DCFLs were closed under union, closure under complement would give intersection by De Morgan.

(3) $L$ is the union of two CFLs. Suppose a DPDA $M$ accepts $L$ by final state. Build a PDA $M'$ from two copies $M_1, M_2$ of $M$'s control. $M'$ runs $M_1$ on the input; whenever $M_1$ is in an accepting state it may move by $\varepsilon$ to the same state in $M_2$, keeping the stack. $M_2$ behaves like $M$ except that it reads $c$ wherever $M$ reads $b$, and $M'$ accepts in the accepting states of $M_2$. Consider a string $x c^k$ with $x \in a^* b^*$ and $k \ge 1$.

- If $M'$ accepts it, the switch happened after reading all of $x$ in an accepting configuration of $M$, so $x \in L$. The run of $M$ on $x b^k$ reads $x$ as the run on $x$ does and then takes the same forced $\varepsilon$-moves, since a DPDA has no input move where an $\varepsilon$-move is defined; so it passes through that configuration, and from there it does on $b^k$ what $M_2$ did on $c^k$. Hence $x b^k \in L$.
- Conversely, if $x \in L$ and $x b^k \in L$, the run of $M$ on $x b^k$ passes through an accepting configuration after reading $x$, for the same reason, and switching there makes $M'$ accept $x c^k$.

So $L(M') \cap a^* b^* c^+ = \{x c^k \mid k \ge 1,\ x \in L,\ x b^k \in L\}$. With $x = a^n b^m$, $m \in \{n, 2n\}$, the string $x b^k = a^n b^{m+k}$ is in $L$ only if $m = n$ and $k = n$. The set is $\{a^n b^n c^n \mid n \ge 1\}$, which would be a CFL as a PDA language intersected with a regular set. It is not, so $M$ does not exist. Determinism is used exactly once: it forces the run on $x b^k$ through the configuration where $M$ accepted $x$. The palindromes $ww^R$ are likewise not a DCFL, by a longer argument in Hopcroft and Ullman.

(4) Every DPDA has an equivalent DPDA that never loops on $\varepsilon$-moves, always reads its whole input, and whose $\varepsilon$-moves each pop one symbol without pushing (Hopcroft and Ullman build the loop-free form; Harrison proves the pop-only form). Let $c$ be the longest string a reading move pushes. On input of length $n$ there are exactly $n$ reading moves, so at most $cn + 1$ symbols are ever on the stack counting $Z_0$, and each $\varepsilon$-move removes one of them, so there are at most $cn + 1$ $\varepsilon$-moves. The run has at most $(c + 1)n + 1 = O(n)$ moves, each a table lookup.

**GATE use.** "CFL but not DCFL" MCQs: $ww^R$, palindromes, $\{a^n b^n\} \cup \{a^n b^{2n}\}$, and any inherently ambiguous language, since every DCFL has an LR(1) grammar and LR(1) grammars are unambiguous. DCFL closure MCQs: complement and $\cap$ regular yes; union, intersection, concatenation, star and reversal no. DCFL membership runs in $O(n)$, which is why LR parsing is linear.

**Check.** A script formed $\{x c^k \mid k \ge 1,\ x \in L,\ x b^k \in L\}$ over all $x$ up to length 12 and $k \le 12$; the members of length at most 18 were exactly $abc, aabbcc, \dots, a^6 b^6 c^6$. The product of the deterministic equal-count PDA with the DFA for $a^* b^*$ passed the determinism check.

## Decision properties: emptiness, finiteness and membership
<!-- topics: toc-cfl-pda.decision-properties -->

**Claim.** For a CFG $G$:

1. $L(G) = \emptyset$ exactly when $S$ is not generating; the generating set is computable in $O(|G|)$ time with work lists.
2. Convert $G$ to CNF and remove useless symbols, and draw an edge $A \to B$ whenever $B$ occurs in a body of $A$. $L(G)$ is infinite exactly when this graph has a cycle.
3. Membership $w \in L(G)$ is decided by CYK in $O(|w|^3)$ for a fixed grammar.

Equivalence, inclusion, ambiguity, $L(G) = \Sigma^*$, regularity of $L(G)$ and emptiness of $L(G_1) \cap L(G_2)$ are undecidable (reductions from the Post correspondence problem; Hopcroft and Ullman, Sipser). For DPDAs, $L = \Sigma^*$ is decidable by complementing and testing emptiness, and equivalence is decidable (Sénizergues).

**Proof.** (1) $S$ is generating exactly when $S \Rightarrow^* w$ for some terminal $w$, which is $L(G) \ne \emptyset$. For the cost, give each production a counter of the occurrences in its body not yet known to be generating, and index productions by the variables in their bodies. When a variable becomes generating, decrement the counters of the productions that contain it; a counter reaching 0 makes its head generating. Each body occurrence is decremented once, so the work is linear in the total length of the productions. The naive loop that rescans all productions until nothing changes can take up to $|V|$ passes, $O(|G|^2)$.

(2) Cycle implies infinite: a cycle through $A$ gives $A \Rightarrow^+ \alpha A \beta$. Each edge on the cycle comes from a production $C \to DE$, whose other child is a variable that, being useful, yields a nonempty terminal string, so $\alpha\beta$ yields a nonempty terminal string $vy$. Since $A$ is useful, $S \Rightarrow^* uAz$ and $A \Rightarrow^* x$ for terminal $u, x, z$, so $u v^i x y^i z \in L$ for all $i$, with strictly increasing lengths. No cycle implies finite: a root-to-leaf path of a parse tree follows edges of the graph, so in an acyclic graph it repeats no variable and has at most $m$ variable nodes, $m$ the number of variables. By the yield bound every string of $L$ has length at most $2^{m-1}$, and finitely many strings are that short. Removing useless symbols first matters, because a cycle among unreachable or non-generating variables says nothing about $L$.

(3) Convert to CNF once, which is a fixed cost for a fixed grammar, and run CYK; the empty string is handled by checking whether $S$ is nullable.

**GATE use.** Decidability MSQs: membership, emptiness and finiteness of a CFL are decidable; equivalence, ambiguity, inclusion, universality and the intersection problems are not. The trap is carrying "finiteness is undecidable" over from Turing-recognisable languages, or "equivalence is decidable" over from DFAs. For DPDAs equivalence is decidable, but inclusion is not.

**Check.** A script generated 3,000 random CNF grammars over 4 variables, removed useless symbols, and compared the cycle test with a dynamic program over derivable lengths, which detects an infinite language by a derivable length in $[2^m, 2^{m+1})$. They agreed on all 2,311 grammars with a nonempty language, 1,604 finite and 707 infinite. Emptiness through the generating set agreed with the brute-force language computation in the simplification tests.
