# Quantitative aptitude: derivations

## Percentage change, successive changes and the multiplier rule
<!-- topics: ga-quantitative.percentages -->

**Claim.** Let a quantity change from $x_0 > 0$ to $x_1$. Its percentage change is $p = 100(x_1 - x_0)/x_0$, measured on the starting value. A change of $a\%$ followed by a change of $b\%$ (negative for a decrease, each measured on the value current at that moment) gives the net change

$$\text{net}\,\% = a + b + \frac{ab}{100}.$$

So $+x\%$ followed by $-x\%$, in either order, is always a net loss of $x^2/100$ percent. To undo a change of $a\%$ the next change must be $-100a/(100 + a)$ percent. For prices, with cost price $CP$, selling price $SP$, marked price $MP$ and discount $d\%$, $\text{Profit}\% = 100(SP - CP)/CP$ and $SP = MP(1 - d/100)$.

**Derivation.** From the definition, $x_1 = x_0(1 + p/100)$, so a percentage change is the same as multiplying by $1 + p/100$. The second change acts on $x_1$, not $x_0$, so

$$x_2 = x_0\Bigl(1 + \frac{a}{100}\Bigr)\Bigl(1 + \frac{b}{100}\Bigr) = x_0\Bigl(1 + \frac{a + b}{100} + \frac{ab}{100^2}\Bigr).$$

Subtracting 1 from the bracket and multiplying by 100 gives $a + b + ab/100$. Multiplication commutes, so the order of the two changes does not matter. With $b = -a$ the net is $-a^2/100$, which is negative for every $a \ne 0$. To restore $x_0$ we need $(1 + a/100)(1 + b/100) = 1$, so $1 + b/100 = 100/(100 + a)$ and $b = -100a/(100 + a)$. For more than two changes, keep multiplying; the pairwise formula is only a shortcut for two. Profit percent is a percentage change from $CP$ to $SP$, so its base is $CP$. A discount is a percentage change of $-d$ from $MP$ to $SP$, so its base is $MP$. A markup of $m\%$ on cost then a discount of $d\%$ gives $SP = CP(1 + m/100)(1 - d/100)$, the same multiplier chain. A measurement error works the same way: if each of the $k$ lengths in a product is $e\%$ too long, the product is off by $(1 + e/100)^k - 1$.

**GATE use.** Price raised then cut, population growth over years, discount chains, and percentage error in an area or volume. The traps are adding the percentages, taking the second change on the original base, and computing profit on the selling price or the discount on the cost price. When no absolute value is given, start from 100.

**Check.** $+20$ then $-20$: $20 - 20 - 400/100 = -4$, and $1.2 \times 0.8 = 0.96$. $-20$ then $+10$: $0.8 \times 1.1 = 0.88$, net $-12\%$. A 25% rise is undone by a $-2500/125 = -20\%$ cut. A square side measured 2% long gives area error $1.02^2 - 1 = 4.04\%$. $MP = 500$ with 20% discount gives $SP = 400$; with $CP = 320$ the profit is $80/320 = 25\%$. A 40% markup and a 25% discount give $1.4 \times 0.75 = 1.05$, a 5% profit. A script checked the identity $(1 + a/100)(1 + b/100) - 1 = (a + b + ab/100)/100$ over a grid of integer $a, b$.

## Ratios as weighted averages: alligation, dilution and replacement
<!-- topics: ga-quantitative.ratios-mixtures -->

**Claim.** (1) Mixing quantity $q_1$ of quality $c_1$ with $q_2$ of quality $c_2$, where quality is a value per unit of the same quantity (price per kg, fraction of acid per litre), gives mean quality $m = (q_1c_1 + q_2c_2)/(q_1 + q_2)$. For $c_1 < m < c_2$ the required ratio is

$$\frac{q_1}{q_2} = \frac{c_2 - m}{m - c_1}.$$

(2) When water is added to a mixture, the amount of the other component stays fixed. (3) A vessel of volume $V$ holding $Q_0$ of a liquid, from which $x$ of the mixture is drawn and replaced by water $n$ times (with thorough mixing each time), keeps $Q_n = Q_0(1 - x/V)^n$ of that liquid. (4) Partners share profit in the ratio of capital $\times$ time.

**Derivation.** (1) Total quality is additive: $q_1$ units at $c_1$ and $q_2$ at $c_2$ contain $q_1c_1 + q_2c_2$, spread over $q_1 + q_2$ units. Setting this equal to $m(q_1 + q_2)$ gives $q_1(m - c_1) = q_2(c_2 - m)$, and dividing gives the rule. Both differences are positive exactly when $m$ lies strictly between $c_1$ and $c_2$, which is why the rule needs that assumption. Quality must be per unit of the quantity being counted: mixing by volume with concentrations by mass gives a wrong mean. (2) Water carries none of the other component, so its amount $M$ is invariant; if the target fraction is $f$, the new total is $M/f$. (3) The mixture is uniform, so drawing $x$ of $V$ removes the fraction $x/V$ of every component. After one operation the liquid is $Q_0(1 - x/V)$, and the vessel is full again at volume $V$, so the same fraction is removed next time. Induction on $n$ gives the power. (4) Profit is earned at the same rate per rupee per month for every partner, so each share is proportional to capital $\times$ months, the money-time each partner supplied.

**GATE use.** Two grades of tea or two solutions mixed to a target; water added to reach a target percentage; repeated draw-and-refill. The traps are writing the alligation differences the wrong way round (dearer minus mean goes over the cheaper quantity), applying the new percentage to the old total, and using $1 - nx/V$ instead of the power for replacement.

**Check.** Tea at 60 and 90 per kg blended to 72: $(90 - 72) : (72 - 60) = 18 : 12 = 3 : 2$, and $(3 \cdot 60 + 2 \cdot 90)/5 = 72$. 10% and 20% to 15%: $5 : 5 = 1 : 1$. A 60 L mix at 75% milk has 45 L milk; for 60% the total must be $45/0.6 = 75$ L, so add 15 L. From 40 L, drawing 4 L twice leaves $40 \times 0.9^2 = 32.4$ L, which a step-by-step simulation reproduced. Rs 3000 for 12 months against Rs 4000 for 6 months: $36000 : 24000 = 3 : 2$.

## Simple and compound interest, the CI − SI gap and the effective rate
<!-- topics: ga-quantitative.interest -->

**Claim.** Principal $P$ at $R\%$ per year for $T$ years earns simple interest $SI = PRT/100$. With compounding $k$ times a year at nominal rate $R$, the amount is $A = P(1 + R/(100k))^{kT}$ and $CI = A - P$. With annual compounding and $r = R/100$,

$$D_2 = CI - SI = Pr^2 \;(T = 2), \qquad D_3 = Pr^2(3 + r) \;(T = 3).$$

The effective annual rate is $r_{\text{eff}} = (1 + R/(100k))^k - 1$.

**Derivation.** Simple interest pays $Pr$ each year on the original principal only, so after $T$ years it is $PrT = PRT/100$. Under compounding, interest is added to the balance at the end of each period, so each period multiplies the balance by $1 + i$, where $i = R/(100k)$ is the rate per period. After $kT$ periods the balance is $P(1 + i)^{kT}$. For annual compounding, expand: $(1 + r)^2 - 1 = 2r + r^2$, and subtracting $SI = 2Pr$ leaves $Pr^2$, the interest on the first year's interest. For three years, $(1 + r)^3 - 1 = 3r + 3r^2 + r^3$, and subtracting $3Pr$ leaves $P(3r^2 + r^3) = Pr^2(3 + r)$. The effective rate is the annual rate that, compounded once, gives the same one-year growth: $1 + r_{\text{eff}} = (1 + i)^k$. Since $(1 + i)^k \ge 1 + ki$ by the binomial theorem, the effective rate is at least the nominal rate, with equality only for $k = 1$. To solve for $T$ in compound interest, take logarithms: $T = \log(A/P)/\log(1 + r)$.

