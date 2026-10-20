# Complexity, sorting and searching: derivations

## The five asymptotic relations and the limit test
<!-- topics: algo-complexity-sorting.asymptotic-notation, algo-complexity-sorting.notation-properties -->

**Claim.** Let $f, g$ be functions from the positive integers to the nonnegative reals, with $g(n) > 0$ for large $n$. Write $f = O(g)$ when some $c > 0$ and $n_0$ give $f(n) \le c\,g(n)$ for all $n \ge n_0$; $f = \Omega(g)$ when some $c > 0$ and $n_0$ give $f(n) \ge c\,g(n)$ for all $n \ge n_0$; $f = \Theta(g)$ when both hold; $f = o(g)$ when for **every** $c > 0$ some $n_0$ gives $f(n) < c\,g(n)$ for $n \ge n_0$; $f = \omega(g)$ when for every $c > 0$ eventually $f(n) > c\,g(n)$. Then:

1. Limit test. If $L = \lim_{n\to\infty} f(n)/g(n)$ exists, then $L = 0$ gives $f = o(g)$ and so $f = O(g)$ but $f \ne \Omega(g)$; $0 < L < \infty$ gives $f = \Theta(g)$; $L = \infty$ gives $f = \omega(g)$ and so $f = \Omega(g)$ but $f \ne O(g)$. If the limit does not exist, the test is silent.
2. All five relations are transitive. $O$, $\Omega$, $\Theta$ are reflexive, $o$ and $\omega$ are not. Only $\Theta$ is symmetric. Transpose symmetry: $f = O(g) \iff g = \Omega(f)$ and $f = o(g) \iff g = \omega(f)$.
3. $O(f) + O(g) = O(\max(f, g))$, $O(f) \cdot O(g) = O(fg)$ and $O(cf) = O(f)$ for a constant $c > 0$; a constant inside an exponent does not vanish: $2^{n+1} = \Theta(2^n)$ but $2^{2n} \ne O(2^n)$.

**Proof.** (1) If $0 < L < \infty$, take $\varepsilon = L/2$ in the definition of the limit: for $n \ge n_0$, $L/2 \le f(n)/g(n) \le 3L/2$, so $c_1 = L/2$ and $c_2 = 3L/2$ witness $\Theta$. If $L = 0$, for every $c > 0$ the ratio is eventually below $c$, which is the definition of $o$; taking $c = 1$ gives $O$. It is not $\Omega$: that would need $f/g \ge c > 0$ for all large $n$, contradicting $f/g \to 0$. The case $L = \infty$ is the mirror image. When $f/g$ oscillates the test gives nothing: $f(n) = n$ for even $n$ and $n^2$ for odd $n$ against $g = n^{1.5}$ has ratio $n^{-0.5}$ on evens and $n^{0.5}$ on odds, so $f$ is neither $O(g)$ nor $\Omega(g)$.

(2) If $f \le c_1 g$ from $n_1$ on and $g \le c_2 h$ from $n_2$ on, then $f \le c_1 c_2 h$ from $\max(n_1, n_2)$ on; the same chaining works for $\Omega$, and for $o$ choose the two constants as $\sqrt{c}$ each. $f \le 1 \cdot f$ gives reflexivity of $O$, $\Omega$, $\Theta$, while $f < c f$ fails at $c = 1$, so $o$ is not reflexive. $f \le c g \iff g \ge (1/c) f$ is transpose symmetry, and applying it to both halves of $\Theta$ gives symmetry of $\Theta$. $O$ is not symmetric: $n = O(n^2)$ but $n^2 \ne O(n)$.

(3) If $f_1 \le c_1 g_1$ and $f_2 \le c_2 g_2$ then $f_1 + f_2 \le (c_1 + c_2)\max(g_1, g_2)$ and $f_1 f_2 \le c_1 c_2\, g_1 g_2$. $2^{n+1}/2^n = 2$, a positive constant, while $2^{2n}/2^n = 2^n \to \infty$, so by (1) $4^n = \omega(2^n)$.

**GATE use.** MSQs list statements like $2^{n+1} = O(2^n)$, $2^{2n} = O(2^n)$, $f = O(g) \Rightarrow g = O(f)$; decide each by the ratio. The traps: an $O$ statement is only an upper bound, so $n = O(n^2)$ is true and a question asking for the tight order wants $\Theta$; the constant in an exponent matters; and $n^{1/\log_b n} = b$ is a constant ($2$ with $\log_2$), not $e$.

**Check.** $3n^2 + 5n + 2$ lies between $3n^2$ and $10n^2$ for all $n \ge 1$, with equality on the right at $n = 1$; a script tested every $n < 10^5$. It also confirmed $n^{1/\log_b n} = b$ for $b = 2, e, 10$ at $n = 10, 10^3, 10^9$.

## The growth-rate hierarchy and Stirling's bound on log n!
<!-- topics: algo-complexity-sorting.growth-hierarchy -->

**Claim.** For constants $a, b > 0$ and $\beta > 1$, logs are $o$ of every power and powers are $o$ of every exponential:

$$(\log n)^a = o(n^b), \qquad n^a = o(\beta^n), \qquad \beta^n = o(n!), \qquad n! = o(n^n),$$

and

$$\ln n! = n \ln n - n + \Theta(\log n), \quad\text{so}\quad \log_2 n! = n\log_2 n - n\log_2 e + \Theta(\log n) = \Theta(n \log n).$$

Two functions in the same band are compared by comparing their logarithms; when the logs differ by an unbounded amount, the original functions are in $o$ relation.

**Proof.** Start with $n^a = o(\beta^n)$. The ratio $r_n = n^a/\beta^n$ has $r_{n+1}/r_n = (1 + 1/n)^a/\beta \to 1/\beta < 1$, so for large $n$ the ratio shrinks by a factor at most $\rho = (1 + 1/\beta)/2 < 1$ per step and $r_n \to 0$. Substituting $n = 2^m$ turns $(\log_2 n)^a / n^b$ into $m^a / (2^b)^m$, which is the previous statement with $\beta = 2^b > 1$. For $\beta^n/n!$: once $n > 2\beta$ each further factor $\beta/k$ is below $1/2$, so the ratio tends to 0. And $n!/n^n = \prod_{k=1}^{n} (k/n) \le 1/n$.

For $\ln n!$, use that $\ln$ is concave, so on each unit interval it lies above its chord and below its tangent. The chord gives $\int_{k-1}^{k} \ln x\,dx \ge \tfrac12(\ln(k-1) + \ln k)$; summing over $k = 2, \dots, n$,

$$n \ln n - n + 1 = \int_1^n \ln x\,dx \;\ge\; \ln n! - \tfrac12 \ln n.$$

The tangent at $k$ gives $\int_{k-1/2}^{k+1/2} \ln x\,dx \le \ln k$; summing over $k = 1, \dots, n$,

$$\ln n! \;\ge\; \int_{1/2}^{n+1/2} \ln x\,dx = (n + \tfrac12)\ln(n + \tfrac12) - n + \tfrac12\ln 2 \;\ge\; n\ln n - n + \tfrac12 \ln n + \tfrac12 \ln 2.$$

So $\ln n! = n \ln n - n + e_n$ with $\tfrac12\ln n + \tfrac12\ln 2 \le e_n \le \tfrac12 \ln n + 1$, which is $\Theta(\log n)$ for $n \ge 2$; dividing by $\ln 2$ gives the base-2 form, since $n/\ln 2 = n \log_2 e$. Stirling's formula sharpens the error to $\tfrac12 \ln(2\pi n) + o(1)$. A cruder route to $\Theta(n\log n)$: $n! \le n^n$, and the largest $\lceil n/2 \rceil$ factors of $n!$ are each at least $n/2$, so $n! \ge (n/2)^{n/2}$, which puts $\log n!$ between $\tfrac{n}{2}\log\tfrac{n}{2}$ and $n\log n$.

For two awkward functions, $\log_2 n^{\log_2 n} = (\log_2 n)^2$ and $\log_2 2^{\sqrt n} = \sqrt n$; the difference $\sqrt n - (\log_2 n)^2 \to \infty$ by the first result, so $n^{\log n} = o(2^{\sqrt n})$. Its log also exceeds $k \log_2 n$ for every fixed $k$, so $n^{\log n}$ outgrows every polynomial. Equal logs up to a bounded difference mean a constant ratio; logs that differ by a constant factor do not: $\log 4^n = 2\log 2^n$, yet $4^n = \omega(2^n)$.

