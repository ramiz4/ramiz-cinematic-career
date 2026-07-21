import { expect, test } from '@playwright/test';
import { IOS_INSTALL_DISMISS_KEY } from '../src/pwa/install';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.setItem(key, 'dismissed'), IOS_INSTALL_DISMISS_KEY);
});

test('tells the full scroll story without overflow or runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('./');
  await expect(page.getByRole('heading', { name: /technical complexity into business leverage/i })).toBeVisible();
  await expect(page.locator('[data-story]')).toHaveCount(6);

  for (const phase of ['system', 'journey', 'impact', 'leadership', 'contact']) {
    await page.locator(`#${phase}`).evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await expect(page.locator('html')).toHaveAttribute('data-story-phase', phase);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow in ${phase}`).toBeFalsy();
  }

  expect(errors).toEqual([]);
});

test('uses the static story artwork when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.getByTestId('static-scene')).toBeVisible();
  await expect(page.locator('.scene canvas')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /technical complexity into business leverage/i })).toBeVisible();
  await expect(page.locator('[data-story]')).toHaveCount(6);
  await expect(page.locator('[data-system-story]')).toHaveAttribute('data-motion', 'reduced');
});

test('keeps every story chapter visible in a full-page mobile capture', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile full-page capture regression');
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /technical complexity into business leverage/i })).toBeVisible();
  await expect(page.locator('[data-system-story]')).toHaveAttribute('data-motion', 'compact');
  for (const heading of await page.locator('main h2').all()) await expect(heading).toBeVisible();
  const capture = await page.screenshot({ fullPage: true });
  expect(capture.byteLength).toBeGreaterThan(20_000);
});

test('scrubs the system graph through the five architecture decisions', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop pinned graph behavior');
  await page.goto('./');

  const stage = page.locator('[data-system-scroll]');
  await stage.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + element.scrollHeight * .9, behavior: 'auto' });
  });

  await expect(page.locator('[data-story-step="ownership"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-system-story]')).toHaveAttribute('data-motion', 'pinned');
});

test('keeps mobile sections bounded when Safari expands the capture viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile Safari viewport regression');
  await page.goto('./');
  const frozenHeight = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-viewport-height')));
  expect(frozenHeight).toBeGreaterThan(500);
  expect(frozenHeight).toBeLessThan(1_500);

  await page.setViewportSize({ width: 390, height: 9_000 });

  const measurements = await page.locator('[data-story]').evaluateAll((sections) => sections.map((section) => ({
    id: section.id,
    minHeight: parseFloat(getComputedStyle(section).minHeight),
  })));
  for (const measurement of measurements) {
    expect(measurement.minHeight, `${measurement.id} expanded with the capture viewport`).toBeLessThan(1_500);
  }
  expect(await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-viewport-height')))).toBe(frozenHeight);
});
