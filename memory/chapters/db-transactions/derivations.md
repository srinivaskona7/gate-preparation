# Transactions and concurrency control: derivations

## Counting schedules
<!-- topics: db-transactions.schedule-counting, db-transactions.schedules -->

**Claim.** Let $k$ transactions $T_1, \dots, T_k$ have $n_1, \dots, n_k \ge 1$ operations, and let $N = n_1 + \cdots + n_k$. A schedule is an ordering of all $N$ operations that keeps each transaction's own operations in program order. Then the number of schedules, the number of serial schedules and the number of concurrent (non-serial) schedules are

$$\frac{N!}{n_1!\, n_2! \cdots n_k!}, \qquad k!, \qquad \frac{N!}{n_1! \cdots n_k!} - k!.$$

The conflict-serializable schedules among them are counted by a case split on the direction of every conflict.

**Proof.** Map a schedule to the word of length $N$ whose $p$-th letter is the index of the transaction that owns the $p$-th operation. The word has $n_i$ copies of letter $i$. The map is a bijection: given the word, the $j$-th occurrence of letter $i$ must be the $j$-th operation of $T_i$, because program order is fixed, so the schedule is recovered uniquely, and every such word arises. Words with $n_i$ copies of $i$ are counted by choosing the positions of the 1s, then of the 2s among what is left, and so on:

$$\binom{N}{n_1}\binom{N - n_1}{n_2} \cdots \binom{n_k}{n_k} = \frac{N!}{n_1!\,(N-n_1)!} \cdot \frac{(N-n_1)!}{n_2!\,(N-n_1-n_2)!} \cdots = \frac{N!}{n_1! \cdots n_k!},$$

since the intermediate factorials cancel. A serial schedule is a word made of $k$ solid blocks, one per transaction, so it is fixed by the order of the blocks: $k!$ of them, all distinct because every $n_i \ge 1$. Every other schedule interleaves at least two transactions.

For conflict-serializable counts there is no closed formula; the method is to find the conflicting pairs (next section) and keep the interleavings in which all conflicts between each pair of transactions point the same way. Take $T_1 = r_1(A)\, w_1(A)\, r_1(B)\, w_1(B)$ and $T_2 = r_2(B)\, w_2(B)$. Only $B$ is shared, and the conflicting pairs are $(r_1(B), w_2(B))$, $(w_1(B), r_2(B))$ and $(w_1(B), w_2(B))$. If both operations of $T_2$ precede $r_1(B)$, every conflict gives $T_2 \to T_1$. If both follow $w_1(B)$, every conflict gives $T_1 \to T_2$. In every other placement $w_2(B)$ comes after $r_1(B)$, giving $T_1 \to T_2$, and $r_2(B)$ comes before $w_1(B)$, giving $T_2 \to T_1$: a cycle. The first case places 2 ordered operations into the 3 gaps before $r_1(B)$, a multiset of size 2 from 3 gaps, $\binom{3+2-1}{2} = 6$ ways; the second case has 1 way. So 7 of the $\binom{6}{2} = 15$ schedules are conflict serializable.

**GATE use.** NAT questions ask for the number of schedules, of non-serial schedules, or of conflict-serializable ones. The traps are permuting operations inside a transaction (giving $N!$), forgetting to subtract the $k!$ serial schedules when "concurrent" or "non-serial" is asked, and, in the conflict-serializable count, forgetting that the two serial schedules are included.

**Check.** Two transactions of 3 operations: $\binom{6}{3} = 20$ schedules, of which $20 - 2 = 18$ are non-serial. Three transactions with 2, 3 and 1 operations: $6!/(2!\,3!\,1!) = 60$. A script enumerated all interleavings in both cases and got 20 and 60, and for the $T_1$, $T_2$ pair above it found 15 schedules of which exactly 7 have an acyclic precedence graph (6 equivalent to $T_2 T_1$, 1 to $T_1 T_2$), agreeing with a brute-force search for a conflict-equivalent serial schedule.

## Conflicts, conflict equivalence and the precedence-graph test
<!-- topics: db-transactions.conflicting-operations, db-transactions.conflict-serializability, db-transactions.schedules -->

**Claim.** Two operations $p$ and $q$ conflict when they belong to different transactions, access the same item, and at least one is a write. Two schedules over the same operations are conflict equivalent when every conflicting pair appears in the same order in both; $S$ is conflict serializable when it is conflict equivalent to a serial schedule. Let the precedence graph $G(S)$ have a vertex per transaction and an edge $T_i \to T_j$ whenever some operation of $T_i$ conflicts with a later operation of $T_j$. Then

$$S \text{ is conflict serializable} \iff G(S) \text{ is acyclic},$$

and the serial schedules conflict equivalent to $S$ are exactly the topological orders of $G(S)$. Building $G(S)$ from $m$ operations takes $O(m^2)$ pairwise comparisons and the cycle test takes $O(n + e)$ by depth-first search, for $n$ transactions and $e$ edges.

**Proof.** Why these pairs: a read changes no state, so two reads of $X$ commute; operations on different items touch disjoint state and commute. On one item with a write involved the order matters: in $w_i(X)\, r_j(X)$ against $r_j(X)\, w_i(X)$ the value $T_j$ reads differs, in $w_i(X)\, w_j(X)$ the final value of $X$ differs, and operations of one transaction keep program order by definition, so they are never reordered. Hence swapping two adjacent non-conflicting operations of different transactions leaves every read's source (the last write of its item before it) and every item's final writer unchanged, so the result is the same for every initial database.

