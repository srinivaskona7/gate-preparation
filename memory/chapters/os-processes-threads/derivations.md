# Processes, threads and IPC: derivations

## The five-state model: exactly six transitions
<!-- topics: os-processes-threads.process-states, os-processes-threads.pcb, os-processes-threads.process-concept -->

**Claim.** In the five-state model (New, Ready, Running, Waiting, Terminated) on a machine with $m$ CPUs, the only transitions are admit (New to Ready), dispatch (Ready to Running), preempt (Running to Ready), block (Running to Waiting), wake-up (Waiting to Ready) and exit (Running to Terminated). In particular Waiting to Running, Ready to Waiting and New to Running never occur. Under a non-preemptive scheduler, Running to Ready happens only when the process yields voluntarily, never by force. With $n$ processes, at most $\min(m, n)$ are Running at any instant, while Ready and Waiting can each hold all $n$.

**Proof.** The argument rests on two facts about who causes each change. First, the CPU is handed to a process only by the dispatcher, and the dispatcher picks only from the ready queue, which is a list of PCBs. Second, a process can only change its own state by executing an instruction (a blocking system call, an exit), and only a Running process executes instructions.

- Entering Running. By the first fact the PCB must be in the ready queue at the moment of dispatch, so the only edge into Running starts at Ready. This rules out New to Running (admission links the new PCB into the ready queue) and Waiting to Running. When an I/O interrupt completes a waiting process's request, the handler marks its PCB Ready and moves it from the device queue to the ready queue; the process then waits for the dispatcher like any other ready process.
- Entering Waiting. A process waits because it asked for something it must wait for. By the second fact only a Running process can ask, so the only edge into Waiting starts at Running, which rules out Ready to Waiting.
- Leaving Running. A running stint ends in one of three ways: the process issues a blocking request (block), the process finishes (exit), or the kernel takes the CPU away while the process is still able to run (preempt, back to Ready). A non-preemptive kernel never takes the CPU away, so in that case the third way is only a voluntary yield.
- Leaving Waiting. The awaited event moves the process to Ready, as in the first item.

Each CPU runs one process at a time, so at most $m$ processes are Running, and at most $n$ because there are only $n$ processes. Ready and Waiting are queues of PCBs with no size limit: all $n$ processes can be blocked on I/O at once, or all can be ready during the instant before a dispatch. A swapping system adds Ready-suspend and Blocked-suspend states, entered and left by the medium-term scheduler; the argument above is unchanged for the in-memory states.

**GATE use.** MCQs list transitions and ask which are possible. The traps are Waiting to Running (an I/O completion gives Ready, not Running) and Ready to Waiting (a ready process executes nothing, so it cannot request I/O). A variant asks for the bounds with $n$ processes on $m$ CPUs: Running is at most $\min(m, n)$, and Ready and Waiting are bounded only by $n$.

**Check.** A script ran 3,000 random simulations of 1 to 6 processes on 1 to 3 CPUs, half of them preemptive, choosing at random among the moves the rules above allow. Every observed transition was one of the six edges, Running never exceeded $m$, and no non-preemptive run ever went from Running to Ready.

## Counting dispatches and transitions over a process's life
<!-- topics: os-processes-threads.process-states, os-processes-threads.context-switch -->

**Claim.** Follow one process from admission to exit. Let $D$ be its dispatches, $P$ its preemptions, $B$ its blocks and $W$ its wake-ups. Then

$$D = P + B + 1, \qquad W = B.$$

A process with $k$ CPU bursts separated by $k - 1$ I/O waits has $B = k - 1$, so under a non-preemptive scheduler $D = k$ and the process makes $1 + k + 2(k - 1) + 1 = 3k$ transitions in all. Each preemption adds one more dispatch, so with $P$ preemptions $D = k + P$.

