import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import type { Difficulty, Frequency, Origin } from '@/content/types';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.06em]',
  {
    variants: {
      tone: {
        neutral: 'border-line-strong/60 text-muted',
        accent: 'border-accent/40 bg-accent/10 text-accent',
        violet: 'border-violet/40 bg-violet/10 text-violet',
        amber: 'border-amber/45 bg-amber/10 text-amber',
        coral: 'border-coral/45 bg-coral/10 text-coral',
        emerald: 'border-emerald/45 bg-emerald/10 text-emerald',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

const FREQ: Record<Frequency, { tone: BadgeTone; label: string; title: string }> = {
  high: { tone: 'coral', label: 'High', title: 'Rated high in the study notes; not a count from the papers' },
  medium: { tone: 'amber', label: 'Medium', title: 'Rated medium in the study notes; not a count from the papers' },
  low: { tone: 'emerald', label: 'Low', title: 'Rated low in the study notes; not a count from the papers' },
};

export function FrequencyBadge({ frequency, className }: { frequency: Frequency; className?: string }) {
  const f = FREQ[frequency];
  return (
    <Badge tone={f.tone} title={f.title} className={className}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {f.label}
      <span className="sr-only"> frequency</span>
    </Badge>
  );
}

const DIFFICULTY_TONE: Record<Difficulty, BadgeTone> = { easy: 'emerald', medium: 'amber', hard: 'coral' };

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge tone={DIFFICULTY_TONE[difficulty]}>{difficulty}</Badge>;
}

/** Where an item came from: a page of the study notes, or added for this site. */
export function OriginBadge({ origin, pages }: { origin: Origin; pages: number[] }) {
  if (origin === 'curated') {
    return (
      <Badge tone="violet" title="Added for this site: a 2027 syllabus gap, a correction or an extra worked example">
        Curated
      </Badge>
    );
  }
  const label = pages.length ? `p. ${pages.slice(0, 3).join(', ')}${pages.length > 3 ? '…' : ''}` : 'Notes';
  return (
    <Badge tone="neutral" title={`Study notes, page${pages.length === 1 ? '' : 's'} ${pages.join(', ')}`}>
      {label}
    </Badge>
  );
}
