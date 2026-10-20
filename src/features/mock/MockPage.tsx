import { Clock, Play, Shuffle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { loadQuestions } from '@/content/catalog';
import { useProgress } from '@/features/progress/store';
import { examMinutes, newSeed } from '@/features/quiz/selection';
import { useAsync } from '@/lib/use-async';
import { formatClock, formatMarks, plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { PageHeader } from '@/ui/page-header';
import { Card, EmptyState, SectionHeading, Skeleton } from '@/ui/primitives';
import { BLUEPRINT, buildMock, type MockSection, totalMarks } from './mock';

const SECTION_LABEL: Record<MockSection, string> = { GA: 'General Aptitude', EM: 'Engineering Mathematics', CS: 'Core computer science' };
export const MOCK_TITLE = 'Full mock';

export function MockPage() {
  const pool = useAsync(loadQuestions, 'questions');
  const [seed, setSeed] = useState(newSeed);
  const quizzes = useProgress((s) => s.quizzes).filter((q) => q.title.startsWith(MOCK_TITLE));

  return (
    <div>
      <PageHeader
        eyebrow="Exam rehearsal"
        title="Full mock paper"
        description="One sitting as GATE CS sets it: 65 questions, 100 marks, 3 hours, on the exam screen with its palette, mark-for-review and the on-screen calculator. Each draw spreads the core questions across every subject."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <SectionHeading eyebrow="The paper" title="Blueprint" />
          <table className="w-full text-left text-[13px]">
            <caption className="sr-only">Questions and marks per section</caption>
            <thead className="text-[11px] uppercase tracking-wide text-faint">
              <tr>
                <th className="py-2 font-medium">Section</th>
                <th className="py-2 text-right font-medium">1-mark</th>
                <th className="py-2 text-right font-medium">2-mark</th>
                <th className="py-2 text-right font-medium">Marks</th>
              </tr>
            </thead>
            <tbody>
              {(['GA', 'EM', 'CS'] as const).map((s) => {
                const one = BLUEPRINT.find((b) => b.section === s && b.marks === 1)?.count ?? 0;
                const two = BLUEPRINT.find((b) => b.section === s && b.marks === 2)?.count ?? 0;
                return (
                  <tr key={s} className="border-t border-line">
                    <td className="py-2 text-ink">{SECTION_LABEL[s]}</td>
                    <td className="py-2 text-right font-mono">{one}</td>
                    <td className="py-2 text-right font-mono">{two}</td>
                    <td className="py-2 text-right font-mono">{one + 2 * two}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-line-strong font-semibold">
                <td className="py-2 text-ink">Total</td>
                <td className="py-2 text-right font-mono">25 + 5</td>
                <td className="py-2 text-right font-mono">30 + 5</td>
                <td className="py-2 text-right font-mono">100</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-[13px] text-muted">
            Marking follows GATE: a wrong MCQ costs ⅓ of its marks, MSQ and NAT carry no negative marks, and nothing is marked until you submit. Questions come from the practice bank; official PYQs stay in the{' '}
            <Link to="/papers" className="text-accent hover:underline">
              paper archive
            </Link>
            , where each paper is its own mock.
          </p>
        </Card>
        <Card className="space-y-4">
          <SectionHeading eyebrow={`${examMinutes(100)} minutes`} title="Start" />
          {pool.status === 'loading' && <Skeleton className="h-24" />}
          {pool.status === 'error' && <EmptyState title="The question bank failed to load">{pool.error.message}</EmptyState>}
          {pool.status === 'ready' && <Start seed={seed} onReshuffle={() => setSeed(newSeed())} pool={pool.data} attempt={quizzes.length + 1} />}
        </Card>
      </div>
      {quizzes.length > 0 && (
        <Card className="mt-6">
          <SectionHeading eyebrow="History" title="Past mocks" />
          <ul className="divide-y divide-line text-[13px]">
            {quizzes.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center gap-3 py-2">
                <span className="text-ink">{q.title}</span>
                <span className="text-faint">{new Date(q.at).toLocaleDateString()}</span>
                <span className="ml-auto font-mono text-ink">
                  {formatMarks(q.net)} / {q.max}
                </span>
                <span className="font-mono text-faint">
                  <Clock className="mr-1 inline size-3" aria-hidden />
                  {formatClock(q.seconds)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Start({ seed, onReshuffle, pool, attempt }: { seed: number; onReshuffle: () => void; pool: Parameters<typeof buildMock>[0]; attempt: number }) {
  const { questions, shortfall } = buildMock(pool, seed);
  const href = `/practice/quiz?${new URLSearchParams({ ids: questions.map((q) => q.id).join(','), mode: 'exam', title: `${MOCK_TITLE} ${attempt}` })}`;
  return (
    <>
      <p className="text-[13px] text-muted">
        This draw: {plural(questions.length, 'question')}, {totalMarks(questions)} marks.
      </p>
      {shortfall.length > 0 && (
        <p className="text-[13px] text-coral">
          The bank is short of{' '}
          {shortfall.map((s) => `${s.missing} ${s.section} ${s.marks}-mark`).join(', ')} questions, so this paper is shorter than GATE's.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" asChild>
          <Link to={href}>
            <Play /> Start the mock
          </Link>
        </Button>
        <Button variant="outline" onClick={onReshuffle}>
          <Shuffle /> Draw another paper
        </Button>
      </div>
      <Badge tone="coral">Leaving mid-paper discards the attempt</Badge>
    </>
  );
}
