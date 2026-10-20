# Functional dependencies and normalization: derivations

## Functional dependencies, instances and the soundness of Armstrong's axioms
<!-- topics: db-normalization.fd-basics, db-normalization.fd-on-instance, db-normalization.armstrong-axioms -->

**Claim.** Let $R$ be a set of attributes and $X, Y, Z, W \subseteq R$. An instance $r$ of $R$ satisfies $X \to Y$ when any two tuples that agree on $X$ also agree on $Y$:

$$X \to Y \iff \forall t_1, t_2 \in r:\; t_1[X] = t_2[X] \Rightarrow t_1[Y] = t_2[Y].$$

An FD belongs to the schema when every legal instance satisfies it. The following rules are sound, meaning every instance that satisfies the premises satisfies the conclusion:

- reflexivity: $Y \subseteq X \Rightarrow X \to Y$;
- augmentation: $X \to Y \Rightarrow XZ \to YZ$;
- transitivity: $X \to Y,\; Y \to Z \Rightarrow X \to Z$;
- union and decomposition: $X \to Y \land X \to Z \iff X \to YZ$;
- pseudo-transitivity: $X \to Y,\; WY \to Z \Rightarrow WX \to Z$;
- left widening: $X \to Y \Rightarrow XZ \to Y$.

The rule $X \to Y \Rightarrow X \to YZ$ is not sound, and neither is splitting a left side: $XY \to Z$ does not give $X \to Z$. An FD is trivial exactly when $Y \subseteq X$.

**Proof.** The first three are checked tuple by tuple on an arbitrary instance $r$. Reflexivity: if $t_1[X] = t_2[X]$ then the tuples agree on every attribute of $X$, in particular on those of $Y \subseteq X$. Augmentation: if $t_1[XZ] = t_2[XZ]$ then $t_1[X] = t_2[X]$, so $t_1[Y] = t_2[Y]$ by the premise, and the tuples already agree on $Z$; together they agree on $YZ$. Transitivity: agreement on $X$ gives agreement on $Y$ by the first premise and then on $Z$ by the second.

The other rules follow from these three. Union: augment $X \to Y$ by $X$ to get $X \to XY$, augment $X \to Z$ by $Y$ to get $XY \to YZ$, and chain them by transitivity. Decomposition: $YZ \to Y$ by reflexivity, then transitivity from $X \to YZ$. Pseudo-transitivity: augment $X \to Y$ by $W$ to get $WX \to WY$, then chain with $WY \to Z$. Left widening: augmentation gives $XZ \to YZ$ and decomposition gives $XZ \to Y$.

For the unsound rules a two-tuple instance is enough. Take $R = \{X, Y, Z\}$ as three single attributes and the tuples $(0, 0, 0)$ and $(0, 0, 1)$. They agree on $X$ and on $Y$, so $X \to Y$ holds, but they differ on $Z$, so $X \to YZ$ fails. For the left-side split take tuples $(0, 0, 0)$ and $(0, 1, 1)$ on attributes $X, Y, Z$: $XY \to Z$ holds vacuously because no two tuples agree on $XY$, but $X \to Z$ fails. Triviality: if $Y \subseteq X$ the FD holds in every instance by reflexivity; if some $A \in Y - X$, a two-tuple instance agreeing on $X$ and differing on $A$ violates it.

An instance is one example, and the schema rule quantifies over all legal instances. So a pair of tuples that agree on $X$ and differ on $Y$ refutes $X \to Y$ for the schema, while an instance in which the FD holds proves nothing beyond those rows. If no two rows of an instance agree on $X$, every FD with left side $X$ holds on it vacuously.

**GATE use.** The 1-mark MSQ shows a table and asks which FDs it satisfies: group the rows by the left side and look for a group with two right-side values. The trap is reading "this instance satisfies $X \to Y$" as "the schema has $X \to Y$", or missing that an FD whose left-side values are all distinct holds vacuously. The axiom MCQ asks which FD cannot be inferred from $X \to Y$: the answer is the one that widens only the right side.

**Check.** On the rows $(1, p, x)$, $(1, p, y)$, $(2, q, x)$, $(3, q, x)$ of $r(A, B, C)$: $A \to B$ holds (both rows with $A = 1$ have $B = p$), $C \to B$ fails ($x$ appears with $p$ and $q$), $AC \to B$ holds vacuously (the four $AC$ pairs are distinct), and $B \to C$ fails ($p$ appears with $x$ and $y$). The two counterexample instances above were checked by script.

## Attribute closure decides implication, and the axioms are complete
<!-- topics: db-normalization.attribute-closure, db-normalization.armstrong-axioms -->

**Claim.** For an FD set $F$ over $R$ and $X \subseteq R$, let $X^{+}$ be the result of this loop: start with $X$, and while some $V \to W \in F$ has $V \subseteq$ result and $W \not\subseteq$ result, add $W$. Then

$$F \models X \to Y \iff Y \subseteq X^{+},$$

where $F \models X \to Y$ means every instance satisfying $F$ satisfies $X \to Y$. Every FD implied by $F$ is derivable from $F$ by Armstrong's axioms (completeness). The loop does at most $\lvert F \rvert$ productive passes of cost $O(\lvert F \rvert \cdot \lvert R \rvert)$ each, so it runs in $O(\lvert F \rvert^{2} \lvert R \rvert)$ time. Closure is monotone and idempotent: $X \subseteq X'$ gives $X^{+} \subseteq X'^{+}$, and $(X^{+})^{+} = X^{+}$.

**Proof.** Soundness of the loop, by induction on the additions: initially $X \to X$ holds by reflexivity. If the axioms derive $X \to S$ for the current result $S$ and $V \to W \in F$ fires with $V \subseteq S$, then $X \to V$ by decomposition, $X \to W$ by transitivity, and $X \to SW$ by union. So $X \to X^{+}$ is derivable, and $Y \subseteq X^{+}$ gives $X \to Y$ by decomposition. Since the axioms are sound, $F \models X \to Y$.

