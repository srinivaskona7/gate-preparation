# Memory hierarchy: derivations

## The tag, index and offset split of an address
<!-- topics: coa-memory-hierarchy.address-split, coa-memory-hierarchy.direct-mapped, coa-memory-hierarchy.set-associative -->

**Claim.** Let memory be addressed in units (bytes unless the question says words) with $A$-bit addresses, and let a cache of data capacity $C$ units hold blocks of $B$ units in $L = C/B$ lines grouped into sets of $k$ lines, where $B$, $C$ and $k$ are powers of 2. Then the cache has $S = L/k = C/(Bk)$ sets, and every address splits uniquely as tag, index and offset with

$$\text{offset} = \log_2 B, \qquad \text{index} = \log_2 S, \qquad \text{tag} = A - \log_2 S - \log_2 B = \log_2 \frac{2^A}{C} + \log_2 k.$$

Block $b = \lfloor a/B \rfloor$ of address $a$ may be placed only in set $b \bmod S$. Direct mapping is $k = 1$ ($S = L$), fully associative is $k = L$ ($S = 1$, no index bits). Doubling $k$ at fixed $C$ removes one index bit and adds one tag bit.

**Derivation.** Division with remainder writes every address as $a = bB + o$ with $0 \le o < B$, and again $b = tS + s$ with $0 \le s < S$, so $a = (tS + s)B + o$. Because $B$ and $S$ are powers of 2, $o$ is the low $\log_2 B$ bits of $a$, $s$ the next $\log_2 S$ bits and $t$ the remaining high bits, so the map $a \mapsto (t, s, o)$ is a bijection between addresses and triples. The offset picks a unit inside the block, so it needs $\log_2 B$ bits. The placement rule sends block $b$ to set $s = b \bmod S$, so the index field is exactly the set number. All blocks that share a set differ only in $t$, so storing $t$ beside the line identifies which of them is present; the tag needs the $A - \log_2 S - \log_2 B$ bits not already implied by the line's position and the offset. Substituting $S = C/(Bk)$ gives $\log_2 S + \log_2 B = \log_2 C - \log_2 k$, which is the second form of the tag. Replacing $k$ by $2k$ halves $S$, so the index loses a bit and, since the total is fixed at $A$, the tag gains it. With $k = L$ we get $S = 1$ and the tag is $A - \log_2 B$ bits.

**GATE use.** The 1-mark NAT gives sizes and asks for one field. The trap is taking the index from the number of lines instead of sets in a $k$-way cache. A second trap is a word-addressable memory, where $B$ and $C$ must be counted in words before taking logarithms. A third is a trace question that maps raw byte addresses to lines without first dividing by $B$.

**Check.** A 32-bit address, 32 KB 8-way cache with 32-byte blocks: $L = 1024$, $S = 128$, offset 5, index 7, tag $32 - 7 - 5 = 20$, and the second form gives $\log_2(2^{32}/2^{15}) + 3 = 20$. A 4 KB 4-way cache with 16-byte blocks: $L = 256$, $S = 64$, offset 4, index 6, tag 22. For an 8-bit address with $B = 4$ and $S = 4$, a script checked all 256 addresses decompose into 256 distinct triples.

## Placement determines the hit and miss trace
<!-- topics: coa-memory-hierarchy.direct-mapped, coa-memory-hierarchy.set-associative, coa-memory-hierarchy.replacement -->

**Claim.** In a $k$-way cache with $S$ sets the reference stream splits into $S$ independent sub-streams, one per set, and each set behaves as a fully associative cache of $k$ lines on its own sub-stream. Every first reference to a block misses, so misses $\ge$ number of distinct blocks. A direct-mapped cache needs no replacement policy, and when $j$ blocks that map to one direct-mapped line are referenced in turn, with no block repeated back to back, every reference misses.

**Proof.** A block can live only in set $b \bmod S$, so a reference to block $b$ reads and may change only that set's lines. The contents of set $s$ after any prefix of the trace therefore depend only on the references in that prefix whose block maps to $s$, which is the independence claim. Within a set any line may hold any of its blocks, which is the definition of a fully associative cache of size $k$. A block not referenced before cannot be present, since lines start invalid and a block enters only when it is referenced, so its first reference misses. With $k = 1$ the incoming block has exactly one line to go to, so there is nothing to choose. If successive references to one line name different blocks, each reference finds the previous block there and misses.

**GATE use.** The 2-mark trace NAT: compute $b$, then $b \bmod S$, keep one recency list per set, and count. Traps are forgetting the division by the block size, using lines instead of sets, and applying FIFO when the question says LRU (their eviction orders split once a hit lands on a block other than the most recently loaded one in its set, because LRU then reorders the set and FIFO does not; from the next eviction on the victims can differ).

