#!/usr/bin/env node
/* Builds the printable Manager Foundations guide:
     foundation/guide.html                       (branded, print-ready page)
     foundation/Manager-Foundations-Course-1.pdf (Letter, via headless Chromium when Playwright is installed)
   Everything is pulled from the course itself (index.html maps, app.js ideas and bands,
   resources.js learning list and situations), so re-run this after editing the course:
     node scripts/build-guide.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..'), F = path.join(ROOT, 'foundation');
const html = fs.readFileSync(path.join(F, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(F, 'app.js'), 'utf8');
const w = {}; vm.runInNewContext(fs.readFileSync(path.join(F, 'resources.js'), 'utf8'), { window: w });
function block(src, start){ const a = src.indexOf(start); const b = src.indexOf('\n];', a); return vm.runInNewContext('([' + src.slice(a + start.length, b) + '\n])', {}); }
function obj(src, start){ const a = src.indexOf(start); const b = src.indexOf('\n};', a); return vm.runInNewContext('({' + src.slice(a + start.length, b) + '\n})', {}); }
const IDEAS = block(app, 'var IDEAS = [');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function cards(id){
  const a = html.indexOf('id="' + id + '"'); const seg = html.slice(a, html.indexOf('</div>', html.indexOf('</button>', html.lastIndexOf('<button', html.indexOf('</div>\n', a) - 1))));
  const out = []; const re = /<button type="button" class="fw-card"[^>]*>(.*?)<\/button>/gs; let m;
  while((m = re.exec(seg))){ const c = m[1]; out.push({ b: strip((c.match(/<b>(.*?)<\/b>/) || [])[1] || ''), h: strip((c.match(/<strong>(.*?)<\/strong>/) || [])[1] || ''), p: strip((c.match(/<p>(.*?)<\/p>/) || [])[1] || ''), li: [...c.matchAll(/<li>(.*?)<\/li>/gs)].map(x => x[1].replace(/<i>/g, '<i>').replace(/<b>/g, '<b>')) }); }
  return out;
}
const YEAR = cards('yearMap'), JOBS = cards('fwMap');
const names = ['Priorities', 'Clear expectations', 'Psychological safety', 'Purpose', 'The people work'];
const TOP = w.MV_LEARN_TOPICS, L = w.MV_LEARN, SIM = w.MV_SIM;
const kind = t => t === 'oracle' ? 'Oracle Learning' : t === 'video' ? 'Video' : t === 'podcast' ? 'Podcast' : 'Guide';
const H = [];
H.push(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Manager Foundations · Course 1 · You Are a Manager Now · printable guide</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
@font-face{font-family:'Libre Caslon Display';font-style:normal;font-weight:400;font-display:swap;
  src:url('../fonts/libre-caslon-display-latin-400-normal.woff2') format('woff2');}
@font-face{font-family:'Libre Caslon Display';font-style:italic;font-weight:400;font-display:swap;
  src:url('../fonts/libre-caslon-text-latin-400-italic.woff2') format('woff2');}
@font-face{font-family:'Libre Caslon Text';font-style:normal;font-weight:400;font-display:swap;
  src:url('../fonts/libre-caslon-text-latin-400-normal.woff2') format('woff2');}
@font-face{font-family:'Libre Caslon Text';font-style:italic;font-weight:400;font-display:swap;
  src:url('../fonts/libre-caslon-text-latin-400-italic.woff2') format('woff2');}
@font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;
  src:url('../fonts/inter-latin-400-normal.woff2') format('woff2');}
@font-face{font-family:'Inter';font-style:normal;font-weight:500;font-display:swap;
  src:url('../fonts/inter-latin-500-normal.woff2') format('woff2');}
@font-face{font-family:'Inter';font-style:normal;font-weight:600;font-display:swap;
  src:url('../fonts/inter-latin-600-normal.woff2') format('woff2');}
@font-face{font-family:'Antonio';font-style:normal;font-weight:700;font-display:swap;
  src:url('../fonts/antonio-latin-700-normal.woff2') format('woff2');}

:root{ --gold:#CFAE70; --ink:#1c1c1c; --tx2:#4a4a4a; --bd:#d9d4c7; --cream:#f7f4ec; --eyebrow:#6f5a2e; }
*{ box-sizing:border-box; } html,body{ margin:0; background:#fff; color:var(--ink); font-family:'Inter',system-ui,sans-serif; font-size:10.5pt; line-height:1.45; }
.sheet{ max-width:8.5in; margin:0 auto; padding:0 .55in; }
h1,h2,h3{ font-family:'Libre Caslon Display','Libre Caslon Text',Georgia,serif; font-weight:400; margin:0; }
h1{ font-size:30pt; line-height:1.08; } h1 em,h2 em{ font-family:'Libre Caslon Text',Georgia,serif; font-style:italic; color:#5b4718; }
h2{ font-size:19pt; line-height:1.15; margin:0 0 6pt; } h3{ font-size:13pt; margin:10pt 0 3pt; }
.eyebrow{ font-family:'Antonio','Inter',sans-serif; font-weight:700; font-size:8pt; letter-spacing:.12em; text-transform:uppercase; color:var(--eyebrow); }
.eyebrow::before{ content:''; display:inline-block; width:18px; height:2px; background:var(--gold); vertical-align:middle; margin-right:8px; }
.cover{ padding:.4in 0 .3in; border-bottom:3px solid var(--gold); display:flex; flex-direction:column; gap:12pt; }
.cover img{ width:2.6in; }
.cover .lead{ font-size:12pt; color:var(--tx2); max-width:6in; }
.meta{ display:flex; flex-wrap:wrap; gap:6pt 18pt; font-family:'Antonio','Inter',sans-serif; font-size:8.5pt; letter-spacing:.08em; text-transform:uppercase; color:var(--eyebrow); }
section{ padding:14pt 0 8pt; break-inside:auto; } section + section{ border-top:1px solid var(--bd); }
h2,h3,.eyebrow{ break-after:avoid; } h2{ break-before:auto; } .grid2,.grid3,.rule{ break-inside:auto; } .idea{ break-inside:avoid; }
.brk{ break-before:page; }
p{ margin:0 0 6pt; } .tx2{ color:var(--tx2); }
.grid2{ display:grid; grid-template-columns:1fr 1fr; gap:8pt 16pt; } .grid3{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8pt 14pt; }
.box{ border:1px solid var(--bd); border-radius:4pt; padding:8pt 10pt; break-inside:avoid; background:#fff; }
.box.cream{ background:var(--cream); } .box.gold{ border-left:3px solid var(--gold); }
.box b.k{ display:block; font-family:'Antonio','Inter',sans-serif; font-weight:700; font-size:7.5pt; letter-spacing:.1em; text-transform:uppercase; color:var(--eyebrow); margin-bottom:2pt; }
.box strong{ display:block; font-family:'Libre Caslon Display',Georgia,serif; font-weight:400; font-size:12.5pt; line-height:1.15; margin-bottom:3pt; }
ul{ margin:3pt 0 0; padding-left:14pt; } li{ margin:0 0 2pt; } li i{ color:var(--tx2); font-style:normal; font-size:9.5pt; }
table{ width:100%; border-collapse:collapse; font-size:9.5pt; break-inside:auto; } th{ text-align:left; font-family:'Antonio','Inter',sans-serif; font-weight:700; font-size:7.5pt; letter-spacing:.1em; text-transform:uppercase; color:var(--eyebrow); border-bottom:2px solid var(--gold); padding:4pt 6pt 4pt 0; }
td{ vertical-align:top; padding:5pt 8pt 5pt 0; border-bottom:1px solid var(--bd); } tr{ break-inside:avoid; }
.topic{ display:grid; grid-template-columns:34pt 1fr 76pt; gap:10pt; padding:7pt 0; border-bottom:1px solid var(--bd); align-items:start; }
.topic .n{ font-family:'Libre Caslon Display',Georgia,serif; font-size:20pt; color:var(--gold); line-height:1; } .topic .pg{ text-align:right; font-family:'Antonio','Inter',sans-serif; font-size:8pt; letter-spacing:.08em; text-transform:uppercase; color:var(--eyebrow); padding-top:4pt; }
.topic b{ display:block; font-size:11pt; }
.idea{ break-inside:avoid; padding:8pt 0 10pt; border-bottom:1px solid var(--bd); }
.idea .blocks{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:10pt; margin-top:4pt; } .idea .blocks p{ border-top:2px solid var(--gold); padding-top:4pt; font-size:9.5pt; }
.idea .blocks b, .week b{ display:block; font-family:'Antonio','Inter',sans-serif; font-weight:700; font-size:7.5pt; letter-spacing:.1em; text-transform:uppercase; color:var(--eyebrow); margin-bottom:1pt; }
.week{ margin-top:6pt; background:var(--cream); border:1px solid var(--bd); border-left:3px solid var(--gold); padding:5pt 8pt; font-size:9.5pt; }
.rule{ display:grid; grid-template-columns:repeat(4,1fr); gap:8pt; }
.sim{ break-inside:avoid; padding:6pt 0; border-bottom:1px solid var(--bd); font-size:9.5pt; } .sim b.t{ display:block; font-size:10.5pt; } .sim .nv{ color:#7a1f1f; }
.learn a{ color:var(--ink); text-decoration:none; border-bottom:1px solid var(--gold); } .learn .k{ display:inline-block; min-width:74pt; font-family:'Antonio','Inter',sans-serif; font-size:7.5pt; letter-spacing:.08em; text-transform:uppercase; color:var(--eyebrow); }
.learn li{ margin-bottom:3pt; } .learn li span.why{ display:block; color:var(--tx2); font-size:9pt; }
.foot{ margin-top:18pt; padding:10pt 0 .5in; border-top:3px solid var(--gold); font-size:8.5pt; color:var(--tx2); }
.print-bar{ position:sticky; top:0; background:var(--ink); color:#fff; padding:8px 14px; font-size:13px; display:flex; gap:14px; align-items:center; justify-content:space-between; }
.print-bar button, .print-bar a{ font:inherit; background:var(--gold); color:var(--ink); border:0; border-radius:4px; padding:7px 12px; cursor:pointer; text-decoration:none; font-weight:600; }
@media print{ .print-bar{ display:none; } .sheet{ max-width:none; padding:0; } @page{ size:Letter; margin:.6in .55in .7in; } }
@media (max-width:640px){ .grid2,.grid3,.rule,.idea .blocks{ grid-template-columns:1fr; } .topic{ grid-template-columns:28pt 1fr; } .topic .pg{ grid-column:2; text-align:left; } }
</style></head><body>
<div class="print-bar"><span>Manager Foundations · Course 1 · printable guide</span><span><a href="Manager-Foundations-Course-1.pdf" download>Download the PDF</a> &nbsp; <button type="button" onclick="window.print()">Print</button> &nbsp; <a href="./" style="background:transparent;color:#fff;border:1px solid #666">Back to the course</a></span></div>
<div class="sheet">
<header class="cover">
  <img src="../assets/img/vu-lockup-black.png" alt="Vanderbilt University">
  <div><span class="eyebrow">Manager Voyage · Manager Foundations · Course 1</span>
  <h1 style="margin-top:8pt">You are a manager <em>now</em>.</h1></div>
  <p class="lead">Everything in the course, on paper: what changed, what a manager is, five ideas that hold up, what Vanderbilt will ask of you this year, who helps, the four jobs, how to read your assessment results, and what to learn next.</p>
  <div class="meta"><span>About 20 minutes online</span><span>19 pages · 5 topics</span><span>Before: manager compliance courses</span><span>After: the micro modules</span><span>Recorded in Oracle Learning</span></div>
</header>`);
// at a glance
H.push(`<section><span class="eyebrow">The course at a glance</span><h2>Five topics, one <em>picture</em>.</h2>
<div class="topic"><span class="n">01</span><div><b>What changed, and what a manager is</b><span class="tx2">The one change, three things that are new, what a manager is not, who helps you here.</span></div><span class="pg">Pages 4 to 5</span></div>
<div class="topic"><span class="n">02</span><div><b>Five ideas every good manager relies on</b><span class="tx2">Priorities, clear expectations, psychological safety, purpose, the people work. Each with a moment to try.</span></div><span class="pg">Page 6</span></div>
<div class="topic"><span class="n">03</span><div><b>What Vanderbilt will ask you to do</b><span class="tx2">The tasks of year one, when they show up, and your first calls: handle it, ask, route, or report.</span></div><span class="pg">Pages 7 to 8</span></div>
<div class="topic"><span class="n">04</span><div><b>The four jobs of a manager</b><span class="tx2">Get the work done, take care of your people, make things better, connect your team. One page each, then your call.</span></div><span class="pg">Pages 9 to 14</span></div>
<div class="topic"><span class="n">05</span><div><b>Your assessment</b><span class="tx2">What your results email tells you, and where the score should go.</span></div><span class="pg">Page 15</span></div>
<p class="tx2" style="margin-top:6pt">Then a five-question check (4 of 5 finishes the course), your next seven days, a keep-learning list, and the wrap-up. Eight activities track progress; completion is recorded in Oracle Learning.</p></section>`);
// mission
H.push(`<section><span class="eyebrow">The mission</span><h2>Define the great university of the 21st century, and <em>be</em> it.</h2>
<div class="grid3">
<div class="box"><b class="k">The vision</b>Vanderbilt will define the great university of the 21st century and be it.</div>
<div class="box"><b class="k">How we operate</b>Uncommon speed, agility, and scale. Three areas of focus, below.</div>
<div class="box"><b class="k">As we grow</b>Nashville, San Francisco, West Palm Beach, New York City, Chattanooga. As we grow, help your team understand how we operate, wherever they sit.</div></div>
<p class="tx2" style="margin-top:8pt"><b>Areas of focus</b></p><div class="grid3">
<div class="box cream"><b class="k">1</b><strong>Exceptional Core Operations</strong>With speed, agility and scale, Vanderbilt will distinguish itself with innovative and impactful capabilities to ensure that we have the talent, resources and reputation necessary to deliver on our vision.</div>
<div class="box cream"><b class="k">2</b><strong>Bold Strategic Initiatives</strong>With “exceptional core operations” as our fuel, Vanderbilt will pursue increasingly bold initiatives that enable and enhance the reach and impact of our education and research mission.</div>
<div class="box cream"><b class="k">3</b><strong>Values Leadership</strong>Through strategic advocacy efforts and modeling the role of an essential research university, Vanderbilt will stimulate industry change and combat existential threats to our education and research mission.</div></div>
<div class="week" style="margin-top:8pt"><b>Your responsibility</b><p style="font-family:'Libre Caslon Display',Georgia,serif;font-size:13pt;line-height:1.2;margin:2pt 0 6pt">As a manager, it is your responsibility to embody this mission and to lead your team to achieve it.</p><ul><li><b>Embody it.</b> Speed, agility, and scale start with how you work.</li><li><b>Lead your team to achieve it.</b> Connect the work to the mission and say the why.</li><li><b>Stay in touch with your manager.</b> Strategy, projects, priorities, anything else.</li></ul></div></section>`);
// topic 1
H.push(`<section><span class="eyebrow">Topic 1 · What changed</span><h2>Your job used to be your work. Now it is the team’s work, and the <em>people</em>.</h2>
<div class="grid3">
<div class="box"><b class="k">New 1</b><strong>You decide.</strong>What matters this week, who does what, what waits.</div>
<div class="box"><b class="k">New 2</b><strong>You approve.</strong>Timecards, time off, expenses. Look before you sign.</div>
<div class="box"><b class="k">New 3</b><strong>You are responsible for people.</strong>Fair treatment, a safe place to speak up, a chance to grow.</div></div>
<h3>What a manager is not</h3>
<div class="grid3">
<div class="box cream"><strong>Not the person who does everyone’s work</strong>When you want to just do it yourself, manage instead.</div>
<div class="box cream"><strong>Not a friend first</strong>Warm and fair. The team needs a manager more than another friend.</div>
<div class="box cream"><strong>Not the police</strong>Some things you send on, the same day. Knowing which is part of the job.</div></div>
<h3>What a manager is</h3>
<p><b>A manager is the person responsible for a team’s work, and for the people who do it.</b></p>
<div class="grid2"><div class="box gold"><b class="k">Three questions, every week</b><ul><li>Does everyone know what to do this week?</li><li>Is anyone stuck, struggling, or waiting on me?</li><li>What is coming that the team should hear from me first?</li></ul></div>
<div class="box gold"><b class="k">Who helps you</b><ul><li><b>Your manager:</b> stay in touch to stay aligned on strategy, projects, priorities, and anything else.</li><li><b>Your Engagement Consultant:</b> your go-to in PCB for HR issues, concerns, and support; the bigger people questions for your business unit.</li><li><b>Your HCM:</b> in most business units, for immediate HR issues: pay, hiring, performance, policy. First call when unsure.</li><li><b>The leave office:</b> time off for health and family. Same day. Never ask for a diagnosis.</li><li><b>EOA:</b> discrimination and harassment reports. Same day. You report; you do not investigate.</li></ul></div></div></section>`);
// topic 2
H.push(`<section><span class="eyebrow">Topic 2 · Five ideas</span><h2>Five ideas every good manager <em>relies</em> on.</h2>`);
IDEAS.forEach((it, i) => { const lab = it.who; H.push(`<div class="idea"><span class="eyebrow">${i + 1} · ${esc(lab)}</span><h3 style="margin-top:3pt">${it.h}</h3>
<div class="blocks"><p><b>What it is</b>${esc(it.what)}</p><p><b>As a manager</b>${esc(it.apply)}</p><p><b>The value</b>${esc(it.value)}</p></div>
<div class="week"><b>Start this week</b>${esc(it.week)}</div></div>`); });
H.push(`<h3>The ideas at work: three rules to keep</h3><div class="grid3">
<div class="box cream"><b class="k">Bad news</b>Thank first. Solve second. Learn the cause later. Never in front of the team.</div>
<div class="box cream"><b class="k">Expectations</b>Say what, by when, and what good looks like. Out loud and in writing.</div>
<div class="box cream"><b class="k">Change</b>The why before the what, in your own words, before the announcement.</div></div>
<p class="tx2" style="margin-top:6pt;font-size:9pt">Sources: the big rocks method (Stephen Covey); clear is kind (Brené Brown); psychological safety (Amy Edmondson); start with why, leaders eat last (Simon Sinek); the people manager standard (SHRM).</p></section>`);
// topic 3
H.push(`<section><span class="eyebrow">Topic 3 · Your first year</span><h2>What Vanderbilt will ask you to do, and <em>when</em>.</h2><p class="tx2">Each task names its micro module in brackets. Each is a short how-to of its own.</p><div class="grid2">`);
YEAR.forEach(c => H.push(`<div class="box"><b class="k">${esc(c.b)}</b><strong>${esc(c.h)}</strong><ul>${c.li.map(l => '<li>' + l + '</li>').join('')}</ul></div>`));
H.push(`</div><h3>Your first calls</h3><p class="tx2">Most manager moments come down to one question: handle it myself, ask my HCM, send it to the leave office, or report it to EOA?</p>
<div class="rule">
<div class="box gold"><strong>Handle it</strong>A normal manager task. Time off, a timecard question, a 1:1, feedback.</div>
<div class="box gold"><strong>Ask my HCM first</strong>There is a process. Pay, hiring, a performance concern, anything unsure.</div>
<div class="box gold"><strong>Leave office, same day</strong>Health or family time off. Never ask for a diagnosis.</div>
<div class="box gold"><strong>EOA, same day</strong>Discrimination, harassment, misconduct. You report; you do not investigate.</div></div></section>`);
// situations
H.push(`<section><span class="eyebrow">Quick reference · Something just landed on your desk</span><h2>The first move, and what <em>never</em> to do.</h2>`);
SIM.forEach(s => H.push(`<div class="sim"><b class="t">${esc(s.label)}</b><div class="grid2"><div><b>First move.</b> ${esc(s.first)}</div><div><b class="nv">Never.</b> ${esc(s.never)}${s.mod ? ' <span class="tx2">Micro module: ' + esc(s.mod) + '.</span>' : ''}</div></div></div>`));
H.push(`</section>`);
// topic 4
H.push(`<section><span class="eyebrow">Topic 4 · The four jobs</span><h2>One picture that holds the whole <em>job</em>.</h2><p class="tx2">Nothing new to memorize: the same work, sorted. The Manager Effectiveness Assessment scores the same habits.</p><div class="grid2">`);
JOBS.forEach(c => H.push(`<div class="box"><b class="k">${esc(c.b)}</b><strong>${esc(c.h)}</strong><span class="tx2">${esc(c.p)}</span><ul>${c.li.map(l => '<li>' + l + '</li>').join('')}</ul></div>`));
H.push(`</div><div class="grid2" style="margin-top:8pt">
<div class="box cream"><b class="k">The habit to stop</b>Doing the work yourself. When you are tempted to just do it, that is the moment to manage instead.</div>
<div class="box cream"><b class="k">The one thing to route</b>Anything that sounds like leave goes to the leave office the same day. You adjust the load; they decide eligibility.</div></div></section>`);
// topic 5
H.push(`<section><span class="eyebrow">Topic 5 · Your assessment</span><h2>Your score, and where it should <em>go</em>.</h2>
<p class="tx2">Before this course you took the Manager Effectiveness Assessment: fourteen questions on how often you do the habits in this course. Your score and feedback came by email. Review it. If you did not get one, or have not taken it yet, take the assessment.</p>
<div class="week"><b>Where you need to be</b>The score is out of 70, and it is a direction, not a grade. Every point up is a habit you do more often. Over this course and the micro modules that follow, the aim is a higher score when you retake it in six months.</div>
<h3>Your next seven days</h3><div class="grid3">
<div class="box"><b class="k">Today</b><strong>Take your first micro module</strong>Start with the habit you know needs you most.</div>
<div class="box"><b class="k">This week</b><strong>Practice one habit</strong>Pick one from this course. Do it once, on purpose, and notice what happened.</div>
<div class="box"><b class="k">In six months</b><strong>Take the assessment again</strong>Compare the score with the one you started with.</div></div>
<div class="week" style="margin-top:8pt"><b>Tell your manager</b>“I just finished the first Manager Foundations course. The habit I am practicing this week is [habit]. Ask me about it on [date].”</div></section>`);
// learning
H.push(`<section class="learn"><span class="eyebrow">Keep learning</span><h2>What to take <em>next</em>.</h2><p class="tx2">Ten courses in Oracle Learning, in order, and ten things from outside. Micro modules first. Then one item a month, on the habit you are working on. Links are live in the PDF; in Oracle Learning you can also search by title.</p>`);
[[TOP[0][1], i => i.type === 'oracle'], [TOP[1][1], i => i.type !== 'oracle']].forEach(g => { const items = L.filter(g[1]); if(!items.length) return; H.push(`<h3>${esc(g[0])}</h3><ul style="list-style:none;padding:0">` + items.map((i, n) => `<li><span class="k">${i.type === 'oracle' ? (n + 1) + ' · ' : ''}${kind(i.type)}</span> <a href="${esc(i.url)}">${esc(i.title)}</a><span class="why">${esc(i.why || '')}</span></li>`).join('') + '</ul>'); });
const C = w.MV_COMPLIANCE; if(C) H.push(`<h3>${esc(C.title)}</h3><p class="tx2">${esc(C.note)}${C.url ? ` <a href="${esc(C.url)}">Open in Oracle Learning</a>.` : ''}</p><ol style="columns:2;column-gap:18pt;margin:4pt 0 0;padding-left:16pt;font-size:9.5pt">` + C.items.map(t => `<li style="break-inside:avoid">${esc(t)}</li>`).join('') + '</ol>');
H.push(`</section>
<footer class="foot"><b>Vanderbilt University · People, Culture and Belonging · Futures Learning Hub.</b> Manager Voyage, Manager Foundations, Course 1: You Are a Manager Now. This guide mirrors the online course at the time it was generated; the online course is the current version. Questions about a situation: your HCM first, your Engagement Consultant for the bigger ones.</footer>
</div></body></html>`);
fs.writeFileSync(path.join(F, 'guide.html'), H.join('\n'));
console.log('foundation/guide.html written');
(async () => {
  let pw; try{ pw = require('playwright'); }catch(e){ console.log('Playwright not installed; open foundation/guide.html and print to PDF.'); return; }
  const exe = process.env.CHROME_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const b = await pw.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const p = await b.newPage();
  await p.goto('file://' + path.join(F, 'guide.html'), { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.pdf({ path: path.join(F, 'Manager-Foundations-Course-1.pdf'), format: 'Letter', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;font-family:Inter,Arial,sans-serif;font-size:7.5pt;color:#6f5a2e;padding:0 .55in;display:flex;justify-content:space-between"><span>Manager Voyage · Manager Foundations · Course 1</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
    margin: { top: '.6in', bottom: '.7in', left: '.55in', right: '.55in' } });
  await b.close(); console.log('foundation/Manager-Foundations-Course-1.pdf written');
})();
