import { Link } from 'react-router';
import { catalog, chapterPath, getChapter, loadPapers, paperPath, subjectPath, subjects } from '@/content/catalog';
import type { Paper } from '@/content/types';
import { useAsync } from '@/lib/use-async';
import { plural } from '@/lib/utils';
import { PageHeader } from '@/ui/page-header';
import { Card, EmptyState, SectionHeading, Skeleton } from '@/ui/primitives';
import { marksMatrix, type MarksRow, paperTotal, recentPapers, UNMAPPED } from './decade';

const YEARS = 10;
const label = (p: Paper) => `${String(p.year).slice(2)}${p.set ? `·${p.set}` : ''}`;
const num = (n: number) => (n ? Number(n.toFixed(1)) : '');

export function DecadePage() {
  const all = useAsync(loadPapers, 'papers');
  return (
    <div>
      <PageHeader
        eyebrow="Last ten years"
        title="Decade view"
        description="Every ledgered GATE CSE paper of the last ten years, set by set: how many marks each subject and chapter carried, matched to the 2027 syllabus, with a link into each paper's solved questions."
      />
      {all.status === 'loading' && <Skeleton className="h-96" />}
      {all.status === 'error' && <EmptyState title="The paper ledger failed to load">{all.error.message}</EmptyState>}
      {all.status === 'ready' && <Body papers={recentPapers(all.data, YEARS)} />}
    </div>
  );
}

function Body({ papers }: { papers: Paper[] }) {
  const bySubject = marksMatrix(papers, (q) => q.subject);
  const byChapter = marksMatrix(papers, (q) => q.chapter);
  const marks = papers.reduce((s, p) => s + paperTotal(p), 0);
  return (
    <div className="space-y-6">
      <Card>
        <p className="text-[13.5px] text-muted">
          {plural(papers.length, 'paper')} from {papers[0]?.year} to {papers.at(-1)?.year}, {marks} marks in all. Columns are the year and, where there were sets, the set number. Darker cells carry more marks.
        </p>
      </Card>
      <Matrix title="Marks per subject per paper" eyebrow="Weightage by subject" papers={papers} rows={bySubject} name={subjectName} href={subjectHref} />
      <section aria-label="Chapters by subject" className="space-y-6">
        {subjects.map((s) => {
          const ids = new Set(s.chapters.map((c) => c.id));
          const rows = byChapter.filter((r) => ids.has(r.id));
          const subjectMarks = bySubject.find((r) => r.id === s.id);
          return (
            <Matrix
              key={s.id}
              title={s.title}
              eyebrow={`${s.code} · syllabus weight ${s.weight} · ${subjectMarks ? `${subjectMarks.mean.toFixed(1)} marks per paper in practice` : 'no mapped questions'}`}
              papers={papers}
              rows={rows}
              name={chapterName}
              href={(id) => chapterPath(id)}
              extra={(id) => syllabusCount(id)}
              extraHead="Syllabus items"
            />
          );
        })}
      </section>
      <Card>
        <SectionHeading eyebrow="Open a paper" title="Solved questions by paper" />
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[...papers].reverse().map((p) => {
            const solved = p.questions.filter((q) => q.status === 'solved').length;
            return (
              <li key={p.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[13px]">
                <Link to={paperPath(p.id)} className="font-medium text-ink hover:text-accent">
                  {p.title}
                </Link>
                <span className="font-mono text-[11.5px] text-faint">
                  {solved}/{p.questions.length} solved
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

const subjectName = (id: string) => (id === UNMAPPED ? 'Outside the 2027 syllabus' : (subjects.find((s) => s.id === id)?.title ?? id));
const chapterName = (id: string) => getChapter(id)?.title ?? id;
const subjectHref = (id: string) => (subjects.some((s) => s.id === id) ? subjectPath(id) : null);
const syllabusCount = (chapter: string) => catalog.syllabus.items.filter((i) => i.chapter === chapter).length;

function Matrix({
  title,
  eyebrow,
  papers,
  rows,
  name,
  href,
  extra,
  extraHead,
}: {
  title: string;
  eyebrow: string;
  papers: Paper[];
  rows: MarksRow[];
  name: (id: string) => string;
  href: (id: string) => string | null;
  extra?: (id: string) => number;
  extraHead?: string;
}) {
  const max = Math.max(1, ...rows.flatMap((r) => Object.values(r.byPaper)));
  return (
    <Card>
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0.5 text-[12px]">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="text-faint">
              <th className="sticky left-0 bg-surface pr-2 text-left font-medium">Name</th>
              {papers.map((p) => (
                <th key={p.id} className="px-1 font-mono font-medium" title={p.title}>
                  <Link to={paperPath(p.id)} className="hover:text-accent">
                    {label(p)}
                  </Link>
                </th>
              ))}
              <th className="px-2 text-right font-medium">Total</th>
              <th className="px-2 text-right font-medium">Mean</th>
              <th className="px-2 text-right font-medium">Range</th>
              <th className="px-2 text-right font-medium">Share</th>
              {extraHead && <th className="px-2 text-right font-medium">{extraHead}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const to = href(r.id);
              return (
                <tr key={r.id}>
                  <th scope="row" className="sticky left-0 max-w-[240px] truncate bg-surface pr-2 text-left font-normal">
                    {to ? (
                      <Link to={to} className="text-ink hover:text-accent">
                        {name(r.id)}
                      </Link>
                    ) : (
                      <span className="text-muted">{name(r.id)}</span>
                    )}
                  </th>
                  {papers.map((p) => {
                    const m = r.byPaper[p.id] ?? 0;
                    return (
                      <td
                        key={p.id}
                        className="min-w-7 rounded-sm text-center font-mono text-[10.5px] text-ink"
                        style={{ background: `color-mix(in oklab, var(--accent) ${Math.round((m / max) * 85)}%, transparent)` }}
                        title={`${p.title}: ${m} marks`}
                      >
                        {num(m)}
                      </td>
                    );
                  })}
                  <td className="px-2 text-right font-mono">{r.total}</td>
                  <td className="px-2 text-right font-mono">{r.mean.toFixed(1)}</td>
                  <td className="px-2 text-right font-mono">
                    {r.min}–{r.max}
                  </td>
                  <td className="px-2 text-right font-mono">{Math.round(r.share * 100)}%</td>
                  {extra && <td className="px-2 text-right font-mono">{extra(r.id)}</td>}
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={papers.length + 6} className="py-3 text-faint">
                  No question in these papers is mapped here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
