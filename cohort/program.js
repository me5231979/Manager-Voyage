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
  version: '2026.11.01.c',
  site: 'https://manager-voyage.vercel.app/cohort/',
  links: {
    foundations: '../foundation/',
    assessment: '../reassess/',
    playbook: 'Manager-Playbook.pdf',
    portal: 'https://www.vanderbilt.edu/pcb/futures-learning-hub/manager-resources/',
    /* SparkWise Learning Labs: paste the links here when they exist. Empty means a placeholder card. */
    sparkwise: { w1: '', w2: '', w3: '', w4: '' },
    /* The team's view of the ten statements (a Microsoft Form, anonymous), the completion record (a form or an inbox), and the leader brief. Empty means the page shows the copy-and-paste version. */
    teamForm: '', completionForm: '', completionEmail: '', leaderEmailCc: '',
    /* Power Automate. An HTTP-request flow that writes to SharePoint. The site posts JSON as text/plain with no
       CORS preflight, the same way the Foundations course posts to its flow. Empty means the survey keeps a local
       copy and offers email. Payloads: { event:'survey' | 'completion', at, ...fields }. */
    surveyFlowUrl: '',
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
      slip: 'the prep list was not done when service started, twice this month', win: 'the way you ran the line during the Chancellor’s dinner', es: { role: 'cocinero de línea', team: 'tu equipo de comedor', work: 'el pedido de catering para el almuerzo de donantes del viernes', busy: 'el fin de semana de mudanza', slip: 'la lista de preparación no estaba lista cuando empezó el servicio, dos veces este mes' }, hourlyDefault: 'hourly' },
    { id: 'it', name: 'IT and technology', team: 'your IT team', role: 'desktop support analyst', role2: 'systems administrator', place: 'the service desk', asker: 'the department chair',
      work: 'the patch window for the lab workstations', work2: 'the ticket triage rotation', system: 'the new ticketing system', busy: 'the start of term',
      slip: 'two change windows were missed this month and nobody said so until the tickets came in', win: 'the way you handled the outage on the first day of class', es: { role: 'analista de soporte técnico', team: 'tu equipo de TI', work: 'la ventana de parches para las estaciones del laboratorio', busy: 'el inicio del semestre', slip: 'se perdieron dos ventanas de cambio este mes y nadie lo dijo hasta que llegaron los tickets' }, hourlyDefault: 'salaried' },
    { id: 'facilities', name: 'Facilities and grounds', team: 'your facilities crew', role: 'maintenance technician', role2: 'crew lead', place: 'the shop', asker: 'Housing',
      work: 'the work-order backlog from last week', work2: 'the preventive maintenance schedule', system: 'the new work-order system', busy: 'Commencement week',
      slip: 'two priority work orders sat open past their dates, twice this month', win: 'the boiler repair you finished before the cold snap', es: { role: 'técnico de mantenimiento', team: 'tu cuadrilla de mantenimiento', work: 'las órdenes de trabajo atrasadas de la semana pasada', busy: 'la semana de graduación', slip: 'dos órdenes de trabajo prioritarias quedaron abiertas después de su fecha, dos veces este mes' }, hourlyDefault: 'hourly' },
    { id: 'lab', name: 'Research lab', team: 'your lab', role: 'research assistant', role2: 'lab manager', place: 'the lab', asker: 'the principal investigator',
      work: 'the sample prep for Thursday’s run', work2: 'the inventory and ordering process', system: 'the new electronic lab notebook', busy: 'the grant deadline',
      slip: 'two runs were delayed because prep was not ready, and the PI heard it from someone else', win: 'the way you kept the freezer failure from costing a month of samples', es: { role: 'asistente de investigación', team: 'tu laboratorio', work: 'la preparación de muestras para la corrida del jueves', busy: 'la fecha límite de la subvención', slip: 'dos corridas se retrasaron porque la preparación no estaba lista, y el investigador principal se enteró por otra persona' }, hourlyDefault: 'salaried' },
    { id: 'library', name: 'Library and academic support', team: 'your library team', role: 'circulation specialist', role2: 'instruction librarian', place: 'the service desk', asker: 'the dean’s office',
      work: 'the course reserves for the new term', work2: 'the desk coverage schedule', system: 'the new checkout system', busy: 'finals week',
      slip: 'two reserve lists went live late this month and faculty emailed you about it', win: 'the extended-hours plan you ran during finals', es: { role: 'especialista de circulación', team: 'tu equipo de biblioteca', work: 'las reservas de curso para el nuevo semestre', busy: 'la semana de exámenes finales', slip: 'dos listas de reserva se publicaron tarde este mes y el profesorado te escribió por eso' }, hourlyDefault: 'mixed' },
    { id: 'students', name: 'Student affairs and events', team: 'your student affairs team', role: 'program coordinator', role2: 'events coordinator', place: 'the student center', asker: 'the Dean of Students office',
      work: 'the orientation schedule', work2: 'the event request process', system: 'the new room-booking system', busy: 'orientation week',
      slip: 'two event confirmations went out late this month and a student group complained', win: 'the way you staffed the welcome tables on move-in day', es: { role: 'coordinador de programas', team: 'tu equipo de asuntos estudiantiles', work: 'el calendario de orientación', busy: 'la semana de orientación', slip: 'dos confirmaciones de eventos salieron tarde este mes y un grupo estudiantil se quejó' }, hourlyDefault: 'salaried' },
    { id: 'admin', name: 'Finance, HR, and administration', team: 'your administrative team', role: 'financial analyst', role2: 'business operations lead', place: 'the office', asker: 'the Provost’s office',
      work: 'the month-end close', work2: 'the expense approval routing', system: 'the new travel system', busy: 'fiscal year end',
      slip: 'two reconciliations came in late this month and Finance noticed before you did', win: 'the clean audit you delivered last quarter', es: { role: 'analista financiero', team: 'tu equipo administrativo', work: 'el cierre de mes', busy: 'el cierre del año fiscal', slip: 'dos conciliaciones llegaron tarde este mes y Finanzas lo notó antes que tú' }, hourlyDefault: 'salaried' },
    { id: 'advancement', name: 'Advancement and communications', team: 'your communications team', role: 'communications specialist', role2: 'gift officer', place: 'the office', asker: 'the campaign director',
      work: 'the donor mailing', work2: 'the content calendar', system: 'the new CRM', busy: 'the campaign launch',
      slip: 'two pieces went out past their dates this month and a donor noticed a wrong name', win: 'the campaign launch piece that got picked up by the news', es: { role: 'especialista en comunicaciones', team: 'tu equipo de comunicaciones', work: 'el envío postal a donantes', busy: 'el lanzamiento de la campaña', slip: 'dos piezas salieron después de su fecha este mes y un donante notó un nombre equivocado' }, hourlyDefault: 'salaried' }
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
      playbook: { n: 1, title: 'Manager Philosophy', due: 'Sunday', desc: 'The best manager you ever had, your journey in six moments, what your team can expect from you, what you say when bad news lands, and your intent for the next 90 days.' },
      segments: [
        { id: 'welcome', mins: 25, title: 'Welcome, and the best manager you ever had', kind: 'room', std: 2, desc: 'The norms, who is in the room, and one question that starts everything: what did the best manager you ever had actually do?' },
        { id: 'mission', mins: 15, title: 'Start with the mission', kind: 'room', std: 3, desc: 'Define the great university of the twenty-first century, and be it. The three areas of focus, and what they ask of a team, and of you.' },
        { id: 'timeline', mins: 25, title: 'Your Manager Voyage, on a timeline', kind: 'activity', std: 3, desc: 'From the work you were hired to do to year one, and the six moments that shaped how you lead. You place yourself on it.' },
        { id: 'role', mins: 30, title: 'From contributor to manager, and the standard', kind: 'activity', std: 1, desc: 'In groups: what changes when you move from doing the work to leading it. Then the four expectations you are already measured on, sorted from your own week.' },
        { id: 'break', mins: 10, title: 'Break', kind: 'break' },
        { id: 'lead', mins: 15, title: 'How to lead, in your area', kind: 'activity', std: 2, desc: 'Where you are strong, where you are growing, which expectation your team needs most this month, and the habit that serves it.' },
        { id: 'hard', mins: 40, title: 'The hard conversation, out loud', kind: 'lab', std: 1, desc: 'The three-line frame. A demonstration, then pairs, then a live round with Sam on your phone.' },
        { id: 'playbook', mins: 20, title: 'Your Philosophy, the program, and the week ahead', kind: 'write', std: 3, desc: 'You have already done the work; now put it together. Then the four weeks, the survey, and what week two asks of you.' }
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
        { id: 'practice', mins: 40, title: 'Practice round: two conversations', kind: 'lab', std: 2, desc: 'Marcus expects a promotion you cannot give this cycle. Then Jordan, from another office, wants your whole team on Friday. In pairs, then live.' },
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
      ] },
    w4x: { key: 'w4x', who: 'jordan', agent: 'agent_9401m6cps8jbf2bstbf27rqgaz2n', std: 4, mins: 'About four minutes',
      title: 'The ask you have to refuse', frame: 'Hear the need. Say no to the whole ask, plainly. Show the hours. Offer two options.',
      role: 'from {asker}',
      brief: 'Jordan, from {asker}, calls and asks for your whole team on Friday, all day, and has already told their director you would be fine with it. Friday is also the deadline for {work}, and {busy} is close. Hear what Jordan needs, say plainly that the whole team is not available, show the hours, and offer two options you can actually deliver.',
      truth: 'Jordan really needs six hands for four hours in the afternoon. Their own planning slipped and they asked late. If you offer two real options, either works. If you only say no, they escalate. If you say yes to everything, they take it and move on.',
      first: 'Hi, thanks for picking up. Quick one. I need your whole team on Friday, all day. It is a big one for us and I told my director you would be fine with it.',
      checks: [['acknowledged_the_need', 'You heard what Jordan needs and said so before answering'], ['said_no_plainly', 'You said plainly, early, that the whole team is not available Friday'], ['showed_the_hours', 'You showed the hours or the conflict as facts, not feelings'], ['offered_two_options', 'You offered two real options instead of a flat no'], ['agreed_next_step', 'You agreed a next step with a time']],
      penalty: ['caved', 'You said yes to the whole ask. Your team pays for it Friday, and Jordan learns that you always will.'], pass: 4,
      way: 'The Vanderbilt way, and statement 10 on your assessment: show the hours, name the conflict, offer two options. A flat no breaks the partnership; a flat yes breaks the team.',
      options: [
        { t: '“Sure, we will make it work. Send me the details.”', b: 'Caving', best: false, out: 'Jordan says great and hangs up. Friday, {work} slips, and your team learns that other offices come first.' },
        { t: '“I hear you need hands Friday. The whole team is not available: {work} is due that day. I can do half the team from one to five, or two people all day with a handoff. Which works?”', b: 'Show the hours, two options', best: true, out: 'Jordan takes the afternoon option and thanks you. Your team keeps its deadline and you keep the partner.' },
        { t: '“No. We are slammed. Ask someone else.”', b: 'The flat no', best: false, out: 'Jordan escalates to their director, who calls yours. Now it is a conversation about whether your team is a team player.' }
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
        { title: 'Performance Management Foundations for Managers', by: 'Vanderbilt, in Oracle', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300002987329200&learningItemType=ORA_COURSE', mins: 30, note: 'The Vanderbilt cycle. The core module, for reference all year.' },
        { title: 'Oracle Recruiting and Onboarding for Hiring Managers', by: 'Vanderbilt, in Oracle', url: 'https://ecsr.fa.us2.oraclecloud.com/fscmUI/redwood/learner/learn/redirect?learningItemId=300001769180473&learningItemType=ORA_CLASS', mins: 45, note: 'The requisition, the interviews, the offer, and the first week, in the system you will use.' }
      ],
      outside: [
        { kind: 'Read', title: 'Reinventing performance management', by: 'Marcus Buckingham and Ashley Goodall, Harvard Business Review, on Deloitte’s redesign', url: 'https://hbr.org/2015/04/reinventing-performance-management', mins: 20, note: 'Frequent check-ins and four future-focused questions replaced the annual ratings. The model behind how you run the cycle.' },
        { kind: 'Read', title: 'What makes an effective executive', by: 'Peter Drucker, Harvard Business Review', url: 'https://hbr.org/2004/06/what-makes-an-effective-executive', mins: 15, note: 'Eight practices. “What needs to be done?” and “Write an action plan” are your Playbook.' },
        { kind: 'Podcast', title: 'The McKinsey Podcast', by: 'McKinsey', url: 'https://www.mckinsey.com/featured-insights/mckinsey-podcast', mins: 30, note: 'Talent, performance and leading change, from the research side.' },
        { kind: 'Podcast', title: 'HBR IdeaCast', by: 'Harvard Business Review', url: 'https://hbr.org/podcasts/ideacast', mins: 30, note: 'A weekly interview with a leading thinker on management and work.' },
        { kind: 'Read', title: 'Human Capital Trends', by: 'Deloitte Insights', url: 'https://www2.deloitte.com/us/en/insights/focus/human-capital-trends.html', mins: 20, note: 'Where talent and work are going, for the Team Development Plan’s year-one line.' },
        { kind: 'Read', title: 'Hiring: use structured interviewing', by: 'Google re:Work', url: 'https://rework.withgoogle.com/intl/en/subjects/hiring', mins: 15, note: 'Why unstructured interviews predict almost nothing, and the four-part structure that does.' },
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
      { who: 'McKinsey', what: 'Talent to value', how: 'Put your strongest people on the work that matters most, and say so. The Team Development Plan names who owns the team goal.' },
      { who: 'Google re:Work, Schmidt and Hunter', what: 'Structured interviews', how: 'The highest-cost decision a manager makes is a hire. Write what good looks like at ninety days before you post. Same questions for every candidate, scored against the same rubric, by two interviewers, plus a work sample. Decide against the rubric, not the room.' }
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
  },

  /* ── Week one role cards, in Spanish. The scenario words come from each area's es block. ── */
  es: {
    w1: {
      manager: { h: 'Si eres el gerente', brief: 'Sam es {role} en {team}. {Slip}. Todavía no has dicho nada. Tienes diez minutos con Sam, y {busy} está cerca. Di lo que notaste, lo que esperas de aquí en adelante y lo que necesitas y para cuándo. Luego pregunta qué se interpone.', frame: 'Marco: lo que noté, lo que espero, lo que necesito y para cuándo.', tips: ['No leas la tarjeta. Dilo como lo dirías tú.', 'Termina con la pregunta que lo arregla, y luego un siguiente paso con fecha.'] },
      sam: { h: 'Si eres Sam', open: 'Empieza con: «Hola. ¿Querías verme? Si es por {work}, ya lo sé. He estado cubriendo a dos personas.» Luego juega limpio: no lo hagas fácil ni imposible.', truth: 'Lo que es cierto para ti: Sam ha estado cubriendo a un compañero ausente y dio por hecho que lo sabías. Nadie le dijo a Sam qué fechas importaban. A Sam le preocupa que esto vaya a Recursos Humanos antes de que alguien pregunte.', tips: ['Si el gerente insinúa, di «bien» y espera.', 'Si el gerente dice lo que notó, lo que espera y pregunta qué se interpone, dile la verdad.'] }
    }
  },

  /* ── Cohort norms, read in the room before anything else. ── */
  norms: [
    { b: 'What is said in the room stays in the room.', t: 'Philosophy sentences, timeline lines, and scores are the person’s own.' },
    { b: 'No live cases by name.', t: 'Describe the situation, not the person. If it is a real case on your team, change the details.' },
    { b: 'Phones out for the activities, away for each other.', t: 'The site runs on your phone. The conversations run on your face.' },
    { b: 'Say the hard thing plainly.', t: 'That is the skill we are practicing. Hinting in here is practice for hinting out there.' },
    { b: 'Some things are never practice cases.', t: 'Leave, injury, accommodation, discrimination, harassment, Title IX: those go to the right office the same day, every time. We route them; we do not rehearse them.' }
  ],

  /* ── Two nudges a week, one question each. Added to the calendar as events from the week page. ── */
  nudges: {
    w1: [ { day: 'Tuesday', q: 'Your Philosophy sentence from the room: have you said it to your team yet? Say it in this week’s meeting.' }, { day: 'Thursday', q: 'The habit you picked in How to lead: where did you use it this week, in one line?' } ],
    w2: [ { day: 'Tuesday', q: 'Which of your 1:1s this week is on the calendar as a recurring hold, and which is still a hope?' }, { day: 'Thursday', q: 'The conversation you framed in three lines: has line one been said out loud yet? If not, what is the sentence?' } ],
    w3: [ { day: 'Tuesday', q: 'Name the decision you are handing over this week and the one boundary. Have you said it to the person yet?' }, { day: 'Thursday', q: 'In your last coaching conversation, how many questions did you ask before your first piece of advice?' } ],
    w4: [ { day: 'Tuesday', q: 'Your Playbook is due at the capstone. Which section is still blank, and what is the one sentence that would fill it?' }, { day: 'Thursday', q: 'Who on your team has been thanked by name this week? If nobody, do it before you leave today.' } ]
  },

  /* ── The leader brief: fifteen minutes with the manager's own leader before week one, and one question a week. ── */
  leader: {
    intro: 'Your manager is joining the Manager Voyage cohort: four weeks of practicing the Vanderbilt Manager Standard with their own team. The research on whether training changes behavior is unambiguous: the single biggest factor is whether the person’s own leader asks about it. This page asks fifteen minutes of you before week one, one question a week, and two hours in week four.',
    before: [
      'Read the four expectations below. They are what your manager is being measured on, and what your manager’s team will be asked about.',
      'Ask your manager which expectation their assessment told them to start with, and which habit they intend to keep for the four weeks.',
      'Tell them the one thing you would most like to see different on their team in ninety days. Keep it to a sentence; they will write it into their Playbook.',
      'Block the week-four capstone in your calendar now. Managers present their Playbook to peers and to you.'
    ],
    weekly: [
      { week: 1, ask: 'What is the sentence your team can expect from you? Say it to me.', why: 'The Philosophy sentence. Hearing it said out loud to you is the first transfer.' },
      { week: 2, ask: 'Which 1:1s are on the calendar now, and which difficult conversation did you hold?', why: 'Expectation 01. If the 1:1s are not recurring holds by Friday, ask again Monday.' },
      { week: 3, ask: 'What decision did you hand over, to whom, with what boundary? Did you take it back?', why: 'Expectation 02. The honest answer to the last question is the one that matters.' },
      { week: 4, ask: 'What will your team be able to do in ninety days that it cannot do today, and who owns it?', why: 'Expectation 04 and the Team Development Plan. You will hear the answer again at the capstone; challenge one date.' }
    ],
    after: 'After the cohort, keep the one question a week for ninety days, until the reassessment. Then ask what moved.'
  },

  /* ── The team's view: the ten statements as a team member would answer them. Anonymous, three or more responses, at Day 0 and Day 90. ── */
  teamCheck: {
    intro: 'The assessment asks managers to rate themselves. The team sees the same ten behaviors from the other side. Ask your team to answer these anonymously before week one and again at the ninety-day reassessment. Three or more responses, or do not read them.',
    scale: ['Rarely', 'Sometimes', 'About half the time', 'Usually', 'Almost always'],
    statements: [
      'My manager writes down our top priorities for the period, with a named owner for each, before the work starts.',
      'My manager tells me what I own, by when, and what a good result looks like, and puts it in writing.',
      'My manager looks at my work while it is in progress, well before it is due, so there is time to help.',
      'When I am under pressure, my manager moves a deadline or a task that same week and checks back with me.',
      'My manager thanks me for specific work, by name, within the week it happened.',
      'Before my manager changes how we work, they ask for my view and it shapes the decision.',
      'When a change is coming, my manager explains the reason in their own words before the official announcement reaches us.',
      'After a large piece of work, my manager holds a short look-back with us: what worked, what did not, what we change.',
      'My manager watches what is coming from the rest of Vanderbilt so we hear it from them first.',
      'When another office asks too much of us, my manager shows the hours, names the conflict, and offers options instead of just saying yes.'
    ],
    indicators: [
      { k: 'oneonones', t: 'My 1:1s are on the calendar as recurring holds for everyone on the team' },
      { k: 'timecards', t: 'Timecards and time off were approved before the deadline every week this month' },
      { k: 'conversation', t: 'I held the difficult conversation I framed in week two' },
      { k: 'handoff', t: 'I handed over a real decision in week three and did not take it back' }
    ]
  },

  /* ── Scenario scripts: who has reviewed them. Shown to facilitators until both say yes. ── */
  review: { sme: false, employeeRelations: false, note: 'The lab scripts and the voice agents are drafts until a subject-matter expert and Employee Relations have read them. Until then, facilitators say so in the room.' },

  /* ── The best manager you ever had: the opener. ── */
  bestManager: { prompt: 'Think about the best manager you ever had. What made them great? Maybe they listened without judgment, gave feedback that actually helped, or believed in you before you believed in yourself.', ask: 'What did they do that stuck with you, and how does it show up in the way you will lead?' },

  /* ── Vanderbilt’s three areas of focus, from the Chancellor’s strategy. ── */
  areasOfFocus: [
    { n: 'Exceptional Core Operations', t: 'With speed, agility and scale, Vanderbilt will distinguish itself with innovative and impactful capabilities to ensure that we have the talent, resources and reputation necessary to deliver on our vision.', team: 'For a team: the work done well, on time, the first time. Expectation 01.' },
    { n: 'Bold Strategic Initiatives', t: 'With exceptional core operations as our fuel, Vanderbilt will pursue increasingly bold initiatives that enable and enhance the reach and impact of our education and research mission.', team: 'For a team: room to try something, and a manager who explains the why. Expectation 03.' },
    { n: 'Industry Leadership', t: 'Through strategic advocacy efforts and modeling the role of an essential research university, Vanderbilt will stimulate industry change and combat existential threats to our education and research mission.', team: 'For a team: knowing how its work connects to the rest of the university, and saying so. Expectation 04.' }
  ],

  /* ── The Leadership Journey Generator: six moments that shape how a person leads. Layered on the timeline. ── */
  lenses: [
    { k: 'success', name: 'Formative success', prompt: 'A win early on that taught you what you were good at.', frame: 'I learned I was good at {x}' },
    { k: 'setback', name: 'Meaningful setback', prompt: 'The failure or loss you still think about, and what it changed.', frame: 'A setback taught me {x}' },
    { k: 'turning', name: 'Turning point', prompt: 'The moment the direction changed, by choice or not.', frame: 'Everything turned when {x}' },
    { k: 'mentor', name: 'Influential mentor', prompt: 'The person whose way of working you still copy.', frame: 'From {x} I took' },
    { k: 'risk', name: 'Pivotal risk', prompt: 'The thing you did that could have gone badly, and did not, or did.', frame: 'I took a risk on {x}' },
    { k: 'transition', name: 'Key transition', prompt: 'The move into managing, or the move that made it possible.', frame: 'The transition that made me a manager was {x}' }
  ],

  /* ── From contributor to manager: the group activity. Groups enter phrases; the page sorts them into the shifts
     and names what the group missed. Keywords are matched loosely and in lower case. ── */
  icm: {
    prompt: 'In small groups: what are the differences between an individual contributor and a manager? Enter every word or phrase your group says, one per line. Then submit for analysis.',
    themes: [
      { k: 'output', name: 'Your success is no longer your own', kw: ['team', 'others', 'through', 'their work', 'results', 'output', 'credit', 'win', 'success', 'deliver', 'accountab', 'responsib'], line: 'As a contributor you win by delivering great work. As a manager you win when your team delivers great work.' },
      { k: 'enable', name: 'From doing to enabling', kw: ['enable', 'support', 'remove', 'obstacle', 'unblock', 'help', 'resource', 'coach', 'develop', 'grow', 'mentor', 'teach', 'empower', 'delegat'], line: 'Less heads-down execution, more removing obstacles, setting direction, and developing people.' },
      { k: 'time', name: 'How you spend your time', kw: ['meeting', 'time', 'conversation', 'decision', 'calendar', 'priorit', 'plan', 'schedule', 'interrupt', 'email', 'approv', 'admin', 'budget'], line: 'Meetings, conversations, and decisions replace tasks and deliverables.' },
      { k: 'letgo', name: 'Letting go', kw: ['let go', 'trust', 'control', 'hands', 'micromanag', 'perfection', 'my way', 'step back', 'patience', 'not doing', 'stop doing'], line: 'The hardest part: letting go, and trusting others to do the work you used to do yourself.' },
      { k: 'people', name: 'The people are the work', kw: ['people', 'feedback', 'hard conversation', 'difficult', 'performance', 'hire', 'hiring', 'fire', 'conflict', 'morale', 'motivat', 'recogni', 'listen', 'emotion', 'care'], line: 'Feedback, expectations, performance, and the hard conversation are now your job, not an interruption to it.' },
      { k: 'direction', name: 'Setting direction', kw: ['direction', 'vision', 'strategy', 'goal', 'why', 'big picture', 'communicat', 'translate', 'represent', 'advocate', 'upward', 'leadership', 'politics', 'stakeholder'], line: 'You explain the why, connect the team to the rest of the university, and speak up for it.' }
    ],
    synthesis: 'Your group identified the shifts that happen when you move from individual contributor to manager. Your success is no longer your own: as a contributor you win by delivering great work, as a manager you win when your team delivers great work. Your focus moves from doing to enabling: less heads-down execution, more removing obstacles, setting direction, and developing people. How you spend your time looks completely different: meetings, conversations, and decisions replace tasks and deliverables. The hardest part is letting go, and trusting others to do the work you used to do yourself.'
  },

  /* ── The Philosophy, framed. ── */
  philosophy: {
    h: 'You have already done the work. Now put it together.',
    t: 'Over the past few hours you thought about the best manager in your life, mapped your own journey, worked out what changes when you become a manager, got honest about where you are strong and where you are growing, and saw the tools that support you. That was all intentional. A philosophy is not invented from scratch; it is drawn from everything you have already lived and learned.',
    what: 'It is not a slogan. It is how you show up: the values that drive your decisions and what your team can count on from you every day. Without it, you react. With it, you lead.'
  },

  /* ── The course survey. Posted to the Power Automate flow when links.surveyFlowUrl is set; otherwise kept locally
     and offered by email. One form for all four weeks; the week is the first question. ── */
  survey: {
    intro: 'A few minutes before you leave. Your answers shape how this cohort runs for every manager who comes after you. They go to the Futures Learning Hub, not to your leader.',
    questions: [
      { k: 'week', t: 'Which session are you rating?', type: 'choice', opts: ['Week 1, in the classroom', 'Week 2, virtual', 'Week 3, virtual', 'Week 4, the capstone'] },
      { k: 'overall', t: 'Overall, how valuable was this session for the way you will manage?', type: 'scale', lo: 'Not valuable', hi: 'Very valuable' },
      { k: 'useful', t: 'Which part was most useful?', type: 'choice', opts: ['The best manager you ever had', 'The mission and areas of focus', 'The timeline and journey', 'Contributor to manager, and the standard', 'How to lead in my area', 'The hard conversation lab', 'The Philosophy and Playbook', 'The core module', 'The SparkWise lab', 'The simulation lab', 'Presenting the Playbook'] },
      { k: 'least', t: 'Which part could go, or needs to change?', type: 'text' },
      { k: 'practice', t: 'How ready do you feel to use what you practiced with your own team this week?', type: 'scale', lo: 'Not ready', hi: 'Ready' },
      { k: 'pace', t: 'The pace was', type: 'choice', opts: ['Too slow', 'About right', 'Too fast'] },
      { k: 'facilitation', t: 'The facilitation', type: 'scale', lo: 'Got in the way', hi: 'Made it work' },
      { k: 'monday', t: 'The one thing you will do with your team on Monday', type: 'text' },
      { k: 'recommend', t: 'Would you tell another manager to join the cohort?', type: 'scale', lo: 'No', hi: 'Yes, today' },
      { k: 'comments', t: 'Anything else', type: 'text' }
    ],
    who: 'Name and email are optional. Leave them blank and the answers are anonymous.'
  }
};
