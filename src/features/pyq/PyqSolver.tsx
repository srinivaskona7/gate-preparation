import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FileCheck,
  ListOrdered,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { chapterPath, getChapter, topicTitles } from '@/content/catalog';
import type { Pyq } from '@/content/types';
import { type Confidence, useProgress } from '@/features/progress/store';
import { AnswerInput } from '@/features/quiz/AnswerInput';
import { QuestionStem } from '@/features/quiz/QuestionStem';
import { ResultBanner } from '@/features/quiz/ResultBanner';
import { isAnswered, isCorrect, keyLabel, optionLetter, type Response } from '@/features/quiz/scoring';
import { cn, plural } from '@/lib/utils';
import { Badge, DifficultyBadge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Callout } from '@/ui/callout';
import { Drawer } from '@/ui/drawer';
import { MathText, Tex } from '@/ui/math';
import { Skeleton } from '@/ui/primitives';
import { ConfidencePicker, ErrorLogPicker, HintLadder, ReportButton, SaveButton, ScratchNotes, VariationCard } from './LearningAids';
import { PyqDiagram } from './PyqDiagram';
import { useChapterPyqs } from './use-pyqs';

export interface SolverNav {
  index: number;
  total: number;
  prev?: () => void;
  next?: () => void;
}

/** Our own derived answer, as opposed to the official key. */
export function ourAnswer(q: Pyq) {
  if (q.type === 'mcq') return optionLetter(q.answer);
  if (q.type === 'msq') return q.answer.map(optionLetter).join(', ');
  return String(q.answer);
}

/**
 * The split-drawer problem solver: the question and an answer box on one side, and on the other
 * the solution, revealed a step at a time, with the exam-hall shortcut and every trap.
 */
export function PyqSolver({
  pyq,
  loading,
  open,
  onClose,
  nav,
}: {
  pyq: Pyq | undefined;
  loading?: boolean;
  open: boolean;
  onClose: () => void;
  nav?: SolverNav;
}) {
  const title = pyq ? `${pyq.paperTitle} · ${pyq.section === 'GA' ? 'GA ' : 'Q'}${pyq.n}` : 'Loading question';
  return (
    <Drawer
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={title}
      description={
        pyq ? `${pyq.type.toUpperCase()} · ${plural(pyq.marks, 'mark')} · ${topicTitles.get(pyq.topic) ?? pyq.topic}` : undefined
      }
      className="max-w-[1240px]"
      actions={
        nav && (
          <div className="flex items-center gap-1">
            <span className="hidden px-2 font-mono text-[11.5px] text-faint sm:inline">
              {nav.index + 1} / {nav.total}
            </span>
            <Button variant="ghost" size="icon" onClick={nav.prev} disabled={!nav.prev} aria-label="Previous question">
              <ChevronLeft />
            </Button>
            <Button variant="ghost" size="icon" onClick={nav.next} disabled={!nav.next} aria-label="Next question">
              <ChevronRight />
            </Button>
          </div>
        )
      }
    >
      {pyq ? (
        <SolverBody key={pyq.id} pyq={pyq} />
      ) : loading ? (
        <div className="grid gap-4 p-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <p className="p-8 text-center text-sm text-muted">This question is not in the solved archive yet.</p>
      )}
    </Drawer>
  );
}

/** The solver for an archived question, loading its chapter's solved PYQs on demand. */
export function PyqSolverFor({ entry, open, onClose, nav }: { entry?: { id: string; chapter: string }; open: boolean; onClose: () => void; nav?: SolverNav }) {
  const pyqs = useChapterPyqs(entry?.chapter ?? '');
  const pyq = pyqs.status === 'ready' && entry ? pyqs.data.find((p) => p.id === entry.id) : undefined;
  return <PyqSolver pyq={pyq} loading={Boolean(entry) && pyqs.status === 'loading'} open={open} onClose={onClose} nav={nav} />;
}

