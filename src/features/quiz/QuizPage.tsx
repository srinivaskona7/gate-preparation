import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useAsync } from '@/lib/use-async';
import { plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { PageHeader } from '@/ui/page-header';
import { EmptyState, Skeleton } from '@/ui/primitives';
import { loadPool, quizTitle } from './pool';
import { QuizSession } from './QuizSession';
import { examMinutes, newSeed, readSpec, selectQuestions, specParams } from './selection';

export function QuizPage() {
  const [params, setParams] = useSearchParams();
  const spec = readSpec(params);
  const [fallbackSeed] = useState(newSeed);
  const [round, setRound] = useState(0);
  // Write the seed into the URL so a reload, the history and a shared link all draw the same set.
  useEffect(() => {
    if (spec.seed !== null) return;
    setParams(
      (p) => {
        p.set('seed', String(fallbackSeed));
        return p;
      },
      { replace: true },
    );
  }, [spec.seed, fallbackSeed, setParams]);

  const seed = spec.seed ?? fallbackSeed;
  const canonical = specParams({ ...spec, seed }).toString();
  const poolKey = specParams({ ...spec, seed: null, mode: 'practice', n: null }).toString();
  const pool = useAsync(() => loadPool(spec), `quiz-pool:${spec.source}:${poolKey}`);
  const title = params.get('title') || quizTitle(spec);

  if (spec.seed === null || pool.status === 'loading') {
    return (
      <div aria-busy="true" aria-label="Preparing the quiz" className="space-y-4">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-96" />
      </div>
    );
  }
  if (pool.status === 'error') return <EmptyState title="The questions failed to load">{pool.error.message}</EmptyState>;

  const questions = selectQuestions(pool.data, spec, seed);
  if (!questions.length) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <EmptyState title="No question matches this quiz">
          <p>
            {spec.source === 'pyq'
              ? 'Solved PYQs appear as each chapter is completed; the chapters chosen have none yet.'
              : 'The chapters, topics or types chosen have no practice questions.'}
          </p>
          <Button variant="primary" size="sm" className="mt-4" asChild>
            <Link to="/practice">Build a different quiz</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  const marks = questions.reduce((s, q) => s + q.marks, 0);
  const href = `/practice/quiz?${canonical}${params.get('title') ? `&${new URLSearchParams({ title })}` : ''}`;
  const redraw = () =>
    setParams(
      (p) => {
        p.set('seed', String(newSeed()));
        return p;
      },
      { replace: true },
    );
  return (
    <div>
      <PageHeader
        eyebrow={
          <>
            <Link to="/practice" className="inline-flex items-center gap-1 hover:text-accent">
              <ArrowLeft className="size-3.5" aria-hidden /> Practice
            </Link>
            <Badge tone={spec.mode === 'exam' ? 'coral' : 'accent'}>{spec.mode === 'exam' ? 'Timed, GATE marking' : 'Practice, instant feedback'}</Badge>
          </>
        }
        title={title}
        description={`${plural(questions.length, 'question')} · ${plural(marks, 'mark')}${spec.mode === 'exam' ? ` · ${examMinutes(marks)} minutes at GATE's pace of 1.8 a mark` : ''}`}
      />
      <QuizSession
        key={`${canonical}#${round}`}
        title={title}
        questions={questions}
        mode={spec.mode}
        href={href}
        onRetake={() => setRound((r) => r + 1)}
        onNewDraw={spec.ids.length ? undefined : redraw}
      />
    </div>
  );
}
