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
    var links = [['index.html', 'Home', 'index'], ['week-1.html', 'Week 1', 'week-1'], ['week-2.html', 'Week 2', 'week-2'], ['week-3.html', 'Week 3', 'week-3'], ['week-4.html', 'Week 4', 'week-4']];
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
    var pages = [['index', 'Cohort home', 'Profile, map, Playbook'], ['week-1', 'Week 1', 'In the classroom'], ['week-2', 'Week 2', 'Remote, 90 minutes'], ['week-3', 'Week 3', 'Remote, 90 minutes'], ['week-4', 'Week 4', 'Capstone, in person']];
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
  function labs(){
    $$('[data-lab]').forEach(function(root){ renderLab(root, C.labs[root.getAttribute('data-lab')]); });
    $$('[data-pairs]').forEach(function(root){ renderPairs(root, C.labs[root.getAttribute('data-pairs')]); });
    document.addEventListener('mv-profile', labs);
  }
  function renderPairs(root, L){
    var v = vocab(), who = C.cast[L.who];
    root.className = 'pairs';
    root.innerHTML = '<div class="rolecard"><b>If you are the manager</b>' + esc(fill(L.brief, v)) + '<ul><li>Frame: ' + esc(L.frame) + '</li><li>Do not read from the card. Say it the way you would say it.</li><li>Finish with the question that fixes it, then a next step with a date.</li></ul></div>' +
      '<div class="rolecard"><b>If you are ' + esc(who.name) + '</b>Open with: “' + esc(fill(L.first, v)) + '” Then play it straight; do not make it easy and do not make it impossible.<ul><li>What is true for you: ' + esc(fill(L.truth, v)) + '</li><li>If the manager hints, say “fine” and wait.</li><li>If the manager says what they noticed, what they expect, and asks what is in the way, tell them the truth.</li></ul></div>';
  }
  function renderLab(root, L){
    if(!L) return;
    var v = vocab(), who = C.cast[L.who], std = C.standard[L.std - 1];
    var brief = fill(L.brief, v);
    root.className = 'lab'; root.setAttribute('data-mode', 'off'); root.setAttribute('data-live', L.key);
    root.innerHTML =
      '<div class="scene"><div class="av"><img src="../assets/img/foundation/cast/' + esc(who.img) + '.webp" alt="" width="128" height="128"><i aria-hidden="true"></i><i class="r2" aria-hidden="true"></i></div>' +
        '<div class="who"><span class="stdtag"><i>' + std.n + '</i>' + esc(std.name) + '</span><h4>' + esc(who.name) + ', ' + esc(fill(L.role, v).replace(/^./, function(c){ return c.toLowerCase(); })) + '</h4><p>' + esc(brief) + '</p><p class="meta">' + esc(L.mins) + ' · ' + (v.a.id ? 'Written for ' + esc(v.a.team) + ', ' + esc(v.type === 'mixed' ? 'hourly and salaried' : v.type) : 'Generic team. <a href="index.html#profile">Set your profile</a> to tailor it') + '</p></div></div>' +
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
      '<p class="way">' + esc(L.way) + '</p><p style="margin-top:12px"><button type="button" class="btn ghost sm" data-live-again>Try it again</button></p>';
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
    lstate(root, 'connecting', 'Asking for the microphone…');
    var mic = navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? navigator.mediaDevices.getUserMedia({ audio: true }) : Promise.reject(new Error('nomic'));
    mic.then(function(stream){ try{ stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} lstate(root, 'connecting', 'Connecting to ' + name + '…'); return import(SDK); })
    .then(function(mod){
      var Conversation = mod.Conversation || (mod.default && mod.default.Conversation); if(!Conversation) throw new Error('nosdk');
      return Conversation.startSession({
        agentId: L.agent, connectionType: 'webrtc',
        dynamicVariables: { counterpart_role: L.key === 'w3' || L.key === 'w4' ? v.a.role2 : v.a.role, team: v.a.team, work: v.a.work, work2: v.a.work2, slip_sentence: cap(v.a.slip) + '.', busy: v.a.busy, team_type: v.type === 'mixed' ? 'hourly and salaried' : v.type, asker: v.a.asker },
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
    if(e.target.closest('[data-live-start]') || e.target.closest('[data-live-again]')) lstart(root);
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
  function present(){
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
    labs(); playbook(); pulse(); present();
    words(); reveals(); hero(); stack(); qrSide();
    facil(get('facil', false));
    if(location.hash){ var t = $(location.hash); if(t) setTimeout(function(){ t.scrollIntoView(); }, 60); }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.MV_COHORT_APP = { fill: fill, vocab: vocab, profile: profile };
})();
