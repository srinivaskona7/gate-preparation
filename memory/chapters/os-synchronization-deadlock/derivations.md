# Synchronization and deadlock: derivations

## Lost updates: the range of a shared counter
<!-- topics: os-synchronization-deadlock.critical-section -->

**Claim.** Two threads A and B each execute `x = x + 1` exactly $n$ times on a shared $x$ that starts at 0, with no locking. Each increment compiles to a load of $x$ into a private register followed by a store of the register plus 1, and only individual loads and stores are atomic. For $n \ge 2$ the final value of $x$ can be every integer in $[2, 2n]$ and nothing outside it. For $n = 1$ the range is $[1, 2]$. With $k$ threads of $n \ge 2$ increments each, the range is $[2, kn]$.

**Proof.** *Upper bound.* Let $s(t)$ be the number of stores completed by time $t$. The invariant is $x \le s(t)$. It holds at the start ($0 \le 0$). A store at time $t$ writes $r + 1$, where $r$ was loaded at an earlier time $t' < t$, so $r \le s(t') \le s(t)$ by the invariant, and after the store $x = r + 1 \le s(t) + 1$, which is the new store count. With $2n$ stores in total, $x \le 2n$; with $k$ threads there are $kn$ stores, so $x \le kn$.

*Lower bound.* Every loaded value is at least 0 and every stored value is a loaded value plus 1, so every store writes at least 1. The last store of the whole run belongs to some thread, say A, and since A's stores occur in program order it is A's final store, from iteration $n$. A's load in iteration $n$ came after A's own store in iteration 1 (here $n \ge 2$ enters), so at that load some store had already happened and the loaded value was at least 1. The final value is that load plus 1, at least 2. For $n = 1$ both threads may load 0 before either stores, so the minimum is 1. The same argument works for any number of threads.

*Every value in between.* Fix $j, a \in \{0, \dots, n-1\}$ and run:

1. A loads 0 (its iteration 1).
2. B runs $j$ complete iterations.
3. A stores 1, overwriting B's work, so those $j$ increments are lost.
4. B loads 1 (its iteration $j+1$).
5. A runs $a$ complete iterations.
6. B stores 2, so A's $a$ increments are lost.
7. The remaining $n-1-a$ iterations of A and $n-j-1$ of B run one after another.

The final value is $2 + (n-1-a) + (n-1-j) = 2n - a - j$. As $a + j$ ranges over $0, \dots, 2n-2$, this covers every integer from $2$ to $2n$.

For $k \ge 3$ threads, fix also $m \in \{0, \dots, k-2\}$. Run $k-2-m$ of the extra threads to completion inside step 2, where A's store in step 3 overwrites all their work, and run the other $m$ to completion one after another in step 7, where each adds exactly $n$. Steps 4 to 6 are unchanged, so the final value is $2n - a - j + mn$. For fixed $m$ this covers $[2 + mn, 2n + mn]$, and consecutive intervals overlap because $2 + (m+1)n \le 2n + mn + 1$ whenever $n \ge 1$. Their union over $m = 0, \dots, k-2$ is $[2, kn]$.

**GATE use.** NAT questions ask for the minimum or maximum final value of shared variables. Split every update into load, compute and store, then lose the updates you do not want by letting them read early and be overwritten. A counting semaphore with initial value $k > 1$ admits $k$ processes to the section together, so updates inside it can still be lost. The traps are treating `x = x + 1` as atomic and answering 5 or 1 for the two-thread, five-increment minimum (it is 2).

**Check.** Enumerating all $\binom{20}{10} = 184756$ interleavings for $n = 5$ gives exactly the final values $2, 3, \dots, 10$; the same enumeration gives $[2, 2n]$ for $n = 2, \dots, 6$ and $[1, 2]$ for $n = 1$. For the four-process problem with $S = 2$ (W and X add 1, Y and Z subtract 2, each inside wait/signal), the full state space gives final values from $-4$ to $2$. The maximum 2 comes from W loading 0, Y storing $-2$, Z loading $-2$ and storing $-4$, W storing 1 over it, and X then adding 1.

## Critical-section requirements and the failed two-process attempts
<!-- topics: os-synchronization-deadlock.critical-section, os-synchronization-deadlock.two-process-attempts -->

**Claim.** For two processes $P_0$ and $P_1$ with $j = 1 - i$:

1. Strict alternation (`while (turn != i);` CS `turn = j;`) guarantees mutual exclusion but not progress.
2. Flag first (`flag[i] = true; while (flag[j]);` CS `flag[i] = false;`) guarantees mutual exclusion but can deadlock, which violates progress.
3. Test first (`while (flag[j]); flag[i] = true;` CS `flag[i] = false;`) does not guarantee mutual exclusion.

Here progress means: when no process is in the critical section and some process wants to enter, the processes not in their remainder sections choose one of them to enter, within finite time. Bounded waiting means a limit on how many times others enter after a process has requested entry.

**Proof.** *Strict alternation, mutual exclusion.* The invariant is that a process in the critical section sees `turn` equal to its own index. $P_i$ enters only when `turn == i`, and the only write to `turn` is in an exit section, which a process reaches only from its critical section. While $P_i$ is inside, $P_j$ is not, so $P_j$ cannot write `turn`. Both inside would need `turn` to equal 0 and 1 at once.

*Strict alternation, progress fails.* Take `turn = 0` with $P_0$ staying in its remainder section. $P_1$ wants in and the section is free, yet $P_1$ spins forever, because only $P_0$'s exit would set `turn = 1`.

*Flag first, mutual exclusion.* Suppose both are inside. Let $P_0$ be the one whose test of `flag[1]` came first, at time $t_0$; it saw `flag[1] == false`. Then $P_1$ set `flag[1]` after $t_0$, and tested `flag[0]` later still. `flag[0]` was set before $t_0$ and stays true while $P_0$ is inside, so $P_1$'s test sees true and $P_1$ spins: a contradiction.

*Flag first, deadlock.* Schedule `flag[0] = true; flag[1] = true;`. Both loop conditions are now true forever, since each flag is cleared only after its owner's critical section.