**GATE use.** Find $P$ from a given CI − SI gap; compare half-yearly with annual compounding; find the time for money to double. The traps are using the 2-year gap formula for 3 years, using $R$ instead of $R/k$ per period, and forgetting the $3 + r$ factor.

**Check.** A gap of Rs 25 over 2 years at 5%: $P \times 0.05^2 = 25$ gives $P = 10000$. A gap of Rs 31 over 3 years at 10%: $0.01 \times 3.1 \times P = 31$ gives $P = 1000$, the same as $1.1^3 - 1 - 0.3 = 0.031$ per rupee. 10% half-yearly: $1.05^2 - 1 = 10.25\%$. 12% quarterly: $1.03^4 - 1 \approx 12.55\%$. A script confirmed $D_3$ against the direct difference for $R = 1$ to $29$.

## Average speed, unit conversion, relative speed and boats
<!-- topics: ga-quantitative.speed-distance -->

**Claim.** (1) $1$ km/h $= 5/18$ m/s. (2) Over two legs of equal distance at speeds $u$ and $v$, the average speed is the harmonic mean $2uv/(u + v)$; over two legs of equal time it is $(u + v)/2$. (3) Two bodies on a line moving towards each other close their gap at $v_1 + v_2$; in the same direction at $\lvert v_1 - v_2 \rvert$. So two trains of lengths $L_1, L_2$ clear each other in $t = (L_1 + L_2)/(v_1 \pm v_2)$. (4) A boat with still-water speed $b$ in a stream of speed $s$ (with $b > s$) moves at $d = b + s$ downstream and $u = b - s$ upstream, so $b = (d + u)/2$ and $s = (d - u)/2$.

**Derivation.** (1) $1$ km/h is 1000 m per 3600 s, and $1000/3600 = 5/18$. (2) Average speed is total distance over total time, never the mean of the speeds. With each leg of length $D$, the times are $D/u$ and $D/v$, so $\bar v = 2D/(D/u + D/v) = 2uv/(u + v)$; $D$ cancels, so it can be any value. With each leg lasting $t$, the distance is $(u + v)t$ over $2t$, which is the arithmetic mean. Since $(u + v)^2 - 4uv = (u - v)^2 \ge 0$, the harmonic mean never exceeds the arithmetic mean, with equality only for $u = v$. (3) In the frame of the second body, the second body is at rest and the first moves at $v_1 - v_2$ (same direction) or $v_1 + v_2$ (opposite). In opposite directions, crossing starts when the two fronts meet and ends when the two rears separate. In the same direction, it starts when the faster train's front reaches the slower train's rear and ends when the faster train's rear passes the slower train's front. Either way the moving train covers $L_1 + L_2$ in that frame. A pole or a person has length 0 and speed 0; a platform has length but speed 0. (4) The stream adds its speed going down and subtracts it going up. Adding and subtracting the two equations solves the linear system.

**GATE use.** Train passing a train, a pole or a platform; a round trip at two speeds; boats with given up and down times. The traps are leaving speeds in km/h with lengths in metres (off by 3.6), using the sum of speeds for the same direction, and averaging speeds arithmetically.

**Check.** 40 and 60 km/h over equal distances: $4800/100 = 48$ km/h, not 50; a script checked $2D/(D/u + D/v) = 2uv/(u + v)$ for all integer $u, v$ up to 29. Trains of 150 m and 100 m at 60 and 30 km/h in the same direction: relative speed $30 \times 5/18 = 25/3$ m/s, time $250/(25/3) = 30$ s; in opposite directions $90 \times 5/18 = 25$ m/s and 10 s. Trains 300 km apart at 60 and 40 km/h towards each other meet after $300/100 = 3$ h. Down 15 and up 9 km/h give $b = 12$ and $s = 3$.

## Work as rate: combined work, pipes and man-days
<!-- topics: ga-quantitative.time-work -->

**Claim.** If a worker alone finishes a job in $a$ days, working at a constant rate, then the worker does $1/a$ of the job per day. With workers or filling pipes of times $a, b$ and a leak of time $c$ working together,

$$\frac{1}{T} = \frac{1}{a} + \frac{1}{b} - \frac{1}{c},$$

provided the right side is positive. If $M$ workers of equal efficiency working $H$ hours a day for $D$ days do $W$ units of work, then $MDH/W$ is the same in every scenario.

**Derivation.** A constant rate $\rho$ that finishes one job in $a$ days satisfies $\rho a = 1$, so $\rho = 1/a$. Work done by several agents in the same interval is the sum of their individual work, so rates add; a leak removes work, so its rate enters with a minus sign. Together they do $1/a + 1/b - 1/c$ per day, and the time for one job is its reciprocal. Times do not add: two workers are faster than either, so $T$ is less than $\min(a, b)$ when there is no leak. The LCM method sets the job to $L = \operatorname{lcm}(a, b, \dots)$ units, so every rate $L/a$ is a whole number of units per day, which keeps the arithmetic integral. When someone leaves after $t$ days, the work left is $1 - t \cdot (\text{combined rate})$, and the remaining workers' rate gives the remaining time. For man-days: each worker does a fixed amount $e$ per hour, so $W = eMDH$, and $e = W/(MDH)$ is the same in both scenarios. Unequal efficiencies break this; then weight each worker by efficiency.

**GATE use.** Two workers with one leaving midway; a tank with an inlet and a leak; scaling a workforce. The traps are adding days, forgetting that the second phase starts from the remaining work, and dividing the remainder by the rate of the worker who left.

**Check.** A in 10 days, B in 15: $1/10 + 1/15 = 1/6$, so 6 days. With 30 units, A does 3 a day and B 2; together for 3 days they do 15, and A finishes the other 15 in 5 more days, which a day-by-day simulation confirmed (8 days in all). A pipe filling in 12 h with a leak emptying in 18 h: $1/12 - 1/18 = 1/36$, so 36 h. If 12 workers at 8 h a day build one wall in 10 days, then 16 workers at 6 h a day build two walls in $D$ days with $12 \cdot 10 \cdot 8/1 = 16 \cdot D \cdot 6/2$, so $D = 20$.

## Clock-hand angles and odd days
<!-- topics: ga-quantitative.clocks-calendars -->

**Claim.** At $H$ hours $M$ minutes ($0 \le H \le 11$, $0 \le M < 60$) the angle between the hands of an ordinary clock is $\theta = \lvert 30H - 5.5M \rvert$, and the smaller angle is $360^\circ - \theta$ when $\theta > 180^\circ$. The hands coincide every $720/11 \approx 65.45$ minutes, 11 times in 12 hours and 22 times in a day. A normal year has 1 odd day and a leap year 2. In the Gregorian calendar a century has 5 odd days when its last year is not divisible by 400, and 6 when it is (1901 to 2000 has 6); 400 years have 0, so the calendar repeats every 400 years.

