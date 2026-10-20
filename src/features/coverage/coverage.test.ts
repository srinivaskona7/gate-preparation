import { describe, expect, it } from 'vitest';
import type { Paper, PyqIndexEntry } from '@/content/types';
import { coverageByPaper, readyByChapter, sumCoverage } from './coverage';

const aids = (on: boolean) => ({ hints: on, recognize: on, check: on, variation: on, diagram: false });
const entry = (id: string, on: boolean, disputed = false) => ({ id, chapter: 'c1', disputed, aids: aids(on) }) as unknown as PyqIndexEntry;
const q = (id: string, status: string, chapter: string | null = 'c1') => ({ id, status, chapter });
const paper = { id: 'p', questions: [q('a', 'solved'), q('b', 'solved'), q('c', 'skipped'), q('d', 'open', null)] } as unknown as Paper;

describe('coverage', () => {
  const rows = coverageByPaper([paper], [entry('a', true), entry('b', false, true)]);
  const r = rows.get('p');

  it('counts imported, mapped, solved and skipped from the data', () => {
    expect(r).toMatchObject({ imported: 4, mapped: 3, verified: 2, skipped: 1, disputed: 1 });
  });

  it('counts a question ready only when all four aids exist', () => {
    expect(r).toMatchObject({ hints: 1, recognize: 1, check: 1, variation: 1, ready: 1 });
  });

  it('never counts an index entry whose ledger status is not solved', () => {
    const only = coverageByPaper([paper], [entry('c', true)]).get('p');
    expect(only?.verified).toBe(0);
  });

  it('sums rows and groups ready counts by chapter', () => {
    expect(sumCoverage(rows.values()).ready).toBe(1);
    expect(readyByChapter([entry('a', true), entry('b', false)]).get('c1')).toEqual({ solved: 2, ready: 1 });
  });
});
