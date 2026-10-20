import { Link } from 'react-router';
import { catalog, chapterPath, chapters, getChapter, loadPapers, loadPyqIndex, paperPath, paperShortTitle } from '@/content/catalog';
import { useAsync } from '@/lib/use-async';
import { pct } from '@/lib/utils';
import { PageHeader } from '@/ui/page-header';
import { Card, EmptyState, ProgressBar, SectionHeading, Skeleton } from '@/ui/primitives';
import { type CoverageRow, coverageByPaper, lessonCoverage, readyByChapter, sumCoverage } from './coverage';

const load = () => Promise.all([loadPapers(), loadPyqIndex()]);

const STAGES: { key: keyof CoverageRow; label: string; meaning: string }[] = [
  { key: 'imported', label: 'Imported', meaning: 'In the ledger with its official key.' },
  { key: 'mapped', label: 'Mapped', meaning: 'Tied to a 2027-syllabus chapter.' },
  { key: 'verified', label: 'Verified and explained', meaning: 'Our independently derived answer scores under the official key, with steps, shortcut and traps written.' },
  { key: 'hints', label: 'Hints', meaning: 'A guided hint ladder.' },
  { key: 'variation', label: 'Practice', meaning: 'A generated follow-up question.' },
  { key: 'ready', label: 'Ready', meaning: 'Hints, concept clue, result check and practice all present.' },
];

export function CoveragePage() {
  const data = useAsync(load, 'coverage');
  return (
    <div>
      <PageHeader
        eyebrow="Content ledger"
        title="Coverage ledger"
        description="What is imported, verified, explained and ready to practise, counted from the data in this build. Nothing here is estimated, and a question counts only when the stage is actually present."
      />
      {data.status === 'loading' && <Skeleton className="h-96" />}
      {data.status === 'error' && <EmptyState title="The ledger failed to load">{data.error.message}</EmptyState>}
      {data.status === 'ready' && <Body papers={data.data[0]} index={data.data[1]} />}
    </div>
  );
}

function Body({ papers, index }: { papers: Awaited<ReturnType<typeof loadPapers>>; index: Awaited<ReturnType<typeof loadPyqIndex>> }) {
  const rows = coverageByPaper(papers, index);
  const total = sumCoverage(rows.values());
  const gaps = [...readyByChapter(index)].sort((a, b) => a[1].ready / a[1].solved - b[1].ready / b[1].solved || b[1].solved - a[1].solved);
  const lessons = lessonCoverage(chapters.map((c) => ({ id: c.id, topics: c.topicIndex.length, lessons: c.topicIndex.filter((t) => t.lesson).length })));
  const ordered = [...papers].sort((a, b) => b.year - a.year || (b.set ?? 0) - (a.set ?? 0));
  return (
    <div className="space-y-6">
      <Card>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {STAGES.map((s) => (
            <div key={s.key} title={s.meaning}>
              <dt className="eyebrow">{s.label}</dt>
              <dd className="font-display text-2xl font-semibold text-ink">{total[s.key]}</dd>
              <dd className="text-[11.5px] text-faint">of {total.imported}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[12.5px] text-muted">
          Beginner lessons: {lessons.lessons} of {lessons.topics} topics have one.{' '}
        </p>
        <p className="mt-2 text-[12.5px] text-muted">
          {total.skipped} questions are skipped on purpose (figure-only or unsupported) and {total.disputed} carry a note where our reading of the key differs. Papers 2007 to 2010 are not imported yet; the ledger covers {catalog.memory.paperIds.length} papers.
        </p>
      </Card>

      <section aria-labelledby="by-paper">
        <SectionHeading id="by-paper" title="By paper" />
        <div className="glass overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <caption className="sr-only">Content coverage per official paper</caption>
            <thead>
              <tr className="border-b border-line text-faint">
                <th scope="col" className="px-4 py-2.5 font-medium">Paper</th>
                {STAGES.map((s) => (
                  <th key={s.key} scope="col" className="px-3 py-2.5 text-right font-medium" title={s.meaning}>{s.label}</th>
                ))}
                <th scope="col" className="w-36 px-4 py-2.5 font-medium">Ready</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((p) => {
                const r = rows.get(p.id);
                if (!r) return null;
                return (
                  <tr key={p.id} className="border-b border-line/60 last:border-0">
                    <th scope="row" className="px-4 py-2 font-medium">
                      <Link to={paperPath(p.id)} className="text-ink hover:text-accent">{paperShortTitle(p.id)}</Link>
                    </th>
                    {STAGES.map((s) => (
                      <td key={s.key} className="px-3 py-2 text-right font-mono tabular-nums text-muted">{r[s.key]}</td>
                    ))}
                    <td className="px-4 py-2"><ProgressBar value={pct(r.ready, r.imported)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="by-chapter">
        <SectionHeading id="by-chapter" title="Where the gaps are" />
        <p className="mb-3 text-[13px] text-muted">Chapters with the lowest share of solved questions that are fully practice-ready come first.</p>
        <ul className="grid gap-2 md:grid-cols-2">
          {gaps.map(([id, c]) => (
            <li key={id} className="glass flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
              <Link to={chapterPath(id, 'pyqs')} className="min-w-0 truncate text-ink hover:text-accent">{getChapter(id)?.title ?? id}</Link>
              <span className="shrink-0 font-mono text-[12px] text-muted">{c.ready} / {c.solved}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