Conflict equivalence is the same as being reachable by such swaps. One direction is clear, since a swap of non-conflicting operations keeps the order of every conflicting pair. Conversely, if $S$ and $S'$ order all conflicting pairs alike, take the first operation $o$ of $S'$ and move it to the front of $S$ by adjacent swaps. Every operation it passes precedes $o$ in $S$ and follows it in $S'$, so it is neither from the same transaction (program order is shared) nor in conflict with $o$ (conflict order is shared), and each swap is legal. Recurse on the remaining operations.

($\Rightarrow$) Let $S$ be conflict equivalent to the serial schedule with transaction order $\pi$. An edge $T_i \to T_j$ comes from a conflicting pair with $T_i$'s operation first in $S$, hence first in the serial schedule, so $T_i$ precedes $T_j$ in $\pi$. Every edge points forward in $\pi$, so $\pi$ is a topological order and $G(S)$ has no cycle.

($\Leftarrow$) If $G(S)$ is acyclic it has a topological order $\pi$. Let $S_\pi$ be the serial schedule in that order. A conflicting pair $p <_S q$ with $p \in T_i$, $q \in T_j$ produced the edge $T_i \to T_j$, so $T_i$ precedes $T_j$ in $\pi$ and $p$ precedes $q$ in $S_\pi$. All conflicting pairs agree, so $S$ is conflict equivalent to $S_\pi$. The two directions together show that the equivalent serial orders are exactly the topological orders.

**GATE use.** The 2-mark MCQ gives a schedule on 2 to 4 transactions and asks whether it is conflict serializable, or how many serial schedules it is conflict equivalent to (count the topological orders). Scan every pair on each item, not only adjacent operations, and add no edge for two reads or for operations of one transaction. A related MSQ asks which serial order is equivalent: any topological order is.

**Check.** For $r_1(X)\, w_1(X)\, r_2(X)\, r_3(X)\, w_3(Y)\, r_4(Y)\, w_4(Z)$ the edges are $T_1 \to T_2$, $T_1 \to T_3$ and $T_3 \to T_4$; $r_2(X)$ and $r_3(X)$ add nothing. The topological orders are $T_1 T_2 T_3 T_4$, $T_1 T_3 T_2 T_4$ and $T_1 T_3 T_4 T_2$: 3. For $r_1(X)\, r_2(Y)\, r_1(Y)\, r_2(X)\, w_2(Y)\, w_1(X)$, $r_1(Y) < w_2(Y)$ gives $T_1 \to T_2$ and $r_2(X) < w_1(X)$ gives $T_2 \to T_1$, a cycle. A script compared, on 9,000 random schedules of 2 or 3 transactions, the topological orders of $G(S)$ with the serial orders found conflict equivalent by brute force and found no mismatch; on 5,000 random adjacent swaps of non-conflicting operations it found no change in reads-from or final writes.

## View serializability and blind writes
<!-- topics: db-transactions.view-serializability, db-transactions.schedules -->

**Claim.** Schedules $S$ and $S'$ over the same transactions are view equivalent when (1) each read that reads the initial value in $S$ does so in $S'$, (2) each read that reads the value written by $w_i(X)$ in $S$ reads from the same write in $S'$, and (3) each item has the same final writer. $S$ is view serializable when it is view equivalent to a serial schedule. Then:

- every conflict-serializable schedule is view serializable, and the inclusion $\text{Serial} \subsetneq \text{Conflict serializable} \subsetneq \text{View serializable}$ is strict;
- if no transaction writes an item it has not read earlier (no blind writes), and each transaction reads and writes each item at most once, view serializability and conflict serializability coincide. So a schedule that is view serializable but not conflict serializable contains a blind write;
- deciding view serializability is NP-complete (Papadimitriou, 1979), so the exam method is to test candidate serial orders against (1)–(3).

**Proof.** Inclusion: by the previous section, a conflict-equivalent serial schedule is reached by swaps of adjacent non-conflicting operations, and each swap keeps every reads-from source and every final writer, so it is also view equivalent. The inclusions are strict: with $T_1 = r_1(X)\, w_1(X)$ and $T_2 = r_2(Y)$, the schedule $r_1(X)\, r_2(Y)\, w_1(X)$ splits $T_1$ around $T_2$, so it is not serial, and it has no conflicting pair, so it is conflict serializable; and the example in **Check** is view serializable without being conflict serializable.

No blind writes. Let $S$ be view equivalent to the serial schedule $S'$, and fix an item $X$. In $S'$ let the writers of $X$ in order be $W_1, \dots, W_m$. Each $W_{l+1}$ reads $X$ before writing it, and in a serial schedule that read sees the previous writer $W_l$ (or the initial value for $l = 0$). By (1) and (2) the same reads-from holds in $S$, so in $S$

$$w_{W_l}(X) <_S r_{W_{l+1}}(X) <_S w_{W_{l+1}}(X),$$

and the writes of $X$ occur in $S$ in the same order $W_1, \dots, W_m$. Now take any other transaction $T_j$ that reads $X$, reading from $W_l$. In $S'$ it sits after $W_l$ and before $W_{l+1}$. In $S$ its read follows $w_{W_l}(X)$ and precedes $w_{W_{l+1}}(X)$, since it reads from $W_l$ and the writes are in that order. Go through the conflicting pairs on $X$: two writes are in the same order in both schedules; a write of $W_a$ before a read of $T_j$ in $S$ has $a \le l$, so $W_a$ precedes $T_j$ in $S'$; a read of $T_j$ before a write of $W_a$ in $S$ has $a \ge l + 1$, so $T_j$ precedes $W_a$ in $S'$ (if $T_j = W_{l+1}$ itself, its later write is in the same transaction and not a conflicting pair). Every conflicting pair on every item is ordered as in $S'$, so $S$ is conflict serializable.

