// CPU scheduling as GATE solutions draw it: integer-or-decimal arrival and burst times,
// zero context-switch cost, and the textbook tie-breaks stated next to each rule below.

export type Algorithm = 'fcfs' | 'sjf' | 'srtf' | 'rr' | 'priority' | 'priority-p' | 'hrrn';

export const ALGORITHMS: { value: Algorithm; label: string; preemptive: boolean }[] = [
  { value: 'fcfs', label: 'FCFS', preemptive: false },
  { value: 'sjf', label: 'SJF', preemptive: false },
  { value: 'srtf', label: 'SRTF (preemptive SJF)', preemptive: true },
  { value: 'rr', label: 'Round robin', preemptive: true },
  { value: 'priority', label: 'Priority', preemptive: false },
  { value: 'priority-p', label: 'Priority (preemptive)', preemptive: true },
  { value: 'hrrn', label: 'HRRN', preemptive: false },
];

export interface Proc {
  id: string;
  arrival: number;
  burst: number;
  /** Lower number = higher priority. */
  priority: number;
}

export interface Slice {
  /** null while the CPU idles. */
  pid: string | null;
  start: number;
  end: number;
}

export interface Step {
  pid: string | null;
  start: number;
  end: number;
  /** Ready processes left waiting while this one runs, in queue order for round robin. */
  waiting: string[];
  note: string;
}

export interface Row extends Proc {
  completion: number;
  turnaround: number;
  waiting: number;
  response: number;
}

export interface Schedule {
  slices: Slice[];
  steps: Step[];
  rows: Row[];
  avgTurnaround: number;
  avgWaiting: number;
  avgResponse: number;
  /** Busy time over the span from the first arrival to the last completion. */
  utilisation: number;
}

const EPS = 1e-9;

interface Live extends Proc {
  index: number;
  remaining: number;
  start?: number;
  finish?: number;
}

const fmt = (n: number) => String(+n.toFixed(3));

function pushSlice(slices: Slice[], pid: string | null, start: number, end: number) {
  const last = slices.at(-1);
  if (last && last.pid === pid && Math.abs(last.end - start) < EPS) last.end = end;
  else slices.push({ pid, start, end });
}

/** Lexicographic comparison of sort keys, smallest first. */
function byKeys<T>(keys: (p: T) => number[]) {
  return (a: T, b: T) => {
    const ka = keys(a);
    const kb = keys(b);
    for (let i = 0; i < ka.length; i++) if (Math.abs(ka[i] - kb[i]) > EPS) return ka[i] - kb[i];
    return 0;
  };
}

const responseRatio = (p: Live, t: number) => (t - p.arrival + p.burst) / p.burst;

/**
 * Who runs next among the ready processes. Ties go to the earlier arrival, then to the process
 * listed first. The preemptive rules also keep the running process on a tie, so an equal
 * newcomer never forces a switch.
 */
function choose(ready: Live[], algo: Algorithm, t: number, running: Live | null): Live {
  const stay = (p: Live) => (p === running ? 0 : 1);
  const keys: Record<Exclude<Algorithm, 'rr'>, (p: Live) => number[]> = {
    fcfs: (p) => [p.arrival, p.index],
    sjf: (p) => [p.burst, p.arrival, p.index],
    srtf: (p) => [p.remaining, stay(p), p.arrival, p.index],
    priority: (p) => [p.priority, p.arrival, p.index],
    'priority-p': (p) => [p.priority, stay(p), p.arrival, p.index],
    hrrn: (p) => [-responseRatio(p, t), p.arrival, p.index],
  };
  if (algo === 'rr') throw new Error('round robin is queue-driven');
  return [...ready].sort(byKeys(keys[algo]))[0];
}

function reason(algo: Algorithm, pick: Live, ready: Live[], t: number) {
  const others = ready.filter((p) => p !== pick);
  if (!others.length) return `${pick.id} is the only ready process`;
  switch (algo) {
    case 'fcfs':
      return `${pick.id} arrived first`;
    case 'sjf':
      return `${pick.id} has the shortest burst: ${ready.map((p) => `${p.id} ${fmt(p.burst)}`).join(', ')}`;
    case 'srtf':
      return `${pick.id} has the least remaining time: ${ready.map((p) => `${p.id} ${fmt(p.remaining)}`).join(', ')}`;
    case 'priority':
    case 'priority-p':
      return `${pick.id} has the highest priority (lowest number): ${ready.map((p) => `${p.id} ${p.priority}`).join(', ')}`;
    case 'hrrn':
      return `${pick.id} has the highest response ratio (W + S) / S: ${ready.map((p) => `${p.id} ${fmt(responseRatio(p, t))}`).join(', ')}`;
    default:
      return `${pick.id} is at the front of the ready queue`;
  }
}

