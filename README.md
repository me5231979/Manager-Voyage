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
manager completes before the micro modules unlock. Built on the Working
Smarter book-mode engine (`assets/css/course.css`, `foundation/pager.js`) with
the hero video montage, the Chancellor's charge, and six five-minute segments:

1. Welcome (the unmanaged window, the four components, fact or fiction)
2. The Manager Standard (the gate, five domains, a sorting drill)
3. Your first 60 days (timeline, what your state adds, call the milestone)
4. What you now own (four cards, the "Is this now my call?" decision tree)
5. The people you will call (six offices, "Who do you call?" drill)
6. Self-assessment (twelve questions; outputs the order of the 22 micro modules)

Then an eight-question knowledge check (six to pass), a summary, and next steps.
Each segment marks itself done when its activity is finished. The self-assessment
order is saved to `localStorage` (`mv.foundation.v1`) and to SCORM suspend_data;
the dashboard reads it and orders the tracks the same way.

- Preview: `foundation/?name=Alex%20Rivera&state=NY`
- SCORM: `bash scripts/build-foundation-scorm.sh` writes
  `manager-voyage-foundation-scorm.zip` (standalone SCORM 1.2, reports complete
  when all eight sections are done).
- Open items: the Vice Chancellor welcome video (placeholder card), and FLH
  sign-off on the five domain names in segment 2.
