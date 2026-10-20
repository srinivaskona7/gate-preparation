# Turing machines and undecidability: derivations

## Configurations, moves and the cost of a trace
<!-- topics: toc-turing-machines.tm-model, toc-turing-machines.tm-trace -->

**Claim.** A TM is $M = (Q, \Sigma, \Gamma, \delta, q_0, q_{acc}, q_{rej})$ with $\sqcup \in \Gamma \setminus \Sigma$ and $\delta : Q \times \Gamma \to Q \times \Gamma \times \{L, R\}$. A configuration is a triple (state, tape contents, head position), and one move maps a configuration to exactly one successor, so a deterministic run is a single sequence $c_0, c_1, c_2, \dots$ that either reaches a halting state or goes on for ever. A move count counts transitions applied, and the transition that enters the halting state is one of them. For the binary increment machine of the chapter ($q_0$ scans right over 0 and 1, turns left on $\sqcup$ into $q_1$; $q_1$ writes 0 over 1 and moves left, and on 0 or $\sqcup$ writes 1 and enters $q_h$), started on the leftmost symbol of $w$ with $\lvert w \rvert = n$ and $t$ trailing 1s, the run makes exactly

$$n + t + 2$$

moves and leaves the binary numeral of $\mathrm{val}(w) + 1$ on the tape.

**Proof.** Because $\delta$ is a function, a configuration has at most one successor; if $\delta$ is undefined on the current (state, symbol) pair the run stops without entering $q_{acc}$, which counts as not accepting. A run therefore has three possible outcomes: it enters $q_{acc}$, it enters $q_{rej}$ (or stops on an undefined pair), or it never halts. Only the first puts $w$ in $L(M)$; looping is not rejecting, and a machine for which the third outcome never occurs is a decider.

For the increment machine, phase 1 is $q_0$: the head starts on cell 0 and each move goes one cell right without changing the tape, so after $n$ moves the head is on the blank in cell $n$. Move $n + 1$ reads that blank, writes it back, enters $q_1$ and steps onto cell $n - 1$, the last input symbol. Phase 2 has the invariant: in $q_1$ with the head on cell $i$, every cell to the right of $i$ inside the input holds 0 and was a 1 of the trailing block. Each 1 read in $q_1$ becomes 0 and the head moves left, one move per trailing 1, so $t$ moves. The head then reads either the 0 in cell $n - t - 1$ (when $t < n$) or the blank in cell $-1$ (when $t = n$); one more move writes 1 and enters $q_h$. Total $n + 1 + t + 1$. On the value: $w = u\,0\,1^t$ has $\mathrm{val}(w) = 2^{t+1}\mathrm{val}(u) + 2^t - 1$, and the output $u\,1\,0^t$ has value $2^{t+1}\mathrm{val}(u) + 2^t$, one more; for $w = 1^n$ the output is $1\,0^n = 2^n = (2^n - 1) + 1$.

**GATE use.** Tracing NATs ask for the number of moves, the final tape or the function computed. The traps are forgetting move $n + 1$ (the step back off the trailing blank), forgetting the final move into $q_h$, and moving the head before writing the cell. In MCQs on the model, a machine that loops on $w$ has not rejected $w$.

**Check.** On $w = 10111$ ($n = 5$, $t = 3$) the formula gives $5 + 3 + 2 = 10$ moves and the tape ends as $11000$, so $23 \mapsto 24$. On $111$ the machine makes $3 + 3 + 2 = 8$ moves and leaves $1000$. A script ran the machine on every binary string of length 1 to 10 and confirmed both the move count $n + t + 2$ and the value $\mathrm{val}(w) + 1$ in all 2,046 cases.

## TM variants recognise the same languages; only time changes
<!-- topics: toc-turing-machines.tm-variants -->

**Claim.** A $k$-tape TM that halts within $t(n) \ge n$ moves is simulated by a single-tape TM in $O(t(n)^2)$ moves. A non-deterministic TM whose branches all halt within $t(n)$ moves, with at most $b$ choices per move, is simulated by a deterministic TM in $2^{O(t(n))}$ moves, accepting exactly when some branch accepts. A PDA with two stacks simulates a TM step for step. Hence multi-tape, non-deterministic, two-way infinite, stay-option and two-stack machines recognise exactly the RE languages (and decide exactly the recursive ones); a one-stack PDA and an LBA do not.

**Proof.** Multi-tape (Sipser, Theorem 3.13). Store the $k$ tapes on $k$ tracks of one tape, using the alphabet $(\Gamma \times \{\cdot, \hat{}\})^k$ where the hat marks each simulated head. After $t$ moves each simulated tape has used at most $n + t$ cells, so the used portion of the single tape has length $O(n + t)$. To simulate one move, sweep left to right recording in the finite control the $k$ marked symbols (finitely many possibilities, so the control can hold them), apply the $k$-tape transition, and sweep back writing the new symbols and shifting each hat one track cell. Each sweep is $O(n + t)$, so $t$ moves cost $O(t(n + t)) = O(t^2)$ when $t \ge n$.

Non-determinism (Sipser, Theorem 3.16). The computation tree has branching at most $b$ and depth at most $t$, so it has at most $\sum_{i=0}^{t} b^i = \frac{b^{t+1} - 1}{b - 1}$ nodes. A deterministic machine visits the nodes breadth first, naming each node by its string of choices, and replays the run from the start along that string, $O(t)$ moves per node. Breadth first matters: depth first can enter an infinite branch and miss an accepting one. The total is $O(t\, b^{t+1}) = 2^{O(t)}$, and the simulation accepts exactly when it meets an accepting node.

