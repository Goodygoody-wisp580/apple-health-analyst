import type { TrainingInsightsT } from "../zh/trainingInsights.js";

export const trainingInsightsEn: TrainingInsightsT = {
  trainingLoadChartTitle: "Training Load Curve (Fitness · Fatigue · Form)",
  trainingLoadChartSubtitle:
    "CTL = 42-day EWMA of daily load (fitness); ATL = 7-day EWMA (fatigue); TSB = CTL − ATL (form). Positive TSB = fresher, negative TSB = carrying fatigue.",
  ctlSeriesLabel: "Fitness (CTL)",
  atlSeriesLabel: "Fatigue (ATL)",
  tsbSeriesLabel: "Form (TSB)",
  trainingRecoveryChartTitle: "Training Load and Recovery Support Index",
  trainingRecoveryChartSubtitle:
    "All series are converted to indices where 100 equals the 12-month average; values above 100 are above personal norm.",
  trainingLoadIndexLabel: "Training Load Index",
  sleepSupportIndexLabel: "Sleep Support Index",
  hrvSupportIndexLabel: "HRV Support Index",
  restingHeartRateSupportIndexLabel: "Resting HR Support Index",
  sportTrendChartTitle: (sport) => `${sport} Monthly Rhythm`,
  sportTrendChartSubtitle: "Bars = monthly workout count (left axis); line = average duration per workout (right axis). Two orthogonal dimensions — how often and how long — together describe the rhythm better than either alone.",
  workoutCountLabel: "Monthly Workouts",
  avgWorkoutDurationLabel: "Avg Duration per Workout",
  chartUnitSessions: "sessions",
  chartUnitMinutes: "min",
  chartUnitIndex: "index",
  chartUnitMetMinutes: "MET·min",
  metadataLanguage: "en",
  outputSchemaVersion: "1.0.0",
  narrativeAudience: "general users",
  narrativeGoal:
    "Use Apple Health workout, sleep, and recovery data to produce an English training-status report focused on sport rhythm, recovery support, and overload risk.",
  narrativeBoundaries: [
    "Only cite facts from summary.json and insights.json",
    "Prioritise training rhythm, recovery support, sport-specific status, and health risks",
    "You may give training-adjustment and health-management advice, but not competitive prescriptions or diagnoses",
    "Do not fabricate Garmin-style proprietary scores that Apple Health cannot robustly reproduce",
    "Use conservative follow-up or medical reminders when signals look persistently abnormal",
  ],
};
