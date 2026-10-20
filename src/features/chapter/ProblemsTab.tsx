import { Play } from 'lucide-react';
import { Link } from 'react-router';
import { chapterPath } from '@/content/catalog';
import { useScrollToItem } from '@/lib/use-scroll-to-item';
import { plural } from '@/lib/utils';
import { Badge, FrequencyBadge, OriginBadge } from '@/ui/badge';
import { Callout } from '@/ui/callout';
import { MathText } from '@/ui/math';
import { EmptyState, SectionHeading } from '@/ui/primitives';
import type { TabProps } from './tab-props';

export function ProblemsTab({ chapter, body, item }: TabProps) {
  useScrollToItem(item);
  const topicTitle = new Map(body.topics.map((t) => [t.id, t.title]));
  const questionsByTopic = new Map<string, number>();
  for (const q of body.questions) questionsByTopic.set(q.topic, (questionsByTopic.get(q.topic) ?? 0) + 1);

  if (!body.problemTypes.length) return <EmptyState title="No problem types in this chapter" />;
  return (
    <div>
      <SectionHeading
        eyebrow="How GATE frames this chapter"
        title={`Problem types · ${body.problemTypes.length}`}
        action={<span className="hidden font-mono text-[12px] text-faint sm:inline">Each one is a recipe you can run in the exam hall</span>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {body.problemTypes.map((p) => {
          const practice = questionsByTopic.get(p.topic) ?? 0;
          return (
            <article key={p.id} id={p.id} className="glass flex scroll-mt-36 flex-col p-5" aria-labelledby={`${p.id}-title`}>
              <header className="flex flex-wrap items-start justify-between gap-2">
                <h3 id={`${p.id}-title`} className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-ink">
                  {p.title}
                </h3>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge tone="neutral">{p.format}</Badge>
                  <Badge tone="neutral">{plural(p.marks, 'mark')}</Badge>
                  <FrequencyBadge frequency={p.frequency} />
                </div>
              </header>
              <ol className="mt-4 flex-1 space-y-3">
                {p.recipe.map((step, i) => (
                  <li key={step} className="flex gap-3 text-[13.5px] leading-relaxed text-ink/90">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 font-mono text-[11px] font-semibold text-accent">
                      {i + 1}
                    </span>
                    <MathText text={step} className="pt-0.5" />
                  </li>
                ))}
              </ol>
              {p.trap && (
                <Callout tone="trap" title="Trap" className="mt-4">
                  <MathText text={p.trap} />
                </Callout>
              )}
              <footer className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-[12.5px]">
                <Link to={chapterPath(chapter.id, 'learn', p.topic)} className="text-muted hover:text-accent">
                  {topicTitle.get(p.topic) ?? p.topic}
                </Link>
                <OriginBadge origin={p.origin} pages={p.pages} />
                {practice > 0 && (
                  <Link
                    to={`/practice/quiz?${new URLSearchParams({ topics: p.topic, mode: 'practice' })}`}
                    className="ml-auto inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
                  >
                    <Play className="size-3.5" /> Practise ({practice})
                  </Link>
                )}
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