**Derivation.** Measure angles clockwise from 12. The minute hand turns $360^\circ$ in 60 minutes, $6^\circ$ per minute, so it is at $6M$. The hour hand turns $360^\circ$ in 12 hours, which is $30^\circ$ per hour and $0.5^\circ$ per minute, so it is at $30H + 0.5M$. Their difference is $30H + 0.5M - 6M = 30H - 5.5M$, and the absolute value gives the angle in $[0, 360)$. The minute hand gains $5.5^\circ$ per minute, so it gains a full lap of $360^\circ$ every $360/5.5 = 720/11$ minutes. Starting together at 12:00, the meetings are at $720k/11$ for $k = 0, \dots, 10$; $k = 11$ is 12:00 again. So there are 11 in 12 hours and 22 in 24. The same argument gives any fixed angle $\alpha$ with $0 < \alpha < 180^\circ$ twice per lap, 22 times in 12 hours (right angles included). For calendars, a weekday advances by the number of days mod 7. $365 = 52 \cdot 7 + 1$ and $366 = 52 \cdot 7 + 2$. A century has 24 leap years (years divisible by 4, except the century year unless divisible by 400), or 25 when its last year is divisible by 400. So $100 \cdot 365 + 24 = 36524 \equiv 5 \pmod 7$, and $36525 \equiv 6 \pmod 7$ for a century such as 1901 to 2000. Counted from year 1, the first 100, 200, 300 and 400 years have 5, 3, 1 and 0 odd days. Four centuries have $97$ leap years and $400 \cdot 365 + 97 = 146097 = 20871 \cdot 7$, which is 0 odd days.

**GATE use.** The angle at a stated time; when the hands next coincide or are opposite; weekday of a date; a fast or slow clock. The traps are ignoring the hour hand's motion within the hour, reporting the reflex angle, and counting the leap day when 29 February is not between the two dates.

**Check.** At 4:30, $\lvert 120 - 165 \rvert = 45^\circ$. At 9:00, $\theta = 270^\circ$ and the smaller angle is $90^\circ$. A script confirmed the formula against hand positions for every minute of 12 hours, found 11 coincidences and 22 right angles, and checked that 1 January 2026 is a Thursday, 2027 a Friday (one odd day) and 2029 a Monday (2028 is leap, two odd days), and that every date's weekday repeats after 400 years. A clock set at 8:00 AM that loses 2 min per hour reads $360 - 12 = 348$ minutes later, 1:48 PM, at 2:00 PM.

## Logarithm laws, change of base and the number of bits
<!-- topics: ga-quantitative.powers-logarithms -->

**Claim.** For positive $a, b$ and a base $c > 0$, $c \ne 1$: $\log(ab) = \log a + \log b$, $\log(a/b) = \log a - \log b$, $\log a^n = n\log a$, and $\log_b a = \log_c a/\log_c b$ (with $b \ne 1$), so $\log_b a \cdot \log_a b = 1$. There is no law for $\log(a + b)$. A positive integer $n$ has $\lfloor \log_2 n \rfloor + 1 = \lceil \log_2(n + 1) \rceil$ binary digits.

**Proof.** By definition $\log_c x = y$ means $c^y = x$. Let $\log_c a = p$ and $\log_c b = q$, so $a = c^p$ and $b = c^q$. The exponent law $c^pc^q = c^{p + q}$ gives $ab = c^{p + q}$, which is the product law; $c^p/c^q = c^{p - q}$ gives the quotient law; $(c^p)^n = c^{pn}$ gives the power law. For change of base let $y = \log_b a$, so $b^y = a$; take $\log_c$ of both sides and apply the power law: $y\log_c b = \log_c a$. Swapping $a$ and $b$ and multiplying gives 1. A sum has no exponent law, and $a = b = 1$ shows $\log 2 \ne \log 1 + \log 1 = 0$. For bits: $n$ has exactly $k$ binary digits when its leading 1 is in position $k - 1$, that is $2^{k-1} \le n < 2^k$. Taking $\log_2$ gives $k - 1 \le \log_2 n < k$, so $k - 1 = \lfloor \log_2 n \rfloor$. The same inequality, with integers, is $2^{k-1} < n + 1 \le 2^k$, so $k = \lceil \log_2(n + 1) \rceil$.

**GATE use.** Solving $4^x = 32$ by a common base; comparing $2^{300}$ with $3^{200}$; bits to represent $n$ values or the number $n$; MSQs that plant $\log(a + b) = \log a + \log b$ or an inverted change of base. The trap with bits is that $n$ values (0 to $n - 1$) need $\lceil \log_2 n \rceil$ bits while the number $n$ itself needs $\lfloor \log_2 n \rfloor + 1$; the two differ when $n$ is a power of 2.

**Check.** $\log_8 4 = \log_2 4/\log_2 8 = 2/3$. $4^x = 32$ gives $2^{2x} = 2^5$, $x = 2.5$. $2^{300} = 8^{100} < 9^{100} = 3^{200}$. 1000 lies in $[512, 1024)$, so 10 bits; 1024 needs 11. A script compared both bit formulas with the exact bit length for every $n$ from 1 to 199999.

## Permutations, combinations, repeated items and circles
<!-- topics: ga-quantitative.counting -->

**Claim.** (1) Independent stages with $m$ and $n$ choices give $mn$ outcomes; disjoint cases add. (2) Ordered selections of $r$ from $n$ distinct items number ${}^nP_r = n!/(n - r)!$, and unordered ones $\binom{n}{r} = n!/(r!(n - r)!)$, with $\binom{n}{r} = \binom{n}{n - r}$. (3) Arrangements of $n$ items with identical groups of sizes $p, q, r, \dots$ number $n!/(p!q!r!\cdots)$. (4) $n$ distinct people around a table, with rotations counted as the same, number $(n - 1)!$; for $n \ge 3$ beads on a necklace, where a flip is also the same, $(n - 1)!/2$.

**Proof.** (1) Each outcome is a pair (first choice, second choice), and there are $m$ rows of $n$ pairs. (2) Fill $r$ positions in order: $n$ choices for the first, $n - 1$ for the second, down to $n - r + 1$, and the product is $n!/(n - r)!$. Each unordered $r$-set appears in exactly $r!$ orders, so dividing by $r!$ counts sets. Choosing the $r$ taken is the same as choosing the $n - r$ left, a bijection, which gives the symmetry. (3) Label the identical copies so all $n$ items are distinct: $n!$ arrangements. Each unlabelled arrangement arises from exactly $p!q!r!\cdots$ labelled ones, one per way of permuting the labels within each group, so divide. (4) Each circular seating gives $n$ linear arrangements, one per starting seat, and they are distinct because the people are distinct, so the count is $n!/n = (n - 1)!$. For $n \ge 3$ a seating and its mirror image are different circular orders, and a flip merges each such pair, giving half. For $n \le 2$ the mirror is the same order, so no halving. Keep-together conditions glue the block into one unit and multiply by its internal orders.

**GATE use.** Words with repeated letters, vowels together or apart, committees with a gender split, round tables. The traps are forgetting the block's internal order, dividing by 2 for seats (people at a table are not flipped), and using $nPr$ where order does not matter.

**Check.** SPEAK with E and A adjacent: $4! \times 2! = 48$, and a brute-force pass over all 120 orders found 48. BANANA: $6!/(3!\,2!) = 60$, matching the number of distinct permutations. Five people at a round table: 24 classes under rotation; five distinct beads: 12 classes under rotation and reflection, both by enumeration. ${}^5P_2 = 20$, $\binom52 = 10$. Two men of 4 and one woman of 3: $\binom42\binom31 = 18$.

