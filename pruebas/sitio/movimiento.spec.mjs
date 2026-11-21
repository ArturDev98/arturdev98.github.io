import { test, expect } from '@playwright/test';

const alFinal = (page) => page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('todo [data-revela] es visible y no hay html.anima', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html.listo')).toHaveCount(1);
    await expect(page.locator('html')).not.toHaveClass(/anima/);
    const opacidades = await page.locator('[data-revela]').evaluateAll((n) => n.map((x) => getComputedStyle(x).opacity));
    expect(opacidades.length).toBeGreaterThan(10);
    expect(opacidades.every((o) => o === '1')).toBe(true);
  });

  test('subrayados y línea de tiempo salen dibujados, sin cuenta', async ({ page }) => {
    await page.goto('/');
    const t = await page.locator('.sub-falla').evaluate((n) => getComputedStyle(n, '::after').transform);
    expect(t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
    const l = await page.locator('.linea').evaluate((n) => getComputedStyle(n).transform);
    expect(l === 'none' || l === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
    await expect(page.locator('.cifras-hero .valor')).toHaveText(['89', '2×', '~1 h']);
  });
});

test('con GSAP bloqueado no hay errores y todo es visible', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  await page.route('**/vendor/gsap*', (r) => r.abort());
  await page.route('**/vendor/ScrollTrigger*', (r) => r.abort());
  await page.goto('/');
  await expect(page.locator('html.listo')).toHaveCount(1);
  await expect(page.locator('html')).not.toHaveClass(/anima/);
  const opacidades = await page.locator('[data-revela]').evaluateAll((n) => n.map((x) => getComputedStyle(x).opacity));
  expect(opacidades.every((o) => o === '1')).toBe(true);
  await alFinal(page);
  await expect(page.locator('.contador')).toHaveText('6/6 suites · 0 fallas');
  expect(errores.filter((e) => !/ERR_FAILED|net::|Failed to load resource/i.test(e))).toEqual([]);
});

test('el valor final de las cifras ya está en el HTML', async ({ request }) => {
  const html = await (await request.get('/')).text();
  for (const v of ['>89<', '>2×<', '>~1 h<']) expect(html).toContain(v);
});

test('las cifras terminan en su valor tras contar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/anima/);
  await expect(page.locator('.cifras-hero .valor')).toHaveText(['89', '2×', '~1 h'], { timeout: 4000 });
});

test('al llegar al final: 6/6, cinco superadas y solo contacto en curso', async ({ page }) => {
  await page.goto('/');
  await alFinal(page);
  await expect(page.locator('.contador')).toHaveText('6/6 suites · 0 fallas');
  await expect(page.locator('.suites .punto[data-estado="superada"]')).toHaveCount(5);
  await expect(page.locator('.suites .punto[data-estado="en-curso"]')).toHaveCount(1);
  await expect(page.locator('.suites a[aria-current="true"]')).toHaveAttribute('href', '#contacto');
});

test('aria-current acompaña el scroll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.suites a[aria-current]')).toHaveCount(0);
  for (const id of ['experiencia', 'proyectos']) {
    await page.evaluate((i) => {
      const s = document.getElementById(i);
      window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + 40, behavior: 'instant' });
    }, id);
    await expect(page.locator('.suites a[aria-current="true"]')).toHaveAttribute('href', '#' + id);
    await expect(page.locator('.suites a[aria-current]')).toHaveCount(1);
  }
  await expect(page.locator('.suites .punto[data-estado="en-curso"]')).toHaveCount(1);
});

test('con movimiento, saltar al final revela todo lo saltado', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/anima/);
  await alFinal(page);
  await expect.poll(() => page.locator('[data-revela]').evaluateAll((n) => n.every((x) => getComputedStyle(x).opacity === '1')), { timeout: 5000 }).toBe(true);
});

test('la barra tiene fondo sólido al llegar a #herramientas', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.getElementById('herramientas').scrollIntoView({ behavior: 'instant' }));
  await expect(page.locator('.barra')).toHaveClass(/desplazada/);
  const fondo = await page.locator('.barra').evaluate((n) => getComputedStyle(n).backgroundColor);
  expect(fondo).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
});
