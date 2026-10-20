import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AnswerKey, QuestionType } from '@/content/types';
import { keyAccepts, PAPERS, type ParsedKey, parseKey } from '../../../scripts/lib/pyq.mjs';
import { isCorrect, type Response } from './scoring';

// The validator (scripts/lib/pyq.mjs) and the app (scoring.ts) each mark answers against the
// official key. If they drift, a PYQ passes `npm run memory` yet marks wrong on the site, so
// both are run over every real key and a spread of probe answers, and must agree on each.

const root = join(__dirname, '../../..');
const readJson = (p: string) => JSON.parse(readFileSync(p, 'utf8'));

interface LedgerQuestion { section: 'GA' | 'CS'; n: number; type: QuestionType; marks: number; key: string }
interface SolvedPyq { id: string; type: QuestionType; key: string; answer: number | number[]; keyNote?: string }

const ledger: { paper: string; questions: LedgerQuestion[] }[] = PAPERS.map((id) => join(root, 'memory/pyq/papers', `${id}.json`))
  .filter(existsSync)
  .map(readJson);
const solved: SolvedPyq[] = readdirSync(join(root, 'memory/chapters'))
  .map((c) => join(root, 'memory/chapters', c, 'gate_pyqs.json'))
  .filter(existsSync)
  .flatMap((f) => readJson(f).questions);

/** The emitter's conversion (scripts/emit-site-data.mjs answerKey), restated in the app's terms. */
function appKey(k: ParsedKey, type: QuestionType): AnswerKey {
  if ('mta' in k) return { kind: 'mta' };
  if ('accepted' in k) return { kind: 'mcq', accepted: k.accepted };
  if ('sets' in k) return { kind: 'msq', sets: k.sets };
  if (type !== 'nat') throw new Error('range key on a non-NAT question');
  return { kind: 'nat', ranges: k.ranges };
}

function response(type: QuestionType, answer: number | number[]): Response {
  if (type === 'mcq') return { type, choice: answer as number };
  if (type === 'msq') return { type, choices: answer as number[] };
  return { type, value: String(answer) };
}

/** Every option, every subset of four options, or both edges of each range and just outside them. */
function probes(k: ParsedKey, type: QuestionType): (number | number[])[] {
  if (type === 'mcq') return [0, 1, 2, 3];
  if (type === 'msq') return Array.from({ length: 15 }, (_, m) => [0, 1, 2, 3].filter((i) => m + 1 & (1 << i)));
  if (!('ranges' in k)) return [0];
  return k.ranges.flatMap(([lo, hi]) => [lo, hi, (lo + hi) / 2, lo - 0.01, hi + 0.01, -lo]);
}

const agree = (raw: string, type: QuestionType, answer: number | number[], marks = 1) => {
  const parsed = parseKey(raw, type);
  if (!parsed) throw new Error(`unparseable key ${raw}`);
  const app = isCorrect({ type, marks, key: appKey(parsed, type) } as Parameters<typeof isCorrect>[0], response(type, answer));
  return { app, validator: keyAccepts(parsed, type, answer) };
};

describe('official keys mark the same in the validator and the app', () => {
  it('has a ledger to check', () => expect(ledger.length).toBeGreaterThan(0));

  it('agrees on every probe answer for every ledger key', () => {
    const drift: string[] = [];
    for (const p of ledger) {
      for (const q of p.questions) {
        const parsed = parseKey(q.key, q.type);
        if (!parsed) {
          drift.push(`${p.paper} ${q.section}${q.n}: key ${q.key} does not parse`);
          continue;
        }
        for (const a of probes(parsed, q.type)) {
          const { app, validator } = agree(q.key, q.type, a, q.marks);
          if (app !== validator) drift.push(`${p.paper} ${q.section}${q.n} key ${q.key} answer ${JSON.stringify(a)}: app ${app}, validator ${validator}`);
        }
      }
    }
    expect(drift).toEqual([]);
  });

  it('marks every solved answer correct on the site unless a key note explains the disagreement', () => {
    const wrong = solved
      .filter((q) => !q.keyNote)
      .filter((q) => !agree(q.key, q.type, q.answer).app)
      .map((q) => `${q.id}: answer ${JSON.stringify(q.answer)} against key ${q.key}`);
    expect(wrong).toEqual([]);
  });

  it('catches drift: a scorer that ignores the NAT range upper bound disagrees', () => {
    const parsed = parseKey('6.66:6.68', 'nat');
    if (!parsed || !('ranges' in parsed)) throw new Error('bad fixture');
    const loose = { ranges: parsed.ranges.map(([lo]) => [lo, Number.POSITIVE_INFINITY] as [number, number]) };
    const answer = 6.69;
    const app = isCorrect({ type: 'nat', marks: 1, key: appKey(parsed, 'nat') } as Parameters<typeof isCorrect>[0], response('nat', answer));
    expect(app).not.toBe(keyAccepts(loose, 'nat', answer));
  });
});
