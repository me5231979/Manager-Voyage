/* =====================================================================
   MANAGER VOYAGE - who is this manager, where do they work, and what
   have they finished?

   Sources, in order of trust:
     1. Oracle feed   MV_CONFIG.profileEndpoint returns the signed-in manager's
                      record: name, state, start date, completions.
     2. SCORM         Oracle Learning hands the SCO the learner name and id
                      (cmi.core.student_name / student_id) and stores whatever
                      the dashboard saved last time in suspend_data.
     3. URL           ?name=Jordan&state=TN&start=2026-08-20  (testing, previews)
     4. Local         what this browser remembered (localStorage)

   Profile shape:
     { name, firstName, id, state, startDate, source, stateSource,
       completions: { 'R-015': { at: '2026-08-30', source: 'oracle' }, ... },
       opened: { 'R-015': '2026-08-29' } }
   ===================================================================== */
(function () {
  'use strict';
  var LS_KEY = 'mv.manager.v1';

  function firstName(full) {
    if (!full) return '';
    full = String(full).trim();
    if (full.indexOf(',') > -1) return full.split(',')[1].trim().split(/\s+/)[0];
    return full.split(/\s+/)[0];
  }
  function normState(s) {
    s = String(s || '').trim().toUpperCase();
    var map = { TENNESSEE: 'TN', 'NEW YORK': 'NY', FLORIDA: 'FL', CALIFORNIA: 'CA', NASHVILLE: 'TN' };
    if (map[s]) return map[s];
    return /^(TN|NY|FL|CA)$/.test(s) ? s : '';
  }
  function isoDate(d) {
    if (!d) return '';
    var x = new Date(d);
    if (isNaN(x)) return '';
    return x.toISOString().slice(0, 10);
  }
  function readLocal() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) { return {}; } }
  function writeLocal(p) { try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch (e) {} }
  function params() {
    var out = {};
    try { new URLSearchParams(location.search).forEach(function (v, k) { out[k] = v; }); } catch (e) {}
    return out;
  }

  function merge(p, extra, source) {
    if (!extra) return p;
    if (extra.name) { p.name = String(extra.name); p.firstName = firstName(extra.name); p.source = source; }
    if (extra.id) p.id = String(extra.id);
    if (normState(extra.state)) { p.state = normState(extra.state); p.stateSource = source; }
    if (isoDate(extra.startDate || extra.start)) { p.startDate = isoDate(extra.startDate || extra.start); p.startSource = source; }
    if (extra.opened) Object.keys(extra.opened).forEach(function (k) { p.opened[k] = extra.opened[k]; });
    if (extra.completions) {
      Object.keys(extra.completions).forEach(function (k) {
        var c = extra.completions[k];
        if (c === true) c = { at: '', source: source };
        if (typeof c === 'string') c = { at: c, source: source };
        if (!c.source) c.source = source;
        var cur = p.completions[k];
        if (!cur || cur.source !== 'oracle' || c.source === 'oracle') p.completions[k] = c;
      });
    }
    return p;
  }

  function fetchFeed(url) {
    return fetch(url, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('feed ' + r.status); return r.json(); });
  }

  function blank() {
    return { name: '', firstName: '', id: '', state: '', startDate: '', source: 'none', stateSource: 'none', startSource: 'none', completions: {}, opened: {} };
  }

  function fromScorm(p) {
    var sc = window.MVScorm;
    if (!sc || !sc.connected) return p;
    p = merge(p, sc.getData(), 'scorm');
    p = merge(p, { name: sc.name, id: sc.id }, 'scorm');
    return p;
  }

  /* resolve(): Promise<profile> */
  function resolve() {
    var p = blank();
    p = merge(p, readLocal(), 'local');
    p = fromScorm(p);
    var q = params();
    p = merge(p, { name: q.name, id: q.id, state: q.state, start: q.start || q.startDate }, 'url');
    var cfg = window.MV_CONFIG || {};
    var done = Promise.resolve(p);
    if (cfg.profileEndpoint) {
      done = fetchFeed(cfg.profileEndpoint)
        .then(function (data) { p = merge(p, data, 'oracle'); p.feedAt = new Date().toISOString(); return p; })
        .catch(function (err) { p.feedError = String(err && err.message || err); return p; });
    }
    return done.then(function (p) {
      if (!p.startDate) { p.startDate = isoDate(new Date()); p.startSource = 'today'; }
      save(p);
      return p;
    });
  }

  /* refresh(p): re-pull the Oracle feed into an existing profile */
  function refresh(p) {
    var cfg = window.MV_CONFIG || {};
    if (!cfg.profileEndpoint) return Promise.resolve(p);
    return fetchFeed(cfg.profileEndpoint).then(function (data) {
      p = merge(p, data, 'oracle'); p.feedAt = new Date().toISOString(); delete p.feedError; save(p); return p;
    }).catch(function (err) { p.feedError = String(err && err.message || err); return p; });
  }

  function save(p) {
    var slim = { name: p.name, id: p.id, state: p.state, startDate: p.startDate, completions: p.completions, opened: p.opened };
    writeLocal(slim);
    var sc = window.MVScorm;
    if (sc && sc.connected) {
      /* keep suspend_data small: only what Oracle does not already know */
      var self = {};
      Object.keys(p.completions).forEach(function (k) { if (p.completions[k].source !== 'oracle') self[k] = p.completions[k]; });
      sc.setData({ state: p.state, startDate: p.startDate, completions: self, opened: p.opened });
    }
  }

  window.MVProfile = { resolve: resolve, refresh: refresh, save: save, fromScorm: fromScorm, firstName: firstName, normState: normState };
})();
