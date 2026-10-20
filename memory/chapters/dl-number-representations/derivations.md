# Number representations and computer arithmetic: derivations

## Positional value, digit counts and the conversion algorithms
<!-- topics: dl-number-representations.positional-systems, dl-number-representations.base-conversion -->

**Claim.** Fix a base $r \ge 2$. A numeral $d_k \dots d_1 d_0 . d_{-1} \dots d_{-m}$ with every digit in $\{0, \dots, r-1\}$ has value $N = \sum_{i=-m}^{k} d_i r^i$.

1. Every integer $N \ge 0$ has exactly one base-$r$ numeral without leading zeros, and for $N \ge 1$ it has $\lfloor \log_r N \rfloor + 1$ digits.
2. Repeated division by $r$ produces the integer digits, least significant first. Repeated multiplication of a fraction $0 \le x < 1$ by $r$ produces its fraction digits, most significant first.
3. A fraction $p/q$ in lowest terms has a finite base-$r$ expansion exactly when every prime factor of $q$ divides $r$. In binary this means $q$ is a power of 2.
4. When $r = 2^k$, each base-$r$ digit is a group of $k$ bits, with the groups counted outward from the radix point.

**Proof.** (1, 2) Write $N = d_0 + r \sum_{i \ge 1} d_i r^{i-1}$. Since $0 \le d_0 \le r - 1$, this is division with remainder: $d_0 = N \bmod r$, and the quotient $\lfloor N / r \rfloor$ has digits $d_k \dots d_1$. Division with remainder is unique, so repeating the step on the quotient fixes every digit, which proves uniqueness and the algorithm together. A $k$-digit numeral with leading digit at least 1 lies between $10\dots0_r = r^{k-1}$ and the all-$(r-1)$ numeral $\sum_{i=0}^{k-1} (r-1) r^i = r^k - 1$ (the sum telescopes). So $r^{k-1} \le N < r^k$, that is $k - 1 \le \log_r N < k$, and $k = \lfloor \log_r N \rfloor + 1$.

For a fraction $x = \sum_{i \ge 1} d_{-i} r^{-i}$, multiplying by $r$ gives $rx = d_{-1} + \sum_{i \ge 2} d_{-i} r^{-(i-1)}$. The tail is again a fraction in $[0, 1)$, so $d_{-1} = \lfloor rx \rfloor$, and the tail is the input to the next step. (The tail equals 1 only for an expansion ending in $r - 1$ repeated forever, which the algorithm never produces.)

(3) The algorithm stops after $j$ steps exactly when $r^j p / q$ is an integer. Since $\gcd(p, q) = 1$, that happens exactly when $q \mid r^j$. Some power of $r$ is a multiple of $q$ exactly when every prime factor of $q$ is a prime factor of $r$.

(4) Split the bit index as $i = kj + t$ with $0 \le t \le k - 1$:

$$\sum_i b_i 2^i = \sum_j \Bigl(\sum_{t=0}^{k-1} b_{kj+t}\, 2^t\Bigr) (2^k)^j .$$

Each inner sum lies in $0, \dots, 2^k - 1$, so it is one base-$2^k$ digit. The groups are aligned at $i = 0$, which is the radix point, and the outer ends are padded with zeros.

**GATE use.** Common forms are converting octal to hex through binary, counting the 1 bits of a value written as a polynomial in 16, and asking how many bits a number needs. The traps are grouping bits from the left end instead of the radix point, being off by one at exact powers of the base, and assuming a short decimal fraction is short in binary.

**Check.** 1023 needs 10 bits and 1024 needs 11. A script confirmed $r^{k-1} \le N < r^k$ for every $N$ below 5000 in every base from 2 to 16. Repeated doubling of 0.1 gives $0.000110011001\dots_2$, which never terminates, and the termination test agreed with the prime-factor rule for every $q < 200$ in bases 2, 3, 6, 10, 12 and 16. The value $3 \cdot 16^3 + 15 \cdot 16^2 + 5 \cdot 16 + 3$ is $\mathrm{3F53}_{16}$, with $2 + 4 + 2 + 2 = 10$ one bits, and it is $37523_8$. Also $(1217)_8 = 001\,010\,001\,111_2 = (28\mathrm{F})_{16} = 655$.

## Equations with an unknown radix
<!-- topics: dl-number-representations.unknown-radix, dl-number-representations.positional-systems -->

**Claim.** A numeral whose largest digit is $d$ is valid only in bases $r \ge d + 1$. An equation between numerals in an unknown base $r$ becomes a polynomial equation $P(r) = 0$ with integer coefficients, and its answers are the integer roots with $r \ge d + 1$. If $P(0) \ne 0$, every integer root divides the constant term $P(0)$. A numeral ends in the digit 0 exactly when $r$ divides its value. With two unknown bases, the answer is the number of integer pairs that satisfy the equation and all the digit constraints.

**Proof.** A digit must lie in $\{0, \dots, r-1\}$, so a digit $d$ forces $r - 1 \ge d$. Expanding each numeral with $N = \sum d_i r^i$ makes each side a rational function of $r$. Multiplying through by the denominators, which are powers of $r$ and values of numerals and so are positive for $r \ge 2$, leaves an equivalent polynomial equation $\sum_i a_i r^i = 0$ with integer $a_i$. If an integer $r$ satisfies it, then $a_0 = -r \sum_{i \ge 1} a_i r^{i-1}$, so $r \mid a_0$. This shortens the search when the polynomial does not factor on sight. The last digit is $d_0 = N \bmod r$ (previous section), so $d_0 = 0$ exactly when $r \mid N$.

**GATE use.** The 1-mark NAT "$(312)_r / (20)_r = (13.1)_r$, find $r$" and the counting variant "how many pairs $(x, y)$ satisfy $(123)_5 = (x8)_y$" both come from this. The trap is accepting a root that is too small for the digits, or forgetting that the second unknown's digit constraint (here $y \ge 9$ because of the digit 8) cuts the count.

**Check.** For $(312)_r / (20)_r = (13.1)_r$ the digit 3 forces $r \ge 4$. The left side is $(3r^2 + r + 2)/(2r)$ and the right side is $r + 3 + 1/r$. Multiplying by $2r$ gives $3r^2 + r + 2 = 2r^2 + 6r + 2$, so $r^2 - 5r = 0$ and $r = 5$. In base 5 the numerals are $82 / 10 = 8.2 = 41/5$. A scan of $r$ from 4 to 49 found only 5. For $(123)_5 = 38 = xy + 8$ we need $xy = 30$ with $y \ge 9$ and $1 \le x \le y - 1$, which leaves $(1, 30)$, $(2, 15)$ and $(3, 10)$: three pairs. For $(43)_x = (y3)_8$, $4x + 3 = 8y + 3$ gives $x = 2y$, and $x \ge 5$ with $1 \le y \le 7$ leaves five pairs, $y = 3, \dots, 7$. Both counts were confirmed by search.

