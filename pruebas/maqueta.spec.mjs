import { test, expect } from '@playwright/test';

test('tres apps con su CTA exacto', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#followapp a.cta')).toHaveAttribute('href', 'https://chromewebstore.google.com/detail/nffhilcgedjjoednagidnimjnembkdho');
  await expect(page.locator('#shield a.cta')).toHaveAttribute('href', 'https://chromewebstore.google.com/detail/chat-privacy-shield/gillcdhclnchpkbifcnipfckmapodjpm');
  await expect(page.locator('#cv a.cta')).toHaveAttribute('href', 'https://best-cv-neon.vercel.app');
  await expect(page.locator('#followapp a[href="https://arturdev98.github.io/followapp/"]')).toBeVisible();
});

test('cada app tiene su demo y tres puntos', async ({ page }) => {
  await page.goto('/');
  for (const id of ['followapp', 'shield', 'cv']) {
    await expect(page.locator(`#${id} .demo[data-demo="${id}"]`)).toHaveCount(1);
    await expect(page.locator(`#${id} .app-texto li`)).toHaveCount(3);
  }
});

test('pie sin CV ni proyecto de QA', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href*="/cv"], footer a[href*="ai-automatization"]')).toHaveCount(0);
  await expect(page.locator('footer')).toContainText('github.com/arturdev98');
});

test('sin scroll horizontal en 390 px, ES y EN', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const l of ['ES', 'EN']) {
    await page.getByRole('button', { name: l, exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
});