**Proof.** Split the process's life into running stints, the maximal intervals during which it is Running. By the previous section a stint begins only with a dispatch, so there are $D$ stints. Each stint ends in exactly one of preempt, block or exit, and exit happens once, at the end of the last stint. Counting stints by their ends gives $D = P + B + 1$. Every block puts the process in Waiting, and it leaves Waiting only by a wake-up; it cannot exit from Waiting, so every block is matched by exactly one later wake-up and $W = B$. With $k$ bursts and no preemption, each of the first $k - 1$ bursts ends in a block and the last in exit, so $B = k - 1$ and $D = k$. Adding admit and exit, the total is $1 + D + B + W + 1 = 1 + k + 2(k - 1) + 1 = 3k$. Each dispatch of a different process than the one the CPU last ran is a context switch, so $D$ bounds the switches into this process.

**GATE use.** Context-switch counts in scheduling traces: every running stint costs one dispatch, so count stints in the Gantt chart. The trap is to count only preemptions and forget the dispatch after each I/O wait, or to count the stint that follows a quantum expiry when no other process is ready and the same process keeps the CPU with no switch.

**Check.** A process with $k = 3$ bursts has $D = 3$, $B = W = 2$ and 9 transitions without preemption; with 4 preemptions it has $D = 7$. In the 3,000 simulations of the previous section, every process satisfied $D = P + B + 1$ (counting a process still running as having one unfinished stint) and $W = B$ (counting a process still waiting as owing one wake-up).

## What a context switch must save, and why a thread switch is cheaper
<!-- topics: os-processes-threads.context-switch, os-processes-threads.threads, os-processes-threads.pcb, os-processes-threads.process-concept -->

**Claim.** The future of an execution is fixed by its CPU state (program counter, general registers, stack pointer, status flags), its memory mapping (the page-table base and, where the TLB is tagged, the address-space id) and its kernel resources (open files and so on). A context switch must save and restore the hardware-resident parts: the CPU state, plus the memory mapping when the address space changes. Kernel resources are reached through the PCB and are not copied at all. Between two threads of one process the memory mapping is the same, so a thread switch saves and restores only the private CPU state, and the TLB stays valid. With $T$ threads running one function, there are $T$ copies of each of its automatic (non-`static`) local variables and one copy of each global or `static` local.

**Proof.** The kernel's records (open-file table, accounting, scheduling data) live in kernel memory and are found from the PCB, so switching to another process only means following another PCB pointer. What lives inside the CPU is overwritten by whoever runs next, so it must be saved to the outgoing PCB (or thread control block) and reloaded from the incoming one; this is the CPU state, and the MMU's page-table base register. Threads of one process share code, globals, heap, open files and the address space itself, so they share the page-table base, and loading it again would change nothing. Each thread does have its own program counter, registers and stack pointer, because each executes a different instruction stream with its own call chain. Its stack pointer points to its own stack, and a function's automatic locals are allocated in the current frame on that stack, so each thread that runs the function gets its own instance; a global, or a `static` local (static storage duration, not on the stack), sits at one fixed address in the shared data segment, so there is one instance for all threads.

The cost difference follows. A process switch reloads the page-table base; without address-space tags the TLB must be flushed, and afterwards the first access to each distinct page misses. If the incoming process touches $p$ pages and a walk costs $L$ memory accesses of time $t_m$, the refills cost about $pLt_m$ beyond the switch itself. A thread switch skips both, and the caches also stay warm for shared code and data. In either case switching is overhead: at $r$ switches per second, each costing $s$ seconds, the fraction of CPU time lost is $rs$.

**GATE use.** MSQs on what threads share or what a thread switch saves. The traps are counting the stack or the registers as shared (they are private; the stacks only lie in one shared address space) and counting the page tables or open files as private. A context switch is pure overhead, and a thread switch within a process is the cheaper one.

**Check.** Three POSIX threads ran one function that increments a local and, under a mutex, a global 1,000 times each: every thread's local ended at 1,000 at three different stack addresses, and the global, at one address in all three threads, ended at 3,000. With $p = 64$ pages, a two-level walk ($L = 2$) and $t_m = 100$ ns the refill cost is $64 \cdot 2 \cdot 100 = 12{,}800$ ns $= 12.8\ \mu$s. At 1,000 switches per second of $5\ \mu$s each the loss is $0.5\%$.

