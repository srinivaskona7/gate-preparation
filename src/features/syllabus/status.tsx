import type { CoverageStatus } from '@/content/types';
import { Badge, type BadgeTone } from '@/ui/badge';

export type SyllabusStatus = CoverageStatus | 'pending';

const STATUS: Record<SyllabusStatus, { tone: BadgeTone; label: string; title: string }> = {
  covered: { tone: 'accent', label: 'Covered', title: 'The study notes cover this item in full' },
  partial: { tone: 'amber', label: 'Partial', title: 'The notes cover part of this item; curated topics fill the rest' },
  curated: { tone: 'violet', label: 'Curated', title: 'The notes skip this item; it was written for this site' },
  pending: { tone: 'neutral', label: 'In progress', title: 'The chapter for this item is still being written' },
};

export function SyllabusStatusBadge({ status }: { status: SyllabusStatus }) {
  const s = STATUS[status];
  return (
    <Badge tone={s.tone} title={s.title}>
      {s.label}
    </Badge>
  );
}
