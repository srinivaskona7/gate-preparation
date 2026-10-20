# ALU, datapath and control unit: derivations

## Select fields: k alternatives need the ceiling of log2 k bits
<!-- topics: coa-alu-datapath-control.alu-functions, coa-alu-datapath-control.bit-slice-shifter, coa-alu-datapath-control.microinstruction-format -->

**Claim.** A binary-encoded field that must name one of $k \ge 1$ alternatives (ALU operations, multiplexer inputs, status conditions of a branch multiplexer) needs at least

$$b = \lceil \log_2 k \rceil$$

bits, and $b$ bits suffice. The assumption is that the field is a plain binary code decoded by logic; a one-hot (unencoded) field of the same alternatives needs $k$ bits instead.

**Proof.** A field of $b$ bits takes $2^b$ distinct values, and distinct alternatives must receive distinct codes, so the encoding is an injection from a $k$-element set into a $2^b$-element set. Such an injection exists exactly when $2^b \ge k$, that is $b \ge \log_2 k$, and the least integer with this property is $\lceil \log_2 k \rceil$. Sufficiency: give alternative $i$ (counted from 0) the binary numeral of $i$, which fits in $b$ bits because $i \le k - 1 \le 2^b - 1$. Minimality: with $b - 1$ bits only $2^{b-1}$ codes exist, and $2^{b-1} \lt k$ by the choice of $b$. An $m$-input multiplexer is the same object read in reverse: its select lines carry the binary index of the chosen input, so it needs $\lceil \log_2 m \rceil$ of them. In a bit-slice ALU every 1-bit cell holds such a multiplexer choosing among its adder, AND, OR and XOR outputs, and all $n$ cells share the same select lines, so the select width does not grow with $n$.

**GATE use.** "An ALU performs 16 operations; how many function-select bits?" (4), "how many select lines does the result multiplexer of each slice need?" and the condition-select field of a microinstruction all reduce to this count. The traps are answering $k$ (the one-hot width) or $\log_2 k$ without the ceiling when $k$ is not a power of 2: 5 alternatives need 3 bits, and 12 need 4.

**Check.** $\lceil \log_2 16 \rceil = 4$, $\lceil \log_2 8 \rceil = 3$, a 4-input multiplexer needs 2 select lines and 5 alternatives need 3 bits. A script confirmed $2^{b-1} \lt k \le 2^b$ for $b = \lceil \log_2 k \rceil$ and every $k$ from 2 to 1000.

## Subtraction through the adder, and the Z and N flags
<!-- topics: coa-alu-datapath-control.adder-subtractor, coa-alu-datapath-control.status-flags, coa-alu-datapath-control.alu-functions -->

**Claim.** For $n$-bit words $A$ and $B$ and arithmetic modulo $2^n$,

$$A - B \equiv A + \overline{B} + 1 \pmod{2^n},$$

where $\overline{B}$ inverts every bit of $B$. An adder whose $B$ inputs pass through XOR gates with a mode line $M$, and whose carry-in is $c_0 = M$, therefore computes $A + B$ for $M = 0$ and $A - B$ for $M = 1$. The result $r = r_{n-1} \dots r_0$ sets $Z = \overline{r_{n-1} + \cdots + r_1 + r_0}$ (1 exactly when every bit is 0) and $N = r_{n-1}$, which is the sign of $r$ read as a two's-complement number.

**Derivation.** Bit $i$ of $B + \overline{B}$ is $b_i + \overline{b_i} = 1$ with no carry, so $B + \overline{B} = 2^n - 1$, the all-ones word. Hence $\overline{B} + 1 = 2^n - B \equiv -B \pmod{2^n}$, and adding $A$ gives the identity. The two's-complement code of a negative value $-x$ is $2^n - x$, so the same $n$ result bits are correct for signed and unsigned readings alike; only the interpretation of overflow differs (next section). The XOR gate realises the mode line: $b_i \oplus 0 = b_i$ and $b_i \oplus 1 = \overline{b_i}$. The $+1$ costs no extra hardware because it enters as the carry-in of bit 0. Z is a NOR of the $n$ result bits because the NOR is 1 exactly when no input is 1. In two's complement the MSB has weight $-2^{n-1}$ and every other bit a positive weight summing to at most $2^{n-1} - 1$, so the value is negative exactly when $r_{n-1} = 1$, which justifies $N = r_{n-1}$. CMP is this subtraction with the result discarded and the four flags kept.

