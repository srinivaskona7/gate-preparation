# SQL and integrity constraints: derivations

## Three-valued logic: the truth tables and the TRUE-only filter
<!-- topics: db-sql-constraints.null-logic, db-sql-constraints.select-evaluation -->

**Claim.** An SQL condition takes one of three truth values, TRUE, UNKNOWN and FALSE, written T, U and F below and encoded as $1$, $\tfrac12$ and $0$. AND, OR and NOT are
$$p \wedge q = \min(p, q), \qquad p \vee q = \max(p, q), \qquad \neg p = 1 - p,$$
which gives the tables below, with $p$ down the side and $q$ across the top, and NOT T = F, NOT U = U, NOT F = T.

| AND | T | U | F |
|---|---|---|---|
| **T** | T | U | F |
| **U** | U | U | F |
| **F** | F | F | F |

| OR | T | U | F |
|---|---|---|---|
| **T** | T | T | T |
| **U** | T | U | U |
| **F** | T | U | F |

1. A comparison $x \mathbin{\theta} y$, for $\theta$ among $=, \ne, <, \le, >, \ge$, is U whenever $x$ or $y$ is NULL, so `NULL = NULL` and `NULL <> NULL` are both U. `x IS NULL` and `x IS NOT NULL` are never U.
2. Each table entry is the value on which both readings of U, as T and as F, agree, and U where they disagree. These are Kleene's strong three-valued tables.
3. Commutativity, associativity, both distributive laws, both absorption laws, double negation and De Morgan's laws hold for all three values. The excluded middle fails: for $p = \text{U}$, both $p \vee \neg p$ and $p \wedge \neg p$ are U.
4. The tables are sound but not complete. A completion of a row replaces each of its NULLs by an ordinary value. A condition built from comparisons with AND, OR and NOT that is T on a row is T under every completion, and likewise for F; but a condition can be U although every completion makes it T.
5. WHERE, ON and HAVING keep a row only when the condition is T. So if $n_T$, $n_F$ and $n_U$ count the rows of a table $R$ on which a condition $p$ is T, F and U, then `WHERE p` returns $n_T$ rows, `WHERE NOT p` returns $n_F$, and
$$n_T + n_F + n_U = \lvert R \rvert,$$
so the two queries together return all of $R$ only when no row makes $p$ U.
6. A CHECK constraint rejects a row only when its condition is F, so it accepts a row on which the condition is U.

**Proof.** (1) A NULL marks a missing or unknown value, and the SQL standard defines every comparison with a NULL operand to be U. IS NULL tests for the marker itself, which is either present or absent.

(2) Read U as "T or F, not known which", and try both readings. F AND U reads as F AND T or F AND F, both F. T AND U reads as T or F, so it is U, and U AND U can be T AND T or F AND F, so it is U too. Under the encoding these entries are $\min(0, \tfrac12) = 0$, $\min(1, \tfrac12) = \tfrac12$ and $\min(\tfrac12, \tfrac12) = \tfrac12$, and on $\{0, 1\}$ the two-valued AND is min. OR is the mirror image with max. NOT U reads as F or T, so it is U, and $1 - \tfrac12 = \tfrac12$.

(3) The three values form the chain $0 < \tfrac12 < 1$. On a chain, min and max are commutative and associative, each distributes over the other (sort $q$ and $r$, then compare $p$ with both), and $\min(p, \max(p, q)) = \max(p, \min(p, q)) = p$. The map $x \mapsto 1 - x$ reverses the order, so $1 - \min(p, q) = \max(1 - p, 1 - q)$ and $1 - \max(p, q) = \min(1 - p, 1 - q)$, which are De Morgan's laws, and $1 - (1 - p) = p$. For $p = \tfrac12$, $\max(p, 1 - p) = \min(p, 1 - p) = \tfrac12$.

(4) Induction on the condition. A comparison without a NULL operand has the same value under every completion, and one with a NULL operand is U, so it claims nothing. If $\neg p$ is T or F, then $p$ is F or T, which by hypothesis holds under every completion, and so does its negation. If $p \wedge q$ is T, then $\min(p, q) = 1$ forces both operands to be T, and both stay T under every completion. If it is F, one operand is F and stays F. OR is dual. Completeness fails for `b < 3 OR b >= 3` with $b$ NULL: both comparisons are U, so the disjunction is U, yet every completion makes one of them T. The tables evaluate the two occurrences of $b$ separately and lose the fact that they hold the same value.

(5) Each row gives $p$ exactly one of the three values, and $\neg p$ is T exactly when $p$ is F, since $1 - x = 1$ only for $x = 0$. So the rows split into three parts. `WHERE p` returns the first, `WHERE NOT p` the second, and the U rows appear in neither.

(6) The standard makes a CHECK constraint satisfied when its condition is not F for any row, and U is not F.

**GATE use.** The null-traps and query-output-count types: replace each comparison that involves a NULL by U, combine with the tables, and count only the T rows. The traps are expecting NOT to bring back the U rows, treating `dept <> 'CS'` as T for a NULL dept, and testing with `= NULL`, which is never T. Another is forgetting that ON and HAVING filter like WHERE while CHECK does the opposite, so `CHECK (age >= 18)` accepts a NULL age.

**Check.** On the chapter's table (6, 2), (6, NULL), (4, NULL), (NULL, 1), (NULL, 5), (7, 4), the condition `a > 5 AND b < 3` is T, U, F, U, F, F. So `WHERE NOT (a > 5 AND b < 3)` returns (4, NULL), (NULL, 5) and (7, 4), 3 rows, and $1 + 3 + 2 = 6$. On the same table `b < 3 OR b >= 3` keeps only the 4 rows with a non-NULL $b$. For Student (1, CS), (2, NULL), (3, NULL), `dept = NULL` and `dept <> 'CS'` both count 0 rows, while `dept IS NULL` and `dept <> 'CS' OR dept IS NULL` count 2. A script compared SQLite's AND, OR and NOT on all 9 pairs with min, max and $1 - x$, and with the agreement of the two readings of U. It confirmed the laws of (3) on all 27 triples and the failure of the excluded middle. On 1500 random conditions over rows with NULLs it confirmed soundness, and found 28 conditions that were U although every completion agreed. It ran the counts above in SQLite and PostgreSQL. It also checked that `CHECK (age >= 18)` rejects 17 and accepts 18 and NULL. A self join of Student on dept returned 1 row, because the NULLs match nothing, not even each other, and a HAVING comparison with a NULL aggregate kept no group.

## The bag semantics of SELECT and the size of its result
<!-- topics: db-sql-constraints.select-evaluation, db-sql-constraints.sql-joins -->

**Claim.** Tables and query results are bags: a row may occur several times, and every occurrence counts.

1. A query is evaluated, logically, in the order FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY. A column alias defined in SELECT is therefore unknown to WHERE, GROUP BY and HAVING, but ORDER BY can use it, and no aggregate can appear in WHERE.
2. `SELECT L FROM T1, ..., Tk WHERE p`, with no grouping, returns one row for each combination $(t_1, \dots, t_k)$ of row occurrences, $t_i$ from $T_i$, on which $p$ is T. So $0 \le \lvert \text{result} \rvert \le \prod_i \lvert T_i \rvert$, and `FROM A, B WHERE θ` returns the same bag as `A JOIN B ON θ`.
3. For an equijoin of $A$ and $B$ on columns $x$ and $y$, let $a_v$ and $b_v$ count the rows of $A$ with $x = v$ and the rows of $B$ with $y = v$. Then
$$\lvert A \;\text{JOIN}\; B \;\text{ON}\; A.x = B.y \rvert = \sum_{v \ne \text{NULL}} a_v\, b_v.$$
If $y$ is a key of $B$ and $x$ a foreign key referencing it, the join has one row per row of $A$ whose $x$ is not NULL.
4. `SELECT DISTINCT L` keeps one row per distinct value of $L$, and here two NULLs count as equal, so all the rows whose $L$ is NULL give a single row. `COUNT(DISTINCT x)` skips the NULLs instead.

