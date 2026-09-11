# Manager Voyage overview site

Single-page executive overview of Manager Voyage, Vanderbilt University's
structured management standard. Built from the Manager Voyage Executive
Brief (v2, September 2026) in the Futures Learning Hub visual identity.

- `index.html` is the whole site: inline CSS, no JavaScript, no build step.
- `assets/fonts/` carries the self-hosted brand fonts (Libre Caslon, Inter, Antonio).
- `assets/img/` carries the Vanderbilt lockups and the V mark.

Serve locally with `python3 -m http.server` and open `index.html`.
Built on the same page pattern as the Talent Marketplace program page (me5231979/TransferPortal-, `program.html`).
Verified in Chromium at 1440px and 390px wide: no horizontal scroll, no console errors.

Publishing: GitHub Pages serves the `gh-pages` branch. Every push to `main` runs `.github/workflows/pages.yml`, which mirrors main to gh-pages.
The site will be at https://me5231979.github.io/Manager-Voyage/

## Manager dashboard (`dashboard/`)

A personalized "My voyage" dashboard for managers, built on the same pattern
as the Voyage staff onboarding dashboard: a dark welcome with an identity card
filled from Oracle, then a cream working surface with the four program areas as
tiles, one panel at a time, course descriptions and Oracle deep links on every
row, and a rail with Up next, Milestones, and Who to call.

- Personalizes by work location (TN, NY, FL, CA): the compliance rows are the
  state's courses plus the all-location courses, supervisor versions included.
- Status per item: Verified in Oracle, Complete (self-reported), Opened, Not started.
- `assets/js/program-data.js` is the curriculum: 20 compliance courses (with
  Oracle Learn deep links from the Compliance Training Matrix), the foundation
  course, 22 micro modules across four tracks, the Portal, and the cohort.
- `assets/js/oracle.js` is the one place the site talks to Oracle (course links from item numbers, completion write-back); `assets/js/config.js` holds the Oracle feed URL, Portal URL, cohort request
  URL, and contact. See `docs/ORACLE-INTEGRATION.md` for the feed contract.
- SCORM: `imsmanifest.xml` plus `assets/js/scorm.js`. Build the Oracle Learning
  package with `bash scripts/build-scorm.sh`.
- Preview without Oracle: `dashboard/?name=Alex%20Rivera&state=NY&start=2026-08-20`.

## Foundation course (`foundation/`)

"You are a manager now," the first course in Manager
Foundations (after the manager compliance courses, before the micro modules).
About twenty minutes, nineteen pages, five topics. It opens with the
mission: the vision, how Vanderbilt operates, and what that asks of a manager. It assumes the learner
knows nothing about management and starts there. Copy is deliberately short:
each page is one idea, one activity.

1. Topic 1, what changed and what a manager is: the one change, three
   things that are new, what a manager is not, a sort activity (whose job is
   it now?), the definition, and who helps at Vanderbilt (80-second video)
2. Topic 2, five ideas by topic (setting priorities, clear expectations,
   psychological safety, purpose, the people work; sources in a footnote),
   one tab each with what it is, as a manager, the value, and one thing to
   start this week, and a moment to try it (three responses, consequences
   shown); the best response in all five is one activity
3. Topic 3, what Vanderbilt will ask you to do in year one (a tap-to-open
   map by cadence, each item naming its micro module), then your first calls:
   a situation simulator and five situations to decide (handle it, ask your
   HCM, the leave office, or EOA)
4. Topic 4, the four jobs of a manager (Yukl, in plain words): a video and
   flip cards per job, one page each, then four situations for your call
5. Topic 5, your assessment: review the results email from the Manager
   Effectiveness Assessment (or take it), and where the score should go over
   this course and the ones after; retaken six months later
6. A five-question check (4 of 5), the next seven days, the keep-learning
   page (ten Oracle Learning courses in order plus ten outside podcasts,
   videos, and a guide, from foundation/resources.js; the only place the
   course recommends learning, plus the printable guide), and the wrap-up

Eight tracked activities. Audio follows the learner's clicks: every page has
a Listen clip, and every tab, moment, situation, and map card has its own
short clip (narration-scripts.js keys like ideas/t1, safe/m1, yourcall/s1,
year/g1, welcome/j1). Opening one stops whatever was playing; tapping its
speaker, or the same tab again, stops it. Clicking into any activity stops
the page narration. Six custom training videos (basics plus the four jobs
and the framework).

Printable guide: `node scripts/build-guide.js` rebuilds foundation/guide.html
and foundation/Manager-Foundations-Course-1.pdf from the course itself
(index.html maps, app.js ideas, resources.js list and situations).
Re-run it after editing the course. The PDF is linked from the keep-learning
page and shipped in the SCORM package.

- Assessment: the Manager Effectiveness Assessment (14 items, out of 70) is completed before the course, results and feedback are emailed, and it is retaken six months after completion. The course asks the learner to review the email or take the assessment (link in assets/js/config.js, assessmentUrl). Open items:
  confirm the YouTube video IDs still resolve (each has an open-on-YouTube
  link).
