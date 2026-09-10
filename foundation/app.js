/* ══════════ MANAGER VOYAGE · FOUNDATION · app engine ══════════
   Progress (eight tracked sections), the six segments' activities (flip
   cards, your call, quick check), the self-rating that
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
/* The window shows the video's own thumbnail before it is tapped, then the
   YouTube player is embedded in place (an iframe inside the course). If the
   player's API reports the video cannot be embedded or has gone away, the
   window turns into a plain card that opens the video on YouTube instead. */
var ytApiState = 0, ytApiQueue = [];
function ytApi(cb){
  if(window.YT && window.YT.Player){ cb(true); return; }
  ytApiQueue.push(cb);
  if(ytApiState) return;
  ytApiState = 1;
  var prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function(){ if(typeof prev === 'function') prev(); ytApiState = 2; ytApiQueue.splice(0).forEach(function(f){ f(true); }); };
  var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
  s.onerror = function(){ ytApiState = 3; ytApiQueue.splice(0).forEach(function(f){ f(false); }); };
  document.head.appendChild(s);
  window.setTimeout(function(){ if(ytApiState === 1){ ytApiState = 3; ytApiQueue.splice(0).forEach(function(f){ f(false); }); } }, 5000);
}
$$('.yt[data-embed]').forEach(function(box){
  var id = box.getAttribute('data-embed'), title = box.getAttribute('data-title') || 'Play video';
  var plain = title.replace(/&[a-z]+;/g, ''), watch = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
  var player = null;
  function facade(){
    if(player && player.destroy){ try{ player.destroy(); }catch(e){} } player = null;
    box.innerHTML = '<img class="yt-thumb" src="https://img.youtube.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg" alt="" aria-hidden="true">' +
      '<button type="button" class="yt-btn" aria-label="Play: ' + esc(plain) + '"><span class="yt-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg></span><span class="yt-t">' + title + '</span><span class="yt-sub mono">YouTube &middot; plays here when you tap</span></button>';
    var img = box.querySelector('.yt-thumb'); img.addEventListener('error', function(){ img.remove(); });
    box.querySelector('.yt-btn').addEventListener('click', load);
  }
  function unavailable(){
    if(player && player.destroy){ try{ player.destroy(); }catch(e){} } player = null;
    box.innerHTML = '<div class="yt-off"><p><b>This video cannot play inside the course</b> (its owner does not allow embedding, or it has moved).</p><a class="btn btn-gold btn-sm" href="' + watch + '" target="_blank" rel="noopener">Open it on YouTube</a></div>';
  }
  function iframeOnly(){
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
    f.title = plain;
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; web-share';
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    box.innerHTML = ''; box.appendChild(f);
  }
  function load(){
    narrStop();
    box.innerHTML = '<div class="yt-loading mono">Loading the player&hellip;</div>';
    ytApi(function(ok){
      if(!box.querySelector('.yt-loading')) return; /* page turned meanwhile */
      if(!ok){ iframeOnly(); return; }
      var host = document.createElement('div'); box.innerHTML = ''; box.appendChild(host);
      try{
        player = new YT.Player(host, {
          host: 'https://www.youtube-nocookie.com', videoId: id, width: '100%', height: '100%',
          playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: function(e){ try{ e.target.playVideo(); }catch(x){} var f = box.querySelector('iframe'); if(f){ f.title = plain; f.setAttribute('allowfullscreen', ''); } },
            onError: function(){ unavailable(); }
          }
        });
      }catch(e){ iframeOnly(); }
    });
  }
  facade();
  document.addEventListener('chart:page', function(){ if(box.querySelector('iframe') || box.querySelector('.yt-loading')) facade(); });
});

