/* =====================================================================
   MANAGER VOYAGE · THE COHORT · visual layer
   Routes drawn on scroll, cards that tilt, a spotlight on dark bands,
   slides that stagger in. Everything here is
   decoration: the page works without it, and all of it stands down
   when the viewer prefers reduced motion.
   ===================================================================== */

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(pointer: fine)').matches;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

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
  /* only cards with nothing to type or click inside: a surface that moves under a control is a glitch */
  const sel = '.fwc, .std li, .duty, .wkd, .ow, .rolecard, .qrc, .nudge, .theme, .aof .card';
  const ok = c => !c.querySelector('input, textarea, select, button, a.btn, [contenteditable]');
  document.addEventListener('pointermove', e => {
    const c = e.target.closest(sel); if(!c || !ok(c)) return;
    const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.classList.add('tilt'); c.style.setProperty('--rx', ((0.5 - y) * 3).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((x - 0.5) * 4).toFixed(2) + 'deg'); c.style.setProperty('--px', (x * 100).toFixed(1) + '%'); c.style.setProperty('--py', (y * 100).toFixed(1) + '%');
  }, { passive: true });
  document.addEventListener('pointerout', e => { const c = e.target.closest(sel); if(c && !c.contains(e.relatedTarget)){ c.classList.remove('tilt'); c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); } }, { passive: true });
}

/* ---------- a spotlight that follows the pointer across dark bands ---------- */
function spotlight(){
  if(!fine || reduce) return;
  $$('section.band.th-dark').forEach(b => { b.classList.add('spot'); b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.setProperty('--sx', (e.clientX - r.left) + 'px'); b.style.setProperty('--sy', (e.clientY - r.top) + 'px'); b.classList.add('lit'); }, { passive: true }); b.addEventListener('pointerleave', () => b.classList.remove('lit')); });
}

/* ---------- the deck: slides stagger in, the field rides on the title slide ---------- */
function deckHooks(){
  function apply(on, cur){ if(on === false){ $$('.pdeck .slide.live').forEach(s => s.classList.remove('live')); return; } $$('.pdeck .slide').forEach((s, i) => { s.classList.toggle('live', i === cur); }); }
  document.addEventListener('mv-deck', e => { const d = e.detail || {}; apply(d.on, d.cur); });
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
  indexRoute(); timelineRoute(); tilt(); spotlight(); railLine(); deckHooks();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
