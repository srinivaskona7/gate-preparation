import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass p-5', className)} {...props} />;
}

export function SectionHeading({ eyebrow, title, action, className, id }: { eyebrow?: string; title: ReactNode; action?: ReactNode; className?: string; id?: string }) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 id={id} className="text-lg font-semibold text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd className={cn('rounded border border-line-strong/70 bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-muted', className)}>
      {children}
    </kbd>
  );
}

export function EmptyState({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('glass flex flex-col items-center gap-2 px-6 py-12 text-center', className)}>
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {children && <div className="max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-3/60', className)} />;
}

export function ProgressRing({ value, size = 56, stroke = 5, label, className }: { value: number; size?: number; stroke?: number; label?: string; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('relative inline-grid place-items-center', className)} style={{ width: size, height: size }} role="img" aria-label={label ?? `${v}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-semibold text-ink" aria-hidden>
        {v}%
      </span>
    </div>
  );
}

export function ProgressBar({ value, className, tone = 'accent' }: { value: number; className?: string; tone?: 'accent' | 'violet' | 'amber' }) {
  const color = { accent: 'bg-accent', violet: 'bg-violet', amber: 'bg-amber' }[tone];
  return (
    <div className={cn('h-1.5 overflow-hidden rounded-full bg-surface-3', className)}>
      <div className={cn('h-full rounded-full transition-[width] duration-700', color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