Two stacks. Keep the cells left of the head on stack $A$ (top nearest the head) and the head cell and everything to its right on stack $B$ (top is the head cell). Every move first pops the head cell from $B$ to read it. A move that writes $x$ and goes right then pushes $x$ on $A$; a move that writes $x$ and goes left pushes $x$ on $B$ and then moves the top of $A$ onto $B$. An empty stack reads as $\sqcup$. Two counters (Minsky) reach the same power by storing each stack as a number and multiplying or dividing by the alphabet size with a scratch counter, then packing four counters into one counter as $2^a 3^b 5^c 7^d$, with the second counter as scratch for the multiplications and divisions. A two-way infinite tape folds onto a two-track semi-infinite tape; a stay move is replaced by a right move followed by a left move.

A one-stack PDA recognises only CFLs, and $\{a^n b^n c^n\}$ is not context free; an LBA recognises only CSLs, which are a proper subclass of the recursive languages (last section).

**GATE use.** MCQs list models and ask which is strictly weaker than a TM: answer an LBA or a single-stack PDA, never a two-stack PDA, two-counter machine, NTM or multi-tape TM. The trap is confusing speed with power: the exponential NTM simulation changes the time, not the class.

**Check.** With $b = 2$ and $t = 3$ the tree has at most $1 + 2 + 4 + 8 = 15$ nodes, matching $(2^4 - 1)/(2 - 1)$. A script ran the increment machine of the previous section both on a tape and on two stacks, using the rules above, on every binary string of length 1 to 10, and both versions agreed on the move count and the final tape.

## Bounded tape: the configuration count, loop detection and CSL membership
<!-- topics: toc-turing-machines.tm-properties-classification, toc-turing-machines.decidability-table, toc-turing-machines.chomsky-hierarchy -->

**Claim.** A deterministic TM that never leaves a block of $n$ cells has at most

$$C = \lvert Q \rvert \cdot n \cdot \lvert \Gamma \rvert^{n}$$

configurations (state, head position, block contents). If it has not halted after $C$ moves it never halts, so halting, acceptance and every "does it ever do X" question are decidable for such machines. In particular LBA membership, and so membership in a context-sensitive language, is decidable. Step-bounded questions about an arbitrary TM ("within $k$ moves") are decidable too.

**Proof.** A configuration is fixed by choosing one of $\lvert Q \rvert$ states, one of $n$ head positions and one of $\lvert \Gamma \rvert$ symbols for each of the $n$ cells; the choices are independent, so the product rule gives $C$. Suppose the run has made $C$ moves without halting. Then $c_0, c_1, \dots, c_C$ are $C + 1$ configurations from a set of at most $C$, so by pigeonhole $c_i = c_j$ for some $i < j$. Determinism makes the successor of a configuration unique, so $c_{i+1} = c_{j+1}$, and by induction $c_{i+m} = c_{j+m}$ for all $m \ge 0$: the run cycles through $c_i, \dots, c_{j-1}$ for ever. A decider therefore simulates $C$ moves and answers "loops" if no halting state appeared. For an LBA on input $w$ the block is the input with its two endmarkers, $n = \lvert w \rvert + 2$, and $C$ is computable from $w$, so the simulation is a decider. A non-deterministic LBA is handled by searching the configuration graph, which has the same $C$ nodes, for a path from $c_0$ to an accepting configuration.

The same argument works on grammars. A context-sensitive rule never shortens the sentential form, so a derivation of $w$ only passes through forms of length at most $\lvert w \rvert$; over an alphabet of $m$ variables and terminals there are at most $\sum_{k=1}^{\lvert w \rvert} m^k$ of them. A search of this finite graph from the start symbol decides $w \in L(G)$. Step bounds: "does $M$ halt, visit state $q$, or make at least $k$ moves on $w$ within $k$ moves" is answered by simulating $k$ moves, and $k$ may be any computable function of $w$, such as $\lvert w \rvert^2$.

**GATE use.** A 1-mark NAT asks for $C$ given $\lvert Q \rvert$, $\lvert \Gamma \rvert$ and $n$; the trap is $\lvert Q \rvert \cdot \lvert \Gamma \rvert \cdot n$ or $\lvert \Gamma \rvert^n$ alone. MSQs mix bounded questions (decidable) with unbounded ones (undecidable), and decidability tables list CSL membership as decidable while CSL emptiness is not, because emptiness asks about all inputs at once and no single bound covers them.

**Check.** $5 \cdot 4 \cdot 3^4 = 5 \cdot 4 \cdot 81 = 1620$. A script enumerated every machine with 2 working states, a halt state and 2 tape symbols on a 2-cell block ($C = 2 \cdot 2 \cdot 2^2 = 16$), 20,736 machines on all 4 inputs: every halting run took at most 9 moves, at most $C$, and every non-halting run repeated a configuration before move $C + 1$. A second script decided membership in $\{a^n b^n c^n : n \ge 1\}$ for the grammar $S \to abc \mid aSBc$, $cB \to Bc$, $bB \to bb$ by searching forms of length at most $\lvert w \rvert$, and agreed with the definition on all 3,279 strings over $\{a, b, c\}$ of length 1 to 7; for $\lvert w \rvert = 6$ over the 5 symbols the bound is 19,530 forms.

## Recursive equals RE intersected with co-RE
<!-- topics: toc-turing-machines.recursive-re -->

