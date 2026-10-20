import { CircleCheck, CircleX, FileCheck, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { chapterPath, topicTitles } from '@/content/catalog';
import type { Question } from '@/content/types';
import { useProgress } from '@/features/progress/store';
import { cn, plural } from '@/lib/utils';
import { Badge, DifficultyBadge, OriginBadge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Callout } from '@/ui/callout';
import { MathText } from '@/ui/math';
import { AnswerInput } from './AnswerInput';
import { QuestionStem } from './QuestionStem';
import { ResultBanner } from './ResultBanner';
import { isCorrect, type Response } from './scoring';

/** A practice question that checks itself: answer, check against the key, read the solution. */
export function QuestionCard({ question: q, index, chapterId }: { question: Question; index: number; chapterId: string }) {
  const record = useProgress((s) => s.recordAttempts);
  const previous = useProgress((s) => s.attempts[q.id]);
  const [response, setResponse] = useState<Response | undefined>();
  const [checked, setChecked] = useState(false);

  const check = () => {
    setChecked(true);
    record([{ id: q.id, correct: isCorrect(q, response) }]);
  };

  return (
    <article id={q.id} aria-labelledby={`${q.id}-label`} className="glass scroll-mt-36 space-y-5 p-5 sm:p-6">
      <header className="flex flex-wrap items-center gap-2">
        <span id={`${q.id}-label`} className="rounded-md border border-line-strong/70 px-2 py-0.5 font-mono text-[12.5px] font-semibold text-ink">
          Q {index}
        </span>
        <Badge tone="accent">{q.type}</Badge>
        <Badge tone="neutral">{plural(q.marks, 'mark')}</Badge>
        <DifficultyBadge difficulty={q.difficulty} />
        <OriginBadge origin={q.origin} pages={q.pages} />
        {q.sourceLabel && <span className="truncate font-mono text-[11px] text-faint">{q.sourceLabel}</span>}
        {previous && !checked && (
          <span className={cn('ml-auto inline-flex items-center gap-1 font-mono text-[11px]', previous.correct ? 'text-emerald' : 'text-coral')}>
            {previous.correct ? <CircleCheck className="size-3.5" aria-hidden /> : <CircleX className="size-3.5" aria-hidden />}
            Last attempt {previous.correct ? 'correct' : 'wrong'}
          </span>
        )}
      </header>
      <QuestionStem stem={q.stem} />
      <AnswerInput question={q} response={response} onChange={setResponse} locked={checked} reveal={checked} />
      {checked ? (
        <div className="reveal space-y-3">
          <ResultBanner question={q} response={response} />
          <Callout tone="note" title="Solution">
            <MathText text={q.explanation} className="whitespace-pre-line" />
          </Callout>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link to={chapterPath(chapterId, 'learn', q.topic)} className="font-mono text-[11.5px] text-faint hover:text-accent">
              Topic: {topicTitles.get(q.topic) ?? q.topic}
            </Link>
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
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={check}>
            <FileCheck /> Check answer
          </Button>
          <span className="text-[12px] text-faint">
            {q.type === 'mcq' ? `A wrong answer costs ${q.marks === 1 ? '⅓' : '⅔'} mark.` : 'No negative marking for this type.'}
          </span>
        </div>
      )}
    </article>
  );
}