*Test first, mutual exclusion fails.* $P_0$ tests `flag[1]` (false), $P_1$ tests `flag[0]` (false), then both set their flags and enter.

The general method follows from the definitions. Mutual exclusion is a safety property, so a single interleaving with both processes inside refutes it. Progress fails on a single state where the section is free, someone is trying, and no schedule of the non-remainder processes ever lets anyone in. Bounded waiting fails on a single schedule that overtakes one waiting process without limit.

**GATE use.** One-mark MCQs dress up one of these attempts and ask which properties hold. A protocol with two shared Booleans, where $P_1$ waits while `S1 == S2` and exits with `S1 = S2`, and $P_2$ waits while `S1 != S2` and exits with `S2 = !S1`, is strict alternation with "turn is $P_1$" encoded as $S_1 \ne S_2$. Each exit hands the turn to the other process, so it has mutual exclusion but not progress. The trap is calling it correct because it is mutually exclusive.

**Check.** An explicit-state search over each protocol (16, 21 and 25 reachable states) confirms that strict alternation and flag first never put both processes inside, while test first does. It finds the stuck state `turn = 0`, $P_0$ in its remainder, $P_1$ spinning for strict alternation, and the state with both flags set and both spinning for flag first. The S1/S2 protocol, searched from all four initial values, has mutual exclusion and a progress violation from every one of them.

## Peterson's algorithm and the bakery algorithm
<!-- topics: os-synchronization-deadlock.peterson-bakery, os-synchronization-deadlock.two-process-attempts -->

**Claim.** Process $i \in \{0, 1\}$, with $j = 1 - i$, runs `flag[i] = true; turn = j; while (flag[j] && turn == j);` then the critical section, then `flag[i] = false`. Assuming loads and stores are atomic and take effect in program order (sequential consistency), it satisfies mutual exclusion, progress and bounded waiting with bound 1: once $P_i$ reaches its while loop, $P_j$ enters at most once before $P_i$ does. Writing `turn` before `flag[i]` breaks mutual exclusion. Lamport's bakery algorithm achieves the same for $n$ processes with

$$\mathit{num}[i] = 1 + \max_{j} \mathit{num}[j], \qquad (\mathit{num}[a], a) < (\mathit{num}[b], b) \;\Rightarrow\; a \text{ enters first},$$

where the pairs are compared lexicographically and ties between equal tickets go to the smaller id.

**Proof.** *Mutual exclusion (Galvin).* Suppose both are inside. Each set its flag before writing `turn`, and both flags stay true while their owners are inside. Let $P_w$ be the process whose write to `turn` came later; it wrote `turn = 1 - w`. No further write to `turn` happens while both stay in their entry or critical sections, since each writes `turn` once per attempt. $P_w$'s test came after its own write, so it saw `turn == 1 - w` and `flag[1 - w] == true` (set before $P_{1-w}$'s earlier write to `turn`). Its loop condition was true, so $P_w$ could not have entered: a contradiction.

*Progress.* If $P_j$ is in its remainder section, `flag[j]` is false and $P_i$'s loop exits. If both are at their loops, `turn` holds a single value $t$, so the loop of $P_{1-t}$ is false and $P_{1-t}$ enters. Neither can block the other while outside the protocol.

*Bounded waiting.* Let $P_i$ be at its loop. If $P_j$ is inside, it eventually exits with `flag[j] = false`. If it tries again, it first writes `turn = i` and then spins while `flag[i] && turn == i`, which stays true until $P_i$ enters, because only $P_i$ can now change `turn`. So $P_j$ enters at most once ahead of $P_i$.

*Order of the doorway writes.* If `turn = j` comes before `flag[i] = true`, then $P_0$ writes `turn = 1`, $P_1$ writes `turn = 0`, $P_1$ finds `flag[0]` false and enters, then $P_0$ sets its flag, sees `turn == 0` and enters too. A processor that lets the load of `flag[j]` complete before the store to `flag[i]` is visible produces the same effect as the test-first attempt, which is why real hardware needs a memory fence between the doorway and the test.

*Bakery.* Process $i$ sets `choosing[i]`, reads every ticket, writes $\mathit{num}[i]$ as one more than the maximum, clears `choosing[i]`, then for each $k$ waits while `choosing[k]` and waits while $\mathit{num}[k] \ne 0$ and $(\mathit{num}[k], k) < (\mathit{num}[i], i)$. Take $i$ inside and $k \ne i$ with $\mathit{num}[k] \ne 0$. If $k$ began choosing after $i$ passed `choosing[k]`, then $k$ read $\mathit{num}[i]$, already written and fixed while $i$ is inside, so $\mathit{num}[k] > \mathit{num}[i]$. Otherwise $k$'s ticket was fixed before $i$ tested it, and $i$ passed that test only if $(\mathit{num}[i], i) < (\mathit{num}[k], k)$. Either way $i$'s pair is smaller. If $k$ were also inside, the same argument with roles swapped would give the opposite inequality, so both cannot be inside. Reading the maximum takes several steps, so two processes can draw the same ticket, which is why the id breaks ties. Without `choosing`, $k$ can read $\mathit{num}[i] = 0$, stall before writing its ticket, let $i$ pass, and then enter on the tie-break.

**GATE use.** "Both flags are set; $P_0$ writes `turn = 1`, then $P_1$ writes `turn = 0`: who enters?" The last writer of `turn` defers, so $P_0$ enters. Statements to judge: Peterson is a two-process solution with busy waiting, satisfies all three requirements, and needs fences on modern CPUs. For the bakery algorithm, the smallest (ticket, id) pair goes first. The trap is ranking by ticket alone when two tickets are equal.

**Check.** The Peterson state space (42 states) has no state with both inside, no progress violation, and $P_0$ overtaken at most once while at its loop; with the doorway writes swapped, a state with both inside is reachable. From flags (true, true) and `turn = 0` written last, $P_0$'s next step enters and $P_1$'s spins. The bakery algorithm with tickets capped at 5 keeps mutual exclusion for 2 and 3 processes (970 and 65178 states), equal tickets are reachable, and without `choosing` both processes reach the critical section together. Tickets $(3, 1), (3, 2), (2, 4), (5, 0)$ enter in the order 4, 1, 2, 0.

