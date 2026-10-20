# Syntax analysis (parsing): derivations

## Parse trees, leftmost and rightmost derivations
<!-- topics: cd-parsing.parser-role-derivations, cd-parsing.ambiguity -->

**Claim.** Fix a context-free grammar $G = (N, T, P, S)$ and a terminal string $w$. Parse trees for $w$ with root $S$ are in bijection with leftmost derivations $S \Rightarrow_{lm}^* w$, and also with rightmost derivations $S \Rightarrow_{rm}^* w$. A tree with $k$ interior nodes corresponds to a derivation of exactly $k$ steps. Hence the three definitions of ambiguity agree: $w$ has two parse trees iff it has two leftmost derivations iff it has two rightmost derivations.

**Proof.** From a tree to a leftmost derivation: start with the root label $S$. At each step the current sentential form is the frontier of the part of the tree built so far; rewrite its leftmost nonterminal by the production that labels the corresponding tree node (the node and its children). Every interior node is expanded exactly once, so the derivation has $k$ steps, and the order is forced because a leftmost derivation has no choice of which nonterminal to rewrite. From a leftmost derivation to a tree: draw one node per step, with the production used as the node's children; the leftmost nonterminal of the current form is a unique leaf of the partial tree, so the tree is determined. The two maps are inverse to each other, since each reconstructs the other step by step. The same argument with "rightmost" in place of "leftmost" gives the second bijection. Two different trees therefore give two different leftmost derivations, and conversely, which is the equivalence of the ambiguity definitions (Hopcroft–Ullman, Theorem 5.14).

The parser's job is to produce one of these objects for the token string: a top-down (LL) parser emits the productions of the leftmost derivation in order, and a bottom-up (LR) parser emits those of the rightmost derivation in reverse.

**GATE use.** Questions ask for the number of steps of a leftmost derivation, or which derivation order a parser builds. Count interior nodes of the tree, unit productions such as $E \to T$ included. The trap is to call a grammar ambiguous because a string has a leftmost and a rightmost derivation that differ: every string whose derivation passes through a sentential form with two or more nonterminals has those, and they describe the same tree. With $S \to aS \mid b$ every form holds one nonterminal, so the two orders coincide.

**Check.** With $E \to E + T \mid T$, $T \to T * F \mid F$, $F \to (E) \mid \mathrm{id}$, the string $\mathrm{id} + \mathrm{id} * \mathrm{id}$ has one tree with 8 interior nodes: three $F \to \mathrm{id}$, two $T \to F$, one $E \to T$, one $T \to T * F$ and one $E \to E + T$. A script ran an SLR parser on it and recorded exactly these 8 reductions.

## Parse trees of E → E op E | id are counted by Catalan numbers
<!-- topics: cd-parsing.ambiguity -->

**Claim.** In the grammar $E \to E \mathbin{op} E \mid \mathrm{id}$, where every binary operator uses this one production and no precedence or associativity is imposed, a string of $k \ge 1$ operands and $k-1$ operators has

$$T(k) = C_{k-1} = \frac{1}{k}\binom{2k-2}{k-1}$$

parse trees, the $(k-1)$-th Catalan number: $1, 1, 2, 5, 14, 42$ for $k = 1, \dots, 6$. The dangling-else grammar $S \to \mathrm{if}\ E\ \mathrm{then}\ S \mid \mathrm{if}\ E\ \mathrm{then}\ S\ \mathrm{else}\ S \mid a$ is ambiguous for the same structural reason: an else can attach to either of two open ifs.

**Proof.** A parse tree is a full binary tree whose leaves are the $k$ operands in order. If $k = 1$ the only tree is $E \to \mathrm{id}$, so $T(1) = 1$. If $k \ge 2$ the root uses $E \to E \mathbin{op} E$, and its operator is one of the $k-1$ operators of the string, say the one after the $i$-th operand. The left subtree is any tree for the first $i$ operands and the right subtree any tree for the remaining $k - i$, and different choices of $i$ or of the subtrees give different trees. So

$$T(k) = \sum_{i=1}^{k-1} T(i)\, T(k-i).$$

Put $c_n = T(n+1)$. Then $c_0 = 1$ and $c_n = \sum_{j=0}^{n-1} c_j c_{n-1-j}$, which is the Catalan recurrence, whose closed form is $c_n = \frac{1}{n+1}\binom{2n}{n}$. Substituting $n = k-1$ gives the claim.

For the dangling else, in $\mathrm{if}\ b\ \mathrm{then}\ \mathrm{if}\ b\ \mathrm{then}\ a\ \mathrm{else}\ a$ the else either closes the inner if (inner node uses the long production) or the outer one (outer node uses it, inner the short one). Both are valid trees, so the grammar is ambiguous. Compilers keep the grammar and resolve the parser conflict in favour of shift, which attaches the else to the nearest if.

**GATE use.** NAT questions ask for the number of parse trees of $\mathrm{id} + \mathrm{id} * \mathrm{id} + \mathrm{id}$ in $E \to E + E \mid E * E \mid \mathrm{id}$: four operands, so $C_3 = 5$. The trap is to apply the formula when the grammar is layered by precedence ($E \to E + T$, $T \to T * F$), which has exactly one tree per string, or to count the operators instead of the operands.

**Check.** A script counted trees by interval dynamic programming over $T(k) = \sum T(i)T(k-i)$ for $k = 1, \dots, 7$ and got $1, 1, 2, 5, 14, 42, 132$, equal to $\frac{1}{k}\binom{2k-2}{k-1}$ in each case. A memoised derivation counter on the dangling-else grammar (with $E \to b$) found exactly 2 trees for $\mathrm{i}\ b\ \mathrm{t}\ \mathrm{i}\ b\ \mathrm{t}\ a\ \mathrm{e}\ a$.

## Eliminating left recursion and left factoring preserve the language
<!-- topics: cd-parsing.left-recursion-factoring, cd-parsing.recursive-descent -->

**Claim.** Let the alternatives of $A$ be $A \to A\alpha_1 \mid \dots \mid A\alpha_m \mid \beta_1 \mid \dots \mid \beta_n$, where no $\beta_j$ begins with $A$ and no $\alpha_i$ is $\varepsilon$. Replacing them with

