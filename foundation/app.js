/* ══════════ MANAGER VOYAGE · FOUNDATION · app engine ══════════
   Progress (eight tracked sections), the six segments' activities, the
   self-assessment that orders the 22 micro modules, the knowledge check,
   and the SCORM hookup. State: localStorage mv-found-* plus, inside Oracle
   Learning, SCORM suspend_data. Nothing is sent anywhere else. */
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
  assessAns = new Array(ASSESS_QS.length).fill(null); assessRender();
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

/* ══════════ flip cards + myth cards ══════════ */
$$('.flip-btn').forEach(function(btn){ btn.addEventListener('click', function(){ var f = btn.classList.toggle('flipped'); btn.setAttribute('aria-expanded', f ? 'true' : 'false'); }); });
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

/* ══════════ drills: tap the right option ══════════ */
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
  var status = $('#' + name + 'Status'), done = {};
  el.innerHTML = d.items.map(function(it, i){
    return '<div class="dq" data-i="' + i + '"><p class="dq-s"><b>' + (i + 1) + '</b>' + esc(it.s) + '</p><div class="dq-opts" role="group" aria-label="Choose one">' +
      d.opts.map(function(o, oi){ return '<button type="button" data-o="' + oi + '" aria-pressed="false">' + esc(o) + '</button>'; }).join('') +
      '</div><p class="dq-x" role="status"></p></div>';
  }).join('');
  el.addEventListener('click', function(e){
    var b = e.target.closest('button[data-o]'); if(!b || b.disabled) return;
    var q = b.closest('.dq'), i = parseInt(q.getAttribute('data-i'), 10), oi = parseInt(b.getAttribute('data-o'), 10), it = d.items[i];
    var ok = oi === it.a;
    $$('button[data-o]', q).forEach(function(x){ x.disabled = true; x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); if(parseInt(x.getAttribute('data-o'), 10) === it.a) x.classList.add('is-answer'); });
    q.classList.add(ok ? 'right' : 'wrong');
    q.querySelector('.dq-x').innerHTML = '<b>' + (ok ? 'Right. ' : 'Not quite. The answer is ' + esc(d.opts[it.a]) + '. ') + '</b>' + esc(it.x);
    done[i] = 1;
    var n = Object.keys(done).length;
    if(status) status.textContent = n + ' of ' + d.items.length + ' ' + d.verb + '.' + (n === d.items.length ? ' Section complete.' : '');
    if(n === d.items.length) progDone(d.prog);
  });
}
$$('[data-drill]').forEach(buildDrill);

/* ══════════ segment 3: what your state adds ══════════ */
(function(){
  var pick = $('#statePick'), out = $('#stateOut'); if(!pick || !out || !P) return;
  function render(st){
    $$('button', pick).forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-state') === st ? 'true' : 'false'); });
    var rows = P.compliance.filter(function(c){ return c.state === st || c.state === 'ALL'; });
    var mine = rows.filter(function(c){ return c.state !== 'ALL'; }), all = rows.filter(function(c){ return c.state === 'ALL'; });
    var legal = rows.filter(function(c){ return c.type === 'Legal'; }).length;
    var name = (P.states[st] || {}).name || st;
    function li(c){ return '<li><i>' + esc(c.oracleCode) + '</i><span>' + esc(c.title) + ' <em>' + esc(c.type) + ' · ' + (c.deadlineDays === 0 ? 'on hire' : c.deadlineDays >= 180 ? '6 months' : c.deadlineDays + ' days') + ' · ' + esc(c.audience === 'Manager' ? 'supervisor version' : 'all staff') + '</em></span></li>'; }
    out.innerHTML = '<h4>' + esc(name) + ': ' + rows.length + ' courses, ' + legal + ' required by law.</h4>' +
      '<p class="hinttxt" style="margin-top:6px">' + mine.length + ' from your state, ' + all.length + ' for every location. Deadlines count from Day 1.</p>' +
      '<ul>' + mine.map(li).join('') + all.map(li).join('') + '</ul>';
  }
  pick.addEventListener('click', function(e){ var b = e.target.closest('button[data-state]'); if(b) render(b.getAttribute('data-state')); });
  if(/^(TN|NY|FL|CA)$/.test(profile.state)) render(profile.state);
})();

