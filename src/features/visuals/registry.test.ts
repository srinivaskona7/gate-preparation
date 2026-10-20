import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VISUALS } from './registry';

// The registry is hand-written TypeScript that names chapter and topic ids from data/; nothing
// else checks it, and a stale id silently drops a visual from its chapter's tab.
const root = resolve(import.meta.dirname, '../../..');
const subjects = JSON.parse(readFileSync(resolve(root, 'data/subjects.json'), 'utf8')) as {
  subjects: { code: string; chapters: { id: string }[] }[];
};
const subjectOf = new Map(subjects.subjects.flatMap((s) => s.chapters.map((c) => [c.id, s.code] as const)));

function topicIds(chapter: string): Set<string> | undefined {
  const file = resolve(root, 'data/chapters', `${chapter}.json`);
  if (!existsSync(file)) return undefined;
  const body = JSON.parse(readFileSync(file, 'utf8')) as { topics: { id: string }[] };
  return new Set(body.topics.map((t) => t.id));
}

/** Every reason a visual's ids do not resolve; empty when it is sound. */
export function registryErrors(visuals: { id: string; subject: string; chapters: string[]; topics: string[] }[]) {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const v of visuals) {
    if (seen.has(v.id)) errors.push(`${v.id}: duplicate id`);
    seen.add(v.id);
    if (!v.chapters.length) errors.push(`${v.id}: no home chapter`);
    for (const c of v.chapters) if (!subjectOf.has(c)) errors.push(`${v.id}: unknown chapter ${c}`);
    const home = v.chapters[0];
    if (home && subjectOf.has(home) && subjectOf.get(home) !== v.subject) errors.push(`${v.id}: subject ${v.subject} but home chapter is ${subjectOf.get(home)}`);
    if (!v.topics.length) errors.push(`${v.id}: no topics`);
    for (const t of v.topics) {
      const chapter = v.chapters.find((c) => t.startsWith(`${c}.`));
      const ids = chapter ? topicIds(chapter) : undefined;
      if (!ids?.has(t)) errors.push(`${v.id}: topic ${t} is not a topic of its chapters`);
    }
  }
  return errors;
}

describe('visuals registry', () => {
  it('names only chapters and topics that exist', () => {
    expect(registryErrors(VISUALS)).toEqual([]);
  });

  it('rejects a stale topic id, an unknown chapter, a wrong subject and a duplicate', () => {
    const good = VISUALS[0];
    expect(registryErrors([{ ...good, topics: [`${good.chapters[0]}.no-such-topic`] }])).toHaveLength(1);
    expect(registryErrors([{ ...good, chapters: ['no-such-chapter'] }]).some((e) => e.includes('unknown chapter'))).toBe(true);
    expect(registryErrors([{ ...good, subject: 'CN' }])).toHaveLength(1);
    expect(registryErrors([good, good])).toContain(`${good.id}: duplicate id`);
  });
});
