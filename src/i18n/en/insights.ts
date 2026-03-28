// ── Insight builder translations (English) ──────────────────────────
import type { InsightsT } from "../zh/insights.js";

export const insightsEn: InsightsT = {
  // ── Metric labels ─────────────────────────────────────────────────
  restingHeartRateLabel: "Resting Heart Rate",
  hrvLabel: "HRV",
  oxygenSaturationLabel: "Blood Oxygen",
  respiratoryRateLabel: "Respiratory Rate",
  vo2MaxLabel: "VO2 Max",
  bodyMassLabel: "Weight",
  bodyFatPercentageLabel: "Body Fat %",

  // ── Chart titles & subtitles ──────────────────────────────────────
  sleepChartTitle: "Sleep Duration & Stage Trends",
  sleepChartSubtitle:
    "Last 30 days kept daily; older history auto-compressed to weekly/monthly for trend focus.",
  recoveryChartTitle: "Recovery Metrics Comparison",
  recoveryChartSubtitle:
    "Each recovery metric retains its native unit for per-metric curve and latest-value display.",
  activityChartTitle: "Activity Trends",
  activityChartSubtitle:
    "Activity summaries track daily movement; workouts counted separately to avoid mixing sources.",
  bodyChartTitle: "Body Composition Trends",
  bodyChartSubtitle:
    "Prioritises the most consistent scale source; recent changes map directly to weight and body-fat curves.",
  menstrualChartTitle: "Menstrual Cycle Trends",
  menstrualChartSubtitleWithAvg: (periods: number, avgDays: number) =>
    `Tracked ${periods} cycles, average cycle length ${avgDays} days.`,
  menstrualChartSubtitleNoAvg: (periods: number) =>
    `Tracked ${periods} periods.`,

  // ── Chart series labels ───────────────────────────────────────────
  sleepHoursLabel: "Sleep Duration",
  sleepHoursUnit: "hours",
  deepSleepPctLabel: "Deep Sleep %",
  remSleepPctLabel: "REM %",
  activityEnergyLabel: "Active Energy",
  exerciseMinutesLabel: "Exercise Minutes",
  exerciseMinutesUnit: "min",
  standHoursLabel: "Stand Hours",
  standHoursUnit: "hours",
  workoutCountLabel: "Workouts",
  workoutCountUnit: "sessions",
  cycleLengthLabel: "Cycle Length",
  cycleLengthUnit: "days",
  periodDurationLabel: "Period Duration",
  periodDurationUnit: "days",

  // ── Source confidence summaries ───────────────────────────────────
  sleepConfidenceSummary: (source: string, days: number, staged: boolean) =>
    `Primary sleep source: ${source}, covering ${days} nights${staged ? ", with staged sleep data" : ""}.`,
  sleepConfidenceInsufficient: "Insufficient sleep data; trend interpretation has lower confidence.",
  recoveryConfidenceSummary: (count: number, sources: string) =>
    `Recovery metrics cover ${count} indicators, primarily from ${sources}.`,
  recoveryConfidenceInsufficient: "Insufficient recovery metric coverage; unable to assess recovery trends.",
  activityConfidenceSummary: (days: number, workouts: number) =>
    `Activity summaries cover ${days} days, with ${workouts} workouts in the last 30 days.`,
  activityConfidenceInsufficient: "Insufficient activity summaries or workout records; activity trends should be interpreted cautiously.",
  bodyConfidenceSummary: (sources: string) =>
    `Body composition data from ${sources}.`,
  bodyConfidenceDefaultSource: "selected primary source",
  bodyConfidenceInsufficient: "Insufficient body composition samples; focus on direction rather than minor fluctuations.",
  menstrualConfidenceSummary: (periods: number, days: number) =>
    `Menstrual cycle data covers ${periods} cycles, ${days} days of records.`,

  // ── Data gaps ─────────────────────────────────────────────────────
  sleepInsufficientGap: "Limited number of sleep nights; recent vs baseline comparison has limited stability.",
  sleepPartialNightsGap: (count: number) =>
    `${count} sleep night(s) excluded due to incomplete records.`,
  recoveryMetricMissingGap: (label: string) =>
    `${label} lacks sufficient recent samples.`,
  activitySparseGap: "Recent activity summary coverage is limited; activity trends are best viewed directionally.",
  bodyMetricMissingGap: (label: string) =>
    `${label} lacks sufficient recent samples.`,
  menstrualSparseGap: "Limited menstrual cycle records; regularity assessment has lower confidence.",

  // ── Risk flag titles ──────────────────────────────────────────────
  sleepDeclineTitle: "Recent Sleep Duration Decline",
  sleepDeclineSummary:
    "30-day average sleep duration is notably below personal baseline; review sleep schedule and recovery routines.",
  sleepDeclineEvidence: (recent: string, baseline: string) => [
    `30-day average: ${recent} hours`,
    `90-day baseline average: ${baseline} hours`,
  ],
  sleepDeclineRecommendation: "Stabilise your sleep window and wake time before increasing training load.",

  recoveryStressTitle: "Recovery Signals Tightening",
  recoveryStressSummary:
    "Resting heart rate rising while HRV declining — common with insufficient recovery, elevated stress, or recent training overload.",
  recoveryStressEvidence: (hrDelta: string, hrvDelta: string) => [
    `Resting heart rate change: ${hrDelta}`,
    `HRV change: ${hrvDelta}`,
  ],
  recoveryStressRecommendation:
    "Reduce high-intensity training, prioritise sleep and hydration, and monitor for 1-2 weeks.",

  oxygenLowTitle: "Low Blood Oxygen Reading",
  oxygenLowSummary:
    "Recent blood oxygen readings have fallen to a low range; verify device fit and watch for associated symptoms.",
  oxygenLowEvidence: (value: string) => [`Latest blood oxygen: ${value}`],
  oxygenLowRecommendation:
    "Re-test and check device placement; if persistently low or symptomatic, consult a doctor promptly.",

  activityDropTitle: "Recent Activity Drop",
  activityDropSummary:
    "Exercise minutes have notably declined from baseline; fitness and training habits may be affected.",
  activityDropEvidence: (recent: string, baseline: string) => [
    `30-day average exercise: ${recent} min`,
    `90-day baseline average: ${baseline} min`,
  ],
  activityDropRecommendation: "Focus on restoring a regular activity rhythm rather than compensating in a single session.",

  bodyMassShiftTitle: "Rapid Weight Change",
  bodyMassShiftSummary:
    "Weight has shifted rapidly relative to personal baseline over the last 30 days; consider diet, training load, and subjective state.",
  bodyMassShiftEvidence: (delta: string) => [`Weight change: ${delta}`],
  bodyMassShiftRecommendation:
    "Confirm whether the change is expected, then factor in body fat, activity, and recovery signals.",

  bodyFatShiftTitle: "Body Fat % Warrants Review",
  bodyFatShiftSummary:
    "Body fat percentage change is large enough to warrant attention, especially considering measurement timing and device consistency.",
  bodyFatShiftEvidence: (delta: string) => [`Body fat change: ${delta}`],
  bodyFatShiftRecommendation:
    "Re-test under consistent conditions to avoid misinterpreting short-term fluctuations as stable trends.",

  menstrualIrregularTitle: "Irregular Menstrual Cycle",
  menstrualIrregularSummary:
    "Recent menstrual cycle variability is high; consider reviewing lifestyle rhythm, stress, and nutrition.",
  menstrualIrregularEvidence: (std: string, avg: string) => [
    `Cycle length std dev: ${std} days`,
    `Average cycle: ${avg} days`,
  ],
  menstrualIrregularRecommendation:
    "Maintain regular routines and balanced nutrition; if irregularity persists, consult a gynaecologist.",

  menstrualCycleLengthAbnormalTitle: "Menstrual Cycle Outside Normal Range",
  menstrualCycleLengthAbnormalSummary: (avg: number) =>
    `Average cycle length ${avg} days; normal range is 21-38 days.`,
  menstrualCycleLengthAbnormalEvidence: (avg: number) => [
    `Average cycle: ${avg} days`,
  ],
  menstrualCycleLengthAbnormalRecommendation:
    "Consult a gynaecologist to investigate hormone levels or other potential causes.",

  intermenstrualBleedingTitle: "Frequent Intermenstrual Bleeding",
  intermenstrualBleedingSummary:
    "Frequent intermenstrual bleeding detected; watch for accompanying symptoms.",
  intermenstrualBleedingEvidence: (count: number, freq: number) => [
    `Intermenstrual bleeding: ${count} times`,
    `Average per cycle: ${freq} times`,
  ],
  intermenstrualBleedingRecommendation:
    "If intermenstrual bleeding persists or increases, consult a gynaecologist.",

  // ── Notable changes ───────────────────────────────────────────────
  sleepImprovedTitle: "Sleep Duration Recovered Above Baseline",
  sleepImprovedSummary: "30-day average sleep duration exceeds baseline; sleep recovery capacity is improving.",
  sleepImprovedEvidence: (delta: string, latest: string) => [
    `Sleep change: ${delta} hours`,
    `Latest sleep curve end: ~${latest} hours`,
  ],

  restingHrImprovedTitle: "Resting Heart Rate Below Baseline",
  restingHrImprovedSummary:
    "Resting heart rate is lower than personal baseline, typically indicating a more relaxed recovery state.",
  restingHrImprovedEvidence: (delta: string) => [
    `Resting heart rate change: ${delta}`,
  ],

  hrvImprovedTitle: "HRV Above Baseline",
  hrvImprovedSummary: "HRV has recovered above baseline, typically indicating improved recovery resilience.",
  hrvImprovedEvidence: (delta: string) => [`HRV change: ${delta}`],

  hrvDeclinedTitle: "HRV Below Baseline",
  hrvDeclinedSummary: "HRV has fallen below recent personal baseline; recovery burden warrants attention.",
  hrvDeclinedEvidence: (delta: string) => [`HRV change: ${delta}`],

  activityUpTitle: "Recent Training Volume Increasing",
  activityUpSummary: "Exercise minutes exceed baseline; recent training adherence is stronger.",
  activityUpEvidence: (delta: string) => [`Exercise minute change: ${delta} min`],

  bodyMassDownTitle: "Weight Trending Down",
  bodyMassDownSummary:
    "30-day weight is below baseline; assess whether this aligns with activity levels and subjective state.",
  bodyMassDownEvidence: (delta: string, latest: string) => [
    `Weight change: ${delta}`,
    `Latest weight: ~${latest}`,
  ],

  menstrualRegularTitle: "Regular Menstrual Cycle",
  menstrualRegularSummary: (avg: number, std: number) =>
    `Average cycle ${avg} days, std dev ${std} days — cycle is stable.`,
  menstrualRegularEvidence: (periods: number, std: number) => [
    `${periods} cycles total`,
    `Std dev: ${std} days`,
  ],

  menstrualCycleShiftTitle: "Menstrual Cycle Length Shift",
  menstrualCycleShiftSummary: (recent: number, historical: number, delta: string) =>
    `Last 90 days average cycle ${recent} days, historical average ${historical} days, change ${delta} days.`,
  menstrualCycleShiftEvidence: (recent: number, historical: number) => [
    `Last 90 days average: ${recent} days`,
    `Historical average: ${historical} days`,
  ],

  // ── Interpretation hints ──────────────────────────────────────────
  hintSleepBelowLongTerm: (diff: number) =>
    `Recent sleep duration is ${diff} hours below the long-term average; this should take priority over increasing training volume.`,
  hintSleepAboveLongTerm: (diff: number) =>
    `Recent sleep duration is ${diff} hours above the long-term average, indicating a more adequate recovery window.`,
  hintRecoveryStress:
    "Resting heart rate above long-term average and HRV below — commonly seen with elevated recovery load, rising stress, or recent rhythm disruption.",
  hintRecoveryRelaxed:
    "Recovery metrics are more relaxed than long-term averages, usually meaning recent sleep, stress, and training are more sustainable.",
  hintSleepImprovedRecoveryLagging:
    "Sleep improvement has appeared first, but recovery metrics have not yet followed — better to maintain rhythm rather than increase volume immediately.",
  hintActivityUpWeightDown:
    "Activity above long-term average and weight below — if this is intentional, the direction is consistent; if not, watch intake and recovery.",
  hintActivityDownWeightUp:
    "Recent activity below long-term average while weight is above — better to restore stable activity and routines before pursuing intensity.",
  hintActivityUpRecoveryOk:
    "Recent activity above long-term average with no clear recovery deterioration signals — current load appears within tolerable range.",
  hintWeightDownActivityFlat:
    "Weight below long-term average but activity increase is not obvious; if this is not an intentional fat-loss goal, review diet, sleep, and recovery together.",
  hintSparseModules:
    "Historical span is long enough, but some recent module records are sparse; recent judgements should prioritise modules with more continuous records.",
  hintMenstrualRegular: (avg: number, std: number) =>
    `Menstrual cycle is regular (average ${avg} days, std dev ${std} days) — a positive signal for overall hormonal balance.`,
  hintMenstrualIrregular: (std: number) =>
    `Menstrual cycle is irregular (std dev ${std} days); consider sleep and stress data together, and consult a gynaecologist if needed.`,

  // ── Narrative context ─────────────────────────────────────────────
  narrativeAudience: "general user",
  narrativeGoal:
    "Combine the last 30 days, past 180 days, and full available history to generate an English health management report — no diagnoses.",
  narrativeBoundaries: [
    "Only reference facts from summary.json and insights.json",
    "May provide health management advice on sleep, recovery, activity, and body composition",
    "Prioritise historicalContext across 30-day, 180-day, and all-time windows — do not rely on a single window",
    "Do not generate medical diagnoses, disease assessments, or treatment plans",
    "When clear anomalies are present, a conservative follow-up or medical consultation reminder is acceptable",
  ],

  // ── Activity source ───────────────────────────────────────────────
  activitySource: "Activity Summaries + Workout Records",

  // ── Metadata ──────────────────────────────────────────────────────
  metadataLanguage: "en",
};
