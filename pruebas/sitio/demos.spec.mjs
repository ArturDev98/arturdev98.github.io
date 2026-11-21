import { test, expect } from '@playwright/test';

const NOMBRES = ['pipeline', 'triage', 'pytest', 'shield'];

async function abrir(page, nombre, cargar = true) {
  if (cargar) {
    await page.goto('/');
    await expect(page.locator('html.listo')).toHaveCount(1);
  }
  await page.locator(`[data-demo="${nombre}"]`).evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForFunction((n) => window.__demos && window.__demos[n], nombre);
}

const op = (page, sel) => page.locator(sel).evaluate((n) => parseFloat(getComputedStyle(n).opacity));
const mover = (page, nombre, p) => page.evaluate(([n, v]) => window.__demos[n].progress(v), [nombre, p]);

test('ningún módulo de demo se pide al cargar y sí al acercarse', async ({ page }) => {
  const pedidos = [];
  page.on('request', (r) => pedidos.push(r.url()));
  await page.goto('/');
  await expect(page.locator('html.listo')).toHaveCount(1);
  await page.waitForTimeout(600);
  expect(pedidos.filter((u) => u.includes('/assets/proyectos/'))).toEqual([]);
  await page.locator('[data-demo="triage"]').evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect.poll(() => pedidos.some((u) => u.endsWith('/assets/proyectos/triage.js'))).toBe(true);
});

test('pipeline: la ficha espera en la revisión humana y aprueba', async ({ page }) => {
  await abrir(page, 'pipeline');
  await mover(page, 'pipeline', 0.5);
  expect(await op(page, '.pl-aprueba')).toBe(1);
  expect(await op(page, '.pl-nodo:nth-child(2) .pl-hecho')).toBe(1);
  expect(await op(page, '.pl-nodo:nth-child(3) .pl-hecho')).toBe(0);
  expect(await op(page, '.pl-nodo:nth-child(3) .pl-curso')).toBe(1);
  expect(await op(page, '.pl-nodo:nth-child(4) .pl-hecho')).toBe(0);
  expect(await op(page, '.pl-ficha')).toBe(1);
  const f = await page.locator('.pl-ficha').boundingBox();
  const g = await page.locator('.pl-nodo:nth-child(3) .pl-marca').boundingBox();
  expect(Math.abs(f.x + f.width / 2 - (g.x + g.width / 2))).toBeLessThan(3);
  await mover(page, 'pipeline', 1);
  for (let i = 1; i <= 5; i++) expect(await op(page, `.pl-nodo:nth-child(${i}) .pl-hecho`)).toBe(1);
  expect(await op(page, '.pl-aprueba')).toBe(1);
  expect(await op(page, '.pl-ficha')).toBe(0);
});

test('triage: los tickets llegan, se clasifican y reciben causa', async ({ page }) => {
  await abrir(page, 'triage');
  await mover(page, 'triage', 0.5);
  expect(await op(page, '.tr-fila:nth-of-type(1) .tr-causa')).toBe(1);
  expect(await op(page, '.tr-fila:nth-of-type(1) .tr-punto .v')).toBe(1);
  const medio = await op(page, '.tr-fila:nth-of-type(2) .tr-causa');
  expect(medio).toBeGreaterThan(0);
  expect(medio).toBeLessThan(1);
  expect(await op(page, '.tr-fila:nth-of-type(3)')).toBe(0);
  await mover(page, 'triage', 1);
  for (let i = 1; i <= 3; i++) {
    expect(await op(page, `.tr-fila:nth-of-type(${i}) .tr-causa`)).toBe(1);
    expect(await op(page, `.tr-fila:nth-of-type(${i}) .tr-punto .v`)).toBe(1);
    expect(await op(page, `.tr-fila:nth-of-type(${i}) .tr-punto .a`)).toBe(0);
  }
});

test('pytest: casos que pasan, hallazgos marcados y totales del repo', async ({ page }) => {
  await abrir(page, 'pytest');
  await mover(page, 'pytest', 0.5);
  expect(await op(page, '.py-l:nth-child(7)')).toBe(1);
  expect(await op(page, '.py-l:nth-child(9)')).toBe(0);
  expect(await op(page, '.py-prog .c')).toBe(1);
  expect(await op(page, '.py-res')).toBe(0);
  await mover(page, 'pytest', 1);
  for (let i = 1; i <= 8; i++) expect(await op(page, `.py-l:nth-child(${i + 1})`)).toBe(1);
  expect(await op(page, '.py-prog .v')).toBe(1);
  expect(await op(page, '.py-res')).toBe(1);
  await expect(page.locator('.py-res')).toHaveText('30 casos · 16 hallazgos');
  await expect(page.locator('.py-l.hall').first()).toContainText('HALLAZGO');
});

