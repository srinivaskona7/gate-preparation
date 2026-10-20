# Probability and statistics: derivations

## Complement, inclusion–exclusion and counting probability
<!-- topics: em-probability-statistics.sample-space-counting -->

**Claim.** Let $P$ assign each event $A \subseteq S$ a value with $P(A) \ge 0$, $P(S) = 1$ and $P(A \cup B) = P(A) + P(B)$ whenever $A \cap B = \varnothing$ (and the countable version of this additivity). Then

$$P(A') = 1 - P(A), \qquad P(A \cup B) = P(A) + P(B) - P(A \cap B),$$

$$P(A \cup B \cup C) = P(A) + P(B) + P(C) - P(A \cap B) - P(A \cap C) - P(B \cap C) + P(A \cap B \cap C).$$

If $S$ is finite and every outcome has the same probability, then $P(E) = \lvert E \rvert / \lvert S \rvert$. Drawing $n$ items without replacement from an urn of $R$ red and $B$ blue items, with every $n$-subset equally likely, gives exactly $k$ red with probability

$$P(X = k) = \frac{\binom{R}{k}\binom{B}{n-k}}{\binom{R+B}{n}}.$$

**Proof.** $A$ and $A'$ are disjoint with union $S$, so $P(A) + P(A') = P(S) = 1$. For two events, split $A \cup B$ into the disjoint pieces $A$ and $B \setminus A$, and split $B$ into the disjoint pieces $B \setminus A$ and $A \cap B$. Additivity gives $P(A \cup B) = P(A) + P(B \setminus A)$ and $P(B) = P(B \setminus A) + P(A \cap B)$; eliminating $P(B \setminus A)$ gives the two-event formula. For three events apply the two-event formula to $A \cup B$ and $C$:

$$P(A \cup B \cup C) = P(A \cup B) + P(C) - P\bigl((A \cap C) \cup (B \cap C)\bigr),$$

then expand $P(A \cup B)$ and the last term by the two-event formula again; the last term contributes $P(A \cap C) + P(B \cap C) - P(A \cap B \cap C)$, and the signs come out as stated. The general pattern is that an outcome lying in exactly $j \ge 1$ of the events is counted $\binom{j}{1} - \binom{j}{2} + \binom{j}{3} - \dots = 1 - (1-1)^j = 1$ time.

With $N = \lvert S \rvert$ equally likely outcomes, additivity over the singletons gives $N \cdot P(\{\omega\}) = 1$, so each outcome has probability $1/N$ and $P(E)$ is the number of outcomes in $E$ times $1/N$. This is the step that needs equal likelihood: the 11 possible sums of two dice are not equally likely, the 36 ordered pairs are. For the urn, the sample space is the $\binom{R+B}{n}$ subsets of size $n$. A favourable subset is a choice of $k$ of the $R$ red items together with $n - k$ of the $B$ blue ones, and the pair (red part, blue part) determines the subset and is determined by it, so there are $\binom{R}{k}\binom{B}{n-k}$ favourable subsets.

**GATE use.** "At least one" questions go through the complement, because "none" is a single product. Union questions run inclusion–exclusion forwards, and questions that give the union run it backwards for $P(A \cap B)$. The traps are counting unordered outcomes that are not equally likely, forgetting the triple term, and using the binomial for draws without replacement.

**Check.** Two dice: 6 of the 36 ordered pairs sum to 7, so $P = 1/6$. Three tosses: $1 - (1/2)^3 = 7/8$. Five people share no birthday with probability $365 \cdot 364 \cdot 363 \cdot 362 \cdot 361 / 365^5$, so some birthday is shared with probability about $0.0271$. Among $1, \dots, 30$ the multiples of 2, 3 or 5 number $15 + 10 + 6 - 5 - 3 - 2 + 1 = 22$, which a direct count confirms. An urn with 5 red and 3 blue, drawing 3 without replacement, gives exactly 2 red with probability $\binom{5}{2}\binom{3}{1}/\binom{8}{3} = 30/56 = 15/28$; with replacement the count is binomial and the answer is $3 \cdot (5/8)^2 (3/8) = 225/512$.

## Conditional probability and the chain rule
<!-- topics: em-probability-statistics.conditional-probability, em-probability-statistics.sample-space-counting -->

