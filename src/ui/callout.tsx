import { CircleAlert, Lightbulb, TriangleAlert, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  erratum: { icon: TriangleAlert, box: 'border-amber/40 bg-amber/[0.07]', head: 'text-amber' },
  trap: { icon: CircleAlert, box: 'border-coral/40 bg-coral/[0.07]', head: 'text-coral' },
  shortcut: { icon: Zap, box: 'border-violet/40 bg-violet/[0.07]', head: 'text-violet' },
  note: { icon: Lightbulb, box: 'border-accent/35 bg-accent/[0.06]', head: 'text-accent' },
} as const;

export type CalloutTone = keyof typeof TONES;

export function Callout({ tone, title, children, className }: { tone: CalloutTone; title: ReactNode; children: ReactNode; className?: string }) {
  const t = TONES[tone];
  const Icon = t.icon;
  return (
    <div className={cn('rounded-[12px] border px-4 py-3', t.box, className)}>
      <p className={cn('mb-1 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em]', t.head)}>
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {title}
      </p>
      <div className="text-[13.5px] leading-relaxed text-ink/90">{children}</div>
    </div>
  );
}
