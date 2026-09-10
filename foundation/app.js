/* ══════════ MANAGER VOYAGE · FOUNDATION · app engine ══════════
   Progress (eight tracked sections), the six segments' activities (flip
   cards, habit sort, your call, name the behavior), the self-rating that
   orders the 22 micro modules, the knowledge check, page narration, the
   custom and public videos, and the SCORM hookup. State: localStorage
   mv-found-* plus, inside Oracle Learning, SCORM suspend_data. Nothing is
   sent anywhere else. */
(function(){
'use strict';
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var P = window.MV_PROGRAM || null;
var yr = document.getElementById('yr'); if(yr) yr.textContent = new Date().getFullYear();
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
function $(s, c){ return (c || document).querySelector(s); }
function $$(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

/* ── storage ── */
var KEY = 'mv-found-';
var mem = {};
var store = (function(){ try{ var t = KEY + 'test'; window.localStorage.setItem(t, '1'); window.localStorage.removeItem(t); return window.localStorage; }catch(e){ return null; } })();
function get(k){ if(store){ try{ var v = store.getItem(KEY + k); if(v !== null) return v; }catch(e){} } return mem[k] === undefined ? null : mem[k]; }
function set(k, v){ mem[k] = v; if(store){ try{ v === null ? store.removeItem(KEY + k) : store.setItem(KEY + k, v); }catch(e){} } }

/* ── hero video: plays only while the welcome page is open ── */
var vid = document.getElementById('heroVideo');
if(vid){
  if(reduce){ try{ vid.pause(); vid.removeAttribute('autoplay'); }catch(e){} }
  else {
    var heroSync = function(key){ try{ key === 'home' ? vid.play().catch(function(){}) : vid.pause(); }catch(e){} };
    document.addEventListener('chart:page', function(ev){ heroSync(ev.detail ? ev.detail.key : ''); });
    if(window.chartPager) heroSync(window.chartPager.current().key);
  }
}

/* ── greeting from the dashboard profile, the URL, or Oracle Learning ── */
function firstName(full){ if(!full) return ''; full = String(full).trim(); if(full.indexOf(',') > -1) return full.split(',')[1].trim().split(/\s+/)[0]; return full.split(/\s+/)[0]; }
var profile = { name:'', state:'' };
try{ var dp = JSON.parse(localStorage.getItem('mv.manager.v1') || '{}'); if(dp.name) profile.name = dp.name; if(dp.state) profile.state = dp.state; }catch(e){}
try{ var q = new URLSearchParams(location.search); if(q.get('name')) profile.name = q.get('name'); if(q.get('state')) profile.state = String(q.get('state')).toUpperCase(); }catch(e){}
function paintHello(){
  var h = $('#heroHello');
  if(h) h.textContent = profile.name ? 'Welcome aboard, ' + firstName(profile.name) + '.' : 'Welcome aboard.';
}
paintHello();

/* ── nav / mobile menu ── */
var nav = $('#nav'), menuBtn = $('#menuBtn'), mobileMenu = $('#mobileMenu');
function setMenu(open){
  var wasOpen = document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', open);
  if(menuBtn){ menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  if(open && mobileMenu){ var f = mobileMenu.querySelector('a'); if(f) f.focus(); }
  else if(wasOpen && !open && menuBtn) menuBtn.focus();
}
if(menuBtn) menuBtn.addEventListener('click', function(){ setMenu(!document.body.classList.contains('menu-open')); });
if(mobileMenu) mobileMenu.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setMenu(false); });
document.addEventListener('keydown', function(e){
  if(e.key !== 'Tab' || !document.body.classList.contains('menu-open') || !mobileMenu) return;
  var items = $$('a', mobileMenu); if(menuBtn) items.unshift(menuBtn);
  if(!items.length) return;
  var first = items[0], last = items[items.length - 1], active = document.activeElement, idx = items.indexOf(active);
  if(idx === -1){ e.preventDefault(); first.focus(); }
  else if(e.shiftKey && active === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && active === last){ e.preventDefault(); first.focus(); }
});
function navShade(idx){ if(nav) nav.classList.toggle('scrolled', idx > 0); }
document.addEventListener('chart:page', function(ev){ navShade(ev.detail ? ev.detail.index : 0); });
if(window.chartPager) navShade(window.chartPager.current().index);
$$('.reveal').forEach(function(el){ el.classList.add('in'); });

/* ══════════ NARRATION: Listen (this page) and Auto (every page) ══════════
   Plays ../assets/audio/foundation/<key>-<n>.mp3, recorded from the exact
   words in narration-scripts.js. If the file is missing (or blocked inside
   an LMS), the browser's own speech synthesis reads the same words. */
var NARR = window.MV_NARR || {};
var narr = { audio:null, playing:false, key:'', auto: get('auto') === '1', utter:null };
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
    bbListen.setAttribute('aria-label', narr.playing ? 'Stop narration' : 'Listen to this page');
    bbListen.setAttribute('title', narr.playing ? 'Stop narration' : 'Listen to this page');
    if(bbListenT) bbListenT.textContent = narr.playing ? 'Stop' : 'Listen';
  }
  if(bbAuto) bbAuto.setAttribute('aria-pressed', narr.auto ? 'true' : 'false');
}
function narrStop(){
  if(narr.audio){ try{ narr.audio.pause(); narr.audio.src = ''; }catch(e){} narr.audio = null; }
  if(window.speechSynthesis){ try{ window.speechSynthesis.cancel(); }catch(e){} }
  narr.utter = null; narr.playing = false; narrUI();
}
function narrSpeak(text){
  if(!window.speechSynthesis || !window.SpeechSynthesisUtterance){ narr.playing = false; narrUI(); toast('Narration is not available in this browser.'); return; }
  try{
    var u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; u.lang = 'en-US';
    var voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    var pick = voices.filter(function(v){ return /^en(-|_)?(US|GB)?/i.test(v.lang) && /Google|Samantha|Karen|Daniel|Serena|Zira|Aria|Natural/i.test(v.name); })[0] || voices.filter(function(v){ return /^en/i.test(v.lang); })[0];
    if(pick) u.voice = pick;
    u.onend = function(){ if(narr.utter === u){ narr.utter = null; narr.playing = false; narrUI(); } };
    u.onerror = function(){ if(narr.utter === u){ narr.utter = null; narr.playing = false; narrUI(); } };
    narr.utter = u; narr.playing = true; narrUI();
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  }catch(e){ narr.playing = false; narrUI(); }
}
function narrPlay(){
  var k = narrKey(), text = NARR[k];
  narrStop();
  if(!text){ toast('No narration on this page.'); return; }
  narr.key = k; narr.playing = true; narrUI();
  var a = new Audio('../assets/audio/foundation/' + k.replace('/', '-') + '.mp3');
  a.preload = 'auto';
  a.addEventListener('ended', function(){ if(narr.audio === a){ narr.audio = null; narr.playing = false; narrUI(); } });
  a.addEventListener('error', function(){ if(narr.audio === a){ narr.audio = null; narrSpeak(text); } });
  narr.audio = a;
  var pr = a.play();
  if(pr && pr.catch) pr.catch(function(err){
    if(narr.audio !== a) return;
    narr.audio = null;
    if(err && err.name === 'NotAllowedError'){ narr.playing = false; narrUI(); toast('Tap Listen to hear this page.'); }
    else narrSpeak(text);
  });
}
if(bbListen) bbListen.addEventListener('click', function(){ if(narr.playing) narrStop(); else narrPlay(); });
if(bbAuto) bbAuto.addEventListener('click', function(){
  narr.auto = !narr.auto; set('auto', narr.auto ? '1' : null); narrUI();
  if(narr.auto){ toast('Auto-narration on. Each page is read as it turns.'); narrPlay(); }
  else { toast('Auto-narration off.'); narrStop(); }
});
document.addEventListener('chart:page', function(){ narrStop(); if(narr.auto) window.setTimeout(narrPlay, reduce ? 0 : 380); });
document.addEventListener('play', function(e){ if(e.target && e.target.tagName === 'VIDEO' && e.target.id !== 'heroVideo') narrStop(); }, true);
document.addEventListener('visibilitychange', function(){ if(document.hidden && narr.playing) narrStop(); });
narrUI();
if(narr.auto) window.setTimeout(narrPlay, 600);