**Claim.** For $P(B) > 0$ define $P(A \mid B) = P(A \cap B)/P(B)$. Then $Q(\cdot) = P(\cdot \mid B)$ is a probability on $S$, so complements and inclusion–exclusion hold inside it, for example $P(A' \mid B) = 1 - P(A \mid B)$. Rearranging gives the multiplication rule $P(A \cap B) = P(A \mid B)P(B) = P(B \mid A)P(A)$, and for events whose intersections have positive probability,

$$P(A_1 \cap A_2 \cap \dots \cap A_n) = P(A_1)\,P(A_2 \mid A_1)\,P(A_3 \mid A_1 \cap A_2) \cdots P(A_n \mid A_1 \cap \dots \cap A_{n-1}).$$

**Derivation.** The definition keeps only the outcomes inside $B$ and rescales them so that $B$ gets total mass 1. $Q$ satisfies the axioms: $Q(A) \ge 0$ because both $P(A \cap B)$ and $P(B)$ are, $Q(S) = P(B)/P(B) = 1$, and if $A_1$ and $A_2$ are disjoint then so are $A_1 \cap B$ and $A_2 \cap B$, whence $Q(A_1 \cup A_2) = \bigl(P(A_1 \cap B) + P(A_2 \cap B)\bigr)/P(B) = Q(A_1) + Q(A_2)$. Every rule proved from the axioms in the previous section therefore holds for $Q$. Multiplying the definition by $P(B)$ gives the first form of the multiplication rule, and swapping the roles of $A$ and $B$ gives the second. The chain rule follows by induction on $n$: write $A_1 \cap \dots \cap A_n = (A_1 \cap \dots \cap A_{n-1}) \cap A_n$ and apply the multiplication rule with $B = A_1 \cap \dots \cap A_{n-1}$. The positivity assumption is what makes each conditional on the right defined.

The chain rule is how sequential draws are computed: at step $j$ the conditioning event fixes what has already left the urn, so the conditional probability is a ratio of what remains. It agrees with the counting formula. For a specific colour pattern with $k$ reds the chain rule gives a product whose denominators are $N(N-1)\cdots(N-n+1)$, where $N = R + B$, and whose numerators are $R(R-1)\cdots(R-k+1)$ and $B(B-1)\cdots(B-n+k+1)$ interleaved in the order the colours appear. The product does not depend on the order, so all $\binom{n}{k}$ patterns with $k$ reds are equally likely, and the total is $\binom{n}{k}\frac{R!}{(R-k)!}\frac{B!}{(B-n+k)!}\frac{(N-n)!}{N!} = \binom{R}{k}\binom{B}{n-k}\big/\binom{N}{n}$, the hypergeometric probability.

**GATE use.** Questions give two of $P(A)$, $P(B)$, $P(A \cup B)$, $P(A \cap B)$ and ask for a conditional, so first recover the intersection. Neither–nor events use De Morgan: $P(A' \cap B') = 1 - P(A \cup B)$. The traps are dividing by $P(A)$ when the condition is $B$, and reading "$A$ given $B$" as $P(A \cap B)$.

**Check.** With $P(A) = 0.6$, $P(B) = 0.5$ and $P(A \cup B) = 0.8$: $P(A \cap B) = 0.6 + 0.5 - 0.8 = 0.3$, $P(A \mid B) = 0.3/0.5 = 0.6$ and $P(A' \cap B') = 0.2$. Two aces from a 52-card deck without replacement: $(4/52)(3/51) = 1/221$. From the 5-red, 3-blue urn, the pattern red, red, blue has probability $(5/8)(4/7)(3/6) = 5/28$, and the $\binom{3}{2} = 3$ patterns with two reds give $15/28$, the hypergeometric value.

## Independence versus mutual exclusion
<!-- topics: em-probability-statistics.independence -->

**Claim.** Events $A$ and $B$ are independent when $P(A \cap B) = P(A)P(B)$; when $P(B) > 0$ this is equivalent to $P(A \mid B) = P(A)$. (1) If $A$ and $B$ are independent, so are $A$ and $B'$, $A'$ and $B$, and $A'$ and $B'$. (2) If $P(A) > 0$ and $P(B) > 0$, then $A$ and $B$ cannot be both independent and mutually exclusive. (3) Pairwise independence of three events does not imply mutual independence, which also requires $P(A \cap B \cap C) = P(A)P(B)P(C)$.

**Proof.** Dividing the product condition by $P(B) > 0$ gives $P(A \mid B) = P(A)$, and multiplying back reverses the step. For (1), $A$ is the disjoint union of $A \cap B$ and $A \cap B'$, so

$$P(A \cap B') = P(A) - P(A \cap B) = P(A) - P(A)P(B) = P(A)\bigl(1 - P(B)\bigr) = P(A)P(B').$$

The same argument with the roles swapped handles $A'$ and $B$, and applying it once more to the independent pair $A'$, $B$ handles $A'$ and $B'$. For (2), mutual exclusion means $A \cap B = \varnothing$, so $P(A \cap B) = 0$, while independence would need $P(A \cap B) = P(A)P(B) > 0$. Exclusive events are in fact strongly dependent: learning $B$ drops the probability of $A$ to 0. For (3), toss two fair coins, with $A$ = first is heads, $B$ = second is heads and $C$ = the two tosses agree. Each event has probability $1/2$ and each pairwise intersection is a single outcome of probability $1/4 = (1/2)(1/2)$, so every pair is independent. But $A \cap B \cap C = A \cap B$ has probability $1/4$, not $1/8$: once $A$ and $B$ are known, $C$ is determined.

**GATE use.** The MSQ gives probabilities and asks which of "independent", "mutually exclusive" and a conditional value hold; compare $P(A \cap B)$ with the product and with 0. Reliability questions with independent components multiply the survival probabilities, and "at least one works" uses the complement $1 - \prod (1 - p_i)$. The trap is treating "exclusive" and "independent" as synonyms.

**Check.** On one die, $A = \{2, 4, 6\}$ and $B = \{1, 2\}$ give $P(A \cap B) = 1/6 = (1/2)(1/3)$, so they are independent although they overlap. With $P(A \cap B) = 0.3 = 0.6 \cdot 0.5$ from the previous section, the events are independent and, having a positive intersection, not exclusive. The two-coin example was enumerated over all 4 outcomes: the three pairwise products hold and the triple intersection has probability $1/4$.

## Total probability and Bayes' theorem
<!-- topics: em-probability-statistics.total-probability-bayes -->

**Claim.** Let $B_1, \dots, B_k$ partition $S$ (pairwise disjoint, union $S$) with every $P(B_i) > 0$. For any event $A$,

$$P(A) = \sum_{i=1}^{k} P(A \mid B_i)\,P(B_i),$$

and if $P(A) > 0$,

$$P(B_i \mid A) = \frac{P(A \mid B_i)\,P(B_i)}{\sum_{j=1}^{k} P(A \mid B_j)\,P(B_j)}.$$

The $P(B_i)$ are the priors, the $P(A \mid B_i)$ the likelihoods and $P(B_i \mid A)$ the posterior.

**Proof.** Because the $B_i$ cover $S$ and are disjoint, $A$ is the disjoint union of the pieces $A \cap B_i$. Additivity gives $P(A) = \sum_i P(A \cap B_i)$, and the multiplication rule rewrites each piece as $P(A \mid B_i)P(B_i)$. For Bayes, apply the definition of conditional probability to $P(B_i \mid A) = P(A \cap B_i)/P(A)$, replace the numerator by $P(A \mid B_i)P(B_i)$ and the denominator by the total-probability sum. In a tree diagram the first level is the partition, each leaf carries a product $P(B_j)P(A \mid B_j)$, the denominator is the sum over every leaf where $A$ happens, and the posterior is the share of one leaf in that sum. The posteriors sum to 1 over $i$, which is a quick check on the arithmetic.

**GATE use.** Two-stage NATs: a box, a machine or a disease status is chosen first and an outcome observed second. Write the priors (they must sum to 1), then the likelihoods, then the sum, then divide. The traps are dropping a branch from the denominator, answering with the joint $P(A \cap B_i)$ or the likelihood $P(A \mid B_i)$ instead of the posterior, and ignoring a small prior (the base-rate fallacy).

**Check.** Urns with 3 red, 2 blue and 2 red, 3 blue, each chosen with probability $1/2$: $P(\text{red}) = (1/2)(3/5) + (1/2)(2/5) = 1/2$ and $P(\text{box } 1 \mid \text{red}) = (3/10)/(1/2) = 3/5$. Machines with shares 0.5, 0.3, 0.2 and defect rates 0.01, 0.02, 0.03: $P(D) = 0.005 + 0.006 + 0.006 = 0.017$ and $P(M_3 \mid D) = 0.006/0.017 = 6/17 \approx 0.353$. A test with prevalence 0.01, sensitivity 0.99 and false-positive rate 0.01: $P(+) = 0.0099 + 0.0099 = 0.0198$, so $P(\text{disease} \mid +) = 0.5$.

## Random variables, CDFs and the normalising constant
<!-- topics: em-probability-statistics.random-variables -->

**Claim.** The CDF $F(x) = P(X \le x)$ of any random variable is non-decreasing, right-continuous, and tends to 0 as $x \to -\infty$ and to 1 as $x \to \infty$, and for $a < b$

$$P(a < X \le b) = F(b) - F(a), \qquad P(X = a) = F(a) - \lim_{x \uparrow a} F(x).$$

A PMF satisfies $p(x) \ge 0$ and $\sum_x p(x) = 1$. If $X$ has a density $f$, then $F(x) = \int_{-\infty}^{x} f(t)\,dt$, $\int_{-\infty}^{\infty} f = 1$, $F' = f$ wherever $f$ is continuous, every single point has probability 0, and $P(a < X \le b) = \int_a^b f(x)\,dx$ regardless of which endpoints are included. A density value is not a probability and may exceed 1.

**Proof.** If $a < b$ then $\{X \le a\} \subseteq \{X \le b\}$, so $F(a) \le F(b)$, and since $\{X \le b\}$ is the disjoint union of $\{X \le a\}$ and $\{a < X \le b\}$, additivity gives the interval formula. Right-continuity and the limits at $\pm\infty$ follow from countable additivity: the events $\{X \le a + 1/n\}$ shrink to $\{X \le a\}$, and $\{X \le n\}$ grows to $S$. The events $\{a - 1/n < X \le a\}$ shrink to $\{X = a\}$, which gives the jump formula. With a density, $F$ is an integral of $f$ with a variable upper limit and therefore continuous, so every jump is 0; then $P(a \le X \le b)$, $P(a < X < b)$ and the half-open versions all equal $F(b) - F(a)$. The fundamental theorem of calculus gives $F' = f$ at continuity points of $f$. For a discrete $X$, the jump at a value is its mass $p(a)$, so including or excluding an endpoint changes the answer by $p(a)$. A density only needs to integrate to 1: $f(x) = 2$ on $[0, 1/2]$ is valid.

**GATE use.** "Find $k$" questions: integrate the given form over its stated support, set the result to 1, then compute a probability, mean or median with that $k$. Discrete versions ask for the constant in a PMF table. The traps are integrating over the wrong range, treating $f(a)$ as $P(X = a)$, and ignoring the endpoint mass for a discrete variable.

**Check.** $f(x) = kx^2$ on $[0, 3]$: $\int_0^3 kx^2\,dx = 9k = 1$, so $k = 1/9$. Then $P(X \le 1) = 1/27$, $P(1 < X \le 2) = (8 - 1)/27 = 7/27$ and $E[X] = \frac{1}{9}\int_0^3 x^3\,dx = 81/36 = 9/4$. For a fair die, $P(X \le 3) = 1/2$ but $P(X < 3) = 1/3$; the difference is the mass $1/6$ at 3.

## Expectation, LOTUS and linearity with indicators
<!-- topics: em-probability-statistics.expectation-variance -->

**Claim.** For a discrete $X$ and any function $g$, $E[g(X)] = \sum_x g(x)\,p(x)$ (the law of the unconscious statistician, LOTUS); the integral form $\int g(x) f(x)\,dx$ holds for a density. For any random variables $X$, $Y$ with finite means and constants $a$, $b$, $c$,

$$E[aX + bY + c] = a\,E[X] + b\,E[Y] + c,$$

with no independence assumption. If $I_A$ is the indicator of $A$ (1 on $A$, 0 off it), then $E[I_A] = P(A)$, so a count $N = I_{A_1} + \dots + I_{A_n}$ has $E[N] = \sum_i P(A_i)$.

**Proof.** Take a discrete sample space, so that $E[Z] = \sum_\omega Z(\omega)P(\{\omega\})$ for any random variable $Z$ on it (the continuous case follows the same pattern with integrals; Ross, *A First Course in Probability*, proves it in general). Grouping the outcomes by the value $x = X(\omega)$ gives

$$E[g(X)] = \sum_x \sum_{\omega : X(\omega) = x} g(x)\,P(\{\omega\}) = \sum_x g(x)\,P(X = x),$$

which is LOTUS, and $g(x) = x$ shows the outcome-sum agrees with the usual definition. Linearity is then immediate, because the outcome-sum is linear in $Z$:

$$E[aX + bY + c] = \sum_\omega \bigl(aX(\omega) + bY(\omega) + c\bigr)P(\{\omega\}) = a\,E[X] + b\,E[Y] + c \sum_\omega P(\{\omega\}),$$

and the last sum is 1. Nothing about the joint behaviour of $X$ and $Y$ entered. For an indicator, $E[I_A] = 1 \cdot P(A) + 0 \cdot P(A') = P(A)$, and linearity over the $n$ indicators gives $E[N] = \sum P(A_i)$, however dependent the $A_i$ are.

For fixed points of a uniformly random permutation of $\{1, \dots, n\}$, let $A_i$ be the event that position $i$ holds $i$. Fixing $i$ leaves $(n-1)!$ arrangements of the rest, so $P(A_i) = (n-1)!/n! = 1/n$ and $E[N] = n \cdot (1/n) = 1$ for every $n$. The events are dependent (if $n - 1$ points are fixed the last one is too), and linearity does not care.

**GATE use.** Expected counts of fixed points, empty bins, inversions, matching pairs or hash collisions: one indicator per object that might qualify, one symmetric probability, multiply by the number of indicators. The traps are trying to find the distribution of $N$, assuming the indicators must be independent, and reporting $P(A_i)$ as the answer.

**Check.** Averaging the number of fixed points over all permutations for $n = 1, \dots, 7$ gives exactly 1 each time. Three balls into three bins uniformly: bin $i$ is empty with probability $(2/3)^3$, so the expected number of empty bins is $3 \cdot 8/27 = 8/9$, matching an enumeration of all 27 placements. For $f(x) = x^2/9$ on $[0, 3]$, LOTUS gives $E[X^2] = \frac{1}{9}\int_0^3 x^4\,dx = 243/45 = 5.4$ without finding the distribution of $X^2$.

## Variance, covariance and correlation
<!-- topics: em-probability-statistics.expectation-variance, em-probability-statistics.joint-covariance -->

**Claim.** With $\mu = E[X]$ and finite second moments:

$$\operatorname{Var}(X) = E[(X-\mu)^2] = E[X^2] - \mu^2, \qquad \operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X),$$

$$\operatorname{Cov}(X, Y) = E[(X - \mu_X)(Y - \mu_Y)] = E[XY] - E[X]E[Y], \qquad \operatorname{Cov}(aX + b, cY + d) = ac \operatorname{Cov}(X, Y),$$

$$\operatorname{Var}(X \pm Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) \pm 2\operatorname{Cov}(X, Y).$$

Independence implies $\operatorname{Cov}(X, Y) = 0$, but not conversely. When both variances are positive, $\rho = \operatorname{Cov}(X, Y)/(\sigma_X \sigma_Y)$ lies in $[-1, 1]$, with $\lvert \rho \rvert = 1$ exactly when $Y = \alpha X + \beta$ with probability 1 for some $\alpha \ne 0$.

**Proof.** Expand the square and use linearity with the constant $\mu$: $E[X^2 - 2\mu X + \mu^2] = E[X^2] - 2\mu^2 + \mu^2$. For the linear transform, $aX + b$ has mean $a\mu + b$, so its deviation is $a(X - \mu)$ and its variance $a^2 E[(X-\mu)^2]$: the shift cancels and the scale is squared. The covariance identity expands the product the same way: $E[XY - \mu_Y X - \mu_X Y + \mu_X \mu_Y] = E[XY] - \mu_X\mu_Y$. Its bilinearity follows because $aX + b$ has deviation $a(X - \mu_X)$ and $cY + d$ has deviation $c(Y - \mu_Y)$. For the sum, the deviation of $X \pm Y$ is $(X - \mu_X) \pm (Y - \mu_Y)$; squaring and taking expectations gives the two variances and the cross term $\pm 2\operatorname{Cov}(X, Y)$. For independent discrete $X$ and $Y$, $p(x, y) = p_X(x)p_Y(y)$, so

$$E[XY] = \sum_{x, y} xy\,p_X(x)p_Y(y) = \Bigl(\sum_x x\,p_X(x)\Bigr)\Bigl(\sum_y y\,p_Y(y)\Bigr) = E[X]E[Y],$$

and the covariance is 0. Then both $\operatorname{Var}(X + Y)$ and $\operatorname{Var}(X - Y)$ equal $\operatorname{Var}(X) + \operatorname{Var}(Y)$.

For the bound, let $U = (X - \mu_X)/\sigma_X$ and $V = (Y - \mu_Y)/\sigma_Y$, each with mean 0 and variance 1, so $E[UV] = \rho$. Then

$$0 \le \operatorname{Var}(U \pm V) = 1 + 1 \pm 2\rho,$$

which gives $-1 \le \rho \le 1$. If $\rho = 1$ then $\operatorname{Var}(U - V) = 0$, so $U - V$ is a constant with probability 1, and the constant is its mean, 0; hence $V = U$ and $Y$ is a linear function of $X$ with positive slope. $\rho = -1$ gives $V = -U$ in the same way. Conversely $Y = \alpha X + \beta$ gives $\operatorname{Cov} = \alpha\sigma_X^2$ and $\sigma_Y = \lvert \alpha \rvert \sigma_X$, so $\rho = \pm 1$. By bilinearity, shifting either variable or scaling it by a positive constant leaves $\rho$ unchanged, and a negative scale flips its sign. A joint table shows dependence through any one cell where $p(x, y) \ne p_X(x)p_Y(y)$.

**GATE use.** 1-mark MCQs on $\operatorname{Var}(aX + b)$, on $E[X^2]$ from a given mean and variance, and on whether zero covariance implies independence. The traps are writing $a$ instead of $a^2$, keeping the shift $b$, subtracting variances for $X - Y$, and adding variances of dependent variables.

**Check.** Three fair coin tosses, $X$ = number of heads: enumeration gives $E[X] = 3/2$, $E[X^2] = 3$ and $\operatorname{Var}(X) = 3 - 9/4 = 3/4$, so $\operatorname{Var}(3X + 5) = 27/4$. For $X$ uniform on $\{-1, 0, 1\}$ and $Y = X^2$: $E[XY] = E[X^3] = 0$ and $E[X] = 0$, so $\operatorname{Cov} = 0$, yet $P(X = 0, Y = 0) = 1/3 \ne P(X = 0)P(Y = 0) = 1/9$.

## Bernoulli, binomial and geometric distributions
<!-- topics: em-probability-statistics.binomial-geometric -->

**Claim.** Run independent trials, each a success with the same probability $p \in (0, 1)$, and let $q = 1 - p$.

- One trial, Bernoulli($p$): mean $p$, variance $pq$, which is largest, $1/4$, at $p = 1/2$.
- The number of successes in $n$ trials, $B(n, p)$: $P(X = k) = \binom{n}{k} p^k q^{n-k}$ for $k = 0, \dots, n$, mean $np$, variance $npq$.
- The number of trials up to and including the first success, Geometric($p$): $P(X = k) = q^{k-1}p$ for $k = 1, 2, \dots$, $P(X > k) = q^k$, mean $1/p$, variance $q/p^2$, and $P(X > m + n \mid X > m) = P(X > n)$ for integers $m, n \ge 0$.

Counting the failures before the first success instead gives $Y = X - 1$, with mean $q/p$ and the same variance.

**Derivation.** Bernoulli: $E[X] = p$ and $E[X^2] = p$ because $X^2 = X$, so $\operatorname{Var} = p - p^2 = pq$, a downward parabola in $p$ with its peak at $1/2$. Binomial: a sequence with successes in a given set of $k$ positions has probability $p^k q^{n-k}$ by independence, and there are $\binom{n}{k}$ such position sets, which gives the PMF; the binomial theorem gives $\sum_k \binom{n}{k}p^k q^{n-k} = (p + q)^n = 1$. Write $X = I_1 + \dots + I_n$ with $I_j$ the indicator of success on trial $j$. Linearity gives $E[X] = np$, and since the $I_j$ are independent their covariances vanish, so $\operatorname{Var}(X) = n \cdot pq$.

Geometric: $X > k$ exactly when the first $k$ trials fail, so $P(X > k) = q^k$, and $P(X = k) = P(X > k - 1) - P(X > k) = q^{k-1}p$. For a variable on the positive integers, $X = \sum_{k \ge 1} I_{\{X \ge k\}}$, so $E[X] = \sum_{k \ge 1} P(X \ge k) = \sum_{k \ge 0} q^k = 1/p$. For the second moment condition on the first trial: with probability $p$ it succeeds and $X = 1$; with probability $q$ it fails and the process restarts, so $X = 1 + X'$ with $X'$ distributed like $X$. Then

$$E[X^2] = p + q\,E[(1 + X)^2] = p + q\Bigl(1 + \frac{2}{p} + E[X^2]\Bigr),$$

so $p\,E[X^2] = 1 + 2q/p$, $E[X^2] = (2 - p)/p^2$ and $\operatorname{Var}(X) = (2 - p)/p^2 - 1/p^2 = q/p^2$. Memorylessness: $P(X > m + n \mid X > m) = q^{m+n}/q^m = q^n$. Shifting by $-1$ lowers the mean by 1 and, by $\operatorname{Var}(X - 1) = \operatorname{Var}(X)$, leaves the variance alone. Since $npq \lt np$, a binomial's variance is always below its mean.

**GATE use.** "Exactly $k$ of $n$" is binomial and needs the $\binom{n}{k}$ ordering factor; "first success on trial $k$" is geometric; "at least one" is $1 - q^n$. After $m$ failed trials the expected total number of trials is $m + 1/p$. The traps are dropping the binomial coefficient, mixing the two geometric conventions, and using the binomial for draws without replacement.

**Check.** $B(10, 0.3)$: $P(X = 2) = 45 \cdot 0.09 \cdot 0.7^8 \approx 0.2335$, mean 3, variance 2.1, confirmed by summing the PMF. $B(4, 1/6)$: $P(X = 2) = 6 \cdot (1/36)(25/36) = 150/1296 \approx 0.1157$. A fair coin's first head on toss 3 has probability $(1/2)^2(1/2) = 1/8$; for $p = 1/2$ the mean and variance are both 2, and for $p = 0.3$ the PMF sums give mean $1/0.3$ and variance $0.7/0.09$.

## Poisson distribution as the limit of rare events
<!-- topics: em-probability-statistics.poisson -->

**Claim.** For $\lambda > 0$, $P(X = k) = e^{-\lambda}\lambda^k/k!$ for $k = 0, 1, 2, \dots$ is a PMF with $E[X] = \operatorname{Var}(X) = \lambda$. It is the limit of $B(n, p)$ as $n \to \infty$ with $np = \lambda$ held fixed. If $X \sim \text{Poisson}(\lambda)$ and $Y \sim \text{Poisson}(\mu)$ are independent, then $X + Y \sim \text{Poisson}(\lambda + \mu)$. For events at constant rate $r$ per unit time, the count in a window of length $t$ is Poisson with $\lambda = rt$.

**Derivation.** The PMF sums to 1 because $\sum_k \lambda^k/k! = e^\lambda$. For the mean, the $k = 0$ term vanishes and $k/k! = 1/(k-1)!$:

$$E[X] = e^{-\lambda}\sum_{k \ge 1} \frac{\lambda^k}{(k-1)!} = \lambda e^{-\lambda}\sum_{j \ge 0}\frac{\lambda^j}{j!} = \lambda.$$

The same shift twice gives $E[X(X-1)] = \lambda^2$, so $E[X^2] = \lambda^2 + \lambda$ and $\operatorname{Var}(X) = \lambda$. For the limit, put $p = \lambda/n$:

$$\binom{n}{k}\Bigl(\frac{\lambda}{n}\Bigr)^k\Bigl(1 - \frac{\lambda}{n}\Bigr)^{n-k} = \frac{\lambda^k}{k!}\cdot\frac{n(n-1)\cdots(n-k+1)}{n^k}\cdot\Bigl(1 - \frac{\lambda}{n}\Bigr)^{n}\cdot\Bigl(1 - \frac{\lambda}{n}\Bigr)^{-k}.$$

With $k$ fixed, the second factor is a product of $k$ terms each tending to 1, the third tends to $e^{-\lambda}$, and the fourth to 1. For the sum, the event $X + Y = n$ splits by the value of $X$:

$$P(X + Y = n) = \sum_{i=0}^{n} \frac{e^{-\lambda}\lambda^i}{i!}\cdot\frac{e^{-\mu}\mu^{n-i}}{(n-i)!} = \frac{e^{-(\lambda+\mu)}}{n!}\sum_{i=0}^{n}\binom{n}{i}\lambda^i\mu^{n-i} = \frac{e^{-(\lambda+\mu)}(\lambda+\mu)^n}{n!},$$

by the binomial theorem. For the window, model events at rate $r$ by splitting $[0, t]$ into $n$ slots of length $t/n$, each holding one event with probability $rt/n$, independently of the others. The count is then $B(n, rt/n)$ with $np = rt$ fixed, and the limit above makes it Poisson with $\lambda = rt$ as $n \to \infty$. Disjoint windows use disjoint slots, so their counts are independent, and the sum rule confirms that parameters add across pieces.

**GATE use.** "Average of $r$ per unit; probability of at most $k$ in an interval": rescale the rate to the interval, then sum the first $k + 1$ terms. A binomial with large $n$ and small $p$ is approximated with $\lambda = np$. The traps are using the rate for the wrong interval length and computing "at least one" by summing instead of $1 - e^{-\lambda}$.

**Check.** With 4 errors per page on average, $P(X \le 1) = e^{-4}(1 + 4) = 5e^{-4} \approx 0.0916$. Five calls per hour give $\lambda = 2.5$ for half an hour. $B(1000, 0.002)$ has $P(X = 0) = 0.998^{1000} \approx 0.13506$ against $e^{-2} \approx 0.13534$. Summing the PMF of Poisson(3) gives mean and variance 3, and the convolution of Poisson(1) and Poisson(2) at 2 equals $e^{-3} \cdot 9/2$.

## Uniform and exponential distributions, and memorylessness
<!-- topics: em-probability-statistics.uniform, em-probability-statistics.exponential -->

**Claim.** $U(a, b)$, with density $1/(b - a)$ on $[a, b]$, has $F(x) = (x - a)/(b - a)$ on $[a, b]$, $P(c \le X \le d) = (d - c)/(b - a)$ for $a \le c \le d \le b$, mean and median $(a + b)/2$, and variance $(b - a)^2/12$. $\text{Exp}(\lambda)$, with density $\lambda e^{-\lambda x}$ for $x \ge 0$, has survival $P(X > x) = e^{-\lambda x}$, mean $1/\lambda$, variance $1/\lambda^2$, and

$$P(X > s + t \mid X > s) = P(X > t) \qquad (s, t \ge 0).$$

It is the only continuous distribution on $[0, \infty)$ with this property, and it is the waiting time to the first event of a Poisson process with rate $\lambda$.

**Derivation.** Uniform: integrating the constant density gives the linear CDF and the length ratio, and $F(m) = 1/2$ at the midpoint. Then

$$E[X] = \frac{1}{b-a}\int_a^b x\,dx = \frac{b^2 - a^2}{2(b-a)} = \frac{a+b}{2}, \qquad E[X^2] = \frac{b^3 - a^3}{3(b-a)} = \frac{a^2 + ab + b^2}{3},$$

and $\operatorname{Var}(X) = \frac{a^2 + ab + b^2}{3} - \frac{(a+b)^2}{4} = \frac{4a^2 + 4ab + 4b^2 - 3a^2 - 6ab - 3b^2}{12} = \frac{(b-a)^2}{12}$.

Exponential: $P(X > x) = \int_x^\infty \lambda e^{-\lambda t}\,dt = e^{-\lambda x}$. For a non-negative $X$, $E[X] = \int_0^\infty P(X > x)\,dx$ (the continuous form of the tail-sum used for the geometric), which gives $1/\lambda$. Integrating by parts, $E[X^2] = \int_0^\infty x^2 \lambda e^{-\lambda x}\,dx = \frac{2}{\lambda}E[X] = 2/\lambda^2$, so the variance is $1/\lambda^2$. Memorylessness: $\{X > s + t\} \subseteq \{X > s\}$, so the conditional probability is $e^{-\lambda(s+t)}/e^{-\lambda s} = e^{-\lambda t}$.

For uniqueness, let $G(t) = P(X > t)$ for a memoryless $X$ with $0 \lt G(1) \lt 1$. The property says $G(s + t) = G(s)G(t)$. Induction gives $G(n) = G(1)^n$, and $G(1) = G(1/m)^m$ gives $G(1/m) = G(1)^{1/m}$, so $G(r) = G(1)^r$ for every positive rational $r$. $G$ is non-increasing, so it is squeezed between its values at rationals on either side of any $t$, and $G(t) = G(1)^t = e^{-\lambda t}$ with $\lambda = -\ln G(1) > 0$. On the positive integers the same equation forces $G(n) = G(1)^n$, the geometric distribution, which is why the two are the only memoryless families. For a Poisson process of rate $\lambda$, the first event comes after time $t$ exactly when the window $[0, t]$ holds no events, which has probability $e^{-\lambda t}$, the exponential survival function.

**GATE use.** Uniform: probabilities as length ratios, and $\operatorname{Var}(aX + b)$ for $U(0, 1)$. Exponential: a mean lifetime gives $\lambda = 1/\text{mean}$; a conditional survival question drops the time already elapsed. The traps are using the mean in place of the rate in $e^{-\lambda t}$, answering with the unconditional $P(X > s + t)$, and writing $(b - a)/12$ or $(b-a)^2/4$ for the uniform variance.

**Check.** $U(0, 1)$ has variance $1/12$, so $\operatorname{Var}(2X + 3) = 4/12 = 1/3$; $U(0, 4)$ has mean 2 and variance $16/12 = 4/3$. $\text{Exp}(2)$ has mean $1/2$ and $P(X > 1) = e^{-2} \approx 0.135$. A bulb with mean life 1000 hours that has run 500 hours survives 1000 more with probability $e^{-1.5}/e^{-0.5} = e^{-1} \approx 0.368$.

## Normal distribution, standard error and the central limit theorem
<!-- topics: em-probability-statistics.normal-clt -->

**Claim.** The density $f(x) = \frac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^2/(2\sigma^2)}$, written $N(\mu, \sigma^2)$, integrates to 1 and has mean $\mu$ and variance $\sigma^2$; it is symmetric about $\mu$, so the mean, median and mode are all $\mu$. If $X \sim N(\mu, \sigma^2)$ and $a \ne 0$, then $aX + b \sim N(a\mu + b, a^2\sigma^2)$; in particular $Z = (X - \mu)/\sigma \sim N(0, 1)$. A sum of independent normals is normal with the means and variances added. For independent $X_1, \dots, X_n$ with common mean $\mu$ and variance $\sigma^2$, the sample mean $\bar{X}_n$ has mean $\mu$ and standard error $\sigma/\sqrt{n}$, and by the central limit theorem $(\bar{X}_n - \mu)/(\sigma/\sqrt{n})$ is approximately $N(0, 1)$ for large $n$, whatever the shape of the $X_i$.

