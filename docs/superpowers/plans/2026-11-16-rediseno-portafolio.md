# Rediseño de la portada de arturdev98.github.io · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la portada actual por una con demos animadas de las tres apps y una portada
WebGL de "vidrio empañado" solo en ordenador, ligera y animada en móvil.

**Architecture:** Sitio estático sin compilación. `index.html` con el contenido bilingüe;
`assets/main.js` (módulo ES) decide el modo (ordenador/móvil/movimiento reducido), monta las demos y
carga `assets/portada-gl.js` con `import()` solo cuando toca. GSAP y ScrollTrigger se cargan como
scripts clásicos (globales). Pruebas con Playwright en `pruebas/`, contra un servidor estático
propio.

**Tech Stack:** HTML, CSS, JavaScript (módulos ES), three.js 0.170.0, GSAP 3.12.5 + ScrollTrigger,
fuentes woff2 de Fontsource, Playwright 1.48.2 para las pruebas.

**Spec:** `docs/superpowers/specs/2026-11-16-rediseno-portafolio-design.md`

## Global Constraints

- Node: el global es 16 y Playwright pide ≥ 20. Usar
  `%LOCALAPPDATA%\nvm\v22.18.0\node.exe` y su `npx.cmd`; no cambiar la versión global.
- Sin paso de compilación; librerías en `vendor/`, fuentes en `fonts/`, nada desde CDN ni Google Fonts.
- Archivo `.nojekyll` en la raíz para que GitHub Pages sirva todo tal cual.
- Colores: fondo `#0E161C`, tinta `#E8EFF3`, secundaria `#B9CAD4`, reglas `#24333C`; FollowApp
  `#4FC7D1`, Chat Privacy Shield `#6FBE8C`, Best CV `#E9B35A`.
- Tipografías: Archivo 700/800, JetBrains Mono 400/500, Source Serif 4 400/600.
- WebGL solo si `pointer: fine`, ancho ≥ 900 px, hay WebGL y no hay `prefers-reduced-motion`.
- `devicePixelRatio` del render limitado a 1.5.
- Móvil: JS propio + GSAP < 150 KB comprimido (gzip); three.js nunca se pide.
- Enlaces exactos: FollowApp `https://chromewebstore.google.com/detail/nffhilcgedjjoednagidnimjnembkdho`,
  privacidad `https://arturdev98.github.io/followapp/`, Shield
  `https://chromewebstore.google.com/detail/chat-privacy-shield/gillcdhclnchpkbifcnipfckmapodjpm`,
  Best CV `https://best-cv-neon.vercel.app`.
- Pie: aviso de no afiliación y GitHub; **sin** enlaces a `/cv/` ni al proyecto de QA.
- Bilingüe con `data-es` / `data-en`; el idioma del navegador decide el de partida.
- Comentarios de máximo 2 líneas. Commits en español, sin líneas de atribución.

## Review Focus

1. Cambiar de idioma con una demo a medias: los textos de la demo pasan al otro idioma sin
   reiniciar la página (prueba en Task 4).
2. Tocar con el dedo la demo de Chat Privacy Shield en móvil: revela, igual que el cursor (Task 5).
3. Pantalla de 390 px en inglés: ningún texto produce scroll horizontal (Task 2).
4. Redimensionar de ordenador a móvil con la página abierta: sin errores en consola (Task 7).
5. Portada fuera de pantalla o pestaña oculta: el render WebGL deja de pedir cuadros (Task 3).

## Estructura de archivos

```
index.html                 contenido y metadatos
.nojekyll
assets/sitio.css           identidad, maquetación, portada CSS, demos
assets/main.js             idioma, aviso de móvil, modo, demos, ScrollTrigger
assets/portada-gl.js       escena three.js (perezosa)
assets/demos/followapp.js  demo FollowApp
assets/demos/shield.js     demo Chat Privacy Shield
assets/demos/cv.js         demo Best CV
assets/textos.js           textos de las demos en ES/EN
vendor/three.module.min.js, vendor/gsap.min.js, vendor/ScrollTrigger.min.js
fonts/*.woff2
favicon.svg, apple-touch-icon.png, og.png
pruebas/package.json, pruebas/playwright.config.mjs, pruebas/servidor.mjs, pruebas/*.spec.mjs
```

---

### Task 1: Base: pruebas, fuentes locales y el sitio actual partido en archivos

