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
- `assets/js/config.js` holds the Oracle feed URL, Portal URL, cohort request
  URL, and contact. See `docs/ORACLE-INTEGRATION.md` for the feed contract.
- SCORM: `imsmanifest.xml` plus `assets/js/scorm.js`. Build the Oracle Learning
  package with `bash scripts/build-scorm.sh`.
- Preview without Oracle: `dashboard/?name=Alex%20Rivera&state=NY&start=2026-08-20`.

## Foundation course (`foundation/`)

"Foundation: What Vanderbilt Expects of a Manager," the 30-minute course every
manager completes before the micro modules unlock. It teaches management
itself, one shared way, on Yukl's taxonomy of leadership behavior (four
categories, fifteen behaviors), the same behaviors the Managerial Practices
Survey measures. Built on the Working Smarter book-mode engine with the hero
video montage, the Chancellor's charge, and six five-minute segments across
36 short pages, one idea or one activity each:

1. What management is: the Vice Chancellor welcome, the numbers, a narrated
   framework explainer with a tap-to-open map, fact or fiction
2. to 5. One segment per category (task, relations, change, external), each
   five pages: a narrated opener video and the idea; flip cards for the
   behaviors and the habit each replaces; "Habit or the Vanderbilt way", a
   tap-to-sort of eight statements; "Your call", one scenario with three
   responses and their consequences; "Name the behavior", six situations one
   at a time, beside a related public video (loaded only when tapped)
6. The Managerial Practices Survey, and a fifteen-behavior self-rating (one
   behavior at a time) that produces a first profile, the three behaviors to
   practice first, and the micro-module order

Then an eight-question knowledge check (six to pass), a summary, and next steps.
Each category marks itself done when its "Name the behavior" drill is finished.
The profile is saved to `localStorage` (`mv.foundation.v1`) and SCORM
suspend_data; the dashboard orders the tracks from it.

**Narration.** Every page is narrated. The book bar has **Listen** (this page)
and **Auto** (every page as it turns). Scripts live in
`foundation/narration-scripts.js`; the recordings (`assets/audio/foundation/
<section>-<n>.mp3`, one professional voice, generated with Runway from those
exact words) play when present, and the browser's speech synthesis reads the
same words when they are not (for example inside an LMS that blocks media).

**Videos.** Five custom narrated videos (`assets/video/foundation/`): the
40-second framework explainer and a 12-second opener for each category. Clips
are generated with Runway, narration is generated from `MV_VIDEO_NARR`, and
`scripts/build-media.py` concatenates, muxes, and makes posters. Signed Runway
URLs go in `.github/media-urls.json`; pushing that file to `main` runs
`.github/workflows/fetch-media.yml`, which downloads, builds, commits the media,
and mirrors to `gh-pages`. Until the media lands, each video slot shows a
"being produced" card. Public videos (YouTube, click to load, with an open-on-
YouTube fallback): Google's Project Oxygen (task), Simon Sinek on safety plus
Renninger on feedback and Pink on motivation (relations), Amy Edmondson on
psychological safety (change), Harvard on managing your boss (external).

- Source: Yukl, G. (2012), Academy of Management Perspectives, 26(4), 66 to 85.
- Preview: `foundation/?name=Alex%20Rivera&state=NY`
- SCORM: `bash scripts/build-foundation-scorm.sh` writes
  `manager-voyage-foundation-scorm.zip` (standalone SCORM 1.2, media included
  when built).
- Open items: the Vice Chancellor welcome video (placeholder card); confirm how
  the survey is administered and its due window (segment 6); confirm the
  YouTube video IDs still resolve (each slot has an open-on-YouTube link).
