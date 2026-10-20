# ER model and relational model: derivations

## Minimum number of relations for an ER diagram
<!-- topics: db-er-relational.minimum-relations, db-er-relational.er-to-relational, db-er-relational.weak-entities, db-er-relational.cardinality-participation -->

**Claim.** Map the diagram with the moves of Elmasri and Navathe's algorithm. Each entity set, strong or weak, gets a relation of its simple single-valued attributes. Each relationship is recorded either as a foreign key column in the relation of one side or as a relation of its own, and each multivalued attribute as a column or a relation of its own. Finally, the relations of two entity sets may be merged so that related entities share a tuple. The result is valid when (a) every relation is in 1NF, so a cell holds one atomic value or NULL; (b) every relation has a primary key, unique and never NULL; (c) every entity is stored in exactly one tuple, so no entity's attributes are repeated; and (d) every legal instance of the diagram can be stored and read back. NULL is allowed in every column outside a primary key. For a binary relationship $R$ between distinct entity sets $E_1$ (key $k_1$) and $E_2$ (key $k_2$):

1. A 1:N relationship, $E_1$ on the one side, adds no relation: $k_1$ and the attributes of $R$ become columns of $E_2$'s relation. Total participation of $E_2$ makes that foreign key NOT NULL, and no choice of participation lets the two relations merge.
2. An M:N relationship needs a relation of its own with primary key $(k_1, k_2)$, whatever the participation.
3. A multivalued attribute $A$ of an entity set with key $k$ needs a relation $(k, A)$ keyed on both columns. A relationship of degree three or more needs a relation holding the keys of all its entity sets.
4. A weak entity set needs one relation, keyed on the owner's key plus the discriminator; its identifying relationship adds nothing.
5. A 1:1 relationship adds no relation. If at least one side participates totally, $E_1$ and $E_2$ fit in one merged relation, keyed on the key of the partially participating side (either key when both are total). If both sides are partial, they need two relations.

So, when no two 1:1 relationships share an entity set,

$$\text{minimum} = \#\text{entity sets} + \#\text{M:N} + \#\text{multivalued attributes} + \#\text{relationships of degree} \ge 3 - \#\text{1:1 with a total side}.$$

A recursive relationship maps the same way, except that a recursive 1:1 relationship cannot merge anything, since there is only one entity set.

**Proof.** First, merges. Merging the relations of $E_1$ and $E_2$ along a relationship stores each related pair in one tuple. If the relationship lets an $E_1$ entity have two partners, then in an instance where it has two, that entity would occupy two tuples, which (c) forbids; the same holds with the roles swapped. So only a 1:1 relationship allows a merge. Participation constraints never exclude the instance in which an entity has two partners in a 1:N or M:N relationship, so participation cannot change this.

(1) A foreign key column holds one value per tuple. Each $E_2$ entity has at most one $E_1$ partner, so its tuple can hold the partner's key, or NULL, together with the relationship's attributes, which belong to that single pair. The column cannot go on the $E_1$ side, where an entity may have several partners. Total participation means a partner always exists, so NULL never occurs and the column can be declared NOT NULL.

(2) An $E_1$ entity may have several partners, so a foreign key column in its relation would need several values, against (a), or a repeated tuple, against (c). The same holds for $E_2$, and by the merge argument the two relations cannot merge. So the pairs need a relation of their own, one tuple per pair. In it $k_1$ alone repeats (an entity with two partners), as does $k_2$, while each pair occurs once, so the key is $(k_1, k_2)$, and it is never NULL because each tuple is an actual pair. Nor can this relation absorb $E_1$'s attributes: an entity with two partners would occupy two tuples (c), and one with no partner would need a tuple with $k_2$ NULL inside the key (b).

(3) The argument of (2) applies with the values of $A$ in place of partners. In a relationship of degree three or more, an entity may take part in several instances, so as in (2) the instances need a relation of their own, holding one key from each entity set.

(4) The identifying relationship is 1:N from the owner to the weak entity set, with total participation of the weak side, so by (1) the owner's key becomes a NOT NULL column of the weak relation. The discriminator alone is not unique, since two owners may each have a dependent named Asha, so the key is (owner key, discriminator). An owner may have several weak entities, so by the merge argument the two relations cannot merge.

(5) At most one partner on each side means that a UNIQUE foreign key column on either side stores the relationship, so no relation is added. Suppose $E_2$ participates totally, and build $T(k_1, \text{attrs}(E_1), k_2, \text{attrs}(E_2), \text{attrs}(R))$ with one tuple per $E_1$ entity, holding its partner if it has one and NULLs otherwise. Every $E_2$ entity has a partner, so it sits in exactly one of these tuples. Hence $k_1$ is never NULL and is unique, $k_2$ is unique where present, and $k_1$ serves as the primary key. Keying on $k_2$ instead fails as soon as some $E_1$ entity has no partner, because its tuple has $k_2$ NULL. If both sides are partial, take the instance with one $E_1$ entity and one $E_2$ entity and no pair. $T$ then needs a tuple for each, the first NULL on every $E_2$ column and the second NULL on every $E_1$ column, so every non-empty set of columns is NULL in some tuple, and $T$ has no primary key. Summing (1)–(5) gives the formula. When two 1:1 relationships share an entity set, a merged relation still needs one key that is non-NULL in every tuple, so check (5) again on the merged relation.

**GATE use.** NAT questions describe a diagram and ask for the minimum number of tables. Count one relation per entity set, strong or weak, and add the M:N relationships, the multivalued attributes and the relationships of higher degree. The traps are giving a 1:N relationship its own table, forgetting the table for a multivalued attribute, and merging across a 1:N relationship because one side is total. Elmasri and Navathe offer the merged 1:1 relation only when both participations are total, so that no tuple is padded with NULLs. When the minimum is asked, one total side is enough. If a question forbids NULLs altogether, a foreign key on a partial side must move into a relation of its own: a 1:1 relationship then costs 3, 2 or 1 relations as zero, one or two sides are total, and a 1:N relationship whose many side is partial costs 3.

