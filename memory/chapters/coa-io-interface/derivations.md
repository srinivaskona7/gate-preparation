# I/O interface: derivations

## CPU fraction lost to I/O is events per second times cost per event
<!-- topics: coa-io-interface.overhead-comparison, coa-io-interface.io-techniques -->

**Claim.** Let an I/O scheme make the CPU handle $E$ events per second (polls, interrupts or DMA blocks), and let each event cost the CPU $O$ seconds, or $C$ cycles on a clock of $f_{\text{clk}}$ cycles per second, so $O = C/f_{\text{clk}}$. If the events do not overlap one another and $E \cdot O \le 1$, the fraction of CPU time lost to the device is

$$f = E \times O = \frac{E \times C}{f_{\text{clk}}}.$$

For a device moving $R$ bytes per second, $E = R/u$, where $u$ is the number of bytes moved per event: one transfer unit per poll, one word per interrupt, one block of $B$ bytes per DMA transfer. Per-word interrupt I/O is the case $u = 1$ word, which gives the chapter's $f = R \times O$.

**Derivation.** Watch the CPU for a window of $T$ seconds. The device generates $ET$ events in it, up to one partial event at each end, and each event occupies the CPU for $O$ seconds. The events do not overlap, so the CPU is busy on I/O for $ET \cdot O$ seconds, plus at most $2O$ for the boundary events. Dividing by $T$ and letting $T$ grow, the boundary term $2O/T$ vanishes and the fraction is $EO$. Writing $O = C/f_{\text{clk}}$ gives the cycle form. The condition $EO \le 1$ is needed because a CPU cannot spend more than all of its time; if $EO > 1$ the CPU cannot keep up and data is lost. The three techniques differ only in $u$: programmed I/O and interrupt I/O pay per unit or per word, DMA pays once per block (Hamacher, chapter on input/output organisation, frames the comparison this way).

**GATE use.** Every 2-mark overhead NAT is this one product. The traps are in $E$: bits against bytes (a factor of 8), 1 KB as 1000 against 1024 bytes, MB/s against Mbit/s, and per-word against per-block counting under DMA. Fix the units of $R$ and $u$ before multiplying.

**Check.** A device producing 80,000 bytes per second, one interrupt per byte, 3 µs per interrupt: $f = 80{,}000 \times 3 \times 10^{-6} = 0.24$, so 24%. Simulating 80,000 events of 3 µs in a 1 s window gives the same 0.24.

## Polling rate and polling cost
<!-- topics: coa-io-interface.programmed-io, coa-io-interface.io-module-registers -->

**Claim.** A device with a one-unit data register delivers $R$ bytes per second in units of $u$ bytes, and each poll (reading the status register and, if ready, moving the unit) costs $C_{\text{poll}}$ cycles. No data is lost only if the CPU polls at least $N_{\text{poll}} = R/u$ times per second at regular intervals, and then the fraction of CPU time spent polling is

$$f_{\text{poll}} = \frac{N_{\text{poll}} \times C_{\text{poll}}}{f_{\text{clk}}} = \frac{R \cdot C_{\text{poll}}}{u \cdot f_{\text{clk}}}.$$

**Derivation.** The controller's data register holds one unit (the status, control and data registers are the whole interface the CPU sees). A new unit arrives every $u/R$ seconds and overwrites the old one. The old unit survives only if a poll falls in the interval between its arrival and the next arrival, an interval of length $u/R$. With polls evenly spaced at period $p$, every interval of length $u/R$ contains a poll exactly when $p \le u/R$, that is, $N_{\text{poll}} = 1/p \ge R/u$. If $p > u/R$, some arrival interval contains no poll and that unit is overwritten. The minimum safe rate is therefore $R/u$, and substituting $E = R/u$ and $C = C_{\text{poll}}$ into the events rule gives $f_{\text{poll}}$. Polls that find the device not ready still cost $C_{\text{poll}}$, which is why the cost depends on the polling rate rather than on whether data arrived.

**GATE use.** The stem gives a rate, a unit and cycles per poll, and asks for the percentage of CPU time. The trap is polling once per byte when the device delivers 16-byte units (16 times too large), or using the bit rate. The second shape contrasts a slow device (a mouse polled 30 times per second costs almost nothing) with a fast one (a disk costs a large fraction), which is the argument for interrupts and DMA.

