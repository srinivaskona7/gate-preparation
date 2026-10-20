import { loadFormulas, loadPyqIndex, loadPyqs, loadQuestions } from '@/content/catalog';
import type { LocatedFormula } from '@/content/types';
import { isPyqId } from '@/features/quiz/selection';
import type { QuizItem } from '@/features/quiz/pool';
import { type Card, DAY } from './srs';

/** Formula cards share the deck with questions; the prefix keeps the two id spaces apart. */
export const FORMULA_PREFIX = 'formula:';
export const formulaCardId = (formulaId: string) => `${FORMULA_PREFIX}${formulaId}`;
export const isFormulaCard = (id: string) => id.startsWith(FORMULA_PREFIX);

/** A graduated card waits this many days or more; Anki calls such a card mature. */
export const MATURE_DAYS = 21;

export interface DeckStats {
  total: number;
  due: number;
  learning: number;
  young: number;
  mature: number;
  formulas: number;
}

export function deckStats(cards: Record<string, Card>, now: number): DeckStats {
  const s: DeckStats = { total: 0, due: 0, learning: 0, young: 0, mature: 0, formulas: 0 };
  for (const [id, c] of Object.entries(cards)) {
    s.total++;
    if (c.due <= now) s.due++;
    if (c.interval === 0) s.learning++;
    else if (c.interval < MATURE_DAYS) s.young++;
    else s.mature++;
    if (isFormulaCard(id)) s.formulas++;
  }
  return s;
}

/** Days until a card is next due, rounded up; 0 when it is due now. */
export const daysUntilDue = (card: Card, now: number) => Math.max(0, Math.ceil((card.due - now) / DAY));

export type DeckItem = { kind: 'question'; id: string; question: QuizItem } | { kind: 'formula'; id: string; formula: LocatedFormula };

/**
 * The content behind deck ids, in the order given. Ids whose content no longer exists (a
 * question removed from a chapter) are dropped, so a stale card never blocks the queue.
 */
export async function loadDeckItems(ids: string[]): Promise<DeckItem[]> {
  const formulaIds = ids.filter(isFormulaCard);
  const pyqIds = ids.filter((id) => !isFormulaCard(id) && isPyqId(id));
  const practiceIds = ids.filter((id) => !isFormulaCard(id) && !isPyqId(id));

  const [formulas, practice, pyqs] = await Promise.all([
    formulaIds.length ? loadFormulas() : [],
    practiceIds.length ? loadQuestions() : [],
    pyqIds.length ? loadPyqsFor(pyqIds) : [],
  ]);
  const byId = new Map<string, DeckItem>();
  for (const f of formulas) byId.set(formulaCardId(f.id), { kind: 'formula', id: formulaCardId(f.id), formula: f });
  for (const q of [...practice, ...pyqs]) byId.set(q.id, { kind: 'question', id: q.id, question: q });
  return ids.flatMap((id) => byId.get(id) ?? []);
}

async function loadPyqsFor(ids: string[]) {
  const wanted = new Set(ids);
  const index = await loadPyqIndex();
  const chapters = [...new Set(index.filter((e) => wanted.has(e.id)).map((e) => e.chapter))];
  return (await Promise.all(chapters.map(loadPyqs))).flat();
}
