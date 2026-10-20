import { describe, expect, it } from 'vitest';
import type { ChapterEntry } from '@/content/catalog';
import type { Frequency, TopicRef } from '@/content/types';
import { attemptStats, greeting, inDays, registrationWindow, reviseToday } from './insights';

const dates = {
  note: '',
  registrationRegularCloses: '2026-10-05',
  registrationLateFeeCloses: '2026-10-12',
  exam: ['2027-02-06'],
  results: '2027-03-19',
};

const topic = (id: string, frequency: Frequency, beyondSyllabus?: true): TopicRef => ({ id, title: id, frequency, origin: 'source', beyondSyllabus });

const chapter = (id: string, frequency: Frequency, topics: TopicRef[]) => ({ id, frequency, topicIndex: topics }) as unknown as ChapterEntry;

describe('registrationWindow', () => {
  it('reports the regular deadline until it passes, then the late-fee one, then nothing', () => {
    expect(registrationWindow(dates, new Date(2026, 9, 4))).toEqual({ stage: 'regular', closes: '2026-10-05', days: 1 });
    expect(registrationWindow(dates, new Date(2026, 9, 5, 23, 59))).toEqual({ stage: 'regular', closes: '2026-10-05', days: 0 });
    expect(registrationWindow(dates, new Date(2026, 9, 6))).toEqual({ stage: 'late', closes: '2026-10-12', days: 6 });
    expect(registrationWindow(dates, new Date(2026, 9, 13))).toBeNull();
  });

  it('words the distance the way a person would', () => {
    expect([0, 1, 6].map(inDays)).toEqual(['today', 'tomorrow', 'in 6 days']);
  });
});

describe('greeting', () => {
  it('follows the local hour', () => {
    expect(greeting(new Date(2026, 9, 4, 8))).toBe('Good morning');
    expect(greeting(new Date(2026, 9, 4, 13))).toBe('Good afternoon');
    expect(greeting(new Date(2026, 9, 4, 21))).toBe('Good evening');
  });
});

describe('reviseToday', () => {
  const chapters = [
    chapter('a', 'high', [topic('a1', 'low'), topic('a2', 'high'), topic('a3', 'high'), topic('a4', 'medium', true)]),
    chapter('b', 'medium', [topic('b1', 'high'), topic('b2', 'medium')]),
    chapter('c', 'high', [topic('c1', 'medium')]),
  ];

  it('puts topics in progress first, learning before revising', () => {
    const picked = reviseToday(chapters, { b2: 'review', a1: 'learning', a2: 'mastered' }, 3).map((f) => f.topic.id);
    expect(picked).toEqual(['a1', 'b2', 'a3']);
  });

  it('spreads untouched topics across chapters, high-frequency chapters first', () => {
    const picked = reviseToday(chapters, {}, 5).map((f) => f.topic.id);
    expect(picked).toEqual(['a2', 'c1', 'b1', 'a3', 'b2']);
  });

  it('never suggests topics outside the 2027 syllabus or already mastered', () => {
    const picked = reviseToday(chapters, { a1: 'mastered', a2: 'mastered', a3: 'mastered', b1: 'mastered', b2: 'mastered', c1: 'mastered' }, 5);
    expect(picked).toEqual([]);
  });
});

describe('attemptStats', () => {
  it('counts this week and accuracy, and has no accuracy before any attempt', () => {
    const now = new Date(2026, 9, 10).getTime();
    const day = 86_400_000;
    const s = attemptStats({ x: { correct: true, at: now - day }, y: { correct: false, at: now - 8 * day }, z: { correct: true, at: now } }, now);
    expect(s).toEqual({ total: 3, correct: 2, thisWeek: 2, accuracy: 2 / 3 });
    expect(attemptStats({}, now).accuracy).toBeNull();
  });
});