**Check.** The chapter's diagram needs E1(a1, a2), E2(b1), E3(c1, c2, b1), R12(a1, b1, r) and E2B2(b1, b2): $3 + 1 + 1 = 5$. A script built this schema in SQLite with NOT NULL primary keys and enforced foreign keys, then stored 300 random legal instances and read each one back. Folding R12 into E1 or E2, storing b2 as a column of E2, and merging E3 into E2 under either key each violated a constraint on some legal instance. With both sides total, merging across a 1:N relationship or folding E1 into R12 still failed, because an entity had to occupy two tuples. For a 1:1 relationship it enumerated all 286 instances with up to three entities a side. With $E_2$ total, the relation keyed on $k_1$ stored every instance and the one keyed on $k_2$ failed; with both sides partial, no column set could serve as key. It also confirmed 3 relations for two entity sets joined by one 1:N and one M:N relationship, and the no-NULL counts 3, 2, 1 and 3.

## Superkeys, candidate keys and counting superkeys
<!-- topics: db-er-relational.keys -->

**Claim.** Let relation $R$ have the attribute set $U$ with $\lvert U \rvert = n$. A set $X \subseteq U$ is a superkey when no two distinct tuples of any legal instance agree on all of $X$, and a candidate key is a superkey with no proper subset that is a superkey.

1. Every superset of a superkey is a superkey, and every superkey contains a candidate key. Two candidate keys never contain one another.
2. If $R$ has a single candidate key $K$ with $\lvert K \rvert = k$, its superkeys are exactly the sets $K \cup Z$ with $Z \subseteq U - K$, so there are $2^{\,n-k}$ of them.
3. With candidate keys $K_1, \dots, K_m$, a set is a superkey exactly when it contains some $K_i$, and

$$\#\text{superkeys} = \sum_{\varnothing \ne J \subseteq \{1, \dots, m\}} (-1)^{\lvert J \rvert + 1}\, 2^{\,n - \lvert \bigcup_{i \in J} K_i \rvert}.$$

For two keys this is $2^{\,n-\lvert K_1 \rvert} + 2^{\,n-\lvert K_2 \rvert} - 2^{\,n-\lvert K_1 \cup K_2 \rvert}$.

**Proof.** (1) If $X \subseteq Y$ and two tuples agree on $Y$, they agree on $X$. So if $X$ separates every pair of distinct tuples, $Y$ does too. Given a superkey $X$, delete attributes one at a time as long as what remains is a superkey. This stops after at most $\lvert X \rvert$ steps at a superkey $X'$ from which no single attribute can be removed. $X'$ is minimal: if a proper subset $Z$ of $X'$ were a superkey, pick $a \in X' - Z$; then $X' - \{a\}$ contains $Z$, so it is a superkey by upward closure, contradicting the stopping rule. If one candidate key were a proper subset of another, the larger would have a proper subset that is a superkey and would not be minimal.

(2) By (1), $X$ is a superkey exactly when it contains a candidate key, here exactly when $K \subseteq X$. The map $Z \mapsto K \cup Z$ from subsets of $U - K$ to these sets has the inverse $X \mapsto X - K$, so it is a bijection, and $U - K$ has $2^{\,n-k}$ subsets.

(3) Let $\text{Up}(K)$ be the family of sets that contain $K$. The superkeys form $\bigcup_i \text{Up}(K_i)$. A set contains every $K_i$ with $i \in J$ exactly when it contains their union, so $\bigcap_{i \in J} \text{Up}(K_i) = \text{Up}\big(\bigcup_{i \in J} K_i\big)$, which by the bijection of (2) has $2^{\,n - \lvert \bigcup_{i \in J} K_i \rvert}$ members. Inclusion–exclusion over the $m$ families gives the sum.

**GATE use.** A NAT gives a schema and its candidate keys, or functional dependencies from which to find them, and asks for the number of superkeys. The trap is adding the counts for two keys without subtracting the sets that contain both, as in $16 + 8$ instead of $16 + 8 - 4$. Standard closed forms: keys $\{A_1\}$ and $\{A_2\}$ give $3 \cdot 2^{\,n-2}$, and keys $\{A_1, A_2\}$ and $\{A_3, A_4\}$ give $2^{\,n-2} + 2^{\,n-2} - 2^{\,n-4} = 7 \cdot 2^{\,n-4}$. An MCQ asks which statement always holds: adding an attribute to a candidate key gives a superkey that is no longer minimal, so it is never a second candidate key.

**Check.** $R(A, B, C, D, E)$ with candidate keys $A$ and $BC$: $2^4 + 2^3 - 2^2 = 20$. $R(A, B, C, D)$ with candidate keys $A$, $B$ and $CD$: $8 + 8 + 4 - 4 - 2 - 2 + 1 = 13$. A script found both counts by computing the attribute closure of every subset, recovered the candidate keys as the minimal superkeys, and confirmed the two closed forms for $n = 2, \dots, 8$. On 400 random relation instances it listed every attribute set that separates all tuples and checked that this family is closed upward, that inclusion–exclusion over its minimal members counts it exactly, and that those members form an antichain.

## Product, intersection and joins from the basic operators
<!-- topics: db-er-relational.ra-basic, db-er-relational.ra-joins, db-er-relational.relational-model -->

**Claim.** Relations are sets of tuples. Let $R$ have degree $d_R$ and $S$ degree $d_S$, with disjoint attribute names in a product (rename with $\rho$ first otherwise).

