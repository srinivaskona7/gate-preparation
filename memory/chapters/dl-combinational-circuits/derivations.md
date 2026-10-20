# Combinational circuits: derivations

## XOR is parity, and chains of XNOR alternate with XOR
<!-- topics: dl-combinational-circuits.logic-gates-xor -->

**Claim.** Over bits, $A \oplus B = \overline{A}B + A\overline{B}$ and $A \odot B = AB + \overline{A}\,\overline{B} = \overline{A \oplus B}$. XOR is commutative and associative, with $A \oplus 0 = A$, $A \oplus 1 = \overline{A}$ and $A \oplus A = 0$; hence $A \oplus B = C$ implies $A \oplus C = B$. For $n \ge 1$ inputs, $x_1 \oplus x_2 \oplus \cdots \oplus x_n = 1$ exactly when an odd number of the $x_i$ are 1. A chain $x_1 \odot x_2 \odot \cdots \odot x_n$ (evaluated left to right, $n - 1$ XNOR gates) equals the $n$-input XOR when $n$ is odd and its complement when $n$ is even.

**Proof.** Bits with XOR form addition modulo 2: $A \oplus B = (A + B) \bmod 2$, which is 1 exactly when the bits differ, the rows $\overline{A}B$ and $A\overline{B}$. Commutativity and associativity are those of addition mod 2, $0$ is the identity, $A + A \equiv 0$, and $A + 1$ flips $A$. Adding $A$ to both sides of $A \oplus B = C$ gives $B = A \oplus C$. Associativity lets the $n$-input XOR be read as $(\sum_i x_i) \bmod 2$, which is 1 exactly when the count of 1s is odd.

For the chain, $A \odot B = \overline{A \oplus B} = A \oplus B \oplus 1$. Each of the $n - 1$ XNOR gates therefore contributes one extra $\oplus 1$, and by associativity

$$x_1 \odot \cdots \odot x_n = x_1 \oplus \cdots \oplus x_n \oplus \underbrace{1 \oplus \cdots \oplus 1}_{n-1}.$$

The constant is $(n - 1) \bmod 2$: zero when $n$ is odd, one when $n$ is even. So $A \odot B \odot C = A \oplus B \oplus C$, while $A \odot B = \overline{A \oplus B}$.

**GATE use.** Parity generators and checkers are XOR trees; the 2-input XNOR is a 1-bit equality detector used by comparators. MCQs ask whether $A \odot B \odot C$ equals $A \oplus B \oplus C$ (yes) or simplify a chain of XORs with constants. The trap is assuming XNOR of three variables is the complement of XOR of three, which is true only for an even number of inputs.

**Check.** A script evaluated every input of 1 to 6 variables: the XOR always matched the parity of the 1-count, and the XNOR chain matched the XOR for $n = 1, 3, 5$ and its complement for $n = 2, 4, 6$. For $ABC = 110$: $A \oplus B \oplus C = 0$, and $(1 \odot 1) \odot 0 = 1 \odot 0 = 0$.

## Functional completeness and minimum NAND counts
<!-- topics: dl-combinational-circuits.universal-gates -->

**Claim.** A set of gates is functionally complete when it can realise every Boolean function. (a) $\{\text{NAND}\}$ and $\{\text{NOR}\}$ are complete. (b) $\{\text{AND}, \text{OR}\}$ is not. (c) $\{\text{XOR}, \text{AND}\}$ is not complete without constants and is complete with the constant 1. (d) The 2:1 MUX with constants 0 and 1 is complete. (e) With 2-input NANDs only, true inputs only and no constants, the minimum gate counts are NOT 1, AND 2, OR 3, XOR 4, XNOR 5, half adder 5 and full adder 9. A two-level AND-OR circuit becomes NAND-NAND gate for gate, and OR-AND becomes NOR-NOR.

**Proof.** The set $\{\text{AND}, \text{OR}, \text{NOT}\}$ is complete because every function is the OR of its minterms, each an AND of literals. So a set is complete once it builds NOT and AND (OR then follows by De Morgan, $A + B = \overline{\overline{A}\,\overline{B}}$).

(a) $\text{NAND}(A, A) = \overline{A}$, $\text{AND} = \overline{\text{NAND}}$ (2 gates) and $A + B = \text{NAND}(\overline{A}, \overline{B})$ (3 gates). NOR is the dual: $\text{NOR}(A, A) = \overline{A}$, $A + B$ is NOR followed by NOT, $AB = \text{NOR}(\overline{A}, \overline{B})$.

(b) AND and OR are monotone: raising an input from 0 to 1 never lowers the output. A composition of monotone functions is monotone, by induction on the circuit. NOT is not monotone, so it cannot be built.

(c) $0 \oplus 0 = 0$ and $0 \cdot 0 = 0$, so by induction every circuit of XOR and AND gates outputs 0 on the all-zero input; NOT outputs 1 there. With the constant 1, $A \oplus 1 = \overline{A}$, and AND is available, so the set is complete.

(d) A 2:1 MUX computes $\overline{S}I_0 + SI_1$. With $S = A$, $I_0 = 1$, $I_1 = 0$ it gives $\overline{A}$; with $S = A$, $I_0 = 0$, $I_1 = B$ it gives $AB$.

NAND-NAND: by De Morgan, $\sum_j P_j = \overline{\prod_j \overline{P_j}}$. Replace each product $P_j$ by a NAND (giving $\overline{P_j}$) and the OR by a NAND of those outputs. A single literal fed straight to the OR needs an inverting NAND instead. The NOR-NOR form for POS is the dual.

