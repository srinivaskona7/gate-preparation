import type { AnswerKey, Pyq, Question } from '@/content/types';

// GATE marking (information brochure 2027):
//   MCQ  correct +marks, wrong −marks/3, blank 0
//   MSQ  exactly a set the key accepts +marks, anything else 0 (no penalty, no partial credit)
//   NAT  within the stated range +marks, anything else 0 (no penalty)
//   MTA  "marks to all": a flawed question scores for every candidate, attempted or not

export type Response =
  | { type: 'mcq'; choice: number }
  | { type: 'msq'; choices: number[] }
  | { type: 'nat'; value: string };

/** A practice question or an official PYQ: anything with a type, marks and an answer key. */
export type Gradable = Question | Pyq;

/** What the GATE virtual keypad accepts: an optionally signed decimal. */
const NAT_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

/** Bounds are stored as decimals, so 6.67 − 0.01 can land a hair below 6.66. */
const EPSILON = 1e-9;

export function parseNat(value: string): number | null {
  const v = value.trim();
  return NAT_PATTERN.test(v) ? Number(v) : null;
}

/** The key a question is marked against: a PYQ's official key, or a practice question's own answer. */
export function answerKey(q: Gradable): AnswerKey {
  if ('key' in q) return q.key;
  if (q.type === 'mcq') return { kind: 'mcq', accepted: [q.answer] };
  if (q.type === 'msq') return { kind: 'msq', sets: [q.answer] };
  const tolerance = q.tolerance ?? 0;
  return { kind: 'nat', ranges: [[q.answer - tolerance, q.answer + tolerance]] };
}

export function isAnswered(r: Response | undefined): r is Response {
  if (!r) return false;
  if (r.type === 'mcq') return r.choice >= 0;
  if (r.type === 'msq') return r.choices.length > 0;
  return parseNat(r.value) !== null;
}

export function isCorrect(q: Gradable, r: Response | undefined): boolean {
  const key = answerKey(q);
  if (key.kind === 'mta') return true;
  if (!isAnswered(r) || r.type !== q.type) return false;
  if (key.kind === 'mcq' && r.type === 'mcq') return key.accepted.includes(r.choice);
  if (key.kind === 'msq' && r.type === 'msq') {
    return key.sets.some((set) => r.choices.length === set.length && set.every((a) => r.choices.includes(a)));
  }
  if (key.kind === 'nat' && r.type === 'nat') {
    const v = parseNat(r.value);
    return v !== null && key.ranges.some(([lo, hi]) => v >= lo - EPSILON && v <= hi + EPSILON);
  }
  return false;
}

export function scoreQuestion(q: Gradable, r: Response | undefined): number {
  if (answerKey(q).kind === 'mta') return q.marks;
  if (!isAnswered(r)) return 0;
  if (isCorrect(q, r)) return q.marks;
  return q.type === 'mcq' ? -q.marks / 3 : 0;
}

export interface Summary {
  max: number;
  net: number;
  positive: number;
  negative: number;
  correct: number;
  wrong: number;
  unanswered: number;
  byType: Record<Question['type'], { total: number; correct: number }>;
}

export function summarize(questions: Gradable[], responses: Record<string, Response | undefined>): Summary {
  const s: Summary = {
    max: 0,
    net: 0,
    positive: 0,
    negative: 0,
    correct: 0,
    wrong: 0,
    unanswered: 0,
    byType: { mcq: { total: 0, correct: 0 }, msq: { total: 0, correct: 0 }, nat: { total: 0, correct: 0 } },
  };
  for (const q of questions) {
    const r = responses[q.id];
    const score = scoreQuestion(q, r);
    s.max += q.marks;
    s.byType[q.type].total++;
    // Checked before "unanswered": a marks-to-all question scores even when left blank.
    if (score > 0) {
      s.correct++;
      s.positive += score;
      s.byType[q.type].correct++;
    } else if (!isAnswered(r)) s.unanswered++;
    else {
      s.wrong++;
      s.negative += score;
    }
  }
  // Round once at the end so thirds add up exactly: three wrong 1-mark MCQs cost 1, not 0.99.
  s.net = Math.round((s.positive + s.negative) * 100) / 100;
  s.negative = Math.round(s.negative * 100) / 100;
  return s;
}

export const optionLetter = (i: number) => String.fromCharCode(65 + i);

/** Up to six decimals, without float noise or trailing zeros: 4.4, not 4.4000000001. */
const formatNumber = (n: number) => String(+n.toFixed(6));

/** An official key as the paper prints it: "B", "A or C", "A, C", "A, C, D or C, D", "4.4 to 4.6", "Marks to all". */
export function keyLabel(key: AnswerKey): string {
  if (key.kind === 'mta') return 'Marks to all';
  if (key.kind === 'mcq') return key.accepted.map(optionLetter).join(' or ');
  if (key.kind === 'msq') return key.sets.map((set) => [...set].sort((a, b) => a - b).map(optionLetter).join(', ')).join(' or ');
  return key.ranges.map(([lo, hi]) => (lo === hi ? formatNumber(lo) : `${formatNumber(lo)} to ${formatNumber(hi)}`)).join(' or ');
}

/** The answer key as a reader sees it: option letters or the accepted number range. */
export function answerLabel(q: Gradable): string {
  if ('key' in q) return keyLabel(q.key);
  if (q.type === 'mcq') return optionLetter(q.answer);
  if (q.type === 'msq') return [...q.answer].sort((a, b) => a - b).map(optionLetter).join(', ');
  return q.tolerance
    ? `${q.answer} (accepted ${formatNumber(q.answer - q.tolerance)} to ${formatNumber(q.answer + q.tolerance)})`
    : String(q.answer);
}