**Claim.** $L$ is recursive if and only if both $L$ and $\overline{L}$ are RE. Hence for every language exactly one of four cases holds: $L$ and $\overline{L}$ both recursive; $L$ RE and $\overline{L}$ not RE; $\overline{L}$ RE and $L$ not RE; neither RE. In particular, if $L$ is RE but not recursive, $\overline{L}$ is not RE.

**Proof.** If a decider $D$ accepts $L$, swapping $q_{acc}$ and $q_{rej}$ in $D$ gives a decider for $\overline{L}$, and a decider is a recogniser, so both are RE. Conversely let $M_1$ recognise $L$ and $M_2$ recognise $\overline{L}$. Build $D$ that on input $w$ alternates single moves of $M_1$ and $M_2$ (two tapes, or one tape with two tracks). Every $w$ lies in exactly one of $L$ and $\overline{L}$, so exactly one of the two machines accepts it after finitely many moves, say $s$; $D$ halts after at most $2s$ single moves, accepting if $M_1$ accepted and rejecting if $M_2$ did. Running $M_1$ to completion first fails, because on $w \notin L$ it may loop and $M_2$ never gets to run. So $D$ is a decider for $L$.

For the four cases: if $L$ and $\overline{L}$ are both RE, both are recursive (the complement of a recursive language is recursive), and if exactly one of them is RE the other is not; the remaining case is that neither is RE. The cases are disjoint and cover everything. The last sentence of the claim is the contrapositive of the main equivalence. An enumerator view gives the same class: $L$ is RE exactly when some machine prints all of $L$ (dovetail a recogniser over all strings and step bounds), and an infinite $L$ is recursive exactly when some machine prints it in canonical order, since membership of $w$ can then be settled by waiting until a string past $w$ in canonical order is printed.

**GATE use.** "$L$ is recursive if and only if ..." has answer "$L$ and $\overline{L}$ are both RE". The common 2-mark use runs backwards: HALT is RE and not recursive, so $\overline{\mathrm{HALT}}$ is not RE. The traps are saying that the complement of an RE language is "also RE" and treating undecidable as not RE.

**Check.** A script modelled $M_1$ as a recogniser for multiples of 3 that accepts $x$ after $x$ moves and loops on other numbers, and $M_2$ as one for the other numbers that accepts after $2x$ moves and loops on multiples of 3. The alternating machine answered correctly on every $x$ from 0 to 199, and on $x = 7$ it halted after 28 single moves, $2 \cdot 14$, rejecting.

## Closure properties of the recursive and RE classes
<!-- topics: toc-turing-machines.closure -->

**Claim.** Recursive languages are closed under union, intersection, complement, difference, concatenation, star, reversal and inverse homomorphism, but not under erasing homomorphism. RE languages are closed under union, intersection, concatenation, star and homomorphism, but not under complement or difference. For $L_1$ recursive and $L_2$ RE, $L_2 - L_1$ is RE, while $L_1 - L_2$ need not be.

**Proof.** Let $D_1, D_2$ be deciders and $M_1, M_2$ recognisers.

Union and intersection. For deciders, run $D_1$ then $D_2$ and combine the answers with or/and; both halt. For recognisers, intersection may run $M_1$ then $M_2$, since a string in $L_1 \cap L_2$ is accepted by both and anything else need not be accepted. Union must alternate moves of $M_1$ and $M_2$ and accept when either accepts: in sequence, $M_1$ could loop on a string that $M_2$ accepts.

Complement and difference. A decider with $q_{acc}$ and $q_{rej}$ swapped decides $\overline{L}$, and $L_1 - L_2 = L_1 \cap \overline{L_2}$. For RE, HALT is RE but $\overline{\mathrm{HALT}} = \Sigma^* - \mathrm{HALT}$ is not RE (previous section), so neither complement nor difference preserves RE.

Concatenation and star. A string $w$ of length $n$ has $n + 1$ splits $w = uv$; a decider for $L_1 L_2$ tries each split with $D_1$ on $u$ and $D_2$ on $v$. For $L^*$, $\varepsilon$ is accepted and a non-empty $w$ has $2^{n-1}$ ordered partitions into non-empty pieces (a cut or no cut at each of the $n - 1$ gaps), each checked with $D$. For recognisers the same search is dovetailed: stage $k$ runs every split or partition for $k$ moves, so a looping branch never blocks an accepting one. Reversal: read the input backwards. Inverse homomorphism: compute $h(w)$ and run the decider on it. Homomorphism for RE: non-deterministically guess $x$ with $h(x) = w$, which for an erasing $h$ can be arbitrarily long, and dovetail the recogniser over all guesses.

Erasing homomorphism fails for recursive languages. Let $M$ recognise a non-recursive $L$ over $\Sigma$, and let $\#, c \notin \Sigma$. The language $K = \{\, w\#c^k : M \text{ accepts } w \text{ within } k \text{ moves} \,\}$ is recursive (simulate $k$ moves), and the homomorphism with $h(a) = a$ on $\Sigma$, $h(\#) = h(c) = \varepsilon$ maps $K$ onto $L$.

Mixed case. $L_2 - L_1 = L_2 \cap \overline{L_1}$ intersects an RE language with a recursive one, so it is RE. Take $L_1 = \Sigma^*$ and $L_2 = \mathrm{HALT}$: $L_1 - L_2 = \overline{\mathrm{HALT}}$ is not RE.

**GATE use.** MSQs fix $L_1$ recursive and $L_2$ RE but not recursive and ask what is necessarily true. Rewrite every difference as an intersection with a complement, and test "necessarily recursive" claims with extreme choices: $L_1 = \emptyset$ makes $L_1 \cup L_2 = L_2$, which is not recursive. The traps are closing RE under complement and running two recognisers in sequence for union.