**Check.** A disk at $4 \times 10^6$ bytes/s in 16-byte units needs $4 \times 10^6 / 16 = 250{,}000$ polls per second. At 400 cycles per poll that is $10^8$ cycles per second, and on a 500 MHz CPU $f_{\text{poll}} = 10^8 / (5 \times 10^8) = 20\%$. A mouse at 30 polls per second with the same cost uses $30 \times 400 / (5 \times 10^8) = 0.0024\%$. A simulation of one second with polls at 250,000 per second loses no unit; at 200,000 per second it loses 50,000 of the 250,000, since each interval $[4k, 4k+4)$ µs holds at most one poll.

## Gain of interrupt mode over programmed I/O
<!-- topics: coa-io-interface.interrupt-driven-io, coa-io-interface.overhead-comparison, coa-io-interface.programmed-io -->

**Claim.** A device delivers $R$ words per second, one word at a time. Under programmed I/O the CPU busy-waits from the moment it issues the command until each word is ready, so it is occupied for the whole gap $t_{\text{word}} = 1/R$ per word. Under interrupt I/O it spends only the interrupt overhead $t_{\text{ISR}}$ per word. With the register-to-memory transfer time negligible and $t_{\text{ISR}} \le 1/R$, the factor by which interrupt mode reduces the CPU time spent on the device is

$$\text{gain} = \frac{t_{\text{word}}}{t_{\text{ISR}}} = \frac{1/R}{t_{\text{ISR}}}.$$

**Derivation.** Over $n$ words programmed I/O occupies the CPU for $n \cdot (1/R)$ seconds: between words it is inside the status-test loop, so every instant belongs to the device. Interrupt mode occupies it for $n \cdot t_{\text{ISR}}$ seconds; between interrupts it runs other programs. The ratio of the two busy times is $(1/R)/t_{\text{ISR}}$, independent of $n$. The interrupt sequence explains what $t_{\text{ISR}}$ contains: the CPU finishes the current instruction, the hardware saves the PC and status word and acknowledges the device, the CPU branches through the vector table, the ISR saves the registers it uses, moves the word and clears the request, and the return instruction restores the PC and status. All of that is charged per word. If $t_{\text{ISR}} > 1/R$ the CPU cannot finish one interrupt before the next word arrives, the events rule's condition fails, and the device cannot be run in interrupt mode at all.

**GATE use.** The classic 2-mark question gives 10 KB/s and a 4 µs overhead and asks for the minimum gain. The answer moves with the reading of KB: 1000 bytes gives exactly 25, 1024 bytes gives about 24.41. Use the convention the question states. The second trap is adding $t_{\text{ISR}}$ to programmed I/O: programmed I/O has no interrupt overhead, only the wait.

**Check.** At $R = 10{,}000$ bytes/s, $1/R = 100$ µs and the gain is $100/4 = 25$. With 1 KB = 1024 bytes, $1/R = 1/10{,}240$ s $= 97.66$ µs and the gain is $24.41$.

## DMA overhead per block
<!-- topics: coa-io-interface.dma-operation, coa-io-interface.overhead-comparison, coa-io-interface.io-techniques -->

**Claim.** A device moves $R$ bytes per second by DMA in blocks of $B$ bytes. For each block the CPU spends $C_{\text{setup}}$ cycles programming the controller's address, count and control registers and $C_{\text{done}}$ cycles servicing the completion interrupt. Ignoring bus contention, the CPU fraction lost is

$$f_{\text{DMA}} = \frac{R}{B} \times \frac{C_{\text{setup}} + C_{\text{done}}}{f_{\text{clk}}}.$$

DMA costs less CPU time than one interrupt per byte costing $C_{\text{int}}$ cycles exactly when $B > (C_{\text{setup}} + C_{\text{done}})/C_{\text{int}}$.

