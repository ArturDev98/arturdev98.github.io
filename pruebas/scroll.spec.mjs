import { test, expect } from '@playwright/test';

const progreso = (page, d) => page.evaluate((x) => window.__demos[x].progress(), d);

test('móvil no fija secciones', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test('en móvil la demo arranca sola al entrar en pantalla', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  await page.goto('/');
  expect(await progreso(page, 'followapp')).toBe(0);
  await page.locator('[data-demo=followapp]').scrollIntoViewIfNeeded();
  await expect.poll(() => progreso(page, 'followapp')).toBeGreaterThan(0.1);
});

test('escritorio fija cada demo', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.pin-spacer')).toHaveCount(3);
});

test('en escritorio la demo avanza con el scroll', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const y = await page.locator('#followapp').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((v) => window.scrollTo(0, v + window.innerHeight * 0.6), y);
  await expect.poll(() => progreso(page, 'followapp')).toBeGreaterThan(0.3);
});

test('movimiento reducido muestra el estado final sin animar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('cuenta suspendida');
  await expect(page.locator('[data-demo=cv] .logro')).toBeVisible();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test('pasar de escritorio a móvil no rompe nada', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('/');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.mouse.wheel(0, 3000);
  await page.waitForTimeout(500);
  expect(errores).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
