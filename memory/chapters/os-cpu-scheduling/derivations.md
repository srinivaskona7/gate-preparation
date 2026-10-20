# CPU and disk scheduling: derivations

## Turnaround, waiting and response time from a Gantt chart
<!-- topics: os-cpu-scheduling.criteria, os-cpu-scheduling.gantt-method, os-cpu-scheduling.preemption -->

**Claim.** On one CPU, take a process with arrival time AT, completion time CT, total CPU time BT and total I/O time IO. Then

$$\mathrm{TAT} = \mathrm{CT} - \mathrm{AT}, \qquad \mathrm{WT} = \mathrm{TAT} - \mathrm{BT} - \mathrm{IO}, \qquad \mathrm{RT} = t_{\text{first run}} - \mathrm{AT},$$

where WT is the time spent in the ready queue, and $0 \le \mathrm{RT} \le \mathrm{WT}$. RT equals WT exactly when all of the process's ready time comes before its first dispatch; for a process with a single CPU burst this holds under every non-preemptive policy. Over $n$ processes without I/O, $\sum \mathrm{WT} = \sum \mathrm{CT} - \sum \mathrm{AT} - \sum \mathrm{BT}$, so a policy minimises the mean waiting time exactly when it minimises the mean turnaround time. The fraction of time the CPU is busy is $U = \text{busy time}/\text{elapsed time}$, and throughput is $n/T$ for $n$ processes completed in a schedule of length $T$.

**Derivation.** At each instant between AT and CT the process is in exactly one state: running, ready, or blocked on I/O. The three total lengths therefore partition the interval $[\mathrm{AT}, \mathrm{CT}]$, so $\mathrm{CT} - \mathrm{AT} = \mathrm{BT} + \mathrm{WT} + \mathrm{IO}$, which is the second formula. Before its first dispatch the process is ready, so RT is part of its ready time and $\mathrm{RT} \le \mathrm{WT}$, with equality exactly when all of its ready time comes before the first dispatch. A single-burst process under a non-preemptive policy runs to completion once dispatched, so equality holds; a preempted process returns to the ready queue while another process runs, so its WT exceeds its RT. Equality can also hold under a preemptive policy that happens not to preempt, such as round robin with a quantum longer than every burst. Summing $\mathrm{WT}_i = \mathrm{CT}_i - \mathrm{AT}_i - \mathrm{BT}_i$ gives the identity for the totals, and $\sum \mathrm{AT}$ and $\sum \mathrm{BT}$ are fixed by the input, so only $\sum \mathrm{CT}$ depends on the policy. In $U$, idle gaps before arrivals and time spent switching both count as not busy.

**GATE use.** The standard 2-mark NAT gives an arrival and burst table: draw the Gantt chart, deciding only at arrivals, completions and quantum expiries, read off each CT, and average TAT or WT. The traps are letting an idle gap vanish (the clock still advances), swapping WT and TAT, forgetting to subtract I/O time, and assuming RT and WT are equal for a preempted process.

**Check.** For P1 (0, 8), P2 (1, 4), P3 (2, 9) and P4 (3, 5) under SRTF the chart is P1 0–1, P2 1–5, P4 5–10, P1 10–17, P3 17–26. Completion times 17, 5, 26 and 10 give TAT 17, 4, 24 and 7 (mean 13), WT 9, 0, 15 and 2 (mean 6.5, which is $13 - 26/4$), and RT 0, 0, 15 and 2; P1 responds at once but waits 9 because it is preempted. FCFS on P1 (0, 3) and P2 (5, 2) leaves the CPU idle from 3 to 5: busy fraction $5/7 \approx 71.4\%$ and throughput $2/7$ per time unit. A process alone on the CPU that runs 2, does I/O for 3 and runs 2 more has $\mathrm{CT} = 7$ and $\mathrm{WT} = 7 - 4 - 3 = 0$.

## SJF minimises the mean waiting time when all jobs are present
<!-- topics: os-cpu-scheduling.sjf-srtf, os-cpu-scheduling.fcfs -->

**Claim.** Let $n$ jobs with known bursts $b_1, \dots, b_n$ all be available at time 0 and run one at a time, without preemption, idling or switching cost. Running them in the order $\sigma$ gives the total waiting time

