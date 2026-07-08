# Final Submission — GrowEasy CSV Importer

**Role:** Software Developer (Intern / Full-Time)  
**Company:** [GrowEasy](https://groweasy.ai) · WFH · Immediate joining  
**Deadline:** 12 July 2026  
**Submit to:** varun@groweasy.ai

---

## Which position are you applying for?

| Track | Compensation | Requirements |
|-------|--------------|--------------|
| **Intern** | ₹15,000 – ₹20,000 / month | Full-time internship, **minimum 4 months**. Cannot combine with ongoing academics. |
| **Full-Time** | ₹35,000 – ₹50,000 / month | **Minimum 1 year** post-graduation experience at an organization. |

Pick **one** in your email subject and body. Use the **Ready to Send** email below (Intern) or Option B for Full-Time.

---

## Ready to Send (Intern — copy this)

**To:** varun@groweasy.ai  
**Subject:** Software Developer Intern Assignment — [Your Full Name]

```
Hi Varun,

Please find my submission for the GrowEasy Software Developer Intern assignment.

Position applied for: Software Developer Intern
Work mode: Work From Home — available for immediate joining
Commitment: Full-time internship, minimum 4 months

Live application:
https://groweasy-csv-importer-frontend-two.vercel.app

GitHub repository (public):
https://github.com/shriansh1625/groweasy-csv-importer

Backend API health check:
https://groweasy-api-7o82.onrender.com/api/v1/health

What it does:
AI-powered CSV → CRM importer. Upload messy lead exports (Facebook, Google Ads, Excel, etc.), preview AI column mapping, confirm import, and get structured CRM records with per-field confidence scores.

Tech stack:
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Node.js, Express 5, TypeScript
- AI: OpenRouter (Qwen 2.5 7B) with swappable provider abstraction
- Infra: Vercel (frontend), Render (backend), Docker support included

Quick demo for reviewers (~2 min):
1. Open the live app (first load may take ~30s if API was idle on Render free tier)
2. Upload demo/csvs/01-facebook-leads-standard.csv → 5 leads imported
3. Upload demo/csvs/08-broken-headers-typos.csv → AI maps typo headers (Nmae → Name, Emial → Email)

Reviewer docs in the repo:
- docs/ReviewerGuide.md — evaluation walkthrough
- docs/ASSIGNMENT.md — rubric criteria mapping
- docs/SUBMISSION.md — submission checklist

Local setup: git clone → pnpm install → cp .env.example .env → pnpm dev

Thank you for reviewing my submission. I look forward to hearing from you.

Best regards,
[Your Full Name]
[Your Phone Number]
[LinkedIn URL — optional]
```

---

## Checklist

| Requirement | Status | Link |
|-------------|--------|------|
| Publicly hosted application | Done | https://groweasy-csv-importer-frontend-two.vercel.app |
| Public GitHub repository | Done | https://github.com/shriansh1625/groweasy-csv-importer |
| README with setup instructions | Done | [README.md](../README.md) |
| Position applied for | **Intern** (update if Full-Time) | See email below |

---

## Email Templates

Copy one template, fill in your name, and send to **varun@groweasy.ai**.

### Option A — Intern

```
Subject: Software Developer Intern Assignment — [Your Full Name]

Hi Varun,

Please find my GrowEasy CSV Importer assignment submission below.

Position: Software Developer Intern
Work mode: Work From Home (available for immediate joining)
Commitment: Full-time internship, minimum 4 months

Live Application:
https://groweasy-csv-importer-frontend-two.vercel.app

GitHub Repository:
https://github.com/shriansh1625/groweasy-csv-importer

Backend API (health check):
https://groweasy-api-7o82.onrender.com/api/v1/health

Tech Stack:
- Frontend: Next.js 14, TypeScript, Tailwind
- Backend: Node.js, Express 5, TypeScript
- AI: OpenRouter (Qwen 2.5 7B) with multi-provider abstraction

Suggested Demo Flow (2 minutes):
1. Open the live app
2. Upload demo/csvs/01-facebook-leads-standard.csv (5 clean leads)
3. Review column mapping badges in preview
4. Confirm import → see 5 CRM records with confidence scores
5. Upload demo/csvs/08-broken-headers-typos.csv (messy headers: Nmae, Emial, Phne)

Documentation for reviewers:
- docs/ReviewerGuide.md — quick evaluation path
- docs/ASSIGNMENT.md — rubric criteria mapping

Local setup:
git clone → pnpm install → cp .env.example .env → pnpm dev

Thank you for your time. I look forward to hearing from you.

Best regards,
[Your Full Name]
[Your Phone Number]
[LinkedIn / Portfolio — optional]
```

### Option B — Full-Time

```
Subject: Software Developer Full-Time Assignment — [Your Full Name]

Hi Varun,

Please find my GrowEasy CSV Importer assignment submission below.

Position: Software Developer (Full-Time)
Work mode: Work From Home (available for immediate joining)
Experience: [X years] post-graduation at [Company/Organization]

Live Application:
https://groweasy-csv-importer-frontend-two.vercel.app

GitHub Repository:
https://github.com/shriansh1625/groweasy-csv-importer

Backend API (health check):
https://groweasy-api-7o82.onrender.com/api/v1/health

Tech Stack:
- Frontend: Next.js 14, TypeScript, Tailwind
- Backend: Node.js, Express 5, TypeScript
- AI: OpenRouter (Qwen 2.5 7B) with multi-provider abstraction

Suggested Demo Flow (2 minutes):
1. Open the live app
2. Upload demo/csvs/01-facebook-leads-standard.csv
3. Review column mapping → confirm import → 5 CRM records with confidence scores
4. Upload demo/csvs/08-broken-headers-typos.csv (messy headers)

Documentation for reviewers:
- docs/ReviewerGuide.md
- docs/ASSIGNMENT.md

Thank you for your time. I look forward to hearing from you.

Best regards,
[Your Full Name]
[Your Phone Number]
[LinkedIn / Portfolio — optional]
```

---

## What Reviewers Will Test

### Recommended files (works reliably on production)

| File | Demonstrates |
|------|--------------|
| `demo/csvs/01-facebook-leads-standard.csv` | Clean Facebook leads → 5 records |
| `demo/csvs/08-broken-headers-typos.csv` | AI maps typo headers (Nmae → Name) |

### Avoid in live demo

| File | Why |
|------|-----|
| `26-large-dataset-200-rows.csv` | Free Qwen may fail JSON on large batches — use locally only |

---

## Architecture (One Paragraph for Email)

Upload any CSV → server analyzes headers and maps columns to CRM fields → user confirms → AI extracts records in token-aware batches with live SSE progress → results shown with per-field confidence scores → export as CRM CSV/JSON.

---

## If Reviewer Reports "API Offline"

Render free tier sleeps after 15 min idle. First request takes ~30 seconds. Refresh the page — status should show **Connected**.

UptimeRobot ping (optional): `https://groweasy-api-7o82.onrender.com/api/v1/health` every 5 min.

---

## Before You Hit Send

- [ ] Replace `[Your Full Name]` in email
- [ ] Pick **Intern** or **Full-Time** (see eligibility above)
- [ ] Use the matching email template (Option A or B)
- [ ] Open live app — shows **Connected** (green)
- [ ] GitHub repo is **public** (not private)
- [ ] Do NOT include API keys in email or GitHub
- [ ] Attach screenshots optional (you have working imports from 01 and 08)

Good luck!
