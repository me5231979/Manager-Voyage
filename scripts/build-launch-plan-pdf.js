#!/usr/bin/env node
/* Prints docs/launch-plan/index.html to docs/Manager-Voyage-Launch-Plan.pdf, Letter landscape,
   one page per section. Run from the repo root: node scripts/build-launch-plan-pdf.js
   Pass --png to also write one PNG per page into docs/launch-plan/preview/ for review. */
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
const PNG = process.argv.includes('--png');
(async () => {
  const { chromium } = require('playwright');
  const srv = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } const ext = path.extname(f); res.setHeader('Content-Type', { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' }[ext] || 'application/octet-stream'); res.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1056, height: 816 } });
  await p.goto(`http://127.0.0.1:${port}/docs/launch-plan/index.html`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  /* overflow check: any page whose content runs past its bottom edge is reported */
  const over = await p.evaluate(() => [...document.querySelectorAll('.pg')].map((pg, i) => { const r = pg.getBoundingClientRect(); let max = 0; pg.querySelectorAll('*').forEach(el => { if (el.closest('.foot')) return; const b = el.getBoundingClientRect(); if (b.height && b.bottom > max) max = b.bottom; }); return { page: i + 1, spill: Math.round(max - (r.bottom - 40)) }; }).filter(x => x.spill > 0));
  if (over.length) console.log('content past the footer line on pages:', over.map(o => o.page + ' (' + o.spill + 'px)').join(', ')); else console.log('every page fits');
  if (PNG) { const dir = path.join(ROOT, 'docs', 'launch-plan', 'preview'); fs.mkdirSync(dir, { recursive: true }); const pgs = await p.$$('.pg'); for (let i = 0; i < pgs.length; i++) await pgs[i].screenshot({ path: path.join(dir, 'page-' + String(i + 1).padStart(2, '0') + '.png') }); console.log(pgs.length + ' page previews written'); }
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.join(ROOT, 'docs', 'Manager-Voyage-Launch-Plan.pdf'), format: 'Letter', landscape: true, printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await b.close(); srv.close();
  console.log('docs/Manager-Voyage-Launch-Plan.pdf written');
})().catch(e => { console.error(e); process.exit(1); });