$$W(\sigma) = \sum_{k=1}^{n} (n - k)\, b_{\sigma(k)}.$$

$W$ is minimised exactly by the orders with nondecreasing bursts, which is SJF, and the same orders minimise the total turnaround time $W + \sum_i b_i$. When arrivals are staggered, greedy non-preemptive SJF is no longer optimal.

**Proof.** The job in position $k$ waits for the $k - 1$ jobs ahead of it, so its waiting time is $\sum_{j<k} b_{\sigma(j)}$. In the total, $b_{\sigma(j)}$ is counted once for each of the $n - j$ jobs behind it, which gives the formula. For the exchange, suppose $b = b_{\sigma(j)}$ is larger than $b' = b_{\sigma(j+1)}$. Swapping these two adjacent jobs changes only their coefficients, and the total changes by

$$(n-j)b' + (n-j-1)b - (n-j)b - (n-j-1)b' = b' - b,$$

which is negative. So an order with an adjacent inversion is never optimal. An optimal order exists, since there are finitely many orders, and it has no adjacent inversion, so its bursts are nondecreasing. All nondecreasing orders differ only by swaps of equal bursts, which leave $W$ unchanged, so every one of them attains the minimum. This is the argument Galvin states in words: moving a short job ahead of a long one shortens the short job's wait by more than it lengthens the long job's. FCFS takes whatever order the jobs arrived in, so one long job at the front delays everyone behind it (the convoy effect).

The optimality needs all jobs present together. With A (0, 3), B (0, 4) and C (3.5, 1), greedy SJF runs A 0–3 and then B 3–7, because C has not arrived at time 3, and C 7–8: waits 0, 3 and 3.5, total 6.5. Running B first gives B 0–4, then C 4–5 and A 5–8: waits 0, 0.5 and 5, total 5.5, and this schedule never idles either. With arrivals the optimal policy is preemptive (next section).

**GATE use.** The MCQ "all jobs arrive at time 0; which non-preemptive policy minimises the average waiting time?" has answer SJF. Related facts: SJF is priority scheduling in which a shorter predicted burst means a higher priority, and SJF can starve a long job when short ones keep arriving. The trap is quoting SJF's optimality for a table with staggered arrivals.

**Check.** Bursts 24, 3, 3 in FCFS order wait 0, 24 and 27 (mean 17); in SJF order 3, 3, 24 they wait 0, 3 and 6 (mean 3). The formula gives $2 \cdot 24 + 1 \cdot 3 + 0 \cdot 3 = 51$ and $2 \cdot 3 + 1 \cdot 3 + 0 \cdot 24 = 9$. A script compared SJF with every permutation of 3,000 random sets of up to 6 bursts and found SJF minimal each time; swapping an adjacent inversion always saved exactly $b - b'$. It also replayed the A, B, C example: 6.5 against 5.5.

## SRTF minimises the mean waiting time with arrivals
<!-- topics: os-cpu-scheduling.sjf-srtf, os-cpu-scheduling.preemption -->

**Claim.** Jobs $i$ arrive at rational times $a_i$ with known rational bursts $b_i$; there is one CPU and preemption costs nothing. SRTF runs, at every instant, an arrived unfinished job with the least remaining time. Compare it with any schedule that switches jobs finitely often and only at rational times, and measure time in a unit $u$ that divides every arrival time, burst and switch time (one over the least common multiple of their denominators will do), so that all of them are integers. Then SRTF minimises $\sum_i C_i$ over all such schedules, and therefore the mean turnaround and mean waiting times. Its choice can change only when a job arrives or completes, so a trace needs decisions only at those events.

**Proof.** The interchange argument is Schrage's (1968). Fix one SRTF schedule $G$, with any tie-break, and take any schedule $S$ of the kind in the claim. In each unit slot both run a single job or idle: $S$ by the choice of $u$, and $G$ because it switches only at arrivals and completions (last paragraph), which are integers when the arrivals and bursts are. Take the first unit slot $[t, t+1)$ in which $S$ differs from $G$, and let $k$ be the job $G$ runs there ($G$ idles only when every arrived job has finished, and then $S$ has nothing to run either). Before $t$ the two schedules agree, so they have the same remaining times $r_i(t)$, and $k$ has the least remaining time among the available jobs.