/* ══════════ segment 6: self-assessment → module order ══════════ */
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
var assessAns = new Array(ASSESS_QS.length).fill(null);
var aQs = $('#assessQs'), aShow = $('#assessShow'), aHint = $('#assessHint'), aOut = $('#assessOut');
function assessRender(){
  if(!aQs) return;
  aQs.innerHTML = ASSESS_QS.map(function(x, i){
    return '<div class="route-q" data-rq="' + i + '"><p class="route-qt" id="aq' + i + '"><span class="qn" aria-hidden="true">' + (i < 9 ? '0' : '') + (i + 1) + '</span><b style="color:var(--eyebrow);font-weight:600">' + esc(x.b) + '.</b> ' + esc(x.q) + '</p>' +
      '<div class="route-opts" role="group" aria-labelledby="aq' + i + '">' + ASSESS_OPTS.map(function(o, v){ return '<button type="button" data-rv="' + v + '" aria-pressed="' + (assessAns[i] === v) + '">' + o + '</button>'; }).join('') + '</div></div>';
  }).join('');
  assessSync();
  if(aOut) aOut.innerHTML = '';
}
function assessSync(){
  var n = assessAns.filter(function(v){ return v !== null; }).length, all = n === ASSESS_QS.length;
  if(aShow) aShow.disabled = !all;
  if(aHint) aHint.textContent = all ? 'All fifteen rated.' : n + ' of ' + ASSESS_QS.length + ' rated. Rate all fifteen to see your profile.';
}
if(aQs) aQs.addEventListener('click', function(e){
  var b = e.target.closest('button[data-rv]'); if(!b) return;
  var q = b.closest('.route-q'), i = parseInt(q.getAttribute('data-rq'), 10);
  assessAns[i] = parseInt(b.getAttribute('data-rv'), 10);
  $$('button[data-rv]', q).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  assessSync();
});
function assessProfile(){
  var cat = {}, max = {};
  ASSESS_QS.forEach(function(x, i){ cat[x.c] = (cat[x.c] || 0) + (assessAns[i] || 0); max[x.c] = (max[x.c] || 0) + 2; });
  var keys = Object.keys(CATS);
  var pct = {}; keys.forEach(function(k){ pct[k] = Math.round(cat[k] / max[k] * 100); });
  var weakest = keys.slice().sort(function(a, b){ return pct[a] - pct[b]; })[0];
  var strongest = keys.slice().sort(function(a, b){ return pct[b] - pct[a]; })[0];
  /* the behaviors rated lowest, weakest category first */
  var focus = ASSESS_QS.map(function(x, i){ return { b:x.b, c:x.c, v:assessAns[i] }; })
    .sort(function(p, q){ return (p.v - q.v) || (pct[p.c] - pct[q.c]); }).slice(0, 3);
  /* module order for the dashboard: track score = mean of its categories, weakest first inside each phase */
  var tscore = {};
  Object.keys(CAT_TRACKS).forEach(function(c){ CAT_TRACKS[c].forEach(function(t){ tscore[t] = tscore[t] || []; tscore[t].push(pct[c]); }); });
  Object.keys(tscore).forEach(function(t){ tscore[t] = tscore[t].reduce(function(a, b){ return a + b; }, 0) / tscore[t].length; });
  var order = [];
  if(P){
    var tracks = {}; P.mrc.tracks.forEach(function(t){ tracks[t.id] = t; });
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
    '<p class="mono" style="margin-top:16px">Practice these first</p><ol class="focus-list">' + r.focus.map(function(f, i){
      return '<li><b>' + (i + 1) + '</b><span>' + esc(f.b) + '<small>' + esc(CATS[f.c].name) + ' &middot; you rated it ' + esc(ASSESS_OPTS[f.v].toLowerCase()) + '</small></span></li>';
    }).join('') + '</ol>' +
    '<p class="hinttxt" style="margin-top:14px">Saved to this browser and your Oracle record. Your dashboard orders the micro modules from this profile, weakest category first inside each window. The Managerial Practices Survey will give you the same profile with more precision.</p>' +
    '<div class="route-act" style="margin-top:14px"><button type="button" class="btn btn-ghost btn-sm" id="assessRedo">Rate again</button></div>';
  aOut.innerHTML = html;
  set('assess', JSON.stringify({ answers:assessAns, pct:r.pct, weakest:r.weakest, focus:r.focus.map(function(f){ return f.b; }), order:r.order, at:new Date().toISOString() }));
  try{ localStorage.setItem('mv.foundation.v1', get('assess')); }catch(e){}
  var ns = $('#ns2p'); if(ns) ns.textContent = 'Your self-rating pointed to ' + r.focus[0].b.toLowerCase() + '. Do it once this week, on purpose, and notice what happened.';
  progDone('survey');
  var redo = $('#assessRedo'); if(redo) redo.addEventListener('click', function(){ assessAns = new Array(ASSESS_QS.length).fill(null); set('assess', null); assessRender(); var f = aQs.querySelector('button'); if(f) f.focus(); });
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