## Stars and bars and the binomial theorem
<!-- topics: ga-quantitative.counting -->

**Claim.** $r$ identical objects can be given to $n$ distinct recipients in $\binom{r + n - 1}{n - 1}$ ways, or $\binom{r - 1}{n - 1}$ ways if each gets at least one ($r \ge n$); these also count the non-negative and the positive integer solutions of $x_1 + \cdots + x_n = r$. $r$ distinct objects go to $n$ recipients in $n^r$ ways. For a positive integer $n$,

$$(a + b)^n = \sum_{k=0}^{n} \binom{n}{k} a^{n-k}b^k, \qquad T_{k+1} = \binom{n}{k}a^{n-k}b^k,$$

the coefficients sum to $2^n$, and even $n$ has one middle term $T_{n/2 + 1}$ while odd $n$ has two.

**Proof.** A distribution $(x_1, \dots, x_n)$ with sum $r$ corresponds to a row of $r$ stars and $n - 1$ bars, where $x_i$ is the number of stars between bar $i - 1$ and bar $i$. The map is a bijection: every row of $r + n - 1$ symbols with $n - 1$ bars gives one distribution and back. Choosing the bar positions gives $\binom{r + n - 1}{n - 1}$. If each $x_i \ge 1$, put $y_i = x_i - 1 \ge 0$ with sum $r - n$, giving $\binom{r - 1}{n - 1}$. For distinct objects, each object independently picks one of $n$ recipients, so $n^r$. For the binomial theorem, expanding the product of $n$ factors $(a + b)$ picks $a$ or $b$ from each factor, and a term $a^{n-k}b^k$ arises once for each choice of the $k$ factors that supply $b$, so its coefficient is $\binom{n}{k}$. Putting $a = b = 1$ gives $\sum_k \binom{n}{k} = 2^n$. There are $n + 1$ terms; for even $n$ that is odd, so one middle term at index $k = n/2$, and for odd $n$ two, at $k = (n \mp 1)/2$.

**GATE use.** Integer solutions of an equation, sweets among children, the coefficient of $x^k$ or the constant term of an expansion. The traps are using stars and bars for distinct objects, forgetting the at-least-one shift, and dropping the power of a coefficient such as the $2^3$ in $(1 + 2x)^5$.

**Check.** 5 identical sweets among 3 children: $\binom72 = 21$, or $\binom42 = 6$ if each gets one; enumeration of all triples agreed. 5 distinct sweets: $3^5 = 243$. The coefficient of $x^3$ in $(1 + 2x)^5$ is $\binom53 2^3 = 80$, confirmed by expanding all 32 choice strings. The constant term of $(x + 1/x)^6$ is the middle term $\binom63 = 20$. A script checked $\sum_k \binom nk = 2^n$ for $n < 20$.

## Arithmetic, geometric and arithmetico-geometric sums
<!-- topics: ga-quantitative.series -->

**Claim.** An AP with first term $a$ and difference $d$ has $n$th term $a + (n - 1)d$ and $S_n = \tfrac n2(2a + (n - 1)d)$, so its mean equals the mean of its first and last terms. A GP with ratio $r \ne 1$ has $S_n = a(r^n - 1)/(r - 1)$ and, for $\lvert r \rvert < 1$, $S_\infty = a/(1 - r)$. The infinite AGP $\sum_{k \ge 0}(a + kd)r^k$ with $\lvert r \rvert < 1$ sums to

$$S_\infty = \frac{a}{1 - r} + \frac{dr}{(1 - r)^2}.$$

For positive numbers, $AM \ge GM \ge HM$, with equality only when all are equal; for two numbers $GM^2 = AM \cdot HM$.

**Derivation.** AP: write $S_n$ forwards and backwards and add term by term. Each pair sums to $a + (a + (n - 1)d) = 2a + (n - 1)d$, and there are $n$ pairs, so $2S_n = n(2a + (n - 1)d)$. GP: $rS_n - S_n = ar^n - a$ because every middle term cancels, giving the formula. If $\lvert r \rvert < 1$ then $r^n \to 0$ and $S_n \to a/(1 - r)$; otherwise the terms do not tend to 0 and there is no finite sum. AGP: let $S = \sum (a + kd)r^k$. Then

$$S - rS = a + \sum_{k \ge 1}\bigl((a + kd) - (a + (k - 1)d)\bigr)r^k = a + d\sum_{k \ge 1} r^k = a + \frac{dr}{1 - r},$$

and dividing by $1 - r$ gives the claim. For two positive numbers $x, y$: $AM - GM = (\sqrt x - \sqrt y)^2/2 \ge 0$, and $HM = 2xy/(x + y) = GM^2/AM \le GM$ because $AM \ge GM$. The $n$-number case follows from the concavity of $\log$ (Jensen) for AM–GM, and applying AM–GM to the reciprocals gives GM–HM.

**GATE use.** Consecutive integers with a given mean, doubling sequences, a bouncing ball's total path, $\sum k/2^k$. The traps are summing a GP with $\lvert r \rvert \ge 1$ to infinity and treating an AGP as a plain GP.

**Check.** Five consecutive integers with mean 15 are 13 to 17, summing to 75. $1 + \cdots + 100 = 50 \cdot 101 = 5050$. $1 + 2 + \cdots + 2^9 = 1023$. $1 + 2/2 + 3/4 + \cdots$ has $a = d = 1$, $r = 1/2$: $2 + 2 = 4$; $\sum (3 + 2k)/3^k$ gives $4.5 + 1.5 = 6$; both agreed with partial sums to 300 terms. For 4 and 9: $AM = 6.5$, $GM = 6$, $HM = 72/13 \approx 5.54$, and $6.5 \cdot 72/13 = 36 = 6^2$.

## Sums of the first n integers, squares and cubes
<!-- topics: ga-quantitative.series -->

**Claim.** For every positive integer $n$,

$$\sum_{k=1}^n k = \frac{n(n + 1)}{2}, \qquad \sum_{k=1}^n k^2 = \frac{n(n + 1)(2n + 1)}{6}, \qquad \sum_{k=1}^n k^3 = \Bigl(\frac{n(n + 1)}{2}\Bigr)^2.$$

The sum of the first $n$ odd numbers is $n^2$.

**Derivation.** The first is an AP with $a = d = 1$. For squares, telescope $(k + 1)^3 - k^3 = 3k^2 + 3k + 1$ over $k = 1, \dots, n$: the left side collapses to $(n + 1)^3 - 1$, so

$$3\sum k^2 = (n + 1)^3 - 1 - \frac{3n(n + 1)}{2} - n = \frac{(n + 1)\bigl(2(n + 1)^2 - 3n - 2\bigr)}{2} = \frac{(n + 1)\,n(2n + 1)}{2},$$

where $2(n + 1)^2 - 3n - 2 = 2n^2 + n = n(2n + 1)$. Dividing by 3 gives the formula. For cubes use induction. It holds at $n = 1$. If it holds for $n$, adding $(n + 1)^3$ gives $\tfrac{(n + 1)^2}{4}\bigl(n^2 + 4(n + 1)\bigr) = \tfrac{(n + 1)^2(n + 2)^2}{4}$, the formula for $n + 1$. Odd numbers: $\sum_{k=1}^n (2k - 1) = n(n + 1) - n = n^2$.