**Check.** Blocks 0, 4, 0, 4, 8, 0, 4 on 4 lines: direct mapped puts all in line 0 and misses 7 times; 2-way LRU has 2 sets, all blocks in set 0, giving M M H H M M M, 5 misses; fully associative LRU misses only on the 3 distinct blocks. Byte addresses 0, 4, 8, 12, 0, 4, 8 with 1-byte blocks on 4 direct-mapped lines all land in line 0, so 7 misses and 0 hits. All four counts were reproduced by simulation.

## Tag directory size and comparator count
<!-- topics: coa-memory-hierarchy.tag-directory, coa-memory-hierarchy.address-split -->

**Claim.** If each line stores its tag, a valid bit $v = 1$, a dirty bit $d$ ($1$ for write-back, $0$ for write-through) and $r$ replacement bits, the tag directory holds

$$L \times (\text{tag} + v + d + r) \text{ bits},$$

excluding the data array. A $k$-way lookup needs $k$ comparators each tag-wide plus a $k$-to-1 multiplexer; a direct-mapped cache needs 1 comparator and no way multiplexer; a fully associative one needs $L$ comparators.

**Derivation.** Every line, not every set, has its own tag and status bits, because the $k$ lines of a set hold $k$ different blocks. Summing the per-line metadata over $L$ lines gives the formula. The data bits are $L \cdot B \cdot 8$ and are counted separately when a question asks for the total cache size. For lookup, the index selects one set, and the block may be in any of its $k$ lines, so the address tag must be compared with all $k$ stored tags. Doing this in one cycle needs $k$ parallel comparators of tag width; the index bits are never compared, since they were used to select the set. The single matching way then steers its data through a $k$-to-1 multiplexer. With $k = 1$ there is one candidate; with $S = 1$ every line is a candidate. The value of $r$ depends on the scheme: a per-line LRU counter for a $k$-way set uses $\log_2 k$ bits, which is the convention behind $r = \log_2 k$; exact LRU state for a set needs at least $\lceil \log_2 k! \rceil$ bits per set.

**GATE use.** The 2-mark NAT on tag-memory size. Traps: multiplying by sets instead of lines, forgetting the dirty bit in a write-back cache, and adding the data array. The comparator MCQ tempts with a comparator as wide as tag plus index.

**Check.** 32-bit address, 16 KB 4-way write-back cache, 64-byte blocks: $L = 256$, $S = 64$, offset 6, index 6, tag 20; directory $256 \times 22 = 5632$ bits, and with 2 LRU bits per line $256 \times 24 = 6144$. A 1024-line 4-way cache with 20-bit tags needs 4 comparators of 20 bits and a 4-to-1 multiplexer.

## LRU never shows Belady's anomaly, FIFO can
<!-- topics: coa-memory-hierarchy.replacement -->

**Claim.** For a fully associative cache (or one set) of $n$ lines and any reference string, let $M_n$ be the set of blocks held by LRU after each prefix. Then $M_n \subseteq M_{n+1}$ at every step, so LRU with $n + 1$ lines never misses more than with $n$. FIFO has no such property, and Belady's optimal policy, which evicts the block whose next use is farthest away, gives the fewest misses of any policy.

**Proof.** After any prefix, once at least $n$ distinct blocks have been referenced, LRU with $n$ lines holds exactly the $n$ most recently used distinct blocks; before that it holds all of them. Induct on the prefix: a hit leaves the set unchanged and moves the block to the front of the recency order; a miss inserts the new block and, if full, drops the block used longest ago, which leaves the $n$ most recent again. The $n$ most recent distinct blocks are a subset of the $n + 1$ most recent, so $M_n \subseteq M_{n+1}$. A hit with $n$ lines means the block is in $M_n \subseteq M_{n+1}$, so it is also a hit with $n + 1$ lines. FIFO's contents depend on load order, not recency, and a hit does not refresh the order, so the subset argument fails; the string below shows FIFO with 4 frames faulting more than with 3. For optimality of MIN, take an optimal policy that first differs from MIN at some miss, evicting $x$ where MIN evicts $y$, with $y$ used later than $x$ or never. Build a modified run that evicts $y$ instead. Its contents are then the original's with $x$ in place of $y$, and it copies the original's choices, evicting $x$ whenever the original evicts $y$. Since $y$ is next used after $x$, the first reference that tells the two apart is to $x$. If the original evicts $y$ before that reference, the modified run evicts $x$ at the same step and the two runs become identical with equal misses. Otherwise, at $x$'s next reference the original misses and the modified run hits, which banks one saved miss. The original loads $x$ and evicts some $z$; if $z = y$ the runs are now identical. If not, the original holds $y$ where the modified run holds $z$, and the modified run continues copying with $z$ standing in for $y$. While the runs differ by one such pair $(y, u)$, a reference to any other block costs both the same; the original evicting $y$ is matched by the modified run evicting $u$, which merges them; a reference to $u$ is a miss only in the original, banking another miss; and the first reference to $y$ is a miss only in the modified run, which evicts $u$ to load $y$ and merges the runs at the cost of one banked miss. So the modified run never misses more than the original, it stays optimal, and it agrees with MIN one step longer. Repeating moves the first difference later, which shows MIN is optimal (the exchange argument in Hennessy and Patterson's and Galvin's treatments).