(e) The upper bounds are constructions. XOR: $g_1 = \text{NAND}(A, B)$, $g_2 = \text{NAND}(A, g_1)$, $g_3 = \text{NAND}(B, g_1)$, $S = \text{NAND}(g_2, g_3)$; here $g_2 = \overline{A} + B$ and $g_3 = A + \overline{B}$, so $S = \overline{g_2} + \overline{g_3} = A\overline{B} + \overline{A}B$. The half adder adds $C = \text{NAND}(g_1, g_1) = AB$, reusing $g_1$: 5 gates. A full adder is two such XOR structures, $9 = 4 + 4 + 1$: the first gives $P = A \oplus B$ with $g_1 = \overline{AB}$, the second gives $S = P \oplus C_{in}$ with its first gate $h_1 = \overline{P C_{in}}$, and $C_{out} = \text{NAND}(g_1, h_1) = AB + PC_{in}$. The lower bounds have no short hand proof; they come from exhaustive search (Check).

**GATE use.** NATs ask the minimum number of 2-input NANDs or NORs for XOR, a half adder or a full adder, and MSQs ask which gate sets are complete. Traps: counting 6 for the half adder by not reusing $g_1$; calling $\{\text{XOR}, \text{AND}\}$ complete without noting the constant; and assuming AND-OR plus inverted inputs are free when the stem says only true inputs are available.

**Check.** A C program enumerated every circuit of 2-input NANDs over the true inputs with iterative deepening (pruning only gates that recompute an existing signal). The first depth with a solution was NOT 1, AND 2, OR 3, XOR 4, XNOR 5, half adder 5, full adder 9; no 8-gate circuit produced both full-adder outputs, after about $9.7 \times 10^7$ search nodes.

## Half adder and full adder
<!-- topics: dl-combinational-circuits.adders -->

**Claim.** Bits $A, B$ satisfy $A + B = 2C + S$ with $S = A \oplus B$, $C = AB$. Bits $A, B, C_{in}$ satisfy $A + B + C_{in} = 2C_{out} + S$ with

$$S = A \oplus B \oplus C_{in}, \qquad C_{out} = AB + C_{in}(A \oplus B) = AB + AC_{in} + BC_{in}.$$

Two half adders and an OR gate form a full adder, and the OR can be an XOR.

**Derivation.** The integer $A + B$ lies in $\{0, 1, 2\}$. Its low bit is its parity, $A \oplus B$, and its high bit is 1 only for $1 + 1$, which is $AB$. For three bits the sum lies in $\{0, \dots, 3\}$. Its low bit is the parity, $A \oplus B \oplus C_{in}$ (previous section), and its high bit is 1 exactly when at least two inputs are 1: the majority function $AB + AC_{in} + BC_{in}$. To get the other form, split on whether $A = B$. If $A = B$, then $A \oplus B = 0$ and the majority is $A = AB$. If $A \ne B$, exactly one of them is 1, $AB = 0$, and the majority is $C_{in} = C_{in}(A \oplus B)$. Both cases agree with $AB + C_{in}(A \oplus B)$.

For the construction, HA1 adds $A, B$: $S_1 = A \oplus B$, $C_1 = AB$. HA2 adds $S_1$ and $C_{in}$: $S = S_1 \oplus C_{in}$, $C_2 = S_1 C_{in}$. Then $C_{out} = C_1 + C_2$ by the form above. $C_1 = 1$ forces $A = B = 1$, so $S_1 = 0$ and $C_2 = 0$; the two carries are never both 1, and on such inputs $C_1 + C_2 = C_1 \oplus C_2$.

**GATE use.** Questions ask for the full-adder expressions, the gates in a two-half-adder full adder, or whether replacing the OR by XOR (or AND) changes the function: XOR does not, AND does. The common slip is $C_{out} = AB$, which is wrong whenever exactly one of $A, B$ is 1 and $C_{in} = 1$. A half adder has no carry input, so it serves only the least significant position of a ripple adder.

**Check.** All 8 rows satisfy $A + B + C_{in} = 2C_{out} + S$, $C_{out}$ equals the majority, and the OR and XOR versions of the two-half-adder circuit agree (script). Row $111$: $S = 1$, $C_{out} = 1$, so $1 + 1 + 1 = 11_2$.

## Subtraction, the adder-subtractor and overflow
<!-- topics: dl-combinational-circuits.subtractors -->

**Claim.** (a) A half subtractor gives $D = A \oplus B$ and borrow $\overline{A}B$, so that $A - B = D - 2\,\text{borrow}$. A full subtractor gives $D = A \oplus B \oplus B_{in}$ and

$$B_{out} = \overline{A}B + \overline{(A \oplus B)}\,B_{in} = \overline{A}B + \overline{A}B_{in} + BB_{in},$$

so that $A - B - B_{in} = D - 2B_{out}$. (b) For $n$-bit words, $A - B \equiv A + \overline{B} + 1 \pmod{2^n}$, so an adder fed $B_i \oplus M$ with $C_0 = M$ adds when $M = 0$ and subtracts when $M = 1$. (c) With $M = 1$ on unsigned operands, the carry-out is $C_n = 1$ exactly when $A \ge B$. (d) For two's-complement operands, the result overflows exactly when $V = C_n \oplus C_{n-1} = 1$, where $C_{n-1}$ is the carry into the sign position.

