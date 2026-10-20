# File organization and indexing: derivations

## Blocking factor, file blocks and index fan-out
<!-- topics: db-indexing.blocking-factor, db-indexing.multilevel-index -->

**Claim.** Let a block hold $B$ bytes and every record $R \le B$ bytes, with no block header. In an unspanned organisation, where no record crosses a block boundary:

1. A block holds $\text{bfr} = \lfloor B/R \rfloor$ records, and a full block leaves $B - \text{bfr} \cdot R = B \bmod R$ bytes unused, which is less than $R$.
2. A file of $r$ records needs $b = \lceil r/\text{bfr} \rceil$ blocks.
3. If records may span blocks, the file needs $\lceil rR/B \rceil$ blocks, never more than the unspanned count.
4. An index entry of $K + P$ bytes (a key and a pointer) is a record like any other, so an index block holds $fo = \lfloor B/(K+P) \rfloor$ entries. This is the fan-out.

**Proof.** (1) $k$ records fit in a block exactly when $kR \le B$, that is $k \le B/R$, and the largest integer with this property is $\lfloor B/R \rfloor$. By the division algorithm $B = \text{bfr} \cdot R + (B \bmod R)$ with $0 \le B \bmod R < R$. A leftover of $R$ bytes or more would hold one more record, contradicting the choice of bfr.

(2) $b$ blocks hold at most $b \cdot \text{bfr}$ records, so $b \cdot \text{bfr} \ge r$, that is $b \ge r/\text{bfr}$. The least integer solution is $\lceil r/\text{bfr} \rceil$, and filling the blocks in order attains it.

(3) Spanned records waste no space, so the $rR$ bytes need $\lceil rR/B \rceil$ blocks. Because $\text{bfr} \le B/R$, we have $r/\text{bfr} \ge rR/B$, and the ceiling preserves the order.

(4) This is (1) with $R = K + P$.

**GATE use.** Every block-access NAT starts here. The traps are rounding bfr up or keeping the fraction ($2048/200 = 10.24$), rounding $b$ down, and using the spanned count when the question does not say that records span. The same floor gives the fan-out that the index sections reuse.

**Check.** 20,000 records of 200 bytes in 2048-byte blocks: $\text{bfr} = \lfloor 10.24 \rfloor = 10$, $b = 2000$, and each block leaves $2048 \bmod 200 = 48$ bytes unused. Spanned, the file needs $\lceil 4{,}000{,}000/2048 \rceil = \lceil 1953.1 \rceil = 1954$ blocks. Index entries of $10 + 6$ bytes give $fo = \lfloor 2048/16 \rfloor = 128$. A script recomputed these numbers and checked that the leftover is below $R$ for every $R \le B < 600$.

## Heap scan and binary search over blocks
<!-- topics: db-indexing.file-organization -->

**Claim.** Let a file occupy $b \ge 1$ blocks, and count block reads.

1. Heap file: a search for a key value that is present, equally likely to be in any block, reads $(b+1)/2$ blocks on average and $b$ in the worst case. A search for an absent key, or for every record with a given non-key value, reads all $b$. An insertion rewrites the last block, a constant number of accesses.
2. Sorted file, search on the ordering field: binary search over the blocks reads at most $\lfloor \log_2 b \rfloor + 1 = \lceil \log_2 (b+1) \rceil$ blocks, and no strategy that reads one block at a time does better in the worst case.
3. The chapter's $\lceil \log_2 b \rceil$ equals this bound unless $b$ is a power of 2, where it is one less. It is the convention of Elmasri and Navathe, and the chapter's formulas use it.

**Proof.** (1) A linear scan stops at the block that holds the key. If that is block $j$, the scan reads $j$ blocks, and the average over $j = 1, \dots, b$ is $\frac{1}{b}\sum_{j=1}^{b} j = \frac{b+1}{2}$. A non-key search cannot stop early, because any later block may hold another match, and a key is known to be absent only after the last block.

(2) Reading a block shows its first and last values, so it either ends the search (the value is in this block or is absent from the file) or leaves only the blocks on one side. Reading the block at position $\lceil s/2 \rceil$ of $s$ candidates leaves at most $\lfloor s/2 \rfloor$ of them. Let $T(s)$ be the worst case, with $T(0) = 0$, so that $T(s) \le 1 + T(\lfloor s/2 \rfloor)$. If $2^k \le s < 2^{k+1}$ with $k \ge 1$, then $2^{k-1} \le \lfloor s/2 \rfloor < 2^k$, so $\lfloor \log_2 \lfloor s/2 \rfloor \rfloor = \lfloor \log_2 s \rfloor - 1$, and induction from $T(1) = 1$ gives $T(s) \le \lfloor \log_2 s \rfloor + 1$.

For the lower bound, let $N(t)$ be the largest number of blocks that some strategy always searches with $t$ reads. An adversary answers each read with "not here", choosing whichever side is harder. If the first read is block $i$, both the $i - 1$ blocks before it and the $b - i$ blocks after it must be searchable with $t - 1$ reads, so $b \le 2N(t-1) + 1$. With $N(0) = 0$ this gives $N(t) \le 2^t - 1$, so $b$ blocks need $t \ge \log_2(b+1)$ reads, that is $t \ge \lceil \log_2(b+1) \rceil$. Finally, if $2^k \le b < 2^{k+1}$, then $2^k < b + 1 \le 2^{k+1}$, so $\lceil \log_2(b+1) \rceil = k + 1 = \lfloor \log_2 b \rfloor + 1$.

