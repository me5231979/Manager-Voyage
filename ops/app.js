/* =====================================================================
   MANAGER VOYAGE - Program Operations Hub
   Home (program details, next sessions, the rollout), Rollout (the launch plan page),
   Cohort ops (cohorts, checklists, calendar) and Data (health, success, learner data).
   One store in the browser (localStorage), export and import as JSON, and an
   optional sync to a SharePoint list through two Power Automate flows
   (see docs/OPS-PORTAL.md). No framework, no build step.
   ===================================================================== */
(function(){
'use strict';
var KEY = 'mv-ops-v1';
var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(t){ return String(t === undefined || t === null ? '' : t).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
function uid(){ return Math.random().toString(36).slice(2, 10); }
function today(){ var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function addDays(iso, n){ if(!iso) return ''; var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function fmt(iso, long){ if(!iso) return ''; var d = new Date(iso + 'T12:00:00'); if(isNaN(d)) return iso; var o = long ? { weekday:'long', month:'long', day:'numeric', year:'numeric' } : { weekday:'short', month:'short', day:'numeric' }; return d.toLocaleDateString('en-US', o); }
function daysUntil(iso){ if(!iso) return null; var a = new Date(iso + 'T12:00:00'), b = new Date(today() + 'T12:00:00'); return Math.round((a - b) / 86400000); }
function cmp(a, b){ return a < b ? -1 : a > b ? 1 : 0; }

/* ---------- templates: what a cohort needs, worked back from its dates ---------- */
/* rel is days from the anchor date: w1, w2, w3 or cap (the capstone) */
var COHORT_CHECKLIST = [
  { phase:'Before week one', title:'Roster confirmed: twenty five names, Foundations complete, nominations from managers’ managers', owner:'FLH', anchor:'w1', rel:-28 },
  { phase:'Before week one', title:'Business unit leader booked for the capstone', owner:'FLH', anchor:'cap', rel:-28 },
  { phase:'Before week one', title:'Room booked for week one and the capstone; virtual link set for weeks two and three', owner:'FLH', anchor:'w1', rel:-21 },
  { phase:'Before week one', title:'Two facilitators assigned', owner:'FLH', anchor:'w1', rel:-21 },
  { phase:'Before week one', title:'Private Teams channel created, members added, tabs pinned', owner:'FLH', anchor:'w1', rel:-14 },
  { phase:'Before week one', title:'Week 0 welcome email and calendar holds sent (message M5)', owner:'Facilitator', anchor:'w1', rel:-14 },
  { phase:'Before week one', title:'Cohort site open: team profiles and the confidence pulse', owner:'FLH', anchor:'w1', rel:-14 },
  { phase:'Before week one', title:'Core module links checked in Oracle Learning for weeks two, three and four', owner:'FLH', anchor:'w1', rel:-10 },
  { phase:'Before week one', title:'SparkWise learning labs scheduled for weeks two and three', owner:'FLH', anchor:'w1', rel:-10 },
  { phase:'Before week one', title:'Simulation characters tested on a phone', owner:'FLH', anchor:'w1', rel:-7 },
  { phase:'Before week one', title:'Playbook template printed, one per manager', owner:'FLH', anchor:'w1', rel:-3 },
  { phase:'Before week one', title:'Week 0 pre-work chased: profiles and pulse complete', owner:'Facilitator', anchor:'w1', rel:-1 },
  { phase:'Before week one', title:'Room tested: screen, sound, microphones, printed agenda', owner:'Facilitator', anchor:'w1', rel:-1 },
  { phase:'Week one, in the room', title:'Attendance taken and the week one pulse captured', owner:'Facilitator', anchor:'w1', rel:0 },
  { phase:'Week one, in the room', title:'Playbook section 1 collected', owner:'Facilitator', anchor:'w1', rel:2 },
  { phase:'Week two, virtual', title:'Core module released in Oracle Learning', owner:'FLH', anchor:'w2', rel:-5 },
  { phase:'Week two, virtual', title:'Reminder posted in the cohort channel', owner:'Facilitator', anchor:'w2', rel:-1 },
  { phase:'Week two, virtual', title:'Session run; Playbook section 2 due Sunday', owner:'Facilitator', anchor:'w2', rel:4 },
  { phase:'Week three, virtual', title:'Core module released in Oracle Learning', owner:'FLH', anchor:'w3', rel:-5 },
  { phase:'Week three, virtual', title:'Reminder posted in the cohort channel', owner:'Facilitator', anchor:'w3', rel:-1 },
  { phase:'Week three, virtual', title:'Session run; Playbook section 3 due Sunday', owner:'Facilitator', anchor:'w3', rel:4 },
  { phase:'The capstone', title:'Business unit leader reminded, agenda sent', owner:'FLH', anchor:'cap', rel:-7 },
  { phase:'The capstone', title:'Core module released in Oracle Learning', owner:'FLH', anchor:'cap', rel:-5 },
  { phase:'The capstone', title:'Room tested; Playbook presentation order set', owner:'Facilitator', anchor:'cap', rel:-1 },
  { phase:'The capstone', title:'Playbooks presented; week four pulse taken', owner:'Facilitator', anchor:'cap', rel:0 },
  { phase:'After', title:'Pulse results and Playbooks shared with the business unit leader', owner:'FLH', anchor:'cap', rel:2 },
  { phase:'After', title:'Completion recorded in Oracle Learning for every manager', owner:'FLH', anchor:'cap', rel:7 },
  { phase:'After', title:'Cohort channel archived, kept readable; lessons learned logged', owner:'FLH', anchor:'cap', rel:7 },
  { phase:'After', title:'Re-up assessment invitations land (ninety days after completion)', owner:'FLH automation', anchor:'cap', rel:90 }
];
var COHORT_COMMS = [
  { title:'Week 0 welcome email and calendar holds (M5)', channel:'Email', anchor:'w1', rel:-14 },
  { title:'Cohort channel welcome post', channel:'Teams', anchor:'w1', rel:-14 },
  { title:'Capstone invitation to the business unit leader', channel:'Email', anchor:'cap', rel:-21 },
  { title:'Week one reminder: room, time, bring your phone', channel:'Teams', anchor:'w1', rel:-1 },
  { title:'Core module for week two released', channel:'Oracle Learning, Teams', anchor:'w2', rel:-5 },
  { title:'Week two reminder with the virtual link', channel:'Teams', anchor:'w2', rel:-1 },
  { title:'Core module for week three released', channel:'Oracle Learning, Teams', anchor:'w3', rel:-5 },
  { title:'Week three reminder with the virtual link', channel:'Teams', anchor:'w3', rel:-1 },
  { title:'Core module for week four released', channel:'Oracle Learning, Teams', anchor:'cap', rel:-5 },
  { title:'Capstone reminder: presentation order, the leader in the room', channel:'Teams', anchor:'cap', rel:-1 },
  { title:'Thank you and next steps; Playbooks and pulse to the leader', channel:'Email', anchor:'cap', rel:1 },
  { title:'Re-up assessment reminder', channel:'Email', anchor:'cap', rel:90 }
];
/* the program launch checklist, days from the launch date (December 1, 2026 in the plan) */
var PROGRAM_CHECKLIST = [
  { phase:'Ready', title:'QA sheet closes; rehearsal roster set; Teams team created with channels and tabs', owner:'FLH', rel:-18 },
  { phase:'Ready', title:'Drafts C1 to M6 final in the email templates', owner:'FLH, PCB comms', rel:-15 },
  { phase:'Ready', title:'Day 1 email and Portal checklist carry the protected-time line to the manager\u2019s manager', owner:'FLH', rel:-14 },
  { phase:'Ready', title:'Ready gate: Oracle items, the SCORM launcher with a test completion, the Teams membership group, the assessment flows tested end to end, course fixes landed', owner:'FLH, VUIT', rel:-13 },
  { phase:'Rehearsal', title:'Rehearsal managers\u2019 managers get the forwardable note', owner:'FLH', rel:-18 },
  { phase:'Rehearsal', title:'Rehearsal opens: the November 5 group and ten managers', owner:'FLH', rel:-15 },
  { phase:'Rehearsal', title:'Fifteen-minute check-ins with each rehearsal manager', owner:'FLH', rel:-11 },
  { phase:'Rehearsal', title:'Rehearsal readout', owner:'FLH, PCB', rel:-7 },
  { phase:'Rehearsal', title:'Go, no go for the launch', owner:'PCB leadership', rel:-6 },
  { phase:'Cascade', title:'C1: leadership brief to senior leadership', owner:'PCB leadership', rel:-15 },
  { phase:'Cascade', title:'C2: business unit leader briefings and the toolkit', owner:'FLH', rel:-13 },
  { phase:'Cascade', title:'C4: HCMs and Engagement Consultants briefed', owner:'FLH', rel:-12 },
  { phase:'Cascade', title:'C3: managers\u2019 managers get the forwardable note; private channel opens', owner:'FLH', rel:-11 },
  { phase:'Cascade', title:'Launch wave population confirmed with HCMs', owner:'FLH', rel:-8 },
  { phase:'Cascade', title:'C5: teaser in MyVU; Portal and the Teams channel open to every manager', owner:'PCB comms, FLH', rel:-7 },
  { phase:'Cascade', title:'Bulk assignment staged in Oracle Learning', owner:'FLH, VUIT', rel:-1 },
  { phase:'Launch', title:'Launch day: bulk assignment in Oracle, C6 launch email at 7:30, Teams post at 7:45, Day 1 automation on', owner:'FLH, PCB leadership', rel:0 },
  { phase:'Launch', title:'M2: Day 7 nudge to managers who have not started; Teams post', owner:'FLH automation', rel:7 },
  { phase:'Launch', title:'Unit dashboard views sent to business unit leaders; day 14 Teams post', owner:'FLH', rel:14 },
  { phase:'Launch', title:'Cohort 1 nominations in, three per unit', owner:'Business unit leaders', rel:17 },
  { phase:'Launch', title:'M3: Day 22 compliance reminder, sent ahead of the winter break; Teams post', owner:'Oracle, FLH', rel:20 },
  { phase:'Launch', title:'Day 30: legal compliance due; open items chased after the break', owner:'Every manager', rel:30 },
  { phase:'Launch', title:'Cohort roster post in Teams', owner:'FLH', rel:34 },
  { phase:'Launch', title:'Day 60: policy courses, Foundations and phase one modules due; M4 completion emails and cohort 2 invitations', owner:'FLH automation', rel:62 },
  { phase:'Measure', title:'First re-up assessments go out (ninety days after the first completions)', owner:'FLH automation', rel:91 },
  { phase:'Measure', title:'Ninety-day readout to senior leadership; first unit aggregates; cohort capacity decision', owner:'FLH, PCB leadership', rel:100 }
];
var PLAN_DOCS = [
  { title:'The launch plan (site)', url:'../launch/', kind:'Plan' }, { title:'The launch plan (PDF)', url:'../docs/Manager-Voyage-Launch-Plan.pdf', kind:'Plan' },
  { title:'The cohort site', url:'../cohort/', kind:'Cohort' }, { title:'For facilitators', url:'../cohort/facilitator.html', kind:'Cohort' }, { title:'For the business unit leader', url:'../cohort/leader.html', kind:'Cohort' },
  { title:'Manager Playbook (PDF)', url:'../cohort/Manager-Playbook.pdf', kind:'Playbook' }, { title:'The confidence pulse', url:'../cohort/survey.html', kind:'Pulse' },
  { title:'Foundations course', url:'../foundation/simple/', kind:'Course' }, { title:'Assessment results dashboard', url:'../results/', kind:'Data' }
];

/* the program's health measures (the first ninety days) and the success scorecard, from the launch plan */
var HEALTH = [
  { key:'open7', title:'Launch email opened within 7 days', target:85, source:'Email system' },
  { key:'dash14', title:'Dashboard opened by day 14', target:85, source:'Dashboard, profile feed' },
  { key:'baseline', title:'Assessment baseline taken', target:70, source:'Assessment flow' },
  { key:'found60', title:'Foundations complete by day 60, launch wave', target:55, source:'Oracle Learning' },
  { key:'found60new', title:'Foundations complete by day 60, new managers', target:90, source:'Oracle Learning' },
  { key:'legal30', title:'Legal compliance by day 30', target:100, source:'Oracle Learning' },
  { key:'micro60', title:'Phase one micro modules by day 60', target:45, source:'Oracle Learning' },
  { key:'seats', title:'Cohort seat requests', target:30, source:'Portal form' },
  { key:'time', title:'Protected time given, manager\u2019s report', target:80, source:'Day 60 survey' }
];
var SUCCESS = [
  { key:'fill', level:'Business', title:'Internal fill rate for manager roles', y1:'+10 points', y2:'At the benchmark', source:'Oracle Recruiting', cadence:'Quarterly' },
  { key:'promo', level:'Business', title:'Promotions into a first manager role', y1:'+15 percent', y2:'+30 percent', source:'Oracle HCM', cadence:'Yearly' },
  { key:'ready', level:'Business', title:'Promotion readiness: cohort graduates promoted or given larger scope within eighteen months', y1:'25 of 100', y2:'35 of 100', source:'Oracle HCM, FLH roster', cadence:'Yearly' },
  { key:'ttf', level:'Business', title:'Time to fill a manager role', y1:'Down 15 percent', y2:'Down 25 percent', source:'Oracle Recruiting', cadence:'Quarterly' },
  { key:'ret', level:'Business', title:'First-year retention of new managers', y1:'90 of 100 or better', y2:'92 of 100 or better', source:'Oracle HCM', cadence:'Yearly' },
  { key:'attr', level:'Business', title:'Regretted attrition on teams led by completers, against the rest', y1:'Lower for completers', y2:'Lower by a quarter', source:'Oracle HCM', cadence:'Yearly' },
  { key:'move', level:'Behavior', title:'Assessment movement, five or more points at the re-up', y1:'40 of 100 re-ups', y2:'50 of 100', source:'Results dashboard', cadence:'Quarterly' },
  { key:'prio', level:'Behavior', title:'Priority expectation moved by 0.7 or more', y1:'50 of 100 re-ups', y2:'60 of 100', source:'Results dashboard', cadence:'Quarterly' },
  { key:'pulse', level:'Behavior', title:'Cohort confidence pulse, week four against week one', y1:'Up on all four questions', y2:'Up, every cohort', source:'Cohort site', cadence:'Each cohort' },
  { key:'route', level:'Behavior', title:'Same-day routing of leave, conduct and accommodation matters', y1:'Up', y2:'Up', source:'HCM and leave office survey', cadence:'Twice a year' }
];
/* the rollout phases, days from the launch date */
var PHASES = [
  { title:'Ready', from:-25, to:-13, what:'QA closed, fixes landed, Oracle items, the launcher, the Teams team and the assessment flows tested. Ready gate at the end.' },
  { title:'Rehearsal', from:-15, to:-6, what:'The November 5 group and ten managers take the first thirty days in eight days. Readout, then the launch go, no go.' },
  { title:'Cascade', from:-15, to:-1, what:'Leadership brief, business unit leader briefings, HCMs, the note from managers\u2019 managers, the teaser; Portal and Teams open.' },
  { title:'Launch', from:0, to:62, what:'Launch email and Oracle assignments. Day 1 automation on. Nudges at day 7, 22 and 60. Cohort invitations at day 60.' },
  { title:'Deliver and measure', from:48, to:100, what:'Cohort 1, then one a quarter. Re-ups three months after each completion. Ninety-day readout to leadership.' }
];
var PROGRAM = {
  standard:[['01 \u00b7 Get the work done', 'Through your team: priorities with owners, clear expectations, work checked before it is due.'], ['02 \u00b7 Take care of your people', 'Support under pressure, thanks by name, decisions shaped by the team.'], ['03 \u00b7 Make things better', 'The why in your own words before the announcement; a look-back after big work.'], ['04 \u00b7 Connect your team', 'To the rest of Vanderbilt: hear what is coming first, show the hours, offer two options.']],
  components:[['Compliance, by location', 'Legal and policy courses for Tennessee, New York, Florida and California, auto-assigned in Oracle Learning. Legal by day 30, policy by day 60.'], ['Manager Foundations', 'The assessment, the seven-module course of about ninety minutes with live practice, then the micro modules in Oracle Learning by day 60.'], ['The four-week cohort', 'Twenty five managers a quarter: a half day in the room, two virtual weeks, a two-hour capstone with the Playbook presented to the business unit leader.'], ['The Manager Portal', 'Every template, policy link and contact, open from day one. The My Voyage dashboard shows each manager where they stand.']]
};

/* ---------- the store ---------- */
var S = null;
function blank(){ return { version:1, at:'', settings:{ launchDate:'2026-12-01', capacity:25, facilitators:'', saveUrl:'', loadUrl:'', key:'', by:'' }, program:{ checklist:[], log:[] }, cohorts:[], data:{ health:{}, success:{} } }; }
function load(){ try{ var raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : blank(); }catch(e){ S = blank(); } if(!S.settings) S.settings = blank().settings; if(!S.program) S.program = { checklist:[], log:[] }; if(!S.cohorts) S.cohorts = []; if(!S.data) S.data = { health:{}, success:{} }; if(!S.data.health) S.data.health = {}; if(!S.data.success) S.data.success = {}; if(!S.program.checklist.length) S.program.checklist = PROGRAM_CHECKLIST.map(function(t){ return { id:uid(), phase:t.phase, title:t.title, owner:t.owner, rel:t.rel, done:false, doneAt:'' }; }); }
function save(note){ S.at = new Date().toISOString(); try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ toast('Could not save in this browser.'); } if(note) toast(note); syncPush(); }
function cohort(id){ for(var i = 0; i < S.cohorts.length; i++){ if(S.cohorts[i].id === id) return S.cohorts[i]; } return null; }
function logTo(target, text){ target.log = target.log || []; target.log.unshift({ at:new Date().toISOString(), text:text }); if(target.log.length > 200) target.log.length = 200; }
function programDate(rel){ return addDays(S.settings.launchDate, rel); }
function anchorDate(c, anchor){ return c.dates[anchor] || ''; }
function itemDate(c, it){ return it.date || addDays(anchorDate(c, it.anchor), it.rel); }
function newCohort(f){
  var c = { id:uid(), name:f.name, number:f.number, quarter:f.quarter, status:'Planned', dates:{ w1:f.w1, w2:f.w2, w3:f.w3, cap:f.cap }, room:f.room || '', virtualLink:f.virtualLink || '', facilitators:f.facilitators || '', buLeader:f.buLeader || '', unit:f.unit || '', capacity:parseInt(f.capacity, 10) || S.settings.capacity || 25, notes:f.notes || '', createdAt:new Date().toISOString(),
    roster:[], docs:[], log:[],
    checklist:COHORT_CHECKLIST.map(function(t){ return { id:uid(), phase:t.phase, title:t.title, owner:t.owner, anchor:t.anchor, rel:t.rel, done:false, doneAt:'' }; }),
    comms:COHORT_COMMS.map(function(t){ return { id:uid(), title:t.title, channel:t.channel, anchor:t.anchor, rel:t.rel, done:false }; }) };
  logTo(c, 'Cohort created'); S.cohorts.push(c); return c;
}
function seats(c){ return c.roster.filter(function(r){ return r.seat === 'confirmed'; }).length; }
function progress(c){ var n = c.checklist.length, d = c.checklist.filter(function(i){ return i.done; }).length; return n ? Math.round(d / n * 100) : 0; }
function statusOf(c){ var t = today(); if(c.status === 'Complete' || (c.dates.cap && c.dates.cap < t)) return 'Complete'; if(c.dates.w1 && c.dates.w1 <= t) return 'Running'; if(c.roster.length) return 'Open'; return 'Planned'; }

/* ---------- sync, optional ---------- */
function syncPush(){ var st = S.settings; if(!st.saveUrl) return; try{ fetch(st.saveUrl, { method:'POST', mode:'no-cors', headers:{ 'Content-Type':'text/plain' }, body:JSON.stringify({ event:'ops-save', key:st.key, by:st.by, at:S.at, data:S }), keepalive:true }).then(function(){ setSync('Synced ' + new Date().toLocaleTimeString()); }).catch(function(){ setSync('Saved here; sync failed'); }); }catch(e){} }
function syncPull(){ var st = S.settings; if(!st.loadUrl) return Promise.resolve(false); return fetch(st.loadUrl + (st.loadUrl.indexOf('?') > -1 ? '&' : '?') + 'key=' + encodeURIComponent(st.key)).then(function(r){ return r.json(); }).then(function(j){ var remote = j && (j.data || j); if(remote && remote.cohorts && (!S.at || (remote.at && remote.at > S.at))){ var keep = S.settings; S = remote; S.settings = keep; try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} setSync('Loaded the shared copy ' + new Date().toLocaleTimeString()); return true; } setSync('Shared copy checked'); return false; }).catch(function(){ setSync('Saved here; could not reach the shared copy'); return false; }); }
function setSync(t){ var el = $('#syncState'); if(el) el.textContent = t; }

/* ---------- rendering ---------- */
var main = $('#main');
function toast(t){ var el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function(){ el.hidden = true; }, 2600); }
function pill(st){ var cls = st === 'Running' ? 'running' : st === 'Complete' ? 'complete' : st === 'Open' ? 'solid' : ''; return '<span class="pill ' + cls + '">' + esc(st) + '</span>'; }
function dueClass(iso, done){ if(done) return 'done'; var n = daysUntil(iso); return n !== null && n < 0 ? 'late' : ''; }
function upcoming(days){
  var out = [], t = today(), end = addDays(t, days);
  S.program.checklist.forEach(function(it){ var d = programDate(it.rel); if(!it.done && d && d <= end) out.push({ date:d, text:it.title, who:it.owner, where:'Program launch', href:'#program', late:d < t }); });
  S.cohorts.forEach(function(c){
    c.checklist.forEach(function(it){ var d = itemDate(c, it); if(!it.done && d && d <= end) out.push({ date:d, text:it.title, who:it.owner, where:c.name, href:'#cohort/' + c.id + '/checklist', late:d < t }); });
    c.comms.forEach(function(it){ var d = itemDate(c, it); if(!it.done && d && d <= end) out.push({ date:d, text:it.title, who:it.channel, where:c.name, href:'#cohort/' + c.id + '/comms', late:d < t }); });
    [['w1', 'Week one, in the room'], ['w2', 'Week two, virtual'], ['w3', 'Week three, virtual'], ['cap', 'The capstone, in the room']].forEach(function(w){ var d = c.dates[w[0]]; if(d && d >= t && d <= end) out.push({ date:d, text:w[1], who:'Session', where:c.name, href:'#cohort/' + c.id, late:false }); });
  });
  out.sort(function(a, b){ return cmp(a.date, b.date); }); return out;
}
function listHTML(items, empty){ if(!items.length) return '<div class="empty">' + esc(empty) + '</div>'; return '<ul class="list">' + items.map(function(i){ return '<li class="' + (i.late ? 'late' : '') + '"><span class="when">' + esc(fmt(i.date)) + (i.late ? ' &middot; overdue' : '') + '</span><span><a href="' + i.href + '">' + esc(i.text) + '</a><br><span class="who">' + esc(i.where) + ' &middot; ' + esc(i.who) + '</span></span></li>'; }).join('') + '</ul>'; }

function phaseDates(ph){ return { from:programDate(ph.from), to:programDate(ph.to) }; }
function nextSessions(limit){
  var t = today(), out = [];
  S.cohorts.forEach(function(c){ [['w1', 'Week one, in the room'], ['w2', 'Week two, virtual'], ['w3', 'Week three, virtual'], ['cap', 'The capstone, in the room']].forEach(function(w){ var d = c.dates[w[0]]; if(d && d >= t) out.push({ date:d, text:w[1], cohort:c }); }); });
  out.sort(function(a, b){ return cmp(a.date, b.date); }); return out.slice(0, limit || 6);
}
function renderHome(){
  var L = S.settings.launchDate, n = daysUntil(L), sessions = nextSessions(6), pdone = S.program.checklist.filter(function(i){ return i.done; }).length, t = today();
  var count = n > 0 ? '<div class="n">' + n + '</div><div class="l">days to launch, ' + esc(fmt(L)) + '</div>' : n === 0 ? '<div class="n">Day 1</div><div class="l">Launch day, ' + esc(fmt(L)) + '</div>' : '<div class="n">Day ' + (1 - n) + '</div><div class="l">of the launch wave, from ' + esc(fmt(L)) + '</div>';
  main.innerHTML = '<div class="hub-hero"><div><p class="eyebrow">Program Operations Hub</p><h1>Manager Voyage, from launch to <em>cohort four</em>.</h1><p class="lede">One standard for every manager at Vanderbilt, in four expectations, delivered in four components. This hub runs it: the rollout plan, every cohort with its checklist, and the numbers that say whether it is working.</p></div><div class="count">' + count + '</div></div>' +
    '<div class="grid c2" style="grid-template-columns:1.1fr .9fr"><div><h3>Next sessions</h3>' + (sessions.length ? '<ul class="list">' + sessions.map(function(x){ var dn = daysUntil(x.date); return '<li><span class="when">' + esc(fmt(x.date)) + '</span><span><a href="#cohort/' + x.cohort.id + '">' + esc(x.cohort.name) + '</a>: ' + esc(x.text) + (x.cohort.room && x.text.indexOf('room') > -1 ? ', ' + esc(x.cohort.room) : '') + '<br><span class="who">' + seats(x.cohort) + ' of ' + x.cohort.capacity + ' seats confirmed' + (x.cohort.facilitators ? ' &middot; ' + esc(x.cohort.facilitators) : '') + '</span></span><span class="who">' + (dn === 0 ? 'today' : 'in ' + dn + ' days') + '</span></li>'; }).join('') + '</ul>' : '<div class="empty">No cohort sessions scheduled. <a href="#new">Create a cohort</a>, or <button type="button" class="linkish" data-act="seed">add the four 2027 cohorts from the plan</button> (January 18, April 12, July 12, October 4).</div>') +
    '<h3 style="margin-top:18px">The program</h3><div class="std4">' + PROGRAM.components.map(function(c){ return '<div><b>' + esc(c[0]) + '</b>' + esc(c[1]) + '</div>'; }).join('') + '</div>' +
    '<h3 style="margin-top:14px">The Vanderbilt Manager Standard</h3><div class="std4">' + PROGRAM.standard.map(function(c){ return '<div><b>' + esc(c[0]) + '</b>' + esc(c[1]) + '</div>'; }).join('') + '</div></div>' +
    '<div><h3>The rollout, at a glance</h3><div class="roll" style="grid-template-columns:1fr">' + PHASES.map(function(ph){ var d = phaseDates(ph), cls = d.to < t ? 'done' : (d.from <= t ? 'now' : ''); return '<div class="ph ' + cls + '"><b>' + esc(ph.title) + (cls === 'now' ? ' <span class="pill solid">now</span>' : cls === 'done' ? ' <span class="pill complete">done</span>' : '') + '</b><div class="w">' + esc(fmt(d.from)) + ' to ' + esc(fmt(d.to)) + '</div>' + esc(ph.what) + '</div>'; }).join('') + '</div>' +
    '<div class="card" style="margin-top:12px"><h2>' + pdone + ' of ' + S.program.checklist.length + ' rollout items done</h2><div class="bar"><i style="width:' + Math.round(pdone / Math.max(1, S.program.checklist.length) * 100) + '%"></i></div><p style="margin-top:8px"><a href="#program">Open the rollout checklist</a> &middot; <a href="../launch/">Read the full plan</a></p></div>' +
    '<h3 style="margin-top:18px">Quick links</h3><div class="links"><a href="../launch/">Rollout plan</a><a href="../docs/Manager-Voyage-Launch-Plan.pdf">Plan PDF</a><a href="../cohort/">Cohort site</a><a href="../foundation/simple/">Foundations course</a><a href="../dashboard/">My Voyage dashboard</a><a href="../results/">Assessment results</a><a href="#data">Data</a></div></div></div>';
}
function cohortCard(c){ var st = statusOf(c); return '<a class="card cohort-card" href="#cohort/' + c.id + '"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span class="mono">Cohort ' + esc(c.number || '') + (c.quarter ? ' &middot; ' + esc(c.quarter) : '') + '</span>' + pill(st) + '</div><h2>' + esc(c.name) + '</h2><div class="dates"><span>W1 ' + esc(fmt(c.dates.w1)) + '</span><span>W2 ' + esc(fmt(c.dates.w2)) + '</span><span>W3 ' + esc(fmt(c.dates.w3)) + '</span><span>Capstone ' + esc(fmt(c.dates.cap)) + '</span></div><p>' + seats(c) + ' of ' + c.capacity + ' seats confirmed &middot; ' + c.roster.length + ' on the roster &middot; ' + progress(c) + ' percent of the checklist done' + (c.buLeader ? ' &middot; ' + esc(c.buLeader) : '') + '</p><div class="bar"><i style="width:' + progress(c) + '%"></i></div></a>'; }

function subnav(on){ return '<div class="subnav">' + [['cohorts', 'Cohorts'], ['program', 'Rollout checklist'], ['calendar', 'Calendar'], ['settings', 'Settings']].map(function(t){ return '<a href="#' + t[0] + '" class="' + (t[0] === on ? 'on' : '') + '">' + t[1] + '</a>'; }).join('') + '</div>'; }
function renderCohorts(){
  main.innerHTML = subnav('cohorts') + '<div class="head"><div><p class="eyebrow">Cohorts</p><h1>Every cohort, past and <em>planned</em>.</h1></div><div class="acts"><a class="btn gold" href="#new">New cohort</a><button type="button" class="btn ghost" data-act="seed">Seed the 2027 cohorts</button></div></div>' +
    (S.cohorts.length ? '<div class="grid c2">' + S.cohorts.slice().sort(function(a, b){ return cmp(a.dates.w1, b.dates.w1); }).map(cohortCard).join('') + '</div>' : '<div class="empty">No cohorts yet.</div>');
}

function renderNew(){
  var n = S.cohorts.length + 1;
  main.innerHTML = subnav('cohorts') + '<p class="eyebrow">New cohort</p><h1>Name it, set week one, and the rest <em>follows</em>.</h1><p class="lede">Give the week one date and the portal proposes the three Wednesdays after it, builds the launch checklist worked back from those dates, and lays out the communications for the cohort. You can change any date later.</p>' +
    '<form class="form card" data-form="new"><div><label>Name</label><input name="name" required placeholder="Cohort ' + n + ', spring 2027" value="Cohort ' + n + '"></div><div><label>Number</label><input name="number" value="' + n + '"></div>' +
    '<div><label>Quarter</label><input name="quarter" placeholder="Q2 2027"></div><div><label>Unit, for a bespoke cohort</label><input name="unit" placeholder="Open to all units, or DAR"></div>' +
    '<div><label>Week one, in the room</label><input type="date" name="w1" required data-w1></div><div><label>Week two, virtual</label><input type="date" name="w2" data-w2></div><div><label>Week three, virtual</label><input type="date" name="w3" data-w3></div><div><label>Capstone, in the room</label><input type="date" name="cap" data-cap></div>' +
    '<div><label>Room</label><input name="room" placeholder="Building and room"></div><div><label>Virtual link</label><input name="virtualLink" placeholder="Teams meeting link"></div>' +
    '<div><label>Facilitators</label><input name="facilitators" value="' + esc(S.settings.facilitators) + '" placeholder="Two names"></div><div><label>Business unit leader at the capstone</label><input name="buLeader"></div>' +
    '<div><label>Capacity</label><input type="number" name="capacity" value="' + esc(S.settings.capacity) + '" min="1"></div><div></div>' +
    '<div class="full"><label>Notes</label><textarea name="notes" placeholder="Anything particular to this cohort"></textarea></div>' +
    '<div class="acts"><button type="submit" class="btn gold">Create the cohort</button><a class="btn ghost" href="#cohorts">Cancel</a></div></form>';
  var w1 = $('[data-w1]'); w1.addEventListener('change', function(){ if(!w1.value) return; $('[data-w2]').value = addDays(w1.value, 7); $('[data-w3]').value = addDays(w1.value, 14); $('[data-cap]').value = addDays(w1.value, 21); });
}

var TABS = [['overview', 'Overview'], ['roster', 'Roster'], ['checklist', 'Checklist'], ['comms', 'Communications'], ['docs', 'Documents'], ['log', 'Notes and log']];
function renderCohort(id, tab){
  var c = cohort(id); if(!c){ main.innerHTML = '<div class="empty">That cohort is not here. <a href="#cohorts">Back to cohorts</a>.</div>'; return; }
  tab = tab || 'overview'; var st = statusOf(c);
  var h = '<div class="head"><div><p class="eyebrow">Cohort ' + esc(c.number || '') + (c.quarter ? ' &middot; ' + esc(c.quarter) : '') + '</p><h1>' + esc(c.name) + ' ' + pill(st) + '</h1><p class="small">W1 ' + esc(fmt(c.dates.w1, true)) + ' &middot; W2 ' + esc(fmt(c.dates.w2)) + ' &middot; W3 ' + esc(fmt(c.dates.w3)) + ' &middot; Capstone ' + esc(fmt(c.dates.cap, true)) + (c.room ? ' &middot; ' + esc(c.room) : '') + '</p></div>' +
    '<div class="acts"><button type="button" class="btn ghost" data-act="print">Print the cohort sheet</button><button type="button" class="btn ghost" data-act="dup" data-id="' + c.id + '">Copy as a new cohort</button><button type="button" class="btn danger sm" data-act="del" data-id="' + c.id + '">Delete</button></div></div>' +
    '<div class="tabs">' + TABS.map(function(t){ return '<a href="#cohort/' + c.id + '/' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</a>'; }).join('') + '</div>';
  var body = '';
  if(tab === 'overview') body = overviewHTML(c);
  else if(tab === 'roster') body = rosterHTML(c);
  else if(tab === 'checklist') body = checklistHTML(c);
  else if(tab === 'comms') body = commsHTML(c);
  else if(tab === 'docs') body = docsHTML(c);
  else body = logHTML(c);
  main.innerHTML = subnav('cohorts') + h + '<div class="tabpane" data-tab="' + tab + '">' + body + '</div>';
}
function overviewHTML(c){
  var due = upcoming(21).filter(function(i){ return i.where === c.name; });
  return '<div class="grid c2"><form class="form card" data-form="edit" data-id="' + c.id + '"><div class="full"><h3>Details</h3></div>' +
    '<div><label>Name</label><input name="name" value="' + esc(c.name) + '" required></div><div><label>Number</label><input name="number" value="' + esc(c.number) + '"></div><div><label>Quarter</label><input name="quarter" value="' + esc(c.quarter) + '"></div><div><label>Unit</label><input name="unit" value="' + esc(c.unit) + '"></div>' +
    '<div><label>Week one</label><input type="date" name="w1" value="' + esc(c.dates.w1) + '"></div><div><label>Week two</label><input type="date" name="w2" value="' + esc(c.dates.w2) + '"></div><div><label>Week three</label><input type="date" name="w3" value="' + esc(c.dates.w3) + '"></div><div><label>Capstone</label><input type="date" name="cap" value="' + esc(c.dates.cap) + '"></div>' +
    '<div><label>Room</label><input name="room" value="' + esc(c.room) + '"></div><div><label>Virtual link</label><input name="virtualLink" value="' + esc(c.virtualLink) + '"></div><div><label>Facilitators</label><input name="facilitators" value="' + esc(c.facilitators) + '"></div><div><label>Business unit leader</label><input name="buLeader" value="' + esc(c.buLeader) + '"></div>' +
    '<div><label>Capacity</label><input type="number" name="capacity" value="' + esc(c.capacity) + '"></div><div><label>Status</label><select name="status"><option' + (c.status === 'Planned' ? ' selected' : '') + '>Planned</option><option' + (c.status === 'Open' ? ' selected' : '') + '>Open</option><option' + (c.status === 'Running' ? ' selected' : '') + '>Running</option><option' + (c.status === 'Complete' ? ' selected' : '') + '>Complete</option></select></div>' +
    '<div class="full"><label>Notes</label><textarea name="notes">' + esc(c.notes) + '</textarea></div><div class="acts"><button type="submit" class="btn gold">Save details</button></div></form>' +
    '<div><div class="grid"><div class="stat"><div class="n">' + seats(c) + ' <small style="font-size:1rem;color:rgba(255,255,255,.6)">of ' + c.capacity + '</small></div><div class="l">Seats confirmed &middot; ' + c.roster.filter(function(r){ return r.seat === 'nominated'; }).length + ' nominated &middot; ' + c.roster.filter(function(r){ return r.seat === 'waitlist'; }).length + ' waitlisted</div></div>' +
    '<div class="stat"><div class="n">' + progress(c) + '<small style="font-size:1rem;color:rgba(255,255,255,.6)"> percent</small></div><div class="l">Checklist done &middot; ' + c.checklist.filter(function(i){ return !i.done; }).length + ' items open</div></div></div>' +
    '<h3 style="margin-top:18px">Due in the next three weeks</h3>' + listHTML(due, 'Nothing due in the next three weeks for this cohort.') + '</div></div>';
}
function rosterHTML(c){
  var rows = c.roster.map(function(r){ return '<tr><td><b>' + esc(r.name) + '</b><br><span class="small">' + esc(r.email) + '</span></td><td>' + esc(r.unit) + '</td><td>' + esc(r.mm) + '</td><td><select data-act="seat" data-id="' + c.id + '" data-rid="' + r.id + '">' + ['confirmed', 'nominated', 'waitlist', 'declined'].map(function(s){ return '<option' + (r.seat === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td><td style="text-align:center"><input type="checkbox" data-act="rflag" data-flag="foundations" data-id="' + c.id + '" data-rid="' + r.id + '"' + (r.foundations ? ' checked' : '') + '></td><td style="text-align:center"><input type="checkbox" data-act="rflag" data-flag="assessment" data-id="' + c.id + '" data-rid="' + r.id + '"' + (r.assessment ? ' checked' : '') + '></td><td>' + esc(r.notes) + '</td><td><button type="button" class="linkish" data-act="rdel" data-id="' + c.id + '" data-rid="' + r.id + '">Remove</button></td></tr>'; }).join('');
  return '<div class="grid c2" style="grid-template-columns:1.4fr .6fr"><div><h3>' + c.roster.length + ' on the roster &middot; ' + seats(c) + ' of ' + c.capacity + ' seats confirmed</h3>' +
    (c.roster.length ? '<div class="xs"><table><tr><th>Manager</th><th>Unit</th><th>Manager’s manager</th><th>Seat</th><th>Foundations</th><th>Assessment</th><th>Notes</th><th></th></tr>' + rows + '</table></div><p class="small noprint" style="margin-top:8px"><button type="button" class="linkish" data-act="rcsv" data-id="' + c.id + '">Download the roster as CSV</button></p>' : '<div class="empty">Nobody on the roster yet. Add a manager, or paste a list.</div>') + '</div>' +
    '<div class="noprint"><form class="form card" data-form="person" data-id="' + c.id + '" style="grid-template-columns:1fr"><div><h3>Add a manager</h3></div><div><label>Name</label><input name="name" required></div><div><label>Email</label><input name="email" type="email"></div><div><label>Unit</label><input name="unit"></div><div><label>Manager’s manager</label><input name="mm"></div><div><label>Seat</label><select name="seat"><option>nominated</option><option>confirmed</option><option>waitlist</option></select></div><div><label>Notes</label><input name="notes"></div><div class="acts"><button type="submit" class="btn gold sm">Add</button></div></form>' +
    '<form class="form card" data-form="paste" data-id="' + c.id + '" style="grid-template-columns:1fr;margin-top:12px"><div><h3>Paste a list</h3><p class="small">One per line: name, email, unit, manager’s manager. Commas or tabs.</p></div><div><textarea name="list" placeholder="Alex Rivera, alex.rivera@vanderbilt.edu, Campus Dining, Jordan Lee"></textarea></div><div class="acts"><button type="submit" class="btn ghost sm">Add them as nominated</button></div></form></div></div>';
}
function checklistHTML(c){
  var phases = []; c.checklist.forEach(function(i){ if(phases.indexOf(i.phase) < 0) phases.push(i.phase); });
  return phases.map(function(ph){ var items = c.checklist.filter(function(i){ return i.phase === ph; }).sort(function(a, b){ return cmp(itemDate(c, a), itemDate(c, b)); });
    return '<div class="phase"><h3>' + esc(ph) + ' &middot; ' + items.filter(function(i){ return i.done; }).length + ' of ' + items.length + '</h3><div class="xs"><table>' + items.map(function(i){ var d = itemDate(c, i); return '<tr class="' + dueClass(d, i.done) + '"><td style="width:34px"><input type="checkbox" data-act="tick" data-id="' + c.id + '" data-iid="' + i.id + '"' + (i.done ? ' checked' : '') + ' aria-label="Done"></td><td class="d">' + esc(fmt(d)) + '</td><td><b>' + esc(i.title) + '</b>' + (i.done && i.doneAt ? '<br><span class="small">Done ' + esc(fmt(i.doneAt)) + '</span>' : '') + '</td><td>' + esc(i.owner) + '</td><td style="width:34px"><button type="button" class="linkish noprint" data-act="idel" data-id="' + c.id + '" data-iid="' + i.id + '" aria-label="Remove">&times;</button></td></tr>'; }).join('') + '</table></div></div>'; }).join('') +
    '<form class="form card noprint" data-form="item" data-id="' + c.id + '" style="margin-top:18px"><div class="full"><h3>Add an item</h3></div><div class="full"><label>What</label><input name="title" required></div><div><label>Phase</label><select name="phase">' + phases.map(function(p){ return '<option>' + esc(p) + '</option>'; }).join('') + '</select></div><div><label>Owner</label><input name="owner" value="FLH"></div><div><label>Due</label><input type="date" name="date" value="' + today() + '"></div><div class="acts"><button type="submit" class="btn gold sm">Add</button></div></form>';
}
function commsHTML(c){
  var items = c.comms.slice().sort(function(a, b){ return cmp(itemDate(c, a), itemDate(c, b)); });
  return '<h3>The communications for this cohort, in order</h3><div class="xs"><table>' + items.map(function(i){ var d = itemDate(c, i); return '<tr class="' + dueClass(d, i.done) + '"><td style="width:34px"><input type="checkbox" data-act="ctick" data-id="' + c.id + '" data-iid="' + i.id + '"' + (i.done ? ' checked' : '') + ' aria-label="Sent"></td><td class="d">' + esc(fmt(d)) + '</td><td><b>' + esc(i.title) + '</b></td><td>' + esc(i.channel) + '</td></tr>'; }).join('') + '</table></div>' +
    '<p class="small" style="margin-top:8px">The drafts are in the launch plan: message M5 for the welcome, the Teams posts for the channel. <a href="../launch/#msg-m4">Open the drafts</a>.</p>' +
    '<form class="form card noprint" data-form="comm" data-id="' + c.id + '" style="margin-top:18px"><div class="full"><h3>Add a message</h3></div><div class="full"><label>What</label><input name="title" required></div><div><label>Channel</label><input name="channel" value="Email"></div><div><label>Date</label><input type="date" name="date" value="' + today() + '"></div><div class="acts"><button type="submit" class="btn gold sm">Add</button></div></form>';
}
function docsHTML(c){
  return '<div class="grid c2"><div><h3>This cohort’s documents</h3>' + (c.docs.length ? '<div class="xs"><table>' + c.docs.map(function(d){ return '<tr><td><b><a href="' + esc(d.url) + '" target="_blank" rel="noopener">' + esc(d.title) + '</a></b></td><td>' + esc(d.kind) + '</td><td>' + esc(d.owner) + '</td><td class="d">' + esc(fmt(d.addedAt)) + '</td><td><button type="button" class="linkish noprint" data-act="ddel" data-id="' + c.id + '" data-did="' + d.id + '">Remove</button></td></tr>'; }).join('') + '</table></div>' : '<div class="empty">No documents linked yet. Rosters, agendas, slides and Playbooks live in SharePoint or Box; link them here.</div>') +
    '<form class="form card noprint" data-form="doc" data-id="' + c.id + '" style="margin-top:14px"><div class="full"><h3>Link a document</h3></div><div><label>Title</label><input name="title" required></div><div><label>Link</label><input name="url" type="url" required placeholder="https://"></div><div><label>Kind</label><select name="kind"><option>Roster</option><option>Agenda</option><option>Slides</option><option>Playbook</option><option>Pulse results</option><option>Room and logistics</option><option>Other</option></select></div><div><label>Owner</label><input name="owner" value="FLH"></div><div class="acts"><button type="submit" class="btn gold sm">Add the link</button></div></form></div>' +
    '<div><h3>From the program</h3><div class="xs"><table>' + PLAN_DOCS.map(function(d){ return '<tr><td><b><a href="' + d.url + '" target="_blank" rel="noopener">' + esc(d.title) + '</a></b></td><td>' + esc(d.kind) + '</td></tr>'; }).join('') + '</table></div></div></div>';
}
function logHTML(c){
  return '<div class="grid c2"><div><form class="form card noprint" data-form="note" data-id="' + c.id + '" style="grid-template-columns:1fr"><div><h3>Add a note</h3></div><div><textarea name="text" required placeholder="What happened, what was decided, what to remember next time"></textarea></div><div class="acts"><button type="submit" class="btn gold sm">Add to the log</button></div></form></div>' +
    '<div><h3>Log</h3>' + ((c.log || []).length ? '<ul class="log">' + c.log.map(function(l){ return '<li><span>' + esc(fmt(l.at.slice(0, 10))) + '</span>' + esc(l.text) + '</li>'; }).join('') + '</ul>' : '<div class="empty">Nothing logged yet.</div>') + '</div></div>';
}

function renderProgram(){
  var phases = []; S.program.checklist.forEach(function(i){ if(phases.indexOf(i.phase) < 0) phases.push(i.phase); });
  var done = S.program.checklist.filter(function(i){ return i.done; }).length;
  main.innerHTML = '' + subnav('program') + '<div class="head"><div><p class="eyebrow">Rollout checklist</p><h1>The launch checklist, dated from <em>' + esc(fmt(S.settings.launchDate)) + '</em>.</h1><p class="lede">Every item from the launch plan, with its date worked from the launch date. Change the launch date in Settings and every date moves with it. ' + done + ' of ' + S.program.checklist.length + ' done.</p></div><div class="acts"><a class="btn ghost" href="../launch/">Read the full plan</a></div></div>' +
    phases.map(function(ph){ var items = S.program.checklist.filter(function(i){ return i.phase === ph; }).sort(function(a, b){ return a.rel - b.rel; });
      return '<div class="phase"><h3>' + esc(ph) + ' &middot; ' + items.filter(function(i){ return i.done; }).length + ' of ' + items.length + '</h3><div class="xs"><table>' + items.map(function(i){ var d = programDate(i.rel); return '<tr class="' + dueClass(d, i.done) + '"><td style="width:34px"><input type="checkbox" data-act="ptick" data-iid="' + i.id + '"' + (i.done ? ' checked' : '') + ' aria-label="Done"></td><td class="d">' + esc(fmt(d)) + '</td><td><b>' + esc(i.title) + '</b>' + (i.done && i.doneAt ? '<br><span class="small">Done ' + esc(fmt(i.doneAt)) + '</span>' : '') + '</td><td>' + esc(i.owner) + '</td></tr>'; }).join('') + '</table></div></div>'; }).join('') +
    '<form class="form card noprint" data-form="pitem" style="margin-top:18px"><div class="full"><h3>Add an item</h3></div><div class="full"><label>What</label><input name="title" required></div><div><label>Phase</label><select name="phase">' + phases.map(function(p){ return '<option>' + esc(p) + '</option>'; }).join('') + '</select></div><div><label>Owner</label><input name="owner" value="FLH"></div><div><label>Due</label><input type="date" name="date" value="' + today() + '"></div><div class="acts"><button type="submit" class="btn gold sm">Add</button></div></form>' +
    '<div class="sec"><h3>Program log</h3><form class="form noprint" data-form="pnote" style="grid-template-columns:1fr auto;align-items:end"><div><label>Note</label><input name="text" required placeholder="A decision, a date moved, something to remember"></div><div class="acts" style="grid-column:auto"><button type="submit" class="btn gold sm">Add</button></div></form>' + ((S.program.log || []).length ? '<ul class="log" style="margin-top:10px">' + S.program.log.map(function(l){ return '<li><span>' + esc(fmt(l.at.slice(0, 10))) + '</span>' + esc(l.text) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
}
function renderCalendar(){
  var items = upcoming(400), byMonth = {};
  items.forEach(function(i){ var m = i.date.slice(0, 7); (byMonth[m] = byMonth[m] || []).push(i); });
  var months = Object.keys(byMonth).sort();
  main.innerHTML = subnav('calendar') + '<p class="eyebrow">Calendar</p><h1>Everything dated, across the program and every <em>cohort</em>.</h1><p class="lede">Open items only. Tick them off where they live and they leave this list.</p>' +
    (months.length ? months.map(function(m){ var d = new Date(m + '-15T12:00:00'); return '<div class="phase"><h3>' + d.toLocaleDateString('en-US', { month:'long', year:'numeric' }) + '</h3>' + listHTML(byMonth[m], '') + '</div>'; }).join('') : '<div class="empty">Nothing dated ahead.</div>');
}
function renderSettings(){
  var st = S.settings;
  main.innerHTML = subnav('settings') + '<p class="eyebrow">Settings</p><h1>Dates, defaults, and where the data <em>lives</em>.</h1>' +
    '<div class="grid c2"><form class="form card" data-form="settings"><div class="full"><h3>Program</h3></div><div><label>Launch date</label><input type="date" name="launchDate" value="' + esc(st.launchDate) + '"></div><div><label>Default cohort capacity</label><input type="number" name="capacity" value="' + esc(st.capacity) + '"></div><div class="full"><label>Default facilitators</label><input name="facilitators" value="' + esc(st.facilitators) + '"></div><div class="full"><label>Your name, for the shared copy</label><input name="by" value="' + esc(st.by) + '"></div>' +
    '<div class="full"><h3 style="margin-top:8px">Shared copy, optional</h3><p class="small">Two Power Automate flows and a SharePoint list make one copy for the team; see docs/OPS-PORTAL.md in the repository. Leave blank to keep everything in this browser.</p></div><div class="full"><label>Save URL</label><input name="saveUrl" value="' + esc(st.saveUrl) + '"></div><div class="full"><label>Load URL</label><input name="loadUrl" value="' + esc(st.loadUrl) + '"></div><div><label>Shared key</label><input name="key" value="' + esc(st.key) + '"></div><div class="acts"><button type="submit" class="btn gold">Save settings</button><button type="button" class="btn ghost" data-act="pull">Load the shared copy now</button></div></form>' +
    '<div class="card"><h3>Your data</h3><p>Everything in this portal is stored in this browser under the key <code>' + KEY + '</code>. Export it to keep a copy or move it to another person; import brings a copy back and replaces what is here.</p><div class="acts" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn" data-act="export">Export JSON</button><button type="button" class="btn ghost" data-act="import">Import JSON</button><button type="button" class="btn danger" data-act="reset">Clear everything</button></div><p class="small" style="margin-top:12px">Last saved ' + (S.at ? esc(new Date(S.at).toLocaleString()) : 'never') + '. ' + S.cohorts.length + ' cohorts, ' + S.cohorts.reduce(function(n, c){ return n + c.roster.length; }, 0) + ' people on rosters.</p></div></div>';
}

/* ---------- data: health, success, learner data ---------- */
function dataNav(on){ return '<div class="subnav">' + [['health', 'Program health'], ['success', 'Success scorecard'], ['learners', 'Learner data']].map(function(t){ return '<a href="#data/' + t[0] + '" class="' + (t[0] === on ? 'on' : '') + '">' + t[1] + '</a>'; }).join('') + '</div>'; }
function renderData(tab){
  tab = tab || 'health'; var html = dataNav(tab);
  if(tab === 'health'){
    var H = S.data.health;
    html += '<p class="eyebrow">Program health</p><h1>The first ninety days, against <em>target</em>.</h1><p class="lede">Enter the latest number for each measure, per hundred managers in the launch wave, and the date it was read. Every entry is kept, so the trend shows. Targets are the proposals in the plan until signed off.</p>' +
      '<div class="xs"><table><tr><th>Measure</th><th>Target</th><th>Latest</th><th>As of</th><th>Trend</th><th>Source</th></tr>' + HEALTH.map(function(m){ var r = H[m.key] || {}, hist = r.history || [], last = hist.length ? hist[hist.length - 1] : null, late = last && last.value !== '' && Number(last.value) < m.target; return '<tr><td><b>' + esc(m.title) + '</b></td><td class="d">' + m.target + ' of 100</td><td><input class="act" type="number" min="0" max="100" data-health="' + m.key + '" value="' + esc(r.value === undefined ? '' : r.value) + '" placeholder="0 to 100"></td><td><input class="asof" type="date" data-health-asof="' + m.key + '" value="' + esc(r.asOf || today()) + '"></td><td>' + (hist.length ? hist.slice(-6).map(function(h){ return '<span title="' + esc(h.at) + '" style="display:inline-block;width:8px;margin-right:2px;height:' + Math.max(3, Math.round(Number(h.value) / 100 * 22)) + 'px;background:' + (Number(h.value) >= m.target ? 'var(--vu-oak)' : 'var(--vu-sand)') + ';vertical-align:bottom"></span>'; }).join('') + ' <span class="small">' + (late ? 'below target' : last ? 'on target' : '') + '</span>' : '<span class="small">No reading yet</span>') + '</td><td>' + esc(m.source) + '</td></tr>'; }).join('') + '</table></div>' +
      '<div class="acts" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn gold" data-act="savehealth">Save these readings</button><a class="btn ghost" href="../launch/#measurement">The measurement plan</a></div>' +
      '<p class="small" style="margin-top:10px">Weekly during launch, December 1 to January 29, then monthly. The funnel on the plan\u2019s page 9 sets the order of these measures.</p>';
  } else if(tab === 'success'){
    var U = S.data.success, lv = '';
    html += '<p class="eyebrow">Success scorecard</p><h1>Learning, behavior, and the <em>business</em>.</h1><p class="lede">Baselines come from Oracle before November 25. Enter them here with the latest reading as it arrives; targets stay as proposed until signed off. Business numbers are read beside the same number for managers who have not yet completed Foundations, and never for a group under ten.</p>' +
      '<div class="xs"><table><tr><th>Measure</th><th>Baseline</th><th>Year one target</th><th>Year two target</th><th>Latest</th><th>As of</th><th>Source, cadence</th></tr>' + SUCCESS.map(function(m){ var r = U[m.key] || {}, head = m.level !== lv ? '<tr class="lvl"><td colspan="7" style="background:#FBF6EA"><span class="mono">' + m.level + '</span></td></tr>' : ''; lv = m.level; return head + '<tr><td><b>' + esc(m.title) + '</b></td><td><input class="act" style="width:120px" data-success="' + m.key + '" data-f="baseline" value="' + esc(r.baseline || '') + '" placeholder="FY26"></td><td class="d">' + esc(m.y1) + '</td><td class="d">' + esc(m.y2) + '</td><td><input class="act" style="width:120px" data-success="' + m.key + '" data-f="latest" value="' + esc(r.latest || '') + '"></td><td><input class="asof" type="date" data-success="' + m.key + '" data-f="asOf" value="' + esc(r.asOf || '') + '"></td><td>' + esc(m.source) + ', ' + esc(m.cadence.toLowerCase()) + '</td></tr>'; }).join('') + '</table></div>' +
      '<div class="acts" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn gold" data-act="savesuccess">Save the scorecard</button><a class="btn ghost" href="../launch/#success">The scorecard in the plan</a></div>';
  } else {
    var all = S.cohorts.reduce(function(a, c){ c.roster.forEach(function(r){ a.push(r); }); return a; }, []);
    var conf = all.filter(function(r){ return r.seat === 'confirmed'; }).length, fd = all.filter(function(r){ return r.foundations; }).length, as = all.filter(function(r){ return r.assessment; }).length;
    html += '<p class="eyebrow">Learner data</p><h1>Who is on a voyage, and what the assessment <em>says</em>.</h1>' +
      '<div class="grid c4"><div class="stat"><div class="n">' + all.length + '</div><div class="l">Managers on cohort rosters</div></div><div class="stat"><div class="n">' + conf + '</div><div class="l">Seats confirmed</div></div><div class="stat"><div class="n">' + fd + '</div><div class="l">Foundations complete, on rosters</div></div><div class="stat"><div class="n">' + as + '</div><div class="l">Assessment taken, on rosters</div></div></div>' +
      (S.cohorts.length ? '<div class="xs" style="margin-top:14px"><table><tr><th>Cohort</th><th>Week one</th><th>On the roster</th><th>Confirmed</th><th>Foundations</th><th>Assessment</th><th>Checklist</th></tr>' + S.cohorts.slice().sort(function(a, b){ return cmp(a.dates.w1, b.dates.w1); }).map(function(c){ return '<tr><td><b><a href="#cohort/' + c.id + '/roster">' + esc(c.name) + '</a></b></td><td class="d">' + esc(fmt(c.dates.w1)) + '</td><td>' + c.roster.length + '</td><td>' + seats(c) + ' of ' + c.capacity + '</td><td>' + c.roster.filter(function(r){ return r.foundations; }).length + '</td><td>' + c.roster.filter(function(r){ return r.assessment; }).length + '</td><td>' + progress(c) + ' percent</td></tr>'; }).join('') + '</table></div>' : '') +
      '<h3 style="margin-top:18px">The assessment results dashboard</h3><p class="small">Baselines, completions, re-ups and movement, from the SharePoint list. It asks for the team passphrase; nothing leaves the browser. <a href="../results/" target="_blank" rel="noopener">Open it in its own tab</a>.</p><iframe class="frame" src="../results/" title="Assessment results dashboard" loading="lazy"></iframe>' +
      '<h3 style="margin-top:18px">Where the rest lives</h3><ul><li><b>Oracle Learning</b>: completions by item for compliance, Foundations and the micro modules. Export by learning item number.</li><li><b>Oracle HCM and Recruiting</b>: the business measures, internal fill, promotions, time to fill, retention, pulled quarterly for the scorecard.</li><li><b>The cohort site</b>: the confidence pulse, week one and week four, per cohort.</li></ul>';
  }
  main.innerHTML = html;
}

/* ---------- routing ---------- */
function route(){
  var h = (location.hash || '#home').slice(1).split('/'), v = h[0] || 'home';
  var tab = v === 'home' ? 'home' : v === 'data' ? 'data' : 'cohorts'; $$('#nav a').forEach(function(a){ a.classList.toggle('on', a.getAttribute('data-nav') === tab); });
  if(v === 'cohorts') renderCohorts(); else if(v === 'data') renderData(h[1]); else if(v === 'new') renderNew(); else if(v === 'cohort') renderCohort(h[1], h[2]); else if(v === 'program') renderProgram(); else if(v === 'calendar') renderCalendar(); else if(v === 'settings') renderSettings(); else renderHome();
  window.scrollTo(0, 0);
}
function fd(form){ var o = {}; Array.prototype.forEach.call(form.elements, function(el){ if(el.name) o[el.name] = el.value.trim(); }); return o; }
function seed(){
  if(S.cohorts.length && !confirm('Add the four 2027 cohorts from the plan to the cohorts already here?')) return;
  [['Cohort 1', '1', 'Q1 2027', '2027-01-18', 'Rehearsal graduates and early completers, nominated by December 18'], ['Cohort 2', '2', 'Q2 2027', '2027-04-12', 'Launch wave completers, invited from February 1'], ['Cohort 3', '3', 'Q3 2027', '2027-07-12', 'Launch wave and new managers'], ['Cohort 4', '4', 'Q4 2027', '2027-10-04', 'New managers and the waitlist']].forEach(function(x){ newCohort({ name:x[0], number:x[1], quarter:x[2], w1:x[3], w2:addDays(x[3], 7), w3:addDays(x[3], 14), cap:addDays(x[3], 21), notes:x[4], facilitators:S.settings.facilitators, capacity:S.settings.capacity }); });
  save('Four cohorts added from the plan.'); route();
}
document.addEventListener('submit', function(e){
  var f = e.target.closest('form[data-form]'); if(!f) return; e.preventDefault();
  var kind = f.getAttribute('data-form'), d = fd(f), c = f.getAttribute('data-id') ? cohort(f.getAttribute('data-id')) : null;
  if(kind === 'new'){ if(!d.w1) return; if(!d.w2) d.w2 = addDays(d.w1, 7); if(!d.w3) d.w3 = addDays(d.w1, 14); if(!d.cap) d.cap = addDays(d.w1, 21); var nc = newCohort(d); save('Cohort created with its checklist and communications.'); location.hash = '#cohort/' + nc.id; return; }
  if(!c && kind !== 'settings' && kind !== 'pitem' && kind !== 'pnote') return;
  if(kind === 'edit'){ ['name', 'number', 'quarter', 'unit', 'room', 'virtualLink', 'facilitators', 'buLeader', 'notes', 'status'].forEach(function(k){ c[k] = d[k]; }); c.capacity = parseInt(d.capacity, 10) || c.capacity; var moved = c.dates.w1 !== d.w1 || c.dates.cap !== d.cap; c.dates = { w1:d.w1, w2:d.w2, w3:d.w3, cap:d.cap }; if(moved) logTo(c, 'Dates changed: week one ' + fmt(d.w1) + ', capstone ' + fmt(d.cap)); save('Details saved.'); route(); }
  else if(kind === 'person'){ c.roster.push({ id:uid(), name:d.name, email:d.email, unit:d.unit, mm:d.mm, seat:d.seat, foundations:false, assessment:false, notes:d.notes }); logTo(c, 'Added ' + d.name + ' to the roster'); save('Added.'); route(); }
  else if(kind === 'paste'){ var n = 0; d.list.split(/\n/).forEach(function(line){ var p = line.split(/\t|,/).map(function(x){ return x.trim(); }); if(!p[0]) return; c.roster.push({ id:uid(), name:p[0], email:p[1] || '', unit:p[2] || '', mm:p[3] || '', seat:'nominated', foundations:false, assessment:false, notes:'' }); n++; }); if(n){ logTo(c, 'Added ' + n + ' to the roster from a list'); save(n + ' added as nominated.'); } route(); }
  else if(kind === 'item'){ c.checklist.push({ id:uid(), phase:d.phase, title:d.title, owner:d.owner, date:d.date, done:false, doneAt:'' }); save('Item added.'); route(); }
  else if(kind === 'comm'){ c.comms.push({ id:uid(), title:d.title, channel:d.channel, date:d.date, done:false }); save('Message added.'); route(); }
  else if(kind === 'doc'){ c.docs.push({ id:uid(), title:d.title, url:d.url, kind:d.kind, owner:d.owner, addedAt:today() }); logTo(c, 'Linked ' + d.title); save('Link added.'); route(); }
  else if(kind === 'note'){ logTo(c, d.text); save('Noted.'); route(); }
  else if(kind === 'pitem'){ var rel = Math.round((new Date(d.date + 'T12:00:00') - new Date(S.settings.launchDate + 'T12:00:00')) / 86400000); S.program.checklist.push({ id:uid(), phase:d.phase, title:d.title, owner:d.owner, rel:rel, done:false, doneAt:'' }); save('Item added.'); route(); }
  else if(kind === 'pnote'){ logTo(S.program, d.text); save('Noted.'); route(); }
  else if(kind === 'settings'){ S.settings.launchDate = d.launchDate || S.settings.launchDate; S.settings.capacity = parseInt(d.capacity, 10) || 25; S.settings.facilitators = d.facilitators; S.settings.by = d.by; S.settings.saveUrl = d.saveUrl; S.settings.loadUrl = d.loadUrl; S.settings.key = d.key; save('Settings saved.'); route(); }
});
document.addEventListener('change', function(e){
  var el = e.target, act = el.getAttribute('data-act'); if(!act) return;
  var c = el.getAttribute('data-id') ? cohort(el.getAttribute('data-id')) : null;
  if(act === 'tick' && c){ c.checklist.forEach(function(i){ if(i.id === el.getAttribute('data-iid')){ i.done = el.checked; i.doneAt = el.checked ? today() : ''; if(el.checked) logTo(c, 'Done: ' + i.title); } }); save(); el.closest('tr').className = el.checked ? 'done' : ''; recount(el); }
  else if(act === 'ctick' && c){ c.comms.forEach(function(i){ if(i.id === el.getAttribute('data-iid')){ i.done = el.checked; if(el.checked) logTo(c, 'Sent: ' + i.title); } }); save(); el.closest('tr').className = el.checked ? 'done' : ''; }
  else if(act === 'ptick'){ S.program.checklist.forEach(function(i){ if(i.id === el.getAttribute('data-iid')){ i.done = el.checked; i.doneAt = el.checked ? today() : ''; if(el.checked) logTo(S.program, 'Done: ' + i.title); } }); save(); el.closest('tr').className = el.checked ? 'done' : ''; recount(el); }
  else if(act === 'seat' && c){ c.roster.forEach(function(r){ if(r.id === el.getAttribute('data-rid')){ r.seat = el.value; logTo(c, r.name + ': seat ' + el.value); } }); save(); }
  else if(act === 'rflag' && c){ c.roster.forEach(function(r){ if(r.id === el.getAttribute('data-rid')) r[el.getAttribute('data-flag')] = el.checked; }); save(); }
});
/* the phase heading keeps its count without redrawing the page */
function recount(el){ var ph = el.closest('.phase'); if(!ph) return; var all = $$('input[type=checkbox]', ph), done = all.filter(function(x){ return x.checked; }).length, h = $('h3', ph); if(h) h.innerHTML = h.innerHTML.replace(/\d+ of \d+$/, done + ' of ' + all.length); }
document.addEventListener('click', function(e){
  var b = e.target.closest('[data-act]'); if(!b || b.tagName === 'INPUT' || b.tagName === 'SELECT') return;
  var act = b.getAttribute('data-act'), c = b.getAttribute('data-id') ? cohort(b.getAttribute('data-id')) : null;
  if(act === 'seed') seed();
  else if(act === 'print'){ document.body.classList.add('print-all'); var id = c ? c.id : (location.hash.split('/')[1] || ''); var cc = cohort(id); if(cc){ var pane = $('.tabpane'); pane.innerHTML = '<h2>Overview</h2>' + overviewHTML(cc) + '<h2>Roster</h2>' + rosterHTML(cc) + '<h2>Checklist</h2>' + checklistHTML(cc) + '<h2>Communications</h2>' + commsHTML(cc) + '<h2>Documents</h2>' + docsHTML(cc) + '<h2>Log</h2>' + logHTML(cc); } window.print(); setTimeout(function(){ document.body.classList.remove('print-all'); route(); }, 500); }
  else if(act === 'dup' && c){ var d = JSON.parse(JSON.stringify(c)); d.id = uid(); d.name = c.name + ' (copy)'; d.number = String(S.cohorts.length + 1); d.roster = []; d.log = []; d.docs = []; d.checklist.forEach(function(i){ i.id = uid(); i.done = false; i.doneAt = ''; }); d.comms.forEach(function(i){ i.id = uid(); i.done = false; }); d.createdAt = new Date().toISOString(); logTo(d, 'Copied from ' + c.name); S.cohorts.push(d); save('Copied. Set its dates in Overview.'); location.hash = '#cohort/' + d.id; }
  else if(act === 'del' && c){ if(!confirm('Delete ' + c.name + ', its roster, checklist and log? Export first if you want a copy.')) return; S.cohorts = S.cohorts.filter(function(x){ return x.id !== c.id; }); save('Deleted.'); location.hash = '#cohorts'; }
  else if(act === 'rdel' && c){ c.roster = c.roster.filter(function(r){ return r.id !== b.getAttribute('data-rid'); }); save('Removed.'); route(); }
  else if(act === 'idel' && c){ c.checklist = c.checklist.filter(function(i){ return i.id !== b.getAttribute('data-iid'); }); save(); route(); }
  else if(act === 'ddel' && c){ c.docs = c.docs.filter(function(d){ return d.id !== b.getAttribute('data-did'); }); save(); route(); }
  else if(act === 'rcsv' && c){ var csv = 'Name,Email,Unit,Manager\'s manager,Seat,Foundations,Assessment,Notes\n' + c.roster.map(function(r){ return [r.name, r.email, r.unit, r.mm, r.seat, r.foundations ? 'yes' : 'no', r.assessment ? 'yes' : 'no', r.notes].map(function(x){ return '"' + String(x || '').replace(/"/g, '""') + '"'; }).join(','); }).join('\n'); download(c.name.replace(/\W+/g, '-') + '-roster.csv', csv, 'text/csv'); }
  else if(act === 'export'){ download('manager-voyage-ops-' + today() + '.json', JSON.stringify(S, null, 2), 'application/json'); }
  else if(act === 'import'){ $('#importFile').click(); }
  else if(act === 'reset'){ if(!confirm('Clear every cohort, roster and checklist in this browser? Export first if you want a copy.')) return; localStorage.removeItem(KEY); load(); save('Cleared.'); route(); }
  else if(act === 'savehealth'){ $$('[data-health]').forEach(function(inp){ var k = inp.getAttribute('data-health'), v = inp.value.trim(); if(v === '') return; var r = S.data.health[k] = S.data.health[k] || { history:[] }; var asOf = ($('[data-health-asof="' + k + '"]') || {}).value || today(); r.value = v; r.asOf = asOf; r.history = r.history || []; if(!r.history.length || r.history[r.history.length - 1].value !== v || r.history[r.history.length - 1].at !== asOf) r.history.push({ at:asOf, value:v }); }); logTo(S.program, 'Health readings saved'); save('Readings saved.'); route(); }
  else if(act === 'savesuccess'){ $$('[data-success]').forEach(function(inp){ var k = inp.getAttribute('data-success'), f = inp.getAttribute('data-f'); var r = S.data.success[k] = S.data.success[k] || {}; r[f] = inp.value.trim(); }); logTo(S.program, 'Scorecard saved'); save('Scorecard saved.'); route(); }
  else if(act === 'pull'){ syncPull().then(function(changed){ toast(changed ? 'Loaded the shared copy.' : 'Nothing newer in the shared copy.'); route(); }); }
});
$('#importFile').addEventListener('change', function(){ var f = this.files[0]; if(!f) return; var r = new FileReader(); r.onload = function(){ try{ var j = JSON.parse(r.result); if(!j || !j.cohorts) throw new Error('shape'); if(!confirm('Replace everything here with the imported copy (' + j.cohorts.length + ' cohorts)?')) return; S = j; if(!S.settings) S.settings = blank().settings; save('Imported.'); route(); }catch(e){ toast('That file is not a portal export.'); } }; r.readAsText(f); this.value = ''; });
function download(name, text, type){ var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type:type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500); }

load(); route(); window.addEventListener('hashchange', route);
if(S.settings.loadUrl) syncPull().then(function(changed){ if(changed) route(); });
window.MV_OPS = { store:function(){ return S; }, save:save, seed:seed };
})();