**GATE use.** Sums over a range (subtract two prefix sums), counting squares on a chessboard ($\sum k^2$), and series questions that hide $\sum k^3 = (\sum k)^2$. The trap is summing from $k = 1$ when the range starts elsewhere.

**Check.** For $n = 10$: 55, 385 and 3025, and $3025 = 55^2$. $11^2 + \cdots + 20^2 = 2870 - 385 = 2485$. An $8 \times 8$ board has $\sum_{k=1}^8 k^2 = 204$ squares. A script checked all three formulas for every $n \le 300$ and the odd-number sum for $n < 100$.

## Reading charts: percentage change, share, pie angles and map scales
<!-- topics: ga-quantitative.data-interpretation, ga-quantitative.charts-plots-maps -->

**Claim.** (1) A part $x$ of a total $N$ has share $x/N$ and a pie sector of central angle $\theta = 360^\circ \cdot x/N$, so 1% is $3.6^\circ$. (2) Angles in two pie charts compare values only when the totals are equal; otherwise compare $\theta N/360$. (3) On a line graph with equally spaced time points the steepest segment has the largest absolute change, which need not be the largest percentage change. (4) A map at scale $1 : s$ turns a map length $\ell$ into $s\ell$, and perpendicular legs combine by Pythagoras. (5) A quantity going from $V_0$ to $V_n$ over $n$ periods has average (compound) growth rate $g = (V_n/V_0)^{1/n} - 1$ per period, and a share moving from $a\%$ to $b\%$ changes by $b - a$ percentage points, a relative change of $(b - a)/a$.

**Derivation.** (1) A pie chart divides the full turn in proportion to value, so sector angle over $360^\circ$ equals part over total. One percent of $360^\circ$ is $3.6^\circ$. (2) Inverting (1), a sector stands for $\theta N/360$, which depends on $N$; a smaller angle on a larger pie can stand for a larger value. (3) A segment's slope is $\Delta y/\Delta t$, which ranks segments by the absolute change $\Delta y$ when every $\Delta t$ is the same. Its percentage change is $\Delta y/y_0$, which also depends on the starting value $y_0$, so a small rise from a small base can beat a large rise from a large base. (4) The scale means one unit on the map is $s$ of the same unit on the ground, a similarity with ratio $s$; similarity preserves right angles, so the ground distance of legs $\ell_1, \ell_2$ is $s\sqrt{\ell_1^2 + \ell_2^2}$. In stacked bars, a segment's value is its top minus its bottom, because the bar height is the running total. (5) A constant rate $g$ per period multiplies the value by $1 + g$ each period, so $V_n = V_0(1 + g)^n$; solving gives $g = (V_n/V_0)^{1/n} - 1$. Dividing the total rise by $n$ ignores the compounding and overstates $g$, since $(1 + g)^n \ge 1 + ng$ by the binomial theorem. A percentage point is a difference of two percentages, while a percent change divides that difference by the starting percentage.

**GATE use.** Tables and bar charts with MSQ options on growth and share; a pie chart with a stated total; a map distance. The traps are taking percentage change on the later value, comparing two pies by angle, reading a stacked segment from the axis, and ignoring "in thousands" on an axis.

**Check.** Revenue P 40, Q 25, R 60, S 75 then P 50, Q 30, R 54, S 66: changes $+25\%$, $+20\%$, $-10\%$, $-12\%$, totals 200 both years, and R's later share $54/200 = 27\%$. A $54^\circ$ sector of 4,00,000 is $0.15 \times 400000 = 60000$. A $90^\circ$ sector of a 200 pie is 50 while a $60^\circ$ sector of a 600 pie is 100. A line rising 10 to 20 is flatter than one rising 50 to 70 but grows 100% against 40%. At 1 : 50,000, legs of 3 cm and 4 cm give 5 cm, which is 2.5 km; at 1 : 2,50,000, legs of 6 cm and 8 cm give 10 cm, which is 25 km. Growth from 50 to 72 in 2 years is $\sqrt{1.44} - 1 = 20\%$ a year, against the naive $44/2 = 22\%$. A share going from 20% to 25% is 5 percentage points and a 25% relative rise.

## Heron's formula, sectors and segments
<!-- topics: ga-quantitative.mensuration -->

**Claim.** A triangle with sides $a, b, c$ and semi-perimeter $s = (a + b + c)/2$ has area $\sqrt{s(s - a)(s - b)(s - c)}$. A sector of a circle of radius $r$ with central angle $\theta$ (degrees) has area $(\theta/360)\pi r^2$ and arc length $(\theta/360)2\pi r$, and the segment cut off by its chord has area $(\theta/360)\pi r^2 - \tfrac12 r^2\sin\theta$.

**Proof.** Heron: area $= \tfrac12 ab\sin C$, so $16A^2 = 4a^2b^2(1 - \cos^2 C)$. By the law of cosines $2ab\cos C = a^2 + b^2 - c^2$, so

$$16A^2 = (2ab)^2 - (a^2 + b^2 - c^2)^2 = \bigl(2ab + a^2 + b^2 - c^2\bigr)\bigl(2ab - a^2 - b^2 + c^2\bigr) = \bigl((a + b)^2 - c^2\bigr)\bigl(c^2 - (a - b)^2\bigr).$$

Each factor is a difference of squares: $(a + b + c)(a + b - c)(c + a - b)(c - a + b) = 2s \cdot 2(s - c) \cdot 2(s - b) \cdot 2(s - a)$. Dividing by 16 and taking the root gives the formula. Sector: area and arc length are both proportional to the central angle (rotating the sector by any angle preserves them, so equal angles give equal pieces), and a full turn gives $\pi r^2$ and $2\pi r$. Segment: the sector is the segment plus the isosceles triangle with two sides $r$ enclosing angle $\theta$, whose area is $\tfrac12 r^2\sin\theta$.

**GATE use.** Area of a scalene triangle from its sides; a sector or the area between a chord and an arc; the rhombus and trapezium areas from the same triangle splits. The traps are using the full perimeter instead of $s$ and putting $\theta$ in degrees into a radian formula.

**Check.** 13, 14, 15: $s = 21$, $A = \sqrt{21 \cdot 8 \cdot 7 \cdot 6} = \sqrt{7056} = 84$; 3, 4, 5 gives 6. A script compared Heron with the shoelace area on 1000 random triangles. Radius 6 and $60^\circ$: sector $6\pi \approx 18.85$, arc $2\pi \approx 6.28$, segment $6\pi - 9\sqrt3 \approx 3.26$; a Monte Carlo estimate gave 3.23.

## Volumes and surfaces of the cylinder, cone and sphere
<!-- topics: ga-quantitative.mensuration -->

**Claim.** For radius $r$ and height $h$: a cylinder has volume $\pi r^2h$ and closed surface $2\pi r(r + h)$; a cone has volume $\tfrac13\pi r^2h$, slant height $l = \sqrt{r^2 + h^2}$, curved surface $\pi rl$ and total surface $\pi rl + \pi r^2$; a sphere has volume $\tfrac43\pi r^3$ and surface $4\pi r^2$, and a solid hemisphere has volume $\tfrac23\pi r^3$ and total surface $3\pi r^2$. Scaling every length by $k$ scales areas by $k^2$ and volumes by $k^3$. Melting and recasting conserves volume.

**Derivation.** Cylinder: every horizontal slice is a disc of area $\pi r^2$ and there are $h$ of height, so $\pi r^2h$; the curved surface unrolls to a rectangle $2\pi r \times h$, and the two lids add $2\pi r^2$. Cone: the slice at height $y$ above the base has radius $r(1 - y/h)$, so

