#!/usr/bin/env node
/* Prints overview/index.html to overview/Manager-Voyage-Program-Overview.pdf with every
   detail panel expanded, Letter landscape, one slide per page. Run from the repo root:
     node scripts/build-overview-pdf.js   (serves the repo itself on a local port) */
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
(async () => {
  const { chromium } = require('playwright');
  const srv = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } const ext = path.extname(f); res.setHeader('Content-Type', { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' }[ext] || 'application/octet-stream'); res.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1056, height: 816 } }); /* the print page, 11 by 8.5 inches, so the paginator measures at print width */
  await p.goto(`http://127.0.0.1:${port}/overview/index.html`, { waitUntil: 'load' });
  await p.evaluate(() => { document.querySelectorAll('details').forEach(d => d.open = true); document.querySelectorAll('.slide').forEach(s => { s.classList.add('on'); s.removeAttribute('inert'); s.removeAttribute('aria-hidden'); }); });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  await p.evaluate(() => { if (window.MV_UNFIT) window.MV_UNFIT(); });
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.join(ROOT, 'overview', 'Manager-Voyage-Program-Overview.pdf'), format: 'Letter', landscape: true, printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await b.close(); srv.close();
  console.log('overview/Manager-Voyage-Program-Overview.pdf written');
})().catch(e => { console.error(e); process.exit(1); });
