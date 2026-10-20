import { describe, expect, it } from 'vitest';
import { coefficients, emat, type Level, reachShare, requestTime, servedShare, simulate } from './memory-hierarchy';

const two: Level[] = [
  { name: 'Cache', time: 10, hit: 0.9 },
  { name: 'Memory', time: 100, hit: 1 },
];
const three: Level[] = [
  { name: 'L1', time: 1, hit: 0.8 },
  { name: 'L2', time: 10, hit: 0.9 },
  { name: 'Memory', time: 100, hit: 1 },
];
const close = (a: number[], b: number[]) => a.forEach((x, i) => expect(x).toBeCloseTo(b[i], 10));

describe('effective memory access time', () => {
  it('two levels: hierarchical pays the cache on a miss, simultaneous does not', () => {
    expect(emat(two, 'hierarchical')).toBeCloseTo(20, 10); // 10 + 0.1 × 100
    expect(emat(two, 'simultaneous')).toBeCloseTo(19, 10); // 0.9 × 10 + 0.1 × 100
  });

  it('three levels', () => {
    expect(emat(three, 'hierarchical')).toBeCloseTo(5, 10); // 1 + 0.2 × 10 + 0.02 × 100
    expect(emat(three, 'simultaneous')).toBeCloseTo(4.6, 10); // 0.8 + 0.18 × 10 + 0.02 × 100
  });

  it('treats the last level as holding everything', () => {
    const leaky = three.map((l, i) => (i === 2 ? { ...l, hit: 0.5 } : l));
    expect(emat(leaky, 'hierarchical')).toBeCloseTo(5, 10);
    expect(servedShare(leaky).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
  });

  it('reach and served shares', () => {
    close(reachShare(three), [1, 0.2, 0.02]);
    close(servedShare(three), [0.8, 0.18, 0.02]);
    close(coefficients(three, 'hierarchical'), [1, 0.2, 0.02]);
    close(coefficients(three, 'simultaneous'), [0.8, 0.18, 0.02]);
  });

  it('a request served deep down pays every level above it only when hierarchical', () => {
    expect(requestTime(three, 2, 'hierarchical')).toBe(111);
    expect(requestTime(three, 2, 'simultaneous')).toBe(100);
    expect(requestTime(three, 0, 'hierarchical')).toBe(1);
  });
});

describe('simulated requests', () => {
  it('replays the same run for the same seed', () => {
    expect(simulate(three, 50, 7)).toEqual(simulate(three, 50, 7));
    expect(simulate(three, 50, 7)).not.toEqual(simulate(three, 50, 8));
  });

  it('converge on the served shares and the formula', () => {
    const n = 200_000;
    const served = simulate(three, n, 2027);
    const counts = three.map((_, i) => served.filter((s) => s === i).length / n);
    counts.forEach((c, i) => expect(Math.abs(c - servedShare(three)[i])).toBeLessThan(0.005));
    for (const access of ['hierarchical', 'simultaneous'] as const) {
      const mean = served.reduce((sum, s) => sum + requestTime(three, s, access), 0) / n;
      expect(Math.abs(mean - emat(three, access)) / emat(three, access)).toBeLessThan(0.01);
    }
  });

  it('a perfect first level serves everything', () => {
    expect(new Set(simulate([{ ...three[0], hit: 1 }, ...three.slice(1)], 500, 1))).toEqual(new Set([0]));
  });
});