(3) If $b = 2^k$, then $\lceil \log_2 b \rceil = k$, one less than $k + 1$. Otherwise $2^k < b < 2^{k+1}$ and $\lceil \log_2 b \rceil = k + 1$.

**GATE use.** MSQs compare organisations: heap insertion is constant and heap search linear, sorted search is logarithmic, and a hashed file answers an equality search in about one access but a range query only by a full scan. In NATs the binary-search count is $\lceil \log_2 b \rceil$. The traps are binary-searching a heap file, or a sorted file on a field it is not sorted on.

**Check.** For $b = 3000$, $2^{11} = 2048 \le 3000 < 4096$, so $\lceil \log_2 3000 \rceil = \lfloor \log_2 3000 \rfloor + 1 = 12$, against an average of 1500.5 reads for a heap scan. For $b = 16$ the convention gives 4 and the exact worst case 5. A script ran the textbook three-way binary search for every target and every $b$ below 5000, and a minimax search over all probe strategies for every $b$ below 600, and both gave $\lfloor \log_2 b \rfloor + 1$.

## Index entries, sparse indexes and single-level search
<!-- topics: db-indexing.index-types, db-indexing.dense-sparse, db-indexing.index-access-cost -->

**Claim.** Let a data file hold $r$ records in $b$ blocks, and let an index block hold $fo$ entries of a key and a pointer.

1. Entry counts $r_1$: a primary index (file sorted on a key field) has one entry per data block, $r_1 = b$. A clustering index (file sorted on a non-key field with $d$ distinct values) has $r_1 = d$. A secondary index on a key has $r_1 = r$. A secondary index on a non-key field with one entry per distinct value has $r_1 = d$, each entry pointing to a block of record pointers. The index occupies $b_i = \lceil r_1/fo \rceil$ blocks.
2. A sparse index that holds the first key of every data block finds every record exactly when the file is sorted on that field. A secondary index must therefore be dense.
3. A search through a single-level index costs a binary search over the $b_i$ index blocks plus one data-block read, $\lceil \log_2 b_i \rceil + 1$ in the chapter's convention. The non-key secondary index adds one read for the block of record pointers.

**Proof.** (1) The counts restate the definitions, and $b_i$ follows from the blocking-factor section with $fo$ entries per block.

(2) Let $a_j$, the anchor of block $j$, be its smallest key, and look up $v$ by reading block $j^{*}$, the largest $j$ with $a_j \le v$. If the file is sorted on the field, the anchors increase and every key $v$ in block $j$ satisfies $a_j \le v < a_{j+1}$, so $j^{*} = j$ and the lookup reads the right block. Conversely, suppose that the lookup finds every record, and take a key $x$ in block $i$ and a key $y$ in a later block $j$. The lookup for $x$ returns $i$, so no later anchor is at most $x$; in particular $a_j > x$, and since $y \ge a_j$, also $y > x$. Every key in an earlier block is then smaller than every key in a later one, which is what sorted means. A secondary index is on a field the file is not sorted on, so a sparse one would miss some record.

(3) The index is a sorted file of entries, and for a sparse index the search wants the last entry not above $v$. Reading index block $j$ shows that the answer lies in an earlier block ($v$ is below the block's first entry), in this block ($v$ is within its range), or in this block or a later one ($v$ is above its last entry, and only a later block's first entry can decide). Let $N(t)$ be the most blocks searchable with $t$ reads, and $M(t)$ the most when the leftmost candidate block is already in hand. A first read at block $j$ leaves either the $j - 1$ blocks before it, with nothing in hand, or the blocks from $j$ on, with block $j$ in hand. Hence $N(t) = N(t-1) + M(t-1)$. When the leftmost block is already in hand, a first read at block $j$ keeps a block in hand on either side, so $M(t) = 2M(t-1)$. With $N(0) = 0$ and $M(0) = 1$ this gives $M(t) = 2^t$ and $N(t) = 2^t - 1$, as for an ordinary binary search, and the worst case is again $\lfloor \log_2 b_i \rfloor + 1$, written $\lceil \log_2 b_i \rceil$. The entry found then points to the data block, one more read. For a non-key secondary index it points to a block of record pointers, which must be read before any data block.

**GATE use.** For a NAT, compute $b$, then $r_1$ for the index type, then $b_i$, then $\lceil \log_2 b_i \rceil + 1$, and compare with $\lceil \log_2 b \rceil$ without the index, or with about $b/2$ for a field the file is not sorted on. The traps are one entry per record for a primary index, a dropped data-block read, and calling an index primary because its field is a key: what matters is whether the file is sorted on it. Classification MCQs follow from (2): a file has at most one primary or clustering index and any number of dense secondary ones, and since $r \ge b$, a dense index on a key never needs fewer blocks than a sparse one.

