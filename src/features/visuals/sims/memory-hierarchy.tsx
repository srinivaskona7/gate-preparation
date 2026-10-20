import { Plus, Send, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { HierarchyScene, type RequestBurst } from '@/ui/3d/hierarchy-scene';
import { levelToken } from '@/ui/3d/hierarchy-world';
import { Button } from '@/ui/button';
import { type Access, coefficients, emat, type Level, requestTime, servedShare, simulate } from '../logic/memory-hierarchy';
import { Field, Narration, NumberInput, Select, Stat } from '../sim-kit';
import type { VisualProps } from '../registry';

const MAX_LEVELS = 5;
const BURST = 200;
const fmt = (n: number) => String(+n.toFixed(4));

type PresetId = 'three' | 'two';
const PRESETS: Record<PresetId, { label: string; levels: Level[] }> = {
  three: {
    label: 'L1, L2 and main memory',
    levels: [
      { name: 'L1', time: 1, hit: 0.8 },
      { name: 'L2', time: 10, hit: 0.9 },
      { name: 'Memory', time: 100, hit: 1 },
    ],
  },
  two: {
    label: 'One cache and main memory',
    levels: [
      { name: 'Cache', time: 10, hit: 0.9 },
      { name: 'Memory', time: 100, hit: 1 },
    ],
  },
};
const PRESET_OPTIONS = (Object.keys(PRESETS) as PresetId[]).map((value) => ({ value, label: PRESETS[value].label }));

const ACCESS_OPTIONS: { value: Access; label: string }[] = [
  { value: 'hierarchical', label: 'Hierarchical (look-through)' },
  { value: 'simultaneous', label: 'Simultaneous (look-aside)' },
];

const color = (i: number) => `var(--${levelToken(i)})`;
const isLast = (levels: readonly Level[], i: number) => i === levels.length - 1;

export default function MemoryHierarchySim({ compact }: VisualProps) {
  const [levels, setLevels] = useState<Level[]>(PRESETS.three.levels);
  const [access, setAccess] = useState<Access>('hierarchical');
  const [selected, setSelected] = useState(0);
  const [burst, setBurst] = useState<RequestBurst | undefined>();
  // The scene replays a burst only on a new id, so the count must survive edits that clear the burst.
  const sends = useRef(0);

  const coef = coefficients(levels, access);
  const served = servedShare(levels);
  const t = emat(levels, access);
  const views = useMemo(
    () => levels.map((l, i) => ({ name: l.name, detail: `${fmt(l.time)} ns · h = ${isLast(levels, i) ? 1 : fmt(l.hit)}` })),
    [levels],
  );
  const counts = burst ? levels.map((_, i) => burst.served.filter((s) => s === i).length) : undefined;
  const measured = burst ? burst.served.reduce((sum, s) => sum + requestTime(levels, s, access), 0) / burst.served.length : undefined;
  const sel = Math.min(selected, levels.length - 1);
  const label = `Memory hierarchy, fastest first: ${levels.map((l, i) => `${l.name}, ${fmt(l.time)} ns, serves ${fmt(served[i] * 100)}% of requests`).join('; ')}.`;

  const edit = (next: Level[]) => {
    setLevels(next);
    setBurst(undefined);
  };
  const update = (i: number, patch: Partial<Level>) => edit(levels.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const send = () => {
    const id = ++sends.current;
    setBurst({ id, served: simulate(levels, BURST, id + 2026) });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Access" className="w-60">
          <Select value={access} onChange={setAccess} options={ACCESS_OPTIONS} />
        </Field>
        <Field label="Example" className="min-w-44 flex-1 sm:max-w-64">
          <Select<PresetId | ''>
            value=""
            onChange={(v) => {
              if (!v) return;
              edit(PRESETS[v].levels);
              setSelected(0);
            }}
            options={[{ value: '', label: 'Load an example…' }, ...PRESET_OPTIONS]}
          />
        </Field>
        <Button size="sm" variant="primary" className="h-9" onClick={send}>
          <Send /> Send {BURST} requests
        </Button>
      </div>

      <HierarchyScene
        levels={views}
        selected={sel}
        onSelect={setSelected}
        burst={burst}
        label={label}
        fallback={<ShareBars levels={levels} served={served} selected={sel} onSelect={setSelected} label={label} />}
        className={compact ? 'h-[280px]' : 'h-[360px]'}
      />
      <Narration>
        {levels[sel].name} serves {fmt(served[sel] * 100)}% of requests.{' '}
        {access === 'hierarchical'
          ? `${fmt(coef[sel] * 100)}% reach it, and each of those pays its ${fmt(levels[sel].time)} ns, so its term is ${fmt(coef[sel])} × ${fmt(levels[sel].time)} = ${fmt(coef[sel] * levels[sel].time)} ns.`
          : `Only those pay its ${fmt(levels[sel].time)} ns, so its term is ${fmt(coef[sel])} × ${fmt(levels[sel].time)} = ${fmt(coef[sel] * levels[sel].time)} ns.`}
      </Narration>

      <p role="group" aria-label="Access time, term by term" className="overflow-x-auto rounded-[10px] border border-line bg-surface-2/50 px-3 py-2 font-mono text-[12.5px] text-muted">
        T ={' '}
        {levels.map((l, i) => (
          <span key={i}>
            {i > 0 && ' + '}
            <span style={{ color: color(i) }} className={cn(i === sel && 'font-semibold underline underline-offset-4')}>
              {fmt(coef[i])} × {fmt(l.time)}
            </span>
          </span>
        ))}{' '}
        = <span className="font-semibold text-ink">{fmt(t)} ns</span>
      </p>

      <div className={cn('grid gap-2', compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')}>
        <Stat label="Access time" value={`${fmt(t)} ns`} tone="accent" />
        <Stat label={`Mean of ${BURST}`} value={measured === undefined ? '–' : `${fmt(measured)} ns`} tone="amber" />
        <Stat label="Speed-up" value={`${fmt(levels[levels.length - 1].time / t)}×`} tone="emerald" />
        {!compact && <Stat label="Other mode" value={`${fmt(emat(levels, access === 'hierarchical' ? 'simultaneous' : 'hierarchical'))} ns`} />}
      </div>
      <p className="text-[12px] leading-relaxed text-faint">
        Hit ratios are local: the share of the requests reaching a level that hit there. The last level holds everything. Hierarchical access pays every
        level a request passes; simultaneous access probes all levels at once and pays only the one that answers. Speed-up is against the last level alone.
      </p>

      <details className="group rounded-[12px] border border-line bg-surface-2/40" open={!compact}>
        <summary className="cursor-pointer select-none px-4 py-2.5 text-[13px] font-medium text-ink">Edit the levels</summary>
        <div className="space-y-2 border-t border-line p-4">
          {levels.map((l, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <span className="w-16 truncate pb-2 font-mono text-[12.5px] font-semibold" style={{ color: color(i) }}>
                {l.name}
              </span>
              <Field label="Time, ns" context={l.name} className="w-24">
                <NumberInput value={l.time} min={0.1} max={100000} step={0.1} onChange={(v) => update(i, { time: v })} />
              </Field>
              <Field label="Hit ratio" context={l.name} className="w-24">
                {isLast(levels, i) ? (
                  <p className="h-9 pt-2 font-mono text-[12.5px] text-faint">1</p>
                ) : (
                  <NumberInput value={l.hit} min={0} max={1} step={0.01} onChange={(v) => update(i, { hit: v })} />
                )}
              </Field>
              {counts && (
                <p className="pb-2 font-mono text-[11.5px] text-faint">
                  {counts[i]} of {BURST} served
                </p>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                disabled={levels.length <= 2 || isLast(levels, i)}
                aria-label={`Remove ${l.name}`}
                onClick={() => edit(rename(levels.filter((_, j) => j !== i)))}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={levels.length >= MAX_LEVELS}
            onClick={() => {
              const last = levels[levels.length - 1];
              const above = levels.slice(0, -1);
              const time = above.length ? above[above.length - 1].time * 10 : last.time / 10;
              edit(rename([...above, { name: '', time: Math.min(time, last.time), hit: 0.9 }, last]));
            }}
          >
            <Plus /> Add a cache level
          </Button>
        </div>
      </details>
    </div>
  );
}

/** Caches are L1, L2, …; the last level keeps its own name. */
function rename(levels: Level[]): Level[] {
  return levels.map((l, i) => (i === levels.length - 1 ? l : { ...l, name: levels.length === 2 ? 'Cache' : `L${i + 1}` }));
}

/** The served shares as bars, for browsers without WebGL 2. */
function ShareBars({ levels, served, selected, onSelect, label }: { levels: Level[]; served: number[]; selected: number; onSelect: (i: number) => void; label: string }) {
  return (
    <figure aria-label={label} className="space-y-2 rounded-[12px] border border-line bg-surface-2/40 p-4">
      {levels.map((l, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-pressed={i === selected}
          className={cn('flex w-full items-center gap-3 rounded-md px-2 py-1 text-left', i === selected && 'bg-surface-3')}
        >
          <span className="w-16 font-mono text-[12px] font-semibold" style={{ color: color(i) }}>
            {l.name}
          </span>
          <span className="relative h-3 flex-1 overflow-hidden rounded-full bg-surface-3">
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${served[i] * 100}%`, background: color(i) }} />
          </span>
          <span className="w-16 text-right font-mono text-[11.5px] text-muted">{fmt(served[i] * 100)}%</span>
        </button>
      ))}
    </figure>
  );
}
