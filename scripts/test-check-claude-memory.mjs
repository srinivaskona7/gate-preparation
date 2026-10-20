#!/usr/bin/env node
// Proves check-claude-memory.mjs rejects a broken Claude memory layout: each mutation of a
// known-good fixture must fail with the expected message, and the untouched fixture must pass.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rule = (paths, body = '# Rule\n\nSee `docs/guide.md`.\n') => `---\npaths:\n${paths.map((p) => `  - "${p}"`).join('\n')}\n---\n\n${body}`;

function goodFixture() {
  return {
    'CLAUDE.md': '# Project\n\nRead `docs/guide.md`.\n',
    '.gitignore': 'node_modules/\nCLAUDE.local.md\n',
    'docs/guide.md': '# Guide\n',
    'memory/a.json': '{}',
    '.claude/rules/memory.md': rule(['memory/**']),
  };
}

const mutations = {
  'good fixture': [() => {}, null],
  'CLAUDE.md over 200 lines': [(f) => { f['CLAUDE.md'] += 'line\n'.repeat(200); }, 'over 200 lines'],
  'rule without frontmatter': [(f) => { f['.claude/rules/memory.md'] = '# Rule\n'; }, 'needs a paths frontmatter list'],
  'rule with an empty paths list': [(f) => { f['.claude/rules/memory.md'] = '---\npaths:\n---\n\n# Rule\n'; }, 'needs a paths frontmatter list'],
  'glob that matches nothing': [(f) => { f['.claude/rules/memory.md'] = rule(['memory/**', 'gone/**']); }, 'matches no file: gone/**'],
  'dead path in a rule': [(f) => { f['.claude/rules/memory.md'] = rule(['memory/**'], 'See `docs/missing.md`.\n'); }, 'names a missing path: docs/missing.md'],
  'dead path in CLAUDE.md': [(f) => { f['CLAUDE.md'] = 'Read `scripts/gone.mjs`.\n'; }, 'names a missing path: scripts/gone.mjs'],
  'CLAUDE.local.md not ignored': [(f) => { f['.gitignore'] = 'node_modules/\n'; }, 'CLAUDE.local.md must be gitignored'],
  'placeholders and globs are not paths': [(f) => { f['CLAUDE.md'] = 'Files `memory/chapters/<id>/x.md` and `src/**/*.ts`.\n'; }, null],
};

function run(dir) {
  try {
    return { code: 0, out: execFileSync('node', [join(root, 'scripts/check-claude-memory.mjs'), '--root', dir], { encoding: 'utf8', stdio: 'pipe' }) };
  } catch (e) {
    return { code: e.status, out: `${e.stdout}${e.stderr}` };
  }
}

let failures = 0;
for (const [name, [mutate, expected]] of Object.entries(mutations)) {
  const f = goodFixture();
  mutate(f);
  const dir = mkdtempSync(join(tmpdir(), 'claude-memory-'));
  for (const [path, text] of Object.entries(f)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  const result = run(dir);
  rmSync(dir, { recursive: true, force: true });
  const ok = expected === null ? result.code === 0 : result.code === 1 && result.out.includes(expected);
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n    exit ${result.code}, expected ${expected ?? 'success'}\n    ${result.out.trim().split('\n').slice(0, 4).join('\n    ')}`}`);
}
if (failures) {
  console.error(`\n${failures} Claude memory validator test(s) failed`);
  process.exit(1);
}
console.log(`\nall ${Object.keys(mutations).length} Claude memory validator tests passed`);