/* ══════════ custom narrated videos: hide gracefully until the media exists ══════════ */
$$('.cv-wrap').forEach(function(w){
  var v = w.querySelector('video'); if(!v) return;
  v.addEventListener('error', function(){ w.classList.add('nomedia'); });
  if(v.error) w.classList.add('nomedia');
  document.addEventListener('chart:page', function(){ if(!v.paused) v.pause(); });
});

/* ══════════ public videos: a facade, loaded only when tapped ══════════
   Leaving the page puts the facade back, which also stops playback. */
$$('.yt[data-embed]').forEach(function(box){
  var id = box.getAttribute('data-embed'), title = box.getAttribute('data-title') || 'Play video';
  function facade(){
    box.innerHTML = '<button type="button" class="yt-btn" aria-label="Play: ' + esc(title.replace(/&[a-z]+;/g, '')) + '"><span class="yt-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg></span><span class="yt-t">' + title + '</span><span class="yt-sub mono">YouTube &middot; loads when you tap</span></button>';
    box.querySelector('.yt-btn').addEventListener('click', load);
  }
  function load(){
    narrStop();
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
    f.title = title.replace(/&[a-z]+;/g, '');
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; web-share';
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    box.innerHTML = ''; box.appendChild(f);
  }
  facade();
  document.addEventListener('chart:page', function(){ if(box.querySelector('iframe')) facade(); });
});

/* ══════════ PROGRESS ══════════ */
var SECTIONS = [
  { k:'welcome',   no:'01', name:'What management is',           how:'Reveal all six claims, or mark it done' },
  { k:'task',      no:'02', name:'Task-oriented',                how:'Name the six behaviors, or mark it done' },
  { k:'relations', no:'03', name:'Relations-oriented',           how:'Name the six behaviors, or mark it done' },
  { k:'change',    no:'04', name:'Change-oriented',              how:'Name the six behaviors, or mark it done' },
  { k:'external',  no:'05', name:'External',                     how:'Name the six behaviors, or mark it done' },
  { k:'survey',    no:'06', name:'The survey and your profile',  how:'Show your profile' },
  { k:'quiz',      no:'07', name:'Knowledge check',              how:'Score six or more of eight' },
  { k:'nextstep',  no:'08', name:'Your next step',               how:'Mark it done once planned' }
];
function progIs(k){ return get('p-' + k) === '1'; }
function progWrite(k, v){ set('p-' + k, v ? '1' : null); }
var progList = $('#progList'), progCount = $('#progCount'), progSum = $('#progSum'), progFill = $('#progFill'),
    progTop = $('#progTopLine'), progStatus = $('#progStatus'), mprogLine = $('#mprogLine'),
    progBtn = $('#progBtn'), progPanel = $('#progPanel');
