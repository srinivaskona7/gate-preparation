import type { ChapterEntry } from '@/content/catalog';
import type { Exam, Frequency, TopicRef } from '@/content/types';
import type { Mastery } from '@/features/progress/metrics';
import { daysUntil } from '@/lib/utils';

export interface RegistrationWindow {
  stage: 'regular' | 'late';
  closes: string;
  days: number;
}

/** The registration deadline still ahead: the regular one, then the late-fee one, then none. */
export function registrationWindow(dates: Exam['dates'], today = new Date()): RegistrationWindow | null {
  const regular = daysUntil(dates.registrationRegularCloses, today);
  if (regular >= 0) return { stage: 'regular', closes: dates.registrationRegularCloses, days: regular };
  const late = daysUntil(dates.registrationLateFeeCloses, today);
  if (late >= 0) return { stage: 'late', closes: dates.registrationLateFeeCloses, days: late };
  return null;
}

export const inDays = (days: number) => (days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`);

export function greeting(at = new Date()) {
  const h = at.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export interface FocusTopic {
  topic: TopicRef;
  chapter: ChapterEntry;
  level: Mastery;
}

const RANK: Record<Frequency, number> = { high: 0, medium: 1, low: 2 };

/**
 * What to study today. Topics already in progress come first, most frequently examined
 * first, because half-learned material fades fastest. Untouched topics fill the rest, taken
 * one chapter at a time so a single chapter cannot crowd out the others.
 */
export function reviseToday(chapters: ChapterEntry[], mastery: Record<string, Mastery>, limit = 5): FocusTopic[] {
  const inProgress: FocusTopic[] = [];
  const untouched: FocusTopic[][] = [];
  for (const chapter of chapters) {
    const fresh: FocusTopic[] = [];
    for (const topic of chapter.topicIndex) {
      if (topic.beyondSyllabus) continue;
      const level = mastery[topic.id] ?? 'new';
      if (level === 'learning' || level === 'review') inProgress.push({ topic, chapter, level });
      else if (level === 'new') fresh.push({ topic, chapter, level });
    }
    fresh.sort((a, b) => RANK[a.topic.frequency] - RANK[b.topic.frequency]);
    if (fresh.length) untouched.push(fresh);
  }
  // Learning before revising, then by how often GATE asks the topic.
  inProgress.sort((a, b) => Number(a.level === 'review') - Number(b.level === 'review') || RANK[a.topic.frequency] - RANK[b.topic.frequency]);
  untouched.sort((a, b) => RANK[a[0].chapter.frequency] - RANK[b[0].chapter.frequency] || RANK[a[0].topic.frequency] - RANK[b[0].topic.frequency]);

  const picked = inProgress.slice(0, limit);
  for (let round = 0; picked.length < limit; round++) {
    const before = picked.length;
    for (const list of untouched) {
      if (picked.length >= limit) break;
      const next = list[round];
      if (next) picked.push(next);
    }
    if (picked.length === before) break;
  }
  return picked;
}

const WEEK_MS = 7 * 86_400_000;

export function attemptStats(attempts: Record<string, { correct: boolean; at: number }>, now = Date.now()) {
  const list = Object.values(attempts);
  const correct = list.filter((a) => a.correct).length;
  return {
    total: list.length,
    correct,
    thisWeek: list.filter((a) => now - a.at < WEEK_MS).length,
    accuracy: list.length ? correct / list.length : null,
  };
}