**Derivation.** Let $I = \int_{-\infty}^{\infty} e^{-z^2/2}\,dz$. Then $I^2 = \iint e^{-(x^2+y^2)/2}\,dx\,dy$, and in polar coordinates ($dx\,dy = r\,dr\,d\theta$)

$$I^2 = \int_0^{2\pi}\!\!\int_0^\infty e^{-r^2/2}\,r\,dr\,d\theta = 2\pi \cdot 1,$$

so $I = \sqrt{2\pi}$ and the standard density $\varphi(z) = e^{-z^2/2}/\sqrt{2\pi}$ integrates to 1. $\varphi$ is even, so $E[Z] = 0$. Integrating by parts with $u = z$ and $dv = z\varphi(z)\,dz$ (so $v = -\varphi(z)$) gives $E[Z^2] = [-z\varphi(z)]_{-\infty}^{\infty} + \int \varphi = 1$. For $a > 0$, $P(aZ' + b \le y) = P(Z' \le (y - b)/a)$ for any $Z'$; differentiating with $Z' = X$ substitutes $(y-b)/a$ into $f$ and multiplies by $1/a$, which is the $N(a\mu + b, a^2\sigma^2)$ density, and $a \lt 0$ works the same way by symmetry. Taking $X = \mu + \sigma Z$ gives the general mean $\mu$ and variance $\sigma^2$, and standardisation is the case $a = 1/\sigma$, $b = -\mu/\sigma$.

