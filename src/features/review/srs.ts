/**
 * Spaced repetition, SM-2 as Anki adapts it: a card's interval grows by its ease after each
 * successful recall and resets after a lapse. Pure functions over plain data, so the store can
 * persist cards as JSON and tests can step a card through time.
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy';
export const GRADES: readonly Grade[] = ['again', 'hard', 'good', 'easy'];

export interface Card {
  /** Epoch ms when the card is next due. */
  due: number;
  /** Days until the next review after this one; 0 while the card is still being learnt. */
  interval: number;
  /** Interval multiplier, never below MIN_EASE. */
  ease: number;
  /** Successful reviews in a row. */
  reps: number;
  /** Times the card was forgotten after it had graduated. */
  lapses: number;
}

export const DAY = 86_400_000;
export const START_EASE = 2.5;
export const MIN_EASE = 1.3;
/** A lapse or a fresh miss comes back within the same sitting, not tomorrow. */
export const RELEARN_MS = 10 * 60_000;

export const newCard = (now: number): Card => ({ due: now, interval: 0, ease: START_EASE, reps: 0, lapses: 0 });

/** The card after one review. `now` is when the learner answered. */
export function review(card: Card, grade: Grade, now: number): Card {
  if (grade === 'again') {
    return {
      due: now + RELEARN_MS,
      interval: 0,
      ease: Math.max(MIN_EASE, card.ease - 0.2),
      reps: 0,
      lapses: card.reps > 0 ? card.lapses + 1 : card.lapses,
    };
  }
  const ease = Math.max(MIN_EASE, card.ease + (grade === 'hard' ? -0.15 : grade === 'easy' ? 0.15 : 0));
  let interval: number;
  if (card.reps === 0) interval = grade === 'easy' ? 4 : 1;
  else if (card.reps === 1) interval = grade === 'hard' ? 3 : grade === 'easy' ? 8 : 6;
  else {
    const factor = grade === 'hard' ? 1.2 : grade === 'easy' ? ease * 1.3 : ease;
    // Always move forward by at least a day, or a hard card could loop on the same interval.
    interval = Math.max(card.interval + 1, Math.round(card.interval * factor));
  }
  return { due: now + interval * DAY, interval, ease, reps: card.reps + 1, lapses: card.lapses };
}

/** A quiz answer as a review: a miss is `again`, a hit is `good`. */
export const gradeOf = (correct: boolean): Grade => (correct ? 'good' : 'again');

/** Cards due by `now`, most overdue first. */
export function dueIds(cards: Record<string, Card>, now: number): string[] {
  return Object.entries(cards)
    .filter(([, c]) => c.due <= now)
    .sort((a, b) => a[1].due - b[1].due || (a[0] < b[0] ? -1 : 1))
    .map(([id]) => id);
}

/** How many cards fall due on each of the next `days` local days, today first (overdue counts as today). */
export function forecast(cards: Record<string, Card>, now: number, days = 7): number[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const out = Array.from({ length: days }, () => 0);
  for (const c of Object.values(cards)) {
    const d = Math.max(0, Math.floor((c.due - start.getTime()) / DAY));
    if (d < days) out[d]++;
  }
  return out;
}

/** The next due time if the learner gave each grade now, for the grade buttons' hints. */
export function previewIntervals(card: Card, now: number): Record<Grade, number> {
  return Object.fromEntries(GRADES.map((g) => [g, review(card, g, now).due - now])) as Record<Grade, number>;
}

export function formatInterval(ms: number): string {
  if (ms < 3_600_000) return `${Math.max(1, Math.round(ms / 60_000))} min`;
  if (ms < DAY) return `${Math.round(ms / 3_600_000)} h`;
  const d = Math.round(ms / DAY);
  if (d < 31) return `${d} d`;
  if (d < 365) return `${Math.round(d / 30)} mo`;
  return `${(d / 365).toFixed(1)} y`;
}
