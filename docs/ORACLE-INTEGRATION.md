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

Every item carries `oracleUrl`, the Oracle Learning deep link. The
compliance rows use the links from the Compliance Training Matrix
(`.../learner/learn/redirect?learningItemId=...`). Items with `oracleUrl:
null` show "Link coming soon" until FLH provides the link; drop it into
`assets/js/program-data.js`. If Oracle exposes a stable URL pattern by item
number, set `oracleLearningBase` in `config.js` and every item with an
`oracleCode` links automatically.

Also in `config.js`: `portalUrl` (the Manager Portal), `cohortRequestUrl`
(seat request), and `contactEmail` (footer contact).
