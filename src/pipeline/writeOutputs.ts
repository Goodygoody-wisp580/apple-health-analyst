import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Translations } from "../i18n/index.js";
import { renderInsightsJson } from "../render/insightsJson.js";
import { renderNarrativeJson } from "../render/narrativeJson.js";
import { renderReportHtml } from "../render/reportHtml.js";
import { renderReportMarkdown } from "../render/reportMarkdown.js";
import { renderSummaryJson } from "../render/summaryJson.js";
import { renderTrainingReportHtml } from "../render/trainingReportHtml.js";
import { renderTrainingReportMarkdown } from "../render/trainingReportMarkdown.js";
import type {
  AnalysisSummary,
  InsightBundle,
  NarrativeReport,
  ReportType,
  TrainingNarrativeReport,
} from "../types.js";

export async function writePrepareOutputs(
  summary: AnalysisSummary,
  insights: InsightBundle,
  outputDir: string,
): Promise<void> {
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "summary.json"), renderSummaryJson(summary), "utf8");
  await writeFile(path.join(outputDir, "insights.json"), renderInsightsJson(insights), "utf8");
}

export interface WriteRenderedOutputsOptions {
  /**
   * When true, the rendered HTML includes a cross-link to the other report
   * (health → training, or training → health). The skill sets this only when
   * both reports are being produced into the same output directory.
   */
  includeCrossLink?: boolean;
}

export async function writeRenderedOutputs(
  reportType: ReportType,
  insights: InsightBundle,
  narrative: NarrativeReport | TrainingNarrativeReport,
  outputDir: string,
  t: Translations,
  options: WriteRenderedOutputsOptions = {},
): Promise<void> {
  await mkdir(outputDir, { recursive: true });
  const includeCrossLink = options.includeCrossLink === true;

  if (reportType === "training") {
    const trainingNarrative = narrative as TrainingNarrativeReport;
    await writeFile(
      path.join(outputDir, "training.report.llm.json"),
      renderNarrativeJson(trainingNarrative),
      "utf8",
    );
    await writeFile(
      path.join(outputDir, "training.report.md"),
      renderTrainingReportMarkdown(insights, trainingNarrative, t.trainingRender),
      "utf8",
    );
    await writeFile(
      path.join(outputDir, "training.report.html"),
      renderTrainingReportHtml(insights, trainingNarrative, t.trainingRender, { includeCrossLink }),
      "utf8",
    );
    return;
  }

  const healthNarrative = narrative as NarrativeReport;
  await writeFile(path.join(outputDir, "report.llm.json"), renderNarrativeJson(healthNarrative), "utf8");
  await writeFile(path.join(outputDir, "report.md"), renderReportMarkdown(insights, healthNarrative, t.render), "utf8");
  await writeFile(
    path.join(outputDir, "report.html"),
    renderReportHtml(insights, healthNarrative, t.render, { includeCrossLink }),
    "utf8",
  );
}
