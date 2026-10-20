import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { TreeScene } from '@/ui/3d/tree-scene';
import type { TreeTone } from '@/ui/3d/tree-world';
import { Button } from '@/ui/button';
import { buildFrames, edgeHeight, type FrameKind, layout, maxHeight, type Op, type PlacedNode } from '../logic/avl';
import { Field, Narration, Select, Stat, StepperBar, TextInput, type Tone, parseIntList, useStepper } from '../sim-kit';
import type { VisualProps } from '../registry';

const MAX_KEYS = 31;
const KEY_RANGE = 999;

const ins = (...keys: number[]): Op[] => keys.map((key) => ({ type: 'insert', key }));

type PresetId = 'ascending' | 'double' | 'cascade';
const PRESETS: Record<PresetId, { label: string; ops: Op[]; fromLastOp: boolean }> = {
  ascending: { label: 'Insert 1 to 7 in order: four RR rotations', ops: ins(1, 2, 3, 4, 5, 6, 7), fromLastOp: false },
  double: { label: 'Insert 30, 10, 20, 40, 35: an LR, then an RL', ops: ins(30, 10, 20, 40, 35), fromLastOp: false },
  cascade: {
    label: 'Delete 24 from a 12-key tree: two rotations',
    ops: [...ins(31, 16, 24, 12, 18, 8, 30, 35, 17, 39, 10, 7), { type: 'delete', key: 24 }],
    fromLastOp: true,
  },
};
const PRESET_OPTIONS = (Object.keys(PRESETS) as PresetId[]).map((value) => ({ value, label: PRESETS[value].label }));

const OP_START: FrameKind[] = ['insert', 'delete', 'skip'];
const SCENE_TONE: Partial<Record<FrameKind, TreeTone>> = { imbalance: 'coral', rotate: 'violet' };
const NOTE_TONE: Partial<Record<FrameKind, Tone>> = { imbalance: 'coral', skip: 'amber' };

/** Screen-reader text: the tree level by level. */
function describe(nodes: PlacedNode[]) {
  if (!nodes.length) return 'An empty AVL tree.';
  const levels: number[][] = [];
  for (const n of nodes) (levels[n.depth] ??= []).push(n.key);
  return `AVL tree with ${nodes.length} keys, level by level: ${levels.map((l) => l.join(', ')).join('; ')}.`;
}

