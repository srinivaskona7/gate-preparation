# Memory management and virtual memory: derivations

## Placement rules: none dominates, and the fifty-percent rule
<!-- topics: os-memory-management.contiguous-allocation, os-memory-management.placement-strategies, os-memory-management.next-fit -->

**Claim.** Memory is allocated contiguously from a list of holes kept in address order. A request of size $r$ may go into any hole of size at least $r$, and the unused part of that hole stays behind as a smaller hole. First fit takes the first hole that fits, best fit the smallest, worst fit the largest, and next fit the first hole that fits searching on from the hole used by the previous request, wrapping around at the end of the list (the first search starts at the first hole). Then:

1. For each of the four rules there is a hole list and a request sequence on which that rule fails while another rule satisfies every request. No rule dominates another, so whether a given sequence succeeds is decided only by tracing it.
2. Fifty-percent rule. Assume first fit runs in equilibrium: adjacent holes are always merged, each release frees a block chosen uniformly from the $N$ allocated blocks, an allocation uses up its hole exactly with probability $q$, and releases and allocations alternate on average. Then the average number of holes is $M \approx \tfrac{1-q}{2}N$, about $N/2$ when exact fits are rare.

**Proof.** (1) Each line is a complete trace; sizes are in KB.

- First fit fails, best fit succeeds: holes 600, 200 and requests 150, 600. First fit puts 150 into the 600 hole, and 600 then fits nowhere. Best fit puts 150 into the 200 hole and 600 into the 600 hole.
- Best fit fails, first fit succeeds: holes 300, 200 and requests 100, 200, 200. Best fit puts 100 into the 200 hole and 200 into the 300 hole, leaving 100 and 100 for the last 200. First fit puts 100 into the 300 hole and then fills both 200 holes exactly.
- Worst fit fails, best fit succeeds: holes 200, 600 and requests 150, 600. Worst fit spends the 600 hole on the 150 request.
- Next fit fails, first fit succeeds: holes 100, 400 and requests 200, 100, 200. Next fit puts 200 into the 400 hole and, searching on from there, 100 into its 200 remainder, so the last 200 finds only 100 and 100. First fit puts the 100 into the first hole and keeps the 200 remainder for the last request.
- First fit fails, next fit succeeds: holes 200, 400 and requests 300, 100, 200. Both put 300 into the 400 hole. First fit then puts 100 into the 200 hole and is left with 100 and 100; next fit puts 100 into the 100 remainder and the last 200 into the untouched 200 hole.
- First, best and next fit fail, worst fit succeeds: the trace in the Check below.

(2) The argument is Knuth's (The Art of Computer Programming, Vol. 1, §2.5). Because adjacent holes are merged, no two holes touch. Call an allocated block type $A$ if both its neighbours are holes, type $B$ if one is, and type $C$ if neither is, counting the missing neighbour of a block at an end of memory as a block; then $N = A + B + C$. Count the adjacent (hole, block) pairs in two ways. By blocks the count is $2A + B$. By holes it is $2M - \varepsilon$, because every hole has a block on each side except a hole at an end of memory, so $\varepsilon \in \{0, 1, 2\}$. Hence

$$2M = 2A + B + \varepsilon.$$

Releasing a $C$ block creates a hole, releasing a $B$ block extends one, and releasing an $A$ block merges its two neighbouring holes into one, so a release changes $M$ by $+1$, $0$ or $-1$. An allocation removes a hole only on an exact fit. In equilibrium the expected change of $M$ per release and allocation is zero, and the released block is of type $C$ with probability $C/N$ and of type $A$ with probability $A/N$, so

$$\frac{C - A}{N} = q, \qquad C - A = qN.$$

Substituting $B = N - A - C$ gives $2M = N - (C - A) + \varepsilon = (1 - q)N + \varepsilon$, so $M = \tfrac{1-q}{2}N + \tfrac{\varepsilon}{2}$. The rule counts holes, not bytes. Only if holes average the size of blocks do they hold $\frac{N/2}{N + N/2} = \frac13$ of memory, which is where the figure "one third of memory may be unusable" in Galvin comes from.

**GATE use.** A placement question lists the holes in address order and a request sequence, and asks which rule satisfies every request or where a given request lands. Trace each rule; assuming that best fit is always the safest is the trap, and for next fit so is restarting the search at the first hole. Search cost: first fit stops at the first hole that fits, while best and worst fit scan all $h$ holes unless the list is kept sorted by size. Fragmentation MSQs rest on the same picture: variable partitions leave holes between blocks (external fragmentation), which compaction removes by relocating blocks.

**Check.** Holes 150, 200, 350, 500, 550 and requests 530, 240, 350, 250. Every rule puts 530 into the 550 hole (20 left). First and best fit then put 240 into the 350 hole (110 left) and 350 into the 500 hole (150 left); next fit, searching on from the 550 hole, wraps around and makes the same two choices. All three are left with 150, 200, 110, 150 and 20, and 250 fails. Worst fit puts 240 into the 500 hole (260 left), 350 exactly into the 350 hole and 250 into the 260 remainder. A script ran the four rules on every trace in this section, and a search over hole lists and requests of up to 12 units found a first-beats-best instance with holes 3, 2 and requests 1, 2, 2 (the 300, 200 trace at a smaller scale). A first-fit simulation with random releases and sizes uniform on 50 to 950 units settled at 0.495 holes per allocated block, but its holes averaged 195 units against 502 per block, so holes held about 16% of memory rather than a third.

## Address split and the size of a single-level page table
<!-- topics: os-memory-management.paging, os-memory-management.page-table-size -->

**Claim.** Let pages be $P = 2^d$ bytes, virtual addresses $v$ bits and physical addresses $p$ bits, with byte-addressable memory.

1. A virtual address splits uniquely into a virtual page number (VPN) of $v - d$ bits and an offset of $d$ bits, $\text{VA} = \text{VPN}\cdot P + \text{offset}$ with $0 \le \text{offset} < P$. A physical address splits the same way into a frame number (PFN) of $p - d$ bits and the same offset.
2. There are $N_{\text{pages}} = 2^{v-d}$ pages and $N_{\text{frames}} = 2^{p-d}$ frames.
3. A single-level table has one entry per virtual page, $2^{v-d}$ entries. An entry needs at least $(p - d) + c$ bits, the frame number plus $c$ control bits (valid, dirty, referenced, protection). Rounded to whole bytes this is $e = \lceil ((p-d)+c)/8 \rceil$, and the table occupies $S_{\text{PT}} = 2^{v-d}\, e$ bytes per process.