**Check.** A script counted the ordered partitions of $a^n$ for $n = 1, \dots, 6$ as 1, 2, 4, 8, 16, 32, which is $2^{n-1}$, and checked a partition-based decider for $\{a, ab\}^*$ against the strings generated from $\{a, ab\}$, agreeing on every string over $\{a, b\}$ up to length 8.

## The universal machine and the halting problem
<!-- topics: toc-turing-machines.universal-tm, toc-turing-machines.halting-problem -->

**Claim.** $A_{\mathrm{TM}} = \{\langle M, w \rangle : M \text{ accepts } w\}$ and $\mathrm{HALT} = \{\langle M, w \rangle : M \text{ halts on } w\}$ are RE and not recursive. Their complements are not RE. "Does $M$ halt on $w$ within $k$ moves" is decidable.

**Proof.** RE. A universal machine $U$ keeps $\langle M \rangle$, the current state and $M$'s tape on separate tracks; each simulated move looks up the matching transition in $\langle M \rangle$ and applies it. $U$ accepts when the simulation enters $q_{acc}$ (for $A_{\mathrm{TM}}$) or any halting state (for HALT), and runs for ever otherwise, which a recogniser may do. This is the stored-program idea: one fixed machine runs any program given as data. The Church-Turing thesis, that every effective procedure is a TM, is what lets "no TM decides it" be read as "no algorithm decides it"; it is a thesis about the informal notion of algorithm, so it is not proved.

Not recursive (Sipser, Theorem 4.11, in the halting form). Suppose $H$ decides HALT. Build $D$: on input $\langle M \rangle$, run $H$ on $\langle M, \langle M \rangle \rangle$; if $H$ accepts, loop for ever; if $H$ rejects, halt. $D$ is a TM because $H$ always halts. Run $D$ on $\langle D \rangle$. If $D$ halts on $\langle D \rangle$, then $H$ accepted $\langle D, \langle D \rangle \rangle$, so $D$ loops; if $D$ loops, then $H$ rejected, so $D$ halts. Both cases are contradictory, so $H$ does not exist. This is diagonalisation: listing machines as rows and inputs $\langle M_j \rangle$ as columns with entry "halts", $D$ was built to differ from row $i$ in column $i$, so it is no row. For $A_{\mathrm{TM}}$ the same argument uses "accept" in place of "halt", or reduce: $\mathrm{HALT} \le_m A_{\mathrm{TM}}$ by sending every transition into $q_{rej}$, and every undefined (state, symbol) pair, to $q_{acc}$ instead.

Complements. Both sets are RE and not recursive, so by the RE and co-RE section their complements are not RE. Step bound: simulate $k$ moves with $U$, which halts.

**GATE use.** The 1-mark MCQ on HALT has answer "RE but not recursive", and its companion asks for the class of the complement: not RE. A UTM question tests the stored-program reading. The trap is concluding that HALT is decidable for machines "with finitely many states", which is every TM, or that a step-bounded halting question is undecidable.

**Check.** A script took every 0/1 matrix of size $n \times n$ for $n = 1$ to 4, 66,066 matrices, flipped the diagonal and confirmed the resulting row differed from every row of the matrix, the finite form of the step that makes $D$ differ from every machine.

## Countably many machines, uncountably many languages
<!-- topics: toc-turing-machines.countability -->

**Claim.** The set of Turing machines over a fixed input alphabet is countable, so the RE languages are countable. The set $\mathcal{P}(\Sigma^*)$ of all languages over a non-empty $\Sigma$ is uncountable. So $\lvert \{M\} \rvert = \aleph_0 < 2^{\aleph_0} = \lvert \mathcal{P}(\Sigma^*) \rvert$, and some languages are not RE. The regular languages, the CFLs and the recursive languages are countable as well.

**Proof.** $\Sigma^*$ is countable: list strings in canonical order, by length and then lexicographically. Over $\{0, 1\}$ the string $w$ gets index $2^{\lvert w \rvert} - 1 + \mathrm{val}(w)$, with $\mathrm{val}(\varepsilon) = 0$, because there are $2^{\lvert w \rvert} - 1$ strings shorter than $w$ and $\mathrm{val}(w)$ strings of its length before it; this is a bijection with $\mathbb{N}$. Every TM has a finite description $\langle M \rangle$ over a fixed alphabet (rename states and tape symbols to numbers and write $\delta$ out as a list), so $M \mapsto \langle M \rangle$ maps machines injectively into a countable set, and a language class with one machine per language is countable.

$\mathcal{P}(\Sigma^*)$ is uncountable by Cantor's argument. Suppose $L_1, L_2, \dots$ listed every language, and let $s_1, s_2, \dots$ be the strings in canonical order. Define $L = \{ s_i : s_i \notin L_i \}$. For each $i$, $L$ and $L_i$ differ on $s_i$, so $L$ is not in the list, a contradiction. Writing each language as its infinite 0/1 characteristic sequence identifies $\mathcal{P}(\Sigma^*)$ with the binary sequences, which has cardinality $2^{\aleph_0}$. A countable set cannot cover an uncountable one, so all but countably many languages are not RE. The argument names no example; explicit ones are the diagonal language $\{\langle M \rangle : M \text{ does not accept } \langle M \rangle\}$ and $\overline{\mathrm{HALT}}$.

**GATE use.** Statements such as "the set of all languages over $\{0, 1\}$ is countable" (false), "the set of RE languages is countable" (true) and "there are languages that no TM accepts" (true) appear in MSQs. The trap is concluding that because every finite language is regular, all languages are regular: the infinite ones are the uncountable part.

