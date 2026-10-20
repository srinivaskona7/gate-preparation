import { ExternalLink } from 'lucide-react';
import { loadPapers, paperShortTitle } from '@/content/catalog';
import type { PaperQuestion } from '@/content/types';
import { keyLabel } from '@/features/quiz/scoring';
import { useAsync } from '@/lib/use-async';
import { plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Skeleton } from '@/ui/primitives';

export const usePapers = () => useAsync(loadPapers, 'papers');

/**
 * The ledger's questions for a chapter that are not solved here yet, linked to their GATE
 * Overflow pages so they can be practised before the worked solutions land.
 */
export function MappedQuestions({ chapterId, title }: { chapterId: string; title: string }) {
  const papers = usePapers();
  if (papers.status === 'loading') return <Skeleton className="h-40" />;
  if (papers.status === 'error') return null;
  const open: (PaperQuestion & { paperTitle: string })[] = papers.data.flatMap((p) =>
    p.questions.filter((q) => q.chapter === chapterId && q.status === 'open').map((q) => ({ ...q, paperTitle: p.title })),
  );
  if (!open.length) return null;
  return (
    <section aria-labelledby={`mapped-${chapterId}`} className="mt-8">
      <p className="eyebrow mb-1">From the paper ledger</p>
      <h3 id={`mapped-${chapterId}`} className="mb-1 text-[16px] font-semibold text-ink">
        {title}
      </h3>
      <p className="mb-3 text-[13px] text-muted">
        {plural(open.length, 'official question')} mapped to this chapter, with the official key. Worked solutions are on the way; until
        then each links to its GATE Overflow discussion.
      </p>
      <ul className="glass divide-y divide-line overflow-hidden p-0">
        {open.map((q) => (
          <li key={q.id}>
            <a
              href={q.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-[13px] transition-colors hover:bg-surface-3/40"
            >
              <span className="w-28 font-mono text-[12px] text-muted">{paperShortTitle(q.paper)}</span>
              <span className="w-14 font-mono text-[12px] font-semibold text-accent">
                {q.section === 'GA' ? 'GA ' : 'Q'}
                {q.n}
              </span>
              <Badge tone="neutral">{q.type}</Badge>
              <Badge tone="neutral">{q.marks}M</Badge>
              <span className="font-mono text-[12px] text-faint">Key {keyLabel(q.key)}</span>
              <ExternalLink className="ml-auto size-3.5 text-faint" aria-label="Opens GATE Overflow" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
