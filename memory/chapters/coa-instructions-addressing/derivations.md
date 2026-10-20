# Machine instructions and addressing modes: derivations

## Field widths: why a field for N choices needs the ceiling of log N bits
<!-- topics: coa-instructions-addressing.encoding-bits, coa-instructions-addressing.instruction-format -->

**Claim.** A field that must give a different bit pattern to each of $N \ge 1$ choices (opcodes, registers, addressing modes) needs at least

$$b = \lceil \log_2 N \rceil$$

bits, and $b$ bits suffice. Conversely a $b$-bit field distinguishes at most $2^b$ choices. An instruction that holds an opcode, an optional mode field and its operand fields side by side has width

$$W = b_{\text{op}} + b_{\text{mode}} + \sum b_{\text{operand}},$$

where the sum runs over the fields the format actually has. When $W$ is fixed, the bits left after the opcode, mode and register fields form the immediate or displacement field.

**Proof.** A $b$-bit field has exactly $2^b$ patterns, one for each choice of each bit. Giving $N$ choices distinct patterns is an injection from the $N$ choices into the $2^b$ patterns, which exists exactly when $N \le 2^b$ (pigeonhole for one direction, numbering the choices $0, \dots, N-1$ in binary for the other). The least such $b$ is the least integer with $2^b \ge N$, that is $b \ge \log_2 N$, so $b = \lceil \log_2 N \rceil$. Rounding down fails whenever $N$ is not a power of two: with $b = \lfloor \log_2 N \rfloor$ we get $2^b < N$. For $N = 1$ the field needs 0 bits, since there is nothing to distinguish. The width formula holds because the fields occupy disjoint bit positions of one instruction word, so their widths add; any bits beyond that total are padding to a byte or word boundary and carry no information.

**GATE use.** The 1-mark NAT "45 instructions, 64 registers, two register operands and an immediate in a 32-bit word: largest immediate?" is this section plus the next. Traps: truncating $\log_2 45 \approx 5.49$ to 5, counting one register field where the format has two, and answering a padded storage width (32) when the question asks for the field total.

**Check.** $\lceil \log_2 45 \rceil = 6$, $\lceil \log_2 128 \rceil = 7$, $\lceil \log_2 200 \rceil = 8$ (since $128 < 200 \le 256$), and 64 registers need 6 bits. For 45 opcodes and two of 64 registers in 32 bits the immediate has $32 - 6 - 12 = 14$ bits. A 5-bit opcode, 4-bit mode field, 5-bit register field and 16-bit address make $5 + 4 + 5 + 16 = 30$ bits; 32 opcodes, one of 16 registers and a 16-bit address make $5 + 4 + 16 = 25$. A script checked that $\lceil \log_2 N \rceil$ is the least $b$ with $2^b \ge N$ for every $N$ up to $10^5$.

## Range of a k-bit unsigned or two's-complement field
<!-- topics: coa-instructions-addressing.encoding-bits, coa-instructions-addressing.pc-relative -->

**Claim.** Read a $k$-bit field $p_{k-1} \dots p_1 p_0$ with $k \ge 1$. As an unsigned number it takes every integer value in $[0, 2^k - 1]$. As a two's-complement number, with value

$$v = -p_{k-1}\, 2^{k-1} + \sum_{i=0}^{k-2} p_i\, 2^i,$$

it takes every integer value in $[-2^{k-1}, 2^{k-1} - 1]$, each exactly once. The signed range is asymmetric: one more negative value than positive.

**Proof.** Unsigned: the value $\sum_{i=0}^{k-1} p_i 2^i$ is the binary expansion, which is a bijection between the $2^k$ patterns and $\{0, \dots, 2^k - 1\}$; the largest is all ones, $\sum_{i=0}^{k-1} 2^i = 2^k - 1$ by the geometric series. Two's complement: the low $k - 1$ bits contribute an unsigned value $u \in [0, 2^{k-1} - 1]$, again a bijection. If $p_{k-1} = 0$ then $v = u$ covers $[0, 2^{k-1} - 1]$. If $p_{k-1} = 1$ then $v = u - 2^{k-1}$ covers $[-2^{k-1}, -1]$. The two halves are disjoint and together hold $2^k$ values, so every pattern has a distinct value. The extremes are $100\dots0 = -2^{k-1}$ and $011\dots1 = 2^{k-1} - 1$. For a negative $v$ the pattern read as unsigned equals $v + 2^k$, which is why adding a signed offset with an ordinary $k$-bit adder works modulo $2^k$.

