import { Bookmark, ChevronLeft, ChevronRight, Clock, Eraser, FileCheck, Flag } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useBlocker } from 'react-router';
import { useProgress } from '@/features/progress/store';
import { useNow } from '@/lib/use-now';
import { cn, formatClock, plural } from '@/lib/utils';
import { Badge, DifficultyBadge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { ConfirmDialog } from '@/ui/confirm-dialog';
import { Card } from '@/ui/primitives';
import { AnswerInput } from './AnswerInput';
import { CalculatorToggle } from './calculator/Calculator';
import { Explanation } from './Explanation';
import { CELL_LABEL, type CellState, cellState, tally } from './palette';
import { isPyq, type QuizItem } from './pool';
import { QuestionStem } from './QuestionStem';
import { ResultBanner } from './ResultBanner';
import { type QuizOutcome, QuizResults } from './QuizResults';
import { isAnswered, isCorrect, type Response, summarize } from './scoring';
import { examMinutes, type QuizMode } from './selection';

const CELL_STYLE: Record<CellState, string> = {
  'not-visited': 'border-line text-faint',
  'not-answered': 'border-coral/50 bg-coral/10 text-coral',
  answered: 'border-emerald/50 bg-emerald/10 text-emerald',
  marked: 'border-violet/50 bg-violet/10 text-violet',
  'answered-marked': 'border-violet/50 bg-violet/10 text-violet',
  correct: 'border-emerald/50 bg-emerald/15 text-emerald',
  wrong: 'border-coral/50 bg-coral/15 text-coral',
};

const EXAM_LEGEND: CellState[] = ['answered', 'not-answered', 'not-visited', 'marked', 'answered-marked'];
const PRACTICE_LEGEND: CellState[] = ['correct', 'wrong', 'answered', 'not-answered', 'not-visited'];

/** Five minutes left: the clock turns red. */
const WARN_MS = 5 * 60_000;

/**
 * One sitting of a quiz. Exam mode copies the GATE screen: a countdown at 1.8 minutes a mark,
 * the palette's five states, mark-for-review, and nothing marked until submit. Practice mode
 * checks each answer as you go and records it at once.
 */
export function QuizSession({
  title,
  questions,
  mode,
  href,
  onRetake,
  onNewDraw,
}: {
  title: string;
  questions: QuizItem[];
  mode: QuizMode;
  /** Where the same quiz starts again, for the history. */
  href: string;
  onRetake: () => void;
  onNewDraw?: () => void;
}) {
  const recordAttempts = useProgress((s) => s.recordAttempts);
  const addQuiz = useProgress((s) => s.addQuiz);
  const exam = mode === 'exam';
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set([questions[0].id]));
  const [marked, setMarked] = useState<ReadonlySet<string>>(new Set());
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [startedAt] = useState(() => Date.now());
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const [confirming, setConfirming] = useState(false);
  // Seconds on screen per question, for the weak-topic and error views; a ref, as nothing renders it.
  const dwell = useRef<Record<string, number>>({});
  const shownAt = useRef(startedAt);
  const flush = (id: string) => {
    const now = Date.now();
    dwell.current[id] = (dwell.current[id] ?? 0) + (now - shownAt.current) / 1000;
    shownAt.current = now;
  };
  const secondsOn = (id: string) => Math.round(dwell.current[id] ?? 0);

  const marks = questions.reduce((s, q) => s + q.marks, 0);
  const limitMs = exam ? examMinutes(marks) * 60_000 : null;
  const running = exam && !outcome;

  const finish = () => {
    setConfirming(false);
    flush(questions[index].id);
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    const seconds = limitMs === null ? elapsed : Math.min(elapsed, limitMs / 1000);
    const summary = summarize(questions, responses);
    // Practice mode recorded each checked answer already; record the rest now.
    const fresh = questions.filter((q) => isAnswered(responses[q.id]) && !checked.has(q.id));
    if (fresh.length) recordAttempts(fresh.map((q) => ({ id: q.id, correct: isCorrect(q, responses[q.id]), seconds: secondsOn(q.id) })));
    addQuiz({
      id: String(startedAt),
      title,
      href,
      mode,
      at: Date.now(),
      net: summary.net,
      max: summary.max,
      correct: summary.correct,
      wrong: summary.wrong,
      unanswered: summary.unanswered,
      seconds,
    });
    setOutcome({ summary, seconds });
    window.scrollTo({ top: 0 });
  };

  // Leaving mid-exam loses the attempt: ask first, inside the app and on reload or close.
  const blocker = useBlocker(
    ({ currentLocation: from, nextLocation: to }) => running && (from.pathname !== to.pathname || from.search !== to.search),
  );
  useEffect(() => {
    if (!running) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [running]);

  if (outcome) {
    return (
      <QuizResults title={title} questions={questions} responses={responses} outcome={outcome} mode={mode} onRetake={onRetake} onNewDraw={onNewDraw} />
    );
  }

  const q = questions[index];
  const response = responses[q.id];
  const isChecked = checked.has(q.id);
  const last = index === questions.length - 1;
  const states = questions.map((x) =>
    cellState({
      exam,
      visited: visited.has(x.id),
      answered: isAnswered(responses[x.id]),
      marked: marked.has(x.id),
      checked: checked.has(x.id),
      correct: isCorrect(x, responses[x.id]),
    }),
  );
  const counts = tally(states);

  const go = (i: number) => {
    flush(q.id);
    setIndex(i);
    setVisited((v) => new Set(v).add(questions[i].id));
  };
  const setResponse = (r: Response) => setResponses((all) => ({ ...all, [q.id]: r }));
  const clear = () =>
    setResponses((all) => {
      const next = { ...all };
      delete next[q.id];
      return next;
    });
  const toggleMark = () =>
    setMarked((m) => {
      const next = new Set(m);
      if (next.has(q.id)) next.delete(q.id);
      else next.add(q.id);
      return next;
    });
  const check = () => {
    setChecked((c) => new Set(c).add(q.id));
    flush(q.id);
    recordAttempts([{ id: q.id, correct: isCorrect(q, response), seconds: secondsOn(q.id) }]);
  };
  const pyq = isPyq(q) ? q : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article key={q.id} aria-labelledby="quiz-q-label" className="glass min-w-0 space-y-6 p-5 sm:p-7">
        <header className="flex flex-wrap items-center gap-2">
          <h2 id="quiz-q-label" className="font-mono text-[13px] font-semibold text-ink">
            Question {index + 1} <span className="text-faint">of {questions.length}</span>
          </h2>
          <Badge tone="accent">{q.type}</Badge>
          <Badge tone="neutral">{plural(q.marks, 'mark')}</Badge>
          {!exam && <DifficultyBadge difficulty={q.difficulty} />}
          {pyq && (
            <span className="font-mono text-[11px] text-faint">
              {pyq.paperTitle} · {pyq.section === 'GA' ? 'GA ' : 'Q'}
              {pyq.n}
            </span>
          )}
          <span className="ml-auto text-[12px] text-faint">
            {q.type === 'mcq' ? `Wrong answer costs ${q.marks === 1 ? '⅓' : '⅔'} mark` : 'No negative marking'}
          </span>
        </header>

        <QuestionStem id={pyq?.id} stem={q.stem} code={pyq?.code} table={pyq?.table} figure={pyq?.figure} diagram={pyq?.diagram} />
        <AnswerInput
          question={q}
          response={response}
          onChange={setResponse}
          locked={isChecked}
          reveal={isChecked}
          trapFor={pyq ? (i) => pyq.solution.traps.find((t) => t.option === i)?.text : undefined}
        />

        {isChecked && (
          <div className="reveal space-y-3">
            <ResultBanner question={q} response={response} />
            <Explanation question={q} />
          </div>
        )}

        <footer className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <Button variant="ghost" size="sm" onClick={() => go(index - 1)} disabled={index === 0}>
            <ChevronLeft /> Previous
          </Button>
          {exam ? (
            <>
              <Button variant="outline" size="sm" onClick={toggleMark} aria-pressed={marked.has(q.id)}>
                <Bookmark className={cn(marked.has(q.id) && 'fill-violet text-violet')} />
                {marked.has(q.id) ? 'Unmark' : 'Mark for review'}
              </Button>
              <Button variant="ghost" size="sm" onClick={clear} disabled={!response}>
                <Eraser /> Clear response
              </Button>
              <CalculatorToggle />
            </>
          ) : (
            !isChecked && (
              <Button variant="primary" size="sm" onClick={check} disabled={!isAnswered(response)} title={isAnswered(response) ? undefined : 'Answer first'}>
                <FileCheck /> Check answer
              </Button>
            )
          )}
          <span className="flex-1" />
          {last ? (
            <Button variant={exam ? 'primary' : 'secondary'} size="sm" onClick={() => setConfirming(true)}>
              <Flag /> {exam ? 'Submit' : 'Finish'}
            </Button>
          ) : (
            <Button variant={exam ? 'primary' : 'secondary'} size="sm" onClick={() => go(index + 1)}>
              {exam ? 'Save and next' : 'Next'} <ChevronRight />
            </Button>
          )}
        </footer>
      </article>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Quiz progress">
        <Card className="p-4">
          <ClockReadout startedAt={startedAt} limitMs={limitMs} onTimeUp={finish} />
          <p className="mt-2 font-mono text-[11.5px] text-faint">
            {plural(questions.length, 'question')} · {plural(marks, 'mark')}
            {exam && ` · ${examMinutes(marks)} min`}
          </p>
        </Card>
        <Card className="p-4">
          <p className="eyebrow mb-3">Question palette</p>
          <ol className="grid grid-cols-6 gap-1.5">
            {questions.map((x, i) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === index ? 'step' : undefined}
                  aria-label={`Question ${i + 1}: ${CELL_LABEL[states[i]]}`}
                  className={cn(
                    'relative grid h-9 w-full place-items-center rounded-[8px] border font-mono text-[12px] font-semibold transition-colors hover:border-line-strong',
                    CELL_STYLE[states[i]],
                    i === index && 'ring-2 ring-accent ring-offset-1 ring-offset-canvas',
                  )}
                >
                  {i + 1}
                  {states[i] === 'answered-marked' && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-emerald" aria-hidden />}
                </button>
              </li>
            ))}
          </ol>
          <ul className="mt-4 space-y-1.5 text-[11.5px] text-muted">
            {(exam ? EXAM_LEGEND : PRACTICE_LEGEND).map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span className={cn('relative grid size-5 place-items-center rounded-[5px] border font-mono text-[10px]', CELL_STYLE[s])} aria-hidden>
                  {counts[s]}
                  {s === 'answered-marked' && <span className="absolute right-0.5 top-0.5 size-1 rounded-full bg-emerald" />}
                </span>
                {CELL_LABEL[s]}
              </li>
            ))}
          </ul>
        </Card>
        <Button variant={exam ? 'primary' : 'outline'} className="w-full" onClick={() => setConfirming(true)}>
          <Flag /> {exam ? 'Submit the paper' : 'Finish and see the score'}
        </Button>
      </aside>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={exam ? 'Submit the paper?' : 'Finish this quiz?'}
        confirm={exam ? 'Submit' : 'Finish'}
        cancel="Keep going"
        onConfirm={finish}
      >
        <p>
          {plural(counts.answered + counts['answered-marked'] + counts.correct + counts.wrong, 'question')} answered,{' '}
          {counts['not-answered'] + counts.marked + counts['not-visited']} not.
          {counts.marked + counts['answered-marked'] > 0 && ` ${plural(counts.marked + counts['answered-marked'], 'question')} still marked for review.`}
        </p>
        {exam && <p className="mt-2">Answered questions are marked with GATE's rules, marked-for-review ones included. This cannot be undone.</p>}
      </ConfirmDialog>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => !open && blocker.state === 'blocked' && blocker.reset()}
        title="Leave without submitting?"
        confirm="Leave"
        cancel="Stay in the exam"
        tone="danger"
        onConfirm={() => blocker.state === 'blocked' && blocker.proceed()}
      >
        The answers so far are discarded and the attempt is not recorded. Submit first to keep the score.
      </ConfirmDialog>
    </div>
  );
}

/** Ticks on its own so the question above it does not re-render every second. */
function ClockReadout({ startedAt, limitMs, onTimeUp }: { startedAt: number; limitMs: number | null; onTimeUp: () => void }) {
  const now = useNow(1000);
  const elapsed = now - startedAt;
  const left = limitMs === null ? null : Math.max(0, limitMs - elapsed);
  const timeUp = useEffectEvent(onTimeUp);
  const up = left === 0;
  useEffect(() => {
    if (up) timeUp();
  }, [up]);
  return (
    <div className="flex items-center justify-between gap-3" role="timer" aria-live="off">
      <span className="eyebrow flex items-center gap-1.5">
        <Clock className="size-3.5" aria-hidden /> {left === null ? 'Time spent' : 'Time left'}
      </span>
      <span className={cn('font-mono text-[22px] font-semibold tabular-nums', left !== null && left < WARN_MS ? 'text-coral' : 'text-ink')}>
        {formatClock((left ?? elapsed) / 1000)}
      </span>
    </div>
  );
}
