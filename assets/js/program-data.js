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
  version: '2026-09-10',
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
    summary: 'Compliance tells you what the law requires. This course tells you what Vanderbilt requires: the systems you approve in, the people obligations you now carry, the processes you run, and the university and city you represent.',
    foundation: {
      id: 'MRC-F', oracleCode: 'MRC-F', oracleUrl: null, oracleItemId: null, oracleItemType: 'ORA_COURSE', localUrl: '../foundation/', minutes: 20, phase: 1,
      title: 'Foundation: You Are a Manager Now',
      why: 'About twenty minutes, taken first. What changed when you became a manager, five ideas that hold up, what Vanderbilt will ask you to do this year, the four jobs of a manager, and your Manager Effectiveness Assessment results, which set the order of your micro modules.',
      segments: [
        { n: 1, title: 'What changed, and what a manager is', format: 'Sort activity plus video', desc: 'The one change that makes you a manager, three things that are new, what a manager is not, and who helps you at Vanderbilt.' },
        { n: 2, title: 'Five ideas, and safe to speak up', format: 'Flip cards plus your call', desc: 'Setting priorities, clear expectations, psychological safety, purpose, and the people work: what each is, how you apply it, and the value it brings. Then three moments that build trust or break it.' },
        { n: 3, title: 'What Vanderbilt will ask you to do', format: 'Tap-to-open map plus decisions', desc: 'The manager tasks of year one, when each shows up, the micro module for it, and five situations: handle it, ask PCB, route it, or report it.' },
        { n: 4, title: 'The four jobs of a manager', format: 'Five videos, cards, your call', desc: 'Get the work done, take care of your people, make things better, connect your team. One page each, then four situations.' },
        { n: 5, title: 'Your assessment results', format: 'Results entry', desc: 'What the Manager Effectiveness Assessment you already took was asking, sorted by the four jobs; what the three bands mean; enter your band and lowest job to set your micro-module order.' }
      ]
    },
    tracks: [
      { id: 'T1', title: 'Systems', phase: 1, window: 'Days 1 to 30',
        why: 'Where the work gets approved. By Day 30 you can approve time, open a requisition, and run a check-in.',
        outcome: 'You can approve, hire, and find any record you need.',
        modules: [
          { id: 'M1.1', oracleUrl: null, title: 'Oracle HCM for Managers', format: 'Guided walkthrough', desc: 'Reading the team view, finding a direct report\'s record, what a manager can and cannot see.' },
          { id: 'M1.2', oracleUrl: null, title: 'Time and Attendance Approvals', format: 'Simulator', desc: 'Approving timecards, correcting errors, absence requests, and what happens to payroll when a deadline is missed.' },
          { id: 'M1.3', oracleUrl: null, title: 'Requisitions and Hiring', format: 'Walkthrough plus checklist', desc: 'Opening a requisition, the approval chain, Oracle Recruiting basics, what your HCM needs from you and when.' },
          { id: 'M1.4', oracleUrl: null, title: 'Culture Amp', format: 'Guided walkthrough', desc: 'Setting goals, running check-ins, where the performance cycle lives, and the annual calendar.' },
          { id: 'M1.5', oracleUrl: null, title: 'Expense and Procurement Approvals', format: 'Decision tree', desc: 'What you approve, spend thresholds, common rejections, and where policy lives.' }
        ] },
      { id: 'T4', title: 'Vanderbilt and Nashville', phase: 1, window: 'Days 1 to 30',
        why: 'The institution and the city. A manager who can explain the mission can explain the work.',
        outcome: 'You can explain how your team connects to the university\'s mission.',
        modules: [
          { id: 'M4.1', oracleUrl: null, title: 'The Mission and the Vision', format: 'Video plus reflection', desc: 'What the university exists to do, the Chancellor\'s vision for the great university of the 21st century, and how a staff team connects to it.' },
          { id: 'M4.2', oracleUrl: null, title: 'Areas of Focus', format: 'Interactive map', desc: 'The institution\'s current priorities and how your unit shows up in them.' },
          { id: 'M4.3', oracleUrl: null, title: 'Our Campuses', format: 'Interactive campus map', desc: 'The Nashville campus and its schools, plus the newer locations beyond Tennessee, and what changes when a team spans locations.' },
          { id: 'M4.4', oracleUrl: null, title: 'Nashville', format: 'Short video series', desc: 'The city as part of the job: neighborhoods, community partnerships, and how to help a new hire settle in.' },
          { id: 'M4.5', oracleUrl: null, title: 'How We Work Together', format: 'Systems map plus scenarios', desc: 'How decisions move across schools, central units, and business units, and where you plug in.' }
        ] },
      { id: 'T2', title: 'People', phase: 2, window: 'Days 31 to 60',
        why: 'The obligations that arrive with the title. Simulators for the high-risk moments.',
        outcome: 'You can handle a leave request, document a concern, and know when to call ER or EOA.',
        modules: [
          { id: 'M2.1', oracleUrl: null, title: 'Employee Relations Grounding', format: 'Scenario studio', desc: 'What ER does, the moments that must go to ER, and how to document a concern.' },
          { id: 'M2.2', oracleUrl: null, title: 'EOA and Reporting Obligations', format: 'Scenario studio', desc: 'What you must report, when, and to whom. Title IX and mandatory reporter status.' },
          { id: 'M2.3', oracleUrl: null, title: 'FMLA and Leave', format: 'Simulator', desc: 'Recognizing a leave request even when it is not phrased as one. What to say, what never to say, and the handoff to leave administration.' },
          { id: 'M2.4', oracleUrl: null, title: 'Reasonable Accommodations', format: 'Simulator', desc: 'The interactive process, your role versus EOA\'s role, and timelines.' },
          { id: 'M2.5', oracleUrl: null, title: 'Performance Concerns and Progressive Discipline', format: 'Simulator', desc: 'Early signals, informal to formal, and documentation standards.' },
          { id: 'M2.6', oracleUrl: null, title: 'Onboarding a New Hire', format: 'Checklist plus scenarios', desc: 'First-week checklist, system access, the 30-day check-in, and what a good first month looks like.' }
        ] },
      { id: 'T3', title: 'Processes', phase: 2, window: 'Days 31 to 60',
        why: 'The operating rhythm of the role. Scenario studios and decision trees.',
        outcome: 'You can set goals, run a 1:1, give feedback, and manage a transition.',
        modules: [
          { id: 'M3.1', oracleUrl: null, title: 'Setting Expectations and Goals', format: 'Practice exercise', desc: 'Role clarity, translating unit priorities into individual goals, and writing goals Culture Amp can hold.' },
          { id: 'M3.2', oracleUrl: null, title: 'Running 1:1s', format: 'Model 1:1 with prompts', desc: 'Cadence, agenda template, what a 1:1 is for and what it is not.' },
          { id: 'M3.3', oracleUrl: null, title: 'Giving Feedback', format: 'Scenario studio', desc: 'A simple feedback model, in-the-moment versus scheduled, and practicing the hard version.' },
          { id: 'M3.4', oracleUrl: null, title: 'Compensation Cycle and Merit Basics', format: 'Timeline plus FAQ', desc: 'How the cycle runs, what you influence, what you do not, and how to talk about pay.' },
          { id: 'M3.5', oracleUrl: null, title: 'Flexible Work Arrangements', format: 'Decision tree', desc: 'Policy, what you can approve, documenting agreements, and equity across the team.' },
          { id: 'M3.6', oracleUrl: null, title: 'Offboarding and Transitions', format: 'Checklist', desc: 'Resignations, internal moves, knowledge transfer, and system access removal.' }
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
