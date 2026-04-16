import { describe, expect, it } from "vitest";

import { analyzeRecovery } from "../src/analyzers/recovery.js";
import { analyzeSleep } from "../src/analyzers/sleep.js";
import { buildWorkoutRateDelta } from "../src/analyzers/workoutTypes.js";
import { recoveryZh } from "../src/i18n/zh/recovery.js";
import { sleepZh } from "../src/i18n/zh/sleep.js";
import { findMainXml } from "../src/io/findMainXml.js";
import { readZip } from "../src/io/readZip.js";
import { parseHealthExport } from "../src/io/streamHealthXml.js";
import { buildTimeWindow } from "../src/normalize/buildTimeWindow.js";
import { selectPrimarySources } from "../src/normalize/selectPrimarySources.js";

function fixturePath(name: string): string {
  return new URL(`../fixtures/${name}/export.zip`, import.meta.url).pathname;
}

describe("analyzers", () => {
  it("filters partial sleep nights and emits warnings", async () => {
    const zipPath = fixturePath("partial-sleep-export");
    const zip = await readZip(zipPath);
    const mainXml = await findMainXml(zip.files);
    const parsed = await parseHealthExport(zipPath, zip.files, mainXml);
    const window = buildTimeWindow(undefined, undefined, parsed.exportDate ?? new Date());
    const selected = selectPrimarySources(parsed, window);
    const sleepRecords = parsed.records.sleep.filter(
      (record) => record.canonicalSource === selected.sleep?.canonicalName,
    );
    const sleep = analyzeSleep(sleepRecords, selected.sleep?.displayName ?? null, window, sleepZh);

    expect(sleep.result.recent30d.nights).toBe(1);
    expect(sleep.result.partialNights).toHaveLength(1);
    expect(sleep.warnings).toHaveLength(1);
  });

  it("computes recent vs baseline sleep trends", async () => {
    const zipPath = fixturePath("multi-source-export");
    const zip = await readZip(zipPath);
    const mainXml = await findMainXml(zip.files);
    const parsed = await parseHealthExport(zipPath, zip.files, mainXml);
    const window = buildTimeWindow(undefined, undefined, parsed.exportDate ?? new Date());
    const selected = selectPrimarySources(parsed, window);
    const sleepRecords = parsed.records.sleep.filter(
      (record) => record.canonicalSource === selected.sleep?.canonicalName,
    );
    const sleep = analyzeSleep(sleepRecords, selected.sleep?.displayName ?? null, window, sleepZh);

    expect(sleep.result.status).toBe("ok");
    expect(sleep.result.delta.sleepHours).toBeGreaterThan(0);
    expect(sleep.result.recent30d.avgSleepHours).toBeGreaterThan(
      sleep.result.baseline90d.avgSleepHours ?? 0,
    );
  });

  it("returns insufficient_data when no recovery metrics are present", () => {
    const window = buildTimeWindow(undefined, undefined, new Date("2026-03-26T00:00:00Z"));
    const recovery = analyzeRecovery({}, {}, window, recoveryZh);

    expect(recovery.status).toBe("insufficient_data");
  });

  it("normalizes workout deltas across different window lengths", () => {
    const delta = buildWorkoutRateDelta(
      3,
      new Date("2026-03-01T00:00:00Z"),
      new Date("2026-03-30T00:00:00Z"),
      6,
      new Date("2025-12-01T00:00:00Z"),
      new Date("2026-02-28T00:00:00Z"),
    );

    expect(delta).toBeGreaterThan(0);
  });
});
