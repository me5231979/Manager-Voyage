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

"Foundation: what Vanderbilt expects of a manager," about fifteen minutes,
sixteen pages, completed before the micro modules unlock. It teaches
management itself, one shared way, on Yukl's taxonomy of leadership behavior
(four categories, fifteen behaviors), the same behaviors the Managerial
Practices Survey measures. Every page opens with a breadcrumb (where you are,
what you have, what is next) and every module page with two plain lines: what
you will learn, and what Vanderbilt asks you to do, followed by the Yukl
tie-in (category, behavior numbers of fifteen, objective, survey items).

1. Welcome, then a course and module overview (purpose, audience, objectives,
   completion, one card per module)
2. Module 1, why and the framework: the belief, the welcome from People,
   Culture and Belonging, the Chancellor's charge, then a 90-second captioned
   training video and a tap-to-open map of the four categories
3. Modules 2 to 5, one category each, two pages: an 80-second captioned
   training video (Yukl tie, each behavior with a Vanderbilt example, the
   habit versus the Vanderbilt way, the cue to act) beside flip cards; then
   two aligned practices, "Your call" (apply: one situation, three responses,
   consequences) and a three-item quick check (recognize), with an optional
   collapsed public video below
4. Module 6, the survey and a fifteen-behavior self-rating (one at a time)
   that produces a first profile, the three behaviors to practice first, and
   the micro-module order
5. A five-question knowledge check (one at a time, feedback after each, four
   to pass), the recap and next seven days, and the wrap-up

Progress: the map, four quick checks, the self-rating, the check, and the next
step (eight sections). Saved to `localStorage` (`mv.foundation.v1` for the
profile) and SCORM suspend_data; the dashboard orders the tracks from it.

**Narration.** Every page is narrated (Listen for this page, Auto for every
page). Scripts are in `foundation/narration-scripts.js`; recordings are
generated with Runway from those exact words and live in
`assets/audio/foundation/<section>-<n>.mp3`; browser speech reads the same
words if a file cannot load.

**Videos.** Five custom training videos with captions (`assets/video/
foundation/<name>.mp4` and `.vtt`), built by `scripts/build-media.py` from
Runway clips and narration listed in `.github/media-urls.json` (the `text`
fields feed the captions). Pushing that file to `main` runs
`.github/workflows/fetch-media.yml`, which downloads, builds, commits, and
mirrors to `gh-pages`. Until media lands, each video slot shows a "being
produced" card. No headcounts or unit counts appear in the course, so nothing
dates.

- Source: Yukl, G. (2012), Academy of Management Perspectives, 26(4), 66 to 85.
- Preview: `foundation/?name=Alex%20Rivera`
- SCORM: `bash scripts/build-foundation-scorm.sh` writes
  `manager-voyage-foundation-scorm.zip` (standalone SCORM 1.2, media included
  when built).
- Open items: confirm how the survey is administered and its due window;
  confirm the YouTube video IDs still resolve (each has an open-on-YouTube
  link).
