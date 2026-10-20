import type { Drawable } from '@/features/quiz/selection';
import { shuffle } from '@/features/quiz/selection';

export type MockSection = 'GA' | 'EM' | 'CS';

/**
 * One full paper as GATE CS sets it: 65 questions, 100 marks. GA is 5 × 1 + 5 × 2 marks; of the
 * 85 subject marks, engineering mathematics carries 13 (official pattern, data/official-syllabus.json)
 * and the core subjects 72. The 1/2-mark split inside the 55 subject questions is 25/30.
 */
export const BLUEPRINT: { section: MockSection; marks: 1 | 2; count: number }[] = [
  { section: 'GA', marks: 1, count: 5 },
  { section: 'GA', marks: 2, count: 5 },
  { section: 'EM', marks: 1, count: 5 },
  { section: 'EM', marks: 2, count: 4 },
  { section: 'CS', marks: 1, count: 20 },
  { section: 'CS', marks: 2, count: 26 },
];

export const sectionOf = (chapter: string): MockSection => (chapter.startsWith('ga-') ? 'GA' : chapter.startsWith('em-') ? 'EM' : 'CS');

export interface MockItem extends Drawable {
  subject: string;
}

/**
 * Round-robin over subjects in a seeded order, so no subject crowds the paper while each still
 * gets questions in proportion to what the pool can give.
 */
function spread<T extends MockItem>(items: T[], count: number, seed: number): T[] {
  const bySubject = new Map<string, T[]>();
  for (const q of shuffle(items, seed)) {
    const list = bySubject.get(q.subject) ?? [];
    list.push(q);
    bySubject.set(q.subject, list);
  }
  const queues = shuffle([...bySubject.keys()].sort(), seed + 1).map((s) => bySubject.get(s) ?? []);
  const out: T[] = [];
  while (out.length < count && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next && out.length < count) out.push(next);
    }
  }
  return out;
}

export interface MockPaper<T> {
  questions: T[];
  /** Slots the pool could not fill, so the page can say so rather than hand out a short paper silently. */
  shortfall: { section: MockSection; marks: 1 | 2; missing: number }[];
}

/** A seeded full paper in GATE order: GA first, then the subject questions, 1-mark before 2-mark. */
export function buildMock<T extends MockItem>(pool: readonly T[], seed: number): MockPaper<T> {
  const sorted = [...pool].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const questions: T[] = [];
  const shortfall: MockPaper<T>['shortfall'] = [];
  BLUEPRINT.forEach((slot, i) => {
    const fit = sorted.filter((q) => sectionOf(q.chapter) === slot.section && q.marks === slot.marks);
    const picked = spread(fit, slot.count, seed + i * 7919);
    if (picked.length < slot.count) shortfall.push({ section: slot.section, marks: slot.marks, missing: slot.count - picked.length });
    questions.push(...picked);
  });
  const rank = (q: T) => (sectionOf(q.chapter) === 'GA' ? 0 : 1) * 2 + (q.marks - 1);
  return { questions: [...questions].sort((a, b) => rank(a) - rank(b)), shortfall };
}

export const totalMarks = (qs: { marks: number }[]) => qs.reduce((s, q) => s + q.marks, 0);
