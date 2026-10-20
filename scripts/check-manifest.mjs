#!/usr/bin/env node
// Validates every chapter content file against the curriculum contract.
//   node scripts/check-manifest.mjs                 all chapters, all must exist
//   node scripts/check-manifest.mjs --chapter os-cpu-scheduling [--chapter ...]
//   node scripts/check-manifest.mjs --allow-missing  skip chapters not written yet
// Exits 1 on the first run with any error. Proven to fail: see scripts/fixtures/.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SLUG, createChecker, isInt, isStr } from './lib/rules.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const only = args.flatMap((a, i) => (a === '--chapter' ? [args[i + 1]] : []));
const allowMissing = args.includes('--allow-missing');
const dataDir = args.includes('--data') ? args[args.indexOf('--data') + 1] : join(root, 'data');

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const { source, subjects } = readJson(join(root, 'data/subjects.json'));
const officialPath = join(dataDir, 'official-syllabus.json');
const official = existsSync(officialPath) ? readJson(officialPath) : null;

const FREQUENCY = ['high', 'medium', 'low'];
const ORIGIN = ['source', 'curated'];
const QTYPE = ['mcq', 'msq', 'nat'];
const DIFFICULTY = ['easy', 'medium', 'hard'];
const FORMAT = ['MCQ', 'MSQ', 'NAT'];
const COVERAGE = ['covered', 'partial', 'curated'];
const FORMULA_OPTIONAL = new Set(['ga-verbal', 'ga-analytical', 'db-sql-constraints']);
const COMPLEXITY_REQUIRED = new Set([
  'pds-linear-data-structures', 'pds-trees', 'pds-graphs-hashing',
  'algo-complexity-sorting', 'algo-design-paradigms', 'algo-graph-algorithms',
]);
const MIN = { topics: 5, problemTypes: 3, questions: 8, pitfalls: 3, revisionCard: 1, highYield: 3 };

const { errors, fail, checkTex, checkText, checkList } = createChecker();

function allowedPages(subject, chapter) {
  // The study plan's quick-formula reference serves every chapter.
  const ranges = [chapter.syllabusPages, chapter.notesPages, source.studyPlanPages];
  if (subject.practicePages) ranges.push(subject.practicePages);
  return (p) => ranges.some(([a, b]) => p >= a && p <= b);
}