$$A \to \beta_1 A' \mid \dots \mid \beta_n A', \qquad A' \to \alpha_1 A' \mid \dots \mid \alpha_m A' \mid \varepsilon$$

($A'$ a fresh nonterminal) leaves the language unchanged, and the new rules for $A$ and $A'$ are not immediately left recursive. If some $\beta_j = \varepsilon$, the rule $A \to \beta_j A'$ is $A \to A'$ and must be kept. Left factoring $A \to \alpha\beta_1 \mid \alpha\beta_2$ into $A \to \alpha A'$, $A' \to \beta_1 \mid \beta_2$ also preserves the language.

**Proof.** In the old grammar, consider any leftmost derivation from $A$. While the leftmost symbol is $A$, the only moves on it are $A \to A\alpha_i$, each appending one $\alpha_i$ on the right, until some $A \to \beta_j$ is used, after which $A$ never again occupies the leftmost position of this subtree (no $\beta_j$ starts with $A$). So the sentential forms $A$ derives with $A$ eliminated from the front are exactly $\beta_j \alpha_{i_1} \alpha_{i_2} \cdots \alpha_{i_r}$ for $r \ge 0$, that is, the language $(\beta_1 \mid \dots \mid \beta_n)(\alpha_1 \mid \dots \mid \alpha_m)^*$ over these strings of grammar symbols. In the new grammar, $A'$ derives exactly $(\alpha_1 \mid \dots \mid \alpha_m)^*$ by induction on $r$: $A' \Rightarrow \varepsilon$ gives $r = 0$, and $A' \Rightarrow \alpha_i A'$ prepends one more $\alpha_i$. Then $A \Rightarrow \beta_j A'$ gives the same set. All other productions are untouched, so every terminal string has a derivation in one grammar iff it has one in the other. No new rule begins with $A$, and $A'$ rules begin with $\alpha_i$, which is not $\varepsilon$; that is where the assumption enters, since $\alpha_i = \varepsilon$ would create $A' \to A'$. The $\beta_j = \varepsilon$ case is the formula with $\beta_j$ empty, so dropping $A \to A'$ loses every string of the form $\alpha_{i_1}\cdots\alpha_{i_r}$.

For left factoring, $A \Rightarrow \alpha A' \Rightarrow \alpha\beta_k$ is the only way the new $A$ derives anything, and it yields exactly the old alternatives.

Left recursion matters for top-down parsing: a recursive-descent procedure for $A \to A\alpha$ calls itself before consuming any input and never returns, and in a predictive table it always produces a clash (proof in the LL(1) section): for non-nullable $\beta_j$, $A \to A\alpha$ and $A \to \beta_j$ share every cell of $\mathrm{FIRST}(\beta_j)$; for nullable $\beta_j$ they meet in the FIRST/FOLLOW part, since $\mathrm{FIRST}(\alpha) - \{\varepsilon\} \subseteq \mathrm{FOLLOW}(A)$. Indirect left recursion ($A \Rightarrow^+ A\gamma$ through other nonterminals) is removed by ordering the nonterminals $A_1, \dots, A_k$, substituting earlier $A_j$ into rules $A_i \to A_j\gamma$ with $j < i$, and then removing immediate left recursion; Aho et al. require the grammar to have no cycles $A \Rightarrow^+ A$ and no $\varepsilon$-productions for this algorithm.

**GATE use.** The 1-mark MCQ gives $A \to A\alpha \mid \beta$ and four candidate rewrites. Check that every $\beta$ gets $A'$ appended, every $\alpha$ becomes an $A'$ alternative, and $A' \to \varepsilon$ is present. Traps: dropping $A \to A'$ when a $\beta$ is $\varepsilon$, writing $A' \to A'\alpha$ (still left recursive), and believing the result is LL(1). Neither transformation removes ambiguity.

**Check.** A script enumerated all strings up to length 6 generated by $A \to Aa \mid Ab \mid c \mid d$ and by $A \to cZ \mid dZ$, $Z \to aZ \mid bZ \mid \varepsilon$: the same 126 strings. For $A \to Ac \mid \varepsilon$ the rewrite $A \to A'$, $A' \to cA' \mid \varepsilon$ gives $\{\varepsilon, c, cc, ccc, \dots\}$, the same set up to length 4. Left-factoring the if-then-else grammar into $S \to iEtSY \mid a$, $Y \to eS \mid \varepsilon$ gave the same strings up to length 9.

## FIRST sets as a least fixed point
<!-- topics: cd-parsing.first-sets -->

**Claim.** For a grammar symbol string $\alpha$, $\mathrm{FIRST}(\alpha)$ is the set of terminals that begin some string derived from $\alpha$, plus $\varepsilon$ if $\alpha \Rightarrow^* \varepsilon$. For a single symbol $X$ followed by a string $\alpha$ (possibly empty),

$$\mathrm{FIRST}(X\alpha) = \begin{cases} \mathrm{FIRST}(X) & \varepsilon \notin \mathrm{FIRST}(X) \\ (\mathrm{FIRST}(X) - \{\varepsilon\}) \cup \mathrm{FIRST}(\alpha) & \varepsilon \in \mathrm{FIRST}(X) \end{cases}$$

with $\mathrm{FIRST}(a) = \{a\}$ for a terminal and $\mathrm{FIRST}(\varepsilon) = \{\varepsilon\}$. In particular $\varepsilon \in \mathrm{FIRST}(X_1 \cdots X_k)$ iff every $X_i$ is nullable. The sets for nonterminals are the least solution of $\mathrm{FIRST}(A) = \bigcup_{A \to \gamma} \mathrm{FIRST}(\gamma)$, and iterating from empty sets reaches it.

**Proof.** Take any derivation $X\alpha \Rightarrow^* w$ with $w$ terminal. Since the grammar is context free, it splits as $X \Rightarrow^* u$ and $\alpha \Rightarrow^* v$ with $w = uv$. If $u \ne \varepsilon$, the first terminal of $w$ is the first terminal of $u$, which lies in $\mathrm{FIRST}(X)$. If $u = \varepsilon$, then $X$ is nullable and the first terminal of $w$ (if any) is that of $v$, which lies in $\mathrm{FIRST}(\alpha)$. And $w = \varepsilon$ only if both parts are empty. Conversely each terminal of the right-hand side is realised by such a split. This gives both cases of the formula and the nullability statement, which follows by induction on $k$.

For nonterminals, the defining equation holds because the first step of a derivation from $A$ uses some $A \to \gamma$. The iteration starts with all sets empty and repeatedly replaces $\mathrm{FIRST}(A)$ by the union over its productions, computed with the sequence formula. The update is monotone (bigger inputs give bigger outputs) and the sets are bounded by $T \cup \{\varepsilon\}$, so the iteration stops after finitely many rounds. Every element it adds is justified by a derivation (induction on the round), and every terminal that begins a derivation of height $h$ is added by round $h$ (induction on $h$), so the fixed point reached is exactly FIRST.

**GATE use.** The 2-mark question gives a grammar with $\varepsilon$-productions and asks for $\mathrm{FIRST}$ of a nonterminal, or a count of terminals in it. Compute nullable nonterminals first, then scan each right-hand side left to right and stop at the first non-nullable symbol. Traps: stopping after the first symbol even though it is nullable, and putting $\varepsilon$ into $\mathrm{FIRST}(X_1 X_2)$ when only $X_1$ is nullable.

**Check.** For $E \to TE'$, $E' \to +TE' \mid \varepsilon$, $T \to FT'$, $T' \to *FT' \mid \varepsilon$, $F \to (E) \mid \mathrm{id}$, a script iterated to the fixed point: $\mathrm{FIRST}(E) = \mathrm{FIRST}(T) = \mathrm{FIRST}(F) = \{(, \mathrm{id}\}$, $\mathrm{FIRST}(E') = \{+, \varepsilon\}$, $\mathrm{FIRST}(T') = \{*, \varepsilon\}$. $T$ is not nullable, so $\mathrm{FIRST}(TE')$ stops at $T$.

## FOLLOW sets and the rules that build them
<!-- topics: cd-parsing.follow-sets -->

**Claim.** In a grammar where every nonterminal is reachable from $S$, $\mathrm{FOLLOW}(A)$ is the set of terminals $a$ such that $S\$ \Rightarrow^* \gamma A a \delta$ for some $\gamma, \delta$, where $\$$ is the end marker; so $\$ \in \mathrm{FOLLOW}(S)$ and $\varepsilon$ is never a member. It is the least family of sets satisfying, for every production $B \to \alpha A \beta$ and every occurrence of $A$ in a right-hand side,

$$\mathrm{FIRST}(\beta) - \{\varepsilon\} \subseteq \mathrm{FOLLOW}(A), \qquad \beta \Rightarrow^* \varepsilon \implies \mathrm{FOLLOW}(B) \subseteq \mathrm{FOLLOW}(A).$$

Reachability is needed: with $S \to a$, $B \to Ac$, $A \to d$ and $B$ unreachable, the rules put $c$ in $\mathrm{FOLLOW}(A)$, yet $A$ occurs in no form derived from $S\$$.

**Proof.** Soundness of each rule: if $a \in \mathrm{FIRST}(\beta)$, take any sentential form containing $B$ (one exists when $B$ is reachable), rewrite $B$ to $\alpha A\beta$ and $\beta$ to a string beginning with $a$; then $a$ follows $A$. If $\beta$ is nullable and $a$ follows $B$ in some form $\gamma B a \delta$, rewrite $B \Rightarrow \alpha A \beta \Rightarrow^* \alpha A$, and $a$ now follows $A$. The end marker follows $S$ in $S\$$.

Completeness: suppose $a$ follows $A$ in a sentential form reached in $h$ steps from $S\$$. Look at the step that introduced this occurrence of $A$, by some $B \to \alpha A \beta$. Either the terminal $a$ was derived from $\beta$, so $a \in \mathrm{FIRST}(\beta)$, or $\beta$ derived $\varepsilon$ in this derivation and $a$ followed $B$ in an earlier form, so $a \in \mathrm{FOLLOW}(B)$ by induction on $h$ (the base case is $\$$ after $S$). Hence the least solution contains nothing more and nothing less. It is computed as for FIRST: start from $\{\$\}$ for $S$ and empty sets elsewhere, apply both rules to every occurrence, and repeat until no set grows. FOLLOW is about what comes after a nonterminal in a derivation, and $\varepsilon$ is not a terminal that can come after, which is why it never appears.

**GATE use.** The standard question asks for $\mathrm{FOLLOW}$ of a nonterminal that appears in several places, with nullable symbols to its right. Traps: stopping at the next symbol when it is nullable instead of continuing right and finally adding $\mathrm{FOLLOW}$ of the left side; forgetting $\$$; and putting $\varepsilon$ in a FOLLOW set. A rule $A \to \alpha B$ copies $\mathrm{FOLLOW}(A)$ into $\mathrm{FOLLOW}(B)$, not the reverse.

**Check.** For the LL(1) expression grammar above, the script's fixed point is $\mathrm{FOLLOW}(E) = \mathrm{FOLLOW}(E') = \{), \$\}$, $\mathrm{FOLLOW}(T) = \mathrm{FOLLOW}(T') = \{+, ), \$\}$ and $\mathrm{FOLLOW}(F) = \{+, *, ), \$\}$. $+$ enters $\mathrm{FOLLOW}(T)$ from $E' \to +TE'$ via $\mathrm{FIRST}(E')$, and $)$ and $\$$ enter because $E'$ is nullable, so $\mathrm{FOLLOW}(E') \subseteq \mathrm{FOLLOW}(T)$.

