import { BASELINE_DAYS, RECENT_DAYS, type TimeWindow } from "../types.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }
  const candidate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(candidate.getTime())) {
    throw new Error(`Invalid date: ${value}. Expected YYYY-MM-DD.`);
  }
  return candidate;
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function subtractDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * DAY_MS);
}

export function buildTimeWindow(
  rawFrom: string | undefined,
  rawTo: string | undefined,
  anchorEnd: Date,
): TimeWindow {
  const requestedFrom = parseDateOnly(rawFrom);
  const requestedTo = rawTo ? endOfDay(parseDateOnly(rawTo) as Date) : null;

  if (requestedFrom && requestedTo && requestedFrom > requestedTo) {
    throw new Error("--from must be earlier than or equal to --to.");
  }

  const effectiveEnd = requestedTo ?? anchorEnd;
  const effectiveStart = requestedFrom;
  const recentStart = subtractDays(effectiveEnd, RECENT_DAYS);
  const baselineStart = subtractDays(recentStart, BASELINE_DAYS);

  return {
    requestedFrom,
    requestedTo,
    effectiveStart,
    effectiveEnd,
    recentStart,
    baselineStart,
  };
}

export function isWithinWindow(date: Date, window: TimeWindow): boolean {
  if (window.effectiveStart && date < window.effectiveStart) {
    return false;
  }
  if (date > window.effectiveEnd) {
    return false;
  }
  return true;
}