if(progList) progList.innerHTML = SECTIONS.map(function(s){
  return '<li data-prog-row="' + s.k + '"><a href="#' + s.k + '"><span class="p-no" aria-hidden="true">' + s.no + '</span>' +
    '<span class="p-name">' + s.name + '<span class="p-how">' + s.how + '</span></span></a>' +
    '<button type="button" class="p-state" data-prog="' + s.k + '" aria-pressed="false" aria-label="Mark ' + s.name + ' done">Mark done</button></li>';
}).join('');
function progRender(changedKey, nowDone){
  var total = SECTIONS.length, doneN = 0;
  SECTIONS.forEach(function(s){ if(progIs(s.k)) doneN++; });
  var left = total - doneN;
  if(progCount) progCount.textContent = doneN + '/' + total;
  if(progFill) progFill.style.width = (doneN / total * 100) + '%';
  if(progSum) progSum.textContent = doneN === total ? 'All ' + total + ' sections complete. The foundation is poured.' : doneN + ' of ' + total + ' sections complete. ' + left + ' left; every row below is a shortcut.';
  if(progTop) progTop.textContent = doneN === 0 ? 'Section tracking: you have ' + total + ' sections ahead.' : doneN === total ? 'Section tracking: all ' + total + ' sections complete.' : 'Section tracking: ' + doneN + ' of ' + total + ' complete, ' + left + ' left.';
  if(mprogLine) mprogLine.textContent = doneN + ' of ' + total + ' sections complete';
  SECTIONS.forEach(function(s){
    var done = progIs(s.k);
    var row = progList ? progList.querySelector('[data-prog-row="' + s.k + '"]') : null;
    if(row){
      row.classList.toggle('done', done);
      var st = row.querySelector('.p-state');
      if(st){ st.textContent = done ? 'Completed' : 'Mark done'; st.setAttribute('aria-pressed', done ? 'true' : 'false'); st.setAttribute('aria-label', done ? s.name + ' completed. Select to un-mark.' : 'Mark ' + s.name + ' done'); }
    }
    $$('.mlink[data-prog="' + s.k + '"]').forEach(function(a){ a.classList.toggle('done', done); });
    var dot = $('.bb-dot[data-rail="' + s.k + '"]');
    if(dot){ dot.classList.toggle('done', done); dot.setAttribute('aria-label', s.name + ', ' + (done ? 'done' : 'not done')); dot.setAttribute('title', s.no + ' · ' + s.name + ' · ' + (done ? 'done' : 'not yet')); }
    $$('.md-btn[data-prog="' + s.k + '"]').forEach(function(b){
      b.setAttribute('aria-pressed', done ? 'true' : 'false');
      var sp = b.querySelector('span'); if(sp) sp.textContent = done ? 'Completed' : 'Done with this section';
    });
  });
  if(changedKey && progStatus){ var sec = SECTIONS.filter(function(s){ return s.k === changedKey; })[0]; if(sec) progStatus.textContent = (nowDone ? 'Section complete: ' : 'Section reopened: ') + sec.name + '. ' + doneN + ' of ' + total + ' complete.'; }
  bbDoneSync();
  scormSave();
  if(doneN === total) allDone();
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
$$('.md-btn').forEach(function(b){ b.addEventListener('click', function(){ progToggle(b.getAttribute('data-prog')); }); });
var progReset = $('#progReset');
if(progReset) progReset.addEventListener('click', function(){
  SECTIONS.forEach(function(s){ progWrite(s.k, false); });
  set('assess', null); set('done-seen', null); doneSeen = false;
  assessAns = new Array(ASSESS_QS.length).fill(null); aCur = 0; assessRender();
  progRender();
  if(progStatus) progStatus.textContent = 'Progress reset. 0 of ' + SECTIONS.length + ' sections complete; your self-assessment is cleared.';
});
if(!store){ var pw = $('#progStorageNote'); if(pw) pw.hidden = false; }

/* ── completion modal (fires once when all eight are done) ── */
var doneSeen = get('done-seen') === '1';
var modalReturn = null, modalTimer = null;
function allDone(){
  if(window.MVScorm && MVScorm.connected) MVScorm.complete();
  if(doneSeen) return;
  doneSeen = true; set('done-seen', '1');
  window.setTimeout(modalShow, reduce ? 0 : 450);
}
function modalShow(){
  var m = $('#oracleModal'); if(!m || !m.hidden) return;
  var ae = document.activeElement; modalReturn = (ae && ae !== document.body) ? ae : null;
  m.hidden = false;
  if(reduce) m.classList.add('open'); else window.requestAnimationFrame(function(){ m.classList.add('open'); });
  document.body.classList.add('oracle-open');
  var go = $('#oracleGo'); if(go) go.focus();
}
function modalHide(){
  var m = $('#oracleModal'); if(!m || m.hidden) return;
  m.classList.remove('open'); document.body.classList.remove('oracle-open');
  modalTimer = window.setTimeout(function(){ m.hidden = true; }, reduce ? 0 : 260);
  if(modalReturn && modalReturn.focus){ try{ modalReturn.focus(); }catch(e){} } modalReturn = null;
}
var oLater = $('#oracleLater'), oOverlay = $('#oracleModal');
if(oLater) oLater.addEventListener('click', modalHide);
if(oOverlay) oOverlay.addEventListener('click', function(e){ if(e.target === oOverlay) modalHide(); });
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

/* ══════════ SCORM: adopt suspend_data, mirror state back ══════════ */
function scormSave(){
  var sc = window.MVScorm; if(!sc || !sc.connected) return;
  var p = {}; SECTIONS.forEach(function(s){ if(progIs(s.k)) p[s.k] = 1; });
  var a = get('assess');
  try{ sc.setData({ v:1, p:p, a: a ? JSON.parse(a) : null, seen: doneSeen ? 1 : 0 }); }catch(e){}
}
function scormAdopt(){
  var sc = window.MVScorm; if(!sc || !sc.connected) return;
  var d = sc.getData() || {};
  if(d.p){ SECTIONS.forEach(function(s){ progWrite(s.k, !!d.p[s.k]); }); }
  if(d.a){ set('assess', JSON.stringify(d.a)); assessLoad(); }
  if(d.seen){ doneSeen = true; set('done-seen', '1'); }
  if(sc.name && !profile.name){ profile.name = sc.name; paintHello(); }
  var t = $('#oracleStripText'); if(t) t.textContent = 'You opened this course from Oracle Learning. Your completion is recorded automatically once all eight sections are done.';
  var f = $('#oracleFine'); if(f) f.textContent = 'Recorded in Oracle Learning' + (sc.name ? ' for ' + sc.name : '') + '.';
  sc.incomplete();
  progRender();
}
window.addEventListener('mv-scorm-connected', scormAdopt);
if(window.MVScorm && MVScorm.connected) scormAdopt();

/* ══════════ flip cards, the framework map, fact or fiction ══════════ */
$$('.flip-btn').forEach(function(btn){ btn.addEventListener('click', function(){ var f = btn.classList.toggle('flipped'); btn.setAttribute('aria-expanded', f ? 'true' : 'false'); }); });
(function(){
  var map = $('#fwMap'), status = $('#fwStatus'); if(!map) return;
  var cards = $$('.fw-card', map), seen = {};
  cards.forEach(function(c, i){
    c.addEventListener('click', function(){
      var open = c.getAttribute('aria-expanded') !== 'true';
      c.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open){ seen[i] = 1; var n = Object.keys(seen).length; if(status) status.textContent = n + ' of 4 categories opened.' + (n === 4 ? ' The next four segments take one each.' : ''); }
    });
  });
})();
(function(){
  var grid = $('#factGrid'), status = $('#factStatus'); if(!grid) return;
  var cards = $$('.myth', grid), seen = {};
  cards.forEach(function(c, i){
    var b = c.querySelector('button');
    b.addEventListener('click', function(){
      var open = c.classList.toggle('open'); b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open){ seen[i] = 1; var n = Object.keys(seen).length; if(status) status.textContent = n + ' of ' + cards.length + ' revealed.' + (n === cards.length ? ' Segment 1 complete.' : ''); if(n === cards.length) progDone('welcome'); }
    });
  });
})();

/* ══════════ habit or the Vanderbilt way: tap to sort ══════════
   v:0 = the habit, v:1 = the Vanderbilt way */
