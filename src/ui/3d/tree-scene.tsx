import { type ReactNode, useEffect, useState } from 'react';
import { SceneHost } from './scene-host';
import type { StageView } from './stage';
import { usePalette } from './theme';
import { type TreeNodeView, type TreeTone, TreeWorld } from './tree-world';
import { useStage } from './use-stage';

const VIEW: StageView = { direction: [0.32, 0.22, 1], target: [0, 0, 0], fov: 36 };

export interface TreeSceneProps {
  nodes: readonly TreeNodeView[];
  /** Keys drawn in the tone colour: the nodes the current step is about. */
  focus: readonly number[];
  tone: TreeTone;
  /** What the scene shows, for screen readers. */
  label: string;
  /** Rendered instead when the browser has no WebGL 2. */
  fallback: ReactNode;
  className?: string;
}

/** A binary tree in 3D that animates from one shape to the next as `nodes` changes. */
export function TreeScene({ nodes, focus, tone, label, fallback, className }: TreeSceneProps) {
  const { hostRef, stage, supported } = useStage(VIEW);
  const palette = usePalette();
  const [world, setWorld] = useState<TreeWorld | null>(null);

  useEffect(() => {
    if (!stage) return;
    const w = new TreeWorld(stage, palette);
    setWorld(w);
    return () => {
      w.dispose();
      setWorld(null);
    };
  }, [stage, palette]);

  useEffect(() => {
    world?.update(nodes, focus, tone);
  }, [world, nodes, focus, tone]);

  if (!supported) return fallback;
  return <SceneHost hostRef={hostRef} label={label} className={className} />;
}
