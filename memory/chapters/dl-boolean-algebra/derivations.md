# Boolean algebra and minimization: derivations

## Equality by truth table and Shannon expansion
<!-- topics: dl-boolean-algebra.operators, dl-boolean-algebra.postulates-duality -->

**Claim.** Work in the two-element algebra $\{0, 1\}$ with AND, OR and NOT. An expression in $n$ variables defines a function $\{0,1\}^n \to \{0,1\}$, and two expressions are equal as identities exactly when they agree on all $2^n$ rows of the truth table. Every function $f$ and every variable $x$ satisfy the Shannon expansion

$$f = x \cdot f\vert_{x=1} + \bar{x} \cdot f\vert_{x=0}, \qquad f = (x + f\vert_{x=0})(\bar{x} + f\vert_{x=1}),$$

where $f\vert_{x=c}$ is $f$ with $x$ fixed to the constant $c$, a function of the other $n - 1$ variables.

**Proof.** An identity $E_1 = E_2$ asserts equal values for every assignment of 0s and 1s to the variables, and the truth table lists every assignment, so agreement on all $2^n$ rows is the definition of equality and not a heuristic. For the expansion, split on the value of $x$. If $x = 1$ then $\bar{x} = 0$ and the right side is $1 \cdot f\vert_{x=1} + 0 \cdot f\vert_{x=0} = f\vert_{x=1}$, which is $f$ on that row. If $x = 0$ the right side is $0 + 1 \cdot f\vert_{x=0} = f\vert_{x=0}$. The product form is the same case split: at $x = 1$ it reads $(1 + f\vert_{x=0})(0 + f\vert_{x=1}) = 1 \cdot f\vert_{x=1}$, and at $x = 0$ it reads $(0 + f\vert_{x=0})(1 + f\vert_{x=1}) = f\vert_{x=0} \cdot 1$, using domination $1 + y = 1$. The truth-table check costs $O(2^n)$ evaluations, exact but exponential in $n$.

**GATE use.** Every "which expression equals" MCQ can be settled by evaluating each option on a few rows: one row where the options differ eliminates the wrong ones. Shannon expansion on the fifth variable is what splits a 5-variable K-map into two 4-variable halves, and it proves any identity by two cases. The trap is checking only the rows that come to mind; a single unchecked row can hide the difference.

**Check.** For $f = A + BC$, $f\vert_{A=1} = 1$ and $f\vert_{A=0} = BC$, so the expansion gives $A + \bar{A}BC$, which equals $A + BC$ on all 8 rows. The script also confirmed both forms of the expansion on 200 random 3-variable truth tables.

## Theorems from the Huntington postulates, including De Morgan
<!-- topics: dl-boolean-algebra.postulates-duality, dl-boolean-algebra.identities, dl-boolean-algebra.de-morgan-complement -->

**Claim.** From the postulates (identities $A + 0 = A$ and $A \cdot 1 = A$, commutativity, both distributive laws $A(B + C) = AB + AC$ and $A + BC = (A + B)(A + C)$, and complements $A + \bar{A} = 1$, $A\bar{A} = 0$) follow: idempotence $A + A = A$; domination $A + 1 = 1$; absorption $A + AB = A$; uniqueness of the complement; involution $\bar{\bar{A}} = A$; and De Morgan's laws

$$\overline{AB} = \bar{A} + \bar{B}, \qquad \overline{A + B} = \bar{A}\,\bar{B}.$$

Each statement also holds in dual form, with AND and OR and 0 and 1 swapped.

**Proof.** Idempotence: $A = A + 0 = A + A\bar{A} = (A + A)(A + \bar{A}) = (A + A) \cdot 1 = A + A$, using identity, complement, OR-distribution, complement and identity. Domination: $A + 1 = (A + 1)(A + \bar{A}) = A + 1 \cdot \bar{A} = A + \bar{A} = 1$, using OR-distribution to factor out $A$. Absorption: $A + AB = A \cdot 1 + AB = A(1 + B) = A \cdot 1 = A$, by AND-distribution and domination.

Uniqueness: suppose $X + Y = 1$, $XY = 0$, $X + Z = 1$ and $XZ = 0$. Then

$$Y = Y(X + Z) = YX + YZ = XZ + YZ = (X + Y)Z = Z,$$

where the third step replaces $YX = 0$ by $XZ = 0$. So a complement, if it exists, is unique. Involution: $\bar{A} + A = 1$ and $\bar{A}A = 0$ say that $A$ is a complement of $\bar{A}$, so by uniqueness $\bar{\bar{A}} = A$.

De Morgan: show that $\bar{A} + \bar{B}$ satisfies both complement equations for $AB$. First, $AB + \bar{A} + \bar{B} = (A + \bar{A} + \bar{B})(B + \bar{A} + \bar{B}) = (1 + \bar{B})(1 + \bar{A}) = 1$, by OR-distribution, complement and domination (associativity of $+$ is a theorem of the postulates too; in the two-element algebra it is immediate from the truth table). Second, $AB(\bar{A} + \bar{B}) = (A\bar{A})B + A(B\bar{B}) = 0 + 0 = 0$. By uniqueness, $\overline{AB} = \bar{A} + \bar{B}$. The OR form is the dual statement, or follows by applying the AND form to $\bar{A}, \bar{B}$ and taking complements. Induction on $n$ extends both laws to $n$ variables: $\overline{x_1 \cdots x_n} = \overline{x_1 \cdots x_{n-1}} + \bar{x}_n = \bar{x}_1 + \cdots + \bar{x}_n$.

**GATE use.** The 1-mark MCQ that asks which statement is a postulate rather than a theorem: associativity, absorption, idempotence and De Morgan are theorems. The usual De Morgan question complements a product of sums. The trap is to complement the literals and forget to swap the operators.