Where a blind write enters: the step "$W_{l+1}$ reads from $W_l$" fails, so the order of the writes in $S$ is no longer pinned down by reads-from. A blind write that is overwritten before anyone reads it can sit anywhere, which is how a cycle in $G(S)$ coexists with view equivalence.

**GATE use.** For "view serializable but not conflict serializable", run the precedence test first: acyclic settles it as both. If the graph is cyclic and there is no blind write, the schedule is neither. Only with a blind write do you list the initial reads, reads-from pairs and final writers and test serial orders, which must put the initial readers before every writer of their items and the final writer last.

**Check.** $S = r_1(X)\, w_2(X)\, w_1(X)\, w_3(X)$ has edges $T_1 \to T_2$ ($r_1 < w_2$), $T_2 \to T_1$ ($w_2 < w_1$), $T_1 \to T_3$ and $T_2 \to T_3$, so it is not conflict serializable. $T_1$ reads the initial $X$ and $T_3$ writes last; the serial order $T_1 T_2 T_3$ matches both, while $T_2 T_1 T_3$ makes $T_1$ read $T_2$'s value. A script tried all 6 orders and found $T_1 T_2 T_3$ the only view-equivalent one. The schedule $w_1(X)\, w_2(X)\, w_3(X)$ has edges $T_1 \to T_2$, $T_2 \to T_3$, $T_1 \to T_3$ only, so it is conflict serializable and does not illustrate the gap. On 4,000 random schedules no conflict-serializable schedule failed the view test. On 30,000 more, the 138 cyclic schedules without blind writes were all not view serializable, and all 128 view-but-not-conflict-serializable schedules had a blind write.

## Recoverable, cascadeless and strict schedules
<!-- topics: db-transactions.recoverable-schedules, db-transactions.cascadeless-strict -->

**Claim.** Say $T_j$ reads from $T_i$ ($i \ne j$) when $r_j(X)$ returns the value written by $w_i(X)$. A schedule with commits and aborts is

- recoverable if, whenever $T_j$ reads from $T_i$ and $T_j$ commits, $c_i$ comes before $c_j$;
- cascadeless if every read from $T_i$ happens after $c_i$ (a transaction reads only committed data);
- strict if no $r_j(X)$ or $w_j(X)$ occurs after $w_i(X)$ while $T_i$ is still active.

Then $\text{Strict} \subsetneq \text{Cascadeless} \subsetneq \text{Recoverable}$, and these classes are independent of serializability: a conflict-serializable schedule need not be recoverable, and a strict schedule need not be serializable. Every serial schedule is strict.

**Proof.** Strict implies cascadeless: a read from $T_i$ comes after $w_i(X)$, and strictness forbids it while $T_i$ is active, so $T_i$ has already ended; it ended by committing, because an aborted write is undone and cannot be read from. Cascadeless implies recoverable: if $T_j$ reads from $T_i$, then $c_i <$ the read $< c_j$. The inclusions are strict. In $r_1(X)\, w_1(X)\, r_2(X)\, w_2(X)\, c_1\, c_2$ the read $r_2(X)$ is dirty, so it is not cascadeless, but $c_1 < c_2$, so it is recoverable. In $w_1(X)\, w_2(X)\, c_1\, c_2$ there is no read at all, so it is cascadeless, but $T_2$ overwrites uncommitted data, so it is not strict.

Why each level matters. If the schedule is not recoverable, as in $w_1(X)\, r_2(X)\, c_2\, c_1$ with $T_1$ aborting instead, $T_2$ has committed a result computed from a value that never existed, and durability forbids undoing $T_2$. If it is recoverable but not cascadeless, the abort of $T_1$ forces the abort of every transaction that read from it, and of every transaction that read from those (a cascade). If it is cascadeless but not strict, undoing $T_1$ by restoring its before-image of $X$ wipes out $T_2$'s later write; strictness is exactly what makes before-image undo correct.

Independence: $w_1(X)\, r_2(X)\, c_2\, c_1$ has the single edge $T_1 \to T_2$, so it is conflict serializable, yet not recoverable. $r_1(X)\, w_2(X)\, c_2\, w_1(X)\, c_1$ touches $X$ only after $T_2$ commits, so it is strict, yet $r_1 < w_2$ and $w_2 < w_1$ form a cycle; $T_1$ reads the initial $X$ and also writes last, which no serial order allows, so it is not even view serializable. A serial schedule never touches another transaction's uncommitted data, so it is strict.

**GATE use.** 1-mark MCQs classify a schedule. Find every dirty read ($T_j$ reads $X$ after $w_i(X)$ and before $T_i$ ends): if the reader commits first, not recoverable; if a dirty read exists at all, not cascadeless; if there is none, look for dirty writes to decide strictness. The trap is treating "recoverable" as "no dirty reads": it constrains only commit order.

**Check.** A script classifier labelled $r_1(X)\, w_1(X)\, r_2(X)\, w_2(X)\, c_1\, c_2$ recoverable but not cascadeless, $w_1(X)\, r_2(X)\, c_2\, c_1$ not recoverable, $w_1(X)\, w_2(X)\, c_1\, c_2$ cascadeless but not strict, $w_1(X)\, c_1\, r_2(X)\, w_2(X)\, c_2$ strict, and $r_1(X)\, w_2(X)\, c_2\, w_1(X)\, c_1$ strict with a cyclic precedence graph and no view-equivalent serial order; the first four are all conflict serializable as $T_1 T_2$.

## Two-phase locking gives conflict serializability in lock-point order
<!-- topics: db-transactions.lock-modes, db-transactions.two-phase-locking -->

**Claim.** Each read of $X$ is done under a shared (S) or exclusive (X) lock on $X$, each write under an X lock; S is compatible only with S, and X with nothing. A transaction is two-phase if it acquires no lock after its first release; its lock point is the time of its last acquisition. If every transaction is two-phase, every schedule the lock manager admits is conflict serializable, and