/** What survives a trip to a concept page and back: the answer so far, hints opened, steps shown. */
interface Draft {
  response?: Response;
  checked: boolean;
  hints: number;
  steps: number;
  shortcut: boolean;
  revealed: boolean;
  confidence?: Confidence;
  assisted: boolean;
  seconds: number;
}

const draftKey = (id: string) => `gate-atlas:draft:${id}`;

function loadDraft(id: string): Draft | undefined {
  try {
    const raw = sessionStorage.getItem(draftKey(id));
    return raw ? (JSON.parse(raw) as Draft) : undefined;
  } catch {
    return undefined;
  }
}

function SolverBody({ pyq: q }: { pyq: Pyq }) {
  const record = useProgress((s) => s.recordAttempts);
  const previous = useProgress((s) => s.attempts[q.id]);
  const location = useLocation();
  const saved = useRef(loadDraft(q.id)).current;
  const startedAt = useRef(Date.now() - (saved?.seconds ?? 0) * 1000);
  const [response, setResponse] = useState<Response | undefined>(saved?.response);
  const [checked, setChecked] = useState(saved?.checked ?? false);
  const [hints, setHints] = useState(saved?.hints ?? 0);
  const [steps, setSteps] = useState(saved?.steps ?? 0);
  const [shortcut, setShortcut] = useState(saved?.shortcut ?? false);
  const [revealed, setRevealed] = useState(saved?.revealed ?? false);
  const [confidence, setConfidence] = useState<Confidence | undefined>(saved?.confidence);
  const [assisted, setAssisted] = useState(saved?.assisted ?? false);
  const total = q.solution.steps.length;
  const solved = checked || revealed;
  const chapter = getChapter(q.chapter);
  const trapFor = (i: number) => q.solution.traps.find((t) => t.option === i)?.text;
  const usedHelp = hints > 0 || steps > 0 || shortcut || revealed;
  const correct = checked && isCorrect(q, response);

  // The draft is session-only: a refresh keeps it, closing the tab drops it. Progress itself lives in the store.
  useEffect(() => {
    const draft: Draft = { response, checked, hints, steps, shortcut, revealed, confidence, assisted, seconds: Math.round((Date.now() - startedAt.current) / 1000) };
    try {
      sessionStorage.setItem(draftKey(q.id), JSON.stringify(draft));
    } catch {
      // Storage full or blocked: the attempt still works, it just will not survive leaving the page.
    }
  }, [q.id, response, checked, hints, steps, shortcut, revealed, confidence, assisted]);

  const check = () => {
    const wasAssisted = usedHelp;
    setAssisted(wasAssisted);
    setChecked(true);
    record([
      {
        id: q.id,
        correct: isCorrect(q, response),
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
        assisted: wasAssisted,
        hints,
        confidence,
      },
    ]);
  };

  const retry = () => {
    sessionStorage.removeItem(draftKey(q.id));
    startedAt.current = Date.now();
    setResponse(undefined);
    setChecked(false);
    setHints(0);
    setSteps(0);
    setShortcut(false);
    setRevealed(false);
    setConfidence(undefined);
    setAssisted(false);
  };

  const revealAll = () => {
    setRevealed(true);
    setSteps(total);
    setShortcut(true);
  };

  const conceptHref = `${chapter ? chapterPath(chapter.id, 'learn', q.topic) : '#'}?from=${encodeURIComponent(location.pathname + location.search)}`;

  return (
    <div className="grid lg:h-full lg:grid-cols-2">
      <section aria-label="Question" className="min-w-0 space-y-6 p-5 sm:p-7 lg:overflow-y-auto">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{q.type.toUpperCase()}</Badge>
          <Badge tone="neutral">{plural(q.marks, 'mark')}</Badge>
          <DifficultyBadge difficulty={q.difficulty} />
          {q.key.kind === 'mta' && <Badge tone="violet">Marks to all</Badge>}
          {previous && (
            <span className={cn('ml-auto font-mono text-[11.5px]', previous.correct ? 'text-emerald' : 'text-coral')}>
              Last attempt {previous.correct ? 'correct' : 'wrong'}
            </span>
          )}
        </div>
        <QuestionStem id={q.id} stem={q.stem} code={q.code} table={q.table} figure={q.figure} diagram={q.diagram} />
        <AnswerInput question={q} response={response} onChange={setResponse} locked={solved} reveal={solved} trapFor={trapFor} />
        {solved ? (
          <div className="space-y-4">
            {checked && <ResultBanner question={q} response={response} />}
            {checked && (
              <p className="rounded-[10px] border border-line bg-surface-2/50 px-3 py-2 text-[12.5px] text-muted">
                <strong className="text-ink">{assisted ? 'Assisted attempt' : 'Independent attempt'}</strong>
                {assisted ? `: you opened ${hints > 0 ? `${hints} hint${hints === 1 ? '' : 's'}` : 'the solution'} first, so this counts as practice, not mastery.` : ': no hints or steps were opened before you checked.'}
                {confidence === 3 && !correct && ' You were sure, and it was wrong: that gap is the most useful thing to look at.'}
                {confidence === 1 && correct && ' You were guessing and it was right: worth a second look at why.'}
              </p>
            )}
            {checked && (!correct || assisted) && <ErrorLogPicker id={q.id} />}
            <Button variant="outline" size="sm" onClick={retry}>
              Try again from scratch
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <ConfidencePicker value={confidence} onChange={setConfidence} />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={check} disabled={!isAnswered(response)}>
                <FileCheck /> Check against the official key
              </Button>
              <span className="text-[12px] text-faint">
                {q.type === 'mcq' ? `A wrong answer costs ${q.marks === 1 ? '⅓' : '⅔'} mark.` : 'No negative marking for this type.'}
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1 border-t border-line pt-3">
          <SaveButton id={q.id} />
          {solved && <ReportButton q={q} />}
        </div>
        <ScratchNotes id={q.id} />
      </section>

      <section aria-label="Solution" className="min-w-0 space-y-5 border-t border-line bg-surface/40 p-5 sm:p-7 lg:overflow-y-auto lg:border-l lg:border-t-0">
        {q.hints && <HintLadder hints={q.hints} opened={hints} onOpen={() => setHints((h) => Math.min(h + 1, q.hints?.length ?? 0))} />}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <ListOrdered className="size-4 text-accent" aria-hidden /> Step-by-step solution
          </h3>
          <span className="font-mono text-[11.5px] text-faint">
            {steps} of {total} steps shown
          </span>
        </div>

        {steps === 0 && !solved && (
          <p className="rounded-[12px] border border-dashed border-line-strong px-4 py-3 text-[13px] text-muted">
            Work it out first, then open one step at a time: each step is a hint for the next.
          </p>
        )}

        {q.solution.recognize && (steps > 0 || solved) && (
          <Callout tone="note" title="Which concept applies" className="reveal">
            <MathText text={q.solution.recognize.clues} className="block" />
            {q.solution.recognize.contrast && <MathText text={q.solution.recognize.contrast} className="mt-2 block text-muted" />}
            <p className="mt-2 text-[12.5px]">
              Concept: <Link to={`${chapter ? chapterPath(chapter.id, 'learn', q.solution.recognize.concept) : '#'}?from=${encodeURIComponent(location.pathname + location.search)}`} className="text-accent underline-offset-2 hover:underline">{topicTitles.get(q.solution.recognize.concept) ?? q.solution.recognize.concept}</Link>
            </p>
          </Callout>
        )}

        <ol className="space-y-3">
          {q.solution.steps.slice(0, steps).map((s, i) => (
            <li key={i} className="reveal glass p-4">
              <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                <span className="grid size-6 place-items-center rounded-full border border-accent/40 bg-accent/10 font-mono text-[11px] text-accent">
                  {i + 1}
                </span>
                {s.title}
              </p>
              <MathText text={s.body} className="mt-2 block whitespace-pre-line text-[13.5px] leading-relaxed text-ink/90" />
              {s.tex && <Tex tex={s.tex} className="mt-2 text-[15px]" />}
            </li>
          ))}
        </ol>

        {/* The picture comes with the last step, so it never gives the working away early. */}
        {q.solutionDiagram && steps === total && <PyqDiagram id={q.id} part="solution" diagram={q.solutionDiagram} caption="The solution, drawn" className="reveal" />}

        {q.solution.check && steps === total && (
          <Callout tone="note" title="Check the result" className="reveal">
            <MathText text={q.solution.check.body} />
            {q.solution.check.tex && <Tex tex={q.solution.check.tex} className="mt-2" />}
          </Callout>
        )}

        <div className="flex flex-wrap gap-2" data-print="hide">
          {steps < total && (
            <Button variant="secondary" size="sm" onClick={() => setSteps(steps + 1)}>
              <Eye /> Show step {steps + 1}
            </Button>
          )}
          {!shortcut && (
            <Button variant="outline" size="sm" onClick={() => setShortcut(true)}>
              <Zap /> Exam-hall shortcut
            </Button>
          )}
          {!revealed && (
            <Button variant="ghost" size="sm" onClick={revealAll}>
              Reveal the full solution
            </Button>
          )}
        </div>

        {shortcut && (
          <Callout tone="shortcut" title="Exam-hall shortcut" className="reveal">
            <MathText text={q.solution.shortcut.body} className="whitespace-pre-line" />
            {q.solution.shortcut.tex && <Tex tex={q.solution.shortcut.tex} className="mt-2" />}
          </Callout>
        )}

        {solved && (
          <>
            <div className="reveal space-y-3">
              <p className="eyebrow">Traps</p>
              {q.solution.traps.map((t, i) => (
                <Callout key={i} tone="trap" title={t.option === undefined ? 'Trap' : `Option ${optionLetter(t.option)}`}>
                  <MathText text={t.text} />
                </Callout>
              ))}
            </div>
            <dl className="reveal grid grid-cols-2 gap-2 font-mono text-[12.5px]">
              <div className="rounded-[10px] border border-line bg-surface-2/60 px-3 py-2">
                <dt className="text-faint">Official key</dt>
                <dd className="mt-0.5 text-ink">{keyLabel(q.key)}</dd>
              </div>
              <div className="rounded-[10px] border border-line bg-surface-2/60 px-3 py-2">
                <dt className="text-faint">Derived answer</dt>
                <dd className="mt-0.5 text-ink">{ourAnswer(q)}</dd>
              </div>
            </dl>
            {q.keyNote && (
              <Callout tone="erratum" title={q.key.kind === 'mta' ? 'Why marks to all' : 'About the official key'} className="reveal">
                <MathText text={q.keyNote} />
              </Callout>
            )}
            <VariationCard q={q} />
          </>
        )}

        <footer className="space-y-2 border-t border-line pt-4 text-[12.5px]">
          <p className="eyebrow flex items-center gap-1.5">
            <ShieldAlert className="size-3.5" aria-hidden /> Sources
          </p>
          <ul className="space-y-1">
            {q.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-accent">
                  <ExternalLink className="size-3.5" aria-hidden /> {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href={q.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-accent">
                <ExternalLink className="size-3.5" aria-hidden /> Discussion on GATE Overflow
              </a>
            </li>
          </ul>
          {chapter && (
            <p className="pt-1 text-faint">
              Revise:{' '}
              <Link to={conceptHref} className="text-muted hover:text-accent">
                {topicTitles.get(q.topic) ?? q.topic}
              </Link>
            </p>
          )}
        </footer>
      </section>
    </div>
  );
}