For sums, the moment generating function $M_X(t) = E[e^{tX}]$ of $N(\mu, \sigma^2)$ is $e^{\mu t + \sigma^2 t^2/2}$, found by completing the square in the exponent. For independent $X$ and $Y$, $E[e^{t(X+Y)}] = M_X(t)M_Y(t) = e^{(\mu_X+\mu_Y)t + (\sigma_X^2 + \sigma_Y^2)t^2/2}$, the MGF of the normal with added parameters, and an MGF that exists near 0 determines the distribution. The standard error needs only linearity and independence: $E[\bar{X}_n] = \mu$, and the covariances vanish, so $\operatorname{Var}(\bar{X}_n) = \frac{1}{n^2}\cdot n\sigma^2 = \sigma^2/n$. For the CLT itself, assuming the MGF exists (Ross gives this proof), let $Y_i = (X_i - \mu)/\sigma$ and $S = (Y_1 + \dots + Y_n)/\sqrt{n}$. Each $Y_i$ has mean 0 and variance 1, so $M_Y(s) = 1 + s^2/2 + o(s^2)$ and

$$M_S(t) = M_Y\!\left(\frac{t}{\sqrt{n}}\right)^{n} = \left(1 + \frac{t^2}{2n} + o\!\left(\frac{1}{n}\right)\right)^{n} \to e^{t^2/2},$$

