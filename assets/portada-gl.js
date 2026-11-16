import * as THREE from '../vendor/three.module.min.js';
import { FRAGMENTOS, MANCHAS, TONOS, idiomaActual } from './escena.js';

const RADIO = 120;
const RECORRIDO = 1.6;

const VERTICE = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAGMENTO = /* glsl */`
precision highp float;
uniform sampler2D uNitido;
uniform sampler2D uBorroso;
uniform sampler2D uEstela;
uniform vec2 uRaton;
uniform vec2 uRes;
uniform float uRadio;
uniform float uTiempo;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ruido(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * ruido(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 px = vUv * uRes;
  float d = distance(px, uRaton * uRes);
  float lupa = 1.0 - smoothstep(uRadio * 0.55, uRadio, d);
  float claro = clamp(max(lupa, texture2D(uEstela, vUv).a), 0.0, 1.0);

  float niebla = fbm(px / 240.0 + vec2(uTiempo * 0.035, -uTiempo * 0.02));
  float gotas = smoothstep(0.64, 0.82, fbm(px / 34.0 + 7.0));
  vec2 desvio = (vec2(fbm(px / 90.0 + 3.0), fbm(px / 90.0 + 9.0)) - 0.5) * 0.014;

  vec3 empanado = texture2D(uBorroso, vUv + desvio).rgb;
  empanado = mix(empanado, vec3(0.60, 0.70, 0.76), 0.04 + 0.07 * niebla) + gotas * 0.012;
  vec3 nitido = texture2D(uNitido, vUv).rgb;
  vec3 color = mix(empanado, nitido, claro);
  // Abajo se funde con el fondo de la página para que la portada no acabe en seco.
  color = mix(vec3(0.055, 0.086, 0.110), color, smoothstep(0.0, 0.28, vUv.y));
  gl_FragColor = vec4(color, 1.0);
}`;

