import { describe, expect, it } from 'vitest';
import type { AnswerKey, McqPyq, McqQuestion, MsqQuestion, NatQuestion, Pyq, Question } from '@/content/types';
import { answerLabel, isAnswered, isCorrect, keyLabel, parseNat, scoreQuestion, summarize } from './scoring';

const base: Pick<Question, 'explanation' | 'difficulty' | 'topic' | 'origin' | 'pages'> = {
  explanation: 'Worked solution here.',
  difficulty: 'easy',
  topic: 't',
  origin: 'curated',
  pages: [],
};
const mcq = (marks: 1 | 2, answer = 1): McqQuestion => ({ ...base, id: `mcq${marks}`, type: 'mcq', marks, stem: 'Pick one', options: ['a', 'b', 'c', 'd'], answer });
const msq: MsqQuestion = { ...base, id: 'msq', type: 'msq', marks: 2, stem: 'Pick all', options: ['a', 'b', 'c', 'd'], answer: [0, 2] };
const nat: NatQuestion = { ...base, id: 'nat', type: 'nat', marks: 2, stem: 'Compute', answer: 6.67, tolerance: 0.01 };
const natInt: NatQuestion = { ...base, id: 'natInt', type: 'nat', marks: 1, stem: 'Count', answer: 331 };

describe('GATE marking', () => {
  it('MCQ: +marks when right, −marks/3 when wrong, 0 when blank', () => {
    expect(scoreQuestion(mcq(1), { type: 'mcq', choice: 1 })).toBe(1);
    expect(scoreQuestion(mcq(1), { type: 'mcq', choice: 0 })).toBeCloseTo(-1 / 3);
    expect(scoreQuestion(mcq(2), { type: 'mcq', choice: 3 })).toBeCloseTo(-2 / 3);
    expect(scoreQuestion(mcq(2), undefined)).toBe(0);
    expect(scoreQuestion(mcq(2), { type: 'mcq', choice: -1 })).toBe(0);
  });

  it('MSQ: all-or-nothing and never negative', () => {
    expect(scoreQuestion(msq, { type: 'msq', choices: [2, 0] })).toBe(2);
    expect(scoreQuestion(msq, { type: 'msq', choices: [0] })).toBe(0);
    expect(scoreQuestion(msq, { type: 'msq', choices: [0, 1, 2] })).toBe(0);
    expect(scoreQuestion(msq, { type: 'msq', choices: [] })).toBe(0);
  });

  it('NAT: inside the tolerance band scores, outside scores 0, never negative', () => {
    expect(scoreQuestion(nat, { type: 'nat', value: '6.67' })).toBe(2);
    expect(scoreQuestion(nat, { type: 'nat', value: '6.66' })).toBe(2);
    expect(scoreQuestion(nat, { type: 'nat', value: '6.68' })).toBe(2);
    expect(scoreQuestion(nat, { type: 'nat', value: '6.70' })).toBe(0);
    expect(scoreQuestion(natInt, { type: 'nat', value: '331' })).toBe(1);
    expect(scoreQuestion(natInt, { type: 'nat', value: '331.0' })).toBe(1);
    expect(scoreQuestion(natInt, { type: 'nat', value: '330.99' })).toBe(0);
  });

  it('NAT input: signed decimals only, like the GATE keypad', () => {
    expect(parseNat(' -3.5 ')).toBe(-3.5);
    expect(parseNat('.5')).toBe(0.5);
    expect(parseNat('7.')).toBe(7);
    expect(parseNat('1e3')).toBeNull();
    expect(parseNat('')).toBeNull();
    expect(parseNat('3/4')).toBeNull();
    expect(isAnswered({ type: 'nat', value: 'abc' })).toBe(false);
  });

  it('rejects a response of the wrong type', () => {
    expect(isCorrect(mcq(1), { type: 'msq', choices: [1] })).toBe(false);
  });

  it('summarises a paper and sums thirds exactly', () => {
    const qs: Question[] = [mcq(1), { ...mcq(1), id: 'b' }, { ...mcq(1), id: 'c' }, msq, nat, natInt];
    const s = summarize(qs, {
      mcq1: { type: 'mcq', choice: 0 },
      b: { type: 'mcq', choice: 0 },
      c: { type: 'mcq', choice: 0 },
      msq: { type: 'msq', choices: [0, 2] },
      nat: { type: 'nat', value: '6.67' },
    });
    expect(s).toMatchObject({ max: 8, correct: 2, wrong: 3, unanswered: 1, positive: 4, negative: -1, net: 3 });
    expect(s.byType.mcq).toEqual({ total: 3, correct: 0 });
    expect(s.byType.nat).toEqual({ total: 2, correct: 1 });
  });

  it('labels answer keys', () => {
    expect(answerLabel(mcq(1, 2))).toBe('C');
    expect(answerLabel({ ...msq, answer: [2, 0] })).toBe('A, C');
    expect(answerLabel(nat)).toBe('6.67 (accepted 6.66 to 6.68)');
    expect(answerLabel(natInt)).toBe('331');
  });
});

