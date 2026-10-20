import { CircleCheck, CircleX, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { chapters, getChapter, paperShortTitle, subjects, topicTitles } from '@/content/catalog';
import { useProgress } from '@/features/progress/store';
import { plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { MathText } from '@/ui/math';
import { EmptyState } from '@/ui/primitives';
import { Segmented } from '@/ui/segmented';
import { Select } from '@/ui/select';
import { activeFilterCount, filterPyqs, type PyqFilters, type PyqListItem, readFilters, withFilter } from './filters';
import { PyqSolverFor } from './PyqSolver';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'mcq', label: 'MCQ' },
  { value: 'msq', label: 'MSQ' },
  { value: 'nat', label: 'NAT' },
] as const;
const MARK_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: '1', label: '1 mark' },
  { value: '2', label: '2 marks' },
] as const;
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'Unattempted' },
  { value: 'wrong', label: 'Got wrong' },
  { value: 'correct', label: 'Solved' },
] as const;

/**
 * A filterable PYQ list whose rows open the split-drawer solver. Filters live in the query
 * string, so opening and closing questions, reloading and sharing all keep them.
 */
export function PyqBrowser({ items, selected, pathFor, scope }: { items: PyqListItem[]; selected?: string; pathFor: (id?: string) => string; scope: 'all' | 'chapter' }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const attempts = useProgress((s) => s.attempts);
  const filters = readFilters(params);
  const shown = filterPyqs(items, filters, attempts);
  const years = [...new Set(items.map((p) => p.year))].sort((a, b) => b - a);
  const setFilter = (key: keyof PyqFilters, value: string) => setParams(withFilter(params, key, value), { replace: true });

  const open = (id?: string, replace = false) => navigate({ pathname: pathFor(id), search: params.toString() }, { replace, preventScrollReset: true });
  const entry = selected ? items.find((p) => p.id === selected) : undefined;
  // Step through what is on screen; a deep link to a filtered-out question steps through everything.
  const sequence = entry && shown.some((p) => p.id === entry.id) ? shown : items;
  const at = entry ? sequence.findIndex((p) => p.id === entry.id) : -1;

  return (
    <div>
      <FilterBar filters={filters} setFilter={setFilter} years={years} scope={scope} onClear={() => setParams(new URLSearchParams(), { replace: true })} />
      <p className="mb-3 font-mono text-[12px] text-faint" aria-live="polite">
        {shown.length === items.length ? plural(items.length, 'question') : `${shown.length} of ${plural(items.length, 'question')}`}
      </p>
      {shown.length ? <GroupedList items={shown} hrefFor={(id) => ({ pathname: pathFor(id), search: params.toString() })} attempts={attempts} showChapter={scope === 'all'} /> : (
        <EmptyState title="No question matches these filters">
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            Clear the filters
          </Button>
        </EmptyState>
      )}
      <PyqSolverFor
        entry={entry}
        open={Boolean(selected)}
        onClose={() => open(undefined)}
        nav={
          at >= 0
            ? {
                index: at,
                total: sequence.length,
                prev: at > 0 ? () => open(sequence[at - 1].id, true) : undefined,
                next: at < sequence.length - 1 ? () => open(sequence[at + 1].id, true) : undefined,
              }
            : undefined
        }
      />
    </div>
  );
}

