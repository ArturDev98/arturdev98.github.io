// Textos de las demos; los nombres y cuentas son inventados.
const TEXTOS = {
  es: {
    fa_cuenta: '@tu.cuenta',
    fa_seguidores: 'seguidores',
    fa_revisando: 'Revisando…',
    fa_revisado: 'Revisado ahora',
    fa_te_sigue: 'te sigue',
    fa_suspendida: 'suspendida',
    fa_fue: 'te dejó de seguir',
    fa_fue_meta: 'hace 2 h',
    fa_susp: 'cuenta suspendida',
    fa_susp_meta: 'No te dejó de seguir: Instagram la suspendió',
    sh_buscar: 'Buscar un chat',
    sh_intensidad: 'Intensidad',
    sh_revelar: 'Pasa el cursor o toca un chat para verlo',
    cv_antes: 'Encargado de mejorar procesos del área contable.',
    cv_pregunta: '¿Cuánto bajó el tiempo?',
    cv_respuesta: 'De 3 días a 1',
    cv_despues: 'Reduje en 66 % el tiempo de cierre mensual, de 3 días a 1, al automatizar la conciliación.',
    cv_etiqueta_antes: 'Tu CV',
    cv_etiqueta_despues: 'Best CV',
  },
  en: {
    fa_cuenta: '@your.account',
    fa_seguidores: 'followers',
    fa_revisando: 'Checking…',
    fa_revisado: 'Checked just now',
    fa_te_sigue: 'follows you',
    fa_suspendida: 'suspended',
    fa_fue: 'unfollowed you',
    fa_fue_meta: '2 h ago',
    fa_susp: 'account suspended',
    fa_susp_meta: 'Did not unfollow you: Instagram suspended it',
    sh_buscar: 'Search a chat',
    sh_intensidad: 'Intensity',
    sh_revelar: 'Hover or tap a chat to see it',
    cv_antes: 'In charge of improving accounting processes.',
    cv_pregunta: 'How much faster did it get?',
    cv_respuesta: 'From 3 days to 1',
    cv_despues: 'Cut month-end close time by 66%, from 3 days to 1, by automating reconciliation.',
    cv_etiqueta_antes: 'Your CV',
    cv_etiqueta_despues: 'Best CV',
  },
};

export function idioma() {
  return document.documentElement.lang === 'en' ? 'en' : 'es';
}

export function t(clave) {
  return TEXTOS[idioma()][clave] ?? clave;
}

export function numero(n) {
  return new Intl.NumberFormat(idioma() === 'en' ? 'en-US' : 'es-ES').format(n);
}