var SORTS = {
  task: [
    { s:'Send the quarter’s goals in one email and assume they landed.', v:0, x:'Clarifying is said out loud, confirmed back, and written where the team can see it.' },
    { s:'Write each person’s goals into Culture Amp and confirm them in the first 1:1.', v:1, x:'Clarifying, the Vanderbilt way: visible, confirmed, dated.' },
    { s:'Look at the finished deliverable on the due date.', v:0, x:'Monitoring happens before the deadline, when there is still time to steer.' },
    { s:'Look at the work in progress in the weekly 1:1.', v:1, x:'Monitoring: progress and quality checked while it can still change.' },
    { s:'Rebuild the report yourself because it is faster.', v:0, x:'Doing the work is not on the list. Finding out why it breaks is problem solving.' },
    { s:'Trace the second failure to its cause, change the handoff, and tell the team.', v:1, x:'Problem solving: cause found, decision made, team told.' },
    { s:'Set the quarter’s three priorities, with an owner each, before the quarter starts.', v:1, x:'Planning: what, who, when, and what gives.' },
    { s:'Decide priorities as requests land, whoever asked loudest.', v:0, x:'That is reacting, not planning. Planning happens before the quarter, not during it.' }
  ],
  relations: [
    { s:'Be friendly, ask about weekends, keep things light.', v:0, x:'Friendly is pleasant. Supporting is listening when it is hard, adjusting the load, and following up.' },
    { s:'Listen when someone is under pressure, move what you can, and check in on Monday.', v:1, x:'Supporting, the Vanderbilt way.' },
    { s:'Wait for the annual review to talk about anyone’s growth.', v:0, x:'Developing is a quarterly conversation, without a form in front of you.' },
    { s:'Ask each person, once a quarter, what they want to be doing in two years, and find one stretch assignment.', v:1, x:'Developing: coaching and opening the next door.' },
    { s:'“Great job, everyone” at the end of the project.', v:0, x:'Names nobody and nothing. Recognizing is specific, named, and within the week.' },
    { s:'“The way you handled the vendor call on Thursday kept us on schedule,” said on Friday.', v:1, x:'Recognizing, the Vanderbilt way.' },
    { s:'Delegate the task but keep every decision.', v:0, x:'That is assigning work. Empowering hands over the decision, with the boundary stated.' },
    { s:'Ask the team how they would design the new rotation before you set it, and use most of their design.', v:1, x:'Empowering, the consulting half: ask before you decide, and let the answer change the decision.' }
  ],
  change: [
    { s:'Forward the campus-wide announcement about the new system.', v:0, x:'Forwarding is not advocating. The why, in your own words, before the email.' },
    { s:'Explain the reason for the new system in the team meeting two days before the announcement.', v:1, x:'Advocating change, the Vanderbilt way.' },
    { s:'Manage the team as if next year looks like this year.', v:0, x:'Envisioning change is a two-sentence picture of what the team will be able to do next year.' },
    { s:'Tell the team, in two sentences, what they will be able to do next year that they cannot do now.', v:1, x:'Envisioning change.' },
    { s:'“That is not how we do it here.”', v:0, x:'The opposite of encouraging innovation.' },
    { s:'“Try it for two weeks and show me.”', v:1, x:'Encouraging innovation: the idea invited and allowed to be tried, small and soon.' },
    { s:'Move to the next project the day this one ends.', v:0, x:'Without a debrief nothing is learned. Ten minutes, written down.' },
    { s:'Run a ten-minute debrief and write the three changes for next time into the Portal template.', v:1, x:'Facilitating collective learning.' }
  ],
  external: [
    { s:'Meet your HR partner for the first time at the first crisis.', v:0, x:'Networking builds the relationship before it is needed.' },
    { s:'Have coffee with your HR partner, your Engagement Consultant, and a peer manager in your first month.', v:1, x:'Networking, the Vanderbilt way: names known before they are needed.' },
    { s:'Learn about the policy change from the team, after it lands.', v:0, x:'External monitoring sees the change before it lands.' },
    { s:'Read the compensation cycle calendar in August and tell the team in September what to expect.', v:1, x:'External monitoring.' },
    { s:'Absorb every request from other units so nobody is upset.', v:0, x:'The team pays for that. Representing defends the workload with numbers, politely and early.' },
    { s:'Show the numbers and negotiate the deadline when another unit’s request would break the month.', v:1, x:'Representing, the Vanderbilt way.' },
    { s:'Write the business case for the open position and walk it through the approval chain yourself.', v:1, x:'Representing: getting the team the resources it needs.' },
    { s:'Wait for central to tell you what other units are planning.', v:0, x:'Ask. The Engagement Consultant and your peer managers are the network that tells you what is coming.' }
  ]
};
function buildSort(el){
  var name = el.getAttribute('data-sort'), items = SORTS[name]; if(!items) return;
  var status = $('#' + name + 'SortStatus'), done = {}, right = 0;
  el.innerHTML = items.map(function(it, i){
    return '<div class="sq" data-i="' + i + '"><p>' + esc(it.s) + '</p><div class="sq-opts" role="group" aria-label="Sort this statement">' +
      '<button type="button" data-v="0" aria-pressed="false">The habit</button><button type="button" data-v="1" aria-pressed="false">The Vanderbilt way</button></div><p class="sq-x" role="status"></p></div>';
  }).join('');
  el.addEventListener('click', function(e){
    var b = e.target.closest('button[data-v]'); if(!b || b.disabled) return;
    var q = b.closest('.sq'), i = parseInt(q.getAttribute('data-i'), 10), v = parseInt(b.getAttribute('data-v'), 10), it = items[i];
    var ok = v === it.v;
    $$('button[data-v]', q).forEach(function(x){ x.disabled = true; x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); if(parseInt(x.getAttribute('data-v'), 10) === it.v) x.classList.add('is-answer'); });
    q.classList.add(ok ? 'right' : 'wrong');
    q.querySelector('.sq-x').innerHTML = '<b>' + (ok ? 'Right. ' : (it.v ? 'That is the Vanderbilt way. ' : 'That is the habit. ')) + '</b>' + esc(it.x);
    done[i] = 1; if(ok) right++;
    var n = Object.keys(done).length;
    if(status) status.textContent = n + ' of ' + items.length + ' sorted.' + (n === items.length ? ' ' + right + ' of ' + items.length + ' right. Now one situation, your call.' : '');
  });
}
$$('[data-sort]').forEach(buildSort);

