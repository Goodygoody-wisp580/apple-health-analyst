import type { CrossMetricT } from "../zh/crossMetric.js";

export const crossMetricEn: CrossMetricT = {
  // ── Separators ──
  partSep: "; ",
  partEnd: ".",
  sentSep: ". ",

  // ── Sleep-Recovery Link ──────────────────────────────────────────

  sleepRecoveryNoShortNights:
    "No nights with less than 6 hours of sleep recently; sleep duration is well maintained.",

  sleepRecoveryHrvDrop: (
    shortDays: number,
    hrvDrop: number,
    shortHRV: number,
    normalHRV: number,
  ) =>
    `On the ${shortDays} night(s) with less than 6 hours of sleep, next-day HRV dropped by an average of ${Math.abs(hrvDrop)}% (${shortHRV} vs ${normalHRV} ms), indicating a clear impact of short sleep on autonomic recovery.`,

  sleepRecoveryNoHrvData: (shortDays: number) =>
    `${shortDays} night(s) had less than 6 hours of sleep, but there is insufficient next-day HRV data to assess recovery impact.`,

  sleepRecoveryTolerable: (shortDays: number) =>
    `${shortDays} night(s) had less than 6 hours of sleep, but next-day HRV did not show a significant decline, suggesting reasonable tolerance to short sleep.`,

  // ── Sleep Consistency ────────────────────────────────────────────

  sleepConsistencyInsufficient: "Insufficient data to assess sleep schedule regularity.",

  sleepConsistencyHigh: (bedStd: number, wakeStd: number) =>
    `Bedtime standard deviation is approximately ${bedStd} minutes, and wake time standard deviation is approximately ${wakeStd} minutes — your sleep schedule is very consistent. Research shows that a regular sleep schedule contributes more to health than simply extending sleep duration.`,

  sleepConsistencyModerate: (bedStd: number, wakeStd: number) =>
    `Bedtime standard deviation is approximately ${bedStd} minutes, and wake time standard deviation is approximately ${wakeStd} minutes — your schedule shows moderate variability. Prioritizing a fixed wake time is recommended; bedtime will naturally stabilize.`,

  sleepConsistencyLow: (bedStd: number, wakeStd: number) =>
    `Bedtime standard deviation is approximately ${bedStd} minutes, and wake time standard deviation is approximately ${wakeStd} minutes — your sleep schedule has high variability. An irregular schedule weakens the circadian rhythm, reducing deep sleep quality and disrupting hormonal regulation.`,

  // ── Activity-Recovery Balance ────────────────────────────────────

  activityRecoveryNoHighStrain:
    "No high-activity days (\u226560 minutes) recently; unable to assess training-recovery balance.",

  activityRecoveryInsufficientHrv: (highStrainDays: number) =>
    `${highStrainDays} day(s) had high activity levels, but there is insufficient HRV data to assess recovery adequacy.`,

  activityRecoveryAdequate: (
    highStrainDays: number,
    highHRV: number,
    restHRV: number,
  ) =>
    `${highStrainDays} day(s) had high activity levels, with next-day average HRV of ${highHRV} ms close to the rest-day average of ${restHRV} ms, indicating good recovery from the current training load.`,

  activityRecoveryInadequate: (
    highStrainDays: number,
    highHRV: number,
    restHRV: number,
  ) =>
    `${highStrainDays} day(s) had high activity levels, with next-day average HRV of ${highHRV} ms significantly lower than the rest-day average of ${restHRV} ms, suggesting the training load may exceed recovery capacity. Consider reducing intensity or adding more rest days.`,

  // ── Recovery Coherence ───────────────────────────────────────────

  recoveryCoherenceInsufficient: "Insufficient recovery data to assess trend coherence.",

  recoveryCoherenceAligned: (
    rhrTrend: string,
    hrvTrend: string,
  ) =>
    `Resting heart rate is ${rhrTrend === "improving" ? "declining" : "stable"} and HRV is ${hrvTrend === "improving" ? "rising" : "stable"} — both recovery indicators are aligned, reflecting a healthy sympathetic/parasympathetic balance.`,

  recoveryCoherenceBothWorsening:
    "Resting heart rate is rising and HRV is declining — dual signals suggesting reduced autonomic recovery capacity. Attention to stress, sleep, and training load is recommended.",

  recoveryCoherenceMixed: (rhrTrend: string, hrvTrend: string) =>
    `Resting heart rate trend is "${rhrTrend}" and HRV trend is "${hrvTrend}" — the two indicators are not fully aligned. Consider whether mixed stressors may be at play (e.g., increased training but improved sleep).`,

  // Recovery trend labels
  trendImproving: "improving",
  trendWorsening: "worsening",
  trendStable: "stable",

  // ── Composite Assessment ─────────────────────────────────────────

  readinessGood: "Good",
  readinessModerate: "Moderate",
  readinessLow: "Low",
  readinessInsufficientData: "Insufficient data",

  compositeSleep: (score: number) => `Sleep ${score}/100`,
  compositeRecovery: (score: number) => `Recovery ${score}/100`,
  compositeActivity: (score: number) => `Activity ${score}/100`,

  compositeSummary: (
    scoresPart: string,
    readinessLabel: string,
  ) =>
    `Composite scores: ${scoresPart}. Overall readiness: ${readinessLabel}.`,

  compositeScoreSeparator: ", ",

  compositeLowAdvice: "Prioritize improving sleep and recovery before increasing training intensity.",
  compositeModerateAdvice: "There is room for improvement; focus on the dimension with the lowest score.",
  compositeGoodAdvice: "All dimensions are in good shape; you can maintain or progressively advance your training goals.",

  compositeInsufficientDimensions: "Insufficient data dimensions to generate a composite score.",

  // ── Pattern Detection ────────────────────────────────────────────

  patternWeekendWarrior: (
    weekendAvg: number,
    weekdayAvg: number,
    ratio: number,
  ) =>
    `Weekend warrior pattern: Weekend average exercise is ${weekendAvg} minutes — ${ratio}x the weekday average of ${weekdayAvg} minutes. Concentrated exercise carries a higher injury risk than evenly distributed activity; consider adding light exercise on weekdays.`,

  patternNightOwlDrift: (driftMin: number) =>
    `Night owl drift: Bedtime shifted later by approximately ${driftMin} minutes over the analysis period. A delayed circadian rhythm reduces deep sleep proportion and HRV; increasing morning light exposure can help anchor your rhythm.`,

  patternSleepDebtCompensation: (weekdayAvg: string, weekendAvg: string) =>
    `Sleep debt compensation pattern: Weekday average sleep is ${weekdayAvg} hours, weekend average is ${weekendAvg} hours. Weekend catch-up sleep only partially repays sleep debt and cannot fully restore cognitive function or metabolic balance. Aim for at least 7 hours on weekdays.`,

  patternRecoveryDeficit: (maxConsecutive: number) =>
    `Recovery deficit risk: ${maxConsecutive} consecutive days of high activity (\u226545 minutes) with no rest day. Sustained high load accumulates micro-damage and suppresses HRV; schedule a light recovery day every 2\u20133 days.`,

  // ── Notable Days ─────────────────────────────────────────────────

  notableSleepDuration: "Sleep Duration",
  notableHRV: "HRV",
  notableRHR: "Resting Heart Rate",
  notableExercise: "Exercise Duration",

  notableUnitHours: "hours",
  notableUnitMs: "ms",
  notableUnitBpm: "bpm",
  notableUnitMinutes: "minutes",

  notableDayContext: (avg: number, unit: string) => `mean ${avg} ${unit}`,
};
