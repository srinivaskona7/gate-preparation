# Greedy, dynamic programming and divide and conquer: derivations

## The recursion tree and the master theorem
<!-- topics: algo-design-paradigms.dc-recurrences, algo-design-paradigms.dc-template -->

**Claim.** Let $a \ge 1$ and $b > 1$ be constants, $f(n) \ge 0$, $T(1) = \Theta(1)$, and let $n$ be a power of $b$ (rounding $n/b$ up or down changes none of the answers below; CLRS 4.6.2). For $T(n) = a\,T(n/b) + f(n)$,

$$T(n) = n^{\log_b a}\,T(1) + \sum_{j=0}^{\log_b n - 1} a^j f\!\left(\frac{n}{b^j}\right).$$

Write $p = \log_b a$. Then

1. if $f(n) = O(n^{p-\epsilon})$ for some $\epsilon > 0$, $T(n) = \Theta(n^p)$;
2. if $f(n) = \Theta(n^p)$, $T(n) = \Theta(n^p \log n)$;
3. if $f(n) = \Omega(n^{p+\epsilon})$ for some $\epsilon > 0$ and $a f(n/b) \le c f(n)$ for some $c < 1$ and all large $n$, $T(n) = \Theta(f(n))$.

A gap of only a logarithm fits no case: $2T(n/2) + n\log n = \Theta(n \log^2 n)$ and $2T(n/2) + n/\log n = \Theta(n \log\log n)$.

**Proof.** Unrolling the recurrence gives a tree. At depth $j$ there are $a^j$ subproblems, each of size $n/b^j$, and each charges $f(n/b^j)$ for its divide and combine work, so level $j$ costs $a^j f(n/b^j)$. The leaves are at depth $k = \log_b n$, and there are $a^k = a^{\log_b n} = b^{\log_b a \cdot \log_b n} = n^{\log_b a}$ of them, each costing $T(1)$. Adding the levels gives the sum.

Case 1. With $f(m) \le C m^{p-\epsilon}$, level $j$ costs at most $C a^j (n/b^j)^{p-\epsilon} = C n^{p-\epsilon} (a\,b^{\epsilon}/b^{p})^j = C n^{p-\epsilon} b^{\epsilon j}$, because $b^p = a$. The levels form a geometric series with ratio $b^\epsilon > 1$, so their sum is at most $C n^{p-\epsilon} \cdot b^{\epsilon k}/(b^\epsilon - 1) = C n^p/(b^\epsilon - 1) = O(n^p)$. The leaves contribute $\Theta(n^p)$, so $T(n) = \Theta(n^p)$: the leaves dominate.

Case 2. With $f(m) = \Theta(m^p)$, level $j$ costs $\Theta(a^j n^p/b^{pj}) = \Theta(n^p)$. There are $\log_b n$ levels plus the leaves, so $T(n) = \Theta(n^p \log n)$.

Case 3. Regularity applied $j$ times gives $a^j f(n/b^j) \le c^j f(n)$, so the levels sum to at most $f(n)/(1-c)$; the root alone costs $f(n)$, and the leaves cost $n^p = o(f(n))$. So $T(n) = \Theta(f(n))$: the root dominates.

The log gaps. Take $a = b = 2$, $n = 2^k$ and $T(1) = 0$. Level $j$ has $2^j$ problems of size $2^{k-j}$. For $f(m) = m\log_2 m$ it costs $n(k-j)$, and the sum is $n\,k(k+1)/2 = \Theta(n\log^2 n)$. For $f(m) = m/\log_2 m$ it costs $n/(k-j)$, and the sum is $n H_k$, where $H_k = 1 + \tfrac12 + \dots + \tfrac1k = \Theta(\log k) = \Theta(\log\log n)$. In both, $f$ differs from $n^p = n$ by less than any power $n^\epsilon$, so neither case 1 nor case 3 applies, and $f \ne \Theta(n)$ rules out case 2.

**GATE use.** Identify $a$, $b$ and $f$, compute $n^{\log_b a}$ and compare. Merge sort is $2T(n/2) + \Theta(n)$: $p = 1$, case 2, $\Theta(n\log n)$. Binary search is $T(n/2) + \Theta(1)$: $p = 0$, case 2, $\Theta(\log n)$. The classic trap is $2T(n/2) + 1$, which is case 1 and only $\Theta(n)$: a halving recursion is $n\log n$ only when the combine step is linear. Other traps: applying case 3 without regularity, and forcing $n/\log n$ into case 1. Closest pair that re-sorts its strip in every call pays $2T(n/2) + \Theta(n\log n) = \Theta(n\log^2 n)$.

**Check.** With $T(1) = 1$ and $n = 2^k$, a script confirmed the exact solutions for $k = 0, \dots, 20$: $2T(n/2) + 1 = 2n - 1$; $2T(n/2) + n = n\log_2 n + n$; $T(n/2) + 1 = \log_2 n + 1$; $3T(n/2) + n = 3n^{\log_2 3} - 2n$; $7T(n/2) + n^2 = (7n^{\log_2 7} - 4n^2)/3$; $4T(n/2) + n^3 = 2n^3 - n^2$. The level sum matched the recurrence on five $(a, b, f)$ triples. For $2T(n/2) + n/\log n$ at $n = 2^{20}$ with $T(1) = 0$, as in the proof, $T(n)/n = H_{20} \approx 3.598$.

## Uneven splits and subtract-and-conquer recurrences
<!-- topics: algo-design-paradigms.dc-recurrences, algo-design-paradigms.dc-template -->

**Claim.** Let $T(0) = 0$ and, for $n \ge 1$, $T(n) = \sum_{i=1}^{r} T(\lfloor \alpha_i n \rfloor) + cn$ with constants $0 < \alpha_i < 1$ and $c > 0$. Write $s = \sum_i \alpha_i$.

1. If $s < 1$, then $cn \le T(n) \le \dfrac{cn}{1-s}$, so $T(n) = \Theta(n)$. For $T(n/2) + T(n/4) + T(n/8) + n$ this gives $T(n) \le 8n$.
2. If $s = 1$, as in $T(n/3) + T(2n/3) + n$, then $T(n) = \Theta(n\log n)$.
3. Subtract-and-conquer: $T(n) = T(n-1) + c$ gives $cn$; $T(n) = T(n-1) + n$ gives $n(n+1)/2$; $T(n) = 2T(n-1) + 1$ gives $2^n - 1$.

**Proof.** (1) Strong induction on $n$. $T(0) = 0$ satisfies the bound. For $n \ge 1$ every $\lfloor \alpha_i n\rfloor < n$, so

$$T(n) \le \sum_i \frac{c\lfloor \alpha_i n\rfloor}{1-s} + cn \le \frac{cns}{1-s} + cn = \frac{cn}{1-s}.$$

The lower bound holds because $T \ge 0$ and the root alone costs $cn$. In the recursion tree, level $j$ costs at most $s^j cn$, a geometric series; this is why "fractions summing below 1 with linear work" gives $\Theta(n)$. For the GATE recurrence $s = 7/8$ and $c = 1$, so $T(n) \le 8n$.

(2) Take the version without floors. Level $j$ of the tree for $T(n/3) + T(2n/3) + n$ has subproblem sizes $n(1/3)^{u}(2/3)^{j-u}$, which add up to $n(1/3 + 2/3)^j = n$, as long as no branch has reached a leaf. The shortest root-to-leaf path follows the $1/3$ branch and has length $\log_3 n$, the longest follows $2/3$ and has length $\log_{3/2} n$. The first $\log_3 n$ levels are complete, so $T(n) \ge n\log_3 n$; every level costs at most $n$ and there are at most $\log_{3/2} n + 1$ of them, so $T(n) \le n(\log_{3/2} n + 1)$. Both are $\Theta(n\log n)$. The same holds for any fixed split $\alpha n$ and $(1-\alpha)n$, which is why quicksort with a constant-ratio split, even 1 to 9, is $\Theta(n\log n)$.

(3) The master theorem needs a subproblem of size $n/b$; $T(n-1)$ shrinks by a constant instead, so unroll. $T(n) = T(0) + \sum_{m=1}^{n} c = cn$, and $T(n) = \sum_{m=1}^{n} m = n(n+1)/2$. For the third, $T(n) + 1 = 2(T(n-1) + 1)$, so $T(n) + 1 = 2^n(T(0) + 1) = 2^n$.

