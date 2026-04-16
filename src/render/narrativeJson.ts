import type { NarrativeReport, TrainingNarrativeReport } from "../types.js";

export function renderNarrativeJson(
  narrative: NarrativeReport | TrainingNarrativeReport,
): string {
  return `${JSON.stringify(narrative, null, 2)}\n`;
}