**GATE use.** Ordering MSQs and "which grows fastest" MCQs: place each function in its band (constant, $\log\log$, polylog, polynomial, $n^{\log n}$, exponential, factorial, $n^n$), then take logs inside a band. Traps: treating $n^{\log n}$ as polynomial, calling $\log n!$ larger than $n \log n$, and deciding asymptotic order from small values: $100n$ exceeds $0.01n^2$ for every $n < 10\,000$.

**Check.** At $n = 2^{16}$, $(\log_2 n)^2 = 256 = \sqrt n$, and for $n = 2^{17}, 2^{20}, 2^{30}, 2^{64}$ the square root is larger, so $2^{\sqrt n}$ overtakes $n^{\log n}$ only past 65,536. $(\log_2 n)^3 < n^{0.5}$ holds from $n = 2^{30}$ on and fails at $2^{29}$. For $n = 10$: $\log_2 10! = 21.791$, $n\log_2 n - n\log_2 e = 18.792$, and the gap $2.999$ is close to $\tfrac12\log_2(20\pi) = 2.987$; at $n = 1000$ both are $6.309$. A script verified $(n/2)^{\lfloor n/2\rfloor} \le n! \le n^n$ for $n < 200$.

## Counting loop iterations, cost cases and amortized cost
<!-- topics: algo-complexity-sorting.loop-analysis, algo-complexity-sorting.case-analysis -->

**Claim.** For $n \ge 1$, with $L = \lfloor \log_2 n \rfloor$:

1. `for (i = 1; i <= n; i = 2*i)` runs $L + 1$ times, and so does `for (i = n; i >= 1; i = i/2)` with integer division.
2. A doubling outer loop whose inner loop runs $i$ times executes the body $\sum_{j=0}^{L} 2^j = 2^{L+1} - 1 \le 2n - 1$ times, with equality exactly when $n$ is a power of 2. This is $\Theta(n)$.
3. An outer loop $i = 1..n$ with an inner loop stepping $j$ from 1 to $n$ by $i$ executes $\sum_{i=1}^{n} \lceil n/i \rceil$ times, between $nH_n$ and $nH_n + n$, where $H_n = \sum_{i=1}^n 1/i = \ln n + O(1)$; so $\Theta(n \log n)$.
4. `for (i = 2; i <= n; i = i*i)` runs $\lfloor \log_2 \log_2 n \rfloor + 1$ times for $n \ge 2$.
5. Best and worst case are the minimum and maximum cost over inputs of size $n$, average case the expectation under a stated distribution, and amortized cost the total over a worst-case sequence of operations divided by its length. Appending $n$ items to an array that doubles its capacity when full (starting at capacity 1) copies fewer than $2n$ items in total, so an append is $O(1)$ amortized although one append can cost $\Theta(n)$.

**Derivation.** (1) After $t$ iterations $i = 2^t$, and the loop runs while $2^t \le n$, that is for $t = 0, 1, \dots, L$: $L + 1$ values. Halving from $n$ visits $\lfloor n/2^t \rfloor$, which is at least 1 exactly when $2^t \le n$, the same count.

(2) The outer loop takes $i = 2^0, \dots, 2^L$, and the geometric sum is $2^{L+1} - 1$. Since $2^L \le n$, this is at most $2n - 1$, with equality iff $2^L = n$; since $2^{L+1} > n$ it is at least $n$, so $\Theta(n)$. Multiplying "$\log n$ outer iterations" by "$n$ inner iterations" overcounts because most outer values are small.

(3) For fixed $i$, $j$ takes the values $1, 1+i, 1+2i, \dots$ up to $n$, which is $\lceil n/i \rceil$ values, and $n/i \le \lceil n/i \rceil < n/i + 1$. Summing gives the bounds. $H_n$ lies between $\int_1^{n+1} dx/x = \ln(n+1)$ and $1 + \int_1^n dx/x = 1 + \ln n$, by comparing each term $1/i$ with the integral over an adjacent unit interval.

(4) After $t$ squarings $i = 2^{2^t}$, and $2^{2^t} \le n \iff 2^t \le \log_2 n \iff t \le \log_2\log_2 n$, so $t = 0, \dots, \lfloor \log_2\log_2 n\rfloor$.

(5) Linear search on $n$ items probes 1 item at best and $n$ at worst; if the key is present and equally likely at each position the mean is $\frac{1}{n}\sum_{k=1}^n k = \frac{n+1}{2}$, still $\Theta(n)$. For the array, copies happen when the size reaches $1, 2, 4, \dots, 2^m$ with $2^m < n$, and copy that many items, so the total is $2^{m+1} - 1 < 2n$. The bound holds for every sequence, so no probability enters; that separates amortized from average cost. A worst-case $O$ bound is the informative statement, and a lower bound on the best case is stated with $\Omega$.

**GATE use.** The 2-mark NAT "how many times does `count++` run": write the outer values explicitly, count the inner loop for each, sum the series, and test with $n = 8$. Traps: $\lfloor \log_2 n \rfloor + 1$ against $\log_2 n$ (off by one, and wrong when $n$ is not a power of 2), the geometric sum read as $n \log n$, and the harmonic sum read as $n^2$.

**Check.** For $n = 64$ the doubling loop with inner loop to $i$ runs $1 + 2 + \dots + 64 = 127 = 2n - 1$ times, and the doubling loop alone runs $\lfloor\log_2 1000\rfloor + 1 = 10$ times for $n = 1000$. The harmonic loop gives 33, 573 and 8053 for $n = 10, 100, 1000$, inside $[nH_n, nH_n + n]$ (for $n = 1000$, $nH_n = 7485.5$). The squaring loop runs 3 times at $n = 255$ ($i = 2, 4, 16$), 4 at $n = 256$ and 5 at $n = 65\,536$. A script checked claims 1 and 2 for every $n < 5000$, and the doubling array copies 1023 items for 1024 appends and 2047 for 1025, both below $2n$.

## Recursion trees and the master theorem
<!-- topics: algo-complexity-sorting.recurrence-methods, algo-complexity-sorting.master-theorem -->

**Claim.** Let $T(n) = aT(n/b) + f(n)$ with constants $a \ge 1$, $b > 1$, $f \ge 0$, $T(1) = \Theta(1)$, and $n$ an exact power of $b$ (floors and ceilings change only constants; CLRS 4.6). Put $c^* = \log_b a$. Then

$$T(n) = \Theta\!\left(n^{c^*}\right) + \sum_{j=0}^{\log_b n - 1} a^j f\!\left(\frac{n}{b^j}\right),$$

and

1. if $f(n) = O(n^{c^* - \varepsilon})$ for some $\varepsilon > 0$, then $T(n) = \Theta(n^{c^*})$;
2. if $f(n) = \Theta(n^{c^*} \log^k n)$ with $k \ge 0$, then $T(n) = \Theta(n^{c^*} \log^{k+1} n)$;
3. if $f(n) = \Omega(n^{c^* + \varepsilon})$ for some $\varepsilon > 0$ and $a f(n/b) \le q f(n)$ for some constant $q < 1$ and all large $n$, then $T(n) = \Theta(f(n))$.

**Derivation.** Unroll the recurrence as a tree. Depth $j$ has $a^j$ nodes, each a subproblem of size $n/b^j$ doing $f(n/b^j)$ non-recursive work. Sizes reach 1 at depth $\log_b n$, where there are $a^{\log_b n} = n^{\log_b a} = n^{c^*}$ leaves (take $\log_b$ of both sides: $\log_b n \cdot \log_b a$ each), each costing $\Theta(1)$. Adding the levels gives the sum. The key identity is $a / b^{c^*} = 1$.

Case 1. $a^j (n/b^j)^{c^*-\varepsilon} = n^{c^*-\varepsilon} (a/b^{c^*})^j (b^{\varepsilon})^j = n^{c^*-\varepsilon} b^{\varepsilon j}$. The sum over $j < \log_b n$ is an increasing geometric series, $n^{c^*-\varepsilon}\,\frac{b^{\varepsilon\log_b n} - 1}{b^\varepsilon - 1} = n^{c^*-\varepsilon}\,\frac{n^\varepsilon - 1}{b^\varepsilon - 1} = O(n^{c^*})$, so the leaves dominate.