Converse and completeness. Suppose $Y \not\subseteq X^{+}$. Build the two-tuple instance $r = \{t_1, t_2\}$ with $t_1$ all zeros and $t_2$ zero on $X^{+}$ and one elsewhere. It satisfies every $V \to W \in F$: if $V \not\subseteq X^{+}$, the tuples differ on $V$ and the FD holds vacuously; if $V \subseteq X^{+}$, then $W \subseteq X^{+}$, because otherwise the loop would not have stopped, so the tuples agree on $W$. The tuples agree on $X \subseteq X^{+}$ and differ on an attribute of $Y - X^{+}$, so $X \to Y$ fails in an instance of $F$, and $F \not\models X \to Y$. Combining the two directions: implied means $Y \subseteq X^{+}$, which means derivable. This is the argument in Ullman and in Korth.

Cost: a pass that adds nothing ends the loop, and each productive pass fires at least one FD for the first time (an FD that has already fired adds nothing new), so there are at most $\lvert F \rvert$ productive passes; one pass tests each FD's left side against the result in $O(\lvert R \rvert)$. Monotonicity: any FD that fires from $X$ also fires from $X'$, by induction on the firing order. Idempotence: $X^{+}$ is a fixpoint of the loop.

**GATE use.** The 1-mark closure MCQ or NAT, and every key, normal-form and preservation question, reduce to this loop. The trap is one pass: an FD skipped early fires once a later FD supplies its missing attribute, so passes repeat until one adds nothing. Implication questions never need $F^{+}$; one closure of the left side settles them.

**Check.** With $F = \{AB \to CD,\ AF \to D,\ DE \to F,\ C \to G,\ F \to E,\ G \to A\}$, $(CF)^{+}$ adds $G$, then $A$, then $E$, then $D$ via $AF \to D$: $\{A, C, D, E, F, G\}$, 6 attributes, not a superkey since $B$ is missing. With $F = \{CD \to E,\ A \to C,\ B \to D\}$ a single pass from $AB$ reaches only $\{A, B, C, D\}$, because $CD \to E$ was tested first; the second pass adds $E$. Both were run by script.

## The size of F⁺ and equivalence of FD sets
<!-- topics: db-normalization.fd-set-closure -->

**Claim.** $F^{+}$ is the set of all FDs $X \to Y$ with $X, Y \subseteq R$ implied by $F$. Then

$$\lvert F^{+} \rvert = \sum_{X \subseteq R} 2^{\lvert X^{+} \rvert},$$

counting trivial FDs and empty sides. With both sides required to be non-empty the count is $\sum_{\emptyset \ne X \subseteq R} \left(2^{\lvert X^{+} \rvert} - 1\right)$. Two FD sets $F$ and $G$ over $R$ are equivalent, $F^{+} = G^{+}$, exactly when

$$F \subseteq G^{+} \quad\text{and}\quad G \subseteq F^{+}.$$

**Proof.** By the previous section, for fixed $X$ the FD $X \to Y$ is in $F^{+}$ exactly when $Y \subseteq X^{+}$. The map from these FDs to the subsets of $X^{+}$ is a bijection, so the fixed-$X$ count is $2^{\lvert X^{+} \rvert}$, and the left sides are disjoint cases, so the counts add. Excluding $Y = \emptyset$ removes one subset per $X$, and excluding $X = \emptyset$ removes one term. The count is finite because $R$ is finite; at most $2^{\lvert R \rvert} \cdot 2^{\lvert R \rvert}$ FDs exist over $R$.

Equivalence. If $F^{+} = G^{+}$ then $F \subseteq F^{+} = G^{+}$ and likewise for $G$. Conversely, suppose $F \subseteq G^{+}$. Every FD of $F^{+}$ is derived from FDs of $F$ by sound rules; each of those is implied by $G$, so the derived FD is implied by $G$, giving $F^{+} \subseteq (G^{+})^{+} = G^{+}$. Symmetrically $G^{+} \subseteq F^{+}$. In practice each FD $V \to W$ of $F$ is tested by checking $W \subseteq V^{+}_{G}$, the closure under $G$, and vice versa.

**GATE use.** NAT questions count the FDs in $F^{+}$, and MCQs ask whether two FD sets are equivalent or which set covers another. The traps are calling $F^{+}$ infinite, mixing up whether empty sides and trivial FDs are counted, and testing equivalence in one direction only.

**Check.** $F = \{A \to B,\ B \to C,\ A \to C\}$ over $R(A, B, C)$: $A^{+} = AB^{+} = AC^{+} = ABC^{+} = R$, $B^{+} = BC^{+} = \{B, C\}$, $C^{+} = \{C\}$. Non-empty sides give $7 + 3 + 1 + 7 + 7 + 3 + 7 = 35$; allowing empty sides adds $\emptyset^{+} = \emptyset$ and one more subset per $X$, giving $1 + 8 + 4 + 2 + 8 + 8 + 4 + 8 = 43$. A script enumerated all $7 \times 7$ pairs of non-empty sets and found exactly 35 implied FDs.

## Candidate keys: the tests and the search
<!-- topics: db-normalization.candidate-keys -->

**Claim.** $X$ is a superkey of $R$ under $F$ exactly when $X^{+} = R$. A superkey $K$ is a candidate key exactly when $(K - \{b\})^{+} \neq R$ for every $b \in K$; checking these $\lvert K \rvert$ subsets suffices. Call an attribute left-only when it appears on no right side (of a non-trivial part of an FD), and right-only when it appears on some right side and on no left side. Every candidate key contains every left-only attribute and no right-only attribute. The prime attributes are those in at least one candidate key. Since the number of keys can be exponential in $\lvert R \rvert$, no enumeration of all keys is polynomial in general; the search below costs $O(2^{b})$ closures, where $b$ is the number of attributes on both sides.

**Proof.** Superkey: $X$ determines every attribute exactly when $R \subseteq X^{+}$. Minimality: if some proper subset $K' \subsetneq K$ had $K'^{+} = R$, pick $b \in K - K'$; then $K' \subseteq K - \{b\}$, and monotonicity gives $(K - \{b\})^{+} \supseteq K'^{+} = R$. So if every one-attribute removal fails, every proper subset fails.