If $S$ idles at $t$, move the next unit of $k$ into slot $t$; $C_k$ does not grow and no other job changes. Otherwise $S$ runs some other job $j$ at $t$, and $r_k(t) \le r_j(t)$. Let $T$ be the set of slots from $t$ on in which $S$ runs $j$ or $k$; it has $r_j + r_k$ slots and its first slot is $t$. Give the first $r_k$ slots of $T$ to $k$ and the remaining $r_j$ to $j$; this is feasible because both jobs have arrived by $t$. In the new schedule $C'_k$ is the end of the $r_k$-th slot of $T$ and $C'_j$ is the end of the last slot of $T$, which is $\max(C_j, C_k)$. In $S$, whichever of the two finishes first has used at least $r_k$ slots of $T$ by then, so $\min(C_j, C_k)$ is no earlier than the end of the $r_k$-th slot. Hence

$$C'_j + C'_k \le \max(C_j, C_k) + \min(C_j, C_k) = C_j + C_k,$$

and no other job moves. The new schedule runs $k$ in slot $t$, so it agrees with $G$ one slot further. Repeating the step at the next disagreement turns $S$ into $G$ after finitely many steps without ever increasing $\sum_i C_i$, so $G$ is optimal; since $G$ had an arbitrary tie-break, every tie-break of SRTF is optimal. With $\sum_i \mathrm{WT}_i = \sum_i C_i - \sum_i a_i - \sum_i b_i$ (previous sections), minimising $\sum_i C_i$ minimises the total waiting time.

Between two events the running job's remaining time falls while the others stay fixed, so once it has run for any positive time it is the only job of least remaining time. SRTF therefore switches only at arrivals and completions, whatever its tie-break, and with ties left to the running job a preemption happens only when an arrival brings a strictly shorter job. When all jobs arrive at time 0 there are no such events and SRTF is SJF.

**GATE use.** SRTF traces are a frequent 2-mark NAT. At each arrival compare the newcomer's burst with the running job's remaining time, preempt only if it is strictly shorter, and keep a table of remaining times. The traps are comparing against the original burst instead of the remaining time and re-deciding only at completions. In MSQs, SRTF is the optimal policy for mean waiting time when bursts are known and switches are free, and it can starve long jobs.

**Check.** For P1 (0, 8), P2 (1, 4), P3 (2, 9) and P4 (3, 5): at 1, P2's 4 beats P1's remaining 7; at 3, P4's 5 does not beat P2's remaining 2; at 5 the remaining times are 7, 9 and 5, so P4 runs, then P1 and then P3. Waiting times are 9, 0, 15 and 2, mean 6.5. Non-preemptive SJF on the same table runs P1 0–8, P2 8–12, P4 12–17 and P3 17–26, with mean waiting time $31/4 = 7.75$. An exhaustive search over every unit-slot schedule that finishes by time $\max_i a_i + \sum_i b_i = 29$, idle slots included, found the least $\sum_i C_i$ for this table to be 58, which is SRTF's $17 + 5 + 26 + 10$ and a mean waiting time of $(58 - 32)/4 = 6.5$. The same search matched SRTF's total on 600 random instances of 2 to 4 jobs, in all of which SRTF preempted only at arrival times.

## Exponential averaging of burst lengths: closed form and weights
<!-- topics: os-cpu-scheduling.burst-prediction -->

**Claim.** Let $\tau_0$ be the initial guess, $t_0, t_1, \dots$ the measured bursts and $\tau_{n+1} = \alpha t_n + (1 - \alpha)\tau_n$ with $0 \le \alpha \le 1$. Then

$$\tau_{n+1} = \sum_{j=0}^{n} \alpha (1-\alpha)^{\,n-j}\, t_j + (1 - \alpha)^{n+1}\tau_0 .$$

The weights are nonnegative and sum to 1, so every prediction is a weighted average of the past bursts and the initial guess and lies between the smallest and the largest of them. The weight of a burst shrinks by the factor $1 - \alpha$ for each step it lies in the past. $\alpha = 0$ keeps $\tau_0$ for ever; $\alpha = 1$ predicts the last burst.

**Proof.** Induction on $n$. For $n = 0$ the formula reads $\tau_1 = \alpha t_0 + (1 - \alpha)\tau_0$, the recurrence itself. If it holds for $\tau_{n+1}$, then

