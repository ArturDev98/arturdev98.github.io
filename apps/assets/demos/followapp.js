import { t, numero } from '../textos.js';
import { lineaQuieta } from './quieta.js';

const SEGUIDORES = [
  { nombre: 'Ana Vélez', cuenta: '@ana.vlz', tono: '#4FC7D1' },
  { nombre: 'Laura Martínez', cuenta: '@lau.mtz', tono: '#E9B35A', se_va: true },
  { nombre: 'Camilo Rojas', cuenta: '@c.rojas', tono: '#6FBE8C' },
  { nombre: 'Diego Ríos', cuenta: '@diego.rs', tono: '#B9CAD4', suspendida: true },
  { nombre: 'María F. Gil', cuenta: '@mafe.gl', tono: '#4FC7D1' },
];
const TOTAL = 12480;
// Instantes (s) en que cambia lo que dice la demo; el estado sale del tiempo para que el scroll pueda ir atrás.
const SE_VA = 1.6;
const SUSPENDE = 4.5;

function iniciales(nombre) {
  return nombre.split(' ').map((p) => p[0]).slice(0, 2).join('');
}

export function crearDemoFollowapp(raiz) {
  raiz.setAttribute('aria-hidden', 'true');
  raiz.innerHTML = `
    <div class="fa">
      <div class="fa-cabeza">
        <span class="fa-cuenta"></span>
        <span class="fa-total"><b class="fa-num"></b> <span class="fa-seg"></span></span>
      </div>
      <div class="fa-estado"><span class="fa-pulso"></span><span class="fa-estado-txt"></span></div>
      <ul class="fa-lista">
        ${SEGUIDORES.map((s) => `
          <li class="fa-fila${s.se_va ? ' se-va' : ''}${s.suspendida ? ' suspendida' : ''}">
            <span class="fa-avatar" style="--av:${s.tono}">${iniciales(s.nombre)}</span>
            <span class="fa-quien"><b>${s.nombre}</b><span>${s.cuenta}</span></span>
            <span class="fa-chip"></span>
          </li>`).join('')}
        <li class="fa-barrido" aria-hidden="true"></li>
      </ul>
      <div class="aviso">
        <span class="aviso-punto"></span>
        <span class="aviso-txt"><b class="aviso-quien"></b> <span class="aviso-que"></span><small class="aviso-meta"></small></span>
      </div>
    </div>`;

  const $ = (s) => raiz.querySelector(s);
  const fila = (clase) => raiz.querySelector(`.fa-fila.${clase}`);
  let estado = '';

  function pintar(forzar) {
    const tiempo = tl.time();
    const nuevo = tiempo < SE_VA ? 'inicio' : tiempo < SUSPENDE ? 'fue' : 'suspendida';
    if (nuevo === estado && !forzar) return;
    estado = nuevo;
    $('.fa-cuenta').textContent = t('fa_cuenta');
    $('.fa-seg').textContent = t('fa_seguidores');
    $('.fa-num').textContent = numero(TOTAL - (estado === 'inicio' ? 0 : estado === 'fue' ? 1 : 2));
    $('.fa-estado-txt').textContent = estado === 'inicio' ? t('fa_revisando') : t('fa_revisado');
    raiz.querySelectorAll('.fa-fila').forEach((f) => {
      const susp = f.classList.contains('suspendida') && estado === 'suspendida';
      f.querySelector('.fa-chip').textContent = susp ? t('fa_suspendida') : t('fa_te_sigue');
      f.classList.toggle('apagada', susp);
    });
    $('.aviso').classList.toggle('es-suspension', estado === 'suspendida');
    $('.aviso-quien').textContent = estado === 'suspendida' ? '@diego.rs' : '@lau.mtz';
    $('.aviso-que').textContent = estado === 'suspendida' ? t('fa_susp') : t('fa_fue');
    $('.aviso-meta').textContent = estado === 'suspendida' ? t('fa_susp_meta') : t('fa_fue_meta');
  }

  const gsap = window.gsap;
  const barrido = $('.fa-barrido');
  const aviso = $('.aviso');
  const tl = gsap ? gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onUpdate: () => pintar(false) }) : lineaQuieta(raiz);
  if (gsap) {
    gsap.set(aviso, { autoAlpha: 0, y: 16 });
    tl.fromTo(barrido, { top: '0%', autoAlpha: 1 }, { top: '100%', autoAlpha: 0, duration: 0.9, ease: 'power1.inOut' }, 0)
      .to(fila('se-va'), { backgroundColor: 'rgba(233,179,90,0.14)', duration: 0.3 }, 1.0)
      .to(fila('se-va'), { height: 0, paddingTop: 0, paddingBottom: 0, autoAlpha: 0, duration: 0.5, ease: 'power3.inOut' }, 1.25)
      .to(aviso, { autoAlpha: 1, y: 0, duration: 0.45 }, SE_VA)
      .fromTo(barrido, { top: '0%', autoAlpha: 1 }, { top: '100%', autoAlpha: 0, duration: 0.8, ease: 'power1.inOut', immediateRender: false }, 3.4)
      .to(aviso, { autoAlpha: 0, y: 10, duration: 0.25 }, 4.2)
      .to(aviso, { autoAlpha: 1, y: 0, duration: 0.45 }, SUSPENDE + 0.05)
      .to({}, { duration: 1 });
  }

  document.addEventListener('idioma', () => pintar(true));
  pintar(true);
  return tl;
}