const pyqBase: Omit<McqPyq, 'id' | 'n' | 'type' | 'marks' | 'key' | 'options' | 'answer'> = {
  paper: 'gate-cse-2024-s1', paperTitle: 'GATE CSE 2024 Set 1', year: 2024, section: 'CS', topic: 't', difficulty: 'medium', stem: 'Official stem',
  solution: { steps: [], shortcut: { body: 'x' }, traps: [] }, sources: [], url: 'https://gateoverflow.in/1', subject: 'os', chapter: 'os-x',
};
const options: [string, string, string, string] = ['a', 'b', 'c', 'd'];
const mcqPyq = (key: AnswerKey, marks: 1 | 2 = 1): Pyq => ({ ...pyqBase, id: 'p-mcq', n: 11, type: 'mcq', marks, key, options, answer: 0 });
const msqPyq = (key: AnswerKey): Pyq => ({ ...pyqBase, id: 'p-msq', n: 12, type: 'msq', marks: 2, key, options, answer: [0, 2] });
const natPyq = (key: AnswerKey): Pyq => ({ ...pyqBase, id: 'p-nat', n: 40, type: 'nat', marks: 2, key, answer: 4.5 });

describe('official PYQ keys', () => {
  it('MCQ: any accepted option scores; others cost a third', () => {
    const q = mcqPyq({ kind: 'mcq', accepted: [0, 2] });
    expect(scoreQuestion(q, { type: 'mcq', choice: 0 })).toBe(1);
    expect(scoreQuestion(q, { type: 'mcq', choice: 2 })).toBe(1);
    expect(scoreQuestion(q, { type: 'mcq', choice: 1 })).toBeCloseTo(-1 / 3);
  });

  it('MSQ: exactly the keyed set', () => {
    const q = msqPyq({ kind: 'msq', sets: [[0, 2]] });
    expect(scoreQuestion(q, { type: 'msq', choices: [2, 0] })).toBe(2);
    expect(scoreQuestion(q, { type: 'msq', choices: [0, 2, 3] })).toBe(0);
  });

  it('MSQ: any one of the sets an official key accepts, nothing between them', () => {
    // GATE CSE 2023 Q27 was keyed "A, C, D or C, D".
    const q = msqPyq({ kind: 'msq', sets: [[0, 2, 3], [2, 3]] });
    expect(scoreQuestion(q, { type: 'msq', choices: [0, 2, 3] })).toBe(2);
    expect(scoreQuestion(q, { type: 'msq', choices: [2, 3] })).toBe(2);
    expect(scoreQuestion(q, { type: 'msq', choices: [0, 2] })).toBe(0);
    expect(scoreQuestion(q, { type: 'msq', choices: [3] })).toBe(0);
  });

  it('NAT: inclusive ranges, any alternative, float-safe bounds', () => {
    const q = natPyq({ kind: 'nat', ranges: [[4.4, 4.6], [9, 9]] });
    expect(scoreQuestion(q, { type: 'nat', value: '4.4' })).toBe(2);
    expect(scoreQuestion(q, { type: 'nat', value: '4.6' })).toBe(2);
    expect(scoreQuestion(q, { type: 'nat', value: '9' })).toBe(2);
    expect(scoreQuestion(q, { type: 'nat', value: '4.61' })).toBe(0);
    expect(scoreQuestion(natPyq({ kind: 'nat', ranges: [[0.3, 0.3]] }), { type: 'nat', value: String(0.1 + 0.2) })).toBe(2);
  });

  it('marks to all: scores attempted or blank, right or wrong', () => {
    const q = mcqPyq({ kind: 'mta' }, 2);
    expect(scoreQuestion(q, undefined)).toBe(2);
    expect(scoreQuestion(q, { type: 'mcq', choice: 3 })).toBe(2);
    const s = summarize([q, natPyq({ kind: 'nat', ranges: [[4.4, 4.6]] })], {});
    expect(s).toMatchObject({ max: 4, net: 2, correct: 1, unanswered: 1, wrong: 0 });
  });

  it('labels official keys the way the paper prints them', () => {
    expect(keyLabel({ kind: 'mcq', accepted: [0, 2] })).toBe('A or C');
    expect(keyLabel({ kind: 'msq', sets: [[3, 1]] })).toBe('B, D');
    expect(keyLabel({ kind: 'msq', sets: [[0, 2, 3], [2, 3]] })).toBe('A, C, D or C, D');
    expect(keyLabel({ kind: 'nat', ranges: [[4.4, 4.6]] })).toBe('4.4 to 4.6');
    expect(keyLabel({ kind: 'nat', ranges: [[9, 9], [10, 10]] })).toBe('9 or 10');
    expect(keyLabel({ kind: 'mta' })).toBe('Marks to all');
    expect(answerLabel(mcqPyq({ kind: 'mcq', accepted: [1] }))).toBe('B');
  });
});