**Proof.** (1) In the SQL standard each clause is defined on the table that the clause before it produces. FROM builds a table, WHERE filters its rows, GROUP BY partitions them and HAVING filters the groups. Only then does SELECT compute its expressions, once per row or group. A name that SELECT introduces does not exist while WHERE, GROUP BY or HAVING is evaluated, while ORDER BY sorts the finished result, whose columns carry the aliases. An aggregate summarises a set of rows, and no such set exists while WHERE examines one row at a time. An optimiser may execute the clauses in another order, but only when the result is the same.

(2) FROM with several tables forms their Cartesian product, one row for each choice of an occurrence from every table, so $\prod_i \lvert T_i \rvert$ rows by the multiplication principle. WHERE keeps the rows on which $p$ is T, by the previous section, and SELECT without DISTINCT maps each kept row to one output row, so the count is unchanged. The standard defines `A JOIN B ON θ` as the rows of the product of $A$ and $B$ on which $\theta$ is T, which is the same bag.

(3) By (2), count the pairs $(r, s)$ on which `r.x = s.y` is T. The comparison is T only when both values are non-NULL and equal, so the pairs fall into classes by their common value $v$, and class $v$ holds $a_v b_v$ pairs. If $y$ is a key, $b_v \le 1$, and the foreign key makes $b_v = 1$ for every non-NULL $v$ that occurs in $A$. The sum becomes $\sum_{v \ne \text{NULL}} a_v$, the number of rows of $A$ whose $x$ is not NULL.

(4) Duplicate elimination compares rows with "is not distinct from", under which NULL is not distinct from NULL. That relation is reflexive, symmetric and transitive, so it partitions the rows, and DISTINCT keeps one row per class. `COUNT(DISTINCT x)` first discards the NULLs, as every aggregate except `COUNT(*)` does, then counts the distinct values that remain.

**GATE use.** The query-output-count type: form the product or join, keep the T rows, project and count, keeping duplicates. A self join `FROM Emp e JOIN Emp m ON e.mgr = m.eid` returns one row per employee who has a manager, so the top manager, whose mgr is NULL, disappears unless the join is a LEFT JOIN. The traps are removing duplicates that SELECT keeps and pairing NULL join values. In MCQs on clause order, another is allowing a SELECT alias in WHERE. SQLite accepts such an alias as an extension, so it cannot settle that question.

**Check.** With $A.x$ holding 1, 1, 2 and $B.x$ holding 1, 2, 2, NULL, NULL, the product has 15 rows. `WHERE A.x = B.x` keeps $2 \cdot 1 + 1 \cdot 2 = 4$ of them, the same bag as the inner join, and `SELECT DISTINCT A.x` over them gives 2 rows. `SELECT DISTINCT x FROM B` gives 3 rows, one of them NULL, while `COUNT(DISTINCT x)` is 2. On Emp (1, NULL), (2, 1), (3, 1), (4, 2), the self join returns 3 rows and the LEFT JOIN 4. A script ran these in SQLite. On 300 random bag instances with NULLs it checked that the WHERE form and the JOIN form give the same bag, equal to one row per product combination on which the condition is T in the three-valued model. It also checked that DISTINCT keeps one row per value with NULLs equal. On 300 random parent and child tables, the join on the foreign key had one row per non-NULL foreign key, and a dangling value was refused. PostgreSQL refused a SELECT alias in WHERE and accepted it in ORDER BY, and both systems refused an aggregate in WHERE.

## Aggregates over NULLs: COUNT, SUM and AVG
<!-- topics: db-sql-constraints.aggregates-null -->

**Claim.** Let a column $c$ have $n$ rows, $k$ of which hold non-NULL values, with sum $S$.

1. $\text{COUNT}(*) = n$ and $\text{COUNT}(c) = k$, and `COUNT(DISTINCT c)` is the number of distinct non-NULL values, so $\text{COUNT}(\text{DISTINCT } c) \le \text{COUNT}(c) \le \text{COUNT}(*)$. SUM, AVG, MIN and MAX are computed over the $k$ non-NULL values. When $k = 0$, as on an empty input or an all-NULL column, `COUNT(c)` and `COUNT(DISTINCT c)` are 0 and SUM, AVG, MIN and MAX are NULL.
2. For $k \ge 1$,
$$\text{AVG}(c) = \frac{\text{SUM}(c)}{\text{COUNT}(c)} = \frac{S}{k},$$
and with exact division AVG(c) differs from $\text{SUM}(c) / \text{COUNT}(*)$ exactly when
$$1 \le k < n \quad\text{and}\quad S \ne 0.$$
With $k = 0$ both are NULL. For $k \ge 1$, $S = 0$ makes both 0, and $k = n$ makes them the same quotient.
3. `AVG(COALESCE(c, 0))` is $S/n$ on every non-empty input. It equals $\text{SUM}(c) / \text{COUNT}(*)$ computed with exact division, except that it gives 0 where that quotient is NULL.
4. Arithmetic with a NULL operand gives NULL, so `SUM(c + d)` adds only the rows where both values are non-NULL. When SUM(c), SUM(d) and SUM(c + d) are all non-NULL,
$$\text{SUM}(c) + \text{SUM}(d) - \text{SUM}(c + d) = \sum_{\text{only } d \text{ NULL}} c \;+\; \sum_{\text{only } c \text{ NULL}} d.$$

**Proof.** (1) The SQL standard evaluates every aggregate except `COUNT(*)` by first eliminating the NULLs from its argument values, then applying the function to the bag that remains, with duplicates removed first for DISTINCT. `COUNT(*)` has no argument and counts rows. Removing duplicates cannot add values and removing NULLs cannot add rows, which gives the inequalities. A sum, average, minimum or maximum of an empty bag is undefined, and the standard returns NULL for it, while the count of an empty bag is 0.

(2) For $k \ge 1$, AVG is $S/k$ by (1), and the other quotient is $S/n$. Since $n \ge k \ge 1$,
$$\frac{S}{k} = \frac{S}{n} \iff Sn = Sk \iff S(n - k) = 0 \iff S = 0 \ \text{or}\ k = n,$$
so the two differ exactly when $S \ne 0$ and $k < n$. For $k = 0$, SUM(c) is NULL, so $\text{SUM}(c) / \text{COUNT}(*)$ is NULL too, and AVG is NULL by (1).

(3) `COALESCE(c, 0)` replaces every NULL by 0, so the argument has $n$ non-NULL values with the same sum $S$, and AVG gives $S/n$. For $k = 0$ that is 0, while SUM(c) is NULL.

(4) $c + d$ is non-NULL exactly on the rows where both values are, so SUM(c + d) is the sum of $c + d$ over those rows. SUM(c) is the sum of $c$ over the same rows plus the rows where only $d$ is NULL, and SUM(d) likewise with the roles swapped. Subtracting, the terms over the rows where both are non-NULL cancel.