## Hardware locks: test-and-set, swap and bounded waiting
<!-- topics: os-synchronization-deadlock.hardware-locks -->

**Claim.** With `TestAndSet` (atomically return the old value of a word and set it to true) and `lock` initially false, the spinlock `while (TestAndSet(&lock));` CS `lock = false;` gives mutual exclusion and progress for any number of processes, but not bounded waiting. The Swap lock (`key = true; while (key) Swap(&lock, &key);`) behaves identically. Adding a `waiting[]` array with a cyclic hand-off on exit bounds the wait: a process that has set `waiting[i]` enters after at most $n - 1$ entries by others. Disabling interrupts gives atomicity on one CPU only.

**Proof.** *Mutual exclusion.* The invariant is that `lock` is true exactly when some process is in its critical section or has not yet finished its exit write. A process enters only when its `TestAndSet` returns false. Each `TestAndSet` sets the word to true atomically, so between two consecutive releases at most one call can return false.

*Progress.* If the section is free, `lock` is false, and the next `TestAndSet` by any spinning process returns false and lets it in.

*No bounded waiting.* Let $P_0$ spin and $P_1$ hold the lock. $P_1$ releases, and before $P_0$ executes its next `TestAndSet`, $P_1$ returns and takes the lock again. Nothing in the protocol forbids repeating this, so $P_0$ can be overtaken any number of times.

*Swap.* With `key = true`, `Swap(&lock, &key)` puts true into `lock` and the old value of `lock` into `key`. That is exactly a `TestAndSet` whose result lands in `key`, so all three conclusions carry over.

*Bounded waiting with hand-off (Galvin).* Entry is `waiting[i] = true; key = true; while (waiting[i] && key) key = TestAndSet(&lock); waiting[i] = false;`. On exit the process scans $j = i+1, i+2, \dots$ cyclically for the first $j$ with `waiting[j]` true. If it finds one, it sets `waiting[j] = false`, handing the critical section over with `lock` still true. If not, it sets `lock = false`. Mutual exclusion holds because a process enters either by winning `TestAndSet` (once per release of `lock`) or by being handed the section (one hand-off per exit). Once `waiting[i]` is true, every exit scan finds a waiter, so `lock` is never released again before $P_i$ enters. Each hand-off goes from the holder $h$ to the first waiter after $h$ in cyclic order, which lies in the cyclic interval $(h, i]$. The holder therefore moves strictly toward $i$, through at most $n - 1$ other positions, before reaching $i$.

*Interrupts.* Disabling interrupts stops preemption on the current CPU only. Another CPU can still enter the same section, and a user program that disables interrupts and never re-enables them stops the whole machine.

**GATE use.** The MCQ "which requirement can a test-and-set spinlock fail?" has answer bounded waiting. Related statements: spinlocks waste CPU while waiting and suit short sections on multiprocessors, and compare-and-swap is the general primitive behind lock-free structures. The trap is picking progress: a free lock is always taken by some spinner.

**Check.** State-space search for the plain test-and-set lock with 2 and 3 processes and for the Swap lock with 2 processes finds mutual exclusion, no progress violation, and a cycle in which the waiting process is overtaken without bound. For the `waiting[]` version (149 states for $n = 2$, 1235 for $n = 3$), the largest number of entries by others while $P_0$ waits is exactly 1 and 2, matching $n - 1$.

## Semaphore arithmetic: final values and blocked counts
<!-- topics: os-synchronization-deadlock.semaphores -->

**Claim.** Let a semaphore start at $S_0$ and undergo $p$ wait (P) and $v$ signal (V) operations.

1. If no wait blocks, a counting semaphore ends at $S = S_0 - p + v$.
2. Decrement-first form (wait does $S \leftarrow S - 1$ and blocks if $S < 0$; signal does $S \leftarrow S + 1$ and wakes one waiter if $S \le 0$): $S = S_0 - p + v$ holds at the end with $p$ counting every issued wait, blocked ones included, and at every moment the queue holds $\max(0, -S)$ processes. So $S < 0$ means $\lvert S \rvert$ processes are waiting.
3. Never-negative form (wait blocks while $S = 0$; signal wakes a blocked process if there is one and otherwise increments), with each wait and each signal issued by its own process: in every order, exactly $\min(p, S_0 + v)$ waits complete, $B = \max\bigl(0,\; p - (S_0 + v)\bigr)$ stay blocked, and $S$ ends at $S_0 + v - \min(p, S_0 + v)$.
4. A binary semaphore signalled at 1 stays at 1, so that signal is lost.

**Proof.** (1) Each wait subtracts 1 and each signal adds 1.

(2) The value changes by exactly $-1$ per wait and $+1$ per signal whether or not anyone blocks, which gives the first part. For the queue invariant $q = \max(0, -S)$: a wait from $S \ge 0$ moves to $S - 1$ and enqueues only if $S - 1 < 0$, so $q$ goes from 0 to 1 when $S = 0$ and stays 0 otherwise. A wait from $S < 0$ makes $q = -S + 1 = -(S - 1)$. A signal from $S < 0$ dequeues one, giving $q = -S - 1 = -(S + 1)$. A signal from $S \ge 0$ finds $q = 0$ and dequeues nothing.

(3) Signals never block, so all $v$ run. Count units: $S_0$ at the start plus one per signal that finds no waiter. A signal that finds a waiter completes that wait directly, and every other completed wait consumes one unit of $S$. So the completed waits $D$ and the final value satisfy $D + S = S_0 + v$. If some wait is still blocked at the end, then $S = 0$, because a positive $S$ would have let it through, and a signal arriving while it was blocked would have woken it. So $D = S_0 + v$ when $B > 0$, and $D = p$ when $B = 0$. Together with $D \le p$ and $D \le S_0 + v$ this gives $D = \min(p, S_0 + v)$ and $B = p - D$. The independence from order needs each operation in its own process: a signal placed after a blocked wait in the same process never runs.