Left-only attribute $A$: the closure loop adds an attribute only by firing an FD with that attribute on its right side, so from a set not containing $A$ the loop never adds $A$. Every superkey therefore contains $A$.

Right-only attribute $A$ in a superkey $K$: no FD has $A$ on its left, so every FD fired in computing $K^{+}$ also fires from $K - \{A\}$, in the same order, and $(K - \{A\})^{+} \supseteq R - \{A\}$. Some FD $V \to W$ has $A \in W$ and $A \notin V$; its left side lies in $R - \{A\}$, so it fires and adds $A$. Hence $(K - \{A\})^{+} = R$ and $K$ was not minimal.

The search: let $M$ be the set of left-only attributes. If $M^{+} = R$, then $M$ is a superkey contained in every key, so it is the unique key. Otherwise add both-side attributes to $M$ in subsets of increasing size, testing each closure and skipping supersets of keys already found. Increasing size guarantees that a set reached with closure $R$ has no proper subset that is a key, so it is minimal. The candidate keys form an antichain: no key contains another, because the larger would not be minimal.

**GATE use.** The 2-mark "find all candidate keys" MCQ and "how many candidate keys" NAT. The traps are stopping at the first key when FDs form a cycle such as $D \to E$, $E \to A$ feeding back into a key, and declaring a superkey a key without the removal test.

**Check.** $R(A, B, C, D, E, H)$ with $A \to BC$, $E \to HA$, $BC \to D$, $D \to E$: $H$ is right-only, there are no left-only attributes, and the keys are $A$, $D$, $E$ and $BC$, with $(BH)^{+} = \{B, H\}$ and $(CH)^{+} = \{C, H\}$. $R(A, B, C, D, E)$ with $AB \to CD$, $D \to E$, $E \to A$: $B$ is left-only and $C$ right-only, and the keys are $AB$, $BD$ and $BE$. A script enumerated all subsets of each schema and confirmed both lists, and on 3,000 random FD sets it found no key that missed a left-only attribute or held a right-only one.

## Counting superkeys and bounding the number of candidate keys
<!-- topics: db-normalization.superkey-count -->

**Claim.** Let $R$ have $n$ attributes and candidate keys $K_1, \dots, K_m$. The number of superkeys is

$$S = \sum_{\emptyset \ne J \subseteq \{1, \dots, m\}} (-1)^{\lvert J \rvert + 1}\, 2^{\,n - \lvert \bigcup_{j \in J} K_j \rvert},$$

which for one key is $2^{n - k}$ with $k = \lvert K_1 \rvert$, and for two keys is $2^{n - \lvert K_1 \rvert} + 2^{n - \lvert K_2 \rvert} - 2^{n - \lvert K_1 \cup K_2 \rvert}$. The number of candidate keys is at most $\binom{n}{\lfloor n/2 \rfloor}$, and that bound is attained.

**Proof.** A set $X$ is a superkey exactly when it contains some candidate key: if $X^{+} = R$, removing attributes one at a time while the closure stays $R$ ends at a minimal superkey inside $X$; conversely a superset of a key has closure $R$ by monotonicity. Let $A_j$ be the family of supersets of $K_j$. A superset of $K_j$ is $K_j$ together with any subset of the other $n - \lvert K_j \rvert$ attributes, so $\lvert A_j \rvert = 2^{n - \lvert K_j \rvert}$. A set contains every $K_j$ for $j \in J$ exactly when it contains their union, so $\lvert \bigcap_{j \in J} A_j \rvert = 2^{n - \lvert \bigcup_J K_j \rvert}$. Inclusion–exclusion on $\lvert A_1 \cup \dots \cup A_m \rvert$ gives the formula, and $m = 1, 2$ are its first cases.

Bound: candidate keys form an antichain in the subset lattice of $R$ (previous section), and Sperner's theorem bounds an antichain of subsets of an $n$-set by $\binom{n}{\lfloor n/2 \rfloor}$. To attain it, take every $\lfloor n/2 \rfloor$-subset $P$ and the FD $P \to R - P$. A set of size at least $\lfloor n/2 \rfloor$ contains such a $P$ and is a superkey, while a smaller set contains no left side, so its closure is itself. The keys are exactly the $\lfloor n/2 \rfloor$-subsets.

**GATE use.** The 2-mark NAT "how many superkeys" first needs every candidate key, then inclusion–exclusion. The trap is adding the per-key counts, which counts a set containing two keys twice. With three or more keys, the unions of pairs and triples must all be computed, and keys that overlap shrink those unions.

**Check.** $R(A, B, C, D, E, F)$ with $A \to BCDEF$ and $BC \to A$ has keys $A$ and $BC$: $32 + 16 - 8 = 40$ superkeys. $R(A, B, C, D, E, H)$ with keys $A$, $D$, $E$, $BC$: $(32 + 32 + 32 + 16) - (16 + 16 + 16 + 8 + 8 + 8) + (8 + 4 + 4 + 4) - 2 = 58$. For 4 attributes the bound is $\binom{4}{2} = 6$, and the six FDs $P \to R - P$ over the pairs give exactly 6 keys. A script counted superkeys by brute force on these schemas and on 3,000 random FD sets and matched inclusion–exclusion every time.

## The normal-form hierarchy and the anomalies it removes
<!-- topics: db-normalization.anomalies, db-normalization.first-nf, db-normalization.second-nf, db-normalization.third-nf, db-normalization.bcnf -->

**Claim.** Fix $R$, its FDs $F$, and its candidate keys. Then:

- 1NF: every attribute value is atomic (no sets, lists or repeating groups).
- 2NF: 1NF, and no non-prime attribute $A$ satisfies $K' \to A$ for a proper subset $K'$ of a candidate key (a partial dependency).
- 3NF: for every non-trivial $X \to A$ in $F^{+}$ with $A$ a single attribute, $X$ is a superkey or $A$ is prime.
- BCNF: for every non-trivial $X \to A$ in $F^{+}$, $X$ is a superkey.