**GATE use.** The null-traps type asks for `COUNT(*)`, `COUNT(c)` and `AVG(c)` on a table with NULLs. The traps are dividing by `COUNT(*)` instead of `COUNT(c)`, counting NULLs in `COUNT(c)`, and expecting the SUM of no values to be 0. The statement "`AVG(c)` differs from `SUM(c) / COUNT(*)` whenever c has a NULL" is false: an all-NULL column, or non-NULL values that sum to 0, make the two equal. On an INTEGER column, `SUM(c) / COUNT(*)` is integer division in SQLite and PostgreSQL, so 190 / 6 gives 31, not 31.67.

**Check.** The chapter's salaries 50, NULL, 40, 40, NULL, 60 give $\text{COUNT}(*) = 6$, $\text{COUNT}(\text{salary}) = 4$ and AVG = 190 / 4 = 47.5, while $190/6 \approx 31.67$, which is also `AVG(COALESCE(salary, 0))`. `COUNT(DISTINCT salary)` is 3, MIN is 40 and MAX is 60. AVG and $\text{SUM}/\text{COUNT}(*)$ give 0 and 0 on {NULL, 3, −3}, 0 and 0 on {NULL, 0}, NULL and NULL on {NULL, NULL}, 6 and 6 on {5, 7}, and 4 and 2 on {NULL, 4}. A script ran these in SQLite, and the chapter's numbers, with the integer quotient 31, in PostgreSQL too. On 1500 random columns it confirmed (1), the exact condition of (2) and (3), and (4) whenever its three sums were non-NULL. An empty table gave 0, 0 and four NULLs.

## GROUP BY and HAVING: groups, validity and the empty input
<!-- topics: db-sql-constraints.group-by-having, db-sql-constraints.select-evaluation -->

**Claim.** Let $G$ be the grouping columns, applied to the rows that WHERE keeps.

1. GROUP BY $G$ partitions those rows into groups, one per distinct value of $G$, with two NULLs counted as equal. With a single grouping column, all the rows whose value is NULL form one group.
2. Each group yields one row, and HAVING keeps it when its condition is T for the group. So the query returns as many rows as there are groups on which HAVING is T.
3. A query is valid when every expression of SELECT and HAVING outside an aggregate is functionally determined by $G$. SQL-92 requires a grouping column there. SQL:1999 also accepts a column that the grouping columns determine, such as any column of a table grouped by its primary key. No aggregate may appear in WHERE.
4. A condition that uses only grouping columns, and no aggregate, gives the same result in WHERE as in HAVING. A condition on other columns cannot be moved: `WHERE v > 1` and `HAVING MAX(v) > 1` give different results in general.
5. Without GROUP BY, a query with an aggregate treats its whole input as one group and returns exactly one row, even on an empty input, unless HAVING rejects it. With GROUP BY, an empty input has no groups and returns no rows.

**Proof.** (1) Grouping uses the same "not distinct" comparison as DISTINCT, under which NULL is not distinct from NULL. It is an equivalence relation, so its classes partition the rows, one class per distinct value of $G$, and the NULLs share a class.

(2) The standard defines HAVING as a filter on the grouped table, which has one row per group, and it keeps the T rows as WHERE does.

(3) Each group produces one row, so every SELECT expression needs a single value per group. An aggregate has one by construction. A column outside $G$ can take two values within a group, as two employees of one department can have different names. Its value is then undefined unless $G$ determines the column, which is what a functional dependency from $G$ to it guarantees. WHERE runs on single rows before any group exists, so there is no set for an aggregate to summarise.

(4) Let $h$ use only columns of $G$. The rows of a group agree on $G$, being equal or both NULL, so $h$ has the same value on all of them. `WHERE h` therefore keeps or removes each group whole, and the kept groups have the aggregates they would have without the filter. `HAVING h` keeps exactly the groups on which $h$ is T, with the same aggregates. A condition on a column outside $G$ can remove part of a group in WHERE, which changes that group's aggregates, so moving it changes the result.

(5) When a query has an aggregate or HAVING but no GROUP BY, the standard treats its input as one group. That group exists even when the input has no rows, so COUNT gives 0 and SUM gives NULL there. With GROUP BY, every group is formed from at least one row, so an empty input has none.

**GATE use.** The group-having-output type gives a table with NULLs and a GROUP BY and HAVING query. Form the groups after WHERE, count each group's rows and non-NULL values, then test HAVING on each group. The traps are forgetting the NULL group, applying HAVING row by row, and expecting a group for a value that WHERE removed. `WHERE dept <> 'EE'` removes the NULL group too, because the comparison is U there. For validity MCQs, check each non-aggregated SELECT column against the grouping columns and look for an aggregate in WHERE. SQLite accepts a bare non-grouped column, which standard SQL rejects.

**Check.** In the chapter's Emp, the (dept, salary) pairs are (CS, 50), (CS, NULL), (EE, 40), (NULL, 40), (EE, NULL) and (CS, 60). The groups are NULL with 1 row and 1 salary, CS with 3 and 2, and EE with 2 and 1. `HAVING COUNT(salary) < 2` returns (NULL, 1) and (EE, 2), 2 rows. `HAVING AVG(salary) > 45` returns (CS, 3) though the SELECT list shows no average, and `SELECT COUNT(*) FROM Emp GROUP BY dept` returns 1, 2 and 3. `WHERE salary IS NOT NULL` gives (NULL, 1), (CS, 2) and (EE, 1), and `WHERE dept <> 'EE'` gives only (CS, 3). On an empty table, `SELECT COUNT(*), SUM(salary)` returns the one row (0, NULL), while adding GROUP BY, or `HAVING COUNT(*) > 0`, returns nothing. A script ran these in SQLite. In PostgreSQL, the chapter's validity question accepted the HAVING query and the query without the grouping column. It rejected the bare name, which "must appear in the GROUP BY clause or be used in an aggregate function", and the aggregate in WHERE, since "aggregate functions are not allowed in WHERE". Grouped by the primary key eid, the name was accepted. On 400 random tables the script checked the partition with NULLs equal and the HAVING count. Four grouping-column conditions gave the same result in WHERE and HAVING, while `WHERE v > 1` and `HAVING MAX(v) > 1` differed on 187 tables.

## Outer joins: the LEFT JOIN count and ON versus WHERE
<!-- topics: db-sql-constraints.sql-joins -->

**Claim.** For tables $R$ and $S$ and an ON condition $\theta$, let $m_r$ be the number of rows $s$ of $S$ on which $\theta(r, s)$ is T, and $u$ the number of rows $r$ of $R$ with $m_r = 0$.

1. The left join has
$$\lvert R \;\text{LEFT JOIN}\; S \;\text{ON}\; \theta \rvert = \sum_{r \in R} \max(1, m_r) = \lvert R \;\text{JOIN}\; S \;\text{ON}\; \theta \rvert + u$$
rows, and $\lvert R \rvert \le \lvert R \;\text{LEFT JOIN}\; S \rvert \le \lvert R \rvert \cdot \max(1, \lvert S \rvert)$, with both bounds attained.
2. A FULL JOIN also keeps the unmatched rows of $S$. It has $\lvert R \;\text{JOIN}\; S \rvert + u_R + u_S$ rows, where $u_R = u$ and $u_S$ counts the rows of $S$ that match no row of $R$.
3. Let $c$ be a condition on the columns of $S$ that is not T when they are all NULL, such as `d.city = 'Pune'`. Then `R LEFT JOIN S ON θ WHERE c` returns the inner join `R JOIN S ON θ AND c`. `R LEFT JOIN S ON θ AND c` returns, by (1), that inner join plus one padded row for each of the $u'$ rows of $R$ that match nothing under $\theta \wedge c$.
4. A condition on the columns of $R$ alone, written in ON, never removes a row of $R$; the rows that fail it are padded.
5. NATURAL JOIN equates every pair of same-named columns, so adding a column whose name the other table also has changes the join condition. `USING (col)` fixes the join columns.