## The LL(1) table and the LL(1) condition
<!-- topics: cd-parsing.ll1-table, cd-parsing.recursive-descent -->

**Claim.** Build $M$ by placing $A \to \alpha$ in $M[A, a]$ iff

$$a \in \mathrm{FIRST}(\alpha) \;\lor\; (\varepsilon \in \mathrm{FIRST}(\alpha) \land a \in \mathrm{FOLLOW}(A)),$$

with $a$ ranging over terminals and $\$$. The grammar is LL(1), meaning no cell holds two productions, iff for every pair of distinct alternatives $A \to \alpha \mid \beta$

$$\mathrm{FIRST}(\alpha) \cap \mathrm{FIRST}(\beta) = \varnothing, \qquad \beta \Rightarrow^* \varepsilon \implies \mathrm{FIRST}(\alpha) \cap \mathrm{FOLLOW}(A) = \varnothing.$$

Then the table-driven parser (equivalently, recursive descent that picks an alternative by one token of lookahead) never backtracks, emits the leftmost derivation, and runs in $O(n)$ time on $n$ tokens for a grammar without useless symbols. No LL(1) grammar without useless symbols is ambiguous or left recursive; a non-productive $A \to A$ has empty FIRST sets and slips through the table test, which is why the grammar is reduced first.

