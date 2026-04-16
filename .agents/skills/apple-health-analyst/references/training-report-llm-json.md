# `training.report.llm.json` Schema v1

`training.report.llm.json` is the sole narrative input for training mode. `render --type training` validates it before generating `training.report.md` and `training.report.html`.

## Required Structure

```json
{
  "schema_version": "1.0.0",
  "training_assessment": "string",
  "overall_findings": ["string"],
  "sport_sections": [
    {
      "sport_id": "string",
      "title": "string",
      "assessment": "string",
      "key_signals": ["string"],
      "recommendations": ["string"]
    }
  ],
  "watchouts": ["string"],
  "actions_next_2_weeks": ["string"],
  "questions_for_doctor": ["string"],
  "data_limitations": ["string"],
  "chart_callouts": [
    {
      "chart_id": "training_load | training_recovery | sport_<slug>_trend",
      "title": "string",
      "summary": "string"
    }
  ],
  "disclaimer": "string"
}
```

## Field Intent

### `training_assessment`

1 short paragraph that synthesizes:

- current `trainingState`
- `readiness`
- **ATL / CTL / TSB snapshot** from `training.summary.trainingLoad` — prefer
  these over coarse "30 day vs 90 day" phrases when available. Express it as
  "日常训练量 (CTL) / 最近一周疲劳 (ATL) / 新鲜度 (TSB)" in Chinese or
  "Fitness (CTL) / Fatigue (ATL) / Form (TSB)" in English
- whether recovery supports the recent load
- the main sport or the lack of a stable primary sport

### `overall_findings`

2-4 items covering the most important load, recovery, and consistency observations:

- lead with CTL and TSB direction (e.g. "近 30 天 CTL 提高 xx%，TSB 维持在 +x，说明…")
- cite the 30-day / 90-day CTL deltas in `training.summary.trainingLoad.ctlDelta30dPct`
  and `ctlDelta90dPct` rather than the legacy `loadTrend.recent30dEquivDurationMinutes`
- mention concrete values when possible
- prefer multi-signal reasoning over isolated facts
- if `trainingLoad` is `null` (e.g. < 28 days of coverage or < 6 workouts),
  fall back to the legacy 30d-vs-90d signals but say so explicitly

### `sport_sections`

One item per sport in `training.sports[]`. Do not invent sections for sports that are not present.

- `sport_id` must exactly match `training.sports[].id`
- `title` should be sport-specific and short
- `assessment` should summarize the current direction of that sport
- `key_signals` should cite actual structured evidence
- `recommendations` should be specific, short-horizon training-management actions

### `chart_callouts`

- only reference chart IDs that already exist in `training.charts[]`
- summarize what the chart means, not what it visually looks like
- prefer long-term direction and load/recovery interaction over single-session commentary
- for `training_load` (CTL / ATL curve) explicitly relate CTL direction to TSB:
  e.g. "CTL 持续上升、TSB 回落到 -10 左右，处于建设期" or "CTL 过去 90 天基本持平，
  TSB 在 +5 附近，是维持期"

## Writing Requirements

- Match the language declared in `training.narrativeContext.language`
- Use neutral wording inspired by public training-status concepts, not brand claims
- Do not infer hidden metrics; if a sport has no heart rate or distance output, do not describe those metrics
- Focus on training management, recovery monitoring, and health-awareness advice
- Keep advice specific and time-bounded
- `questions_for_doctor` should only appear when the data supports a medically relevant follow-up

## Recommended Style

- `training_assessment`: 1 paragraph
- `overall_findings`: 2-4 items
- `sport_sections`: 0-4 sections, matching actual top sports
- `watchouts`: 1-4 items
- `actions_next_2_weeks`: 2-4 items
- `questions_for_doctor`: 0-3 items
- `data_limitations`: 1-4 items
- `disclaimer`: standard boundary statement such as "training-management reference, not medical diagnosis"
