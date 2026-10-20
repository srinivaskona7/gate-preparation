import { Activity, Box, Maximize2, Shapes } from 'lucide-react';
import { Suspense } from 'react';
import { Link } from 'react-router';
import { usePrefs } from '@/features/progress/store';
import { cn } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Skeleton } from '@/ui/primitives';
import { type DiagramVisual, KIND_LABEL, type Visual, type VisualKind } from './registry';

const KIND_ICON: Record<VisualKind, typeof Activity> = { simulation: Activity, '3d': Box, diagram: Shapes };

/**
 * One visual in a card: a live simulation, a three.js scene or a static diagram. `header={false}`
 * is for a page whose own heading already names the visual.
 */
export function VisualFrame({ visual: v, compact = false, header = true, className }: { visual: Visual; compact?: boolean; header?: boolean; className?: string }) {
  const Icon = KIND_ICON[v.kind];
  const titleId = `visual-${v.id}-title`;
  return (
    <figure
      aria-labelledby={header ? titleId : undefined}
      aria-label={header ? undefined : v.title}
      className={cn('glass overflow-hidden p-0', className)}
    >
      {header && (
      <header className={cn('flex items-start justify-between gap-3 border-b border-line', compact ? 'px-4 py-3' : 'px-5 py-4')}>
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-1.5 text-accent">
            <Icon className="size-3.5" aria-hidden /> {KIND_LABEL[v.kind]}
            <Badge tone="neutral" className="ml-1">
              {v.subject}
            </Badge>
          </p>
          <h3 id={titleId} className={cn('mt-1.5 font-semibold leading-snug text-ink', compact ? 'text-[15px]' : 'text-[17px]')}>
            {v.title}
          </h3>
          {!compact && <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted">{v.blurb}</p>}
        </div>
        {compact && (
          <Link
            to={`/visuals/${v.id}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 font-mono text-[11px] text-muted hover:bg-surface-3/60 hover:text-accent"
            aria-label={`Open ${v.title} full size`}
          >
            <Maximize2 className="size-3.5" aria-hidden /> Full size
          </Link>
        )}
      </header>
      )}
      <div className={compact ? 'p-4' : 'p-5'}>
        {v.kind === 'diagram' ? (
          <Diagram visual={v} />
        ) : (
          <Suspense fallback={<Skeleton className={compact ? 'h-72' : 'h-96'} />}>
            <v.component compact={compact} />
          </Suspense>
        )}
      </div>
    </figure>
  );
}

function Diagram({ visual: v }: { visual: DiagramVisual }) {
  const theme = usePrefs((s) => s.theme);
  const src = `${import.meta.env.BASE_URL}diagrams/${v.file}${theme === 'dark' ? '-dark' : ''}.svg`;
  return (
    <a href={src} target="_blank" rel="noreferrer" className="block overflow-x-auto rounded-[10px]" title="Open the SVG in a new tab">
      <img src={src} alt={v.alt} className="mx-auto h-auto w-full min-w-[560px] max-w-[1100px]" loading="lazy" decoding="async" />
    </a>
  );
}