function FilterBar({
  filters: f,
  setFilter,
  years,
  scope,
  onClear,
}: {
  filters: PyqFilters;
  setFilter: (key: keyof PyqFilters, value: string) => void;
  years: number[];
  scope: 'all' | 'chapter';
  onClear: () => void;
}) {
  const active = activeFilterCount(f);
  const chapterOptions = chapters.filter((c) => (f.subject === 'all' || c.subject.id === f.subject) && c.memory.pyqs > 0);
  return (
    <div className="glass mb-4 space-y-3 p-4" role="search" aria-label="Filter questions">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search question text</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <input
            value={f.q}
            onChange={(e) => setFilter('q', e.target.value)}
            placeholder="Filter by words in the question"
            className="h-9 w-full rounded-[10px] border border-line bg-surface-2/70 pl-9 pr-3 text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent"
          />
        </label>
        <Select label="Year" value={f.year} onChange={(v) => setFilter('year', v)} options={[['all', 'All years'], ...years.map((y) => [String(y), String(y)] as [string, string])]} />
        {scope === 'all' && (
          <>
            <Select
              label="Subject"
              value={f.subject}
              onChange={(v) => setFilter('subject', v)}
              options={[['all', 'All subjects'], ...subjects.map((s) => [s.id, s.title] as [string, string])]}
            />
            <Select
              label="Chapter"
              value={f.chapter}
              onChange={(v) => setFilter('chapter', v)}
              options={[['all', 'All chapters'], ...chapterOptions.map((c) => [c.id, c.title] as [string, string])]}
            />
          </>
        )}
        {active > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X /> Clear {plural(active, 'filter')}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="size-4 text-faint" aria-hidden />
        <Segmented label="Question type" size="xs" value={f.type} onChange={(v) => setFilter('type', v)} options={TYPE_OPTIONS} />
        <Segmented label="Marks" size="xs" value={f.marks} onChange={(v) => setFilter('marks', v)} options={MARK_OPTIONS} />
        <Segmented
          label="Difficulty"
          size="xs"
          value={f.difficulty}
          onChange={(v) => setFilter('difficulty', v)}
          options={[
            { value: 'all', label: 'Any level' },
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' },
          ]}
        />
        <Segmented label="Your attempts" size="xs" value={f.status} onChange={(v) => setFilter('status', v)} options={STATUS_OPTIONS} />
      </div>
    </div>
  );
}

function GroupedList({
  items,
  hrefFor,
  attempts,
  showChapter,
}: {
  items: PyqListItem[];
  hrefFor: (id: string) => { pathname: string; search: string };
  attempts: Record<string, { correct: boolean }>;
  showChapter: boolean;
}) {
  const groups = new Map<string, PyqListItem[]>();
  for (const p of items) groups.set(p.paper, [...(groups.get(p.paper) ?? []), p]);
  return (
    <div className="space-y-6">
      {[...groups].map(([paper, list]) => (
        <section key={paper} aria-label={paperShortTitle(paper)}>
          <p className="eyebrow mb-2 flex items-center gap-2">
            GATE CSE {paperShortTitle(paper)}
            <span className="text-faint/70">· {plural(list.length, 'question')}</span>
          </p>
          <ul className="glass divide-y divide-line overflow-hidden p-0">
            {list.map((p) => {
              const a = attempts[p.id];
              const chapter = showChapter ? getChapter(p.chapter) : undefined;
              return (
                <li key={p.id}>
                  <Link
                    to={hrefFor(p.id)}
                    preventScrollReset
                    className="grid gap-x-4 gap-y-2 px-4 py-3.5 transition-colors hover:bg-surface-3/40 sm:grid-cols-[72px_minmax(0,1fr)_auto]"
                  >
                    <span className="font-mono text-[12px] font-semibold text-accent">
                      {p.section === 'GA' ? 'GA ' : 'Q'}
                      {p.n}
                    </span>
                    <span className="min-w-0">
                      <MathText text={p.preview} className="line-clamp-2 text-[13.5px] leading-relaxed text-ink" />
                      <span className="mt-1 block truncate font-mono text-[11px] text-faint">
                        {topicTitles.get(p.topic) ?? p.topic}
                        {chapter && ` · ${chapter.subject.code} ${chapter.title}`}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 sm:justify-end">
                      {p.mta && <Badge tone="violet">MTA</Badge>}
                      {p.disputed && (
                        <Badge tone="amber" title="Our derivation questions the official key; the solution explains why">
                          Key note
                        </Badge>
                      )}
                      <Badge tone="neutral">{p.type}</Badge>
                      <Badge tone="neutral">{p.marks}M</Badge>
                      {a ? (
                        a.correct ? (
                          <CircleCheck className="size-4 text-emerald" aria-label="Last attempt correct" />
                        ) : (
                          <CircleX className="size-4 text-coral" aria-label="Last attempt wrong" />
                        )
                      ) : (
                        <span className="size-4" aria-hidden />
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
