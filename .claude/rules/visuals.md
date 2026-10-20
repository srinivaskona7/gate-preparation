---
paths:
  - "src/features/visuals/**"
  - "src/ui/3d/**"
---

# Visuals

- A visual exists only once it has an entry in `VISUALS` in `src/features/visuals/registry.ts`;
  the first chapter in `chapters` is its home. Sims are lazy-loaded, so three.js stays out of the
  main bundle.
- Maths lives in `logic/<id>.ts` as pure functions with a vitest file beside it. Random runs are
  seeded through `@/lib/random`, so a seed replays the same run.
- A 3D scene takes a `fallback` for browsers without WebGL 2 (`supported` in `use-stage.ts`)
  and honours `stage.reducedMotion`.
- `HierarchyScene` replays a burst only when `burst.id` changes, and its sent-ref never resets.
  Keep the id counter in a `useRef` that edits never clear.
- A new visual adds its route to `ROUTES` in `e2e/smoke.spec.ts` plus an interaction test that
  asserts a computed number, and a row in `docs/GATE_PORTAL_FEATURES.md`.
