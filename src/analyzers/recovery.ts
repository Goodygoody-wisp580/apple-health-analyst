import type {
  NumericComparison,
  QuantitySample,
  RecoveryAnalysis,
  RecoveryHealthInsights,
  RecoveryMetricKey,
  TimeWindow,
} from "../types.js";

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

  const healthInsights = buildRecoveryHealthInsights(metrics);

  return {
    status: Object.keys(metrics).length > 0 ? "ok" : "insufficient_data",
    sources,
    metrics,
    healthInsights,
    notes:
      Object.keys(metrics).length > 0
        ? ["恢复指标按各自的主数据源汇报，不会跨设备合并。"]
        : ["所选时间窗口内没有可用的恢复指标。"],
  };
}

// ── Health Insight Builders ──

function buildRecoveryHealthInsights(
  metrics: RecoveryAnalysis["metrics"],
): RecoveryHealthInsights {
  if (Object.keys(metrics).length === 0) return EMPTY_HEALTH_INSIGHTS;

  const rhr = metrics.restingHeartRate;
  const hrv = metrics.hrv;
  const spo2 = metrics.oxygenSaturation;

  return {
    rhrTrend: buildRhrTrend(rhr),
    hrvTrend: buildHrvTrend(hrv),
    spo2Assessment: buildSpo2Assessment(spo2),
    normalRangeAssessment: buildNormalRangeAssessment(metrics),
    interpretation: buildInterpretation(metrics),
    actionableAdvice: buildActionableAdvice(metrics),
    doctorTalkingPoints: buildDoctorTalkingPoints(metrics),
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

function buildSpo2Assessment(spo2: NumericComparison | undefined): string {
  if (!spo2?.recent30d.average) return "无血氧数据。";
  const avg = spo2.recent30d.average;
  if (avg >= 95) {
    return `近期平均血氧 ${avg}%，处于正常范围（≥95%）。这表明肺部气体交换功能正常。`;
  }
  if (avg >= 93) {
    return `近期平均血氧 ${avg}%，处于偏低水平（正常 ≥95%）。间歇性低血氧可能与睡眠呼吸暂停、高海拔环境或呼吸系统问题有关，建议持续监测并关注是否伴随白天嗜睡或晨起头痛。`;
  }
  return `近期平均血氧 ${avg}%，低于临床关注阈值（93%）。持续偏低的血氧可能提示呼吸系统问题、心肺功能异常或睡眠呼吸暂停，建议尽快咨询医生。`;
}

function buildNormalRangeAssessment(metrics: RecoveryAnalysis["metrics"]): string {
  const parts: string[] = [];
  const rhr = metrics.restingHeartRate;
  const hrv = metrics.hrv;
  const spo2 = metrics.oxygenSaturation;
  const rr = metrics.respiratoryRate;
  const vo2 = metrics.vo2Max;

  if (rhr?.recent30d.average) {
    const avg = rhr.recent30d.average;
    if (avg >= 40 && avg <= 60) {
      parts.push(`静息心率 ${avg} bpm，处于运动人群的优秀范围（40-60 bpm）`);
    } else if (avg > 60 && avg <= 100) {
      parts.push(`静息心率 ${avg} bpm，处于正常范围（60-100 bpm）`);
    } else if (avg > 100) {
      parts.push(`静息心率 ${avg} bpm，高于正常上限（100 bpm），可能与压力、脱水、咖啡因或甲状腺问题有关`);
    } else {
      parts.push(`静息心率 ${avg} bpm，偏低，如果没有长期运动习惯，建议排查心脏传导系统`);
    }
  }

  if (hrv?.recent30d.average) {
    const avg = hrv.recent30d.average;
    parts.push(`HRV 均值 ${avg} ms——HRV 个体差异大，绝对值的参考意义有限，更重要的是观察趋势变化`);
  }

  if (spo2?.recent30d.average) {
    const avg = spo2.recent30d.average;
    if (avg >= 95) {
      parts.push(`血氧 ${avg}%，正常`);
    } else {
      parts.push(`血氧 ${avg}%，偏低（正常 ≥95%），需关注`);
    }
  }

  if (rr?.recent30d.average) {
    const avg = rr.recent30d.average;
    if (avg >= 12 && avg <= 20) {
      parts.push(`呼吸频率 ${avg} 次/分，正常`);
    } else {
      parts.push(`呼吸频率 ${avg} 次/分，偏${avg < 12 ? "低" : "高"}（正常 12-20）`);
    }
  }

  if (vo2?.recent30d.average) {
    const avg = vo2.recent30d.average;
    if (avg >= 40) {
      parts.push(`VO2 Max ${avg} mL/min·kg，心肺耐力良好`);
    } else if (avg >= 30) {
      parts.push(`VO2 Max ${avg} mL/min·kg，心肺耐力中等，有提升空间`);
    } else {
      parts.push(`VO2 Max ${avg} mL/min·kg，心肺耐力偏低，建议逐步增加有氧运动`);
    }
  }

  return parts.length > 0 ? parts.join("；") + "。" : "恢复指标数据不足，无法评估。";
}

function buildInterpretation(metrics: RecoveryAnalysis["metrics"]): string {
  if (Object.keys(metrics).length === 0) return "记录不足，暂时无法给出综合解读。";

  const rhr = metrics.restingHeartRate;
  const hrv = metrics.hrv;
  const spo2 = metrics.oxygenSaturation;
  const parts: string[] = [];

  // Recovery coherence: RHR + HRV together tell a story
  const rhrTrend = buildRhrTrend(rhr);
  const hrvTrend = buildHrvTrend(hrv);

  if (rhrTrend === "improving" && hrvTrend === "improving") {
    parts.push("恢复指标呈现积极趋势：静息心率下降 + HRV 上升，这是自主神经系统恢复良好、身体适应性增强的典型信号");
  } else if (rhrTrend === "worsening" && hrvTrend === "worsening") {
    parts.push("恢复指标同步走弱：静息心率上升 + HRV 下降，这是身体承受较大压力的信号，可能与过度训练、睡眠不足、精神压力或正在对抗感染有关");
  } else if (rhrTrend === "worsening" || hrvTrend === "worsening") {
    parts.push("恢复指标出现部分退化信号，建议结合近期的睡眠质量和训练强度综合判断");
  } else if (rhrTrend === "stable" && hrvTrend === "stable") {
    parts.push("恢复指标保持稳定，没有明显的趋势性变化");
  } else if (rhr?.recent30d.average != null || hrv?.recent30d.average != null) {
    parts.push("恢复指标可用，基线数据正在积累中，后续趋势判断会更可靠");
  }

  // SpO2 context
  if (spo2?.recent30d.average && spo2.recent30d.average < 95) {
    parts.push(`血氧偏低（${spo2.recent30d.average}%）值得关注，特别是如果伴随白天嗜睡或晨起头痛，应排查睡眠呼吸暂停`);
  }

  // RHR absolute value context
  if (rhr?.recent30d.average && rhr.recent30d.average > 100) {
    parts.push("静息心率偏高，如果排除近期运动或咖啡因影响，建议检查是否存在甲状腺功能亢进或贫血");
  }

  return parts.length > 0 ? parts.join("。") + "。" : "";
}

function buildActionableAdvice(metrics: RecoveryAnalysis["metrics"]): string[] {
  const advice: string[] = [];
  const rhr = metrics.restingHeartRate;
  const hrv = metrics.hrv;
  const spo2 = metrics.oxygenSaturation;

  const rhrTrend = buildRhrTrend(rhr);
  const hrvTrend = buildHrvTrend(hrv);

  if (rhrTrend === "worsening" && hrvTrend === "worsening") {
    advice.push("恢复指标同步走弱，建议在接下来 1-2 周降低训练强度，优先保证睡眠和压力管理。");
  } else if (rhrTrend === "worsening") {
    advice.push("静息心率呈上升趋势，关注近期是否有压力增加、睡眠变差或过度训练，确保充分的恢复时间。");
  } else if (hrvTrend === "worsening") {
    advice.push("HRV 呈下降趋势，这是身体恢复能力下降的早期信号。增加恢复日安排，尝试冥想或深呼吸练习（每天 5-10 分钟）。");
  }

  if (spo2?.recent30d.average && spo2.recent30d.average < 95) {
    advice.push("血氧偏低，建议留意是否有打鼾、夜间憋醒等睡眠呼吸暂停的症状，必要时做多导睡眠监测。");
  }

  if (rhr?.recent30d.average && rhr.recent30d.average > 80) {
    advice.push("静息心率偏高，规律的有氧运动（如快走、游泳，每周 3-5 次，每次 30 分钟）可以有效降低静息心率。");
  }

  const vo2 = metrics.vo2Max;
  if (vo2?.recent30d.average && vo2.recent30d.average < 30) {
    advice.push("VO2 Max 偏低，建议从低强度有氧开始，逐步增加运动量以提升心肺耐力。");
  }

  if (advice.length === 0) {
    advice.push("你的恢复指标整体良好，继续保持当前的运动和生活节奏。");
  }
  advice.push("保持测量时间的一致性（如每天早起后测量），这能让趋势对比更可靠。");

  return advice;
}

function buildDoctorTalkingPoints(metrics: RecoveryAnalysis["metrics"]): string[] {
  const points: string[] = [];
  const rhr = metrics.restingHeartRate;
  const hrv = metrics.hrv;
  const spo2 = metrics.oxygenSaturation;
  const rr = metrics.respiratoryRate;

  if (rhr?.recent30d.average && rhr.recent30d.average > 100) {
    points.push(`"我的静息心率最近平均 ${rhr.recent30d.average} bpm，偏高，需要检查甲状腺或做心电图吗？"`);
  }

  if (rhr?.delta && rhr.delta >= 5) {
    points.push(`"我的静息心率近期上升了 ${rhr.delta} bpm，这种变化是否需要关注？"`);
  }

  if (spo2?.recent30d.average && spo2.recent30d.average < 95) {
    points.push(`"我的血氧平均 ${spo2.recent30d.average}%，偏低，是否需要做睡眠呼吸暂停筛查或肺功能检查？"`);
  }

  if (hrv?.delta && hrv.delta <= -10) {
    points.push(`"我的 HRV 近期下降了 ${Math.abs(hrv.delta)} ms，这是否反映自主神经功能的变化？"`);
  }

  if (rr?.recent30d.average && (rr.recent30d.average < 12 || rr.recent30d.average > 20)) {
    points.push(`"我的呼吸频率平均 ${rr.recent30d.average} 次/分，偏${rr.recent30d.average < 12 ? "低" : "高"}，需要进一步检查吗？"`);
  }

  if (points.length === 0) {
    points.push(`"我的恢复指标数据整体看起来正常，有没有什么预防性的心血管检查建议？"`);
  }

  return points;
}
