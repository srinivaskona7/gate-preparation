// The official GATE CSE papers this repo solves, and the one syntax every answer key is stored in.
//
// Key syntax (ledger and gate_pyqs.json alike):
//   MCQ  "B"         the correct option; "A|C" when the official key accepts either
//   MSQ  "A;C"       the exact set of correct options; "A;C;D|C;D" when the official key accepts either set
//   NAT  "1.4:1.6"   an inclusive range; "4" is short for "4:4"; "9:9|10:10" lists alternatives
//   any  "MTA"       marks to all

export const PAPERS = [
  'gate-cse-2011', 'gate-cse-2012', 'gate-cse-2013',
  'gate-cse-2014-s1', 'gate-cse-2014-s2', 'gate-cse-2014-s3',
  'gate-cse-2015-s1', 'gate-cse-2015-s2', 'gate-cse-2015-s3',
  'gate-cse-2016-s1', 'gate-cse-2016-s2',
  'gate-cse-2017-s1', 'gate-cse-2017-s2',
  'gate-cse-2018', 'gate-cse-2019', 'gate-cse-2020',
  'gate-cse-2021-s1', 'gate-cse-2021-s2',
  'gate-cse-2022', 'gate-cse-2023',
  'gate-cse-2024-s1', 'gate-cse-2024-s2',
  'gate-cse-2025-s1', 'gate-cse-2025-s2',
  'gate-cse-2026-s1', 'gate-cse-2026-s2',
];

export const PAPER_ID = /^gate-cse-(20\d\d)(?:-s([1-3]))?$/;

/** GATE 2022 renumbered the paper: GA is Q1–10 and the subject runs on from Q11 (the 2022 paper prints "Q.11 – Q.22"). */
export const CONTINUOUS_FROM = 2022;
export const MSQ_FROM = 2021;

/** The marks a question carries, from its position in the paper; null when the number cannot exist. */
export function positionMarks(year, section, n) {
  if (section === 'GA') return n >= 1 && n <= 10 ? (n <= 5 ? 1 : 2) : null;
  if (year >= CONTINUOUS_FROM) return n >= 11 && n <= 65 ? (n <= 35 ? 1 : 2) : null;
  return n >= 1 && n <= 55 ? (n <= 25 ? 1 : 2) : null;
}

/** gate-cse-2024-s1 + CS 30 → gate-cse-2024-s1-q30; GA questions use -ga<n>. */
export const questionId = (paper, section, n) => `${paper}-${section === 'GA' ? 'ga' : 'q'}${n}`;

export function parseQuestionId(id) {
  const m = /^(gate-cse-20\d\d(?:-s[1-3])?)-(ga|q)(\d+)$/.exec(id ?? '');
  return m ? { paper: m[1], section: m[2] === 'ga' ? 'GA' : 'CS', n: Number(m[3]) } : null;
}

const LETTER = /^[A-D]$/;
const NUMBER = /^-?\d+(?:\.\d+)?$/;
const toIndex = (letter) => letter.charCodeAt(0) - 65;
const ascending = (a, b) => a - b;

/** Distinct option letters as sorted indices; null on a bad or repeated letter. */
function optionIndices(letters) {
  if (!letters.every((l) => LETTER.test(l)) || new Set(letters).size !== letters.length) return null;
  return letters.map(toIndex).sort(ascending);
}

/**
 * Parses a key for a question type. Returns { mta: true }, { accepted: [i] } (mcq),
 * { sets: [[i]] } (msq) or { ranges: [[lo, hi]] } (nat); null when the key does not fit the type.
 */
export function parseKey(raw, type) {
  if (typeof raw !== 'string') return null;
  if (raw === 'MTA') return { mta: true };
  if (type === 'mcq') {
    const accepted = optionIndices(raw.split('|'));
    return accepted && { accepted };
  }
  if (type === 'msq') {
    const sets = raw.split('|').map((alternative) => optionIndices(alternative.split(';')));
    if (sets.some((set) => !set) || new Set(sets.map(String)).size !== sets.length) return null;
    return { sets };
  }
  if (type === 'nat') {
    const ranges = [];
    for (const alternative of raw.split('|')) {
      const [lo, hi = lo, extra] = alternative.split(':');
      if (extra !== undefined || !NUMBER.test(lo) || !NUMBER.test(hi) || Number(lo) > Number(hi)) return null;
      ranges.push([Number(lo), Number(hi)]);
    }
    return { ranges };
  }
  return null;
}

/** Whether an answer earns the marks under a parsed key. */
export function keyAccepts(key, type, answer) {
  if (key.mta) return true;
  if (type === 'mcq') return key.accepted.includes(answer);
  if (type === 'msq') return Array.isArray(answer) && key.sets.some((set) => answer.length === set.length && set.every((i) => answer.includes(i)));
  // The epsilon absorbs float error in the bounds, e.g. 0.1 + 0.2 against 0.3.
  return key.ranges.some(([lo, hi]) => answer >= lo - 1e-9 && answer <= hi + 1e-9);
}
