/* Builds the Manager Playbook: the workbook a cohort manager fills one
   section a week and presents at the capstone. Writes cohort/playbook.html
   and prints cohort/Manager-Playbook.pdf (letter). Content follows the
   cohort data in assets/js/program-data.js. Run: node scripts/build-playbook.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, '..'), OUT = path.join(R, 'cohort');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
const w = { MV_CONFIG: {} }; vm.createContext(w);
vm.runInContext(fs.readFileSync(path.join(R, 'assets/js/program-data.js'), 'utf8').replace('window.MV_PROGRAM', 'MV_PROGRAM'), w);
const C = w.MV_PROGRAM.cohort;
vm.runInContext(fs.readFileSync(path.join(R, 'cohort/program.js'), 'utf8').replace('window.MV_COHORT', 'MV_COHORT'), w);
const K = w.MV_COHORT;
const fmtMins = m => m >= 60 ? (m / 60).toFixed(m % 60 ? 1 : 0).replace('.0', '') + ' hours' : m + ' minutes';
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lines = (n, h) => `<div class="lines" style="--n:${n}${h ? ';height:' + h : ''}"></div>`;
const field = (label, hint, n) => `<div class="field"><span class="fl">${esc(label)}</span>${hint ? `<span class="fh">${esc(hint)}</span>` : ''}${lines(n || 3)}</div>`;
const people = (cols, rows) => `<table class="grid"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: rows || 4 }, () => `<tr>${cols.map(() => '<td></td>').join('')}</tr>`).join('')}</tbody></table>`;
const check = items => `<ul class="checks">${items.map(t => `<li><span class="cb"></span>${esc(t)}</li>`).join('')}</ul>`;
const weekHead = (n, title, when, sub) => `<div class="sec-head"><span class="eyebrow">${esc(when)}</span><h2><span class="no">${esc(n)}</span>${esc(title)}</h2>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}</div>`;

const H = [];
H.push(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Manager Playbook · Manager Voyage</title>
<style>
@font-face{font-family:'Libre Caslon Display';src:url('../assets/fonts/libre-caslon-display-latin-400-normal.woff2') format('woff2');font-weight:400}
@font-face{font-family:'Libre Caslon Text';src:url('../assets/fonts/libre-caslon-text-latin-400-italic.woff2') format('woff2');font-style:italic;font-weight:400}
@font-face{font-family:'Inter';src:url('../assets/fonts/inter-latin-400-normal.woff2') format('woff2');font-weight:400}
@font-face{font-family:'Inter';src:url('../assets/fonts/inter-latin-500-normal.woff2') format('woff2');font-weight:500}
@font-face{font-family:'Inter';src:url('../assets/fonts/inter-latin-600-normal.woff2') format('woff2');font-weight:600}
@font-face{font-family:'Antonio';src:url('../assets/fonts/antonio-latin-700-normal.woff2') format('woff2');font-weight:700}
:root{--ink:#1C1C1C;--soft:#5B554B;--oak:#946E24;--gold:#CFAE70;--line:#DDD5C6;--faint:#F5F3EF}
@page{size:letter;margin:.6in .55in .7in}
*{box-sizing:border-box}
html,body{margin:0;background:#fff;color:var(--ink);font-family:Inter,Arial,sans-serif;font-size:10pt;line-height:1.5}
h1,h2,h3{font-family:'Libre Caslon Display','Times New Roman',serif;font-weight:400;line-height:1.1;margin:0}
h1 em,h2 em,.cover em{font-family:'Libre Caslon Text',serif;font-style:italic;color:var(--oak)}
p{margin:0}
.eyebrow{display:block;font-family:Antonio,Impact,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-size:8pt;color:var(--oak)}
.page{break-after:page}
.page:last-child{break-after:auto}
/* cover */
.cover{height:9.4in;display:flex;flex-direction:column;justify-content:space-between;border-top:6px solid var(--gold);padding-top:.5in}
.cover .lockup{width:2.4in}
.cover h1{font-size:44pt;margin-top:.3in}
.cover .lead{font-size:12pt;color:var(--soft);max-width:5.4in;margin-top:.2in}
.cover .ident{display:grid;grid-template-columns:1fr 1fr;gap:.18in .4in;margin-top:.4in}
.cover .ident div{border-bottom:1px solid var(--ink);padding-bottom:4pt}
.cover .ident span{display:block;font-family:Antonio,Impact,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:7.5pt;color:var(--oak);margin-bottom:14pt}
.cover .foot{font-size:8.5pt;color:var(--soft)}
/* sections */
.sec-head{border-bottom:2px solid var(--gold);padding-bottom:6pt;margin-bottom:10pt}
.sec-head h2{font-size:22pt;margin-top:2pt}
.sec-head h2 .no{display:inline-block;min-width:.55in;color:var(--oak);font-family:Antonio,Impact,sans-serif;font-weight:700;font-size:14pt;vertical-align:middle;letter-spacing:.04em}
.sec-head .sub{color:var(--soft);margin-top:4pt;max-width:6.4in}
h3{font-size:13pt;margin:10pt 0 4pt}
.intro{color:var(--soft);max-width:6.4in}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10pt 16pt}
.field{margin-top:8pt;break-inside:avoid}
.fl{display:block;font-weight:600;font-size:9.5pt}
.fh{display:block;font-size:8.5pt;color:var(--soft);margin-top:1pt}
.lines{margin-top:4pt;height:calc(var(--n) * 18pt);background:repeating-linear-gradient(to bottom,transparent 0,transparent 17pt,var(--line) 17pt,var(--line) 18pt);border-bottom:0}
.box{margin-top:6pt;border:1px solid var(--line);border-left:3px solid var(--gold);background:var(--faint);padding:7pt 9pt;font-size:9pt;color:var(--soft);break-inside:avoid}
.box b{color:var(--ink)}
table.grid{width:100%;border-collapse:collapse;margin-top:6pt;font-size:8.5pt;break-inside:avoid}
table.grid th{text-align:left;font-family:Antonio,Impact,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:7.5pt;color:var(--oak);border-bottom:1.5px solid var(--gold);padding:3pt 5pt}
table.grid td{border-bottom:1px solid var(--line);height:34pt;padding:3pt 5pt;vertical-align:top}
.checks{list-style:none;margin:6pt 0 0;padding:0;display:grid;gap:5pt}
.checks li{display:flex;gap:7pt;align-items:flex-start;font-size:9.5pt}
.cb{flex:0 0 auto;width:11pt;height:11pt;border:1.2px solid var(--ink);border-radius:2px;margin-top:2pt}
.rhythm{display:grid;grid-template-columns:repeat(4,1fr);gap:8pt;margin-top:8pt}
@media screen and (max-width:640px){.rhythm{grid-template-columns:1fr 1fr}}
.rhythm div{border:1px solid var(--line);border-top:3px solid var(--gold);padding:7pt 8pt;font-size:8.5pt;color:var(--soft)}
.rhythm b{display:block;font-family:'Libre Caslon Display',serif;font-weight:400;font-size:11.5pt;color:var(--ink);margin:2pt 0 3pt}
.rhythm .when{font-family:Antonio,Impact,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.07em;font-size:7pt;color:var(--oak)}
.scale{display:grid;grid-template-columns:1fr auto auto;gap:4pt 14pt;align-items:center;margin-top:6pt;font-size:9pt}
.scale .h{font-family:Antonio,Impact,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:7.5pt;color:var(--oak)}
.scale .b{display:flex;gap:5pt}
.scale .b i{display:inline-block;width:14pt;height:14pt;border:1px solid var(--ink);border-radius:50%;font-style:normal;font-size:7.5pt;text-align:center;line-height:13pt}
.model{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:8pt;margin-top:8pt}
.model .q{border:1px solid var(--line);border-top:3px solid var(--gold);padding:7pt 9pt;min-height:2.3in}
.model .q .eyebrow{font-size:7.5pt}
.model .q b{display:block;font-family:'Libre Caslon Display',serif;font-weight:400;font-size:12pt;margin:2pt 0 4pt}
.center{border:1.5px solid var(--ink);padding:8pt 10pt;margin-top:8pt;min-height:.9in}
.ladder{display:grid;grid-template-columns:repeat(5,1fr);gap:5pt;margin-top:6pt;font-size:8pt;color:var(--soft)}
.ladder div{border:1px solid var(--line);padding:5pt 6pt}
.ladder b{display:block;color:var(--ink);font-size:8.5pt}
.small{font-size:8.5pt;color:var(--soft)}
.sig{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16pt;margin-top:14pt}
.sig div{border-bottom:1px solid var(--ink);padding-top:26pt;font-size:8pt;color:var(--soft)}
</style></head><body>`);

/* cover */
H.push(`<section class="page cover">
<div><img class="lockup" src="../assets/img/vu-lockup-black.png" alt="Vanderbilt University">
<span class="eyebrow" style="margin-top:.5in">Manager Voyage · The four-week cohort</span>
<h1>The Manager <em>Playbook</em>.</h1>
<p class="lead">Your written personal operating system: how you manage, in your own words, one section a week. Started in the classroom, drafted through two remote weeks, presented at the capstone to peers and your business unit leader, and yours to keep.</p>
<div class="ident"><div><span>Name</span></div><div><span>Team and business unit</span></div><div><span>Hourly, salaried, or mixed · how many people</span></div><div><span>Week one date</span></div></div></div>
<p class="foot">Vanderbilt University · People, Culture and Belonging · Futures Learning Hub</p>
</section>`);

/* how it works */
H.push(`<section class="page">
${weekHead('', 'How this Playbook works', 'Read first', 'The cohort builds on Manager Foundations. It does not reteach the Vanderbilt Manager Standard; it practices it with your own team, and this Playbook is where the practice gets written down. One section a week, presented whole in week four.')}
<h3>The four weeks</h3>
<div class="rhythm">${K.weeks.map(w => `<div><span class="when">Week ${w.n} · ${esc(w.mode)} · ${esc(fmtMins(w.mins))}</span><b>${esc(w.title)}</b>Expectation ${K.standard[w.expectation - 1].n}, ${esc(K.standard[w.expectation - 1].name.toLowerCase().replace(/vanderbilt/g, "Vanderbilt"))}.<br><span style="color:#1C1C1C;font-weight:600">Section ${w.playbook.n} · ${esc(w.playbook.title)}</span></div>`).join('')}</div>
<h3>What you write, week by week</h3>
<table class="grid" style="font-size:9pt"><thead><tr><th style="width:1.1in">When</th><th>Section</th><th>Due</th></tr></thead><tbody>
<tr><td style="height:auto">Before week 1</td><td style="height:auto"><b>Set your team</b> on the cohort site, finish Manager Foundations, and take the four-question pulse. The cohort site is at ${esc(K.site.replace('https://', ''))}.</td><td style="height:auto">Bring the printed Playbook to week 1</td></tr>
${K.weeks.map(w => `<tr><td style="height:auto">Week ${w.n}</td><td style="height:auto"><b>Section ${w.playbook.n} · ${esc(w.playbook.title)}.</b> ${esc(w.playbook.desc)}</td><td style="height:auto">${esc(w.playbook.due)}</td></tr>`).join('')}
</tbody></table>
<div style="break-inside:avoid"><h3>Three rules for writing it</h3>
<div class="box"><b>Write in your own voice.</b> This is not a form for PCB; it is the document you will reread in month six. <b>Use real names and real dates.</b> A plan without a name and a date is a wish. <b>Short beats complete.</b> One true sentence per prompt is enough; the room adds the rest. <b>Weeks two and three are capped at ninety minutes,</b> and five of those are for this Playbook; the rest of the week is for doing it with your team.</div></div>
</section>`);

/* before week one */
H.push(`<section class="page">
${weekHead('W0', 'Before week one', 'On your own, about twenty minutes', 'Set your team on the cohort site so every scenario is written for the people you manage. Then the pulse, and one sentence.')}
<h3>Your team</h3>
<div class="two">${field('The area your team is in', 'Dining, IT, facilities, a research lab, the library, student affairs, administration, advancement.', 1)}${field('Hourly, salaried, or mixed, and how many', '', 1)}</div>
${field('The first sentence of your Philosophy', 'What can your team expect from you? One sentence. It will be sharpened in week 1.', 3)}
<h3>The pulse, before</h3>
<p class="intro">How confident are you in each conversation today? Circle one. You answer the same four questions again in week four.</p>
<div class="scale">
<span class="h">Conversation</span><span class="h">Not yet</span><span class="h">Confident</span>
${K.pulse.map(q => `<span>${esc(q)}</span><span class="b"><i>1</i><i>2</i><i>3</i></span><span class="b"><i>4</i><i>5</i></span>`).join('')}
</div>
<h3>Before week one</h3>
${check(['Manager Foundations finished, and the assessment taken', 'Your team set on the cohort site (profile: area, hourly or salaried, size, where they sit)', 'This Playbook printed, or open on a tablet', 'The first sentence above written and ready to read aloud'])}
<div class="box" style="margin-top:12pt"><b>Which of the four expectations did your assessment say to start with?</b> 01 Get the work done, through your team (Yukl: task) · 02 Take care of your people (relations) · 03 Make things better (change) · 04 Connect your team to the rest of Vanderbilt (external). Name it here; it becomes your thread through the four weeks.</div>
${lines(2)}
</section>`);

/* the other things you manage */
H.push(`<section class="page">
${weekHead('', 'The other things you manage', 'Reference · the cohort site has the full version', 'Timecards, leave, expenses, hiring, the performance cycle, the inbox. By cadence, with the system and who to call. Then your week.')}
${K.manage.cadence.map(g => `<h3>${esc(g.when)}</h3><table class="grid" style="font-size:8.5pt"><thead><tr><th style="width:2.1in">What</th><th style="width:1.7in">System</th><th>Who to call</th></tr></thead><tbody>${g.items.map(d => `<tr><td style="height:auto">${esc(d.what)}</td><td style="height:auto">${esc(d.sys)}</td><td style="height:auto">${esc(d.who)}</td></tr>`).join('')}</tbody></table>`).join('')}
</section>`);
H.push(`<section class="page">
${weekHead('', 'A week that works', 'Reference · Covey, Drucker, Grove', 'The duties fit in the gaps if the managing goes into the calendar first. Fill in your own version.')}
<div class="rhythm">${K.manage.week.map(d => `<div><span class="when">${esc(d.day)}</span>${d.items.map(i => `<b style="font-size:9pt;font-family:Inter,Arial,sans-serif;font-weight:400;margin:2pt 0">${esc(i)}</b>`).join('')}</div>`).join('')}</div>
<h3>Five time rules</h3>
${K.manage.time.map(t => `<div class="box"><b>${esc(t.who)}: ${esc(t.what)}.</b> ${esc(t.how)}</div>`).join('')}
${field('My week, in my own words', 'Which day the approvals happen, when the 1:1s sit, where the protected half day goes.', 4)}
</section>`);

/* the leader, and the team's view */
H.push(`<section class="page">
${weekHead('', 'Your leader, and your team’s view', 'Before week one · the other half of the cohort', 'Two things make the practice stick: your own leader asking one question a week, and your team’s anonymous view of the same ten behaviors you rated yourself on.')}
<h3>Your leader: fifteen minutes before week one</h3>
${check(K.leader.before)}
<h3>One question a week, from your leader</h3>
<table class="grid" style="font-size:9pt"><thead><tr><th style="width:.7in">Week</th><th>The question</th><th style="width:2.4in">Why</th></tr></thead><tbody>${K.leader.weekly.map(w => `<tr><td style="height:auto">${w.week}</td><td style="height:auto"><b>${esc(w.ask)}</b></td><td style="height:auto">${esc(w.why)}</td></tr>`).join('')}</tbody></table>
<h3>Your team’s view: the ten statements, from their side</h3>
<p class="intro">Anonymous, three or more responses, before week one and again at ninety days. Answered on a five-point scale: ${esc(K.teamCheck.scale.join(', '))}.</p>
<ol style="margin:6pt 0 0;padding-left:16pt;font-size:9pt;line-height:1.45">${K.teamCheck.statements.map(q => `<li style="margin:0 0 3pt">${esc(q)}</li>`).join('')}</ol>
</section>`);

/* section 1 */
H.push(`<section class="page">
${weekHead('01', 'Manager Philosophy', 'Week 1 · In the classroom · What it means to manage · due Sunday', 'One page on how you will manage. It starts with the mission, runs through your Manager Voyage on a timeline, and ends with the sentence you read aloud to your four.')}
${field('The best manager I ever had did…', 'What they did that stuck with you, and how it shows up in the way you will lead.', 2)}
${field('The mission needs my team to…', 'From the first fifteen minutes. What your team makes possible for the people this university exists for.', 2)}
<h3>My voyage, in seven lines</h3>
<table class="grid" style="font-size:9pt"><thead><tr><th style="width:1.6in">Stop</th><th>One line</th></tr></thead><tbody>${K.timeline.map(t => `<tr><td style="height:22pt"><b>${esc(t.label)}</b><br><small>${esc(t.title)}</small></td><td style="height:22pt"></td></tr>`).join('')}</tbody></table>
<h3>Six moments that made me</h3>
<table class="grid" style="font-size:9pt"><thead><tr><th style="width:1.6in">Moment</th><th>One line</th></tr></thead><tbody>${K.lenses.map(l => `<tr><td style="height:20pt"><b>${esc(l.name)}</b></td><td style="height:20pt"></td></tr>`).join('')}</tbody></table>
${field('What my team can expect from me', 'One sentence, then the three commitments behind it. The ones you could be held to on a bad day.', 4)}
<div class="two">${field('What I say when bad news lands', 'Your first sentence, word for word.', 3)}${field('The expectation my team needs most this month, and the habit I will keep', 'From the How to lead activity.', 3)}</div>
${field('My intent for the next 90 days, and the assessment statement I want to move', 'What will be true about this team by Day 90 that is not true today? Which of the ten statements will say so?', 3)}
<div class="box"><b>Read it to your four.</b> They make it shorter and more specific, something your team could check. Write the sharpened sentence here.</div>
${lines(2)}
</section>`);

/* section 2 */
H.push(`<section class="page">
${weekHead('02', '1:1 framework and conversation plan', 'Week 2 · Remote, under ninety minutes · Goals, 1:1s, and difficult conversations · due Sunday', 'Expectation 01, get the work done through your team: a cadence on the calendar, goals per person, and the hard conversation you rehearsed with Dev on your phone and then held for real.')}
<h3>My 1:1 framework</h3>
<div class="two">${field('Cadence and length', 'Weekly or biweekly, how long, which day. It goes on the calendar before Monday.', 2)}${field('Where the agenda lives', 'Theirs first. Where it is written so both of you can see it.', 2)}</div>
<div class="two">${field('What I check every time', 'Work before it is due, what they are stuck on, what is coming that they should hear from me first.', 3)}${field('What I never let a 1:1 become', 'A status report, a one-way download, a skipped meeting.', 3)}</div>
<h3>Three goals per person, this quarter</h3>
${people(['Name', 'Goal 1', 'Goal 2', 'Goal 3', 'By when'], 5)}
<h3>The conversation plan</h3>
<div class="two">${field('Who, and what I noticed', 'The specific observation, with dates. Not a feeling about them.', 3)}${field('What I expect, by when', 'Clear is kind. The expectation and the date, said out loud.', 3)}</div>
<div class="two">${field('My opening sentence, word for word', '', 2)}${field('What they might need from me', 'The question you will ask, and the help you can actually give.', 2)}</div>
${field('What happened when I held it', 'Fill in after. What you said, what they said, what you would say differently. You will read it back in week four.', 3)}
</section>`);

/* section 3 */
H.push(`<section class="page">
${weekHead('03', 'Delegation and growth plan', 'Week 3 · Remote, under ninety minutes · Coaching and mentoring · due Sunday', 'Expectation 02, take care of your people. From directing to developing: where each person wants to go, one stretch assignment toward it, the rung of the ladder they are on, and the decision you handed over this week.')}
<h3>The delegation ladder</h3>
<div class="ladder"><div><b>1 · Do as I say</b>I decide, they do.</div><div><b>2 · Check with me</b>They propose, I approve.</div><div><b>3 · Tell me, then act</b>They decide and inform me first.</div><div><b>4 · Act, then tell me</b>They decide and inform me after.</div><div><b>5 · Their call</b>They decide; I hear about it if it matters.</div></div>
<h3>Growth plan, one line per person</h3>
${people(['Name', 'Where they want to be in two years', 'One stretch assignment toward it', 'Rung today', 'Next rung', 'By when'], 5)}
<h3>The decision I handed over this week</h3>
<div class="two">${field('The decision, and to whom', 'The decision, not just the task.', 2)}${field('The one boundary I stated', 'The thing the decision has to respect, said once, up front.', 2)}</div>
${field('What happened when I did not take it back', 'Include the moment you wanted to.', 3)}
<div class="two">${field('My coaching cadence', 'When you ask instead of tell: which meeting, how often, with the questions to hand.', 3)}${field('One thank-you, by name, this week', 'Who, for what specific thing, and where you said it.', 3)}</div>
</section>`);

/* section 4 */
H.push(`<section class="page">
${weekHead('04', 'Performance practice', 'Week 4 · In the classroom · Performance, talent, and your Playbook · due before the capstone', 'Expectation 04, connect your team to the rest of Vanderbilt. How you run the cycle, how you give feedback, and how you handle a concern from the first conversation to the written step, with the people you call along the way.')}
<h3>How I run the performance cycle</h3>
<div class="two">${field('Goals set and written', 'When in the cycle, and where the team can see them.', 2)}${field('Check-ins', 'How often the goals come up before the review, so nothing at the review is a surprise.', 2)}</div>
<h3>My feedback approach</h3>
<div class="two">${field('Situation, behavior, impact: my template', 'When you did X in Y, the effect was Z. Write the version you will actually say.', 3)}${field('Reinforcing feedback, that week', 'Specific, by name, the same week. How you will make sure it happens.', 3)}</div>
<h3>A concern, from first conversation to written step</h3>
<table class="grid" style="font-size:9pt"><thead><tr><th style="width:1.5in">Step</th><th>What I do</th><th style="width:1.7in">Who I call</th></tr></thead><tbody>
<tr><td>The clear conversation</td><td></td><td>Nobody yet, unless unsure: my HCM</td></tr>
<tr><td>If it does not change</td><td></td><td>My HCM, before anything formal</td></tr>
<tr><td>The written step</td><td></td><td>Employee Relations Consultant, through my HCM</td></tr>
<tr><td>A leave, health, or fairness mention along the way</td><td></td><td>Leave, EOA, or Title IX the same day</td></tr>
</tbody></table>
${field('The performance conversation I rehearsed with Marcus, then held', 'Honest about the cycle, specific about what would change the answer, a growth move that starts now.', 3)}
</section>`);

/* integrated management model */
H.push(`<section class="page">
${weekHead('', 'Integrated Management Model', 'Capstone deliverable · one page', 'How the four weeks connect for you. Synthesis, not attendance: one habit per job, in your words, and the sentence at the center that holds them together.')}
<div class="model">
<div class="q"><span class="eyebrow">Task-oriented · Get the work done, through your team</span><b>Plan it, say it, check it, fix it</b><span class="small">My habit, and the week it comes from:</span>${lines(5)}</div>
<div class="q"><span class="eyebrow">Relations-oriented · Take care of your people</span><b>Listen and help, grow them, thank them, trust them</b><span class="small">My habit, and the week it comes from:</span>${lines(5)}</div>
<div class="q"><span class="eyebrow">Change-oriented · Make things better</span><b>Explain the why, describe where we are going, let people try, look back</b><span class="small">My habit, and the week it comes from:</span>${lines(5)}</div>
<div class="q"><span class="eyebrow">External · Connect your team</span><b>Know the people, watch for what is coming, speak up for your team</b><span class="small">My habit, and the week it comes from:</span>${lines(5)}</div>
</div>
<div class="center"><span class="eyebrow">The sentence at the center</span><p class="small">How I manage, in one sentence. It should sound like the Philosophy from week 1, sharpened by three more weeks.</p>${lines(2)}</div>
</section>`);

/* team development plan */
H.push(`<section class="page">
${weekHead('', 'Team Development Plan', 'Capstone deliverable · 90 days', 'A plan for your actual team: names, goals, growth moves, and dates. Challenged by your four in week 4, one goal, one move, one date; presented in the same hour to peers and your business unit leader.')}
${field('The team goal for the next 90 days', 'One outcome the whole team owns, and how you will know.', 2)}
${people(['Name', 'Their goal', 'Growth move', 'By Day 30', 'By Day 60', 'By Day 90'], 6)}
<div class="two">${field('What I need from my business unit leader', 'The ask, with the reason. Bring it to the capstone.', 3)}${field('What could get in the way', 'The risk you already see, and your first move on it.', 3)}</div>
<h3>The five-minute presentation</h3>
${check(['One minute: the sentence at the center, my Philosophy from week 1', 'Two minutes: the team goal, how it serves the mission line, and one person\'s plan by name', 'One minute: the habit I kept, which expectation it serves, and what the team noticed', 'One minute: what I need from my business unit leader', 'Then three minutes of challenge: one goal, one move, one date'])}
</section>`);

/* capstone */
H.push(`<section class="page">
${weekHead('', 'The capstone, and after', 'Week 4 · in the classroom · two hours', 'Before you present, take the pulse again and compare it with your answers from before week one. Then the 90-day reassessment date.')}
<h3>The pulse, after</h3>
<div class="scale">
<span class="h">Conversation</span><span class="h">Not yet</span><span class="h">Confident</span>
<span>Telling a team member what I expect, by when, and what good looks like</span><span class="b"><i>1</i><i>2</i><i>3</i></span><span class="b"><i>4</i><i>5</i></span>
<span>Holding a difficult conversation about missed work without hinting</span><span class="b"><i>1</i><i>2</i><i>3</i></span><span class="b"><i>4</i><i>5</i></span>
<span>Handing over a real decision, with the boundary stated, and not taking it back</span><span class="b"><i>1</i><i>2</i><i>3</i></span><span class="b"><i>4</i><i>5</i></span>
<span>Having a performance conversation that is honest about the answer and specific about what changes it</span><span class="b"><i>1</i><i>2</i><i>3</i></span><span class="b"><i>4</i><i>5</i></span>
</div>
<h3>Capstone checklist</h3>
${check(['Sections 1 to 4 finished', 'Integrated Management Model on one page', 'Team Development Plan with names and dates', 'Business unit leader invited to the room for the presentations', 'Five-minute presentation rehearsed out loud once'])}
<h3>After the cohort</h3>
${check(['Reread this Playbook at Day 30 and Day 90 of the plan', 'Rate the ten statements again at the 90-day reassessment and compare, expectation by expectation', 'Keep the Manager Portal open: templates, policy links, and who to call'])}
<div class="sig"><div>Manager</div><div>Business unit leader</div><div>Date</div></div>
<p class="small" style="margin-top:.6in">Vanderbilt University · People, Culture and Belonging · Futures Learning Hub. The Manager Playbook is the manager's own document. The Playbook itself is not collected; what you present in week four is the record.</p>
</section>`);

H.push('</body></html>');
fs.writeFileSync(path.join(OUT, 'playbook.html'), H.join('\n'));
console.log('cohort/playbook.html written');

(async () => {
  let pw = null;
  for (const m of ['playwright', '/opt/node22/lib/node_modules/playwright']) { try { pw = require(m); break; } catch (e) {} }
  if (!pw) { console.log('Playwright not installed; open cohort/playbook.html and print to PDF.'); return; }
  const exe = process.env.CHROME_PATH || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const b = await pw.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const p = await b.newPage();
  await p.goto('file://' + path.join(OUT, 'playbook.html'), { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.pdf({ path: path.join(OUT, 'Manager-Playbook.pdf'), format: 'Letter', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;font-family:Inter,Arial,sans-serif;font-size:7.5pt;color:#6f5a2e;padding:0 .55in;display:flex;justify-content:space-between"><span>Manager Voyage · The Manager Playbook</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
    margin: { top: '.6in', bottom: '.7in', left: '.55in', right: '.55in' } });
  await b.close(); console.log('cohort/Manager-Playbook.pdf written');
})();
