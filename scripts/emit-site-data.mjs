#!/usr/bin/env node
// Splits data/curriculum_manifest.json and memory/ into the files the site imports:
//   src/generated/catalog.json            subjects, chapter metadata, topic index, syllabus, plan, errata
//   src/generated/chapters/<id>.json      one chapter body each, loaded when the chapter opens
//   src/generated/derivations/<id>.json   one chapter's derivations, math pre-rendered to HTML
//   src/generated/pyqs/<id>.json          one chapter's solved PYQs, keys parsed for the scorer
//   src/generated/{formulas,revision,questions,search,pyq-index,papers}.json
//                                         cross-chapter aggregates, loaded by the pages that need them
// Expects data/ and memory/ to be valid: run it through scripts/site-data.mjs, as the Vite plugin does.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDerivations, plainText, renderMarkdown, slugify } from './lib/derivations.mjs';
import { PAPERS, parseKey, questionId } from './lib/pyq.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'src/generated');
const memoryDir = join(root, 'memory');
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const manifest = readJson(join(root, 'data/curriculum_manifest.json'));

rmSync(out, { recursive: true, force: true });
for (const dir of ['chapters', 'derivations', 'pyqs']) mkdirSync(join(out, dir), { recursive: true });
const write = (name, value) => writeFileSync(join(out, name), JSON.stringify(value));

const BODY_KEYS = ['summary', 'highYield', 'topics', 'formulas', 'complexity', 'problemTypes', 'questions',
  'pitfalls', 'revisionCard', 'errata', 'syllabusCoverage', 'references'];
const PREVIEW_CHARS = 220;
const SEARCH_TEXT_CHARS = 4000;

const formulas = [];
const revision = [];
const questions = [];
const search = [];
const errata = [];
const pyqIndex = [];

// ---------------------------------------------------------------- memory: the paper ledger

/** The tagged key the app's scorer reads (src/content/types.ts AnswerKey). */
function answerKey(raw, type) {
  const key = parseKey(raw, type);
  if (key.mta) return { kind: 'mta' };
  if (type === 'mcq') return { kind: 'mcq', accepted: key.accepted };
  if (type === 'msq') return { kind: 'msq', sets: key.sets };
  return { kind: 'nat', ranges: key.ranges };
}

const ledger = PAPERS.flatMap((id) => {
  const file = join(memoryDir, 'pyq/papers', `${id}.json`);
  return existsSync(file) ? [readJson(file)] : [];
});
const ledgerById = new Map(ledger.flatMap((p) => p.questions.map((q) => [questionId(p.paper, q.section, q.n), { ...q, paper: p.paper, paperTitle: p.title, year: p.year }])));
const mappedCount = new Map();
for (const q of ledgerById.values()) if (q.chapter) mappedCount.set(q.chapter, (mappedCount.get(q.chapter) ?? 0) + 1);
const status = new Map();

// Newest paper first, then the paper's own order: GA before CS, by number.
const paperRank = (paper) => PAPERS.length - PAPERS.indexOf(paper);
const byPaperOrder = (a, b) => paperRank(a.paper) - paperRank(b.paper) || (a.section === b.section ? a.n - b.n : a.section === 'GA' ? -1 : 1);

/** The first `max` characters of prose, never cutting through a $…$ span. */
function preview(text, max = PREVIEW_CHARS) {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  let inMath = false;
  for (let i = 0; i < flat.length; i++) {
    if (flat[i] === '\\' && flat[i + 1] === '$') i++;
    else if (flat[i] === '$') inMath = !inMath;
    else if (!inMath && i >= max && flat[i] === ' ') return `${flat.slice(0, i)}…`;
  }
  return flat;
}

// ---------------------------------------------------------------- memory: per chapter