**Proof.** (1) Following the standard's definition, as in Elmasri and Navathe, the left outer join is the inner join together with every row of $R$ that matches nothing, padded with NULL in the columns of $S$. A row $r$ with $m_r \ge 1$ contributes its $m_r$ inner-join rows and no padded row, and a row with $m_r = 0$ contributes one padded row, so $r$ contributes $\max(1, m_r)$. Summing, $\sum_r m_r$ is the size of the inner join by the count of the second section, and the padded rows number $u$. The bounds follow from $1 \le \max(1, m_r) \le \max(1, \lvert S \rvert)$. An ON condition that is never T gives $\lvert R \rvert$ rows, and one that is always T gives $\lvert R \rvert \cdot \max(1, \lvert S \rvert)$.

(2) The full join also pads each row of $S$ that matches nothing, once.

(3) In the left join, a padded row has every column of $S$ NULL, so $c$ is not T on it and WHERE removes it. An unpadded row $(r, s)$ already has $\theta$ T and survives exactly when $c$ is T. The rows left are the pairs on which $\theta \wedge c$ is T, which is the inner join on $\theta \wedge c$. With $c$ inside ON, apply (1) to the condition $\theta \wedge c$.

(4) By (1), each row of $R$ contributes at least one row, whatever the ON condition says.

(5) The natural join's condition is the conjunction of the equalities over all shared column names, so it depends on the names, and a new shared name adds a conjunct.

**GATE use.** The outer-join-count type: pair the rows with the whole ON condition, add one padded row for each unmatched row of the preserved side, then apply WHERE. The trap is moving a filter from ON to WHERE and expecting the same count. When the filter rejects NULLs, the outer join becomes an inner join. A filter that accepts NULLs, such as `d.city = 'Pune' OR d.city IS NULL`, matches neither form, because a row that matched a Delhi department was never padded. A matched row of $R$ appears $m_r$ times, not once.

**Check.** In the chapter's question, Emp (1, 10), (2, 20), (3, 30), (4, NULL) is left-joined with Dept (10, Pune), (20, Delhi), (40, Pune). With `d.city = 'Pune'` in ON, only employee 1 matches and employees 2, 3 and 4 are padded, $1 + 3 = 4$ rows. With it in WHERE, the join rows (1, Pune), (2, Delhi), (3, NULL), (4, NULL) are filtered down to 1. The NULL-accepting filter keeps 3 rows. `ON e.did = d.did AND e.eid < 2` keeps all four employees and pads employee 2 along with 3 and 4, and the FULL JOIN on did has $2 + 2 + 1 = 5$ rows. E(eid, did, name) natural-joined with D(did, dname) gives 3 rows, and 0 once dname is renamed to name, while `USING (did)` still gives 3. A script ran these in SQLite, and the chapter's question in PostgreSQL too. On 500 random bag pairs with NULLs it checked (1), with the bounds attained by `ON 1 = 0` and `ON 1 = 1`, and (2), (3) and (4).

## IN, NOT IN, ANY and ALL as quantifiers
<!-- topics: db-sql-constraints.in-exists-any-all, db-sql-constraints.subqueries -->

**Claim.** Let a subquery return the values $s_1, \dots, s_k$, as a bag, and let $\theta$ be a comparison.

1. `x θ ANY (S)` is the disjunction $(x \mathbin{\theta} s_1) \vee \dots \vee (x \mathbin{\theta} s_k)$, which is F for $k = 0$. `x θ ALL (S)` is the conjunction, which is T for $k = 0$. IN is `= ANY` and NOT IN is `<> ALL`:
$$x \;\text{NOT IN}\; (s_1, \dots, s_k) \;\equiv\; (x \ne s_1) \wedge \dots \wedge (x \ne s_k).$$
More generally, `NOT (x θ ANY (S))` has the value of `x θ' ALL (S)`, and `NOT (x θ ALL (S))` that of `x θ' ANY (S)`, where θ' is the complement of θ. For example, `NOT (x > ANY (S))` is `x <= ALL (S)`.
2. So `x NOT IN (S)` is (a) T when $S$ is empty, whatever $x$ is; (b) U when $x$ is NULL and $S$ is not empty; (c) F when $x$ equals a non-NULL member of $S$; (d) otherwise U, if $S$ has a NULL member; and (e) otherwise T. `x IN (S)` is its negation: T in case (c), F in (a) and (e), U in (b) and (d). In particular, when $S$ holds a NULL, `WHERE x NOT IN (S)` keeps no row.
3. `EXISTS (S)` is T when $k \ge 1$ and F when $k = 0$, never U. So `NOT EXISTS (SELECT * FROM S WHERE S.b = x)` keeps $x$ exactly when no comparison $s_i = x$ is T: in cases (a), (b), (d) and (e), a NULL $x$ included.
4. As WHERE filters, `x > ANY (S)` and `x > (SELECT MIN(b) FROM S)` keep the same rows for every $S$. `x > ALL (S)` and `x > (SELECT MAX(b) FROM S)` keep the same rows when $S$ is non-empty and NULL-free. They differ exactly when $S$ is empty, where ALL keeps every row and the MAX form none, or when $S$ holds a NULL and at least one non-NULL value and $x$ is non-NULL and exceeds all its non-NULL values, where only the MAX form keeps the row. Under NOT the MIN form fails too: `NOT (x > ANY (S))` and `NOT (x > (SELECT MIN(b) FROM S))` keep different rows exactly when $S$ is empty, or $S$ holds a NULL and at least one non-NULL value and $x$ is non-NULL and at most each of its non-NULL values.

**Proof.** (1) The standard defines `x θ ALL (S)` to be T if $S$ is empty or $x \mathbin{\theta} s$ is T for every $s$ in $S$, F if it is F for some $s$, and U otherwise. Under the encoding of the first section that is the minimum of the values $x \mathbin{\theta} s_i$, with the empty minimum T: the iterated AND. Dually, ANY is the iterated OR, with the empty maximum F. IN is defined as `= ANY`, and NOT IN as the negation of IN. De Morgan's law, which holds in the three-valued logic, turns $\neg \bigvee_i (x = s_i)$ into $\bigwedge_i \neg(x = s_i)$. Each $\neg(x = s_i)$ has the same value as $x \ne s_i$, both U when a NULL is involved and complementary otherwise. The same steps with any $\theta$ give the complement rule, since $\neg(x \mathbin{\theta} s)$ and $x \mathbin{\theta'} s$ agree in the same way.

(2) Evaluate the conjunction of (1). (a) The empty conjunction is T. (b) A NULL $x$ makes every conjunct U, so their minimum is U. (c) If $x$ equals a non-NULL $s_i$, that conjunct is F, and so is the minimum. Otherwise $x$ is non-NULL and differs from every non-NULL member, so each conjunct is T, or U for a NULL member. The minimum is then (d) U if some member is NULL and (e) T if none is. The five cases are disjoint and cover every $x$ and $S$. With a NULL in $S$, every row falls in case (b), (c) or (d), none of which is T. IN is the negation, and $1 - x$ maps T, U and F to F, U and T.

