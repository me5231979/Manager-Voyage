/* =====================================================================
   MANAGER VOYAGE - dashboard engine
   Views: welcome (identity from Oracle, confirm state if unknown) then the
   dashboard: four program areas as tiles that act as tabs, one panel of
   rows at a time, a rail with Up next, Milestones, and Who to call.

   Status per item:
     oracle   completion recorded in Oracle Learning (feed)         "Verified in Oracle"
     self     the manager marked it done here (attestation)         "Complete, self-reported"
     opened   the manager opened the Oracle link, not yet finished  "Opened"
     todo     nothing yet                                           "Not started"
   No frameworks. State lives in the profile (localStorage, and SCORM
   suspend_data when launched from Oracle Learning).
   ===================================================================== */
(function () {
  'use strict';

  var P = window.MV_PROGRAM, CFG = window.MV_CONFIG || {};
  var profile = null;
  var area = null;             /* selected tile: compliance | mrc | portal | cohort */
  var scoDone = false;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmtDate(iso) { if (!iso) return ''; var d = new Date(iso + 'T12:00:00'); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
  function addDays(iso, n) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function todayIso() { return new Date().toISOString().slice(0, 10); }
  function dayOfPath() {
    if (!profile || !profile.startDate) return 1;
    var d = Math.floor((new Date(todayIso() + 'T12:00:00') - new Date(profile.startDate + 'T12:00:00')) / 86400000) + 1;
    return Math.max(1, d);
  }
  function greeting() { var h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
  function stateName(s) { return (P.states[s] || {}).name || ''; }
  function courseUrl(it) {
    if (it.url) return it.url;
    if (window.MVOracle) return MVOracle.courseUrl(it);
    if (it.oracleUrl) return it.oracleUrl;
    if (it.localUrl) return it.localUrl;
    if (CFG.oracleLearningBase && it.oracleCode) return CFG.oracleLearningBase + encodeURIComponent(it.oracleCode);
    return null;
  }

  /* ---------- the manager's required items ---------- */
  function myCompliance() {
    if (!profile || !profile.state) return [];
    return P.compliance.filter(function (c) { return c.state === profile.state || c.state === 'ALL'; })
      .map(function (c) { return Object.assign({}, c, { kind: c.type === 'Legal' ? 'legal' : 'advisory', area: 'compliance',
        dueIso: c.deadlineDays > 0 ? addDays(profile.startDate, c.deadlineDays) : profile.startDate,
        dueLabel: c.deadlineDays === 0 ? 'On hire' : c.deadlineDays >= 180 ? 'Within 6 months' : 'By Day ' + c.deadlineDays }); });
  }
  function foundationOrder() {
    try { var d = JSON.parse(localStorage.getItem('mv.foundation.v1') || 'null'); return d && d.order && d.order.length ? d.order : null; } catch (e) { return null; }
  }
  function orderedTracks() {
    var order = foundationOrder();
    var tracks = P.mrc.tracks.slice();
    if (!order) return tracks;
    var first = {}; order.forEach(function (id, i) { tracks.forEach(function (t) { if (t.modules.some(function (m) { return m.id === id; }) && first[t.id] === undefined) first[t.id] = i; }); });
    return tracks.sort(function (a, b) { return (a.phase - b.phase) || ((first[a.id] === undefined ? 99 : first[a.id]) - (first[b.id] === undefined ? 99 : first[b.id])); });
  }
  function mrcItems() {
    var f = P.mrc.foundation;
    var mea = { id: 'MEA', kind: 'assessment', area: 'mrc', track: null, title: 'Manager Effectiveness Assessment', minutes: 10, source: 'Microsoft Forms', url: CFG.assessmentUrl || null,
      desc: 'Fourteen questions on how often you do the habits the course teaches. Your score and feedback come by email and set your starting point.',
      why: 'Taken before the Foundation course so the course meets you where you are, and again in six months to see the change.',
      dueIso: addDays(profile.startDate, 3), dueLabel: 'Before the Foundation course' };
    var out = [mea, Object.assign({}, f, { kind: 'foundation', area: 'mrc', track: null, desc: 'The web course, about thirty-five minutes: what changed, five ideas, your first year, who handles what, the four jobs of a manager, and your assessment results. Narrated, with a short activity on every page and a quick check.', dueIso: addDays(profile.startDate, 7), dueLabel: 'After the assessment, by Day 7' })];
    orderedTracks().forEach(function (t) {
      t.modules.forEach(function (m) {
        out.push(Object.assign({}, m, { kind: 'course', area: 'mrc', track: t, oracleCode: m.id, minutes: m.mins || 15,
          dueIso: addDays(profile.startDate, t.phase === 1 ? 30 : 60), dueLabel: 'By Day ' + (t.phase === 1 ? 30 : 60) }));
      });
    });
    return out;
  }
  function requiredItems() { return myCompliance().concat(mrcItems()); }

  /* ---------- status ---------- */
  function statusOf(id) {
    var c = profile.completions[id];
    if (c) return c.source === 'oracle' ? 'oracle' : 'self';
    if (profile.opened[id]) return 'opened';
    return 'todo';
  }
  function isDone(id) { var s = statusOf(id); return s === 'oracle' || s === 'self'; }
  function pillFor(id) {
    var s = statusOf(id);
    if (s === 'oracle') return '<span class="pill pill--oracle">Verified in Oracle</span>';
    if (s === 'self') { var c = profile.completions[id]; return '<span class="pill pill--self">&#10003; Completed' + (c && c.at ? ' ' + fmtDate(c.at) : '') + '</span>'; }
    if (s === 'opened') return '<span class="pill pill--opened">Opened</span>';
    return '<span class="pill pill--todo">Not started</span>';
  }
  function bothRequiredDone() {
    var req = requiredItems();
    return req.length > 0 && req.every(function (it) { return isDone(it.id); });
  }
  function complianceDone() { var c = myCompliance(); return c.length > 0 && c.every(function (it) { return isDone(it.id); }); }
  function mrcDone() { return mrcItems().every(function (it) { return isDone(it.id); }); }

  function save() {
    MVProfile.save(profile);
    if (bothRequiredDone() && !scoDone) {
      scoDone = true;
      if (window.MVScorm && MVScorm.connected) MVScorm.complete();
      confetti();
      toast('Manager Foundations is complete and recorded. The four-week cohort is optional; an invitation follows from Oracle.');
    }
  }

  /* ---------- rows ---------- */
  function dueHtml(it) {
    if (!it.dueIso) return '';
    var past = !isDone(it.id) && it.dueIso < todayIso();
    var cls = past ? 'past' : (it.kind === 'legal' ? 'hard' : 'soft');
    return '<span class="item__due ' + cls + '">' + (past ? 'Past due · ' : '') + esc(it.dueLabel) + ' (' + fmtDate(it.dueIso) + ')</span>';
  }
  function rowHTML(it) {
    var url = courseUrl(it);
    var done = isDone(it.id);
    var chip = it.kind === 'legal' ? 'Required by law' : it.kind === 'advisory' ? 'Vanderbilt policy' : it.kind === 'foundation' ? 'Foundation' : it.kind === 'assessment' ? 'Assessment' : (it.format || 'Module');
    var meta = [];
    if (it.mins || it.minutes) meta.push('<span>' + (it.mins || it.minutes) + ' min</span>');
    meta.push('<span class="srcbadge">' + esc(it.source || 'Oracle Learning') + '</span>');
    if (it.audience) meta.push('<span>' + esc(it.audience === 'Manager' ? 'Supervisor version' : 'All staff version') + '</span>');
    if (it.cadence) meta.push('<span>' + esc(it.cadence) + '</span>');
    meta.push(dueHtml(it));
    var why = it.why ? '<details class="item__why"><summary>Why you take it</summary><p>' + esc(it.why) + (it.note ? ' <b>' + esc(it.note) + '</b>' : '') + '</p></details>' : '';
    var local = !!url && !/^https?:/i.test(url);
    var cta = url
      ? '<a class="btn" data-go="' + esc(it.id) + '" href="' + esc(url) + '"' + (local ? '' : ' target="_blank" rel="noopener"') + '>' + (done ? (it.kind === 'assessment' ? 'Take it again' : 'Revisit') : statusOf(it.id) === 'opened' ? 'Continue' : local ? 'Open the course' : it.kind === 'assessment' ? 'Take the assessment' : 'Open in Oracle') + '</a>'
      : '<span class="btn is-disabled" title="Oracle link coming soon">Link coming soon</span>';
    var mark = '';
    if (CFG.allowSelfReport !== false) {
      mark = done && statusOf(it.id) === 'self'
        ? '<button type="button" class="item__minor item__minor--text" data-reopen="' + esc(it.id) + '" title="Back to not started">Undo</button>'
        : (!done ? '<button type="button" class="btn btn--mark" data-done="' + esc(it.id) + '" aria-label="Mark ' + esc(it.title) + ' complete">Mark complete</button>' : '');
    }
    return '<article class="item item--row item--' + it.kind + (done ? ' item--done' : '') + '" data-item="' + esc(it.id) + '">' +
      '<div class="row__chips"><span class="typechip">' + esc(chip) + '</span>' + (it.oracleCode && /^R-/.test(it.oracleCode) ? '<span class="codechip">' + esc(it.oracleCode) + '</span>' : '') + '</div>' +
      '<div class="row__main"><h4>' + esc(it.title) + '</h4><p class="row__desc">' + esc(it.desc) + '</p><div class="item__meta">' + meta.join('') + '</div>' + why + '</div>' +
      pillFor(it.id) +
      '<div class="item__actions">' + cta + mark + '</div></article>';
  }
  function lane(title, kicker, items, note, collapse) {
    var done = items.filter(function (it) { return isDone(it.id); }).length;
    var head = '<div class="lane__title"><h3>' + esc(title) + '</h3><span>' + esc(kicker) + '</span><span class="lane__count">' + done + ' of ' + items.length + ' complete</span></div>' +
      (note ? '<p class="lane__note">' + note + '</p>' : '');
    var rows = '<div class="lane__rows">' + items.map(rowHTML).join('') + '</div>';
    if (collapse === undefined) return '<div class="lane">' + head + rows + '</div>';
    return '<details class="lane"' + (collapse ? '' : ' open') + '><summary>' + head + '</summary>' + rows + '</details>';
  }

  /* ---------- panels ---------- */
  function panelCompliance() {
    var items = myCompliance();
    var mine = items.filter(function (c) { return c.state !== 'ALL'; });
    var all = items.filter(function (c) { return c.state === 'ALL'; });
    var legal = items.filter(function (c) { return c.kind === 'legal'; }).length;
    return '<div class="panel__head"><h2>Compliance <em>courses</em>.</h2><span>Component 01 · Required · Days 1 to 60</span></div>' +
      '<ul class="panel__points">' +
      '<li><b>Assigned the day your role began,</b> from where your employees work: <b>' + esc(stateName(profile.state)) + '</b>.</li>' +
      '<li><b>' + legal + ' required by law.</b> Missing a deadline creates institutional liability. The rest are Vanderbilt policy; both are mandatory.</li>' +
      '<li><b>Take the supervisor version</b> in addition to the all-staff version.</li>' +
      '<li><b>Compliance is the floor, not the bar.</b></li></ul>' +
      lane(stateName(profile.state) + ' requirements', 'Assigned from the work location', mine) +
      lane('Every location', 'Assigned to every Vanderbilt manager', all);
  }
  function panelMrc() {
    var items = mrcItems();
    var mea = items.filter(function (it) { return it.kind === 'assessment'; })[0];
    var f = items.filter(function (it) { return it.kind === 'foundation'; })[0];
    var fDone = isDone(f.id);
    var ordered = !!foundationOrder();
    var day = dayOfPath();
    var html = '<div class="panel__head"><h2>Manager Responsibilities <em>Course</em>.</h2><span>Component 02 · Strongly recommended · Days 1 to 60</span></div>' +
      '<ul class="panel__points">' +
      '<li><b>First, the assessment.</b> Ten minutes; your score and feedback come by email.</li>' +
      '<li><b>Then the Foundation course,</b> about thirty-five minutes on the web.</li>' +
      '<li><b>Then the micro modules in Oracle Learning,</b> one common task each: the systems you approve in, the people obligations you carry, the processes that run the role, and the Vanderbilt mission and ecosystem.</li>' +
      '<li><b>Every module is interactive</b> and ends with a knowledge check that Oracle records.</li></ul>' +
      lane(mea.title, 'Ten minutes · Before the Foundation course', [mea], isDone(mea.id) ? 'Done. Keep the results email; the Foundation course asks you to review it. Retake the assessment in six months.' : 'Take it first. Your score and feedback come by email, and the Foundation course starts from them. Tap Mark complete once you have submitted it.') +
      lane(f.title, '35 minutes on the web · After the assessment', [f], ordered ? 'Your assessment results set the order of the tracks below: weakest first inside each window.' : (fDone ? 'Foundation complete.' : 'Complete the foundation next. It unlocks the micro modules and orders them from your self-assessment.'));
    var opened = false;
    var p1done = items.filter(function (it) { return it.track && it.track.phase === 1; }).every(function (it) { return isDone(it.id); });
    [1, 2].forEach(function (phase) {
      var tracks = orderedTracks().filter(function (t) { return t.phase === phase; });
      /* the second window stays folded until the first is done or Day 30 has passed */
      var phaseOpen = phase === 1 ? !(p1done && day > 30) : (p1done || day > 30);
      var inner = '';
      tracks.forEach(function (t) {
        var mods = items.filter(function (it) { return it.track && it.track.id === t.id; });
        var open = phaseOpen && !opened && mods.some(function (it) { return !isDone(it.id); });
        if (open) opened = true;
        inner += lane('Track: ' + t.title, t.why, mods, '<b>By the end.</b> ' + esc(t.outcome), !open);
      });
      html += '<details class="lane phase"' + (phaseOpen ? ' open' : '') + '><summary><div class="lane__title"><h3>' + (phase === 1 ? 'Days 1 to 30' : 'Days 31 to 60') + '</h3><span>' +
        esc(tracks.map(function (t) { return t.title; }).join(' and ')) + '</span><span class="lane__count">' + (phaseOpen ? '' : 'Opens after Day 30') + '</span></div>' +
        '<p class="lane__note">' + (phase === 1 ? 'By Day 30 you can approve, hire, and explain the mission.' : 'By Day 60 you can run a 1:1, give feedback, handle a leave request, and document a concern.') + '</p></summary>' + inner + '</details>';
    });
    return html;
  }
  function panelPortal() {
    var url = CFG.portalUrl || P.portal.url;
    var bey = P.portal.beyond;
    return '<div class="panel__head"><h2>Manager <em>Portal</em>.</h2><span>Component 04 · Always on · Reference</span></div>' +
      '<div class="eligible"><div><b>' + esc(P.portal.summary) + '</b> Nothing to complete here. Come back whenever you need a template, a policy, or a name.</div>' +
      (url ? '<a class="btn" href="' + esc(url) + '" target="_blank" rel="noopener">Open the Manager Portal</a>' : '<span class="btn is-disabled">Portal link coming soon</span>') + '</div>' +
      (bey ? '<div class="lane"><div class="lane__title"><h3>Beyond the portal</h3><span>' + esc(bey.intro) + '</span></div>' +
        bey.groups.map(function (g) {
          return '<h4 class="lane__sub">' + esc(g.title) + '</h4><div class="cardgrid">' + g.items.map(function (r) {
            var inner = '<span class="card__kicker">' + esc(r.src) + '</span><h3>' + esc(r.title) + '</h3><p>' + esc(r.why) + '</p>';
            return r.url
              ? '<a class="card card--link" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + inner + '<span class="card__go" aria-hidden="true">&#8599;</span></a>'
              : '<div class="card">' + inner + '</div>';
          }).join('') + '</div>';
        }).join('') + '</div>' : '');
  }
  function panelCohort() {
    var ok = bothRequiredDone();
    var req = CFG.cohortRequestUrl || P.cohort.requestUrl;
    var open = requiredItems().filter(function (it) { return !isDone(it.id); }).length;
    var L = CFG.cohortLinks || {};
    var C = P.cohort;
    function chip(t, cls) { return '<span class="cw__chip' + (cls ? ' ' + cls : '') + '">' + esc(t) + '</span>'; }
    function link(url, label) { return url ? '<a class="cw__link" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + '</a>' : '<span class="cw__soon">' + esc(label) + ' · link coming</span>'; }
    function row(k, sub, body, cls) { return '<div class="cwr' + (cls ? ' ' + cls : '') + '"><div class="cwr__k">' + esc(k) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div><div class="cwr__v">' + body + '</div></div>'; }
    function weekCard(w) {
      var chips = [];
      if (w.n === 0) chips.push(chip('Online · own time'));
      if (w.live && w.n === 1) chips.push(chip('Hybrid kickoff · 1 hour', 'cw__chip--live'));
      if (w.live && w.n === 4) chips.push(chip('Hybrid capstone · 2 hours', 'cw__chip--live'));
      if (w.coreNote) chips.push(chip('Core module as prework'));
      if (w.n > 0 && !w.studio) chips.push(chip('No Scenario Studio'));
      if (w.discussion) chips.push(chip('Discussion · ' + w.discussion.mins + ' min · virtual'));
      var rows = '';
      if (w.live && w.n === 1) rows += row('Hybrid', w.live.when, '<b class="cwr__t">' + esc(w.live.title) + '.</b><p>' + esc(w.live.desc) + '</p>', 'cwr--live');
      if (w.core) rows += row('Core module', w.n === 0 ? 'Before the kickoff' : 'By Monday', '<ul class="cw__list">' + w.core.map(function (c) {
        return '<li><b>' + esc(c.title) + '</b>' + (c.optional ? ' <span class="cw__opt">optional</span>' : '') + '<span class="cw__by">' + esc(c.by) + '</span>' + (c.note ? '<span class="cw__note">' + esc(c.note) + '</span>' : '') + link(c.url, 'Open in Oracle Learning') + '</li>';
      }).join('') + '</ul>');
      if (w.coreNote) rows += row('Core module', 'Done as prework', '<p>' + esc(w.coreNote) + '</p>');
      if (w.lab) rows += row('Learning Lab', 'SparkWise · Tuesday or Wednesday · 45 min', '<b class="cwr__t">' + esc(w.lab.title) + '.</b><p>' + esc(w.lab.desc) + '</p>' + link(L.sparkwise, 'Open SparkWise'));
      if (w.studio) rows += row('Scenario Studio', 'Yoodli · Thursday · 15 min', '<b class="cwr__t">' + esc(w.studio.title) + '.</b><p>' + esc(w.studio.desc) + '</p>' + link(L.yoodli, 'Open Yoodli'));
      if (w.discussion) rows += row('Discussion', 'Friday · ' + w.discussion.mins + ' min · virtual · FLH facilitated', '<ul class="cw__list cw__list--plain">' + w.discussion.items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>');
      if (w.live && w.n === 4) rows += row('Hybrid', w.live.when, '<b class="cwr__t">' + esc(w.live.title) + '.</b><p>' + esc(w.live.desc) + '</p>', 'cwr--live');
      if (w.playbook) rows += row('Playbook', w.n === 0 ? 'Bring it to the kickoff' : w.n === 4 ? 'Due before the capstone' : 'Due Sunday', '<b class="cwr__t">' + esc(w.playbook.title) + '.</b><p>' + esc(w.playbook.desc) + '</p>' + (L.playbook ? link(L.playbook, 'Open the Playbook template') : ''));
      if (w.extra) rows += row('Before you start', '10 min', '<b class="cwr__t">' + esc(w.extra.title) + '.</b><p>' + esc(w.extra.desc) + '</p>');
      return '<article class="cw"><div class="cw__head"><span class="cw__no">W' + w.n + '</span><div><h3>' + esc(w.title) + (w.when ? ' <span class="cw__when">' + esc(w.when) + '</span>' : '') + '</h3><p>' + esc(w.outcome) + '</p><div class="cw__chips">' + chips.join('') + '</div></div></div><div class="cw__rows">' + rows + '</div></article>';
    }
    return '<div class="panel__head"><h2>The four-week <em>cohort</em>.</h2><span>Component 03 · Optional but recommended · Quarterly · 100 seats</span></div>' +
      '<p class="panel__lead">' + esc(C.summary) + '</p>' +
      '<p class="panel__lead">' + esc(C.prerequisite) + '</p>' +
      '<div class="eligible' + (ok ? '' : ' eligible--locked') + '"><div>' + (ok
        ? '<b>You are eligible, and Manager Foundations is already complete.</b> The cohort is optional but recommended. Oracle sends the next quarterly invitation; you can also ask for a seat now.'
        : '<b>' + open + ' item' + (open === 1 ? '' : 's') + ' on your Day 60 path to go.</b> ' + esc(C.eligibility) + ' Units outside the central budget are billed per seat.') + '</div>' +
      (ok && req ? '<a class="btn" href="' + esc(req) + '" target="_blank" rel="noopener">Request a seat</a>' : ok ? '<span class="btn is-disabled">Request link coming soon</span>' : '<span class="pill pill--locked">Unlocks at Day 60 completion</span>') + '</div>' +
      '<div class="lane"><div class="lane__title"><h3>The weekly rhythm</h3><span>The same four beats, in the same order, every week</span></div>' +
      '<div class="rhythm">' + C.rhythm.map(function (r, i) {
        return '<div class="rhythm__step"><span class="rhythm__when">' + esc(r.when) + '</span><h4>' + esc(r.beat) + (r.tool ? ' <small>in ' + esc(r.tool) + '</small>' : '') + '</h4><p>' + esc(r.desc) + '</p><span class="rhythm__len">' + esc(r.mins) + '</span></div>';
      }).join('') + '</div><p class="lane__note">' + esc(C.playbookNote) + '</p></div>' +
      '<div class="lane"><div class="lane__title"><h3>Week by week</h3><span>Prework, then four weeks</span></div>' + C.weeks.map(weekCard).join('') + '</div>' +
      '<div class="cardgrid">' +
      '<div class="card card--wide"><span class="card__kicker">What you produce</span><h3>Three deliverables, presented at the capstone</h3>' +
      C.deliverables.map(function (d) { return '<p><b>' + esc(d.title) + '.</b> ' + esc(d.desc) + '</p>'; }).join('') + '</div>' +
      '<div class="card card--wide"><span class="card__kicker">Tools</span><h3>What powers the four weeks</h3>' +
      C.tools.map(function (t) { return '<p><b>' + esc(t.name) + '.</b> ' + esc(t.desc) + (L[t.key] ? ' <a class="cw__link" href="' + esc(L[t.key]) + '" target="_blank" rel="noopener">Open</a>' : '') + '</p>'; }).join('') + '</div>' +
      '</div>';
  }

  /* ---------- dashboard ---------- */
  var AREAS = [
    { id: 'compliance', num: '01 · Required', title: 'Compliance Courses', panel: panelCompliance, cls: 'cattile--compliance',
      count: function () { var c = myCompliance(); return { done: c.filter(function (i) { return isDone(i.id); }).length, total: c.length }; } },
    { id: 'mrc', num: '02 · Strongly recommended', title: 'Manager Responsibilities Course', panel: panelMrc,
      count: function () { var c = mrcItems(); return { done: c.filter(function (i) { return isDone(i.id); }).length, total: c.length }; } },
    { id: 'cohort', num: '03 · Optional · Recommended', title: 'Four-Week Cohort', panel: panelCohort, count: function () { return null; } },
    { id: 'portal', num: '04 · Always on · Reference', title: 'Manager Portal', panel: panelPortal, count: function () { return null; } }
  ];

  function renderDashboard() {
    var first = profile.firstName || 'there';
    $('#dashGreeting').textContent = greeting() + ', ' + first;
    var day = dayOfPath();
    $('#dashDay').textContent = (day <= P.windowDays ? 'Day ' + day + ' of ' + P.windowDays : 'Day ' + day + ', past the 60-day window') +
      ' · ' + (stateName(profile.state) || 'Location not set') + ' · Started ' + fmtDate(profile.startDate);

    var req = requiredItems();
    renderTimeline(day);

    var how = $('#howline');
    if (!profile.state) {
      how.className = 'howline howline--warn';
      how.innerHTML = '<b>Choose your work location</b> to see your compliance requirements. Everything else is the same for every manager.';
    } else {
      how.className = 'howline';
      how.innerHTML = 'The compliance courses are <b>required in your first 60 days</b>, and the Manager Responsibilities Course is <b>strongly recommended</b> alongside them. Oracle Learning assigned both the day your role began, from your role and your work location in <b>' + esc(stateName(profile.state)) + '</b>. ' +
        (CFG.profileEndpoint ? 'Completions recorded in Oracle appear here automatically.' : 'Open each item in Oracle; when you finish, tap Mark complete and it is written to your record as self-reported.');
    }

    var pv = $('#previewBar');
    var showPreview = !!CFG.previewMode && !CFG.profileEndpoint && !(window.MVScorm && MVScorm.connected);
    pv.hidden = !showPreview;
    if (showPreview) { $('#pvName').value = profile.name || ''; $('#pvState').value = profile.state || ''; $('#pvStart').value = profile.startDate || ''; }

    $('#syncBtn').hidden = !CFG.profileEndpoint;
    var portalUrl = CFG.portalUrl || P.portal.url;
    var pb = $('#portalBtn');
    if (portalUrl) { pb.href = portalUrl; pb.classList.remove('is-disabled'); pb.textContent = 'Manager Portal'; }
    else { pb.removeAttribute('href'); pb.classList.add('is-disabled'); pb.textContent = 'Manager Portal (link coming)'; }

    /* tiles */
    if (!area) {
      var firstOpen = AREAS.filter(function (a) { var c = a.count(); return c && c.done < c.total; })[0];
      area = firstOpen ? firstOpen.id : 'compliance';
    }
    $('#areaTiles').innerHTML = AREAS.map(function (a) {
      var c = a.count(), on = a.id === area;
      var count = c ? (c.done === c.total && c.total ? 'All complete' : (c.total - c.done) + ' to go') : (a.id === 'portal' ? 'Open from Day 1' : (bothRequiredDone() ? 'You are eligible' : 'Opens at Day 60'));
      var badge = a.id === 'compliance' ? (c && c.done === c.total && c.total ? '<span class="cattile__badge cattile__badge--ok">Done</span>' : '<span class="cattile__badge">Deadlines</span>') : '';
      var bar = c ? '<span class="cattile__bar" aria-hidden="true"><i style="width:' + (c.total ? Math.round(c.done / c.total * 100) : 0) + '%"></i></span>' : '';
      return '<button type="button" role="tab" aria-selected="' + on + '" class="cattile ' + (a.cls || '') + (on ? ' on' : '') + '" data-tile="' + a.id + '">' +
        '<span class="cattile__num">' + esc(a.num) + '</span>' + badge + '<h3>' + esc(a.title) + '</h3><span class="cattile__count">' + count + '</span>' + bar + '</button>';
    }).join('');
    $$('#areaTiles [data-tile]').forEach(function (b) {
      b.addEventListener('click', function () { area = b.getAttribute('data-tile'); renderDashboard(); $('#panel').focus({ preventScroll: true }); });
    });

    /* panel */
    var a = AREAS.filter(function (x) { return x.id === area; })[0] || AREAS[0];
    $('#panel').innerHTML = a.panel();

    /* up next: the three nearest things not done, ordered by due date, legal first on ties */
    var next = req.filter(function (it) { return !isDone(it.id); }).sort(function (x, y) {
      return (x.dueIso < y.dueIso ? -1 : x.dueIso > y.dueIso ? 1 : 0) || ((x.kind === 'legal' ? 0 : 1) - (y.kind === 'legal' ? 0 : 1));
    }).slice(0, 3);
    var areaName = { compliance: 'Compliance', mrc: 'Manager Responsibilities Course' };
    $('#upNext').innerHTML = next.length ? next.map(function (it, i) {
      var url = courseUrl(it), local = !!url && !/^https?:/i.test(url), past = it.dueIso < todayIso();
      var go = url ? '<a class="btn" data-go="' + esc(it.id) + '" href="' + esc(url) + '"' + (local ? '' : ' target="_blank" rel="noopener"') + '>' + (statusOf(it.id) === 'opened' ? 'Continue' : local ? 'Open the course' : it.kind === 'assessment' ? 'Take the assessment' : 'Open in Oracle') + '</a>' : '<span class="btn is-disabled">Link coming soon</span>';
      var mark = CFG.allowSelfReport !== false ? '<button type="button" class="btn btn--mark" data-done="' + esc(it.id) + '" aria-label="Mark ' + esc(it.title) + ' complete">Mark complete</button>' : '';
      return '<article class="next' + (i === 0 ? ' next--first' : '') + '"><span class="next__no" aria-hidden="true">' + (i + 1) + '</span><div class="next__body">' +
        '<span class="card__kicker">' + esc(it.kind === 'assessment' ? 'Assessment' : it.kind === 'foundation' ? 'Foundation course' : it.track ? 'Micro module · ' + it.track.title : areaName[it.area] || '') + '</span>' +
        '<h3>' + esc(it.title) + '</h3><p class="next__due' + (past ? ' past' : '') + '">' + (past ? 'Past due · ' : '') + esc(it.dueLabel) + ' · ' + fmtDate(it.dueIso) + (it.mins || it.minutes ? ' · ' + (it.mins || it.minutes) + ' min' : '') + '</p>' +
        '<div class="next__act">' + go + mark + '</div></div></article>';
    }).join('') : '<p class="next__empty">All caught up. Well sailed. The cohort invitation follows from Oracle.</p>';
    $('#upnextSub').textContent = next.length ? 'The next things to do, in order' : 'Nothing waiting';

    /* who to call */
    var CL = CFG.contacts || {};
    $('#contacts').innerHTML = P.contacts.map(function (c) {
      var link = c.key && CL[c.key] ? '<a class="who__link" href="' + esc(CL[c.key]) + '" target="_blank" rel="noopener">Contact</a>' : '';
      return '<div class="card who__card' + (c.sameDay ? ' who__card--urgent' : '') + '"><span class="card__kicker">' + (c.sameDay ? 'Same day' : 'Everyday help') + '</span><h3>' + esc(c.role) + '</h3>' +
        '<p><b>What they do.</b> ' + esc(c.desc) + '</p>' + (c.when ? '<p><b>When.</b> ' + esc(c.when) + '</p>' : '') + (c.how ? '<p><b>How.</b> ' + esc(c.how) + '</p>' : '') + link + '</div>';
    }).join('');

    /* record line */
    var oracleN = Object.keys(profile.completions).filter(function (k) { return profile.completions[k].source === 'oracle'; }).length;
    var selfN = Object.keys(profile.completions).length - oracleN;
    var src = profile.source === 'oracle' ? 'Oracle HCM' : profile.source === 'scorm' ? 'Oracle Learning' : profile.source === 'url' ? 'preview link' : 'this browser';
    $('#syncline').innerHTML = '<b>Your record.</b> Profile from ' + esc(src) + (profile.id ? ' · ID ' + esc(profile.id) : '') + ' · ' +
      oracleN + ' verified in Oracle · ' + selfN + ' self-reported.' +
      (profile.feedAt ? ' Last sync ' + new Date(profile.feedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) + '.' : '') +
      (profile.feedError ? ' Oracle feed unavailable: ' + esc(profile.feedError) + '.' : '');
  }

  /* ---------- the timeline: one spine, Day 1 to Day 60, with the cohort beyond it ---------- */
  function renderTimeline(day) {
    var box = $('#timeline'); if (!box) return;
    var items = mrcItems();
    var m1 = items.filter(function (it) { return it.kind === 'assessment' || it.kind === 'foundation' || (it.track && it.track.phase === 1); }).every(function (it) { return isDone(it.id); });
    var all = bothRequiredDone();
    var nodes = [
      { t: 'Day 1', s: 'Assigned in Oracle. The portal opens.', d: true },
      { t: 'Day 30', s: 'Assessment and Foundation course. Systems and Vanderbilt & Nashville modules.', d: m1, now: day <= 30 && !m1 },
      { t: 'Day 60', s: 'Compliance courses. People and Processes modules.', d: all, now: day > 30 && !all },
      { t: 'The cohort', s: all ? 'You are eligible. The invitation follows from Oracle.' : 'Optional but recommended. Opens once Day 60 is complete.', d: false, now: all, after: true }
    ];
    /* the marker sits between the Day 1 and Day 60 node centers (12.5% to 62.5% of the track) */
    var pos = 12.5 + Math.min(59, Math.max(0, day - 1)) / 59 * 50;
    box.innerHTML = '<div class="tl__head"><span class="tl__title">Your voyage</span><span class="tl__you-line">' + (day <= P.windowDays ? 'You are on Day ' + day : 'Past Day 60') + '</span></div>' +
      '<div class="tl__track"><span class="tl__fill" style="width:' + pos + '%"></span>' +
      nodes.map(function (n, i) { return '<span class="tl__node' + (n.d ? ' done' : '') + (n.now && !n.d ? ' now' : '') + (n.after ? ' after' : '') + '" style="left:' + (12.5 + i * 25) + '%" aria-hidden="true">' + (n.d ? '&#10003;' : '') + '</span>'; }).join('') +
      '<span class="tl__you" style="left:' + pos + '%" aria-hidden="true">You are here</span></div>' +
      '<ol class="tl__labels">' + nodes.map(function (n) {
        return '<li class="' + (n.d ? 'done' : '') + (n.now && !n.d ? ' now' : '') + '"><b>' + esc(n.t) + (n.d ? ' <span class="tl__ok">done</span>' : n.now ? ' <span class="tl__ok tl__ok--now">now</span>' : '') + '</b><small>' + esc(n.s) + '</small></li>';
      }).join('') + '</ol>';
  }

  /* ---------- welcome ---------- */
  function renderWelcome() {
    var name = profile.name || 'Vanderbilt Manager';
    var parts = name.trim().split(/\s+/);
    $('#idInitials').textContent = ((parts[0] || 'M')[0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    $('#idName').textContent = name;
    $('#heroTitle').innerHTML = 'Welcome aboard, <em class="gold-text">' + esc(profile.firstName || 'Manager') + '</em>.';
    var meta = profile.source === 'oracle' ? 'Signed in via Oracle HCM' + (profile.id ? ' · ID ' + profile.id : '')
      : profile.source === 'scorm' ? 'Signed in via Oracle Learning' + (profile.id ? ' · Learner ID ' + profile.id : '') + '. Pulled live from the LMS.'
      : 'Preview profile. At launch this card is filled from your Oracle Learning record.';
    $('#idMeta').textContent = meta;
    $('#renameBtn').hidden = profile.source === 'oracle' || profile.source === 'scorm';

    var gate = $('#stateGate'), line = $('#stateLine');
    if (profile.state) {
      gate.hidden = true; line.hidden = false;
      line.innerHTML = 'Your work location: <b>' + esc(stateName(profile.state)) + '</b>' +
        (profile.stateSource === 'oracle' ? ' (from your Oracle record).' : '. <button type="button" id="stateChange">Not right? Change it</button>');
      var sc = $('#stateChange'); if (sc) sc.addEventListener('click', function () { profile.state = ''; profile.stateSource = 'none'; renderWelcome(); });
    } else {
      gate.hidden = false; line.hidden = true;
      $('#stateTiles').innerHTML = Object.keys(P.states).map(function (k) {
        return '<button type="button" class="tile" data-state="' + k + '" aria-pressed="false"><span class="tile__kicker">' + esc(P.states[k].campus) + '</span><h3>' + esc(P.states[k].name) + '</h3><p>' + (k === 'TN' ? 'Nashville campus. TN compliance track.' : k + ' compliance track.') + '</p></button>';
      }).join('');
    }
    $('#beginBtn').classList.toggle('is-disabled', !profile.state);
  }

  /* ---------- router ---------- */
  function show(view) {
    $$('.view').forEach(function (v) { v.classList.toggle('active', v.getAttribute('data-view') === view); });
    document.body.classList.toggle('view-light', view === 'dashboard');
    if (view === 'dashboard') renderDashboard(); else renderWelcome();
    window.scrollTo(0, 0);
  }

  /* ---------- actions ---------- */
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) {
      var id = go.getAttribute('data-go');
      if (!isDone(id) && !profile.opened[id]) { profile.opened[id] = todayIso(); save(); renderDashboard(); }
      var goLocal = go.getAttribute('href') && !/^https?:/i.test(go.getAttribute('href'));
      toast(goLocal ? 'Opening the Foundation course. Your progress is recorded when you finish it.' : id === 'MEA' ? 'Opened the assessment. Your results come by email; tap Mark complete once you have submitted it.' : 'Opened in Oracle Learning. ' + (CFG.profileEndpoint ? 'Your completion syncs back here.' : 'Tap Mark complete when you finish.'));
      return;
    }
    var d = e.target.closest('[data-done]');
    if (d) {
      var did = d.getAttribute('data-done');
      profile.completions[did] = { at: todayIso(), source: 'self' };
      if (window.MVScorm && MVScorm.connected) MVScorm.recordAttestation(did, 'Self-reported complete on ' + todayIso());
      save(); renderDashboard();
      toast('Marked complete, self-reported.');
      return;
    }
    var r = e.target.closest('[data-reopen]');
    if (r) {
      var rid = r.getAttribute('data-reopen');
      if (profile.completions[rid] && profile.completions[rid].source !== 'oracle') { delete profile.completions[rid]; save(); renderDashboard(); toast('Back to not started.'); }
      return;
    }
    var st = e.target.closest('[data-state]');
    if (st) {
      profile.state = st.getAttribute('data-state'); profile.stateSource = 'self'; save(); renderWelcome();
      return;
    }
    var nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); show(nav.getAttribute('data-nav')); return; }
    var ar = e.target.closest('[data-area]');
    if (ar) { e.preventDefault(); area = ar.getAttribute('data-area'); show('dashboard'); return; }
  });

  $('#beginBtn').addEventListener('click', function (e) { e.preventDefault(); if (profile.state) show('dashboard'); else toast('Choose where your employees work first.'); });
  $('#changeStateBtn').addEventListener('click', function () { profile.state = ''; profile.stateSource = 'none'; area = null; show('welcome'); });
  $('#renameBtn').addEventListener('click', function () {
    var n = window.prompt('What should we call you?', profile.name || '');
    if (n && n.trim()) { profile.name = n.trim(); profile.firstName = MVProfile.firstName(n); profile.source = 'self'; save(); renderWelcome(); }
  });
  $('#syncBtn').addEventListener('click', function () {
    toast('Checking Oracle...');
    MVProfile.refresh(profile).then(function (p) { profile = p; renderDashboard(); toast(p.feedError ? 'Oracle feed unavailable right now.' : 'Synced with Oracle.'); });
  });
  $('#pvApply').addEventListener('click', function () {
    var n = $('#pvName').value.trim(); if (n) { profile.name = n; profile.firstName = MVProfile.firstName(n); profile.source = 'self'; }
    var s = MVProfile.normState($('#pvState').value); if (s) { profile.state = s; profile.stateSource = 'self'; }
    var d = $('#pvStart').value; if (d) profile.startDate = d;
    area = null; save(); renderDashboard(); toast('Preview updated.');
  });
  $('#pvReset').addEventListener('click', function () {
    if (!window.confirm('Reset all self-reported progress on this device?')) return;
    Object.keys(profile.completions).forEach(function (k) { if (profile.completions[k].source !== 'oracle') delete profile.completions[k]; });
    profile.opened = {}; scoDone = false; save(); renderDashboard(); toast('Progress reset.');
  });

  var navPortal = $('#navPortal'); if (navPortal && (CFG.portalUrl || P.portal.url)) navPortal.href = CFG.portalUrl || P.portal.url;
  /* the header's Who to call link on this page */
  window.addEventListener('hashchange', function () {
    if (location.hash !== '#who') return;
    var who = $('#who'); if (who && $('#view-dashboard').classList.contains('active')) who.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
  $('#year').textContent = new Date().getFullYear();
  if (CFG.contactEmail) { var fc = $('#footerContact'); fc.hidden = false; fc.href = 'mailto:' + CFG.contactEmail; }

  /* ---------- toast + confetti ---------- */
  var toastTimer;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3200); }
  function confetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var wrap = document.createElement('div'); wrap.className = 'confetti';
    var colors = ['#CFAE70', '#FEEEB6', '#B49248', '#ECB748', '#FFFFFF'];
    for (var i = 0; i < 60; i++) { var f = document.createElement('i'); f.style.left = (Math.random() * 100) + 'vw'; f.style.background = colors[i % 5]; f.style.animationDelay = (Math.random() * .5) + 's'; f.style.animationDuration = (1.2 + Math.random()) + 's'; wrap.appendChild(f); }
    document.body.appendChild(wrap); setTimeout(function () { wrap.remove(); }, 2600);
  }

  /* ---------- boot ---------- */
  function boot() {
    MVProfile.resolve().then(function (p) {
      profile = p;
      if (window.MVScorm && MVScorm.connected) MVScorm.incomplete();
      /* My voyage is home: the welcome view only asks for the work location when nothing supplied it */
      var straight = !!p.state;
      show(straight ? 'dashboard' : 'welcome');
      if (straight && location.hash === '#who') { var who = $('#who'); if (who) setTimeout(function () { who.scrollIntoView({ block: 'start', behavior: 'auto' }); }, 120); }
      if (CFG.profileEndpoint) {
        var lastPull = Date.now();
        var pull = function () {
          lastPull = Date.now();
          MVProfile.refresh(profile).then(function (q) { profile = q; if ($('#view-dashboard').classList.contains('active')) renderDashboard(); });
        };
        if (CFG.profilePollMinutes) setInterval(pull, CFG.profilePollMinutes * 60000);
        /* coming back from Oracle: re-check as soon as this tab is in front again (at most once every 20 seconds) */
        var onBack = function () { if (!document.hidden && Date.now() - lastPull > 20000) pull(); };
        document.addEventListener('visibilitychange', onBack);
        window.addEventListener('focus', onBack);
      }
    });
  }
  window.addEventListener('mv-scorm-connected', function () {
    if (!profile) return;                       /* boot will pick it up */
    profile = MVProfile.fromScorm(profile);
    MVScorm.incomplete();
    if ($('#view-dashboard').classList.contains('active')) renderDashboard(); else renderWelcome();
  });
  boot();
})();
