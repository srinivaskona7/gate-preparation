import { ArrowRight, CircleDashed, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { catalog, paperPath, paperShortTitle } from '@/content/catalog';
import type { Paper } from '@/content/types';
import { usePapers } from '@/features/pyq/MappedQuestions';
import { pct, plural } from '@/lib/utils';
import { PageHeader } from '@/ui/page-header';
import { EmptyState, ProgressBar, Skeleton } from '@/ui/primitives';

const yearOf = (id: string) => Number(/^gate-cse-(\d{4})/.exec(id)?.[1]);

export function PapersPage() {
  const papers = usePapers();
  const m = catalog.memory;
  const years = [...new Set(m.paperIds.map(yearOf))].sort((a, b) => b - a);
  return (
    <div>
      <PageHeader
        eyebrow="Official GATE CSE papers"
        title="Paper ledger"
        description={`Every official paper from ${years.at(-1)} to ${years[0]}, question by question against the final answer key. ${m.papers} of ${m.paperIds.length} ledgered so far: ${plural(m.ledgerQuestions, 'question')}, ${m.mapped} mapped to a chapter, ${m.solved} solved here with derivations and traps.`}
      />
      {papers.status === 'loading' && <Skeleton className="h-96" />}
      {papers.status === 'error' && <EmptyState title="The paper ledger failed to load">{papers.error.message}</EmptyState>}
      {papers.status === 'ready' && (
        <div className="space-y-6">
          {years.map((year) => (
            <section key={year} aria-labelledby={`year-${year}`} className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)]">
              <h2 id={`year-${year}`} className="font-display text-[22px] font-bold text-ink sm:pt-3">
                {year}
              </h2>
              <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {m.paperIds
                  .filter((id) => yearOf(id) === year)
                  .map((id) => {
                    const paper = papers.data.find((p) => p.id === id);
                    return <li key={id}>{paper ? <PaperCard paper={paper} /> : <PendingPaper id={id} />}</li>;
                  })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function PaperCard({ paper: p }: { paper: Paper }) {
  const count = (s: string) => p.questions.filter((q) => q.status === s).length;
  const solved = count('solved');
  const skipped = count('skipped');
  const marks = p.questions.reduce((s, q) => s + q.marks, 0);
  return (
    <div className="glass flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{p.set ? `Set ${p.set}` : 'Single paper'}</p>
          <Link to={paperPath(p.id)} className="mt-1 block text-[15px] font-semibold text-ink hover:text-accent">
            {p.title}
          </Link>
        </div>
        <a
          href={p.sources.key.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-faint hover:text-accent"
          title={p.sources.key.label}
        >
          Key <ExternalLink className="size-3" aria-hidden />
        </a>
      </div>
      <p className="mt-2 font-mono text-[11.5px] text-muted">
        {plural(p.questions.length, 'question')} · {marks} marks · {solved} solved{skipped ? ` · ${skipped} skipped` : ''}
      </p>
      <ProgressBar value={pct(solved, p.questions.length)} className="mt-3" />
      <Link to={paperPath(p.id)} className="mt-3 inline-flex items-center gap-1 self-start text-[12.5px] font-medium text-accent hover:underline">
        Open the paper <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}

function PendingPaper({ id }: { id: string }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-(--radius-card) border border-dashed border-line px-4 py-4 text-faint">
      <p className="text-[14px] font-medium">GATE CSE {paperShortTitle(id)}</p>
      <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px]">
        <CircleDashed className="size-3.5" aria-hidden /> Not ledgered yet
      </p>
    </div>
  );
}
