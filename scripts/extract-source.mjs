#!/usr/bin/env node
// Splits the source PDF into page-marked text per chapter (local only, gitignored)
// and extracts the PDF's reference links into data/references.json (committed).
// Needs poppler: brew install poppler
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pdf = process.argv[2] ?? join(root, 'source/gate-prep-2027.pdf');
const { source, subjects } = JSON.parse(readFileSync(join(root, 'data/subjects.json'), 'utf8'));

const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

// pdftotext separates pages with form feeds; index 0 is page 1.
const pages = run('pdftotext', ['-layout', pdf, '-']).split('\f');
if (pages.length < source.pages) throw new Error(`expected ${source.pages} pages, got ${pages.length}`);

const range = ([from, to], label) => {
  let out = '';
  for (let p = from; p <= to; p++) out += `\n===== PAGE ${p} (${label}) =====\n${pages[p - 1]}`;
  return out;
};

const outDir = join(root, 'source/chapters');
mkdirSync(outDir, { recursive: true });
for (const subject of subjects) {
  for (const ch of subject.chapters) {
    const header = `### ${subject.title} › ${ch.title} (syllabus ${ch.ref})\n` +
      `### syllabus pages ${ch.syllabusPages.join('–')}, notes pages ${ch.notesPages.join('–')}\n` +
      `### Boundary pages are shared: the first notes page may end the previous chapter and the last may start the next.\n`;
    writeFileSync(join(outDir, `${ch.id}.txt`),
      header + range(ch.syllabusPages, 'master syllabus') + range(ch.notesPages, 'chapter notes'));
  }
  if (subject.practicePages) {
    writeFileSync(join(outDir, `${subject.id}-practice.txt`), range(subject.practicePages, 'practice'));
  }
}
writeFileSync(join(outDir, 'study-plan.txt'), range(source.studyPlanPages, 'study plan'));

// --- reference links -------------------------------------------------------
// Every chapter ends with a "References & Official Docs" block of hyperlinks,
// grouped under the chapter's numbered section titles.
const xml = run('pdftohtml', ['-xml', '-i', '-q', '-stdout', pdf]);
const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

const chapters = subjects.flatMap((s) => s.chapters);
// A boundary page belongs to the earlier chapter: a references block always closes its chapter.
const chapterForPage = (page) => chapters.find((c) => page >= c.notesPages[0] && page <= c.notesPages[1]);

const refs = Object.fromEntries(chapters.map((c) => [c.id, []]));
let page = 0;
let owner = null; // chapter id of the references block we are inside
let group = null;
for (const line of xml.split('\n')) {
  const pm = line.match(/<page number="(\d+)"/);
  if (pm) { page = Number(pm[1]); continue; }
  if (!line.startsWith('<text')) continue;
  const text = decode(line);
  if (/References & Official Docs/.test(text)) { owner = chapterForPage(page)?.id ?? null; group = null; continue; }
  if (/^End\b|^End of /.test(text)) { owner = null; continue; }
  if (!owner) continue;
  const link = line.match(/<a href="([^"]+)">/);
  if (link) {
    refs[owner].push({ group, title: text, url: decode(link[1]), page });
  } else if (/^\d+\.\s/.test(text)) {
    group = text.replace(/^\d+\.\s*/, '');
  } else if (/^(Standard \/ Textbook|Textbooks?|Official)/i.test(text)) {
    group = text;
  }
}

// Drop exact duplicates the PDF repeats across groups.
for (const id of Object.keys(refs)) {
  const seen = new Set();
  refs[id] = refs[id].filter((r) => !seen.has(r.url + r.group) && seen.add(r.url + r.group));
}
writeFileSync(join(root, 'data/references.json'), JSON.stringify(refs, null, 2) + '\n');

const counts = chapters.map((c) => `${c.id}:${refs[c.id].length}`).join(' ');
console.log(`wrote ${chapters.length} chapter sources to source/chapters; references → ${counts}`);