(3) EXISTS asks only whether the subquery returns a row, which is a yes-or-no fact. The inner WHERE keeps a row of $S$ when `S.b = x` is T, so NOT EXISTS is T exactly when that comparison is T for no row. In cases (b) and (d) the comparisons involving a NULL are U, not T, so NOT EXISTS is T while NOT IN is U.

(4) MIN and MAX skip NULLs and return NULL when no value remains, and a comparison with NULL is U. `x > ANY (S)` is T exactly when $x > s_i$ is T for some non-NULL $s_i$, that is when $x$ is non-NULL and exceeds the smallest non-NULL member, which is when `x > MIN` is T. A filter keeps exactly the T rows, so the two keep the same rows. `x > ALL (S)` is T exactly when $S$ is empty, or every member is non-NULL and below $x$. `x > MAX` is T exactly when there is at least one non-NULL member and $x$ exceeds all of them. These differ precisely in the two cases stated. Under NOT, the difference between F and U matters as well. On an empty $S$, ANY is F, so its negation keeps every row, while `x > MIN` is U. When $S$ holds a NULL and $x$ is at most each non-NULL member, ANY is U while `x > MIN` is F.

**GATE use.** The subquery-semantics type: translate IN, NOT IN, ANY and ALL into OR and AND over the subquery's values, then settle the empty case, where ALL and NOT IN are T and ANY, IN and EXISTS are F. The first trap is trusting NOT IN when the subquery can return NULL, which empties the result. Another is believing that NOT IN with a NULL is always U. It is F when $x$ matches a non-NULL value, though WHERE keeps no row either way. NOT EXISTS, or `WHERE b IS NOT NULL` inside the subquery, avoids the trap. The MIN and MAX rewrites are safe only as plain filters, and for MAX only on a non-empty, NULL-free subquery.

**Check.** In the chapter's question R(a) holds 1, 2, 3, 4 and S(b) holds 2 and NULL. `a NOT IN (SELECT b FROM S)` is U, F, U, U, so the query returns no row. NOT EXISTS returns 1, 3 and 4, as does NOT IN over the subquery filtered with `b IS NOT NULL`. In the empty-subquery question, table T(x) holds 5 and 8 and S is empty. `x > ALL (S)` and `x NOT IN (S)` keep both rows, `x > ANY (S)` and `EXISTS (S)` keep none, and even a NULL $x$ passes ALL and NOT IN over the empty set. A script ran these in SQLite, and the ANY and ALL forms in PostgreSQL, since SQLite lacks them. It enumerated all 80 pairs of $x \in \{\text{NULL}, 1, 2, 3\}$ and bags $S$ of up to three values from {1, 2, NULL}. On them, SQLite's IN and NOT IN matched the five cases and the expansions of (1), and NOT EXISTS was never U. On the same bags PostgreSQL matched the OR and AND expansions for `=`, `<>`, `<` and `>` (320 triples) and the complement rule. It also matched the rewrites of (4): the MAX form differed from ALL in 14 cases, and the negated MIN form from the negated ANY in 14, exactly the cases stated.

## IN and EXISTS as semijoins: IN versus JOIN
<!-- topics: db-sql-constraints.in-exists-any-all, db-sql-constraints.subqueries -->

**Claim.** For tables $R(a, \dots)$ and $S(b)$, let $m_r$ be the number of rows $s$ of $S$ for which `r.a = s.b` is T.

1. `SELECT R.* FROM R WHERE a IN (SELECT b FROM S)` and `SELECT R.* FROM R WHERE EXISTS (SELECT * FROM S WHERE S.b = R.a)` return each row occurrence $r$ of $R$ once when $m_r \ge 1$ and not at all otherwise. So each returns $\#\{r : m_r \ge 1\}$ rows.
2. `SELECT R.* FROM R JOIN S ON R.a = S.b` returns each $r$ exactly $m_r$ times, $\sum_r m_r$ rows, never fewer than the IN form.
3. The two results are the same bag exactly when $m_r \le 1$ for every $r$, which a UNIQUE or key column $S.b$ guarantees.
4. `SELECT DISTINCT` over the join returns the IN result exactly when the rows of $R$ that IN keeps include no two equal rows.

**Proof.** (1) WHERE evaluates its condition once for each occurrence of $r$ and keeps or drops that occurrence, so no occurrence can appear twice. By the previous section, `r.a IN S` is T exactly when some comparison `r.a = s.b` is T, that is when $m_r \ge 1$. The EXISTS subquery for $r$ returns exactly the $m_r$ matching rows of $S$, so EXISTS is T exactly when $m_r \ge 1$.

(2) The join has one row per pair $(r, s)$ on which the condition is T, by the second section. A fixed $r$ is in $m_r$ such pairs, each projected to a copy of $r$.

(3) Compare the counts row by row: $r$ contributes $[m_r \ge 1]$ to the IN form and $m_r$ to the join. These are equal exactly when $m_r \le 1$. Every join term is at least the IN term, so the totals are equal only when every term is. A UNIQUE column holds each non-NULL value at most once, and a NULL never matches, so $m_r \le 1$.

(4) DISTINCT collapses the $m_r$ copies of each $r$ into one row. It also collapses two different occurrences of $R$ with equal values, which the IN form returns separately. So the two agree exactly when no two kept occurrences are equal, as when the selected columns include a key of $R$.

**GATE use.** MCQs ask whether an IN query can be rewritten as an inner join. The trap is assuming it always can, because the join repeats an outer row once per match. EXISTS is the faithful rewrite, and the join is safe only when the subquery column is unique. Adding DISTINCT to the join repairs the count only when $R$ itself holds no duplicate rows.

**Check.** In the chapter's question R(a) holds 1, 2, 3 and S(a) holds 1, 1, 2. The IN query returns 1 and 2, 2 rows, the join returns 1, 1 and 2, 3 rows, and EXISTS returns 2 rows. With R = {1, 1} and S = {1}, IN and the join both return 2 rows, but DISTINCT over the join returns 1. A script ran these in SQLite, and the chapter's question in PostgreSQL too. On 500 random instances with NULLs and duplicates, some with $S.b$ declared UNIQUE, it checked (1) to (4).

## Correlated subqueries and double NOT EXISTS
<!-- topics: db-sql-constraints.subqueries, db-sql-constraints.in-exists-any-all -->

**Claim.** A correlated subquery refers to a column of the outer query. It is evaluated, logically, once for each outer row, with that row's values substituted.

1. `SELECT name FROM Emp e WHERE salary > (SELECT AVG(salary) FROM Emp WHERE dept = e.dept)` returns the employees paid more than the average of their own department. It equals the join of Emp with the grouped table of (dept, AVG(salary)) on dept, filtered by salary above that average. An employee whose dept or salary is NULL is never returned.
2. A scalar subquery that returns no row gives NULL, and one that returns more than one row is a runtime error.
3. With Student(sid), Course(cid) and Enrolled(sid, cid), the double NOT EXISTS query below returns the students enrolled in every course. This is the division of Enrolled by Course, restricted to the students in Student. When Course is empty it returns every student.
4. Suppose Enrolled has the primary key (sid, cid) and foreign keys to Student and Course. Consider the counting form `SELECT sid FROM Enrolled GROUP BY sid HAVING COUNT(DISTINCT cid) = (SELECT COUNT(*) FROM Course)`. It returns the same students when Course is non-empty, and none when it is empty. Without the foreign key on cid it can return a student who misses a course.

