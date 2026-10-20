# Discrete mathematics: derivations

## Implication, De Morgan and exportation from the truth table
<!-- topics: em-discrete-mathematics.propositional-logic, em-discrete-mathematics.logical-equivalences -->

**Claim.** Write $\varphi \equiv \psi$ when the two formulas take the same truth value under every assignment of T and F to their variables. For variables $p, q, r$:

$$p \to q \equiv \neg p \lor q, \qquad \neg(p \to q) \equiv p \land \neg q, \qquad p \to q \equiv \neg q \to \neg p,$$

$$\neg(p \land q) \equiv \neg p \lor \neg q, \qquad \neg(p \lor q) \equiv \neg p \land \neg q, \qquad p \to (q \to r) \equiv (p \land q) \to r.$$

The converse $q \to p$ and the inverse $\neg p \to \neg q$ are equivalent to each other but not to $p \to q$, and $(p \to q) \to r$ is not equivalent to $p \to (q \to r)$. A formula in $k$ distinct variables has a truth table of $2^k$ rows, and there are $2^{2^k}$ distinct Boolean functions of $k$ variables.

**Proof.** By definition $p \to q$ is false in exactly one row, $p = \mathrm{T}$ and $q = \mathrm{F}$. The disjunction $\neg p \lor q$ is false exactly when both disjuncts are false, which is the same row. Two formulas that are false in exactly the same rows agree everywhere, so they are equivalent. The negation $\neg(p \to q)$ is therefore true in that row only, and $p \land \neg q$ is true in that row only.

For De Morgan, $\neg(p \land q)$ is false exactly when $p \land q$ is true, that is when $p = q = \mathrm{T}$, and $\neg p \lor \neg q$ is false exactly when $\neg p$ and $\neg q$ are both false, the same row. Substituting $\neg p, \neg q$ for $p, q$ gives $\neg(\neg p \land \neg q) \equiv p \lor q$, and negating both sides gives the second law. The set version follows because $x \in A$ is a proposition: $x \notin A \cup B$ holds exactly when $x \notin A$ and $x \notin B$.

The contrapositive: $\neg q \to \neg p \equiv \neg\neg q \lor \neg p \equiv q \lor \neg p \equiv p \to q$, using the first identity twice and commutativity of $\lor$. The converse $q \to p \equiv \neg q \lor p$ is false at $p = \mathrm{F}, q = \mathrm{T}$, where $p \to q$ is true. The inverse $\neg p \to \neg q$ is the contrapositive of the converse, so it is equivalent to the converse.

Exportation: $p \to (q \to r) \equiv \neg p \lor (\neg q \lor r) \equiv (\neg p \lor \neg q) \lor r \equiv \neg(p \land q) \lor r \equiv (p \land q) \to r$, by the first identity, associativity of $\lor$, De Morgan and the first identity again. For the non-associativity take $p = \mathrm{F}, r = \mathrm{F}$: then $p \to (q \to r)$ is true because its antecedent is false, while $p \to q$ is true and so $(p \to q) \to r$ is $\mathrm{T} \to \mathrm{F}$, false. The same rewriting gives $(p \to q) \lor (q \to p) \equiv \neg p \lor q \lor \neg q \lor p$, a tautology.

For the counts, each of the $k$ variables takes two values independently, so the product rule gives $2^k$ rows. A Boolean function is a choice of output for each row, made independently, so there are $2^{2^k}$ of them. A formula is a tautology when its column is all T, so $\varphi$ is a tautology exactly when $\neg\varphi$ is all F, a contradiction.

**GATE use.** The 1-mark MCQ lists four formulas and asks which is equivalent to a given one, or which is a tautology. Rewrite every $\to$ as $\neg p \lor q$, push negations inward with De Morgan, and for each surviving option look for the falsifying row by making an antecedent true and its consequent false. The traps are reading implication as associative, taking the converse for the contrapositive, and forgetting that a false antecedent makes the implication true.

**Check.** With $k = 3$ there are 8 rows and 256 functions of three variables; for $k = 2$ there are 16. A script evaluated every identity above on all 8 assignments of $p, q, r$ and found $(p \to q) \to r$ and $p \to (q \to r)$ differing in exactly the rows $(p, q, r) = (\mathrm{F}, \mathrm{F}, \mathrm{F})$ and $(\mathrm{F}, \mathrm{T}, \mathrm{F})$, and the converse differing from $p \to q$ at $(\mathrm{F}, \mathrm{T})$ and $(\mathrm{T}, \mathrm{F})$.

## Functionally complete sets of connectives
<!-- topics: em-discrete-mathematics.propositional-logic -->

**Claim.** A set of connectives is functionally complete when every Boolean function of any number of variables is expressed by a formula built from the variables with those connectives alone. $\{\neg, \land, \lor\}$, $\{\neg, \land\}$, $\{\neg, \lor\}$, $\{\neg, \to\}$, $\{\uparrow\}$ (NAND) and $\{\downarrow\}$ (NOR) are complete. $\{\land, \lor\}$, $\{\to\}$ and $\{\oplus\}$ are not.

**Proof.** For $\{\neg, \land, \lor\}$: a function $f$ of $p_1, \dots, p_k$ that is not identically F is the disjunction, over the rows where $f = \mathrm{T}$, of the conjunction of literals describing that row ($p_i$ where the row has T, $\neg p_i$ where it has F); this DNF is true in exactly those rows. The identically false function is $p_1 \land \neg p_1$. De Morgan removes $\lor$ via $p \lor q \equiv \neg(\neg p \land \neg q)$, so $\{\neg, \land\}$ suffices, and dually $\{\neg, \lor\}$. Since $p \lor q \equiv \neg p \to q$, $\{\neg, \to\}$ expresses $\{\neg, \lor\}$. For NAND, $\neg p \equiv p \uparrow p$ and $p \land q \equiv \neg(p \uparrow q) \equiv (p \uparrow q) \uparrow (p \uparrow q)$, which reduces to $\{\neg, \land\}$; for NOR, $\neg p \equiv p \downarrow p$ and $p \lor q \equiv (p \downarrow q) \downarrow (p \downarrow q)$, which reduces to $\{\neg, \lor\}$.

Each incomplete set preserves a property that $\neg p$ lacks; an induction on the formula shows that every formula built from the set keeps it. $\land$ and $\lor$ output T when all inputs are T, so every $\{\land, \lor\}$ formula is T on the all-T row, while $\neg p$ is F there. The same holds for $\to$, since $\mathrm{T} \to \mathrm{T} = \mathrm{T}$. For $\oplus$, $\mathrm{F} \oplus \mathrm{F} = \mathrm{F}$, so every $\{\oplus\}$ formula is F on the all-F row, while $\neg p$ is T there.

**GATE use.** MCQs ask which set is functionally complete or which single connective is. Show that $\neg$ and one of $\land, \lor$ can be built; to refute, find a row (all T or all F) on which every formula of the set is forced to one value. The trap is accepting $\{\to\}$: it becomes complete only with the constant F, since $\neg p \equiv p \to \mathrm{F}$.

**Check.** A script closed $\{p, q\}$ under each set of operations on truth-table columns. NAND, NOR, $\{\neg, \land\}$, $\{\neg, \lor\}$ and $\{\neg, \to\}$ each produced all 16 functions of two variables, and NAND all 256 of three; $\{\land, \lor\}$ produced 4, $\{\to\}$ 6 and $\{\oplus\}$ 4.

## Valid arguments, the rules of inference and resolution
<!-- topics: em-discrete-mathematics.inference-rules, em-discrete-mathematics.logical-equivalences -->

**Claim.** An argument with premises $P_1, \dots, P_k$ and conclusion $C$ is valid, written $P_1, \dots, P_k \vdash C$, when no assignment makes every premise true and $C$ false. This holds exactly when $(P_1 \land \dots \land P_k) \to C$ is a tautology, and exactly when $P_1 \land \dots \land P_k \land \neg C$ is unsatisfiable. Modus ponens $(p,\ p \to q \vdash q)$, modus tollens $(\neg q,\ p \to q \vdash \neg p)$, hypothetical syllogism $(p \to q,\ q \to r \vdash p \to r)$, disjunctive syllogism $(p \lor q,\ \neg p \vdash q)$ and resolution $(p \lor q,\ \neg p \lor r \vdash q \lor r)$ are valid. Affirming the consequent $(q,\ p \to q \vdash p)$ and denying the antecedent $(\neg p,\ p \to q \vdash \neg q)$ are not. Deriving the empty clause by resolution from the premises together with $\neg C$ proves the argument valid.

**Proof.** The implication $(P_1 \land \dots \land P_k) \to C$ is false only in a row where its antecedent is true and $C$ is false (previous section), so it is a tautology exactly when no such row exists, which is the definition of validity. Such a row is exactly a row satisfying $P_1 \land \dots \land P_k \land \neg C$, which gives the third form.

Each rule is checked on the rows where its premises hold. Modus ponens: $p = \mathrm{T}$ and $p \to q$ true leave only $q = \mathrm{T}$. Modus tollens: $\neg q$ gives $q = \mathrm{F}$, and $p \to q$ true with $q$ false forces $p = \mathrm{F}$. Hypothetical syllogism: if $p \to r$ were false then $p = \mathrm{T}$ and $r = \mathrm{F}$; $p \to q$ then forces $q = \mathrm{T}$, and $q \to r$ becomes $\mathrm{T} \to \mathrm{F}$, false, so no row has both premises true and the conclusion false. Disjunctive syllogism: $p = \mathrm{F}$ and $p \lor q$ true force $q = \mathrm{T}$. Resolution: in a row where $p \lor q$ and $\neg p \lor r$ are both true, either $p = \mathrm{T}$, and then the second clause forces $r$, or $p = \mathrm{F}$, and then the first forces $q$; either way $q \lor r$ is true.

A resolvent is true in every row where both of its parent clauses are true, so any clause derived from a set of clauses is true wherever the whole set is. The empty clause is true in no row, so deriving it from the clauses of $P_1, \dots, P_k, \neg C$ shows that no row satisfies all of them: by the third form, the argument is valid. Proof by contradiction is the same statement, and proof by contrapositive is valid because $\neg q \to \neg p \equiv p \to q$.

For the fallacies the row $p = \mathrm{F}, q = \mathrm{T}$ suffices: $q$ and $p \to q$ are true while $p$ is false, so affirming the consequent fails; $\neg p$ and $p \to q$ are true while $\neg q$ is false, so denying the antecedent fails.

**GATE use.** MCQs give two or three premises in symbols or in English and ask which conclusion follows. Reduce the argument to a chain of the valid rules, or search for a row with all premises true and the conclusion false; one such row refutes the option. The distractors are almost always the two fallacies.

**Check.** Premises $p \to q$, $q \to r$, $\neg r$ and conclusion $\neg p$ give the clauses $\{\neg p, q\}$, $\{\neg q, r\}$, $\{\neg r\}$ and, from the negated conclusion, $\{p\}$. Resolving $\{p\}$ with $\{\neg p, q\}$ gives $\{q\}$, then with $\{\neg q, r\}$ gives $\{r\}$, then with $\{\neg r\}$ gives the empty clause, so the argument is valid. A script confirmed that no row of the 8 satisfies all three premises with $p$ true, that all five rules are valid, and that the only row refuting affirming the consequent is $p = \mathrm{F}, q = \mathrm{T}$.

## Negating quantifiers and the order of mixed quantifiers
<!-- topics: em-discrete-mathematics.quantifiers, em-discrete-mathematics.fol-translation -->

**Claim.** Fix a non-empty domain $D$ and an interpretation of the predicates. Then

$$\neg \forall x\, P(x) \equiv \exists x\, \neg P(x), \qquad \neg \exists x\, P(x) \equiv \forall x\, \neg P(x),$$

and applying these once per quantifier from the outside in gives, for example, $\neg \forall x\, \exists y\, R(x,y) \equiv \exists x\, \forall y\, \neg R(x,y)$. Like quantifiers commute: $\forall x\, \forall y \equiv \forall y\, \forall x$ and $\exists x\, \exists y \equiv \exists y\, \exists x$. For mixed quantifiers $\exists y\, \forall x\, R(x,y) \to \forall x\, \exists y\, R(x,y)$ is valid and the converse is not.

**Proof.** $\forall x\, P(x)$ is true exactly when $P(a)$ is true for every $a \in D$. Its negation is true exactly when some $a \in D$ has $P(a)$ false, which is what $\exists x\, \neg P(x)$ says. Applying this law to the predicate $\neg P$ gives $\neg \forall x\, \neg P \equiv \exists x\, P$, and negating both sides gives the second law. On a finite domain $\{a_1, \dots, a_n\}$, $\forall x\, P$ is the conjunction $P(a_1) \land \dots \land P(a_n)$ and $\exists x\, P$ the disjunction, so the two laws are De Morgan's laws for $n$ terms.

For the nested case, the truth value of a formula depends only on the truth values of its subformulas, so an equivalent subformula can be substituted. Then $\neg \forall x\, \exists y\, R \equiv \exists x\, \neg \exists y\, R \equiv \exists x\, \forall y\, \neg R$, one quantifier at a time.

$\forall x\, \forall y\, R(x,y)$ and $\forall y\, \forall x\, R(x,y)$ both say that $R(a,b)$ holds for every pair in $D \times D$, so they agree; the existential case follows by negating both sides and using the laws above.

Suppose $\exists y\, \forall x\, R(x,y)$ holds, with witness $b$: $R(a,b)$ for every $a$. Then for each $a$, the element $b$ witnesses $\exists y\, R(a,y)$, so $\forall x\, \exists y\, R(x,y)$ holds. The converse fails on $D = \{0, 1\}$ with $R(x,y)$ meaning $x = y$: every $x$ has the witness $y = x$, but no single $y$ equals both 0 and 1. In $\forall x\, \exists y$ the witness may depend on $x$; in $\exists y\, \forall x$ one witness must serve every $x$, which is the stronger demand. Over the reals with $R(x,y)$ meaning $y > x$, $\forall x\, \exists y\, R$ holds with $y = x + 1$, and $\exists y\, \forall x\, R$ fails because $x = y$ is a counterexample to any proposed $y$.

**GATE use.** Two shapes recur: the negation of a nested formula, where the trap is flipping only the outer quantifier or failing to negate the matrix, and "which statement implies which", where $\exists\forall$ implies $\forall\exists$ and not the reverse. In English, "not everyone is happy" is $\exists x\, \neg H(x)$, not $\forall x\, \neg H(x)$. "Some course is taken by every student", $\exists y\, (C(y) \land \forall x\, (S(x) \to T(x,y)))$, puts $\exists y$ outermost and implies "every student takes some course", $\forall x\, (S(x) \to \exists y\, (C(y) \land T(x,y)))$, but not conversely.