export default function AvlTreeSim({ compact }: VisualProps) {
  const [ops, setOps] = useState<Op[]>(PRESETS.double.ops);
  const [text, setText] = useState('');
  const frames = useMemo(() => buildFrames(ops), [ops]);
  const stepper = useStepper(frames.length, 1100);
  const frame = frames[stepper.index];
  const nodes = useMemo(() => layout(frame.tree), [frame]);
  const keys = layout(frames[frames.length - 1].tree).length;
  const opStarts = useMemo(() => frames.flatMap((f, i) => (OP_START.includes(f.kind) ? [i] : [])), [frames]);
  const currentOp = opStarts.findLastIndex((i) => i <= stepper.index);
  const rotations = frames.slice(0, stepper.index + 1).filter((f) => f.kind === 'rotate').length;
  const parsed = text.trim() ? parseIntList(text, -KEY_RANGE, KEY_RANGE) : null;
  const invalid = text.trim() !== '' && !parsed;

  const label = describe(nodes);
  const tone = SCENE_TONE[frame.kind] ?? 'accent';

  const run = (next: Op[]) => {
    const first = frames.length;
    setOps([...ops, ...next]);
    setText('');
    stepper.playFrom(first);
  };
  const load = (id: PresetId) => {
    const preset = PRESETS[id];
    setOps(preset.ops);
    const opFrames = buildFrames(preset.ops.slice(0, -1)).length;
    stepper.playFrom(preset.fromLastOp ? opFrames : 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Keys" hint={invalid ? `Whole numbers from −${KEY_RANGE} to ${KEY_RANGE}, separated by commas or spaces` : undefined} className="w-44">
          <TextInput value={text} onChange={setText} invalid={invalid} placeholder="e.g. 50, 20, 70" inputMode="text" />
        </Field>
        {/* One group, so a narrow screen never splits Insert from Delete. */}
        <div className="flex gap-2">
          <Button size="sm" variant="primary" className="h-9" disabled={!parsed || keys >= MAX_KEYS} onClick={() => parsed && run(ins(...parsed.slice(0, MAX_KEYS - keys)))}>
            Insert
          </Button>
          <Button size="sm" variant="outline" className="h-9" disabled={!parsed || keys === 0} onClick={() => parsed && run(parsed.map((key) => ({ type: 'delete', key })))}>
            Delete
          </Button>
        </div>
        <Field label="Example" className="min-w-44 flex-1 sm:max-w-80">
          <Select<PresetId | ''> value="" onChange={(v) => v && load(v)} options={[{ value: '', label: 'Load an example…' }, ...PRESET_OPTIONS]} />
        </Field>
        <Button
          size="sm"
          variant="ghost"
          className="h-9"
          disabled={!ops.length}
          onClick={() => {
            setOps([]);
            stepper.reset();
          }}
        >
          Clear
        </Button>
      </div>
      {keys >= MAX_KEYS && <p className="-mt-2 text-[12px] text-amber">The tree holds {MAX_KEYS} keys at most here; delete some to insert more.</p>}

      <TreeScene
        nodes={nodes}
        focus={frame.focus}
        tone={tone}
        label={label}
        fallback={<TreeSvg nodes={nodes} focus={frame.focus} tone={tone} label={label} />}
        className={compact ? 'h-[280px]' : 'h-[360px]'}
      />
      <Narration tone={NOTE_TONE[frame.kind] ?? 'accent'}>{frame.note}</Narration>
      <StepperBar stepper={stepper} label={`Step ${stepper.index} / ${frames.length - 1}`} />

      <div className={cn('grid gap-2', compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')}>
        <Stat label="Keys" value={nodes.length} />
        <Stat label="Height" value={edgeHeight(frame.tree)} tone="accent" />
        <Stat label="Worst case for n" value={nodes.length ? maxHeight(nodes.length) : '–'} tone="amber" />
        {!compact && <Stat label="Rotations so far" value={rotations} tone="violet" />}
      </div>
      <p className="text-[12px] leading-relaxed text-faint">
        Balance = height(left) − height(right), with height counted in edges: a leaf is 0 and an empty subtree −1. The worst case is the tallest AVL
        tree n keys can form, the largest h with N(h) ≤ n, where N(h) = N(h − 1) + N(h − 2) + 1.
      </p>

      {!compact && opStarts.length > 0 && (
        <ol aria-label="Operations" className="flex flex-wrap gap-1.5">
          {opStarts.map((start, k) => {
            const op = ops[k];
            return (
              <li key={start}>
                <button
                  type="button"
                  onClick={() => stepper.go(start)}
                  aria-current={k === currentOp ? 'step' : undefined}
                  className={cn(
                    'rounded-md border px-2 py-1 font-mono text-[11.5px] transition-colors',
                    k === currentOp ? 'border-accent/60 bg-accent/15 text-accent' : 'border-line text-muted hover:border-line-strong hover:text-ink',
                    frames[start].kind === 'skip' && 'line-through decoration-amber/70',
                  )}
                >
                  {op.type === 'insert' ? '+' : '−'}
                  {op.key}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

const COL = 44;
const ROW = 62;
const R = 16;
const TONE_VAR: Record<TreeTone, string> = { accent: 'var(--accent)', coral: 'var(--coral)', violet: 'var(--violet)' };
const BADGE_VAR = (b: number) => (b === 0 ? 'var(--emerald)' : Math.abs(b) === 1 ? 'var(--amber)' : 'var(--coral)');

/** The same tree in 2D, for browsers without WebGL 2. */
function TreeSvg({ nodes, focus, tone, label }: { nodes: PlacedNode[]; focus: readonly number[]; tone: TreeTone; label: string }) {
  const at = new Map(nodes.map((n) => [n.key, { x: n.x * COL + COL / 2 + 8, y: n.depth * ROW + R + 18 }]));
  const depth = nodes.reduce((m, n) => Math.max(m, n.depth), 0);
  const width = Math.max(nodes.length, 3) * COL + 16;
  const height = depth * ROW + R * 2 + 30;
  return (
    <div className="overflow-x-auto rounded-[12px] border border-line bg-surface-2/40 p-2">
      <svg role="img" aria-label={label} viewBox={`0 0 ${width} ${height}`} className="mx-auto block h-auto max-h-[360px]" style={{ width: Math.min(width * 1.4, 1100) }}>
        {nodes.map((n) => {
          const a = n.parent === null ? undefined : at.get(n.parent);
          const b = at.get(n.key);
          return a && b ? <line key={`e${n.key}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--line-strong)" strokeWidth={1.5} /> : null;
        })}
        {nodes.map((n) => {
          const p = at.get(n.key);
          if (!p) return null;
          const lit = focus.includes(n.key);
          return (
            <g key={n.key}>
              <circle cx={p.x} cy={p.y} r={R} fill={lit ? TONE_VAR[tone] : 'var(--surface-3)'} stroke={lit ? TONE_VAR[tone] : 'var(--line-strong)'} />
              <text x={p.x} y={p.y} dy="0.35em" textAnchor="middle" className="font-mono text-[11px] font-semibold" fill={lit ? 'var(--surface)' : 'var(--ink)'}>
                {n.key}
              </text>
              <text x={p.x + R} y={p.y - R + 2} textAnchor="start" className="font-mono text-[9.5px] font-semibold" fill={BADGE_VAR(n.balance)}>
                {n.balance > 0 ? `+${n.balance}` : n.balance < 0 ? `−${-n.balance}` : '0'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}