function pastilla(ctx, f, l, ancho, alto, s) {
  ctx.font = `500 ${14 * s}px "JetBrains Mono", Consolas, monospace`;
  const texto = f[l];
  const w = ctx.measureText(texto).width + 46 * s;
  const h = 38 * s;
  const x = Math.min(f.x * ancho, ancho - w - 24 * s);
  const y = f.y * alto;
  ctx.fillStyle = 'rgba(19, 30, 37, 0.92)';
  ctx.strokeStyle = 'rgba(232, 239, 243, 0.10)';
  ctx.lineWidth = s;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = TONOS[f.tono];
  ctx.beginPath(); ctx.arc(x + 19 * s, y + h / 2, 4 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E8EFF3';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, x + 33 * s, y + h / 2 + s);
}

function dibujarEscena(nitido, borroso, ancho, alto, dpr) {
  const W = Math.round(ancho * dpr), H = Math.round(alto * dpr);
  nitido.width = W; nitido.height = H;
  const c = nitido.getContext('2d');
  c.fillStyle = '#0E161C'; c.fillRect(0, 0, W, H);
  const lado = Math.max(W, H);
  for (const m of MANCHAS) {
    const g = c.createRadialGradient(m.x * W, m.y * H, 0, m.x * W, m.y * H, m.r * lado);
    g.addColorStop(0, TONOS[m.tono] + '55'); g.addColorStop(1, TONOS[m.tono] + '00');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  const l = idiomaActual();
  for (const f of FRAGMENTOS) pastilla(c, f, l, W, H, dpr);

  // Desenfoque barato y universal: reducir y volver a ampliar.
  const chico = document.createElement('canvas');
  chico.width = Math.max(1, Math.round(W / 12)); chico.height = Math.max(1, Math.round(H / 12));
  const cc = chico.getContext('2d');
  cc.imageSmoothingQuality = 'high';
  cc.drawImage(nitido, 0, 0, chico.width, chico.height);
  borroso.width = W; borroso.height = H;
  const cb = borroso.getContext('2d');
  cb.imageSmoothingQuality = 'high';
  cb.drawImage(chico, 0, 0, W, H);
}

export function iniciarPortada(canvas) {
  const portada = canvas.closest('#portada');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);

  const nitido = document.createElement('canvas');
  const borroso = document.createElement('canvas');
  const estela = document.createElement('canvas');
  estela.width = 160; estela.height = 90;
  const ce = estela.getContext('2d');

  const texturas = [new THREE.CanvasTexture(nitido), new THREE.CanvasTexture(borroso), new THREE.CanvasTexture(estela)];
  for (const t of texturas) { t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; }
  const uniforms = {
    uNitido: { value: texturas[0] }, uBorroso: { value: texturas[1] }, uEstela: { value: texturas[2] },
    uRaton: { value: new THREE.Vector2(0.7, 0.4) }, uRes: { value: new THREE.Vector2(1, 1) },
    uRadio: { value: 0 }, uTiempo: { value: 0 },
  };
  const escena = new THREE.Scene();
  escena.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: VERTICE, fragmentShader: FRAGMENTO, uniforms })));
  const camara = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let ancho = 0, alto = 0;
  const medir = () => {
    const r = portada.getBoundingClientRect();
    ancho = r.width; alto = r.height;
    renderer.setSize(ancho, alto, false);
    uniforms.uRes.value.set(ancho, alto);
    dibujarEscena(nitido, borroso, ancho, alto, dpr);
    texturas[0].needsUpdate = true; texturas[1].needsUpdate = true;
  };
  medir();

  // Ratón en fracciones de la portada, con y hacia arriba como en el shader.
  const raton = { x: 0.7, y: 0.4, dentro: false, ultimo: null };
  const mover = (e) => {
    const r = portada.getBoundingClientRect();
    raton.x = (e.clientX - r.left) / r.width;
    raton.y = 1 - (e.clientY - r.top) / r.height;
    raton.dentro = raton.y >= 0 && raton.y <= 1;
  };
  const salir = () => { raton.dentro = false; raton.ultimo = null; };
  portada.addEventListener('pointermove', mover);
  portada.addEventListener('pointerleave', salir);
  window.addEventListener('resize', medir);
  document.addEventListener('idioma', medir);

  const trazo = (x, y) => {
    const ex = x * estela.width, ey = (1 - y) * estela.height;
    const rad = (RADIO * 0.75 / alto) * estela.height;
    const g = ce.createRadialGradient(ex, ey, 0, ex, ey, rad);
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ce.fillStyle = g; ce.beginPath(); ce.arc(ex, ey, rad, 0, Math.PI * 2); ce.fill();
  };

  let visible = true, cuadros = 0, raf = 0, inicio = performance.now(), parado = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; programar(); });
  io.observe(portada);
  const alCambiarPestaña = () => programar();
  document.addEventListener('visibilitychange', alCambiarPestaña);

  function cuadro(ahora) {
    raf = 0;
    const t = (ahora - inicio) / 1000;
    let objetivo = 0;
    let x = raton.x, y = raton.y;
    if (t < RECORRIDO && !raton.dentro) {
      // Recorrido inicial: la lupa enseña sola el gesto.
      const k = t / RECORRIDO;
      x = 0.56 + 0.30 * k; y = 0.72 - 0.42 * k + Math.sin(k * Math.PI) * 0.12;
      objetivo = RADIO * Math.sin(k * Math.PI);
    } else if (raton.dentro) {
      objetivo = RADIO;
    }
    ce.globalCompositeOperation = 'destination-out';
    ce.fillStyle = 'rgba(0,0,0,0.06)';
    ce.fillRect(0, 0, estela.width, estela.height);
    ce.globalCompositeOperation = 'source-over';
    if (objetivo > 1) {
      const prev = raton.ultimo || { x, y };
      for (let i = 1; i <= 4; i++) trazo(prev.x + (x - prev.x) * i / 4, prev.y + (y - prev.y) * i / 4);
      raton.ultimo = { x, y };
    }
    texturas[2].needsUpdate = true;
    uniforms.uRaton.value.set(x, y);
    uniforms.uRadio.value += (objetivo - uniforms.uRadio.value) * 0.18;
    uniforms.uTiempo.value = t;
    renderer.render(escena, camara);
    cuadros++;
    programar();
  }

  function programar() {
    if (parado || raf || !visible || document.hidden) return;
    raf = requestAnimationFrame(cuadro);
  }
  programar();

  return {
    cuadros: () => cuadros,
    detener() {
      parado = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      portada.removeEventListener('pointermove', mover);
      portada.removeEventListener('pointerleave', salir);
      window.removeEventListener('resize', medir);
      document.removeEventListener('idioma', medir);
      document.removeEventListener('visibilitychange', alCambiarPestaña);
      texturas.forEach((t) => t.dispose());
      renderer.dispose();
    },
  };
}
