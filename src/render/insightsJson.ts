import type { InsightBundle } from "../types.js";

export function renderInsightsJson(insights: InsightBundle): string {
  return `${JSON.stringify(insights, null, 2)}\n`;
}