**Proof.** The parser holds a stack whose contents, read top to bottom, form the unmatched suffix of the current leftmost sentential form. With nonterminal $A$ on top and lookahead $a$, the derivation can continue to a string whose next terminal is $a$ only through an alternative $\alpha$ that either begins $a$ ($a \in \mathrm{FIRST}(\alpha)$) or vanishes and lets $a$ come from what follows $A$ ($\alpha \Rightarrow^* \varepsilon$ and $a \in \mathrm{FOLLOW}(A)$). So the table entry lists exactly the alternatives that can still lead to success, and a cell with at most one entry means the choice is forced.

Conflict-freedom is the condition. If $a \in \mathrm{FIRST}(\alpha) \cap \mathrm{FIRST}(\beta)$, both go in $M[A,a]$. If $\beta$ is nullable and $a \in \mathrm{FIRST}(\alpha) \cap \mathrm{FOLLOW}(A)$, then $\alpha$ enters $M[A,a]$ by the first clause and $\beta$ by the second. If both $\alpha$ and $\beta$ are nullable, $\varepsilon$ lies in both FIRST sets, so the first condition already fails; and when that happens every $a \in \mathrm{FOLLOW}(A)$ is a conflict cell (FOLLOW is non-empty for a reachable $A$). Conversely, if two alternatives share a cell, one of these three cases produced it.

An ambiguous grammar has a string with two leftmost derivations; at the first step where they differ, both rewrite the same $A$ with the same remaining input, so both alternatives belong in the cell of $A$ and the current token, a conflict. Left recursion, immediate or through other nonterminals: suppose $A \Rightarrow^+_{lm} A\gamma$ and the table has no conflict. If $A$ derives only $\varepsilon$, then $A \Rightarrow^+ A\gamma \Rightarrow^* A$, so $A$ has infinitely many trees and the grammar is ambiguous. Otherwise $A \Rightarrow^* x$ with $x$ non-empty and first terminal $a$. Every form of the chain $A = X_0\zeta_0 \Rightarrow \rho_0\zeta_0 = X_1\zeta_1 \Rightarrow \cdots \Rightarrow A\gamma$ begins with a nonterminal $X_i$, and $\rho_i\zeta_i \Rightarrow^* A\gamma \Rightarrow^* x\cdots$, so $a \in \mathrm{FIRST}(\rho_i)$, or $\rho_i$ is nullable and $a \in \mathrm{FIRST}(\zeta_i) \subseteq \mathrm{FOLLOW}(X_i)$. Either way $X_i \to \rho_i$ is the single entry of $M[X_i, a]$. Take a sentence $wxz$ with $S \Rightarrow^*_{lm} wA\delta$, $\delta \Rightarrow^* z$. Its leftmost derivation reaches $wA\delta$ with next token $a$, and from there every step is forced to be the unique cell entry, which walks the chain back to $A$ on top without consuming $a$, forever. A leftmost derivation is finite, a contradiction.

Time: each match pops a terminal and consumes a token, so there are $n$ matches. Between two matches the parser only expands the top nonterminal; a run of more than $\lvert N \rvert$ expansions on the same lookahead without popping below would repeat a nonterminal $A \Rightarrow^+ A\gamma$ with the same lookahead, which is left recursion. With $\varepsilon$-expansions that pop, each stack symbol is popped at most once, and the number pushed per expansion is bounded by the longest right-hand side, so total work is $O(n)$. Recursive descent with backtracking can instead try each alternative and rewind, which can cost exponential time in $n$.

**GATE use.** "Is this grammar LL(1)?" or "Which entry of $M$ has two productions?" Reject at once if the grammar is left recursive or ambiguous; otherwise check FIRST/FIRST clashes and, for every nullable alternative, the FIRST/FOLLOW clash. Traps: forgetting $\$$ in FOLLOW and checking only the FIRST/FIRST case. The dangling-else grammar after left factoring is still not LL(1).

**Check.** A script built $M$ for the LL(1) expression grammar and found no conflicting cell. For $S \to iEtSX \mid a$, $X \to eS \mid \varepsilon$, $E \to b$ it found exactly one conflicting cell, $M[X, e] = \{X \to eS,\ X \to \varepsilon\}$: $e \in \mathrm{FOLLOW}(S)$ through $\mathrm{FIRST}(X)$, and $\mathrm{FOLLOW}(S) \subseteq \mathrm{FOLLOW}(X)$ through $S \to iEtSX$.

## Shift-reduce parsing reverses the rightmost derivation
<!-- topics: cd-parsing.shift-reduce-handles -->

**Claim.** A handle of a right sentential form $\gamma$ is a production $A \to \beta$ and a position such that $\gamma = \alpha\beta w$, $w$ is terminal, and $S \Rightarrow_{rm}^* \alpha A w \Rightarrow_{rm} \alpha\beta w$. A shift-reduce parser that reduces only handles performs the steps of the rightmost derivation of the input in reverse order. On an input of $n$ tokens its moves are exactly $n$ shifts and one reduction per interior node of the parse tree, plus the final accept if counted.