**Check.** The complement of $(X + Y)(Y + Z)$ is $\bar{X}\bar{Y} + \bar{Y}\bar{Z} = \bar{Y}(\bar{X} + \bar{Z})$. The tempting $(\bar{X} + \bar{Y})(\bar{Y} + \bar{Z})$ differs from it at $X = 1, Y = 0, Z = 1$, where the original is $1$ and its complement is $0$ but the tempting form gives $1$. The script verified both De Morgan laws and every identity in this section by truth table.

## Duality, the dual function and the complement of an expression
<!-- topics: dl-boolean-algebra.postulates-duality, dl-boolean-algebra.de-morgan-complement -->

**Claim.** For an expression $E$ built from variables, constants, AND, OR and NOT, let $E^d$ be $E$ with AND and OR swapped and 0 and 1 swapped, every literal unchanged. Then

$$E^d(x_1, \dots, x_n) = \overline{E(\bar{x}_1, \dots, \bar{x}_n)},$$

so $E^d$ depends only on the function of $E$, and the duality principle holds: if $E_1 = E_2$ is an identity, so is $E_1^d = E_2^d$. The complement of $E$ is obtained by swapping the operators and constants and also complementing every literal: $\bar{E}(x) = E^d(\bar{x})$.

**Proof.** Structural induction on $E$. For a variable, $x^d = x = \overline{\bar{x}}$. For a constant, $0^d = 1 = \bar{0}$, and $1^d$ likewise. For $\bar{F}$: $(\bar{F})^d = \overline{F^d}$, and by induction $\overline{F^d(x)} = \overline{\overline{F(\bar{x})}}$, which is the complement of $\bar{F}(\bar{x})$. For a sum, $(F + G)^d = F^d \cdot G^d = \overline{F(\bar{x})} \cdot \overline{G(\bar{x})} = \overline{F(\bar{x}) + G(\bar{x})}$ by De Morgan, and the product case is the dual computation. This proves the formula. If $E_1$ and $E_2$ agree on every row, then $E_1(\bar{x}) = E_2(\bar{x})$ for every $x$, and complementing gives $E_1^d(x) = E_2^d(x)$. A second proof, valid in every Boolean algebra: the dual of each postulate is a postulate, so dualising each line of a proof of $E_1 = E_2$ gives a proof of $E_1^d = E_2^d$. Finally, substituting $\bar{x}$ for $x$ in the formula gives $E^d(\bar{x}) = \overline{E(x)}$, which is the complement rule.

**GATE use.** "Find the dual of $f$" and "find the complement of $f$" are set side by side with each other's answers as distractors. Dual: swap operators and constants only. Complement: swap and also complement the literals. The self-dual questions rest on $f^d(x) = \overline{f(\bar{x})}$.

**Check.** For $f = A + BC$, the dual is $A(B + C)$ and the complement is $\bar{A}(\bar{B} + \bar{C})$; the script confirmed $\overline{f(\bar{A}, \bar{B}, \bar{C})} = A(B + C)$ on all 8 rows. For $f = A + B\bar{C} + 0$, the dual is $A(B + \bar{C}) \cdot 1$ and the complement is $\bar{A}(\bar{B} + C)$.

## Adjacency, redundant literal and consensus
<!-- topics: dl-boolean-algebra.identities, dl-boolean-algebra.algebraic-simplification -->

**Claim.** For all $A, B, C$:

$$AB + A\bar{B} = A, \qquad A + \bar{A}B = A + B, \qquad AB + \bar{A}C + BC = AB + \bar{A}C,$$

with the duals $(A + B)(A + \bar{B}) = A$, $A(\bar{A} + B) = AB$ and $(A + B)(\bar{A} + C)(B + C) = (A + B)(\bar{A} + C)$. The consensus term $BC$ of $AB$ and $\bar{A}C$ is the product of the literals left after deleting the opposed pair $A, \bar{A}$. It may be deleted only while both parent terms remain in the expression.

**Proof.** Adjacency: $AB + A\bar{B} = A(B + \bar{B}) = A \cdot 1 = A$. Redundant literal: by OR-distribution, $A + \bar{A}B = (A + \bar{A})(A + B) = A + B$; the dual is $A(\bar{A} + B) = A\bar{A} + AB = AB$. Consensus: expand the consensus term on $A$,

$$BC = BC(A + \bar{A}) = ABC + \bar{A}BC.$$

Then $AB + ABC = AB$ and $\bar{A}C + \bar{A}BC = \bar{A}C$ by absorption, so both halves of $BC$ are swallowed by the parents and $BC$ adds nothing. If a parent is missing, the argument fails at that step, and so does the identity: in $AB + BC$ with no $\bar{A}C$, the row $A = 0, B = 1, C = 1$ is covered only by $BC$. The dual consensus follows by duality.

The order that works for simplifying by hand is: merge adjacent pairs, absorb, remove redundant literals, then delete consensus terms whose parents are both present. Each step is one of the identities above, so the result is equal to the original; minimality still has to be checked with a K-map or minterm list.

**GATE use.** The 1-mark simplification MCQ. The PYQ $ABC + A\bar{B}C + AB\bar{C} + \bar{A}BC$ is the majority function $AB + BC + CA$: $ABC$ merges with each of the other three. The trap is deleting $BC$ as a consensus term when no $\bar{A}$ parent exists. In $(A + B)(\bar{A} + C) = AC + \bar{A}B + BC$, by contrast, $BC$ is a true consensus of $AC$ and $\bar{A}B$ and drops.

**Check.** The script confirmed by truth table: $A + AB + \bar{A}C + BC = A + C$; $(A + B)(\bar{A} + C) = AC + \bar{A}B$; majority equals $AB + BC + CA$; and $AB + AC + \bar{A}BC$ equals $AB + AC + BC$ but not $AB + AC$, since $\bar{A}BC$ (minterm 3) would be lost.

