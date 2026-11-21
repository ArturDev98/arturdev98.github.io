import { test, expect } from '@playwright/test';

const IDS = ['inicio', 'sobre-mi', 'experiencia', 'proyectos', 'mas-proyectos', 'herramientas', 'contacto'];

test('las secciones salen en orden y sin ids de las apps', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('main section[id]').evaluateAll((s) => s.map((x) => x.id))).toEqual(IDS);
  for (const id of ['followapp', 'shield', 'movil', 'cv']) await expect(page.locator('#' + id)).toHaveCount(0);
  await expect(page.locator('.suites .punto[data-estado="pendiente"]')).toHaveCount(6);
  await expect(page.locator('.contador')).toHaveText('0/6 suites · 0 fallas');
});

test('un solo h1 con la tesis y las dos frases subrayables', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Encuentro la falla, la corrijo en el código y lo demuestro con datos.');
  await expect(page.locator('h1 .sub-falla')).toHaveText('la falla');
  await expect(page.locator('h1 .sub-datos')).toHaveText('con datos');
});

test('enlaces exactos', async ({ page }) => {
  await page.goto('/');
  const href = (sel) => page.locator(sel).first().getAttribute('href');
  expect(await href('a:has-text("Ver proyectos")')).toBe('#proyectos');
  expect(await href('.inicio a[href^="/cv/"]')).toBe('/cv/?lang=es');
  expect(await href('.chip-apps')).toBe('/apps/');
  expect(await href('.barra a[href="/apps/"]')).toBe('/apps/');
  expect(await href('.pie a')).toBe('/apps/');
  const todos = await page.locator('a[href]').evaluateAll((a) => a.map((x) => x.getAttribute('href')));
  for (const h of [
    'https://arturdev98.github.io/ai-automatization/',
    'https://github.com/ArturDev98/ai-automatization',
    'https://github.com/ArturDev98/helpdesk-triage-agent',
    'https://github.com/ArturDev98/restful-booker-api-tests',
    'https://arturdev98.github.io/restful-booker-api-tests/',
    'https://chromewebstore.google.com/detail/chat-privacy-shield/gillcdhclnchpkbifcnipfckmapodjpm',
    '/apps/#shield',
    'https://github.com/ArturDev98/Chat-Privacy-Shield',
    '/apps/#followapp',
    'https://chromewebstore.google.com/detail/nffhilcgedjjoednagidnimjnembkdho',
    'https://best-cv-neon.vercel.app',
    'https://github.com/ArturDev98/git-team-insights',
    'https://github.com/ArturDev98/ci-image-notifier',
    'https://github.com/ArturDev98/elastic-explorer',
    'https://github.com/ArturDev98/merged_app',
    'https://arturdev98.github.io/wash-app-demo/',
    'https://www.linkedin.com/in/arturo-isaza-qa',
    'https://github.com/arturdev98',
    'mailto:testpbr9@gmail.com',
  ]) expect(todos, h).toContain(h);
});

test('las cuatro tarjetas destacadas reservan su medio', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.proyecto')).toHaveCount(4);
  const medios = await page.locator('.proyecto .medio').evaluateAll((m) => m.map((x) => [x.getAttribute('aria-hidden'), x.getBoundingClientRect().height > 100]));
  expect(medios).toEqual([[null, true], ['true', true], ['true', true], ['true', true]]);
  await expect(page.locator('.mas .ficha')).toHaveCount(7);
});

test('la foto trae su tamaño fijo', async ({ page }) => {
  await page.goto('/');
  const f = page.locator('img.foto');
  await expect(f).toHaveAttribute('src', '/cv/foto.webp');
  await expect(f).toHaveAttribute('width', '360');
  await expect(f).toHaveAttribute('height', '360');
});

test('frases prohibidas ausentes', async ({ page }) => {
  await page.goto('/');
  const html = (await page.content()).toLowerCase();
  for (const f of ['cobertura', 'coverage', 'senior', '57 pruebas', '57 tests']) expect(html, f).not.toContain(f);
  expect(html).not.toMatch(/\b\d+\s+(pasando|passing)\b/i);
  expect(html).not.toMatch(/tel:|\+57|\b3\d{9}\b/);
});

test('sin peticiones fuera de 127.0.0.1', async ({ page }) => {
  const ajenas = [];
  page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4173') && !r.url().startsWith('data:')) ajenas.push(r.url()); });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(ajenas).toEqual([]);
});