**GATE use.** Branch-range MCQs offer $\pm 127$ (sign-magnitude), $\pm 128$ (needs 9 bits), $0$ to $255$ (unsigned, no backward branch) and the right answer $-128$ to $+127$. A second trap is the unit: the range is in offset units counted from the updated PC, so a word offset is multiplied by the word size before it becomes a byte distance.

**Check.** $k = 8$: $[-128, 127]$. $k = 14$: unsigned up to 16383, signed $[-8192, 8191]$. A 16-bit offset counted in 4-byte words reaches $-2^{15} \cdot 4 = -131072$ to $(2^{15} - 1) \cdot 4 = 131068$ bytes from the updated PC, about $\pm 128$ KB. A script enumerated every pattern for $k = 1$ to 14 and confirmed both ranges, the one-to-one mapping and $v + 2^k$ for negative values.

## Expanding opcodes: the encoding budget
<!-- topics: coa-instructions-addressing.expanding-opcode, coa-instructions-addressing.encoding-bits -->

**Claim.** A fixed-width format of $W$ bits holds instruction classes $i = 1, \dots, m$; class $i$ has $n_i$ opcodes, and each of its instructions carries operand fields totalling $b_i$ bits (with $b_i \le W$), every combination of operand values being legal. The opcodes can be assigned, with variable-length opcodes inside the fixed width so that decoding is unambiguous, exactly when

$$\sum_{i=1}^{m} n_i\, 2^{b_i} \le 2^W.$$

So with every other class fixed, the largest possible count for class $j$ is $\left\lfloor \left(2^W - \sum_{i \ne j} n_i 2^{b_i}\right) / 2^{b_j} \right\rfloor$.

**Proof.** Necessity. One opcode of class $i$ together with its $2^{b_i}$ operand values gives $2^{b_i}$ different instructions, and the decoder must tell all of them apart from each other and from every other opcode's instructions, so they must be different $W$-bit words. Counting words over all opcodes gives $\sum n_i 2^{b_i}$ distinct words out of $2^W$.

Sufficiency, by construction. An opcode of class $i$ will own an aligned block of $2^{b_i}$ consecutive words, those with a fixed top $W - b_i$ bits (the opcode) and any low $b_i$ bits (the operands). Sort the classes so that $b_1 \ge b_2 \ge \dots \ge b_m$ and hand out blocks in that order from word 0 upward. Invariant: when a block of size $2^{b_i}$ is about to be placed, the next free word is a multiple of $2^{b_i}$. It holds at word 0, and every block placed earlier has size $2^{b_h}$ with $b_h \ge b_i$, a multiple of $2^{b_i}$, so their total is too. Hence every block is aligned, so its words share their top $W - b_i$ bits, which is a valid opcode. Blocks are disjoint, so no word decodes two ways, and they fit inside the $2^W$ words because their total size is the sum in the claim. The bound for class $j$ follows by solving the inequality for $n_j$ and rounding down, since $n_j$ is an integer.

The prefix view is the same count: if the longest-operand class uses $r$-bit opcodes, each unused $r$-bit prefix is a block of $2^{W-r}$ words, and a class with $b$ operand bits gets $2^{W-r-b}$ opcodes out of it.

**GATE use.** The 2-mark NAT lists counts for all classes but one and asks for the maximum of the last. Compute each class's operand bits from its register and immediate fields, subtract encodings (not opcode counts), divide by $2^{b}$ of the unknown class. The trap is subtracting opcode counts across classes with different operand widths: a 10-operand-bit opcode costs a quarter of what a 12-operand-bit one does.

**Check.** 16 bits, 4-bit address fields, 15 three-address, 14 two-address and 31 one-address instructions: $65536 - 15 \cdot 4096 - 14 \cdot 256 - 31 \cdot 16 = 16$ zero-address instructions. 64 registers, 8 I-type opcodes with one register and a 4-bit immediate (10 operand bits), R-type with two registers (12 bits): $(65536 - 8 \cdot 1024)/4096 = 14$; in the prefix view each unused 4-bit prefix gives 4 I-type opcodes, so 8 of them use 2 prefixes and 14 remain. Four types with 12, 12, 10 and 6 operand bits and counts 4, 8, 14: $(65536 - 16384 - 32768 - 14336)/64 = 32$. A script ran the sorted aligned allocation on 200,000 random instances with $W \le 8$ and confirmed that it succeeds exactly when the inequality holds.

