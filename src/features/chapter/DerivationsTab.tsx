import { Pi } from 'lucide-react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router';
import { chapterPath, loadDerivations, topicTitles } from '@/content/catalog';
import { useAsync } from '@/lib/use-async';
import { useScrollToItem } from '@/lib/use-scroll-to-item';
import { plural } from '@/lib/utils';
import { RenderedHtml } from '@/ui/rendered-html';
import { EmptyState, Skeleton } from '@/ui/primitives';
import type { TabProps } from './tab-props';

const sectionId = (slug: string) => `d-${slug}`;

export function DerivationsTab({ chapter, item }: TabProps) {
  if (!chapter.memory.derivations) {
    return (
      <EmptyState title="Derivations for this chapter are being written">
        Each one states a result with its assumptions, proves it in full and shows where GATE uses it. They appear here as soon as they pass
        validation.
      </EmptyState>
    );
  }
  return <Derivations chapterId={chapter.id} item={item} />;
}

function Derivations({ chapterId, item }: { chapterId: string; item?: string }) {
  const state = useAsync(() => loadDerivations(chapterId), `derivations:${chapterId}`);
  useScrollToItem(item ? sectionId(item) : undefined, state.status === 'ready');
  if (state.status === 'loading') return <Skeleton className="h-96" />;
  if (state.status === 'error') return <EmptyState title="The derivations failed to load">{state.error.message}</EmptyState>;
  const d = state.data;

  const jump = (e: MouseEvent, slug: string) => {
    e.preventDefault();
    document.getElementById(sectionId(slug))?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      <nav aria-label="Derivations in this chapter" data-print="hide" className="lg:sticky lg:top-40 lg:self-start">
        <p className="eyebrow mb-2">{plural(d.sections.length, 'derivation')}</p>
        <ol className="space-y-0.5 border-l border-line">
          {d.sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => jump(e, s.id)}
                className="-ml-px flex gap-2 border-l border-transparent py-1.5 pl-3 text-[13px] leading-snug text-muted hover:border-accent hover:text-ink"
              >
                <span className="font-mono text-[11px] text-faint">{i + 1}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="min-w-0 space-y-6">
        <header className="glass p-6">
          <p className="eyebrow mb-1 flex items-center gap-2 text-accent">
            <Pi className="size-3.5" aria-hidden /> Proofs and derivations
          </p>
          <h2 className="text-[22px] font-bold text-ink">{d.title}</h2>
          {d.intro && <RenderedHtml html={d.intro} className="mt-3 text-muted" />}
        </header>
        {d.sections.map((s, i) => (
          <section key={s.id} id={sectionId(s.id)} className="glass scroll-mt-36 p-6" aria-labelledby={`${sectionId(s.id)}-title`}>
            <p className="font-mono text-[11px] text-faint">Derivation {i + 1}</p>
            <h3 id={`${sectionId(s.id)}-title`} className="mt-1 text-[18px] font-semibold text-ink">
              {s.title}
            </h3>
            {s.topics.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-1.5">
                {s.topics.map((t) => (
                  <Link
                    key={t}
                    to={chapterPath(chapterId, 'learn', t)}
                    className="rounded-md border border-line bg-surface-2/70 px-2 py-0.5 font-mono text-[11px] text-muted hover:border-accent/40 hover:text-accent"
                  >
                    {topicTitles.get(t) ?? t}
                  </Link>
                ))}
              </p>
            )}
            <RenderedHtml html={s.html} className="mt-4" />
          </section>
        ))}
      </div>
    </div>
  );
}