Case 2. $a^j (n/b^j)^{c^*} \log^k(n/b^j) = n^{c^*} \log^k(n/b^j)$: every level costs $n^{c^*}$ times a log power. With $\log_b(n/b^j) = \log_b n - j$ the sum is $n^{c^*}$ times $\sum_{i=1}^{\log_b n} i^k$ (up to the constant change of log base), and $\sum_{i=1}^{m} i^k = \Theta(m^{k+1})$ because the top half of the terms are each at least $(m/2)^k$ and all are at most $m^k$. So $T(n) = \Theta(n^{c^*}\log^{k+1} n)$, the leaves adding only $\Theta(n^{c^*})$.

Case 3. Iterating regularity gives $a^j f(n/b^j) \le q^j f(n)$, so the sum is at most $f(n)/(1-q)$, and at least $f(n)$ (its $j = 0$ term). Since $f(n) = \Omega(n^{c^*+\varepsilon})$, the leaves' $\Theta(n^{c^*})$ is $o(f(n))$, and $T(n) = \Theta(f(n))$. Regularity holds for every polynomial $f(n) = n^d$ with $d > c^*$, where $q = a/b^d < 1$; it must be checked for oscillating $f$.

The theorem has gaps. $T(n) = 2T(n/2) + n/\log_2 n$ has $c^* = 1$ and $f$ below $n$ by only a log factor, so case 1 fails; the level sum is $\sum_{j} n/(\log_2 n - j) = nH_{\log_2 n} = \Theta(n \log\log n)$. Subtractive recurrences such as $T(n-1) + 1$ are outside the form entirely.

**GATE use.** The 1-mark MCQ: read off $a$, $b$, $f$, compute $n^{\log_b a}$ and compare. The classic trap is $2T(n/2) + n\log n$ called case 3; the excess over $n$ is a log factor, so it is case 2 with $k = 1$ and the answer $\Theta(n\log^2 n)$. Others: forgetting the extra log in case 2, and answering $\Theta(f)$ in case 3 without regularity.

**Check.** With $T(1) = 1$ and $n = 2^k$, a script solved in exact fractions: $2T(n/2) + n\log_2 n = n(1 + k(k+1)/2)$, which is 57,344 at $n = 1024$ and $\Theta(n\log^2 n)$; $8T(n/2) + n^2 = 2n^3 - n^2$ (case 1); $4T(n/2) + n^3 = 2n^3 - n^2$ (case 3); $3T(n/4) + n = 4n - 3n^{\log_4 3}$, which is $\Theta(n)$ although $a > 1$; and $2T(n/2) + n/\log_2 n = n(1 + H_k)$ for $k \le 29$.

## Substitution and subtract-and-conquer recurrences
<!-- topics: algo-complexity-sorting.recurrence-methods -->

**Claim.**

1. Substitution: $T(n) = 2T(\lfloor n/2 \rfloor) + n$ with $T(1) = 1$ satisfies $T(n) \le c\,n\log_2 n$ for all $n \ge 2$ when $c \ge 2$; for $n = 2^k$ it equals $n\log_2 n + n$ exactly.
2. With $T(0) = 0$: $T(n) = T(n-1) + 1$ gives $n$; $T(n) = T(n-1) + n$ gives $n(n+1)/2$; $T(n) = T(n-1) + \log_2 n$ gives $\log_2 n! = \Theta(n\log n)$.
3. $T(n) = 2T(n-1) + 1$ gives $2^{n+1} - 1$ when $T(0) = 1$ and $2^n - 1$ when $T(0) = 0$ (Towers of Hanoi).
4. $T(n) = T(n-1) + T(n-2)$ with positive initial values is $\Theta(\varphi^n)$, $\varphi = (1 + \sqrt5)/2 \approx 1.618$.

**Proof.** (1) Assume $T(m) \le c\,m\log_2 m$ for $2 \le m < n$. For $n \ge 4$, $m = \lfloor n/2 \rfloor \ge 2$ and $T(n) \le 2c\,\tfrac{n}{2}\log_2\tfrac{n}{2} + n = cn\log_2 n - cn + n \le cn\log_2 n$ when $c \ge 1$. That is the inductive step; the base cases need more: $T(2) = 4 \le 2c$ and $T(3) = 2 + 3 = 5 \le 3c\log_2 3$ force $c \ge 2$. A guess must reproduce its exact form: trying $T(n) \le cn$ gives $cn + n$, which is not $\le cn$ for any $c$, so the induction fails, as it should. For $n = 2^k$, $T(n)/n = T(n/2)/(n/2) + 1$, which telescopes to $k + 1$.

(2) Unrolling, $T(n) = T(0) + \sum_{i=1}^{n} g(i)$ for $T(n) = T(n-1) + g(n)$; the three sums are $n$, $n(n+1)/2$ and $\sum_{i=1}^{n}\log_2 i = \log_2 n!$, which is $\Theta(n\log n)$ by the hierarchy section.

(3) $U(n) = T(n) + 1$ satisfies $U(n) = 2U(n-1)$, so $U(n) = 2^n U(0)$. $T(0) = 1$ gives $U(0) = 2$ and $T(n) = 2^{n+1} - 1$; $T(0) = 0$ gives $2^n - 1$.

(4) $\varphi^2 = \varphi + 1$. Let $c_1 = \min(T(0), T(1)/\varphi)$ and $c_2 = \max(T(0), T(1)/\varphi)$; then $c_1\varphi^m \le T(m) \le c_2\varphi^m$ for $m = 0, 1$, and if it holds for $n-1$ and $n-2$, then $T(n) \le c_2(\varphi^{n-1} + \varphi^{n-2}) = c_2\varphi^{n-2}(\varphi + 1) = c_2\varphi^n$, and likewise from below.

**GATE use.** Recurrence MCQs where the master theorem does not apply because the argument decreases by a constant: expand into a sum. Traps: the base case changes the exact value ($2^{n+1} - 1$ against $2^n - 1$), $T(n-1) + n$ is quadratic, not $n\log n$, and $2T(n-1) + 1$ is exponential, not linear.

**Check.** A script confirmed $T(n) = n\log_2 n + n$ for $n = 2^k$, $k \le 20$, with $T(2) = 4$, so $c = 1$ fails at the base; the sums $n(n+1)/2$ for $n < 200$; both forms of claim 3 for $n < 60$; $\sum_{i=2}^{1000}\log_2 i = 8529.398 = \log_2 1000!$; and a Fibonacci ratio of $1.6180339887$ after 60 steps.

## Uneven splits, Akra–Bazzi and change of variable
<!-- topics: algo-complexity-sorting.irregular-recurrences -->

**Claim.**

