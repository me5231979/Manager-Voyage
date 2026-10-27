# Manager Foundations: the assessment and completion flows

The course records three things with the Futures Learning Hub, all through one
Power Automate flow, and sends the three-month reassessment invitation from a
second, scheduled flow.

| Event | When | What the course sends |
| --- | --- | --- |
| `assessment`, phase `initial` | The learner finishes the ten statements before the course | name, email, date, ten answers, total out of 50, four category averages, feedback lines, the suggested first move |
| `course_complete` | Every activity is done | name, email, date, quiz score, the action picked for the week, the week built |
| `assessment`, phase `retake` | The learner answers the same ten three months later | the same as initial, plus `prior` (the starting score and categories) |

Every record is a JSON object posted to one URL. Samples are in
`docs/completion-flow-sample.json` and `docs/assessment-flow-sample.json`.

## Flow 1: Manager Voyage, record and email

1. Power Automate, **Create**, **Instant cloud flow**, trigger **When an HTTP request is received**.
2. In the trigger, set **Who can trigger the flow** to **Anyone**. Leave the schema empty.
3. Add a **Compose** step named `record` with the expression:
   `json(string(triggerBody()))`
   The course posts as plain text, which avoids a browser preflight. This step turns it back into an object. Every later step reads from `outputs('record')`.
4. Add a **Switch** on `outputs('record')?['event']`.

### Case `assessment`

- **Create item** in a SharePoint list called **Manager Voyage assessments** with these columns:
  Title (name), Email, Phase (`initial` or `retake`), TakenOn (date), Score (number), Max (number),
  GetTheWorkDone, TakeCareOfYourPeople, MakeThingsBetter, ConnectYourTeam (numbers, the four averages),
  Answers (multiple lines of text, store `string(outputs('record')?['answers'])`),
  FirstMove (text), PriorScore (number, retake only), CompletedOn (date, filled by the completion case),
  RetakeInvitedOn (date, filled by Flow 2).
  Category values: `outputs('record')?['categories'][0]?['avg']` through `[3]`.
- **Send an email (V2)** to `outputs('record')?['email']` from the Futures Learning Hub mailbox.
  Subject: `Your Manager Effectiveness Assessment results`.
  Body, using the record:
  - Score: `outputs('record')?['score']` of `outputs('record')?['max']`
  - For each of the four categories: name, average out of 5, and the feedback label and line from
    `outputs('record')?['feedback']` (an array of `{k, label, line}` in the same order).
  - Your first move: `outputs('record')?['move']`
  - When phase is `retake`, add a line per category with the change: current average minus
    `outputs('record')?['prior']?['categories'][i]?['avg']`.

### Case `course_complete`

- **Get items** from the list, filter `Email eq '<email>' and Phase eq 'initial'`, take the first,
  then **Update item** with `CompletedOn` = today.
- **Send an email (V2)** to the learner. Subject: `You finished Manager Foundations`.
  Body: congratulations, quiz score `outputs('record')?['score']` of `outputs('record')?['max']`,
  the one action they chose this week (`outputs('record')?['extra']?['action']` is the index 0 to 3 of
  "Confirm with one person what they own and by when", "Thank one person for one specific thing, by name",
  "Hold one ten-minute look-back", "Have coffee with one person your team depends on"), and a note that the
  reassessment arrives in three months.
- Optional: a second email to the FLH team with the same details.

5. Save. Copy the **HTTP POST URL** from the trigger and send it to the course maintainer. It goes into
   `assets/js/config.js` as `completionEndpoint`. Posts start immediately.

## Flow 2: Manager Voyage, three-month reassessment

1. **Scheduled cloud flow**, once a day, 8:00 Central.
2. **Get items** from **Manager Voyage assessments** with the filter
   `Phase eq 'initial' and CompletedOn le '<today minus 90 days>' and RetakeInvitedOn eq null`.
   The date expression: `formatDateTime(addDays(utcNow(), -90), 'yyyy-MM-dd')`.
3. **Apply to each** item:
   - **Send an email (V2)** to the item's Email. Subject: `Three months on: rate the same ten statements`.
     Body: a short note and this link, which opens the course straight into the retake:
     `https://me5231979.github.io/Manager-Voyage/foundation/?reassess=1`
     (the learner's browser already holds their starting point, and the retake record carries it as `prior`
     for the comparison email in Flow 1).
   - **Update item**: RetakeInvitedOn = today.

## Testing

Post the sample files to the trigger URL with any HTTP tool, or open the course, take the assessment with
a real email, and check the list and the inbox. The course shows the same results on its Your assessment page,
so the email and the page should match.

## Notes

- The trigger URL carries its own signature and is visible in the course's source. Anyone who finds it could post
  a fake record. If that matters, add a `key` field in `config.js` and a Condition at the top of Flow 1 that
  checks `outputs('record')?['key']`.
- When the course runs inside Oracle Learning, the same records are posted, and Oracle also receives its own
  SCORM completion. Nothing changes for the flows.
