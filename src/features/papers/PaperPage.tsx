import { ArrowLeft, ExternalLink, Timer } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { NotFound } from '@/app/RouteStates';
import { catalog, chapterPath, getChapter, paperPath, paperShortTitle } from '@/content/catalog';
import type { Paper, PaperQuestion, PaperQuestionStatus } from '@/content/types';
import { useProgress } from '@/features/progress/store';
import { usePapers } from '@/features/pyq/MappedQuestions';
import { PyqSolverFor } from '@/features/pyq/PyqSolver';
import { keyLabel } from '@/features/quiz/scoring';
import { examMinutes } from '@/features/quiz/selection';
import { useScrollToItem } from '@/lib/use-scroll-to-item';
import { cn, plural } from '@/lib/utils';
import { Badge, type BadgeTone } from '@/ui/badge';
import { Button } from '@/ui/button';
import { PageHeader } from '@/ui/page-header';
import { EmptyState, SectionHeading, Skeleton } from '@/ui/primitives';

const STATUS: Record<PaperQuestionStatus, { label: string; tone: BadgeTone; cell: string }> = {
  solved: { label: 'Solved', tone: 'accent', cell: 'border-accent/60 bg-accent/15 text-accent hover:bg-accent/25' },
  open: { label: 'Key only', tone: 'neutral', cell: 'border-line-strong/70 text-muted hover:border-accent/60 hover:text-ink' },
  skipped: { label: 'Skipped', tone: 'amber', cell: 'border-amber/50 bg-amber/10 text-amber' },
};

const qLabel = (q: Pick<PaperQuestion, 'section' | 'n'>) => `${q.section === 'GA' ? 'GA ' : 'Q'}${q.n}`;

export function PaperPage() {
  const { paperId, pyqId } = useParams();
  const papers = usePapers();
  if (!paperId || !catalog.memory.paperIds.includes(paperId)) return <NotFound />;
  if (papers.status === 'loading') return <Skeleton className="h-[480px]" />;
  if (papers.status === 'error') return <EmptyState title="The paper ledger failed to load">{papers.error.message}</EmptyState>;
  const paper = papers.data.find((p) => p.id === paperId);
  if (!paper) return <Unledgered id={paperId} />;
  if (pyqId && !paper.questions.some((q) => q.id === pyqId)) return <NotFound />;
  return <PaperView paper={paper} pyqId={pyqId} />;
}

function Unledgered({ id }: { id: string }) {
  return (
    <div>
      <PageHeader eyebrow={<BackLink />} title={`GATE CSE ${paperShortTitle(id)}`} />
      <EmptyState title="This paper is not ledgered yet">
        Papers are entered question by question from the official paper and final key, then mapped to chapters. This one is still in the queue.
      </EmptyState>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/papers" className="inline-flex items-center gap-1 hover:text-accent">
      <ArrowLeft className="size-3.5" aria-hidden /> All papers
    </Link>
  );
}

function PaperView({ paper: p, pyqId }: { paper: Paper; pyqId?: string }) {
  const navigate = useNavigate();
  const attempts = useProgress((s) => s.attempts);
  const solved = p.questions.filter((q) => q.status === 'solved');
  const marks = p.questions.reduce((s, q) => s + q.marks, 0);
  const types = (['mcq', 'msq', 'nat'] as const).map((t) => `${p.questions.filter((q) => q.type === t).length} ${t.toUpperCase()}`).join(' · ');
  const selected = solved.find((q) => q.id === pyqId);
  // An unsolved question's link has no solver to open; the row is scrolled to instead.
  useScrollToItem(pyqId && !selected ? `row-${pyqId}` : undefined);

  const open = (id?: string, replace = false) => navigate(id ? `${paperPath(p.id)}/${id}` : paperPath(p.id), { replace, preventScrollReset: true });
  const at = selected ? solved.indexOf(selected) : -1;
  const solvedMarks = solved.reduce((s, q) => s + q.marks, 0);
  const mock = `/practice/quiz?${new URLSearchParams({ source: 'pyq', ids: solved.map((q) => q.id).join(','), mode: 'exam', title: p.title })}`;

  return (
    <div>
      <PageHeader
        eyebrow={<BackLink />}
        title={p.title}
        description={`${plural(p.questions.length, 'question')} · ${marks} marks · ${types}. ${solved.length ? `${solved.length} solved with step-by-step derivations; the rest show the official key and link to GATE Overflow.` : 'Every question shows its official key and links to its GATE Overflow discussion; worked solutions are on the way.'}`}
        actions={
          <>
            {(['key', 'paper', 'index'] as const).map((k) => {
              const s = p.sources[k];
              return (
                s && (
                  <Button key={k} variant="outline" size="sm" asChild>
                    <a href={s.url} target="_blank" rel="noreferrer" title={s.label}>
                      {k === 'key' ? 'Answer key' : k === 'paper' ? 'Question paper' : 'GATE Overflow'} <ExternalLink />
                    </a>
                  </Button>
                )
              );
            })}
            {solved.length > 0 && (
              <Button variant="primary" size="sm" asChild>
                <Link to={mock}>
                  <Timer /> Take the {solved.length === p.questions.length ? 'paper' : `${solved.length} solved`} as a mock · {examMinutes(solvedMarks)} min
                </Link>
              </Button>
            )}
          </>
        }
      />

      <section aria-labelledby="palette-title" className="glass mb-8 p-5">
        <SectionHeading id="palette-title" eyebrow="Question palette" title="The paper at a glance" className="mb-3" />
        {(['GA', 'CS'] as const).map((section) => {
          const list = p.questions.filter((q) => q.section === section);
          return (
            list.length > 0 && (
              <div key={section} className="mb-4 last:mb-0">
                <p id={`palette-${section}`} className="eyebrow mb-2">
                  {section === 'GA' ? 'General aptitude' : 'Computer science'}
                </p>
                <ul aria-labelledby={`palette-${section}`} className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1.5">
                  {list.map((q) => (
                    <li key={q.id}>
                      <PaletteCell q={q} attempt={attempts[q.id]?.correct} onOpen={() => open(q.id)} />
                    </li>
                  ))}
                </ul>
              </div>
            )
          );
        })}
        <ul aria-label="Legend" className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px] text-muted">
          {(Object.keys(STATUS) as PaperQuestionStatus[]).map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className={cn('size-3 rounded-[4px] border', STATUS[s].cell)} aria-hidden />
              {STATUS[s].label} {p.questions.filter((q) => q.status === s).length}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald" aria-hidden /> Your last attempt right
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-coral" aria-hidden /> wrong
          </li>
        </ul>
      </section>

      <QuestionTable paper={p} onOpen={open} />

      <PyqSolverFor
        entry={selected && selected.chapter ? { id: selected.id, chapter: selected.chapter } : undefined}
        open={Boolean(selected)}
        onClose={() => open(undefined)}
        nav={
          at >= 0
            ? {
                index: at,
                total: solved.length,
                prev: at > 0 ? () => open(solved[at - 1].id, true) : undefined,
                next: at < solved.length - 1 ? () => open(solved[at + 1].id, true) : undefined,
              }
            : undefined
        }
      />
    </div>
  );
}