**Check.** A script listed the 2,047 binary strings of length at most 10 in canonical order, computed $2^{\lvert w \rvert} - 1 + \mathrm{val}(w)$ for each and found exactly the numbers 0 to 2,046 in increasing order; $101$ has index $2^3 - 1 + 5 = 12$.

## Many-one reductions and what they transfer
<!-- topics: toc-turing-machines.reductions -->

**Claim.** $A \le_m B$ means there is a total computable $f$ with $w \in A \iff f(w) \in B$ for every $w$. If $A \le_m B$, then $B$ recursive implies $A$ recursive, and $B$ RE implies $A$ RE; equivalently, $A$ undecidable implies $B$ undecidable, and $A$ not RE implies $B$ not RE. The same $f$ gives $\overline{A} \le_m \overline{B}$. Nothing follows about $B$ from $A$ being decidable, or about $A$ from $B$ being undecidable.

**Proof.** Let $M_B$ decide (or recognise) $B$ and let $F$ be a machine that computes $f$ and always halts. The machine $M_A$: on $w$, run $F$ to get $f(w)$, then run $M_B$ on $f(w)$ and give its answer. Since $F$ halts, $M_A$ halts whenever $M_B$ does, so a decider gives a decider. It accepts exactly when $f(w) \in B$, which by the definition holds exactly when $w \in A$; both directions of the $\iff$ are used, the forward one for "accepts every $w \in A$" and the backward one for "accepts no $w \notin A$". The contrapositives are the hardness statements. Negating both sides of $w \in A \iff f(w) \in B$ gives $w \in \overline{A} \iff f(w) \in \overline{B}$. Every decidable $A$ reduces to every $B$ other than $\emptyset$ and $\Sigma^*$ (compute the answer, output a fixed yes-instance or no-instance of $B$), so a reduction from an easy problem carries no information about $B$, and $P \le_m \mathrm{HALT}$ holds for every RE $P$, decidable or not.

The standard construction. From $\langle M, w \rangle$ compute $M_1$: on input $x$, ignore $x$, run $M$ on $w$, and accept if it halts. Then $L(M_1) = \Sigma^*$ if $M$ halts on $w$ and $L(M_1) = \emptyset$ if not. So the map is a reduction from HALT to non-emptiness, to universality ($L = \Sigma^*$) and to infiniteness. It does not reduce HALT to emptiness: yes-instances of HALT land on non-empty languages. No reduction $\mathrm{HALT} \le_m E_{\mathrm{TM}}$ can exist, since $E_{\mathrm{TM}}$ is co-RE (next sections), and the reduction would make HALT co-RE and therefore recursive. What the construction proves about emptiness is $\overline{\mathrm{HALT}} \le_m E_{\mathrm{TM}}$, so $E_{\mathrm{TM}}$ is not RE.

**GATE use.** "To prove $P$ undecidable it suffices to show" has answer $\mathrm{HALT} \le_m P$: the known hard problem is on the left. Given $A \le_m B$ with $A = \overline{\mathrm{HALT}}$, conclude that $B$ is not RE. The traps are reversing the arrow and concluding that $B$ is decidable because $A$ is.

**Check.** A script modelled $M$ on $w$ by its halting time $h$ and built $L(M_1)$ over binary strings of length at most 8: for $h = 1, 3, 5$ it contained all 511 strings and for a machine that never halts it was empty, so yes-instances map to $\Sigma^*$ and no-instances to $\emptyset$.

## Rice's theorem
<!-- topics: toc-turing-machines.rice-theorem -->

**Claim.** Let $P$ be a set of RE languages with $\emptyset \ne P \subsetneq \mathrm{RE}$ (non-trivial) and let $L_P = \{\langle M \rangle : L(M) \in P\}$; membership in $L_P$ depends only on $L(M)$ (semantic). Then $L_P$ is undecidable. Sharper: if $\emptyset \notin P$ then $A_{\mathrm{TM}} \le_m L_P$, so $L_P$ is not co-RE; if $\emptyset \in P$ then $\overline{A_{\mathrm{TM}}} \le_m L_P$, so $L_P$ is not RE.

**Proof.** (Sipser, Problem 5.28.) First suppose $\emptyset \notin P$. Since $P$ is non-empty, pick $L_0 \in P$ and a recogniser $M_0$ for it. Map $\langle M, w \rangle$ to the machine $M'$: on input $x$, run $M$ on $w$; if $M$ accepts, run $M_0$ on $x$ and accept if $M_0$ accepts. Writing down $\langle M' \rangle$ is a finite text edit, so the map is total and computable. If $M$ accepts $w$, $M'$ accepts exactly $L_0$, so $L(M') \in P$. If $M$ rejects or loops on $w$, $M'$ accepts nothing, $L(M') = \emptyset \notin P$. Hence $\langle M, w \rangle \in A_{\mathrm{TM}} \iff \langle M' \rangle \in L_P$. $A_{\mathrm{TM}}$ is undecidable, so $L_P$ is, and the complemented reduction $\overline{A_{\mathrm{TM}}} \le_m \overline{L_P}$ shows that $\overline{L_P}$ is not RE.

If $\emptyset \in P$, the complementary property $\overline{P} = \mathrm{RE} - P$ is non-trivial and omits $\emptyset$, so the first case gives $A_{\mathrm{TM}} \le_m L_{\overline{P}}$. Up to the syntactically decidable set of strings that are not machine encodings, $L_{\overline{P}}$ is the complement of $L_P$, so $\overline{A_{\mathrm{TM}}} \le_m L_P$, and $L_P$ is undecidable and not RE.

