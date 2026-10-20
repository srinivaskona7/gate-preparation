import MiniSearch, { type SearchResult } from 'minisearch';
import { chapterPath, loadSearchDocs } from '@/content/catalog';
import type { QuestionType, SearchDoc, SearchKind } from '@/content/types';

export const KIND_LABEL: Record<SearchKind, string> = {
  chapter: 'Chapters',
  topic: 'Topics',
  formula: 'Formulas',
  derivation: 'Derivations',
  problem: 'Problem types',
  pyq: 'Official PYQs',
  question: 'Practice questions',
  syllabus: '2027 syllabus',
};

export const KIND_ORDER = Object.keys(KIND_LABEL) as SearchKind[];

export interface Hit {
  id: string;
  kind: SearchKind;
  title: string;
  chapter: string;
  subject: string | null;
  label?: string;
  qtype?: QuestionType;
  marks?: 1 | 2;
  score: number;
}

const STORE_FIELDS = ['kind', 'title', 'chapter', 'subject', 'label', 'qtype', 'marks'] as const;

/** Where a search result opens. Ids carry a kind prefix where two kinds could share one. */
export function hitPath(hit: Pick<Hit, 'id' | 'kind' | 'chapter'>): string {
  switch (hit.kind) {
    case 'chapter':
      return chapterPath(hit.chapter);
    case 'topic':
      return chapterPath(hit.chapter, 'learn', hit.id);
    case 'formula':
      return chapterPath(hit.chapter, 'formulas', hit.id);
    case 'problem':
      return chapterPath(hit.chapter, 'problems', hit.id);
    case 'question':
      return chapterPath(hit.chapter, 'practice', hit.id);
    case 'pyq':
      return chapterPath(hit.chapter, 'pyqs', hit.id.replace(/^pyq:/, ''));
    case 'derivation':
      return chapterPath(hit.chapter, 'derivations', hit.id.replace(/^derivation:[^/]+\//, ''));
    case 'syllabus':
      return `/syllabus/${hit.id.replace(/^syllabus:/, '')}`;
  }
}

let index: Promise<MiniSearch<SearchDoc>> | undefined;

/** Builds the index once, on the first search, from the lazily loaded search.json. */
export function searchIndex() {
  index ??= loadSearchDocs().then((docs) => {
    const ms = new MiniSearch<SearchDoc>({
      fields: ['title', 'text', 'label'],
      storeFields: [...STORE_FIELDS],
      searchOptions: { boost: { title: 3, label: 2 }, prefix: true, fuzzy: 0.2 },
    });
    ms.addAll(docs);
    return ms;
  });
  return index;
}

const toHit = (r: SearchResult): Hit => ({
  id: String(r.id),
  kind: r.kind as SearchKind,
  title: r.title as string,
  chapter: r.chapter as string,
  subject: (r.subject as string | null) ?? null,
  label: r.label as string | undefined,
  qtype: r.qtype as QuestionType | undefined,
  marks: r.marks as 1 | 2 | undefined,
  score: r.score,
});

/** Every word must match; when nothing does, any word may. */
export function search(ms: MiniSearch<SearchDoc>, query: string, kinds?: ReadonlySet<SearchKind>, limit = 40): Hit[] {
  const filter = kinds?.size ? (r: SearchResult) => kinds.has(r.kind as SearchKind) : undefined;
  let results = ms.search(query, { combineWith: 'AND', filter });
  if (!results.length) results = ms.search(query, { combineWith: 'OR', filter });
  return results.slice(0, limit).map(toHit);
}
