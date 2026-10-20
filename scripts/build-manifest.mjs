#!/usr/bin/env node
// Assembles data/curriculum_manifest.json from the skeleton (subjects.json), the
// chapter files, extracted references, the official 2027 syllabus and the study plan.
//   node scripts/build-manifest.mjs           every chapter must exist
//   node scripts/build-manifest.mjs --partial  missing chapters are listed as pending
// Runs the validator first and writes nothing if it fails.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const partial = process.argv.includes('--partial');
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

try {
  execFileSync('node', [join(root, 'scripts/check-manifest.mjs'), ...(partial ? ['--allow-missing'] : [])], { stdio: 'inherit' });
} catch {
  console.error('✗ manifest not written: fix the validator errors above first');
  process.exit(1);
}

const skeleton = readJson('data/subjects.json');
const references = readJson('data/references.json');
const official = readJson('data/official-syllabus.json');
const studyPlan = readJson('data/study-plan.json');

const count = (list, pred = () => true) => (list ?? []).filter(pred).length;

function chapterStats(c) {
  return {
    topics: count(c.topics),
    curatedTopics: count(c.topics, (t) => t.origin === 'curated'),
    beyondSyllabusTopics: count(c.topics, (t) => t.beyondSyllabus),
    formulas: count(c.formulas),
    complexity: count(c.complexity),
    problemTypes: count(c.problemTypes),
    questions: count(c.questions),
    mcq: count(c.questions, (q) => q.type === 'mcq'),
    msq: count(c.questions, (q) => q.type === 'msq'),
    nat: count(c.questions, (q) => q.type === 'nat'),
    pitfalls: count(c.pitfalls),
    errata: count(c.errata),
    references: count(c.references),
  };
}

const sum = (rows) => rows.reduce((acc, row) => {
  for (const [k, v] of Object.entries(row)) acc[k] = (acc[k] ?? 0) + v;
  return acc;
}, {});

const coverageByItem = new Map();
const subjects = skeleton.subjects.map((subject) => {
  const chapters = subject.chapters.map((meta) => {
    const file = join(root, 'data/chapters', `${meta.id}.json`);
    if (!existsSync(file)) return { ...meta, status: 'pending', references: references[meta.id] ?? [] };
    const content = JSON.parse(readFileSync(file, 'utf8'));
    for (const c of content.syllabusCoverage ?? []) coverageByItem.set(c.item, { chapter: meta.id, ...c });
    const chapter = { ...meta, status: 'ready', ...content, references: references[meta.id] ?? [] };
    return { ...chapter, stats: chapterStats(chapter) };
  });
  const ready = chapters.filter((c) => c.status === 'ready');
  return { ...subject, chapters, stats: { chapters: chapters.length, ready: ready.length, ...sum(ready.map((c) => c.stats)) } };
});

const syllabus = official.items.map((item) => {
  const c = coverageByItem.get(item.id);
  return { ...item, status: c?.status ?? 'pending', topics: c?.topics ?? [] };
});

const manifest = {
  schemaVersion: 1,
  title: skeleton.source.title,
  source: skeleton.source,
  exam: {
    name: official.exam,
    organizer: official.organizer,
    website: official.website,
    documents: official.documents,
    syllabusPublished: official.published,
    syllabusAccessed: official.accessed,
    pattern: official.pattern,
    dates: official.dates,
    changesFrom2026: official.changesFrom2026,
  },
  syllabus: { items: syllabus, dropped: official.dropped },
  studyPlan,
  subjects,
  stats: {
    subjects: subjects.length,
    ...sum(subjects.map(({ stats }) => stats)),
    syllabusItems: syllabus.length,
    syllabusCovered: count(syllabus, (s) => s.status === 'covered'),
    syllabusPartial: count(syllabus, (s) => s.status === 'partial'),
    syllabusCurated: count(syllabus, (s) => s.status === 'curated'),
    syllabusPending: count(syllabus, (s) => s.status === 'pending'),
  },
};

const out = join(root, 'data/curriculum_manifest.json');
writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`);
const s = manifest.stats;
console.log(`✓ wrote data/curriculum_manifest.json: ${s.ready}/${s.chapters} chapters, ${s.topics} topics, ${s.formulas} formulas, ${s.questions} questions, ${s.references} references; syllabus ${s.syllabusCovered} covered / ${s.syllabusPartial} partial / ${s.syllabusCurated} curated / ${s.syllabusPending} pending`);