$$V = \int_0^h \pi r^2\Bigl(1 - \frac yh\Bigr)^2 dy = \pi r^2 h\int_0^1 t^2\,dt = \frac13\pi r^2h.$$

The slant height is the hypotenuse of the right triangle with legs $r$ and $h$. The curved surface unrolls to a sector of radius $l$ with arc $2\pi r$; a sector's area is half its radius times its arc, so $\tfrac12 \cdot l \cdot 2\pi r = \pi rl$. Sphere: the slice at height $y$ has radius $\sqrt{r^2 - y^2}$, so $V = \int_{-r}^{r}\pi(r^2 - y^2)\,dy = \pi(2r^3 - \tfrac23 r^3) = \tfrac43\pi r^3$. Thin shells give the surface: $dV/dr = 4\pi r^2$ is the area of the sphere being swept out. A hemisphere is half the volume and half the curved surface, $2\pi r^2$, plus the flat disc $\pi r^2$. Scaling: area is two lengths multiplied and volume three. Recasting: the metal's volume is fixed, so the number of pieces is the original volume over one piece's volume. Diagonals: a cuboid's face diagonal is $\sqrt{l^2 + b^2}$, and it is perpendicular to the edge $h$, so Pythagoras again gives the space diagonal $\sqrt{l^2 + b^2 + h^2}$, which is $\sqrt3\,a$ for a cube. A regular hexagon of side $a$ splits from its centre into six equilateral triangles of side $a$ (each central angle is $60^\circ$ and the two radii are equal), each of height $\tfrac{\sqrt3}{2}a$ and area $\tfrac{\sqrt3}{4}a^2$, so its area is $\tfrac{3\sqrt3}{2}a^2$.

**GATE use.** A sphere recast into cones or wires, the cost of painting a surface, a scaled model. The traps are using $l$ in the cone's volume or $h$ in its curved surface, dropping the $\tfrac13$, and forgetting the base of a solid hemisphere.

**Check.** A sphere of radius 6 has $288\pi$; a cone of radius 3 and height 4 has $12\pi$, so 24 cones. Numerical integration of the slices reproduced $12\pi$ and $288\pi$ to six figures. The 3-4 cone has $l = 5$, curved surface $15\pi$ and total $24\pi$. Dropping the $\tfrac13$ gives 8 cones, the planted wrong option. A cube of side 3 has space diagonal $\sqrt{27} = 3\sqrt3 \approx 5.196$, and a hexagon of side 2 has area $6\sqrt3 \approx 10.39$.

## Polygon angles and the circle theorems
<!-- topics: ga-quantitative.geometry -->

**Claim.** The interior angles of a simple $n$-gon sum to $(n - 2) \times 180^\circ$, and the exterior angles of a convex polygon sum to $360^\circ$, so a regular $n$-gon has exterior angle $360^\circ/n$. An exterior angle of a triangle equals the sum of the two opposite interior angles. In a circle, the angle an arc subtends at the centre is twice the angle it subtends at any point on the rest of the circle, so an angle in a semicircle is $90^\circ$. A tangent is perpendicular to the radius at its point of contact, the perpendicular from the centre bisects a chord, and a chord of length $c$ lies at distance $\sqrt{r^2 - c^2/4}$ from the centre, so equal chords are equidistant.

**Proof.** A convex $n$-gon splits from one vertex into $n - 2$ triangles whose angles together make up exactly the polygon's interior angles; each triangle contributes $180^\circ$. (A non-convex simple polygon can also be triangulated into $n - 2$ triangles.) At each vertex the interior and exterior angles sum to $180^\circ$, so the exterior sum is $180n - 180(n - 2) = 360^\circ$. In a triangle the exterior angle at $C$ is $180^\circ - C = A + B$. Inscribed angle: let $O$ be the centre and $P$ a point on the circle, and suppose first that $PO$ extended is a diameter through $Q$. Triangle $OPA$ is isosceles ($OP = OA = r$), so its base angles are equal, say $x$, and the exterior angle $\angle AOQ = 2x$. Doing the same for $B$ and adding (or subtracting, when $A$ and $B$ lie on the same side of $PQ$) gives $\angle AOB = 2\angle APB$. A diameter subtends $180^\circ$ at the centre, hence $90^\circ$ at the circle. Tangent: every point of the tangent other than the contact point $T$ lies outside the circle, so $OT$ is the shortest segment from $O$ to the line, and the shortest segment to a line is the perpendicular. Chord: the triangles formed by $O$, the foot $M$ of the perpendicular and the two ends are congruent (common side $OM$, equal hypotenuses $r$, right angles), so $M$ is the midpoint, and Pythagoras gives $OM = \sqrt{r^2 - (c/2)^2}$.

**GATE use.** Interior angle of a regular polygon, number of sides from an angle, angles in a cyclic figure, MSQs on circle facts. The traps are reversing the factor 2 in the inscribed angle theorem and applying the exterior-angle sum to a non-convex polygon.

**Check.** A hexagon has interior angles $720/6 = 120^\circ$, an octagon sums to $1080^\circ$. A script took 2000 random triples on a unit circle and found every inscribed angle equal to half the central angle, or $180^\circ$ minus half, the case where the point lies on the minor arc. A chord of 16 in a circle of radius 10 lies at distance $\sqrt{100 - 64} = 6$.

## Triangle inequality, similarity, triangle radii and the power of a point
<!-- topics: ga-quantitative.geometry -->

**Claim.** (1) Three positive lengths form a triangle exactly when each is less than the sum of the other two, equivalently $\lvert a - b \rvert < c < a + b$. (2) Similar triangles with side ratio $k$ have area ratio $k^2$. (3) A triangle with sides $a, b, c$, area $A$ and semi-perimeter $s$ has inradius $r = A/s$ and circumradius $R = abc/(4A)$; a right triangle has $R$ equal to half its hypotenuse. (4) If two lines through a point $P$ meet a circle at $A, B$ and at $C, D$, then $PA \cdot PB = PC \cdot PD$, whether $P$ is inside or outside; for a tangent from an outside point, $PT^2 = PA \cdot PB$. (5) Opposite angles of a cyclic quadrilateral sum to $180^\circ$.

**Proof.** (1) The straight segment is the shortest path between two points, so $c < a + b$, strictly unless the three vertices are collinear; applying it to each side gives the rest. (2) Area is $\tfrac12 \times$ base $\times$ height, and both the base and the height scale by $k$. (3) Joining the incentre to the three vertices splits the triangle into three triangles of heights $r$ on bases $a, b, c$, so $A = \tfrac12 r(a + b + c) = rs$. For $R$, draw the diameter $AD$ from vertex $A$; the angle $\angle ACD$ is in a semicircle, so it is $90^\circ$, and $\angle ADC = \angle ABC$ because both stand on the arc $AC$. So $\sin B = AC/AD = b/(2R)$. Then $A = \tfrac12 ac\sin B = \tfrac12 ac \cdot b/(2R)$, which rearranges to $R = abc/(4A)$. In a right triangle the hypotenuse subtends $90^\circ$ at the circle, so it is a diameter. (4) With $P$ inside, triangles $PAC$ and $PDB$ have equal vertical angles at $P$ and $\angle PAC = \angle PDB$ (both stand on arc $BC$), so they are similar and $PA/PD = PC/PB$, giving $PA \cdot PB = PC \cdot PD$. With $P$ outside, triangles $PAD$ and $PCB$ share the angle at $P$ and $\angle PDA = \angle PBC$ (both stand on arc $AC$), with the same conclusion. Letting $C$ and $D$ merge into the contact point $T$ turns the secant into the tangent and gives $PT^2 = PA \cdot PB$. (5) The two opposite angles stand on arcs that together make the whole circle, so their central angles sum to $360^\circ$ and the inscribed angles, half as large, to $180^\circ$.

