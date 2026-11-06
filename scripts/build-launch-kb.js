#!/usr/bin/env node
/* Writes launch/guide-kb.txt, the launch plan as plain text for Beacon, the guide on the launch page.
   Run from the repo root after the page changes: node scripts/build-launch-kb.js */
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
(async () => {
  const { chromium } = require('playwright');
  const srv = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } res.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await p.route(/cdn\.jsdelivr\.net/, r => r.abort());
  await p.goto(`http://127.0.0.1:${port}/launch/index.html`, { waitUntil: 'load' });
  const secs = await p.evaluate(() => [...document.querySelectorAll('section.pg')].map((sec, i) => {
    const h = sec.querySelector('h1'), eb = sec.querySelector('.eyebrow');
    const clone = sec.cloneNode(true); clone.querySelectorAll('.foot, script').forEach(n => n.remove());
    document.body.appendChild(clone); const t = clone.innerText.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim(); clone.remove();
    return { n: i + 1, title: h ? h.textContent.replace(/\s+/g, ' ').trim() : sec.id, eyebrow: eb ? eb.textContent.trim() : '', text: t };
  }));
  let txt = 'MANAGER VOYAGE LAUNCH PLAN (Vanderbilt University, People, Culture and Belonging, Futures Learning Hub). Draft for review, November 6, 2026. The plan, section by section, as published at https://manager-voyage.vercel.app/launch/ and in the PDF.\n\n';
  txt += 'Summary: Manager Voyage is one standard for every Vanderbilt manager in four expectations (get the work done through your team, take care of your people, make things better, connect your team to the rest of Vanderbilt), delivered in four components: compliance by location, Manager Foundations (the assessment, the seven-module course of about ninety minutes, the micro modules), the four-week cohort of twenty five managers a quarter, and the Manager Portal. The launch has five phases: Ready (November 6 to December 11, 2026), Pilot (January 6 to 29, 2027, twenty five managers), Cascade (February 3 to 27), Launch (Monday, March 2, 2027, with days 1 to 60 of the launch wave running to May 1), and Deliver and measure (from April; cohort 1 April 14 to May 5; ninety-day readout June 10). Every date moves with the March 2 launch date. Go, no go gates: December 11 (pilot) and January 29 (launch). The cascade: PCB leadership to senior leadership February 3; business unit leaders February 10; managers\' managers February 17; every manager March 2; HCMs and Engagement Consultants February 18; MyVU teaser February 24. Messages C1 to C6 are the cascade emails; M1 to M6 are the automated messages at Day 1, Day 7, Day 22, Day 60, cohort week 0 and plus three months. For the launch wave, Day 7 is March 9, Day 22 is March 24, Day 30 (legal compliance due) is April 1, Day 60 is May 1.\n\n';
  secs.forEach(sec => { if (!sec.text) return; txt += '=== Section ' + sec.n + ': ' + sec.title + (sec.eyebrow ? ' (' + sec.eyebrow + ')' : '') + ' ===\n' + sec.text + '\n\n'; });
  fs.writeFileSync(path.join(ROOT, 'launch', 'guide-kb.txt'), txt);
  console.log('launch/guide-kb.txt written:', secs.length, 'sections,', txt.length, 'chars');
  await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
