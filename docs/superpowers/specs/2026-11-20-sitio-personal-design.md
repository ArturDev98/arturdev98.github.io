# Sitio personal en la raíz de arturdev98.github.io

Fecha: 2026-11-20 · Alcance: la raíz (`/index.html`) pasa a ser el sitio personal de Arturo; la
landing de las tres apps se conserva intacta en `/apps/`. No toca `/cv/` ni los sitios de otros
repos (`/ai-automatization/`, `/wash-app-demo/`, `/ofertas/`, `/followapp/`).

## Intención

Arturo busca un rol de QA Automation / SDET. El
sitio lo presenta: quién es, qué hizo, qué proyectos construyó y con qué herramientas. Toma la
estructura de un portafolio de desarrollador (sobre mí, experiencia, proyectos, herramientas), con
una identidad propia: llamativo, animado y coherente con el CV y el banner de LinkedIn.

Públicos:

- **Reclutadores y equipos técnicos, casi siempre en el ordenador**, llegando desde LinkedIn, el CV
  o el perfil de GitHub. En 10 segundos deben saber qué hace, qué logró con cifras y que está
  disponible; en 2 minutos, ver los proyectos que lo prueban.
- **Visitantes de Instagram y de la Chrome Web Store**, que hoy llegan a la raíz buscando las apps.
  Se les lleva a `/apps/` sin fricción.

## Concepto: el sitio es una corrida de pruebas

Lo que lo hace propio y no una plantilla: la página se comporta como una corrida que el visitante
va ejecutando con el scroll, y la tesis («encuentro la falla, la corrijo en el código y lo demuestro
con datos») se ve antes de leerla.

- **Portada:** una matriz de pruebas en 3D. Un barrido cian la recorre, una celda falla (ámbar), se
  corrige (verde) y de ella sube una línea métrica.
- **Columna izquierda (escritorio):** cada sección es una «suite» con un punto de estado:
  pendiente (gris) → en curso (cian, la sección visible) → superada (verde, ya recorrida). Al pie,
  un contador en mono: `5/7 suites · 0 fallas`.
- **Proyectos:** cada tarjeta destacada se lee como el informe de una corrida: cabecera mono con el
  estado (`✓ en producción`, `✓ publicada en la Web Store`, `✓ CI en verde`), pieza animada y cifras.
- Los colores tienen significado fijo: cian = en curso o enlace, ámbar = falla o antes, verde =
  corregido o después. No se usan como decoración.

## Metas

1. En la primera pantalla: nombre, rol, tesis, disponibilidad y tres cifras con su explicación.
2. Los proyectos destacados se entienden viéndolos funcionar (demo, video o diagrama animado).
3. Escritorio vistoso (3D, brillo que sigue el cursor, transiciones); móvil rápido y fluido.
4. Bilingüe ES/EN; enlazable a un idioma con `?lang=en`.
5. Las apps siguen a un clic: `/apps/` y redirección de los enlaces viejos.

## No metas

- Rediseñar `/apps/` (se mueve tal cual), `/cv/` o los sitios de otros repos.
- Backend, formulario de contacto, blog, analítica.
- Mostrar proyectos de terceros como propios.

## Anti-metas

- Plantilla de IA: degradados morados, vidrio por todas partes, emojis como íconos, texto que se
  escribe letra a letra sin motivo.
- Copiar el aspecto de otro portafolio: se toma la estructura (columna fija + secciones), no su
  paleta, tipografía ni efectos.
- Que el efecto tape el mensaje o que el móvil se trabe o descargue three.js.
- Cifras sin fuente, títulos inflados, porcentajes de cobertura o conteos de usuarios.
- Llamadas a terceros en tiempo de ejecución.

## Restricciones