function emitDerivations(chapter, where) {
  const file = join(memoryDir, 'chapters', chapter.id, 'derivations.md');
  if (!existsSync(file)) return 0;
  const doc = parseDerivations(readFileSync(file, 'utf8'));
  const sections = doc.sections.map((s) => ({ id: slugify(s.title), title: s.title, topics: s.topics ?? [], html: renderMarkdown(s.body) }));
  write(`derivations/${chapter.id}.json`, { title: doc.title, intro: doc.intro ? renderMarkdown(doc.intro) : '', sections });
  doc.sections.forEach((s, i) => {
    search.push({ id: `derivation:${chapter.id}/${sections[i].id}`, kind: 'derivation', title: s.title, text: plainText(s.body).slice(0, SEARCH_TEXT_CHARS), ...where });
  });
  return sections.length;
}

/** Which learning aids a solved question carries; the coverage page counts these, so they come from the data and nowhere else. */
const aidsOf = (q) => ({
  hints: Boolean(q.hints?.length),
  recognize: Boolean(q.solution.recognize),
  check: Boolean(q.solution.check),
  variation: Boolean(q.variation),
  diagram: Boolean(q.diagram || q.solutionDiagram),
});

function emitPyqs(chapter, where) {
  const file = join(memoryDir, 'chapters', chapter.id, 'gate_pyqs.json');
  if (!existsSync(file)) return { pyqs: 0, skipped: 0, papers: 0 };
  const doc = readJson(file);
  const list = doc.questions.map((q) => {
    const entry = ledgerById.get(q.id);
    const { id, type, marks, topic, difficulty, stem, code, table, figure, diagram, solutionDiagram, options, answer, keyNote, solution, sources, hints, variation } = q;
    return {
      id, paper: entry.paper, paperTitle: entry.paperTitle, year: entry.year, section: entry.section, n: entry.n,
      type, marks, key: answerKey(q.key, type), topic, difficulty, stem,
      ...(code && { code }), ...(table && { table }), ...(figure && { figure }), ...(diagram && { diagram }), ...(solutionDiagram && { solutionDiagram }), ...(options && { options }),
      answer, ...(keyNote && { keyNote }), ...(hints && { hints }), ...(variation && { variation }), solution, sources, url: entry.url, ...where,
    };
  }).sort(byPaperOrder);
  write(`pyqs/${chapter.id}.json`, list);

  for (const q of list) {
    status.set(q.id, 'solved');
    pyqIndex.push({
      id: q.id, paper: q.paper, year: q.year, section: q.section, n: q.n, type: q.type, marks: q.marks, topic: q.topic,
      difficulty: q.difficulty, preview: preview(q.stem), disputed: Boolean(q.keyNote) && q.key.kind !== 'mta', mta: q.key.kind === 'mta',
      aids: aidsOf(q), ...where,
    });
    // Stem and options are searchable; solutions are not, so a search never gives an answer away.
    search.push({
      id: `pyq:${q.id}`, kind: 'pyq', title: preview(q.stem, 160), text: [q.stem, ...(q.options ?? [])].join(' ').slice(0, SEARCH_TEXT_CHARS),
      label: `${q.paperTitle} · ${q.section === 'GA' ? 'GA' : 'Q'}${q.n}`, qtype: q.type, marks: q.marks, year: q.year, ...where,
    });
  }
  for (const s of doc.skipped ?? []) status.set(s.id, 'skipped');
  return { pyqs: list.length, skipped: doc.skipped?.length ?? 0, papers: doc.papers.length };
}

// ---------------------------------------------------------------- chapters

