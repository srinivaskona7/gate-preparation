# Agent contract: write a chapter's derivations

You write `memory/chapters/<chapter>/derivations.md` for the chapters you are given: the
proofs and derivations behind the chapter's formulas and GATE problem types. A student reads
a section to understand why a formula holds, under which assumptions, and how GATE uses it.

Repo: the repository root (the lead passes you its absolute path; every path below is relative to it). Read `CLAUDE.md`
("Coding standards") and `.claude/rules/memory-layer.md` ("Derivations") first. The file format is
enforced by `node scripts/check-memory.mjs --chapter <chapter>`.

## Inputs

- `data/chapters/<chapter>.json` is the chapter as taught: topic ids, formulas, problem
  types, pitfalls and errata. Every derivation must agree with it. If you find an error in
  the chapter file, report it and do not edit the file.
- `source/chapters/<chapter>.txt` is the source notes. Their PYQ answers and some formulas
  are wrong, so re-derive everything and copy nothing.
- Standard texts as background: CLRS, Galvin, Hamacher, Hennessy and Patterson, Sipser and
  Hopcroft–Ullman, Navathe and Korth, Kurose and Peterson. Name a text in a section when
  you follow its proof.

## What to write

- One `## ` section per result that a GATE problem leans on. For an ordinary chapter this
  is 6–12 sections, and every formula in the chapter file should be derived in some section.
  Order sections from foundations to applications.
- Each section opens with `<!-- topics: … -->`, then `**Claim.**`, which states the result
  and every assumption (units, what counts, boundary conventions). It continues with
  `**Proof.**` or `**Derivation.**`, the complete argument, every step justified. Then add
  `**GATE use.**`, the problem shapes that use it with the trap each one sets, and
  `**Check.**`, a small worked instance whose numbers you verified by script.
- A derivation is complete when a strong student can reproduce it without the book: define
  every symbol, show every algebra step that is not routine, and state where each assumption
  enters. For counting arguments, give the bijection or the case split. For algorithm
  correctness, give the invariant.
- Use KaTeX math only, `$…$` inline and `$$…$$` display, with no `\(` or `\[`. In GFM table
  cells write `\lvert x \rvert` instead of `|x|`. Use code fences for code; math inside them
  is not rendered.
- Write plainly: no meta-commentary about the notes, no filler, no stock phrases such as
  "delve", "moreover", "furthermore" or "it is worth noting", and no emoji. The validator
  rejects them.

## Verification

- Check every numeric claim and every **Check.** example with a script in `/tmp/deriv-<chapter>/`:
  a simulation, a brute-force enumeration or a direct calculation. Keep the scripts until
  you report.
- Run `node scripts/check-memory.mjs --chapter <chapter>` until it prints ✓.
- Edit only `memory/chapters/<chapter>/derivations.md`. Do not run `npm run memory`; the
  lead regenerates STATUS.md.

## Report

Per chapter: the sections written, one line each; what each script verified; any error you
found in the chapter file, with its field path and the fix; and the validator line. Keep it
under 40 lines.
