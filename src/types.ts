export const PACKAGE_NAME = "apple-health-analyst";
export const PACKAGE_VERSION = "1.0.0";
export const RECENT_DAYS = 30;
export const BASELINE_DAYS = 90;

export type MetricKey =
  | "sleep"
  | "restingHeartRate"
  | "hrv"
  | "oxygenSaturation"
  | "respiratoryRate"
  | "vo2Max"
  | "bodyMass"
  | "bodyFatPercentage";

export type RecoveryMetricKey =
  | "restingHeartRate"
  | "hrv"
  | "oxygenSaturation"
  | "respiratoryRate"
  | "vo2Max";

export type BodyMetricKey = "bodyMass" | "bodyFatPercentage";

export type OutputFormat = "markdown" | "json" | "html";

export type ModuleStatus = "ok" | "insufficient_data";

export interface BaseSample {
  sourceName: string;
  canonicalSource: string;
  startDate: Date;
  endDate: Date;
}

export interface SleepSample extends BaseSample {
  metric: "sleep";
  value: string;
}

export interface QuantitySample extends BaseSample {
  metric: Exclude<MetricKey, "sleep">;
  value: number;
  unit?: string;
}

export interface WorkoutSample {
  sourceName: string;
  canonicalSource: string;
  workoutActivityType: string;
  durationMinutes: number | null;
  startDate: Date;
  endDate: Date;
}

export interface ActivitySummarySample {
  date: Date;
  activeEnergyBurned: number | null;
  appleExerciseTime: number | null;
  appleStandHours: number | null;
}

export interface AttachmentSummary {
  ecgFiles: number;
  workoutRouteFiles: number;
  imageAttachments: number;
  otherFiles: number;
  exampleFiles: string[];
}

export interface SourceSummary {
  canonicalName: string;
  displayName: string;
  rawNames: string[];
  recordCount: number;
  workoutCount: number;
  metricCounts: Partial<Record<MetricKey, number>>;
}

export interface ParsedHealthExport {
  inputPath: string;
  mainXmlEntry: string;
  locale: string | null;
  exportDate: Date | null;
  coverageStart: Date | null;
  coverageEnd: Date | null;
  recordCount: number;
  workoutCount: number;
  activitySummaryCount: number;
  sources: SourceSummary[];
  records: {
    sleep: SleepSample[];
    restingHeartRate: QuantitySample[];
    hrv: QuantitySample[];
    oxygenSaturation: QuantitySample[];
    respiratoryRate: QuantitySample[];
    vo2Max: QuantitySample[];
    bodyMass: QuantitySample[];
    bodyFatPercentage: QuantitySample[];
  };
  workouts: WorkoutSample[];
  activitySummaries: ActivitySummarySample[];
  attachments: AttachmentSummary;
}

export interface TimeWindow {
  requestedFrom: Date | null;
  requestedTo: Date | null;
  effectiveStart: Date | null;
  effectiveEnd: Date;
  recentStart: Date;
  baselineStart: Date;
}

export interface SelectedSource {
  canonicalName: string;
  displayName: string;
  rawNames: string[];
  recentSampleCount: number;
  totalSampleCount: number;
}

export interface PrimarySources {
  sleep: (SelectedSource & { staged: boolean; recentNightCount: number }) | null;
  recovery: Partial<Record<RecoveryMetricKey, SelectedSource>>;
  bodyComposition: Partial<Record<BodyMetricKey, SelectedSource>>;
  activity: string;
}

export interface WarningMessage {
  code: string;
  module: "sleep" | "recovery" | "activity" | "bodyComposition" | "overview";
  message: string;
}

export interface NumericWindow {
  sampleCount: number;
  average: number | null;
}

export interface NumericComparison {
  unit: string;
  source: string;
  coverageDays: number;
  sampleCount: number;
  recent30d: NumericWindow;
  baseline90d: NumericWindow;
  delta: number | null;
  latest: { timestamp: string; value: number } | null;
}

export interface SleepWindowSummary {
  nights: number;
  avgSleepHours: number | null;
  avgAwakeHours: number | null;
  medianBedtime: string | null;
  medianWakeTime: string | null;
  stagePct: {
    core: number | null;
    rem: number | null;
    deep: number | null;
    unspecified: number | null;
  };
}

export interface SleepAnalysis {
  status: ModuleStatus;
  source: string | null;
  coverageDays: number;
  sampleCount: number;
  staged: boolean;
  recent30d: SleepWindowSummary;
  baseline90d: SleepWindowSummary;
  delta: {
    sleepHours: number | null;
    awakeHours: number | null;
    corePct: number | null;
    remPct: number | null;
    deepPct: number | null;
  };
  partialNights: Array<{ date: string; totalSleepHours: number }>;
  notes: string[];
}

export interface RecoveryAnalysis {
  status: ModuleStatus;
  sources: Partial<Record<RecoveryMetricKey, string>>;
  metrics: Partial<Record<RecoveryMetricKey, NumericComparison>>;
  notes: string[];
}

export interface ActivityWindowSummary {
  dayCount: number;
  activeEnergyBurnedKcal: number | null;
  exerciseMinutes: number | null;
  standHours: number | null;
  workouts: number;
  topWorkoutTypes: Array<{ type: string; count: number }>;
}

export interface ActivityAnalysis {
  status: ModuleStatus;
  source: string;
  coverageDays: number;
  recent30d: ActivityWindowSummary;
  baseline90d: ActivityWindowSummary;
  delta: {
    activeEnergyBurnedKcal: number | null;
    exerciseMinutes: number | null;
    standHours: number | null;
    workouts: number | null;
  };
  notes: string[];
}

export interface BodyCompositionAnalysis {
  status: ModuleStatus;
  sources: Partial<Record<BodyMetricKey, string>>;
  metrics: Partial<Record<BodyMetricKey, NumericComparison>>;
  notes: string[];
}

export interface AnalysisSummary {
  metadata: {
    tool: string;
    version: string;
    generatedAt: string;
  };
  input: {
    zipPath: string;
    mainXmlEntry: string;
    from: string | null;
    to: string | null;
    exportDate: string | null;
    locale: string | null;
  };
  coverage: {
    recordCount: number;
    workoutCount: number;
    activitySummaryCount: number;
    earliestSeen: string | null;
    latestSeen: string | null;
    windowStart: string | null;
    windowEnd: string;
  };
  sources: {
    discovered: SourceSummary[];
    primary: {
      sleep: string | null;
      recovery: Partial<Record<RecoveryMetricKey, string>>;
      bodyComposition: Partial<Record<BodyMetricKey, string>>;
      activity: string;
    };
  };
  warnings: WarningMessage[];
  sleep: SleepAnalysis;
  recovery: RecoveryAnalysis;
  activity: ActivityAnalysis;
  bodyComposition: BodyCompositionAnalysis;
  attachments: AttachmentSummary;
}