/* ══════════ your call: one scenario, three responses, consequences ══════════ */
var SCENARIOS = {
  task: { s:'It is Wednesday. The monthly report your team owns is due Friday. Priya, who builds it, has not mentioned it in two weeks, and you have not asked. A director just emailed you asking whether it will be on time.', opts:[
    { t:'Reply “yes” to the director, then build the report yourself Thursday night to be sure.', b:'Not managing', best:false, out:'The report ships. You are now the person who builds it, Priya does not know she was doubted, and next month you are in the same spot. Doing the work is not on the list; monitoring it is.' },
    { t:'Reply “I will confirm today,” then ask Priya in a fifteen-minute check-in where the report stands and what she needs.', b:'Monitoring, then clarifying', best:true, out:'Priya is two-thirds done and waiting on a Finance extract nobody chased. You chase it, confirm Friday with the director, and put the monthly check-in on the calendar for the second week of every month so you never learn this on a Wednesday again.' },
    { t:'Forward the director’s email to Priya with “Please make sure this is on time.”', b:'The habit', best:false, out:'Priya reads it as blame from two levels up. The report may still ship, but you have clarified nothing (what does “on time” mean, what is blocking her) and you have spent trust. Monitoring is a conversation, not a forwarded email.' }
  ]},
  relations: { s:'Marcus, one of your strongest people, stays after the 1:1 and says: “My dad has been in and out of the hospital. I might need some time off for it, I am not sure yet. I did not want you to think I was slacking.”', opts:[
    { t:'“I am so sorry. Take whatever you need. Just let me know what is going on with him so I can plan around it.”', b:'Supporting, but a step too far', best:false, out:'Warm, and it asks for a diagnosis, which you must never do. It also leaves a possible leave request sitting with you instead of with leave administration. The kindness is right; the routing is missing.' },
    { t:'“Thank you for telling me. Let us move the two deadlines you have this week. I am going to send your situation to leave administration today so the options are ready if you need them, and nothing you told me affects how I see your work.”', b:'Supporting, and route it', best:true, out:'Marcus has what he needs: the load adjusted now, the leave process started without him having to ask twice, and no request for medical detail. Support and a legal duty arrived in the same sentence; you handled both.' },
    { t:'“No problem at all. Let me know if it becomes an issue.”', b:'The habit', best:false, out:'Friendly, and nothing changed. The deadlines still stand, the leave request is not routed, and Marcus learns that telling you things does not help. Being pleasant is not supporting.' }
  ]},
  change: { s:'Central is replacing the travel reimbursement system in six weeks. The announcement email goes out next Tuesday. Your team already hates the idea; two people have said “here we go again” in the hallway.', opts:[
    { t:'Wait for the announcement email and forward it with “FYI, let me know if you have questions.”', b:'The habit', best:false, out:'The team hears about it from central, not from you, and the hallway version wins. Forwarding is not advocating change.' },
    { t:'In Thursday’s team meeting, before the email, explain in your own words why the change is happening and what it fixes, ask what worries them, and write the worries down to take back to central.', b:'Advocating change', best:true, out:'The team still does not love it, but they heard the why from you first, their objections went somewhere, and two of them volunteer to test the new system early. Small and weekly is how uncommon agility actually happens.' },
    { t:'Tell the team you also think it is a bad idea, but there is nothing anyone can do.', b:'The opposite of advocating', best:false, out:'It feels honest and it costs the team its manager. You have joined the hallway instead of leading it, and nobody’s concerns will reach the people who could act on them.' }
  ]},
  external: { s:'A director in another unit emails you Monday: “We need your team to pull a full data reconciliation by Friday for our audit prep.” Your team’s own month-end close is the same week. Doing both is not possible without weekend work.', opts:[
    { t:'Say yes and ask the team to work the weekend. Better not to upset a director.', b:'The habit', best:false, out:'The audit prep ships, the team works the weekend, and next quarter the same director asks again, sooner, because it worked. Absorbing every request is what representing replaces.' },
    { t:'Reply the same day with the numbers: the hours the reconciliation takes, the month-end close it collides with, and two options, a partial pull by Friday with the rest the following Wednesday, or the full pull with the close pushed, and ask which the audit actually needs.', b:'Representing', best:true, out:'The director needed three of the seven tables by Friday and did not know the close was that week. You deliver three tables Thursday, the rest Wednesday, no weekend. The team saw you defend their month, politely and early.' },
    { t:'Reply “We cannot do this” and copy your unit leader.', b:'Not representing, escalating', best:false, out:'Your unit leader now owns a negotiation you could have had in one email, and the director hears “no” with no reason and no option. Representing is speaking for the team with the numbers, not just refusing for it.' }
  ]}
};
function buildScenario(el){
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
      (n < sc.opts.length ? '<p class="scn-again hinttxt">' + (o.best ? 'See what the other responses would have cost. ' : 'Now pick the response a Vanderbilt manager would give. ') + n + ' of ' + sc.opts.length + ' tried.</p>' : '<p class="scn-again hinttxt">All three tried. Turn the page to name the behaviors.</p>');
    out.classList.add('show');
  });
}
$$('[data-scn]').forEach(buildScenario);