**GATE use.** Page-fault or cache-trace counts under FIFO, LRU and optimal, and the MCQ asking which policy suffers Belady's anomaly. The trap is assuming more frames always help.

**Check.** On 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5: FIFO faults 9 with 3 frames and 10 with 4; LRU faults 10 with 3 frames and 8 with 4; optimal with 4 frames faults 6. On 1, 2, 3, 4, 2, 1, 5, 6, 2, 1, 2, 3, 7, 6, 3, 2, 1, 2, 3, 6 with 4 frames: LRU 10, FIFO 14, optimal 8. A script also checked $\text{LRU}(n+1) \le \text{LRU}(n)$ on 2000 random strings.

## Write-through, write-back and the dirty-victim penalty
<!-- topics: coa-memory-hierarchy.write-policies, coa-memory-hierarchy.cache-performance -->

**Claim.** With write-through, main memory receives one write per store, so memory is current after every store. With write-back plus a dirty bit, memory receives one block write per eviction of a dirty block, however many stores hit that block while it was resident. Assume every miss replaces a valid block (a full cache in steady state; a miss that fills an invalid line writes nothing back). If a fraction $d$ of evicted blocks is dirty and moving one block takes $t_{\text{block}}$, the mean time to serve a miss in a write-back, write-allocate cache is

$$t_{\text{miss}} = (1 + d)\, t_{\text{block}}.$$

**Derivation.** Write-through forwards each store to memory, which gives the first count. Write-back updates only the cache line and sets its dirty bit. Memory changes only when the line leaves the cache, and the dirty bit is set exactly when at least one store hit the line since it was loaded, so clean victims are dropped without a write and dirty victims cost one block write. For the penalty, every miss fetches the new block, costing $t_{\text{block}}$. By the assumption every miss has a victim, and with probability $d$ that victim is dirty and must first be written back, costing another $t_{\text{block}}$, so the expected cost is $t_{\text{block}} + d\, t_{\text{block}}$. On a write miss, write-allocate fetches the block and then writes into it, which pays off only if later stores hit it, and that is what write-back exploits; no-write-allocate sends the store to memory and leaves the cache unchanged, which suits write-through, where the store goes to memory anyway. Only write-back needs a dirty bit, since a write-through line is never newer than memory.

**GATE use.** MSQs on the policies and their pairings, tag-directory questions that hinge on the dirty bit, and NATs that add the write-back of dirty victims to the miss penalty. The trap is charging the write-back on every miss instead of a fraction $d$ of them.

**Check.** A loop that stores 100 times into one resident block: write-through makes 100 memory writes, write-back makes 1 at eviction. With $t_{\text{block}} = 40$ cycles and $d = 0.3$, the mean miss costs $1.3 \times 40 = 52$ cycles.

## Average access time: hierarchical versus simultaneous
<!-- topics: coa-memory-hierarchy.emat, coa-memory-hierarchy.hierarchy-locality -->

**Claim.** Take one cache with access time $t_c$ and hit ratio $h$ over main memory with access time $t_m$ that always answers. If a miss is detected only after the cache lookup (hierarchical, look-through access), the mean access time is

$$T_{\text{hier}} = h\,t_c + (1 - h)(t_c + t_m) = t_c + (1 - h)\,t_m,$$

which is $\mathrm{AMAT} = t_{\text{hit}} + m\,t_{\text{penalty}}$ with $m = 1 - h$ and $t_{\text{penalty}} = t_m$. If cache and memory are probed together (simultaneous, look-aside), $T_{\text{sim}} = h\,t_c + (1 - h)\,t_m$. Always $T_{\text{hier}} - T_{\text{sim}} = (1 - h)\,t_c \ge 0$.

**Derivation.** Each reference is a hit with probability $h$ or a miss with probability $1 - h$, so by total expectation the mean time is $h \cdot (\text{hit time}) + (1 - h)(\text{miss time})$. A hit costs $t_c$ in both organisations. In the hierarchical case a miss has already spent $t_c$ discovering it is a miss, then waits $t_m$, so the miss time is $t_c + t_m$; expanding, $h t_c + (1-h) t_c + (1-h) t_m = t_c + (1-h) t_m$. In the simultaneous case the memory access started at time 0, so a miss finishes at $t_m$ and the miss time is $t_m$. Subtracting the two expressions leaves $(1-h)t_c$. The formula is why the hierarchy works (locality is what makes $h$ close to 1): the average stays near $t_c$ while the capacity is that of the large level.

