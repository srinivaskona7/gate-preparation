import { readFileSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';

/** Every console error and uncaught exception the page raises. */
function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

// Every chapter's content must render: a KaTeX or data error in one chapter fails its page.
const SUBJECTS: { subjects: { chapters: { id: string }[] }[] } = JSON.parse(readFileSync(new URL('../data/subjects.json', import.meta.url), 'utf8'));
const ALL_CHAPTERS = SUBJECTS.subjects.flatMap((s) => s.chapters.map((c) => c.id));

const CHAPTER_TABS = ['learn', 'formulas', 'problems', 'derivations', 'pyqs', 'practice', 'cheatsheet', 'visuals'];

const ROUTES = [
  '',
  'subject/operating-systems',
  ...CHAPTER_TABS.map((t) => `chapter/os-cpu-scheduling/${t}`),
  'chapter/db-indexing/derivations',
  'chapter/ga-verbal',
  'pyqs',
  'papers',
  'papers/gate-cse-2024-s1',
  'papers/gate-cse-2015-s1',
  'practice',
  'practice/quiz?n=5&mode=practice',
  'practice/quiz?n=5&mode=exam',
  'formulas',
  'formulas?starred=1',
  'revision',
  'revision?chapter=db-indexing',
  'syllabus',
  'syllabus/os-system-calls',
  'coverage',
  'decade',
  'visuals',
  'visuals/cpu-scheduling',
  'visuals/avl-tree',
  'visuals/memory-hierarchy',
  'review',
  'mock',
  'insights',
  'errors',
  ...ALL_CHAPTERS.flatMap((id) => [`chapter/${id}/learn`, `chapter/${id}/practice`, `chapter/${id}/formulas`]),
];

for (const route of new Set(ROUTES)) {
  test(`#/${route} renders one heading and no errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`#/${route}`);
    const h1 = page.locator('main h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).not.toBeEmpty();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('This page failed to load')).toHaveCount(0);
    await expect(page.getByText('No page at this address')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('an unknown address shows the not-found page', async ({ page }) => {
  await page.goto('#/no-such-page');
  await expect(page.getByText('No page at this address')).toBeVisible();
});

test('the quiz builder opens exactly the set its summary describes', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('#/practice');
  const summary = page.locator('[aria-live="polite"]').filter({ hasText: 'mark' }).first();
  await expect(summary).toContainText('10 questions');
  const marks = (await summary.locator('p').first().textContent())?.match(/(\d+) marks?/)?.[1];
  await page.getByRole('button', { name: 'Start practising' }).click();
  await expect(page).toHaveURL(/practice\/quiz\?.*seed=\d+/);
  await expect(page.locator('main header').first()).toContainText(`10 questions · ${marks} mark`);
  expect(errors).toEqual([]);
});

test('a timed paper submits through the confirm dialog and shows the score', async ({ page }) => {
  await page.goto('#/practice/quiz?n=3&mode=exam&seed=7');
  await expect(page.getByRole('timer')).toBeVisible();
  await page.getByRole('button', { name: 'Submit the paper' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText('Submit the paper?');
  await dialog.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Results', level: 2 })).toBeVisible();
  await expect(page.getByText('Net score, GATE marking')).toBeVisible();
  await expect(page.locator('main h1')).toHaveCount(1);
});

test('leaving a running exam asks first, and staying keeps the attempt', async ({ page }) => {
  await page.goto('#/practice/quiz?n=3&mode=exam&seed=7');
  await expect(page.getByRole('timer')).toBeVisible();
  await page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Dashboard' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText('Leave without submitting?');
  await dialog.getByRole('button', { name: 'Stay in the exam' }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/practice\/quiz/);
  await expect(page.getByRole('timer')).toBeVisible();
});

test('the paper page shows all 65 questions in the palette and the table', async ({ page }) => {
  await page.goto('#/papers/gate-cse-2024-s1');
  await expect(page.getByRole('list', { name: 'General aptitude' }).getByRole('listitem')).toHaveCount(10);
  await expect(page.getByRole('list', { name: 'Computer science' }).getByRole('listitem')).toHaveCount(55);
  await expect(page.locator('section[aria-labelledby="table-title"] tbody tr')).toHaveCount(65);
});

test('search finds a topic and opens it', async ({ page }) => {
  await page.goto('#/');
  await expect(page.locator('main h1')).toHaveCount(1);
  await page.keyboard.press('Control+k');
  const input = page.getByPlaceholder('Search topics, formulas, derivations, PYQs…');
  await expect(input).toBeFocused();
  await input.fill('round robin');
  const first = page.getByRole('option').first();
  await expect(first).toBeVisible();
  await input.press('Enter');
  await expect(page).toHaveURL(/#\/chapter\//);
});

test('the theme toggle switches and persists', async ({ page }) => {
  await page.goto('#/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
  await expect(html).not.toHaveAttribute('data-theme', before ?? '');
  await page.reload();
  await expect(html).not.toHaveAttribute('data-theme', before ?? '');
});

test('the AVL sim rebalances inserted keys', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('#/visuals/avl-tree');
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByPlaceholder('e.g. 50, 20, 70').fill('1, 2, 3');
  await page.getByRole('button', { name: 'Insert', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next step' })).toBeDisabled({ timeout: 20_000 });
  await expect(page.getByLabel('Operations').getByRole('listitem')).toHaveCount(3);
  await expect(page.getByText('Rotations so far').locator('..')).toContainText('1');
  await expect(page.getByText('Height', { exact: true }).locator('..')).toContainText('1');
  expect(errors).toEqual([]);
});

test('the memory hierarchy sim gives the textbook access times', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('#/visuals/memory-hierarchy');
  const sum = page.getByLabel('Access time, term by term');
  await expect(sum).toContainText('= 5 ns');
  await page.getByRole('combobox').first().selectOption('simultaneous');
  await expect(sum).toContainText('= 4.6 ns');
  await page.getByRole('button', { name: /Send 200 requests/ }).click();
  await expect(page.getByText(/^\d+ of 200 served$/)).toHaveCount(3);
  expect(errors).toEqual([]);
});

test('each level input is named for its level', async ({ page }) => {
  await page.goto('#/visuals/memory-hierarchy');
  await page.getByLabel('L2 Time, ns').fill('20');
  await expect(page.getByLabel('Access time, term by term')).toContainText('= 7 ns');
  await expect(page.getByLabel('L1 Hit ratio')).toHaveValue('0.8');
});

test('sim controls stay usable on a 390 px phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('#/visuals/memory-hierarchy');
  const example = await page.getByRole('combobox').nth(1).boundingBox();
  expect(example?.width ?? 0).toBeGreaterThan(150);
  await page.goto('#/visuals/avl-tree');
  const insert = await page.getByRole('button', { name: 'Insert', exact: true }).boundingBox();
  const del = await page.getByRole('button', { name: 'Delete', exact: true }).boundingBox();
  expect(insert?.y).toBe(del?.y);
});

/** A progress store as v1 saved it, with one wrong answer, so the v2 migration runs in the browser. */
async function seedV1Miss(page: Page, id: string) {
  await page.addInitScript((qid) => {
    const state = { mastery: {}, starred: {}, attempts: { [qid]: { correct: false, at: Date.now() - 3_600_000 } }, quizzes: [], days: {} };
    localStorage.setItem('gate-atlas:progress', JSON.stringify({ state, version: 1 }));
  }, id);
}

test('a v1 miss migrates into the review deck and the error log', async ({ page }) => {
  const errors = collectErrors(page);
  const id = JSON.parse(readFileSync(new URL('../data/chapters/os-cpu-scheduling.json', import.meta.url), 'utf8')).questions[0].id as string;
  await seedV1Miss(page, id);
  await page.goto('#/review');
  await expect(page.getByRole('heading', { name: '1 card due' })).toBeVisible();
  await page.getByRole('button', { name: 'Start review' }).click();
  await expect(page.getByRole('article', { name: 'Review question' })).toBeVisible();
  await expect(page.getByText('Card 1 of 1')).toBeVisible();

  await page.goto('#/errors');
  await expect(page.getByRole('link', { name: id })).toBeVisible();
  await page.getByLabel(`Cause of the miss on ${id}`).selectOption('calculation');
  await expect(page.getByRole('button', { name: /Calculation or algebra/ })).toContainText('1');

  await page.goto('#/insights');
  await expect(page.getByRole('table', { name: 'Topics ranked by error rate' }).getByRole('row')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test('the full mock draws a 65-question paper with a working calculator', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('#/mock');
  await expect(page.getByText('This draw: 65 questions, 100 marks.')).toBeVisible();
  await page.getByRole('link', { name: 'Start the mock' }).click();
  await expect(page.getByText('Question 1 of 65')).toBeVisible();
  await page.getByRole('button', { name: 'Calculator' }).click();
  const calc = page.getByRole('region', { name: 'Virtual calculator' });
  await calc.getByLabel('Expression').fill('sin(30)+2^3');
  await calc.getByLabel('Expression').press('Enter');
  await expect(calc.getByLabel('Result')).toHaveText('8.5');
  expect(errors).toEqual([]);
});

test('the decade view tabulates marks per subject for every recent paper', async ({ page }) => {
  await page.goto('#/decade');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Decade view');
  const table = page.getByRole('table', { name: 'Marks per subject per paper' });
  await expect(table.getByRole('row')).not.toHaveCount(1);
  await expect(table.getByRole('link', { name: 'Operating Systems' })).toBeVisible();
});

test('insights lists marks per chapter for every ledger paper', async ({ page }) => {
  await page.goto('#/insights');
  const rows = page.getByRole('table', { name: 'Marks per chapter per GATE year' }).getByRole('row');
  await expect(rows).not.toHaveCount(0);
  expect(await rows.count()).toBeGreaterThan(30);
});

test('the built site installs a service worker and reloads with no connection', async ({ page, context }) => {
  // Open a lazy page before the worker exists: the worker must still cache what it loaded.
  await page.goto('#/review');
  await expect(page.locator('main h1')).toHaveText('Review');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.waitForFunction(async () => {
    const keys = await caches.keys().then((names) => Promise.all(names.map((n) => caches.open(n).then((c) => c.keys()))));
    return keys.flat().some((r) => /ReviewPage-.*\.js$/.test(r.url));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('main h1')).toHaveText('Review');
  await context.setOffline(false);
  await page.goto('#/');
  await expect(page.getByRole('heading', { name: 'Offline' })).toBeVisible();
  await expect(page.getByText(/^\d+ of \d+ files saved$/)).toBeVisible();
});

test('the learning slice: hint, assisted attempt, concept round trip keeps the answer, variation', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('#/pyqs/gate-cse-2026-s2-q23');
  await expect(page.getByRole('region', { name: 'Hints' })).toBeVisible();
  await page.getByRole('button', { name: /Get a hint/ }).click();
  await expect(page.getByText('Hint 1 ·')).toBeVisible();
  await page.getByText('First Come First Serve (FCFS) Scheduling').click();
  await page.getByRole('button', { name: /Check against the official key/ }).click();
  await expect(page.getByText('Assisted attempt')).toBeVisible();
  // Leave for the concept and come back: the checked state must survive.
  await page.getByText('Revise:').locator('a').click();
  await page.getByRole('link', { name: /Back to your question/ }).click();
  await expect(page.getByText('Assisted attempt')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Practice variation' })).toBeVisible();
  await expect(page.getByText(/generated by us/i)).toBeVisible();
  expect(errors).toEqual([]);
});

test('a topic lesson opens from a deep link, reveals recall answers and marks its practice question', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('#/chapter/os-cpu-scheduling/learn/os-cpu-scheduling.preemption');
  const lesson = page.locator('[id="os-cpu-scheduling.preemption"] details', { hasText: 'Beginner lesson' });
  await expect(lesson).toHaveAttribute('open', '');
  await expect(lesson.getByText('written by us, not an exam question').first()).toBeVisible();
  await lesson.getByRole('button', { name: 'Show the answer' }).first().click();
  await expect(lesson.getByText('The scheduler can take the CPU')).toBeVisible();
  await lesson.getByText('Round Robin preempts the running process').click();
  await lesson.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(lesson.getByText('Correct', { exact: true })).toBeVisible();
  await expect(lesson.getByRole('link', { name: /Q23 · easy/ })).toBeVisible();
  expect(errors).toEqual([]);
});