**Derivation.** (1) By the division algorithm every integer $a$ with $0 \le a < 2^v$ has unique $q$ and $r$ with $a = qP + r$ and $0 \le r < P$. Dividing by $2^d$ shifts the binary form right by $d$ places, so $r$ is the low $d$ bits and $q$ the high $v - d$ bits, and $q < 2^v / 2^d = 2^{v-d}$. Translation replaces $q$ by the frame number $f$ and keeps $r$, giving $\text{PA} = fP + r$; the offset survives unchanged because a page and a frame have the same size and alignment.

(2) The map $a \mapsto (q, r)$ is a bijection from $\{0, \dots, 2^v - 1\}$ onto $\{0, \dots, 2^{v-d} - 1\} \times \{0, \dots, P - 1\}$, so there are exactly $2^{v-d}$ page numbers. The same argument with $p$ in place of $v$ gives $2^{p-d}$ frames. Equivalently, pages = virtual space ÷ page size and frames = physical memory ÷ page size.

(3) The hardware finds the entry of page $q$ at address $\text{PTBR} + q\,e$, where PTBR holds the table's base address. Direct indexing needs a slot for every possible $q$, used or not, so the number of entries, $2^{v-d}$, is set by the virtual width. An entry must name one of $2^{p-d}$ frames, and $k$ bits distinguish only $2^k$ values, so $k \ge p - d$ by the pigeonhole principle; the physical width sets the entry's width. With the $c$ control bits the entry needs $(p - d) + c$ bits, and byte addressing rounds it up to $\lceil ((p-d)+c)/8 \rceil$ bytes. Every process has its own table, so $n$ processes need $n\,S_{\text{PT}}$. Questions differ in the rounding: whole bytes, a power of two such as 4 bytes, or the exact bit count. The table size scales with whichever $e$ the question fixes.

**GATE use.** NAT questions ask for the offset, VPN or PFN width, the entry count or the table size. Write every size as a power of two with $1\text{ KB} = 2^{10}$ bytes. The classic slip is to count entries from the physical width; the others are dropping the control bits and rounding the entry differently from the question.

**Check.** 32-bit virtual addresses and 4 KB pages give $d = 12$ and a 20-bit VPN. The address `0x12345678` has VPN `0x12345` and offset `0x678`; with 30-bit physical addresses there are $2^{18}$ frames, and if the page is in frame `0x2A0B` the physical address is `0x2A0B678`. With 4-byte entries the flat table is $2^{20} \times 4$ B = 4 MB, which itself fills 1024 frames. For 32-bit virtual and 36-bit physical addresses, 8 KB pages and 4 control bits: $d = 13$, $2^{19}$ entries, $23 + 4 = 27$ bits rounded to 4 bytes, so $S_{\text{PT}} = 2^{19} \times 4$ B = $2^{21}$ B = 2 MB. Skipping the rounding gives $2^{19} \times 27/8$ B = 1.6875 MB, and one entry per frame would give $2^{23} \times 4$ B = 32 MB. With 32-bit virtual and 40-bit physical addresses, 4 KB pages and 6 control bits an entry has $28 + 6 = 34$ bits: 5 bytes and a 5 MB table, or 8 bytes and 8 MB when entries must be a power of two.

## Page size that minimises table space plus internal fragmentation
<!-- topics: os-memory-management.paging, os-memory-management.page-table-size -->

**Claim.** Assume a process of $s$ bytes, page-table entries of $e$ bytes, a table with one entry per page of the process (about $s/P$ entries) and a last page that is on average half empty. The overhead per process is

$$f(P) = \frac{s\,e}{P} + \frac{P}{2},$$

minimised at $P^{*} = \sqrt{2se}$, where $f(P^{*}) = \sqrt{2se}$. Also $f(P^{*}x) = f(P^{*}/x)$ for every $x > 0$, so of the two powers of two around $P^{*}$ the better one is the nearer by ratio, not by difference.

**Derivation.** The argument is the one in Tanenbaum's Modern Operating Systems (section on page size). If $s \bmod P$ is uniform on $0, \dots, P - 1$, the unused part of the last page, $(P - (s \bmod P)) \bmod P$, also takes each of the values $0, \dots, P - 1$ once, so its mean is $(P-1)/2 \approx P/2$. The table holds $\lceil s/P \rceil \approx s/P$ entries of $e$ bytes. Adding the two gives $f(P)$. Then $f'(P) = -se/P^2 + 1/2$ vanishes at $P^2 = 2se$, and $f''(P) = 2se/P^3 > 0$, so this is the minimum. AM–GM gives the same without calculus:

$$\frac{se}{P} + \frac{P}{2} \ge 2\sqrt{\frac{se}{P}\cdot\frac{P}{2}} = \sqrt{2se},$$

with equality exactly when $se/P = P/2$. For the symmetry, write $se = (P^{*})^2/2$; then $f(P^{*}x) = \frac{P^{*}}{2x} + \frac{P^{*}x}{2}$, which does not change when $x$ is replaced by $1/x$.

**GATE use.** Given $s$ and $e$, find the page size with the least overhead; the answer is usually a power of two. The traps are dropping the $P/2$ term and choosing the power of two nearest $P^{*}$ by difference. With $se = 1.8 \times 10^7$, $P^{*} = 6000$: 4096 is nearer by difference ($1904$ against $2192$), yet $f(4096) \approx 6442.5$ exceeds $f(8192) \approx 6293.3$, because $8192/6000 \approx 1.365$ is less than $6000/4096 \approx 1.465$. The half-page term is also why paging removes external fragmentation but not internal, and why larger pages waste more.

**Check.** $s = 1$ MB $= 2^{20}$ B and $e = 8$ B: $P^{*} = \sqrt{2^{24}} = 4096$ and $f(4096) = 2048 + 2048 = 4096$ bytes; a script evaluated $f$ at every power of two from $2^6$ to $2^{19}$ and found the minimum at 4096. With $s = 2$ MB, $P^{*} = 2^{12.5} \approx 5792.6$ and $f(4096) = f(8192) = 6144$: a tie, as the symmetry predicts when $P^{*}$ is the geometric midpoint of the two powers of two.

## Hierarchical page tables: one frame per table, levels and space
<!-- topics: os-memory-management.multi-level-page-tables, os-memory-management.page-table-size -->

**Claim.** Pages are $P = 2^d$ bytes, entries $e$ bytes, virtual addresses $v$ bits, and the page table is itself paged.

