import * as THREE from '../vendor/three.module.min.js';

var COLS = 24, FILAS = 14, COL_FALLA = 15, FILA_FALLA = 8, CICLO = 6;
var SUELO = new THREE.Color('#1A2B34'), CIAN = new THREE.Color('#4FC7D1');
var AMBAR = new THREE.Color('#E9B35A'), VERDE = new THREE.Color('#6FBE8C');

function suave(a, b, x) {
  var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function iniciarFondoGl(fondo, zona) {
  var canvas = document.createElement('canvas');
  canvas.className = 'fondo-lienzo';
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
  try {
    var api = montar(zona, renderer);
    fondo.appendChild(canvas);
    // Si la GPU se reinicia, vuelve la matriz CSS en vez de un lienzo en blanco.
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); api.detener(); canvas.remove();
      fondo.classList.remove('fondo-gl'); fondo.classList.add('fondo-css');
    });
    return api;
  } catch (e) {
    renderer.dispose();
    renderer.forceContextLoss();
    throw e;
  }
}

function montar(zona, renderer) {
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  var escena = new THREE.Scene();
  var camara = new THREE.PerspectiveCamera(32, 1, 0.1, 400);
  var grupo = new THREE.Group();
  grupo.rotation.x = -0.65;
  escena.add(grupo);

  var n = COLS * FILAS;
  var m4 = new THREE.Matrix4();
  var celdas = new THREE.InstancedMesh(new THREE.BoxGeometry(0.86, 0.86, 0.3), new THREE.MeshBasicMaterial(), n);
  // El borde cian tenue es una placa algo mayor, debajo de cada celda.
  var borde = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.97, 0.97),
    new THREE.MeshBasicMaterial({ color: CIAN, transparent: true, opacity: 0.4, depthWrite: false }), n);
  var tmp = new THREE.Color();
  for (var f = 0; f < FILAS; f++) {
    for (var c = 0; c < COLS; c++) {
      var i = f * COLS + c;
      m4.makeTranslation(c - (COLS - 1) / 2, (FILAS - 1) / 2 - f, 0);
      celdas.setMatrixAt(i, m4);
      m4.makeTranslation(c - (COLS - 1) / 2, (FILAS - 1) / 2 - f, -0.06);
      borde.setMatrixAt(i, m4);
      celdas.setColorAt(i, SUELO);
    }
  }
  grupo.add(borde, celdas);

  var cx = COL_FALLA - (COLS - 1) / 2, cy = (FILAS - 1) / 2 - FILA_FALLA;
  var linea = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1), new THREE.MeshBasicMaterial({ color: VERDE, transparent: true }));
  linea.visible = false;
  grupo.add(linea);

  var lienzo = document.createElement('canvas');
  lienzo.width = lienzo.height = 64;
  var cg = lienzo.getContext('2d'), gr = cg.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  cg.fillStyle = gr; cg.fillRect(0, 0, 64, 64);
  var brillo = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(lienzo), color: AMBAR, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  brillo.position.set(cx, cy, 0.3);
  grupo.add(brillo);

  var iFalla = FILA_FALLA * COLS + COL_FALLA;
  var distancia = 40;
  function medir() {
    if (parado || visible === false) return;
    var r = zona.getBoundingClientRect();
    var ancho = Math.max(1, r.width), alto = Math.max(1, r.height);
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    // La matriz ocupa ~44 % del ancho, abajo y a la derecha, en la mitad derecha, que la máscara CSS difumina.
    var mitad = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    distancia = (COLS / 0.40) / (2 * mitad * camara.aspect);
    var visH = 2 * distancia * mitad;
    grupo.position.set(0.60 * 0.5 * visH * camara.aspect, 0.28 * 0.5 * visH, 0);
    camara.updateProjectionMatrix();
  }
  medir();
  window.addEventListener('resize', medir);

  var objetivo = { x: 0, y: 0 }, actual = { x: 0, y: 0 };
  function mover(e) {
    if (parado || visible === false || document.hidden) return;
    objetivo.x = (e.clientX / innerWidth) * 2 - 1;
    objetivo.y = (e.clientY / innerHeight) * 2 - 1;
  }
  window.addEventListener('pointermove', mover, { passive: true });

  var visible = true, cuadros = 0, raf = 0, parado = false, inicio = performance.now();
  var io = new IntersectionObserver(function (e) { visible = e[e.length - 1].isIntersecting; if (visible) medir(); programar(); });
  io.observe(zona);
  function alCambiarPestana() { programar(); }
  document.addEventListener('visibilitychange', alCambiarPestana);

  function pintarCeldas(t) {
    // Barrido: una banda cian recorre las columnas en los primeros 2,4 s del ciclo.
    var x = -3 + suave(0, 2.4, t) * (COLS + 6);
    for (var f = 0; f < FILAS; f++) {
      for (var c = 0; c < COLS; c++) {
        var k = 1 - Math.min(1, Math.abs(c - x) / 2.5);
        tmp.copy(SUELO).lerp(CIAN, k * 0.75);
        celdas.setColorAt(f * COLS + c, tmp);
        m4.makeTranslation(c - (COLS - 1) / 2, (FILAS - 1) / 2 - f, k * 0.45);
        celdas.setMatrixAt(f * COLS + c, m4);
      }
    }
    // La celda falla (ámbar), se corrige (verde) y de ella sube la línea.
    var ambar = suave(2.7, 3.1, t), verde = suave(3.7, 4.1, t), fin = 1 - suave(5.5, 5.95, t);
    tmp.copy(SUELO).lerp(AMBAR, ambar).lerp(VERDE, verde);
    tmp.lerp(SUELO, 1 - fin);
    celdas.setColorAt(iFalla, tmp);
    var lev = Math.max(ambar, verde) * fin;
    m4.makeScale(1 + 0.5 * lev, 1 + 0.5 * lev, 1 + lev);
    m4.setPosition(cx, cy, 0.9 * lev);
    celdas.setMatrixAt(iFalla, m4);
    celdas.instanceMatrix.needsUpdate = true;
    brillo.material.opacity = 0.9 * ambar * (1 - verde);
    var alza = suave(4.1, 4.9, t) * 5;
    linea.visible = alza > 0.01 && fin > 0.01;
    linea.scale.z = Math.max(0.01, alza);
    linea.position.set(cx, cy, alza / 2);
    linea.material.opacity = fin;
    celdas.instanceColor.needsUpdate = true;
  }

  function cuadro(ahora) {
    raf = 0;
    var t = ((ahora - inicio) / 1000) % CICLO;
    actual.x += (objetivo.x - actual.x) * 0.05;
    actual.y += (objetivo.y - actual.y) * 0.05;
    // Cámara en órbita corta: ±4° con el cursor.
    var a = THREE.MathUtils.degToRad(4);
    camara.position.set(Math.sin(actual.x * a) * distancia, Math.sin(-actual.y * a) * distancia, Math.cos(actual.x * a) * distancia);
    camara.lookAt(0, 0, 0);
    pintarCeldas(t);
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
    cuadros: function () { return cuadros; },
    detener: function () {
      parado = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', medir);
      window.removeEventListener('pointermove', mover);
      document.removeEventListener('visibilitychange', alCambiarPestana);
      renderer.dispose();
    }
  };
}