**Derivation.** In a DMA transfer the CPU loads the start address, the word count and the direction and mode, then returns to its own work. The controller raises HOLD, the CPU completes its current bus cycle, floats the bus and answers HLDA, and the controller is bus master. For each word the controller drives the address, signals the device with DACK, moves the word, increments the address register and decrements the count. When the count reaches zero it releases the bus and interrupts once. No CPU instruction runs per word, so the CPU's events are blocks: $E = R/B$, each costing $C_{\text{setup}} + C_{\text{done}}$ cycles, and the events rule gives the formula. Per-byte interrupts cost $R \cdot C_{\text{int}}/f_{\text{clk}}$. Dividing the two, DMA wins when $(C_{\text{setup}} + C_{\text{done}})/B < C_{\text{int}}$, which rearranges to the stated bound on $B$. The formula leaves out the cycles in which the CPU needs the bus while the controller holds it; those are the bus-contention cost, computed separately with the cycle-stealing fraction.

**GATE use.** The problem gives the same disk as a polling question, now under DMA, and asks for the percentage. The trap is counting per word instead of per block, which reproduces the interrupt answer. Concept questions ask when the CPU is involved: only at setup and at the completion interrupt, never per byte.

**Check.** A $4 \times 10^6$ bytes/s disk with 8,000-byte blocks gives $500$ blocks per second; at $1{,}000 + 500 = 1{,}500$ cycles per block on 500 MHz the cost is $750{,}000 / (5 \times 10^8) = 0.15\%$. One 500-cycle interrupt per 16-byte unit on the same disk would cost $250{,}000 \times 500 / (5 \times 10^8) = 25\%$. With $C_{\text{int}} = 500$ per byte, DMA wins for every block larger than $1{,}500/500 = 3$ bytes.

## Minimum DMA bus acquisitions from the count register width
<!-- topics: coa-io-interface.dma-count-register, coa-io-interface.dma-modes -->

**Claim.** A DMA controller with a $c$-bit word count register moves at most $2^{c}$ addressable units in one programmed transfer, using the GATE convention that the count can describe $2^c$ units. In burst mode it takes the bus once per programmed transfer. A file of $S$ units then needs at least

$$N = \left\lceil \frac{S}{2^{c}} \right\rceil$$

bus acquisitions, and $N$ acquisitions suffice. In cycle-stealing mode each unit is its own acquisition, so the count is $S$.

**Proof.** Lower bound: each acquisition moves at most $2^c$ units, so $N'$ acquisitions move at most $N' \cdot 2^c$ units. Moving all $S$ units requires $N' \cdot 2^c \ge S$, so $N' \ge S/2^c$, and since $N'$ is an integer, $N' \ge \lceil S/2^c \rceil$. Achievability: program $\lfloor S/2^c \rfloor$ full transfers of $2^c$ units each, plus one transfer of the remaining $S \bmod 2^c$ units if that is nonzero. That is exactly $\lceil S/2^c \rceil$ transfers. The unit is the addressable word: on a byte-addressable machine $S$ is in bytes, on a 32-bit word-addressable machine it is in words. If the hardware instead caps the count at $2^c - 1$, the bound becomes $\lceil S/(2^c - 1) \rceil$, which differs only when $S$ is close to a multiple of $2^c$.

**GATE use.** The standard shape: a 16-bit count register, a file of 29,154 KB, byte-addressable memory, the minimum number of times the controller takes the bus. The traps are rounding down (a partial final block still needs its own acquisition), reading KB as 1000 bytes, and answering with the cycle-stealing count when the stem says the controller holds the bus for a full count.

**Check.** $S = 29{,}154 \times 1024 = 29{,}853{,}696$ bytes and $S / 2^{16} = 455.53$, so $N = 456$. Under the $2^{16} - 1$ cap the answer is also 456. A 4 MB file ($4 \times 2^{20}$ bytes) is an exact multiple: $4 \times 2^{20}/2^{16} = 64$ acquisitions, with no partial block.

## Blocked fraction under cycle stealing and burst DMA
<!-- topics: coa-io-interface.dma-modes -->

**Claim.** A device under cycle-stealing DMA needs $X$ time to prepare a word, and moving it over the bus takes $Y$, during which the CPU cannot use the bus. Assume the CPU needs the bus in every cycle (the worst case GATE intends) and $X \ge Y$. Then the fraction of time the CPU is blocked is

$$f_{\text{blocked}} = \frac{Y}{X} \;\text{(next word prepared during the transfer)}, \qquad f_{\text{blocked}} = \frac{Y}{X + Y} \;\text{(preparation waits for the transfer)}.$$