1. $T(n) = T(n/3) + T(2n/3) + n$ is $\Theta(n\log n)$.
2. Akra–Bazzi (CLRS 4.7; Leighton's 1996 note): for $T(n) = \sum_{i} a_i T(b_i n) + f(n)$ with constants $a_i > 0$, $0 < b_i < 1$ and $f$ of polynomial growth, let $p$ solve $\sum_i a_i b_i^{\,p} = 1$; then $T(n) = \Theta\!\left(n^p\left(1 + \int_1^n \frac{f(u)}{u^{p+1}}\,du\right)\right)$.
3. $T(n) = \sqrt n\,T(\sqrt n) + n$ is $\Theta(n\log\log n)$.
4. $T(n) = 2T(\sqrt n) + \log n$ is $\Theta(\log n\cdot\log\log n)$.

**Proof.** (1) In the recursion tree a node of size $s$ has children of sizes $s/3$ and $2s/3$, which sum to $s$, so every complete level costs exactly $n$, and an incomplete level costs at most $n$. The shortest root-to-leaf path follows the $1/3$ branches and has length $\log_3 n$; the longest follows the $2/3$ branches and has length $\log_{3/2} n$. So the first $\log_3 n$ levels are complete, giving $T(n) \ge n\log_3 n$, and there are at most $\log_{3/2} n$ levels, giving $T(n) \le n\log_{3/2} n$ plus the leaves. A node of size $s$ has $O(s)$ leaves below it (by induction, $\ell(s) \le \ell(s/3) + \ell(2s/3)$ with $\ell(s) \le Cs$ closing), so the leaves add $O(n)$. Both bounds are $\Theta(n\log n)$. In Akra–Bazzi terms, $(1/3)^p + (2/3)^p = 1$ at $p = 1$, and $n\left(1 + \int_1^n u/u^2\,du\right) = n(1 + \ln n)$.

(2) A sketch by substitution, ignoring floors (Leighton's note handles them). Let $g(n) = n^p\left(1 + \int_1^n f(u)u^{-p-1}\,du\right)$. Since $\sum_i a_i b_i^{\,p} = 1$,

$$\sum_i a_i\,g(b_i n) = \sum_i a_i b_i^{\,p} n^p\left(1 + \int_1^{b_i n} \frac{f(u)}{u^{p+1}}\,du\right) = g(n) - n^p \sum_i a_i b_i^{\,p} \int_{b_i n}^{n} \frac{f(u)}{u^{p+1}}\,du.$$

Polynomial growth means $f(u) = \Theta(f(n))$ for $u \in [b_i n, n]$, and $\int_{b_i n}^n u^{-p-1}\,du = \Theta(n^{-p})$ because $b_i$ is a constant, so each integral is $\Theta(f(n)/n^p)$ and the subtracted term is $\Theta(f(n))$. Hence $g(n) = \sum_i a_i g(b_i n) + \Theta(f(n))$: $g$ satisfies the recurrence up to a constant factor on the driving term. Induction then closes both ways. If $T(m) \le c\,g(m)$ below $n$, then $T(n) \le c\sum_i a_i g(b_i n) + f(n) = c\,g(n) - c\,\Theta(f(n)) + f(n) \le c\,g(n)$ once $c$ exceeds the reciprocal of the lower constant in that $\Theta$, and $c$ is raised further to cover the base cases; the lower bound $T(n) \ge c'g(n)$ is symmetric with a small $c'$. The theorem needs subproblem sizes that are constant fractions $b_i n$. A call on $\sqrt n$ is not of that form, so claims 3 and 4 need a change of variable.

(3) Divide by $n$: $\frac{T(n)}{n} = \frac{T(\sqrt n)}{\sqrt n} + 1$. With $S(n) = T(n)/n$, $S(n) = S(\sqrt n) + 1$. Starting from $n = 2^{2^k}$, $k$ square roots reach 2, and $k = \log_2\log_2 n$, so $S(n) = S(2) + \log_2\log_2 n$ and $T(n) = n(\log_2\log_2 n + S(2)) = \Theta(n\log\log n)$.

(4) Put $m = \log_2 n$ and $S(m) = T(2^m)$. Then $\sqrt n = 2^{m/2}$ and $S(m) = 2S(m/2) + m$, case 2 of the master theorem, so $S(m) = \Theta(m\log m)$ and $T(n) = \Theta(\log n\,\log\log n)$.

**GATE use.** MCQs with uneven splits or square roots. Traps: applying the master theorem to $\sqrt n\,T(\sqrt n) + n$ or reading it as $n\log n$, and taking the number of levels of the uneven tree as $\log_3 n$ (the shortest path) and concluding $\Theta(n)$ from the shallow side.

**Check.** A memoised evaluation of claim 1 with integer splits gave $T(n)/(n\log_2 n) = 1.118, 1.104, 1.099$ at $n = 10^3, 10^5, 10^7$, settling near $1/(\tfrac13\log_2 3 + \tfrac23\log_2\tfrac32) \approx 1.089$, the reciprocal of the split's entropy. With $T(2) = 1$, exact evaluation gave $T(n) = n(\log_2\log_2 n + \tfrac12)$ for claim 3 and $T(n) = \log_2 n\,(\log_2\log_2 n + 1)$ for claim 4, both at $n = 2^{2^k}$ for $k \le 5$.

## Binary search: invariant, exact probe count and the search lower bound
<!-- topics: algo-complexity-sorting.linear-binary-search, algo-complexity-sorting.search-variants -->

**Claim.** Iterative binary search on a sorted array $a[0..n-1]$ keeps `lo`, `hi`, loops while `lo <= hi`, probes `mid = lo + (hi - lo)/2` with one three-way comparison, and sets `lo = mid + 1` or `hi = mid - 1`.

1. It is correct: if $x$ is in the array, it is in $a[lo..hi]$ at every loop test.
2. The largest number of iterations over all keys, present or absent, is $W(n) = \lfloor\log_2 n\rfloor + 1 = \lceil\log_2(n+1)\rceil$.
3. No algorithm that learns about $x$ only by three-way comparisons with array elements does better in the worst case.
4. Lower bound (first $i$ with $a[i] \ge x$) and upper bound (first $i$ with $a[i] > x$) each take $\lceil\log_2(n+1)\rceil$ two-way comparisons at most, and their difference is the number of copies of $x$.

**Proof.** (1) Initially the range is the whole array. If $a[mid] < x$, every element at or left of `mid` is below $x$ by sortedness, so moving `lo` past `mid` loses nothing; symmetrically for $a[mid] > x$. The range shrinks every iteration, so the loop ends, either at $a[mid] = x$ or with an empty range, which by the invariant means $x$ is absent.

(2) Let $s = hi - lo + 1$. The probe at `mid` leaves $\lfloor (s-1)/2 \rfloor$ elements on the left and $\lceil (s-1)/2 \rceil = \lfloor s/2 \rfloor$ on the right. The worst case follows the larger side, so $W(s) = 1 + W(\lfloor s/2\rfloor)$ with $W(0) = 0$. Halving with floor removes one binary digit, so $W(s)$ is the number of binary digits of $s$, which is $\lfloor\log_2 s\rfloor + 1$. Since $2^L \le n < 2^{L+1}$ with $L = \lfloor \log_2 n \rfloor$, $L + 1 = \lceil\log_2(n+1)\rceil$.

(3) Fix any such algorithm and follow it on absent keys. Every comparison then answers $<$ or $>$, so the computation is a binary tree. Take one absent key in each of the $n + 1$ gaps (before $a[0]$, between neighbours, after $a[n-1]$). Two of them cannot reach the same leaf. Suppose keys $y < z$ from different gaps did, and let $a[i]$ be an element with $y < a[i] < z$. If $a[i]$ was compared on that path, it answered $>$ for $y$ and $<$ for $z$, so the paths split there. If it was never compared, then $x = a[i]$ gets the same answer as $y$ and $z$ at every comparison on the path (an element below $y$ is below $a[i]$, one above $z$ is above it), reaches the same leaf and is wrongly reported absent. So the $n + 1$ gaps need $n + 1$ different leaves; a binary tree of height $h$ has at most $2^h$ leaves, so $h \ge \lceil\log_2(n+1)\rceil$.

(4) Lower bound keeps a half-open range $[lo, hi)$ with the invariant "every index below `lo` has $a[i] < x$ and every index at or after `hi` has $a[i] \ge x$"; it moves `lo = mid + 1` when $a[mid] < x$ and `hi = mid` otherwise, and does not stop at a match. Upper bound is the same with $\le$ in place of $<$. At the end `lo = hi` is the boundary, and the indices in $[\text{lower}, \text{upper})$ are exactly those holding $x$. With $s = hi - lo$ elements left, the probe at $mid = lo + \lfloor s/2\rfloor$ keeps either $[lo, mid)$, of $\lfloor s/2\rfloor$ elements, or $[mid+1, hi)$, of $\lceil s/2\rceil - 1$, so the worst case obeys the recurrence of claim 2 and takes $\lfloor\log_2 n\rfloor + 1 = \lceil\log_2(n+1)\rceil$ rounds.

The same halving argument covers the variants. Binary search on the answer needs a predicate that is false then true as $C$ grows, and costs $\lceil\log_2 R\rceil$ evaluations over a range of $R$ candidates. A peak search compares $a[mid]$ with $a[mid+1]$: if $a[mid] < a[mid+1]$, the right part contains a peak (follow increases until one stops or the array ends), so it keeps that part. Ternary search makes about $\log_3 n$ rounds of two comparisons, $2\log_3 n = (2/\log_2 3)\log_2 n \approx 1.26\log_2 n$, more than binary search. Exponential search probes indices $1, 2, 4, \dots$ until it passes $i$, in $\lfloor\log_2 i\rfloor + 2$ probes, then binary-searches a range of size less than $i$: $O(\log i)$. Interpolation search averages $O(\log\log n)$ only for uniformly spread keys and degrades to $O(n)$. On a linked list, reaching `mid` costs $\Theta(n)$ steps, so the total is $\Theta(n)$.

**GATE use.** NAT "maximum comparisons of binary search on $n$ elements": answer $\lfloor\log_2 n\rfloor + 1$, which is 10 for $n = 1000$; the ceiling form $\lceil\log_2 n\rceil + 1$ gives 11 there and is right only for powers of 2. Also: counting occurrences in $\Theta(\log n)$ with two boundary searches (scanning outward from one match is $\Theta(n)$), and off-by-one loop conditions that never terminate when `hi = mid` is paired with `lo <= hi`.

**Check.** A script ran the loop above for every $n$ from 1 to 1099 over all present and absent keys and found the maximum iteration count equal to $\lfloor\log_2 n\rfloor + 1$ and to $\lceil\log_2(n+1)\rceil$ each time: 10 for $n = 1000$, 11 for $n = 1024$. On $[1, 2, 2, 2, 3, 5]$ the lower and upper bounds of 2 are 1 and 4, count 3; 20,000 random arrays matched Python's `bisect` and `count`. Ternary search's $2\log_3 n$ is 12.58 against $\log_2 n = 9.97$ at $n = 1000$.

## Insertion, bubble and selection sort: inversions and exact counts
<!-- topics: algo-complexity-sorting.elementary-sorts, algo-complexity-sorting.sorting-properties -->

**Claim.** An inversion of $a[0..n-1]$ is a pair $i < j$ with $a[i] > a[j]$; let $I$ be their number, $0 \le I \le \binom{n}{2}$.

1. Insertion sort (shift elements strictly greater than the key right, then drop the key in) makes exactly $I$ shifts and between $I$ and $I + n - 1$ comparisons, so it runs in $\Theta(n + I)$: $\Theta(n)$ on sorted input, $\Theta(n^2)$ reversed, and $n(n-1)/4$ shifts on average over random permutations of distinct keys.
2. Bubble sort with an early-exit flag, where pass $p = 1, 2, \dots$ compares only the adjacent pairs within positions $0..n-p$ (that is, $n - p$ comparisons), makes exactly $I$ swaps, $n - 1$ comparisons on sorted input and $n(n-1)/2$ comparisons and swaps on reversed input.
3. Selection sort always makes $n(n-1)/2$ comparisons and at most $n - 1$ swaps.
4. Insertion and bubble sort are stable; selection sort is not. Sorting by a secondary key and then stably by the primary key yields the order by (primary, secondary).

**Proof.** (1) Invariant: before inserting $a[i]$, the prefix $a[0..i-1]$ holds the first $i$ input elements in sorted order. Each shift moves an element $y > key$ one place right, past the key; this reverses exactly one inverted pair (the pair $y$, key) and leaves the relative order of every other pair unchanged. So each shift removes one inversion, the sorted output has none, and there are exactly $I$ shifts. In the pass for $a[i]$ each shift follows one successful comparison, and there is at most one more, the failing comparison that stops the loop (absent when the key reaches index 0); summing over the $n - 1$ passes gives $I \le C \le I + n - 1$. In a uniformly random permutation each of the $\binom n2$ pairs is inverted with probability $1/2$, so $E[I] = n(n-1)/4$.

(2) A swap exchanges an adjacent inverted pair, which removes exactly one inversion, so the swaps total $I$. After pass $p$ the last $p$ positions hold the $p$ largest elements in order, since a pass carries the largest remaining element to the end. On sorted input the first pass swaps nothing and the flag ends the sort after $n - 1$ comparisons; reversed input has $I = \binom n2$, and every comparison of every pass swaps.

(3) Pass $i$ scans positions $i+1..n-1$ for the minimum, $n - 1 - i$ comparisons whatever the data, and summing $i = 0..n-2$ gives $n(n-1)/2$. Each pass makes at most one swap.

(4) Insertion sort stops at the first element $\le$ key and bubble sort swaps only on $>$, so an element never passes an equal one. Selection sort swaps $a[i]$ to a distant position, which can jump it past an equal key: on $[2_a, 2_b, 1]$ the first pass swaps $2_a$ with $1$, giving $[1, 2_b, 2_a]$. For multi-key sorting: after the stable second pass, elements with different primary keys are ordered by primary key, and elements with equal primary keys keep the order of the first pass, which was by secondary key.

**GATE use.** NATs ask for the number of shifts or swaps on a given array, which is the inversion count. MSQs on which sorts are adaptive (insertion, early-exit bubble), which stay $\Theta(n^2)$ on sorted input (selection), and which minimise writes (selection, at most $n - 1$ swaps). The trap is assuming selection sort benefits from sorted input.

**Check.** $[4, 3, 2, 10, 12, 1, 5, 6]$ has $3 + 2 + 1 + 3 + 3 = 12$ inversions, and the simulated insertion sort made 12 shifts and 16 comparisons, inside $[12, 19]$. On 5,000 random arrays with repeated keys, shifts equalled $I$ and comparisons stayed in $[I, I + n - 1]$; bubble sort's swaps equalled $I$ on 3,000 arrays; selection sort made $n(n-1)/2$ comparisons and at most $n - 1$ swaps on all permutations for $n \le 8$ and turned $[2_a, 2_b, 1]$ into $[1, 2_b, 2_a]$.

## Merge sort: exact comparison counts
<!-- topics: algo-complexity-sorting.merge-sort, algo-complexity-sorting.sorting-properties -->

**Claim.**

1. Merging sorted lists of lengths $m, k \ge 1$ makes at most $m + k - 1$ and at least $\min(m, k)$ comparisons, and both are attained.
2. Top-down merge sort on $n = 2^k$ keys makes at most $n\log_2 n - n + 1$ and at least $\frac n2\log_2 n$ comparisons, both attained. For general $n$, $T(n) = T(\lceil n/2\rceil) + T(\lfloor n/2\rfloor) + \Theta(n) = \Theta(n\log n)$ in every case.
3. With $\le$ on ties, merge sort is stable; it uses $\Theta(n)$ auxiliary space for arrays.

**Proof.** (1) Each comparison sends one element to the output, and the merge stops comparing as soon as one list is empty, copying the rest. At that moment the other list still holds at least one element, so at most $m + k - 1$ elements went out by comparison. To empty one list, all of its elements must go out by comparison, at least $\min(m, k)$. The maximum is reached when the two largest elements lie in different lists, for example $[1, 3]$ and $[2, 4]$; the minimum when every element of the shorter list is smaller than every element of the other.

(2) For $n = 2^k$, level $j$ (for $j = 1..k$) consists of $n/2^j$ merges of two lists of length $2^{j-1}$. By (1) each costs at most $2^j - 1$, so level $j$ costs at most $n - n/2^j$, and summing,

$$\sum_{j=1}^{k}\left(n - \frac{n}{2^j}\right) = kn - n\left(1 - 2^{-k}\right) = n\log_2 n - n + 1.$$

Each merge costs at least $2^{j-1}$, so level $j$ costs at least $n/2$ and the total at least $\frac n2\log_2 n$, attained by sorted input. The maximum is attained by building the input backwards: give the left half the sorted output's odd ranks and the right half its even ranks, and recurse within each half; every merge then interleaves perfectly and hits $m + k - 1$. The general $n$ recurrence is master-theorem case 2 regardless of the data, since every merge is at least $\min(m, k) = \lfloor n/2\rfloor$.

(3) When the heads are equal, $\le$ takes the left one, which came earlier in the input, so equal keys keep their order. The merge writes into a separate buffer of size $n$; linked lists can be merged by relinking, which is why merge sort suits lists, and its sequential access suits external sorting.

**GATE use.** NAT "maximum comparisons for merge sort on 8 elements": 17, not $8\log_2 8 = 24$. Traps: dropping the $+1$, and confusing the best case with the worst. MCQs on space and stability: merge sort is stable but not in-place.

**Check.** A script ran top-down merge sort over all $n!$ permutations for $n = 2, 4, 8$: worst counts 1, 5, 17 and best counts 1, 4, 12 match both formulas. It enumerated every interleaving for $1 \le m, k \le 5$ and confirmed claim 1, and 2,000 random arrays with ties came out in stable order.

## Quick sort: partition invariant, worst case and expected comparisons
<!-- topics: algo-complexity-sorting.quick-sort, algo-complexity-sorting.sorting-properties -->

**Claim.** Lomuto partition on $a[lo..hi]$ uses pivot $p = a[hi]$, sweeps $j$ from $lo$ to $hi - 1$, and swaps $a[j]$ into a growing left block whenever $a[j] \le p$; then it swaps the pivot just after the block. Quick sort recurses on both sides. Counting key comparisons:

1. Partitioning $m$ elements costs exactly $m - 1$ comparisons, and the pivot ends in its final position.
2. The worst case is $n(n-1)/2$ comparisons. It occurs on ascending input, descending input, and an array of equal keys.
3. For distinct keys in uniformly random order (or a uniformly random pivot), the expected number of comparisons is $C(n) = 2(n+1)H_n - 4n \approx 2n\ln n \approx 1.39\,n\log_2 n$.
4. With the exact median as pivot, found in $\Theta(n)$, the worst case is $\Theta(n\log n)$. With random or median-of-three pivots only the expectation improves; the worst case stays $\Theta(n^2)$.
5. Recursing on the smaller side and looping on the larger keeps the stack depth at most $\log_2 n$; otherwise it can reach $n - 1$.

**Proof.** (1) Invariant at the top of the sweep with index $j$: $a[lo..i] \le p$, $a[i+1..j-1] > p$, and $a[hi] = p$. Each step compares $a[j]$ with $p$ once and either extends the right block or swaps $a[j]$ into position $i + 1$ and extends the left block. After $hi - lo = m - 1$ comparisons, swapping $p$ into position $i + 1$ leaves everything $\le p$ on its left and everything $> p$ on its right, so $p$ is in its sorted position and never moves again.

(2) If the pivot splits $m$ elements into $q$ and $m - 1 - q$, then $C(m) = m - 1 + C(q) + C(m-1-q)$. By induction $C(q) + C(m-1-q) \le \frac{q(q-1) + (m-1-q)(m-2-q)}{2}$, a convex function of $q$, so it is largest at $q = 0$ or $q = m-1$, where it equals $(m-1)(m-2)/2$. Then $C(m) \le m - 1 + (m-1)(m-2)/2 = m(m-1)/2$, with equality for splits of $0$ and $m - 1$ at every level. Ascending input makes every pivot the maximum. On descending input the first pivot is the minimum and the final swap puts the maximum at the right end of the remaining part, which then has its pivot as maximum; the splits alternate between the two extremes but are always $m-1$ against 0. With equal keys every $a[j] \le p$ passes, so the block takes everything and the pivot lands last.

(3) With a random pivot every rank $q + 1$ is equally likely, and Lomuto leaves both sides in uniformly random order, so $C(n) = n - 1 + \frac 2n\sum_{q=0}^{n-1} C(q)$ with $C(0) = 0$. Multiply by $n$ and subtract the same equation for $n - 1$: $nC(n) - (n-1)C(n-1) = 2(n-1) + 2C(n-1)$, that is $nC(n) = (n+1)C(n-1) + 2(n-1)$. Divide by $n(n+1)$ and use $\frac{2(n-1)}{n(n+1)} = \frac{4}{n+1} - \frac{2}{n}$:

$$\frac{C(n)}{n+1} = \frac{C(n-1)}{n} + \frac{4}{n+1} - \frac 2n = \sum_{j=1}^{n}\left(\frac{4}{j+1} - \frac 2j\right) = 2H_n + \frac{4}{n+1} - 4,$$

so $C(n) = 2(n+1)H_n - 4n$.

(4) A median pivot gives $T(n) = 2T(n/2) + \Theta(n)$ for every input, which is $\Theta(n\log n)$. A random pivot can still be the extreme at every level with positive probability, and a median-of-three rule has adversarial inputs, so neither changes the worst case.

(5) The recursive call goes to a side of at most $(m-1)/2 < m/2$ elements, so each stack frame holds less than half the elements of the one below it.

Quick sort is in-place apart from the stack, and unstable: on $[2_a, 2_b, 1]$ the pivot 1 is swapped with $2_a$, giving $[1, 2_b, 2_a]$.

**GATE use.** MCQs on the worst-case input for a given pivot rule and on the recurrence $T(n-1) + n$. MSQs on random pivots: expected $\Theta(n\log n)$, worst $\Theta(n^2)$. The trap the chapter flags: random pivots do not change the worst case. Traces: follow the given partition code exactly, because Hoare and Lomuto produce different arrays.

**Check.** A script implemented Lomuto quick sort and counted $n(n-1)/2$ comparisons on ascending, descending and all-equal arrays for every $n < 60$. Averaged over all $n!$ permutations for $n \le 8$, the count equalled $2(n+1)H_n - 4n$ exactly in fractions ($16.92$ at $n = 8$). The worst-case stack depth with smaller side first, over every split sequence, is 7 for $n = 255$ and $n = 300$, never above $\log_2 n$.

## Heaps: index arithmetic, linear build-heap and heap sort
<!-- topics: algo-complexity-sorting.heap-sort, algo-complexity-sorting.sorting-properties -->

**Claim.** In a 0-indexed array heap of $n$ elements:

1. The children of $i$ are $2i + 1$ and $2i + 2$, its parent is $\lfloor (i-1)/2 \rfloor$, and the leaves are exactly the indices $\lfloor n/2\rfloor$ to $n - 1$.
2. Bottom-up build-heap (sift down $i = \lfloor n/2\rfloor - 1, \dots, 0$) makes at most $n - \nu(n) < n$ swaps and at most $2(n - \nu(n))$ comparisons, where $\nu(n)$ is the number of 1 bits of $n$. So it is $\Theta(n)$, while $n$ successive inserts cost $\Theta(n\log n)$ in the worst case.
3. Heap sort, which builds a heap and then swaps the root with the last heap element and sifts down $n - 1$ times, is $O(n\log n)$ in every case, uses $O(1)$ extra space and is unstable.

**Proof.** (1) Level $d$ of the complete tree occupies indices $2^d - 1$ to $2^{d+1} - 2$. The node at offset $t$ within level $d$ has its children at offsets $2t$ and $2t + 1$ of level $d + 1$, that is at indices $2^{d+1} - 1 + 2t = 2i + 1$ and $2i + 2$ for $i = 2^d - 1 + t$. Inverting gives the parent. Node $i$ is a leaf iff $2i + 1 \ge n$, iff $i \ge (n-1)/2$, iff $i \ge \lfloor n/2\rfloor$.

(2) Sift-down of a node of height $h$ makes at most $h$ swaps, each after at most 2 comparisons (find the larger child, then compare with it), and it continues until the element settles. So the cost is at most the sum of all node heights. At most $\lceil n/2^{h+1}\rceil$ nodes have height $h$, and

$$\sum_{h \ge 0} \left\lceil\frac{n}{2^{h+1}}\right\rceil h = O\!\left(n\sum_{h\ge 0}\frac{h}{2^h}\right) = O(2n), \qquad \sum_{h\ge 0} h x^h = \frac{x}{(1-x)^2} = 2 \text{ at } x = \tfrac12.$$

For a perfect tree with $n = 2^{k+1} - 1$ the exact height sum is $\sum_{h=0}^{k} h\,2^{k-h} = 2^{k+1} - k - 2 = n - (k + 1) = n - \nu(n)$; a script confirms $n - \nu(n)$ for every $n < 3000$ and that some permutation attains it as a swap count for each $n \le 8$. Reading every element makes build-heap $\Omega(n)$. Inserting keys one at a time in increasing order makes each new key climb to the root, costing $\sum_i \lfloor\log_2 (i+1)\rfloor = \Theta(n\log n)$.

(3) Invariant of the sort phase: $a[0..e]$ is a max-heap and $a[e+1..n-1]$ holds the $n - 1 - e$ largest elements in sorted order. Swapping the root (the largest of the heap) to position $e$ extends the sorted suffix, and one sift-down of $O(\log n)$ restores the heap on $a[0..e-1]$. The decision-tree bound of the next section makes the worst case $\Theta(n\log n)$; it bounds only the deepest leaf, so it says nothing about the best case. On distinct keys the best case is also $\Theta(n\log n)$ (Schaffer and Sedgewick, 1993), a separate result not proved here. With many equal keys the sift-downs stop at once and the count drops to $\Theta(n)$. The long root-to-end swaps break stability: $[2_a, 2_b, 1]$ sorts to $[1, 2_b, 2_a]$.

**GATE use.** MCQs on build-heap time ($\Theta(n)$, not $n\log n$) and 2-mark traces of build-heap on a given array. The trace trap is stopping a sift-down after one swap; the element keeps sinking until both children are smaller. Index questions use $2i + 1, 2i + 2$ for 0-indexed arrays and $2i, 2i + 1$ for 1-indexed.

**Check.** Build-max-heap on $[3, 1, 4, 1, 5, 9, 2, 6]$ gives $[9, 6, 4, 1, 5, 3, 2, 1]$: index 3 swaps 1 with 6, index 2 swaps 4 with 9, index 1 swaps 1 with 6, index 0 sinks 3 twice. For $n = 1000$ the height sum is $1000 - 6 = 994$. For $n = 4095$, increasing inserts made 40,962 swaps against a bottom-up maximum of 4,083. Heap sort on 1,024 keys made 18,060 comparisons on sorted distinct keys, 17,337 on a random permutation, and 3,066 when all keys were equal.

## The comparison-sort lower bound
<!-- topics: algo-complexity-sorting.comparison-lower-bound, algo-complexity-sorting.growth-hierarchy -->

**Claim.** Any algorithm that sorts $n$ distinct keys by pairwise comparisons alone makes at least $\lceil\log_2 n!\rceil$ comparisons on some input, and at least $\log_2 n!$ on average over the $n!$ input orders. Since $\log_2 n! = n\log_2 n - n\log_2 e + O(\log n)$, both are $\Omega(n\log n)$, so merge sort and heap sort are asymptotically optimal. The bound gives 3, 5 and 7 comparisons for $n = 3, 4, 5$, and these counts are achievable.

**Proof.** Fix $n$ and the algorithm. Its run is determined by the outcomes of its comparisons, so it is a binary decision tree: each internal node compares two keys, each leaf ends the run and outputs one rearrangement. Two different input orders of distinct keys need different rearrangements to come out sorted, so they must reach different leaves, and the tree has at least $n!$ reachable leaves. A binary tree of height $h$ has at most $2^h$ leaves (each level at most doubles), so $2^h \ge n!$ and $h \ge \lceil\log_2 n!\rceil$, because $h$ is an integer. For the average, let the reachable leaves have depths $d_1, \dots, d_L$ with $L \ge n!$. Kraft's inequality $\sum_i 2^{-d_i} \le 1$ holds by induction: a leaf alone gives $2^0 = 1$, and a root's two subtrees each have sum at most 1 and their depths grow by one, which halves each sum. Since $\log_2$ is concave, Jensen's inequality gives $\log_2\!\left(\frac1L\sum_i 2^{-d_i}\right) \ge \frac1L\sum_i(-d_i)$, so the mean depth is at least $-\log_2\!\left(\frac1L\sum_i 2^{-d_i}\right) \ge -\log_2\frac1L = \log_2 L \ge \log_2 n!$. The asymptotic form is the Stirling estimate from the hierarchy section.

The bound covers only algorithms that learn the order through comparisons. Counting, radix and bucket sort read key values and index arrays with them, so a run is not a binary comparison tree, and they beat $n\log n$ on suitable keys.

**GATE use.** NAT "minimum worst-case comparisons to sort 5 elements": $\lceil\log_2 120\rceil = 7$, since $2^6 = 64 < 120 \le 128$. MCQs on why counting sort is linear (it is not a comparison sort) and on the $\Omega(n\log n)$ bound for any comparison sort. A trap is applying the bound to integers in a small range.

**Check.** $\lceil\log_2 n!\rceil$ is 3, 5, 7, 10 and 22 for $n = 3, 4, 5, 6, 10$. A minimax search over all comparison strategies, with the set of permutations still consistent as the state, found the optimum to be 3 for $n = 3$, 5 for $n = 4$ and 7 for $n = 5$ (no strategy finishes all 120 orders in 6), matching the bound each time.

## Counting, radix and bucket sort
<!-- topics: algo-complexity-sorting.non-comparison-sorts, algo-complexity-sorting.sorting-properties -->

**Claim.**

1. Counting sort on $n$ integer keys in $[0, k]$ (count, prefix sums, then place from right to left into an output array) is correct, stable, and takes $\Theta(n + k)$ time and $\Theta(n + k)$ extra space. It is linear exactly when $k = O(n)$.
2. LSD radix sort on $d$-digit keys in base $k$, running a stable sort on each digit from least to most significant, is correct and takes $\Theta(d(n + k))$ with counting sort as the digit sort. Correctness needs each pass to be stable.
3. Bucket sort on $n$ keys drawn independently and uniformly from $[0, 1)$, with $n$ buckets each sorted by insertion sort, takes $\Theta(n)$ expected time; its worst case is $\Theta(n^2)$.

**Proof.** (1) After the prefix sums, $C[v]$ is the number of keys $\le v$. Scanning the input from the right, the last key with value $v$ goes to position $C[v] - 1$ and $C[v]$ is decremented, so the keys of value $v$ fill positions $C[v-1]..C[v]-1$ (the slots after all smaller keys) from right to left in reverse scan order, which is their input order. Each key is touched a constant number of times and each count once: $\Theta(n + k)$ time, and the count array plus the output array give $\Theta(n + k)$ space. For keys up to $n^2$ the count array alone costs $\Theta(n^2)$.

(2) Invariant: after pass $p$ the array is sorted by the key formed of the last $p$ digits. Pass $p + 1$ sorts by digit $p + 1$: keys with different digits there come out in digit order, which is the right order on the last $p + 1$ digits; keys with equal digit $p + 1$ keep their previous relative order by stability, and by the invariant that order is by the last $p$ digits. After $d$ passes the array is sorted. Each pass is counting sort with range $k$, so $d$ passes cost $\Theta(d(n + k))$. Keys below $n^3$ written in base $n$ have $d = 3$ digits, so radix sort is $\Theta(n)$ where counting sort would be $\Theta(n^3)$.

(3) Let $N_i$ be the number of keys in bucket $i$; $N_i$ is binomial with parameters $n$ and $1/n$, so $E[N_i^2] = \operatorname{Var}(N_i) + E[N_i]^2 = (1 - 1/n) + 1 = 2 - 1/n$. Insertion sort on a bucket costs $O(1 + N_i^2)$, so the expected total is $O\left(n + \sum_i E[N_i^2]\right) = O(n + 2n - 1) = O(n)$, and distributing and concatenating are $\Theta(n)$. If every key lands in one bucket, insertion sort on $n$ keys is $\Theta(n^2)$.

**GATE use.** MCQ "fastest way to sort $n$ integers in a range $1..100$": $\Theta(n)$ by counting sort. MSQs on stability (counting and radix are stable) and space (counting sort is not in-place). Traps: calling counting sort linear for keys up to $n^2$; using an unstable digit sort in radix sort; and quoting $O(k)$ space when there is a separate output array.

**Check.** A script confirmed stability of right-to-left counting sort on 3,000 random arrays and LSD radix correctness on 2,000 arrays of 3-digit keys. On $[329, 457, 657, 839, 436, 720, 355]$ the three passes give $[720, 355, 436, 457, 657, 329, 839]$, then $[720, 329, 436, 839, 355, 457, 657]$, then sorted. Replacing the digit sort with left-to-right placement, which reverses ties, sorts $[12, 11]$ into $[12, 11]$: the tens pass sees equal digits and undoes the units pass. Over 20,000 trials with $n = 50$ the mean of $\sum_i N_i^2$ was 99.00, matching $2n - 1 = 99$.

## Selection of the k-th smallest in linear time
<!-- topics: algo-complexity-sorting.selection-order-statistics, algo-complexity-sorting.quick-sort -->

**Claim.**

1. Quickselect with a uniformly random pivot makes at most $4n$ comparisons in expectation for every $k$, while its worst case is $n(n-1)/2$.
2. Median of medians (CLRS 9.3): split into groups of 5, take each group's median, select the exact median $x$ of those medians recursively, and partition around $x$. At least $\frac{3n}{10} - 6$ elements lie on each side of $x$, so $T(n) \le T(\lceil n/5\rceil) + T(7n/10 + 6) + O(n)$, which is $\Theta(n)$ in the worst case.
3. With that median as pivot, quick sort is $\Theta(n\log n)$ in the worst case; the $k$ smallest elements in sorted order take $\Theta(n + k\log k)$.

**Proof.** (1) Partitioning $m$ elements costs $m - 1$ comparisons, and the search continues in one side, of size at most $\max(q, m - 1 - q)$. Let $E(m)$ bound the expectation over all $k$ and prove $E(m) \le 4m$ by induction. As $q$ ranges over $0..m-1$, the value $\max(q, m-1-q)$ takes each value from $\lceil (m-1)/2\rceil$ to $m - 1$ at most twice, so

$$E(m) \le m - 1 + \frac 2m\sum_{s=\lfloor m/2\rfloor}^{m-1} 4s \le m - 1 + \frac 8m\cdot\frac{3m^2}{8} < 4m,$$

using $\sum_{s=\lfloor m/2\rfloor}^{m-1} s \le 3m^2/8$ (it is $3m^2/8 - m/4$ for even $m$ and $3(m^2-1)/8$ for odd $m$). The worst case picks an extreme pivot every time: $\sum (m - 1) = n(n-1)/2$.

(2) There are $g = \lceil n/5\rceil$ groups, and at least $\lceil g/2\rceil$ of the group medians are $\ge x$. Each such group, except possibly $x$'s own group and a final short group, contributes 3 elements $\ge x$ (its median and the two above it). So at least $3(\lceil g/2\rceil - 2) \ge \frac{3n}{10} - 6$ elements are $\ge x$, and symmetrically $\le x$. The recursion after partitioning is on at most $n - (\frac{3n}{10} - 6) = \frac{7n}{10} + 6$ elements. Sorting each group of 5 and partitioning cost $O(n)$. Because $\frac15 + \frac{7}{10} = \frac{9}{10} < 1$, the guess $T(n) \le cn$ closes (CLRS 9.3): with the partition work at most $an$, induction gives $T(n) \le c(\frac n5 + 1) + c(\frac{7n}{10} + 6) + an = cn - \left(\frac{cn}{10} - 7c - an\right)$, and the bracket is nonnegative when $n \ge 140$ and $c \ge 20a$; smaller $n$ are base cases. In recursion-tree terms the level costs shrink geometrically by $9/10$, so the total is at most $10$ times the root's work.

(3) An exact median pivot gives $T(n) = 2T(n/2) + \Theta(n) = \Theta(n\log n)$ for every input. For the $k$ smallest: select the $k$-th in $\Theta(n)$, partition around it in $\Theta(n)$, and sort the $k$ survivors in $\Theta(k\log k)$.

**GATE use.** MCQs on the worst case of quickselect ($\Theta(n^2)$) against median of medians ($\Theta(n)$), and on quick sort with a linear-time median pivot ($\Theta(n\log n)$ worst case). Trap: claiming groups of 3 also give linear time; with 3 the recurrence is $T(n/3) + T(2n/3) + O(n)$, which is $\Theta(n\log n)$.

**Check.** Solving the exact expectation recurrence in fractions, the largest expected count over $k$ was $19.27$, $143.01$ and $306.94$ for $n = 10, 50, 100$ (at most $3.07n$, below $4n$), always at the median; the median's constant tends to $2(1 + \ln 2) \approx 3.39$. On 300 random arrays of 50 to 2,000 keys the median-of-medians pivot had at least $3n/10 - 6$ elements on each side. Evaluating $T(\lfloor n/5\rfloor) + T(\lfloor 7n/10\rfloor) + n$ gave $T(10^6) = 8.83 \times 10^6$, within the bound $10n$.

## Exact comparison counts for minimum, maximum and second largest
<!-- topics: algo-complexity-sorting.min-max-comparisons -->

**Claim.** For $n \ge 2$ distinct keys, counting comparisons in the worst case:

1. The maximum alone needs exactly $n - 1$.
2. Both the minimum and the maximum need exactly $\lceil 3n/2\rceil - 2$.
3. The second largest needs exactly $n + \lceil\log_2 n\rceil - 2$.

**Proof.** (1) A linear scan uses $n - 1$. Conversely, an element that never lost a comparison could still be the maximum, so every element except the answer must lose at least once, and each comparison has one loser.

(2) Algorithm: compare the elements in pairs, then find the minimum among the pair losers and the maximum among the pair winners. For even $n$ this is $\frac n2 + 2(\frac n2 - 1) = \frac{3n}{2} - 2$. For odd $n$, start both scans at the unpaired element: $\frac{n-1}{2}$ pair comparisons and $2$ comparisons for each pair afterwards, $\frac{n-1}{2} + 2\cdot\frac{n-1}{2} = \frac{3n-3}{2}$. Both equal $\lceil 3n/2\rceil - 2$.

Lower bound by an adversary (Pohl's argument). Give each element a state: N (never compared), W (has won, never lost), L (has lost, never won), or WL. An N element is still a candidate for both maximum and minimum, W only for maximum, L only for minimum, WL for neither; count one unit per candidacy, so N carries 2, W and L carry 1 and WL carries 0. There are $2n$ units at the start, and at the end exactly 2 remain (one W, one L). A comparison removes at most 2 units, and 2 only when both elements were N. In every other comparison the adversary answers so that at most one unit goes. N against W: W wins and the N becomes L, one unit. N against L: N wins and becomes W, one unit. N against WL: N wins, one unit. W against W or L against L: one of them becomes WL, one unit. W against L, W against WL, L against WL: the W wins or the L loses, no unit. Two WL elements: no unit either way. The answers stay consistent with some input because the adversary can raise a W element's value above all values so far, or lower an L element's below them, without contradicting an earlier answer. A comparison of two N elements removes two of the $n$ N states, so there are at most $\lfloor n/2\rfloor$ of them. Removing $2n - 2$ units therefore takes at least $\lfloor n/2\rfloor + (2n - 2 - 2\lfloor n/2\rfloor) = 2n - 2 - \lfloor n/2\rfloor = \lceil 3n/2\rceil - 2$ comparisons.

(3) Algorithm: a knockout tournament finds the maximum in $n - 1$ comparisons. The second largest lost only to the maximum, and so it is among the at most $\lceil\log_2 n\rceil$ elements the maximum beat (the tournament has that many rounds); their maximum takes $\lceil\log_2 n\rceil - 1$ more comparisons. Lower bound: give every element weight 1; when two unbeaten elements meet, the adversary declares the heavier the winner and adds the loser's weight to it, the loser getting 0; any other comparison is answered consistently with the losses so far. The unbeaten weights always sum to $n$, so at the end the maximum carries $n$. A win at most doubles the winner's weight, so the maximum beat at least $\lceil\log_2 n\rceil$ distinct previously unbeaten elements, forming a set $M$. Every element outside $M$ other than the maximum must lose at least once, every element of $M$ lost to the maximum, and all but one element of $M$ must also lose to someone else, or two of them would both remain candidates for second place. Counting losers, the comparisons number at least $(n - 1 - \lvert M\rvert) + \lvert M\rvert + (\lvert M\rvert - 1) = n - 2 + \lvert M\rvert \ge n + \lceil\log_2 n\rceil - 2$.

**GATE use.** NATs ask for these numbers exactly: 148 for the minimum and maximum of 100 numbers, against 197 for two separate scans ($99 + 98$), and $100 + 7 - 2 = 105$ for the second largest of 100. Traps: answering $2n - 2$ or $2n - 3$ for min and max, using $\log_2 n$ without the ceiling, and forgetting the $-2$.

**Check.** A script ran the pairing algorithm for every $n$ from 1 to 299 and counted exactly $\lceil 3n/2\rceil - 2$ comparisons, 148 at $n = 100$. The tournament found the correct second largest for every $n$ from 2 to 599 within $n + \lceil\log_2 n\rceil - 2$ comparisons, with the maximum beating at most $\lceil\log_2 n\rceil$ elements.