**Files:**
- Create: `pruebas/package.json`, `pruebas/playwright.config.mjs`, `pruebas/servidor.mjs`,
  `pruebas/base.spec.mjs`, `.gitignore`, `.nojekyll`, `assets/sitio.css`, `assets/main.js`, `fonts/*.woff2`
- Modify: `index.html` (sacar `<style>` y `<script>`, quitar Google Fonts)

**Interfaces:**
- Produces: `servidor.mjs` sirve la raíz del repo en `http://127.0.0.1:4173`; en `main.js`,
  `pintar(idioma: 'es'|'en'): void` y el evento `document` `'idioma'` con `detail: { idioma }`
  que emite `pintar` (las demos lo escuchan).

- [ ] **Step 1: Montar pruebas.** `pruebas/package.json` con `"@playwright/test": "1.48.2"` y script
  `"test": "playwright test"`; config con `webServer: { command: 'node servidor.mjs', port: 4173 }`,
  proyectos `escritorio` (1440×900) y `movil` (devices `Pixel 7`). `servidor.mjs`: `http` nativo,
  tipos MIME para html/css/js/mjs/svg/png/woff2. `.gitignore`: `pruebas/node_modules/`,
  `pruebas/test-results/`, `pruebas/playwright-report/`. En `pruebas/`, con el npm de Node 22:
  `npm install` y `npx playwright install chromium`.

- [ ] **Step 2: Escribir `base.spec.mjs` (debe fallar)**

```js
test('no pide nada a terceros', async ({ page }) => {
  const ajenas = [];
  page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4173')) ajenas.push(r.url()); });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(ajenas).toEqual([]);
});
test('ES/EN cambia los textos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Small tools that ask you for nothing');
});
test('aviso de móvil solo en móvil', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.locator('#movil')).toBeVisible({ visible: info.project.name === 'movil' });
});
test('copiar enlace avisa', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'movil');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.locator('#copiar').click();
  await expect(page.locator('#dicho')).toHaveText(/Enlace copiado|Link copied/);
});
```

- [ ] **Step 3: Correr y ver fallar.** `npx playwright test base.spec.mjs` → falla "no pide nada a
  terceros" (Google Fonts) y el titular (hoy es `h2`).

- [ ] **Step 4: Implementar.** Bajar con `npm pack` los woff2 latin de `@fontsource/archivo` (700,
  800), `@fontsource/jetbrains-mono` (400, 500), `@fontsource/source-serif-4` (400, 600) a `fonts/`
  y declararlos con `@font-face` + `font-display: swap` en `sitio.css`. Mover estilos y script
  actuales a `sitio.css` / `main.js` (`<script type="module">`), el titular pasa a `h1` y la marca
  "arturdev98" a un `p`. Crear `.nojekyll` vacío.

- [ ] **Step 5: Correr y ver pasar.** Mismo comando → 4 pruebas × 2 proyectos en verde (la de
  copiar se omite en escritorio).

- [ ] **Step 6: Commit** `Base del rediseño: pruebas con Playwright, fuentes locales y estilos y script en archivos`

### Task 2: Identidad y maquetación nuevas

**Files:**
- Modify: `index.html`, `assets/sitio.css`
- Test: `pruebas/maqueta.spec.mjs`

**Interfaces:**
- Produces: secciones `section.app#followapp`, `#shield`, `#cv`, cada una con `.app-texto`,
  `.demo[data-demo="followapp|shield|cv"]` vacío y `a.cta`; portada `section#portada` con
  `.portada-css` y `canvas#portada-gl[hidden]`; variables CSS `--tono` por sección.

- [ ] **Step 1: Prueba que falla**

```js
test('tres apps con su CTA exacto', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#followapp a.cta')).toHaveAttribute('href', 'https://chromewebstore.google.com/detail/nffhilcgedjjoednagidnimjnembkdho');
  await expect(page.locator('#shield a.cta')).toHaveAttribute('href', 'https://chromewebstore.google.com/detail/chat-privacy-shield/gillcdhclnchpkbifcnipfckmapodjpm');
  await expect(page.locator('#cv a.cta')).toHaveAttribute('href', 'https://best-cv-neon.vercel.app');
  await expect(page.locator('#followapp a[href="https://arturdev98.github.io/followapp/"]')).toBeVisible();
});
test('pie sin CV ni proyecto de QA', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href*="/cv"], footer a[href*="ai-automatization"]')).toHaveCount(0);
  await expect(page.locator('footer')).toContainText('github.com/arturdev98');
});
test('sin scroll horizontal en 390 px, ES y EN', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const l of ['ES', 'EN']) {
    await page.getByRole('button', { name: l }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
});
```