**Check.** 30,000 records of 100 bytes in 1024-byte blocks with 16-byte entries: $\text{bfr} = 10$, $b = 3000$ and $fo = 64$. A primary index has $r_1 = 3000$ and $b_i = \lceil 3000/64 \rceil = 47$, so a search costs $\lceil \log_2 47 \rceil + 1 = 7$, against 12 without the index. A secondary index on a key has $r_1 = 30{,}000$ and $b_i = 469$, so a search costs $9 + 1 = 10$, against about 1500 reads for a linear scan. A clustering index on a field with 1500 values of 20 records each has $b_i = 24$; the first matching block costs $5 + 1 = 6$ reads, and since the 20 matches fill exactly two blocks, all of them cost 7. In the chapter's example a 16-block index costs $\lceil \log_2 16 \rceil + 1 = 5$ by the formula and 6 in the exact worst case, because 16 is a power of 2. A script recomputed every number, and a minimax search over probe strategies confirmed the sparse-index bound for every $b_i$ below 600.

## Multilevel indexes: levels as a ceiling-log
<!-- topics: db-indexing.multilevel-index -->

**Claim.** Build a multilevel index on a first level of $r_1 \ge 2$ entries with fan-out $fo \ge 2$: each new level is a primary index on the level below, until a level fits in one block. Level $j$ then has $b_j = \lceil r_1/fo^{j} \rceil$ blocks, there are

$$t = \lceil \log_{fo} r_1 \rceil$$

levels, the least $t$ with $fo^{t} \ge r_1$, and a search reads $t + 1$ blocks: one per level and then the data block.

**Derivation.** Level 1 has $b_1 = \lceil r_1/fo \rceil$ blocks. Level $j + 1$ is a primary index on level $j$, which is sorted, with one entry per block, so it has $r_{j+1} = b_j$ entries and $b_{j+1} = \lceil b_j/fo \rceil$ blocks. Nested ceilings collapse: for positive integers $a, c$ and real $x$,

$$\left\lceil \frac{\lceil x/a \rceil}{c} \right\rceil = \left\lceil \frac{x}{ac} \right\rceil.$$

For every integer $m$, $\lceil y \rceil \le m$ holds exactly when $y \le m$, so the left side is at most $m$ exactly when $\lceil x/a \rceil \le mc$, that is when $x \le mac$, and so is the right side. Two integers with the same integer upper bounds are equal. By induction $b_j = \lceil r_1/fo^{j} \rceil$.

The top level is the first $j$ with $b_j = 1$, that is $r_1/fo^{j} \le 1$, that is $fo^{j} \ge r_1$, that is $j \ge \log_{fo} r_1$, so $t = \lceil \log_{fo} r_1 \rceil$. A search reads the single top block, follows the entry for $v$ to one block of the level below, and repeats, so it reads one block per level and then the data block. Binary search divides the candidates by 2 per read, a multilevel index by $fo$.

**GATE use.** NATs ask for the blocks on each level, the number of levels or the accesses. Use $r_1 = b$ for a primary first level and $r_1 = r$ for a dense secondary one. The traps are using the record count for a primary index, stopping one level early (the top level must be a single block), and dropping the data-block read.

**Check.** The secondary index above, $r_1 = 30{,}000$ and $fo = 64$, has levels of 469, 8 and 1 blocks: $t = 3$ because $64^2 = 4096 < 30{,}000 \le 64^3$, and a search costs 4 reads, against 10 by binary search on level 1. The chapter's 20,000 entries at $fo = 128$ give 157, 2 and 1 blocks. A secondary index on the key of 16,384 records, with 16-byte entries in 1024-byte blocks, has first and second levels of 256 and 4 blocks. A script checked $t = \lceil \log_{fo} r_1 \rceil$ against repeated division for all $2 \le fo < 70$ and $2 \le r_1 < 5000$, and the nested-ceiling identity on a grid.

## Node order from block size
<!-- topics: db-indexing.node-order, db-indexing.b-tree, db-indexing.b-plus-tree -->

**Claim.** Let a node fill one block of $B$ bytes, with key size $K$, child (block) pointer size $P$, record pointer size $P_r$ and no node header. The largest number of keys $n$ in a node is:

1. B+ tree internal node, $n$ keys and $n + 1$ children: $nK + (n+1)P \le B$, so $n = \lfloor (B - P)/(K + P) \rfloor$.
2. B+ tree leaf, $n$ pairs of a key and a record pointer plus one next-leaf pointer: $n(K + P_r) + P \le B$, so $n = \lfloor (B - P)/(K + P_r) \rfloor$.
3. B-tree node, $n$ keys each with its record pointer, and $n + 1$ children: $n(K + P_r) + (n+1)P \le B$, so $n = \lfloor (B - P)/(K + P_r + P) \rfloor$.

**Derivation.** A node's keys are sorted, and $k$ sorted keys cut the key line into $k + 1$ intervals, one per subtree, so a node with $k$ keys has $k + 1$ child pointers. In a B+ tree the internal keys only route searches, so they carry no record pointer; every key sits in a leaf with its record pointer, and each leaf holds one pointer to the next. In a B-tree every key is stored exactly once, wherever it sits, so internal keys carry record pointers too. Each inequality is linear in $n$: (1) rearranges to $n(K + P) \le B - P$, whose largest integer solution is the floor, and (2) and (3) are the same with $K + P_r$ and $K + P_r + P$ in place of $K + P$. When $P_r > 0$, $K + P_r + P > K + P$, so a B-tree node holds fewer keys than a B+ tree internal node of the same size, and the B+ tree is the shallower of the two.