$$\tau_{n+2} = \alpha t_{n+1} + (1-\alpha)\tau_{n+1} = \alpha t_{n+1} + \sum_{j=0}^{n} \alpha(1-\alpha)^{\,n+1-j} t_j + (1-\alpha)^{n+2}\tau_0,$$

and the term $\alpha t_{n+1}$ is the $j = n + 1$ term of the sum, which is the formula for $n + 1$. For $0 < \alpha \le 1$ the weights on the bursts form a geometric series, $\sum_{j=0}^{n} \alpha(1-\alpha)^{n-j} = \alpha \cdot \frac{1 - (1-\alpha)^{n+1}}{\alpha} = 1 - (1-\alpha)^{n+1}$, and adding the weight $(1-\alpha)^{n+1}$ of $\tau_0$ gives 1; for $\alpha = 0$ all the weight is on $\tau_0$. A weighted average with nonnegative weights summing to 1 lies between the smallest and largest values averaged. If every burst equals $b$, then $\tau_{n+1} - b = (1 - \alpha)(\tau_n - b)$, so the error of the initial guess dies out geometrically.

**GATE use.** NAT questions give $\alpha$, $\tau_0$ and a few bursts and ask for the next prediction. The traps are the indexing (whether the first measured burst is $t_0$ or $t_1$, and which $\tau$ is asked for) and putting $\alpha$ on the old prediction instead of the newest burst; with $\alpha = 0.5$ the second slip goes unnoticed, so check the convention on a question with another $\alpha$.

**Check.** $\alpha = 0.5$, $\tau_0 = 10$ and bursts 6, 4, 6: $\tau_1 = 8$, $\tau_2 = 6$, $\tau_3 = 6$. The closed form gives the same: $\tfrac12 \cdot 6 + \tfrac14 \cdot 4 + \tfrac18 \cdot 6 + \tfrac18 \cdot 10 = 3 + 1 + 0.75 + 1.25 = 6$, with weights $\tfrac12 + \tfrac14 + \tfrac18 + \tfrac18 = 1$. With $\alpha = 0.8$ the predictions are 6.8, 4.56 and 5.712; putting 0.8 on the old prediction instead gives 9.2, 8.16 and 7.728. A script compared the recurrence with the closed form in exact fractions on 2,000 random cases and confirmed that each prediction lay between the smallest and largest values averaged.

## Round robin: the wait between quanta, efficiency and the FCFS limit
<!-- topics: os-cpu-scheduling.round-robin, os-cpu-scheduling.fcfs, os-cpu-scheduling.preemption -->

**Claim.** Round robin keeps a FIFO ready queue and gives each dispatched process at most a quantum $q$; every dispatch costs a context switch of $s$. Let $n \ge 2$ processes share the CPU, each always ready with work left.

1. From the end of one quantum of a process to the start of its next quantum at most $(n - 1)q + ns$ elapses: the other $n - 1$ quanta and $n$ switches, the last of them back into the process. Equality holds when every other process uses its full quantum. A guarantee that every process runs at least once every $t$ time units therefore requires $(n-1)q + ns \le t$, that is $q \le \frac{t - ns}{n - 1}$.
2. Measured up to the moment the process is selected again, not counting the switch into it, the gap is $(n - 1)(q + s)$. The same value bounds the wait of a process that becomes ready just as another process starts a quantum.
3. When every dispatch uses a full quantum, the fraction of CPU time spent on useful work is $\eta = \frac{q}{q + s}$; a dispatch that ends early after a burst $b < q$ contributes $b$ instead of $q$.
4. If $q$ is at least every burst, no process is ever preempted and round robin is FCFS.

**Proof.** (1) When a process P's quantum ends, P joins the tail of the queue, behind the other $n - 1$ processes. Each of them is dispatched once before P, at a cost of at most $s + q$; then the switch into P costs $s$. The total is at most $(n-1)(s + q) + s = (n-1)q + ns$, with equality when each runs a full quantum. Requiring this to be at most $t$ and solving for $q$ gives the bound on the quantum; this is the answer to a GATE question of 1998.

(2) Leaving out the final switch into P gives $(n-1)(q + s)$. A process that becomes ready just as X starts its quantum, with $n$ processes in all, waits for the rest of X's quantum ($q$), then for the other $n - 2$ processes ($s + q$ each), then for its own switch ($s$): $q + (n-2)(s + q) + s = (n - 1)(q + s)$.