**Proof.** Invariant: the stack contents $\alpha$ followed by the unread input $x$ form a right sentential form $\alpha x$ of the derivation, and the handle of $\alpha x$ is never strictly inside $\alpha$, that is, it ends at the top of the stack or somewhere in $x$. Initially $\alpha = \varepsilon$ and $x$ is the input. In a rightmost derivation, the nonterminal rewritten at each step is the rightmost one, so everything to its right is terminal; reading the derivation backwards, the handle of each form lies at or to the right of the previous reduction's result. Shifting moves the boundary right until the handle's right end is the stack top; reducing replaces $\beta$ by $A$ and gives the previous form of the derivation, so the invariant is maintained. The process ends with $\alpha = S$, $x = \varepsilon$. Each reduction undoes one derivation step, so by the first section there is one reduction per interior node, and each token is shifted exactly once. Every reduction uses a node whose children are all built, so the reductions follow a post-order of the tree. A parser determines the handle using the stack and lookahead; how LR parsers do that is the subject of the next sections.

**GATE use.** NAT: "How many reductions (or moves) does a shift-reduce parser make on this input?" Draw the parse tree, count interior nodes for reductions and tokens for shifts. Traps: skipping unit reductions such as $T \to F$ and $E \to T$, counting the accept as a reduction, and listing reductions in leftmost-derivation order.

**Check.** On $\mathrm{id} + \mathrm{id} * \mathrm{id}$ with the layered expression grammar, the script's SLR parser made 5 shifts and 8 reductions in the order $F \to \mathrm{id}$, $T \to F$, $E \to T$, $F \to \mathrm{id}$, $T \to F$, $F \to \mathrm{id}$, $T \to T*F$, $E \to E+T$, then accepted: 13 moves, 14 with the accept. Read backwards, these are the rightmost derivation.

## LR(0) items and the viable-prefix automaton
<!-- topics: cd-parsing.lr0-items-automaton, cd-parsing.viable-prefixes -->

**Claim.** An LR(0) item is a production with a dot in its right-hand side; a production $A \to \alpha$ yields $\lvert\alpha\rvert + 1$ items (one, $A \to \cdot$, for $A \to \varepsilon$), so

$$\#\text{items} = \sum_{A \to \alpha} \left(\lvert\alpha\rvert + 1\right).$$

Assume the grammar has no non-productive symbols (the standard reduced-grammar assumption). A viable prefix is a prefix of a right sentential form that does not extend past the right end of its handle. In the augmented grammar ($S' \to S$ added), the canonical collection built from $I_0 = \mathrm{closure}(\{S' \to \cdot S\})$ with $\mathrm{goto}(I, X) = \mathrm{closure}(\{A \to \alpha X \cdot \beta : A \to \alpha \cdot X\beta \in I\})$ is a DFA whose paths from $I_0$ spell exactly the viable prefixes, and the item $A \to \beta_1 \cdot \beta_2$ is in the state reached by $\gamma$ iff it is valid for $\gamma$: $S' \Rightarrow_{rm}^* \delta A w \Rightarrow_{rm} \delta\beta_1\beta_2 w$ with $\gamma = \delta\beta_1$. The set of viable prefixes is therefore a regular language.

**Proof.** Item count: the dot can sit in any of the $\lvert\alpha\rvert + 1$ gaps of $\alpha$, and distinct productions give distinct items.