function PaletteCell({ q, attempt, onOpen }: { q: PaperQuestion; attempt?: boolean; onOpen: () => void }) {
  const s = STATUS[q.status];
  const label = `${qLabel(q)}, ${q.type.toUpperCase()}, ${plural(q.marks, 'mark')}, ${s.label}${attempt === undefined ? '' : attempt ? ', last attempt right' : ', last attempt wrong'}`;
  const className = cn('relative flex h-10 w-full items-center justify-center rounded-[8px] border font-mono text-[12px] font-semibold transition-colors', s.cell);
  const dot = attempt !== undefined && (
    <span className={cn('absolute right-1 top-1 size-1.5 rounded-full', attempt ? 'bg-emerald' : 'bg-coral')} aria-hidden />
  );
  if (q.status === 'solved') {
    return (
      <button type="button" onClick={onOpen} className={className} aria-label={label}>
        {q.n}
        {dot}
      </button>
    );
  }
  if (q.status === 'skipped') {
    return (
      <span className={className} role="img" aria-label={label} title={q.note ?? 'Not part of the archive'}>
        {q.n}
        {dot}
      </span>
    );
  }
  return (
    <a href={q.url} target="_blank" rel="noreferrer" className={className} aria-label={`${label}, opens GATE Overflow`} title="Opens the GATE Overflow discussion">
      {q.n}
      {dot}
    </a>
  );
}

function QuestionTable({ paper: p, onOpen }: { paper: Paper; onOpen: (id: string) => void }) {
  return (
    <section aria-labelledby="table-title">
      <SectionHeading id="table-title" eyebrow="Ledger" title="Every question, its key and its chapter" />
      <div className="glass overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <caption className="sr-only">{p.title}: question, type, marks, official key, chapter and status</caption>
          <thead className="border-b border-line font-mono text-[11px] text-faint">
            <tr>
              <th className="px-4 py-2.5 font-medium">Q</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Marks</th>
              <th className="px-4 py-2.5 font-medium">Official key</th>
              <th className="px-4 py-2.5 font-medium">Chapter</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {p.questions.map((q) => {
              const chapter = getChapter(q.chapter ?? undefined);
              return (
                <tr key={q.id} id={`row-${q.id}`} className="scroll-mt-36">
                  <td className="px-4 py-2 font-mono text-[12px] font-semibold text-accent">
                    {q.status === 'solved' ? (
                      <button type="button" onClick={() => onOpen(q.id)} className="hover:underline">
                        {qLabel(q)}
                      </button>
                    ) : (
                      <a href={q.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                        {qLabel(q)} <ExternalLink className="size-3 text-faint" aria-label="opens GATE Overflow" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-[12px] uppercase text-muted">{q.type}</td>
                  <td className="px-4 py-2 font-mono text-[12px] text-muted">{q.marks}</td>
                  <td className="px-4 py-2 font-mono text-[12px] text-ink">{keyLabel(q.key)}</td>
                  <td className="max-w-[320px] px-4 py-2">
                    {chapter ? (
                      <Link to={chapterPath(chapter.id, 'pyqs')} className="block truncate text-ink/90 hover:text-accent" title={q.note}>
                        <span className="font-mono text-[11px] text-faint">{chapter.subject.code}</span> {chapter.title}
                      </Link>
                    ) : (
                      <span className="text-faint" title={q.note}>
                        {q.note ?? 'Not mapped'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Badge tone={STATUS[q.status].tone}>{STATUS[q.status].label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
