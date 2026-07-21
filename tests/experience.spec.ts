import { expect, test, type Locator } from '@playwright/test';
import { IOS_INSTALL_DISMISS_KEY } from '../src/pwa/install';
import { SITE_INTRO_SESSION_KEY } from '../src/components/siteIntroSession';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ installKey, introKey }) => {
    window.localStorage.setItem(installKey, 'dismissed');
    window.sessionStorage.setItem(introKey, 'seen');
  }, { installKey: IOS_INSTALL_DISMISS_KEY, introKey: SITE_INTRO_SESSION_KEY });
});

test('assembles the interface once and keeps an immediate escape hatch', async ({ page }) => {
  await page.goto('./?intro=1');
  const intro = page.locator('[data-site-intro]');
  const hero = page.locator('.hero__sticky');

  await expect(intro).toBeVisible();
  await expect(page.locator('.scene canvas')).toHaveCount(0);
  const before = await hero.boundingBox();

  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(intro).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /technical complexity into business leverage/i })).toBeVisible();
  await expect(page.locator('.scene canvas')).toHaveCount(1);
  expect(await page.evaluate((key) => window.sessionStorage.getItem(key), SITE_INTRO_SESSION_KEY)).toBe('seen');

  const after = await hero.boundingBox();
  expect(after?.x).toBe(before?.x);
  expect(after?.y).toBe(before?.y);
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);

  await page.goto('./');
  await expect(intro).toHaveCount(0);

  await page.goto('./?intro=1');
  await expect(intro).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(intro).toHaveCount(0);
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
  await expect(page.locator('[data-operating-story]')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('[data-operating-story]')).toHaveAttribute('data-operating-stage', '5');
  await expect(page.locator('[data-operating-group="deliver"]')).toHaveCSS('visibility', 'visible');
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
  await expect(page.locator('[data-system-story]')).toHaveAttribute('data-motion', 'pinned');

  const stage = page.locator('[data-system-scroll]');
  await stage.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const range = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + range * .94, behavior: 'auto' });
  });

  await expect(page.locator('[data-story-step="ownership"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-graph="ownership-zone"]').first()).toHaveCSS('visibility', 'visible');
  await expect(page.locator('.story-progress')).toHaveCSS('opacity', '0');
});

test('turns career scope and impact evidence into local scroll states', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop sticky narrative behavior');
  await page.goto('./');
  await expect(page.locator('[data-journey-story]')).toHaveAttribute('data-motion', 'tracked');
  await expect(page.locator('[data-impact-story]')).toHaveAttribute('data-motion', 'stacked');

  const journeyStep = page.locator('[data-journey-step]').nth(2);
  await journeyStep.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(journeyStep).toHaveClass(/is-active/);
  await expect(page.locator('[data-journey-label]')).toHaveText('System coherence');

  const impactCase = page.locator('[data-impact-case]').first();
  await impactCase.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const start = top - 96;
    const end = top + element.clientHeight - window.innerHeight + 64;
    window.scrollTo({ top: start + (end - start) * .5, behavior: 'auto' });
  });
  await expect(impactCase.locator('[data-impact-status]')).toHaveText('Decision');
  await expect(impactCase.locator('[data-impact-stage="decision"]')).toHaveClass(/is-active/);
});

test('moves verified intent through a dependency-aware engineering system', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop sticky operating-system behavior');
  await page.goto('./');
  const story = page.locator('[data-operating-story]');
  await expect(story).toHaveAttribute('data-motion', 'pinned');

  const verify = page.locator('[data-operating-step="verify"]');
  await verify.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(verify).toHaveClass(/is-active/);
  await expect(story).toHaveAttribute('data-operating-stage', '2');
  await expect(page.locator('[data-operating-index]')).toHaveText('02 / 05');
  await expect(page.locator('[data-operating-label]')).toHaveText('Human verified');

  const structure = page.locator('[data-operating-step="structure"]');
  await structure.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(structure).toHaveClass(/is-active/);
  await expect(story).toHaveAttribute('data-operating-stage', '3');
  await expect(page.locator('[data-operating-group="structure"]')).toHaveCSS('visibility', 'visible');
  expect(await labelsStayInsideFrames(page.locator('[data-operating-group="structure"] .os-ticket'))).toBeTruthy();

  const parallelize = page.locator('[data-operating-step="parallelize"]');
  await parallelize.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(parallelize).toHaveClass(/is-active/);
  await expect(story).toHaveAttribute('data-operating-stage', '4');
  await expect(page.locator('[data-operating-group="parallelize"]')).toHaveCSS('visibility', 'visible');
  expect(await labelsStayInsideFrames(page.locator('[data-operating-group="parallelize"] .os-ticket'))).toBeTruthy();
  expect(await labelsStayInsideFrames(page.locator('[data-operating-group="parallelize"] .os-lane'))).toBeTruthy();
  await expect(page.locator('html')).toHaveAttribute('data-story-focus', 'leadership');
  await expect(page.locator('.story-progress')).toHaveCSS('opacity', '0');

  const deliver = page.locator('[data-operating-step="deliver"]');
  await deliver.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(deliver).toHaveClass(/is-active/);
  await expect(story).toHaveAttribute('data-operating-stage', '5');
  await expect(page.locator('[data-operating-group="deliver"]')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('[data-operating-group="deliver"] .os-feedback-node')).toHaveCSS('visibility', 'visible');
});

async function labelsStayInsideFrames(groups: Locator) {
  return groups.evaluateAll((elements) => elements.every((element) => {
    const frame = element.querySelector('rect')?.getBoundingClientRect();
    if (!frame) return false;

    return Array.from(element.querySelectorAll('text')).every((label) => {
      const bounds = label.getBoundingClientRect();
      return bounds.left >= frame.left && bounds.right <= frame.right
        && bounds.top >= frame.top && bounds.bottom <= frame.bottom;
    });
  }));
}

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