(3) Each dispatch spends $s$ switching and then $q$ on useful work, so over any number of full dispatches the useful fraction is $q/(q + s)$; a dispatch that ends after a shorter burst $b$ does $b$ units of work for its $s$.

(4) If every burst is at most $q$, every dispatched process finishes within its quantum, so none returns to the queue; the FIFO queue then serves processes in arrival order, each to completion, which is FCFS. As $q$ shrinks, a burst $b$ needs $\lceil b/q \rceil$ dispatches, so switching takes a growing share of the time and $\eta \to 0$.

**GATE use.** RR traces (average waiting or turnaround time) are a common 2-mark NAT. When an arrival and a quantum expiry coincide, the usual convention enqueues the newcomer first; state the convention, because it changes the schedule. With switch costs, decide whether the switch into a process counts as part of its wait, which separates $(n-1)q + ns$ from $(n-1)(q+s)$. For a context-switch count, charge one switch each time the running process changes; a process whose quantum expires while nothing else is ready keeps the CPU without a switch, and whether the first dispatch counts is a convention the question must fix. Efficiency questions use $q/(q + s)$.

**Check.** Bursts 4, 3, 1 arriving at 0 with $q = 2$: P1 0–2, P2 2–4, P3 4–5, P1 5–7, P2 7–8, so completion times 7, 8 and 5 give mean TAT $20/3 \approx 6.67$. Bursts 8, 4, 12 with $q = 4$: completion times 16, 8 and 24 give waits 8, 4 and 12, mean 8. A simulator with $n = 4$, $q = 3$ and $s = 1$ measured a gap of $3 \cdot 3 + 4 \cdot 1 = 13$ between consecutive quanta of one process, and a wait of $3 \cdot 4 = 12$ for a process arriving as another started its quantum. With $t = 20$, $n = 4$ and $s = 1$ the quantum must satisfy $q \le 16/3 \approx 5.33$, and simulating $q = 16/3$ gave a largest gap of exactly 20. With $q = 4$ and $s = 1$, $\eta = 4/5 = 80\%$; a process that blocks after 2 gets $2/3$. On 1,500 random tables, round robin with $q$ at least the largest burst gave exactly FCFS's completion times. P1 (0, 4) and P2 (2, 2) with $q = 2$ finish at 6 and 4 with the newcomer enqueued first, and at 4 and 6 the other way.

## HRRN: the response ratio, its limits, and why it does not starve
<!-- topics: os-cpu-scheduling.hrrn, os-cpu-scheduling.priority-aging -->

**Claim.** HRRN is non-preemptive: when the CPU becomes free it runs the waiting job with the largest response ratio

$$R = \frac{W + S}{S} = 1 + \frac{W}{S},$$

where $W$ is the time the job has waited so far and $S$ its expected service time.

1. A job that has just arrived has $R = 1$, and $R$ grows at the rate $1/S$ while the job waits, so short jobs gain priority faster.
2. Among jobs that have waited equally long, for a common wait $W > 0$, HRRN picks the shortest, as SJF does; at $W = 0$ every ratio is 1 and the tie-break decides. Among jobs of equal service time it picks the one that has waited longest, as FCFS does.
3. No starvation. Let service times lie in $[S_{\min}, S_{\max}]$ with $S_{\min} > 0$, and suppose the jobs other than $J$ bring at most $L + \sigma$ units of work in any interval of length $L$, so the CPU is not overloaded. Then $J$ waits at most $\frac{S_J}{S_{\min}}(B + \sigma)$, where $B$ is the unfinished work, at $J$'s arrival, of the jobs that arrived before $J$. SJF has no such bound.

**Proof.** Parts 1 and 2 can be read off $R = 1 + W/S$. For part 3, let $J$ arrive at $a_J$ and suppose it is still waiting at time $t$. The CPU does not idle in $[a_J, t]$, because $J$ is ready throughout. At each decision time $t'$ in that interval the job $K$ chosen instead of $J$ has $R_K \ge R_J$, that is $W_K/S_K \ge W_J/S_J$, so

$$W_K \ge \frac{S_K}{S_J}\,(t' - a_J) \ge c\,(t' - a_J), \qquad c = \frac{S_{\min}}{S_J}.$$

