var IDS = ['sobre-mi', 'experiencia', 'proyectos', 'mas-proyectos', 'herramientas', 'contacto'];

// Estado de las suites: depende solo de la posición. Superadas = las de arriba; al subir vuelven a pendiente.
function suites() {
  var secciones = IDS.map(function (id) { return document.getElementById(id); });
  var enlaces = IDS.map(function (id) { return document.querySelector('.suites a[href="#' + id + '"]'); });
  var puntos = enlaces.map(function (a) { return a && a.querySelector('.punto'); });
  var contador = document.querySelector('.c-n');
  var barra = document.querySelector('.barra');
  var arriba = document.querySelector('.arriba');
  var verMas = document.querySelector('.ver-mas');
  var pendiente = false;

  function calcular() {
    pendiente = false;
    var centro = window.innerHeight / 2;
    var activa = -1;
    for (var i = 0; i < secciones.length; i++) {
      if (secciones[i] && secciones[i].getBoundingClientRect().top <= centro) activa = i;
    }
    var alFinal = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (alFinal && window.scrollY > 0) activa = secciones.length - 1;
    for (var j = 0; j < secciones.length; j++) {
      if (enlaces[j]) {
        if (j === activa) enlaces[j].setAttribute('aria-current', 'true');
        else enlaces[j].removeAttribute('aria-current');
      }
      if (puntos[j]) puntos[j].setAttribute('data-estado', j < activa ? 'superada' : j === activa ? 'en-curso' : 'pendiente');
    }
    // Las de arriba de la actual; al llegar al fondo de contacto cuenta también esa.
    var n = String(Math.max(activa, 0) + (alFinal && activa === secciones.length - 1 && window.scrollY > 0 ? 1 : 0));
    if (contador && contador.textContent !== n) contador.textContent = n;
    if (barra) barra.classList.toggle('desplazada', window.scrollY > 8);
    if (arriba) arriba.classList.toggle('ver', window.scrollY > window.innerHeight * 0.9);
    if (verMas) verMas.classList.toggle('oculto', window.scrollY > 24);
  }
  function pedir() {
    if (!pendiente) { pendiente = true; requestAnimationFrame(calcular); }
  }
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  window.addEventListener('load', pedir);
  document.documentElement.classList.add('ar');
  calcular();
  vigilarVideo(arriba);
}

// El botón de inicio se aparta mientras el video pisa la franja inferior, donde van sus controles.
function vigilarVideo(arriba) {
  var v = document.querySelector('video[data-repeticion]');
  if (!arriba || !v || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (es) {
    arriba.classList.toggle('tapa', es[es.length - 1].isIntersecting);
  }, { rootMargin: '-84% 0px 0px 0px' }).observe(v);
}

// Cuenta desde 0 hasta el valor que ya está en el HTML, conservando prefijo y sufijo.
function contarCifras(gsap) {
  document.querySelectorAll('.cifras-hero .valor').forEach(function (el) {
    var m = el.textContent.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
    if (!m) return;
    var decimales = (m[2].split(/[.,]/)[1] || '').length;
    var objetivo = parseFloat(m[2].replace(',', '.'));
    var o = { v: 0 };
    el.textContent = m[1] + (0).toFixed(decimales) + m[3];
    gsap.to(o, {
      v: objetivo, duration: 1.2, ease: 'power2.out', delay: 0.25,
      onUpdate: function () { el.textContent = m[1] + o.v.toFixed(decimales) + m[3]; },
      onComplete: function () { el.textContent = m[0]; }
    });
  });
}

function animar(gsap, ST) {
  gsap.registerPlugin(ST);
  var hechos = new WeakSet();
  function revelar(els) {
    var nuevos = els.filter(function (e) { return !hechos.has(e); });
    nuevos.forEach(function (e) { hechos.add(e); });
    gsap.fromTo(nuevos, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'expo.out', overwrite: true });
  }
  // onLeave cubre lo que el visitante se saltó con un ancla.
  ST.batch('[data-revela]', { start: 'top 88%', once: true, onEnter: revelar, onEnterBack: revelar, onLeave: revelar });

  var linea = document.querySelector('.linea');
  if (linea) {
    gsap.fromTo(linea, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.tiempo', start: 'top 70%', end: 'bottom 60%', scrub: true }
    });
  }

  contarCifras(gsap);
  window.addEventListener('load', function () { ST.refresh(); });
}

export function iniciarMovimiento() {
  var raiz = document.documentElement;
  suites();
  document.querySelectorAll('.sub').forEach(function (s, i) {
    setTimeout(function () { s.classList.add('dibujada'); }, 500 + i * 100);
  });
  var reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  if (reducido || !gsap || !ST) return;
  raiz.classList.add('anima');
  try {
    animar(gsap, ST);
  } catch (e) {
    // Si algo falla a medias, se vuelve al contenido estático visible.
    raiz.classList.remove('anima');
    gsap.set('[data-revela], .linea', { clearProps: 'all' });
  }
}
