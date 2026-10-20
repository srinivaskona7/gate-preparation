// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { DAY, RELEARN_MS } from '@/features/review/srs';
import { applyAnswer, migrateV1 } from './store';

const T0 = new Date(2026, 9, 18, 9, 0).getTime();
const empty = { attempts: {}, history: {}, cards: {} };

describe('applyAnswer', () => {
  it('puts a miss in the deck and records the time', () => {
    const s = applyAnswer(empty, { id: 'q', correct: false, seconds: 90 }, T0);
    expect(s.history.q).toEqual({ seen: 1, wrong: 1, lastCorrect: false, lastAt: T0, seconds: 90, timed: 1, assisted: 0, independentCorrect: 0, hints: 0 });
    expect(s.cards.q.due).toBe(T0 + RELEARN_MS);
    expect(s.attempts).toEqual({ q: { correct: false, at: T0 } });
  });

  it('keeps a first-time hit out of the deck', () => {
    const s = applyAnswer(empty, { id: 'q', correct: true }, T0);
    expect(s.cards).toEqual({});
    expect(s.history.q.timed).toBe(0);
  });

  it('advances a card already in the deck on a hit', () => {
    const missed = applyAnswer(empty, { id: 'q', correct: false }, T0);
    const s = applyAnswer(missed, { id: 'q', correct: true }, T0 + RELEARN_MS);
    expect(s.cards.q.due).toBe(T0 + RELEARN_MS + DAY);
    expect(s.history.q).toMatchObject({ seen: 2, wrong: 1, lastCorrect: true });
  });
});

describe('assisted and independent answers', () => {
  it('counts a right answer after a hint as assisted, not independent', () => {
    const s = applyAnswer(empty, { id: 'q', correct: true, assisted: true, hints: 2 }, T0);
    expect(s.history.q).toMatchObject({ assisted: 1, independentCorrect: 0, hints: 2 });
  });

  it('counts a right answer on the learner\'s own as independent', () => {
    const s = applyAnswer(empty, { id: 'q', correct: true }, T0);
    expect(s.history.q).toMatchObject({ assisted: 0, independentCorrect: 1, hints: 0 });
  });
});

describe('migrateV1', () => {
  it('seeds history from v1 attempts and decks only the misses', () => {
    const m = migrateV1({ a: { correct: true, at: T0 }, b: { correct: false, at: T0 } });
    expect(Object.keys(m.history)).toEqual(['a', 'b']);
    expect(Object.keys(m.cards)).toEqual(['b']);
    expect(m.history.b.wrong).toBe(1);
  });
});
