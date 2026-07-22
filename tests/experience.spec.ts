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
  const matrix = page.locator('[data-intro-matrix]');
  const hero = page.locator('.hero__sticky');

  await expect(intro).toBeVisible();
  await expect(intro).toHaveAttribute('role', 'dialog');
  await expect(intro).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('[data-site-shell]')).toHaveAttribute('inert', '');
  await expect(page.locator('[data-site-shell]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeFocused();
  await expect(matrix).toHaveAttribute('data-matrix-state', 'running');
  await expect(page.locator('.scene canvas')).toHaveCount(0);
  const before = await hero.boundingBox();

  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(intro).toHaveCount(0);
  await expect(matrix).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /technical complexity into business leverage/i })).toBeVisible();
  await expect(page.locator('[data-site-shell]')).not.toHaveAttribute('inert', '');
  await expect(page.locator('[data-site-shell]')).not.toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#main')).toBeFocused();
  await expect(page.locator('.scene canvas')).toHaveCount(1);
  expect(await page.evaluate((key) => window.sessionStorage.getItem(key), SITE_INTRO_SESSION_KEY)).toBe('seen');

  const after = await hero.boundingBox();
  expect(after?.x).toBe(before?.x);
  expect(after?.y).toBe(before?.y);
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);

  await page.goto('./');
  await expect(intro).toHaveCount(0);
  await expect(matrix).toHaveCount(0);

  await page.goto('./?intro=1');
  await expect(intro).toBeVisible();
  await expect(matrix).toHaveAttribute('data-matrix-state', 'running');
  await page.keyboard.press('Escape');
  await expect(intro).toHaveCount(0);
});

test('flies through on scroll intent and destroys the intro matrix before the hero', async ({ page }) => {
  await page.goto('./?intro=1');
  const intro = page.locator('[data-site-intro]');
  const matrix = page.locator('[data-intro-matrix]');

  await expect(matrix).toHaveAttribute('data-matrix-state', 'running');
  await expect(page.locator('.scene canvas')).toHaveCount(0);
  await page.mouse.wheel(0, 420);

  await expect(intro).toHaveCount(0, { timeout: 3_000 });
  await expect(matrix).toHaveCount(0);
  await expect(page.locator('.scene canvas')).toHaveCount(1);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('keeps semantic content available when optional animation chunks fail', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One enhancement fallback check is sufficient');
  await page.route('**/assets/Scene-*.js', (route) => route.abort());
  await page.route('**/assets/*scrollytelling-*.js', (route) => route.abort());
  await page.goto('./');

  await expect(page.getByTestId('static-scene')).toBeVisible();
  for (const selector of [
    '[data-system-story]',
    '[data-journey-story]',
    '[data-impact-story]',
    '[data-operating-story]',
  ]) await expect(page.locator(selector)).toHaveAttribute('data-enhancement', 'fallback');
  for (const heading of await page.locator('main h2').all()) await expect(heading).toBeVisible();
});

test('reopens the complete experience offline after service-worker installation', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One offline installation check is sufficient');
  await page.goto('./');
  await expect(page.locator('.scene canvas')).toHaveCount(1);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Service worker did not claim the page')), 5_000);
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
    });
  });

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /technical complexity into business leverage/i })).toBeVisible();
    await expect(page.locator('.scene canvas')).toHaveCount(1);
    await expect(page.locator('[data-operating-story]')).toHaveAttribute('data-enhancement', 'ready');
  } finally {
    await context.setOffline(false);
  }
});

test('tells the full scroll story without overflow or runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('./');
  await expect(page.getByRole('heading', { name: /technical complexity into business leverage/i })).toBeVisible();
  await expect(page.locator('[data-story]')).toHaveCount(6);

  for (const phase of ['system', 'journey', 'impact', 'leadership', 'contact']) {
    await page.locator(`#${phase}`).evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(page.locator('html')).toHaveAttribute('data-story-phase', phase);
    await expect(page.locator(`.nav a[href="#${phase}"]`)).toHaveAttribute('aria-current', 'page');
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
  await expect(page.locator('[data-system-step-index]')).toHaveText('05 / 05');
  await expect(page.locator('[data-system-step-label]')).toHaveText('Ownership aligned');
  await expect(page.locator('[data-story-step].is-active')).toHaveCount(1);
  await expect(page.locator('[data-story-step="ownership"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-operating-story]')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('[data-operating-story]')).toHaveAttribute('data-operating-stage', '5');
  await expect(page.locator('[data-operating-step].is-active')).toHaveCount(1);
  await expect(page.locator('[data-operating-step="deliver"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-operating-group="deliver"]')).toHaveCSS('visibility', 'visible');
});

