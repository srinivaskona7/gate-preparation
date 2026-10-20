import { Play, Timer } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import type { Difficulty } from '@/content/types';
import { type Attempt, useProgress } from '@/features/progress/store';
import { QuestionCard } from '@/features/quiz/QuestionCard';
import { useScrollToItem } from '@/lib/use-scroll-to-item';
import { plural } from '@/lib/utils';
import { Button } from '@/ui/button';
import { EmptyState, SectionHeading } from '@/ui/primitives';
import { Segmented } from '@/ui/segmented';
import type { TabProps } from './tab-props';

type TypeFilter = 'all' | 'mcq' | 'msq' | 'nat';
type LevelFilter = 'all' | Difficulty;
type StatusFilter = 'all' | 'new' | 'wrong' | 'correct';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'mcq', label: 'MCQ' },
  { value: 'msq', label: 'MSQ' },
  { value: 'nat', label: 'NAT' },
] as const;
const LEVEL_OPTIONS = [
  { value: 'all', label: 'Any level' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const;
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'Unattempted' },
  { value: 'wrong', label: 'Got wrong' },
  { value: 'correct', label: 'Solved' },
] as const;

const matchesStatus = (status: StatusFilter, a: Attempt | undefined) =>
  status === 'all' || (status === 'new' ? !a : status === 'wrong' ? a?.correct === false : a?.correct === true);

export function PracticeTab({ chapter, body, item }: TabProps) {
  const attempts = useProgress((s) => s.attempts);
  const [type, setType] = useState<TypeFilter>('all');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  // The attempts as they were when the filter was chosen: checking an answer must not make
  // its card vanish from an "Unattempted" list mid-read.
  const [snapshot, setSnapshot] = useState(attempts);
  useScrollToItem(item);

  const questions = body.questions;
  const shown = questions.filter(
    (q) => (type === 'all' || q.type === type) && (level === 'all' || q.difficulty === level) && matchesStatus(status, snapshot[q.id]),
  );
  const attempted = questions.filter((q) => attempts[q.id]);
  const correct = attempted.filter((q) => attempts[q.id]?.correct);
  const quiz = (mode: 'practice' | 'exam') => `/practice/quiz?${new URLSearchParams({ chapters: chapter.id, mode })}`;

  if (!questions.length) return <EmptyState title="No practice questions in this chapter yet" />;
  return (
    <div className="mx-auto max-w-4xl">
      <SectionHeading
        eyebrow="GATE-marked practice"
        title={`Practice questions · ${questions.length}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={quiz('practice')}>
                <Play /> Quiz mode
              </Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link to={quiz('exam')}>
                <Timer /> Timed test
              </Link>
            </Button>
          </div>
        }
      />
      <p className="mb-4 text-[13.5px] text-muted">
        {chapter.stats ? `${chapter.stats.mcq} MCQ, ${chapter.stats.msq} MSQ and ${chapter.stats.nat} NAT. ` : ''}
        {attempted.length
          ? `You have attempted ${attempted.length} and got ${plural(correct.length, 'right answer')} on the last try.`
          : 'Answer, check against the key, then read the worked solution.'}
      </p>
      <div className="glass mb-5 flex flex-wrap items-center gap-3 p-3" role="search" aria-label="Filter questions">
        <Segmented<TypeFilter> label="Question type" size="xs" value={type} onChange={setType} options={TYPE_OPTIONS} />
        <Segmented<LevelFilter> label="Difficulty" size="xs" value={level} onChange={setLevel} options={LEVEL_OPTIONS} />
        <Segmented<StatusFilter>
          label="Your attempts"
          size="xs"
          value={status}
          onChange={(v) => {
            setSnapshot(attempts);
            setStatus(v);
          }}
          options={STATUS_OPTIONS}
        />
        <span className="ml-auto font-mono text-[11.5px] text-faint" aria-live="polite">
          {shown.length === questions.length ? plural(questions.length, 'question') : `${shown.length} of ${questions.length}`}
        </span>
      </div>
      {shown.length ? (
        <div className="space-y-5">
          {shown.map((q) => (
            <QuestionCard key={q.id} question={q} index={questions.indexOf(q) + 1} chapterId={chapter.id} />
          ))}
        </div>
      ) : (
        <EmptyState title="No question matches these filters" />
      )}
    </div>
  );
}
