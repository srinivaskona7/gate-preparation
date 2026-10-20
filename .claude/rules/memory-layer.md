---
paths:
  - "memory/**"
  - "docs/agents/**"
  - "scripts/check-memory.mjs"
  - "scripts/test-check-memory.mjs"
  - "scripts/lib/pyq.mjs"
  - "scripts/lib/derivations.mjs"
---

# Memory layer

`memory/` holds the work that is expensive to redo: proofs, the paper ledger, and solved
questions. A file there is final once `npm run memory` passes. Later sessions extend it and
never regenerate it.

## Paper ledger: `memory/pyq/papers/<paper>.json`

There is one file per official paper. The 26 ids live in `scripts/lib/pyq.mjs`: `gate-cse-2011`
through `gate-cse-2026-s2` (2011 to 2026), with sets `-s1`/`-s2`/`-s3` and no suffix for single-set years.
Each file lists all 65 questions:

```json
{ "paper": "gate-cse-2024-s1", "title": "GATE CSE 2024 Set 1", "year": 2024, "set": 1,
  "sources": { "key": { "label": "…", "url": "https://…" }, "paper": {…}, "index": {…} },
  "questions": [ { "section": "CS", "n": 30, "type": "nat", "marks": 2, "key": "4.4:4.6",
                   "chapter": "os-memory-management", "url": "https://gateoverflow.in/…",
                   "go": 433491, "tags": ["…"] } ] }
```

- Numbering follows the paper. Up to 2021 it runs GA 1–10 and CS 1–55, with CS 1–25 at 1
  mark. From 2022 it runs GA 1–10 and CS 11–65, with CS 11–35 at 1 mark. The validator derives
  each question's marks from its number. MSQ exists from 2021.
- `key` comes from the official final answer key in one syntax: MCQ `"B"`, or `"A|C"` when
  either option scores; MSQ `"A;C"`, or `"A;C;D|C;D"` when either set scores; NAT
  `"1.4:1.6"`, where `"4"` means `4:4` and alternatives are joined with `|`; `"MTA"` means
  marks to all.
- Option letters follow the official master paper. GATE Overflow often lists options in a
  different order, and from 2024 the exam console shuffled questions and options, so match
  questions and options to the master paper by content, never by position.
- `chapter` is a chapter id or `null`. A `null` needs a `note` explaining why no 2027 chapter
  takes the question. GA questions map only to `ga-*` chapters.

## Solved PYQs: `memory/chapters/<id>/gate_pyqs.json`

```json
{ "chapter": "os-memory-management",
  "papers": ["gate-cse-2024-s1", "…"],
  "questions": [ { "id": "gate-cse-2024-s1-q30", "type": "nat", "marks": 2, "key": "4.4:4.6",
      "topic": "os-memory-management.tlb", "difficulty": "medium",
      "stem": "…", "code": {"lang": "c", "text": "…"}, "table": {"headers": [], "rows": [[]]},
      "figure": "…", "options": ["…", "…", "…", "…"], "answer": 4.5, "keyNote": "…",
      "solution": { "steps": [{"title": "…", "body": "…", "tex": "…"}],
                    "shortcut": {"body": "…", "tex": "…"},
                    "traps": [{"option": 1, "text": "…"}] },
      "sources": [{"label": "…", "url": "https://…"}] } ],
  "skipped": [ { "id": "…", "reason": "…" } ] }
```

- Ids: `<paper>-q<n>` for CS and `<paper>-ga<n>` for GA, with the number as printed.
- `papers` locks progress. For every paper listed, each ledger question mapped to this chapter
  is either solved in `questions` or listed in `skipped` with a reason. Process a paper
  completely before adding it.
- `type`, `marks` and `key` copy the ledger, and the validator checks they match. `answer` is
  our own derived answer, and it must score under the official key. When it does not, or the
  key is `MTA`, `keyNote` says why and cites the evidence.
- The stem is the official wording with math as `$…$`. Code goes in `code` and tabular data in
  `table`. A figure we cannot reproduce gets a `figure` description complete enough to solve
  from. `code`, `table` and `figure` are optional.
- Drawings are hand-written SVG in `public/diagrams/pyq/`: `diagram: { alt }` draws the paper's
  figure as `<id>.svg` (required whenever `figure` is set), and `solutionDiagram: { alt }` draws
  the worked picture as `<id>-solution.svg`. Each needs a `viewBox` and a `<title>`, uses dark
  strokes on a transparent background (it shows on a white card), and carries no script, event
  handler, external link or `foreignObject`. A file no question uses fails the validator.
- `solution.steps` (at least 2) is the full derivation. `shortcut` (required) is the exam-hall
  method. `traps` (at least 1) explains each lure; `option` names a wrong MCQ option.
- Optional learning aids per question: `hints` (3 to 5, ladder order guide, concept, principle, setup, partial, never the answer), `solution.recognize`, `solution.check` and `variation` (ours, never an exam question). Agents follow `docs/agents/aids-author.md`. Topic lessons live in `data/chapters/<id>.json` (`docs/agents/lesson-author.md`).
- Solver agents follow `docs/agents/pyq-solver.md`, ledger agents `docs/agents/ledger.md`, and
  derivation agents `docs/agents/derivations.md`.

## Derivations: `memory/chapters/<id>/derivations.md`

```markdown
# Memory management: derivations

## Effective access time with a TLB
<!-- topics: os-memory-management.tlb -->

**Claim.** With hit ratio $h$, TLB time $t$ and memory time $m$, …

**Derivation.** …

$$\mathrm{EAT} = h(t + m) + (1 - h)(t + 2m)$$

**GATE use.** …
```

- The file opens with one `# ` title, followed by at least 3 `## ` sections. Each section starts
  with the topics comment, using topic ids from `data/chapters/<id>.json`. Each section needs
  `**Claim.**` plus `**Proof.**` or `**Derivation.**`, and at least 300 characters. `**Result.**`,
  `**GATE use.**` and `**Check.**` are optional.
- Math is `$…$` inline and `$$…$$` display, never `\(` or `\[`. A literal dollar is `\$`. Raw
  HTML is not allowed. KaTeX renders the math at build time, so a formula that fails to render
  fails the build.

## Sourcing and verification

- PYQs are real questions from official papers only. The stem comes from the official paper
  or GATE Overflow. The key comes from the official final key (`sources.key` of the paper).
  Never reconstruct a question from memory.
- Every number in a solution is recomputed by a script before it is written: a simulation, an
  enumeration or a direct calculation. GATE Overflow answers are evidence, not truth. When the
  official key looks wrong, keep the key, record the dispute in `keyNote`, and cite it.
- Derivations are proofs, not summaries. State the claim with its assumptions and derive it in
  full, then show where GATE uses it.
