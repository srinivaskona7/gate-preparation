import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { VisualFrame } from '@/features/visuals/VisualFrame';
import { visualsFor } from '@/features/visuals/registry';
import { Button } from '@/ui/button';
import { EmptyState } from '@/ui/primitives';
import type { TabProps } from './tab-props';

export function VisualsTab({ chapter }: TabProps) {
  const visuals = visualsFor(chapter.id);
  if (!visuals.length) {
    return (
      <EmptyState title="No visual for this chapter yet">
        <p>The visual lab has the simulations, 3D models and diagrams built so far.</p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link to="/visuals">
            Open the visual lab <ArrowRight />
          </Link>
        </Button>
      </EmptyState>
    );
  }
  return (
    <div className="space-y-6">
      {visuals.map((v) => (
        <VisualFrame key={v.id} visual={v} />
      ))}
    </div>
  );
}
