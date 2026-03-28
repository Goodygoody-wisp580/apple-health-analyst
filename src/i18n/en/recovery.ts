import type { RecoveryT } from "../zh/recovery.js";

export const recoveryEn: RecoveryT = {
  // ── Separators ──
  partSep: "; ",
  partEnd: ".",
  sentSep: ". ",

  // ── Direction words ──
  directionLow: "low",
  directionHigh: "high",

  // ── analyzeRecovery ──
  activeNote: "Recovery metrics are reported per their primary data source and are not merged across devices.",
  noDataNote: "No recovery metrics available in the selected time window.",

  // ── buildSpo2Assessment ──
  spo2NoData: "No blood oxygen data available.",
  spo2Normal: (avg) =>
    `Recent average SpO2 ${avg}%, within the normal range (>=95%). This indicates normal pulmonary gas exchange function.`,
  spo2Low: (avg) =>
    `Recent average SpO2 ${avg}%, at a low level (normal >=95%). Intermittent low oxygen saturation may be related to sleep apnea, high-altitude environments, or respiratory issues. Continued monitoring is recommended, especially if accompanied by daytime drowsiness or morning headaches.`,
  spo2Critical: (avg) =>
    `Recent average SpO2 ${avg}%, below the clinical concern threshold (93%). Persistently low oxygen saturation may indicate respiratory problems, cardiopulmonary dysfunction, or sleep apnea. Prompt medical consultation is recommended.`,

  // ── buildNormalRangeAssessment ──
  rhrExcellent: (avg) =>
    `Resting heart rate ${avg} bpm, in the excellent range for active individuals (40-60 bpm)`,
  rhrNormal: (avg) =>
    `Resting heart rate ${avg} bpm, within the normal range (60-100 bpm)`,
  rhrHigh: (avg) =>
    `Resting heart rate ${avg} bpm, above the normal upper limit (100 bpm); may be related to stress, dehydration, caffeine, or thyroid issues`,
  rhrLow: (avg) =>
    `Resting heart rate ${avg} bpm, on the low side; if you do not have a long-term exercise habit, cardiac conduction evaluation may be warranted`,

  hrvNote: (avg) =>
    `HRV average ${avg} ms - HRV varies greatly between individuals, so absolute values have limited reference value; trend changes are more important to monitor`,

  spo2InRangeNormal: (avg) =>
    `SpO2 ${avg}%, normal`,
  spo2InRangeLow: (avg) =>
    `SpO2 ${avg}%, low (normal >=95%); warrants attention`,

  rrNormal: (avg) =>
    `Respiratory rate ${avg} breaths/min, normal`,
  rrLow: (avg) =>
    `Respiratory rate ${avg} breaths/min, low (normal 12-20)`,
  rrHigh: (avg) =>
    `Respiratory rate ${avg} breaths/min, high (normal 12-20)`,

  vo2Good: (avg) =>
    `VO2 Max ${avg} mL/min·kg, good cardiorespiratory fitness`,
  vo2Moderate: (avg) =>
    `VO2 Max ${avg} mL/min·kg, moderate cardiorespiratory fitness with room for improvement`,
  vo2Low: (avg) =>
    `VO2 Max ${avg} mL/min·kg, low cardiorespiratory fitness; gradual increase in aerobic exercise is recommended`,

  normalRangeInsufficientData: "Insufficient recovery metric data for assessment.",

  // ── buildInterpretation ──
  interpretationInsufficientData: "Not enough records to provide a comprehensive interpretation.",

  coherencePositive: "Recovery metrics show a positive trend: resting heart rate declining + HRV rising, a classic signal of good autonomic nervous system recovery and increasing physical adaptability",
  coherenceNegative: "Recovery metrics are simultaneously weakening: resting heart rate rising + HRV declining, a signal of significant bodily stress that may be related to overtraining, sleep deprivation, mental stress, or fighting an infection",
  coherencePartialDecline: "Recovery metrics show partial deterioration signals. Consider evaluating in conjunction with recent sleep quality and training intensity",
  coherenceStable: "Recovery metrics remain stable with no significant trending changes",
  coherenceAccumulating: "Recovery metrics are available; baseline data is still accumulating and trend assessments will become more reliable over time",

  spo2LowContext: (avg) =>
    `Low SpO2 (${avg}%) warrants attention, especially if accompanied by daytime drowsiness or morning headaches - sleep apnea screening should be considered`,

  rhrHighContext: "Resting heart rate is elevated. If recent exercise and caffeine intake have been ruled out, evaluation for hyperthyroidism or anemia may be warranted",

  // ── buildActionableAdvice ──
  adviceBothWorsening: "Recovery metrics are simultaneously weakening. Consider reducing training intensity for the next 1-2 weeks and prioritize sleep and stress management.",
  adviceRhrWorsening: "Resting heart rate is trending upward. Check whether stress has increased, sleep has worsened, or training has been excessive recently, and ensure adequate recovery time.",
  adviceHrvWorsening: "HRV is trending downward, an early signal of declining recovery capacity. Schedule more recovery days and try meditation or deep breathing exercises (5-10 minutes daily).",
  adviceSpo2Low: "SpO2 is low. Watch for symptoms of sleep apnea such as snoring or nighttime awakenings, and consider polysomnography if needed.",
  adviceRhrHigh: "Resting heart rate is elevated. Regular aerobic exercise (e.g., brisk walking, swimming, 3-5 times per week, 30 minutes each) can effectively lower resting heart rate.",
  adviceVo2Low: "VO2 Max is low. Start with low-intensity aerobic exercise and gradually increase volume to improve cardiorespiratory fitness.",
  adviceGood: "Your recovery metrics are looking good overall. Keep up your current exercise routine and lifestyle rhythm.",
  adviceConsistentMeasurement: "Measure at the same time each day (e.g., right after waking) to make trend comparisons more reliable.",

  // ── buildDoctorTalkingPoints ──
  doctorRhrHigh: (avg) =>
    `"My resting heart rate has recently averaged ${avg} bpm, which is elevated. Should I get a thyroid check or an ECG?"`,
  doctorRhrRising: (delta) =>
    `"My resting heart rate has risen by ${delta} bpm recently. Is this change something to be concerned about?"`,
  doctorSpo2Low: (avg) =>
    `"My SpO2 averages ${avg}%, which is low. Should I be screened for sleep apnea or get a pulmonary function test?"`,
  doctorHrvDrop: (delta) =>
    `"My HRV has dropped by ${delta} ms recently. Could this reflect changes in autonomic nervous system function?"`,
  doctorRrAbnormal: (avg, direction) =>
    `"My respiratory rate averages ${avg} breaths/min, which is ${direction}. Should I get further evaluation?"`,
  doctorNormal: `"My recovery metrics look generally normal. Are there any preventive cardiovascular screenings you'd recommend?"`,
};