function checkChapter(subject, chapter, content, ids) {
  const at = chapter.id;
  const inRange = allowedPages(subject, chapter);
  const topicIds = new Set();

  const checkId = (where, id) => {
    if (!isStr(id)) return fail(where, 'missing id');
    const [prefix, ...rest] = id.split('.');
    if (prefix !== chapter.id || rest.length === 0 || !rest.every((r) => SLUG.test(r))) {
      fail(where, `id "${id}" must be "${chapter.id}.<kebab-slug>"`);
    }
    if (ids.has(id)) fail(where, `duplicate id "${id}"`);
    ids.add(id);
  };
  const checkProvenance = (where, item) => {
    if (!ORIGIN.includes(item.origin)) return fail(where, `origin must be one of ${ORIGIN}`);
    if (!Array.isArray(item.pages) || !item.pages.every(isInt)) return fail(where, 'pages must be an array of integers');
    if (item.origin === 'source' && item.pages.length === 0) fail(where, 'source item needs at least one page');
    for (const p of item.pages) if (!inRange(p)) fail(where, `page ${p} is outside this chapter's pages`);
  };
  // A beginner lesson for one topic. Its example and practice question are ours and are labelled so in the app; PYQs are linked by the app from the ledger.
  const checkLesson = (w, topic) => {
    const l = topic.lesson;
    if (!l || typeof l !== 'object') return fail(w, 'lesson must be an object');
    checkText(`${w}.why`, l.why, { min: 40, max: 500 });
    checkText(`${w}.intro`, l.intro, { min: 80, max: 900 });
    if (l.prerequisites !== undefined) {
      checkList(`${w}.prerequisites`, l.prerequisites, 1, (p, pw) => {
        if (p === topic.id) fail(pw, 'a topic cannot be its own prerequisite');
        else if (!content.topics.some((x) => x.id === p)) fail(pw, `prerequisite "${p}" is not a topic of ${chapter.id}`);
      });
    }
    if (l.analogy !== undefined) {
      checkText(`${w}.analogy.text`, l.analogy?.text, { min: 40, max: 500 });
      checkText(`${w}.analogy.breaksWhen`, l.analogy?.breaksWhen, { min: 30, max: 400 }); // an analogy without its limit misleads
    }
    if (l.definitions !== undefined) {
      checkList(`${w}.definitions`, l.definitions, 1, (d, dw) => {
        checkText(`${dw}.term`, d?.term, { max: 60 });
        checkText(`${dw}.meaning`, d?.meaning, { min: 20, max: 400 });
      });
    }
    checkText(`${w}.principle.text`, l.principle?.text, { min: 30, max: 600 });
    if (l.principle?.tex !== undefined) checkTex(`${w}.principle.tex`, l.principle.tex);
    checkText(`${w}.limits`, l.limits, { min: 30, max: 600 });
    checkText(`${w}.example.problem`, l.example?.problem, { min: 20, max: 700 });
    checkList(`${w}.example.steps`, l.example?.steps, 2, (st, sw) => checkText(sw, st, { min: 15, max: 500 }));
    checkText(`${w}.example.result`, l.example?.result, { min: 10, max: 300 });
    checkList(`${w}.misconceptions`, l.misconceptions, 1, (m, mw) => checkText(mw, m, { min: 30, max: 400 }));
    checkList(`${w}.recall`, l.recall, 2, (r, rw) => {
      checkText(`${rw}.q`, r?.q, { min: 10, max: 250 });
      checkText(`${rw}.a`, r?.a, { min: 5, max: 400 });
      if (isStr(r?.q) && r.q === r.a) fail(rw, 'the answer repeats the question');
    });
    if (Array.isArray(l.recall) && l.recall.length > 4) fail(`${w}.recall`, 'at most 4 recall questions');
    const pr = l.practice;
    checkText(`${w}.practice.stem`, pr?.stem, { min: 20, max: 700 });
    checkText(`${w}.practice.explanation`, pr?.explanation, { min: 30, max: 800 });
    if (pr?.type === 'nat') {
      if (typeof pr.answer !== 'number' || !Number.isFinite(pr.answer)) fail(`${w}.practice.answer`, 'nat answer must be a finite number');
    } else if (pr?.type === 'mcq') {
      if (!Array.isArray(pr.options) || pr.options.length !== 4 || new Set(pr.options).size !== 4) fail(`${w}.practice.options`, 'an mcq needs exactly 4 distinct options');
      else pr.options.forEach((o, i) => checkText(`${w}.practice.options[${i}]`, o, { max: 300 }));
      if (!isInt(pr.answer) || pr.answer < 0 || pr.answer > 3) fail(`${w}.practice.answer`, 'mcq answer must be an option index 0–3');
    } else fail(`${w}.practice.type`, 'practice type must be mcq or nat');
    checkText(`${w}.summary`, l.summary, { min: 30, max: 400 });
  };
  const checkTopicRef = (where, ref) => {
    if (!topicIds.has(ref)) fail(where, `topic "${ref}" is not a topic of ${chapter.id}`);
  };

  if (content.id !== chapter.id) fail(at, `id "${content.id}" does not match file`);
  checkText(`${at}.summary`, content.summary, { min: 80, max: 700 });
  checkList(`${at}.highYield`, content.highYield, MIN.highYield, (t, w) => checkText(w, t, { max: 240 }));

  checkList(`${at}.topics`, content.topics, MIN.topics, (t, w) => {
    checkId(w, t.id);
    topicIds.add(t.id);
    checkText(`${w}.title`, t.title, { max: 90 });
    if (!FREQUENCY.includes(t.frequency)) fail(w, `frequency must be one of ${FREQUENCY}`);
    checkProvenance(w, t);
    checkList(`${w}.points`, t.points, 2, (p, pw) => checkText(pw, p, { min: 10, max: 320 }));
    if (t.keyTerms !== undefined) checkList(`${w}.keyTerms`, t.keyTerms, 0, (k, kw) => checkText(kw, k, { max: 60 }));
    if (t.lesson !== undefined) checkLesson(`${w}.lesson`, t);
    // Set on material the 2027 syllabus no longer names; the page shows it as background.
    if (t.beyondSyllabus !== undefined && t.beyondSyllabus !== true) fail(w, 'beyondSyllabus is either true or absent');
  });

  const formulaMin = FORMULA_OPTIONAL.has(chapter.id) ? 0 : 1;
  checkList(`${at}.formulas`, content.formulas, formulaMin, (f, w) => {
    checkId(w, f.id);
    checkText(`${w}.name`, f.name, { max: 90 });
    if (!isStr(f.tex)) fail(w, 'missing tex'); else checkTex(`${w}.tex`, f.tex);
    checkText(`${w}.text`, f.text, { max: 240, math: false }); // plain-Unicode twin of tex, used by search
    if (f.where !== undefined) {
      checkList(`${w}.where`, f.where, 1, (pair, pw) => {
        if (!Array.isArray(pair) || pair.length !== 2) return fail(pw, 'expected [symbol, meaning]');
        checkText(`${pw}[0]`, pair[0], { max: 40 });
        checkText(`${pw}[1]`, pair[1], { max: 160 });
      });
    }
    if (f.note !== undefined) checkText(`${w}.note`, f.note, { max: 320 });
    checkTopicRef(w, f.topic);
    checkProvenance(w, f);
  });

  const complexityMin = COMPLEXITY_REQUIRED.has(chapter.id) ? 3 : 0;
  checkList(`${at}.complexity`, content.complexity ?? [], complexityMin, (c, w) => {
    checkId(w, c.id);
    checkText(`${w}.name`, c.name, { max: 90 });
    if (!['best', 'average', 'worst', 'space'].some((k) => isStr(c[k]))) fail(w, 'needs at least one of best/average/worst/space');
    for (const k of ['best', 'average', 'worst', 'space', 'notes']) if (c[k] !== undefined) checkText(`${w}.${k}`, c[k], { max: k === 'notes' ? 240 : 60 });
    checkTopicRef(w, c.topic);
    checkProvenance(w, c);
  });

  checkList(`${at}.problemTypes`, content.problemTypes, MIN.problemTypes, (p, w) => {
    checkId(w, p.id);
    checkText(`${w}.title`, p.title, { max: 110 });
    if (!FREQUENCY.includes(p.frequency)) fail(w, `frequency must be one of ${FREQUENCY}`);
    if (![1, 2].includes(p.marks)) fail(w, 'marks must be 1 or 2');
    if (!FORMAT.includes(p.format)) fail(w, `format must be one of ${FORMAT}`);
    checkList(`${w}.recipe`, p.recipe, 2, (s, sw) => checkText(sw, s, { min: 8, max: 280 }));
    if (p.trap !== undefined) checkText(`${w}.trap`, p.trap, { max: 280 });
    checkTopicRef(w, p.topic);
    checkProvenance(w, p);
  });

  checkList(`${at}.questions`, content.questions, MIN.questions, (q, w) => {
    checkId(w, q.id);
    if (!QTYPE.includes(q.type)) return fail(w, `type must be one of ${QTYPE}`);
    // The quiz scores with GATE marking, so the MCQ penalty depends on this.
    if (![1, 2].includes(q.marks)) fail(w, 'marks must be 1 or 2');
    checkText(`${w}.stem`, q.stem, { min: 15, max: 900 });
    if (q.type === 'nat') {
      if (typeof q.answer !== 'number' || !Number.isFinite(q.answer)) fail(w, 'nat answer must be a finite number');
      if (q.tolerance !== undefined && !(q.tolerance >= 0)) fail(w, 'tolerance must be >= 0');
      if (!isInt(q.answer) && !(q.tolerance > 0)) fail(w, 'a non-integer nat answer needs a tolerance > 0');
      if (q.options !== undefined) fail(w, 'nat questions take no options');
    } else {
      if (!Array.isArray(q.options) || q.options.length !== 4) fail(w, 'mcq/msq need exactly 4 options');
      else {
        q.options.forEach((o, i) => checkText(`${w}.options[${i}]`, o, { max: 300 }));
        if (new Set(q.options).size !== 4) fail(w, 'options must be distinct');
      }
      if (q.type === 'mcq' && !(isInt(q.answer) && q.answer >= 0 && q.answer < 4)) fail(w, 'mcq answer must be an option index 0–3');
      if (q.type === 'msq') {
        const ok = Array.isArray(q.answer) && q.answer.length >= 1 && q.answer.every((a) => isInt(a) && a >= 0 && a < 4)
          && new Set(q.answer).size === q.answer.length;
        if (!ok) fail(w, 'msq answer must be 1–4 distinct option indices');
      }
    }
    checkText(`${w}.explanation`, q.explanation, { min: 20, max: 1400 });
    if (!DIFFICULTY.includes(q.difficulty)) fail(w, `difficulty must be one of ${DIFFICULTY}`);
    if (q.sourceLabel !== undefined) checkText(`${w}.sourceLabel`, q.sourceLabel, { max: 120 });
    checkTopicRef(w, q.topic);
    checkProvenance(w, q);
  });
  const nat = (content.questions ?? []).filter((q) => q.type === 'nat').length;
  if (nat < 2 && !FORMULA_OPTIONAL.has(chapter.id)) fail(`${at}.questions`, `needs at least 2 nat questions, got ${nat}`);

  checkList(`${at}.pitfalls`, content.pitfalls, MIN.pitfalls, (p, w) => {
    checkText(`${w}.text`, p.text, { min: 10, max: 320 });
    checkProvenance(w, p);
  });

  checkList(`${at}.revisionCard`, content.revisionCard, MIN.revisionCard, (r, w) => {
    checkText(`${w}.heading`, r.heading, { max: 60 });
    checkList(`${w}.lines`, r.lines, 2, (l, lw) => checkText(lw, l, { max: 200 }));
    checkProvenance(w, r);
  });

  checkList(`${at}.errata`, content.errata ?? [], 0, (e, w) => {
    if (!isInt(e.page) || !inRange(e.page)) fail(w, `page ${e.page} is outside this chapter's pages`);
    checkText(`${w}.claim`, e.claim, { max: 400 });
    checkText(`${w}.correction`, e.correction, { max: 600 });
  });

  if (official) {
    const items = official.items.filter((i) => i.chapter === chapter.id);
    const coverage = new Map((content.syllabusCoverage ?? []).map((c) => [c.item, c]));
    for (const item of items) {
      const w = `${at}.syllabusCoverage[${item.id}]`;
      const c = coverage.get(item.id);
      if (!c) { fail(w, `official syllabus item "${item.text}" is not mapped`); continue; }
      if (!COVERAGE.includes(c.status)) fail(w, `status must be one of ${COVERAGE}`);
      checkList(`${w}.topics`, c.topics, 1, (t, tw) => checkTopicRef(tw, t));
      const curated = (c.topics ?? []).some((t) => content.topics.find((x) => x.id === t)?.origin === 'curated');
      if (c.status !== 'covered' && !curated) fail(w, `"${c.status}" coverage must point at a curated topic that fills the gap`);
    }
    for (const id of coverage.keys()) {
      if (!items.some((i) => i.id === id)) fail(`${at}.syllabusCoverage`, `"${id}" is not an official item of this chapter`);
    }
  }
}