## Canonical SOP and POS
<!-- topics: dl-boolean-algebra.canonical-forms -->

**Claim.** Index rows by the binary number $r = (x_1 \dots x_n)_2$. The minterm $m_r$ is the product of all $n$ literals, $x_i$ where bit $i$ of $r$ is 1 and $\bar{x}_i$ where it is 0, and $M_r = \overline{m_r}$ is the maxterm. With $S = \{r : f(r) = 1\}$ and $U = \{0, \dots, 2^n - 1\}$,

$$f = \sum_{r \in S} m_r = \prod_{r \in U \setminus S} M_r, \qquad \bar{f} = \sum_{r \in U \setminus S} m_r,$$

and both representations are unique.

**Proof.** $m_r$ is 1 exactly when every literal is 1, that is, when the input equals $r$. Apply Shannon expansion to each variable in turn: after all $n$ splits, $f = \sum_{r \in U} f(r)\, m_r$, and the terms with $f(r) = 0$ vanish, which gives the SOP. Uniqueness: on row $r$ exactly one minterm is 1, so a sum of distinct minterms is 1 on exactly the rows it lists, and two different index sets give different functions. Applying the SOP to $\bar{f}$, which is 1 on $U \setminus S$, gives $\bar{f} = \sum_{U \setminus S} m_r$. Complementing and using $n$-variable De Morgan gives $f = \prod_{U \setminus S} \overline{m_r}$, and De Morgan turns $\overline{m_r}$ into the sum of the complemented literals, which is 0 only on row $r$. So $M_r$ carries $x_i$ where bit $i$ of $r$ is 0 and $\bar{x}_i$ where it is 1. Each canonical form is a two-level circuit: one level of AND (or OR) gates and one output gate.

**GATE use.** Converting between $\Sigma m$ and $\Pi M$ is a complement of the index set, never a re-derivation. The traps are writing $M_5$ with the polarity of $m_5$, and expanding a product term with a missing variable into too few minterms; each missing variable doubles the count.

**Check.** For $A, B, C$, $m_5 = A\bar{B}C$ and $M_5 = \bar{A} + B + \bar{C}$. $f = \Sigma m(0, 2, 4, 5, 7) = \Pi M(1, 3, 6)$ and $\bar{f} = \Sigma m(1, 3, 6)$. $AB + C$ expands to $\Sigma m(1, 3, 5, 6, 7)$: $C$ gives 1, 3, 5, 7 and $AB$ adds 6 (and 7 again). The script enumerated these lists.

## Counting functions: all, fixed rows, neutral, symmetric, affine, monotone
<!-- topics: dl-boolean-algebra.function-counting, dl-boolean-algebra.special-functions -->

**Claim.** Among functions of $n$ variables:

$$N = 2^{2^n}, \quad N_{k\ \text{fixed}} = 2^{2^n - k}, \quad N_{\text{neutral}} = \binom{2^n}{2^{n-1}}, \quad N_{\text{sym}} = 2^{n+1}, \quad N_{\text{affine}} = 2^{n+1}.$$

The strictly linear ones ($c_0 = 0$) number $2^n$. Monotone functions have no closed form; their counts are the Dedekind numbers $2, 3, 6, 20, 168, 7581$ for $n = 0, \dots, 5$, and they satisfy $M(n+1) = \lvert\{(g, h) : g \le h,\ g, h \text{ monotone in } n \text{ variables}\}\rvert$.

**Derivation.** A function is a choice of output on each of the $2^n$ rows, made independently, so there are $2^{2^n}$; this is a count of maps from a $2^n$-set to a 2-set. Fixing the output on $k$ rows leaves $2^n - k$ free choices. A neutral function is 1 on exactly half the rows, so it is determined by choosing which $2^{n-1}$ of the $2^n$ rows output 1. A symmetric function depends only on the weight $w = x_1 + \cdots + x_n \in \{0, \dots, n\}$, so it is a free choice of output for each of the $n + 1$ weights. An affine function $c_0 \oplus c_1x_1 \oplus \cdots \oplus c_nx_n$ is fixed by $n + 1$ bits, and distinct coefficient vectors give distinct functions because the coefficients can be read back: $c_0 = f(0, \dots, 0)$ and $c_i = f(e_i) \oplus c_0$, where $e_i$ is the row with only $x_i = 1$. The equality $N_{\text{sym}} = N_{\text{affine}}$ is a coincidence of counts, not of sets: $x_1$ is affine but not symmetric, and majority is symmetric but not affine.

For monotone functions, expand on the last variable: $f = \bar{x}\,g + x\,h$ with $g = f\vert_{x=0}$ and $h = f\vert_{x=1}$. $f$ is monotone exactly when $g$ and $h$ are monotone and $g \le h$ pointwise (raising $x$ must not drop the output), which gives the recurrence.

**GATE use.** NAT questions of the form "how many functions of 3 variables satisfy …". First decide what is free: one output per row, per weight class, or per complementary pair (self-dual). Then a fixed row lowers the exponent and a constraint on the number of 1s becomes a binomial coefficient. The classic trap is $2^n$ (rows) for $2^{2^n}$ (functions).

**Check.** Enumeration over all functions for $n = 1, \dots, 4$ gave totals $4, 16, 256, 65536$; neutral $2, 6, 70, 12870$; symmetric $4, 8, 16, 32$; affine $4, 8, 16, 32$; monotone $3, 6, 20, 168$. The pair recurrence on the 168 monotone 4-variable functions gave 7581. For $n = 3$ with $f(000) = 1$ the count is $2^7 = 128$.

## Self-dual functions
<!-- topics: dl-boolean-algebra.self-dual, dl-boolean-algebra.function-counting -->

