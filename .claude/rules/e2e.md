---
paths:
  - "e2e/**"
  - "playwright.config.ts"
---

# End-to-end tests

- `e2e/serve.mjs` serves the built `dist/` under `/gate-cs/`, the way GitHub Pages serves it.
  A bare `npx playwright test` tests the last build: use `npm run test:e2e`, or `npm run build`
  first. A mutation check needs a rebuild with the mutation in place.
- Every route in `ROUTES` must render one `main h1` and raise no console error.
- Two Playwright runs at once collide in `test-results/` and fail with `ENOENT` on trace
  files. That is not a test failure: rerun alone, or give the second run `--output=/tmp/<dir>`.
