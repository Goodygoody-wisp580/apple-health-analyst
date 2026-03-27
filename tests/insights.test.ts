import { describe, expect, it } from "vitest";

import {
  buildDataGaps,
  buildRiskFlags,
  buildSourceConfidence,
} from "../src/insights/buildInsightBundle.js";
import { compressTimeSeries } from "../src/insights/chartUtils.js";
import { prepareAnalysis } from "../src/pipeline/prepareAnalysis.js";

function fixturePath(name: string): string {
  return new URL(`../fixtures/${name}/export.zip`, import.meta.url).pathname;
}

describe("insights helpers", () => {
  it("compresses history into day, week, and month buckets", () => {
    const anchor = new Date("2026-03-27T00:00:00Z");
    const values = Array.from({ length: 240 }, (_, index) => ({
      timestamp: new Date(anchor.getTime() - index * 24 * 60 * 60 * 1000),
      value: 100 - index,
    }));

    const compressed = compressTimeSeries(values, anchor, "average");
    const granularities = new Set(compressed.map((point) => point.granularity));

    expect(granularities.has("day")).toBe(true);
    expect(granularities.has("week")).toBe(true);
    expect(granularities.has("month")).toBe(true);
    expect(compressed.length).toBeLessThan(values.length);
  });

  it("emits recovery stress and sleep decline risk flags when signals worsen together", async () => {
    const prepared = await prepareAnalysis(fixturePath("multi-source-export"), {});
    const stressed = structuredClone(prepared.summary);

    stressed.sleep.delta.sleepHours = -1.2;
    stressed.sleep.recent30d.avgSleepHours = 5.2;
    stressed.recovery.metrics.restingHeartRate!.delta = 4;
    stressed.recovery.metrics.hrv!.delta = -7;

    const flags = buildRiskFlags(stressed);

    expect(flags.map((flag) => flag.id)).toContain("sleep_decline");
    expect(flags.map((flag) => flag.id)).toContain("recovery_stress");
    expect(flags.find((flag) => flag.id === "sleep_decline")?.seekCare).toBe(true);
  });

  it("marks missing samples as data gaps and downgrades source confidence", async () => {
    const prepared = await prepareAnalysis(fixturePath("multi-source-export"), {});
    const sparse = structuredClone(prepared.summary);

    sparse.sleep.coverageDays = 2;
    sparse.recovery.metrics.restingHeartRate = undefined;
    sparse.recovery.metrics.hrv = undefined;
    sparse.activity.recent30d.dayCount = 2;
    sparse.activity.recent30d.workouts = 0;
    sparse.bodyComposition.metrics.bodyMass = undefined;
    sparse.bodyComposition.metrics.bodyFatPercentage = undefined;

    const dataGaps = buildDataGaps(sparse);
    const confidence = buildSourceConfidence(sparse);

    expect(dataGaps.some((gap) => gap.id === "sleep_insufficient")).toBe(true);
    expect(dataGaps.some((gap) => gap.id === "activity_sparse")).toBe(true);
    expect(confidence.find((entry) => entry.module === "sleep")?.level).toBe("low");
    expect(confidence.find((entry) => entry.module === "bodyComposition")?.level).toBe("low");
  });

  it("includes long-term historical context for narrative reasoning", async () => {
    const prepared = await prepareAnalysis(fixturePath("multi-source-export"), {});

    expect(prepared.insights.historicalContext.scope.totalSpanDays).toBeGreaterThan(0);
    expect(prepared.insights.historicalContext.sleep.trailing180d.nights).toBeGreaterThan(0);
    expect(prepared.insights.historicalContext.activity.allTime.workouts).toBeGreaterThanOrEqual(
      prepared.insights.analysis.activity.recent30d.workouts,
    );
    expect(prepared.insights.historicalContext.interpretationHints).toBeInstanceOf(Array);
  });
});
