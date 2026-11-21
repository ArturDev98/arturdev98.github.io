import { test, expect } from '@playwright/test';

const esVideo = (u) => /\.(mp4|webm)(\?|$)/.test(u);

test('ningún .mp4/.webm se pide al cargar', async ({ page }) => {
  const pedidos = [];
  page.on('request', (r) => pedidos.push(r.url()));
  await page.goto('/');
  await expect(page.locator('html.listo')).toHaveCount(1);
  await page.waitForTimeout(500);
  expect(pedidos.filter(esVideo)).toEqual([]);
  expect(pedidos.some((u) => u.endsWith('/media/repeticion.webp'))).toBe(true);
});

test('en escritorio el video corre al verse y se pausa al salir', async ({ page, isMobile }) => {
  test.skip(isMobile, 'solo escritorio');
  await page.goto('/');
  const v = page.locator('video[data-repeticion]');
  await expect(v).toHaveJSProperty('controls', true);
  await v.evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect.poll(() => v.evaluate((n) => !n.paused), { timeout: 8000 }).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => v.evaluate((n) => n.paused), { timeout: 5000 }).toBe(true);
});

test('en escritorio el brillo escribe --mx/--my y la tarjeta se ilumina', async ({ page, isMobile }) => {
  test.skip(isMobile, 'solo escritorio');
  await page.goto('/');
  const t = page.locator('.ficha').first();
  await t.scrollIntoViewIfNeeded();
  const b = await t.boundingBox();
  await page.mouse.move(b.x + 40, b.y + 30);
  await page.mouse.move(b.x + 60, b.y + 40);
  await expect.poll(() => t.evaluate((n) => n.style.getPropertyValue('--mx'))).toBe('60px');
  await expect.poll(() => t.evaluate((n) => getComputedStyle(n, '::before').opacity)).toBe('1');
});

test('con puntero táctil no hay brillo ni autoplay: video con controles', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'solo móvil');
  const pedidos = [];
  page.on('request', (r) => pedidos.push(r.url()));
  await page.goto('/');
  const f = page.locator('.ficha').first();
  expect(await f.evaluate((n) => getComputedStyle(n, '::before').content)).toBe('none');
  expect(await f.evaluate((n) => n.style.getPropertyValue('--mx'))).toBe('');
  const v = page.locator('video[data-repeticion]');
  await v.evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(800);
  await expect(v).toHaveJSProperty('controls', true);
  await expect(v).toHaveJSProperty('paused', true);
  expect(pedidos.filter(esVideo)).toEqual([]);
});

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('el video tiene controles y sigue en pausa', async ({ page }) => {
    await page.goto('/');
    const v = page.locator('video[data-repeticion]');
    await v.evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(800);
    await expect(v).toHaveJSProperty('controls', true);
    await expect(v).toHaveJSProperty('paused', true);
  });
});
