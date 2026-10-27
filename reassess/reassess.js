/* Manager Voyage · the standalone three-month reassessment. See the note in index.html. */
(function(){
  'use strict';
  var C = window.MV_CONFIG || {}, E = window.MV_EMAIL;
  var SCALE = C.assessmentScale || ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
  var ST = C.assessmentStatements || [], CATS4 = C.assessmentCategories || [], BANDS = C.assessmentBands || [], MOVES = C.assessmentMoves || [];
  var FOUNDATIONS = (C.reassessUrl || '').replace(/reassess\/?$/, '') + 'foundation/';
  if(FOUNDATIONS === 'foundation/') FOUNDATIONS = '../foundation/';
  var ans = {};

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function pct(avg){ return Math.round((avg - 1) / 4 * 100); }
  function band(avg){ for(var i = 0; i < BANDS.length; i++){ if(avg >= BANDS[i][0]) return BANDS[i]; } return BANDS[BANDS.length - 1] || [0, '', '']; }
  function score(a){
    var cats = CATS4.map(function(c){ var vs = c[1].map(function(i){ return (a[i] || 0) + 1; }); var avg = vs.reduce(function(x, y){ return x + y; }, 0) / vs.length; return { k:c[0], avg:Math.round(avg * 10) / 10, pct:pct(avg) }; });
    var total = ST.reduce(function(t, st, i){ return t + (a[i] || 0) + 1; }, 0);
    return { score:total, max:ST.length * SCALE.length, categories:cats };
  }

  /* who and the starting point: from the invite link first, then from this browser's copy of the course */
  var qs = {}; try{ new URLSearchParams(location.search).forEach(function(v, k){ qs[k] = v; }); }catch(e){}
  var base = null;
  if(qs.b){
    var p = qs.b.split(',').map(Number);
    if(p.length === 5 && p.every(function(x){ return isFinite(x); }) && p[0] > 0){
      base = { score:p[0], max:ST.length * SCALE.length, at:qs.d || null, categories:CATS4.map(function(c, i){ return { k:c[0], avg:p[i + 1], pct:pct(p[i + 1]) }; }) };
    }
  }
  if(!base){ try{ var saved = JSON.parse(localStorage.getItem('mv-found-assess-answers') || 'null'); if(saved && saved.score) base = { score:saved.score, max:saved.max, at:saved.at, categories:saved.categories }; }catch(e){} }
  var who = {}; try{ who = JSON.parse(localStorage.getItem('mv-found-who') || '{}') || {}; }catch(e){}
  $('fName').value = qs.n || who.name || '';
  $('fEmail').value = qs.e || who.email || '';

  function when(d){ if(!d) return ''; var x = new Date(d.length === 10 ? d + 'T12:00:00' : d); return isNaN(x) ? '' : x.toLocaleDateString(undefined, { month:'long', day:'numeric', year:'numeric' }); }
  (function(){
    var box = $('startBox');
    if(!base){ box.className = 'start none'; box.innerHTML = '<div><b>Your starting point</b><p>We do not have your first result on file here, so this time sets a fresh starting point. Everything else works the same.</p></div>'; return; }
    var lo = base.categories.slice().sort(function(a, b){ return a.avg - b.avg; })[0];
    box.innerHTML = '<div class="ring">' + base.score + '<small>of ' + base.max + '</small></div><div><b>Your starting point' + (when(base.at) ? ' · ' + esc(when(base.at)) : '') + '</b><p>The one you set out to grow: ' + esc(lo.k.toLowerCase()) + '. Rate yourself honestly. A lower score is useful information, not a failure.</p></div>';
  })();

  /* views */
  function view(id){ ['vIntro', 'vForm', 'vResult'].forEach(function(v){ $(v).hidden = v !== id; }); window.scrollTo(0, 0); var h = $(id).querySelector('h1, h2'); if(h){ h.setAttribute('tabindex', '-1'); h.focus({ preventScroll:true }); } }
  function whoOk(){ return $('fName').value.trim() && /@/.test($('fEmail').value); }
  function introReady(){ var b = $('goForm'); b.disabled = !whoOk(); b.textContent = whoOk() ? 'Start the ten statements' : 'Add your name and Vanderbilt email'; }
  $('fName').addEventListener('input', introReady); $('fEmail').addEventListener('input', introReady); introReady();
  $('goForm').addEventListener('click', function(){ if(whoOk()) view('vForm'); });
  $('back').addEventListener('click', function(){ view('vIntro'); });

  /* the ten statements */
  var qsEl = $('qs');
  qsEl.innerHTML = ST.map(function(st, i){ return '<li data-li="' + i + '"><b>' + (i + 1) + ' · ' + esc(st[0]) + '</b><p>' + esc(st[1]) + '</p><div class="scale" role="group" aria-label="' + esc(st[0]) + '">' + SCALE.map(function(l, j){ return '<button type="button" data-q="' + i + '" data-v="' + j + '" aria-pressed="false">' + esc(l) + '</button>'; }).join('') + '</div></li>'; }).join('');
  qsEl.addEventListener('click', function(e){
    var b = e.target.closest('button[data-q]'); if(!b) return;
    var i = +b.getAttribute('data-q'); ans[i] = +b.getAttribute('data-v');
    Array.prototype.forEach.call(qsEl.querySelectorAll('button[data-q="' + i + '"]'), function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    qsEl.querySelector('[data-li="' + i + '"]').classList.add('done');
    formReady();
  });
  function formReady(){ var n = Object.keys(ans).length, all = n === ST.length; $('progFill').style.width = (n / ST.length * 100) + '%'; $('progText').textContent = n + ' of ' + ST.length; $('send').disabled = !all; $('send').textContent = all ? 'See my results' : 'See my results (' + n + ' of ' + ST.length + ' answered)'; }
  formReady();

  /* results */
  function delta(d, fixed){ if(d === null || d === undefined) return ''; var cls = d > 0 ? '' : d < 0 ? ' down' : ' flat'; return '<span class="delta' + cls + '">' + (d > 0 ? '+' : '') + (fixed ? d.toFixed(1) : d) + '</span>'; }
  function finish(){
    var sc = score(ans), name = $('fName').value.trim(), email = $('fEmail').value.trim();
    var lo = sc.categories.slice().sort(function(a, b){ return a.avg - b.avg; })[0], loIdx = sc.categories.indexOf(lo);
    var feedback = sc.categories.map(function(c){ var bd = band(c.avg); return { k:c.k, label:bd[1], line:bd[2] }; });
    var move = MOVES[loIdx] || '', route = E.route(sc.score, sc.max), ov = E.overall(sc.score, sc.max);
    var rec = { phase:'retake', name:name, email:email, at:new Date().toISOString(), score:sc.score, max:sc.max, categories:sc.categories, feedback:feedback, move:move, route:route,
      answers:ST.map(function(st, i){ return { n:i + 1, k:st[0], v:ans[i] + 1, label:SCALE[ans[i]] }; }) };

    var first = name.split(' ')[0], d = base ? sc.score - base.score : null;
    $('resTitle').innerHTML = route === 'foundations' ? 'Time to go back to the <em>foundations</em>' + (first ? ', ' + esc(first) : '') + '.' : (d !== null && d > 0 ? 'You moved' : 'Here is where you are') + (first ? ', ' + esc(first) : '') + '.';
    $('resTop').innerHTML = '<div class="res-ring">' + sc.score + '<small>of ' + sc.max + '</small></div><div><h3>' + esc(ov[1]) + (d !== null ? ' ' + delta(d) + ' <span class="delta flat">since your starting point of ' + base.score + '</span>' : '') + '</h3><p>' + esc(ov[2]) + '</p></div>';
    $('cats').innerHTML = sc.categories.map(function(c, i){ var bd = band(c.avg), prev = base && base.categories[i], dd = prev ? Math.round((c.avg - prev.avg) * 10) / 10 : null;
      return '<li><span class="l">' + esc(c.k) + '</span><span class="v">' + c.avg.toFixed(1) + '<small>of 5</small>' + delta(dd, true) + '</span><span class="b"><i data-w="' + Math.max(2, c.pct) + '"></i>' + (prev ? '<em style="left:' + prev.pct + '%" title="Starting point"></em>' : '') + '</span><span class="f"><b>' + esc(bd[1]) + '</b>' + esc(bd[2]) + '</span></li>'; }).join('');
    $('legend').hidden = !base;
    $('moveBox').innerHTML = move ? '<div class="move"><b>Your first move this week</b>' + esc(move) + '</div>' : '';

    if(route === 'foundations'){
      $('nextBox').innerHTML = '<p class="kick">Your next step</p><h2>Retake Manager Foundations.</h2><p>These habits have not yet become part of your week' + (lo ? ', and ' + esc(lo.k.toLowerCase()) + ' is furthest from it' : '') + '. That is common three months in, when the work crowds them out. The course is about thirty-five minutes. Take it again with this week in mind, build a fresh week, and rate yourself again in three months.</p><div class="actions"><a class="btn" href="' + esc(FOUNDATIONS) + '">Retake Manager Foundations</a></div>';
    } else {
      var order = sc.categories.slice().sort(function(a, b){ return a.avg - b.avg; }), need = order.filter(function(c){ return c.avg < 3.5; }).slice(0, 2); if(!need.length) need = order.slice(0, 1);
      var seen = {}, items = [];
      need.forEach(function(c){ E.picks(c.k, 'oracle', 2, /foundations/i).concat(E.picks(c.k, 'outside', 1, /foundations/i)).forEach(function(x){ if(seen[x.title]) return; seen[x.title] = 1; items.push({ c:c, x:x }); }); });
      var kind = function(x){ return x.type === 'oracle' ? 'Oracle Learning' : x.type === 'video' ? 'Video' : x.type === 'podcast' ? 'Podcast' : 'Guide'; };
      $('nextBox').innerHTML = '<p class="kick">Your next learning</p><h2>' + (need.length === 1 && need[0].avg >= 3.5 ? 'Go deeper where you are already strong.' : 'Build on what moved.') + '</h2><p>Chosen from your answers, for ' + need.map(function(c){ return esc(c.k.toLowerCase()); }).join(' and ') + '. Nothing here repeats the course.</p>' +
        '<ul class="recs">' + items.map(function(it){ return '<li><span class="cat">' + esc(it.c.k) + ' · ' + kind(it.x) + '</span><a href="' + esc(it.x.url) + '" target="_blank" rel="noopener">' + esc(it.x.title) + '</a>' + (it.x.why ? '<span>' + esc(it.x.why) + '</span>' : it.x.by ? '<span>' + esc(it.x.by) + '</span>' : '') + '</li>'; }).join('') + '</ul>';
    }

    var sent = window.MVOracle && MVOracle.send({ event:'assessment', phase:'retake', course:'Manager Foundations, Course 1: You Are a Manager Now', name:name, email:email, at:rec.at,
      score:rec.score, max:rec.max, categories:rec.categories, answers:rec.answers, prior:base ? { at:base.at, score:base.score, categories:base.categories } : null,
      feedback:feedback, move:move, route:route, source:'reassess', page:location.href.split('?')[0],
      emailSubject:route === 'foundations' ? 'Your results, three months on: back to the foundations' : 'Your results, three months on, and what to learn next',
      emailHtml:E.assessment(rec, base) });
    $('sentNote').textContent = sent ? 'A copy of these results is on its way to ' + email + '.' : 'These results could not be sent by email from here. Save this page or take a screenshot.';
    try{ localStorage.setItem('mv-found-assess-retake', JSON.stringify(rec)); localStorage.setItem('mv-found-who', JSON.stringify({ name:name, email:email })); }catch(e){}
    view('vResult');
    window.requestAnimationFrame(function(){ window.setTimeout(function(){ Array.prototype.forEach.call(document.querySelectorAll('.cats .b i'), function(i){ i.style.width = i.getAttribute('data-w') + '%'; }); }, 60); });
  }
  $('send').addEventListener('click', function(){ if(Object.keys(ans).length === ST.length) finish(); });
})();
