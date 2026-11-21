// Lo "privado" detrás del vidrio de la portada; lo usan la versión CSS y la WebGL.
// x, y: posición en ordenador (fracción de la portada); m: en móvil, o null si no cabe.
export const FRAGMENTOS = [
  { x: 0.60, y: 0.22, m: [0.05, 0.13], tono: 'cian', es: '@lau.mtz te dejó de seguir', en: '@lau.mtz unfollowed you' },
  { x: 0.76, y: 0.34, m: [0.38, 0.20], tono: 'verde', es: 'Mamá: ¿ya llegaste?', en: 'Mom: home yet?' },
  { x: 0.57, y: 0.47, m: [0.12, 0.27], tono: 'ambar', es: 'Reduje en 66 % el cierre mensual', en: 'Cut month-end close by 66%' },
  { x: 0.81, y: 0.56, m: null, tono: 'verde', es: '3 no leídos', en: '3 unread' },
  { x: 0.66, y: 0.66, m: [0.30, 0.34], tono: 'cian', es: 'cuenta suspendida, no se fue', en: 'suspended, did not leave' },
  { x: 0.79, y: 0.13, m: null, tono: 'ambar', es: '¿Cuánto bajó el tiempo?', en: 'How much faster was it?' },
  { x: 0.73, y: 0.79, m: null, tono: 'verde', es: 'Jefe: ¿hablamos mañana?', en: 'Boss: talk tomorrow?' },
];

export const TONOS = { cian: '#4FC7D1', verde: '#6FBE8C', ambar: '#E9B35A' };

// Manchas de color de fondo: centro (fracción) y radio (fracción del lado mayor).
export const MANCHAS = [
  { x: 0.70, y: 0.30, r: 0.34, tono: 'cian' },
  { x: 0.88, y: 0.70, r: 0.30, tono: 'verde' },
  { x: 0.55, y: 0.78, r: 0.26, tono: 'ambar' },
];

export function idiomaActual() {
  return document.documentElement.lang === 'en' ? 'en' : 'es';
}

// Pinta los fragmentos como HTML dentro de cada .escena del contenedor.
export function montarEscenaCSS(contenedor) {
  const pintar = () => {
    const l = idiomaActual();
    contenedor.querySelectorAll('.escena').forEach((capa) => {
      capa.replaceChildren(...FRAGMENTOS.map((f) => {
        const el = document.createElement('span');
        el.className = 'frag' + (f.m ? '' : ' solo-ancho');
        el.textContent = f[l];
        el.style.cssText = `--x:${f.x * 100}%;--y:${f.y * 100}%;--tono:${TONOS[f.tono]}` +
          (f.m ? `;--xm:${f.m[0] * 100}%;--ym:${f.m[1] * 100}%` : '');
        return el;
      }));
    });
  };
  pintar();
  document.addEventListener('idioma', pintar);
}