- [ ] **Step 2: Ver fallar** (`#followapp` no existe).
- [ ] **Step 3: Implementar** la estructura del boceto del spec: cabecera, portada, aviso móvil,
  tres secciones numeradas `01–03` en dos columnas desde 900 px (texto | demo) y una columna abajo,
  cada lista de funciones recortada a 3 puntos, pie. Titulares Archivo 800 grandes y apretados,
  `--tono` por sección solo en número, etiqueta y CTA.
- [ ] **Step 4: Ver pasar** las pruebas de Task 1 y Task 2.
- [ ] **Step 5: Commit** `Identidad y maquetación nuevas de la portada`

### Task 3: Portada: versión CSS y versión WebGL

**Files:**
- Create: `assets/portada-gl.js`, `vendor/three.module.min.js` (de `three@0.170.0/build/`)
- Modify: `assets/main.js`, `assets/sitio.css`
- Test: `pruebas/portada.spec.mjs`

**Interfaces:**
- Produces: en `main.js`, `debeUsarWebGL(): boolean` (las cuatro condiciones de Global
  Constraints); en `portada-gl.js`, `export function iniciarPortada(canvas: HTMLCanvasElement):
  { detener(): void, cuadros(): number }`. `main.js` deja `window.__portada` con ese objeto para las
  pruebas.

- [ ] **Step 1: Pruebas que fallan**

```js
const pideThree = (page) => new Promise((ok) => {
  let vio = false;
  page.on('request', (r) => { if (r.url().includes('three.module')) vio = true; });
  page.waitForLoadState('networkidle').then(() => ok(vio));
});
test('escritorio carga WebGL', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  const p = pideThree(page); await page.goto('/');
  expect(await p).toBe(true);
  await expect(page.locator('#portada-gl')).toBeVisible();
});
test('móvil no pide three.js y muestra la portada CSS', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  const p = pideThree(page); await page.goto('/');
  expect(await p).toBe(false);
  await expect(page.locator('.portada-css')).toBeVisible();
});
test('movimiento reducido no pide three.js', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const p = pideThree(page); await page.goto('/');
  expect(await p).toBe(false);
});
test('sin WebGL cae a CSS', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.addInitScript(() => { const o = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : o.call(this, t, ...a); }; });
  await page.goto('/');
  await expect(page.locator('.portada-css')).toBeVisible();
});
test('render se pausa fuera de pantalla', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.goto('/'); await page.waitForFunction(() => window.__portada?.cuadros() > 5);
  await page.locator('#cv').scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  const a = await page.evaluate(() => window.__portada.cuadros()); await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__portada.cuadros())).toBe(a);
});
```

- [ ] **Step 2: Ver fallar.**
- [ ] **Step 3: Implementar la portada CSS:** manchas de los tres tonos que se mueven lento con
  `@keyframes`, capa `backdrop-filter: blur(18px)`, lupa como `mask-image: radial-gradient` en una
  copia nítida, recorrido en bucle; `pointermove`/`touchmove` mueve la lupa con variables CSS.
- [ ] **Step 4: Implementar `iniciarPortada`:** `WebGLRenderer` + plano a pantalla completa con
  `ShaderMaterial`; uniforms `uTiempo`, `uRaton` (vec2), `uEstela` (textura de 64×64 que decae a
  0 en ~1 s), `uTonos`. Ruido de valor para el empañado; la lupa aclara en radio ~120 px.
  Recorrido inicial de la lupa de 1,6 s. `setPixelRatio(Math.min(devicePixelRatio, 1.5))`.
  Pausa con `IntersectionObserver` sobre `#portada` y `visibilitychange`. El titular queda en HTML
  encima del canvas.
- [ ] **Step 5: Ver pasar.**
- [ ] **Step 6: Commit** `Portada de vidrio empañado: WebGL en ordenador y versión CSS en móvil`

### Task 4: Demo FollowApp y textos bilingües de las demos

**Files:**
- Create: `assets/demos/followapp.js`, `assets/textos.js`, `vendor/gsap.min.js`,
  `vendor/ScrollTrigger.min.js` (de `gsap@3.12.5/dist/`)
