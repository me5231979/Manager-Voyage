/* ══════════ MANAGER VOYAGE · FOUNDATION · app engine ══════════
   Progress (thirteen tracked activities), the six segments' activities (flip
   cards, your call, quick check), the assessment result entry that
   lists the micro modules, the knowledge check, page narration, the
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
  /* name agnostic: the greeting never shows a learner name, whatever the profile holds */
  if(h) h.textContent = 'Welcome aboard.';
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
/* narration is on by default; Auto off is remembered as '0' */
var narr = { audio:null, playing:false, key:'', auto: get('auto') !== '0', on: get('auto') !== '0', utter:null };
/* Where each clip stopped, by narration key. Stopping the audio (the Listen
   toggle, tapping into an activity, turning the page) remembers the spot, and
   the next play of that clip picks up there, so stepping away or taking notes
   never means starting the narration over. A clip that plays to its natural
   end forgets its spot and starts fresh next time. Survives a reload. */
var narrPos = (function(){ try{ var v = JSON.parse(get('narrpos') || '{}'); return v && typeof v === 'object' ? v : {}; }catch(e){ return {}; } })();
function narrPosSave(){ try{ set('narrpos', JSON.stringify(narrPos)); }catch(e){} }
function narrRemember(){
  if(!narr.audio || !narr.key) return;
  var a = narr.audio, t = a.currentTime || 0;
  /* only a meaningful spot is worth keeping: a couple of seconds in, and not
     already at the tail end of a clip whose length we know */
  if(t > 2 && (!a.duration || !isFinite(a.duration) || t < a.duration - 2)) narrPos[narr.key] = Math.max(0, t - 0.6);
  else delete narrPos[narr.key];
  narrPosSave();
}
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
    var backAt = !narr.playing && narrPos[narrKey()] > 0;
    if(backAt){
      bbListen.setAttribute('aria-label', 'Resume narration where it stopped');
      bbListen.setAttribute('title', 'Resume narration where it stopped');
    }
    if(bbListenT) bbListenT.textContent = narr.playing ? 'Stop' : backAt ? 'Resume' : 'Listen';
  }
  if(bbAuto) bbAuto.setAttribute('aria-pressed', narr.auto ? 'true' : 'false');
  $$('[data-narr]').forEach(function(b){ var on = narr.playing && narr.key === b.getAttribute('data-narr'); b.classList.toggle('playing', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? 'Stop' : 'Listen to this one'); });
  $$('[data-nk]').forEach(function(c){ c.classList.toggle('playing', narr.playing && narr.key === c.getAttribute('data-nk')); });
}
function narrStop(){
  if(narr.audio){ try{ narrRemember(); narr.audio.pause(); narr.audio.src = ''; }catch(e){} narr.audio = null; }
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
/* bumped whenever a clip or video is re-recorded, so browsers fetch the new file instead of a cached one */
var MEDIA_V = '20260912p';
/* the course videos carry their own narration: nothing else should talk over them, and they should not talk over anything else */
function pauseVideos(){ $$('video').forEach(function(v){ if(v.id !== 'heroVideo' && !v.paused){ try{ v.pause(); }catch(e){} } }); }
function narrPlay(k){
  k = k || narrKey(); var text = NARR[k];
  narrStop(); pauseVideos();
  if(!text){ toast('No narration on this page.'); return; }
  narr.key = k; narr.playing = true; narrUI();
  var a = new Audio('../assets/audio/foundation/' + k.replace(/\//g, '-') + '.mp3?v=' + MEDIA_V);
  a.preload = 'auto';
  a.addEventListener('ended', function(){ if(narr.audio === a){ narr.audio = null; narr.playing = false; delete narrPos[k]; narrPosSave(); narrUI(); } });
  a.addEventListener('error', function(){ if(narr.audio === a){ narr.audio = null; narrSpeak(text); } });
  narr.audio = a;
  /* pick up where this clip stopped, once the browser knows the file */
  var backTo = narrPos[k] || 0;
  if(backTo > 0){
    var seek = function(){ try{ if(narr.audio === a && (!a.duration || !isFinite(a.duration) || backTo < a.duration - 1)) a.currentTime = backTo; }catch(e){} };
    if(a.readyState >= 1) seek(); else a.addEventListener('loadedmetadata', seek);
  }
  var pr = a.play();
  if(pr && pr.catch) pr.catch(function(err){
    if(narr.audio !== a) return;
    narr.audio = null;
    if(err && err.name === 'NotAllowedError'){
      narr.playing = false; narrUI();
      /* the browser will not play sound before the first tap: start on that tap, without nagging */
      if(narr.auto && !narr.armed){ narr.armed = true; var arm = function(){ narr.armed = false; document.removeEventListener('pointerdown', arm, true); document.removeEventListener('keydown', arm, true); window.setTimeout(function(){ if(narr.auto && !narr.playing) narrPlay(); }, 350); }; document.addEventListener('pointerdown', arm, true); document.addEventListener('keydown', arm, true); }
      else if(!narr.auto) toast('Tap Listen to hear this page.');
    }
    else narrSpeak(text);
  });
}
if(bbListen) bbListen.addEventListener('click', function(){ if(narr.playing){ narr.on = false; narrStop(); } else { narr.on = true; narrPlay(); } });
/* A section with its own clip: play it when the learner opens that section (if they are listening),
   or when they tap its speaker. Tapping again stops it. Any of these stops the page narration first. */
function narrSub(k, force){
  if(!NARR[k]){ if(force) toast('No narration for this one.'); else if(narr.playing) narrStop(); return; }
  /* every section, card and speaker button reads its clip from the top; only the Listen toggle in the bottom bar resumes */
  delete narrPos[k]; narrPosSave();
  if(force) narr.on = true;
  if(narr.on || narr.auto) narrPlay(k); else if(narr.playing) narrStop();
}
function subBtn(k){ return NARR[k] ? '<button type="button" class="sub-listen" data-narr="' + k + '" aria-pressed="false" aria-label="Listen to this one" title="Listen to this one"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path class="w1" d="M15.5 8.5a5 5 0 0 1 0 7"/><path class="w2" d="M19 5a9 9 0 0 1 0 14"/></svg></button>' : ''; }
document.addEventListener('click', function(e){
  var b = e.target.closest('[data-narr]'); if(b){ e.preventDefault(); narrSub(b.getAttribute('data-narr'), true); return; }
  /* clicking into any activity stops whatever is playing, so the audio never talks over what the learner is doing */
  if(e.target.closest('.scn button[data-o], [data-drill] button, .fw-card, .flip-btn, .kq button, .sim, .mea-choice button, .md-btn, .idea-tabs button, button[data-htab], .learn-tabs button')) { pauseVideos(); if(narr.playing) narrStop(); }
}, true);
document.addEventListener('change', function(e){ if(e.target && (e.target.id === 'simSel' || e.target.closest('.sim')) && narr.playing) narrStop(); }, true);
if(bbAuto) bbAuto.addEventListener('click', function(){
  narr.auto = !narr.auto; narr.on = narr.auto; set('auto', narr.auto ? '1' : '0'); narrUI();
  if(narr.auto){ toast('Auto-narration on. Each page is read as it turns.'); narrPlay(); }
  else { toast('Auto-narration off.'); narrStop(); }
});
/* turning the page starts that page's narration from the top; the remembered
   spot is only for the Listen toggle within a page */
document.addEventListener('chart:page', function(){ narrStop(); delete narrPos[narrKey()]; narrPosSave(); narrUI(); if(narr.auto) window.setTimeout(narrPlay, reduce ? 0 : 380); });
/* the gold line under the header tracks pages turned; the Progress button counts activities */
/* fit each page to the viewport: shrink the content a little (never below 78%) before letting it scroll */
var fitT = null;
function fitPage(){
  /* Pages no longer zoom down to fit: type stays one size, and a page that needs more room scrolls. */
  var pg = document.querySelector('.page.cur'); if(!pg) return;
  var wrap = pg.querySelector('.wrap'); if(wrap) wrap.style.zoom = '';
  pg.classList.remove('fitted');
}
function fitSoon(){ if(fitT) window.clearTimeout(fitT); fitT = window.setTimeout(fitPage, 60); }
document.addEventListener('chart:page', function(){ window.setTimeout(fitPage, 30); window.setTimeout(fitPage, 450); });
window.addEventListener('resize', fitSoon);
if(window.MutationObserver){ new MutationObserver(fitSoon).observe(document.getElementById('main') || document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class', 'hidden', 'aria-expanded', 'aria-selected'] }); }
window.setTimeout(fitPage, 80);
function pageLine(){ if(!progFill || !window.chartPager) return; var c = window.chartPager.current(), n = window.chartPager.count || 1; progFill.style.width = ((c.index + 1) / n * 100) + '%'; }
document.addEventListener('chart:page', pageLine); window.setTimeout(pageLine, 50);
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
  { k:'shift',     no:'01', name:'What changed',            how:'Sort six things' },
  { k:'safe',      no:'02', name:'Five ideas at work',      how:'Find the best response in each idea’s moment' },
  { k:'year',      no:'03', name:'Your first year',         how:'Open all four groups' },
  { k:'calls',     no:'04', name:'Who handles what',        how:'Decide five situations' },
  { k:'welcome',   no:'05', name:'The four categories',     how:'Open all four' },
  { k:'task',      no:'06', name:'Get the work done',       how:'Flip all four cards' },
  { k:'relations', no:'07', name:'Take care of your people', how:'Flip all four cards' },
  { k:'change',    no:'08', name:'Make things better',      how:'Flip all four cards' },
  { k:'external',  no:'09', name:'Connect your team',       how:'Flip every card' },
  { k:'yourcall',  no:'10', name:'Your call',               how:'Find the Vanderbilt way in four situations' },
  { k:'survey',    no:'11', name:'Your assessment',         how:'Review your results email, or take the assessment' },
  { k:'quiz',      no:'12', name:'A quick check',           how:'Score 4 of 5' },
  { k:'nextstep',  no:'13', name:'Next steps',              how:'Pick one habit, then mark it done' }
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
  if(progSum) progSum.textContent = doneN === total ? 'All ' + total + ' activities complete.' : doneN + ' of ' + total + ' activities complete. ' + left + ' left; each row is a shortcut.';
  if(progTop) progTop.textContent = doneN === 0 ? total + ' activities ahead.' : doneN === total ? 'All ' + total + ' activities complete.' : doneN + ' of ' + total + ' activities complete, ' + left + ' left.';
  if(mprogLine) mprogLine.textContent = doneN + ' of ' + total + ' activities complete';
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
    if(dot){ dot.classList.toggle('done', done); var base = dot.getAttribute('data-name') || s.name; dot.setAttribute('aria-label', base + ', activity ' + (done ? 'done' : 'not done')); dot.setAttribute('title', base + ' · ' + (done ? 'done' : 'not yet')); }
    $$('.md-btn[data-prog="' + s.k + '"]').forEach(function(b){
      b.setAttribute('aria-pressed', done ? 'true' : 'false');
      var sp = b.querySelector('span'); if(sp) sp.textContent = done ? 'Completed' : (b.getAttribute('data-label') || 'Done with this section');
    });
  });
  if(changedKey && progStatus){ var sec = SECTIONS.filter(function(s){ return s.k === changedKey; })[0]; if(sec) progStatus.textContent = (nowDone ? 'Activity complete: ' : 'Activity reopened: ') + sec.name + '. ' + doneN + ' of ' + total + ' complete.'; }
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
function progDone(k){ if(progIs(k)) return; progWrite(k, true); progRender(k, true); if(window.turnDone) turnDone(k); }
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
  var mo = $('#meaOut'); if(mo) mo.innerHTML = '';
  progRender();
  if(progStatus) progStatus.textContent = 'Progress reset. 0 of ' + SECTIONS.length + ' activities complete; your starting point is cleared.';
});
if(!store){ var pw = $('#progStorageNote'); if(pw) pw.hidden = false; }

/* ── completion modal (fires once when all thirteen are done) ── */
var doneSeen = get('done-seen') === '1';
var modalReturn = null, modalTimer = null;
function allDone(){
  if(window.MVOracle){
    var qs = get('quiz-score'), qm = get('quiz-max');
    MVOracle.reportCompletion('MRC-F', { score: qs === null ? undefined : +qs, max: qm === null ? undefined : +qm, passed: true, note: 'Foundation course complete: every activity done', extra: { assess: (function(){ try{ return JSON.parse(get('assess') || 'null'); }catch(e){ return null; } })() } });
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
var oGo = $('#oracleGo'); if(oGo && oGo.tagName === 'BUTTON') oGo.addEventListener('click', modalHide);
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
  var t = $('#oracleStripText'); if(t) t.textContent = 'You opened this course from Oracle Learning. Your completion is recorded automatically once every activity is done.';
  var f = $('#oracleFine'); if(f) f.textContent = 'Recorded in Oracle Learning' + (sc.name ? ' for ' + sc.name : '') + '.';
  sc.incomplete();
  progRender();
}
window.addEventListener('mv-scorm-connected', scormAdopt);
if(window.MVScorm && MVScorm.connected) scormAdopt();

/* ══════════ flip cards, the framework map, fact or fiction ══════════ */
/* each habit card has its own clip: it plays when the card is flipped open (if the learner is listening) */
$$('.flip-btn').forEach(function(btn){
  var sec = btn.closest('section'), grid = btn.closest('.flip-grid');
  var key = sec && grid ? sec.id + '/c' + ($$('.flip-btn', grid).indexOf(btn) + 1) : '';
  if(key && NARR[key]) btn.setAttribute('data-nk', key);
  btn.addEventListener('click', function(){ var f = btn.classList.toggle('flipped'); btn.setAttribute('aria-expanded', f ? 'true' : 'false'); if(f){ flipSeen(btn); if(key && NARR[key]) narrSub(key); } else if(narr.playing && narr.key === key) narrStop(); });
});
/* each flip-card page is an activity: flip every card on the page and it is done */
var FLIP_PAGES = ['task', 'relations', 'change', 'external'];
function flipSeen(btn){
  var sec = btn.closest('section'); if(!sec || FLIP_PAGES.indexOf(sec.id) < 0) return;
  var all = $$('.flip-btn', sec), n = all.filter(function(b){ return b.classList.contains('flipped'); }).length;
  var st = $('.flip-status', sec); if(st) st.textContent = n + ' of ' + all.length + ' cards flipped.' + (n === all.length ? ' Activity complete.' : '');
  if(n === all.length) progDone(sec.id);
}
[{ map:'#yearMap', status:'#yearStatus', noun:'groups', prog:'year', narr:'year/g', done:' Activity complete. Turn the page to learn who handles what.' },
 { map:'#meaMap', status:'#meaStatus', noun:'jobs', prog:null, narr:null, done:'' }].forEach(function(cfg){
  var map = $(cfg.map), status = $(cfg.status); if(!map) return;
  var cards = $$('.fw-card', map), seen = {};
  cards.forEach(function(c, i){
    if(cfg.narr && NARR[cfg.narr + (i + 1)]) c.setAttribute('data-nk', cfg.narr + (i + 1));
    c.addEventListener('click', function(){
      var open = c.getAttribute('aria-expanded') !== 'true';
      c.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(cfg.narr){ if(open) narrSub(cfg.narr + (i + 1)); else if(narr.playing) narrStop(); }
      if(open){ seen[i] = 1; var n = Object.keys(seen).length; if(status) status.textContent = n + ' of ' + cards.length + ' ' + cfg.noun + ' opened.' + (n === cards.length ? cfg.done : ''); if(n === cards.length && cfg.prog) progDone(cfg.prog); }
    });
  });
});
/* ══════════ in practice: each video's example story, as a decision the learner makes ══════════ */
var STORIES = {
  basics: { who:'The dining manager', poster:'basics', beats:['A new dining manager still plates faster than anyone on the line.', 'Her cooks are waiting on decisions only she can make. Lunch is in forty minutes, and the line is slowing.'], q:'What does she do?', opts:[
    { t:'Keep plating. She is the fastest, and the line is moving.', out:'Lunch limps out. The cooks waited all shift on calls only she could make. Before, her job was her work. Now it is the team’s work.' },
    { t:'Step back. Name the three things that matter today, and sign the timecards.', best:true, out:'Lunch runs better, and she did not plate a tray. Decide, approve, and look after the people: that is the whole change.' },
    { t:'Tell the cooks to figure it out between them.', out:'They guess, and two of them guess differently. Somebody has to be responsible for the team’s work. That is her now.' } ],
    week:'Before Monday ends, answer the three questions on the left for your own team.' },
  framework: { who:'Monday, four asks', poster:'framework', intro:'A facilities supervisor starts Monday with four asks. Sort each one into the job it belongs to.', tags:['Get the work done', 'Take care of your people', 'Make things better', 'Connect your team'], moments:[
    { s:'A backlog of work orders from last week.', a:0, x:'Getting the work done: plan it, say what good looks like, check it before it is due.' },
    { s:'A new technician asks to learn the boiler.', a:1, x:'Taking care of your people: grow them. Find the stretch.' },
    { s:'A new work-order system arrives next month.', a:2, x:'Making things better: explain the why before the announcement lands.' },
    { s:'Events asks for his crew on Friday.', a:3, x:'Connecting your team: facts, options, and a negotiated date before you say yes.' } ],
    done:'One list, four different jobs. Sorting it tells him where the week is heavy: this week, the work and the outside ask.', week:'Sort your own list for this week into the four jobs.' },
  task: { who:'One report, five moments', poster:'task', intro:'The monthly report is due Friday. Tag each moment with the habit it shows.', tags:['Plan it', 'Say it', 'Check it', 'Fix it', 'Stop: doing the work'], moments:[
    { s:'Monday: you write what matters this week, who owns each piece, and what can wait.', a:0, x:'Plan it. What matters, who owns it, what gives.' },
    { s:'You tell Priya: the decision on page one, under three hundred words, by Thursday at three.', a:1, x:'Say it. What is expected, by when, and what good looks like.' },
    { s:'Wednesday: fifteen minutes with Priya on where the report stands and what she needs.', a:2, x:'Check it. Look at the work before it is due, while there is time to help.' },
    { s:'The same Finance extract is late for the third month. You call Finance about the process.', a:3, x:'Fix it. When the same thing breaks twice, find the cause, not the person.' },
    { s:'Thursday night you open the spreadsheet to build it yourself, to be sure.', a:4, x:'Stop. Doing the work yourself because it is faster is the old job.' } ],
    done:'Four habits and one to stop. The report ships Friday, and you did not build it.', week:'Pick one person and confirm, out loud, what they own and by when.' },
  relations: { who:'The lab technician', poster:'relations', beats:['A lab technician stays after the huddle. Her mother is in and out of the hospital, and she might need some time.', 'She has two deadlines this week. She looks braced for your reaction.'], q:'What do you do?', opts:[
    { t:'Ask what is wrong with her mother, so you can plan around it.', out:'Never ask for a diagnosis. You adjust the load; the leave office decides eligibility. The question costs trust and tells you nothing you need.' },
    { t:'Move her two deadlines, send the request to the leave office the same day, and tell her you did.', best:true, out:'A week later she is back, and the team greets her at the door. Listen and help, then route it the same day.' },
    { t:'Say you will see what you can do, and get back to work.', out:'She hears nothing. The request sits in your inbox. Same day means same day.' } ],
    week:'Thank one person for one specific thing, by name, this week.' },
  change: { who:'The checkout system', poster:'change', beats:['Central is replacing the library’s checkout system in six weeks.', 'The team has already said it in the hallway: here we go again.'], q:'What does the manager do?', opts:[
    { t:'Forward the campus email when it lands. It is not her decision anyway.', out:'The hallway version wins. The team hears what changed and never why, so it lands as one more thing done to them.' },
    { t:'Explain the why at her own staff meeting before the campus email, write down the hard questions, and let one staffer test the new cart routine for two weeks.', best:true, out:'The team still did not love the system. But they heard the why from her first, two of them volunteered to test it early, and a ten-minute look-back after move-in weekend fixed the rest.' },
    { t:'Tell the team she does not love it either, but it is what it is.', out:'Honest, and it costs the team its manager. Nobody’s concerns go anywhere.' } ],
    week:'Hold one ten-minute look-back after a piece of big work.' },
  external: { who:'The week before Commencement', poster:'external', beats:['The week before Commencement, Events asks a Student Affairs manager for her whole team on Friday.', 'She knows the events coordinator by name. The schedule has been on her wall since March, and Friday is already full.'], q:'What does she do?', opts:[
    { t:'Say yes. It is Commencement.', out:'Her team works the weekend, and the welcome tables are staffed by people who have not slept. Saying yes to everything is not connecting your team.' },
    { t:'Over coffee, with the printed hours, name the conflict and offer two options.', best:true, out:'He picks one. Nobody works the weekend, and on Commencement morning the welcome tables are staffed and ready. Facts, options, a negotiated date.' },
    { t:'Say no. The team is at capacity.', out:'The team is protected and the relationship is gone. Next time Events does not ask; it goes over her head.' } ],
    week:'Have coffee with one person your team depends on, before you need them.' }
};
(function(){
  $$('.story[data-story]').forEach(function(el){
    var k = el.getAttribute('data-story'), S = STORIES[k]; if(!S) return;
    var done = get('story:' + k) === '1';
    var head = '<div class="story-bg" style="--poster:url(../assets/img/foundation/' + S.poster + '-poster.jpg)"></div><div class="story-in"><span class="mono">In practice &middot; ' + esc(S.who) + '</span>';
    if(S.beats){
      var at = 0;
      el.innerHTML = head + '<div class="story-beats">' + S.beats.map(function(b, i){ return '<p class="beat' + (i === 0 ? ' show' : '') + '">' + esc(b) + '</p>'; }).join('') + '</div>' +
        '<div class="story-ctl"><button type="button" class="btn btn-gold btn-sm" data-next>Continue</button><span class="story-step">1 of ' + S.beats.length + '</span></div>' +
        '<div class="story-q" hidden><p class="story-ask">' + esc(S.q) + '</p><div class="story-opts">' + S.opts.map(function(o, i){ return '<button type="button" data-o="' + i + '" aria-pressed="false"' + (o.best ? ' class="best"' : '') + '><i>' + 'ABC'.charAt(i) + '</i><span>' + esc(o.t) + '</span></button>'; }).join('') + '</div><p class="story-out"></p></div>' +
        '<p class="story-week" hidden><b>This week</b>' + esc(S.week) + '</p></div>';
      var beats = $$('.beat', el), ctl = $('.story-ctl', el), q = $('.story-q', el), out = $('.story-out', el), week = $('.story-week', el), step = $('.story-step', el);
      function reveal(){ at += 1; if(at < beats.length){ beats[at].classList.add('show'); step.textContent = (at + 1) + ' of ' + beats.length; } if(at >= beats.length - 1){ ctl.hidden = true; q.hidden = false; } }
      function pick(i){ var o = S.opts[i]; $$('.story-opts button', el).forEach(function(b, j){ b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); out.className = 'story-out' + (o.best ? '' : ' miss'); out.innerHTML = '<b>' + (o.best ? 'The manager’s move' : 'What happens') + '</b>' + esc(o.out); if(o.best){ week.hidden = false; set('story:' + k, '1'); } }
      el.addEventListener('click', function(e){ if(e.target.closest('[data-next]')){ reveal(); return; } var b = e.target.closest('.story-opts button'); if(b) pick(parseInt(b.getAttribute('data-o'), 10)); });
      if(done){ beats.forEach(function(b){ b.classList.add('show'); }); at = beats.length; ctl.hidden = true; q.hidden = false; pick(S.opts.map(function(o){ return !!o.best; }).indexOf(true)); }
    } else {
      var cur = 0, good = {};
      el.innerHTML = head + '<p class="beat show story-intro">' + esc(S.intro) + '</p><div class="story-beats"></div><p class="story-out"></p><div class="story-ctl" hidden><button type="button" class="btn btn-gold btn-sm" data-next>Next</button></div><p class="story-week" hidden><b>This week</b>' + esc(S.week) + '</p></div>';
      var beatsBox = $('.story-beats', el), out2 = $('.story-out', el), ctl2 = $('.story-ctl', el), week2 = $('.story-week', el), intro = $('.story-intro', el);
      function paintMoment(){
        var m = S.moments[cur]; if(!m){ beatsBox.innerHTML = '<p class="beat show">' + esc(S.done) + '</p>'; out2.innerHTML = ''; ctl2.hidden = true; week2.hidden = false; set('story:' + k, '1'); return; }
        beatsBox.innerHTML = '<span class="story-step">' + (cur + 1) + ' of ' + S.moments.length + '</span><p class="beat show">' + esc(m.s) + '</p><div class="story-tags">' + S.tags.map(function(t, i){ return '<button type="button" data-t="' + i + '" aria-pressed="false">' + esc(t) + '</button>'; }).join('') + '</div>';
        out2.innerHTML = ''; out2.className = 'story-out'; ctl2.hidden = true;
      }
      el.addEventListener('click', function(e){
        if(e.target.closest('[data-next]')){ cur += 1; paintMoment(); return; }
        var b = e.target.closest('.story-tags button'); if(!b) return; var i = parseInt(b.getAttribute('data-t'), 10), m = S.moments[cur], hit = i === m.a;
        $$('.story-tags button', el).forEach(function(x, j){ x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); x.classList.toggle('miss', j === i && !hit); });
        out2.className = 'story-out' + (hit ? '' : ' miss'); out2.innerHTML = '<b>' + (hit ? 'Right' : 'Not that one') + '</b>' + (hit ? esc(m.x) : 'Try another. ' + esc(S.tags[m.a].split(':')[0]) + ' is the job this one belongs to.');
        if(hit) ctl2.hidden = false;
      });
      if(done){ cur = S.moments.length; intro.hidden = true; }
      paintMoment();
    }
  });
})();
/* ══════════ your first year: build the plan. Every responsibility gets a place in your rhythm, and a reason. ══════════ */
var PLAN = [
  { k:'week', t:'Every week', s:'Run the team.', slot:'Which day', opts:['Mon','Tue','Wed','Thu','Fri'], items:[
    { n:'A short 1:1 with each person', why:'The one place people tell you the truth while it is still small.', gets:'Problems surface early, and everyone knows where they stand.' },
    { n:'Look at work before it is due', why:'Checking work is the job. Doing it yourself is not.', gets:'Fewer late surprises, and work that ships right the first time.' },
    { n:'Approve timecards and time off', why:'People are paid right only if you approve on time.', gets:'Correct pay, and a yes they can plan their life around.' },
    { n:'Feedback, and thanks for specific work', why:'Late feedback is wasted feedback.', gets:'People know what good looks like, and that someone noticed.' },
    { n:'Answer questions, or find who can', why:'An open question stalls work for a day.', gets:'Nobody waits on you to move.' } ] },
  { k:'month', t:'Every month or quarter', s:'Keep it on track.', slot:'When in the month', opts:['First week','Mid month','Last week','Quarter end'], items:[
    { n:'Approve expenses and purchases', why:'Late approvals cost the team money and vendor trust.', gets:'Spend that clears while it still helps.' },
    { n:'Set and check goals', why:'A goal nobody checks is a wish.', gets:'The team knows what counts, and sees progress.' },
    { n:'Step back: how the work and the team are going', why:'You cannot see drift from inside the week.', gets:'Course corrections in weeks, not at review time.' } ] },
  { k:'cycle', t:'A few times a year', s:'The cycles.', slot:'My move', items:[
    { n:'Performance reviews', why:'A review should never surprise anyone.', gets:'Fair ratings backed by a year of notes.', opts:['Notes after every 1:1, so the review writes itself','Two hours blocked a month before','Start the week it opens'] },
    { n:'Hiring when a seat opens', why:'An open seat costs the team every week it stays open.', gets:'A faster, fairer hire.', opts:['Ask my HCM the day the seat opens','Draft the posting with the team','Wait for HR to reach out'] },
    { n:'Onboarding a new hire', why:'The first month decides whether they stay.', gets:'A new hire who is useful by week four.', opts:['A 30-day plan ready before day one','First week scheduled, hour by hour','A buddy on the team from day one'] },
    { n:'Someone leaving', why:'A good exit protects the team, and your reputation.', gets:'Knowledge kept, and a door left open.', opts:['Tell my HCM the same day','Capture what they know before they go','Thank them in front of the team'] } ] },
  { k:'event', t:'When it happens', s:'Know the process. Act the same day.', slot:'My first call', opts:['Handle it','Ask my HCM first','The leave office, same day','EOA, same day'], items:[
    { n:'A leave request, including FMLA', why:'Leave has legal protection and a clock.', gets:'Time off handled right, with no questions about the diagnosis.', right:2, x:'It sounds like leave, so it is leave until the leave office says otherwise. Adjust the work; never ask about the condition.' },
    { n:'A flexible work request', why:'Equity across the team is yours to protect.', gets:'A fair yes or no, with the reason.', right:0, x:'Yours to handle: check the policy and the equity across the team, then decide and say why.' },
    { n:'An accommodation request', why:'There is a formal process, and it starts the day they ask.', gets:'A person who can do their job, with the right support.', right:1, x:'Ask your HCM first. The process is formal, and your HCM gets it to the right office the same day.' },
    { n:'A report of harassment or discrimination', why:'You report. You do not investigate.', gets:'A team that trusts that speaking up works.', right:3, x:'EOA, the same day. Listen, write down what was said, report it. Do not investigate or promise an outcome.' },
    { n:'A performance concern that a talk did not fix', why:'A fair process protects them, and you.', gets:'A real chance to improve, documented properly.', right:1, x:'Ask your HCM first. A performance concern has a fair process; do not improvise it.' } ] }
];
(function(){
  var box = $('#yearPlan'), out = $('#yearPlanOut'), status = $('#yearStatus'); if(!box) return;
  var picks = {}; try{ picks = JSON.parse(get('plan') || '{}') || {}; }catch(e){ picks = {}; }
  var total = PLAN.reduce(function(a, g){ return a + g.items.length; }, 0), cur = 0;
  function optsOf(g, it){ return it.opts || g.opts; }
  function picked(gi, ii){ var v = picks[PLAN[gi].k + ':' + ii]; return v === undefined ? -1 : v; }
  function ok(gi, ii){ var it = PLAN[gi].items[ii], v = picked(gi, ii); return v >= 0 && (it.right === undefined || it.right === v); }
  function groupDone(gi){ return PLAN[gi].items.every(function(_, ii){ return ok(gi, ii); }); }
  function count(){ var n = 0; PLAN.forEach(function(g, gi){ g.items.forEach(function(_, ii){ if(ok(gi, ii)) n += 1; }); }); return n; }
  function item(g, gi, it, ii){
    var v = picked(gi, ii), hit = ok(gi, ii), miss = v >= 0 && !hit;
    return '<div class="pl-item"><strong>' + esc(it.n) + '</strong><span class="pl-note"><span><b>Why</b>' + esc(it.why) + '</span><span><b>The team gets</b>' + esc(it.gets) + '</span></span>' +
      '<div class="pl-opts" role="group" aria-label="' + esc(g.slot + ': ' + it.n) + '">' + optsOf(g, it).map(function(o, oi){ return '<button type="button" data-g="' + gi + '" data-i="' + ii + '" data-o="' + oi + '" aria-pressed="' + (v === oi ? 'true' : 'false') + '"' + (miss && v === oi ? ' class="miss"' : '') + '>' + esc(o) + '</button>'; }).join('') + '</div>' +
      (it.x && v >= 0 ? '<p class="pl-x' + (miss ? ' miss' : '') + '">' + (miss ? 'Not quite. ' : '') + esc(it.x) + '</p>' : '') + '</div>';
  }
  function render(){
    box.innerHTML = '<div class="pl-tabs" role="tablist" aria-label="Your rhythm">' + PLAN.map(function(g, gi){ return '<button type="button" role="tab" data-tab="' + gi + '" aria-selected="' + (gi === cur ? 'true' : 'false') + '"' + (groupDone(gi) ? ' class="done"' : '') + '><b>' + esc(g.t) + '</b><span>' + esc(g.s) + '</span></button>'; }).join('') + '</div>' +
      PLAN.map(function(g, gi){ return '<div class="pl-pane" role="tabpanel" data-pane="' + gi + '"' + (gi === cur ? '' : ' hidden') + '><div class="pl-head"><strong>' + esc(g.s) + '</strong><span class="mono">' + esc(g.slot) + ' &middot; pick one for each</span></div>' + g.items.map(function(it, ii){ return item(g, gi, it, ii); }).join('') +
        '<div class="pl-foot">' + (gi > 0 ? '<button type="button" class="btn btn-ghost btn-sm" data-prev>Back</button>' : '') + (gi < PLAN.length - 1 ? '<button type="button" class="btn btn-gold btn-sm" data-next>Next: ' + esc(PLAN[gi + 1].t) + '</button>' : '') + '</div></div>'; }).join('');
    paintOut();
  }
  function planText(){
    return PLAN.map(function(g, gi){ var lines = g.items.map(function(it, ii){ return ok(gi, ii) ? '  - ' + it.n + ': ' + optsOf(g, it)[picked(gi, ii)] : null; }).filter(Boolean); return lines.length ? g.t.toUpperCase() + '\n' + lines.join('\n') : null; }).filter(Boolean).join('\n\n');
  }
  function paintOut(){
    if(!out) return;
    var n = count();
    out.innerHTML = '<span class="mono">My plan &middot; ' + n + ' of ' + total + '</span><h4>My first year, <em>planned</em>.</h4>' +
      (n ? PLAN.map(function(g, gi){ var lis = g.items.map(function(it, ii){ return ok(gi, ii) ? '<li><span>' + esc(it.n) + '</span><i>' + esc(optsOf(g, it)[picked(gi, ii)]) + '</i></li>' : ''; }).join(''); return lis ? '<div class="pl-g"><b>' + esc(g.t) + '</b><ul>' + lis + '</ul></div>' : ''; }).join('') : '<p class="pl-empty">Pick a place for each responsibility on the right. It lands here.</p>') +
      (n ? '<div class="pl-ctl"><button type="button" class="btn btn-ghost btn-sm" data-copyplan>Copy my plan</button><a class="btn btn-ghost btn-sm" href="mailto:?subject=' + encodeURIComponent('My first year as a manager: the plan') + '&body=' + encodeURIComponent(planText()) + '">Email it to myself</a></div>' : '');
    if(status) status.textContent = n + ' of ' + total + ' planned.' + (n === total ? ' Activity complete. Copy the plan, or email it to yourself.' : '');
    if(n === total) progDone('year');
  }
  function show(gi){ cur = gi; $$('.pl-tabs button', box).forEach(function(b){ b.setAttribute('aria-selected', parseInt(b.getAttribute('data-tab'), 10) === gi ? 'true' : 'false'); }); $$('.pl-pane', box).forEach(function(pn){ pn.hidden = parseInt(pn.getAttribute('data-pane'), 10) !== gi; }); if(NARR['year/g' + (gi + 1)]) narrSub('year/g' + (gi + 1)); }
  box.addEventListener('click', function(e){
    var o = e.target.closest('.pl-opts button'); if(o){
      var gi = +o.getAttribute('data-g'), ii = +o.getAttribute('data-i'), oi = +o.getAttribute('data-o');
      picks[PLAN[gi].k + ':' + ii] = oi; set('plan', JSON.stringify(picks));
      var pane = o.closest('.pl-pane'); var row = o.closest('.pl-item'); var tmp = document.createElement('div'); tmp.innerHTML = item(PLAN[gi], gi, PLAN[gi].items[ii], ii); row.replaceWith(tmp.firstChild);
      $$('.pl-tabs button', box).forEach(function(b){ b.classList.toggle('done', groupDone(+b.getAttribute('data-tab'))); });
      paintOut(); return;
    }
    var t = e.target.closest('.pl-tabs button[data-tab]'); if(t){ show(+t.getAttribute('data-tab')); return; }
    if(e.target.closest('button[data-next]')){ show(Math.min(cur + 1, PLAN.length - 1)); return; }
    if(e.target.closest('button[data-prev]')){ show(Math.max(cur - 1, 0)); }
  });
  if(out) out.addEventListener('click', function(e){
    var b = e.target.closest('button[data-copyplan]'); if(!b) return;
    var txt = planText(); var done = function(){ b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy my plan'; }, 1800); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done); else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); }catch(err){} ta.remove(); done(); }
  });
  render();
})();
/* ══════════ your call: one scenario, three responses, consequences ══════════ */
/* ══════════ practice it live: a spoken conversation with the character, scored by what you did ══════════
   The character is an ElevenLabs conversational agent. The page starts the session, shows the
   transcript, and the agent calls record_outcome when the talk ends; that payload is the score. */
var LIVE = {
  idea1: { agent:'agent_8001m5ww69zged0tmb479r7kyc9j', who:'Sam', initial:'S', role:'Coordinator on your team', mins:'About three minutes',
    brief:'Monday, 9:00, your one to one with Sam. Forty one emails are waiting and the grant report is due Thursday with no owner. Tell Sam the few things that matter this week, give the report an owner and a date, and keep the meeting about Sam.',
    checks:[['named_priorities', 'You named the few things that matter this week'], ['assigned_report', 'You gave the grant report an owner and a date'], ['asked_what_you_need', 'You asked what Sam needs, and listened'], ['kept_the_one_to_one', 'You kept the one to one about Sam']],
    penalty:['took_report_themselves', 'You took the report on yourself. Doing the work is the old job.'],
    way:'The Vanderbilt way: rocks first. Three named priorities before email, said out loud, with owners. The sand fits around them.', pass:3 },
  idea2: { agent:'agent_8901m5ww6bh9evns857z11cg5g1t', who:'Priya', initial:'P', role:'Analyst on your team', mins:'About three minutes',
    brief:'Priya has rewritten the summary twice. Both times your only feedback was “tighten it up.” It is due tomorrow. Tell her exactly what good looks like, when you need it, and why it matters. Do not rewrite it for her.',
    checks:[['said_what_good_looks_like', 'You said specifically what the summary needs'], ['gave_a_deadline', 'You gave a time it is due'], ['gave_the_why', 'You explained why it matters'], ['stayed_kind', 'You were direct without blaming her']],
    penalty:['rewrote_it_themselves', 'You offered to rewrite it yourself. It ships, Priya learns nothing, and you own every summary from now on.'],
    way:'The Vanderbilt way: clear is kind. What, by when, what good looks like, and why. Said in the 1:1, written in the follow up.', pass:3 },
  safe1: { agent:'agent_4501m5ww6dq5f69vc8h4zxsev35y', who:'Jordan', initial:'J', role:'Project coordinator on your team', mins:'About three minutes',
    brief:'Jordan comes to you Tuesday with bad news: the vendor slipped and the launch moves a week. She is braced for your reaction. Thank first, find out what we know, ask what she needs, and let her run the recovery.',
    checks:[['thanked_first', 'Your first reaction was thanks, not blame'], ['asked_what_we_know', 'You asked what we know'], ['asked_what_you_need', 'You asked what she needs from you'], ['left_recovery_with_you', 'You left the recovery with her, with your help']],
    penalty:['blamed_first', 'You opened with why am I only hearing about this now. Jordan learned that bad news gets a bad reaction. Next time you hear it later.'],
    way:'The Vanderbilt way: thank first, solve second, learn the cause later. Make the truth cheap to tell.', pass:3 },
  idea4: { agent:'agent_2901m5ww6fg0f03vaprzgycpqs02', who:'Alex', initial:'A', role:'Specialist on your team', mins:'About three minutes',
    brief:'Central is replacing the intake form and Alex has already said here we go again. Explain the why in your own words, say what it fixes, ask what worries Alex, and carry the worries back.',
    checks:[['explained_why', 'You explained why the form is changing'], ['said_what_it_fixes', 'You named what it fixes'], ['asked_what_worries_you', 'You asked what worries Alex, and listened'], ['will_carry_it_back', 'You said you would carry the concerns back']],
    penalty:['joined_the_hallway', 'You joined the hallway. Honest, and it cost the team its manager.'],
    way:'The Vanderbilt way: start with why. People who know the why make good decisions when you are not in the room.', pass:3 },
  idea5: { agent:'agent_8001m5wswdhrej0959pp630zjyza', who:'Dev', initial:'D', role:'Analyst on your team', mins:'About three minutes',
    brief:'Dev has missed two deadlines this month. You asked to see him. Say what you noticed, say what you expect, ask what is in the way, and agree a next step. He answers back. Then you are scored on what you did, not what you picked.',
    checks:[['named_what_noticed', 'You said what you noticed'], ['stated_expectation', 'You said what you expect from now on'], ['asked_what_you_need', 'You asked what was in the way, and listened'], ['agreed_next_step', 'You agreed a concrete next step']],
    penalty:['handed_off_to_pcb', 'You handed it to PCB or your HCM. The people work is your work. PCB shows you how; it does not have the conversation for you.'],
    way:'The Vanderbilt way: say it plainly, early, in private, and ask before you judge. Then call your HCM about how to note it, not whether to have it.', pass:3 },
  task: { agent:'agent_4501m5ww6h0cfdg9f1ny96r43jww', who:'Priya', initial:'P', role:'Analyst who builds the monthly report', mins:'About three minutes',
    brief:'Wednesday. The monthly report is due Friday, nobody has mentioned it in two weeks, and a director just asked you if it is on time. Fifteen minutes with Priya. Check where it stands before you promise anything.',
    checks:[['asked_where_it_stands', 'You asked where the report stands before judging'], ['asked_what_is_blocking', 'You asked what is blocking her, and acted on it'], ['agreed_plan_for_friday', 'You settled a plan for Friday'], ['set_a_regular_check_in', 'You set a regular check in so this never lands on a Wednesday again']],
    penalty:['took_it_over_or_blamed', 'You took the report over or passed the blame down. Checking work is a conversation, not a forwarded email.'],
    way:'The Vanderbilt way: check it, then say it. Look at the work before it is due, and put the check on the calendar.', pass:3 },
  relations: { agent:'agent_8401m5ww6jprews8b25d3krxyn24', who:'Marcus', initial:'M', role:'One of your strongest people', mins:'About three minutes',
    brief:'Marcus stays after the 1:1: his dad is in and out of the hospital and he might need time off. Listen, help this week, route it to the leave office, and never ask for a diagnosis.',
    checks:[['thanked_you', 'You thanked him for telling you'], ['adjusted_the_work', 'You moved something concrete this week'], ['routed_to_leave_office', 'You routed it to the leave office'], ['reassured_about_your_work', 'You said it does not change how you see his work']],
    penalty:['asked_for_medical_details', 'You asked about the medical side. Never. Warm is right; the diagnosis is not yours to ask for.'],
    way:'The Vanderbilt way: listen, help, and route it. Adjust the load now, start the leave process so options are ready, and leave the medical detail alone.', pass:3 },
  change: { agent:'agent_2501m5ww6n2nftr9n13bnamz7bkn', who:'Taylor', initial:'T', role:'Senior administrator, speaking for the team', mins:'About three minutes',
    brief:'Central is replacing the travel system in six weeks and the email goes out Tuesday. You chose to tell the team first, in Thursday’s meeting. Taylor speaks for the skeptics. Explain the why, ask what worries them, write it down.',
    checks:[['explained_why_first', 'You explained the why in your own words, first'], ['said_what_it_fixes', 'You said what it fixes'], ['asked_what_worries_you', 'You asked what worries the team, and listened'], ['will_carry_it_back', 'You committed to carry the worries back']],
    penalty:['joined_the_hallway', 'You joined the hallway instead of leading it. Nobody’s concerns will reach the people who can act.'],
    way:'The Vanderbilt way: explain the why before the email lands, ask what worries people, and take it somewhere. Small and weekly is how agility happens.', pass:3 },
  external: { agent:'agent_7401m5ww6pyqfen820k04vmwvrmr', who:'Director Reyes', initial:'R', role:'Director in another unit', mins:'About three minutes',
    brief:'A director wants a full data reconciliation by Friday for audit prep. Your month end close is the same week. Call back with the numbers, the collision, and options, and ask what the audit actually needs.',
    checks:[['asked_what_you_really_need', 'You asked what the audit actually needs'], ['named_the_teams_constraint', 'You named the month end collision'], ['offered_a_workable_option', 'You offered a workable option'], ['settled_a_commitment', 'You ended with a clear commitment']],
    penalty:['committed_without_checking', 'You said yes without raising the collision. The team works the weekend, and next quarter the director asks again, sooner.'],
    way:'The Vanderbilt way: speak up for your team with the numbers and the options, politely and early. Not a yes you cannot keep, not a no with no reason.', pass:3 }
};

function liveHTML(k){
  var L = LIVE[k];
  return '<div class="live" data-live="' + k + '"><div class="live-scene"><div class="live-avatar"><i class="ring r1"></i><i class="ring r2"></i><span>' + L.initial + '</span></div>' +
    '<div class="live-who"><span class="mono">Practice it live &middot; with ' + esc(L.who) + '</span><h4>Have the conversation. <em>Out loud.</em></h4><p>' + esc(L.brief) + '</p><p class="live-meta">' + esc(L.who) + ', ' + esc(L.role) + ' &middot; ' + esc(L.mins) + ' &middot; Microphone</p></div></div>' +
    '<ol class="live-how" aria-label="How this works"><li><b>1</b>Tap Start and allow the microphone. ' + esc(L.who) + ' speaks first.</li><li><b>2</b>Talk the way you would at work. Speak naturally, in your own words. There is no script.</li><li><b>3</b>Practice the idea on this page. When you are done, say goodbye. You are scored on what you did, not what you picked.</li></ol>' + '<div class="live-ctl"><button type="button" class="btn btn-gold" data-live-start>Start the conversation</button><button type="button" class="btn btn-ghost" data-live-end hidden>End the conversation</button><span class="live-state" role="status" aria-live="polite"></span></div>' +
    '<div class="live-log" aria-live="polite"></div><div class="live-score" hidden></div></div>';
}

var SCENARIOS = {
  idea1: { h:'Priorities · Monday morning', s:'Monday, 8:05. Forty-one emails, two marked urgent, and a 1:1 with Sam at 9. The grant report your team owns is due Thursday and nobody has started it.', opts:[
    { t:'Clear the inbox first. Then the day is yours.', b:'Sand first', best:false, out:'By ten the inbox is empty, and full again. The report is still not started and Sam’s 1:1 got moved. The sand went in first, and the big rocks did not fit.' },
    { t:'Write the three things that matter this week, tell the team, then open email.', b:'Big rocks first', best:true, out:'Report owner named by 8:15, Sam’s 1:1 kept, the vendor decision made by noon. The forty-one emails fit around them. Most were sand.' },
    { t:'Start the report yourself so it is done right.', b:'Doing the work instead of managing it', best:false, out:'The report gets written and your week does not. The team never learns what mattered, and Sam’s 1:1 slips again.' }
  ]},
  idea2: { h:'Clear expectations · The summary', s:'Priya’s summary has come back twice. Both times you wrote “looks good, maybe tighten it up a bit?” It is due tomorrow and it is still not what you need.', opts:[
    { t:'“Maybe take one more pass when you get a chance.”', b:'Hinting', best:false, out:'Third draft, same problem. Priya has now spent three days guessing what “tighten” means. Unclear is unkind.' },
    { t:'“It needs the decision on page one, under three hundred words, by three tomorrow. The director only reads the first page.”', b:'Clear is kind', best:true, out:'One draft, done by two. Priya knows what good looks like and why. The next one comes in right the first time.' },
    { t:'Rewrite it yourself tonight and send it.', b:'Doing the work', best:false, out:'It ships. Priya learns nothing, and you now own every summary from here on.' }
  ]},
  safe1: { h:'Psychological safety · Bad news', s:'Jordan tells you on Tuesday that the vendor missed its deadline and the launch will slip a week. She looks braced for your reaction.', opts:[
    { t:'“Why am I only hearing about this now?”', b:'The reaction that ends early warnings', best:false, out:'A fair question and the wrong first sentence. Jordan learns that bad news gets a bad reaction. Next time you hear it later, or from someone else.' },
    { t:'“Thank you for telling me today. What do we know, and what do you need from me?”', b:'Safe to speak up', best:true, out:'Jordan relaxes and gives you the full picture. Thank first, solve second, learn the cause later. She will bring you the next one earlier.' },
    { t:'“Okay. Let me handle it from here.”', b:'Kind, and it takes the work away', best:false, out:'It sounds supportive, and it tells Jordan she cannot be trusted with the recovery. Ask what she needs and let her run it with your help.' }
  ]},
  idea4: { h:'Purpose · The new form', s:'Central is replacing the intake form. You have to tell the team Friday. Two people have already said “here we go again” in the hallway.', opts:[
    { t:'Forward the announcement: “FYI, new form starts Monday.”', b:'The what without the why', best:false, out:'The hallway version wins. The team hears what changed and nobody knows why, so it lands as one more thing done to them.' },
    { t:'“Here is why: the old form lost a third of requests at the handoff. This fixes that. What worries you about it?”', b:'Start with why', best:true, out:'Still not loved, but understood. Two worries surface that central had not thought of, and you carry them back. Two people offer to test it early.' },
    { t:'“I do not love it either, but it is what it is.”', b:'Joining the hallway', best:false, out:'Honest, and it costs the team its manager. Nobody’s concerns go anywhere.' }
  ]},
  idea5: { h:'The people work · Missed deadlines', s:'Dev has missed two deadlines this month. A coworker mentions it in passing. You are new, and you would rather PCB handled it.', opts:[
    { t:'Email your HCM: “Can you talk to Dev about his deadlines?”', b:'Handing off your job', best:false, out:'Your HCM sends it back with one question: have you talked to him? The conversation is yours. PCB shows you how; it does not have it for you.' },
    { t:'Have the conversation this week: what you noticed, what you expect, what he needs. Ask your HCM how to note it.', b:'The people work is your work', best:true, out:'Dev was waiting on data from another team and did not know it mattered to you. Fixed in fifteen minutes. Your HCM coached you on the note in five.' },
    { t:'Wait for the performance review to bring it up.', b:'Letting it grow', best:false, out:'Four more months of missed deadlines, then a review that surprises him. Late feedback is wasted feedback.' }
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
    { t:'Reply “We cannot do this” and copy your manager.', b:'Not speaking up, just escalating', best:false, out:'Your manager now owns a negotiation you could have had in one email, and the director hears “no” with no reason and no option. Speaking up for your team means the numbers and the options, not just a refusal.' }
  ]}
};
/* the best response should not always be B: place it at a varied, fixed position per scenario */
(function(){
  var POS = { idea1:2, idea2:0, safe1:1, idea4:2, idea5:0, task:1, relations:2, change:0, external:1 };
  Object.keys(POS).forEach(function(k){ var sc = SCENARIOS[k]; if(!sc) return; var bi = -1; sc.opts.forEach(function(o, i){ if(o.best) bi = i; }); if(bi < 0 || bi === POS[k]) return; var o = sc.opts.splice(bi, 1)[0]; sc.opts.splice(POS[k], 0, o); });
})();
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
var CALL_SETS = { jobs:['task','relations','change','external'] };
var CALL_HEADS = { task:'Task-oriented · Get the work done', relations:'Relations-oriented · Take care of your people', change:'Change-oriented · Make things better', external:'External · Connect your team' };
var CALL_PROG = { jobs:{ prog:'yourcall', noun:'conversations', status:'#jobsStatus', narr:'yourcall/s' } };
function buildCalls(el){
  var name = el.getAttribute('data-calls'), keys = CALL_SETS[name]; if(!keys) return;
  var cfg = CALL_PROG[name], status = $(cfg.status), found = {}, cur = 0;
  el.innerHTML = keys.map(function(k, i){
    var sc = SCENARIOS[k];
    return '<div class="cq' + (i === 0 ? ' cur' : '') + '" data-k="' + k + '"><p class="cq-h">' + (i + 1) + ' of ' + keys.length + ' &middot; ' + esc(sc.h || CALL_HEADS[k] || '') + subBtn(cfg.narr + (i + 1)) + '</p>' + (LIVE[k] ? liveHTML(k) + '<details class="try-fold-cq"><summary>No microphone? Tap the response you would give instead</summary><div class="scn" data-scn="' + k + '"></div></details>' : '<div class="scn" data-scn="' + k + '"></div>') + '<div class="cq-nav">' +
      (i < keys.length - 1 ? '<button type="button" class="btn btn-primary btn-sm" data-next="1" hidden>Next situation<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' : '') +
      (i > 0 ? '<button type="button" class="btn btn-ghost btn-sm" data-prev="1">Back</button>' : '') + '</div></div>';
  }).join('');
  $$('.scn[data-scn]', el).forEach(buildScenario);
  /* a rail of the situations in the copy column: where you are, what is found, and a way to jump */
  var rail = null, copy = el.closest('.v-stage') && el.closest('.v-stage').querySelector('.v-copy');
  if(copy){ rail = document.createElement('ol'); rail.className = 'v-side cq-rail'; rail.setAttribute('aria-label', 'Situations');
    rail.innerHTML = keys.map(function(k, i){ var h = (SCENARIOS[k].h || CALL_HEADS[k] || '').split(' · '); return '<li><button type="button" data-go="' + i + '" aria-current="' + (i === 0 ? 'true' : 'false') + '"><b>0' + (i + 1) + '</b><span>' + esc(h[0]) + (h[1] ? '<br><small>' + esc(h[1]) + '</small>' : '') + '</span><span class="ok" aria-hidden="true">&#10003;</span></button></li>'; }).join('');
    var why = copy.querySelector('.v-why'); if(why && why.nextSibling) copy.insertBefore(rail, why.nextSibling); else copy.appendChild(rail);
    rail.addEventListener('click', function(e){ var b = e.target.closest('button[data-go]'); if(b) show(parseInt(b.getAttribute('data-go'), 10)); });
  }
  function pips(){ return '<span class="pips" aria-hidden="true">' + keys.map(function(k){ return '<i class="' + (found[k] ? 'ok' : '') + '"></i>'; }).join('') + '</span>'; }
  function paint(){ var n = Object.keys(found).length; if(status) status.innerHTML = pips() + '<span>' + n + ' of ' + keys.length + ' ' + cfg.noun + '.' + (n === keys.length ? ' Activity complete.' : '') + '</span>'; if(rail) $$('button[data-go]', rail).forEach(function(b, i){ b.classList.toggle('found', !!found[keys[i]]); }); if(n === keys.length) progDone(cfg.prog); }
  function show(i){ $$('.cq', el).forEach(function(q, qi){ q.classList.toggle('cur', qi === i); }); cur = i; if(rail) $$('button[data-go]', rail).forEach(function(b, bi){ b.setAttribute('aria-current', bi === i ? 'true' : 'false'); }); var f = $$('.cq', el)[i].querySelector('button:not([hidden])'); if(f) f.focus({ preventScroll:true }); narrSub(cfg.narr + (i + 1)); }
  el.addEventListener('click', function(e){
    if(e.target.closest('button[data-next]')){ show(cur + 1); return; }
    if(e.target.closest('button[data-prev]')){ show(cur - 1); return; }
    var b = e.target.closest('.scn button[data-o]'); if(!b) return;
    var q = b.closest('.cq'), k = q.getAttribute('data-k'), o = SCENARIOS[k].opts[parseInt(b.getAttribute('data-o'), 10)];
    var nx = q.querySelector('button[data-next]'); if(nx) nx.hidden = false;
    if(o.best){ found[k] = 1; paint(); }
  });
  window.markCallFound = function(k){ if(keys.indexOf(k) >= 0){ found[k] = 1; paint(); } };
  paint();
}
$$('[data-calls]').forEach(buildCalls);

/* ══════════ quick check: which habit is it, one situation at a time ══════════ */
var DRILLS = {
  shift: { opts:['Mine now','My team member’s','PCB, or another office'], prog:'shift', verb:'sorted', items:[
    { s:'Deciding which of three new requests the team does first this week.', a:0, x:'Yours now. Priorities are the manager’s call; if you do not make it, the loudest request will.' },
    { s:'Writing the monthly report your best analyst has always written.', a:1, x:'Still theirs. Your job is to check it before it is due, not to write it. Doing the work is the old job.' },
    { s:'Deciding whether someone qualifies for medical leave.', a:2, x:'The leave office decides. Your job is to send it there the same day, and never to ask for a diagnosis.' },
    { s:'Making sure a new hire knows what is expected in their first month.', a:0, x:'Yours now. Nobody else will say it, and “clear is kind.”' },
    { s:'Investigating a complaint that a coworker is harassing someone.', a:2, x:'Equal Opportunity and Access investigates. Your job is to report it the same day, not to look into it yourself.' },
    { s:'Approving a timecard that shows 52 hours in one week.', a:0, x:'Yours now. Ask about the week before you approve, and fix what needs fixing. You are responsible for accuracy: timesheets and payroll must be right.' }
  ]},
  calls: { opts:['Handle it','Ask my HCM first','The leave office, the same day','EOA, the same day'], prog:'calls', verb:'decided', items:[
    { s:'A team member asks for next Friday off for a wedding.', a:0, x:'Handle it. Check coverage, approve it in UKG, and say yes out loud. The UKG micro module shows the steps.' },
    { s:'A team member says their doctor wants them out for three weeks after surgery.', a:2, x:'The leave office, the same day. It sounds like leave, so it is leave until the leave office says otherwise. Adjust the work; do not ask about the surgery.' },
    { s:'A team member says a coworker keeps making comments about her religion.', a:3, x:'EOA, the same day. You listen, you write down what was said, and you report it. You do not investigate or promise an outcome.' },
    { s:'You want to raise someone’s pay because they took on more work.', a:1, x:'Ask your HCM first. Pay has a process and a cycle; your HCM tells you what is possible and when.' },
    { s:'A seat on your team just opened and you want to fill it.', a:1, x:'Ask your HCM first. Hiring starts with a requisition and an approval chain. The Oracle for Managers: hiring micro module shows the steps.' },
    { s:'A team member’s work has slipped for a month and a talk did not fix it.', a:1, x:'Ask your HCM first. A performance concern has a fair process; do not improvise it.' }
  ]},
  task: { opts:['Plan it','Say it','Check it','Fix it','Not managing, just doing the work'], prog:'task', verb:'named', items:[
    { s:'Before the quarter, set three priorities, assigned an owner to each, and decided what would move if a new request landed.', a:0, x:'Plan it: what, who, when, and what gives. Done before the quarter, not during it.' },
    { s:'In the first 1:1 of the month, confirmed with each person what they own, the deadline, and what “done well” means, and wrote it where the team can see it.', a:1, x:'Say it: said out loud, confirmed back, written where the team can see it.' },
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
    { s:'Described to the team, in two sentences, what they will be able to do next year that they cannot do now, and how it connects to the mission.', a:1, x:'Describe where we are going: a clear picture of next year and why it matters.' },
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
    if(status) status.innerHTML = pips() + '<span>' + n + ' of ' + d.items.length + ' ' + d.verb + '.' + (n === d.items.length ? ' ' + right + ' of ' + d.items.length + ' right. Activity complete.' : '') + '</span>';
    if(n === d.items.length) progDone(d.prog);
  });
  if(status) status.innerHTML = pips() + '<span>0 of ' + d.items.length + ' ' + d.verb + '.</span>';
}
$$('[data-drill]').forEach(buildDrill);

var ROCKS_ART = '<div class="idea-art photo" id="rocksArt">' +
  '<figure class="jar-fig a"><img src="../assets/img/foundation/jar-sand-first.webp" alt="A glass jar filled with sand, with three large rocks piled on top that do not fit inside" width="1600" height="1200" decoding="async" /><figcaption><b>Sand first</b>Email and small requests go in first. The report, the hire, the 1:1s spill over the top.</figcaption></figure>' +
  '<figure class="jar-fig b"><img src="../assets/img/foundation/jar-rocks-first.webp" alt="The same jar with the three rocks inside and the sand settled around them, lid resting beside it" width="1600" height="1200" decoding="async" /><figcaption><b>Rocks first</b>Three named priorities go in first. The small things fit in the gaps.</figcaption></figure>' +
  '</div>';
/* ══════════ five ideas, one at a time ══════════ */
var IDEAS = [
  { who:'Setting priorities · the big rocks method', h:'Put first things <em>first</em>.',
    what:'Picture a jar. The rocks are the high-impact work: the report your team owns, the hire, your 1:1s. The sand is the quick, low-value wins: email, small requests. Sand first and the rocks never fit. Rocks first and the sand settles around them.',
    why:'Your calendar fills itself. Requests arrive faster than you can finish them, and the urgent ones are rarely the important ones. Without three named priorities, the loudest request decides for you.',
    looks:'Monday, before email: three lines on a notepad. Said aloud at the huddle, on the calendar by nine. A request lands Wednesday; you ask which rock it moves.',
    value:'A team that knows this week’s three things wastes less, argues less, and finishes more.',
    week:'Write your three big rocks before you open your inbox. Tell your team.' },
  { who:'Clear expectations and feedback · clear is kind', h:'Clear is kind. Unclear is <em>unkind</em>.',
    what:'Say what you expect, by when, and what good looks like. Give feedback close to the moment, in private, on the specific thing.',
    why:'Hinting feels kind and costs weeks. People guess, redo the work, and hear about the problem late, when it is bigger and harder to fix.',
    looks:'“The summary needs the decision on page one, under three hundred words, by Thursday at three. Here is why.” Said in the 1:1, written in the follow-up.',
    value:'Fewer surprises at the deadline, fewer redo cycles, and a team that always knows where it stands.',
    week:'Say one thing you have been hinting at. Privately, plainly, kindly.' },
  { who:'Psychological safety', h:'People only speak up when it is <em>safe</em> to.',
    what:'A team’s shared belief that nobody is punished or embarrassed for a question, a mistake, or a disagreement. Not about being nice: about making the truth cheap to tell.',
    why:'Late news is the most expensive kind. A team that fears the reaction hides mistakes until they are big, and stops asking questions before they become errors.',
    looks:'Bad news lands: “Thank you for telling me today. What do we know, and what do you need from me?” A basic question in the meeting gets a straight answer. You say “I got that wrong” out loud.',
    value:'You hear about problems while they are small. The best teams report more mistakes, not fewer, because they catch them early.',
    week:'When someone reports a problem, thank them first. Then solve it.' },
  { who:'Purpose · start with why, team first', h:'Explain the why. Take care of the people, and they take care of the <em>work</em>.',
    what:'People do their best work when they know why it matters, not just what to do. A team that feels looked after protects the work and each other.',
    why:'People who know the why make good decisions when you are not in the room. People who only know the what wait for you, or push back in the hallway.',
    looks:'Before you hand out the new form: “Here is why. The old one loses a third of requests at the handoff.” Credit passed down in the team meeting. Blame taken first with your manager.',
    value:'A team that trusts you tells you the truth, stays, and works through the hard weeks with you instead of around you.',
    week:'Explain the why behind one thing you have been asking for.' },
  { who:'The people work · a manager’s core responsibilities', h:'The people work is the manager’s <em>work</em>.',
    what:'Hiring, onboarding, expectations, feedback, performance, time and leave, and hard conversations are the manager’s job, not PCB’s. PCB shows you how.',
    why:'Nothing should wait for someone else to act. Your team gets answers from the person who knows them, and PCB spends its time on the hard cases, not the routine ones.',
    looks:'You hold the 1:1. You give the feedback the week it happened. You send the leave request the same day. You call your HCM when you are unsure, not instead of acting.',
    value:'Problems get handled while they are small, by the person closest to them, and your team knows who its manager is.',
    week:'Find out your HCM’s and your Engagement Consultant’s names, and how to reach them.' }
];
(function(){
  var SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client/+esm';
  var sessions = {};
  function el(root, sel){ return root.querySelector(sel); }
  function setState(root, mode, text){ root.setAttribute('data-mode', mode); el(root, '.live-state').textContent = text || ''; }
  function line(root, who, text){ var log = el(root, '.live-log'); var d = document.createElement('p'); d.className = 'live-line ' + who; d.innerHTML = '<b>' + (who === 'you' ? 'You' : esc(LIVE[root.getAttribute('data-live')].who)) + '</b>' + esc(text); log.appendChild(d); log.scrollTop = log.scrollHeight; }
  function score(root, p){
    var k = root.getAttribute('data-live'), L = LIVE[k], n = 0;
    var rows = L.checks.map(function(c){ var ok = !!p[c[0]]; if(ok) n += 1; return '<li class="' + (ok ? 'ok' : 'no') + '"><i aria-hidden="true">' + (ok ? '&#10003;' : '&times;') + '</i>' + esc(c[1]) + '</li>'; }).join('');
    var pen = L.penalty && p[L.penalty[0]];
    var passed = n >= L.pass && !pen;
    var box = el(root, '.live-score');
    box.innerHTML = '<span class="mono">' + (passed ? 'You held the conversation' : 'Not yet') + ' &middot; ' + n + ' of ' + L.checks.length + '</span>' +
      (p.summary ? '<p class="live-sum">' + esc(p.summary) + '</p>' : '') + '<ul class="live-checks">' + rows + '</ul>' +
      (pen ? '<p class="live-pen">' + esc(L.penalty[1]) + '</p>' : '') + (p.tone === 'harsh' ? '<p class="live-pen">' + esc(L.who) + ' went quiet. Harsh gets compliance, not the truth.</p>' : '') +
      '<p class="live-way">' + esc(L.way) + '</p><button type="button" class="btn btn-ghost btn-sm" data-live-again>Try it again</button>';
    box.hidden = false; setState(root, 'done', passed ? 'Scored.' : 'Scored. Try it again when you are ready.');
    if(passed){ if(window.markIdeaMoment) markIdeaMoment(k); if(window.markCallFound) markCallFound(k); }
    try{ localStorage.setItem('mv-found-live-' + k, JSON.stringify({ n:n, pen:!!pen, at:Date.now() })); }catch(e){}
  }
  function fallback(root, why){
    setState(root, 'off', '');
    var L = LIVE[root.getAttribute('data-live')];
    el(root, '.live-log').innerHTML = '<p class="live-off">' + esc(why) + ' You can still practice on the ElevenLabs page, or use the tap version above. <a href="https://elevenlabs.io/app/talk-to?agent_id=' + L.agent + '" target="_blank" rel="noopener">Talk to ' + esc(L.who) + ' in a new tab</a>.</p>';
    el(root, '[data-live-start]').hidden = false; el(root, '[data-live-end]').hidden = true;
    var fold = root.parentNode && (root.parentNode.querySelector('.try-fold, .try-fold-cq')); if(fold){ fold.classList.add('open'); if(fold.tagName === 'DETAILS') fold.open = true; }
  }
  function start(root){
    var k = root.getAttribute('data-live'), L = LIVE[k];
    el(root, '.live-log').innerHTML = ''; el(root, '.live-score').hidden = true;
    el(root, '[data-live-start]').hidden = true; el(root, '[data-live-end]').hidden = false;
    setState(root, 'connecting', 'Asking for the microphone…');
    if(narr.playing) narrStop(); pauseVideos();
    var mic = navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? navigator.mediaDevices.getUserMedia({ audio:true }) : Promise.reject(new Error('nomic'));
    mic.then(function(stream){ try{ stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){}
      setState(root, 'connecting', 'Connecting to ' + L.who + '…');
      return import(SDK);
    }).then(function(mod){
      var Conversation = mod.Conversation || (mod.default && mod.default.Conversation);
      if(!Conversation) throw new Error('nosdk');
      return Conversation.startSession({
        agentId: L.agent, connectionType: 'webrtc',
        clientTools: { record_outcome: function(p){ score(root, p || {}); return 'recorded'; } },
        onConnect: function(){ setState(root, 'listening', L.who + ' is on. Speak when you are ready.'); },
        onDisconnect: function(){ el(root, '[data-live-end]').hidden = true; el(root, '[data-live-start]').hidden = false; if(root.getAttribute('data-mode') !== 'done') setState(root, 'off', 'Conversation ended.' + (el(root, '.live-score').hidden ? ' No score was recorded. Start again and finish with a next step.' : '')); sessions[k] = null; },
        onModeChange: function(m){ if(root.getAttribute('data-mode') === 'done') return; setState(root, m.mode === 'speaking' ? 'speaking' : 'listening', m.mode === 'speaking' ? L.who + ' is talking.' : 'Your turn.'); },
        onMessage: function(msg){ if(msg && msg.message) line(root, msg.source === 'user' ? 'you' : 'them', msg.message); },
        onError: function(e){ fallback(root, 'The conversation dropped.'); }
      }).then(function(conv){ sessions[k] = conv; });
    }).catch(function(err){
      var why = err && err.message === 'nomic' ? 'This browser has no microphone access.' : err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') ? 'The microphone was not allowed.' : 'Live practice could not start here.';
      fallback(root, why);
    });
  }
  function end(root){ var k = root.getAttribute('data-live'); var c = sessions[k]; if(c && c.endSession) c.endSession(); sessions[k] = null; el(root, '[data-live-end]').hidden = true; el(root, '[data-live-start]').hidden = false; if(root.getAttribute('data-mode') !== 'done') setState(root, 'off', 'Ended.'); }
  document.addEventListener('click', function(e){
    var root = e.target.closest('.live'); if(!root) return;
    if(e.target.closest('[data-live-start]') || e.target.closest('[data-live-again]')) start(root);
    else if(e.target.closest('[data-live-end]')) end(root);
  });
  document.addEventListener('chart:page', function(){ Object.keys(sessions).forEach(function(k){ var r = document.querySelector('.live[data-live="' + k + '"]'); if(r && sessions[k]) end(r); }); });
  window.MV_LIVE = { score: function(k, p){ var r = document.querySelector('.live[data-live="' + k + '"]'); if(r) score(r, p); }, LIVE: LIVE };
})();

(function(){
  var box = $('#ideasBox'), status = $('#ideasStatus'); if(!box) return;
  var cur = -1, seen = {}, found = {};
  var names = ['Priorities', 'Clear expectations', 'Psychological safety', 'Purpose', 'The people work'], IDEA_SCN = ['idea1', 'idea2', 'safe1', 'idea4', 'idea5'];
  var ONE = ['Put first things first.', 'Clear is kind. Unclear is unkind.', 'People only speak up when it is safe to.', 'Explain the why, and put the team first.', 'The people work is the manager’s work.'];
  box.innerHTML = '<div class="idea-tabs" role="tablist" aria-label="The five ideas, by topic">' + IDEAS.map(function(it, i){ return '<button type="button" role="tab" aria-selected="false" data-tab="' + i + '">' + (i + 1) + ' · ' + names[i] + (LIVE[IDEA_SCN[i]] ? ' <span class="live-badge">Live</span>' : '') + '</button>'; }).join('') + '</div>' +
    '<div class="idea idea-intro cur" role="region" aria-label="About the five ideas"><span class="who-is">Start here</span><h3>Five ideas that hold <em>up</em>.</h3>' +
      '<div class="intro-copy"><p>You do not need a theory of management. You need a few ideas that hold up, and each one turns into something you can do this week. These five come from people who spent years studying what good managers do.</p>' +
      '<p><b>How this works.</b> Each idea: what it is, one thing to start this week, and a live conversation to practice it. Open the detail if you want the why.</p>' +
      '<p class="intro-cta"><button type="button" class="btn btn-primary btn-sm" data-tab="0">Start with idea 1<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></p></div>' +
      '<ol class="intro-list" aria-label="The five ideas">' + IDEAS.map(function(it, i){ return '<li><button type="button" data-tab="' + i + '"><span class="il-no">' + (i + 1) + '</span><span class="il-t"><b>' + names[i] + (LIVE[IDEA_SCN[i]] ? ' <span class="live-badge">Live conversation</span>' : '') + '</b><span>' + ONE[i] + '</span></span></button></li>'; }).join('') + '</ol></div>' +
    IDEAS.map(function(it, i){
      return '<div class="idea" role="tabpanel" data-i="' + i + '"><span class="who-is">' + esc(it.who) + subBtn('ideas/t' + (i + 1)) + '</span><h3>' + it.h + '</h3>' + (i === 0 ? ROCKS_ART : '') +
        '<div class="idea-core"><p class="blk"><b>What it is</b>' + esc(it.what) + '</p><div class="week"><b>Start this week</b>' + esc(it.week) + '</div></div>' +
        (LIVE[IDEA_SCN[i]] ? liveHTML(IDEA_SCN[i]) : '') +
        '<details class="idea-more"><summary>Why it works, what it looks like, and what it brings</summary><div class="idea-more-grid"><p class="blk"><b>Why adopt it</b>' + esc(it.why) + '</p><p class="blk"><b>What it looks like in practice</b>' + esc(it.looks) + '</p><p class="blk"><b>The value it brings</b>' + esc(it.value) + '</p></div></details>' +
        '<div class="idea-nav">' + (i > 0 ? '<button type="button" class="btn btn-ghost btn-sm" data-prev="1">Back</button>' : '') + (i < IDEAS.length - 1 ? '<button type="button" class="btn btn-primary btn-sm" data-next="1">Next idea<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' : '<span class="hinttxt">All five read. Turn the page for what Vanderbilt will ask of you.</span>') + '</div></div>';
    }).join('');
  function show(i){
    cur = i; seen[i] = 1;
    var intro = box.querySelector('.idea-intro'); if(intro) intro.classList.remove('cur');
    $$('.idea[data-i]', box).forEach(function(p, pi){ p.classList.toggle('cur', pi === i); });
    $$('.idea-tabs button', box).forEach(function(t, ti){ t.setAttribute('aria-selected', ti === i ? 'true' : 'false'); t.classList.toggle('seen', !!seen[ti]); });
    paint();
    if(window.chartPager && window.chartPager.current().key === 'ideas'){ var f = $$('.idea[data-i]', box)[i].querySelector('.idea-nav button'); if(f) f.focus({ preventScroll:true }); }
    narrSub('ideas/t' + (i + 1));
  }
  function paint(){ var n = Object.keys(seen).length, f = Object.keys(found).length; if(status) status.textContent = n + ' of 5 ideas read. ' + f + ' of 5 conversations.' + (n === 5 ? ' Activity complete.' + (f < 5 ? ' The conversations are extra practice, any time.' : '') : ''); if(n === 5) progDone('safe'); }
  $$('.scn[data-scn]', box).forEach(buildScenario);
  window.markIdeaMoment = function(k){ found[k] = 1; paint(); };
  box.addEventListener('click', function(e){
    var fh = e.target.closest('.try.try-fold > .cq-h'); if(fh && !e.target.closest('button')){ fh.parentNode.classList.toggle('open'); return; }
    var b = e.target.closest('.scn button[data-o]'); if(b){ var k = b.closest('.scn').getAttribute('data-scn'); if(SCENARIOS[k].opts[parseInt(b.getAttribute('data-o'), 10)].best){ found[k] = 1; paint(); } return; }
    var t = e.target.closest('button[data-tab]'); if(t){ show(parseInt(t.getAttribute('data-tab'), 10)); return; }
    if(e.target.closest('button[data-next]')){ show(Math.min(Math.max(cur, 0) + 1, IDEAS.length - 1)); return; }
    if(e.target.closest('button[data-prev]')){ show(Math.max(cur - 1, 0)); }
  });
})();


/* ══════════ the four categories: one page, five tabs, each category with its own clip ══════════ */
(function(){
  var box = $('#welcome'); if(!box) return;
  var tabs = $$('.job-tabs button[data-job]', box), panes = $$('.job-pane', box); if(!tabs.length) return;
  var jstatus = $('#fwStatus'), jseen = {}, JOBS = ['task', 'relations', 'change', 'external'];
  function mark(k){
    if(JOBS.indexOf(k) < 0 || jseen[k]) return;
    jseen[k] = 1; var n = Object.keys(jseen).length;
    if(jstatus) jstatus.textContent = n + ' of 4 categories opened.' + (n === JOBS.length ? ' Activity complete.' : '');
    if(n === JOBS.length) progDone('welcome');
  }
  function show(k){
    mark(k);
    tabs.forEach(function(t){ var on = t.getAttribute('data-job') === k; t.setAttribute('aria-selected', on ? 'true' : 'false'); if(on) t.classList.add('seen'); });
    panes.forEach(function(p){ var on = p.getAttribute('data-job') === k; p.classList.toggle('cur', on); p.hidden = !on; });
    var pg = document.querySelector('.page.cur'); if(pg) pg.scrollTop = 0;
    if(k !== 'over' && NARR[k + '/1']) narrSub(k + '/1'); else if(narr.playing) narrStop();
  }
  box.addEventListener('click', function(e){
    var t = e.target.closest('.job-tabs button[data-job]');
    if(t) show(t.getAttribute('data-job'));
  });
  window.showJob = show; window.markJob = mark;
})();

/* the overview: a compass rose, one point per category. Tap a point to hear
   that category's intro and see what it asks of you; open it from there. */
(function(){
  var rose = $('#fwRose'), panel = $('#fwPanel'), map = $('#fwMap'), vid = $('#fwVideo'), back = $('#fwBack'); if(!rose || !map) return;
  var PTS = [['task', 'n', 'Task-oriented'], ['relations', 'e', 'Relations-oriented'], ['change', 's', 'Change-oriented'], ['external', 'w', 'External']];
  function roseSVG(){
    var t = '', i;
    for(i = 0; i < 72; i++){ var a = i * 5 * Math.PI / 180, r1 = i % 18 === 0 ? 150 : i % 3 === 0 ? 156 : 160; t += '<line class="tick" x1="' + (200 + Math.sin(a) * r1).toFixed(1) + '" y1="' + (200 - Math.cos(a) * r1).toFixed(1) + '" x2="' + (200 + Math.sin(a) * 165).toFixed(1) + '" y2="' + (200 - Math.cos(a) * 165).toFixed(1) + '"/>'; }
    function pt(ang, len, w, cls, key){ var a = ang * Math.PI / 180, sn = Math.sin(a), c = Math.cos(a), px = -c, py = -sn;
      var tip = [200 + sn * len, 200 - c * len], l = [200 + sn * 22 + px * w, 200 - c * 22 + py * w], r = [200 + sn * 22 - px * w, 200 - c * 22 - py * w];
      return '<path class="' + cls + '"' + (key ? ' data-pt="' + key + '"' : '') + ' d="M200 200L' + l.map(function(v){ return v.toFixed(1); }).join(' ') + 'L' + tip.map(function(v){ return v.toFixed(1); }).join(' ') + 'L' + r.map(function(v){ return v.toFixed(1); }).join(' ') + 'Z"/>'; }
    var star = pt(45, 92, 12, 'minor') + pt(135, 92, 12, 'minor') + pt(225, 92, 12, 'minor') + pt(315, 92, 12, 'minor') + pt(0, 140, 22, '', 'n') + pt(90, 140, 22, '', 'e') + pt(180, 140, 22, '', 's') + pt(270, 140, 22, '', 'w');
    return '<svg viewBox="0 0 400 400" aria-hidden="true"><circle class="ring2" cx="200" cy="200" r="178"/><circle class="ring" cx="200" cy="200" r="165"/>' + t + '<g class="star">' + star + '</g><circle class="hub" cx="200" cy="200" r="9"/><text class="hub-text" x="200" y="236">The whole job</text></svg>';
  }
  rose.innerHTML = roseSVG() + '<div role="tablist" aria-label="The four categories">' + PTS.map(function(p, i){ return '<button type="button" role="tab" class="pt ' + p[1] + '" aria-selected="false" data-job="' + p[0] + '" data-nk="welcome/j' + (i + 1) + '">' + p[2] + '</button>'; }).join('') + '</div>';
  var cards = $$('.fw-card[data-job]', map);
  function pick(k){
    var idx = PTS.map(function(p){ return p[0]; }).indexOf(k); if(idx < 0) return;
    $$('.pt', rose).forEach(function(b){ var on = b.getAttribute('data-job') === k; b.setAttribute('aria-selected', on ? 'true' : 'false'); if(on) b.classList.add('seen'); });
    $$('.star path[data-pt]', rose).forEach(function(pth){ pth.classList.toggle('lit', pth.getAttribute('data-pt') === PTS[idx][1]); });
    cards.forEach(function(c){ c.hidden = c.getAttribute('data-job') !== k; });
    if(vid) vid.hidden = true; map.hidden = false;
    narrSub('welcome/j' + (idx + 1), true);
    if(window.markJob) markJob(k);
  }
  rose.addEventListener('click', function(e){ var b = e.target.closest('.pt[data-job]'); if(b) pick(b.getAttribute('data-job')); });
  if(back) back.addEventListener('click', function(){ map.hidden = true; if(vid) vid.hidden = false; $$('.pt', rose).forEach(function(b){ b.setAttribute('aria-selected', 'false'); }); $$('.star path.lit', rose).forEach(function(pth){ pth.classList.remove('lit'); }); if(narr.playing) narrStop(); });
  map.addEventListener('click', function(e){ var b = e.target.closest('.fw-open'); if(b){ e.stopPropagation(); if(window.showJob) showJob(b.getAttribute('data-open')); } });
})();

/* ══════════ next steps: pick one habit; it lands in the message to your manager ══════════ */
(function(){
  var box = $('#habitPick'), p = $('#ns2p'), tell = $('#tellText'), copy = $('#copyTell'); if(!box) return;
  var HABITS = [['Task-oriented', ['Clarifying', 'Planning', 'Monitoring operations', 'Problem solving']], ['Relations-oriented', ['Supporting', 'Developing', 'Recognizing', 'Empowering']],
    ['Change-oriented', ['Advocating change', 'Envisioning change', 'Encouraging innovation', 'Facilitating collective learning']], ['External', ['Networking', 'External monitoring', 'Representing']]];
  box.innerHTML = HABITS.map(function(g){ return '<span class="hp-job">' + g[0] + '</span>' + g[1].map(function(h){ return '<button type="button" data-habit="' + esc(h) + '" aria-pressed="false">' + esc(h) + '</button>'; }).join(''); }).join('');
  var BASE = 'I just finished the Manager Foundations course. The habit I am practicing this week is [habit]. Ask me about it on [date].';
  function paint(h){
    $$('button[data-habit]', box).forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-habit') === h ? 'true' : 'false'); });
    if(!h) return;
    var msg = BASE.replace('[habit]', h.toLowerCase());
    if(p) p.textContent = 'You picked ' + h.toLowerCase() + '. Do it once this week, on purpose, in a meeting you already have.';
    if(tell) tell.textContent = '\u201c' + msg + '\u201d';
    if(copy) copy.setAttribute('data-copytext', msg);
  }
  box.addEventListener('click', function(e){ var b = e.target.closest('button[data-habit]'); if(!b) return; var h = b.getAttribute('data-habit'); set('habit', h); paint(h); });
  paint(get('habit') || '');
})();

/* the results email: name the sender and subject once PCB confirms them (config) */
(function(){ var h = $('#meaEmailHint'), C = window.MV_CONFIG || {}; if(!h) return; if(C.assessmentEmailFrom || C.assessmentEmailSubject) h.textContent = 'Search your inbox for ' + (C.assessmentEmailSubject ? 'the subject \u201c' + C.assessmentEmailSubject + '\u201d' : 'the results message') + (C.assessmentEmailFrom ? ' from ' + C.assessmentEmailFrom : '') + '.'; })();

/* ══════════ who helps you: four tabs, each with what they do, when to contact, how ══════════ */
(function(){
  var box = $('.helpers'); if(!box) return;
  var tiles = $$(':scope > div', box); if(tiles.length < 4) return;
  var C = (window.MV_CONFIG && MV_CONFIG.contacts) || {};
  function link(url, label){ return url ? ' <a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + '</a>' : ''; }
  var H = [
    { does:'The person you report to. Sets direction and priorities for your team, and the first to hear what your team needs.', when:'Every week in your own 1:1, and any time strategy, projects, or priorities shift. Before you say yes to a big request from another office.', how:'Your standing 1:1. A quick message when it cannot wait. Bring the ask and your recommendation.' },
    { does:'Your go-to in PCB for HR issues, concerns, and support. Engagement, culture, and the bigger people questions for your business unit.', when:'When an issue is more than one transaction: a performance pattern, a hard conversation you want to plan, a team dynamic, a change to the team. Not the same-day questions; those go to your HCM.', how:'Email or a meeting request. Your unit’s Engagement Consultant is listed on the PCB site.' + link(C.engagementConsultants, 'Find yours') + ' Say what you have tried so far.' },
    { does:'Embedded in most business units for immediate HR issues: pay, hiring, a performance concern, a policy question, a form you are not sure about.', when:'The same day a question comes up, before you act on your own. Your first call when you are unsure.', how:'Email, a call, or a walk down the hall; most HCMs sit with the business unit.' + link(C.hcm, 'Find yours') + ' Give the facts and what you need by when.' },
    { does:'Time off for health and family, including FMLA, and injuries at work. Eligibility, paperwork, dates, and the workers’ compensation claim.', when:'The same day someone mentions leave, a health or family situation, or gets hurt at work. You never ask for a diagnosis.', how:'FMLA and leave requests go through Origami. Report a workplace injury the same day, then tell your HCM.' + link(C.leave, 'Leave and workers’ comp') },
    { does:'Equal Opportunity and Access takes reports of discrimination, harassment, sexual misconduct, and retaliation.', when:'The same day you see it or hear about it, including a concern about how someone is being treated. You report; you never investigate.', how:'File a report or call EOA.' + link(C.eoa, 'EOA') + ' Tell your HCM you did.' }
  ];
  var tabs = tiles.map(function(t, i){ var ic = t.querySelector('.hic'); return '<button type="button" role="tab" aria-selected="' + (i === 0) + '" data-htab="' + i + '">' + (ic ? ic.outerHTML : '') + '<span>' + esc(t.querySelector('b').textContent) + '</span></button>'; }).join('');
  var panes = tiles.map(function(t, i){ return '<div class="help-pane' + (i === 0 ? ' cur' : '') + '" role="tabpanel"><h4>' + esc(t.querySelector('b').textContent) + subBtn('basics/h' + (i + 1)) + '</h4><div class="help-cols"><div><b>What they do</b><p>' + H[i].does + '</p></div><div><b>When you contact them</b><p>' + H[i].when + '</p></div><div><b>How you contact them</b><p>' + H[i].how + '</p></div></div></div>'; }).join('');
  box.innerHTML = '<span class="mono">Who helps you</span><div class="help-tabs" role="tablist" aria-label="Who helps you">' + tabs + '</div>' + panes;
  box.classList.add('tabbed'); box.removeAttribute('role');
  box.addEventListener('click', function(e){ var t = e.target.closest('button[data-htab]'); if(!t) return; var i = t.getAttribute('data-htab'); $$('button[data-htab]', box).forEach(function(b){ b.setAttribute('aria-selected', b === t ? 'true' : 'false'); }); $$('.help-pane', box).forEach(function(pn, pi){ pn.classList.toggle('cur', String(pi) === i); }); narrSub('basics/h' + (parseInt(i, 10) + 1)); });
})();

/* ══════════ "Your turn": a black callout above every activity, gold check when done ══════════ */
var TURNS = [
  { sel:'#shiftDrill',  prog:'shift',    text:'Sort six things: yours, a team member’s, or another office' },
  { sel:'#ideasBox',    prog:'safe',     text:'Read each idea, then have its conversation' },
  { sel:'#yearPlan',    prog:'year',     text:'Give every responsibility a place in your rhythm' },
  { sel:'#simBox',      prog:null,       text:'Pick a situation' },
  { sel:'#callsDrill',  prog:'calls',    text:'Decide five situations' },
  { sel:'#fwRose',  prog:'welcome', text:'Tap each point of the compass' },
  { sel:'#task .flip-grid',      prog:'task',      text:'Flip each card' },
  { sel:'#relations .flip-grid', prog:'relations', text:'Flip each card' },
  { sel:'#change .flip-grid',    prog:'change',    text:'Flip each card' },
  { sel:'#external .flip-grid',  prog:'external',  text:'Flip each card' },
  { sel:'#jobsCalls',   prog:'yourcall', text:'Have all four conversations' },
  { sel:'#meaChoice',   prog:'survey',   text:'Tap what is true for you' },
  { sel:'#quizBox',     prog:'quiz',     text:'Four of five finishes the course' },
  { sel:'#tell-leader', prog:'nextstep', text:'Copy the message, send it, then mark this done' }
];
function turnHTML(t){ return '<p class="v-task"' + (t.prog ? ' data-task="' + t.prog + '"' : '') + '>' + t.text + '</p>'; }
TURNS.forEach(function(t){
  var els = t.all ? $$(t.sel) : [$(t.sel)].filter(Boolean);
  /* wrap the activity so the callout sits above it without taking a grid cell of its own */
  els.forEach(function(el){ var wrap = document.createElement('div'); wrap.className = 'turn-wrap'; el.parentNode.insertBefore(wrap, el); wrap.innerHTML = turnHTML(t); wrap.appendChild(el);
    if(FLIP_PAGES.indexOf(t.prog) >= 0){ var st = document.createElement('p'); st.className = 'hinttxt flip-status'; st.setAttribute('role', 'status'); st.setAttribute('aria-live', 'polite'); st.textContent = '0 of ' + $$('.flip-btn', el).length + ' cards flipped.'; wrap.appendChild(st); } });
});
function turnDone(k){ $$('.v-task[data-task="' + k + '"]').forEach(function(t){ t.classList.add('done'); }); }
window.turnDone = turnDone;
SECTIONS.forEach(function(s){ if(progIs(s.k)) turnDone(s.k); });

/* ══════════ recommended learning: page strips, the keep-learning page, the situation simulator ══════════ */
(function(){
  var L = window.MV_LEARN || [], T = window.MV_LEARN_TOPICS || [], byId = {};
  L.forEach(function(it){ byId[it.id] = it; });
  var MODS = {}; try{ (window.MV_PROGRAM.mrc.tracks || []).forEach(function(t){ t.modules.forEach(function(m){ MODS[m.title] = m; }); }); }catch(e){}
  function kind(it){ return it.type === 'oracle' ? 'Oracle Learning' : it.type === 'video' ? 'Video' : it.type === 'podcast' ? 'Podcast' : 'Guide'; }
  function chip(it){ return '<a class="chip-l" href="' + esc(it.url) + '" target="_blank" rel="noopener" title="' + esc(it.why || '') + '"><i>' + kind(it) + '</i>' + esc(it.title) + '</a>'; }
  /* the page */
  var top = $('#learnTop'), grid = $('#learnGrid');
  if(top){
    var courses = L.filter(function(it){ return it.type === 'oracle'; });
    top.innerHTML = '<span class="mono" style="grid-column:1 / -1">' + esc(T[0][1]) + '</span>' + courses.map(function(it, i){ return '<a href="' + esc(it.url) + '" target="_blank" rel="noopener"><span class="no" aria-hidden="true">' + (i + 1) + '</span><i>' + kind(it) + '</i><b>' + esc(it.title) + '</b><small>' + esc(it.why || '') + '</small></a>'; }).join('');
  }
  if(grid){
    var groups = [['podcast', 'Podcasts'], ['video', 'Videos'], ['guide', 'Guides']];
    grid.innerHTML = '<span class="mono">' + esc(T[1][1]) + '</span>' + groups.map(function(g){
      var items = L.filter(function(it){ return it.type === g[0]; });
      if(!items.length) return '';
      return '<div><h4>' + esc(g[1]) + '</h4><ul>' + items.map(function(it){ return '<li><i>' + kind(it) + '</i><a href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.title) + '</a><span>' + esc(it.why || '') + (it.src ? ' (' + esc(it.src) + ')' : '') + '</span></li>'; }).join('') + '</ul></div>';
    }).join('');
  }
  var ltabs = $('.learn-tabs');
  if(ltabs) ltabs.addEventListener('click', function(e){ var t = e.target.closest('button[data-ltab]'); if(!t) return; var k = t.getAttribute('data-ltab'); $$('.learn-tabs button').forEach(function(b){ b.setAttribute('aria-selected', b === t ? 'true' : 'false'); }); $$('.learn-pane').forEach(function(pn){ pn.classList.toggle('cur', pn.getAttribute('data-lpane') === k); }); if(narr.playing) narrStop(); });
  /* the micro modules, by track, from the same program data the dashboard uses */
  var comp = $('#learnComp'), TR = (P && P.mrc && P.mrc.tracks) || [];
  if(comp && TR.length){
    var n = 0, total = TR.reduce(function(a, t){ return a + t.modules.length; }, 0);
    comp.innerHTML = '<span class="mono">Micro Modules</span><h4>Your micro modules, by track</h4><p>Short courses in Oracle Learning, one common task each, in the order the tracks come due. Each opens in Oracle Learning once its link is added.</p>' + TR.map(function(t, ti){
      var by = t.phase === 1 ? 'By Day 30' : 'By Day 60';
      return '<details class="track-acc"' + (ti === 0 ? ' open' : '') + '><summary><span class="mono">' + esc(t.title) + '</span><b>' + esc(t.why) + '</b><span class="tw">' + esc(t.window) + ' &middot; ' + t.modules.length + (t.modules.length === 1 ? ' step' : ' modules') + '</span></summary><p class="out">' + esc(t.outcome) + '</p><div class="comp-grid">' + t.modules.map(function(m){
        n += 1; var has = !!m.oracleUrl;
        return '<a class="comp-item' + (has ? '' : ' soon') + '" href="' + esc(m.oracleUrl || '#') + '"' + (has ? ' target="_blank" rel="noopener"' : ' aria-disabled="true" title="Link coming from PCB"') + '><span class="no">' + n + '</span><span class="ct"><i>' + esc(m.format || 'Video') + ' &middot; Oracle Learning &middot; ' + by + '</i><b>' + esc(m.title) + '</b><small>' + esc(m.desc || '') + '</small></span><span class="go" aria-hidden="true">&#8599;</span></a>';
      }).join('') + '</div></details>';
    }).join('');
  }
  /* simulator */
  var box = $('[data-sim]'), sel = $('#simSel'), out = $('#simOut'), SIM = window.MV_SIM || [];
  if(box && sel && out && SIM.length){
    sel.innerHTML = '<option value="">Choose one&hellip;</option>' + SIM.map(function(s){ return '<option value="' + esc(s.k) + '">' + esc(s.label) + '</option>'; }).join('');
    function show(k){
      var s = SIM.filter(function(x){ return x.k === k; })[0];
      if(!s){ out.classList.remove('show'); out.innerHTML = ''; return; }
      var course = byId[s.oracle], mod = MODS[s.mod];
      out.innerHTML =
        '<div class="s-first"><span class="s-lab">Your first move, today</span><p>' + esc(s.first) + '</p></div>' +
        '<div><span class="s-lab">What it sounds like</span><p>' + esc(s.sounds) + '</p><span class="s-lab" style="margin-top:10px">Then</span><p>' + esc(s.then) + '</p></div>' +
        '<div><div class="s-who"><span class="s-lab">Who handles what</span><ul>' + s.who.map(function(w){ return '<li>' + esc(w) + '</li>'; }).join('') + '</ul></div><div class="s-never" style="margin-top:10px"><span class="s-lab">Never</span><p>' + esc(s.never) + '</p></div></div>' +
        (s.note ? '<p class="s-note">' + esc(s.note) + '</p>' : '');
      out.classList.add('show');
    }
    sel.addEventListener('change', function(){ show(sel.value); });
  }
})();

/* ══════════ module 5: your assessment results → starting point and module order ══════════ */
var CATS = { task:{ name:'Get the work done', short:'Task-oriented' }, relations:{ name:'Take care of your people', short:'Relations-oriented' }, change:{ name:'Make things better', short:'Change-oriented' }, external:{ name:'Connect your team', short:'External' } };
/* Your assessment: review the results email, or take the assessment. One tap marks the activity done. */
(function(){
  var box = $('#meaChoice'), out = $('#meaOut'); if(!box || !out) return;
  var url = (window.MV_CONFIG && MV_CONFIG.assessmentUrl) || '';
  var link = url ? '<a class="btn btn-primary" href="' + esc(url) + '" target="_blank" rel="noopener">Open the assessment</a>' : '<span class="hinttxt">Ask your Engagement Consultant for the assessment link; it takes about ten minutes.</span>';
  var MSG = {
    reviewed:'<h4>Good. Keep the <em>email</em>.</h4><p>It is your starting point. Ninety days after you complete Manager Voyage you rate the same six statements again; the aim is a higher rating, one behavior at a time.</p>',
    retake:'<h4>Take the assessment <em>now</em>.</h4><p>Your results and feedback arrive by email. Keep them; you compare against them ninety days after you complete Manager Voyage.</p><div class="route-act" style="margin-top:12px">' + link + '</div>',
    take:'<h4>Take it before you go <em>further</em>.</h4><p>Six statements, rated from never to consistently, a few minutes. Your results and feedback arrive by email, and you compare against them ninety days after you complete Manager Voyage.</p><div class="route-act" style="margin-top:12px">' + link + '</div>'
  };
  function render(c){ $$('button[data-choice]', box).forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-choice') === c ? 'true' : 'false'); }); out.innerHTML = MSG[c] || ''; }
  box.addEventListener('click', function(e){
    var b = e.target.closest('button[data-choice]'); if(!b) return;
    var c = b.getAttribute('data-choice');
    set('assess', JSON.stringify({ status:c, at:new Date().toISOString() }));
    render(c); progDone('survey');
  });
  window.assessLoad = function(){ var raw = get('assess'); if(!raw) return; try{ var d = JSON.parse(raw); if(d && d.status) render(d.status); }catch(e){} };
  window.assessLoad();
})();

/* ══════════ knowledge check: five questions, one at a time, feedback after each ══════════ */
var QUIZ = [
  { seg:'What changed', q:'You became a manager. What is your job now?', opts:['My own work, done faster','The team’s work, and the people who do it','Whatever my own manager did','Approving things'], a:1, x:'The team’s work and the people who do it. You decide, you approve, and you are responsible for people. Doing everyone’s work is the old job.' },
  { seg:'Five ideas', q:'The rule for expectations and feedback is:', opts:['Praise in public, correct in private','Clear is kind, unclear is unkind','Never give bad news on a Friday','Hint first, so it lands softly'], a:1, x:'Clear is kind. Say the expectation, the deadline, and the feedback plainly and early. Hinting feels polite and leaves people guessing.' },
  { seg:'Five ideas', q:'A team member brings you bad news early. Which response keeps the bad news coming early?', opts:['“Why am I only hearing about this now?”','“Thank you for telling me today. What do you need from me?”','“Let me handle it from here.”','“Bring it to the team meeting.”'], a:1, x:'Thank first, solve second, learn the cause later. Your reaction the first time decides whether you hear the next one early.' },
  { seg:'Who handles what', q:'A team member says their doctor wants them out for three weeks after surgery. What do you do first?', opts:['Approve the time off yourself','Ask what the surgery is for, so you can plan','Send it to the leave office the same day','Tell them to talk to PCB when they are back'], a:2, x:'The leave office, the same day. Anything that sounds like leave goes there; you adjust the work and never ask for a diagnosis.' },
  { seg:'The four categories', q:'Yukl sorts what effective managers do into four categories of behavior. In plain words, which list is right?', opts:['Hire, fire, approve, report','Get the work done; take care of your people; make things better; connect your team','Plan, budget, schedule, present','Whatever your own manager did'], a:1, x:'Task-oriented, relations-oriented, change-oriented, and external: get the work done, take care of your people, make things better, connect your team. Every manager does all four, every week.' }
];/* the right answer sits at a different position on each question */
(function(){ var POS = [0, 2, 3, 1, 2]; QUIZ.forEach(function(q, i){ var t = POS[i]; if(t === undefined || t === q.a || t >= q.opts.length) return; var o = q.opts.splice(q.a, 1)[0]; q.opts.splice(t, 0, o); q.a = t; }); })();

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
/* for tests and the guide builder */
(function(){ var l = document.getElementById('missionLink'); var u = window.MV_CONFIG && window.MV_CONFIG.missionUrl; if(l && u) l.href = u; })();
window.MV_COURSE = { SCENARIOS: SCENARIOS, QUIZ: QUIZ, IDEAS: IDEAS };
/* the big rocks jars: the two photos settle in once the art is on screen */
(function(){
  var art = $('#rocksArt'); if(!art) return;
  if(reduce || !('IntersectionObserver' in window)){ art.classList.add('play'); return; }
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting && e.intersectionRatio > .3){ art.classList.add('play'); io.disconnect(); } }); }, { threshold:[.3] });
  io.observe(art);
})();
/* ══════════ build check: if a newer build is published, say so instead of serving a stale page quietly ══════════ */
(function(){
  var stamp = document.querySelector('.build'); if(!stamp || !window.fetch) return;
  var mine = (stamp.textContent.match(/Build\s+([0-9.a-z]+)/) || [])[1]; if(!mine) return;
  fetch('build.json?ts=' + Date.now(), { cache:'no-store' }).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
    if(!j || !j.build || j.build === mine) return;
    var bar = document.createElement('div'); bar.className = 'build-bar'; bar.setAttribute('role', 'status');
    bar.innerHTML = '<span>A newer version of this course is available (build ' + esc(j.build) + '; you have ' + esc(mine) + ').</span><button type="button" class="btn btn-gold btn-sm" id="buildReload">Reload</button>';
    document.body.appendChild(bar);
    bar.querySelector('#buildReload').addEventListener('click', function(){ var u = new URL(location.href); u.searchParams.set('v', j.build.replace(/\W/g, '')); location.replace(u.toString()); });
  }).catch(function(){});
})();

