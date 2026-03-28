import type {
  SleepAnalysis,
  SleepHealthInsights,
  SleepSample,
  SleepWindowSummary,
  TimeWindow,
  WarningMessage,
} from "../types.js";

import type { SleepT } from "../i18n/zh/sleep.js";

import { round, subtract } from "./mathUtils.js";
import { buildNightSummaries, summarizeSleepWindow } from "./sleepShared.js";

const EMPTY_HEALTH_INSIGHTS: SleepHealthInsights = {
  sleepTrend: null,
  sleepTrendDelta: null,
  deepSleepAssessment: "",
  remSleepAssessment: "",
  normalRangeAssessment: "",
  interpretation: "",
  actionableAdvice: [],
  doctorTalkingPoints: [],
};

export function analyzeSleep(
  records: SleepSample[],
  sourceName: string | null,
  window: TimeWindow,
  t: SleepT,
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
        healthInsights: EMPTY_HEALTH_INSIGHTS,
        notes: [t.noSleepRecords],
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

  const recentSummary = summarizeSleepWindow(recent);
  const baselineSummary = summarizeSleepWindow(baseline);

  const delta = {
    sleepHours: subtract(recentSummary.avgSleepHours, baselineSummary.avgSleepHours),
    awakeHours: subtract(recentSummary.avgAwakeHours, baselineSummary.avgAwakeHours),
    corePct: subtract(recentSummary.stagePct.core, baselineSummary.stagePct.core),
    remPct: subtract(recentSummary.stagePct.rem, baselineSummary.stagePct.rem),
    deepPct: subtract(recentSummary.stagePct.deep, baselineSummary.stagePct.deep),
  };

  const healthInsights = buildSleepHealthInsights(recentSummary, baselineSummary, delta, staged, t);

  const result: SleepAnalysis = {
    status: validNights.length > 0 ? "ok" : "insufficient_data",
    source: sourceName,
    coverageDays: validNights.length,
    sampleCount: records.length,
    staged,
    recent30d: recentSummary,
    baseline90d: baselineSummary,
    delta,
    partialNights: partialNights.map((night) => ({
      date: night.nightKey,
      totalSleepHours: round(night.totalSleepHours) ?? 0,
    })),
    healthInsights,
    notes: staged
      ? [t.stagedNote]
      : [t.unstagedNote],
  };

  const warnings: WarningMessage[] = partialNights.map((night) => ({
    code: "partial_sleep_night",
    module: "sleep",
    message: t.partialNightWarning(night.nightKey, round(night.totalSleepHours) ?? 0),
  }));

  return { result, warnings };
}

// ── Health Insight Builders ──

function buildSleepHealthInsights(
  recent: SleepWindowSummary,
  baseline: SleepWindowSummary,
  delta: SleepAnalysis["delta"],
  staged: boolean,
  t: SleepT,
): SleepHealthInsights {
  if (recent.nights === 0) return EMPTY_HEALTH_INSIGHTS;

  const { trend, trendDelta } = buildSleepTrend(delta);

  return {
    sleepTrend: trend,
    sleepTrendDelta: trendDelta,
    deepSleepAssessment: buildDeepSleepAssessment(recent.stagePct, staged, t),
    remSleepAssessment: buildRemSleepAssessment(recent.stagePct, staged, t),
    normalRangeAssessment: buildNormalRangeAssessment(recent, staged, t),
    interpretation: buildInterpretation(recent, baseline, delta, staged, trend, t),
    actionableAdvice: buildActionableAdvice(recent, delta, staged, trend, t),
    doctorTalkingPoints: buildDoctorTalkingPoints(recent, delta, staged, t),
  };
}

function buildSleepTrend(
  delta: SleepAnalysis["delta"],
): { trend: SleepHealthInsights["sleepTrend"]; trendDelta: number | null } {
  if (delta.sleepHours === null) return { trend: null, trendDelta: null };
  const trend =
    delta.sleepHours >= 0.5 ? "improving"
    : delta.sleepHours <= -0.5 ? "declining"
    : "stable";
  return { trend, trendDelta: delta.sleepHours };
}

function buildDeepSleepAssessment(
  stagePct: SleepWindowSummary["stagePct"],
  staged: boolean,
  t: SleepT,
): string {
  if (!staged || stagePct.deep === null) {
    return t.deepSleepNoData;
  }
  const deep = stagePct.deep;
  if (deep >= 13 && deep <= 23) {
    return t.deepSleepNormal(deep);
  }
  if (deep < 13) {
    return t.deepSleepLow(deep);
  }
  return t.deepSleepHigh(deep);
}

function buildRemSleepAssessment(
  stagePct: SleepWindowSummary["stagePct"],
  staged: boolean,
  t: SleepT,
): string {
  if (!staged || stagePct.rem === null) {
    return t.remSleepNoData;
  }
  const rem = stagePct.rem;
  if (rem >= 20 && rem <= 25) {
    return t.remSleepNormal(rem);
  }
  if (rem < 20) {
    return t.remSleepLow(rem);
  }
  return t.remSleepHigh(rem);
}