Orders differ between books. If the order is the maximum number of children, an internal node of order $p$ holds $p - 1$ keys; other books give the maximum number of keys, Bayer and McCreight an order $d$ with $d$ to $2d$ keys per node, and CLRS a minimum degree $t$ with $t - 1$ to $2t - 1$ keys. Compute $n$ first, then convert to the question's definition.

**GATE use.** One-mark NATs. The traps are adding record pointers to a B+ tree internal node, forgetting the next-leaf pointer in a leaf, and giving the key count when the question's order counts children, or the reverse.

**Check.** $B = 1024$, $K = 8$, $P = 4$: $12n + 4 \le 1024$, so 85 keys and 86 children. $B = 4096$, $K = P = 4$: $8n + 4 \le 4096$, so $n = 511$. $B = 512$, $K = 6$, $P = 4$: $n = 50$. A leaf with $B = 1024$, $K = 9$, $P_r = 7$, $P = 6$: $16n + 6 \le 1024$, so $n = 63$. A leaf with $B = 2048$, $K = 10$, $P_r = 6$, $P = 4$: $16n \le 2044$, so $n = 127$; dropping the next pointer gives 128, the internal layout $14n + 4 \le 2048$ gives 146, and charging both pointers to every key gives 102. With Elmasri and Navathe's sizes ($B = 512$, $K = 9$, $P_r = 7$, $P = 6$), (3) allows a B-tree node 23 keys and 24 children, (1) allows a B+ tree internal node 33 keys and 34 children, and (2) allows a leaf 31 keys; the book settles on 23 B-tree children, one below the bound, to leave room for an entry count. A script checked that each $n$ is the largest integer meeting its inequality.

## B-tree node occupancy: why the minimum is half
<!-- topics: db-indexing.b-tree, db-indexing.insertion-splits -->

**Claim.** In a B-tree of order $m \ge 3$, the maximum number of children,

$$\left\lceil \tfrac{m}{2} \right\rceil - 1 \;\le\; \text{keys} \;\le\; m - 1$$

for every node except the root, and an internal node with $k$ keys has $k + 1$ children. The root holds at least one key unless the tree is empty. The lower bound is the largest one that splitting on overflow can maintain, and for $m \ge 5$ the root must be exempt from it.

**Proof.** Upper bound: a node with $k$ keys has $k + 1$ children, and at most $m$ children means at most $m - 1$ keys.

Lower bound: an insertion that overflows a node gives it $m$ keys. The split sends the median up and leaves $m - 1$ keys for the two halves, $\lceil (m-1)/2 \rceil$ and $\lfloor (m-1)/2 \rfloor$. The smaller half has

$$\left\lfloor \frac{m-1}{2} \right\rfloor = \left\lceil \frac{m}{2} \right\rceil - 1,$$

which is checked separately for $m = 2k$ (both sides $k - 1$) and $m = 2k + 1$ (both sides $k$). So a split never produces a node below $\lceil m/2 \rceil - 1$ keys, while any larger minimum would be broken by the smaller half of some split. Deletion restores the bound by borrowing or merging. A node that drops to $\lceil m/2 \rceil - 2$ keys, merged with a sibling at the minimum and the separator between them, gives $2\lceil m/2 \rceil - 2 \le m - 1$ keys, because $2\lceil m/2 \rceil \le m + 1$, so the merged node fits.

Root: the first split of a root that has just overflowed creates a new root holding only the median, one key and two children. If the root also had to hold $\lceil m/2 \rceil - 1 \ge 2$ keys, as it would for $m \ge 5$, the tree could never pass from one level to two.

**GATE use.** MCQs give the maximum keys or children and ask for the minimum in a non-root node. The traps are applying the minimum to the root, taking the order as keys when it counts children, and writing $\lfloor m/2 \rfloor$ for odd $m$.

**Check.** At most 7 keys per node means order 8, so a non-root node holds at least $\lceil 8/2 \rceil - 1 = 3$ keys. For $m = 5$ a non-root node holds 2 to 4 keys, and an overflowing node of 5 keys splits into 2 and 2 around its median. A script checked $\lfloor (m-1)/2 \rfloor = \lceil m/2 \rceil - 1$ and $2\lceil m/2 \rceil - 1 \le m$ for every $m$ below 200, and the B+ tree simulation below checks the corresponding occupancy bounds after every insertion and deletion.

## Maximum and minimum keys for a given number of levels
<!-- topics: db-indexing.tree-capacity -->

**Claim.** Count levels from the root as level 1, and let $c = \lceil m/2 \rceil$.

1. A B-tree of order $m \ge 3$ with exactly $L \ge 1$ levels holds at most $N_{\max} = m^{L} - 1$ and at least $N_{\min} = 2c^{L-1} - 1$ keys.
2. A B+ tree with at most $p$ children per internal node, at most $n$ keys per leaf and exactly $L \ge 2$ levels holds at most $p^{L-1} \cdot n$ and at least $2\lceil p/2 \rceil^{L-2} \lceil n/2 \rceil$ keys. Only leaf keys count, since internal keys are routing copies.

**Derivation.** Level 2 consists of the root's children, and the nodes on level $j + 1$ are the children of the nodes on level $j$. The root has 2 to $m$ children and every other internal node $c$ to $m$, so by induction level $j$ has at most $m^{j-1}$ nodes and, for $j \ge 2$, at least $2c^{j-2}$.

