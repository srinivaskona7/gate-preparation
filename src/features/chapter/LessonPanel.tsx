import { GraduationCap, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { chapterPath, loadPyqIndex } from '@/content/catalog';
import type { Question, Topic, TopicLesson } from '@/content/types';
import { AnswerInput } from '@/features/quiz/AnswerInput';
import { isAnswered, isCorrect, type Response } from '@/features/quiz/scoring';
import { useAsync } from '@/lib/use-async';
import { Button } from '@/ui/button';
import { Callout } from '@/ui/callout';
import { MathText, Tex } from '@/ui/math';

const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 } as const;

const Label = ({ children }: { children: string }) => <h5 className="eyebrow mb-1.5">{children}</h5>;

/** A beginner lesson for one topic: plain words first, the formal rule second, then practice. */
export function LessonPanel({ topic, chapterId, defaultOpen }: { topic: Topic; chapterId: string; defaultOpen: boolean }) {
  const l = topic.lesson;
  if (!l) return null;
  return (
    <details open={defaultOpen} className="group mt-4 rounded-[12px] border border-accent/30 bg-accent/[0.04]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[13.5px] font-semibold text-accent marker:hidden">
        <GraduationCap className="size-4" aria-hidden /> Beginner lesson
        <span className="ml-auto text-[11.5px] font-normal text-faint group-open:hidden">open</span>
      </summary>
      <div className="space-y-5 border-t border-line px-4 py-4 text-[13.5px] leading-relaxed text-ink/90">
        <Body topic={topic} lesson={l} chapterId={chapterId} />
      </div>
    </details>
  );
}

function Body({ topic, lesson: l, chapterId }: { topic: Topic; lesson: TopicLesson; chapterId: string }) {
  const index = useAsync(loadPyqIndex, 'pyq-index');
  const linked =
    index.status === 'ready'
      ? index.data.filter((e) => e.topic === topic.id).sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] || a.year - b.year)
      : [];
  return (
    <>
      <div>
        <Label>Why it matters</Label>
        <MathText text={l.why} />
      </div>
      {l.prerequisites && (
        <div>
          <Label>Know this first</Label>
          <ul className="flex flex-wrap gap-2">
            {l.prerequisites.map((p) => (
              <li key={p}>
                <Link to={chapterPath(chapterId, 'learn', p)} className="rounded-md border border-line bg-surface-2/70 px-2 py-0.5 text-[12.5px] text-accent hover:bg-surface-3/70">
                  {p.split('.').at(-1)?.replace(/-/g, ' ')}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <Label>In plain words</Label>
        <MathText text={l.intro} />
      </div>
      {l.analogy && (
        <Callout tone="note" title="An analogy, and where it stops">
          <MathText text={l.analogy.text} />
          <MathText text={`It stops working when: ${l.analogy.breaksWhen}`} className="mt-2 block text-muted" />
        </Callout>
      )}
      {l.definitions && (
        <dl className="space-y-1.5">
          {l.definitions.map((d) => (
            <div key={d.term}>
              <dt className="inline font-semibold text-ink">{d.term}: </dt>
              <dd className="inline">
                <MathText text={d.meaning} />
              </dd>
            </div>
          ))}
        </dl>
      )}
      <div>
        <Label>The rule</Label>
        <MathText text={l.principle.text} />
        {l.principle.tex && <Tex tex={l.principle.tex} className="mt-2" />}
        <MathText text={`Where it does not apply: ${l.limits}`} className="mt-2 block text-muted" />
      </div>
      <div className="rounded-[12px] border border-line bg-surface-2/50 p-3.5">
        <p className="eyebrow mb-1.5 flex items-center gap-1.5 text-violet">
          <Sparkles className="size-3" aria-hidden /> Worked example · written by us, not an exam question
        </p>
        <MathText text={l.example.problem} className="block font-medium text-ink" />
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {l.example.steps.map((s) => (
            <li key={s}>
              <MathText text={s} />
            </li>
          ))}
        </ol>
        <MathText text={l.example.result} className="mt-2 block font-semibold text-ink" />
      </div>
      <div>
        <Label>Common mistakes</Label>
        <ul className="list-disc space-y-1.5 pl-5">
          {l.misconceptions.map((m) => (
            <li key={m}>
              <MathText text={m} />
            </li>
          ))}
        </ul>
      </div>
      <RecallCheck recall={l.recall} />
      <Practice id={topic.id} practice={l.practice} topic={topic.id} />
      {linked.length > 0 && (
        <div>
          <Label>Real exam questions on this topic, easiest first</Label>
          <ul className="flex flex-wrap gap-1.5">
            {linked.map((e) => (
              <li key={e.id}>
                <Link to={`/pyqs/${e.id}`} className="rounded-md border border-line bg-surface-2/70 px-2 py-0.5 font-mono text-[11.5px] text-muted hover:text-accent">
                  {e.year} Q{e.n} · {e.difficulty}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <Label>In one line</Label>
        <MathText text={l.summary} className="font-medium text-ink" />
      </div>
    </>
  );
}

/** Self-test: answer in your head, then reveal. Nothing is scored, so nothing is claimed. */
function RecallCheck({ recall }: { recall: TopicLesson['recall'] }) {
  const [shown, setShown] = useState<Record<number, boolean>>({});
  return (
    <div>
      <Label>Check you remember</Label>
      <ul className="space-y-2">
        {recall.map((r, i) => (
          <li key={r.q} className="rounded-[10px] border border-line px-3 py-2">
            <MathText text={r.q} className="block font-medium text-ink" />
            {shown[i] ? (
              <MathText text={r.a} className="mt-1 block text-muted" />
            ) : (
              <Button variant="ghost" size="sm" className="mt-1" onClick={() => setShown({ ...shown, [i]: true })}>
                Show the answer
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Practice({ id, practice: p, topic }: { id: string; practice: TopicLesson['practice']; topic: string }) {
  const [response, setResponse] = useState<Response | undefined>();
  const [checked, setChecked] = useState(false);
  const common = { id: `${id}:lesson`, marks: 1 as const, stem: p.stem, explanation: p.explanation, difficulty: 'easy' as const, topic, origin: 'curated' as const, pages: [] };
  const question: Question = p.type === 'nat' ? { ...common, type: 'nat', answer: p.answer, tolerance: 0.005 } : { ...common, type: 'mcq', options: p.options, answer: p.answer };
  const ok = checked && isCorrect(question, response);
  return (
    <section aria-label="Lesson practice" className="space-y-3 rounded-[12px] border border-violet/35 bg-violet/[0.05] p-3.5">
      <p className="eyebrow flex items-center gap-1.5 text-violet">
        <Sparkles className="size-3" aria-hidden /> Try one · written by us, not an exam question
      </p>
      <MathText text={p.stem} className="block text-ink" />
      <AnswerInput question={question} response={response} onChange={setResponse} locked={checked} reveal={checked} />
      {checked ? (
        <Callout tone={ok ? 'note' : 'trap'} title={ok ? 'Correct' : 'Not quite'}>
          <MathText text={p.explanation} />
        </Callout>
      ) : (
        <Button variant="secondary" size="sm" disabled={!isAnswered(response)} onClick={() => setChecked(true)}>
          Check
        </Button>
      )}
    </section>
  );
}