test('reinitializes the operating model when motion preferences change at runtime', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop motion preference lifecycle');
  await page.goto('./');
  const story = page.locator('[data-operating-story]');
  await expect(story).toHaveAttribute('data-motion', 'pinned');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(story).toHaveAttribute('data-motion', 'reduced');
  await expect(story).toHaveAttribute('data-operating-stage', '5');
  await expect(page.locator('[data-operating-step].is-active')).toHaveCount(1);
  await expect(page.locator('[data-operating-step="deliver"]')).toHaveClass(/is-active/);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(story).toHaveAttribute('data-motion', 'pinned');
  await expect(story).toHaveAttribute('data-operating-stage', '1');
  await expect(page.locator('[data-operating-step].is-active')).toHaveCount(1);
  await expect(page.locator('[data-operating-step="analyze"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-operating-group="analyze"]')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('[data-operating-group="deliver"]')).toHaveCSS('visibility', 'hidden');
});

test('keeps mobile navigation and story progress accessible', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile navigation behavior');
  await page.goto('./');

  const storyProgress = page.getByRole('complementary', { name: 'Story progress' });
  await expect(storyProgress.getByRole('link', { name: 'Position' })).toHaveAttribute('href', '#hero');
  await expect(storyProgress.getByRole('link', { name: 'Engineering system' })).toHaveAttribute('href', '#leadership');

  const toggle = page.getByRole('button', { name: 'Open journey menu' });
  await toggle.click();
  const dialog = page.getByRole('dialog', { name: 'Your journey' });
  const closeButton = dialog.getByRole('button', { name: 'Close journey menu' });
  const contactLink = dialog.getByRole('link', { name: 'Discuss a leadership mandate' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('.nav')).toHaveAttribute('inert', '');
  const backgroundLayers = page.locator('[data-navigation-background]');
  await expect(backgroundLayers).toHaveCount(2);
  for (const layer of await backgroundLayers.all()) await expect(layer).toHaveAttribute('inert', '');
  await expect(dialog.getByRole('link', { name: '1. Position' })).toBeFocused();

  await closeButton.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(contactLink).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();
  await closeButton.click();
  await expect(dialog).toHaveCount(0);
  await expect(toggle).toBeFocused();

  await toggle.click();
  await expect(page.getByRole('dialog', { name: 'Your journey' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Your journey' })).toHaveCount(0);
  await expect(toggle).toBeFocused();

  await toggle.click();
  await expect(page.getByRole('dialog', { name: 'Your journey' })).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('dialog', { name: 'Your journey' })).toHaveCount(0);
  await expect(page.locator('.nav')).not.toHaveAttribute('inert', '');
  for (const layer of await backgroundLayers.all()) await expect(layer).not.toHaveAttribute('inert', '');
  await expect(page.getByRole('main')).toBeVisible();
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
    window.scrollTo({ top: top + range * .94, behavior: 'instant' });
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
  await journeyStep.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(journeyStep).toHaveClass(/is-active/);
  await expect(page.locator('[data-journey-story]')).toHaveAttribute('data-journey-stage', '3');
  await expect(page.locator('.journey-radar')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-story-focus', 'journey');
  await expect(page.locator('.story-progress')).toHaveCSS('opacity', '0');

  const impactCase = page.locator('[data-impact-case]').first();
  await impactCase.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const start = top - 96;
    const end = top + element.clientHeight - window.innerHeight + 64;
    window.scrollTo({ top: start + (end - start) * .5, behavior: 'instant' });
  });
  await expect(impactCase.locator('[data-impact-status]')).toHaveText('Decision');
  await expect(impactCase.locator('[data-impact-stage="decision"]')).toHaveClass(/is-active/);
  await expect(page.locator('html')).toHaveAttribute('data-story-focus', 'impact');
  await expect(page.locator('.story-progress')).toHaveCSS('opacity', '0');
});

test('keeps compact journey navigation available outside pinned visualizations', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Compact story-rail behavior');
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('./');

  for (const selector of [
    '[data-system-story]',
    '[data-journey-story]',
    '[data-impact-story]',
    '[data-operating-story]',
  ]) {
    const story = page.locator(selector);
    await expect(story).toHaveAttribute('data-motion', 'compact');
    await story.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(page.locator('html')).not.toHaveAttribute('data-story-focus', /system|journey|impact|leadership/);
    await expect(page.locator('.story-progress')).toHaveCSS('opacity', '1');
    await expect(page.locator('.story-progress')).toHaveCSS('pointer-events', 'auto');
  }
});

