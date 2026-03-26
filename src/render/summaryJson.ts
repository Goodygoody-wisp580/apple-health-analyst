import type { AnalysisSummary } from "../types.js";

export function renderSummaryJson(summary: AnalysisSummary): string {
  return `${JSON.stringify(summary, null, 2)}\n`;
}
