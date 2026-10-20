import { ArrowRight, BookMarked, CircleAlert, ExternalLink, Sparkles } from 'lucide-react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router';
import { catalog, type ChapterEntry, chapterPath, topicTitles } from '@/content/catalog';
import type { ChapterBody, Topic } from '@/content/types';
import { MASTERY_LABEL, MASTERY_LEVELS, type Mastery } from '@/features/progress/metrics';
import { useProgress } from '@/features/progress/store';
import { useChapterPyqs } from '@/features/pyq/use-pyqs';
import { SyllabusStatusBadge } from '@/features/syllabus/status';
import { VisualFrame } from '@/features/visuals/VisualFrame';
import { visualsFor } from '@/features/visuals/registry';
import { LessonPanel } from './LessonPanel';
import { useScrollToItem } from '@/lib/use-scroll-to-item';
import { plural } from '@/lib/utils';
import { Badge, FrequencyBadge, OriginBadge } from '@/ui/badge';
import { Callout } from '@/ui/callout';
import { MathText } from '@/ui/math';
import { Card, SectionHeading } from '@/ui/primitives';
import { Segmented } from '@/ui/segmented';
import type { TabProps } from './tab-props';

const syllabusText = new Map(catalog.syllabus.items.map((i) => [i.id, i] as const));
const MASTERY_OPTIONS = MASTERY_LEVELS.map((value) => ({ value, label: MASTERY_LABEL[value] }));

