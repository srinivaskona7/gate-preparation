import catalogJson from '@/generated/catalog.json';
import type {
  Catalog,
  ChapterBody,
  ChapterMeta,
  Derivations,
  LocatedFormula,
  LocatedQuestion,
  Paper,
  Pyq,
  PyqIndexEntry,
  RevisionSheet,
  SearchDoc,
  Subject,
} from './types';

export const catalog = catalogJson as unknown as Catalog;
export const subjects: Subject[] = catalog.subjects;

export interface ChapterEntry extends ChapterMeta {
  subject: Subject;
}

export const chapters: ChapterEntry[] = subjects.flatMap((subject) => subject.chapters.map((c) => ({ ...c, subject })));
const chapterById = new Map(chapters.map((c) => [c.id, c]));
const subjectById = new Map(subjects.map((s) => [s.id, s]));

export const getChapter = (id: string | undefined) => (id ? chapterById.get(id) : undefined);
export const getSubject = (id: string | undefined) => (id ? subjectById.get(id) : undefined);

/** Topic id → title, across every ready chapter. */
export const topicTitles = new Map(chapters.flatMap((c) => c.topicIndex.map((t) => [t.id, t.title] as const)));

// Each chapter body is its own chunk, fetched the first time the chapter opens.
const chapterModules = import.meta.glob<ChapterBody>('../generated/chapters/*.json', { import: 'default' });

export function loadChapter(id: string): Promise<ChapterBody> {
  const load = chapterModules[`../generated/chapters/${id}.json`];
  if (!load) return Promise.reject(new Error(`Chapter "${id}" has no content yet`));
  return load();
}

const derivationModules = import.meta.glob<Derivations>('../generated/derivations/*.json', { import: 'default' });
const pyqModules = import.meta.glob<Pyq[]>('../generated/pyqs/*.json', { import: 'default' });

export function loadDerivations(id: string): Promise<Derivations> {
  const load = derivationModules[`../generated/derivations/${id}.json`];
  if (!load) return Promise.reject(new Error(`Chapter "${id}" has no derivations yet`));
  return load();
}

/** A chapter's solved PYQs, newest paper first; empty when none are solved yet. */
export function loadPyqs(id: string): Promise<Pyq[]> {
  const load = pyqModules[`../generated/pyqs/${id}.json`];
  return load ? load() : Promise.resolve([]);
}

export const loadFormulas = () =>
  import('@/generated/formulas.json').then((m) => m.default as unknown as LocatedFormula[]);
export const loadQuestions = () =>
  import('@/generated/questions.json').then((m) => m.default as unknown as LocatedQuestion[]);
export const loadRevision = () =>
  import('@/generated/revision.json').then((m) => m.default as unknown as RevisionSheet[]);
export const loadSearchDocs = () =>
  import('@/generated/search.json').then((m) => m.default as unknown as SearchDoc[]);
export const loadPyqIndex = () =>
  import('@/generated/pyq-index.json').then((m) => m.default as unknown as PyqIndexEntry[]);
export const loadPapers = () =>
  import('@/generated/papers.json').then((m) => m.default as unknown as Paper[]);

export const chapterPath = (id: string, tab?: string, item?: string) =>
  `/chapter/${id}${tab ? `/${tab}` : ''}${tab && item ? `/${encodeURIComponent(item)}` : ''}`;
export const subjectPath = (id: string) => `/subject/${id}`;
export const paperPath = (id: string) => `/papers/${id}`;

/** "gate-cse-2024-s1" → "2024 Set 1"; single-set years read "2019". */
export function paperShortTitle(id: string) {
  const m = /^gate-cse-(\d{4})(?:-s(\d))?$/.exec(id);
  if (!m) return id;
  return m[2] ? `${m[1]} Set ${m[2]}` : m[1];
}
