import { CircleCheck, CircleMinus, CircleX, Clock, RefreshCw, RotateCcw, Shuffle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { cn, formatClock, formatMarks, pct, plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { DocTitle } from '@/ui/page-header';
import { Card, EmptyState, ProgressRing, SectionHeading } from '@/ui/primitives';
import { Segmented } from '@/ui/segmented';
import { AnswerInput } from './AnswerInput';
import { isPyq, type QuizItem } from './pool';
import { QuestionStem } from './QuestionStem';
import { Explanation } from './Explanation';
import { ResultBanner } from './ResultBanner';
import { isAnswered, type Response, scoreQuestion, type Summary } from './scoring';
import type { QuizMode } from './selection';

export interface QuizOutcome {
  summary: Summary;
  seconds: number;
}

type ReviewFilter = 'all' | 'wrong' | 'blank' | 'right';

const REVIEW_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'wrong', label: 'Wrong' },
  { value: 'blank', label: 'Unanswered' },
  { value: 'right', label: 'Right' },
] as const;

const verdict = (q: QuizItem, r: Response | undefined): Exclude<ReviewFilter, 'all'> => {
  const score = scoreQuestion(q, r);
  if (score > 0) return 'right';
  return isAnswered(r) ? 'wrong' : 'blank';
};

/** The scorecard after a quiz, then every question again with the key and the worked answer. */
export function QuizResults({
  title,
  questions,
  responses,
  outcome: { summary: s, seconds },
  mode,
  onRetake,
  onNewDraw,
}: {
  title: string;
  questions: QuizItem[];
  responses: Record<string, Response>;
  outcome: QuizOutcome;
  mode: QuizMode;
  onRetake: () => void;
  onNewDraw?: () => void;
}) {
  const [filter, setFilter] = useState<ReviewFilter>(s.wrong ? 'wrong' : 'all');
  const shown = questions.filter((q) => filter === 'all' || verdict(q, responses[q.id]) === filter);
  const scorePct = Math.max(0, pct(s.net, s.max));
  return (
    <div>
      <DocTitle>{`Results · ${title}`}</DocTitle>
      <SectionHeading
        eyebrow={`${mode === 'exam' ? 'Timed paper' : 'Practice'} · submitted`}
        title="Results"
        action={
          <div className="flex flex-wrap justify-end gap-2">
            {onNewDraw && (
              <Button variant="primary" size="sm" onClick={onNewDraw}>
                <Shuffle /> New questions
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onRetake}>
              <RotateCcw /> Retake this set
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/practice">
                <RefreshCw /> Build another quiz
              </Link>
            </Button>
          </div>
        }
      />

      <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]" aria-label="Score">
        <Card className="flex items-center gap-6 p-6">
          <ProgressRing value={scorePct} size={108} stroke={8} label={`${scorePct}% of the maximum`} />
          <div>
            <p className="eyebrow">Net score, GATE marking</p>
            <p className="mt-1 font-display text-[40px] font-bold leading-none text-ink">
              {formatMarks(s.net)}
              <span className="text-[20px] text-faint"> / {s.max}</span>
            </p>
            <p className="mt-2 font-mono text-[12px] text-muted">
              +{formatMarks(s.positive)} earned
              {s.negative < 0 && <span className="text-coral"> · −{formatMarks(-s.negative)} negative</span>}
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-[12px] text-faint">
              <Clock className="size-3.5" aria-hidden /> {formatClock(seconds)}
              {questions.length > 0 && ` · ${formatClock(seconds / questions.length)} a question`}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <ul className="grid grid-cols-3 gap-3">
            {[
              { label: 'Right', value: s.correct, icon: CircleCheck, tone: 'text-emerald' },
              { label: 'Wrong', value: s.wrong, icon: CircleX, tone: 'text-coral' },
              { label: 'Unanswered', value: s.unanswered, icon: CircleMinus, tone: 'text-faint' },
            ].map((t) => (
              <li key={t.label} className="rounded-[12px] border border-line bg-surface-2/60 px-4 py-3">
                <t.icon className={cn('size-4', t.tone)} aria-hidden />
                <p className="mt-2 font-display text-[26px] font-bold leading-none text-ink">{t.value}</p>
                <p className="mt-1 font-mono text-[11px] text-faint">{t.label}</p>
              </li>
            ))}
          </ul>
          <table className="mt-4 w-full text-left font-mono text-[12px]">
            <caption className="sr-only">Right answers by question type</caption>
            <thead className="text-faint">
              <tr>
                <th className="py-1 font-medium">Type</th>
                <th className="py-1 font-medium">Right</th>
                <th className="py-1 font-medium">Rule</th>
              </tr>
            </thead>
            <tbody className="text-ink">
              {(['mcq', 'msq', 'nat'] as const)
                .filter((t) => s.byType[t].total)
                .map((t) => (
                  <tr key={t} className="border-t border-line">
                    <td className="py-1.5 uppercase">{t}</td>
                    <td className="py-1.5">
                      {s.byType[t].correct} / {s.byType[t].total}
                    </td>
                    <td className="py-1.5 text-muted">{t === 'mcq' ? 'wrong costs a third' : t === 'msq' ? 'exact set, no partial' : 'in range, no penalty'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      </section>

      <SectionHeading
        eyebrow="Review"
        title="Every question with its key"
        action={<Segmented<ReviewFilter> label="Show" size="xs" value={filter} onChange={setFilter} options={REVIEW_OPTIONS} />}
      />
      {shown.length ? (
        <ol className="space-y-5">
          {shown.map((q) => {
            const n = questions.indexOf(q) + 1;
            const pyq = isPyq(q) ? q : undefined;
            return (
              <li key={q.id}>
                <article aria-label={`Question ${n}`} className="glass space-y-5 p-5 sm:p-6">
                  <header className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold text-ink">Q {n}</span>
                    <Badge tone="accent">{q.type}</Badge>
                    <Badge tone="neutral">{plural(q.marks, 'mark')}</Badge>
                    {pyq && (
                      <span className="font-mono text-[11px] text-faint">
                        {pyq.paperTitle} · {pyq.section === 'GA' ? 'GA ' : 'Q'}
                        {pyq.n}
                      </span>
                    )}
                  </header>
                  <QuestionStem id={pyq?.id} stem={q.stem} code={pyq?.code} table={pyq?.table} figure={pyq?.figure} diagram={pyq?.diagram} />
                  <AnswerInput
                    question={q}
                    response={responses[q.id]}
                    onChange={() => undefined}
                    locked
                    reveal
                    trapFor={pyq ? (i) => pyq.solution.traps.find((t) => t.option === i)?.text : undefined}
                  />
                  <ResultBanner question={q} response={responses[q.id]} />
                  <Explanation question={q} />
                </article>
              </li>
            );
          })}
        </ol>
      ) : (
        <EmptyState title={filter === 'wrong' ? 'Nothing wrong' : filter === 'blank' ? 'Every question answered' : 'No question here'} />
      )}
    </div>
  );
}
