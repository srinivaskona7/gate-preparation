import { Bookmark, BookmarkCheck, Check, ClipboardCopy, Lightbulb, NotebookPen, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Pyq, PyqHint, PyqVariation, Question } from '@/content/types';
import { ERROR_TAGS, type ErrorTag, TAG_LABEL } from '@/features/progress/error-tags';
import { type Confidence, useProgress } from '@/features/progress/store';
import { AnswerInput } from '@/features/quiz/AnswerInput';
import { isAnswered, isCorrect, type Response } from '@/features/quiz/scoring';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Callout } from '@/ui/callout';
import { MathText, Tex } from '@/ui/math';

const HINT_LABEL: Record<PyqHint['kind'], string> = {
  guide: 'Guiding question',
  concept: 'Concept reminder',
  principle: 'The principle',
  setup: 'Setting it up',
  partial: 'A partial step',
};

/** Hints open one at a time, so each is a rung and none gives the answer away early. */
export function HintLadder({ hints, opened, onOpen }: { hints: PyqHint[]; opened: number; onOpen: () => void }) {
  return (
    <section aria-label="Hints" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          <Lightbulb className="size-4 text-amber" aria-hidden /> Hints
        </h3>
        <span className="font-mono text-[11.5px] text-faint">
          {opened} of {hints.length} opened
        </span>
      </div>
      {opened === 0 && <p className="text-[13px] text-muted">Try it on your own first. A hint is one small nudge, and using one is recorded as an assisted attempt.</p>}
      <ol className="space-y-2" aria-live="polite">
        {hints.slice(0, opened).map((h, i) => (
          <li key={i} className="reveal rounded-[12px] border border-amber/30 bg-amber/[0.06] p-3.5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-amber">
              Hint {i + 1} · {HINT_LABEL[h.kind]}
            </p>
            <MathText text={h.text} className="mt-1 block text-[13.5px] leading-relaxed text-ink/90" />
            {h.tex && <Tex tex={h.tex} className="mt-2 text-[15px]" />}
          </li>
        ))}
      </ol>
      {opened < hints.length && (
        <Button variant="outline" size="sm" onClick={onOpen}>
          <Lightbulb /> {opened === 0 ? 'Get a hint' : 'Next hint'} ({opened + 1} of {hints.length})
        </Button>
      )}
    </section>
  );
}

const CONFIDENCE: { value: Confidence; label: string }[] = [
  { value: 1, label: 'Guessing' },
  { value: 2, label: 'Not sure' },
  { value: 3, label: 'Sure' },
];

/** Asked before the result shows, so it measures the learner's belief and not their reaction to the key. */
export function ConfidencePicker({ value, onChange }: { value?: Confidence; onChange: (c: Confidence) => void }) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">How sure are you of this answer?</legend>
      <span className="text-[12.5px] text-muted" aria-hidden>
        How sure are you?
      </span>
      {CONFIDENCE.map((c) => (
        <label
          key={c.value}
          className={cn(
            'cursor-pointer rounded-full border px-3 py-1 text-[12.5px] focus-within:ring-2 focus-within:ring-accent',
            value === c.value ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted hover:text-ink',
          )}
        >
          <input type="radio" name="confidence" className="sr-only" checked={value === c.value} onChange={() => onChange(c.value)} />
          {c.label}
        </label>
      ))}
    </fieldset>
  );
}

export function ScratchNotes({ id }: { id: string }) {
  const note = useProgress((s) => s.notes[id] ?? '');
  const setNote = useProgress((s) => s.setNote);
  return (
    <details className="group rounded-[12px] border border-line bg-surface-2/40 px-3.5 py-2.5" open={note.length > 0}>
      <summary className="flex cursor-pointer items-center gap-2 text-[13px] text-muted marker:content-none hover:text-ink">
        <NotebookPen className="size-4" aria-hidden /> Scratch notes
        <span className="text-faint">(kept in this browser)</span>
      </summary>
      <textarea
        aria-label="Scratch notes for this question"
        value={note}
        onChange={(e) => setNote(id, e.target.value)}
        rows={4}
        className="mt-2 w-full resize-y rounded-[10px] border border-line bg-surface px-3 py-2 font-mono text-[13px] text-ink focus-visible:outline-2 focus-visible:outline-accent"
      />
    </details>
  );
}

