#!/usr/bin/env node
// Proves check-manifest.mjs rejects bad content: each mutation of a known-good
// chapter must fail with the expected message, and the untouched copy must pass.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ID = 'os-cpu-scheduling';
const good = JSON.parse(readFileSync(join(root, `data/chapters/${ID}.json`), 'utf8'));
const officialGood = JSON.parse(readFileSync(join(root, 'data/official-syllabus.json'), 'utf8'));

const mutations = {
  'pristine copy passes': [() => {}, null],
  'unrenderable TeX': [(c) => { c.formulas[0].tex = '\\frac{a'; }, 'TeX does not render'],
  'broken inline math': [(c) => { c.topics[0].points[0] = 'Cost is $O(n \\log n) per step here.'; }, 'unbalanced $'],
  'meta-commentary': [(c) => { c.summary = c.summary + ' According to the notes this matters.'; }, 'banned phrase'],
  'invented frequency claim': [(c) => { c.summary = c.summary + ' This is tested almost every year.'; }, 'frequency claim'],
  'emoji in prose': [(c) => { c.highYield[0] = 'Always on the paper 🔴 every single year.'; }, 'banned phrase'],
  'page outside chapter': [(c) => { c.topics[1].pages = [300]; }, 'outside this chapter'],
  'source item without page': [(c) => { c.topics[1].pages = []; }, 'needs at least one page'],
  'mcq answer out of range': [(c) => { c.questions.find((q) => q.type === 'mcq').answer = 4; }, 'option index 0–3'],
  'msq duplicate answers': [(c) => { c.questions.find((q) => q.type === 'msq').answer = [1, 1]; }, 'distinct option indices'],
  'nat answer not numeric': [(c) => { c.questions.find((q) => q.type === 'nat').answer = '6.5'; }, 'finite number'],
  'dangling topic reference': [(c) => { c.formulas[0].topic = `${ID}.nope`; }, 'is not a topic'],
  'duplicate id': [(c) => { c.formulas[1].id = c.formulas[0].id; }, 'duplicate id'],
  'foreign id prefix': [(c) => { c.topics[0].id = 'os-file-systems.criteria'; }, 'must be'],
  'too few questions': [(c) => { c.questions = c.questions.slice(0, 3); }, 'at least 8'],
  'three options only': [(c) => { c.questions.find((q) => q.type === 'mcq').options.pop(); }, 'exactly 4 options'],
  'question without marks': [(c) => { delete c.questions[0].marks; }, 'marks must be 1 or 2'],
  'rounded nat without tolerance': [(c) => { delete c.questions.find((q) => q.id.endsWith('q-rr-average-tat')).tolerance; }, 'needs a tolerance'],
  'beyondSyllabus not boolean true': [(c) => { c.topics[0].beyondSyllabus = 'yes'; }, 'beyondSyllabus is either true'],
  'lesson without recall check': [(c) => { c.topics.find((t) => t.id === `${ID}.preemption`).lesson.recall = c.topics.find((t) => t.id === `${ID}.preemption`).lesson.recall.slice(0, 1); }, 'expected at least 2'],
  'lesson analogy without its limit': [(c) => { delete c.topics.find((t) => t.id === `${ID}.preemption`).lesson.analogy.breaksWhen; }, 'expected text of at least'],
  'lesson prerequisite is itself': [(c) => { c.topics.find((t) => t.id === `${ID}.preemption`).lesson.prerequisites = [`${ID}.preemption`]; }, 'its own prerequisite'],
  'lesson prerequisite unknown': [(c) => { c.topics.find((t) => t.id === `${ID}.preemption`).lesson.prerequisites = [`${ID}.nope`]; }, 'is not a topic'],
  'lesson example with one step': [(c) => { c.topics.find((t) => t.id === `${ID}.preemption`).lesson.example.steps = c.topics.find((t) => t.id === `${ID}.preemption`).lesson.example.steps.slice(0, 1); }, 'expected at least 2'],
  'lesson practice mcq answer out of range': [(c) => { c.topics.find((t) => t.id === `${ID}.preemption`).lesson.practice.answer = 4; }, 'option index 0–3'],
  'lesson practice duplicate options': [(c) => { c.topics.find((t) => t.id === `${ID}.preemption`).lesson.practice.options[1] = c.topics.find((t) => t.id === `${ID}.preemption`).lesson.practice.options[0]; }, '4 distinct options'],
  'lesson practice unknown type': [(c) => { c.topics.find((t) => t.id === `${ID}.preemption`).lesson.practice.type = 'msq'; }, 'mcq or nat'],
  'lesson principle TeX unrenderable': [(c) => { c.topics.find((t) => t.id === `${ID}.preemption`).lesson.principle.tex = '\\frac{a'; }, 'TeX does not render'],
  'lesson recall answer repeats question': [(c) => { c.topics.find((t) => t.id === `${ID}.preemption`).lesson.recall[0].a = c.topics.find((t) => t.id === `${ID}.preemption`).lesson.recall[0].q; }, 'repeats the question'],
  'official item left unmapped': [(c) => { c.syllabusCoverage = []; }, 'is not mapped'],
  'gap status without curated topic': [(c) => { c.syllabusCoverage[0].status = 'partial'; }, 'must point at a curated topic'],
  'coverage for foreign item': [(c) => { c.syllabusCoverage.push({ item: 'os-deadlock', status: 'covered', topics: [c.topics[0].id] }); }, 'is not an official item'],
  'official item on unknown chapter': [(c, o) => { o.items[0].chapter = 'nope'; }, 'does not exist'],
  'duplicate official item': [(c, o) => { o.items.push({ ...o.items[0] }); }, 'duplicate official item'],
};