## n sequential forks: the fork tree and its count
<!-- topics: os-processes-threads.fork-counting, os-processes-threads.fork-exec-wait -->

**Claim.** If a program executes $n$ unconditional `fork()` calls in sequence, with no early exit, then

$$P = 2^n \text{ processes in total}, \qquad C = 2^n - 1 \text{ of them new}.$$

The process created by the $j$-th fork has $n - j$ children, and the original has $n$. The number of processes that are $d$ generations below the original is $\binom{n}{d}$, so the fork tree is a binomial tree.

**Proof.** `fork()` returns in both the parent and the child, and both continue from the instruction after the call. So a process that reaches the $j$-th fork call ends up as two processes, each of which goes on to execute forks $j + 1, \dots, n$.

Bijection: label each final process by the bit string $x_1 x_2 \dots x_n$, where $x_j = 1$ if the call to fork $j$ returned 0 in this process or in its ancestor at that time (it took the child branch) and $x_j = 0$ otherwise. Every string arises: start with the original and, at each fork $j$, follow the child if $x_j = 1$ and stay in the parent if $x_j = 0$. Different strings give different processes, because the paths separate at the first fork where the strings differ. So the processes correspond one-to-one to the $2^n$ strings, and subtracting the original gives $2^n - 1$ children. Each 1 in the string is one parent-to-child step, so the processes at depth $d$ are the strings with $d$ ones, $\binom{n}{d}$ of them. The process created at fork $j$ has $x_j = 1$ and zeros after it; it executes forks $j + 1, \dots, n$ as the parent, creating one child at each, so it has $n - j$ children.

Equivalently by induction: before fork $j$ there are $2^{j-1}$ processes, all of which reach it, and each becomes two. The count needs every process to reach every call: a fork inside a branch that only some processes take, or an `exit` or `exec` between forks, breaks it.

**GATE use.** "How many processes" or "how many child processes" for `fork(); fork(); fork();` or `for (i = 0; i < n; i++) fork();`. The traps are counting $2^n$ when the question asks for children, and restarting a child at the top of the program.

**Check.** A C program in which every process writes one byte to a pipe before exiting counted 2, 4, 8, 16 and 32 processes for $n = 1, \dots, 5$. A script built the fork tree for $n = 1, \dots, 8$ and confirmed $2^n$ distinct processes, $\binom{n}{d}$ at depth $d$ (1, 3, 3, 1 for $n = 3$) and $n - j$ children for the process from fork $j$.

## Forks in loops: lines printed, buffered output and breaks
<!-- topics: os-processes-threads.fork-counting -->

**Claim.** Consider `for (i = 0; i < n; i++) { fork(); printf("x\n"); }`.

1. If output is flushed before each fork (stdout to a terminal is line-buffered, so the newline does this), the program prints $\sum_{k=1}^{n} 2^k = 2^{n+1} - 2$ lines.
2. If stdout is fully buffered (redirected to a file or a pipe) and never flushed before a fork, it prints $n \cdot 2^n$ lines.
3. `for (i = 0; i < n; i++) if (fork() == 0) break;` creates $n$ children of the original, $n + 1$ processes in all; `if (fork()) break;` in the same loop builds a chain and also gives $n + 1$.

**Proof.** (1) After the fork of iteration $k$ there are $2^k$ processes (previous section, with the first $k$ forks), and each prints once, so iteration $k$ prints $2^k$ lines. The geometric sum is $\sum_{k=1}^{n} 2^k = 2(2^n - 1) = 2^{n+1} - 2$. A line is printed only once because at each fork the buffer is empty, so no child inherits text already written.

