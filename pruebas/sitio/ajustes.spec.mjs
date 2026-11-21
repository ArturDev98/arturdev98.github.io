import { test, expect } from '@playwright/test';

const irA = (page, id) => page.evaluate((i) => {
  const s = document.getElementById(i);
  window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + 40, behavior: 'instant' });
}, id);
const esMovil = (info) => info.project.name === 'movil';

test('el botón de inicio aparece tras bajar una pantalla y vuelve arriba', async ({ page }) => {
  await page.goto('/');
  const b = page.locator('.arriba');
  await expect(b).toHaveAttribute('aria-label', 'Volver al inicio');
  await expect(b).toBeHidden();
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 2.2, behavior: 'instant' }));
  await expect(b).toBeVisible();
  await b.click();
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeLessThan(5);
  await expect(b).toBeHidden();
});

test('el botón de inicio tiene rótulo en inglés', async ({ page }) => {
  await page.goto('/?lang=en');
  await expect(page.locator('.arriba')).toHaveAttribute('aria-label', 'Back to top');
});

test('foto de «Sobre mí» centrada en móvil y a la derecha en escritorio', async ({ page }, info) => {
  await page.goto('/');
  const f = await page.locator('.foto').boundingBox();
  const c = await page.locator('.sobre').boundingBox();
  if (esMovil(info)) expect(Math.abs((f.x + f.width / 2) - (c.x + c.width / 2))).toBeLessThan(2);
  else expect(f.x + f.width).toBeGreaterThan(c.x + c.width - 2);
});

test('«Ver más» enlaza a #sobre-mi, está en la primera pantalla y se va al bajar', async ({ page }, info) => {
  await page.goto('/');
  const v = page.locator('.ver-mas');
  await expect(v).toHaveAttribute('href', '#sobre-mi');
  await expect(v).toBeVisible();
  const r = await v.boundingBox();
  const vp = page.viewportSize();
  expect(r.y + r.height).toBeLessThanOrEqual(vp.height);
  if (esMovil(info)) expect(vp.width - (r.x + r.width)).toBeLessThan(24);
  else expect(Math.abs(r.x + r.width / 2 - vp.width / 2)).toBeLessThan(2);
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
  await expect(v).toBeHidden();
  // Relevo en la misma esquina: nunca se ven a la vez.
  for (const y of [0, 200, 700, 1500, 3000]) {
    await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), y);
    await page.waitForTimeout(450);
    const visibles = await page.evaluate(() => ['.ver-mas', '.arriba'].filter((q) => getComputedStyle(document.querySelector(q)).visibility === 'visible' && getComputedStyle(document.querySelector(q)).opacity > 0.05).length);
    expect(visibles).toBeLessThanOrEqual(1);
  }
});

test('suites: bajar a #proyectos y volver a #experiencia deja #proyectos pendiente', async ({ page }) => {
  await page.goto('/');
  await irA(page, 'proyectos');
  await expect(page.locator('.suites a[aria-current="true"]')).toHaveAttribute('href', '#proyectos');
  await expect(page.locator('.suites .punto[data-estado="superada"]')).toHaveCount(2);
  await expect(page.locator('.contador')).toHaveText('2/6 suites · 0 fallas');
  await irA(page, 'experiencia');
  await expect(page.locator('.suites a[aria-current="true"]')).toHaveAttribute('href', '#experiencia');
  await expect(page.locator('.suites a[aria-current]')).toHaveCount(1);
  await expect(page.locator('.suites a[href="#proyectos"] .punto')).toHaveAttribute('data-estado', 'pendiente');
  await expect(page.locator('.suites .punto[data-estado="superada"]')).toHaveCount(1);
  await expect(page.locator('.contador')).toHaveText('1/6 suites · 0 fallas');
});

test.describe('menú móvil', () => {
  test.beforeEach(async ({}, info) => { test.skip(!esMovil(info)); });

  test('abre y cierra con clic, Escape, toque fuera y al elegir sección', async ({ page }) => {
    await page.goto('/');
    const r = page.locator('.menu summary');
    await expect(r).toContainText('Menú');
    await expect(r).toHaveAttribute('aria-controls', 'menu-panel');
    await expect(r).toHaveAttribute('aria-expanded', 'false');
    await r.click();
    await expect(r).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menu-panel')).toBeVisible();
    await r.click();
    await expect(r).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#menu-panel')).toBeHidden();

    await r.click();
    await page.keyboard.press('Escape');
    await expect(r).toHaveAttribute('aria-expanded', 'false');

    await r.click();
    await page.mouse.click(200, 30);
    await expect(r).toHaveAttribute('aria-expanded', 'false');

    await r.click();
    await page.locator('.suites a[href="#proyectos"]').click();
    await expect(r).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => page.evaluate(() => document.getElementById('proyectos').getBoundingClientRect().top), { timeout: 5000 }).toBeLessThan(200);
  });

  test('en el menú solo la sección actual está resaltada', async ({ page }) => {
    await page.goto('/');
    await irA(page, 'proyectos');
    await page.locator('.menu summary').click();
    await expect(page.locator('.suites a[aria-current]')).toHaveCount(1);
    await expect(page.locator('.suites .punto[data-estado="en-curso"]')).toHaveCount(1);
  });
});

test('la red de fondo existe, queda detrás y no genera errores', async ({ page }, info) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  await page.goto('/');
  await expect(page.locator('canvas.red')).toHaveCount(1);
  await expect(page.locator('canvas.red')).toHaveCSS('z-index', '-1');
  const n = await page.evaluate(() => window.__red.nodos());
  expect(n).toBeGreaterThan(5);
  if (!esMovil(info)) {
    const c0 = await page.evaluate(() => window.__red.cuadros());
    await page.mouse.move(900, 300);
    await page.waitForTimeout(300);
    await page.mouse.click(900, 300);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__red.cuadros())).toBeGreaterThan(c0 + 3);
  }
  expect(errores).toEqual([]);
});

test('la red no se pide en modulepreload y llega después de la carga', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).not.toMatch(/modulepreload[^>]*red\.js/);
});

test.describe('red con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('se dibuja una vez y no anima', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas.red')).toHaveCount(1);
    const c0 = await page.evaluate(() => window.__red.cuadros());
    await page.mouse.move(500, 300);
    await page.mouse.click(500, 300);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.__red.cuadros())).toBe(c0);
    expect(c0).toBeGreaterThan(0);
  });
});
