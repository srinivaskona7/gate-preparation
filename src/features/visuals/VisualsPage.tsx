import { Activity, ArrowLeft, ArrowRight, Box, Shapes } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { NotFound } from '@/app/RouteStates';
import { chapterPath, getChapter, subjects } from '@/content/catalog';
import { plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { PageHeader } from '@/ui/page-header';
import { EmptyState } from '@/ui/primitives';
import { getVisual, KIND_LABEL, type Visual, type VisualKind, VISUALS } from './registry';
import { VisualFrame } from './VisualFrame';

const KIND_ICON: Record<VisualKind, typeof Activity> = { simulation: Activity, '3d': Box, diagram: Shapes };
const KIND_NOUN: Record<VisualKind, string> = { simulation: 'simulation', '3d': '3D model', diagram: 'diagram' };

export function VisualsPage() {
  const { visualId } = useParams();
  if (visualId) {
    const visual = getVisual(visualId);
    return visual ? <OneVisual visual={visual} /> : <NotFound />;
  }
  const kinds = (Object.keys(KIND_NOUN) as VisualKind[]).flatMap((k) => {
    const n = VISUALS.filter((v) => v.kind === k).length;
    return n ? [plural(n, KIND_NOUN[k])] : [];
  });
  return (
    <div>
      <PageHeader
        eyebrow="Visual lab"
        title="Simulations, 3D models and diagrams"
        description={`Run an algorithm on your own input a step at a time, turn a structure around in 3D, or read the diagram GATE questions are built on. ${kinds.join(' · ')}.`}
      />
      {VISUALS.length ? (
        <div className="space-y-8">
          {subjects.map((s) => {
            const list = VISUALS.filter((v) => v.subject === s.code);
            if (!list.length) return null;
            return (
              <section key={s.id} aria-labelledby={`visuals-${s.id}`}>
                <h2 id={`visuals-${s.id}`} className="mb-3 flex items-baseline gap-2 text-lg font-semibold text-ink">
                  <span className="font-mono text-[12px] text-accent">{s.code}</span> {s.title}
                </h2>
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((v) => (
                    <li key={v.id}>
                      <VisualCard visual={v} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No visual yet" />
      )}
    </div>
  );
}

function VisualCard({ visual: v }: { visual: Visual }) {
  const Icon = KIND_ICON[v.kind];
  return (
    <Link to={`/visuals/${v.id}`} className="glass group flex h-full flex-col p-5 transition-colors hover:border-line-strong">
      <p className="eyebrow flex items-center gap-1.5 text-accent">
        <Icon className="size-3.5" aria-hidden /> {KIND_LABEL[v.kind]}
      </p>
      <h3 className="mt-2 text-[15.5px] font-semibold leading-snug text-ink group-hover:text-accent">{v.title}</h3>
      <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">{v.blurb}</p>
      <p className="mt-4 flex items-center justify-between gap-2 font-mono text-[11px] text-faint">
        {plural(v.chapters.length, 'chapter')} · {plural(v.topics.length, 'topic')}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </p>
    </Link>
  );
}

function OneVisual({ visual: v }: { visual: Visual }) {
  const homes = v.chapters.flatMap((id) => getChapter(id) ?? []);
  return (
    <div>
      <PageHeader
        eyebrow={
          <Link to="/visuals" className="inline-flex items-center gap-1 hover:text-accent">
            <ArrowLeft className="size-3.5" aria-hidden /> Visual lab
          </Link>
        }
        title={v.title}
        description={v.blurb}
        actions={homes.map((c) => (
          <Link key={c.id} to={chapterPath(c.id)} className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-accent">
            <Badge tone="neutral">{c.subject.code}</Badge> {c.title}
          </Link>
        ))}
      />
      <VisualFrame visual={v} header={false} />
    </div>
  );
}
