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
  { k:'welcome',  no:'01', name:'Welcome',                  how:'Reveal all six claims, or mark it done' },
  { k:'standard', no:'02', name:'The Manager Standard',     how:'Sort the eight behaviors, or mark it done' },
  { k:'sixty',    no:'03', name:'Your first 60 days',       how:'Call the four milestones, or mark it done' },
  { k:'own',      no:'04', name:'What you now own',         how:'Decide the six situations, or mark it done' },
  { k:'people',   no:'05', name:'The people you will call', how:'Route the six situations, or mark it done' },
  { k:'assess',   no:'06', name:'Self-assessment',          how:'Show your module order' },
  { k:'quiz',     no:'07', name:'Knowledge check',          how:'Score six or more of eight' },
  { k:'nextstep', no:'08', name:'Your next step',           how:'Mark it done once planned' }
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
  domain: { opts:['The gate','Run the systems','Protect your people','Lead the work','Grow your people','Carry the mission'], prog:'standard', verb:'sorted', items:[
    { s:'Approved the team’s timecards before the Friday payroll cutoff.', a:1, x:'Approvals are the Systems domain. Late approvals become payroll corrections.' },
    { s:'Noticed a direct report said “I may need some time off for treatment” and called leave administration the same day.', a:2, x:'A leave request that did not arrive labeled. Recognizing and routing it is Protect your people.' },
    { s:'Wrote each direct report’s quarterly goals into Culture Amp and reviewed them in the first 1:1.', a:3, x:'Setting expectations is Lead the work. The system it lives in is Systems, but the behavior is leading.' },
    { s:'Gave the stretch assignment to the person who needed it, not the person who would finish fastest.', a:4, x:'Delegating for development is Grow your people.' },
    { s:'Explained to a new hire how the unit’s work connects to the Chancellor’s vision and helped them find their way around Nashville.', a:5, x:'Carry the mission. A manager who can explain the why can explain the work.' },
    { s:'Documented a performance concern the day it happened, factually, and before deciding what to do.', a:3, x:'Documentation of performance is Lead the work (with Employee Relations one call away). The record is yours.' },
    { s:'Scheduled a team member’s shifts so the person who complained last month got the worst ones.', a:0, x:'That is retaliation. It is not domain work at all; it is the gate failing, and it is a case.' },
    { s:'Followed the flexible work policy for everyone on the team, including the two people who asked informally.', a:0, x:'Fair, consistent treatment is the gate holding. Policy applied equally is ethical and inclusive practice.' }
  ]},
  milestone: { opts:['Day 1','Days 1 to 30','Days 31 to 60','Day 60','Cohort'], prog:'sixty', verb:'called', items:[
    { s:'You log into Oracle Learning and two required items are already waiting for you.', a:0, x:'Day 1. The HR record showed a management role and Oracle assigned both required components. Portal access opened the same day.' },
    { s:'You can open a requisition, approve time, and tell your team how their work connects to the mission.', a:1, x:'Days 1 to 30: the foundation, the Systems track, and the Vanderbilt and Nashville track.' },
    { s:'You have passed the leave simulator and the progressive discipline simulator.', a:2, x:'Days 31 to 60: the People track and the Processes track, every simulator passed.' },
    { s:'An invitation to the next quarterly cohort arrives from Oracle.', a:3, x:'Day 60. Completion is recorded against your job profile and the invitation follows. Voluntary; units outside the central budget are billed per seat.' }
  ]},
  own: { opts:['My call','My call, with a process','Not my call, route it'], prog:'own', verb:'decided', items:[
    { s:'A direct report asks to shift their hours to 7 to 3 twice a week.', a:1, x:'Yours, with a process. Flexible work has a policy, a documentation step, and an equity check across the team (module 3.5).' },
    { s:'Two people on your team want the same week off in December.', a:0, x:'Yours. Absence approvals are a manager’s call; make it, document it, and apply the same logic next time.' },
    { s:'Someone on your team says a coworker keeps making comments about their accent.', a:2, x:'Not yours. That is a possible discrimination report. Document what you were told and report to Equal Opportunity and Access the same day. You do not investigate.' },
    { s:'A timecard shows 52 hours; you know the person was out Friday.', a:1, x:'Yours, with a process. Correcting a timecard is your approval, but it is a payroll record: correct it in Oracle, note why, and tell the employee (module 1.2).' },
    { s:'A direct report mentions their doctor wants them to work from a different chair and take more breaks.', a:2, x:'Not yours alone. That is an accommodation request. Your role is the first step of the interactive process; EOA runs it (module 2.4).' },
    { s:'A strong performer has missed three deadlines this month and seems disengaged.', a:1, x:'Yours, with a process. An early, informal conversation is your call. Document it. If it moves toward formal, call Employee Relations before you act (module 2.5).' }
  ]},
  who: { opts:['HR partner','Engagement Consultant','Employee Relations','Equal Opportunity and Access','Ombuds','Compliance'], prog:'people', verb:'routed', items:[
    { s:'A required course never appeared in your Oracle assignments and the deadline is in nine days.', a:5, x:'Compliance. Required training and its deadlines are theirs. Your HR partner is a fine second call.' },
    { s:'Your team’s engagement scores dropped ten points and you want help planning a team conversation.', a:1, x:'Engagement Consultant. Culture, engagement, and manager support for your business unit.' },
    { s:'A team member wants to talk through a conflict with a peer off the record before deciding whether to raise it.', a:4, x:'Ombuds. Confidential, informal, impartial, and does not report. Tell them it exists; do not decide for them.' },
    { s:'A performance concern is moving from informal to formal and you are about to write it up.', a:2, x:'Employee Relations. Call before you act, not after. They will help you get the documentation right.' },
    { s:'A direct report tells you a colleague made unwanted physical contact at an off-site event.', a:3, x:'Equal Opportunity and Access, the same day. As a manager the report is not optional, and it is not yours to investigate. Employee Relations may be involved after.' },
    { s:'You are not sure whether a pay question from a new hire is a compensation issue, a policy issue, or a payroll error.', a:0, x:'HR partner. When you cannot tell which office owns it, start there; they route you.' }
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
  { t:'T1', q:'Could you find a direct report’s record, approve their time, and correct a timecard in Oracle HCM today?' },
  { t:'T1', q:'Could you open a requisition and name who has to approve it before it posts?' },
  { t:'T1', q:'Could you set a goal and run a check-in in Culture Amp without looking anything up?' },
  { t:'T4', q:'Could you explain to a new hire how your team’s work connects to the Chancellor’s vision?' },
  { t:'T4', q:'Could you name the institution’s current areas of focus and say where your unit fits?' },
  { t:'T4', q:'Could you describe how decisions move across schools, central units, and business units, and where you plug in?' },
  { t:'T2', q:'If a direct report hinted at needing medical leave, would you know what to say, what never to say, and who to hand off to?' },
  { t:'T2', q:'Do you know which situations you must report to Equal Opportunity and Access, and that the report is not optional?' },
  { t:'T2', q:'Have you documented a performance concern before, the day it happened, in a way Employee Relations could use?' },
  { t:'T3', q:'Do you run 1:1s on a cadence with an agenda, and can you say what a 1:1 is for?' },
  { t:'T3', q:'Have you given in-the-moment feedback on something hard, and done it well?' },
  { t:'T3', q:'Do you know how the compensation cycle runs, what you influence, and how to talk about pay?' }
];
var ASSESS_OPTS = ['Not yet', 'Some', 'Confident'];
var assessAns = new Array(ASSESS_QS.length).fill(null);
var aQs = $('#assessQs'), aShow = $('#assessShow'), aHint = $('#assessHint'), aOut = $('#assessOut');
function assessRender(){
  if(!aQs) return;
  aQs.innerHTML = ASSESS_QS.map(function(x, i){
    return '<div class="route-q" data-rq="' + i + '"><p class="route-qt" id="aq' + i + '"><span class="qn" aria-hidden="true">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' + esc(x.q) + '</p>' +
      '<div class="route-opts" role="group" aria-labelledby="aq' + i + '">' + ASSESS_OPTS.map(function(o, v){ return '<button type="button" data-rv="' + v + '" aria-pressed="' + (assessAns[i] === v) + '">' + o + '</button>'; }).join('') + '</div></div>';
  }).join('');
  assessSync();
  if(aOut) aOut.innerHTML = '';
}
function assessSync(){
  var n = assessAns.filter(function(v){ return v !== null; }).length, all = n === ASSESS_QS.length;
  if(aShow) aShow.disabled = !all;
  if(aHint) aHint.textContent = all ? 'All twelve answered.' : n + ' of ' + ASSESS_QS.length + ' answered. Answer all twelve to see your order.';
}
if(aQs) aQs.addEventListener('click', function(e){
  var b = e.target.closest('button[data-rv]'); if(!b) return;
  var q = b.closest('.route-q'), i = parseInt(q.getAttribute('data-rq'), 10);
  assessAns[i] = parseInt(b.getAttribute('data-rv'), 10);
  $$('button[data-rv]', q).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  assessSync();
});
function assessOrder(){
  if(!P) return null;
  var score = {}; ASSESS_QS.forEach(function(x, i){ score[x.t] = (score[x.t] || 0) + (assessAns[i] || 0); });
  function rank(ids){ return ids.slice().sort(function(a, b){ return (score[a] - score[b]) || ids.indexOf(a) - ids.indexOf(b); }); }
  var phase1 = rank(['T1', 'T4']), phase2 = rank(['T2', 'T3']);
  var tracks = {}; P.mrc.tracks.forEach(function(t){ tracks[t.id] = t; });
  var order = [];
  phase1.concat(phase2).forEach(function(id){ var t = tracks[id]; if(t) t.modules.forEach(function(m){ order.push({ id:m.id, title:m.title, track:t.title, phase:t.phase }); }); });
  return { score:score, phase1:phase1, phase2:phase2, order:order, tracks:tracks };
}
function assessShowOut(){
  var r = assessOrder(); if(!r || !aOut) return;
  var weakest = ['T1','T4','T2','T3'].sort(function(a, b){ return r.score[a] - r.score[b]; })[0];
  var strongest = ['T1','T4','T2','T3'].sort(function(a, b){ return r.score[b] - r.score[a]; })[0];
  var html = '<h4>Your order, in <em>two</em> windows.</h4>' +
    '<p class="gap-line">Your biggest gap is <b>' + esc(r.tracks[weakest].title) + '</b> (' + r.score[weakest] + ' of 6). Your strongest area is <b>' + esc(r.tracks[strongest].title) + '</b> (' + r.score[strongest] + ' of 6). Weakest track first inside each window; every module is still required.</p>' +
    '<div class="order-out"><p class="mono" style="margin-top:14px">Days 1 to 30 &middot; ' + esc(r.tracks[r.phase1[0]].title) + ', then ' + esc(r.tracks[r.phase1[1]].title) + '</p><ol>' +
    r.order.filter(function(m){ return m.phase === 1; }).map(function(m){ return '<li><span>' + esc(m.title) + '</span><small class="track-tag">' + esc(m.track) + '</small></li>'; }).join('') +
    '</ol><p class="mono" style="margin-top:18px">Days 31 to 60 &middot; ' + esc(r.tracks[r.phase2[0]].title) + ', then ' + esc(r.tracks[r.phase2[1]].title) + '</p><ol>' +
    r.order.filter(function(m){ return m.phase === 2; }).map(function(m){ return '<li><span>' + esc(m.title) + '</span><small class="track-tag">' + esc(m.track) + '</small></li>'; }).join('') +
    '</ol></div><p class="hinttxt" style="margin-top:14px">Saved to this browser and your Oracle record. Your dashboard reads the same order.</p>' +
    '<div class="route-act" style="margin-top:14px"><button type="button" class="btn btn-ghost btn-sm" id="assessRedo">Answer again</button></div>';
  aOut.innerHTML = html;
  set('assess', JSON.stringify({ answers:assessAns, order:r.order.map(function(m){ return m.id; }), score:r.score, at:new Date().toISOString() }));
  try{ localStorage.setItem('mv.foundation.v1', get('assess')); }catch(e){}
  progDone('assess');
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
