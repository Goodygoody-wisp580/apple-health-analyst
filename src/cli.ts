#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

import { Command } from "commander";

import { getTranslations, type Locale } from "./i18n/index.js";
import { validateNarrativeReport } from "./narrative/validateNarrativeReport.js";
import { prepareAnalysis } from "./pipeline/prepareAnalysis.js";
import {
  writePrepareOutputs,
  writeRenderedOutputs,
} from "./pipeline/writeOutputs.js";
import { PACKAGE_NAME, type InsightBundle } from "./types.js";

async function readJsonFile(filePath: string): Promise<unknown> {
  const contents = await readFile(path.resolve(filePath), "utf8");
  return JSON.parse(contents);
}

function asInsightBundle(value: unknown): InsightBundle {
  if (!value || typeof value !== "object") {
    throw new Error("insights.json must be an object.");
  }

  const candidate = value as Partial<InsightBundle>;
  if (!Array.isArray(candidate.charts)) {
    throw new Error("insights.json is missing the charts array.");
  }
  if (!candidate.analysis || !candidate.coverage || !candidate.input) {
    throw new Error("insights.json structure is incomplete.");
  }

  return candidate as InsightBundle;
}

async function runPrepare(
  exportZip: string,
  options: {
    from?: string;
    to?: string;
    out: string;
    lang: string;
  },
) {
  const locale = (options.lang === "zh" ? "zh" : "en") as Locale;
  const t = await getTranslations(locale);
  const outputDir = path.resolve(options.out);
  const prepared = await prepareAnalysis(exportZip, { ...options, locale }, t);
  await writePrepareOutputs(prepared.summary, prepared.insights, outputDir);
  return prepared;
}

async function runRender(
  options: {
    insights: string;
    narrative: string;
    out: string;
  },
) {
  const outputDir = path.resolve(options.out);
  const insights = asInsightBundle(await readJsonFile(options.insights));
  const locale: Locale = insights.metadata.language === "zh" || insights.metadata.language === "zh-CN" ? "zh" : "en";
  const t = await getTranslations(locale);
  const narrative = validateNarrativeReport(
    await readJsonFile(options.narrative),
    insights.charts.map((chart) => chart.id),
  );

  await writeRenderedOutputs(insights, narrative, outputDir, t);
  return { insights, narrative };
}

export async function runCli(argv: string[]) {
  const program = new Command();
  program.name(PACKAGE_NAME).description("Analyze Apple Health export ZIP files.");

  program
    .command("prepare")
    .argument("<exportZip>", "Apple Health export ZIP path")
    .option("--from <date>", "Only analyze data on or after YYYY-MM-DD")
    .option("--to <date>", "Only analyze data on or before YYYY-MM-DD")
    .option("--out <dir>", "Output directory", "./output")
    .option("--lang <locale>", "Report language (zh|en)", "en")
    .action(async (exportZip, options) => {
      await runPrepare(exportZip, options);
    });

  program
    .command("render")
    .requiredOption("--insights <file>", "Path to insights.json from prepare")
    .requiredOption("--narrative <file>", "Path to report.llm.json from LLM")
    .option("--out <dir>", "Output directory", "./output")
    .action(async (options) => {
      await runRender(options);
    });

  await program.parseAsync(argv, { from: "user" });
}

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const self = fileURLToPath(import.meta.url);
const entry = realpathSync(process.argv[1]);
if (self === entry) {
  runCli(process.argv.slice(2)).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