**Claim.** $f$ is self-dual when $f = f^d$, that is, $f(\bar{x}_1, \dots, \bar{x}_n) = \overline{f(x_1, \dots, x_n)}$ for every row. For $n \ge 1$ there are $2^{2^{n-1}}$ self-dual functions (2, 4, 16, 256 for $n = 1$ to 4). Every self-dual function is neutral, and the converse fails.

**Proof.** Pair each row $r$ with its bitwise complement $\bar{r}$. For $n \ge 1$, $r \ne \bar{r}$, so the $2^n$ rows split into $2^{n-1}$ disjoint pairs. The self-dual condition says exactly that the two rows of each pair get opposite outputs: the output on one row of the pair is free and the other is forced. Choices for different pairs are independent, so the count is $2^{2^{n-1}}$. Each pair contributes exactly one 1, so a self-dual function has $2^{n-1}$ ones and is neutral. For the converse, XNOR on 2 variables has two 1s (rows 00 and 11), but those rows form one complementary pair with equal outputs, so it is neutral and not self-dual.

Majority of 3 inputs is self-dual: if $k$ inputs are 1, complementing all of them leaves $3 - k$, and $k \ge 2$ holds exactly when $3 - k \le 1$. Three-input XOR is self-dual because $\bar{x}_1 \oplus \bar{x}_2 \oplus \bar{x}_3 = x_1 \oplus x_2 \oplus x_3 \oplus 1$. Two-input XOR is not: $\bar{A} \oplus \bar{B} = A \oplus B$, which is the function itself, not its complement.

**GATE use.** "How many self-dual functions of $n$ variables": $2^{2^{n-1}}$, so 16 for $n = 3$. "Which of these is self-dual": test one complementary pair at a time, and a single pair with equal outputs rules the function out. The trap is computing the dual syntactically and then comparing it to the complement instead of to $f$.

**Check.** The enumeration found 2, 4, 16, 256 self-dual functions for $n = 1$ to 4. $AB + C$ fails on the pair 001 and 110, where both outputs are 1. $AB + \bar{A}C$ fails on the same pair (001 gives $C = 1$, 110 gives $AB = 1$). Majority and $A \oplus B \oplus C$ pass on all four pairs.

## K-map adjacency and the literal count of a group
<!-- topics: dl-boolean-algebra.kmap-layout, dl-boolean-algebra.kmap-grouping, dl-boolean-algebra.identities -->

**Claim.** Label rows and columns in Gray order $00, 01, 11, 10$. Two cells are adjacent on the map (including across the edges, so the map is a torus) exactly when their minterms differ in one variable. A set of cells is a single product term exactly when it is a subcube: $n - k$ variables fixed and $k$ free. Such a group has $2^k$ cells, appears on a 4-variable map as a rectangle (possibly wrapping), and reads as a product of

$$n - k \text{ literals}.$$

**Proof.** Consecutive codes in $00, 01, 11, 10$ differ in one bit, and so do the wrap pair $10, 00$. Within a row only the column variables change, so horizontal neighbours differ in one variable, and vertical neighbours likewise. A product term $T$ with $n - k$ literals is 1 exactly on the rows where those $n - k$ variables take the stated values, with the other $k$ free, so it covers $2^k$ cells. Conversely, a set of cells on which a single product is 1 must be such a subcube. On a 2-bit Gray axis, the subsets with one variable fixed are the cyclically consecutive pairs $\{00, 01\}, \{01, 11\}, \{11, 10\}, \{10, 00\}$, with none fixed it is the whole axis, and with both fixed it is a single position. So every subcube is a product of an axis interval of length 1, 2 or 4 on each axis: a wrapping rectangle. Merging two adjacent subcubes of size $2^{k-1}$ that differ in one fixed variable $x$ is the adjacency step $Tx + T\bar{x} = T$, which removes one literal.

The size must be a power of 2, so three cells in a row are never one group. A 5-variable map is the Shannon split $f = \bar{E}f\vert_{E=0} + Ef\vert_{E=1}$: two 4-variable maps, with cells in the same position adjacent because they differ only in $E$. Eight columns in a 3-bit Gray order would not work, because four consecutive columns such as $001, 011, 010, 110$ are not a subcube.

**GATE use.** Reading a group as a term: keep exactly the variables that do not change inside it. The four corners $m_0, m_2, m_8, m_{10}$ form one group, $\bar{B}\bar{D}$. The traps are forgetting the wrap, numbering the map in binary instead of Gray order, and circling an L-shape or three cells as one term.

**Check.** $\Sigma m(0, 2, 5, 7, 8, 10, 13, 15)$: the corners give $\bar{B}\bar{D}$ and $m_5, m_7, m_{13}, m_{15}$ give $BD$, so $f = \bar{B}\bar{D} + BD = B \odot D$; the script found these two as the only prime implicants and the only minimum cover. It also confirmed that every 4-variable cube with $k$ dashes covers $2^k$ cells.

## Prime and essential prime implicants, with don't-cares
<!-- topics: dl-boolean-algebra.prime-implicants, dl-boolean-algebra.dont-cares, dl-boolean-algebra.kmap-grouping -->

**Claim.** Let $f$ have on-set $S$ and don't-care set $D$. An implicant is a product term whose cells all lie in $S \cup D$ and which covers at least one cell of $S$. A prime implicant (PI) is an implicant that stays an implicant under no deletion of a literal. A PI is essential (EPI) when some true minterm $m \in S$ lies in no other PI. Under the cost (number of terms, then number of literals), every minimal SOP consists of PIs only and contains every EPI. Don't-cares never need covering, and a don't-care cell never makes a PI essential.

