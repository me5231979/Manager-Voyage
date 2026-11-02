# Yukl coverage audit

Does the program cover Gary Yukl's taxonomy of effective leadership behavior
(Yukl, *Academy of Management Perspectives* 26(4), 2012: four categories,
fifteen behaviors)? This audit checks every behavior against four questions:
is it taught, is it practiced in the Foundation course, is it practiced in the
four-week cohort, and is it measured by the assessment. Audited 2 November 2026
against the code on the main branch.

## The short answer

- **Taxonomy fidelity: exact.** The four expectations are Yukl's four
  categories and the fifteen flip cards are his fifteen behaviors, in his
  grouping. Every behavior has a definition, a Stop and Do pair, a narrated
  clip, and a "do this week" action in the Foundation course
  (`foundation/index.html`, `foundation/narration-scripts.js`).
- **Taught: 15 of 15.**
- **Practiced somewhere (Foundation or cohort): 11 of 15.** Four behaviors are
  taught and never practiced: Problem solving, Encouraging innovation,
  Networking, External monitoring.
- **Measured: 10 of 15.** Five behaviors have no assessment statement:
  Problem solving, Developing, Envisioning change, Encouraging innovation,
  Networking. The sampling is disclosed on the Standard page and in
  `assets/js/config.js`, so this is a known design choice, not an error.
- **Category balance in the cohort is uneven.** Of the five live simulation
  labs, two are task-oriented, two relations-oriented, one external, and none
  change-oriented. Week 1 is labeled expectation 03 (Make things better) but
  its lab practices expectation 01.
- **One defect.** Four category drills (24 scored situations, one set per
  expectation) are written in `foundation/app.js` but never mounted in
  `foundation/index.html`, so they do not render. They are the cheapest fix
  for most of the practice gaps below.

## The matrix

Foundation practice means an activity that scores the learner: a live voice
lab, a Your call conversation, or a drill. Cohort practice means a lab,
segment, sort item, nudge, or Playbook field that asks the manager to do the
behavior. Measured means an assessment statement.

| # | Behavior | Taught (Foundation) | Practiced in Foundation | Practiced in cohort | Measured |
|---|---|---|---|---|---|
| 1 | Planning | Flip card, clip, Do this week | Sam live lab (rocks first, owners and dates) | Week 2 three goals per person; Week 4 team goal for the quarter; Playbook 2 | Statement 1 |
| 2 | Clarifying | Flip card, clip | Priya live lab (what good looks like); Dev live lab | Week 1 Sam lab; Week 2 Dev lab; pulse question 1 | Statement 2 |
| 3 | Monitoring | Flip card, clip | Your call: Priya and the report | Week 2 1:1 cadence; Dev lab; sort items (due Friday, late timecards) | Statement 3 |
| 4 | Problem solving | Flip card, clip | None rendered (task drill items 4 and 5 exist but the drill is not mounted) | Sort item "handoff broke twice"; duty "look back, what broke twice". No lab, no Playbook field | None |
| 5 | Supporting | Flip card, clip | Your call: Marcus; Jordan bad-news lab | Week 1 Sam lab asks what is in the way; sort items (shift swap, work from home) | Statement 4 |
| 6 | Developing | Flip card, clip | None | Week 3 Priya lab (ask where she wants to be); Playbook 3 growth line per person; Week 4 Marcus lab (growth move now) | None |
| 7 | Recognizing | Flip card, clip, Do this week | None | Week 3 objective; Week 4 Thursday nudge; sort item "nobody thanked"; duty | Statement 5 |
| 8 | Empowering | Flip card, clip | None | Week 3 Priya lab (hand over a decision with one boundary); SparkWise delegation lab; pulse question 3; delegation ladder | Statement 6 |
| 9 | Advocating change | Flip card, clip | Alex live lab; Your call: Taylor | Sort item only ("system arrives in six weeks") | Statement 7 |
| 10 | Envisioning change | Flip card, clip | None | Week 1 timeline Year one stop; Philosophy sentence; Week 4 team goal | None |
| 11 | Encouraging innovation | Flip card, clip | None | None | None |
| 12 | Facilitating collective learning | Flip card, clip, Do this week | None | Week 4 recap (the manager's own look-back, not the team's); duty "look back, fifteen minutes"; sort item | Statement 8 |
| 13 | Networking | Flip card, clip, Do this week | None | Sort item "not met the person in Finance"; duty "budget check with your finance partner" | None |
| 14 | External monitoring | Flip card, clip | None | Duty "check the team's compliance completion". Nothing else | Statement 9 |
| 15 | Representing | Flip card, clip | Your call: Director Reyes | Week 4 Jordan lab; sort item | Statement 10 |

## By category

