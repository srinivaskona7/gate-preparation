#!/usr/bin/env node
// Validates the Claude Code memory layout: CLAUDE.md stays under the 200-line adherence budget,
// every .claude/rules file is path-scoped by globs that still match a file (a stale glob means
// the rule silently never loads), every repo path these files name exists, and CLAUDE.local.md
// stays out of git.
//
//   node scripts/check-claude-memory.mjs [--root <dir>]
import { existsSync, globSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const argRoot = process.argv.indexOf('--root');
const root = argRoot > 0 ? process.argv[argRoot + 1] : join(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_LINES = 200;
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

const gitignore = existsSync(join(root, '.gitignore')) ? readFileSync(join(root, '.gitignore'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')) : [];
// A gitignored path is legitimately absent on a fresh checkout (src/generated/, source/).
const ignored = (path) => gitignore.some((g) => path === g || path.startsWith(g.endsWith('/') ? g : `${g}/`));

/** Backticked repo paths: a slash, no placeholder, glob, alias, flag or URL. */
function namedPaths(text) {
  const out = new Set();
  for (const [, token] of text.matchAll(/`([^`\n]+)`/g)) {
    if (!/^[\w.-]+(\/[\w.-]+)+\/?$/.test(token)) continue;
    out.add(token);
  }
  return [...out];
}

function checkPaths(file, text) {
  for (const p of namedPaths(text)) if (!existsSync(join(root, p)) && !ignored(p)) fail(file, `names a missing path: ${p}`);
}

const claudePath = join(root, 'CLAUDE.md');
if (!existsSync(claudePath)) fail('CLAUDE.md', 'missing');
else {
  const claude = readFileSync(claudePath, 'utf8');
  const lines = claude.split('\n').length - (claude.endsWith('\n') ? 1 : 0);
  if (lines > MAX_LINES) fail('CLAUDE.md', `${lines} lines, over ${MAX_LINES} lines: move path-specific detail to .claude/rules/`);
  checkPaths('CLAUDE.md', claude);
}

if (!gitignore.includes('CLAUDE.local.md')) fail('.gitignore', 'CLAUDE.local.md must be gitignored');

const rulesDir = join(root, '.claude', 'rules');
const rules = existsSync(rulesDir) ? readdirSync(rulesDir, { recursive: true }).filter((f) => String(f).endsWith('.md')).map(String) : [];
for (const name of rules) {
  const file = `.claude/rules/${name}`;
  const text = readFileSync(join(rulesDir, name), 'utf8');
  const front = text.match(/^---\n([\s\S]*?)\n?---\n/);
  const globs = front ? [...front[1].matchAll(/^\s+-\s+"([^"]+)"\s*$/gm)].map((m) => m[1]) : [];
  if (!front || !/^paths:\s*$/m.test(front[1]) || !globs.length) {
    fail(file, 'needs a paths frontmatter list; an unscoped rule belongs in CLAUDE.md');
    continue;
  }
  for (const g of globs) if (!globSync(g, { cwd: root, exclude: (p) => p.includes('node_modules') }).length) fail(file, `glob matches no file: ${g}`);
  checkPaths(file, text);
}

if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n✗ ${errors.length} Claude memory error(s)`);
  process.exit(1);
}
console.log(`✓ Claude memory valid: CLAUDE.md within ${MAX_LINES} lines, ${rules.length} path-scoped rule(s), every named path exists`);
