import { test, expect } from '@playwright/test';

// Abre la página y dice si en algún momento pidió three.js.
async function abrirYVerSiPideThree(page) {
  let vio = false;
  page.on('request', (r) => { if (r.url().includes('three.module')) vio = true; });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  return vio;
}

test('escritorio carga WebGL', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  expect(await abrirYVerSiPideThree(page)).toBe(true);
  await expect(page.locator('#portada-gl')).toBeVisible();
  await expect(page.locator('.portada-css')).toBeHidden();
});

test('móvil no pide three.js y muestra la portada CSS', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  expect(await abrirYVerSiPideThree(page)).toBe(false);
  await expect(page.locator('.portada-css')).toBeVisible();
  await expect(page.locator('.portada-css .escena.nitida .frag').first()).toBeVisible();
});

test('movimiento reducido no pide three.js', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await abrirYVerSiPideThree(page)).toBe(false);
  await expect(page.locator('.portada-css')).toBeVisible();
});

test('sin WebGL cae a CSS', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.addInitScript(() => {
    const o = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : o.call(this, t, ...a); };
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.portada-css')).toBeVisible();
  await expect(page.locator('#portada-gl')).toBeHidden();
});

test('la escena de la portada cambia de idioma', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('.portada-css .escena.nitida')).toContainText('unfollowed you');
});

test('render se pausa fuera de pantalla', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.goto('/');
  await page.waitForFunction(() => window.__portada?.cuadros() > 5);
  await page.locator('#cv').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const a = await page.evaluate(() => window.__portada.cuadros());
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__portada.cuadros())).toBe(a);
});
