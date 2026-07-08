# Demo Performance Report

Generated: 2026-07-08T16:34:30.992Z

Provider: **mock** (DemoLLMProvider — heuristic extraction, no API key required)

| CSV File | Size (KB) | Rows | Time (ms) | Avg Batch (ms) | Tokens | Est. Cost | Success | Imported | Skipped | Warnings |
|----------|-----------|------|-----------|----------------|--------|-----------|---------|----------|---------|----------|
| 01-facebook-leads-standard.csv | 0.5 | 5 | 32 | 10 | 5657 | $0.0057 | 100% | 5 | 0 | 0 |
| 02-facebook-leads-messy-headers.csv | 0.3 | 3 | 6 | 2 | 5056 | $0.0051 | 100% | 3 | 0 | 8 |
| 03-google-ads-leads.csv | 0.4 | 3 | 6 | 3 | 4971 | $0.0050 | 100% | 3 | 0 | 0 |
| 04-google-ads-export-utf8.csv | 0.3 | 3 | 9 | 6 | 5142 | $0.0051 | 100% | 3 | 0 | 6 |
| 05-excel-export.csv | 0.3 | 3 | 7 | 2 | 5143 | $0.0051 | 100% | 3 | 0 | 0 |
| 06-agency-crm-export.csv | 0.5 | 4 | 6 | 2 | 5586 | $0.0056 | 100% | 4 | 0 | 8 |
| 07-real-estate-crm.csv | 0.4 | 3 | 25 | 10 | 5108 | $0.0051 | 100% | 3 | 0 | 6 |
| 08-broken-headers-typos.csv | 0.2 | 3 | 19 | 12 | 4428 | $0.0044 | 0% | 0 | 3 | 5 |
| 09-duplicate-headers.csv | 0.2 | 2 | 35 | 31 | 4684 | $0.0047 | 100% | 2 | 0 | 0 |
| 10-mixed-date-formats.csv | 0.2 | 3 | 10 | 2 | 4958 | $0.0050 | 100% | 3 | 0 | 0 |
| 11-international-names.csv | 0.3 | 4 | 4 | 1 | 5376 | $0.0054 | 100% | 4 | 0 | 0 |
| 12-unicode-emoji.csv | 0.2 | 3 | 4 | 1 | 5006 | $0.0050 | 100% | 3 | 0 | 0 |
| 13-mixed-languages.csv | 0.3 | 3 | 3 | 2 | 4428 | $0.0044 | 0% | 0 | 3 | 5 |
| 14-blank-rows.csv | 0.1 | 3 | 4 | 1 | 4840 | $0.0048 | 67% | 2 | 1 | 3 |
| 15-duplicate-rows.csv | 0.2 | 5 | 3 | 2 | 4995 | $0.0050 | 100% | 3 | 0 | 0 |
| 16-messy-formatting.csv | 0.2 | 3 | 8 | 2 | 4998 | $0.0050 | 100% | 3 | 0 | 0 |
| 17-formula-injection.csv | 0.3 | 5 | 3 | 2 | 5631 | $0.0056 | 100% | 5 | 0 | 0 |
| 18-international-phones.csv | 0.3 | 6 | 4 | 2 | 5952 | $0.0060 | 100% | 6 | 0 | 0 |
| 19-empty-columns.csv | 0.2 | 3 | 4 | 2 | 4958 | $0.0050 | 100% | 3 | 0 | 0 |
| 20-tiny-two-row.csv | 0.0 | 2 | 2 | 1 | 4614 | $0.0046 | 100% | 2 | 0 | 0 |
| 21-tab-separated.csv | 0.1 | 2 | 4 | 1 | 4683 | $0.0047 | 100% | 2 | 0 | 0 |
| 22-trailing-commas.csv | 0.1 | 2 | 9 | 7 | 4683 | $0.0047 | 100% | 2 | 0 | 0 |
| 23-quoted-fields-multiline.csv | 0.1 | 3 | 11 | 1 | 4648 | $0.0046 | 100% | 2 | 0 | 0 |
| 24-salesforce-style.csv | 0.3 | 3 | 4 | 3 | 5194 | $0.0052 | 100% | 3 | 0 | 6 |
| 25-hubspot-export.csv | 0.3 | 3 | 3 | 2 | 5149 | $0.0051 | 100% | 3 | 0 | 6 |
| 26-large-dataset-200-rows.csv | 19.8 | 200 | 184 | 32 | 70984 | $0.0710 | 100% | 200 | 0 | 0 |

## Summary

- **Files tested:** 26
- **Total rows:** 282
- **Total processing time:** 409 ms
- **Total estimated tokens:** 196872
- **Total estimated cost:** $0.1969

> Regenerate: `pnpm demo:report`