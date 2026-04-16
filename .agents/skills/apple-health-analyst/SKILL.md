---
name: apple-health-analyst
description: Analyze Apple Health export ZIP. Run local prepare to generate structured insights, then produce either a health report or a training report with long-term context.
---

# Apple Health Advisor

Use this skill when a user wants to analyze an Apple Health export ZIP. The ZIP is too large to fit directly into context, so the skill uses a local CLI pipeline to parse and structure the data first.

This is one skill that ships two complementary reports:

- **Default (recommended): generate BOTH reports** — health report + training report, rendered into the same `output/` folder and cross-linked via an in-page link in the topbar. `prepare` runs once, then `render` runs twice.
- **Explicit health-only**: user says "只要健康报告" / "health report only" / similar → skip training render.
- **Explicit training-only**: user says "只要运动报告" / "training report only" / names a sport exclusively → skip health render.

## Language Detection

Detect the user's language from their message:

- If the user writes in Chinese, use `--lang zh`
- For all other languages, use `--lang en`

The narrative language must match the language declared in `insights.json`:

- Health report: `narrativeContext.language`
- Training report: `training.narrativeContext.language`

## Intent Routing

**Default: generate both health + training reports.** Only drop one when the user is explicit.

- Default (both) examples:
  - `Analyze my Apple Health export`
  - `帮我分析 Apple Health 导出`
  - `Generate a report from my Apple Health export`
- Health-only examples (skip training render):
  - `Only generate the health report`
  - `只要健康报告`
  - `不用生成运动报告`
- Training-only examples (skip health render):
  - `Only generate the training report`
  - `只要运动报告`
  - `重点分析拳击训练状态`  (user is only asking about a specific sport)
  - `分析跑步和骑行训练趋势`

Ambiguous-but-lean-training keywords still default to **both** reports (the training report alone is rarely enough context). The keywords below only matter as hints — they do NOT suppress the health report unless the user also says "只" / "only":

- `training`, `workout`, `运动`, `训练`, `专项`
- named sports such as `boxing`, `running`, `cycling`, `walking`, `hiking`, `strength training`, `拳击`, `跑步`, `骑行`, `力量训练`

## Your Role

Two roles share the same pipeline:

1. Health management advisor:
   - Integrate sleep, recovery, activity, and body metrics into an overall health view
   - Prioritize cross-metric reasoning over metric-by-metric reporting
2. Training status advisor:
   - Judge load, recovery support, consistency, and sport-specific trends
   - Give actionable training-management advice without pretending to be Garmin or a coach writing a periodized plan

## Workflow

1. Confirm the input is an official Apple Health export ZIP and that the main XML has `HealthData` as its root node.
2. Run local `prepare` once with the correct `--lang`, producing `summary.json` and `insights.json`.
3. Read `summary.json`, then `insights.json`.
4. Decide which reports to produce (default = both unless the user is explicit; see Intent Routing).
5. For each selected report, write the narrative JSON:
   - health: `report.llm.json`
   - training: `training.report.llm.json`
6. Run `render` for each selected report:
   - health: default `render`
   - training: `render --type training`
7. Both HTML reports share the same `output/` folder. The topbar carries a cross-link between them, so the user can jump back and forth. File names are fixed (`report.html` ↔ `training.report.html`) — do not rename.

## `insights.json` Keys You Must Use

### Shared

| Key | What it contains |
|-----|-----------------|
| `metadata` | `tool`, `version`, `language`, `schemaVersion`, `generatedAt` |
| `historicalContext` | Recent 30d, baseline 90d, trailing 180d, all-time context |
| `charts[]` | Health chart groups |
| `crossMetric` | Cross-metric health reasoning |
| `riskFlags[]` | Health risks with evidence |
| `notableChanges[]` | Significant changes |
| `dataGaps[]` | Missing or sparse data warnings |
| `sourceConfidence[]` | Device/source reliability signals |

### Health report

| Key | What it contains |
|-----|-----------------|
| `analysis.sleep` | Sleep duration, stages, timing, regularity |
| `analysis.recovery` | RHR, HRV, blood oxygen, respiratory rate, VO2 max |
| `analysis.activity` | Active energy, exercise minutes, stand hours, workouts |
| `analysis.bodyComposition` | Weight, body fat % |
| `analysis.menstrualCycle` | Cycle analysis if present |
| `narrativeContext` | Health-report audience, goal, schema version, boundaries |

### Training report

| Key | What it contains |
|-----|-----------------|
| `training.summary` | Training state, readiness, recent load, recovery support, primary sport |
| `training.summary.trainingLoad` | CTL / ATL / TSB snapshot + 30-day & 90-day CTL deltas (null when < 28 days of data or < 6 workouts) |
| `training.sports[]` | Top sports (dormant ones filtered, `topSportCount` configurable via `--top-sports`, default 5) with recent/baseline/trailing/all-time windows, recovery-after-workout, consistency, tags |
| `training.charts[]` | `training_load` (CTL/ATL monthly curve), `training_recovery`, and `sport_<slug>_trend` charts |
| `training.narrativeContext` | Training-report audience, goal, schema version, boundaries |