Hence $K$ arrived no later than $t' - c(t' - a_J) \le a_J + (1 - c)(t - a_J)$. Every unit of work done in $[a_J, t]$ therefore belongs either to a job that arrived before $a_J$, at most $B$ in all, or to a job that arrived in $[a_J,\, a_J + (1-c)(t - a_J)]$, at most $(1-c)(t - a_J) + \sigma$ in all. The CPU did $t - a_J$ units of work in the interval, so $t - a_J \le B + (1 - c)(t - a_J) + \sigma$, that is $c\,(t - a_J) \le B + \sigma$, and $J$'s wait $t - a_J$ is at most $(B + \sigma)/c$. Under SJF the job chosen over $J$ need only be shorter, whenever it arrived, so the bound fails: if a unit job arrives every time unit, a longer job never runs. Raising a job's priority as it waits is called aging; HRRN builds aging into the ratio, while priority scheduling without aging can starve exactly as SJF does.

**GATE use.** MCQs give the waits and bursts of the waiting jobs and ask which runs next; compute $(W + S)/S$ for each. Starvation MSQs: FCFS, round robin and HRRN cannot starve a job; SJF, SRTF and priority scheduling without aging can. The traps are dividing by $W$ instead of $S$, and re-evaluating ratios while a job runs (HRRN never preempts).

**Check.** A has waited 8 with burst 4, B 5 with burst 1 and C 10 with burst 10: $R_A = 12/4 = 3$, $R_B = 6/1 = 6$ and $R_C = 20/10 = 2$, so B runs. With J (arrival 0, burst 10) and a unit job arriving at every integer time, a simulation showed SJF never starting J before time 250. HRRN with ties going to the shorter job runs U0 from 0 to 1, since both ratios are 1 at time 0, and starts J at time 1, when its ratio $1 + 1/10 = 1.1$ beats the newest unit job's 1; here $B = 0$, $\sigma = 1$ and the bound allows a wait of 10. Two more unit jobs at time 0 raise $\sigma$ to 3, and HRRN then starts J at 21: within the bound of 30 but past $B + \sigma = 3$, so the factor $S_J/S_{\min}$ cannot be dropped. On 400 random streams of 60 jobs, where the gap before each arrival is 0 to 2 times the previous job's burst and $\sigma$ is measured for each job as the largest excess of the other jobs' work over an interval's length, the bound held for all 24,000 jobs; 20,418 of them waited, and the largest ratio of a wait to its bound was 0.53.

## Total head movement under FCFS, SSTF, SCAN, LOOK, C-SCAN and C-LOOK
<!-- topics: os-cpu-scheduling.disk-scheduling -->

**Claim.** The head starts at cylinder $c_0 = h$ and visits $c_1, \dots, c_k$ in the order the policy serves them, including any turning point at the end of the disk, so the total movement is $D = \sum_{i=1}^{k} \lvert c_i - c_{i-1} \rvert$. Let the disk have cylinders $0, \dots, E$ and let $m$ and $M$ be the lowest and highest requests, with $m < h < M$, and $\ell$ the highest request below $h$. With the head moving towards higher cylinders first:

- SCAN: $D = (E - h) + (E - m)$. LOOK: $D = (M - h) + (M - m)$.
- C-SCAN, counting the return sweep: $D = (E - h) + E + \ell$. C-LOOK, counting the jump: $D = (M - h) + (M - m) + (\ell - m)$. Questions that do not count the return drop $E$ or $M - m$.
- Every service order costs at least $(M - m) + \min(h - m,\, M - h)$, and LOOK starting towards the nearer end attains it.

**Proof.** On a stretch where the head moves in one direction, $c_0 \le c_1 \le \dots \le c_j$ say, the absolute values can be dropped and the sum telescopes: $\sum (c_i - c_{i-1}) = c_j - c_0$. SCAN's path consists of the sweep from $h$ up to $E$ and the sweep from $E$ down to $m$, giving $(E - h) + (E - m)$; LOOK turns at $M$ instead of $E$. C-SCAN sweeps up from $h$ to $E$, returns from $E$ to 0 and sweeps up from 0 to $\ell$; C-LOOK sweeps up to $M$, jumps to $m$ and sweeps up to $\ell$. For the lower bound, the head moves continuously from $h$ and must reach both $m$ and $M$. If it reaches $m$ first, it has travelled at least $h - m$ and still needs at least $M - m$ to reach $M$; if it reaches $M$ first, the cost is at least $(M - h) + (M - m)$. The smaller of the two bounds every order, and LOOK towards the nearer end follows exactly that path. SSTF is greedy: it serves the nearest pending request, need not reach the minimum, and can starve requests at the far end while new ones keep arriving near the head.