$$\text{lockpoint}(T_i) < \text{lockpoint}(T_j) \implies T_i \text{ precedes } T_j \text{ in an equivalent serial order}.$$

The converse fails: some conflict-serializable schedules cannot be produced by 2PL. 2PL does not prevent deadlock or cascading rollback.

**Proof.** Let $T_i \to T_j$ be an edge of $G(S)$, from a conflicting pair $p <_S q$ on $X$ with $p \in T_i$, $q \in T_j$. One of them is a write, so the locks $T_i$ holds on $X$ at $p$ and $T_j$ holds on $X$ at $q$ are incompatible, and their holding intervals $[a_i, u_i] \ni p$ and $[a_j, u_j] \ni q$ cannot overlap. If $T_j$'s interval came first, then $u_j < a_i \le p < q \le u_j$, which is impossible. So $u_i < a_j$. Because $T_i$ is two-phase, its lock point precedes its first release, which is at most $u_i$; and $T_j$'s lock point is at least $a_j$. Hence

$$\text{lockpoint}(T_i) \le u_i < a_j \le \text{lockpoint}(T_j).$$

Every edge goes from a smaller to a larger lock point, so $G(S)$ has no cycle, and sorting transactions by lock point is a topological order, which by the precedence-graph theorem is an equivalent serial order. A lock upgrade from S to X counts as an acquisition and the same argument applies.

The converse fails for $r_1(X)\, w_2(X)\, r_3(Y)\, w_1(Y)$, whose graph $T_3 \to T_1 \to T_2$ is acyclic. Under 2PL, $T_1$ must release its lock on $X$ before $w_2(X)$; being two-phase it must already hold its X lock on $Y$ then, and hold it until $w_1(Y)$, so it holds an X lock on $Y$ across $r_3(Y)$, which is a conflict. Deadlock: $T_1$ locks $A$ and $T_2$ locks $B$, then each requests the other's item; both are still in the growing phase, so neither releases. Cascades: a basic 2PL transaction may release an X lock before committing, after which another transaction reads the uncommitted value.

**GATE use.** MCQs give a lock sequence and ask whether it is two-phase: look for any lock request after the first unlock, including re-locking an item already released. MSQs ask what 2PL guarantees: conflict serializability, yes; deadlock freedom and cascadelessness, no. When asked for the equivalent serial order of a 2PL schedule, order by lock points.

**Check.** Of the four sequences in the chapter's question, only lock-X(A); lock-S(B); read(B); write(A); unlock(A); unlock(B) is two-phase; the others lock B, lock C, or re-lock A after an unlock. A script built 150 random two-transaction pairs under basic 2PL, enumerated every interleaving the lock manager admits (26,741 schedules), and found all of them conflict serializable with the lock-point order among the equivalent serial orders; 9,780 of them were not strict. For $r_1(X)\, w_2(X)\, r_3(Y)\, w_1(Y)$ an exhaustive search over lock acquisition and release times found no two-phase placement, against 12 placements for the control $r_1(X)\, w_2(X)\, w_1(Y)\, r_3(Y)$. For the opposite-order $A$, $B$ pair under strict 2PL, 6 of the 8 maximal interleavings end in deadlock.

## Strict, rigorous and conservative 2PL
<!-- topics: db-transactions.2pl-variants, db-transactions.two-phase-locking -->

**Claim.** All three variants are two-phase, so their schedules are conflict serializable in lock-point order.

- Strict 2PL holds every X lock until the transaction commits or aborts. Its schedules are strict, hence cascadeless and recoverable. It can deadlock.
- Rigorous 2PL holds every lock until commit or abort. In addition to strictness, the commit order is an equivalent serial order. It can deadlock.
- Conservative (static) 2PL acquires all its locks before its first operation, atomically or not at all, and waits while holding nothing. It never deadlocks, but it can still produce non-strict schedules unless locks are also held to commit.

**Proof.** Strict 2PL: after $w_i(X)$, $T_i$ holds an X lock on $X$ until it ends. Any $r_j(X)$ or $w_j(X)$ needs a lock incompatible with it, so it happens after $T_i$ ends, which is the definition of a strict schedule. S locks may still be released early, so the commit order need not be serial: in $r_1(X)$, unlock-S(X), $w_2(X)$, $c_2$, $c_1$, the only edge is $T_1 \to T_2$, yet $T_2$ commits first.

Rigorous 2PL: in the previous section's proof an edge $T_i \to T_j$ gave $u_i < a_j$. Here every release follows the commit, so $c_i < u_i$, and $T_j$ commits after its operation $q$, which follows $a_j$. So $c_i < u_i < a_j < q < c_j$: every edge goes from an earlier to a later commit, and commit order is a topological order.

Conservative 2PL: deadlock needs a cycle in the wait-for graph, where $T_a \to T_b$ means $T_a$ waits for a lock $T_b$ holds. Every vertex on a cycle both waits and holds a lock someone waits for. A conservative transaction that waits holds no lock, so it cannot be the target of an edge; no cycle exists. Strict and rigorous 2PL acquire locks one at a time during execution, so the hold-and-wait pattern of the last section's deadlock remains.

**GATE use.** MSQs on "which protocol guarantees which property". Serializability: all four 2PL forms. Strictness and cascadelessness: strict and rigorous 2PL. Deadlock freedom: conservative 2PL only (among the locking forms). The traps are believing strict 2PL is deadlock-free, and thinking strict 2PL fails to produce strict schedules (it does produce them; rigorous 2PL adds the commit-order property).