**Proof.** Take a minimal SOP and suppose a term $T$ in it is not prime. Then some term $T'$ with one literal fewer is still an implicant. $T'$ covers every cell $T$ covers, so replacing $T$ by $T'$ keeps every true minterm covered and covers no 0, with the same number of terms and one literal fewer, which contradicts minimality. So every term is a PI. Now let $P$ be an EPI and $m \in S$ the minterm that only $P$ covers. Some term of the minimal SOP must cover $m$, every term is a PI, and the only PI containing $m$ is $P$. So $P$ is in every minimal SOP. A don't-care has no output requirement, so the cover condition ranges over $S$ only, and the essential test uses only cells of $S$. A PI may still contain don't-cares, and if it is the sole PI over some true minterm it is essential.

Two consequences carry the GATE questions. The PI count includes PIs that no minimal cover uses. And when no EPI exists (a cyclic function), the choice among PIs is genuinely a search with several minimal answers.

**GATE use.** NAT: count PIs and EPIs. Count every maximal group, then test each for a true minterm that no other PI covers. Traps: counting only the PIs of your chosen cover, letting a don't-care decide essentiality, and treating a don't-care as a 1 when it does not enlarge a group.

**Check.** The script enumerated all cubes and their maximality. $\Sigma m(0, 1, 4, 5, 12, 13, 14, 15)$ has 3 PIs, $\bar{A}\bar{C}$, $AB$ and $B\bar{C}$, of which the first two are essential, and the unique minimum is $\bar{A}\bar{C} + AB$. $\Sigma m(0, 1, 2, 5, 6, 7)$ has 6 PIs, no EPI, every minterm in exactly two PIs, and exactly two minimum covers: $\bar{A}\bar{B} + AC + B\bar{C}$ and $\bar{A}\bar{C} + AB + \bar{B}C$. $\Sigma m(1, 3, 7) + d(0, 2, 5)$ minimizes to $C$. $\Sigma m(0, 4, 8, 12, 13, 15) + d(2, 10)$ has PIs $\bar{C}\bar{D}$, $AB\bar{C}$, $ABD$ and $\bar{B}\bar{D}$; the unique minimum is $\bar{C}\bar{D} + ABD$. $\Sigma m(2, 4, 6, 8, 10)$ has EPIs $\bar{A}B\bar{D}$ and $A\bar{B}\bar{D}$, and $m_2$ is finished by either $\bar{A}C\bar{D}$ or $\bar{B}C\bar{D}$.

## Minimal POS by grouping the 0s
<!-- topics: dl-boolean-algebra.pos-kmap, dl-boolean-algebra.de-morgan-complement -->

**Claim.** If $\bar{f} = T_1 + \cdots + T_k$ is a minimal SOP of $\bar{f}$, found by grouping the 0s of $f$, then $f = \overline{T_1}\,\overline{T_2} \cdots \overline{T_k}$ is a minimal POS of $f$. Each sum term $\overline{T_i}$ carries $x$ for a variable fixed at 0 in the group and $\bar{x}$ for one fixed at 1.

**Proof.** The 0-cells of $f$ are the 1-cells of $\bar{f}$, so grouping 0s is grouping the 1s of $\bar{f}$, and its minimal cover is a minimal SOP of $\bar{f}$. De Morgan gives $f = \overline{T_1 + \cdots + T_k} = \prod_i \overline{T_i}$, and De Morgan again turns $\overline{T_i}$, the complement of a product of literals, into the sum of the complemented literals. A literal $\bar{x}$ in $T_i$ comes from $x = 0$ throughout the group and becomes $x$ in the sum term, which is the polarity rule. The map $\prod_i S_i \mapsto \sum_i \overline{S_i}$ is a bijection between POS forms of $f$ and SOP forms of $\bar{f}$ that preserves the number of terms and of literals, so minimality transfers in both directions. Don't-cares of $f$ are don't-cares of $\bar{f}$ and are used the same way.

**GATE use.** "Minimal POS" MCQs, and functions with few 0s, where POS is shorter than SOP. The trap is the polarity: a group with $A = 0$ contributes the literal $A$, not $\bar{A}$.

**Check.** $f = \Sigma m(0, 2, 5, 7)$ has 0s at 1, 3, 4, 6. The script found that $\bar{f}$ has exactly two PIs, $\bar{A}C$ over $\{1, 3\}$ and $A\bar{C}$ over $\{4, 6\}$, so $f = (A + \bar{C})(\bar{A} + C) = A \odot C$, which matches the SOP $\bar{A}\bar{C} + AC$. $\Pi M(0, 2, 4, 6)$ has its 0s exactly where $C = 0$, so $\bar{f} = \bar{C}$ and $f = C$.

## Quine-McCluskey generates exactly the prime implicants
<!-- topics: dl-boolean-algebra.quine-mccluskey -->

**Claim.** Write each minterm and don't-care as a cube over $\{0, 1, -\}$. In round $j$, merge every pair of cubes that have dashes in the same positions and differ in exactly one other bit, putting a dash there, and tick both. Call a cube an implicant cube when all its cells lie in $S \cup D$. Then round $j$ produces exactly the implicant cubes with $j$ dashes, only cubes in neighbouring weight groups can merge, and the cubes never ticked are exactly the maximal implicant cubes. The prime implicants are those unticked cubes that contain at least one true minterm; an unticked cube made only of don't-cares, such as 11 in $\Sigma m(0) + d(3)$, is discarded. Generation examines $O(3^n)$ possible cubes.

**Proof.** Invariant: after round $j$, the list holds every implicant cube with $j$ dashes and nothing else. Round 0 is the list of minterms and don't-cares. If the invariant holds for $j - 1$, a merge of two implicant cubes is their union, by adjacency, and lies inside $S \cup D$, so it is an implicant cube with $j$ dashes. Conversely, any implicant cube $C$ with $j \ge 1$ dashes splits at one of its dash positions into two halves with $j - 1$ dashes that differ in exactly that bit. Both halves are implicants, so both are in the previous list and their merge produces $C$. Two cubes that differ in one fixed bit, with the same dashes, have counts of 1s differing by exactly one, so only neighbouring weight groups need comparing.