const subjectOf = new Map();
const subjects = manifest.subjects.map((subject) => ({
  ...subject,
  chapters: subject.chapters.map((chapter) => {
    subjectOf.set(chapter.id, subject.id);
    const meta = Object.fromEntries(Object.entries(chapter).filter(([k]) => !BODY_KEYS.includes(k)));
    const where = { subject: subject.id, chapter: chapter.id };
    search.push({ id: `chapter:${chapter.id}`, kind: 'chapter', title: chapter.title, text: chapter.summary ?? '', ...where });
    const mapped = mappedCount.get(chapter.id) ?? 0;
    if (chapter.status !== 'ready') return { ...meta, topicIndex: [], memory: { derivations: 0, pyqs: 0, skipped: 0, papers: 0, mapped } };

    write(`chapters/${chapter.id}.json`, Object.fromEntries(BODY_KEYS.map((k) => [k, chapter[k] ?? []])));

    for (const t of chapter.topics) {
      search.push({ id: t.id, kind: 'topic', title: t.title, text: [...t.points, ...(t.keyTerms ?? [])].join(' '), frequency: t.frequency, ...where });
    }
    for (const f of chapter.formulas) {
      formulas.push({ ...f, ...where });
      search.push({ id: f.id, kind: 'formula', title: f.name, text: [f.text, ...(f.where ?? []).flat(), f.note ?? ''].join(' '), ...where });
    }
    for (const p of chapter.problemTypes) {
      search.push({ id: p.id, kind: 'problem', title: p.title, text: [...p.recipe, p.trap ?? ''].join(' '), frequency: p.frequency, ...where });
    }
    for (const q of chapter.questions) {
      questions.push({ ...q, ...where });
      // Options are searchable; explanations are not, so a search never leaks an answer.
      search.push({ id: q.id, kind: 'question', title: q.stem, text: (q.options ?? []).join(' '), qtype: q.type, marks: q.marks, ...where });
    }
    revision.push({
      ...where,
      title: chapter.title,
      highYield: chapter.highYield,
      revisionCard: chapter.revisionCard,
      pitfalls: chapter.pitfalls,
      formulas: chapter.formulas.map(({ id, name, tex }) => ({ id, name, tex })),
      complexity: chapter.complexity,
    });
    for (const e of chapter.errata ?? []) errata.push({ ...e, ...where });

    const derivations = emitDerivations(chapter, where);
    const { pyqs, skipped, papers } = emitPyqs(chapter, where);
    return {
      ...meta,
      summary: chapter.summary,
      topicIndex: chapter.topics.map(({ id, title, frequency, origin, beyondSyllabus, lesson }) => ({ id, title, frequency, origin, ...(beyondSyllabus ? { beyondSyllabus } : {}), ...(lesson ? { lesson: true } : {}) })),
      memory: { derivations, pyqs, skipped, papers, mapped },
    };
  }),
}));

for (const e of manifest.studyPlan.errata ?? []) errata.push({ ...e, subject: null, chapter: null });
for (const item of manifest.syllabus.items) {
  search.push({ id: `syllabus:${item.id}`, kind: 'syllabus', title: item.text, text: item.section, subject: null, chapter: item.chapter });
}

// ---------------------------------------------------------------- papers

const papers = ledger.map((p) => ({
  id: p.paper,
  title: p.title,
  year: p.year,
  set: p.set,
  sources: p.sources,
  questions: p.questions
    .map((q) => {
      const id = questionId(p.paper, q.section, q.n);
      return {
        id, paper: p.paper, section: q.section, n: q.n, type: q.type, marks: q.marks, key: answerKey(q.key, q.type),
        chapter: q.chapter, subject: q.chapter ? (subjectOf.get(q.chapter) ?? null) : null, ...(q.note && { note: q.note }),
        url: q.url, status: status.get(id) ?? 'open',
      };
    })
    .sort(byPaperOrder),
}));

const ledgerQuestions = papers.flatMap((p) => p.questions);
write('catalog.json', {
  title: manifest.title,
  source: manifest.source,
  exam: manifest.exam,
  syllabus: manifest.syllabus,
  studyPlan: manifest.studyPlan,
  stats: manifest.stats,
  memory: {
    papers: papers.length,
    paperIds: PAPERS,
    ledgerQuestions: ledgerQuestions.length,
    mapped: ledgerQuestions.filter((q) => q.chapter).length,
    solved: pyqIndex.length,
    derivations: subjects.flatMap((s) => s.chapters).reduce((sum, c) => sum + c.memory.derivations, 0),
  },
  subjects,
  errata,
});
write('formulas.json', formulas);
write('revision.json', revision);
write('questions.json', questions);
write('search.json', search);
write('pyq-index.json', pyqIndex.sort(byPaperOrder));
write('papers.json', papers);

const ready = subjects.flatMap((s) => s.chapters).filter((c) => c.status === 'ready').length;
console.log(`✓ site data: ${ready} chapter bodies, ${formulas.length} formulas, ${questions.length} questions, ${pyqIndex.length} PYQs from ${papers.length} papers, ${search.length} search docs`);
