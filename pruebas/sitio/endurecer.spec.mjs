import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gzipSync } from 'node:zlib';

const LANGS = [['es', '/'], ['en', '/?lang=en']];

// Mide LCP y CLS desde antes de que cargue el documento.
const OBSERVAR = () => {
  window.__m = { lcp: 0, cls: 0 };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; })
    .observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; })
    .observe({ type: 'layout-shift', buffered: true });
};

async function recorrer(page) {
  const alto = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < alto; y += 600) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(60); }
  await page.waitForTimeout(400);
}

test('peso en móvil: HTML+CSS+JS propio + GSAP < 150 KB comprimido', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  let total = 0;
  const lista = [];
  const pendientes = [];
  page.on('response', (r) => {
    const u = new URL(r.url());
    if (u.origin !== 'http://127.0.0.1:4173') return;
    if (!/(\/|\.html|\.css|\.js)$/.test(u.pathname) || /three/.test(u.pathname)) return;
    pendientes.push(r.body().then((b) => { const g = gzipSync(b).length; total += g; lista.push([u.pathname, g]); }));
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await Promise.all(pendientes);
  console.log('peso gzip (B):', total, JSON.stringify(lista));
  expect(lista.some(([p]) => /gsap/i.test(p)), 'GSAP cargado').toBe(true);
  expect(total).toBeLessThan(150 * 1024);
});

test('CLS < 0,05 aunque las fuentes tarden 1,2 s (el respaldo no mueve el diseño)', async ({ page }, info) => {
  await page.route('**/fonts/*.woff2', async (r) => { await new Promise((ok) => setTimeout(ok, 1200)); await r.continue(); });
  await page.addInitScript(OBSERVAR);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await recorrer(page);
  const m = await page.evaluate(() => window.__m);
  console.log(`${info.project.name} fuentes lentas: CLS ${m.cls.toFixed(4)}`);
  expect(m.cls).toBeLessThan(0.05);
});

for (const [lang, ruta] of LANGS) {
  test(`LCP < 2,5 s y CLS < 0,05 (${lang})`, async ({ page }, info) => {
    await page.addInitScript(OBSERVAR);
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    await recorrer(page);
    const m = await page.evaluate(() => window.__m);
    console.log(`${info.project.name} ${lang}: LCP ${m.lcp.toFixed(0)} ms, CLS ${m.cls.toFixed(4)}`);
    expect(m.lcp).toBeGreaterThan(0);
    expect(m.lcp).toBeLessThan(2500);
    expect(m.cls).toBeLessThan(0.05);
  });

  test(`axe wcag2a/2aa sin graves ni críticas (${lang})`, async ({ page }, info) => {
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    console.log(`axe ${info.project.name} ${lang}:`, r.violations.map((v) => `${v.id}(${v.impact}) x${v.nodes.length}`).join(', ') || 'ninguna');
    const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });
}

test('teclado: salto, barra, idiomas y CTAs con foco visible', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.goto('/');
  await page.waitForFunction(() => document.documentElement.classList.contains('listo'));
  const esperado = ['Saltar al contenido', 'Apps', 'CV', 'ES', 'EN', 'Ver proyectos', 'CV'];
  for (const nombre of esperado) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      const lum = (c) => { const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const suelo = lum('rgb(14,22,28)');
      const l = lum(cs.outlineColor);
      const r = suelo > l ? (suelo + 0.05) / (l + 0.05) : (l + 0.05) / (suelo + 0.05);
      const box = el.getBoundingClientRect();
      return { txt: el.textContent.trim(), estilo: cs.outlineStyle, ancho: parseFloat(cs.outlineWidth), contraste: r, visible: box.top >= 0 && box.bottom <= innerHeight };
    });
    expect(f.txt).toBe(nombre);
    expect(f.estilo).not.toBe('none');
    expect(f.ancho).toBeGreaterThanOrEqual(2);
    expect(f.contraste).toBeGreaterThanOrEqual(3);
    expect(f.visible).toBe(true);
  }
});

test('pytest en EN cabe en 390 px sin desbordar', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  await page.goto('/?lang=en');
  await page.locator('[data-demo="pytest"]').evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForFunction(() => window.__demos && window.__demos.pytest);
  const d = await page.locator('.py').evaluate((n) => ({
    v: n.scrollHeight - n.clientHeight, h: n.scrollWidth - n.clientWidth,
    corte: [...n.querySelectorAll('.py-cuerpo > *')].some((c) => c.getBoundingClientRect().bottom > n.getBoundingClientRect().bottom),
  }));
  expect(d.v).toBeLessThanOrEqual(0);
  expect(d.h).toBeLessThanOrEqual(0);
  expect(d.corte).toBe(false);
});

test('og:title y og:description cambian con el idioma', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.goto('/?lang=en');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /I find the bug/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Arturo Isaza · QA Automation · SDET');
  await page.getByRole('button', { name: 'ES', exact: true }).click();
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /Encuentro la falla/);
});

test('informe: axe en /apps/ (solo se reporta, no se corrige)', async ({ page }, info) => {
  // Con movimiento reducido /apps/ no corre WebGL y no ahoga a los otros workers.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/apps/');
  await page.waitForLoadState('load');
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  console.log(`axe apps ${info.project.name}:`, r.violations.map((v) => `${v.id}(${v.impact}) x${v.nodes.length}`).join(', ') || 'ninguna');
});
