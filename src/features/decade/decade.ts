import type { Paper } from '@/content/types';

export const UNMAPPED = 'unmapped';

export interface PaperColumn {
  id: string;
  year: number;
  set: number | null;
}

export interface MarksRow {
  id: string;
  /** Marks per paper id. */
  byPaper: Record<string, number>;
  total: number;
  /** Mean marks per paper over the papers in view. */
  mean: number;
  /** Share of all marks in view. */
  share: number;
  /** Fewest and most marks in any one paper. */
  min: number;
  max: number;
}

/** The newest `years` years of papers, oldest first, so columns read left to right in time. */
export function recentPapers(papers: Paper[], years = 10): Paper[] {
  const newest = Math.max(0, ...papers.map((p) => p.year));
  return papers
    .filter((p) => p.year > newest - years)
    .sort((a, b) => a.year - b.year || (a.set ?? 0) - (b.set ?? 0));
}

export const columns = (papers: Paper[]): PaperColumn[] => papers.map((p) => ({ id: p.id, year: p.year, set: p.set }));

/** Marks by `keyOf(question)` per paper. Questions with no key land under UNMAPPED. */
export function marksMatrix(papers: Paper[], keyOf: (q: Paper['questions'][number]) => string | null): MarksRow[] {
  const rows = new Map<string, Record<string, number>>();
  let all = 0;
  for (const p of papers) {
    for (const q of p.questions) {
      const key = keyOf(q) ?? UNMAPPED;
      const row = rows.get(key) ?? {};
      row[p.id] = (row[p.id] ?? 0) + q.marks;
      rows.set(key, row);
      all += q.marks;
    }
  }
  const n = Math.max(papers.length, 1);
  return [...rows.entries()]
    .map(([id, byPaper]) => {
      const per = papers.map((p) => byPaper[p.id] ?? 0);
      const total = per.reduce((s, m) => s + m, 0);
      return { id, byPaper, total, mean: total / n, share: all ? total / all : 0, min: Math.min(...per), max: Math.max(...per) };
    })
    .sort((a, b) => b.total - a.total || (a.id < b.id ? -1 : 1));
}

/** Marks every paper in view carries, for column totals. */
export const paperTotal = (p: Paper) => p.questions.reduce((s, q) => s + q.marks, 0);
