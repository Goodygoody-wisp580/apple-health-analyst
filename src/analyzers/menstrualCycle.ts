import type {
  ContraceptiveSample,
  DetectedPeriod,
  IntermenstrualBleedingSample,
  MenstrualCycleAnalysis,
  MenstrualFlowSample,
  MenstrualRegularity,
  TimeWindow,
  WarningMessage,
} from "../types.js";

import { round } from "./mathUtils.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: Date, b: Date): number {
  return Math.round(Math.abs(b.getTime() - a.getTime()) / DAY_MS);
}

function parseFlowLevel(value: string): keyof DetectedPeriod["flowIntensity"] {
  if (/Light/i.test(value)) return "light";
  if (/Medium/i.test(value)) return "medium";
  if (/Heavy/i.test(value)) return "heavy";
  if (/None/i.test(value)) return "none";
  return "unspecified";
}

function stdDev(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function detectPeriods(flowSamples: MenstrualFlowSample[]): DetectedPeriod[] {
  const sorted = [...flowSamples].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );

  // Filter out "None" flow — those are explicitly "no bleeding" markers
  const withFlow = sorted.filter((s) => !/None/i.test(s.value));
  if (withFlow.length === 0) return [];

  const periods: DetectedPeriod[] = [];
  let currentDays: MenstrualFlowSample[] = [withFlow[0]];

  for (let i = 1; i < withFlow.length; i++) {
    const prev = currentDays[currentDays.length - 1];
    const curr = withFlow[i];
    const gap = daysBetween(prev.startDate, curr.startDate);

    if (gap <= 2) {
      // Same period (allow 1-day gap for skipped logging)
      currentDays.push(curr);
    } else {
      // New period — finalize previous
      periods.push(buildPeriod(currentDays));
      currentDays = [curr];
    }
  }
  periods.push(buildPeriod(currentDays));

  return periods;
}

function buildPeriod(days: MenstrualFlowSample[]): DetectedPeriod {
  const startDate = days[0].startDate;
  const endDate = days[days.length - 1].startDate;
  const durationDays = daysBetween(startDate, endDate) + 1;
  const flowIntensity = { light: 0, medium: 0, heavy: 0, unspecified: 0, none: 0 };

  for (const day of days) {
    const level = parseFlowLevel(day.value);
    flowIntensity[level]++;
  }

  return {
    startDate: toDateKey(startDate),
    endDate: toDateKey(endDate),
    durationDays,
    flowIntensity,
  };
}

export function calculateCycleLengths(periods: DetectedPeriod[]): number[] {
  if (periods.length < 2) return [];

  const lengths: number[] = [];
  for (let i = 1; i < periods.length; i++) {
    const prev = new Date(periods[i - 1].startDate);
    const curr = new Date(periods[i].startDate);
    const days = daysBetween(prev, curr);
    // Filter out implausible values (missed tracking or data gaps)
    if (days >= 15 && days <= 90) {
      lengths.push(days);
    }
  }
  return lengths;
}