## Zero-, one-, two- and three-address code for an expression
<!-- topics: coa-instructions-addressing.address-count -->

**Claim.** Let an expression tree have $L$ operand leaves and $O$ binary operators. On a stack machine where PUSH puts a value on top and a binary operation pops the top $y$, then the next $x$, and pushes $x \mathbin{\mathrm{op}} y$, the postfix order of the tree is a correct program. Storing the result costs one POP, so the program has $L + O + 1$ instructions. In three-address code with arbitrary destinations each operator is one instruction, $O$ in total. In one-address (accumulator) code each operator is one instruction, each subexpression that starts the accumulator afresh costs a LOAD, each value that must be parked while another subexpression is computed costs a STORE, and the final STORE writes the result.

**Proof.** Stack: induction on the tree, with the invariant that the postfix code of a subtree $e$, run on any stack $S$, leaves $S$ with the value of $e$ pushed on top and $S$ otherwise untouched. A leaf is one PUSH, so the invariant holds. For $e = e_1 \mathbin{\mathrm{op}} e_2$ the code is $\mathrm{post}(e_1)\,\mathrm{post}(e_2)\,\mathrm{op}$: by induction the first part leaves $S, v_1$, the second leaves $S, v_1, v_2$, and op pops $v_2$ then $v_1$ and pushes $v_1 \mathbin{\mathrm{op}} v_2$, the value of $e$, on $S$. The code has one PUSH per leaf and one instruction per operator, plus POP X: $L + O + 1$. The order matters for non-commutative operators: the left operand is pushed first, so it is second from top when op runs.

Three-address: each instruction applies one operator to two operands and writes any destination, so every internal node of the tree is computed by one instruction (into a temporary, or into X for the root), and no instruction is wasted. Each instruction computes at most one operator, so fewer than $O$ is impossible.

One-address: the accumulator is the only place an operator writes, so after an operator the result sits in the accumulator. When an operator's right operand is itself a subexpression, the accumulator must first hold that subexpression, so the left value has to be in memory: either it was STOREd to a temporary, or the two subtrees are evaluated right first. For $(A + B) \times (C + D)$: LOAD A, ADD B, STORE T, LOAD C, ADD D, MUL T, STORE X. Two-address code destroys its first operand, so a MOV precedes any instruction whose destroyed operand is still needed.

**GATE use.** The 1-mark NAT asks for the instruction count in one of the forms, or for the value left on a stack after a given sequence. The trap is the operand order of SUB and DIV: PUSH C, PUSH D, SUB computes $C - D$, and reading it as $D - C$ flips the sign of the answer.

**Check.** $(A + B) \times (C - D)$ has $L = 4$, $O = 3$: PUSH A, PUSH B, ADD, PUSH C, PUSH D, SUB, MUL, POP X is 8 instructions. With $A = 5$, $B = 3$, $C = 7$, $D = 4$ the stack ends at $8 \times 3 = 24$; computing $D - C$ gives $-24$. $X = A + B + C$ needs 2 three-address instructions. A script built 20,000 random trees, ran their postfix code on a stack and matched both the value and the count $L + O$ before the POP.

## Effective address and memory accesses of the basic modes
<!-- topics: coa-instructions-addressing.basic-modes, coa-instructions-addressing.memory-references -->

**Claim.** Let $A$ be the instruction's address field, $R$ the contents of the named register and $M[x]$ the memory word at $x$. The operand and the number of operand memory reads are:

| Mode | EA | Operand | Operand reads |
|---|---|---|---|
| Immediate | none | $A$ | 0 |
| Register | none | $R$ | 0 |
| Direct | $A$ | $M[A]$ | 1 |
| Memory indirect | $M[A]$ | $M[M[A]]$ | 2 |
| Register indirect | $R$ | $M[R]$ | 1 |
| Displacement | $R + A$ | $M[R + A]$ | 1 |
| PC-relative | $\mathrm{PC}_{\text{next}} + A$ | $M[\mathrm{PC}_{\text{next}} + A]$ | 1 |

The total memory accesses of one instruction are the number of instruction words fetched plus the operand reads of its source operands, plus one write if the result goes to memory. A memory destination (a STORE) is never read: it costs only the reads that form its EA (0 for direct, register indirect, displacement and PC-relative, 1 for memory indirect) plus the write.