**GATE use.** The 1- and 2-mark NAT on effective access time. Read the wording: a quoted miss penalty added to the hit time, or "on a miss the request is forwarded", is hierarchical; "accessed in parallel" is simultaneous. The traps are writing $h t_c + (1-h) t_m$ for a look-through system and treating $t_{\text{hit}} + t_{\text{penalty}}$ as the average rather than the cost of one miss.

**Check.** $h = 0.95$, $t_c = 1$ ns, $t_m = 100$ ns: $T_{\text{hier}} = 1 + 0.05 \times 100 = 6$ ns and $T_{\text{sim}} = 0.95 + 5 = 5.95$ ns, a difference of $0.05 \times 1$. Against 100 ns with no cache, the speed-up is $100/6 \approx 16.7$.

## Two-level caches and local versus global miss rates
<!-- topics: coa-memory-hierarchy.multilevel-cache, coa-memory-hierarchy.emat, coa-memory-hierarchy.hierarchy-locality -->

**Claim.** Let L1 have access time $t_1$ and miss rate $m_1 = 1 - h_1$, L2 access time $t_2$ and local miss rate $m_2 = 1 - h_2$ (L2 misses divided by references that reach L2), and memory time $t_{\text{mem}}$. Under hierarchical access

$$\mathrm{AMAT} = t_1 + m_1\,(t_2 + m_2\,t_{\text{mem}}) = h_1 t_1 + (1-h_1) h_2 (t_1 + t_2) + (1-h_1)(1-h_2)(t_1 + t_2 + t_{\text{mem}}),$$

under simultaneous access $T = h_1 t_1 + (1 - h_1)\,h_2\,t_2 + (1 - h_1)(1 - h_2)\,t_{\text{mem}}$, and the global L2 miss rate is $g_2 = m_1 m_2$ = L2 misses / CPU references.

**Derivation.** Apply the one-level result to L1, treating everything below L1 as a single memory whose mean access time is $T_2$: then $\mathrm{AMAT} = t_1 + m_1 T_2$. The references that reach L2 see L2 as a one-level cache over memory, with miss rate $m_2$ measured on exactly those references, so $T_2 = t_2 + m_2 t_{\text{mem}}$; substituting gives the first form. For the second, split references by the level that serves them: L1 serves a fraction $h_1$; L2 a fraction $(1 - h_1) h_2$, since a reference must miss L1 and then hit L2; memory serves $(1-h_1)(1-h_2)$. Under hierarchical access each pays every level it passed, $t_1$, $t_1 + t_2$ and $t_1 + t_2 + t_{\text{mem}}$. Collecting the $t_1$ terms gives $t_1(h_1 + (1-h_1)h_2 + (1-h_1)(1-h_2)) = t_1$, the $t_2$ terms give $(1-h_1)t_2$ and the memory term $(1-h_1)(1-h_2)t_{\text{mem}}$, which is the first form expanded. Under simultaneous access each fraction pays only the level that answered, which is the third formula. For $g_2$: of $N$ references, $m_1 N$ reach L2 and $m_2 m_1 N$ miss there, so the fraction of all references missing L2 is $m_1 m_2$. When a question quotes a global rate $g$, the local rate is $m_2 = g/m_1$. In an inclusive hierarchy every L1 block is also in L2, so the distinct capacity is that of L2; an exclusive hierarchy keeps a block in at most one level and the capacity is the sum.

**GATE use.** The 2-mark NAT on two-level access time. Traps: plugging a global L2 rate into $m_2$, adding $t_1$ to the miss paths of a simultaneous system, and charging $t_2$ on every reference.

**Check.** $t_1 = 1$, $m_1 = 0.1$, $t_2 = 10$, $m_2 = 0.01$, $t_{\text{mem}} = 100$: $1 + 0.1 \times 11 = 2.1$ ns; reading 0.01 as global and adding it as a separate term gives the distractor 3.0. With $t_1 = 2$, $h_1 = 0.8$, $t_2 = 10$, $h_2 = 0.9$, $t_{\text{mem}} = 100$: hierarchical $1.6 + 2.16 + 2.24 = 6.0$ ns, equal to $2 + 0.2 \times 20$, and simultaneous $1.6 + 1.8 + 2.0 = 5.4$ ns. Of 1000 references with 40 L1 misses and 20 L2 misses, L2's local rate is $20/40 = 0.5$ and its global rate $20/1000 = 0.02 = 0.04 \times 0.5$.