## Sign-magnitude, 1's complement and excess-K: values, ranges and counts
<!-- topics: dl-number-representations.signed-representations -->

**Claim.** Take $n$-bit words with MSB $b_{n-1}$, and let $L = \sum_{i=0}^{n-2} b_i 2^i$ be the value of the low $n - 1$ bits.

1. Sign-magnitude: $x = (-1)^{b_{n-1}} L$. 1's complement: $x = -b_{n-1}(2^{n-1} - 1) + L$, and negation inverts every bit. In both, the range is $-(2^{n-1} - 1) \le x \le 2^{n-1} - 1$ and zero has two patterns, so the $2^n$ patterns give $2^n - 1$ distinct values.
2. 1's complement addition is addition modulo $2^n - 1$. A carry out of the MSB must be added back into the LSB (the end-around carry).
3. Excess-$K$ stores $s = x + K$ as an $n$-bit unsigned number. The range is $-K \le x \le 2^n - 1 - K$, zero has one pattern, and comparing stored codes as unsigned integers orders the values correctly.

**Proof.** (1) In sign-magnitude, $L$ runs over $0, \dots, 2^{n-1} - 1$ for each sign, and $L = 0$ gives both $+0$ and $-0$. That is $2 \cdot 2^{n-1} - 1 = 2^n - 1$ values. In 1's complement, inverting an $n$-bit pattern $u$ gives $2^n - 1 - u$, so a negative number is stored as $u = 2^n - 1 - \lvert x \rvert$. A pattern with MSB 1 is $u = 2^{n-1} + L$, so its value is $-(2^n - 1 - u) = u - (2^n - 1) = L - (2^{n-1} - 1)$, which is the formula. For MSB 1 the values run from $-(2^{n-1} - 1)$ at $L = 0$ up to $0$ at $L = 2^{n-1} - 1$ (the all-ones pattern, $-0$). For MSB 0 they run from 0 to $2^{n-1} - 1$.

(2) Every 1's complement pattern $u$ satisfies $u \equiv x \pmod{2^n - 1}$, because a negative number is stored as $(2^n - 1) - \lvert x \rvert$. So the sum of two patterns has the right residue. When the unsigned sum reaches $2^n$, the adder drops a carry worth $2^n$. Since $2^n \equiv 1 \pmod{2^n - 1}$, adding 1 back restores the residue.

(3) The stored code lies in $0, \dots, 2^n - 1$, so $x = s - K$ lies in $[-K, 2^n - 1 - K]$. The map $x \mapsto x + K$ is a strictly increasing bijection, so it is one-to-one (a single zero, at code $K$) and preserves order. This is why IEEE 754 biases its exponent instead of using two's complement (section on the IEEE format).

**GATE use.** Questions ask for the range, the number of distinct values, or the value of a pattern under a stated representation, such as "$X - Y$ for 16-bit two's complement against sign-magnitude". The traps are giving $2^n$ as the count for sign-magnitude or 1's complement, forgetting the end-around carry, and using the IEEE bias $2^{k-1} - 1$ when a question defines excess-$2^{n-1}$.

**Check.** A script enumerated all patterns for $n = 3, 4, 8$. For $n = 4$, sign-magnitude and 1's complement give 15 values from $-7$ to 7 and two's complement gives 16 values from $-8$ to 7. For $n = 8$ the counts are 255, 255 and 256. So for 16 bits $X - Y = 2^{16} - (2^{16} - 1) = 1$. The script also confirmed the 1's complement value formula and that inversion negates, for every pattern. 1's complement $-2 + (-3)$ in 4 bits is $1101 + 1100 = 1\,1001$, and the end-around carry gives $1001 + 1 = 1010 = -5$. 8-bit excess-127 covers $-127$ to 128, and unsigned order of the codes matched value order on every pair of codes for $n = 3, 4, 8$.

## Two's complement: value, range, negation and sign extension
<!-- topics: dl-number-representations.twos-complement -->

**Claim.** An $n$-bit pattern with unsigned value $u$ represents the unique $x$ with $x \equiv u \pmod{2^n}$ and $-2^{n-1} \le x \le 2^{n-1} - 1$. Equivalently,

$$x = -b_{n-1} 2^{n-1} + \sum_{i=0}^{n-2} b_i 2^i, \qquad x = u - 2^n \text{ when } b_{n-1} = 1.$$

1. All $2^n$ patterns give distinct values, and zero has one pattern.
2. Inverting every bit and adding 1 negates $x$. The one exception is $-2^{n-1}$, which maps to itself. The same result comes from copying the bits up to and including the lowest 1 and inverting the bits above it.
3. Copying the MSB into new high bits (sign extension) keeps the value.
4. An $n$-bit unsigned adder that drops its carry out computes the correct two's complement sum whenever the true sum is in range.

**Proof.** Write $u = b_{n-1} 2^{n-1} + L$ with $0 \le L \le 2^{n-1} - 1$. If $b_{n-1} = 1$ then $u - 2^n = -2^{n-1} + L$, so both forms of the formula agree. The values with MSB 0 fill $[0, 2^{n-1} - 1]$ and those with MSB 1 fill $[-2^{n-1}, -1]$. That is $2^n$ consecutive integers, one for each residue modulo $2^n$, which proves the congruence description and part 1.

(2) Inverting gives $2^n - 1 - u$, and adding 1 gives $2^n - u \equiv -u \equiv -x \pmod{2^n}$. The result is the pattern of $-x$ whenever $-x$ is in range, which fails only for $x = -2^{n-1}$. In that case $2^n - 2^{n-1} = 2^{n-1}$ is the pattern $100\dots0$ again. For the copy rule, let the lowest 1 be bit $j$, so $u = h \cdot 2^{j+1} + 2^j$, where $h$ is the value of the bits above $j$. Then

$$2^n - u = \bigl(2^{n-j-1} - 1 - h\bigr) 2^{j+1} + 2^j .$$

The bits above $j$ are those of $h$ inverted, bit $j$ is 1 and the bits below it are 0.

(3) Extending from $n$ to $n + 1$ bits with $b_{n-1} = 1$ adds a bit of weight $-2^n$ and turns the old MSB's weight from $-2^{n-1}$ into $+2^{n-1}$. The net change is $-2^n + 2^{n-1} + 2^{n-1} = 0$. With $b_{n-1} = 0$ nothing changes. Induction on the number of new bits completes the proof.

(4) The adder outputs $(u_a + u_b) \bmod 2^n$, which is congruent to $x_a + x_b$. By part 1 it is that sum's pattern whenever the sum is in range.

