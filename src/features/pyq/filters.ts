import type { Difficulty, Pyq, PyqIndexEntry, QuestionType } from '@/content/types';
import type { Attempt } from '@/features/progress/store';

/** What a PYQ list row needs; the index has it for every PYQ without loading the solutions. */
export type PyqListItem = Omit<PyqIndexEntry, 'aids'> & { aids?: PyqIndexEntry['aids'] };

const PREVIEW_CHARS = 220;

/** The opening of a stem, cut at a space and never inside a $…$ span (as the site-data emitter does). */
export function stemPreview(text: string, max = PREVIEW_CHARS) {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  let inMath = false;
  for (let i = 0; i < flat.length; i++) {
    if (flat[i] === '\\' && flat[i + 1] === '$') i++;
    else if (flat[i] === '$') inMath = !inMath;
    else if (!inMath && i >= max && flat[i] === ' ') return `${flat.slice(0, i)}…`;
  }
  return flat;
}

export const toListItem = (q: Pyq): PyqListItem => ({
  id: q.id,
  paper: q.paper,
  year: q.year,
  section: q.section,
  n: q.n,
  type: q.type,
  marks: q.marks,
  topic: q.topic,
  difficulty: q.difficulty,
  preview: stemPreview(q.stem),
  disputed: Boolean(q.keyNote) && q.key.kind !== 'mta',
  mta: q.key.kind === 'mta',
  subject: q.subject,
  chapter: q.chapter,
});

export type AttemptFilter = 'all' | 'new' | 'wrong' | 'correct';

export interface PyqFilters {
  type: QuestionType | 'all';
  marks: 'all' | '1' | '2';
  year: string;
  difficulty: Difficulty | 'all';
  status: AttemptFilter;
  subject: string;
  chapter: string;
  q: string;
}

export const DEFAULT_FILTERS: PyqFilters = {
  type: 'all',
  marks: 'all',
  year: 'all',
  difficulty: 'all',
  status: 'all',
  subject: 'all',
  chapter: 'all',
  q: '',
};

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

export function readFilters(params: URLSearchParams): PyqFilters {
  return {
    type: pick(params.get('type'), ['all', 'mcq', 'msq', 'nat'] as const, 'all'),
    marks: pick(params.get('marks'), ['all', '1', '2'] as const, 'all'),
    year: /^20\d\d$/.test(params.get('year') ?? '') ? (params.get('year') as string) : 'all',
    difficulty: pick(params.get('difficulty'), ['all', 'easy', 'medium', 'hard'] as const, 'all'),
    status: pick(params.get('status'), ['all', 'new', 'wrong', 'correct'] as const, 'all'),
    subject: params.get('subject') || 'all',
    chapter: params.get('chapter') || 'all',
    q: params.get('q') ?? '',
  };
}

/** A copy of `params` with one filter changed; defaults are dropped so URLs stay short. */
export function withFilter(params: URLSearchParams, key: keyof PyqFilters, value: string) {
  const next = new URLSearchParams(params);
  if (value === DEFAULT_FILTERS[key]) next.delete(key);
  else next.set(key, value);
  return next;
}

export const activeFilterCount = (f: PyqFilters) =>
  (Object.keys(DEFAULT_FILTERS) as (keyof PyqFilters)[]).filter((k) => f[k] !== DEFAULT_FILTERS[k]).length;

export function filterPyqs<T extends PyqListItem>(list: T[], f: PyqFilters, attempts: Record<string, Attempt>): T[] {
  const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((p) => {
    if (f.type !== 'all' && p.type !== f.type) return false;
    if (f.marks !== 'all' && String(p.marks) !== f.marks) return false;
    if (f.year !== 'all' && String(p.year) !== f.year) return false;
    if (f.difficulty !== 'all' && p.difficulty !== f.difficulty) return false;
    if (f.subject !== 'all' && p.subject !== f.subject) return false;
    if (f.chapter !== 'all' && p.chapter !== f.chapter) return false;
    const a = attempts[p.id];
    if (f.status === 'new' && a) return false;
    if (f.status === 'wrong' && (!a || a.correct)) return false;
    if (f.status === 'correct' && !a?.correct) return false;
    if (words.length) {
      const hay = p.preview.toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}