$$\text{BCNF} \Rightarrow \text{3NF} \Rightarrow \text{2NF} \Rightarrow \text{1NF},$$

and each implication is strict. Every two-attribute relation is in BCNF, provided no FD in $F$ has an empty left side. A non-trivial FD whose left side is not a superkey forces redundancy: the right-side value is stored once per tuple carrying the left-side value, which is the source of update, insertion and deletion anomalies.

**Proof.** BCNF to 3NF: the BCNF condition is the 3NF condition with the "or $A$ is prime" escape removed, so it is at least as strong. 3NF to 2NF: suppose a partial dependency $K' \to A$ with $K' \subsetneq K$ and $A$ non-prime. $K'$ is not a superkey, because a proper subset of a candidate key is not (minimality). $A$ is not in $K'$, since $A$ is non-prime and $K'$ lies in a key, so the FD is non-trivial. It therefore violates 3NF.

Strictness. $R(A, B, C, D)$ with $AB \to C$, $B \to D$ has the single key $AB$, and $B \to D$ is a partial dependency: 1NF, not 2NF. $R(A, B, C)$ with $A \to B$, $B \to C$ has key $A$; no proper subset of $A$ exists, so 2NF holds, but $B \to C$ has a non-superkey left side and a non-prime right side: 2NF, not 3NF. $R(A, B, C)$ with $AB \to C$, $C \to B$ has keys $AB$ and $AC$, so every attribute is prime and 3NF holds, while $C^{+} = \{B, C\}$ breaks BCNF.

Two attributes: with no empty left side in $F$, $\emptyset^{+} = \emptyset$, so every non-trivial FD in $F^{+}$ is $A \to B$, $B \to A$ or one with a two-attribute left side. Each makes its left side's closure the whole relation, so its left side is a superkey. An FD $\emptyset \to A$ breaks this: $\emptyset^{+} = \{A\} \ne R$, so $R(A, B)$ with $\emptyset \to A$ is not in BCNF.

Anomalies. Take Enrol(Roll, Course, Name) with key (Roll, Course) and Roll $\to$ Name. A student in five courses has the name stored five times, so a rename that misses one row leaves two names (update anomaly); a student with no course cannot be recorded, since the key would be null (insertion anomaly); dropping the last course deletes the name (deletion anomaly). In general, if $X \to A$ holds with $X$ not a superkey, a legal instance can have two distinct tuples sharing their $X$ value, and both must repeat the same $A$ value. When $X$ is a superkey, two tuples sharing $X$ are the same tuple, so nothing repeats. BCNF removes this redundancy for FDs; 3NF keeps it for prime right sides.

**GATE use.** MSQs on normal-form facts: two-attribute relations are BCNF, BCNF implies 3NF, and "every attribute prime" gives 3NF but not BCNF. The trap is the last one; $R(\text{City}, \text{Pincode}, \text{Street})$ with Pincode $\to$ City and City Street $\to$ Pincode has every attribute prime and is not in BCNF.

**Check.** A script computed the highest normal form over $F^{+}$ for the three strictness examples and got 1NF, 2NF and 3NF respectively, and confirmed that the Pincode schema has keys {City, Street} and {Pincode, Street}, every attribute prime, and the BCNF violation Pincode $\to$ City.

## Deciding the highest normal form: given FDs suffice for BCNF and 3NF, not for 2NF
<!-- topics: db-normalization.highest-nf, db-normalization.bcnf, db-normalization.third-nf, db-normalization.second-nf -->

**Claim.** Let $F$ have single-attribute right sides. Then $R$ is in BCNF exactly when every non-trivial FD of $F$ has a superkey left side, and $R$ is in 3NF exactly when every non-trivial $X \to A$ of $F$ has $X$ a superkey or $A$ prime. 2NF cannot be decided from $F$ in this way. The exact 2NF test is: for every candidate key $K$ and every $b \in K$, the closure $(K - \{b\})^{+}$ contains no non-prime attribute outside $K - \{b\}$. The BCNF test therefore costs one closure per FD, which is polynomial, while 3NF and 2NF need the prime attributes, and deciding whether an attribute is prime is NP-complete (Lucchesi and Osborn), so testing 3NF is NP-complete (Jou and Fischer).

**Proof.** Take any non-trivial $X \to A$ in $F^{+}$ with $A \notin X$ and $X$ not a superkey. Since $A \in X^{+}$, the closure loop from $X$ adds $A$ at some step, by firing some $Z \to A \in F$ with $Z \subseteq X^{+}$, and $A \notin Z$ because $A$ was not yet in the result. If $Z$ were a superkey, then $X^{+} \supseteq Z^{+} = R$ by monotonicity and idempotence, so $X$ would be a superkey, a contradiction. So $Z \to A$ is a non-trivial FD of $F$ with a non-superkey left side. If $F$ passes the BCNF test, no such FD exists, so no violation exists in $F^{+}$. If $F$ passes the 3NF test, $Z \to A$ must have $A$ prime, and then $X \to A$ satisfies 3NF too. The converse directions hold because $F \subseteq F^{+}$.

For 2NF the same argument fails because the witness $Z$ need not lie inside a key. $R(A, B, C, D)$ with $F = \{B \to C,\ C \to B,\ BC \to D\}$ has $A$ left-only, $A^{+} = \{A\}$, and keys $AB$ and $AC$; the prime attributes are $A, B, C$. The only FD with a non-prime right side is $BC \to D$, and $BC$ is neither a superkey nor inside a key, so a check on $F$ calls it a transitive dependency and passes 2NF. But $B^{+} = \{B, C, D\}$, so $B \to D$ is in $F^{+}$ with $B \subsetneq AB$: a partial dependency, and $R$ is only in 1NF. Left-reducing $F$ changes $BC \to D$ to $B \to D$ here, but not in every case: a script found left-reduced FD sets where the per-FD check still misses a partial dependency.