export function SaveButton({ id }: { id: string }) {
  const saved = useProgress((s) => Boolean(s.saved[id]));
  const toggle = useProgress((s) => s.toggleSaved);
  return (
    <Button variant="ghost" size="sm" onClick={() => toggle(id)} aria-pressed={saved}>
      {saved ? <BookmarkCheck className="text-accent" /> : <Bookmark />} {saved ? 'Bookmarked' : 'Bookmark'}
    </Button>
  );
}

/** Copies a plain-text report, since the site is static and has no server to send it to. */
export function ReportButton({ q }: { q: Pyq }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = `Suspected error in ${q.id} (${q.paperTitle}, ${q.section} ${q.n})\nKey: ${JSON.stringify(q.key)}\nOur answer: ${JSON.stringify(q.answer)}\nWhat looks wrong: `;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Button variant="ghost" size="sm" onClick={copy} title="Copies a report to paste into an issue">
      <ClipboardCopy /> {copied ? 'Report copied' : 'Report an error'}
    </Button>
  );
}

/** After a miss or an assisted answer: name the cause, which feeds the error log and weak-topic view. */
export function ErrorLogPicker({ id }: { id: string }) {
  const tag = useProgress((s) => s.errorTags[id]);
  const tagError = useProgress((s) => s.tagError);
  return (
    <fieldset className="reveal space-y-2">
      <legend className="eyebrow">Add to your error log: what went wrong?</legend>
      <div className="flex flex-wrap gap-1.5">
        {ERROR_TAGS.map((t: ErrorTag) => (
          <button
            key={t}
            type="button"
            aria-pressed={tag === t}
            onClick={() => tagError(id, tag === t ? null : t)}
            className={cn(
              'rounded-full border px-3 py-1 text-[12.5px] focus-visible:outline-2 focus-visible:outline-accent',
              tag === t ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted hover:text-ink',
            )}
          >
            {TAG_LABEL[t]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** A variation as a practice question, so the same input and marking code serves it. */
function asQuestion(id: string, v: PyqVariation, base: Pyq): Question {
  const common = { id: `${id}:variation`, marks: base.marks, stem: v.stem, explanation: v.explanation, difficulty: base.difficulty, topic: base.topic, origin: 'curated' as const, pages: [] };
  if (base.type === 'nat') return { ...common, type: 'nat', answer: typeof v.answer === 'number' ? v.answer : 0, tolerance: 0.005 };
  if (!v.options) throw new Error(`variation of ${id} has no options`);
  if (base.type === 'mcq') return { ...common, type: 'mcq', options: v.options, answer: typeof v.answer === 'number' ? v.answer : 0 };
  return { ...common, type: 'msq', options: v.options, answer: Array.isArray(v.answer) ? v.answer : [] };
}

/** Same method, new numbers, plainly labelled as ours. The outcome is stored for the revisit queue. */
export function VariationCard({ q }: { q: Pyq }) {
  const v = q.variation;
  const done = useProgress((s) => s.variations[q.id]);
  const record = useProgress((s) => s.recordVariation);
  const [response, setResponse] = useState<Response | undefined>();
  const [checked, setChecked] = useState(false);
  if (!v) return null;
  const question = asQuestion(q.id, v, q);
  const ok = checked && isCorrect(question, response);
  return (
    <section aria-label="Practice variation" className="reveal space-y-3 rounded-[14px] border border-violet/35 bg-violet/[0.05] p-4">
      <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-violet">
        <Sparkles className="size-3.5" aria-hidden /> Practice variation · generated by us, not an exam question
      </p>
      <MathText text={v.stem} className="block text-[14px] leading-relaxed text-ink" />
      <AnswerInput question={question} response={response} onChange={setResponse} locked={checked} reveal={checked} />
      {checked ? (
        <>
          <Callout tone={ok ? 'note' : 'trap'} title={ok ? 'Correct' : 'Not quite'}>
            <MathText text={v.explanation} />
          </Callout>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setChecked(false);
              setResponse(undefined);
            }}
          >
            <RotateCcw /> Try again
          </Button>
        </>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          disabled={!isAnswered(response)}
          onClick={() => {
            setChecked(true);
            record(q.id, isCorrect(question, response));
          }}
        >
          <Check /> Check
        </Button>
      )}
      {done && !checked && (
        <p className="text-[12px] text-faint">Last variation attempt: {done.correct ? 'correct' : 'wrong'}.</p>
      )}
    </section>
  );
}