**Proof.** (a) $A - B - B_{in}$ lies in $\{-2, \dots, 1\}$. Its value mod 2 is the parity of the three bits, so $D = A \oplus B \oplus B_{in}$. A borrow is needed exactly when the value is negative, that is when $B + B_{in} > A$. If $A = 0$, this holds when $B$ or $B_{in}$ is 1: $\overline{A}(B + B_{in})$. If $A = 1$, it holds only when $B = B_{in} = 1$: $BB_{in}$. Together this is $\overline{A}B + \overline{A}B_{in} + BB_{in}$, the majority of $\overline{A}, B, B_{in}$. Splitting on $A = B$ as for the adder gives the XNOR form: when $A \ne B$ the borrow is $\overline{A}B$, and when $A = B$ it is $B_{in}$. Setting $B_{in} = 0$ gives the half subtractor.

(b) $B + \overline{B} = 2^n - 1$ for an $n$-bit word, so $\overline{B} + 1 = 2^n - B \equiv -B$. XOR with $M$ passes $B_i$ when $M = 0$ and complements it when $M = 1$ (first section), and $C_0 = M$ supplies the $+1$.

(c) The adder computes the integer $A + (2^n - 1 - B) + 1 = 2^n + (A - B)$. This is at least $2^n$, so bit $n$ is set, exactly when $A \ge B$.

(d) Let $a, b$ be the sign bits of the two adder operands, $c = C_{n-1}$ and $s$ the result's sign bit. Overflow means both operands have the same sign and $s$ differs. If $a = b = 0$, then $C_n = 0$ and $s = c$, so overflow means $c = 1$, i.e. $C_n \ne C_{n-1}$. If $a = b = 1$, then $C_n = 1$ and $s = c$, so overflow means $c = 0$, again $C_n \ne C_{n-1}$. If $a \ne b$, the true sum lies between the operands and always fits; here $C_n = c$, so $V = 0$. In every case overflow is $C_n \oplus C_{n-1}$.

**GATE use.** Problems give a 4-bit adder-subtractor with $M = 1$ and ask for the result, carry-out and overflow flag. Traps: forgetting $C_0 = 1$ (giving $A + \overline{B}$, one too small); reading $C_n = 1$ as signed overflow; and treating unsigned $C_n = 0$ after subtraction as "no borrow" when it means $A < B$.

**Check.** A script ran the 4-bit adder-subtractor on all 512 combinations of $A$, $B$ and $M$: results matched $A \pm B \bmod 16$, $C_4 = [A \ge B]$ whenever $M = 1$, and $V = C_4 \oplus C_3$ matched signed overflow every time. For $A = 0101$, $B = 0111$, $M = 1$: $0101 + 1000 + 1 = 1110$ ($-2$), $C_4 = 0$, $V = 0$.

## Ripple-carry adder delay
<!-- topics: dl-combinational-circuits.ripple-carry, dl-combinational-circuits.combinational-basics -->

**Claim.** A combinational output is stable once the slowest input-to-output path, the critical path, has settled. Model each full adder at position $i$ as $P_i = A_i \oplus B_i$, $G_i = A_iB_i$, $C_{i+1} = G_i + P_iC_i$ (an AND then an OR) and $S_i = P_i \oplus C_i$, with every gate, XOR included, costing one delay and all inputs, $C_0$ included, present at time 0. Then $C_i$ is stable at $2i + 1$ for $i \ge 1$, $S_i$ at $2i + 2$ for $i \ge 1$ ($S_0$ at 2), the carry-out $C_n$ at $2n + 1$ and the last sum $S_{n-1}$ at $2n$. When the stem gives full-adder delays instead, with carry delay $t_c$ and sum delay $t_s$ from the last-arriving input, the adder settles at $(n - 1)t_c + \max(t_c, t_s)$.

**Derivation.** A gate's output is stable one delay after its latest input is stable. $P_i$ and $G_i$ depend only on the inputs, so they are stable at 1. $C_1 = G_0 + P_0C_0$: the AND $P_0C_0$ is stable at $\max(1, 0) + 1 = 2$ and the OR at $\max(1, 2) + 1 = 3 = 2 \cdot 1 + 1$. Induction: if $C_i$ is stable at $2i + 1 \ge 3$, the AND $P_iC_i$ is stable at $2i + 2$ (its other input $P_i$ was ready at 1) and the OR at $2i + 3 = 2(i + 1) + 1$. The sum $S_i = P_i \oplus C_i$ is ready at $\max(1, 2i + 1) + 1 = 2i + 2$, and $S_0$ at $\max(1, 0) + 1 = 2$. The latest of all outputs is $C_n$ at $2n + 1$; $S_{n-1}$ is ready at $2(n - 1) + 2 = 2n$.

For the per-adder model, stage $i$'s carry-in is ready at $i\,t_c$, by induction since $C_0$ is ready at 0. The last stage receives its carry at $(n - 1)t_c$ and produces its sum $t_s$ later and its carry $t_c$ later. Earlier stages finish their sums by $(n - 2)t_c + t_s$, which is never later. So the adder is stable at $(n - 1)t_c + \max(t_c, t_s)$. The path is $O(n)$ because the carry passes through every stage; the hardware is $n$ full adders. Until the critical path settles the outputs may show transient wrong values, which is why a clocked design waits for it.

**GATE use.** The 2-mark NAT: "an $n$-bit ripple adder, each gate delay $\tau$; when are all outputs stable?" Fix the model first: whether XOR costs the same as AND/OR, whether the stem asks for the carry or the last sum, and whether delays are per gate or per full adder. Traps: counting $n$ carry delays plus a sum delay instead of $(n - 1)$ carries, and answering $2n$ (the last sum) when the carry-out at $2n + 1$ is also an output.