Both hypotheses are needed. Semantic: "M has at least 5 states" is decided by reading $\langle M \rangle$, and two machines with the same language can disagree on it. Non-trivial: "every string $M$ accepts is finite" holds for every TM, because every string is finite, so the set is all encodings and decidable; the intended property "L(M) is a finite language" is non-trivial and undecidable.

**GATE use.** For each option, check that the answer depends only on $L(M)$ and name one RE language with the property and one without; if both checks pass, the option is undecidable. Undecidable by Rice: $L(M)$ empty, finite, regular, context-free, equal to $\Sigma^*$, containing $101$. Decidable and outside Rice: the number of states, the alphabet, halting within 100 moves on a blank tape. The trap is reading Rice as "not RE": $L(M) \ne \emptyset$ omits $\emptyset$, so Rice gives only "not co-RE", and it is in fact RE.

**Check.** The corollary classifies the standard cases at once: non-emptiness and "contains $101$" omit $\emptyset$ and are not co-RE; emptiness and finiteness contain $\emptyset$ and are not RE; universality omits $\emptyset$ and is not co-RE, and the next section shows it is not RE either.

## Classifying questions about Turing machines
<!-- topics: toc-turing-machines.tm-properties-classification, toc-turing-machines.reductions -->

**Claim.** $\mathrm{NE} = \{\langle M \rangle : L(M) \ne \emptyset\}$ is RE and not recursive, and $E = \overline{\mathrm{NE}}$ is co-RE and not RE. Universality $\{L(M) = \Sigma^*\}$, finiteness $\{L(M) \text{ finite}\}$, totality $\{M \text{ halts on every input}\}$ and equivalence $\{L(M_1) = L(M_2)\}$ are neither RE nor co-RE. A question whose answer is the same for every machine, such as "is $L(M)$ RE", is decidable.

**Proof.** NE is RE by dovetailing. Let $s_0, s_1, \dots$ be the strings in canonical order. Stage $k$ runs $M$ for $k$ moves on each of $s_0, \dots, s_{k-1}$; accept as soon as one run accepts. If $M$ accepts $s_i$ after $s$ moves, the run is found at stage $\max(i + 1, s)$, so the recogniser accepts every $\langle M \rangle \in \mathrm{NE}$, and it accepts nothing else. Trying the strings one at a time to completion fails, since $M$ may loop on $s_0$. NE is undecidable by Rice, so $E$ is not RE (RE and co-RE section).

For the other four, take $\langle M, w \rangle$ and two machines. $M_1$ ignores its input $x$, runs $M$ on $w$ and accepts if it halts: $L(M_1) = \Sigma^*$ when $M$ halts on $w$, and $\emptyset$ otherwise. $M_2$ on input $x$ runs $M$ on $w$ for $\lvert x \rvert$ moves and accepts if $M$ has not yet halted: if $M$ halts after $h$ moves, $L(M_2)$ is the finite set of strings shorter than $h$; if $M$ never halts, $L(M_2) = \Sigma^*$.

- Universality. $M \mapsto M_1$ gives $\mathrm{HALT} \le_m \mathrm{UNIV}$, so UNIV is not co-RE. $M \mapsto M_2$ gives $\overline{\mathrm{HALT}} \le_m \mathrm{UNIV}$, so UNIV is not RE.
- Finiteness. $M_1$ has a finite language exactly when $M$ loops, so $\overline{\mathrm{HALT}} \le_m \mathrm{FIN}$ and FIN is not RE. $M_2$ has a finite language exactly when $M$ halts, so $\mathrm{HALT} \le_m \mathrm{FIN}$ and FIN is not co-RE.
- Totality. $M_1$ halts on every input exactly when $M$ halts on $w$, so TOT is not co-RE. Change $M_2$ to loop instead of reject when $M$ has halted within $\lvert x \rvert$ moves: it halts on every $x$ exactly when $M$ never halts on $w$, so TOT is not RE. Totality is about halting, not about $L(M)$, so it needs these reductions rather than Rice.
- Equivalence. Fix $M_{\mathrm{all}}$ with $L(M_{\mathrm{all}}) = \Sigma^*$. $\langle M \rangle \mapsto \langle M, M_{\mathrm{all}} \rangle$ gives $\mathrm{UNIV} \le_m \mathrm{EQ}$, and both the not-RE and the not-co-RE results transfer to EQ.

The certificate view gives the same answers: a yes-answer for NE has a finite witness (one accepting run), so NE is RE and $E$ is co-RE. For universality a yes-answer needs infinitely many accepting runs, and a no-answer needs a string on which $M$ never accepts, which may mean a run that never ends, so neither side has a finite witness.

**GATE use.** The 2-mark MCQ on $E$ and NE has answer "NE is RE but not recursive, and E is not RE". MSQs on "which are decidable" mix these with bounded questions. Apply the recipe: step bound or syntax first (decidable), then Rice for undecidability, then look for a finite certificate on the yes side (RE) or the no side (co-RE). The trap is stopping at "undecidable" when the options separate RE, co-RE and neither.

**Check.** A script computed the work of the dovetailer through stage 5 as $1 + 4 + 9 + 16 + 25 = 55 = 5 \cdot 6 \cdot 11 / 6$ moves and confirmed the discovery stage $\max(i + 1, s)$ for all $i, s < 30$; the string $11$ (index 6) accepted in 4 moves is found at stage 7. It also built $L(M_2)$ up to length 8: for $h = 1, 3, 5$ it held 1, 7 and 31 strings ($2^h - 1$), and for a machine that never halts all 511.

