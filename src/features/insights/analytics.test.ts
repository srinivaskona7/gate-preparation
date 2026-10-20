import { describe, expect, it } from 'vitest';
import type { Paper, PaperQuestion } from '@/content/types';
import type { QuestionStat } from '@/features/progress/store';
import { chapterTrends, errorLog, practiseNext, slope, tagCounts, topicStats } from './analytics';

const stat = (o: Partial<QuestionStat>): QuestionStat => ({ seen: 1, wrong: 0, lastCorrect: true, lastAt: 0, seconds: 0, timed: 0, ...o });
const meta = [
  { id: 'q1', chapter: 'c1', topic: 'c1.a' },
  { id: 'q2', chapter: 'c1', topic: 'c1.a' },
  { id: 'q3', chapter: 'c2', topic: 'c2.b' },
];

describe('topicStats', () => {
  it('aggregates answers per topic with a smoothed error rate and mean time', () => {
    const s = topicStats(
      { q1: stat({ seen: 2, wrong: 1, lastCorrect: true, seconds: 120, timed: 2 }), q2: stat({ wrong: 1, lastCorrect: false }), gone: stat({}) },
      meta,
    );
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ topic: 'c1.a', questions: 2, answers: 3, wrong: 2, stillWrong: 1, meanSeconds: 60 });
    expect(s[0].errorRate).toBeCloseTo(3 / 5);
  });
});

describe('practiseNext', () => {
  it('ranks weak topics by error rate times exam frequency, then untried topics by frequency', () => {
    const stats = topicStats({ q1: stat({ seen: 2, wrong: 2, lastCorrect: false }), q3: stat({ seen: 2, wrong: 2, lastCorrect: false }) }, meta);
    const freq = new Map([['c1.a', 'low' as const], ['c2.b', 'high' as const], ['c3.x', 'high' as const], ['c3.y', 'medium' as const]]);
    expect(practiseNext(stats, freq, ['c1.a', 'c2.b', 'c3.y', 'c3.x'], 4)).toEqual(['c2.b', 'c1.a', 'c3.x', 'c3.y']);
  });

  it('leaves out a topic answered without a miss', () => {
    const stats = topicStats({ q3: stat({ seen: 3 }) }, meta);
    expect(practiseNext(stats, new Map(), ['c2.b'], 5)).toEqual([]);
  });
});

describe('chapterTrends', () => {
  const q = (chapter: string | null, marks: 1 | 2): PaperQuestion =>
    ({ id: 'x', paper: 'p', section: 'CS', n: 1, type: 'mcq', marks, key: { kind: 'mcq', options: [] }, chapter, subject: null, url: '', status: 'mapped' }) as unknown as PaperQuestion;
  const paper = (year: number, qs: PaperQuestion[]) => ({ id: `p${year}`, title: '', year, set: null, sources: { key: { label: '', url: '' } }, questions: qs }) as Paper;

  it('averages a year over its sets and ranks chapters by mean marks', () => {
    const { years, trends } = chapterTrends([paper(2024, [q('a', 2), q('b', 1)]), paper(2024, [q('a', 2)]), paper(2025, [q('b', 2), q(null, 1)])]);
    expect(years).toEqual([2024, 2025]);
    expect(trends.map((t) => t.chapter)).toEqual(['a', 'b']);
    expect(trends[0].byYear).toEqual({ 2024: 2, 2025: 0 });
    expect(trends[1].byYear).toEqual({ 2024: 0.5, 2025: 2 });
    expect(trends[0].mean).toBeCloseTo(4 / 3);
    expect(trends[0].share + trends[1].share).toBeCloseTo(1);
  });

  it('gives the least-squares slope', () => {
    expect(slope({ 2020: 1, 2021: 3, 2022: 5 })).toBeCloseTo(2);
    expect(slope({ 2020: 4 })).toBe(0);
  });
});

describe('errorLog', () => {
  it('lists every miss newest first with its tag, and counts tags', () => {
    const log = errorLog(
      { q1: stat({ wrong: 1, lastCorrect: true, lastAt: 1 }), q2: stat({ wrong: 2, seen: 2, lastCorrect: false, lastAt: 5 }), q3: stat({}) },
      meta,
      { q1: 'calculation' },
    );
    expect(log.map((e) => [e.id, e.open, e.tag])).toEqual([
      ['q2', true, null],
      ['q1', false, 'calculation'],
    ]);
    expect(tagCounts(log)).toMatchObject({ calculation: 1, untagged: 1, concept: 0 });
  });
});
