import { Link, useSearchParams } from 'react-router';
import { chapters, getChapter, loadRevision, subjects } from '@/content/catalog';
import type { RevisionSheet } from '@/content/types';
import { CheatSheet } from '@/features/revision/CheatSheet';
import { useAsync } from '@/lib/use-async';
import { cn, plural } from '@/lib/utils';
import { PageHeader } from '@/ui/page-header';
import { EmptyState, Skeleton } from '@/ui/primitives';

export function RevisionPage() {
  const [params] = useSearchParams();
  const sheets = useAsync(loadRevision, 'revision');
  const pending = chapters.filter((c) => c.status === 'pending').length;
  return (
    <div>
      <PageHeader
        eyebrow="Last-pass revision"
        title="Cheat sheets"
        description={`One dense page per ready chapter: the high-yield points, the revision card, the formulas, the pitfalls and the complexity table. Print one or save it as a PDF. Sheets for the other ${plural(pending, 'chapter')} arrive as they are written.`}
      />
      {sheets.status === 'loading' && <Skeleton className="h-[560px]" />}
      {sheets.status === 'error' && <EmptyState title="The cheat sheets failed to load">{sheets.error.message}</EmptyState>}
      {sheets.status === 'ready' && <SheetBrowser list={sheets.data} chapterId={params.get('chapter')} />}
    </div>
  );
}

function SheetBrowser({ list, chapterId }: { list: RevisionSheet[]; chapterId: string | null }) {
  if (!list.length) return <EmptyState title="No cheat sheet yet">A sheet appears as soon as its chapter is ready.</EmptyState>;
  const sheet = list.find((s) => s.chapter === chapterId) ?? list[0];
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
      <nav aria-label="Cheat sheets" className="glass p-3 lg:sticky lg:top-24" data-print="hide">
        {subjects.map((s) => {
          const own = list.filter((x) => x.subject === s.id);
          if (!own.length) return null;
          return (
            <div key={s.id} className="mb-3 last:mb-0">
              <p className="eyebrow px-2 pb-1">{s.code}</p>
              <ul>
                {own.map((x) => (
                  <li key={x.chapter}>
                    <Link
                      to={`/revision?chapter=${x.chapter}`}
                      replace
                      aria-current={x.chapter === sheet.chapter ? 'page' : undefined}
                      className={cn(
                        'block rounded-md px-2 py-1.5 text-[13px] transition-colors',
                        x.chapter === sheet.chapter ? 'bg-surface-3 text-ink' : 'text-muted hover:bg-surface-3/50 hover:text-ink',
                      )}
                    >
                      {getChapter(x.chapter)?.title ?? x.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
      <CheatSheet sheet={sheet} chapterId={sheet.chapter} />
    </div>
  );
}
