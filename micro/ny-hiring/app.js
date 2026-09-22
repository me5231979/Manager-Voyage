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
var KEY = 'mv-nyh-';
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
   Plays ../../assets/audio/ny-hiring/<key>-<n>.mp3, recorded from the exact
   words in narration-scripts.js. There is no synthetic fallback. */
var NARR = window.MV_NARR || {};
var narr = { audio:null, playing:false, key:'', auto: get('auto') !== '0', on: get('auto') !== '0', utter:null };
var narrPos = (function(){ try{ var v = JSON.parse(get('narrpos') || '{}'); return v && typeof v === 'object' ? v : {}; }catch(e){ return {}; } })();
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
var MEDIA_V = '3';
function narrPlay(k){
  k = k || narrKey(); var text = NARR[k];
  narrStop();
  if(!text){ toast('No narration on this page.'); return; }
  narr.key = k; narr.playing = true; narrUI();
  var a = new Audio('../../assets/audio/ny-hiring/' + k.replace(/\//g, '-') + '.mp3?v=' + MEDIA_V);
  a.preload = 'auto';
  a.addEventListener('ended', function(){ if(narr.audio === a){ narr.audio = null; narr.playing = false; delete narrPos[k]; narrPosSave(); narrUI(); } });
  a.addEventListener('error', function(){ if(narr.audio === a){ narr.audio = null; narrSpeak(text); } });
  narr.audio = a;
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
  if(e.target.closest('.scn button[data-o], [data-drill] button, .order-list button, .kq button, .md-btn, .cq-nav button')){ if(narr.playing) narrStop(); }
});
if(narr.auto && window.chartPager) window.setTimeout(function(){ narrPlay(); }, 300);
narrUI();

/* ══════════ PROGRESS ══════════ */
var SECTIONS = [
  { k:'why',       no:'01', name:'Why the rules exist',   how:'Decide three statements' },
  { k:'sequence',  no:'02', name:'The sequence',          how:'Put the six steps in order' },
  { k:'offer',     no:'03', name:'The conditional offer', how:'Find the opening that holds' },
  { k:'salary',    no:'04', name:'Salary history',        how:'Sort six lines: ask or avoid' },
  { k:'interview', no:'05', name:'A fair interview',      how:'Sort six questions: ask or avoid' },
  { k:'yourcall',  no:'06', name:'Your call',             how:'Find the Vanderbilt way in three situations' },
  { k:'quiz',      no:'07', name:'Quick check',           how:'Score 4 of 5' },
  { k:'next',      no:'08', name:'Next steps',            how:'Read the four practices, then mark it done' }
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
  set('quiz-score', null); narrPos = {}; narrPosSave();
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
function allDone(){
  var score = get('quiz-score'), sc = window.MVScorm;
  try{ if(sc && sc.connected){ if(score !== null && sc.score) sc.score(parseInt(score, 10), 5); if(sc.complete) sc.complete(); } }catch(e){}
  try{ if(window.MVOracle && window.MVOracle.reportCompletion) window.MVOracle.reportCompletion('MM-NYH', { score: score ? parseInt(score, 10) : null, max: 5, course: 'Hiring in New York' }); }catch(e){}
  toast('Module complete.');
}

/* ══════════ ask-or-avoid and myth-or-fact drills ══════════ */
var DRILLS = {
  why: { opts:['Myth','Fact'], prog:'why', verb:'decided', items:[
    { s:'A background check is one report that comes back all at once, after the offer.', a:0, x:'Myth. In New York the check runs in two phases: non-criminal checks before any offer, then the criminal check only after a written conditional offer.' },
    { s:'I can ask what a candidate earns now, as long as I do not let it affect the offer.', a:0, x:'Myth. New York Labor Law 194-a forbids the question itself, directly or indirectly, not only its use.' },
    { s:'Asking every candidate the same job-related questions makes the interview fairer and a better predictor of performance.', a:1, x:'Fact. Structured interviews predict performance better than open conversations and narrow the gaps between groups of candidates.' }
  ]},
  salary: { opts:['Ask','Avoid'], prog:'salary', verb:'sorted', items:[
    { s:'&ldquo;What are you earning in your current role?&rdquo;', a:1, x:'Avoid. That is salary history, and the question itself is prohibited.' },
    { s:'&ldquo;What salary are you expecting for this role?&rdquo;', a:0, x:'Ask. Expectations for the new role are allowed, and useful.' },
    { s:'&ldquo;The range for this role is posted. Does that work for you?&rdquo;', a:0, x:'Ask. Sharing the range is allowed, and since 2023 it is in the posting anyway.' },
    { s:'&ldquo;What would it take to match your current package?&rdquo;', a:1, x:'Avoid. It asks for salary history indirectly. Ask what they expect instead.' },
    { s:'&ldquo;Did your last bonus include equity?&rdquo;', a:1, x:'Avoid. Bonus and equity history are compensation history.' },
    { s:'The candidate says &ldquo;I am at eighty-two now.&rdquo; You ask: &ldquo;Is that base or total?&rdquo;', a:1, x:'Avoid. When a candidate volunteers a number, no follow-up questions, and it stays out of the offer discussion.' }
  ]},
  interview: { opts:['Ask','Avoid'], prog:'interview', verb:'sorted', items:[
    { s:'&ldquo;Tell me about a time a deadline moved on a project you owned. What did you do?&rdquo;', a:0, x:'Ask. A behavioral question about the job, asked of every candidate.' },
    { s:'&ldquo;Do you have children, or plan to?&rdquo;', a:1, x:'Avoid. Family status is never a question, however friendly it sounds.' },
    { s:'&ldquo;Are you authorized to work in the United States?&rdquo;', a:0, x:'Ask. Work authorization is a lawful question. Citizenship and origin are not.' },
    { s:'&ldquo;Have you ever been arrested?&rdquo;', a:1, x:'Avoid. Arrests that are not pending, and sealed records, are off limits in New York, and criminal history is Recruiting&rsquo;s process after the conditional offer.' },
    { s:'&ldquo;Walk me through a disagreement with a coworker. How did it end?&rdquo;', a:0, x:'Ask. Job-related, behavioral, and scorable against a rubric.' },
    { s:'&ldquo;You have an accent. Where are you from originally?&rdquo;', a:1, x:'Avoid. National origin. If language matters to the job, ask every candidate the same job-related question about it.' }
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
  var box = $('#orderBox'), status = $('#sequenceStatus'); if(!box) return;
  var STEPS = [
    'Interviews finish. You send your feedback to your recruiter within the agreed timeline.',
    'Your recruiter confirms that Phase 1, the non-criminal checks, is complete, and you agree to move forward.',
    'You extend the conditional verbal offer, using the approved script.',
    'Your recruiter sends the written conditional offer.',
    'Phase 2, the criminal background check, begins.',
    'Onboarding steps finish and the offer becomes final.'
  ];
  var SHOW = [3, 0, 4, 1, 5, 2];   /* a fixed shuffle, so every learner sees the same puzzle */
  var next = 0;
  box.innerHTML = '<p class="o-h"><b>Activity</b>Tap the steps in the order they happen. A wrong tap tells you why.</p><ol class="order-list" aria-label="Steps, in the order shown on screen">' +
    SHOW.map(function(si){ return '<li><button type="button" data-s="' + si + '"><span class="n" aria-hidden="true"></span><span>' + esc(STEPS[si]) + '</span></button></li>'; }).join('') + '</ol>';
  var WHY = [
    'Feedback comes first: your recruiter cannot start Phase 1 until you have aligned on the decision.',
    'Phase 1 has to be confirmed complete before any offer, verbal or written.',
    'The verbal offer comes from you, after Phase 1, before the written one.',
    'The written conditional offer follows your verbal one, from your recruiter.',
    'The criminal check begins only after the written conditional offer is issued.',
    'The offer is final only when the checks and onboarding steps are done.'
  ];
  box.addEventListener('click', function(e){
    var b = e.target.closest('button[data-s]'); if(!b || b.disabled) return;
    var si = parseInt(b.getAttribute('data-s'), 10);
    if(si === next){
      b.classList.add('placed'); b.disabled = true; b.querySelector('.n').textContent = String(next + 1); next++;
      if(status) status.textContent = next < STEPS.length ? 'Right. ' + WHY[si] + ' ' + next + ' of ' + STEPS.length + ' placed.' : 'All six in order. Activity complete.';
      if(next === STEPS.length) progDone('sequence');
    } else {
      b.classList.add('shake'); window.setTimeout(function(){ b.classList.remove('shake'); }, 500);
      if(status) status.textContent = 'Not yet. ' + WHY[si] + ' What happens before it?';
    }
  });
})();

/* ══════════ scenarios: the offer call, and three situations ══════════ */
var SCENARIOS = {
  offer: { s:'Friday, four o’clock. Your recruiter confirmed this morning that Phase 1 is complete, and you have agreed to move forward. You call Dana. How do you open?', opts:[
    { t:'“Great news, the job is yours! HR will send the paperwork Monday.”', b:'A promise, not a conditional offer', best:false, out:'Dana hears a final offer and gives notice on Monday. If Phase 2 changes the outcome, you have withdrawn a job you told her she had. Nothing in that sentence was conditional.' },
    { t:'“We’re excited to extend you a conditional offer, pending successful completion of background checks and final onboarding steps. Your recruiter will follow up with the written offer.”', b:'The script, and nothing added', best:true, out:'Dana knows exactly where she stands: a real offer, conditional on checks that have not run yet, with the written version on its way. Phase 2 can begin once that letter is issued.' },
    { t:'“We’d like to move forward. The background check is just a formality, so feel free to give notice.”', b:'Conditional in name, final in effect', best:false, out:'“Just a formality” and “give notice” undo the word conditional. Dana acts on a promise you were not allowed to make, and the process has a problem before Phase 2 starts.' }
  ]},
  s1: { h:'The competing offer', s:'Tuesday. The interviews went well and the panel is unanimous. Your recruiter says Phase 1 should finish Thursday. The candidate has another offer that expires Wednesday.', opts:[
    { t:'Call today and make the verbal offer. Phase 1 will be done in two days anyway.', b:'Ahead of the process', best:false, out:'An offer before Phase 1 is complete is out of sequence, whatever the pressure. If the checks turned something up, you would be withdrawing an offer you were never cleared to make.' },
    { t:'Call your recruiter today. Explain the deadline, ask whether Phase 1 can finish sooner, and ask them to tell the candidate exactly where things stand.', b:'Speed through the recruiter, not around them', best:true, out:'Phase 1 finishes Wednesday morning. The candidate hears from Recruiting on Tuesday that a decision is close, and takes the call Wednesday afternoon. Same outcome, in the right order.' },
    { t:'Email the candidate: “You are our pick. The formal offer is coming once HR finishes their paperwork.”', b:'An offer in writing, without the words', best:false, out:'That is a written offer, sent before Phase 1, with none of the conditional language. It reads as final, and it is the one document a dispute would quote.' }
  ]},
  s2: { h:'They said the number', s:'Mid-interview, the candidate says: “I am at ninety-two now, so I would need at least that to move.”', opts:[
    { t:'Ask whether that is base only, and what last year’s bonus was.', b:'The follow-up question', best:false, out:'The candidate volunteered a number; the follow-up is you asking for salary history. Both questions are prohibited.' },
    { t:'Say: “Thanks. We set offers on the role and the market, not past pay. The range for this role is posted. What are you expecting?” Leave the number out of your notes.', b:'Redirect to expectations', best:true, out:'The candidate names an expectation, which you may discuss. The ninety-two never enters the offer conversation, and your notes show it.' },
    { t:'Say nothing and note the ninety-two for the offer discussion.', b:'Quiet, and still using it', best:false, out:'Not asking is only half the rule. Using the number to set the offer is the other half, and it is in your notes.' }
  ]},
  s3: { h:'The extra question', s:'In the panel debrief a colleague says: “Solid candidate, but she mentioned a two-year-old, and this role travels. I would score her lower on availability.”', opts:[
    { t:'Agree. Travel is in the job description.', b:'Scoring on a guess', best:false, out:'Travel is in the job description; a child is not evidence about it. The score now rests on family status, which no question was asked about and no candidate was asked equally.' },
    { t:'Say: “The score has to come from the answers to the questions we asked. If travel matters, we ask every candidate the same question about it.” Note the comment for your recruiter.', b:'Back to the scorecard', best:true, out:'The panel rescores from the answers. Recruiting adds a travel question for every remaining candidate, and the comment is on record with the person who needs to know.' },
    { t:'Let it go. It is one panelist’s opinion.', b:'Silence in the room', best:false, out:'One panelist’s opinion became the panel’s score. The candidate was rated on something she was never asked, and nobody said so.' }
  ]}
};
(function(){ var POS = { offer:2, s1:0, s2:2, s3:1 }; Object.keys(POS).forEach(function(k){ var sc = SCENARIOS[k], bi = -1; sc.opts.forEach(function(o, i){ if(o.best) bi = i; }); if(bi < 0 || bi === POS[k]) return; var o = sc.opts.splice(bi, 1)[0]; sc.opts.splice(POS[k], 0, o); }); })();
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
  { seg:'The sequence', q:'When may the criminal background check begin?', opts:['As soon as the interviews end','After the written conditional offer is issued','After the verbal offer, before the written one','Whenever Recruiting has capacity'], a:1, x:'Only after the written conditional offer is issued. Phase 1, the non-criminal checks, must be complete before any offer at all.' },
  { seg:'The conditional offer', q:'Which sentence belongs in a verbal offer?', opts:['“The job is yours.”','“We’re excited to extend you a conditional offer, pending successful completion of background checks and final onboarding steps.”','“The background check is just a formality.”','“You can give notice today.”'], a:1, x:'The approved script, word for word. The other three turn a conditional offer into a promise.' },
  { seg:'Salary history', q:'A candidate volunteers their current salary. You:', opts:['Ask one follow-up to understand it','Use it to set a competitive offer','Ask no follow-ups and leave it out of the offer','Pass it to your recruiter for the offer'], a:2, x:'No follow-up questions, and the number stays out of the offer discussion. Offers come from the role, the market, and internal equity.' },
  { seg:'A fair interview', q:'Which question can you ask?', opts:['“Are you authorized to work in the United States?”','“What year did you finish high school?”','“Have you ever been arrested?”','“What did you earn last year?”'], a:0, x:'Work authorization is lawful. Graduation year points to age, arrests that are not pending are off limits, and pay history is prohibited.' },
  { seg:'A fair interview', q:'After the interviews, your feedback goes to:', opts:['Your recruiter, within the agreed timeline','The candidate directly','Your own manager first','The panel chat, when you get to it'], a:0, x:'Your recruiter, on time. Phase 1 cannot start until you have aligned on the decision, and slow processes lose good candidates.' }
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
(function(){ var C = window.MV_CONFIG || {}; var h = $('#handoutSlot'); if(h && C.nyBackgroundHandoutUrl) h.innerHTML = '<a href="' + esc(C.nyBackgroundHandoutUrl) + '" target="_blank" rel="noopener">Open the handout</a>'; var d = $('#helpdeskLink'); if(d && C.helpdeskUrl) d.href = C.helpdeskUrl; })();

progRender();
window.MV_COURSE = { SCENARIOS: SCENARIOS, QUIZ: QUIZ, DRILLS: DRILLS };
})();