(2) A fully buffered `printf` only appends to a buffer in the process's memory, and `fork` copies that memory, buffer included. Take any of the $2^n$ processes alive at the end and its lineage: at iteration $k$ the process of the lineage alive then appended one line to its buffer, and every later fork passed a copy down. So each final process holds exactly $n$ lines when it exits and flushes, and the output is $n \cdot 2^n$ lines.

(3) Child-break: in the original, every fork returns non-zero, so it stays in the loop for all $n$ iterations and creates $n$ children; each child gets 0 and leaves the loop at once, creating nothing. Parent-break: the original forks once and leaves; its child, which got 0, continues to the next iteration and does the same, so each iteration adds one process to a chain, $n + 1$ in all.

**GATE use.** NAT questions ask for the number of lines printed or processes created by a loop with `fork()`. Count the iterations that reach the fork for each process, then sum per iteration. The traps are using $2^n$ for a print count, missing that `break` or a condition stops some processes, and the buffering effect when a question prints without a newline before forking.

**Check.** The loop compiled in C printed 2, 6, 14 and 30 lines for $n = 1, \dots, 4$ with a flush before each fork, and 2, 8, 24 and 64 lines ($n \cdot 2^n$) with full buffering and no flush. The child-break and parent-break loops with $n = 4$ each gave 5 processes.

## Short-circuit fork expressions: the true and false counts
<!-- topics: os-processes-threads.fork-conditional -->

**Claim.** When one process evaluates a C expression $E$ built from `fork()`, `&&` and `||`, it ends up as $t_E + f_E$ processes, $t_E$ of which see $E$ as true (non-zero) and $f_E$ as false. For a single fork $(t, f) = (1, 1)$, and

$$A \mathbin{\&\&} B:\ (t_A t_B,\; f_A + t_A f_B), \qquad A \mathbin{\|} B:\ (t_A + f_A t_B,\; f_A f_B).$$

Consequences: `fork() && fork()` gives $(1, 2)$, 3 processes; `fork() || fork()` gives $(2, 1)$, 3 processes; `fork() && fork() || fork()` gives $(3, 2)$, 5 processes; `fork() && (fork() || fork())` gives 4; a chain of $k$ forks joined only by `&&` or only by `||` gives $k + 1$. A body guarded by `if (E)` runs in $t_E$ processes. Separate statements multiply: a statement with factor $a$ followed by one with factor $b$ gives $ab$.

