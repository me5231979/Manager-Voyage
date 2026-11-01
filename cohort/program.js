/* =====================================================================
   MANAGER VOYAGE · THE FOUR-WEEK COHORT · program data
   One file holds the whole workshop: the profile a manager sets, the
   vocabulary of each work area, the four weeks with their timed segments,
   the Playbook sections, and the scenario bank the labs are built from.
   Every scenario is a template filled from the manager's profile, so a
   dining supervisor and an IT manager rehearse the same skill in their
   own world. SparkWise links are placeholders in `links` until supplied.
   The cohort is the 201/301 to Manager Foundations: it practices the
   Vanderbilt Manager Standard, it does not reteach it.
   ===================================================================== */
window.MV_COHORT = {
  version: '2026.11.01.a',
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
        { id: 'timeline', mins: 25, title: 'Your voyage, on a timeline', kind: 'activity', std: 3, desc: 'From the work you were hired to do, to Day 1 as a manager, to Day 90 after this cohort. You place yourself on it.' },
        { id: 'role', mins: 25, title: 'The new role, and the standard', kind: 'activity', std: 1, desc: 'What changed, and the four expectations you are already measured on. You sort a week of your own work into them.' },
        { id: 'lead', mins: 30, title: 'How to lead, in your area', kind: 'activity', std: 2, desc: 'Which expectation your team needs most this month, and the habit that serves it.' },
        { id: 'break', mins: 10, title: 'Break', kind: 'break' },
        { id: 'hard', mins: 50, title: 'The hard conversation, out loud', kind: 'lab', std: 1, desc: 'The three-line frame. A demonstration, then pairs, then a live round with Sam on your phone.' },
        { id: 'playbook', mins: 25, title: 'Playbook section one, and the week ahead', kind: 'write', std: 3, desc: 'Your Philosophy sentence, written and read aloud. Then what week two asks of you.' }
      ] },
    { n: 2, slug: 'week-2', title: 'Goals, 1:1s, and difficult conversations', mode: 'Remote', where: 'On your own time, under ninety minutes', mins: 90, expectation: 1,
      promise: 'By Friday you have a 1:1 cadence on the calendar, three goals per person drafted, and one difficult conversation held with your own team.',
      playbook: { n: 2, title: '1:1 framework and conversation plan', due: 'Sunday', desc: 'Your cadence and agenda, three goals per person this quarter, and the opening sentence of the conversation you are holding.' },
      segments: [
        { id: 'core', mins: 30, title: 'Core module', kind: 'core', std: 1, desc: 'How to Manage Difficult Conversations, in Oracle Learning. Sets the vocabulary for the week.' },
        { id: 'lab', mins: 45, title: 'Learning Lab in SparkWise', kind: 'sparkwise', std: 1, desc: 'Conversation prep with peers. Bring the one you have been putting off; leave with it framed in three lines.' },
        { id: 'sim', mins: 10, title: 'Simulation lab: the 1:1 that turns difficult', kind: 'lab', std: 1, desc: 'Dev has missed two dates and opens as if nothing is wrong. Tailored to your team.' },
        { id: 'playbook', mins: 5, title: 'Playbook section two', kind: 'write', std: 1, desc: 'Cadence, agenda, three goals per person, your opening sentence.' }
      ] },
    { n: 3, slug: 'week-3', title: 'Coaching and mentoring', mode: 'Remote', where: 'On your own time, under ninety minutes', mins: 90, expectation: 2,
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
  }
};
