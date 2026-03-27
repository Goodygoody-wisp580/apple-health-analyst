import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderInsightsJson } from "../render/insightsJson.js";
import { renderNarrativeJson } from "../render/narrativeJson.js";
import { renderReportHtml } from "../render/reportHtml.js";
import { renderReportMarkdown } from "../render/reportMarkdown.js";
import { renderSummaryJson } from "../render/summaryJson.js";
import type { AnalysisSummary, InsightBundle, NarrativeReport } from "../types.js";

export async function writePrepareOutputs(
  summary: AnalysisSummary,
  insights: InsightBundle,
  outputDir: string,
): Promise<void> {
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "summary.json"), renderSummaryJson(summary), "utf8");
  await writeFile(path.join(outputDir, "insights.json"), renderInsightsJson(insights), "utf8");
}

export async function writeRenderedOutputs(
  insights: InsightBundle,
  narrative: NarrativeReport,
  outputDir: string,
): Promise<void> {
  await mkdir(outputDir, { recursive: true });

  await writeFile(path.join(outputDir, "report.llm.json"), renderNarrativeJson(narrative), "utf8");
  await writeFile(path.join(outputDir, "report.md"), renderReportMarkdown(insights, narrative), "utf8");
  await writeFile(path.join(outputDir, "report.html"), renderReportHtml(insights, narrative), "utf8");
}
