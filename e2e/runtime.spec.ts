import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { statuses } from '../src/lessons/content';

// Expected strings come from the lab's own canonical sources, never from prose
// invented here: the manifest owns routes, titles and the evidence policy, and
// the lesson copy owns the run-status wording the approval flow asserts on.
const manifest = JSON.parse(
  readFileSync(fileURLToPath(new URL('../lab.manifest.json', import.meta.url)), 'utf8'),
) as {
  tagline: Record<string, string>;
  experiments: { id: string; title: Record<string, string>; route: string }[];
  lessons: { id: string; route: string }[];
  evidencePolicy: { allowedKinds: string[] };
  evidence: { kind: string }[];
};

const experiment = (id: string) => {
  const found = manifest.experiments.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown manifest experiment: ${id}`);
  return found;
};

/** Presses Tab until the target control holds focus, proving tab order reaches it. */
async function tabTo(page: Page, selector: string) {
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    if (
      await page
        .locator(selector)
        .evaluate((el) => el === document.activeElement)
        .catch(() => false)
    )
      return;
  }
  throw new Error(`Tab order never reached ${selector}`);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(manifest.tagline.en);
});

test('every manifest scenario route loads its own scenario and heading', async ({ page }) => {
  for (const declared of manifest.experiments) {
    await page.goto(declared.route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(manifest.tagline.en);
    // The scenario select is the routing surface; its value and option label
    // must both follow the manifest, not a hardcoded duplicate.
    const select = page.getByLabel('Scenario', { exact: true });
    await expect(select).toHaveValue(declared.id);
    await expect(
      select.locator(`option[value="${declared.id}"]`),
    ).toHaveText(declared.title.en);
    await expect(page.getByTestId('run-status')).toBeVisible();
  }
});

test('the language control changes the rendered locale in both directions', async ({ page }) => {
  const heading = page.getByRole('heading', { level: 1 });
  const switcher = page.getByRole('button', { name: 'Switch to Turkish' });
  await switcher.click();
  await expect(heading).toHaveText(manifest.tagline.tr);
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page).toHaveURL(/[?&]lang=tr(&|$)/);
  // Scenario options are localized too, so the locale switch is not cosmetic.
  await expect(
    page
      .getByLabel('Senaryo', { exact: true })
      .locator(`option[value="${experiment('injection').id}"]`),
  ).toHaveText(experiment('injection').title.tr);

  await page.getByRole('button', { name: 'İngilizceye geç' }).click();
  await expect(heading).toHaveText(manifest.tagline.en);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('the language preference survives a reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Switch to Turkish' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(manifest.tagline.tr);
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
});

test('the primary run control is reachable and operable by keyboard alone', async ({ page }) => {
  await page.goto(experiment('revenue').route);
  const status = page.getByTestId('run-status');
  const before = await status.innerText();
  await tabTo(page, 'button.start-run');
  await page.keyboard.press('Enter');
  await expect(status).not.toHaveText(before);
});

test('the lens tablist follows keyboard arrow navigation', async ({ page }) => {
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(4);
  await tabTo(page, '#lens-hns');
  await expect(page.locator('#lens-hns')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lens-ctx')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#lens-ctx')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#lens-evl')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(page.locator('#lens-hns')).toHaveAttribute('aria-selected', 'true');
});

test('the guided lesson route opens its lesson surface', async ({ page }) => {
  const lesson = manifest.lessons[0];
  await page.goto(lesson.route);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 }).first()).not.toBeEmpty();
});

test('the manifest declares no evidence kind outside its own policy', async ({ page }) => {
  for (const record of manifest.evidence) {
    expect(manifest.evidencePolicy.allowedKinds).toContain(record.kind);
    expect(record.kind).not.toBe('measured');
  }
  // A shipped run must not surface a provenance badge the policy forbids.
  await page.goto(experiment('timeout').route);
  const kinds = await page.locator('[data-evidence-kind]').evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute('data-evidence-kind')),
  );
  for (const kind of kinds) {
    if (kind === null) continue;
    expect(manifest.evidencePolicy.allowedKinds).toContain(kind);
  }
});

test('desktop and mobile viewports render without horizontal overflow', async ({ page }) => {
  for (const size of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    await page.goto(experiment('injection').route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#workstation')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
      size.width,
    );
  }
});

test('the evidence surface is reachable and bilingual, and every citation is external', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#methodology');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toBeVisible();
  // Every source link is a real external URL, and each one states its limit.
  const sources = section.locator('.source-item');
  const count = await sources.count();
  expect(count).toBeGreaterThanOrEqual(1);
  for (let i = 0; i < count; i++) {
    const item = sources.nth(i);
    const href = await item.locator('a').getAttribute('href');
    expect(href, `source ${i}`).toMatch(/^https:\/\//);
    expect(href, `source ${i}`).not.toMatch(/aserdargun/);
    expect(href, `source ${i}`).not.toMatch(/w3\.org/);
    await expect(item.locator('.source-label.warn')).toBeVisible();
  }
  // The reviewed date is visible, not only present in the repository.
  await expect(section.locator('.methodology-reviewed')).toContainText(/\d{4}-\d{2}-\d{2}/);
  // Switching locale must not leave an untranslated evidence surface behind.
  await page.getByRole('button', { name: 'Switch to Turkish' }).click();
  await expect(page.locator('#methodology h2')).toHaveText(
    'İçerik incelemesi ve kanıt',
  );
  await expect(sources.first()).toBeVisible();
  await expect(section).toContainText('Desteklemez');
});

test('the simulation boundary is stated at the point of use, not only in the repository', async ({ page }) => {
  const boundary = page.locator('.boundary-note').first();
  await expect(boundary).toContainText(
    'A simulation check does not validate a real-world claim.',
  );
  // The review confirmation surface carries it next to the approve control.
  await page.goto(experiment('revenue').route);
  await page.getByLabel('Playback pace').selectOption('Fast');
  await page.getByRole('button', { name: 'Start run', exact: true }).click();
  await expect(page.getByTestId('run-status')).toHaveText('Awaiting human approval', {
    timeout: 30000,
  });
  await page.getByRole('button', { name: 'Review action' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.boundary-note')).toContainText(
    'A simulation check does not validate a real-world claim.',
  );
  // The inspection surface carries it in the evaluation lens too.
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.locator('#lens-evl').click();
  await expect(page.locator('.desktop-inspector .boundary-note')).toBeVisible();
});

test('each guide chapter names the scenarios that demonstrate it', async ({ page }) => {
  await page.goto(manifest.lessons[0].route);
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.chapter-count')).toBeVisible();
  const covered = new Set<string>();
  for (let chapter = 0; chapter < 12; chapter++) {
    const buttons = dialog.locator('.chapter-coverage-scenarios button');
    const n = await buttons.count();
    expect(n, `chapter ${chapter + 1}`).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) covered.add((await buttons.nth(i).innerText()).trim());
    if (chapter < 11) await dialog.getByRole('button', { name: 'Next chapter' }).click();
  }
  // Every scenario the site can run is connectable to the guide.
  for (const declared of manifest.experiments) expect(covered, declared.id).toContain(declared.title.en);
  // Selecting a listed scenario routes the laboratory to it.
  await dialog.locator('.chapter-coverage-scenarios button').first().click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByLabel('Scenario', { exact: true })).toHaveValue('revenue');
});

/** Runs the revenue scenario to the human gate and opens the review surface. */
async function runToApproval(page: Page) {
  await page.getByLabel('Playback pace').selectOption('Fast');
  await page.getByRole('button', { name: 'Start run', exact: true }).click();
  await expect(page.getByTestId('run-status')).toHaveText(
    statuses.awaiting_approval.en,
    { timeout: 30000 },
  );
  await page.getByRole('button', { name: 'Review action' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test('approving once writes exactly once and spends the one-use grant', async ({
  page,
}) => {
  // The delegated authority before the write is the baseline that a one-use
  // grant must consume without widening.
  await page.goto(experiment('revenue').route);
  const inspector = page.locator('.desktop-inspector');
  await page.locator('#lens-sec').click();
  const granted = (await inspector.locator('.permissions code').allInnerTexts()).join(
    ',',
  );
  expect(granted).not.toBe('');

  await runToApproval(page);
  await page.getByRole('button', { name: 'Approve once' }).click();
  await expect(page.getByTestId('run-status')).toHaveText(statuses.complete.en, {
    timeout: 30000,
  });

  // Exactly one write, and the grant that permitted it is now spent.
  await page.getByRole('button', { name: 'View report' }).click();
  await expect(page.getByRole('dialog')).toContainText('Writes: 1');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.locator('#lens-sec').click();
  await expect(inspector).toContainText(/approveOnce · consumed/);
  // Approving must not have widened the base authority.
  expect(
    (await inspector.locator('.permissions code').allInnerTexts()).join(','),
  ).toBe(granted);
});

test('denying leaves the simulated report unwritten', async ({ page }) => {
  await page.goto(experiment('revenue').route);
  await runToApproval(page);
  await page.getByRole('button', { name: 'Deny action' }).click();
  await expect(page.getByTestId('run-status')).toHaveText(statuses.denied.en);
  // A refused write leaves the world resource exactly as it was.
  await page.getByRole('button', { name: 'Inspect result' }).click();
  await expect(page.getByRole('dialog')).toContainText('Writes: 0');
});
