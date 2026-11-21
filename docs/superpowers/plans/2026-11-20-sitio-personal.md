# Plan: sitio personal en la raíz y apps en /apps/

Spec: `docs/superpowers/specs/2026-11-20-sitio-personal-design.md`. Rama `sitio-personal`.
Cada tarea la implementa un subagente Sonnet, la revisa Opus y la verifican subagentes Haiku
(salida de pruebas y capturas). Commits en español, uno o más por tarea; el dueño hace el push.

## Reglas para todas las tareas

- Node 22 de nvm para Playwright (el Node global es v16). Pruebas: `npm test` dentro de `pruebas/`.
- Comentarios de código de 2 líneas como máximo, solo el porqué.
- Textos: solo los de la ficha de contenido verificada (LinkedIn y CV aprobados). Ninguna cifra
  nueva. Nombre visible «Arturo Isaza»; el completo, solo en metadatos y JSON-LD.
- Nada de teléfono, nombres internos del cliente, motivo salarial, notas
  de verificación, porcentajes de cobertura, conteos de usuarios ni cargos inflados (los cargos
  pasados son QA Analyst y QA Tester; «QA Automation · SDET» es solo posicionamiento).
- ai-automatization: 4 requisitos, 27 criterios de aceptación, 19 bugs documentados, CI en cada
  cambio. **Sin número de pruebas.** No mostrar proyectos de terceros.
- Cero peticiones a terceros en tiempo de ejecución; librerías de `vendor/`, fuentes de `fonts/`.

## Task S1 · Mover la landing de apps a `/apps/`

1. `git mv index.html apps/index.html`, `git mv assets apps/assets`, `git mv og.png apps/og.png`.
2. Rutas en `apps/index.html`: `../favicon.svg`, `../apple-touch-icon.png`, `../vendor/…`,
   precarga `../fonts/…`; `og:url` → `https://arturdev98.github.io/apps/`; `og:image` y
   `twitter:image` → `https://arturdev98.github.io/apps/og.png?v=3`.
3. `apps/assets/sitio.css`: `url('../../fonts/…')`. `apps/assets/portada-gl.js` y cualquier
   import de `vendor/`: `../../vendor/…`. Buscar todas las referencias a `fonts/` y `vendor/`.
4. Pie de `apps/index.html`: enlace discreto a `/` («Arturo Isaza →» / EN igual).
5. Pruebas: mover las 8 specs a `pruebas/apps/`, cambiar `goto('/')` por `goto('/apps/')` y
   rutas esperadas (`../favicon.svg`, `og.png?v=3`); `testMatch: '**/*.spec.mjs'`.
6. `servidor.mjs`: añadir `.mp4`, `.webm`, `.gif`, `.jpg`, `.ico` a `TIPOS`.
7. `generar-og.mjs` acepta plantilla y destino: `npm run og:apps` (`og-apps.html` →
   `../apps/og.png`); `npm run og` queda para la raíz (S7). Renombrar `og.html` a `og-apps.html`.

Aceptación: `npm test` verde en escritorio y móvil; capturas de `/apps/` a 1440 y 390 iguales
a las de `main` en `/` (las compara Haiku).

## Task S2 · Esqueleto de la raíz (sin animación)

- `index.html` nuevo con todas las secciones de la spec y sus textos ES/EN en `data-es`/`data-en`.
- Script en `<head>`, antes de pintar: (a) si `location.hash` es `#followapp|#shield|#movil|#cv`,
  `location.replace('/apps/' + hash)`; (b) idioma: `?lang=en|es`, si no, `navigator.language`;
  pone `lang` en `<html>` y una clase para no repintar después (sin CLS).
- `assets/estilos.css`: tokens de la marca (copiar de `apps/assets/sitio.css`), escala tipográfica,
  diseño partido en escritorio (columna izquierda `position: sticky` con nombre, rol, lista de
  suites, contador `n/6 suites · 0 fallas`, redes, CV) y una columna en móvil con barra y menú.
- `assets/sitio.js` (módulo): `pintar(lang)` reutilizando la lógica de `apps/assets/main.js`
  (sin el aviso de móvil ni las demos), que además cambia `<title>` y la meta description;
  botones ES/EN con `aria-pressed`.
- Foto: `/cv/foto.webp` (360×360) con `width`/`height` fijos.
- Proyectos destacados con su estructura final (cabecera de estado mono, zona de medio vacía con
  su altura reservada, cifras, enlaces) y cuadrícula de más proyectos.
- Pruebas nuevas en `pruebas/sitio/`: orden de secciones e ids; enlaces exactos (CV, apps, panel,
  repos, Web Store, LinkedIn, GitHub, correo); ES/EN con `?lang=en` y con locale en-US; CLS < 0,05
  con locale en-US; redirección `/#followapp` → `/apps/#followapp`; sin scroll horizontal a 390 px;
  sin peticiones fuera de 127.0.0.1; frases prohibidas ausentes (nombre de proyectos de terceros, `cobertura`,
  `coverage`, `Senior`, `57 pruebas`, el teléfono); un solo h1.

Punto de control O-B: Haiku toma capturas 1440/1366/390 en ES y EN; Opus revisa y anota cambios.