## Post correspondence and the undecidable CFG problems
<!-- topics: toc-turing-machines.classic-undecidable, toc-turing-machines.decidability-table -->

**Claim.** Given dominoes $(t_1, b_1), \dots, (t_n, b_n)$ over $\Sigma$, PCP asks for a non-empty sequence $i_1, \dots, i_k$ with $t_{i_1} \cdots t_{i_k} = b_{i_1} \cdots b_{i_k}$. PCP is RE and undecidable, and stays undecidable over a two-letter alphabet. Over a one-letter alphabet it is decidable: a match exists exactly when some domino has $\lvert t_i \rvert = \lvert b_i \rvert$, or one has $\lvert t_i \rvert > \lvert b_i \rvert$ and another has $\lvert t_j \rvert < \lvert b_j \rvert$. Through PCP, ambiguity of a CFG and emptiness of $L(G_1) \cap L(G_2)$ are undecidable.

**Proof.** RE: there are $\sum_{j=1}^{k} n^j$ sequences of length at most $k$; trying them in order of length and accepting on a match finds any match that exists. Undecidability (Sipser, Theorem 5.15) reduces $A_{\mathrm{TM}}$: the dominoes are built so that the only way to finish a match is to spell out an accepting computation history of $M$ on $w$, configuration by configuration, with the bottom string one configuration ahead of the top. The construction is long and GATE uses only its conclusion.

Unary case. Over $\{a\}$ a sequence matches exactly when the total lengths agree, that is, when the counts $c_i \ge 0$ of each domino, not all zero, satisfy $\sum_i c_i d_i = 0$ with $d_i = \lvert t_i \rvert - \lvert b_i \rvert$; the order is irrelevant. If some $d_i = 0$, that domino alone matches. If $d_i > 0$ and $d_j < 0$, take $-d_j$ copies of domino $i$ and $d_i$ copies of domino $j$: the sum is $-d_j d_i + d_i d_j = 0$. If all $d_i$ have one strict sign, every non-empty sum has that sign and no match exists. This is a finite test.

CFG ambiguity (Hopcroft-Ullman, Section 9.5). Add new index symbols $1, \dots, n$ and let

$$S \to S_A \mid S_B, \qquad S_A \to t_i S_A\, i \mid t_i\, i, \qquad S_B \to b_i S_B\, i \mid b_i\, i \quad (1 \le i \le n).$$

$S_A$ generates exactly the strings $t_{i_1} \cdots t_{i_k}\, i_k \cdots i_1$, and the trailing index symbols, read from the right, fix which rule was used at each level, so $S_A$ is unambiguous; so is $S_B$. A string therefore has two leftmost derivations exactly when it is derived from both $S_A$ and $S_B$, which forces the same index sequence and $t_{i_1} \cdots t_{i_k} = b_{i_1} \cdots b_{i_k}$: a match. So the grammar is ambiguous exactly when PCP has a solution, and $L(S_A) \cap L(S_B) \ne \emptyset$ exactly when it does, which makes CFG intersection-emptiness undecidable too. Universality of a CFG is undecidable by a computation-history argument (Sipser, Theorem 5.13), and equivalence follows by comparing $G$ with a grammar for $\Sigma^*$.

**GATE use.** NATs ask for the shortest match of a small instance. Start with the only dominoes whose top and bottom agree on a prefix, and at each step the leading part forces the next domino. MCQs and NATs count undecidable problems in a mixed list, where PCP, CFG ambiguity and equivalence, and TM emptiness are undecidable and DFA membership, CFG emptiness and CSL membership are not.

**Check.** For $(b, ca), (a, ab), (ca, a), (abc, c)$ only $(a, ab)$ can start. A breadth-first search found the shortest match $d_2 d_1 d_3 d_2 d_4$, 5 dominoes, with top and bottom both $abcaaabc$. In the ambiguity grammar the string $abcaaabc\,42312$ had exactly one derivation from $S_A$ and one from $S_B$, and no string of length at most 7 over the seven symbols had more than one derivation from either side. The unary rule agreed with a brute-force search over domino counts on 3,000 random instances; for $d = (3, -2)$, from dominoes $(5, 2)$ and $(1, 3)$, 2 copies and 3 copies give totals $13 = 13$.

## Decision procedures across regular and context-free languages
<!-- topics: toc-turing-machines.decidability-table -->

**Claim.** For a DFA with $n$ states, membership, emptiness, finiteness, universality, equivalence and inclusion are decidable; $L$ is infinite exactly when it contains a string with length in $[n, 2n)$. For a CFG, membership (CYK in $O(m^3 \lvert G \rvert)$ for $\lvert w \rvert = m$, grammar in CNF), emptiness and finiteness are decidable; universality, equivalence, inclusion, ambiguity and intersection-emptiness are not. For a DPDA universality is decidable. For a CSG only membership is decidable among these.

**Proof.** DFA. Membership runs the DFA. $L = \emptyset$ exactly when no accepting state is reachable from the start, a graph search. If $L$ contains a string of length at least $n$, its run repeats a state, and pumping the loop gives infinitely many strings. Conversely, if $L$ is infinite take a shortest string $z \in L$ with $\lvert z \rvert \ge n$. If $\lvert z \rvert \ge 2n$, the last $n$ symbols of $z$ revisit a state, and cutting out that loop, of length between 1 and $n$, leaves a string in $L$ of length at least $n$ that is shorter than $z$, contradicting minimality. So $n \le \lvert z \rvert < 2n$, a finite check. Universality is emptiness of the complement (swap accepting states), and equivalence and inclusion are emptiness of a product DFA for $L_1 \triangle L_2$ or $L_1 - L_2$.