**Check.** A timing script for $n = 1, 2, 4, 8, 16$ reproduced $C_i = 2i + 1$, $C_8 = 17$, $S_7 = 16$ and $C_{16} = 33$. An event model with $(t_c, t_s) \in \{(2, 3), (3, 2), (1, 1), (4, 7)\}$ and $n \in \{1, 4, 8\}$ matched $(n - 1)t_c + \max(t_c, t_s)$; for $n = 8$, $t_c = 2$, $t_s = 3$ that is $14 + 3 = 17$.

## Carry lookahead: unrolled carries, cost and block delay
<!-- topics: dl-combinational-circuits.carry-lookahead -->

**Claim.** With $G_i = A_iB_i$ and $P_i = A_i \oplus B_i$, the carries satisfy $C_{i+1} = G_i + P_iC_i$ and, unrolled,

$$C_{i+1} = G_i + P_iG_{i-1} + P_iP_{i-1}G_{i-2} + \cdots + P_i \cdots P_1G_0 + P_i \cdots P_0C_0,$$

a sum of $i + 2$ products whose largest has $i + 2$ inputs. Allowing gates of any fan-in, all carries are stable 2 delays after $P$ and $G$ (time 3) and all sums at 4, for every $n$. A flat $n$-bit lookahead uses $n(n + 1)/2$ AND gates and fan-in up to $n + 1$. With 4-bit lookahead blocks whose carry-outs ripple, a 16-bit adder settles at 10 gate delays, against 33 for plain ripple. $P_i = A_i + B_i$ gives the same carries.

**Derivation.** Position $i$ produces a carry out if it generates one ($A_i = B_i = 1$), or if it propagates an incoming carry (exactly one of $A_i, B_i$ is 1) and $C_i = 1$; these are the full-adder carry $AB + C_{in}(A \oplus B)$ in new names. Unrolling is induction on $i$: substitute the expansion of $C_i$ into $C_{i+1} = G_i + P_iC_i$ and distribute $P_i$. Each term reads "position $j$ generates and every position above it up to $i$ propagates"; the terms are $G_i, \dots, G_0$ and the $C_0$ term, $i + 2$ in all, and the $C_0$ term has the $i + 1$ factors $P_i, \dots, P_0$ plus $C_0$. With $P_i = A_i + B_i$ the only new case is $A_i = B_i = 1$, where $G_i = 1$ already makes the carry 1, so the carries are unchanged; the sum still needs the XOR.

Each carry is now one AND level and one OR level over signals ready at 1, so all carries are ready at 3 and every $S_i = P_i \oplus C_i$ at 4, independent of $n$. Carry $C_{i+1}$ needs $i + 1$ AND gates (the term $G_i$ needs none), so the carries $C_1, \dots, C_n$ need $\sum_{i=0}^{n-1}(i + 1) = n(n + 1)/2$ AND gates, and $C_n$ needs an $(n + 1)$-input OR. That quadratic area and unbounded fan-in is why lookahead is built in 4-bit blocks.

Blocks of 4 with rippled block carries: block 0's carries, including $C_4$, are ready at $1 + 2 = 3$. Block $k$'s carries are a two-level function of its own $P, G$ (ready at 1) and its carry-in, so they are ready 2 after the carry-in: $C_8$ at 5, $C_{12}$ at 7 and the carries $C_{13}, \dots, C_{16}$ at 9. The sums $S_{13}, S_{14}, S_{15}$ follow at 10, and $C_{16}$ at 9 is earlier. Under the ripple model of the previous section $C_{16}$ is at $2 \cdot 16 + 1 = 33$. With bounded fan-in, the group generate and propagate signals $G_{[j..i]}$, $P_{[j..i]}$ combine associatively, $G_{[j..i]} = G_{[k+1..i]} + P_{[k+1..i]}G_{[j..k]}$, so a balanced tree computes all carries in $O(\log n)$ levels. The constant-depth claim and the $O(\log n)$ claim describe these two different designs.

**GATE use.** Questions ask for the expression of $C_3$ or $C_4$, the maximum fan-in, the delay of a CLA with stated gate delays, or of a block adder. Traps: calling CLA delay constant while also assuming bounded fan-in, and forgetting that only the last block's internal carries and sums sit at the end of the critical path.

**Check.** A script compared the unrolled expressions (with $P$ as XOR and as OR) against the recurrence for every pair of operands and carry-in up to 6 bits, and the final carry against $\lfloor (A + B + C_0)/2^w \rfloor$. The block timing script gave 10 for 16 bits in 4-bit blocks; the flat AND counts are 10, 36 and 136 for $n = 4, 8, 16$. For $n = 3$: $C_3 = G_2 + P_2G_1 + P_2P_1G_0 + P_2P_1P_0C_0$, four terms, largest AND with 4 inputs.

## BCD adder correction
<!-- topics: dl-combinational-circuits.bcd-adder -->

**Claim.** Add two BCD digits $a, b \in \{0, \dots, 9\}$ and a carry-in $c \in \{0, 1\}$ in a 4-bit binary adder, giving carry $K$ and sum bits $Z_8Z_4Z_2Z_1$, so that $a + b + c = 16K + Z$. The decimal carry is

$$C = K + Z_8Z_4 + Z_8Z_2,$$

which is 1 exactly when $a + b + c \ge 10$, and the correct BCD digit is $Z$ when $C = 0$ and $(Z + 6) \bmod 16$ when $C = 1$.

