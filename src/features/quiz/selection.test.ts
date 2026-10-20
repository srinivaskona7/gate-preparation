import { describe, expect, it } from 'vitest';
import { type Drawable, examMinutes, isPyqId, readSpec, selectQuestions, shuffle, specParams } from './selection';

const q = (id: string, chapter: string, topic: string, type: Drawable['type'] = 'mcq', marks: 1 | 2 = 1): Drawable => ({ id, chapter, topic, type, marks });

const POOL: Drawable[] = [
  q('a1', 'os-a', 'os-a.t1', 'mcq', 2),
  q('a2', 'os-a', 'os-a.t1', 'nat', 1),
  q('a3', 'os-a', 'os-a.t2', 'msq', 2),
  q('b1', 'os-b', 'os-b.t1', 'mcq', 1),
  q('b2', 'os-b', 'os-b.t1', 'nat', 2),
  q('c1', 'db-c', 'db-c.t1', 'mcq', 1),
];

const spec = (search: string) => readSpec(new URLSearchParams(search));

describe('readSpec', () => {
  it('defaults to ten practice questions and no seed', () => {
    expect(spec('')).toEqual({ source: 'practice', chapters: [], topics: [], ids: [], types: [], n: 10, mode: 'practice', seed: null });
  });

  it('takes a hand-picked id list whole unless n is given', () => {
    expect(spec('ids=a1,b1').n).toBeNull();
    expect(spec('ids=a1,b1&n=1').n).toBe(1);
  });

  it('rejects unknown types, bad counts and bad seeds', () => {
    const s = spec('types=mcq,xyz,nat&n=-3&seed=abc&mode=weird&source=other');
    expect(s.types).toEqual(['mcq', 'nat']);
    expect(s.n).toBe(10);
    expect(s.seed).toBeNull();
    expect(s.mode).toBe('practice');
    expect(s.source).toBe('practice');
  });

  it('accepts seed 0', () => {
    expect(spec('seed=0').seed).toBe(0);
  });

  it('round-trips through specParams', () => {
    for (const search of ['', 'source=pyq&chapters=os-a,os-b&mode=exam&seed=7', 'ids=a1,b1&mode=practice', 'ids=a1&n=10&mode=exam', 'n=all&types=nat&mode=practice', 'topics=os-a.t1&n=5&mode=exam&seed=0']) {
      const s = spec(search);
      expect(readSpec(specParams(s))).toEqual(s);
    }
  });
});

describe('selectQuestions', () => {
  it('draws the same set for the same seed, and a full shuffle is a permutation', () => {
    const s = spec('n=all');
    expect(selectQuestions(POOL, s, 42)).toEqual(selectQuestions(POOL, s, 42));
    expect(selectQuestions(POOL, s, 42).map((x) => x.id).sort()).toEqual(POOL.map((x) => x.id).sort());
  });

  it('different seeds give different orders', () => {
    const orders = new Set([1, 2, 3, 4, 5].map((seed) => shuffle(POOL, seed).map((x) => x.id).join()));
    expect(orders.size).toBeGreaterThan(1);
  });

  it('draws the same set whatever order the pool loaded in', () => {
    const s = spec('n=4');
    const ids = (pool: Drawable[]) => selectQuestions(pool, s, 7).map((x) => x.id);
    expect(ids([...POOL].reverse())).toEqual(ids(POOL));
  });

  it('filters by chapter, topic and type, then caps the count', () => {
    expect(selectQuestions(POOL, spec('chapters=os-a&n=all'), 1).map((x) => x.id).sort()).toEqual(['a1', 'a2', 'a3']);
    expect(selectQuestions(POOL, spec('topics=os-b.t1&n=all'), 1).map((x) => x.id).sort()).toEqual(['b1', 'b2']);
    expect(selectQuestions(POOL, spec('chapters=os-a,os-b&types=nat&n=all'), 1).map((x) => x.id).sort()).toEqual(['a2', 'b2']);
    expect(selectQuestions(POOL, spec('n=2'), 9)).toHaveLength(2);
  });

  it('keeps a hand-picked list in its order and drops ids not in the pool', () => {
    expect(selectQuestions(POOL, spec('ids=c1,zz,a2,b1'), 3).map((x) => x.id)).toEqual(['c1', 'a2', 'b1']);
  });

  it('puts 1-mark questions first in a timed paper', () => {
    const marks = selectQuestions(POOL, spec('n=all&mode=exam'), 5).map((x) => x.marks);
    expect(marks).toEqual([...marks].sort((a, b) => a - b));
  });

  it('keeps a hand-picked exam list in the order given', () => {
    const ids = [...POOL].sort((a, b) => b.marks - a.marks).map((x) => x.id);
    expect(selectQuestions(POOL, spec(`ids=${ids.join(',')}&mode=exam`), 5).map((x) => x.id)).toEqual(ids);
  });
});

describe('helpers', () => {
  it('gives GATE pacing of 1.8 minutes a mark, rounded up', () => {
    expect(examMinutes(100)).toBe(180);
    expect(examMinutes(15)).toBe(27);
    expect(examMinutes(1)).toBe(2);
  });

  it('recognises official PYQ ids', () => {
    expect(isPyqId('gate-cse-2024-s1-q30')).toBe(true);
    expect(isPyqId('gate-cse-2018-ga1')).toBe(true);
    expect(isPyqId('os-processes-threads.q-fork-three-calls')).toBe(false);
  });
});