Primality: if a cube $C$ is ticked, it merged into a larger implicant cube, so it is not maximal. If $C$ is not maximal, some implicant cube $C' \supsetneq C$ exists. Choose a position that is fixed in $C$ and a dash in $C'$, and free it in $C$. The result has one more dash, lies inside $C'$, so it is an implicant cube, and it is the merge of $C$ with the neighbouring cube that differs from $C$ in that bit. That merge happens in the next round, so $C$ is ticked. Hence unticked cubes are exactly the maximal implicant cubes, and dropping those with no cell in $S$ leaves the PIs. Each position of a cube is 0, 1 or a dash, which bounds the work by $3^n$ cubes. The cover is then chosen from the PI chart, whose columns are the true minterms only.

**GATE use.** Questions that show a partly filled QM table and ask for the PIs, or which pairs combine. Traps: merging cubes whose dashes sit in different positions, comparing groups whose weights differ by 2, and putting don't-cares in the chart's columns.

**Check.** For $\Sigma m(1, 4, 6, 7, 8, 9, 10, 11, 15)$, the script ran the merging literally: round 1 gives 9 one-dash cubes and round 2 one cube, 10--. The unticked cubes are -001, 01-0, 011-, -111, 1-11 and 10--, identical to the brute-force PI list. The EPIs are -001 (sole cover of 1), 01-0 (of 4) and 10-- (of 8 and 10). They leave 7 and 15, which -111 covers alone, so $f = \bar{B}\bar{C}D + \bar{A}B\bar{D} + A\bar{B} + BCD$, the unique minimum. QM output matched the brute-force PI set on 3000 random 4-variable functions.

## Choosing a cover: Petrick's method and why greedy can fail
<!-- topics: dl-boolean-algebra.petrick-cover, dl-boolean-algebra.prime-implicants -->

**Claim.** After the EPIs and the minterms they cover are removed, attach a Boolean variable $P_i$ to each remaining PI, meaning "PI $i$ is chosen". For each uncovered minterm $m$ form the clause $\sum_{i : m \in P_i} P_i$, and let $\Phi$ be the product of the clauses. A set of PIs covers $f$ exactly when it makes $\Phi = 1$. After expanding $\Phi$ to SOP and absorbing, the products are exactly the irredundant covers, and a minimum cover is a product with the fewest PIs (then fewest literals). Picking the PI that covers the most uncovered minterms first is not exact.

**Proof.** Setting $P_i = 1$ for the chosen PIs makes the clause of $m$ true exactly when some chosen PI covers $m$, so $\Phi = 1$ exactly for covers. $\Phi$ is a monotone function of the $P_i$, since adding a PI never breaks a cover. Its SOP after absorption lists the minimal true points, the covers from which no PI can be removed: a product $P_{i_1} \cdots P_{i_t}$ is an implicant of $\Phi$ exactly when $\{i_1, \dots, i_t\}$ is a cover, and absorption deletes every product that contains another. Every minimum cover is irredundant, so it appears among the products. Finding one is set cover, which is NP-hard in general. EPI extraction and row and column dominance shrink the chart, but the cyclic core that remains needs search.

Greedy fails on the cyclic function $\Sigma m(0, 1, 2, 5, 6, 7)$. Every PI covers 2 minterms. Greedy takes $\bar{A}\bar{B}$ (covers 0, 1), and $AB$ (covers 6, 7) is tied for the most new coverage, so greedy may take it next. Minterms 2 and 5 remain, and no single PI covers both, so greedy ends with 4 PIs where 3 suffice.

**GATE use.** Mostly conceptual: the cover step of QM is exact only with Petrick's method or exhaustive search, and a cyclic chart has several minimum covers. When a K-map question offers two equally minimal answers, both are minimal; an option is wrong only if it misses a 1, covers a 0, or costs more.

**Check.** Identity: $(P_1 + P_2)(P_2 + P_3)P_3 = P_1P_3 + P_2P_3$ on all 8 assignments, so every minimum cover has two PIs and contains $P_3$. For the cyclic function, with $a = \bar{A}\bar{B}$, $b = \bar{A}\bar{C}$, $c = AB$, $d = AC$, $e = \bar{B}C$ and $f = B\bar{C}$, the script listed the irredundant covers $adf$, $bce$, $abcd$, $acef$ and $bdef$: two of size 3 and three of size 4. It also confirmed the greedy run above.

## NAND and NOR are universal; gate counts and two-level forms
<!-- topics: dl-boolean-algebra.universal-gates, dl-boolean-algebra.nand-nor-realization -->

**Claim.** Each of NAND and NOR alone builds every function. When only the uncomplemented inputs $A, B$ are available (adding the constants 0 and 1 changes nothing), the minimum 2-input NAND counts are NOT 1, AND 2, OR 3, XOR 4 and XNOR 5 (with NOR: NOT 1, OR 2, AND 3, XOR 5, XNOR 4). With $\bar{A}, \bar{B}$ also available they drop to NAND: OR 1, AND 2, XOR 3, XNOR 3, and NOR: AND 1, OR 2, XOR 3, XNOR 3. A sum of products $T_1 + \cdots + T_k$ is realized NAND-NAND as

$$T_1 + \cdots + T_k = \mathrm{NAND}\big(\mathrm{NAND}(T_1), \dots, \mathrm{NAND}(T_k)\big),$$

where $\mathrm{NAND}(T_i)$ takes the literals of $T_i$, and dually a POS is realized NOR-NOR.

