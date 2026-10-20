import type { PyqDiagram as Diagram } from '@/content/types';
import { cn } from '@/lib/utils';

/** Where a PYQ's drawings live in the built site; relative, so any Pages path works. */
export const diagramUrl = (id: string, part: 'stem' | 'solution') => `diagrams/pyq/${id}${part === 'solution' ? '-solution' : ''}.svg`;

/**
 * A PYQ drawing. It loads as an <img>, so its SVG can run nothing, and it sits on a white card in
 * both themes because an <img> cannot follow the page's text colour.
 */
export function PyqDiagram({ id, part, diagram, caption, className }: { id: string; part: 'stem' | 'solution'; diagram: Diagram; caption: string; className?: string }) {
  return (
    <figure className={cn('overflow-hidden rounded-[12px] border border-line', className)}>
      <div className="overflow-x-auto bg-white p-3">
        <img src={diagramUrl(id, part)} alt={diagram.alt} loading="lazy" className="mx-auto block h-auto max-w-full min-w-[280px]" />
      </div>
      <figcaption className="border-t border-line bg-surface-2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">{caption}</figcaption>
    </figure>
  );
}
