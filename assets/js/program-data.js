/* =====================================================================
   Manager Voyage program data.
   One object, no framework. Every item carries:
     id         stable key used for progress and Oracle matching
     oracleCode the Oracle Learning catalog reference (where known)
     oracleUrl  a pasted Oracle Learning deep link (optional)
     oracleItemId  the Oracle Learning item number; with oracleItemType
                (ORA_COURSE or ORA_CLASS) the link is built from
                MV_CONFIG.oracleRedirect, so this is the field to fill in
                when FLH gets the numbers (see assets/js/oracle.js)
   Source: Manager Voyage Executive Brief v2, September 2026.
   No em or en dashes anywhere in this file.
   ===================================================================== */
window.MV_PROGRAM = {
  version: '2026-09-16f',
  programName: 'Manager Voyage',
  states: {
    TN: { name: 'Tennessee', campus: 'Nashville campus' },
    NY: { name: 'New York',  campus: 'New York location' },
    FL: { name: 'Florida',   campus: 'Florida location' },
    CA: { name: 'California', campus: 'California location' }
  },
  windowDays: 60,

  /* -------- Component 01: compliance (auto-assigned by state) -------- */
  compliance: [
    { id: 'R-001', oracleCode: 'R-001', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300003105384903&learningItemType=ORA_CLASS', mins: 45, state: 'NY', audience: 'All Staff', type: 'Legal', deadlineDays: 30, cadence: 'Annual',
      title: 'Harassment Prevention for Employees (New York City and State)',
      why: 'New York State requires every employee to complete interactive harassment prevention training each year.',
      desc: 'What harassment and retaliation look like at work, how to report a concern, and the protections New York law gives you.' },
    { id: 'R-002', oracleCode: 'R-002', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300003105384857&learningItemType=ORA_CLASS', mins: 60, state: 'NY', audience: 'Manager', type: 'Legal', deadlineDays: 30, cadence: 'Annual',
      title: 'Harassment Prevention for Supervisors (New York City and State)',
      why: 'Supervisors in New York carry a separate legal duty to recognize, respond to, and report harassment.',
      desc: 'Your obligations when you see or hear about harassment, how to respond without retaliating, and when to escalate.' },
    { id: 'R-003', oracleCode: 'R-003', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300003116653386&learningItemType=ORA_CLASS', mins: 30, note: 'Applies only at New York retail sites with 10 or more retail employees.', state: 'NY', audience: 'All Staff', type: 'Legal', deadlineDays: 30, cadence: 'Annual or biennial',
      title: 'New York Retail Worker Safety Act',
      why: 'New York requires workplace violence prevention training for staff in covered retail settings.',
      desc: 'Recognizing risk, de-escalation basics, emergency procedures, and how to report an incident.' },
    { id: 'R-004', oracleCode: 'R-004', oracleUrl: null, oracleItemId: null, mins: 30, note: 'Applies only to supervisors of New York retail staff.', state: 'NY', audience: 'Manager', type: 'Legal', deadlineDays: 30, cadence: 'Annual or biennial',
      title: 'New York Retail Worker Safety Act: Supervisors',
      why: 'Supervisors must maintain the workplace violence prevention plan and respond to incidents.',
      desc: 'The written prevention plan, your role in an incident, documentation, and follow-up with affected staff.' },
    { id: 'R-005', oracleCode: 'R-005', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300003116653139', mins: 60, state: 'CA', audience: 'All Staff', type: 'Legal', deadlineDays: 183, cadence: 'Biennial',
      title: 'CA Sexual Harassment Prevention: Employees (SB 1343)',
      why: 'California SB 1343 requires one hour of harassment prevention training for every employee within six months of hire.',
      desc: 'Harassment, discrimination, and abusive conduct under California law, plus how and where to report.' },
    { id: 'R-006', oracleCode: 'R-006', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300003116653184', mins: 120, state: 'CA', audience: 'Manager', type: 'Legal', deadlineDays: 183, cadence: 'Biennial',
      title: 'CA Sexual Harassment Prevention: Supervisors (SB 1343)',
      why: 'California requires two hours of supervisor training within six months of becoming a supervisor.',
      desc: 'A supervisor\'s duty to prevent and correct harassment, how to handle a complaint, and the cost of retaliation.' },
    { id: 'R-007', oracleCode: 'R-007', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300003116653279', mins: 30, note: 'Trains on Vanderbilt\'s actual workplace violence prevention plan.', state: 'CA', audience: 'All Staff', type: 'Legal', deadlineDays: 0, cadence: 'Annual',
      title: 'CA Workplace Violence Prevention: Employees (SB 553)',
      why: 'California SB 553 requires workplace violence prevention training on hire and every year after.',
      desc: 'The workplace violence prevention plan, how to report a threat, and what happens after a report.' },
    { id: 'R-008', oracleCode: 'R-008', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300003116653230', mins: 45, state: 'CA', audience: 'Manager', type: 'Legal', deadlineDays: 0, cadence: 'Annual',
      title: 'CA Workplace Violence Prevention: Supervisors (SB 553)',
      why: 'Supervisors own the response and the incident log under the California plan.',
      desc: 'Responding to a threat, keeping the violent incident log, and protecting staff who report.' },
    { id: 'R-009', oracleCode: 'R-009', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300001864004385', mins: 30, note: 'Triggers only for Florida lodging operations staff.', state: 'FL', audience: 'All Staff', type: 'Legal', deadlineDays: 60, cadence: 'Annual',
      title: 'FL Human Trafficking Awareness: Lodging Staff',
      why: 'Florida requires annual human trafficking awareness training for staff in lodging settings.',
      desc: 'Signs of trafficking, what to do if you suspect it, and who to call.' },
    { id: 'R-010', oracleCode: 'R-010', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002076110784', mins: 30, note: 'Triggers only for supervisors of Florida lodging staff.', state: 'FL', audience: 'Manager', type: 'Legal', deadlineDays: 60, cadence: 'Annual',
      title: 'FL Human Trafficking Awareness: Supervisors',
      why: 'Supervisors must make sure reports are handled and staff are trained.',
      desc: 'Your responsibilities when a report comes in, and keeping the team current on training.' },
    { id: 'R-011', oracleCode: 'R-011', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002866689067&learningItemType=ORA_CLASS', mins: 45, state: 'FL', audience: 'All Staff', type: 'Advisory', deadlineDays: 60, cadence: 'Annual',
      title: 'FL Harassment Prevention: Employees',
      why: 'Vanderbilt policy: every Florida staff member completes harassment prevention each year.',
      desc: 'Vanderbilt\'s standard for respectful conduct, how to raise a concern, and the protection against retaliation.' },
    { id: 'R-012', oracleCode: 'R-012', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002866689067&learningItemType=ORA_CLASS', mins: 45, state: 'FL', audience: 'Manager', type: 'Advisory', deadlineDays: 60, cadence: 'Annual',
      title: 'FL Harassment Prevention: Supervisors',
      why: 'Vanderbilt policy: supervisors carry the duty to respond and escalate.',
      desc: 'Recognizing a concern, responding well in the moment, and getting it to Equal Opportunity and Access.' },
    { id: 'R-013', oracleCode: 'R-013', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002874700727&learningItemType=ORA_CLASS', mins: 45, state: 'TN', audience: 'All Staff', type: 'Advisory', deadlineDays: 60, cadence: 'Annual',
      title: 'Eliminating Discrimination and Harassment in the Workplace',
      why: 'Vanderbilt policy: every Nashville staff member completes harassment prevention each year.',
      desc: 'Vanderbilt\'s standard for respectful conduct, how to raise a concern, and the protection against retaliation.' },
    { id: 'R-014', oracleCode: 'R-014', oracleUrl: null, oracleItemId: null, mins: 45, state: 'TN', audience: 'Manager', type: 'Advisory', deadlineDays: 60, cadence: 'Annual',
      title: 'Harassment Prevention (Manager Essentials)',
      why: 'Vanderbilt policy: supervisors carry the duty to respond and escalate.',
      desc: 'Recognizing a concern, responding well in the moment, and getting it to Equal Opportunity and Access.' },
    { id: 'R-017', oracleCode: 'R-017', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300001966018198', mins: 30, state: 'ALL', audience: 'All Staff', type: 'Advisory', deadlineDays: 30, cadence: 'Annual',
      title: 'Foundational Cybersecurity Training',
      why: 'Vanderbilt policy: annual security awareness for everyone with a university account.',
      desc: 'Phishing, passwords and multifactor, handling sensitive data, and reporting a suspected incident to VUIT.' },
    { id: 'R-018', oracleCode: 'R-018', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300003068232998&learningItemType=ORA_CLASS', mins: 60, note: 'Triggered by access to protected health information, not by state.', state: 'ALL', audience: 'All Staff', type: 'Legal', deadlineDays: 30, cadence: 'Annual',
      title: 'VU HIPAA Privacy and Security Training 2026',
      why: 'Federal law requires privacy and security training for anyone who may handle protected health information.',
      desc: 'What protected health information is, the minimum necessary rule, and how to report a possible breach.' },
    { id: 'R-019', oracleCode: 'R-019', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300003137115317&learningItemType=ORA_CLASS', mins: 35, state: 'ALL', audience: 'All Staff', type: 'Legal', deadlineDays: 30, cadence: 'Annual',
      title: 'Addressing Harassment and Discrimination at Vanderbilt',
      why: 'Title IX and federal law: staff must know their reporting duties for sex-based discrimination and harassment.',
      desc: 'Your role as a responsible employee, what must be reported and to whom, and the resources available to students and staff.' },
    { id: 'R-021', oracleCode: 'R-021', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002865670836&learningItemType=ORA_CLASS', mins: 20, state: 'ALL', audience: 'All Staff', type: 'Legal', deadlineDays: 30, cadence: 'Annual',
      title: 'Clery Act',
      why: 'Federal law: campus security authorities must report crimes so the university can warn the community.',
      desc: 'Who counts as a campus security authority, which incidents must be reported, and how to report them.' },
    { id: 'R-020', oracleCode: 'R-020', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300003116653432&learningItemType=ORA_CLASS', mins: 45, state: 'ALL', audience: 'Manager', type: 'Advisory', deadlineDays: 60, cadence: 'Biennial',
      title: 'Guidelines for Reasonable Accommodations in the Workplace',
      why: 'Managers run the first step of the interactive process and must get it right.',
      desc: 'Recognizing an accommodation request, the interactive process, your role versus EOA\'s role, and timelines.' }
  ],

  /* -------- Component 02: Manager Responsibilities Course -------- */
  mrc: {
    id: 'MRC', oracleCode: 'MRC', oracleUrl: null,
    title: 'Manager Responsibilities Course',
    summary: 'Compliance tells you what the law requires. This course tells you what Vanderbilt requires: the Foundation course on the web, then supporting micro modules in Oracle Learning on the systems you approve in, the people obligations you now carry, the processes that run the role, and the Vanderbilt mission and ecosystem.',
    foundation: {
      id: 'MRC-F', oracleCode: 'MRC-F', oracleUrl: null, oracleItemId: null, oracleItemType: 'ORA_COURSE', localUrl: '../foundation/', minutes: 35, phase: 1,
      title: 'Foundation: You Are a Manager Now',
      why: 'About thirty-five minutes on the web, taken first. What changed when you became a manager, five ideas that hold up, what Vanderbilt will ask you to do this year, who handles what, Yukl\'s four categories of manager behavior with the six behaviors Vanderbilt looks for, and your assessment. Thirteen activities, narrated, with a quick check at the end.',
      segments: [
        { n: 1, title: 'What changed, and what a manager is', format: 'Sort activity plus video', desc: 'The one change that makes you a manager, three things that are new, what a manager is not, and who helps you at Vanderbilt.' },
        { n: 2, title: 'Five ideas every good manager relies on', format: 'Tabs plus a moment to apply each', desc: 'Setting priorities, clear expectations, psychological safety, purpose, and the people work: what each is, why to adopt it, what it looks like in practice, and the value it brings.' },
        { n: 3, title: 'Your first year, and who handles what', format: 'Tap-to-open map, simulator, decisions', desc: 'The manager tasks of year one by how often they come up, then five situations: handle it, ask your HCM, route it, or report it.' },
        { n: 4, title: 'Yukl\'s four categories of manager behavior', format: 'Five videos, habit cards, your call', desc: 'Task-oriented, relations-oriented, change-oriented, external: get the work done, take care of your people, make things better, connect your team. One page each, then four situations.' },
        { n: 5, title: 'Your assessment and next seven days', format: 'Review, quick check, plan', desc: 'Your Manager Effectiveness Assessment results, a five-question check, and one habit to practice this week.' }
      ]
    },
    /* The micro modules, most 15 minutes or less, as listed in Oracle Learning.
       Four tracks: Systems, People, Processes, and Vanderbilt & Nashville.
       Performance management, goals, and one-on-ones live inside
       one Oracle class (Performance Management Foundations for Managers), so
       they are one linked module here, not three separate ones.
       Paste each remaining Oracle deep link into oracleUrl when FLH has it. */
    tracks: [
      { id: 'T1', title: 'Systems', phase: 1, window: 'Days 1 to 30',
        why: 'Where the work gets approved. UKG for time, Oracle HCM for HR.',
        outcome: 'By Day 30 you can manage timekeeping, PTO, and schedules in UKG, handle exempt time off in Oracle, open a requisition, and approve an expense.',
        modules: [
          { id: 'MM-24', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002726332894&learningItemType=ORA_SPECIALIZATION', title: 'UKG for managers: timekeeping, PTO, and schedules', format: 'Training series', desc: 'Manager training in UKG: approving timecards and PTO, fixing a missed punch, and building schedules.' },
          { id: 'MM-25', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002743072230&learningItemType=ORA_COURSE', title: 'Oracle Cloud: managing exempt time off', format: 'eLearning', desc: 'Time off for your exempt staff, handled in Oracle Cloud: requests, approvals, and balances.' },
          { id: 'MM-01', oracleUrl: null, title: 'Oracle HCM for managers: team view and approvals', format: 'Walkthrough', desc: 'Reading your team view and handling the approvals that come to you in Oracle HCM, the HR system.' },
          { id: 'MM-03', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300001769180473&learningItemType=ORA_CLASS', title: 'Oracle Recruiting and Onboarding for Hiring Managers and HCM Specialists', format: 'eLearning', desc: 'The hiring workflow in Oracle: opening a requisition, moving candidates through, and onboarding your new hire.' },
          { id: 'MM-05', oracleUrl: null, title: 'Expense and procurement approvals', format: 'Walkthrough', desc: 'Approving an expense report, the procurement requests that route to you, and when to ask before you approve.' }
        ] },
      { id: 'T2', title: 'People', phase: 2, window: 'Days 31 to 60',
        why: 'The obligations that arrive with the title. A simulator for the highest-risk moments.',
        outcome: 'By Day 60 you can recognize a leave request, route an accommodation, document a concern, and onboard a new hire.',
        modules: [
          { id: 'MM-06', oracleUrl: null, title: 'Employee Relations grounding: when to call, what to document', format: 'Video', desc: 'The situations that go to Employee Relations, what to write down and when, and what stays out of your notes.' },
          { id: 'MM-07', oracleUrl: null, title: 'EOA: reporting obligations and manager duty', format: 'Video', desc: 'What you must report to Equal Opportunity and Access, when, and your duty as a supervisor once you know.' },
          { id: 'MM-08', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300003110215584&learningItemType=ORA_COURSE', mins: 35, title: 'FMLA', format: 'eLearning', desc: 'A leave request that does not sound like one. Recognizing it, your obligations as a manager, and the handoff to the leave office.' },
          { id: 'MM-09', oracleUrl: null, title: 'Reasonable accommodations: the interactive process', format: 'Video', desc: 'Recognizing an accommodation request, the interactive process, your role versus EOA\'s role, and timelines.' },
          { id: 'MM-10', oracleUrl: null, title: 'Performance concerns and progressive discipline simulator', format: 'Simulator', desc: 'A performance concern from first conversation to written step, practiced end to end with Employee Relations in the loop.' },
          { id: 'MM-11', oracleUrl: null, title: 'Onboarding a new hire', format: 'Walkthrough', desc: 'The first-week checklist, the systems a new hire needs, and the check-ins that make the first ninety days work.' }
        ] },
      { id: 'T3', title: 'Processes', phase: 2, window: 'Days 31 to 60',
        why: 'The operating rhythm of the role. The performance management foundations course, scenario studios, and decision trees.',
        outcome: 'By Day 60 you can run the performance cycle in the performance platform, set goals, hold effective one-on-ones, give feedback, and handle a compensation or flexible work question.',
        modules: [
          { id: 'MM-23', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002987329264&learningItemType=ORA_CLASS', mins: 45, title: 'Performance Management Foundations for Managers', format: 'eLearning', desc: 'One Oracle class, three short pieces: Vanderbilt performance management, leading with goals in the performance platform, and effective one-on-ones.' },
          { id: 'MM-14', oracleUrl: null, title: 'Giving feedback', format: 'Scenario studio', desc: 'Reinforcing and redirecting feedback, practiced on realistic moments, without softening the message away.' },
          { id: 'MM-15', oracleUrl: null, title: 'Compensation cycle and merit basics', format: 'Video', desc: 'How the compensation cycle runs, what merit can and cannot do, and how to talk about pay with your team.' },
          { id: 'MM-16', oracleUrl: null, title: 'Flexible work arrangements', format: 'Decision tree', desc: 'What you can approve, what needs PCB, and how to keep an arrangement fair to the whole team.' },
          { id: 'MM-17', oracleUrl: null, title: 'Offboarding and transitions', format: 'Decision tree', desc: 'The steps when someone leaves or transfers: access, knowledge handoff, and the last-week checklist.' }
        ] },
      { id: 'T4', title: 'Vanderbilt & Nashville', phase: 1, window: 'Days 1 to 30',
        why: 'The institution and the city. A manager who understands the mission can explain the work.',
        outcome: 'By Day 30 you can explain the mission, place your unit in the areas of focus, and tell the Nashville story to a new hire.',
        modules: [
          { id: 'MM-18', oracleUrl: null, title: 'The mission and the vision: the great university of the 21st century', format: 'Video', desc: 'The vision in one sentence, what it asks of the university, and what it asks of managers.' },
          { id: 'MM-19', oracleUrl: null, title: 'Areas of focus: institutional priorities and where your unit fits', format: 'Video', desc: 'The areas of focus, and how to connect your team\'s work to them out loud.' },
          { id: 'MM-20', oracleUrl: null, title: 'Our campuses: Nashville and the newer locations beyond Tennessee', format: 'Video', desc: 'The Nashville campus and the newer locations, and what managing across them means.' },
          { id: 'MM-21', oracleUrl: null, title: 'Nashville: the city as part of the job', format: 'Video', desc: 'The city your team lives and works in, and how Vanderbilt and Nashville shape each other.' },
          { id: 'MM-22', oracleUrl: null, title: 'How we work together: schools, central units, and business units', format: 'Video', desc: 'Who does what across schools, central units, and business units, and how work moves between them.' }
        ] }
    ]
  },

  /* -------- Component 03: cohort --------
     The four-week program as built in November 2026 at /cohort/: week one
     is a half day in the classroom, weeks two and three are virtual and
     capped at ninety minutes, week four is a two-hour capstone in the
     classroom. Each remote week has a Core module in Oracle Learning, a
     SparkWise Learning Lab, a simulation lab tailored to the manager's own
     team, and five minutes on the Manager Playbook. The site itself
     (cohort/program.js) is the source for timings and scenarios; this
     block is the program-level summary. */
  cohort: {
    id: 'COHORT', oracleCode: 'COHORT', oracleUrl: null, requestUrl: null, siteUrl: 'cohort/',
    title: 'Four-Week Cohort',
    summary: 'Where skill development happens. Fifty managers a quarter practice the Vanderbilt Manager Standard with their own teams: a half day in the classroom, two virtual weeks of under ninety minutes each, and a two-hour capstone where every manager presents a Manager Playbook and how they will lead. Every scenario is tailored to the team the manager runs, hourly or salaried, dining or IT.',
    prerequisite: 'You arrive having finished Manager Foundations. The cohort practices the four expectations with your team rather than reteaching them.',
    eligibility: 'Open to any manager who has completed the compliance courses and Manager Foundations. Oracle sends the invitation on completion.',
    rhythm: [
      { beat: 'Core module', when: 'Released Friday', mins: '30 to 35 min', desc: 'A short course in Oracle Learning sets the vocabulary for the week. Difficult conversations, coaching skills, performance management.' },
      { beat: 'Learning Lab', tool: 'SparkWise', when: 'Your own time', mins: '40 to 45 min', desc: 'A guided small-group lab with other managers in the cohort: conversation prep in week two, delegation and coach-or-correct in week three.' },
      { beat: 'Simulation lab', when: 'On your phone', mins: '10 min', desc: 'A live voice conversation with Sam, Dev, Priya, or Marcus, written for the manager\'s own team and scored on what was said and not said. A tap version for rooms without microphones.' },
      { beat: 'Playbook', when: 'Due Sunday', mins: '5 min', desc: 'One section a week, saved on the site and finished in the printed Playbook. Presented whole at the capstone.' }
    ],
    playbookNote: 'The Manager Playbook is the through-line: started in the classroom, one section drafted each week, and the whole thing presented in week four.',
    weeks: [
      { n: 0, title: 'Before week one', when: 'About twenty minutes, on your own', outcome: 'Everyone arrives from the same place.',
        core: null, lab: null, sim: null,
        playbook: { title: 'Set your team, and the first sentence', desc: 'The team profile on the cohort site (area, hourly or salaried, size), the four-question confidence pulse, and one sentence: what your team can expect from you.' } },
      { n: 1, title: 'What it means to manage', when: 'In the classroom, half a day', expectation: '03 · Make things better',
        live: { title: 'In the classroom, three hours', desc: 'The mission, your Manager Voyage on a timeline, the standard sorted from your own week, how to lead in your area, and the hard conversation out loud: in pairs, then live with Sam.' },
        core: null,
        lab: { title: 'In the room: timeline, sort, and lead activities', desc: 'Interactive on each manager\'s phone: a timeline from the work you were hired for to year one; a week of your own work sorted into the four expectations; which expectation your team needs most, and the habit that serves it.' },
        sim: { title: 'The hard conversation, with Sam', desc: 'Sam missed the work twice this month and nobody said so. Three lines, said in private, then the question that fixes it. Pairs first, then live.' },
        playbook: { title: 'Section 1: Manager Philosophy', desc: 'The mission line, seven timeline lines, what your team can expect from you, what you say when bad news lands, and your 90-day intent.' } },
      { n: 2, title: 'Goals, 1:1s, and difficult conversations', when: 'Virtual, under ninety minutes', expectation: '01 · Get the work done, through your team',
        core: { title: 'How to Manage Difficult Conversations', by: 'LinkedIn Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300001635326767', mins: 30 },
        lab: { title: 'Conversation prep, with peers', desc: 'Bring the one you have been putting off; leave with it framed in three lines.' },
        sim: { title: 'The 1:1 that turns difficult, with Dev', desc: 'Dev has missed two dates and opens as if nothing is wrong. Keep the 1:1 theirs, then say it.' },
        playbook: { title: 'Section 2: 1:1 framework and conversation plan', desc: 'Cadence and agenda, three goals per person this quarter, the opening sentence of the conversation you are holding.' } },
      { n: 3, title: 'Coaching and mentoring', when: 'Virtual, under ninety minutes', expectation: '02 · Take care of your people',
        core: { title: 'Coaching Skills for Leaders and Managers', by: 'LinkedIn Learning, Sara Canaday', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002857610240&learningItemType=ORA_COURSE', mins: 35 },
        lab: { title: 'Delegation lab, and coach or correct', desc: 'What you will hand off this month, to whom, at which rung of the ladder, with what boundary.' },
        sim: { title: 'Coach, then hand it over, with Priya', desc: 'Priya wants to grow and expects you to tell her how. Ask first. Then hand her a real decision with one boundary and a date.' },
        playbook: { title: 'Section 3: Delegation and growth plan', desc: 'One line per person: where they want to be, one stretch assignment, their rung and the next one.' } },
      { n: 4, title: 'Performance, talent, and your Playbook', when: 'In the classroom, two hours', expectation: '04 · Connect your team to the rest of Vanderbilt',
        live: { title: 'The capstone, in the classroom, two hours', desc: 'The standard read back against three weeks, the performance conversation with Marcus, and five minutes each to present the Playbook and how you will manage, challenged by peers and heard by your business unit leader.' },
        core: { title: 'Performance Management Foundations for Managers', by: 'Vanderbilt, in Oracle Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002987329264&learningItemType=ORA_CLASS', mins: 30 },
        lab: { title: 'In the room: recap and presentations', desc: 'Peers challenge one goal, one move, one date. The pulse is taken a second time beside the week-one answers.' },
        sim: { title: 'The performance conversation, with Marcus', desc: 'Marcus expects a promotion you cannot give this cycle. Honest about the answer, specific about what would change it, a growth move that starts now.' },
        playbook: { title: 'Section 4: Performance practice, and the whole Playbook', desc: 'How you run the cycle, your feedback approach, the Integrated Management Model, and the 90-day Team Development Plan.' } }
    ],
    /* Go deeper: after the program, for the manager who wants more on a week's topic.
       Inside Vanderbilt is Oracle Learning (LinkedIn Learning titles; url null means to add). */
    deeper: {
      intro: 'After the capstone, for the week you want more of. Nothing here is required; each item names the week it deepens.',
      inside: [
        { week: 1, title: 'Building Team Trust as a Manager', by: 'LinkedIn Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002942090959', note: 'Trust as something a manager builds on purpose, week by week.' },
        { week: 2, title: 'A Manager\'s Guide to Conducting Effective One-on-One Meetings', by: 'LinkedIn Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002857334221', note: 'The cadence, the agenda that belongs to the team member, and what a manager checks in the meeting.' },
        { week: 2, title: 'How to Have Productive One-on-One Meetings', by: 'LinkedIn Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002856581889', note: 'The shorter companion on running the meeting itself.' },
        { week: 2, title: 'Setting Team and Employee Goals Using SMART Methodology', by: 'LinkedIn Learning, Mike Figliuolo', url: null, note: 'Goals that are specific enough to check in a 1:1.' },
        { week: 3, title: 'Delegating Tasks', by: 'LinkedIn Learning, Dorie Clark', url: null, note: 'Handing over the decision and not just the task, and the boundary you state when you do.' },
        { week: 4, title: 'Performance Management: Conducting Performance Reviews', by: 'LinkedIn Learning, Todd Dewett', url: null, note: 'Preparing, the conversation itself, and the follow-through.' },
        { week: 4, title: 'Managing Employee Performance Problems', by: 'LinkedIn Learning, Todd Dewett', url: null, note: 'When a talk did not fix it.' }
      ],
      outside: [
        { week: 1, title: 'Psychological safety, from the researcher who named it', by: 'Amy Edmondson, TEDxHGSE', url: 'https://www.youtube.com/watch?v=LhoLuui9gX8', note: 'Why the best teams report more mistakes.' },
        { week: 2, title: 'Manager Tools Basics', by: 'Manager Tools, Horstman and Auzenne', url: 'https://www.manager-tools.com/manager-tools-basics', note: 'The core casts on one-on-ones and feedback.' },
        { week: 2, title: 'Feedback in three parts: situation, behavior, impact', by: 'Center for Creative Leadership', url: 'https://www.youtube.com/watch?v=-oRKr5xA9N0', note: 'The simplest feedback structure there is.' },
        { week: 3, title: 'Coaching Real Leaders', by: 'Harvard Business Review, Muriel Wilkins', url: 'https://hbr.org/podcasts/coaching-real-leaders', note: 'Real coaching sessions with leaders working through the problems you have.' },
        { week: 3, title: 'Manager guides: one-on-ones, feedback, coaching with GROW', by: 'Google re:Work', url: 'https://rework.withgoogle.com/intl/en/subjects/managers', note: 'Free, practical guides a large company built for its own managers.' },
        { week: 4, title: 'Radical Candor', by: 'Kim Scott and Amy Sandler', url: 'https://www.radicalcandor.com/podcast/', note: 'Caring personally while challenging directly, applied to real situations.' },
        { week: 4, title: 'The First 90 Days', by: 'Michael D. Watkins, Harvard Business Review Press', url: null, note: 'The transition playbook, for you and for the person you just promoted.' }
      ]
    },
    deliverables: [
      { title: 'Manager Playbook', desc: 'Your written personal operating system: philosophy, 1:1 framework, delegation and growth plan, performance practice. One section a week.' },
      { title: 'Integrated Management Model', desc: 'A one-page model of how the four weeks connect for you. Synthesis, not attendance.' },
      { title: 'Team Development Plan', desc: 'A 90-day plan for your actual team: names, goals, growth moves. Challenged by peers in week 4 and presented in the same hour to the business unit leader.' }
    ],
    tools: [
      { name: 'Learning Lab, in SparkWise', key: 'sparkwise', desc: 'Guided small-group peer labs in the two remote weeks, 40 to 45 minutes, on the week\'s topic.' },
      { name: 'Simulation labs', key: 'sim', desc: 'Live voice conversations with Sam, Dev, Priya, and Marcus, tailored to the manager\'s own team and scored on what was said. A tap version for rooms without microphones.' },
      { name: 'The Manager Playbook', key: 'playbook', desc: 'The template you build one section a week and present at the capstone.' },
      { name: 'AI Chat Agents', key: 'agents', desc: 'FLH-built agents, any hour, grounded in Vanderbilt policy and the Manager Standard.' }
    ]
  },

  /* -------- Component 04: Manager Portal -------- */
  portal: {
    id: 'PORTAL', url: 'https://www.vanderbilt.edu/pcb/futures-learning-hub/manager-resources/',
    title: 'Manager Portal',
    summary: 'One hub with every template, framework, policy link, and contact from the course and the cohort: open from Day 1, never taken away, kept current by PCB.',
    /* Beyond the portal: outside resources a manager should actually use.
       Every item names its source; specific episodes and videos are the ones
       already vetted for the foundation course's Keep Learning page, and new
       entries link only to canonical, long-stable pages. */
    beyond: {
      intro: 'Vetted outside resources, curated by the Futures Learning Hub. Each card names its source. All are free unless noted.',
      groups: [
        { title: 'Podcasts', items: [
          { title: 'Manager Tools Basics', src: 'Manager Tools · Horstman and Auzenne', url: 'https://www.manager-tools.com/manager-tools-basics', why: 'The core casts: one-on-ones, feedback, coaching, delegation. Start with the one-on-ones episodes.' },
          { title: 'HBR IdeaCast', src: 'Harvard Business Review', url: 'https://hbr.org/podcasts/ideacast', why: 'A weekly interview with a leading thinker on management and work.' },
          { title: 'Coaching Real Leaders', src: 'Harvard Business Review · Muriel Wilkins', url: 'https://hbr.org/podcasts/coaching-real-leaders', why: 'Real, anonymous coaching sessions with leaders working through the problems you have.' },
          { title: 'WorkLife with Adam Grant', src: 'TED', url: 'https://www.ted.com/podcasts/worklife', why: 'An organizational psychologist on psychological safety, feedback, and motivation.' },
          { title: 'Radical Candor', src: 'Kim Scott and Amy Sandler', url: 'https://www.radicalcandor.com/podcast/', why: 'Caring personally while challenging directly, applied to real workplace situations.' }
        ] },
        { title: 'Videos', items: [
          { title: 'Feedback in three parts: situation, behavior, impact', src: 'Center for Creative Leadership', url: 'https://www.youtube.com/watch?v=-oRKr5xA9N0', why: 'The simplest feedback structure there is, in a few minutes.' },
          { title: 'The big rocks method, in two minutes', src: 'FranklinCovey', url: 'https://www.youtube.com/watch?v=j6m9WnNdpSw', why: 'The jar, the rocks, and the sand: the priorities model from the foundation course.' },
          { title: 'Psychological safety, from the researcher who named it', src: 'Amy Edmondson · TEDxHGSE', url: 'https://www.youtube.com/watch?v=LhoLuui9gX8', why: 'Why the best teams report more mistakes.' },
          { title: 'Why good leaders make you feel safe', src: 'Simon Sinek · TED', url: 'https://www.youtube.com/watch?v=2Ss78LfY3nE', why: 'The circle of safety, in one story.' },
          { title: 'Managing your boss', src: 'Harvard ManageMentor', url: 'https://www.youtube.com/watch?v=qLFAHMHWtIA', why: 'Your manager is the first person your team needs you connected to.' },
          { title: 'Delegation and priorities: the urgent and important grid', src: 'LDP Series', url: 'https://www.youtube.com/watch?v=dRhb0-CFBbk', why: 'What to do yourself, what to delegate, what to drop.' }
        ] },
        { title: 'Guides and sites', items: [
          { title: 'Manager guides: one-on-ones, feedback, coaching with GROW', src: 'Google re:Work', url: 'https://rework.withgoogle.com/intl/en/subjects/managers', why: 'Free, practical guides a large company built for its own new managers.' },
          { title: 'Ask a Manager', src: 'Alison Green', url: 'https://www.askamanager.org/', why: 'Two decades of plain-spoken answers to real workplace questions, searchable by topic.' },
          { title: 'First Round Review', src: 'First Round Capital', url: 'https://review.firstround.com/', why: 'Long-form, practitioner-tested essays on management craft.' },
          { title: 'Lara Hogan on management', src: 'Lara Hogan, author of Resilient Management', url: 'https://larahogan.me/blog/', why: 'Short, concrete posts for new managers: first one-on-ones, feedback, delegation.' },
          { title: 'MIT Sloan Management Review', src: 'Massachusetts Institute of Technology', url: 'https://sloanreview.mit.edu/', why: 'Research-backed articles on leading teams and organizations.' }
        ] },
        { title: 'Books', items: [
          { title: 'The Making of a Manager', src: 'Julie Zhuo · Portfolio, 2019', why: 'The first-time manager book: what to do when everyone looks to you.' },
          { title: 'High Output Management', src: 'Andrew S. Grove · Vintage', why: 'The classic: a manager\'s output is the output of their team.' },
          { title: 'The First 90 Days', src: 'Michael D. Watkins · Harvard Business Review Press', why: 'The transition playbook for your first three months in the role.' },
          { title: 'Crucial Conversations', src: 'Grenny, Patterson, McMillan, Switzler, and Gregory · McGraw Hill', why: 'Tools for talking when the stakes are high and opinions differ.' }
        ] }
      ]
    }
  },

  /* Who to call. `key` names the link in MV_CONFIG.contacts; `sameDay`
     marks the routes that cannot wait. Routing language to be confirmed by PCB. */
  contacts: [
    { role: 'Your HCM', key: 'hcm',
      desc: 'Embedded in most business units. Positions, recruitment and hiring; payroll and timecards; assignments; the first step of leave management; costing; student and faculty hiring and assignments; document records and reporting.',
      when: 'The same day a question comes up, before you act on your own. When you are unsure, start here.',
      how: 'Email, a call, or a walk down the hall. Give the facts and what you need by when.' },
    { role: 'Your Engagement Consultant (EC)', key: 'engagementConsultants',
      desc: 'Your go-to in PCB for the bigger people questions in your business unit: engagement, culture, team dynamics, and a hard conversation you want to plan.',
      when: 'When an issue is more than one transaction: a performance pattern, a change to the team, a team dynamic, a retention worry. Same-day questions go to your HCM.',
      how: 'Email or a meeting request. Your unit\'s EC is listed on the PCB site. Say what you have tried so far.' },
    { role: 'Employee Relations Consultant (ERC)', key: 'er',
      desc: 'Workplace concerns, investigations, performance and conduct cases, and progressive discipline.',
      when: 'Before any formal step on a performance or conduct concern, and when a complaint about a coworker or a manager reaches you.',
      how: 'Through your HCM, or contact Employee Relations directly. Bring dates, what was said, and what you have done so far.' },
    { role: 'Equal Opportunity and Access (EOA)', key: 'eoa', sameDay: true,
      desc: 'Reports of discrimination, harassment, and retaliation, and requests for a reasonable accommodation.',
      when: 'Report the same day you see it or hear about it. You report; you do not investigate.',
      how: 'File a report with EOA or call them. Then tell your HCM you did.' },
    { role: 'Title IX Office', key: 'titleIX', sameDay: true,
      desc: 'Sexual harassment, sexual assault, dating and domestic violence, and stalking involving anyone in the Vanderbilt community.',
      when: 'Report the same day you learn of it. Supervisors are required to report; you do not investigate or promise confidentiality.',
      how: 'File a report with the Title IX Office or call them. Then tell your HCM you did.' },
    { role: 'Leave and Workers\' Compensation', key: 'leave', sameDay: true,
      desc: 'Time off for health and family, including FMLA, and injuries at work: eligibility, paperwork, dates, and the claim.',
      when: 'Contact them the same day someone mentions leave, a health or family situation, or gets hurt at work. Never ask for a diagnosis.',
      how: 'FMLA and leave requests go through Origami. Report a workplace injury the same day, then tell your HCM.' },
    { role: 'The Hotline', key: 'hotline',
      desc: 'Vanderbilt\'s confidential reporting line for concerns about misconduct, fraud, policy violations, or safety, for you or for a team member who would rather not go through a manager.',
      when: 'When someone wants to raise a concern confidentially or anonymously, or when you are not sure a concern fits any other route. Reports of harassment, discrimination, or leave still go to EOA, Title IX, or Leave the same day.',
      how: 'By phone or online, any hour. Tell your team it exists; you do not need to know who used it.' },
    { role: 'Compliance', key: 'compliance',
      desc: 'Policy questions and required training.',
      when: 'When you are unsure whether a policy applies, or a compliance course is overdue.',
      how: 'Contact the Office of Compliance, or ask your HCM which policy applies.' }
  ]
};
