# Deployment Guide

Deploy frontend and backend separately, then connect them via environment variables.

## Architecture

```
Vercel (Frontend)  ──HTTPS──▶  Render/Railway (Backend API)
     :443                           :443
```

---

## 1. Deploy Backend (Render — recommended)

### Option A: Blueprint (fastest)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect repo — Render reads `render.yaml`
4. Click **Deploy Blueprint** — no secrets required; app starts with demo LLM
5. Optional: add `OPENROUTER_API_KEY` in **groweasy-api → Environment** to enable free Qwen via OpenRouter
6. Deploy → note URL: `https://groweasy-api.onrender.com`

### Option B: Railway

1. Go to [Railway](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select repo — uses `railway.toml`
3. Set variables: `CORS_ORIGIN`, `LLM_PROVIDER`, API keys
4. Note public URL from Railway dashboard

### Verify backend

```bash
curl https://YOUR-BACKEND-URL/api/v1/health
```

Expected: `{"success":true,"data":{"status":"healthy",...}}`

---

## 2. Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com) → **Add New Project** → import GitHub repo
2. Set **Root Directory** to `apps/frontend`
3. Framework: **Next.js** (auto-detected)
4. Environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND-URL` (no trailing slash) |

5. Deploy → note URL: `https://your-app.vercel.app`

---

## 3. Connect CORS

Update backend `CORS_ORIGIN` on Render/Railway:

```
https://your-app.vercel.app,*.vercel.app
```

This allows production + Vercel preview deployments.

Redeploy backend after changing CORS.

---

## 4. Production Checklist

| Check | How to verify |
|-------|---------------|
| Health | Top nav shows **API Online** (green) |
| Upload | Upload `demo/csvs/01-facebook-leads-standard.csv` |
| SSE progress | Progress bar updates during import |
| Results | CRM records appear with confidence scores |
| Export | Download CRM CSV works |
| CORS | Browser console has no CORS errors |
| Large file | `26-large-dataset-200-rows.csv` completes |

---

## Environment Variables Reference

### Backend (Render/Railway)

| Variable | Required | Example |
|----------|----------|---------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto-set | `4000` |
| `HOST` | Yes | `0.0.0.0` |
| `CORS_ORIGIN` | Yes | `https://groweasy-csv-importer.vercel.app,*.vercel.app` |
| `LLM_PROVIDER` | Yes | `openrouter` |
| `OPENROUTER_API_KEY` | Yes (add in dashboard) | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | Yes | `qwen/qwen-2.5-7b-instruct` |
| `OPENROUTER_BASE_URL` | Yes | `https://openrouter.ai/api/v1` |
| `OPENROUTER_APP_NAME` | No | `Civic Seva` |
| `MAX_UPLOAD_SIZE_MB` | No | `10` |

### Frontend (Vercel)

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | `https://groweasy-api.onrender.com` |

---

## Known Deployment Notes

- **SSE / proxies:** Backend sends heartbeat every 15s and sets `X-Accel-Buffering: no`
- **Timeouts:** Server timeout set to 11 minutes for large imports
- **Cold starts:** Render free tier sleeps after inactivity — first request may take ~30s
- **Upload size:** CSV sent as JSON body — 10MB limit on backend (`MAX_UPLOAD_SIZE_MB`)
- **Mock mode:** Works without API keys — ideal for reviewer demos

---

## Local vs Production

```bash
# Local
NEXT_PUBLIC_API_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000

# Production
NEXT_PUBLIC_API_URL=https://groweasy-api.onrender.com
CORS_ORIGIN=https://groweasy.vercel.app,*.vercel.app
```