```
SELECT s.sid FROM Student s WHERE NOT EXISTS (
  SELECT * FROM Course c WHERE NOT EXISTS (
    SELECT * FROM Enrolled e WHERE e.sid = s.sid AND e.cid = c.cid))
```

**Proof.** (1) The standard binds an outer reference in a subquery to the current row of the outer query, so the subquery is a function of that row. For an employee of department $d$, the inner WHERE keeps the rows with dept $d$, and AVG returns that department's average over its non-NULL salaries. Grouping Emp by dept computes the same average for every non-NULL $d$, and the join on dept attaches it to each employee of $d$. For a NULL dept, `dept = e.dept` is never T, so the subquery has no rows, AVG gives NULL, and the comparison with NULL is U. The join drops the same employee, because a NULL dept matches no group. A NULL salary makes the comparison U in both forms.

(2) The standard makes a scalar subquery without rows evaluate to NULL, and one with more rows raise a cardinality violation.

(3) Fix a student $s$. The innermost NOT EXISTS is T for a course $c$ exactly when no Enrolled row pairs $s$ with $c$. The middle subquery returns the courses with that property, and EXISTS is two-valued, so the outer NOT EXISTS is T exactly when
$$\neg \exists c \in \text{Course}\; \big( (s, c) \notin \text{Enrolled} \big) \;\equiv\; \forall c \in \text{Course}\; \big( (s, c) \in \text{Enrolled} \big).$$
This is the definition of division, as Elmasri and Navathe write it in SQL. A universal statement over an empty set is true, so every student qualifies when Course is empty.

(4) Let $C_s$ be the set of courses in $s$'s Enrolled rows. The primary key makes cid non-NULL, and the foreign key makes $C_s \subseteq \text{Course}$. So `COUNT(DISTINCT cid)` is $\lvert C_s \rvert$, and for finite sets $\lvert C_s \rvert = \lvert \text{Course} \rvert$ exactly when $C_s = \text{Course}$. The counting form returns the students who appear in Enrolled with $C_s = \text{Course}$. If Course is non-empty, $C_s = \text{Course}$ already implies an Enrolled row, and the foreign key on sid makes $s$ a student, so the two forms agree. If Course is empty, the foreign key leaves Enrolled empty, so there is no group and no row. Without the foreign key on cid, $C_s$ can include a course that does not exist, and so reach the right count without covering Course.

**GATE use.** The subquery-semantics type: fix one outer row, substitute its values, evaluate the inner query for it, and repeat. In the correlated-average question the traps are comparing with the company average and reading > as ≥. The double NOT EXISTS MCQ asks what the query returns: the students enrolled in every course. The traps are reading it as "at least one course" and overlooking the empty Course table, for which every student qualifies.

**Check.** In the chapter's question, the department averages are CS 50, EE 70 and ME 30. So only A, with 60 > 50, is returned: C, D, E and F equal their department's average, and B is below it. The company average 53.33 would give A, D and E, and ≥ would give A, C, D, E and F. A script ran this in SQLite and PostgreSQL. On 300 random tables with NULL departments and salaries it checked that the correlated query equals the join with the grouped table. An empty scalar subquery gave NULL in both systems. A two-row one raised "more than one row returned by a subquery used as an expression" in PostgreSQL, while SQLite took the first row. On 500 random schools, double NOT EXISTS returned exactly the students enrolled in every course. With the keys of (4), the counting form agreed whenever Course was non-empty; with Course empty, the first returned every student and the second none. Without the foreign key, take students 1 and 2, courses 1 and 2, and the enrolments (1, 1) and (1, 9). Double NOT EXISTS returned no student, and the counting form returned student 1. On the chapter's schema with enrolments (1, 1), (1, 2), (2, 1) and (3, 2), only student 1 qualified in both systems, and with Course emptied all three did.

## Set operations on bags
<!-- topics: db-sql-constraints.set-operations -->

**Claim.** Let the queries $A$ and $B$ be union-compatible: the same number of columns, with compatible types, matched by position, the result taking its column names from $A$. For a row value $v$, let $m$ and $n$ be its numbers of copies in $A$ and in $B$, where rows are compared with NULLs counted as equal.

1. The result holds
$$\text{UNION ALL}: m + n \qquad \text{INTERSECT ALL}: \min(m, n) \qquad \text{EXCEPT ALL}: \max(m - n,\, 0)$$
copies of $v$.
2. Without ALL the result is a set: $v$ appears once in UNION when $m + n > 0$, in INTERSECT when $m > 0$ and $n > 0$, and in EXCEPT when $m > 0$ and $n = 0$. So plain EXCEPT is not DISTINCT applied to EXCEPT ALL, which keeps $v$ whenever $m > n$.
3. Summing over $v$, $\lvert A \;\text{UNION ALL}\; B \rvert = \lvert A \rvert + \lvert B \rvert$, and
$$\lvert A \;\text{INTERSECT ALL}\; B \rvert + \lvert A \;\text{EXCEPT ALL}\; B \rvert = \lvert A \rvert.$$

**Proof.** Set operations decide whether two rows are duplicates with the same "not distinct" comparison as DISTINCT, so a NULL matches a NULL, whereas a join on = never pairs them.

(1) Number the copies, as in Silberschatz, Korth and Sudarshan's account of the multiset operations. Replace the $m$ copies of $v$ in $A$ by the distinct pairs $(v, 1), \dots, (v, m)$, and those in $B$ by $(v, 1), \dots, (v, n)$. Each bag becomes a set, and the ALL operations become set operations on the numbered rows. The pair $(v, i)$ lies in both numbered sets exactly when $i \le m$ and $i \le n$, that is $i \le \min(m, n)$, so INTERSECT ALL keeps $\min(m, n)$ copies. It lies in the first and not the second exactly when $n < i \le m$, which holds for $\max(m - n, 0)$ values of $i$. UNION ALL concatenates the bags, giving $m + n$.

(2) The plain forms remove duplicates from each operand first, which replaces $m$ and $n$ by the indicators $[m > 0]$ and $[n > 0]$, and their result is a set. INTERSECT then keeps $v$ when both indicators are 1, EXCEPT when the first is 1 and the second 0, and UNION when either is 1. DISTINCT applied to EXCEPT ALL keeps $v$ when $\max(m - n, 0) > 0$, that is when $m > n$, which includes cases with $n > 0$.

(3) Sum (1) over all values. For the second identity, $\min(m, n) + \max(m - n, 0) = m$: if $m \ge n$ the sum is $n + (m - n)$, and if $m < n$ it is $m + 0$.

**GATE use.** The set-op-duplicates type: tabulate $m$ and $n$ for each value, then apply the rule. In a UNION question the trap is forgetting that plain UNION also removes duplicates inside one operand. In an INTERSECT ALL or EXCEPT ALL question it is answering with the plain forms. Union compatibility is positional, so two queries whose columns have different names can still be combined.

