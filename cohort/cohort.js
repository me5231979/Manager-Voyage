/* =====================================================================
   MANAGER VOYAGE · THE FOUR-WEEK COHORT · shared script
   One file runs every page: the header and footer, the manager's profile
   and the templating that tailors each scenario to it, the motion, the
   QR codes, facilitator mode and timers, the week-one activities (timeline,
   sort, lead), the simulation labs (tap version and live voice with
   ElevenLabs), the Playbook fields, the pulse, and the capstone tools.
   Everything a manager types stays in this browser (localStorage).
   ===================================================================== */
(function(){
  'use strict';
  var C = window.MV_COHORT; if(!C) return;
  var KEY = 'mv-cohort-';
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function lc(s){ return String(s).toLowerCase().replace(/vanderbilt/g, 'Vanderbilt'); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function get(k, d){ try{ var v = localStorage.getItem(KEY + k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } }
  function set(k, v){ try{ localStorage.setItem(KEY + k, JSON.stringify(v)); }catch(e){} }
  function cap(s){ s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function art(s){ return (/^[aeiou]/i.test(String(s || '')) ? 'an ' : 'a ') + s; }
  function el(tag, cls, html){ var d = document.createElement(tag); if(cls) d.className = cls; if(html != null) d.innerHTML = html; return d; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = document.body.getAttribute('data-page') || 'index';
  var weekN = parseInt(document.body.getAttribute('data-week') || '0', 10);
  var WEEK = weekN ? C.weeks[weekN - 1] : null;

  /* ---------- profile and templating ---------- */
  var GENERIC = { id: '', name: 'your area', team: 'your team', role: 'team member', role2: 'senior team member', place: 'the office', asker: 'another department',
    work: 'the work due Friday', work2: 'the weekly process your team runs', system: 'the new system', busy: 'the busy season',
    slip: 'two deadlines were missed this month and nobody said so', win: 'the project your team delivered last month', hourlyDefault: 'mixed' };
  function profile(){ return get('profile', {}); }
  function vocab(){
    var p = profile(), a = C.areas.filter(function(x){ return x.id === p.area; })[0] || GENERIC;
    var type = p.type || a.hourlyDefault || 'mixed';
    var slipShort = a.slip.split(/,| and /)[0];
    return { a: a, p: p, type: type, size: p.size || '', states: p.states || 'tn',
      map: { role: a.role, Role: cap(a.role), aRole: art(a.role), role2: a.role2, Role2: cap(a.role2), aRole2: art(a.role2),
        team: a.team, Team: cap(a.team), work: a.work, Work: cap(a.work), work2: a.work2, Work2: cap(a.work2),
        busy: a.busy, Busy: cap(a.busy), asker: a.asker, Asker: cap(a.asker), system: a.system, System: cap(a.system),
        place: a.place, slip: a.slip, Slip: cap(a.slip), slipShort: slipShort, win: a.win, Win: cap(a.win),
        area: a.name, type: type === 'mixed' ? 'hourly and salaried' : type, Type: cap(type === 'mixed' ? 'hourly and salaried' : type), size: p.size || 'a few' } };
  }
  function fill(str, v){ v = v || vocab(); return String(str == null ? '' : str).replace(/\{(\w+)\}/g, function(m, k){ return v.map[k] != null ? v.map[k] : m; }); }
  function fitsType(item, v){ return !item.type || v.type === 'mixed' || item.type === v.type; }
  function fillPage(){
    var v = vocab();
    $$('[data-fill]').forEach(function(n){ if(!n.getAttribute('data-tpl')) n.setAttribute('data-tpl', n.innerHTML); n.innerHTML = fill(n.getAttribute('data-tpl'), v); });
    $$('[data-prof-mini]').forEach(function(n){ renderMini(n, v); });
  }
  function profileSummary(v){
    if(!v.a.id) return 'No profile yet. The scenarios use a generic team until you set one.';
    var s = 'You manage <b>' + esc(v.a.team) + '</b>';
    if(v.size) s += ', <b>' + esc(v.size) + '</b> people';
    s += ', <b>' + esc(v.type === 'mixed' ? 'hourly and salaried' : v.type) + '</b>';
    if(v.states === 'multi') s += ', with someone in another state';
    return s + '. Every scenario below is written for that team.';
  }
  function renderMini(n, v){
    v = v || vocab();
    n.className = 'prof-mini';
    n.innerHTML = '<span>' + profileSummary(v) + '</span><a class="btn ghost sm" href="index.html#profile">' + (v.a.id ? 'Change' : 'Set your team') + '</a>';
  }
  function renderProfile(root){
    var p = profile();
    function opt(q, id, label, sub){ return '<button type="button" data-q="' + q + '" data-v="' + esc(id) + '" aria-pressed="' + (String(p[q]) === String(id) ? 'true' : 'false') + '">' + esc(label) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</button>'; }
    root.innerHTML =
      '<div class="q"><span class="mono">01 · Which area is your team in?</span><div class="opts">' + C.areas.map(function(a){ return opt('area', a.id, a.name); }).join('') + '</div></div>' +
      '<div class="q"><span class="mono">02 · Hourly or salaried?</span><div class="opts">' + C.profile.types.map(function(t){ return opt('type', t.id, t.name, t.desc); }).join('') + '</div></div>' +
      '<div class="q"><span class="mono">03 · How many people?</span><div class="opts">' + C.profile.sizes.map(function(s){ return opt('size', s, s === 15 ? '15 or more' : String(s)); }).join('') + '</div></div>' +
      '<div class="q"><span class="mono">04 · Where do they sit?</span><div class="opts">' + C.profile.states.map(function(s){ return opt('states', s.id, s.name); }).join('') + '</div>' +
        '<p class="note" data-states-note' + (p.states === 'multi' ? '' : ' hidden') + '>' + esc(C.profile.states[1].note) + '</p></div>' +
      '<div class="sum" data-sum>' + profileSummary(vocab()) + '</div>';
    root.addEventListener('click', function(e){
      var b = e.target.closest('button[data-q]'); if(!b) return;
      var q = b.getAttribute('data-q'), val = b.getAttribute('data-v'); if(q === 'size') val = parseInt(val, 10);
      var cur = profile(); cur[q] = val;
      if(q === 'area' && !cur.type){ var a = C.areas.filter(function(x){ return x.id === val; })[0]; if(a) cur.type = a.hourlyDefault; }
      set('profile', cur);
      $$('button[data-q="' + q + '"]', root).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      if(cur.type) $$('button[data-q="type"]', root).forEach(function(x){ x.setAttribute('aria-pressed', x.getAttribute('data-v') === cur.type ? 'true' : 'false'); });
      $('[data-states-note]', root).hidden = cur.states !== 'multi';
      $('[data-sum]', root).innerHTML = profileSummary(vocab());
      fillPage(); document.dispatchEvent(new CustomEvent('mv-profile'));
    });
  }

  /* ---------- header, footer, progress ---------- */
  function header(){
    var links = [['index.html', 'Home', 'index'], ['week-1.html', 'Week 1', 'week-1'], ['week-2.html', 'Week 2', 'week-2'], ['week-3.html', 'Week 3', 'week-3'], ['week-4.html', 'Week 4', 'week-4'], ['manage.html', 'The other things', 'manage'], ['facilitator.html', 'Facilitators', 'facilitator'], ['survey.html', 'Survey', 'survey']];
    var h = el('header', 'cnav gnav');
    h.innerHTML = '<a href="index.html" aria-label="Manager Voyage cohort home"><img src="../assets/img/vu-lockup-white.png" alt="Vanderbilt University" width="150" height="40"></a>' +
      '<span class="tag">Manager Voyage · The Cohort</span>' +
      '<button type="button" class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '<nav aria-label="Cohort">' + links.map(function(l){ return '<a href="' + l[0] + '"' + (page === l[2] ? ' aria-current="page"' : '') + '>' + l[1] + '</a>'; }).join('') +
      '<a class="cta" href="' + esc(C.links.playbook) + '" target="_blank" rel="noopener">Playbook PDF</a></nav>';
    document.body.insertBefore(h, document.body.firstChild);
    var bar = el('div', 'progress'); bar.setAttribute('aria-hidden', 'true'); document.body.insertBefore(bar, h.nextSibling);
    var b = $('.burger', h); b.addEventListener('click', function(){ var o = h.classList.toggle('open'); b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    document.addEventListener('click', function(e){ if(h.classList.contains('open') && !h.contains(e.target)){ h.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
    function prog(){ var d = document.documentElement, max = d.scrollHeight - d.clientHeight; bar.style.width = (max > 0 ? Math.min(100, d.scrollTop / max * 100) : 0) + '%'; }
    window.addEventListener('scroll', prog, { passive: true }); prog();
  }
  function footer(){
    var f = el('footer');
    f.innerHTML = '<div class="wrap"><div>Manager Voyage · The Four-Week Cohort · Futures Learning Hub, People, Culture and Belonging · Vanderbilt University · v' + esc(C.version) + '</div>' +
      '<nav><a href="../">Program</a><a href="' + esc(C.links.foundations) + '">Manager Foundations</a><a href="' + esc(C.links.assessment) + '">Reassess</a><a href="' + esc(C.links.playbook) + '" target="_blank" rel="noopener">Playbook PDF</a><a href="' + esc(C.links.portal) + '" target="_blank" rel="noopener">Manager Portal</a></nav></div>';
    document.body.appendChild(f);
  }

  /* ---------- motion: word reveals, scroll reveals, hero glow, week stack ---------- */
  function words(){
    if(reduce) return;
    $$('[data-words]').forEach(function(h){
      var i = 0;
      function walk(node){
        Array.prototype.slice.call(node.childNodes).forEach(function(c){
          if(c.nodeType === 3){
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function(part){
              if(!part) return;
              if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
              var s = el('span', 'w', esc(part)); s.style.setProperty('--i', i++); frag.appendChild(s);
            });
            node.replaceChild(frag, c);
          } else if(c.nodeType === 1) walk(c);
        });
      }
      walk(h);
    });
  }
  function reveals(){
    var items = $$('.rv, [data-words], .std');
    $$('.rv .card, .rv .std li, .rv .qrc, .rv .frame3 > div, .rv .lead-pick > button, .std li').forEach(function(n, i){ if(!n.style.getPropertyValue('--i')) n.style.setProperty('--i', n.parentNode ? Array.prototype.indexOf.call(n.parentNode.children, n) : i); });
    if(!('IntersectionObserver' in window) || reduce){ items.forEach(function(n){ n.classList.add('on'); $$('li', n).forEach(function(l){ l.classList.add('on'); }); }); return; }
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('on'); if(e.target.classList.contains('std')) $$('li', e.target).forEach(function(l, i){ setTimeout(function(){ l.classList.add('on'); }, i * 120); }); io.unobserve(e.target); } }); }, { threshold: 0.05, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function(n){ io.observe(n); });
  }
  function hero(){
    var h = $('.hero'); if(!h) return;
    if(WEEK){ var st = C.standard[WEEK.expectation - 1], m = $('.hero .meta', h); if(m && st){ var li = el('li', '', 'Yukl: ' + esc(st.yukl.toLowerCase()) + ' · ' + STMTS[WEEK.expectation]); m.insertBefore(li, m.children[1] || null); } }
    if(!$('.glow', h)){ var g = el('div', 'glow'); g.setAttribute('aria-hidden', 'true'); h.insertBefore(g, h.firstChild.nextSibling); }
    requestAnimationFrame(function(){ h.classList.add('on'); });
    if(reduce || !window.matchMedia('(pointer:fine)').matches) return;
    h.addEventListener('pointermove', function(e){ var r = h.getBoundingClientRect(); h.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); h.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
  }
  function stack(){
    var cards = $$('.stack .stk'); if(!cards.length || reduce) return;
    function tick(){
      var nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      cards.forEach(function(c, i){
        var next = cards[i + 1]; if(!next){ c.style.transform = ''; c.style.opacity = ''; return; }
        var top = c.getBoundingClientRect().top, nt = next.getBoundingClientRect().top, h = c.offsetHeight;
        var p = Math.min(1, Math.max(0, 1 - (nt - top) / (h + 18)));
        c.style.transform = 'scale(' + (1 - p * 0.05).toFixed(4) + ')';
        c.style.opacity = (1 - p * 0.35).toFixed(3);
      });
    }
    window.addEventListener('scroll', tick, { passive: true }); window.addEventListener('resize', tick); tick();
  }

  /* ---------- QR codes ---------- */
  var qrLib;
  function qrlib(){
    if(qrLib) return qrLib;
    qrLib = new Promise(function(res, rej){
      if(window.qrcode) return res(window.qrcode);
      var s = document.createElement('script'); s.src = '../assets/js/qrcode-generator.js';
      s.onload = function(){ res(window.qrcode); }; s.onerror = function(){ rej(new Error('qr')); }; document.head.appendChild(s);
    });
    return qrLib;
  }
  var qrN = 0;
  function qrs(){
    var nodes = $$('.qr[data-url]'); if(!nodes.length) return;
    qrlib().then(function(make){
      nodes.forEach(function(n){ if(n.getAttribute('data-done')) return; n.setAttribute('data-done', '1'); var url = n.getAttribute('data-url');
        var q = make(0, 'M'); q.addData(url); q.make(); qrN++;
        n.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: { text: 'QR code for ' + url, id: 'qr-alt-' + qrN }, title: { text: 'Scan to open ' + url, id: 'qr-title-' + qrN } }); });
    }).catch(function(e){ if(window.console) console.warn('QR fallback', e); nodes.forEach(function(n){ n.innerHTML = '<span style="font-size:.8rem;word-break:break-all;padding:8px">' + esc(n.getAttribute('data-url')) + '</span>'; }); });
  }
  function pageUrl(slug){ return C.site + (slug === 'index' ? '' : slug + '.html'); }
  function qrGrid(root){
    var pages = [['index', 'Cohort home', 'Profile, map, Playbook'], ['week-1', 'Week 1', 'In the classroom'], ['week-2', 'Week 2', 'Virtual, 90 minutes'], ['week-3', 'Week 3', 'Virtual, 90 minutes'], ['week-4', 'Week 4', 'Capstone, in person'], ['leader', 'For your leader', 'Fifteen minutes, one question a week'], ['team-check', 'Your team’s view', 'Ten statements, anonymous'], ['manage', 'The other things', 'Duties by cadence'], ['facilitator', 'Facilitators', 'Run of show, checklists'], ['survey', 'Course survey', 'A few minutes before you leave']];
    root.innerHTML = pages.map(function(p, i){ var u = pageUrl(p[0]); return '<div class="qrc" style="--i:' + i + '"><div class="qr" data-url="' + esc(u) + '" data-size="200"></div><b>' + esc(p[1]) + '</b><span>' + esc(p[2]) + '</span><span>' + esc(u.replace('https://', '')) + '</span></div>'; }).join('');
    qrs();
  }
  function qrSide(){
    var d = el('aside', 'qrside'); d.setAttribute('aria-label', 'QR code for this page');
    d.innerHTML = '<button type="button" aria-label="Hide QR code">&times;</button><div class="qr" data-url="' + esc(pageUrl(page)) + '" data-size="112"></div><b>Scan to follow</b>';
    document.body.appendChild(d);
    $('button', d).addEventListener('click', function(){ d.style.display = 'none'; });
    qrs();
  }

  /* ---------- facilitator mode, timers, agenda, segment chrome ---------- */
  function facil(on){ document.body.classList.toggle('facil', !!on); set('facil', !!on); $$('.facil-t input').forEach(function(i){ i.checked = !!on; }); }
  function makeTimer(root, mins, big){
    var total = mins * 60, left = total, id = null;
    var tm = $('.tm', root);
    function show(){ var s = Math.abs(left), m = Math.floor(s / 60), ss = s % 60; tm.textContent = (left < 0 ? '-' : '') + m + ':' + (ss < 10 ? '0' : '') + ss; root.classList.toggle('over', left < 0); }
    function start(){ if(id) return; id = setInterval(function(){ left -= 1; show(); if(left === 0){ try{ var a = new (window.AudioContext || window.webkitAudioContext)(); var o = a.createOscillator(), g = a.createGain(); o.frequency.value = 660; g.gain.value = 0.08; o.connect(g); g.connect(a.destination); o.start(); setTimeout(function(){ o.stop(); a.close(); }, 500); }catch(e){} } }, 1000); $('[data-t="start"]', root).textContent = 'Running'; }
    function pause(){ clearInterval(id); id = null; $('[data-t="start"]', root).textContent = 'Start'; }
    function reset(){ pause(); left = total; show(); }
    root.addEventListener('click', function(e){ var b = e.target.closest('[data-t]'); if(!b) return; var k = b.getAttribute('data-t'); if(k === 'start') id ? pause() : start(); else if(k === 'reset') reset(); else if(k === 'plus'){ left += 60; show(); } });
    show();
  }
  function segments(){
    if(!WEEK) return;
    var done = get('done', {});
    var blocks = $$('.seg-block[data-seg]');
    blocks.forEach(function(b, i){
      var id = b.getAttribute('data-seg'), seg = WEEK.segments.filter(function(s){ return s.id === id; })[0]; if(!seg) return;
      b.id = 'seg-' + id;
      var std = seg.std ? C.standard[seg.std - 1] : null;
      var head = el('div', 'seg-head');
      head.innerHTML = '<div>' + (std ? '<span class="stdtag"><i>' + std.n + '</i>' + esc(std.name) + '</span>' : '') +
        '<p class="eyebrow">Segment ' + (i + 1) + ' of ' + blocks.length + ' · ' + esc(kindName(seg.kind)) + '</p><h2 class="h2">' + esc(seg.title) + '</h2>' + (seg.desc ? '<p class="lead">' + esc(seg.desc) + '</p>' : '') +
        '<div class="timer" data-mins="' + seg.mins + '"><span class="tm">0:00</span><button type="button" data-t="start">Start</button><button type="button" data-t="plus">+1 min</button><button type="button" data-t="reset">Reset</button></div></div>' +
        '<span class="mins">' + seg.mins + ' min</span>';
      b.insertBefore(head, b.firstChild);
      makeTimer($('.timer', head), seg.mins);
      if(seg.kind !== 'break'){
        var k = 'w' + weekN + ':' + id, row = el('div', 'done-row');
        row.innerHTML = '<button type="button" class="btn sm ghost' + (done[k] ? ' done' : '') + '" data-done="' + k + '">' + (done[k] ? 'Done' : 'Mark done') + '</button><span class="st">' + (i < blocks.length - 1 ? 'Next: ' + esc(WEEK.segments[i + 1].title) : 'That is the week.') + '</span>';
        b.appendChild(row);
      }
    });
    document.addEventListener('click', function(e){ var b = e.target.closest('[data-done]'); if(!b) return; var d = get('done', {}), k = b.getAttribute('data-done'); d[k] = !d[k]; set('done', d); b.classList.toggle('done', d[k]); b.textContent = d[k] ? 'Done' : 'Mark done'; agenda(); });
    agenda();
    var rail = $('.rail'); if(rail){ var lab = el('label', 'facil-t'); lab.innerHTML = '<input type="checkbox"> Facilitator mode: timers, talk notes, QR'; rail.appendChild(lab); $('input', lab).addEventListener('change', function(){ facil(this.checked); }); }
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ $$('.agenda li').forEach(function(l){ l.classList.toggle('cur', l.getAttribute('data-for') === e.target.id); }); } }); }, { rootMargin: '-30% 0px -60% 0px' });
      blocks.forEach(function(b){ io.observe(b); });
    }
  }
  function kindName(k){ return { room: 'Whole room', activity: 'Activity', lab: 'Simulation lab', write: 'Playbook', 'break': 'Break', core: 'Core module', sparkwise: 'SparkWise Learning Lab' }[k] || k; }
  function agenda(){
    var list = $('.agenda'); if(!list || !WEEK) return;
    var done = get('done', {}), n = 0, m = 0;
    list.innerHTML = WEEK.segments.map(function(s){ var k = 'w' + weekN + ':' + s.id, d = !!done[k]; if(s.kind !== 'break'){ m++; if(d) n++; } return '<li data-for="seg-' + s.id + '" class="' + (d ? 'done ' : '') + (s.kind === 'break' ? 'brk' : '') + '"><a href="#seg-' + s.id + '"><b>' + s.mins + ' min</b><span>' + esc(s.title) + '</span></a></li>'; }).join('');
    var tot = $('.rail .tot'); if(tot) tot.innerHTML = '<span>' + fmtMins(WEEK.mins) + ' · ' + esc(WEEK.mode) + '</span><span>' + n + ' of ' + m + ' done</span>';
  }
  function fmtMins(m){ return m >= 60 ? (m / 60).toFixed(m % 60 ? 1 : 0).replace('.0', '') + ' hr' : m + ' min'; }

  /* ---------- week one: the timeline ---------- */
  function timeline(root){
    var T = C.timeline, N = T.length, cur = 0, ans = get('tl', {}), TICKS = 25;
    root.innerHTML = '<div class="orbwrap"><div class="orb" aria-hidden="true"></div><div class="pool" aria-hidden="true"></div></div>' +
      '<div class="cap" aria-live="polite">' + T.map(function(t, i){ return '<div class="line' + (i ? ' off' : '') + '"><h3><small>' + esc(t.label) + '</small>' + esc(t.title) + '</h3><p>' + esc(t.prompt) + '</p></div>'; }).join('') + '</div>' +
      '<div class="track" tabindex="0" role="slider" aria-label="Your voyage timeline" aria-valuemin="0" aria-valuemax="' + (N - 1) + '" aria-valuenow="0" aria-valuetext="' + esc(T[0].label) + '"><div class="ticks">' + Array.apply(null, Array(TICKS)).map(function(){ return '<i></i>'; }).join('') + '</div><div class="ends"><span>Before</span><span>Year one</span></div></div>' +
      '<div class="stops">' + T.map(function(t, i){ return '<button type="button" data-i="' + i + '" aria-current="' + (i === 0 ? 'true' : 'false') + '">' + esc(t.label) + '</button>'; }).join('') + '</div>' +
      '<div class="ans"><label for="tlAns"><span class="mono">Your line</span><br><span data-q></span></label><textarea id="tlAns" rows="2" placeholder="One line."></textarea></div>' +
      '<ul class="mine" aria-label="Your answers">' + T.map(function(t){ return '<li data-k="' + t.k + '"><b>' + esc(t.label) + '</b><span></span></li>'; }).join('') + '</ul>';
    var orb = $('.orb', root), ticks = $$('.ticks i', root), lines = $$('.cap .line', root), stops = $$('.stops button', root), track = $('.track', root), ta = $('textarea', root), q = $('[data-q]', root);
    var pos = 0, spin = 0;
    function paint(p){
      ticks.forEach(function(t, i){ var d = Math.abs(i / (TICKS - 1) - p); var s = Math.max(0, 1 - d * 6); t.style.transform = 'scaleY(' + (0.45 + s * 0.75).toFixed(3) + ')'; t.style.opacity = (0.25 + s * 0.75).toFixed(3); t.style.background = s > 0.6 ? 'var(--eyebrow)' : ''; });
    }
    function go(i, fromScrub){
      i = Math.max(0, Math.min(N - 1, i)); if(i === cur && fromScrub) return;
      var d = i - cur; cur = i;
      if(!reduce){ spin += d * 38; orb.style.setProperty('--spin', spin + 'deg'); orb.classList.add('whip'); clearTimeout(orb._t); orb._t = setTimeout(function(){ orb.classList.remove('whip'); }, 380); }
      lines.forEach(function(l, j){ l.classList.toggle('off', j !== i); });
      stops.forEach(function(b, j){ b.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      track.setAttribute('aria-valuenow', i); track.setAttribute('aria-valuetext', T[i].label + ': ' + T[i].title);
      q.textContent = T[i].prompt; ta.value = ans[T[i].k] || '';
      if(!fromScrub){ pos = i / (N - 1); paint(pos); }
    }
    function mine(){ $$('.mine li', root).forEach(function(li){ var k = li.getAttribute('data-k'); li.classList.toggle('has', !!ans[k]); $('span', li).textContent = ans[k] || ''; }); }
    ta.addEventListener('input', function(){ ans[T[cur].k] = ta.value.trim(); set('tl', ans); mine(); });
    stops.forEach(function(b){ b.addEventListener('click', function(){ go(parseInt(b.getAttribute('data-i'), 10)); }); });
    var down = false;
    function fromX(x){ var r = track.getBoundingClientRect(); pos = Math.max(0, Math.min(1, (x - r.left) / r.width)); paint(pos); go(Math.round(pos * (N - 1)), true); }
    track.addEventListener('pointerdown', function(e){ down = true; track.setPointerCapture(e.pointerId); fromX(e.clientX); });
    track.addEventListener('pointermove', function(e){ if(down) fromX(e.clientX); });
    track.addEventListener('pointerup', function(){ down = false; pos = cur / (N - 1); paint(pos); });
    track.addEventListener('pointercancel', function(){ down = false; });
    track.addEventListener('keydown', function(e){ if(e.key === 'ArrowRight' || e.key === 'ArrowUp'){ e.preventDefault(); go(cur + 1); } if(e.key === 'ArrowLeft' || e.key === 'ArrowDown'){ e.preventDefault(); go(cur - 1); } if(e.key === 'Home'){ go(0); } if(e.key === 'End'){ go(N - 1); } });
    q.textContent = T[0].prompt; ta.value = ans[T[0].k] || ''; paint(0); mine();
  }

  /* ---------- week one: sort a week of your work into the four expectations ---------- */
  function sort(root){
    var v = vocab(), items = C.sortItems.filter(function(it){ return fitsType(it, v); }).map(function(it, i){ return { i: i, t: fill(it.t, v), std: it.std }; });
    var seed = 7; items.sort(function(a, b){ seed = (seed * 9301 + 49297) % 233280; return (seed / 233280) - 0.5; });
    var sel = null, placed = 0, right = 0;
    root.innerHTML = '<div class="deck" role="list">' + items.map(function(it, j){ return '<button type="button" class="item" role="listitem" data-i="' + it.i + '" aria-pressed="false"><span class="k">' + (j + 1 < 10 ? '0' : '') + (j + 1) + '</span><span>' + esc(it.t) + '</span></button>'; }).join('') + '</div>' +
      '<div class="bins">' + C.standard.map(function(s){ return '<button type="button" class="bin" data-std="' + s.n + '" aria-label="Place in ' + esc(s.name) + '"><span class="n">' + s.n + ' · ' + esc(s.yukl) + '</span><b>' + esc(s.name) + '</b><ul></ul></button>'; }).join('') + '</div>' +
      '<p class="out" aria-live="polite">Tap an item, then the expectation it belongs to. Most items could sit in two; pick the one a manager would act on first.</p>';
    var out = $('.out', root);
    root.addEventListener('click', function(e){
      var it = e.target.closest('.item'), bin = e.target.closest('.bin');
      if(it && !it.classList.contains('placed')){ $$('.item', root).forEach(function(x){ x.setAttribute('aria-pressed', x === it ? 'true' : 'false'); }); sel = it; out.innerHTML = 'Now tap the expectation.'; return; }
      if(bin && sel){
        var want = C.sortItems[parseInt(sel.getAttribute('data-i'), 10)].std, got = parseInt(bin.getAttribute('data-std'), 10), std = C.standard[want - 1];
        var li = el('li', got === want ? '' : 'wrong', esc($('span:last-child', sel).textContent)); $('ul', bin).appendChild(li);
        placed++; if(got === want) right++;
        sel.classList.add('placed'); sel.classList.toggle('ok', got === want); sel.setAttribute('aria-pressed', 'false');
        out.innerHTML = (got === want ? '<b>Yes.</b> ' : '<b>Closer to ' + std.n + ', ' + esc(std.name) + '.</b> ') + why(want) + (placed === items.length ? ' <b>All ' + items.length + ' placed, ' + right + ' where the standard puts them.</b> Notice which expectation you reached for least. That is usually the one your team needs next.' : '');
        sel = null;
      }
    });
    function why(n){ return ['', 'A task-oriented move: plan it, say it, check it, or fix the process. Statements 1 to 3 on your assessment.', 'A relations move: listen, grow, thank, or trust. Statements 4 to 6.', 'A change move: explain the why, say where we are going, let people try, look back. Statements 7 and 8.', 'An external move: know the people, watch what is coming, speak up for your team. Statements 9 and 10.'][n]; }
  }

  /* ---------- week one: which expectation, which habit ---------- */
  function lead(root){
    var saved = get('lead', {}), v = vocab();
    root.innerHTML = '<div class="lead-pick">' + C.standard.map(function(s, i){ return '<button type="button" data-n="' + (i + 1) + '" aria-pressed="' + (saved.n === i + 1 ? 'true' : 'false') + '" style="--i:' + i + '"><span class="n">' + s.n + '</span><b>' + esc(s.name) + '</b><span class="mono">' + esc(s.yukl) + ' · week ' + s.week + '</span></button>'; }).join('') + '</div>' +
      '<div class="lead-out"><p class="note" data-lead-why></p><div class="habits" data-habits></div><div class="week-line" data-line hidden><b>Your line for the room</b><span></span></div></div>';
    var outb = $('.lead-out', root);
    function habits(n){
      var s = C.standard[n - 1];
      $('[data-lead-why]', root).textContent = 'Expectation ' + s.n + ' is Yukl’s ' + s.yukl.toLowerCase() + ' category. Week ' + s.week + ' practices it with your team. Pick the one habit you will keep this month.';
      $('[data-habits]', root).innerHTML = s.habits.map(function(h){ return '<button type="button" data-h="' + esc(h) + '" aria-pressed="' + (saved.n === n && saved.h === h ? 'true' : 'false') + '"><b>' + esc(h) + '</b><span>' + esc(habitHint(n, h)) + '</span></button>'; }).join('');
      outb.classList.add('show'); line();
    }
    function line(){
      var box = $('[data-line]', root); if(!saved.n || !saved.h){ box.hidden = true; return; }
      var s = C.standard[saved.n - 1];
      $('span', box).textContent = 'This month ' + v.map.team + ' needs me to ' + s.name.charAt(0).toLowerCase() + s.name.slice(1) + '. The habit I will keep is “' + saved.h + '”, and the first place I will use it is ' + v.map.work + '.';
      box.hidden = false;
    }
    root.addEventListener('click', function(e){
      var b = e.target.closest('.lead-pick button'), h = e.target.closest('.habits button');
      if(b){ saved = { n: parseInt(b.getAttribute('data-n'), 10) }; set('lead', saved); $$('.lead-pick button', root).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); habits(saved.n); }
      if(h){ saved.h = h.getAttribute('data-h'); set('lead', saved); $$('.habits button', root).forEach(function(x){ x.setAttribute('aria-pressed', x === h ? 'true' : 'false'); }); line(); }
    });
    if(saved.n) habits(saved.n);
  }
  function habitHint(n, h){
    return ({ 'Plan it': 'Who does what by when, written where the team can see it.', 'Say it': 'Expectations said out loud, with what good looks like.', 'Check it': 'Look at the work before the deadline, not after.', 'Fix it': 'When the same thing breaks twice, change the process.',
      'Listen and help': 'Ask what is in the way, then move something.', 'Grow them': 'One stretch assignment per person, named.', 'Thank them': 'By name, for a specific thing, the week it happened.', 'Trust them': 'Hand over a decision and do not take it back.',
      'Explain the why': 'Nobody follows a change they cannot explain to a friend.', 'Describe where we are going': 'A sentence about next year the team can repeat.', 'Let people try': 'A small experiment with a date to look at it.', 'Look back': 'After the busy week, fifteen minutes on what worked.',
      'Know the people': 'The names in Finance, HR, IT your team depends on.', 'Watch for what is coming': 'Read the memo before your team hears the rumor.', 'Speak up for your team': 'Say no to the ask that breaks the week, and say why.' })[h] || '';
  }

  /* ---------- the simulation labs ---------- */
  var SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client/+esm', sessions = {};
  var ROUTE = 'Always the same day, never yours alone: leave, injury, accommodation, discrimination, harassment, Title IX. You route those; this conversation stays yours.';
  function labs(){
    $$('[data-lab]').forEach(function(root){ renderLab(root, C.labs[root.getAttribute('data-lab')]); });
    $$('[data-pairs]').forEach(function(root){ renderPairs(root, C.labs[root.getAttribute('data-pairs')]); });
    document.addEventListener('mv-profile', labs);
  }
  function fillEs(str, a){ var e = a.es || {}; return String(str).replace(/\{(\w+)\}/g, function(m, k){ var low = k.charAt(0).toLowerCase() + k.slice(1), val = e[low]; if(val == null) return m; return k.charAt(0) === k.charAt(0).toUpperCase() ? cap(val) : val; }); }
  function renderPairs(root, L){
    var v = vocab(), who = C.cast[L.who], ES = C.es && C.es[L.key], lang = get('lang', 'en');
    root.className = 'pairs';
    if(ES && lang === 'es' && v.a.es){
      root.innerHTML = '<div class="rolecard"><b>' + esc(ES.manager.h) + '</b>' + esc(fillEs(ES.manager.brief, v.a)) + '<ul><li>' + esc(ES.manager.frame) + '</li>' + ES.manager.tips.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="rolecard"><b>' + esc(ES.sam.h) + '</b>' + esc(fillEs(ES.sam.open, v.a)) + '<ul><li>' + esc(ES.sam.truth) + '</li>' + ES.sam.tips.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
        '<p class="lang"><button type="button" class="btn sm ghost" data-lang="en">Read the cards in English</button></p>';
      return;
    }
    root.innerHTML = '<div class="rolecard"><b>If you are the manager</b>' + esc(fill(L.brief, v)) + '<ul><li>Frame: ' + esc(L.frame) + '</li><li>Do not read from the card. Say it the way you would say it.</li><li>Finish with the question that fixes it, then a next step with a date.</li></ul></div>' +
      '<div class="rolecard"><b>If you are ' + esc(who.name) + '</b>Open with: “' + esc(fill(L.first, v)) + '” Then play it straight; do not make it easy and do not make it impossible.<ul><li>What is true for you: ' + esc(fill(L.truth, v)) + '</li><li>If the manager hints, say “fine” and wait.</li><li>If the manager says what they noticed, what they expect, and asks what is in the way, tell them the truth.</li></ul></div>' +
      (ES && v.a.es ? '<p class="lang"><button type="button" class="btn sm ghost" data-lang="es">Leer las tarjetas en español</button></p>' : '');
  }
  document.addEventListener('click', function(e){ var b = e.target.closest('[data-lang]'); if(!b) return; set('lang', b.getAttribute('data-lang')); $$('[data-pairs]').forEach(function(root){ renderPairs(root, C.labs[root.getAttribute('data-pairs')]); }); });
  function renderLab(root, L){
    if(!L) return;
    var v = vocab(), who = C.cast[L.who], std = C.standard[L.std - 1];
    var brief = fill(L.brief, v);
    root.className = 'lab'; root.setAttribute('data-mode', 'off'); root.setAttribute('data-live', L.key);
    root.innerHTML =
      '<div class="scene"><div class="av"><img src="../assets/img/foundation/cast/' + esc(who.img) + '.webp" alt="" width="128" height="128"><i aria-hidden="true"></i><i class="r2" aria-hidden="true"></i></div>' +
        '<div class="who"><span class="stdtag"><i>' + std.n + '</i>' + esc(std.name) + '</span><h4>' + esc(who.name) + ', ' + esc(fill(L.role, v).replace(/^./, function(c){ return c.toLowerCase(); })) + '</h4><p>' + esc(brief) + '</p><p class="meta">' + esc(L.mins) + ' · ' + (v.a.id ? 'Written for ' + esc(v.a.team) + ', ' + esc(v.type === 'mixed' ? 'hourly and salaried' : v.type) : 'Generic team. <a href="index.html#profile">Set your profile</a> to tailor it') + ' · Second rep: Again, harder</p>' + (C.review && !(C.review.sme && C.review.employeeRelations) ? '<p class="meta talk-only">Script under review by a subject-matter expert and Employee Relations. Say so in the room.</p>' : '') + '</div></div>' +
      '<ol class="how"><li><b>1</b>Say your three lines out loud. The frame: ' + esc(L.frame) + '</li><li><b>2</b>' + esc(who.name) + ' answers like a real person: pushback, half-truths, a reason you did not know.</li><li><b>3</b>Agree a next step with a date. ' + esc(who.name) + ' records what you did and did not do.</li></ol>' +
      '<div class="ctl"><button type="button" class="btn" data-live-start>Talk to ' + esc(who.name) + ' live</button><button type="button" class="btn ghost" data-live-end hidden>End the conversation</button><span class="state live-state" aria-live="polite">Uses your microphone. Nothing is stored by Vanderbilt.</span></div>' +
      '<div class="log live-log" aria-live="polite"></div><div class="score live-score" hidden></div>' +
      '<details class="tap"><summary>No microphone? Tap the version</summary><p class="sit">' + esc(who.name) + ' says: “' + esc(fill(L.first, v)) + '” You say:</p><div class="opts2">' + L.options.map(function(o, i){ return '<button type="button" data-o="' + i + '">' + esc(fill(o.t, v)) + '</button>'; }).join('') + '</div><p class="res" aria-live="polite"></p></details>';
    $('.tap', root).addEventListener('click', function(e){
      var b = e.target.closest('[data-o]'); if(!b) return; var o = L.options[parseInt(b.getAttribute('data-o'), 10)];
      $$('[data-o]', root).forEach(function(x){ x.removeAttribute('data-picked'); }); b.setAttribute('data-picked', o.best ? 'best' : 'no');
      $('.res', root).innerHTML = '<b>' + esc(o.b) + (o.best ? ' · the Vanderbilt way' : '') + '</b>' + esc(fill(o.out, v)) + (o.best ? '' : ' Try another.');
      if(o.best) markLab(L.key, { tap: true });
    });
  }
  function markLab(k, extra){ var d = get('labs', {}); d[k] = Object.assign({ at: Date.now() }, d[k] || {}, extra || {}); set('labs', d); }
  function lstate(root, mode, text){ root.setAttribute('data-mode', mode); $('.live-state', root).textContent = text || ''; }
  function lline(root, who, text, name){ var log = $('.live-log', root), p = el('p', who, '<b>' + (who === 'you' ? 'You' : esc(name)) + '</b>' + esc(text)); log.appendChild(p); log.scrollTop = log.scrollHeight; }
  function lscore(root, L, p){
    var n = 0, rows = L.checks.map(function(c){ var ok = !!p[c[0]]; if(ok) n++; return '<li class="' + (ok ? 'ok' : 'no') + '"><i aria-hidden="true">' + (ok ? '&#10003;' : '&times;') + '</i>' + esc(c[1]) + '</li>'; }).join('');
    var pen = L.penalty && p[L.penalty[0]], passed = n >= L.pass && !pen, box = $('.live-score', root);
    box.innerHTML = '<span class="mono">' + (passed ? 'You held the conversation' : 'Not yet') + ' · ' + n + ' of ' + L.checks.length + '</span>' + (p.summary ? '<p class="sum">' + esc(p.summary) + '</p>' : '') + '<ul>' + rows + '</ul>' +
      (pen ? '<p class="pen">' + esc(L.penalty[1]) + '</p>' : '') + (p.tone === 'harsh' ? '<p class="pen">' + esc(C.cast[L.who].name) + ' went quiet. Harsh gets compliance, not the truth.</p>' : '') +
      '<p class="way">' + esc(L.way) + '</p><p class="route">' + esc(ROUTE) + '</p><p style="margin-top:12px"><button type="button" class="btn ghost sm" data-live-again>Try it again</button> <button type="button" class="btn sm" data-live-harder>Again, harder</button></p>';
    box.hidden = false; lstate(root, 'done', passed ? 'Scored.' : 'Scored. Try it again when you are ready.');
    markLab(L.key, { live: true, n: n, pen: !!pen, passed: passed });
  }
  function lfallback(root, L, why){
    lstate(root, 'off', '');
    $('.live-log', root).innerHTML = '<p class="off">' + esc(why) + ' Use the tap version below, or <a href="https://elevenlabs.io/app/talk-to?agent_id=' + esc(L.agent) + '" target="_blank" rel="noopener">talk to ' + esc(C.cast[L.who].name) + ' in a new tab</a>.</p>';
    $('[data-live-start]', root).hidden = false; $('[data-live-end]', root).hidden = true; $('.tap', root).open = true;
  }
  function lstart(root){
    var L = C.labs[root.getAttribute('data-live')], v = vocab(), name = C.cast[L.who].name;
    $('.live-log', root).innerHTML = ''; $('.live-score', root).hidden = true; $('[data-live-start]', root).hidden = true; $('[data-live-end]', root).hidden = false;
    lstate(root, 'connecting', (root.getAttribute('data-hard') ? 'Harder rep. ' : '') + 'Asking for the microphone…');
    var mic = navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? navigator.mediaDevices.getUserMedia({ audio: true }) : Promise.reject(new Error('nomic'));
    mic.then(function(stream){ try{ stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} lstate(root, 'connecting', 'Connecting to ' + name + '…'); return import(SDK); })
    .then(function(mod){
      var Conversation = mod.Conversation || (mod.default && mod.default.Conversation); if(!Conversation) throw new Error('nosdk');
      return Conversation.startSession({
        agentId: L.agent, connectionType: 'webrtc',
        dynamicVariables: { counterpart_role: L.key === 'w3' || L.key === 'w4' ? v.a.role2 : L.key === 'w4x' ? v.a.asker : v.a.role, team: v.a.team, work: v.a.work, work2: v.a.work2, slip_sentence: cap(v.a.slip) + '.', busy: v.a.busy, team_type: v.type === 'mixed' ? 'hourly and salaried' : v.type, asker: v.a.asker, difficulty: root.getAttribute('data-hard') ? 'harder' : 'standard' },
        clientTools: { record_outcome: function(p){ lscore(root, L, p || {}); return 'recorded'; } },
        onConnect: function(){ lstate(root, 'listening', name + ' is on. Speak when you are ready.'); },
        onDisconnect: function(){ $('[data-live-end]', root).hidden = true; $('[data-live-start]', root).hidden = false; if(root.getAttribute('data-mode') !== 'done') lstate(root, 'off', 'Conversation ended.' + ($('.live-score', root).hidden ? ' No score was recorded. Start again and finish with a next step.' : '')); sessions[L.key] = null; },
        onModeChange: function(m){ if(root.getAttribute('data-mode') === 'done') return; lstate(root, m.mode === 'speaking' ? 'speaking' : 'listening', m.mode === 'speaking' ? name + ' is talking.' : 'Your turn.'); },
        onMessage: function(msg){ if(msg && msg.message) lline(root, msg.source === 'user' ? 'you' : 'them', msg.message, name); },
        onError: function(){ lfallback(root, L, 'The conversation dropped.'); }
      }).then(function(conv){ sessions[L.key] = conv; });
    }).catch(function(err){
      var why = err && err.message === 'nomic' ? 'This browser has no microphone access.' : err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') ? 'The microphone was not allowed.' : 'Live practice could not start here.';
      lfallback(root, L, why);
    });
  }
  function lend(root){ var k = root.getAttribute('data-live'), c = sessions[k]; if(c && c.endSession) c.endSession(); sessions[k] = null; $('[data-live-end]', root).hidden = true; $('[data-live-start]', root).hidden = false; if(root.getAttribute('data-mode') !== 'done') lstate(root, 'off', 'Ended.'); }
  document.addEventListener('click', function(e){
    var root = e.target.closest('.lab'); if(!root) return;
    if(e.target.closest('[data-live-harder]')){ root.setAttribute('data-hard', '1'); lstart(root); return; }
    if(e.target.closest('[data-live-start]') || e.target.closest('[data-live-again]')){ root.removeAttribute('data-hard'); lstart(root); }
    else if(e.target.closest('[data-live-end]')) lend(root);
  });

  /* ---------- Playbook fields, pulse, presenting ---------- */
  function playbook(){
    var pb = get('pb', {});
    $$('[data-pb]').forEach(function(f){
      var k = f.getAttribute('data-pb'); if(pb[k] != null) f.value = pb[k];
      f.addEventListener('input', function(){ pb[k] = f.value; set('pb', pb); var s = f.closest('.pbf') && $('.saved', f.closest('.pbf')); if(s){ s.textContent = 'Saved in this browser.'; clearTimeout(s._t); s._t = setTimeout(function(){ s.textContent = ''; }, 1800); } });
    });
    $$('[data-pb-summary]').forEach(function(root){
      var fields = $$('[data-pb]').length ? [] : null;
      var labels = root.getAttribute('data-pb-summary').split(',');
      var html = C.weeks.map(function(w){ var keys = Object.keys(pb).filter(function(k){ return k.indexOf('w' + w.n + '.') === 0 && String(pb[k]).trim(); }); if(!keys.length) return ''; return '<div class="card"><span class="no">0' + w.n + '</span><h3>' + esc(w.playbook.title) + '</h3>' + keys.map(function(k){ return '<p><b>' + esc(k.split('.')[1].replace(/_/g, ' ')) + '.</b> ' + esc(pb[k]) + '</p>'; }).join('') + '</div>'; }).join('');
      root.innerHTML = html || '<p class="note">Nothing saved yet in this browser. Your Playbook fields from weeks one to three appear here when you fill them on this device.</p>';
    });
  }
  function pulse(){
    $$('.pulse[data-pulse]').forEach(function(root){
      var which = root.getAttribute('data-pulse'), all = get('pulse', {}), mine = all[which] || {}, prev = which === 'post' ? (all.pre || {}) : null;
      root.innerHTML = C.pulse.map(function(q, i){ return '<li><span>' + esc(q) + (prev && prev[i] ? '<br><span class="prev">Week one you said ' + prev[i] + ' of 5.</span>' : '') + '</span><span class="sc" role="group" aria-label="Confidence, one to five">' + [1, 2, 3, 4, 5].map(function(n){ return '<button type="button" data-i="' + i + '" data-n="' + n + '" aria-pressed="' + (mine[i] === n ? 'true' : 'false') + '">' + n + '</button>'; }).join('') + '</span></li>'; }).join('');
      root.addEventListener('click', function(e){ var b = e.target.closest('button[data-n]'); if(!b) return; var i = b.getAttribute('data-i'); mine[i] = parseInt(b.getAttribute('data-n'), 10); all[which] = mine; set('pulse', all); $$('button[data-i="' + i + '"]', root).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); });
    });
  }
  function presentTools(){
    var ck = get('present', {});
    $$('.checks input[type=checkbox][data-ck]').forEach(function(i){ var k = i.getAttribute('data-ck'); i.checked = !!ck[k]; i.addEventListener('change', function(){ ck[k] = i.checked; set('present', ck); }); });
    $$('.bigtimer[data-mins]').forEach(function(b){ b.innerHTML = '<span class="tm">0:00</span><div class="ctl"><button type="button" data-t="start">Start</button><button type="button" data-t="plus">+1 min</button><button type="button" data-t="reset">Reset</button></div><p class="note" style="margin-top:8px;text-align:center">' + esc(b.getAttribute('data-label') || '') + '</p>'; makeTimer(b, parseFloat(b.getAttribute('data-mins')), true); });
  }

  /* ---------- week map on the home page ---------- */
  function weekStack(root){
    root.innerHTML = C.weeks.map(function(w){
      var std = C.standard[w.expectation - 1];
      return '<article class="stk"><div><div class="wkn">' + w.n + '<small>Week ' + w.n + ' · ' + esc(w.mode) + '</small></div><h3>' + esc(w.title) + '</h3><div class="mode"><span class="pill">' + esc(w.where) + '</span><span class="pill">' + fmtMins(w.mins) + '</span></div>' +
        '<p class="pb" style="margin-top:14px">' + esc(w.promise) + '</p><p class="pb"><b>Expectation ' + std.n + ' · ' + esc(std.name) + '</b> is the thread. Playbook section ' + w.playbook.n + ', <b>' + esc(w.playbook.title) + '</b>, is due ' + esc(w.playbook.due) + '.</p>' +
        '<div class="go"><a class="btn" href="' + w.slug + '.html">Open week ' + w.n + '</a></div></div>' +
        '<ol class="seg">' + w.segments.map(function(s){ return '<li><b>' + s.mins + ' min</b><span><strong>' + esc(s.title) + '</strong>' + (s.desc ? ' ' + esc(s.desc) : '') + '</span></li>'; }).join('') + '</ol></article>';
    }).join('');
  }
  function standardThread(root){
    root.innerHTML = C.standard.map(function(s, i){ return '<li style="--i:' + i + '"><span class="n">' + s.n + '</span><b>' + esc(s.name) + '</b><span class="y">Yukl: ' + esc(s.yukl) + ' behavior</span><p class="hab">' + esc(s.habits.join(' · ')) + '</p><p class="wk"><span class="pill">Practiced in week ' + s.week + '</span></p></li>'; }).join('');
  }
  function toolCards(){
    $$('[data-sparkwise]').forEach(function(n){ var k = n.getAttribute('data-sparkwise'), url = C.links.sparkwise[k], w = C.weeks[parseInt(k.slice(1), 10) - 1], seg = w.segments.filter(function(s){ return s.kind === 'sparkwise'; })[0];
      n.className = 'tool-card'; n.innerHTML = '<div><span class="lg">SparkWise Learning Lab · ' + (seg ? seg.mins + ' minutes' : '') + '</span><h4>' + esc(seg ? seg.title.replace('Learning Lab in SparkWise', n.getAttribute('data-title') || 'Learning Lab') : 'Learning Lab') + '</h4><p>' + esc(seg ? seg.desc : '') + '</p>' + (url ? '' : '<span class="ph">Placeholder: the SparkWise link for this week is pasted into cohort/program.js under links.sparkwise.' + k + ' when it exists.</span>') + '</div>' + (url ? '<a class="btn" href="' + esc(url) + '" target="_blank" rel="noopener">Open in SparkWise</a>' : '<button type="button" class="btn" disabled>Link coming</button>'); });
    $$('[data-core]').forEach(function(n){ var k = n.getAttribute('data-core'), c = C.links.core[k]; if(!c) return;
      n.className = 'tool-card'; n.innerHTML = '<div><span class="lg">Core module · Oracle Learning · ' + c.mins + ' minutes</span><h4>' + esc(c.title) + '</h4><p>' + esc(c.by) + '. Released the Friday before the week opens. Watch it first; the lab assumes its vocabulary.</p></div><a class="btn" href="' + esc(c.url) + '" target="_blank" rel="noopener">Open in Oracle Learning</a>'; });
  }

  /* ---------- frameworks, go deeper, the other things you manage ---------- */
  function fwCards(list){ return list.map(function(f, i){ return '<article class="fwc" style="--i:' + i + '"><span class="mono">' + esc(f.who) + '</span><h3>' + esc(f.what) + '</h3><p>' + esc(f.how) + '</p></article>'; }).join(''); }
  var STMTS = { 1: 'statements 1, 2 and 3', 2: 'statements 4, 5 and 6', 3: 'statements 7 and 8', 4: 'statements 9 and 10' };
  function stdCard(n){ var st = C.standard[n - 1]; return '<article class="fwc std-card" style="--i:0"><span class="mono">The Vanderbilt Manager Standard · Gary Yukl</span><h3>Expectation ' + st.n + ': ' + esc(st.name) + '</h3><p>Yukl’s ' + esc(st.yukl.toLowerCase()) + ' category of effective leadership behavior, in Vanderbilt’s words. Your assessment measured it with ' + STMTS[n] + '. Habits: ' + esc(lc(st.habits.join(', '))) + '. Everything below serves this expectation this week.</p></article>'; }
  function frameworks(){ $$('[data-frameworks]').forEach(function(n){ var k = n.getAttribute('data-frameworks'), L = C.frameworks[k] || [], w = C.weeks[parseInt(k.slice(1), 10) - 1]; n.className = 'fw'; n.innerHTML = (w ? stdCard(w.expectation) : '') + fwCards(L); }); }
  function deepItem(d){
    var inner = (d.kind ? '<span class="pill">' + esc(d.kind) + '</span>' : '<span class="pill">Oracle Learning</span>') + '<b>' + esc(d.title) + '</b><span class="by">' + esc(d.by) + (d.mins ? ' · about ' + d.mins + ' minutes' : '') + '</span><span class="nt">' + esc(d.note) + '</span>';
    return d.url ? '<a class="dp" href="' + esc(d.url) + '" target="_blank" rel="noopener">' + inner + '</a>' : '<div class="dp off">' + inner + '</div>';
  }
  function deeper(){ $$('[data-deeper]').forEach(function(n){ var D = C.deeper[n.getAttribute('data-deeper')]; if(!D) return; n.className = 'deep';
    n.innerHTML = '<div><h3 class="h3">In Oracle Learning</h3><p class="note">LinkedIn Learning and Vanderbilt courses, recorded against your profile. Where there is no link, search the title in Oracle Learning.</p>' + D.inside.map(deepItem).join('') + '</div>' +
      '<div><h3 class="h3">Podcasts, videos, reading</h3><p class="note">For the drive home. Each one names its source; all are free.</p>' + D.outside.map(deepItem).join('') + '</div>'; }); }
  function manage(){
    var root = $('[data-manage]'); if(!root) return; var M = C.manage;
    root.innerHTML = M.cadence.map(function(g){ return '<section class="cad"><h3 class="h3">' + esc(g.when) + '</h3><div class="duties">' + g.items.map(function(d){ var std = C.standard[d.std - 1];
      return '<article class="duty"><span class="stdtag"><i>' + std.n + '</i>' + esc(std.name) + '</span><h4>' + esc(d.what) + '</h4><p>' + esc(d.note) + '</p><ul class="kv"><li><b>System</b><span>' + esc(d.sys) + '</span></li><li><b>Who to call</b><span>' + esc(d.who) + '</span></li>' + (d.url ? '<li><b>Learn it</b><span><a href="' + esc(d.url) + '" target="_blank" rel="noopener">' + esc(d.link) + '</a></span></li>' : '') + '</ul></article>'; }).join('') + '</div></section>'; }).join('');
    var t = $('[data-manage-time]'); if(t){ t.className = 'fw'; t.innerHTML = fwCards(M.time); }
    var w = $('[data-manage-week]'); if(w){ w.className = 'wk7'; w.innerHTML = M.week.map(function(d){ return '<div class="wkd"><b>' + esc(d.day) + '</b><ul>' + d.items.map(function(i){ return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div>'; }).join(''); }
  }

  function norms(){ var n = $('[data-norms]'); if(!n) return; n.className = 'norms'; n.innerHTML = C.norms.map(function(x, i){ return '<li style="--i:' + i + '"><b>' + esc(x.b) + '</b><span>' + esc(x.t) + '</span></li>'; }).join(''); }
  function icsFor(k){
    var N = C.nudges[k] || [], now = new Date(), lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vanderbilt FLH//Manager Voyage//EN'];
    N.forEach(function(x, i){ var d = new Date(now); var want = x.day === 'Tuesday' ? 2 : 4; d.setDate(d.getDate() + ((want - d.getDay() + 7) % 7 || 7)); d.setHours(9, 0, 0, 0); var end = new Date(d.getTime() + 15 * 60000);
      function f(t){ return t.getFullYear() + ('0' + (t.getMonth() + 1)).slice(-2) + ('0' + t.getDate()).slice(-2) + 'T' + ('0' + t.getHours()).slice(-2) + ('0' + t.getMinutes()).slice(-2) + '00'; }
      lines.push('BEGIN:VEVENT', 'UID:mv-' + k + '-' + i + '-' + Date.now() + '@manager-voyage', 'DTSTAMP:' + f(now) + 'Z', 'DTSTART:' + f(d), 'DTEND:' + f(end), 'SUMMARY:Manager Voyage nudge: ' + x.q.replace(/[,;]/g, ' ').slice(0, 60), 'DESCRIPTION:' + x.q.replace(/,/g, '\\,') + ' (' + C.site + k.replace('w', 'week-') + '.html)', 'END:VEVENT'); });
    lines.push('END:VCALENDAR'); return lines.join('\r\n');
  }
  function nudges(){ $$('[data-nudges]').forEach(function(n){ var k = n.getAttribute('data-nudges'), N = C.nudges[k]; if(!N) return; n.className = 'nudges';
    n.innerHTML = N.map(function(x){ return '<div class="nudge"><span class="mono">' + esc(x.day) + ' · one question</span><p>' + esc(x.q) + '</p></div>'; }).join('') + '<div class="nudge-ctl"><button type="button" class="btn sm" data-ics="' + k + '">Add both to my calendar</button><a class="btn sm ghost" href="mailto:?subject=' + encodeURIComponent('Manager Voyage: two questions this week') + '&body=' + encodeURIComponent(N.map(function(x){ return x.day + ': ' + x.q; }).join('\n\n') + '\n\n' + C.site + k.replace('w', 'week-') + '.html') + '">Email them to me</a></div>';
    n.addEventListener('click', function(e){ var b = e.target.closest('[data-ics]'); if(!b) return; var blob = new Blob([icsFor(b.getAttribute('data-ics'))], { type: 'text/calendar' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'manager-voyage-' + b.getAttribute('data-ics') + '-nudges.ics'; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500); }); }); }
  function leaderPage(){
    var L = C.leader, r = $('[data-leader]'); if(!r) return;
    r.innerHTML = '<p class="lead rv">' + esc(L.intro) + '</p><h3 class="h3 rv" style="margin-top:28px">Fifteen minutes before week one</h3><ol class="steps rv">' + L.before.map(function(b){ return '<li>' + esc(b) + '</li>'; }).join('') + '</ol>' +
      '<h3 class="h3 rv" style="margin-top:28px">One question a week</h3><div class="grid g2 rv" style="margin-top:14px">' + L.weekly.map(function(w){ var st = C.standard[C.weeks[w.week - 1].expectation - 1]; return '<div class="card"><span class="no">W' + w.week + '</span><span class="stdtag"><i>' + st.n + '</i>' + esc(st.name) + '</span><h3>“' + esc(w.ask) + '”</h3><p>' + esc(w.why) + '</p></div>'; }).join('') + '</div><p class="note rv">' + esc(L.after) + '</p>';
  }
  function leaderSend(){
    $$('[data-leader-send]').forEach(function(b){ b.addEventListener('click', function(){ var pb = get('pb', {}), ld = get('lead', {});
      var body = 'Hello,\n\nI am in the Manager Voyage cohort this month. Week one asked me to write what my team can expect from me, and to send it to you.\n\nWhat my team can expect from me:\n' + (pb['w1.philosophy'] || '(not written yet)') + '\n\nMy intent for the next 90 days:\n' + (pb['w1.intent_90'] || '(not written yet)') + '\n\nThe expectation I am starting with, and the habit I will keep:\n' + (ld.n ? 'Expectation 0' + ld.n + ', ' + C.standard[ld.n - 1].name + (ld.h ? ', habit: ' + ld.h : '') : '(not chosen yet)') + '\n\nOne question a week would help more than anything. The leader brief is here: ' + C.site + 'leader.html\n\nThank you.';
      location.href = 'mailto:' + (C.links.leaderEmailCc || '') + '?subject=' + encodeURIComponent('Manager Voyage: what my team can expect from me') + '&body=' + encodeURIComponent(body); }); });
  }
  function teamCheck(){
    var r = $('[data-team-check]'); if(!r) return; var T = C.teamCheck;
    var txt = 'Your manager is in the Manager Voyage cohort and has asked for your honest view. Answer each statement with one of: ' + T.scale.join(', ') + '. Your answers are anonymous and are only read when three or more people respond.\n\n' + T.statements.map(function(q, i){ return (i + 1) + '. ' + q; }).join('\n');
    r.innerHTML = '<p class="lead rv">' + esc(T.intro) + '</p>' + (C.links.teamForm ? '<p class="rv"><a class="btn" href="' + esc(C.links.teamForm) + '" target="_blank" rel="noopener">Open the team form</a></p>' : '<div class="tool-card rv"><div><span class="lg">Microsoft Form · anonymous</span><h4>The form link is not set yet</h4><p>When PCB publishes the anonymous form, its link goes in cohort/program.js under links.teamForm and this button opens it. Until then, send the ten statements by email or paste them into your own form.</p></div><button type="button" class="btn" data-copy-team>Copy the ten statements</button></div>') +
      '<ol class="tc rv">' + T.statements.map(function(q, i){ var st = C.standard[i < 3 ? 0 : i < 6 ? 1 : i < 8 ? 2 : 3]; return '<li><span class="stdtag"><i>' + st.n + '</i>' + esc(st.name) + ' · Yukl: ' + esc(st.yukl.toLowerCase()) + '</span><p>' + esc(q) + '</p></li>'; }).join('') + '</ol>' +
      '<p class="rv"><a class="btn ghost sm" href="mailto:?subject=' + encodeURIComponent('Three minutes: how am I doing as your manager?') + '&body=' + encodeURIComponent(txt) + '">Email the ten statements to my team</a></p>';
    r.addEventListener('click', function(e){ if(!e.target.closest('[data-copy-team]')) return; try{ navigator.clipboard.writeText(txt); e.target.textContent = 'Copied'; }catch(x){} });
  }
  function completion(){
    var r = $('[data-completion]'); if(!r) return; var T = C.teamCheck, ind = get('ind', {});
    r.innerHTML = '<ul class="checks" aria-label="Behavioral indicators">' + T.indicators.map(function(i){ return '<li><label><input type="checkbox" data-ind="' + i.k + '"' + (ind[i.k] ? ' checked' : '') + '><span>' + esc(i.t) + '</span></label></li>'; }).join('') + '</ul>' +
      '<div class="btns"><button type="button" class="btn" data-complete>Record my completion</button>' + (C.links.completionForm ? '<a class="btn ghost" href="' + esc(C.links.completionForm) + '" target="_blank" rel="noopener">Open the completion form</a>' : '') + '</div><p class="note" data-complete-note></p><textarea class="rec" data-complete-text hidden rows="10" readonly></textarea>';
    r.addEventListener('change', function(e){ var c = e.target.closest('[data-ind]'); if(!c) return; ind[c.getAttribute('data-ind')] = c.checked; set('ind', ind); });
    r.addEventListener('click', function(e){ if(!e.target.closest('[data-complete]')) return;
      var done = get('done', {}), labs = get('labs', {}), pulse = get('pulse', {}), pb = get('pb', {}), v = vocab();
      var segs = []; C.weeks.forEach(function(w){ w.segments.forEach(function(s){ if(s.kind !== 'break') segs.push({ k: 'w' + w.n + ':' + s.id, t: 'Week ' + w.n + ': ' + s.title }); }); });
      var nd = segs.filter(function(s){ return done[s.k]; }).length;
      var lines = ['Manager Voyage cohort, completion record', 'Date: ' + new Date().toLocaleDateString(), 'Team: ' + (v.a.name || 'not set') + ', ' + (v.type || '') + ', ' + (v.size || '?') + ' people', '',
        'Segments marked done: ' + nd + ' of ' + segs.length, 'Simulation labs: ' + Object.keys(C.labs).map(function(k){ var L = labs[k]; return C.labs[k].title + ' (' + (L ? (L.live ? (L.passed ? 'held, live' : 'attempted, live') : 'tap version') : 'not done') + ')'; }).join('; '),
        'Pulse, week one: ' + [0, 1, 2, 3].map(function(i){ return (pulse.pre || {})[i] || '-'; }).join(' ') + ' · week four: ' + [0, 1, 2, 3].map(function(i){ return (pulse.post || {})[i] || '-'; }).join(' '),
        'Indicators: ' + T.indicators.map(function(i){ return (ind[i.k] ? 'yes' : 'no') + ' ' + i.t; }).join('; '), '',
        'Philosophy: ' + (pb['w1.philosophy'] || ''), 'Team goal: ' + (pb['w4.team_goal'] || ''), 'First move: ' + (pb['w4.first_move'] || ''), 'Reassessment date: ' + (pb['w4.reassess_date'] || '')];
      var txt = lines.join('\n'), ta = $('[data-complete-text]', r); ta.value = txt; ta.hidden = false;
      set('completed', { at: Date.now(), nd: nd, of: segs.length });
      var posted = flowPost({ event: 'completion', program: 'Manager Voyage cohort', at: new Date().toISOString(), area: v.a.name || '', team_type: v.type || '', size: v.size || '', segments_done: nd, segments_total: segs.length, labs: labs, pulse: pulse, indicators: ind, philosophy: pb['w1.philosophy'] || '', team_goal: pb['w4.team_goal'] || '', first_move: pb['w4.first_move'] || '', reassess_date: pb['w4.reassess_date'] || '', who: get('who', {}) });
      $('[data-complete-note]', r).textContent = posted ? 'Recorded. Your completion is on its way to the Futures Learning Hub; the copy below is yours.' : C.links.completionEmail ? 'Your email app opens with this record addressed to the Futures Learning Hub. Send it as is.' : 'The record is below. Until PCB connects the flow, copy it into the completion form or email it to your facilitator.';
      if(C.links.completionEmail) location.href = 'mailto:' + C.links.completionEmail + '?subject=' + encodeURIComponent('Manager Voyage cohort: completion record') + '&body=' + encodeURIComponent(txt);
    });
  }
  /* ---------- week one, recreated from the first pilot: areas of focus, the journey generator, contributor to manager, strengths, the overview, the survey ---------- */
  function flowPost(payload){
    var url = C.links.surveyFlowUrl; if(!url) return false;
    try{ fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload), keepalive: true }).catch(function(){}); return true; }catch(e){ return false; }
  }
  function areas(){ var r = $('[data-areas]'); if(!r) return; r.className = 'grid g3 aof'; r.innerHTML = C.areasOfFocus.map(function(a, i){ return '<div class="card" style="--i:' + i + '"><h3>' + esc(a.n) + '</h3><p>' + esc(a.t) + '</p><p class="team">' + esc(a.team) + '</p></div>'; }).join(''); }
  function journey(){
    var r = $('[data-journey]'); if(!r) return; var J = get('journey', {});
    r.className = 'journey';
    r.innerHTML = '<div class="lenses">' + C.lenses.map(function(l){ return '<label class="lens' + (J[l.k] ? ' has' : '') + '"><span class="mono">' + esc(l.name) + '</span><span class="q">' + esc(l.prompt) + '</span><textarea rows="2" data-lens="' + l.k + '" placeholder="One line.">' + esc(J[l.k] || '') + '</textarea></label>'; }).join('') + '</div>' +
      '<div class="btns"><button type="button" class="btn" data-journey-go>Generate my leadership journey</button><span class="note" style="margin:0" data-journey-n></span></div><div class="jout" data-journey-out hidden><span class="mono">My leadership journey, so far</span><p></p><p class="note">Read it once to the person next to you. Then it goes in your Playbook, section one.</p></div>';
    function n(){ var k = Object.keys(J).filter(function(x){ return J[x] && J[x].trim(); }).length; $('[data-journey-n]', r).textContent = k ? k + ' of 6 moments written' : 'Write any three; six is better.'; }
    r.addEventListener('input', function(e){ var t = e.target.closest('[data-lens]'); if(!t) return; J[t.getAttribute('data-lens')] = t.value; set('journey', J); t.closest('.lens').classList.toggle('has', !!t.value.trim()); n(); });
    r.addEventListener('click', function(e){ if(!e.target.closest('[data-journey-go]')) return;
      var parts = C.lenses.filter(function(l){ return J[l.k] && J[l.k].trim(); }).map(function(l){ var x = J[l.k].trim().replace(/\.$/, ''); var low = x.charAt(0).toLowerCase() + x.slice(1); return l.frame.replace('{x}', low); });
      var out = $('[data-journey-out]', r); if(!parts.length){ out.hidden = false; $('p', out).textContent = 'Write at least one moment first.'; return; }
      var v = vocab(), text = parts.join('. ') + '. ' + (v.a.id ? 'Today I lead ' + v.a.team + ', and ' : 'Today I lead a team, and ') + 'the leader I want to be is drawn from all of it.';
      $('p', out).textContent = text; out.hidden = false; var pb = get('pb', {}); pb['w1.journey'] = text; set('pb', pb); });
    n();
  }
  function icm(){
    var r = $('[data-icm]'); if(!r) return; var I = C.icm, st = get('icm', { lines: '' });
    r.className = 'icm';
    r.innerHTML = '<p class="note">' + esc(I.prompt) + '</p><div class="icm-in"><textarea rows="7" data-icm-text placeholder="less doing, more enabling&#10;my success is the team’s success&#10;more meetings&#10;letting go of control">' + esc(st.lines) + '</textarea><div class="btns"><button type="button" class="btn" data-icm-go>Submit for analysis</button><button type="button" class="btn ghost sm" data-icm-clear>Clear</button></div></div><div class="icm-out" data-icm-out hidden></div>';
    var ta = $('[data-icm-text]', r);
    ta.addEventListener('input', function(){ st.lines = ta.value; set('icm', st); });
    r.addEventListener('click', function(e){
      if(e.target.closest('[data-icm-clear]')){ ta.value = ''; st.lines = ''; set('icm', st); $('[data-icm-out]', r).hidden = true; return; }
      if(!e.target.closest('[data-icm-go]')) return;
      var lines = ta.value.split(/\n|;|,/).map(function(x){ return x.trim(); }).filter(Boolean); if(!lines.length){ ta.focus(); return; }
      var hits = {}, other = []; I.themes.forEach(function(t){ hits[t.k] = []; });
      lines.forEach(function(l){ var low = l.toLowerCase(), found = null; I.themes.forEach(function(t){ if(!found && t.kw.some(function(k){ return low.indexOf(k) > -1; })) found = t.k; }); if(found) hits[found].push(l); else other.push(l); });
      var ranked = I.themes.slice().sort(function(a, b){ return hits[b.k].length - hits[a.k].length; }), missed = I.themes.filter(function(t){ return !hits[t.k].length; });
      var out = $('[data-icm-out]', r);
      out.innerHTML = '<span class="mono">Your ' + lines.length + ' phrases, in ' + ranked.filter(function(t){ return hits[t.k].length; }).length + ' of the six shifts</span>' +
        '<div class="themes">' + ranked.map(function(t){ var n = hits[t.k].length; return '<div class="theme' + (n ? '' : ' empty') + '"><b>' + esc(t.name) + '</b><span class="cnt">' + n + '</span>' + (n ? '<ul>' + hits[t.k].map(function(l){ return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '<p>Nobody said this one yet.</p>') + '<p class="ln">' + esc(t.line) + '</p></div>'; }).join('') + '</div>' +
        (other.length ? '<p class="note">Not sorted: ' + esc(other.join(' · ')) + '. Say them to the room; they may be a seventh shift.</p>' : '') +
        (missed.length ? '<p class="miss"><b>What your group missed:</b> ' + esc(missed.map(function(t){ return lc(t.name); }).join(', ')) + '. Most groups do. It is usually the one that costs new managers the most.</p>' : '<p class="miss"><b>All six.</b> Rare. Now notice which one has the fewest phrases; that is the one to watch.</p>') +
        '<div class="synth"><span class="mono">Identifying the differences helps you understand how to manage</span><p>' + esc(I.synthesis) + '</p></div>';
      out.hidden = false; set('icm', { lines: ta.value, at: Date.now(), n: lines.length, themes: ranked.map(function(t){ return [t.k, hits[t.k].length]; }) });
      out.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  }
  function strengths(){
    var r = $('[data-strengths]'); if(!r) return; var S = get('strength', {}), LV = ['Growing', 'Solid', 'A strength'];
    r.className = 'strengths';
    function paint(){
      r.innerHTML = '<div class="srows">' + C.standard.map(function(st, i){ return '<div class="srow"><span class="stdtag"><i>' + st.n + '</i>' + esc(st.name) + '</span><span class="y">Yukl: ' + esc(st.yukl.toLowerCase()) + '</span><div class="opts">' + LV.map(function(l, j){ return '<button type="button" data-s="' + i + '" data-v="' + j + '" aria-pressed="' + (S[i] === j) + '">' + l + '</button>'; }).join('') + '</div></div>'; }).join('') + '</div>' + read();
    }
    function read(){
      var k = Object.keys(S).length; if(k < 4) return '<p class="note">Honest, not modest. ' + (4 - k) + ' to go.</p>';
      var strong = C.standard.filter(function(_, i){ return S[i] === 2; }), grow = C.standard.filter(function(_, i){ return S[i] === 0; });
      return '<div class="sout"><p><b>Your strengths:</b> ' + (strong.length ? esc(strong.map(function(x){ return lc(x.name); }).join('; ')) : 'none marked yet, and that is usually modesty') + '.</p><p><b>Where you are growing:</b> ' + (grow.length ? esc(grow.map(function(x){ return lc(x.name); }).join('; ')) : 'nothing marked growing, so pick the lowest of the four and treat it as growing') + '.</p><p class="note">Your Foundations assessment said something about this too. If the two disagree, the assessment is usually closer. Carry the growing one into the next activity.</p></div>';
    }
    r.addEventListener('click', function(e){ var b = e.target.closest('button[data-s]'); if(!b) return; S[b.getAttribute('data-s')] = +b.getAttribute('data-v'); set('strength', S); paint(); });
    paint();
  }
  function phil(){ var h = $('[data-fill-phil-h]'); if(!h) return; h.textContent = C.philosophy.h; $('[data-fill-phil-t]').textContent = C.philosophy.t; $('[data-fill-phil-w]').innerHTML = '<b>So what is it?</b> ' + esc(C.philosophy.what); }
  function overview(){ var r = $('[data-overview]'); if(!r) return; r.className = 'ovw'; r.innerHTML = C.weeks.map(function(w){ var st = C.standard[w.expectation - 1]; return '<div class="ow' + (w.n === weekN ? ' now' : '') + '"><b>' + w.n + '</b><div><span class="mono">' + esc(w.mode) + ' · ' + fmtMins(w.mins) + ' · Expectation ' + st.n + '</span><h4>' + esc(w.title) + '</h4><p>' + esc(w.promise) + '</p><p class="pbk">Playbook section ' + w.playbook.n + ': ' + esc(w.playbook.title) + ', due ' + esc(w.playbook.due) + '.</p></div></div>'; }).join(''); }
  function survey(){
    var r = $('[data-survey]'); if(!r) return; var Q = C.survey.questions, ans = {}, who = get('who', {});
    var pre = (location.search.match(/[?&]week=(\d)/) || [])[1];
    r.innerHTML = '<p class="lead rv">' + esc(C.survey.intro) + '</p><form class="svy" novalidate>' + Q.map(function(q, i){
      var h = '<fieldset class="sq"><legend><span class="n">' + (i + 1) + '</span>' + esc(q.t) + '</legend>';
      if(q.type === 'choice') h += '<div class="opts">' + q.opts.map(function(o){ return '<button type="button" data-q="' + q.k + '" data-v="' + esc(o) + '" aria-pressed="false">' + esc(o) + '</button>'; }).join('') + '</div>';
      else if(q.type === 'scale') h += '<div class="sc5"><span>' + esc(q.lo) + '</span>' + [1, 2, 3, 4, 5].map(function(n){ return '<button type="button" data-q="' + q.k + '" data-v="' + n + '" aria-pressed="false">' + n + '</button>'; }).join('') + '<span>' + esc(q.hi) + '</span></div>';
      else h += '<textarea rows="2" data-qt="' + q.k + '"></textarea>';
      return h + '</fieldset>'; }).join('') +
      '<fieldset class="sq"><legend><span class="n">' + (Q.length + 1) + '</span>Optional: who you are</legend><p class="note">' + esc(C.survey.who) + '</p><div class="pbf"><div class="two"><label><b>Name</b><input type="text" data-who="name" value="' + esc(who.name || '') + '"></label><label><b>Vanderbilt email</b><input type="email" data-who="email" value="' + esc(who.email || '') + '"></label></div></div></fieldset>' +
      '<div class="btns"><button type="submit" class="btn">Send my answers</button><span class="note" style="margin:0" data-svy-n></span></div></form><div class="thanks" data-svy-done hidden><h3 class="h3">Thank you.</h3><p></p></div>';
    if(pre){ var b = $('button[data-q="week"][data-v^="Week ' + pre + '"]', r); if(b){ ans.week = b.getAttribute('data-v'); b.setAttribute('aria-pressed', 'true'); } }
    r.addEventListener('click', function(e){ var b = e.target.closest('button[data-q]'); if(!b) return; var q = b.getAttribute('data-q'); ans[q] = isNaN(+b.getAttribute('data-v')) ? b.getAttribute('data-v') : +b.getAttribute('data-v'); $$('button[data-q="' + q + '"]', r).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); });
    $('form', r).addEventListener('submit', function(e){ e.preventDefault();
      $$('[data-qt]', r).forEach(function(t){ ans[t.getAttribute('data-qt')] = t.value.trim(); });
      var need = Q.filter(function(q){ return q.type !== 'text' && ans[q.k] === undefined; });
      if(need.length){ $('[data-svy-n]', r).textContent = 'Answer the rated questions first: ' + need.map(function(q){ return Q.indexOf(q) + 1; }).join(', ') + '.'; return; }
      var v = vocab(), nm = $('[data-who="name"]', r).value.trim(), em = $('[data-who="email"]', r).value.trim();
      var payload = Object.assign({ event: 'survey', program: 'Manager Voyage cohort', at: new Date().toISOString(), page: location.href.split('?')[0], area: v.a.name || '', team_type: v.type || '', name: nm, email: em }, ans);
      var sent = flowPost(payload); var log = get('surveys', []); log.push(payload); set('surveys', log); if(nm || em) set('who', { name: nm, email: em });
      var d = $('[data-svy-done]', r); $('p', d).innerHTML = sent ? 'Your answers are on their way to the Futures Learning Hub.' : 'The survey inbox is not connected yet, so your answers are saved on this device. <a href="mailto:?subject=' + encodeURIComponent('Manager Voyage cohort survey') + '&body=' + encodeURIComponent(JSON.stringify(payload, null, 2)) + '">Email them instead</a>, or ask your facilitator.';
      $('form', r).hidden = true; d.hidden = false; d.scrollIntoView({ block: 'start' }); });
  }

  function runOfShow(){ var r = $('[data-run-of-show]'); if(!r) return; r.innerHTML = C.weeks.map(function(w){ var t = 0; return '<div class="card"><span class="no">' + w.n + '</span><h3>Week ' + w.n + ' · ' + esc(w.title) + '</h3><p class="mono" style="margin:4px 0 8px">' + esc(w.mode) + ' · ' + fmtMins(w.mins) + '</p><ul class="kv">' + w.segments.map(function(s){ var at = t; t += s.mins; var hh = Math.floor(at / 60), mm = at % 60; return '<li><b>' + (hh ? hh + ':' + (mm < 10 ? '0' : '') + mm : ':' + (mm < 10 ? '0' : '') + mm) + '</b><span>' + esc(s.title) + ' <small style="color:var(--tx3)">' + s.mins + ' min</small></span></li>'; }).join('') + '</ul></div>'; }).join(''); }

  /* ---------- present mode: the page as a deck for the room ----------
     Each segment becomes a slide (an <hr class="cut"> inside a segment starts a new slide). Nodes are moved, not
     copied, so every activity keeps its state and its listeners; leaving the deck moves them back. */
  var deck = { on: false, rec: [], slides: [], cur: 0, el: null, bar: null };
  function deckBuild(){
    var d = el('div', 'pdeck'); d.setAttribute('role', 'region'); d.setAttribute('aria-label', 'Slides');
    var hero = $('.hero .wrap');
    if(hero){ var t = el('section', 'slide title'); t.setAttribute('data-wm', WEEK ? '0' + WEEK.n : ''); var inner = el('div', 'in on'); inner.innerHTML = hero.innerHTML; $$('.rv', inner).forEach(function(n){ n.classList.add('on'); }); $$('.btns', inner).forEach(function(n){ n.remove(); }); t.appendChild(inner); d.appendChild(t); deck.slides.push(t); }
    $$('.slide-src, .seg-block[data-seg]').forEach(function(b){
      var id = b.getAttribute('data-seg') || b.getAttribute('data-title') || '', chunks = [[]];
      Array.prototype.slice.call(b.children).forEach(function(c){ if(c.classList.contains('cut')) chunks.push([]); else chunks[chunks.length - 1].push(c); });
      var title = ($('.seg-head h2', b) || $('h2', b) || {}).textContent || id;
      chunks.forEach(function(nodes, ci){ if(!nodes.length) return; var sl = el('section', 'slide'); sl.setAttribute('data-seg', id); var inner = el('div', 'in');
        if(ci > 0) inner.appendChild(el('p', 'eyebrow cont', esc(title) + ' · continued'));
        nodes.forEach(function(n){ deck.rec.push({ n: n, p: n.parentNode, next: n.nextSibling }); inner.appendChild(n); });
        sl.appendChild(inner); d.appendChild(sl); deck.slides.push(sl); });
    });
    var pa = el('button', 'deck-arrow prev', '&larr;'); pa.type = 'button'; pa.setAttribute('aria-label', 'Previous slide'); pa.setAttribute('data-deck', 'prev');
    var na = el('button', 'deck-arrow next', '&rarr;'); na.type = 'button'; na.setAttribute('aria-label', 'Next slide'); na.setAttribute('data-deck', 'next');
    d.appendChild(pa); d.appendChild(na);
    var bar = el('div', 'deckbar');
    bar.innerHTML = '<div class="dl"><span class="mono">' + (WEEK ? 'Week ' + WEEK.n + ' · ' + esc(WEEK.title) : '') + '</span><span class="cnt" aria-live="polite"></span></div>' +
      '<div class="dots" role="tablist" aria-label="Slides">' + deck.slides.map(function(sl, i){ return '<button type="button" role="tab" data-go="' + i + '" aria-label="Slide ' + (i + 1) + '"></button>'; }).join('') + '</div>' +
      '<div class="dr"><button type="button" class="btn sm ghost" data-deck="prev" aria-label="Previous slide">&larr;</button><button type="button" class="btn sm" data-deck="next" aria-label="Next slide">Next &rarr;</button>' +
      '<button type="button" class="btn sm ghost" data-deck="notes" aria-pressed="false" title="N">Notes</button><button type="button" class="btn sm ghost" data-deck="full" title="F">Full screen</button><button type="button" class="btn sm ghost" data-deck="exit" title="Esc">Exit</button></div>';
    deck.el = d; deck.bar = bar;
  }
  function deckGo(i, instant){ i = Math.max(0, Math.min(deck.slides.length - 1, i)); var jump = Math.abs(i - deck.cur) > 1; deck.cur = i; deck.el.scrollTo({ left: i * deck.el.clientWidth, behavior: instant || jump || reduce ? 'auto' : 'smooth' }); deckPaint(); }
  function deckEvent(on){ try { document.dispatchEvent(new CustomEvent('mv-deck', { detail: { on: on, cur: deck.cur } })); } catch(e){} }
  function deckPaint(){ deckEvent(true); $$('.dots button', deck.bar).forEach(function(b, j){ b.setAttribute('aria-selected', j === deck.cur ? 'true' : 'false'); }); $('.cnt', deck.bar).textContent = (deck.cur + 1) + ' / ' + deck.slides.length; $('[data-deck="prev"]', deck.bar).disabled = deck.cur === 0; $('[data-deck="next"]', deck.bar).disabled = deck.cur === deck.slides.length - 1; $$('.deck-arrow', deck.el).forEach(function(a){ a.disabled = a.classList.contains('prev') ? deck.cur === 0 : deck.cur === deck.slides.length - 1; }); }
  function deckOn(){
    if(deck.on) return; deckBuild(); deck.on = true; document.body.classList.add('deck'); document.body.appendChild(deck.el); document.body.appendChild(deck.bar);
    var start = 0, h = location.hash.replace('#seg-', ''); deck.slides.forEach(function(sl, i){ if(!start && h && sl.getAttribute('data-seg') === h) start = i; });
    deckGo(start, true);
    var st; deck.el.addEventListener('scroll', function(){ clearTimeout(st); st = setTimeout(function(){ var i = Math.round(deck.el.scrollLeft / deck.el.clientWidth); if(i !== deck.cur){ deck.cur = i; deckPaint(); } }, 80); }, { passive: true });
    window.addEventListener('resize', deckResize);
    $$('[data-present]').forEach(function(b){ b.setAttribute('aria-pressed', 'true'); b.textContent = 'Scroll view'; });
    /* click anywhere that is not a control: right two thirds forward, left third back */
    deck.el.addEventListener('click', function(e){
      if(e.target.closest('button, a, input, textarea, select, label, summary, details, [role="slider"], .lab, .sort, .tl, .lead-pick, .habits, .pulse, .pbf, .say, .checks, .bigtimer, .timer, .opts, .deck-arrow')) return;
      var x = e.clientX / window.innerWidth; if(x < 0.33) deckGo(deck.cur - 1); else deckGo(deck.cur + 1);
    });
  }
  function deckResize(){ if(deck.on) deckGo(deck.cur, true); }
  function deckOff(){
    if(!deck.on) return;
    if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    var seg = deck.slides[deck.cur] && deck.slides[deck.cur].getAttribute('data-seg');
    deck.rec.slice().reverse().forEach(function(r){ r.p.insertBefore(r.n, r.next && r.next.parentNode === r.p ? r.next : null); });
    deckEvent(false); deck.el.remove(); deck.bar.remove(); deck.rec = []; deck.slides = []; deck.on = false; document.body.classList.remove('deck', 'notes'); window.removeEventListener('resize', deckResize);
    $$('[data-present]').forEach(function(b){ b.setAttribute('aria-pressed', 'false'); b.textContent = 'Present as slides'; });
    if(seg){ var t = $('#seg-' + seg); if(t) t.scrollIntoView(); }
  }
  function fullToggle(){ try{ if(document.fullscreenElement) document.exitFullscreen(); else (document.documentElement.requestFullscreen || function(){}).call(document.documentElement); }catch(e){} }
  function present(){
    if(!WEEK) return;
    var rail = $('.rail'); if(rail){ var b = el('button', 'btn sm present-btn', 'Present as slides'); b.type = 'button'; b.setAttribute('data-present', ''); b.setAttribute('aria-pressed', 'false'); b.title = 'P'; rail.insertBefore(b, rail.firstChild); var hint = el('p', 'note present-hint', 'The room runs as slides: click anywhere to advance, arrow keys, F for full screen. This scrolling page is the phone and print view.'); rail.insertBefore(hint, b.nextSibling); }
    document.addEventListener('click', function(e){
      if(e.target.closest('[data-present]')){ if(deck.on){ set('view', 'scroll'); deckOff(); } else { set('view', 'slides'); deckOn(); } return; }
      var g = e.target.closest('.deckbar [data-go]'); if(g){ deckGo(+g.getAttribute('data-go')); return; }
      var k = e.target.closest('.deckbar [data-deck], .deck-arrow'); if(!k) return; k = k.getAttribute('data-deck');
      if(k === 'prev') deckGo(deck.cur - 1); else if(k === 'next') deckGo(deck.cur + 1); else if(k === 'exit'){ set('view', 'scroll'); deckOff(); } else if(k === 'full') fullToggle();
      else if(k === 'notes'){ var on = document.body.classList.toggle('notes'); e.target.closest('[data-deck]').setAttribute('aria-pressed', on ? 'true' : 'false'); }
    });
    document.addEventListener('keydown', function(e){
      var tag = (e.target.tagName || '').toLowerCase(); if(tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
      if(!deck.on){ if(e.key === 'p' || e.key === 'P'){ deckOn(); } return; }
      if(e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter' && e.target === document.body){ e.preventDefault(); deckGo(deck.cur + 1); }
      else if(e.key === 'ArrowLeft' || e.key === 'PageUp'){ e.preventDefault(); deckGo(deck.cur - 1); }
      else if(e.key === 'Home'){ deckGo(0); } else if(e.key === 'End'){ deckGo(deck.slides.length - 1); }
      else if(e.key === 'f' || e.key === 'F'){ fullToggle(); } else if(e.key === 'n' || e.key === 'N'){ document.body.classList.toggle('notes'); }
      else if(e.key === 'Escape' && !document.fullscreenElement){ set('view', 'scroll'); deckOff(); }
    });
    document.addEventListener('fullscreenchange', function(){ var b = deck.bar && $('[data-deck="full"]', deck.bar); if(b) b.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen'; });
  }

  /* ---------- boot ---------- */
  function boot(){
    header(); footer();
    var p = $('#profile .prof'); if(p) renderProfile(p);
    var ws = $('.stack'); if(ws) weekStack(ws);
    var st = $('ul.std[data-standard]'); if(st) standardThread(st);
    var qg = $('.qrgrid'); if(qg) qrGrid(qg);
    toolCards();
    fillPage();
    segments();
    var tl = $('#timeline'); if(tl) timeline(tl);
    var so = $('#sort'); if(so){ sort(so); document.addEventListener('mv-profile', function(){ sort(so); }); }
    var ld = $('#lead'); if(ld) lead(ld);
    frameworks(); deeper(); manage(); norms(); nudges(); leaderPage(); leaderSend(); teamCheck(); completion(); runOfShow(); areas(); journey(); icm(); strengths(); overview(); survey(); phil();
    labs(); playbook(); pulse(); presentTools(); present();
    words(); reveals(); hero(); stack(); qrSide();
    facil(get('facil', false));
    var qv = (location.search.match(/[?&]view=(slides|scroll)/) || [])[1]; if(qv) set('view', qv);
    if(WEEK && window.innerWidth >= 900 && get('view', 'slides') === 'slides' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){ deckOn(); }
    else if(location.hash){ var t = $(location.hash); if(t) setTimeout(function(){ t.scrollIntoView(); }, 60); }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.MV_COHORT_APP = { fill: fill, vocab: vocab, profile: profile };
})();
