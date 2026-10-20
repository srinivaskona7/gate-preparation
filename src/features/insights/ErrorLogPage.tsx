import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { chapterPath, chapters, getChapter, topicTitles } from '@/content/catalog';
import { ERROR_TAGS, type ErrorTag, useProgress } from '@/features/progress/store';
import { TAG_LABEL } from '@/features/progress/error-tags';
import { isPyqId } from '@/features/quiz/selection';
import { useAsync } from '@/lib/use-async';
import { cn, plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { PageHeader } from '@/ui/page-header';
import { Segmented } from '@/ui/segmented';
import { Select } from '@/ui/select';
import { Card, EmptyState, Skeleton } from '@/ui/primitives';
import { type ErrorEntry, errorLog, type QuestionMeta, tagCounts } from './analytics';
import { loadQuestionMeta } from './meta';

export { TAG_LABEL };

type Status = 'open' | 'fixed' | 'all';
const STATUS_OPTIONS = [
  { value: 'open' as const, label: 'Still wrong' },
  { value: 'fixed' as const, label: 'Since fixed' },
  { value: 'all' as const, label: 'All' },
];

export function ErrorLogPage() {
  const meta = useAsync(loadQuestionMeta, 'question-meta');
  return (
    <div>
      <PageHeader
        eyebrow="Learn from misses"
        title="Error log"
        description="Every question you have answered wrong. Tag each miss with its cause; the tally shows whether you lose marks to gaps in a concept, to slips, or to the clock."
      />
      {meta.status === 'loading' && <Skeleton className="h-96" />}
      {meta.status === 'error' && <EmptyState title="The error log failed to load">{meta.error.message}</EmptyState>}
      {meta.status === 'ready' && <Log meta={meta.data} />}
    </div>
  );
}

const retryHref = (ids: string[], source: 'practice' | 'pyq') =>
  `/practice/quiz?${new URLSearchParams({ ...(source === 'pyq' ? { source } : {}), ids: ids.join(','), title: 'Retry misses' })}`;

function Log({ meta }: { meta: QuestionMeta[] }) {
  const history = useProgress((s) => s.history);
  const tags = useProgress((s) => s.errorTags);
  const [status, setStatus] = useState<Status>('open');
  const [tag, setTag] = useState<ErrorTag | 'untagged' | ''>('');
  const [chapter, setChapter] = useState('');
  const all = errorLog(history, meta, tags);
  const counts = tagCounts(all);
  const shown = all.filter(
    (e) =>
      (status === 'all' || (status === 'open') === e.open) &&
      (!tag || (e.tag ?? 'untagged') === tag) &&
      (!chapter || e.chapter === chapter),
  );
  const open = shown.filter((e) => e.open).map((e) => e.id);
  const openPractice = open.filter((id) => !isPyqId(id));
  const openPyq = open.filter(isPyqId);

  if (!all.length) return <EmptyState title="No misses yet">Questions you answer wrong anywhere on the site are listed here.</EmptyState>;
  return (
    <div className="space-y-5">
      <Card>
        <p className="eyebrow mb-3">Why marks were lost</p>
        <ul className="flex flex-wrap gap-2">
          {([...ERROR_TAGS, 'untagged'] as const).map((t) => (
            <li key={t}>
              <button
                type="button"
                aria-pressed={tag === t}
                onClick={() => setTag(tag === t ? '' : t)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-left text-[12.5px] transition-colors',
                  tag === t ? 'border-accent bg-accent/10 text-ink' : 'border-line text-muted hover:text-ink',
                )}
              >
                <span className="block font-mono text-lg font-semibold text-ink">{counts[t]}</span>
                {t === 'untagged' ? 'Not tagged' : TAG_LABEL[t]}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Status" size="xs" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <Select
          label="Chapter"
          value={chapter}
          idle=""
          onChange={setChapter}
          options={[['', 'Every chapter'], ...chapters.filter((c) => all.some((e) => e.chapter === c.id)).map((c): [string, string] => [c.id, c.title])]}
        />
        <span className="ml-auto flex gap-2">
          {openPractice.length > 0 && (
            <Button variant="primary" size="sm" asChild>
              <Link to={retryHref(openPractice, 'practice')}>
                <RotateCcw /> Retry {plural(openPractice.length, 'practice miss', 'practice misses')}
              </Link>
            </Button>
          )}
          {openPyq.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link to={retryHref(openPyq, 'pyq')}>
                <RotateCcw /> Retry {plural(openPyq.length, 'PYQ miss', 'PYQ misses')}
              </Link>
            </Button>
          )}
        </span>
      </div>

      {shown.length ? (
        <ul className="space-y-2">
          {shown.map((e) => (
            <Row key={e.id} entry={e} />
          ))}
        </ul>
      ) : (
        <EmptyState title="Nothing matches these filters" />
      )}
    </div>
  );
}

function Row({ entry: e }: { entry: ErrorEntry }) {
  const tagError = useProgress((s) => s.tagError);
  const href = isPyqId(e.id) ? chapterPath(e.chapter, 'pyqs', e.id) : chapterPath(e.chapter, 'practice', e.id);
  return (
    <li className="glass flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <Link to={href} className="font-mono text-[12.5px] text-ink hover:text-accent">
          {e.id}
        </Link>
        <p className="truncate text-[12px] text-faint">
          {getChapter(e.chapter)?.title} · {topicTitles.get(e.topic) ?? e.topic}
        </p>
      </div>
      <Badge tone={e.open ? 'coral' : 'emerald'}>{e.open ? 'still wrong' : 'fixed'}</Badge>
      <span className="font-mono text-[11px] text-faint">
        {e.wrong} of {plural(e.seen, 'answer')} wrong
      </span>
      <Select
        label={`Cause of the miss on ${e.id}`}
        value={e.tag ?? ''}
        idle=""
        onChange={(v) => tagError(e.id, (ERROR_TAGS as readonly string[]).includes(v) ? (v as ErrorTag) : null)}
        options={[['', 'Tag the cause…'], ...ERROR_TAGS.map((t): [string, string] => [t, TAG_LABEL[t]])]}
      />
    </li>
  );
}
