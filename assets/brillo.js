// Brillo que sigue al cursor: solo puntero fino con hover y sin movimiento reducido.
export function iniciarBrillo() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var tarjeta = null, x = 0, y = 0, pendiente = false;
  function pintar() {
    pendiente = false;
    if (!tarjeta) return;
    var r = tarjeta.getBoundingClientRect();
    tarjeta.style.setProperty('--mx', (x - r.left) + 'px');
    tarjeta.style.setProperty('--my', (y - r.top) + 'px');
  }
  document.addEventListener('pointermove', function (e) {
    var t = e.target.closest ? e.target.closest('.proyecto, .ficha') : null;
    if (!t) return;
    tarjeta = t; x = e.clientX; y = e.clientY;
    if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
  }, { passive: true });
}

// El video de la repetición corre solo al verse al 40 %; con táctil o movimiento reducido no arranca solo; los controles siempre están.
export function iniciarVideo() {
  var v = document.querySelector('video[data-repeticion]');
  if (!v) return;
  var auto = matchMedia('(hover: hover) and (pointer: fine)').matches
    && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!auto || !('IntersectionObserver' in window)) { v.controls = true; return; }
  new IntersectionObserver(function (es) {
    var e = es[es.length - 1];
    if (e.isIntersecting && e.intersectionRatio >= 0.4) {
      var p = v.play(); if (p && p.catch) p.catch(function () { v.controls = true; });
    } else v.pause();
  }, { threshold: [0, 0.4] }).observe(v);
}