**Proof.** `fork()` is true (the child's PID) in the parent and false (0) in the child, so a single fork gives one process of each kind. For $A \mathbin{\&\&} B$, C evaluates $B$ only where $A$ was true. The $f_A$ processes where $A$ was false stop there with $E$ false. Each of the $t_A$ processes where $A$ was true evaluates $B$ and becomes $t_B$ true and $f_B$ false processes. Totals: $t_A t_B$ true, $f_A + t_A f_B$ false. For $A \mathbin{\|} B$ the roles swap: $B$ runs only where $A$ was false, so $t = t_A + f_A t_B$ and $f = f_A f_B$. Since `&&` binds tighter than `||`, `fork() && fork() || fork()` is $(F \mathbin{\&\&} F) \mathbin{\|} F$: the inner part is $(1, 2)$, and the outer gives $t = 1 + 2 \cdot 1 = 3$, $f = 2 \cdot 1 = 2$. In words, the two processes in which the `&&` part is false each run the third fork. For a chain of $k$ forks joined by `&&`, induction on $k$ gives $(1, k)$: appending $\mathbin{\&\&} F$ to $(1, k)$ gives $(1, k + 1)$; dually `||` gives $(k, 1)$. Each of the $t_E$ processes of an `if (E)` runs the body; each process that runs a statement becomes $a$ processes, all of which run the next statement, hence the product.

**GATE use.** Count processes for code mixing `fork()` with `&&`, `||` and `if`. The traps are evaluating the right side everywhere (giving 4 for `fork() && fork()`), mis-parsing precedence, and adding instead of multiplying across statements. For `if (fork() && fork()) fork();`, the body runs in $t = 1$ process: $2 + 1 \cdot 2 = 4$ processes.

**Check.** A C program counted the processes for each expression directly: 3 for `&&`, 3 for `||`, 5 for `&& ||`, 4 for `fork() && (fork() || fork())`, 4 for three forks joined by `||` and by `&&`, 5 for `(fork() || fork()) && fork()`, 4 for `if (fork() && fork()) fork();` and 30 for the three statements `fork(); fork() && fork(); fork() && fork() || fork();`, which is $2 \cdot 3 \cdot 5$. A script evaluating the $(t, f)$ rules gave the same numbers and confirmed the $k + 1$ chains for $k \le 7$.

## Separate copies after fork: diverging values, equal addresses
<!-- topics: os-processes-threads.fork-conditional, os-processes-threads.fork-exec-wait -->

**Claim.** After `fork()`, parent and child each have their own copy of every variable, initialised to its value at the moment of the fork; an assignment in one is never seen by the other. Yet `&x` prints the same value in both, because the address is virtual and the child's address space is a copy with the same layout. With copy-on-write the two copies share a physical frame until one side writes, and the kernel then gives the writer its own frame.

**Proof.** `fork` gives the child a page table that maps the same virtual pages, in the same layout, as the parent's. A variable at virtual address $v$ in the parent is therefore at $v$ in the child as well, and `&x` evaluates to $v$ in both. Under copy-on-write both page tables first point to the same frames, marked read-only. The first write by either process to such a page faults; the handler copies the frame, maps the copy writable into the faulting process, and restarts the write. From then on the virtual page $v$ maps to different frames in the two processes, so later writes by one change only its own frame. Without copy-on-write the kernel copies every page at fork time, with the same outcome. The only data a child receives from the parent after the fork is what passes through explicit IPC (a pipe, shared memory, a file).

**GATE use.** A program does `if (fork() == 0) { a = a + 5; print(a, &a); } else { a = a - 5; print(a, &a); }`, the child printing $u, v$ and the parent $x, y$. The correct statement is $u = x + 10$ and $v = y$: the values differ by 10 and the addresses are equal. The traps are concluding that equal addresses mean shared memory, and expecting the child to see the parent's later updates. Output order between the two is unspecified unless `wait()` forces it.

**Check.** That program in C, with $a = 10$, printed $a = 15$ in the child and $a = 5$ in the parent at the same address `0x16b6b99b8`; a global doubled in the child read 20 there and 10 in the parent, again at one address.

## Zombies and orphans: the life of a process-table entry
<!-- topics: os-processes-threads.zombie-orphan, os-processes-threads.fork-exec-wait -->

**Claim.** A process-table entry is held from `fork()` until the process is reaped. The process is a zombie from its `exit` until its parent collects the status with `wait()` or `waitpid()`. It is an orphan if its parent exits while it still runs; init (PID 1) then becomes its parent and reaps it when it exits. Consequences:

1. A parent that forks $k$ children, all of which exit, and has not called `wait` has exactly $k$ zombie children; each `wait` reaps one, so $k$ calls are needed.
2. When that parent exits, init inherits the zombies and reaps them, so none outlives the parent for long.
3. If $r$ entries of a table of size $T$ are in use, the parent's own included, a parent that never waits can create $T - r$ short-lived children; the next `fork()` returns $-1$.

**Proof.** The exit status must be kept until the parent asks for it, because `wait` must be able to return it. The kernel therefore frees a dead process's memory and files at `exit` but keeps the table entry, which holds the PID and the status, until a `wait` returns that status. This is the zombie interval, and it ends only by a `wait` in the parent. One `wait` call returns the status of one child, so $k$ zombies need $k$ calls. When any process exits, the kernel makes init the parent of each of its children, live or zombie; init loops on `wait`, so it reaps each child that is or becomes a zombie. A live child adopted this way is an orphan: alive, with parent PID 1. For (3), each child keeps its entry for ever, because the parent never reaps it, so the $T - r$ free entries are used up one per fork, and once the table is full `fork()` fails in the parent with $-1$.

**GATE use.** Definitions MCQs: a zombie is dead and unreaped; an orphan is alive and parentless. The traps are swapping the two, believing a zombie still holds memory (it holds only its entry and PID), and believing `kill` removes a zombie (it is already dead; only a `wait` by the parent, or the parent's exit, clears it).

**Check.** A C parent forked 3 children that exited at once and slept: `ps` showed 3 zombie children; after three non-blocking `waitpid` calls it showed none. In a second program the middle process of a three-generation chain exited while the grandchild slept, and the grandchild's parent PID changed to 1.

## Blocking and parallelism under the threading models
<!-- topics: os-processes-threads.ult-vs-klt, os-processes-threads.threading-models, os-processes-threads.threads -->

**Claim.** A process has $N$ user threads mapped onto $M$ kernel threads ($1 \le M \le N$) on a machine with $P$ cores, and $b$ of its user threads are blocked in system calls, each holding the kernel thread it was running on. The greatest number of its threads that can execute at once is

$$\text{many-to-one } (M = 1):\ \begin{cases} 1 & b = 0 \\ 0 & b \ge 1 \end{cases}, \qquad \text{one-to-one } (M = N):\ \min(P,\, N - b), \qquad \text{many-to-many}:\ \max(0,\ \min(P,\, M - b,\, N - b)).$$

A user-level thread switch needs no kernel entry; a kernel-level one does.

**Proof.** The kernel schedules only kernel threads, and each kernel thread runs on at most one core at a time. A user thread executes only while the user-level library has it mapped onto a kernel thread that holds a core. A user thread blocked in a system call is blocked inside the kernel on its kernel thread, so that kernel thread cannot run anything else until the call returns.

- Many-to-one. The process has one kernel thread, so at most 1 thread executes, whatever $P$ is. If any user thread is blocked in a system call, that one kernel thread is blocked, the kernel sees the whole process as blocked, and no user thread runs: 0. The library cannot help, because it runs only when its kernel thread does.
- One-to-one. The $N - b$ unblocked threads each have their own kernel thread, so the kernel can run all of them, at most one per core: $\min(P, N - b)$, and this is attained by giving each a core.
- Many-to-many. $M - b$ kernel threads are free (none if $b \ge M$), and at most $N - b$ user threads are ready. Each executing user thread needs a free kernel thread and a core, so at most $\min(P, M - b, N - b)$ execute, and the library and kernel can attain it by mapping ready user threads onto free kernel threads and running those on cores.

A user-level switch only saves and loads registers inside the library, an ordinary procedure call; a kernel-level switch is decided by the kernel's scheduler, so it costs a trap into the kernel and back. This is why ULTs switch faster and why they work on a kernel with no thread support.

**GATE use.** True or false statements comparing ULTs and KLTs. Correct: ULT switches avoid the kernel; one ULT blocking in a system call blocks the whole process under many-to-one; KLTs of one process run in parallel on several cores and block independently. The traps are swapping the blocking rule, and believing many-to-one gives parallelism on a multicore machine.

**Check.** With $N = 8$, $P = 4$ and $M = 3$ for many-to-many, and no thread blocked, the maxima are 1, 4 and 3; with one blocked thread they are 0, 4 and 2. A script compared the formulas with a brute-force search over which ready threads get free kernel threads and cores for all $N \le 6$, $M \le N$, $P \le 4$ and $b \le N$, and found no mismatch.

## System calls: mode switches, context switches and the privileged set
<!-- topics: os-processes-threads.system-calls, os-processes-threads.dual-mode -->

**Claim.**

1. Every system call, interrupt or exception enters kernel mode once and leaves it once: two mode switches. A system call causes a context switch only if the kernel resumes a different process when it leaves, that is, if the call blocks or the kernel preempts the caller on the way out. A non-blocking call returns to the same process unless the call, or an interrupt during it, made a higher-priority process ready under a preemptive scheduler.
2. An instruction must be privileged if, executed in user mode, it would let a process keep the CPU, reach memory or devices outside its protection, or leave user mode at a point of its choosing: setting the timer, disabling interrupts, loading the page-table base or other MMU registers, I/O instructions, and writing the mode bit.
3. The trap instruction itself must not be privileged, and reading the clock need not be.

**Proof.** (1) The CPU switches to kernel mode only on a trap, an interrupt or an exception, and back only on a return-from-trap, so each kernel entry pairs with one exit. Before the return the kernel decides which process to resume. If the call can be completed at once and has made no higher-priority process ready, it returns to the caller with no context switch. A call that completes at once can still wake another process (a `write` to a pipe that a higher-priority process is blocked reading); a preemptive scheduler then switches to that process on the way out, a context switch caused by a call that did not block. If the call must wait (a read of data not yet available), the caller is blocked and the kernel dispatches another process, which is a context switch. The mode switch is a change of privilege within one execution; the context switch is a change of which PCB is current. Neither implies the other.

(2) Each listed instruction defeats one of the kernel's guarantees. If user code could reset the timer or disable interrupts, it would never be preempted and could keep the CPU for ever. If it could load the page-table base, it could map any physical frame and read or write other processes' memory and the kernel's. If it could issue I/O instructions, it could reach the disk directly, bypassing file permissions. If it could set the mode bit, it could make itself privileged and do all of the above. So each must trap when executed in user mode.

(3) A user program needs a way to ask for kernel service, and that way must work in user mode. The trap is safe to leave unprivileged because it does not let the caller choose where kernel mode begins: it jumps through the trap vector, which the kernel has set, to the system-call handler, which then checks the call number and arguments. Reading the clock reveals only the time and changes nothing, so it threatens no guarantee. Since a call costs a mode switch each way, plus the argument checks and dispatch through the system-call table, it costs far more than an ordinary function call, and library functions that can finish in user space (`strlen`, most `malloc` calls) avoid the kernel entirely.

**GATE use.** MSQs list operations and ask which must be privileged: set the timer, disable interrupts, I/O, MMU loads and writing the mode bit are; reading the clock and the trap (the "switch from user to kernel mode" through a system call) are not. Other items ask whether a system call always causes a context switch (no), or which library calls are system calls (`exit` and `sleep` always enter the kernel, `strlen` never does).

**Check.** A trace in which P calls `getpid()`, P calls `read()` and blocks, a disk interrupt wakes P while Q runs, Q's quantum expires, and P makes a non-blocking `write()` has 5 kernel entries, 10 mode switches and 2 context switches (P to Q at the blocking read and Q to P at the timer); a script counted both along the trace.

## The in/out ring buffer holds at most N − 1 items
<!-- topics: os-processes-threads.ipc-models -->

**Claim.** A shared buffer of $N$ slots with a write index $\mathit{in}$ and a read index $\mathit{out}$, both taken mod $N$, with the tests

$$\text{empty} \iff \mathit{in} = \mathit{out}, \qquad \text{full} \iff (\mathit{in} + 1) \bmod N = \mathit{out},$$

holds at most $N - 1$ items at a time, and its item count is $c = (\mathit{in} - \mathit{out}) \bmod N$. Keeping a separate count of items lets all $N$ slots be used. This is the bounded buffer of the shared-memory producer and consumer in Galvin.

**Proof.** Invariant: $c \equiv \mathit{in} - \mathit{out} \pmod N$. It holds at the start, with $c = 0$ and $\mathit{in} = \mathit{out} = 0$. A produce raises $c$ and $\mathit{in}$ by one, and a consume lowers $c$ by one and raises $\mathit{out}$ by one, so both sides of the congruence change by the same amount. The producer writes only when the buffer is not full. By the invariant, $(\mathit{in} + 1 - \mathit{out}) \bmod N = (c + 1) \bmod N$, which is 0, so the full test holds, when $c = N - 1$, and which lies in $1, \dots, N - 1$, so the test fails, when $0 \le c \le N - 2$. The producer is therefore stopped exactly at $c = N - 1$, and $c$ never exceeds $N - 1$. With $0 \le c \le N - 1$, the congruence determines $c$ exactly as $(\mathit{in} - \mathit{out}) \bmod N$, and the empty test $\mathit{in} = \mathit{out}$ holds exactly when $c = 0$, so the consumer never reads an empty slot.

The lost slot cannot be avoided with these two indices alone. The count can be any of the $N + 1$ values $0, \dots, N$, but the pair $(\mathit{in}, \mathit{out})$ determines $c$ only through $\mathit{in} - \mathit{out} \bmod N$, which takes $N$ values. A full buffer ($c = N$) and an empty one ($c = 0$) would look the same, so one fill level has to be given up, and the full test gives up $N$. A separate counter $c$, updated by both sides, distinguishes all $N + 1$ levels; it is a shared variable, so its updates need synchronisation. Message-passing links are buffered the same way: a link of capacity $k$ blocks a sender only when $k$ messages are unreceived, capacity 0 makes every send a rendezvous, and an unbounded link never blocks senders.

**GATE use.** NAT questions on the most items an $N$-slot buffer of this kind can hold ($N - 1$), and MCQs on the full and empty conditions. The trap is answering $N$ for the in/out scheme, or $N - 1$ for a counter-based one.

**Check.** A script explored every reachable $(\mathit{in}, \mathit{out})$ state under the two tests for $N = 1, \dots, 8$, checked that $c \equiv \mathit{in} - \mathit{out} \pmod N$ in each, and found the largest fill to be $N - 1$ each time; an 8-slot buffer holds 7 items, and a 1-slot buffer of this kind holds none.

## Pipes: when a reader sees end-of-file
<!-- topics: os-processes-threads.pipes-sockets-signals, os-processes-threads.ipc-models -->

**Claim.** A `read` on an anonymous pipe returns data if there is any; if the pipe is empty, it returns 0 (end-of-file) when no descriptor for the write end is open in any process, and blocks otherwise. A `write` when no read end is open raises SIGPIPE in the writer. Since `fork()` duplicates every descriptor, a reader that inherited a write end and keeps it open never sees end-of-file. A two-way exchange needs two pipes.

**Proof.** The kernel keeps a count of open descriptors for each end of the pipe. `fork()` copies the descriptor table, raising both counts; `close` and `exit` lower them. An empty pipe can still receive data while some write descriptor is open, because whoever holds it might write, so the kernel cannot report end-of-file and must block the reader. Once the write count reaches zero no data can ever arrive, so an empty pipe is at end-of-file and `read` returns 0. If the reader itself holds a write descriptor, the count stays at least 1 while it blocks in `read`, so it waits for ever on its own descriptor. Symmetrically, with no read descriptor open, written data could never be read, so the kernel signals the writer with SIGPIPE (or fails the write with EPIPE if the signal is ignored). A pipe is a single one-way byte queue: if two processes wrote to and read from one pipe, each could read back its own bytes, so each direction needs its own pipe.

**GATE use.** MCQs on pipe behaviour: why a parent and child that forget to close unused ends hang, why pipes need a common ancestor (the descriptors are inherited across `fork`) while FIFOs and sockets do not, and what happens on a write with no reader. In the same questions, SIGSEGV and SIGFPE are synchronous signals caused by the process's own instruction, while SIGINT, SIGTERM and SIGALRM arrive asynchronously; SIGKILL and SIGSTOP cannot be caught.

**Check.** In C, a parent wrote 5 bytes to a pipe and closed its write end. A child that had closed its inherited write end read the 5 bytes and then got end-of-file; a child that had not closed it read the 5 bytes and was still blocked when a 1-second alarm fired. A child writing to a pipe whose read ends were all closed was killed by signal 13, SIGPIPE.
