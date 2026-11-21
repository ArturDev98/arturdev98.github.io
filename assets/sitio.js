import { iniciarMovimiento } from "./movimiento.js";
import { iniciarFondo } from "./fondo-css.js";
import { iniciarBrillo, iniciarVideo } from "./brillo.js";

var IDIOMA = 'es';

var META = {
  es: {
    titulo: 'Arturo Isaza · QA Automation · SDET',
    ogd: 'Encuentro la falla, la corrijo en el código y lo demuestro con datos.',
    descripcion: 'QA Automation / SDET en Bucaramanga, Colombia. Encuentro la falla, la corrijo en el código y lo demuestro con datos. Disponible de inmediato.'
  },
  en: {
    titulo: 'Arturo Isaza · QA Automation · SDET',
    ogd: 'I find the bug, fix it in the code and prove it with data.',
    descripcion: 'QA Automation / SDET based in Bucaramanga, Colombia. I find the bug, fix it in the code and prove it with data. Available immediately.'
  }
};

function pintar(l) {
  IDIOMA = l;
  var raiz = document.documentElement;
  raiz.lang = l;
  var nodos = document.querySelectorAll('[data-' + l + ']');
  for (var i = 0; i < nodos.length; i++) {
    nodos[i].textContent = nodos[i].getAttribute('data-' + l);
  }
  document.title = META[l].titulo;
  var rotulos = document.querySelectorAll('[data-aria-' + l + ']');
  for (var k = 0; k < rotulos.length; k++) rotulos[k].setAttribute('aria-label', rotulos[k].getAttribute('data-aria-' + l));
  var d = document.querySelector('meta[name="description"]');
  if (d) d.setAttribute('content', META[l].descripcion);
  var og = document.querySelector('meta[property="og:description"]');
  if (og) og.setAttribute('content', META[l].ogd);
  var ot = document.querySelector('meta[property="og:title"]');
  if (ot) ot.setAttribute('content', META[l].titulo);

  ['es', 'en'].forEach(function (x) {
    var b = document.getElementById('b-' + x);
    b.classList.toggle('on', l === x);
    b.setAttribute('aria-pressed', String(l === x));
  });
  document.getElementById('b-es').closest('.langs').setAttribute('aria-label', l === 'es' ? 'Idioma' : 'Language');
  raiz.classList.add('listo');
  var cv = document.querySelectorAll('a[href^="/cv/"]');
  for (var j = 0; j < cv.length; j++) cv[j].setAttribute('href', '/cv/?lang=' + l);
  document.dispatchEvent(new CustomEvent('idioma', { detail: { idioma: l } }));
}

function elegir(l) {
  var main = document.getElementById('contenido');
  if (document.documentElement.classList.contains('anima') && main) {
    // Fundido de 150 ms: solo opacidad, sin mover el layout.
    main.classList.add('cambia');
    setTimeout(function () { pintar(l); main.classList.remove('cambia'); }, 75);
  } else pintar(l);
  var u = new URL(location.href);
  u.searchParams.set('lang', l);
  history.replaceState(null, '', u);
}

document.getElementById('b-es').addEventListener('click', function () { elegir('es'); });
document.getElementById('b-en').addEventListener('click', function () { elegir('en'); });

// El menú de suites va siempre abierto en escritorio; en móvil se despliega a mano.
var ancho = matchMedia('(min-width: 1024px)');
var menu = document.querySelector('.menu');
var resumen = menu.querySelector('summary');
var cierre = 0;
function sincronizar() { resumen.setAttribute('aria-expanded', String(menu.open)); }
function ajustarMenu() { clearTimeout(cierre); menu.classList.remove('cierra'); menu.open = ancho.matches; sincronizar(); }
// Cierra con un fundido corto; con movimiento reducido es inmediato.
function cerrarMenu() {
  if (!menu.open || ancho.matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { menu.open = false; sincronizar(); return; }
  if (menu.classList.contains('cierra')) return;
  menu.classList.add('cierra');
  // Estado ya en «cerrado»: el toggle nativo llega tarde y dejaría un aria-expanded viejo.
  resumen.setAttribute('aria-expanded', 'false');
  // Solo cierra si sigue en cierre: un temporizador viejo no debe tapar un menú reabierto.
  cierre = setTimeout(function () {
    if (!menu.classList.contains('cierra')) return;
    menu.classList.remove('cierra'); menu.open = false; sincronizar();
  }, 160);
}
// El summary ya es un botón nativo; aquí se declara su estado para los lectores.
resumen.setAttribute('role', 'button');
resumen.setAttribute('aria-controls', 'menu-panel');
ajustarMenu();
ancho.addEventListener('change', ajustarMenu);
resumen.addEventListener('click', function (e) {
  if (ancho.matches) return;
  if (menu.classList.contains('cierra')) {
    // Pulsar durante un cierre en curso es pedir abrir: se cancela el cierre.
    e.preventDefault(); clearTimeout(cierre); menu.classList.remove('cierra'); sincronizar();
  } else if (menu.open) { e.preventDefault(); cerrarMenu(); }
  else resumen.setAttribute('aria-expanded', 'true');
});
menu.addEventListener('toggle', function () { if (!menu.classList.contains('cierra')) sincronizar(); });
menu.addEventListener('click', function (e) {
  if (e.target.closest('a')) cerrarMenu();
});
document.addEventListener('pointerdown', function (e) {
  if (menu.open && !menu.contains(e.target)) cerrarMenu();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && menu.open && !ancho.matches) { cerrarMenu(); resumen.focus(); }
});

// La intención del head gana al rescate: si el módulo llega tarde, repinta en el idioma pedido.
pintar(window.__idioma || 'es');

try { iniciarMovimiento(); } catch (e) { document.documentElement.classList.remove('anima'); }

try { iniciarBrillo(); iniciarVideo(); } catch (e) { /* el sitio sigue sin brillo ni autoplay */ }

// Los módulos de las demos se piden al acercarse la tarjeta, no al arrancar.
function cargarDemos() {
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      import('./proyectos/' + e.target.getAttribute('data-demo') + '.js')
        .then(function (m) { m.iniciar(e.target); })
        .catch(function () { /* la tarjeta queda con su texto */ });
    });
  }, { rootMargin: '300px 0px' });
  document.querySelectorAll('[data-demo]').forEach(function (n) { io.observe(n); });
}

try { cargarDemos(); } catch (e) { /* sin demos */ }

try { iniciarFondo(); } catch (e) { /* queda el fondo liso */ }

// La red de fondo se pide tras el primer pintado: no compite con el LCP ni va en modulepreload.
function cargarRed() {
  import('./red.js').then(function (m) { m.iniciarRed(); }).catch(function () { /* queda el fondo liso */ });
}
if (document.readyState === 'complete') setTimeout(cargarRed, 0);
else window.addEventListener('load', function () { setTimeout(cargarRed, 0); });