test('sin scroll horizontal a 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('la redirección conserva el idioma', async ({ page }) => {
  await page.goto('/?lang=en#shield');
  await expect(page).toHaveURL(/\/apps\/\?lang=en#shield$/);
});

test('los enlaces al CV llevan el idioma elegido', async ({ page }) => {
  await page.goto('/?lang=en');
  const hrefs = await page.locator('a[href^="/cv/"]').evaluateAll((a) => a.map((x) => x.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(0);
  expect(new Set(hrefs)).toEqual(new Set(['/cv/?lang=en']));
});

test('/#followapp redirige a /apps/#followapp', async ({ page }) => {
  await page.goto('/#followapp');
  await expect(page).toHaveURL(/\/apps\/#followapp$/);
});

test('/?lang=en muestra el h1 en inglés y deja los botones al día', async ({ page }) => {
  await page.goto('/?lang=en');
  await expect(page.locator('h1')).toHaveText('I find the bug, fix it in the code and prove it with data.');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#b-en')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.contador')).toHaveText('0/6 suites · 0 failures');
  await expect(page.locator('#contacto h2')).toHaveText('Hiring for QA Automation or SDET?');
  await expect(page.locator('.pie-linea')).toContainText('arturdev98 · no analytics');
});

test('ES/EN con botones cambia el texto, el título y la URL', async ({ page }) => {
  await page.goto('/?lang=es');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('#b-en')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#b-es')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('h1')).toContainText('I find');
  expect(page.url()).toContain('lang=en');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /I find the bug/);
});

test.describe('visitante en inglés', () => {
  test.use({ locale: 'en-US' });

  test('sale en inglés y no se mueve aunque el JS llegue tarde', async ({ page }) => {
    await page.route(/\.js$/, async (r) => { await new Promise((ok) => setTimeout(ok, 600)); await r.continue(); });
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
        .observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveText('I find the bug, fix it in the code and prove it with data.');
    await page.waitForLoadState('load');
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.__cls)).toBeLessThan(0.05);
  });
});

test.describe('visitante en inglés con red muy lenta', () => {
  test.use({ locale: 'en-US' });

  test('con los .js a 2 s termina en inglés', async ({ page }) => {
    await page.route(/\.js$/, async (r) => { await new Promise((ok) => setTimeout(ok, 2000)); await r.continue(); });
    await page.goto('/?lang=en', { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en', { timeout: 10000 });
    await expect(page.locator('h1')).toHaveText('I find the bug, fix it in the code and prove it with data.');
  });
});

test('el ES estático es igual al data-es (primer pintado == pintado)', async ({ page }) => {
  await page.route(/sitio\.js$/, (r) => r.abort());
  await page.goto('/?lang=es');
  const distintos = await page.locator('[data-es]').evaluateAll((n) =>
    n.filter((x) => x.textContent !== x.getAttribute('data-es')).map((x) => x.getAttribute('data-es').slice(0, 40)));
  expect(distintos).toEqual([]);
});

test.describe('visitante en inglés sin JS', () => {
  test.use({ locale: 'en-US' });

  test('si sitio.js falla, el contenido sale pronto y lang coincide con lo visible', async ({ page }) => {
    const errores = [];
    page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
    page.on('pageerror', (e) => errores.push(e.message));
    await page.route(/sitio\.js$/, (r) => r.abort());
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('body')).toHaveCSS('opacity', '1', { timeout: 1500 });
    await expect(page.locator('h1')).toContainText('Encuentro');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('#b-es')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#b-en')).toHaveAttribute('aria-pressed', 'false');
    expect(errores.filter((e) => !/sitio\.js|ERR_FAILED|net::/i.test(e))).toEqual([]);
  });
});

test('tipografía: Oxanium, Red Hat Text y Red Hat Mono cargadas y sin terceros', async ({ page }) => {
  const externas = [];
  page.on('request', (r) => { if (!/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(r.url())) externas.push(r.url()); });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const fam = (sel) => page.locator(sel).first().evaluate((n) => getComputedStyle(n).fontFamily.split(',')[0].replace(/["']/g, '').trim());
  expect(await fam('h1')).toBe('Oxanium');
  expect(await fam('#sobre-mi p:not(.etq)')).toBe('Red Hat Text');
  expect(await fam('.kicker')).toBe('Red Hat Mono');
  for (const f of ['700 20px Oxanium', '400 16px "Red Hat Text"', '500 13px "Red Hat Mono"']) {
    expect(await page.evaluate((x) => document.fonts.check(x), f), f).toBe(true);
  }
  expect(externas).toEqual([]);
});
