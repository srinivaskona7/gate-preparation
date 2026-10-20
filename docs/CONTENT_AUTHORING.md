# Chapter content authoring contract

Every chapter of the portal is one file, `data/chapters/<chapter-id>.json`.
`scripts/check-manifest.mjs` is the schema; this page is the intent behind it.
`data/chapters/os-cpu-scheduling.json` is the finished exemplar: match its depth,
tone and field shapes.

## Inputs

| File | What it is |
|---|---|
| `source/chapters/<id>.txt` | Page-marked text of the study-notes PDF (gitignored). `===== PAGE N (...) =====` markers give the page numbers to cite. Holds the chapter's master-syllabus pages (🔴 high / 🟡 medium / 🟢 low flags) and its notes: sections, Voice Note, ~20 practice problems, ~10 PYQs labelled `PYQ-n (GATE yyyy) — tag`, pitfalls, revision card, references. Page edges can carry the neighbouring chapter: ignore it. |
| `data/official-syllabus.json` | GATE 2027 CS + GA syllabus (IIT Madras, 20 Jul 2026), one item per examinable clause, mapped to a chapter. `dropped` lists 2026 topics the 2027 text no longer names. |
| `data/subjects.json` | Subject/chapter skeleton and the page ranges each chapter may cite. |

## Rules

**Own words.** Explain, condense, restructure. Never paste source paragraphs.

**Provenance on every item.** `origin: "source"` needs `pages` inside the
chapter's syllabus/notes ranges (plus 60–63, the global formula reference).
`origin: "curated"` marks anything added: gap fills, 2027 items, extra worked
examples, corrected problems. Curated `pages` may be empty.

**No meta-commentary** ("the notes say", "according to the PDF"), no emoji,
no placeholders. The validator bans them.

**Math.** Prefer plain Unicode in prose (O(n log n), log₂ n, ≤, −, ×). Inline
`$...$` only where Unicode is clumsy; it must render in KaTeX. A literal dollar
is `\$`. Formula `tex` is KaTeX display math; formula `text` is its plain
Unicode twin, used by search.

**Questions are solved, not copied.** Source PYQ answers are often missing,
vague or wrong. Every answer is re-derived; every numeric or algorithmic answer
is checked by computing it. Ambiguous stems are reworded to have exactly one
answer. PYQ year labels are unverified, so they live only in `sourceLabel` and
never in a stem or explanation. Non-integer NAT answers carry a `tolerance`.
Every question carries `marks: 1 | 2`, as GATE would weigh it: 1 for a single
concept or one-step calculation, 2 for a multi-step trace or computation. The
quiz charges a wrong MCQ a third of its marks.

**Errata.** A wrong claim, answer or formula in the source becomes
`{page, claim, correction}`.

**2027 coverage.** Each official item of the chapter is mapped in
`syllabusCoverage` as `covered`, `partial` or `curated`; the last two must point
at a curated topic that fills the gap. Topics whose whole subject is in
`dropped`, or that the 2027 syllabus never names (IPv6, for one), keep their
content and get `"beyondSyllabus": true`.

## Sizes

| Field | Target |
|---|---|
| topics | 8–15 (12–20 for 30+ page chapters), 2–6 points each |
| questions | 10–16, mostly MCQ, ≥2 MSQ, ≥3 NAT (validator floor: 8 and 2) |
| problemTypes | 3–8 with recipe and trap |
| pitfalls | 4–8 |
| revisionCard | 2–4 blocks |
| highYield | 3–6 |
| complexity | ≥3 rows for PDS and Algorithms chapters, else where it fits |

## Validate

```bash
node scripts/check-manifest.mjs --chapter <id>   # one chapter
node scripts/check-manifest.mjs                  # all chapters, none missing
node scripts/test-check-manifest.mjs             # proves the validator rejects bad input
```
