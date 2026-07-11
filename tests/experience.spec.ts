import { expect, test } from '@playwright/test';

test('tells the full scroll story without overflow or runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('./');
  await expect(page.getByRole('heading', { name: /systems that move businesses/i })).toBeVisible();
  await expect(page.locator('section.chapter')).toHaveCount(5);

  for (const phase of ['universe', 'career', 'projects', 'architect', 'contact']) {
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
  await expect(page.getByRole('heading', { name: /systems that move businesses/i })).toBeVisible();
  await expect(page.locator('[data-story]')).toHaveCount(6);
});