**GATE use.** Typical questions ask for the pattern of $-13$ in 5 bits, the value of a hex pattern such as 0xEE, the 8-bit minimum, or a sign-extended value. The traps are stopping after the inversion (the 1's complement, off by one), giving $-127$ as the 8-bit minimum, padding a negative number with zeros, and forgetting that negating $-2^{n-1}$ overflows.

**Check.** $13 = 01101$, inverted $10010$, plus 1 gives $10011 = -16 + 2 + 1 = -13$. The pattern $11000000$ is $-64$, and its two's complement $01000000$ is $+64$, as the chapter's erratum says. For $25 = 00011001$ the lowest 1 is bit 0, so copying it and inverting the rest gives $11100111 = -25$. 0xEE is $238 - 256 = -18$, $1011$ sign-extends to $11111011 = -5$, and $1111\,1111\,1111\,0101 = -11$. For $n = 3, 4, 8$ a script checked the value formula, invert-plus-one negation (with $100\dots0$ mapping to itself) and sign extension to $2n$ bits on every pattern.

## Carry, signed overflow and subtraction
<!-- topics: dl-number-representations.add-sub-overflow, dl-number-representations.twos-complement -->

**Claim.** An $n$-bit adder adds patterns $A$ and $B$ with carry-in $c_0$ and result $S$. Let $c_i$ be the carry into bit $i$, so $c_n$ is the carry out of the MSB, and let $a$, $b$, $s$ be the two's complement values. Then

$$a + b + c_0 = s + (c_{n-1} - c_n)\, 2^n .$$

1. Signed overflow, meaning the true sum is outside $[-2^{n-1}, 2^{n-1} - 1]$, happens exactly when $V = c_{n-1} \oplus c_n = 1$. Equivalently $V = a_{n-1} b_{n-1} \overline{s_{n-1}} + \overline{a_{n-1}}\,\overline{b_{n-1}}\, s_{n-1}$, so operands of opposite signs never overflow.
2. Unsigned overflow happens exactly when $c_n = 1$. This is independent of $V$.
3. $A - B$ is computed as $A + \overline{B} + 1$, with the 1 entering as $c_0$. $V$ is read the same way on the operands $A$ and $\overline{B}$, and $c_n = 1$ exactly when $A \ge B$ as unsigned numbers (no borrow).
4. A ripple-carry adder needs $O(n)$ gate delays, because $c_{i+1} = a_i b_i + (a_i \oplus b_i) c_i$ waits for $c_i$. Carry lookahead computes every carry in $O(\log n)$ levels.

**Proof.** Let $L_a$, $L_b$, $L_s$ be the values of the low $n - 1$ bits. The low stages give $L_a + L_b + c_0 = L_s + c_{n-1} 2^{n-1}$. The MSB stage is a full adder: $a_{n-1} + b_{n-1} + c_{n-1} = s_{n-1} + 2 c_n$. Using $a = -a_{n-1} 2^{n-1} + L_a$ and the same for $b$,

$$a + b + c_0 = -(a_{n-1} + b_{n-1}) 2^{n-1} + L_s + c_{n-1} 2^{n-1} = -(s_{n-1} + 2c_n - c_{n-1}) 2^{n-1} + L_s + c_{n-1} 2^{n-1},$$

which rearranges to $\bigl(-s_{n-1} 2^{n-1} + L_s\bigr) + (c_{n-1} - c_n) 2^n = s + (c_{n-1} - c_n) 2^n$.

(1) If $c_{n-1} = c_n$, the true sum is $s$, which is in range. Otherwise it is $s \pm 2^n$. Since $s \in [-2^{n-1}, 2^{n-1} - 1]$, $s + 2^n \ge 2^{n-1}$ and $s - 2^n \le -2^{n-1} - 1$, so the true sum is out of range. For the sign form, split on the operand signs. If both are 0, then $c_n = 0$ and $s_{n-1} = c_{n-1}$, so $V = s_{n-1}$. If both are 1, then $c_n = 1$ and $s_{n-1} = c_{n-1}$, so $V = \overline{s_{n-1}}$. If they differ, the full adder gives $c_n = c_{n-1}$, so $V = 0$.

(2) As unsigned numbers $u_a + u_b + c_0 = u_s + c_n 2^n$, and $u_s \le 2^n - 1$, so the sum fits in $n$ bits exactly when $c_n = 0$.

(3) $\overline{B}$ has unsigned value $2^n - 1 - u_b$ and signed value $-b - 1$. So $A + \overline{B} + 1$ has signed value $a - b$ and unsigned value $u_a - u_b + 2^n$. The adder is now adding $A$ and $\overline{B}$, so part 1 applies to them. The unsigned value reaches $2^n$, giving $c_n = 1$, exactly when $u_a \ge u_b$.

(4) Stage $i$'s carry depends on stage $i - 1$'s, so a chain of $n$ carries costs a constant number of gate delays per stage. Lookahead writes $c_{i+1} = g_i + p_i c_i$ with $g_i = a_i b_i$ and $p_i = a_i \oplus b_i$, and combines the $(g, p)$ pairs associatively in a tree of depth $\lceil \log_2 n \rceil$.

**GATE use.** Questions ask whether a hex sum overflows (MSQ), or for the flag values after an 8-bit addition. The trap is reading the carry out as signed overflow: 0x40 + 0xC0 carries out with the correct result 0, while 0x7F + 0x01 overflows without a carry. Some machines set the carry flag after a subtraction to mean "no borrow" and others to mean "borrow", so read the question's convention.

**Check.** $0110\,1101 + 0101\,0010 = 1011\,1111$ with $C = 0$ and $V = 1$ (109 + 82 = 191). 0x80 + 0xFF gives 0x7F with $C = 1$ and $V = 1$. 0x40 + 0xC0 gives 0x00 with $C = 1$ and $V = 0$. 0xF0 + 0x20 gives 0x10 with $C = 1$ and $V = 0$. For all 65,536 pairs of 8-bit operands a script confirmed that the carry XOR test, the sign-bit formula and the range test agree, that opposite signs never overflow, that $c_n$ is unsigned overflow, and that for $A + \overline{B} + 1$ the same $V$ rule detects overflow of $a - b$ and $c_n = 1$ exactly when $A \ge B$.

## Booth recoding: correctness and the operation count
<!-- topics: dl-number-representations.multiplication-booth -->

**Claim.** Let the multiplier $Q = q_{n-1} \dots q_0$ be an $n$-bit two's complement number, and set $q_{-1} = 0$. Radix-2 Booth recoding defines $r_i = q_{i-1} - q_i \in \{-1, 0, +1\}$ for $i = 0, \dots, n-1$. That is, the pair $(q_i, q_{i-1}) = 10$ gives $-1$, $01$ gives $+1$, and $00$ and $11$ give 0.

1. $\sum_{i=0}^{n-1} r_i 2^i$ equals the signed value of $Q$, so $M \cdot Q = \sum_i r_i \, (M \cdot 2^i)$. The multiplication adds or subtracts the shifted multiplicand at each nonzero $r_i$.
2. The number of add or subtract operations is the number of positions where $q_i \ne q_{i-1}$. The nonzero digits alternate in sign. A run of 1s from bit $i$ to bit $j \le n - 2$ costs two operations, since it is $2^{j+1} - 2^i$. A run that reaches the MSB ($j = n - 1$) costs one, the $-1$ at bit $i$.
3. The worst case is $n$ operations, for $0101\dots01$. Unsigned shift-and-add needs one addition per 1 bit, at most $n$ as well.
4. With arithmetic right shifts of $A{:}Q{:}q_{-1}$, the register algorithm produces the $2n$-bit product. Its accumulator needs $n + 1$ bits for the multiplicand $M = -2^{n-1}$, because subtracting it adds $2^{n-1}$, which does not fit in $n$ signed bits.

**Proof.** (1) The sum telescopes after a shift of index:

$$\sum_{i=0}^{n-1} (q_{i-1} - q_i) 2^i = \sum_{j=0}^{n-2} q_j 2^{j+1} - \sum_{i=0}^{n-1} q_i 2^i = \sum_{j=0}^{n-2} q_j 2^j - q_{n-1} 2^{n-1},$$

using $q_{-1} = 0$. The right side is the two's complement value of $Q$. No sign correction is needed, because the MSB's negative weight comes out of the telescoping.

(2) $r_i \ne 0$ exactly when $q_i \ne q_{i-1}$. Reading upward from bit 0, the transitions alternate between entering a run of 1s ($q_i = 1$, $q_{i-1} = 0$, digit $-1$) and leaving it (digit $+1$). A run from $i$ to $j \le n - 2$ has digit $-1$ at $i$ and $+1$ at $j + 1$. A run with $j = n - 1$ has no position $j + 1$, so it gets only the $-1$ at $i$: its bits are worth $\sum_{t=i}^{n-2} 2^t - 2^{n-1} = -2^i$, because the MSB carries negative weight.

(3) There are $n$ pairs, so at most $n$ operations. With $q_{-1} = 0$, every pair of $0101\dots01$ differs.

(4) After step $i$ the accumulator holds the partial sum $\sum_{t \le i} r_t M 2^t$, scaled by $2^{-(i+1)}$ and spread across $A{:}Q$. The arithmetic shift halves it while keeping its sign. If $M = -2^{n-1}$ and $r_i = -1$, the step adds $2^{n-1}$, which is out of range for $n$ bits. A simulation found that the $n$-bit version fails only for this multiplicand.

**GATE use.** Questions give a multiplier and ask for its recoding, or for the number of additions and subtractions. The trap is reading the pair as $(q_{i-1}, q_i)$, which flips every sign and recodes $-Q$. In MSQs, Booth helps on long runs of 1s and is worst on alternating bits, where it can lose to shift-and-add.

**Check.** $0011$ recodes to $0\ {+1}\ 0\ {-1}$, value $4 - 1 = 3$. This matches the chapter's erratum, and the reversed reading $0\ {-1}\ 0\ {+1}$ is $-3$. $0111\,0110$ recodes to ${+1}\ 0\ 0\ {-1}\ {+1}\ 0\ {-1}\ 0$: four operations, value $128 - 16 + 8 - 2 = 118$, against five additions for shift-and-add. $0101\,0101$ needs 8 operations, $0011\,1100$ needs 2 and $1111\,1111$ needs 1. $7 \times (-3)$ in 4 bits gives $-21$ with 3 operations. A script checked the telescoping identity, the transition count and the alternating signs on every multiplier of 4, 6 and 8 bits. It also ran the register algorithm on every pair of 4-, 5- and 6-bit operands: correct throughout with an $(n+1)$-bit accumulator, and wrong with an $n$-bit one only when $M = -2^{n-1}$.

## Restoring and non-restoring division
<!-- topics: dl-number-representations.division -->

**Claim.** Divide an $n$-bit unsigned dividend $D$ by a divisor $V \ge 1$. Let $D_k = \lfloor D / 2^{n-k} \rfloor$ be the top $k$ bits of $D$.

1. Restoring division keeps the invariant that after step $k$ the quotient register's low $k$ bits hold $Q_k = \lfloor D_k / V \rfloor$ and the accumulator holds $A = D_k - V Q_k$, with $0 \le A < V$. After $n$ steps $Q = \lfloor D / V \rfloor$ and $A = D \bmod V$. Each step does one subtraction, and the number of restores equals the number of 0 bits in the $n$-bit quotient. The accumulator needs $n + 1$ bits.
2. Non-restoring division produces the same quotient bits with one addition or subtraction per step: subtract when $A \ge 0$, add when $A < 0$. A negative final $A$ needs one correction, $A + V$.

**Proof.** (1) The invariant holds before the first step, with $D_0 = 0$, $Q_0 = 0$ and $A = 0$. A step shifts the next dividend bit $d$ into $A$, giving $2A + d$, and $D_{k+1} = 2 D_k + d$, so $2A + d = D_{k+1} - V \cdot 2Q_k$. Because $A \le V - 1$, $0 \le 2A + d \le 2V - 1$. So the next quotient digit $\lfloor (2A + d)/V \rfloor$ is 0 or 1, and subtracting $V$ once decides it. If $2A + d - V \ge 0$ the bit is 1 and the new remainder is $D_{k+1} - V(2Q_k + 1)$. Otherwise adding $V$ back (the restore) gives bit 0 and remainder $D_{k+1} - V \cdot 2Q_k$. In both cases the remainder is in $[0, V)$ and $Q_{k+1} = 2Q_k + q$, which is the invariant for $k + 1$. At $k = n$, $D_n = D$. A restore happens exactly at a 0 quotient bit. The intermediate $2A + d$ can reach $2V - 1$, so an $n$-bit divisor needs an $(n + 1)$-bit accumulator.

(2) Non-restoring division keeps $A = R_k$ (the restoring remainder) when $q_k = 1$, and $A = R_k - V$ when $q_k = 0$, that is, it skips the restore. The next restoring step computes $2R_k + d - V$. If $A = R_k \ge 0$, non-restoring computes $2A + d - V$, the same value. If $A = R_k - V < 0$, it computes $2A + d + V = 2R_k + d - V$, the same value again. The sign of the result decides the quotient bit, as before. After the last step $A = R_n$ or $R_n - V$, and the second case, a negative $A$, is fixed by adding $V$.

**GATE use.** NAT questions ask for the number of restores, the quotient and remainder after a 4-bit division, or the register contents after step $k$. The traps are counting the restores as the number of 1 bits, and forgetting the final correction in non-restoring division.

**Check.** $11 \div 3$ in 4 bits: $A$ takes the values 1, 2, 5, 5 before subtracting, so the quotient bits are 0, 0, 1, 1. The quotient is $0011 = 3$, the remainder is 2, and there are 2 restores, as the chapter's question says. $7 \div 3$ gives quotient $0010$, remainder 1 and 3 restores. Non-restoring $11 \div 3$ performs $-, +, +, -$ with $A = -2, -1, 2, 2$ and needs no correction. $7 \div 3$ needs one. For every dividend and nonzero divisor of 4 and 6 bits, a script confirmed both algorithms against integer division and confirmed restores = number of 0 quotient bits.

## Fixed-point numbers: range, resolution and rescaling
<!-- topics: dl-number-representations.fixed-point -->

**Claim.** Take an $n$-bit two's complement word with $f$ fraction bits. A pattern whose signed integer value is $I$ represents $x = I / 2^f$, so

$$-2^{\,n-f-1} \le x \le 2^{\,n-f-1} - 2^{-f}.$$

Consecutive values differ by $2^{-f}$ everywhere in the range. Rounding to nearest has absolute error at most $2^{-f-1}$, but the relative error is unbounded near 0. Two numbers with the same $f$ add as integers. A product has $2f$ fraction bits and must be shifted right by $f$.

**Derivation.** $I$ ranges over $[-2^{n-1}, 2^{n-1} - 1]$, and dividing by $2^f$ gives the range. Consecutive integers differ by 1, so consecutive values differ by $2^{-f}$, and the nearest one to any $x$ in range is within half that step. Near zero a fixed absolute error is a large fraction of $\lvert x \rvert$. For example $x = 2^{-f-1}$ rounds to 0 or $2^{-f}$, a relative error of 100%. Then $I/2^f + J/2^f = (I + J)/2^f$, so addition is integer addition, with the overflow rule of the carry section. $(I/2^f)(J/2^f) = IJ / 2^{2f}$, so the $2n$-bit integer product has $2f$ fraction bits, and an arithmetic shift right by $f$ returns it to the format, dropping or rounding the low bits. Floating point is the opposite trade: constant relative spacing and a very wide range (range section below).

**GATE use.** Questions ask for the value of a pattern, the range or resolution of a stated format, or for true/false statements comparing fixed and floating point. The traps are reading the pattern as unsigned, sign-magnitude or 1's complement, and taking the maximum as $2^{n-f-1}$ instead of $2^{n-f-1} - 2^{-f}$.

**Check.** With 8 bits and 4 fraction bits, an enumeration of all 256 patterns gave the range $-8$ to $7.9375$ in steps of $0.0625$. The pattern $1010\,1100$ is $-84$, so it represents $-84/16 = -5.25$. The unsigned reading gives $10.75$, sign-magnitude gives $-2.75$ and 1's complement gives $-5.1875$. A 16-bit word with 8 fraction bits has resolution $2^{-8}$. Multiplying $1.5$ by $2.25$ with 4 fraction bits gives $24 \times 36 = 864$, and $864 \gg 4 = 54$, which is $54/16 = 3.375$, the exact product.

## IEEE 754 format: bias, hidden bit, ordering and conversion
<!-- topics: dl-number-representations.ieee754-format, dl-number-representations.ieee754-conversion -->

**Claim.** A binary format has a sign bit $S$, a $k$-bit exponent field $E$ and an $f$-bit fraction field $F$, with $(k, f) = (8, 23)$ for single precision and $(11, 52)$ for double. For $1 \le E \le 2^k - 2$, the value is

$$x = (-1)^S \times \Bigl(1 + \frac{F}{2^f}\Bigr) \times 2^{E - \text{bias}}, \qquad \text{bias} = 2^{k-1} - 1 .$$

1. Every nonzero real $x$ has a unique normalized form $1.m \times 2^e$, with $e = \lfloor \log_2 \lvert x \rvert \rfloor$. The leading 1 is never stored, so the precision is $p = f + 1$ bits: 24 in single, 53 in double.
2. The true exponents of normal numbers run from $1 - \text{bias}$ to $2^k - 2 - \text{bias}$: $-126$ to $127$ in single and $-1022$ to $1023$ in double. The bias keeps $1/x_{\min}^{\text{norm}} = 2^{126}$ inside the range.
3. For non-negative floats, value order equals the order of the bit patterns read as unsigned integers.
4. Encoding: $E = e + \text{bias}$ and $F$ = the bits of $m$, padded or rounded to $f$ bits. Decoding reverses this after checking $E$ for 0 and $2^k - 1$.

**Proof.** (1) $2^e \le \lvert x \rvert < 2^{e+1}$ holds for exactly one integer $e$, and then $\lvert x \rvert / 2^e \in [1, 2)$ has a binary expansion beginning $1.$, so storing the 1 would waste a bit. (2) The codes $E = 0$ and $E = 2^k - 1$ are reserved (next section). Subtracting the bias from $1$ and $2^k - 2$ gives the stated limits, so $e_{\max} = 2^{k-1} - 1$ and $e_{\min} = 1 - e_{\max}$. The smallest normal's reciprocal $2^{e_{\max} - 1}$ is therefore below the largest finite number.

(3) Take two non-negative patterns. If their $E$ fields differ, the one with the larger $E$ has value at least $2^{E - \text{bias}}$, which exceeds every value in lower binades, since those are below $2^{(E-1) - \text{bias} + 1}$. Denormals, with $E = 0$, lie below $2^{1 - \text{bias}}$. If the $E$ fields are equal, the value increases with $F$. So value order is lexicographic order on $(E, F)$, which is the order of the integer $E \cdot 2^f + F$, the pattern without its sign. This holds because the exponent is biased: an exponent in two's complement would put the negative exponents above the positive ones.

(4) This follows from the formula. The exponent field straddles the first three hex digits, so a pattern must be expanded to binary before it is split.

**GATE use.** This is the most common question in the chapter: encode a decimal in single precision, or decode a hex pattern. The traps are storing the hidden 1, subtracting the bias when encoding (or using 128), and splitting the hex digits instead of the bits.

**Check.** $-12.5 = -1100.1_2 = -1.1001 \times 2^3$ gives $E = 130 = 10000010$, so the word is $1\ 10000010\ 1001\,0\dots0$ = 0xC1480000. $-6.75 = -1.1011 \times 2^2$ gives 0xC0D80000. 0x41C80000 is 25, 0x3F800000 is 1, and 0x3E6D0000 has $E = 124$ and significand $1.1101101_2 = 1.8515625$, which gives $0.2314453125$. 0.1 is $1.\overline{1001}_2 \times 2^{-4}$. The bits after the 23rd begin $11\dots$, which is above half an ulp, so the fraction rounds up and 0.1 is stored as 0x3DCCCCCD $= 13421773/2^{27}$. These encodings matched Python's struct packing. The exact decoding formula matched the hardware value on 200,000 random patterns, and integer order matched value order along a sweep of the positive patterns.

## IEEE 754 zeros, denormals, infinities and NaN
<!-- topics: dl-number-representations.ieee754-special, dl-number-representations.ieee754-format -->

**Claim.** In single precision ($k = 8$, $f = 23$, bias 127):

- $E = 0$, $F = 0$ is $\pm 0$. The two zeros compare equal.
- $E = 0$, $F \ne 0$ is a denormal, $(-1)^S \times 0.F \times 2^{1 - \text{bias}} = (-1)^S F \cdot 2^{-149}$.
- $E = 255$, $F = 0$ is $\pm\infty$.
- $E = 255$, $F \ne 0$ is NaN, which compares unequal to everything including itself. There are $2(2^{23} - 1) = 16{,}777{,}214$ NaN patterns.

With the exponent $1 - \text{bias}$, the denormals continue the spacing of the lowest normal binade, so there is no gap between 0 and $2^{-126}$. In particular, for finite floats $x \ne y$ the rounded difference $x - y$ is never 0 (gradual underflow).

**Proof.** The lowest normal binade, $E = 1$, holds $(1 + F/2^{23}) 2^{-126} = (2^{23} + F) 2^{-149}$: the integers $2^{23}, \dots, 2^{24} - 1$ times $2^{-149}$. Denormals with exponent $1 - \text{bias} = -126$ give $0.F \times 2^{-126} = F \cdot 2^{-149}$ for $F = 1, \dots, 2^{23} - 1$. Together with zero they are the integers $0, \dots, 2^{23} - 1$ times $2^{-149}$. So the two sets join with the same step, and the largest denormal plus $2^{-149}$ is exactly $2^{-126}$. With the exponent $0 - \text{bias}$ the denormals would be $F \cdot 2^{-150}$, all below $2^{-127}$, leaving $[2^{-127}, 2^{-126})$ empty.

Every finite float is an integer multiple of $2^{-149}$: the denormals by the formula, and the normals because they are $(2^{23} + F) 2^{E - 150}$ with $E \ge 1$. So for $x \ne y$, $x - y$ is a nonzero multiple of $2^{-149}$, and $\lvert x - y \rvert \ge 2^{-149}$, the smallest denormal. Rounding to nearest keeps any magnitude at least the smallest positive float nonzero. If underflow flushed to zero instead, $x = 1.5 \times 2^{-126}$ and $y = 2^{-126}$ would give $x - y = 2^{-127}$, which would round to 0 although $x \ne y$. The NaN count is two signs times the $2^{23} - 1$ nonzero fractions.

**GATE use.** MSQs test the special encodings: which pattern is $-\infty$, whether $+0$ and $-0$ have the same pattern, the implicit bit and exponent of denormals, and whether NaN equals itself. NAT questions ask for the smallest positive denormal or normal. The trap is giving denormals an implicit 1, or the exponent $-127$.

**Check.** 0x00000001 is $2^{-149} \approx 1.401 \times 10^{-45}$. 0x007FFFFF is $(2^{23} - 1) 2^{-149}$, and adding $2^{-149}$ gives 0x00800000 $= 2^{-126} \approx 1.1755 \times 10^{-38}$. 0x7F800000 is $+\infty$, 0xFF800000 is $-\infty$, 0x7FC00000 is NaN and 0x80000000 is $-0$. The difference $1.5 \times 2^{-126} - 2^{-126}$ is stored as the denormal 0x00400000. On 50,000 random finite patterns, the value was an exact integer multiple of $2^{-149}$ every time.

## Floating-point range, ulp, rounding error and non-associativity
<!-- topics: dl-number-representations.fp-range-precision, dl-number-representations.fixed-point -->

**Claim.** Let $p = f + 1$ be the precision (24 in single precision).

1. The largest finite single is $(2 - 2^{-23}) 2^{127} \approx 3.4028 \times 10^{38}$. The smallest normal is $2^{-126}$ and the smallest denormal is $2^{-149}$. In double precision these are $\approx 1.798 \times 10^{308}$, $2^{-1022}$ and $2^{-1074}$.
2. In the binade $2^e \le \lvert x \rvert < 2^{e+1}$ there are $2^{p-1}$ floats with spacing $\text{ulp}(x) = 2^{\,e - p + 1}$.
3. Every integer with $\lvert n \rvert \le 2^p$ is representable, and $2^p + 1$ is not (it is $2^{24} + 1$ in single precision).
4. Round to nearest gives relative error at most $2^{-p}$ for $x$ in the normal range.
5. Floating-point addition is commutative but not associative.

**Proof.** (1) The largest finite value has $E = 2^k - 2$ and all fraction bits 1, so its significand is $1 + (2^{23} - 1)/2^{23} = 2 - 2^{-23}$, with exponent $254 - 127 = 127$. The other limits are $E = 1$ with $F = 0$, and $E = 0$ with $F = 1$. (2) The binade holds $(1 + F/2^{p-1}) 2^e$ for $F = 0, \dots, 2^{p-1} - 1$, and consecutive values of $F$ differ by $2^{e - (p - 1)}$.

(3) An integer $n$ with $2^e \le \lvert n \rvert < 2^{e+1}$ and $e \le p - 1$ lies in a binade with spacing $2^{e-p+1} \le 1$, a power of 2 that divides 1, so $n$ is one of the floats there. $2^p$ is a power of 2 and is representable. In the binade $[2^p, 2^{p+1})$ the spacing is 2, so $2^p + 1$ falls between two floats.

(4) The nearest float is within half a spacing, $2^{e-p}$, and $\lvert x \rvert \ge 2^e$, so the relative error is at most $2^{-p}$.

(5) Each operation is correctly rounded: the result is the rounded value of the exact sum. The exact sum is symmetric in its operands, so the operation is commutative. Associativity fails because the rounding of the inner sum depends on which operands it combines: in $(a + b) + c$ an intermediate rounding can lose $c$'s contribution that $a + (b + c)$ keeps. Ties round to the value with an even last bit, so that ties do not drift in one direction. The other rounding modes are toward 0, toward $+\infty$ and toward $-\infty$.

**GATE use.** Questions ask for the range limits, the gap between consecutive floats near a value, whether an integer is exactly representable, or which algebraic laws fail. The traps are using $2^{-127}$ as the smallest normal, $2 \times 2^{127}$ as the maximum, and believing that every 32-bit integer survives a round trip through single precision.

**Check.** The patterns 0x7F7FFFFF, 0x00800000 and 0x00000001 decode exactly to $(2 - 2^{-23}) 2^{127}$, $2^{-126}$ and $2^{-149}$. The double limits were checked from their hex patterns. A script found the next float above $2^e$ to be $2^e + 2^{e-23}$ for $e = -126, -5, 0, 10, 23, 24$. The first positive integer that does not survive a round trip through single precision is 16,777,217 $= 2^{24} + 1$, which rounds to $2^{24}$. On 100,000 random reals, the largest relative rounding error was $5.94 \times 10^{-8}$, below $2^{-24} \approx 5.96 \times 10^{-8}$. In single precision, $(2^{24} + 1) + 1$ evaluates to $2^{24}$ while $2^{24} + (1 + 1) = 2^{24} + 2$. Also $(10^{20} - 10^{20}) + 1 = 1$, while $10^{20} + (-10^{20} + 1) = 0$. In double precision $0.1 + 0.2 \ne 0.3$.

## Floating-point multiplication and addition
<!-- topics: dl-number-representations.ieee754-conversion, dl-number-representations.fp-range-precision -->

**Claim.** Let $x_i = (-1)^{S_i} M_i 2^{e_i}$ be normal floats with significands $M_i = 1.F_i \in [1, 2)$, true exponents $e_i$ and stored exponents $E_i = e_i + \text{bias}$.

1. The product has sign $S_1 \oplus S_2$, stored exponent $E_1 + E_2 - \text{bias}$ and significand $M_1 M_2 \in [1, 4)$. When $M_1 M_2 \ge 2$ one right shift renormalizes it and adds 1 to the exponent.
2. For $e_1 \ge e_2$, $x_1 + x_2 = \left(\pm M_1 \pm M_2 2^{-(e_1 - e_2)}\right) 2^{e_1}$: the operand with the smaller exponent is shifted right by $e_1 - e_2$ places. A sum of like signs lies in $[1, 4)$ and needs at most one right shift; a subtraction can cancel leading bits and need several left shifts.
3. The result is rounded to $f$ fraction bits. Two extra bits (guard and round) plus a sticky bit, the OR of every bit shifted out below them, suffice to round to nearest even exactly as if the sum had been computed with unbounded precision.

**Proof.** (1) $x_1 x_2 = (-1)^{S_1 + S_2} M_1 M_2 2^{e_1 + e_2}$, and $(-1)^{S_1 + S_2}$ is $-1$ exactly when one sign bit is 1, which is $S_1 \oplus S_2$. The stored exponent of the product is $e_1 + e_2 + \text{bias} = (E_1 - \text{bias}) + (E_2 - \text{bias}) + \text{bias} = E_1 + E_2 - \text{bias}$: adding two stored exponents counts the bias twice, so it is subtracted once. Since $1 \le M_i < 2$, $1 \le M_1 M_2 < 4$, and $M_1 M_2 \ge 2$ is fixed by $M_1 M_2 2^{e} = (M_1 M_2 / 2) 2^{e+1}$.

(2) $M_2 2^{e_2} = M_2 2^{-(e_1 - e_2)} 2^{e_1}$, so both terms share the factor $2^{e_1}$ and the significands add. Shifting the larger operand left instead would push its leading bits out of the register, so hardware always shifts the smaller one right. For like signs, $1 \le M_1 \le M_1 + M_2 2^{-(e_1 - e_2)} < 2 + 2 = 4$. For unlike signs the difference can be as small as one ulp, so the leading 1 may move many places to the right.

(3) Round to nearest needs only three facts about the discarded part: whether it is below, at or above half an ulp. The guard bit is the first discarded bit (the half-ulp position); the round bit and sticky bit together tell whether anything non-zero lies below it. The round bit is kept separately because after a cancelling subtraction one left shift moves the guard bit into the result, and the round bit becomes the new guard. Hennessy and Patterson give the same argument.

**GATE use.** A 2-mark MCQ gives two hex patterns and asks for the product or sum as a pattern. Multiplying by a power of 2 leaves the fraction unchanged and only moves the exponent, which settles most options at a glance. The traps are adding stored exponents without subtracting the bias, forgetting the renormalizing shift when $M_1 M_2 \ge 2$, and aligning the larger operand.

**Check.** $\text{0xC1800000} \times \text{0x3F5C2EF4}$: $E = 131 + 126 - 127 = 130$, sign 1, fraction 0x5C2EF4, giving 0xC15C2EF4 $\approx -13.7615$, which matched Python's single-precision product of $-16$ and $0.86009145$. $1.5 \times 1.5$: $E = 127 + 127 - 127 = 127$ and $M = 2.25 \ge 2$, so the result is $1.125 \times 2^{1}$ = 0x40100000. $1.1_2 \times 2^3 + 1.01_2 \times 2^1 = (1.1 + 0.0101)_2 \times 2^3 = 1.1101_2 \times 2^3 = 14.5$ = 0x41680000. In single precision $1 + 2^{-24}$ is a tie and rounds to the even value 1, $1 + 3 \cdot 2^{-24}$ rounds up to $1 + 2^{-22}$, and $1 + 2^{-24} + 2^{-40}$ rounds up to $1 + 2^{-23}$ because the sticky bit records the $2^{-40}$.

## Range and value in a non-standard floating-point format
<!-- topics: dl-number-representations.generic-float, dl-number-representations.ieee754-format -->

**Claim.** A format has a sign bit, a $k$-bit exponent with bias $B$ and $f$ fraction bits.

1. With a hidden 1, the largest finite value is $(2 - 2^{-f}) \cdot 2^{E_{\max} - B}$. Here $E_{\max} = 2^k - 2$ if the all-ones exponent code is reserved for infinity and NaN, and $E_{\max} = 2^k - 1$ if no code is reserved.
2. The smallest positive normal is $2^{E_{\min} - B}$, where $E_{\min}$ is the least exponent code used for normal numbers: 1 when code 0 is reserved for zero and denormals, 0 otherwise.
3. With IEEE-style denormals, which use code 0 and the exponent $1 - B$, the smallest positive value is $2^{1 - B - f}$.
4. Without a hidden bit, with significand $0.F$ normalized so the first stored bit is 1, the significand lies in $[1/2, 1 - 2^{-f}]$, and only $f$ bits are significant instead of $f + 1$.

**Proof.** Values increase with the exponent code first and the fraction second (the ordering argument of the IEEE format section uses only this layout). So the maximum takes the largest allowed exponent code and the largest fraction. With a hidden 1 that fraction gives $1 + (2^f - 1)/2^f = 2 - 2^{-f}$. The smallest normal takes the smallest normal exponent code with fraction 0. The smallest denormal is $0.0\dots01_2 \times 2^{1 - B} = 2^{-f} \cdot 2^{1 - B}$. Without a hidden bit, normalization forces the first stored bit to be 1, so that bit carries no information.

**GATE use.** A 2-mark NAT defines a format and asks for its largest or smallest value, or for the value of a pattern. Read four things from the question: the field widths, the bias, whether the 1 is hidden, and which codes are reserved. The trap is using the all-ones exponent for the maximum when it is reserved (or skipping it when it is not), and assuming IEEE conventions the question did not state.

**Check.** The 8-bit format $1 \mid 4 \mid 3$ with bias 7, a hidden 1 and code 1111 reserved has maximum $1.111_2 \times 2^{14 - 7} = 1.875 \times 128 = 240$. Using code 1111 by mistake gives 480. The smallest normal is $2^{-6} = 1/64$, the smallest denormal is $2^{-9} = 1/512$, and the format has 119 positive finite values. The pattern $0\ 1010\ 101$ is $1.101_2 \times 2^{3} = 13$. For half precision, $1 \mid 5 \mid 10$ with bias 15, the formulas give 65504, $2^{-14}$ and $2^{-24}$, and they matched Python's float16 decoding on all 31,744 non-negative finite patterns. A format with 1 sign bit, a 6-bit excess-32 exponent, 9 fraction bits, a hidden 1, no reserved codes and no denormals has maximum $(2 - 2^{-9}) 2^{31} = 4{,}290{,}772{,}992$ and minimum positive value $2^{-32}$. A script compared the maximum formula, with and without a reserved code, against enumeration for every $k$ from 3 to 6 and every $f$ from 1 to 5.

## BCD, excess-3, Gray code and ASCII
<!-- topics: dl-number-representations.codes -->

**Claim.**

1. BCD stores each decimal digit in 4 bits, so a $d$-digit number takes $4d$ bits. Pure binary needs $\lceil d \log_2 10 \rceil$ bits for all $d$-digit numbers. When two BCD digits are added, the 4-bit sum must be corrected by adding $0110$ exactly when it exceeds 9 or produces a carry.
2. Excess-3 stores digit $d$ as $d + 3$. It is self-complementing: inverting the 4 bits of digit $d$ gives the code of $9 - d$.
3. The binary-reflected Gray code $G = B \oplus (B \gg 1)$, that is $G_i = B_i \oplus B_{i+1}$ with $B_n = 0$, is a bijection on $n$-bit words. Consecutive values, including $2^n - 1$ followed by 0, differ in exactly one bit. It decodes by $B_{n-1} = G_{n-1}$ and $B_i = B_{i+1} \oplus G_i$.
4. In ASCII, upper- and lower-case letters differ only in bit 5, since 'a' $-$ 'A' $= 97 - 65 = 32$.

**Proof.** (1) The largest $d$-digit number $10^d - 1$ needs $\lfloor \log_2(10^d - 1) \rfloor + 1$ bits. This equals $\lceil d \log_2 10 \rceil$ because $10^d$ is never a power of 2, and it is at most $4d$, with equality only at $d = 1$ ($\lceil \log_2 10 \rceil = 4$), so BCD costs extra bits for every $d \ge 2$. The digit sum $s = a + b + c$ with carry-in $c$ lies in $[0, 19]$. For $s \le 9$ the 4-bit sum is already the digit. For $10 \le s \le 15$ the 4-bit sum is $s$, an invalid code, and for $16 \le s \le 19$ the adder carries out and leaves $s - 16$. In both cases the result should be a decimal carry plus the digit $s - 10$, and adding 6 to the 5-bit value $s$ gives $s + 6 = 16 + (s - 10)$: a binary carry worth 16 and the low digit $s - 10$.

(2) Inverting a 4-bit value $u$ gives $15 - u$, and $15 - (d + 3) = (9 - d) + 3$.

(3) The decoding is a telescoping XOR: $G_i \oplus G_{i+1} \oplus \dots \oplus G_{n-1} = B_i \oplus B_n = B_i$. So $G$ determines $B$ and the map is a bijection. For the one-bit property, incrementing $B$ turns a suffix $0\,1\dots1$ (a 0 followed by $t$ ones) into $1\,0\dots0$, flipping bits $0, \dots, t$. For $i < t$ both $B_i$ and $B_{i+1}$ flip, so $G_i$ is unchanged. $G_t$ flips, because $B_t$ flips and $B_{t+1}$ does not. Bits above $t$ do not change. At the wrap-around, $G(2^n - 1) = 10\dots0$ and $G(0) = 0$, which differ in one bit.

(4) $32 = 2^5$, and the letters A–Z (65–90) and a–z (97–122) differ by exactly that bit.

**GATE use.** MSQs mix true and false code facts: the BCD of 47, the Gray code of a binary word, the excess-3 code of a digit, and whether BCD is more compact than binary. NAT questions ask for the BCD result of an addition. The traps are writing a number in binary when BCD is asked for (25 is $0010\,0101$, not $11001$), decoding Gray by XORing adjacent Gray bits instead of the already decoded binary bit, and forgetting the $+6$ correction after a carry out (as in $8 + 9$).

**Check.** 25 in BCD is $0010\,0101$ and 47 is $0100\,0111$. A 4-digit number takes 16 bits in BCD and 14 in binary, since $9999 < 2^{14}$. $7 + 5 = 01100$ and $+0110$ gives $1\,0010$, which is 12. $8 + 9 = 10001$ and $+0110$ gives $1\,0111$, which is 17. A script confirmed the correction rule for every pair of digits with both carry-ins, and the excess-3 complement for every digit. Gray of $1011$ is $1011 \oplus 0101 = 1110$, and decoding $1110$ gives $1011$ back. Bijection, one-bit steps with wrap-around, and round-trip decoding held for every word of 1 to 10 bits.

## Hamming codes: the check-bit bound and syndrome decoding
<!-- topics: dl-number-representations.codes -->

**Claim.** A code that corrects any single-bit error in $n = m + r$ bits carrying $m$ data bits needs

$$2^r \ge m + r + 1 .$$

The Hamming code reaches this bound. It puts check bits at positions $1, 2, 4, \dots$ (1-indexed), and the check bit at position $2^j$ makes even the parity of all positions whose index has bit $j$ set. On receipt, the syndrome (the XOR of the indices of all 1 bits) is 0 for a valid word and equals $e$ when only bit $e$ is flipped. Adding one overall parity bit gives SECDED (single-error correction, double-error detection) with $r + 1$ check bits.

**Proof.** Lower bound (sphere packing). There are $2^m$ codewords, and each must be decoded correctly after any of its $n$ single-bit errors. So the $n + 1$ words within distance 1 of each codeword must belong to that codeword alone. The sets are disjoint and lie among $2^n$ words, so $2^m (n + 1) \le 2^n$, that is $n + 1 \le 2^r$.

Construction. The positions $1, \dots, n$ with $n \le 2^r - 1$ have distinct, nonzero $r$-bit indices. Bit $j$ of the syndrome is the parity of the group of positions with bit $j$ set. The check bit at position $2^j$ is the only check bit in group $j$, so it can be set to make that group even, and then every bit of the syndrome is 0. Flipping position $e$ changes the parity of exactly the groups $j$ with bit $j$ of $e$ set, so the syndrome becomes $e$, which names the position to flip back. The construction needs every position to have its own nonzero index, which is the condition $n \le 2^r - 1$, the same as the bound. So any two codewords differ in at least 3 bits. The overall parity bit raises this to 4. A single error flips the overall parity, while a double error leaves it even with a nonzero syndrome, so the two cases are told apart.

**GATE use.** NAT questions ask for the least number of check bits for $m$ data bits, or which bit is in error given a received word. The traps are solving $2^r \ge m + 1$ instead of $2^r \ge m + r + 1$, and forgetting the extra bit for SECDED.

**Check.** The least $r$ satisfying the bound is 3 for $m = 4$ (the (7,4) code), 4 for $m = 8$ (12 bits, 13 with SECDED), 5 for $m = 16$, 6 for $m = 32$ and 7 for $m = 64$ (72 bits with SECDED). For every $m$ below 70, a script confirmed that the sphere-packing inequality gives the same least $r$. With data bits 1, 1, 0, 1 at positions 3, 5, 6, 7 the codeword is $1010101$. Flipping position 6 gives syndrome $110_2 = 6$. For every data word with $m = 4$ and $m = 8$, the syndrome was 0 on the codeword and equal to $e$ after flipping each position $e$.
