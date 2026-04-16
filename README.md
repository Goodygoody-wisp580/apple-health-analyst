# apple-health-analyst

[![npm version](https://img.shields.io/npm/v/apple-health-analyst)](https://www.npmjs.com/package/apple-health-analyst)
[![npm downloads](https://img.shields.io/npm/dm/apple-health-analyst)](https://www.npmjs.com/package/apple-health-analyst)
[![license](https://img.shields.io/npm/l/apple-health-analyst)](https://github.com/RuochenLyu/apple-health-analyst/blob/main/LICENSE)

[中文文档](https://github.com/RuochenLyu/apple-health-analyst/blob/main/README.zh-CN.md)

Analyze Apple Health export data locally, generating either a health report or a training report with cross-metric reasoning, long-term trends, and offline HTML output.

Not a data dashboard — you can already see the data on your phone. This tool's value is **interpreting your data like a health advisor**: How are sleep and recovery linked? How does schedule regularity affect HRV? Does training load match recovery capacity?

**Samples:** [Health (EN)](https://ruochenlyu.github.io/apple-health-analyst/) · [Training (EN)](https://ruochenlyu.github.io/apple-health-analyst/training.report.html) · [健康报告](https://ruochenlyu.github.io/apple-health-analyst/zh/report.html) · [运动报告](https://ruochenlyu.github.io/apple-health-analyst/zh/training.report.html)

![Sample Report](https://raw.githubusercontent.com/RuochenLyu/apple-health-analyst/main/docs/screenshot-en.png)

## Features

- **Cross-metric correlation analysis** — Sleep-HRV coupling, training-recovery balance, schedule regularity assessment
- **Workout-type trend analysis** — Break out long-term trends for specific workouts like boxing, strength training, or cycling
- **Dedicated training report** — Evaluate training state, readiness, load-vs-recovery balance, and sport-specific trends, powered by **ATL / CTL / TSB** (fitness, fatigue, form) over 12 months of history rather than a 30-day snapshot
- **Behavioral pattern detection** — Weekend warrior, night owl drift, sleep compensation, recovery deficit
- **Composite scoring** — Sleep/Recovery/Activity on a 0-100 scale, transparent and explainable algorithm
- **Bilingual** — Automatically generates Chinese or English reports based on user language
- **Privacy first** — Runs entirely locally, no external APIs, no data uploads
- **Offline HTML report** — Single file with inline CSS + SVG charts, just double-click to open

## Exporting Apple Health Data

1. Open the **Health** app on your iPhone
2. Tap your profile picture (top right)
3. Scroll to the bottom and tap **Export All Health Data**
4. Wait for the export to finish (may take a few minutes for large datasets), then choose **Save to Files** or AirDrop to your computer
5. The resulting `Export.zip` is the input file for this tool

Official exports may contain multiple XML files. The main analysis input is the XML whose root element is `HealthData`; `export_cda.xml` / `ClinicalDocument` is auxiliary only. The main XML filename is not fixed, may be localized (for example `导出.xml`), and some ZIP tools may display that filename as mojibake.

## Quick Start

Install the skill with one command (works with Claude Code, Codex, Cursor, and [40+ agents](https://skills.sh)):

```bash
npx skills add RuochenLyu/apple-health-analyst
```

Then chat with your agent:

```text
Analyze my Apple Health export at /path/to/export.zip
```

**By default you get both reports** — a health report and a training report — rendered into the same `output/` folder and cross-linked via the topbar. If you only want one, say so:

```text
Only generate the health report
Only generate the training report
Focus on my boxing training status  (training-only)
```

The skill activates automatically when you mention Apple Health analysis. You can also invoke it explicitly — `/apple-health-analyst` in Claude Code, or `$apple-health-analyst` in Codex.

The agent automatically completes the full **prepare → LLM narrative → render** pipeline. The two HTMLs (`report.html` and `training.report.html`) are cross-linked via a topbar button, so you can jump between them.

> **Note:** This is an agent skill, not a standalone CLI tool. The `prepare` and `render` steps run locally, but the narrative step requires an LLM — so the full workflow must run inside an AI coding agent.

Skill configuration is at [`.agents/skills/apple-health-analyst/`](https://github.com/RuochenLyu/apple-health-analyst/blob/main/.agents/skills/apple-health-analyst/SKILL.md), including role definition, analysis framework, and narrative schema.

## Metrics Covered

| Module | Metrics |
|--------|---------|
| Sleep | Duration, Deep/REM/Core stage %, Bedtime/Wake time, Regularity |
| Recovery | Resting HR, HRV, Blood Oxygen, Respiratory Rate, VO2 Max |
| Activity | Active Energy, Exercise Minutes, Stand Hours, Workout Records, Per-workout-type trends |
| Body Composition | Weight, Body Fat % |

## CLI

Commands used under the hood by the Codex Skill. Usually no need to run manually.

```bash
# 1. prepare: Parse ZIP, generate structured data (--lang en for English, --lang zh for Chinese)
#    Optional: --top-sports N to cap the training-report sport list (default 5).
npx apple-health-analyst prepare /path/to/Export.zip --lang en --out ./output
# Outputs summary.json + insights.json

# 2. (Codex reads insights.json and generates the matching narrative JSON)

# 3a. render health report (default)
#    Add --with-cross-link when you also plan to render the training report
#    into the same --out directory (it lights up the topbar link). Omit it on
#    single-report runs so the HTML doesn't link to a file you won't generate.
npx apple-health-analyst render \
  --insights ./output/insights.json \
  --narrative ./output/report.llm.json \
  --with-cross-link \
  --out ./output
# Outputs report.html + report.md + report.llm.json

# 3b. render training report
npx apple-health-analyst render \
  --type training \
  --insights ./output/insights.json \
  --narrative ./output/training.report.llm.json \
  --with-cross-link \
  --out ./output
# Outputs training.report.html + training.report.md + training.report.llm.json
```

## Limitations

- Does not provide medical diagnoses or treatment recommendations
- Does not analyze ECG waveforms or GPS routes (counts only)
- Step count and distance are not merged across devices

## Development

```bash
npm run dev -- prepare /path/to/Export.zip --lang en --out ./output  # Dev mode (tsx, no build needed)
npm run build   # Compile
npm test        # Test
```
