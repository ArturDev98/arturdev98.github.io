import { hayMovimiento, registrar, bucle, t } from './base.js';

// Chats genéricos; la fila revelada al final (índice 3) es el estado de reposo.
var CHATS = [
  ['Familia', 'Family', '¿Ya llegaste?', 'Home yet?', '#E9B35A'],
  ['Equipo · Trabajo', 'Team · Work', 'El informe va mañana', 'Report is due tomorrow', '#4FC7D1'],
  ['Sofía', 'Sofía', 'Te mando la foto', 'Sending you the photo', '#6FBE8C'],
  ['Banco', 'Bank', 'Tu código de acceso', 'Your access code', '#B9CAD4']
];
var CURSOR = '<svg class="sh-cursor" viewBox="0 0 20 20"><path d="M3 2l13 7-6 1.6L7.4 17z"/></svg>';

export function iniciar(el) {
  var tactil = !matchMedia('(hover: hover)').matches;
  function chat(c) {
    return '<span class="sh-av" style="background:' + c[4] + '"></span><span class="sh-tx"><b>' + t(c[0], c[1]) + '</b><span>' + t(c[2], c[3]) + '</span></span>';
  }
  el.innerHTML = '<div class="sh">' + CHATS.map(function (c, i) {
    return '<div class="sh-fila"><div class="sh-borroso">' + chat(c) + '</div>' +
      '<div class="sh-claro" style="opacity:' + (i === 3 ? 1 : 0) + '">' + chat(c) + '</div>' + CURSOR + '</div>';
  }).join('') + '<p class="sh-pista">' + (tactil ? t('Toca un chat para revelarlo', 'Tap a chat to reveal it') :
    t('Pasa el cursor para revelar', 'Hover to reveal')) + '</p></div>';

  var filas = el.querySelectorAll('.sh-fila');
  var claros = el.querySelectorAll('.sh-claro');
  var api = { progress: function () {} };
  var auto = null;
  if (hayMovimiento()) {
    var gsap = window.gsap;
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
    // Fila, entrada y salida del cursor de demostración (s); la última se queda revelada.
    [[1, 0.7, 3.4], [3, 4, 6.5]].forEach(function (m) {
      var f = filas[m[0]], cl = f.querySelector('.sh-claro'), cu = f.querySelector('.sh-cursor');
      tl.fromTo(cu, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.4 }, m[1]);
      tl.fromTo(cl, { opacity: 0 }, { opacity: 1, duration: 0.25 }, m[1] + 0.4);
      if (m[2] < 6) {
        tl.fromTo(cl, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, m[2]);
        tl.fromTo(cu, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, m[2]);
      }
    });
    tl.set({}, {}, 6);
    auto = bucle(el, tl);
    api = auto;
  }

  // Interacción real: el cursor o el toque del visitante sustituyen a la demostración.
  var temporizador = null;
  function revelar(f, si) {
    if (auto) auto.detener();
    filas.forEach(function (x) { x.querySelector('.sh-cursor').style.opacity = 0; });
    claros.forEach(function (c) { c.style.opacity = 0; });
    if (si) f.querySelector('.sh-claro').style.opacity = 1;
  }
  filas.forEach(function (f) {
    if (tactil) {
      f.addEventListener('pointerdown', function () {
        revelar(f, true);
        clearTimeout(temporizador);
        temporizador = setTimeout(function () { revelar(f, false); }, 2000);
      });
    } else {
      f.addEventListener('pointerenter', function () { revelar(f, true); });
      f.addEventListener('pointerleave', function () { revelar(f, false); });
    }
  });
  registrar('shield', api);
}