Las mismas del rediseño del 2026-11-16: estático en GitHub Pages sin build; módulos ES; `vendor/`
con versión fijada (GSAP 3.12.5, ScrollTrigger, three.js r170); fuentes del repo (Archivo,
JetBrains Mono, Source Serif 4); `data-es`/`data-en`; `prefers-reduced-motion` deja todo estático;
sin WebGL cae a la versión CSS; contraste AA y foco visible.

## Estructura

```
┌──────────────────────────────────────────────────────────┐
│ arturdev98                Apps  CV        ES | EN        │
├──────────────────────────────────────────────────────────┤
│  PORTADA (pantalla completa, matriz 3D detrás)           │
│  QA AUTOMATION · SDET · BUCARAMANGA                      │
│  Encuentro la falla, la corrijo en el código             │
│  y lo demuestro con datos.        ● Disponible de inmed. │
│  [89 fallas]  [2× más rápido]  [~1 hora]                 │
│  [Ver proyectos]  [CV]     ¿Buscas FollowApp? → Apps     │
├───────────────────┬──────────────────────────────────────┤
│ Arturo Isaza      │ 01 Sobre mí                          │
│ QA Automation     │ 02 Experiencia (línea de tiempo)     │
│                   │ 03 Proyectos destacados (4)          │
│ ● Sobre mí        │ 04 Más proyectos (cuadrícula)        │
│ ● Experiencia     │ 05 Herramientas                      │
│ ◌ Proyectos       │ 06 Contacto                          │
│ ○ …               │                                      │
│ 3/6 suites·0 fall.│                                      │
│ GitHub LinkedIn CV│                                      │
└───────────────────┴──────────────────────────────────────┘
```

Móvil: una columna; la columna izquierda se reduce a la barra superior con un menú de anclas.

### Secciones

| id | Contenido |
|---|---|
| `inicio` | Antetítulo, h1 (tesis), píldora «Disponible de inmediato» que late, tres cifras con explicación, botones Proyectos y CV, chip hacia `/apps/` |
| `sobre-mi` | Dos párrafos del «Acerca de» aprobado; foto de `/cv/foto.webp` |
| `experiencia` | HexaSolutions (may 2023 – nov 2026), Avances Software, Sistemas y Computadores; educación (CUN, en curso hasta mayo 2027) |
| `proyectos` | Destacados: 01 ai-automatization, 02 helpdesk-triage-agent, 03 restful-booker-api-tests, 04 Chat Privacy Shield |
| `mas-proyectos` | FollowApp, Best CV, git-team-insights, ci-image-notifier, elastic-explorer, merged_app, wash-app-demo |
| `herramientas` | Grupos con las herramientas verificadas |
| `contacto` | Llamada final: rol buscado, modalidad, disponibilidad; correo, LinkedIn, GitHub, CV |

Los textos salen de la ficha de contenido verificada (LinkedIn y CV aprobados); ninguna cifra sin
fuente. Decisiones del dueño (2026-11-20): nombre visible «Arturo Isaza»; en ai-automatization
solo cifras verificables en el repo (4 requisitos, 27 criterios, 19 bugs, CI), sin número de
pruebas; «2× más rápido» con el detalle 4,9 → 2,2 min; disponibilidad con la frase de LinkedIn.

### Proyectos destacados

1. **ai-automatization** (tono cian): video de la repetición real (convertido del GIF a MP4/WebM
   con póster) y un diagrama SVG de los cuatro agentes con la puerta humana; una ficha avanza
   Extractor → Planner → revisión humana (se detiene y «aprueba») → Automator → Reporter, ligada al
   scroll. Enlaces: panel en vivo y repo.
2. **helpdesk-triage-agent** (ámbar → verde): mini demo de tickets que llegan, se clasifican y
   reciben una causa probable. Es la versión pública, reconstruida con datos ficticios; la cifra
   «de hasta 2 h a hasta 15 min por ticket» se presenta como de la versión interna en producción.
3. **restful-booker-api-tests** (verde): terminal pytest animada con casos que pasan y hallazgos que
   se marcan; enlace al repo y a su página.
