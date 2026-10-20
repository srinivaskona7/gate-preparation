# Sequential circuits: derivations

## SR latch: stable states, the forbidden input and the characteristic equation
<!-- topics: dl-sequential-circuits.sr-latch, dl-sequential-circuits.latch-vs-flipflop -->

**Claim.** In the cross-coupled NOR latch, with $Q = (R + \overline{Q})'$ and $\overline{Q} = (S + Q)'$, the input $S = R = 0$ has two stable states, $(Q, \overline{Q}) = (0, 1)$ and $(1, 0)$, so the latch stores a bit; $S = 1, R = 0$ has the single stable state $Q = 1$; $S = 0, R = 1$ has the single stable state $Q = 0$; and $S = R = 1$ forces $Q = \overline{Q} = 0$, which is not a valid stored bit. Restricted to inputs with $SR = 0$, the next state is

$$Q(t+1) = S + R'Q, \qquad SR = 0.$$

The NAND latch, $Q = (S' \cdot \overline{Q})'$ and $\overline{Q} = (R' \cdot Q)'$, has active-low inputs: $S' = R' = 1$ holds, $S' = 0$ sets, $R' = 0$ resets, and $S' = R' = 0$ forces $Q = \overline{Q} = 1$.

**Proof.** A stable state is a pair $(Q, \overline{Q})$ that reproduces itself through both gates. A NOR output is 0 as soon as one input is 1. If $S = 1$, then $\overline{Q} = 0$ whatever $Q$ is, and $Q = (R + 0)' = R'$; with $R = 0$ that is $Q = 1$, the set state, and with $R = 1$ it is $Q = 0 = \overline{Q}$. By symmetry $R = 1, S = 0$ forces $Q = 0, \overline{Q} = 1$. With $S = R = 0$ the gates become inverters, $Q = \overline{Q}'$ and $\overline{Q} = Q'$, which any complementary pair satisfies, so both $(0,1)$ and $(1,0)$ are stable and the latch keeps whichever it holds. That is the hold row $Q(t+1) = Q$. Collecting the rows, $Q(t+1)$ is $Q$ for $SR = 00$, 1 for $10$ and 0 for $01$. Put these in a K-map on $S, R, Q$ and treat $SR = 11$ as a don't-care. The 1s are $SR'Q'$, $SR'Q$ and $S'R'Q$. The four cells with $S = 1$ (two 1s and two don't-cares) form the term $S$, and the pair $S'R'Q$, $SR'Q$ forms $R'Q$. So $Q(t+1) = S + R'Q$. The don't-care is legitimate only because the input is excluded, which is why $SR = 0$ is part of the equation. The exclusion is forced: from $S = R = 1$ both outputs are 0; if both inputs then fall to 0 together, each NOR sees $0, 0$ and both outputs rise toward 1, then both fall again, and the final state is decided by which gate is faster or the latch oscillates. The NAND case is the dual: a NAND output is 1 as soon as one input is 0, so each argument goes through with 0 and 1 exchanged on the inputs.

A gated latch ANDs $S$ and $R$ with an enable before the NOR pair. While the enable is 1 the latch is transparent and follows its inputs; a flip-flop changes only at a clock edge (next sections).

**GATE use.** MCQs ask which input is not allowed (NOR $S = R = 1$, NAND $S' = R' = 0$), or give a NAND latch and ask for its state after a sequence of active-low inputs. The trap is reading the NAND latch's inputs as active-high, and treating $S = R = 1$ as a don't-care in an analysis question rather than as an input the designer excludes.

**Check.** An enumeration of all 16 combinations of $(S, R, Q, \overline{Q})$ for both gate types found exactly the stable states listed above: two for the hold input, one each for set and reset, $(0, 0)$ for NOR $S = R = 1$ and $(1, 1)$ for NAND $S' = R' = 0$. $S + R'Q$ matched the table on all 6 rows with $SR = 0$.

## Characteristic equations and excitation tables of JK, D and T flip-flops
<!-- topics: dl-sequential-circuits.jk-flipflop, dl-sequential-circuits.d-and-t-flipflops, dl-sequential-circuits.excitation-tables -->

**Claim.** For edge-triggered flip-flops, with $Q$ the state before the active edge and $Q(t+1)$ the state after it,

$$Q(t+1) = JQ' + K'Q, \qquad Q(t+1) = D, \qquad Q(t+1) = T \oplus Q.$$

Read backwards, these give the excitation tables (X is a don't-care):

| $Q \to Q(t+1)$ | SR | JK | D | T |
|---|---|---|---|---|
| $0 \to 0$ | $S = 0, R = X$ | $J = 0, K = X$ | 0 | 0 |
| $0 \to 1$ | $S = 1, R = 0$ | $J = 1, K = X$ | 1 | 1 |
| $1 \to 0$ | $S = 0, R = 1$ | $J = X, K = 1$ | 0 | 1 |
| $1 \to 1$ | $S = X, R = 0$ | $J = X, K = 0$ | 1 | 0 |

**Derivation.** The JK flip-flop is defined by its function table: $JK = 00$ holds, $01$ resets, $10$ sets and $11$ toggles. For $Q = 0$ the next state is 1 exactly when $J = 1$ (set or toggle), and for $Q = 1$ it stays 1 exactly when $K = 0$ (hold or set). So $Q(t+1) = Q'\,J + Q\,K'$, the Shannon expansion on $Q$. With $J = K = 1$ it gives $Q' \cdot 1 + 0 \cdot Q = Q'$, the toggle, and with $J = K = 0$ it gives $Q$. The D flip-flop copies its input at the edge, so $Q(t+1) = D$. The T flip-flop holds for $T = 0$ and toggles for $T = 1$, which is $Q(t+1) = Q$ or $Q'$, that is $T \oplus Q$.

An excitation table lists, for each transition $Q \to Q(t+1)$, every input that produces it. For JK and $Q = 0$ the equation reduces to $Q(t+1) = J$, so $0 \to 0$ needs $J = 0$ and $0 \to 1$ needs $J = 1$, and $K$ does not appear: $K = X$. For $Q = 1$ it reduces to $Q(t+1) = K'$, so $1 \to 1$ needs $K = 0$ and $1 \to 0$ needs $K = 1$, with $J = X$. The same reduction of $S + R'Q$ gives $Q(t+1) = S$ when $Q = 0$ (then $R$ is free, except that $S = 1$ forces $R = 0$ by $SR = 0$) and $Q(t+1) = S + R'$ when $Q = 1$. For D, $D = Q(t+1)$. For T, XOR both sides of $Q(t+1) = T \oplus Q$ with $Q$: $T = Q \oplus Q(t+1)$, so $T = 1$ exactly on the two transitions that change the state.

**GATE use.** The 1-mark MCQ gives a flip-flop, its inputs and $Q$, and asks for $Q(t+1)$; substitute into the equation. Its inverse asks which inputs produce a transition, or uses the excitation table inside a counter design. The trap is writing JK $1 \to 1$ as $J = 1, K = 0$: the correct entry $J = X$ lets a K-map merge more cells, and an option that drops the don't-care is a different minimised expression. A second trap is T: the excitation and characteristic equations are the same XOR, so $T$ depends on the transition, not on $Q(t+1)$ alone.

**Check.** Enumeration of all $(J, K, Q)$ confirmed $JQ' + K'Q$ against the function table, and inverting each characteristic equation over all inputs reproduced the four columns of the table exactly, with SR's $11$ input excluded.

## Level triggering, race-around and the master-slave fix
<!-- topics: dl-sequential-circuits.jk-flipflop, dl-sequential-circuits.latch-vs-flipflop -->

**Claim.** Take a JK circuit built as a gated latch whose $J$ and $K$ inputs are ANDed with $Q'$ and $Q$, enabled while the clock is 1 (level triggered), with propagation delay $t_{pd}$ from input to output and clock pulse width $t_w$. With $J = K = 1$ the output toggles once per $t_{pd}$ for as long as the clock stays high, so if $t_w > t_{pd}$ the final state depends on the ratio $t_w / t_{pd}$ and is not determined. This is the race-around condition. It disappears if $t_w < t_{pd}$ (with the period still longer than $t_{pd}$), or in a master-slave flip-flop, or in an edge-triggered flip-flop. A D or SR flip-flop has no race-around, because its latch inputs are not gated by its own output, so no toggle re-arms them while the clock is high.

**Proof.** The set input of the latch is $J Q'$ and the reset input is $K Q$. With $J = K = 1$ and $Q = 0$ the latch sees set; after $t_{pd}$ the output becomes 1. The gates now compute set $= 1 \cdot 0 = 0$ and reset $= 1 \cdot 1 = 1$, and since the enable is still 1 the latch resets after another $t_{pd}$. Each toggle re-arms the opposite input, so the output keeps alternating with period $2t_{pd}$ until the clock falls; the number of toggles is about $t_w / t_{pd}$, and small variations of either value change its parity. With $t_w < t_{pd}$ the clock falls before the first change can feed back, so exactly one toggle happens, but this needs a pulse narrower than one gate delay, which is impractical to guarantee.

The master-slave flip-flop chains two latches: the master is enabled while the clock is 1, the slave while it is 0, and $J$, $K$ are gated by the slave's output $Q$. While the clock is 1 the master responds but the slave is closed, so $Q$, and with it the master's gating, is frozen; the master changes at most once. When the clock falls the master closes and the slave copies it, so $Q$ changes once per clock cycle, on the falling edge. The same freezing has a side effect: if $Q = 0$ the master can only be set, so a short 1 on $J$ while the clock is high sets the master and the change cannot be undone before the clock falls (ones catching). An edge-triggered flip-flop samples only in a window around the edge and has neither problem. In D and SR circuits the latch inputs do not include $Q$, so no feedback loop exists to re-trigger them.

**GATE use.** MCQs ask when race-around occurs (level-triggered JK, $J = K = 1$, $t_w > t_{pd}$) and how to remove it (master-slave or edge triggering, or $t_{pd} > t_w$). The trap is choosing an option that blames SR or D flip-flops, or saying the condition is $t_w < t_{pd}$.

**Check.** A script stepped the latch in units of $t_{pd}$ from $Q = 0$ with $J = K = 1$, a change started while the clock is high landing $t_{pd}$ later. A pulse of $0.5\,t_{pd}$ gives one toggle and $Q = 1$; $2.5\,t_{pd}$ gives 3 toggles and $Q = 1$; $3.5\,t_{pd}$ gives 4 toggles and $Q = 0$, so the result flips with the pulse width. The master-slave model, with $Q$ frozen while the master is open, gave $1, 0, 1, 0, 1, 0$ over six clocks, one toggle each.

## Converting one flip-flop type into another
<!-- topics: dl-sequential-circuits.ff-conversion, dl-sequential-circuits.excitation-tables -->

**Claim.** To make an available flip-flop Y behave as a target type X, drive Y's inputs with a function of X's inputs and $Q$ chosen, row by row, from Y's excitation table for the transition that X would make. The standard results are:

- T acting as JK: $T = JQ' + KQ$; D acting as JK: $D = JQ' + K'Q$; SR acting as JK: $S = JQ'$, $R = KQ$.
- JK acting as T: $J = K = T$; JK acting as D: $J = D$, $K = D'$.
- T acting as D: $T = D \oplus Q$; D acting as T: $D = T \oplus Q$.

**Derivation.** Y must produce, for every combination of X's inputs and $Q$, the next state $Q(t+1)$ given by X's characteristic equation. For each such row, Y's excitation table lists the inputs that cause $Q \to Q(t+1)$, so fill those in and minimise. Two shortcuts give the closed forms. For a D flip-flop the excitation is the next state itself, so $D$ equals X's characteristic expression: $D = JQ' + K'Q$ and $D = T \oplus Q$. For a T flip-flop the excitation is $Q \oplus Q(t+1)$. With X = JK, $T = Q \oplus (JQ' + K'Q)$. Split on $Q$: for $Q = 0$ this is $J$, for $Q = 1$ it is $1 \oplus K' = K$, so $T = JQ' + KQ$; T must be 1 exactly when the JK output would change. With X = D, $T = Q \oplus D$.

For Y = JK the excitation table has don't-cares, which make the answer simpler than the general formula. JK acting as T: rows with $Q = 0$ need $J = Q(t+1) = T$ and leave $K$ free, rows with $Q = 1$ need $K = Q(t+1)' = T$ and leave $J$ free; choosing $J = K = T$ satisfies every row, and the JK equation becomes $TQ' + T'Q = T \oplus Q$. JK acting as D: rows with $Q = 0$ need $J = D$, rows with $Q = 1$ need $K = D'$; $J = D$, $K = D'$ makes the JK equation $DQ' + DQ = D$. For SR acting as JK, $Q = 0$ rows need $S = J$, $R = 0$ or X, and $Q = 1$ rows need $R = K$, $S = 0$ or X; $S = JQ'$, $R = KQ$ meets both and never has $S = R = 1$, because $Q'Q = 0$.

**GATE use.** The question names the two types and offers expressions. The trap is the direction of the conversion: $J = K = T$ turns a JK into a T flip-flop, while turning a T flip-flop into a JK needs $T = JQ' + KQ$; tying $T$ to $J$ alone fails whenever $K$ differs from $J$. Likewise $D = JQ' + K'Q$ is the input for a D flip-flop acting as JK, and the reverse needs only $J = D$, $K = D'$.

**Check.** A script substituted every listed input expression into the driving flip-flop's characteristic equation and compared the result with the target's equation over all input and state combinations: all 8 JK rows for each of the three JK targets, all 4 rows for the D and T targets, with no failure. Driving a T flip-flop with $T = J$ disagrees with the JK equation on 2 of the 8 rows.

## Setup and hold constraints and the maximum clock frequency
<!-- topics: dl-sequential-circuits.timing -->

**Claim.** Consider a path from a launching flip-flop, through combinational logic, to a capturing flip-flop, both on the same clock with no skew. Let $t_{pd}$ be the clock-to-output delay and $t_{\text{comb}}$ the logic delay (maximum values), $t_{pd,\min}$ and $t_{\text{comb},\min}$ the minimum values, and $t_{\text{setup}}$, $t_{\text{hold}}$ the capturing flip-flop's setup and hold times. The circuit captures correct data on every edge if and only if, on every path,

$$T \ge t_{pd} + t_{\text{comb}} + t_{\text{setup}}, \qquad t_{pd,\min} + t_{\text{comb},\min} \ge t_{\text{hold}},$$

so $T_{\min}$ is the largest left-hand total over all paths and $f_{\max} = 1/T_{\min}$. The hold condition contains no $T$.

**Derivation.** Put a clock edge at time 0 and the next at time $T$. The data launched at 0 appears at the launching flip-flop's output by $t_{pd}$ and at the capturing flip-flop's input by $t_{pd} + t_{\text{comb}}$ at the latest. The capturing flip-flop samples correctly at $T$ only if its input has been stable for $t_{\text{setup}}$ before $T$, that is $t_{pd} + t_{\text{comb}} \le T - t_{\text{setup}}$, the first inequality. The setup condition must hold for the slowest path, so maximum delays enter. For hold, look at the same edge at time 0: the capturing flip-flop is still sampling the old value, which must stay unchanged until $t_{\text{hold}}$ after the edge. The earliest the new value can arrive is $t_{pd,\min} + t_{\text{comb},\min}$, so the old value is safe if this is at least $t_{\text{hold}}$. Both events are measured from the same edge, so $T$ cancels: lowering the frequency fixes a setup violation but never a hold violation, which needs more delay on the short path. With a skew $\delta$ by which the capturing clock lags, the setup bound becomes $T \ge t_{pd} + t_{\text{comb}} + t_{\text{setup}} - \delta$ and the hold bound $t_{pd,\min} + t_{\text{comb},\min} \ge t_{\text{hold}} + \delta$.

**GATE use.** NAT questions give delays for a synchronous counter or a register-logic-register path and ask for $f_{\max}$; add the three delays on the slowest path and invert, with $1/(1\ \text{ns}) = 1000$ MHz. The traps are using $n \cdot t_{pd}$, which is the ripple formula, adding the hold time into the period, and picking the fastest path instead of the slowest.

**Check.** With $t_{pd} = 10$ ns, $t_{\text{comb}} = 15$ ns and $t_{\text{setup}} = 5$ ns, $T_{\min} = 30$ ns and $f_{\max} = 33.3$ MHz. With $t_{pd,\min} = 2$ ns, $t_{\text{comb},\min} = 1$ ns and $t_{\text{hold}} = 4$ ns the hold slack is $3 - 4 = -1$ ns, a violation at every frequency.

## Ripple counters: count direction and settling time
<!-- topics: dl-sequential-circuits.ripple-counters, dl-sequential-circuits.timing -->

**Claim.** Chain $n$ toggling flip-flops (T = 1 or J = K = 1): the external clock drives stage 0 and the output of stage $i - 1$ clocks stage $i$. With negative-edge flip-flops clocked by $Q_{i-1}$ the count $Q_{n-1} \dots Q_0$ goes up by 1 per clock modulo $2^n$; clocked by $Q'_{i-1}$ it goes down. For positive-edge flip-flops the two cases swap. The last stage settles $n\,t_{pd}$ after the clock edge in the worst case, so a counter whose every state must be valid before the next edge has

$$t_{\text{settle}} = n\,t_{pd}, \qquad f_{\max} = \frac{1}{n\,t_{pd}},$$

with the delay of any decoding gate added when the decoded output must also be valid within the period.

**Proof.** Adding 1 to a binary number flips bit 0 always, and flips bit $i$ exactly when bits $0, \dots, i - 1$ are all 1, which is exactly when bit $i - 1$ flips from 1 to 0 (a carry leaves bit $i - 1$). Stage 0 toggles on every clock, like bit 0. A negative-edge stage $i$ clocked by $Q_{i-1}$ toggles exactly when $Q_{i-1}$ falls from 1 to 0. By induction on $i$, stage $i$ toggles exactly when bit $i$ of the increment flips, so the counter adds 1. Subtracting 1 flips bit $i$ exactly when bit $i - 1$ goes from 0 to 1 (a borrow), and that is a falling edge of $Q'_{i-1}$, so the $Q'$-clocked counter counts down. A positive-edge stage clocked by $Q_{i-1}$ toggles on a rising $Q_{i-1}$, which is the borrow condition, so it counts down.

For the delay, stage $i$ cannot start toggling before stage $i - 1$'s output has changed, so the changes ripple: stage $i$ settles $(i + 1) t_{pd}$ after the clock edge. The worst case is a transition in which every stage toggles, such as $011\dots1 \to 100\dots0$ or $11\dots1 \to 00\dots0$, and then the last stage settles at $n\,t_{pd}$. Between the edge and $n\,t_{pd}$ the outputs pass through intermediate wrong counts, so a decoder reading them must wait the full time plus its own delay.

**GATE use.** The 1- or 2-mark NAT gives $n$ and $t_{pd}$ and asks for $f_{\max}$, or gives a MOD-$k$ ripple counter with reset by a NAND gate and asks for the maximum clock, which then includes the gate delay. MCQs ask whether the counter counts up or down; check edge polarity and whether $Q$ or $Q'$ is fed forward. The trap is using $n\,t_{pd}$ for a synchronous counter.

**Check.** An event simulation of a 3-stage chain from 000 gave $1, 2, \dots, 7, 0$ for negative-edge with $Q$ feeding forward and for positive-edge with $Q'$, and $7, 6, \dots, 0$ for the other two. For $n = 4$ and $t_{pd} = 10$ ns, $t_{\text{settle}} = 40$ ns and $f_{\max} = 25$ MHz; with a 5 ns decoding gate, 45 ns and 22.2 MHz.

## Synchronous binary counters and MOD-k design
<!-- topics: dl-sequential-circuits.synchronous-counters, dl-sequential-circuits.fsm-design -->

**Claim.** (a) $n$ flip-flops have $N_{\max} = 2^n$ states, so a MOD-$k$ counter in binary encoding needs $n = \lceil \log_2 k \rceil$ flip-flops and leaves $2^n - k$ states unused. (b) A synchronous binary up counter with T flip-flops has $T_0 = 1$ and $T_i = Q_0 Q_1 \cdots Q_{i-1}$ (with JK flip-flops, $J_i = K_i = T_i$). (c) For any count sequence, writing each flip-flop's input from its excitation table for every transition, with unused states as don't-cares, yields a correct design for the used states; it is self-starting only if every unused state reaches the sequence.

**Proof.** (a) The state is the tuple of $n$ stored bits, so there are $2^n$ states, and $k$ states need $2^n \ge k$, so $n \ge \log_2 k$; the least integer is $\lceil \log_2 k \rceil$. (b) As in the ripple proof, $x + 1$ flips bit $i$ exactly when all lower bits are 1. A T flip-flop flips exactly when $T = 1$, so $T_i$ must equal the AND of the lower bits, and all flip-flops share the clock. (c) Each row of the table forces the flip-flop inputs only through the excitation table, so any expression that agrees with those entries makes each used state go to its successor. The unused rows were left free, and the minimiser picks values for them; whatever it picked determines where an unused state goes, which can be a loop outside the sequence (lock-out). After minimising, compute the next state of each unused state from the chosen expressions.

The speed follows from the timing section: all flip-flops switch together, so $T_{\min} = t_{pd} + t_{\text{comb}} + t_{\text{setup}}$, and $n$ enters only through $t_{\text{comb}}$, for instance an AND chain for $T_{n-1}$.

**GATE use.** NATs ask for the number of flip-flops of a MOD-$k$ counter ($k = 10$ needs 4, with 6 unused). MCQs give a sequence and ask for a minimised input, or name the up counter and expect $T_i = $ AND of the lower bits. The traps are dropping the don't-cares and then disagreeing with every option, and assuming a design is self-starting without checking the unused states.

**Check.** A simulation of $T_i = Q_0 \cdots Q_{i-1}$ counted $0, 1, \dots, 2^n - 1, 0$ for every $n$ from 1 to 6. For MOD-6 ($000$ to $101$) with T flip-flops the tables give $T_0 = 1$, $T_1 = Q_2'Q_0$ and $T_2 = Q_2Q_0 + Q_1Q_0$; the script confirmed the sequence $0 \to 1 \to \dots \to 5 \to 0$, and found $110 \to 111 \to 010$, so this choice of don't-cares is self-starting. A 4-bit synchronous counter with $t_{pd} = 10$ ns, two 5 ns AND gates in the chain and $t_{\text{setup}} = 5$ ns runs at $1/(25\ \text{ns}) = 40$ MHz, against 25 MHz for the 4-bit ripple counter with the same flip-flops.

## Analysing a clocked circuit: the next-state map
<!-- topics: dl-sequential-circuits.circuit-analysis, dl-sequential-circuits.synchronous-counters -->

**Claim.** A synchronous circuit of $n$ flip-flops with no external input is a function $f$ on its $2^n$ states, computed by substituting the present state into each flip-flop's input expressions and then into its characteristic equation. From a start state $s_0$, the states $s_0, f(s_0), f^2(s_0), \dots$ repeat within at most $2^n$ clocks and then cycle forever; the modulus is the length $L$ of that cycle, and for a start state on the cycle the state after $m$ clocks is $f^{m \bmod L}(s_0)$.

**Proof.** The flip-flops sample simultaneously, so the next state depends only on the present one, through the same expressions every clock: this is a function $f$. Among the $2^n + 1$ states $s_0, \dots, s_{2^n}$ two must coincide (pigeonhole), say $s_i = s_j$ with $i < j$ chosen with $j$ least. Then $s_{i+1} = f(s_i) = f(s_j) = s_{j+1}$, and by induction the sequence from $i$ on repeats with period $L = j - i$. The states before $i$ form a tail that is never revisited. If $s_0$ is on the cycle, $i = 0$, and $s_m = s_{m \bmod L}$ because $f^L$ fixes every state of the cycle. A counter is self-starting when every one of the $2^n$ states has the main cycle in its future; checking this means computing $f$ for the unused states, which the full next-state table already does.

**GATE use.** This is the most common 2-mark question: a figure of D, T or JK flip-flops with gates between them, a start state, and a request for the sequence, the modulus, or the state after $m$ clocks. Write each input as an expression in the present bits, fill all $2^n$ rows, then walk. The traps are reading the state with the MSB at the wrong end, applying the new value of one flip-flop when computing another flip-flop's input in the same clock (all inputs use the old state), and counting tail states into the modulus.

**Check.** For $D_2 = Q_1$, $D_1 = Q_0$, $D_0 = (Q_2 + Q_1)'$ with state $Q_2Q_1Q_0$, the script computed the table and the walk $000 \to 001 \to 011 \to 110 \to 100 \to 000$, modulus 5. The unused states go $010 \to 100$, $101 \to 010$ and $111 \to 110$, all into the cycle, so the circuit is self-starting. After 23 clocks from 000 it is in $f^{3}(000) = 110$, since $23 \bmod 5 = 3$; direct stepping gave the same state.

## Ring and Johnson counter moduli
<!-- topics: dl-sequential-circuits.ring-johnson, dl-sequential-circuits.shift-registers -->

**Claim.** An $n$-bit ring counter (a circular shift register) started from a one-hot state has modulus $n$. An $n$-bit Johnson counter (twisted ring: the complement of the last stage feeds the first) started from $0\dots0$ has modulus $2n$ and leaves $2^n - 2n$ codes unused. Both next-state maps are bijections, so the unused states lie on cycles of their own and never enter the main sequence: neither counter is self-starting without extra logic. A MOD-$k$ count needs $k$ flip-flops as a ring and $k/2$ as a Johnson counter for even $k$.

**Proof.** Ring: one clock rotates the bit string by one place, so $n$ clocks restore every state, and every cycle length divides $n$. The one-hot states $10\dots0, 010\dots0, \dots, 0\dots01$ are $n$ distinct rotations of each other, so the one-hot cycle has length exactly $n$. Johnson: each clock shifts every bit one place and puts the complement of the bit leaving the far end into the first stage. After $n$ clocks every original bit has been shifted out once and re-entered once, complemented, in its original position, so $f^n(x) = \overline{x}$ and $f^{2n}(x) = x$: every cycle length divides $2n$. From $0\dots0$ the first $n$ clocks feed in 1s, giving $1 0\dots0, 110\dots0, \dots, 1\dots1$, and the next $n$ clocks feed in 0s, giving $01\dots1, \dots, 0\dots01, 0\dots0$. These are the strings $1^a0^{n-a}$ and $0^a1^{n-a}$ for $a$ from 1 to $n$, $2n$ distinct strings, so the main cycle has length $2n$ and the remaining $2^n - 2n$ codes are unused. Both maps are invertible (the previous state is recovered by shifting back and, for Johnson, complementing the bit that re-enters), so each state has exactly one predecessor and the state graph is a union of disjoint cycles: no unused state can lead into the main cycle. The flip-flop counts follow from the moduli, $n$ for a ring and $2n$ for Johnson.

**GATE use.** NAT questions ask for the modulus or the number of unused states. A Johnson counter with $n$ flip-flops has $2n$ states, not $2^n$; for $n = 4$ that is 8 used and 8 unused, for $n = 5$ it is 10 and 22. MCQs ask which counter needs the fewest flip-flops for a given modulus (binary, then Johnson, then ring), or why a decoded Johnson counter needs only 2-input gates (each of its states is identified by one adjacent pair of bits).

**Check.** Enumerating the state graphs for $n = 3$ to 6 gave Johnson cycle lengths $\{2, 6\}$, $\{8, 8\}$, $\{2, 10, 10, 10\}$ and $\{4, 12 \times 5\}$, every one dividing $2n$ with a main cycle of $2n$; the ring graphs had all cycle lengths dividing $n$, with the one-hot cycle of length $n$. The 4-bit Johnson sequence from 0000 was $0000, 1000, 1100, 1110, 1111, 0111, 0011, 0001$.

## Shift register contents and maximal-length LFSRs
<!-- topics: dl-sequential-circuits.shift-registers -->

**Claim.** (a) In an $n$-bit right-shift register whose serial input enters $Q_{n-1}$, after inputs $b_1, \dots, b_m$ with $m \ge n$, stage $Q_{n-1-j}$ holds $b_{m-j}$ for $j = 0, \dots, n-1$: the newest bit is in $Q_{n-1}$ and the oldest of the last $n$ bits is in $Q_0$. (b) A linear feedback shift register, whose input is the XOR of some stages including the stage that is shifted out, has period at most

$$P_{\max} = 2^n - 1,$$

and the bound is reached for suitable taps.

**Proof.** (a) Induction on $m$. Each clock moves $Q_{i}$ into $Q_{i-1}$ and loads the new bit into $Q_{n-1}$. If after $m - 1$ clocks $Q_{n-1-j} = b_{m-1-j}$, then after clock $m$, $Q_{n-1} = b_m$ and $Q_{n-1-j} = $ old $Q_{n-j} = b_{m-j}$. The base case $m = n$ follows from the same step started at an empty register. (b) The next state is $s' = A s$ over $\mathrm{GF}(2)$, with $A$ a shift plus one row of XOR taps, so the map is linear and $A \cdot 0 = 0$: the all-zero state is fixed. Because the stage being shifted out is one of the taps, it can be recovered from the new input bit and the other tapped stages, so the map is a bijection. A bijection on a finite set splits it into cycles, and the zero state is a cycle of length 1, so every other cycle lies inside the $2^n - 1$ nonzero states, which bounds the period. The bound is reached exactly when the feedback polynomial is primitive (Golomb; also in standard coding-theory texts), and primitive polynomials exist for every $n$.

**GATE use.** The 1-mark MCQ feeds a bit pattern into a SIPO register and asks for its contents after $k$ clocks, or asks for the output after shifting a PIPO register. Fix the direction and the end that takes the serial input, then write the register after each clock. The trap is reversing the reading order of the result. LFSR questions ask for the maximum period; the answer is $2^n - 1$, because the all-zero state is excluded.

**Check.** Feeding $1, 1, 0, 1$ into a 4-bit right-shift register entering at $Q_3$ gave $1000, 1100, 0110, 1011$, so $Q_3Q_2Q_1Q_0 = 1011$. An exhaustive search over all tap sets that include the shifted-out stage found a longest period of exactly $2^n - 1$ for every $n$ from 2 to 7. For $n = 4$, shifting left with feedback $Q_3 \oplus Q_2$ into $Q_0$ has period 15 from 0001; taps $Q_3, Q_1$ give only 6, and 0000 is fixed.

## Sequence detectors: k Mealy states, k+1 Moore states
<!-- topics: dl-sequential-circuits.fsm-design, dl-sequential-circuits.mealy-moore -->

**Claim.** Let $p = p_1 \dots p_k$ be a fixed binary pattern. The minimal Mealy machine that outputs 1 on the clock in which an occurrence of $p$ completes has exactly $k$ states, and the minimal Moore machine has exactly $k + 1$, both with overlapping and with non-overlapping detection:

$$N_{\text{Mealy}} = k, \qquad N_{\text{Moore}} = k + 1.$$

State $i$ means "the longest suffix of the input that is a prefix of $p$ has length $i$". From state $i$ on input $c$ the machine goes to the length of the longest prefix of $p$ that is a suffix of $p_1 \dots p_i c$. On a full match, an overlapping detector continues in the state of the longest proper border of $p$ (prefix that is also a suffix) and a non-overlapping one in state 0. In general a Moore machine can be turned into an equivalent Mealy machine with the same states, and a Mealy machine with $\lvert S \rvert$ states and $\lvert O \rvert$ outputs into a Moore machine with at most $\lvert S \rvert \cdot \lvert O \rvert$ states, whose outputs lag one clock.

**Proof.** Correctness: suppose after input $w$ the state is $i$, the longest suffix of $w$ that is a prefix of $p$. Any suffix of $wc$ that is a prefix of $p$ of length $L \ge 1$ is $u c$ with $u$ a suffix of $w$ and a prefix of $p$ of length $L - 1$, so $L - 1 \le i$ and $uc$ is a suffix of $p_1 \dots p_i c$. So the longest such suffix of $wc$ is computed from $i$ and $c$ alone, and the transition rule preserves the invariant. An occurrence of $p$ ends at the current input exactly when the new value is $k$. The Mealy machine emits 1 on that edge and moves to the border state (overlapping) or 0 (non-overlapping), so it never needs state $k$ and uses states $0, \dots, k-1$. A Moore machine must put the 1 in a state, so it needs state $k$ as well.

Minimality: take states $i < j$ below $k$. From $j$, the input $p_{j+1} \dots p_k$ completes a match and the last output is 1. From $i$ the same $k - j$ inputs would complete a match only if $p_1 \dots p_j$ were a suffix of the input so far, which would make the state at least $j > i$. So the output sequences differ and the states are distinguishable; for non-overlapping detection apply the argument to the input since the last match. In the Moore machine state $k$ is the only one with output 1, so all $k + 1$ states are distinct.

Conversion: a Moore machine with output $\lambda(s)$ becomes Mealy by putting $\lambda(\delta(s, a))$ on each edge $s \to \delta(s, a)$, and the output then appears in the same clock as the input. In the other direction, split each Mealy state $s$ into copies $(s, o)$, one for each output $o$ on an edge entering $s$; the copy outputs $o$, and from $(s, o)$ on input $a$ go to $(\delta(s, a), \lambda(s, a))$. The start state also gets a copy with an arbitrary output, since that output is shown before any input, and this copy is the Moore start state; it is needed when no edge enters the Mealy start state. The Moore output after each input equals the Mealy output on that input, but is visible only once the state has been entered, one clock later.

**GATE use.** NATs ask for the minimum number of states of a Mealy or Moore detector for a pattern such as 1011, or MCQs show a partial diagram and ask where an edge must go. The traps are giving Moore the same count as Mealy, sending a match edge to state 0 in overlapping detection, and putting the Moore output on an edge. For 1011 overlapping, the border of 1011 is 1, so the Mealy match edge from S3 on input 1 goes to S1; the Moore machine has S0 to S4 with S3 on 1 going to S4 (output 1), S4 on 0 going to S2 and S4 on 1 going to S1, and S3 on 0 going to S2 with output 0.

**Check.** For every binary pattern of length 1 to 7, the script built all four detectors (Mealy and Moore, overlapping and not) by the transition rule and minimised each by partition refinement: always $k$ and $k + 1$ states. The 1011 Mealy detector agreed with a direct suffix check on 2,000 random bits, and its Moore transition table matched the one stated above. Splitting a 2-state Mealy machine with outputs $\{0, 1\}$ gave 3 Moore states, within $2 \cdot 2$, with the same output sequence on 200 random words.

## State minimisation by partition refinement
<!-- topics: dl-sequential-circuits.state-minimization, dl-sequential-circuits.mealy-moore -->

**Claim.** Two states of a completely specified machine are equivalent when every input sequence produces the same output sequence from both. Let $P_0$ group states by their outputs (per input for Mealy, per state for Moore), and let $P_{m+1}$ split each block of $P_m$ so that two states stay together only if, for every input, their successors lie in the same block of $P_m$. Then two states share a block of $P_m$ exactly when they give the same outputs on every input sequence of length at most $m + 1$ (for Moore, measure the length in outputs, one more than the inputs), the first $P_m$ with $P_{m+1} = P_m$ is the equivalence partition, this happens after at most $N - 1$ refinement rounds for $N$ states, and the minimal machine has one state per block.

**Proof.** Induction on $m$: states $s, t$ produce the same outputs on all sequences of length $m + 2$ exactly when they give the same output on the first input and, for every input $a$, their successors agree on all sequences of length $m + 1$. The first condition is $P_0$, the second is "successors in the same block of $P_m$", so the rule produces $(m+1)$-equivalence from $m$-equivalence. If $P_{m+1} = P_m$, the rule applied to the same partition gives the same result, so $P_{m+2} = P_{m+1}$ and the partition never changes again; states in one block then agree on sequences of every length, and states in different blocks are separated by some sequence. Each round before stabilising splits at least one block, the number of blocks cannot exceed $N$, and $P_0$ has at least one block, so there are at most $N - 1$ splitting rounds. The quotient machine, with blocks as states, is well defined because equivalent states have equivalent successors and equal outputs, and it is minimal because its states are pairwise distinguishable, so no machine with fewer states can reproduce all of their behaviours (two would have to share a state). The implication-table method computes the same relation by marking distinguishable pairs.

**GATE use.** NATs give a state table and ask for the minimum number of states; run the refinement and count blocks. The traps are refusing to merge states whose rows look different only by naming (states with rows $(E, E)$ and $(C, E)$ can still be equivalent), stopping after the first round, and merging states of equal output whose successors split later.

**Check.** For the Mealy table A: $(E, E)$, B: $(B, F)$, C: $(E, E)$, D: $(E, B)$, E: $(C, E)$, F: $(B, D)$, listing successors for inputs 0 and 1, where every output is 0 except F on input 1, the refinement gives $P_0 = \{A, B, C, D, E\}, \{F\}$; $P_1$ splits off B, the only one with a successor in $\{F\}$; $P_2$ splits off D, whose 1-successor is B; and $P_3 = P_2$. The result is 4 states, $\{A, C, E\}, \{B\}, \{D\}, \{F\}$, which a brute-force comparison of all input words up to length 6 confirmed.