/* ══════════ name the behavior: six situations, one at a time ══════════ */
var DRILLS = {
  task: { opts:['Planning','Clarifying','Monitoring','Problem solving','Not managing'], prog:'task', verb:'named', items:[
    { s:'Before the quarter, set three priorities, assigned an owner to each, and decided what would move if a new request landed.', a:0, x:'Planning: what, who, when, and what gives. Done before the quarter, not during it.' },
    { s:'In the first 1:1 of the month, confirmed with each person what they own, the deadline, and what “done well” means, and wrote it in Culture Amp.', a:1, x:'Clarifying. Said out loud, confirmed back, written where the team can see it.' },
    { s:'Looked at the half-finished slide deck in the weekly 1:1 rather than the finished one on the due date.', a:2, x:'Monitoring: progress and quality checked before the deadline, when there is still time to steer.' },
    { s:'Stayed late to rebuild the report personally after the process broke for the second time this month.', a:4, x:'Not managing. Doing the work is not on the list. Finding out why the process breaks and deciding what changes would be problem solving.' },
    { s:'After the second failure, traced it to a handoff nobody owned, assigned the handoff, and told the team.', a:3, x:'Problem solving: cause found, decision made, team told.' },
    { s:'Approved the team’s timecards on Thursday and asked one person about a 52-hour week before approving it.', a:2, x:'Monitoring. Approvals in Oracle are monitoring behavior; the question before the approval is what makes it management.' }
  ]},
  relations: { opts:['Supporting','Developing','Recognizing','Empowering','Route it'], prog:'relations', verb:'named', items:[
    { s:'Told a direct report, “The way you handled the vendor call on Thursday kept us on schedule,” on Friday.', a:2, x:'Recognizing: specific, named, within the week.' },
    { s:'Handed over the decision about the new intake process, not only the task, and set the one boundary it had to respect.', a:3, x:'Empowering: a real decision delegated, with the boundary stated.' },
    { s:'Asked each person in the quarterly 1:1 what they want to be doing in two years, and found one stretch assignment to match.', a:1, x:'Developing: coaching and opening the next door, without a form in front of you.' },
    { s:'A team member said their mother is in the hospital. The manager listened, moved two deadlines, and checked in on Monday.', a:0, x:'Supporting: concern shown, load adjusted, follow-up kept. If the person needs time off for it, that becomes a leave request to route.' },
    { s:'A team member said a colleague keeps commenting on their accent. The manager documented it and called Equal Opportunity and Access the same day.', a:4, x:'Route it. Support still matters, but a possible discrimination report is a duty, not a relations behavior. You do not investigate; you report the same day.' },
    { s:'Before setting the new on-call rotation, asked the team how they would design it, and used most of their design.', a:3, x:'Empowering, the consulting half: ask before you decide, and let the answer change the decision.' }
  ]},
  change: { opts:['Advocating change','Envisioning change','Encouraging innovation','Facilitating collective learning','Not this category'], prog:'change', verb:'named', items:[
    { s:'Explained the reason for the new travel system in the team meeting, in their own words, two days before the campus-wide email.', a:0, x:'Advocating change: the why, in your own words, before the announcement, with objections taken seriously.' },
    { s:'Ran a ten-minute debrief after the orientation event and wrote the three changes for next year into the Portal template.', a:3, x:'Facilitating collective learning: what worked, what did not, what changes, written down.' },
    { s:'Told a team member who suggested a new way to run the weekly report, “Try it for two weeks and show me.”', a:2, x:'Encouraging innovation: the idea invited and allowed to be tried, small and soon.' },
    { s:'Described to the team, in two sentences, what they will be able to do next year that they cannot do now, and how it connects to the Chancellor’s vision.', a:1, x:'Envisioning change: a clear picture of where the team is going and why it matters.' },
    { s:'Approved a flexible work request after checking the policy and the equity across the team.', a:4, x:'Not this category. That is task and relations behavior (a decision with a process, and empowering). Change-oriented behavior is about the team getting better at what it does.' },
    { s:'Shared the checklist one person built with the whole team and made it the standard.', a:3, x:'Facilitating collective learning: knowledge from one person becomes the team’s.' }
  ]},
  external: { opts:['Networking','External monitoring','Representing','Not this category'], prog:'external', verb:'named', items:[
    { s:'Had coffee with a peer manager in Finance in the first month, before needing anything from Finance.', a:0, x:'Networking: the relationship built before it is needed.' },
    { s:'Read the compensation cycle calendar in August and told the team in September what to expect in October.', a:1, x:'External monitoring: what is coming, seen before it lands.' },
    { s:'When another unit asked for a report that would take a week the team did not have, showed the numbers and negotiated a two-week deadline.', a:2, x:'Representing: the team’s workload defended with numbers, politely and early.' },
    { s:'Ran the weekly 1:1 and checked the progress on each person’s goals.', a:3, x:'Not this category. Monitoring is task-oriented. External behavior faces outside the team.' },
    { s:'Wrote the business case for the open position and walked it through the approval chain personally.', a:2, x:'Representing: getting the team the resources it needs.' },
    { s:'Asked the Engagement Consultant what other units were doing about the same staffing gap.', a:0, x:'Networking, and a little external monitoring: using a relationship outside the team to learn what is coming.' }
  ]}
};
function buildDrill(el){
  var name = el.getAttribute('data-drill'), d = DRILLS[name]; if(!d) return;
  var status = $('#' + name + 'Status'), done = {}, cur = 0, right = 0;
  el.innerHTML = d.items.map(function(it, i){
    return '<div class="dq' + (i === 0 ? ' cur' : '') + '" data-i="' + i + '"><p class="dq-s"><b>' + (i + 1) + ' of ' + d.items.length + '</b>' + esc(it.s) + '</p><div class="dq-opts" role="group" aria-label="Choose one">' +
      d.opts.map(function(o, oi){ return '<button type="button" data-o="' + oi + '" aria-pressed="false">' + esc(o) + '</button>'; }).join('') +
      '</div><p class="dq-x" role="status"></p><div class="dq-nav">' + (i < d.items.length - 1 ? '<button type="button" class="btn btn-primary btn-sm" data-next="1">Next situation<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' : '') + '</div></div>';
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
    q.querySelector('.dq-x').innerHTML = '<b>' + (ok ? 'Right. ' : 'Not quite. The answer is ' + esc(d.opts[it.a]) + '. ') + '</b>' + esc(it.x);
    done[i] = ok ? 1 : 2; if(ok) right++;
    var n = Object.keys(done).length;
    if(status) status.innerHTML = pips() + '<span>' + n + ' of ' + d.items.length + ' ' + d.verb + '.' + (n === d.items.length ? ' ' + right + ' of ' + d.items.length + ' right. Section complete.' : '') + '</span>';
    if(n === d.items.length) progDone(d.prog);
  });
  if(status) status.innerHTML = pips() + '<span>0 of ' + d.items.length + ' ' + d.verb + '.</span>';
}
$$('[data-drill]').forEach(buildDrill);