**Derivation.** Each mode is a rule for computing the EA, and the operand is $M[\mathrm{EA}]$ whenever an EA exists. A memory read happens exactly when a value is taken out of memory. In immediate mode the value is part of the instruction, already fetched, so no read. In register mode the value is in the register file. In direct mode the EA is the field itself, so one read fetches the operand. In memory indirect mode the field names a location holding the EA, so one read obtains the pointer and a second the operand. Register indirect, displacement and PC-relative compute the EA from a register (and an adder) without touching memory, so only the operand read remains. Each instruction word is a separate memory word, so a two-word instruction costs two fetches. The table therefore climbs one access per level of indirection: immediate holds the value, direct holds its address, indirect holds the address of its address.

**GATE use.** The MCQ or MSQ gives one register file and memory table and asks what each mode loads. Use the PC after fetch for PC-relative. The traps are stopping one read early in indirect mode (reporting the pointer) and confusing register indirect $M[R]$ with indexed $M[A + R]$. Counting questions add fetches only when "all memory references" are asked.

**Check.** A two-word LOAD at words 200 and 201, $A = 500$, PC after fetch 202, $R1 = 400$, with $M[400] = 700$, $M[500] = 800$, $M[702] = 325$, $M[800] = 300$, $M[900] = 200$: direct loads 800, indirect 300, PC-relative $M[702] = 325$, indexed $M[900] = 200$, register indirect $M[400] = 700$. The same two-word LOAD in indirect mode makes $2 + 2 = 4$ memory accesses. A one-word STORE R1, A makes $1 + 1 = 2$ in direct mode and $1 + 1 + 1 = 3$ in indirect mode, not 3 and 4. With $M[100] = 200$ and $M[200] = 50$, LOAD @100 loads 50. A script replayed the table.

## Displacement modes, arrays and auto-increment
<!-- topics: coa-instructions-addressing.displacement-modes, coa-instructions-addressing.auto-inc-dec, coa-instructions-addressing.mode-uses -->

**Claim.** For an array of elements of $s$ addressable units each, starting at $B$, element $i$ (from 0) lies at $B + i s$. For a row-major $r_{\max} \times C$ array it is $A[r][c] = B + (rC + c)\,s$. Hence the general displacement EA

$$\mathrm{EA} = R_{\text{base}} + R_{\text{index}} \times s + d$$

reaches any element with the base or constant holding $B$ and the index register holding $i$ (or $rC + c$). Auto-increment $(R)+$ uses $\mathrm{EA} = R$ and then sets $R \leftarrow R + s$; auto-decrement $-(R)$ sets $R \leftarrow R - s$ and then uses $\mathrm{EA} = R$. A loop that accesses $(R)+$ once per pass, starting from $R = B$, touches $A[0], A[1], \dots$ in order.

**Derivation.** Elements are stored contiguously, each occupying $s$ units, so $i$ elements precede element $i$ and its first unit is $B + is$. In row-major order the $r$ full rows before row $r$ hold $rC$ elements and $c$ more precede column $c$ in its row, giving $rC + c$ elements before $A[r][c]$. Indexed mode puts $B$ in the constant $d$ and the offset in the register; based mode puts a base (frame pointer, struct start) in the register and a fixed offset in $d$. The formula is the same; what differs is which term is known at compile time. Dropping terms gives the simpler modes: $s = 1$, no index is register + $d$; no $d$ is base + index.

For auto-increment, the loop invariant is: at the start of pass $i$, $R = B + is$. It holds for $i = 0$; pass $i$ uses $\mathrm{EA} = R = B + is$, which is element $i$, and then adds $s$, giving $B + (i+1)s$ for the next pass. The step must be the element size, 4 for a 32-bit word on a byte-addressable machine. A push as $-(SP)$ and a pop as $(SP)+$ are inverse: the pop reads the address the push wrote and restores SP, so the stack grows toward lower addresses. The register update is a side effect computed by the address adder already present, so the mode needs no extra ALU, and it does nothing for relocation because the EA still comes from a register value the program set.

**GATE use.** "LD R1, 5(R2): which mode?" is displacement, not register indirect; the parentheses mislead. The auto-increment MCQ asks which statements hold: the increment depends on the data size (true), it gives self-relocating code (false), it needs an extra ALU (false). Array-address NATs test the row-major formula and the element size.