1. Each table should fit in one frame, which has room for $\lfloor P/e \rfloor$ entries. A level's index is a field of $b$ bits of the VPN, so a table has $2^b$ entries and a level resolves $b = \lfloor \log_2(P/e) \rfloor$ bits. When $e$ is a power of two, $b = \log_2(P/e) = d - \log_2 e$ and every table fills its frame exactly.
2. The number of levels is $L = \left\lceil \frac{v - d}{b} \right\rceil$. The inner $L - 1$ levels take $b$ bits each and the outermost takes the remaining $r = (v - d) - (L - 1)b$ bits, with $1 \le r \le b$, so the outer table also fits in a frame.
3. A process that uses its whole address space needs at least as much table memory as the flat table. A sparse process needs one last-level table for each aligned region of $2^b P$ bytes it touches, one table at each higher level for each region it touches at that level, and the outer table.

**Derivation.** (1) A parent entry holds only a frame number, in the same format as a leaf entry, and the walk reads entry $i$ of the child at physical address $fP + ie$, where $f$ is that frame number. A child larger than a page would put the entries with $ie \ge P$ in the frames after $f$, so it would need physically contiguous frames, the very allocation problem paging was introduced to remove. A child smaller than a page wastes the rest of its frame and resolves fewer bits per level, which can add levels and memory accesses to every walk. A $b$-bit index selects one of $2^b$ entries, and these fit in a frame exactly when $2^b e \le P$. The largest such $b$ is $\lfloor \log_2(P/e) \rfloor$; with it no table spills out of its frame, no level resolves fewer bits than a frame allows, and any free frame can hold any table. For a power-of-two $e$, $2^b e = P$.

(2) By (1) a level resolves at most $b$ bits, so $L$ levels resolve at most $Lb$ bits. All $v - d$ VPN bits must be resolved, so $Lb \ge v - d$, and the least such $L$ is $\lceil (v-d)/b \rceil$. With $L - 1$ full inner levels, the outer index has $r = (v-d) - (L-1)b$ bits. Minimality of $L$ means $(L-1)b < v - d$, so $r \ge 1$, and $Lb \ge v - d$ means $r \le b$.

(3) The last-level tables of a full address space together hold one entry per page, $2^{v-d}$ entries: the same entries as the flat table, and in whole frames at least its $2^{v-d}e$ bytes. The outer and middle tables come on top. So "a two-level table never uses more memory than a single-level one" is false. A last-level table maps $2^b$ consecutive pages, that is $2^b P$ bytes starting at a multiple of $2^b P$, and it must exist if any page in that range is used. A region that is not aligned on that boundary can straddle two such ranges and then needs two tables. When the number of levels is given and every table, the outer one included, is exactly one page (which needs a power-of-two $e$), the bits add up exactly: $L(d - \log_2 e) + d = v$, which can be solved for $d$.

**GATE use.** Questions ask for the number of levels, the bits per level, the page size given the levels, or the memory used by a sparse process. The traps are forgetting the outer table, assuming that a region straddling a boundary needs only one inner table, assuming a hierarchy always saves space, and leaving $\log_2(P/e)$ unrounded when the entry size is not a power of two.

**Check.** 46-bit addresses, 8 KB pages and 4-byte entries: $d = 13$, $b = \log_2(8192/4) = 11$, a 33-bit VPN, $L = 3$ and $r = 11$, so the outer table is exactly one page. Taking 4 KB pages by mistake gives 34 VPN bits at 10 per level and the wrong answer 4. With 4 KB pages and 8-byte entries, $b = 9$: 48-bit addresses need 4 levels (outer index 9 bits) and 57-bit addresses 5. With 5-byte entries, 4 KB pages and 40-bit addresses a frame has room for 819 entries but a 9-bit index uses only 512 of them, so $b = 9$ and the 28-bit VPN needs $\lceil 28/9 \rceil = 4$ levels; the unrounded $\lceil 28/\log_2 819.2 \rceil$ gives 3, too few. Inverse: three levels, 4-byte entries, every table one page and 46-bit addresses give $3(d - 2) + d = 46$, so $d = 13$ and pages of 8 KB, the only solution. The full 46-bit hierarchy has 1 outer, $2^{11}$ middle and $2^{22}$ last-level tables; the last level is $2^{22} \times 8$ KB = 32 GB = $2^{33} \times 4$ B, the size of the flat table. A 32-bit process with a 10 + 10 + 12 split and 4 KB tables: an inner table maps 4 MB, the lowest 8 MB uses outer entries 0 and 1, and the highest 4 MB uses entry 1023, so 3 inner tables and the outer one take 16 KB, against 4 MB for the flat table and 4 MB + 4 KB if every inner table existed. A 4 MB region from 2 MB to 6 MB meets entries 0 and 1 and needs two inner tables.

## Inverted page table: size and lookup
<!-- topics: os-memory-management.inverted-page-table -->

**Claim.** An inverted page table has one entry per physical frame: $2^{p-d}$ entries and $S_{\text{IPT}} = 2^{p-d}\,e'$ bytes, where an entry holds the process id, the VPN ($v - d$ bits) and the control bits, plus a chain pointer of $p - d$ bits when the table is hashed. Assume no frame is shared, so a frame holds a page of at most one process. The number of entries depends on physical memory only; the entry width $e'$ grows with the VPN width $v - d$ and with the pid width, and neither depends on how many processes are running. A lookup for the pair (pid, VPN) reads $O(F)$ entries by linear search over $F$ frames and $O(1)$ expected entries with a hash on (pid, VPN).

**Proof.** A frame holds at most one page at a time and, with no sharing, that page belongs to one process, so frame $\mapsto$ (pid, VPN) is a function; a resident page sits in exactly one frame, so the function is injective, and its inverse on resident pages is the translation map. Storing the function indexed by frame therefore determines every translation, with exactly one entry per frame. The entry must identify its page: the VPN alone does not, because every process has a page 0, so the pid is stored with it. Translation finds the index $i$ whose entry equals (pid, VPN) and forms $\text{PA} = iP + \text{offset}$; the frame number is the position of the match and is not stored. Without an index the search may read all $F$ entries. A hash anchor table maps a hash of (pid, VPN) to the head of a chain of entries linked through the chain pointers; with chains of expected constant length a lookup reads $O(1)$ entries on average. Per-process tables would total $n \cdot 2^{v-d}e$ for $n$ processes; the inverted table replaces all of them. A shared frame would need one (pid, VPN) pair for each process that maps it but has only one entry, which is why shared memory is awkward with an inverted table.

**GATE use.** MSQs test the statements "the number of entries does not depend on the virtual address space" (true) and "a conventional table's entry count is fixed by physical memory" (false: that is the inverted table). Size questions multiply frames by an entry built from pid, VPN and control bits; the traps are sizing the table by the virtual space and forgetting that a wider VPN still widens each entry. A TLB still sits in front, so a lookup happens only on a TLB miss.