the MGF of $N(0, 1)$. Convergence of MGFs gives convergence of the CDFs. The 68–95–99.7 figures are $2\Phi(k) - 1$ for $k = 1, 2, 3$, where $\Phi$ is the standard normal CDF, and by symmetry a single tail beyond $k$ is half of what lies outside $\pm k$.

**GATE use.** Standardise, then use symmetry and the empirical rule; "how many SDs above the mean" is a z-score. Sample-mean questions use $\sigma/\sqrt{n}$, so quadrupling $n$ halves the standard error. The traps are dividing by $\sigma^2$ (N(50, 100) has $\sigma = 10$), reporting both tails when one is asked, and applying the CLT to a single observation.

**Check.** $P(\lvert Z \rvert \lt 1) \approx 0.6827$, $P(\lvert Z \rvert \lt 2) \approx 0.9545$ and $P(\lvert Z \rvert \lt 3) \approx 0.9973$ from the error function. Scores with mean 50 and variance 100 put 70 at $z = 2$; the empirical rule gives the upper tail as about 0.025, and the exact value is 0.0228. With $\sigma = 10$ the standard error is 2 for $n = 25$ and 1 for $n = 100$. A simulation of $\sum_{i=1}^{12} U_i - 6$ for uniform $U_i$ (mean 0, variance $12/12 = 1$) puts about 0.679 of its mass inside $(-1, 1)$, close to the normal value 0.683; the exact Irwin–Hall value is 0.6785.