test('prioritizes mobile story copy over dense system diagrams', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Small mobile story-first behavior');
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('./');

    await expect(page.locator('[data-system-visual]')).toHaveCSS('display', 'none');
    await expect(page.locator('.operating-visual__header')).toHaveCSS('display', 'none');
    await expect(page.locator('.operating-visual__canvas')).toHaveCSS('display', 'none');
    await expect(page.locator('.operating-visual__rail')).toHaveCSS('display', 'none');
    await expect(page.locator('.decision-console')).toBeVisible();
    await expect(page.locator('[data-system-story] .pin-spacer')).toHaveCount(0);
    await expect(page.locator('[data-operating-story] .pin-spacer')).toHaveCount(0);

    const pressure = page.locator('[data-story-step="pressure"]');
    const ownership = page.locator('[data-story-step="ownership"]');
    await centerMobileStep(pressure);
    await expect(pressure).toHaveClass(/is-active/);
    await expectMobileStepReadable(pressure);
    await centerMobileStep(ownership);
    await expect(ownership).toHaveClass(/is-active/);
    await expectMobileStepReadable(ownership);
    await centerMobileStep(pressure);
    await expect(pressure).toHaveClass(/is-active/);
    await expectMobileStepReadable(pressure);

    const parallelize = page.locator('[data-operating-step="parallelize"]');
    await centerMobileStep(parallelize);
    await expect(parallelize).toHaveClass(/is-active/);
    await expectMobileStepReadable(parallelize);
    await expect(page.locator('html')).not.toHaveAttribute('data-story-focus', /system|leadership/);
  }
});

test('keeps mobile operating stages reversible and decision filters readable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Small mobile operating-system story behavior');
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('./');

  const story = page.locator('[data-operating-story]');
  const decisionConsole = page.locator('.decision-console');
  await expect(story).toHaveAttribute('data-motion', 'compact');
  await expect(story).toHaveAttribute('data-operating-stage', '1');
  await expect(page.locator('.operating-visual__canvas')).toHaveCSS('display', 'none');
  await expect(decisionConsole).toBeVisible();

  const documentGap = await page.evaluate(() => {
    const steps = document.querySelector('.operating-system__steps');
    const filters = document.querySelector('.decision-console');
    if (!steps || !filters) return -1;
    return filters.getBoundingClientRect().top - steps.getBoundingClientRect().bottom;
  });
  expect(documentGap).toBeGreaterThanOrEqual(32);

  for (const title of await page.locator('.operating-visual__principles dt').all()) {
    expect(parseFloat(await title.evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(12);
  }
  for (const meaning of await page.locator('.decision-filter__meaning').all()) {
    expect(parseFloat(await meaning.evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(12);
  }
  for (const effect of await page.locator('.decision-filter__effect').all()) {
    await expect(effect).toBeVisible();
    expect(parseFloat(await effect.evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(12);
  }

  const parallelize = page.locator('[data-operating-step="parallelize"]');
  await centerMobileStep(parallelize);
  await expect(story).toHaveAttribute('data-operating-stage', '4');
  await expect(parallelize).toHaveClass(/is-active/);
  await expectMobileStepReadable(parallelize);

  const deliver = page.locator('[data-operating-step="deliver"]');
  await centerMobileStep(deliver);
  await expect(story).toHaveAttribute('data-operating-stage', '5');
  await expect(deliver).toHaveClass(/is-active/);
  await expectMobileStepReadable(deliver);

  const analyze = page.locator('[data-operating-step="analyze"]');
  await centerMobileStep(analyze);
  await expect(story).toHaveAttribute('data-operating-stage', '1');
  await expect(analyze).toHaveClass(/is-active/);
  await expectMobileStepReadable(analyze);
});

test('keeps the WebGL world fixed and steers it around story interfaces', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop viewport collision behavior');
  await page.goto('./');

  const scene = page.getByTestId('story-scene');
  await expect(scene).toHaveCSS('position', 'fixed');
  await expect(scene.locator('canvas')).toHaveCount(1);

  await page.locator('[data-system-scroll]').evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '-0.56');

  await page.locator('#journey').evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '0');
  await expect(page.locator('html')).not.toHaveAttribute('data-story-focus', 'system');
  await expect(page.locator('.story-progress')).toHaveCSS('opacity', '1');
  await page.locator('[data-journey-step]').nth(2).evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '-0.6');
  await expect(page.locator('[data-three-viewport-slot]')).toBeVisible();

  await page.locator('#impact').evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '0');
  await page.locator('[data-impact-story]').evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '-0.82');

  await page.locator('[data-operating-story]').evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '-1');

  await page.locator('#contact').evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '0');

  // The same collision path must resolve deterministically while scrolling up.
  await page.locator('[data-operating-story]').evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '-1');
  await page.locator('#leadership').evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '0');

  await page.locator('[data-impact-story]').evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '-0.82');
  await page.locator('#impact').evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '0');

  await page.locator('[data-journey-step]').nth(2).evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '-0.6');
  await page.locator('#journey').evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '0');

  await page.locator('[data-system-scroll]').evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-three-viewport-x', '-0.56');
  await expect(scene.locator('canvas')).toHaveCount(1);
});