- Modify: `index.html` (scripts clásicos de GSAP antes del módulo), `assets/sitio.css`
- Test: `pruebas/demos.spec.mjs`

**Interfaces:**
- Consumes: evento `'idioma'` de Task 1; `.demo[data-demo="followapp"]` de Task 2.
- Produces: `textos.js` exporta `t(clave: string): string` según `document.documentElement.lang`;
  cada demo exporta `crearDemoX(raiz: HTMLElement): gsap.core.Timeline` (pausada) y vuelve a pintar
  sus textos al recibir `'idioma'`. `main.js` deja `window.__demos = { followapp, shield, cv }`.

- [ ] **Step 1: Pruebas que fallan**

```js
test('FollowApp distingue a quien se fue de una cuenta suspendida', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.__demos.followapp.progress(0.5));
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('te dejó de seguir');
  await page.evaluate(() => window.__demos.followapp.progress(1));
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('cuenta suspendida');
});
test('la demo cambia de idioma a medias', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.__demos.followapp.progress(0.5));
  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('unfollowed you');
});
```

- [ ] **Step 2: Ver fallar.**
- [ ] **Step 3: Implementar** la lista de 5 seguidores con iniciales (nombres inventados), la fila
  que se va a la mitad de la línea de tiempo con su aviso "@nombre te dejó de seguir · hace 2 h" y,
  al final, otra que desaparece con "cuenta suspendida, no te dejó de seguir".
- [ ] **Step 4: Ver pasar.**
- [ ] **Step 5: Commit** `Demo de FollowApp: quien se fue y la cuenta suspendida`

### Task 5: Demo Chat Privacy Shield

**Files:**
- Create: `assets/demos/shield.js`
- Modify: `assets/sitio.css`
- Test: `pruebas/demos.spec.mjs`

**Interfaces:**
- Consumes: `t()` y el patrón de demo de Task 4.
- Produces: `crearDemoShield(raiz)`; control `input[type=range]#intensidad` (min 2, max 20) que fija
  `--desenfoque` en la raíz de la demo.

- [ ] **Step 1: Pruebas que fallan**

```js
test('la intensidad cambia el desenfoque y los no leídos siguen nítidos', async ({ page }) => {
  await page.goto('/');
  await page.locator('#intensidad').fill('12');
  const d = page.locator('[data-demo=shield]');
  await expect(d.locator('.chat-texto').first()).toHaveCSS('filter', 'blur(12px)');
  await expect(d.locator('.no-leidos').first()).toHaveCSS('filter', 'none');
});
test('tocar con el dedo revela el chat', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  await page.goto('/');
  const fila = page.locator('[data-demo=shield] .chat').nth(1);
  await fila.tap();
  await expect(fila.locator('.chat-texto')).toHaveCSS('filter', 'none');
});
```

- [ ] **Step 2: Ver fallar.**
- [ ] **Step 3: Implementar** la lista de chats estilo WhatsApp Web (sin marca ni logo de WhatsApp),
  revelado por `pointerenter`/`pointerdown` de cada fila que se tapa al salir o a los 2 s en táctil;
  la línea de tiempo pasa el "cursor" de demostración por dos filas.
- [ ] **Step 4: Ver pasar.**
- [ ] **Step 5: Commit** `Demo de Chat Privacy Shield con intensidad ajustable`

### Task 6: Demo Best CV

**Files:**
- Create: `assets/demos/cv.js`
- Modify: `assets/sitio.css`
- Test: `pruebas/demos.spec.mjs`

**Interfaces:**
- Consumes: `t()` y el patrón de demo de Task 4.
- Produces: `crearDemoCV(raiz)`.

- [ ] **Step 1: Prueba que falla**

```js
test('Best CV pregunta antes de reescribir', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.__demos.cv.progress(0.5));
  await expect(page.locator('[data-demo=cv] .burbuja')).toContainText('¿Cuánto bajó el tiempo?');
  await page.evaluate(() => window.__demos.cv.progress(1));
  await expect(page.locator('[data-demo=cv] .logro')).not.toContainText('Encargado de mejorar procesos');
  await expect(page.locator('[data-demo=cv] .logro')).toContainText('%');
});
```

- [ ] **Step 2: Ver fallar.**
- [ ] **Step 3: Implementar:** el logro "Encargado de mejorar procesos" se tacha, aparece la burbuja,
  una respuesta "de 3 días a 1" y el logro final "Reduje en 66 % el tiempo de cierre mensual, de 3
  días a 1" se escribe por palabras.
