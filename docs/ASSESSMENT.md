# Manager Effectiveness Assessment

Ten behavior statements, one five-point frequency scale, four sub-scales that
map to the four jobs of a manager in the Foundation course (after Gary Yukl's
taxonomy of task, relations, change, and external leadership behaviors).
Taken before the Foundation course and again six months later. Results go to
the manager by email, generated from the score.

## Scale

One scale for every item. Stem shown once at the top of the form:

> **Think about a typical month in your role. How often do you do each of the following?**

| Value | Anchor | Meaning shown to the respondent |
|---|---|---|
| 1 | Never | I do not do this |
| 2 | Rarely | Less than once a month |
| 3 | Sometimes | About once a month |
| 4 | Often | Most weeks |
| 5 | Almost always | Every week, without being reminded |

Anchors carry a time meaning so two managers reading "often" score the same
behavior the same way. All items are worded as first-person, present-tense
behaviors, positively keyed, so a higher number always means more of the habit.

## Items

Order on the form is as listed. The job label is not shown to the respondent.

| # | Job | Habit | Statement |
|---|---|---|---|
| 1 | 1 Get the work done | Planning | I write down my team's top three priorities for the coming period, with a named owner for each, before the work starts. |
| 2 | 1 Get the work done | Clarifying | I tell each person what they own, by when, and what a good result looks like, and I put it in writing. |
| 3 | 1 Get the work done | Monitoring | I look at work while it is still in progress, well before the due date, so there is time to help. |
| 4 | 2 Take care of your people | Supporting | When I see someone under pressure, I move a deadline or a task that same week and check back with them. |
| 5 | 2 Take care of your people | Recognizing | I thank a person for a specific piece of work, by name, within the same week it happened. |
| 6 | 2 Take care of your people | Empowering | I ask my team for their view before I decide, and I let their answer change the decision. |
| 7 | 3 Make things better | Advocating change | When a change is coming, I explain the reason to my team in my own words before the official announcement reaches them. |
| 8 | 3 Make things better | Collective learning | After a large piece of work, I hold a short look-back with the team: what worked, what did not, what we change. |
| 9 | 4 Connect your team | External monitoring | I watch what is coming from the rest of Vanderbilt, such as cycles, deadlines, and system changes, so my team hears it from me first. |
| 10 | 4 Connect your team | Representing | When a request from another office would overload my team, I show the hours, name the conflict, and offer two options rather than a flat yes or no. |

Three items per sub-scale for Jobs 1 and 2, two each for Jobs 3 and 4. Job 2
loses the "developing" habit at ten items; it returns if the form grows to
twelve.

## Scoring

- **Total score**: sum of the ten items, 10 to 50.
- **Sub-scale score**: mean of that job's items, 1.0 to 5.0. Means, not sums,
  so a two-item job and a three-item job compare on the same footing.
- **Priority job**: the sub-scale with the lowest mean. Tie-break: the job that
  contains the single lowest item; if still tied, the earlier job in the list
  (Job 1 before Job 2, and so on), because the course teaches them in that order.
- **Change at six months**: retake total minus baseline total, and the same per
  sub-scale.

### Bands

Bands are set on the mean item score so total and sub-scale bands agree.

| Band | Mean item score | Total score | What it means |
|---|---|---|---|
| Building | 1.0 to 2.5 | 10 to 25 | The habit is not yet part of the month. Start with one habit, once, on purpose. |
| Practicing | 2.6 to 3.8 | 26 to 38 | The habit happens, but not every week. The gap is consistency. |
| Consistent | 3.9 to 5.0 | 39 to 50 | The habit is weekly. The work now is depth and teaching it to others. |

Within a sub-scale the same cut points apply to the mean: Building up to 2.5,
Practicing 2.6 to 3.8, Consistent 3.9 and above.

### Reading the retake

A change of **5 points or more** on the total, or **0.7 or more** on a
sub-scale mean, is treated as real movement. Below that, the result is
reported as "about the same," since self-ratings drift by a point or two
between sittings without any change in behavior. These thresholds are
provisional and are recalculated from the first fifty paired responses (see
the psychometric notes).