The exact test: a partial dependency $K' \to A$ with $K' \subsetneq K$ and $A$ non-prime means $A \in K'^{+}$. Pick $b \in K - K'$; then $K' \subseteq K - \{b\}$ and $A \in (K - \{b\})^{+}$ by monotonicity, and $A \notin K - \{b\}$ because $A$ is non-prime. So checking the maximal proper subsets $K - \{b\}$ finds every violation.

The classification of a single FD $X \to A$ from $F^{+}$ follows: $X$ superkey, no violation; $A$ prime, BCNF fails but 3NF holds; $A$ non-prime and $X$ inside some key, 2NF fails; otherwise 3NF fails. The highest normal form is the weakest verdict over all FDs.

**GATE use.** The 2-mark "highest normal form" MCQ: find all keys, list the prime attributes, split right sides, and classify each FD. For BCNF and 3NF the given FDs are enough. Before answering "2NF", close each $K - \{b\}$ and look for a non-prime attribute. The usual trap is calling an FD with a partial-key left side a 2NF violation when its right side is prime.

**Check.** $R(A, B, C, D)$ with $AB \to CD$ and $D \to A$: keys $AB$ and $BD$, $D \to A$ has a prime right side, so the answer is 3NF. For the counterexample, a script found $A^{+} = \{A\}$, $B^{+} = C^{+} = \{B, C, D\}$ and the 1NF verdict. On 16,355 random FD sets the per-FD check agreed with the $F^{+}$ check on every BCNF and 3NF verdict, missed 41 partial dependencies, and the $K - \{b\}$ test missed none.

## Lossless join: the two-way test and the chase
<!-- topics: db-normalization.lossless-join -->

**Claim.** A decomposition $R_1, \dots, R_n$ of $R$ with $R_1 \cup \dots \cup R_n = R$ is lossless under $F$ when every instance $r$ satisfying $F$ has $\pi_{R_1}(r) \bowtie \dots \bowtie \pi_{R_n}(r) = r$. For $n = 2$, with $I = R_1 \cap R_2$,

$$\text{lossless} \iff I \to R_1 \in F^{+} \;\lor\; I \to R_2 \in F^{+},$$

that is, $I^{+} \supseteq R_1$ or $I^{+} \supseteq R_2$. For any $n$, the chase decides losslessness: build a tableau with one row per $R_i$, holding the distinguished symbol $a_j$ in each column $A_j \in R_i$ and a row-specific $b_{ij}$ elsewhere. While two rows agree on the left side of some FD $X \to A$ of $F$ and differ on $A$, replace every occurrence of one of the two symbols in column $A$ by the other, preferring to keep an $a$. The decomposition is lossless exactly when some row becomes all $a$'s. Every merge reduces the number of distinct symbols, so the chase stops after at most $n \lvert R \rvert$ merges.

**Proof.** The inclusion $r \subseteq \bowtie_i \pi_{R_i}(r)$ always holds: a tuple $t \in r$ joins with itself, since $t[R_i] \in \pi_{R_i}(r)$ for each $i$.

Two-way, sufficiency. Suppose $I \to R_2$. A tuple of the join is $u[R_1]$ combined with $v[R_2]$ for some $u, v \in r$ with $u[I] = v[I]$. By the FD, $u[R_2] = v[R_2]$, so the joined tuple equals $u$, which is in $r$. The case $I \to R_1$ is symmetric.

Two-way, necessity. Suppose neither holds, so some $B \in R_1 - I^{+}$ and some $C \in R_2 - I^{+}$. Take the two-tuple instance from the completeness proof: $u$ all zeros, $v$ zero on $I^{+}$ and one elsewhere. It satisfies $F$. They agree on $I$, so the join contains $u[R_1] v[R_2]$, which is 0 on $B$ and 1 on $C$. That tuple differs from $u$ on $C$ and from $v$ on $B$, so it is not in $r$ and the join is lossy. An empty intersection is the special case $I = \emptyset$: unless $F$ forces some attributes constant, $\emptyset^{+} = \emptyset$ and the join is a cross product.

Chase, sufficiency. Take any tuple $t$ of the join, so there are $s_1, \dots, s_n \in r$ with $s_i[R_i] = t[R_i]$. Map each symbol to a value: $a_j$ to $t[A_j]$ and $b_{ij}$ to $s_i[A_j]$. Invariant: row $i$ maps to $s_i$. It holds initially, because row $i$ has $a_j$ exactly on $R_i$, where $s_i$ agrees with $t$. A chase step on rows $i$ and $k$ with equal $X$ entries: the invariant gives $s_i[X] = s_k[X]$, so $s_i[A] = s_k[A]$ because $r$ satisfies $X \to A$; the two merged symbols already map to the same value, so the mapping stays well defined and the invariant survives. If row $i$ ends all $a$'s, it maps to $t$, and also to $s_i$, so $t = s_i \in r$.

Chase, necessity. When the chase stops, the tableau, with symbols read as values, is an instance satisfying $F$, since no FD can fire. Row $i$ has $a$'s on all of $R_i$, so the all-$a$ tuple lies in the join of the projections, and if no row is all $a$'s it is not in the instance: lossy. This is the tableau argument in Ullman and in Navathe.

**GATE use.** The 2-mark MSQ or MCQ "which decomposition is lossless": compute the closure of each intersection. For three or more pieces, merge a pair that passes the two-way test and repeat, or run the chase, which also handles orders where no single pair passes. The trap is accepting an FD among the shared attributes in place of the requirement that they be a superkey of one piece.

**Check.** $R(A, B, C, D, E)$ with $AB \to C$, $C \to D$, $B \to E$: $(A, B, C), (C, D), (B, E)$ is lossless; $(A, B), (C, D, E)$, $(A, C, D), (B, C, E)$ and $(A, B, D), (B, C, E)$ are lossy. $R(A, B, C)$ with $A \to B$ split into $(A, B), (B, C)$: the rows $(1, x, 10)$, $(2, x, 20)$ join into 4 tuples. A script ran the chase on each, and on random FD sets the two-way test agreed with the chase every time.