(4) The binary semaphore's signal is $S \leftarrow \min(1, S + 1)$.

A semaphore started at 0 enforces order: if $P_1$ runs `S1; signal(s);` and $P_2$ runs `wait(s); S2;`, then $P_2$'s wait completes only after the signal, which follows S1.

**GATE use.** NAT questions: "$S = 10$; 6 P and 4 V operations are performed; final value?" (8), or "how many processes stay blocked?". Fix the model first: under the never-negative definition $S$ never shows the waiters, and under decrement-first a negative $S$ counts them. The traps are assuming the operations run in the listed order when any interleaving is allowed, and using the counting formula on a binary semaphore.

**Check.** Exhaustive enumeration of every issue order for $S_0 \le 4$ and $p, v \le 6$ confirms both forms. For 20 waits and 12 signals, $B = \max(0, 8 - S_0)$, so the largest $S_0$ leaving a process blocked is 7 (with $S_0 = 8$ none stays blocked). $S_0 = 10$ with 6 P and 4 V ends at 8. $S_0 = 2$ with 5 P and 1 V completes 3 waits and leaves 2 blocked with $S = 0$; in decrement-first form it ends at $S = -2$ with two waiters.

## Producer-consumer: why the wait order matters
<!-- topics: os-synchronization-deadlock.producer-consumer -->

**Claim.** With `empty = N`, `full = 0` and `mutex = 1`, the producer `wait(empty); wait(mutex); add; signal(mutex); signal(full);` and the consumer `wait(full); wait(mutex); remove; signal(mutex); signal(empty);` (any number of each) never overflow or underflow the buffer and never deadlock. Swapping either process's two waits allows deadlock. Swapping the two signals changes nothing.

**Proof.** *Invariant.* Let $a$ be the number of producers between their `wait(empty)` and their `signal(full)`, and $c$ the number of consumers between their `wait(full)` and their `signal(empty)`. Then

$$\mathit{empty} + \mathit{full} + a + c = N$$

at every moment. It holds at the start ($N + 0 + 0 + 0$), and each of the four counting operations moves one unit between a semaphore and $a$ or $c$. A consumer removes only after a successful `wait(full)`, and every unit of `full` was created by a `signal(full)` that followed an add, so removals never outnumber adds: the buffer never underflows. Symmetrically, every add is preceded by a successful `wait(empty)`, and the units of `empty` total $N$ plus the removals, so the buffer never holds more than $N$ items. `mutex` makes the add and remove steps mutually exclusive.

*No deadlock.* Suppose every process is blocked. Nobody blocks while holding `mutex`, because the code between `wait(mutex)` and `signal(mutex)` contains no wait. So `mutex = 1`, and nobody is blocked on it. Every producer is then blocked on `empty`, so `empty = 0`, and every consumer is blocked on `full`, so `full = 0`. Nobody is in flight, so $a = c = 0$, and the invariant gives $0 = N$, a contradiction for $N \ge 1$.

*Wrong wait order.* If the consumer runs `wait(mutex); wait(full);` on an empty buffer, it takes `mutex` and blocks on `full` while holding it. The producer then blocks on `wait(mutex)` and can never add the item that would release the consumer. A producer running `wait(mutex); wait(empty);` on a full buffer fails the same way.

*Signal order.* `signal` never blocks, so swapping `signal(mutex)` and `signal(full)` only changes how long the process holds `mutex` and which waiter wakes first.

**GATE use.** Code-reading MCQs give a producer-consumer with one ordering changed and ask whether it can deadlock, overflow or underflow. An unbounded-buffer version with `n = 0` and `s = 1`, whose consumer runs `wait(s); wait(n);`, deadlocks on an empty buffer but never removes from it. The trap is flagging a swapped pair of signals as a bug.

**Check.** State-space search with two producers and two consumers for $N = 1, 2, 3$ finds no deadlock, keeps the item count in $[0, N]$, keeps the invariant, and never has two processes inside `mutex`. With the consumer's waits swapped and $N = 2$, the dead state is producer at `wait(mutex)`, consumer at `wait(full)`, `empty = 1`, `full = 0`, `mutex = 0`. The unbounded-buffer variant reaches a deadlock with an empty buffer and never removes from one, and swapping the consumer's waits removes the deadlock.

## Readers-writers: correctness and writer starvation
<!-- topics: os-synchronization-deadlock.readers-writers -->

**Claim.** In the first readers-writers solution, a reader runs `wait(mutex); read_count++; if (read_count == 1) wait(rw_mutex); signal(mutex);`, reads, then `wait(mutex); read_count--; if (read_count == 0) signal(rw_mutex); signal(mutex);`. A writer runs `wait(rw_mutex);` writes, `signal(rw_mutex);`. With `mutex = rw_mutex = 1` and `read_count = 0`, a writer never overlaps a reader or another writer, readers can read together, nothing deadlocks, and a continuous stream of readers can starve a writer.

**Proof.** `read_count` is changed only while `mutex` is held, so its updates are atomic. The transitions $0 \to 1$ and $1 \to 0$ are the only points where readers touch `rw_mutex`, and they come in matched pairs: the reader that raises the count to 1 waits on `rw_mutex`, and the reader that lowers it to 0 signals it. So while $\mathit{read\_count} > 0$ the readers as a group hold `rw_mutex` (the value is 0). A writer writes only while it holds `rw_mutex`, so no writer can be writing while a reader is reading, and two writers exclude each other. If a writer is writing when the first reader arrives, that reader blocks on `rw_mutex` while holding `mutex`. Later readers then queue on `mutex` rather than entering, which is correct because none of them may read yet. When the writer signals, the first reader proceeds and releases `mutex`, so no cycle of waits arises. Starvation: once some reader holds `rw_mutex` for the group, new readers enter without touching it. If arrivals keep $\mathit{read\_count} \ge 1$ forever, the writer's `wait(rw_mutex)` never succeeds.

**GATE use.** MCQs ask what the first reader or the last reader does (wait on and signal `rw_mutex`, respectively), or which process type can starve (writers, under reader preference; readers, under writer preference). The trap is thinking every reader waits on `rw_mutex`; only the transitions $0 \to 1$ and $1 \to 0$ touch it.