- [ ] **Step 4: Ver pasar.**
- [ ] **Step 5: Commit** `Demo de Best CV: pregunta en vez de inventar`

### Task 7: Coreografía con el scroll

**Files:**
- Modify: `assets/main.js`
- Test: `pruebas/scroll.spec.mjs`

**Interfaces:**
- Consumes: `window.__demos`, `debeUsarWebGL()`.
- Produces: `montarDemos(modo: 'escritorio'|'movil'|'quieto'): void`.

- [ ] **Step 1: Pruebas que fallan**

```js
test('móvil no fija secciones', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  await page.goto('/');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});
test('escritorio fija cada demo', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.goto('/');
  await expect(page.locator('.pin-spacer')).toHaveCount(3);
});
test('movimiento reducido muestra el estado final sin animar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('cuenta suspendida');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});
test('pasar de escritorio a móvil no rompe nada', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  const errores = []; page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('/'); await page.setViewportSize({ width: 390, height: 844 });
  await page.mouse.wheel(0, 3000); await page.waitForTimeout(500);
  expect(errores).toEqual([]);
});
```

- [ ] **Step 2: Ver fallar.**
- [ ] **Step 3: Implementar `montarDemos`:** `escritorio` → `ScrollTrigger` con `pin: true`,
  `scrub: 0.6`, `end: '+=120%'` por sección; `movil` → `ScrollTrigger` sin pin que hace `play()` al
  entrar y `repeat: -1` con pausa de 1,5 s; `quieto` → `progress(1)` y nada más. El modo se decide
  una vez al cargar; al redimensionar solo `ScrollTrigger.refresh()`.
- [ ] **Step 4: Ver pasar** toda la suite.
- [ ] **Step 5: Commit** `Las demos avanzan con el scroll en ordenador y solas en móvil`

### Task 8: Favicon, imagen para compartir y verificación final

**Files:**
- Create: `favicon.svg`, `apple-touch-icon.png` (180×180), `og.png` (1200×627), `pruebas/final.spec.mjs`
- Modify: `index.html` (`<link rel=icon>`, `apple-touch-icon`, `og:*`, `twitter:card`)

**Interfaces:**
- Consumes: todo lo anterior.

- [ ] **Step 1: Pruebas que fallan**

```js
test('favicon y metadatos', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel=icon]')).toHaveAttribute('href', 'favicon.svg');
  expect((await request.get('/favicon.svg')).headers()['content-type']).toContain('image/svg+xml');
  expect((await request.get('/apple-touch-icon.png')).status()).toBe(200);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://arturdev98.github.io/og.png?v=1');
});
test('peso en móvil < 150 KB comprimido', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  const zlib = await import('node:zlib'); const tamaños = [];
  page.on('response', (r) => { if (/\.(m?js|css|html)$|\/$/.test(r.url())) tamaños.push(r.body().then((b) => zlib.gzipSync(b).length)); });
  await page.goto('/'); await page.waitForLoadState('networkidle');
  const total = (await Promise.all(tamaños)).reduce((a, b) => a + b, 0);
  expect(total).toBeLessThan(150 * 1024);
});
```

- [ ] **Step 2: Ver fallar.**
- [ ] **Step 3: Implementar** el favicon del spec (una "a" minúscula en Archivo 800, cian
  `#4FC7D1`, sobre cuadrado redondeado `#0E161C`, con un arco de lupa a medias, con el texto
  convertido a trazado), los PNG renderizados con Chrome headless desde un HTML temporal en el
  scratchpad, y las metaetiquetas. `og.png`: fondo `#0E161C`, el titular de la portada en Archivo
  800, los tres nombres de las apps cada uno con su tono, y "arturdev98.github.io" en mono.
- [ ] **Step 4: Ver pasar** toda la suite.
- [ ] **Step 5: Revisión visual:** capturas 390 px y 1440 px, ES y EN, y con movimiento reducido;
  revisarlas contra las anti-metas del spec.
- [ ] **Step 6: Lighthouse móvil:** `npx --yes lighthouse@12.2.1 http://127.0.0.1:4173
  --form-factor=mobile --only-categories=performance,accessibility --quiet --chrome-flags=--headless`
  → ambos ≥ 90.
- [ ] **Step 7: Commit** `Favicon, imagen para compartir y verificación del rediseño`