// The official list is only useful if every item lands on a real chapter.
if (official) {
  const chapterIds = new Set(subjects.flatMap((s) => s.chapters.map((c) => c.id)));
  const seen = new Set();
  official.items.forEach((item, i) => {
    const w = `official-syllabus.items[${i}]`;
    if (!isStr(item.id) || !SLUG.test(item.id)) fail(w, `id "${item.id}" must be a kebab slug`);
    if (seen.has(item.id)) fail(w, `duplicate official item "${item.id}"`);
    seen.add(item.id);
    if (!chapterIds.has(item.chapter)) fail(w, `chapter "${item.chapter}" does not exist`);
    if (!isStr(item.text) || !isStr(item.section)) fail(w, 'needs text and section');
  });
  for (const d of official.dropped ?? []) {
    if (!chapterIds.has(d.chapter)) fail('official-syllabus.dropped', `chapter "${d.chapter}" does not exist`);
  }
}

// Study plan: only on full runs, so a chapter author's check never trips on it.
const planPath = join(dataDir, 'study-plan.json');
if (!only.length && existsSync(planPath)) checkStudyPlan(readJson(planPath));

function checkStudyPlan(plan) {
  const at = 'study-plan';
  const subjectIds = new Set(subjects.map((s) => s.id));
  const [lo, hi] = source.studyPlanPages;
  const provenance = (w, item) => {
    if (!ORIGIN.includes(item.origin)) fail(w, `origin must be one of ${ORIGIN}`);
    if (!Array.isArray(item.pages) || !item.pages.every((p) => isInt(p) && p >= lo && p <= hi)) fail(w, `pages must lie in ${lo}–${hi}`);
    if (item.origin === 'source' && !item.pages?.length) fail(w, 'source item needs at least one page');
  };
  const knownSubjects = (w, list) => list.forEach((s) => { if (!subjectIds.has(s)) fail(w, `unknown subject "${s}"`); });

  checkList(`${at}.phases`, plan.phases, 1, (ph, w) => {
    checkText(`${w}.title`, ph.title, { max: 60 });
    checkText(`${w}.goal`, ph.goal, { max: 200 });
    knownSubjects(w, ph.subjects ?? []);
    knownSubjects(`${w}.weeks`, Object.keys(ph.weeks ?? {}));
    checkList(`${w}.activities`, ph.activities, 1, (a, aw) => checkText(aw, a, { max: 200 }));
    provenance(w, ph);
  });
  const share = (plan.phases ?? []).reduce((sum, ph) => sum + ph.share, 0);
  if (Math.abs(share - 1) > 0.011) fail(`${at}.phases`, `phase shares sum to ${share.toFixed(2)}, expected 1`);
  checkList(`${at}.priorityMatrix`, plan.priorityMatrix, 1, (t, w) => { knownSubjects(w, t.subjects); provenance(w, t); });
  const minutes = (plan.timeSplit ?? []).reduce((sum, t) => sum + t.minutes, 0);
  const limit = official ? official.pattern.durationHours * 60 : 180;
  if (minutes > limit) fail(`${at}.timeSplit`, `adds up to ${minutes} minutes, the paper is ${limit}`);
  for (const key of ['strategy', 'traps']) {
    checkList(`${at}.${key}`, plan[key], 1, (t, w) => { checkText(`${w}.text`, t.text, { max: 320 }); provenance(w, t); });
  }
  checkList(`${at}.textbooks`, plan.textbooks, 0, (t, w) => knownSubjects(w, [t.subject]));
  checkList(`${at}.errata`, plan.errata, 0, (e, w) => {
    if (!isInt(e.page) || e.page < lo || e.page > hi) fail(w, `page ${e.page} must lie in ${lo}–${hi}`);
    checkText(`${w}.claim`, e.claim, { max: 400 });
    checkText(`${w}.correction`, e.correction, { max: 600 });
  });
}

const ids = new Set();
let checked = 0;
for (const subject of subjects) {
  for (const chapter of subject.chapters) {
    if (only.length && !only.includes(chapter.id)) continue;
    const file = join(dataDir, 'chapters', `${chapter.id}.json`);
    if (!existsSync(file)) {
      if (!allowMissing) fail(chapter.id, `missing ${file}`);
      continue;
    }
    let content;
    try { content = readJson(file); } catch (e) { fail(chapter.id, `invalid JSON: ${e.message}`); continue; }
    checkChapter(subject, chapter, content, ids);
    checked++;
  }
}
if (only.length && checked === 0 && !allowMissing) fail('args', `no chapter matched ${only.join(', ')}`);

if (errors.length) {
  console.error(errors.slice(0, 200).join('\n'));
  if (errors.length > 200) console.error(`… and ${errors.length - 200} more`);
  console.error(`\n✗ ${errors.length} error(s) across ${checked} chapter file(s)`);
  process.exit(1);
}
console.log(`✓ ${checked} chapter file(s) valid${official ? ' (official syllabus coverage enforced)' : ''}`);