**Check.** LOAD 4(R1) with $R1 = 100$ reads $M[104]$. LOAD (R1)+ on 4-byte words with $R1 = 100$ reads $M[100]$ and leaves $R1 = 104$. For int A[10][20] at 2000 with 4-byte ints, $A[3][5]$ is at $2000 + (3 \cdot 20 + 5) \cdot 4 = 2260$. A script stepped an auto-increment register through 10 passes and checked the invariant $R = B + 4i$ at each.

## PC-relative branch target and position independence
<!-- topics: coa-instructions-addressing.pc-relative, coa-instructions-addressing.mode-uses, coa-instructions-addressing.instruction-types -->

**Claim.** A branch at address $P$ of length $L$ bytes with signed offset field $d$ counted in units of $u$ bytes targets

$$T = (P + L) + d\,u,$$

because the PC already holds $P + L$ when the offset is added. With an $n$-bit two's-complement offset, $T - (P + L)$ ranges over $[-2^{n-1} u, (2^{n-1} - 1) u]$. Code whose every address is PC-relative or base-relative runs unchanged when loaded at any other address; code containing an absolute address or a memory-indirect pointer to its own locations does not.

**Proof.** Fetch reads the instruction at $P$ and increments the PC by $L$ before execution, so execute sees $\mathrm{PC} = P + L$; the branch adds the sign-extended offset times the unit size. The range follows from the two's-complement range of the field (section 2) multiplied by $u$.

Relocation: move the whole program by $\Delta$, so every instruction and every data item of the program sits $\Delta$ higher. A PC-relative reference at $P$ now computes $(P + \Delta + L) + du = T + \Delta$, exactly where its target moved; the instruction bits did not change. A based reference computes $R_{\text{base}} + d$, and the loader sets $R_{\text{base}}$ to the new start, which adds $\Delta$ to every EA. A direct reference computes $A$, the same number as before, which now names the old location; a memory-indirect pointer stored in the program also still holds the old address. Only the first two follow the program without rewriting.

**GATE use.** Target NATs give the branch address, length and offset; the traps are adding the offset to $P$ instead of $P + L$, forgetting to scale a word offset, and adding $L$ again when the question already gives the incremented PC. The relocation MSQ has answer "based and PC-relative". Branches beyond the offset range need an indirect jump through a register, which costs an extra instruction to build the address; RET and switch tables are indirect branches for the same reason.

**Check.** A 4-byte branch at 1000 with offset $-12$ words: $1004 - 48 = 956$; the distractors 952, 992 and 988 come from using 1000, treating $-12$ as bytes, or both. A branch at 200 with byte offset $-10$ targets $204 - 10 = 194$ if it is 4 bytes long; 190 is right only when 200 is already the incremented PC. A script relocated 1,000 random branches by random $\Delta$ and confirmed each target moved by exactly $\Delta$.

## Address space, alignment and byte order
<!-- topics: coa-instructions-addressing.byte-addressing -->

**Claim.** A $K$-bit address names $2^K$ cells, so memory holds $2^K w$ bytes when each cell is $w$ bytes ($w = 1$ for byte addressing). On a byte-addressable machine consecutive $w$-byte words start $w$ apart, while on a word-addressable one they are 1 apart. An aligned $w$-byte access, $w$ a power of two, starts at an address divisible by $w$, which is an address whose low $\log_2 w$ bits are zero. A 32-bit value $x = \sum_{j=0}^{3} x_j 256^j$ stored at address $a$ puts $x_3$ (most significant) at $a$ in big-endian order and $x_0$ (least significant) at $a$ in little-endian order.

**Derivation.** The address count is section 1 read backwards: $K$ bits give $2^K$ distinct addresses, one per cell. A word occupies $w$ byte cells when bytes are addressable, so the next word starts $w$ addresses later. An address $a$ is divisible by $w = 2^t$ exactly when its low $t$ bits are zero, because $a = 2^t \lfloor a / 2^t \rfloor + (a \bmod 2^t)$ and the remainder is the low $t$ bits. An aligned word therefore never straddles two $w$-byte memory rows, which is why RISC hardware handles it in one access and traps or splits a misaligned one. Byte order is a convention for the map from byte significance $j$ to address: big-endian stores $x_j$ at $a + 3 - j$, little-endian at $a + j$.

**GATE use.** Address-space NATs ask for memory size from address bits or the reverse; the trap is mixing word and byte addressing (the same 24 bits give 16 MB or 64 MB). Endianness MCQs ask what byte sits at the lowest address.