Under burst DMA moving a block of $k$ words every $P$ time units, the CPU is blocked for $kY/P$. Under transparent DMA it is never blocked.

**Derivation.** The process is periodic, so the blocked fraction is the blocked time per period divided by the period. Each period moves one word, so the blocked time per period is $Y$. With overlap, the device starts the next word as soon as the current one is handed over, so words are ready every $X$, and because $X \ge Y$ each transfer finishes before the next word is ready: the period is $X$. Without overlap, the device starts preparing only after the transfer finishes, so one period is preparation followed by transfer, $X + Y$. Dividing gives the two formulas. In burst mode the controller holds the bus for all $k$ words, $kY$ time, once per period $P$, giving $kY/P$. Transparent DMA uses only cycles in which the CPU does not drive the bus, such as instruction decode, so by construction it never delays the CPU; that is why it is the slowest mode for the transfer itself. The source notes' page 21 confuses cycle stealing with transparent DMA; the chapter's errata records the correction.

**GATE use.** The MCQ gives $X$ and $Y$ and offers both $Y/X$ and $Y/(X + Y)$ as options. Read the stem for whether the next word is prepared while the current one moves. The concept trap is calling cycle stealing the mode with no CPU slowdown; that is transparent mode.

**Check.** $X = 40$ µs and $Y = 1$ µs: with overlap $1/40 = 2.5\%$, without $1/41 = 2.44\%$. A simulation of 100,000 words gives 2.4999% and 2.4390%. Burst mode moving 64 words of 1 µs each every 1,000 µs blocks the CPU for $64/1{,}000 = 6.4\%$.

## Interrupt latency
<!-- topics: coa-io-interface.interrupt-latency, coa-io-interface.interrupt-driven-io -->

**Claim.** Interrupt latency is the time from the assertion of the request to the first instruction of the ISR. If the CPU samples the request line only at the end of each instruction cycle and interrupts are enabled, then

$$t_{\text{lat}} = t_{\text{finish instr}} + t_{\text{save}} + t_{\text{vector}},$$

where $t_{\text{finish instr}}$ is the remaining time of the current instruction, $t_{\text{save}}$ the hardware context save and $t_{\text{vector}}$ the vector fetch and branch. If interrupts can be disabled for an interval of length $D$, the worst-case latency adds $D$ and uses the longest instruction.

**Derivation.** The request arrives at some point inside an instruction. Because the CPU tests the request line only after the execute phase completes, nothing happens until the current instruction ends, which takes $t_{\text{finish instr}}$. At that sampling point the CPU accepts the interrupt and performs three actions in sequence: it saves the PC and status word ($t_{\text{save}}$), then reads the vector and loads the ISR address into the PC ($t_{\text{vector}}$). The next instruction fetched is the first ISR instruction, so latency ends there. The three intervals are consecutive and do not overlap, so they add. If interrupts are masked, the request stays pending until they are re-enabled, so the worst case starts with a request arriving just as a disabled interval of length $D$ begins and the instruction running when it ends is the longest; that adds $D$ and replaces $t_{\text{finish instr}}$ by its maximum. Times given in cycles convert at one clock period, $1/f_{\text{clk}}$, per cycle.

**GATE use.** The stem gives cycle counts and a clock rate and the options leave out one term each: forgetting the instruction completion, forgetting the vector fetch, or counting only the save. A second shape asks why latency includes finishing the instruction; the answer is the end-of-cycle sampling.

**Check.** At 100 MHz one cycle is 10 ns. With 12 cycles left, 30 cycles of save and 8 cycles of vectoring, $t_{\text{lat}} = 50 \times 10 = 500$ ns. Dropping the completion, save or vector term gives 380, 200 or 420 ns, and counting only the save gives 300 ns; these are the distractors. If the longest instruction takes 20 cycles and interrupts can be off for 100 cycles, the worst case is $(100 + 20 + 30 + 8) \times 10 = 1{,}580$ ns.

## Vectored against polled identification, and daisy-chain priority
<!-- topics: coa-io-interface.interrupt-types, coa-io-interface.interrupt-priority -->

