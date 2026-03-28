import type { SleepT } from "../zh/sleep.js";

export const sleepEn: SleepT = {
  // ── Separators ──
  partSep: "; ",
  partEnd: ".",
  sentSep: ". ",

  // ── analyzeSleep ──
  noSleepRecords: "No sleep records available in the selected time window.",
  stagedNote: "Sleep stage percentages are calculated based on the selected primary sleep data source only.",
  unstagedNote: "The selected sleep data source does not provide staged sleep data.",
  partialNightWarning: (nightKey, hours) =>
    `Excluded ${nightKey} from sleep trends as it contains only ${hours} hours of sleep.`,

  // ── buildDeepSleepAssessment ──
  deepSleepNoData: "The current data source does not provide sleep stage data; deep sleep assessment is unavailable.",
  deepSleepNormal: (deep) =>
    `Deep sleep at ${deep}%, within the normal range (13-23%). Deep sleep is a critical phase for growth hormone secretion, tissue repair, and immune system consolidation.`,
  deepSleepLow: (deep) =>
    `Deep sleep at ${deep}%, below the normal range (13-23%). Low deep sleep may be related to alcohol intake, caffeine, pre-sleep screen use, sleep environment (temperature/noise), or aging. Deep sleep is essential for physical recovery and immune function.`,
  deepSleepHigh: (deep) =>
    `Deep sleep at ${deep}%, above the typical range (13-23%). This may reflect compensatory recovery after a prior period of sleep deprivation, or device measurement variance. If you have recently increased exercise or experienced fatigue, this temporary increase in deep sleep is a normal physiological adjustment.`,

  // ── buildRemSleepAssessment ──
  remSleepNoData: "The current data source does not provide sleep stage data; REM sleep assessment is unavailable.",
  remSleepNormal: (rem) =>
    `REM sleep at ${rem}%, within the normal range (20-25%). REM sleep is essential for emotional regulation, memory consolidation, and learning capacity.`,
  remSleepLow: (rem) =>
    `REM sleep at ${rem}%, below the normal range (20-25%). Low REM may be related to stress, antidepressant medications, alcohol, or insufficient total sleep time (REM concentrates in the second half of the night). This may affect emotional regulation and cognitive function.`,
  remSleepHigh: (rem) =>
    `REM sleep at ${rem}%, above the typical range (20-25%). Elevated REM is sometimes associated with sleep debt recovery, discontinuation of REM-suppressing medications, or device measurement variance.`,

  // ── buildNormalRangeAssessment ──
  normalRangeInsufficientData: "Insufficient data for assessment.",

  // Total sleep
  avgSleepNormal: (avg) =>
    `Average sleep ${avg} hours, within the recommended range (7-9 hours)`,
  avgSleepSlightlyLow: (avg) =>
    `Average sleep ${avg} hours, slightly below the recommended range (7-9 hours); chronic deficiency may impair attention, immunity, and metabolic health`,
  avgSleepVeryLow: (avg) =>
    `Average sleep only ${avg} hours, significantly below the recommended range (7-9 hours); chronic sleep deprivation is strongly associated with cardiovascular risk, immune suppression, and cognitive decline`,
  avgSleepHigh: (avg) =>
    `Average sleep ${avg} hours, exceeding the recommended upper limit (9 hours); excessively long sleep is sometimes associated with poor sleep quality or underlying health conditions`,

  // Deep sleep in normal range
  deepSleepInRange: (deep) =>
    `Deep sleep ${deep}%, within normal range`,
  deepSleepOutOfRangeLow: (deep) =>
    `Deep sleep ${deep}%, below normal (13-23%)`,
  deepSleepOutOfRangeHigh: (deep) =>
    `Deep sleep ${deep}%, above normal (13-23%)`,

  // REM in normal range
  remSleepInRange: (rem) =>
    `REM sleep ${rem}%, within normal range`,
  remSleepOutOfRangeLow: (rem) =>
    `REM sleep ${rem}%, below normal (20-25%)`,
  remSleepOutOfRangeHigh: (rem) =>
    `REM sleep ${rem}%, above normal (20-25%)`,

  // Bedtime
  bedtimeIdeal: (bedtime) =>
    `Median bedtime ${bedtime}, aligning with an ideal circadian rhythm window`,
  bedtimeLate: (bedtime) =>
    `Median bedtime ${bedtime}, relatively late; this may reduce deep sleep proportion and next-day energy`,

  // ── buildInterpretation ──
  interpretationInsufficientData: "Not enough records for a comprehensive interpretation. We recommend tracking at least 7 nights.",

  // Overall signal
  overallHealthyWithDeep: "Your sleep is overall healthy: adequate duration with deep sleep in the normal range, which is highly beneficial for physical recovery and cognitive performance",
  overallDurationOk: "Your sleep duration meets the recommended target, a foundation for daytime energy and immune function",
  overallDurationLow: "Your sleep duration is below recommended levels; this may be quietly affecting your attention, emotional stability, and physical recovery",
  overallDurationHigh: "Your sleep duration is longer than typical; if you still feel fatigued, consider focusing on sleep efficiency rather than duration alone",

  // Trend
  trendImproving: (delta) =>
    `Recent sleep has increased by approximately ${delta} hours compared to baseline, trending in a positive direction`,
  trendDeclining: (delta) =>
    `Recent sleep has decreased by approximately ${delta} hours compared to baseline; if you are experiencing daytime drowsiness or reduced concentration, this may be the primary cause`,
  trendStable: "Recent sleep duration remains stable compared to baseline, with no significant fluctuation",

  // Stage composition
  stagesBothLow: "Both deep sleep and REM are below normal; sleep architecture may need optimization - these two stages are responsible for physical recovery and cognitive/emotional regulation respectively",
  stagesDeepLow: "Deep sleep proportion is low; deep sleep is the core phase for growth hormone secretion and immune repair, and is worth prioritizing for improvement",
  stagesRemLow: "REM sleep is low; insufficient REM may affect daytime emotional resilience and creative thinking",

  // ── buildActionableAdvice ──
  adviceSleepMore: "Try moving your bedtime 15-30 minutes earlier, gradually increasing total sleep duration - drastic schedule changes are harder to sustain.",
  adviceDeepSleep: "To improve deep sleep: avoid alcohol and caffeine 4 hours before bed, keep bedroom temperature at 18-20°C (65-68°F), and reduce blue light exposure 1 hour before sleep.",
  adviceRemSleep: "Low REM may be related to stress or late bedtimes (REM concentrates in the second half of the night). Regular sleep schedules and stress management can help improve REM proportion.",
  adviceDeclining: "Sleep has been trending downward recently. Consider reviewing contributing factors: work stress, screen time, caffeine intake, or changes in exercise timing.",
  adviceBedtimeLate: "Your bedtime is relatively late. Try to fall asleep before 23:00 to maximize deep sleep, which concentrates in the first half of the night.",
  adviceGood: "Your sleep is in good shape. Keep maintaining a regular schedule and a healthy sleep environment.",
  adviceConsistentWake: "Wake up at the same time every day (including weekends). A stable circadian rhythm is the cornerstone of high-quality sleep.",

  // ── buildDoctorTalkingPoints ──
  doctorLowSleep: (avg) =>
    `"My average sleep is only ${avg} hours. Should I get a sleep quality evaluation if this persists?"`,
  doctorLowDeep: (deep) =>
    `"My deep sleep is only ${deep}%. Should I be screened for sleep apnea or other sleep disorders?"`,
  doctorDeclining: (delta) =>
    `"My sleep duration has dropped by about ${delta} hours recently. Is this change something to be concerned about?"`,
  doctorLongSleep: (avg) =>
    `"I sleep ${avg} hours per night but still feel tired. Should I check thyroid function or other potential causes?"`,
  doctorLateBedtime: (bedtime) =>
    `"I usually don't fall asleep until ${bedtime}. What specific health impacts could this late-sleep pattern have?"`,
  doctorNormal: `"My sleep data looks generally normal. Are there any preventive recommendations?"`,
};