**GATE use.** Whether three lengths form a triangle, the area of a scaled figure, the inscribed or circumscribed circle of a triangle, a chord or tangent length from two given segments. The traps are confusing $r$ with $R$, using the full perimeter in $r = A/s$, taking $R$ as half the longest side for a triangle that is not right-angled, and scaling an area by $k$ instead of $k^2$.

**Check.** 6, 8, 10: $A = 24$, $s = 12$, $r = 2$, $R = 480/96 = 5$, half the hypotenuse. 13, 14, 15: $A = 84$, $r = 4$, $R = 2730/336 = 8.125$, which also comes from the circumcentre of $(0, 0), (14, 0), (5, 12)$ at $(7, 33/8)$. A script compared $abc/(4A)$ with the computed circumcentre distance on 1000 random triangles, and checked $PA \cdot PB = PC \cdot PD$ for 1000 random points and line pairs through a unit circle, with agreement to $10^{-14}$. $PA = 4$, $PB = 9$ gives $PT = 6$; chords with $PA = 4$, $PB = 6$, $PC = 3$ give $PD = 8$. Side ratio $2 : 3$ gives area ratio $4 : 9$.

## Distance, section formula and slopes
<!-- topics: ga-quantitative.geometry -->

**Claim.** The distance between $(x_1, y_1)$ and $(x_2, y_2)$ is $\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$. The point $P$ dividing $AB$ internally with $AP : PB = m : n$ is

$$P = \Bigl(\frac{mx_2 + nx_1}{m + n}, \frac{my_2 + ny_1}{m + n}\Bigr),$$

and the midpoint is the case $m = n$. A non-vertical line through $(x_1, y_1)$ and $(x_2, y_2)$ has slope $m = (y_2 - y_1)/(x_2 - x_1)$ and equation $y - y_1 = m(x - x_1)$. Parallel lines have equal slopes, and two non-vertical lines are perpendicular exactly when $m_1m_2 = -1$.

**Derivation.** The segment is the hypotenuse of a right triangle with horizontal leg $\lvert x_2 - x_1 \rvert$ and vertical leg $\lvert y_2 - y_1 \rvert$, so Pythagoras gives the distance. For the section formula, $P = A + \tfrac{m}{m + n}(B - A)$ because $P$ is the fraction $m/(m + n)$ of the way from $A$ to $B$; expanding, $P = \tfrac{n}{m + n}A + \tfrac{m}{m + n}B$, which is the formula coordinate by coordinate. Note the cross-over: $m$ multiplies $B$'s coordinates. Slope is rise over run, which is the same between any two points of a line by similar triangles, so a point $(x, y)$ is on the line exactly when $(y - y_1)/(x - x_1) = m$. A line of slope $m$ has direction $(1, m)$. Two directions are perpendicular when their dot product is 0: $(1, m_1) \cdot (1, m_2) = 1 + m_1m_2 = 0$. Parallel lines have proportional directions, so equal slopes.

**GATE use.** Finding a dividing point, the length of a side, checking whether a triangle is right-angled, the line through two points. The trap is swapping $m$ and $n$ in the section formula.

**Check.** $A(1, 2)$ and $B(7, 8)$ in ratio $1 : 2$ give $P = ((7 + 2)/3, (8 + 4)/3) = (3, 4)$, and $PB = 2\,AP$ was confirmed numerically. $(1, 2)$ to $(4, 6)$ is 5. A line of slope 2 is perpendicular to one of slope $-1/2$.

## Mean, median, variance and the effect of shifting and scaling
<!-- topics: ga-quantitative.statistics -->

**Claim.** For data $x_1, \dots, x_n$ with mean $\bar x$, the population variance is

$$\sigma^2 = \frac1n\sum_{i=1}^n (x_i - \bar x)^2 = \overline{x^2} - \bar x^{\,2},$$

where $\overline{x^2}$ is the mean of the squares; the sample variance divides by $n - 1$ instead. Under $y_i = kx_i + c$, the mean, median and mode become $k(\cdot) + c$, the SD becomes $\lvert k \rvert\sigma$ and the variance $k^2\sigma^2$. Sum = mean $\times$ count. Two groups of sizes $n_1, n_2$ and means $\bar x_1, \bar x_2$ have combined mean $(n_1\bar x_1 + n_2\bar x_2)/(n_1 + n_2)$, and the coefficient of variation is $CV = 100\,\sigma/\bar x$ (for $\bar x > 0$). For a fixed sum, a product of positive numbers is largest when they are as equal as allowed.

**Derivation.** Expand the square: $\sum (x_i - \bar x)^2 = \sum x_i^2 - 2\bar x\sum x_i + n\bar x^2 = \sum x_i^2 - n\bar x^2$, using $\sum x_i = n\bar x$. Dividing by $n$ gives the shortcut. For $y = kx + c$, $\bar y = k\bar x + c$ by linearity of the sum, so $y_i - \bar y = k(x_i - \bar x)$ and every squared deviation is multiplied by $k^2$; $c$ cancels, so shifting leaves the spread alone. The median and mode are positions in the sorted order and the most frequent value, and an increasing map $kx + c$ ($k > 0$) preserves order and equality; for $k < 0$ the order reverses but the middle value still maps to the middle. Sum = mean $\times$ count is the definition of the mean rearranged, which solves every "one value removed" question. The combined total is $n_1\bar x_1 + n_2\bar x_2$ over $n_1 + n_2$ values, so the combined mean is the size-weighted average of the group means; it equals their plain average only when $n_1 = n_2$. The CV divides the SD by the mean, which removes the unit and the scale ($kx$ leaves $\sigma/\bar x$ unchanged for $k > 0$), so it compares the spread of series with different means. For the product: if two of the numbers differ by at least 2, replacing $x, y$ ($x \ge y + 2$) by $x - 1, y + 1$ changes $xy$ to $xy + x - y - 1 > xy$, so a maximiser has all parts within 1 of each other.

**GATE use.** Population or sample SD of a small list; a value removed from an average; the effect of adding 5 to every mark; maximising a product under a fixed sum. The traps are dividing by $n - 1$ when the population SD is asked, reporting the variance as the SD, and letting a shift change the spread.

**Check.** For 2, 4, 4, 4, 5, 5, 7, 9: mean 5, squared deviations sum to 32, $\sigma^2 = 4$, $\sigma = 2$; mean of squares $232/8 = 29$ and $29 - 25 = 4$. The sample SD is $\sqrt{32/7} \approx 2.14$, the median 4.5. Under $3x + 7$ the mean is 22 and the variance 36. Five numbers averaging 20, four left averaging 18: the removed one is $100 - 72 = 28$. Positive integers $P + Q + R = 10$ give at most $3 \cdot 3 \cdot 4 = 36$, by enumeration. 30 students averaging 60 and 20 averaging 70 combine to $(1800 + 1400)/50 = 64$, not 65. SD 10 on mean 50 is $CV = 20\%$, on mean 80 it is $12.5\%$, so the second series is the more consistent.