**Check.** In the chapter's UNION question, A holds 1, 1, 2, 3 and B holds 2, 2, 4. UNION has the 4 values 1, 2, 3 and 4, and UNION ALL has $4 + 3 = 7$ rows. In the bag question, A holds 1, 1, 1, 2, 2, 3 and B holds 1, 1, 2, 2, 2, 4. INTERSECT ALL keeps $\min(3, 2) + \min(2, 3) = 4$ rows and EXCEPT ALL $\max(3 - 2, 0) + \max(2 - 3, 0) + \max(1 - 0, 0) = 2$, while INTERSECT gives 2 and EXCEPT 1. And $4 + 2 = 6 = \lvert A \rvert$. With A = {1, 1} and B = {1}, EXCEPT is empty and EXCEPT ALL keeps one 1. {NULL, NULL, 1} INTERSECT {NULL} is {NULL}, EXCEPT gives {1} and UNION gives 2 rows, while the join on = pairs nothing. A script ran these in SQLite, which lacks INTERSECT ALL and EXCEPT ALL. It computed those by applying the plain forms to rows numbered with ROW_NUMBER, so the value 1 of A became (1, 1), (1, 2) and (1, 3). It also checked that the result columns take the first query's names. PostgreSQL ran the ALL forms natively. On 400 random bag pairs with NULLs in SQLite, and 150 in PostgreSQL, the counts equaled (1) and (2).

## Constraints under NULLs
<!-- topics: db-sql-constraints.integrity-constraints -->

**Claim.** For a table with key, UNIQUE, CHECK and foreign-key constraints:

1. PRIMARY KEY means UNIQUE and NOT NULL, and a table has at most one.
2. UNIQUE on columns $K$ is violated only by two rows that are non-NULL and equal on every column of $K$. So a UNIQUE column accepts any number of NULLs, and a UNIQUE pair of columns accepts (1, NULL) twice. PostgreSQL's `UNIQUE NULLS NOT DISTINCT` admits only one NULL.
3. A CHECK constraint rejects a row only when its condition is F, so `CHECK (age >= 18)` accepts a NULL age; only NOT NULL forbids the NULL.
4. A foreign key must reference a PRIMARY KEY or UNIQUE column set, possibly in the same table. Under the default MATCH SIMPLE, a child row satisfies it when one of its foreign-key columns is NULL or some parent row holds equal values in the referenced columns.
5. In a state that satisfies a foreign key, four kinds of statement can violate it: inserting a child row, changing a child's foreign key, deleting a parent row and changing a referenced parent key. The referential actions of the next section repair the last two. Deleting a child row, inserting a parent row and changing a parent's other columns never can.

**Proof.** (1) A primary key identifies each row, so it must be unique. A NULL identifies nothing, which is the entity integrity rule.

(2) The standard counts two rows as duplicates for UNIQUE only when every column of $K$ is non-NULL in both and the values agree. A row with a NULL in $K$ is therefore a duplicate of nothing, and two NULL-free rows clash exactly when they agree on $K$. NULLS NOT DISTINCT switches the comparison to "not distinct", under which two NULLs are equal.

(3) This is rule (6) of the first section.

(4) A child row's foreign key has to identify one parent, so the referenced columns must be unique; otherwise one value could name two parents. PostgreSQL refuses such a definition, and SQLite refuses inserts into the child table. MATCH SIMPLE, the standard's default, exempts any row with a NULL in its foreign key.

(5) The constraint says that every child row $c$ with a non-NULL foreign key has a parent row $p$ with $p.\text{key} = c.\text{fk}$. Deleting a child shrinks the set that "every" ranges over, and inserting a parent enlarges the set that "has" searches. Changing a parent column outside the referenced key leaves every key value in place. So none of these three can make the statement false. Each of the other four can: insert a child whose value no parent holds, change a child's value to such a value, delete the only parent that a child references, or change that parent's key.

**GATE use.** MSQs list inserts into a table with a primary key, a UNIQUE column, a CHECK and a self-referencing foreign key, and ask which succeed. Test each constraint in turn with the three-valued rules: a NULL fails PRIMARY KEY and passes UNIQUE and CHECK, and a NULL foreign key needs no parent. The traps are believing that UNIQUE implies NOT NULL, that CHECK rejects NULL, and that a foreign key can reference only a primary key of another table. SQLite is a poor referee here: a PRIMARY KEY column that is not declared INTEGER accepts NULL unless it is also declared NOT NULL, and an INTEGER PRIMARY KEY turns an inserted NULL into a new row id.

**Check.** In the chapter's question T(id, email, age, mgr) holds (1, 'a@x', 30, NULL). The insert (2, NULL, NULL, 1) succeeds, and (NULL, 'b@x', 20, 1) fails on the primary key. (3, 'b@x', 20, 9) fails because no row has id 9, and (4, 'c@x', 18, NULL) succeeds, since 18 >= 18 is T. A script ran the four inserts with the stated DDL in PostgreSQL, which refused the second with a not-null violation on id and the third with a foreign-key violation. It ran them in SQLite with id declared NOT NULL; without NOT NULL, SQLite let the NULL id in. Both systems accepted repeated NULL emails. SQLite accepted (1, NULL) twice under a two-column UNIQUE while refusing a second (1, 2), and NULLS NOT DISTINCT refused a second NULL. CHECK accepted NULL and refused 17. A two-column foreign key accepted (7, NULL) with no parent and refused (7, 1). A foreign key to a UNIQUE column was accepted, and one to a non-unique column refused, in PostgreSQL with "there is no unique constraint matching given keys". On 1500 random consistent states with 7 kinds of statement each, SQLite refused a statement for a foreign key exactly when it would leave a dangling reference, and only the four kinds of (5) ever did.

## Referential actions as reachability
<!-- topics: db-sql-constraints.referential-actions, db-sql-constraints.integrity-constraints -->

**Claim.** Draw an edge from each row to every row whose foreign key references it, labelled with that key's ON DELETE action, and let a statement delete the set $X$ of rows, often a single row $r$.

1. If every edge is CASCADE, the statement deletes exactly $\text{reach}(X)$, the rows reachable from $X$ along the edges, cycles included. The number of other rows deleted is $\lvert \text{reach}(X) \rvert - \lvert X \rvert$, which for one row is $\lvert \text{reach}(r) \rvert - 1$.
2. With mixed actions, let $D$ be the set of rows reachable from $X$ along CASCADE edges only. If a row outside $D$ references a row of $D$ through a NO ACTION key, the statement is refused and nothing changes. Otherwise exactly the rows of $D$ are deleted, and each row outside $D$ that references a row of $D$ through a SET NULL key has that key set to NULL. Such a row stays, so nothing propagates from it.
3. RESTRICT refuses in every case where NO ACTION does. SQLite checks RESTRICT as soon as the parent row goes, so it also refuses when the referencing row would be deleted later in the same statement, which NO ACTION allows. PostgreSQL allows that delete under both.
4. SET NULL fails on a NOT NULL column, and SET DEFAULT fails unless the default is NULL or the key of an existing parent row.
5. In a self-referencing table such as Emp(eid, mgr), ON UPDATE CASCADE changes the mgr of the direct children only, because their own eid values do not change.

**Proof.** (1) Induction along the cascade. When a row is deleted, each row that references it would dangle, so CASCADE deletes that row too, then the rows that reference it, and so on. So every row reachable from $X$ is deleted. Conversely, every deleted row is in $\text{reach}(X)$, by induction on the order of deletion. A row outside $X$ is deleted only because a row it references was deleted before it. That row is in $\text{reach}(X)$ by the hypothesis, and the edge between them puts the new row there too. Each row is deleted once, so the cascade stops even on a cycle. The statement names the rows of $X$, so the others number $\lvert \text{reach}(X) \rvert - \lvert X \rvert$.

