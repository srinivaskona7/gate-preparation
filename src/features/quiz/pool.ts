import { chapters, getChapter, loadPyqIndex, loadPyqs, loadQuestions, topicTitles } from '@/content/catalog';
import type { LocatedQuestion, Pyq } from '@/content/types';
import { plural } from '@/lib/utils';
import type { QuizSpec } from './selection';

/** A practice question or an official PYQ, with the chapter it belongs to. */
export type QuizItem = LocatedQuestion | Pyq;

export const isPyq = (q: QuizItem): q is Pyq => 'key' in q;

const chapterOfTopic = new Map(chapters.flatMap((c) => c.topicIndex.map((t) => [t.id, c.id] as const)));

/** Which chapters' solved PYQs a spec can draw from, so only those chunks are fetched. */
async function pyqChapters(spec: QuizSpec): Promise<string[]> {
  if (spec.chapters.length) return spec.chapters;
  if (spec.topics.length) return [...new Set(spec.topics.flatMap((t) => chapterOfTopic.get(t) ?? []))];
  if (spec.ids.length) {
    const wanted = new Set(spec.ids);
    const index = await loadPyqIndex();
    return [...new Set(index.filter((e) => wanted.has(e.id)).map((e) => e.chapter))];
  }
  return chapters.filter((c) => c.memory.pyqs > 0).map((c) => c.id);
}

export async function loadPool(spec: QuizSpec): Promise<QuizItem[]> {
  if (spec.source === 'practice') return loadQuestions();
  const ids = await pyqChapters(spec);
  return (await Promise.all(ids.map(loadPyqs))).flat();
}

/** A short name for a quiz, from what it draws on. */
export function quizTitle(spec: QuizSpec): string {
  const prefix = spec.source === 'pyq' ? 'Official PYQs' : 'Practice';
  if (spec.ids.length) return `${prefix} · ${plural(spec.ids.length, 'chosen question')}`;
  if (spec.topics.length) {
    const names = spec.topics.map((t) => topicTitles.get(t) ?? t);
    return `${prefix} · ${names.length > 2 ? `${names.slice(0, 2).join(', ')} and ${names.length - 2} more` : names.join(' and ')}`;
  }
  const picked = spec.chapters.flatMap((id) => getChapter(id) ?? []);
  if (picked.length === 1) return `${prefix} · ${picked[0].title}`;
  if (picked.length) {
    const codes = new Set(picked.map((c) => c.subject.code));
    return `${prefix} · ${codes.size === 1 ? `${[...codes][0]}, ` : ''}${plural(picked.length, 'chapter')}`;
  }
  return `${prefix} · every chapter`;
}
