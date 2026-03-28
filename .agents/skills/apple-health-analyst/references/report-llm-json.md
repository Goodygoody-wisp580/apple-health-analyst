# `report.llm.json` Schema v2

`report.llm.json` is the sole input for the narrative. `render` validates its fields before generating `report.md` and `report.html`.

## Required Structure
```json
{
  "schema_version": "2.0.0",
  "health_assessment": "string",
  "cross_metric_insights": ["string"],
  "behavioral_patterns": ["string"],
  "overview": "string",
  "key_findings": ["string"],
  "strengths": ["string"],
  "watchouts": ["string"],
  "actions_next_2_weeks": ["string"],
  "when_to_seek_care": ["string"],
  "questions_for_doctor": ["string"],
  "data_limitations": ["string"],
  "chart_callouts": [
    {
      "chart_id": "sleep | recovery | activity | bodyComposition | menstrualCycle",
      "title": "string",
      "summary": "string"
    }
  ],
  "disclaimer": "string"
}
```

## v2 Fields

### `health_assessment` (Comprehensive Health Assessment)
1-2 paragraphs, like a clinician's "impression" note:
- Integrated judgment of current health status (combining scores and cross-metric signals)
- Identify primary concerns (rather than listing data)
- Provide overall directional guidance

### `cross_metric_insights` (Cross-Metric Correlation Analysis)
2-4 items, each must correlate two or more metrics:
- Format: "Metric A + Metric B → health implication + specific data"
- Example: "On nights with < 6 hours of sleep, next-day HRV dropped 12% on average, indicating the autonomic nervous system is sensitive to sleep deprivation."
- Source: `crossMetric` field in `insights.json`

### `behavioral_patterns` (Behavioral Pattern Recognition)
1-3 items describing detected behavioral patterns:
- Format: "Pattern name + data evidence + health impact + adjustment advice"
- Source: `crossMetric.patterns` in `insights.json`

### `questions_for_doctor` (Doctor Visit Preparation)
1-3 data-driven questions for the user's next appointment:
- Must be based on the user's actual data, not generic questions
- Include specific values, e.g., "My resting heart rate increased from 58 to 63 bpm — should I get further evaluation?"
- Help users communicate more efficiently with their doctor
- Source: `crossMetric`, `riskFlags`, `notableChanges` in `insights.json`

## Writing Requirements
- **Language**: Match the language specified by `narrativeContext.language` in `insights.json` (Chinese or English).
- Each array must contain at least 1 item. Keep it concise; prioritize actionable advice for general users.
- `chart_callouts` must cover existing chart IDs; do not use unknown IDs.
- You may reorder priorities but must not contradict structured facts in `summary.json` / `insights.json`.
- When explaining trends, prioritize combining `crossMetric` cross-metric analysis with `historicalContext` multi-time-window context.
- Professional health management interpretations are encouraged (recovery load, schedule stability, training-weight consistency), but do not cross into diagnosis.
- **`key_findings` must cite cross-metric evidence** — do not report single-metric changes in isolation.
- **`actions_next_2_weeks` must specify time, frequency, or numeric targets** for each item.

## Recommended Style
- `health_assessment`: 1-2 paragraphs. Integrated judgment + primary concerns + overall direction. This is the report's core value.
- `cross_metric_insights`: 2-4 items. Causal-chain cross-metric interpretations.
- `behavioral_patterns`: 1-3 items. Pattern + impact + advice.
- `overview`: 1 paragraph. Summarize current priorities and overall direction.
- `key_findings`: 2-4 items. Prioritize "recent vs. long-term" key changes and health implications.
- `strengths`: 1-3 items. Trends that are improving.
- `watchouts`: 1-4 items. The most noteworthy risks and concerns.
- `actions_next_2_weeks`: 2-4 items. Specific, actionable, short-cycle recommendations.
- `when_to_seek_care`: 1-3 items. Conservative reminders, no diagnoses.
- `questions_for_doctor`: 1-3 items. Data-driven appointment questions with specific values.
- `data_limitations`: 1-4 items. Note sparse samples, unstable sources, limited coverage, etc.
- `disclaimer`: Standard boundary statement — "health management reference, not a medical diagnosis."
