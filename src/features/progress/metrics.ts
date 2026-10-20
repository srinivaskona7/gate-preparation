import type { TopicRef } from '@/content/types';

export const MASTERY_LEVELS = ['new', 'learning', 'review', 'mastered'] as const;
export type Mastery = (typeof MASTERY_LEVELS)[number];

export const MASTERY_LABEL: Record<Mastery, string> = {
  new: 'Not started',
  learning: 'Learning',
  review: 'Revising',
  mastered: 'Mastered',
};

const WEIGHT: Record<Mastery, number> = { new: 0, learning: 1 / 3, review: 2 / 3, mastered: 1 };

/** Local calendar day, e.g. "2026-10-04": a streak counts the learner's days, not UTC days. */
export function dayKey(at = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
}

/**
 * Share of a topic list mastered, 0–100, weighting the four levels 0, ⅓, ⅔ and 1.
 * Topics the 2027 syllabus no longer names do not count.
 */
export function masteryPercent(topics: TopicRef[], mastery: Record<string, Mastery>) {
  const counted = topics.filter((t) => !t.beyondSyllabus);
  if (!counted.length) return 0;
  const sum = counted.reduce((acc, t) => acc + WEIGHT[mastery[t.id] ?? 'new'], 0);
  return Math.round((sum / counted.length) * 100);
}

/** Consecutive study days ending today, or ending yesterday when today has no activity yet. */
export function streak(days: Record<string, number>, today = new Date()) {
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!days[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days[dayKey(cursor)]) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function masteryCounts(topics: TopicRef[], mastery: Record<string, Mastery>) {
  const counts: Record<Mastery, number> = { new: 0, learning: 0, review: 0, mastered: 0 };
  for (const t of topics) if (!t.beyondSyllabus) counts[mastery[t.id] ?? 'new']++;
  return counts;
}
