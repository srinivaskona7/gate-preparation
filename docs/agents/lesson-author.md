# Agent contract: beginner lessons for chapter topics

You add a `lesson` object to topics in `data/chapters/<chapter>.json`. A learner who has never met
the topic should be able to read it, follow one worked example, test their recall and try one
question. Read `docs/CONTENT_AUTHORING.md`, `.claude/rules/chapter-content.md` and the `checkLesson`
rules in `scripts/check-manifest.mjs`. The exemplar is the `preemption` topic of
`data/chapters/os-cpu-scheduling.json`.

**No network.** Use only local files. Never fetch from the web or download anything; a security
monitor flags it.

## Your batch

The lead names a chapter and a batch size. Take the next topics, in file order, that have no
`lesson` yet and are not marked `beyondSyllabus`. When a topic has solved PYQs (questions with that
`topic` in `memory/chapters/<chapter>/gate_pyqs.json`), read them and their solutions first: the
lesson must teach what they test. When it has none, teach from the topic's `points`, `keyTerms`
and the chapter's formulas and problem types in `data/chapters/<chapter>.json`, and keep the
lesson to what those support; invent no exam facts.
Touch nothing else in the chapter file, and nothing in `memory/`. No npm, no git.

## The lesson

Required: `why` (why it matters for the exam), `intro` (plain words, no term before it is
explained), `principle {text, tex?}` (the formal rule), `limits` (when it does not apply),
`example {problem, steps (2+), result}` (one worked example with small steps), `misconceptions`
(1+, real mistakes learners make), `recall` (2 to 4 `{q, a}` self-test pairs), `practice` (one
question: `type` mcq with four distinct `options` and an `answer` index, or nat with a numeric
`answer`; plus `stem` and an `explanation` that also says why a wrong choice tempts), `summary`.
Optional: `prerequisites` (topic ids of this chapter only, and only real ones), `analogy
{text, breaksWhen}` (always give the limit of an analogy; skip the analogy if none is honest),
`definitions` (`{term, meaning}`).

The example and the practice question are ours, and the app labels them so. They must not copy a
PYQ's stem. **Compute every number by a script** in a scratch directory outside the repo that you
create yourself. Do not state frequencies, cut-offs or difficulty statistics. Recall answers are one
or two sentences.

## Style

Own words, zero filler, no emoji, no meta-commentary, no stock AI phrases. Math is `$...$` inline,
`principle.tex` is KaTeX display. A topic whose points are thin may need a short lesson, but never
a padded one. Edit the JSON with a small script that loads, changes only your topics and writes
back with `ensure_ascii=False` and the file's existing indent.

## Done

`node scripts/check-manifest.mjs --chapter <chapter>` prints a check mark. Report how many topics
you finished and how many eligible topics remain without a lesson.