**GATE use.** The MCQ "with $M = 1$ the adder outputs" has answer $A - B$; dropping the carry-in gives $A + \overline{B} = A - B - 1$, the one's-complement difference, which is a listed distractor. Flag questions need Z from all $n$ result bits after the carry out is discarded: $0x80 + 0x80$ in 8 bits gives result 0 and sets Z even though the true sum is 256.

**Check.** In 4 bits, $6 - 3$ becomes $0110 + 1100 + 1$: the carries into bits 0 to 4 are 1, 0, 0, 1, 1 and the result is $0011 = 3$. A script compared $A + \overline{B} + 1$ with $A - B \bmod 2^n$ and Z with $A = B$ for all $2^{16}$ pairs at $n = 8$ and all 256 pairs at $n = 4$.

## Signed overflow is the carry into the MSB XOR the carry out of it
<!-- topics: coa-alu-datapath-control.adder-subtractor, coa-alu-datapath-control.status-flags -->

**Claim.** Add two $n$-bit words with carries $c_0, c_1, \dots, c_n$, where $c_i$ is the carry into bit $i$, so $c_{n-1}$ enters the MSB and $c_n$ leaves it. Then the carry flag $C = c_n$ is 1 exactly when the unsigned sum is at least $2^n$ (unsigned overflow), and the overflow flag

$$V = c_n \oplus c_{n-1}$$

is 1 exactly when the true sum of the two's-complement operands lies outside $[-2^{n-1}, 2^{n-1} - 1]$ (signed overflow). Equivalently, $V = 1$ exactly when both operands have the same sign and the result has the other sign. C and V are independent: all four combinations occur.

**Proof.** For C: the adder computes $A + B + c_0 = r + 2^n c_n$ with $0 \le r \lt 2^n$, so $c_n = 1$ exactly when the unsigned total reaches $2^n$. For V, write the signed values as $A_s = A' - a_{n-1} 2^{n-1}$ and $B_s = B' - b_{n-1} 2^{n-1}$, where $A'$ and $B'$ are the low $n - 1$ bits. Adding the low bits gives $A' + B' + c_0 = r' + c_{n-1} 2^{n-1}$, with $r'$ the low $n-1$ result bits; this is the definition of $c_{n-1}$. The MSB column computes $a_{n-1} + b_{n-1} + c_{n-1} = r_{n-1} + 2c_n$. Combining,

$$A_s + B_s + c_0 = r' + c_{n-1} 2^{n-1} - (a_{n-1} + b_{n-1}) 2^{n-1} = r' + c_{n-1}2^{n-1} - (r_{n-1} + 2c_n - c_{n-1}) 2^{n-1},$$