/* ══════════ PROGRESS ══════════ */
var SECTIONS = [
  { k:'shift',     no:'01', name:'What changed',                 how:'Sort the six situations' },
  { k:'safe',      no:'02', name:'Safe to speak up',             how:'Find the response that keeps people talking, three times' },
  { k:'calls',     no:'03', name:'Your first calls',             how:'Decide the five situations' },
  { k:'welcome',   no:'04', name:'The four jobs',                how:'Open all four jobs' },
  { k:'yourcall',  no:'05', name:'Your call: four situations',   how:'Find the Vanderbilt way in all four' },
  { k:'survey',    no:'06', name:'The survey and where you stand', how:'Rate yourself and see where you stand' },
  { k:'quiz',      no:'07', name:'A quick check',                how:'Score four or more of five' },
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
  if(window.MVOracle){
    var qs = get('quiz-score'), qm = get('quiz-max');
    MVOracle.reportCompletion('MRC-F', { score: qs === null ? undefined : +qs, max: qm === null ? undefined : +qm, passed: true, note: 'Foundation course complete: all eight sections', extra: { assess: (function(){ try{ return JSON.parse(get('assess') || 'null'); }catch(e){ return null; } })() } });
  } else if(window.MVScorm && MVScorm.connected) MVScorm.complete();
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
[{ map:'#fwMap', status:'#fwStatus', noun:'jobs', prog:'welcome', done:' Section complete. The next four pages take one job each.' },
 { map:'#yearMap', status:'#yearStatus', noun:'groups', prog:null, done:' All four open. Turn the page to make your first calls.' }].forEach(function(cfg){
  var map = $(cfg.map), status = $(cfg.status); if(!map) return;
  var cards = $$('.fw-card', map), seen = {};
  cards.forEach(function(c, i){
    c.addEventListener('click', function(){
      var open = c.getAttribute('aria-expanded') !== 'true';
      c.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open){ seen[i] = 1; var n = Object.keys(seen).length; if(status) status.textContent = n + ' of ' + cards.length + ' ' + cfg.noun + ' opened.' + (n === cards.length ? cfg.done : ''); if(n === cards.length && cfg.prog) progDone(cfg.prog); }
    });
  });
});
/* ══════════ your call: one scenario, three responses, consequences ══════════ */
var SCENARIOS = {
  safe1: { h:'Moment 1 · Bad news', s:'Jordan tells you on Tuesday that the vendor missed its deadline and the launch will slip a week. She looks braced for your reaction.', opts:[
    { t:'“Why am I only hearing about this now?”', b:'The reaction that ends early warnings', best:false, out:'A fair question and the wrong first sentence. Jordan learns that bad news gets a bad reaction. Next time you hear it later, or from someone else.' },
    { t:'“Thank you for telling me today. What do we know, and what do you need from me?”', b:'Safe to speak up', best:true, out:'Jordan relaxes and gives you the full picture, and the meeting goes to the fix. Thank first, solve second, learn the cause later. She will bring you the next one earlier.' },
    { t:'“Okay. Let me handle it from here.”', b:'Kind, and it takes the work away', best:false, out:'It sounds supportive, and it tells Jordan she cannot be trusted with the recovery. Ask what she needs and let her run it with your help.' }
  ]},
  safe2: { h:'Moment 2 · A question', s:'In the team meeting, your newest hire asks what sounds like a basic question about the intake process, in front of everyone.', opts:[
    { t:'“We covered that in onboarding. Check the document.”', b:'The last question they ask in public', best:false, out:'Accurate, and now the whole team knows what a question costs. The next gap stays hidden until it becomes a mistake.' },
    { t:'Answer it, then, with a smile, “Anyone else unclear on that one?”', b:'The laugh costs you the next question', best:false, out:'The answer was fine. The joke, however small, tells the room that questions are a little embarrassing. People stop asking, and you stop knowing.' },
    { t:'“Good question. Here is the short version, and let us make sure it is in the document.”', b:'Safe to ask', best:true, out:'The new hire got the answer, the room learned that asking is normal, and the document gets better. That is thirty seconds well spent.' }
  ]},
  safe3: { h:'Moment 3 · A mistake', s:'You discover that a team member sent the wrong file to another department. Nobody outside has noticed yet.', opts:[
    { t:'Fix it quietly yourself and say nothing.', b:'Nobody learns, and now you own it', best:false, out:'The problem goes away and the cause does not. They never learn what happened, you have taken on their work, and it will happen again.' },
    { t:'“Walk me through what happened. Let us fix it together, then figure out what would have caught it.”', b:'Safe to make a mistake once', best:true, out:'The file is corrected within the hour, the person keeps their dignity, and the check that would have caught it goes into the process. Mistakes reported early are cheap; hidden ones are not.' },
    { t:'Raise it in the team meeting as an example of what not to do.', b:'Public blame', best:false, out:'The team learns exactly one thing: never let the manager find out. The next mistake gets hidden.' }
  ]},
  task: { s:'It is Wednesday. The monthly report your team owns is due Friday. Priya, who builds it, has not mentioned it in two weeks, and you have not asked. A director just emailed you asking whether it will be on time.', opts:[
    { t:'Reply “yes” to the director, then build the report yourself Thursday night to be sure.', b:'Doing the work instead of managing it', best:false, out:'The report ships. You are now the person who builds it, Priya does not know she was doubted, and next month you are in the same spot. Doing the work is not the job; checking it is.' },
    { t:'Reply “I will confirm today,” then ask Priya in a fifteen-minute check-in where the report stands and what she needs.', b:'Check it, then say it', best:true, out:'Priya is two-thirds done and waiting on a Finance extract nobody chased. You chase it, confirm Friday with the director, and put the monthly check-in on the calendar for the second week of every month so you never learn this on a Wednesday again.' },
    { t:'Forward the director’s email to Priya with “Please make sure this is on time.”', b:'The habit', best:false, out:'Priya reads it as blame from two levels up. The report may still ship, but you have clarified nothing (what does “on time” mean, what is blocking her) and you have spent trust. Checking work is a conversation, not a forwarded email.' }
  ]},
  relations: { s:'Marcus, one of your strongest people, stays after the 1:1 and says: “My dad has been in and out of the hospital. I might need some time off for it, I am not sure yet. I did not want you to think I was slacking.”', opts:[
    { t:'“I am so sorry. Take whatever you need. Just let me know what is going on with him so I can plan around it.”', b:'Listening and helping, but a step too far', best:false, out:'Warm, and it asks for a diagnosis, which you must never do. It also leaves a possible leave request sitting with you instead of with the leave office. The kindness is right; the routing is missing.' },
    { t:'“Thank you for telling me. Let us move the two deadlines you have this week. I am going to send your situation to the leave office today so the options are ready if you need them, and nothing you told me affects how I see your work.”', b:'Listen, help, and route it', best:true, out:'Marcus has what he needs: the load adjusted now, the leave process started without him having to ask twice, and no request for medical detail. Helping and a duty to route arrived in the same sentence; you handled both.' },
    { t:'“No problem at all. Let me know if it becomes an issue.”', b:'The habit', best:false, out:'Friendly, and nothing changed. The deadlines still stand, the leave request is not routed, and Marcus learns that telling you things does not help. Being pleasant is not helping.' }
  ]},
  change: { s:'Central is replacing the travel reimbursement system in six weeks. The announcement email goes out next Tuesday. Your team already hates the idea; two people have said “here we go again” in the hallway.', opts:[
    { t:'Wait for the announcement email and forward it with “FYI, let me know if you have questions.”', b:'The habit', best:false, out:'The team hears about it from central, not from you, and the hallway version wins. Forwarding is not explaining the why.' },
    { t:'In Thursday’s team meeting, before the email, explain in your own words why the change is happening and what it fixes, ask what worries them, and write the worries down to take back to central.', b:'Explain the why', best:true, out:'The team still does not love it, but they heard the why from you first, their objections went somewhere, and two of them volunteer to test the new system early. Small and weekly is how uncommon agility actually happens.' },
    { t:'Tell the team you also think it is a bad idea, but there is nothing anyone can do.', b:'The opposite of explaining the why', best:false, out:'It feels honest and it costs the team its manager. You have joined the hallway instead of leading it, and nobody’s concerns will reach the people who could act on them.' }
  ]},
  external: { s:'A director in another unit emails you Monday: “We need your team to pull a full data reconciliation by Friday for our audit prep.” Your team’s own month-end close is the same week. Doing both is not possible without weekend work.', opts:[
    { t:'Say yes and ask the team to work the weekend. Better not to upset a director.', b:'The habit', best:false, out:'The audit prep ships, the team works the weekend, and next quarter the same director asks again, sooner, because it worked. Absorbing every request is what speaking up replaces.' },
    { t:'Reply the same day with the numbers: the hours the reconciliation takes, the month-end close it collides with, and two options, a partial pull by Friday with the rest the following Wednesday, or the full pull with the close pushed, and ask which the audit actually needs.', b:'Speak up for your team', best:true, out:'The director needed three of the seven tables by Friday and did not know the close was that week. You deliver three tables Thursday, the rest Wednesday, no weekend. The team saw you defend their month, politely and early.' },
    { t:'Reply “We cannot do this” and copy your unit leader.', b:'Not speaking up, just escalating', best:false, out:'Your unit leader now owns a negotiation you could have had in one email, and the director hears “no” with no reason and no option. Speaking up for your team means the numbers and the options, not just a refusal.' }
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
      (n < sc.opts.length ? '<p class="scn-again hinttxt">' + (o.best ? 'See what the other responses would have cost. ' : 'Now pick the response a Vanderbilt manager would give. ') + n + ' of ' + sc.opts.length + ' tried.</p>' : '<p class="scn-again hinttxt">All three tried.</p>');
    out.classList.add('show');
  });
}
$$('[data-scn]').forEach(buildScenario);
/* a stepper of scenarios, one at a time; done when the best response is found in each */
var CALL_SETS = { safe:['safe1','safe2','safe3'], jobs:['task','relations','change','external'] };
var CALL_HEADS = { task:'Job 1 · Get the work done', relations:'Job 2 · Take care of your people', change:'Job 3 · Make things better', external:'Job 4 · Connect your team' };
var CALL_PROG = { safe:{ prog:'safe', noun:'moments', status:'#safeStatus' }, jobs:{ prog:'yourcall', noun:'situations', status:'#jobsStatus' } };
function buildCalls(el){
  var name = el.getAttribute('data-calls'), keys = CALL_SETS[name]; if(!keys) return;
  var cfg = CALL_PROG[name], status = $(cfg.status), found = {}, cur = 0;
  el.innerHTML = keys.map(function(k, i){
    var sc = SCENARIOS[k];
    return '<div class="cq' + (i === 0 ? ' cur' : '') + '" data-k="' + k + '"><p class="cq-h">' + (i + 1) + ' of ' + keys.length + ' &middot; ' + esc(sc.h || CALL_HEADS[k] || '') + '</p><div class="scn" data-scn="' + k + '"></div><div class="cq-nav">' +
      (i < keys.length - 1 ? '<button type="button" class="btn btn-primary btn-sm" data-next="1" hidden>Next situation<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' : '') +
      (i > 0 ? '<button type="button" class="btn btn-ghost btn-sm" data-prev="1">Back</button>' : '') + '</div></div>';
  }).join('');
  $$('.scn[data-scn]', el).forEach(buildScenario);
  function pips(){ return '<span class="pips" aria-hidden="true">' + keys.map(function(k){ return '<i class="' + (found[k] ? 'ok' : '') + '"></i>'; }).join('') + '</span>'; }
  function paint(){ var n = Object.keys(found).length; if(status) status.innerHTML = pips() + '<span>' + n + ' of ' + keys.length + ' ' + cfg.noun + '.' + (n === keys.length ? ' Section complete.' : '') + '</span>'; if(n === keys.length) progDone(cfg.prog); }
  function show(i){ $$('.cq', el).forEach(function(q, qi){ q.classList.toggle('cur', qi === i); }); cur = i; var f = $$('.cq', el)[i].querySelector('button:not([hidden])'); if(f) f.focus({ preventScroll:true }); }
  el.addEventListener('click', function(e){
    if(e.target.closest('button[data-next]')){ show(cur + 1); return; }
    if(e.target.closest('button[data-prev]')){ show(cur - 1); return; }
    var b = e.target.closest('.scn button[data-o]'); if(!b) return;
    var q = b.closest('.cq'), k = q.getAttribute('data-k'), o = SCENARIOS[k].opts[parseInt(b.getAttribute('data-o'), 10)];
    var nx = q.querySelector('button[data-next]'); if(nx) nx.hidden = false;
    if(o.best){ found[k] = 1; paint(); }
  });
  paint();
}
$$('[data-calls]').forEach(buildCalls);

