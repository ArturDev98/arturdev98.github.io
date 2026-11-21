import { test, expect } from '@playwright/test';
import { gzipSync } from 'node:zlib';

test('favicon y metadatos', async ({ page, request }) => {
  await page.goto('/apps/');
  await expect(page.locator('link[rel=icon]')).toHaveAttribute('href', '../favicon.svg');
  expect((await request.get('/favicon.svg')).headers()['content-type']).toContain('image/svg+xml');
  expect((await request.get('/apple-touch-icon.png')).status()).toBe(200);
  expect((await request.get('/apps/og.png')).status()).toBe(200);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://arturdev98.github.io/apps/og.png?v=3');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
});

test('peso en móvil < 150 KB comprimido', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  const tamaños = [];
  page.on('response', (r) => {
    if (/\.(m?js|css|html)$|\/$/.test(r.url())) tamaños.push(r.body().then((b) => gzipSync(b).length));
  });
  await page.goto('/apps/');
  await page.waitForLoadState('networkidle');
  const total = (await Promise.all(tamaños)).reduce((a, b) => a + b, 0);
  expect(total).toBeGreaterThan(10 * 1024);
  expect(total).toBeLessThan(150 * 1024);
});
