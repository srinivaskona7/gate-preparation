// @vitest-environment jsdom
import { Color, Mesh, PerspectiveCamera, Scene, SphereGeometry } from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { Stage } from './stage';
import type { Palette, Swatch, Token } from './theme';
import { type TreeNodeView, TreeWorld } from './tree-world';

// jsdom has no 2D canvas; labels are drawn blank, which is all a geometry test needs.
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

const swatch = new Proxy({} as Record<Token, Swatch>, { get: () => ({ color: new Color(0.5, 0.5, 0.5), alpha: 1, css: 'rgb(128, 128, 128)' }) });
const palette: Palette = { dark: true, swatch, mono: 'monospace', sans: 'sans-serif' };

function stage(reducedMotion: boolean): Stage {
  return {
    scene: new Scene(),
    camera: new PerspectiveCamera(),
    reducedMotion,
    animate: () => () => {},
    invalidate: () => {},
    fit: () => {},
    onTap: () => () => {},
    dispose: () => {},
  };
}

const chain: TreeNodeView[] = [
  { key: 2, x: 1, depth: 0, balance: 0, parent: null },
  { key: 1, x: 0, depth: 1, balance: 0, parent: 2 },
  { key: 3, x: 2, depth: 1, balance: 0, parent: 2 },
];

/** World scale of every node sphere: a node that never animates must already be full size. */
function sphereScales(s: Stage) {
  const scales: number[] = [];
  s.scene.traverse((o) => {
    if (o instanceof Mesh && o.geometry instanceof SphereGeometry) scales.push(o.parent?.scale.x ?? 0);
  });
  return scales;
}

describe('tree world snapping', () => {
  // A theme change builds a new world over a tree that already has nodes: its first update snaps.
  it('draws an existing tree at full size on the first update', () => {
    const s = stage(false);
    new TreeWorld(s, palette).update(chain, [], 'accent');
    expect(sphereScales(s)).toEqual([1, 1, 1]);
  });

  it('draws inserted nodes at full size under reduced motion', () => {
    const s = stage(true);
    const w = new TreeWorld(s, palette);
    w.update([], [], 'accent');
    w.update(chain, [], 'accent');
    expect(sphereScales(s)).toEqual([1, 1, 1]);
  });
});
