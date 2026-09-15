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
  version: '2026-09-15e',
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
      title: 'NY Sexual Harassment Prevention: Employees',
      why: 'New York State requires every employee to complete interactive harassment prevention training each year.',
      desc: 'What harassment and retaliation look like at work, how to report a concern, and the protections New York law gives you.' },
    { id: 'R-002', oracleCode: 'R-002', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300003075234491&learningItemType=ORA_CLASS', mins: 60, state: 'NY', audience: 'Manager', type: 'Legal', deadlineDays: 30, cadence: 'Annual',
      title: 'NY Sexual Harassment Prevention: Supervisors',
      why: 'Supervisors in New York carry a separate legal duty to recognize, respond to, and report harassment.',
      desc: 'Your obligations when you see or hear about harassment, how to respond without retaliating, and when to escalate.' },
    { id: 'R-003', oracleCode: 'R-003', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300003105384706', mins: 30, note: 'Applies only at New York retail sites with 10 or more retail employees.', state: 'NY', audience: 'All Staff', type: 'Legal', deadlineDays: 30, cadence: 'Annual or biennial',
      title: 'NY Retail Worker Safety Act: Employees',
      why: 'New York requires workplace violence prevention training for staff in covered retail settings.',
      desc: 'Recognizing risk, de-escalation basics, emergency procedures, and how to report an incident.' },
    { id: 'R-004', oracleCode: 'R-004', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300003105384706', mins: 30, note: 'Applies only to supervisors of New York retail staff.', state: 'NY', audience: 'Manager', type: 'Legal', deadlineDays: 30, cadence: 'Annual or biennial',
      title: 'NY Retail Worker Safety Act: Supervisors',
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
    { id: 'R-013', oracleCode: 'R-013', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002866689067&learningItemType=ORA_CLASS', mins: 45, state: 'TN', audience: 'All Staff', type: 'Advisory', deadlineDays: 60, cadence: 'Annual',
      title: 'TN Harassment Prevention: Employees',
      why: 'Vanderbilt policy: every Nashville staff member completes harassment prevention each year.',
      desc: 'Vanderbilt\'s standard for respectful conduct, how to raise a concern, and the protection against retaliation.' },
    { id: 'R-014', oracleCode: 'R-014', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002866689067&learningItemType=ORA_CLASS', mins: 45, state: 'TN', audience: 'Manager', type: 'Advisory', deadlineDays: 60, cadence: 'Annual',
      title: 'TN Harassment Prevention: Supervisors',
      why: 'Vanderbilt policy: supervisors carry the duty to respond and escalate.',
      desc: 'Recognizing a concern, responding well in the moment, and getting it to Equal Opportunity and Access.' },
    { id: 'R-015', oracleCode: 'R-015', oracleUrl: null, oracleItemId: null, mins: 20, state: 'ALL', audience: 'All Staff', type: 'Advisory', deadlineDays: 30, cadence: 'Annual',
      title: 'Code of Conduct: Vanderbilt',
      why: 'Every staff member affirms the Code of Conduct each year.',
      desc: 'The commitments every Vanderbilt employee makes: integrity, respect, stewardship, and how to raise a concern.' },
    { id: 'R-016', oracleCode: 'R-016', oracleUrl: null, oracleItemId: null, mins: 20, state: 'ALL', audience: 'Manager', type: 'Advisory', deadlineDays: 30, cadence: 'Annual',
      title: 'Code of Conduct: Managers',
      why: 'Managers model the Code and are accountable for it on their teams.',
      desc: 'Conflicts of interest, gifts, records, fair treatment, and what to do when a team member raises a concern.' },
    { id: 'R-017', oracleCode: 'R-017', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300001966018198', mins: 30, state: 'ALL', audience: 'All Staff', type: 'Advisory', deadlineDays: 30, cadence: 'Annual',
      title: 'Cybersecurity Awareness',
      why: 'Vanderbilt policy: annual security awareness for everyone with a university account.',
      desc: 'Phishing, passwords and multifactor, handling sensitive data, and reporting a suspected incident to VUIT.' },
    { id: 'R-018', oracleCode: 'R-018', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300001863994802', mins: 60, note: 'Triggered by access to protected health information, not by state.', state: 'ALL', audience: 'All Staff', type: 'Legal', deadlineDays: 30, cadence: 'Annual',
      title: 'HIPAA Privacy and Security',
      why: 'Federal law requires privacy and security training for anyone who may handle protected health information.',
      desc: 'What protected health information is, the minimum necessary rule, and how to report a possible breach.' },
    { id: 'R-019', oracleCode: 'R-019', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300003032113101&learningItemType=ORA_CLASS', mins: 35, state: 'ALL', audience: 'All Staff', type: 'Legal', deadlineDays: 30, cadence: 'Annual',
      title: 'Title IX, Clery, and VAWA',
      why: 'Federal law: staff must know their reporting duties for sex-based discrimination and campus crime.',
      desc: 'Your role as a responsible employee, what must be reported and to whom, and the resources available to students and staff.' },
    { id: 'R-020', oracleCode: 'R-020', oracleUrl: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300003116653418', mins: 45, state: 'ALL', audience: 'Manager', type: 'Advisory', deadlineDays: 60, cadence: 'Biennial',
      title: 'Reasonable Accommodations and Disability Awareness',
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
      why: 'About thirty-five minutes on the web, taken first. What changed when you became a manager, five ideas that hold up, what Vanderbilt will ask you to do this year, who handles what, the four jobs of a manager, and your assessment. Thirteen activities, narrated, with a quick check at the end.',
      segments: [
        { n: 1, title: 'What changed, and what a manager is', format: 'Sort activity plus video', desc: 'The one change that makes you a manager, three things that are new, what a manager is not, and who helps you at Vanderbilt.' },
        { n: 2, title: 'Five ideas every good manager relies on', format: 'Tabs plus a moment to apply each', desc: 'Setting priorities, clear expectations, psychological safety, purpose, and the people work: what each is, why to adopt it, what it looks like in practice, and the value it brings.' },
        { n: 3, title: 'Your first year, and who handles what', format: 'Tap-to-open map, simulator, decisions', desc: 'The manager tasks of year one by how often they come up, then five situations: handle it, ask your HCM, route it, or report it.' },
        { n: 4, title: 'The four jobs of a manager', format: 'Five videos, habit cards, your call', desc: 'Get the work done, take care of your people, make things better, connect your team. One page each, then four situations.' },
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
     The four-week program as mapped in September 2026: prework, then four
     weeks in one rhythm (Core module, Learning Lab in SparkWise, Scenario
     Studio in Yoodli, a virtual Manager Voyage discussion) grounded in the
     Manager Playbook, with a hybrid kickoff and capstone. Core modules with
     a url are LinkedIn Learning courses already in Oracle; the rest are
     titles to add. Learning Lab titles are framed by topic until SparkWise
     confirms them. Tool links come from MV_CONFIG.cohortLinks. */
  cohort: {
    id: 'COHORT', oracleCode: 'COHORT', oracleUrl: null, requestUrl: null,
    title: 'Four-Week Cohort',
    summary: 'Where skill development happens. One hundred managers a quarter, in the same weekly rhythm: a Core module opens the topic, a Learning Lab works it with peers, a Scenario Studio rehearses the conversation, and a virtual Manager Voyage discussion closes the week around your Manager Playbook. A hybrid kickoff opens the four weeks and a hybrid capstone closes them.',
    prerequisite: 'You arrive having finished the Foundation course. The cohort builds on its four jobs, its habits, and its people rather than reteaching them.',
    eligibility: 'Open to any manager who has completed the compliance courses and Manager Foundations. Oracle sends the invitation on completion.',
    rhythm: [
      { beat: 'Core module', when: 'By Monday', mins: '45 to 60 min', desc: 'A LinkedIn Learning course in Oracle Learning sets the topic and the vocabulary. Released at the close of the previous Friday, so it is prework for the week it serves.' },
      { beat: 'Learning Lab', tool: 'SparkWise', when: 'Tuesday or Wednesday', mins: '45 min, live', desc: 'A facilitated small-group peer lab on the same topic, working a live case from someone\'s real team.' },
      { beat: 'Scenario Studio', tool: 'Yoodli', when: 'Thursday', mins: '15 min', desc: 'The week\'s conversation, rehearsed with an AI counterpart grounded in Vanderbilt policy. From week 2.' },
      { beat: 'Manager Voyage discussion', when: 'Friday', mins: '30 min, virtual; 60 in weeks 1 and 4', desc: 'FLH-facilitated. What happened when you tried it, what your Playbook section says now, what you commit to next week.' }
    ],
    playbookNote: 'The Manager Playbook is the through-line: one section drafted each week and due by Sunday, then the whole thing presented at the capstone.',
    weeks: [
      { n: 0, title: 'Prework', when: 'The week before the kickoff', outcome: 'Everyone arrives from the same place. About ninety minutes on your own time, so the kickoff hour is spent on identity and norms, not on a course.',
        core: [
          { title: 'New Manager Foundations', by: 'LinkedIn Learning, Sara Canaday', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002857233710', note: 'The identity shift, the first conversations with a team, and the habits that separate managers who settle in from those who stay stuck.' },
          { title: 'Building Team Trust as a Manager', by: 'LinkedIn Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002942090959', optional: true, note: 'For the psychological safety half of week 1.' }
        ],
        playbook: { title: 'The first sentence of your Philosophy', desc: 'One sentence: what your team can expect from you. Written before the kickoff and read aloud there.' },
        extra: { title: 'The pulse, and the calendar', desc: 'Three questions on how confident you feel in the four conversations the cohort rehearses, asked again at the capstone. Then accept the calendar holds for all four weeks.' } },
      { n: 1, title: 'What it means to manage', outcome: 'Establishes the why before the how. By Friday you can say, in one sentence, what your team can expect from you.',
        live: { title: 'Kickoff, one hour, hybrid', when: 'Monday, in the room or online, location TBD', desc: 'The cohort meets. Management identity in one story from a Vanderbilt manager a year in, cohort norms, the Playbook introduced, and your Philosophy sentence read aloud and sharpened.' },
        lab: { title: 'Psychological safety: make the truth cheap to tell', desc: 'Live case: a team member brought bad news late, and the manager\'s first reaction decided whether it would happen again. Name the one reaction on your own team you would change.' },
        studio: null,
        discussion: { mins: 60, items: ['Debrief the kickoff and the Learning Lab: what surprised you.', 'Read your Philosophy sentence; a peer answers what your team would notice by Friday if it were true.', 'Commit: one thing you will say to your team on Monday.'] },
        playbook: { title: 'Section 1: Manager Philosophy', desc: 'One page: the three things your team can expect from you, what you say when bad news lands, and your intent for the next 90 days.' } },
      { n: 2, title: 'Goal setting, 1:1s, and difficult conversations', outcome: 'Builds daily operating discipline. By Friday you have a 1:1 cadence on the calendar, three goals per person drafted, and one hard conversation held.',
        core: [
          { title: 'A Manager\'s Guide to Conducting Effective One-on-One Meetings', by: 'LinkedIn Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002857334221', note: 'The cadence, the agenda that belongs to the team member, and what a manager checks in the meeting.' },
          { title: 'How to Manage Difficult Conversations', by: 'LinkedIn Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300001635326767', note: 'The second half of the hour.' },
          { title: 'Setting Team and Employee Goals Using SMART Methodology', by: 'LinkedIn Learning, Mike Figliuolo', url: null, optional: true, note: 'For the goal-setting piece.' }
        ],
        lab: { title: 'Conversation prep: the hard conversation you are holding', desc: 'Bring one real conversation you have been putting off. Peers help frame it in three lines: what you noticed, what you expect, what you need by when. Then three goals for one person, tested for clear-is-kind.' },
        studio: { title: 'The 1:1 that turns into a difficult conversation', desc: 'Dev has missed two deadlines and opens the 1:1 as if nothing is wrong. Say the observation, the expectation, and the date, and ask what he needs. Scored on specificity, hedging, and whether the date is said out loud.' },
        discussion: { mins: 30, items: ['The conversation you held this week, in one minute, and what you would say differently.', 'Three 1:1 frameworks on screen; steal one thing from a peer\'s.', 'Commit: the 1:1 cadence goes on the calendar before Monday.'] },
        playbook: { title: 'Section 2: 1:1 framework and conversation plan', desc: 'Your 1:1 cadence and agenda, what you check in the meeting, three goals per person for this quarter, and the opening sentence of the conversation you rehearsed.' } },
      { n: 3, title: 'Coaching and mentoring', outcome: 'Shifts you from directing to developing. By Friday you have handed over one real decision and held one coaching conversation that was mostly questions.',
        core: [
          { title: 'Coaching Skills for Leaders and Managers', by: 'LinkedIn Learning, Sara Canaday', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002857610240&learningItemType=ORA_COURSE', note: 'Asking instead of telling, the coaching conversation, and when to coach versus correct.' },
          { title: 'Delegating Tasks', by: 'LinkedIn Learning, Dorie Clark', url: null, note: 'Handing over the decision and not just the task, and the boundary you state when you do.' }
        ],
        lab: { title: 'Delegation lab and coach-or-correct lab', desc: 'Two cases in one session: what you will hand off this month, to whom, at which rung of the ladder, with what boundary; then a real performance pattern and whether it needs coaching or correcting.' },
        studio: { title: 'A coaching conversation, then a handoff', desc: 'Priya wants to grow into a lead role and expects you to tell her how. Practice GROW, then hand her the decision about the intake process with one boundary and a check-in date.' },
        discussion: { mins: 30, items: ['The decision you delegated this week and what happened when you did not take it back.', 'One coach-or-correct case from the lab, decided together.', 'Commit: the stretch assignment you will offer one person next week.'] },
        playbook: { title: 'Section 3: Delegation and growth plan', desc: 'For each person: where they want to be in two years, one stretch assignment toward it, their rung on the delegation ladder and the next one, and your coaching cadence.' } },
      { n: 4, title: 'Performance management and developing talent', outcome: 'Closes the loop from learning to leading. At the capstone you present a finished Playbook, a one-page Integrated Management Model, and a 90-day Team Development Plan.',
        core: [
          { title: 'Performance Management Foundations for Managers', by: 'Vanderbilt, in Oracle Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002987329264&learningItemType=ORA_CLASS', note: 'The Vanderbilt process the week sits on top of. Take it first if you have not.' },
          { title: 'Performance Management: Conducting Performance Reviews', by: 'LinkedIn Learning, Todd Dewett', url: null, note: 'Preparing, the conversation itself, and the follow-through.' },
          { title: 'Managing Employee Performance Problems', by: 'LinkedIn Learning, Todd Dewett', url: null, optional: true, note: 'The second half of the hour.' }
        ],
        lab: { title: 'Team development accountability lab', desc: 'Present your draft 90-day Team Development Plan to four peers in five minutes; they challenge one goal, one growth move, and one date. The plan that survives is the one you present at the capstone.' },
        studio: { title: 'Two performance conversations', desc: 'Marcus, a strong performer, expects a promotion you cannot give this cycle: honest about the cycle, specific about what would change the answer, a growth move he can start now. Then redirecting feedback on a pattern a talk did not fix.' },
        discussion: { mins: 60, items: ['Rehearse the five-minute capstone presentation: the Integrated Management Model, then the Team Development Plan.', 'One piece of feedback each, using situation, behavior, impact.', 'The Playbook is declared finished, or the one section that is not gets a date.'] },
        live: { title: 'Capstone, two hours, hybrid', when: 'In the room or online', desc: 'Present the Integrated Management Model and the Team Development Plan to peers and your business unit leader. Deliverables are recorded in Oracle Learning against your job profile.' },
        playbook: { title: 'Section 4: Performance practice, and the whole Playbook finished', desc: 'How you run the performance cycle, your feedback approach, and how you handle a concern from first conversation to written step. Plus the two capstone deliverables.' } }
    ],
    deliverables: [
      { title: 'Manager Playbook', desc: 'Your written personal operating system: philosophy, 1:1 framework, delegation and growth plan, performance practice. One section a week.' },
      { title: 'Integrated Management Model', desc: 'A one-page model of how the four weeks connect for you. Synthesis, not attendance.' },
      { title: 'Team Development Plan', desc: 'A 90-day plan for your actual team: names, goals, growth moves. Challenged by peers in week 4, presented at the capstone.' }
    ],
    tools: [
      { name: 'Learning Lab, in SparkWise', key: 'sparkwise', desc: 'Facilitated small-group peer labs on a live case, 45 minutes, on the week\'s topic.' },
      { name: 'Scenario Studio, in Yoodli', key: 'yoodli', desc: 'AI conversation rehearsal with a simulated team member, with feedback on clarity, pace, and the rubric.' },
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
      desc: 'Embedded in most business units. Your first call for an immediate HR issue: pay, hiring, a performance concern, a policy question, a form you are not sure about.',
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
