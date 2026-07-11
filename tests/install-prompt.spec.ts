import { expect, test } from '@playwright/test';
import { IOS_INSTALL_DISMISS_KEY } from '../src/pwa/install';

test('offers and remembers iPhone installation guidance', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'iOS installation guidance');
  await page.addInitScript((key) => window.localStorage.removeItem(key), IOS_INSTALL_DISMISS_KEY);
  await page.goto('./');

  await page.locator('#universe').evaluate((element) => element.scrollIntoView({ block: 'start' }));
  const prompt = page.getByRole('dialog', { name: /keep this story as an app/i });
  await expect(prompt).toBeVisible();
  await expect(prompt.getByText('Add to Home Screen')).toBeVisible();

  await prompt.getByRole('button', { name: 'Got it' }).click();
  await expect(prompt).toBeHidden();
  expect(await page.evaluate((key) => window.localStorage.getItem(key), IOS_INSTALL_DISMISS_KEY)).toBe('dismissed');

  await page.reload();
  await page.locator('#universe').evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await expect(page.getByRole('dialog', { name: /keep this story as an app/i })).toHaveCount(0);
});
