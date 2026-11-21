import { test, expect } from '@playwright/test';

// PageSpeed mide en inglés: si el idioma cambiara al llegar main.js, la portada saltaría.
test.describe('visitante en inglés', () => {
  test.use({ locale: 'en-US' });

  test('la portada ya sale en inglés y no se mueve aunque el JS llegue tarde', async ({ page }) => {
    await page.route(/\.js$/, async (r) => { await new Promise((ok) => setTimeout(ok, 1500)); await r.continue(); });
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
        .observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/apps/', { waitUntil: 'commit' });
    await expect(page.locator('.portada h1')).toHaveText('Small tools that ask you for nothing');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#b-en')).toHaveAttribute('aria-pressed', 'true');
    await page.waitForLoadState('load');
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.__cls)).toBeLessThan(0.05);
  });
});

test('ES y EN dicen cuál está activo', async ({ page }) => {
  await page.goto('/apps/');
  await expect(page.locator('#b-es')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('#b-en')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#b-es')).toHaveAttribute('aria-pressed', 'false');
});

test('el control de intensidad se lee con su unidad', async ({ page }) => {
  await page.goto('/apps/');
  const rango = page.locator('#intensidad');
  await expect(rango).toHaveAttribute('aria-valuetext', '8 px de desenfoque');
  await rango.fill('12');
  await expect(rango).toHaveAttribute('aria-valuetext', '12 px de desenfoque');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(rango).toHaveAttribute('aria-valuetext', '12 px of blur');
});

test('carga y recorre la página sin errores en la consola', async ({ page }) => {
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('/apps/');
  await page.waitForLoadState('networkidle');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  expect(errores).toEqual([]);
});

test('fuera de las pruebas no quedan controles internos en window', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await page.goto('/apps/');
  await page.waitForLoadState('networkidle');
  expect(await page.evaluate(() => [typeof window.__demos, typeof window.__portada])).toEqual(['undefined', 'undefined']);
});
