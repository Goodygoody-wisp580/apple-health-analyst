import {
  RECENT_DAYS,
  type ChartGranularity,
  type ChartPoint,
} from "../types.js";

const DAY_MS = 24 * 60 * 60 * 1000;

type AggregateMode = "average" | "sum" | "latest";

interface TimedValue {
  timestamp: Date;
  value: number | null;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return startOfDay(new Date(date.getTime() + diff * DAY_MS));
}

function endOfWeek(date: Date): Date {
  return endOfDay(new Date(startOfWeek(date).getTime() + 6 * DAY_MS));
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function round(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) {
    return null;
  }
  return Math.round(value * 100) / 100;
}

function daysAgo(anchor: Date, date: Date): number {
  return Math.floor((anchor.getTime() - date.getTime()) / DAY_MS);
}

export function selectGranularity(date: Date, anchorEnd: Date): ChartGranularity {
  const age = daysAgo(anchorEnd, date);
  if (age <= RECENT_DAYS) {
    return "day";
  }
  if (age <= 180) {
    return "week";
  }
  return "month";
}

function bucketWindow(date: Date, granularity: ChartGranularity): { start: Date; end: Date } {
  if (granularity === "day") {
    const start = startOfDay(date);
    return { start, end: endOfDay(start) };
  }
  if (granularity === "week") {
    const start = startOfWeek(date);
    return { start, end: endOfWeek(date) };
  }
  const start = startOfMonth(date);
  return { start, end: endOfMonth(date) };
}

function formatDatePart(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function labelForBucket(start: Date, end: Date, granularity: ChartGranularity): string {
  if (granularity === "day") {
    return formatDatePart(start);
  }
  if (granularity === "week") {
    return `${formatDatePart(start)} ~ ${formatDatePart(end)}`;
  }
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
}

export function compressTimeSeries(
  values: TimedValue[],
  anchorEnd: Date,
  aggregate: AggregateMode,
): ChartPoint[] {
  const buckets = new Map<
    string,
    {
      start: Date;
      end: Date;
      granularity: ChartGranularity;
      values: number[];
      latestValue: number | null;
    }
  >();

  for (const entry of values) {
    const granularity = selectGranularity(entry.timestamp, anchorEnd);
    const { start, end } = bucketWindow(entry.timestamp, granularity);
    const key = `${granularity}:${start.toISOString()}`;
    const bucket =
      buckets.get(key) ??
      {
        start,
        end,
        granularity,
        values: [],
        latestValue: null,
      };

    if (entry.value !== null) {
      bucket.values.push(entry.value);
      bucket.latestValue = entry.value;
    }

    buckets.set(key, bucket);
  }

  return [...buckets.values()]
    .sort((left, right) => left.start.getTime() - right.start.getTime())
    .map((bucket) => {
      let value: number | null = null;
      if (aggregate === "latest") {
        value = bucket.latestValue;
      } else if (bucket.values.length > 0) {
        const sum = bucket.values.reduce((accumulator, current) => accumulator + current, 0);
        value = aggregate === "sum" ? sum : sum / bucket.values.length;
      }

      return {
        start: bucket.start.toISOString(),
        end: bucket.end.toISOString(),
        granularity: bucket.granularity,
        label: labelForBucket(bucket.start, bucket.end, bucket.granularity),
        value: round(value),
        sampleCount: bucket.values.length,
      };
    });
}