## Commands

Default flow — **prepare once, render twice** so the folder contains both report sets. Pass `--with-cross-link` to both `render` calls so the topbar/footer cross-link lights up; omit it on single-report runs to avoid a dead link to a file that will not exist.

```bash
# 1. Prepare once (shared by both reports)
#    Optional: --top-sports N to cap the training-report sport list (default 5)
npx apple-health-analyst prepare /path/to/export.zip --lang en --out ./output

# 2. Health render (fixed file name: report.html)
npx apple-health-analyst render \
  --insights ./output/insights.json \
  --narrative ./output/report.llm.json \
  --with-cross-link \
  --out ./output

# 3. Training render (fixed file name: training.report.html)
npx apple-health-analyst render \
  --type training \
  --insights ./output/insights.json \
  --narrative ./output/training.report.llm.json \
  --with-cross-link \
  --out ./output
```

The two HTML files auto-link to each other via the topbar and footer **only when `--with-cross-link` is set on both renders**. Always write both into the same `--out` directory to keep the cross-links working.

**Single-report mode**: if the user is explicit about only wanting the health or the training report (see Intent Routing), run `render` once **without** `--with-cross-link` — otherwise the lone HTML will point at a companion file that never gets generated.

## Health Narrative Framework

Use the existing health schema in [references/report-llm-json.md](references/report-llm-json.md).

Prioritize:

1. `crossMetric.compositeAssessment`
2. `crossMetric.sleepRecoveryLink`
3. `crossMetric.sleepConsistency`
4. `crossMetric.activityRecoveryBalance`
5. `crossMetric.recoveryCoherence`
6. `crossMetric.patterns`
7. `riskFlags` and `notableChanges`

Health writing rules:

- Every conclusion must cite concrete values or dates from `summary.json` or `insights.json`
- `key_findings` must be cross-metric, not single-metric trivia
- `actions_next_2_weeks` must specify time, frequency, or numeric targets
- `questions_for_doctor` must be data-driven and specific

## Training Narrative Framework

Use the training schema in [references/training-report-llm-json.md](references/training-report-llm-json.md).

Prioritize:

1. `training.summary.trainingState` and `training.summary.readiness`
2. `training.summary.trainingLoad` — the CTL / ATL / TSB snapshot (**primary load signal**)
3. `training.summary.loadTrend` and `training.summary.recoverySupport` (legacy 30d-vs-90d views, use as corroboration)
4. `training.sports[]` in descending importance
5. `training.charts[]`
6. `dataGaps[]` and missing metric coverage

Training writing rules:

- Use neutral wording inspired by public training-status concepts (CTL / ATL / TSB), not branded Garmin claims
- When `training.summary.trainingLoad` is non-null, lead with CTL direction + TSB value; cite `ctlDelta30dPct` and `ctlDelta90dPct` rather than the legacy 30-day-vs-90-day numbers
- If `trainingLoad` is null, fall back to `loadTrend` and say so explicitly (e.g. "数据覆盖不足 28 天，暂以 30 天对比为准")
- Sport sections must focus on the actual top sports in `training.sports[]`
- Only discuss heart rate or distance when the structured data includes those metrics
- Recommendations are for training management and health monitoring, not race plans or diagnosis

## Required Reading Before Writing Narrative

- `summary.json`
- `insights.json`
- [references/report-llm-json.md](references/report-llm-json.md) for health mode
- [references/training-report-llm-json.md](references/training-report-llm-json.md) for training mode
- [references/safety-boundaries.md](references/safety-boundaries.md)
- [references/analysis-framework.md](references/analysis-framework.md)

## Constraints

- Only reference facts from `summary.json` and `insights.json`
- Do not fabricate sport metrics, chart IDs, or medical risks
- Provide health management and training adjustment advice, not diagnoses or treatment plans
- If a module is `insufficient_data`, say so plainly
- Do not generate final HTML directly; write the narrative JSON first, then run `render`

## Error Handling

- ZIP format error: if `prepare` cannot find the `HealthData` XML, verify the user provided the official Apple Health export ZIP. The main XML filename is not fixed and may be localized (for example `导出.xml`) or appear as mojibake. `export_cda.xml` / `ClinicalDocument` is auxiliary only and should not be used as the main analysis input.
- Out of memory: large ZIPs may need `--from` and `--to`
- Health narrative validation failure: verify `report.llm.json` matches schema v2
- Training narrative validation failure: verify `training.report.llm.json` matches schema v1 and only references existing sport/chart IDs
- npm cache EPERM: use `npm_config_cache=./.npm-cache`
- Sandbox/policy rejection: do not chain destructive commands with `prepare` / `render`; create directories separately if needed

## Output Files

Always produced by `prepare`:

- `summary.json`
- `insights.json`

Health render (file names are fixed; do not rename):

- `report.llm.json`
- `report.md`
- `report.html`

Training render (file names are fixed; do not rename):

- `training.report.llm.json`
- `training.report.md`
- `training.report.html`

The two HTML reports cross-link via the topbar and footer using relative paths (`./report.html` ↔ `./training.report.html`). Keep both in the same `output/` directory for the links to work.
