/* =====================================================================
   Manager Voyage dashboard configuration.
   Everything that changes between environments lives here.
   Fill in the Oracle values when FLH provides them; nothing else changes.
   ===================================================================== */
window.MV_CONFIG = {
  /* Oracle Learning base, used to build a course link from an oracleCode
     when an item has no explicit oracleUrl. Leave null to disable. */
  oracleLearningBase: null,           /* e.g. 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/' */

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
