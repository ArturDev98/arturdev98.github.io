// Sustituto de la línea de tiempo cuando GSAP no cargó: la demo pinta su estado final y no se mueve.
export function lineaQuieta(raiz) {
  raiz.classList.add('quieta');
  return { time: () => Infinity, progress() { return this; } };
}