4. **Chat Privacy Shield** (verde): chats difuminados que se revelan bajo el cursor (versión corta
   de la demo de `/apps/`); enlaces a la Web Store y a `/apps/#shield`.

Más proyectos: tarjetas en cuadrícula con nombre, una línea, stack en mono y enlace.

## Movimiento

- Solo `transform` y `opacity`, curva `--salida`. El estado oculto inicial solo existe bajo
  `html.anima` (la pone el script si hay GSAP y no hay movimiento reducido).
- Portada 3D: `InstancedMesh` de unos 24×14 cubos bajos; barrido cada ~6 s; cámara ±4° con el
  cursor. Solo con `pointer: fine`, ancho ≥ 900 px, WebGL y sin movimiento reducido; `import()`
  tras el primer pintado; DPR ≤ 1,5; pausa fuera de pantalla y con la pestaña oculta. Respaldo
  CSS/SVG (misma cuadrícula, barrido y celda que cambia) en móvil y sin WebGL.
- El h1 nunca se oculta: solo se dibuja un subrayado ámbar bajo «la falla» que pasa a verde bajo
  «con datos». Las cifras cuentan hasta su valor, que ya está en el HTML.
- Revelados por lotes al entrar en pantalla, una sola vez. Línea de tiempo que se dibuja con el
  scroll, sin fijar secciones. Estados de las suites ligados a ScrollTrigger.
- Brillo radial que sigue el cursor en las tarjetas, solo con `(hover: hover) and (pointer: fine)`.
- Mini demos en bucle solo mientras están en pantalla; con movimiento reducido, el estado final.
- Cambio de idioma con fundido de 150 ms y altura reservada (sin CLS).

## Presupuesto

- Móvil: HTML+CSS+JS propio + GSAP < 150 KB comprimido, sin three.js ni video hasta acercarse.
- CLS < 0,05; LCP < 2,5 s en local; cero peticiones a terceros.

## Las apps en `/apps/`

`index.html`, `assets/` y `og.png` actuales se mueven a `apps/` sin cambiar su contenido; solo se
ajustan las rutas a `fonts/`, `vendor/` y favicons, `og:url` y `og:image`. Un script en el `<head>`
de la raíz envía `/#followapp`, `/#shield`, `/#movil` y `/#cv` a `/apps/#…` antes de pintar; el
sitio nuevo no usa esos ids. Tarea del dueño tras publicar: bio de Instagram y fichas de la Web
Store hacia `/apps/`.

## Metadatos y accesibilidad

`canonical`, Open Graph y Twitter con `og.png` nueva a 2400×1254, `og:locale` es_CO y en_US,
JSON-LD `Person`. Enlace para saltar al contenido, un solo h1, foco visible, botones de idioma con
`aria-pressed`, demos `aria-hidden` con texto equivalente al lado, video con controles nativos.

## Verificación

- Suite de Playwright (escritorio 1440×900 y Pixel 7): la de `/apps/` movida y la nueva de la raíz.
- Capturas a 1440, 1366 y 390 px, ES y EN, con y sin movimiento reducido.
- Comprobar que en móvil no se descarga three.js ni el video, y que no hay peticiones a terceros.

## README del perfil (repo ArturDev98)

Pieza aparte que lleva al sitio: inglés, con enlace a `?lang=en` y a la versión en español;
cabecera SVG animada propia (nombre, rol, tesis, «Available now», barrido y celda ámbar→verde), con
variantes oscura y clara; ai-automatization destacado con su GIF; tabla de proyectos en markdown;
experiencia sin «fintech» en presente. Los SVG se generan con Playwright desde este repo.

## Queda a criterio de quien construye

Curvas y duraciones exactas, densidad de la matriz, textos inventados de las mini demos (tickets,
casos de pytest), siempre dentro de lo que dicen las fuentes.