**GATE use.** MCQs give an uneven-split recurrence and offer $\Theta(n)$, $\Theta(n\log n)$ and $\Theta(n^2)$; add the fractions. Below 1 with linear work is $\Theta(n)$, exactly 1 is $\Theta(n\log n)$. Quicksort's worst case, a pivot that splits $0$ and $n-1$, is $T(n) = T(n-1) + \Theta(n) = \Theta(n^2)$; this happens on sorted input with a first-element pivot. Towers of Hanoi is $2T(n-1) + 1$. The trap is treating $T(n-1)$ as if the master theorem applied.

**Check.** With floors and $T(0) = 0$, the largest value of $T(n)/n$ for $T(n/2) + T(n/4) + T(n/8) + n$ over $n \le 200{,}000$ was $6.296$, under the bound 8; at $n = 2^{20}$ the ratio is $6.67$. For $T(n/3) + T(2n/3) + n$ the ratio $T(n)/(n\log_2 n)$ was $1.054$ at $n = 10^6$, between $1/\log_2 3 \approx 0.631$ and $1/\log_2 1.5 \approx 1.710$. $T(n/3) + T(n/2) + 5n$ ($s = 5/6$) stayed under $30n$ for every $n \le 100{,}000$. Quicksort with a first-element pivot on the sorted input $1, \dots, 100$ made $4950 = 100 \cdot 99/2$ comparisons.

## Closest pair of points: the strip check is linear
<!-- topics: algo-design-paradigms.dc-template, algo-design-paradigms.dc-recurrences -->

**Claim.** Let $P$ hold $n \ge 2$ points in the plane. Split it by a vertical line $x = l$ into a left half $L$, all with $x \le l$, and a right half $R$, all with $x \ge l$, of sizes $\lceil n/2\rceil$ and $\lfloor n/2\rfloor$, and let $\delta$ be the smaller of the closest distances found recursively inside $L$ and inside $R$. Then any pair at distance less than $\delta$ has one point in each half, and both lie in the strip $\lvert x - l\rvert < \delta$. If the strip's points are listed by $y$, each point needs to be compared only with the at most 7 points after it. With the points presorted by $x$ and by $y$ once, the algorithm runs in $T(n) = 2T(n/2) + \Theta(n) = \Theta(n\log n)$.

**Proof.** Two points in the same half are at distance at least $\delta$ by the definition of $\delta$. So a pair $p, q$ with $d(p, q) < \delta$ has, say, $p \in L$ and $q \in R$, so $x_p \le l \le x_q$; since $x_q - x_p \le d(p, q) < \delta$, both $l - x_p$ and $x_q - l$ are below $\delta$, and both points are in the strip.

Packing (CLRS 33.4). Fix $p$ in the strip and let $q$ follow it in $y$-order with $y_q - y_p < \delta$. Then $q$ lies in the rectangle $[l - \delta, l + \delta] \times [y_p, y_p + \delta]$. A point of $L$ in this rectangle has $x \le l$, so it lies in the closed square $[l-\delta, l] \times [y_p, y_p + \delta]$. Cut that square into four closed squares of side $\delta/2$. Each has diameter $\delta/\sqrt2 < \delta$, so it holds at most one point of $L$; the square holds at most 4 points of $L$. In the same way at most 4 points of $R$ lie in the right square. The rectangle therefore holds at most 8 points, $p$ included, and at most 7 points follow $p$ in $y$-order before the $y$-gap reaches $\delta$. The scan stops at the first point whose $y$-gap is at least $\delta$, since every later point has a larger gap.

Cost. Splitting the presorted $y$-list into the two halves' $y$-lists, building the strip and scanning it take $\Theta(n)$, so case 2 of the master theorem gives $\Theta(n\log n)$. Re-sorting the strip in each call costs $\Theta(n\log n)$ per call and gives $\Theta(n\log^2 n)$ (previous section but one).

**GATE use.** A 1-mark fact: closest pair in the plane is $\Theta(n\log n)$ by divide and conquer, against $\Theta(n^2)$ for comparing all pairs. The trap is the version that sorts inside the recursion, which costs an extra log factor.

**Check.** A script ran the divide-and-conquer algorithm on 400 random point sets of up to 60 points on a $31 \times 31$ grid, where ties and collinear points are common. It matched brute force every time, and no point ever needed more than 3 comparisons in the strip, within the bound of 7.

## Strassen and Karatsuba: fewer recursive products
<!-- topics: algo-design-paradigms.fast-multiplication, algo-design-paradigms.dc-recurrences -->

**Claim.** (1) Karatsuba. Split $n$-digit numbers in base $B$ as $x = aB^h + b$ and $y = cB^h + d$ with $h = n/2$. Then

$$xy = ac\,B^{2h} + \big((a+b)(c+d) - ac - bd\big)B^h + bd,$$

so three half-size products suffice: $T(n) = 3T(n/2) + \Theta(n) = \Theta(n^{\log_2 3}) \approx \Theta(n^{1.585})$, against $4T(n/2) + \Theta(n) = \Theta(n^2)$ for the four-product split.

(2) Strassen. Split $n \times n$ matrices into $n/2 \times n/2$ blocks. The seven products

$$\begin{aligned} M_1 &= (A_{11} + A_{22})(B_{11} + B_{22}), & M_2 &= (A_{21} + A_{22})B_{11}, & M_3 &= A_{11}(B_{12} - B_{22}),\\ M_4 &= A_{22}(B_{21} - B_{11}), & M_5 &= (A_{11} + A_{12})B_{22}, & M_6 &= (A_{21} - A_{11})(B_{11} + B_{12}),\\ M_7 &= (A_{12} - A_{22})(B_{21} + B_{22}) \end{aligned}$$

give $C_{11} = M_1 + M_4 - M_5 + M_7$, $C_{12} = M_3 + M_5$, $C_{21} = M_2 + M_4$, $C_{22} = M_1 - M_2 + M_3 + M_6$, using 18 block additions or subtractions. So $T(n) = 7T(n/2) + \Theta(n^2) = \Theta(n^{\log_2 7}) \approx \Theta(n^{2.807})$, against $8T(n/2) + \Theta(n^2) = \Theta(n^3)$. For $n = 2^k$ and $1 \times 1$ base cases, Strassen makes exactly $7^k = n^{\log_2 7}$ scalar multiplications and $6(7^k - 4^k)$ scalar additions.

**Proof.** (1) $(a+b)(c+d) = ac + ad + bc + bd$, so the cross term $ad + bc$ equals $(a+b)(c+d) - ac - bd$, and $xy = acB^{2h} + (ad + bc)B^h + bd$. The sums $a + b$ and $c + d$ may carry into an extra digit; that carry costs only shifts and additions, $\Theta(n)$, as do the subtractions and the final shifted additions. With $p = \log_2 3 \approx 1.585 > 1$, case 1 of the master theorem gives $\Theta(n^{\log_2 3})$.

(2) Expand, keeping every A-block to the left of its B-block so that no step assumes the blocks commute:

$$M_1 + M_4 - M_5 + M_7 = (A_{11}B_{11} + A_{11}B_{22} + A_{22}B_{11} + A_{22}B_{22}) + (A_{22}B_{21} - A_{22}B_{11}) - (A_{11}B_{22} + A_{12}B_{22}) + (A_{12}B_{21} + A_{12}B_{22} - A_{22}B_{21} - A_{22}B_{22}),$$

which collapses to $A_{11}B_{11} + A_{12}B_{21} = C_{11}$. Likewise $M_3 + M_5 = A_{11}B_{12} + A_{12}B_{22}$, $M_2 + M_4 = A_{21}B_{11} + A_{22}B_{21}$, and $M_1 - M_2 + M_3 + M_6 = A_{21}B_{12} + A_{22}B_{22}$. Forming the operands takes 10 additions (2, 1, 1, 1, 1, 2, 2) and combining takes 8 (3, 1, 1, 3), each on $(n/2)^2$ entries, so the non-recursive work is $\Theta(n^2)$. Since $n^{\log_2 7}$ grows polynomially faster than $n^2$, case 1 gives $\Theta(n^{\log_2 7})$. The counts: $M(n) = 7M(n/2)$ with $M(1) = 1$ gives $7^k$; $A(n) = 7A(n/2) + 18(n/2)^2$ with $A(1) = 0$ is solved by $6(7^k - 4^k)$, because $7 \cdot 6(7^{k-1} - 4^{k-1}) + 18 \cdot 4^{k-1} = 6 \cdot 7^k - 24 \cdot 4^{k-1} = 6(7^k - 4^k)$.