**Check.** State-space search with three readers and one writer (439 states) never has the writer active alongside a reader, reaches states with two readers reading together, has no deadlock, and contains a cycle in which the writer stays blocked on `rw_mutex` while readers keep entering: R1 enters and holds the write lock, R2 enters, R1 leaves, R1 enters again, R2 leaves, and so on, with `read_count` never reaching 0.

## Dining philosophers: deadlock, its fixes and the eating bound
<!-- topics: os-synchronization-deadlock.dining-philosophers -->

**Claim.** $N \ge 2$ philosophers sit in a circle, philosopher $i$ has chopstick $c_i$ on the left and $c_{(i+1) \bmod N}$ on the right, and each chopstick is a binary semaphore. If everyone takes left then right, deadlock is possible. Each of these rules makes deadlock impossible: seat at most $N - 1$ at once; take the lower-numbered chopstick first; let one philosopher take the right one first; take both inside one critical section. None of them rules out starvation. At most

$$E_{\max} = \left\lfloor \frac{N}{2} \right\rfloor$$

philosophers eat at once, and the bound is reached.

**Proof.** *Deadlock.* If all $N$ take their left chopstick, every chopstick is held and each philosopher waits for the right one, held by the right neighbour. That is a circular wait.

*$N - 1$ seated.* Suppose the seated philosophers are all blocked. A philosopher blocked on its first (left) chopstick waits for its left neighbour, who holds that chopstick as its second, so the neighbour holds both and is eating, not blocked. So every blocked philosopher holds its left chopstick and waits for its right, held by its right neighbour, who is seated and blocked in the same way. Following right neighbours goes all the way round the table, so all $N$ are seated: a contradiction.

*Lower-numbered first.* This orders the chopsticks globally, and the resource-ordering argument in the prevention section shows no cycle of waits can form. Here only philosopher $N - 1$, whose chopsticks are $c_{N-1}$ and $c_0$, picks up the right one first.

*One philosopher right-first.* If philosopher 0 takes $c_1$ before $c_0$ and everyone else goes left then right, every philosopher acquires in increasing order of the ranking $c_1 < c_2 < \dots < c_{N-1} < c_0$, so the same argument applies.

*Both at once.* Picking up both chopsticks inside a critical section, or not at all, removes hold and wait.

*Starvation.* A philosopher whose two neighbours alternate eating can find one of its chopsticks taken every time it tries, under any of these rules.

*Eating bound.* An eater holds two chopsticks, eaters hold disjoint pairs, and there are $N$ chopsticks, so $2E \le N$. Equivalently, no two neighbours can eat together, so eaters form an independent set on the cycle $C_N$. Philosophers $0, 2, \dots, 2\lfloor N/2 \rfloor - 2$ are pairwise non-adjacent, including across the wrap from the last to 0, and number $\lfloor N/2 \rfloor$.

**GATE use.** MSQs list candidate rules and ask which prevent deadlock: "everyone left then right" is the only wrong one in the standard set. NAT asks how many can eat at once (2 for $N = 5$). The trap is believing a deadlock fix also prevents starvation.

**Check.** State-space search for $N = 5$ reaches the all-chopsticks-held deadlock under left-then-right, and finds no deadlock under the four-seat rule, lower-numbered first, or philosopher 0 right-first. The maximum number eating in any reachable state is 2. Enumerating independent sets on $C_N$ for $N = 2, \dots, 12$ gives $\lfloor N/2 \rfloor$ every time.

## Monitors: Hoare against Mesa signalling
<!-- topics: os-synchronization-deadlock.monitors -->

**Claim.** In a monitor, at most one process is active inside at a time. A condition variable $c$ has `wait(c)`, which releases the monitor and sleeps, and `signal(c)`, which wakes one sleeper if there is one and otherwise does nothing. Under Hoare semantics a waiter may test its condition with `if`. Under Mesa semantics it must re-test it in a `while` loop. A signal with no waiter is lost, unlike a semaphore's V.

**Proof.** Suppose a process signals $c$ only when it has made the waited-for condition $B$ true. *Hoare.* The signaller suspends and hands the monitor straight to the woken process, so no other process runs inside the monitor in between, and $B$ still holds when the waiter resumes. One `if` test before the wait suffices. *Mesa.* The signaller keeps running and the woken process only becomes eligible to reacquire the monitor. Before it does, the signaller and any newly arriving process can enter and falsify $B$. With `while (!B) wait(c);`, the waiter re-tests $B$ each time it holds the monitor and proceeds only when $B$ is true at that moment, so after the loop $B$ holds with the monitor held, whatever happened in between. The same loop also absorbs spurious wake-ups. *Lost signal.* A condition variable stores no count. `signal(c)` with an empty queue changes nothing, so a later `wait(c)` sleeps. A semaphore's V raises the count, and a later P passes. Monitor code that replaces a semaphore must therefore keep an explicit state variable and test it before waiting.

