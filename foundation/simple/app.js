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
var KEY = 'mv-fsimple-';
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
try{ var rq = new URLSearchParams(location.search); if(rq.get('reset')){ Object.keys(localStorage).forEach(function(k){ if(k.indexOf(KEY) === 0 || k.indexOf('mv-found-') === 0 || k === 'mv.manager.v1') localStorage.removeItem(k); }); sessionStorage.removeItem('mv-assess-snooze'); rq.delete('reset'); rq.set('v', String(Date.now())); location.replace(location.pathname + '?' + rq.toString() + '#p/home/1'); } }catch(e){}
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
var MEDIA_V = '20261106a';
/* the course videos carry their own narration: nothing else should talk over them, and they should not talk over anything else */
function pauseVideos(){ $$('video').forEach(function(v){ if(v.id !== 'heroVideo' && !v.paused){ try{ v.pause(); }catch(e){} } }); }
function narrPlay(k){
  if(narr.hold){ narr.pending = true; return; }
  k = k || narrKey(); var text = NARR[k];
  narrStop(); pauseVideos();
  if(!text){ toast('No narration on this page.'); return; }
  narr.key = k; narr.playing = true; narrUI();
  var fk = (window.MV_NARR_CLIP && window.MV_NARR_CLIP[k]) || k;
  var a = new Audio('../../assets/audio/foundation-simple/' + fk.replace(/\//g, '-') + '.mp3?v=' + MEDIA_V);
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
if(bbListen) bbListen.addEventListener('click', function(){ if(narr.playing){ narr.on = false; narr.auto = false; set('auto', '0'); narrStop(); narrUI(); toast('Narration off. Tap Listen to turn it back on.'); } else { narr.on = true; narr.auto = true; set('auto', '1'); narrPlay(); } });
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
  { k:'welcome',   no:'05', name:'The Manager Standard',    how:'Open all four expectations' },
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
function progDone(k){ if(progIs(k)) return; progWrite(k, true); progRender(k, true); if(window.turnDone) turnDone(k); try{ document.dispatchEvent(new CustomEvent('mv:prog', { detail:{ key:k } })); }catch(e){} }
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
  ['assess', 'assess-gate', 'assess-answers', 'done-seen', 'week', 'habit', 'plan', 'rhythm'].forEach(function(k){ set(k, null); }); doneSeen = false;
  try{ Object.keys(localStorage).forEach(function(k){ if(k.indexOf(KEY + 'story:') === 0 || k.indexOf('mv-found-live-') === 0) localStorage.removeItem(k); }); sessionStorage.removeItem('mv-assess-snooze'); }catch(e){}
  var mo = $('#meaOut'); if(mo) mo.innerHTML = '';
  progRender();
  if(progStatus) progStatus.textContent = 'Progress reset. 0 of ' + SECTIONS.length + ' activities complete; your starting point is cleared. Reload to start over.';
  window.setTimeout(function(){ var u = new URL(location.href); u.hash = '#p/home/1'; u.searchParams.set('v', String(Date.now())); location.replace(u.toString()); }, 900);
});
if(!store){ var pw = $('#progStorageNote'); if(pw) pw.hidden = false; }

/* ── completion modal (fires once when all thirteen are done) ── */
var doneSeen = get('done-seen') === '1';
var modalReturn = null, modalTimer = null;
function allDone(){
  if(window.MVOracle){
    var qs = get('quiz-score'), qm = get('quiz-max');
    var ACTS2 = ['Confirm with one person, out loud, what they own and by when', 'Thank one person for one specific thing, by name', 'Hold one ten-minute look-back after a piece of work', 'Have coffee with one person your team depends on'], who2 = window.MV_LEARNER || {};
    MVOracle.reportCompletion('MRC-F', { emailSubject:'You finished Manager Foundations', emailHtml:(window.MV_EMAIL ? MV_EMAIL.completion({ name:who2.name, score:qs === null ? undefined : +qs, max:qm === null ? undefined : +qm, action:ACTS2[+get('habit')] || '', week:(window.MV_WEEK ? MV_WEEK.get() : null), assess:(function(){ try{ return JSON.parse(get('assess-answers') || 'null'); }catch(e){ return null; } })(), missed:(function(){ try{ return JSON.parse(get('quiz-missed') || '[]'); }catch(e){ return []; } })(), modules:(function(){ try{ var TR = (window.MV_PROGRAM && MV_PROGRAM.mrc && MV_PROGRAM.mrc.tracks) || []; var out = []; TR.forEach(function(t){ t.modules.forEach(function(mo){ out.push({ title:mo.title, url:mo.oracleUrl || '', track:t.title, by:(t.phase === 1 ? 'by day 30' : 'by day 60') }); }); }); return out; }catch(e){ return []; } })() }) : ''), course: 'Manager Foundations, Course 1: You Are a Manager Now', score: qs === null ? undefined : +qs, max: qm === null ? undefined : +qm, passed: true, note: 'Foundation course complete: every activity done', extra: { assess: (function(){ try{ return JSON.parse(get('assess') || 'null'); }catch(e){ return null; } })(), action: get('habit'), week: (function(){ try{ return JSON.parse(get('week') || 'null'); }catch(e){ return null; } })(), build: (document.querySelector('.build') || {}).textContent || '' } });
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
    var head = '<div class="story-in"><span class="mono">In practice &middot; ' + esc(S.who) + '</span>';
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
/* ══════════ your first year: three taps, then your week ══════════ */
(function(){
  var box = $('#yearWizard'), status = $('#yearStatus'); if(!box) return;
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], DAYF = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], BY = ['MO', 'TU', 'WE', 'TH', 'FR'];
  var W = { n:0, hourly:'', heavy:-2, step:0 };
  try{ var sv = JSON.parse(get('week') || 'null'); if(sv && sv.step === 3) W = sv; }catch(e){}
  function save(){ set('week', JSON.stringify(W)); }
  function ooDays(){ var pref = [1, 3, 2, 0, 4].filter(function(d){ return d !== W.heavy; }); return pref.slice(0, Math.min(W.n > 6 ? 3 : W.n > 2 ? 2 : 1, W.n)).sort(function(a, b){ return a - b; }); }
  function split(){ var days = ooDays(), per = {}, left = W.n; days.forEach(function(d, i){ var c = Math.ceil(left / (days.length - i)); per[d] = c; left -= c; }); return per; }
  function checkDay(){ return W.heavy === 2 ? 3 : 2; }
  function fbDay(){ return W.heavy === 4 ? 3 : 4; }
  function hourly(){ return W.hourly !== 'none'; }
  function hrs(){ var h = W.n * 0.5 + 0.75 + (hourly() ? 0.25 : 0) + 0.25 + 0.8; var r = Math.round(h * 2) / 2; return String(r).replace('.0', ''); }
  function dots(n){ return '<span class="wz-dots" aria-hidden="true">' + [0, 1, 2].map(function(i){ return '<i class="' + (i < n ? 'on' : '') + '"></i>'; }).join('') + '</span>'; }
  function screen(){
    if(W.step === 0) return '<div class="wz-top"><span class="mono">Build my week &middot; 1 of 3</span>' + dots(1) + '</div><h3 class="wz-q">How many people <em>report to you</em>?</h3><p class="wz-hint">Each one gets a 30-minute 1:1 every week. That is the biggest block in your week.</p><div class="wz-opts">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(n){ return '<button type="button" data-n="' + n + '"><strong>' + (n === 10 ? '10+' : n) + '</strong></button>'; }).join('') + '</div>';
    if(W.step === 1) return '<div class="wz-top"><span class="mono">Build my week &middot; 2 of 3</span>' + dots(2) + '</div><h3 class="wz-q">Is anyone on your team <em>hourly</em>?</h3><p class="wz-hint">Hourly staff clock in, so their timecards need your approval every pay period. Salaried staff do not have timecards. Everyone needs time off approved.</p><div class="wz-opts wide">' + [['none', 'No one', 'All salaried. Time off only.'], ['some', 'Some of them', 'A Monday pass covers every pay period'], ['all', 'Everyone', 'A Monday pass covers every pay period']].map(function(x){ return '<button type="button" data-hourly="' + x[0] + '"><strong>' + x[1] + '</strong><small>' + x[2] + '</small></button>'; }).join('') + '</div><div class="wz-foot"><button type="button" class="wz-back" data-step="0">Back</button></div>';
    if(W.step === 2) return '<div class="wz-top"><span class="mono">Build my week &middot; 3 of 3</span>' + dots(3) + '</div><h3 class="wz-q">Which day is already <em>full</em>?</h3><p class="wz-hint">Shifts, clinic, standing meetings. Your 1:1s and the work check stay off it.</p><div class="wz-opts wide">' + DAYS.map(function(d, i){ return '<button type="button" data-heavy="' + i + '"><strong>' + DAYF[i] + '</strong></button>'; }).join('') + '<button type="button" data-heavy="-1"><strong>None</strong><small>Every day is about the same</small></button></div><div class="wz-foot"><button type="button" class="wz-back" data-step="1">Back</button></div>';
    var per = split(), cols = DAYS.map(function(d, i){
      var items = [];
      if(i === 0 && hourly()) items.push('<span>Approve timecards<i>8:30 &middot; 15 min &middot; every Monday</i></span>');
      if(per[i]) items.push('<span>' + per[i] + ' &times; 1:1<i>10:00 &middot; 30 min each</i></span>');
      if(i === checkDay()) items.push('<span>Look at work before it is due<i>2:00 &middot; 45 min</i></span>');
      if(i === fbDay()) items.push('<span>Feedback and thanks<i>3:30 &middot; 15 min &middot; by name</i></span>');
      items.push('<span class="light">Clear what is waiting on you<i>4:30 &middot; 10 min &middot; questions, time off</i></span>');
      return '<div' + (i === W.heavy ? ' class="heavy"' : '') + '><b>' + d + (i === W.heavy ? ' &middot; full' : '') + '</b>' + items.join('') + '</div>';
    }).join('');
    return '<div class="wz-top"><span class="mono">Your week</span><button type="button" class="wz-back" data-step="0">Start over</button></div><p class="wk-total">' + W.n + (W.n === 1 ? ' person' : ' people') + (W.hourly === 'none' ? ', all salaried' : W.hourly === 'all' ? ', all hourly' : ', some hourly') + '. About <b>' + hrs() + ' hours a week</b> on the team. The rest is the work.</p><div class="wk">' + cols + '</div>' +
      '<div class="wk-more"><div><b>Every month</b>First Tuesday, 1 hour: approve expenses, check goals, ask how the work and the team are going.</div><div><b>Every quarter</b>First Wednesday of the quarter, 1 hour: set the next three months with the team.</div></div>' +
      '<div class="wz-foot"><span class="hinttxt">The cycles and the same-day calls are on the left. They happen when they happen.</span><button type="button" class="btn btn-gold btn-sm" data-ics>Add to my calendar</button></div>';
  }
  function render(){ box.innerHTML = screen(); if(status) status.textContent = W.step === 3 ? 'Your week is built. Activity complete.' : 'Three taps. ' + (W.step + 1) + ' of 3.'; }
  function ics(){
    var now = new Date(), L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vanderbilt FLH//Manager Foundations//EN', 'CALSCALE:GREGORIAN'], i = 0;
    function pad(n){ return (n < 10 ? '0' : '') + n; }
    function next(dow){ var d = new Date(now); d.setHours(0, 0, 0, 0); var delta = ((dow + 1) - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + delta); return d; }
    function st(d, h, m){ return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(h) + pad(m) + '00'; }
    function ev(title, dow, h, m, mins, rule, desc){ var d = next(dow), e = new Date(d); e.setHours(h, m + mins); i += 1; L.push('BEGIN:VEVENT', 'UID:mv-week-' + i + '-' + Date.now() + '@vanderbilt.edu', 'DTSTAMP:' + st(now, now.getHours(), now.getMinutes()) + 'Z', 'DTSTART:' + st(d, h, m), 'DTEND:' + st(e, e.getHours(), e.getMinutes()), 'RRULE:' + rule, 'SUMMARY:' + title, 'DESCRIPTION:' + desc, 'END:VEVENT'); }
    var per = split(); Object.keys(per).forEach(function(d){ d = +d; ev('1:1s (' + per[d] + ' x 30 min)', d, 10, 0, 30 * per[d], 'FREQ=WEEKLY;BYDAY=' + BY[d], 'A short 1:1 with each person. The one place people tell you the truth while it is still small.'); });
    ev('Look at work before it is due', checkDay(), 14, 0, 45, 'FREQ=WEEKLY;BYDAY=' + BY[checkDay()], 'What is due this week, and where it stands. Checking work is the job.');
    if(hourly()) ev('Approve timecards', 0, 8, 30, 15, 'FREQ=WEEKLY;BYDAY=MO', 'Hourly staff are paid right only if you approve on time. A Monday pass covers every pay period.');
    ev('Feedback and thanks', fbDay(), 15, 30, 15, 'FREQ=WEEKLY;BYDAY=' + BY[fbDay()], 'One specific thank-you and one piece of feedback, by name.');
    ev('Clear what is waiting on me', 0, 16, 30, 10, 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', 'Questions, time-off requests, and approvals. Nobody waits on you to move.');
    ev('Expenses, goals, and a step back', 1, 13, 0, 60, 'FREQ=MONTHLY;BYDAY=1TU', 'Approve expenses, check goals, ask how the work and the team are going.');
    ev('Quarterly goals with the team', 2, 13, 0, 60, 'FREQ=MONTHLY;INTERVAL=3;BYDAY=1WE', 'Set the next three months with the team.');
    L.push('END:VCALENDAR');
    var blob = new Blob([L.join('\r\n')], { type:'text/calendar' }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'my-manager-week.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
  }
  window.MV_WEEK = { get:function(){ if(W.step !== 3) return null; var per = split(); return { n:W.n, hourly:W.hourly, heavy:W.heavy, hours:hrs(), days:DAYS.map(function(d, i){ var items = []; if(i === 0 && hourly()) items.push('Approve timecards, 8:30, 15 min'); if(per[i]) items.push(per[i] + ' x 1:1, 10:00, 30 min each'); if(i === checkDay()) items.push('Look at work before it is due, 2:00, 45 min'); if(i === fbDay()) items.push('Feedback and thanks, 3:30, 15 min'); items.push('Clear what is waiting on you, 4:30, 10 min'); return { day:DAYF[i], full:i === W.heavy, items:items }; }) }; } };
  box.addEventListener('click', function(e){
    var b;
    if((b = e.target.closest('button[data-n]'))){ W.n = +b.getAttribute('data-n'); W.step = 1; render(); return; }
    if((b = e.target.closest('button[data-hourly]'))){ W.hourly = b.getAttribute('data-hourly'); W.step = 2; render(); return; }
    if((b = e.target.closest('button[data-heavy]'))){ W.heavy = +b.getAttribute('data-heavy'); W.step = 3; save(); render(); progDone('year'); return; }
    if((b = e.target.closest('button[data-step]'))){ W.step = +b.getAttribute('data-step'); render(); return; }
    if(e.target.closest('button[data-ics]')) ics();
  });
  render();
})();
/* ══════════ your call: one scenario, three responses, consequences ══════════ */
/* ══════════ practice it live: a spoken conversation with the character, scored by what you did ══════════
   The character is an ElevenLabs conversational agent. The page starts the session, shows the
   transcript, and the agent calls record_outcome when the talk ends; that payload is the score. */
var LIVE = {
  idea1: { img:'sam', agent:'agent_8001m5ww69zged0tmb479r7kyc9j', who:'Sam', initial:'S', role:'Coordinator on your team', mins:'About three minutes',
    brief:'Monday, 9:00, your one to one with Sam. Forty one emails are waiting and the grant report is due Thursday with no owner. Tell Sam the few things that matter this week, give the report an owner and a date, and keep the meeting about Sam.',
    checks:[['named_priorities', 'You named the few things that matter this week'], ['assigned_report', 'You gave the grant report an owner and a date'], ['asked_what_you_need', 'You asked what Sam needs, and listened'], ['kept_the_one_to_one', 'You kept the one to one about Sam']],
    penalty:['took_report_themselves', 'You took the report on yourself. Doing the work is the old job.'],
    way:'The Vanderbilt way: rocks first. Three named priorities before email, said out loud, with owners. The sand fits around them.', pass:3 },
  idea2: { img:'priya', agent:'agent_8901m5ww6bh9evns857z11cg5g1t', who:'Priya', initial:'P', role:'Analyst on your team', mins:'About three minutes',
    brief:'Priya has rewritten the summary twice. Both times your only feedback was “tighten it up.” It is due tomorrow. Tell her exactly what good looks like, when you need it, and why it matters. Do not rewrite it for her.',
    checks:[['said_what_good_looks_like', 'You said specifically what the summary needs'], ['gave_a_deadline', 'You gave a time it is due'], ['gave_the_why', 'You explained why it matters'], ['stayed_kind', 'You were direct without blaming her']],
    penalty:['rewrote_it_themselves', 'You offered to rewrite it yourself. It ships, Priya learns nothing, and you own every summary from now on.'],
    way:'The Vanderbilt way: clear is kind. What, by when, what good looks like, and why. Said in the 1:1, written in the follow up.', pass:3 },
  safe1: { img:'jordan', agent:'agent_4501m5ww6dq5f69vc8h4zxsev35y', who:'Jordan', initial:'J', role:'Project coordinator on your team', mins:'About three minutes',
    brief:'Jordan comes to you Tuesday with bad news: the vendor slipped and the launch moves a week. She is braced for your reaction. Thank first, find out what we know, ask what she needs, and let her run the recovery.',
    checks:[['thanked_first', 'Your first reaction was thanks, not blame'], ['asked_what_we_know', 'You asked what we know'], ['asked_what_you_need', 'You asked what she needs from you'], ['left_recovery_with_you', 'You left the recovery with her, with your help']],
    penalty:['blamed_first', 'You opened with why am I only hearing about this now. Jordan learned that bad news gets a bad reaction. Next time you hear it later.'],
    way:'The Vanderbilt way: thank first, solve second, learn the cause later. Make the truth cheap to tell.', pass:3 },
  idea4: { img:'alex', agent:'agent_2901m5ww6fg0f03vaprzgycpqs02', who:'Alex', initial:'A', role:'Specialist on your team', mins:'About three minutes',
    brief:'Central is replacing the intake form and Alex has already said here we go again. Explain the why in your own words, say what it fixes, ask what worries Alex, and carry the worries back.',
    checks:[['explained_why', 'You explained why the form is changing'], ['said_what_it_fixes', 'You named what it fixes'], ['asked_what_worries_you', 'You asked what worries Alex, and listened'], ['will_carry_it_back', 'You said you would carry the concerns back']],
    penalty:['joined_the_hallway', 'You joined the hallway. Honest, and it cost the team its manager.'],
    way:'The Vanderbilt way: start with why. People who know the why make good decisions when you are not in the room.', pass:3 },
  idea5: { img:'dev', agent:'agent_8001m5wswdhrej0959pp630zjyza', who:'Dev', initial:'D', role:'Analyst on your team', mins:'About three minutes',
    brief:'Dev has missed two deadlines this month. You asked to see him. Say what you noticed, say what you expect, ask what is in the way, and agree a next step. He answers back. Then you are scored on what you did, not what you picked.',
    checks:[['named_what_noticed', 'You said what you noticed'], ['stated_expectation', 'You said what you expect from now on'], ['asked_what_you_need', 'You asked what was in the way, and listened'], ['agreed_next_step', 'You agreed a concrete next step']],
    penalty:['handed_off_to_pcb', 'You handed it to PCB or your HCM. The people work is your work. PCB shows you how; it does not have the conversation for you.'],
    way:'The Vanderbilt way: say it plainly, early, in private, and ask before you judge. Then call your HCM about how to note it, not whether to have it.', pass:3 },
  task: { img:'priya', agent:'agent_4501m5ww6h0cfdg9f1ny96r43jww', who:'Priya', initial:'P', role:'Analyst who builds the monthly report', mins:'About three minutes',
    brief:'Wednesday. The monthly report is due Friday, nobody has mentioned it in two weeks, and a director just asked you if it is on time. Fifteen minutes with Priya. Check where it stands before you promise anything.',
    checks:[['asked_where_it_stands', 'You asked where the report stands before judging'], ['asked_what_is_blocking', 'You asked what is blocking her, and acted on it'], ['agreed_plan_for_friday', 'You settled a plan for Friday'], ['set_a_regular_check_in', 'You set a regular check in so this never lands on a Wednesday again']],
    penalty:['took_it_over_or_blamed', 'You took the report over or passed the blame down. Checking work is a conversation, not a forwarded email.'],
    way:'The Vanderbilt way: check it, then say it. Look at the work before it is due, and put the check on the calendar.', pass:3 },
  relations: { img:'marcus', agent:'agent_8401m5ww6jprews8b25d3krxyn24', who:'Marcus', initial:'M', role:'One of your strongest people', mins:'About three minutes',
    brief:'Marcus stays after the 1:1: his dad is in and out of the hospital and he might need time off. Listen, help this week, route it to the leave office, and never ask for a diagnosis.',
    checks:[['thanked_you', 'You thanked him for telling you'], ['adjusted_the_work', 'You moved something concrete this week'], ['routed_to_leave_office', 'You routed it to the leave office'], ['reassured_about_your_work', 'You said it does not change how you see his work']],
    penalty:['asked_for_medical_details', 'You asked about the medical side. Never. Warm is right; the diagnosis is not yours to ask for.'],
    way:'The Vanderbilt way: listen, help, and route it. Adjust the load now, start the leave process so options are ready, and leave the medical detail alone.', pass:3 },
  change: { img:'taylor', agent:'agent_2501m5ww6n2nftr9n13bnamz7bkn', who:'Taylor', initial:'T', role:'Senior administrator, speaking for the team', mins:'About three minutes',
    brief:'Central is replacing the travel system in six weeks and the email goes out Tuesday. You chose to tell the team first, in Thursday’s meeting. Taylor speaks for the skeptics. Explain the why, ask what worries them, write it down.',
    checks:[['explained_why_first', 'You explained the why in your own words, first'], ['said_what_it_fixes', 'You said what it fixes'], ['asked_what_worries_you', 'You asked what worries the team, and listened'], ['will_carry_it_back', 'You committed to carry the worries back']],
    penalty:['joined_the_hallway', 'You joined the hallway instead of leading it. Nobody’s concerns will reach the people who can act.'],
    way:'The Vanderbilt way: explain the why before the email lands, ask what worries people, and take it somewhere. Small and weekly is how agility happens.', pass:3 },
  external: { img:'reyes', agent:'agent_7401m5ww6pyqfen820k04vmwvrmr', who:'Director Reyes', initial:'R', role:'Director in another unit', mins:'About three minutes',
    brief:'A director wants a full data reconciliation by Friday for audit prep. Your month end close is the same week. Call back with the numbers, the collision, and options, and ask what the audit actually needs.',
    checks:[['asked_what_you_really_need', 'You asked what the audit actually needs'], ['named_the_teams_constraint', 'You named the month end collision'], ['offered_a_workable_option', 'You offered a workable option'], ['settled_a_commitment', 'You ended with a clear commitment']],
    penalty:['committed_without_checking', 'You said yes without raising the collision. The team works the weekend, and next quarter the director asks again, sooner.'],
    way:'The Vanderbilt way: speak up for your team with the numbers and the options, politely and early. Not a yes you cannot keep, not a no with no reason.', pass:3 }
};

/* ══════════ your world: the same nine conversations, set in the unit you manage ══════════
   The manager picks a world once (saved in this browser). Each live agent receives it as
   dynamic variables (world, team, scene) and plays the scene in that world. The standard
   world is the fictional business office the course was written in. */
var WORLDS = [
  { k:'std', name:'A university business office', team:'a small administrative team in a university department', scenes:{
    idea1:'Forty one emails are waiting and the grant report is due Thursday with no owner.',
    idea2:'The summary is a two page brief for your director, and it has come back twice.',
    safe1:'The software vendor missed its date and the new expense system launch moves a week. Three departments were told it was Monday.',
    idea4:'Central is replacing the intake form your team uses for every request.',
    idea5:'Dev has missed two deadlines on routine reports this month.',
    task:'The monthly report for your director is due Friday. The missing piece is a data extract from Dana in Finance.',
    relations:'Marcus is one of your strongest people.',
    change:'Central is replacing the travel reimbursement system in six weeks.',
    external:'A director in another unit wants a full data reconciliation by Friday for audit prep. Your month end close is the same week.' } },
  { k:'dining', name:'Campus Dining', team:'a dining unit of cooks, servers and a catering lead', scenes:{
    idea1:'Forty one emails are waiting and the Family Weekend catering plan is due Thursday with no owner. Two caterings are on the board this week.',
    idea2:'The summary is the event sheet for Saturday’s donor dinner: headcount, menu and cost for the catering director. It has come back twice.',
    safe1:'The walk-in cooler went down overnight and Saturday’s prep for the donor dinner is lost. Jordan found it at six this morning.',
    idea4:'Central is replacing the catering request form that every event comes in on.',
    idea5:'Dev runs morning prep, and the line has opened late twice this month.',
    task:'The monthly food cost report for the catering director is due Friday. The missing piece is the vendor invoice totals from Dana in Finance.',
    relations:'Marcus is your best line cook, and Saturday is the donor dinner.',
    change:'Central is replacing the food ordering system in six weeks, right before the spring semester opens.',
    external:'The director of Conferences wants a menu cost breakdown for every event this year by Friday. Your month end inventory count is the same week.' } },
  { k:'vuit', name:'VUIT', team:'a technology team of analysts and support technicians', scenes:{
    idea1:'Forty one tickets are waiting and the monthly security patch report is due Thursday with no owner.',
    idea2:'The summary is the incident write up for university leadership after last week’s outage. It has come back twice.',
    safe1:'The migration test failed last night and the cutover has to move a week. Three departments were told it was Monday.',
    idea4:'Central is replacing the ticket intake form every request comes in on.',
    idea5:'Dev has missed two deadlines on the storage migration this month.',
    task:'The monthly service report for the CIO’s office is due Friday. The missing piece is the software license spend from Dana in Finance.',
    relations:'Marcus is your strongest systems engineer, and the migration cutover is in two weeks.',
    change:'Central is replacing the ticketing system in six weeks.',
    external:'A director in Research Administration wants seven systems reconciled by Friday for an audit. Your patch window is the same week.' } },
  { k:'academic', name:'Academic Affairs', team:'program coordinators and an administrative assistant in a dean’s office', scenes:{
    idea1:'Forty one emails are waiting and the spring course schedule is due to the Registrar Thursday with no owner.',
    idea2:'The summary is the program review brief for the dean. It has come back twice.',
    safe1:'The spring schedule went to the Registrar with forty sections missing room assignments, and registration opens Monday.',
    idea4:'The Provost’s office is replacing the course change form.',
    idea5:'Dev has missed two deadlines on catalog updates this month.',
    task:'The monthly enrollment report for the dean is due Friday. The missing piece is the tuition revenue figures from Dana in Finance.',
    relations:'Marcus is your most experienced program coordinator, and advising week starts Monday.',
    change:'The Provost’s office is replacing the faculty travel system in six weeks.',
    external:'A director in the Registrar’s office wants seven years of degree audit data reconciled by Friday. Your grade submission deadline is the same week.' } },
  { k:'student', name:'Student Affairs', team:'residential life coordinators and program staff', scenes:{
    idea1:'Forty one emails are waiting and the move in staffing plan is due Thursday with no owner.',
    idea2:'The summary is an incident report for the Dean of Students about Saturday night in the residence hall. It has come back twice.',
    safe1:'The move in volunteer sign ups were lost when the form reset, and move in is in nine days. Jordan found out this morning.',
    idea4:'Central is replacing the event approval form every student group uses.',
    idea5:'Dev has missed two deadlines on housing assignments this month.',
    task:'The monthly programming report for the Dean of Students is due Friday. The missing piece is the activity fee spending from Dana in Finance.',
    relations:'Marcus is your strongest residential life coordinator, and move in is next week.',
    change:'Central is replacing the housing system in six weeks.',
    external:'A director in Athletics wants every student engagement record reconciled by Friday. Your move in week is the same week.' } },
  { k:'facilities', name:'Facilities', team:'a trades crew and a scheduler', scenes:{
    idea1:'Forty one work requests are waiting and the preventive maintenance plan is due Thursday with no owner.',
    idea2:'The summary is the work order backlog brief for the associate vice chancellor. It has come back twice.',
    safe1:'The chiller parts came in wrong and the building turnover moves a week. Residential Life is expecting the keys Friday.',
    idea4:'Central is replacing the work request form every building uses.',
    idea5:'Dev has missed two deadlines on fire inspections this month.',
    task:'The monthly utilities report for the associate vice chancellor is due Friday. The missing piece is the energy cost figures from Dana in Finance.',
    relations:'Marcus is your best electrician, and the move in turnover is next week.',
    change:'Central is replacing the work order system in six weeks.',
    external:'A director in Residential Life wants every room inspection reconciled by Friday. Your move in turnover is the same week.' } },
  { k:'dar', name:'Development and Alumni Relations', team:'gift officers and an events coordinator', scenes:{
    idea1:'Forty one emails are waiting and the reunion giving report is due Thursday with no owner.',
    idea2:'The summary is the donor briefing for the Vice Chancellor before Thursday’s ask. It has come back twice.',
    safe1:'The appeal mailing went out with the wrong reply envelope, six thousand pieces. Jordan caught it this morning.',
    idea4:'Central is replacing the gift intake form.',
    idea5:'Dev has missed two deadlines on stewardship reports this month.',
    task:'The monthly fundraising report for the Vice Chancellor is due Friday. The missing piece is the gift revenue totals from Dana in Finance.',
    relations:'Marcus is your strongest gift officer, and reunion weekend is in two weeks.',
    change:'Central is replacing the donor database in six weeks.',
    external:'A director in the Chancellor’s office wants every donor record reconciled by Friday before a major ask. Your fiscal year end gift processing is the same week.' } }
];
function worldNow(){ var k = get('world'); return WORLDS.filter(function(w){ return w.k === k; })[0] || WORLDS[0]; }
function worldVars(k){ var w = worldNow(); return { world:w.name, team:w.team, scene:w.scenes[k] || '' }; }
/* what the conversation asks of the manager, after the scene in their world */
var COACH = {
  idea1:'Monday, 9:00, your one to one with Sam. Tell Sam the few things that matter this week, give the work an owner and a date, and keep the meeting about Sam.',
  idea2:'Both times your only feedback was “tighten it up.” It is due tomorrow. Tell Priya exactly what good looks like, when you need it, and why it matters. Do not rewrite it for her.',
  safe1:'Jordan is braced for your reaction. Thank first, find out what we know, ask what she needs, and let her run the recovery.',
  idea4:'Alex has already said here we go again. Explain the why in your own words, say what it fixes, ask what worries Alex, and carry the worries back.',
  idea5:'You asked to see him. Say what you noticed, say what you expect, ask what is in the way, and agree a next step.',
  task:'Nobody has mentioned it in two weeks, and you were just asked if it is on time. Fifteen minutes with Priya. Check where it stands before you promise anything.',
  relations:'He stays after the 1:1: his dad is in and out of the hospital and he might need time off. Listen, help this week, route it to the leave office, and never ask for a diagnosis.',
  change:'The email goes out Tuesday. You chose to tell the team first, in Thursday’s meeting. Taylor speaks for the skeptics. Explain the why, ask what worries them, write it down.',
  external:'Call back with the numbers, the collision, and options, and ask what they actually need.'
};
function worldBrief(k){ return worldVars(k).scene + ' ' + (COACH[k] || ''); }
function worldSelHTML(){ var cur = worldNow().k; return '<div class="live-world"><b class="n" aria-hidden="true">1</b><div><label><span>Pick your world.</span> <small>The character plays the scene in your unit, with your systems and your kind of team.</small></label><select class="world-sel" aria-label="Choose the unit this conversation is set in">' + WORLDS.map(function(w){ return '<option value="' + w.k + '"' + (w.k === cur ? ' selected' : '') + '>' + esc(w.name) + '</option>'; }).join('') + '</select></div></div>'; }
/* the nouns each written situation uses, by world: the same manager moments, in the learner's unit */
var WORLD_NOUNS = {
  std:{ due1:'The grant report your team owns', queue:'emails', report1:'the report', report1cap:'The report', decision1:'the vendor decision', doc2:'Priya’s summary', need2:'the decision on page one, under three hundred words', reader2:'The director', docshort:'summary', bad3:'the software vendor missed its date and the new expense system launch will slip a week', central4:'Central', central4low:'central', form4:'the intake form', why4:'the old form lost a third of requests at the handoff', miss5:'two deadlines this month', wait5:'waiting on data from another team', reportT:'The monthly report', askerT:'A director', askerT2:'the director', extractT:'a Finance extract', roleR:'one of your strongest people', deadR:'the two deadlines you have this week', centralC:'Central', centralClow:'central', systemC:'the travel reimbursement system', askerE:'A director in another unit', askE:'pull a full data reconciliation by Friday for our audit prep', clashE:'month-end close', jobE:'the reconciliation', needE:'three of the seven tables' },
  dining:{ due1:'The catering plan for Family Weekend', queue:'emails', report1:'the catering plan', report1cap:'The catering plan', decision1:'the menu decision', doc2:'Priya’s menu and staffing sheet for the donor dinner', need2:'the headcount, the menu and the cost on page one', reader2:'The catering director', docshort:'event sheet', bad3:'the walk-in cooler went down overnight and Saturday’s prep for the donor dinner is lost', central4:'Central', central4low:'central', form4:'the catering request form', why4:'the old form lost a third of catering requests between the event office and the kitchen', miss5:'two opening deadlines this month', wait5:'waiting on a produce delivery that keeps arriving late', reportT:'The monthly food cost report', askerT:'The catering director', askerT2:'the catering director', extractT:'the vendor invoice totals', roleR:'your best line cook', deadR:'the two catering shifts you have this week', centralC:'Central', centralClow:'central', systemC:'the food ordering system', askerE:'The director of Conferences', askE:'send a menu cost breakdown for every event this year by Friday', clashE:'month end inventory count', jobE:'the cost breakdown', needE:'the ten largest events' },
  vuit:{ due1:'The security patch report', queue:'tickets', report1:'the patch report', report1cap:'The patch report', decision1:'the firewall decision', doc2:'Priya’s incident write up', need2:'the cause and the fix in the first paragraph, under three hundred words', reader2:'University leadership', docshort:'write up', bad3:'the migration test failed last night and the cutover has to move a week', central4:'Central', central4low:'central', form4:'the ticket intake form', why4:'the old form lost a third of tickets at the handoff', miss5:'two deadlines on the storage migration this month', wait5:'waiting on a vendor patch', reportT:'The monthly service report', askerT:'The CIO’s office', askerT2:'the CIO’s office', extractT:'the software license spend', roleR:'your strongest systems engineer', deadR:'the two migration deadlines you have this week', centralC:'Central', centralClow:'central', systemC:'the ticketing system', askerE:'A director in Research Administration', askE:'reconcile seven systems by Friday for an audit', clashE:'patch window', jobE:'the reconciliation', needE:'three of the seven systems' },
  academic:{ due1:'The spring course schedule', queue:'emails', report1:'the schedule', report1cap:'The schedule', decision1:'the room assignment decision', doc2:'Priya’s program review brief', need2:'the recommendation on page one, under three hundred words', reader2:'The dean', docshort:'brief', bad3:'the spring schedule went to the Registrar with forty sections missing room assignments, and registration opens Monday', central4:'The Provost’s office', central4low:'the Provost’s office', form4:'the course change form', why4:'the old form lost a third of course changes between the department and the Registrar', miss5:'two deadlines on catalog updates this month', wait5:'waiting on faculty sign off', reportT:'The monthly enrollment report', askerT:'The dean', askerT2:'the dean', extractT:'the tuition revenue figures', roleR:'your most experienced program coordinator', deadR:'the two catalog deadlines you have this week', centralC:'The Provost’s office', centralClow:'the Provost’s office', systemC:'the faculty travel system', askerE:'A director in the Registrar’s office', askE:'reconcile seven years of degree audit data by Friday', clashE:'grade submission deadline', jobE:'the reconciliation', needE:'the last two years' },
  student:{ due1:'The move in staffing plan', queue:'emails', report1:'the staffing plan', report1cap:'The staffing plan', decision1:'the vendor decision', doc2:'Priya’s incident report about Saturday night in the residence hall', need2:'what happened and what we did on page one, under three hundred words', reader2:'The Dean of Students', docshort:'report', bad3:'the move in volunteer sign ups were lost when the form reset, and move in is in nine days', central4:'Central', central4low:'central', form4:'the event approval form', why4:'the old form lost a third of event requests between the student group and the venue', miss5:'two deadlines on housing assignments this month', wait5:'waiting on roster data from Admissions', reportT:'The monthly programming report', askerT:'The Dean of Students', askerT2:'the Dean of Students', extractT:'the activity fee spending', roleR:'your strongest residential life coordinator', deadR:'the two program nights you have this week', centralC:'Central', centralClow:'central', systemC:'the housing system', askerE:'A director in Athletics', askE:'reconcile every student engagement record by Friday', clashE:'move in week', jobE:'the reconciliation', needE:'the varsity athletes only' },
  facilities:{ due1:'The preventive maintenance plan', queue:'work requests', report1:'the maintenance plan', report1cap:'The maintenance plan', decision1:'the contractor decision', doc2:'Priya’s work order backlog brief', need2:'the ten biggest backlog items on page one, with the cost of each', reader2:'The associate vice chancellor', docshort:'brief', bad3:'the chiller parts came in wrong and the building turnover moves a week', central4:'Central', central4low:'central', form4:'the work request form', why4:'the old form lost a third of work requests between the building and the shop', miss5:'two deadlines on fire inspections this month', wait5:'waiting on parts from the warehouse', reportT:'The monthly utilities report', askerT:'The associate vice chancellor', askerT2:'the associate vice chancellor', extractT:'the energy cost figures', roleR:'your best electrician', deadR:'the two inspections you have this week', centralC:'Central', centralClow:'central', systemC:'the work order system', askerE:'A director in Residential Life', askE:'reconcile every room inspection by Friday', clashE:'move in turnover', jobE:'the reconciliation', needE:'the first year buildings only' },
  dar:{ due1:'The reunion giving report', queue:'emails', report1:'the giving report', report1cap:'The giving report', decision1:'the mailing decision', doc2:'Priya’s donor briefing', need2:'the ask and the three talking points on page one', reader2:'The Vice Chancellor', docshort:'briefing', bad3:'the appeal mailing went out with the wrong reply envelope, six thousand pieces', central4:'Central', central4low:'central', form4:'the gift intake form', why4:'the old form lost a third of gifts between the mailroom and the ledger', miss5:'two deadlines on stewardship reports this month', wait5:'waiting on gift data from Finance', reportT:'The monthly fundraising report', askerT:'The Vice Chancellor', askerT2:'the Vice Chancellor', extractT:'the gift revenue totals', roleR:'your strongest gift officer', deadR:'the two donor visits you have this week', centralC:'Central', centralClow:'central', systemC:'the donor database', askerE:'A director in the Chancellor’s office', askE:'reconcile every donor record by Friday before a major ask', clashE:'fiscal year end gift processing', jobE:'the reconciliation', needE:'the top fifty prospects' }
};
function worldFill(text){ var n = WORLD_NOUNS[worldNow().k] || WORLD_NOUNS.std; return String(text).replace(/\{(\w+)\}/g, function(m, k){ return n[k] !== undefined ? n[k] : (WORLD_NOUNS.std[k] || m); }); }
function worldPaint(){
  var w = worldNow();
  $$('.world-sel').forEach(function(sel){ if(sel.value !== w.k) sel.value = w.k; });
  $$('[data-world-scene]').forEach(function(el){ el.textContent = w.scenes[el.getAttribute('data-world-scene')] || ''; });
  $$('[data-world-brief]').forEach(function(el){ el.textContent = worldBrief(el.getAttribute('data-world-brief')); });
  $$('.scn[data-scn]').forEach(function(el){ if(!el.getAttribute('data-world-built')) return; var fresh = el.cloneNode(false); el.parentNode.replaceChild(fresh, el); buildScenario(fresh); });
}
document.addEventListener('change', function(e){ var sel = e.target.closest && e.target.closest('.world-sel'); if(!sel) return; set('world', sel.value === 'std' ? null : sel.value); worldPaint(); });

function liveHTML(k){
  var L = LIVE[k];
  return '<div class="live" data-live="' + k + '"><div class="live-scene"><div class="live-avatar"><i class="ring r1"></i><i class="ring r2"></i><span>' + (L.img ? '<img src="../../assets/img/foundation/cast/' + L.img + '.webp" alt="" width="128" height="128" decoding="async" onerror="this.remove()" />' : '') + L.initial + '</span></div>' +
    '<div class="live-who"><span class="mono">Practice it live &middot; with ' + esc(L.who) + '</span><h4>Have the conversation. <em>Out loud.</em></h4><p class="live-brief" data-world-brief="' + k + '">' + esc(worldBrief(k)) + '</p>' + worldSelHTML() + '<p class="live-meta">' + esc(L.who) + ', ' + esc(L.role) + ' &middot; ' + esc(L.mins) + ' &middot; Microphone</p></div></div>' +
    '<ol class="live-how" aria-label="How this works"><li><b>2</b>Tap Start and allow the microphone. ' + esc(L.who) + ' speaks first, in your world.</li><li><b>3</b>Talk the way you would at work. Speak naturally, in your own words. There is no script.</li><li><b>4</b>When you are done, say goodbye. You are scored on what you did, not what you picked.</li></ol>' + '<div class="live-ctl"><button type="button" class="btn btn-gold" data-live-start>Start the conversation</button><button type="button" class="btn btn-ghost" data-live-end hidden>End the conversation</button><span class="live-state" role="status" aria-live="polite"></span></div>' +
    '<div class="live-log" aria-live="polite"></div><div class="live-score" hidden></div></div>';
}

var SCENARIOS = {
  idea1: { h:'Priorities · Monday morning', s:'Monday, 8:05. Forty-one {queue}, two marked urgent, and a 1:1 with Sam at 9. {due1} is due Thursday and nobody has started it.', opts:[
    { t:'Clear the inbox first. Then the day is yours.', b:'Sand first', best:false, out:'By ten the inbox is empty, and full again. {report1cap} is still not started and Sam’s 1:1 got moved. The sand went in first, and the big rocks did not fit.' },
    { t:'Write the three things that matter this week, tell the team, then open email.', b:'Big rocks first', best:true, out:'{report1cap} owner named by 8:15, Sam’s 1:1 kept, {decision1} made by noon. The forty-one {queue} fit around them. Most were sand.' },
    { t:'Start {report1} yourself so it is done right.', b:'Doing the work instead of managing it', best:false, out:'{report1cap} gets done and your week does not. The team never learns what mattered, and Sam’s 1:1 slips again.' }
  ]},
  idea2: { h:'Clear expectations · The summary', s:'{doc2} has come back twice. Both times you wrote “looks good, maybe tighten it up a bit?” It is due tomorrow and it is still not what you need.', opts:[
    { t:'“Maybe take one more pass when you get a chance.”', b:'Hinting', best:false, out:'Third draft, same problem. Priya has now spent three days guessing what “tighten” means. Unclear is unkind.' },
    { t:'“It needs {need2}, by three tomorrow. {reader2} only reads the first page.”', b:'Clear is kind', best:true, out:'One draft, done by two. Priya knows what good looks like and why. The next one comes in right the first time.' },
    { t:'Rewrite it yourself tonight and send it.', b:'Doing the work', best:false, out:'It ships. Priya learns nothing, and you now own every {docshort} from here on.' }
  ]},
  safe1: { h:'Psychological safety · Bad news', s:'Jordan tells you on Tuesday that {bad3}. She looks braced for your reaction.', opts:[
    { t:'“Why am I only hearing about this now?”', b:'The reaction that ends early warnings', best:false, out:'A fair question and the wrong first sentence. Jordan learns that bad news gets a bad reaction. Next time you hear it later, or from someone else.' },
    { t:'“Thank you for telling me today. What do we know, and what do you need from me?”', b:'Safe to speak up', best:true, out:'Jordan relaxes and gives you the full picture. Thank first, solve second, learn the cause later. She will bring you the next one earlier.' },
    { t:'“Okay. Let me handle it from here.”', b:'Kind, and it takes the work away', best:false, out:'It sounds supportive, and it tells Jordan she cannot be trusted with the recovery. Ask what she needs and let her run it with your help.' }
  ]},
  idea4: { h:'Purpose · The new form', s:'{central4} is replacing {form4}. You have to tell the team Friday. Two people have already said “here we go again” in the hallway.', opts:[
    { t:'Forward the announcement: “FYI, new form starts Monday.”', b:'The what without the why', best:false, out:'The hallway version wins. The team hears what changed and nobody knows why, so it lands as one more thing done to them.' },
    { t:'“Here is why: {why4}. This fixes that. What worries you about it?”', b:'Start with why', best:true, out:'Still not loved, but understood. Two worries surface that {central4low} had not thought of, and you carry them back. Two people offer to test it early.' },
    { t:'“I do not love it either, but it is what it is.”', b:'Joining the hallway', best:false, out:'Honest, and it costs the team its manager. Nobody’s concerns go anywhere.' }
  ]},
  idea5: { h:'The people work · Missed deadlines', s:'Dev has missed {miss5}. A coworker mentions it in passing. You are new, and you would rather PCB handled it.', opts:[
    { t:'Email your HCM: “Can you talk to Dev about his deadlines?”', b:'Handing off your job', best:false, out:'Your HCM sends it back with one question: have you talked to him? The conversation is yours. PCB shows you how; it does not have it for you.' },
    { t:'Have the conversation this week: what you noticed, what you expect, what he needs. Ask your HCM how to note it.', b:'The people work is your work', best:true, out:'Dev was {wait5} and did not know it mattered to you. Fixed in fifteen minutes. Your HCM coached you on the note in five.' },
    { t:'Wait for the performance review to bring it up.', b:'Letting it grow', best:false, out:'Four more months of missed deadlines, then a review that surprises him. Late feedback is wasted feedback.' }
  ]},
  task: { s:'It is Wednesday. {reportT} your team owns is due Friday. Priya, who builds it, has not mentioned it in two weeks, and you have not asked. {askerT} just emailed you asking whether it will be on time.', opts:[
    { t:'Reply “yes” to {askerT2}, then build the report yourself Thursday night to be sure.', b:'Doing the work instead of managing it', best:false, out:'The report ships. You are now the person who builds it, Priya does not know she was doubted, and next month you are in the same spot. Doing the work is not the job; checking it is.' },
    { t:'Reply “I will confirm today,” then ask Priya in a fifteen-minute check-in where the report stands and what she needs.', b:'Check it, then say it', best:true, out:'Priya is two-thirds done and waiting on {extractT} she asked Dana in Finance for ten days ago. You call Dana in Finance, colleague to colleague, find out what she needs from your team, confirm Friday with {askerT2}, and put the monthly check-in on the calendar for the second week of every month so you never learn this on a Wednesday again.' },
    { t:'Forward the email from {askerT2} to Priya with “Please make sure this is on time.”', b:'The habit', best:false, out:'Priya reads it as blame from two levels up. The report may still ship, but you have clarified nothing (what does “on time” mean, what is blocking her) and you have spent trust. Checking work is a conversation, not a forwarded email.' }
  ]},
  relations: { s:'Marcus, {roleR}, stays after the 1:1 and says: “My dad has been in and out of the hospital. I might need some time off for it, I am not sure yet. I did not want you to think I was slacking.”', opts:[
    { t:'“I am so sorry. Take whatever you need. Just let me know what is going on with him so I can plan around it.”', b:'Listening and helping, but a step too far', best:false, out:'Warm, and it asks for a diagnosis, which you must never do. It also leaves a possible leave request sitting with you instead of with the leave office. The kindness is right; the routing is missing.' },
    { t:'“Thank you for telling me. Let us move {deadR}. I am going to send your situation to the leave office today so the options are ready if you need them, and nothing you told me affects how I see your work.”', b:'Listen, help, and route it', best:true, out:'Marcus has what he needs: the load adjusted now, the leave process started without him having to ask twice, and no request for medical detail. Helping and a duty to route arrived in the same sentence; you handled both.' },
    { t:'“No problem at all. Let me know if it becomes an issue.”', b:'The habit', best:false, out:'Friendly, and nothing changed. The deadlines still stand, the leave request is not routed, and Marcus learns that telling you things does not help. Being pleasant is not helping.' }
  ]},
  change: { s:'{centralC} is replacing {systemC} in six weeks. The announcement email goes out next Tuesday. Your team already hates the idea; two people have said “here we go again” in the hallway.', opts:[
    { t:'Wait for the announcement email and forward it with “FYI, let me know if you have questions.”', b:'The habit', best:false, out:'The team hears about it from {centralClow}, not from you, and the hallway version wins. Forwarding is not explaining the why.' },
    { t:'In Thursday’s team meeting, before the email, explain in your own words why the change is happening and what it fixes, ask what worries them, and write the worries down to take back to {centralClow}.', b:'Explain the why', best:true, out:'The team still does not love it, but they heard the why from you first, their objections went somewhere, and two of them volunteer to test the new system early. Small and weekly is how uncommon agility actually happens.' },
    { t:'Tell the team you also think it is a bad idea, but there is nothing anyone can do.', b:'The opposite of explaining the why', best:false, out:'It feels honest and it costs the team its manager. You have joined the hallway instead of leading it, and nobody’s concerns will reach the people who could act on them.' }
  ]},
  external: { s:'{askerE} emails you Monday: “We need your team to {askE}.” Your team’s own {clashE} is the same week. Doing both is not possible without weekend work.', opts:[
    { t:'Say yes and ask the team to work the weekend. Better not to upset a director.', b:'The habit', best:false, out:'The work ships, the team works the weekend, and next quarter the same director asks again, sooner, because it worked. Absorbing every request is what speaking up replaces.' },
    { t:'Reply the same day with the numbers: the hours {jobE} takes, the {clashE} it collides with, and two options, the part they need most by Friday with the rest the following Wednesday, or all of it with the {clashE} pushed, and ask what they actually need.', b:'Speak up for your team', best:true, out:'They needed {needE} by Friday and did not know the {clashE} was that week. You deliver that Thursday, the rest Wednesday, no weekend. The team saw you defend their month, politely and early.' },
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
  el.setAttribute('data-world-built', worldNow().k);
  el.innerHTML = '<p class="scn-s">' + esc(worldFill(sc.s)) + '</p><div class="scn-opts" role="group" aria-label="Choose your response">' +
    sc.opts.map(function(o, i){ return '<button type="button" data-o="' + i + '" aria-pressed="false"><span class="k" aria-hidden="true">' + String.fromCharCode(65 + i) + '</span><span>' + esc(worldFill(o.t)) + '</span></button>'; }).join('') +
    '</div><div class="scn-out" role="status" aria-live="polite"></div>';
  var out = el.querySelector('.scn-out');
  el.addEventListener('click', function(e){
    var b = e.target.closest('button[data-o]'); if(!b) return;
    var i = parseInt(b.getAttribute('data-o'), 10), o = sc.opts[i];
    tried[i] = 1;
    $$('button[data-o]', el).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    if(o.best) b.classList.add('best-pick');
    var n = Object.keys(tried).length;
    out.innerHTML = '<span class="vtag' + (o.best ? ' best' : '') + '">' + (o.best ? 'The Vanderbilt way: ' : 'Consider: ') + esc(o.b) + '</span><p>' + esc(worldFill(o.out)) + '</p>' +
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
  '<figure class="jar-fig a"><img src="../../assets/img/foundation/jar-sand-first.webp" alt="A glass jar filled with sand, with three large rocks piled on top that do not fit inside" width="1600" height="1200" decoding="async" /><figcaption><b>Sand first</b>Email and small requests go in first. The report, the hire, the 1:1s spill over the top.</figcaption></figure>' +
  '<figure class="jar-fig b"><img src="../../assets/img/foundation/jar-rocks-first.webp" alt="The same jar with the three rocks inside and the sand settled around them, lid resting beside it" width="1600" height="1200" decoding="async" /><figcaption><b>Rocks first</b>Three named priorities go in first. The small things fit in the gaps.</figcaption></figure>' +
  '</div>';
/* ══════════ five ideas, one at a time ══════════ */
var IDEAS = [
  { who:'Setting priorities · the big rocks method', h:'Put first things <em>first</em>.',
    what:'Picture a jar. The rocks are the high-impact work: the report your team owns, the hire, your 1:1s. The sand is the quick, low-value wins: email, small requests. Sand first and the rocks never fit. Rocks first and the sand settles around them.',
    why:'Your calendar fills itself. Requests arrive faster than you can finish them, and the urgent ones are rarely the important ones. Without three named priorities, the loudest request decides for you.',
    looks:'Monday, before email: three lines on a notepad. Said aloud at the huddle, on the calendar by nine. A request lands Wednesday; you ask which rock it moves.',
    value:'A team that knows this week’s three things wastes less, argues less, and finishes more.',
    week:'Write your three big rocks before you open your inbox. Tell your team.', std:'Standard 01 · Get the work done' },
  { who:'Clear expectations and feedback · clear is kind', h:'Clear is kind. Unclear is <em>unkind</em>.',
    what:'Say what you expect, by when, and what good looks like. Give feedback close to the moment, in private, on the specific thing.',
    why:'Hinting feels kind and costs weeks. People guess, redo the work, and hear about the problem late, when it is bigger and harder to fix.',
    looks:'“The summary needs the decision on page one, under three hundred words, by Thursday at three. Here is why.” Said in the 1:1, written in the follow-up.',
    value:'Fewer surprises at the deadline, fewer redo cycles, and a team that always knows where it stands.',
    week:'Say one thing you have been hinting at. Privately, plainly, kindly.', std:'Standard 01 · Get the work done' },
  { who:'Psychological safety', h:'People only speak up when it is <em>safe</em> to.',
    what:'A team’s shared belief that nobody is punished or embarrassed for a question, a mistake, or a disagreement. Not about being nice: about making the truth cheap to tell.',
    why:'Late news is the most expensive kind. A team that fears the reaction hides mistakes until they are big, and stops asking questions before they become errors.',
    looks:'Bad news lands: “Thank you for telling me today. What do we know, and what do you need from me?” A basic question in the meeting gets a straight answer. You say “I got that wrong” out loud.',
    value:'You hear about problems while they are small. The best teams report more mistakes, not fewer, because they catch them early.',
    week:'When someone reports a problem, thank them first. Then solve it.', std:'Standard 02 · Take care of your people' },
  { who:'Purpose · start with why, team first', h:'Explain the why. Take care of the people, and they take care of the <em>work</em>.',
    what:'People do their best work when they know why it matters, not just what to do. A team that feels looked after protects the work and each other.',
    why:'People who know the why make good decisions when you are not in the room. People who only know the what wait for you, or push back in the hallway.',
    looks:'Before you hand out the new form: “Here is why. The old one loses a third of requests at the handoff.” Credit passed down in the team meeting. Blame taken first with your manager.',
    value:'A team that trusts you tells you the truth, stays, and works through the hard weeks with you instead of around you.',
    week:'Explain the why behind one thing you have been asking for.', std:'Standard 03 · Make things better' },
  { who:'The people work · a manager’s core responsibilities', h:'The people work is the manager’s <em>work</em>.',
    what:'Hiring, onboarding, expectations, feedback, performance, time and leave, and hard conversations are the manager’s job, not PCB’s. PCB shows you how.',
    why:'Nothing should wait for someone else to act. Your team gets answers from the person who knows them, and PCB spends its time on the hard cases, not the routine ones.',
    looks:'You hold the 1:1. You give the feedback the week it happened. You send the leave request the same day. You call your HCM when you are unsure, not instead of acting.',
    value:'Problems get handled while they are small, by the person closest to them, and your team knows who its manager is.',
    week:'Find out your HCM’s and your Engagement Consultant’s names, and how to reach them.', std:'Standard 02 and 04 · Your people, your network' }
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
        agentId: L.agent, connectionType: 'webrtc', dynamicVariables: worldVars(k),
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
  var status = $('#ideasStatus'), pages = $$('.idea-page[data-idea]'); if(!pages.length) return;
  var IDEA_SCN = ['idea1', 'idea2', 'safe1', 'idea4', 'idea5'], seen = {};
  pages.forEach(function(pg){
    var i = +pg.getAttribute('data-idea'), it = IDEAS[i];
    pg.innerHTML = '<div class="idea cur"><span class="who-is">' + esc(it.who) + subBtn('ideas/t' + (i + 1)) + '</span>' + (it.std ? '<span class="std-tag">' + esc(it.std) + '</span>' : '') + '<h3>' + it.h + '</h3>' + (i === 0 ? ROCKS_ART : '') +
      '<div class="idea-core"><p class="blk"><b>What it is</b>' + esc(it.what) + '</p><div class="week"><b>Start this week</b>' + esc(it.week) + '</div></div>' +
      '<details class="idea-more"><summary>Why it works, what it looks like, and what it brings</summary><div class="idea-more-grid"><p class="blk"><b>Why adopt it</b>' + esc(it.why) + '</p><p class="blk"><b>What it looks like in practice</b>' + esc(it.looks) + '</p><p class="blk"><b>The value it brings</b>' + esc(it.value) + '</p></div></details></div>';
    pg.setAttribute('data-seen-prog', 'safe');
  });
  /* every live page, here and in Your call, gets its conversation */
  $$('.live-page[data-live-key]').forEach(function(pg){
    var k = pg.getAttribute('data-live-key'); if(!LIVE[k]) return;
    var L = LIVE[k], sc = SCENARIOS[k];
    var head = $$(':scope > h2', pg).map(function(x){ return x.outerHTML; }).join('');
    $$(':scope > .mono, :scope > h2', pg).forEach(function(x){ x.parentNode.removeChild(x); });
    var why = '<p class="v-why">Tap Start and have it out loud: ' + esc(L.who) + ' answers back, in your world.' + (sc ? ' No microphone? Tap the response you would give.' : '') + '</p>';
    pg.insertAdjacentHTML('beforeend', '<div class="v-stage wide-act live-stage"><div class="v-copy">' + head + why + (sc ? '<div class="v-side"><div class="scn" data-scn="' + k + '"></div></div>' : '') + '</div><div class="v-act">' + liveHTML(k) + '</div></div>');
    var el = pg.querySelector('.scn[data-scn]'); if(el) buildScenario(el);
  });
  function paint(){ var n = Object.keys(seen).length; if(status) status.textContent = n + ' of 5 ideas read.' + (n === 5 ? ' Activity complete.' : ''); if(n === 5) progDone('safe'); }
  document.addEventListener('chart:page', function(){
    var pg = document.querySelector('.page.cur'); if(!pg) return;
    var ip = pg.querySelector('.idea-page[data-idea]'); if(ip){ seen[ip.getAttribute('data-idea')] = 1; paint(); }
  });
  window.markIdeaMoment = function(){};
})();

/* pages that count as read when turned: the four expectations */
(function(){
  var seen = {};
  document.addEventListener('chart:page', function(){
    var pg = document.querySelector('.page.cur'); if(!pg) return;
    var el = pg.querySelector('[data-seen-prog="welcome"]'); if(!el) return;
    seen[el.getAttribute('data-job')] = 1; var n = Object.keys(seen).length;
    var st = $('#fwStatus'); if(st) st.textContent = n + ' of 4 expectations opened.' + (n === 4 ? ' Activity complete.' : '');
    if(n === 4) progDone('welcome');
  });
})();

/* ══════════ the standard, articulated: where it comes from and how the ten statements measure it ══════════ */
(function(){
  var C = window.MV_CONFIG || {}, STD = C.standard || [], ST = C.assessmentStatements || [], BEH = C.statementBehaviors || [];
  var src = $('#stdSrcBody'), map = $('#stdMap');
  if(src && STD.length){
    src.innerHTML = '<p class="std-lead">The Vanderbilt Manager Standard is adapted from Gary Yukl’s research on what effective managers actually do. Yukl sorted leadership behavior into four categories with fifteen behaviors inside them. The four expectations are those four categories. The fifteen flip cards are his fifteen behaviors. And each of the ten assessment statements is one of those behaviors, written as something you do in a normal week. When you see your score by expectation, you are seeing yourself against this page.</p>' +
      '<div class="std-tblwrap"><table class="std-table"><thead><tr><th>Expectation</th><th>Yukl’s category</th><th>The behaviors inside it</th><th>The assessment statements that measure it</th></tr></thead><tbody>' +
      STD.map(function(s){ return '<tr><td><b>' + s.n + ' · ' + esc(s.name) + '</b></td><td>' + esc(s.yukl) + '</td><td>' + s.behaviors.map(esc).join('<br>') + '</td><td>' + s.statements.map(function(i){ return ST[i] ? '<b>' + (i + 1) + ' · ' + esc(ST[i][0]) + '</b> <i>measures ' + esc((BEH[i] || '').toLowerCase()) + '</i>' : ''; }).join('<br>') + '</td></tr>'; }).join('') +
      '</tbody></table></div><p class="std-note">' + esc(C.standardSource || '') + '</p>';
  }
  if(map && STD.length){
    map.innerHTML = STD.map(function(s){ return '<div class="sm-grp"><b>' + s.n + ' · ' + esc(s.name) + '</b><span class="sm-y">' + esc(s.yukl) + ' · ' + s.statements.length + ' statements</span><ol>' + s.statements.map(function(i){ return ST[i] ? '<li value="' + (i + 1) + '"><span>' + esc(ST[i][1]) + '</span><i>Measures ' + esc(BEH[i] || ST[i][0]) + '</i></li>' : ''; }).join('') + '</ol></div>'; }).join('');
  }
})();

/* ══════════ the four categories: one page, five tabs, each category with its own clip ══════════ */
(function(){
  var box = $('#welcome'); if(!box) return;
  var tabs = $$('.job-tabs button[data-job]', box), panes = $$('.job-pane', box); if(!tabs.length) return;
  var jstatus = $('#fwStatus'), jseen = {}, JOBS = ['task', 'relations', 'change', 'external'];
  function mark(k){
    if(JOBS.indexOf(k) < 0 || jseen[k]) return;
    jseen[k] = 1; var n = Object.keys(jseen).length;
    if(jstatus) jstatus.textContent = n + ' of 4 expectations opened.' + (n === JOBS.length ? ' Activity complete.' : '');
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
  var PTS = [['task', 'n', '01 · Get the work done'], ['relations', 'e', '02 · Take care of your people'], ['change', 's', '03 · Make things better'], ['external', 'w', '04 · Connect your team']];
  function roseSVG(){
    var t = '', i;
    for(i = 0; i < 72; i++){ var a = i * 5 * Math.PI / 180, r1 = i % 18 === 0 ? 150 : i % 3 === 0 ? 156 : 160; t += '<line class="tick" x1="' + (200 + Math.sin(a) * r1).toFixed(1) + '" y1="' + (200 - Math.cos(a) * r1).toFixed(1) + '" x2="' + (200 + Math.sin(a) * 165).toFixed(1) + '" y2="' + (200 - Math.cos(a) * 165).toFixed(1) + '"/>'; }
    function pt(ang, len, w, cls, key){ var a = ang * Math.PI / 180, sn = Math.sin(a), c = Math.cos(a), px = -c, py = -sn;
      var tip = [200 + sn * len, 200 - c * len], l = [200 + sn * 22 + px * w, 200 - c * 22 + py * w], r = [200 + sn * 22 - px * w, 200 - c * 22 - py * w];
      return '<path class="' + cls + '"' + (key ? ' data-pt="' + key + '"' : '') + ' d="M200 200L' + l.map(function(v){ return v.toFixed(1); }).join(' ') + 'L' + tip.map(function(v){ return v.toFixed(1); }).join(' ') + 'L' + r.map(function(v){ return v.toFixed(1); }).join(' ') + 'Z"/>'; }
    var star = pt(45, 92, 12, 'minor') + pt(135, 92, 12, 'minor') + pt(225, 92, 12, 'minor') + pt(315, 92, 12, 'minor') + pt(0, 140, 22, '', 'n') + pt(90, 140, 22, '', 'e') + pt(180, 140, 22, '', 's') + pt(270, 140, 22, '', 'w');
    return '<svg viewBox="0 0 400 400" aria-hidden="true"><circle class="ring2" cx="200" cy="200" r="178"/><circle class="ring" cx="200" cy="200" r="165"/>' + t + '<g class="star">' + star + '</g><circle class="hub" cx="200" cy="200" r="9"/><text class="hub-text" x="200" y="236">The standard</text></svg>';
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

/* ══════════ who you are: name and Vanderbilt email, so the completion can be recorded ══════════ */
(function(){
  var n = $('#whoName'), e = $('#whoEmail'); 
  var saved = {}; try{ saved = JSON.parse(get('who') || '{}') || {}; }catch(x){}
  function pub(){ window.MV_LEARNER = { name:(n && n.value.trim()) || saved.name || (window.MVScorm && MVScorm.connected && MVScorm.name) || '', email:(e && e.value.trim()) || saved.email || '' }; }
  if(n){ n.value = saved.name || ''; n.addEventListener('input', function(){ saved.name = n.value.trim(); set('who', JSON.stringify(saved)); pub(); }); }
  if(e){ e.value = saved.email || ''; e.addEventListener('input', function(){ saved.email = e.value.trim(); set('who', JSON.stringify(saved)); pub(); }); }
  pub();
})();

/* ══════════ next steps: pick one thing to do this week; it lands in the message to your manager ══════════ */
(function(){
  var box = $('#habitPick'), p = $('#ns2p'), tell = $('#tellText'), copy = $('#copyTell'); if(!box) return;
  var ACTS = [
    { c:'01 · Get the work done', a:'Confirm with one person, out loud, what they own and by when', why:'When people are not sure what is expected, work comes in late and you find out on the due date.', say:'confirm with one person what they own and by when' },
    { c:'02 · Take care of your people', a:'Thank one person for one specific thing, by name', why:'People stay, and do their best work, for a manager who notices them. “Great job everyone” thanks nobody.', say:'thank one person for one specific thing, by name' },
    { c:'03 · Make things better', a:'Hold one ten-minute look-back after a piece of work', why:'Ten minutes on what worked and what did not is how a team stops repeating the same mistake.', say:'hold a ten-minute look-back with the team after a piece of work' },
    { c:'04 · Connect your team', a:'Have coffee with one person your team depends on', why:'Know the people your team needs by name before you need them. New managers do this least.', say:'have coffee with one person my team depends on' }
  ];
  box.innerHTML = ACTS.map(function(x, i){ return '<button type="button" data-act="' + i + '" aria-pressed="false"><b>' + esc(x.c) + '</b><strong>' + esc(x.a) + '</strong><small>' + esc(x.why) + '</small></button>'; }).join('');
  var BASE = 'I just finished the Manager Foundations course. This week I will [action]. Ask me how it went on [date].';
  function paint(i){
    $$('button[data-act]', box).forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-act') === String(i) ? 'true' : 'false'); });
    if(i === '' || i === null || ACTS[i] === undefined) return;
    var x = ACTS[i], msg = BASE.replace('[action]', x.say);
    if(p) p.textContent = 'You picked: ' + x.a.toLowerCase() + '. Do it in a meeting you already have this week.';
    if(tell) tell.textContent = '“' + msg + '”';
    if(copy) copy.setAttribute('data-copytext', msg);
  }
  box.addEventListener('click', function(e){ var b = e.target.closest('button[data-act]'); if(!b) return; var i = +b.getAttribute('data-act'); set('habit', String(i)); paint(i); });
  var sv = get('habit'); paint(sv !== null && /^\d$/.test(sv) ? +sv : '');
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
    { does:'Embedded in most business units. Your HCM helps with seven things:<ol class="help-list"><li>Positions, recruitment, and hiring</li><li>Payroll and timecards</li><li>Assignments</li><li>Leave management, the initial step</li><li>Costing management</li><li>Student and faculty hiring and assignments</li><li>Document records and reporting</li></ol>', when:'The same day a question comes up, before you act on your own. Your first call when you are unsure.', how:'Email, a call, or a walk down the hall; most HCMs sit with the business unit.' + link(C.hcm, 'Find yours') + ' Give the facts and what you need by when.' },
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
  { sel:'#yearWizard',  prog:'year',     text:'Three taps, then add your week to your calendar' },
  { sel:'#simBox',      prog:null,       text:'Pick a situation' },
  { sel:'#callsDrill',  prog:'calls',    text:'Decide five situations' },
  { sel:'#fwRose',  prog:'welcome', text:'Tap each point of the compass' },
  { sel:'#task .flip-grid',      prog:'task',      text:'Flip each card' },
  { sel:'#relations .flip-grid', prog:'relations', text:'Flip each card' },
  { sel:'#change .flip-grid',    prog:'change',    text:'Flip each card' },
  { sel:'#external .flip-grid',  prog:'external',  text:'Flip each card' },
  { sel:'#jobsCalls',   prog:'yourcall', text:'Have all four conversations' },
  { sel:'#meaBox',      prog:'survey',   text:'Take the assessment, or confirm you did' },
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
    comp.innerHTML = TR.map(function(t, ti){
      var by = t.phase === 1 ? 'By Day 30' : 'By Day 60';
      return '<details class="track-acc"><summary><span class="mono">' + esc(t.title) + '</span><b>' + esc(t.why) + '</b><span class="tw">' + esc(t.window) + ' &middot; ' + t.modules.length + (t.modules.length === 1 ? ' step' : ' modules') + '</span></summary><p class="out">' + esc(t.outcome) + '</p><div class="comp-grid">' + t.modules.map(function(m){
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
/* Your assessment page: shows the result when there is one, or offers to take it. */
(function(){
  var box = $('#meaChoice'), out = $('#meaOut'); if(!box || !out) return;
  function render(){
    var rec = null; try{ rec = JSON.parse(get('assess-retake') || get('assess-answers') || 'null'); }catch(e){}
    if(rec && rec.score !== undefined && window.MV_ASSESS){ out.innerHTML = MV_ASSESS.card(rec, rec.phase === 'retake' ? MV_ASSESS.baseline() : null) + '<p class="hinttxt" style="margin-top:12px">Answered in a hurry? <button type="button" class="linkish" data-retake>Take it again</button> and this result is replaced.</p>'; box.hidden = true; var h = $('#meaHead'); if(h) h.innerHTML = rec.phase === 'retake' ? 'Three months on: what <em>moved</em>.' : 'Your score, by <em>category</em>.'; var l = $('#meaLead'); if(l) l.textContent = rec.phase === 'retake' ? 'Your retake beside your starting point.' : 'Your starting point. You take the same ten again three months after you finish.'; return; }
    var st = null; try{ st = JSON.parse(get('assess') || 'null'); }catch(e){}
    box.hidden = false; $$('button[data-choice]', box).forEach(function(b){ b.setAttribute('aria-pressed', st && st.status === b.getAttribute('data-choice') ? 'true' : 'false'); });
    out.innerHTML = st && st.status === 'reviewed' ? '<h4>Good. Keep the <em>email</em>.</h4><p>It is your starting point. Three months after you finish, you rate the same ten statements again.</p>' : '';
  }
  out.addEventListener('click', function(e){ if(e.target.closest('button[data-retake]') && window.MV_ASSESS) MV_ASSESS.open('initial'); });
  box.addEventListener('click', function(e){
    var b = e.target.closest('button[data-choice]'); if(!b) return; var c = b.getAttribute('data-choice');
    if(c === 'open'){ if(window.MV_ASSESS) MV_ASSESS.open('initial'); return; }
    set('assess', JSON.stringify({ status:c, at:new Date().toISOString() })); set('assess-gate', 'done'); render(); progDone('survey');
  });
  window.assessLoad = render;
  document.addEventListener('mv-assessed', render);
  render();
})();

/* ══════════ knowledge check: five questions, one at a time, feedback after each ══════════ */
var QUIZ = [
  { seg:'What changed', q:'You became a manager. What is your job now?', opts:['My own work, done faster','The team’s work, and the people who do it','Whatever my own manager did','Approving things'], a:1, x:'The team’s work and the people who do it. You decide, you approve, and you are responsible for people. Doing everyone’s work is the old job.' },
  { seg:'Five ideas', q:'The rule for expectations and feedback is:', opts:['Praise in public, correct in private','Clear is kind, unclear is unkind','Never give bad news on a Friday','Hint first, so it lands softly'], a:1, x:'Clear is kind. Say the expectation, the deadline, and the feedback plainly and early. Hinting feels polite and leaves people guessing.' },
  { seg:'Five ideas', q:'A team member brings you bad news early. Which response keeps the bad news coming early?', opts:['“Why am I only hearing about this now?”','“Thank you for telling me today. What do you need from me?”','“Let me handle it from here.”','“Bring it to the team meeting.”'], a:1, x:'Thank first, solve second, learn the cause later. Your reaction the first time decides whether you hear the next one early.' },
  { seg:'Who handles what', q:'A team member says their doctor wants them out for three weeks after surgery. What do you do first?', opts:['Approve the time off yourself','Ask what the surgery is for, so you can plan','Send it to the leave office the same day','Tell them to talk to PCB when they are back'], a:2, x:'The leave office, the same day. Anything that sounds like leave goes there; you adjust the work and never ask for a diagnosis.' },
  { seg:'The Manager Standard', q:'The Vanderbilt Manager Standard has four expectations of every manager. Which list is right?', opts:['Hire, fire, approve, report','Get the work done; take care of your people; make things better; connect your team','Plan, budget, schedule, present','Whatever your own manager did'], a:1, x:'Get the work done through your team, take care of your people, make things better, connect your team to Vanderbilt. Fifteen behaviors sit inside the four, the assessment measures them, and every manager meets all four, every week.' }
];/* the right answer sits at a different position on each question */
(function(){ var POS = [0, 2, 3, 1, 2]; QUIZ.forEach(function(q, i){ var t = POS[i]; if(t === undefined || t === q.a || t >= q.opts.length) return; var o = q.opts.splice(q.a, 1)[0]; q.opts.splice(t, 0, o); q.a = t; }); })();

(function(){
  var box = $('#quizBox'), status = $('#quizStatus'), done = $('#quizDone'); if(!box) return;
  var PASS = 4, cur = 0, score = 0, answered = {}, missed = [];
  function render(){
    cur = 0; score = 0; answered = {}; missed = [];
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
    set('quiz-score', String(score)); set('quiz-max', String(QUIZ.length)); set('quiz-missed', JSON.stringify(missed));
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
    if(!answered[i]){ answered[i] = 1; if(ok) score++; else { missed.push(QUIZ[i].seg); } }
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
/* the results and completion emails live in ../assets/js/email.js, shared with the standalone reassessment */

/* ══════════ the assessment: ten statements, scored in four categories, recorded with FLH, emailed, and retaken three months on ══════════ */
(function(){
  var m = $('#assessModal'); if(!m) return;
  var C = window.MV_CONFIG || {}, SCALE = C.assessmentScale || ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], ST = C.assessmentStatements || [], CATS4 = C.assessmentCategories || [], BANDS = C.assessmentBands || [], MOVES = C.assessmentMoves || [];
  var mode = 'initial', ans = {}, loaded = false;
  function assessed(){ try{ var d = JSON.parse(get('assess') || 'null'); if(d && d.status === 'reviewed') return true; }catch(e){} return get('assess-gate') === 'done'; }
  function baseline(){ try{ return JSON.parse(get('assess-answers') || 'null'); }catch(e){ return null; } }
  function score(a){ var cats = CATS4.map(function(c){ var vs = c[1].map(function(i){ return (a[i] || 0) + 1; }); var avg = vs.reduce(function(x, y){ return x + y; }, 0) / vs.length; return { k:c[0], avg:Math.round(avg * 10) / 10, pct:Math.round((avg - 1) / 4 * 100) }; }); var total = ST.reduce(function(t, st, i){ return t + (a[i] || 0) + 1; }, 0); return { score:total, max:ST.length * SCALE.length, categories:cats }; }
  function band(avg){ for(var i = 0; i < BANDS.length; i++){ if(avg >= BANDS[i][0]) return BANDS[i]; } return BANDS[BANDS.length - 1] || [0, '', '']; }
  function card(rec, base){
    var cats = rec.categories || [], hi = cats.slice().sort(function(a, b){ return b.avg - a.avg; })[0], lo = cats.slice().sort(function(a, b){ return a.avg - b.avg; })[0], loIdx = cats.indexOf(lo);
    var when = rec.at ? new Date(rec.at).toLocaleDateString(undefined, { month:'long', day:'numeric', year:'numeric' }) : '';
    var delta = base ? rec.score - base.score : null;
    return '<div class="ar"><div class="ar-top"><span class="ar-score">' + rec.score + '<small>of ' + rec.max + '</small></span><div><h4>' + (rec.phase === 'retake' ? 'Three months on, against the Vanderbilt Manager Standard' : 'Your starting point against the Vanderbilt Manager Standard') + (when ? ' &middot; ' + esc(when) : '') + (delta !== null ? ' <span class="ar-delta' + (delta < 0 ? ' down' : '') + '">' + (delta >= 0 ? '+' : '') + delta + ' since you started</span>' : '') + '</h4><p>' + (hi && lo && hi.avg === lo.avg ? 'All four categories at the same level. Start with: ' + esc(lo.k.toLowerCase()) + '.' : 'Strongest: ' + esc(hi ? hi.k.toLowerCase() : '') + '. Start with: ' + esc(lo ? lo.k.toLowerCase() : '') + '.') + '</p></div></div>' +
      '<ul class="ar-cats">' + cats.map(function(c, i){ var bd = band(c.avg), prev = base && base.categories && base.categories[i]; var d = prev ? Math.round((c.avg - prev.avg) * 10) / 10 : null; var sg = (C.standard || [])[i]; return '<li><span class="ar-l">' + (sg ? esc(sg.n) + ' · ' : '') + esc(c.k) + '</span><span class="ar-v">' + c.avg.toFixed(1) + '<small>of 5</small>' + (d !== null ? '<span class="ar-delta' + (d < 0 ? ' down' : '') + '">' + (d >= 0 ? '+' : '') + d.toFixed(1) + '</span>' : '') + '</span><span class="ar-bar"><i style="width:' + c.pct + '%"></i>' + (prev ? '<em style="left:' + prev.pct + '%" title="Starting point"></em>' : '') + '</span><span class="ar-f"><b>' + esc(bd[1]) + '</b>' + esc(bd[2]) + '</span>' + (sg ? '<small class="ar-st">Statements ' + sg.statements.map(function(k){ return k + 1; }).join(', ') + ': ' + sg.statements.map(function(k){ return (ST[k] || [''])[0].toLowerCase(); }).join(', ') + '. ' + esc(sg.yukl) + '.</small>' : '') + '</li>'; }).join('') + '</ul>' +
      (MOVES[loIdx] ? '<div class="ar-move"><b>Your first move</b>' + esc(MOVES[loIdx]) + '</div>' : '') + '</div>';
  }
  function show(){ narr.hold = true; narr.pending = false; if(narr.playing) narrStop(); m.hidden = false; if(reduce) m.classList.add('open'); else window.requestAnimationFrame(function(){ m.classList.add('open'); }); document.body.classList.add('oracle-open'); }
  function hide(){ m.classList.remove('open'); document.body.classList.remove('oracle-open'); window.setTimeout(function(){ m.hidden = true; }, reduce ? 0 : 260); narr.hold = false; narr.pending = false; narr.on = true; window.setTimeout(function(){ narrPlay(); }, reduce ? 0 : 400); }
  function view(k){ var map = { intro:'gateIntro', form:'gateForm', result:'gateResult' }; ['gateIntro', 'gateForm', 'gateResult'].forEach(function(id){ $('#' + id, m).hidden = id !== map[k]; }); m.scrollTop = 0; var el = $({ intro:'#assessStart', form:'#gateName', result:'#assessContinue' }[k], m); if(el) el.focus(); }
  var q = $('#gateQ', m), send = $('#assessSend', m), nameEl = $('#gateName', m), mailEl = $('#gateEmail', m);
  function build(){
    if(loaded) return; loaded = true;
    var STD = C.standard || [], BEH = C.statementBehaviors || [];
    q.innerHTML = ST.map(function(st, i){ var g = STD.filter(function(s){ return s.statements[0] === i; })[0]; return (g ? '<li class="gate-grp"><b>Expectation ' + esc(g.n) + ' &middot; ' + esc(g.name) + '</b><span>' + esc(g.yukl) + ' &middot; ' + g.statements.length + ' statements</span></li>' : '') + '<li><b>' + (i + 1) + ' &middot; ' + esc(st[0]) + (BEH[i] ? ' &middot; measures ' + esc(BEH[i].toLowerCase()) : '') + '</b><p>' + esc(st[1]) + '</p><div class="scale" role="group" aria-label="' + esc(st[0]) + '">' + SCALE.map(function(l, j){ return '<button type="button" data-q="' + i + '" data-v="' + j + '" aria-pressed="false">' + esc(l) + '</button>'; }).join('') + '</div></li>'; }).join('');
    var who = {}; try{ who = JSON.parse(get('who') || '{}') || {}; }catch(e){}
    nameEl.value = who.name || (window.MVScorm && MVScorm.connected && MVScorm.name) || ''; mailEl.value = who.email || '';
    q.addEventListener('click', function(e){ var b = e.target.closest('button[data-q]'); if(!b) return; var i = b.getAttribute('data-q'); ans[i] = +b.getAttribute('data-v'); $$('button[data-q="' + i + '"]', q).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); ready(); });
    nameEl.addEventListener('input', ready); mailEl.addEventListener('input', ready);
  }
  function ready(){ var n = Object.keys(ans).length, ok = n === ST.length && nameEl.value.trim() && /@/.test(mailEl.value); send.disabled = !ok; send.textContent = n < ST.length ? 'See my results (' + n + ' of ' + ST.length + ' answered)' : ok ? 'See my results' : 'Add your name and Vanderbilt email'; }
  function open(k){
    mode = k || 'initial'; ans = {}; build(); $$('button[data-q]', q).forEach(function(x){ x.setAttribute('aria-pressed', 'false'); }); ready();
    if(mode === 'retake'){ $('#gateKicker', m).textContent = 'Three months on'; $('#assessTitle', m).innerHTML = 'Rate the same ten statements <em>again</em>.'; $('#gateIntroText', m).textContent = 'Answer for how you work now, not how you want to. You see your result beside your starting point, and a copy goes to you by email.'; $('#assessDone', m).hidden = true; $('#assessLater', m).textContent = 'Not now'; $('#gateFormKicker', m).textContent = 'Manager Effectiveness Assessment · three months on'; }
    show(); view('intro');
  }
  function finish(){
    var sc = score(ans), rec = { phase:mode, name:nameEl.value.trim(), email:mailEl.value.trim(), at:new Date().toISOString(), answers:ST.map(function(st, i){ return { n:i + 1, k:st[0], v:ans[i] + 1, label:SCALE[ans[i]] }; }), score:sc.score, max:sc.max, categories:sc.categories };
    var base = mode === 'retake' ? baseline() : null;
    set(mode === 'retake' ? 'assess-retake' : 'assess-answers', JSON.stringify(rec));
    set('assess', JSON.stringify({ status:'reviewed', phase:mode, at:rec.at, score:rec.score, max:rec.max })); set('assess-gate', 'done');
    var who = {}; try{ who = JSON.parse(get('who') || '{}') || {}; }catch(e){} who.name = rec.name; who.email = rec.email; set('who', JSON.stringify(who)); window.MV_LEARNER = { name:rec.name, email:rec.email };
    var n = $('#whoName'), e2 = $('#whoEmail'); if(n && !n.value) n.value = rec.name; if(e2 && !e2.value) e2.value = rec.email;
    var lo = rec.categories.slice().sort(function(a, b){ return a.avg - b.avg; })[0];
    var sent = window.MVOracle && MVOracle.send({ event:'assessment', phase:mode, course:'Manager Foundations, Course 1: You Are a Manager Now', name:rec.name, email:rec.email, at:rec.at, score:rec.score, max:rec.max, categories:rec.categories, answers:rec.answers, prior:base ? { at:base.at, score:base.score, categories:base.categories } : null, feedback:rec.categories.map(function(c){ var bd = band(c.avg); return { k:c.k, label:bd[1], line:bd[2] }; }), move:MOVES[rec.categories.indexOf(lo)] || '', page:location.href.split('#')[0], emailSubject:(mode === 'retake' ? 'Your Manager Effectiveness Assessment, three months on' : 'Your Manager Effectiveness Assessment results'), aiPrompt:('Write a short personal note, three sentences, plain and warm, no headings, no bullet points, no exclamation marks, from People, Culture and Belonging at Vanderbilt University to ' + rec.name.split(' ')[0] + ', a manager who just rated themselves on the Manager Effectiveness Assessment' + (mode === 'retake' ? ' for the second time, three months after a course' : ' before starting a course') + '. Scores are 1 to 5 by category: ' + rec.categories.map(function(c){ return c.k + ' ' + c.avg.toFixed(1); }).join(', ') + (base ? '. Three months ago: ' + base.categories.map(function(c){ return c.k + ' ' + c.avg.toFixed(1); }).join(', ') : '') + '. Their individual answers, never to always: ' + rec.answers.map(function(a){ return a.k + ': ' + a.label; }).join('; ') + '. Name one specific strength from the answers and one specific thing to do this week, in the voice of a supportive colleague. Do not mention scores or numbers.'), emailHtml:MV_EMAIL.assessment({ phase:mode, name:rec.name, score:rec.score, max:rec.max, categories:rec.categories, feedback:rec.categories.map(function(c){ var bd = band(c.avg); return { k:c.k, label:bd[1], line:bd[2] }; }), move:MOVES[rec.categories.indexOf(lo)] || '' }, base) });
    $('#gateResultBody', m).innerHTML = card(rec, base);
    $('#gateResultKicker', m).textContent = mode === 'retake' ? 'Your results, three months on' : 'Your results';
    $('#gateResultFine', m).textContent = sent ? 'A copy is on its way to ' + rec.email + '. Your results also live on the Your assessment page in this course.' : 'Your results live on the Your assessment page in this course.';
    try{ document.dispatchEvent(new CustomEvent('mv-assessed')); }catch(e){}
    progDone('survey'); view('result');
  }
  $('#assessStart', m).addEventListener('click', function(){ view('form'); });
  $('#assessBack', m).addEventListener('click', function(){ view('intro'); });
  $('#assessDone', m).addEventListener('click', function(){ set('assess-gate', 'done'); hide(); });
  $('#assessLater', m).addEventListener('click', function(){ try{ sessionStorage.setItem('mv-assess-snooze', '1'); }catch(e){} hide(); });
  send.addEventListener('click', finish);
  $('#assessContinue', m).addEventListener('click', hide);
  document.addEventListener('keydown', function(e){ if(!m.hidden && e.key === 'Escape'){ try{ sessionStorage.setItem('mv-assess-snooze', '1'); }catch(e2){} hide(); } });
  window.MV_ASSESS = { open:open, card:card, baseline:baseline }; if(window.assessLoad) assessLoad();
  var qs = null; try{ qs = new URLSearchParams(location.search); }catch(e){}
  var snoozed = false; try{ snoozed = sessionStorage.getItem('mv-assess-snooze') === '1'; }catch(e){}
  if(qs && qs.get('reassess')){ location.replace('../reassess/' + location.search); return; }
  else if(!assessed() && !snoozed){ open('initial'); }
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
    var h = pg.querySelector('h2, h1');
    if(!h){ var i = $$('.page').indexOf(pg), d = $$('#bbDots .bb-dot')[i]; var nm = d ? (d.getAttribute('data-name') || '').split(' \u00b7 ').slice(1).join(' \u00b7 ') : ''; return nm || 'Next page'; }
    var c = h.cloneNode(true); $$('.mono, small, .kicker', c).forEach(function(k){ k.remove(); });
    return c.textContent.replace(/\s+/g, ' ').trim() || 'Next page';
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

/* ══════════ growth: one frame, two maps; tap a site for its card and clip ══════════ */
(function(){
  var sec = $('#growth'); if(!sec) return;
  var CT = {
    nyc:{ name:'Vanderbilt NYC', focus:'New York City, NY', narr:'mission/g1', why:'It takes Vanderbilt to students and employers in New York, with an undergraduate semester and a master’s in business and technology.', line:'Vanderbilt’s first campus beyond Nashville, open since August 2026: 13 buildings on 2.7 acres in Chelsea, with an undergraduate semester program and a Master of Science in Business and Technology.', meet:'Any service a student or colleague in New York needs from Nashville.', url:'https://www.vanderbilt.edu/nyc/' },
    wpb:{ name:'Vanderbilt WPB', focus:'West Palm Beach, FL', narr:'mission/g2', why:'It grows graduate education in business, engineering, data science, and AI, the fields that drive the prosperity the Industry Vision is about.', line:'A graduate campus for business, engineering, data science, and AI, with programs planned in finance and in space and defense technology: about 1,000 graduate students and 100 faculty.', meet:'The programs, hiring, and systems built for a second home.', url:'https://www.vanderbilt.edu/chancellor/initiatives-and-outreach/growth/west-palm-beach/' },
    sf:{ name:'Vanderbilt SF', focus:'San Francisco, CA', narr:'mission/g3', why:'It joins art and design with engineering and AI, alongside the technology and creative sectors.', line:'Opens for the 2027 to 2028 school year on the California College of the Arts campus, home to the Huang College of Art, Architecture and Design, which blends art and design with engineering and AI: about 1,000 students.', meet:'Partnerships with the technology and creative sectors.', url:'https://www.vanderbilt.edu/chancellor/initiatives-and-outreach/growth/san-francisco/' },
    chattanooga:{ name:'Quantum Innovation', focus:'Chattanooga, TN', narr:'mission/g4', why:'It puts Vanderbilt research at the front of quantum technology, with access no other U.S. site offers.', line:'The Institute for Quantum Innovation, launched with EPB in July 2026: about 250 researchers, faculty, and staff, working with the first U.S. site with commercial access to both a trapped-ion quantum computer and a quantum network.', meet:'Research administration and partnerships across Tennessee.', url:'https://www.vanderbilt.edu/chancellor/initiatives-and-outreach/growth/quantum-innovation/' },
    nashville:{ name:'Nashville', focus:'Home', narr:'mission/g5', why:'Every growth site runs on the systems and people built here.', line:'Home since 1873: the residential campus and the heart of the university.', meet:'Every day. The back office Nashville already has is what each new site needs on day one.', url:'https://www.vanderbilt.edu/' }
  };
  var f = $('.lr-compare', sec), fr = $('.cmp-frame', f), r = $('.cmp-range', f), chips = $('.v-cities', sec), card = $('#cityCard'), task = $('.v-task', sec), st = $('#growthStatus');
  var seen = {}, sites = ['nyc', 'wpb', 'sf', 'chattanooga'];
  try{ seen = JSON.parse(get('growth-seen') || '{}') || {}; }catch(e){ seen = {}; }
  function setPos(v){
    v = Math.max(0, Math.min(100, v)); fr.style.setProperty('--pos', v + '%'); r.value = v;
    r.setAttribute('aria-valuetext', v < 15 ? f.getAttribute('data-b') : v > 85 ? f.getAttribute('data-a') : 'Both, divided at ' + Math.round(v) + ' percent');
    $$('.cmp-pin', fr).forEach(function(p){ var off = parseFloat(p.getAttribute('data-x')) < v; p.classList.toggle('off', off); p.tabIndex = off ? -1 : 0; p.setAttribute('aria-hidden', off ? 'true' : 'false'); });
    var ta = $('.cmp-tag.a', fr), tb = $('.cmp-tag.b', fr); if(ta) ta.style.opacity = v < 8 ? 0 : ''; if(tb) tb.style.opacity = v > 92 ? 0 : '';
  }
  r.addEventListener('input', function(){ setPos(parseFloat(r.value)); });
  var drag = false;
  function at(e){ var b = fr.getBoundingClientRect(); setPos((e.clientX - b.left) / b.width * 100); }
  fr.addEventListener('pointerdown', function(e){ if(e.target.closest('.cmp-pin')) return; drag = true; try{ fr.setPointerCapture(e.pointerId); }catch(err){} at(e); });
  fr.addEventListener('pointermove', function(e){ if(drag) at(e); });
  fr.addEventListener('pointerup', function(){ drag = false; });
  $$('[data-cmp]', f).forEach(function(b){ b.addEventListener('click', function(){ setPos(parseFloat(b.getAttribute('data-cmp'))); }); });
  setPos(100);
  function paint(){ var n = sites.filter(function(k){ return seen[k]; }).length; if(st) st.textContent = n + ' of 4 growth sites seen.' + (n === 4 ? ' Activity complete.' : ''); if(n === 4 && task) task.classList.add('done'); }
  function show(k){
    var c = CT[k]; if(!c) return;
    if(parseFloat(r.value) > 0) setPos(0);
    seen[k] = 1; set('growth-seen', JSON.stringify(seen));
    $$('.cmp-pin', fr).forEach(function(p){ p.classList.toggle('on', p.getAttribute('data-city') === k); });
    $$('button[data-city]', chips).forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-city') === k ? 'true' : 'false'); });
    card.innerHTML = '<span class="v-label">' + esc(c.focus) + '</span><b>' + esc(c.name) + '</b><p><b class="lr-meet">Why here.</b> ' + esc(c.why) + '</p><p>' + esc(c.line) + '</p><p><b class="lr-meet">Where you meet it.</b> ' + esc(c.meet) + '</p><a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.name) + ' at vanderbilt.edu</a>';
    narrSub(c.narr);
    paint();
  }
  chips.addEventListener('click', function(e){ var b = e.target.closest('button[data-city]'); if(b) show(b.getAttribute('data-city')); });
  fr.addEventListener('click', function(e){ var p = e.target.closest('.cmp-pin'); if(p) show(p.getAttribute('data-city')); });
  paint();
})();

/* ══════════ the compass: "Open this expectation" turns to that expectation's page; the status counts the points opened ══════════ */
(function(){
  if(!$('#fwRose')) return;
  var st = $('#fwStatus'), seen = {};
  window.markJob = function(k){ if(seen[k]) return; seen[k] = 1; var n = Object.keys(seen).length; if(st) st.textContent = n + ' of 4 expectations opened.' + (n === 4 ? ' Activity complete.' : ''); };
  window.showJob = function(k){
    var pages = $$('.page'), i;
    for(i = 0; i < pages.length; i++){ if(pages[i].querySelector('.job-pane[data-job="' + k + '"]')){ if(window.chartPager) chartPager.go(i, { focus:true }); return; } }
  };
})();

/* ══════════ for you as a manager: one line per page, after the why line ══════════ */
(function(){
  var FOR = window.MV_FOR_YOU || {}; if(!window.chartPager) return;
  var dots = $$('#bbDots .bb-dot');
  $$('.page').forEach(function(pg, i){
    var href = dots[i] ? dots[i].getAttribute('href') : ''; var k = href.replace(/^#p\//, ''); var t = FOR[k]; if(!t || k === 'modules/1') return;
    var el = document.createElement('p'); el.className = 'v-for'; el.innerHTML = '<b>For you as a manager</b><span>' + esc(t) + '</span>';
    var ip = pg.querySelector('.idea-page'), aside = pg.querySelector('.sp-aside'), why = pg.querySelector('.v-why'), h = pg.querySelector('h2, h1');
    var wk = ip && ip.querySelector('.idea-core > .week'), fws = pg.querySelector('#fwStatus'), lv = pg.querySelector('.live-stage > .v-act');
    if(fws) fws.insertAdjacentElement('afterend', el); else if(lv) lv.appendChild(el); else if(aside) aside.insertAdjacentElement('afterbegin', el); else if(wk){ var wrap = document.createElement('div'); wk.parentNode.insertBefore(wrap, wk); wrap.appendChild(wk); wrap.appendChild(el); } else if(ip) ip.insertAdjacentElement('afterbegin', el); else if(why) why.insertAdjacentElement('afterend', el); else if(h) h.insertAdjacentElement('afterend', el);
  });
})();

/* ══════════ the course guide: a chat panel on every page that answers about the course and its content ══════════ */
(function(){
  var AGENT = 'agent_4601m6rpzdvjf8r98d8attr55cnk', SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client/+esm';
  var fab = document.createElement('button'); fab.type = 'button'; fab.id = 'guideFab'; fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'guidePanel'); fab.setAttribute('aria-label', 'Ask Compass, the course guide');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/><path d="M9 12h6M9 9h4"/></svg><span>Ask Compass</span>';
  var panel = document.createElement('aside'); panel.id = 'guidePanel'; panel.hidden = true; panel.setAttribute('aria-label', 'Compass, the course guide');
  panel.innerHTML = '<div class="g-head"><span class="mono">Compass &middot; your course guide</span><b>Ask about the course, or this page.</b><button type="button" class="g-close" aria-label="Close the guide">&times;</button></div>' +
    '<div class="g-log" aria-live="polite"></div><p class="g-state" role="status"></p>' +
    '<form class="g-form"><input type="text" class="g-in" placeholder="Type a question&hellip;" aria-label="Your question" autocomplete="off" maxlength="500" /><button type="submit" class="btn btn-gold btn-sm">Send</button></form>' +
    '<div class="g-tips"><button type="button" data-q="What does this page mean for me as a manager?">What does this page mean for me?</button><button type="button" data-q="Who do I call about a leave request?">Who do I call about leave?</button><button type="button" data-q="How does the assessment work?">How does the assessment work?</button></div>';
  document.body.appendChild(fab); document.body.appendChild(panel);
  var log = panel.querySelector('.g-log'), state = panel.querySelector('.g-state'), form = panel.querySelector('.g-form'), input = panel.querySelector('.g-in');
  var conv = null, starting = null, pending = [];
  function pageName(){ var c = window.chartPager ? chartPager.current() : null; var pg = document.querySelector('.page.cur'); return (pg && pg.getAttribute('aria-label')) || (c ? c.key : 'the course'); }
  function say(who, text){ var d = document.createElement('p'); d.className = 'g-line ' + who; d.innerHTML = '<b>' + (who === 'you' ? 'You' : 'Compass') + '</b>' + esc(text); log.appendChild(d); log.scrollTop = log.scrollHeight; }
  function status(t){ state.textContent = t || ''; }
  function open(){ panel.hidden = false; fab.setAttribute('aria-expanded', 'true'); document.body.classList.add('guide-open'); input.focus(); if(!conv && !starting) connect(); }
  function close(){ panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); document.body.classList.remove('guide-open'); }
  function connect(){
    status('Connecting…');
    starting = import(SDK).then(function(mod){
      var Conversation = mod.Conversation || (mod.default && mod.default.Conversation); if(!Conversation) throw new Error('nosdk');
      return Conversation.startSession({
        agentId: AGENT, connectionType: 'websocket', textOnly: true,
        dynamicVariables: { page: pageName() },
        onConnect: function(){ status(''); pending.splice(0).forEach(function(t){ send(t); }); },
        onDisconnect: function(){ conv = null; status('Compass stepped away. Send a message to reconnect.'); },
        onMessage: function(m){ if(m && m.message && m.source !== 'user') say('guide', m.message); },
        onError: function(){ conv = null; status('Compass could not connect. Try again in a moment.'); }
      });
    }).then(function(c){ conv = c; starting = null; return c; }).catch(function(){ starting = null; conv = null; status('Compass is not available in this browser right now.'); });
    return starting;
  }
  function send(text){
    if(!text) return;
    if(conv && conv.sendUserMessage){ try{ conv.sendUserMessage(text); }catch(e){ status('Could not send that. Try again.'); } return; }
    pending.push(text); if(!starting) connect();
  }
  form.addEventListener('submit', function(e){ e.preventDefault(); var t = input.value.trim(); if(!t) return; say('you', t); input.value = ''; send(t); });
  panel.addEventListener('click', function(e){ var q = e.target.closest('button[data-q]'); if(q){ var t = q.getAttribute('data-q'); say('you', t); send(t); return; } if(e.target.closest('.g-close')) close(); });
  fab.addEventListener('click', function(){ if(panel.hidden) open(); else close(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !panel.hidden) close(); });
  /* the guide follows the learner from page to page */
  document.addEventListener('chart:page', function(){ if(conv && conv.sendContextualUpdate){ try{ conv.sendContextualUpdate('The learner is now on the page: ' + pageName()); }catch(e){} } });
})();

/* ══════════ modules: seven, one at a time; finish one and the next opens ══════════ */
(function(){
  if(!window.chartPager) return;
  var MODULES = [
    { title:'The mission', secs:['mission'], mins:5, forYou:'Why the work matters when your team asks, and where your team sits in a university that works from five cities.' },
    { title:'What changed, and what a manager is', secs:['shift', 'basics'], mins:10, forYou:'The one shift that makes you a manager, three questions every week, and the five people who help you.' },
    { title:'Five ideas', secs:['ideas'], mins:15, forYou:'Five ideas that hold up in every unit, each with a move for this week and a conversation to practice it.' },
    { title:'Your first year, and who handles what', secs:['year', 'calls'], mins:10, forYou:'The whole job by how often it comes up, and the four doors for anything that lands on your desk.' },
    { title:'The Vanderbilt Manager Standard', secs:['welcome'], mins:20, forYou:'The four expectations your assessment measures and your manager looks for, with a habit drill for each.' },
    { title:'Your call: four conversations', secs:['yourcall'], mins:15, forYou:'Four situations from your first year, in your own unit, out loud or in writing.' },
    { title:'Your assessment, quick check and next steps', secs:['survey', 'quiz', 'nextstep', 'learn'], mins:15, forYou:'Your starting point against the standard, five questions, one action this week, and what to take next.', needs:'quiz' }
  ];
  var dots = $$('#bbDots .bb-dot'), keys = dots.map(function(d){ return d.getAttribute('href').replace(/^#p\//, ''); });
  var secOf = function(i){ return (keys[i] || '').split('/')[0]; };
  var modOf = function(i){ var sec = secOf(i); for(var m = 0; m < MODULES.length; m++){ if(MODULES[m].secs.indexOf(sec) >= 0) return m; } return -1; };
  var landing = keys.indexOf('modules/1');
  MODULES.forEach(function(m){ m.pages = []; keys.forEach(function(k, i){ if(m.secs.indexOf(k.split('/')[0]) >= 0) m.pages.push(i); }); });
  var seen = {}, done = {};
  try{ seen = JSON.parse(get('mod-seen') || '{}') || {}; }catch(e){ seen = {}; }
  try{ done = JSON.parse(get('mod-done') || '{}') || {}; }catch(e){ done = {}; }
  /* reviewers: ?unlock=all opens every module in this browser; ?unlock=off restores the path */
  try{ var u = new URLSearchParams(location.search).get('unlock'); if(u === 'all') set('unlock', 'all'); else if(u === 'off') set('unlock', null); }catch(e){}
  function bypass(){ return get('unlock') === 'all'; }
  function isDone(m){ return !!done[m]; }
  function isOpen(m){ return bypass() || m === 0 || isDone(m - 1); }
  function seenCount(m){ return MODULES[m].pages.filter(function(i){ return seen[keys[i]]; }).length; }
  function complete(m){ var M = MODULES[m]; return seenCount(m) === M.pages.length && (!M.needs || progIs(M.needs)); }
  function save(){ set('mod-seen', JSON.stringify(seen)); set('mod-done', JSON.stringify(done)); }
  function firstOpen(){ for(var m = 0; m < MODULES.length; m++){ if(!isDone(m)) return m; } return MODULES.length - 1; }
  function render(){
    var grid = $('#modGrid'), st = $('#modStatus'); if(!grid) return;
    grid.innerHTML = MODULES.map(function(M, m){
      var open = isOpen(m), dn = isDone(m), n = seenCount(m), total = M.pages.length;
      var cls = dn ? 'done' : !open ? 'locked' : n > 0 ? 'now' : 'open';
      var pill = dn ? 'Complete' : !open ? 'Locked' : n > 0 ? n + ' of ' + total + ' pages' : 'Start';
      return '<li><button type="button" class="mod-card ' + cls + '" data-mod="' + m + '"' + (open ? '' : ' aria-disabled="true"') + '>' +
        '<span class="mod-no"><span>Module ' + (m + 1) + '</span><span class="pill">' + pill + '</span></span>' +
        '<h3>' + esc(M.title) + '</h3><p>' + esc(M.forYou) + '</p>' +
        '<span class="mod-meta">About ' + M.mins + ' minutes &middot; ' + total + ' pages' + (M.needs === 'quiz' ? ' &middot; four of five on the quick check' : '') + '</span>' +
        '<span class="mod-bar" aria-hidden="true"><i style="width:' + Math.round((dn ? total : n) / total * 100) + '%"></i></span>' +
        (!open ? '<svg class="mod-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>' : '') +
        '</button></li>';
    }).join('');
    if(st){ var nd = MODULES.filter(function(M, m){ return isDone(m); }).length; var f = firstOpen();
      st.textContent = nd === MODULES.length ? 'All seven modules complete.' : nd + ' of 7 complete. ' + (seenCount(f) > 0 ? 'Module ' + (f + 1) + ' is in progress: ' + seenCount(f) + ' of ' + MODULES[f].pages.length + ' pages.' : 'Module ' + (f + 1) + ' is ready.') + (bypass() ? ' Reviewer view: every module is open.' : ''); }
  }
  function checkDone(m, quiet){
    if(m < 0 || isDone(m) || !complete(m)) return;
    done[m] = 1; save(); render();
    if(!quiet) toast(m < MODULES.length - 1 ? 'Module ' + (m + 1) + ' complete. Module ' + (m + 2) + ' is open.' : 'All seven modules complete.');
  }
  /* the gate: a page in a locked module turns back to the landing page */
  document.addEventListener('chart:page', function(ev){
    var i = ev.detail ? ev.detail.index : chartPager.current().index, m = modOf(i);
    if(m >= 0 && !isOpen(m)){ var f = firstOpen(); window.setTimeout(function(){ chartPager.go(landing); toast('Finish module ' + (f + 1) + ' first.'); }, 0); return; }
    if(m >= 0 && !seen[keys[i]]){ seen[keys[i]] = 1; save(); }
    if(m >= 0) checkDone(m);
    if(i === landing) render();
    paintCount(i, m);
  });
  /* the bottom bar counts pages within the module, not across the course */
  var bbCount = $('#bbCount'), bbSec = $('#bbSec');
  function paintCount(i, m){
    if(!bbCount) return;
    if(m < 0){ bbCount.textContent = i === landing ? '7 modules' : ''; return; }
    var pos = MODULES[m].pages.indexOf(i) + 1, total = MODULES[m].pages.length;
    bbCount.textContent = 'Page ' + pos + ' of ' + total;
    if(bbSec) bbSec.textContent = 'Module ' + (m + 1) + ' \u00b7 ' + (bbSec.getAttribute('data-base') || bbSec.textContent);
  }
  document.addEventListener('chart:page', function(){ if(bbSec && !/^Module \d/.test(bbSec.textContent)) bbSec.setAttribute('data-base', bbSec.textContent); }, true);
  paintCount(chartPager.current().index, modOf(chartPager.current().index));
  /* the quick check can finish the last module after its pages are seen */
  var lastM = MODULES.length - 1;
  document.addEventListener('mv:prog', function(){ checkDone(lastM); });
  $('#modGrid') && $('#modGrid').addEventListener('click', function(e){
    var b = e.target.closest('.mod-card'); if(!b) return;
    var m = parseInt(b.getAttribute('data-mod'), 10);
    if(!isOpen(m)){ toast('Finish module ' + m + ' first.'); return; }
    chartPager.go(MODULES[m].pages[0], { focus:true });
  });
  /* no Up next row on the landing page or a completion page; Start module buttons on the completion pages */
  $$('.page').forEach(function(pg, i){ if(i === landing || pg.querySelector('.mod-end')){ var nx = pg.querySelector('.v-next'); if(nx) nx.parentNode.removeChild(nx); } });
  document.addEventListener('click', function(e){
    var b = e.target.closest('button[data-go-mod]'); if(!b) return;
    var m = parseInt(b.getAttribute('data-go-mod'), 10);
    if(!isOpen(m)){ toast('Finish module ' + m + ' first.'); return; }
    chartPager.go(MODULES[m].pages[0], { focus:true });
  });
  /* the last page of a module turns back to the landing page */
  $$('.v-next button[data-go-page]').forEach(function(b){
    var to = parseInt(b.getAttribute('data-go-page'), 10), from = to - 1;
    if(modOf(from) >= 0 && modOf(to) !== modOf(from)){ b.setAttribute('data-go-page', landing); b.classList.add('back-mods'); b.innerHTML = 'Back to your modules' + b.innerHTML.slice(b.innerHTML.indexOf('<svg')); }
  });
  render();
  window.MV_MODULES = { MODULES: MODULES, isOpen: isOpen, isDone: isDone, render: render };
})();

})();