## Psychometric notes

- **Construct.** Four behavior categories from Yukl's hierarchical taxonomy
  (task, relations, change, external), operationalised as the fifteen habits
  the Foundation course teaches, of which ten are sampled here. Content
  validity rests on that mapping; every item names a behavior a manager can do
  in a week, not a trait or an attitude.
- **Item format.** Behavioral frequency rather than agreement. Frequency
  anchors with time meanings reduce two known problems with agreement scales:
  acquiescence (agreeing with everything) and a mid-point that means
  "no opinion." All items are positively keyed. No reverse-scored items,
  because reversed behaviors ("I never look at work before it is due") are
  confusing to rate on a frequency scale and Microsoft Forms cannot recode them
  without a flow step. Watch the acquiescence risk instead by checking the
  spread of responses in the pilot.
- **Self-report.** This is a self-assessment. Expect scores to sit above what
  a direct report would give. It is used as a direction for the individual
  and for the order of the micro modules, not as a performance measure, and
  the email says so.
- **Reliability.** Target Cronbach's alpha of 0.70 or higher for the ten-item
  total. Sub-scales of two and three items will show lower alpha by
  construction; report them as indicative and lean on the total for any
  cohort comparison. Compute alpha and item-total correlations after the
  first fifty responses; drop or reword any item with an item-total
  correlation below 0.30.
- **Test-retest.** The six-month retake is designed to detect change, not to
  establish stability, so a low retest correlation is not a defect. The
  "real movement" thresholds above are placeholders for one half of the
  standard deviation of baseline totals, to be set from the pilot data.
- **Ceiling.** Managers who rate every item 5 at baseline get a Consistent
  email that points them to the depth habits and the cohort. If more than a
  fifth of baseline totals are 45 or above, revisit the anchors.
- **Length and reading.** Ten items, about four minutes. Statements are
  written at a plain reading level with no acronyms except PCB, which the
  course defines.
- **Fairness.** Every item applies to any team at Vanderbilt: an office,
  a dining hall, a lab, a grounds crew, a residence hall. The pilot should
  include managers from at least three of those settings.

## The results email

Sent on submission. One flow, four decisions: the band from the total, the
priority job from the sub-scale means, one habit to start this week from
that job's lowest item, and whether this is a baseline or a retake.

### Merge fields

```
{{FirstName}}  {{Total}}  {{Band}}
{{Job1Mean}} {{Job2Mean}} {{Job3Mean}} {{Job4Mean}}
{{PriorityJob}} {{PriorityJobName}}  {{LowestItemHabit}}  {{ThisWeek}}
{{Sitting}}  (Baseline | Retake)   {{Change}}  (retake only, signed)
```

### Subject lines

- Baseline: `Your Manager Effectiveness Assessment: {{Total}} of 50, start with {{PriorityJobName}}`
- Retake: `Your six-month retake: {{Total}} of 50, {{ChangeWord}} since your baseline`

`ChangeWord` is "up {{Change}}" for a rise of 5 or more, "down {{Change}}" for
a fall of 5 or more, and "about the same" otherwise.

### Body, baseline

> Hello {{FirstName}},
>
> Thank you for taking the Manager Effectiveness Assessment. Your score is
> **{{Total}} out of 50**. That places you in the **{{Band}}** band.
>
> {{BandParagraph}}
>
> **Your four jobs**
> Get the work done: {{Job1Mean}} of 5
> Take care of your people: {{Job2Mean}} of 5
> Make things better: {{Job3Mean}} of 5
> Connect your team: {{Job4Mean}} of 5
>
> **Where to start: {{PriorityJobName}}.** {{PriorityParagraph}}
>
> **This week:** {{ThisWeek}}
>
> Keep this email. The Foundation course asks you to review it on the
> assessment page, and it orders your micro modules from this job first.
> You will take the assessment again in six months, and the aim is a higher
> number then. This is a self-assessment, so it is a direction, not a grade.
>
> Manager Voyage · Futures Learning Hub · People, Culture and Belonging