CFG. Emptiness: mark a variable generating when it has a rule whose right side consists of terminals and generating variables, iterate to a fixed point, and test the start symbol. Finiteness: convert to CNF without useless variables; $L$ is infinite exactly when the graph with an edge $A \to B$ for each rule $A \to BC$ or $A \to CB$ has a cycle, because a cycle $A \Rightarrow^+ uAv$ with $uv \ne \varepsilon$ (CNF rules never produce $\varepsilon$ in a cycle) pumps, and without a cycle every parse tree has height at most the number of variables. CYK fills the table $P[i, \ell]$ of variables deriving the substring of length $\ell$ starting at $i$: there are $m(m+1)/2$ cells, and the (start, length, split) triples number $\sum_{\ell=2}^{m} (m - \ell + 1)(\ell - 1) = \binom{m+1}{3} = (m^3 - m)/6$, each checked against every rule, so $O(m^3 \lvert G \rvert)$. The undecidable CFG problems are the previous section's; inclusion is undecidable because $\Sigma^* \subseteq L(G)$ is universality. DPDA: a DPDA can be complemented (after making it read its whole input), so universality is emptiness of the complement DCFL; equivalence of DPDAs is decidable too (Sénizergues, 1997), while inclusion is not. CSG: membership was proved in the bounded-tape section; emptiness of an LBA is undecidable by a computation-history reduction (Sipser, Theorem 5.10).

**GATE use.** Decidability-table MSQs. The fast rule: everything is decidable for regular languages; for CFLs membership, emptiness and finiteness are decidable and the rest are not; for CSLs only membership; for recursive languages membership only; for RE languages membership is only semi-decidable. The traps are CSL membership (decidable) and CFL universality (undecidable although CFL emptiness is decidable, because CFLs are not closed under complement).

**Check.** A script compared the $[n, 2n)$ test with a cycle-on-a-useful-path test on 1,500 random DFAs with up to 5 states and found no disagreement. It ran CYK for $S \to AT \mid AB$, $T \to SB$, $A \to a$, $B \to b$ (the language $a^k b^k$, $k \ge 1$) on all strings over $\{a, b\}$ of length 1 to 10 and matched the definition; for $m = 4$ there are 10 cells and $\binom{5}{3} = 10$ split triples.

## The Chomsky hierarchy is strict
<!-- topics: toc-turing-machines.chomsky-hierarchy -->

**Claim.** $\mathrm{REG} \subsetneq \mathrm{DCFL} \subsetneq \mathrm{CFL} \subsetneq \mathrm{CSL} \subsetneq \mathrm{REC} \subsetneq \mathrm{RE} \subsetneq \mathcal{P}(\Sigma^*)$, with witnesses $a^n b^n$, $w w^R$, $a^n b^n c^n$, a diagonal language over CSGs, HALT and $\overline{\mathrm{HALT}}$. Type 0 grammars generate exactly the RE languages, Type 1 the CSLs (LBAs), Type 2 the CFLs (PDAs), Type 3 the regular languages.

**Proof.** Containments. A DFA is a DPDA that ignores its stack; a DPDA is a PDA; a CFG in CNF without $\varepsilon$-rules is non-contracting, so every CFL (apart from $\varepsilon$) is a CSL; every CSL is recursive by the bounded-tape section; recursive languages are RE by definition; RE is a countable family inside an uncountable one.

Strictness. $a^n b^n$ is accepted by a DPDA and is not regular by the pumping lemma. $w w^R$ is a CFL, and a DPDA cannot know where the middle is; the standard proof shows that a DPDA for it could be modified to accept a non-CFL. $a^n b^n c^n$ has the non-contracting grammar of the bounded-tape section and is not context free by the CFL pumping lemma. CSL $\ne$ REC: encode every CSG with terminal alphabet $\{0, 1\}$ as a binary string and let $D = \{\langle G \rangle : \langle G \rangle \notin L(G)\}$. $D$ is decidable: check that the input encodes a CSG and decide $\langle G \rangle \in L(G)$ by the bounded search, which works uniformly for all grammars. If $D = L(G_0)$ for a CSG $G_0$, then $\langle G_0 \rangle \in D \iff \langle G_0 \rangle \notin L(G_0) = D$, a contradiction. HALT is RE and not recursive, and $\overline{\mathrm{HALT}}$ is not RE.

Type 0 equals RE. Given an unrestricted grammar, a TM recognises its language by enumerating derivations breadth first and accepting if one ends in the input; derivations can grow and shrink, so there is no length bound and the machine may loop, which is why Type 0 membership is only semi-decidable. Given a TM $M$, a grammar first generates a two-track copy of a string $w$ together with the start configuration, then has one rule family per transition rewriting the neighbourhood of the head, and finally, when $q_{acc}$ appears, erases the working track and leaves $w$; it derives $w$ exactly when $M$ accepts $w$.

**GATE use.** "Type 0 grammars generate exactly ..." has answer the RE languages, not the recursive ones. MSQs on proper containment test CSL $\subsetneq$ REC, which many students write as an equality, and the witnesses listed above.

**Check.** The bounded-tape script confirmed that the grammar $S \to abc \mid aSBc$, $cB \to Bc$, $bB \to bb$ derives exactly $a^n b^n c^n$ on strings up to length 7, the CSL witness, and the CYK script confirmed $a^k b^k$ for the DCFL witness up to length 10.
