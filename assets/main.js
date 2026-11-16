import { montarEscenaCSS } from './escena.js';
import { crearDemoFollowapp } from './demos/followapp.js';
import { crearDemoShield } from './demos/shield.js';
import { crearDemoCV } from './demos/cv.js';

var IDIOMA = 'es';

function pintar(l) {
  IDIOMA = l;
  document.documentElement.lang = l;
  var nodos = document.querySelectorAll('[data-' + l + ']');
  for (var i = 0; i < nodos.length; i++) {
    nodos[i].textContent = nodos[i].getAttribute('data-' + l);
  }
  document.getElementById('b-es').classList.toggle('on', l === 'es');
  document.getElementById('b-en').classList.toggle('on', l === 'en');
  correo();
  document.dispatchEvent(new CustomEvent('idioma', { detail: { idioma: l } }));
}

document.getElementById('b-es').addEventListener('click', function () { pintar('es'); });
document.getElementById('b-en').addEventListener('click', function () { pintar('en'); });

var ENLACES = {
  followapp: 'https://chromewebstore.google.com/detail/nffhilcgedjjoednagidnimjnembkdho',
  shield: 'https://chromewebstore.google.com/detail/chat-privacy-shield/gillcdhclnchpkbifcnipfckmapodjpm'
};

function enlace() { return location.href.split('#')[0]; }

function correo() {
  var a = document.getElementById('correo');
  var asunto = IDIOMA === 'es' ? 'Las extensiones que quiero instalar' : 'The extensions I want to install';
  var cuerpo = enlace() + '\n\nFollowApp (Instagram)\n' + ENLACES.followapp +
    '\n\nChat Privacy Shield (WhatsApp Web)\n' + ENLACES.shield + '\n';
  a.href = 'mailto:?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
}

function avisar(texto) {
  var d = document.getElementById('dicho');
  d.textContent = texto;
  d.hidden = false;
}

// Portapapeles bloqueado, que pasa dentro de iframes: queda el metodo viejo.
function respaldo(texto, ok, mal) {
  var t = document.createElement('textarea');
  t.value = texto;
  t.setAttribute('readonly', '');
  t.style.position = 'fixed';
  t.style.opacity = '0';
  document.body.appendChild(t);
  t.select();
  var fue = false;
  try { fue = document.execCommand('copy'); } catch (e) { fue = false; }
  document.body.removeChild(t);
  avisar(fue ? ok : mal);
}

document.getElementById('copiar').addEventListener('click', function () {
  var texto = enlace();
  var ok = IDIOMA === 'es' ? 'Enlace copiado' : 'Link copied';
  var mal = IDIOMA === 'es' ? 'Cópialo de la barra de arriba' : 'Copy it from the address bar';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(function () { avisar(ok); }, function () { respaldo(texto, ok, mal); });
  } else {
    respaldo(texto, ok, mal);
  }
});

if (navigator.share) {
  var boton = document.getElementById('compartir');
  boton.hidden = false;
  boton.addEventListener('click', function () {
    navigator.share({ url: enlace() }).catch(function () {});
  });
}

// Una extension de Chrome no se instala en un telefono: hay que decirlo.
var esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 900);
if (esMovil) document.getElementById('movil').hidden = false;

// El navegador decide el idioma de partida; los botones mandan por encima.
if ((navigator.language || 'es').slice(0, 2) !== 'es') pintar('en');
else correo();

/* ---------- demos ---------- */

function demo(nombre) { return document.querySelector('.demo[data-demo="' + nombre + '"]'); }
window.__demos = {
  followapp: crearDemoFollowapp(demo('followapp')),
  shield: crearDemoShield(demo('shield')),
  cv: crearDemoCV(demo('cv')),
};

// Fijar la sección solo cabe si la pantalla es alta: si no, el texto quedaría cortado mientras dura.
export function modoDemos() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'quieto';
  if (window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 900 && window.innerHeight >= 640) return 'escritorio';
  return 'movil';
}

export function montarDemos(modo) {
  var nombres = Object.keys(window.__demos);
  if (modo === 'quieto' || !window.ScrollTrigger) {
    nombres.forEach(function (n) { window.__demos[n].progress(1); });
    return;
  }
  window.gsap.registerPlugin(window.ScrollTrigger);
  nombres.forEach(function (n) {
    var tl = window.__demos[n];
    if (modo === 'escritorio') {
      window.ScrollTrigger.create({
        trigger: document.getElementById(n), pin: true, start: 'top top', end: '+=120%', scrub: 0.6, animation: tl,
      });
    } else {
      tl.repeat(-1).repeatDelay(1.5);
      window.ScrollTrigger.create({
        trigger: demo(n), start: 'top 85%', end: 'bottom 10%',
        onToggle: function (st) { if (st.isActive) tl.play(); else tl.pause(); },
      });
    }
  });
}

montarDemos(modoDemos());

/* ---------- portada ---------- */

var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function debeUsarWebGL() {
  if (reducido || !window.matchMedia('(pointer: fine)').matches || window.innerWidth < 900) return false;
  var c = document.createElement('canvas');
  return !!(c.getContext('webgl2') || c.getContext('webgl'));
}

var portadaCSS = document.querySelector('.portada-css');
montarEscenaCSS(portadaCSS);

// La lupa CSS sigue al dedo o al cursor y vuelve a su recorrido tras un rato quieta.
var lupaQuieta = 0;
function seguir(e) {
  var r = portadaCSS.getBoundingClientRect();
  portadaCSS.style.setProperty('--lx', (e.clientX - r.left) + 'px');
  portadaCSS.style.setProperty('--ly', (e.clientY - r.top) + 'px');
  portadaCSS.classList.add('sigue');
  clearTimeout(lupaQuieta);
  lupaQuieta = setTimeout(function () { portadaCSS.classList.remove('sigue'); }, 2500);
}
var portada = document.getElementById('portada');
portada.addEventListener('pointermove', seguir);
portada.addEventListener('pointerdown', seguir);

function arrancarWebGL() {
  import('./portada-gl.js').then(function (m) {
    var canvas = document.getElementById('portada-gl');
    canvas.hidden = false;
    try {
      window.__portada = m.iniciarPortada(canvas);
      portadaCSS.hidden = true;
      portada.removeEventListener('pointermove', seguir);
      portada.removeEventListener('pointerdown', seguir);
    } catch (e) {
      canvas.hidden = true;
    }
  }, function () {});
}

// three.js llega después del primer pintado y solo donde se va a ver.
if (debeUsarWebGL()) {
  var esperarFuentes = document.fonts ? document.fonts.ready : Promise.resolve();
  if (document.readyState === 'complete') esperarFuentes.then(arrancarWebGL);
  else window.addEventListener('load', function () { esperarFuentes.then(arrancarWebGL); });
}