**Check.** 512 MB of physical memory and 4 KB pages give $2^{29}/2^{12} = 2^{17}$ frames. With 64-bit virtual addresses, an 8-bit pid and 4 control bits, an entry has $8 + 52 + 4 = 64$ bits = 8 bytes, and the table is $2^{17} \times 8$ B = 1 MB; adding a 17-bit chain pointer makes the entry 81 bits, rounded to 11 bytes, and the table $2^{17} \times 11$ = 1,441,792 B = 1.375 MB. With 32-bit virtual addresses the unhashed entry has $8 + 20 + 4 = 32$ bits = 4 bytes and the table is 512 KB: the same number of entries, each narrower. A flat table with 8-byte entries for the 64-bit address space would be $2^{52} \times 8$ B = $2^{55}$ B = 32 PB per process.

## Segment translation and the strict limit check
<!-- topics: os-memory-management.segmentation, os-memory-management.contiguous-allocation -->

**Claim.** Segment $s$ of $\ell_s$ bytes stored at base $b_s$ occupies physical bytes $b_s, \dots, b_s + \ell_s - 1$. Offset $d$ is legal exactly when $0 \le d < \ell_s$, and then $\text{PA} = b_s + d$; an offset equal to the limit traps. In segmented paging with pages of $P$ bytes, $\text{PA} = \text{frame}_s(\lfloor d/P \rfloor)\cdot P + (d \bmod P)$, still after checking $d < \ell_s$, and the segment's last page wastes $\lceil \ell_s/P \rceil P - \ell_s$ bytes. Segments stored contiguously suffer external fragmentation; paged segments suffer only internal fragmentation.

**Proof.** A segment of $\ell$ bytes has the $\ell$ offsets $0, \dots, \ell - 1$, byte $d$ being the $(d+1)$-th, so the last legal offset is $\ell - 1$. Offset $\ell$ is the first byte past the segment and may belong to another segment, so the hardware must trap on it, and the comparison is strict. Byte $d$ of a segment stored from $b_s$ is at $b_s + d$. In segmented paging each segment is a small paged address space: the division algorithm (previous sections) splits $d$ into a page number $\lfloor d/P \rfloor$ and an offset $d \bmod P$, the page number indexes the segment's page table, and the offset is kept. The limit check must stay on $d$: the last page extends past byte $\ell - 1$, so checking only that the page number is in range would accept the offsets from $\ell$ to the end of that page. Variable-length segments placed contiguously leave variable holes between them, the external fragmentation of the placement section; once segments are paged, every allocation unit is a frame, and the only waste is inside the last page of each segment.

**GATE use.** MCQs give a segment table and several (segment, offset) pairs and ask which translate. The traps are accepting an offset equal to the limit and adding the offset to the limit instead of the base. MSQs ask which schemes suffer external fragmentation: pure segmentation and variable partitions do; pure paging and segmented paging do not.

**Check.** With (base, limit) = (2000, 500), (3100, 120), (700, 900) and (5200, 300) for segments 0 to 3: (1, 120) traps because 120 is not below 120, (3, 310) and (0, 512) trap, and (2, 850) translates to $700 + 850 = 1550$. Segmented paging with limit 3000, 1 KB pages and page table 7, 3, 12: offset 2500 is page 2 with offset 452, so $\text{PA} = 12 \cdot 1024 + 452 = 12740$; the last page wastes $3 \cdot 1024 - 3000 = 72$ bytes, and offset 3000 traps although its page number, 2, is in the table.

## Effective access time with a TLB and a k-level table
<!-- topics: os-memory-management.tlb, os-memory-management.multi-level-page-tables -->

**Claim.** Assume every reference first looks up the TLB in time $t$. A hit, with probability $h$, supplies the frame number, and the data access takes $m$. A miss walks a $k$-level table in memory, one access per level, so $m_{\text{PT}} = km$, and then makes the data access. There are no page faults, no table entries are cached, and the lookup is serial: its time is paid on hits and misses. Then

$$\text{EAT} = h(t + m) + (1-h)\bigl(t + (k+1)m\bigr) = t + hm + (1-h)(m_{\text{PT}} + m) = t + m + (1-h)\,km.$$

If the lookup is overlapped with the start of the walk, a miss does not pay $t$ and $\text{EAT} = h(t + m) + (1-h)(k+1)m$.

**Derivation.** Condition on the lookup's outcome; the expected time is $h$ times the hit time plus $1 - h$ times the miss time (total expectation). Each path is a sequence of steps that cannot overlap. A hit is the lookup and the data access, $t + m$. A miss is the lookup (paid before the miss is known), then $k$ table reads, each of which yields the frame of the next table and so cannot start before the previous one returns, then the data access: $t + km + m$. Expanding,

$$h(t+m) + (1-h)(t + km + m) = t\,(h + 1 - h) + m\,(h + 1 - h) + (1-h)km = t + m + (1-h)km.$$

The chapter's form $t + hm + (1-h)(m_{\text{PT}} + m)$ expands to $t + hm + (1-h)m + (1-h)km$, the same expression with $m_{\text{PT}} = km$; $k = 1$ gives $h(t+m) + (1-h)(t+2m)$. A TLB miss is not a page fault: by assumption the walk finds the page resident and no disk access occurs. Solving $t + m + (1-h)km \le T$ for the hit ratio gives $h \ge 1 - \frac{T - t - m}{km}$.

**GATE use.** NAT questions give $t$, $m$, $h$ and the number of levels. The traps are charging $t$ on a miss when the lookup is overlapped (or not charging it when it is serial), charging one table access for a $k$-level table, and treating a TLB miss as a page fault.

**Check.** $t = 5$ ns, $m = 100$ ns, $h = 0.96$ and a single-level table: $0.96 \times 105 + 0.04 \times 205 = 100.8 + 8.2 = 109$ ns; with an overlapped lookup, $100.8 + 0.04 \times 200 = 108.8$ ns. Four levels with $t = 10$ ns, $m = 100$ ns and $h = 0.98$: $0.98 \times 110 + 0.02 \times 510 = 107.8 + 10.2 = 118$ ns, and a simulation of $10^6$ references averaged 118.06 ns. To keep the four-level EAT within 115 ns needs $h \ge 1 - 5/400 = 0.9875$.

## Effective access time with page faults and dirty victims
<!-- topics: os-memory-management.demand-paging -->

**Claim.** Each memory access faults with probability $p$, the fault rate. An access that does not fault takes $m$; one that faults takes the fault-service time $s$, in the same unit. Then $\text{EAT} = (1-p)m + ps$. If a fraction $f$ of page faults evict a dirty page, $s = (1-f)s_{\text{clean}} + f s_{\text{dirty}}$, where $s_{\text{dirty}}$ includes writing the victim back and $s_{\text{clean}}$ is the cost of a fault that evicts a clean page or finds a free frame. When a fraction $\varphi$ of faults find a free frame and a fraction $g$ of victims are dirty, $f = (1 - \varphi)g$. For a target $T$ with $m < T$ and $s > m$, $\text{EAT} \le T$ holds exactly when

