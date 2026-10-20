# GATE Atlas · CS 2027

An interactive, high-performance web portal for GATE Computer Science & Information Technology 2027 preparation.

## Features

- **Full 2027 Syllabus & Roadmap**: Systematic breakdown across all 45 topics and core CS disciplines.
- **Formula Cards & Revision**: Interactive memory sheets, LaTeX math equations, and concept recaps.
- **Mastery Tracking**: LocalStorage-persisted progress, bookmarking, and diagnostic assessment.
- **GATE-Marked Practice Quizzes**: PYQs with instant verification and explanation cards.
- **PWA & Offline Capable**: Built-in Service Worker for offline revision.

## Development

```bash
# Install dependencies
npm ci

# Start local dev server
npm run dev

# Run validators and integrity checks
npm run check

# Run unit tests and test suites
npm test

# Build production bundle with strict check
npm run build:strict

# Run end-to-end smoke tests
npm run test:e2e
```

## Continuous Deployment

This project deploys to **GitHub Pages** via GitHub Actions:
- Triggered automatically on push to `main` branch.
- Automated pipeline runs test gates (`check`, `test`, `build:strict`, Playwright E2E) on `ubuntu-24.04`.
- Live deployment published to GitHub Pages.
