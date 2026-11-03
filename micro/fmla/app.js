/* ══════════ HIRING IN NEW YORK · app engine ══════════
   Progress (eight tracked activities), the activities (myth or fact, put
   the steps in order, the offer call, two ask-or-avoid sorts, three
   situations, the quick check), page narration, and the Oracle hookup.
   State: localStorage mv-nyh-* plus, inside Oracle Learning, SCORM
   suspend_data. Nothing is sent anywhere else. */
(function(){
'use strict';
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var yr = document.getElementById('yr'); if(yr) yr.textContent = new Date().getFullYear();
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
function $(s, c){ return (c || document).querySelector(s); }
function $$(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

/* ── storage ── */
var KEY = 'mv-fmla-';
var mem = {};
var store = (function(){ try{ var t = KEY + 'test'; window.localStorage.setItem(t, '1'); window.localStorage.removeItem(t); return window.localStorage; }catch(e){ return null; } })();
if(!store){ var note = $('#progStorageNote'); if(note) note.hidden = false; }
function get(k){ if(store){ try{ var v = store.getItem(KEY + k); if(v !== null) return v; }catch(e){} } return mem[k] === undefined ? null : mem[k]; }
function set(k, v){ mem[k] = v; if(store){ try{ v === null ? store.removeItem(KEY + k) : store.setItem(KEY + k, v); }catch(e){} } }

var nav = $('#nav');
function navShade(idx){ if(nav) nav.classList.toggle('scrolled', idx > 0); }
document.addEventListener('chart:page', function(ev){ navShade(ev.detail ? ev.detail.index : 0); });
if(window.chartPager) navShade(window.chartPager.current().index);
$$('.reveal').forEach(function(el){ el.classList.add('in'); });

/* ══════════ NARRATION: Listen (this page) and Auto (every page) ══════════
   Plays ../../assets/audio/fmla/<key>-<n>.mp3, recorded from the exact
   words in narration-scripts.js. There is no synthetic fallback. */
var NARR = window.MV_NARR || {};
var narr = { audio:null, playing:false, key:'', auto: get('auto') !== '0', on: get('auto') !== '0', utter:null };
var narrPos = {}; set('narrpos', null);   /* positions saved by an earlier version are cleared: every clip starts from its first word */
function narrPosSave(){ try{ set('narrpos', JSON.stringify(narrPos)); }catch(e){} }
/* every play starts from the top: a page you come back to is read again from its first word */
function narrRemember(){ }
var bbListen = $('#bbListen'), bbListenT = $('#bbListenT'), bbAuto = $('#bbAuto'), narrToast = $('#narrToast'), toastT = null;
function toast(msg){
  if(!narrToast) return;
  narrToast.textContent = msg; narrToast.classList.add('show');
  if(toastT) window.clearTimeout(toastT);
  toastT = window.setTimeout(function(){ narrToast.classList.remove('show'); }, 2800);
}
function narrKey(){ var c = window.chartPager ? window.chartPager.current() : { key:'home', n:1 }; return c.key + '/' + (c.n || 1); }
function narrUI(){
  if(bbListen){
    bbListen.setAttribute('aria-pressed', narr.playing ? 'true' : 'false');
    bbListen.classList.toggle('playing', narr.playing);
    var backAt = false;
    var label = narr.playing ? 'Stop narration' : 'Listen to this page';
    bbListen.setAttribute('aria-label', label); bbListen.setAttribute('title', label);
    if(bbListenT) bbListenT.textContent = narr.playing ? 'Stop' : backAt ? 'Resume' : 'Listen';
  }
  if(bbAuto) bbAuto.setAttribute('aria-pressed', narr.auto ? 'true' : 'false');
  $$('[data-narr]').forEach(function(b){ var on = narr.playing && narr.key === b.getAttribute('data-narr'); b.classList.toggle('playing', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? 'Stop' : 'Listen to this one'); });
}
function narrStop(){
  if(narr.audio){ try{ narrRemember(); narr.audio.pause(); narr.audio.src = ''; }catch(e){} narr.audio = null; }
  if(window.speechSynthesis){ try{ window.speechSynthesis.cancel(); }catch(e){} }
  narr.utter = null; narr.playing = false; narrUI();
}
/* no synthetic fallback: if a clip cannot load, say so rather than read it in a browser voice */
function narrSpeak(text){ narr.playing = false; narrUI(); toast('This page\'s narration could not load. Check your connection and tap Listen.'); }
var MEDIA_V = '5';
function narrPlay(k){
  k = k || narrKey(); var text = NARR[k];
  narrStop();
  if(!text){ toast('No narration on this page.'); return; }
  narr.key = k; narr.playing = true; narrUI();
  var a = new Audio('../../assets/audio/fmla/' + k.replace(/\//g, '-') + '.mp3?v=' + MEDIA_V);
  a.preload = 'auto';
  a.addEventListener('ended', function(){ if(narr.audio === a){ narr.audio = null; narr.playing = false; delete narrPos[k]; narrPosSave(); narrUI(); } });
  a.addEventListener('error', function(){ if(narr.audio === a){ narr.audio = null; narrSpeak(text); } });
  narr.audio = a;
  var pr = a.play();
  if(pr && pr.catch) pr.catch(function(err){
    if(narr.audio !== a) return;
    narr.audio = null;
    if(err && err.name === 'NotAllowedError'){
      narr.playing = false; narrUI();
      if(narr.auto && !narr.armed){ narr.armed = true; var arm = function(){ narr.armed = false; document.removeEventListener('pointerdown', arm, true); document.removeEventListener('keydown', arm, true); window.setTimeout(function(){ if(narr.auto && !narr.playing) narrPlay(); }, 350); }; document.addEventListener('pointerdown', arm, true); document.addEventListener('keydown', arm, true); }
      else if(!narr.auto) toast('Tap Listen to hear this page.');
    }
    else narrSpeak(text);
  });
}
if(bbListen) bbListen.addEventListener('click', function(){ if(narr.playing){ narr.on = false; narrStop(); } else { narr.on = true; narrPlay(); } });
if(bbAuto) bbAuto.addEventListener('click', function(){
  narr.auto = !narr.auto; narr.on = narr.auto; set('auto', narr.auto ? '1' : '0');
  if(narr.auto) narrPlay(); else narrStop();
  toast(narr.auto ? 'Auto-narration on: every page is read as it turns.' : 'Auto-narration off. Tap Listen to hear a page.');
});
document.addEventListener('chart:page', function(){ if(narr.auto) narrPlay(); else if(narr.playing) narrStop(); narrUI(); });
/* tapping into an activity stops the narration, so the two never talk over each other */
document.addEventListener('click', function(e){
  if(e.target.closest('.scn button[data-o], [data-drill] button, .order-list button, .kq button, .md-btn, .cq-nav button, #commitList button')){ if(narr.playing) narrStop(); }
});
if(narr.auto && window.chartPager) window.setTimeout(function(){ narrPlay(); }, 300);
narrUI();

/* ══════════ PROGRESS ══════════ */
var SECTIONS = [
  { k:'basics',    no:'01', name:'The basics',    how:'Decide three statements' },
  { k:'recognize', no:'02', name:'Recognize it',  how:'Sort six lines: route it or handle it' },
  { k:'steps',     no:'03', name:'Where it goes', how:'Put the six steps in order' },
  { k:'origami',   no:'04', name:'Origami',       how:'Find the first move that holds' },
  { k:'yourcall',  no:'05', name:'Your call',     how:'Find the Vanderbilt way in three situations' },
  { k:'quiz',      no:'06', name:'Quick check',   how:'Score 4 of 5' },
  { k:'next',      no:'07', name:'Next steps',    how:'Read the four practices, then mark it done' }
];
function progIs(k){ return get('p-' + k) === '1'; }
function progWrite(k, v){ set('p-' + k, v ? '1' : null); }
var progList = $('#progList'), progCount = $('#progCount'), progSum = $('#progSum'), progFill = $('#progFill'), progStatus = $('#progStatus'), progBtn = $('#progBtn'), progPanel = $('#progPanel');
if(progList) progList.innerHTML = SECTIONS.map(function(s){
  return '<li data-prog-row="' + s.k + '"><a href="#' + s.k + '"><span class="p-no" aria-hidden="true">' + s.no + '</span>' +
    '<span class="p-name">' + s.name + '<span class="p-how">' + s.how + '</span></span></a>' +
    '<button type="button" class="p-state" data-prog="' + s.k + '" aria-pressed="false" aria-label="Mark ' + s.name + ' done">Mark done</button></li>';
}).join('');
var complete = false;
function progRender(changedKey, nowDone){
  var total = SECTIONS.length, doneN = 0;
  SECTIONS.forEach(function(s){ if(progIs(s.k)) doneN++; });
  var left = total - doneN;
  if(progCount) progCount.textContent = doneN + '/' + total;
  if(progFill) progFill.style.width = Math.round(doneN / total * 100) + '%';
  if(progSum) progSum.textContent = doneN === total ? 'All ' + total + ' activities complete.' : doneN + ' of ' + total + ' activities complete. ' + left + ' left; each row is a shortcut.';
  SECTIONS.forEach(function(s){
    var done = progIs(s.k);
    if(done) turnDone(s.k);
    var row = progList ? progList.querySelector('[data-prog-row="' + s.k + '"]') : null;
    if(row){
      row.classList.toggle('done', done);
      var st = row.querySelector('.p-state');
      if(st){ st.textContent = done ? 'Completed' : 'Mark done'; st.setAttribute('aria-pressed', done ? 'true' : 'false'); st.setAttribute('aria-label', done ? s.name + ' completed. Select to un-mark.' : 'Mark ' + s.name + ' done'); }
    }
    var dot = $('.bb-dot[data-rail="' + s.k + '"]');
    if(dot){ dot.classList.toggle('done', done); var base = dot.getAttribute('data-name') || s.name; dot.setAttribute('aria-label', base + ', activity ' + (done ? 'done' : 'not done')); dot.setAttribute('title', base + ' · ' + (done ? 'done' : 'not yet')); }
    $$('.md-btn[data-prog="' + s.k + '"]').forEach(function(b){
      b.setAttribute('aria-pressed', done ? 'true' : 'false');
      var sp = b.querySelector('span'); if(sp) sp.textContent = done ? 'Completed' : 'Done with this module';
    });
  });
  if(changedKey && progStatus){ var sec = SECTIONS.filter(function(s){ return s.k === changedKey; })[0]; if(sec) progStatus.textContent = (nowDone ? 'Activity complete: ' : 'Activity reopened: ') + sec.name + '. ' + doneN + ' of ' + total + ' complete.'; }
  bbDoneSync();
  scormSave(doneN, total);
  if(doneN === total && !complete){ complete = true; allDone(); }
  if(doneN < total) complete = false;
}
var bbDoneBtn = $('#bbDone');
function bbDoneSync(){
  if(!bbDoneBtn) return;
  var curKey = (window.chartPager && window.chartPager.current) ? window.chartPager.current().key : '';
  var sec = SECTIONS.filter(function(s){ return s.k === curKey; })[0];
  if(!sec){ bbDoneBtn.hidden = true; bbDoneBtn.removeAttribute('data-prog'); return; }
  var done = progIs(sec.k);
  bbDoneBtn.hidden = false;
  bbDoneBtn.setAttribute('data-prog', sec.k);
  bbDoneBtn.setAttribute('aria-pressed', done ? 'true' : 'false');
  bbDoneBtn.setAttribute('aria-label', done ? sec.name + ' completed. Select to un-mark.' : 'Mark done: ' + sec.name);
  var t = bbDoneBtn.querySelector('.bb-done-t'); if(t) t.textContent = done ? 'Completed' : 'Mark done';
}
if(bbDoneBtn) bbDoneBtn.addEventListener('click', function(){ var k = bbDoneBtn.getAttribute('data-prog'); if(k) progToggle(k); });
document.addEventListener('chart:page', bbDoneSync);
function turnDone(k){ $$('.v-task[data-task="' + k + '"]').forEach(function(t){ t.classList.add('done'); }); }
function progDone(k){ if(progIs(k)) return; progWrite(k, true); progRender(k, true); }
function progToggle(k){ var v = !progIs(k); progWrite(k, v); progRender(k, v); }
function progOpen(open){ if(!progPanel || !progBtn) return; progPanel.hidden = !open; progBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
if(progBtn) progBtn.addEventListener('click', function(){ progOpen(progPanel && progPanel.hidden); });
if(progPanel) progPanel.addEventListener('click', function(e){
  var st = e.target.closest ? e.target.closest('button.p-state') : null;
  if(st){ progToggle(st.getAttribute('data-prog')); return; }
  if(e.target.closest('a')) progOpen(false);
});
document.addEventListener('click', function(e){ if(progPanel && !progPanel.hidden && !e.target.closest('#progPanel') && !e.target.closest('#progBtn')) progOpen(false); });
document.addEventListener('keydown', function(e){ if(e.key === 'Escape') progOpen(false); });
$$('.md-btn[data-prog]').forEach(function(b){ b.addEventListener('click', function(){ progToggle(b.getAttribute('data-prog')); }); });
var resetBtn = $('#progReset');
if(resetBtn) resetBtn.addEventListener('click', function(){
  if(!window.confirm('Reset your progress in this module?')) return;
  SECTIONS.forEach(function(s){ progWrite(s.k, false); });
  set('quiz-score', null); set('commit', null); set('done-seen', null); doneSeen = false; narrPos = {}; narrPosSave();
  $$('.v-task.done').forEach(function(t){ t.classList.remove('done'); }); $$('#commitList button[data-c]').forEach(function(b){ b.setAttribute('aria-checked', 'false'); });
  progRender(); toast('Progress reset.');
});

/* ── Oracle Learning: SCORM state and completion ── */
function scormSave(doneN, total){
  var sc = window.MVScorm; if(!sc || !sc.connected) return;
  try{
    var state = {}; SECTIONS.forEach(function(s){ state[s.k] = progIs(s.k) ? 1 : 0; });
    if(sc.setData) sc.setData({ nyh: state });
    if(doneN < total && sc.incomplete) sc.incomplete();
  }catch(e){}
}
function scormAdopt(){
  var sc = window.MVScorm; if(!sc || !sc.connected || !sc.getData) return;
  try{ var st = (sc.getData() || {}).nyh || {}; SECTIONS.forEach(function(s){ if(st[s.k] === 1 && !progIs(s.k)) progWrite(s.k, true); }); progRender(); }catch(e){}
}
window.addEventListener('mv-scorm-connected', scormAdopt);
if(window.MVScorm && window.MVScorm.connected) scormAdopt();
var doneSeen = get('done-seen') === '1', modalReturn = null;
function allDone(){
  var score = get('quiz-score'), sc = window.MVScorm;
  try{ if(sc && sc.connected){ if(score !== null && sc.score) sc.score(parseInt(score, 10), 5); if(sc.complete) sc.complete(); } }catch(e){}
  try{ if(window.MVOracle && window.MVOracle.reportCompletion) window.MVOracle.reportCompletion('MM-08', { score: score ? parseInt(score, 10) : null, max: 5, course: 'FMLA for managers' }); }catch(e){}
  if(doneSeen) return;
  doneSeen = true; set('done-seen', '1');
  window.setTimeout(modalShow, reduce ? 0 : 450);
}
function modalShow(){
  var m = $('#oracleModal'); if(!m || !m.hidden) return;
  narrStop();
  var ae = document.activeElement; modalReturn = (ae && ae !== document.body) ? ae : null;
  m.hidden = false;
  if(reduce) m.classList.add('open'); else window.requestAnimationFrame(function(){ m.classList.add('open'); });
  document.body.classList.add('oracle-open');
  var go = $('#oracleGo'); if(go) go.focus();
}
function modalHide(){
  var m = $('#oracleModal'); if(!m || m.hidden) return;
  m.classList.remove('open'); document.body.classList.remove('oracle-open');
  window.setTimeout(function(){ m.hidden = true; }, reduce ? 0 : 260);
  if(modalReturn && modalReturn.focus){ try{ modalReturn.focus(); }catch(e){} } modalReturn = null;
}
(function(){
  var go = $('#oracleGo'); if(go) go.addEventListener('click', modalHide);
  var ov = $('#oracleModal'); if(ov) ov.addEventListener('click', function(e){ if(e.target === ov) modalHide(); });
  document.addEventListener('keydown', function(e){
    var m = $('#oracleModal'); if(!m || m.hidden) return;
    if(e.key === 'Escape'){ modalHide(); return; }
    if(e.key !== 'Tab') return;
    var items = $$('a[href], button:not([disabled])', m); if(!items.length) return;
    var first = items[0], last = items[items.length - 1], active = document.activeElement, idx = items.indexOf(active);
    if(idx === -1){ e.preventDefault(); first.focus(); }
    else if(e.shiftKey && active === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && active === last){ e.preventDefault(); first.focus(); }
  });
})();

/* ══════════ next steps: the four practices, tapped to commit ══════════ */
var COMMITS = [
  ['Route it the same day', 'The day you hear health, family, a new child or military service, send them to Origami and tell your HCM.'],
  ['Never ask for the diagnosis', 'Listen, thank them, and leave the medical detail to the Leave team. Forward any certification unread.'],
  ['Protect the record', 'Approved leave, including intermittent days, never counts against attendance or performance.'],
  ['Plan coverage with your HCM', 'From the approved dates in Origami, not from guesses, and with the time codes the Leave team gives you.']
];
(function(){
  var list = $('#commitList'), status = $('#commitStatus'); if(!list) return;
  var on = (function(){ try{ var v = JSON.parse(get('commit') || '[]'); return Array.isArray(v) ? v : []; }catch(e){ return []; } })();
  list.innerHTML = COMMITS.map(function(t, i){ return '<button type="button" role="checkbox" aria-checked="false" data-c="' + i + '"><span class="cb" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg></span><b>' + esc(t[0]) + '</b><small>' + esc(t[1]) + '</small></button>'; }).join('');
  function paint(){
    $$('button[data-c]', list).forEach(function(b){ b.setAttribute('aria-checked', on[+b.getAttribute('data-c')] ? 'true' : 'false'); });
    var n = on.filter(Boolean).length;
    if(status) status.textContent = n + ' of ' + COMMITS.length + ' committed.' + (n === COMMITS.length ? ' Activity complete.' : '');
    if(n === COMMITS.length) progDone('next');
  }
  list.addEventListener('click', function(e){ var b = e.target.closest('button[data-c]'); if(!b) return; var i = +b.getAttribute('data-c'); on[i] = !on[i]; set('commit', JSON.stringify(on)); paint(); });
  paint();
})();

/* ══════════ exit: close the window when the LMS opened it, otherwise back to the start ══════════ */
(function(){
  var b = $('#exitBtn'); if(!b) return;
  b.addEventListener('click', function(){
    narrStop();
    try{ window.close(); }catch(e){}
    window.setTimeout(function(){ if(window.chartPager) window.chartPager.go(0, { focus:true }); toast('You can close this tab.'); }, 200);
  });
})();

/* ══════════ ask-or-avoid and myth-or-fact drills ══════════ */
var DRILLS = {
  basics: { opts:['Myth','Fact'], prog:'basics', verb:'decided', items:[
    { s:'An employee has to say &ldquo;FMLA&rdquo; or fill out a form before the leave protections apply.', a:0, x:'Myth. The employee only has to give enough information for you to know the leave may be for a covered reason. Once you have heard it, Vanderbilt&rsquo;s duty to respond has started.' },
    { s:'As the manager, I decide whether someone is eligible for FMLA.', a:0, x:'Myth. Eligibility, the twelve months and 1,250 hours, and the medical certification are reviewed by Leave and Workers&rsquo; Compensation through Origami. You route the request.' },
    { s:'FMLA can be taken a few hours or a day at a time, not only as one long block.', a:1, x:'Fact. Intermittent leave and reduced schedules are covered. Those approved days and hours are leave, not attendance.' }
  ]},
  recognize: { opts:['Route it','Handle it'], prog:'recognize', verb:'sorted', items:[
    { s:'&ldquo;My mom had a stroke. I need to be in Memphis for a while.&rdquo;', a:0, x:'Route it. Caring for a parent with a serious health condition. Origami, the same day.' },
    { s:'&ldquo;Can I take next Friday off? My cousin is getting married.&rdquo;', a:1, x:'Handle it. Time off. Check coverage and approve it in UKG or Oracle.' },
    { s:'&ldquo;The doctor wants me out for three weeks after the surgery.&rdquo;', a:0, x:'Route it. Their own serious health condition. You do not need to know what the surgery is.' },
    { s:'&ldquo;We are adopting. The placement could be any week now.&rdquo;', a:0, x:'Route it. A new child by adoption is a covered reason, for either parent.' },
    { s:'&ldquo;I would like to shift my hours to start at 7 so I beat the traffic.&rdquo;', a:1, x:'Handle it. A schedule preference with no health or family reason behind it. Yours to decide.' },
    { s:'&ldquo;My husband&rsquo;s unit is deploying next month. There is a lot to sort out.&rdquo;', a:0, x:'Route it. A qualifying exigency from a family member&rsquo;s military service is a covered reason.' }
  ]}
};
function buildDrill(el){
  var name = el.getAttribute('data-drill'), d = DRILLS[name]; if(!d) return;
  var status = $('#' + name + 'Status'), done = {}, cur = 0, right = 0;
  el.innerHTML = d.items.map(function(it, i){
    return '<div class="dq' + (i === 0 ? ' cur' : '') + '" data-i="' + i + '"><p class="dq-s"><b>' + (i + 1) + ' of ' + d.items.length + '</b>' + it.s + '</p><div class="dq-opts" role="group" aria-label="Choose one">' +
      d.opts.map(function(o, oi){ return '<button type="button" data-o="' + oi + '" aria-pressed="false">' + esc(o) + '</button>'; }).join('') +
      '</div><p class="dq-x" role="status"></p><div class="dq-nav">' + (i < d.items.length - 1 ? '<button type="button" class="btn btn-primary btn-sm" data-next="1">Next<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' : '') + '</div></div>';
  }).join('');
  function pips(){ return '<span class="pips" aria-hidden="true">' + d.items.map(function(it, i){ return '<i class="' + (done[i] === 1 ? 'ok' : done[i] === 2 ? 'no' : '') + '"></i>'; }).join('') + '</span>'; }
  function show(i){ $$('.dq', el).forEach(function(q, qi){ q.classList.toggle('cur', qi === i); }); cur = i; var f = $$('.dq', el)[i].querySelector('button:not([disabled])'); if(f) f.focus({ preventScroll:true }); }
  el.addEventListener('click', function(e){
    var nx = e.target.closest('button[data-next]');
    if(nx){ if(cur < d.items.length - 1) show(cur + 1); return; }
    var b = e.target.closest('button[data-o]'); if(!b || b.disabled) return;
    var q = b.closest('.dq'), i = parseInt(q.getAttribute('data-i'), 10), oi = parseInt(b.getAttribute('data-o'), 10), it = d.items[i];
    var ok = oi === it.a;
    $$('button[data-o]', q).forEach(function(x){ x.disabled = true; x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); if(parseInt(x.getAttribute('data-o'), 10) === it.a) x.classList.add('is-answer'); });
    q.classList.add(ok ? 'right' : 'wrong');
    q.querySelector('.dq-x').innerHTML = '<b>' + (ok ? 'Right. ' : 'Not quite. ') + '</b>' + it.x;
    done[i] = ok ? 1 : 2; if(ok) right++;
    var n = Object.keys(done).length;
    if(status) status.innerHTML = pips() + '<span>' + n + ' of ' + d.items.length + ' ' + d.verb + '.' + (n === d.items.length ? ' ' + right + ' of ' + d.items.length + ' right. Activity complete.' : '') + '</span>';
    if(n === d.items.length) progDone(d.prog);
  });
  if(status) status.innerHTML = pips() + '<span>0 of ' + d.items.length + ' ' + d.verb + '.</span>';
}
$$('[data-drill]').forEach(buildDrill);

/* ══════════ put the six steps in order ══════════ */
(function(){
  var box = $('#orderBox'), status = $('#stepsStatus'); if(!box) return;
  var STEPS = [
    'A team member tells you, in their own words, about a health or family situation.',
    'You thank them, listen, and ask nothing about the medical detail.',
    'The same day, you send them to Origami, or open the request with them, and tell your HCM.',
    'The Leave team reviews eligibility and the certification, and records the approved type and dates in Origami.',
    'You plan coverage from those dates and record leave time with the codes the Leave team gives you.',
    'They come back. You talk about the work and the schedule, and the attendance record stays clean.'
  ];
  var SHOW = [3, 0, 4, 1, 5, 2];   /* a fixed shuffle, so every learner sees the same puzzle */
  var next = 0;
  box.innerHTML = '<p class="o-h"><b>Activity</b>Tap the steps in the order they happen. A wrong tap tells you why.</p><ol class="order-list" aria-label="Steps, in the order shown on screen">' +
    SHOW.map(function(si){ return '<li><button type="button" data-s="' + si + '"><span class="n" aria-hidden="true"></span><span>' + esc(STEPS[si]) + '</span></button></li>'; }).join('') + '</ol>';
  var WHY = [
    'It starts when they tell you, in any words. The law does not require the acronym or a form.',
    'Listening without asking for the diagnosis comes before any routing.',
    'Routing happens the same day, before anything is decided. Your HCM hears the same day.',
    'Eligibility and certification are the Leave team\'s, and they happen after the request is in Origami.',
    'Coverage and timekeeping come from the approved dates, so they follow the Leave team\'s decision.',
    'The return comes last, and the record stays clean because every earlier step held.'
  ];
  box.addEventListener('click', function(e){
    var b = e.target.closest('button[data-s]'); if(!b || b.disabled) return;
    var si = parseInt(b.getAttribute('data-s'), 10);
    if(si === next){
      b.classList.add('placed'); b.disabled = true; b.querySelector('.n').textContent = String(next + 1); next++;
      if(status) status.textContent = next < STEPS.length ? 'Right. ' + WHY[si] + ' ' + next + ' of ' + STEPS.length + ' placed.' : 'All six in order. Activity complete.';
      if(next === STEPS.length) progDone('steps');
    } else {
      b.classList.add('shake'); window.setTimeout(function(){ b.classList.remove('shake'); }, 500);
      if(status) status.textContent = 'Not yet. ' + WHY[si] + ' What happens before it?';
    }
  });
})();

/* ══════════ scenarios: the offer call, and three situations ══════════ */
var SCENARIOS = {
  origami: { s:'Tuesday, end of the 1:1. Priya says: “I have to have a procedure next month. I will probably be out two or three weeks. I did not want to make a big thing of it.” What is your first move?', opts:[
    { t:'“Of course. What kind of procedure? I want to make sure we plan the right amount of time.”', b:'Kind, and over the line', best:false, out:'The question is about her diagnosis, and you have no need for it. The amount of time comes from her provider through Origami, not from what she tells you in a 1:1. Now she has shared medical detail she did not owe you, and you are holding it.' },
    { t:'“Thank you for telling me. Let us get it into Origami today so the Leave team can set it up, and I will let our HCM know. We will plan the coverage from the dates they approve.”', b:'Routed the same day, no diagnosis', best:true, out:'Priya files in Origami that afternoon. The Leave team confirms eligibility and dates within the week, your HCM helps you plan the coverage, and the only thing you ever needed to know, when and for how long, arrives from the right place.' },
    { t:'“No problem, we will work it out closer to the time. Just let me know the dates when you have them.”', b:'Waiting for a better time', best:false, out:'Nothing is filed. Three weeks later she is out, nobody has told the Leave team, the time is recorded as unscheduled absence, and the eligibility notice Vanderbilt owed her within five business days never went out.' }
  ]},
  s1: { h:'After the 1:1', s:'Marcus, one of your strongest people, stays after the 1:1: “My dad has been in and out of the hospital. I might need some time off for it, I am not sure yet. I did not want you to think I was slacking.”', opts:[
    { t:'“Family first. Take whatever you need and we will figure out the time later. Keep me posted on how he is doing.”', b:'Warm, and nothing routed', best:false, out:'Marcus hears support and files nothing. When the hospital stays stack up, his absences are unprotected time, and “keep me posted on how he is doing” invites medical detail you should not be collecting.' },
    { t:'“Thank you for telling me, and it does not change how I see your work. Let us put it into Origami this week so the Leave team can protect the time if you need it, even a day here and there. I will tell our HCM today, and we will move what we need to this week.”', b:'Thanked, routed, work adjusted', best:true, out:'Marcus files in Origami and the Leave team sets up intermittent leave. The hospital days are protected before he needs them, two deadlines move this week, and he heard the thing he was afraid of: his standing is intact.' },
    { t:'“I appreciate that. Caregiving is not really something FMLA covers for a parent, but use your PTO and we will be flexible.”', b:'Deciding eligibility yourself', best:false, out:'Caring for a parent with a serious health condition is one of the four covered reasons. You just told a team member, wrongly, that the law does not protect him, and steered him away from the request.' }
  ]},
  s2: { h:'The attendance write-up', s:'A supervisor on your team brings you a draft written warning: “Dana has missed six mornings in five weeks. Reliability is a core expectation.” You remember Dana has an approved intermittent leave in Origami for a chronic condition.', opts:[
    { t:'Sign it. Six mornings is six mornings, and the policy applies to everyone the same way.', b:'Counting leave as attendance', best:false, out:'The mornings are approved intermittent leave. A warning for them is interference with a protected leave, and it is the kind of document that ends up as the first exhibit. Policy applies to everyone, and the law applies to the policy.' },
    { t:'Hold the warning. Check with the Leave team which absences fall under the approved leave, remove those from the count, and coach the supervisor on how intermittent leave is recorded.', b:'Check Origami before you count', best:true, out:'Five of the six mornings are leave days recorded with the right code. The sixth is handled as a normal attendance conversation. Dana’s record stays clean, the supervisor learns the rule, and the write-up never exists.' },
    { t:'Soften it to a verbal coaching note and ask Dana to schedule her condition around the morning rush.', b:'A smaller version of the same mistake', best:false, out:'A chronic condition does not keep a calendar, and asking someone to schedule it is asking them to give up protected leave. Gentler wording is still interference.' }
  ]},
  s3: { h:'The return', s:'Jordan comes back after six weeks. Two colleagues covered the work and want to know what happened. One asks you in the hallway: “So what was wrong with her? Is she okay to be back?”', opts:[
    { t:'“She had surgery. She is cleared, so it is business as usual.”', b:'Sharing what was never yours', best:false, out:'Even if you know, it is not yours to share, and even if you do not know, “cleared” implies you do. Jordan’s medical privacy was breached in one sentence in a hallway.' },
    { t:'“She was on approved leave and she is back. The return is handled by the Leave team, so there is nothing to worry about. Thank you for covering; let us talk about how we hand the work back.”', b:'The work, not the condition', best:true, out:'The team hears the only thing they need to: she was away, it was approved, she is back, and the handover is organized. Any fitness-for-duty question went through the Leave team, not through you.' },
    { t:'“I honestly do not know the details. Ask her, she will tell you if she wants to.”', b:'Passing the question along', best:false, out:'You have sent a colleague to ask Jordan about her health on her first day back. The conversation you should have closed is now hers to manage.' }
  ]}
};
(function(){ var POS = { origami:1, s1:2, s2:0, s3:1 }; Object.keys(POS).forEach(function(k){ var sc = SCENARIOS[k], bi = -1; sc.opts.forEach(function(o, i){ if(o.best) bi = i; }); if(bi < 0 || bi === POS[k]) return; var o = sc.opts.splice(bi, 1)[0]; sc.opts.splice(POS[k], 0, o); }); })();
function buildScenario(el, onBest){
  var name = el.getAttribute('data-scn'), sc = SCENARIOS[name]; if(!sc) return;
  var tried = {};
  el.innerHTML = '<p class="scn-s">' + esc(sc.s) + '</p><div class="scn-opts" role="group" aria-label="Choose your response">' +
    sc.opts.map(function(o, i){ return '<button type="button" data-o="' + i + '" aria-pressed="false"><span class="k" aria-hidden="true">' + String.fromCharCode(65 + i) + '</span><span>' + esc(o.t) + '</span></button>'; }).join('') +
    '</div><div class="scn-out" role="status" aria-live="polite"></div>';
  var out = el.querySelector('.scn-out');
  el.addEventListener('click', function(e){
    var b = e.target.closest('button[data-o]'); if(!b) return;
    var i = parseInt(b.getAttribute('data-o'), 10), o = sc.opts[i];
    tried[i] = 1;
    $$('button[data-o]', el).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    if(o.best) b.classList.add('best-pick');
    var n = Object.keys(tried).length;
    out.innerHTML = '<span class="vtag' + (o.best ? ' best' : '') + '">' + (o.best ? 'The Vanderbilt way: ' : 'Consider: ') + esc(o.b) + '</span><p>' + esc(o.out) + '</p>' +
      (n < sc.opts.length ? '<p class="scn-again hinttxt">' + (o.best ? 'See what the other responses would have cost. ' : 'Now pick the response a Vanderbilt hiring leader would give. ') + n + ' of ' + sc.opts.length + ' tried.</p>' : '<p class="scn-again hinttxt">All three tried.</p>');
    out.classList.add('show');
    if(o.best && onBest) onBest(name);
  });
}
$$('.scn[data-scn]').forEach(function(el){ buildScenario(el, function(name){ if(name === 'offer') progDone('offer'); }); });
/* three situations, one at a time */
(function(){
  var el = $('#callsBox'), status = $('#nyStatus'); if(!el) return;
  var keys = ['s1', 's2', 's3'], found = {}, cur = 0;
  el.innerHTML = keys.map(function(k, i){
    return '<div class="cq' + (i === 0 ? ' cur' : '') + '" data-k="' + k + '"><p class="cq-h">' + (i + 1) + ' of ' + keys.length + ' &middot; ' + esc(SCENARIOS[k].h) + '</p><div class="scn" data-scn="' + k + '"></div><div class="cq-nav">' +
      (i < keys.length - 1 ? '<button type="button" class="btn btn-primary btn-sm" data-next="1" hidden>Next situation<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' : '') + '</div></div>';
  }).join('');
  $$('.scn[data-scn]', el).forEach(function(s){ buildScenario(s, function(name){
    found[name] = 1;
    var q = s.closest('.cq'), nx = q.querySelector('button[data-next]'); if(nx) nx.hidden = false;
    var n = Object.keys(found).length;
    if(status) status.textContent = n + ' of ' + keys.length + ' situations.' + (n === keys.length ? ' Activity complete.' : '');
    if(n === keys.length) progDone('yourcall');
  }); });
  el.addEventListener('click', function(e){
    var nx = e.target.closest('button[data-next]'); if(!nx) return;
    cur = Math.min(cur + 1, keys.length - 1);
    $$('.cq', el).forEach(function(q, qi){ q.classList.toggle('cur', qi === cur); });
    var f = $$('.cq', el)[cur].querySelector('button'); if(f) f.focus({ preventScroll:true });
  });
})();

/* ══════════ quick check ══════════ */
var QUIZ = [
  { seg:'The basics', q:'How much job-protected leave does FMLA give an eligible employee in a 12-month period?', opts:['Up to 6 weeks','Up to 12 weeks, and up to 26 to care for a service member','Up to 12 weeks, paid','As much as the manager approves'], a:1, x:'Up to twelve weeks, unpaid with health coverage kept, and up to twenty six weeks to care for a covered service member. The Leave team confirms eligibility.' },
  { seg:'Recognize it', q:'A team member says: “My mom had a stroke, I need to be in Memphis for a while.” This is:', opts:['A leave request you route to Origami the same day','A PTO request you approve','Not covered, because it is a parent, not a child','Something to revisit when she knows the dates'], a:0, x:'Caring for a parent with a serious health condition is a covered reason. No acronym needed. Route it the same day.' },
  { seg:'Where it goes', q:'Someone on your team is hurt at work. The first step is:', opts:['Send them to Origami','The injury report the same day, then treatment by their primary work location','Ask them to see their own doctor and bring a note','Tell your HCM at the end of the week'], a:1, x:'Report the injury the same day. On the Nashville campus, treatment is at the Occupational Health Clinic; elsewhere, the nearest appropriate facility. Then the claim and any leave run through the Leave team.' },
  { seg:'Origami', q:'A medical certification for a team member arrives in your inbox. You:', opts:['Read it so you can plan coverage','File it with your 1:1 notes','Forward it unread to the Leave team and delete your copy','Ask the employee to walk you through it'], a:2, x:'Certification goes to Leave and Workers’ Compensation, never to the manager. Forward it unread and delete your copy. Coverage comes from the approved dates, not the diagnosis.' },
  { seg:'Your call', q:'Dana has approved intermittent leave. She has missed six mornings in five weeks. Before any attendance conversation you:', opts:['Issue the warning; policy applies to everyone','Check with the Leave team which mornings were leave, and remove them from the count','Ask Dana to schedule her condition outside the morning','Count them but note the leave in the file'], a:1, x:'Approved intermittent leave never counts against attendance. Check Origami and the Leave team first, then handle only what is left, if anything.' }
];
(function(){ var POS = [2, 0, 3, 1, 2]; QUIZ.forEach(function(q, i){ var t = POS[i]; if(t === undefined || t === q.a || t >= q.opts.length) return; var o = q.opts.splice(q.a, 1)[0]; q.opts.splice(t, 0, o); q.a = t; }); })();
(function(){
  var box = $('#quizBox'), status = $('#quizStatus'), done = $('#quizDone'); if(!box) return;
  var PASS = 4, cur = 0, score = 0, answered = {};
  function render(){
    cur = 0; score = 0; answered = {};
    box.innerHTML = QUIZ.map(function(it, i){
      return '<div class="kq' + (i === 0 ? ' cur' : '') + '" data-i="' + i + '"><p class="kq-q"><span class="qn">' + (i + 1) + ' of ' + QUIZ.length + ' &middot; ' + esc(it.seg) + '</span><br>' + esc(it.q) + '</p><div class="kq-opts" role="group" aria-label="Choose one">' +
        it.opts.map(function(o, oi){ return '<button type="button" data-o="' + oi + '" aria-pressed="false">' + esc(o) + '</button>'; }).join('') +
        '</div><p class="kq-x" role="status"></p><div class="kq-nav">' + (i < QUIZ.length - 1 ? '<button type="button" class="btn btn-primary btn-sm" data-next="1">Next question<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' : '<button type="button" class="btn btn-primary btn-sm" data-finish="1">See my score</button>') + '</div></div>';
    }).join('');
    done.classList.remove('show'); done.innerHTML = '';
    if(status) status.textContent = '0 of ' + QUIZ.length + ' answered.';
  }
  function show(i){ $$('.kq', box).forEach(function(q, qi){ q.classList.toggle('cur', qi === i); }); cur = i; var f = $$('.kq', box)[i].querySelector('button:not([disabled])'); if(f) f.focus({ preventScroll:true }); }
  function finish(){
    var t = score === QUIZ.length ? ['Gold standard.', 'Perfect. Turn the page for the four practices to keep.'] : score >= PASS ? ['Module check complete.', 'Reread the explanation under the one you missed, then turn the page.'] : ['Almost there.', 'Four of five completes the check. Each missed question names the page to reread; then retake it.'];
    done.innerHTML = '<div class="big-score">' + score + ' / ' + QUIZ.length + '</div><h3>' + t[0] + '</h3><p>' + t[1] + '</p><button type="button" class="btn btn-ghost btn-sm" id="quizRetake">Retake the check</button>';
    done.classList.add('show');
    $$('.kq', box).forEach(function(q){ q.classList.remove('cur'); });
    set('quiz-score', String(score));
    if(score >= PASS) progDone('quiz');
    $('#quizRetake').addEventListener('click', render);
    if(window.chartPager) window.chartPager.goToEl(done);
  }
  box.addEventListener('click', function(e){
    if(e.target.closest('button[data-next]')){ show(cur + 1); return; }
    if(e.target.closest('button[data-finish]')){ finish(); return; }
    var b = e.target.closest('button[data-o]'); if(!b || b.disabled) return;
    var q = b.closest('.kq'), i = parseInt(q.getAttribute('data-i'), 10), oi = parseInt(b.getAttribute('data-o'), 10), it = QUIZ[i];
    var ok = oi === it.a;
    $$('button[data-o]', q).forEach(function(x){ x.disabled = true; x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); if(parseInt(x.getAttribute('data-o'), 10) === it.a) x.classList.add('is-answer'); });
    q.classList.add(ok ? 'right' : 'wrong');
    q.querySelector('.kq-x').innerHTML = '<b>' + (ok ? 'Right. ' : 'Not quite. The answer is: ' + esc(it.opts[it.a]) + '. ') + '</b>' + esc(it.x);
    if(!answered[i]){ answered[i] = 1; if(ok) score++; }
    if(status) status.textContent = Object.keys(answered).length + ' of ' + QUIZ.length + ' answered.';
  });
  render();
})();

/* ══════════ copy to clipboard ══════════ */
$$('[data-copytext]').forEach(function(b){
  b.addEventListener('click', function(){
    var txt = b.getAttribute('data-copytext');
    var done = function(){ var o = b.textContent; b.textContent = 'Copied'; setTimeout(function(){ b.textContent = o; }, 1600); };
    if(navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function(){ window.prompt('Copy this:', txt); });
    else window.prompt('Copy this:', txt);
  });
});

/* links that PCB can set in config.js once confirmed */
(function(){ var C = window.MV_CONFIG || {}; var h = $('#handoutSlot'); if(h && C.nyBackgroundHandoutUrl) h.innerHTML = '<a href="' + esc(C.nyBackgroundHandoutUrl) + '" target="_blank" rel="noopener">Open the handout</a>.'; var d = $('#helpdeskLink'); if(d && C.helpdeskUrl) d.href = C.helpdeskUrl; })();

progRender();
window.MV_COURSE = { SCENARIOS: SCENARIOS, QUIZ: QUIZ, DRILLS: DRILLS };
})();