$$p \le \frac{T - m}{s - m}.$$

**Derivation.** This is Galvin's performance calculation for demand paging (Operating System Concepts, chapter on virtual memory). By total expectation over the two cases, $\text{EAT} = (1-p)m + ps$. Given a fault, it evicts a dirty page with probability $f$ and otherwise costs $s_{\text{clean}}$; total expectation again gives the mean service time $s$. A fault evicts a dirty page exactly when it finds no free frame and its victim is dirty, and $g$ is the conditional probability of the second given the first, so $f = (1 - \varphi)g$. A dirty victim must be written out before its frame is reused, so $s_{\text{dirty}} \approx 2 s_{\text{clean}}$ when the write and the read take the same disk time. For the bound, $(1-p)m + ps \le T$ is $m + p(s - m) \le T$, and dividing by $s - m > 0$ keeps the direction. Some questions charge a fault $s + m$ (service, then the access itself), which gives $\text{EAT} = m + ps$, larger by $pm$; that is negligible when $s \gg m$.

**GATE use.** NAT questions ask for the EAT or for the largest fault rate that meets a target. Convert first: $1\text{ ms} = 10^6$ ns. The traps are leaving $s$ in milliseconds, ignoring the extra write-back for dirty victims, and applying the dirty fraction of victims to faults that found a free frame.

**Check.** $m = 100$ ns, $s = 8$ ms $= 8 \times 10^6$ ns and $p = 0.001$: $0.999 \times 100 + 0.001 \times 8 \times 10^6 = 99.9 + 8000 = 8099.9$ ns, about 81 times slower than without faults; the $s + m$ convention gives 8100. A target of 110 ns needs $p \le 10/7{,}999{,}900 \approx 1.25 \times 10^{-6}$, about one fault in 800,000 accesses. With $s_{\text{clean}} = 8$ ms, $s_{\text{dirty}} = 20$ ms and 70% of faults evicting a dirty page, $s = 0.3 \times 8 + 0.7 \times 20 = 16.4$ ms, and with $p = 10^{-6}$, $\text{EAT} = (1 - 10^{-6}) \times 100 + 10^{-6} \times 1.64 \times 10^7 = 99.9999 + 16.4 \approx 116.4$ ns. If instead 10% of faults find a free frame and 70% of victims are dirty, $f = 0.9 \times 0.7 = 0.63$, $s = 15.56$ ms and the EAT is about 115.56 ns.

## Effective access time with a TLB and page faults together
<!-- topics: os-memory-management.tlb, os-memory-management.demand-paging -->

**Claim.** Take a single-level page table and a serial TLB lookup of time $t$, memory time $m$ and TLB hit ratio $h$. Let $p$ be the fraction of all references that page-fault, and let a fault cost the lookup, the page-table read that finds the valid bit clear, and the service time $s$, where $s$ includes the restarted access. Since the TLB holds only resident pages, $p \le 1 - h$, and

$$\text{EAT} = h(t + m) + (1 - h - p)(t + 2m) + p(t + m + s).$$

If the question gives instead the fault rate $q$ per TLB miss, then $p = (1 - h)q$.

**Derivation.** Every reference ends in exactly one of three disjoint cases. A TLB entry exists only for a page that is resident: the OS invalidates a page's TLB entry when it evicts the page. So a hit never faults, and its cost is $t + m$ with probability $h$. A miss reads the page-table entry, one access of time $m$, after the lookup time $t$. If the entry is valid, the data access follows, for $t + 2m$. If it is invalid, the trap and service follow, for $t + m + s$. The faulting references are a fraction $p$ of all references and all lie among the misses, so the resident misses have probability $1 - h - p$. Total expectation over the three cases gives the formula. Expanding,

$$\text{EAT} = t + m + (1 - h)m + p\,(s - m),$$

which is the TLB formula of the previous section plus a fault penalty $p(s - m)$: a fault replaces the data access $m$ by the service time $s$. With a per-miss rate $q$, the fraction of all references that fault is $P(\text{miss}) \cdot P(\text{fault} \mid \text{miss}) = (1 - h)q$.

**GATE use.** NAT questions combine the TLB and the fault rate in one EAT. The traps are applying the fault rate to TLB hits, mixing a per-reference rate with a per-miss rate, and leaving $s$ in milliseconds. Conventions on whether $s$ includes the restarted access differ by one $m$, which a question must fix; with $s$ in milliseconds the difference is $pm$, negligible.

**Check.** $t = 10$ ns, $m = 100$ ns, $h = 0.9$, $p = 10^{-4}$ and $s = 5$ ms $= 5 \times 10^6$ ns: $0.9 \times 110 + 0.0999 \times 210 + 10^{-4} \times 5{,}000{,}110 = 99 + 20.979 + 500.011 = 619.99$ ns. The expanded form gives $110 + 10 + 10^{-4}(5 \times 10^6 - 100) = 619.99$ ns as well. A simulation of $10^8$ references with the sampled fault count replaced by its expectation averaged 619.993 ns. Leaving $s$ as 5 gives about 120 ns, the trap answer.

## Loop order and page faults for row-major arrays
<!-- topics: os-memory-management.demand-paging, os-memory-management.thrashing-working-set -->

**Claim.** An array of $R$ rows and $C$ columns with $b$-byte elements is stored row-major from a page boundary in pages of $P$ bytes, so element $(i, j)$ lies on page $\lfloor (iC + j)b / P \rfloor$. None of it is resident at the start, and it gets $f$ frames under LRU or FIFO.

1. A row-wise loop ($i$ outer, $j$ inner) faults $\lceil RCb/P \rceil$ times for any $f \ge 1$.
2. If a row occupies at least a page ($Cb \ge P$) and $f < R$, a column-wise loop ($j$ outer, $i$ inner) faults on every one of its $RC$ references. The proof below covers $Cb$ a multiple of $P$; the straddling case is checked by enumeration.
3. If $Cb$ is a multiple of $P$ and $f \ge R$, the column-wise loop faults once per page, $RCb/P$ times.

**Proof.** (1) The row-wise loop visits addresses in increasing order, so it visits the pages in increasing order, each in one consecutive run of references. Each page faults on its first reference and hits for the rest of its run, because nothing else is referenced in between. Pages are never revisited, so the faults equal the number of pages, $\lceil RCb/P \rceil$.