In both algorithms the gain comes only from cutting the number of recursive calls. The extra additions raise the constant in the $\Theta(n^2)$ or $\Theta(n)$ term but cannot change the exponent, which is $\log_b a$.

**GATE use.** MCQs ask for the running time from the recurrence, or the number of multiplications for a given $n$: Strassen on $4 \times 4$ matrices recursing to scalars makes $7^2 = 49$, against $64$. The traps are thinking the 18 additions raise the cost to $n^3$, and mixing up $\log_2 7$ (matrices) with $\log_2 3$ (integers).

**Check.** $1234 \times 5678$ with $a = 12$, $b = 34$, $c = 56$, $d = 78$: $ac = 672$, $bd = 2652$, $(a+b)(c+d) = 46 \cdot 134 = 6164$, cross term $6164 - 672 - 2652 = 2840$, and $672 \cdot 10^4 + 2840 \cdot 10^2 + 2652 = 7{,}006{,}652 = 1234 \times 5678$. A script checked Strassen's seven-product formulas on 500 random instances whose blocks are themselves $2 \times 2$ integer matrices (so the blocks do not commute), confirmed $7^k$ and $6(7^k - 4^k)$ for $k \le 14$, and ran a recursive Karatsuba on random $2^k$-digit numbers for $k \le 7$, which was always correct and made exactly $3^k$ one-digit products. At $n = 1024$ Strassen makes $7^{10} = 282{,}475{,}249$ scalar multiplications against $1024^3 = 1{,}073{,}741{,}824$.

## Activity selection: earliest finish stays ahead
<!-- topics: algo-design-paradigms.activity-selection, algo-design-paradigms.greedy-principles -->

**Claim.** Activities are half-open intervals $[s_i, f_i)$ with $s_i < f_i$; two are compatible when one starts no earlier than the other finishes, so touching is allowed. Sort by finish time, take the first, and then take each activity whose start is at least the finish of the last one taken. The result is a largest set of pairwise compatible activities, in $O(n\log n)$ time, or $O(n)$ when the input is already sorted by finish. Earliest start and shortest duration are not optimal. Separately, the fewest rooms that can host all the intervals equals the depth $d$, the largest number of intervals that contain one common point.

**Proof.** Greedy is correct when two properties hold: the greedy choice belongs to some optimal solution, and what remains after the choice is a smaller instance of the same problem whose optimum completes it (CLRS 16.2). There are two standard ways to prove the first: an exchange argument, which swaps the greedy choice into an optimal solution without making it worse, and a "greedy stays ahead" induction. Activity selection works with either; here is the second.

Let greedy choose $g_1, \dots, g_k$ and let $o_1, \dots, o_m$ be any compatible set, both in order of finish time. We show $f(g_r) \le f(o_r)$ for every $r \le \min(k, m)$. For $r = 1$, $g_1$ has the earliest finish of all activities. If $f(g_r) \le f(o_r)$, then $o_{r+1}$ starts at or after $f(o_r) \ge f(g_r)$, so it was still available when greedy made its $(r+1)$-th choice, and greedy took the available activity with the earliest finish, so $f(g_{r+1}) \le f(o_{r+1})$. Now suppose $m > k$. Then $o_{k+1}$ starts at or after $f(o_k) \ge f(g_k)$ and greedy would have taken something after $g_k$, a contradiction. So $k \ge m$ for every compatible set, and greedy's set is maximum. The scan only compares with the last activity taken because all earlier ones finish no later.

Counterexamples. Earliest start on $(0, 10), (1, 2), (3, 4)$ takes $(0, 10)$ and then nothing fits: 1 against 2. Shortest first on $(0, 5), (4, 6), (5, 10)$ takes $(4, 6)$, which overlaps both others: 1 against 2.

Rooms. The $d$ intervals through a common point conflict pairwise, so they need $d$ different rooms. Conversely, process intervals by start time and put each into any room whose last interval has finished by its start, opening a new room only when none has. When interval $I$ opens a new room at time $s$, every open room holds an interval that started at or before $s$ and finishes after $s$; together with $I$ these all contain the point $s$, so the number of rooms never exceeds $d$. Sorting the $2n$ start and end times and sweeping, with an end processed before a start at the same time for half-open intervals, computes $d$ in $O(n\log n)$.

**GATE use.** NAT: count the activities chosen, or name the set; sort by finish and scan. MSQ: which rules are optimal (earliest finish, yes; earliest start, shortest, fewest conflicts, no). The minimum-platforms question is the depth computation, not activity selection. Read whether an activity may start exactly when another finishes; it changes the answer. When activities carry weights, greedy fails and the problem needs DP over the activities sorted by finish time.

**Check.** For the eleven activities $(1,4), (3,5), (0,6), (5,7), (3,9), (5,9), (6,10), (8,11), (8,12), (2,14), (12,16)$, greedy takes $(1,4), (5,7), (8,11), (12,16)$: 4, equal to a brute-force search over all $2^{11}$ subsets. Their depth is 6, at time 8.5, where $(3,9), (5,9), (6,10), (8,11), (8,12), (2,14)$ overlap. A script found earliest finish optimal on 2,000 random instances of up to 10 activities, and the start-time room assignment used exactly $d$ rooms on 3,000 random instances.

## Fractional knapsack: why the ratio greedy is optimal, and where it fails
<!-- topics: algo-design-paradigms.fractional-knapsack, algo-design-paradigms.greedy-principles, algo-design-paradigms.knapsack-01 -->

**Claim.** Items have weights $w_i > 0$ and values $v_i > 0$; the knapsack holds weight $W$. Choose fractions $x_i \in [0, 1]$ to maximise $\sum_i v_i x_i$ subject to $\sum_i w_i x_i \le W$. Take items in decreasing order of the ratio $r_i = v_i/w_i$, each whole while it fits, and then the fraction of the next item that fills the knapsack. This is optimal, at most one item is taken fractionally, and the time is $O(n\log n)$. Its value is at least the 0/1 optimum. The same ratio rule restricted to whole items is not optimal for 0/1 knapsack.

**Proof.** Number the items so that $r_1 \ge r_2 \ge \dots \ge r_n$, and let $g$ be the greedy solution. Among the optimal solutions choose $x$ agreeing with $g$ on the longest prefix $x_1 = g_1, \dots, x_{i-1} = g_{i-1}$, and suppose $x \ne g$, so that $x_i \ne g_i$ for some first index $i$. Greedy takes as much of item $i$ as fits after the common prefix, so $x_i < g_i$; put $\delta = w_i(g_i - x_i) > 0$. Because $g$ is feasible, the prefix of $x$ up to item $i$ uses at least $\delta$ less weight than $W$, so that weight is either unused in $x$ or spent on items $j > i$. Move up to $\delta$ of it onto item $i$: free capacity adds value $r_i$ per unit, and moving weight from item $j$ to item $i$ changes the value by $r_i - r_j \ge 0$ per unit. The result is feasible, no worse, so still optimal, and it now agrees with $g$ through item $i$, contradicting the choice of $x$. So $g$ is optimal. Greedy takes a fraction only of the first item that does not fit, after which the knapsack is full, so at most one item is fractional.

Every 0/1 selection is a fractional selection with each $x_i \in \lbrace 0, 1\rbrace$, so the fractional optimum bounds the 0/1 optimum from above, which is how branch-and-bound uses it. The exchange above needs item $i$ to absorb exactly $\delta$ more weight. In 0/1 knapsack an item is all or nothing, so the capacity left over after the best-ratio items may be wasted, and a different set of whole items can use it better. One counterexample is enough to rule out the rule.

**GATE use.** NAT: the fractional value for a small item list. MSQ: "which greedy strategies are optimal" has fractional knapsack by ratio as true and 0/1 knapsack by ratio as false. Traps: sorting by value alone or by weight alone, and forgetting to take the final fraction.

