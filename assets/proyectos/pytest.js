import { hayMovimiento, registrar, bucle, t } from './base.js';

// Nombres de casos genéricos; los únicos totales son los del repo: 30 casos y 16 hallazgos.
var LINEAS = [
  ['test_crear_reserva', 0], ['test_listar_reservas', 0], ['test_fechas_invertidas', 1], ['test_token_valido', 0],
  ['test_esquema_respuesta', 0], ['test_precio_negativo', 1], ['test_borrar_reserva', 0], ['test_id_inexistente', 1]
];

export function iniciar(el) {
  el.innerHTML = '<div class="py"><div class="py-barra"><i></i><i></i><i></i><span>pytest</span></div>' +
    '<div class="py-cuerpo"><p class="py-cmd"><b>$</b> pytest tests/ -v</p>' +
    LINEAS.map(function (l) {
      return '<p class="py-l ' + (l[1] ? 'hall' : 'ok') + '"><span class="py-n">' + l[0] + '</span><span class="py-e">' +
        (l[1] ? t('HALLAZGO', 'FINDING') : 'PASSED') + '</span></p>';
    }).join('') +
    '<div class="py-prog"><i class="c"></i><i class="v"></i></div>' +
    '<p class="py-res"><span class="g">' + t('30 casos', '30 cases') + '</span> · <span class="h">' + t('16 hallazgos', '16 findings') + '</span></p></div></div>';

  var api = { progress: function () {} };
  if (hayMovimiento()) {
    var gsap = window.gsap;
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
    var q = function (c) { return el.querySelector(c); };
    tl.fromTo(q('.py-cmd'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    el.querySelectorAll('.py-l').forEach(function (l, i) {
      tl.fromTo(l, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.2 }, 0.5 + i * 0.4);
    });
    tl.fromTo(q('.py-prog .c'), { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: 3.2, ease: 'none' }, 0.5);
    tl.fromTo(q('.py-prog .c'), { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, 3.7);
    tl.fromTo(q('.py-prog .v'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 3.7);
    tl.fromTo(q('.py-res'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 }, 4);
    tl.set({}, {}, 6);
    api = bucle(el, tl);
  }
  registrar('pytest', api);
}
