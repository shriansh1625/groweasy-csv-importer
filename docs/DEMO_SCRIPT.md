# 2-Minute Demo Recording Script

Record a screen capture (Loom, OBS, or Windows Game Bar) following this script. Target: **under 2 minutes**.

---

## Setup (before recording)

1. Deploy app OR run locally with `pnpm dev`
2. Open the app in browser (full screen, 1920×1080 if possible)
3. Have `demo/csvs/01-facebook-leads-standard.csv` ready
4. Close unrelated tabs and notifications
5. Use light mode (or dark — just be consistent)

---

## Script (≈90 seconds)

| Time | Action | Say (optional voiceover) |
|------|--------|--------------------------|
| 0:00 | Show landing page | "GrowEasy CSV Importer — AI-powered CSV to CRM extraction." |
| 0:10 | Point to API Online badge | "Backend is live and connected." |
| 0:15 | Drag `01-facebook-leads-standard.csv` onto upload zone | "Upload any CSV — Facebook leads, Google Ads, Excel exports." |
| 0:25 | Show preview table — scroll, search | "Preview and inspect data before importing." |
| 0:35 | Click **Start AI Import** | "One click starts the AI extraction pipeline." |
| 0:40 | Show progress panel — batch counter, rows processed | "Live progress via server-sent events — batches, throughput, cost estimate." |
| 0:55 | Results dashboard appears | "Import complete — metrics at a glance." |
| 1:05 | Scroll CRM data grid — point to confidence badges | "Every field has a confidence score. Low confidence is flagged, not guessed." |
| 1:15 | Click **crm-csv** export button | "Export to CRM-ready CSV, JSON, or warnings report." |
| 1:25 | Upload `demo/csvs/real-world/horrible-headers-mixed.csv` | "It handles messy real-world data — emoji headers, Hindi columns, typos." |
| 1:45 | Show second import results | "Production-grade pipeline, not a localhost demo." |
| 1:55 | End on README or GitHub repo | "Full source, tests, and deployment docs in the repo." |

---

## Tips

- **Keep cursor movement smooth** — don't rush clicks
- **Show the progress panel** — it's the "wow" moment
- **Upload 2 files** — clean + messy proves robustness
- Save as `demo-recording.mp4` and add to repo or link in README

---

## Where to host the recording

- Upload to Loom/YouTube (unlisted)
- Add link to README: `## Demo Video` section
- Or attach MP4 to GitHub release