(2) Within column $j$, rows $i$ and $i+1$ lie $Cb \ge P$ bytes apart, so the $R$ references of a column fall on $R$ distinct pages. Take a reference to $(i, j)$ with $j \ge 1$. Its page was last used at the latest at $(i, j-1)$, and in between the loop referenced $(i+1, j-1), \dots, (R-1, j-1), (0, j), \dots, (i-1, j)$: $R - 1$ references. Each of these lies on a different page from $(i, j)$. If $Cb$ is a multiple of $P$, each row is a whole number of pages and the pages of row $i'$ differ from those of row $i$ for $i' \ne i$; then the $R - 1$ references cover $R - 1$ distinct other pages, and with LRU and $f < R$, that is $f \le R - 1$ frames, the page of $(i, j)$ was evicted. FIFO evicts in load order, and every one of these references faults by induction, so each loads a page; after $R - 1 \ge f$ loads the page of $(i, j)$ has left the queue. When rows straddle page boundaries the argument above does not apply directly, because two of the intervening references can share a page with $(i, j)$; part 2 still held in an exhaustive LRU and FIFO simulation over every $R \le 24$, $C \le 200$, $b \in \{1, 2, 4, 8\}$ with $P = 256$, $Cb \ge P$ and $f < R$.

(3) With $Cb = kP$, row $i$ is pages $ik, \dots, ik + k - 1$, and columns $j$ with the same $\lfloor jb/P \rfloor$ touch the same $R$ pages, one per row. A block of $P/b$ consecutive columns therefore cycles through $R \le f$ pages: they fault once each in the block's first column and hit afterwards. Later blocks use new pages. The faults are $R$ per block times $k$ blocks, $Rk = RCb/P$.

**GATE use.** NAT questions give the array declaration, the page size, the frame count and two loop orders. The traps are giving the row-wise figure for a column-wise loop, ignoring the frame count (when a row is a whole number of pages, $f \ge R$ makes the column loop as cheap as the row loop; rows that straddle page boundaries can still cost more), and placing the array column-major as in Fortran when the code is C.

**Check.** `int A[512][512]`, $b = 4$, $P = 2048$: each row is one page. With 128 frames, an LRU simulation gives 262,144 faults for the column-wise loop and 512 for the row-wise loop, and FIFO also gives 262,144; with 512 frames the column-wise loop gives 512. Rows of two pages ($R = 64$, $C = 1024$): $65{,}536 = RC$ faults with 32 frames and $128$ with 64. Rows of 1.5 pages ($C = 768$) are not a multiple of $P$: 32 frames still give $RC = 49{,}152$, but 64 frames give 128 faults against 96 pages, so part 3 needs its multiple-of-$P$ condition.

## Optimal replacement is optimal: the exchange argument
<!-- topics: os-memory-management.replacement-policies -->

**Claim.** Fix a reference string $r_1, \dots, r_T$ and $n$ frames that start empty. On a fault the referenced page is loaded into a free frame if there is one, and otherwise a resident page is evicted. OPT evicts a resident page whose next reference lies farthest in the future, a page never referenced again counting as infinitely far, with ties broken arbitrarily. Then no replacement algorithm, even one that knows the whole string, faults fewer times than OPT. Every algorithm faults at least once on each of the $u$ distinct pages, and the number of replacements is the number of faults minus $\min(n, u)$.

**Proof.** The exchange argument is that of CLRS (4th ed., §15.4, offline caching). Let $S$ be any algorithm that makes OPT's choices on $r_1, \dots, r_{i-1}$, so both hold the same set $C$ before $r_i$. We build $S'$ that makes OPT's choices on $r_1, \dots, r_i$ and faults no more often than $S$. Applying this for $i = 1, 2, \dots, T$ turns any algorithm into OPT without increasing its fault count, so OPT's count is the minimum.

If at $r_i$ both hit, or a frame is free, or both evict the same page, let $S' = S$. Otherwise $r_i$ faults with $C$ full, OPT evicts $z$ and $S$ evicts $x \ne z$; let $S'$ evict $z$. Then $S$ holds $D \cup \{z\}$ and $S'$ holds $D \cup \{y\}$, with $y = x$ and $D = (C \setminus \{x, z\}) \cup \{r_i\}$. Since $z$ was the resident page used farthest ahead, $z$ is not referenced again before $x$ is. $S'$ copies $S$ while keeping the invariant "$S$ holds $D \cup \{z\}$ and $S'$ holds $D \cup \{y\}$" until the two sets coincide. At each later reference $b$:

1. $b \in D$: both hit and nothing changes.
2. $b \notin D \cup \{y, z\}$: both fault. If $S$ evicts $z$, $S'$ evicts $y$ and the sets coincide. If $S$ evicts $w \in D$, $S'$ evicts $w$ as well and the invariant holds with $D$ replaced by $(D \setminus \{w\}) \cup \{b\}$.
3. $b = y$: $S$ faults and $S'$ hits. If $S$ evicts $z$ the sets coincide; if $S$ evicts $w \in D$, the invariant holds with $D$ replaced by $(D \setminus \{w\}) \cup \{y\}$ and $y$ by $w$. Either way $S'$ is now one fault ahead.
4. $b = z$: $S$ hits, while $S'$ faults, evicts $y$ and then holds the same set as $S$. This happens only after $x$ has been referenced, and at that reference either the sets had already coincided or case 3 occurred; so $S'$ was at least one fault ahead and is now not behind.

Once the sets coincide, $S'$ copies $S$ to the end. In every case $S'$ faults at most as often as $S$. For the counts: with empty frames the first reference to each page faults under any algorithm. Before the frames fill no page is evicted, so every fault in that phase loads a new distinct page; the frames are full after $\min(n, u)$ such faults, and every later fault is a replacement.

**GATE use.** Fault-count questions run FIFO, LRU and OPT on one string. Under OPT, ties between pages never used again do not change the count, since any farthest choice is optimal by the argument above. The traps are dropping the compulsory faults and answering "faults" when the question asks for replacements.

**Check.** On 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 with 3 frames, OPT faults 7 times: 1, 2 and 3 are compulsory, 4 evicts 3, 5 evicts 4, 3 evicts 1 or 2 and 4 evicts a page other than 5, so there are $7 - 3 = 4$ replacements; with 4 frames OPT faults 6 times. A script compared OPT with an exhaustive search over every eviction choice on every string of length 8 over 4 pages with 2 and 3 frames, and on 1,500 random strings of length 14 over 6 pages with 2 to 5 frames: 137,072 cases with no difference.

## Stack algorithms cannot show Belady's anomaly; FIFO can
<!-- topics: os-memory-management.beladys-anomaly, os-memory-management.replacement-policies -->