Maximum: at most $m^{j-1}$ nodes on level $j$, each with at most $m - 1$ keys, so

$$N \le \sum_{j=1}^{L} (m-1)\, m^{j-1} = (m-1) \cdot \frac{m^{L} - 1}{m - 1} = m^{L} - 1,$$

with equality for the tree whose nodes are all full.

Minimum: the root has at least one key and every other node at least $c - 1$, so

$$N \ge 1 + \sum_{j=2}^{L} 2c^{j-2}(c - 1) = 1 + 2(c - 1) \cdot \frac{c^{L-1} - 1}{c - 1} = 2c^{L-1} - 1,$$

where $m \ge 3$ makes $c \ge 2$ and the division valid. Equality holds for the tree whose root has one key and whose other nodes have $c - 1$ keys and $c$ children.

B+ tree: level $L$ holds the leaves, at most $p^{L-1}$ of them with $n$ keys each, and at least $2\lceil p/2 \rceil^{L-2}$ of them with $\lceil n/2 \rceil$ keys each, by the same induction with $p$ in place of $m$. Both products are attained by the full tree and by the minimal one.

**GATE use.** Two-mark NATs ask for the most or fewest keys, or nodes, at a given height. Sum level by level when the question's rules differ from these. The traps are applying the $\lceil m/2 \rceil$ minimum to the root, rounding $m/2$ down, counting levels from 0, and counting internal keys of a B+ tree as stored keys.

**Check.** $m = 4$, $L = 3$: 7 to 63 keys. $m = 5$, $L = 4$: the minimum is $1 + 2 \cdot 2 + 6 \cdot 2 + 18 \cdot 2 = 53 = 2 \cdot 3^3 - 1$; holding the root to the same minimum gives 80, rounding down gives $2 \cdot 2^3 - 1 = 15$, and $5^4 - 1 = 624$ is the maximum. A B+ tree with $p = 86$ and $n = 85$ holds at most $86^2 \cdot 85 = 628{,}660$ keys in 3 levels and at least $2 \cdot 43 \cdot 43 = 3698$; with $p = 51$ and $n = 50$ the maximum is $130{,}050$. A dynamic program over all trees found that the attainable key counts are exactly the integers between these bounds, for B-trees with $3 \le m \le 7$ (up to 4 levels for $m \le 5$ and 3 above) and for B+ trees with $1 \le n \le 6$, $3 \le p \le 6$ and up to 4 levels.

## Height range of a B-tree for N keys
<!-- topics: db-indexing.tree-capacity -->

**Claim.** A B-tree of order $m \ge 3$ that holds $N \ge 1$ keys has $L$ levels with

$$\lceil \log_m (N+1) \rceil \;\le\; L \;\le\; 1 + \left\lfloor \log_{\lceil m/2 \rceil} \frac{N+1}{2} \right\rfloor.$$

A B+ tree with fan-out $p$ and leaf capacity $n$ that holds $N$ keys has at least $1 + \lceil \log_p \lceil N/n \rceil \rceil$ levels.

**Derivation.** By the previous section $N \le m^{L} - 1$, so $m^{L} \ge N + 1$ and $L \ge \log_m(N+1)$; since $L$ is an integer, $L \ge \lceil \log_m(N+1) \rceil$. Also $N \ge 2c^{L-1} - 1$ with $c = \lceil m/2 \rceil$, so $c^{L-1} \le (N+1)/2$ and $L - 1 \le \log_c \frac{N+1}{2}$; since $L - 1$ is an integer, $L - 1 \le \lfloor \log_c \frac{N+1}{2} \rfloor$. For the B+ tree, $N \le p^{L-1} n$ gives $p^{L-1} \ge N/n$, and because $p^{L-1}$ is an integer this holds exactly when $p^{L-1} \ge \lceil N/n \rceil$, that is $L - 1 \ge \lceil \log_p \lceil N/n \rceil \rceil$.

The upper bound uses $\lceil m/2 \rceil$ and the factor 2 because the root may have only two children. The lower bound uses $m$ because a full node has $m$ children.

**GATE use.** Questions ask for the minimum or maximum height for $N$ keys, or the fewest levels needed to index $N$ records. The traps are swapping the bases of the two logarithms, dropping the factor 2 from the root, and reporting levels when the question asks for height counted from 0.

**Check.** $m = 5$ and $N = 1000$: $5^4 = 625 < 1001 \le 5^5$ gives $L \ge 5$, and $3^5 = 243 \le 500.5 < 3^6$ gives $L \le 6$, so $L \in \{5, 6\}$. $m = 4$ and $N = 7$ give $L \in \{2, 3\}$, the second being the minimal tree of the previous section. A million keys with $p = n = 100$ need $\lceil 10^6/100 \rceil = 10^4 = 100^2$, so at least 3 levels. The dynamic program confirmed that every $L$ in the range occurs and no other, for every $N$ it covered with $3 \le m \le 7$, and the B+ tree bound for every $N$ up to $p^2 n$.

## B+ tree insertion: splits and the invariants they keep
<!-- topics: db-indexing.insertion-splits, db-indexing.b-plus-tree -->

**Claim.** Let a B+ tree have leaves of at most $n$ keys and internal nodes of at most $p$ children, and let it satisfy:

- I1 (search order): an internal node with keys $k_1 < \dots < k_q$ sends to child $i$ exactly the keys in $[k_i, k_{i+1})$, with $k_0 = -\infty$ and $k_{q+1} = +\infty$.
- I2: all leaves are on the same level.
- I3 (occupancy): a non-root leaf has $\lceil n/2 \rceil$ to $n$ keys, a non-root internal node $\lceil p/2 \rceil$ to $p$ children, and an internal root 2 to $p$ children.
- I4: the leaf chain lists the leaves from left to right, and reading their keys along it gives the stored keys in sorted order, each once.

Insert a key into the leaf that I1 selects. If the leaf overflows to $n + 1$ keys, split it into $\lceil (n+1)/2 \rceil$ and $\lfloor (n+1)/2 \rfloor$ keys and copy the smallest key of the right leaf into the parent. If an internal node overflows to $p + 1$ children, split it into $\lceil (p+1)/2 \rceil$ and $\lfloor (p+1)/2 \rfloor$ children and move the key between them up to the parent. If the root splits, make a new root with that one key. The result again satisfies I1 to I4, and the height grows only when the root splits.

**Proof.** I4: the new key goes into the one leaf whose interval contains it, at its sorted position. A leaf split cuts the sorted keys into a prefix and a suffix and links left leaf, right leaf, old successor, so the chain still lists every key once, in order. The separator is copied, not moved, because the leaf level must keep every key with its record pointer.

I1: a leaf with interval $[lo, hi)$ splits into a left leaf with keys below $s$ and a right leaf with keys from $s$ on, where $s$ is the right leaf's smallest key. Putting $s$ into the parent between the two pointers gives them the intervals $[lo, s)$ and $[s, hi)$, which contain their keys. An internal node with keys $k_1, \dots, k_p$ and children $c_0, \dots, c_p$ splits at some $j$: the left node keeps $k_1, \dots, k_{j-1}$ with $c_0, \dots, c_{j-1}$, the right node takes $k_{j+1}, \dots, k_p$ with $c_j, \dots, c_p$, and $k_j$ goes up, so the two nodes get the intervals $[lo, k_j)$ and $[k_j, hi)$, which contain the intervals of their children. The key $k_j$ must leave the node: the left part has $j$ children and needs exactly $j - 1$ keys, the right part has $p + 1 - j$ children and needs $p - j$ keys, and these use up every key except $k_j$.

I3: the leaf halves have $\lceil (n+1)/2 \rceil \le n$ and $\lfloor (n+1)/2 \rfloor = \lceil n/2 \rceil$ keys, and the internal halves have $\lceil (p+1)/2 \rceil \le p$ and $\lfloor (p+1)/2 \rfloor = \lceil p/2 \rceil$ children (check $n$ even and odd), so both halves meet the minimum. The parent gains one key and one child, and if it overflows it splits in turn. The cascade stops at a node with room or at the root, whose split creates a root with 2 children, allowed only because the root is exempt from the $\lceil p/2 \rceil$ minimum.

I2: a split creates a sibling on the same level, and the only change of depth is a new root, which puts one more level above every leaf at once. So the height grows only at a root split, and all leaves stay level.

When the keys or children cannot be halved evenly, both choices satisfy I3, so the side that gets the extra one is a convention that the question must state.

**GATE use.** Trace questions give a key order and a split rule and ask for the final tree, its height or the number of splits. The traps are removing the separator from the leaf level, copying instead of moving on an internal split, and applying a split rule other than the one stated. A sorted insertion order leaves every left half at its minimum, so it creates the most nodes.

**Check.** The chapter's trace inserts 10, 20, ..., 100 with at most 3 keys per node ($n = 3$, $p = 4$), the left half keeping the larger part. The final tree has root $[70]$, internal nodes $[30, 50]$ and $[90]$, and leaves $[10, 20]$, $[30, 40]$, $[50, 60]$, $[70, 80]$, $[90, 100]$, after four leaf splits, one internal split and two root splits, with height 3. A simulator reproduced this trace and ran 504 random sequences of insertions and deletions, with $1 \le n \le 7$ and $3 \le p \le 8$ under both split biases, checking I1 to I4 after every operation. Three deliberately broken variants (separator moved out of the leaf level, separator dropped from an internal merge, separator left unchanged after a borrow) each failed an invariant.

## B+ tree deletion: borrow, merge and root collapse
<!-- topics: db-indexing.insertion-splits, db-indexing.b-plus-tree -->

**Claim.** Delete a key from its leaf, then repair from the bottom up. A node in underflow borrows from an adjacent sibling with an entry to spare, trying the left sibling first; otherwise it merges with an adjacent sibling. The result satisfies I1 to I4 of the insertion section. A merge always fits, the parent loses one key and one child, and the height falls only when the root is left with one child, which then becomes the root. A routing key equal to a deleted key may stay in an internal node.

**Proof.** Leaf in underflow, with $\lceil n/2 \rceil - 1$ keys. If its left sibling has more than $\lceil n/2 \rceil$ keys, move the sibling's largest key $x$ over and make $x$ the separator between them. The sibling's remaining keys are below $x$, the leaf's keys are at least $x$, and both leaves meet the minimum, so I1 and I3 hold; borrowing from the right moves the sibling's smallest key and makes the sibling's new smallest key the separator. If neither sibling can lend, a sibling has exactly $\lceil n/2 \rceil$ keys and the union has

