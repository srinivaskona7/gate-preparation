import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Card, gradeOf, type Grade, newCard, review } from '@/features/review/srs';
import { dayKey, type Mastery } from './metrics';

export interface Attempt {
  correct: boolean;
  at: number;
}

/** Every answer to one question, for the weak-topic and error views. */
export interface QuestionStat {
  seen: number;
  wrong: number;
  lastCorrect: boolean;
  lastAt: number;
  /** Seconds spent across every timed answer. */
  seconds: number;
  /** Answers that carried a time, so seconds / timed is the mean. */
  timed: number;
  /** Answers given after opening a hint or the solution, as against on the learner's own. */
  assisted?: number;
  /** Own-effort answers that were right. */
  independentCorrect?: number;
  /** Hints opened across every answer. */
  hints?: number;
}

/** How sure the learner was before the result showed: 1 guessing, 2 unsure, 3 sure. */
export type Confidence = 1 | 2 | 3;

export { ERROR_TAGS, type ErrorTag } from './error-tags';
import type { ErrorTag } from './error-tags';

export interface AnswerResult {
  id: string;
  correct: boolean;
  seconds?: number;
  /** A hint or the solution was opened before the answer was checked. */
  assisted?: boolean;
  hints?: number;
  confidence?: Confidence;
}

export interface QuizRecord {
  id: string;
  title: string;
  /** Where to start the same quiz again. */
  href: string;
  mode: 'practice' | 'exam';
  at: number;
  net: number;
  max: number;
  correct: number;
  wrong: number;
  unanswered: number;
  seconds: number;
}

const touch = (days: Record<string, number>) => {
  const today = dayKey();
  return { ...days, [today]: (days[today] ?? 0) + 1 };
};

interface ProgressState {
  mastery: Record<string, Mastery>;
  starred: Record<string, true>;
  attempts: Record<string, Attempt>;
  history: Record<string, QuestionStat>;
  /** Spaced-repetition deck: question ids, and formula ids the learner added. */
  cards: Record<string, Card>;
  errorTags: Record<string, ErrorTag>;
  /** Questions the learner bookmarked, and their scratch notes. */
  saved: Record<string, true>;
  notes: Record<string, string>;
  /** Confidence given before the last check, for calibration. */
  confidence: Record<string, Confidence>;
  /** Result of the generated practice variation behind a question. */
  variations: Record<string, { correct: boolean; at: number }>;
  quizzes: QuizRecord[];
  /** Study actions per local day, for the streak. */
  days: Record<string, number>;
  setMastery: (topicId: string, level: Mastery) => void;
  toggleStar: (formulaId: string) => void;
  recordAttempts: (results: AnswerResult[]) => void;
  reviewCard: (id: string, grade: Grade) => void;
  addCard: (id: string) => void;
  removeCard: (id: string) => void;
  tagError: (id: string, tag: ErrorTag | null) => void;
  recordVariation: (id: string, correct: boolean) => void;
  toggleSaved: (id: string) => void;
  setNote: (id: string, note: string) => void;
  addQuiz: (quiz: QuizRecord) => void;
  reset: () => void;
}

const QUIZ_HISTORY = 50;

/**
 * One answer applied to the history and the deck. A miss puts the question in the deck; a hit
 * advances a card already there. A question answered right the first time never enters it.
 */
export function applyAnswer(
  state: Pick<ProgressState, 'attempts' | 'history' | 'cards'>,
  r: AnswerResult,
  at: number,
): Pick<ProgressState, 'attempts' | 'history' | 'cards'> {
  const prev = state.history[r.id];
  const timed = typeof r.seconds === 'number' && r.seconds > 0;
  const stat: QuestionStat = {
    seen: (prev?.seen ?? 0) + 1,
    wrong: (prev?.wrong ?? 0) + (r.correct ? 0 : 1),
    lastCorrect: r.correct,
    lastAt: at,
    seconds: (prev?.seconds ?? 0) + (timed ? (r.seconds ?? 0) : 0),
    timed: (prev?.timed ?? 0) + (timed ? 1 : 0),
    assisted: (prev?.assisted ?? 0) + (r.assisted ? 1 : 0),
    independentCorrect: (prev?.independentCorrect ?? 0) + (r.correct && !r.assisted ? 1 : 0),
    hints: (prev?.hints ?? 0) + (r.hints ?? 0),
  };
  const card = state.cards[r.id] ?? (r.correct ? undefined : newCard(at));
  return {
    attempts: { ...state.attempts, [r.id]: { correct: r.correct, at } },
    history: { ...state.history, [r.id]: stat },
    cards: card ? { ...state.cards, [r.id]: review(card, gradeOf(r.correct), at) } : state.cards,
  };
}