**Check.** A script enumerated every binary relation on domains of 1, 2 and 3 elements (2, 16 and 512 relations) and confirmed in every case that $\exists y\, \forall x\, R$ implies $\forall x\, \exists y\, R$ and that $\neg \forall x\, \exists y\, R$ agrees with $\exists x\, \forall y\, \neg R$. On $\{0, 1\}$ with $R(x,y)$ meaning $x = y$ it returned $\forall x\, \exists y\, R$ true and $\exists y\, \forall x\, R$ false.

## Quantifier distribution and moving a quantifier out of an implication
<!-- topics: em-discrete-mathematics.fol-validity, em-discrete-mathematics.fol-translation -->

**Claim.** For unary predicates $P, Q$ over any non-empty domain:

$$\forall x\, (P \land Q) \equiv \forall x\, P \land \forall x\, Q, \qquad \exists x\, (P \lor Q) \equiv \exists x\, P \lor \exists x\, Q,$$

while only one direction holds for the other two pairs: $(\forall x\, P \lor \forall x\, Q) \to \forall x\, (P \lor Q)$ and $\exists x\, (P \land Q) \to (\exists x\, P \land \exists x\, Q)$ are valid and their converses are not. If $R$ has no free $x$, then $\forall x\, (R \to P(x)) \equiv R \to \forall x\, P(x)$, $\forall x\, (P(x) \to R) \equiv \exists x\, P(x) \to R$ and $\exists x\, (P(x) \to R) \equiv \forall x\, P(x) \to R$: a quantifier moved out of an antecedent flips.

**Proof.** Both sides of the first law say that every $a$ satisfies $P(a)$ and $Q(a)$. For the second, negate both sides and use the previous section: $\neg \exists x\, (P \lor Q) \equiv \forall x\, (\neg P \land \neg Q) \equiv \forall x\, \neg P \land \forall x\, \neg Q \equiv \neg \exists x\, P \land \neg \exists x\, Q \equiv \neg(\exists x\, P \lor \exists x\, Q)$, the middle step being the first law.

If $\forall x\, P$ holds then every $a$ satisfies $P(a)$, hence $P(a) \lor Q(a)$; the same holds if $\forall x\, Q$ does, so the first implication is valid. A witness $a$ of $P \land Q$ witnesses both $\exists x\, P$ and $\exists x\, Q$, so the second is valid. One countermodel refutes both converses: $D = \{1, 2\}$ with $P$ true only at 1 and $Q$ true only at 2. Every element satisfies $P \lor Q$ while neither $\forall x\, P$ nor $\forall x\, Q$ holds, and both $\exists x\, P$ and $\exists x\, Q$ hold while no element satisfies $P \land Q$.

For the prenex laws, case on the truth value of $R$, which does not depend on $x$. In $\forall x\, (R \to P(x)) \equiv \forall x\, (\neg R \lor P(x))$: if $R$ is false both sides are true, and if $R$ is true both reduce to $\forall x\, P(x)$. In $\forall x\, (P(x) \to R)$: if $R$ is true both sides are true; if $R$ is false the left side is $\forall x\, \neg P(x)$ and the right side is $\neg \exists x\, P(x)$, equal by the negation law. In $\exists x\, (P(x) \to R)$: if $R$ is true the left side holds at any element, which needs $D$ non-empty, and so does the right; if $R$ is false the left is $\exists x\, \neg P(x)$ and the right is $\neg \forall x\, P(x)$.

The translation rule follows from the same reading. $\forall x\, (A(x) \to B(x))$ restricts the claim to elements of $A$ because elements outside $A$ make the implication true, whereas $\forall x\, (A(x) \land B(x))$ claims every element is in $A$. $\exists x\, (A(x) \land B(x))$ demands an element of both, whereas $\exists x\, (A(x) \to B(x))$ is satisfied by any element outside $A$.

**GATE use.** A 2-mark MSQ lists four quantified formulas and asks which are valid. The recipe is a two-element domain where $P$ and $Q$ hold at different elements, which refutes every invalid distribution. The trap is accepting a converse of a one-way law, or translating "some cats are black" as $\exists x\, (\mathrm{Cat}(x) \to \mathrm{Black}(x))$.

**Check.** A script enumerated every pair $(P, Q)$ on domains of size 1, 2 and 3, 84 interpretations in all. The two equivalences and the two one-way implications held in all of them; $\forall x\, (P \lor Q) \to (\forall x\, P \lor \forall x\, Q)$ failed in 14, and so did $(\exists x\, P \land \exists x\, Q) \to \exists x\, (P \land Q)$. The three prenex laws held for both truth values of $R$ in all 84. On a domain with one cat that is not black and one non-cat, $\exists x\, (\mathrm{Cat}(x) \to \mathrm{Black}(x))$ came out true and $\exists x\, (\mathrm{Cat}(x) \land \mathrm{Black}(x))$ false.

## Inclusion–exclusion and the derangement numbers
<!-- topics: em-discrete-mathematics.sets-inclusion-exclusion -->

**Claim.** For finite sets $A_1, \dots, A_n$,

$$\Bigl|\bigcup_{i=1}^{n} A_i\Bigr| = \sum_{\varnothing \ne S \subseteq \{1,\dots,n\}} (-1)^{|S|+1} \Bigl|\bigcap_{i \in S} A_i\Bigr|,$$

which for three sets is $|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$. A derangement of $\{1, \dots, n\}$ is a permutation with no fixed point. Their number $D_n$ satisfies

$$D_n = n! \sum_{k=0}^{n} \frac{(-1)^k}{k!}, \qquad D_n = (n-1)(D_{n-1} + D_{n-2}) \ (n \ge 3), \quad D_1 = 0,\ D_2 = 1,$$

and for $n \ge 1$, $D_n$ is the integer nearest to $n!/e$.

**Proof.** Count each element's contribution to the right-hand side. An element in none of the sets contributes 0 to both sides. An element in exactly $m \ge 1$ of the sets lies in $\bigcap_{i \in S} A_i$ exactly when $S$ is a non-empty subset of those $m$ indices, so it contributes

$$\sum_{j=1}^{m} (-1)^{j+1}\binom{m}{j} = 1 - \sum_{j=0}^{m} (-1)^{j}\binom{m}{j} = 1 - (1 - 1)^m = 1,$$

by the binomial theorem. So every element of the union is counted exactly once. The number of elements of a universe $U$ in none of the sets is $|U| - |\bigcup A_i|$.

For derangements let $U$ be all $n!$ permutations and $A_i$ the permutations fixing $i$. A permutation in $\bigcap_{i \in S} A_i$ fixes the $k = |S|$ points of $S$ and permutes the other $n - k$ freely, so the intersection has $(n-k)!$ elements, and there are $\binom{n}{k}$ sets $S$ of size $k$. Hence

$$D_n = \sum_{k=0}^{n} (-1)^k \binom{n}{k} (n-k)! = \sum_{k=0}^{n} (-1)^k \frac{n!}{k!}.$$

For the recurrence, let $\sigma$ be a derangement of $\{1, \dots, n\}$ and $i = \sigma(n)$, one of $n - 1$ values. If $\sigma(i) = n$, then $\sigma$ swaps $i$ and $n$ and restricts to a derangement of the other $n - 2$ points: $D_{n-2}$ choices. If $\sigma(i) \ne n$, let $j = \sigma^{-1}(n)$, so $j \ne n$ and $j \ne i$. Define $\sigma'$ on $\{1, \dots, n-1\}$ by $\sigma'(j) = i$ and $\sigma' = \sigma$ elsewhere. Then $\sigma'(j) = i \ne j$ and the other values are unchanged, so $\sigma'$ is a derangement of $n - 1$ points. Conversely, from a derangement $\tau$ of $n - 1$ points and the value $i$, setting $j = \tau^{-1}(i)$, $\sigma(j) = n$, $\sigma(n) = i$ recovers $\sigma$, so this case contributes $D_{n-1}$. Summing over $i$ gives $(n-1)(D_{n-1} + D_{n-2})$.

For the approximation, $n!/e = n! \sum_{k \ge 0} (-1)^k/k!$, so $n!/e - D_n = n! \sum_{k > n} (-1)^k / k!$. This is an alternating series with decreasing terms, so its absolute value is at most the first term, $n!/(n+1)! = 1/(n+1) \le 1/2$, with equality only at $n = 1$, where $n!/e \approx 0.368$ and $D_1 = 0$ anyway. So $D_n$ is the nearest integer.

**GATE use.** NAT questions give three overlapping sets from a survey and ask for the union, the number in none, or whether the data are consistent. Derangements appear as letters in wrong envelopes; "exactly $r$ fixed points" is $\binom{n}{r} D_{n-r}$. The traps are the sign of the triple term and forgetting to subtract from the universe for "none".

**Check.** Sets of size 70, 60 and 50 with pairwise intersections 40, 30 and 25 and triple intersection 20 have a union of $180 - 95 + 20 = 105$, which is impossible in a class of 100. Brute force over all permutations for $n \le 8$ gave $D_n = 0, 1, 2, 9, 44, 265, 1854, 14833$, matching the sum formula, the recurrence and $\operatorname{round}(n!/e)$ for every $n$. Permutations of 5 points with exactly 2 fixed points number $\binom{5}{2} D_3 = 20$, and enumeration also gave 20. The three-set formula held on 200 random triples of sets.

## Counting relations by diagonal cells and off-diagonal pairs
<!-- topics: em-discrete-mathematics.relation-properties -->

**Claim.** On a set $A$ with $n$ elements, let $m = n(n-1)/2$. The numbers of relations are: all $2^{n^2}$; reflexive $2^{n^2 - n}$; irreflexive $2^{n^2-n}$; symmetric $2^{n(n+1)/2}$; reflexive and symmetric $2^{m}$; antisymmetric $2^n 3^{m}$; asymmetric $3^{m}$; reflexive and antisymmetric $3^m$. The empty relation is symmetric, antisymmetric, asymmetric and transitive, and reflexive only when $A = \varnothing$. The identity relation is both symmetric and antisymmetric.

**Proof.** A relation is any subset of the $n^2$ cells of $A \times A$, so there are $2^{n^2}$. Split the cells into the $n$ diagonal cells $(a,a)$ and the $m$ unordered pairs $\{a, b\}$ with $a \ne b$, each owning the two cells $(a,b)$ and $(b,a)$. Each property below constrains the diagonal cells one at a time and each pair separately, so the counts multiply by the product rule.

- Reflexive: every diagonal cell is forced in and the $n^2 - n$ off-diagonal cells are free: $2^{n^2 - n}$. Irreflexive forces every diagonal cell out, the same count.
- Symmetric: each diagonal cell is free ($2^n$), and each pair is either both cells or neither (2 states): $2^n \cdot 2^m = 2^{n + n(n-1)/2} = 2^{n(n+1)/2}$. Adding reflexivity fixes the diagonal: $2^m$.
- Antisymmetric: $(a,b)$ and $(b,a)$ with $a \ne b$ may not both be present, so each pair has 3 states (neither, only $(a,b)$, only $(b,a)$), and the diagonal is unconstrained because the condition only applies when $a \ne b$: $2^n 3^m$. Adding reflexivity fixes the diagonal: $3^m$.
- Asymmetric: $(a,b) \in R$ forbids $(b,a)$ for all $a, b$ including $a = b$, so $(a,a)$ would forbid itself and the diagonal is empty; each pair has the same 3 states: $3^m$. So asymmetric means antisymmetric and irreflexive.

Transitivity has no product formula because it couples cells across different pairs. The empty relation satisfies each of symmetric, antisymmetric, asymmetric and transitive because each says "for all pairs in $R$, …", which holds vacuously, while reflexivity demands every $(a,a)$, which fails as soon as $A$ has an element. The identity relation contains only diagonal cells, so it has no pair to violate either symmetry or antisymmetry.

**GATE use.** The 1-mark NAT asks for one of these counts with $n = 3$ or $4$. Use the diagonal and pair split for every variant, including combinations not listed (symmetric and irreflexive is $2^m$). The traps are 2 states per pair for antisymmetric relations, where there are 3, and treating antisymmetric as "not symmetric".

**Check.** A script tested all 512 relations on a 3-element set: 64 reflexive, 64 irreflexive, 64 symmetric, 8 reflexive and symmetric, 216 antisymmetric ($2^3 \cdot 3^3$), 27 asymmetric and 27 reflexive and antisymmetric, as the formulas give with $m = 3$. It also found 171 transitive relations and 5 equivalence relations. The same check passed for $n = 1$ and $n = 2$.

## Equivalence relations, partitions and the Stirling recurrence
<!-- topics: em-discrete-mathematics.equivalence-partitions, em-discrete-mathematics.relation-properties -->

**Claim.** Equivalence relations on a set correspond one to one with its partitions, the classes of the relation being the blocks. Let $S(n,k)$ be the number of partitions of an $n$-set into $k$ non-empty blocks, so it counts the equivalence relations with exactly $k$ classes. With $S(0,0) = 1$ and $S(n,0) = S(0,k) = 0$ for $n, k \ge 1$,

$$S(n,k) = S(n-1,k-1) + k\,S(n-1,k), \qquad B_n = \sum_{k=0}^{n} S(n,k),$$

where the Bell number $B_n$ counts all equivalence relations. $S(n,2) = 2^{n-1} - 1$ and $S(n, n-1) = \binom{n}{2}$ for $n \ge 2$.

**Proof.** Let $R$ be an equivalence relation and $[a] = \{x : a\,R\,x\}$. Reflexivity puts $a \in [a]$, so the classes are non-empty and cover the set. If $c \in [a] \cap [b]$, then $a\,R\,c$ and $b\,R\,c$; symmetry gives $c\,R\,b$ and transitivity $a\,R\,b$. Then any $x \in [b]$ has $b\,R\,x$, so $a\,R\,x$ and $x \in [a]$; by symmetry of the argument $[a] = [b]$. Distinct classes are therefore disjoint, and the classes form a partition. Conversely, for a partition, "$x$ and $y$ lie in the same block" is reflexive, symmetric and transitive, and its classes are the blocks. The two constructions undo each other, so the correspondence is a bijection, and counting equivalence relations with $k$ classes is counting partitions into $k$ blocks.

