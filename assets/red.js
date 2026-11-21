// Red de nodos y líneas fija detrás de la página: canvas 2D propio, sin librerías.
var RADIO = 160, CIAN = '79,199,209', GRIS = '125,150,164';

export function iniciarRed() {
  var reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var canvas = document.createElement('canvas');
  canvas.className = 'red';
  canvas.setAttribute('aria-hidden', 'true');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  document.body.appendChild(canvas);

  var nodos = [], ondas = [];
  var W = 0, H = 0, dpr = 1, enlace = 150;
  var mx = -1e4, my = -1e4;
  var cuadros = 0, ultimo = 0, id = 0;

  function sembrar() {
    // Un nodo cada ~18 000 px²; en táctil, un tercio menos.
    var n = Math.round(W * H / 18000 * (fino ? 1 : 0.65));
    enlace = Math.sqrt(W * H / Math.max(n, 1)) * 1.15;
    nodos.length = 0;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, v = 0.004 + Math.random() * 0.006;
      nodos.push({ x: Math.random() * W, y: Math.random() * H, vx: Math.cos(a) * v, vy: Math.sin(a) * v });
    }
  }

  function medir() {
    var w = window.innerWidth, h = window.innerHeight;
    if (w === W && h === H) return;
    var antes = W;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (antes && nodos.length) {
      // Redimensionar reparte los nodos que ya hay, sin saltos de red nueva.
      for (var i = 0; i < nodos.length; i++) { nodos[i].x *= w / W; nodos[i].y *= h / H; }
      W = w; H = h;
      var n = Math.round(W * H / 18000 * (fino ? 1 : 0.65));
      if (Math.abs(n - nodos.length) > nodos.length * 0.3) sembrar();
    } else { W = w; H = h; sembrar(); }
  }

  function dibujar(ahora) {
    cuadros++;
    ctx.clearRect(0, 0, W, H);
    var i, j, a, b, dx, dy, d, k;
    ctx.lineWidth = 1;
    for (i = 0; i < nodos.length; i++) {
      a = nodos[i];
      for (j = i + 1; j < nodos.length; j++) {
        b = nodos[j];
        dx = a.x - b.x; dy = a.y - b.y;
        if (dx > enlace || dx < -enlace || dy > enlace || dy < -enlace) continue;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d >= enlace) continue;
        ctx.strokeStyle = 'rgba(' + GRIS + ',' + (0.13 * (1 - d / enlace)).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    for (i = 0; i < nodos.length; i++) {
      a = nodos[i];
      dx = a.x - mx; dy = a.y - my;
      d = Math.sqrt(dx * dx + dy * dy);
      k = d < RADIO ? 1 - d / RADIO : 0;
      // El anillo de una onda ilumina por un instante los nodos que cruza.
      for (j = 0; j < ondas.length; j++) {
        var o = ondas[j], t = Math.max(0, (ahora - o.t0) / 750);
        var dd = Math.abs(Math.sqrt((a.x - o.x) * (a.x - o.x) + (a.y - o.y) * (a.y - o.y)) - t * 240);
        if (dd < 26) k = Math.max(k, (1 - dd / 26) * (1 - t) * 0.9);
      }
      if (k > 0) {
        if (d < RADIO) {
          ctx.strokeStyle = 'rgba(' + CIAN + ',' + (0.22 * k).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(' + CIAN + ',' + (0.3 + 0.5 * k).toFixed(3) + ')';
      } else ctx.fillStyle = 'rgba(' + GRIS + ',0.3)';
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.6 + k * 1.2, 0, 6.283); ctx.fill();
    }
    for (j = 0; j < ondas.length; j++) {
      var w = ondas[j], u = Math.max(0, (ahora - w.t0) / 750);
      ctx.strokeStyle = 'rgba(' + CIAN + ',' + (0.2 * (1 - u)).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(w.x, w.y, u * 240, 0, 6.283); ctx.stroke();
    }
  }

  function cuadro(ahora) {
    id = 0;
    // Deriva lenta: 30 cuadros por segundo bastan y aligeran la CPU.
    if (ultimo && ahora - ultimo < 30 && !ondas.length) { id = requestAnimationFrame(cuadro); return; }
    var dt = Math.min(ahora - (ultimo || ahora), 64);
    ultimo = ahora;
    ondas = ondas.filter(function (o) { return ahora - o.t0 < 750; });
    if (fino) {
      for (var i = 0; i < nodos.length; i++) {
        var n = nodos[i];
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
      }
    }
    dibujar(ahora);
    // En táctil solo se anima mientras dura una onda.
    if (fino || ondas.length) id = requestAnimationFrame(cuadro);
  }
  function arrancar() {
    if (id || document.hidden) return;
    ultimo = 0;
    id = requestAnimationFrame(cuadro);
  }

  medir();
  window.__red = { cuadros: function () { return cuadros; }, nodos: function () { return nodos.length; } };
  if (reducido) {
    dibujar(0);
    window.addEventListener('resize', function () { medir(); dibujar(0); });
    return;
  }

  window.addEventListener('resize', function () { medir(); if (!id) dibujar(performance.now()); });
  if (fino) {
    window.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { mx = my = -1e4; });
  }
  window.addEventListener('pointerdown', function (e) {
    ondas.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
    if (ondas.length > 4) ondas.shift();
    arrancar();
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(id); id = 0; } else if (fino) arrancar();
  });
  if (fino) arrancar(); else dibujar(performance.now());
}
