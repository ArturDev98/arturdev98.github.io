import { t, idioma } from '../textos.js';
import { lineaQuieta } from './quieta.js';

const CHATS = [
  { quien: 'Mamá', who: 'Mom', es: '¿Ya llegaste? Avísame', en: 'Home yet? Let me know', hora: '21:04', sin_leer: 2, tono: '#E9B35A' },
  { quien: 'Equipo · Trabajo', who: 'Team · Work', es: 'Carlos: el informe va mañana', en: 'Carlos: report is due tomorrow', hora: '20:51', sin_leer: 5, tono: '#4FC7D1' },
  { quien: 'Sofía', who: 'Sofía', es: 'Foto', en: 'Photo', hora: '19:30', sin_leer: 0, tono: '#6FBE8C' },
  { quien: 'Banco Andino', who: 'Andino Bank', es: 'Tu código es 482 107', en: 'Your code is 482 107', hora: '18:12', sin_leer: 1, tono: '#B9CAD4' },
  { quien: 'Juan Pablo', who: 'Juan Pablo', es: 'jajaja ya lo vi', en: 'haha just saw it', hora: '17:40', sin_leer: 0, tono: '#4FC7D1' },
];
// Fila que revela el cursor de demostración en cada tramo (s).
const TRAMOS = [{ desde: 0.9, hasta: 2.3, fila: 1 }, { desde: 2.9, hasta: 4.3, fila: 3 }];
const TAPA_TACTIL = 2000;

export function crearDemoShield(raiz) {
  raiz.setAttribute('role', 'group');
  raiz.innerHTML = `
    <div class="sh">
      <div class="sh-buscar" aria-hidden="true"><svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg><span class="sh-buscar-txt"></span></div>
      <ul class="sh-lista" aria-hidden="true">
        ${CHATS.map((c) => `
          <li class="chat">
            <span class="chat-avatar" style="--av:${c.tono}"></span>
            <span class="chat-texto"><b class="chat-quien"></b><span class="chat-msg"></span></span>
            <span class="chat-lado"><small>${c.hora}</small>${c.sin_leer ? `<span class="no-leidos">${c.sin_leer}</span>` : ''}</span>
          </li>`).join('')}
      </ul>
      <svg class="sh-cursor" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2l13 7-6 1.6L7.4 17z"/></svg>
      <div class="sh-control">
        <label for="intensidad" class="sh-etiqueta"></label>
        <input type="range" id="intensidad" min="2" max="20" step="1" value="8">
        <output class="sh-valor" for="intensidad">8 px</output>
      </div>
      <p class="sh-pista"></p>
    </div>`;

  const $ = (s) => raiz.querySelector(s);
  const filas = [...raiz.querySelectorAll('.chat')];
  const rango = $('#intensidad');

  function pintarTextos() {
    const l = idioma();
    raiz.setAttribute('aria-label', l === 'en' ? 'Chat Privacy Shield demo' : 'Demostración de Chat Privacy Shield');
    $('.sh-buscar-txt').textContent = t('sh_buscar');
    $('.sh-etiqueta').textContent = t('sh_intensidad');
    $('.sh-pista').textContent = t('sh_revelar');
    filas.forEach((f, i) => {
      f.querySelector('.chat-quien').textContent = l === 'en' ? CHATS[i].who : CHATS[i].quien;
      f.querySelector('.chat-msg').textContent = CHATS[i][l];
    });
  }

  function fijarIntensidad() {
    raiz.style.setProperty('--desenfoque', rango.value + 'px');
    $('.sh-valor').textContent = rango.value + ' px';
  }
  rango.addEventListener('input', fijarIntensidad);

  // Revelado real: cursor encima, o dedo con un rato antes de volver a tapar.
  filas.forEach((f) => {
    let reloj = 0;
    f.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') f.classList.add('revelada'); });
    f.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') f.classList.remove('revelada'); });
    f.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      f.classList.add('revelada');
      clearTimeout(reloj);
      reloj = setTimeout(() => f.classList.remove('revelada'), TAPA_TACTIL);
    });
  });

  const gsap = window.gsap;
  const cursor = $('.sh-cursor');
  // Centro vertical de una fila, relativo a la demo, para llevar ahí el cursor.
  const alturaDe = (i) => () => filas[i].offsetTop + filas[i].offsetHeight / 2 - 6;

  const tl = gsap ? gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' }, onUpdate: pintarDemo }) : lineaQuieta(raiz);
  if (gsap) {
    tl.fromTo(cursor, { autoAlpha: 0, x: () => raiz.clientWidth * 0.8, y: () => raiz.clientHeight }, { autoAlpha: 1, duration: 0.3 }, 0.2)
      .to(cursor, { x: () => raiz.clientWidth * 0.42, y: alturaDe(1), duration: 0.6 }, 0.3)
      .to(cursor, { x: () => raiz.clientWidth * 0.5, y: alturaDe(3), duration: 0.6 }, 2.3)
      .to(cursor, { x: () => raiz.clientWidth * 0.85, y: () => raiz.clientHeight * 0.95, autoAlpha: 0, duration: 0.7 }, 4.3)
      .to({}, { duration: 0.6 });
  }

  function pintarDemo() {
    const tiempo = tl.time();
    const tramo = TRAMOS.find((x) => tiempo >= x.desde && tiempo < x.hasta);
    filas.forEach((f, i) => f.classList.toggle('revelada-demo', !!tramo && tramo.fila === i));
  }

  document.addEventListener('idioma', pintarTextos);
  pintarTextos();
  fijarIntensidad();
  return tl;
}
