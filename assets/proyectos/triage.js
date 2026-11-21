import { hayMovimiento, registrar, bucle, t } from './base.js';

// Tickets inventados y genéricos: solo sirven de utilería para la demo.
var TICKETS = [
  ['No puedo iniciar sesión', "I can't sign in", 'Acceso', 'Access', 'caducidad de la sesión', 'session expiry'],
  ['Cobro duplicado en mi factura', 'Duplicate charge on my invoice', 'Facturación', 'Billing', 'reintento de pago', 'payment retry'],
  ['La pantalla tarda en cargar', 'The page is slow to load', 'Rendimiento', 'Performance', 'consulta sin índice', 'query without index']
];

export function iniciar(el) {
  el.innerHTML = '<div class="tr"><p class="tr-cab"><span>' + t('Bandeja de tickets', 'Ticket inbox') +
    '</span><span>' + t('datos ficticios', 'fictional data') + '</span></p>' +
    TICKETS.map(function (k) {
      return '<div class="tr-fila"><span class="tr-punto"><i class="a"></i><i class="c"></i><i class="v"></i></span>' +
        '<div class="tr-txt"><b class="tr-titulo">' + t(k[0], k[1]) + '</b>' +
        '<span class="tr-chip">' + t(k[2], k[3]) + '</span>' +
        '<span class="tr-causa">' + t('causa probable: ' + k[4], 'probable cause: ' + k[5]) + '</span></div>' +
        '<i class="tr-barra"></i></div>';
    }).join('') + '</div>';

  var api = { progress: function () {} };
  if (hayMovimiento()) {
    var gsap = window.gsap;
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
    el.querySelectorAll('.tr-fila').forEach(function (f, i) {
      var s = 0.3 + i * 1.6, q = function (c) { return f.querySelector(c); };
      tl.fromTo(f, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, s);
      tl.fromTo(q('.a'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, s);
      tl.fromTo(q('.a'), { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, s + 0.5);
      tl.fromTo(q('.c'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, s + 0.5);
      tl.fromTo(q('.tr-barra'), { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'none' }, s + 0.5);
      tl.to(q('.tr-barra'), { opacity: 0, duration: 0.2 }, s + 1);
      tl.fromTo(q('.c'), { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, s + 1);
      tl.fromTo(q('.v'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, s + 1);
      tl.fromTo(q('.tr-chip'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, s + 1);
      tl.fromTo(q('.tr-causa'), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 }, s + 1.1);
    });
    tl.set({}, {}, 6.4);
    api = bucle(el, tl);
  }
  registrar('triage', api);
}
