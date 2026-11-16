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
