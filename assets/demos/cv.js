import { t } from '../textos.js';

// Instantes (s): el logro nuevo empieza a escribirse y cada palabra tarda PASO en entrar.
const REESCRIBE = 3.2;
const PASO = 0.06;
const RESALTA = 4.6;

export function crearDemoCV(raiz) {
  raiz.setAttribute('aria-hidden', 'true');
  raiz.innerHTML = `
    <div class="cvd">
      <div class="cvd-hoja">
        <div class="cvd-cabeza"><span class="cvd-etiqueta"></span><span class="cvd-seccion"></span></div>
        <p class="cvd-cargo"></p>
        <div class="cvd-linea">
          <p class="logro-antes"><span class="logro-antes-txt"></span></p>
          <p class="logro"></p>
        </div>
      </div>
      <div class="cvd-chat">
        <p class="burbuja"><small>Best CV</small><span class="burbuja-txt"></span></p>
        <p class="respuesta"><small class="respuesta-quien"></small><span class="respuesta-txt"></span></p>
      </div>
    </div>`;

  const $ = (s) => raiz.querySelector(s);
  const logro = $('.logro');
  let palabras = [];

  function escribirLogro() {
    logro.replaceChildren(...t('cv_despues').split(' ').flatMap((p, i) => {
      const s = document.createElement('span');
      s.className = 'palabra' + (/66/.test(p) ? ' dato' : '');
      s.textContent = p;
      return i ? [document.createTextNode(' '), s] : [s];
    }));
    palabras = [...logro.querySelectorAll('.palabra')];
  }

  function pintarTextos() {
    $('.cvd-seccion').textContent = t('cv_seccion');
    $('.cvd-cargo').textContent = t('cv_cargo');
    $('.logro-antes-txt').textContent = t('cv_antes');
    $('.burbuja-txt').textContent = t('cv_pregunta');
    $('.respuesta-quien').textContent = t('cv_tu');
    $('.respuesta-txt').textContent = t('cv_respuesta');
    escribirLogro();
    pintarTiempo();
  }

  // Lo que depende del tiempo se calcula aquí, así el idioma puede cambiar a mitad sin rehacer la línea.
  function pintarTiempo() {
    const tiempo = tl ? tl.time() : 0;
    $('.cvd-etiqueta').textContent = tiempo < REESCRIBE ? t('cv_etiqueta_antes') : t('cv_etiqueta_despues');
    raiz.classList.toggle('reescrito', tiempo >= REESCRIBE);
    palabras.forEach((s, i) => {
      const k = Math.min(1, Math.max(0, (tiempo - REESCRIBE - i * PASO) / 0.3));
      s.style.opacity = k;
      s.style.transform = `translateY(${(1 - k) * 6}px)`;
    });
    logro.style.setProperty('--resalte', Math.min(1, Math.max(0, (tiempo - RESALTA) / 0.5)));
  }

  const gsap = window.gsap;
  let tl = null;
  gsap.set([$('.burbuja'), $('.respuesta')], { autoAlpha: 0, y: 10 });
  gsap.set(logro, { autoAlpha: 0 });
  tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onUpdate: pintarTiempo });
  tl.fromTo($('.logro-antes-txt'), { '--tachado': 0 }, { '--tachado': 1, duration: 0.6, ease: 'power2.inOut' }, 0.6)
    .to($('.burbuja'), { autoAlpha: 1, y: 0, duration: 0.45 }, 1.4)
    .to($('.respuesta'), { autoAlpha: 1, y: 0, duration: 0.45 }, 2.2)
    .to($('.logro-antes'), { autoAlpha: 0, y: -6, duration: 0.35 }, REESCRIBE - 0.2)
    .to(logro, { autoAlpha: 1, duration: 0.01 }, REESCRIBE)
    .to({}, { duration: 1.4 }, RESALTA);

  document.addEventListener('idioma', pintarTextos);
  pintarTextos();
  return tl;
}