test('moves verified intent through a dependency-aware engineering system', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop sticky operating-system behavior');
  await page.goto('./');
  const story = page.locator('[data-operating-story]');
  await expect(story).toHaveAttribute('data-motion', 'pinned');

  const verify = page.locator('[data-operating-step="verify"]');
  await verify.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(verify).toHaveClass(/is-active/);
  await expect(story).toHaveAttribute('data-operating-stage', '2');
  await expect(page.locator('[data-operating-index]')).toHaveText('02 / 05');
  await expect(page.locator('[data-operating-label]')).toHaveText('Human verified');

  const structure = page.locator('[data-operating-step="structure"]');
  await structure.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(structure).toHaveClass(/is-active/);
  await expect(story).toHaveAttribute('data-operating-stage', '3');
  await expect(page.locator('[data-operating-group="structure"]')).toHaveCSS('visibility', 'visible');
  expect(await labelsStayInsideFrames(page.locator('[data-operating-group="structure"] .os-ticket'))).toBeTruthy();

  const parallelize = page.locator('[data-operating-step="parallelize"]');
  await parallelize.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(parallelize).toHaveClass(/is-active/);
  await expect(story).toHaveAttribute('data-operating-stage', '4');
  await expect(page.locator('[data-operating-group="parallelize"]')).toHaveCSS('visibility', 'visible');
  expect(await labelsStayInsideFrames(page.locator('[data-operating-group="parallelize"] .os-ticket'))).toBeTruthy();
  expect(await labelsStayInsideFrames(page.locator('[data-operating-group="parallelize"] .os-lane'))).toBeTruthy();
  await expect(page.locator('html')).toHaveAttribute('data-story-focus', 'leadership');
  await expect(page.locator('.story-progress')).toHaveCSS('opacity', '0');

  const deliver = page.locator('[data-operating-step="deliver"]');
  await deliver.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(deliver).toHaveClass(/is-active/);
  await expect(story).toHaveAttribute('data-operating-stage', '5');
  await expect(page.locator('[data-operating-group="deliver"]')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('[data-operating-group="deliver"] .os-feedback-node')).toHaveCSS('visibility', 'visible');
});

async function centerMobileStep(step: Locator) {
  await step.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + element.clientHeight / 2 - window.innerHeight / 2,
      behavior: 'instant',
    });
  });

  await expect(step).toHaveClass(/is-active/);
  await step.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + element.clientHeight / 2 - window.innerHeight / 2,
      behavior: 'instant',
    });
  });
}

async function expectMobileStepReadable(step: Locator) {
  const geometry = await step.evaluate((element) => {
    const content = [
      element.querySelector(':scope > span, .operating-step__meta'),
      element.querySelector('h3'),
      element.querySelector('p'),
      element.querySelector('ul, blockquote'),
    ].filter((candidate): candidate is Element => candidate instanceof Element)
      .map((candidate) => candidate.getBoundingClientRect());
    const nav = document.querySelector('.nav')?.getBoundingClientRect();
    const progress = document.querySelector('.story-progress')?.getBoundingClientRect();

    return {
      contentTop: Math.min(...content.map((bounds) => bounds.top)),
      contentBottom: Math.max(...content.map((bounds) => bounds.bottom)),
      safeTop: nav?.bottom ?? 0,
      safeBottom: progress?.top ?? window.innerHeight,
    };
  });

  expect(geometry.contentTop, 'active copy should clear the fixed navigation').toBeGreaterThanOrEqual(geometry.safeTop + 8);
  expect(geometry.contentBottom, 'active copy should clear the mobile story rail').toBeLessThanOrEqual(geometry.safeBottom - 8);
}

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
