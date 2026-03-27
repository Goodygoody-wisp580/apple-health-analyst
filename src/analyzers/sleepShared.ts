import type { SleepSample } from "../types.js";
import { round, average } from "./mathUtils.js";

export { round as roundNumber, average as averageNumbers };

export type NightSummary = {
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

export function buildNightSummaries(records: SleepSample[], effectiveEnd: Date): NightSummary[] {
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

export function summarizeSleepWindow(nights: NightSummary[]) {
  return {
    nights: nights.length,
    avgSleepHours: round(average(nights.map((night) => night.totalSleepHours))),
    avgAwakeHours: round(average(nights.map((night) => night.awakeHours))),
    medianBedtime: medianTime(nights.map((night) => night.startDate)),
    medianWakeTime: medianTime(nights.map((night) => night.endDate)),
    stagePct: {
      core: round(
        average(
          nights
            .filter((night) => night.totalSleepHours > 0)
            .map((night) => (night.coreHours / night.totalSleepHours) * 100),
        ),
      ),
      rem: round(
        average(
          nights
            .filter((night) => night.totalSleepHours > 0)
            .map((night) => (night.remHours / night.totalSleepHours) * 100),
        ),
      ),
      deep: round(
        average(
          nights
            .filter((night) => night.totalSleepHours > 0)
            .map((night) => (night.deepHours / night.totalSleepHours) * 100),
        ),
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