**Claim.** Let $S_t(n)$ be the set of resident pages after reference $t$ with $n$ frames, starting empty under demand paging. A policy is a stack algorithm if $S_t(n) \subseteq S_t(n+1)$ for all $t$ and $n$ (the inclusion property).

1. A stack algorithm never faults more with $n + 1$ frames than with $n$.
2. A policy that evicts the lowest-ranked resident page, under a strict ranking of all pages that depends on the reference string and the time but not on $n$, is a stack algorithm. LRU (rank by time of last reference) and OPT (rank by time of next reference, with a fixed tie-break among pages never referenced again) are of this kind.
3. FIFO is not: its rank, the time a page was loaded, depends on $n$. On 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 it faults 9 times with 3 frames and 10 times with 4. For every $n \ge 3$ the string $1, \dots, n+1,\ 1, \dots, n-1,\ n+2,\ 1, \dots, n+2$ makes FIFO fault $2n + 3$ times with $n$ frames and $2n + 4$ times with $n + 1$, so no frame count avoids the anomaly; only the choice of policy does.

**Proof.** (1) If $r_t \in S_{t-1}(n)$ then $r_t \in S_{t-1}(n+1)$, so every hit with $n$ frames is a hit with $n + 1$, and the faults with $n + 1$ frames form a subset of the faults with $n$.

(2) The proof is that of Mattson, Gecsei, Slutz and Traiger (1970), by induction on $t$, starting from $S_0(n) = S_0(n+1) = \emptyset$. Assume $S_{t-1}(n) \subseteq S_{t-1}(n+1)$ and let $r = r_t$. Both memories have seen the same distinct pages, so if the larger one is full the smaller one is full too.

- $r \in S_{t-1}(n)$: both hit and neither set changes.
- $r \in S_{t-1}(n+1) \setminus S_{t-1}(n)$: only the smaller memory faults. It loses at most one page and gains $r$, which is already in $S_{t-1}(n+1) = S_t(n+1)$.
- $r \notin S_{t-1}(n+1)$: both fault. If the larger memory has a free frame it only gains $r$, and $S_t(n) \subseteq S_{t-1}(n) \cup \{r\} \subseteq S_t(n+1)$. Otherwise both are full; the larger evicts its lowest-ranked page $x$ and the smaller its lowest-ranked page $y$. If $x \in S_{t-1}(n)$, then $x$, being lowest in the larger set, is lowest in the subset as well, so $x = y$. Either way $x \notin S_{t-1}(n) \setminus \{y\}$, and $S_t(n) = (S_{t-1}(n) \setminus \{y\}) \cup \{r\} \subseteq (S_{t-1}(n+1) \setminus \{x\}) \cup \{r\} = S_t(n+1)$.

The step "lowest in the larger set is lowest in the subset" needs one ranking shared by both memories, and that is where independence from $n$ enters. LRU's ranking at time $t$ is fixed by the string up to $t$ and OPT's by the string after $t$; neither depends on what is resident. OPT's fault count is the same for every tie-break, so every version of OPT is free of the anomaly.

(3) With 4 frames, page 5 at reference 7 evicts 1, the oldest load. With 3 frames, 1 was reloaded at reference 5 and 5 evicts 4 instead. After reference 7, $S(3) = \{1, 2, 5\}$ and $S(4) = \{2, 3, 4, 5\}$, so inclusion fails, and the next references, 1 and 2, hit with 3 frames and fault with 4. For the family, take $n$ frames first. The first phase, $1, \dots, n+1$, faults $n + 1$ times and leaves $2, \dots, n+1$. In the second, each reference $k = 1, \dots, n-1$ faults and evicts page $k + 1$, leaving the queue $n+1, 1, \dots, n-1$. Then $n + 2$ faults and evicts $n + 1$. In the last phase $1, \dots, n-1$ hit, $n$ evicts 1, $n + 1$ evicts 2, and $n + 2$ hits; this needs $n \ge 3$, so that page 2 is still ahead of $n + 2$ in the queue. Total $(n+1) + (n-1) + 1 + 2 = 2n + 3$. With $n + 1$ frames the first phase gives $n + 1$ compulsory faults, the second phase hits throughout, $n + 2$ evicts 1, and in the last phase every reference faults, because reference $k$ evicts page $k + 1$, the next one requested: $(n+1) + 0 + 1 + (n+2) = 2n + 4$.

**GATE use.** MSQs ask which policies can show the anomaly: FIFO and second chance can, LRU and OPT cannot. The traps are calling the anomaly FIFO-only, claiming that some minimum number of frames avoids it, and reading it as proof that FIFO is always worse than LRU; on the string above FIFO with 3 frames faults 9 times and LRU 10.

**Check.** A script ran the three policies with 1 to 6 frames on the classic string: FIFO 12, 12, 9, 10, 5, 5; LRU 12, 12, 10, 8, 5, 5; OPT 12, 9, 7, 6, 5, 5. It checked inclusion after every reference on 4,000 random strings of 5 to 24 references over 6 pages with $n = 1, \dots, 5$: it held in every LRU and OPT run and failed in 5,576 of the 20,000 FIFO runs. The family gave $2n + 3$ and $2n + 4$ faults for every $n$ from 3 to 30; for $n = 2$ the string 1, 2, 3, 1, 4, 1, 2, 3, 4 gives 8 faults with both 2 and 3 frames, so the condition $n \ge 3$ is needed.

## Clock (second chance): sweep cost, FIFO behaviour and the anomaly
<!-- topics: os-memory-management.lru-approximations, os-memory-management.beladys-anomaly -->

**Claim.** Clock keeps the $f$ frames in a circle with a hand and one reference bit per frame. A hit sets the page's bit. On a replacement the hand clears each set bit it passes, evicts the first page whose bit is already 0, loads the new page there and moves one frame past it. Then:

1. One replacement inspects at most $f + 1$ frames.
2. Over $T$ references starting from empty frames, the total number of inspections is at most the number of times a bit is set plus the number of replacements, so at most $2T$: amortised $O(1)$ per reference.
3. If every bit is set at a fault, clock clears them all and evicts the page under the hand, as FIFO does when the hand rests on the oldest page.
4. Clock is not a stack algorithm: it shows Belady's anomaly whether new pages get bit 1 or bit 0.

**Proof.** (1) No reference happens during a sweep, so no bit is set while the hand moves. Each inspection of a page with bit 1 clears it. After $f$ inspections without stopping, the hand has visited every frame once and cleared every bit, so the $(f+1)$-th inspection is back at the first frame, now 0, and stops. Statement 3 is the case in which every bit starts set.