## Compulsory, capacity and conflict misses
<!-- topics: coa-memory-hierarchy.three-cs, coa-memory-hierarchy.set-associative -->

**Claim.** For a trace and a cache of $L$ lines, define compulsory misses as the number of distinct blocks referenced, capacity misses as the misses of a fully associative LRU cache of $L$ lines minus the compulsory misses, and conflict misses as the misses of the actual cache minus those of the fully associative cache. The three add up to the actual miss count. A fully associative cache has zero conflict misses by construction, compulsory misses do not depend on cache size, and raising associativity at fixed capacity tends to cut conflict misses but is not guaranteed to, because the conflict count can be negative.

**Proof.** The three definitions telescope: compulsory + capacity + conflict $= D + (F - D) + (X - F) = X$, where $D$ is the distinct-block count, $F$ the fully associative miss count and $X$ the actual one. For the actual cache taken to be the fully associative one, $X = F$, so conflict is 0. $D$ is a property of the trace alone, so a bigger cache leaves it unchanged; by the placement result every first reference misses, so $F \ge D$ and capacity misses are never negative. Conflict misses arise when more live blocks map to one set than it has ways while other sets have room; more ways per set relieve that, but LRU in a fully associative cache is not optimal, so a set-mapped cache can beat it on some traces, as the cyclic trace below shows. Larger blocks at fixed capacity bring in more neighbours per miss, cutting compulsory misses when there is spatial locality, but they leave fewer lines, so conflict and capacity misses and the per-miss transfer time rise eventually.

**GATE use.** MSQs on which change removes which class. The traps are "a larger cache removes compulsory misses" and "larger blocks always lower the miss rate".

**Check.** The cyclic trace 0, 1, 2, 3, 4 repeated three times on 4 lines: fully associative LRU always evicts the block needed next and misses all 15 times; direct mapped keeps 1, 2 and 3 resident and misses 9 times (0 and 4 fight for line 0). So $D = 5$, capacity $= 10$ and conflict $= 9 - 15 = -6$. On 0, 4, 0, 4, 8, 0, 4 with 4 lines, $D = 3$, $F = 3$, and direct mapping's 7 misses are 3 compulsory and 4 conflict.

## Memory stall cycles and effective CPI
<!-- topics: coa-memory-hierarchy.cache-performance -->

**Claim.** If an instruction makes on average $a$ memory accesses, each missing with probability $m$ and stalling the pipeline $P$ cycles on a miss, while hits cost no stall, then

$$\mathrm{CPI} = \mathrm{CPI}_{\text{base}} + a\,m\,P, \qquad a = 1 + f_{\text{data}},$$

where $f_{\text{data}}$ is the number of data references per instruction. With separate instruction and data caches, $\mathrm{CPI} = \mathrm{CPI}_{\text{base}} + 1 \cdot m_I P + f_{\text{data}}\, m_D P$. At a fixed clock, the speed-up of design 1 over design 2 is $\mathrm{CPI}_2/\mathrm{CPI}_1$.