**Check.** The same enumeration as above, under each policy: strict 2PL admitted 18,270 schedules, all conflict serializable and all strict; rigorous 2PL admitted 23,907, all strict, and in every two-transaction case the commit order was an equivalent serial order; conservative 2PL admitted 16,293 and reached no deadlocked state, while strict and rigorous 2PL reached 58 and 96 deadlocked states.

## Multiple-granularity locking and the compatibility matrix
<!-- topics: db-transactions.multiple-granularity, db-transactions.lock-modes -->

**Claim.** Items form a tree (database, table, page, row). A lock on a node covers its whole subtree. Intention modes are IS (will lock some descendants in S), IX (will lock some descendants in S or X) and SIX (S on the whole subtree plus IX). With the protocol "to lock a node in S or IS, hold IS or IX on its parent; to lock it in X, IX or SIX, hold IX or SIX on its parent; lock top-down, release bottom-up", the compatibility matrix is (yes = compatible)

$$\begin{array}{c|ccccc} & IS & IX & S & SIX & X \\ \hline IS & \text{yes} & \text{yes} & \text{yes} & \text{yes} & \text{no} \\ IX & \text{yes} & \text{yes} & \text{no} & \text{no} & \text{no} \\ S & \text{yes} & \text{no} & \text{yes} & \text{no} & \text{no} \\ SIX & \text{yes} & \text{no} & \text{no} & \text{no} & \text{no} \\ X & \text{no} & \text{no} & \text{no} & \text{no} & \text{no} \end{array}$$

and every pair of conflicting accesses to the same data is detected at some node.

**Derivation.** Describe each mode by two parts: an explicit access to the whole subtree (none for IS and IX, S for S and SIX, X for X) and the set of explicit modes it may take on descendants ($\{S\}$ for IS, $\{S, X\}$ for IX and SIX, none for S and X). Two modes on one node are compatible exactly when (a) their explicit parts are compatible (only S with S), and (b) neither's explicit part conflicts with a mode the other may take below. Intention parts never clash with each other at this node: if the descendants they lead to collide, both transactions will need explicit locks on a common node lower down, and the conflict is caught there. Apply this to each pair. IX with S fails (b): S reads the whole subtree and IX may write a row in it. SIX contains S and IX, so it is compatible only with modes compatible with both, which leaves IS. X fails (a) or (b) against everything, including IS. IS against X fails (b) for the same reason. IS and IX pass, because both are pure intentions. This yields the matrix above.

Soundness: suppose $T_1$ holds an explicit lock on node $v$ and $T_2$ an explicit lock on an ancestor $u$ (covering $v$), with incompatible explicit modes. By induction up the path, the protocol leaves an ancestor of a node locked in S or IS holding IS, IX or SIX (the parent of an IS or S node holds IS or IX, and the parent of an IX node holds IX or SIX), and an ancestor of a node locked in X or SIX holding IX or SIX. Locking top-down and releasing bottom-up means $T_1$ still holds that mode on $u$. The explicit parts of S and SIX are S, so incompatibility leaves two cases. If $T_1$'s explicit part on $v$ is S, then $T_2$ holds X on $u$, against IS, IX or SIX from $T_1$. If it is X, then $T_2$ holds S, SIX or X on $u$, against IX or SIX from $T_1$. All of these entries are "no" in the matrix, so one of the two lock requests at $u$ was refused.

**GATE use.** The 1-mark MCQ: "$T_1$ holds IX on a table; which lock can $T_2$ get at once?" Only IS or IX. Other shapes: which lock to take on a table before updating a few rows (IX on the table, X on the rows), and why SIX exists (scan a whole table while updating a few rows, without locking every row).

**Check.** A script encoded each mode as (explicit part, possible descendant modes), applied rules (a) and (b), and reproduced the 25 entries of the matrix, and confirmed that every ancestor mode the protocol allows is incompatible with every conflicting explicit mode $T_2$ can hold above; the modes compatible with IX are exactly IS and IX, so among S, SIX, IS and X only IS can be granted.

## Timestamp ordering serializes in timestamp order
<!-- topics: db-transactions.timestamp-ordering -->

**Claim.** Each transaction $T$ gets a unique timestamp $TS(T)$ at start; each item keeps $R\text{-}TS(X)$ and $W\text{-}TS(X)$, the largest timestamps of transactions that have read and written it (initially 0). The rules are

$$r_T(X): \ TS(T) < W\text{-}TS(X) \Rightarrow \text{roll back } T, \text{ else } R\text{-}TS(X) \leftarrow \max(R\text{-}TS(X), TS(T));$$

$$w_T(X): \ TS(T) < R\text{-}TS(X) \text{ or } TS(T) < W\text{-}TS(X) \Rightarrow \text{roll back } T, \text{ else } W\text{-}TS(X) \leftarrow TS(T).$$

Every schedule of accepted operations is conflict serializable, equivalent to the serial schedule in timestamp order. The protocol never waits, so it cannot deadlock. Basic timestamp ordering does not ensure recoverability or cascadelessness. A rolled-back transaction must restart with a new, larger timestamp.

**Proof.** The rules keep the invariant that $W\text{-}TS(X)$ is at least the timestamp of every accepted write of $X$, and $R\text{-}TS(X)$ at least that of every accepted read, since they only increase and each accepted operation raises its own field to at least its timestamp. Take an accepted conflicting pair $p <_S q$ on $X$, $p \in T_i$, $q \in T_j$, $i \ne j$:

- $w_i$ then $r_j$: when $r_j$ is accepted, $TS(T_j) \ge W\text{-}TS(X) \ge TS(T_i)$;
- $r_i$ then $w_j$: $TS(T_j) \ge R\text{-}TS(X) \ge TS(T_i)$;
- $w_i$ then $w_j$: $TS(T_j) \ge W\text{-}TS(X) \ge TS(T_i)$.