## Dependency preservation and its polynomial test
<!-- topics: db-normalization.dependency-preservation -->

**Claim.** Let $F_i = \{X \to Y \in F^{+} : X \cup Y \subseteq R_i\}$ be the projection of $F$ onto $R_i$. The decomposition preserves dependencies when

$$\left(F_1 \cup F_2 \cup \dots \cup F_n\right)^{+} = F^{+}.$$

An FD $X \to Y$ of $F$ is preserved exactly when this loop ends with $Y \subseteq Z$: set $Z = X$; repeat, for each $i$, $Z \leftarrow Z \cup \left((Z \cap R_i)^{+} \cap R_i\right)$ with closures taken under $F$, until $Z$ stops changing. The loop computes the closure of $X$ under $G = \bigcup_i F_i$ without listing $G$, which can be exponentially large. Preservation and losslessness are independent.

**Proof.** Since each $F_i \subseteq F^{+}$, $G^{+} \subseteq F^{+}$ always, so preservation means $F \subseteq G^{+}$, by the equivalence test of the third section, which is one closure under $G$ per FD of $F$.

The loop computes $X^{+}_{G}$. Soundness: let $W = Z \cap R_i$; the FD $W \to (W^{+} \cap R_i)$ has all its attributes in $R_i$ and is implied by $F$, so it lies in $F_i$. By induction, $X \to Z$ is in $G^{+}$ at every step. Completeness: at the fixpoint, take any $V \to U \in F_i$ with $V \subseteq Z$. Then $V \subseteq Z \cap R_i$, so $U \subseteq V^{+} \cap R_i \subseteq (Z \cap R_i)^{+} \cap R_i \subseteq Z$. So $Z$ is closed under every FD of $G$, and since it contains $X$, it contains $X^{+}_{G}$. Each pass costs $n$ closures under $F$, and $Z$ grows at most $\lvert R \rvert$ times.

Independence. Lossless but not preserving: $R(A, B, C)$ with $AB \to C$, $C \to B$, split into $(C, B), (A, C)$. The intersection $C$ has $C^{+} = \{B, C\}$, so it is lossless, but the projections give only $C \to B$, and from $AB$ the loop stays at $\{A, B\}$, so $AB \to C$ is lost. Preserving but lossy: $R(A, B, C, D)$ with $A \to B$, $C \to D$, split into $(A, B), (C, D)$: each FD lies in one piece, and the intersection is empty.

**GATE use.** MSQs list a decomposition and ask about both properties. The traps are assuming a lossless decomposition preserves dependencies, and calling an FD lost because no single piece contains all its attributes, when it may follow from FDs of several pieces.

**Check.** $R(A, B, C)$ with $A \to B$, $B \to C$, $A \to C$, split into $(A, B), (B, C)$: the loop from $A$ gives $\{A, B\}$ and then $\{A, B, C\}$, so $A \to C$ is preserved through $A \to B$ and $B \to C$. $R(A, B, C, D)$ with $A \to B$, $B \to C$, $C \to D$, split into $(A, B), (A, C), (A, D)$: lossless because $A$ is a key of every piece, but the projections are $A \to B$, $A \to C$, $A \to D$, so $B \to C$ and $C \to D$ are lost. A script confirmed both, and the $AB \to C$ loop above.

## Canonical cover: extraneous attributes, redundant FDs and the order
<!-- topics: db-normalization.canonical-cover -->

**Claim.** A canonical (minimal) cover $F_c$ of $F$ is an FD set equivalent to $F$ in which every right side is a single attribute, no left-side attribute is extraneous, and no FD is redundant. Over FDs with single-attribute right sides:

- $B$ is extraneous in $X \to A$, with $B \in X$, exactly when $A \in (X - \{B\})^{+}_{F}$;
- $X \to A$ is redundant exactly when $A \in X^{+}_{F - \{X \to A\}}$.

Splitting right sides, then removing extraneous attributes, then removing redundant FDs always gives a canonical cover. Removing redundant FDs first can leave a redundant FD behind. A canonical cover need not be unique. The procedure takes one closure per tested attribute and per tested FD, which is polynomial in $\lvert F \rvert$ and $\lvert R \rvert$.

**Proof.** Splitting is safe by union and decomposition. Extraneous attribute: replacing $X \to A$ by $(X - \{B\}) \to A$ gives a set $F'$ with $F' \models X \to A$ by left widening, so $F \subseteq F'^{+}$. The other direction needs $F \models (X - \{B\}) \to A$, which is the condition $A \in (X - \{B\})^{+}_{F}$. By the equivalence test the two sets are equivalent exactly then. Redundant FD: $F - \{X \to A\}$ is equivalent to $F$ exactly when it implies $X \to A$, which is the closure condition.

Order. Removing an FD keeps the set equivalent, so later extraneous-attribute tests give the same answers as before. Shrinking a left side, however, produces a stronger-looking FD, and it can make another FD derivable that was not derivable before. So the redundancy pass must come after all left sides are reduced. After it, no attribute becomes extraneous again: a set with fewer FDs has smaller closures, so each $(X - \{B\})^{+}$ can only shrink. Every step keeps the set equivalent to $F$, so the result is a canonical cover.

**GATE use.** NAT "how many FDs in a canonical cover" and MCQ "which set is a minimal cover" or "which sets are equivalent". The trap is the order of the passes. Uniqueness questions need a concrete argument: in $\{A \to B,\ B \to A,\ A \to C,\ B \to C\}$ either $A \to C$ or $B \to C$ can be dropped, giving two different covers.