/* ══════════ segment 6: self-rating, one behavior at a time → module order ══════════ */
var ASSESS_QS = [
  { c:'task', b:'Planning', q:'I set priorities, owners, and schedules before the work starts.' },
  { c:'task', b:'Clarifying', q:'Each person on my team can say what they own, by when, and what done well means.' },
  { c:'task', b:'Monitoring', q:'I check progress and quality before the deadline, in the 1:1, not after.' },
  { c:'task', b:'Problem solving', q:'When something breaks twice, I find the cause and change something, rather than fixing it again myself.' },
  { c:'relations', b:'Supporting', q:'I listen when someone is under pressure, adjust what I can, and follow up.' },
  { c:'relations', b:'Developing', q:'I have a growth conversation with each person at least once a quarter.' },
  { c:'relations', b:'Recognizing', q:'I praise specific work, by name, within the week it happened.' },
  { c:'relations', b:'Empowering', q:'I delegate real decisions, and I consult the team before I set a new process.' },
  { c:'change', b:'Advocating change', q:'When a change is coming, I explain the why in my own words before the announcement does.' },
  { c:'change', b:'Envisioning change', q:'I can describe, in two sentences, what my team will be able to do next year that it cannot do now.' },
  { c:'change', b:'Encouraging innovation', q:'When someone suggests a different way, I let them try it.' },
  { c:'change', b:'Facilitating collective learning', q:'We debrief after significant work and write down what changes.' },
  { c:'external', b:'Networking', q:'I know the people outside my team that my team depends on, by name, before I need them.' },
  { c:'external', b:'External monitoring', q:'I see policy changes, cycles, and other units’ plans before they land on my team.' },
  { c:'external', b:'Representing', q:'I speak up for my team’s workload and resources, with numbers, early.' }
];
var CATS = { task:{ name:'Task-oriented', short:'Task' }, relations:{ name:'Relations-oriented', short:'Relations' }, change:{ name:'Change-oriented', short:'Change' }, external:{ name:'External', short:'External' } };
/* which micro-module tracks practice each category, for the dashboard order */
var CAT_TRACKS = { task:['T1','T3'], relations:['T2','T3'], change:['T4'], external:['T4'] };
var ASSESS_OPTS = ['Rarely', 'Sometimes', 'Often'];
var assessAns = new Array(ASSESS_QS.length).fill(null), aCur = 0;
var aQs = $('#assessQs'), aNav = $('#assessNav'), aShow = $('#assessShow'), aHint = $('#assessHint'), aOut = $('#assessOut');
function assessRender(){
  if(!aQs) return;
  aQs.hidden = false; if(aNav) aNav.hidden = false;
  aQs.innerHTML = ASSESS_QS.map(function(x, i){
    return '<div class="route-q' + (i === aCur ? ' cur' : '') + '" data-rq="' + i + '"><p class="route-qt" id="aq' + i + '"><span class="qn" aria-hidden="true">' + (i + 1) + ' of ' + ASSESS_QS.length + ' &middot; ' + esc(CATS[x.c].short) + '</span><br><b style="color:var(--eyebrow);font-weight:600">' + esc(x.b) + '.</b> ' + esc(x.q) + '</p>' +
      '<div class="route-opts" role="group" aria-labelledby="aq' + i + '">' + ASSESS_OPTS.map(function(o, v){ return '<button type="button" data-rv="' + v + '" aria-pressed="' + (assessAns[i] === v) + '">' + o + '</button>'; }).join('') + '</div></div>';
  }).join('');
  assessSync();
  if(aOut) aOut.innerHTML = '';
}
function assessGo(i){ if(i < 0 || i >= ASSESS_QS.length) return; aCur = i; $$('.route-q', aQs).forEach(function(q, qi){ q.classList.toggle('cur', qi === i); }); assessSync(); }
function assessSync(){
  var n = assessAns.filter(function(v){ return v !== null; }).length, all = n === ASSESS_QS.length;
  if(aShow) aShow.disabled = !all;
  if(aHint) aHint.textContent = all ? 'All fifteen rated.' : n + ' of ' + ASSESS_QS.length + ' rated.';
  if(aNav) aNav.innerHTML = '<button type="button" class="btn btn-ghost btn-sm" data-an="-1"' + (aCur === 0 ? ' disabled' : '') + '>Back</button>' +
    '<span class="pips" aria-hidden="true">' + ASSESS_QS.map(function(x, i){ return '<i class="' + (assessAns[i] !== null ? 'ok' : '') + (i === aCur ? ' cur' : '') + '"></i>'; }).join('') + '</span>' +
    '<button type="button" class="btn btn-ghost btn-sm" data-an="1"' + (aCur === ASSESS_QS.length - 1 ? ' disabled' : '') + '>Next</button>';
}
if(aNav) aNav.addEventListener('click', function(e){ var b = e.target.closest('button[data-an]'); if(b) assessGo(aCur + parseInt(b.getAttribute('data-an'), 10)); });
if(aQs) aQs.addEventListener('click', function(e){
  var b = e.target.closest('button[data-rv]'); if(!b) return;
  var q = b.closest('.route-q'), i = parseInt(q.getAttribute('data-rq'), 10);
  assessAns[i] = parseInt(b.getAttribute('data-rv'), 10);
  $$('button[data-rv]', q).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  assessSync();
  var next = -1; for(var k = 1; k <= ASSESS_QS.length; k++){ var j = (i + k) % ASSESS_QS.length; if(assessAns[j] === null){ next = j; break; } }
  if(next > -1) window.setTimeout(function(){ assessGo(next); }, reduce ? 0 : 220);
  else if(aShow){ aShow.focus(); }
});
function assessProfile(){
  var cat = {}, max = {};
  ASSESS_QS.forEach(function(x, i){ cat[x.c] = (cat[x.c] || 0) + (assessAns[i] || 0); max[x.c] = (max[x.c] || 0) + 2; });
  var keys = Object.keys(CATS);
  var pct = {}; keys.forEach(function(k){ pct[k] = Math.round(cat[k] / max[k] * 100); });
  var weakest = keys.slice().sort(function(a, b){ return pct[a] - pct[b]; })[0];
  var strongest = keys.slice().sort(function(a, b){ return pct[b] - pct[a]; })[0];
  var focus = ASSESS_QS.map(function(x, i){ return { b:x.b, c:x.c, v:assessAns[i] }; })
    .sort(function(p, q){ return (p.v - q.v) || (pct[p.c] - pct[q.c]); }).slice(0, 3);
  var tscore = {};
  Object.keys(CAT_TRACKS).forEach(function(c){ CAT_TRACKS[c].forEach(function(t){ tscore[t] = tscore[t] || []; tscore[t].push(pct[c]); }); });
  Object.keys(tscore).forEach(function(t){ tscore[t] = tscore[t].reduce(function(a, b){ return a + b; }, 0) / tscore[t].length; });
  var order = [];
  if(P){
    [1, 2].forEach(function(phase){
      P.mrc.tracks.filter(function(t){ return t.phase === phase; }).sort(function(a, b){ return tscore[a.id] - tscore[b.id]; })
        .forEach(function(t){ t.modules.forEach(function(m){ order.push(m.id); }); });
    });
  }
  return { pct:pct, weakest:weakest, strongest:strongest, focus:focus, order:order };
}
function assessShowOut(){
  var r = assessProfile(); if(!aOut) return;
  var keys = Object.keys(CATS);
  var html = '<h4>Your first <em>profile</em>.</h4>' +
    '<div class="prof" role="list" aria-label="Your profile by category">' + keys.map(function(k){
      return '<div role="listitem"><b>' + esc(CATS[k].name) + '</b><span class="bar" aria-hidden="true"><i style="width:' + r.pct[k] + '%"></i></span><span>' + r.pct[k] + '%</span></div>';
    }).join('') + '</div>' +
    '<p class="gap-line">Your strongest category is <b>' + esc(CATS[r.strongest].name) + '</b>. The category the job needs more of from you is <b>' + esc(CATS[r.weakest].name) + '</b>. That is not a verdict; it is the behaviors you do less often than the role needs, and behaviors change.</p>' +
    '<p class="mono" style="margin-top:14px">Practice these first</p><ol class="focus-list">' + r.focus.map(function(f, i){
      return '<li><b>' + (i + 1) + '</b><span>' + esc(f.b) + '<small>' + esc(CATS[f.c].name) + ' &middot; you rated it ' + esc(ASSESS_OPTS[f.v].toLowerCase()) + '</small></span></li>';
    }).join('') + '</ol>' +
    '<p class="hinttxt" style="margin-top:12px">Saved to this browser and your Oracle record. Your dashboard orders the micro modules from this profile, weakest category first inside each window. The Managerial Practices Survey will give you the same profile with more precision.</p>' +
    '<div class="route-act" style="margin-top:12px"><button type="button" class="btn btn-ghost btn-sm" id="assessRedo">Rate again</button></div>';
  aOut.innerHTML = html;
  if(aQs) aQs.hidden = true; if(aNav) aNav.hidden = true;
  if(aShow) aShow.disabled = true; if(aHint) aHint.textContent = 'Your profile is below.';
  set('assess', JSON.stringify({ answers:assessAns, pct:r.pct, weakest:r.weakest, focus:r.focus.map(function(f){ return f.b; }), order:r.order, at:new Date().toISOString() }));
  try{ localStorage.setItem('mv.foundation.v1', get('assess')); }catch(e){}
  var ns = $('#ns2p'); if(ns) ns.textContent = 'Your self-rating pointed to ' + r.focus[0].b.toLowerCase() + '. Do it once this week, on purpose, and notice what happened.';
  progDone('survey');
  var redo = $('#assessRedo'); if(redo) redo.addEventListener('click', function(){ assessAns = new Array(ASSESS_QS.length).fill(null); aCur = 0; set('assess', null); assessRender(); var f = aQs.querySelector('.route-q.cur button'); if(f) f.focus(); });
  if(window.chartPager) window.chartPager.goToEl(aOut);
}
if(aShow) aShow.addEventListener('click', assessShowOut);
function assessLoad(){
  var raw = get('assess'); if(!raw) return;
  try{ var d = JSON.parse(raw); if(d && d.answers && d.answers.length === ASSESS_QS.length){ assessAns = d.answers.slice(); assessRender(); if(assessAns.every(function(v){ return v !== null; })) assessShowOut(); } }catch(e){}
}
assessRender();
assessLoad();