**Derivation.** The true sum $s = a + b + c$ lies in $0..19$. The BCD result is digit $s \bmod 10$ with carry $[s \ge 10]$. Case $s \le 15$: $K = 0$ and $Z = s$; $s \ge 10$ means $Z \in \{1010, \dots, 1111\}$, which are exactly the codes with $Z_8 = 1$ and $Z_4$ or $Z_2$ set ($Z_8 = 1$ alone gives 8 and 9). Case $16 \le s \le 19$: $K = 1$ and $Z = s - 16 \in 0..3$, so the $Z_8$ terms are 0 and $K$ carries the detection. Hence $C = [s \ge 10]$. Correction: if $10 \le s \le 15$, $(s + 6) \bmod 16 = s - 10$; if $16 \le s \le 19$, $(s - 16 + 6) = s - 10$. Adding 6 skips the six unused codes 1010 to 1111. The carry out of the correcting adder is discarded, since $C$ already is the decimal carry.

**GATE use.** MCQs give two digits, ask for the corrected digit and carry, or ask for the correction condition. The trap is skipping the correction when $Z \le 9$ but $K = 1$, as in $9 + 9$, and writing the condition as $Z > 9$ alone.

**Check.** A script ran all 200 cases of $a$, $b$, $c$: $C = [s \ge 10]$ and the corrected digit equals $s \bmod 10$ every time. For $9 + 9$: $18 = 1\,0010_2$, $K = 1$, $C = 1$, $0010 + 0110 = 1000$, so the output is BCD 0001 1000.

## Counting blocks in MUX and decoder trees
<!-- topics: dl-combinational-circuits.multiplexers, dl-combinational-circuits.decoders-demux -->

**Claim.** (a) A $2^n{:}1$ MUX computes $Y = \sum_{i} m_i(S_{n-1}, \dots, S_0)\, I_i$; the 2:1 case is $\overline{S}I_0 + SI_1$. (b) Building an $N{:}1$ MUX from $k{:}1$ MUXes in a tree takes

$$\frac{N}{k} + \frac{N}{k^2} + \cdots + 1 = \frac{N - 1}{k - 1}$$

units when $N$ is a power of $k$, with the low-order select bits on the first level. For any $N$, with every select pin wired to a select bit or a constant, at least $\lceil (N - 1)/(k - 1) \rceil$ units are needed. With 2:1 MUXes that bound is always met, so an $N{:}1$ takes exactly $N - 1$. For $k > 2$ it is not always met: a 7:1 MUX needs three 4:1 MUXes, not two. The level sum $\lceil N/k \rceil + \lceil N/k^2 \rceil + \cdots$ is one valid tree, not the minimum. (c) An $n$-to-$2^n$ decoder from 2-to-4 decoders with enables takes $2^n/4 + 2^n/16 + \cdots + 1$ units for even $n$; for odd $n$ the top level is an inverter that enables two sub-trees.

**Proof.** (a) Exactly one select minterm is 1, namely $m_s$ for the select value $s$, so the sum reduces to $I_s$.

(b) Every $k{:}1$ MUX takes $k$ signals and outputs 1, removing $k - 1$ signals. The tree starts with $N$ data signals and ends with 1, so it must remove $N - 1$ signals; a MUX with an input tied to a constant or a repeated signal removes fewer. So any tree has at least $\lceil (N - 1)/(k - 1) \rceil$ units. With $N$ a power of $k$ the full tree uses every input, and level $j$ holds $N/k^j$ units, giving exactly $(N - 1)/(k - 1)$. For $k = 2$ and any $N$, take the full tree for $2^{\lceil \log_2 N \rceil}$ inputs and delete every MUX whose two subtrees do not both hold a used code, wiring its one live input through. Codes $\ge N$ never occur, so routing is unchanged. Every remaining MUX has two live children, so the tree is a full binary tree with $N$ leaves and $N - 1$ internal nodes, matching the bound. For $k > 2$ the bound can fail. Take a 7:1 from two 4:1 MUXes $M_1$ (feeding) and $M_2$ (output). $M_2$ has 4 data slots, and with two select bits on its pins each slot receives 2 of the 8 codes (a constant pin only merges slots). A slot wired to a raw input serves one of its codes, and the $m$ slots wired to $M_1$ deliver at most $\min(4, 2m)$ inputs. With $m$ slots on $M_1$ the total is at most $\min(4, 2m) + (4 - m) \le 6 < 7$, so three units are needed. Routing: write the select value $s = k\,q + r$ with $r < k$. The first-level MUX number $q$ holds inputs $kq, \dots, kq + k - 1$ and its select $r$ (the low digit) picks $I_s$; the next level then picks group $q$ with the higher digits. Swapping the roles routes the wrong input.

(c) The leaves must produce $2^n$ outputs, 4 per decoder, so $2^n/4$ leaves. Each leaf is active only when its enable is; the enables are the $2^n/4$ outputs of an $(n - 2)$-to-$2^{n-2}$ decoder on the high address bits, built the same way. Recursion down to one 2-to-4 decoder gives the sum. When $n$ is odd the recursion ends with one high bit, whose two values come from the bit and its inverse, so 3-to-8 is two 2-to-4 decoders plus an inverter.

**GATE use.** NATs: the number of 4:1 MUXes for a 16:1 or 64:1, of 2:1 MUXes for an 8:1, or of 2-to-4 decoders for a 4-to-16. The trap is stopping at the first level (4 MUXes for a 16:1, missing the fifth) and summing $\lceil N/k^j \rceil$ level by level when $N$ is not a power of $k$, which gives three 2:1 MUXes for a 3:1 where two suffice.

