# Rediseño de arturdev98.github.io

Fecha: 2026-11-16 · Alcance: la portada del sitio (`/index.html`). No toca `/cv/` ni `/followapp/`
(este último vive en otro repo). Best CV se rediseña después, aparte.

## Intención

La página presenta tres herramientas: FollowApp y Chat Privacy Shield (extensiones de Chrome) y
Best CV (web con IA). Hoy cumple, pero se ve plana y genérica. Se quiere un sitio con personalidad
visual propia, llamativo y armónico, que no parezca una plantilla generada con IA.

Tiene dos públicos, y el diseño responde a los dos:

- **Desde Instagram, casi siempre en el móvil.** La bio dice "👇🏾 Pruébalas". Esa persona debe
  entender en segundos qué hace cada app y llevarse el enlace al ordenador (las extensiones no se
  instalan en un teléfono) o abrir Best CV, que sí funciona en el móvil.
- **Desde el CV y LinkedIn, casi siempre en el ordenador.** Reclutadores. Deben ver criterio de
  diseño y oficio técnico.

Decisión del dueño: **móvil ligero pero no simple; ordenador más vistoso.**

## Metas

1. Cada app se entiende viéndola funcionar, no leyendo una lista.
2. En ordenador, una portada que impacte y que tenga que ver con el tema del sitio (privacidad).
3. En móvil, la página carga rápido, se mueve con fluidez y conserva el aviso de "guárdate el
   enlace para el ordenador".
4. Coherencia con la identidad del CV y del banner de LinkedIn.
5. Favicon (SVG y `apple-touch-icon`).

## No metas

- Rediseñar `/cv/`, Best CV o la política de FollowApp.
- Añadir backend, formularios, cuentas o un generador de sitios.
- Cambiar qué hacen las apps o sus enlaces a la Chrome Web Store.

## Anti-metas (si pasa esto, fracasó aunque funcione)

- Que se vea como plantilla de IA: degradados morados, tarjetas de vidrio por todas partes, íconos
  de emoji, "blobs" genéricos, texto que aparece letra a letra sin motivo.
- Que el efecto tape el mensaje: si alguien en el móvil no sabe qué hace FollowApp a los 5 segundos,
  falló.
- Que el móvil se trabe, caliente el teléfono o descargue three.js.
- Que rompa la promesa del sitio "sin analítica": nada de scripts de seguimiento ni llamadas a
  terceros que no hagan falta.

## Restricciones

- Sitio estático en GitHub Pages, sin paso de compilación. HTML, CSS y JavaScript en módulos ES.
- Librerías copiadas en el repo (`vendor/`), con la versión fijada; nada desde un CDN.
- Fuentes servidas desde el repo (`fonts/`), no desde Google Fonts: coherente con "sin analítica".
- Bilingüe ES/EN como hoy (atributos `data-es` / `data-en`, el idioma del navegador decide el de
  partida).
- `prefers-reduced-motion`: todo queda estático y legible, sin animaciones de scroll ni WebGL.
- Sin WebGL disponible: la portada usa la versión del móvil.
- Accesible: contraste AA, foco visible, las demos tienen texto equivalente y no atrapan el teclado.

## Enfoques considerados

| | Enfoque | A favor | En contra |
|---|---|---|---|
| A | Escena 3D en toda la página (three.js + GSAP), un objeto por app | Lo más impactante en ordenador | Pesado en móvil (~600 KB solo three.js); el 3D luce pero no explica las apps |
| B | Demos animadas de cada app (GSAP + SVG/CSS), sin 3D | Ligero, igual de bueno en móvil, explica cada app en segundos | Sin un golpe visual fuerte en la portada |
| **C** | **B + portada WebGL solo en ordenador** | El golpe visual en ordenador, ligereza en móvil, las demos venden | Dos versiones de la portada que mantener |

**Elegido: C**, por el dueño, siguiendo la recomendación.

## Diseño

### Identidad visual

Se mantiene la base del CV y del banner de LinkedIn, para que todo se vea de la misma familia
(decisión mía; razón: armonía entre CV, LinkedIn y sitio):

- Fondo `#0E161C`, tinta `#E8EFF3`, secundaria `#B9CAD4`, reglas `#24333C`.
- Un tono por app: FollowApp cian `#4FC7D1`, Chat Privacy Shield verde `#6FBE8C`, Best CV ámbar
  `#E9B35A`. El tono de cada app solo aparece en su sección y en su demo.
- Tipografía: Archivo (titulares, peso 700–800), JetBrains Mono (etiquetas, datos, interfaz de las
  demos), Source Serif 4 (texto corrido).
- Lo que la hace distinta: titulares grandes y apretados, mucho espacio negro, las demos como piezas
  de interfaz dibujadas con precisión (no capturas), y el movimiento siempre ligado a lo que hace la
  app.

### Estructura de la página