**Check.** 24-bit byte addresses: $2^{24}$ B = 16 MB; 24-bit addresses of 4-byte words: 64 MB. 0x12345678 at address 100: big-endian puts 0x12 at 100 and 0x78 at 103, little-endian puts 0x78 at 100. A script wrote the value with both byte orders and read the bytes back.

## Instruction addresses and the return address after an interrupt
<!-- topics: coa-instructions-addressing.memory-references, coa-instructions-addressing.instruction-types -->

**Claim.** A program whose instruction $j$ is $\ell_j$ words long, loaded at address $S$ with $c$ addressable units per word, places instruction $k$ at

$$\mathrm{addr}_k = S + c \sum_{j=1}^{k-1} \ell_j.$$

If an interrupt arrives during instruction $k$, the processor recognises interrupts only between instructions, and instruction $k$ does not transfer control, the return address pushed is $\mathrm{addr}_{k+1}$; if instruction $k$ is a taken branch or a CALL, it is that instruction's target. CALL likewise saves the address of the instruction after the CALL.

**Proof.** Instructions are stored contiguously in program order, so instruction $k$ starts after the $\sum_{j<k} \ell_j$ words of its predecessors, each $c$ units long. The interrupt check sits at the end of the instruction cycle: the processor finishes instruction $k$, during whose fetch the PC already advanced to $\mathrm{addr}_k + c\ell_k = \mathrm{addr}_{k+1}$, then tests for a pending interrupt and saves the PC. That value is $\mathrm{addr}_{k+1}$ unless instruction $k$ was itself a taken branch, in which case it is the branch target. Saving the next address is what lets RET resume without re-executing instruction $k$. Nested calls need a stack rather than one link register: the inner CALL would overwrite the outer return address.

**GATE use.** The 2-mark NAT gives sizes in words, a byte-addressable memory and an interrupt during instruction $k$. The traps are pushing the address of the interrupted instruction, forgetting to multiply by bytes per word, and counting from 0 vs 1 in the sum.

**Check.** Sizes 2, 1, 1, 1, 1, 1, 2, 1 words, load address 1000, 4-byte words: starts 1000, 1008, 1012, 1016, 1020, 1024, 1028; an interrupt during I6 pushes 1028. Word addressing would give $1000 + 7 = 1007$, and 1024 is the interrupted instruction. A script recomputed the start addresses.

## Counting data memory references in a loop
<!-- topics: coa-instructions-addressing.memory-references -->

**Claim.** Let a loop body run $t$ times, making $r$ data references per pass, and let the code outside the body make $r_0$ data references. The program makes $r_0 + t\,r$ data references. For a counter loaded with $n \ge 1$, decremented once per pass and tested with "branch if not zero" at the bottom, $t = n$.

**Proof.** Data references are a sum over executed instructions of each instruction's operand accesses (section 5), and the body's instructions execute once per pass, so the body contributes $t r$. For the trip count, the invariant is: at the end of pass $p$ the counter is $n - p$. It holds for $p = 1$ and each pass subtracts 1. The branch is taken while $n - p \ne 0$, so it falls through for the first time after pass $p = n$. Register-only instructions (INC, DEC, register ADD, the branch) contribute 0 data references; fetches are excluded unless the question counts all memory accesses.

**GATE use.** The NAT gives a short program with a memory-loaded counter. The traps are counting INC or DEC of a register as memory traffic, running the loop $n - 1$ or $n + 1$ times, and including instruction fetches.

**Check.** I1 loads $R1 \leftarrow M[3000] = 10$ (1 reference); the body reads $M[R3]$ and writes $M[R3]$ (2 per pass); DEC R1 and BNZ make $t = 10$. Total $1 + 10 \cdot 2 = 21$. A script simulated the program and counted 21 references over 10 passes.

## Fixed-length formats, building a 32-bit constant, and RISC versus CISC
<!-- topics: coa-instructions-addressing.fixed-vs-variable, coa-instructions-addressing.risc-cisc -->

**Claim.** A 32-bit fixed-length instruction cannot hold a 32-bit constant beside its opcode and register fields, so RISC-V builds one with LUI (load a 20-bit upper immediate into bits 31 to 12) followed by ADDI (add a sign-extended 12-bit immediate). For a constant $C$, the right fields are