**Check.** $F = \{AB \to C,\ C \to B,\ A \to B\}$: no FD is redundant at first, since $(AB)^{+}$ without $AB \to C$ is $\{A, B\}$, $C^{+}$ without $C \to B$ is $\{C\}$, and $A^{+}$ without $A \to B$ is $\{A\}$. Reducing $AB \to C$ to $A \to C$ (since $A^{+} \ni B$) then makes $A \to B$ redundant via $A \to C \to B$; the correct order gives $\{A \to C,\ C \to B\}$. $F = \{A \to BC,\ B \to C,\ AB \to D,\ AC \to D,\ D \to B\}$ reduces to $\{A \to D,\ D \to B,\ B \to C\}$, 3 FDs. $F = \{AB \to C,\ A \to B\}$ has the unique cover $\{A \to B,\ A \to C\}$. A script ran both orders on 20,000 random FD sets, always found the correct order minimal, and found the first example as a three-FD failure of the wrong order; it ran every permutation of the four-FD set and got exactly the two covers listed.

## 3NF synthesis is lossless and dependency-preserving
<!-- topics: db-normalization.third-nf-synthesis -->

**Claim.** Let $F_c$ be a canonical cover of $F$. For each left side $X$ of $F_c$ create the relation $R_X = X \cup \{A : X \to A \in F_c\}$. If no $R_X$ contains a candidate key of $R$, add one relation holding a candidate key $K$. Optionally drop a relation contained in another. The resulting decomposition is dependency-preserving, lossless, and every piece is in 3NF. It need not be in BCNF.

**Proof.** Preservation: every FD of $F_c$ lies inside one $R_X$, so $F_c \subseteq \bigcup_i F_i$, and $F^{+} = F_c^{+} \subseteq \left(\bigcup_i F_i\right)^{+} \subseteq F^{+}$. Dropping a piece contained in another keeps its FDs inside the larger piece.

Lossless: let $R_K$ be a piece containing a candidate key $K$. Run the chase. Compute $K^{+}$ under $F_c$, and let $X_1 \to A_1, X_2 \to A_2, \dots$ be the FDs in the order they fire. By induction, when $X_j \to A_j$ fires, row $R_K$ has $a$'s on $X_j$, since $X_j \subseteq K \cup \{A_1, \dots, A_{j-1}\}$. The row of $R_{X_j}$ has $a$'s on all of $X_j \cup \{A_j\}$. The two rows agree on $X_j$, so the chase gives $A_j$ the symbol $a$ in row $R_K$. Since $K^{+} = R$, row $R_K$ ends all $a$'s. Without the key relation this can fail, which is why the key piece is added.

Each $R_X$ is in 3NF. First, $X$ is a candidate key of $R_X$: it determines $R_X$, and if a proper subset $X' \subsetneq X$ determined $R_X$, then for any $A$ with $X \to A \in F_c$, an attribute of $X - X'$ would be extraneous in $X \to A$ by monotonicity, contradicting the cover's minimality. Now take a non-trivial $Z \to B$ that holds on $R_X$ (in $F^{+}$, with $Z \cup \{B\} \subseteq R_X$ and $B \notin Z$), with $Z$ not a superkey of $R_X$. If $B \in X$, then $B$ is prime in $R_X$ and 3NF holds. Otherwise $X \to B \in F_c$. Compute $Z^{+}$ under $F_c$: if $X \to B$ ever fires, then $X \subseteq Z^{+}$, so $Z$ determines $X$ and hence $R_X$, making $Z$ a superkey, a contradiction. So $B$ is derived from $Z$ without $X \to B$, and $Z \to B \in (F_c - \{X \to B\})^{+}$. Under $F_c - \{X \to B\}$, $X$ still determines every other attribute of $R_X$, so $X^{+} \supseteq Z$ (as $Z \subseteq R_X - \{B\}$), and then $X^{+} \ni B$. So $X \to B$ is redundant, contradicting minimality. The key relation $R_K$ is in 3NF because $K$ is a minimal key of $R_K$, so every attribute of $R_K$ is prime there. This follows Ullman's proof.

**GATE use.** The 2-mark MCQ "which schema does 3NF synthesis produce" from a given cover. The traps are forgetting the key relation, merging FDs with different left sides, and claiming the result is always BCNF. A key relation is added only when no synthesized relation already contains a key.

**Check.** The cover $\{A \to B,\ BC \to D,\ AC \to E,\ F \to A\}$ over $R(A, B, C, D, E, F)$: $C$ and $F$ are left-only and $(CF)^{+} = R$, so $CF$ is the unique key, and no synthesized piece contains it. The pieces $(A, B), (B, C, D), (A, C, E), (F, A)$ fail the chase; adding $(C, F)$ makes it succeed, and every piece is in BCNF. For $R(A, B, C)$ with $AB \to C$, $C \to B$, synthesis gives $(A, B, C)$ and $(C, B)$; dropping the contained piece leaves $(A, B, C)$, which is in 3NF and not in BCNF. A script ran the chase and the normal-form checks on these pieces.

## BCNF decomposition is lossless but may lose dependencies
<!-- topics: db-normalization.bcnf-decomposition, db-normalization.bcnf -->

**Claim.** While some piece $R_i$ is not in BCNF, pick a non-trivial $X \to Y$ holding on $R_i$ with $X$ not a superkey of $R_i$ and $Y \subseteq R_i$, and replace $R_i$ by

$$R_{i1} = X \cup Y, \qquad R_{i2} = R_i - (Y - X).$$

The algorithm terminates, every final piece is in BCNF, and the decomposition is lossless. It need not preserve dependencies, and for some schemas no BCNF decomposition preserves them. Writing the second piece as $R_i - Y$ breaks losslessness when $Y$ overlaps $X$.

**Proof.** Intersection: $R_{i1} \cap R_{i2} = (X \cup Y) - (Y - X) = X$, since every attribute of $Y - X$ is removed and all of $X$ survives. $X \to X \cup Y$ holds, so the intersection determines $R_{i1}$, and the two-way test makes the split lossless. Lossless splits compose: if $R_i$ is a lossless join of $R_{i1}$ and $R_{i2}$ on every legal instance, replacing $\pi_{R_i}(r)$ in the overall join by $\pi_{R_{i1}}(r) \bowtie \pi_{R_{i2}}(r)$ changes nothing, since projecting onto a subset commutes with the projections already taken.