so the true signed sum is $S = (r' - r_{n-1} 2^{n-1}) + (2c_{n-1} - 2c_n) 2^{n-1}$. The first bracket is the signed value $R_s$ of the $n$-bit result. Hence $S = R_s + (c_{n-1} - c_n) 2^n$. If $c_n = c_{n-1}$ the result is exactly the true sum, so no overflow. If $c_{n-1} = 1, c_n = 0$, then $S = R_s + 2^n \ge 2^{n-1}$, which is too large; if $c_{n-1} = 0, c_n = 1$, then $S = R_s - 2^n \lt -2^{n-1}$, too small. So overflow occurs exactly when the two carries differ. For the sign form: the MSB column with $c_{n-1} = 1, c_n = 0$ forces $a_{n-1} = b_{n-1} = 0$ and $r_{n-1} = 1$ (two positives, negative result), and $c_{n-1} = 0, c_n = 1$ forces $a_{n-1} = b_{n-1} = 1$ and $r_{n-1} = 0$; operands of opposite signs give $a_{n-1} + b_{n-1} = 1$, where the carries always agree. Conversely, with $a_{n-1} = b_{n-1}$ the MSB column gives $2a_{n-1} + c_{n-1} = r_{n-1} + 2c_n$, so $c_n = a_{n-1}$ and $r_{n-1} = c_{n-1}$; hence $r_{n-1} \ne a_{n-1}$ exactly when $c_{n-1} \ne c_n$, and same-sign operands with a flipped result always overflow. The same rule holds for subtraction, read on the adder's actual inputs $A$ and $\overline{B}$ with $c_0 = 1$.

**GATE use.** The 1-mark MSQ "which flags are set after this 8-bit addition" is solved by adding in binary, keeping 8 bits, and reading C from the ninth bit and V from the sign test. The trap is equating carry with overflow: two negatives that fit set C but not V. The MCQ on the overflow rule lists "$c_n = 1$" and "MSB is 1" as distractors.

**Check.** $0xC0 + 0xC0 = 0x180$: result $0x80$, $c_7 = c_8 = 1$, so C = 1, V = 0, N = 1, Z = 0, and $-64 + (-64) = -128$ fits. $0x7F + 0x01 = 0x80$: $c_7 = 1$, $c_8 = 0$, so C = 0, V = 1. $0x80 + 0x80$ sets both C and V, and $0x01 + 0x01$ sets neither, so all four combinations occur. A script confirmed the carry rule and the sign rule against the true signed sum for every operand pair at $n = 4$ and $n = 8$.

## Branch conditions after CMP
<!-- topics: coa-alu-datapath-control.status-flags, coa-alu-datapath-control.alu-functions -->

**Claim.** Let CMP $A, B$ compute $A + \overline{B} + 1$ on $n$ bits and set Z, N, C and V from that sum as in the two previous sections. Then

- $A = B$ exactly when $Z = 1$;
- as unsigned numbers, $A \ge B$ exactly when $C = c_n = 1$, so "unsigned lower" is $C = 0$ on machines that store the adder's carry, and $C = 1$ on machines (x86) that store the borrow $\overline{c_n}$;
- as signed numbers, $A \lt B$ exactly when $N \oplus V = 1$.

**Proof.** Z: the result is $A - B \bmod 2^n$, and for $0 \le A, B \lt 2^n$ the difference $A - B$ lies in $(-2^n, 2^n)$, so it is $0 \bmod 2^n$ only when $A = B$. Unsigned: the adder forms $A + (2^n - 1 - B) + 1 = 2^n + (A - B)$, which reaches $2^n$, setting $c_n$, exactly when $A - B \ge 0$. Signed: let $D = A_s - B_s$ be the true difference and $R_s$ the signed result. If $V = 0$, then $R_s = D$ and its sign bit N is 1 exactly when $D \lt 0$. If $V = 1$, $D$ is outside the range and $R_s = D \pm 2^n$ has the opposite sign to $D$, so N is wrong and $\overline{N}$ is the true sign. In both cases the true sign is $N \oplus V$. Testing N alone fails exactly when the subtraction overflows.

**GATE use.** Questions give a CMP followed by BLT, BLO or BEQ and ask whether the branch is taken, or ask which flag combination implements "signed less than". The trap is testing N alone: it is wrong whenever the difference overflows, as for $-128 - 1$ in 8 bits. A second trap is the carry convention for unsigned comparisons; state which one the question uses.

**Check.** $5 - 7$ in 8 bits gives $0xFE$ with C = 0 (5 is lower unsigned), N = 1, V = 0, so $N \oplus V = 1$ and $5 \lt 7$. $0x80 - 0x01$ gives $0x7F$ with N = 0 and V = 1, so $N \oplus V = 1$: $-128 \lt 1$, while N alone would say non-negative. A script checked all three equivalences for every pair at $n = 4$ and $n = 8$.

## Ripple-carry adder delay
<!-- topics: coa-alu-datapath-control.adder-subtractor -->

**Claim.** An $n$-bit ripple-carry adder chains full adders FA$_0, \dots,$ FA$_{n-1}$, with the carry-out $c_{i+1}$ of FA$_i$ feeding FA$_{i+1}$. Assume every operand bit and $c_0$ are stable at $t = 0$, that a full adder produces its carry-out $t_c$ after its carry-in is stable and its sum $t_s$ after its carry-in is stable, and that its operand inputs are never the late input. Then $c_i$ is stable at $i\,t_c$, and

$$T_{\text{sum}} = (n-1)\,t_c + t_s, \qquad T_{\text{carry}} = n\,t_c,$$

so the whole result (all sum bits and $c_n$) is stable at $\max\big((n-1)t_c + t_s,\ n\,t_c\big)$, which grows linearly in $n$.

**Proof.** Induction on $i$: $c_0$ is stable at $0 = 0 \cdot t_c$. If $c_i$ is stable at $i\,t_c$, FA$_i$ has all its inputs stable then, so $c_{i+1}$ is stable at $(i+1)t_c$. The sum $s_i$ is stable at $i\,t_c + t_s$, which increases with $i$, so the last sum bit $s_{n-1}$ is the latest at $(n-1)t_c + t_s$. The worst case is real: with $A = 11\dots1$, $B = 0\dots0$ and $c_0$ switching from 0 to 1, every $p_i = 1$ and the new carry must travel through all $n$ stages. Stage $n-1$ needs only $c_{n-1}$, not $c_n$, which is why the sum term has $n-1$ carry delays and not $n$.

**GATE use.** The NAT gives $n$, $t_c$ and $t_s$ and asks when the result is guaranteed stable. Take the later of the last sum and the final carry. The traps are counting $n$ carry delays before the last sum, and reading $t_c$ as measured from the operand inputs when the question measures it from the carry-in (or the reverse).

**Check.** For $n = 32$, $t_c = 2$ ns and $t_s = 3$ ns: $c_{31}$ at 62 ns, $s_{31}$ at 65 ns, $c_{32}$ at 64 ns, so 65 ns. With $t_c = 3$ and $t_s = 2$ the carry is later: $s_{31}$ at 95 ns, $c_{32}$ at 96 ns. A script ran the event-time recurrence for both cases.

## Carry lookahead: two-level carries and rippled blocks
<!-- topics: coa-alu-datapath-control.carry-lookahead -->

**Claim.** Define for each bit $g_i = a_i b_i$ (generate) and $p_i = a_i \oplus b_i$ (propagate). Then

$$c_{i+1} = g_i + p_i c_i, \qquad s_i = p_i \oplus c_i,$$

and unrolling the recurrence gives every carry as a sum of products of $g$, $p$ and $c_0$:

$$c_{i+1} = g_i + p_i g_{i-1} + p_i p_{i-1} g_{i-2} + \cdots + p_i p_{i-1} \cdots p_1 g_0 + p_i p_{i-1} \cdots p_0 c_0,$$

a two-level AND-OR circuit. In a $k$-bit lookahead block the expression for $c_k$ has $k + 1$ product terms and its largest AND has fan-in $k + 1$. If $n$ bits are split into $n/k$ blocks whose carries ripple from block to block, the $g$ and $p$ signals are ready at $t_{gp}$, $c_0$ at time 0, and each block gives its carry-out $t_{\text{block}}$ after both its carry-in and its $g/p$ inputs are ready, then

$$T_{c_n} = t_{gp} + \frac{n}{k}\, t_{\text{block}}.$$

Generating $c_1, \dots, c_n$ in two-level form, with $g_{i-1}$ wired straight into the OR gate of $c_i$, takes $n(n+1)/2$ AND gates and $n$ OR gates. A second lookahead level replaces the ripple between 4-bit blocks with block signals

$$P = p_3 p_2 p_1 p_0, \qquad G = g_3 + p_3 g_2 + p_3 p_2 g_1 + p_3 p_2 p_1 g_0, \qquad c_4 = G + P\,c_0,$$

and with every gate (XOR included) one unit of delay, a 16-bit two-level adder has its block carries $c_4, c_8, c_{12}, c_{16}$ at 5 and its last sum at 8.

**Derivation.** The full-adder carry is $c_{i+1} = a_i b_i + a_i c_i + b_i c_i = a_i b_i + (a_i + b_i) c_i$. When $a_i = b_i = 1$ both forms give 1; otherwise $a_i b_i = 0$ and $a_i + b_i = a_i \oplus b_i$, so $c_{i+1} = g_i + p_i c_i$. The sum bit is $a_i \oplus b_i \oplus c_i = p_i \oplus c_i$. Substituting the recurrence into itself, $c_{i+1} = g_i + p_i(g_{i-1} + p_{i-1} c_{i-1})$, and repeating down to $c_0$ gives the expansion; the term $p_i \cdots p_{j+1} g_j$ says "a carry is generated at $j$ and propagated through every bit above it up to $i$", and these events cover all ways a carry can reach bit $i+1$. Each carry is an OR of ANDs, so all carries of a block appear after the same constant delay regardless of position. The term counts follow from the expansion: $c_k$ has one term per starting position $j = 0, \dots, k - 1$ plus the $c_0$ term, and the last term is an AND of $k + 1$ signals. Summed over $c_1, \dots, c_k$ there are $1 + 2 + \cdots + k = k(k+1)/2$ AND gates, quadratic growth, which is why blocks are kept to about 4 bits. For the block chain, block $j$ cannot start before both inputs are ready, so its carry-out is at $\max(t_{gp}, T_{\text{in}}) + t_{\text{block}}$. Block 0 starts at $\max(t_{gp}, 0) = t_{gp}$; each later block's carry-in arrives after $t_{gp}$, so the maximum is always the carry-in, and by induction block $j$'s carry-out is at $t_{gp} + (j+1) t_{\text{block}}$. The last sum bit $s_{n-1} = p_{n-1} \oplus c_{n-1}$ needs one XOR after the last block's internal carry $c_{n-1}$, which that block produces at the same time as its carry-out. For the gate count, $c_i$ has $i + 1$ terms, of which the bare $g_{i-1}$ needs no AND gate, so $c_i$ costs $i$ AND gates and one OR gate. Block signals: $G$ is exactly the expansion of $c_4$ with $c_0 = 0$ (a carry is generated inside the block) and $P$ says all four bits propagate, so $c_4 = G + P c_0$ is the same recurrence one level up, and the second-level unit forms $c_8 = G_1 + P_1 G_0 + P_1 P_0 c_0$ and so on. Timing: $g, p$ at 1, $P$ one AND later at 2, $G$ two levels later at 3; the second-level carries are two levels after $G$, at 5; an internal carry such as $c_{15} = g_{14} + p_{14} g_{13} + p_{14} p_{13} g_{12} + p_{14} p_{13} p_{12} c_{12}$ waits for $c_{12}$ and is ready at 7; $s_{15} = p_{15} \oplus c_{15}$ at 8. Hamacher follows this derivation and its second level of block generate and propagate signals.

**GATE use.** NATs ask for the gate delay of $c_n$ or of the last sum for a stated block structure. Start each block at the later of its carry-in and the $g/p$ time, then add the block delay. The traps are adding $t_{gp}$ once per block (it is computed for all bits in parallel at the start) and forgetting the final XOR when the question asks for the sum rather than the carry.

**Check.** 16 bits in four 4-bit blocks with $t_{gp} = 1$ and $t_{\text{block}} = 2$: $c_4, c_8, c_{12}, c_{16}$ at 3, 5, 7 and 9 gate delays, and $s_{15}$ at 10. A 16-bit ripple adder with 2 gate delays per carry after the same $g/p$ stage gives $c_{16}$ at 33. A 4-bit two-level carry unit has $1 + 2 + 3 + 4 = 10$ AND and 4 OR gates, an 8-bit one 36 and 8; the 16-bit two-level adder gives $c_{16}$ at 5 and $s_{15}$ at 8 against 9 and 10 for rippled blocks. A script checked $c_4 = G + P c_0$ for all 512 inputs, ran the gate-level timing of the two-level adder and counted the gates, and checked the expansions of $c_1$ to $c_4$ and $s_i = p_i \oplus c_i$ against a ripple adder for all 512 inputs of 4-bit operands with $c_0$, and confirmed that $p_i = a_i + b_i$ also gives correct carries (but not correct sums).

## Barrel shifter stages and the meaning of arithmetic shifts
<!-- topics: coa-alu-datapath-control.bit-slice-shifter, coa-alu-datapath-control.datapath-components -->

**Claim.** A logarithmic barrel shifter for $n = 2^m$ bits has $m = \log_2 n$ stages; stage $j$ shifts by $2^j$ when bit $j$ of the shift count is 1 and passes the word through otherwise. Each stage is $n$ 2:1 multiplexers, so $n \log_2 n$ multiplexers in all, and every shift amount from 0 to $n - 1$ takes one pass. On an $n$-bit two's-complement value $x$, an arithmetic right shift by $k$ (vacated bits filled with the sign bit) gives $\lfloor x / 2^k \rfloor$, a logical right shift (filled with 0) gives $\lfloor x / 2^k \rfloor$ for the unsigned reading, and sign extension from $n$ to $N$ bits, which copies the sign bit into the new high positions, preserves the signed value.

**Proof.** Every shift amount $s \in [0, n-1]$ has a unique binary expansion $s = \sum_j s_j 2^j$ with $m$ bits, and shifts compose additively, so passing through the stages with $s_j$ as the select of stage $j$ shifts by exactly $s$. Fewer stages cannot work: $n$ distinct shift amounts must be produced by $2^{(\text{stages})}$ settings of the stage selects, so $m$ stages are the minimum for this design. For the arithmetic shift, write $x = -x_{n-1} 2^{n-1} + \sum_{i \lt n-1} x_i 2^i$. Sign extension by one bit replaces $-x_{n-1}2^{n-1}$ by $-x_{n-1}2^n + x_{n-1}2^{n-1}$, which is the same number, and induction extends this to any number of bits. An arithmetic shift right by 1 is a sign extension by one bit followed by dropping bit 0 and halving the weights: the result is $(x - x_0)/2 = \lfloor x/2 \rfloor$, since $x - x_0$ is even and $x_0 \in \{0, 1\}$. Repeating $k$ times gives $\lfloor\lfloor x/2 \rfloor / 2 \rfloor \cdots = \lfloor x/2^k \rfloor$. The logical shift is the same argument on the unsigned value. Zero extension of a negative value adds $2^n$ to it, which is why the wrong extension turns a negative offset into a large positive one.

**GATE use.** "How many stages / multiplexers in a 32-bit barrel shifter?" (5 and 160), and questions on the value after shifting a negative number. The traps are counting $n$ stages, treating an arithmetic shift of a negative odd number as truncation toward zero ($-7 \gg 1 = -4$, not $-3$), and zero-extending a signed immediate.

**Check.** 32 bits: 5 stages and 160 multiplexers; 64 bits: 6 stages and 384. $0xF5$ ($-11$) sign-extends to $0xFFF5$, still $-11$; it shifts arithmetically right by 1 to $0xFA$ ($-6 = \lfloor -11/2 \rfloor$) and logically to $0x7A$. A script simulated the 5-stage shifter against a direct shift for 2000 random words, and checked $\lfloor x/2^k \rfloor$ for every 8-bit $x$ and $k \le 7$ and sign extension for every 8-bit value.

## Counting control steps on a single-bus datapath
<!-- topics: coa-alu-datapath-control.control-sequences, coa-alu-datapath-control.datapath-components, coa-alu-datapath-control.hardwired-control -->

**Claim.** Take the single-bus organisation of Hamacher: one internal bus, an ALU whose input A comes from register Y or the constant 4 (Select4/SelectY) and whose input B is the bus, an output register Z, and memory that delivers MDR in the step after Read is issued (WMFC waits for it). Assume each step lets exactly one register drive the bus, while any number of registers may load from it. Then fetch takes 3 steps, ADD R1, (R3) with R1 ← R1 + M[R3] takes 4 more, 7 in all, and no correct sequence is shorter. In the hardwired unit each control signal is the OR, over the steps that use it, of the step-decoder output ANDed with the instruction decoder output, for example $Z_{\text{in}} = T_1 + T_6 \cdot \text{ADD} + T_4 \cdot \text{BR}$.

**Proof.** Lower bound: count the distinct values that must cross the bus. Fetch needs PC (to MAR and the ALU), the incremented PC from Z (back to PC) and the instruction from MDR (to IR). Execution needs R3 (to MAR), R1 (to Y, since the ALU's other input is the bus), the operand from MDR (to the ALU) and the sum from Z (to R1). These are 7 different values, and each needs its own step because the bus carries one value per step, so at least 7 steps. Upper bound: the sequence

```
1  PCout, MARin, Read, Select4, Add, Zin
2  Zout, PCin, Yin, WMFC
3  MDRout, IRin
4  R3out, MARin, Read
5  R1out, Yin, WMFC
6  MDRout, SelectY, Add, Zin
7  Zout, R1in, End
```

has one driver per step and respects the data order: Z holds PC + 4 from step 1 when step 2 reads it, MDR is valid by step 3 and again by step 6 because each Read is followed by a step that waits, and Y holds R1 when step 6 adds. Step 5 overlaps the move of R1 into Y with the memory wait, which is what reaches the bound. For hardwired control, a signal is active in step $T_i$ of instruction class $I$ exactly when the table above (and the tables of the other instructions) lists it there, so the signal equals the OR over its occurrences of $T_i \cdot I$; fetch steps are common to all instructions and appear as a bare $T_i$. $Z_{\text{in}}$ is in step 1 for every instruction, step 6 of ADD, and step 4 of an unconditional branch (offset plus PC into Z), which gives the expression.

**GATE use.** MCQs ask for the number of steps of an instruction or which signals are active in a given step. Count bus transfers first; that number is the minimum. The traps are two registers driving the bus in one step and using MDR in the same step as its Read.

**Check.** A script executed the seven steps with R1 = 17, R3 = 40 and M[40] = 25, checking one bus driver per step and MDR loaded only one step after Read: it ends with R1 = 42, PC advanced by one word and IR holding the fetched instruction.

## Single-cycle versus multi-cycle time per instruction
<!-- topics: coa-alu-datapath-control.single-multi-cycle -->

**Claim.** Let the execution steps have delays $t_1, \dots, t_m$ and ignore register and clock overhead. A single-cycle implementation has clock period $T_{\text{single}} = \sum_j t_j$ over the steps of the slowest instruction, and that is its time for every instruction. A multi-cycle implementation clocks at $\max_j t_j$ and spends one cycle per step used, so with instruction-class fractions $f_c$ and cycle counts $k_c$,

$$T_{\text{multi}} = \mathrm{CPI} \times \max_j t_j, \qquad \mathrm{CPI} = \sum_c f_c k_c.$$

Multi-cycle is faster exactly when $\mathrm{CPI} \lt T_{\text{single}} / \max_j t_j$.

**Derivation.** A single clock period must fit the longest combinational path any instruction takes, which for a load runs through all steps in sequence, so the period is the sum. Every instruction then costs one such period. In the multi-cycle design every step ends at a clock edge, so the period must fit the slowest step, and an instruction using $k$ steps takes $k$ periods even when its steps are faster than the slowest. The average over the instruction mix is the expectation of $k$ times the period, which is CPI times the period by linearity. Comparing the two averages gives the break-even condition. Unbalanced steps hurt multi-cycle because every step is charged the slowest step's time.

**GATE use.** A 2-mark NAT gives step delays and a mix and asks for the multi-cycle average time, or asks which design is faster. The traps are assuming multi-cycle always wins, using the average step time instead of the slowest as the clock, and taking the single-cycle period from an instruction other than the slowest.

**Check.** Steps 200, 100, 150, 200 and 100 ps: $T_{\text{single}} = 750$ ps. With 25% loads (5 cycles), 10% stores (4), 45% ALU (4) and 20% branches (3), CPI $= 1.25 + 0.4 + 1.8 + 0.6 = 4.05$, so $T_{\text{multi}} = 810$ ps and multi-cycle is slower; break-even is CPI $3.75$. Balancing all steps at 150 ps would give $4.05 \times 150 = 607.5$ ps. A script computed all four numbers.

## Horizontal and vertical microinstruction widths
<!-- topics: coa-alu-datapath-control.horizontal-vertical -->

**Claim.** Let the control signals fall into groups, where the signals of group $i$ (there are $n_i$ of them) are mutually exclusive, meaning no step activates two of them, and signals that may be active together are in different groups (an independent signal is a group of 1). The horizontal control field has one bit per signal, width $W_h = \sum_i n_i$. The vertical (encoded) field gives each group a binary field decoded by a decoder, and its minimum width is

$$W_v = \sum_i \lceil \log_2 (n_i + 1) \rceil$$

when each group must be able to activate none of its signals, or $\lceil \log_2 n_i \rceil$ for a group in which one signal is always active.

**Derivation.** Horizontal: each bit drives one signal, so any subset of signals is expressible, and a subset needs one independent bit per signal, giving $\sum n_i$; no decoder is needed. Vertical: a group's field must name which of its signals is active or that none is, which is $n_i + 1$ alternatives, so by the select-field count it needs $\lceil \log_2(n_i + 1) \rceil$ bits; when the idle option does not exist only $n_i$ alternatives remain. Fields of different groups are independent, so the widths add. An independent signal has $n_i = 1$ and $\lceil \log_2 2 \rceil = 1$ bit, the same as horizontal, which is why encoding saves nothing for it. The price of encoding is a decoder in every field's path (delay) and the loss of parallelism within a group, which is acceptable precisely because a group's signals never need to be active together.

**GATE use.** The 1-mark NAT gives group sizes and asks for the vertical width or the saving over horizontal. The trap is dropping the $+1$: a group of 7 fits in 3 bits because $7 + 1 = 8$, but a group of 8 needs 4 bits unless one of its signals is always on. MCQs ask the advantage of horizontal format: any combination of signals in one step, no decoding, at the cost of a wider control memory.

**Check.** Groups of 7, 3 and 12 plus 4 independent signals: $3 + 2 + 4 + 4 = 13$ bits against $W_h = 26$. Eight exclusive ALU operations with one always active need $\lceil \log_2 8 \rceil = 3$ bits; if idle is allowed they need $\lceil \log_2 9 \rceil = 4$. A script computed each width.

## Microinstruction fields and control-memory size
<!-- topics: coa-alu-datapath-control.microinstruction-format, coa-alu-datapath-control.microprogrammed-control, coa-alu-datapath-control.hardwired-control, coa-alu-datapath-control.risc-cisc -->

**Claim.** A microinstruction with a control field of $W_{\text{ctrl}}$ bits, a condition-select field choosing among $s$ status inputs of the branch multiplexer, and a next-address field of $x$ bits has width

$$W = W_{\text{ctrl}} + \lceil \log_2 s \rceil + x,$$

and the next-address field can name $2^x$ control-memory words, so a control memory that uses its whole address range has $2^x$ words and $2^x W$ bits. Given $W$, $x = W - W_{\text{ctrl}} - \lceil \log_2 s \rceil$; given the number of words $w$, $x = \lceil \log_2 w \rceil$. The number of words is the fetch routine plus every execute routine plus any other routines (interrupt handling), and the CAR needs $\lceil \log_2 (\text{words}) \rceil$ bits. Each micro-step costs one control-memory read, so a microprogrammed step takes at least the control-memory access time in addition to the datapath work, while a hardwired unit produces the same signals after a few gate delays.

**Derivation.** The sequencer loads the control address register (CAR) with either CAR + 1 or the next-address field, depending on the status input the condition-select field picks; one multiplexer input tied to 1 gives an unconditional branch and one tied to 0 gives plain sequencing. The select field needs $\lceil \log_2 s \rceil$ bits by the select-field count. The next-address field must hold any control-memory address, so it has as many bits as the CAR, and $x$ address bits name exactly $2^x$ words. The three fields share the word, so their widths add to $W$, and either given quantity fixes $x$. For timing: the control signals of a micro-step are bits of the microinstruction, so they exist only after the CAR has been updated and the word read out; one read delivers every signal of that step together. In hardwired control the signals are sum-of-products functions of the step counter, the opcode and the flags, available a few gate delays after the step begins. This is why hardwired control suits RISC (few, uniform instructions, pipelined), while microprogrammed control suits CISC, where many complex, irregular instructions are easier to write as microroutines and change as firmware.

**GATE use.** The high-frequency 2-mark NAT gives the total width, the control-field width and the number of status flags, and asks for the field widths or the control-memory size. The traps are which quantity is given (total width fixes $x$ from the width; memory size fixes it from $\log_2$), forgetting the input tied to 1 when the question counts it among the flags, and the false statement that microprogrammed control needs one memory read per control signal.

**Check.** 30-bit words, 17-bit control field, 16 multiplexer inputs: select 4 bits, $x = 30 - 17 - 4 = 9$, so 512 words. 26-bit words, 13-bit control field, 8 status inputs: select 3, $x = 10$, 1024 words of 26 bits, 26624 bits. A 4-word fetch routine, 30 execute routines of 6 words and 10 interrupt words make 194 words, an 8-bit CAR, and with 28 control bits $194 \times 36 = 6984$ bits. A script computed all three.

## Nanoprogramming storage
<!-- topics: coa-alu-datapath-control.nanoprogramming -->

**Claim.** A microprogram of $N$ microinstructions whose control words have width $w$ needs $S_1 = N w$ bits stored directly. If only $D$ of the control words are distinct, a two-level store keeps each distinct word once in a nanomemory and stores in the microprogram a minimum-width index into it, for

$$S_2 = N \lceil \log_2 D \rceil + D\, w$$

bits (sequencing fields ignored). Two-level storage saves space exactly when $D w \lt N\,(w - \lceil \log_2 D \rceil)$, and it costs a second memory access per micro-step.

**Derivation.** The nanomemory holds $D$ words of $w$ bits, $Dw$ bits. Each of the $N$ microinstructions must name one of $D$ nanowords, which by the select-field count needs $\lceil \log_2 D \rceil$ bits, giving $N \lceil \log_2 D \rceil$ for the microprogram. The sum is $S_2$. Subtracting, $S_1 - S_2 = N(w - \lceil \log_2 D \rceil) - Dw$, which is positive exactly under the stated condition. So the saving needs many repeats ($D$ much smaller than $N$) and wide control words; with every word distinct ($D = N$) the two-level store is strictly larger. Each step first reads the index from the micro memory and then the control word from the nanomemory, two accesses in sequence, which is the speed cost.

**GATE use.** NATs give $N$, $w$ and $D$ and ask for the two-level storage or the saving. The traps are indexing with $\log_2 N$ bits instead of $\log_2 D$, and forgetting to add the nanomemory itself.

**Check.** $N = 2048$, $w = 100$, $D = 256$: index 8 bits, $2048 \times 8 + 256 \times 100 = 16384 + 25600 = 41984$ bits against $204800$, a saving of 162816 bits. For this $N$ and $w$ the two-level store stays smaller up to $D = 1822$. With $N = D = 8$ and $w = 4$ it needs 56 bits against 32. A script computed these values and searched for the break-even $D$.
