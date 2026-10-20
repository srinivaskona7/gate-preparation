import type { RefObject } from 'react';
import { cn } from '@/lib/utils';

/** The box a stage mounts its canvas in, with the one line of control help every model needs. */
export function SceneHost({ hostRef, label, className }: { hostRef: RefObject<HTMLDivElement | null>; label: string; className?: string }) {
  return (
    <div className={cn('relative h-[340px] overflow-hidden rounded-[12px] border border-line bg-surface-2/40', className)}>
      <div ref={hostRef} role="img" aria-label={label} className="size-full" />
      <p aria-hidden className="pointer-events-none absolute bottom-2 left-3 font-mono text-[10.5px] text-faint">
        Drag to turn · press, then scroll to zoom
      </p>
    </div>
  );
}
