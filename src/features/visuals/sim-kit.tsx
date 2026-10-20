import { Pause, Play, RotateCcw, StepBack, StepForward } from 'lucide-react';
import { type ReactNode, useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';

// Shared controls for the step-through simulations in ./sims/.

export interface Stepper {
  index: number;
  count: number;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  go: (index: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  toggle: () => void;
  /** Plays from `index`, which may be a frame the same update is still adding. */
  playFrom: (index: number) => void;
}

/** A cursor over `count` precomputed frames that can also play itself. */
export function useStepper(count: number, intervalMs = 900): Stepper {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = Math.max(0, count - 1);
  const clamped = Math.min(index, last);

  useEffect(() => {
    if (!playing) return;
    if (clamped >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), intervalMs);
    return () => clearTimeout(t);
  }, [playing, clamped, last, intervalMs]);

  return {
    index: clamped,
    count,
    playing,
    atStart: clamped === 0,
    atEnd: clamped >= last,
    go: (i) => setIndex(Math.max(0, Math.min(i, last))),
    next: () => setIndex(Math.min(clamped + 1, last)),
    prev: () => setIndex(Math.max(clamped - 1, 0)),
    reset: () => {
      setPlaying(false);
      setIndex(0);
    },
    // Playing from the last frame starts over rather than doing nothing.
    toggle: () => {
      if (!playing && clamped >= last) setIndex(0);
      setPlaying(!playing);
    },
    // Not clamped here: `last` is still the old count until the new frames render.
    playFrom: (i) => {
      setIndex(Math.max(0, i));
      setPlaying(true);
    },
  };
}

export function StepperBar({ stepper: s, label, className }: { stepper: Stepper; label?: ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} data-print="hide">
      <div className="flex items-center gap-1" role="group" aria-label="Playback">
        <Button variant="ghost" size="icon" className="size-8" onClick={s.reset} disabled={s.atStart && !s.playing} aria-label="Back to the start">
          <RotateCcw />
        </Button>
        <Button variant="ghost" size="icon" className="size-8" onClick={s.prev} disabled={s.atStart} aria-label="Previous step">
          <StepBack />
        </Button>
        <Button variant="primary" size="icon" className="size-8" onClick={s.toggle} disabled={s.count < 2} aria-label={s.playing ? 'Pause' : 'Play'}>
          {s.playing ? <Pause /> : <Play />}
        </Button>
        <Button variant="ghost" size="icon" className="size-8" onClick={s.next} disabled={s.atEnd} aria-label="Next step">
          <StepForward />
        </Button>
      </div>
      <label htmlFor={id} className="sr-only">
        Step
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={Math.max(0, s.count - 1)}
        value={s.index}
        onChange={(e) => s.go(Number(e.target.value))}
        className="h-1 min-w-[120px] flex-1 cursor-pointer accent-[var(--accent)]"
      />
      <span className="font-mono text-[11.5px] text-faint" aria-live="polite">
        {label ?? `Step ${s.index + 1} / ${s.count}`}
      </span>
    </div>
  );
}

/** `context` names what a repeated field belongs to (a level, a row) for screen readers only. */
export function Field({ label, context, hint, children, className }: { label: string; context?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint">
        {context && <span className="sr-only">{context} </span>}
        {label}
      </span>
      {children}
      {hint && <span className="text-[11.5px] text-faint">{hint}</span>}
    </label>
  );
}

const inputClass =
  'h-9 w-full rounded-[10px] border border-line-strong/70 bg-surface-2 px-2.5 font-mono text-[13px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent aria-[invalid=true]:border-coral';

export function TextInput({ value, onChange, invalid, className, ...rest }: { value: string; onChange: (v: string) => void; invalid?: boolean; className?: string; placeholder?: string; inputMode?: 'text' | 'numeric' | 'decimal' }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid || undefined} autoComplete="off" spellCheck={false} className={cn(inputClass, className)} {...rest} />;
}

export function NumberInput({ value, onChange, min, max, step = 1, className }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; className?: string }) {
  // Keep the typed text so a half-typed number ("0.", "") is not snapped back mid-edit.
  const [text, setText] = useState(String(value));
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setText(String(value));
  }
  const parsed = text.trim() === '' ? NaN : Number(text);
  const valid = Number.isFinite(parsed) && (min === undefined || parsed >= min) && (max === undefined || parsed <= max);
  return (
    <input
      type="number"
      inputMode="decimal"
      value={text}
      min={min}
      max={max}
      step={step}
      aria-invalid={!valid || undefined}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value.trim() !== '' && Number.isFinite(n) && (min === undefined || n >= min) && (max === undefined || n <= max)) {
          setSynced(n);
          onChange(n);
        }
      }}
      className={cn(inputClass, className)}
    />
  );
}

export function Select<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: readonly { value: T; label: string }[]; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className={cn(inputClass, 'font-sans', className)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export type Tone = 'accent' | 'violet' | 'amber' | 'coral' | 'emerald' | 'muted';

const TONE_TEXT: Record<Tone, string> = {
  accent: 'text-accent',
  violet: 'text-violet',
  amber: 'text-amber',
  coral: 'text-coral',
  emerald: 'text-emerald',
  muted: 'text-ink',
};

export function Stat({ label, value, tone = 'muted', className }: { label: string; value: ReactNode; tone?: Tone; className?: string }) {
  return (
    <div className={cn('rounded-[12px] border border-line bg-surface-2/60 px-3 py-2.5', className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint">{label}</p>
      <p className={cn('mt-1 font-mono text-[17px] font-semibold leading-none', TONE_TEXT[tone])}>{value}</p>
    </div>
  );
}

/** The one-line explanation of the current frame, read out as it changes. */
export function Narration({ children, tone = 'accent', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <p
      aria-live="polite"
      className={cn(
        'rounded-[10px] border px-3 py-2 text-[13px] leading-relaxed text-ink/90',
        tone === 'coral' ? 'border-coral/40 bg-coral/[0.07]' : tone === 'amber' ? 'border-amber/40 bg-amber/[0.07]' : tone === 'emerald' ? 'border-emerald/40 bg-emerald/[0.07]' : 'border-accent/30 bg-accent/[0.06]',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Legend({ items, className }: { items: { label: string; swatch: string }[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-muted', className)} aria-label="Legend">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: i.swatch }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/** Process or item colours, cycled; all are theme variables so both themes stay legible. */
export const SERIES = ['var(--accent)', 'var(--amber)', 'var(--violet)', 'var(--coral)', 'var(--emerald)', '#60a5fa', '#f472b6', '#a3e635'];
export const seriesColor = (i: number) => SERIES[i % SERIES.length];

/** Parses "98, 183 37" into numbers; null when any token is not a whole number in range. */
export function parseIntList(text: string, min: number, max: number): number[] | null {
  const tokens = text.split(/[\s,]+/).filter(Boolean);
  if (!tokens.length) return null;
  const out: number[] = [];
  for (const t of tokens) {
    if (!/^-?\d+$/.test(t)) return null;
    const n = Number(t);
    if (n < min || n > max) return null;
    out.push(n);
  }
  return out;
}