**Check.** Capacity 50 with items $(10, 60)$, $(20, 100)$, $(30, 120)$, ratios 6, 5 and 4: greedy takes the first two whole items (weight 30, value 160) and $20/30$ of the third (80), total 240. With whole items only the ratio greedy stops at 160, since the third item does not fit in 20, while $\lbrace 20, 30\rbrace$ gives 220. A script compared the greedy value with the exact fractional optimum, computed by enumerating the vertices of the feasible region (whole subsets plus one item cut to fill the rest), on 1,500 random instances: always equal, and never below the 0/1 optimum. The whole-item ratio greedy missed the 0/1 optimum in 121 of them.

## Huffman coding: the cost identity and optimality
<!-- topics: algo-design-paradigms.huffman, algo-design-paradigms.greedy-principles -->

**Claim.** A binary prefix code is a binary tree whose leaves are the symbols; the codeword of a symbol $c$ spells the path to its leaf, so its length is the depth $d_T(c)$. For symbol frequencies $f(c)$,

$$B(T) = \sum_c f(c)\, d_T(c) = \sum_{\text{internal } v} w(v),$$

where $w(v)$ is the total frequency of the leaves below $v$. Huffman's algorithm, which repeatedly merges the two smallest weights into a parent, builds a tree of least $B(T)$ among all prefix codes, in $n - 1$ merges and $O(n\log n)$ time with a binary heap. The average code length is $B(T)/\sum_c f(c)$.

**Proof.** Identity. Count the pairs $(v, c)$ in which $v$ is an internal node and $c$ a leaf below it. A leaf at depth $d$ has exactly $d$ proper ancestors, all internal, so the count weighted by $f(c)$ is $\sum_c f(c) d_T(c)$. Grouping the same pairs by $v$ gives $\sum_v \sum_{c \text{ below } v} f(c) = \sum_v w(v)$. Each Huffman merge creates one internal node whose weight is the merged sum, so $B(T)$ is the sum of all merged weights. A symbol's codeword length equals the number of merges whose subtree contains it.

Prefix-freeness. A proper prefix of a codeword is a path that ends at an internal node, and no symbol sits at an internal node.

Optimality (CLRS 16.3). An optimal tree is full, since a node with one child can be removed, which shortens every codeword below it. Let $x$ and $y$ have the two smallest frequencies. First, some optimal tree has $x$ and $y$ as sibling leaves at the maximum depth: take any optimal $T$ and a deepest pair of sibling leaves $a, b$. Swapping $x$ with $a$ changes the cost by

$$f(x)d(a) + f(a)d(x) - f(x)d(x) - f(a)d(a) = -\big(f(a) - f(x)\big)\big(d(a) - d(x)\big) \le 0,$$

