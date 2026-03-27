import type {
  SleepAnalysis,
  SleepHealthInsights,
  SleepSample,
  SleepWindowSummary,
  TimeWindow,
  WarningMessage,
} from "../types.js";

import { round, subtract } from "./mathUtils.js";
import { buildNightSummaries, summarizeSleepWindow } from "./sleepShared.js";

const EMPTY_HEALTH_INSIGHTS: SleepHealthInsights = {
  sleepTrend: null,
  sleepTrendDelta: null,
  deepSleepAssessment: "",
  remSleepAssessment: "",
  normalRangeAssessment: "",
  interpretation: "",
  actionableAdvice: [],
  doctorTalkingPoints: [],
};

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
        recent30d: summarizeSleepWindow([]),
        baseline90d: summarizeSleepWindow([]),
        delta: {
          sleepHours: null,
          awakeHours: null,
          corePct: null,
          remPct: null,
          deepPct: null,
        },
        partialNights: [],
        healthInsights: EMPTY_HEALTH_INSIGHTS,
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

  const recentSummary = summarizeSleepWindow(recent);
  const baselineSummary = summarizeSleepWindow(baseline);

  const delta = {
    sleepHours: subtract(recentSummary.avgSleepHours, baselineSummary.avgSleepHours),
    awakeHours: subtract(recentSummary.avgAwakeHours, baselineSummary.avgAwakeHours),
    corePct: subtract(recentSummary.stagePct.core, baselineSummary.stagePct.core),
    remPct: subtract(recentSummary.stagePct.rem, baselineSummary.stagePct.rem),
    deepPct: subtract(recentSummary.stagePct.deep, baselineSummary.stagePct.deep),
  };

  const healthInsights = buildSleepHealthInsights(recentSummary, baselineSummary, delta, staged);

  const result: SleepAnalysis = {
    status: validNights.length > 0 ? "ok" : "insufficient_data",
    source: sourceName,
    coverageDays: validNights.length,
    sampleCount: records.length,
    staged,
    recent30d: recentSummary,
    baseline90d: baselineSummary,
    delta,
    partialNights: partialNights.map((night) => ({
      date: night.nightKey,
      totalSleepHours: round(night.totalSleepHours) ?? 0,
    })),
    healthInsights,
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

// ── Health Insight Builders ──

function buildSleepHealthInsights(
  recent: SleepWindowSummary,
  baseline: SleepWindowSummary,
  delta: SleepAnalysis["delta"],
  staged: boolean,
): SleepHealthInsights {
  if (recent.nights === 0) return EMPTY_HEALTH_INSIGHTS;

  const { trend, trendDelta } = buildSleepTrend(delta);

  return {
    sleepTrend: trend,
    sleepTrendDelta: trendDelta,
    deepSleepAssessment: buildDeepSleepAssessment(recent.stagePct, staged),
    remSleepAssessment: buildRemSleepAssessment(recent.stagePct, staged),
    normalRangeAssessment: buildNormalRangeAssessment(recent, staged),
    interpretation: buildInterpretation(recent, baseline, delta, staged, trend),
    actionableAdvice: buildActionableAdvice(recent, delta, staged, trend),
    doctorTalkingPoints: buildDoctorTalkingPoints(recent, delta, staged),
  };
}

function buildSleepTrend(
  delta: SleepAnalysis["delta"],
): { trend: SleepHealthInsights["sleepTrend"]; trendDelta: number | null } {
  if (delta.sleepHours === null) return { trend: null, trendDelta: null };
  const trend =
    delta.sleepHours >= 0.5 ? "improving"
    : delta.sleepHours <= -0.5 ? "declining"
    : "stable";
  return { trend, trendDelta: delta.sleepHours };
}

function buildDeepSleepAssessment(
  stagePct: SleepWindowSummary["stagePct"],
  staged: boolean,
): string {
  if (!staged || stagePct.deep === null) {
    return "当前数据源不提供睡眠阶段数据，无法评估深度睡眠占比。";
  }
  const deep = stagePct.deep;
  if (deep >= 13 && deep <= 23) {
    return `深度睡眠占比 ${deep}%，处于正常范围（13-23%）。深度睡眠是身体分泌生长激素、修复组织和巩固免疫系统的关键阶段。`;
  }
  if (deep < 13) {
    return `深度睡眠占比 ${deep}%，低于正常范围（13-23%）。深睡不足可能与酒精摄入、咖啡因、入睡前屏幕使用、睡眠环境（温度/噪音）或年龄增长有关。深度睡眠对身体恢复和免疫功能至关重要。`;
  }
  return `深度睡眠占比 ${deep}%，高于典型范围（13-23%）。这可能反映前一阶段睡眠不足后的补偿性恢复，或设备测量偏差。如果近期有增加运动量或经历疲劳期，这种暂时性深睡增加属于正常的生理调节。`;
}

function buildRemSleepAssessment(
  stagePct: SleepWindowSummary["stagePct"],
  staged: boolean,
): string {
  if (!staged || stagePct.rem === null) {
    return "当前数据源不提供睡眠阶段数据，无法评估 REM 睡眠占比。";
  }
  const rem = stagePct.rem;
  if (rem >= 20 && rem <= 25) {
    return `REM 睡眠占比 ${rem}%，处于正常范围（20-25%）。REM 阶段对情绪调节、记忆巩固和学习能力至关重要。`;
  }
  if (rem < 20) {
    return `REM 睡眠占比 ${rem}%，低于正常范围（20-25%）。REM 不足可能与压力、抗抑郁药物、酒精、或总睡眠时间不够（REM 集中在后半夜）有关。这可能影响情绪调节和认知功能。`;
  }
  return `REM 睡眠占比 ${rem}%，高于典型范围（20-25%）。REM 偏高有时与睡眠债恢复、停用影响 REM 的药物、或设备测量偏差有关。`;
}

function buildNormalRangeAssessment(
  recent: SleepWindowSummary,
  staged: boolean,
): string {
  if (recent.nights === 0) return "数据不足，无法评估。";
  const parts: string[] = [];

  // Total sleep
  const avg = recent.avgSleepHours;
  if (avg !== null) {
    if (avg >= 7 && avg <= 9) {
      parts.push(`平均睡眠 ${avg} 小时，处于推荐范围（7-9 小时）`);
    } else if (avg >= 6 && avg < 7) {
      parts.push(`平均睡眠 ${avg} 小时，略低于推荐范围（7-9 小时），长期不足可能影响注意力、免疫力和代谢健康`);
    } else if (avg < 6) {
      parts.push(`平均睡眠仅 ${avg} 小时，明显低于推荐范围（7-9 小时），长期睡眠不足与心血管风险、免疫抑制和认知下降显著相关`);
    } else {
      parts.push(`平均睡眠 ${avg} 小时，超过推荐范围上限（9 小时），过长的睡眠有时与睡眠质量低下或潜在健康问题有关`);
    }
  }

  // Deep sleep
  if (staged && recent.stagePct.deep !== null) {
    const deep = recent.stagePct.deep;
    if (deep >= 13 && deep <= 23) {
      parts.push(`深度睡眠 ${deep}%，在正常范围内`);
    } else {
      parts.push(`深度睡眠 ${deep}%，偏${deep < 13 ? "低" : "高"}（正常 13-23%）`);
    }
  }

  // REM
  if (staged && recent.stagePct.rem !== null) {
    const rem = recent.stagePct.rem;
    if (rem >= 20 && rem <= 25) {
      parts.push(`REM 睡眠 ${rem}%，在正常范围内`);
    } else {
      parts.push(`REM 睡眠 ${rem}%，偏${rem < 20 ? "低" : "高"}（正常 20-25%）`);
    }
  }

  // Bedtime
  if (recent.medianBedtime) {
    const hour = parseInt(recent.medianBedtime.split(":")[0], 10);
    if (hour >= 21 && hour <= 23) {
      parts.push(`中位入睡时间 ${recent.medianBedtime}，符合理想的昼夜节律窗口`);
    } else if (hour >= 0 && hour <= 2) {
      parts.push(`中位入睡时间 ${recent.medianBedtime}，入睡偏晚，可能影响深度睡眠比例和次日精力`);
    }
  }

  return parts.length > 0 ? parts.join("；") + "。" : "数据不足，无法评估。";
}

function buildInterpretation(
  recent: SleepWindowSummary,
  baseline: SleepWindowSummary,
  delta: SleepAnalysis["delta"],
  staged: boolean,
  trend: SleepHealthInsights["sleepTrend"],
): string {
  if (recent.nights === 0) return "记录不足，暂时无法给出综合解读。建议持续记录至少 7 个夜晚。";
  const parts: string[] = [];

  const avg = recent.avgSleepHours;
  // Overall signal
  if (avg !== null && avg >= 7 && avg <= 9) {
    if (staged && recent.stagePct.deep !== null && recent.stagePct.deep >= 13) {
      parts.push("你的睡眠整体健康：时长充足且深度睡眠在正常范围内，这对身体恢复和认知表现非常有利");
    } else {
      parts.push("你的睡眠时长达标，这是保持日间精力和免疫功能的基础");
    }
  } else if (avg !== null && avg < 7) {
    parts.push("你的睡眠时间低于推荐水平，这可能正在悄然影响你的注意力、情绪稳定性和身体恢复能力");
  } else if (avg !== null && avg > 9) {
    parts.push("你的睡眠时间偏长，如果仍感疲倦，可能需要关注睡眠效率而非单纯时长");
  }

  // Trend
  if (trend === "improving" && delta.sleepHours !== null) {
    parts.push(`近期睡眠比基线期增加了约 ${Math.abs(delta.sleepHours)} 小时，正在朝更好的方向发展`);
  } else if (trend === "declining" && delta.sleepHours !== null) {
    parts.push(`近期睡眠比基线期减少了约 ${Math.abs(delta.sleepHours)} 小时，如果感到白天困倦或注意力下降，这可能是主要原因`);
  } else if (trend === "stable") {
    parts.push("近期睡眠时长与基线期保持稳定，没有明显波动");
  }

  // Stage composition
  if (staged) {
    const deep = recent.stagePct.deep;
    const rem = recent.stagePct.rem;
    if (deep !== null && deep < 13 && rem !== null && rem < 20) {
      parts.push("深度睡眠和 REM 均偏低，睡眠结构可能需要优化——这两个阶段分别负责身体恢复和认知/情绪调节");
    } else if (deep !== null && deep < 13) {
      parts.push("深度睡眠占比偏低，而深睡是生长激素分泌和免疫修复的核心阶段，值得重点改善");
    } else if (rem !== null && rem < 20) {
      parts.push("REM 睡眠偏低，REM 不足可能影响白天的情绪韧性和创造性思维");
    }
  }

  return parts.length > 0 ? parts.join("。") + "。" : "";
}

function buildActionableAdvice(
  recent: SleepWindowSummary,
  delta: SleepAnalysis["delta"],
  staged: boolean,
  trend: SleepHealthInsights["sleepTrend"],
): string[] {
  const advice: string[] = [];

  const avg = recent.avgSleepHours;
  if (avg !== null && avg < 7) {
    advice.push("尝试将就寝时间提前 15-30 分钟，逐步增加总睡眠时长——急剧改变作息反而难以坚持。");
  }

  if (staged && recent.stagePct.deep !== null && recent.stagePct.deep < 13) {
    advice.push("改善深度睡眠：睡前 4 小时避免酒精和咖啡因，保持卧室温度在 18-20°C，入睡前 1 小时减少蓝光暴露。");
  }

  if (staged && recent.stagePct.rem !== null && recent.stagePct.rem < 20) {
    advice.push("REM 偏低可能与压力或入睡时间过晚有关（REM 集中在后半夜）。规律作息和压力管理有助于改善 REM 比例。");
  }

  if (trend === "declining") {
    advice.push("近期睡眠呈下降趋势，建议排查影响因素：工作压力、屏幕时间、咖啡因摄入或运动时间是否有变化。");
  }

  if (recent.medianBedtime) {
    const hour = parseInt(recent.medianBedtime.split(":")[0], 10);
    if (hour >= 0 && hour <= 2) {
      advice.push("入睡时间偏晚，尽量在 23:00 前入睡以获得更多深度睡眠——深睡集中在前半夜。");
    }
  }

  if (advice.length === 0) {
    advice.push("你的睡眠状态良好，继续保持规律的作息和良好的睡眠环境。");
  }
  advice.push("坚持每天在相同时间起床（包括周末），稳定的昼夜节律是高质量睡眠的基石。");

  return advice;
}

function buildDoctorTalkingPoints(
  recent: SleepWindowSummary,
  delta: SleepAnalysis["delta"],
  staged: boolean,
): string[] {
  const points: string[] = [];

  const avg = recent.avgSleepHours;
  if (avg !== null && avg < 6) {
    points.push(`"我的平均睡眠只有 ${avg} 小时，长期如此是否需要做睡眠质量评估？"`);
  }

  if (staged && recent.stagePct.deep !== null && recent.stagePct.deep < 10) {
    points.push(`"我的深度睡眠占比只有 ${recent.stagePct.deep}%，是否需要排查睡眠呼吸暂停或其他睡眠障碍？"`);
  }

  if (delta.sleepHours !== null && delta.sleepHours <= -1) {
    points.push(`"我的睡眠时长近期下降了约 ${Math.abs(delta.sleepHours)} 小时，这种变化需要关注吗？"`);
  }

  if (avg !== null && avg > 9) {
    points.push(`"我每晚睡 ${avg} 小时仍感疲倦，是否需要检查甲状腺功能或其他潜在原因？"`);
  }

  if (recent.medianBedtime && recent.medianWakeTime) {
    const bedHour = parseInt(recent.medianBedtime.split(":")[0], 10);
    if (bedHour >= 2 && bedHour <= 5) {
      points.push(`"我通常凌晨 ${recent.medianBedtime} 才入睡，这种晚睡模式会对健康产生什么具体影响？"`);
    }
  }

  if (points.length === 0) {
    points.push(`"我的睡眠数据整体看起来正常，有没有什么预防性的建议？"`);
  }

  return points;
}
