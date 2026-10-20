# GATE portal features

What exists, what it costs, what it deliberately leaves out, and what is still open. Update
this file as part of any feature change.

## Visuals

Registry: `src/features/visuals/registry.ts`. A visual lists its home chapter first; the
chapter's Visuals tab, the pending-chapter page and `#/visuals/<id>` all read `visualsFor()`.
Logic lives in `features/visuals/logic/` with unit tests, sims in `features/visuals/sims/`,
three.js scenes in `src/ui/3d/`. Every sim is lazy-loaded, so its three.js code ships only
when opened.

| Id | Kind | Home chapter | Logic tests | e2e |
|---|---|---|---|---|
| `cpu-scheduling` | simulation | `os-cpu-scheduling` | `cpu-scheduling.test.ts` | route |
| `avl-tree` | 3D | `pds-trees` | `avl.test.ts` | route + insert 1, 2, 3 gives 1 rotation, height 1 |
| `memory-hierarchy` | 3D | `coa-memory-hierarchy` | `memory-hierarchy.test.ts` | route + preset gives 5 ns hierarchical, 4.6 ns simultaneous |

Deliberate limits:
- **3D sims and WebGL 2:** both 3D sims fall back to a 2D view when WebGL 2 is missing. The AVL sim falls back to an SVG tree, and the memory hierarchy falls back to share bars.
- **Memory hierarchy:**
  - It holds 2 to 5 levels. Hit ratios are local, as in GATE questions.
  - The last level is the backing store: its hit ratio is fixed at 1 and it cannot be removed.
  - Bursts are seeded, so the same send replays the same requests.
- **AVL tree:** it holds 31 keys at most, and keys are whole numbers from −999 to 999.

Open:
- **Provisional topic ids:** the `pds-trees.*` and `coa-memory-hierarchy.*` topic ids are placeholders until those chapter files exist. Nothing validates visual topic ids yet.
- **Unlabelled inputs:** the level inputs in the memory-hierarchy sim are not named per level for screen readers. Fixing it needs `Field` in `sim-kit.tsx` to accept a richer label.
- **Animation untested:** no e2e test checks that the 3D animation replays; the tests only check the counts.
- **3D labels (design review, 2026-10-16):** the memory-hierarchy labels need solid backings or to draw on top. Dark-theme detail text on the L2 face is about 2.2:1 contrast, the CPU label hides behind its block, box edges cross the labels, and the bottom label sits near the canvas edge.
- **AVL contrast:** in dark theme, key text on teal and violet spheres is 2.3:1 to 3.7:1.
- **Phone widths:** at 390 to 500 px, the memory-hierarchy Example select shrinks to 10 px and overlaps Send. The AVL Insert and Delete buttons split across rows.

## Testing notes

- **Stale builds:** `npx playwright test` serves the built `dist/`. Run `npm run test:e2e`, or build first, or the test checks stale code.
- **Concurrent runs:** two Playwright runs at once collide in `test-results/`, which shows up as `ENOENT` trace errors rather than assertion failures.