**Proof.** Universality: $\mathrm{NAND}(A, A) = \overline{AA} = \bar{A}$ gives NOT, and then $AB = \overline{\mathrm{NAND}(A, B)}$ and $A + B = \overline{\bar{A}\bar{B}} = \mathrm{NAND}(\bar{A}, \bar{B})$. With AND, OR and NOT available, every function is buildable from its canonical SOP. NOR is the dual: $\mathrm{NOR}(A, A) = \bar{A}$, $A + B = \overline{\mathrm{NOR}(A, B)}$ and $AB = \mathrm{NOR}(\bar{A}, \bar{B})$. These constructions give the upper bounds 1, 2 and 3. For XOR with $T = \mathrm{NAND}(A, B)$:

$$\mathrm{NAND}(A, T) = \overline{A\,\overline{AB}} = \bar{A} + AB = \bar{A} + B, \qquad \mathrm{NAND}(B, T) = \overline{B\,\overline{AB}} = \bar{B} + AB = A + \bar{B},$$

and $\mathrm{NAND}(\bar{A} + B,\ A + \bar{B}) = \overline{(\bar{A} + B)(A + \bar{B})} = \overline{AB + \bar{A}\bar{B}} = A \oplus B$, so 4 gates. Adding an inverter gives XNOR in 5. The lower bounds come from exhaustive enumeration of every circuit of 2-input gates with fewer gates: no circuit of 3 NANDs computes XOR and none of 4 computes XNOR.

Two-level form: by De Morgan, $\overline{\overline{T_1} \cdots \overline{T_k}} = T_1 + \cdots + T_k$, and $\overline{T_i}$ is the NAND of the literals of $T_i$. So the AND-OR circuit becomes NAND-NAND gate for gate. A single-literal term $x$ needs $\bar{x}$ at the output gate, an extra inverter unless the complement is available. Complemented inputs cost one NAND each when only true inputs exist. The NOR-NOR form is the dual argument applied to a POS.

**GATE use.** NAT: minimum number of 2-input NANDs or NORs for a function. Minimize first, write the circuit, then count. Traps: the two-level count is not always minimum (XOR two-level, $\bar{A}B + A\bar{B}$ with two inverters, uses 5 NANDs but 4 suffice by sharing $T$), and forgetting the inverters a complemented literal needs.

**Check.** The exhaustive search over 2-input NAND circuits confirmed the counts 1, 2, 3, 4, 5 and the NOR counts 1, 3, 2, 5, 4 for NOT, AND, OR, XOR, XNOR. $AB + CD = \mathrm{NAND}(\mathrm{NAND}(A, B), \mathrm{NAND}(C, D))$ needs 3 NANDs and no 2-gate circuit exists. The 4-gate XOR circuit was checked on all four rows.

## Functional completeness: Post's criteria
<!-- topics: dl-boolean-algebra.functional-completeness, dl-boolean-algebra.special-functions -->

**Claim.** A set $F$ of Boolean operations (constants count as 0-ary operations, and variables are always available) is functionally complete exactly when, for each of the five classes below, $F$ contains an operation outside it:

- $P_0$, 0-preserving: $f(0, \dots, 0) = 0$;
- $P_1$, 1-preserving: $f(1, \dots, 1) = 1$;
- $\mathcal{M}$, monotone: $x \le y$ componentwise implies $f(x) \le f(y)$;
- $\mathcal{L}$, affine: $f = c_0 \oplus c_1x_1 \oplus \cdots \oplus c_nx_n$;
- $\mathcal{S}$, self-dual: $f(\bar{x}) = \overline{f(x)}$.

**Proof.** Necessity. Each class contains the projections $f(x) = x_i$ and is closed under substitution. For $P_0$: if every $g_j(0) = 0$ and $f(0) = 0$ then $f(g_1, \dots, g_k)(0) = f(0, \dots, 0) = 0$, and $P_1$ is the same argument. Monotone maps composed with monotone maps are monotone. Substituting affine forms into an affine form gives an affine form. For self-dual: $f(g(\bar{x})) = f(\overline{g(x)}) = \overline{f(g(x))}$. So if $F$ lies inside one class, everything built from $F$ does too. NAND lies in none: $\mathrm{NAND}(0, 0) = 1$, $\mathrm{NAND}(1, 1) = 0$, it drops from 1 to 0 as the inputs rise, its algebraic normal form $1 \oplus xy$ has degree 2, and the complementary rows 01 and 10 both give 1. So $F$ cannot build NAND and is incomplete.

Sufficiency. Take $f_0 \notin P_0$, $f_1 \notin P_1$, $f_s \notin \mathcal{S}$, $f_m \notin \mathcal{M}$ and $f_l \notin \mathcal{L}$, and identify all inputs of each to one variable $x$. $g(x) = f_0(x, \dots, x)$ has $g(0) = 1$, so $g$ is either NOT or the constant 1. Likewise $h(x) = f_1(x, \dots, x)$ is NOT or the constant 0.

Case 1, NOT is available. $f_s$ is not self-dual, so some row $a$ has $f_s(\bar{a}) = f_s(a)$. Put $\varphi(x) = f_s(x^{a_1}, \dots, x^{a_n})$, where $x^1 = x$ and $x^0 = \bar{x}$. Then $\varphi(1) = f_s(a)$ and $\varphi(0) = f_s(\bar{a})$ are equal, so $\varphi$ is a constant, and NOT gives the other constant. Case 2, NOT is not available. Then $g \equiv 1$ and $h \equiv 0$, so both constants are available. $f_m$ is not monotone, so some $a \le b$ has $f_m(a) = 1$ and $f_m(b) = 0$. Walk from $a$ to $b$ raising one coordinate at a time; at some step the value drops from 1 to 0, between rows $c$ and $c'$ that differ only in coordinate $i$. Fixing the other coordinates to the constants of $c$ gives $\psi(x)$ with $\psi(0) = 1$ and $\psi(1) = 0$, which is NOT.