**Check.** A script computed the level sums: 16:1 from 4:1 needs $4 + 1 = 5$, 64:1 needs $16 + 4 + 1 = 21$, 8:1 from 2:1 needs 7, all equal to $(N - 1)/(k - 1)$, and the formula held for $k \in \{2, 4, 8\}$ up to $k^4$. A 32:1 from 4:1 takes $8 + 2 + 1 = 11 = \lceil 31/3 \rceil$ in the level tree. For 2:1 MUXes the level sum overcounts: 3, 6, 6, 7 for $N = 3, 5, 6, 7$, against $N - 1 = 2, 4, 5, 6$ from the pruned tree. An exhaustive search over two 4:1 MUXes, with each pin on a select bit, a constant, an input or $M_1$, found a 5:1 and a 6:1 but no 7:1. One 6:1 is $M_1 = $ 4:1 on $I_0, \dots, I_3$ with selects $S_1S_0$, and $M_2$ with selects $S_2S_0$ and data $(M_1, M_1, I_4, I_5)$. A simulated 16:1 tree with $S_1S_0$ on the first level routed every input correctly. 4-to-16 from 2-to-4: $4 + 1 = 5$; 5-to-32: $8 + 2$ plus an inverter.

## Shannon expansion and realising functions on a MUX
<!-- topics: dl-combinational-circuits.mux-function -->

**Claim.** Every Boolean function satisfies

$$f(x_1, \dots, x_n) = x_1\, f(1, x_2, \dots, x_n) + \overline{x_1}\, f(0, x_2, \dots, x_n),$$

which is a 2:1 MUX with select $x_1$ and the two cofactors as data. Hence a $2^n{:}1$ MUX with the variables on the selects and $I_i = f(m_i)$ realises $f$, and a $2^{n-1}{:}1$ MUX also suffices: with $n - 1$ variables on the selects, each data input is the residue in the leftover variable $x$, one of $0$, $1$, $x$, $\overline{x}$.

**Proof.** Fix the value of $x_1$. If $x_1 = 1$ the right side is $f(1, x_2, \dots)$ and if $x_1 = 0$ it is $f(0, x_2, \dots)$; both equal the left side. Expanding on all $n$ variables in turn gives $f = \sum_i m_i f(m_i)$, the MUX equation with $I_i = f(m_i)$. Expanding only on the $n - 1$ select variables leaves, for each select value $s$, the one-variable cofactor $g_s(x)$. A function of one variable is one of four: $g(0) = g(1) = 0$ gives 0, both 1 gives 1, $(0, 1)$ gives $x$ and $(1, 0)$ gives $\overline{x}$. So $I_s = g_s(x)$ with no extra gates beyond an inverter for $\overline{x}$.

The rows paired in $g_s$ are those that agree on the select variables and differ in $x$. They are adjacent minterm numbers only when $x$ is the least significant variable; otherwise row $s$ pairs with the row whose index differs in $x$'s bit position.

Reading a network is the reverse: write each MUX output as $\sum (\text{select minterm}) \cdot (\text{data})$, substitute nested outputs, and simplify.

**GATE use.** Two MCQ shapes: choose the data inputs that make a 4:1 MUX realise a given 3-variable function, and find the function a given network realises. Traps: swapping which select line is the MSB, which permutes the data inputs; and pairing adjacent rows when the leftover variable is not the last one.

**Check.** For $F(A, B, C) = \sum m(1, 2, 4, 7)$ with selects $A, B$, the pairs (0,1), (1,0), (1,0), (0,1) give $(C, \overline{C}, \overline{C}, C)$; this $F$ is $A \oplus B \oplus C$. For the asymmetric $\sum m(2, 3, 5)$, selects $A, B$ give $(0, 1, C, 0)$ and selects $B, C$ with leftover $A$ give $(0, A, \overline{A}, \overline{A})$; pairing adjacent rows under selects $B, C$ instead realises $\sum m(1, 5, 6)$, a different function. A script checked the residue rule for all 256 three-variable functions with each choice of leftover variable: no mismatches. $(I_0, I_1, I_2, I_3) = (0, 1, 1, 0)$ with selects $A, B$ gives $A \oplus B$, and a 2:1 MUX with select $A$ and data $(B, \overline{B})$, feeding the $I_0$ input of a 2:1 MUX with select $C$ and $I_1 = 0$, gives $\overline{C}(A \oplus B)$ on all 8 rows.

## Decoders as minterm generators, active-low outputs and the DEMUX
<!-- topics: dl-combinational-circuits.decoders-demux -->

**Claim.** An enabled $n$-to-$2^n$ decoder has outputs $Y_i = E \cdot m_i$, so exactly one output is active when $E = 1$ and none when $E = 0$. Hence $f = \sum_{i \in T} m_i$ is the OR of outputs $Y_i$, $i \in T$. With active-low outputs $\overline{Y_i}$, the same $f$ is the NAND of $\overline{Y_i}$, $i \in T$, while their AND is $\overline{f} = \prod_{i \in T} M_i$. A decoder with enable is a 1-to-$2^n$ DEMUX with the enable as the data input.

**Proof.** The decoder decodes its input code, so $Y_i = 1$ exactly when the code equals $i$ and $E = 1$; that is $E \cdot m_i$, and the minterms are mutually exclusive and exhaustive. OR-ing outputs over $T$ is then $f$. Active low: $\overline{Y_i} = \overline{m_i} = M_i$, the maxterm. By De Morgan,

$$\text{NAND}_{i \in T}\big(\overline{m_i}\big) = \overline{\prod_{i \in T} \overline{m_i}} = \sum_{i \in T} m_i = f,$$

and dropping the outer complement gives the AND $\prod_{i \in T} M_i = \overline{f}$. For the DEMUX, a data bit $D$ on the enable gives $Y_s = D$ for the selected output $s$ and 0 elsewhere, which is the DEMUX definition. With $D = 1$ the DEMUX is a plain decoder.

