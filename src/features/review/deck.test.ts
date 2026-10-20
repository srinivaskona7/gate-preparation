import { describe, expect, it } from 'vitest';
import { daysUntilDue, deckStats, formulaCardId, isFormulaCard } from './deck';
import { DAY, newCard } from './srs';

const T0 = new Date(2026, 9, 18, 9, 0).getTime();

describe('deck', () => {
  it('keeps formula and question ids apart', () => {
    expect(formulaCardId('a.b')).toBe('formula:a.b');
    expect(isFormulaCard('formula:a.b')).toBe(true);
    expect(isFormulaCard('a.b')).toBe(false);
  });

  it('counts due, learning, young, mature and formula cards', () => {
    const cards = {
      a: newCard(T0),
      b: { ...newCard(T0), interval: 3, due: T0 + 3 * DAY },
      c: { ...newCard(T0), interval: 30, due: T0 - DAY },
      [formulaCardId('f')]: { ...newCard(T0), interval: 21, due: T0 + DAY },
    };
    expect(deckStats(cards, T0)).toEqual({ total: 4, due: 2, learning: 1, young: 1, mature: 2, formulas: 1 });
  });

  it('rounds days until due up, never below zero', () => {
    expect(daysUntilDue({ ...newCard(T0), due: T0 + DAY / 2 }, T0)).toBe(1);
    expect(daysUntilDue({ ...newCard(T0), due: T0 - DAY }, T0)).toBe(0);
  });
});
