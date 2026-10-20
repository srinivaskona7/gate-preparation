import type { Paper, PyqIndexEntry } from '@/content/types';

/** One row of the ledger: counts only, taken from the imported data and never estimated. */
export interface CoverageRow {
  imported: number;
  mapped: number;
  /** Solved here, which the validator only allows when our answer scores under the official key. */
  verified: number;
  skipped: number;
  disputed: number;
  hints: number;
  recognize: number;
  check: number;
  variation: number;
  /** All four learning aids present. */
  ready: number;
}

const empty = (): CoverageRow => ({ imported: 0, mapped: 0, verified: 0, skipped: 0, disputed: 0, hints: 0, recognize: 0, check: 0, variation: 0, ready: 0 });

export function coverageByPaper(papers: Paper[], index: PyqIndexEntry[]): Map<string, CoverageRow> {
  const rows = new Map<string, CoverageRow>();
  const solved = new Map(index.map((e) => [e.id, e]));
  for (const p of papers) {
    const row = empty();
    for (const q of p.questions) {
      row.imported += 1;
      if (q.chapter) row.mapped += 1;
      if (q.status === 'skipped') row.skipped += 1;
      const e = q.status === 'solved' ? solved.get(q.id) : undefined;
      if (!e) continue;
      row.verified += 1;
      if (e.disputed) row.disputed += 1;
      if (e.aids.hints) row.hints += 1;
      if (e.aids.recognize) row.recognize += 1;
      if (e.aids.check) row.check += 1;
      if (e.aids.variation) row.variation += 1;
      if (e.aids.hints && e.aids.recognize && e.aids.check && e.aids.variation) row.ready += 1;
    }
    rows.set(p.id, row);
  }
  return rows;
}

export function sumCoverage(rows: Iterable<CoverageRow>): CoverageRow {
  const total = empty();
  for (const r of rows) for (const k of Object.keys(total) as (keyof CoverageRow)[]) total[k] += r[k];
  return total;
}

/** Solved questions grouped by chapter, for the "where the gaps are" table. */
export function readyByChapter(index: PyqIndexEntry[]): Map<string, { solved: number; ready: number }> {
  const out = new Map<string, { solved: number; ready: number }>();
  for (const e of index) {
    const row = out.get(e.chapter) ?? { solved: 0, ready: 0 };
    row.solved += 1;
    if (e.aids.hints && e.aids.recognize && e.aids.check && e.aids.variation) row.ready += 1;
    out.set(e.chapter, row);
  }
  return out;
}

/** Topics with a beginner lesson, per chapter; `topics` is every topic the chapter file defines. */
export function lessonCoverage(chapters: { id: string; topics: number; lessons: number }[]) {
  return {
    topics: chapters.reduce((s, c) => s + c.topics, 0),
    lessons: chapters.reduce((s, c) => s + c.lessons, 0),
  };
}
