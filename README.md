# apple-health-analyst

Local Apple Health export analysis for Apple Health ZIP files.

## What It Does
- Reads the official Apple Health export ZIP without unpacking it to your working directory
- Chooses primary sources per metric instead of blindly merging all devices
- Generates `summary.json`, `report.md`, and `report.html`
- Works as a standalone CLI and as a Codex skill

## Privacy
- Runs locally
- Does not require a server
- Does not upload health data unless you choose to share the generated files elsewhere

## Quick Start
```bash
npm install
npm run build
node dist/cli.js analyze /path/to/导出.zip --out ./output
```

Development mode:
```bash
npm run dev -- analyze /path/to/导出.zip --from 2026-01-01 --to 2026-03-26 --out ./output
```

## CLI
```bash
apple-health-analyst analyze <export.zip> \
  --from YYYY-MM-DD \
  --to YYYY-MM-DD \
  --format markdown,json,html \
  --out <dir>
```

Notes:
- Apple Health exports are full-history exports; use `--from` and `--to` to focus analysis
- The tool ignores `export_cda.xml` and detects the main Health XML even when its filename is garbled
- Before publishing, use `node dist/cli.js ...` or `npm run dev -- ...`

## Outputs
- `summary.json`: stable machine-readable summary
- `report.md`: concise human-readable report
- `report.html`: shareable HTML report

## Supported Data
- Sleep
- Resting heart rate
- HRV
- Blood oxygen
- Respiratory rate
- VO2 max
- Body mass
- Body fat percentage
- Activity summaries
- Workouts

Attachment handling in v1:
- ECG CSV files: counted only
- Workout route GPX files: counted only
- Image attachments: counted only

## Limits
- Does not generate a single health score
- Does not diagnose medical conditions
- Does not deeply analyze ECG waveforms or GPS routes in v1
- Step and distance data are intentionally not merged into a high-confidence score across devices

## Skill Usage
This repo root is also the skill root. In Codex, use:

```text
Use $apple-health-analyst to analyze my Apple Health export ZIP and summarize sleep, recovery, activity, and body composition.
```

## Development
```bash
npm run build
npm test
```