Timestamps are unique, so $TS(T_i) < TS(T_j)$ in each case. Every edge of $G(S)$ goes from an older to a younger transaction, so $G(S)$ is acyclic and timestamp order is a topological order. Equality is never a rollback because it occurs only when a transaction meets its own earlier read or write.

No operation waits: each is accepted or causes a rollback, so the wait-for graph has no edges. The protocol does not look at commits, so $w_1(X)\, r_2(X)\, c_2$ with $TS(T_1) < TS(T_2)$ is accepted, and if $T_1$ then aborts the schedule is unrecoverable. On restart, $T$ was rejected because its timestamp was below an item timestamp; item timestamps never decrease, so with the old timestamp it would fail the same test again. A new timestamp larger than every item timestamp passes it. (Keeping the old timestamp is the starvation remedy of wait-die and wound-wait, not of timestamp ordering.)

**GATE use.** Traces: keep a table of R-TS and W-TS, apply the rule for each operation, and stop at the first rollback. Traps: raising R-TS to a smaller timestamp (it takes the maximum), rolling back on equality, and applying the Thomas rule when the failure is against R-TS. MSQs: timestamp ordering is conflict serializable and deadlock-free but may starve and is not cascadeless.

**Check.** $TS = 5, 10, 15$ and $r_1(A)\, r_2(B)\, w_2(A)\, w_3(B)\, r_2(A)\, w_1(B)$: after $r_1(A)$, $R\text{-}TS(A) = 5$; after $r_2(B)$, $R\text{-}TS(B) = 10$; $w_2(A)$ passes ($10 \ge 5$, $10 \ge 0$) and sets $W\text{-}TS(A) = 10$; $w_3(B)$ sets $W\text{-}TS(B) = 15$; $r_2(A)$ passes since $10 \ge 10$; $w_1(B)$ fails since $5 < R\text{-}TS(B) = 10$, and the Thomas rule does not save it. A script reproduced this trace and, on 20,000 random schedules of 3 transactions, found 7,389 fully accepted, every one conflict serializable in timestamp order.

## Thomas write rule gives view serializability
<!-- topics: db-transactions.thomas-write-rule, db-transactions.timestamp-ordering -->

**Claim.** Modify the write rule: if $TS(T) < R\text{-}TS(X)$, roll back $T$; if $R\text{-}TS(X) \le TS(T) < W\text{-}TS(X)$, ignore $w_T(X)$ and let $T$ continue; otherwise write and set $W\text{-}TS(X) \leftarrow TS(T)$. The read rule is unchanged. Then the executed schedule (ignored writes dropped) is view equivalent to the serial schedule of the full transactions in timestamp order. The schedule as issued need not be conflict serializable.

**Proof.** Let $E$ be the executed schedule. Every write in $E$ passed both basic tests (the field $W\text{-}TS$ changes only on writes that are performed), and every read passed the basic read test, so $E$ is a schedule basic timestamp ordering accepts; by the previous section it is conflict equivalent, hence view equivalent, to the serial schedule $E_\sigma$ of its own operations in timestamp order.