$$\mathrm{lo} = \operatorname{sext}_{12}(C \bmod 2^{12}), \qquad \mathrm{hi} = \left\lfloor \frac{C + 2^{11}}{2^{12}} \right\rfloor \bmod 2^{20},$$

and then $\mathrm{hi} \cdot 2^{12} + \mathrm{lo} \equiv C \pmod{2^{32}}$. Separately, CPU time is $\mathrm{IC} \times \mathrm{CPI} \times T_{\text{clk}}$, so a CISC with fewer instructions and a RISC with lower CPI are compared on the product, never on the instruction count alone.

**Derivation.** Write $C = 2^{12} q + \ell$ with $0 \le \ell < 2^{12}$. If $\ell < 2^{11}$, the sign-extended low field is $\ell$ itself, and $\lfloor (C + 2^{11})/2^{12} \rfloor = q$, so $q 2^{12} + \ell = C$. If $\ell \ge 2^{11}$, the 12-bit field has its top bit set and sign-extends to $\ell - 2^{12}$, a negative number, so the upper part must be one larger to compensate: $\lfloor (C + 2^{11})/2^{12} \rfloor = q + 1$ because $2^{12} \le \ell + 2^{11} < 2^{13}$, and $(q+1)2^{12} + \ell - 2^{12} = C$. Reducing hi modulo $2^{20}$ only drops a multiple of $2^{32}$ from the sum. A variable-length ISA such as x86 instead puts a 32-bit immediate in one longer instruction, which is denser but means the decoder must find each instruction's length before it can start on the next one; a fixed-length ISA always has next PC = PC + 4.

For the time equation: time = cycles × cycle time, and cycles = $\sum$ over executed instructions of their cycle counts = $\mathrm{IC} \times$ average CPI. A load-store RISC needs extra LOAD and STORE instructions where a CISC uses memory operands directly, so its IC is larger, but simple fixed-format instructions pipeline to a CPI near 1 under hardwired control.

**GATE use.** RISC/CISC MSQs check the trait list: fixed length, load-store, few modes, large register file for RISC; variable length, memory operands in ALU instructions, many modes, microcode for CISC. The trap is "RISC needs fewer instructions" (it needs more) or "CISC is slower because it has more instructions" (it has fewer, each costlier).

**Check.** $C = \mathtt{0x12345ABC}$: low field $\mathtt{0xABC} = 2748 \ge 2048$ sign-extends to $-1348$, and hi $= \mathtt{0x12346}$, one more than the naive $\mathtt{0x12345}$; $\mathtt{0x12346000} - 1348 = \mathtt{0x12345ABC}$. A script confirmed the formula for 200,000 random 32-bit constants. CISC with $10^6$ instructions at CPI 4 against RISC with $1.5 \times 10^6$ at CPI 1.2, same clock: $4 \times 10^6$ against $1.8 \times 10^6$ cycles, so the RISC wins despite 50% more instructions.

## The Von Neumann bottleneck as a memory-port bound
<!-- topics: coa-instructions-addressing.architecture-models -->

**Claim.** Suppose each memory access takes one cycle on a port that serves one access per cycle, and a program performs $F$ instruction fetches and $D$ data accesses. With one shared memory path (Von Neumann) it needs at least $F + D$ cycles of memory traffic; with separate instruction and data paths (Harvard, or split L1 caches in a modified Harvard design) the bound drops to $\max(F, D)$.

**Proof.** On one port the $F + D$ accesses are distinct events that cannot share a cycle, so they take at least $F + D$ cycles; this serialisation is the bottleneck. With two ports, fetches go to one and data accesses to the other, and both streams proceed in the same cycles, so the longer stream sets the bound, $\max(F, D)$, which is never more than $F + D$ and is at most half of it when $F = D$. In a pipeline the same fact appears as a structural hazard: a load in its memory stage and a later instruction in its fetch stage both want memory in one cycle, which a single port forces to stall and split L1 caches avoid. A modified Harvard machine keeps L2 and main memory unified, so software still sees one address space and can load code as data.

**GATE use.** Conceptual MCQs ask why split I- and D-caches remove a structural hazard, or which organisation lets a fetch overlap a data access. The trap is thinking the modified Harvard design gives programs two address spaces: the split is only at L1.

**Check.** Ten instructions of which four are loads or stores: $F = 10$, $D = 4$, at least 14 memory cycles on one port and 10 with split caches. A script recomputed both bounds.
