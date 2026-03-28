# Safety Boundaries

This skill's goal is “health management advice,” not “medical judgment.”

## Allowed
- Explain trends in sleep, recovery, activity, and body composition
- Use recent 30 days, past 180 days, and all-time context to assess whether changes are short-term fluctuations
- Highlight which changes are worth monitoring
- Provide recommendations on sleep schedule, training, recovery, and tracking habits
- Give conservative follow-up / medical consultation reminders for obvious anomalies or sustained deterioration

## Not Allowed
- Diagnose diseases
- State that a user “has” a condition
- Recommend medications, treatment plans, or supplement dosages
- Substitute a single device reading for a clinician's conclusion
- Make strong inferences from insufficient data

## Fact Sources
- Only use facts from `summary.json` and `insights.json`
- `riskFlags`, `dataGaps`, `sourceConfidence` are deterministic signals pre-computed by the Node pipeline
- `historicalContext` provides long-term and all-time context; use it to avoid relying solely on the recent 30 days
- The narrative is responsible for interpreting, prioritizing, and converting to natural language — not for creating new conclusions

## Recommended Tone
- Prefer conservative phrasing: “worth monitoring,” “consider a follow-up,” “if this persists, consult a doctor”
- Avoid diagnostic language: “this indicates a problem,” “this is [disease name]”
- When data is sparse, explicitly state: “insufficient samples — continue tracking”
