#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { Command } from "commander";

import { analyzeActivity } from "./analyzers/activity.js";
import { analyzeBodyComposition } from "./analyzers/bodyComposition.js";
import { analyzeOverview } from "./analyzers/overview.js";
import { analyzeRecovery } from "./analyzers/recovery.js";
import { analyzeSleep } from "./analyzers/sleep.js";
import { findMainXml } from "./io/findMainXml.js";
import { readZip } from "./io/readZip.js";
import { parseHealthExport } from "./io/streamHealthXml.js";
import { buildTimeWindow } from "./normalize/buildTimeWindow.js";
import { selectPrimarySources } from "./normalize/selectPrimarySources.js";
import { renderReportHtml } from "./render/reportHtml.js";
import { renderReportMarkdown } from "./render/reportMarkdown.js";
import { renderSummaryJson } from "./render/summaryJson.js";
import {
  PACKAGE_NAME,
  PACKAGE_VERSION,
  type AnalysisSummary,
  type OutputFormat,
} from "./types.js";

function formatLocalDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseFormats(input: string): OutputFormat[] {
  const values = input
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const supported: OutputFormat[] = ["markdown", "json", "html"];
  for (const value of values) {
    if (!supported.includes(value as OutputFormat)) {
      throw new Error(`不支持的输出格式：${value}。请使用 markdown,json,html。`);
    }
  }

  return [...new Set(values)] as OutputFormat[];
}

async function analyze(zipPath: string, options: { from?: string; to?: string; format: string; out: string }) {
  const resolvedZipPath = path.resolve(zipPath);
  const outputDir = path.resolve(options.out);
  const formats = parseFormats(options.format);

  const zip = await readZip(resolvedZipPath);
  const mainXmlEntry = await findMainXml(zip.files);
  const parsed = await parseHealthExport(resolvedZipPath, zip.files, mainXmlEntry);
  const timeWindow = buildTimeWindow(options.from, options.to, parsed.exportDate ?? parsed.coverageEnd ?? new Date());
  const primarySources = selectPrimarySources(parsed, timeWindow);

  const sleepSource = primarySources.sleep?.canonicalName ?? null;
  const sleepRecords = sleepSource
    ? parsed.records.sleep.filter((record) => record.canonicalSource === sleepSource)
    : [];
  const sleep = analyzeSleep(sleepRecords, primarySources.sleep?.displayName ?? null, timeWindow);

  const recovery = analyzeRecovery(
    {
      restingHeartRate: primarySources.recovery.restingHeartRate
        ? parsed.records.restingHeartRate.filter(
            (record) => record.canonicalSource === primarySources.recovery.restingHeartRate?.canonicalName,
          )
        : [],
      hrv: primarySources.recovery.hrv
        ? parsed.records.hrv.filter((record) => record.canonicalSource === primarySources.recovery.hrv?.canonicalName)
        : [],
      oxygenSaturation: primarySources.recovery.oxygenSaturation
        ? parsed.records.oxygenSaturation.filter(
            (record) => record.canonicalSource === primarySources.recovery.oxygenSaturation?.canonicalName,
          )
        : [],
      respiratoryRate: primarySources.recovery.respiratoryRate
        ? parsed.records.respiratoryRate.filter(
            (record) => record.canonicalSource === primarySources.recovery.respiratoryRate?.canonicalName,
          )
        : [],
      vo2Max: primarySources.recovery.vo2Max
        ? parsed.records.vo2Max.filter(
            (record) => record.canonicalSource === primarySources.recovery.vo2Max?.canonicalName,
          )
        : [],
    },
    {
      restingHeartRate: primarySources.recovery.restingHeartRate?.displayName,
      hrv: primarySources.recovery.hrv?.displayName,
      oxygenSaturation: primarySources.recovery.oxygenSaturation?.displayName,
      respiratoryRate: primarySources.recovery.respiratoryRate?.displayName,
      vo2Max: primarySources.recovery.vo2Max?.displayName,
    },
    timeWindow,
  );

  const activity = analyzeActivity(parsed.activitySummaries, parsed.workouts, timeWindow);
  const bodyComposition = analyzeBodyComposition(
    {
      bodyMass: primarySources.bodyComposition.bodyMass
        ? parsed.records.bodyMass.filter(
            (record) => record.canonicalSource === primarySources.bodyComposition.bodyMass?.canonicalName,
          )
        : [],
      bodyFatPercentage: primarySources.bodyComposition.bodyFatPercentage
        ? parsed.records.bodyFatPercentage.filter(
            (record) =>
              record.canonicalSource === primarySources.bodyComposition.bodyFatPercentage?.canonicalName,
          )
        : [],
    },
    {
      bodyMass: primarySources.bodyComposition.bodyMass?.displayName,
      bodyFatPercentage: primarySources.bodyComposition.bodyFatPercentage?.displayName,
    },
    timeWindow,
  );

  const overview = analyzeOverview(parsed, primarySources, timeWindow);
  const summary: AnalysisSummary = {
    metadata: {
      tool: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      generatedAt: new Date().toISOString(),
    },
    input: {
      zipPath: resolvedZipPath,
      mainXmlEntry: parsed.mainXmlEntry,
      from: formatLocalDate(timeWindow.requestedFrom),
      to: formatLocalDate(timeWindow.requestedTo),
      exportDate: parsed.exportDate?.toISOString() ?? null,
      locale: parsed.locale,
    },
    coverage: overview.coverage,
    sources: overview.sources,
    warnings: [...sleep.warnings],
    sleep: sleep.result,
    recovery,
    activity,
    bodyComposition,
    attachments: overview.attachments,
  };

  await mkdir(outputDir, { recursive: true });

  if (formats.includes("json")) {
    await writeFile(path.join(outputDir, "summary.json"), renderSummaryJson(summary), "utf8");
  }
  if (formats.includes("markdown")) {
    await writeFile(path.join(outputDir, "report.md"), renderReportMarkdown(summary), "utf8");
  }
  if (formats.includes("html")) {
    await writeFile(path.join(outputDir, "report.html"), renderReportHtml(summary), "utf8");
  }

  return summary;
}

export async function runCli(argv: string[]) {
  const program = new Command();
  program.name(PACKAGE_NAME).description("分析 Apple Health 导出 ZIP 文件。");

  program
    .command("analyze")
    .argument("<exportZip>", "Apple Health 导出 ZIP 文件路径")
    .option("--from <date>", "只分析 YYYY-MM-DD 及之后的数据")
    .option("--to <date>", "只分析 YYYY-MM-DD 及之前的数据")
    .option("--format <formats>", "逗号分隔的输出格式", "markdown,json,html")
    .option("--out <dir>", "输出目录", "./output")
    .action(async (exportZip, options) => {
      await analyze(exportZip, options);
    });

  await program.parseAsync(argv, { from: "user" });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli(process.argv.slice(2)).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
