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
  /* Link to the Manager Effectiveness Assessment (Qualtrics, REDCap, Oracle survey). Empty until PCB supplies it. */
  /* Contact links for Who to call (PCB directory pages). Empty until supplied. */
  contacts: { engagementConsultants: '', hcm: '', er: '', leave: '', eoa: '', titleIX: '', hotline: '', compliance: '' },
  /* The assessment results email, so the Foundation course can tell managers what to search their inbox for. Empty until PCB confirms. */
  assessmentEmailFrom: '',
  assessmentEmailSubject: '',
  // the full vision and areas of focus, linked from the mission page
  missionUrl: 'https://www.vanderbilt.edu/',
  assessmentUrl: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=OX9aur7js0q0UGf6gPrsrSj0YUFCM_9NtEckOrGZTO9UNUEzVllPWEkwVEtaUUlYRVVNSU9JRlgxVi4u',
  /* The branded assessment in the Foundation course pre-fills the Microsoft
     Form. Paste the question IDs from a "Get pre-filled link" URL here: the
     part after "&r" and before "=" for each question, in order. The scale
     labels must match the Form's choices exactly. Empty until supplied. */
  assessmentPrefill: { name: '', email: '', questions: ['', '', '', '', '', '', '', '', '', ''] },
  /* The Form's own choices, lowest to highest. The labels must match the Form exactly. */
  assessmentScale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  /* The ten statements, in the Form's order. 1 to 3 are confirmed from the Form;
     4 to 10 are placeholders until FLH supplies the wording. */
  assessmentStatements: [
    ['Priorities',       'I write down my team\u2019s top three priorities for the coming period, with a named owner for each, before the work starts.'],
    ['Expectations',     'I tell each person what they own, by when, and what a good result looks like, and I put it in writing.'],
    ['Checking work',    'I look at work while it is still in progress, well before the due date, so there is time to help.'],
    ['Fixing causes',    'When the same thing breaks twice, I find the cause rather than fixing the symptom faster.'],
    ['Supporting',       'When someone on my team is under pressure, I notice, move what I can, and follow up.'],
    ['Developing',       'I know where each person wants to go next, and I find work that stretches them toward it.'],
    ['Recognizing',      'I thank people for specific work, by name, the same week.'],
    ['Empowering',       'I hand over the decision, not just the task.'],
    ['Leading change',   'I explain the why behind a change, in my own words, before the announcement lands.'],
    ['Connecting',       'I know the people my team depends on in other offices by name, before I need them.']
  ],

  /* Profile and completion feed. A small proxy in front of Oracle HCM that
     returns the signed-in manager's record as JSON. See docs/ORACLE-INTEGRATION.md
     for the contract. Leave null to run without it. */
  profileEndpoint: null,              /* e.g. 'https://flh-proxy.vanderbilt.edu/voyage/me' */
  profilePollMinutes: 10,             /* re-check completions this often while the page is open */

  /* Manager Portal link. */
  /* Hiring in New York micro module: the Recruiting handout and the PCB HelpDesk. Null falls back to the Manager Portal. */
  nyBackgroundHandoutUrl: null,
  helpdeskUrl: null,
  portalUrl: 'https://www.vanderbilt.edu/pcb/futures-learning-hub/manager-resources/',

  /* Cohort seat request link. */
  cohortRequestUrl: null,
  /* Cohort tool links: the manager-facing SparkWise workspace, Yoodli, the Playbook template, the AI agents. Empty until supplied. */
  cohortLinks: { sparkwise: '', yoodli: '', playbook: '../cohort/Manager-Playbook.pdf', agents: '' },

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