## Classical probability, the addition rule and the complement
<!-- topics: ga-quantitative.probability -->

**Claim.** In a finite sample space of equally likely outcomes, $P(E) = \lvert E \rvert/\lvert S \rvert$. For any events, $P(A \cup B) = P(A) + P(B) - P(A \cap B)$ and $P(\bar A) = 1 - P(A)$. If $n$ independent trials each succeed with probability $p$, then $P(\text{at least one success}) = 1 - (1 - p)^n$. Mutually exclusive events with positive probabilities are never independent.

**Proof.** Equally likely outcomes each have probability $1/\lvert S \rvert$, and additivity over disjoint outcomes gives the ratio. For the addition rule, split $A \cup B$ into the disjoint pieces $A$ and $B \setminus A$, and $B$ into $A \cap B$ and $B \setminus A$. Then $P(A \cup B) = P(A) + P(B \setminus A) = P(A) + P(B) - P(A \cap B)$: the overlap is counted twice in $P(A) + P(B)$ and must be removed once. $A$ and $\bar A$ are disjoint and cover $S$, so their probabilities sum to 1. "At least one success" is the complement of "all failures", and independence makes the probability of all $n$ failures the product $(1 - p)^n$. If $A, B$ are disjoint, $P(A \cap B) = 0$, but independence would need $P(A)P(B) > 0$. When drawing several items together, both numerator and denominator may be counted as unordered sets, or both as ordered sequences; each unordered draw corresponds to the same number of ordered ones, so the ratio agrees.

**GATE use.** Balls from a bag, dice and coins, survey overlaps (the same addition rule counts sets), "at least one" questions. The traps are mixing ordered and unordered counts, summing the cases for "at least one" instead of using the complement, and applying $(1 - p)^n$ to draws without replacement, which are not independent.

**Check.** Three fair coins, exactly two heads: 3 of 8. Two balls from 3 green and 4 red: $P(\text{both red}) = \binom42/\binom72 = 6/21$, so at least one green is $5/7 \approx 0.714$, the same from unordered pairs and from ordered pairs (30 of 42). With 60 and 50 liking two subjects and 80 in all, $60 + 50 - 80 = 30$ like both. At least one six in four rolls: $1 - (5/6)^4 = 671/1296 \approx 0.518$, matching an enumeration of all 1296 outcomes.

## Conditional probability, Bayes' theorem and expected value
<!-- topics: ga-quantitative.conditional-bayes-expectation -->

**Claim.** For $P(B) > 0$, $P(A \mid B) = P(A \cap B)/P(B)$, so $P(A \cap B) = P(B)P(A \mid B)$. If $B_1, \dots, B_k$ partition the sample space with positive probabilities, then $P(A) = \sum_j P(B_j)P(A \mid B_j)$ and, for $P(A) > 0$,

$$P(B_i \mid A) = \frac{P(B_i)\,P(A \mid B_i)}{\sum_j P(B_j)\,P(A \mid B_j)}.$$

For a discrete random variable $X$, $E[X] = \sum_x x\,P(X = x)$ and $E[aX + b] = aE[X] + b$.

**Derivation.** Conditioning on $B$ keeps only outcomes in $B$ and rescales so that $B$ has probability 1, which gives the ratio; in an equally likely space it is $\lvert A \cap B \rvert/\lvert B \rvert$, counting inside the restricted space. Multiplying through gives the multiplication rule. The events $A \cap B_j$ are disjoint and their union is $A$ because the $B_j$ cover the space, so additivity and the multiplication rule give total probability. Bayes writes $P(B_i \mid A) = P(A \cap B_i)/P(A)$, expands the numerator by the multiplication rule and the denominator by total probability. The prior $P(B_i)$ is updated by how likely the evidence $A$ is under $B_i$, relative to all sources. For expectation, $E[aX + b] = \sum_x (ax + b)P(X = x) = a\sum_x xP(X = x) + b\sum_x P(X = x) = aE[X] + b$, since the probabilities sum to 1. A game's expected gain is $\sum(\text{payoff} \times \text{probability})$ minus the stake, and it is fair when that is 0.

**GATE use.** Which machine made a defective item, a test's positive result, a two-child family given one boy, the expected value of a game. The traps are confusing $P(A \mid B)$ with $P(B \mid A)$, quoting the prior as the answer, and forgetting the stake in a game.

**Check.** Machine A makes 60% at 2% defective and B 40% at 5%: $P(\text{defective}) = 0.012 + 0.020 = 0.032$ and $P(B \mid \text{defective}) = 0.020/0.032 = 5/8$; a simulation of 200,000 bolts gave 0.628. A fair die has $E = 21/6 = 3.5$ and $E[2X + 3] = 10$. Staking 10 to receive 50 on a six gives $50/6 - 10 = -5/3$ per play. Two children with at least one boy: both boys has probability $1/3$. A die known to be even exceeds 3 with probability $2/3$.

## Binomial trials: probability, mean and variance
<!-- topics: ga-quantitative.conditional-bayes-expectation -->

**Claim.** Let $X$ count the successes in $n$ independent trials, each succeeding with the same probability $p$. Then $P(X = k) = \binom nk p^k(1 - p)^{n - k}$ for $k = 0, \dots, n$, $E[X] = np$ and $\operatorname{Var}(X) = np(1 - p)$, where $\operatorname{Var}(X) = E[X^2] - (E[X])^2$. The first success falls on trial $k$ with probability $(1 - p)^{k - 1}p$.

**Proof.** A particular sequence with $k$ successes and $n - k$ failures has probability $p^k(1 - p)^{n - k}$, because the trials are independent and the probabilities multiply. Such sequences are fixed by choosing which $k$ of the $n$ positions hold the successes, $\binom nk$ ways, and distinct sequences are disjoint events, so their probabilities add. For the moments write $X = I_1 + \cdots + I_n$, where $I_j$ is 1 if trial $j$ succeeds and 0 otherwise. Each $I_j$ has $E[I_j] = p$, so linearity of expectation gives $E[X] = np$. Since $I_j^2 = I_j$, $\operatorname{Var}(I_j) = p - p^2 = p(1 - p)$, and the variance of a sum of independent variables is the sum of the variances, giving $np(1 - p)$. The shortcut $\operatorname{Var}(X) = E[X^2] - (E[X])^2$ follows by expanding $E[(X - \mu)^2] = E[X^2] - 2\mu E[X] + \mu^2$ with $\mu = E[X]$. The first success on trial $k$ needs $k - 1$ failures followed by one success, again a product by independence.

**GATE use.** Exactly $k$ heads in $n$ tosses, exactly two defectives in a sample drawn with replacement, the expected number of successes, MSQs mixing $P(X = k)$, $E[X]$ and $\operatorname{Var}(X)$. The traps are leaving out the $\binom nk$ factor, using the binomial for draws without replacement, and quoting the mean as the variance.

**Check.** Four fair tosses: $P(X = 2) = 6/16 = 3/8$, $E[X] = 2$, $\operatorname{Var}(X) = 1$ and $P(X \ge 1) = 15/16$, all confirmed by listing the 16 outcomes. Six tosses, exactly four heads: $15/64 \approx 0.234$. For $n = 7$, $p = 0.3$ a script summed the distribution to get mean 2.1 and variance 1.47, matching $np$ and $np(1 - p)$. The first six on the third roll has probability $25/216 \approx 0.116$.