**GATE use.** MCQs on monitor statements: one active process at a time regardless of condition variables; under Hoare the signaller suspends; under Mesa (Java's `wait`/`notify`) the woken process must re-check in a loop; a signal with no waiter is lost. The trap is the statement that a signal is remembered for the next waiter.

**Check.** With one producer and two consumers sharing an item count, where consumers wait while the count is 0: under Mesa with `if`, the search finds a run reaching count $-1$ and then $-2$. C1 waits; the producer adds one item and signals; C2 enters before C1 reacquires the monitor and takes the item; C1 then removes from an empty buffer. Under Mesa with `while`, and under Hoare with `if`, the count never goes below 0.

## Coffman conditions and what a cycle proves
<!-- topics: os-synchronization-deadlock.deadlock-conditions, os-synchronization-deadlock.resource-allocation-graph -->

**Claim.** A deadlocked set $D$ is a nonempty set of processes, each waiting for a resource that only another member of $D$ can release.

1. A deadlock implies all four Coffman conditions: mutual exclusion, hold and wait, no preemption, and circular wait.
2. If every resource type has a single instance, the resource-allocation graph (request edges $P \to R$, assignment edges $R \to P$) has a cycle exactly when some processes are deadlocked, and the processes on the cycle are deadlocked.
3. With several instances per type, a deadlock still implies a cycle, so no cycle means no deadlock, but a cycle does not imply a deadlock.

**Proof.** (1) Each member waits for a resource held by a member. If that resource could be shared, the request would be granted, so mutual exclusion holds. The holder is itself waiting, so it holds and waits. If the resource could be taken from the holder, the wait would end, so there is no preemption. Define $P \to Q$ when $P$ waits for a resource held by $Q$. Every member of the finite set $D$ has an outgoing edge to a member, so walking along edges must eventually repeat a process, and the repeated stretch is a circular wait.

(2) If there is a cycle $P_1 \to R_1 \to P_2 \to \dots \to P_k \to R_k \to P_1$, each $R_i$ has its only instance held by $P_{i+1}$, who is blocked and will not release it until its own request is granted. No process on the cycle can move first, so they are deadlocked. Conversely, a deadlock gives a cycle by (1). Collapsing $P \to R \to Q$ into $P \to Q$ gives the wait-for graph, on which detection is cycle search: depth-first search costs $O(n + e)$ with adjacency lists and $O(n^2)$ with an adjacency matrix.

(3) Let $D$ be deadlocked and let every process outside $D$ finish and release everything; call the free vector $W$. Each $P \in D$ still cannot be satisfied, so for some type $R$ its request exceeds $W_R$. Its request is at most the total $T_R$, so $W_R < T_R$ and some instance of $R$ is held by a member of $D$, which gives a path $P \to R \to Q$ with $Q \in D$. Every member of $D$ has such a path to another member, and the walk argument of (1) yields a cycle. For the converse failure, take two instances each of $R_1$ and $R_2$, with $P_1$ holding $R_2$ and requesting $R_1$, $P_2$ holding $R_1$, $P_3$ holding $R_1$ and requesting $R_2$, and $P_4$ holding $R_2$. The cycle $P_1 \to R_1 \to P_3 \to R_2 \to P_1$ exists, but $P_2$ and $P_4$ are not waiting, and their releases satisfy $P_1$ and $P_3$.

Starvation is different: a starving process waits indefinitely while others make progress, so no closed set of mutual waiting exists. Livelocked processes keep changing state, so they are not blocked at all.

**GATE use.** One-mark MSQs mix the statements: "single-instance, a cycle means deadlock" (true), "multi-instance, a cycle means deadlock" (false), "no cycle, no deadlock" (true), "unsafe means deadlocked" (false). Another MCQ asks which condition a numbering rule denies (circular wait). The trap is calling the four conditions sufficient.

**Check.** On the four-process example, multi-instance detection finishes $P_2$, $P_4$, $P_1$, $P_3$ despite the cycle. On 5000 random single-instance states (481 with a wait-for cycle), cycle and detection verdict agree every time. On 5000 random multi-instance states (2615 deadlocked, 3342 with a cycle), every deadlocked state has a cycle in its resource-allocation graph.

## Prevention: resource ordering breaks circular wait
<!-- topics: os-synchronization-deadlock.deadlock-prevention, os-synchronization-deadlock.deadlock-conditions -->

**Claim.** Give every resource type a distinct number $F(R)$ and require each process to request a resource only if its number is higher than that of every resource the process currently holds. Then no circular wait can form, so deadlock is impossible. For semaphore code the rule applies to locks, meaning semaphores with initial value 1 that are released by the process that took them. A semaphore that another process signals, such as `full` or `empty`, is outside the argument.

**Proof.** Suppose there is a circular wait $P_0, P_1, \dots, P_{k-1}$, where $P_i$ holds $R_{i-1}$ and waits for $R_i$, held by $P_{i+1}$, with indices modulo $k$. $P_i$ requested $R_i$ while holding $R_{i-1}$, so $F(R_{i-1}) < F(R_i)$. Going round the cycle gives $F(R_0) < F(R_1) < \dots < F(R_{k-1}) < F(R_0)$, which is impossible. The argument needs each awaited resource to be held by a process that will release it after its own acquisitions, which is what makes the waiting relation a chain of holders. A semaphore like `full` is held by no one; it is raised by a producer's signal, and that producer may itself be waiting on a lock. With the ranking `empty` $<$ `mutex` $<$ `full`, the consumer that does `wait(mutex); wait(full);` acquires in increasing rank, yet it deadlocks with the producer.

The other conditions are broken as follows. Hold and wait: request everything at once, or release everything before requesting more, at the cost of resources held idle and possible starvation. No preemption: take resources from a waiting process, which works only for state that can be saved and restored. Mutual exclusion: make the resource shareable, which works only for resources such as read-only files.

**GATE use.** Two-mark MCQs list wait() orders for several processes over shared binary semaphores and ask which can never deadlock. Look for one ranking consistent with every process's order; if none exists, exhibit the cycle, which may need three processes. The trap is checking only pairs of processes.

**Check.** For X, Y, Z each locking three of a, b, c, d (all 1) and then releasing, the state-space search finds a reachable deadlock in options (a, b, c / b, c, d / c, d, a), (b, a, c / c, b, d / a, c, d) and (a, b, c / c, b, d / c, d, a). It finds none in (b, a, c / b, c, d / a, c, d), which follows the ranking $b < a < c < d$. The producer-consumer search above confirms the deadlock of the order-consistent but wrong consumer.

## Banker's algorithm: safety, safe sequences and requests
<!-- topics: os-synchronization-deadlock.deadlock-avoidance-bankers -->

**Claim.** For $n$ processes and $m$ resource types, let $\mathrm{Available}$, $\mathrm{Max}$ and $\mathrm{Allocation}$ be given, with

$$\mathrm{Need}[i][j] = \mathrm{Max}[i][j] - \mathrm{Allocation}[i][j], \qquad \mathrm{Total}_j = \mathrm{Available}_j + \sum_{i=1}^{n} \mathrm{Allocation}[i][j].$$

A state is safe if some order $P_{\sigma(1)}, \dots, P_{\sigma(n)}$ lets each process obtain its whole remaining Need from the free resources plus those released by the processes before it. The safety algorithm sets $\mathrm{Work} = \mathrm{Available}$ and repeatedly applies

$$\mathrm{Need}_i \le \mathrm{Work} \;\Rightarrow\; \mathrm{Work} \leftarrow \mathrm{Work} + \mathrm{Allocation}_i,\;\; \mathrm{Finish}_i \leftarrow \text{true},$$

with $\le$ compared componentwise. It reports safe exactly when the state is safe, whichever eligible process it picks at each step. When it finishes, $\mathrm{Work} = \mathrm{Total}$. It runs in $O(m n^2)$ time. A request is granted exactly when

$$\mathrm{Request}_i \le \mathrm{Need}_i \;\wedge\; \mathrm{Request}_i \le \mathrm{Available} \;\wedge\; \text{resulting state safe}.$$

**Proof.** *Totals.* Every instance is either free or allocated to exactly one process, which gives the formula for $\mathrm{Total}_j$. After all processes finish, Work has absorbed every allocation, so $\mathrm{Work} = \mathrm{Total}$.

*Soundness.* If the loop finishes every process, the order in which it did so is a safe sequence: when $P_i$ was chosen, $\mathrm{Need}_i \le \mathrm{Work}$, and Work was exactly Available plus the allocations of the processes chosen earlier.

*Completeness and order independence.* Let a safe sequence $\sigma$ exist, and suppose the loop stops with a nonempty unfinished set $U$ and work vector $W$. Let $P$ be the first member of $U$ in $\sigma$. Every process before $P$ in $\sigma$ is finished, so, since allocations are nonnegative,

$$\mathrm{Need}_P \le \mathrm{Available} + \sum_{Q \text{ before } P \text{ in } \sigma} \mathrm{Allocation}_Q \le W.$$

The loop could therefore still pick $P$, contradicting that it stopped. So the loop finishes everything whenever the state is safe, whatever its choices. The root reason is that Work only grows, so a process eligible now stays eligible.

*Cost.* Each pass scans at most $n$ processes with an $m$-component comparison, and each pass that continues finishes at least one process. There are at most $n$ passes, giving $O(m n^2)$ time and $O(m n)$ space for the matrices. A scan that restarts from the top after each success makes $n(n+1)/2$ tests in the worst case.

*Why safety avoids deadlock.* In a safe state the first process in $\sigma$ can be given its whole Need now, run to completion and release everything. What remains is safe with the rest of $\sigma$, so by induction every process can finish. Releases only enlarge Work, so they keep a state safe. The Banker's algorithm grants a request only if the resulting state is safe, so every state it reaches is safe and deadlock never occurs. An unsafe state, by contrast, only means that the worst case (every process claiming its full Need) can no longer be met. Processes may release early, so an unsafe state need not end in deadlock.

*Requests.* A request above $\mathrm{Need}_i$ breaks the declared maximum, so it is an error. A request above Available cannot be met now, so the process waits. Otherwise the request is applied tentatively ($\mathrm{Available} - \mathrm{Request}$, $\mathrm{Allocation}_i + \mathrm{Request}$, $\mathrm{Need}_i - \mathrm{Request}$), the safety test runs on the result, and the request is rolled back if the result is unsafe. Each request costs $O(m)$ plus a safety run, so $O(m n^2)$.

**GATE use.** Two-mark MSQs give Allocation, Max and Available and ask which listed sequences are safe: compute Need, then run each sequence in its exact order and stop at the first process whose Need exceeds Work. MCQs give two requests from the same state, to be judged independently. The traps are comparing Max instead of Need with Work, forgetting to add a finished process's Allocation back, and applying the second request on top of the first.

**Check.** For Available $(3, 3, 2)$, Allocation P0 $(0,1,0)$, P1 $(2,0,0)$, P2 $(3,0,2)$, P3 $(2,1,1)$, P4 $(0,0,2)$ and Max P0 $(7,5,3)$, P1 $(3,2,2)$, P2 $(9,0,2)$, P3 $(2,2,2)$, P4 $(4,3,3)$, Need is $(7,4,3)$, $(1,2,2)$, $(6,0,0)$, $(0,1,1)$, $(4,3,1)$ and Total is $(10, 5, 7)$. P1, P3, P4, P0, P2 moves Work through $(5,3,2)$, $(7,4,3)$, $(7,4,5)$, $(7,5,5)$ to $(10,5,7)$, and P3, P1, P4, P2, P0 also succeeds. P1, P2, … fails at P2, whose Need $(6,0,0)$ exceeds $(5,3,2)$, and P4, … fails at once. In all, 16 of the 120 orders are safe. A request $(1, 0, 2)$ by P1 leaves Available $(2, 3, 0)$ and the state stays safe. For the request question, Available $(3,2,2)$, Allocation $(0,0,1)$, $(3,2,0)$, $(2,1,1)$ and Max $(8,4,3)$, $(6,2,0)$, $(3,3,3)$ give Need $(8,4,2)$, $(3,0,0)$, $(1,2,2)$. Granting P0's $(0,0,2)$ lets only P1 finish (Work $(6,4,0)$), so it is unsafe. Granting P1's $(2,0,0)$ allows P1, P2, P0, so only that request is granted. On 3000 random states, the greedy verdict matched a search over all orders every time. With one type of 12 units, Allocation $(5, 2, 2)$ and Max $(10, 4, 9)$ is safe in the order P1, P0, P2; giving P2 one more unit makes the state unsafe, yet with no outstanding requests nobody is deadlocked.

## Deadlock detection with several instances per type
<!-- topics: os-synchronization-deadlock.deadlock-detection-recovery, os-synchronization-deadlock.resource-allocation-graph -->

**Claim.** Given Available, Allocation and each process's current outstanding Request, set $\mathrm{Work} = \mathrm{Available}$ and mark finished every process with $\mathrm{Allocation}_i = 0$. Then repeatedly finish any unfinished process with $\mathrm{Request}_i \le \mathrm{Work}$, adding $\mathrm{Allocation}_i$ to Work. The processes left unfinished are exactly the deadlocked ones, assuming a process whose request is granted eventually finishes and releases what it holds. The run costs $O(m n^2)$. Replacing Request with Need turns the test into the safety test, which answers a different question.

**Proof.** *Finished processes are not deadlocked.* The finishing order is a schedule: each process in it has its current request satisfiable from the resources free at that point, and under the assumption it then releases everything, which justifies the addition to Work.

*Unfinished processes are deadlocked.* Let $U$ be the unfinished set and $W$ the final Work. Every $P \in U$ has $\mathrm{Request}_P \not\le W$. The resources outside $W$ are held by members of $U$. A member of $U$ releases only after its own request is granted, and no request in $U$ fits even after everyone outside $U$ has released. So no member of $U$ can ever proceed. Each waits for resources only other members of $U$ can release, which is the definition of a deadlocked set.

*The convention for processes holding nothing.* A process that holds nothing cannot be the reason anyone else waits, so it is not counted in the deadlocked set, though it may stay blocked behind it. That is why it starts finished.

*Order independence and cost.* These follow exactly as for the safety algorithm: Work only grows, and there are at most $n$ passes of $n$ comparisons over $m$ types. With single-instance resources, cycle search on the wait-for graph gives the same answer.

*Why not Need.* Need is the worst-case future demand. A state can fail the safety test with every current request satisfiable, as the 12-unit example in the previous section shows, so testing Need would report deadlocks that do not exist.

*Recovery.* Aborting all deadlocked processes is simple but wasteful. Aborting them one at a time means rerunning detection after each abort, at $O(m n^2)$ each time. Preemption picks a victim by cost (priority, work done, resources held), rolls it back to a checkpoint, and must count rollbacks so that the same process is not chosen forever. Many general-purpose systems ignore deadlock altogether.

**GATE use.** NAT questions ask how many processes are deadlocked, given Allocation, Request and Available; MCQs ask whether the system is deadlocked. The traps are using Need, forgetting that a finished process returns its Allocation, and applying the wait-for graph to multi-instance resources.

**Check.** Available $(0,0,0)$; Allocation P0 $(0,1,0)$, P1 $(2,0,0)$, P2 $(3,0,3)$, P3 $(2,1,1)$, P4 $(0,0,2)$; Request P0 $(0,0,0)$, P1 $(2,0,2)$, P2 $(0,0,1)$, P3 $(1,0,0)$, P4 $(0,0,2)$. Only P0 can finish, Work becomes $(0,1,0)$, nothing else fits, and 4 processes are deadlocked. If P2's request is $(0,0,0)$ instead, the run finishes P0, P2, P3, P4 and P1, and nothing is deadlocked.

## Minimum resources that rule out deadlock
<!-- topics: os-synchronization-deadlock.min-resources -->

**Claim.** $n$ processes share $R$ identical units of one type. Process $i$ needs up to $m_i \le R$ units, requests them one at a time, cannot finish before holding all $m_i$, and releases everything when it finishes. Deadlock is possible exactly when $R \le \sum_i (m_i - 1)$, so the minimum number of units that guarantees freedom from deadlock is

$$R_{\min} = \sum_{i=1}^{n} (m_i - 1) + 1.$$

With equal claims $k$, deadlock freedom is $n(k - 1) + 1 \le R$. The largest safe claim is $k = \lfloor (R - 1)/n \rfloor + 1$, and for $k \ge 2$ the largest safe number of processes is $n = \lfloor (R - 1)/(k - 1) \rfloor$.

**Proof.** *Deadlock when $R \le \sum (m_i - 1)$.* Hand out units one at a time, giving process $i$ at most $m_i - 1$, until all $R$ are allocated. This is possible because $R \le \sum (m_i - 1)$. Now no unit is free, every process holds less than its claim and asks for one more, and no process can finish to release anything: a deadlock.

*No deadlock when $R \ge \sum (m_i - 1) + 1$.* Suppose every unfinished process is blocked, with $U$ the unfinished set. Finished processes have released everything, and a blocked request means no unit is free, so the members of $U$ hold all $R$ units:

$$\sum_{i \in U} h_i = R \ge \sum_{i=1}^{n} (m_i - 1) + 1 > \sum_{i \in U} (m_i - 1).$$

So some $i \in U$ has $h_i \ge m_i$. That process holds its whole claim, so it can finish rather than block: a contradiction.

*Equal claims.* Substituting $m_i = k$ gives $n(k - 1) + 1 \le R$. Solving for $k$ gives $k - 1 \le (R - 1)/n$, and since $k$ is an integer, $k \le \lfloor (R - 1)/n \rfloor + 1$. Solving for $n$ with $k \ge 2$ gives $n \le (R - 1)/(k - 1)$, so $n \le \lfloor (R - 1)/(k - 1) \rfloor$. With $k = 1$ no process ever waits while holding a unit, so any number of processes is safe.

**GATE use.** One-mark NATs: "claims 3, 4 and 5; minimum units for no deadlock?" (10), "6 units, each process needs 2; largest number of processes?" (5), or "$R$ units and $n$ processes; largest claim?". The trap is answering $\sum (m_i - 1)$, the largest number of units that can still deadlock, when the minimum safe number is asked.

**Check.** An exhaustive search over allocation states confirms that deadlock is reachable exactly when $R \le \sum (m_i - 1)$, for the claim lists $(3,4,5)$, $(2,2,2)$, $(3,3)$, $(2,3,4,2)$, $(1,4,2)$ and $(5,2)$ with $R$ from $\max m_i$ to $R_{\min} + 2$. With claims 3, 4 and 5, 9 units deadlock (holdings 2, 3, 4) and 10 do not. With 6 units and claims of 2, five processes are safe and six can deadlock. With 12 units and 4 processes, $\lfloor 11/4 \rfloor + 1 = 3$: claims of 3 are safe ($4 \cdot 2 + 1 = 9 \le 12$) and claims of 4 can deadlock ($4 \cdot 3 = 12$). Both equal-claim formulas match a direct search for every $R \le 12$.