test('shield: la fila revelada cambia y el resto sigue difuminado', async ({ page }) => {
  await abrir(page, 'shield');
  await mover(page, 'shield', 0.5);
  expect(await op(page, '.sh-fila:nth-child(2) .sh-claro')).toBe(1);
  expect(await op(page, '.sh-fila:nth-child(4) .sh-claro')).toBe(0);
  expect(await page.locator('.sh-borroso').first().evaluate((n) => getComputedStyle(n).filter)).toContain('blur');
  await mover(page, 'shield', 1);
  expect(await op(page, '.sh-fila:nth-child(2) .sh-claro')).toBe(0);
  expect(await op(page, '.sh-fila:nth-child(4) .sh-claro')).toBe(1);
});

test('shield: el cursor (o el toque) del visitante revela la fila', async ({ page, isMobile }) => {
  await abrir(page, 'shield');
  const fila = page.locator('.sh-fila').first();
  if (isMobile) await fila.tap();
  else await fila.hover();
  await expect.poll(() => op(page, '.sh-fila:nth-child(1) .sh-claro')).toBe(1);
  expect(await op(page, '.sh-fila:nth-child(4) .sh-claro')).toBe(0);
});

const TEXTO = {
  pipeline: ['.pl-aprueba', 'aprueba', 'approves'],
  triage: ['.tr-titulo', 'No puedo iniciar sesión', "I can't sign in"],
  pytest: ['.py-res .g', '30 casos', '30 cases'],
  shield: ['.sh-fila:nth-child(4) .sh-claro b', 'Banco', 'Bank'],
};
// Un elemento cuyo estado depende del progreso, para comprobar que el idioma no reinicia.
const ESTADO = {
  pipeline: '.pl-ficha',
  triage: '.tr-fila:nth-of-type(1)',
  pytest: '.py-l:nth-child(2)',
  shield: '.sh-fila:nth-child(4) .sh-claro',
};

for (const n of NOMBRES) {
  test(`${n}: cambiar de idioma a mitad no mueve el alto ni reinicia`, async ({ page }) => {
    await abrir(page, n);
    await mover(page, n, 0.5);
    const caja = page.locator(`[data-demo="${n}"]`);
    const [sel, es, en] = TEXTO[n];
    await expect(page.locator(sel).first()).toHaveText(es);
    const antes = (await caja.boundingBox()).height;
    const estado = await op(page, ESTADO[n]);
    await page.locator('#b-en').click();
    await expect(page.locator(sel).first()).toHaveText(en);
    await page.waitForTimeout(250);
    expect(Math.abs((await caja.boundingBox()).height - antes)).toBeLessThanOrEqual(1);
    expect(await op(page, ESTADO[n])).toBe(estado);
    await page.locator('#b-es').click();
    await expect(page.locator(sel).first()).toHaveText(es);
  });
}

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('todas las demos muestran su estado final y no se mueven', async ({ page }) => {
    for (const [i, n] of NOMBRES.entries()) await abrir(page, n, i === 0);
    for (const n of NOMBRES) await page.locator(`[data-demo="${n}"]`).evaluate((x) => x.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(1500);
    for (let i = 1; i <= 5; i++) expect(await op(page, `.pl-nodo:nth-child(${i}) .pl-hecho`)).toBe(1);
    expect(await op(page, '.pl-aprueba')).toBe(1);
    expect(await op(page, '.pl-ficha')).toBe(0);
    for (let i = 1; i <= 3; i++) {
      expect(await op(page, `.tr-fila:nth-of-type(${i}) .tr-causa`)).toBe(1);
      expect(await op(page, `.tr-fila:nth-of-type(${i}) .tr-punto .v`)).toBe(1);
    }
    expect(await op(page, '.py-res')).toBe(1);
    expect(await op(page, '.py-l:nth-child(9)')).toBe(1);
    expect(await op(page, '.sh-fila:nth-child(4) .sh-claro')).toBe(1);
    expect(await op(page, '.sh-fila:nth-child(2) .sh-claro')).toBe(0);
  });
});

test('sin errores en consola al recorrer las cuatro demos', async ({ page }) => {
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', (e) => errores.push(String(e)));
  for (const [i, n] of NOMBRES.entries()) await abrir(page, n, i === 0);
  await page.waitForTimeout(800);
  expect(errores).toEqual([]);
});