(2) Charge every inspection that clears a bit to the event that set that bit, a hit on a page whose bit was 0 or the loading of a page with bit 1. A bit that has been set is cleared at most once before it is set again, so each setting is charged at most once. Charge the final inspection of each replacement, the one that stops, to that replacement. A reference sets at most one bit and causes at most one replacement, so the total is at most $2T$.

(4) With new pages given bit 1, clock on 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 evicts exactly FIFO's victims and faults 9 times with 3 frames and 10 with 4. With new pages given bit 0, take 1, 1, 2, 2, 3, 4, 3. With 2 frames, the second 1 and the second 2 set both bits; 3 then clears both and evicts 1, 4 evicts 2 (bit 0), and the final 3 hits: 4 faults. With 3 frames, 3 goes into the free frame with bit 0; 4 clears the bits of 1 and 2 and evicts 3, and the final 3 faults and evicts 1: 5 faults. By part 1 of the previous section, no stack algorithm can fault more with more frames.

For comparison, exact LRU costs $O(1)$ per reference with a doubly linked list in recency order and a hash map from page to list node: each reference moves its node to the head and the victim is the tail. A timestamp per frame costs $O(1)$ per hit but $O(f)$ per fault to find the oldest stamp.

**GATE use.** Victim-tracing MCQs fix the bits and the hand position. The traps are evicting the first page with bit 1 instead of clearing it, and forgetting that bits cleared during one sweep stay cleared for the next fault. MSQs on Belady's anomaly count clock among the policies that can show it.

**Check.** Pages A, B, C, D in clock order with bits 1, 1, 0, 1 and the hand at A. Loading E clears A and B, evicts C and leaves the hand at D. Loading F clears D, reaches A, whose bit the first sweep cleared, and evicts A: the victims are C, then A. A script reproduced both anomaly strings, including FIFO's victim sequence under the bit-1 convention. On 3,000 random strings, each run once with new pages given bit 1 and once with bit 0, no replacement inspected more than $f + 1$ frames and the total never exceeded settings plus replacements; with 3 frames and references 1, 2, 3, 4 (new bit 1), the fault on 4 inspected exactly 4 frames.

## Working sets, thrashing and proportional allocation
<!-- topics: os-memory-management.thrashing-working-set, os-memory-management.frame-allocation -->

**Claim.** The working set $W_i(t, \Delta)$ of process $i$ is the set of distinct pages among its last $\Delta$ references, $\mathrm{WSS}_i = \lvert W_i \rvert$, and the total demand is $D = \sum_i \mathrm{WSS}_i$. Let $m$ frames be available.

1. If $D > m$, every allocation with $\sum_i a_i \le m$ gives some process $a_i < \mathrm{WSS}_i$. If that process references its whole working set in every window of $\Delta$ references, it faults at least $\mathrm{WSS}_i - a_i$ times per window.
2. A process that cycles through $k$ pages faults on every reference under LRU with $a < k$ frames; with $k$ frames only the first $k$ references fault.
3. Suppose one paging device serves faults one at a time in time $s$, the fault rate per reference is $p$, and each reference stands for time $m$ of useful work. Then at most $1/(ps)$ references complete per unit time, so the processor does useful work at most a fraction $m/(ps)$ of the time when that is below 1, however many processes are admitted. Admitting more processes shrinks the $a_i$, and once $D > m$ part 1 gives some process at least $\mathrm{WSS}_i - a_i$ faults per window; this is thrashing, and the remedy is to suspend processes until $D \le m$.
4. Proportional allocation $a_i = \lfloor s_i m / S \rfloor$, with $S = \sum_j s_j$, never hands out more than $m$ frames and leaves between $0$ and $n - 1$ of them unassigned among $n$ processes.

**Proof.** (1) If $a_i \ge \mathrm{WSS}_i$ held for every $i$, then $\sum_i a_i \ge D > m$, a contradiction. At the start of a window in which the process references all of $W_i$, at most $a_i$ of those pages are resident, so at least $\mathrm{WSS}_i - a_i$ are absent, and the first reference to each absent page in the window faults.

(2) In the cycle $1, \dots, k, 1, \dots, k, \dots$ the page referenced next was last used $k$ references earlier. LRU with $a$ frames holds the $a$ most recently used pages, which are the last $a$ references, all distinct because $a < k$. The page used $k$ references ago is not among them, so every reference faults. With $k$ frames every page stays resident after its first reference.

(3) Every fault occupies the device for time $s$, so at most $1/s$ faults complete per unit time. On average $1/p$ references separate two faults, so at most $1/(ps)$ references complete per unit time, carrying at most $m/(ps)$ units of work. The bound does not involve the number of processes, so admitting more of them cannot raise it. It does lower the $a_i$, and once $D > m$ part 1 gives some process at least $\mathrm{WSS}_i - a_i$ faults per window, a count that grows as $a_i$ shrinks.

(4) Each floor loses less than one frame: $s_i m/S - 1 < a_i \le s_i m/S$. Summing over the $n$ processes, $m - n < \sum_i a_i \le m$. The sum is an integer, so the leftover $m - \sum_i a_i$ is one of $0, \dots, n - 1$. Equal allocation is the case of equal $s_i$, $a_i = \lfloor m/n \rfloor$.

**GATE use.** Thrashing MCQs ask for the cause (total working-set demand above the available frames) and the remedy (reduce the degree of multiprogramming, or control each process's working set or page-fault frequency). The trap is admitting more processes because the processor looks idle; a shorter quantum or a different replacement policy creates no frames. Allocation MCQs apply the floor; rounding to the nearest frame or up is the trap.

**Check.** For the reference string 1, 2, 1, 3, 2, 1, 4, 4, 4, 5, 4, 5, 4, 5, 5, 4 with $\Delta = 5$, the working set after reference 5 is $\{1, 2, 3\}$, after reference 8 it is $\{1, 2, 3, 4\}$ and after reference 16 it is $\{4, 5\}$. Working sets of 30, 25 and 40 pages with 90 frames give $D = 95 > 90$; suspending the 40-page process leaves 55. LRU on $1, \dots, 5$ repeated ten times faults 50 times with 4 frames and 5 times with 5 frames (FIFO also faults 50 times with 4). With $p = 10^{-3}$, $s = 8$ ms and $m = 100$ ns, the device bound is $m/(ps) = 100/8000 = 1.25\%$, close to $m/\text{EAT} = 100/8099.9 \approx 1.23\%$ from the fault-rate section. Fifty frames shared by processes of 20, 45 and 135 pages: the exact shares are 5, 11.25 and 33.75, so $a = 5, 11, 33$ with one frame left; three equal processes sharing 11 frames get 3 each and leave $2 = n - 1$, the bound attained. A script also checked the leftover on 20,000 random cases; it was always between 0 and $n - 1$.
