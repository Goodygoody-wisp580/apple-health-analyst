---
name: apple-health-analyst
description: Analyze Apple Health export ZIP files locally, choose primary sources per metric, and generate JSON, Markdown, and HTML reports for sleep, recovery, activity, and body composition.
---

# Apple Health Analyst

Use this skill when the user wants to analyze an Apple Health export ZIP, especially when the export contains multiple devices or apps.

## Workflow
1. Confirm the input is an Apple Health export ZIP.
2. Run the CLI with a local output directory.
3. Read `summary.json` first for structured facts.
4. Use `report.md` when the user wants a concise written summary.
5. Call out missing data and warnings explicitly.

## Command
```bash
npm run dev -- analyze /path/to/export.zip --from YYYY-MM-DD --to YYYY-MM-DD --format markdown,json,html --out ./output
```

## Guardrails
- Treat Apple Health exports as full-history exports unless the user supplies `--from` and `--to`.
- Do not merge sources manually outside the CLI output; rely on the selected primary sources in `summary.json`.
- Report trends and warnings, not diagnoses.
- If a module is marked `insufficient_data`, say so plainly and stop there.

## Outputs
- `summary.json`: source selection, coverage, warnings, and metric summaries
- `report.md`: concise report
- `report.html`: shareable report