**Derivation.** Over $N$ instructions there are $aN$ accesses, of which an expected $m\,aN$ miss, each adding $P$ stall cycles, so the stall total is $a m P N$ and per instruction $a m P$; the base CPI already counts the cycles of a perfect cache, so the two add. Every instruction is fetched, which contributes 1 to $a$, and each data reference contributes 1 more. Splitting the accesses by cache and summing the expected stalls gives the split form. Execution time is $N \cdot \mathrm{CPI} \cdot t_{\text{clk}}$, so with $N$ and $t_{\text{clk}}$ equal the ratio of times is the ratio of CPIs (Hennessy and Patterson's memory-hierarchy chapter).

**GATE use.** The 2-mark NAT on effective CPI or speed-up. The trap is counting only data accesses; a second one is quoting a miss penalty in ns while the CPI is in cycles, which needs the clock period to convert.

**Check.** $\mathrm{CPI}_{\text{base}} = 1$, $f_{\text{data}} = 0.3$, $m = 0.02$, $P = 100$: $1 + 1.3 \times 0.02 \times 100 = 3.6$, against 1.6 if fetches are forgotten. With $m_I = 0.02$, $m_D = 0.05$ and the same $P$: $1 + 2 + 1.5 = 4.5$.

## Read/write mixes, line fill time, target hit ratio and cost per bit
<!-- topics: coa-memory-hierarchy.performance-extensions, coa-memory-hierarchy.emat, coa-memory-hierarchy.write-policies, coa-memory-hierarchy.hierarchy-locality -->

**Claim.** (a) Let a fraction $f_r$ of references be reads and $f_w = 1 - f_r$ writes, with a write-through, no-write-allocate cache, no write buffer, cache time $t_c$, memory time $t_m$, read hit ratio $h$ and hierarchical reads. Then

$$T = f_r\,\bigl(t_c + (1 - h)\,t_m\bigr) + f_w\,t_m.$$

(b) A line of $B$ bytes fetched over a bus that moves $w$ bytes per transfer of time $t_{\text{bus}}$, after a first-word latency $t_{\text{latency}}$, takes $t_{\text{fill}} = t_{\text{latency}} + (B/w)\,t_{\text{bus}}$, which is $t_{\text{latency}} + B/\text{bandwidth}$. (c) A target mean time $T$ with $t_c \le T \le t_m$ needs hit ratio $h = 1 - (T - t_c)/t_m$ under hierarchical access and $h = (t_m - T)/(t_m - t_c)$ under simultaneous access. (d) A hierarchy of levels with capacities $S_i$ and per-bit costs $c_i$ has average cost per bit $\bar c = \sum_i c_i S_i / \sum_i S_i$.

**Derivation.** (a) Condition on the type of reference. A read is a one-level cache access, so by the hierarchical result its mean time is $t_c + (1 - h)t_m$. Under write-through every write must reach memory before it completes, and with no write buffer the processor waits for it; under no-write-allocate a write miss does not load the line either, so every write costs $t_m$ regardless of hit or miss (the cache update on a hit proceeds in parallel with it). Total expectation over the two types gives the formula. With a write buffer that never fills, the write term drops to $t_c$, which is why the question must say there is none. (b) The first word arrives after the latency; the remaining data stream at the bus rate, $B/w$ transfers of $t_{\text{bus}}$ each, and $w/t_{\text{bus}}$ is the bandwidth, so $(B/w)t_{\text{bus}} = B/\text{bandwidth}$. The model assumes the latency is paid once per line, as in a burst or an interleaved memory; a memory that restarts every word pays it $B/w$ times. (c) The hierarchical mean $t_c + (1-h)t_m$ is strictly decreasing in $h$, so the equation $t_c + (1-h)t_m = T$ has the unique solution $1 - h = (T - t_c)/t_m$. The simultaneous mean $h t_c + (1-h)t_m = t_m - h(t_m - t_c)$ is also strictly decreasing, and setting it to $T$ gives $h = (t_m - T)/(t_m - t_c)$. (d) The hierarchy stores $\sum_i S_i$ bits at total price $\sum_i c_i S_i$; the cost per bit is the ratio. It is a capacity-weighted mean, while access time is weighted by the fraction of references each level serves; this asymmetry is the point of a hierarchy, since a small $S_1$ moves $\bar c$ little while a high $h_1$ moves $T$ a lot (Hamacher's memory chapter frames the trade-off this way).

**GATE use.** NATs on average access time with a write percentage, on line-fill or miss-penalty time from latency and bandwidth, on the hit ratio needed for a target time, and MCQs on hierarchy cost. Traps: charging writes the cache time in a write-through cache, paying the latency per word, solving for $h$ in the wrong access model, and taking the plain mean of the costs.

**Check.** (a) $t_c = 10$, $t_m = 100$, $h = 0.9$, $f_r = 0.8$: $0.8 \times 20 + 0.2 \times 100 = 36$ ns; writes at cache speed would give 18 and simultaneous reads 35.2. (b) $B = 64$, latency 32 ns, 1 GB/s = 1 byte per ns: $32 + 64 = 96$ ns. (c) $t_c = 5$, $t_m = 80$, $T = 12.5$: simultaneous $67.5/75 = 0.9$, hierarchical $1 - 7.5/80 = 0.90625$. (d) 8 MB at 4 and 56 MB at 1: $(32 + 56)/64 = 1.375$, against the plain mean 2.5. A script recomputed all four.

## Miss counts for row-wise and column-wise array traversal
<!-- topics: coa-memory-hierarchy.miss-counting, coa-memory-hierarchy.direct-mapped -->

**Claim.** Let an $R \times N$ array of $w$-byte elements be stored row-major at a block-aligned base 0, so A[i][j] sits at $(iN + j)w$ in block $\lfloor (iN + j)w/B \rfloor$, and let a direct-mapped cache of $L$ lines start empty, with $Nw$ a multiple of $B$. Row-wise traversal misses $RNw/B$ times. Column-wise traversal also misses $RNw/B$ times when the $R$ rows of a column fall into $R$ distinct lines; if $R$ rows share only $R/q$ lines, $q \ge 2$ rows per line, every access misses, $RN$ in all.

**Derivation.** Row-wise, the addresses are $0, w, 2w, \dots$ in order, so each block is touched in one run of $B/w$ consecutive accesses: the first misses and the remaining $B/w - 1$ hit, since nothing else is referenced between them. That gives one miss per block, $RNw/B$ in total, whatever $L$ is. Column-wise, column $j$ touches block $iNw/B + \lfloor jw/B \rfloor$ for rows $i = 0, \dots, R-1$. The row stride in blocks is $s = Nw/B$, so row $i$'s block maps to line $(is + \lfloor jw/B \rfloor) \bmod L$, and rows $i$ and $i'$ collide exactly when $(i - i')s \equiv 0 \pmod L$. For powers of 2 with $s \le L$ the number of distinct lines is $\min(R, L/s)$. If it is $R$, the column's $R$ blocks all stay resident, the next $B/w - 1$ columns reuse them, and the count is again one miss per block. If each line receives $q \ge 2$ rows, the $q$ rows sharing a line load their blocks in turn, so after the column only the block of the last of them is resident. The next column, which needs the same blocks, starts again with the first of those rows: it misses and evicts the block of the last row before that row is reached, and the same happens down the line, so all $RN$ accesses miss.

**GATE use.** The 2-mark NAT on a nested loop. Write the address of A[i][j], find the row stride in blocks, and count how many rows share a line. The trap is assuming column order always misses: if the column fits without collisions it costs the same as row order.

**Check.** int A[64][64], 16-byte blocks, 4 KB direct-mapped cache ($L = 256$, $s = 16$): row-wise $16384/16 = 1024$ misses; column-wise the 64 rows fall into $256/16 = 16$ lines, 4 per line, so all 4096 accesses miss. With an 8 KB cache there are 32 lines for 64 rows and still 4096 misses; a 16 KB cache gives 64 lines and 1024 misses. A simulation produced 1024, 4096, 4096 and 1024.

## Building a memory from smaller chips
<!-- topics: coa-memory-hierarchy.memory-interfacing -->

**Claim.** To build an $M \times N$ memory ($M$ words of $N$ bits) from $m \times n$ chips, with all sizes powers of 2, $m \le M$ and $n \le N$, one needs

$$n_{\text{chips}} = \frac{M}{m} \times \frac{N}{n},$$

arranged as $M/m$ rows of $N/n$ chips. The low $\log_2 m$ address bits go to every chip, the high $\log_2(M/m)$ bits drive a $\log_2(M/m)$-to-$(M/m)$ decoder whose output $r$ enables row $r$, and row $r$ answers the addresses $r m$ to $(r+1)m - 1$. If the CPU address has $A > \log_2 M$ bits, fully decoding the extra $A - \log_2 M$ bits (gating them to fixed values into the decoder enable) places the memory once at the base those values select; leaving $u$ of them unconnected (partial decoding) makes every word answer at exactly $2^u$ addresses.

**Derivation.** A chip delivers $n$ bits per access, so a word of $N$ bits needs $N/n$ chips accessed together, side by side, sharing address and chip-select lines, each driving its own slice of the data bus. One such row stores $m$ words. To get $M$ words we stack $M/m$ rows, and the total is the product. A word address has $\log_2 M$ bits. Write it as $a = r m + w$ with $0 \le w < m$: $w$ is the low $\log_2 m$ bits and selects the word inside every chip, and $r$ is the high $\log_2 M - \log_2 m = \log_2(M/m)$ bits and must enable exactly one row, which is the job of a decoder with that many inputs and $M/m$ outputs. Row $r$ is enabled exactly when the high bits equal $r$, which is the range $rm \le a \le rm + m - 1$. When $N/n = 1$ there is one chip per row; when $M/m = 1$ there is no decoder. For the extra bits: a word is selected when its row's enable fires and its low bits match. If every extra bit is gated to a fixed value, only addresses with those values enable the decoder, so the map is one-to-one and offset by the base. If $u$ extra bits reach no gate, the selection does not depend on them, so each of their $2^u$ combinations selects the same word: those are the aliases.

**GATE use.** MCQs on chip count and decoder size, and memory maps read off a decoder circuit. The traps are a decoder sized to the chip count instead of the row count, and choosing a chip from the decoder inputs while an enable bit disables the decoder.

**Check.** 16K × 8 from 1K × 4: $16 \times 2 = 32$ chips, 14 address bits split 10 for the chips and 4 for a 4-to-16 decoder. Row 0 covers 0 to 1023, row 1 covers 1024 to 2047, row 15 covers 15360 to 16383. A 16-bit bus with four 2K × 8 chips on A10–A0, a 2-to-4 decoder on A12 A11 and enable A15 = A14 = A13 = 0: chip 3 spans 1800H–1FFFH (2048 addresses, found by enumerating all $2^{16}$), 2800H selects nothing because A13 = 1, and with A15–A13 unconnected each byte has 8 aliases.

## Interleaved banks and block transfer time
<!-- topics: coa-memory-hierarchy.memory-interleaving -->

**Claim.** Split a memory of $W$ words into $m$ banks of $W/m$ words, $m$ a power of 2. Low-order interleaving puts word $a$ in bank $a \bmod m$ at row $\lfloor a/m \rfloor$; high-order interleaving puts it in bank $\lfloor a/(W/m) \rfloor$ at offset $a \bmod (W/m)$. Fetching a block of $k$ consecutive words, with $t_a$ to send the address, $t_{\text{acc}}$ for a bank access and $t_x$ per word transfer, takes

$$T_{\text{single}} = t_a + k\,(t_{\text{acc}} + t_x), \qquad T_{\text{interleaved}} = t_a + t_{\text{acc}} + k\,t_x$$

from one bank and from $k$ low-order interleaved banks.

**Derivation.** Both mappings are bijections from addresses to (bank, position) pairs: $a = m \lfloor a/m \rfloor + (a \bmod m)$ uses the low $\log_2 m$ bits as the bank, and $a = (W/m)\lfloor a/(W/m) \rfloor + a \bmod (W/m)$ uses the high $\log_2 m$ bits. Under low-order interleaving consecutive addresses $a, a+1, \dots, a+k-1$ with $k \le m$ have distinct residues mod $m$, so they sit in $k$ distinct banks; under high-order interleaving they share one bank unless they cross a bank boundary. With one bank, the $k$ words come one after another: send the address once, then for each word wait for the access and transfer it, $k(t_{\text{acc}} + t_x)$. With $k$ banks the address is broadcast once, all banks access in parallel in $t_{\text{acc}}$, and then the $k$ words share the bus one at a time, $k t_x$. The model assumes one shared word-wide bus and no overlap of address sending with access (Hennessy and Patterson's interleaving example).

**GATE use.** MCQs on which bank holds an address, and NATs on block fetch time or miss penalty with interleaving. The trap is swapping the two schemes: high-order interleaving does not speed up a sequential block fetch.

**Check.** 8K words in 8 banks of 1K: word 1234 is in bank $1234 \bmod 8 = 2$ low-order and bank $\lfloor 1234/1024 \rfloor = 1$ high-order. With $t_a = 1$, $t_{\text{acc}} = 15$, $t_x = 1$ and $k = 4$: $1 + 4 \times 16 = 65$ cycles from one bank and $1 + 15 + 4 = 20$ interleaved. With $t_{\text{acc}} = 20$ and $k = 8$: $1 + 8 \times 21 = 169$ against $1 + 20 + 8 = 29$, a speed-up of about 5.8. A script checked that both mappings are bijections for $W = 64$, $m = 8$.

## Effective access time with a TLB
<!-- topics: coa-memory-hierarchy.virtual-memory-tlb -->

**Claim.** With a TLB of lookup time $t$ and hit ratio $h$, memory access time $m$, a page table of $k$ levels held in memory, no data cache and no page faults, and the TLB probed before the walk starts,

$$\mathrm{EAT} = h\,(t + m) + (1 - h)\,(t + (k + 1)m),$$

which for $k = 1$ is $h(t + m) + (1 - h)(t + 2m) = t + m + (1 - h)m$. A flat table for a $v$-bit virtual address with pages of $2^p$ bytes has $2^{v-p}$ entries.

**Derivation.** Every reference first probes the TLB, costing $t$. On a hit the frame number is known and one memory access fetches the data: $t + m$. On a miss the hardware walks the table, one memory access per level, $k m$, then fetches the data, $m$, for $t + (k+1)m$. Total expectation over hit and miss gives the formula, and for $k = 1$ the algebra $h(t + m) + (1-h)(t + m) + (1-h)m$ gives the short form. The virtual address is a page number of $v - p$ bits and an offset of $p$ bits, the offset passing through translation unchanged, so a flat table needs one entry per page number. A TLB miss is not a page fault: the walk may find a valid entry with the page resident. If the TLB and the walk start in parallel, drop $t$ from the miss term.

**GATE use.** The 1- and 2-mark NAT on EAT with a TLB, often with a multilevel table or a page-fault term added. Traps: counting one memory access on a TLB miss, forgetting $t$ on the miss path, and treating a TLB miss as a page fault.

**Check.** $h = 0.9$, $t = 10$ ns, $m = 100$ ns: $0.9 \times 110 + 0.1 \times 210 = 120$ ns $= 10 + 100 + 0.1 \times 100$; with a 2-level table $0.9 \times 110 + 0.1 \times 310 = 130$ ns. A 32-bit address with 4 KB pages has $2^{20}$ entries, 4 MB at 4 bytes per entry.
