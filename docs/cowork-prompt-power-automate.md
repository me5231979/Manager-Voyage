Build the Manager Voyage assessment and completion automation in Power Automate and SharePoint, in my browser, and hand me back the trigger URL at the end.

CONTEXT
The Manager Foundations course at https://me5231979.github.io/Manager-Voyage/foundation/ posts JSON records to one HTTP URL. There are three kinds of record, told apart by the "event" and "phase" fields:
- event "assessment", phase "initial": the learner's starting assessment (ten statements, score out of 50, four category averages).
- event "course_complete": the learner finished the course.
- event "assessment", phase "retake": the same ten statements three months later, with "prior" holding the starting scores.
Every record already contains a finished branded HTML email in "emailHtml" and its subject in "emailSubject". The flows store the record and send that email. Nothing has to be designed.
Sample records to test with: https://github.com/me5231979/Manager-Voyage/blob/main/docs/assessment-flow-sample.json and https://github.com/me5231979/Manager-Voyage/blob/main/docs/completion-flow-sample.json (use the Raw view to copy them).
The full written guide is at https://github.com/me5231979/Manager-Voyage/blob/main/docs/power-automate-flows.md. Follow this prompt; use the guide if something is unclear.

PART 1: SHAREPOINT LIST
Open my SharePoint site for People, Culture and Belonging (ask me which site if more than one looks right). Create a list named "Manager Voyage assessments" with these columns, exactly these names:
- Title (the default column; we store the learner's name in it)
- Email (single line of text)
- Phase (choice: initial, retake)
- TakenOn (date only)
- Score (number)
- Max (number)
- GetTheWorkDone (number, one decimal)
- TakeCareOfYourPeople (number, one decimal)
- MakeThingsBetter (number, one decimal)
- ConnectYourTeam (number, one decimal)
- FirstMove (single line of text)
- Answers (multiple lines of text, plain)
- PriorScore (number)
- CompletedOn (date only)
- QuizScore (number)
- RetakeInvitedOn (date only)

PART 2: FLOW 1, "Manager Voyage: record and email"
In Power Automate, create an Instant cloud flow with the trigger "When an HTTP request is received".
1. In the trigger, set "Who can trigger the flow" to Anyone. Leave the schema empty.
2. Add a Compose action named "record" with this expression: json(string(triggerBody()))
   (The course posts the body as plain text to avoid a browser preflight. This turns it back into JSON. Every later step reads from outputs('record').)
3. Add a Switch on the expression outputs('record')?['event'].

Case "assessment":
a. SharePoint "Create item" in "Manager Voyage assessments":
   Title = outputs('record')?['name']
   Email = outputs('record')?['email']
   Phase = outputs('record')?['phase']
   TakenOn = formatDateTime(outputs('record')?['at'], 'yyyy-MM-dd')
   Score = outputs('record')?['score']
   Max = outputs('record')?['max']
   GetTheWorkDone = outputs('record')?['categories'][0]?['avg']
   TakeCareOfYourPeople = outputs('record')?['categories'][1]?['avg']
   MakeThingsBetter = outputs('record')?['categories'][2]?['avg']
   ConnectYourTeam = outputs('record')?['categories'][3]?['avg']
   FirstMove = outputs('record')?['move']
   Answers = string(outputs('record')?['answers'])
   PriorScore = outputs('record')?['prior']?['score']   (empty on the initial)
b. Office 365 Outlook "Send an email (V2)":
   To = outputs('record')?['email']
   Subject = outputs('record')?['emailSubject']
   Body = outputs('record')?['emailHtml']   (switch the body editor to code view with the </> icon before inserting, so the HTML is not escaped)
   From (send as) = the People, Culture and Belonging shared mailbox, if I have send-as rights on it; otherwise leave it as me and tell me.

Case "course_complete":
a. SharePoint "Get items" from the list with Filter Query:
   Email eq 'outputs('record')?['email']' and Phase eq 'initial'
   Top count 1, order by TakenOn desc.
b. Condition: length(body('Get_items')?['value']) is greater than 0.
   If yes: SharePoint "Update item" on the first item (ID = first(body('Get_items')?['value'])?['ID']):
   CompletedOn = formatDateTime(outputs('record')?['at'], 'yyyy-MM-dd')
   QuizScore = outputs('record')?['score']
   If no: SharePoint "Create item" with Title, Email, Phase = initial, CompletedOn and QuizScore as above, so a learner who skipped the assessment still gets a row.
c. "Send an email (V2)" to outputs('record')?['email'], Subject = outputs('record')?['emailSubject'], Body = outputs('record')?['emailHtml'] (code view).
d. Optional: a second "Send an email (V2)" to the Futures Learning Hub team address (ask me for it) with subject "Manager Foundations completed: " + name, and a one-line body with name, email, date, quiz score.

Default case: do nothing.

4. Save the flow. Copy the HTTP POST URL from the trigger and show it to me in full. I will put it into the course.
5. Test: use the two sample records. Post each one to the URL (the flow's Test with manual trigger works, or use any HTTP client with Content-Type text/plain and the sample as the body). Confirm a row appears in the list and the email arrives, with the branded layout intact. Then post the assessment sample again with "phase": "retake" and a "prior" object copied from the sample's categories to confirm the retake path.

PART 3: FLOW 2, "Manager Voyage: three-month reassessment"
Create a Scheduled cloud flow, daily at 8:00 AM Central Time.
1. SharePoint "Get items" from "Manager Voyage assessments" with Filter Query:
   Phase eq 'initial' and CompletedOn le 'formatDateTime(addDays(utcNow(), -90), 'yyyy-MM-dd')' and RetakeInvitedOn eq null
2. Apply to each item:
   a. "Send an email (V2)" to items('Apply_to_each')?['Email'], from the same mailbox as Flow 1.
      Subject: Three months on: rate the same ten statements
      Body (HTML, code view):
      <p>Hi items('Apply_to_each')?['Title'],</p>
      <p>Three months ago you finished Manager Foundations and set your starting point on the Manager Effectiveness Assessment. Rate the same ten statements again and see what moved. It takes five minutes.</p>
      <p><a href="https://me5231979.github.io/Manager-Voyage/foundation/?reassess=1">Rate the ten statements again</a></p>
      <p>Answer for how you work now, not how you want to. Your results come straight back, beside your starting point.</p>
      <p>People, Culture and Belonging, Vanderbilt University</p>
   b. SharePoint "Update item" on the same item: RetakeInvitedOn = utcNow() formatted 'yyyy-MM-dd'.
3. Save. Run a test by temporarily setting one row's CompletedOn to 91 days ago, running the flow, and checking the email and the RetakeInvitedOn date. Reset the row afterward.

WHAT TO HAND BACK
- The HTTP POST URL of Flow 1.
- The SharePoint list URL.
- Which mailbox the emails send from.
- Anything you could not do and why.
Do not change the existing Microsoft Form or the flow attached to it. Ask me before any step that sends email to anyone other than me during testing; use my own address for every test.