**Claim.** (a) With a polled (non-vectored) handler that checks $n$ device status registers in a fixed order at cost $c$ per check, the time to identify the device at position $k$ is $kc$, so it grows linearly with the number of devices checked before the source; a vectored interrupt identifies the source in constant time because the device supplies the ISR address or a vector-table index during acknowledge. (b) In a daisy chain where the acknowledge enters at device 1 and each device passes it on only if it is not requesting, the device that receives the acknowledge is the requesting device with the smallest position. (c) With nesting enabled and the current ISR at priority $p$, only a request of priority higher than $p$ can interrupt it.

**Proof.** (a) The handler reads status registers 1, 2, … and stops at the first one with its request bit set, so reaching device $k$ takes $k$ reads. A vectored device places its vector on the data bus during the acknowledge cycle, and the CPU branches through it with no reads of other devices. (b) Invariant: the acknowledge reaches device $i$ exactly when no device $j < i$ is requesting. It holds for $i = 1$, since the acknowledge enters there. If it holds for $i$, the acknowledge leaves device $i$ only when device $i$ is not requesting, so it reaches device $i + 1$ exactly when no device $j \le i$ is requesting. The requesting device with the smallest index $m$ therefore receives the acknowledge and keeps it, and no device beyond $m$ receives it. Priority equals physical position, it is fixed by the wiring, and under steady requests from nearer devices a far device never receives the acknowledge. (c) On accepting an interrupt at priority $p$ the hardware masks levels at or below $p$; a priority encoder outputs the highest active unmasked request, so only levels above $p$ reach the CPU, and equal or lower requests stay pending until the return restores the old mask.

**GATE use.** Concept MCQs: what the device supplies in a vectored scheme (the vector, not data and not the PC), why polled response degrades with device count, and which device wins in a daisy chain (the nearest requester, not the first by a few nanoseconds). The NMI fact belongs here too: clearing the interrupt-enable flag masks only maskable interrupts, so power-failure warnings go to the NMI line.

**Check.** Eight devices polled at 10 cycles per check: the source is found after $10, 20, \dots, 80$ cycles depending on position, 45 cycles on average if every position is equally likely. Enumerating all 16 request patterns on a four-device chain confirms the winner is always the lowest-indexed requester; with D2 and D4 requesting, D2 wins.

## Lines needed by each bus arbitration scheme
<!-- topics: coa-io-interface.bus-arbitration -->

**Claim.** With $n$ bus masters and one central arbiter: polling needs $L = \lceil \log_2 n \rceil$ poll lines, independent requesting needs $2n$ lines (one request and one grant per master), and daisy chaining needs a fixed number independent of $n$ (one shared request line, one serial grant line and one busy line). In distributed arbitration over $w$ wired-OR id lines, where each master drives its id and, scanning from the most significant bit, withdraws when it sees a 1 on a line where its own bit is 0, the master with the highest id wins.

**Proof.** Polling: the arbiter must name each of the $n$ masters with a distinct pattern on $L$ binary lines, and $L$ lines carry $2^L$ patterns, so $2^L \ge n$ is required, giving $L \ge \log_2 n$ and the integer minimum $\lceil \log_2 n \rceil$; binary numbering achieves it. Independent requests: each master must be able to request and to be granted on its own, with no sharing, so each needs its own request and grant line, $2n$ in total. Daisy chain: all masters share the request and busy lines and the grant line passes through each master, so adding a master adds no line. Distributed: induct on bit positions from the top. After the scan of bit $b$, the masters still active are exactly those whose ids agree with the maximum id in bits $w-1$ down to $b$. At bit $b$, if any active master has a 1 the wired-OR line reads 1 and the masters with 0 withdraw; the maximum id has a 1 there in that case, since among ids agreeing in the higher bits a 1 beats a 0. If no active master has a 1, nobody withdraws. After bit 0 only ids equal to the maximum remain, and ids are distinct, so one master is left.

**GATE use.** Line-count MCQs: 32 masters need 5 poll lines, not 64 (independent: 32 request plus 32 grant lines) and not 1 (the daisy-chain grant). Priority questions: in a daisy chain the master nearest the arbiter wins; in polling the order can be changed by software because the arbiter chooses which numbers to put on the lines.

