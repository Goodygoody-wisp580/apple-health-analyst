import type { SleepAnalysis, SleepSample, TimeWindow, WarningMessage } from "../types.js";

import { buildNightSummaries, roundNumber, summarizeSleepWindow } from "./sleepShared.js";

function subtract(left: number | null, right: number | null): number | null {
  if (left === null || right === null) {
    return null;
  }
  return roundNumber(left - right);
}

export function analyzeSleep(
  records: SleepSample[],
  sourceName: string | null,
  window: TimeWindow,
): { result: SleepAnalysis; warnings: WarningMessage[] } {
  if (!sourceName || records.length === 0) {
    return {
      result: {
        status: "insufficient_data",
        source: sourceName,
        coverageDays: 0,
        sampleCount: 0,
        staged: false,
        recent30d: summarizeSleepWindow([]),
        baseline90d: summarizeSleepWindow([]),
        delta: {
          sleepHours: null,
          awakeHours: null,
          corePct: null,
          remPct: null,
          deepPct: null,
        },
        partialNights: [],
        notes: ["所选时间窗口内没有可用的睡眠记录。"],
      },
      warnings: [],
    };
  }

  const staged = records.some((record) => /Asleep(Core|REM|Deep)|Awake/.test(record.value));
  const allNights = buildNightSummaries(records, window.effectiveEnd);
  const partialNights = allNights.filter((night) => night.totalSleepHours < 3);
  const validNights = allNights.filter((night) => night.totalSleepHours >= 3);

  const recent = validNights.filter(
    (night) =>
      night.anchor >= window.recentStart &&
      (!window.effectiveStart || night.anchor >= window.effectiveStart) &&
      night.anchor <= window.effectiveEnd,
  );
  const baseline = validNights.filter(
    (night) =>
      night.anchor >= window.baselineStart &&
      night.anchor < window.recentStart &&
      (!window.effectiveStart || night.anchor >= window.effectiveStart),
  );

  const result: SleepAnalysis = {
    status: validNights.length > 0 ? "ok" : "insufficient_data",
    source: sourceName,
    coverageDays: validNights.length,
    sampleCount: records.length,
    staged,
    recent30d: summarizeSleepWindow(recent),
    baseline90d: summarizeSleepWindow(baseline),
    delta: {
      sleepHours: subtract(
        summarizeSleepWindow(recent).avgSleepHours,
        summarizeSleepWindow(baseline).avgSleepHours,
      ),
      awakeHours: subtract(
        summarizeSleepWindow(recent).avgAwakeHours,
        summarizeSleepWindow(baseline).avgAwakeHours,
      ),
      corePct: subtract(
        summarizeSleepWindow(recent).stagePct.core,
        summarizeSleepWindow(baseline).stagePct.core,
      ),
      remPct: subtract(
        summarizeSleepWindow(recent).stagePct.rem,
        summarizeSleepWindow(baseline).stagePct.rem,
      ),
      deepPct: subtract(
        summarizeSleepWindow(recent).stagePct.deep,
        summarizeSleepWindow(baseline).stagePct.deep,
      ),
    },
    partialNights: partialNights.map((night) => ({
      date: night.nightKey,
      totalSleepHours: roundNumber(night.totalSleepHours) ?? 0,
    })),
    notes: staged
      ? ["睡眠阶段占比仅基于选定的主睡眠数据源计算。"]
      : ["选定的睡眠数据源不提供分阶段睡眠数据。"],
  };

  const warnings: WarningMessage[] = partialNights.map((night) => ({
    code: "partial_sleep_night",
    module: "sleep",
    message: `已将 ${night.nightKey} 排除在睡眠趋势之外，因为该夜晚仅包含 ${roundNumber(
      night.totalSleepHours,
    )} 小时睡眠。`,
  }));

  return { result, warnings };
}
