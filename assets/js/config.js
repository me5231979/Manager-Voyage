/* =====================================================================
   Manager Voyage dashboard configuration.
   Everything that changes between environments lives here.
   Fill in the Oracle values when FLH provides them; nothing else changes.
   ===================================================================== */
window.MV_CONFIG = {
  /* Oracle Learning deep links, built from an item's learning item number.
     Every compliance link in the training matrix follows this pattern, so
     any item that carries oracleItemId (and optionally oracleItemType,
     ORA_COURSE or ORA_CLASS) links without a pasted URL. */
  oracleRedirect: {
    base: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect',
    idParam: 'learningItemId',
    typeParam: 'learningItemType',
    defaultType: 'ORA_COURSE'
  },

  /* Fallback: a base URL plus the item's oracleCode, for catalogs that
     expose a stable code-based link. Leave null to disable. */
  oracleLearningBase: null,

  /* Completion write-back when a course runs outside Oracle Learning
     (GitHub Pages behind single sign-on). POST JSON
     { id, at, score, max, passed, extra } to this URL with credentials.
     Inside Oracle Learning the SCORM API is used instead. Leave null to
     keep completions local and self-reported. */
  completionEndpoint: null,           /* e.g. 'https://flh-proxy.vanderbilt.edu/voyage/completions' */

  /* The Manager Effectiveness Assessment: taken before the Foundation course and
     again this many months after completing it. */
  surveyRetakeMonths: 6,

  /* Profile and completion feed. A small proxy in front of Oracle HCM that
     returns the signed-in manager's record as JSON. See docs/ORACLE-INTEGRATION.md
     for the contract. Leave null to run without it. */
  profileEndpoint: null,              /* e.g. 'https://flh-proxy.vanderbilt.edu/voyage/me' */
  profilePollMinutes: 10,             /* re-check completions this often while the page is open */

  /* Manager Portal link. */
  portalUrl: 'https://www.vanderbilt.edu/pcb/futures-learning-hub/manager-resources/',

  /* Cohort seat request link. */
  cohortRequestUrl: null,

  /* Contact shown in the footer. */
  contactEmail: null,

  /* Let the manager mark items complete by hand when no Oracle feed is
     configured. Marks are labeled as self-reported and stored locally
     (and in SCORM suspend_data inside Oracle). */
  allowSelfReport: true,

  /* Show the preview bar (name, state, start date) when nothing else
     identifies the manager. Set false in production. */
  previewMode: true
};
