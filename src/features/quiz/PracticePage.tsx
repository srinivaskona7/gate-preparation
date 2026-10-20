import { Play, RotateCcw, Timer, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { catalog, type ChapterEntry, chapters, loadPyqIndex, loadQuestions, subjects } from '@/content/catalog';
import type { QuestionType } from '@/content/types';
import { useProgress } from '@/features/progress/store';
import { useAsync } from '@/lib/use-async';
import { cn, formatClock, formatMarks, plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { PageHeader } from '@/ui/page-header';
import { Card, EmptyState, SectionHeading, Skeleton } from '@/ui/primitives';
import { Segmented } from '@/ui/segmented';
import {
  type Drawable,
  examMinutes,
  isPyqId,
  newSeed,
  type QuizMode,
  type QuizSource,
  type QuizSpec,
  selectQuestions,
  specParams,
} from './selection';

const SOURCE_OPTIONS = [
  { value: 'practice', label: 'Chapter banks' },
  { value: 'pyq', label: 'Official PYQs' },
] as const;
const MODE_OPTIONS = [
  { value: 'practice', label: 'Practice', title: 'Check each answer as you go' },
  { value: 'exam', label: 'Timed test', title: "GATE's clock and marking, scored at the end" },
] as const;
const COUNT_OPTIONS = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
  { value: '65', label: '65' },
  { value: 'all', label: 'All' },
] as const;
type Count = (typeof COUNT_OPTIONS)[number]['value'];
const ALL_TYPES: readonly QuestionType[] = ['mcq', 'msq', 'nat'];
const RETRY_LIMIT = 30;

/** How many questions a chapter offers to each source. */
const bankSize = (c: ChapterEntry, source: QuizSource) => (source === 'pyq' ? c.memory.pyqs : c.status === 'ready' ? (c.stats?.questions ?? 0) : 0);

const quizHref = (spec: Partial<QuizSpec> & Pick<QuizSpec, 'mode'>, title?: string) => {
  const p = specParams({ source: 'practice', chapters: [], topics: [], ids: [], types: [], n: null, seed: null, ...spec });
  if (title) p.set('title', title);
  return `/practice/quiz?${p}`;
};

export function PracticePage() {
  const navigate = useNavigate();
  const [source, setSource] = useState<QuizSource>('practice');
  const [mode, setMode] = useState<QuizMode>('practice');
  const [count, setCount] = useState<Count>('10');
  const [types, setTypes] = useState<QuestionType[]>([...ALL_TYPES]);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  // Fixed for the visit, so the summary describes exactly the set that Start opens.
  const [seed] = useState(newSeed);

  const eligible = chapters.filter((c) => bankSize(c, source) > 0);
  const chosen = eligible.filter((c) => picked.has(c.id)).map((c) => c.id);
  const spec: QuizSpec = {
    source,
    // Every chapter ticked is the same quiz as none ticked; the shorter URL wins.
    chapters: chosen.length === eligible.length ? [] : chosen,
    topics: [],
    ids: [],
    types: types.length === ALL_TYPES.length ? [] : types,
    n: count === 'all' ? null : Number(count),
    mode,
    seed,
  };
  const pool = useAsync<Drawable[]>(() => (source === 'pyq' ? loadPyqIndex() : loadQuestions()), `builder-pool:${source}`);
  const draw = pool.status === 'ready' && types.length ? selectQuestions(pool.data, spec, seed) : [];
  const matches = pool.status === 'ready' && types.length ? selectQuestions(pool.data, { ...spec, n: null }, seed).length : 0;
  const marks = draw.reduce((s, q) => s + q.marks, 0);

  const toggle = (ids: string[], on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  return (
    <div>
      <PageHeader
        eyebrow="Practice & mocks"
        title="Build a quiz"
        description="Draw from the chapter question banks or the solved official papers. Practice mode checks each answer as you go; a timed test runs on GATE's clock and marking: a third of the marks off for a wrong MCQ, no partial credit on an MSQ, no penalty on a NAT."
      />

      <QuickStart />

      <section aria-labelledby="builder-title" className="mt-10">
        <SectionHeading id="builder-title" eyebrow="Custom" title="Choose what to practise" />
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <Segmented<QuizSource> label="Question source" value={source} onChange={setSource} options={SOURCE_OPTIONS} />
              {eligible.length > 0 && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggle(eligible.map((c) => c.id), true)}>
                    Select all
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setPicked(new Set())} disabled={!chosen.length}>
                    Clear
                  </Button>
                </div>
              )}
            </div>
            {eligible.length ? (
              <ChapterPicker eligible={eligible} source={source} picked={picked} onToggle={toggle} />
            ) : (
              <EmptyState title="No official PYQ is solved yet" className="m-5">
                Solved questions join this bank chapter by chapter, each with its derivation and traps. Until then the{' '}
                <Link to="/papers" className="text-accent hover:underline">
                  paper ledger
                </Link>{' '}
                links every mapped question to its GATE Overflow page, and the chapter banks are ready to practise.
              </EmptyState>
            )}
          </Card>

          <Card className="space-y-5 lg:sticky lg:top-24">
            <div>
              <p className="eyebrow mb-2">Mode</p>
              <Segmented<QuizMode> label="Mode" value={mode} onChange={setMode} options={MODE_OPTIONS} />
            </div>
            <div>
              <p className="eyebrow mb-2">Questions</p>
              <Segmented<Count> label="Number of questions" size="xs" value={count} onChange={setCount} options={COUNT_OPTIONS} />
            </div>
            <fieldset>
              <legend className="eyebrow mb-2">Types</legend>
              <div className="flex gap-2">
                {ALL_TYPES.map((t) => (
                  <label
                    key={t}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-1.5 font-mono text-[12px] uppercase transition-colors',
                      types.includes(t) ? 'border-accent/50 text-ink' : 'border-line text-faint',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="accent-accent"
                      checked={types.includes(t)}
                      onChange={(e) => setTypes((ts) => (e.target.checked ? ALL_TYPES.filter((x) => x === t || ts.includes(x)) : ts.filter((x) => x !== t)))}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="rounded-[12px] border border-line bg-surface-2/60 px-4 py-3" aria-live="polite">
              {pool.status === 'loading' ? (
                <Skeleton className="h-10" />
              ) : pool.status === 'error' ? (
                <p className="text-[13px] text-coral">The question bank failed to load: {pool.error.message}</p>
              ) : (
                <>
                  <p className="font-display text-[22px] font-bold leading-tight text-ink">
                    {plural(draw.length, 'question')}
                    <span className="text-[14px] font-medium text-faint"> · {plural(marks, 'mark')}</span>
                  </p>
                  <p className="mt-1 font-mono text-[11.5px] text-muted">
                    {types.length ? `${plural(matches, 'question')} match` : 'Pick at least one type'}
                    {chosen.length && chosen.length < eligible.length ? ` in ${plural(chosen.length, 'chapter')}` : ' across every chapter'}
                  </p>
                  <p className="mt-1 font-mono text-[11.5px] text-muted">
                    {mode === 'exam' ? `${examMinutes(marks)} minutes on the clock, 1.8 a mark` : 'Untimed, each answer checked when you ask'}
                  </p>
                </>
              )}
            </div>
            <Button variant="primary" size="lg" className="w-full" disabled={!draw.length} onClick={() => navigate(`/practice/quiz?${specParams(spec)}`)}>
              {mode === 'exam' ? <Timer /> : <Play />} {mode === 'exam' ? 'Start the timed test' : 'Start practising'}
            </Button>
          </Card>
        </div>
      </section>

      <QuizHistory />
    </div>
  );
}

function ChapterPicker({
  eligible,
  source,
  picked,
  onToggle,
}: {
  eligible: ChapterEntry[];
  source: QuizSource;
  picked: ReadonlySet<string>;
  onToggle: (ids: string[], on: boolean) => void;
}) {
  return (
    <div className="divide-y divide-line">
      {subjects.map((s) => {
        const list = eligible.filter((c) => c.subject.id === s.id);
        if (!list.length) return null;
        const ids = list.map((c) => c.id);
        const on = ids.filter((id) => picked.has(id)).length;
        return (
          <fieldset key={s.id} className="px-5 py-4">
            <legend className="sr-only">{s.title}</legend>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="accent-accent"
                checked={on === ids.length}
                ref={(el) => {
                  if (el) el.indeterminate = on > 0 && on < ids.length;
                }}
                onChange={(e) => onToggle(ids, e.target.checked)}
                aria-label={`Every ${s.title} chapter`}
              />
              <span className="font-mono text-[11px] font-semibold text-accent">{s.code}</span>
              <span className="text-[14px] font-semibold text-ink">{s.title}</span>
              <span className="ml-auto font-mono text-[11px] text-faint">{list.reduce((n, c) => n + bankSize(c, source), 0)}</span>
            </label>
            <ul className="mt-2 grid gap-1 pl-7 sm:grid-cols-2">
              {list.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-muted hover:bg-surface-3/40 hover:text-ink">
                    <input type="checkbox" className="accent-accent" checked={picked.has(c.id)} onChange={(e) => onToggle([c.id], e.target.checked)} />
                    <span className="min-w-0 flex-1 truncate">{c.title}</span>
                    <span className="font-mono text-[11px] text-faint">{bankSize(c, source)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        );
      })}
    </div>
  );
}

function QuickStart() {
  const attempts = useProgress((s) => s.attempts);
  const wrong = Object.entries(attempts)
    .filter(([, a]) => !a.correct)
    .sort(([, a], [, b]) => b.at - a.at)
    .map(([id]) => id);
  const wrongPractice = wrong.filter((id) => !isPyqId(id)).slice(0, RETRY_LIMIT);
  const wrongPyqs = wrong.filter(isPyqId).slice(0, RETRY_LIMIT);
  const presets = [
    {
      title: 'Mixed mock',
      body: "30 questions from every ready chapter, on GATE's clock and marking.",
      href: quizHref({ n: 30, mode: 'exam' }, 'Mixed mock'),
      icon: Timer,
      cta: 'Start the mock',
    },
    {
      title: 'Quick ten',
      body: 'Ten questions from anywhere, each checked as you answer it.',
      href: quizHref({ n: 10, mode: 'practice' }, 'Quick ten'),
      icon: Zap,
      cta: 'Start',
    },
  ];
  return (
    <section aria-labelledby="quick-title">
      <SectionHeading id="quick-title" eyebrow="One click" title="Quick start" />
      <ul className="grid gap-4 md:grid-cols-3">
        {presets.map((p) => (
          <li key={p.title}>
            <Card className="flex h-full flex-col">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <p.icon className="size-4 text-accent" aria-hidden /> {p.title}
              </p>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted">{p.body}</p>
              <Button variant="secondary" size="sm" className="mt-4 self-start" asChild>
                <Link to={p.href}>{p.cta}</Link>
              </Button>
            </Card>
          </li>
        ))}
        <li>
          <Card className="flex h-full flex-col">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <RotateCcw className="size-4 text-coral" aria-hidden /> Retry what you got wrong
            </p>
            <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted">
              {wrong.length
                ? `Your most recent wrong answers, up to ${RETRY_LIMIT} at a time, in practice mode.`
                : 'Questions you answer wrongly anywhere on the site collect here for another go.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {wrongPractice.length > 0 && (
                <Button variant="secondary" size="sm" asChild>
                  <Link to={quizHref({ ids: wrongPractice, mode: 'practice' }, 'Retry · wrong answers')}>{plural(wrongPractice.length, 'bank question')}</Link>
                </Button>
              )}
              {wrongPyqs.length > 0 && (
                <Button variant="secondary" size="sm" asChild>
                  <Link to={quizHref({ source: 'pyq', ids: wrongPyqs, mode: 'practice' }, 'Retry · wrong PYQs')}>{plural(wrongPyqs.length, 'PYQ')}</Link>
                </Button>
              )}
              {!wrong.length && (
                <Button variant="secondary" size="sm" disabled>
                  Nothing to retry
                </Button>
              )}
            </div>
          </Card>
        </li>
      </ul>
      {catalog.memory.solved === 0 && (
        <p className="mt-3 font-mono text-[11.5px] text-faint">
          Official PYQs join the quiz bank as their chapters are solved; {catalog.memory.mapped} are already mapped in the paper ledger.
        </p>
      )}
    </section>
  );
}

function QuizHistory() {
  const quizzes = useProgress((s) => s.quizzes);
  return (
    <section aria-labelledby="history-title" className="mt-10">
      <SectionHeading id="history-title" eyebrow="History" title="Your quizzes" />
      {quizzes.length ? (
        <div className="glass overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <caption className="sr-only">Finished quizzes, newest first</caption>
            <thead className="border-b border-line font-mono text-[11px] text-faint">
              <tr>
                <th className="px-4 py-2.5 font-medium">Quiz</th>
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 font-medium">Score</th>
                <th className="px-4 py-2.5 font-medium">Right · wrong · blank</th>
                <th className="px-4 py-2.5 font-medium">Time</th>
                <th className="px-4 py-2.5">
                  <span className="sr-only">Retake</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {quizzes.map((q) => (
                <tr key={q.id}>
                  <td className="max-w-[280px] px-4 py-2.5">
                    <span className="block truncate font-medium text-ink">{q.title}</span>
                    <Badge tone={q.mode === 'exam' ? 'coral' : 'accent'} className="mt-1">
                      {q.mode === 'exam' ? 'Timed' : 'Practice'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-muted">
                    {new Date(q.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[13px] font-semibold text-ink">
                    {formatMarks(q.net)}
                    <span className="font-normal text-faint"> / {q.max}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-muted">
                    <span className="text-emerald">{q.correct}</span> · <span className="text-coral">{q.wrong}</span> · {q.unanswered}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-muted">{formatClock(q.seconds)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={q.href} aria-label={`Retake ${q.title}`}>
                        <RotateCcw /> Retake
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No quiz finished yet">Each quiz you finish is kept here with its score and a link to retake the same set.</EmptyState>
      )}
    </section>
  );
}