/** v1 kept only the last answer; seed the history and the deck from it. */
export function migrateV1(attempts: Record<string, Attempt>) {
  const history: Record<string, QuestionStat> = {};
  const cards: Record<string, Card> = {};
  for (const [id, a] of Object.entries(attempts)) {
    history[id] = { seen: 1, wrong: a.correct ? 0 : 1, lastCorrect: a.correct, lastAt: a.at, seconds: 0, timed: 0 };
    if (!a.correct) cards[id] = newCard(a.at);
  }
  return { history, cards, errorTags: {} };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      mastery: {},
      starred: {},
      attempts: {},
      history: {},
      cards: {},
      errorTags: {},
      saved: {},
      notes: {},
      confidence: {},
      variations: {},
      quizzes: [],
      days: {},
      setMastery: (topicId, level) =>
        set((s) => {
          const mastery = { ...s.mastery };
          if (level === 'new') delete mastery[topicId];
          else mastery[topicId] = level;
          return { mastery, days: touch(s.days) };
        }),
      toggleStar: (id) =>
        set((s) => {
          const starred = { ...s.starred };
          if (starred[id]) delete starred[id];
          else starred[id] = true;
          return { starred };
        }),
      recordAttempts: (results) =>
        set((s) => {
          const at = Date.now();
          let next = { attempts: s.attempts, history: s.history, cards: s.cards };
          const confidence = { ...s.confidence };
          for (const r of results) {
            next = applyAnswer(next, r, at);
            if (r.confidence) confidence[r.id] = r.confidence;
          }
          return { ...next, confidence, days: touch(s.days) };
        }),
      reviewCard: (id, grade) =>
        set((s) => {
          const at = Date.now();
          return { cards: { ...s.cards, [id]: review(s.cards[id] ?? newCard(at), grade, at) }, days: touch(s.days) };
        }),
      addCard: (id) => set((s) => (s.cards[id] ? s : { cards: { ...s.cards, [id]: newCard(Date.now()) } })),
      removeCard: (id) =>
        set((s) => {
          const cards = { ...s.cards };
          delete cards[id];
          return { cards };
        }),
      tagError: (id, tag) =>
        set((s) => {
          const errorTags = { ...s.errorTags };
          if (tag) errorTags[id] = tag;
          else delete errorTags[id];
          return { errorTags };
        }),
      recordVariation: (id, correct) => set((s) => ({ variations: { ...s.variations, [id]: { correct, at: Date.now() } }, days: touch(s.days) })),
      toggleSaved: (id) =>
        set((s) => {
          const saved = { ...s.saved };
          if (saved[id]) delete saved[id];
          else saved[id] = true;
          return { saved };
        }),
      setNote: (id, note) =>
        set((s) => {
          const notes = { ...s.notes };
          if (note.trim()) notes[id] = note.slice(0, 2000);
          else delete notes[id];
          return { notes };
        }),
      addQuiz: (quiz) => set((s) => ({ quizzes: [quiz, ...s.quizzes].slice(0, QUIZ_HISTORY) })),
      reset: () => {
        // Solver drafts live in sessionStorage; a reset must not leave locked, already-checked questions behind.
        for (const k of Object.keys(sessionStorage)) if (k.startsWith('gate-atlas:draft:')) sessionStorage.removeItem(k);
        set({ mastery: {}, starred: {}, attempts: {}, history: {}, cards: {}, errorTags: {}, saved: {}, notes: {}, confidence: {}, variations: {}, quizzes: [], days: {} });
      },
    }),
    {
      name: 'gate-atlas:progress',
      version: 3,
      migrate: (persisted, version) => {
        const s = (persisted ?? {}) as Partial<ProgressState>;
        return version < 2 ? { ...s, ...migrateV1(s.attempts ?? {}) } : s;
      },
    },
  ),
);

interface PrefsState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      // index.html applies the saved or system theme before React starts; start from it.
      theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'gate-atlas:prefs', version: 1 },
  ),
);