For the recurrence, split the partitions of $\{1, \dots, n\}$ into $k$ blocks by the block of $n$. If $\{n\}$ is a block by itself, deleting it leaves a partition of $\{1, \dots, n-1\}$ into $k - 1$ blocks, and every such partition arises once: $S(n-1, k-1)$. Otherwise $n$ shares a block, and deleting $n$ leaves a partition of $\{1, \dots, n-1\}$ into $k$ blocks; each such partition arises from exactly $k$ partitions of the first set, one for each block that $n$ can join: $k\,S(n-1,k)$. Summing over $k$ gives $B_n$.

For $k = 2$, assign each element to box 1 or box 2: $2^n$ ways, of which 2 leave a box empty. The blocks of a partition are unlabelled, so each 2-block partition was counted twice: $S(n,2) = (2^n - 2)/2 = 2^{n-1} - 1$. For $k = n - 1$, the block sizes sum to $n$ with $n - 1$ blocks, so one block has size 2 and the rest are singletons; the partition is fixed by choosing that pair: $\binom{n}{2}$.

Congruence modulo $m$ on $\mathbb{Z}$, $a \equiv b$ when $m \mid a - b$, is reflexive ($m \mid 0$), symmetric ($m \mid -(a-b)$) and transitive ($a - c = (a - b) + (b - c)$), and its classes are the $m$ residue classes.

**GATE use.** NAT questions ask for the number of equivalence relations on a 4- or 5-element set (Bell number) or the number with exactly $k$ classes (Stirling number). The trap is counting labelled boxes, $2^n - 2$ for two classes, instead of dividing by $k!$ when every block is non-empty.

**Check.** A script generated every partition of an $n$-set for $n \le 7$. Bell numbers $1, 1, 2, 5, 15, 52, 203, 877$ for $n = 0, \dots, 7$; $S(4,2) = 7$, $S(5,2) = 15 = 2^4 - 1$, $S(5,3) = 25$. The recurrence and both special values held for every $n \le 7$, and the 5 equivalence relations found by brute force on 3 elements equal $B_3$.

## Closures of relations, Warshall's invariant and diagonalisation
<!-- topics: em-discrete-mathematics.closures-countability -->

**Claim.** Let $R$ be a relation on an $n$-element set, $\Delta$ the identity relation and $R^k$ the $k$-fold composite, so $(a, c) \in R^k$ exactly when a path of $k$ steps of $R$ leads from $a$ to $c$. The smallest reflexive relation containing $R$ is $R \cup \Delta$, the smallest symmetric one is $R \cup R^{-1}$, and the smallest transitive one is $R^+ = R \cup R^2 \cup \dots \cup R^n$. The composite $S \circ R = \{(a,c) : \exists b,\ a\,R\,b,\ b\,S\,c\}$ has Boolean matrix $M_R \odot M_S$. Warshall's algorithm computes $R^+$ in $O(n^3)$ time. A relation containing $(a,b)$ and $(b,a)$ with $a \ne b$ has no antisymmetric closure. The finite strings over a finite alphabet are countable, and $\mathcal{P}(\mathbb{N})$ is not.

**Proof.** A closure is the smallest superset with the property. Any reflexive superset of $R$ contains $\Delta$ and $R$, and $R \cup \Delta$ is reflexive, so it is the smallest. Any symmetric superset containing $(a,b)$ contains $(b,a)$, so it contains $R^{-1}$, and $R \cup R^{-1}$ is symmetric.

For transitivity, $\bigcup_{k \ge 1} R^k$ is transitive, because a path from $a$ to $b$ followed by a path from $b$ to $c$ is a path from $a$ to $c$, and it contains $R$. If $T \supseteq R$ is transitive then $T \supseteq R^k$ for every $k$, by induction: $a\,R^{k}\,c$ means $a\,R^{k-1}\,b$ and $b\,R\,c$ for some $b$, both pairs are in $T$, so $(a,c) \in T$. So the union is the transitive closure. On $n$ elements a path of more than $n$ steps visits $n + 1$ or more vertices and repeats one; cutting out the loop between the repeats leaves a shorter path with the same ends, so paths of at most $n$ steps suffice.

For composition, $(a,c) \in S \circ R$ exactly when some $b$ has $M_R[a][b] = 1$ and $M_S[b][c] = 1$, which is the OR over $b$ of the ANDs, the Boolean matrix product $M_R \odot M_S$ in that order.

Warshall processes $k = 1, \dots, n$ and sets $M[i][j] = 1$ whenever $M[i][k] = M[k][j] = 1$. The invariant: after stage $k$, $M[i][j] = 1$ exactly when there is a path from $i$ to $j$ whose intermediate vertices all lie in $\{1, \dots, k\}$. At $k = 0$ these are the single edges of $R$. Take a shortest such path at stage $k$; it is simple, so it visits $k$ at most once. If it avoids $k$, the entry was already 1 after stage $k - 1$. If it passes through $k$, it splits into a path $i \to k$ and a path $k \to j$, each with intermediates in $\{1, \dots, k-1\}$, so $M[i][k]$ and $M[k][j]$ were 1 and the update sets $M[i][j]$. The update only adds pairs that have such paths, so it is exact. Updating in place is safe because the entries $M[i][k]$ and $M[k][j]$ cannot change during stage $k$: a path to or from $k$ gains nothing by passing through $k$. After stage $n$ every path qualifies, giving $R^+$, after $n$ stages of $n^2$ updates.

No antisymmetric closure exists in the stated case because every superset still contains both $(a,b)$ and $(b,a)$.

Strings over a finite alphabet are listed by length and then in dictionary order; each length has finitely many strings, so every string appears at a finite position, a bijection with $\mathbb{N}$ (or a finite set). Programs are strings, so they are countable. For $\mathcal{P}(\mathbb{N})$, suppose $f : \mathbb{N} \to \mathcal{P}(\mathbb{N})$ were onto and let $D = \{n : n \notin f(n)\}$. If $D = f(m)$, then $m \in D$ exactly when $m \notin f(m) = D$, a contradiction, so no such $f$ exists. Functions $\mathbb{N} \to \{0, 1\}$ correspond to subsets by their indicator, so they are uncountable too, and the same diagonal construction on decimal expansions, choosing digits 5 and 6 to avoid the $0.4999\ldots = 0.5$ ambiguity, shows that $\mathbb{R}$ is uncountable.

**GATE use.** MCQs give a small relation and ask for its transitive or symmetric closure, or ask which sets are countable. The traps are composing $R$ with itself once and calling it the transitive closure, and believing that a countable set of programs can decide every language when the languages, subsets of the strings, are uncountable.

**Check.** For $R = \{(1,2), (2,3), (3,4)\}$ on $\{1, \dots, 5\}$ the script computed $R^+ = \{(1,2), (1,3), (1,4), (2,3), (2,4), (3,4)\}$. On 300 random relations with $n \le 6$, Warshall's in-place result matched the union $R \cup R^2 \cup \dots \cup R^n$ every time. For $R = \{(1,2), (2,3), (3,4), (4,2)\}$ on $\{1, 2, 3, 4\}$ the closure has 12 pairs: 1 reaches 2, 3, 4, and each vertex of the cycle $2 \to 3 \to 4 \to 2$ reaches all three of 2, 3, 4, itself included, while $(1,1)$ is absent.

## Counting functions, injections and surjections
<!-- topics: em-discrete-mathematics.functions, em-discrete-mathematics.sets-inclusion-exclusion -->

**Claim.** Let $|A| = m$ and $|B| = n$. There are $n^m$ functions $A \to B$, $n!/(n-m)!$ injections when $m \le n$ (none when $m > n$), $n!$ bijections when $m = n$, and

$$\sum_{k=0}^{n} (-1)^k \binom{n}{k} (n-k)^m = n!\,S(m,n)$$

surjections. If $g \circ f$ is injective then $f$ is injective, and if $g \circ f$ is surjective then $g$ is surjective. $f$ has an inverse exactly when it is a bijection, and $(g \circ f)^{-1} = f^{-1} \circ g^{-1}$. There are $(n+1)^m$ partial functions $A \to B$, in which an element may be left unmapped.

**Proof.** A function chooses an image for each of the $m$ elements independently, $n$ choices each: $n^m$. For injections list $A$ as $a_1, \dots, a_m$; $a_i$ must avoid the $i - 1$ images already used, leaving $n - i + 1$ choices, and the product $n(n-1)\cdots(n-m+1) = n!/(n-m)!$. When $m > n$ the factor for $i = n + 1$ is 0, which is the pigeonhole principle in function form. With $m = n$ every injection is onto, giving $n!$ bijections. A partial function gives each element of $A$ one of $n$ images or none, $n + 1$ independent choices: $(n+1)^m$. Equivalently, it is a total function into $B \cup \{\bot\}$.

For surjections let $U_b$ be the functions that miss $b \in B$. Functions missing every element of a specified $k$-subset of $B$ map into the other $n - k$ elements: $(n-k)^m$ of them, and there are $\binom{n}{k}$ such subsets. Inclusion–exclusion gives the number missing nothing as $n^m - \lvert\bigcup U_b\rvert = \sum_{k} (-1)^k \binom{n}{k} (n-k)^m$. For the second form, an onto $f$ is determined by its fibres $f^{-1}(b)$, which form a partition of $A$ into $n$ non-empty blocks, together with the assignment of the $n$ blocks to the $n$ elements of $B$; conversely each such pair defines one onto function. That gives $S(m,n) \cdot n!$.

