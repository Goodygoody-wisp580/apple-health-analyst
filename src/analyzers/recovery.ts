import type {
  NumericComparison,
  QuantitySample,
  RecoveryAnalysis,
  RecoveryHealthInsights,
  RecoveryMetricKey,
  TimeWindow,
} from "../types.js";

import type { RecoveryT } from "../i18n/zh/recovery.js";

import { round, average } from "./mathUtils.js";

const EMPTY_HEALTH_INSIGHTS: RecoveryHealthInsights = {
  rhrTrend: null,
  hrvTrend: null,
  spo2Assessment: "",
  normalRangeAssessment: "",
  interpretation: "",
  actionableAdvice: [],
  doctorTalkingPoints: [],
};

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
  t: RecoveryT,
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

  const healthInsights = buildRecoveryHealthInsights(metrics, t);

  return {
    status: Object.keys(metrics).length > 0 ? "ok" : "insufficient_data",
    sources,
    metrics,
    healthInsights,
    notes:
      Object.keys(metrics).length > 0
        ? [t.activeNote]
        : [t.noDataNote],
  };
}

// ── Health Insight Builders ──

function buildRecoveryHealthInsights(
  metrics: RecoveryAnalysis["metrics"],
  t: RecoveryT,
): RecoveryHealthInsights {
  if (Object.keys(metrics).length === 0) return EMPTY_HEALTH_INSIGHTS;

  const rhr = metrics.restingHeartRate;
  const hrv = metrics.hrv;
  const spo2 = metrics.oxygenSaturation;

  return {
    rhrTrend: buildRhrTrend(rhr),
    hrvTrend: buildHrvTrend(hrv),
    spo2Assessment: buildSpo2Assessment(spo2, t),
    normalRangeAssessment: buildNormalRangeAssessment(metrics, t),
    interpretation: buildInterpretation(metrics, t),
    actionableAdvice: buildActionableAdvice(metrics, t),
    doctorTalkingPoints: buildDoctorTalkingPoints(metrics, t),
  };
}

function buildRhrTrend(rhr: NumericComparison | undefined): RecoveryHealthInsights["rhrTrend"] {
  if (!rhr?.delta) return null;
  // Lower RHR is better
  if (rhr.delta <= -2) return "improving";
  if (rhr.delta >= 2) return "worsening";
  return "stable";
}

function buildHrvTrend(hrv: NumericComparison | undefined): RecoveryHealthInsights["hrvTrend"] {
  if (!hrv?.delta) return null;
  // Higher HRV is better
  if (hrv.delta >= 3) return "improving";
  if (hrv.delta <= -3) return "worsening";
  return "stable";
}

function buildSpo2Assessment(spo2: NumericComparison | undefined, t: RecoveryT): string {
  if (!spo2?.recent30d.average) return t.spo2NoData;
  const avg = spo2.recent30d.average;
  if (avg >= 95) {
    return t.spo2Normal(avg);
  }
  if (avg >= 93) {
    return t.spo2Low(avg);
  }
  return t.spo2Critical(avg);
}

function buildNormalRangeAssessment(metrics: RecoveryAnalysis["metrics"], t: RecoveryT): string {
  const parts: string[] = [];
  const rhr = metrics.restingHeartRate;
  const hrv = metrics.hrv;
  const spo2 = metrics.oxygenSaturation;
  const rr = metrics.respiratoryRate;
  const vo2 = metrics.vo2Max;

  if (rhr?.recent30d.average) {
    const avg = rhr.recent30d.average;
    if (avg >= 40 && avg <= 60) {
      parts.push(t.rhrExcellent(avg));
    } else if (avg > 60 && avg <= 100) {
      parts.push(t.rhrNormal(avg));
    } else if (avg > 100) {
      parts.push(t.rhrHigh(avg));
    } else {
      parts.push(t.rhrLow(avg));
    }
  }

  if (hrv?.recent30d.average) {
    const avg = hrv.recent30d.average;
    parts.push(t.hrvNote(avg));
  }

  if (spo2?.recent30d.average) {
    const avg = spo2.recent30d.average;
    if (avg >= 95) {
      parts.push(t.spo2InRangeNormal(avg));
    } else {
      parts.push(t.spo2InRangeLow(avg));
    }
  }

  if (rr?.recent30d.average) {
    const avg = rr.recent30d.average;
    if (avg >= 12 && avg <= 20) {
      parts.push(t.rrNormal(avg));
    } else if (avg < 12) {
      parts.push(t.rrLow(avg));
    } else {
      parts.push(t.rrHigh(avg));
    }
  }

  if (vo2?.recent30d.average) {
    const avg = vo2.recent30d.average;
    if (avg >= 40) {
      parts.push(t.vo2Good(avg));
    } else if (avg >= 30) {
      parts.push(t.vo2Moderate(avg));
    } else {
      parts.push(t.vo2Low(avg));
    }
  }

  return parts.length > 0 ? parts.join(t.partSep) + t.partEnd : t.normalRangeInsufficientData;
}

