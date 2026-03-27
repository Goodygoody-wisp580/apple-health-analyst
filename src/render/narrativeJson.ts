import type { NarrativeReport } from "../types.js";

export function renderNarrativeJson(narrative: NarrativeReport): string {
  return `${JSON.stringify(narrative, null, 2)}\n`;
}
