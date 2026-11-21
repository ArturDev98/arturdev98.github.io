import { hayMovimiento, registrar } from './base.js';

// La ficha recorre los cinco pasos con el scroll y espera en la revisión humana hasta que aprueba.
export function iniciar(el) {
  var api = { progress: function () {} };
  var gsap = window.gsap, ST = window.ScrollTrigger;
  if (hayMovimiento() && ST) {
    gsap.registerPlugin(ST);
    var nodos = el.querySelectorAll('.pl-nodo');
    var ficha = el.querySelector('.pl-ficha'), relleno = el.querySelector('.pl-relleno');
    var aprueba = el.querySelector('.pl-aprueba'), pista = el.querySelector('.pl-pista');
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    var ancho = function (k) { return function () { return pista.clientWidth * k; }; };

    // Estado de partida explícito: es el de scroll 0; el final lo da el CSS.
    gsap.set(ficha, { opacity: 0, x: 0 });
    gsap.set(relleno, { scaleX: 0 });
    gsap.set(el.querySelectorAll('.pl-hecho'), { opacity: 0 });
    gsap.set(aprueba, { opacity: 0, y: 6 });

    tl.to(ficha, { opacity: 1, duration: 0.04 }, 0);
    // Tramos de la ficha: [paso, inicio, fin].
    [[1, 0.05, 0.22], [2, 0.27, 0.44], [3, 0.6, 0.76], [4, 0.8, 0.92]].forEach(function (m) {
      var d = m[2] - m[1];
      tl.to(ficha, { x: ancho(m[0] / 4), duration: d }, m[1]);
      tl.to(relleno, { scaleX: m[0] / 4, duration: d }, m[1]);
    });
    // Cada paso: anillo en curso al llegar la ficha, relleno verde al salir.
    var paso = function (i, entra, sale) {
      var c = nodos[i].querySelector('.pl-curso'), h = nodos[i].querySelector('.pl-hecho');
      tl.to(c, { opacity: 1, duration: 0.03 }, entra);
      tl.to(c, { opacity: 0, duration: 0.03 }, sale);
      tl.to(h, { opacity: 1, duration: 0.03 }, sale);
    };
    paso(0, 0, 0.05); paso(1, 0.22, 0.27); paso(2, 0.44, 0.55); paso(3, 0.76, 0.8); paso(4, 0.92, 0.96);
    tl.to(aprueba, { opacity: 1, y: 0, duration: 0.03 }, 0.47);
    tl.to(ficha, { opacity: 0, duration: 0.04 }, 0.96);

    var st = ST.create({ trigger: el, start: 'top 85%', end: 'bottom 35%', scrub: true, animation: tl, invalidateOnRefresh: true });
    api.progress = function (p) { st.kill(); tl.progress(p, false); };
  }
  registrar('pipeline', api);
}