because $f(a) \ge f(x)$ and $d(a) \ge d(x)$; swapping $y$ with $b$ is the same. Second, replace $x$ and $y$ by one symbol $z$ with $f(z) = f(x) + f(y)$. If $T'$ is a tree for the reduced alphabet, hanging $x$ and $y$ below the leaf $z$ gives a tree $T$ with $B(T) = B(T') + f(x) + f(y)$, since $f(x)(d+1) + f(y)(d+1) = f(z)d + f(z)$ where $d$ is the depth of $z$. Now induct on the number of symbols, with two symbols as the base case. Huffman merges $x$ and $y$ first, then builds an optimal $T'$ for the reduced alphabet by induction. If some tree $T^\ast$ for the full alphabet were cheaper than Huffman's $T$, take it with $x$ and $y$ as siblings (first step); collapsing them gives a tree for the reduced alphabet of cost $B(T^\ast) - f(x) - f(y) < B(T) - f(x) - f(y) = B(T')$, contradicting the optimality of $T'$.

**GATE use.** NAT: total bits, average bits per symbol, or one symbol's code length. Merge the two smallest each time, re-sorting after every merge so a new parent is placed correctly, and add up the merged weights. Ties can change individual codewords but never $B(T)$. A fixed-length code for $n$ symbols needs $\lceil \log_2 n\rceil$ bits per symbol, the usual baseline for "how many bits are saved".

**Check.** Frequencies 5, 9, 12, 13, 16, 45 merge into 14, 25, 30, 55 and 100, and $14 + 25 + 30 + 55 + 100 = 224$. By depths: 45 at depth 1; 12, 13 and 16 at depth 3; 5 and 9 at depth 4; so $45 + 3 \cdot 41 + 4 \cdot 14 = 224$, an average of $2.24$ bits against 3 bits for a fixed-length code (300 bits). A script compared Huffman's cost with the minimum over every merge order, which reaches every full binary tree, on 300 random frequency lists of up to 6 symbols, and checked the cost identity on 500 trees built by random merges.

## Job sequencing with deadlines: feasibility and the greedy exchange
<!-- topics: algo-design-paradigms.job-sequencing, algo-design-paradigms.greedy-principles -->

**Claim.** Jobs take one time slot each, job $j$ has an integer deadline $d_j \ge 1$ and a profit $p_j > 0$, and it earns $p_j$ only if it runs in a slot $t \le d_j$. Write $N_t(S)$ for the number of jobs in $S$ with deadline at most $t$.

1. A set $S$ can be scheduled exactly when $N_t(S) \le t$ for every $t$.
2. Taking jobs by decreasing profit and putting each in the latest free slot at or before its deadline, dropping it when there is none, accepts a job exactly when it can be added to the jobs already accepted.
3. The resulting total profit is the largest possible. A plain scan for a free slot costs $O(n^2)$; a disjoint-set structure that maps each slot to the latest free slot at or below it makes the placement nearly linear, so the sort's $O(n\log n)$ dominates.

**Proof.** (1) The jobs with deadline at most $t$ need different slots among $1, \dots, t$, so the condition is necessary. If it holds, run $S$ in order of deadline: the $k$-th job has at least $k$ jobs of deadline at most $d_k$ in $S$, so $k \le N_{d_k}(S) \le d_k$ and slot $k$ meets its deadline.

(2) If the rule finds a slot, the new set is scheduled. If it finds none, slots $1, \dots, d_j$ are all taken; let $t \ge d_j$ be the largest index such that slots $1, \dots, t$ are all taken. Slot $t + 1$ is free (or $t$ is the last slot), and since slots only fill up, it was free whenever an earlier job was placed. A job in a slot at most $t$ with deadline at least $t + 1$ would therefore have been put in slot $t+1$ or later. So the $t$ jobs in slots $1, \dots, t$ all have deadline at most $t$, and with $j$ there are $t + 1$ jobs of deadline at most $t$: by (1) no schedule exists.

(3) First an exchange lemma (CLRS 16.5). If $A$ and $B$ are schedulable and $\lvert A\rvert < \lvert B\rvert$, some $x \in B \setminus A$ keeps $A \cup \lbrace x\rbrace$ schedulable. Let $k$ be the largest $t \ge 0$ with $N_t(B) \le N_t(A)$, so $N_t(B) > N_t(A)$ for every $t > k$. Since $\lvert B\rvert > \lvert A\rvert$, $B$ has more jobs than $A$ with deadline above $k$, so some $x \in B \setminus A$ has $d_x > k$. Adding $x$ leaves $N_t$ unchanged for $t < d_x$, and for $t \ge d_x > k$ gives $N_t(A \cup \lbrace x\rbrace) = N_t(A) + 1 \le N_t(B) \le t$.

Now let $j_1, j_2, \dots$ be the jobs in decreasing order of profit and $G_k$ the jobs greedy accepts among the first $k$. Invariant: some optimal set $O$ contains $G_k$ and none of the first $k$ jobs that greedy rejected. It holds for $k = 0$. Suppose greedy rejects $j = j_{k+1}$. Then $G_k \cup \lbrace j\rbrace$ cannot be scheduled by (2); any subset of a schedulable set is schedulable, so $j \notin O$. Suppose greedy accepts $j$ and $j \notin O$. $O$ contains a job outside $G_k$, since otherwise $O \cup \lbrace j\rbrace = G_{k+1}$ would be schedulable with more profit. Apply the lemma repeatedly to $A = G_k \cup \lbrace j\rbrace$ and $B = O$ until $A$ has $\lvert O\rvert$ jobs. The result is $O$ with $j$ in place of one job $x \in O \setminus G_k$. That job comes after $j_{k+1}$ in the profit order, so $p_x \le p_j$, and the new set is optimal and keeps the invariant for $k + 1$. At the end, $G_n$ is contained in an optimal set that contains no rejected job, so $G_n$ is optimal.

**GATE use.** NAT: the maximum profit or the set of jobs. Sort by profit, place each job in the latest free slot at or before its deadline, and add up. Traps: putting a job in the earliest free slot, which blocks later jobs with tight deadlines, and sorting by deadline. The number of usable slots is the largest deadline, which caps the number of jobs.

**Check.** Six jobs with (deadline, profit) $(2, 100), (1, 19), (2, 27), (1, 25), (3, 15), (3, 90)$: J1 takes slot 2, J6 slot 3, J3 slot 1, and J4, J2 and J5 find no free slot; profit $100 + 90 + 27 = 217$, which brute force over all subsets confirms. A script ran greedy against brute force on 2,000 random instances of up to 8 jobs, and checked on every subset that the counting test in (1) agrees with scheduling by deadline.

## The DP framework: overlapping subproblems, Fibonacci and the cost of a table
<!-- topics: algo-design-paradigms.dp-framework -->

**Claim.** Take $F(0) = 0$, $F(1) = 1$ and $F(n) = F(n-1) + F(n-2)$, and let fib return $n$ for $n < 2$ and fib$(n-1) +$ fib$(n-2)$ otherwise.

1. Without memoization, fib$(n)$ makes $C(n) = 2F(n+1) - 1$ calls in total, which is $\Theta(\varphi^n)$ with $\varphi = (1+\sqrt5)/2 \approx 1.618$.
2. With memoization it makes $2n - 1$ calls for $n \ge 1$ and evaluates $n + 1$ distinct subproblems, in $O(n)$ time with $O(n)$ cache and $O(n)$ recursion depth. A bottom-up loop keeping the last two values uses $O(1)$ space.
3. In general a DP over a set of states whose dependencies form an acyclic graph runs in time $\sum_s w(s)$, where $w(s)$ is the work to combine the answers state $s$ depends on: (number of states) $\times$ (work per state) when the work is uniform. A bottom-up table is correct exactly when it fills states in an order where every dependency comes first.

**Proof.** (1) $C(0) = C(1) = 1$ and $C(n) = 1 + C(n-1) + C(n-2)$. The formula holds at $n = 0$ and $n = 1$, since $2F(1) - 1 = 2F(2) - 1 = 1$, and if it holds below $n$ then $C(n) = 1 + 2F(n) - 1 + 2F(n-1) - 1 = 2F(n+1) - 1$. For the growth rate, $x^2 = x + 1$ has roots $\varphi$ and $\psi = (1-\sqrt5)/2$, so $F(n) = A\varphi^n + B\psi^n$; the initial values force $A = -B = 1/\sqrt5$. Since $\lvert\psi\rvert < 1$, $F(n) = \Theta(\varphi^n)$, and $C(n) = \Theta(\varphi^n)$.

(2) With a cache, each fib$(k)$ for $2 \le k \le n$ is computed once and makes two calls; every other call is a base case or a cache hit and makes none. Counting the first call, there are $1 + 2(n-1) = 2n - 1$ calls. The chain fib$(n) \to$ fib$(n-1) \to \dots$ is $n$ frames deep.

(3) The cache, or the table, ensures each state is computed once, and its computation costs $w(s)$ beyond constant-time lookups. Lookups must find finished values, which is what a topological order of the dependency graph guarantees; a cycle would make the recursion loop. DP pays off when the plain recursion tree has far more nodes than there are distinct states, the overlapping subproblems of the claim. Merge sort's subproblems are disjoint, so caching them gains nothing. The other ingredient, optimal substructure, is proved for each problem by cut-and-paste: if the part of an optimal solution that solves a subproblem were not optimal for it, pasting in a better one would improve the whole (CLRS 15.3). When row $i$ of a table depends only on row $i - 1$, two rows suffice, which cuts $O(mn)$ space to $O(n)$.

**GATE use.** MCQ: the number of calls of a naive recursion. Write the call-count recurrence, which adds 1 per call, and do not confuse it with the value recurrence. MSQ statements: memoization and tabulation evaluate the same states, so neither is faster in general, though memoization can skip unreachable states and deep memoized recursion can overflow the stack. Time is states times work per state, so a table with $O(n^2)$ entries that each minimise over $O(n)$ choices costs $O(n^3)$.

**Check.** fib(5) makes $15 = 2F(6) - 1 = 2 \cdot 8 - 1$ calls and fib(6) makes $25 = 2 \cdot 13 - 1$. Memoized, fib(6) makes 11 calls and computes 7 distinct values, fib(0) to fib(6). A script confirmed $C(n) = 2F(n+1) - 1$ for $n \le 24$, the memoized count $2n - 1$ for $n \le 39$, and $F(n) = \operatorname{round}(\varphi^n/\sqrt5)$ for $n \le 60$.

## Coin change: fewest coins, combinations and ordered sums
<!-- topics: algo-design-paradigms.coin-change, algo-design-paradigms.greedy-principles, algo-design-paradigms.dp-framework -->

**Claim.** Coin values $c_1, \dots, c_k$ are positive integers in unlimited supply, and $A$ is the amount.

1. $M[0] = 0$ and $M[a] = 1 + \min_{c_i \le a} M[a - c_i]$ (infinite when no coin fits, or when no smaller amount can be made) is the fewest coins that make $a$.
2. With $W[0] = 1$, the loops "for each coin $c$, for $a = c$ to $A$: $W[a] \mathrel{+}= W[a-c]$" leave in $W[A]$ the number of multisets of coins that sum to $A$ (combinations).
3. Swapping the loops, $S[0] = 1$ and $S[a] = \sum_{c_i \le a} S[a - c_i]$ in increasing $a$, counts ordered sequences of coins that sum to $a$.

All three take $O(kA)$ time and $O(A)$ space. Largest-coin-first is optimal for $\lbrace 1, 5, 10\rbrace$ but not for every system.

**Proof.** (1) A fewest-coin multiset for $a \ge 1$ contains some coin $c$; removing it leaves a multiset for $a - c$, so $M[a] - 1 \ge M[a - c]$. Conversely adding $c$ to a best multiset for $a - c$ makes $a$ with $1 + M[a - c]$ coins. Taking the minimum over $c$ gives equality.

(2) Let $W_i[a]$ be the number of multisets of the first $i$ coin values summing to $a$. Split by whether $c_i$ is used: those without it number $W_{i-1}[a]$, and removing one copy of $c_i$ from those with it is a bijection onto the multisets for $a - c_i$ that may still use $c_i$. So $W_i[a] = W_{i-1}[a] + W_i[a - c_i]$. In pass $i$ of the loop, scanning $a$ upward, $W[a]$ still holds $W_{i-1}[a]$ when it is updated, and $W[a - c_i]$ has already been updated in this pass to $W_i[a - c_i]$. By induction on $i$, $W = W_i$ after pass $i$. Each multiset is counted once, in the order of the coin list, which is why the result counts combinations.

(3) Classify an ordered sequence summing to $a$ by its last coin $c$: removing it is a bijection onto the sequences for $a - c$. With the amount loop outside, every $S[a - c]$ is complete before $S[a]$ is formed. Sequences that differ only in order are counted separately, so this number exceeds the number of combinations whenever two different coin values appear together.

Greedy. For $\lbrace 1, 5, 10\rbrace$, a fewest-coin multiset has at most four 1s (five would be one 5) and at most one 5 (two would be one 10), so its 1s and 5s total at most 9. It must then use exactly $\lfloor A/10\rfloor$ tens and make the remainder below 10 with the fewest 5s and 1s, which is what greedy does. For $\lbrace 1, 3, 4\rbrace$ no such argument exists, and $A = 6$ breaks greedy.

**GATE use.** MCQ or NAT: greedy's coin count against the true minimum, or the number of ways to make an amount. Traps: assuming largest-first is optimal for any coin system, and putting the loops in the wrong order, which counts ordered sequences when combinations were asked for. Scanning amounts upward inside the coin loop is what allows reuse; it is the unbounded-knapsack scan of the next section.

**Check.** $\lbrace 1, 3, 4\rbrace$: $M[1..6] = 1, 2, 1, 1, 2, 2$, so $6 = 3 + 3$ needs 2 coins while greedy uses $4 + 1 + 1$, three. $\lbrace 1, 5, 10\rbrace$ at 18: greedy's $10 + 5 + 1 + 1 + 1$ is 5 coins, equal to $M[18]$. $\lbrace 1, 2, 5\rbrace$ at 5: 4 combinations ($5$, $2+2+1$, $2+1+1+1$, $1+1+1+1+1$) and $S = 1, 1, 2, 3, 5, 9$ for $a = 0..5$, so 9 ordered sequences. A script checked all three recurrences against direct enumeration on 300 random coin systems and amounts.

## 0/1 knapsack, subset sum and pseudo-polynomial time
<!-- topics: algo-design-paradigms.knapsack-01, algo-design-paradigms.dp-framework -->

**Claim.** Items $1, \dots, n$ have positive integer weights $w_i$ and values $v_i$, and the capacity $W$ is an integer. With $K[0][w] = 0$,

$$K[i][w] = \begin{cases} K[i-1][w] & w_i > w,\\ \max\big(K[i-1][w],\ v_i + K[i-1][w - w_i]\big) & w_i \le w, \end{cases}$$

and $K[n][W]$ is the best value of a subset of weight at most $W$. The table is $(n+1) \times (W+1)$, so time and space are $O(nW)$. One array of $W + 1$ entries suffices if each item's pass scans $w$ from $W$ down to $w_i$; scanning upward solves unbounded knapsack instead. $O(nW)$ is pseudo-polynomial. Subset sum (is there a subset with sum exactly $S$?) and partition (subset sum with $S$ equal to half the total, which must be even) use the same table with Boolean entries.

**Proof.** $K[i][w]$ is defined as the best value using items $1..i$ within capacity $w$. An optimal such subset either leaves item $i$ out, and is then an optimal subset of items $1..i-1$ within $w$, or contains it, which needs $w_i \le w$; the rest is then a subset of items $1..i-1$ within $w - w_i$, and it must be an optimal one, since a better one plus item $i$ would beat the whole (cut-and-paste). Both options are feasible, so the larger is $K[i][w]$.

One row. During pass $i$, the update of $K[w]$ reads $K[w - w_i]$. Scanning downward, the smaller index has not been rewritten in this pass, so it still holds $K[i-1][w - w_i]$ and item $i$ is used at most once. Scanning upward, $K[w - w_i]$ already holds $K[i][w - w_i]$, which may contain item $i$, and the update becomes $\max(K[w], v_i + K[w - w_i])$ over a row that already allows item $i$: that is the unbounded recurrence, in which item $i$ can be taken again.

Pseudo-polynomial. The input is written in about $\sum_i (\log w_i + \log v_i) + \log W$ bits. With $W = 2^b$ the running time $n \cdot 2^b$ is exponential in $b$, the length of $W$. The decision version of 0/1 knapsack is NP-complete, so no algorithm polynomial in the input length is expected; the table is fast only when $W$ is small.

Subset sum is knapsack with $v_i = w_i$: $R[i][s] = R[i-1][s] \lor R[i-1][s - x_i]$ with $R[0][0]$ true, and $S$ is reachable exactly when the best value within capacity $S$ equals $S$.

**GATE use.** NAT: fill a small table, or for 3 to 5 items enumerate the feasible subsets. MSQ statements: $O(nW)$ is not polynomial in the input size; greedy by ratio is not optimal for 0/1. Traps: an upward scan in the one-row version, and reading $K[i][w]$ as "exactly weight $w$" when the definition is "at most $w$".

**Check.** Capacity 5 with $(w, v) = (2, 3), (3, 4), (4, 5), (5, 6)$: rows $K[1..4][0..5]$ are $0,0,3,3,3,3$; $0,0,3,4,4,7$; $0,0,3,4,5,7$; $0,0,3,4,5,7$; so the answer is 7, from items 1 and 2. Capacity 50 with $(10, 60), (20, 100), (30, 120)$ gives 220. One item $(2, 3)$ and capacity 4: the downward scan gives 3, the upward scan 6. Partition: $\lbrace 3,1,1,2,2,1\rbrace$ (total 10) reaches 5, $\lbrace 1,5,11,5\rbrace$ reaches 11, and $\lbrace 2,3,7\rbrace$ (total 12) cannot reach 6. On 1,500 random instances a script found the 2-D table, the downward one-row version and brute force always equal, and the upward version equal to an unbounded-knapsack DP.

## LCS and edit distance: the last-character case split
<!-- topics: algo-design-paradigms.lcs-edit-distance, algo-design-paradigms.dp-framework -->

**Claim.** For strings $X = x_1 \dots x_m$ and $Y = y_1 \dots y_n$, with prefixes $X_i$ and $Y_j$:

1. LCS. $c[i][j]$, the length of a longest common subsequence of $X_i$ and $Y_j$, is $0$ when $i = 0$ or $j = 0$, $c[i-1][j-1] + 1$ when $x_i = y_j$, and $\max(c[i-1][j], c[i][j-1])$ otherwise.
2. Edit distance with unit-cost insert, delete and replace. $D[i][0] = i$, $D[0][j] = j$, $D[i][j] = D[i-1][j-1]$ when $x_i = y_j$, and otherwise $1 + \min(D[i-1][j], D[i][j-1], D[i-1][j-1])$ for delete, insert and replace.
3. Both run in $O(mn)$ time. The value alone needs two rows, $O(\min(m, n))$ space; recovering the subsequence or the edit script needs the whole table (or Hirschberg's divide-and-conquer).
4. If a replacement costs 2, or only insertions and deletions are allowed, the distance is $m + n - 2\,c[m][n]$.

**Proof.** (1) CLRS Theorem 15.1. Let $Z = z_1 \dots z_k$ be an LCS of $X_i$ and $Y_j$. If $x_i = y_j$ and $z_k \ne x_i$, appending $x_i$ to $Z$ gives a longer common subsequence, which is impossible; so $z_k = x_i = y_j$, and $z_1 \dots z_{k-1}$ is a common subsequence of $X_{i-1}$ and $Y_{j-1}$. It is a longest one, since a longer one followed by $x_i$ would beat $Z$. So $c[i][j] = c[i-1][j-1] + 1$. If $x_i \ne y_j$, then $z_k$ differs from $x_i$ or from $y_j$. If $z_k \ne x_i$, $Z$ is a common subsequence of $X_{i-1}$ and $Y_j$; if $z_k \ne y_j$, of $X_i$ and $Y_{j-1}$. So $c[i][j] \le \max(c[i-1][j], c[i][j-1])$, and the reverse inequality holds because a common subsequence of shorter prefixes is one of the longer prefixes.

(2) An optimal edit script corresponds to an alignment of $X_i$ and $Y_j$ in which each column pairs two characters (a match, or a replacement) or a character with a gap (a deletion or an insertion). Look at the last column: $x_i$ paired with $y_j$ costs $D[i-1][j-1]$ plus 0 or 1; $x_i$ deleted costs $1 + D[i-1][j]$; $y_j$ inserted costs $1 + D[i][j-1]$. The rest of the alignment must be optimal for the shorter prefixes, so $D[i][j]$ is the minimum of the three. When $x_i = y_j$ the diagonal term is never beaten: $D[i-1][j-1] \le 1 + D[i-1][j]$, because turning $X_{i-1}$ into $Y_j$ and then deleting the final $y_j$ turns it into $Y_{j-1}$; symmetrically, $D[i-1][j-1] \le 1 + D[i][j-1]$, by first appending $x_i$ to $X_{i-1}$ and then turning $X_i$ into $Y_{j-1}$. Turning $X_i$ into the empty string takes $i$ deletions and building $Y_j$ from it $j$ insertions, which gives the borders.

(3) There are $(m+1)(n+1)$ cells, each computed in $O(1)$ from its upper, left and upper-left neighbours. Row $i$ needs only row $i - 1$, so keeping two rows indexed by the shorter string gives the value in $O(\min(m, n))$ space; the traceback needs every row.

(4) A replacement of cost 2 is never better than a deletion plus an insertion, so some optimal alignment has only matches, deletions and insertions. Its $\ell$ matched columns spell a common subsequence, and it costs $(m - \ell) + (n - \ell)$, which is least when $\ell$ is as large as possible, $\ell = c[m][n]$.

**GATE use.** NAT: an LCS length or an edit distance of two short strings; fill the $(m+1) \times (n+1)$ table row by row. MSQ: the space for the value alone, and the time $O(mn)$. Traps: confusing a subsequence with a substring, whose recurrence resets to 0 on a mismatch and takes the maximum over all cells; and forgetting that the edit-distance border is $i$ and $j$, not 0.

**Check.** $\mathrm{LCS}(\mathtt{ABCBDAB}, \mathtt{BDCAB}) = 4$, with witnesses BCAB and BDAB. kitten to sitting costs 3 (replace k by s, replace e by i, append g). Their LCS is 4 (ittn), and with replacement costing 2 the distance is $6 + 7 - 2 \cdot 4 = 5$. On 400 random pairs of strings over $\lbrace a, b\rbrace$ of length up to 5, a script found the full LCS table, the two-row version and brute force equal, the edit DP equal to a breadth-first search over single edits, and the replace-2 distance equal to $m + n - 2\,\mathrm{LCS}$.

## Longest increasing subsequence: quadratic DP and patience sorting
<!-- topics: algo-design-paradigms.lis, algo-design-paradigms.dp-framework -->

**Claim.** For a sequence $a_1, \dots, a_n$ and strictly increasing subsequences:

1. $L[i] = 1 + \max\lbrace L[j] : j < i,\ a_j < a_i\rbrace$, or $1$ when no such $j$ exists, is the length of the longest increasing subsequence ending at position $i$, and the LIS length is $\max_i L[i]$; $O(n^2)$ time.
2. Patience sorting keeps an array $\mathit{tails}$ in which $\mathit{tails}[k]$ is the smallest last element of an increasing subsequence of length $k + 1$ among the elements read so far. For each new $x$, find the first entry $\ge x$ by binary search and overwrite it with $x$, or append $x$ if there is none. The final length of $\mathit{tails}$ is the LIS length; $O(n\log n)$ time.

**Proof.** (1) A longest increasing subsequence ending at $i$ is either $a_i$ alone or ends with some $a_j$, $j < i$, $a_j < a_i$, followed by $a_i$. The part ending at $a_j$ must be a longest one ending at $j$, or replacing it would give a longer subsequence ending at $i$. So $L[i]$ is 1 plus the best $L[j]$ over the valid $j$. Every increasing subsequence ends somewhere, so the LIS is $\max_i L[i]$. Each $i$ scans up to $i - 1$ predecessors, $O(n^2)$ in all.

(2) Two invariants. (I1) $\mathit{tails}[k]$ is the least possible last element of an increasing subsequence of length $k + 1$ so far. (I2) $\mathit{tails}$ is strictly increasing: an increasing subsequence of length $k + 2$ ending at $\mathit{tails}[k+1]$ contains one of length $k + 1$ ending at a smaller element, so $\mathit{tails}[k] < \mathit{tails}[k+1]$. Because of (I2) the binary search is valid. When $x$ arrives, let $q$ be the number of entries below $x$. An increasing subsequence ending at $x$ extends one whose last element is below $x$, so its length is at most $q + 1$, and length $q + 1$ is reached by extending the subsequence that ends at $\mathit{tails}[q-1] < x$. So $x$ can only improve the entry for length $q + 1$, which is $\mathit{tails}[q]$, the first entry $\ge x$: overwriting it with $x$ keeps (I1), and $\mathit{tails}[q-1] < x \le$ the old $\mathit{tails}[q] < \mathit{tails}[q+1]$ keeps (I2). If $q$ equals the length, $x$ makes a new longest subsequence and is appended. Shorter lengths keep their tails, which are already below $x$. At the end the number of entries is the longest length reached. For non-decreasing subsequences, search for the first entry strictly greater than $x$ instead.

The final $\mathit{tails}$ array need not be a subsequence of the input; only its length is meaningful. Recovering an actual LIS needs a predecessor pointer for each element.

**GATE use.** MCQ or NAT: the LIS length of a short sequence. Compute $L[i]$ left to right and take the maximum, not $L[n]$. The traps are strict against non-strict increase with repeated values, and reading the patience array as the answer sequence.

**Check.** For $10, 22, 9, 33, 21, 50, 41, 60, 80$: $L = 1, 2, 1, 3, 2, 4, 4, 5, 6$, so the LIS has length 6, for example $10, 22, 33, 50, 60, 80$. Patience sorting ends with $\mathit{tails} = 9, 21, 33, 41, 60, 80$, also 6 entries, though 21 comes after 33 in the input, so it is no subsequence. On 1,000 random sequences of up to 9 values in $0..9$, with repeats, a script found the two methods and brute force equal.

## Matrix-chain multiplication and the Catalan count
<!-- topics: algo-design-paradigms.interval-dp, algo-design-paradigms.dp-framework -->

**Claim.** Matrix $A_i$ has dimensions $p_{i-1} \times p_i$, and multiplying a $p \times q$ matrix by a $q \times r$ matrix costs $pqr$ scalar multiplications. The least cost of computing $A_i \cdots A_j$ is

$$m[i][j] = \min_{i \le k < j}\big(m[i][k] + m[k+1][j] + p_{i-1}\,p_k\,p_j\big), \qquad m[i][i] = 0,$$

filled in increasing chain length $j - i$. The minimisation runs over exactly $(n^3 - n)/6$ triples $(i, k, j)$, so the time is $\Theta(n^3)$ and the space $\Theta(n^2)$. A chain of $n$ matrices has $P(n) = C_{n-1} = \frac{1}{n}\binom{2n-2}{n-1}$ parenthesizations: $1, 1, 2, 5, 14, 42$ for $n = 1..6$.

**Proof.** The product of a $p \times q$ and a $q \times r$ matrix has $pr$ entries, each a dot product of length $q$, so $pqr$ multiplications. In an optimal parenthesization of $A_i \cdots A_j$ with $i < j$, the last multiplication splits it as $(A_i \cdots A_k)(A_{k+1} \cdots A_j)$ for some $i \le k < j$; the two factors are $p_{i-1} \times p_k$ and $p_k \times p_j$, so the last step costs $p_{i-1}p_kp_j$. Each factor must be computed optimally, or substituting a cheaper way would lower the total. Minimising over $k$ gives the recurrence. Every entry depends on strictly shorter chains, so filling by length puts each dependency first; filling row by row from the top would read entries not yet computed.

The work is one evaluation per triple $i \le k < j$ in $1..n$. The map $(i, k, j) \mapsto \lbrace i, k+1, j+1\rbrace$ is a bijection onto the 3-element subsets of $\lbrace 1, \dots, n+1\rbrace$, because $i < k + 1 < j + 1$, so there are $\binom{n+1}{3} = (n^3 - n)/6$ of them.

Counting. Splitting at the outermost multiplication gives $P(1) = 1$ and $P(n) = \sum_{k=1}^{n-1} P(k)P(n-k)$. With $G(x) = \sum_{n \ge 1} P(n)x^n$ this says $G = x + G^2$, so $G = \frac{1 - \sqrt{1 - 4x}}{2}$, with the minus sign because $G(0) = 0$. The binomial series gives $\sqrt{1-4x} = \sum_{m \ge 0}\binom{1/2}{m}(-4x)^m$, and $\binom{1/2}{m}(-4)^m = -\frac{2}{m}\binom{2m-2}{m-1}$ for $m \ge 1$, so the coefficient of $x^n$ in $G$ is $\frac{1}{n}\binom{2n-2}{n-1} = C_{n-1}$. Catalan numbers grow as $\Theta(4^n/n^{3/2})$, so trying every parenthesization is exponential.

**GATE use.** The 2-mark NAT gives 4 or 5 dimensions and asks for the least number of scalar multiplications. Fill length 2, then 3, then 4, trying every split. Traps: using $p_i p_k p_j$ in place of $p_{i-1}p_kp_j$, checking only one or two parenthesizations, and quoting $O(n^2)$ time because the table has $O(n^2)$ entries. A 1-mark question asks for the number of parenthesizations, $C_{n-1}$.

**Check.** $p = (30, 35, 15, 5, 10)$: $m_{12} = 15750$, $m_{23} = 2625$, $m_{34} = 750$; $m_{13} = \min(2625 + 5250, 15750 + 2250) = 7875$; $m_{24} = \min(750 + 5250, 2625 + 1750) = 4375$; $m_{14} = \min(4375 + 10500, 15750 + 750 + 4500, 7875 + 1500) = 9375$, from $(A_1(A_2A_3))A_4$. The five orders cost 9375, 14875, 16500, 19500 and 21000, and none costs 4500. A script compared the DP with brute force over all parenthesizations on 300 random chains of up to 6 matrices, confirmed $(n^3 - n)/6$ split evaluations for $n < 30$, $P(n) = \frac1n\binom{2n-2}{n-1}$ for $n \le 15$, a direct count of parenthesizations for $n \le 8$, and the binomial-series coefficients for $m \le 20$.

## Optimal binary search tree
<!-- topics: algo-design-paradigms.interval-dp, algo-design-paradigms.dp-framework -->

**Claim.** Keys $k_1 < \dots < k_n$ are searched with frequencies $f_1, \dots, f_n$, only successful searches count, and the cost of a BST is $\sum_t f_t \cdot \mathrm{depth}(k_t)$ with the root at depth 1. The least cost $e[i][j]$ of a BST on keys $i..j$ satisfies

$$e[i][j] = \min_{i \le r \le j}\big(e[i][r-1] + e[r+1][j]\big) + \sum_{t=i}^{j} f_t, \qquad e[i][i-1] = 0.$$

Filling by range length takes $O(n^3)$ time and $O(n^2)$ space; Knuth's observation that the best root moves monotonically, $\mathrm{root}[i][j-1] \le \mathrm{root}[i][j] \le \mathrm{root}[i+1][j]$, cuts the time to $O(n^2)$. Choosing the most frequent key as the root is not optimal in general.

**Proof.** In a BST on keys $i..j$ with root $k_r$, the BST order forces the left subtree to hold exactly keys $i..r-1$ and the right subtree keys $r+1..j$. Every key's depth in the whole tree is 1 more than its depth in its subtree, and the root has depth 1. So

$$\mathrm{cost} = f_r + \sum_{t=i}^{r-1} f_t(d_t^{L} + 1) + \sum_{t=r+1}^{j} f_t(d_t^{R} + 1) = \mathrm{cost}(L) + \mathrm{cost}(R) + \sum_{t=i}^{j} f_t .$$

The added sum does not depend on the shape of the subtrees, so each subtree should be optimal for its range, and the best tree minimises over the root $r$. An empty range costs 0. As in matrix chain, each entry depends on shorter ranges, so the table is filled by length; there are $O(n^2)$ ranges with $O(n)$ roots each. The CLRS version also has dummy keys for unsuccessful searches, with probabilities $q_i$ added to the range sum and to the base case; the structure of the recurrence is the same.

**GATE use.** NAT: the least cost for 3 or 4 keys, or which key is the root. Fill single keys first, then pairs, then triples, adding the range's total frequency at each level. Traps: the depth convention (root at depth 1 or 0; with depth 0 subtract $\sum f_t$), and putting the most frequent key at the root.

**Check.** Frequencies $34, 8, 50$: root $k_3$ with $k_1$ below it and $k_2$ below $k_1$ costs $50 + 2 \cdot 34 + 3 \cdot 8 = 142$; root $k_1$ costs $34 + 66 + 58 = 158$ (keys 2 and 3 below it cost 66 as a subtree, plus 58 for the extra level) and root $k_2$ costs $8 + 2 \cdot 84 = 176$; so the optimum is 142. Frequencies $10, 9, 9$: the most frequent key as root gives $10 + 2 \cdot 9 + 3 \cdot 9 = 55$, but root $k_2$ gives $9 + 2 \cdot 19 = 47$. Frequencies $4, 2, 6, 3$ give 26 with root $k_3$. A script compared the DP with brute force over all BSTs on 300 random frequency lists of up to 7 keys.

## Floyd–Warshall and Bellman–Ford as dynamic programs
<!-- topics: algo-design-paradigms.shortest-path-dp, algo-design-paradigms.dp-framework -->

**Claim.** A directed graph on vertices $1..V$ has real edge weights, possibly negative, no self-loops, and no negative cycle unless stated.

1. Floyd–Warshall. Let $d^{(k)}_{ij}$ be the least weight of an $i \to j$ path whose intermediate vertices all lie in $\lbrace 1, \dots, k\rbrace$, with $d^{(0)}_{ij}$ the edge weight, $0$ for $i = j$ and $\infty$ when there is no edge. Then $d^{(k)}_{ij} = \min\big(d^{(k-1)}_{ij},\ d^{(k-1)}_{ik} + d^{(k-1)}_{kj}\big)$, and $d^{(V)}$ holds the shortest distances. The loop over $k$ must be outermost; one matrix updated in place suffices; time $\Theta(V^3)$, space $\Theta(V^2)$. If the graph has a negative cycle, some diagonal entry ends negative, and conversely.
2. Bellman–Ford from source $s$. After round $i$ of relaxing every edge, $d[v]$ is at most the weight of every $s \to v$ path with at most $i$ edges, so $V - 1$ rounds give the shortest distances in $O(VE)$. A further round improves some $d[v]$ exactly when a negative cycle is reachable from $s$.

**Proof.** (1) With no negative cycle, a shortest path among those allowed can be taken simple. If it avoids $k$ as an intermediate, its weight is $d^{(k-1)}_{ij}$. If it passes through $k$, it does so once, and splitting it there gives an $i \to k$ and a $k \to j$ path with intermediates in $\lbrace 1, \dots, k-1\rbrace$, each shortest of its kind, or the whole could be improved. The minimum of the two cases is the recurrence. Layer $k$ reads all of layer $k - 1$, so $k$ is outermost and $i, j$ may run in any order. In-place updates are safe: in round $k$ the entries $d_{ik}$ and $d_{kj}$ would become $\min(d_{ik}, d_{ik} + d_{kk})$ and $\min(d_{kj}, d_{kk} + d_{kj})$, and $d_{kk} \ge 0$ leaves them unchanged, so mixing old and new values reads the same numbers.

Negative cycles. Every entry is always the weight of some walk, so a negative $d_{ii}$ exhibits a closed walk of negative weight, which contains a negative simple cycle. Conversely, by the same induction, after round $k$ the entry $d_{ii}$ is at most the weight of any simple cycle through $i$ whose other vertices are at most $k$: split the cycle at its highest other vertex $h$ into $i \to h$ and $h \to i$ paths, both bounded by round $h - 1$. A negative cycle through $i$ therefore leaves $d_{ii} < 0$ after round $V$.

(2) Each $d[v]$ is always the weight of some walk from $s$, and it only decreases. Induction on $i$: an $s \to v$ path with at most $i$ edges whose last edge is $(u, v)$ has a prefix of at most $i - 1$ edges, whose weight bounds $d[u]$ after round $i - 1$; relaxing $(u, v)$ in round $i$ makes $d[v] \le d[u] + w(u, v)$, at most the path's weight. Without negative cycles shortest paths are simple and have at most $V - 1$ edges, so after $V - 1$ rounds $d[v] = \delta(s, v)$; the distances then satisfy $\delta(v) \le \delta(u) + w(u, v)$ on every edge, and an extra round changes nothing. If instead a negative cycle $v_0, v_1, \dots, v_\ell = v_0$ is reachable and no edge improves, then $d[v_t] \le d[v_{t-1}] + w(v_{t-1}, v_t)$ for every $t$, and summing around the cycle gives $0 \le w(C) < 0$, a contradiction. The DP state is $(v, i)$, "best weight to $v$ with at most $i$ edges", computed one layer per round.

**GATE use.** MCQs on the loop order (k outermost), the time ($\Theta(V^3)$ against $O(VE)$), negative edges (both handle them, Dijkstra does not) and negative-cycle detection (the diagonal; an extra improving round). Short NATs ask for an entry of $d^{(k)}$ after a given round; apply only the vertices $1..k$ as intermediates. The trap is putting $k$ inside the $i$ and $j$ loops, which looks like the same recurrence but is wrong.

**Check.** Edges $0 \to 1$ (3), $0 \to 2$ (8), $1 \to 2$ ($-2$), $2 \to 3$ (1), $3 \to 0$ (2), $1 \to 3$ (7) give the final rows $(0, 3, 1, 2)$, $(1, 0, -2, -1)$, $(3, 6, 0, 1)$ and $(2, 5, 3, 0)$; for example $d(0, 3) = 3 - 2 + 1 = 2$ along $0, 1, 2, 3$. A script generated 800 random graphs of up to 6 vertices with weights from $-3$ to 9. On the 639 without a negative cycle, Floyd–Warshall, Bellman–Ford from every source and brute force over simple paths agreed. A negative diagonal entry appeared exactly on the 161 graphs with a negative cycle, and moving $k$ to the innermost loop gave wrong distances on 136 of the 639.
