#!/usr/bin/env node
/* Encrypt a SharePoint export of "Manager Voyage assessments" for the results page.

   Usage:
     node scripts/encrypt-assessments.js <export.csv> --passphrase "<phrase>" [--exclude a@vanderbilt.edu,b@vanderbilt.edu]

   Reads the CSV the list exports (Title, Email, Phase, TakenOn, Score, Max,
   GetTheWorkDone, TakeCareOfYourPeople, MakeThingsBetter, ConnectYourTeam,
   FirstMove, PriorScore, CompletedOn, QuizScore, RetakeInvitedOn, and
   Answers when the list has it), drops the excluded emails, normalizes dates
   and numbers, and writes results/data.enc.json: AES-256-GCM, key derived
   from the passphrase with PBKDF2-SHA256. The repository never holds the
   plain rows. The page at results/ asks for the passphrase and decrypts in
   the browser. No em or en dashes in this file. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const opt = (name) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : null; };
const passphrase = opt('passphrase');
const exclude = (opt('exclude') || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
if (!file || !passphrase) { console.error('usage: node scripts/encrypt-assessments.js <export.csv> --passphrase "<phrase>" [--exclude a@x.edu,b@x.edu]'); process.exit(1); }

/* a small CSV reader that handles quoted fields and the BOM Excel adds */
function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift().map((h) => h.trim());
  return rows.filter((r) => r.some((v) => v.trim() !== '')).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}
function isoDate(s) {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (m) return m[3] + '-' + m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0');
  const d = new Date(s); return isNaN(d) ? null : d.toISOString().slice(0, 10);
}
const num = (s) => (s === '' || s == null ? null : Number(s));

const raw = parseCsv(fs.readFileSync(file, 'utf8'));
const kept = raw.filter((r) => !exclude.includes((r.Email || '').toLowerCase()));
const records = kept.map((r) => {
  let answers = null;
  if (r.Answers) { try { answers = JSON.parse(r.Answers).map((a) => ({ n: Number(a.n), k: a.k, v: Number(a.v) })); } catch (e) { answers = null; } }
  return {
    name: r.Title, email: (r.Email || '').toLowerCase(), phase: (r.Phase || 'initial').toLowerCase(),
    takenOn: isoDate(r.TakenOn), score: num(r.Score), max: num(r.Max) || 50,
    jobs: [num(r.GetTheWorkDone), num(r.TakeCareOfYourPeople), num(r.MakeThingsBetter), num(r.ConnectYourTeam)],
    firstMove: r.FirstMove || '', priorScore: num(r.PriorScore), completedOn: isoDate(r.CompletedOn),
    quizScore: num(r.QuizScore), retakeInvitedOn: isoDate(r.RetakeInvitedOn), answers
  };
}).sort((a, b) => String(a.takenOn).localeCompare(String(b.takenOn)));

const payload = JSON.stringify({ exportedAt: new Date().toISOString().slice(0, 10), rows: records.length, excluded: raw.length - kept.length, records });
const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12), iter = 300000;
const key = crypto.pbkdf2Sync(passphrase, salt, iter, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final(), cipher.getAuthTag()]);
const out = { v: 1, kdf: 'PBKDF2-SHA256', iter, salt: salt.toString('base64'), iv: iv.toString('base64'), ct: ct.toString('base64') };
const dest = path.join(__dirname, '..', 'results', 'data.enc.json');
fs.writeFileSync(dest, JSON.stringify(out));
console.log('wrote ' + path.relative(process.cwd(), dest) + ': ' + records.length + ' rows kept, ' + (raw.length - kept.length) + ' excluded, ' + ct.length + ' bytes');
