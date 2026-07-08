# Demo CSV Files

26 realistic CSV files for testing the GrowEasy CSV Importer. Upload any file through the UI or use them in automated tests.

## Quick Start

```bash
# Start the app (mock mode — no API key needed)
pnpm install
cp .env.example .env
pnpm dev
```

Open http://localhost:3000 and upload any file from `demo/csvs/`.

## Recommended Review Flow (5 minutes)

| Step | File | What it demonstrates |
|------|------|---------------------|
| 1 | `01-facebook-leads-standard.csv` | Clean Facebook Lead Ads export |
| 2 | `08-broken-headers-typos.csv` | Header intelligence (typos, missing fields) |
| 3 | `12-unicode-emoji.csv` | Unicode and emoji handling |
| 4 | `17-formula-injection.csv` | Security — formula injection neutralization |
| 5 | `26-large-dataset-200-rows.csv` | Performance — 200 rows, batching, progress |

## All Files

| File | Category | Rows | Highlights |
|------|----------|------|------------|
| `01-facebook-leads-standard.csv` | Facebook Leads | 5 | Standard Lead Ads columns |
| `02-facebook-leads-messy-headers.csv` | Facebook Leads | 3 | Messy dates, invalid data |
| `03-google-ads-leads.csv` | Google Ads | 3 | GCLID, conversion tracking |
| `04-google-ads-export-utf8.csv` | Google Ads | 3 | International UTF-8 names |
| `05-excel-export.csv` | Excel | 3 | Quoted fields, Excel-style headers |
| `06-agency-crm-export.csv` | Agency CRM | 4 | Lead IDs, owners, CRM statuses |
| `07-real-estate-crm.csv` | Real Estate | 3 | Property, budget, data sources |
| `08-broken-headers-typos.csv` | Messy Headers | 3 | Typos: Nmae, Emial, Phne |
| `09-duplicate-headers.csv` | Messy Headers | 2 | Duplicate column names |
| `10-mixed-date-formats.csv` | Date Formats | 3 | ISO, US, EU date formats |
| `11-international-names.csv` | International | 4 | Vietnamese, French, Russian, Arabic |
| `12-unicode-emoji.csv` | Unicode | 3 | Emoji in names and notes |
| `13-mixed-languages.csv` | International | 3 | Spanish, French, German headers |
| `14-blank-rows.csv` | Messy Data | 3 | Empty rows between data |
| `15-duplicate-rows.csv` | Messy Data | 5 | Exact duplicate records |
| `16-messy-formatting.csv` | Messy Data | 3 | Extra spaces, nested quotes |
| `17-formula-injection.csv` | Security | 5 | =SUM, +, -, @ prefixes |
| `18-international-phones.csv` | International | 6 | US, UK, IN, DE, JP, BR formats |
| `19-empty-columns.csv` | Messy Data | 3 | Sparse trailing columns |
| `20-tiny-two-row.csv` | Edge Case | 2 | Minimal 2-column CSV |
| `21-tab-separated.csv` | Edge Case | 2 | Tab-separated values |
| `22-trailing-commas.csv` | Edge Case | 2 | Trailing comma columns |
| `23-quoted-fields-multiline.csv` | Edge Case | 2 | Multiline quoted addresses |
| `24-salesforce-style.csv` | CRM Export | 3 | Salesforce lead format |
| `25-hubspot-export.csv` | CRM Export | 3 | HubSpot lifecycle stages |
| `26-large-dataset-200-rows.csv` | Performance | 200 | Batch processing stress test |

## Regenerate Files

```bash
pnpm demo:generate
```

## Validate All Files

```bash
pnpm demo:validate
```

## Performance Report

```bash
pnpm demo:report
```

See [`docs/DemoPerformanceReport.md`](../docs/DemoPerformanceReport.md) for latest results.
