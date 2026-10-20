import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { chapterPath } from '@/content/catalog';
import { Callout } from '@/ui/callout';
import { MathText, Tex } from '@/ui/math';
import { isPyq, type QuizItem } from './pool';

/** The worked answer: a practice question's explanation, or a PYQ's shortcut and a way into the full solver. */
export function Explanation({ question: q }: { question: QuizItem }) {
  if (!isPyq(q)) {
    return (
      <Callout tone="note" title="Solution">
        <MathText text={q.explanation} className="whitespace-pre-line" />
      </Callout>
    );
  }
  return (
    <div className="space-y-3">
      <Callout tone="shortcut" title="Exam-hall shortcut">
        <MathText text={q.solution.shortcut.body} className="whitespace-pre-line" />
        {q.solution.shortcut.tex && <Tex tex={q.solution.shortcut.tex} className="mt-2" />}
      </Callout>
      {q.keyNote && (
        <Callout tone="erratum" title={q.key.kind === 'mta' ? 'Why marks to all' : 'About the official key'}>
          <MathText text={q.keyNote} />
        </Callout>
      )}
      <Link to={chapterPath(q.chapter, 'pyqs', q.id)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline">
        Step-by-step solution and every trap <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
