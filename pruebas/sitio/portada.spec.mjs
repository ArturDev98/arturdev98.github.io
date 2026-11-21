import { test, expect } from '@playwright/test';

const pideGl = (u) => /three\.module|fondo-gl/.test(u);

function vigilar(page) {
  const pedidos = [], errores = [];
  page.on('request', (r) => pedidos.push(r.url()));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(String(e)));
  return { pedidos, errores };
}

const cuadros = (page) => page.evaluate(() => window.__fondo.cuadros());

test('móvil no pide three.js ni fondo-gl y usa el fondo CSS', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  const v = vigilar(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(v.pedidos.filter(pideGl)).toEqual([]);
  await expect(page.locator('.fondo.fondo-css .celda-falla')).toHaveCount(1);
});

test('escritorio carga WebGL y la versión CSS se retira', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  const v = vigilar(page);
  await page.goto('/');
  await expect(page.locator('.fondo.fondo-gl canvas')).toHaveCount(1);
  await expect(page.locator('.fondo.fondo-css')).toHaveCount(0);
  expect(v.pedidos.some((u) => u.includes('three.module'))).toBe(true);
  expect(v.errores).toEqual([]);
});

test('sin WebGL cae al CSS sin errores de consola', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.addInitScript(() => {
    const o = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : o.call(this, t, ...a); };
  });
  const v = vigilar(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.fondo.fondo-css')).toHaveCount(1);
  await expect(page.locator('.fondo.fondo-gl')).toHaveCount(0);
  expect(v.pedidos.filter(pideGl)).toEqual([]);
  expect(v.errores).toEqual([]);
});

test('el render se pausa fuera de pantalla', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.goto('/');
  await page.waitForFunction(() => window.__fondo?.cuadros() > 5);
  await page.locator('#contacto').scrollIntoViewIfNeeded();
  // Se espera a que el contador se estabilice en vez de un tiempo fijo.
  let previo = -1;
  await expect.poll(async () => { const c = await cuadros(page); const quieto = c === previo; previo = c; return quieto; }, { timeout: 10000, intervals: [300] }).toBe(true);
  const a = await cuadros(page);
  await page.waitForTimeout(500);
  expect(await cuadros(page)).toBe(a);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => cuadros(page), { timeout: 10000 }).toBeGreaterThan(a);
});

test('con la pestaña oculta el fondo deja de pedir cuadros', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.goto('/');
  await page.waitForFunction(() => window.__fondo?.cuadros() > 5);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  let previo = -1;
  await expect.poll(async () => { const c = await cuadros(page); const quieto = c === previo; previo = c; return quieto; }, { timeout: 10000, intervals: [300] }).toBe(true);
  const a = await cuadros(page);
  await page.waitForTimeout(500);
  expect(await cuadros(page)).toBe(a);
});

test('el fondo CSS lleva .fuera al salir de pantalla y .pausa con la pestaña oculta', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  await page.goto('/');
  const fondo = page.locator('.fondo');
  await expect(fondo).not.toHaveClass(/fuera/);
  await page.locator('#contacto').evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(fondo).toHaveClass(/fuera/);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(fondo).toHaveClass(/pausa/);
});

test('movimiento reducido: sin three.js y con el estado final fijo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const v = vigilar(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(v.pedidos.filter(pideGl)).toEqual([]);
  await expect(page.locator('.fondo.fondo-css')).toHaveCount(1);
  await expect(page.locator('.celda-ok')).toHaveCSS('opacity', '1');
  await expect(page.locator('.celda-ok')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.celda-falla')).toBeHidden();
  await expect(page.locator('.barrido')).toBeHidden();
  await expect(page.locator('.metrica')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test('el h1 es visible y trae texto en el primer pintado, sin módulos', async ({ page }) => {
  await page.route('**/assets/*.js', (r) => r.abort());
  await page.goto('/');
  const h1 = page.locator('#h-inicio');
  await expect(h1).toBeVisible();
  expect((await h1.textContent()).trim().length).toBeGreaterThan(10);
  await expect(h1).toHaveCSS('opacity', '1');
});
