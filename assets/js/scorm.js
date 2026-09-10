/* =====================================================================
   MANAGER VOYAGE - SCORM adapter (SCORM 1.2 and SCORM 2004)
   When the dashboard is launched as a SCO inside Oracle Learning, the LMS
   exposes a JS API object on an ancestor window. We discover it, start the
   session, and read the real learner name and id. The dashboard keeps its
   own state (location, start date, self-reported completions) in
   suspend_data so it follows the manager across devices, and reports the
   SCO complete when every required item is done.

   Standalone (GitHub Pages, local file) no API is found and
   window.MVScorm.connected stays false.
   ===================================================================== */
(function () {
  'use strict';

  function scanChain(start, name) {
    var win = start, hops = 0;
    while (win && hops < 12) {
      try { if (win[name]) return win[name]; } catch (e) { /* cross-origin hop */ }
      var parent = null;
      try { parent = (win.parent && win.parent !== win) ? win.parent : null; } catch (e2) { parent = null; }
      if (!parent) break;
      win = parent; hops++;
    }
    return null;
  }
  function findAPI(name) {
    var api = scanChain(window, name);
    if (api) return api;
    var opener = null;
    try { opener = window.opener; } catch (e) { opener = null; }
    if (opener) api = scanChain(opener, name);
    return api || null;
  }

  var api12 = null, api2004 = null;
  var scorm = { connected: false, version: null, name: null, id: null };

  function toFirstLast(n) {
    if (!n) return null;
    n = String(n).trim();
    if (n.indexOf(',') > -1) { var p = n.split(','); return (p[1] || '').trim() + ' ' + p[0].trim(); }
    return n;
  }
  function ok(r) { return r === 'true' || r === true; }

  function tryConnect() {
    if (scorm.connected) return true;
    try {
      var a2004 = findAPI('API_1484_11');
      if (a2004) {
        var r2 = a2004.Initialize('');
        if (ok(r2) || String(a2004.GetLastError && a2004.GetLastError()) === '103') {
          api2004 = a2004; scorm.connected = true; scorm.version = '2004';
          scorm.name = toFirstLast(a2004.GetValue('cmi.learner_name'));
          scorm.id = a2004.GetValue('cmi.learner_id') || null;
          return true;
        }
      }
      var a12 = findAPI('API');
      if (a12) {
        var r1 = a12.LMSInitialize('');
        if (ok(r1) || String(a12.LMSGetLastError && a12.LMSGetLastError()) === '101') {
          api12 = a12; scorm.connected = true; scorm.version = '1.2';
          scorm.name = toFirstLast(a12.LMSGetValue('cmi.core.student_name'));
          scorm.id = a12.LMSGetValue('cmi.core.student_id') || null;
          return true;
        }
      }
    } catch (e) { try { console.info('[Voyage] SCORM connect threw:', e && e.message); } catch (e2) {} }
    return false;
  }

  /* The LMS only has to expose the API before the SCO's load event; retry
     for about six seconds, then settle into standalone mode. */
  var attempts = 0;
  function connectLoop() {
    attempts++;
    if (tryConnect()) {
      try { console.info('[Voyage] SCORM ' + scorm.version + ' connected. Learner: ' + (scorm.name || 'unnamed') + ' id=' + scorm.id); } catch (e) {}
      window.dispatchEvent(new Event('mv-scorm-connected'));
      return;
    }
    if (attempts < 24) setTimeout(connectLoop, 250);
    else { try { console.info('[Voyage] no SCORM API after 6s. Running standalone.'); } catch (e) {} }
  }
  connectLoop();

  scorm.getData = function () {
    try {
      var raw = scorm.version === '2004' ? api2004.GetValue('cmi.suspend_data')
              : scorm.version === '1.2' ? api12.LMSGetValue('cmi.suspend_data') : '';
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  };
  scorm.setData = function (obj) {
    try {
      var raw = JSON.stringify(obj);
      if (scorm.version === '2004') { api2004.SetValue('cmi.suspend_data', raw); api2004.Commit(''); }
      else if (scorm.version === '1.2') {
        if (raw.length > 4096) raw = raw.slice(0, 4096);   /* SCORM 1.2 limit */
        api12.LMSSetValue('cmi.suspend_data', raw); api12.LMSCommit('');
      }
    } catch (e) { /* local copy still stands */ }
  };

  /* A self-reported completion is written as a SCORM interaction so Oracle
     can report on it (same channel quiz answers use). */
  scorm.recordAttestation = function (itemId, note) {
    try {
      if (scorm.version === '2004') {
        var n = parseInt(api2004.GetValue('cmi.interactions._count'), 10) || 0;
        api2004.SetValue('cmi.interactions.' + n + '.id', 'attest-' + itemId);
        api2004.SetValue('cmi.interactions.' + n + '.type', 'true-false');
        api2004.SetValue('cmi.interactions.' + n + '.learner_response', 'true');
        api2004.SetValue('cmi.interactions.' + n + '.result', 'correct');
        api2004.SetValue('cmi.interactions.' + n + '.description', String(note || '').slice(0, 250));
        api2004.Commit('');
      } else if (scorm.version === '1.2') {
        var m = parseInt(api12.LMSGetValue('cmi.interactions._count'), 10) || 0;
        api12.LMSSetValue('cmi.interactions.' + m + '.id', 'attest-' + itemId);
        api12.LMSSetValue('cmi.interactions.' + m + '.type', 'true-false');
        api12.LMSSetValue('cmi.interactions.' + m + '.student_response', 't');
        api12.LMSSetValue('cmi.interactions.' + m + '.result', 'correct');
        api12.LMSCommit('');
      }
    } catch (e) { /* completion still lives in suspend_data */ }
  };

  scorm.complete = function () {
    try {
      if (scorm.version === '2004') {
        api2004.SetValue('cmi.completion_status', 'completed');
        api2004.SetValue('cmi.success_status', 'passed');
        api2004.Commit('');
      } else if (scorm.version === '1.2') {
        api12.LMSSetValue('cmi.core.lesson_status', 'completed');
        api12.LMSCommit('');
      }
    } catch (e) { /* LMS keeps last state */ }
  };
  scorm.incomplete = function () {
    try {
      if (scorm.version === '2004') {
        var cs = api2004.GetValue('cmi.completion_status');
        if (cs !== 'completed') { api2004.SetValue('cmi.completion_status', 'incomplete'); api2004.Commit(''); }
      } else if (scorm.version === '1.2') {
        var st = api12.LMSGetValue('cmi.core.lesson_status');
        if (st !== 'completed' && st !== 'passed') { api12.LMSSetValue('cmi.core.lesson_status', 'incomplete'); api12.LMSCommit(''); }
      }
    } catch (e) {}
  };

  window.addEventListener('beforeunload', function () {
    try {
      if (scorm.version === '2004') api2004.Terminate('');
      else if (scorm.version === '1.2') api12.LMSFinish('');
    } catch (e) { /* already closed */ }
  });

  window.MVScorm = scorm;
})();
