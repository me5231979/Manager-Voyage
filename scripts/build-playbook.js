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
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lines = (n, h) => `<div class="lines" style="--n:${n}${h ? ';height:' + h : ''}"></div>`;
const field = (label, hint, n) => `<div class="field"><span class="fl">${esc(label)}</span>${hint ? `<span class="fh">${esc(hint)}</span>` : ''}${lines(n || 3)}</div>`;
const people = (cols, rows) => `<table class="grid"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: rows || 4 }, () => `<tr>${cols.map(() => '<td></td>').join('')}</tr>`).join('')}</tbody></table>`;
const check = items => `<ul class="checks">${items.map(t => `<li><span class="cb"></span>${esc(t)}</li>`).join('')}</ul>`;
const S = w.MV_PROGRAM.standards || [];
const stdName = k => (S.filter(x => x.key === k)[0] || {}).name || k;
const pulseRows = () => S.map(st => `<span><b>${esc(st.name)}.</b> ${esc(st.pulse)}</span><span class="b"><i>1</i><i>2</i><i>3</i></span><span class="b"><i>4</i><i>5</i></span>`).join('\n');
const stdLine = keys => `<p class="stdline">Builds: ${keys.map(stdName).map(esc).join(' · ')}</p>`;
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
.stdline{margin:-4pt 0 8pt;font-family:Antonio,Impact,sans-serif;font-weight:700;font-size:8pt;letter-spacing:.06em;text-transform:uppercase;color:var(--oak)}
.scale span b{font-weight:600}
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
<p class="lead">Your written personal operating system: how you manage, in your own words, one section a week. Drafted through the four weeks, presented at the capstone, and yours to keep.</p>
<div class="ident"><div><span>Name</span></div><div><span>Team and business unit</span></div><div><span>Cohort</span></div><div><span>Kickoff date</span></div></div></div>
<p class="foot">Vanderbilt University · People, Culture and Belonging · Futures Learning Hub</p>
</section>`);

/* how it works */
H.push(`<section class="page">
${weekHead('', 'How this Playbook works', 'Read first', 'Every week of the cohort ends with a Playbook section. The Friday discussion is grounded in what you wrote, and the capstone is where you present the whole thing.')}
<h3>The weekly rhythm</h3>
<div class="rhythm">${C.rhythm.map(r => `<div><span class="when">${esc(r.when)}</span><b>${esc(r.beat)}${r.tool ? ' <span style="font-family:Inter;font-size:8pt;color:#5B554B">in ' + esc(r.tool) + '</span>' : ''}</b>${esc(r.desc)}<br><span style="color:#1C1C1C;font-weight:600">${esc(r.mins)}</span></div>`).join('')}</div>
<h3>What you write, week by week</h3>
<table class="grid" style="font-size:9pt"><thead><tr><th style="width:1.1in">When</th><th>Section</th><th>Due</th></tr></thead><tbody>
<tr style="height:auto"><td style="height:auto">Prework</td><td style="height:auto"><b>The first sentence</b> of your Philosophy, the confidence pulse, and the calendar holds.</td><td style="height:auto">Bring it to the kickoff</td></tr>
<tr><td style="height:auto">Week 1</td><td style="height:auto"><b>Section 1 · Manager Philosophy.</b> What your team can expect from you, what you say when bad news lands, your 90-day intent.</td><td style="height:auto">Sunday</td></tr>
<tr><td style="height:auto">Week 2</td><td style="height:auto"><b>Section 2 · 1:1 framework and conversation plan.</b> Your cadence and agenda, three goals per person, the conversation you rehearsed.</td><td style="height:auto">Sunday</td></tr>
<tr><td style="height:auto">Week 3</td><td style="height:auto"><b>Section 3 · Delegation and growth plan.</b> Where each person wants to be, one stretch assignment, the rung they are on, your coaching cadence.</td><td style="height:auto">Sunday</td></tr>
<tr><td style="height:auto">Week 4</td><td style="height:auto"><b>Section 4 · Performance practice,</b> then the <b>Integrated Management Model</b> and the <b>Team Development Plan</b>.</td><td style="height:auto">Before the capstone</td></tr>
</tbody></table>
<h3>Three rules for writing it</h3>
<div class="box"><b>Write in your own voice.</b> This is not a form for PCB; it is the document you will reread in month six. <b>Use real names and real dates.</b> A plan without a name and a date is a wish. <b>Short beats complete.</b> One true sentence per prompt is enough; the discussion adds the rest.</div>
<h3>Where it ends up</h3>
<p class="intro">At the capstone you present the Integrated Management Model and the Team Development Plan to peers and your business unit leader, in the room or online. The deliverables are recorded in Oracle Learning against your job profile. The Playbook stays with you.</p>
</section>`);

/* the six standards */
H.push(`<section class="page">
${weekHead('', 'The six standards', 'What Vanderbilt measures every manager on', 'Six behaviors, drawn from Gary Yukl (2012), one standard for every manager. The Foundation course taught the habits behind each; this Playbook is where you practice them with your real team.')}
<table class="grid" style="font-size:9pt"><thead><tr><th style="width:1.4in">Standard</th><th>What it looks like</th><th style="width:1.7in">Where the Playbook builds it</th></tr></thead><tbody>
${S.map(st => `<tr style="height:auto"><td style="height:auto"><b>${esc(st.name)}</b></td><td style="height:auto">${esc(st.desc)}</td><td style="height:auto">${esc(st.playbook)}</td></tr>`).join('')}
</tbody></table>
<h3>How the four weeks build them</h3>
<table class="grid" style="font-size:9pt"><thead><tr><th style="width:1.1in">Week</th><th>Topic</th><th style="width:2.4in">Builds</th></tr></thead><tbody>
${C.weeks.filter(w => w.n > 0).map(w => `<tr style="height:auto"><td style="height:auto">Week ${w.n}</td><td style="height:auto"><b>${esc(w.title)}.</b> ${esc(w.outcome)}</td><td style="height:auto">${(w.standards || []).map(stdName).map(esc).join(' · ')}</td></tr>`).join('')}
</tbody></table>
<h3>How you are measured</h3>
<p class="intro">You rate yourself on all six before the kickoff and again at the capstone, on the next pages. The Manager Effectiveness Assessment you took before the Foundation course scores the same habits; you retake it six months after the capstone.</p>
</section>`);

/* prework */
H.push(`<section class="page">
${weekHead('W0', 'Prework', 'The week before the kickoff · about 90 minutes on your own time', 'Watch New Manager Foundations in Oracle Learning, then write one sentence. Bring it to the kickoff; you will read it aloud.')}
${field('The first sentence of your Philosophy', 'What can your team expect from you? One sentence. It will be sharpened in week 1.', 3)}
<h3>The pulse, before</h3>
<p class="intro">One item per standard. How often is this true of you today? Circle one. You answer the same six again at the capstone, and the six-month assessment scores the same habits.</p>
<div class="scale">
<span class="h">Standard</span><span class="h">Not yet</span><span class="h">Every week</span>
${pulseRows()}
</div>
<h3>Before the kickoff</h3>
${check(['New Manager Foundations watched in Oracle Learning', 'The calendar holds accepted: the Learning Lab slot, the Scenario Studio, and the Friday discussion, all four weeks', 'The kickoff date, time, and room or link confirmed', 'The first sentence above written and ready to read aloud'])}
<div class="box" style="margin-top:12pt"><b>Which of the four jobs have you been avoiding?</b> Get the work done through your team · Take care of your people · Make things better · Connect your team. Name it here; it becomes your thread through the four weeks.</div>
${lines(2)}
</section>`);

/* section 1 */
H.push(`<section class="page">
${weekHead('01', 'Manager Philosophy', 'Week 1 · What it means to manage · due Sunday', 'One page on how you will manage. Start from the sentence you read aloud at the kickoff and the reaction you named in the Learning Lab.')}
${stdLine(['clarity', 'trust'])}
${field('What my team can expect from me', 'Three commitments, in plain words. The ones you could be held to on a bad day.', 5)}
${field('What I say when bad news lands', 'Your first sentence, word for word. Thank first, solve second, learn the cause later.', 3)}
${field('The one reaction on my team I will change', 'From the Learning Lab: the moment that decides whether you hear the next problem early.', 3)}
${field('My intent for the next 90 days', 'What will be true about this team by Day 90 that is not true today?', 4)}
<div class="box"><b>Friday discussion prompt.</b> Read your commitments to a peer. They answer: what would your team notice by Friday if that were true? Write their answer here.</div>
${lines(2)}
</section>`);

/* section 2 */
H.push(`<section class="page">
${weekHead('02', '1:1 framework and conversation plan', 'Week 2 · Goal setting, 1:1s, and difficult conversations · due Sunday', 'The operating discipline of the role: a cadence on the calendar, goals per person, and the hard conversation you rehearsed in the Scenario Studio and then held for real.')}
${stdLine(['clarity', 'coach', 'issues'])}
<h3>My 1:1 framework</h3>
<div class="two">${field('Cadence and length', 'Weekly or biweekly, how long, which day. It goes on the calendar before Monday.', 2)}${field('Where the agenda lives', 'Theirs first. Where it is written so both of you can see it.', 2)}</div>
<div class="two">${field('What I check every time', 'Work before it is due, what they are stuck on, what is coming that they should hear from me first.', 3)}${field('What I never let a 1:1 become', 'A status report, a one-way download, a skipped meeting.', 3)}</div>
<h3>Three goals per person, this quarter</h3>
${people(['Name', 'Goal 1', 'Goal 2', 'Goal 3', 'By when'], 5)}
<h3>The conversation plan</h3>
<div class="two">${field('Who, and what I noticed', 'The specific observation, with dates. Not a feeling about them.', 3)}${field('What I expect, by when', 'Clear is kind. The expectation and the date, said out loud.', 3)}</div>
<div class="two">${field('My opening sentence, word for word', '', 2)}${field('What they might need from me', 'The question you will ask, and the help you can actually give.', 2)}</div>
${field('What happened when I held it', 'Fill in after. One minute, for Friday: what you said, what they said, what you would say differently.', 3)}
</section>`);

/* section 3 */
H.push(`<section class="page">
${weekHead('03', 'Delegation and growth plan', 'Week 3 · Coaching and mentoring · due Sunday', 'From directing to developing: where each person wants to go, one stretch assignment toward it, the rung of the ladder they are on, and the decision you handed over this week.')}
${stdLine(['coach', 'empower'])}
<h3>The delegation ladder</h3>
<div class="ladder"><div><b>1 · Do as I say</b>I decide, they do.</div><div><b>2 · Check with me</b>They propose, I approve.</div><div><b>3 · Tell me, then act</b>They decide and inform me first.</div><div><b>4 · Act, then tell me</b>They decide and inform me after.</div><div><b>5 · Their call</b>They decide; I hear about it if it matters.</div></div>
<h3>Growth plan, one line per person</h3>
${people(['Name', 'Where they want to be in two years', 'One stretch assignment toward it', 'Rung today', 'Next rung', 'By when'], 5)}
<h3>The decision I handed over this week</h3>
<div class="two">${field('The decision, and to whom', 'The decision, not just the task.', 2)}${field('The one boundary I stated', 'The thing the decision has to respect, said once, up front.', 2)}</div>
${field('What happened when I did not take it back', 'For Friday. Include the moment you wanted to.', 3)}
<div class="two">${field('My coaching cadence', 'When you ask instead of tell: which meeting, how often, with the GROW questions to hand.', 3)}${field('Coach or correct: the case I decided', 'The pattern, which one it needed, and why.', 3)}</div>
</section>`);

/* section 4 */
H.push(`<section class="page">
${weekHead('04', 'Performance practice', 'Week 4 · Performance management and developing talent · due before the capstone', 'How you run the cycle, how you give feedback, and how you handle a concern from the first conversation to the written step, with the people you call along the way.')}
${stdLine(['coach', 'issues'])}
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
${field('The performance conversation I rehearsed, then held', 'Honest about the cycle, specific about what would change the answer, a growth move that starts now.', 3)}
</section>`);

/* integrated management model */
H.push(`<section class="page">
${weekHead('', 'Integrated Management Model', 'Capstone deliverable · one page', 'How the four weeks connect for you. Synthesis, not attendance: one habit per job, in your words, and the sentence at the center that holds them together.')}
<div class="model">
<div class="q"><span class="eyebrow">Job 1 · Get the work done, through your team</span><b>Plan it, say it, check it, fix it</b><span class="small">My habit, and the week it comes from:</span>${lines(5)}</div>
<div class="q"><span class="eyebrow">Job 2 · Take care of your people</span><b>Listen and help, grow them, thank them, trust them</b><span class="small">My habit, and the week it comes from:</span>${lines(5)}</div>
<div class="q"><span class="eyebrow">Job 3 · Make things better</span><b>Explain the why, describe where we are going, let people try, look back</b><span class="small">My habit, and the week it comes from:</span>${lines(5)}</div>
<div class="q"><span class="eyebrow">Job 4 · Connect your team</span><b>Know the people, watch for what is coming, speak up for your team</b><span class="small">My habit, and the week it comes from:</span>${lines(5)}</div>
</div>
<div class="center"><span class="eyebrow">The sentence at the center</span><p class="small">How I manage, in one sentence. It should sound like the Philosophy from week 1, sharpened by three more weeks.</p>${lines(2)}</div>
</section>`);

/* team development plan */
H.push(`<section class="page">
${weekHead('', 'Team Development Plan', 'Capstone deliverable · 90 days', 'A plan for your actual team: names, goals, growth moves, and dates. Challenged by peers in the week 4 Learning Lab; presented at the capstone to peers and your business unit leader.')}
${stdLine(['coach', 'change'])}
${field('The team goal for the next 90 days', 'One outcome the whole team owns, and how you will know.', 2)}
${people(['Name', 'Their goal', 'Growth move', 'By Day 30', 'By Day 60', 'By Day 90'], 6)}
<div class="two">${field('What I need from my business unit leader', 'The ask, with the reason. Bring it to the capstone.', 3)}${field('What could get in the way', 'The risk you already see, and your first move on it.', 3)}</div>
<h3>The five-minute presentation</h3>
${check(['One minute: the sentence at the center of my Integrated Management Model', 'Two minutes: the team goal and one person\'s plan, by name', 'One minute: the habit I have kept since week 1, and what changed', 'One minute: what I need from my business unit leader'])}
</section>`);

/* capstone */
H.push(`<section class="page">
${weekHead('', 'The capstone, and after', 'Week 4 · hybrid · two hours', 'Before you present, take the pulse again and compare it with your prework answers. Then the six-month checkpoint.')}
<h3>The pulse, after</h3>
<div class="scale">
<span class="h">Standard</span><span class="h">Not yet</span><span class="h">Every week</span>
${pulseRows()}
</div>
<h3>Capstone checklist</h3>
${check(['Sections 1 to 4 finished', 'Integrated Management Model on one page', 'Team Development Plan with names and dates', 'Business unit leader invited, in the room or online', 'Five-minute presentation rehearsed in the Friday discussion'])}
<h3>After the cohort</h3>
${check(['Reread this Playbook at Day 30 and Day 90 of the plan', 'Take the Manager Effectiveness Assessment again at six months and compare the score', 'Keep the Manager Portal open: templates, policy links, and who to call'])}
<div class="sig"><div>Manager</div><div>Business unit leader</div><div>Date</div></div>
<p class="small" style="margin-top:.6in">Vanderbilt University · People, Culture and Belonging · Futures Learning Hub. The Manager Playbook is the manager's own document. Deliverables are recorded in Oracle Learning; the Playbook itself is not collected.</p>
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
