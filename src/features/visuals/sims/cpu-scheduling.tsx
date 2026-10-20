import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { ALGORITHMS, type Algorithm, type Proc, schedule, type Slice } from '../logic/cpu-scheduling';
import { Field, Narration, NumberInput, Select, Stat, StepperBar, seriesColor, useStepper } from '../sim-kit';
import type { VisualProps } from '../registry';

const DEFAULT: Proc[] = [
  { id: 'P1', arrival: 0, burst: 8, priority: 3 },
  { id: 'P2', arrival: 1, burst: 4, priority: 1 },
  { id: 'P3', arrival: 2, burst: 9, priority: 4 },
  { id: 'P4', arrival: 3, burst: 5, priority: 2 },
];
const MAX_PROCS = 8;
const fmt = (n: number) => String(+n.toFixed(2));

export default function CpuSchedulingSim({ compact }: VisualProps) {
  const [procs, setProcs] = useState(DEFAULT);
  const [algo, setAlgo] = useState<Algorithm>('srtf');
  const [quantum, setQuantum] = useState(2);
  const result = schedule(procs, algo, quantum);
  const stepper = useStepper(result.steps.length + 1, 1000);
  // Frame 0 is the empty chart; frame k shows the first k dispatches.
  const shown = stepper.index === 0 ? 0 : result.steps[stepper.index - 1].end;
  const step = stepper.index > 0 ? result.steps[stepper.index - 1] : undefined;
  const end = result.slices.at(-1)?.end ?? 0;
  const colorOf = (pid: string | null) => (pid === null ? undefined : seriesColor(procs.findIndex((p) => p.id === pid)));
  const usesPriority = algo === 'priority' || algo === 'priority-p';
  const finished = stepper.atEnd;

  const update = (i: number, patch: Partial<Proc>) => {
    setProcs(procs.map((p, j) => (j === i ? { ...p, ...patch } : p)));
    stepper.reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Algorithm" className="w-52">
          <Select
            value={algo}
            onChange={(v) => {
              setAlgo(v);
              stepper.reset();
            }}
            options={ALGORITHMS}
          />
        </Field>
        {algo === 'rr' && (
          <Field label="Quantum" className="w-24">
            <NumberInput
              value={quantum}
              min={0.5}
              max={50}
              step={0.5}
              onChange={(v) => {
                setQuantum(v);
                stepper.reset();
              }}
            />
          </Field>
        )}
        <p className="pb-2 text-[12px] text-faint">
          {ALGORITHMS.find((a) => a.value === algo)?.preemptive ? 'Preemptive' : 'Non-preemptive'} · zero context-switch cost
        </p>
      </div>

      <Gantt slices={result.slices} until={shown} end={end} colorOf={colorOf} />
      <Narration>{step ? step.note : 'Press play or step through: each step is one dispatch decision.'}</Narration>
      {step && step.waiting.length > 0 && (
        <p className="-mt-2 font-mono text-[11.5px] text-faint">
          {algo === 'rr' ? 'Ready queue' : 'Waiting'}: {step.waiting.join(' → ')}
        </p>
      )}
      <StepperBar stepper={stepper} label={`t = ${fmt(shown)} / ${fmt(end)}`} />

      <div className="overflow-x-auto rounded-[12px] border border-line">
        <table className="w-full min-w-[420px] text-left font-mono text-[12.5px]">
          <thead className="bg-surface-2/70 text-[10.5px] uppercase tracking-[0.08em] text-faint">
            <tr>
              {['PID', 'AT', 'BT', ...(usesPriority ? ['Pri'] : []), 'CT', 'TAT', 'WT', ...(compact ? [] : ['RT'])].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {result.rows.map((r, i) => {
              const done = r.completion <= shown + 1e-9;
              const cell = (v: number) => (done ? fmt(v) : <span className="text-faint">–</span>);
              return (
                <tr key={r.id}>
                  <th scope="row" className="px-3 py-2 font-semibold" style={{ color: seriesColor(i) }}>
                    {r.id}
                  </th>
                  <td className="px-3 py-2 text-muted">{fmt(r.arrival)}</td>
                  <td className="px-3 py-2 text-muted">{fmt(r.burst)}</td>
                  {usesPriority && <td className="px-3 py-2 text-muted">{r.priority}</td>}
                  <td className="px-3 py-2 text-ink">{cell(r.completion)}</td>
                  <td className="px-3 py-2 text-ink">{cell(r.turnaround)}</td>
                  <td className="px-3 py-2 text-amber">{cell(r.waiting)}</td>
                  {!compact && <td className="px-3 py-2 text-ink">{cell(r.response)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={cn('grid gap-2', compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')}>
        <Stat label="Average WT" value={finished ? fmt(result.avgWaiting) : '–'} tone="amber" />
        <Stat label="Average TAT" value={finished ? fmt(result.avgTurnaround) : '–'} tone="accent" />
        {!compact && <Stat label="Average RT" value={finished ? fmt(result.avgResponse) : '–'} />}
        <Stat label="CPU busy" value={finished ? `${Math.round(result.utilisation * 100)}%` : '–'} />
      </div>
      <p className="text-[12px] leading-relaxed text-faint">
        TAT = CT − AT, WT = TAT − BT, RT = first run − AT. Ties go to the earlier arrival; a preemptive rule keeps the running process on a tie.
        {algo === 'rr' && ' A process arriving as a quantum ends joins the queue ahead of the preempted one.'}
      </p>

      <details className="group rounded-[12px] border border-line bg-surface-2/40" open={!compact}>
        <summary className="cursor-pointer select-none px-4 py-2.5 text-[13px] font-medium text-ink">Edit the processes</summary>
        <div className="space-y-2 border-t border-line p-4">
          {procs.map((p, i) => (
            <div key={p.id} className="flex flex-wrap items-end gap-2">
              <span className="w-8 pb-2 font-mono text-[12.5px] font-semibold" style={{ color: seriesColor(i) }}>
                {p.id}
              </span>
              <Field label="Arrival" className="w-20">
                <NumberInput value={p.arrival} min={0} max={100} onChange={(v) => update(i, { arrival: v })} />
              </Field>
              <Field label="Burst" className="w-20">
                <NumberInput value={p.burst} min={0.5} max={100} step={0.5} onChange={(v) => update(i, { burst: v })} />
              </Field>
              {usesPriority && (
                <Field label="Priority" className="w-20">
                  <NumberInput value={p.priority} min={0} max={20} onChange={(v) => update(i, { priority: v })} />
                </Field>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                disabled={procs.length === 1}
                aria-label={`Remove ${p.id}`}
                onClick={() => {
                  setProcs(procs.filter((_, j) => j !== i).map((q, j) => ({ ...q, id: `P${j + 1}` })));
                  stepper.reset();
                }}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              disabled={procs.length >= MAX_PROCS}
              onClick={() => {
                const last = procs.at(-1);
                setProcs([...procs, { id: `P${procs.length + 1}`, arrival: (last?.arrival ?? 0) + 1, burst: 3, priority: procs.length + 1 }]);
                stepper.reset();
              }}
            >
              <Plus /> Add a process
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setProcs(DEFAULT);
                stepper.reset();
              }}
            >
              Restore the example
            </Button>
          </div>
        </div>
      </details>
    </div>
  );
}

/** A Gantt chart that fills left to right up to `until`, on a fixed time axis. */
function Gantt({ slices, until, end, colorOf }: { slices: Slice[]; until: number; end: number; colorOf: (pid: string | null) => string | undefined }) {
  const pct = (t: number) => (end > 0 ? (t / end) * 100 : 0);
  const visible = slices.filter((s) => s.start < until - 1e-9).map((s) => ({ ...s, end: Math.min(s.end, until) }));
  const ticks = [...new Set([0, ...visible.map((s) => s.end)])];
  // Drop tick labels that would sit on top of the previous one.
  const labelled = ticks.filter((t, i) => i === 0 || pct(t) - pct(ticks[i - 1]) >= 4 || t === until);
  return (
    <figure aria-label="Gantt chart" className="space-y-1">
      <div className="relative h-11 overflow-hidden rounded-[10px] border border-line bg-surface-2/50">
        {visible.map((s) => {
          const color = colorOf(s.pid);
          const width = pct(s.end) - pct(s.start);
          return (
            <div
              key={`${s.pid}-${s.start}`}
              className={cn('reveal absolute inset-y-1 grid place-items-center rounded-[6px] font-mono text-[12px] font-semibold text-ink', !color && 'border border-dashed border-line-strong')}
              style={{
                left: `calc(${pct(s.start)}% + 2px)`,
                width: `calc(${width}% - 4px)`,
                background: color ? `color-mix(in oklab, ${color} 24%, transparent)` : undefined,
                boxShadow: color ? `inset 0 0 0 1px color-mix(in oklab, ${color} 65%, transparent)` : undefined,
              }}
              title={`${s.pid ?? 'Idle'}: ${fmt(s.start)}–${fmt(s.end)}`}
            >
              {width >= 5 && (s.pid ?? <span className="text-[10px] font-normal text-faint">idle</span>)}
            </div>
          );
        })}
      </div>
      <div className="relative h-4 font-mono text-[10.5px] text-faint">
        {labelled.map((t) => (
          <span
            key={t}
            className={cn('absolute', pct(t) < 2 ? '' : pct(t) > 96 ? '-translate-x-full' : '-translate-x-1/2')}
            style={{ left: `${pct(t)}%` }}
          >
            {fmt(t)}
          </span>
        ))}
      </div>
    </figure>
  );
}
