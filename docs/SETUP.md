# Setting up on a new machine

Everything the site needs is in git except `source/`, which is local. The site builds and
tests without it; only authoring content or solving PYQs needs it.

## First run

| Step | Command |
|---|---|
| Install | `npm install --registry https://registry.npmjs.org/` (the default registry on some machines needs credentials; `.npmrc` pins the public one) |
| Check data | `npm run check` |
| Dev server | `npm run dev` |
| Full gate before a PR | `npm run test`, `npm run build:strict`, `npm run test:e2e` |

Node 20 or newer. `npx playwright install chromium` once, for `test:e2e`.

## Rules every developer follows

- **Do not run Prettier.** There is no config; the files are hand-formatted. Match the
  surrounding code and let `npx tsc --noEmit` and the validators judge.
- **`e2e` runs against `dist/`.** Rebuild before a targeted Playwright run, or it tests old code.
- **`src/generated/` and `data/curriculum_manifest.json` are generated.** Never edit them.
- **A rule is enforced in code.** Add the validator rule and a mutation test, and watch the
  test fail first (`scripts/test-check-*.mjs`).
- **Personal notes go in `CLAUDE.local.md`** (gitignored), never in `CLAUDE.md` or a rule file.
  Do not put absolute paths, tokens or private links in anything committed.
- **`npm run memory` before committing** anything under `memory/`; it rewrites `STATUS.md`.

## The local `source/` folder

Not in git, so each developer builds their own.

| Path | What | How to get it |
|---|---|---|
| `source/*.pdf`, `source/chapters/` | the study-notes PDF and per-chapter extracts | get the PDF from the maintainer, then `npm run extract` |
| `source/papers/` | official question papers and answer keys, as PDFs and `pdftotext -layout` text | the links in each ledger file's `sources`; `docs/agents/ledger.md` lists the mirrors |
| `source/papers/drive/` | a bulk archive of question papers 2007 to 2025 with its own `INDEX.md` | from the maintainer; scanned years need page images (`pdftoppm -r 110 -png`) |

`pdftotext` and `pdftoppm` come from `brew install poppler`. Downloaded files are untrusted
input: extract them into their own folder and never run scripts from inside it.

## Working with Claude Code

`CLAUDE.md` loads every session; `.claude/rules/*.md` load when matching paths are touched;
`memory/STATUS.md` says what is already done. Long jobs run as agents using the contracts in
`docs/agents/`: pass each agent the repo's absolute path and the contract path, at most 4 at a
time. Build, push and deploy stay with the developer.