## Task S3 · Movimiento base

- `html.anima` solo si GSAP cargó y no hay `prefers-reduced-motion`; el CSS de estado oculto vive
  bajo esa clase.
- `ScrollTrigger.batch('[data-revela]')` (y 24→0, opacidad 0→1, 0,7 s, escalonado 0,08, una vez).
- Suites: un ScrollTrigger por sección pone `aria-current` en la activa, estado pendiente → en
  curso (cian) → superada (verde) y actualiza el contador.
- Cifras que cuentan hasta el valor que ya está en el HTML (1,2 s, `tabular-nums`).
- Subrayado del h1: ámbar bajo «la falla», verde bajo «con datos», una vez.
- Línea de tiempo de experiencia con `scaleY` ligada al scroll (`scrub`), sin fijar secciones.
- Pruebas: con movimiento reducido todo `[data-revela]` tiene opacidad 1; con GSAP bloqueado no
  hay errores en consola y todo es visible; el valor final de las cifras está en el HTML.

## Task S4 · Tarjetas, brillo y medios

- `assets/brillo.js`: un `pointermove` delegado con rAF que escribe `--mx`/`--my`; `::before` con
  gradiente radial del tono de la tarjeta. Solo con `(hover: hover) and (pointer: fine)`.
- Medios con ffmpeg desde `docs/repeticion.gif` del repo ai-automatization: `media/repeticion.mp4`
  (H.264) y `.webm`, ~960 px de ancho, < 600 KB cada uno, y póster `media/repeticion.webp`.
- `<video muted playsinline loop preload="none" poster>`: en escritorio se reproduce al entrar en
  pantalla y se pausa al salir; en móvil o con movimiento reducido, póster y controles nativos.
- Pruebas: el brillo no existe con `pointer: coarse`; ningún `.mp4`/`.webm` se pide antes de
  acercarse al proyecto 01; el video se pausa fuera de pantalla.

## Task S5 · Portada 3D y respaldo

- `assets/fondo-gl.js`: matriz `InstancedMesh` (~24×14), barrido cian cada ~6 s, celda ámbar →
  verde con línea que sube, cámara ±4° con el cursor amortiguado. Reutilizar de
  `apps/assets/portada-gl.js` las condiciones de carga, el `import()` diferido, DPR ≤ 1,5 y las
  pausas (IntersectionObserver y `visibilitychange`).
- `assets/fondo-css.js` + CSS: la misma cuadrícula en CSS/SVG con barrido y celda que cambia, en
  pausa fuera de pantalla con la clase `.fuera`. Con movimiento reducido, estado fijo.
- Pruebas (portar casos de `pruebas/apps/portada.spec.mjs`): el móvil no pide three; sin WebGL cae
  al CSS; el render se pausa fuera de pantalla y con la pestaña oculta; el h1 visible en el primer
  pintado.

## Task S6 · Mini demos de proyectos

- `assets/proyectos/pipeline.js`: ficha que recorre Extractor → Planner → revisión humana (se
  detiene y aprueba) → Automator → Reporter, ligada al scroll.
- `assets/proyectos/triage.js`: tickets inventados que llegan, se clasifican y reciben una causa
  probable; bucle solo en pantalla.
- `assets/proyectos/pytest.js`: terminal con casos que pasan y hallazgos marcados (sin inventar
  cifras: los totales mostrados son los del repo, 30 casos y 16 hallazgos).
- `assets/proyectos/shield.js`: chats difuminados que se revelan bajo el cursor (versión corta de
  la demo de `/apps/`).
- Todas `aria-hidden` con texto equivalente al lado; con movimiento reducido, estado final.
- Pruebas: estados con `progress(0.5)` y `progress(1)`; cambio de idioma a mitad de la demo.

## Task S7 · Imagen para compartir y metadatos

- `pruebas/og.html` nueva (nombre, rol, tesis, tres cifras) → `npm run og` → `og.png` 2400×1254.
- `canonical`, Open Graph y Twitter con `og.png?v=1` absoluta, `og:locale` es_CO + en_US,
  JSON-LD `Person` (nombre completo, jobTitle, url, sameAs GitHub, LinkedIn y CV).
- Prueba: `pruebas/sitio/final.spec.mjs` (favicon, metadatos, JSON-LD válido).

## Task S8 · Endurecer

- Peso en móvil < 150 KB comprimido (HTML+CSS+JS propio + GSAP), medido en la prueba con las
  respuestas del servidor; LCP < 2,5 s con PerformanceObserver; recorrido con teclado con foco
  visible; `@axe-core/playwright` como dependencia de desarrollo si cabe sin red en ejecución.
- Suite completa verde; Haiku resume la salida y revisa capturas con y sin movimiento reducido.

## O-C · Revisión final

Opus revisa diseño y código (`superpowers:requesting-code-review`). El dueño hace push y abre el PR.

## Después del merge (dueño)

Bio de Instagram y fichas de la Web Store hacia `/apps/`; enlace del sitio en LinkedIn; comprobar
que `/cv/`, `/apps/`, `/ai-automatization/`, `/wash-app-demo/`, `/ofertas/` y `/followapp/` abren.
