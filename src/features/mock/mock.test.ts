import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BLUEPRINT, buildMock, type MockItem, sectionOf, totalMarks } from './mock';

const item = (id: string, chapter: string, subject: string, marks: 1 | 2): MockItem => ({ id, chapter, subject, topic: `${chapter}.t`, type: 'mcq', marks });

function syntheticPool(): MockItem[] {
  const out: MockItem[] = [];
  const add = (chapter: string, subject: string, n: number) => {
    for (let i = 0; i < n; i++) out.push(item(`${chapter}-${i}-1`, chapter, subject, 1), item(`${chapter}-${i}-2`, chapter, subject, 2));
  };
  add('ga-verbal', 'ga', 12);
  add('em-calculus', 'em', 12);
  add('os-x', 'os', 20);
  add('cn-x', 'cn', 20);
  add('db-x', 'db', 20);
  return out;
}

describe('BLUEPRINT', () => {
  it('matches the official pattern: 65 questions, 100 marks, GA 15, EM 13, core 72', () => {
    const marks = (s: string) => BLUEPRINT.filter((b) => b.section === s).reduce((t, b) => t + b.count * b.marks, 0);
    expect(BLUEPRINT.reduce((t, b) => t + b.count, 0)).toBe(65);
    expect([marks('GA'), marks('EM'), marks('CS')]).toEqual([15, 13, 72]);
    const subject = BLUEPRINT.filter((b) => b.section !== 'GA');
    expect(subject.filter((b) => b.marks === 1).reduce((t, b) => t + b.count, 0)).toBe(25);
  });

  it('agrees with the official syllabus file', () => {
    const syl = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../../data/official-syllabus.json'), 'utf8'));
    expect(syl.pattern.questions).toBe(65);
    expect(syl.pattern.marks).toMatchObject({ total: 100, generalAptitude: 15, engineeringMathematics: 13, core: 72 });
  });
});

describe('buildMock', () => {
  it('fills every slot, without repeats, in GATE order', () => {
    const { questions, shortfall } = buildMock(syntheticPool(), 42);
    expect(shortfall).toEqual([]);
    expect(questions).toHaveLength(65);
    expect(new Set(questions.map((q) => q.id)).size).toBe(65);
    expect(totalMarks(questions)).toBe(100);
    const order = questions.map((q) => `${sectionOf(q.chapter) === 'GA' ? 'GA' : 'S'}${q.marks}`);
    expect(order.join(',')).toBe([...Array(5).fill('GA1'), ...Array(5).fill('GA2'), ...Array(25).fill('S1'), ...Array(30).fill('S2')].join(','));
  });

  it('spreads core questions across subjects', () => {
    const core = buildMock(syntheticPool(), 7).questions.filter((q) => sectionOf(q.chapter) === 'CS');
    const per = ['os', 'cn', 'db'].map((s) => core.filter((q) => q.subject === s).length);
    expect(Math.max(...per) - Math.min(...per)).toBeLessThanOrEqual(2);
  });

  it('replays the same paper for the same seed and a different one otherwise', () => {
    const ids = (seed: number) => buildMock(syntheticPool(), seed).questions.map((q) => q.id).join();
    expect(ids(5)).toBe(ids(5));
    expect(ids(5)).not.toBe(ids(6));
  });

  it('reports a slot the pool cannot fill', () => {
    const pool = syntheticPool().filter((q) => !(q.chapter.startsWith('ga-') && q.marks === 2)).slice(0);
    expect(buildMock(pool, 1).shortfall).toEqual([{ section: 'GA', marks: 2, missing: 5 }]);
  });
});
