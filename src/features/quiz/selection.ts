import type { QuestionType } from '@/content/types';
import { random } from '@/lib/random';

export type QuizSource = 'practice' | 'pyq';
export type QuizMode = 'practice' | 'exam';

/** What a quiz URL describes. The seed fixes the draw, so a reload or a shared link gets the same set. */
export interface QuizSpec {
  source: QuizSource;
  chapters: string[];
  topics: string[];
  ids: string[];
  types: QuestionType[];
  /** How many to draw; null takes every match. */
  n: number | null;
  mode: QuizMode;
  seed: number | null;
}

export const DEFAULT_COUNT = 10;
const MAX_COUNT = 130;
const TYPES: readonly QuestionType[] = ['mcq', 'msq', 'nat'];

/** GATE's pace: 180 minutes for 100 marks. */
export const MINUTES_PER_MARK = 1.8;
export const examMinutes = (marks: number) => Math.ceil(marks * MINUTES_PER_MARK);

/** Official PYQ ids carry their paper id, e.g. gate-cse-2024-s1-q30 (scripts/lib/pyq.mjs). */
export const isPyqId = (id: string) => /^gate-cse-\d{4}/.test(id);

const list = (value: string | null) => [...new Set((value ?? '').split(',').map((s) => s.trim()).filter(Boolean))];

export function readSpec(params: URLSearchParams): QuizSpec {
  const ids = list(params.get('ids'));
  const n = Number(params.get('n'));
  const seed = Number(params.get('seed'));
  return {
    source: params.get('source') === 'pyq' ? 'pyq' : 'practice',
    chapters: list(params.get('chapters')),
    topics: list(params.get('topics')),
    ids,
    types: list(params.get('types')).filter((t): t is QuestionType => TYPES.includes(t as QuestionType)),
    // A hand-picked list is taken whole unless the URL says otherwise.
    n: params.get('n') === 'all' ? null : Number.isInteger(n) && n > 0 ? Math.min(n, MAX_COUNT) : ids.length ? null : DEFAULT_COUNT,
    mode: params.get('mode') === 'exam' ? 'exam' : 'practice',
    seed: params.has('seed') && Number.isInteger(seed) && seed >= 0 ? seed : null,
  };
}

/** The spec as query parameters, defaults left out; readSpec(specParams(s)) gives back s. */
export function specParams(spec: QuizSpec): URLSearchParams {
  const p = new URLSearchParams();
  if (spec.source !== 'practice') p.set('source', spec.source);
  if (spec.chapters.length) p.set('chapters', spec.chapters.join(','));
  if (spec.topics.length) p.set('topics', spec.topics.join(','));
  if (spec.ids.length) p.set('ids', spec.ids.join(','));
  if (spec.types.length) p.set('types', spec.types.join(','));
  if (spec.n === null) {
    if (!spec.ids.length) p.set('n', 'all');
  } else if (spec.ids.length || spec.n !== DEFAULT_COUNT) p.set('n', String(spec.n));
  p.set('mode', spec.mode);
  if (spec.seed !== null) p.set('seed', String(spec.seed));
  return p;
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);

export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const next = random(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface Drawable {
  id: string;
  chapter: string;
  topic: string;
  type: QuestionType;
  marks: 1 | 2;
}

/**
 * The questions a spec selects from a pool. A hand-picked id list keeps its order; anything
 * else is shuffled by the seed. A timed draw puts 1-mark questions before 2-mark ones, as GATE does;
 * a hand-picked list is already in paper order (GA 1–10 first), so it keeps that order.
 */
export function selectQuestions<T extends Drawable>(pool: readonly T[], spec: QuizSpec, seed: number): T[] {
  let picked: T[];
  if (spec.ids.length) {
    const byId = new Map(pool.map((q) => [q.id, q]));
    picked = spec.ids.flatMap((id) => byId.get(id) ?? []);
  } else {
    const chapters = new Set(spec.chapters);
    const topics = new Set(spec.topics);
    // Sorting first makes the draw depend on the seed alone, not on the order the pool loaded in,
    // so the builder's preview and the quiz page agree.
    picked = shuffle(
      pool
        .filter((q) => (!chapters.size || chapters.has(q.chapter)) && (!topics.size || topics.has(q.topic)))
        .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
      seed,
    );
  }
  if (spec.types.length) picked = picked.filter((q) => spec.types.includes(q.type));
  if (spec.n !== null) picked = picked.slice(0, spec.n);
  if (spec.mode === 'exam' && !spec.ids.length) picked = [...picked].sort((a, b) => a.marks - b.marks);
  return picked;
}
