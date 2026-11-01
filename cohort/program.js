/* =====================================================================
   MANAGER VOYAGE · THE FOUR-WEEK COHORT · program data
   One file holds the whole workshop: the profile a manager sets, the
   vocabulary of each work area, the four weeks with their timed segments,
   the Playbook sections, and the scenario bank the labs are built from.
   Every scenario is a template filled from the manager's profile, so a
   dining supervisor and an IT manager rehearse the same skill in their
   own world. SparkWise links are placeholders in `links` until supplied.
   The cohort builds on Manager Foundations: it practices the Vanderbilt
   Manager Standard, it does not reteach it.
   ===================================================================== */
window.MV_COHORT = {
  version: '2026.11.01.b',
  site: 'https://manager-voyage.vercel.app/cohort/',
  links: {
    foundations: '../foundation/',
    assessment: '../reassess/',
    playbook: 'Manager-Playbook.pdf',
    portal: 'https://www.vanderbilt.edu/pcb/futures-learning-hub/manager-resources/',
    /* SparkWise Learning Labs: paste the links here when they exist. Empty means a placeholder card. */
    sparkwise: { w1: '', w2: '', w3: '', w4: '' },
    /* Core modules in Oracle Learning, released the Friday before each week. */
    core: {
      w2: { title: 'How to Manage Difficult Conversations', by: 'LinkedIn Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300001630000000', mins: 30 },
      w3: { title: 'Coaching Skills for Leaders and Managers', by: 'LinkedIn Learning, Sara Canaday', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002857610240&learningItemType=ORA_COURSE', mins: 35 },
      w4: { title: 'Performance Management Foundations for Managers', by: 'Vanderbilt, in Oracle Learning', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002987329200&learningItemType=ORA_COURSE', mins: 30 }
    }
  },

  /* The Vanderbilt Manager Standard, the thread through all four weeks. */
  standard: [
    { n: '01', key: 'task', name: 'Get the work done, through your team', yukl: 'Task-oriented', habits: ['Plan it', 'Say it', 'Check it', 'Fix it'], week: 2 },
    { n: '02', key: 'relations', name: 'Take care of your people', yukl: 'Relations-oriented', habits: ['Listen and help', 'Grow them', 'Thank them', 'Trust them'], week: 3 },
    { n: '03', key: 'change', name: 'Make things better', yukl: 'Change-oriented', habits: ['Explain the why', 'Describe where we are going', 'Let people try', 'Look back'], week: 1 },
    { n: '04', key: 'external', name: 'Connect your team to the rest of Vanderbilt', yukl: 'External', habits: ['Know the people', 'Watch for what is coming', 'Speak up for your team'], week: 4 }
  ],

  /* The profile. Everything a manager answers once, then every scenario uses. */
  profile: {
    sizes: [1, 2, 3, 4, 5, 6, 8, 10, 12, 15],
    types: [
      { id: 'hourly', name: 'Hourly', desc: 'Timecards, schedules, shift coverage, overtime.' },
      { id: 'salaried', name: 'Salaried', desc: 'Deliverables, flexible work, workload.' },
      { id: 'mixed', name: 'Mixed', desc: 'Some of each. You get both kinds of conversation.' }
    ],
    states: [
      { id: 'tn', name: 'Tennessee only' },
      { id: 'multi', name: 'Someone sits in another state', note: 'Leave, pay, and hours rules can differ in New York, California, and Florida. Your HCM needs the location first.' }
    ]
  },

  /* The eight work areas. The words that make a scenario feel like the manager's own team. */
  areas: [
    { id: 'dining', name: 'Dining and food service', team: 'your dining team', role: 'line cook', role2: 'catering lead', place: 'the kitchen', asker: 'the Events office',
      work: 'the catering order for Friday’s donor lunch', work2: 'the new allergen labeling process', system: 'the new point-of-sale system', busy: 'move-in weekend',
      slip: 'the prep list was not done when service started, twice this month', win: 'the way you ran the line during the Chancellor’s dinner', hourlyDefault: 'hourly' },
    { id: 'it', name: 'IT and technology', team: 'your IT team', role: 'desktop support analyst', role2: 'systems administrator', place: 'the service desk', asker: 'the department chair',
      work: 'the patch window for the lab workstations', work2: 'the ticket triage rotation', system: 'the new ticketing system', busy: 'the start of term',
      slip: 'two change windows were missed this month and nobody said so until the tickets came in', win: 'the way you handled the outage on the first day of class', hourlyDefault: 'salaried' },
    { id: 'facilities', name: 'Facilities and grounds', team: 'your facilities crew', role: 'maintenance technician', role2: 'crew lead', place: 'the shop', asker: 'Housing',
      work: 'the work-order backlog from last week', work2: 'the preventive maintenance schedule', system: 'the new work-order system', busy: 'Commencement week',
      slip: 'two priority work orders sat open past their dates, twice this month', win: 'the boiler repair you finished before the cold snap', hourlyDefault: 'hourly' },
    { id: 'lab', name: 'Research lab', team: 'your lab', role: 'research assistant', role2: 'lab manager', place: 'the lab', asker: 'the principal investigator',
      work: 'the sample prep for Thursday’s run', work2: 'the inventory and ordering process', system: 'the new electronic lab notebook', busy: 'the grant deadline',
      slip: 'two runs were delayed because prep was not ready, and the PI heard it from someone else', win: 'the way you kept the freezer failure from costing a month of samples', hourlyDefault: 'salaried' },
    { id: 'library', name: 'Library and academic support', team: 'your library team', role: 'circulation specialist', role2: 'instruction librarian', place: 'the service desk', asker: 'the dean’s office',
      work: 'the course reserves for the new term', work2: 'the desk coverage schedule', system: 'the new checkout system', busy: 'finals week',
      slip: 'two reserve lists went live late this month and faculty emailed you about it', win: 'the extended-hours plan you ran during finals', hourlyDefault: 'mixed' },
    { id: 'students', name: 'Student affairs and events', team: 'your student affairs team', role: 'program coordinator', role2: 'events coordinator', place: 'the student center', asker: 'the Dean of Students office',
      work: 'the orientation schedule', work2: 'the event request process', system: 'the new room-booking system', busy: 'orientation week',
      slip: 'two event confirmations went out late this month and a student group complained', win: 'the way you staffed the welcome tables on move-in day', hourlyDefault: 'salaried' },
    { id: 'admin', name: 'Finance, HR, and administration', team: 'your administrative team', role: 'financial analyst', role2: 'business operations lead', place: 'the office', asker: 'the Provost’s office',
      work: 'the month-end close', work2: 'the expense approval routing', system: 'the new travel system', busy: 'fiscal year end',
      slip: 'two reconciliations came in late this month and Finance noticed before you did', win: 'the clean audit you delivered last quarter', hourlyDefault: 'salaried' },
    { id: 'advancement', name: 'Advancement and communications', team: 'your communications team', role: 'communications specialist', role2: 'gift officer', place: 'the office', asker: 'the campaign director',
      work: 'the donor mailing', work2: 'the content calendar', system: 'the new CRM', busy: 'the campaign launch',
      slip: 'two pieces went out past their dates this month and a donor noticed a wrong name', win: 'the campaign launch piece that got picked up by the news', hourlyDefault: 'salaried' }
  ],

  /* The cast. Portraits live in assets/img/foundation/cast. */
  cast: {
    sam: { name: 'Sam', img: 'sam', voice: 'bIHbv24MWmeRgasZH58o' },
    dev: { name: 'Dev', img: 'dev', voice: 'TX3LPaxmHKxFdv7VOQHJ' },
    priya: { name: 'Priya', img: 'priya', voice: 'EXAVITQu4vr4xnSDxMaL' },
    marcus: { name: 'Marcus', img: 'marcus', voice: 'nPczCjzI2devNBz1zQrb' },
    jordan: { name: 'Jordan', img: 'jordan', voice: 'pFZP5JQG7iQjIQuC4Bku' },
    alex: { name: 'Alex', img: 'alex', voice: 'iP95p4xoKVk53GoZ742B' }
  },

  /* The four weeks. Minutes are the plan; the page shows them as a timed agenda. */
  weeks: [
    { n: 1, slug: 'week-1', title: 'What it means to manage', mode: 'In the classroom', where: 'In person, half a day', mins: 180, expectation: 3,
      promise: 'By the end of the day you can say, in one sentence, what your team can expect from you, and you have held one hard conversation out loud.',
      playbook: { n: 1, title: 'Manager Philosophy', due: 'Sunday', desc: 'What your team can expect from you, what you say when bad news lands, and your intent for the next 90 days.' },
      segments: [
        { id: 'mission', mins: 15, title: 'Start with the mission', kind: 'room', std: 3, desc: 'Define the great university of the twenty-first century, and be it. What that asks of a team, and of you.' },
        { id: 'timeline', mins: 25, title: 'Your Manager Voyage, on a timeline', kind: 'activity', std: 3, desc: 'From the work you were hired to do, to Day 1 as a manager, to Day 90 after this cohort. You place yourself on it.' },
        { id: 'role', mins: 25, title: 'The new role, and the standard', kind: 'activity', std: 1, desc: 'What changed, and the four expectations you are already measured on. You sort a week of your own work into them.' },
        { id: 'lead', mins: 30, title: 'How to lead, in your area', kind: 'activity', std: 2, desc: 'Which expectation your team needs most this month, and the habit that serves it.' },
        { id: 'break', mins: 10, title: 'Break', kind: 'break' },
        { id: 'hard', mins: 50, title: 'The hard conversation, out loud', kind: 'lab', std: 1, desc: 'The three-line frame. A demonstration, then pairs, then a live round with Sam on your phone.' },
        { id: 'playbook', mins: 25, title: 'Playbook section one, and the week ahead', kind: 'write', std: 3, desc: 'Your Philosophy sentence, written and read aloud. Then what week two asks of you.' }
      ] },
    { n: 2, slug: 'week-2', title: 'Goals, 1:1s, and difficult conversations', mode: 'Virtual', where: 'On your own time, under ninety minutes', mins: 90, expectation: 1,
      promise: 'By Friday you have a 1:1 cadence on the calendar, three goals per person drafted, and one difficult conversation held with your own team.',
      playbook: { n: 2, title: '1:1 framework and conversation plan', due: 'Sunday', desc: 'Your cadence and agenda, three goals per person this quarter, and the opening sentence of the conversation you are holding.' },
      segments: [
        { id: 'core', mins: 30, title: 'Core module', kind: 'core', std: 1, desc: 'How to Manage Difficult Conversations, in Oracle Learning. Sets the vocabulary for the week.' },
        { id: 'lab', mins: 45, title: 'Learning Lab in SparkWise', kind: 'sparkwise', std: 1, desc: 'Conversation prep with peers. Bring the one you have been putting off; leave with it framed in three lines.' },
        { id: 'sim', mins: 10, title: 'Simulation lab: the 1:1 that turns difficult', kind: 'lab', std: 1, desc: 'Dev has missed two dates and opens as if nothing is wrong. Tailored to your team.' },
        { id: 'playbook', mins: 5, title: 'Playbook section two', kind: 'write', std: 1, desc: 'Cadence, agenda, three goals per person, your opening sentence.' }
      ] },
    { n: 3, slug: 'week-3', title: 'Coaching and mentoring', mode: 'Virtual', where: 'On your own time, under ninety minutes', mins: 90, expectation: 2,
      promise: 'By Friday you have handed over one real decision, with the boundary stated, and held one coaching conversation that was mostly questions.',
      playbook: { n: 3, title: 'Delegation and growth plan', due: 'Sunday', desc: 'For each person: where they want to be, one stretch assignment, their rung on the delegation ladder and the next one.' },
      segments: [
        { id: 'core', mins: 35, title: 'Core module', kind: 'core', std: 2, desc: 'Coaching Skills for Leaders and Managers, in Oracle Learning.' },
        { id: 'lab', mins: 40, title: 'Learning Lab in SparkWise', kind: 'sparkwise', std: 2, desc: 'Delegation lab and coach-or-correct lab. What you will hand off this month, to whom, with what boundary.' },
        { id: 'sim', mins: 10, title: 'Simulation lab: coach, then hand it over', kind: 'lab', std: 2, desc: 'Priya wants to grow and expects you to tell her how. Ask first. Then hand her a real decision with one boundary.' },
        { id: 'playbook', mins: 5, title: 'Playbook section three', kind: 'write', std: 2, desc: 'One line per person: where they want to be, the stretch assignment, the rung.' }
      ] },
    { n: 4, slug: 'week-4', title: 'Performance, talent, and your Playbook', mode: 'In the classroom', where: 'In person, two hours', mins: 120, expectation: 4,
      promise: 'You present your Playbook and how you will manage, to peers and your business unit leader, and leave with a 90-day Team Development Plan that survived a challenge.',
      playbook: { n: 4, title: 'Performance practice, and the whole Playbook', due: 'Before the capstone', desc: 'How you run the cycle, your feedback approach, the Integrated Management Model, and the Team Development Plan.' },
      segments: [
        { id: 'recap', mins: 20, title: 'Recap: four expectations, three weeks', kind: 'activity', std: 4, desc: 'What you tried, what held, what did not. The standard, read back against your own weeks.' },
        { id: 'practice', mins: 40, title: 'Practice round: the performance conversation', kind: 'lab', std: 2, desc: 'Marcus expects a promotion you cannot give this cycle. In pairs, then live.' },
        { id: 'present', mins: 50, title: 'Present your Playbook', kind: 'activity', std: 4, desc: 'Five minutes each, in fours: the sentence at the center, the team goal, one person’s plan by name, the habit you kept. Peers challenge one goal, one move, one date.' },
        { id: 'close', mins: 10, title: 'Close: the pulse, and what comes next', kind: 'write', std: 4, desc: 'The four confidence questions again, beside your prework answers. The 90-day reassessment date.' }
      ] }
  ],

  /* The confidence pulse: asked in prework and again at the capstone. */
  pulse: [
    'Telling a team member what I expect, by when, and what good looks like',
    'Holding a difficult conversation about missed work without hinting',
    'Handing over a real decision, with the boundary stated, and not taking it back',
    'Having a performance conversation that is honest about the answer and specific about what changes it'
  ],

  /* The voyage timeline for week one. Each stop has a prompt the manager answers in one line. */
  timeline: [
    { k: 'before', label: 'Before', title: 'The work you were hired to do', prompt: 'What were you best at, before you managed anyone?' },
    { k: 'day1', label: 'Day 1', title: 'The one change', prompt: 'The day it became the team’s work. What did you keep doing that was no longer your job?' },
    { k: 'day7', label: 'Day 7', title: 'Manager Foundations', prompt: 'The one idea from the course you actually used. Name it.' },
    { k: 'day60', label: 'Day 60', title: 'Measured against the standard', prompt: 'Of the four expectations, which did your assessment say to start with?' },
    { k: 'today', label: 'Today', title: 'The cohort', prompt: 'What does your team need from you most this month? One line.' },
    { k: 'day90', label: 'Day 90', title: 'The reassessment', prompt: 'When you rate the ten statements again, which one do you want to have moved?' },
    { k: 'year', label: 'Year one', title: 'Your team’s year', prompt: 'Next year this team will be able to do something it cannot do today. Finish the sentence.' }
  ],

  /* A week in your team: items the manager sorts into the four expectations. Templated per area and team type. */
  sortItems: [
    { t: '{Work} is due Friday and nobody on the team has mentioned it.', std: 1 },
    { t: '{Role} asks to swap Friday’s shift, again.', std: 2, type: 'hourly' },
    { t: '{Role} asks to work from home on Fridays from now on.', std: 2, type: 'salaried' },
    { t: '{Asker} asks for your whole team on Friday, the same week as {work}.', std: 4 },
    { t: '{System} arrives in six weeks and the email goes out Tuesday. Your team has not heard.', std: 3 },
    { t: '{Role2} wants to grow into a lead role and expects you to say how.', std: 2 },
    { t: 'The same handoff in {place} broke twice this month.', std: 1 },
    { t: 'Two timecards were submitted late and payroll runs Monday.', std: 1, type: 'hourly' },
    { t: 'A report your team sends to {asker} has been rebuilt by you, personally, three months running.', std: 1, type: 'salaried' },
    { t: 'You still have not met the person in Finance your team depends on every month.', std: 4 },
    { t: 'After {busy}, nobody looked back at what worked.', std: 3 },
    { t: '{Win}. Nobody was thanked by name.', std: 2 }
  ],

  /* The labs. One template per week, filled from the profile. `checks` are what the AI counterpart
     records; `options` is the tap version for a room with no microphones. */
  labs: {
    w1: { key: 'w1', who: 'sam', agent: 'agent_6501m6cjj1zjf4cvqhgek7wt4hc7', std: 1, mins: 'About three minutes',
      title: 'The hard conversation, out loud', frame: 'What I noticed. What I expect. What I need, by when.',
      role: '{Role} on {team}',
      brief: 'Sam is {aRole} on {team}. {Slip}. You have not said anything yet. You have ten minutes with Sam, and {busy} is close. Say what you noticed, what you expect from here, and what you need by when. Then ask what is in the way.',
      truth: 'Sam has been covering for a coworker who is out, and assumed you knew. Nobody told Sam which dates mattered. Sam is worried this is going to HR before anyone asked.',
      first: 'Hey. You wanted to see me? If this is about {work}, I know. I have been covering for two people.',
      checks: [['named_what_noticed', 'You said plainly what you noticed, with the dates'], ['stated_expectation', 'You said what you expect from here'], ['gave_a_date', 'You said what you need, by when'], ['asked_whats_in_the_way', 'You asked what is in the way, and listened']],
      penalty: ['handed_off_to_pcb', 'You said HR or your HCM would handle it. The conversation is yours; PCB shows you how.'], pass: 3,
      way: 'The Vanderbilt way: three lines, said in private, the week it happened. What I noticed, what I expect, what I need by when. Then the question that fixes it: what is in the way?',
      options: [
        { t: '“So, how are things going with {work}?”', b: 'Hinting', best: false, out: 'Sam says fine. You both know it is not. Two more weeks pass. Unclear is unkind.' },
        { t: '“I noticed {slipShort}. From here I expect it done before service, and I need the prep list to me by Wednesday. What is in the way?”', b: 'The three lines', best: true, out: 'Sam tells you about the coverage. You move one task, keep the date, and Sam flags the next risk early.' },
        { t: '“I am going to loop in my HCM so they can walk you through expectations.”', b: 'Handing it off', best: false, out: 'Sam goes quiet and guarded. The conversation was yours to have. PCB shows you how; it does not have it for you.' }
      ] },
    w2: { key: 'w2', who: 'dev', agent: 'agent_2201m6cjj3n8e61t1h2qbc5qa1af', std: 1, mins: 'About four minutes',
      title: 'The 1:1 that turns difficult', frame: 'Keep the 1:1 about Dev. Then name the two dates, the expectation, and what Dev needs.',
      role: '{Role} on {team}',
      brief: 'Your weekly 1:1 with Dev, {aRole} on {team}. Dev has missed two dates this month on {work} and opens as if nothing is wrong. A coworker mentioned it to you in passing. Keep the 1:1 about Dev, then say what you noticed, what you expect, and ask what Dev needs. Agree a next step before you leave.',
      truth: 'Both dates slipped because Dev was waiting on {asker} for something that never came. Dev emailed once and assumed someone would chase it. Nobody told Dev those two dates mattered to you.',
      first: 'Morning. So, {work} is moving along. Anything you want to cover today?',
      checks: [['named_what_noticed', 'You named the two missed dates plainly'], ['stated_expectation', 'You said what you expect from now on'], ['asked_what_you_need', 'You asked what was in the way, and heard the answer'], ['agreed_next_step', 'You agreed a concrete next step']],
      penalty: ['handed_off_to_pcb', 'You said HR, PCB, or your HCM would handle it. This one is yours.'], pass: 3,
      way: 'The Vanderbilt way: the 1:1 stays theirs, and the hard part gets said in it. Observation, expectation, the question, the next step. Written in the follow-up.',
      options: [
        { t: '“All good. Let me know if anything comes up with {work}.”', b: 'Avoiding it', best: false, out: 'Dev leaves relieved. The third date slips next week, and now it is a pattern you let run.' },
        { t: '“Before we move on: {work} missed two dates this month. From now on I need to know the day something is at risk. What got in the way?”', b: 'Said in the 1:1', best: true, out: 'Dev tells you about {asker}. You agree to lean on them together, and Dev flags the next risk the day it appears.' },
        { t: '“I think it is time PCB got involved in how we set expectations.”', b: 'Handing it off', best: false, out: 'Dev hears HR before anyone asked what happened. The relationship takes a month to recover.' }
      ] },
    w3: { key: 'w3', who: 'priya', agent: 'agent_1401m6cjj57ve2ntnnebk5zdyhb1', std: 2, mins: 'About four minutes',
      title: 'Coach, then hand it over', frame: 'Ask before you tell. Then hand over the decision with one boundary and a check-in date.',
      role: '{Role2} on {team}',
      brief: 'Priya, {aRole2} on {team}, wants to grow into a lead role and has asked you to tell her how. Coach instead: ask where she wants to be, what she has tried, what she would do first. Then hand her a real decision about {work2}, with one boundary and a check-in date, and do not take it back.',
      truth: 'Priya has an idea for {work2} already but does not think she is allowed to decide. If you ask, she will tell you. If you tell her what to do, she will nod and wait for the next instruction.',
      first: 'Thanks for making time. So, I want to move toward a lead role. Can you just tell me what I need to do?',
      checks: [['asked_before_told', 'You asked at least two real questions before giving advice'], ['named_where_they_want_to_go', 'You got Priya to say where she wants to be'], ['handed_over_decision', 'You handed over a real decision, not just a task'], ['stated_boundary_and_checkin', 'You stated one boundary and a check-in date']],
      penalty: ['took_it_back', 'You decided it for her or took the decision back. Growth saved for the review changes nothing.'], pass: 3,
      way: 'The Vanderbilt way: grow them and trust them. Questions first. Then the decision, the boundary, the date, and your name behind it.',
      options: [
        { t: '“Here is exactly what I would do. Step one...”', b: 'Telling', best: false, out: 'Priya nods and writes it down. She has learned how you would do it, and nothing about deciding.' },
        { t: '“Where do you want to be in two years? What have you tried? If {work2} were yours to run, what would you change first?”', b: 'Coaching', best: true, out: 'She has an idea. You hand her the decision, name the one boundary, set a date, and get out of the way.' },
        { t: '“Let us revisit this at your annual review.”', b: 'Growth saved for the review', best: false, out: 'Once a year, and it changes nothing. People leave for a manager who asks.' }
      ] },
    w4: { key: 'w4', who: 'marcus', agent: 'agent_0401m6cjj72beyqr17f6hwtdb3r9', std: 2, mins: 'About four minutes',
      title: 'The performance conversation', frame: 'Honest about the answer. Specific about what would change it. A growth move that starts now.',
      role: '{Role2} on {team}',
      brief: 'Marcus, {aRole2} on {team} and one of your strongest people, expects a promotion this cycle. You cannot give it: the position does not exist yet and the cycle is closed. Be honest about the answer, specific about what would change it, and name a growth move that starts now. Ask what he thinks.',
      truth: 'Marcus has a competing offer he has not mentioned. If you are vague, he decides you are stalling and takes it. If you are honest and specific, he stays to see the plan through.',
      first: 'So. I wanted to talk about the promotion. I think I have earned it, and I would like to know where it stands.',
      checks: [['honest_about_the_answer', 'You said plainly that the promotion is not possible this cycle'], ['specific_what_would_change', 'You said specifically what would change the answer'], ['named_growth_move_now', 'You named a growth move that starts now'], ['asked_their_view', 'You asked what Marcus thinks and listened']],
      penalty: ['promised_what_you_cannot', 'You promised or implied something you cannot deliver. It buys a month and costs the trust.'], pass: 3,
      way: 'The Vanderbilt way: honest about the cycle, specific about what would change the answer, a growth move that starts now. The hard truth, said with care, is the respectful version.',
      options: [
        { t: '“I am pushing for it. Give me a little time.”', b: 'Vague, and a promise you cannot keep', best: false, out: 'Marcus hears a yes. When the cycle closes without it, he takes the other offer and tells people why.' },
        { t: '“Not this cycle, and here is exactly why. Here is what would change the answer, and here is the piece of {work2} I want you to own starting Monday.”', b: 'Honest and specific', best: true, out: 'Marcus is disappointed and stays. He has a plan with dates, and a reason to believe you.' },
        { t: '“That is really a question for PCB and the compensation team.”', b: 'Handing it off', best: false, out: 'True in part, and he came to you. He learns you will not fight for him, and starts answering recruiters.' }
      ] }
  },

  /* ── Go deeper: after the week, for the manager who wants more. Inside is Oracle Learning (LinkedIn Learning and
     Vanderbilt courses; url null means search the title in Oracle Learning). Outside is podcasts, videos and reading,
     canonical pages only. Nothing here is required and none of it counts toward the ninety minutes. ── */
  deeper: {
    w1: {
      inside: [
        { title: 'Building Team Trust as a Manager', by: 'LinkedIn Learning, in Oracle', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002942090959', mins: 40, note: 'Trust as something a manager builds on purpose, week by week.' },
        { title: 'New Manager Foundations', by: 'LinkedIn Learning, Sara Canaday, in Oracle', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002857233710', mins: 55, note: 'The identity shift and the habits that separate managers who settle in from those who stay stuck.' }
      ],
      outside: [
        { kind: 'Video', title: 'Psychological safety, from the researcher who named it', by: 'Amy Edmondson, TEDxHGSE', url: 'https://www.youtube.com/watch?v=LhoLuui9gX8', mins: 12, note: 'Why the best teams report more mistakes. The reason your team needs to hear bad news early.' },
        { kind: 'Video', title: 'Why good leaders make you feel safe', by: 'Simon Sinek, TED', url: 'https://www.youtube.com/watch?v=2Ss78LfY3nE', mins: 12, note: 'The circle of safety, in one story.' },
        { kind: 'Video', title: 'The power of vulnerability', by: 'Brené Brown, TED', url: 'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability', mins: 20, note: 'Where Dare to Lead starts: the courage it takes to say the hard thing plainly.' },
        { kind: 'Read', title: 'The four building blocks of change', by: 'McKinsey', url: 'https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-four-building-blocks--of-change', mins: 10, note: 'The influence model: role modeling, understanding and conviction, formal mechanisms, skills. Managing is the first building block.' },
        { kind: 'Read', title: 'What makes a great manager', by: 'Google re:Work, Project Oxygen', url: 'https://rework.withgoogle.com/en/guides/managers-identify-what-makes-a-great-manager', mins: 10, note: 'Ten behaviors from a decade of data. Notice how closely they track the four expectations.' },
        { kind: 'Book', title: 'The Making of a Manager', by: 'Julie Zhuo, Portfolio', url: null, mins: null, note: 'The first-time manager book: what to do when everyone looks to you.' }
      ]
    },
    w2: {
      inside: [
        { title: 'A Manager’s Guide to Conducting Effective One-on-One Meetings', by: 'LinkedIn Learning, in Oracle', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002857334221', mins: 35, note: 'The cadence, the agenda that belongs to the team member, and what a manager checks in the meeting.' },
        { title: 'How to Have Productive One-on-One Meetings', by: 'LinkedIn Learning, in Oracle', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemType=ORA_COURSE&learningItemId=300002856581889', mins: 20, note: 'The shorter companion on running the meeting itself.' },
        { title: 'Setting Team and Employee Goals Using SMART Methodology', by: 'LinkedIn Learning, Mike Figliuolo, in Oracle', url: null, mins: 50, note: 'Goals specific enough to check in a 1:1. Search the title in Oracle Learning.' }
      ],
      outside: [
        { kind: 'Podcast', title: 'Manager Tools Basics: one-on-ones and feedback', by: 'Manager Tools, Horstman and Auzenne', url: 'https://www.manager-tools.com/manager-tools-basics', mins: 40, note: 'The core casts. Start with the one-on-ones episodes.' },
        { kind: 'Podcast', title: 'Radical Candor', by: 'Kim Scott and Amy Sandler', url: 'https://www.radicalcandor.com/podcast/', mins: 30, note: 'Care personally, challenge directly, applied to real situations.' },
        { kind: 'Video', title: 'Feedback in three parts: situation, behavior, impact', by: 'Center for Creative Leadership', url: 'https://www.youtube.com/watch?v=-oRKr5xA9N0', mins: 4, note: 'The simplest feedback structure there is. Your follow-up note, in three sentences.' },
        { kind: 'Video', title: 'The big rocks method, in two minutes', by: 'FranklinCovey', url: 'https://www.youtube.com/watch?v=j6m9WnNdpSw', mins: 2, note: 'Covey’s jar: the priorities go in first or they do not go in at all.' },
        { kind: 'Read', title: 'Dare to Lead', by: 'Brené Brown', url: 'https://brenebrown.com/hubs/dare-to-lead/', mins: 15, note: 'Clear is kind, unclear is unkind, and “the story I’m telling myself” as the opening of a hard conversation.' },
        { kind: 'Book', title: 'High Output Management', by: 'Andrew S. Grove, Vintage', url: null, mins: null, note: 'The classic. The 1:1 belongs to the team member, and a manager’s output is the output of the team.' }
      ]
    },
    w3: {
      inside: [
        { title: 'Delegating Tasks', by: 'LinkedIn Learning, Dorie Clark, in Oracle', url: null, mins: 30, note: 'Handing over the decision and not just the task, and the boundary you state when you do. Search the title in Oracle Learning.' },
        { title: 'Coaching Skills for Leaders and Managers', by: 'LinkedIn Learning, Sara Canaday, in Oracle', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002857610240&learningItemType=ORA_COURSE', mins: 35, note: 'The core module, worth a second pass after the lab.' }
      ],
      outside: [
        { kind: 'Podcast', title: 'Coaching Real Leaders', by: 'Harvard Business Review, Muriel Wilkins', url: 'https://hbr.org/podcasts/coaching-real-leaders', mins: 35, note: 'Real, anonymous coaching sessions. Count how many questions she asks before she offers anything.' },
        { kind: 'Podcast', title: 'WorkLife with Adam Grant', by: 'TED', url: 'https://www.ted.com/podcasts/worklife', mins: 35, note: 'An organizational psychologist on motivation, feedback and what makes people grow.' },
        { kind: 'Read', title: 'Manager guides: coaching with GROW', by: 'Google re:Work', url: 'https://rework.withgoogle.com/intl/en/subjects/managers', mins: 10, note: 'Goal, reality, options, will: the structure under the Priya lab.' },
        { kind: 'Read', title: 'Business Chemistry', by: 'Deloitte', url: 'https://www2.deloitte.com/us/en/pages/operations/articles/business-chemistry.html', mins: 10, note: 'Pioneers, guardians, drivers, integrators. Coaching lands differently with each.' },
        { kind: 'Read', title: 'The 7 Habits of Highly Effective People', by: 'FranklinCovey', url: 'https://www.franklincovey.com/the-7-habits/', mins: 10, note: 'Habit 5, seek first to understand, then to be understood, is the whole of coaching in one line.' },
        { kind: 'Book', title: 'The Coaching Habit', by: 'Michael Bungay Stanier, Box of Crayons', url: 'https://boxofcrayons.com/', mins: null, note: 'Seven questions, starting with “What’s on your mind?” and ending with “What was most useful?”' }
      ]
    },
    w4: {
      inside: [
        { title: 'Performance Management: Conducting Performance Reviews', by: 'LinkedIn Learning, Todd Dewett, in Oracle', url: null, mins: 35, note: 'Preparing, the conversation itself, and the follow-through. Search the title in Oracle Learning.' },
        { title: 'Managing Employee Performance Problems', by: 'LinkedIn Learning, Todd Dewett, in Oracle', url: null, mins: 35, note: 'When a talk did not fix it. Search the title in Oracle Learning.' },
        { title: 'Performance Management Foundations for Managers', by: 'Vanderbilt, in Oracle', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002987329200&learningItemType=ORA_COURSE', mins: 30, note: 'The Vanderbilt cycle. The core module, for reference all year.' }
      ],
      outside: [
        { kind: 'Read', title: 'Reinventing performance management', by: 'Marcus Buckingham and Ashley Goodall, Harvard Business Review, on Deloitte’s redesign', url: 'https://hbr.org/2015/04/reinventing-performance-management', mins: 20, note: 'Frequent check-ins and four future-focused questions replaced the annual ratings. The model behind how you run the cycle.' },
        { kind: 'Read', title: 'What makes an effective executive', by: 'Peter Drucker, Harvard Business Review', url: 'https://hbr.org/2004/06/what-makes-an-effective-executive', mins: 15, note: 'Eight practices. “What needs to be done?” and “Write an action plan” are your Playbook.' },
        { kind: 'Podcast', title: 'The McKinsey Podcast', by: 'McKinsey', url: 'https://www.mckinsey.com/featured-insights/mckinsey-podcast', mins: 30, note: 'Talent, performance and leading change, from the research side.' },
        { kind: 'Podcast', title: 'HBR IdeaCast', by: 'Harvard Business Review', url: 'https://hbr.org/podcasts/ideacast', mins: 30, note: 'A weekly interview with a leading thinker on management and work.' },
        { kind: 'Read', title: 'Human Capital Trends', by: 'Deloitte Insights', url: 'https://www2.deloitte.com/us/en/insights/focus/human-capital-trends.html', mins: 20, note: 'Where talent and work are going, for the Team Development Plan’s year-one line.' },
        { kind: 'Book', title: 'The First 90 Days', by: 'Michael D. Watkins, Harvard Business Review Press', url: null, mins: null, note: 'The transition playbook, for you and for the person you just promoted.' }
      ]
    }
  },

  /* ── The thinking behind each week: frameworks from the people who have studied managers longest, and exactly
     where the cohort uses each one. Named so a manager can go find the source. ── */
  frameworks: {
    w1: [
      { who: 'Stephen R. Covey', what: 'Habit 2: Begin with the end in mind', how: 'The Year one stop on your timeline and your Philosophy sentence. You write where the team is going before you decide what to do Monday.' },
      { who: 'McKinsey', what: 'The influence model', how: 'Four levers move a team: role modeling, understanding and conviction, formal mechanisms, and skills. Managing is the first one. The mission segment is the second: nobody follows a change they cannot explain.' },
      { who: 'Google, Project Oxygen', what: 'What great managers do', how: 'Ten behaviors from a decade of data: a good coach, empowers and does not micromanage, cares about well-being, is results-oriented, communicates, supports growth, has a vision. They sort into the four expectations almost one to one.' },
      { who: 'Brené Brown', what: 'Clear is kind. Unclear is unkind.', how: 'The hard conversation lab. Hinting feels gentle and is not. Three lines, said in private, is the kind version.' },
      { who: 'Andy Grove and Julie Zhuo', what: 'A manager’s output is the team’s output', how: 'The one change on the role page. You are measured on what they produce, not on what you personally finish.' }
    ],
    w2: [
      { who: 'Andy Grove', what: 'The 1:1 belongs to the team member', how: 'Their agenda first, yours second, one question about them last. Dev’s lab opens exactly this way, and the hard part still gets said inside it.' },
      { who: 'Stephen R. Covey', what: 'The time matrix: urgent and important', how: 'Managing lives in quadrant two: important, not yet urgent. 1:1s, goals, and the conversation you have been putting off. Put them in the calendar first, like the big rocks in the jar.' },
      { who: 'John Doerr and SMART goals', what: 'Goals you can check', how: 'Three per person, specific enough to look at in a 1:1 and know. “Improve service” is a wish. “Reserve lists live three days before term, every term” is a goal.' },
      { who: 'Brené Brown', what: '“The story I’m telling myself”', how: 'Line one of the frame is the fact with the date, never the story about the fact. If you catch yourself narrating motive, stop and name the observation.' },
      { who: 'Kim Scott', what: 'Radical candor', how: 'Care personally and challenge directly, at the same time. The Vanderbilt way is the same idea: say it, in private, the week it happened.' },
      { who: 'Center for Creative Leadership', what: 'Situation, behavior, impact', how: 'The follow-up note after the conversation, in three sentences. Where, what you saw, what it caused.' }
    ],
    w3: [
      { who: 'Michael Bungay Stanier', what: 'The seven coaching questions', how: '“What’s on your mind?” “And what else?” “What’s the real challenge here for you?” “What do you want?” “How can I help?” “If you say yes to this, what are you saying no to?” “What was most useful?” Priya’s lab scores you on asking before telling.' },
      { who: 'John Whitmore', what: 'GROW', how: 'Goal, reality, options, will. The structure under any coaching conversation when you lose the thread: where do you want to be, where are you, what could you do, what will you do.' },
      { who: 'Stephen R. Covey', what: 'Habit 5: Seek first to understand, then to be understood', how: 'The rule of the week. Two real questions before any advice, and the advice gets shorter every time.' },
      { who: 'Hersey and Blanchard, and Grove’s task-relevant maturity', what: 'Situational leadership', how: 'The delegation ladder. How much direction a person needs depends on the task, not on the person. The same analyst can be rung five on reports and rung two on the budget.' },
      { who: 'Deloitte', what: 'Business Chemistry', how: 'Pioneers, guardians, drivers, integrators. Coach a guardian with the plan and the risk; coach a pioneer with the possibility. The question is the same; the way in is not.' }
    ],
    w4: [
      { who: 'Deloitte, via Buckingham and Goodall', what: 'Performance management, reinvented', how: 'Frequent check-ins instead of a once-a-year rating, and the manager answers four future-focused questions about each person. How you run the cycle in Playbook section four.' },
      { who: 'Peter Drucker', what: 'What makes an effective executive', how: 'Ask what needs to be done. Write an action plan. Take responsibility for decisions and for communication. Your five-minute presentation is that plan, out loud.' },
      { who: 'Marcus Buckingham', what: 'Play to strengths', how: 'The growth move for Marcus is a real piece of work with his name on it, in the thing he is best at. Not a course.' },
      { who: 'Patrick Lencioni', what: 'The five dysfunctions of a team', how: 'Trust, then conflict, then commitment, then accountability, then results. The peer challenge in the presentations is the conflict step done on purpose.' },
      { who: 'McKinsey', what: 'Talent to value', how: 'Put your strongest people on the work that matters most, and say so. The Team Development Plan names who owns the team goal.' }
    ]
  },

  /* ── The other things you manage. The duties that arrive with the title, by cadence, with the system, who to
     call and the expectation each one serves. Then the time rules that keep them from eating the week. ── */
  manage: {
    intro: 'Managing is the four expectations. It is also timecards, leave, expenses, hiring, and the inbox. None of it is optional and none of it is the job; it is what makes the job possible. Here is all of it in one place, and how to keep it to a few hours a week.',
    cadence: [
      { when: 'Every week', items: [
        { what: 'Approve timecards and time-off requests', sys: 'UKG for hourly staff; Oracle Cloud for exempt time off', std: 1, who: 'Your HCM for anything that does not look right', note: 'Before the payroll deadline, usually Monday. Late approval is late pay, and your team notices before you do.', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002726332894&learningItemType=ORA_SPECIALIZATION', link: 'UKG for managers, in Oracle Learning' },
        { what: 'Hold the 1:1s', sys: 'The calendar, as recurring holds', std: 2, who: 'Nobody. This one is yours.', note: 'Thirty minutes, weekly, theirs first. The single highest-leverage hour you spend, in Grove’s words.' },
        { what: 'Clear the approvals in Oracle HCM', sys: 'Oracle HCM, your team view and worklist', std: 1, who: 'Your HCM', note: 'Position and assignment changes, costing, documents. A fixed fifteen minutes beats a surprise.' },
        { what: 'Look back, fifteen minutes', sys: 'The team meeting, or Friday on your own', std: 3, who: 'Nobody', note: 'What worked, what broke twice, what to change. Expectation 03, done weekly, is the whole change method.' }
      ] },
      { when: 'The same day it comes up', items: [
        { what: 'Someone mentions leave, health, family, or FMLA', sys: 'Origami, for FMLA and leave requests', std: 2, who: 'Leave and Workers’ Compensation, the same day; then tell your HCM', note: 'A leave request rarely sounds like one. Never ask for a diagnosis. You route it; you do not decide it.', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300003110215584&learningItemType=ORA_COURSE', link: 'FMLA for managers, in Oracle Learning' },
        { what: 'Someone is hurt at work', sys: 'The workplace injury report', std: 2, who: 'Leave and Workers’ Compensation, the same day; then your HCM', note: 'Report first, then tell your HCM. The claim starts the day you file it.' },
        { what: 'A request for an accommodation', sys: 'The interactive process', std: 2, who: 'Equal Opportunity and Access', note: 'Recognize it, route it, and keep the person working while it is worked out. EOA runs the process with you.' },
        { what: 'A report of discrimination, harassment, or sexual misconduct', sys: 'A report to EOA or the Title IX Office', std: 2, who: 'EOA, or the Title IX Office; then your HCM', note: 'You are a required reporter. You report; you do not investigate and you do not promise confidentiality.' }
      ] },
      { when: 'Every month', items: [
        { what: 'Approve expense reports and procurement requests', sys: 'Oracle Cloud expenses and procurement', std: 1, who: 'Your finance partner, before you approve something you do not understand', note: 'Approving is attesting. Read the receipt, check the fund, ask if unsure. A wrong approval is yours.' },
        { what: 'A budget check with your finance partner', sys: 'A standing thirty minutes', std: 4, who: 'Your finance partner, by name', note: 'Where the money came from this month and where it went. Expectation 04: know the people your team depends on.' },
        { what: 'Thank someone by name for a specific thing', sys: 'Out loud, in front of the team, or in writing', std: 2, who: 'Nobody', note: 'Statement 5 on your assessment. If it is not in the calendar it does not happen.' }
      ] },
      { when: 'Each cycle', items: [
        { what: 'The performance cycle: goals, check-ins, the review', sys: 'Oracle HCM performance', std: 1, who: 'Your HCM for the dates; your Engagement Consultant for a hard one', note: 'Nothing at the review should be a surprise. If the 1:1s happened, the review is a summary.', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002987329200&learningItemType=ORA_COURSE', link: 'Performance Management Foundations, in Oracle Learning' },
        { what: 'Hiring: the requisition, interviews, the offer', sys: 'Oracle Recruiting', std: 1, who: 'Your HCM opens it with you', note: 'Write the job before you post it: what good looks like at ninety days. Interview for it.', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300001769180473&learningItemType=ORA_CLASS', link: 'Oracle Recruiting and Onboarding for Hiring Managers, in Oracle Learning' },
        { what: 'Onboarding a new hire', sys: 'The first-week checklist', std: 2, who: 'Your HCM for systems access', note: 'Day one has a desk, a login, a buddy, and a 1:1 on the calendar. Day 30, 60, 90 check-ins written down before they start.' },
        { what: 'A performance concern that a talk did not fix', sys: 'Documentation, then the written step', std: 1, who: 'Your HCM first; Employee Relations before any formal step', note: 'Dates, what was said, what you did. Bring that to Employee Relations through your HCM. The conversation stays yours.' },
        { what: 'Required compliance training, yours and the team’s', sys: 'Oracle Learning', std: 4, who: 'Compliance, for policy questions', note: 'Check the team’s completion once a cycle. It is recorded against your job profile too.' }
      ] }
    ],
    time: [
      { who: 'Stephen R. Covey', what: 'Quadrant two first', how: 'Important and not yet urgent is where managing happens: 1:1s, goals, the look back, the conversation you are avoiding. Put those in the calendar first. The approvals fit around them; it never works the other way round.' },
      { who: 'Peter Drucker', what: 'Know thy time', how: 'For one week, write down where the hours went. Managers who do this find a third of their week was interruptions they could batch. Then batch them: approvals at one fixed time, email at three.' },
      { who: 'Andy Grove', what: 'Leverage', how: 'Some hours change the output of one person for a day. Some change the output of a team for a quarter. A 1:1, a clear expectation, a decision handed over: high leverage. Rebuilding the report yourself: low. Spend the week on the first kind.' },
      { who: 'Paul Graham', what: 'The manager’s schedule', how: 'Your day is now hour-sized blocks and other people’s calendars. Protect one half day a week with no meetings for the thinking work, and tell the team it exists so they do not book it.' },
      { who: 'FranklinCovey', what: 'Big rocks', how: 'The jar, the rocks, the sand. The week’s three rocks go in on Monday morning before the inbox opens. Everything else is sand and it still fits.' }
    ],
    week: [
      { day: 'Monday', items: ['Timecards and time off approved before the deadline', 'The three rocks for the week written down', 'Oracle HCM worklist cleared, fifteen minutes'] },
      { day: 'Tuesday to Thursday', items: ['1:1s, thirty minutes each, theirs first', 'One protected half day with no meetings', 'Email at three fixed times, not all day'] },
      { day: 'Friday', items: ['The look back, fifteen minutes: what worked, what broke twice', 'One thank-you by name', 'Next week’s rocks, before you leave'] },
      { day: 'Any day, same day', items: ['Leave, injury, accommodation, or a report: route it and tell your HCM', 'A date at risk: say it the day it is at risk, not the day it is missed'] }
    ]
  }
};
