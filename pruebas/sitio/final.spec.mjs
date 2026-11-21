import { test, expect } from '@playwright/test';

const BASE = 'https://arturdev98.github.io';
const IMG = BASE + '/og.png?v=4';
const META = [
  ['meta[property="og:type"]', 'content', 'website'],
  ['meta[property="og:url"]', 'content', BASE + '/'],
  ['meta[property="og:title"]', 'content', 'Arturo Isaza · QA Automation · SDET'],
  ['meta[property="og:description"]', 'content', 'Encuentro la falla, la corrijo en el código y lo demuestro con datos.'],
  ['meta[property="og:image"]', 'content', IMG],
  ['meta[property="og:image:width"]', 'content', '2400'],
  ['meta[property="og:image:height"]', 'content', '1254'],
  ['meta[property="og:image:alt"]', 'content', null],
  ['meta[property="og:locale"]', 'content', 'es_CO'],
  ['meta[property="og:locale:alternate"]', 'content', 'en_US'],
  ['meta[name="twitter:card"]', 'content', 'summary_large_image'],
  ['meta[name="twitter:image"]', 'content', IMG],
  ['link[rel="canonical"]', 'href', BASE + '/'],
];

test('los iconos del head responden 200', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((l) => l.map((x) => x.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThanOrEqual(2);
  for (const h of hrefs) expect((await request.get(h)).status(), h).toBe(200);
});

test('cada metadato está una sola vez y con su valor', async ({ page }) => {
  await page.goto('/');
  for (const [sel, atr, valor] of META) {
    const el = page.locator(sel);
    await expect(el, sel).toHaveCount(1);
    const v = await el.getAttribute(atr);
    if (valor === null) expect(v.length).toBeGreaterThan(20);
    else expect(v, sel).toBe(valor);
  }
});

test('el JSON-LD es válido y trae los campos', async ({ page }) => {
  await page.goto('/');
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(bloques).toHaveLength(1);
  const p = JSON.parse(bloques[0]);
  expect(p['@type']).toBe('Person');
  expect(p.name).toBe('Neiver Arturo Isaza Codezo');
  expect(p.alternateName).toBe('Arturo Isaza');
  expect(p.jobTitle).toBe('QA Automation · SDET');
  expect(p.url).toBe(BASE + '/');
  expect(p.image).toBe(BASE + '/cv/foto.webp');
  expect(p.address).toMatchObject({ addressLocality: 'Bucaramanga', addressCountry: 'CO' });
  expect(p.sameAs).toEqual(['https://github.com/ArturDev98', 'https://www.linkedin.com/in/arturo-isaza-qa', BASE + '/cv/']);
});

test('og.png mide 2400×1254 y pesa menos de 600 KB', async ({ request }) => {
  const r = await request.get('/og.png');
  expect(r.status()).toBe(200);
  const b = await r.body();
  expect(b.subarray(1, 4).toString()).toBe('PNG');
  expect(b.readUInt32BE(16)).toBe(2400);
  expect(b.readUInt32BE(20)).toBe(1254);
  expect(b.length).toBeLessThan(600 * 1024);
});

test('el head no lleva teléfono ni correo', async ({ page }) => {
  await page.goto('/');
  const head = await page.locator('head').evaluate((h) => h.innerHTML);
  expect(head).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
  expect(head).not.toMatch(/\+?\d[\d\s().-]{8,}\d/);
});