**GATE use.** A decoder plus a gate realises a given function: name the gate (OR for active-high, NAND for active-low) and the outputs it takes. Traps: an AND gate on active-low outputs, which gives the complement, and confusing a DEMUX's one input and $2^n$ outputs with a MUX's $2^n$ inputs and one output.

**Check.** A script fed all 8 codes to a 3-to-8 decoder with active-low outputs: the NAND of $\overline{Y_1}, \overline{Y_2}, \overline{Y_4}, \overline{Y_7}$ equalled $A \oplus B \oplus C$, and their AND equalled its complement, $\sum m(0, 3, 5, 6)$. For code 011, only $\overline{Y_3}$ is 0, and it is not a NAND input, so the NAND sees four 1s and outputs $F = 0$, matching $0 \oplus 1 \oplus 1 = 0$. For code 100, $\overline{Y_4} = 0$ is a NAND input and $F = 1$.

## Encoders and priority encoders
<!-- topics: dl-combinational-circuits.encoders -->

**Claim.** For a $2^n$-to-$n$ encoder with exactly one active input $I_k$, output bit $Y_j$ is the OR of the inputs $I_i$ whose index $i$ has bit $j$ set; for 8-to-3, $Y_2 = I_4 + I_5 + I_6 + I_7$, $Y_1 = I_2 + I_3 + I_6 + I_7$, $Y_0 = I_1 + I_3 + I_5 + I_7$. With several active inputs these equations output the bitwise OR of their indices. A priority encoder outputs the index of the highest active input and a valid bit $V = \sum_i I_i$; for 4 inputs with $I_3$ highest, $Y_1 = I_3 + I_2$ and $Y_0 = I_3 + \overline{I_2}I_1$.

**Proof.** If only $I_k$ is 1, the OR for $Y_j$ is 1 exactly when $k$ is in its list, i.e. when bit $j$ of $k$ is 1, so $Y = k$. With an active set $T$, $Y_j = 1$ exactly when some $i \in T$ has bit $j$ set, which is the bitwise OR of the indices in $T$. All inputs 0 gives $Y = 0$, the same as $I_0$ alone, so $V$ is needed to tell them apart.

For the 4-input priority encoder, let $h$ be the highest active index. $h \ge 2$ (bit 1 set) exactly when $I_3$ or $I_2$ is 1, so $Y_1 = I_3 + I_2$. $h$ is odd exactly when $h = 3$ ($I_3 = 1$) or $h = 1$ ($I_3 = I_2 = 0$, $I_1 = 1$); that is $I_3 + \overline{I_3}\,\overline{I_2}I_1$, and the absorption law $X + \overline{X}Y = X + Y$ drops the $\overline{I_3}$ factor, giving $I_3 + \overline{I_2}I_1$. $V = 1$ exactly when some input is active.

**GATE use.** Questions give an input string and ask for the priority encoder's output, or ask what a plain encoder outputs with two active inputs. Traps: reading the input string in the wrong order and reporting the lowest active input, and forgetting $V$.

**Check.** A script confirmed the 4-input equations on all 15 non-zero inputs. For $I_7 \dots I_0 = 00101100$ the active inputs are $I_5, I_3, I_2$: the priority encoder gives 101 with $V = 1$, the lowest active input would give 010, and a plain encoder gives $101 \lor 011 \lor 010 = 111$. With only $I_3$ and $I_5$ high the plain encoder also gives $011 \lor 101 = 111$.

## Magnitude comparators
<!-- topics: dl-combinational-circuits.comparators -->

**Claim.** For $n$-bit unsigned $A = A_{n-1} \dots A_0$ and $B$, let $x_i = A_i \odot B_i$. Then

$$E = \prod_{i} x_i, \qquad G = \sum_{i} A_i\overline{B_i} \prod_{j > i} x_j, \qquad L = \sum_{i} \overline{A_i}B_i \prod_{j > i} x_j,$$

exactly one of $E, G, L$ is 1, and for $n$-bit operands $G = 1$ on $(4^n - 2^n)/2$ of the $4^n$ input pairs (6 of 16 for $n = 2$). A cascadable stage outputs its own $G$ or $L$ when its bits differ and passes the lower stage's outputs through when its bits are equal.

**Proof.** $A = B$ exactly when every bit agrees, and $x_i$ is the 1-bit equality detector. If $A \ne B$, let $i$ be the most significant position where they differ. All positions above $i$ agree, and the bits at $i$ decide the order because $2^i > \sum_{j<i} 2^j = 2^i - 1$: the lower bits can never outweigh position $i$. So $A > B$ exactly when, for that $i$, $A_i = 1$ and $B_i = 0$ with all higher $x_j = 1$, which is the term $A_i\overline{B_i}\prod_{j>i}x_j$. Distinct terms cannot both be 1, since each one fixes $i$ as the first difference. $L$ is symmetric, and the three cases partition the input pairs. Of $4^n$ pairs, $2^n$ are equal and the rest split evenly by the swap $(A, B) \mapsto (B, A)$. A cascade is the same rule with the lower stage's result standing in for its bits.

**GATE use.** NATs count the inputs for which $A > B$, or the gates of an $n$-bit equality detector ($n$ XNORs and one $n$-input AND); MCQs ask for the 2-bit $G = A_1\overline{B_1} + x_1A_0\overline{B_0}$. The trap is dropping the $x_1$ factor, which lets a lower bit decide even when the higher bits differ the other way.

**Check.** A script evaluated $G$ from the formula against $A > B$ for all pairs up to 4 bits and counted the 1s: $(4^n - 2^n)/2$ each time, 6 for $n = 2$. Without $x_1$, the input $A = 01$, $B = 10$ gives $A_0\overline{B_0} = 1$, a false "greater".