Valid items (Aho et al., Theorem 4.4 in the second edition; Hopcroft–Ullman's LR(0) automaton). Show by induction on $\lvert\gamma\rvert$ that the state reached by $\gamma$ is the set $V(\gamma)$ of items valid for $\gamma$. Base: $\gamma = \varepsilon$. $S' \to \cdot S$ is valid. If $A \to \cdot B\beta$ is valid for $\varepsilon$ and $B \to \eta$ is a production, then $B \to \cdot \eta$ is valid too, by continuing the derivation: rewrite the rightmost-derivable $B$ (expand $\beta$ to terminals first, which is allowed in a rightmost derivation) and stop just after introducing $\eta$. Conversely every valid item for $\varepsilon$ arises this way from $S' \to \cdot S$ by a chain of such expansions. This is exactly what closure computes. Step: an item with the dot after $X$ is valid for $\gamma X$ iff the same item with the dot before $X$ is valid for $\gamma$, plus closure for the same reason as in the base case; that is goto. So the DFA state after $\gamma$ is $V(\gamma)$, and $\gamma$ is a viable prefix iff $V(\gamma)$ is non-empty, iff the DFA has a path for $\gamma$ (missing transitions mean the dead state). A DFA path set is regular.

Consequence for parsing: when the stack spells $\gamma$ and $V(\gamma)$ contains a complete item $A \to \beta\cdot$, the handle may be $\beta$ at the top; when it contains $A \to \alpha \cdot a \beta$, shifting $a$ keeps a viable prefix. An LR(0) parser is conflict free when no state offers both, or two complete items.

**GATE use.** NAT: "number of items in the augmented grammar" (sum $\lvert\alpha\rvert + 1$, include $S' \to S$ only when the question says augmented) and "number of states in the LR(0) automaton" (build the collection; it is not the item count). MCQ: "which strings are viable prefixes?" Run the string through the DFA. The trap is a string that is a prefix of a sentential form but runs past a handle, such as $E + E$ in the layered expression grammar.

**Check.** The augmented expression grammar has $2 + 4 + 2 + 4 + 2 + 4 + 2 = 20$ items and 12 LR(0) states, both from the script. A brute-force script listed all viable prefixes of length at most 5 for $S \to AA$, $A \to aA \mid b$ (29 strings) and of length at most 4 for the expression grammar (54 strings) from rightmost derivations, and found them equal to the DFA path sets; $E + T *$ is viable and $E + E$ is not.

## SLR(1) reduces on FOLLOW and where it fails
<!-- topics: cd-parsing.slr1 -->

**Claim.** The SLR(1) table uses the LR(0) automaton: on terminal $a$, state $i$ shifts if some $A \to \alpha \cdot a\beta \in I_i$, and

$$A \to \alpha\cdot \in I_i \implies \mathrm{ACTION}[i,a] = \text{reduce } A \to \alpha \ \ \forall a \in \mathrm{FOLLOW}(A).$$

The grammar is SLR(1) iff no entry receives two actions: in every state, the FOLLOW sets of the complete items are pairwise disjoint and disjoint from the terminals shifted there. Every LR(0) grammar is SLR(1). The grammar $S \to L = R \mid R$, $L \to *R \mid \mathrm{id}$, $R \to L$ is not SLR(1).

**Proof.** Correctness of the reduce rule: if reducing by $A \to \alpha$ before lookahead $a$ is part of a successful parse, then after the reduction $a$ follows $A$ in a right sentential form, so $a \in \mathrm{FOLLOW}(A)$. Restricting reductions to FOLLOW therefore never removes a needed action, and the table is a correct deterministic parser when conflict free. LR(0) places a reduce in every terminal column of a state with a complete item, so its actions contain the SLR ones; any SLR conflict is also an LR(0) conflict, and an LR(0) grammar is SLR(1).

The failure: in the LR(0) automaton for the $L = R$ grammar, $\mathrm{goto}(I_0, L) = \{S \to L \cdot = R,\ R \to L\cdot\}$. From $S \to L = R$ we get $= \in \mathrm{FOLLOW}(L)$; from $R \to L$, $\mathrm{FOLLOW}(R) \subseteq \mathrm{FOLLOW}(L)$, and from $L \to *R$, $\mathrm{FOLLOW}(L) \subseteq \mathrm{FOLLOW}(R)$, so $= \in \mathrm{FOLLOW}(R)$. The state shifts on $=$ and also reduces $R \to L$ on $=$: a shift-reduce conflict. The grammar is not ambiguous; FOLLOW is too coarse, because it merges every context where $R$ appears, while in this state (stack holding just $L$ at the start) an $R$ can only be followed by $\$$.

**GATE use.** Classification questions: find states with a complete item, compare FOLLOW of the reduced nonterminal with the terminals shifted in that state and with other reductions. No overlap anywhere means SLR(1). The $L = R$ grammar is the standard LALR(1)-but-not-SLR(1) answer.

**Check.** The script built the LR(0) automata: the expression grammar has 2 LR(0) conflicts, both shift on $*$ against a reduction, in the states $\{E \to T\cdot,\ T \to T \cdot * F\}$ and $\{E \to E + T\cdot,\ T \to T \cdot * F\}$, and none under SLR, since $* \notin \mathrm{FOLLOW}(E) = \{+, ), \$\}$. For the $L = R$ grammar it reported exactly one SLR conflict, shift against reduce $R \to L$ on $=$, in the state reached by $L$.

## LR(1) lookaheads, LALR merging and state counts
<!-- topics: cd-parsing.lr1-lalr, cd-parsing.parser-hierarchy -->

**Claim.** An LR(1) item $[A \to \alpha\cdot\beta, a]$ carries a lookahead terminal $a$, and closure adds

$$[A \to \alpha\cdot B\beta,\ a] \in I \implies [B \to \cdot\gamma,\ b] \in I \ \text{for all } b \in \mathrm{FIRST}(\beta a),$$

starting from $[S' \to \cdot S, \$]$. A complete item $[A \to \alpha\cdot, a]$ reduces on $a$ alone. LALR(1) merges LR(1) states with the same core (set of LR(0) items) by unioning lookaheads. Then:

1. The cores of the LR(1) states are exactly the LR(0) states, so $n_{\mathrm{LR}(0)} = n_{\mathrm{SLR}(1)} = n_{\mathrm{LALR}(1)} \le n_{\mathrm{LR}(1)}$.
2. Each LALR lookahead set of $A \to \alpha\cdot$ is a subset of $\mathrm{FOLLOW}(A)$.
3. Merging cannot create a shift-reduce conflict that was absent from the LR(1) states; it can create a reduce-reduce conflict.

**Proof.** Lookaheads: the item says the parser expects to see $\beta$ and then $a$. When $B$ is about to be recognised, whatever follows the $B$ must begin $\beta a$; if $\beta$ is nullable, $a$ itself qualifies, which is why the formula uses $\mathrm{FIRST}(\beta a)$ and never contains $\varepsilon$.

1. Dropping lookaheads from an LR(1) closure gives the LR(0) closure of the dropped items, because LR(1) closure adds $B \to \cdot\gamma$ (with some lookahead, as $\mathrm{FIRST}(\beta a)$ is non-empty) exactly when LR(0) closure does. So $\mathrm{core}(\mathrm{goto}_1(I, X)) = \mathrm{goto}_0(\mathrm{core}(I), X)$, and by induction from the start state the cores of reachable LR(1) states are exactly the reachable LR(0) states. Merging leaves one state per core, so LALR has as many states as LR(0), and SLR uses the LR(0) automaton directly. Several LR(1) states may share one core, hence $\le$.
2. If $[A \to \alpha\cdot, a]$ is in any LR(1) state, it is valid for some viable prefix with $a$ next in a right sentential form, so $a \in \mathrm{FOLLOW}(A)$. Unions of such lookaheads stay inside $\mathrm{FOLLOW}(A)$.
3. Suppose the merged state has a shift on $a$, from core item $B \to \beta\cdot a\gamma$, and a reduce $[A \to \alpha\cdot, a]$. The reduce item came from some LR(1) state $J$ in the merged group. $J$ has the same core, so it contains $B \to \beta\cdot a\gamma$ with some lookahead, and $J$ also shifts on $a$: the conflict was already in $J$. Reduce-reduce conflicts can appear because the lookaheads of two complete items come from different states. In $S \to Aa \mid bAc \mid Bc \mid bBa$, $A \to d$, $B \to d$, the state after $d$ holds $[A \to d\cdot, a], [B \to d\cdot, c]$ and the state after $bd$ holds $[A \to d\cdot, c], [B \to d\cdot, a]$; each is conflict free, but the merge reduces both on $a$ and on $c$.

Parsing remains $O(n)$ for every LR variant: $n$ shifts, and in a grammar with no cycles $A \Rightarrow^+ A$ the number of reductions is at most a constant times $n$ (each reduction is an interior node of the tree, and the cycle-free tree has $O(n)$ of them). What grows is the table, with LR(1) the largest.

**GATE use.** State-count NAT questions: SLR and LALR equal the LR(0) count; LR(1) states with equal cores but different lookaheads are distinct. Classification MCQs: an option claiming that merging introduced a shift-reduce conflict is false; an LR(1) grammar can fail to be LALR(1) only through a reduce-reduce conflict.

**Check.** The script built all automata. $S \to AA$, $A \to aA \mid b$: 7 LR(0) states, 7 LALR, 10 LR(1). The layered expression grammar: 12 against 22. For the $S \to Aa \mid bAc \mid Bc \mid bBa$ grammar: 13 LR(1) states with no conflict and 12 LALR states, one of them with reduce-reduce conflicts on $a$ and $c$. Over 3,842 random reduced grammars with up to three nonterminals, no LALR table had a shift-reduce conflict that the LR(1) table lacked.

## Power of the parser classes
<!-- topics: cd-parsing.parser-hierarchy -->

**Claim.** For classes of grammars,

$$\mathrm{LR}(0) \subsetneq \mathrm{SLR}(1) \subsetneq \mathrm{LALR}(1) \subsetneq \mathrm{LR}(1), \qquad \mathrm{LL}(1) \subsetneq \mathrm{LR}(1),$$

while $\mathrm{LL}(1)$ is incomparable with $\mathrm{SLR}(1)$ and $\mathrm{LALR}(1)$. No ambiguous grammar is in any of these classes. For languages, SLR(1), LALR(1) and LR(1) grammars generate exactly the deterministic context-free languages, and LR(0) grammars generate exactly the deterministic CFLs with the prefix property (no word is a proper prefix of another). General CFG parsing (CYK, Earley) costs $O(n^3)$.

**Proof.** Inclusions. $\mathrm{LR}(0) \subseteq \mathrm{SLR}(1)$: shown in the SLR section. $\mathrm{SLR}(1) \subseteq \mathrm{LALR}(1)$: both use the same states with the same shifts, and the LALR reduce lookaheads are subsets of FOLLOW, so an LALR conflict entry is also an SLR conflict entry. $\mathrm{LALR}(1) \subseteq \mathrm{LR}(1)$: each LR(1) state's actions are a subset of its merged state's actions. $\mathrm{LL}(1) \subseteq \mathrm{LR}(1)$: an LL(1) parser chooses each production from the lookahead before reading its right-hand side, while an LR(1) parser needs to choose it only after reading all of it with the same lookahead, so it has strictly more information (Aho et al.; Hopcroft–Ullman give the formal proof).

Strictness, by the examples verified below: the expression grammar is SLR(1) but not LR(0); the $L = R$ grammar is LALR(1) but not SLR(1); the $Aa \mid bAc \mid Bc \mid bBa$ grammar is LR(1) but not LALR(1); the expression grammar is LR(1) but left recursive, so not LL(1). For incomparability: the expression grammar is SLR(1) and not LL(1), and $S \to aA \mid bB$, $A \to Ca \mid Db$, $B \to Cb \mid Da$, $C \to E$, $D \to E$, $E \to \varepsilon$ is LL(1) but not LALR(1), because after $a$ and after $b$ the reductions $C \to E$ and $D \to E$ need different lookaheads and LALR merges those states.

Ambiguity: a deterministic LR parser produces a unique action sequence for each input, and its reductions are the reverse of a rightmost derivation, so a string with two rightmost derivations would need two different sequences. The same argument with leftmost derivations covers LL(1).

Languages: every LR(1) grammar has a deterministic PDA (the LR parser itself), and every DPDA language has an LR(1) grammar, indeed an SLR(1) grammar after transforming the grammar (Knuth 1965; the SLR refinement follows from Hopcroft–Ullman's construction). So the three grammar classes differ in which grammars they accept, not in which languages. An LR(0) parser must decide to accept without lookahead, so if $w$ and $wx$ were both in the language it would have to both stop and continue at the end of $w$; that is the prefix property.

**GATE use.** "Which statement is true?" MCQs: the strict chain is about grammars; every LL(1) grammar is LR(1) but not necessarily SLR(1) or LALR(1); ambiguous grammars are none of these. Traps: reading the strict chain as a statement about languages, and assuming LL(1) implies LALR(1).

**Check.** The script counted conflicting table entries for the LR(0), SLR, LALR, LR(1) and LL(1) tables: (2, 0, 0, 0, 4) for the expression grammar, (1, 1, 0, 0, 2) for $L = R$, (5, 2, 2, 0, 2) for the $Aa \mid bAc \mid Bc \mid bBa$ grammar and (3, 2, 2, 0, 0) for the $aA \mid bB$ grammar, whose LALR conflicts are reduce-reduce between $C \to E$ and $D \to E$ on $a$ and $b$. On 4,000 random grammars none violated $\mathrm{LR}(0) \subseteq \mathrm{SLR}(1) \subseteq \mathrm{LALR}(1) \subseteq \mathrm{LR}(1)$, and on 3,842 random reduced grammars all 876 LL(1) grammars were LR(1).

## Operator-precedence relations from LEADING and TRAILING
<!-- topics: cd-parsing.operator-precedence -->

**Claim.** In an operator grammar (no $\varepsilon$-productions and no right-hand side with two adjacent nonterminals), define $\mathrm{LEADING}(A)$ as the terminals $a$ with $A \Rightarrow^+ \gamma a \delta$ where $\gamma$ is $\varepsilon$ or a single nonterminal, and $\mathrm{TRAILING}(A)$ symmetrically from the right. The precedence relations are

- $a \doteq b$ if some right-hand side contains $ab$ or $aBb$;
- $a \lessdot b$ if some right-hand side contains $aB$ and $b \in \mathrm{LEADING}(B)$;
- $a \gtrdot b$ if some right-hand side contains $Bb$ and $a \in \mathrm{TRAILING}(B)$;

with $\$ \lessdot \mathrm{LEADING}(S)$ and $\mathrm{TRAILING}(S) \gtrdot \$$. If at most one relation holds for every pair, the parser that shifts on $\lessdot$ or $\doteq$ and reduces the segment between the last $\lessdot$ and the top on $\gtrdot$ finds the handles. For $E \to E + T \mid T$, $T \to T * F \mid F$, $F \to (E) \mid \mathrm{id}$ the relations give $+ \lessdot *$, $* \gtrdot +$, $+ \gtrdot +$ and $* \gtrdot *$: $*$ binds tighter and both are left associative.

**Proof.** In an operator grammar every sentential form alternates terminals with at most one nonterminal between them, so a handle is determined by its terminals. Let $a$ be the terminal just left of a handle and $b$ the first terminal of the handle. The handle is the right-hand side of $B$ in some rule containing $aB$ (the parent rule placed $a$ next to $B$), and $b$ begins what $B$ derived, possibly after a nonterminal, so $b \in \mathrm{LEADING}(B)$: this is $a \lessdot b$. Inside a handle consecutive terminals come from one right-hand side, separated by at most one nonterminal: $\doteq$. The last terminal $a$ of the handle and the terminal $b$ after it satisfy $a \in \mathrm{TRAILING}(B)$ for a rule containing $Bb$: $a \gtrdot b$. So, when the relations are unique, the left end of a handle is the last $\lessdot$ and its right end is the first $\gtrdot$, which is what the parser uses. The relations for the expression grammar follow by computing $\mathrm{LEADING}(T) = \{*, (, \mathrm{id}\}$, so $E \to E + T$ gives $+ \lessdot *$; and $\mathrm{TRAILING}(E) = \{+, *, ), \mathrm{id}\}$, so the same rule gives $+ \gtrdot +$ and $* \gtrdot +$. The method handles only operator grammars, cannot treat a unary and a binary minus as one token, and the table can be compressed into precedence functions $f, g$ only when the relation graph has no cycle.

**GATE use.** Questions give a precedence and associativity table and ask for the value of an expression, or for the relation between two operators. Higher precedence on the stack means $\gtrdot$ (reduce first); equal precedence with left associativity means $\gtrdot$, with right associativity $\lessdot$. The trap is evaluating left to right regardless of the table.

**Check.** The script computed $\mathrm{LEADING}(E) = \{+, *, (, \mathrm{id}\}$, $\mathrm{LEADING}(T) = \{*, (, \mathrm{id}\}$, $\mathrm{LEADING}(F) = \{(, \mathrm{id}\}$ and the matching TRAILING sets. An operator-precedence parser with $+ \lessdot *$ and left associativity evaluated 2,000 random expressions over $+$ and $*$ and agreed with ordinary arithmetic each time; $2 + 3 * 4 + 5$ gives 19.

## Error detection and panic-mode recovery
<!-- topics: cd-parsing.error-recovery, cd-parsing.viable-prefixes -->

**Claim.** LL(1) and canonical LR(1) parsers have the valid-prefix property: they report an error on the first token $a$ such that the consumed input $u$ is a prefix of some sentence but $ua$ is not. SLR(1) and LALR(1) parsers also never shift an erroneous token, though they may perform some extra reductions before detecting the error. In panic-mode recovery the parser discards input up to a synchronising token (for a nonterminal $A$, a token in $\mathrm{FOLLOW}(A)$), and resumes with the stack adjusted so that $A$ is treated as recognised or abandoned. Recoveries that discard a token number at most $n + 1$ on input of length $n$, counting $\$$. Recoveries that only pop are not bounded by $n + 1$: with $S \to x\,a\,b\,c\,d\,e\,w$ and input $x\,w$, the terminals $a$ to $e$ are popped one by one on the lookahead $w$, five recoveries. For an LL(1) parser whose recoveries either skip the token or pop the top symbol without pushing, the run still terminates, and the pop-only recoveries number at most the symbols ever pushed, which is $O(n)$.

**Proof.** For LR parsers, the stack always spells a viable prefix (the DFA path invariant of the items section), and a shift of $a$ happens only if the item set contains $A \to \alpha \cdot a \beta$, so $\gamma a$ is again a viable prefix and $ua$ is a prefix of some sentence. Hence an invalid token is never shifted, and the error is detected while that token is the lookahead. Canonical LR(1) reduces only on lookaheads that are valid in context, so it also performs no reduction on $a$ unless some sentence continues with $a$; SLR and LALR reduce on the coarser FOLLOW or merged sets, so they may reduce first and detect the error in the state after. For LL(1), every expansion and match keeps the stack equal to a suffix of a leftmost sentential form consistent with $u$, and a blank cell means no such form continues with $a$.

Termination for LL(1): fix a lookahead $a$. If $M[X, a] = X \to \rho$, then $a \in \mathrm{FIRST}(\rho)$, or $\rho$ is nullable and $a \in \mathrm{FOLLOW}(X)$; in both cases each symbol of $\rho$ that reaches the top before $a$ is matched has a non-blank cell or matches $a$, by the same FIRST and FOLLOW rules. So an expansion never errs on its own symbols: it either consumes $a$ or erases itself, leaving the stack one shorter than before $X$ was expanded, and the absence of left recursion bounds its size by a constant. A pop-only recovery also shortens the stack. While $a$ is the lookahead the stack height therefore drops at every top-level step, so these steps are at most the height, and every symbol popped this way was pushed earlier. Each consumed token adds a constant number of symbols, which gives $O(n)$ pushes and so $O(n)$ pop-only recoveries. A recovery that neither consumes nor pops could repeat forever on the same token and stack, which is why the rule requires progress. Choosing $\mathrm{FOLLOW}(A)$ as the synchronising set makes the resumed configuration consistent: after abandoning $A$, the next token is one that can legitimately follow $A$, so parsing continues as if $A$ had been derived.

**GATE use.** Conceptual MCQs ask which parser detects errors earliest (canonical LR(1) and LL(1), with SLR and LALR possibly reducing first but never shifting the bad token), what the synchronising set is in panic mode (FOLLOW of the nonterminal on the stack), and which recovery modes exist (panic mode, phrase level, error productions, global correction). The trap is believing SLR or LALR shift past an error.

**Check.** The script's SLR parser on $\mathrm{id} + * \,\mathrm{id}$ shifted $\mathrm{id}$, reduced $F \to \mathrm{id}$, $T \to F$, $E \to T$, shifted $+$, and reported an error on $*$ (token index 2) with no third shift: $\mathrm{id} +$ is a prefix of a sentence, $\mathrm{id} + *$ is not.
