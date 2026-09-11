# Oracle integration for the Manager Voyage dashboard

The dashboard (`dashboard/index.html`) personalizes itself from three
sources. Each one is optional; the page works with whatever is present.

## 1. Oracle Learning, through SCORM

Package the dashboard with `bash scripts/build-scorm.sh` and upload the zip
to Oracle Learning as SCORM 1.2 content. When a manager launches it there:

- `assets/js/scorm.js` finds the LMS API and reads the learner's real name
  and id (`cmi.core.student_name`, `cmi.core.student_id`). The welcome card
  and greeting use them. Nothing is typed twice.
- The dashboard stores its own state (work location, start date, opened
  items, self-reported completions) in `cmi.suspend_data`, so it follows the
  manager across devices.
- A self-reported completion is also written as a SCORM interaction
  (`attest-<itemId>`), so Oracle can report on attestations.
- When every required item is complete (state compliance courses plus the
  Manager Responsibilities Course), the SCO reports `completed`.

SCORM does not expose the manager's work location or their completions of
other courses. Those need source 2.

## 2. Oracle HCM, through a profile feed

Set `profileEndpoint` in `assets/js/config.js` to a URL that returns the
signed-in manager's record as JSON. The dashboard calls it on load, on
"Sync with Oracle", and every `profilePollMinutes` while open, with
`credentials: 'include'` so the university's single sign-on cookie rides
along. The endpoint is a small proxy that FLH or VUIT hosts in front of the
Oracle HCM REST API; the browser never holds Oracle credentials.

Response contract:

```json
{
  "name": "Rivera, Alex",
  "id": "riveraa1",
  "state": "TN",
  "startDate": "2026-08-20",
  "completions": {
    "R-015": { "at": "2026-08-28", "source": "oracle" },
    "MRC-F": "2026-08-30"
  }
}
```

- `state` is one of TN, NY, FL, CA (full names are accepted). Derive it from
  the worker's primary assignment location in Oracle HCM
  (`workers` resource, `workRelationships/assignments/locationCode`).
- `startDate` is the date the management assignment began. Day 1 and every
  deadline count from it.
- `completions` is keyed by the ids in `assets/js/program-data.js`
  (`R-001` to `R-020` for compliance, `MRC-F` for the foundation course,
  `M1.1` to `M4.5` for the micro modules). Map them from Oracle Learning's
  `learnerLearningRecords` (completed assignments) by learning item number.
  A value of `true`, a date string, or an object all work.

An Oracle completion always outranks a self-reported one and cannot be
undone from the dashboard.

## 3. Preview parameters

For demos and testing, the URL can set the profile:

```
dashboard/?name=Alex%20Rivera&state=NY&start=2026-08-20
```

The preview bar on the dashboard (shown only when `previewMode` is on and no
Oracle source is present) does the same thing without editing the URL.

## Course links

`assets/js/oracle.js` builds every course link (`MVOracle.courseUrl(item)`),
in this order:

1. `oracleUrl`: a pasted Oracle Learning deep link. The compliance rows use
   the links from the Compliance Training Matrix.
2. `oracleItemId` (+ `oracleItemType`, `ORA_COURSE` or `ORA_CLASS`): the
   Oracle Learning item number. The link is built from
   `MV_CONFIG.oracleRedirect`, which already carries the redirect pattern the
   matrix links use (`.../learner/learn/redirect?learningItemId=...&learningItemType=...`).
   This is the field to fill in when FLH receives the item numbers: one
   number per item in `assets/js/program-data.js`, nothing else changes.
3. `localUrl`: a course hosted on this site (the Foundation course today).
4. `MV_CONFIG.oracleLearningBase` + `oracleCode`, for a code-based catalog URL.

Items with none of these show "Link coming soon".

## Completions written back

`MVOracle.reportCompletion(id, { score, max, passed, note })` records a
completion from a course on this site (the Foundation course calls it when
all thirteen activities are done, with the quick-check score):

- Inside Oracle Learning (SCORM launch): the SCO is marked complete, the
  score is written (`cmi.core.score.*` or `cmi.score.*`), and an interaction
  `attest-<id>` is recorded.
- Outside Oracle Learning with single sign-on: if `MV_CONFIG.completionEndpoint`
  is set, the record is POSTed as JSON (`{ id, at, score, max, passed, extra }`)
  with credentials, for the proxy to write to Oracle Learning.
- Always: a local copy (`localStorage` key `mv.completions.v1`) that the
  dashboard reads, so the Foundation course shows as complete there without
  a feed.

## Survey timing

The Manager Effectiveness Assessment is completed before the Foundation course
and retaken `MV_CONFIG.surveyRetakeMonths` (6) months after completing it.
The course copy states this; the value is here so the dashboard can show
the retake date once a completion date is known.

## Packaging the Foundation course

`bash scripts/build-foundation-scorm.sh` builds a standalone SCORM 1.2 zip of
the Foundation course that includes `config.js` and `oracle.js`, so the same
configuration applies inside Oracle Learning.

Also in `config.js`: `portalUrl` (the Manager Portal), `cohortRequestUrl`
(seat request), and `contactEmail` (footer contact).