/* ══════════ up next: one button at the end of every page, so the way forward is never a hunt ══════════ */
(function(){
  var pages = $$('.page'); if(pages.length < 2) return;
  function titleOf(pg){
    var rail = pg.querySelector('.v-rail span'); if(rail){ var t = rail.textContent.split('·'); return (t[t.length - 1] || '').trim(); }
    var h = pg.querySelector('h2, h1'); return h ? h.textContent.replace(/\s+/g, ' ').trim() : 'Next page';
  }
  pages.forEach(function(pg, i){
    if(i === pages.length - 1) return;
    var sec = pg.querySelector('section.v-sec') || pg.querySelector('section'); if(!sec || sec.classList.contains('v-hero')) return;
    var wrap = sec.querySelector('.wrap') || sec;
    var d = document.createElement('div'); d.className = 'v-next';
    d.innerHTML = '<span class="v-label">Up next</span><button type="button" class="btn btn-gold btn-sm" data-go-page="' + (i + 1) + '">' + esc(titleOf(pages[i + 1])) + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>';
    wrap.appendChild(d);
  });
  document.addEventListener('click', function(e){ var b = e.target.closest('button[data-go-page]'); if(b && window.chartPager) chartPager.go(parseInt(b.getAttribute('data-go-page'), 10), { focus:true }); });
})();
})();
