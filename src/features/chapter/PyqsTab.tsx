import { Play } from 'lucide-react';
import { Link } from 'react-router';
import { chapterPath } from '@/content/catalog';
import { MappedQuestions } from '@/features/pyq/MappedQuestions';
import { PyqBrowser } from '@/features/pyq/PyqBrowser';
import { toListItem } from '@/features/pyq/filters';
import { useChapterPyqs } from '@/features/pyq/use-pyqs';
import { plural } from '@/lib/utils';
import { Button } from '@/ui/button';
import { EmptyState, SectionHeading, Skeleton } from '@/ui/primitives';
import type { TabProps } from './tab-props';

export function PyqsTab({ chapter, item }: TabProps) {
  const pyqs = useChapterPyqs(chapter.id);
  const m = chapter.memory;
  if (pyqs.status === 'loading') return <Skeleton className="h-96" />;
  if (pyqs.status === 'error') return <EmptyState title="The solved PYQs failed to load">{pyqs.error.message}</EmptyState>;

  const items = pyqs.data.map(toListItem);
  return (
    <div>
      <SectionHeading
        eyebrow="Official GATE CSE papers, 2011–2026"
        title="PYQ solver"
        action={
          items.length > 0 && (
            <Button variant="primary" size="sm" asChild>
              <Link to={`/practice/quiz?${new URLSearchParams({ source: 'pyq', chapters: chapter.id, mode: 'exam' })}`}>
                <Play /> Timed PYQ set
              </Link>
            </Button>
          )
        }
      />
      <p className="mb-5 max-w-3xl text-[13.5px] leading-relaxed text-muted">
        {items.length
          ? `${plural(items.length, 'question')} solved from ${plural(m.papers, 'paper')}, each with a full derivation, the exam-hall shortcut and the trap behind every wrong option. ${m.mapped > items.length ? `${m.mapped - items.length - m.skipped} more are mapped and waiting.` : ''}`
          : 'Worked solutions for this chapter are being written from the official papers and final answer keys.'}
      </p>
      {items.length > 0 ? (
        <PyqBrowser items={items} selected={item} scope="chapter" pathFor={(id) => chapterPath(chapter.id, 'pyqs', id)} />
      ) : (
        <EmptyState title="No solved questions yet">
          {m.mapped
            ? `The paper ledger maps ${plural(m.mapped, 'official question')} to this chapter; they are listed below with their keys.`
            : 'The paper ledger has not reached this chapter yet.'}
        </EmptyState>
      )}
      <MappedQuestions chapterId={chapter.id} title="Mapped, not yet solved here" />
    </div>
  );
}