| Expectation | Yukl category | Behaviors practiced out loud | Assessment statements | Cohort minutes by segment label |
|---|---|---|---|---|
| 01 Get the work done | Task-oriented | Planning, Clarifying, Monitoring (Problem solving not practiced) | 3 | 160 |
| 02 Take care of your people | Relations-oriented | Supporting, Developing, Empowering (Recognizing by nudge only) | 3 | 170 |
| 03 Make things better | Change-oriented | Advocating change (Foundation only) | 2 | 60 |
| 04 Connect your team | External | Representing | 2 | 80, of which 20 is the Jordan lab |

The cohort assigns one expectation per week (Week 1: 03, Week 2: 01, Week 3:
02, Week 4: 04). The content under those labels does not match in two places.
Week 1's forty-minute lab is a task conversation with Sam. Week 4's practice
round is Marcus (relations) then Jordan (external); the recap, presentation
and close carry the external label but are reflection and presentation, not
external behavior.

## Where the gaps bite

1. **Change-oriented is the thinnest category and the one the program's own
   framing leans on most.** The deck and the Foundation course say Vanderbilt
   is asking every team to move faster and improve. The cohort has no
   change-oriented lab, no Playbook field for a look-back or a trial, and one
   sort item each for advocating and collective learning. Encouraging
   innovation appears nowhere outside its flip card.
2. **Developing is unmeasured but is the center of Week 3.** The 90-day
   reassessment reuses the same ten statements (`reassess/reassess.js`), so
   the behavior Week 3 is built around cannot show movement. Empowering, its
   partner in Week 3, is measured.
3. **External monitoring is measured but never practiced.** A manager can be
   scored low on statement 9 and find nothing in either course that has them
   read a calendar or name what is coming.
4. **Networking is taught, has a weekly action, and then stops.** No nudge,
   no Playbook field, no lab asks the manager to name the people the team
   depends on.
5. **The Foundation quiz does not test the behaviors.** One of five questions
   covers the standard, and it asks for the four category names. No question
   asks the learner to recognize a behavior in a situation.

## Recommended fixes, in order of cost

None of these are applied. They are listed so the decision stays yours.

1. **Mount the four category drills.** The content is written and scored:
   `DRILLS.task`, `.relations`, `.change`, `.external` in `foundation/app.js`,
   three items each selected by `DRILL_PICK`. Add a `[data-drill]` mount to
   each expectation pane and these become practiced in the Foundation course:
   Problem solving, Recognizing, Empowering, Envisioning change, Encouraging
   innovation, Collective learning, Networking, External monitoring. Widen
   `DRILL_PICK` to all six items per set so every behavior gets a situation.
   If the drills were cut on purpose, delete the dead code instead.
2. **Give Week 1 or Week 4 a change-oriented round.** The Taylor and Alex
   agents already exist in the Foundation course and are scored on explain the
   why, say what it fixes, ask what worries you, carry it back. Reusing one in
   Week 1 would make the week's label true. Alternatively, turn the Week 4
   recap into a facilitated look-back in fours (what worked, what did not,
   what changes, written down), which practices collective learning as a team
   behavior rather than a personal one.
3. **Add three Playbook fields.** Section 3: one two-week trial a team member
   is running (Encouraging innovation). Section 4: the three people outside
   the team the manager depends on, by name, and when they last spoke
   (Networking). Section 4: what lands on the team next quarter and when the
   team will hear it (External monitoring). Each is one line and one nudge.
4. **Add a sort item for each of the six behaviors that have none:** Planning,
   Clarifying, Empowering, Envisioning change, Encouraging innovation,
   External monitoring. The Week 1 sort currently covers nine of fifteen.
5. **Decide the assessment's coverage on purpose.** Either keep ten statements
   and say so where the score is shown (it is already said on the Standard
   page), or extend to fifteen so every behavior has one statement and the
   reassessment can show movement on Developing. Fifteen is one more screen
   on the form. The Microsoft Form and its flow are yours to change; the code
   reads statement count from `assets/js/config.js`.
6. **Add four quiz questions, one per expectation,** each a situation that
   asks which behavior it is. The drill items are already written in that
   form.

## Sources checked

- `foundation/index.html` lines 1440 to 1535: the Standard page, four panes,
  fifteen flip cards plus one campus-network card that is not a Yukl behavior
  and is labeled as such.
- `foundation/narration-scripts.js`: keys task/c1 to c4, relations/c1 to c4,
  change/c1 to c4, external/c1 to c3.
- `foundation/app.js`: `LIVE` (ten voice labs), `SCENARIOS` and `CALL_SETS`
  (four Your call conversations), `DRILLS` and `DRILL_PICK`, `QUIZ`.
- `assets/js/config.js`: `standard`, `assessmentStatements`,
  `statementBehaviors`, `standardSource`.
- `cohort/program.js`: `standard`, `weeks` with segments, objectives and
  outcomes, `labs` w1 to w4x with checks, `sortItems`, `nudges`, `pulse`,
  `duties`, `frameworks`.
- `docs/ASSESSMENT.md`: the ten-item map.
