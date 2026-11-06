# Manager Voyage Operations Portal

`ops/` is the hub for launching and running cohorts and the program launch itself:
https://manager-voyage.vercel.app/ops/

What it holds, per cohort: the details (name, number, quarter, the four dates, room,
virtual link, facilitators, business unit leader, unit, capacity, notes), the roster
(name, email, unit, manager's manager, seat status, Foundations and assessment done),
the launch checklist with dates worked back from week one, the dated communications
for that cohort, document links, and a log. Program-wide: the launch checklist from the
launch plan with every date worked from the launch date, a calendar of everything
dated across cohorts, and settings.

"New cohort" asks for a name and the week one date, proposes the other three
Wednesdays, and creates the checklist, the communications schedule and the empty
roster from the templates in `ops/app.js` (`COHORT_CHECKLIST`, `COHORT_COMMS`).
Edit the templates there when the rhythm changes; existing cohorts keep their own
copies.

## Where the data lives

The portal stores everything in the browser (`localStorage`, key `mv-ops-v1`) and
works with no server. Export writes a JSON file; Import reads one back, so a copy can
be moved between people or kept as a backup. Print on a cohort page prints the cohort
sheet.

For one shared copy across the team, set a sync endpoint in Settings. The portal then
posts the whole store after every change and pulls it on load, the same way the course
talks to the assessment flow. Two Power Automate flows and one SharePoint list:

1. SharePoint list **Manager Voyage ops** with columns Title (text, always `store`),
   Data (multiple lines of text, plain), SavedAt (date and time), SavedBy (text).
2. Flow **Manager Voyage ops, save**: instant cloud flow, trigger *When an HTTP request
   is received*, anyone can trigger. Compose `record` = `json(string(triggerBody()))`.
   Condition: `outputs('record')?['key']` equals the shared key you chose. If yes:
   *Get items* filtered `Title eq 'store'`; if one exists *Update item*, else *Create
   item*, with Data = `string(outputs('record')?['data'])`, SavedAt = utcNow(),
   SavedBy = `outputs('record')?['by']`. The trigger URL is the **Save URL**.
3. Flow **Manager Voyage ops, load**: trigger *When an HTTP request is received*,
   method GET, anyone can trigger. Condition on the `key` query parameter
   (`triggerOutputs()['queries']['key']`). If yes: *Get items* filtered
   `Title eq 'store'`, then *Response* with status 200, header
   `Content-Type: application/json` and `Access-Control-Allow-Origin: *`, body
   `{ "at": "<SavedAt>", "data": <Data> }`. The trigger URL is the **Load URL**.

In Settings, paste the Save URL, the Load URL and the key. The portal keeps working
locally if either call fails, and tells you in the footer when the last sync happened.
Anyone with the key can read and write the store, so treat the key like a password and
keep the URLs out of email.
