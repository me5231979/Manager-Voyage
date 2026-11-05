# Assessment results page

`results/` is the protected results page for the Manager Effectiveness Assessment:
the baseline before the Foundation course and the reassessment three months on.
Live at https://manager-voyage.vercel.app/results/

The page holds no plain data. `data.enc.json` is the SharePoint list export,
encrypted with AES-256-GCM under a key derived from a passphrase (PBKDF2-SHA256,
300,000 rounds). The browser asks for the passphrase, decrypts in memory and
draws the page. Nothing is sent anywhere. The passphrase is kept for the tab in
session storage and forgotten on Lock or when the tab closes.

## Refresh the data

1. In SharePoint, open the list **Manager Voyage assessments** and choose
   Export to CSV.
2. From the repository root:

   ```
   node scripts/encrypt-assessments.js ~/Downloads/Manager_Voyage_assessments.csv \
     --passphrase "<the team passphrase>" \
     --exclude matthew.estes@vanderbilt.edu,mattestes523@gmail.com
   ```

   `--exclude` drops program staff test records by email. Use the same
   passphrase every time, or a new one and tell the team.
3. Commit `results/data.enc.json` and push to `main`. Vercel publishes it.

The script accepts every column the flow writes (Title, Email, Phase, TakenOn,
Score, Max, the four job averages, FirstMove, PriorScore, CompletedOn,
QuizScore, RetakeInvitedOn) and, when the list has it, Answers. With Answers
present the page adds a section on the ten statements.

## What the page shows

1. **The baseline**: baselines taken, mean score and band, course completions
   with the quick check mean, the lowest job, the four jobs on the 1 to 5
   scale with the band cut points, and where managers start.
2. **The reassessment, three months on**: due now (completed 90 or more days
   ago, not retaken), invited, retakes taken, mean change with real movement
   (5 points or more), each manager's baseline to retake, the funnel, and who
   is due within 30 days.
3. **Every manager**: a sortable, searchable roster with status.