**Check.** $\lceil \log_2 n \rceil$ for $n = 2, 3, 4, 5, 8, 32, 33, 64, 100$ is $1, 2, 2, 3, 3, 5, 6, 6, 7$; 33 masters already need a sixth line. Simulating the distributed scheme on 2,000 random sets of 4-bit ids always leaves only the maximum; with ids 5, 6 and 3 (0101, 0110, 0011), all stay at bit 3, 5 and 6 survive bit 2, and 6 wins at bit 1.

## Address space cost of memory-mapped I/O
<!-- topics: coa-io-interface.io-addressing, coa-io-interface.io-module-registers -->

**Claim.** On a machine with $a$ address bits, assigning $k$ addresses to device registers under memory-mapped I/O leaves at most $2^a - k$ addresses for memory, and every instruction that can reference memory can reach a device register. Under isolated I/O a separate control line selects an I/O space, devices are reached only through IN and OUT, and all $2^a$ memory addresses remain available.

**Proof.** Under memory-mapped I/O the address decoder maps each address in $[0, 2^a)$ to exactly one target, a memory cell or a device register. The $k$ device addresses are therefore not memory, which leaves $2^a - k$. Because the device registers occupy ordinary addresses, any load, store or instruction with a memory operand generates a bus cycle the decoder routes to the device, so no special opcode is needed; the region must be uncacheable, since a cached copy of a status register would hide the device's changes. Under isolated I/O the memory-or-I/O control line is a further address bit that only IN and OUT set, so the pairs (line = memory, address) and (line = I/O, port) are disjoint sets, and memory keeps all $2^a$ addresses. The cost moves to the instruction set: ordinary memory instructions cannot touch a port.

**GATE use.** MSQs and MCQs test the two pairs of facts. The trap is saying that isolated I/O consumes memory addresses; it is memory-mapped I/O that does, and it is isolated I/O that needs the special instructions and the extra control line.

**Check.** A 16-bit machine that reserves 4 KB for device registers under memory-mapped I/O can address $(2^{16} - 4{,}096)/1{,}024 = 60$ KB of memory; under isolated I/O it keeps all 64 KB and has its ports in a separate space.

## Timing of a four-phase asynchronous handshake
<!-- topics: coa-io-interface.bus-timing -->

**Claim.** Let a signal take $t_p$ to propagate one way between master and slave, and let the slave need $t_a$ to produce read data. A read under full (four-phase) handshaking takes at least $4t_p + t_a$ from the master raising request to the master seeing acknowledge drop, and the master holds valid data after $2t_p + t_a$. A synchronous bus instead fixes a clock period $T_{\text{clk}} \ge 2t_p + t_{\text{skew}} + t_{a,\max}$ (plus the master's setup time), set by the slowest device and the clock skew.

**Derivation.** The four phases are sequential, each started by the arrival of the previous signal. Phase 1: the master places the address and raises request, which reaches the slave after $t_p$. The slave then takes $t_a$ to read the data. Phase 2: it places the data and raises acknowledge, which reaches the master after another $t_p$; the master latches the data at $2t_p + t_a$. Phase 3: the master drops request, seen by the slave after $t_p$. Phase 4: the slave removes the data and drops acknowledge, seen by the master after $t_p$. Adding gives $4t_p + t_a$: four one-way crossings, or two round trips, plus the access time. No clock enters, so a slow slave just raises acknowledge later and fast slaves are not slowed. A synchronous transfer must complete within one clock period for every device, so the period has to cover the address propagating out to the slave and the data propagating back to the master ($2t_p$), the skew between the clocks seen at the two ends and the slowest access time; the bus length is limited because skew grows with it.

**GATE use.** Concept MCQs ask for the advantage of the asynchronous bus (devices of different speeds share it without a common clock) and its cost (the round trips of handshaking). The trap option claims the asynchronous bus is always faster; per transfer it is usually slower.

**Check.** With $t_p = 20$ ns and $t_a = 60$ ns the handshake completes in $4 \times 20 + 60 = 140$ ns and the master has the data at $2 \times 20 + 60 = 100$ ns. A synchronous bus with 10 ns of skew and the same slowest device needs $T_{\text{clk}} \ge 2 \times 20 + 10 + 60 = 110$ ns; a 90 ns period counting only one propagation would end before the data reaches the master at 100 ns.
