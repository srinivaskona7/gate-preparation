import { describe, expect, it } from 'vitest';
import { activeFilterCount, DEFAULT_FILTERS, filterPyqs, type PyqListItem, readFilters, stemPreview, withFilter } from './filters';

const item = (over: Partial<PyqListItem>): PyqListItem => ({
  id: 'gate-cse-2024-s1-q30',
  paper: 'gate-cse-2024-s1',
  year: 2024,
  section: 'CS',
  n: 30,
  type: 'nat',
  marks: 1,
  topic: 'os-memory-management.tlb',
  difficulty: 'medium',
  preview: 'A computer uses a TLB with a hit ratio of 0.9',
  disputed: false,
  mta: false,
  subject: 'operating-systems',
  chapter: 'os-memory-management',
  ...over,
});

describe('stemPreview', () => {
  it('keeps short stems whole and flattens whitespace', () => {
    expect(stemPreview('Two\n\nlines')).toBe('Two lines');
  });

  it('cuts at the first space after the limit, but never inside math', () => {
    expect(stemPreview('aaaa bbbb cccc', 6)).toBe('aaaa bbbb…');
    expect(stemPreview('aa $x + y + z$ tail end', 4)).toBe('aa $x + y + z$…');
    expect(stemPreview('costs \\$5 and $a b$ more words', 8)).toBe('costs \\$5…');
  });
});

describe('readFilters / withFilter', () => {
  it('falls back to defaults for unknown values', () => {
    expect(readFilters(new URLSearchParams('type=essay&marks=3&year=19&status=x'))).toEqual(DEFAULT_FILTERS);
  });

  it('drops a filter from the URL when it returns to its default', () => {
    const p = withFilter(new URLSearchParams('type=nat&year=2024'), 'type', 'all');
    expect(p.toString()).toBe('year=2024');
    expect(activeFilterCount(readFilters(p))).toBe(1);
  });
});

describe('filterPyqs', () => {
  const list = [
    item({ id: 'a', type: 'mcq', marks: 2, year: 2019, difficulty: 'hard', preview: 'Deadlock with three processes' }),
    item({ id: 'b', type: 'nat', marks: 1, year: 2024 }),
    item({ id: 'c', type: 'msq', marks: 2, year: 2024, chapter: 'os-cpu-scheduling' }),
  ];
  const ids = (f: Partial<typeof DEFAULT_FILTERS>, attempts = {}) => filterPyqs(list, { ...DEFAULT_FILTERS, ...f }, attempts).map((p) => p.id);

  it('combines filters with AND', () => {
    expect(ids({ year: '2024' })).toEqual(['b', 'c']);
    expect(ids({ year: '2024', marks: '2' })).toEqual(['c']);
    expect(ids({ chapter: 'os-memory-management', type: 'mcq' })).toEqual(['a']);
  });

  it('matches every word of the text query against the preview', () => {
    expect(ids({ q: 'three deadlock' })).toEqual(['a']);
    expect(ids({ q: 'deadlock tlb' })).toEqual([]);
  });

  it('filters by the learner’s attempts', () => {
    const attempts = { a: { correct: true, at: 1 }, b: { correct: false, at: 1 } };
    expect(ids({ status: 'new' }, attempts)).toEqual(['c']);
    expect(ids({ status: 'wrong' }, attempts)).toEqual(['b']);
    expect(ids({ status: 'correct' }, attempts)).toEqual(['a']);
  });
});