Termination: both pieces are strictly smaller than $R_i$. $R_{i2}$ loses the non-empty $Y - X$ (non-empty because the FD is non-trivial). $R_{i1} \ne R_i$, since otherwise $X \to R_i$ would make $X$ a superkey. Sizes shrink, so the process stops, and it stops only when every piece passes BCNF.

Why $R_i - Y$ is wrong: if $Y \cap X \ne \emptyset$, then $R_i - Y$ loses part of $X$, the intersection with $X \cup Y$ is only $X - Y$, and that need not determine either piece. On $R(A, B, C, D)$ with $AB \to C$ and the violating $AB \to BC$, the correct pieces are $(A, B, C)$ and $(A, B, D)$, joined on $AB$; the wrong pieces $(A, B, C)$ and $(A, D)$ share only $A$, and $A^{+} = \{A\}$, so the join is lossy.

No preserving BCNF decomposition: $R(A, B, C)$ with $AB \to C$, $C \to B$ is not in BCNF ($C$ is not a superkey), so a BCNF decomposition must use proper subsets of $R$. Every pair of attributes is in BCNF, and the projections of $F^{+}$ onto the pairs are only $C \to B$ on $(B, C)$; under $C \to B$ alone $(AB)^{+} = \{A, B\}$, so $AB \to C$ is lost in every such decomposition. This is why 3NF exists as a target: it is always reachable with both properties.

**GATE use.** MCQs ask for the result of BCNF splitting or for the properties it guarantees: lossless always, preservation not guaranteed. The traps are claiming BCNF decomposition preserves every FD, and subtracting all of $Y$ in the second piece.

**Check.** A script ran the chase on the $AB \to C$ split of $R(A, B, C, D)$: $(A, B, C), (A, B, D)$ lossless and $(A, B, C), (A, D)$ lossy. It enumerated every decomposition of $R(A, B, C)$ into proper subsets covering $R$ and found none that preserves $AB \to C$, $C \to B$; the split $(C, B), (A, C)$ on $C \to B$ is lossless and loses $AB \to C$.

## Multivalued dependencies, 4NF and the join view of 5NF
<!-- topics: db-normalization.mvd-4nf -->

**Claim.** Let $Z = R - X - Y$. An instance satisfies the MVD $X \twoheadrightarrow Y$ when for any $t_1, t_2$ with $t_1[X] = t_2[X]$ there is a $t_3$ with $t_3[XY] = t_1[XY]$ and $t_3[Z] = t_2[Z]$. Then:

- complementation: $X \twoheadrightarrow Y \Rightarrow X \twoheadrightarrow R - X - Y$;
- promotion: $X \to Y \Rightarrow X \twoheadrightarrow Y$, and the converse fails;
- triviality: $X \twoheadrightarrow Y$ holds in every instance exactly when $Y \subseteq X$ or $X \cup Y = R$;
- Fagin's theorem: the decomposition $(XY, XZ)$ is lossless on $r$ exactly when $r$ satisfies $X \twoheadrightarrow Y$.

$R$ is in 4NF when every non-trivial MVD has a superkey left side, and 4NF implies BCNF. 5NF asks the same for join dependencies: every join dependency must follow from the candidate keys.

**Proof.** Complementation: given $t_1, t_2$ agreeing on $X$, apply the definition to the pair $(t_2, t_1)$ to get $t_4$ with $t_4[XY] = t_2[XY]$ and $t_4[Z] = t_1[Z]$. Then $t_4[X] = t_1[X]$, $t_4[Z] = t_1[Z]$ and $t_4[Y] = t_2[Y]$, which is the tuple $X \twoheadrightarrow Z$ demands for $(t_1, t_2)$. Promotion: if $X \to Y$, take $t_3 = t_2$; it agrees with $t_1$ on $X$ and, by the FD, on $Y$, and it has $t_2$'s $Z$. The converse fails on Course–Instructor–Textbook below. Triviality: if $Y \subseteq X$, take $t_3 = t_2$; if $X \cup Y = R$, then $Z = \emptyset$ and $t_3 = t_1$. Otherwise some $B \in Y - X$ and $C \in Z$ exist, and the instance $\{t_1, t_2\}$ with $t_1$ all zeros and $t_2$ zero on $X$ and one elsewhere has no tuple with $t_1$'s $B$ and $t_2$'s $C$.

Fagin: a tuple of $\pi_{XY}(r) \bowtie \pi_{XZ}(r)$ is $t_1[XY]$ combined with $t_2[Z]$ for $t_1, t_2 \in r$ agreeing on $X$, and the MVD says exactly that every such tuple is in $r$. So the join adds nothing exactly when the MVD holds.

4NF implies BCNF: suppose $X \to A$ is non-trivial and $X$ is not a superkey. Then $X \twoheadrightarrow A$ by promotion. It is non-trivial as an MVD: $A \notin X$, and $X \cup \{A\} \ne R$, because otherwise $X \to R$ and $X$ would be a superkey. So 4NF fails. 4NF allows non-trivial MVDs, as long as their left sides are superkeys. For 5NF, Fagin's theorem shows an MVD is a binary join dependency; 5NF extends the 4NF condition to joins of three or more pieces.

**GATE use.** MCQs give a schema where independent multi-valued facts share a key, such as a course's instructors and textbooks, and ask for the normal form: with only trivial FDs it is in BCNF, and the MVD Course $\twoheadrightarrow$ Instructor breaks 4NF. The traps are treating the MVD as an FD and reading 4NF as "no non-trivial MVDs at all".

**Check.** The instance with course db (instructors $x, y$; textbooks $k, s$) and os (instructor $z$; textbooks $g, h$) has 6 tuples. A script confirmed Course $\twoheadrightarrow$ Instructor and Course $\twoheadrightarrow$ Textbook, that Course $\to$ Instructor fails, and that the join of (Course, Instructor) and (Course, Textbook) returns exactly the 6 tuples. On 3,000 random binary instances over four attributes, $X \twoheadrightarrow Y$ held exactly when its complement did and exactly when $(XY, XZ)$ was lossless, and every FD was also an MVD.
