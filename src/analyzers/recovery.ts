import type {
  NumericComparison,
  QuantitySample,
  RecoveryAnalysis,
  RecoveryMetricKey,
  TimeWindow,
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

function uniqueDays(records: QuantitySample[]): number {
  return new Set(records.map((record) => record.startDate.toISOString().slice(0, 10))).size;
}

function summarizeMetric(
  records: QuantitySample[],
  sourceName: string,
  unitFallback: string,
  window: TimeWindow,
): NumericComparison {
  const recent = records.filter(
    (record) => record.startDate >= window.recentStart && record.startDate <= window.effectiveEnd,
  );
  const baseline = records.filter(
    (record) => record.startDate >= window.baselineStart && record.startDate < window.recentStart,
  );
  const latestRecord = [...records].sort(
    (left, right) => right.startDate.getTime() - left.startDate.getTime(),
  )[0];
  const recentAverage = average(recent.map((record) => record.value));
  const baselineAverage = average(baseline.map((record) => record.value));

  return {
    unit: latestRecord?.unit ?? unitFallback,
    source: sourceName,
    coverageDays: uniqueDays(records),
    sampleCount: records.length,
    recent30d: {
      sampleCount: recent.length,
      average: round(recentAverage),
    },
    baseline90d: {
      sampleCount: baseline.length,
      average: round(baselineAverage),
    },
    delta:
      recentAverage !== null && baselineAverage !== null ? round(recentAverage - baselineAverage) : null,
    latest: latestRecord
      ? {
          timestamp: latestRecord.startDate.toISOString(),
          value: round(latestRecord.value) ?? latestRecord.value,
        }
      : null,
  };
}

export function analyzeRecovery(
  recordsByMetric: Partial<Record<RecoveryMetricKey, QuantitySample[]>>,
  sourceNames: Partial<Record<RecoveryMetricKey, string>>,
  window: TimeWindow,
): RecoveryAnalysis {
  const metricUnits: Record<RecoveryMetricKey, string> = {
    restingHeartRate: "bpm",
    hrv: "ms",
    oxygenSaturation: "%",
    respiratoryRate: "breaths/min",
    vo2Max: "mL/min·kg",
  };

  const metrics = Object.fromEntries(
    (Object.keys(metricUnits) as RecoveryMetricKey[])
      .map((metric) => {
        const sourceName = sourceNames[metric];
        const records = (recordsByMetric[metric] ?? []).filter((record) =>
          window.effectiveStart ? record.startDate >= window.effectiveStart : true,
        );

        if (!sourceName || records.length === 0) {
          return [metric, undefined];
        }

        return [metric, summarizeMetric(records, sourceName, metricUnits[metric], window)];
      })
      .filter((entry) => Boolean(entry[1])),
  ) as RecoveryAnalysis["metrics"];

  const sources = Object.fromEntries(
    Object.entries(sourceNames).filter(([, value]) => Boolean(value)),
  ) as RecoveryAnalysis["sources"];

  return {
    status: Object.keys(metrics).length > 0 ? "ok" : "insufficient_data",
    sources,
    metrics,
    notes:
      Object.keys(metrics).length > 0
        ? ["恢复指标按各自的主数据源汇报，不会跨设备合并。"]
        : ["所选时间窗口内没有可用的恢复指标。"],
  };
}