$$2\left\lceil \tfrac{n}{2} \right\rceil - 1 \le n$$

keys, because $2\lceil n/2 \rceil \le n + 1$. So the merge fits. The parent drops the separator and the pointer to the emptied leaf, and the chain skips that leaf, which keeps I4.

Internal node in underflow, with $\lceil p/2 \rceil - 1$ children. Borrowing is a rotation: the parent's separator comes down as the node's first key, the left sibling's last child moves over as its first child, and the sibling's last key goes up as the new separator. The moved child's keys lie between the sibling's last key and the old separator, which are exactly its new bounds, so I1 holds. A merge with a sibling at exactly $\lceil p/2 \rceil$ children gives $2\lceil p/2 \rceil - 1 \le p$ children. The two nodes bring two fewer keys than children, so the merged node needs one more key, and the parent's separator, the boundary between the two groups of children, comes down. The parent then loses a key and a child and may underflow in turn.

Root: when a merge leaves the root with a single child, that child becomes the root. Every leaf moves up one level at once, so I2 holds, and this is the only step that lowers the height.

Routing keys: if a deleted key is also a separator, leaving the separator in place changes no interval. The leaf below simply holds one key fewer, so I1 holds and a search for the deleted key correctly fails at the leaf.

**GATE use.** Deletion traces fix the rule order (left before right, borrow before merge), and the answer depends on it. The traps are merging when a sibling could lend, forgetting that an internal merge pulls the separator down, and keeping an empty root.

**Check.** Start from the trace's final tree with $n = 3$ and $p = 4$, where a leaf needs 2 keys and an internal node 2 children. Deleting 100 leaves $[90]$; its left sibling $[70, 80]$ cannot lend, so they merge into $[70, 80, 90]$. Their parent is left with one child, and its left sibling $[30, 50]$ lends one through the root, giving root $[50]$ over $[30]$ and $[70]$, with leaves $[10, 20]$, $[30, 40]$, $[50, 60]$, $[70, 80, 90]$. Deleting 10 then merges $[20]$ with $[30, 40]$, the internal nodes merge into $[50, 70]$ around the root's separator, and the root collapses: the height falls from 3 to 2. Deleting 70 next leaves $[80, 90]$ at the minimum and the separator 70 in the root, and a search for 70 fails. The simulator reproduced each tree and checked the invariants after every step.

## Search, range and update cost in trees
<!-- topics: db-indexing.tree-search-cost, db-indexing.b-tree -->

**Claim.** In a B+ tree with $h$ levels and leaves of at most $n$ keys:

1. A point search reads $h$ nodes, plus one data block when the leaves hold record pointers.
2. A range query returning $s$ keys reads $h + \ell - 1$ nodes, where $\ell$ is the number of leaves that hold the range, with $\lceil s/n \rceil \le \ell \le 1 + \lceil (s-1)/\lceil n/2 \rceil \rceil$. An unclustered index adds up to one data-block read per matching record.
3. An insertion reads $h$ nodes and writes the leaf, and each split adds writes. In a B-tree a search may stop at an internal node, but a full B-tree with $L$ levels keeps a fraction $\frac{(m-1)m^{L-1}}{m^{L} - 1} > 1 - \frac{1}{m}$ of its keys on the lowest level, so the average search costs close to $L$ nodes.

**Derivation.** (1) By I1 a search follows exactly one child per level and ends at a leaf.

(2) The first key of the range is found with $h$ reads. By I4 the remaining keys are consecutive along the leaf chain, so each further leaf costs one read, which gives $h + \ell - 1$. Each leaf holds at most $n$ keys, so $\ell \ge \lceil s/n \rceil$. For the upper bound, the leaves after the first hold the other $s - 1$ keys of the range, and every one of them except the last lies wholly inside the range and holds at least $\lceil n/2 \rceil$ keys. So $(\ell - 2)\lceil n/2 \rceil < s - 1$, which gives $\ell - 1 \le \lceil (s-1)/\lceil n/2 \rceil \rceil$.

(3) A full B-tree has $m^{L-1}$ leaves with $m - 1$ keys each, out of $m^{L} - 1$ keys in all, and $\frac{(m-1)m^{L-1}}{m^{L} - 1} > \frac{(m-1)m^{L-1}}{m^{L}} = 1 - \frac{1}{m}$.

**GATE use.** Choose-the-structure MCQs: a range condition or ORDER BY wants a B+ tree, an equality-only workload a hash index, many AND/OR conditions on low-cardinality columns a bitmap index, and an insert-heavy log a heap file. The traps are hashing for a range query and forgetting the per-record data reads of an unclustered index.

**Check.** With $h = 3$ and $n = 85$, a range of 1000 keys reads at least $3 + 12 - 1 = 14$ nodes. It reads at most 15 when the leaves are full ($1 + \lceil 999/85 \rceil = 13$ leaves), and at most 27 in any tree, since every non-root leaf holds at least 43 keys ($1 + \lceil 999/43 \rceil = 25$ leaves). A full B-tree with $m = 100$ and 3 levels keeps 990,000 of its 999,999 keys in the leaves. A script checked the bounds on $\ell$ over random leaf fills for $1 \le n \le 11$ and every range of up to 39 keys.

