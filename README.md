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
