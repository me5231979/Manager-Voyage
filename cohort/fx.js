/* =====================================================================
   MANAGER VOYAGE · THE COHORT · visual layer
   One three.js point field per hero, a different shape each week.
   Routes drawn on scroll, cards that tilt, a spotlight on dark bands,
   slides that stagger in. Everything here is decoration: the page
   works without it, and all of it stands down when the viewer prefers
   reduced motion or the device has no WebGL.
   ===================================================================== */
import * as THREE from '../assets/js/three/three.module.min.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(pointer: fine)').matches;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 1.1;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- palette, baked into vertex colours ---------- */
const C = {
  cream: new THREE.Color('#F5F3EF'), gold: new THREE.Color('#CFAE70'), hi: new THREE.Color('#ECB748'),
  oak: new THREE.Color('#946E24'), deep: new THREE.Color('#5A4418'), white: new THREE.Color('#FFFFFF')
};
const mix = (a, b, t) => a.clone().lerp(b, t);

/* ---------- a soft disc, drawn once, no texture file ---------- */
function sprite(){
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.22, 'rgba(255,255,255,.85)'); r.addColorStop(0.55, 'rgba(255,255,255,.2)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const VERT = `
attribute float aSize; attribute float aSeed; attribute vec3 aColor; attribute float aAlpha;
uniform float uScale; uniform float uTime; uniform float uFade;
varying vec3 vColor; varying float vAlpha;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = 0.72 + 0.28 * sin(uTime * 1.7 + aSeed * 6.2831);
  gl_PointSize = aSize * uScale / -mv.z;
  vColor = aColor; vAlpha = aAlpha * tw * uFade;
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform sampler2D uMap; varying vec3 vColor; varying float vAlpha;
void main(){
  float a = texture2D(uMap, gl_PointCoord).a;
  if(a < 0.02) discard;
  gl_FragColor = vec4(vColor, a * vAlpha);
}`;

/* ---------- shape samplers: each returns {p, c, s, a} arrays ---------- */
function make(n){ return { p: new Float32Array(n * 3), c: new Float32Array(n * 3), s: new Float32Array(n), a: new Float32Array(n), seed: new Float32Array(n), n: n, i: 0 }; }
function put(S, x, y, z, col, size, alpha){
  if(S.i >= S.n) return; const i = S.i++;
  S.p[i * 3] = x; S.p[i * 3 + 1] = y; S.p[i * 3 + 2] = z;
  S.c[i * 3] = col.r; S.c[i * 3 + 1] = col.g; S.c[i * 3 + 2] = col.b;
  S.s[i] = size; S.a[i] = alpha; S.seed[i] = Math.random();
}
function dust(S, k, box, col, size, alpha){ for(let i = 0; i < k; i++) put(S, rnd(-box[0], box[0]), rnd(-box[1], box[1]), rnd(-box[2], box[2]), mix(col, C.deep, Math.random() * 0.5), size * rnd(0.5, 1.3), alpha * rnd(0.4, 1)); }

const SCENES = {
  /* the route: a sea lane across the frame with four lit waypoints */
  voyage(n){
    const S = make(n);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-13, -5, 0), new THREE.Vector3(-6, 1.5, -2), new THREE.Vector3(1, -3, 1.5), new THREE.Vector3(8, 3.5, -1), new THREE.Vector3(16, 0.5, 0)]);
    const stops = [0.1, 0.37, 0.64, 0.9];
    const lane = Math.floor(n * 0.62), nodes = Math.floor(n * 0.14);
    for(let i = 0; i < lane; i++){
      const t = Math.random(); const P = curve.getPoint(t); const w = 0.35 + 1.1 * Math.abs(gauss());
      const near = Math.min.apply(null, stops.map(s => Math.abs(s - t)));
      const bright = clamp(1 - near * 9, 0, 1);
      put(S, P.x + gauss() * w, P.y + gauss() * w * 0.7, P.z + gauss() * 0.8, mix(C.oak, C.cream, 0.25 + bright * 0.6), 1.4 + bright * 1.6, 0.35 + bright * 0.5);
    }
    stops.forEach((s, k) => { const P = curve.getPoint(s); for(let i = 0; i < nodes / 4; i++){ const r = Math.abs(gauss()) * 0.9; const a = Math.random() * 6.283; put(S, P.x + Math.cos(a) * r, P.y + Math.sin(a) * r, P.z + gauss() * 0.4, mix(C.hi, C.white, Math.random() * 0.5), 2.2 + (1 - r) * 2.4, 0.7 + (1 - r) * 0.3); } });
    dust(S, n - S.i, [20, 10, 6], C.oak, 1, 0.35);
    return { S, spin: 0.0, sway: 0.02, shift: 0.14 };
  },
  /* week one: a compass rose, the four expectations as quadrants */
  compass(n){
    const S = make(n); const R = 7.2;
    const ring = Math.floor(n * 0.34), inner = Math.floor(n * 0.12), spokes = Math.floor(n * 0.3), core = Math.floor(n * 0.08);
    for(let i = 0; i < ring; i++){ const a = Math.random() * 6.283; const r = R + gauss() * 0.28; put(S, Math.cos(a) * r, Math.sin(a) * r, gauss() * 0.5, mix(C.gold, C.cream, Math.random() * 0.5), 1.6, 0.6); }
    for(let i = 0; i < inner; i++){ const a = Math.random() * 6.283; const r = 2.6 + gauss() * 0.15; put(S, Math.cos(a) * r, Math.sin(a) * r, gauss() * 0.3, C.oak, 1.3, 0.5); }
    for(let k = 0; k < 4; k++){ const a0 = k * Math.PI / 2 + Math.PI / 4; for(let i = 0; i < spokes / 4; i++){ const t = Math.random(); const r = 1.2 + t * (R - 1.4); const spread = (1 - t) * 0.9 + 0.08; const a = a0 + gauss() * spread * 0.35; put(S, Math.cos(a) * r, Math.sin(a) * r, gauss() * 0.4, mix(C.oak, C.hi, t), 1.2 + t * 2.2, 0.35 + t * 0.6); } }
    for(let i = 0; i < core; i++){ const r = Math.abs(gauss()) * 0.9; const a = Math.random() * 6.283; put(S, Math.cos(a) * r, Math.sin(a) * r, gauss() * 0.4, mix(C.hi, C.white, Math.random() * 0.6), 2.4 + (1 - r) * 2, 0.9); }
    dust(S, n - S.i, [19, 9.5, 5], C.oak, 0.9, 0.3);
    return { S, spin: 0.035, sway: 0.03 };
  },
  /* week two: the operating rhythm, a lattice that breathes */
  grid(n){
    const S = make(n); const cols = 46, rows = 20, sx = 0.78, sy = 0.78;
    const cells = cols * rows; const per = Math.max(1, Math.floor(n * 0.8 / cells));
    for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){
      const x = (c - cols / 2 + 0.5) * sx, y = (r - rows / 2 + 0.5) * sy; const cad = c % 5 === 0;
      for(let k = 0; k < per; k++) put(S, x + gauss() * 0.05, y + gauss() * 0.05, 0, cad ? C.hi : mix(C.oak, C.gold, r / rows), cad ? 2.2 : 1.6, cad ? 0.85 : 0.55);
    }
    dust(S, n - S.i, [19, 9.5, 5], C.oak, 0.9, 0.28);
    const base = S.p.slice();
    return { S, spin: 0, sway: 0.015, shift: 0.05, update(t){ const p = S.p; for(let i = 0; i < S.i; i++){ const x = base[i * 3], y = base[i * 3 + 1]; p[i * 3 + 2] = base[i * 3 + 2] + Math.sin(x * 0.42 + t * 0.9) * Math.cos(y * 0.38 - t * 0.6) * 1.1; } } };
  },
  /* week three: growth, a tree that branches toward the light */
  branch(n){
    const S = make(n); const segs = [];
    (function grow(x, y, ang, len, depth){ const nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len; segs.push([x, y, nx, ny, depth]); if(depth >= 5) return; const k = depth < 2 ? 2 : (Math.random() < 0.5 ? 2 : 3); for(let i = 0; i < k; i++){ const spread = rnd(0.32, 0.62) * (i % 2 ? 1 : -1) + rnd(-0.1, 0.1); grow(nx, ny, ang + spread, len * rnd(0.62, 0.76), depth + 1); } })(0, -9.5, Math.PI / 2, 5.2, 0);
    const per = Math.floor(n * 0.86 / segs.length);
    segs.forEach(s => { const d = s[4]; for(let i = 0; i < per; i++){ const t = Math.random(); const x = s[0] + (s[2] - s[0]) * t, y = s[1] + (s[3] - s[1]) * t; const w = (5 - d) * 0.09 + 0.05; const tip = d >= 4 && t > 0.75; put(S, x + gauss() * w, y + gauss() * w, gauss() * (0.3 + d * 0.3), tip ? C.hi : mix(C.oak, C.gold, d / 5), tip ? 2.6 : 1.1 + d * 0.25, tip ? 0.95 : 0.4 + d * 0.08); } });
    dust(S, n - S.i, [19, 9.5, 5], C.oak, 0.9, 0.3);
    return { S, spin: 0, sway: 0.04 };
  },
  /* week four: the climb, four lit nodes to a summit that bursts */
  summit(n){
    const S = make(n); const N = [[-12.5, -5.5, 0], [-4.5, -1.5, -1], [3, 2, 0.5], [11.5, 6, 0]];
    const line = Math.floor(n * 0.42), halo = Math.floor(n * 0.22), burst = Math.floor(n * 0.16);
    for(let i = 0; i < line; i++){ const k = Math.floor(Math.random() * 3); const t = Math.random(); const a = N[k], b = N[k + 1]; put(S, a[0] + (b[0] - a[0]) * t + gauss() * 0.22, a[1] + (b[1] - a[1]) * t + gauss() * 0.22, a[2] + (b[2] - a[2]) * t + gauss() * 0.3, mix(C.oak, C.gold, t), 1.3, 0.5); }
    N.forEach((P, k) => { for(let i = 0; i < halo / 4; i++){ const r = Math.abs(gauss()) * (0.6 + k * 0.25); const a = Math.random() * 6.283; put(S, P[0] + Math.cos(a) * r, P[1] + Math.sin(a) * r, P[2] + gauss() * 0.3, mix(C.hi, C.white, Math.random() * 0.4), 2 + k * 0.5 + (1 - r) * 1.5, 0.75 + (1 - r) * 0.25); } });
    const T = N[3]; for(let i = 0; i < burst; i++){ const r = Math.pow(Math.random(), 0.6) * 6.5; const a = Math.random() * 6.283; const e = (Math.random() - 0.5) * 2; put(S, T[0] + Math.cos(a) * r, T[1] + Math.sin(a) * r * 0.85 + Math.abs(e) * 1.2, T[2] + e * 2, mix(C.hi, C.cream, Math.random()), 1.2 + (1 - r / 6.5) * 1.8, (1 - r / 6.5) * 0.9); }
    dust(S, n - S.i, [19, 9.5, 5], C.oak, 0.9, 0.3);
    return { S, spin: 0, sway: 0.025, shift: 0.06 };
  },
  /* everywhere else: a slow drift */
  dust(n){ const S = make(n); dust(S, Math.floor(n * 0.9), [20, 10, 6], C.gold, 1.2, 0.45); for(let i = S.i; i < n; i++) put(S, rnd(-18, 18), rnd(-9, 9), rnd(-4, 4), C.hi, 2.4, 0.8); return { S, spin: 0, sway: 0.02, shift: 0 }; }
};

/* ---------- the field ---------- */
class Field {
  constructor(host){
    this.host = host; const name = host.getAttribute('data-scene') || 'dust';
    const w = host.clientWidth || window.innerWidth;
    const n = w < 640 ? 2600 : w < 1100 ? 5200 : 8000;
    this.scene = (SCENES[name] || SCENES.dust)(n);
    const S = this.scene.S; this.N = S.i;
    this.home = S.p.slice(0, this.N * 3); this.pos = new Float32Array(this.N * 3); this.vel = new Float32Array(this.N * 3);
    for(let i = 0; i < this.N * 3; i++){ this.pos[i] = this.home[i] + gauss() * (reduce ? 0 : 9); }
    const geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3); this.posAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.posAttr);
    geo.setAttribute('aColor', new THREE.BufferAttribute(S.c.slice(0, this.N * 3), 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(S.s.slice(0, this.N), 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(S.a.slice(0, this.N), 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(S.seed.slice(0, this.N), 1));
    this.uni = { uMap: { value: sprite() }, uScale: { value: 300 }, uTime: { value: 0 }, uFade: { value: 1 } };
    const mat = new THREE.ShaderMaterial({ uniforms: this.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    this.points = new THREE.Points(geo, mat);
    this.group = new THREE.Group(); this.group.add(this.points);
    this.three = new THREE.Scene(); this.three.add(this.group);
    this.cam = new THREE.PerspectiveCamera(42, 1, 0.1, 400); this.camZ = reduce ? 26 : 120; this.cam.position.z = this.camZ;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); this.renderer.setClearColor(0x000000, 0);
    host.appendChild(this.renderer.domElement);
    this.t0 = performance.now(); this.last = this.t0; this.ptr = { x: 0, y: 0, on: false, wx: 0, wy: 0 }; this.rot = { x: 0, y: 0 }; this.running = false; this.visible = true;
    this.resize(); this.bind();
    if(reduce){ this.step(0.016, 0); this.render(); return; }
    this.wake();
  }
  resize(){
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false); this.cam.aspect = w / h; this.cam.updateProjectionMatrix();
    /* a size-1 particle is about 2.4 css px across at the resting camera distance, scaled with the hero height */
    this.uni.uScale.value = 3.1 * this.renderer.getPixelRatio() * 26 * clamp(h / 820, 0.7, 1.25);
    const fit = Math.min(1, w / h / 1.6); this.group.scale.setScalar(0.75 + fit * 0.25);
    /* on a wide screen the copy sits left, so the shape sits right of centre */
    this.shiftX = w / h > 1.25 ? (this.scene.shift != null ? this.scene.shift : 0.2) : 0;
  }
  bind(){
    if('ResizeObserver' in window){ this.ro = new ResizeObserver(() => { this.resize(); this.render(); }); this.ro.observe(this.host); } else window.addEventListener('resize', () => this.resize());
    if('IntersectionObserver' in window){ new IntersectionObserver(es => { es.forEach(e => { this.visible = e.isIntersecting; if(this.visible) this.wake(); }); }, { threshold: 0.02 }).observe(this.host); }
    document.addEventListener('visibilitychange', () => { if(document.hidden) this.running = false; else this.wake(); });
    if(fine && !reduce){
      const sec = this.host.closest('.hero, .slide') || this.host;
      window.addEventListener('pointermove', e => { const r = this.host.getBoundingClientRect(); if(e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right){ this.ptr.on = false; return; } this.ptr.on = true; this.ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1; this.ptr.y = -(((e.clientY - r.top) / r.height) * 2 - 1); this.wake(); }, { passive: true });
      sec.addEventListener('pointerleave', () => { this.ptr.on = false; });
    }
    window.addEventListener('scroll', () => this.wake(), { passive: true });
  }
  wake(){ if(this.running || reduce) return; this.running = true; this.last = performance.now(); requestAnimationFrame(t => this.loop(t)); }
  loop(now){
    if(!this.running) return;
    if(!this.visible || document.hidden){ this.running = false; return; }
    const dt = clamp((now - this.last) / 1000, 0, 0.05); this.last = now;
    this.step(dt, (now - this.t0) / 1000); this.render();
    requestAnimationFrame(t => this.loop(t));
  }
  step(dt, t){
    const N = this.N, p = this.pos, v = this.vel, h = this.home, sc = this.scene;
    if(sc.update) sc.update(t);
    /* arrival: dolly in through log space so the approach reads as even */
    const target = 26; this.camZ = Math.exp(THREE.MathUtils.lerp(Math.log(this.camZ), Math.log(target), 1 - Math.exp(-dt * 1.6))); this.cam.position.z = this.camZ;
    /* pointer in field space: a disc the particles step around */
    let px = 0, py = 0; const R = 2.6;
    if(this.ptr.on){ const vis = 2 * this.camZ * Math.tan(this.cam.fov * Math.PI / 360); px = (this.ptr.x * vis * this.cam.aspect * 0.5 - this.group.position.x) / this.group.scale.x; py = this.ptr.y * vis * 0.5 / this.group.scale.x; }
    const k = 3.2, damp = 1 - Math.min(1, dt * 3.4), drift = reduce ? 0 : 0.16;
    for(let i = 0; i < N; i++){
      const i3 = i * 3; const s = i * 0.37;
      let hx = h[i3] + Math.sin(t * 0.5 + s) * drift, hy = h[i3 + 1] + Math.cos(t * 0.43 + s * 1.3) * drift, hz = h[i3 + 2] + Math.sin(t * 0.3 + s * 0.7) * drift;
      if(this.ptr.on){ const dx = p[i3] - px, dy = p[i3 + 1] - py; const d2 = dx * dx + dy * dy; if(d2 < R * R){ const d = Math.sqrt(d2) || 0.001; hx = px + dx / d * R; hy = py + dy / d * R; } }
      v[i3] += (hx - p[i3]) * k * dt; v[i3 + 1] += (hy - p[i3 + 1]) * k * dt; v[i3 + 2] += (hz - p[i3 + 2]) * k * dt;
      v[i3] *= damp; v[i3 + 1] *= damp; v[i3 + 2] *= damp;
      p[i3] += v[i3] * dt * 6; p[i3 + 1] += v[i3 + 1] * dt * 6; p[i3 + 2] += v[i3 + 2] * dt * 6;
    }
    this.posAttr.needsUpdate = true;
    /* whole-field motion: a slow turn, a lean toward the pointer, a lift as the page scrolls */
    this.group.rotation.z += (sc.spin || 0) * dt;
    const ty = this.ptr.on ? this.ptr.x * 0.16 : 0, tx = this.ptr.on ? -this.ptr.y * 0.1 : 0;
    this.rot.y += (ty + Math.sin(t * 0.21) * (sc.sway || 0.02) - this.rot.y) * Math.min(1, dt * 2); this.rot.x += (tx - this.rot.x) * Math.min(1, dt * 2);
    this.group.rotation.y = this.rot.y; this.group.rotation.x = this.rot.x;
    const r = this.host.getBoundingClientRect(); const gone = clamp(-r.top / Math.max(1, r.height), 0, 1);
    const visW = 2 * this.camZ * Math.tan(this.cam.fov * Math.PI / 360) * this.cam.aspect; this.group.position.x = visW * (this.shiftX || 0);
    this.group.position.y = gone * 6; this.uni.uFade.value = 1 - gone * 0.9; this.uni.uTime.value = t;
  }
  render(){ this.renderer.render(this.three, this.cam); }
}

/* ---------- WebGL guard ---------- */
function hasGL(){ try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch(e){ return false; } }

/* ---------- routes: an SVG path that draws as you scroll ---------- */
function routeSVG(pts, w, h){
  const d = pts.map((p, i) => { if(!i) return 'M' + p[0] + ' ' + p[1]; const a = pts[i - 1]; const cx = (a[0] + p[0]) / 2; return 'C' + cx + ' ' + a[1] + ' ' + cx + ' ' + p[1] + ' ' + p[0] + ' ' + p[1]; }).join(' ');
  return '<svg class="routesvg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#946E24"/><stop offset=".5" stop-color="#CFAE70"/><stop offset="1" stop-color="#ECB748"/></linearGradient><filter id="rglow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs><path class="halo" d="' + d + '" filter="url(#rglow)"/><path class="base" d="' + d + '"/><path class="draw" d="' + d + '"/></svg>';
}
function indexRoute(){
  const r = $('[data-route]'); if(!r) return;
  const W = window.MV_COHORT ? window.MV_COHORT.weeks : [];
  const pts = [[60, 150], [380, 70], [700, 160], [1020, 60]];
  r.innerHTML = routeSVG(pts, 1080, 220) + '<ol class="stops">' + W.map((w, i) => '<li class="' + (i % 2 ? 'up' : '') + '" style="--x:' + (pts[i][0] / 1080 * 100) + '%;--y:' + (pts[i][1] / 220 * 100) + '%"><i></i><b>Week ' + w.n + '</b><span>' + w.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></li>').join('') + '</ol>';
  const draw = $('.draw', r), base = $('.base', r), halo = $('.halo', r), len = draw.getTotalLength();
  [draw, halo].forEach(p => { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
  base.style.strokeDasharray = '3 7';
  const stops = $$('.stops li', r);
  function tick(){ const b = r.getBoundingClientRect(); const vh = window.innerHeight; const p = clamp((vh * 0.85 - b.top) / (b.height + vh * 0.45), 0, 1); const off = len * (1 - p); draw.style.strokeDashoffset = off; halo.style.strokeDashoffset = off; stops.forEach((s, i) => s.classList.toggle('lit', p >= (i + 0.5) / 4.2)); }
  if(reduce){ draw.style.strokeDashoffset = 0; halo.style.strokeDashoffset = 0; stops.forEach(s => s.classList.add('lit')); return; }
  window.addEventListener('scroll', tick, { passive: true }); window.addEventListener('resize', tick); tick();
}
function timelineRoute(){
  const tl = $('#timeline .orbwrap'); if(!tl) return;
  const pts = [[0, 170], [120, 90], [260, 150], [400, 60], [540, 130], [640, 80]];
  const wrap = document.createElement('div'); wrap.className = 'tlroute'; wrap.innerHTML = routeSVG(pts, 640, 220); tl.insertBefore(wrap, tl.firstChild);
  const draw = $('.draw', wrap), halo = $('.halo', wrap), len = draw.getTotalLength();
  [draw, halo].forEach(p => { p.style.strokeDasharray = len; p.style.strokeDashoffset = reduce ? 0 : len; });
  $('.base', wrap).style.strokeDasharray = '3 7';
  if(reduce) return;
  new IntersectionObserver((es, io) => { es.forEach(e => { if(e.isIntersecting){ wrap.classList.add('on'); draw.style.strokeDashoffset = 0; halo.style.strokeDashoffset = 0; io.disconnect(); } }); }, { threshold: 0.3 }).observe(tl);
}

/* ---------- cards that tilt toward the pointer, with a sheen ---------- */
function tilt(){
  if(!fine || reduce) return;
  const sel = '.card, .fwc, .stk, .lens, .theme, .nudge, .duty, .wkd, .std li, .ow, .rolecard, .qrc, .aof .card';
  document.addEventListener('pointermove', e => {
    const c = e.target.closest(sel); if(!c) return;
    const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.classList.add('tilt'); c.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg'); c.style.setProperty('--px', (x * 100).toFixed(1) + '%'); c.style.setProperty('--py', (y * 100).toFixed(1) + '%');
  }, { passive: true });
  document.addEventListener('pointerout', e => { const c = e.target.closest(sel); if(c && !c.contains(e.relatedTarget)){ c.classList.remove('tilt'); c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); } }, { passive: true });
}

/* ---------- a spotlight that follows the pointer across dark bands ---------- */
function spotlight(){
  if(!fine || reduce) return;
  $$('section.band.th-dark').forEach(b => { b.classList.add('spot'); b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.setProperty('--sx', (e.clientX - r.left) + 'px'); b.style.setProperty('--sy', (e.clientY - r.top) + 'px'); b.classList.add('lit'); }, { passive: true }); b.addEventListener('pointerleave', () => b.classList.remove('lit')); });
}

/* ---------- magnetic buttons ---------- */
function magnets(){
  if(!fine || reduce) return;
  document.addEventListener('pointermove', e => { const b = e.target.closest('.btn:not(.sm)'); if(!b) return; const r = b.getBoundingClientRect(); b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px'); b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px'); }, { passive: true });
  document.addEventListener('pointerout', e => { const b = e.target.closest('.btn'); if(b){ b.style.removeProperty('--mx'); b.style.removeProperty('--my'); } }, { passive: true });
}

/* ---------- the deck: slides stagger in, the field rides on the title slide ---------- */
function deckHooks(fieldHost){
  const home = fieldHost ? { p: fieldHost.parentNode, n: fieldHost.nextSibling } : null;
  function apply(on, cur){
    if(on === false){ if(fieldHost && home && fieldHost.parentNode !== home.p) home.p.insertBefore(fieldHost, home.n); $$('.pdeck .slide.live').forEach(s => s.classList.remove('live')); return; }
    $$('.pdeck .slide').forEach((s, i) => { s.classList.toggle('live', i === cur); });
    const title = $('.pdeck .slide.title'); if(fieldHost && title && fieldHost.parentNode !== title) title.insertBefore(fieldHost, title.firstChild);
  }
  document.addEventListener('mv-deck', e => { const d = e.detail || {}; apply(d.on, d.cur); });
  /* the deck may already be open: cohort.js runs before this module */
  if(document.body.classList.contains('deck')){ const dots = $$('.deckbar .dots button'); apply(true, Math.max(0, dots.findIndex(b => b.getAttribute('aria-selected') === 'true'))); }
}

/* ---------- the agenda rail: a line that fills as the session advances ---------- */
function railLine(){
  const ag = $('.agenda'); if(!ag) return;
  const mo = new MutationObserver(() => { const li = $$('li', ag); const cur = li.findIndex(l => l.classList.contains('cur')); ag.style.setProperty('--p', li.length ? ((cur + 0.5) / li.length).toFixed(3) : 0); });
  mo.observe(ag, { attributes: true, subtree: true, attributeFilter: ['class'] });
}

/* ---------- boot ---------- */
function boot(){
  document.documentElement.classList.add('fx');
  const host = $('.hero .fx');
  let field = null;
  if(host && hasGL()){ try { field = new Field(host); host.classList.add('live'); } catch(err){ host.remove(); } }
  else if(host) host.remove();
  indexRoute(); timelineRoute(); tilt(); spotlight(); magnets(); railLine(); deckHooks(host && host.parentNode ? host : null);
  if(field) window.MV_FX = field;
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