1. $\lvert R \times S \rvert = \lvert R \rvert \cdot \lvert S \rvert$ and $\deg(R \times S) = d_R + d_S$.
2. For union-compatible $R$ and $S$, $R \cap S = R - (R - S)$, so intersection is not a basic operator.
3. $R \bowtie_{\theta} S = \sigma_{\theta}(R \times S)$. If $R$ and $S$ share the attributes $B_1, \dots, B_m$ and $S'$ is $S$ with them renamed to $B'_1, \dots, B'_m$, then
$$R \bowtie S = \pi_{\text{attrs}(R) \cup \text{attrs}(S)}\big(\sigma_{B_1 = B'_1 \wedge \dots \wedge B_m = B'_m}(R \times S')\big),$$
with degree $d_R + d_S - m$. For $m = 0$ the condition is empty, so $R \bowtie S = R \times S$; if $R$ and $S$ have the same attributes, $R \bowtie S = R \cap S$.
4. $R \ltimes S = \pi_{\text{attrs}(R)}(R \bowtie S)$ is the set of tuples of $R$ that match at least one tuple of $S$. It is a subset of $R$, so no tuple of $R$ appears twice.

**Proof.** (1) Let $f(r, s) = r \cdot s$, the concatenation. By definition every tuple of $R \times S$ is $f(r, s)$ for some $r \in R$ and $s \in S$. $f$ is injective, since $r$ is the first $d_R$ components of $r \cdot s$ and $s$ the remaining $d_S$. So $f$ is a bijection from the pairs onto $R \times S$, which has $\lvert R \rvert \cdot \lvert S \rvert$ tuples of $d_R + d_S$ components.

(2) $t \in R - (R - S)$ means $t \in R$ and not ($t \in R$ and $t \notin S$), that is $t \in R$ and ($t \notin R$ or $t \in S$). The first alternative contradicts $t \in R$, leaving $t \in R$ and $t \in S$.

(3) A tuple of $\sigma_{\theta}(R \times S)$ is a concatenation $r \cdot s$ that satisfies $\theta$, which is the definition of the theta join. In the displayed formula, a tuple survives the selection exactly when $r$ and $s$ agree on every common attribute, and the projection drops the second copy of each $B_i$. What remains is the natural join tuple, with $d_R + d_S - m$ attributes. With $m = 0$ there is nothing to compare or drop. With identical attributes, $r$ and $s$ must agree everywhere, so $r = s$ and the tuple is in both relations.

(4) Projecting a natural-join tuple onto $\text{attrs}(R)$ gives back the $R$ tuple it came from, so the result is the set of $R$ tuples that have a partner. A set holds each of them once, however many partners it has.

**GATE use.** MSQs ask which operator sets are complete. $\{\sigma, \pi, \cup, -, \times, \rho\}$ is: intersection comes from (2), joins from (3) and division from its own formula. NATs count product tuples and degrees. The natural-join traps are an unintended shared attribute, which silently drops matches, and no shared attribute, which silently gives the product. The equijoin keeps both copies of each join column, $d_R + d_S$ columns, while the natural join keeps one.

**Check.** 10 tuples of degree 3 times 20 tuples of degree 4 gives 200 tuples of degree 7, in the algebra and as `SELECT * FROM R CROSS JOIN S` in SQLite. A script verified $R \cap S = R - (R - S)$, the natural join as a projection of a selection over a product, its degree, and the semijoin as the matching tuples of $R$. These ran over all 256 pairs of relations on two small domains. A theta join written with `ON` returned the same 21 rows as the selection over the product.

## Bounds on the size of a relational algebra result
<!-- topics: db-er-relational.ra-result-size -->

**Claim.** For relations $R$ and $S$ with no NULL in the join attributes:

1. $0 \le \lvert \sigma_p(R) \rvert \le \lvert R \rvert$. For non-empty $R$, $1 \le \lvert \pi_L(R) \rvert \le \lvert R \rvert$, with equality on the right when $L$ contains a key of $R$.
2. $0 \le \lvert R \bowtie S \rvert \le \lvert R \rvert \cdot \lvert S \rvert$, and both bounds are attained.
3. If the common attributes $Y$ contain a key of $S$, then $\lvert R \bowtie S \rvert \le \lvert R \rvert$. If in addition $R.Y$ is a NOT NULL foreign key referencing that key, $\lvert R \bowtie S \rvert = \lvert R \rvert$.
4. For union-compatible $R$ and $S$: $\max(\lvert R \rvert, \lvert S \rvert) \le \lvert R \cup S \rvert \le \lvert R \rvert + \lvert S \rvert$, $\;0 \le \lvert R \cap S \rvert \le \min(\lvert R \rvert, \lvert S \rvert)$ and $\max(0, \lvert R \rvert - \lvert S \rvert) \le \lvert R - S \rvert \le \lvert R \rvert$, each bound attained.

**Proof.** (1) A selection returns a subset of $R$. The map $t \mapsto t[L]$ sends $R$ onto $\pi_L(R)$, so the image has at most $\lvert R \rvert$ tuples, and at least one if $R$ is non-empty. If $L$ contains a key, two distinct tuples differ on $L$, so the map is injective and nothing collapses.

(2) Map $g(t) = (t[\text{attrs}(R)], t[\text{attrs}(S)])$. By the definition of the join, both parts are tuples of $R$ and $S$, and $t$ is the union of its two parts, so $g$ is an injection from $R \bowtie S$ into the pairs of $R \times S$, giving at most $\lvert R \rvert \cdot \lvert S \rvert$ tuples. The join is empty when no $R$ tuple agrees with any $S$ tuple on $Y$, and it is the whole product when every tuple of both relations has the same $Y$-value.

(3) If $Y$ contains a key of $S$, two $S$ tuples that agree on $Y$ are equal, so each $r$ has at most one partner and $t \mapsto t[\text{attrs}(R)]$ is injective on $R \bowtie S$. With a NOT NULL foreign key, referential integrity gives every $r$ a partner, so the map is also onto $R$.

(4) Count the union by inclusion–exclusion, $\lvert R \cup S \rvert = \lvert R \rvert + \lvert S \rvert - \lvert R \cap S \rvert$, and the difference as $\lvert R - S \rvert = \lvert R \rvert - \lvert R \cap S \rvert$. Since $R \cap S$ is a subset of both relations, $0 \le \lvert R \cap S \rvert \le \min(\lvert R \rvert, \lvert S \rvert)$. Putting the two extremes of $\lvert R \cap S \rvert$ into the two identities gives the other bounds, because $\lvert R \rvert + \lvert S \rvert - \min = \max$ and $\lvert R \rvert - \min(\lvert R \rvert, \lvert S \rvert) = \max(0, \lvert R \rvert - \lvert S \rvert)$. Disjoint relations attain one end; one relation inside the other attains the other.

**GATE use.** MCQs give tuple counts and key facts and ask for the minimum or maximum size of an expression. Use (3) whenever a key or foreign key is stated: a join along a NOT NULL foreign key returns exactly $\lvert R \rvert$ tuples. The common trap is to assume a join returns at most $\max(\lvert R \rvert, \lvert S \rvert)$ tuples; without a key it can return the whole product. A second trap is to forget that a projection removes duplicates, so it can return fewer tuples than its input.

**Check.** $R(A, B)$ with 50 tuples and $S(B, C)$ with 20, $B$ the key of $S$ and $R.B$ a NOT NULL foreign key: the join has 50 tuples. SQLite returned 50 with foreign keys enforced and rejected both a dangling and a NULL foreign key value. When $B$ was not a key, with 4 matching $S$ tuples per value, it returned 200. A script checked (2) and the injectivity of $g$, and every bound of (4) together with its attainment, over all 256 pairs of relations on small domains. It checked (3) on 300 random instances.

## Outer joins: padded tuples and their count
<!-- topics: db-er-relational.ra-joins, db-er-relational.ra-result-size -->

**Claim.** Let $R$ and $S$ share the attributes $Y$. Call $r \in R$ matched when some $s \in S$ has $s[Y] = r[Y]$ with no NULL among the compared values, and let $u_R$ be the number of unmatched tuples of $R$, $u_S$ likewise for $S$.

1. The left outer join is the natural join plus every unmatched $r$ padded with NULLs, so $\lvert R \;\text{LEFT JOIN}\; S \rvert = \lvert R \bowtie S \rvert + u_R$, where $u_R = \lvert R \rvert - \lvert R \ltimes S \rvert$. The full outer join also adds the $u_S$ padded tuples of $S$.
2. $\lvert R \rvert \le \lvert R \;\text{LEFT JOIN}\; S \rvert$, and for non-empty $S$, $\lvert R \;\text{LEFT JOIN}\; S \rvert \le \lvert R \rvert \cdot \lvert S \rvert$. For empty $S$ it equals $\lvert R \rvert$.
3. A tuple whose join value is NULL is unmatched: it disappears from the inner join and appears padded in the outer join.
4. A later selection that compares an attribute $C$ of $S$ outside $Y$ with a constant removes every padded tuple, so it turns the left outer join back into the inner join. A selection on attributes of $R$ commutes with the left outer join, $\sigma_p(R \;\text{LEFT JOIN}\; S) = \sigma_p(R) \;\text{LEFT JOIN}\; S$, but a selection on $C$ cannot be pushed into $S$.

**Proof.** (1) Let $m_r$ be the number of partners of $r$. For a fixed $r$, distinct partners agree with $r$ on $Y$, so they differ outside $Y$ and give distinct join tuples. Tuples built from different $r$ differ on $\text{attrs}(R)$. A padded tuple carries an unmatched $r$, which no join tuple carries. So $r$ contributes exactly $\max(1, m_r)$ tuples, $m_r$ if matched and 1 if not, and summing gives $\lvert R \bowtie S \rvert + u_R$. The matched tuples of $R$ are exactly $R \ltimes S$, which gives $u_R$. The full outer join pads the unmatched tuples of $S$ in the same way.

(2) $\max(1, m_r) \ge 1$ for every $r$, so the sum is at least $\lvert R \rvert$. If $S$ is non-empty, then $m_r \le \lvert S \rvert$ and $1 \le \lvert S \rvert$, so $\max(1, m_r) \le \lvert S \rvert$ and the sum is at most $\lvert R \rvert \cdot \lvert S \rvert$. If $S$ is empty, every $r$ is unmatched and contributes 1.

(3) The join condition is an equality, and an equality with NULL is never true (in SQL it is unknown), so the tuple matches nothing.

(4) A padded tuple has $C$ NULL, and the comparison is not true for it, so only join tuples satisfying the condition survive. For $p$ on $R$'s attributes, both whether $r$ is matched and the value of $p$ depend only on $r$ and $S$, so filtering $R$ first or the output afterwards keeps the same tuples. For the counterexample take $R = \{(1, x)\}$ and $S = \{(x, v)\}$ with the condition $C = u$. Selecting after the join gives the empty relation, while $R \;\text{LEFT JOIN}\; \sigma_{C = u}(S) = \{(1, x, \text{NULL})\}$.

**GATE use.** NATs ask for the number of tuples in an outer join of small tables. Compute the inner join first, then add one tuple for each unmatched tuple of the preserved side or sides. The traps are letting two NULLs match, adding the unmatched tuples of the non-preserved side to a left join, and applying a selection on the padded side after an outer join, which drops the padded tuples again.

**Check.** For $R = \{(1,a), (2,b), (3,a), (4,c)\}$ and $S = \{(a,x), (a,y), (b,z), (d,w)\}$ the inner join has 5 tuples, and the full outer join adds $(4, c, \text{NULL})$ and $(\text{NULL}, d, w)$: $5 + 1 + 1 = 7$. For Emp $= \{(1,10), (2,20), (3,\text{NULL})\}$ and Dept $= \{(10, \text{CS}), (30, \text{EE})\}$ the left outer join is $(1, 10, \text{CS})$, $(2, 20, \text{NULL})$ and $(3, \text{NULL}, \text{NULL})$: 3 tuples, 2 of them padded. Both results came out the same in the set algebra and as `NATURAL FULL JOIN` and `NATURAL LEFT JOIN` in SQLite. A script also checked (1)–(4) over all 512 pairs of relations on domains that include a NULL join value. It compared inner, left and full outer joins with SQLite on 300 random instances.

## Algebraic equivalences: pushing selections and distributing operators
<!-- topics: db-er-relational.query-equivalence, db-er-relational.ra-basic -->

**Claim.** For relations with the schemas each item needs:

1. Selections cascade and commute: $\sigma_p(\sigma_q(R)) = \sigma_{p \wedge q}(R) = \sigma_q(\sigma_p(R))$.
2. If $p$ mentions only attributes of $R$, then $\sigma_p(R \times S) = \sigma_p(R) \times S$ and $\sigma_p(R \bowtie S) = \sigma_p(R) \bowtie S$. With $q$ on attributes of $S$, $\sigma_{p \wedge q}(R \bowtie S) = \sigma_p(R) \bowtie \sigma_q(S)$.
3. For union-compatible $R$ and $S$, selection distributes over $\cup$, $\cap$ and $-$, and $\sigma_p(R - S) = \sigma_p(R) - \sigma_p(S) = \sigma_p(R) - S$.
4. $\pi_L(R \cup S) = \pi_L(R) \cup \pi_L(S)$, but only $\pi_L(R \cap S) \subseteq \pi_L(R) \cap \pi_L(S)$ and $\pi_L(R) - \pi_L(S) \subseteq \pi_L(R - S)$ hold for intersection and difference; the reverse inclusions fail.
5. If $K$ is a key of $R$ and $A$ an attribute, then
$$\pi_K(R) - \pi_{R_1.K}\big(\sigma_{R_1.A < R_2.A}(\rho_{R_1}(R) \times \rho_{R_2}(R))\big)$$
returns the keys of all tuples whose $A$ equals the maximum, ties included. With $>$ in place of $<$ it returns the minimum.

**Proof.** (1) Each side holds exactly the tuples $t \in R$ with $p(t)$ and $q(t)$ true.

(2) A tuple of $R \bowtie S$ is $r \cup s$ with $r \in R$, $s \in S$ and $r[Y] = s[Y]$. Since $p$ mentions only attributes of $R$, $p(r \cup s) = p(r)$. So $r \cup s$ is in $\sigma_p(R \bowtie S)$ exactly when $r \in \sigma_p(R)$, $s \in S$ and $r[Y] = s[Y]$, which is membership in $\sigma_p(R) \bowtie S$. The product is the case $Y = \varnothing$. For $p \wedge q$, cascade by (1) and push each part to its own side.

(3) $t \in \sigma_p(R - S)$ means $t \in R$, $t \notin S$ and $p(t)$, which is membership in $\sigma_p(R) - S$. When $p(t)$ holds, $t \in S$ and $t \in \sigma_p(S)$ say the same thing, so this is also $\sigma_p(R) - \sigma_p(S)$. Union and intersection are the same one-line argument with "or" and "and".

(4) A value $a$ is in $\pi_L(R \cup S)$ when some tuple of $R$ or of $S$ projects to $a$, which is membership in $\pi_L(R) \cup \pi_L(S)$. If $a = t[L]$ with $t \in R \cap S$, then $a$ is in both projections. If $a \in \pi_L(R) - \pi_L(S)$, then $a = t[L]$ for some $t \in R$, and $t \notin S$ because $a \notin \pi_L(S)$, so $a \in \pi_L(R - S)$. The reverse directions fail because the two witnesses in $\pi_L(R)$ and $\pi_L(S)$ need not be the same tuple. With $R = \{(1, x)\}$, $S = \{(1, y)\}$ and $L = A$: $\pi_A(R - S) = \{1\}$ but $\pi_A(R) - \pi_A(S) = \varnothing$, and $\pi_A(R \cap S) = \varnothing$ but $\pi_A(R) \cap \pi_A(S) = \{1\}$.

(5) The product pairs every tuple $t_1$ with every $t_2$, and the selection keeps the pairs with $t_1.A < t_2.A$. Projecting gives the keys of the tuples that some tuple beats. Subtracting them from all keys leaves the tuples that no tuple beats, those with $t.A \ge t_2.A$ for every $t_2$, which are the tuples holding the maximum. A tie is not a strict win, so tied maxima survive. The key matters: since $K$ identifies $t_1$, removing $t_1.K$ removes only $t_1$. Projecting a non-key attribute such as a name would delete a name as soon as any tuple carrying it is beaten. With $>$ the same steps remove every tuple that beats somebody, leaving the minimum.

**GATE use.** MSQs list candidate identities, as in the chapter question, where only the projection over union and $\sigma_p(R - S) = \sigma_p(R) - S$ hold. Optimiser questions ask where a selection can move: below a join or a product when it mentions one side only, and below a left outer join only on the preserved side. MCQs give the maximum pattern and ask what it returns. The traps are reading it as the minimum, and missing that ties are kept.

**Check.** A script checked items 1–4 over all 256 pairs of relations on $\{1, 2\} \times \{x, y\}$ with five predicates on $A$ and $B$, and item 2 for products, joins, two-sided selections and left outer joins over all 256 pairs $R(A, B)$, $S(B, C)$. Exactly options 0 and 2 of the chapter's identity question held on every pair, and the counterexample above came out as stated. Pushing $\sigma_{C = u}$ into the right side of a left outer join failed on $R = \{(1, x)\}$, $S = \{(x, v)\}$. The maximum pattern returned exactly the maximum-salary keys, ties included, on 400 random instances, the empty one among them, and the minimum with $>$.

## Division: the basic-operator formula, its size and its edge cases
<!-- topics: db-er-relational.ra-division -->

**Claim.** Let $R$ have the attributes $X \cup Y$ and $S$ the attributes $Y$, with $X$ non-empty and disjoint from $Y$. Define $R \div S = \{x \in \pi_X(R) : (x, y) \in R \text{ for every } y \in S\}$.

1. $R \div S = \pi_X(R) - \pi_X\big((\pi_X(R) \times S) - R\big)$.
2. $R \div S$ is the largest $Q \subseteq \pi_X(R)$ with $Q \times S \subseteq R$. In particular $(R \div S) \times S \subseteq R$, and the inclusion can be strict.
3. If $S \ne \varnothing$, then $\lvert R \div S \rvert \le \lfloor \lvert R \rvert / \lvert S \rvert \rfloor$, and $(Q \times S) \div S = Q$ attains the bound.
4. If $S = \varnothing$, then $R \div S = \pi_X(R)$, while $(Q \times S) \div S = \varnothing$, so (3)'s identity needs $S$ non-empty.

**Proof.** (1) $T = \pi_X(R) \times S$ is the set of all pairs of a candidate $x$ with a divisor value $y$. $T - R$ is the set of such pairs missing from $R$, the gaps, and $\pi_X(T - R)$ is the set of candidates with at least one gap. Removing them from $\pi_X(R)$ leaves the candidates with no gap, those with $(x, y) \in R$ for every $y \in S$, which is the definition.

(2) If $x \in R \div S$ and $y \in S$, then $(x, y) \in R$ by definition, so $(R \div S) \times S \subseteq R$. Conversely, if $Q \subseteq \pi_X(R)$ and $Q \times S \subseteq R$, every $x \in Q$ has $(x, y) \in R$ for all $y \in S$, so $Q \subseteq R \div S$. For strictness, $R = \{(1, a), (1, b), (2, a)\}$ and $S = \{a, b\}$ give $R \div S = \{1\}$, and $(R \div S) \times S$ misses $(2, a)$.

(3) For each $x \in R \div S$, the $\lvert S \rvert$ tuples of $\{x\} \times S$ all lie in $R$, and the blocks for different $x$ are disjoint because they differ on $X$. So $\lvert R \div S \rvert \cdot \lvert S \rvert \le \lvert R \rvert$, and an integer at most $\lvert R \rvert / \lvert S \rvert$ is at most its floor. For $R = Q \times S$ with $S$ non-empty, $\pi_X(R) = Q$, so (2) gives $Q \subseteq R \div S \subseteq \pi_X(R) = Q$, and then $\lvert R \div S \rvert = \lvert Q \rvert = \lvert R \rvert / \lvert S \rvert$.

(4) "For every $y \in S$" is vacuously true when $S$ is empty, so every candidate qualifies; in the formula, $\pi_X(R) \times \varnothing = \varnothing$ and nothing is subtracted. And $Q \times \varnothing = \varnothing$, whose $X$-projection is empty.

In SQL, $\forall = \neg\exists\neg$ turns the definition into a double NOT EXISTS: keep $x$ when no $y$ in $S$ lacks the row $(x, y)$. The counting form, which groups by $x$ and keeps a group when its count of distinct $Y$ values in $S$ equals $\lvert S \rvert$, agrees for non-empty $S$ but returns nothing for empty $S$.

**GATE use.** MCQs ask what a division means ("students enrolled in every course"), and NATs evaluate one. Identify $X$, compute the divisor after any selection, then check each candidate against every divisor value; extra pairs do not matter. The traps are dividing by a relation with an attribute that $R$ lacks, which needs a projection first, returning whole tuples of $R$ instead of $X$-values, and the empty divisor.

**Check.** In the chapter question the divisor is the set of CS courses $\{c_1, c_2, c_4\}$. $s_1$ takes all three, $s_2$ lacks $c_4$, $s_3$ takes all three plus $c_3$, and $s_4$ takes only $c_4$. The result is $\{s_1, s_3\}$, 2 tuples, within the bound $\lfloor 11/3 \rfloor = 3$. A script confirmed this with the formula and with the double NOT EXISTS and counting queries in SQLite. Over all 256 pairs with $R \subseteq \{1,2,3\} \times \{a,b\}$ and $S \subseteq \{a,b\}$ it checked the formula against the definition, the largest-$Q$ property, the bound and the empty divisor. The double NOT EXISTS matched the definition on 400 random instances. With an empty divisor it returned all 4 students and the counting form none.

## Tuple calculus: quantifier identities and the translation from algebra
<!-- topics: db-er-relational.trc, db-er-relational.query-equivalence -->

**Claim.** In tuple relational calculus a quantifier ranges over the tuples of a relation, and only the result variable $t$ is free.

1. $\forall s \in R\,(P) \equiv \neg\, \exists s \in R\,(\neg P)$; over an empty $R$, $\forall$ is true and $\exists$ is false. Also $P \Rightarrow Q \equiv \neg P \vee Q$.
2. Each algebra operator has a calculus form whose result takes its values from stored tuples:
   - $\sigma_p(R) = \{t \mid t \in R \wedge p(t)\}$ and $\pi_{A_1, \dots, A_k}(R) = \{t \mid \exists r \in R\,(t.A_1 = r.A_1 \wedge \dots \wedge t.A_k = r.A_k)\}$, where $t$ has only the attributes $A_1, \dots, A_k$;
   - $R \cup S = \{t \mid t \in R \vee t \in S\}$ and $R - S = \{t \mid t \in R \wedge \neg(t \in S)\}$;
   - $R \bowtie S = \{t \mid \exists r \in R\, \exists s \in S\,(r.Y = s.Y \wedge t[\text{attrs}(R)] = r \wedge t[\text{attrs}(S)] = s)\}$, and the product is the case with no $Y$;
   - $R \div S = \{t \mid \exists r \in R\,(t.X = r.X) \wedge \forall s \in S\, \exists u \in R\,(u.X = t.X \wedge u.Y = s.Y)\}$.
3. In $\{t \mid \exists e \in R\,(\varphi(e) \wedge t.A = e.A)\}$ the condition and the copy must sit under the same quantifier. Written as $\exists e \in R\,(\varphi(e)) \wedge \exists f \in R\,(t.A = f.A)$, the query returns all of $\pi_A(R)$ as soon as any tuple satisfies $\varphi$.

**Proof.** (1) If $R = \{s_1, \dots, s_n\}$, then $\forall s \in R\,(P)$ is $P(s_1) \wedge \dots \wedge P(s_n)$, and $\exists s \in R\,(\neg P)$ is $\neg P(s_1) \vee \dots \vee \neg P(s_n)$. By De Morgan's law the first is the negation of the second. For $n = 0$ the empty conjunction is true and the empty disjunction false, so the identity still holds. $P \Rightarrow Q$ and $\neg P \vee Q$ are both false only when $P$ is true and $Q$ false.

(2) Each form restates the operator's definition. A $k$-attribute $t$ is in the projection exactly when it is the restriction of some $r \in R$, which the $\exists$ says. In the join, $t$ is the union of a pair of tuples that agree on $Y$. In the division form, the first conjunct makes $t.X$ a value of $\pi_X(R)$, and the second says that $(t.X, s.Y) \in R$ for every $s \in S$, which is the definition of $R \div S$. Composing the forms handles nested expressions: the conditions of an inner expression move under the quantifiers over the base relations it reads, as in $\pi_A(\sigma_p(R)) = \{t \mid \exists r \in R\,(p(r) \wedge t.A = r.A)\}$. Codd (1972) proved the converse translation, from safe calculus to the algebra, so the two languages express the same queries.

(3) The first conjunct does not mention $t$, so it is true or false for the whole database. When it is true, the query reduces to $\{t \mid \exists f \in R\,(t.A = f.A)\} = \pi_A(R)$.

For the chapter's "for all" question, let $Q_c$ be $\{t \mid t \in \text{Student} \wedge \forall c \in \text{Course}\, \exists e \in \text{Enrolled}\,(e.sid = t.sid \wedge e.cid = c.cid)\}$. If Course is non-empty, a student satisfies the $\forall$ exactly when its sid is paired in Enrolled with every course. Such a sid appears in Enrolled, so it lies in Enrolled $\div$ Course, and the join with Student keeps exactly these students. If Course is empty, the $\forall$ is true for every student, but Enrolled $\div \varnothing = \pi_{sid}(\text{Enrolled})$ keeps only the students with some enrollment.

**GATE use.** MCQs match an English query with algebra and calculus forms. "Some" means $\exists$ or a join, "no" a difference or $\neg\exists$, "every" a division or $\forall$. Check the result schema too: $\{t \mid t \in \text{Emp} \wedge t.age > 30\}$ returns whole Emp tuples, not names. The traps are the closed $\exists$ of (3), a $\forall$ where "at least one" is meant, and an empty divisor, where the calculus $\forall$ and the algebra division can disagree.

**Check.** A script evaluated the four options of the projection question by brute force on all 125 Emp instances with up to three employees, two names and two ages, letting $t$ range over a name domain with one extra value. Only $\{t \mid \exists e \in \text{Emp}\,(e.age > 30 \wedge t.name = e.name)\}$ always matched $\pi_{name}(\sigma_{age > 30}(\text{Emp}))$. The $\forall$ option returned the whole name domain on the empty instance. For the "for all" question it ran 2048 instances, and only Student $\bowtie$ (Enrolled $\div$ Course) matched $Q_c$ whenever Course was non-empty. With Course empty it differed on 169 instances, each with a student who has no enrollment. The division form of (2) matched $R \div S$ on all 256 small pairs, empty divisors included, under two value domains.

## Safe tuple calculus: finite, domain-independent answers
<!-- topics: db-er-relational.trc -->

**Claim.** For a calculus formula $P$, let $\text{dom}(P)$ be the set of constants in $P$ together with every value stored in the relations that $P$ mentions; it is finite. $P$ is safe when, on every database, every value of every result tuple lies in $\text{dom}(P)$.

1. A safe query with a $k$-attribute result variable returns at most $\lvert \text{dom}(P) \rvert^{k}$ tuples, and its answer does not change when the domain of possible values grows beyond $\text{dom}(P)$.
2. $\{t \mid \neg(t \in R)\}$ is unsafe. Over a finite domain $D$ that contains the values of $R$ it returns $\lvert D \rvert^{k} - \lvert R \rvert$ tuples, which grows with $D$, and over an infinite domain infinitely many.
3. A formula $t \in R \wedge \varphi$ is safe, and so is $\exists r \in R\,(t.A_1 = r.A_1 \wedge \dots \wedge t.A_k = r.A_k) \wedge \varphi$, which copies every attribute of $t$ from a stored tuple. A negation inside $\varphi$ is harmless, but an unanchored disjunct or a bare $\forall$ breaks safety: $\{t \mid t \in R \vee \neg(t \in S)\}$ is unsafe, and so is $\{t \mid \forall s \in R\,(t.A = s.A)\}$, which returns every value when $R$ is empty.
4. No safe query computes $\lvert R \rvert$ as a value, so counting needs an operator outside the calculus and the algebra.

**Proof.** (1) Each of the $k$ attributes of a result tuple takes one of $\lvert \text{dom}(P) \rvert$ values, which bounds the number of tuples. Bound variables range over stored tuples, so the truth of $P(t)$ depends only on $t$ and the database. Over a domain $D \supseteq \text{dom}(P)$ the answer is $\{t \in D^{k} : P(t)\}$, and safety confines it to $\text{dom}(P)^{k}$. So it equals $\{t \in \text{dom}(P)^{k} : P(t)\}$ for every such $D$.

(2) Every $t \in D^{k}$ satisfies $\neg(t \in R)$ except the $\lvert R \rvert$ tuples of $R$, which lie in $D^{k}$ because $D$ contains their values.

(3) Under $t \in R$ every result tuple is a stored tuple, and under the equalities every value of $t$ is copied from one, so all values lie in $\text{dom}(P)$ whatever $\varphi$ says. In $t \in R \vee \neg(t \in S)$ the second disjunct alone is satisfied by every tuple outside $S$, as in (2). In the $\forall$ query with $R$ empty, the quantifier is vacuously true by the previous section, so every $t$ qualifies.

(4) Suppose a safe query returned $\{(\lvert R \rvert)\}$ on every database. Take a database in which $R$ holds strings and has more tuples than any number written in the query. Then $\lvert R \rvert$ is neither stored nor a constant, so the result value lies outside $\text{dom}(P)$, which safety forbids. Safe tuple calculus, safe domain calculus and the algebra are equally expressive (Codd's theorem), so the algebra cannot count either. Aho and Ullman (1979) showed that it also cannot express the transitive closure of a binary relation.

**GATE use.** MCQs list calculus expressions and ask which is unsafe; the answer is the one whose result variable is constrained only negatively. The traps are calling $\{t \mid t \in R \wedge \neg(t \in S)\}$ unsafe because it contains a negation (it is a difference), and missing that $\forall$ over an empty relation is true. MSQs on expressive power expect: safe calculus equals the algebra, and neither expresses aggregation or transitive closure.

**Check.** With $R = \{(0, 1), (1, 0)\}$ and $S = \{(1, 0)\}$, a script evaluated each query over the domains $\{0, \dots, d - 1\}$ for $d = 2, \dots, 7$. $\{t \mid \neg(t \in R)\}$ returned $d^2 - 2$ tuples: 2, 7, 14, 23, 34 and 47. $\{t \mid t \in R \vee \neg(t \in S)\}$ returned $d^2$. The safe queries $\{t \mid t \in R \wedge \neg(t \in S)\}$ and $\{t \mid \exists s \in R\,(t.A = s.A)\}$ returned 1 and 2 tuples on every domain, with all values in $\text{dom}(P)$. $\{t \mid \forall s \in R\,(t.A = s.A)\}$ returned all $d$ values when $R$ was empty, and only $\{4\}$ when $R = \{(4, 0), (4, 1)\}$.

## Restricted quantifiers, negated existentials and evaluating a calculus query
<!-- topics: db-er-relational.trc, db-er-relational.query-equivalence -->

**Claim.** Let an unrestricted tuple variable range over the set $U$ of all tuples of the right arity over the domain, and assume $U$ contains a tuple outside $R$ (true for any infinite domain, and for any finite domain larger than the stored values).

1. $\exists s \in R\,(P) \equiv \exists s\,(s \in R \wedge P)$ and $\forall s \in R\,(P) \equiv \forall s\,(s \in R \Rightarrow P)$.
2. $\forall s\,(s \in R \wedge P)$ is false and $\exists s\,(s \in R \Rightarrow P)$ is true, whatever $P$ and $R$ are.
3. $\{t \mid t \in R \wedge \neg\exists s \in R\,(s.A > t.A)\}$ is the set of tuples of $R$ whose $A$ equals $\max \pi_A(R)$, ties included. Adding $s.G = t.G$ inside the quantifier gives the tuples holding the maximum of their group $G$.
4. $\{t \mid t \in R \wedge \forall s \in R\,(\varphi(s) \Rightarrow t.A > s.A)\}$ keeps the tuples whose $A$ exceeds every $A$ among the tuples satisfying $\varphi$; when no tuple satisfies $\varphi$ it returns all of $R$.

**Proof.** (1) The bounded $\exists s \in R$ asks for some $s$ with $s \in R$ and $P(s)$, which is the unrestricted $\exists$ over $U$ of the conjunction. The bounded $\forall s \in R$ asks $P(s)$ of every $s \in R$; over $U$ this is "for every $s$, if $s \in R$ then $P(s)$", and for $s \notin R$ the implication is true, so the extra tuples impose nothing.

(2) Pick $u \in U$ with $u \notin R$. The conjunction $u \in R \wedge P(u)$ is false, so the $\forall$ fails at $u$. The implication $u \in R \Rightarrow P(u)$ has a false premise, so it is true and $u$ witnesses the $\exists$.

(3) A tuple $t \in R$ survives exactly when no $s \in R$ has $s.A > t.A$, that is, when $t.A \ge s.A$ for every $s \in R$, which says $t.A = \max \pi_A(R)$. Two tuples with the same maximal $A$ both survive, since neither is strictly greater. With $s.G = t.G$ added, only tuples of $t$'s own group can disqualify it, so the maximum is taken per group. This is the calculus form of the algebra expression $\pi_K(R) - \pi_{R1.K}(\sigma_{R1.A < R2.A}(\rho_{R1}(R) \times \rho_{R2}(R)))$: the subtracted part is the set of tuples that some tuple beats.

(4) By (1) the condition is checked only on the tuples with $\varphi(s)$ true; the others satisfy the implication through a false premise. So $t$ qualifies exactly when $t.A > s.A$ for each such $s$, and when there is none the $\forall$ is vacuously true for every $t \in R$.

**GATE use.** MCQs and MSQs list calculus expressions and ask which match an English query or each other: "every" pairs $\forall$ with $\Rightarrow$, "some" pairs $\exists$ with $\wedge$, and "highest" or "nobody earns more" is $\neg\exists$ with a strict comparison. NAT questions evaluate such a query on a small table. The traps are reading $\Rightarrow$ as $\wedge$, which empties the answer, letting a tie pass a strict $>$, and forgetting that an empty qualifying set makes the $\forall$ true for everyone.

**Check.** On Emp(eid, dept, sal) $= \{(1,1,50), (2,1,70), (3,2,60), (4,2,40), (5,3,80), (6,3,60)\}$ a script evaluated $\{t \mid t \in \text{Emp} \wedge \forall s \in \text{Emp}\,(s.dept = 2 \Rightarrow t.sal > s.sal)\}$ and got eids 2 and 5: the dept-2 salaries are 60 and 40, and eids 3 and 6 tie at 60. With $\ge$ it returned 2, 3, 5 and 6; with $\wedge$ for $\Rightarrow$ it returned nothing; with $\exists$ for $\forall$ it returned 1, 2, 3, 5 and 6. The per-department maximum form returned eids 2, 3 and 5, and the global maximum form eid 5. For (1) and (2) it enumerated all 256 pairs $R, S \subseteq \{0,1\}^2$ with unrestricted variables over $\{0,1,2\}^2$, comparing each form with $\{t \mid t \in R \wedge \forall s \in S\,(s.B > t.B)\}$. The forms with $\neg\exists s \in S\,(s.B \le t.B)$ and $\forall s\,(s \in S \Rightarrow s.B > t.B)$ matched on all 256. $\forall s\,(s \in S \wedge s.B > t.B)$ returned $\varnothing$ every time, wrong on the 51 instances where the true answer is non-empty, and $\exists s\,(s \in S \Rightarrow s.B > t.B)$ returned all of $R$ every time.