/* ══════════ quick check: which habit is it, one situation at a time ══════════ */
var DRILLS = {
  shift: { opts:['Mine now','My team member’s','PCB, or another office'], prog:'shift', verb:'sorted', items:[
    { s:'Deciding which of three new requests the team does first this week.', a:0, x:'Yours now. Priorities are the manager’s call; if you do not make it, the loudest request will.' },
    { s:'Writing the monthly report your best analyst has always written.', a:1, x:'Still theirs. Your job is to check it before it is due, not to write it. Doing the work is the old job.' },
    { s:'Deciding whether someone qualifies for medical leave.', a:2, x:'The leave office decides. Your job is to send it there the same day, and never to ask for a diagnosis.' },
    { s:'Making sure a new hire knows what is expected in their first month.', a:0, x:'Yours now. Nobody else will say it, and “clear is kind.” The Onboarding a New Hire micro module shows you how.' },
    { s:'Investigating a complaint that a coworker is harassing someone.', a:2, x:'Equal Opportunity and Access investigates. Your job is to report it the same day, not to look into it yourself.' },
    { s:'Approving a timecard that shows 52 hours in one week.', a:0, x:'Yours now. Ask about the week before you approve; Vanderbilt trusts your signature, so look before you sign.' }
  ]},
  calls: { opts:['Handle it','Ask my PCB partner first','The leave office, the same day','EOA, the same day'], prog:'calls', verb:'decided', items:[
    { s:'A team member asks for next Friday off for a wedding.', a:0, x:'Handle it. Check coverage, approve it in Oracle, and say yes out loud. The Time and Attendance Approvals micro module shows the steps.' },
    { s:'A team member says their doctor wants them out for three weeks after surgery.', a:2, x:'The leave office, the same day. It sounds like leave, so it is leave until the leave office says otherwise. Adjust the work; do not ask about the surgery.' },
    { s:'A team member says a coworker keeps making comments about her religion.', a:3, x:'EOA, the same day. You listen, you write down what was said, and you report it. You do not investigate or promise an outcome.' },
    { s:'You want to raise someone’s pay because they took on more work.', a:1, x:'Ask your PCB partner first. Pay has a process and a cycle (the Compensation Cycle and Merit Basics micro module); your PCB partner tells you what is possible and when.' },
    { s:'A seat on your team just opened and you want to fill it.', a:1, x:'Ask your PCB partner first. Hiring starts with a requisition and an approval chain (the Requisitions and Hiring micro module).' },
    { s:'A team member’s work has slipped for a month and a talk did not fix it.', a:1, x:'Ask your PCB partner first. A performance concern has a fair process (Performance Concerns and Progressive Discipline); do not improvise it.' }
  ]},
  task: { opts:['Plan it','Say it','Check it','Fix it','Not managing, just doing the work'], prog:'task', verb:'named', items:[
    { s:'Before the quarter, set three priorities, assigned an owner to each, and decided what would move if a new request landed.', a:0, x:'Plan it: what, who, when, and what gives. Done before the quarter, not during it.' },
    { s:'In the first 1:1 of the month, confirmed with each person what they own, the deadline, and what “done well” means, and wrote it in Culture Amp.', a:1, x:'Say it: said out loud, confirmed back, written where the team can see it.' },
    { s:'Looked at the half-finished slide deck in the weekly 1:1 rather than the finished one on the due date.', a:2, x:'Check it: the work looked at before the deadline, while there is still time to steer.' },
    { s:'Stayed late to rebuild the report personally after the process broke for the second time this month.', a:4, x:'Doing the work is not managing it. Finding out why the process breaks and changing something would be fix it.' },
    { s:'After the second failure, traced it to a handoff nobody owned, assigned the handoff, and told the team.', a:3, x:'Fix it: cause found, decision made, team told.' },
    { s:'Approved the team’s timecards on Thursday and asked one person about a 52-hour week before approving it.', a:2, x:'Check it. Approvals in Oracle are a way of checking work; the question before the approval is what makes it management.' }
  ]},
  relations: { opts:['Listen and help','Grow them','Thank them','Trust them','Route it'], prog:'relations', verb:'named', items:[
    { s:'Told a direct report, “The way you handled the vendor call on Thursday kept us on schedule,” on Friday.', a:2, x:'Thank them: specific, by name, that week.' },
    { s:'Handed over the decision about the new intake process, not only the task, and set the one boundary it had to respect.', a:3, x:'Trust them: a real decision handed over, with the boundary stated.' },
    { s:'Asked each person in the quarterly 1:1 what they want to be doing in two years, and found one stretch assignment to match.', a:1, x:'Grow them: a real conversation about what is next, without a form in front of you.' },
    { s:'A team member said they are buried since two colleagues left. The manager listened, moved two deadlines, and checked in on Monday.', a:0, x:'Listen and help: the load moved, the follow-up kept. Nothing here needs routing; a leave, health, or fairness mention would.' },
    { s:'A team member said a colleague keeps commenting on their accent. The manager documented it and called Equal Opportunity and Access the same day.', a:4, x:'Route it. Listening still matters, but a possible discrimination report is a duty, not a habit. You do not investigate; you report it to Equal Opportunity and Access the same day.' },
    { s:'Before setting the new on-call rotation, asked the team how they would design it, and used most of their design.', a:3, x:'Trust them: ask before you decide, and let the answer change the decision.' }
  ]},
  change: { opts:['Explain the why','Describe where we are going','Let people try','Look back','A different job'], prog:'change', verb:'named', items:[
    { s:'Explained the reason for the new travel system in the team meeting, in their own words, two days before the campus-wide email.', a:0, x:'Explain the why: in your own words, before the announcement, with objections taken seriously.' },
    { s:'Ran a ten-minute debrief after the orientation event and wrote the three changes for next year into the Portal template.', a:3, x:'Look back: what worked, what did not, what changes, written down.' },
    { s:'Told a team member who suggested a new way to run the weekly report, “Try it for two weeks and show me.”', a:2, x:'Let people try: the idea invited and allowed to be tried, small and soon.' },
    { s:'Described to the team, in two sentences, what they will be able to do next year that they cannot do now, and how it connects to the Chancellor’s vision.', a:1, x:'Describe where we are going: a clear picture of next year and why it matters.' },
    { s:'Approved a flexible work request after checking the policy and the equity across the team.', a:4, x:'A different job. That is getting the work done and taking care of people (a decision with a process, and trust). Making things better is about the team getting better at what it does.' },
    { s:'Shared the checklist one person built with the whole team and made it the standard.', a:3, x:'Look back: what one person learned becomes the team’s.' }
  ]},
  external: { opts:['Know the people','Watch for what is coming','Speak up for the team','A different job'], prog:'external', verb:'named', items:[
    { s:'Had coffee with a peer manager in Finance in the first month, before needing anything from Finance.', a:0, x:'Know the people: the relationship built before it is needed.' },
    { s:'Read the compensation cycle calendar in August and told the team in September what to expect in October.', a:1, x:'Watch for what is coming: seen before it lands.' },
    { s:'When another unit asked for a report that would take a week the team did not have, showed the numbers and negotiated a two-week deadline.', a:2, x:'Speak up for the team: the workload defended with numbers, politely and early.' },
    { s:'Ran the weekly 1:1 and checked the progress on each person’s goals.', a:3, x:'A different job. Checking work is job one, get the work done. Job four faces outside the team.' },
    { s:'Wrote the business case for the open position and walked it through the approval chain personally.', a:2, x:'Speak up for the team: getting it the resources it needs.' },
    { s:'Asked the Engagement Consultant what other units were doing about the same staffing gap.', a:0, x:'Know the people, and a little watching for what is coming: using a relationship outside the team to learn what is next.' }
  ]}
};
var DRILL_PICK = { shift:[0,1,2,3,4,5], calls:[0,1,2,3,4], task:[1,3,4], relations:[0,4,3], change:[0,4,2], external:[1,3,2] };
function buildDrill(el){
  var name = el.getAttribute('data-drill'), d0 = DRILLS[name]; if(!d0) return;
  var d = { opts:d0.opts, prog:d0.prog, verb:d0.verb, items:(DRILL_PICK[name] || [0,1,2]).map(function(i){ return d0.items[i]; }) };
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

/* ══════════ five ideas, one at a time ══════════ */
var IDEAS = [
  { who:'Stephen Covey · The 7 Habits of Highly Effective People', h:'Put first things <em>first</em>.',
    plain:'Covey’s picture is a jar. Fill it with sand first (email, small requests, interruptions) and the big rocks never fit. Put the big rocks in first and the sand settles around them. For a manager, the big rocks are the few things that matter most this week: the deadline the team is working toward, the 1:1 you owe someone, the decision that is holding people up. His companion habit is “seek first to understand, then to be understood”: in every hard conversation, listen and repeat back before you answer.',
    why:'Your calendar will fill itself. Requests arrive faster than you can finish them, and the urgent ones are rarely the important ones. Nobody sets your priorities for you now; that is the part of the job that changed.',
    tue:'Monday morning, before you open email, you write down the three things that matter this week and put them on the calendar. The small stuff fits around them, not the other way round.',
    week:'Write your three big rocks before you open your inbox, and tell your team what they are.' },
  { who:'Brené Brown · Dare to Lead', h:'Clear is kind. Unclear is <em>unkind</em>.',
    plain:'Brown spent twenty years studying courage at work and found that most managers avoid saying the hard thing to be nice. It has the opposite effect. When you hint instead of say, people spend weeks guessing what you meant, the problem grows, and the eventual conversation is worse. Being clear about what you expect, when it is due, and what you noticed is the kind thing, even when it is uncomfortable.',
    why:'This is where new managers most often slip. You will be tempted to soften an expectation, delay feedback, or hope a problem fixes itself. Each of those feels polite and costs the other person.',
    tue:'In a 1:1 you say, “The report needs the summary on page one, by Thursday, and here is why.” Not, “Maybe take another look when you get a chance.”',
    week:'Say one thing you have been hinting at. Privately, plainly, kindly.' },
  { who:'Amy Edmondson · The Fearless Organization', h:'People only speak up when it is <em>safe</em> to.',
    plain:'Edmondson, a Harvard professor, studied hospital teams and found something surprising: the best teams reported more mistakes, not fewer. They were not making more; they felt safe enough to say so, and so they fixed them early. She called it psychological safety: the belief that you will not be punished or embarrassed for asking, admitting, or disagreeing. It is not about being nice or lowering the bar. It is about making the truth cheap to tell.',
    why:'If your team does not feel safe telling you things, you find out late, and late is expensive. Your reaction the first time someone brings you bad news decides whether there is a second time.',
    tue:'Someone tells you the vendor missed a deadline. Before anything else you say, “Thank you for telling me today. What do you need?”',
    week:'When someone reports a problem, thank them first, then solve it. Never in front of the team.' },
  { who:'Simon Sinek · Start With Why, Leaders Eat Last', h:'Explain the why. Take care of the people, and they take care of the <em>work</em>.',
    plain:'Sinek makes two points. First, people do their best work when they know why it matters, not just what to do, so say the why before the what, every time. Second, in the Marines the officers eat last: the leader’s job is to make the people feel safe and looked after, and a team that feels looked after protects the work and each other. He calls that the circle of safety.',
    why:'A new manager tends to hand out tasks and keep the reasons. And when it gets tight, the temptation is to protect yourself first. Both cost you the team.',
    tue:'Before you ask for a report, you say what it is for and who reads it. When the weekend request comes from another office, you push back for the team before you say yes.',
    week:'Explain the why behind one thing you have been asking for.' },
  { who:'SHRM · the Society for Human Resource Management', h:'The people work is the manager’s <em>work</em>.',
    plain:'SHRM is the largest professional body for HR (at Vanderbilt, HR is People, Culture and Belonging, PCB). Its guidance for people managers is consistent on one point: the everyday people work is done by the manager, not by HR. Hiring, onboarding, setting expectations, giving feedback, managing performance, handling time and leave, and having hard conversations are yours. PCB shows you how, tells you when a process applies, and steps in when something must be reported or investigated.',
    why:'New managers often assume PCB will handle the people side. It will not; it will help you do it. Knowing that on day one saves you a month of waiting for someone else to act.',
    tue:'You run the 1:1, you give the feedback, you start the leave request the same day, and you call your PCB partner when you are unsure.',
    week:'Find out your PCB partner’s name and how to reach them.' }
];
(function(){
  var box = $('#ideasBox'), status = $('#ideasStatus'); if(!box) return;
  var cur = 0, seen = { 0:1 };
  var names = ['Covey', 'Brené Brown', 'Edmondson', 'Sinek', 'SHRM'];
  box.innerHTML = '<div class="idea-tabs" role="tablist" aria-label="The five ideas">' + IDEAS.map(function(it, i){ return '<button type="button" role="tab" aria-selected="' + (i === 0) + '" data-tab="' + i + '">' + (i + 1) + ' · ' + names[i] + '</button>'; }).join('') + '</div>' +
    IDEAS.map(function(it, i){
      return '<div class="idea' + (i === 0 ? ' cur' : '') + '" role="tabpanel" data-i="' + i + '"><div><span class="who-is">' + esc(it.who) + '</span><h3>' + it.h + '</h3><p><b>In plain words</b>' + esc(it.plain) + '</p><p><b>Why it matters to a new manager</b>' + esc(it.why) + '</p></div>' +
        '<div class="side"><div class="tue"><b>On a Tuesday</b>' + esc(it.tue) + '</div><div class="week"><b>Start this week</b>' + esc(it.week) + '</div></div>' +
        '<div class="idea-nav">' + (i > 0 ? '<button type="button" class="btn btn-ghost btn-sm" data-prev="1">Back</button>' : '') + (i < IDEAS.length - 1 ? '<button type="button" class="btn btn-primary btn-sm" data-next="1">Next idea<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' : '<span class="hinttxt">All five read. Turn the page to practice the third one.</span>') + '</div></div>';
    }).join('');
  function show(i){
    cur = i; seen[i] = 1;
    $$('.idea', box).forEach(function(p, pi){ p.classList.toggle('cur', pi === i); });
    $$('.idea-tabs button', box).forEach(function(t, ti){ t.setAttribute('aria-selected', ti === i ? 'true' : 'false'); t.classList.toggle('seen', !!seen[ti]); });
    var n = Object.keys(seen).length; if(status) status.textContent = n + ' of 5 ideas.' + (n === 5 ? ' Pick the one you will try first.' : '');
    if(window.chartPager && window.chartPager.current().key === 'ideas'){ var f = $$('.idea', box)[i].querySelector('.idea-nav button'); if(f) f.focus({ preventScroll:true }); }
  }
  box.addEventListener('click', function(e){
    var t = e.target.closest('button[data-tab]'); if(t){ show(parseInt(t.getAttribute('data-tab'), 10)); return; }
    if(e.target.closest('button[data-next]')){ show(Math.min(cur + 1, IDEAS.length - 1)); return; }
    if(e.target.closest('button[data-prev]')){ show(Math.max(cur - 1, 0)); }
  });
})();

/* ══════════ segment 6: self-rating, one behavior at a time → module order ══════════ */
var ASSESS_QS = [
  { c:'task', b:'Plan it', q:'I set priorities, owners, and schedules before the work starts.' },
  { c:'task', b:'Say it', q:'Each person on my team can say what they own, by when, and what good looks like.' },
  { c:'task', b:'Check it', q:'I check progress and quality before the deadline, in the 1:1, not after.' },
  { c:'task', b:'Fix it', q:'When something breaks twice, I find the cause and change something, rather than fixing it again myself.' },
  { c:'relations', b:'Listen and help', q:'I listen when someone is under pressure, adjust what I can, and follow up.' },
  { c:'relations', b:'Grow them', q:'I talk with each person about where they want to go at least once a quarter.' },
  { c:'relations', b:'Thank them', q:'I praise specific work, by name, within the week it happened.' },
  { c:'relations', b:'Trust them', q:'I delegate real decisions, and I consult the team before I set a new process.' },
  { c:'change', b:'Explain the why', q:'When a change is coming, I explain the why in my own words before the announcement does.' },
  { c:'change', b:'Describe where we are going', q:'I can describe, in two sentences, what my team will be able to do next year that it cannot do now.' },
  { c:'change', b:'Let people try', q:'When someone suggests a different way, I let them try it.' },
  { c:'change', b:'Look back', q:'We look back after big work and write down what changes.' },
  { c:'external', b:'Know the people', q:'I know the people outside my team that my team depends on, by name, before I need them.' },
  { c:'external', b:'Watch for what is coming', q:'I see policy changes, deadlines, and other offices’ plans before they land on my team.' },
  { c:'external', b:'Speak up for your team', q:'I speak up for my team’s workload and resources, with numbers, early.' }
];
var CATS = { task:{ name:'Get the work done', short:'Job 1' }, relations:{ name:'Take care of your people', short:'Job 2' }, change:{ name:'Make things better', short:'Job 3' }, external:{ name:'Connect your team', short:'Job 4' } };
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
  var html = '<h4>Where you <em>stand</em>.</h4>' +
    '<div class="prof" role="list" aria-label="Your profile by category">' + keys.map(function(k){
      return '<div role="listitem"><b>' + esc(CATS[k].name) + '</b><span class="bar" aria-hidden="true"><i style="width:' + r.pct[k] + '%"></i></span><span>' + r.pct[k] + '%</span></div>';
    }).join('') + '</div>' +
    '<p class="gap-line">Your strongest job right now is <b>' + esc(CATS[r.strongest].name) + '</b>. The job that needs more of you is <b>' + esc(CATS[r.weakest].name) + '</b>. That is not a verdict; it is a set of habits you do less often than the team needs, and habits change.</p>' +
    '<p class="mono" style="margin-top:14px">Work on these first</p><ol class="focus-list">' + r.focus.map(function(f, i){
      return '<li><b>' + (i + 1) + '</b><span>' + esc(f.b) + '<small>' + esc(CATS[f.c].name) + ' &middot; you rated it ' + esc(ASSESS_OPTS[f.v].toLowerCase()) + '</small></span></li>';
    }).join('') + '</ol>' +
    '<p class="hinttxt" style="margin-top:12px">Saved to this browser and your Oracle record. Your dashboard puts the micro modules in this order, the job that needs you most first. The survey you took before this course gives the same picture with more precision, and the retake in six months shows the change.</p>' +
    '<div class="route-act" style="margin-top:12px"><button type="button" class="btn btn-ghost btn-sm" id="assessRedo">Rate again</button></div>';
  aOut.innerHTML = html;
  if(aQs) aQs.hidden = true; if(aNav) aNav.hidden = true;
  if(aShow) aShow.disabled = true; if(aHint) aHint.textContent = 'Your profile is below.';
  set('assess', JSON.stringify({ answers:assessAns, pct:r.pct, weakest:r.weakest, focus:r.focus.map(function(f){ return f.b; }), order:r.order, at:new Date().toISOString() }));
  try{ localStorage.setItem('mv.foundation.v1', get('assess')); }catch(e){}
  var ns = $('#ns2p'); if(ns) ns.textContent = 'Your self-rating pointed to: ' + r.focus[0].b.toLowerCase() + '. Do it once this week, on purpose, and notice what happened.';
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

/* ══════════ knowledge check: five questions, one at a time, feedback after each ══════════ */
var QUIZ = [
  { seg:'What changed (page 3)', q:'You became a manager. What is your job now?', opts:['My own work, done faster','The team’s work, and the people who do it','Whatever my own manager did','Approving things'], a:1, x:'The team’s work and the people who do it. You decide, you approve, and you are responsible for people. Doing everyone’s work is the old job.' },
  { seg:'Five ideas (page 5)', q:'Brené Brown’s rule for managers is:', opts:['Praise in public, correct in private','Clear is kind, unclear is unkind','Never give bad news on a Friday','Hint first, so it lands softly'], a:1, x:'Clear is kind. Say the expectation, the deadline, and the feedback plainly and early. Hinting feels polite and leaves people guessing.' },
  { seg:'Safe to speak up (page 6)', q:'A team member brings you bad news early. Which response keeps the bad news coming early?', opts:['“Why am I only hearing about this now?”','“Thank you for telling me today. What do you need from me?”','“Let me handle it from here.”','“Bring it to the team meeting.”'], a:1, x:'Thank first, solve second, learn the cause later. Your reaction the first time decides whether you hear the next one early.' },
  { seg:'Your first calls (page 8)', q:'A team member says their doctor wants them out for three weeks after surgery. What do you do first?', opts:['Approve the time off yourself','Ask what the surgery is for, so you can plan','Send it to the leave office the same day','Tell them to talk to PCB when they are back'], a:2, x:'The leave office, the same day. Anything that sounds like leave goes there; you adjust the work and never ask for a diagnosis.' },
  { seg:'The four jobs (page 9)', q:'One simple way to keep the whole manager job in view is four jobs. Which list is right?', opts:['Hire, fire, approve, report','Get the work done; take care of your people; make things better; connect your team','Plan, budget, schedule, present','Whatever your own manager did'], a:1, x:'Get the work done, take care of your people, make things better, connect your team. Every manager does all four, every week.' }
];
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
    var t = score === QUIZ.length ? ['Gold standard.', 'Perfect. The foundation held. Turn the page for your next seven days.'] : score >= PASS ? ['Foundation complete.', 'Reread the explanation under the one you missed, then turn the page.'] : ['Almost there.', 'Four of five completes the foundation. Each missed question names the page to reread; then retake the check.'];
    done.innerHTML = '<div class="big-score">' + score + ' / ' + QUIZ.length + '</div><h3>' + t[0] + '</h3><p>' + t[1] + '</p><button type="button" class="btn btn-ghost btn-sm" id="quizRetake">Retake the check</button>';
    done.classList.add('show');
    $$('.kq', box).forEach(function(q){ q.classList.remove('cur'); });
    set('quiz-score', String(score)); set('quiz-max', String(QUIZ.length));
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

progRender();
})();