(2) The argument of (1), restricted to CASCADE edges, shows that the rows of $D$ are deleted. A row outside $D$ is not deleted, because each of its edges from a deleted row is SET NULL or NO ACTION. Through a SET NULL key its reference becomes NULL, which satisfies the constraint, and it keeps its own key, so the rows below it are untouched. Through a NO ACTION key it would reference a deleted row when the statement ends, so the statement fails and is undone as a whole. A row inside $D$ that references through a NO ACTION key is harmless, since it is gone by the end of the statement.

(3) A row that makes NO ACTION refuse lies outside $D$, so the statement never deletes it, and its foreign key keeps the deleted parent's value. Whenever RESTRICT checks that parent, the row is still there, so RESTRICT refuses too. SQLite checks RESTRICT when the parent row is deleted, before the rest of the statement runs. PostgreSQL checks RESTRICT at the end of the statement, and there the essential difference from NO ACTION is that NO ACTION can be deferred to the end of the transaction.

(4) Setting a NOT NULL column to NULL violates NOT NULL, which undoes the statement. A default is a foreign-key value like any other: NULL needs no parent under MATCH SIMPLE, and any other value needs one. A column declared without a default has the default NULL.

(5) Changing a parent's key from $k$ to $k'$ leaves its children referencing $k$, so CASCADE changes their foreign key to $k'$. Their own keys, which their children reference, are unchanged, so the change stops there. It would travel further only through a foreign-key column that is itself referenced.

**GATE use.** The cascade-propagation type: delete the target, find the rows that reference it, apply each key's action, and repeat from every row that CASCADE deleted. The question asks for the other tuples deleted, so do not count the target itself, and do not follow the edges upward to the target's own manager. In a self-referencing table, a cycle can sweep in the whole table. In MCQs with mixed actions, SET NULL ends the chain: the rows it keeps are not deleted, so the rows referencing them are unaffected.

**Check.** In the chapter's question Emp(eid, mgr), with ON DELETE CASCADE, holds (10, 30), (20, 10), (30, 40), (40, 30), (50, 20), (60, 20), (70, 50) and (80, 40). Deleting 20 reaches 50 and 60, then 70: 3 other tuples, leaving 10, 30, 40 and 80. Deleting 30 instead reaches 10 and 40, then 20 and 80, then 50 and 60, then 70. That is all 7 others, through the cycle between 30 and 40. With ON UPDATE CASCADE, changing 20 to 25 changes the mgr of 50 and 60 only. In the SET NULL question, deleting department 10 leaves employees 1 and 2 with a NULL did and all three projects in place. Under CASCADE the same delete removes employees 1 and 2 and projects p1 and p2. NO ACTION, RESTRICT, and SET NULL on a NOT NULL column refuse it. SET DEFAULT 20 moves both employees to department 20, SET DEFAULT with no DEFAULT clause sets both to NULL, and SET DEFAULT 99 refuses. A script ran these in SQLite, and the two chapter questions in PostgreSQL too. On 500 random self-referencing tables with cycles, the deleted rows were exactly those reachable from the deleted ones. On 1000 random tables with two self-referencing keys under random CASCADE, SET NULL and NO ACTION actions, SQLite matched (2) every time. With RESTRICT in place of NO ACTION, it refused all 284 refused deletes as well. Deleting (1, NULL) and its only child (2, 1) in one statement succeeded under NO ACTION and failed under SQLite's RESTRICT, while PostgreSQL accepted it under both.

## Window ranks: ROW_NUMBER, RANK and DENSE_RANK
<!-- topics: db-sql-constraints.window-functions -->

**Claim.** In one partition of $n$ rows ordered by a key, two rows are peers when their keys are equal, and all NULL keys are peers. For a row $r$, let $a(r)$ be the number of rows strictly ahead of it and $d(r)$ the number of distinct keys strictly ahead of it.

1. $\text{RANK}(r) = 1 + a(r)$ and $\text{DENSE\_RANK}(r) = 1 + d(r)$. ROW_NUMBER numbers the rows $1, \dots, n$ in order, breaking ties among peers arbitrarily.
2. $\text{ROW\_NUMBER}(r) \ge \text{RANK}(r) \ge \text{DENSE\_RANK}(r)$. The largest RANK is $n - g + 1$, where $g$ is the size of the last peer group, and the largest DENSE_RANK is the number of peer groups.
3. Keeping the rows ranked at most $k$ keeps $\min(k, n)$ rows by ROW_NUMBER, the rows with fewer than $k$ rows ahead by RANK, and every row holding one of the $k$ best keys by DENSE_RANK.
4. Window functions are computed after WHERE, GROUP BY and HAVING, so they cannot appear in WHERE; filter on them in an outer query. PARTITION BY restarts the numbering in each partition.
5. Where the NULL peer group sits depends on the DBMS. In ascending order SQLite puts NULLs first and PostgreSQL last, unless NULLS FIRST or NULLS LAST is written.

**Proof.** (1) The standard defines RANK as one more than the number of rows that precede the row and are not its peers, which are exactly the rows strictly ahead. It defines DENSE_RANK as the number of peer groups up to and including the row's own, which is $d(r) + 1$. ROW_NUMBER assigns consecutive numbers in the window order.

(2) Every row strictly ahead of $r$ gets a smaller row number, so $\text{ROW\_NUMBER}(r) \ge a(r) + 1$. The $a(r)$ rows ahead carry $d(r)$ distinct keys, so $a(r) \ge d(r)$. A row of the last peer group has all the other $n - g$ rows ahead of it, the most of any row, and all the other peer groups. So it has the largest RANK, $n - g + 1$, and the largest DENSE_RANK, the number of peer groups.

(3) Row numbers are a bijection onto $1, \dots, n$, so $\min(k, n)$ of them are at most $k$. $\text{RANK}(r) \le k$ exactly when $a(r) \le k - 1$. $\text{DENSE\_RANK}(r) \le k$ exactly when $d(r) \le k - 1$, that is when the key of $r$ is among the $k$ best.

(4) The window is defined over the table that WHERE, GROUP BY and HAVING produce, so a window function has no value while WHERE runs.

(5) The standard leaves the position of NULLs in a sort to the implementation, and NULLS FIRST or NULLS LAST fixes it.

**GATE use.** Questions give a column of scores with ties and ask for the ranks, or for the number of rows a top-$k$ filter keeps. The traps are giving RANK no gaps or DENSE_RANK gaps, expecting a top-$k$ filter on RANK to keep exactly $k$ rows, and writing the window function in WHERE.

**Check.** The scores 90, 90, 80, 70, 70, 60 get RANK 1, 1, 3, 4, 4, 6, DENSE_RANK 1, 1, 2, 3, 3, 4 and ROW_NUMBER 1 to 6. Rank at most 2 keeps 2, 2 and 3 rows by ROW_NUMBER, RANK and DENSE_RANK, and rank at most 3 keeps 3, 3 and 5. For the scores 5, NULL, 7, NULL in ascending order, SQLite ranks the two NULLs 1 and the others 3 and 4. With NULLS LAST, the PostgreSQL default, 5 and 7 get 1 and 2 and the NULLs 3. Partitioning (a, 60), (a, 50), (a, 50), (b, 90), (b, 80) by group and ranking by descending score gives 1, 2, 2 and 1, 2. A script ran these in SQLite, and the ranks and the NULL placement in PostgreSQL too. It confirmed that both refuse a window function in WHERE, and on 500 random partitions with ties and NULLs it checked (1), (2) and (3).
