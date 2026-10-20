---
paths:
  - "scripts/**"
  - "src/content/types.ts"
---

# Validators

- The validators are the schema. A new rule ships with a mutation case in the validator's
  suite (`scripts/test-check-manifest.mjs`, `scripts/test-check-memory.mjs` or
  `scripts/test-check-claude-memory.mjs`): run it, watch the new case fail against the old
  validator, then add the rule.
- Shared rules live in `scripts/lib/`: `rules.mjs` (slugs, the `BANNED` and `AI_TELLS` lists),
  `pyq.mjs` (paper ids, numbering, key syntax), `derivations.mjs` (derivation markdown).
- `src/content/types.ts` mirrors what the validators accept. Change both together.
- Generated outputs are never hand-edited: `data/curriculum_manifest.json`, `memory/STATUS.md`,
  the chapter map block in `CLAUDE.md`, and everything in `src/generated/`.
- `npm run test` runs the three mutation suites, then vitest.
