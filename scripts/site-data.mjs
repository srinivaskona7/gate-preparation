#!/usr/bin/env node
// Everything the site imports, in one command: validate data/ and memory/, then emit src/generated/.
//   node scripts/site-data.mjs             all 45 chapters must exist
//   node scripts/site-data.mjs --partial   missing chapters are allowed
// memory/STATUS.md and the CLAUDE.md chapter map are regenerated on the way, so a build never
// leaves them stale. Exits with the failing step's status; the step prints its own errors.
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const partial = process.argv.includes('--partial');
const steps = [
  ['build-manifest.mjs', partial ? ['--partial'] : []],
  ['check-memory.mjs', ['--write']],
  ['emit-site-data.mjs', []],
];

for (const [script, args] of steps) {
  try {
    execFileSync(process.execPath, [join(here, script), ...args], { stdio: 'inherit' });
  } catch (e) {
    process.exit(e.status ?? 1);
  }
}
