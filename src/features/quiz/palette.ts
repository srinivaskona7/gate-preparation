/** The GATE question palette's states; practice mode adds the checked outcomes. */
export type CellState = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked' | 'correct' | 'wrong';

export interface CellFacts {
  exam: boolean;
  visited: boolean;
  answered: boolean;
  marked: boolean;
  checked: boolean;
  correct: boolean;
}

export function cellState(f: CellFacts): CellState {
  if (!f.exam && f.checked) return f.correct ? 'correct' : 'wrong';
  if (f.marked) return f.answered ? 'answered-marked' : 'marked';
  if (f.answered) return 'answered';
  return f.visited ? 'not-answered' : 'not-visited';
}

export const CELL_LABEL: Record<CellState, string> = {
  'not-visited': 'Not visited',
  'not-answered': 'Not answered',
  answered: 'Answered',
  marked: 'Marked for review',
  'answered-marked': 'Answered and marked: evaluated',
  correct: 'Checked: correct',
  wrong: 'Checked: wrong',
};

export function tally(states: CellState[]) {
  const t: Record<CellState, number> = { 'not-visited': 0, 'not-answered': 0, answered: 0, marked: 0, 'answered-marked': 0, correct: 0, wrong: 0 };
  for (const s of states) t[s]++;
  return t;
}