For the composition facts, if $f(a) = f(a')$ then $g(f(a)) = g(f(a'))$, and injectivity of $g \circ f$ gives $a = a'$. If $g \circ f$ is onto $C$, each $c$ equals $g(f(a))$ for some $a$, so $c$ is hit by $g$. If $f$ has a two-sided inverse $h$, then $f(a) = f(a')$ gives $a = h(f(a)) = h(f(a')) = a'$, and every $b = f(h(b))$ is hit, so $f$ is bijective; conversely a bijection gives each $b$ a unique preimage, which defines $f^{-1}$. Finally $(g \circ f) \circ (f^{-1} \circ g^{-1}) = g \circ g^{-1}$ is the identity, and likewise in the other order.

**GATE use.** NAT and MCQ questions ask for the number of onto functions from a 4- or 5-set to a 3-set, or of injections. The traps are stopping the inclusion–exclusion after the subtraction, swapping the roles of $m$ and $n$ (using $m^n$), and forgetting the $n!$ that labels the blocks in the Stirling form.

**Check.** Onto functions from 4 to 3 elements: $81 - 3 \cdot 16 + 3 \cdot 1 = 36$. From 5 to 3: $243 - 96 + 3 = 150 = 3! \cdot S(5,3) = 6 \cdot 25$. Injections from 3 to 5 elements: $5 \cdot 4 \cdot 3 = 60$. Partial functions from 3 to 2 elements: $3^3 = 27$. A script enumerated every function for $m \le 5$, $n \le 4$ and confirmed all four counts and both forms of the surjection count.

## Lattices: joins, complements and when the divisor lattice is Boolean
<!-- topics: em-discrete-mathematics.posets-hasse, em-discrete-mathematics.boolean-lattices -->

**Claim.** (i) Every finite non-empty poset has a maximal element; a greatest element, when it exists, is unique; every finite non-empty lattice has a least element 0 and a greatest element 1. (ii) In a distributive bounded lattice each element has at most one complement. (iii) $M_3$ and $N_5$ are not distributive, so a lattice containing either as a sublattice is not distributive. (iv) The divisors $D_n$ of $n$ under divisibility form a distributive lattice with meet $\gcd$ and join $\operatorname{lcm}$; $a \in D_n$ has a complement exactly when $\gcd(a, n/a) = 1$, and the complement is then $n/a$. So $D_n$ is complemented, hence Boolean, exactly when $n$ is square-free, and then $D_n \cong \mathcal{P}(\{p_1, \dots, p_k\})$ for the $k$ primes dividing $n$, with $2^k$ elements.

**Proof.** (i) Start at any element and repeatedly step to a strictly larger one. By transitivity and antisymmetry the elements visited form a strictly increasing chain and never repeat, so in a finite poset the walk stops, at an element with nothing strictly above it. If $g$ and $g'$ are both greatest then $g \le g'$ and $g' \le g$, so $g = g'$ by antisymmetry. In a finite lattice $a_1 \lor a_2 \lor \dots \lor a_r$ over all elements is an upper bound of every element, so it is the greatest element 1; dually the meet of all elements is 0.

(ii) Let $b$ and $c$ both be complements of $a$: $a \lor b = a \lor c = 1$ and $a \land b = a \land c = 0$. Then

$$b = b \land 1 = b \land (a \lor c) = (b \land a) \lor (b \land c) = 0 \lor (b \land c) = b \land c,$$

and the same computation with $b$ and $c$ exchanged gives $c = c \land b$. So $b = c$.

(iii) $M_3$ has 0, 1 and three pairwise incomparable atoms $a, b, c$. Then $a \land (b \lor c) = a \land 1 = a$ while $(a \land b) \lor (a \land c) = 0 \lor 0 = 0$, and $a$ has two complements, $b$ and $c$. $N_5$ has 0, 1, a chain $a < b$ and an element $c$ incomparable to both. Then $b \land (a \lor c) = b \land 1 = b$ while $(b \land a) \lor (b \land c) = a \lor 0 = a$, and $c$ has two complements, $a$ and $b$. A sublattice uses the same joins and meets, so a failure of the distributive law inside it is a failure in the whole lattice. The converse, that a non-distributive lattice must contain $M_3$ or $N_5$, is Birkhoff's theorem and is quoted here without proof.

(iv) $d$ divides both $a$ and $b$ exactly when $d$ divides $\gcd(a,b)$, so $\gcd$ is the greatest lower bound in $D_n$; dually $\operatorname{lcm}$ is the least upper bound, and both stay inside $D_n$. Write each divisor by its prime exponents. For each prime, $\gcd$ takes the minimum exponent and $\operatorname{lcm}$ the maximum, and $\min(x, \max(y,z)) = \max(\min(x,y), \min(x,z))$ for integers, as checking the cases $x \le y \le z$, $y \le x \le z$ and $y \le z \le x$ (with $y \le z$ by symmetry) shows. So $D_n$ is distributive. A complement $x$ of $a$ needs $\gcd(a, x) = 1$ and $\operatorname{lcm}(a, x) = n$; coprimality makes $\operatorname{lcm}(a,x) = ax$, so $x = n/a$, and it works exactly when $\gcd(a, n/a) = 1$. If $p^2 \mid n$ then $a = p$ has $p \mid n/p$, so $p$ has no complement. If $n$ is square-free, no prime divides both $a$ and $n/a$, so every element has a complement. For square-free $n = p_1 \cdots p_k$, sending a divisor to its set of prime factors is a bijection onto $\mathcal{P}(\{p_1, \dots, p_k\})$ that turns divisibility into inclusion, $\gcd$ into $\cap$ and $\operatorname{lcm}$ into $\cup$.

**GATE use.** A 1-mark MCQ asks which $D_n$ is a Boolean algebra, or which element lacks a complement; others draw a Hasse diagram and ask whether it is a lattice. Check each incomparable pair for a unique least upper bound: two incomparable minimal upper bounds mean there is no join. Two complements of one element, or a visible $M_3$ or $N_5$, refutes distributivity.

**Check.** In $D_{12}$ the script found the complement pairs $1 \leftrightarrow 12$ and $3 \leftrightarrow 4$, and none for 2 or 6. For every $n \le 300$, $D_n$ was complemented exactly when $n$ was square-free, each complement was unique and equal to $n/a$, and the distributive law held in every $D_n$ with $n \le 60$. The explicit $M_3$ gave $a \land (b \lor c) = a$ against $0$, and $N_5$ gave $b \land (a \lor c) = b$ against $a$.

## Lagrange's theorem and the structure of the cyclic group of order n
<!-- topics: em-discrete-mathematics.algebraic-structures, em-discrete-mathematics.subgroups-cyclic -->

**Claim.** Let $G$ be a finite group and $H$ a subgroup. Then $|H|$ divides $|G|$ and the index is $[G:H] = |G|/|H|$; the order of every element divides $|G|$ and $a^{|G|} = e$; every group of prime order is cyclic. In $\mathbb{Z}_n$ under addition mod $n$:

$$\operatorname{ord}(a) = \frac{n}{\gcd(a,n)}, \qquad \#\text{generators} = \varphi(n), \qquad \varphi(n) = n \prod_{p \mid n}\Bigl(1 - \frac{1}{p}\Bigr),$$

there is exactly one subgroup for each divisor $d$ of $n$, exactly $\varphi(d)$ elements of order $d$, and $\sum_{d \mid n} \varphi(d) = n$. $\mathbb{Z}_n \setminus \{0\}$ is closed under multiplication mod $n$ exactly when $n$ is prime, and the units $\{a : \gcd(a,n) = 1\}$ always form a group of order $\varphi(n)$. The converse of Lagrange fails: $A_4$, of order 12, has no subgroup of order 6.

**Proof.** For $a \in G$ the left coset is $aH = \{ah : h \in H\}$. The map $h \mapsto ah$ is injective by cancellation, so $|aH| = |H|$. Each $a$ lies in its own coset since $e \in H$. If $c \in aH \cap bH$, say $c = ah_1 = bh_2$, then $a = b h_2 h_1^{-1}$, and for any $h$, $ah = b(h_2 h_1^{-1} h) \in bH$ because $H$ is closed; so $aH \subseteq bH$, and the symmetric argument gives equality. The cosets therefore partition $G$ into $[G:H]$ blocks of size $|H|$, and $|G| = [G:H]\,|H|$. An element $a$ of order $k$ generates the subgroup $\{e, a, \dots, a^{k-1}\}$ of order $k$, so $k \mid |G|$ and $a^{|G|} = (a^k)^{|G|/k} = e$. In a group of prime order $p$, any $a \ne e$ has order dividing $p$ and not 1, so $\langle a \rangle = G$.

In $\mathbb{Z}_n$ let $g = \gcd(a, n)$. Then $ka \equiv 0 \pmod n$ means $n \mid ka$, that is $\tfrac{n}{g} \mid k \tfrac{a}{g}$; since $\gcd(\tfrac{n}{g}, \tfrac{a}{g}) = 1$, this holds exactly when $\tfrac{n}{g} \mid k$, and the least such $k$ is $n/g$. So $a$ generates $\mathbb{Z}_n$ exactly when $\gcd(a,n) = 1$, which happens for $\varphi(n)$ values of $a$. The elements of order $d$ are those with $\gcd(a, n) = n/d$, which are $a = \tfrac{n}{d} b$ with $0 \le b < d$ and $\gcd(b, d) = 1$: $\varphi(d)$ of them. Every element has some order dividing $n$, so summing over $d$ counts each element once and $\sum_{d \mid n} \varphi(d) = n$.

For the subgroups, let $H \ne \{0\}$ be a subgroup of $\mathbb{Z}_n$, viewed on residues $0, \dots, n-1$, and $s$ its least positive element. Any $h \in H$ is $qs + r$ with $0 \le r < s$, and $r = h - qs \in H$, so $r = 0$ by minimality: $H = \langle s \rangle$. Applying the same division to $n \equiv 0 \in H$ shows $s \mid n$. So each subgroup is $\langle s \rangle$ for a divisor $s$ of $n$, of order $n/s$; different divisors give subgroups of different orders, so there is exactly one subgroup of each order $d \mid n$.

For the totient, let $p_1, \dots, p_r$ be the primes dividing $n$ and $A_i$ the multiples of $p_i$ in $\{1, \dots, n\}$. The integers divisible by every prime of a set $S$ are the multiples of $\prod_{i \in S} p_i$, of which there are $n / \prod_{i \in S} p_i$. Inclusion–exclusion gives the count coprime to $n$ as $\sum_{S} (-1)^{|S|} n / \prod_{i \in S} p_i$, which is the expansion of $n \prod_i (1 - 1/p_i)$.

If $n = ab$ with $1 < a, b < n$, then $ab \equiv 0$ leaves $\mathbb{Z}_n \setminus \{0\}$; if $n = p$ is prime, $p \nmid ab$ for $a, b$ in $1, \dots, p - 1$, and the set is the group of units below. Products of numbers coprime to $n$ are coprime to $n$, multiplication is associative, 1 is the identity, and Bézout's identity $ax + ny = 1$ gives $ax \equiv 1$, an inverse. So the units form a group of order $\varphi(n)$.

For $A_4$, suppose $|H| = 6$, so $H$ has index 2 with cosets $H$ and $gH$ for any $g \notin H$. Then $g^2 \in H$ for every $g$: if $g \notin H$ and $g^2 \notin H$, then $g^2 \in gH$, so $g^2 = gh$ and $g = h \in H$, a contradiction. Each of the eight 3-cycles $\sigma$ satisfies $\sigma = \sigma^4 = (\sigma^2)^2$, so $\sigma \in H$, and $H$ would contain eight elements, too many for order 6.

**GATE use.** MSQs list structures and ask which are groups, or ask for element orders and subgroup counts. Check closure first: $(\mathbb{Z}, -)$ is closed but not associative, and $\mathbb{Z}_6 \setminus \{0\}$ under multiplication is not closed since $2 \cdot 3 = 0$. Lagrange rules out impossible orders (no subgroup of order 5 in a group of order 24). The trap is reading Lagrange backwards: a divisor of $|G|$ is a subgroup order for cyclic groups but not in general.

**Check.** In $\mathbb{Z}_{12}$ the generators are $1, 5, 7, 11$, so $\varphi(12) = 4 = 12 \cdot \tfrac12 \cdot \tfrac23$, and $\operatorname{ord}(8) = 12/\gcd(8,12) = 3$. A search over all 4096 subsets of $\mathbb{Z}_{12}$ found exactly 6 subgroups, of orders 1, 2, 3, 4, 6, 12; the subgroup $\{0, 4, 8\}$ has 4 cosets. $\varphi(15) = 15 \cdot \tfrac23 \cdot \tfrac45 = 8$. The script confirmed $\operatorname{ord}(a) = n/\gcd(a,n)$, the $\varphi(d)$ count and $\sum_{d \mid n} \varphi(d) = n$ for all $n \le 60$, the product formula for $n < 500$, the closure criterion for $n < 40$, and that none of the 6-subsets of $A_4$ is a subgroup.

## Handshake lemma and the edge counts of standard families
<!-- topics: em-discrete-mathematics.graph-basics -->

**Claim.** In any undirected graph, with a loop adding 2 to its vertex's degree, $\sum_{v \in V} \deg(v) = 2|E|$, so the number of odd-degree vertices is even. In a digraph $\sum \deg^-(v) = \sum \deg^+(v) = |E|$. The edge counts are $\binom{n}{2}$ for $K_n$, $mn$ for $K_{m,n}$, $n$ for $C_n$, $n\,2^{n-1}$ for the hypercube $Q_n$ on $2^n$ vertices, and $n - c$ for a forest with $c$ components. There are $2^{\binom{n}{2}}$ labelled simple graphs on $n$ vertices, and a bipartite simple graph on $n$ vertices has at most $\lfloor n^2/4 \rfloor$ edges.

**Proof.** Count the incidences, the pairs $(v, e)$ with $v$ an end of $e$. Grouped by vertex they number $\sum_v \deg(v)$; grouped by edge, every edge has two ends (a loop has the same end twice), so they number $2|E|$. The sum of the even degrees is even, so the sum of the odd degrees is even as well, which needs an even number of odd terms. In a digraph each arc has one tail and one head, so the out-degrees and the in-degrees each sum to $|E|$.

In $K_n$ every unordered pair of vertices is an edge: $\binom{n}{2}$. In $K_{m,n}$ each of the $m$ vertices on one side is joined to each of the $n$ on the other: $mn$. $C_n$ is 2-regular on $n$ vertices, so it has $2n/2 = n$ edges. $Q_n$ has the $n$-bit strings as vertices, joined when they differ in one bit; each string has $n$ neighbours, one per bit, so the handshake lemma gives $n\,2^n/2 = n\,2^{n-1}$. A forest is a disjoint union of $c$ trees, the $i$-th on $n_i$ vertices with $n_i - 1$ edges (proved in the trees section), so it has $\sum (n_i - 1) = n - c$ edges. A labelled simple graph is a choice of in or out for each of the $\binom{n}{2}$ pairs.

A bipartite graph with sides of sizes $a$ and $n - a$ has at most $a(n-a)$ edges, all pairs across. Since $a(n-a) = n^2/4 - (a - n/2)^2$, the maximum over integers is at $a = \lfloor n/2 \rfloor$, giving $\lfloor n/2 \rfloor \lceil n/2 \rceil = \lfloor n^2/4 \rfloor$, attained by the balanced complete bipartite graph.

**GATE use.** NAT questions give a degree sequence and ask for $|E|$, or give $|E|$ and some degrees and ask for the rest; others ask for the edges of $Q_n$ or $K_{m,n}$. The traps are accepting a degree sequence with an odd sum, and treating an equal degree sequence as proof of isomorphism when it is only a necessary condition.

**Check.** Degrees $2, 2, 3, 3, 4, 4$ sum to 18, so the graph has 9 edges. A script built $Q_n$ for $n \le 6$ and counted $n\,2^{n-1}$ edges each time ($Q_4$: 32). Enumerating every simple graph on $n \le 6$ vertices gave $2^{\binom{n}{2}}$ graphs ($32768$ for $n = 6$), and the largest bipartite one had $\lfloor n^2/4 \rfloor$ edges (9 for $n = 6$).

## Whitney's inequality and the edge range with k components
<!-- topics: em-discrete-mathematics.connectivity -->

**Claim.** For a simple graph $G$ on $n \ge 2$ vertices with vertex connectivity $\kappa$, edge connectivity $\lambda$ and minimum degree $\delta$, $\kappa(G) \le \lambda(G) \le \delta(G)$, with $\kappa(K_n) = n - 1$ by convention. A simple graph with $n$ vertices and $k$ components has

$$n - k \le |E| \le \frac{(n-k)(n-k+1)}{2},$$

the maximum attained only by $K_{n-k+1}$ plus $k - 1$ isolated vertices. Consequently a simple graph with more than $(n-1)(n-2)/2$ edges is connected, and so is one with $\delta \ge (n-1)/2$.

**Proof.** $\lambda \le \delta$: deleting the $\delta$ edges at a vertex of minimum degree isolates it, and with $n \ge 2$ that disconnects the graph. If $\lambda = 0$ the graph is already disconnected and $\kappa = 0$. For $\kappa \le \lambda$, if $G$ is complete then $\kappa = n - 1 = \delta \ge \lambda$ and $\lambda \ge \kappa$ is the statement $\lambda(K_n) = n - 1$, which holds because separating $s$ vertices from the other $n - s$ removes $s(n-s) \ge n - 1$ edges. Otherwise take a minimum edge cut $F$, $|F| = \lambda$, whose removal leaves sides $S$ and $T$; $F$ is exactly the set of edges between $S$ and $T$. If every vertex of $S$ were adjacent to every vertex of $T$, then $\lambda = |S||T| \ge |S| + |T| - 1 = n - 1 \ge \kappa$, because $(|S| - 1)(|T| - 1) \ge 0$. Otherwise choose $s \in S$ and $t \in T$ not adjacent. Build a vertex set $X$ by taking one end of each edge of $F$: the end in $T$ if the edge meets $s$, and the end in $S$ otherwise. Then $|X| \le \lambda$, $s \notin X$ because the edges at $s$ contribute their $T$-ends, and $t \notin X$ because $T$-ends are taken only for edges at $s$, and $st$ is not an edge. Any $s$–$t$ path crosses from $S$ to $T$ along some edge $uv \in F$ with $u \in S$; if $u = s$ then $v \in X$, otherwise $u \in X$. So deleting $X$ separates $s$ from $t$, and $\kappa \le |X| \le \lambda$.

Lower bound: a connected component on $n_i$ vertices contains a spanning tree, so it has at least $n_i - 1$ edges, and summing gives at least $n - k$. Upper bound: for fixed component sizes $n_1, \dots, n_k$ the edges are maximised by making each component complete, $\sum \binom{n_i}{2}$. Suppose two components have sizes $2 \le a \le b$. Moving one vertex from the smaller to the larger changes the total by

$$\Bigl[\tbinom{b+1}{2} - \tbinom{b}{2}\Bigr] - \Bigl[\tbinom{a}{2} - \tbinom{a-1}{2}\Bigr] = b - (a - 1) > 0,$$

and keeps $k$ components because the smaller one keeps $a - 1 \ge 1$ vertices. So at a maximum at most one component has more than one vertex, which forces sizes $n - k + 1, 1, \dots, 1$ and $\binom{n-k+1}{2} = (n-k)(n-k+1)/2$ edges.

A disconnected graph has $k \ge 2$, and the bound is decreasing in $k$, so it has at most $(n-2)(n-1)/2$ edges; more than that forces connectivity. If $\delta \ge (n-1)/2$ and $u, v$ are not adjacent, their neighbourhoods lie among the other $n - 2$ vertices and have total size at least $n - 1 > n - 2$, so they share a neighbour and $u, v$ are joined by a path.

**GATE use.** The 2-mark NAT "10 vertices, 3 components, at most how many edges" uses the maximum. MCQs ask for $\kappa$ and $\lambda$ of named graphs: $K_n$ has $n - 1$, $C_n$ has 2 and a tree has 1. The trap is spreading the vertices evenly across components, which minimises the edge count of the complete components rather than maximising it.

**Check.** For $n = 10$, $k = 3$ the formula gives $7 \cdot 8/2 = 28$, from sizes 8, 1, 1; sizes 7, 2, 1 give $21 + 1 = 22$ and 6, 3, 1 give $15 + 3 + 0 = 18$, and a search over every size split returned 28. Over every simple graph on 2 to 5 vertices the script computed $\kappa$, $\lambda$ and $\delta$ by deletion and found $\kappa \le \lambda \le \delta$ in all cases; over every graph on up to 6 vertices the largest edge count with $k$ components matched the formula, and every graph with more than $(n-1)(n-2)/2$ edges was connected.

## Euler circuits from degree parity, and Ore's condition for Hamilton cycles
<!-- topics: em-discrete-mathematics.euler-hamilton -->

**Claim.** A connected graph with at least one edge (loops and parallel edges allowed) has an Euler circuit, a closed trail using every edge once, exactly when every vertex has even degree. It has an open Euler trail exactly when exactly two vertices have odd degree, and the trail runs between them. For a simple graph on $n \ge 3$ vertices, if $\deg(u) + \deg(v) \ge n$ for every non-adjacent pair (Ore), in particular if $\delta \ge n/2$ (Dirac), then $G$ has a Hamilton cycle. A graph with a cut vertex has no Hamilton cycle, and $K_{m,n}$ has one exactly when $m = n \ge 2$.

**Proof.** Necessity of even degrees: each pass of an Euler circuit through a vertex enters and leaves along two distinct edges, and at the start vertex the first and last edges pair the same way, so the edges at every vertex split into pairs.

Sufficiency, by induction on $|E|$ (Hierholzer). Start at any vertex $v$ with an edge and walk along unused edges for as long as possible. Each time the walk enters a vertex $w \ne v$, it has used an odd number of $w$'s edges, so an unused one remains; hence the walk can only stop at $v$, and it closes into a trail $C$. If $C$ uses every edge, it is the circuit. Otherwise delete the edges of $C$: every degree drops by an even number and stays even. Some vertex $u$ of $C$ has an unused edge, for otherwise the vertices of $C$ would form a component with no edge to the rest, contradicting connectedness. Each component of the remaining graph that has an edge has fewer edges and even degrees, so by induction it has an Euler circuit, and each such component meets $C$ (by the same connectedness argument). Splicing each of these circuits into $C$ at a shared vertex gives an Euler circuit of $G$.

For exactly two odd vertices $x, y$, add a new vertex $z$ joined to $x$ and $y$. Every degree is now even and the graph is connected, so it has an Euler circuit; deleting $z$ and its two edges leaves an Euler trail from $x$ to $y$. Conversely, in an open trail every visit to an interior vertex pairs its edges, so only the two ends have odd degree. With no odd vertices, every Euler trail is closed, since a trail from $x$ to $y \ne x$ would make $x$ and $y$ odd.

Ore's theorem, by contradiction. Take a counterexample on $n$ vertices and add edges while it stays non-Hamiltonian; adding edges preserves Ore's condition, and $K_n$ is Hamiltonian, so we reach a graph $G$ that is not complete, not Hamiltonian, and becomes Hamiltonian when any missing edge is added. Pick non-adjacent $u, v$. A Hamilton cycle of $G + uv$ uses $uv$, so $G$ has a Hamilton path $u = w_1, w_2, \dots, w_n = v$. If for some $i$ with $2 \le i \le n$ both $u \sim w_i$ and $v \sim w_{i-1}$, then

$$w_1, w_2, \dots, w_{i-1}, w_n, w_{n-1}, \dots, w_i, w_1$$

is a Hamilton cycle of $G$. So the index sets $A = \{i : u \sim w_i\}$ and $B = \{i : v \sim w_{i-1}\}$ are disjoint subsets of $\{2, \dots, n\}$, with $|A| = \deg(u)$ and $|B| = \deg(v)$, giving $\deg(u) + \deg(v) \le n - 1$, against Ore's condition. Dirac's condition gives $\deg(u) + \deg(v) \ge n/2 + n/2 = n$ for every pair.

Removing one vertex from a Hamilton cycle leaves a Hamilton path on the other vertices, which is connected, so a Hamiltonian graph has no cut vertex. A cycle in $K_{m,n}$ alternates sides, so a Hamilton cycle uses equally many vertices from each, forcing $m = n$; for $m = n \ge 2$, $a_1 b_1 a_2 b_2 \cdots a_n b_n a_1$ is one.

The families follow from parity: $K_n$ is $(n-1)$-regular, so Eulerian exactly for odd $n$; $K_{m,n}$ has degrees $n$ and $m$, so it needs both even; $Q_n$ is $n$-regular, so it needs $n$ even.

**GATE use.** MSQs list named graphs and ask which have an Euler circuit or a Hamilton cycle. For Euler questions read only connectivity and parity. For Hamilton questions, Dirac or Ore proves existence and a cut vertex or unequal bipartition refutes it. The traps are confusing every edge once with every vertex once, and treating Dirac's condition as necessary: $C_n$ is Hamiltonian with $\delta = 2$.

**Check.** $K_7$ (6-regular) and $Q_4$ (4-regular) are Eulerian; in $K_{3,4}$ the four vertices on the larger side have degree 3, so it has neither an Euler circuit nor an Euler trail; the Petersen graph has ten vertices of degree 3. A backtracking search for Euler circuits over every graph on at most 5 vertices agreed with the parity and connectivity test in every case. Every graph on 3 to 6 vertices satisfying Ore's condition had a Hamilton cycle, and a search over all orderings found none in the Petersen graph.

## Euler's formula and the planar edge bounds
<!-- topics: em-discrete-mathematics.planarity -->

**Claim.** A connected plane graph with $V$ vertices, $E$ edges and $F$ faces, counting the unbounded outer face, satisfies $V - E + F = 2$; with $k$ components, $V - E + F = 1 + k$. A simple planar graph with $V \ge 3$ has $E \le 3V - 6$, and $E \le 2V - 4$ if it has no triangle. A connected simple planar graph that is not a tree and has girth $g$ (shortest cycle length) has $E \le g(V-2)/(g-2)$. Every simple planar graph has a vertex of degree at most 5. These bounds can prove non-planarity, never planarity.

**Proof.** Induct on $E$ for a connected plane graph. If it is a tree, then $E = V - 1$ and $F = 1$, since without a cycle no region is enclosed: $V - (V-1) + 1 = 2$. Otherwise some edge $e$ lies on a cycle. That cycle is a closed curve, so by the Jordan curve theorem the faces on the two sides of $e$ are different; deleting $e$ merges them and keeps the graph connected, so $E$ and $F$ each drop by 1 and $V - E + F$ is unchanged. The induction hypothesis gives 2. With $k$ components, add $k - 1$ edges, each joining two components across a face they share; each added edge lies on no cycle, so it splits no face, and the result is connected: $V - (E + k - 1) + F = 2$, that is $V - E + F = 1 + k$.

Edge bound. The degree of a face is the length of its boundary walk, and each edge contributes two sides to these walks (both to one face if it is a bridge), so the face degrees sum to $2E$. First let the graph be connected with $V \ge 3$. A face of degree 1 or 2 would need a loop or two parallel edges, or the whole graph being a single edge; so every face has degree at least 3 and $2E \ge 3F$. Substituting $F \le 2E/3$ into $V - E + F = 2$ gives $2 \le V - E + 2E/3$, that is $E \le 3V - 6$. A disconnected planar graph gains edges when its components are joined as above, and the bound for the connected graph covers it. With no triangle, a face of degree 3 would be bounded by a triangle, so every face has degree at least 4 (for a tree with $V \ge 3$ the single face has degree $2E \ge 4$); then $2E \ge 4F$ and $E \le 2V - 4$. With girth $g$, every face boundary of a connected graph that is not a tree contains a cycle, so $2E \ge gF$ and $2 \le V - E + 2E/g$, which rearranges to $E(g-2)/g \le V - 2$.

If every vertex had degree at least 6, the handshake lemma would give $2E \ge 6V$, so $E \ge 3V > 3V - 6$; graphs with $V \le 2$ have degrees at most 1.

$K_5$ has $10 > 3 \cdot 5 - 6 = 9$ edges, and $K_{3,3}$, bipartite and so triangle-free, has $9 > 2 \cdot 6 - 4 = 8$, so neither is planar. $K_{3,3}$ passes the general bound $9 \le 12$, which shows that passing a bound proves nothing. Kuratowski's theorem, that a graph is planar exactly when it contains no subdivision of $K_5$ or $K_{3,3}$, is quoted without proof.

**GATE use.** The 1-mark NAT "a connected planar graph has $V$ vertices and $E$ edges; how many faces?" is $F = 2 - V + E$. Others ask which named graph is planar or bound $E$. The traps are dropping the outer face, applying $3V - 6$ to a bipartite graph where $2V - 4$ is the sharper test, and reading a satisfied bound as proof of planarity.

**Check.** $V = 10$, $E = 24$ gives $F = 2 - 10 + 24 = 16$, and since $24 = 3 \cdot 10 - 6$ every face is a triangle: $3F = 48 = 2E$. Two disjoint triangles have $V = 6$, $E = 6$ and $F = 3$, and $6 - 6 + 3 = 3 = 1 + 2$. The Petersen graph has girth 5, and $15 > 5 \cdot 8/3 \approx 13.3$ proves it non-planar although it passes $15 \le 3 \cdot 10 - 6 = 24$. The script confirmed these numbers.

## Chromatic number bounds and two-colourability
<!-- topics: em-discrete-mathematics.graph-colouring -->

**Claim.** For a simple graph on $n$ vertices with clique number $\omega$, independence number $\alpha$ and maximum degree $\Delta$,

$$\omega(G) \le \chi(G) \le \Delta(G) + 1, \qquad \chi(G) \ge \frac{n}{\alpha(G)}.$$

$G$ is bipartite exactly when it is 2-colourable, exactly when it has no odd cycle. $\chi(C_n)$ is 2 for even $n$ and 3 for odd $n$, and the wheel $W_n$, a hub joined to every vertex of $C_{n-1}$, has $\chi = \chi(C_{n-1}) + 1$.

**Proof.** The vertices of a clique are pairwise adjacent, so they need distinct colours: $\chi \ge \omega$. Each colour class is an independent set, so it has at most $\alpha$ vertices, and the $\chi$ classes cover all $n$ vertices: $n \le \chi\,\alpha$. For the upper bound colour greedily: take the vertices in any order and give each the smallest colour not already used on its coloured neighbours. A vertex has at most $\Delta$ neighbours, so at most $\Delta$ colours are blocked, and one of the colours $1, \dots, \Delta + 1$ is free.

A 2-colouring is exactly a split into two sides with no edge inside a side, so bipartite and 2-colourable are the same. An odd cycle $v_1 v_2 \cdots v_k v_1$ cannot be 2-coloured: the colours must alternate, so $v_i$ gets the colour of $v_1$ exactly when $i$ is odd, and $v_k$, with $k$ odd, gets the same colour as its neighbour $v_1$. Conversely, suppose $G$ has no odd cycle. In each component fix a root $r$ and colour each vertex by the parity of its distance from $r$. Adjacent vertices have distances differing by at most 1, so an edge $uv$ inside one colour class has $d(u) = d(v) = d$. Shortest paths $r \to u$ and $r \to v$ with the edge $uv$ form a closed walk of odd length $2d + 1$. A closed walk of odd length contains an odd cycle: if it repeats a vertex, it splits there into two shorter closed walks whose lengths add to an odd number, so one of them is odd, and induction on the length finishes. That contradicts the assumption, so the colouring is proper.

$C_n$ for even $n$ alternates two colours, and for odd $n$ it is an odd cycle, so it needs 3, which suffice by giving the last vertex the third colour. In a wheel the hub is adjacent to every rim vertex, so it cannot share a colour with any of them and needs one colour more than the rim. Brooks' theorem lowers the greedy bound to $\chi \le \Delta$ for connected graphs other than complete graphs and odd cycles, and the four colour theorem gives $\chi \le 4$ for planar graphs; both are quoted without proof.

**GATE use.** MSQs and NATs ask for the chromatic number of a wheel, a cycle, a named graph or a drawn graph. Lower-bound with a clique or an odd cycle, then exhibit a colouring that meets the bound. The trap is assuming $\chi = \omega$: $C_5$ has $\omega = 2$ and $\chi = 3$.

**Check.** For $W_6$, a hub over $C_5$, an exhaustive search found no 3-colouring and a 4-colouring, so $\chi = 4$. For the Petersen graph the search gave $\chi = 3$ and $\alpha = 4$, consistent with $\chi \ge \lceil 10/4 \rceil = 3$ while $\omega = 2$. Over every graph on at most 5 vertices and a sample of those on 6, the script checked $\omega \le \chi \le \Delta + 1$, $\chi\,\alpha \ge n$ and that $\chi \le 2$ exactly for the bipartite graphs; greedy colouring of 200 random graphs never used more than $\Delta + 1$ colours.

## Vizing's theorem on edge colouring
<!-- topics: em-discrete-mathematics.graph-colouring -->

**Claim.** For a simple graph with maximum degree $\Delta$, the chromatic index satisfies $\Delta \le \chi'(G) \le \Delta + 1$. $\chi'(K_n)$ is $n - 1$ for even $n$ and $n$ for odd $n$.

**Proof.** The $\Delta$ edges at a vertex of maximum degree pairwise share that vertex, so they need distinct colours: $\chi' \ge \Delta$.

For the upper bound (the Misra–Gries form of Vizing's proof), colour the edges one at a time with the $\Delta + 1$ colours, keeping the partial colouring proper. A colour is free at a vertex when no coloured edge there has it; since a vertex has at most $\Delta$ edges, every vertex has a free colour. Let $uv_0$ be uncoloured. A fan at $u$ is a sequence of distinct neighbours $v_0, v_1, \dots, v_k$ of $u$ in which each edge $uv_i$ with $i \ge 1$ is coloured with a colour free at $v_{i-1}$. Rotating a fan up to $v_j$, meaning giving each $uv_{i-1}$ the colour of $uv_i$ for $1 \le i \le j$ and uncolouring $uv_j$, keeps the colouring proper: the colour moved onto $uv_{i-1}$ was free at $v_{i-1}$, and at $u$ the set of colours used only loses $uv_j$'s colour.

Take a maximal fan $v_0, \dots, v_k$, a colour $c$ free at $u$ and a colour $d$ free at $v_k$. If $d$ is free at $u$, rotate the whole fan and colour $uv_k$ with $d$. Otherwise some edge $ux$ has colour $d$. By maximality $x$ is already in the fan, since otherwise $x$ could be appended, and $x \ne v_0$, so $x = v_{j+1}$ for some $j < k$, and by the fan rule $d$ is free at $v_j$. Let $P$ be the maximal path from $u$ whose edges alternate $d, c, d, \dots$; it starts with $uv_{j+1}$, and $u$ is an end of it because $c$ is free at $u$. Swap $c$ and $d$ along $P$. The colouring stays proper, $d$ becomes free at $u$, and no edge $uv_i$ with $i \le j$ changes, because those colours are neither $d$ (which only $uv_{j+1}$ has at $u$) nor $c$ (free at $u$); so $v_0, \dots, v_j$ is still a fan. A vertex at which $d$ was free can lie on $P$ only as its other end. If $P$ does not end at $v_j$, then $d$ is still free at $v_j$: rotate up to $v_j$ and colour $uv_j$ with $d$. If $P$ ends at $v_j$, it does not end at $v_k$, so $d$ is still free at $v_k$; and $v_j$'s last edge on $P$ had colour $c$ and now has $d$, so $c$ is free at $v_j$ and $uv_{j+1}$, now coloured $c$, satisfies the fan rule. Then $v_0, \dots, v_k$ is a fan again: rotate it and colour $uv_k$ with $d$. Rotating does not make $d$ appear at $u$ or at the end vertex, so in every case the new edge is coloured properly. Repeating for each edge colours the graph with $\Delta + 1$ colours.

For $K_n$ with $n$ odd, a colour class is a matching with at most $(n-1)/2$ edges, so $\chi' \ge \binom{n}{2} / \tfrac{n-1}{2} = n$, and Vizing gives $\chi' \le \Delta + 1 = n$. For $n$ even, label the vertices $\infty$ and the residues mod $n - 1$, and give colour $i$ to the edge $\{\infty, i\}$ and to the edges $\{a, b\}$ with $a + b \equiv 2i \pmod{n-1}$. Since $n - 1$ is odd, 2 is invertible mod $n - 1$, so each edge $\{a,b\}$ gets exactly one colour, and colour $i$ pairs $i - t$ with $i + t$ for $t = 1, \dots, (n-2)/2$, a perfect matching together with $\{\infty, i\}$. That uses $n - 1 = \Delta$ colours.

**GATE use.** MCQs ask for the chromatic index of $K_n$, $K_{m,n}$, a cycle or the Petersen graph. The answer is $\Delta$ or $\Delta + 1$; bipartite graphs always take $\Delta$ (König's edge-colouring theorem, quoted without proof). The trap is assuming $\Delta$ for every regular graph: odd cycles and the Petersen graph need $\Delta + 1$.

**Check.** A backtracking search computed $\chi'$ for every graph on at most 5 vertices and found $\Delta \le \chi' \le \Delta + 1$ throughout, with $\chi' = \Delta$ for every bipartite one. It gave $\chi'(K_4) = 3$, $\chi'(K_5) = 5$, $\chi'(K_6) = 5$ and $\chi' = 4$ for the Petersen graph.

## Chromatic polynomials by deletion and contraction
<!-- topics: em-discrete-mathematics.graph-colouring -->

**Claim.** Let $P(G, k)$ be the number of proper colourings of the labelled vertices of $G$ with colours from a set of $k$, not all of which need be used. For an edge $e$, with $G - e$ the graph without $e$ and $G / e$ the graph with the ends of $e$ merged (parallel edges collapsed),

$$P(G, k) = P(G - e, k) - P(G / e, k).$$

For a tree $T_n$ on $n$ vertices $P(T_n, k) = k(k-1)^{n-1}$, for the complete graph $P(K_n, k) = k(k-1)\cdots(k-n+1)$, and for the cycle $P(C_n, k) = (k-1)^n + (-1)^n (k-1)$ with $n \ge 3$. $\chi(G)$ is the least positive integer $k$ with $P(G, k) > 0$.

**Proof.** Let $e = uv$. The proper colourings of $G - e$ split into those with $u, v$ coloured differently, which are exactly the proper colourings of $G$, and those with $u, v$ coloured alike, which correspond one to one with the proper colourings of $G / e$ (give the merged vertex the common colour). So $P(G - e, k) = P(G, k) + P(G / e, k)$.

Tree: root it anywhere and colour from the root outward; the root has $k$ choices and every other vertex, when reached, has exactly one coloured neighbour, its parent, so $k - 1$ choices. $K_n$: the vertices need pairwise distinct colours, so $k(k-1)\cdots(k-n+1)$. Cycle, by induction on $n$: deleting an edge of $C_n$ leaves the path $P_n$, a tree, and contracting it gives $C_{n-1}$, so

$$P(C_n, k) = k(k-1)^{n-1} - P(C_{n-1}, k).$$

For $n = 3$, $C_3 = K_3$ gives $k(k-1)(k-2) = (k-1)^3 - (k-1)$, matching the formula. If $P(C_{n-1}, k) = (k-1)^{n-1} + (-1)^{n-1}(k-1)$, then $P(C_n, k) = k(k-1)^{n-1} - (k-1)^{n-1} - (-1)^{n-1}(k-1) = (k-1)^n + (-1)^n (k-1)$. The last statement is the definition of $\chi$, read through the count.

**GATE use.** NATs ask for the number of ways to colour a small cycle, path or wheel with 3 or 4 colours. Use the cycle or tree formula, or split on whether two non-adjacent vertices share a colour. The trap is dividing by symmetries: GATE counts colourings of labelled vertices unless it says otherwise.

**Check.** $P(C_4, 3) = 2^4 + 2 = 18$ and $P(C_5, 3) = 2^5 - 2 = 30$, so $\chi(C_5) = 3$ since $P(C_5, 2) = 1 - 1 = 0$. Brute-force colouring counts matched the cycle formula for $3 \le n \le 7$, $k \le 4$, the tree formula for paths and a star, the $K_n$ formula for $n \le 6$, and deletion–contraction on 200 random graphs with up to 6 vertices.

## Hall's theorem, König's theorem and counting perfect matchings
<!-- topics: em-discrete-mathematics.matching -->

**Claim.** Let $G$ be bipartite with sides $X$ and $Y$, and $N(S)$ the set of vertices of $Y$ adjacent to some vertex of $S \subseteq X$. $G$ has a matching saturating $X$ exactly when $|N(S)| \ge |S|$ for every $S \subseteq X$ (Hall). The maximum matching size equals the minimum vertex cover size (König). Every $k$-regular bipartite graph with $k \ge 1$ has a perfect matching. In any graph a set is a vertex cover exactly when its complement is independent, so $\alpha + \beta = n$ for the independence and cover numbers. The perfect matchings number

$$\#PM(K_{2n}) = (2n-1)(2n-3)\cdots 1 = \frac{(2n)!}{2^n\, n!}, \qquad \#PM(K_{n,n}) = n!.$$

**Proof.** Necessity in Hall: the partners of the vertices of $S$ are distinct members of $N(S)$. Sufficiency by induction on $|X|$; the case $|X| = 1$ needs only $N(x) \ne \varnothing$. Case 1: every non-empty $S \subsetneq X$ has $|N(S)| \ge |S| + 1$. Match any $x \in X$ to any neighbour $y$ and delete both. A non-empty $S \subseteq X \setminus \{x\}$ loses at most $y$ from its neighbourhood, so it still has at least $|S|$ neighbours, and induction matches the rest. Case 2: some non-empty $S_0 \subsetneq X$ has $|N(S_0)| = |S_0|$. Every subset of $S_0$ has its neighbours inside $N(S_0)$, so the subgraph on $S_0 \cup N(S_0)$ satisfies Hall and induction matches $S_0$ into $N(S_0)$. In the subgraph on $(X \setminus S_0) \cup (Y \setminus N(S_0))$, a set $T \subseteq X \setminus S_0$ has

$$|N(T) \setminus N(S_0)| = |N(T \cup S_0)| - |N(S_0)| \ge |T| + |S_0| - |S_0| = |T|,$$

so induction matches $X \setminus S_0$ there too. The two matchings use disjoint vertices, and together they saturate $X$.

König: each edge of a matching needs its own cover vertex, so every matching is at most every cover. For equality, let $C$ be a minimum cover with $A = C \cap X$ and $B = C \cap Y$. In the subgraph between $A$ and $Y \setminus B$, Hall's condition holds: if some $S \subseteq A$ had fewer than $|S|$ neighbours in $Y \setminus B$, replacing $S$ by those neighbours in $C$ would still cover every edge (edges at $S$ end in $B$ or in those neighbours) and give a smaller cover. So $A$ can be matched into $Y \setminus B$, and by the same argument $B$ into $X \setminus A$. These matchings are vertex-disjoint and together have $|A| + |B| = |C|$ edges.

A $k$-regular bipartite graph has $k|X| = |E| = k|Y|$, so $|X| = |Y|$. For $S \subseteq X$, the $k|S|$ edges leaving $S$ all end in $N(S)$, and each vertex there takes at most $k$ of them, so $|N(S)| \ge |S|$, and Hall gives a matching saturating $X$, which is perfect.

$S$ covers every edge exactly when no edge has both ends outside $S$, that is when $V \setminus S$ is independent; so the minimum cover is the complement of the maximum independent set.

For $K_{2n}$, the lowest-labelled vertex has $2n - 1$ possible partners, and the remaining $2n - 2$ vertices form $K_{2n-2}$, so $M(n) = (2n-1)\,M(n-1)$ with $M(0) = 1$, the product of the odd numbers up to $2n - 1$. Multiplying by the even numbers $2 \cdot 4 \cdots 2n = 2^n n!$ gives $(2n)!$, so $M(n) = (2n)!/(2^n n!)$. A perfect matching of $K_{n,n}$ assigns each vertex of $X$ a distinct partner in $Y$, a bijection: $n!$.

**GATE use.** MCQs ask for the condition for a matching saturating one side, the size of a maximum matching or minimum cover, or a count of perfect matchings. The traps are calling a maximal matching maximum, and accepting conditions that are only necessary, such as $|Y| \ge |X|$ or minimum degree 1.

**Check.** $K_6$ has $5 \cdot 3 \cdot 1 = 15 = 720/(8 \cdot 6)$ perfect matchings and $K_{3,3}$ has 6; a recursive count confirmed both formulas for $K_2$ through $K_8$ and $K_{1,1}$ through $K_{4,4}$. On 3000 random bipartite graphs with sides of up to 5 vertices, Hall's condition held exactly when an augmenting-path matching saturated $X$, and on 500 more the minimum cover found by search equalled the maximum matching.

## Gallai's identities for matchings and covers
<!-- topics: em-discrete-mathematics.matching -->

**Claim.** For a graph $G$ on $n$ vertices let $\alpha$ be the maximum independent set, $\beta$ the minimum vertex cover, $\nu$ the maximum matching and $\rho$ the minimum edge cover (a set of edges touching every vertex). Then $\alpha + \beta = n$ for every graph, and $\nu + \rho = n$ for every graph without isolated vertices.

**Proof.** The first identity is the complement argument of the previous section. For the second, take a maximum matching $M$, with $\nu$ edges covering $2\nu$ vertices. Each of the other $n - 2\nu$ vertices has an edge (no vertex is isolated); add one such edge per vertex. The result covers every vertex with $\nu + (n - 2\nu) = n - \nu$ edges, so $\rho \le n - \nu$. Conversely, take a minimum edge cover $F$. Minimality means every edge of $F$ has an end covered by no other edge of $F$, so $F$ contains no path of three edges and no cycle: each component of $F$ is a star. A star forest with $c$ components on $n$ vertices has $n - c$ edges, so $\rho = n - c$, and taking one edge from each star gives a matching of size $c = n - \rho$. Hence $\nu \ge n - \rho$, and the two bounds give $\nu + \rho = n$.

**GATE use.** A NAT gives the maximum matching (or independent set) and asks for the minimum edge cover (or vertex cover). The trap is applying $\nu + \rho = n$ to a graph with an isolated vertex, which has no edge cover at all, or confusing the edge cover with the vertex cover.

**Check.** Three disjoint edges plus two disjoint paths on 3 vertices form a 12-vertex graph with $\nu = 5$ and $\rho = 7$, found by exhaustive search. On 300 random graphs with up to 7 vertices and no isolated vertex, exhaustive search gave $\nu + \rho = n$ every time.

## Trees: the n − 1 edge count, leaf counts and Cayley's formula
<!-- topics: em-discrete-mathematics.trees, em-discrete-mathematics.graph-basics -->

**Claim.** For a graph $T$ on $n$ vertices the following are equivalent: $T$ is a tree (connected and acyclic); $T$ is connected with $n - 1$ edges; $T$ is acyclic with $n - 1$ edges; $T$ is connected and every edge is a bridge; any two vertices are joined by exactly one path. A tree with $n \ge 2$ has at least two leaves, and if its $I$ internal vertices all have degree $k$, it has $(k-2)I + 2$ leaves. The number of labelled trees on $n$ vertices, which is also the number of spanning trees of $K_n$, is $n^{n-2}$ (Cayley). $C_n$ has $n$ spanning trees and $K_{m,n}$ has $m^{n-1} n^{m-1}$.

**Proof.** Leaves: in a tree with an edge, take a longest path. An end of it has no neighbour off the path, which would extend it, and no neighbour on it other than the next vertex, which would close a cycle; so both ends are leaves. Deleting a leaf leaves a tree on $n - 1$ vertices, so induction from the one-vertex tree gives $n - 1$ edges. If $T$ is connected with $n - 1$ edges, it contains a spanning tree with $n - 1$ edges, so the spanning tree is all of $T$ and $T$ is acyclic. If $T$ is acyclic with $n - 1$ edges, it is a forest with $c$ components and $n - c$ edges, so $c = 1$. An edge on a cycle is not a bridge, since the rest of the cycle reconnects its ends, and an edge on no cycle is a bridge; so "connected with every edge a bridge" is "connected and acyclic". Two different paths between the same vertices contain a cycle, and a cycle gives two paths between any two of its vertices, so unique paths is the same as acyclic, given connectivity.

Leaf count: with $L$ leaves and $I$ internal vertices of degree $k$, the handshake lemma and the edge count give $L + kI = 2(L + I - 1)$, so $L = (k-2)I + 2$.

Cayley by the Prüfer code. To encode a labelled tree on $\{1, \dots, n\}$, delete the smallest-labelled leaf and record its neighbour, $n - 2$ times, leaving one edge. A vertex $v$ is recorded once each time one of its neighbours is deleted while $v$ remains, which happens $\deg(v) - 1$ times if $v$ survives to the final edge and also $\deg(v) - 1$ times if $v$ is itself deleted as a leaf. So the leaves of the current tree are exactly the remaining vertices that do not occur in the rest of the code. Decoding therefore recovers the tree: at each step the deleted leaf is the smallest remaining label absent from the rest of the code, joined to the current code entry, and the last two remaining vertices are joined at the end. Every sequence in $\{1, \dots, n\}^{n-2}$ decodes: with $n - i + 1$ vertices left and $n - 1 - i$ code entries left there are at least two labels to choose from, each step joins a deleted vertex to a vertex that remains, so the $n - 1$ edges form a connected graph, a tree, whose code is the sequence. Encoding and decoding are inverse, so the trees are in bijection with the $n^{n-2}$ sequences. The spanning trees of $K_n$ are exactly the labelled trees on its vertex set.

A spanning tree of $C_n$ has $n - 1$ of its $n$ edges, and deleting any one edge leaves a path, so there are $n$. For $K_{m,n}$ the count follows from Kirchhoff's matrix-tree theorem, which states that every cofactor of the Laplacian $L = D - A$ equals the number of spanning trees; it is quoted without proof here and checked numerically below.

**GATE use.** NAT questions ask for the spanning trees of $K_n$, the edges of a forest, or the leaves of a tree whose internal vertices all have a given degree. The traps are applying $n^{n-2}$ to unlabelled trees (there are only 2 unlabelled trees on 4 vertices against 16 labelled ones) and forgetting that a forest with $c$ components has $n - c$ edges.

**Check.** A script enumerated every set of $n - 1$ edges of $K_n$ for $n \le 6$ and kept the trees: 1, 3, 16, 125 and 1296 of them, matching $n^{n-2}$, and the Prüfer codes of the trees were pairwise distinct. A Laplacian cofactor gave 1296 for $K_6$, 16 for $K_4$ and $12 = 2^2 \cdot 3$ for $K_{2,3}$, and matched $m^{n-1} n^{m-1}$ for all $m, n \le 4$ and $n$ for $C_n$, $n \le 8$. Trees built with every internal vertex of degree $k \in \{2, \dots, 5\}$ had $(k-2)I + 2$ leaves.

## Catalan numbers: the recurrence and the closed form
<!-- topics: em-discrete-mathematics.trees, em-discrete-mathematics.recurrences -->

**Claim.** Let $b_n$ be the number of binary tree shapes with $n$ nodes, each node having an ordered left and right subtree, possibly empty. Then $b_0 = 1$, $b_{n+1} = \sum_{i=0}^{n} b_i\, b_{n-i}$, and

$$b_n = C_n = \frac{1}{n+1}\binom{2n}{n} = \binom{2n}{n} - \binom{2n}{n+1}.$$

The same numbers count binary search trees on $n$ distinct keys, Dyck paths with $n$ up and $n$ down steps that never go below the start level, full parenthesisations of a product of $n + 1$ factors, and triangulations of a convex $(n+2)$-gon.

**Proof.** A tree with $n + 1$ nodes is a root with a left subtree of $i$ nodes and a right subtree of $n - i$ nodes, $0 \le i \le n$, chosen independently, which gives the recurrence. In a BST on keys $1, \dots, n$ the in-order traversal lists the keys in increasing order, so the shape determines where each key sits; BSTs and shapes are in bijection.

A Dyck path of length $2(n+1)$ first returns to level 0 after some $2(i+1)$ steps, so it reads U, then a Dyck path of length $2i$ (shifted up one level), then D, then a Dyck path of length $2(n-i)$; that is the same recurrence with the same start, so it counts the same numbers. A product of $n + 1$ factors splits at its last multiplication into a left part with $i + 1$ factors and a right part with $n - i$ factors, again the same recurrence. In an $(n+2)$-gon with vertices $0, \dots, n+1$, the side from 0 to $n + 1$ lies in exactly one triangle, with apex $j$, which leaves polygons with $j + 1$ and $n + 2 - j$ vertices on its two sides; with $i = j - 1$ these have $i + 2$ and $(n - 1 - i) + 2$ vertices, so $T_n = \sum_{i=0}^{n-1} T_i\, T_{n-1-i}$, the same recurrence.

The closed form, by reflection. Paths of $n$ U steps and $n$ D steps number $\binom{2n}{n}$. Call a path bad if it reaches level $-1$. Flip every step after its first visit to $-1$: the end moves from level 0 to level $-2$, so the image has $n - 1$ U steps and $n + 1$ D steps. Every path ending at $-2$ must pass through $-1$, and flipping after its first visit there returns a bad path, so this is a bijection, and the bad paths number $\binom{2n}{n+1}$. Since $\binom{2n}{n+1} = \frac{(2n)!}{(n+1)!\,(n-1)!} = \frac{n}{n+1}\binom{2n}{n}$, the good paths number $\binom{2n}{n}\bigl(1 - \frac{n}{n+1}\bigr) = \frac{1}{n+1}\binom{2n}{n}$.

**GATE use.** NATs ask for the number of BSTs on 3 or 4 distinct keys, the binary trees with $n$ nodes, or the ways to parenthesise a product. Labelled binary trees, where the nodes carry distinct labels, number $n!\,C_n$. The trap is the reversed binomial $\binom{n}{2n}$, which is 0 for $n \ge 1$; the correct form is $\binom{2n}{n}/(n+1)$.

**Check.** $C_3 = 20/4 = 5 = 20 - 15$ and $C_4 = 70/5 = 14$. A script confirmed the recurrence against the closed form for $n \le 14$ ($1, 1, 2, 5, 14, 42, 132, 429$ for $n \le 7$), counted Dyck paths by enumeration for $n \le 7$, and counted the distinct BST shapes produced by all insertion orders of $n \le 6$ keys; all agreed.

## Permutations, combinations, multisets and circular arrangements
<!-- topics: em-discrete-mathematics.permutations-combinations -->

**Claim.** From $n$ distinct objects, the ordered selections of $r$ number $P(n,r) = n!/(n-r)!$ and the unordered ones $\binom{n}{r} = n!/(r!\,(n-r)!)$. A multiset with $n_i$ copies of kind $i$, $n_1 + \dots + n_k = n$, has $n!/(n_1!\, n_2! \cdots n_k!)$ distinct arrangements. $n$ distinct people sit round a table in $(n-1)!$ ways when rotations are identified, and for $n \ge 3$ in $(n-1)!/2$ ways when reflections are identified too.

**Proof.** The product rule counts a sequence of choices by multiplying the number of options at each step, provided that number does not depend on earlier choices; the sum rule adds the counts of disjoint cases. An ordered selection picks the first object in $n$ ways, the second in $n - 1$, down to the $r$-th in $n - r + 1$: the product is $n!/(n-r)!$. Each $r$-subset can be ordered in $r!$ ways and each ordered selection comes from exactly one subset, so $P(n,r) = r!\binom{n}{r}$.

For the multiset, give the copies of each kind temporary distinct labels. The labelled objects have $n!$ arrangements. Erasing the labels maps $n_1!\, n_2! \cdots n_k!$ labelled arrangements onto each unlabelled one, namely those that differ only by permuting copies within kinds, so the unlabelled count is the quotient.

For seatings, the $n!$ linear orders fall into rotation classes. Rotating a seating of $n$ distinct people by $1, \dots, n - 1$ places gives $n$ distinct linear orders, since a nontrivial rotation moves the person in seat 1, so every class has exactly $n$ members: $n!/n = (n-1)!$. Equivalently, seat one person anywhere and arrange the rest relative to them. For $n \ge 3$ a seating and its mirror image are different cyclic orders, because the mirror reverses who sits clockwise of person 1, so identifying reflections pairs up the classes: $(n-1)!/2$. For $n \le 2$ the mirror is the same seating and nothing is halved.

**GATE use.** MCQs and NATs ask for arrangements of a word with repeated letters, committees, seatings and necklaces. The traps are dividing by 2 when only rotations are identified (people at a table, unlike beads on a necklace that can be flipped), and forgetting a factor for kinds with repeated copies.

**Check.** MISSISSIPPI (4 I, 4 S, 2 P, 1 M) has $11!/(4!\,4!\,2!) = 34650$ arrangements and BANANA has $6!/(3!\,2!) = 60$; a script generated the distinct permutations of both words and got these counts. Five people round a table: $4! = 24$ seatings, or 12 as necklaces; brute force over rotation and reflection classes for $n = 3, \dots, 7$ matched $(n-1)!$ and $(n-1)!/2$. $P(5,3) = 60$ and $\binom{5}{3} = 10$.

## Stars and bars, bounded variables and the binomial identities
<!-- topics: em-discrete-mathematics.permutations-combinations, em-discrete-mathematics.generating-functions -->

**Claim.** The equation $x_1 + \dots + x_k = n$ has $\binom{n+k-1}{k-1}$ solutions in non-negative integers and $\binom{n-1}{k-1}$ in positive integers. This also counts the ways to put $n$ identical balls into $k$ distinct boxes, and the monomials of $(x_1 + \dots + x_k)^n$. With an upper bound $x_i \le c$ on every variable, the count is $\sum_{j \ge 0} (-1)^j \binom{k}{j}\binom{n - j(c+1) + k - 1}{k-1}$, summed while $n - j(c+1) \ge 0$. The identities

$$\binom{n}{r} = \binom{n-1}{r-1} + \binom{n-1}{r}, \quad \sum_{r}\binom{n}{r} = 2^n, \quad \sum_{r} r\binom{n}{r} = n\,2^{n-1}, \quad \sum_{r}\binom{n}{r}^2 = \binom{2n}{n}, \quad \binom{m+n}{r} = \sum_{j}\binom{m}{j}\binom{n}{r-j}$$

hold for all $n \ge 1$ (the first for $1 \le r \le n$).

**Proof.** Encode a non-negative solution as a row of $n$ stars and $k - 1$ bars: $x_1$ stars, a bar, $x_2$ stars, a bar, and so on. Every row of $n + k - 1$ symbols with $k - 1$ bars decodes to exactly one solution, so the solutions correspond to the choices of bar positions: $\binom{n+k-1}{k-1}$. For positive solutions substitute $y_i = x_i - 1 \ge 0$, so $\sum y_i = n - k$ and the count is $\binom{n-k+k-1}{k-1} = \binom{n-1}{k-1}$. A lower bound $x_i \ge c$ is handled by the same substitution with $y_i = x_i - c$. For the upper bound let $A_i$ be the solutions with $x_i \ge c + 1$; a solution lying in $j$ specified $A_i$ becomes, after subtracting $c + 1$ from those $j$ variables, an unrestricted solution with total $n - j(c+1)$, so inclusion–exclusion gives the stated sum. A monomial of $(x_1 + \dots + x_k)^n$ is $x_1^{e_1} \cdots x_k^{e_k}$ with $\sum e_i = n$, a non-negative solution.

Pascal: the $r$-subsets of $\{1, \dots, n\}$ either contain $n$, and then they are an $(r-1)$-subset of the rest plus $n$, or they do not, and then they are an $r$-subset of the rest. Summing $\binom{n}{r}$ over $r$ counts all subsets, $2^n$. For $\sum r\binom{n}{r}$, count pairs (subset, marked element of it): choosing the subset first gives $\sum_r r\binom{n}{r}$, and choosing the marked element first ($n$ ways) and then any subset of the other $n - 1$ elements gives $n\,2^{n-1}$. Vandermonde: an $r$-subset of a set of $m$ red and $n$ blue elements has some number $j$ of red ones, chosen in $\binom{m}{j}$ ways, and $r - j$ blue ones. Taking $m = n$, $r = n$ and using $\binom{n}{n-j} = \binom{n}{j}$ gives $\sum_j \binom{n}{j}^2 = \binom{2n}{n}$.

**GATE use.** The 1-mark NAT "number of solutions of $x + y + z = 7$" in non-negative or positive integers, or with bounds. The trap is using the wrong lower limit: $\binom{n+k-1}{k-1}$ for $x_i \ge 0$ and $\binom{n-1}{k-1}$ for $x_i \ge 1$. Upper bounds need the inclusion–exclusion or the generating function of the last section.

**Check.** $x + y + z = 7$: $\binom{9}{2} = 36$ non-negative and $\binom{6}{2} = 15$ positive solutions. $a + b + c = 10$ with $0 \le a, b, c \le 4$: $\binom{12}{2} - 3\binom{7}{2} + 3\binom{2}{2} = 66 - 63 + 3 = 6$. $x_1 + x_2 + x_3 = 10$ with every $x_i \ge 2$: $\binom{6}{2} = 15$. $(a + b + c)^4$ has $\binom{6}{2} = 15$ terms. For $n = 5$ the identities give 32, 80 and 252. Brute-force enumeration confirmed every count, and the identities were checked for $n < 15$ and Vandermonde for $m, n < 8$.

## Choosing positions with no two adjacent
<!-- topics: em-discrete-mathematics.permutations-combinations -->

**Claim.** The number of ways to choose $k$ of $n$ positions in a row with no two chosen positions adjacent is $\binom{n-k+1}{k}$, and 0 when $k > n - k + 1$.

**Proof.** Write the chosen positions as $1 \le i_1 < i_2 < \dots < i_k \le n$ with $i_{j+1} \ge i_j + 2$. Set $t_j = i_j - (j - 1)$. Then $t_{j+1} - t_j = i_{j+1} - i_j - 1 \ge 1$, so $1 \le t_1 < \dots < t_k \le n - k + 1$, an arbitrary $k$-subset of $\{1, \dots, n-k+1\}$; adding back $j - 1$ inverts the map. So the choices correspond to the $k$-subsets of an $(n-k+1)$-set. Equivalently, the $n - k$ unchosen positions leave $n - k + 1$ gaps, and the chosen ones occupy $k$ distinct gaps.

**GATE use.** NATs ask for binary strings with $k$ ones and no two adjacent, or seatings that keep $k$ people apart. Place the others first and choose gaps. The trap is answering $\binom{n}{k}$, or counting only the $n - k - 1$ inner gaps and forgetting the two ends.

**Check.** 8-bit strings with three non-adjacent 1s: $\binom{6}{3} = 20$, and enumeration of all 256 strings gives 20. Enumeration matched $\binom{n-k+1}{k}$ for every $n \le 11$ and $0 \le k \le n$; summing over $k$ gives the Fibonacci count $F_{n+2}$ of the recurrences section.

## Pigeonhole: the ceiling bound and the least forcing number
<!-- topics: em-discrete-mathematics.pigeonhole, em-discrete-mathematics.graph-basics -->

**Claim.** If $n$ objects are placed in $k$ boxes, some box holds at least $\lceil n/k \rceil$ of them. The least number of objects that forces some box to hold at least $r$ is $k(r-1) + 1$. Consequences: in any simple graph on $n \ge 2$ vertices two vertices have the same degree; any 6 numbers from $\{1, \dots, 10\}$ include two that sum to 11; any $n + 1$ numbers from $\{1, \dots, 2n\}$ include two consecutive numbers, which are coprime.

**Proof.** Suppose every box held at most $\lceil n/k \rceil - 1$ objects. Since $\lceil x \rceil < x + 1$, this is less than $n/k$, so the total would be less than $k \cdot n/k = n$, a contradiction. With $N = k(r-1) + 1$ objects, $\lceil N/k \rceil = r$, so some box has $r$. With $k(r-1)$ objects, placing $r - 1$ in each box reaches no $r$, so $k(r-1) + 1$ is the least number that works.

Degrees in a simple graph on $n$ vertices lie in $\{0, \dots, n-1\}$. Degrees 0 and $n - 1$ cannot both occur, because a vertex of degree $n - 1$ is adjacent to every other vertex, including any vertex of degree 0. So the $n$ degrees take at most $n - 1$ values and two coincide. For the sum 11, the pairs $\{1,10\}, \{2,9\}, \{3,8\}, \{4,7\}, \{5,6\}$ are 5 boxes covering $\{1, \dots, 10\}$, and 6 chosen numbers put two in one box. For consecutive numbers, the boxes $\{2i-1, 2i\}$, $i = 1, \dots, n$, cover $\{1, \dots, 2n\}$, and $n + 1$ numbers put two in one box; a common divisor of $a$ and $a + 1$ divides their difference 1.

**GATE use.** MCQs ask for the least number of people, socks or cards that guarantees a repeat: identify the boxes $k$ and the target $r$ and compute $k(r-1) + 1$. The traps are answering $kr$ or $k(r-1)$, and choosing boxes that do not cover every possible object.

**Check.** At least 5 people born in one month: $12 \cdot 4 + 1 = 49$, while 48 people can be spread 4 per month. Socks in 3 colours need $3 \cdot 1 + 1 = 4$ draws for a pair. A script checked all 210 six-element subsets of $\{1, \dots, 10\}$: every one contains a pair summing to 11 and two consecutive numbers, while $\{1, 2, 3, 4, 5\}$ shows that 5 numbers do not force a sum of 11.

## Linear recurrences: characteristic roots, repeated roots and Binet's formula
<!-- topics: em-discrete-mathematics.recurrences -->

**Claim.** Let $a_n = c_1 a_{n-1} + c_2 a_{n-2}$ for $n \ge 2$ with $c_2 \ne 0$, and let $r_1, r_2$ be the roots of $x^2 - c_1 x - c_2 = 0$. If $r_1 \ne r_2$, every solution is $a_n = \alpha r_1^n + \beta r_2^n$; if there is a double root $r$, every solution is $a_n = (\alpha + \beta n) r^n$; in both cases $a_0$ and $a_1$ fix $\alpha$ and $\beta$ uniquely. For order $k$, a root of multiplicity $m$ contributes $(\beta_0 + \beta_1 n + \dots + \beta_{m-1} n^{m-1}) r^n$. For $a_n = c_1 a_{n-1} + c_2 a_{n-2} + f(n)$, the general solution is one particular solution plus the homogeneous solution; for $f(n) = C b^n$ try $A b^n$, multiplied by $n^s$ when $b$ is a root of multiplicity $s$. Fibonacci numbers with $F_0 = 0$, $F_1 = 1$ satisfy

$$F_n = \frac{\phi^n - \psi^n}{\sqrt5}, \qquad \phi = \frac{1+\sqrt5}{2}, \quad \psi = \frac{1-\sqrt5}{2}.$$

**Proof.** The recurrence is linear, so sums and scalar multiples of solutions are solutions, and a solution is determined by $(a_0, a_1)$; the map from solutions to $(a_0, a_1)$ is a linear bijection, so the solutions form a 2-dimensional space and two independent solutions span it. The sequence $r^n$ with $r \ne 0$ is a solution exactly when $r^n = c_1 r^{n-1} + c_2 r^{n-2}$, that is $r^{n-2}(r^2 - c_1 r - c_2) = 0$, so exactly when $r$ is a root; $c_2 \ne 0$ keeps 0 from being a root.

Distinct roots: matching the initial values needs $\alpha + \beta = a_0$ and $\alpha r_1 + \beta r_2 = a_1$, a linear system with determinant $r_2 - r_1 \ne 0$, so it has exactly one solution. Every solution therefore has this form.

Double root $r$: then $x^2 - c_1 x - c_2 = (x - r)^2$, so $c_1 = 2r$ and $c_2 = -r^2$. The sequence $n r^n$ is a solution:

$$c_1 (n-1) r^{n-1} + c_2 (n-2) r^{n-2} = 2(n-1) r^n - (n-2) r^n = n\, r^n.$$

The initial conditions give $\alpha = a_0$ and $(\alpha + \beta) r = a_1$, which is solvable because $r \ne 0$. The form $\alpha r^n + \beta r^n = (\alpha + \beta) r^n$ has only one free constant and cannot fit two initial values, which is why the factor $n$ is needed. The order-$k$ statement follows the same way: a root of multiplicity $m$ is also a root of the first $m - 1$ derivatives of the characteristic polynomial, which makes $n^j r^n$ a solution for $j < m$.

Non-homogeneous: the difference of two solutions solves the homogeneous recurrence, so every solution is a fixed particular solution plus a homogeneous one. Substituting $A b^n$ gives $A(b^2 - c_1 b - c_2) = C b^2$, solvable when $b$ is not a root; when $b$ is a root the bracket is 0 and the trial must be raised by $n^s$. For example, $a_n = 2a_{n-1} + 2^n$ has root 2, so try $A n 2^n$: $A n 2^n = 2A(n-1)2^{n-1} + 2^n$ gives $A = 1$, and $a_0 = 1$ gives $a_n = (n+1)2^n$. The Tower of Hanoi needs $T_n = 2T_{n-1} + 1$ moves: the largest disc moves at least once, and before its first move the other $n - 1$ discs must all sit on the third peg, and after its last move they must be moved onto it. The constant particular solution is $-1$, so $T_n = \alpha 2^n - 1$, and $T_0 = 0$ gives $2^n - 1$.

Fibonacci: $x^2 - x - 1 = 0$ has roots $\phi, \psi$. The conditions $\alpha + \beta = 0$ and $\alpha\phi + \beta\psi = 1$ give $\alpha(\phi - \psi) = 1$ with $\phi - \psi = \sqrt5$, so $\alpha = 1/\sqrt5 = -\beta$. Since $\lvert\psi\rvert < 1$, $\lvert\psi^n/\sqrt5\rvert < 1/2$ and $F_n$ is the integer nearest to $\phi^n/\sqrt5$. Binary strings of length $n$ with no two consecutive 1s satisfy $s_n = s_{n-1} + s_{n-2}$: a valid string ends in 0 after any valid string of length $n - 1$, or in 01 after any valid string of length $n - 2$. With $s_1 = 2$ and $s_2 = 3$, $s_n = F_{n+2}$.

**GATE use.** The 2-mark NAT gives a second-order recurrence and two initial values and asks for a later term or the closed form; others ask for the recurrence behind a counting problem. Form the characteristic equation, write the general solution with the right form for repeated roots, fix the constants, and check one more term by iteration. The trap is writing $\alpha r^n + \beta r^n$ for a double root.

**Check.** $a_n = 6a_{n-1} - 9a_{n-2}$ with $a_0 = 1$, $a_1 = 6$ has the double root 3, so $a_n = (n+1)3^n$ and $a_4 = 5 \cdot 81 = 405$; iteration gives $1, 6, 27, 108, 405$. $a_n = 4a_{n-1} - 4a_{n-2}$ with $a_0 = 1$, $a_1 = 4$ gives $(n+1)2^n$, and $a_n = 5a_{n-1} - 6a_{n-2}$ with $a_0 = 1$, $a_1 = 4$ gives $2 \cdot 3^n - 2^n$: $1, 4, 14, 46, 146$. $F_{10} = 55$ and $\phi^{10}/\sqrt5 \approx 55.0036$. A script iterated each recurrence and compared it with its closed form, including Binet for $n < 40$, Hanoi for $n < 12$, $(n+1)2^n = 1, 4, 12, 32, 80, \dots$ for the non-homogeneous example, and the string count against $F_{n+2}$ for $n \le 14$. For $a_n = 3a_{n-1} + 2^n$ with $a_0 = 1$, the trial $A 2^n$ gives $A = 3A/2 + 1$, so $A = -2$ and $a_n = 3^{n+1} - 2^{n+1}$: $1, 5, 19, 65, 211$ by both iteration and the closed form.

## Generating functions: the standard expansions and coefficient extraction
<!-- topics: em-discrete-mathematics.generating-functions, em-discrete-mathematics.recurrences -->

**Claim.** In the ring of formal power series, with $A(x) = \sum_{n \ge 0} a_n x^n$,

$$\frac{1}{1 - ax} = \sum_{n \ge 0} a^n x^n, \qquad \frac{1}{(1-x)^k} = \sum_{n \ge 0} \binom{n+k-1}{k-1} x^n, \qquad 1 + x + \dots + x^m = \frac{1 - x^{m+1}}{1 - x}.$$

The product $A(x)B(x)$ has coefficients $\sum_{i=0}^{n} a_i b_{n-i}$; $A(x)/(1-x)$ generates the prefix sums $a_0 + \dots + a_n$ and $xA'(x)$ generates $n a_n$. If variable $x_j$ may take the values in a set $V_j$, the number of solutions of $x_1 + \dots + x_k = n$ is the coefficient $[x^n] \prod_j \sum_{v \in V_j} x^v$. A linear recurrence with constant coefficients has a rational generating function, and its partial fractions give the closed form.

**Proof.** Formal series are added and multiplied coefficientwise, with no question of convergence. $(1 - ax)\sum_n a^n x^n = \sum_n a^n x^n - \sum_n a^{n+1} x^{n+1} = 1$, since every coefficient after the constant cancels, so $\sum a^n x^n$ is the inverse of $1 - ax$. The product $(1 + x + x^2 + \cdots)^k$ collects one term $x^{e_j}$ from each factor, so the coefficient of $x^n$ is the number of $(e_1, \dots, e_k)$ with $e_j \ge 0$ and $\sum e_j = n$, which is $\binom{n+k-1}{k-1}$ by stars and bars. $(1 - x)(1 + x + \dots + x^m) = 1 - x^{m+1}$ by telescoping. In $A(x)B(x)$ the terms $a_i x^i \cdot b_j x^j$ with $i + j = n$ are exactly those contributing to $x^n$, which gives the convolution; with $B = 1/(1-x)$, all $b_j = 1$ and the convolution is the prefix sum. Differentiating term by term gives $A'(x) = \sum n a_n x^{n-1}$, so $xA'(x) = \sum n a_n x^n$. For the counting statement, expanding the product picks one exponent $v_j \in V_j$ from each factor, contributing $x^{v_1 + \dots + v_k}$, so the coefficient of $x^n$ counts the tuples with sum $n$.

Coefficient extraction with upper bounds: for $a + b + c = 10$ with each variable in $\{0, \dots, 4\}$,

$$(1 + x + \dots + x^4)^3 = (1 - x^5)^3 (1-x)^{-3} = (1 - 3x^5 + 3x^{10} - x^{15}) \sum_{n} \binom{n+2}{2} x^n,$$

so $[x^{10}] = \binom{12}{2} - 3\binom{7}{2} + 3\binom{2}{2} = 66 - 63 + 3 = 6$. This is the inclusion–exclusion of the stars-and-bars section, done by algebra.

For a recurrence, take $a_n = 5a_{n-1} - 6a_{n-2}$ with $a_0 = 1$, $a_1 = 4$. In $(1 - 5x + 6x^2)A(x)$ the coefficient of $x^n$ for $n \ge 2$ is $a_n - 5a_{n-1} + 6a_{n-2} = 0$, so only $a_0 + (a_1 - 5a_0)x = 1 - x$ survives and

$$A(x) = \frac{1 - x}{(1 - 2x)(1 - 3x)} = \frac{-1}{1 - 2x} + \frac{2}{1 - 3x}.$$

The numerators come from setting $1 - x = P(1 - 3x) + Q(1 - 2x)$ at $x = 1/2$, which gives $1/2 = -P/2$, and at $x = 1/3$, which gives $2/3 = Q/3$. Expanding each fraction by the first series gives $a_n = 2 \cdot 3^n - 2^n$, the same answer the characteristic roots give.

**GATE use.** The 2-mark NAT asks for a coefficient of a product of finite or infinite geometric series, or for the sequence generated by a rational function. Write each finite sum as $(1 - x^{m+1})/(1 - x)$, expand the numerator by the binomial theorem and the denominator by the $1/(1-x)^k$ series, and collect the terms that reach the target power. The traps are the index shift in $\binom{n+k-1}{k-1}$ and dropping a cross term such as $3x^{10}$ from $(1 - x^5)^3$.

**Check.** Polynomial multiplication in a script gave $[x^{10}](1 + x + \dots + x^4)^3 = 6$, the same as the closed expression. The coefficients of $(1-x)^{-k}$ matched $\binom{n+k-1}{k-1}$ for $k \le 5$ and $n < 20$, and $(1 - ax) \sum a^n x^n$ reduced to 1 for $a = 2, 3, -1$. Dividing $1 - x$ by $1 - 5x + 6x^2$ as power series gave $1, 4, 14, 46, 146, 454, \dots = 2 \cdot 3^n - 2^n$. The coefficients of $1/((1-x)(1-x^2))$, the ways to pay $n$ with coins of 1 and 2, came out $\lfloor n/2 \rfloor + 1$, and multiplying by $1/(1-x)$ produced prefix sums.