## Extendible and linear hashing: directory and address invariants
<!-- topics: db-indexing.hashing -->

**Claim.** Extendible hashing keeps a directory of $2^{d}$ entries indexed by $d$ bits of the hash value, where $d$ is the global depth, and each bucket has a local depth $d' \le d$.

1. A bucket of local depth $d'$ is the target of exactly the $2^{d - d'}$ entries whose $d'$ bits equal the bucket's pattern, and these counts sum to $2^{d}$ over all buckets.
2. When a bucket with $d' < d$ overflows, it alone splits into two buckets of depth $d' + 1$ that take $2^{d - d' - 1}$ of its entries each, and the directory keeps its size. Only when $d' = d$ does the directory double first. If every key agrees on the new bit, the split repeats.
3. Linear hashing with $N$ initial buckets, level $i$ and split pointer $s$ ($0 \le s < N2^{i}$) has $N2^{i} + s$ buckets, and a key with hash $H$ lives in bucket $a = H \bmod N2^{i}$ if $a \ge s$, and in $H \bmod N2^{i+1}$ otherwise.

**Proof.** (1) and (2): take the invariant that each bucket of depth $d'$ holds keys whose hashes agree on its $d'$-bit pattern, and that its entries are exactly the indices with that pattern in their $d'$ bits. It holds at the start, with one entry and one bucket of depth 0. Doubling copies entry $j$ to entries $j$ and $j + 2^{d}$; the added top bit leaves the $d'$ pattern bits unchanged, so each bucket's entries are again the indices with its pattern, now $2^{d+1-d'}$ of them. Splitting a bucket with $d' < d$ divides its entries by the next bit, which lies inside the $d$-bit index: the half with that bit 0 gets one new bucket and the half with that bit 1 the other, $2^{d-d'-1}$ entries each, and the keys are divided by the same bit, so both new buckets of depth $d' + 1$ satisfy the invariant. When $d' = d$, the bucket has a single entry and the index has no further bit to divide, so the directory must double first. Each entry points to exactly one bucket, so the counts $2^{d - d'}$ sum to the number of entries, $2^{d}$.

(3) Buckets $0$ to $s - 1$ of the current round have been split with $H \bmod N2^{i+1}$, which sends each of their keys to $a$ or to $a + N2^{i}$, the bucket created by that split. Buckets $s$ to $N2^{i} - 1$ are not split yet and hold the keys with $H \bmod N2^{i}$ equal to their index. When $s$ reaches $N2^{i}$, every bucket of the round has been split, so $i$ grows by one and $s$ returns to 0, and the rule holds again.

**GATE use.** MCQs give the global and local depths and ask what an overflow does. The trap is doubling the directory on every overflow. Equality search costs one bucket read with the directory in memory and two otherwise. Neither scheme answers a range query without reading every bucket.

**Check.** With global depth 3, a bucket of local depth 2 has $2^{3-2} = 2$ entries, $000$ and $100$ under low-bit indexing. With hash value equal to the key and 2 keys per bucket, inserting 8 into the full bucket $[0, 4]$ splits it into $[0, 8]$ and $[4]$ with one entry each, and the directory keeps 8 entries; inserting 16 next overflows $[0, 8]$, whose depth now equals 3, so the directory doubles to 16 entries first. Simulations of 200 random extendible files and 12 linear files checked the invariants after every insertion.

## Bitmap indexes: size and Boolean combination
<!-- topics: db-indexing.bitmap-index -->

**Claim.** A bitmap index on a column with $v$ distinct non-NULL values over $r$ rows stores one vector of $r$ bits per value, $v \cdot r$ bits before compression. If the column has no NULLs, the vectors partition the rows: each row has exactly one 1 among them, so the index holds $r$ ones. A conjunction or disjunction of equality conditions is the bitwise AND or OR of the vectors, but $\lnot (A = a)$ is the complement of $a$'s vector ANDed with a vector of the rows where $A$ is not NULL.

**Proof.** Bit $j$ of the vector for $a$ is 1 exactly when row $j$ has $A = a$. A non-NULL row has exactly one value, so it sets exactly one bit across the $v$ vectors, and a NULL row sets none. Row $j$ satisfies $A = a \wedge B = b$ exactly when bit $j$ is 1 in both vectors, which is the AND, and the same argument gives OR. The complement of $a$'s vector is 1 on the rows where $A \ne a$ and also on the NULL rows, where SQL's $A \ne a$ is unknown and the row must be excluded. ANDing with the non-NULL vector removes them, and for the same reason a deleted-rows vector must be masked out.

**GATE use.** Choose bitmaps for low-cardinality columns in read-mostly warehouses, where many conditions combine by fast bitwise operations. The traps are a high-cardinality column, where $v \cdot r$ grows with the number of values, and a frequently updated table, where every change rewrites bits.

**Check.** Six rows with gender M, F, F, NULL, M, F and status A, A, I, A, I, A: the gender index has $2 \times 6 = 12$ bits and 5 ones. Gender F AND status A selects rows 2 and 6. The complement of the M vector selects rows 2, 3, 4 and 6, and masking the NULL row 4 leaves rows 2, 3 and 6. A million rows with 4 values take $4 \times 10^6$ bits, 500,000 bytes. A script computed each vector.