```
┌──────────────────────────────────────────────┐
│ arturdev98                         ES | EN   │
├──────────────────────────────────────────────┤
│                                              │
│   PORTADA                                    │
│   Herramientas pequeñas                      │
│   que no te piden nada      (vidrio empañado │
│   sin contraseña · sin cuenta ·  que el      │
│   sin guardar datos · sin analítica  cursor  │
│                                  aclara)     │
├──────────────────────────────────────────────┤
│ [solo móvil] Estás en el móvil: copiar /     │
│ compartir / enviármelo por correo            │
├──────────────────────────────────────────────┤
│ 01 FollowApp        │  demo: lista de        │
│ Quién te dejó       │  seguidores            │
│ de seguir           │                        │
│ [Añadir a Chrome]   │                        │
├──────────────────────────────────────────────┤
│ 02 Chat Privacy …   │  demo: chats que se    │
│                     │  difuminan/revelan     │
├──────────────────────────────────────────────┤
│ 03 Best CV          │  demo: un logro que    │
│                     │  se reescribe          │
├──────────────────────────────────────────────┤
│ pie: aviso de no afiliación · GitHub         │
└──────────────────────────────────────────────┘
```

En móvil todo va en una columna: texto de la app, demo debajo, botón.

### Portada

- **Ordenador (WebGL, three.js):** un plano a pantalla completa con un shader de "vidrio empañado":
  ruido suave en movimiento sobre el fondo, con el titular detrás. El cursor abre una lupa circular
  que aclara el vidrio y deja una estela que se vuelve a empañar en ~1 s. Al entrar, la lupa hace
  sola un recorrido corto para enseñar el gesto. Es la idea de Chat Privacy Shield llevada a toda la
  portada: lo privado se ve solo donde tú miras.
- three.js se carga con `import()` dinámico **después** de pintar el texto, y solo si: el puntero es
  fino (`pointer: fine`), la ventana mide 900 px o más, hay WebGL y no hay `reduced-motion`.
- Rendimiento: `devicePixelRatio` limitado a 1.5, el render se pausa cuando la portada sale de
  pantalla o la pestaña está oculta.
- **Móvil y sin WebGL:** la misma idea en CSS: capa con `backdrop-filter: blur()` sobre manchas de
  color de los tres tonos que se mueven lento, y una lupa (máscara radial) que recorre la portada en
  bucle y sigue el dedo si se toca. Sin JavaScript pesado.

### Las tres demos

Cada demo es HTML/SVG dibujado en la página (no video ni GIF), animado con GSAP. En ordenador, cada
sección se fija con ScrollTrigger mientras la demo corre con el scroll; en móvil no se fija nada:
la demo arranca sola cuando entra en pantalla y se repite.

1. **FollowApp:** una lista de cinco seguidores (nombres y avatares inventados, con iniciales). Una
   cuenta se desvanece y aparece el aviso "@nombre te dejó de seguir · hace 2 h". Luego otra cuenta
   desaparece pero el aviso dice "cuenta suspendida, no te dejó de seguir": es lo que distingue a
   FollowApp y hoy solo se lee en un párrafo.
2. **Chat Privacy Shield:** una lista de chats estilo WhatsApp Web, difuminada. El cursor (o el dedo)
   revela lo que hay debajo; los contadores de no leídos siguen visibles todo el tiempo. Un control
   de "intensidad" (2–20 px) que la persona puede mover.
3. **Best CV:** un logro flojo ("Encargado de mejorar procesos") se reescribe a uno medible. A mitad
   de camino aparece una burbuja "¿Cuánto bajó el tiempo?" para mostrar que pregunta en vez de
   inventar, y el texto final usa el dato "respondido".

Debajo de cada demo, la lista actual de funciones se mantiene, más corta (3 puntos), para quien
prefiere leer.

### Aviso de móvil

Se conserva su lógica actual (copiar enlace, compartir, enviármelo por correo), con el nuevo
estilo. Va justo después de la portada.

### Pie

Se mantiene el aviso de no afiliación y la referencia a GitHub, como hoy. Sin enlaces al CV ni al
proyecto de QA (decisión del dueño).

### Favicon y metadatos

- `favicon.svg`: una "a" minúscula en Archivo 800, cian `#4FC7D1`, sobre un cuadrado redondeado
  `#0E161C`, con un arco de lupa que la rodea a medias (eco de la portada). Más
  `apple-touch-icon.png` (180 px). Decisión mía.
- `og.png` (1200×627) para cuando el enlace se comparte por WhatsApp (decisión mía; hoy no tiene y
  el enlace se comparte sin imagen).

### Archivos

```
index.html
assets/sitio.css
assets/main.js          idioma, aviso de móvil, demos, ScrollTrigger
assets/portada-gl.js    escena three.js (carga perezosa, solo ordenador)
vendor/three.module.min.js, vendor/gsap.min.js, vendor/ScrollTrigger.min.js
fonts/                  Archivo, JetBrains Mono, Source Serif 4 en woff2 (solo pesos usados)
favicon.svg, apple-touch-icon.png, og.png
```

### Presupuesto de peso

- Móvil: HTML+CSS+JS propio y GSAP < 150 KB comprimido; sin three.js.
- Ordenador: + three.js cargado después del primer pintado.
- Fuentes: solo los pesos usados.

### Verificación

- Capturas con Playwright a 390 px (móvil) y 1440 px (ordenador), en ES y EN, y con
  `reduced-motion`.
- Comprobar en la consola que en móvil no se descarga `three.module.min.js`.
- Lighthouse en móvil: rendimiento y accesibilidad ≥ 90.

## Queda a criterio de quien construye

- El shader exacto (tipo de ruido, radio de la lupa, tiempos de la estela).
- Curvas y duraciones de las animaciones, dentro de "rápido y con intención".
- Los nombres y textos inventados de las demos.
- Ajustes finos del texto existente para que encaje con las demos, sin cambiar lo que promete.
