import { describe, expect, it } from 'vitest';
import type { Paper } from '@/content/types';
import { marksMatrix, recentPapers, UNMAPPED } from './decade';

const paper = (year: number, set: number | null, qs: [string | null, 1 | 2][]): Paper =>
  ({
    id: `gate-cse-${year}${set ? `-s${set}` : ''}`, title: '', year, set, sources: { key: { label: '', url: '' } },
    questions: qs.map(([chapter, marks], i) => ({ id: `${year}-${i}`, paper: '', section: 'CS', n: i + 1, type: 'mcq', marks, key: { kind: 'mta' }, chapter, subject: chapter, url: '', status: 'open' })),
  }) as Paper;

describe('recentPapers', () => {
  it('keeps the newest ten years and orders them by year then set', () => {
    const ps = [2026, 2025, 2020, 2017, 2016, 2015].map((y) => paper(y, null, []));
    ps.push(paper(2017, 2, []));
    expect(recentPapers(ps).map((p) => p.id)).toEqual(['gate-cse-2017', 'gate-cse-2017-s2', 'gate-cse-2020', 'gate-cse-2025', 'gate-cse-2026']);
  });
});

describe('marksMatrix', () => {
  const ps = [paper(2025, 1, [['os', 2], ['os', 1], ['db', 1]]), paper(2026, 1, [['os', 2], [null, 1]])];
  const rows = marksMatrix(ps, (q) => q.subject);
  it('sums marks per paper, total, mean and share', () => {
    const os = rows.find((r) => r.id === 'os');
    expect(os).toMatchObject({ total: 5, mean: 2.5, min: 2, max: 3 });
    expect(os?.byPaper).toEqual({ 'gate-cse-2025-s1': 3, 'gate-cse-2026-s1': 2 });
    expect(os?.share).toBeCloseTo(5 / 7);
  });
  it('lists unmapped marks apart and ranks by total', () => {
    expect(rows.map((r) => r.id)).toEqual(['os', 'db', UNMAPPED]);
    expect(rows.reduce((s, r) => s + r.total, 0)).toBe(7);
  });
});