function classifyRegularity(std: number | null): MenstrualRegularity | null {
  if (std === null) return null;
  if (std <= 3) return "regular";
  if (std <= 7) return "somewhat_irregular";
  return "irregular";
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function analyzeMenstrualCycle(
  flowSamples: MenstrualFlowSample[],
  intermenstrualSamples: IntermenstrualBleedingSample[],
  contraceptiveSamples: ContraceptiveSample[],
  window: TimeWindow,
): { result: MenstrualCycleAnalysis; warnings: WarningMessage[] } {
  const warnings: WarningMessage[] = [];

  if (flowSamples.length === 0) {
    return {
      result: {
        status: "insufficient_data",
        source: null,
        totalPeriods: 0,
        coverageDays: 0,
        avgCycleLengthDays: null,
        cycleLengthStdDays: null,
        avgPeriodDurationDays: null,
        regularity: null,
        recentCycles: [],
        flowDistribution: { light: 0, medium: 0, heavy: 0, unspecified: 0 },
        intermenstrualBleedingCount: 0,
        intermenstrualBleedingFrequencyPerCycle: null,
        contraceptiveUse: null,
        recent90d: { periods: 0, avgCycleLengthDays: null, intermenstrualBleedingDays: 0 },
        historical: { periods: 0, avgCycleLengthDays: null },
        healthInsights: {
          cycleTrend: null, cycleTrendDelta: null, periodDurationTrend: null,
          flowPattern: "", normalRangeAssessment: "", interpretation: "",
          actionableAdvice: [], doctorTalkingPoints: [],
        },
        notes: [],
      },
      warnings,
    };
  }

  const source = flowSamples[0].sourceName;
  const periods = detectPeriods(flowSamples);
  const cycleLengths = calculateCycleLengths(periods);

  // Coverage
  const uniqueDays = new Set(flowSamples.map((s) => toDateKey(s.startDate)));
  const coverageDays = uniqueDays.size;

  // Averages
  const avgCycleLength = round(average(cycleLengths));
  const cycleLengthStd = round(stdDev(cycleLengths));
  const avgPeriodDuration = round(average(periods.map((p) => p.durationDays)));
  const regularity = classifyRegularity(cycleLengthStd);

  // Flow distribution (excluding "none")
  const totalFlowDays = periods.reduce(
    (sum, p) => sum + p.flowIntensity.light + p.flowIntensity.medium + p.flowIntensity.heavy + p.flowIntensity.unspecified,
    0,
  );
  const flowDistribution = {
    light: totalFlowDays > 0
      ? round(periods.reduce((s, p) => s + p.flowIntensity.light, 0) / totalFlowDays * 100) ?? 0
      : 0,
    medium: totalFlowDays > 0
      ? round(periods.reduce((s, p) => s + p.flowIntensity.medium, 0) / totalFlowDays * 100) ?? 0
      : 0,
    heavy: totalFlowDays > 0
      ? round(periods.reduce((s, p) => s + p.flowIntensity.heavy, 0) / totalFlowDays * 100) ?? 0
      : 0,
    unspecified: totalFlowDays > 0
      ? round(periods.reduce((s, p) => s + p.flowIntensity.unspecified, 0) / totalFlowDays * 100) ?? 0
      : 0,
  };

  // Recent cycles (last 6)
  const recentCycles = periods.slice(-6).map((period, idx, arr) => {
    const allPeriods = periods;
    const globalIdx = allPeriods.indexOf(period);
    let cycleLengthDays: number | null = null;
    if (globalIdx > 0) {
      const prev = new Date(allPeriods[globalIdx - 1].startDate);
      const curr = new Date(period.startDate);
      const days = daysBetween(prev, curr);
      if (days >= 15 && days <= 90) cycleLengthDays = days;
    }
    return {
      periodStart: period.startDate,
      cycleLengthDays,
      periodDurationDays: period.durationDays,
    };
  });

  // Intermenstrual bleeding
  const intermenstrualBleedingCount = intermenstrualSamples.length;
  const intermenstrualBleedingFrequencyPerCycle =
    cycleLengths.length > 0
      ? round(intermenstrualBleedingCount / (cycleLengths.length + 1))
      : null;

  // Contraceptive
  const contraceptiveUse = contraceptiveSamples.length > 0
    ? contraceptiveSamples[contraceptiveSamples.length - 1].value
        .replace(/HKCategoryValueContraceptive/i, "")
        .replace(/([A-Z])/g, " $1")
        .trim()
    : null;

  // Recent 90d vs historical
  const recent90dStart = new Date(window.effectiveEnd.getTime() - 89 * DAY_MS);
  const recent90dPeriods = periods.filter((p) => new Date(p.startDate) >= recent90dStart);
  const recent90dCycleLengths = calculateCycleLengths(recent90dPeriods);
  const recent90dIntermenstrual = intermenstrualSamples.filter(
    (s) => s.startDate >= recent90dStart && s.startDate <= window.effectiveEnd,
  );

  const historicalPeriods = periods.filter((p) => new Date(p.startDate) < recent90dStart);
  const historicalCycleLengths = calculateCycleLengths(historicalPeriods);

  // ── Health Insights: trend detection, pattern interpretation, actionable advice ──

  const recentAvgCycle = round(average(recent90dCycleLengths));
  const historicalAvgCycle = round(average(historicalCycleLengths));
  const cycleTrendDelta =
    recentAvgCycle !== null && historicalAvgCycle !== null && historicalCycleLengths.length >= 3
      ? round(recentAvgCycle - historicalAvgCycle)
      : null;
  const cycleTrend: MenstrualCycleAnalysis["healthInsights"]["cycleTrend"] =
    cycleTrendDelta === null ? null
    : cycleTrendDelta >= 3 ? "lengthening"
    : cycleTrendDelta <= -3 ? "shortening"
    : "stable";

  // Period duration trend (recent 6 vs earlier)
  const recentDurations = periods.slice(-6).map((p) => p.durationDays);
  const earlierDurations = periods.slice(0, -6).map((p) => p.durationDays);
  const recentDurAvg = average(recentDurations);
  const earlierDurAvg = average(earlierDurations);
  const durDelta = recentDurAvg !== null && earlierDurAvg !== null && earlierDurations.length >= 3
    ? recentDurAvg - earlierDurAvg : null;
  const periodDurationTrend: MenstrualCycleAnalysis["healthInsights"]["periodDurationTrend"] =
    durDelta === null ? null : durDelta >= 1 ? "lengthening" : durDelta <= -1 ? "shortening" : "stable";

  // Flow pattern interpretation
  const flowPattern = buildFlowPatternDescription(flowDistribution, periodDurationTrend);

  // Normal range assessment
  const normalRangeAssessment = buildNormalRangeAssessment(avgCycleLength, avgPeriodDuration, regularity);

  // Comprehensive interpretation
  const interpretation = buildInterpretation(
    avgCycleLength, cycleLengthStd, regularity, cycleTrend, cycleTrendDelta,
    periodDurationTrend, intermenstrualBleedingFrequencyPerCycle, contraceptiveUse, periods.length,
  );

  // Actionable advice
  const actionableAdvice = buildActionableAdvice(
    regularity, cycleTrend, periodDurationTrend,
    intermenstrualBleedingFrequencyPerCycle, contraceptiveUse, avgCycleLength,
  );

  // Doctor talking points
  const doctorTalkingPoints = buildDoctorTalkingPoints(
    avgCycleLength, cycleLengthStd, regularity, cycleTrend, cycleTrendDelta,
    intermenstrualBleedingFrequencyPerCycle, avgPeriodDuration, periodDurationTrend,
  );

  // Notes
  const notes: string[] = [];
  if (periods.length < 3) {
    notes.push("生理周期记录较少，周期规律性评估可信度有限。");
  }
  if (contraceptiveUse) {
    notes.push(`检测到避孕药使用记录（${contraceptiveUse}），可能影响周期规律性。`);
  }
  if (intermenstrualBleedingCount > 0) {
    notes.push(`检测到 ${intermenstrualBleedingCount} 次经间期出血记录。`);
  }

  // Warnings
  if (regularity === "irregular") {
    warnings.push({
      code: "menstrual_irregular",
      module: "menstrualCycle",
      message: `生理周期不规律，周期标准差 ${cycleLengthStd} 天。`,
    });
  }
  if (avgCycleLength !== null && (avgCycleLength < 21 || avgCycleLength > 38)) {
    warnings.push({
      code: "menstrual_cycle_length",
      module: "menstrualCycle",
      message: `平均周期 ${avgCycleLength} 天，偏离正常范围（21-38 天）。`,
    });
  }

  return {
    result: {
      status: periods.length >= 2 ? "ok" : "insufficient_data",
      source,
      totalPeriods: periods.length,
      coverageDays,
      avgCycleLengthDays: avgCycleLength,
      cycleLengthStdDays: cycleLengthStd,
      avgPeriodDurationDays: avgPeriodDuration,
      regularity,
      recentCycles,
      flowDistribution,
      intermenstrualBleedingCount,
      intermenstrualBleedingFrequencyPerCycle,
      contraceptiveUse,
      recent90d: {
        periods: recent90dPeriods.length,
        avgCycleLengthDays: recentAvgCycle,
        intermenstrualBleedingDays: recent90dIntermenstrual.length,
      },
      historical: {
        periods: historicalPeriods.length,
        avgCycleLengthDays: historicalAvgCycle,
      },
      healthInsights: {
        cycleTrend,
        cycleTrendDelta,
        periodDurationTrend,
        flowPattern,
        normalRangeAssessment,
        interpretation,
        actionableAdvice,
        doctorTalkingPoints,
      },
      notes,
    },
    warnings,
  };
}

// ── Health Insight Builders ──

function buildFlowPatternDescription(
  dist: MenstrualCycleAnalysis["flowDistribution"],
  durationTrend: MenstrualCycleAnalysis["healthInsights"]["periodDurationTrend"],
): string {
  const dominant = dist.heavy >= 40 ? "偏重" : dist.light >= 40 ? "偏轻" : "中等";
  const parts: string[] = [];

  if (dominant === "偏重") {
    parts.push(`经期出血以中重量为主（重度占 ${dist.heavy}%），重度出血比例偏高可能与子宫内膜增厚、激素波动或子宫肌瘤等因素有关`);
  } else if (dominant === "偏轻") {
    parts.push(`经期出血以轻量为主（轻度占 ${dist.light}%），通常提示子宫内膜较薄或激素水平偏低`);
  } else {
    parts.push(`经期出血量分布较均匀（轻度 ${dist.light}%、中度 ${dist.medium}%、重度 ${dist.heavy}%），整体在正常范围内`);
  }

  if (durationTrend === "lengthening") {
    parts.push("近期经期天数呈延长趋势，如果伴随出血量增加，建议留意是否有贫血症状（疲劳、头晕）");
  } else if (durationTrend === "shortening") {
    parts.push("近期经期天数有缩短趋势，如果同时出血量减少，可能与压力、体重变化或激素调节有关");
  }

  return parts.join("；") + "。";
}

function buildNormalRangeAssessment(
  avgCycle: number | null,
  avgDuration: number | null,
  regularity: MenstrualRegularity | null,
): string {
  if (avgCycle === null) return "数据不足，无法评估。";

  const parts: string[] = [];

  // Cycle length assessment
  if (avgCycle >= 24 && avgCycle <= 35) {
    parts.push(`平均周期 ${avgCycle} 天，处于理想范围（24-35 天）`);
  } else if (avgCycle >= 21 && avgCycle <= 38) {
    parts.push(`平均周期 ${avgCycle} 天，在临床正常范围（21-38 天）内，但偏${avgCycle < 24 ? "短" : "长"}，值得持续观察`);
  } else {
    parts.push(`平均周期 ${avgCycle} 天，已超出临床正常范围（21-38 天），建议咨询妇科医生排查原因`);
  }

  // Duration assessment
  if (avgDuration !== null) {
    if (avgDuration >= 3 && avgDuration <= 7) {
      parts.push(`经期平均 ${avgDuration} 天，在正常范围内`);
    } else if (avgDuration < 3) {
      parts.push(`经期平均仅 ${avgDuration} 天，偏短，可能提示排卵功能或子宫内膜状况需要关注`);
    } else {
      parts.push(`经期平均 ${avgDuration} 天，偏长（正常为 3-7 天），长期偏长的经期可能增加贫血风险`);
    }
  }

  // Regularity context
  if (regularity === "regular") {
    parts.push("周期规律性良好，这通常反映下丘脑-垂体-卵巢轴（HPO 轴）功能协调");
  } else if (regularity === "somewhat_irregular") {
    parts.push("周期有一定波动但仍在可接受范围，压力、睡眠变化、跨时区旅行等都可能引起短期波动");
  } else if (regularity === "irregular") {
    parts.push("周期波动较大，可能与多囊卵巢综合征（PCOS）、甲状腺功能异常、过度运动或体重剧烈变化有关");
  }

  return parts.join("；") + "。";
}

function buildInterpretation(
  avgCycle: number | null,
  std: number | null,
  regularity: MenstrualRegularity | null,
  cycleTrend: MenstrualCycleAnalysis["healthInsights"]["cycleTrend"],
  cycleTrendDelta: number | null,
  periodDurationTrend: MenstrualCycleAnalysis["healthInsights"]["periodDurationTrend"],
  intermenstrualFreq: number | null,
  contraceptive: string | null,
  totalPeriods: number,
): string {
  if (avgCycle === null || totalPeriods < 3) return "记录不足，暂时无法给出综合解读。建议持续记录至少 3 个完整周期。";

  const parts: string[] = [];

  // Overall health signal
  if (regularity === "regular" && avgCycle >= 24 && avgCycle <= 35) {
    parts.push("你的生理周期整体健康：周期规律、长度正常，这是内分泌系统运转良好的积极信号");
  } else if (regularity === "regular") {
    parts.push("周期虽然规律，但长度偏离理想范围，建议下次体检时让医生评估一下激素水平");
  } else {
    parts.push("周期存在一定波动，不一定代表异常，但值得结合生活方式综合判断");
  }

  // Trend interpretation
  if (cycleTrend === "lengthening" && cycleTrendDelta !== null) {
    parts.push(`近期周期比历史平均延长了约 ${Math.abs(cycleTrendDelta)} 天。周期逐渐变长可能与压力增加、体重变化、睡眠节律紊乱或接近围绝经期有关`);
  } else if (cycleTrend === "shortening" && cycleTrendDelta !== null) {
    parts.push(`近期周期比历史平均缩短了约 ${Math.abs(cycleTrendDelta)} 天。周期缩短有时与黄体期缩短有关，如果在备孕期间尤其值得关注`);
  } else if (cycleTrend === "stable") {
    parts.push("近期周期与历史平均保持一致，没有明显的趋势性变化");
  }

  // Intermenstrual bleeding context
  if (intermenstrualFreq !== null && intermenstrualFreq > 0.5) {
    parts.push("经间期出血较频繁。偶尔的排卵期出血属于正常现象，但如果每个周期都出现，建议排查宫颈息肉、内膜异常或激素失衡");
  } else if (intermenstrualFreq !== null && intermenstrualFreq > 0) {
    parts.push("有少量经间期出血记录，如果为排卵期少量点滴出血属于正常生理现象");
  }

  // Contraceptive context
  if (contraceptive) {
    parts.push(`数据中有口服避孕药使用记录。激素类避孕药会直接调节周期，使用期间的周期数据反映的是药物调控后的模式而非自然周期`);
  }

  return parts.join("。") + "。";
}

function buildActionableAdvice(
  regularity: MenstrualRegularity | null,
  cycleTrend: MenstrualCycleAnalysis["healthInsights"]["cycleTrend"],
  periodDurationTrend: MenstrualCycleAnalysis["healthInsights"]["periodDurationTrend"],
  intermenstrualFreq: number | null,
  contraceptive: string | null,
  avgCycle: number | null,
): string[] {
  const advice: string[] = [];

  if (regularity === "irregular" || regularity === "somewhat_irregular") {
    advice.push("保持规律的作息时间——昼夜节律紊乱是影响生理周期的重要因素，固定起床时间比固定入睡时间更关键。");
  }

  if (cycleTrend === "lengthening") {
    advice.push("近期周期在变长，建议关注压力管理和营养均衡，持续观察 2-3 个周期看是否自行恢复。");
  } else if (cycleTrend === "shortening") {
    advice.push("近期周期在缩短，注意观察经期出血量是否同步减少，如果连续缩短建议检查黄体功能。");
  }

  if (periodDurationTrend === "lengthening") {
    advice.push("经期天数呈延长趋势，留意是否有疲劳、面色苍白等贫血迹象，必要时检查血常规。");
  }

  if (intermenstrualFreq !== null && intermenstrualFreq > 0.5) {
    advice.push("经间期出血频繁出现，建议预约妇科检查，排查宫颈和子宫内膜情况。");
  }

  if (avgCycle !== null && (avgCycle < 21 || avgCycle > 38)) {
    advice.push("周期长度偏离正常范围，建议进行激素六项检查（FSH、LH、E2、P、T、PRL），明确内分泌状态。");
  }

  // Universal good practices
  if (advice.length === 0) {
    advice.push("你的周期状态良好，继续保持规律的生活节奏和适度运动。");
  }
  advice.push("坚持记录每次经期的起止日期和出血量，持续的数据积累能帮助更早发现潜在变化。");

  return advice;
}

function buildDoctorTalkingPoints(
  avgCycle: number | null,
  std: number | null,
  regularity: MenstrualRegularity | null,
  cycleTrend: MenstrualCycleAnalysis["healthInsights"]["cycleTrend"],
  cycleTrendDelta: number | null,
  intermenstrualFreq: number | null,
  avgDuration: number | null,
  periodDurationTrend: MenstrualCycleAnalysis["healthInsights"]["periodDurationTrend"],
): string[] {
  const points: string[] = [];

  if (avgCycle !== null && (avgCycle < 21 || avgCycle > 38)) {
    points.push(`"我的生理周期平均 ${avgCycle} 天，偏离正常范围，是否需要做激素检查？"`);
  }

  if (regularity === "irregular" && std !== null) {
    points.push(`"我的周期波动比较大（标准差 ${std} 天），这可能和哪些因素有关？需要排查 PCOS 吗？"`);
  }

  if (cycleTrend === "lengthening" && cycleTrendDelta !== null) {
    points.push(`"我注意到近几个月周期在变长（延长了约 ${Math.abs(cycleTrendDelta)} 天），这是需要关注的信号吗？"`);
  } else if (cycleTrend === "shortening" && cycleTrendDelta !== null) {
    points.push(`"我的周期近期在缩短（缩短了约 ${Math.abs(cycleTrendDelta)} 天），是否需要检查黄体功能？"`);
  }

  if (intermenstrualFreq !== null && intermenstrualFreq > 0.3) {
    points.push(`"我经常在两次经期之间有少量出血，这种情况需要做什么检查？"`);
  }

  if (avgDuration !== null && avgDuration > 7) {
    points.push(`"我的经期平均持续 ${avgDuration} 天，偏长，是否需要检查子宫内膜或排查肌瘤？"`);
  }

  if (periodDurationTrend === "lengthening") {
    points.push(`"我感觉最近几次经期比以前长，出血量也可能在增加，需要查一下血常规吗？"`);
  }

  if (points.length === 0) {
    points.push(`"我的生理周期数据整体看起来正常，有没有什么预防性的检查建议？"`);
  }

  return points;
}
