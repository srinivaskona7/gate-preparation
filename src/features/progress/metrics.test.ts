import { describe, expect, it } from 'vitest';
import type { TopicRef } from '@/content/types';
import { dayKey, masteryCounts, masteryPercent, streak } from './metrics';

const topic = (id: string, beyondSyllabus?: true): TopicRef => ({ id, title: id, frequency: 'high', origin: 'source', ...(beyondSyllabus ? { beyondSyllabus } : {}) });

describe('mastery', () => {
  it('weights the four levels and ignores topics beyond the 2027 syllabus', () => {
    const topics = [topic('a'), topic('b'), topic('c'), topic('old', true)];
    expect(masteryPercent(topics, { a: 'mastered', b: 'review', old: 'mastered' })).toBe(56);
    expect(masteryCounts(topics, { a: 'mastered', b: 'review' })).toEqual({ new: 1, learning: 0, review: 1, mastered: 1 });
    expect(masteryPercent([], {})).toBe(0);
  });
});

describe('streak', () => {
  const today = new Date(2026, 9, 4, 21, 30);
  const day = (offset: number) => dayKey(new Date(2026, 9, 4 + offset));

  it('counts consecutive local days ending today', () => {
    expect(streak({ [day(0)]: 2, [day(-1)]: 1, [day(-2)]: 5, [day(-4)]: 1 }, today)).toBe(3);
  });

  it('keeps yesterday’s streak alive until today ends', () => {
    expect(streak({ [day(-1)]: 1, [day(-2)]: 1 }, today)).toBe(2);
    expect(streak({ [day(-2)]: 1 }, today)).toBe(0);
  });

  it('crosses month boundaries', () => {
    expect(streak({ '2026-10-01': 1, '2026-09-30': 1 }, new Date(2026, 9, 1))).toBe(2);
  });
});
