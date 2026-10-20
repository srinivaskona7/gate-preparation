import { Library } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { catalog, loadPyqIndex } from '@/content/catalog';
import { PyqBrowser } from '@/features/pyq/PyqBrowser';
import { useAsync } from '@/lib/use-async';
import { plural } from '@/lib/utils';
import { Button } from '@/ui/button';
import { PageHeader } from '@/ui/page-header';
import { EmptyState, Skeleton } from '@/ui/primitives';

export function PyqsPage() {
  const { pyqId } = useParams();
  const index = useAsync(loadPyqIndex, 'pyq-index');
  const m = catalog.memory;
  return (
    <div>
      <PageHeader
        eyebrow="Official GATE CSE papers 2011–2026"
        title="PYQ solver"
        description={`Real questions from ${plural(m.paperIds.length, 'official paper')}, marked against the final answer keys. Open one to answer it, then reveal the solution a step at a time with its shortcut and traps. ${m.solved} solved so far; ${m.mapped} mapped to chapters from ${plural(m.papers, 'ledgered paper')}.`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/papers">
              <Library /> Browse by paper
            </Link>
          </Button>
        }
      />
      {index.status === 'loading' && <Skeleton className="h-96" />}
      {index.status === 'error' && <EmptyState title="The question index failed to load">{index.error.message}</EmptyState>}
      {index.status === 'ready' &&
        (index.data.length ? (
          <PyqBrowser items={index.data} selected={pyqId} scope="all" pathFor={(id) => (id ? `/pyqs/${id}` : '/pyqs')} />
        ) : (
          <EmptyState title="Solved questions appear here as each chapter is completed">
            The paper ledger and the worked solutions are written from the official papers and final keys, a paper at a time. Chapters
            already in progress show their mapped questions on their PYQ tab.
          </EmptyState>
        ))}
    </div>
  );
}
