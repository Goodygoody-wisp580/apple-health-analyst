import type {
  BodyMetricKey,
  ParsedHealthExport,
  PrimarySources,
  RecoveryMetricKey,
  SelectedSource,
  SleepSample,
  TimeWindow,
} from "../types.js";

import { looksWearableSource } from "./canonicalizeSource.js";

function isRecent(date: Date, window: TimeWindow): boolean {
  return date >= window.recentStart && date <= window.effectiveEnd;
}

function rankSources<T extends { canonicalSource: string; sourceName: string; startDate: Date }>(
  samples: T[],
  window: TimeWindow,
  preferWearables = false,
): SelectedSource[] {
  const buckets = new Map<
    string,
    { displayName: string; rawNames: Set<string>; recentSampleCount: number; totalSampleCount: number }
  >();

  for (const sample of samples) {
    const bucket =
      buckets.get(sample.canonicalSource) ??
      {
        displayName: sample.sourceName,
        rawNames: new Set<string>(),
        recentSampleCount: 0,
        totalSampleCount: 0,
      };

    bucket.rawNames.add(sample.sourceName);
    bucket.totalSampleCount += 1;
    if (isRecent(sample.startDate, window)) {
      bucket.recentSampleCount += 1;
    }
    buckets.set(sample.canonicalSource, bucket);
  }

  let selected = [...buckets.entries()].map(
    ([canonicalName, bucket]): SelectedSource => ({
      canonicalName,
      displayName: bucket.displayName,
      rawNames: [...bucket.rawNames].sort(),
      recentSampleCount: bucket.recentSampleCount,
      totalSampleCount: bucket.totalSampleCount,
    }),
  );

  if (preferWearables) {
    const wearableOnly = selected.filter((source) => looksWearableSource(source.displayName));
    if (wearableOnly.length > 0) {
      selected = wearableOnly;
    }
  }

  return selected.sort((left, right) => {
    if (right.recentSampleCount !== left.recentSampleCount) {
      return right.recentSampleCount - left.recentSampleCount;
    }
    if (right.totalSampleCount !== left.totalSampleCount) {
      return right.totalSampleCount - left.totalSampleCount;
    }
    return left.displayName.localeCompare(right.displayName);
  });
}

function selectSleepSource(records: SleepSample[], window: TimeWindow): PrimarySources["sleep"] {
  const buckets = new Map<
    string,
    {
      displayName: string;
      rawNames: Set<string>;
      totalSampleCount: number;
      recentSampleCount: number;
      recentNightKeys: Set<string>;
      staged: boolean;
    }
  >();

  for (const record of records) {
    const bucket =
      buckets.get(record.canonicalSource) ??
      {
        displayName: record.sourceName,
        rawNames: new Set<string>(),
        totalSampleCount: 0,
        recentSampleCount: 0,
        recentNightKeys: new Set<string>(),
        staged: false,
      };

    const staged = /Asleep(Core|REM|Deep)|Awake/.test(record.value);
    const nightKey = new Date(record.startDate.getTime() - 12 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    bucket.rawNames.add(record.sourceName);
    bucket.totalSampleCount += 1;
    bucket.staged ||= staged;
    if (isRecent(record.startDate, window)) {
      bucket.recentSampleCount += 1;
      bucket.recentNightKeys.add(nightKey);
    }
    buckets.set(record.canonicalSource, bucket);
  }

  const ranked = [...buckets.entries()]
    .map(([canonicalName, bucket]) => ({
      canonicalName,
      displayName: bucket.displayName,
      rawNames: [...bucket.rawNames].sort(),
      recentSampleCount: bucket.recentSampleCount,
      totalSampleCount: bucket.totalSampleCount,
      staged: bucket.staged,
      recentNightCount: bucket.recentNightKeys.size,
    }))
    .sort((left, right) => {
      if (Number(right.staged) !== Number(left.staged)) {
        return Number(right.staged) - Number(left.staged);
      }
      if (right.recentNightCount !== left.recentNightCount) {
        return right.recentNightCount - left.recentNightCount;
      }
      if (right.recentSampleCount !== left.recentSampleCount) {
        return right.recentSampleCount - left.recentSampleCount;
      }
      return right.totalSampleCount - left.totalSampleCount;
    });

  return ranked[0] ?? null;
}

function firstOrNull<T>(values: T[]): T | undefined {
  return values[0];
}

export function selectPrimarySources(parsed: ParsedHealthExport, window: TimeWindow): PrimarySources {
  const recoveryMetrics: RecoveryMetricKey[] = [
    "restingHeartRate",
    "hrv",
    "oxygenSaturation",
    "respiratoryRate",
    "vo2Max",
  ];
  const bodyMetrics: BodyMetricKey[] = ["bodyMass", "bodyFatPercentage"];

  return {
    sleep: selectSleepSource(parsed.records.sleep, window),
    recovery: Object.fromEntries(
      recoveryMetrics
        .map((metric) => [metric, firstOrNull(rankSources(parsed.records[metric], window, true))])
        .filter((entry) => Boolean(entry[1])),
    ) as PrimarySources["recovery"],
    bodyComposition: Object.fromEntries(
      bodyMetrics
        .map((metric) => [metric, firstOrNull(rankSources(parsed.records[metric], window))])
        .filter((entry) => Boolean(entry[1])),
    ) as PrimarySources["bodyComposition"],
    activity: "ActivitySummary + Workout",
  };
}
