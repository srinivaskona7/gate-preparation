import { type ComponentType, lazy, type LazyExoticComponent } from 'react';

export interface VisualProps {
  /** Rendered in a narrow side rail: secondary panels fold away. */
  compact?: boolean;
}

export type VisualKind = 'simulation' | '3d' | 'diagram';

interface VisualBase {
  id: string;
  title: string;
  blurb: string;
  /** Subject code, as in the sidebar. */
  subject: string;
  /** Chapters whose Visuals tab lists it; the first is its home. */
  chapters: string[];
  /** Topic ids it illustrates. */
  topics: string[];
}

export interface InteractiveVisual extends VisualBase {
  kind: 'simulation' | '3d';
  component: LazyExoticComponent<ComponentType<VisualProps>>;
}

export interface DiagramVisual extends VisualBase {
  kind: 'diagram';
  /** public/diagrams/<file>.svg, with a <file>-dark.svg twin for the dark theme. */
  file: string;
  /** What the diagram shows, for screen readers. */
  alt: string;
}

export type Visual = InteractiveVisual | DiagramVisual;

export const KIND_LABEL: Record<VisualKind, string> = {
  simulation: 'Simulation',
  '3d': '3D model',
  diagram: 'Diagram',
};

export const VISUALS: Visual[] = [
  {
    id: 'cpu-scheduling',
    kind: 'simulation',
    title: 'CPU scheduling Gantt chart',
    blurb: 'Run FCFS, SJF, SRTF, round robin, priority and HRRN on your own process table, one dispatch decision at a time.',
    subject: 'OS',
    chapters: ['os-cpu-scheduling'],
    topics: ['os-cpu-scheduling.gantt-method', 'os-cpu-scheduling.sjf-srtf', 'os-cpu-scheduling.round-robin', 'os-cpu-scheduling.hrrn'],
    component: lazy(() => import('./sims/cpu-scheduling')),
  },
  {
    id: 'avl-tree',
    kind: '3d',
    title: 'AVL tree rotations',
    blurb: 'Insert and delete keys and watch each imbalance found and fixed by an LL, RR, LR or RL rotation, with balance factors on every node.',
    subject: 'PDS',
    chapters: ['pds-trees'],
    topics: ['pds-trees.avl-rotations', 'pds-trees.avl-height'],
    component: lazy(() => import('./sims/avl-tree')),
  },
  {
    id: 'memory-hierarchy',
    kind: '3d',
    title: 'Memory hierarchy access time',
    blurb: 'Set access times and local hit ratios level by level, compare hierarchical with simultaneous access, and send requests down the pyramid.',
    subject: 'COA',
    chapters: ['coa-memory-hierarchy'],
    topics: ['coa-memory-hierarchy.emat', 'coa-memory-hierarchy.multilevel-cache'],
    component: lazy(() => import('./sims/memory-hierarchy')),
  },
];

const byId = new Map(VISUALS.map((v) => [v.id, v]));
export const getVisual = (id: string | undefined) => (id ? byId.get(id) : undefined);
export const visualsFor = (chapterId: string) => VISUALS.filter((v) => v.chapters.includes(chapterId));