// Study-plan mutations run as a full (unfiltered) pass over a data dir holding only the plan.
const planGood = JSON.parse(readFileSync(join(root, 'data/study-plan.json'), 'utf8'));
const planMutations = {
  'pristine plan passes': [() => {}, null],
  'time split over 180 minutes': [(p) => { p.timeSplit[1].minutes = 155; }, 'the paper is 180'],
  'phase shares off': [(p) => { p.phases[0].share = 0.5; }, 'expected 1'],
  'unknown subject in plan': [(p) => { p.priorityMatrix[0].subjects.push('astrology'); }, 'unknown subject'],
  'plan page outside 60–63': [(p) => { p.traps[0].pages = [64]; }, 'must lie in'],
};

let failures = 0;
for (const [name, [mutate, expected]] of Object.entries(planMutations)) {
  const dir = mkdtempSync(join(tmpdir(), 'gate-plan-'));
  const plan = structuredClone(planGood);
  mutate(plan);
  writeFileSync(join(dir, 'study-plan.json'), JSON.stringify(plan));
  writeFileSync(join(dir, 'official-syllabus.json'), JSON.stringify(officialGood));
  let out = '';
  let code = 0;
  try {
    out = execFileSync('node', [join(root, 'scripts/check-manifest.mjs'), '--data', dir, '--allow-missing'], { encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    code = e.status;
    out = `${e.stdout}${e.stderr}`;
  }
  rmSync(dir, { recursive: true, force: true });
  const ok = expected === null ? code === 0 : code === 1 && out.includes(expected);
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n    exit ${code}, expected ${expected ?? 'success'}\n    ${out.trim().split('\n').slice(0, 3).join('\n    ')}`}`);
}

for (const [name, [mutate, expected]] of Object.entries(mutations)) {
  const dir = mkdtempSync(join(tmpdir(), 'gate-check-'));
  mkdirSync(join(dir, 'chapters'));
  const copy = structuredClone(good);
  const official = structuredClone(officialGood);
  mutate(copy, official);
  writeFileSync(join(dir, 'chapters', `${ID}.json`), JSON.stringify(copy));
  writeFileSync(join(dir, 'official-syllabus.json'), JSON.stringify(official));
  let out = '';
  let code = 0;
  try {
    out = execFileSync('node', [join(root, 'scripts/check-manifest.mjs'), '--data', dir, '--chapter', ID], { encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    code = e.status;
    out = `${e.stdout}${e.stderr}`;
  }
  rmSync(dir, { recursive: true, force: true });
  const ok = expected === null ? code === 0 : code === 1 && out.includes(expected);
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n    exit ${code}, expected ${expected ?? 'success'}\n    ${out.trim().split('\n').slice(0, 3).join('\n    ')}`}`);
}
if (failures) {
  console.error(`\n${failures} validator test(s) failed`);
  process.exit(1);
}
console.log(`\nall ${Object.keys(mutations).length + Object.keys(planMutations).length} validator tests passed`);
