/* =====================================================================
   MANAGER VOYAGE · THE COHORT · course graphics
   Line diagrams that draw themselves in, one per framework, expectation
   and segment; and live widgets inside the activities: a radar for the
   journey, bars for the themes, a compass for strengths, before and
   after bars for the pulse, rings on the timers, a seal for completion,
   a ladder, a ratio dial, a week grid, a goal tree, voice bars in the
   labs. Everything is SVG in the brand's gold line. Nothing here holds
   state the course needs; cohort.js owns that.
   ===================================================================== */
(function(){
  'use strict';
  var C = window.MV_COHORT; if(!C) return;
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var weekN = parseInt(document.body.getAttribute('data-week') || '0', 10);
  var WEEK = weekN ? C.weeks[weekN - 1] : null;
  var LS = function(k, d){ try { var v = localStorage.getItem('mv-cohort-' + k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } };

  /* ---------- primitives: every stroke carries pathLength so CSS can draw it ---------- */
  var k = 0;
  function P(d, cls){ return '<path d="' + d + '" pathLength="100" class="' + (cls || '') + '" style="--k:' + (k++) + '"/>'; }
  function Ci(x, y, r, cls){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" pathLength="100" class="' + (cls || '') + '" style="--k:' + (k++) + '"/>'; }
  function R(x, y, w, h, cls, rx){ return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 2) + '" pathLength="100" class="' + (cls || '') + '" style="--k:' + (k++) + '"/>'; }
  function L(a, b, c, d, cls){ return P('M' + a + ' ' + b + ' L' + c + ' ' + d, cls); }
  function svg(inner, vb, cls, label){ k = 0; return '<svg class="gx ' + (cls || '') + '" viewBox="' + (vb || '0 0 120 80') + '" role="img" aria-label="' + esc(label || '') + '" focusable="false">' + inner + '</svg>'; }
  function arrow(x1, y1, x2, y2, cls){ var a = Math.atan2(y2 - y1, x2 - x1), h = 6; return L(x1, y1, x2, y2, cls) + P('M' + (x2 - h * Math.cos(a - 0.5)) + ' ' + (y2 - h * Math.sin(a - 0.5)) + ' L' + x2 + ' ' + y2 + ' L' + (x2 - h * Math.cos(a + 0.5)) + ' ' + (y2 - h * Math.sin(a + 0.5)), cls); }
  function quad(n, cx, cy, r){ var q = { 1: 'M' + cx + ' ' + cy + ' L' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + ' Z', 2: 'M' + cx + ' ' + cy + ' L' + (cx + r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + ' Z', 3: 'M' + cx + ' ' + cy + ' L' + cx + ' ' + (cy + r) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx - r) + ' ' + cy + ' Z', 4: 'M' + cx + ' ' + cy + ' L' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r) + ' Z' }; return q[n]; }

  /* ---------- the diagrams ---------- */
  var G = {
    end: function(){ return Ci(72, 40, 28) + Ci(72, 40, 17, 'dim') + Ci(72, 40, 6, 'f') + arrow(6, 72, 64, 46, 'hi'); },
    levers: function(){ return R(28, 12, 28, 22, 'f') + R(64, 12, 28, 22) + R(28, 44, 28, 22) + R(64, 44, 28, 22) + L(60, 8, 60, 72, 'dim') + L(22, 40, 98, 40, 'dim'); },
    ten: function(){ var s = ''; for(var i = 0; i < 10; i++){ var x = 24 + (i % 5) * 18, y = i < 5 ? 26 : 54; s += Ci(x, y, 5, [0, 2, 5, 8].indexOf(i) > -1 ? 'f' : ''); } return s; },
    clear: function(){ return P('M10 26 q10 -14 20 0 t20 0 t20 0 t20 0 t20 0', 'dim dash') + L(10, 58, 110, 58, 'hi') + Ci(110, 58, 3, 'f'); },
    output: function(){ return L(12, 16, 62, 40) + L(12, 40, 62, 40) + L(12, 64, 62, 40) + Ci(12, 16, 4, 'f') + Ci(12, 40, 4, 'f') + Ci(12, 64, 4, 'f') + arrow(62, 40, 110, 40, 'hi') + R(96, 30, 10, 20, 'dim'); },
    theirs: function(){ return Ci(32, 50, 9) + P('M18 76 q14 -16 28 0') + Ci(92, 50, 9, 'dim') + P('M78 76 q14 -16 28 0', 'dim') + R(8, 8, 54, 26, 'hi', 6) + L(20, 21, 50, 21, 'hi') + R(88, 20, 20, 14, 'dim', 4); },
    matrix: function(){ return L(16, 70, 110, 70) + L(16, 70, 16, 8) + L(62, 10, 62, 70, 'dim') + L(16, 40, 110, 40, 'dim') + R(64, 12, 44, 26, 'f') + Ci(86, 25, 3, 'hi'); },
    check: function(){ return R(12, 10, 14, 14) + P('M15 17 l4 4 l7 -8', 'hi') + L(34, 17, 104, 17) + R(12, 33, 14, 14) + L(34, 40, 90, 40, 'dim') + R(12, 56, 14, 14) + L(34, 63, 98, 63, 'dim'); },
    story: function(){ return Ci(16, 44, 5, 'f') + L(21, 44, 108, 44, 'hi') + P('M21 42 C 50 36, 70 10, 108 10', 'dim dash') + Ci(108, 10, 3, 'dim') + Ci(108, 44, 3, 'f'); },
    candor: function(){ return arrow(22, 72, 22, 6) + arrow(22, 72, 112, 72) + R(66, 12, 42, 28, 'f') + Ci(88, 26, 3, 'hi') + L(22, 42, 108, 42, 'dim dash') + L(66, 8, 66, 72, 'dim dash'); },
    sbi: function(){ return R(6, 28, 28, 24) + arrow(34, 40, 44, 40, 'dim') + R(46, 28, 28, 24) + arrow(74, 40, 84, 40, 'dim') + R(86, 28, 28, 24, 'f'); },
    questions: function(){ var s = ''; for(var i = 0; i < 7; i++){ var x = 14 + i * 15, y = 60 - i * 6; s += Ci(x, y, 3 + i * 0.6, i === 6 ? 'f' : ''); } return s + P('M14 60 Q 60 54 104 24', 'dim dash'); },
    grow: function(){ return P('M8 72 h24 v-15 h24 v-15 h24 v-15 h24 v-15 h8', 'hi') + Ci(20, 72, 3, 'dim') + Ci(44, 57, 3, 'dim') + Ci(68, 42, 3, 'dim') + Ci(92, 27, 3, 'f'); },
    ear: function(){ return R(8, 10, 60, 36, 'hi', 8) + Ci(26, 28, 2.5, 'f') + Ci(38, 28, 2.5, 'f') + Ci(50, 28, 2.5, 'f') + P('M20 46 l-4 10 l12 -10') + R(78, 40, 34, 22, 'dim', 6) + P('M106 62 l3 7 l-9 -7', 'dim'); },
    ladder: function(){ var s = L(40, 76, 40, 6) + L(80, 76, 80, 6); for(var i = 0; i < 5; i++){ var y = 14 + i * 15; s += L(40, y, 80, y, i === 1 ? 'hi' : i === 0 ? 'f' : ''); } return s + Ci(96, 29, 4, 'f'); },
    chem: function(){ return Ci(22, 40, 12) + R(44, 28, 24, 24, 'dim') + P('M80 52 L96 52 L88 28 Z', 'hi') + P('M104 40 l8 -8 l8 8 l-8 8 Z', 'f'); },
    reinvent: function(){ var s = L(8, 44, 112, 44) + P('M16 32 l16 24 M32 32 l-16 24', 'dim'); for(var i = 0; i < 6; i++) s += Ci(48 + i * 12, 44, 3.2, 'f'); return s + P('M48 30 Q 78 14 108 30', 'dim dash'); },
    exec: function(){ return Ci(38, 40, 26) + P('M38 40 L38 22', 'hi') + P('M38 40 L52 48') + L(74, 24, 112, 24) + L(74, 40, 104, 40, 'dim') + L(74, 56, 108, 56, 'dim') + Ci(38, 40, 2, 'f'); },
    strength: function(){ var h = [22, 34, 58, 26, 42], s = L(10, 72, 110, 72, 'dim'); for(var i = 0; i < 5; i++) s += R(16 + i * 19, 72 - h[i], 12, h[i], i === 2 ? 'f' : ''); return s; },
    pyramid: function(){ var s = ''; for(var i = 0; i < 5; i++){ var w = 20 + i * 20, y = 14 + i * 12; s += P('M' + (60 - w / 2) + ' ' + y + ' L' + (60 + w / 2) + ' ' + y + ' L' + (60 + w / 2 + 10) + ' ' + (y + 12) + ' L' + (60 - w / 2 - 10) + ' ' + (y + 12) + ' Z', i === 4 ? 'f' : ''); } return s; },
    value: function(){ var n = [[20, 60], [40, 30], [62, 66], [78, 24], [100, 56], [56, 44]], s = L(10, 10, 110, 10, 'hi'); n.forEach(function(p, i){ s += Ci(p[0], p[1], 4, i === 1 || i === 3 || i === 5 ? 'f' : 'dim'); if(i === 1 || i === 3 || i === 5) s += L(p[0], p[1] - 4, p[0], 10, 'dim dash'); }); return s + L(20, 60, 40, 30, 'dim') + L(40, 30, 56, 44, 'dim') + L(56, 44, 78, 24, 'dim') + L(62, 66, 56, 44, 'dim') + L(100, 56, 78, 24, 'dim'); },
    interview: function(){ var s = ''; for(var r = 0; r < 3; r++) for(var c = 0; c < 4; c++) s += R(14 + c * 25, 14 + r * 20, 18, 12, r === 1 ? 'f' : ''); return s; },
    time: function(){ return Ci(60, 40, 30) + P('M60 40 L60 10 A30 30 0 0 1 90 40 Z', 'f') + P('M60 40 L60 18', 'hi') + P('M60 40 L76 52') + Ci(60, 40, 2.5, 'hi'); },
    leverage: function(){ return P('M54 68 L66 68 L60 58 Z', 'f') + L(12, 64, 108, 30, 'hi') + R(4, 48, 14, 14, 'dim') + R(92, 2, 22, 22); },
    schedule: function(){ var s = R(12, 10, 96, 62, '', 4) + L(12, 24, 108, 24); for(var i = 1; i < 5; i++) s += L(12 + i * 19.2, 24, 12 + i * 19.2, 72, 'dim'); return s + R(34, 30, 13, 30, 'f') + R(53, 30, 13, 16, 'f') + R(72, 30, 13, 36, 'dim') + R(15, 30, 13, 10, 'dim'); },
    rocks: function(){ return P('M36 16 h48 v50 a8 8 0 0 1 -8 8 h-32 a8 8 0 0 1 -8 -8 Z') + Ci(50, 58, 10, 'f') + Ci(70, 56, 9, 'f') + Ci(60, 38, 9, 'f') + Ci(44, 36, 2, 'dim') + Ci(78, 36, 2, 'dim') + Ci(62, 22, 2, 'dim'); },
    compass: function(n){ return Ci(60, 40, 30) + Ci(60, 40, 20, 'dim') + L(60, 8, 60, 72, 'dim') + L(28, 40, 92, 40, 'dim') + P(quad(n, 60, 40, 30), 'f') + P('M60 14 l4 8 h-8 Z', 'hi') + Ci(60, 40, 2.5, 'hi'); },
    orbit: function(){ return Ci(60, 40, 10, 'f') + Ci(60, 40, 34, 'dim dash') + Ci(60, 6, 5, 'hi') + Ci(89, 57, 5, 'hi') + Ci(31, 57, 5, 'hi'); },
    pairs: function(){ return Ci(42, 30, 9) + P('M26 60 q16 -18 32 0') + Ci(78, 30, 9, 'f') + P('M62 60 q16 -18 32 0') + P('M50 42 L70 42', 'dim dash'); },
    goal: function(){ return Ci(16, 40, 8, 'f') + L(24, 40, 52, 16) + L(24, 40, 52, 40) + L(24, 40, 52, 64) + R(52, 10, 22, 12) + R(52, 34, 22, 12) + R(52, 58, 22, 12) + L(74, 16, 100, 16, 'dim dash') + L(74, 40, 100, 40, 'dim dash') + L(74, 64, 100, 64, 'dim dash'); }
  };
  var FW = [['end in mind', 'end'], ['influence', 'levers'], ['great managers', 'ten'], ['clear is kind', 'clear'], ['output', 'output'], ['belongs to the team', 'theirs'], ['time matrix', 'matrix'], ['goals you can check', 'check'], ['story', 'story'], ['candor', 'candor'], ['situation, behavior', 'sbi'], ['coaching questions', 'questions'], ['grow', 'grow'], ['seek first', 'ear'], ['situational', 'ladder'], ['chemistry', 'chem'], ['reinvented', 'reinvent'], ['effective executive', 'exec'], ['strengths', 'strength'], ['dysfunctions', 'pyramid'], ['talent to value', 'value'], ['structured interview', 'interview'], ['quadrant two', 'matrix'], ['know thy time', 'time'], ['leverage', 'leverage'], ['schedule', 'schedule'], ['big rocks', 'rocks']];
  function fwGlyph(title){ var t = title.toLowerCase(); for(var i = 0; i < FW.length; i++) if(t.indexOf(FW[i][0]) > -1) return FW[i][1]; return null; }

  /* ---------- small icons, 24 grid ---------- */
  var I = {
    room: function(){ return Ci(7, 9, 3) + Ci(17, 9, 3) + P('M2 20 q5 -8 10 0') + P('M12 20 q5 -8 10 0'); },
    activity: function(){ return R(4, 6, 11, 14, '', 1.5) + R(9, 3, 11, 14, 'f', 1.5); },
    lab: function(){ return R(9, 3, 6, 11, '', 3) + P('M5 11 a7 7 0 0 0 14 0') + L(12, 18, 12, 21) + L(8, 21, 16, 21); },
    'break': function(){ return P('M4 8 h12 v7 a6 6 0 0 1 -12 0 Z') + P('M16 10 h3 a3 3 0 0 1 0 6 h-3') + L(4, 21, 20, 21, 'dim'); },
    write: function(){ return P('M4 20 l2 -6 l10 -10 l4 4 l-10 10 Z') + L(14, 6, 18, 10, 'dim'); },
    core: function(){ return Ci(12, 12, 9) + P('M10 8 l6 4 l-6 4 Z', 'f'); },
    sparkwise: function(){ return R(2, 4, 13, 9, '', 3) + R(9, 11, 13, 9, 'f', 3); },
    course: function(){ return Ci(12, 12, 9) + P('M10 8 l6 4 l-6 4 Z', 'f'); },
    podcast: function(){ return R(9, 3, 6, 11, '', 3) + P('M5 11 a7 7 0 0 0 14 0') + L(12, 18, 12, 21); },
    video: function(){ return R(3, 6, 14, 12, '', 2) + P('M17 10 l4 -2 v8 l-4 -2 Z', 'f'); },
    book: function(){ return P('M4 5 h7 a2 2 0 0 1 2 2 v13 a2 2 0 0 0 -2 -2 h-7 Z') + P('M20 5 h-7 a2 2 0 0 0 -2 2 v13 a2 2 0 0 1 2 -2 h7 Z'); },
    article: function(){ return R(4, 3, 16, 18, '', 2) + L(8, 8, 16, 8) + L(8, 12, 16, 12, 'dim') + L(8, 16, 13, 16, 'dim'); },
    listen: function(){ return P('M8 5 a4 4 0 0 1 8 0 v8 a4 4 0 0 1 -8 0 Z') + P('M4 12 a8 8 0 0 0 16 0', 'dim') + L(12, 20, 12, 22, 'dim'); },
    link: function(){ return P('M10 14 a4 4 0 0 1 0 -5.6 l3 -3 a4 4 0 0 1 5.6 5.6 l-1.5 1.5') + P('M14 10 a4 4 0 0 1 0 5.6 l-3 3 a4 4 0 0 1 -5.6 -5.6 l1.5 -1.5'); },
    bring: function(){ return P('M5 9 h14 l-1.5 12 h-11 Z') + P('M9 9 V7 a3 3 0 0 1 6 0 v2'); },
    rung: function(){ return L(7, 3, 7, 21) + L(17, 3, 17, 21) + L(7, 8, 17, 8, 'dim') + L(7, 13, 17, 13, 'hi') + L(7, 18, 17, 18, 'dim'); },
    system: function(){ return R(3, 4, 18, 13, '', 2) + L(8, 21, 16, 21) + L(12, 17, 12, 21); },
    who: function(){ return Ci(12, 8, 4) + P('M4 21 q8 -12 16 0'); },
    learn: function(){ return Ci(12, 12, 9) + P('M10 8 l6 4 l-6 4 Z', 'f'); },
    person: function(){ return Ci(12, 8, 4) + P('M4 21 q8 -12 16 0'); }
  };
  function icon(name, cls){ var f = I[name]; if(!f) return ''; return svg(f(), '0 0 24 24', 'ic ' + (cls || ''), ''); }
  function stdSvg(n, cls, big){ return svg(G.compass(n), '0 0 120 80', 'std-g ' + (cls || ''), 'Expectation ' + n); }

  /* ---------- draw-in: a glyph draws when it enters the viewport ---------- */
  /* the class goes on the svg and on every stroke: Chrome does not always restyle SVG children when only the ancestor changes */
  function go(s){ s.classList.add('go'); $$('*', s).forEach(function(c){ c.classList.add('go'); }); }
  var io = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ go(e.target); io.unobserve(e.target); } }); }, { threshold: 0.2 }) : null;
  function arm(root){ $$('svg.gx:not(.go):not(.armed)', root || document).forEach(function(s){ s.classList.add('armed'); if(io) io.observe(s); else go(s); }); }

  /* ---------- 1. framework cards, expectation cards, bins, lead picks ---------- */
  function cards(){
    $$('.fwc').forEach(function(c){ if($('.gx', c)) return; var h = $('h3', c); if(!h) return;
      if(c.classList.contains('std-card')){ var m = h.textContent.match(/Expectation 0?(\d)/); c.insertAdjacentHTML('afterbegin', '<div class="art">' + stdSvg(m ? +m[1] : 1) + '</div>'); return; }
      var g = fwGlyph(h.textContent); if(g) c.insertAdjacentHTML('afterbegin', '<div class="art">' + svg(G[g](), '0 0 120 80', 'fwg', '') + '</div>'); });
    $$('.std li').forEach(function(li, i){ if($('.gx', li)) return; li.insertAdjacentHTML('afterbegin', '<div class="art sm">' + stdSvg(i + 1) + '</div>'); });
    $$('.lead-pick > button').forEach(function(b){ if($('.gx', b)) return; b.insertAdjacentHTML('afterbegin', '<div class="art sm">' + stdSvg(+b.getAttribute('data-n')) + '</div>'); });
    $$('#sort .bin').forEach(function(b){ if($('.gx', b)) return; b.insertAdjacentHTML('afterbegin', '<div class="art sm">' + stdSvg(+b.getAttribute('data-std')) + '</div>'); });
    $$('.rolecard').forEach(function(c){ if($('.gx', c)) return; c.insertAdjacentHTML('afterbegin', '<div class="art sm">' + svg(G.pairs(), '0 0 120 80', '', '') + '</div>'); });
    $$('.aof').forEach(function(a){ if($('.orbit', a)) return; a.insertAdjacentHTML('afterbegin', '<div class="orbit card"><div class="art">' + svg(G.orbit(), '0 0 120 80', '', 'The mission and three areas of focus') + '</div><h3>One mission, three areas</h3><p>Your team sits on one of these orbits. The mission is the thing at the center; the areas are how the university gets there; your team goal is a point on one of them.</p></div>'); });
  }

  /* ---------- 2. segment heads: the expectation compass and the kind of segment ---------- */
  function segHeads(){
    if(!WEEK) return;
    $$('.seg-head[data-seg-head]').forEach(function(head){ if($('.segart', head)) return; var id = head.getAttribute('data-seg-head'), seg = WEEK.segments.filter(function(s){ return s.id === id; })[0]; if(!seg) return;
      var art = document.createElement('div'); art.className = 'segart'; art.innerHTML = (seg.std ? stdSvg(seg.std) : svg(I[seg.kind] ? I[seg.kind]() : I.activity(), '0 0 24 24', 'big', '')) + '<span class="kind">' + icon(seg.kind) + esc(kindName(seg.kind)) + '</span>';
      head.insertBefore(art, $('.mins', head)); });
  }
  function kindName(kk){ return { room: 'Whole room', activity: 'Activity', lab: 'Simulation lab', write: 'Playbook', 'break': 'Break', core: 'Core module', sparkwise: 'SparkWise Learning Lab' }[kk] || kk; }

  /* ---------- 3. agenda, kv lists, go deeper, frame steps ---------- */
  function agendaIcons(){ var ag = $('.agenda'); if(!ag || !WEEK) return; function paint(){ $$('li', ag).forEach(function(li){ if($('.ic', li)) return; var id = (li.getAttribute('data-for') || '').replace('seg-', ''), seg = WEEK.segments.filter(function(s){ return s.id === id; })[0]; var a = $('a', li); if(seg && a) a.insertAdjacentHTML('afterbegin', icon(seg.kind)); }); }
    paint(); new MutationObserver(function(){ paint(); }).observe(ag, { childList: true }); }
  function kvIcons(){ $$('.kv li b').forEach(function(b){ if($('.ic', b)) return; var t = b.textContent.trim().toLowerCase(), n = /^listen/.test(t) ? 'listen' : /^connect/.test(t) ? 'link' : /^bring/.test(t) ? 'bring' : /^rung/.test(t) ? 'rung' : /^system/.test(t) ? 'system' : /^who/.test(t) ? 'who' : /^learn/.test(t) ? 'learn' : null; if(n) b.insertAdjacentHTML('afterbegin', icon(n)); }); }
  function deeperIcons(){ $$('.dp').forEach(function(d){ if($('.ic', d)) return; var p = $('.pill', d), t = (p ? p.textContent : '').toLowerCase(), n = /podcast/.test(t) ? 'podcast' : /video|youtube|talk/.test(t) ? 'video' : /book/.test(t) ? 'book' : /article|read|hbr|essay/.test(t) ? 'article' : 'course'; var b = $('b', d); if(b) b.insertAdjacentHTML('afterbegin', icon(n)); }); }
  function frames(){ $$('.frame3').forEach(function(f){ $$(':scope > div', f).forEach(function(d, i){ if(!$('.stepn', d)) d.insertAdjacentHTML('afterbegin', '<span class="stepn" aria-hidden="true">' + (i + 1) + '</span>'); }); }); }

  /* ---------- 4. the journey radar ---------- */
  function journeyRadar(){
    var r = $('[data-journey]'); if(!r) return; var L6 = C.lenses || []; if(L6.length !== 6) return;
    var box = document.createElement('div'); box.className = 'radar card';
    function pts(vals){ return vals.map(function(v, i){ var a = -Math.PI / 2 + i * Math.PI / 3, rr = 8 + v * 30; return [60 + Math.cos(a) * rr, 42 + Math.sin(a) * rr]; }); }
    function paint(){
      var has = L6.map(function(l){ var t = $('[data-lens="' + l.k + '"]', r); return t && t.value.trim() ? 1 : 0; });
      var outer = pts([1, 1, 1, 1, 1, 1]), inner = pts(has), n = has.reduce(function(a, b){ return a + b; }, 0);
      box.innerHTML = '<svg class="gx go" viewBox="0 0 120 84" role="img" aria-label="Your six moments"><polygon points="' + outer.map(function(p){ return p.join(','); }).join(' ') + '" class="dim"/><polygon points="' + pts([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]).map(function(p){ return p.join(','); }).join(' ') + '" class="dim dash"/>' + outer.map(function(p){ return '<line x1="60" y1="42" x2="' + p[0] + '" y2="' + p[1] + '" class="dim"/>'; }).join('') + '<polygon points="' + inner.map(function(p){ return p.join(','); }).join(' ') + '" class="f live"/>' + outer.map(function(p, i){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.4" class="' + (has[i] ? 'f' : '') + '"/>'; }).join('') + '</svg>' +
        '<ul class="rlab">' + L6.map(function(l, i){ return '<li class="' + (has[i] ? 'on' : '') + '">' + esc(l.name || l.k) + '</li>'; }).join('') + '</ul><p class="note">' + (n ? n + ' of six moments on the map.' : 'The shape fills as you write.') + '</p>';
    }
    var lenses = $('.lenses', r); if(lenses) lenses.parentNode.insertBefore(box, lenses); else r.insertBefore(box, r.firstChild);
    paint(); r.addEventListener('input', paint);
  }

  /* ---------- 5. theme bars after the phrase analysis ---------- */
  function icmBars(){
    var r = $('[data-icm]'); if(!r) return;
    function paint(){ var th = $$('.theme', r); if(!th.length){ var old = $('.icmbars', r); if(old) old.remove(); return; }
      var rows = th.map(function(t){ return { n: ($('b', t) || {}).textContent || '', c: parseInt(($('.cnt', t) || {}).textContent || '0', 10) || 0 }; }), max = Math.max(1, Math.max.apply(null, rows.map(function(x){ return x.c; })));
      var h = '<svg class="gx go" viewBox="0 0 320 ' + (rows.length * 22 + 6) + '" role="img" aria-label="Phrases per theme">' + rows.map(function(x, i){ var y = 4 + i * 22, w = Math.max(2, x.c / max * 196); return '<text x="0" y="' + (y + 12) + '" class="t">' + esc(x.n) + '</text><rect x="118" y="' + y + '" width="196" height="14" class="trk"/><rect x="118" y="' + y + '" width="' + w + '" height="14" class="' + (x.c ? 'f bar' : 'bar zero') + '" style="--i:' + i + '"/><text x="' + (118 + w + 6) + '" y="' + (y + 11) + '" class="t n">' + x.c + '</text>'; }).join('') + '</svg>';
      var box = $('.icmbars', r); if(!box){ box = document.createElement('div'); box.className = 'icmbars'; var out = $('.icm-out', r) || r; out.insertBefore(box, out.firstChild); } box.innerHTML = '<span class="mono">What the room said, by theme</span>' + h; }
    new MutationObserver(function(){ paint(); }).observe(r, { childList: true, subtree: true }); paint();
  }

  /* ---------- 6. the strengths compass ---------- */
  function strengthsCompass(){
    var r = $('[data-strengths]'); if(!r) return; var mo;
    function paint(){ if($('.scomp', r)) return;
      var S = LS('strength', {}), vals = [0, 1, 2, 3].map(function(i){ return S[i] == null ? -1 : S[i]; });
      var inner = Ci(60, 40, 34) + Ci(60, 40, 23, 'dim') + Ci(60, 40, 12, 'dim') + L(60, 4, 60, 76, 'dim') + L(24, 40, 96, 40, 'dim') + [1, 2, 3, 4].map(function(n){ var v = vals[n - 1]; return '<path d="' + quad(n, 60, 40, v < 0 ? 0 : 12 + v * 11) + '" class="f q' + v + '"/>'; }).join('') + Ci(60, 40, 2.5, 'hi');
      var box = document.createElement('div'); box.className = 'scomp'; box.innerHTML = '<svg class="gx go" viewBox="0 0 120 80" role="img" aria-label="Your four expectations, rated"><text x="100" y="10" class="t c">01</text><text x="100" y="78" class="t c">02</text><text x="20" y="78" class="t c">03</text><text x="20" y="10" class="t c">04</text>' + [1, 2, 3, 4].map(function(n){ return '<path d="' + quad(n, 60, 40, 34) + '" class="f ghost"/>'; }).join('') + inner + '</svg><p class="note">Each quadrant grows with your rating. The small one is where the month goes.</p>';
      mo.disconnect(); r.insertBefore(box, r.firstChild); mo.observe(r, { childList: true }); }
    mo = new MutationObserver(function(){ paint(); }); mo.observe(r, { childList: true }); paint();
  }

  /* ---------- 7. the overview route ---------- */
  function overviewRoute(){
    var r = $('[data-overview]'); if(!r || $('.ovroute', r)) return; var pts = [[14, 62], [48, 22], [82, 56], [112, 16]];
    var d = pts.map(function(p, i){ if(!i) return 'M' + p[0] + ' ' + p[1]; var a = pts[i - 1], cx = (a[0] + p[0]) / 2; return 'C' + cx + ' ' + a[1] + ' ' + cx + ' ' + p[1] + ' ' + p[0] + ' ' + p[1]; }).join(' ');
    r.insertAdjacentHTML('afterbegin', '<div class="ovroute">' + svg(P(d, 'hi') + pts.map(function(p, i){ return Ci(p[0], p[1], i + 1 === weekN ? 6 : 4, i + 1 === weekN ? 'f pulse' : i + 1 < weekN ? 'f' : ''); }).join(''), '0 0 126 80', '', 'The four weeks') + '</div>');
  }

  /* ---------- 8. the pulse, as bars ---------- */
  function pulseChart(){
    $$('.pulse[data-pulse]').forEach(function(root){ var which = root.getAttribute('data-pulse'); var box = document.createElement('div'); box.className = 'pchart'; root.parentNode.insertBefore(box, root.nextSibling);
      function paint(){ var all = LS('pulse', {}), mine = all[which] || {}, pre = which === 'post' ? (all.pre || {}) : null; var n = C.pulse.length, W = 300, gw = W / n;
        box.innerHTML = '<span class="mono">' + (which === 'post' ? 'Week one, then today' : 'Your confidence today') + '</span><svg class="gx go" viewBox="0 0 ' + W + ' 96" role="img" aria-label="Confidence, one to five">' + [1, 2, 3, 4, 5].map(function(v){ return '<line x1="0" y1="' + (84 - v * 15) + '" x2="' + W + '" y2="' + (84 - v * 15) + '" class="dim"/>'; }).join('') + C.pulse.map(function(q, i){ var x = i * gw + 10, a = pre ? pre[i] || 0 : 0, b = mine[i] || 0; return (pre ? '<rect x="' + x + '" y="' + (84 - a * 15) + '" width="' + (gw / 2 - 14) + '" height="' + (a * 15) + '" class="bar pre"/>' : '') + '<rect x="' + (pre ? x + gw / 2 - 10 : x) + '" y="' + (84 - b * 15) + '" width="' + (pre ? gw / 2 - 14 : gw - 20) + '" height="' + (b * 15) + '" class="bar f" style="--i:' + i + '"/><text x="' + (x + (gw - 20) / 2) + '" y="94" class="t c">Q' + (i + 1) + '</text>'; }).join('') + '</svg>'; }
      root.addEventListener('click', function(){ setTimeout(paint, 0); }); paint(); });
  }

  /* ---------- 9. rings on the timers ---------- */
  function timerRings(){
    $$('.timer[data-mins], .bigtimer[data-mins]').forEach(function(t){ var tm = $('.tm', t); if(!tm || $('.ring', t)) return; var total = parseFloat(t.getAttribute('data-mins')) * 60 || 1, big = t.classList.contains('bigtimer');
      var ring = document.createElement('span'); ring.className = 'ring' + (big ? ' big' : ''); ring.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" class="trk"/><circle cx="50" cy="50" r="45" class="prg" pathLength="100"/></svg>';
      tm.parentNode.insertBefore(ring, tm); ring.appendChild(tm);
      var prg = $('.prg', ring);
      function upd(){ var m = tm.textContent.match(/(-?)(\d+):(\d+)/); if(!m) return; var left = (m[1] ? -1 : 1) * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10)); var p = Math.max(0, Math.min(1, left / total)); prg.style.strokeDashoffset = (100 - p * 100).toFixed(1); ring.classList.toggle('low', left >= 0 && left <= 60); }
      new MutationObserver(upd).observe(tm, { childList: true, characterData: true, subtree: true }); upd(); });
  }

  /* ---------- 10. the completion seal ---------- */
  function seal(){
    var r = $('[data-completion]'); if(!r) return;
    var box = document.createElement('div'); box.className = 'seal'; var ticks = ''; for(var i = 0; i < 24; i++){ var a = i * Math.PI / 12; ticks += '<line x1="' + (50 + Math.cos(a) * 40) + '" y1="' + (50 + Math.sin(a) * 40) + '" x2="' + (50 + Math.cos(a) * 44) + '" y2="' + (50 + Math.sin(a) * 44) + '" class="' + (i % 6 ? 'dim' : '') + '"/>'; }
    box.innerHTML = '<svg class="gx go" viewBox="0 0 100 100" role="img" aria-label="Completion"><circle cx="50" cy="50" r="47" class="dim"/><circle cx="50" cy="50" r="36" class="prg" pathLength="100"/>' + ticks + '<path d="M33 52 l11 11 l24 -26" class="hi tick" pathLength="100"/><text x="50" y="86" class="t c">MANAGER VOYAGE</text></svg><span class="cnt"></span>';
    r.insertBefore(box, r.firstChild); r.classList.add('has-seal');
    function upd(){ var cb = $$('input[data-ind]', r), n = cb.filter(function(c){ return c.checked; }).length; box.style.setProperty('--p', cb.length ? n / cb.length : 0); box.classList.toggle('done', n && n === cb.length); $('.cnt', box).textContent = n + ' of ' + cb.length; }
    r.addEventListener('change', upd); upd();
  }

  /* ---------- 11. the labs: voice bars ---------- */
  function labBars(){ $$('.lab .scene').forEach(function(s){ if($('.viz', s)) return; var v = document.createElement('div'); v.className = 'viz'; v.setAttribute('aria-hidden', 'true'); var h = ''; for(var i = 0; i < 28; i++) h += '<i style="--i:' + i + ';--d:' + (Math.random() * 0.8).toFixed(2) + 's;--h:' + (0.25 + Math.random() * 0.75).toFixed(2) + '"></i>'; v.innerHTML = h; s.appendChild(v); }); }

  /* ---------- 12. the delegation ladder, climbable ---------- */
  function ladder(){
    var ul = $('ul.kv[aria-label="The delegation ladder"]'); if(!ul) return;
    var rungs = $$('li', ul).map(function(li){ return { b: $('b', li).textContent, t: $('span', li).textContent }; }); if(rungs.length !== 5) return;
    var cur = 3; var box = document.createElement('div'); box.className = 'ladder card'; ul.parentNode.insertBefore(box, ul); ul.hidden = true;
    function paint(){ var s = L(40, 78, 40, 2) + L(80, 78, 80, 2); for(var i = 0; i < 5; i++){ var y = 72 - i * 16; s += '<g class="rg' + (i + 1 === cur ? ' on' : i + 1 < cur ? ' past' : '') + '" data-r="' + (i + 1) + '"><rect x="30" y="' + (y - 7) + '" width="60" height="14" class="hit"/>' + L(40, y, 80, y, i + 1 === cur ? 'hi' : i + 1 < cur ? 'f' : 'dim') + '<text x="22" y="' + (y + 3) + '" class="t">' + (i + 1) + '</text></g>'; } var py = 72 - (cur - 1) * 16; s += Ci(96, py - 8, 4, 'f') + P('M96 ' + (py - 4) + ' v9 m-5 -5 h10 m-5 5 l-4 7 m4 -7 l4 7', 'hi');
      box.innerHTML = '<div class="lad">' + svg(s, '0 0 112 84', 'go', 'The delegation ladder') + '</div><div class="ltxt"><span class="mono">Rung ' + cur + ' of 5 · tap a rung</span><h4>' + esc(rungs[cur - 1].t.split('.')[0]) + '.</h4><p>' + esc(rungs[cur - 1].t.split('.').slice(1).join('.').trim()) + '</p><p class="note">Most people on most teams are a rung lower than they could be. Pick where one person is today, then look one rung up: that is the lab.</p><div class="opts" role="group" aria-label="Rungs">' + rungs.map(function(r, i){ return '<button type="button" data-r="' + (i + 1) + '" aria-pressed="' + (i + 1 === cur) + '">' + (i + 1) + '</button>'; }).join('') + '</div></div>'; }
    box.addEventListener('click', function(e){ var g = e.target.closest('[data-r]'); if(!g) return; cur = +g.getAttribute('data-r'); paint(); }); paint();
  }

  /* ---------- 13. the coaching ratio dial ---------- */
  function ratio(){
    var r = $('[data-ratio]'); if(!r) return; var v = parseInt(LS('ratio', 30), 10) || 30; r.className = 'ratio card';
    function paint(){ var a = Math.PI * (1 - v / 100), x = 60 + Math.cos(a) * 44, y = 60 - Math.sin(a) * 44; var lbl = v <= 33 ? ['Coaching', 'Mostly questions. This is the lab.'] : v <= 60 ? ['Mentoring', 'Fine, but name it out loud so they know what they are getting.'] : ['Telling', 'Useful for a rung-one task. Not a coaching conversation.'];
      r.innerHTML = '<div class="dial">' + svg(P('M16 60 A44 44 0 0 1 104 60', 'dim') + P('M16 60 A44 44 0 0 1 ' + (60 + Math.cos(Math.PI * (1 - 0.33)) * 44).toFixed(1) + ' ' + (60 - Math.sin(Math.PI * (1 - 0.33)) * 44).toFixed(1), 'hi') + P('M60 60 L' + x.toFixed(1) + ' ' + y.toFixed(1), 'hi') + Ci(60, 60, 3, 'f') + '<text x="12" y="74" class="t">0%</text><text x="98" y="74" class="t">100%</text>', '0 0 120 80', 'go', 'Share of the conversation that is you') + '</div>' +
        '<div><span class="mono">How much of the conversation is you talking?</span><h4>' + v + '% · ' + lbl[0] + '</h4><p>' + lbl[1] + '</p><input type="range" min="0" max="100" value="' + v + '" aria-label="Share of the conversation that is you talking"><p class="note">Under a third and you are coaching. Over it, you are mentoring or telling; both are fine, and neither is what this week practices.</p></div>'; }
    r.addEventListener('input', function(e){ if(e.target.type !== 'range') return; v = +e.target.value; try { localStorage.setItem('mv-cohort-ratio', JSON.stringify(v)); } catch(x){} var h = $('h4', r); paint(); $('input', r).focus(); }); paint();
  }

  /* ---------- 14. the week grid: where the 1:1s and the rocks sit ---------- */
  function weekGrid(){
    var r = $('[data-weekgrid]'); if(!r) return; r.className = 'wgrid card';
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], slots = ['8', '10', '12', '2', '4'];
    var cells = { '0-0': ['app', 'Approvals, rocks'], '1-1': ['one', '1:1'], '1-3': ['one', '1:1'], '2-1': ['one', '1:1'], '2-2': ['ded', 'Protected, no meetings'], '2-3': ['ded', ''], '3-1': ['one', '1:1'], '3-3': ['one', '1:1'], '4-0': ['app', 'Inbox, follow-ups'], '4-3': ['rev', 'Look back, thank by name'] };
    r.innerHTML = '<span class="mono">A week that has room for managing in it</span><div class="wg"><i></i>' + days.map(function(d){ return '<b>' + d + '</b>'; }).join('') + slots.map(function(s, si){ return '<b class="s">' + s + '</b>' + days.map(function(d, di){ var c = cells[di + '-' + si]; return '<span class="' + (c ? c[0] : '') + '" style="--i:' + (si * 5 + di) + '">' + (c ? c[1] : '') + '</span>'; }).join(''); }).join('') + '</div><ul class="leg"><li class="one">The 1:1s, theirs first, thirty minutes</li><li class="ded">One protected half day for quadrant two</li><li class="app">The approvals, in one sitting</li><li class="rev">The look back</li></ul><p class="note">Illustrative. Yours goes in the Playbook; the shape is what matters: the 1:1s are holds, not gaps.</p>';
  }

  /* ---------- 15. the goal tree ---------- */
  function goalTree(){
    var r = $('[data-goaltree]'); if(!r) return; r.className = 'gtree card';
    var s = Ci(14, 40, 9, 'f') + '<text x="14" y="62" class="t c">One person</text>';
    [16, 40, 64].forEach(function(y, i){ s += P('M23 40 C 40 40, 40 ' + y + ', 56 ' + y, 'hi') + R(56, y - 7, 30, 14, '', 3) + '<text x="71" y="' + (y + 4) + '" class="t c">Goal ' + (i + 1) + '</text>' + P('M86 ' + y + ' h12', 'dim') + R(98, y - 7, 36, 14, 'dim', 3) + '<text x="116" y="' + (y + 4) + '" class="t c sm">what good looks like</text>'; });
    r.innerHTML = '<span class="mono">Three goals per person, each with a picture of done</span>' + svg(s, '0 0 140 80', 'go gt', 'One person, three goals, each with what good looks like') + '<p class="note">If you cannot draw the right-hand box, the goal is a wish. Doerr: measurable by the date, or not a goal.</p>';
  }

  /* ---------- 16. the pairs: two chairs, a bubble each, and a three-minute swap timer ---------- */
  function pairsScene(){
    $$('[data-pairs]').forEach(function(r){ if($('.pscene', r)) return; var cards = $$('.rolecard', r); if(cards.length < 2) return;
      var who = cards.map(function(c){ return ($('b', c) || {}).textContent || ''; }).map(function(t){ return t.replace(/^If you are (the )?/i, ''); });
      var box = document.createElement('div'); box.className = 'pscene card'; r.insertBefore(box, r.firstChild);
      var art = Ci(34, 34, 11) + P('M14 72 q20 -24 40 0') + Ci(146, 34, 11, 'f') + P('M126 72 q20 -24 40 0') + R(48, 6, 44, 22, 'hi', 7) + L(58, 17, 82, 17, 'hi') + P('M54 28 l-5 8 l12 -8', 'hi') + R(88, 34, 40, 20, 'dim', 7) + Ci(100, 44, 2, 'f') + Ci(108, 44, 2, 'f') + Ci(116, 44, 2, 'f') + P('M124 54 l5 8 l-12 -8', 'dim') + P('M72 62 h36', 'dim dash') + P('M104 58 l4 4 l-4 4', 'dim') + P('M76 58 l-4 4 l4 4', 'dim');
      box.innerHTML = '<div class="pa">' + svg(art, '0 0 180 80', 'go', 'Two people, in turn') + '<div class="names"><span>' + esc(who[0]) + '</span><span>swap</span><span>' + esc(who[1]) + '</span></div></div>' +
        '<div class="pt"><span class="mono">Three minutes each way</span><div class="ring big"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" class="trk"/><circle cx="50" cy="50" r="45" class="prg" pathLength="100"/></svg><span class="tm">3:00</span></div><div class="ctl"><button type="button" data-pt="start">Start</button><button type="button" data-pt="swap">Swap</button><button type="button" data-pt="reset">Reset</button></div><p class="note" data-pt-who>First: ' + esc(who[0]) + ' speaks, ' + esc(who[1]) + ' plays it straight.</p></div>';
      var total = 180, left = total, id = null, turn = 0, tm = $('.tm', box), prg = $('.prg', box), ring = $('.ring', box), whoP = $('[data-pt-who]', box);
      function show(){ var m = Math.floor(left / 60), ss = left % 60; tm.textContent = m + ':' + (ss < 10 ? '0' : '') + ss; prg.style.strokeDashoffset = (100 - left / total * 100).toFixed(1); ring.classList.toggle('low', left <= 30); box.classList.toggle('over', left === 0); }
      function stop(){ clearInterval(id); id = null; $('[data-pt="start"]', box).textContent = 'Start'; }
      function start(){ if(id) return; $('[data-pt="start"]', box).textContent = 'Running'; id = setInterval(function(){ if(left > 0){ left--; show(); } if(left === 0) stop(); }, 1000); }
      function swap(){ stop(); turn = 1 - turn; left = total; show(); whoP.textContent = (turn ? 'Now: ' + who[1] + ' is the manager, ' + who[0] + ' plays it straight.' : 'First: ' + who[0] + ' speaks, ' + who[1] + ' plays it straight.'); box.setAttribute('data-turn', turn); start(); }
      box.addEventListener('click', function(e){ var b = e.target.closest('[data-pt]'); if(!b) return; var kk = b.getAttribute('data-pt'); if(kk === 'start') id ? stop() : start(); else if(kk === 'swap') swap(); else { stop(); left = total; turn = 0; box.removeAttribute('data-turn'); show(); } });
      show(); });
  }

  /* ---------- 17. round the room: a ring of seats and thirty seconds each ---------- */
  function room(){
    var r = $('[data-room]'); if(!r) return; r.className = 'room card'; var N = 16, cur = -1, left = 30, id = null;
    function seats(){ var s = Ci(60, 44, 30, 'dim dash'); for(var i = 0; i < N; i++){ var a = -Math.PI / 2 + i * 2 * Math.PI / N, x = 60 + Math.cos(a) * 30, y = 44 + Math.sin(a) * 30; s += '<g class="seat' + (i === cur ? ' on' : i < cur ? ' done' : '') + '" data-seat="' + i + '"><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.2" class="' + (i === cur ? 'hi f' : i < cur ? 'f' : '') + '"/></g>'; } s += '<text x="60" y="47" class="t c big">' + (cur < 0 ? 'Go' : (cur + 1)) + '</text>'; return s; }
    function paint(){ r.innerHTML = '<div class="rr">' + svg(seats(), '0 0 120 88', 'go', 'The room') + '</div><div class="rt"><span class="mono">Thirty seconds each</span><div class="ring big"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" class="trk"/><circle cx="50" cy="50" r="45" class="prg" pathLength="100"/></svg><span class="tm">0:' + (left < 10 ? '0' : '') + left + '</span></div><div class="ctl"><button type="button" data-rm="next">' + (cur < 0 ? 'First person' : 'Next person') + '</button><button type="button" data-rm="reset">Reset</button></div><p class="note">' + (cur < 0 ? 'Tap when the first person starts. Each tap lights the next seat and restarts the clock.' : (cur + 1) + ' of ' + N + ' seats lit. Say the one line, then pass it on.') + '</p></div>'; upd(); }
    function upd(){ var tm = $('.tm', r), prg = $('.prg', r), ring = $('.ring', r); if(!tm) return; tm.textContent = '0:' + (left < 10 ? '0' : '') + left; prg.style.strokeDashoffset = (100 - left / 30 * 100).toFixed(1); ring.classList.toggle('low', left <= 5); }
    function stop(){ clearInterval(id); id = null; }
    function next(){ stop(); cur = (cur + 1) % N; left = 30; paint(); id = setInterval(function(){ if(left > 0){ left--; upd(); } if(left === 0) stop(); }, 1000); }
    r.addEventListener('click', function(e){ var b = e.target.closest('[data-rm]'); if(!b) return; if(b.getAttribute('data-rm') === 'next') next(); else { stop(); cur = -1; left = 30; paint(); } });
    paint();
  }

  /* ---------- 18. short slides read as statements ---------- */
  function briefSlides(){
    function mark(){ $$('.pdeck .slide:not(.title)').forEach(function(sl){ var inn = $('.in', sl); if(!inn) return; var kids = Array.prototype.slice.call(inn.children).filter(function(c){ return !c.classList.contains('talk') && !c.classList.contains('done-row'); }); var brief = kids.length <= 3 && !kids.some(function(c){ return c.matches('.card, .grid, .lab, .pairs, .frame3, .pbf, .mission, .tl, .sort, ul, ol, form, .journey, .icm, .strengths, .ovw, .phil, .ratio, .ladder, .wgrid, .gtree, .room, .tool-card, .present, .fw, .lead-pick, #lead, [data-core], [data-sparkwise]') || c.querySelector('.card, .grid, .lab, .pairs, .frame3, .pbf, .mission, .tl, .sort, ul, ol, form, .ratio, .ladder, .wgrid, .gtree, .room, .tool-card, .fw, .lead-pick'); }); sl.classList.toggle('brief', brief); }); }
    document.addEventListener('mv-deck', function(){ setTimeout(mark, 0); }); if(document.body.classList.contains('deck')) mark();
  }

  /* ---------- boot ---------- */
  function boot(){
    cards(); segHeads(); agendaIcons(); kvIcons(); deeperIcons(); frames(); icmBars(); strengthsCompass(); overviewRoute(); pulseChart(); timerRings(); seal(); labBars(); ladder(); ratio(); weekGrid(); goalTree(); pairsScene(); room(); briefSlides();
    arm();
    /* cards re-render after a profile change or a sort reset */
    document.addEventListener('mv-profile', function(){ setTimeout(function(){ cards(); kvIcons(); pairsScene(); arm(); }, 0); });
    var so = $('#sort'); if(so) new MutationObserver(function(){ cards(); arm(); }).observe(so, { childList: true });
    /* in the deck, glyphs arm as slides change */
    document.addEventListener('mv-deck', function(){ setTimeout(arm, 50); });
    document.documentElement.classList.add('gfx');
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);
})();