export function LearnTab({ chapter, body, item }: TabProps) {
  useScrollToItem(item);
  const featured = visualsFor(chapter.id)[0];
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-10">
        <section aria-labelledby="hy-title">
          <SectionHeading id="hy-title" eyebrow="High yield" title="What GATE asks from this chapter" />
          <ol className="grid gap-3 sm:grid-cols-2">
            {body.highYield.map((h, i) => (
              <li key={h} className="glass flex gap-3 p-4">
                <span className="font-mono text-[12px] font-semibold text-accent">{String(i + 1).padStart(2, '0')}</span>
                <MathText text={h} className="text-[13.5px] leading-relaxed text-ink/90" />
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="topics-title">
          <SectionHeading
            id="topics-title"
            eyebrow="Key concepts"
            title="Topics"
            action={<span className="font-mono text-[12px] text-faint">{plural(body.topics.length, 'topic')}</span>}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {body.topics.map((t) => (
              <TopicCard key={t.id} topic={t} chapterId={chapter.id} open={item === t.id} />
            ))}
          </div>
        </section>

        {body.pitfalls.length > 0 && (
          <section aria-labelledby="pitfalls-title">
            <SectionHeading id="pitfalls-title" eyebrow="Where marks are lost" title="Pitfalls" />
            <ul className="glass divide-y divide-line">
              {body.pitfalls.map((p) => (
                <li key={p.text} className="flex gap-3 px-5 py-3.5">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
                  <MathText text={p.text} className="text-[13.5px] leading-relaxed text-ink/90" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {body.errata.length > 0 && (
          <section aria-labelledby="errata-title">
            <SectionHeading id="errata-title" eyebrow="Corrections to the study notes" title="Errata" />
            <div className="space-y-3">
              {body.errata.map((e) => (
                <Callout key={`${e.page}-${e.claim}`} tone="erratum" title={`Erratum · notes p. ${e.page}`}>
                  <p className="text-muted">
                    The notes say: <MathText text={e.claim} className="italic" />
                  </p>
                  <p className="mt-1.5">
                    <MathText text={e.correction} />
                  </p>
                </Callout>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-6">
        {featured && (
          <div>
            <p className="eyebrow mb-2">Interactive</p>
            <VisualFrame visual={featured} compact />
          </div>
        )}
        <FeaturedPyq chapter={chapter} />
        <SyllabusCoverage body={body} />
        <References body={body} />
      </aside>
    </div>
  );
}

function TopicCard({ topic, chapterId, open }: { topic: Topic; chapterId: string; open: boolean }) {
  const level = useProgress((s) => s.mastery[topic.id] ?? 'new');
  const setMastery = useProgress((s) => s.setMastery);
  return (
    <article id={topic.id} className="glass flex scroll-mt-36 flex-col p-5" aria-labelledby={`${topic.id}-title`}>
      <header className="flex items-start justify-between gap-3">
        <h3 id={`${topic.id}-title`} className="text-[15.5px] font-semibold leading-snug text-ink">
          {topic.title}
        </h3>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {topic.beyondSyllabus && (
            <Badge tone="neutral" title="The 2027 syllabus no longer names this; it does not count towards mastery">
              Beyond 2027
            </Badge>
          )}
          <OriginBadge origin={topic.origin} pages={topic.pages} />
          <FrequencyBadge frequency={topic.frequency} />
        </div>
      </header>
      <div className="flex-1">
        <ul className="prose-points mt-3 list-disc space-y-2 pl-5 text-[13.5px] leading-relaxed text-ink/90">
          {topic.points.map((p) => (
            <li key={p}>
              <MathText text={p} />
            </li>
          ))}
        </ul>
        {topic.keyTerms && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Key terms">
            {topic.keyTerms.map((k) => (
              <li key={k} className="rounded-md border border-line bg-surface-2/70 px-2 py-0.5 font-mono text-[11px] text-muted">
                {k}
              </li>
            ))}
          </ul>
        )}
        <LessonPanel topic={topic} chapterId={chapterId} defaultOpen={open} />
      </div>
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <span className="eyebrow">Your level</span>
        <Segmented<Mastery>
          size="xs"
          label={`Mastery of ${topic.title}`}
          value={level}
          onChange={(v) => setMastery(topic.id, v)}
          options={MASTERY_OPTIONS}
        />
      </footer>
    </article>
  );
}

function FeaturedPyq({ chapter }: { chapter: ChapterEntry }) {
  const pyqs = useChapterPyqs(chapter.id);
  if (pyqs.status !== 'ready' || !pyqs.data.length) return null;
  const q = pyqs.data[0];
  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[12px] font-semibold text-accent">
          <BookMarked className="size-4" aria-hidden />
          {q.paperTitle} · Q{q.n}
        </p>
        <span className="font-mono text-[11px] text-faint">
          {q.type.toUpperCase()} · {plural(q.marks, 'mark')}
        </span>
      </div>
      <MathText text={q.stem} className="line-clamp-5 text-[13.5px] leading-relaxed text-ink/90" />
      <Link
        to={chapterPath(chapter.id, 'pyqs', q.id)}
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
      >
        Solve it step by step <ArrowRight className="size-3.5" />
      </Link>
      <p className="mt-1 text-[12px] text-faint">
        {plural(pyqs.data.length, 'official question')} solved for this chapter.
      </p>
    </Card>
  );
}

function SyllabusCoverage({ body }: { body: ChapterBody }) {
  if (!body.syllabusCoverage.length) return null;
  return (
    <Card className="p-5">
      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
        <Sparkles className="size-4 text-accent" aria-hidden /> 2027 syllabus items
      </h2>
      <ul className="space-y-3">
        {body.syllabusCoverage.map((c) => {
          const s = syllabusText.get(c.item);
          return (
            <li key={c.item} className="text-[13px] leading-relaxed">
              <div className="flex items-start justify-between gap-2">
                <p className="text-ink/90">{s?.text ?? c.item}</p>
                <SyllabusStatusBadge status={c.status} />
              </div>
              {s?.new2027 && (
                <Badge tone="accent" className="mt-1">
                  New in 2027
                </Badge>
              )}
              <p className="mt-1 text-[12px] text-faint">
                {c.topics.map((t, i) => (
                  <span key={t}>
                    {i > 0 && ' · '}
                    <a href={`#${t}`} onClick={(e) => scrollToTopic(e, t)} className="hover:text-accent">
                      {topicTitles.get(t) ?? t}
                    </a>
                  </span>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/** Topic links stay on the page: under hash routing a bare #anchor would change the route. */
function scrollToTopic(e: MouseEvent, id: string) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function References({ body }: { body: ChapterBody }) {
  if (!body.references.length) return null;
  const groups = new Map<string, typeof body.references>();
  for (const r of body.references) groups.set(r.group, [...(groups.get(r.group) ?? []), r]);
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-[15px] font-semibold text-ink">Further reading</h2>
      <div className="space-y-4">
        {[...groups].map(([group, refs]) => (
          <div key={group}>
            <p className="eyebrow mb-1.5">{group}</p>
            <ul className="space-y-1">
              {refs.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-1.5 text-[13px] leading-snug text-muted hover:text-accent"
                  >
                    <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
