import { type ReactNode, useEffect, useEffectEvent, useRef, useState } from 'react';
import { HierarchyWorld, type HierarchyLevelView } from './hierarchy-world';
import { SceneHost } from './scene-host';
import type { StageView } from './stage';
import { usePalette } from './theme';
import { useStage } from './use-stage';

const VIEW: StageView = { direction: [0.95, 0.62, 1.45], target: [0, 0, 0], fov: 34 };

/** One batch of requests; a new id sends it, so re-renders and theme changes never replay it. */
export interface RequestBurst {
  id: number;
  /** The level that serves each request. */
  served: readonly number[];
}

export interface HierarchySceneProps {
  levels: readonly HierarchyLevelView[];
  selected: number;
  onSelect: (level: number) => void;
  burst?: RequestBurst;
  label: string;
  fallback: ReactNode;
  className?: string;
}

/** The memory hierarchy as a 3D pyramid; clicking a level selects it. */
export function HierarchyScene({ levels, selected, onSelect, burst, label, fallback, className }: HierarchySceneProps) {
  const { hostRef, stage, supported } = useStage(VIEW);
  const palette = usePalette();
  const [world, setWorld] = useState<HierarchyWorld | null>(null);
  const sent = useRef(burst?.id ?? 0);
  const select = useEffectEvent((level: number) => onSelect(level));

  useEffect(() => {
    if (!stage) return;
    const w = new HierarchyWorld(stage, palette, (level) => select(level));
    setWorld(w);
    return () => {
      w.dispose();
      setWorld(null);
    };
  }, [stage, palette]);

  useEffect(() => {
    world?.setLevels(levels, selected);
  }, [world, levels, selected]);

  useEffect(() => {
    if (!world || !burst || burst.id === sent.current) return;
    sent.current = burst.id;
    world.burst(burst.served);
  }, [world, burst]);

  if (!supported) return fallback;
  return <SceneHost hostRef={hostRef} label={label} className={className} />;
}
