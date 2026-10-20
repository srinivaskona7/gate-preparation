import { describe, expect, it } from 'vitest';
import { random } from '@/lib/random';
import { balanceOf, buildFrames, edgeHeight, type Frame, keysOf, layout, maxHeight, minNodes, type Op, type TreeNode } from './avl';

const ins = (...keys: number[]): Op[] => keys.map((key) => ({ type: 'insert', key }));
const last = (frames: Frame[]) => frames[frames.length - 1].tree;

/** Throws unless the tree is a valid AVL tree with correct stored heights; returns its height. */
function check(n: TreeNode | null, lo = -Infinity, hi = Infinity): number {
  if (!n) return 0;
  expect(n.key).toBeGreaterThan(lo);
  expect(n.key).toBeLessThan(hi);
  const h = 1 + Math.max(check(n.left, lo, n.key), check(n.right, n.key, hi));
  expect(n.height).toBe(h);
  expect(Math.abs(balanceOf(n))).toBeLessThanOrEqual(1);
  return h;
}

describe('AVL frames', () => {
  it('ascending inserts rotate left and end perfectly balanced', () => {
    const frames = buildFrames(ins(1, 2, 3, 4, 5, 6, 7));
    const tree = last(frames);
    check(tree);
    expect(tree?.key).toBe(4);
    expect(edgeHeight(tree)).toBe(2);
    expect(frames.filter((f) => f.kind === 'imbalance').map((f) => f.rotation)).toEqual(['RR', 'RR', 'RR', 'RR']);
  });

  it('names all four cases and splits the double rotations into two frames', () => {
    const cases: [number[], string, number][] = [
      [[30, 20, 10], 'LL', 20],
      [[10, 20, 30], 'RR', 20],
      [[30, 10, 20], 'LR', 20],
      [[10, 30, 20], 'RL', 20],
    ];
    for (const [keys, rotation, root] of cases) {
      const frames = buildFrames(ins(...keys));
      expect(frames.find((f) => f.kind === 'imbalance')?.rotation).toBe(rotation);
      expect(frames.filter((f) => f.kind === 'rotate')).toHaveLength(rotation.length === 2 && rotation[0] !== rotation[1] ? 2 : 1);
      expect(last(frames)?.key).toBe(root);
    }
  });

  it('shows the imbalance before fixing it', () => {
    const frames = buildFrames(ins(30, 10, 20));
    const before = frames.find((f) => f.kind === 'imbalance');
    expect(before?.tree && balanceOf(before.tree)).toBe(2);
    expect(before?.focus).toEqual([30, 10, 20]);
  });

  it('deletes with the in-order successor and can rotate more than once', () => {
    const keys = [31, 16, 24, 12, 18, 8, 30, 35, 17, 39, 10, 7];
    const built = buildFrames(ins(...keys)).length;
    const frames = buildFrames([...ins(...keys), { type: 'delete', key: 24 }]).slice(built);
    expect(frames[0].note).toContain('in-order successor 30');
    expect(frames.filter((f) => f.kind === 'imbalance')).toHaveLength(2);
    const tree = last(frames);
    check(tree);
    expect(keysOf(tree)).toEqual(keys.filter((k) => k !== 24).sort((a, b) => a - b));
  });

  it('skips a duplicate insert and a missing delete without changing the tree', () => {
    const frames = buildFrames([...ins(5, 3), { type: 'insert', key: 5 }, { type: 'delete', key: 9 }]);
    expect(frames.slice(-2).map((f) => f.kind)).toEqual(['skip', 'skip']);
    expect(frames.at(-1)?.tree).toEqual(frames.at(-3)?.tree);
  });

  it('keeps every frame after an operation valid across random runs', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const next = random(seed);
      const ops: Op[] = Array.from({ length: 30 }, () => ({ type: next() < 0.7 ? 'insert' : 'delete', key: Math.floor(next() * 25) }));
      const present = new Set<number>();
      for (const op of ops) op.type === 'insert' ? present.add(op.key) : present.delete(op.key);
      const frames = buildFrames(ops);
      // Only the frame that ends an operation must be balanced; the ones before show the imbalance.
      for (let i = 0; i < frames.length; i++) {
        const ends = i === frames.length - 1 || !['imbalance', 'rotate'].includes(frames[i + 1].kind);
        if (ends) check(frames[i].tree);
      }
      expect(keysOf(last(frames))).toEqual([...present].sort((a, b) => a - b));
    }
  });
});

describe('layout', () => {
  it('places nodes by in-order rank and depth, with parents', () => {
    const placed = layout(last(buildFrames(ins(2, 1, 3))));
    expect(placed).toEqual([
      { key: 1, x: 0, depth: 1, balance: 0, parent: 2 },
      { key: 2, x: 1, depth: 0, balance: 0, parent: null },
      { key: 3, x: 2, depth: 1, balance: 0, parent: 2 },
    ]);
  });
});

describe('height bounds', () => {
  it('N(h) = N(h − 1) + N(h − 2) + 1, counting height in edges', () => {
    expect([-1, 0, 1, 2, 3, 4, 5].map(minNodes)).toEqual([0, 1, 2, 4, 7, 12, 20]);
  });

  it('the worst-case height for n keys is the largest h with N(h) ≤ n', () => {
    expect([1, 2, 3, 4, 6, 7, 12, 19, 20].map(maxHeight)).toEqual([0, 1, 1, 2, 2, 3, 4, 4, 5]);
  });
});