## ROM, PLA and PAL sizes
<!-- topics: dl-combinational-circuits.programmable-logic -->

**Claim.** A ROM realising $m$ functions of $n$ inputs needs $2^n \times m$ bits whatever the functions are. A PLA needs one AND line per distinct product term in the jointly minimised SOP forms of its outputs, at most the number of distinct minterms and often far fewer; its size is quoted as $n \times k \times m$. A PAL has a programmable AND plane and a fixed OR plane, so each output has a fixed number of private product terms and terms cannot be shared.

**Proof.** A ROM's AND plane is a fixed, complete $n$-to-$2^n$ decoder, one word line per minterm. Its OR plane stores, for each word line and output, whether that minterm belongs to the output: $2^n \times m$ programmable cells, independent of the functions, because every minterm line exists whether used or not. A PLA's AND plane is programmable, so a line can form any product of up to $2n$ literals ($x_i$ and $\overline{x_i}$ for each input), and its programmable OR plane lets any output take any line. A set of products realises the outputs exactly when each output is the OR of some of them; a minimised cover uses fewer products than minterms whenever an implicant covers several minterms, and a product used by two outputs is counted once. In a PAL the OR connections are fixed, so a product feeding two outputs must be built twice.

**GATE use.** NATs ask the ROM size for an arithmetic circuit; count every operand bit as an address line and every result bit as a data bit. MSQs test which plane is fixed in which device. Traps: counting minterms as PLA product lines, and sizing a multiplier's output with $n$ bits instead of $2n$.

**Check.** A 4-bit by 4-bit unsigned multiplier has 8 address bits and an 8-bit product ($15 \times 15 = 225 < 256$), so $2^8 \times 8 = 2048$ bits; 16 functions of 8 variables need $256 \times 16 = 4096$. $\sum m(0, 1, 2, 3, 4)$ of $A, B, C$ is $\overline{A} + \overline{B}\,\overline{C}$ (script, all 8 rows): 2 PLA lines, not 5.

## Design procedure: code converters, hazards and the array multiplier
<!-- topics: dl-combinational-circuits.design-procedure, dl-combinational-circuits.combinational-basics -->

**Claim.** (a) The binary-to-Gray map $g_{n-1} = b_{n-1}$, $g_i = b_{i+1} \oplus b_i$ is inverted by $b_{n-1} = g_{n-1}$, $b_i = b_{i+1} \oplus g_i$, computed from the MSB down, and consecutive integers have Gray codes differing in exactly one bit. (b) In a two-level SOP circuit, if one input change moves between two adjacent 1-cells covered by different implicants, the output may glitch to 0 (a static-1 hazard); adding the consensus term of the two implicants removes it without changing the function. (c) An $n \times n$ array multiplier forms $n^2$ partial products $a_ib_j$, sums them with about $n(n - 1)$ adder cells, and produces $2n$ bits.

**Proof.** (a) XOR $b_{i+1}$ into both sides of $g_i = b_{i+1} \oplus b_i$ to get $b_i = b_{i+1} \oplus g_i$; with $b_{n-1} = g_{n-1}$ this recovers every bit, from the MSB down, so the inverse ripples while the forward map is one XOR level. Going from $b$ to $b + 1$ flips the trailing 1s and the 0 above them, bits $0..t$; $g_i$ depends on $b_{i+1}$ and $b_i$, and for $i < t$ both flip, so $g_i$ is unchanged, while $g_t$ sees only $b_t$ flip and changes. Bits above $t$ are untouched. Exactly one Gray bit changes.

(b) Take $F = AB + \overline{A}C$ with $B = C = 1$ and $A$ falling from 1 to 0. $AB$ falls one gate delay after $A$, but $\overline{A}C$ rises only after the inverter and the AND, two delays, so for one delay both products are 0 and $F$ dips. The consensus of $AB$ and $\overline{A}C$ is $BC$, and $AB + \overline{A}C + BC = AB + \overline{A}C$: if $BC = 1$ then either $A = 1$ (so $AB = 1$) or $A = 0$ (so $\overline{A}C = 1$). $BC$ stays 1 throughout the transition, holding $F$ at 1.

(c) $A \cdot B = \sum_{i,j} a_ib_j 2^{i+j}$, so the partial products are the $n^2$ ANDs. They form $n$ rows of $n$ bits, shifted; adding $n$ rows takes $n - 1$ row additions of $n$ cells each, $n(n - 1)$ cells. The product is below $2^{2n}$, so $2n$ bits.

The general method for every block in this chapter: name inputs and outputs, write the truth table, mark impossible inputs as don't-cares (codes 1010 to 1111 in a BCD-to-7-segment decoder), minimise each output, map to gates or blocks, and check the critical path. Multi-level factoring such as $AB + AC + AD = A(B + C + D)$ cuts gates and fan-in at the price of more levels.

**GATE use.** MCQs ask for Gray codes of given numbers, the expression of one converter output, the hazard-free form of an SOP, or gate counts of an array multiplier. Traps: computing Gray-to-binary with $g_{i+1} \oplus g_i$ (which is not the inverse), and treating a hazard cover as a change of function.

**Check.** A script confirmed the Gray inverse and the one-bit-change property for all words up to 6 bits; for $b = 0111$, $g = 0100$, and back gives $0, 1, 1, 1$. A unit-delay simulation of $F = AB + \overline{A}C$ with $B = C = 1$ and $A$ falling gave the trace 11011111 without $BC$ and 11111111 with it. For $n = 4$: 16 partial products, 12 adder cells, an 8-bit product.
