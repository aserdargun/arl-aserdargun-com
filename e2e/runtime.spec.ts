import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Expected strings come from the lab's own canonical sources, never from prose
// invented here: the manifest owns routes, titles and the evidence policy.
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
