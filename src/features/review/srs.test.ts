import { describe, expect, it } from 'vitest';
import { DAY, dueIds, forecast, formatInterval, MIN_EASE, newCard, RELEARN_MS, review } from './srs';

const T0 = new Date(2026, 9, 18, 9, 0).getTime();

describe('review', () => {
  it('graduates a new card through 1, 6 and then ease-scaled days', () => {
    let c = review(newCard(T0), 'good', T0);
    expect([c.interval, c.reps, c.due - T0]).toEqual([1, 1, DAY]);
    c = review(c, 'good', c.due);
    expect(c.interval).toBe(6);
    c = review(c, 'good', c.due);
    expect(c.interval).toBe(15); // round(6 × 2.5)
    expect(c.ease).toBe(2.5);
  });

  it('sends a lapse back within the sitting, counts it, and lowers ease', () => {
    const learnt = { due: T0, interval: 15, ease: 2.5, reps: 3, lapses: 0 };
    const c = review(learnt, 'again', T0);
    expect(c).toEqual({ due: T0 + RELEARN_MS, interval: 0, ease: 2.3, reps: 0, lapses: 1 });
  });

  it('does not count a miss on a card never learnt as a lapse', () => {
    expect(review(newCard(T0), 'again', T0).lapses).toBe(0);
  });

  it('keeps ease at or above the floor', () => {
    let c = newCard(T0);
    for (let i = 0; i < 20; i++) c = review(c, 'again', T0);
    expect(c.ease).toBe(MIN_EASE);
  });

  it('always moves a hard card forward', () => {
    const c = review({ due: T0, interval: 2, ease: MIN_EASE, reps: 4, lapses: 0 }, 'hard', T0);
    expect(c.interval).toBe(3);
  });

  it('spaces easy further than good, and good further than hard', () => {
    const base = { due: T0, interval: 10, ease: 2.5, reps: 3, lapses: 0 };
    const [h, g, e] = (['hard', 'good', 'easy'] as const).map((x) => review(base, x, T0).interval);
    expect(h).toBeLessThan(g);
    expect(g).toBeLessThan(e);
  });
});

describe('queues', () => {
  const cards = {
    a: { ...newCard(T0), due: T0 - 2 * DAY },
    b: { ...newCard(T0), due: T0 - DAY },
    c: { ...newCard(T0), due: T0 + 3 * DAY },
  };

  it('lists due cards most overdue first', () => {
    expect(dueIds(cards, T0)).toEqual(['a', 'b']);
  });

  it('forecasts overdue as today and buckets by local day', () => {
    expect(forecast(cards, T0, 5)).toEqual([2, 0, 0, 1, 0]);
  });

  it('formats intervals', () => {
    expect([formatInterval(RELEARN_MS), formatInterval(DAY), formatInterval(45 * DAY)]).toEqual(['10 min', '1 d', '2 mo']);
  });
});
