// Con movimiento = GSAP presente y sin movimiento reducido (la misma regla que html.anima).
export function hayMovimiento() {
  return document.documentElement.classList.contains('anima') && !!window.gsap;
}

// Texto bilingüe: pintar() lo reescribe al cambiar de idioma sin tocar la demo.
export function t(es, en) {
  var l = document.documentElement.lang === 'en' ? 'en' : 'es';
  return '<span data-es="' + es + '" data-en="' + en + '">' + (l === 'en' ? en : es) + '</span>';
}

export function registrar(nombre, api) {
  window.__demos = window.__demos || {};
  window.__demos[nombre] = api;
}

// Reproduce el tl en bucle solo con el elemento visible y la pestaña activa.
export function bucle(el, tl) {
  var gsap = window.gsap, visible = false, manual = false, espera = null;
  tl.eventCallback('onComplete', function () {
    if (!manual) espera = gsap.delayedCall(1.6, function () { tl.restart(); });
  });
  function ajustar() {
    if (!visible || document.hidden || manual) {
      tl.pause();
      if (espera) espera.pause();
    } else if (espera && espera.progress() < 1) espera.resume();
    else tl.resume();
  }
  function detener() {
    manual = true;
    if (espera) espera.kill();
    tl.pause();
  }
  new IntersectionObserver(function (es) {
    visible = es[es.length - 1].isIntersecting;
    ajustar();
  }).observe(el);
  document.addEventListener('visibilitychange', ajustar);
  return {
    detener: detener,
    progress: function (p) { detener(); tl.progress(p, false); }
  };
}