**GATE use.** NAT questions give a queue, the head position and direction, and ask for the total under one policy. The traps are turning SCAN at the last request (SCAN goes to the disk end, LOOK turns at the last request), ignoring the initial direction, getting the end cylinder wrong (200 cylinders are numbered 0 to 199), and counting or not counting C-SCAN's return differently from the question.

**Check.** Queue 98, 183, 37, 122, 14, 124, 65, 67, head at 53 moving up, cylinders 0 to 199. FCFS: 640. SSTF visits 65, 67, 37, 14, 98, 122, 124, 183: 236. SCAN: $146 + 185 = 331$. LOOK: $130 + 169 = 299$. C-SCAN: $146 + 199 + 37 = 382$, or 183 without the return. C-LOOK: $130 + 169 + 23 = 322$, or 153 without the jump. The lower bound is $169 + \min(39, 130) = 208$, attained by LOOK moving down first; an exhaustive search over all 40,320 service orders found the same minimum. On 300 random queues with requests on both sides of the head, the bound matched an exhaustive search and LOOK towards the nearer end attained it.

## Disk access time: average rotational latency and transfer time
<!-- topics: os-cpu-scheduling.disk-scheduling -->

**Claim.** For one request, $T_{\text{access}} = T_{\text{seek}} + \tfrac12 T_{\text{rotation}} + T_{\text{transfer}}$, where $T_{\text{rotation}} = 60/\text{RPM}$ seconds is one revolution, $\tfrac12 T_{\text{rotation}}$ is the average rotational latency when the target's angular position relative to the head is uniformly distributed, and transferring $b$ bytes from a track that holds $N$ bytes takes $(b/N)\,T_{\text{rotation}}$. Under a linear seek model the head-movement totals of the previous section convert to seek time at a fixed time per cylinder.

**Derivation.** The platter turns at constant angular speed, one revolution per $T_{\text{rotation}}$. When the seek ends, the angle $\theta$ from the head to the start of the target sector, measured in the direction of rotation, is uniform on $[0, 2\pi)$ if requests bear no relation to the platter's position. The latency is $\frac{\theta}{2\pi} T_{\text{rotation}}$, whose mean is $\tfrac12 T_{\text{rotation}}$. With $S$ sectors per track and the head at a sector boundary, the wait is $\frac{k}{S}T_{\text{rotation}}$ for $k$ uniform on $0, \dots, S - 1$, with mean $\frac{S-1}{2S}T_{\text{rotation}}$, which tends to the same value. During the transfer the track passes under the head at $N$ bytes per revolution, so $b$ bytes take $(b/N)\,T_{\text{rotation}}$. Seek, latency and transfer happen one after another, so their times add, and by linearity of expectation so do their averages. Controller overhead or queueing delay, when given, is added on top.

**GATE use.** NAT questions combine the RPM, the average seek time, the sector size and the track capacity. The traps are charging a full revolution for the average latency, converting RPM wrongly (one revolution takes $60/\text{RPM}$ seconds), and dividing by the sector size where the track capacity is needed.

**Check.** At 7200 RPM, $T_{\text{rotation}} = 60/7200$ s $\approx 8.333$ ms and the average latency is $\approx 4.167$ ms; a simulation of $10^6$ uniform angles averaged 4.168 ms. Reading 8 sectors from a track of 400 takes $(8/400) \times 8.333 \approx 0.167$ ms, so with a 4 ms average seek $T_{\text{access}} = 4 + 4.167 + 0.167 \approx 8.333$ ms. The discrete latency with 400 sectors is $\frac{399}{800} \times 8.333 \approx 4.156$ ms. At 0.1 ms per cylinder, SCAN's 331 cylinders above cost 33.1 ms of seeking and LOOK's 299 cost 29.9 ms.