export function schedule(input: Proc[], algo: Algorithm, quantum = 2): Schedule {
  const procs: Live[] = input.map((p, index) => ({ ...p, index, remaining: p.burst }));
  const slices: Slice[] = [];
  const steps: Step[] = [];
  if (!procs.length) return { slices, steps, rows: [], avgTurnaround: 0, avgWaiting: 0, avgResponse: 0, utilisation: 0 };

  const firstArrival = Math.min(...procs.map((p) => p.arrival));
  let t = Math.min(0, firstArrival);
  let done = 0;
  // A zero burst needs no CPU; counting it done up front keeps every loop below finite.
  for (const p of procs) {
    if (p.burst > 0) continue;
    p.remaining = 0;
    p.start = p.finish = p.arrival;
    done++;
  }
  const slice = quantum > 0 ? quantum : 1;

  const idleUntil = (next: number) => {
    pushSlice(slices, null, t, next);
    steps.push({ pid: null, start: t, end: next, waiting: [], note: `t = ${fmt(t)}: nothing has arrived, so the CPU idles until ${fmt(next)}` });
    t = next;
  };

  const run = (p: Live, length: number) => {
    p.start ??= t;
    pushSlice(slices, p.id, t, t + length);
    p.remaining -= length;
    t += length;
    if (p.remaining <= EPS) {
      p.remaining = 0;
      p.finish = t;
      done++;
    }
  };

  if (algo === 'rr') {
    // Arrivals during a quantum join the queue before the process whose quantum just ended.
    const order = procs.filter((p) => p.remaining > 0).sort(byKeys((p) => [p.arrival, p.index]));
    const queue: Live[] = [];
    let next = 0;
    const admit = () => {
      while (next < order.length && order[next].arrival <= t + EPS) queue.push(order[next++]);
    };
    admit();
    while (done < procs.length) {
      const p = queue.shift();
      if (!p) {
        idleUntil(order[next].arrival);
        admit();
        continue;
      }
      const start = t;
      const length = Math.min(slice, p.remaining);
      run(p, length);
      admit();
      const finished = p.remaining === 0;
      if (!finished) queue.push(p);
      steps.push({
        pid: p.id,
        start,
        end: t,
        waiting: queue.filter((q) => q !== p).map((q) => q.id),
        note: finished
          ? `t = ${fmt(start)}: ${p.id} is at the front of the queue and finishes at ${fmt(t)}`
          : `t = ${fmt(start)}: ${p.id} runs one quantum (${fmt(slice)}) and goes to the back of the queue with ${fmt(p.remaining)} left`,
      });
    }
  } else {
    const preemptive = ALGORITHMS.some((a) => a.value === algo && a.preemptive);
    let running: Live | null = null;
    while (done < procs.length) {
      const ready = procs.filter((p) => p.remaining > 0 && p.arrival <= t + EPS);
      if (!ready.length) {
        idleUntil(Math.min(...procs.filter((p) => p.remaining > 0).map((p) => p.arrival)));
        continue;
      }
      const pick = choose(ready, algo, t, running);
      let length = pick.remaining;
      if (preemptive) {
        // Run only until the next arrival, which may change the choice.
        const later = procs.filter((p) => p.arrival > t + EPS).map((p) => p.arrival);
        if (later.length) length = Math.min(length, Math.min(...later) - t);
      }
      const start = t;
      const switched = running !== null && running !== pick && running.remaining > 0;
      const note = `t = ${fmt(start)}: ${reason(algo, pick, ready, start)}${switched ? `, so it preempts ${running?.id}` : ''}`;
      run(pick, length);
      running = pick.remaining > 0 ? pick : null;
      steps.push({ pid: pick.id, start, end: t, waiting: ready.filter((p) => p !== pick).map((p) => p.id), note });
    }
  }

  const rows: Row[] = procs.map((p) => {
    const completion = p.finish ?? t;
    return {
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority,
      completion,
      turnaround: completion - p.arrival,
      waiting: completion - p.arrival - p.burst,
      response: (p.start ?? completion) - p.arrival,
    };
  });
  const mean = (f: (r: Row) => number) => rows.reduce((s, r) => s + f(r), 0) / rows.length;
  const busy = procs.reduce((s, p) => s + p.burst, 0);
  const span = Math.max(...rows.map((r) => r.completion)) - firstArrival;
  return {
    slices,
    steps,
    rows,
    avgTurnaround: mean((r) => r.turnaround),
    avgWaiting: mean((r) => r.waiting),
    avgResponse: mean((r) => r.response),
    utilisation: span > 0 ? busy / span : 1,
  };
}
