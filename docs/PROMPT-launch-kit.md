# Prompt: recreate the launch plan document, site and chat guide for another program

Paste the block below into Claude Code in the repository of the program you are launching. Fill the
bracketed fields first. It reproduces what was built for Manager Voyage: a branded launch plan as a
paged PDF, the same plan as a page on the site, and a text chat guide that answers questions from the
plan. Keep the house rules at the end; they are what make the result read as ours.

---

```
Build a launch plan for [PROGRAM NAME], a program from [ORGANIZATION, e.g. the Futures Learning Hub in
People, Culture and Belonging at Vanderbilt University], as three things from one source:

1. A PDF, Letter landscape, one page per section, in our visual identity.
2. The same plan as a page on our site at /launch/, with a sticky section navigation, fluid sections on
   screen and the paged layout kept for print, and wide figures that scroll sideways on a phone.
3. A text chat guide on that page, named [GUIDE NAME], built as an ElevenLabs conversational agent, that
   answers questions about the launch from the plan itself.

Ground every fact in the repository and the documents I name here, and say so on the page that lists
sources: [LIST THE SOURCES: the program brief, the program data file, the latest stakeholder notes, the
integration docs]. Where a fact is not in those sources, do not invent it: write a bracketed placeholder
such as [Name] or "pulled from [SYSTEM] by [DATE]" and list it on the decisions page.

Dates. The launch date is [LAUNCH DATE]. Every other date hangs on it and moves with it. Work back from it
for the ready, pilot and cascade phases and forward for the launch wave, delivery and measurement. Use real
weekday dates, never "week of".

The plan has these sections, each one page in the PDF:
- Cover, and the plan on one page: the phases with dates, the headline numbers.
- Program overview: the problem in plain words, the answer, the promise in a participant's own voice, and an
  inputs to impact logic model.
- What we are launching: the components and the standard or framework behind them.
- Learning objectives and outcomes: by component, each mapped to the framework, with how we know, and
  outcomes at 30, 60, 90 days and one year.
- Who it is for: the learner personas and the two or three reinforcers (their manager, the HR partner).
- The learner journey, day one to ninety, as a swimlane timeline with every touchpoint numbered.
- The learner journey stage by stage: what they do, feel, the touchpoint, the owner.
- The enrollment funnel, per hundred participants, with where each number comes from.
- The launch timeline as a Gantt with the go, no go gates.
- The communications cascade: who tells whom, in what order, with the rule that every person hears it from a
  person before a system.
- The communications calendar: every message with date, audience, sender, channel, purpose, owner.
- Draft messages, each mocked as a branded email with date, from, to, subject: the leadership brief, the
  business unit leader toolkit, the forwardable note from a participant's manager, the teaser, the launch
  email, the Day 1 automated email with the note to the participant's manager, the nudges, the completion
  email with the next invitation, and any cohort or event welcome.
- The Microsoft Teams channel: channels, membership, tabs, setup dates, norms; and dated Teams posts that
  mirror the cascade.
- The assessment or evaluation data setup: the data flow from the form to the report, the record and who
  sees what, the proposed retention and access rules, the setup checklist with dates, and what
  participants are told at each step.
- Enrollment mechanics: the launch wave and the automated path for new joiners, and the rules.
- Delivery: the calendar, the weekly rhythm, what it takes to run, support, accessibility and reach.
- The pilot: who, what, when, what we measure, exit bar, what we fix, what the pilot does not test.
- Measurement: launch measures and impact measures with targets, sources and cadence.
- What success looks like: a scorecard at three levels (learning, behavior, business) with baseline, year
  one and year two targets, source and cadence; then success in words at ninety days, one year and three
  years, what we will stop seeing, and how the numbers are read.
- Roles as a RACI, and risks with mitigations.
- The next thirty days: decisions needed with dates and owners, and work in flight. Back cover.

Build it like this:
- One HTML source file, docs/launch-plan/index.html, with every section as a fixed 11 by 8.5 inch page for
  print. A Node script with Playwright prints it to docs/[PROGRAM]-Launch-Plan.pdf and reports any page
  whose content runs past the footer, with an option to write one PNG per page for review. Fix every
  overflow before you show me the PDF; look at the PNGs yourself.
- A Python script that builds launch/index.html from that source: asset paths, an id per section, a sticky
  navigation bar with a PDF button, screen CSS layered on top of the print CSS, a wrapper that lets wide
  figures scroll sideways under 760 pixels, and the chat guide. Check desktop and phone widths with
  Playwright for horizontal scroll and console errors.
- A Node script that writes launch/guide-kb.txt, the plan as plain text section by section with a summary
  paragraph at the top, for the guide's knowledge base.
- The guide: an ElevenLabs agent on [LLM, e.g. claude-sonnet-4-5] at temperature 0.3, text only, with the
  knowledge document created from the raw GitHub URL of launch/guide-kb.txt on main with daily auto-sync
  and usage mode prompt, and client overrides allowing text_only. The page starts it with the ElevenLabs
  client SDK over websocket in text-only mode, sends the section the reader is on as a dynamic variable and
  as a contextual update when it changes, and shows a floating Ask button at the bottom right that opens a
  chat panel with four starter questions. The prompt gives the guide its name and role, the plan's facts
  (phases, dates, gates, cascade order, message codes, the Teams setup, the data rules, the success
  measures), the instruction to answer only from the plan and to say plainly what is undecided and who
  decides it, and the house rules below. Put the agent id in the build script argument, never in a prompt
  or commit message.
- A link to /launch/ from the site's home page, a README section naming the three build commands, and one
  commit per step. Send me the PDF when the pages fit.

House rules for every word on the page, in the emails and in the guide:
- Plain spoken English. Short sentences. No em dashes, no en dashes, no exclamation marks, no slogans, no
  jargon. Spell out small numbers in prose. Write dates as "Monday, March 2" or "Mar 2".
- Headings in the serif face with one italic word in gold. Condensed uppercase gold eyebrows and labels.
  Dark pages for the big ideas, cream pages for the working detail. Our lockup on every email mockup.
- Every message carries the dates for its reader and asks for exactly one thing. Sender names are
  bracketed placeholders unless I give you the name.
- Numbers go in tables, not prose. Targets are proposals until signed off, and the page says so.
- Nothing about a named person's situation anywhere. Aggregates only, never a group under ten.
```

---

What to fill in before pasting: the program name, the organization line, the guide's name, the launch
date, the LLM, and the list of source documents. If the program has no cohort, no Teams channel or no
assessment, delete that section from the list rather than asking Claude to invent one.

For the Manager Voyage version, the source is `docs/launch-plan/index.html`, the build commands are
`node scripts/build-launch-plan-pdf.js`, `python3 scripts/build-launch-site.py <agent id>` and
`node scripts/build-launch-kb.js`, and the guide is Beacon.