/* ══════════ knowledge check ══════════ */
(function(){
  var submit = $('#quizSubmit'), result = $('#quizResult'), prog = $('#quizProgress'), nudge = $('#quizNudge'), waitLine = $('#quizWait');
  var sets = $$('.qz[data-answer]'); if(!sets.length || !submit) return;
  var TOTAL = sets.length, PASS = 6;
  function goPage(el){ if(window.chartPager && el) window.chartPager.goToEl(el); }
  function answered(fs){ return fs.querySelector('input[type=radio]:checked'); }
  function updateProgress(){ var n = sets.filter(function(fs){ return !!answered(fs); }).length; if(prog) prog.textContent = n + ' of ' + TOTAL + ' answered'; if(n === TOTAL && nudge) nudge.classList.remove('show'); return n; }
  document.addEventListener('change', function(e){ if(e.target && e.target.closest && e.target.closest('.qz[data-answer]')) updateProgress(); });
  function setLocked(lock){ sets.forEach(function(fs){ $$('input[type=radio]', fs).forEach(function(r){ r.disabled = lock; }); }); }
  function tier(score){
    if(score === TOTAL) return ['Gold standard.', 'Perfect. The foundation held. Open your dashboard and start module one.'];
    if(score >= PASS) return ['Foundation complete.', 'Skim the explanations under the questions you missed, then go.'];
    return ['Almost there.', 'Six of eight completes the foundation. Reread the segment each missed question points to and retake the check; it takes four minutes.'];
  }
  submit.addEventListener('click', function(){
    var n = updateProgress();
    if(n < TOTAL){
      if(nudge) nudge.classList.add('show');
      var firstBlank = sets.filter(function(fs){ return !answered(fs); })[0];
      if(firstBlank){ goPage(firstBlank); var input = firstBlank.querySelector('input[type=radio]'); if(input) input.focus(); }
      return;
    }
    if(nudge) nudge.classList.remove('show');
    var score = 0;
    sets.forEach(function(fs){ var pick = answered(fs), ok = pick && pick.value === fs.getAttribute('data-answer'); fs.classList.add('graded'); fs.classList.toggle('correct', !!ok); fs.classList.toggle('wrong', !ok); if(ok) score++; });
    setLocked(true);
    if(score >= PASS) progDone('quiz');
    var t = tier(score);
    if(result){
      result.innerHTML = '<div class="big-score">' + score + ' / ' + TOTAL + '</div><h3>' + t[0] + '</h3><p>' + t[1] + '</p>' +
        '<button type="button" class="btn btn-ghost" id="quizRetake"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"/></svg>Retake the check</button>';
      result.classList.add('show');
      if(waitLine) waitLine.hidden = true;
      var retake = $('#quizRetake');
      if(retake) retake.addEventListener('click', function(){
        setLocked(false); if(waitLine) waitLine.hidden = false;
        sets.forEach(function(fs){ fs.classList.remove('graded','correct','wrong'); $$('input[type=radio]', fs).forEach(function(r){ r.checked = false; }); });
        result.classList.remove('show'); result.innerHTML = ''; updateProgress(); goPage(sets[0]);
      });
      goPage(result);
    }
  });
  updateProgress();
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

progRender();
})();
