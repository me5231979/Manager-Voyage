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
  completionEndpoint: null,           /* a Power Automate "When an HTTP request is received" URL, or a proxy */
  completionMode: 'flow',             /* 'flow': post as text/plain with no CORS preflight, which Power Automate accepts. 'proxy': JSON with credentials. */

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
  /* The Form's own choices, lowest to highest. The labels must match the Form exactly. */
  assessmentScale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  /* Which statements make up each of the four categories (indexes into assessmentStatements). */
  assessmentCategories: [
    ['Get the work done',         [0, 1, 2]],
    ['Take care of your people',  [3, 4, 5]],
    ['Make things better',        [6, 7]],
    ['Connect your team',         [8, 9]]
  ],
  /* Feedback by category average, highest band first: [minimum average, label, line]. */
  assessmentBands: [
    [4.5, 'A strength',  'You do this consistently. Keep it, and notice who on your team could learn it from you.'],
    [3.5, 'Solid',       'You do this most weeks. One more deliberate rep a week makes it a habit.'],
    [2.5, 'Developing',  'You do this sometimes. Pick one specific moment this week and do it on purpose.'],
    [0,   'Start here',  'This is the category to work on first. The course gives you one move for it; make that your action this week.']
  ],
  /* The first move for each category, matching the four actions on Next steps. */
  assessmentMoves: [
    'Confirm with one person, out loud, what they own and by when.',
    'Thank one person for one specific thing, by name.',
    'Hold one ten-minute look-back after a piece of work.',
    'Have coffee with one person your team depends on.'
  ],
  /* The ten statements, in the Form's order, word for word. */
  assessmentStatements: [
    ['Priorities',     'I write down my team\u2019s top three priorities for the coming period, with a named owner for each, before the work starts.'],
    ['Expectations',   'I tell each person what they own, by when, and what a good result looks like, and I put it in writing.'],
    ['Checking work',  'I look at work while it is still in progress, well before the due date, so there is time to help.'],
    ['Supporting',     'When I see someone under pressure, I move a deadline or a task that same week and check back with them.'],
    ['Recognizing',    'I thank a person for a specific piece of work, by name, within the same week it happened.'],
    ['Empowering',     'I make a decision that changes how my team works, I ask for their view and let it shape what I decide.'],
    ['Leading change', 'When a change is coming, I explain the reason to my team in my own words before the official announcement reaches them.'],
    ['Looking back',   'After a large piece of work, I hold a short look-back with the team: what worked, what did not, what we change.'],
    ['Watching ahead', 'I watch what is coming from the rest of Vanderbilt, such as cycles, deadlines, and system changes, so my team hears it from me first.'],
    ['Representing',   'When a request from another office would overload my team, I show the hours, name the conflict, and offer two options rather than a flat yes or no.']
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
