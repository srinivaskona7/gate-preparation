import { ExternalLink } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router';
import { catalog, chapterPath, getChapter, topicTitles } from '@/content/catalog';
import type { SyllabusItem } from '@/content/types';
import { type SyllabusStatus, SyllabusStatusBadge } from '@/features/syllabus/status';
import { useScrollToItem } from '@/lib/use-scroll-to-item';
import { formatDate, plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Callout } from '@/ui/callout';
import { PageHeader } from '@/ui/page-header';
import { EmptyState, SectionHeading } from '@/ui/primitives';
import { Segmented } from '@/ui/segmented';

type StatusFilter = 'all' | SyllabusStatus;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'covered', label: 'Covered' },
  { value: 'partial', label: 'Partial' },
  { value: 'curated', label: 'Curated' },
  { value: 'pending', label: 'In progress' },
] as const;
const isStatus = (v: string | null): v is StatusFilter => STATUS_OPTIONS.some((o) => o.value === v);

const DOCUMENTS: { key: string; label: string }[] = [
  { key: 'cs', label: 'CS syllabus' },
  { key: 'ga', label: 'GA syllabus' },
  { key: 'brochure', label: 'Information brochure' },
];

export function SyllabusPage() {
  const { itemId } = useParams();
  const [params, setParams] = useSearchParams();
  const { items, dropped } = catalog.syllabus;
  const exam = catalog.exam;
  const raw = params.get('status');
  const status: StatusFilter = isStatus(raw) ? raw : 'all';
  const newOnly = params.get('new') === '1';
  const set = (key: string, value: string | null) =>
    setParams(
      (p) => {
        if (value) p.set(key, value);
        else p.delete(key);
        return p;
      },
      { replace: true },
    );
  useScrollToItem(itemId ? `syllabus-${itemId}` : undefined);

  // A deep-linked item stays visible whatever the filters say.
  const shown = items.filter((i) => i.id === itemId || ((status === 'all' || i.status === status) && (!newOnly || i.new2027)));
  const sections = [...new Set(shown.map((i) => i.section))];
  const count = (s: SyllabusStatus) => items.filter((i) => i.status === s).length;
  const fresh = items.filter((i) => i.new2027).length;

  return (
    <div>
      <PageHeader
        eyebrow={`${exam.name} · ${exam.organizer}`}
        title="2027 syllabus map"
        description={`Every line of the official GATE 2027 CS and GA syllabus, mapped to the chapter and topics that teach it. Published ${formatDate(exam.syllabusPublished)}; checked against the official PDF on ${formatDate(exam.syllabusAccessed)}.`}
        actions={DOCUMENTS.filter((d) => exam.documents[d.key]).map((d) => (
          <Button key={d.key} variant="outline" size="sm" asChild>
            <a href={exam.documents[d.key]} target="_blank" rel="noreferrer">
              {d.label} <ExternalLink />
            </a>
          </Button>
        ))}
      />

      <Callout tone="note" title="What changed from 2026" className="mb-6">
        {exam.changesFrom2026} {plural(fresh, 'item')} {fresh === 1 ? 'is' : 'are'} new in 2027 and marked below.
      </Callout>

      <div className="glass mb-6 flex flex-wrap items-center gap-3 p-4" role="search" aria-label="Filter syllabus items">
        <Segmented<StatusFilter> label="Coverage" size="xs" value={status} onChange={(v) => set('status', v === 'all' ? null : v)} options={STATUS_OPTIONS} />
        <Button variant={newOnly ? 'secondary' : 'ghost'} size="sm" aria-pressed={newOnly} onClick={() => set('new', newOnly ? null : '1')}>
          New in 2027 · {fresh}
        </Button>
        <p className="ml-auto font-mono text-[11.5px] text-faint" aria-live="polite">
          {shown.length === items.length ? plural(items.length, 'item') : `${shown.length} of ${plural(items.length, 'item')}`} · {count('covered')} covered ·{' '}
          {count('partial')} partial · {count('curated')} curated · {count('pending')} in progress
        </p>
      </div>

      {sections.length ? (
        <div className="space-y-8">
          {sections.map((section, n) => (
            <section key={section} aria-labelledby={`syllabus-section-${n}`}>
              <h2 id={`syllabus-section-${n}`} className="eyebrow mb-2">
                {section.startsWith('GA') ? `General aptitude ${section.slice(3)}` : `Section ${section}`}
              </h2>
              <ul className="glass divide-y divide-line overflow-hidden p-0">
                {shown
                  .filter((i) => i.section === section)
                  .map((i) => (
                    <Item key={i.id} item={i} />
                  ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState title="No syllabus item matches">
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            Clear the filters
          </Button>
        </EmptyState>
      )}

      {dropped.length > 0 && (
        <section aria-labelledby="dropped-title" className="mt-10">
          <SectionHeading id="dropped-title" eyebrow="Gone from 2027" title="Named in 2026, not in 2027" />
          <p className="mb-3 max-w-3xl text-[13px] leading-relaxed text-muted">
            The notes still teach these, since neighbouring topics lean on them, but the 2027 syllabus no longer names them: give them less time.
          </p>
          <ul className="glass divide-y divide-line overflow-hidden p-0">
            {dropped.map((d) => {
              const chapter = getChapter(d.chapter);
              return (
                <li key={`${d.chapter}:${d.text}`} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-2.5 text-[13px]">
                  <span className="text-ink/90 line-through decoration-faint">{d.text}</span>
                  {chapter && (
                    <Link to={chapterPath(chapter.id)} className="ml-auto font-mono text-[11.5px] text-faint hover:text-accent">
                      {chapter.subject.code} · {chapter.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function Item({ item: i }: { item: SyllabusItem }) {
  const chapter = getChapter(i.chapter);
  return (
    <li id={`syllabus-${i.id}`} className="scroll-mt-36 px-4 py-3">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
        <p className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-ink">{i.text}</p>
        <span className="flex shrink-0 items-center gap-1.5">
          {i.new2027 && <Badge tone="violet">New in 2027</Badge>}
          <SyllabusStatusBadge status={i.status} />
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px]">
        {chapter && (
          <Link to={chapterPath(chapter.id)} className="text-muted hover:text-accent">
            {chapter.subject.code} · {chapter.title}
          </Link>
        )}
        {i.topics.map((t) => (
          <Link key={t} to={chapterPath(i.chapter, 'learn', t)} className="text-faint hover:text-accent">
            {topicTitles.get(t) ?? t}
          </Link>
        ))}
      </div>
    </li>
  );
}
