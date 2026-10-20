import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { chapterPath, chapters, getChapter, loadPapers, topicTitles } from '@/content/catalog';
import type { Paper } from '@/content/types';
import { useProgress } from '@/features/progress/store';
import { useAsync } from '@/lib/use-async';
import { cn, pct, plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { PageHeader } from '@/ui/page-header';
import { Card, EmptyState, SectionHeading, Skeleton } from '@/ui/primitives';
import { chapterTrends, type QuestionMeta, practiseNext, slope, type TopicStat, topicStats } from './analytics';
import { loadQuestionMeta } from './meta';

const frequency = new Map(chapters.flatMap((c) => c.topicIndex.map((t) => [t.id, t.frequency] as const)));
const syllabusTopics = chapters.flatMap((c) => c.topicIndex.filter((t) => !t.beyondSyllabus).map((t) => t.id));
/** A trend under a quarter mark a year either way is noise across a dozen papers. */
const FLAT = 0.25;

export function InsightsPage() {
  const data = useAsync(() => Promise.all([loadQuestionMeta(), loadPapers()]), 'insights');
  return (
    <div>
      <PageHeader
        eyebrow="Where the marks are"
        title="Insights"
        description="Your weakest topics from every answer you have given, weighted by how often GATE asks them, and how many marks each chapter carried in each official paper."
      />
      {data.status === 'loading' && <Skeleton className="h-[480px]" />}
      {data.status === 'error' && <EmptyState title="Insights failed to load">{data.error.message}</EmptyState>}
      {data.status === 'ready' && <Body meta={data.data[0]} papers={data.data[1]} />}
    </div>
  );
}

function Body({ meta, papers }: { meta: QuestionMeta[]; papers: Paper[] }) {
  const history = useProgress((s) => s.history);
  const stats = topicStats(history, meta);
  const next = practiseNext(stats, frequency, syllabusTopics, 10);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <WeakTopics stats={stats} />
        <PractiseNext topics={next} tried={stats.length > 0} />
      </div>
      <Trends papers={papers} />
    </div>
  );
}

function WeakTopics({ stats }: { stats: TopicStat[] }) {
  const weak = [...stats].filter((s) => s.wrong > 0).sort((a, b) => b.errorRate - a.errorRate).slice(0, 15);
  return (
    <Card>
      <SectionHeading eyebrow="From your answers" title="Weakest topics" />
      {weak.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <caption className="sr-only">Topics ranked by error rate</caption>
            <thead className="text-[11px] uppercase tracking-wide text-faint">
              <tr>
                <th className="py-2 pr-3 font-medium">Topic</th>
                <th className="py-2 pr-3 text-right font-medium">Answers</th>
                <th className="py-2 pr-3 text-right font-medium">Accuracy</th>
                <th className="py-2 pr-3 text-right font-medium">Still wrong</th>
                <th className="py-2 text-right font-medium">Mean time</th>
              </tr>
            </thead>
            <tbody>
              {weak.map((s) => (
                <tr key={s.topic} className="border-t border-line">
                  <td className="py-2 pr-3">
                    <Link to={chapterPath(s.chapter, 'learn', s.topic)} className="text-ink hover:text-accent">
                      {topicTitles.get(s.topic) ?? s.topic}
                    </Link>
                    <span className="block font-mono text-[10.5px] text-faint">{getChapter(s.chapter)?.title}</span>
                  </td>
                  <td className="py-2 pr-3 text-right font-mono">{s.answers}</td>
                  <td className={cn('py-2 pr-3 text-right font-mono', pct(s.answers - s.wrong, s.answers) < 50 ? 'text-coral' : 'text-ink')}>
                    {pct(s.answers - s.wrong, s.answers)}%
                  </td>
                  <td className="py-2 pr-3 text-right font-mono">{s.stillWrong}</td>
                  <td className="py-2 text-right font-mono">{s.meanSeconds === null ? '–' : `${Math.round(s.meanSeconds)} s`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted">No misses recorded yet. Answer practice questions or PYQs and your weak spots show here.</p>
      )}
    </Card>
  );
}

function PractiseNext({ topics, tried }: { topics: string[]; tried: boolean }) {
  const quiz = `/practice/quiz?${new URLSearchParams({ topics: topics.join(','), n: '10', title: 'Practise next' })}`;
  return (
    <Card className="space-y-3">
      <SectionHeading eyebrow={tried ? 'Weakest first' : 'Most asked first'} title="Practise next" />
      <ol className="space-y-1.5 text-[13px]">
        {topics.map((t, i) => (
          <li key={t} className="flex gap-2">
            <span className="w-5 shrink-0 font-mono text-faint">{i + 1}</span>
            <span className="min-w-0 text-ink">{topicTitles.get(t) ?? t}</span>
          </li>
        ))}
      </ol>
      {topics.length > 0 && (
        <Button variant="primary" size="sm" asChild>
          <Link to={quiz}>
            10 questions on these <ArrowRight />
          </Link>
        </Button>
      )}
    </Card>
  );
}

function Trends({ papers }: { papers: Paper[] }) {
  const { years, trends } = chapterTrends(papers);
  const max = Math.max(1, ...trends.flatMap((t) => Object.values(t.byYear)));
  return (
    <Card>
      <SectionHeading
        eyebrow={`${plural(papers.length, 'official paper')}, ${years[0] ?? ''}–${years.at(-1) ?? ''}`}
        title="Marks per chapter per year"
      />
      <p className="mb-4 text-[13px] text-muted">
        Each cell is the marks that chapter carried in that year's paper, the mean over its sets. Darker means more marks. Chapters run from most to fewest marks per paper.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0.5 text-[12px]">
          <caption className="sr-only">Marks per chapter per GATE year</caption>
          <thead>
            <tr className="text-faint">
              <th className="sticky left-0 bg-surface pr-2 text-left font-medium">Chapter</th>
              {years.map((y) => (
                <th key={y} className="px-1 font-mono font-medium">
                  {String(y).slice(2)}
                </th>
              ))}
              <th className="px-2 text-right font-medium">Mean</th>
              <th className="px-2 text-right font-medium">Share</th>
              <th className="px-2 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {trends.map((t) => {
              const s = slope(t.byYear);
              return (
                <tr key={t.chapter}>
                  <th scope="row" className="sticky left-0 max-w-[220px] truncate bg-surface pr-2 text-left font-normal">
                    <Link to={chapterPath(t.chapter)} className="text-ink hover:text-accent">
                      {getChapter(t.chapter)?.title ?? t.chapter}
                    </Link>
                  </th>
                  {years.map((y) => {
                    const m = t.byYear[y];
                    return (
                      <td
                        key={y}
                        className="min-w-7 rounded-sm text-center font-mono text-[10.5px] text-ink"
                        style={{ background: `color-mix(in oklab, var(--accent) ${Math.round((m / max) * 85)}%, transparent)` }}
                        title={`${y}: ${m} marks`}
                      >
                        {m ? Number(m.toFixed(1)) : ''}
                      </td>
                    );
                  })}
                  <td className="px-2 text-right font-mono">{t.mean.toFixed(1)}</td>
                  <td className="px-2 text-right font-mono">{Math.round(t.share * 100)}%</td>
                  <td className="px-2">
                    {Math.abs(s) < FLAT ? (
                      <Badge tone="neutral">flat</Badge>
                    ) : s > 0 ? (
                      <Badge tone="emerald">
                        <TrendingUp className="size-3" aria-hidden /> rising
                      </Badge>
                    ) : (
                      <Badge tone="amber">
                        <TrendingDown className="size-3" aria-hidden /> falling
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
