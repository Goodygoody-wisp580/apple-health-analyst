import type {
  SleepAnalysis,
  SleepSample,
  TimeWindow,
  WarningMessage,
} from "../types.js";

function round(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) {
    return null;
  }
  return Math.round(value * 100) / 100;
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function medianTime(values: Date[]): string | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values]
    .map((value) => value.getHours() * 60 + value.getMinutes())
    .sort((left, right) => left - right);
  const index = Math.floor(sorted.length / 2);
  const minutes = sorted[index];
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

type NightSummary = {
  nightKey: string;
  anchor: Date;
  totalSleepHours: number;
  awakeHours: number;
  coreHours: number;
  remHours: number;
  deepHours: number;
  unspecifiedHours: number;
  startDate: Date;
  endDate: Date;
};

function buildNightSummaries(records: SleepSample[], effectiveEnd: Date): NightSummary[] {
  const buckets = new Map<
    string,
    {
      anchor: Date;
      totalSleepHours: number;
      awakeHours: number;
      coreHours: number;
      remHours: number;
      deepHours: number;
      unspecifiedHours: number;
      startDate: Date;
      endDate: Date;
    }
  >();

  for (const record of records) {
    const anchor = new Date(record.startDate.getTime() - 12 * 60 * 60 * 1000);
    const nightKey = anchor.toISOString().slice(0, 10);
    const durationHours = (record.endDate.getTime() - record.startDate.getTime()) / (60 * 60 * 1000);
    const bucket =
      buckets.get(nightKey) ??
      {
        anchor: new Date(`${nightKey}T00:00:00`),
        totalSleepHours: 0,
        awakeHours: 0,
        coreHours: 0,
        remHours: 0,
        deepHours: 0,
        unspecifiedHours: 0,
        startDate: record.startDate,
        endDate: record.endDate,
      };

    if (record.startDate < bucket.startDate) {
      bucket.startDate = record.startDate;
    }
    if (record.endDate > bucket.endDate) {
      bucket.endDate = record.endDate;
    }

    if (/Awake/.test(record.value)) {
      bucket.awakeHours += durationHours;
    } else if (/AsleepCore/.test(record.value)) {
      bucket.totalSleepHours += durationHours;
      bucket.coreHours += durationHours;
    } else if (/AsleepREM/.test(record.value)) {
      bucket.totalSleepHours += durationHours;
      bucket.remHours += durationHours;
    } else if (/AsleepDeep/.test(record.value)) {
      bucket.totalSleepHours += durationHours;
      bucket.deepHours += durationHours;
    } else if (/Asleep/.test(record.value)) {
      bucket.totalSleepHours += durationHours;
      bucket.unspecifiedHours += durationHours;
    }

    buckets.set(nightKey, bucket);
  }

  return [...buckets.entries()]
    .map(([nightKey, bucket]) => ({
      nightKey,
      anchor: bucket.anchor,
      totalSleepHours: bucket.totalSleepHours,
      awakeHours: bucket.awakeHours,
      coreHours: bucket.coreHours,
      remHours: bucket.remHours,
      deepHours: bucket.deepHours,
      unspecifiedHours: bucket.unspecifiedHours,
      startDate: bucket.startDate,
      endDate: bucket.endDate,
    }))
    .filter((night) => night.startDate <= effectiveEnd)
    .sort((left, right) => left.anchor.getTime() - right.anchor.getTime());
}

function summarizeWindow(nights: NightSummary[]) {
  return {
    nights: nights.length,
    avgSleepHours: round(average(nights.map((night) => night.totalSleepHours))),
    avgAwakeHours: round(average(nights.map((night) => night.awakeHours))),
    medianBedtime: medianTime(nights.map((night) => night.startDate)),
    medianWakeTime: medianTime(nights.map((night) => night.endDate)),
    stagePct: {
      core: round(
        average(nights.filter((night) => night.totalSleepHours > 0).map((night) => (night.coreHours / night.totalSleepHours) * 100)),
      ),
      rem: round(
        average(nights.filter((night) => night.totalSleepHours > 0).map((night) => (night.remHours / night.totalSleepHours) * 100)),
      ),
      deep: round(
        average(nights.filter((night) => night.totalSleepHours > 0).map((night) => (night.deepHours / night.totalSleepHours) * 100)),
      ),
      unspecified: round(
        average(
          nights
            .filter((night) => night.totalSleepHours > 0)
            .map((night) => (night.unspecifiedHours / night.totalSleepHours) * 100),
        ),
      ),
    },
  };
}

function subtract(left: number | null, right: number | null): number | null {
  if (left === null || right === null) {
    return null;
  }
  return round(left - right);
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
        recent30d: summarizeWindow([]),
        baseline90d: summarizeWindow([]),
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
    recent30d: summarizeWindow(recent),
    baseline90d: summarizeWindow(baseline),
    delta: {
      sleepHours: subtract(
        summarizeWindow(recent).avgSleepHours,
        summarizeWindow(baseline).avgSleepHours,
      ),
      awakeHours: subtract(
        summarizeWindow(recent).avgAwakeHours,
        summarizeWindow(baseline).avgAwakeHours,
      ),
      corePct: subtract(
        summarizeWindow(recent).stagePct.core,
        summarizeWindow(baseline).stagePct.core,
      ),
      remPct: subtract(
        summarizeWindow(recent).stagePct.rem,
        summarizeWindow(baseline).stagePct.rem,
      ),
      deepPct: subtract(
        summarizeWindow(recent).stagePct.deep,
        summarizeWindow(baseline).stagePct.deep,
      ),
    },
    partialNights: partialNights.map((night) => ({
      date: night.nightKey,
      totalSleepHours: round(night.totalSleepHours) ?? 0,
    })),
    notes: staged
      ? ["睡眠阶段占比仅基于选定的主睡眠数据源计算。"]
      : ["选定的睡眠数据源不提供分阶段睡眠数据。"],
  };

  const warnings: WarningMessage[] = partialNights.map((night) => ({
    code: "partial_sleep_night",
    module: "sleep",
    message: `已将 ${night.nightKey} 排除在睡眠趋势之外，因为该夜晚仅包含 ${round(
      night.totalSleepHours,
    )} 小时睡眠。`,
  }));

  return { result, warnings };
}
