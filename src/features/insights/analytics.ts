import type { Frequency, Paper } from '@/content/types';
import { ERROR_TAGS, type ErrorTag } from '@/features/progress/error-tags';
import type { QuestionStat } from '@/features/progress/store';

/** Where a question sits; practice questions and PYQs both carry it. */
export interface QuestionMeta {
  id: string;
  chapter: string;
  topic: string;
}

export interface TopicStat {
  topic: string;
  chapter: string;
  /** Distinct questions answered at least once. */
  questions: number;
  answers: number;
  wrong: number;
  /** Distinct questions whose latest answer was wrong. */
  stillWrong: number;
  /** Mean seconds per timed answer, or null when none was timed. */
  meanSeconds: number | null;
  /** Error rate with one imagined hit and one miss added, so one lucky answer does not read as mastery. */
  errorRate: number;
}

export function topicStats(history: Record<string, QuestionStat>, meta: QuestionMeta[]): TopicStat[] {
  const byTopic = new Map<string, TopicStat & { seconds: number; timed: number }>();
  const where = new Map(meta.map((m) => [m.id, m]));
  for (const [id, h] of Object.entries(history)) {
    const m = where.get(id);
    if (!m) continue;
    const t = byTopic.get(m.topic) ?? {
      topic: m.topic,
      chapter: m.chapter,
      questions: 0,
      answers: 0,
      wrong: 0,
      stillWrong: 0,
      meanSeconds: null,
      errorRate: 0,
      seconds: 0,
      timed: 0,
    };
    t.questions++;
    t.answers += h.seen;
    t.wrong += h.wrong;
    if (!h.lastCorrect) t.stillWrong++;
    t.seconds += h.seconds;
    t.timed += h.timed;
    byTopic.set(m.topic, t);
  }
  return [...byTopic.values()].map(({ seconds, timed, ...t }) => ({
    ...t,
    meanSeconds: timed ? seconds / timed : null,
    errorRate: (t.wrong + 1) / (t.answers + 2),
  }));
}

const EXAM_WEIGHT: Record<Frequency, number> = { high: 1, medium: 0.7, low: 0.4 };

/**
 * Topics to practise next: weakest first, scaled by how often GATE asks the topic, so a shaky
 * high-frequency topic beats an equally shaky rare one. Topics never attempted come last,
 * ordered by frequency, so a fresh learner still gets a useful list.
 */
export function practiseNext(stats: TopicStat[], frequency: Map<string, Frequency>, allTopics: string[], n = 10): string[] {
  const weight = (t: string) => EXAM_WEIGHT[frequency.get(t) ?? 'low'];
  const tried = [...stats]
    .filter((s) => s.wrong > 0)
    .sort((a, b) => b.errorRate * weight(b.topic) - a.errorRate * weight(a.topic) || (a.topic < b.topic ? -1 : 1))
    .map((s) => s.topic);
  const seen = new Set(stats.map((s) => s.topic));
  const fresh = allTopics.filter((t) => !seen.has(t)).sort((a, b) => weight(b) - weight(a) || (a < b ? -1 : 1));
  return [...tried, ...fresh].slice(0, n);
}

export interface ChapterTrend {
  chapter: string;
  /** Marks per year, the mean over that year's sets. */
  byYear: Record<number, number>;
  /** Mean marks per paper across every paper in the ledger. */
  mean: number;
  /** Share of all mapped marks, 0–1. */
  share: number;
}

/** How many marks each chapter carried per GATE year, from the paper ledger. */
export function chapterTrends(papers: Paper[]): { years: number[]; trends: ChapterTrend[] } {
  const sets = new Map<number, number>();
  const marks = new Map<string, Map<number, number>>();
  let total = 0;
  for (const p of papers) {
    sets.set(p.year, (sets.get(p.year) ?? 0) + 1);
    for (const q of p.questions) {
      if (!q.chapter) continue;
      const row = marks.get(q.chapter) ?? new Map<number, number>();
      row.set(p.year, (row.get(p.year) ?? 0) + q.marks);
      marks.set(q.chapter, row);
      total += q.marks;
    }
  }
  const years = [...sets.keys()].sort((a, b) => a - b);
  const trends = [...marks.entries()].map(([chapter, row]) => {
    const byYear: Record<number, number> = {};
    let sum = 0;
    for (const y of years) {
      const m = row.get(y) ?? 0;
      byYear[y] = m / (sets.get(y) ?? 1);
      sum += m;
    }
    return { chapter, byYear, mean: papers.length ? sum / papers.length : 0, share: total ? sum / total : 0 };
  });
  trends.sort((a, b) => b.mean - a.mean || (a.chapter < b.chapter ? -1 : 1));
  return { years, trends };
}

/** Least-squares slope of marks per year, to label a chapter rising or falling. */
export function slope(byYear: Record<number, number>): number {
  const pts = Object.entries(byYear).map(([y, m]) => [Number(y), m] as const);
  if (pts.length < 2) return 0;
  const mx = pts.reduce((s, [x]) => s + x, 0) / pts.length;
  const my = pts.reduce((s, [, y]) => s + y, 0) / pts.length;
  const num = pts.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0);
  const den = pts.reduce((s, [x]) => s + (x - mx) ** 2, 0);
  return den ? num / den : 0;
}

export interface ErrorEntry {
  id: string;
  chapter: string;
  topic: string;
  wrong: number;
  seen: number;
  lastAt: number;
  /** The latest answer is still wrong. */
  open: boolean;
  tag: ErrorTag | null;
}

/** Every question answered wrong at least once, newest first. */
export function errorLog(history: Record<string, QuestionStat>, meta: QuestionMeta[], tags: Record<string, ErrorTag>): ErrorEntry[] {
  const where = new Map(meta.map((m) => [m.id, m]));
  return Object.entries(history)
    .filter(([, h]) => h.wrong > 0)
    .flatMap(([id, h]) => {
      const m = where.get(id);
      return m ? [{ id, chapter: m.chapter, topic: m.topic, wrong: h.wrong, seen: h.seen, lastAt: h.lastAt, open: !h.lastCorrect, tag: tags[id] ?? null }] : [];
    })
    .sort((a, b) => b.lastAt - a.lastAt || (a.id < b.id ? -1 : 1));
}

export function tagCounts(entries: ErrorEntry[]): Record<ErrorTag | 'untagged', number> {
  const out = Object.fromEntries([...ERROR_TAGS, 'untagged'].map((t) => [t, 0])) as Record<ErrorTag | 'untagged', number>;
  for (const e of entries) out[e.tag ?? 'untagged']++;
  return out;
}
