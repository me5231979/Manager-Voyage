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
  version: '2026-09-12',
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
    summary: 'Compliance tells you what the law requires. This course tells you what Vanderbilt requires: the Foundation course on the web, then eighteen micro modules in Oracle Learning on the systems you approve in, the people obligations you now carry, and the policies that keep your team safe.',
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
    /* The eighteen micro modules, as listed in Oracle Learning. Paste each Oracle deep link into oracleUrl when FLH has it. */
    tracks: [
      { id: 'T1', title: 'Systems', phase: 1, window: 'Days 1 to 30',
        why: 'The systems you approve in from your first week.',
        outcome: 'By Day 30 you can approve time, find your team in Oracle, open a hire, and assign learning.',
        modules: [
          { id: 'MM-13', oracleUrl: null, title: 'UKG: manager training for timecards, time off, and schedules', format: 'eLearning', desc: 'Approving timecards and time off, fixing a missed punch, and building schedules in UKG.' },
          { id: 'MM-14', oracleUrl: null, title: 'Oracle for Managers: my team and directory search', format: 'Video', desc: 'Reading your team view, finding a direct report, and searching the directory.' },
          { id: 'MM-15', oracleUrl: null, title: 'Oracle for Managers: my knowledge and service requests', format: 'Video', desc: 'Finding answers in Oracle knowledge and opening a service request when you need PCB.' },
          { id: 'MM-16', oracleUrl: null, title: 'Oracle for Managers: hiring', format: 'Video', desc: 'Opening a requisition, the approval chain, and what your HCM needs from you and when.' },
          { id: 'MM-17', oracleUrl: null, title: 'Oracle for Managers: assigning learning to your team', format: 'Video', desc: 'Assigning a course to a team member and tracking completions.' }
        ] },
      { id: 'T2', title: 'People', phase: 2, window: 'Days 31 to 60',
        why: 'The people obligations you carry as a manager.',
        outcome: 'By Day 60 you can recognize a leave request, route an accommodation, and report what must be reported.',
        modules: [
          { id: 'MM-09', oracleUrl: null, title: 'FMLA', format: 'Video', desc: 'Recognizing a leave request even when it is not phrased as one, what to say, and the handoff to the leave office through Origami.' },
          { id: 'MM-12', oracleUrl: null, title: 'Accommodations', format: 'Video', desc: 'The interactive process, your role versus EOA\'s role, and timelines.' },
          { id: 'MM-10', oracleUrl: null, title: 'Title IX', format: 'Video', desc: 'What you must report, when, and to whom. Your duties as a supervisor.' },
          { id: 'MM-11', oracleUrl: null, title: 'Responding to Discrimination and Harassment', format: 'Video', desc: 'What to do the same day you see it or hear about it. You report; you do not investigate.' },
          { id: 'MM-06', oracleUrl: null, title: 'Employee Impairment', format: 'Video', desc: 'Recognizing signs of impairment at work, what to do in the moment, and who to call.' },
          { id: 'MM-01', oracleUrl: null, title: 'Labor Relations', format: 'Video', desc: 'What a manager can and cannot say and do around organizing, and where to get help.' }
        ] },
      { id: 'T3', title: 'Policy and safety', phase: 2, window: 'Days 31 to 60',
        why: 'The policies that keep your team, and Vanderbilt, on the right side of the rules.',
        outcome: 'By Day 60 you can handle pay and hours questions, a workplace injury, an outside contractor, an emergency, and minors on campus.',
        modules: [
          { id: 'MM-02', oracleUrl: null, title: 'Wage and Hour', format: 'Video', desc: 'Exempt and non-exempt, overtime, breaks, and the timekeeping rules you are responsible for.' },
          { id: 'MM-03', oracleUrl: null, title: 'Workers\u2019 Compensation', format: 'Video', desc: 'What to do the day someone is hurt at work, and how the claim works.' },
          { id: 'MM-04', oracleUrl: null, title: 'Independent Contractors', format: 'Video', desc: 'Who counts as a contractor, who does not, and how to engage one correctly.' },
          { id: 'MM-05', oracleUrl: null, title: 'Emergency Preparedness, Fire, and Workplace Safety', format: 'Video', desc: 'Your role in an emergency, fire safety, and keeping the workplace safe.' },
          { id: 'MM-07', oracleUrl: null, title: 'Protection of Minors, Part 1', format: 'Video', desc: 'Vanderbilt\'s rules when minors are on campus or in your programs.' },
          { id: 'MM-08', oracleUrl: null, title: 'Protection of Minors, Part 2', format: 'Video', desc: 'Reporting duties, supervision standards, and program requirements.' }
        ] },
      { id: 'T4', title: 'Finish', phase: 2, window: 'Days 31 to 60',
        why: 'Close out the course.',
        outcome: 'Your completion is on your Oracle record, and FLH hears what worked.',
        modules: [
          { id: 'MM-18', oracleUrl: null, title: 'Request your certificate of completion, and share feedback', format: 'Manual', desc: 'Ask for your certificate and tell FLH what to improve.' }
        ] }
    ]
  },

  /* -------- Component 03: Manager Portal -------- */
  portal: {
    id: 'PORTAL', url: 'https://www.vanderbilt.edu/pcb/futures-learning-hub/manager-resources/',
    title: 'Manager Portal',
    summary: 'Every template, framework, policy link, and contact from the course and the cohort. Open from Day 1, never taken away, and it grows with each cohort cycle.',
    areas: [
      { title: 'Templates', desc: '1:1 agenda, goal-setting worksheet, feedback prep, onboarding checklist, offboarding checklist.' },
      { title: 'Frameworks', desc: 'The Manager Standard, the feedback model, the delegation ladder, the coach-or-correct decision guide.' },
      { title: 'Policy links', desc: 'Leave, accommodations, flexible work, compensation cycle, progressive discipline, Code of Conduct.' },
      { title: 'Who to call', desc: 'Your HCM, your Engagement Consultant, Employee Relations, Equal Opportunity and Access, Ombuds, Compliance.' }
    ]
  },

  /* -------- Component 04: cohort -------- */
  cohort: {
    id: 'COHORT', oracleCode: 'COHORT', oracleUrl: null, requestUrl: null,
    title: 'Four-Week Cohort',
    summary: 'Where skill development happens. One hundred managers a quarter. An in-person kickoff, four blended weeks with AI rehearsal and peer labs, and an in-person capstone where you present three deliverables to peers and your business unit leader.',
    eligibility: 'Open to any manager who has completed both required components. Oracle sends the invitation on completion.',
    weeks: [
      { n: 1, title: 'What It Means to Manage', desc: 'In-person kickoff at the Student Life Center (3 hours). Management identity and psychological safety. Yoodli: identity articulation. SparkWise: psych safety lab. Playbook: Manager Philosophy draft.', outcome: 'Establishes the why before the how.' },
      { n: 2, title: 'Goal Setting, 1:1s, and Difficult Conversations', desc: 'Core module: Difficult Conversations. Yoodli: 1:1 and difficult conversation scenarios. SparkWise: conversation prep lab. Playbook: 1:1 framework and conversation plan.', outcome: 'Builds daily operating discipline.' },
      { n: 3, title: 'Coaching and Mentoring', desc: 'Core module: Delegation Strategies. Yoodli: coaching and delegation. SparkWise: delegation lab and coach-or-correct lab. Playbook: Delegation and Growth Plan.', outcome: 'Shifts from directing to developing.' },
      { n: 4, title: 'Performance Management and Developing Talent', desc: 'Core module: Performance Management. Yoodli: performance and talent conversations. SparkWise: team development accountability lab. Playbook finalized. In-person capstone (2 hours).', outcome: 'Closes the loop: learning to leading.' }
    ],
    deliverables: [
      { title: 'Manager Playbook', desc: 'Your written personal operating system: philosophy, 1:1 framework, feedback approach, delegation plan, performance practice. Built one section per week.' },
      { title: 'Integrated Management Model', desc: 'A one-page model of how the four weeks connect for you. Synthesis, not attendance.' },
      { title: 'Team Development Plan', desc: 'A 90-day plan for your actual team: names, goals, growth moves.' }
    ],
    tools: [
      { name: 'Yoodli', desc: 'AI conversation rehearsal with a simulated employee, with feedback on clarity and tone.' },
      { name: 'SparkWise', desc: 'Facilitated small-group peer labs on a live case.' },
      { name: 'AI Chat Agents', desc: 'FLH-built agents, any hour, grounded in Vanderbilt policy and the Manager Standard.' }
    ]
  },

  contacts: [
    { role: 'HCM', desc: 'Embedded in most business units. Your first call for an immediate HR issue: pay, hiring, a performance concern, a policy question.' },
    { role: 'Engagement Consultant', desc: 'Your go-to in PCB for HR issues, concerns, and support: engagement, culture, and the bigger people questions for your business unit.' },
    { role: 'Employee Relations (ER)', desc: 'Workplace concerns, investigations, performance and conduct cases.' },
    { role: 'Equal Opportunity and Access (EOA)', desc: 'Discrimination and harassment reporting, Title IX, accommodations.' },
    { role: 'Ombuds', desc: 'Confidential, informal, impartial help thinking through a situation.' },
    { role: 'Compliance', desc: 'Policy questions and required training.' }
  ]
};
