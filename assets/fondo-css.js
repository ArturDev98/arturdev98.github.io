var COLS = 24, FILAS = 14, COL_FALLA = 15, FILA_FALLA = 8;

function nodo(clase) {
  var n = document.createElement('div');
  n.className = clase;
  return n;
}

// Misma matriz que la 3D, hecha de capas CSS: solo se animan transform y opacity.
function montarCss(fondo) {
  var m = nodo('matriz');
  var barrido = nodo('barrido');
  var falla = nodo('celda celda-falla');
  var ok = nodo('celda celda-ok');
  var metrica = nodo('metrica');
  [falla, ok].forEach(function (c) {
    c.style.left = (COL_FALLA / COLS * 100) + '%';
    c.style.top = (FILA_FALLA / FILAS * 100) + '%';
  });
  metrica.style.left = ((COL_FALLA + 0.5) / COLS * 100) + '%';
  metrica.style.height = (FILA_FALLA / FILAS * 100) + '%';
  [barrido, falla, ok, metrica].forEach(function (n) { m.appendChild(n); });
  fondo.appendChild(m);
  fondo.classList.add('fondo-css');
}

// Pausa fuera de pantalla (.fuera) y con la pestaña oculta (.pausa).
function vigilar(fondo, zona) {
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      fondo.classList.toggle('fuera', !e[e.length - 1].isIntersecting);
    }).observe(zona);
  }
  document.addEventListener('visibilitychange', function () {
    fondo.classList.toggle('pausa', document.hidden);
  });
}

export function debeUsarWebGL() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (!matchMedia('(pointer: fine)').matches || innerWidth < 900) return false;
  var gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
  // El contexto de prueba se suelta ya: el navegador limita cuántos puede haber vivos.
  var soltar = gl && gl.getExtension('WEBGL_lose_context');
  if (soltar) soltar.loseContext();
  return !!gl;
}

function arrancarWebGL(fondo, zona) {
  import('./fondo-gl.js').then(function (m) {
    try {
      var gl = m.iniciarFondoGl(fondo, zona);
      if (navigator.webdriver) window.__fondo = gl;
      fondo.classList.remove('fondo-css');
      fondo.classList.add('fondo-gl');
    } catch (e) { /* se queda la versión CSS */ }
  }, function () {});
}

export function iniciarFondo() {
  var fondo = document.querySelector('.fondo');
  if (!fondo) return;
  var zona = fondo.parentElement;
  montarCss(fondo);
  vigilar(fondo, zona);
  if (!debeUsarWebGL()) return;
  // three.js llega después del primer pintado y solo donde se va a ver.
  var fuentes = document.fonts ? document.fonts.ready : Promise.resolve();
  var ir = function () { fuentes.then(function () { arrancarWebGL(fondo, zona); }); };
  if (document.readyState === 'complete') ir();
  else addEventListener('load', ir);
}