function buildInterpretation(metrics: RecoveryAnalysis["metrics"], t: RecoveryT): string {
  if (Object.keys(metrics).length === 0) return t.interpretationInsufficientData;

  const rhr = metrics.restingHeartRate;
  const hrv = metrics.hrv;
  const spo2 = metrics.oxygenSaturation;
  const parts: string[] = [];

  // Recovery coherence: RHR + HRV together tell a story
  const rhrTrend = buildRhrTrend(rhr);
  const hrvTrend = buildHrvTrend(hrv);

  if (rhrTrend === "improving" && hrvTrend === "improving") {
    parts.push(t.coherencePositive);
  } else if (rhrTrend === "worsening" && hrvTrend === "worsening") {
    parts.push(t.coherenceNegative);
  } else if (rhrTrend === "worsening" || hrvTrend === "worsening") {
    parts.push(t.coherencePartialDecline);
  } else if (rhrTrend === "stable" && hrvTrend === "stable") {
    parts.push(t.coherenceStable);
  } else if (rhr?.recent30d.average != null || hrv?.recent30d.average != null) {
    parts.push(t.coherenceAccumulating);
  }

  // SpO2 context
  if (spo2?.recent30d.average && spo2.recent30d.average < 95) {
    parts.push(t.spo2LowContext(spo2.recent30d.average));
  }

  // RHR absolute value context
  if (rhr?.recent30d.average && rhr.recent30d.average > 100) {
    parts.push(t.rhrHighContext);
  }

  return parts.length > 0 ? parts.join(t.sentSep) + t.partEnd : "";
}

function buildActionableAdvice(metrics: RecoveryAnalysis["metrics"], t: RecoveryT): string[] {
  const advice: string[] = [];
  const rhr = metrics.restingHeartRate;
  const hrv = metrics.hrv;
  const spo2 = metrics.oxygenSaturation;

  const rhrTrend = buildRhrTrend(rhr);
  const hrvTrend = buildHrvTrend(hrv);

  if (rhrTrend === "worsening" && hrvTrend === "worsening") {
    advice.push(t.adviceBothWorsening);
  } else if (rhrTrend === "worsening") {
    advice.push(t.adviceRhrWorsening);
  } else if (hrvTrend === "worsening") {
    advice.push(t.adviceHrvWorsening);
  }

  if (spo2?.recent30d.average && spo2.recent30d.average < 95) {
    advice.push(t.adviceSpo2Low);
  }

  if (rhr?.recent30d.average && rhr.recent30d.average > 80) {
    advice.push(t.adviceRhrHigh);
  }

  const vo2 = metrics.vo2Max;
  if (vo2?.recent30d.average && vo2.recent30d.average < 30) {
    advice.push(t.adviceVo2Low);
  }

  if (advice.length === 0) {
    advice.push(t.adviceGood);
  }
  advice.push(t.adviceConsistentMeasurement);

  return advice;
}

function buildDoctorTalkingPoints(metrics: RecoveryAnalysis["metrics"], t: RecoveryT): string[] {
  const points: string[] = [];
  const rhr = metrics.restingHeartRate;
  const hrv = metrics.hrv;
  const spo2 = metrics.oxygenSaturation;
  const rr = metrics.respiratoryRate;

  if (rhr?.recent30d.average && rhr.recent30d.average > 100) {
    points.push(t.doctorRhrHigh(rhr.recent30d.average));
  }

  if (rhr?.delta && rhr.delta >= 5) {
    points.push(t.doctorRhrRising(rhr.delta));
  }

  if (spo2?.recent30d.average && spo2.recent30d.average < 95) {
    points.push(t.doctorSpo2Low(spo2.recent30d.average));
  }

  if (hrv?.delta && hrv.delta <= -10) {
    points.push(t.doctorHrvDrop(Math.abs(hrv.delta)));
  }

  if (rr?.recent30d.average && (rr.recent30d.average < 12 || rr.recent30d.average > 20)) {
    const direction = rr.recent30d.average < 12 ? t.directionLow : t.directionHigh;
    points.push(t.doctorRrAbnormal(rr.recent30d.average, direction));
  }

  if (points.length === 0) {
    points.push(t.doctorNormal);
  }

  return points;
}