## Descriptive statistics of a data set
<!-- topics: em-probability-statistics.descriptive-statistics -->

**Claim.** For data $x_1, \dots, x_n$ with mean $\bar{x} = \frac{1}{n}\sum x_i$: the mean is the constant $c$ minimising $\sum (x_i - c)^2$, and any median minimises $\sum \lvert x_i - c \rvert$. The population variance is $\sigma^2 = \frac{1}{n}\sum (x_i - \bar{x})^2$. If the $x_i$ are independent draws from a population with variance $\sigma^2$, the sample variance $s^2 = \frac{1}{n-1}\sum (x_i - \bar{x})^2$ has $E[s^2] = \sigma^2$, while the $\div n$ version has expectation $\frac{n-1}{n}\sigma^2$. Under $y_i = a x_i + b$, the mean, median and mode become $a(\cdot) + b$, the SD, range and IQR are multiplied by $\lvert a \rvert$, and the coefficient of variation $\mathrm{CV} = \sigma/\mu$ is unchanged when $b = 0$ and $a > 0$.

**Proof.** $\sum (x_i - c)^2 = \sum (x_i - \bar{x})^2 + n(\bar{x} - c)^2$, because the cross term $2(\bar{x} - c)\sum (x_i - \bar{x})$ is 0; the minimum is at $c = \bar{x}$. For the absolute deviations, moving $c$ to the right by a small amount changes the sum at rate (number of points left of $c$) minus (number right of $c$), so the sum decreases while more than half the points lie to the right and increases once more than half lie to the left; the minimum is at the middle of the sorted data. Only the ranks matter for the median, so one outlier moves the mean a lot and the median not at all.