Now 0, 1 and NOT are available. Every function has a unique algebraic normal form, a XOR of products of variables (the map from the $2^{2^n}$ multilinear polynomials over GF(2) onto functions is surjective, since $\bar{x} = x \oplus 1$ and $x + y = x \oplus y \oplus xy$, so it is a bijection). $f_l$ is not affine, so its form has a product of degree at least 2; say $x_1x_2$ appears, and write $f_l = x_1x_2\,p \oplus x_1q \oplus x_2r \oplus s$ with $p, q, r, s$ in the other variables and $p \ne 0$. Fix the other variables by constants so that $p = 1$: this leaves $u = x_1x_2 \oplus \alpha x_1 \oplus \beta x_2 \oplus \gamma$. Then

$$u(x_1 \oplus \beta,\ x_2 \oplus \alpha) = x_1x_2 \oplus \alpha x_1 \oplus \beta x_2 \oplus \alpha\beta \oplus \alpha x_1 \oplus \alpha\beta \oplus \beta x_2 \oplus \alpha\beta \oplus \gamma = x_1x_2 \oplus \alpha\beta \oplus \gamma,$$

where $x \oplus 1$ is built with NOT. One more NOT when $\alpha\beta \oplus \gamma = 1$ yields AND. AND with NOT is complete by canonical SOP and De Morgan.

**GATE use.** "Which set is functionally complete". $\{AND, OR\}$ is monotone and preserves both constants. $\{XOR, AND\}$ and $\{XOR, OR\}$ preserve 0. Implication alone preserves 1, but $\{\to, 0\}$ is complete, as is $\{XOR, AND, 1\}$, the Reed-Muller basis. The trap is to assume the constant 1 is free; it is not unless it is in the set.

**Check.** The script compared closure on 3 variables against the five-class test for all 168 sets of one or two operations that contain at least one of the 16 binary operations, the other member drawn from the binary operations or the two constants ($16 + 120 + 32$), with no disagreement. Closure sizes on 3 variables: $\{XOR, AND\}$ and $\{XOR, OR\}$ reach 128 functions, all with $f(000) = 0$; $\{AND, OR\}$ reaches 18 (the 20 monotone functions minus the two constants); $\{\to\}$ reaches 38; $\{\to, 0\}$ and $\{XOR, AND, 1\}$ reach all 256.

## XOR, XNOR, parity and threshold functions
<!-- topics: dl-boolean-algebra.xor-xnor, dl-boolean-algebra.special-functions -->

**Claim.** XOR is addition modulo 2:

$$x_1 \oplus \cdots \oplus x_n = \Big(\sum_i x_i\Big) \bmod 2, \qquad A \oplus B = A\bar{B} + \bar{A}B = (A + B)(\bar{A} + \bar{B}).$$

It is commutative and associative, $A \oplus 0 = A$, $A \oplus 1 = \bar{A}$, $A \oplus A = 0$, and AND distributes over it, $A(B \oplus C) = AB \oplus AC$, but OR does not. An XNOR chain over $n$ inputs ($n - 1$ two-input gates) equals the $n$-input XOR when $n$ is odd and its complement when $n$ is even, so $A \odot B \odot C = A \oplus B \oplus C$. Two-input XOR is not a threshold function, while majority is the threshold function $[x_1 + x_2 + x_3 \ge 2]$.

**Proof.** The truth table of $A \oplus B$ is that of $A + B \bmod 2$, so $(\{0, 1\}, \oplus, \cdot)$ is the field GF(2), and commutativity, associativity, $A \oplus A = 0$ and distributivity of $\cdot$ over $\oplus$ are field laws. The parity formula follows by induction on $n$: appending $x_{n+1}$ adds it modulo 2. The SOP form lists the two rows where the inputs differ, and the POS form is its multiplied-out equivalent, $(A + B)(\bar{A} + \bar{B}) = A\bar{B} + \bar{A}B$. OR fails to distribute at $A = 1$: $A + (B \oplus C) = 1$, but $(A + B) \oplus (A + C) = 1 \oplus 1 = 0$. For XNOR, $A \odot B = A \oplus B \oplus 1$; a chain of $n$ inputs uses $n - 1$ XNORs, so it equals the XOR of the inputs plus $(n - 1) \bmod 2$ ones, which is the parity itself for odd $n$ and its complement for even $n$. $A \oplus B$ is $B$ when $A = 0$ and $\bar{B}$ when $A = 1$, which is the controlled inverter.

Threshold: suppose $A \oplus B = [w_1A + w_2B \ge T]$. Row 00 gives $0 \lt T$; rows 10 and 01 give $w_1 \ge T$ and $w_2 \ge T$; row 11 gives $w_1 + w_2 \lt T$. But $w_1 + w_2 \ge 2T \gt T$ because $T \gt 0$, a contradiction. Majority is 1 exactly when at least two of three inputs are 1, which is $x_1 + x_2 + x_3 \ge 2$.

**GATE use.** Parity generator and checker questions (output 1 for an odd number of 1s), simplifying $A \oplus A \oplus B$ or $A \oplus \bar{A}$, and the claim that three-input XNOR equals three-input XOR. The traps are distributing OR over XOR, and assuming an $n$-input XNOR chain always complements the XOR.

**Check.** The script confirmed the parity formula for $n = 1$ to 5, the SOP and POS forms, $A(B \oplus C) = AB \oplus AC$, the OR counterexample at $A = 1$, the XNOR chain rule for $n = 2$ to 6, the majority threshold, and that no integer weights in $[-4, 4]$ with any threshold in $[-9, 9]$ realize XOR.
