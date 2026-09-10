/* =====================================================================
   MANAGER VOYAGE - Oracle Learning integration, in one place.

   Everything the site needs from Oracle goes through this object, so the
   day FLH and VUIT switch integration on, only assets/js/config.js and
   the item numbers in assets/js/program-data.js change.

     MVOracle.courseUrl(item)          the link to open a course
                                        1. item.oracleUrl (a pasted deep link)
                                        2. item.oracleItemId + MV_CONFIG.oracleRedirect
                                        3. item.localUrl (a course hosted on this site)
                                        4. MV_CONFIG.oracleLearningBase + item.oracleCode
     MVOracle.reportCompletion(id, x)  record that the signed-in manager finished
                                        something: SCORM when launched inside
                                        Oracle Learning, MV_CONFIG.completionEndpoint
                                        when running with the single sign-on proxy,
                                        and always a local copy for the dashboard
     MVOracle.launchContext()          how this page was opened (scorm, sso, standalone)

   No framework, no build step. Loads after config.js and scorm.js.
   ===================================================================== */
(function () {
  'use strict';
  var CFG = window.MV_CONFIG || {};
  var LS = 'mv.completions.v1';

  function readLocal() { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } }
  function writeLocal(o) { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} }

  function courseUrl(it) {
    if (!it) return null;
    if (it.oracleUrl) return it.oracleUrl;
    var r = CFG.oracleRedirect;
    if (r && r.base && it.oracleItemId) {
      return r.base + (r.base.indexOf('?') > -1 ? '&' : '?') +
        encodeURIComponent(r.idParam || 'learningItemId') + '=' + encodeURIComponent(it.oracleItemId) + '&' +
        encodeURIComponent(r.typeParam || 'learningItemType') + '=' + encodeURIComponent(it.oracleItemType || (r.defaultType || 'ORA_COURSE'));
    }
    if (it.localUrl) return it.localUrl;
    if (CFG.oracleLearningBase && it.oracleCode) return CFG.oracleLearningBase + encodeURIComponent(it.oracleCode);
    return null;
  }

  function launchContext() {
    if (window.MVScorm && window.MVScorm.connected) return 'scorm';
    if (CFG.profileEndpoint || CFG.completionEndpoint) return 'sso';
    return 'standalone';
  }

  /* x: { at, score, max, passed, note, extra } all optional */
  function reportCompletion(id, x) {
    x = x || {};
    var rec = { id: id, at: x.at || new Date().toISOString().slice(0, 10), source: 'self' };
    if (typeof x.score === 'number') { rec.score = x.score; rec.max = x.max; }
    var sc = window.MVScorm;
    if (sc && sc.connected) {
      rec.source = 'scorm';
      try {
        if (sc.recordAttestation) sc.recordAttestation(id, x.note || ('Completed ' + id));
        if (typeof x.score === 'number' && sc.score) sc.score(x.score, x.max);
        if (x.completesSco !== false && sc.complete) sc.complete();
      } catch (e) {}
    }
    var local = readLocal(); local[id] = rec; writeLocal(local);
    if (CFG.completionEndpoint) {
      rec.source = 'sso';
      try {
        var body = JSON.stringify({ id: id, at: rec.at, score: rec.score, max: rec.max, passed: x.passed, extra: x.extra || null });
        if (navigator.sendBeacon && !x.wait) {
          navigator.sendBeacon(CFG.completionEndpoint, new Blob([body], { type: 'application/json' }));
        } else {
          fetch(CFG.completionEndpoint, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); })
            .catch(function (e) { try { console.warn('completion not sent to Oracle proxy:', e); } catch (z) {} });
        }
      } catch (e) {}
    }
    try { window.dispatchEvent(new CustomEvent('mv-completion', { detail: rec })); } catch (e) {}
    return rec;
  }

  function localCompletions() { return readLocal(); }

  window.MVOracle = { courseUrl: courseUrl, reportCompletion: reportCompletion, launchContext: launchContext, localCompletions: localCompletions, config: CFG };
})();