### Body, retake

Same as baseline with the first paragraph replaced:

> Six months ago your score was {{BaselineTotal}}. Today it is
> **{{Total}} out of 50**, {{ChangeSentence}} You are in the **{{Band}}**
> band.

`ChangeSentence`: "up {{Change}} points, which is real movement." / "down
{{Change}} points; a fall this size is worth a conversation with your
manager or Engagement Consultant." / "about the same, which is common; the
habits below are where the next change comes from."

### Band paragraphs

- **Building.** "Most of these habits are not yet part of your month, which
  is normal in a first year. The course will show you what each one looks
  like on an ordinary Tuesday. Pick one, do it once on purpose this week, and
  notice what happens."
- **Practicing.** "You do most of these habits, but not every week. The gap
  between a good month and a good year is consistency. The course will help
  you turn the ones you do sometimes into ones you do without thinking."
- **Consistent.** "These habits are weekly for you. The course will still be
  worth thirty-five minutes for the Vanderbilt specifics, who handles what,
  and the four jobs as one picture. After it, the four-week cohort is where
  managers at this level get the most."

### Priority paragraphs, one per job

- **Job 1, Get the work done.** "Your lowest scores are in planning, saying
  what good looks like, and checking work before it is due. When these slip,
  work arrives late or gets redone and you find out on the deadline. The
  Foundation course covers all three on the Job 1 page, and the Systems track
  of micro modules follows."
- **Job 2, Take care of your people.** "Your lowest scores are in noticing
  pressure, thanking people for specific work, and asking the team before you
  decide. People stay, and do their best work, for a manager who notices them.
  The Job 2 page of the Foundation course and the People track follow."
- **Job 3, Make things better.** "Your lowest scores are in explaining the
  why before an announcement lands and looking back after big work. These are
  the habits that turn a team from enduring change to running it. The Job 3
  page of the Foundation course covers both."
- **Job 4, Connect your team.** "Your lowest scores are in watching what is
  coming from the rest of Vanderbilt and speaking up for your team with facts
  and options. New managers do this job least, because nobody told them it
  was part of the job. The Job 4 page of the Foundation course covers it."

### This-week lines, one per item (chosen from the lowest item in the priority job)

| Item | This week |
|---|---|
| 1 | Write your team's three priorities before you open your inbox on Monday, and tell the team. |
| 2 | Pick one person and confirm, out loud and then in writing, what they own and by when. |
| 3 | In one one-on-one, ask to see where the work stands before it is due. |
| 4 | Ask one person who looks stretched what you can move this week, then move it. |
| 5 | Thank one person for one specific thing, by name, before Friday. |
| 6 | Before your next decision, ask the team first and let the answer change it. |
| 7 | Take the next change to your own team meeting first and say why in your own words. |
| 8 | After the next big piece of work, hold a ten-minute look-back. |
| 9 | Read next month's calendar and tell the team one thing that is coming. |
| 10 | The next time a request would overload the team, show the hours and offer two options. |

## Building it in Microsoft Forms and Power Automate

1. Form: one section, the stem as the description, ten Likert rows with the
   five anchors in the order above. Collect name and email from the signed-in
   account. Add a hidden or final question "Is this your baseline or your
   six-month retake?" with two choices.
2. Flow, on new response: read the ten values as numbers. Total = sum.
   Job means = (Q1+Q2+Q3)/3, (Q4+Q5+Q6)/3, (Q7+Q8)/2, (Q9+Q10)/2, rounded to
   one decimal. Band from the total with the cut points above. Priority job =
   lowest mean with the tie-break. Lowest item within that job picks the
   this-week line.
3. For a retake, look up the same email's baseline row in the response list
   or a SharePoint list, compute the change, and use the retake body.
4. Send the email from the FLH mailbox with the merge fields filled. Store
   total, four means, band, priority job, and sitting in a list so alpha and
   the change thresholds can be computed after fifty responses.
