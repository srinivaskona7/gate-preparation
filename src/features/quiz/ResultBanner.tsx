import { CircleCheck, CircleMinus, CircleX, Scale } from 'lucide-react';
import { cn, formatMarks } from '@/lib/utils';
import { answerKey, type Gradable, isAnswered, isCorrect, keyLabel, type Response, scoreQuestion } from './scoring';

/** How a checked answer scored under GATE marking, with the official key. */
export function ResultBanner({ question, response, className }: { question: Gradable; response: Response | undefined; className?: string }) {
  const mta = answerKey(question).kind === 'mta';
  const answered = isAnswered(response);
  const correct = isCorrect(question, response);
  const marks = scoreQuestion(question, response);
  const tone = mta ? 'violet' : !answered ? 'muted' : correct ? 'emerald' : 'coral';
  const Icon = mta ? Scale : !answered ? CircleMinus : correct ? CircleCheck : CircleX;
  const title = mta
    ? 'Marks to all'
    : !answered
      ? 'Not answered'
      : correct
        ? 'Correct'
        : question.type === 'mcq'
          ? 'Wrong: negative marking applies'
          : 'Wrong: no negative marks for this type';
  return (
    <div
      role="status"
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[12px] border px-4 py-3',
        tone === 'emerald' && 'border-emerald/45 bg-emerald/[0.08]',
        tone === 'coral' && 'border-coral/45 bg-coral/[0.08]',
        tone === 'violet' && 'border-violet/45 bg-violet/[0.08]',
        tone === 'muted' && 'border-line bg-surface-2/60',
        className,
      )}
    >
      <Icon
        className={cn('size-5 shrink-0', { emerald: 'text-emerald', coral: 'text-coral', violet: 'text-violet', muted: 'text-faint' }[tone])}
        aria-hidden
      />
      <p className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{title}</p>
      <p className="font-mono text-[13px] text-muted">
        Key <span className="text-ink">{keyLabel(answerKey(question))}</span>
      </p>
      <p className={cn('font-mono text-[15px] font-semibold', marks > 0 ? 'text-emerald' : marks < 0 ? 'text-coral' : 'text-muted')}>
        {marks > 0 ? '+' : marks < 0 ? '−' : ''}
        {formatMarks(Math.abs(marks))}
      </p>
      {mta && <p className="w-full text-[12.5px] text-muted">The official key awards these marks to every candidate, attempted or not.</p>}
    </div>
  );
}