Now put back an ignored write $w_T(X)$ at its place in $T$, giving the full serial schedule. When it was ignored, some $T'$ with $TS(T') = W\text{-}TS(X) > TS(T)$ had already written $X$. In serial order the value of $w_T(X)$ could be read only by $T$ after this write, or by a transaction with timestamp between $TS(T)$ and $TS(T')$. None of those reads exists in $E$. A read of $X$ accepted before the ignored write by a transaction younger than $T$ would have made $R\text{-}TS(X) > TS(T)$, and then the write would have been a rollback, not ignored. A read of $X$ issued after it by a transaction with timestamp below $TS(T')$, $T$ included, fails the read test because $W\text{-}TS(X) \ge TS(T')$. So no read takes its value from the reinserted write, and the final writer of $X$ is unchanged, because $T'$ follows $T$ in timestamp order. Reinserting each ignored write therefore keeps the view, and $E$ is view equivalent to the full serial schedule.

**GATE use.** A 1-mark trace question asks what happens at an outdated write: under the Thomas rule it is skipped and $T$ continues, while basic timestamp ordering rolls $T$ back. The trap is extending the rule to the $TS(T) < R\text{-}TS(X)$ case, which still rolls back. In MSQs, the Thomas rule allows some view-serializable schedules that are not conflict serializable.

**Check.** $TS(T_1) = 5$, $TS(T_2) = 10$, $r_1(X)\, w_2(X)\, w_1(X)$: $R\text{-}TS(X) = 5$, then $W\text{-}TS(X) = 10$; at $w_1(X)$, $5 \ge 5$ but $5 < 10$, so the write is ignored and $X$ keeps $T_2$'s value. Basic timestamp ordering rolls $T_1$ back there. The issued schedule has the cycle $T_1 \to T_2 \to T_1$. On 20,000 random schedules a script found 9,495 accepted under the Thomas rule, 1,098 of them with a cyclic precedence graph, and for all 9,495 the executed schedule had the same reads-from and final writers as the timestamp-order serial schedule.

## Multiversion timestamp ordering, snapshot isolation and validation
<!-- topics: db-transactions.mvcc-optimistic, db-transactions.isolation-anomalies -->

**Claim.** Under multiversion timestamp ordering each write creates a version $X_k$ with $W\text{-}TS(X_k)$ and $R\text{-}TS(X_k)$. A read $r_T(X)$ returns the version with

$$W\text{-}TS(X_k) = \max\{\, W\text{-}TS(X_j) : W\text{-}TS(X_j) \le TS(T) \,\}$$

and raises $R\text{-}TS(X_k)$; a write $w_T(X)$ finds the same $X_k$ and rolls $T$ back if $R\text{-}TS(X_k) > TS(T)$, else creates a version stamped $TS(T)$. Reads never wait and never roll back, and every read returns what it would return in the serial schedule in timestamp order. Snapshot isolation, in contrast, is not serializable: it admits write skew. Optimistic (validation-based) control is serializable in validation order.

**Proof.** In the timestamp-order serial schedule, $r_T(X)$ sees the write of $X$ by the latest transaction with timestamp at most $TS(T)$. The executed read sees the latest such version created so far, so the only risk is a version with $W\text{-}TS(X_k) < TS(U) < TS(T)$ created after the read by some $U$. When $U$ writes, the version it finds is $X_k$ (take the first such $U$, so nothing lies between), and $R\text{-}TS(X_k) \ge TS(T) > TS(U)$, so $U$ is rolled back. A version stamped $TS(T)$ itself is $T$'s own write, which follows its read in program order in both schedules. So all reads agree with the serial schedule, and the version with the largest timestamp is the final value, as in the serial schedule.

Write skew: with the constraint $x + y \ge 1$ and $x = y = 1$, $T_1$ reads both from its snapshot, sees $x + y - 1 \ge 1$, and sets $x = 0$; $T_2$ does the same and sets $y = 0$. Their write sets are disjoint, so first-committer-wins lets both commit, and $x + y = 0$. In either serial order the second transaction sees the first's update and does nothing, ending with one of the two values still 1, so no serial order yields $(0, 0)$.

Validation: $T_i$ reads into a private workspace, then validates, then writes. It passes if, for every $T_k$ that validated earlier, either $T_k$ finished before $T_i$ started, or $T_k$ finished its writes before $T_i$ validated and $\mathrm{WS}(T_k) \cap \mathrm{RS}(T_i) = \emptyset$. In the second case $T_i$ read nothing $T_k$ wrote, and $T_i$'s writes come after $T_k$ has finished, so every conflict between them goes $T_k \to T_i$; in the first case all of $T_k$ precedes $T_i$. Edges follow validation order, which is therefore an equivalent serial order.

**GATE use.** MSQs on what MVCC buys: readers never block writers and never roll back. Isolation-level questions: snapshot isolation prevents dirty reads, non-repeatable reads and lost updates but allows write skew, so it is weaker than SERIALIZABLE. The trap is reading "multiversion" as "no rollbacks at all": writes can still be rolled back.

**Check.** A script ran multiversion timestamp ordering on 20,000 random schedules of 3 transactions; in all 14,730 accepted ones the value each read returned matched the timestamp-order serial schedule. The write-skew example ends at $(x, y) = (0, 0)$ under snapshot isolation, against $(0, 1)$ for $T_1 T_2$ and $(1, 0)$ for $T_2 T_1$.

## Deadlock prevention by timestamps and detection by the wait-for graph
<!-- topics: db-transactions.deadlock-prevention, db-transactions.deadlock-detection -->

**Claim.** $T_i$ requests a lock that $T_j$ holds, and smaller timestamp means older.

$$\text{Wait-die: } TS(T_i) < TS(T_j) \Rightarrow T_i \text{ waits, else } T_i \text{ is rolled back}; \qquad \text{Wound-wait: } TS(T_i) < TS(T_j) \Rightarrow T_j \text{ is rolled back, else } T_i \text{ waits}.$$

Neither scheme can deadlock, the oldest active transaction is never rolled back, and if a rolled-back transaction restarts with its original timestamp neither scheme starves it. Without prevention, the system is deadlocked exactly when the wait-for graph (edge $T_i \to T_j$ when $T_i$ waits for a lock $T_j$ holds) has a cycle, found by depth-first search in $O(n + e)$.

**Proof.** In wait-die every wait-for edge goes from an older to a younger transaction, so timestamps strictly increase along any path; a cycle would return to its start with a larger timestamp than it began, which is impossible. In wound-wait every edge goes from younger to older, and timestamps strictly decrease along a path, the same contradiction. The victim in wait-die is a requester younger than the holder, and in wound-wait a holder younger than the requester; in both the victim has an older transaction alive, so it is not the oldest. A restarted transaction that keeps its timestamp has only finitely many older transactions ahead of it; each finishes, since the oldest is never rolled back, so it eventually becomes the oldest and then completes. A fresh timestamp would make it the youngest again each time.

Detection: if the graph has a cycle, each transaction on it waits for the next, which is itself blocked, so none proceeds. Conversely, in a deadlock every member of the blocked set waits only for locks held by members of the set, so each has an out-edge inside the set; following out-edges in a finite set must repeat a vertex, which closes a cycle. This uses that a lock is released only by a running transaction, which holds for exclusive single-item requests; with shared locks the graph has one edge to each holder and the same argument applies. Breaking the deadlock means rolling back one victim on each cycle.

**GATE use.** The 1-mark MCQ gives timestamps, a holder and one or two requesters. Decide each request by comparing the requester with the holder only. The trap is the victim in wound-wait: the younger one is rolled back in both schemes, but in wound-wait it is the holder, not the requester. Related MSQ: both schemes are deadlock-free but cause unnecessary rollbacks, and both keep the original timestamp on restart.

**Check.** $TS(T_1) = 5$, $TS(T_2) = 10$, $TS(T_3) = 15$, $T_2$ holds $Q$. Under wound-wait $T_3$ waits (younger than $T_2$), then $T_1$ wounds $T_2$ and gets $Q$, and $T_3$ keeps waiting. Under wait-die $T_3$ dies and $T_1$ waits. A script checked over all ordered pairs of the three transactions that wait-die creates only old-to-young waits and wound-wait only young-to-old waits, that $T_1$ is never a victim, and that DFS finds the cycle in the wait-for graph $1 \to 2 \to 3 \to 1$, $4 \to 1$ and none once $3 \to 1$ is removed.

## Log-based recovery: WAL, undo, redo and checkpoints
<!-- topics: db-transactions.log-recovery, db-transactions.acid, db-transactions.transaction-states -->

**Claim.** Assume immediate update and update records $\langle T, X, \text{old}, \text{new} \rangle$. A rollback during normal operation restores each old value, logs it as a redo-only record $\langle T, X, \text{old} \rangle$, and then writes $\langle T \text{ abort} \rangle$. Call a transaction finished if its commit or abort record is in the log, a winner if that record is a commit, and a loser if it has a start record but neither. Assume about the schedule that (i) no finished transaction writes $X$ while another transaction has an uncommitted, unrolled-back write of $X$, and (ii) once a loser has written $X$, every later update of $X$ is by a loser. Strict 2PL guarantees both; (ii) still allows several losers to write one item, as GATE logs often do. Keep two write-ahead rules:

$$t(\text{log record of } X \text{ on disk}) < t(\text{page of } X \text{ on disk}), \qquad t(\langle T \text{ commit} \rangle \text{ on disk}) < t(T \text{ reported committed}).$$

At a checkpoint all dirty pages are forced to disk and $\langle \text{checkpoint } L \rangle$ is logged with the active list $L$. After a crash, undo every update of every loser, scanning the log backward to each loser's start record and writing the old values; then redo, scanning forward from the last checkpoint, every update and redo-only record of a finished transaction, writing the logged values. The database then holds exactly the effects of the committed transactions: atomicity for losers and aborted transactions, durability for committed ones.

**Proof.** Fix an item $X$ and list its updates (including redo-only records) in log order. By (ii) the list is a prefix of updates by finished transactions followed by a suffix, possibly empty, of loser updates. By (i) the prefix splits into consecutive blocks, one per finished transaction: once $T$ writes $X$, no finished transaction writes $X$ until $T$ commits or has rolled back, and an aborted $T$'s redo-only records come before its abort record, inside its block. A committed block ends at its last new value; an aborted block ends by restoring the value $X$ had before the block. So the value after the prefix is the correct final value: the new value of the last committed writer, or the initial value if none. Every record's old value is the value $X$ held just before it, since it was logged at the moment of the write.

Undo in backward order writes the old values of the suffix from last to first, and the last value written is the old value of the earliest loser update, which is the value after the prefix, the correct one. If no loser wrote $X$, undo leaves it alone. Redo then replays the prefix records after the checkpoint in forward order and ends at the prefix's last value, which agrees; if no prefix record follows the checkpoint, the checkpoint forced the prefix's value to disk and only loser writes can have changed it since, which undo has removed. Redo must include aborted transactions' redo-only records, because a rollback after the checkpoint may not have reached disk. Undo cannot stop at the checkpoint, because a loser in $L$ may have updated pages before it, and those pages were forced to disk too. Undo and redo write absolute values, so repeating them after a crash during recovery gives the same result.

Why an aborted transaction must not count as a loser: with $\langle T_1, X, 10, 20 \rangle$, $T_1$ rolled back and aborted, then $\langle T_2, X, 10, 30 \rangle$, $\langle T_2 \text{ commit} \rangle$, a checkpoint and a crash, undoing $T_1$ again would set $X = 10$ over the committed 30.

WAL is needed for both directions: if a page reached disk before its log record and the system crashed, the old value would be lost and the loser could not be undone; if commit were reported before its record reached disk, a crash would turn a committed transaction into a loser. These rules realise the state diagram's last steps: a transaction is committed when its commit record is on disk, and an aborted one has had all its updates undone. ARIES generalises the scheme with fuzzy checkpoints and page LSNs: an analysis pass finds losers and dirty pages, a redo pass repeats history for all transactions, and an undo pass rolls back losers while logging compensation log records, so an interrupted undo is never redone twice.

**GATE use.** The 2-mark NAT gives a log with a checkpoint and asks for final values or their sum. Classify winners and losers, undo losers backward through the checkpoint to their start, and redo winners after the checkpoint. The traps: redoing a loser, undoing a winner, stopping the undo at the checkpoint, and undoing forward, which leaves an intermediate value when one item has several loser updates. MCQs on WAL ask which must reach disk first: the log record.

**Check.** The log $\langle T_1, A, 100, 150 \rangle$, $\langle T_2, B, 200, 180 \rangle$, $\langle T_1 \text{ commit} \rangle$, $\langle \text{checkpoint } \{T_2\} \rangle$, $\langle T_3, A, 150, 120 \rangle$, $\langle T_2, C, 50, 70 \rangle$, $\langle T_3 \text{ commit} \rangle$, $\langle T_4, B, 180, 300 \rangle$ has winners $T_1, T_3$ and losers $T_2, T_4$; it is not strict ($T_4$ writes $B$ over $T_2$'s uncommitted write) but satisfies (i) and (ii). Undo backward: $B \leftarrow 180$, $C \leftarrow 50$, $B \leftarrow 200$; redo: $A \leftarrow 120$. So $A + B + C = 120 + 200 + 50 = 370$. A script replayed this from two disk states (every update flushed, and only the checkpoint image) and got 370 both times; undoing forward instead left $B = 180$. With two loser updates $X: 10 \to 20$ and $X: 20 \to 30$, forward undo ends at 20 and backward undo at the correct 10. The same script gave $X = 30$ on the aborted-$T_1$ log above when abort counts as finished and $X = 10$ when it counts as a loser, and restored $X = 10$ from a disk holding 20 when $T_1$'s rollback came after the checkpoint and only its redo-only record was replayed.