function buildNormalRangeAssessment(
  recent: SleepWindowSummary,
  staged: boolean,
  t: SleepT,
): string {
  if (recent.nights === 0) return t.normalRangeInsufficientData;
  const parts: string[] = [];

  // Total sleep
  const avg = recent.avgSleepHours;
  if (avg !== null) {
    if (avg >= 7 && avg <= 9) {
      parts.push(t.avgSleepNormal(avg));
    } else if (avg >= 6 && avg < 7) {
      parts.push(t.avgSleepSlightlyLow(avg));
    } else if (avg < 6) {
      parts.push(t.avgSleepVeryLow(avg));
    } else {
      parts.push(t.avgSleepHigh(avg));
    }
  }

  // Deep sleep
  if (staged && recent.stagePct.deep !== null) {
    const deep = recent.stagePct.deep;
    if (deep >= 13 && deep <= 23) {
      parts.push(t.deepSleepInRange(deep));
    } else if (deep < 13) {
      parts.push(t.deepSleepOutOfRangeLow(deep));
    } else {
      parts.push(t.deepSleepOutOfRangeHigh(deep));
    }
  }

  // REM
  if (staged && recent.stagePct.rem !== null) {
    const rem = recent.stagePct.rem;
    if (rem >= 20 && rem <= 25) {
      parts.push(t.remSleepInRange(rem));
    } else if (rem < 20) {
      parts.push(t.remSleepOutOfRangeLow(rem));
    } else {
      parts.push(t.remSleepOutOfRangeHigh(rem));
    }
  }

  // Bedtime
  if (recent.medianBedtime) {
    const hour = parseInt(recent.medianBedtime.split(":")[0], 10);
    if (hour >= 21 && hour <= 23) {
      parts.push(t.bedtimeIdeal(recent.medianBedtime));
    } else if (hour >= 0 && hour <= 2) {
      parts.push(t.bedtimeLate(recent.medianBedtime));
    }
  }

  return parts.length > 0 ? parts.join(t.partSep) + t.partEnd : t.normalRangeInsufficientData;
}

function buildInterpretation(
  recent: SleepWindowSummary,
  baseline: SleepWindowSummary,
  delta: SleepAnalysis["delta"],
  staged: boolean,
  trend: SleepHealthInsights["sleepTrend"],
  t: SleepT,
): string {
  if (recent.nights === 0) return t.interpretationInsufficientData;
  const parts: string[] = [];

  const avg = recent.avgSleepHours;
  // Overall signal
  if (avg !== null && avg >= 7 && avg <= 9) {
    if (staged && recent.stagePct.deep !== null && recent.stagePct.deep >= 13) {
      parts.push(t.overallHealthyWithDeep);
    } else {
      parts.push(t.overallDurationOk);
    }
  } else if (avg !== null && avg < 7) {
    parts.push(t.overallDurationLow);
  } else if (avg !== null && avg > 9) {
    parts.push(t.overallDurationHigh);
  }

  // Trend
  if (trend === "improving" && delta.sleepHours !== null) {
    parts.push(t.trendImproving(Math.abs(delta.sleepHours)));
  } else if (trend === "declining" && delta.sleepHours !== null) {
    parts.push(t.trendDeclining(Math.abs(delta.sleepHours)));
  } else if (trend === "stable") {
    parts.push(t.trendStable);
  }

  // Stage composition
  if (staged) {
    const deep = recent.stagePct.deep;
    const rem = recent.stagePct.rem;
    if (deep !== null && deep < 13 && rem !== null && rem < 20) {
      parts.push(t.stagesBothLow);
    } else if (deep !== null && deep < 13) {
      parts.push(t.stagesDeepLow);
    } else if (rem !== null && rem < 20) {
      parts.push(t.stagesRemLow);
    }
  }

  return parts.length > 0 ? parts.join(t.sentSep) + t.partEnd : "";
}

function buildActionableAdvice(
  recent: SleepWindowSummary,
  delta: SleepAnalysis["delta"],
  staged: boolean,
  trend: SleepHealthInsights["sleepTrend"],
  t: SleepT,
): string[] {
  const advice: string[] = [];

  const avg = recent.avgSleepHours;
  if (avg !== null && avg < 7) {
    advice.push(t.adviceSleepMore);
  }

  if (staged && recent.stagePct.deep !== null && recent.stagePct.deep < 13) {
    advice.push(t.adviceDeepSleep);
  }

  if (staged && recent.stagePct.rem !== null && recent.stagePct.rem < 20) {
    advice.push(t.adviceRemSleep);
  }

  if (trend === "declining") {
    advice.push(t.adviceDeclining);
  }

  if (recent.medianBedtime) {
    const hour = parseInt(recent.medianBedtime.split(":")[0], 10);
    if (hour >= 0 && hour <= 2) {
      advice.push(t.adviceBedtimeLate);
    }
  }

  if (advice.length === 0) {
    advice.push(t.adviceGood);
  }
  advice.push(t.adviceConsistentWake);

  return advice;
}

function buildDoctorTalkingPoints(
  recent: SleepWindowSummary,
  delta: SleepAnalysis["delta"],
  staged: boolean,
  t: SleepT,
): string[] {
  const points: string[] = [];

  const avg = recent.avgSleepHours;
  if (avg !== null && avg < 6) {
    points.push(t.doctorLowSleep(avg));
  }

  if (staged && recent.stagePct.deep !== null && recent.stagePct.deep < 10) {
    points.push(t.doctorLowDeep(recent.stagePct.deep));
  }

  if (delta.sleepHours !== null && delta.sleepHours <= -1) {
    points.push(t.doctorDeclining(Math.abs(delta.sleepHours)));
  }

  if (avg !== null && avg > 9) {
    points.push(t.doctorLongSleep(avg));
  }

  if (recent.medianBedtime && recent.medianWakeTime) {
    const bedHour = parseInt(recent.medianBedtime.split(":")[0], 10);
    if (bedHour >= 2 && bedHour <= 5) {
      points.push(t.doctorLateBedtime(recent.medianBedtime));
    }
  }

  if (points.length === 0) {
    points.push(t.doctorNormal);
  }

  return points;
}
