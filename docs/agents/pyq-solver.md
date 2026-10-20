# Agent contract: solve a chapter's GATE PYQs

You write `memory/chapters/<chapter>/gate_pyqs.json` for the chapter you are given. It holds
every official GATE CSE question from 2011 to 2026 that the ledger maps to the chapter,
solved in full. A student attempts each question in the site's solver, then opens the
solution one step at a time, the exam-hall shortcut and the traps. Each part has to stand on
its own, and a wrong answer here teaches a student something false.

Repo: the repository root (the lead passes you its absolute path; every path below is relative to it). Read `CLAUDE.md`
("Coding standards") and `.claude/rules/memory-layer.md` ("Solved PYQs", "Sourcing and
verification") first, then
`checkSolvedQuestion` and `checkPyqs` in `scripts/check-memory.mjs`. The validator is the
schema: `node scripts/check-memory.mjs --chapter <chapter>`.

## Inputs

- **Ledger.** `memory/pyq/papers/*.json`. Your questions are the entries with
  `"chapter": "<chapter>"`. Each gives the type, the marks, the official key and the GATE
  Overflow page (`url`). Never edit the ledger.
- **Question text.** Wording and options come from the official master paper: the local copy
  in `source/papers/` when present, otherwise the paper's `sources.paper`. The key letter
  points into the master paper's option order, and GATE Overflow often lists the options in a
  different order (GATE CSE 2018 GA 1–4, 6, 7 and CS 1–3 are fully reversed), so copying GO's
  options stores the right text under the wrong letter and turns a correct key into a false
  dispute. Use the GATE Overflow page at the ledger `url` for figures and the discussion, and
  read it with `mcp__exa__web_fetch_exa` only if the lead allows web reads; never curl. When no
  master paper is available, solve NAT questions from GO's wording and skip MCQ and MSQ
  questions with the reason "official option order unavailable".
- **Drive papers.** `source/papers/drive/INDEX.md` maps the user's official question papers
  (2007–2025) to ledger ids. Use them as the master paper when `source/papers/` has none, and
  read scanned pages as images, as the index shows.
- **Chapter.** `data/chapters/<chapter>.json` supplies the topic ids, and `topic` must be
  one of them. Its formulas, and `memory/chapters/<chapter>/derivations.md` when it exists,
  are what a solution cites.

## Order of work

Work one paper at a time, newest first. For each paper:

1. Solve or skip every question the ledger maps to the chapter.
2. Add the paper id to `papers`.
3. Run the validator.

Listing a paper promises that it is complete, so never list a paper you have not finished.
Papers that are not in the ledger yet are out of scope; name them in the report.

Skip a question only when it cannot be presented faithfully: the official wording is not
available, or a figure cannot be described in text. Give the reason in `skipped`. If a
question belongs to another chapter and none of this chapter's topics fit it, skip it with
the reason "belongs to <chapter id>: …" and report it, so the lead can fix the ledger.

## Per question

| Field | Rule |
|---|---|
| `id` | `<paper>-q<n>` (CS) or `<paper>-ga<n>` (GA), with the number as printed |
| `type`, `marks`, `key` | copied from the ledger exactly |
| `topic` | the chapter topic that holds the decisive step |
| `difficulty` | `easy`: one fact or one formula. `medium`: two or three steps, or one trap to avoid. `hard`: several concepts, a long simulation, or a trap most candidates fall into |
| `stem` | the official wording, with math as `$…$`. Keep every name and number; never paraphrase or add hints |
| `code` | `{ lang, text }`, the program verbatim with its indentation |
| `table` | `{ headers, rows }` for tabular data in the question |
| `figure` | a graph, automaton, circuit or timing diagram written out completely enough to solve from: every node, edge, label, weight and value. A figure you cannot describe faithfully means skip |
| `options` | MCQ and MSQ: the four options in the paper's order A–D, verbatim. NAT: none |
| `answer` | your own result, from your own solution and script: an option index 0–3 (MCQ), a list of indices (MSQ) or a number (NAT) |
| `keyNote` | needed when `answer` does not score under the official key or the key is `MTA`; see below |
| `solution.steps` | 2–6 steps of `{ title, body, tex? }`, see below |
| `solution.shortcut` | `{ body, tex? }`, the exam-hall method, see below |
| `solution.traps` | at least 1, see below |
| `sources` | the GATE Overflow page, the official key (the paper's `sources.key`), and a textbook section when the solution follows one |

**Steps.** Together the steps are the full derivation, written for a student meeting the topic
for the first time. Step 1 states the concept from the ground up: define every term the question
uses and the one rule that decides it, before any number appears. Name the principle, set up the
numbers, compute, and finish with the answer and the option it matches. A `tex` is one
display equation that its step's body explains. For a simulation (scheduling, page
replacement, cache, pipeline, serializability), show the state after each event in `body`
or as a `tex` array.

**Diagrams.** Draw a hand-written SVG whenever a picture carries the reasoning. A question with
a `figure` must have `diagram` (the figure, `public/diagrams/pyq/<id>.svg`). Give
`solutionDiagram` (`<id>-solution.svg`) to every simulation and structure question: Gantt chart,
page frames over time, pipeline space-time chart, automaton, parse tree, heap or tree after each
operation, graph with the chosen edges, K-map groups, precedence graph, timing diagram. Rules
are in `.claude/rules/memory-layer.md` ("Solved PYQs"): `viewBox`, `<title>`, dark strokes on
transparent, labels in the SVG as text, no script and no external link, under 60 kB. Each
drawing must match the numbers in the steps exactly.

**Shortcut.** This is how to reach the answer within exam time: about 1.5 minutes for a
1-mark question and 3 for a 2-mark question. Examples are elimination by a boundary case, a
closed form that skips the simulation, or a pattern. Say when the shortcut is unsafe.

**Traps.** For an MCQ, write one trap for each wrong option a candidate could reasonably
pick. Set `option` to that option's index and name the mistake that produces it. For an MSQ,
cover the tempting wrong statements and the true ones candidates leave out. For a NAT, give
the wrong numbers that common slips produce, without `option`.

**Disputed keys.** When your script disagrees with the official key, first re-read the stem
against the official paper, then read the GATE Overflow discussion. Keep your answer only
when the evidence is decisive. Then `keyNote` cites it: the computation, the discussion, or
a revised key. When the key is `MTA`, `keyNote` names the flaw that led the institute to
award marks to all.

## Verification

- Recompute every number in every solution with a script in
  `/tmp/pyq-<chapter>/<paper>-q<n>.py` (or `.mjs`) that prints the answer. Use a simulation,
  an enumeration or a direct calculation, then compare the result with the official key.
- For an MCQ or MSQ, check every option, not only the correct one; the traps depend on it.
- Run `node scripts/check-memory.mjs --chapter <chapter>` until it prints ✓.
- Edit only `memory/chapters/<chapter>/gate_pyqs.json` and your own questions' SVGs in
  `public/diagrams/pyq/`. Do not run `npm run memory`; the
  lead regenerates `STATUS.md`.

## Writing

Write like a teacher at the board: exact, plain, and no filler. Do not comment on the source,
and use no stock phrases ("delve", "moreover", "it is worth noting") and no emoji. The
validator rejects them.

## Report

For each paper, give the number solved, each skip with its reason, and each key dispute with
a one-line summary. Then list the papers missing from the ledger, the scripts directory, and
the validator line. Keep it under 40 lines.
