#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

import { Command } from "commander";

import { createFallbackNarrative } from "./narrative/createFallbackNarrative.js";
import { validateNarrativeReport } from "./narrative/validateNarrativeReport.js";
import { prepareAnalysis } from "./pipeline/prepareAnalysis.js";
import {
  formatsToSelection,
  writePrepareOutputs,
  writeRenderedOutputs,
} from "./pipeline/writeOutputs.js";
import { PACKAGE_NAME, type InsightBundle, type OutputFormat } from "./types.js";

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

async function readJsonFile(filePath: string): Promise<unknown> {
  const contents = await readFile(path.resolve(filePath), "utf8");
  return JSON.parse(contents);
}

function asInsightBundle(value: unknown): InsightBundle {
  if (!value || typeof value !== "object") {
    throw new Error("insights.json 必须是对象。");
  }

  const candidate = value as Partial<InsightBundle>;
  if (!Array.isArray(candidate.charts)) {
    throw new Error("insights.json 缺少 charts。");
  }
  if (!candidate.analysis || !candidate.coverage || !candidate.input) {
    throw new Error("insights.json 结构不完整。");
  }

  return candidate as InsightBundle;
}

async function runPrepare(
  exportZip: string,
  options: {
    from?: string;
    to?: string;
    out: string;
  },
) {
  const outputDir = path.resolve(options.out);
  const prepared = await prepareAnalysis(exportZip, options);
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
  const narrative = validateNarrativeReport(
    await readJsonFile(options.narrative),
    insights.charts.map((chart) => chart.id),
  );

  await writeRenderedOutputs(insights, narrative, outputDir);
  return { insights, narrative };
}

async function runAnalyze(
  exportZip: string,
  options: {
    from?: string;
    to?: string;
    format: string;
    out: string;
  },
) {
  const outputDir = path.resolve(options.out);
  const prepared = await prepareAnalysis(exportZip, options);
  const narrative = validateNarrativeReport(
    createFallbackNarrative(prepared.insights),
    prepared.insights.charts.map((chart) => chart.id),
  );
  const selection = formatsToSelection(parseFormats(options.format));

  if (selection.json) {
    await writePrepareOutputs(prepared.summary, prepared.insights, outputDir);
  }
  await writeRenderedOutputs(prepared.insights, narrative, outputDir, selection);

  return {
    ...prepared,
    narrative,
  };
}

export async function runCli(argv: string[]) {
  const program = new Command();
  program.name(PACKAGE_NAME).description("分析 Apple Health 导出 ZIP 文件。");

  program
    .command("prepare")
    .argument("<exportZip>", "Apple Health 导出 ZIP 文件路径")
    .option("--from <date>", "只分析 YYYY-MM-DD 及之后的数据")
    .option("--to <date>", "只分析 YYYY-MM-DD 及之前的数据")
    .option("--out <dir>", "输出目录", "./output")
    .action(async (exportZip, options) => {
      await runPrepare(exportZip, options);
    });

  program
    .command("render")
    .requiredOption("--insights <file>", "prepare 生成的 insights.json 路径")
    .requiredOption("--narrative <file>", "LLM 生成的 report.llm.json 路径")
    .option("--out <dir>", "输出目录", "./output")
    .action(async (options) => {
      await runRender(options);
    });

  program
    .command("analyze")
    .argument("<exportZip>", "Apple Health 导出 ZIP 文件路径")
    .option("--from <date>", "只分析 YYYY-MM-DD 及之后的数据")
    .option("--to <date>", "只分析 YYYY-MM-DD 及之前的数据")
    .option("--format <formats>", "逗号分隔的输出格式", "markdown,json,html")
    .option("--out <dir>", "输出目录", "./output")
    .action(async (exportZip, options) => {
      await runAnalyze(exportZip, options);
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