For unbiasedness, the same decomposition with $c = \mu$ reads $\sum (X_i - \bar{X})^2 = \sum (X_i - \mu)^2 - n(\bar{X} - \mu)^2$. Each $E[(X_i - \mu)^2] = \sigma^2$, and $E[(\bar{X} - \mu)^2] = \operatorname{Var}(\bar{X}) = \sigma^2/n$ by independence (previous section). So

$$E\Bigl[\sum (X_i - \bar{X})^2\Bigr] = n\sigma^2 - n\cdot\frac{\sigma^2}{n} = (n-1)\sigma^2.$$

Deviations are measured from $\bar{X}$, which is fitted to the same data and sits closer to it than $\mu$ does, so one degree of freedom is lost. Under $y = ax + b$, sums give $\bar{y} = a\bar{x} + b$, and the order of the data is kept ($a > 0$) or reversed ($a \lt 0$), so the median and mode map the same way. Each deviation becomes $a(x_i - \bar{x})$, so the variance is multiplied by $a^2$ and the SD by $\lvert a \rvert$, and differences of order statistics such as the range and IQR scale by $\lvert a \rvert$. The CV becomes $\lvert a \rvert\sigma/(a\mu + b)$, which equals $\sigma/\mu$ when $b = 0$ and $a > 0$; a negative $a$ flips its sign.

**GATE use.** 1-mark NATs give a short list and ask for a mean, median, mode or SD. Sort first, average the two middle values for even $n$, and use $\div n$ unless the question says sample. The traps are taking the median of unsorted data, using the wrong divisor, and letting a shift change the SD.

**Check.** For 2, 4, 4, 4, 5, 5, 7, 9: mean 5, median $(4 + 5)/2 = 4.5$, mode 4, squared deviations summing to 32, population SD $\sqrt{32/8} = 2$ and sample SD $\sqrt{32/7} \approx 2.138$. A grid search confirms $c = 5$ minimises the squared deviations and $c = 4.5$ attains the least absolute deviation. Transforming by $y = 2x + 3$ gives mean 13 and SD 4; the CV moves from 0.4 to $4/13 \approx 0.308$ because of the shift. For 1, 2, 3, 4, 100 the mean is 22 and the median 3. Population $\{1, 2, 3\}$ has $\sigma^2 = 2/3$; over all 9 ordered samples of size 2, $s^2$ averages $2/3$ and the $\div n$ version $1/3$.

## Median and mode of a distribution, and skew
<!-- topics: em-probability-statistics.distribution-median-mode -->

**Claim.** The median $m$ of a continuous $X$ solves $F(m) = 1/2$; for a discrete $X$ take the smallest $m$ with $F(m) \ge 1/2$. The mode maximises the density or the PMF. Specifically:

- $\text{Exp}(\lambda)$ has median $\ln 2/\lambda$ and mode 0, so mode $\lt$ median $\lt$ mean $= 1/\lambda$ (right skew).
- $f(x) = 2x$ on $[0, 1]$ has median $1/\sqrt{2}$, mean $2/3$ and mode 1, so mean $\lt$ median $\lt$ mode (left skew).
- $B(n, p)$ has mode $\lfloor (n+1)p \rfloor$, and Poisson($\lambda$) has mode $\lfloor \lambda \rfloor$; when $(n+1)p$ or $\lambda$ is an integer $j$, both $j - 1$ and $j$ are modes.
- A density symmetric about $c$ with a finite mean has mean and median $c$.

**Derivation.** A continuous CDF climbs from 0 to 1, so by the intermediate value theorem some $m$ has $F(m) = 1/2$, and then $P(X \le m) = P(X \ge m) = 1/2$. For Exp($\lambda$), $1 - e^{-\lambda m} = 1/2$ gives $e^{-\lambda m} = 1/2$ and $m = \ln 2/\lambda \approx 0.693/\lambda$; the density $\lambda e^{-\lambda x}$ is decreasing, so its maximum is at 0. For $f(x) = 2x$: $F(m) = m^2 = 1/2$ gives $m = 1/\sqrt{2} \approx 0.707$, $E[X] = \int_0^1 2x^2\,dx = 2/3$, and $f$ is increasing, so the mode is 1. A long tail pulls the mean towards it more than the median, which depends only on where half the mass sits.

For a discrete mode, compare consecutive terms. For the binomial,

$$\frac{p(k+1)}{p(k)} = \frac{n - k}{k + 1}\cdot\frac{p}{q},$$

which is at least 1 exactly when $(n - k)p \ge (k + 1)q$, that is $k \le (n+1)p - 1$. So the PMF rises while $k + 1 \le (n+1)p$ and falls afterwards, and the peak is at $\lfloor (n+1)p \rfloor$, with a tie between $j-1$ and $j$ when $(n+1)p = j$ is an integer. For the Poisson the ratio is $\lambda/(k+1)$, which gives $\lfloor \lambda \rfloor$ the same way. For symmetry about $c$, $X - c$ and $c - X$ have the same distribution, so $E[X] - c = c - E[X]$ and $F(c) = 1 - F(c)$ at a continuity point.

**GATE use.** "Median of an exponential with mean $\theta$" is $\theta \ln 2$; "median of this density" means solving $F(m) = 1/2$ after normalising. Skew questions ask for the ordering of mean, median and mode. The traps are reporting the mean as the median for a skewed distribution, and solving $f(m) = 1/2$ instead of $F(m) = 1/2$.

**Check.** An exponential service time with mean 10 ms has median $10\ln 2 \approx 6.93$ ms. For $2x$ on $[0, 1]$: median $0.7071$, mean $0.667$, mode 1. $B(10, 0.3)$ has $(n+1)p = 3.3$, and the PMF peaks at 3; Poisson(3.5) peaks at 3, and Poisson(3) has $P(X = 2) = P(X = 3)$.

## Minimum, maximum and sums of independent variables
<!-- topics: em-probability-statistics.min-max -->

**Claim.** For independent $X_1, \dots, X_n$ with CDFs $F_i$:

$$P\bigl(\max_i X_i \le x\bigr) = \prod_i F_i(x), \qquad P\bigl(\min_i X_i > x\bigr) = \prod_i \bigl(1 - F_i(x)\bigr).$$

For $n$ independent $U(0, 1)$ variables the maximum has CDF $x^n$, density $nx^{n-1}$ and mean $n/(n+1)$, and the minimum has mean $1/(n+1)$. The minimum of independent $\text{Exp}(\lambda_i)$ is $\text{Exp}(\lambda_1 + \dots + \lambda_n)$, and $X_i$ is the smallest with probability $\lambda_i/\sum_j \lambda_j$. For a sum, $E[X + Y] = E[X] + E[Y]$ always, the variances add when the covariance is 0, and the sum of two independent $U(0, 1)$ has the triangular density $f(s) = s$ on $[0, 1]$ and $2 - s$ on $[1, 2]$.

**Derivation.** The maximum is at most $x$ exactly when every $X_i$ is, and the minimum exceeds $x$ exactly when every $X_i$ does; independence turns each intersection into a product. For uniforms, $F(x) = x$ on $[0, 1]$, so the maximum has CDF $x^n$ and density $nx^{n-1}$, and

$$E[\max] = \int_0^1 x \cdot nx^{n-1}\,dx = \frac{n}{n+1}, \qquad E[\min] = \int_0^1 P(\min > x)\,dx = \int_0^1 (1-x)^n\,dx = \frac{1}{n+1},$$

using the tail integral for non-negative variables. For exponentials, $P(\min > x) = \prod e^{-\lambda_i x} = e^{-(\sum \lambda_i)x}$, the $\text{Exp}(\sum \lambda_i)$ survival function, so the rates add and the expected first completion is $1/\sum\lambda_i$. For which one comes first with two variables,

$$P(X_1 \lt X_2) = \int_0^\infty \lambda_1 e^{-\lambda_1 x}\,e^{-\lambda_2 x}\,dx = \frac{\lambda_1}{\lambda_1 + \lambda_2},$$

and grouping the others into one exponential with the summed rate extends it to $n$. For the sum $S = X + Y$ of independent densities, $f_S(s) = \int f_X(x) f_Y(s - x)\,dx$. With two uniforms the integrand is 1 exactly when $0 \le x \le 1$ and $0 \le s - x \le 1$, an interval of length $s$ for $0 \le s \le 1$ and $2 - s$ for $1 \le s \le 2$. The density is a tent, not a constant, because middle sums arise in more ways than extreme ones.

**GATE use.** "Expected time until the first of several independent exponential jobs finishes" adds the rates. "Expected maximum (or minimum) of two uniform readings" goes through the CDF or the survival function. The traps are taking the smallest individual mean as the mean of the minimum, averaging the means, and assuming the sum of uniforms is uniform.

**Check.** For two uniforms $E[\max] = 2/3$ and $E[\min] = 1/3$, and for three $E[\max] = 3/4$; simulations of 200000 draws agree to within 0.005. Servers with rates 2 and 3 per hour give a minimum distributed as $\text{Exp}(5)$, mean $1/5$ hour = 12 minutes, and the rate-3 server finishes first with probability $3/5$, both confirmed by simulation. For the sum of two uniforms, $P(S \le 1.5) = 1 - \frac{1}{2}(0.5)^2 = 0.875$ from the tent, which simulation matches.
