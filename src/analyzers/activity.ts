import type {
  ActivityAnalysis,
  ActivityHealthInsights,
  ActivitySummarySample,
  ActivityWindowSummary,
  TimeWindow,
  WorkoutSample,
} from "../types.js";

import { round, average, subtract } from "./mathUtils.js";

const EMPTY_HEALTH_INSIGHTS: ActivityHealthInsights = {
  activityTrend: null,
  activityTrendDelta: null,
  whoGuidelineAssessment: "",
  workoutVariety: "",
  normalRangeAssessment: "",
  interpretation: "",
  actionableAdvice: [],
  doctorTalkingPoints: [],
};

function summarizeActivityWindow(activitySummaries: ActivitySummarySample[], workouts: WorkoutSample[]) {
  const workoutCounts = new Map<string, number>();
  for (const workout of workouts) {
    workoutCounts.set(workout.workoutActivityType, (workoutCounts.get(workout.workoutActivityType) ?? 0) + 1);
  }

  return {
    dayCount: activitySummaries.length,
    activeEnergyBurnedKcal: round(
      average(activitySummaries.map((sample) => sample.activeEnergyBurned).filter((value): value is number => value !== null)),
    ),
    exerciseMinutes: round(
      average(activitySummaries.map((sample) => sample.appleExerciseTime).filter((value): value is number => value !== null)),
    ),
    standHours: round(
      average(activitySummaries.map((sample) => sample.appleStandHours).filter((value): value is number => value !== null)),
    ),
    workouts: workouts.length,
    topWorkoutTypes: [...workoutCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count })),
  };
}

export function analyzeActivity(
  activitySummaries: ActivitySummarySample[],
  workouts: WorkoutSample[],
  window: TimeWindow,
): ActivityAnalysis {
  const withinRequestedWindow = <T extends { date?: Date; startDate?: Date }>(value: T) => {
    const date = value.date ?? value.startDate;
    if (!date) {
      return false;
    }
    if (window.effectiveStart && date < window.effectiveStart) {
      return false;
    }
    return date <= window.effectiveEnd;
  };

  const filteredSummaries = activitySummaries.filter(withinRequestedWindow);
  const filteredWorkouts = workouts.filter(withinRequestedWindow);

  const recentSummaries = filteredSummaries.filter(
    (summary) => summary.date >= window.recentStart && summary.date <= window.effectiveEnd,
  );
  const baselineSummaries = filteredSummaries.filter(
    (summary) => summary.date >= window.baselineStart && summary.date < window.recentStart,
  );

  const recentWorkouts = filteredWorkouts.filter(
    (workout) => workout.startDate >= window.recentStart && workout.startDate <= window.effectiveEnd,
  );
  const baselineWorkouts = filteredWorkouts.filter(
    (workout) => workout.startDate >= window.baselineStart && workout.startDate < window.recentStart,
  );

  const recent30d = summarizeActivityWindow(recentSummaries, recentWorkouts);
  const baseline90d = summarizeActivityWindow(baselineSummaries, baselineWorkouts);

  const delta = {
    activeEnergyBurnedKcal: subtract(recent30d.activeEnergyBurnedKcal, baseline90d.activeEnergyBurnedKcal),
    exerciseMinutes: subtract(recent30d.exerciseMinutes, baseline90d.exerciseMinutes),
    standHours: subtract(recent30d.standHours, baseline90d.standHours),
    workouts:
      recent30d.workouts || baseline90d.workouts
        ? recent30d.workouts - baseline90d.workouts
        : null,
  };

  const healthInsights = buildActivityHealthInsights(recent30d, delta);

  return {
    status: filteredSummaries.length > 0 || filteredWorkouts.length > 0 ? "ok" : "insufficient_data",
    source: "活动摘要 + 训练记录",
    coverageDays: filteredSummaries.length,
    recent30d,
    baseline90d,
    delta,
    healthInsights,
    notes:
      filteredSummaries.length > 0 || filteredWorkouts.length > 0
        ? ["日常活动趋势来自活动摘要，训练类型单独统计。"]
        : ["所选时间窗口内没有可用的活动摘要或训练记录。"],
  };
}

// ── Health Insight Builders ──

function buildActivityHealthInsights(
  recent: ActivityWindowSummary,
  delta: ActivityAnalysis["delta"],
): ActivityHealthInsights {
  if (recent.dayCount === 0 && recent.workouts === 0) return EMPTY_HEALTH_INSIGHTS;

  const { trend, trendDelta } = buildActivityTrend(delta);

  return {
    activityTrend: trend,
    activityTrendDelta: trendDelta,
    whoGuidelineAssessment: buildWhoGuidelineAssessment(recent.exerciseMinutes),
    workoutVariety: buildWorkoutVariety(recent.topWorkoutTypes),
    normalRangeAssessment: buildNormalRangeAssessment(recent),
    interpretation: buildInterpretation(recent, delta, trend),
    actionableAdvice: buildActionableAdvice(recent, delta, trend),
    doctorTalkingPoints: buildDoctorTalkingPoints(recent),
  };
}

function buildActivityTrend(
  delta: ActivityAnalysis["delta"],
): { trend: ActivityHealthInsights["activityTrend"]; trendDelta: number | null } {
  if (delta.exerciseMinutes === null) return { trend: null, trendDelta: null };
  const trend =
    delta.exerciseMinutes >= 10 ? "improving"
    : delta.exerciseMinutes <= -10 ? "declining"
    : "stable";
  return { trend, trendDelta: delta.exerciseMinutes };
}

function buildWhoGuidelineAssessment(exerciseMinutes: number | null): string {
  if (exerciseMinutes === null) return "运动数据不足，无法对标 WHO 指南。";
  const weeklyMinutes = round(exerciseMinutes * 7) ?? 0;
  if (weeklyMinutes >= 300) {
    return `周均运动约 ${weeklyMinutes} 分钟，超过 WHO 推荐的 300 分钟上限，可获得额外的健康收益。不过高运动量同时需要关注恢复是否跟得上。`;
  }
  if (weeklyMinutes >= 150) {
    return `周均运动约 ${weeklyMinutes} 分钟，达到 WHO 推荐的中等强度有氧运动标准（150-300 分钟/周）。这个运动量能有效降低心血管疾病、2 型糖尿病和部分癌症的风险。`;
  }
  if (weeklyMinutes >= 75) {
    return `周均运动约 ${weeklyMinutes} 分钟，低于 WHO 推荐的 150 分钟/周最低标准，但已经在积累健康收益。每周再增加 ${150 - weeklyMinutes} 分钟就能达标。`;
  }
  return `周均运动约 ${weeklyMinutes} 分钟，明显低于 WHO 推荐的 150 分钟/周最低标准。任何运动都比完全不动好——从每天增加 10 分钟快走开始是一个可行的起点。`;
}

function buildWorkoutVariety(
  topWorkoutTypes: Array<{ type: string; count: number }>,
): string {
  const count = topWorkoutTypes.length;
  if (count === 0) return "近期没有记录训练类型。";
  if (count === 1) {
    return `运动类型较单一（仅 ${formatWorkoutType(topWorkoutTypes[0].type)}），建议搭配不同类型的运动，如有氧 + 力量 + 柔韧性训练，以获得更全面的健康收益。`;
  }
  if (count <= 3) {
    const types = topWorkoutTypes.map((t) => formatWorkoutType(t.type)).join("、");
    return `运动类型较均衡（${types}），涵盖了一定的多样性，这有助于全面发展体能并降低运动损伤风险。`;
  }
  const types = topWorkoutTypes.slice(0, 4).map((t) => formatWorkoutType(t.type)).join("、");
  return `运动类型丰富（${types} 等 ${count} 种），多样化的运动组合能更好地发展心肺耐力、肌肉力量和关节灵活性。`;
}

function formatWorkoutType(raw: string): string {
  return raw
    .replace(/^HKWorkoutActivityType/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

function buildNormalRangeAssessment(recent: ActivityWindowSummary): string {
  const parts: string[] = [];

  if (recent.exerciseMinutes !== null) {
    const weeklyMin = round(recent.exerciseMinutes * 7) ?? 0;
    if (weeklyMin >= 150) {
      parts.push(`日均运动 ${recent.exerciseMinutes} 分钟（周均 ${weeklyMin} 分钟），达到 WHO 推荐标准`);
    } else {
      parts.push(`日均运动 ${recent.exerciseMinutes} 分钟（周均 ${weeklyMin} 分钟），未达 WHO 150 分钟/周标准`);
    }
  }

  if (recent.standHours !== null) {
    if (recent.standHours >= 12) {
      parts.push(`日均站立 ${recent.standHours} 小时，达到 Apple 默认目标（12 小时）`);
    } else if (recent.standHours >= 8) {
      parts.push(`日均站立 ${recent.standHours} 小时，虽未达 12 小时目标但处于合理水平`);
    } else {
      parts.push(`日均站立仅 ${recent.standHours} 小时，久坐时间偏长，建议每小时起身活动 1-2 分钟`);
    }
  }

  if (recent.activeEnergyBurnedKcal !== null) {
    parts.push(`日均活动消耗 ${recent.activeEnergyBurnedKcal} kcal`);
  }

  return parts.length > 0 ? parts.join("；") + "。" : "活动数据不足，无法评估。";
}

function buildInterpretation(
  recent: ActivityWindowSummary,
  delta: ActivityAnalysis["delta"],
  trend: ActivityHealthInsights["activityTrend"],
): string {
  if (recent.dayCount === 0 && recent.workouts === 0) return "记录不足，暂时无法给出综合解读。";
  const parts: string[] = [];

  // WHO compliance
  const weeklyMin = recent.exerciseMinutes !== null ? (round(recent.exerciseMinutes * 7) ?? 0) : 0;
  if (weeklyMin >= 150) {
    parts.push("你的运动量达到 WHO 推荐标准，这对心血管健康、代谢调节和心理健康都有显著的保护作用");
  } else if (weeklyMin > 0) {
    parts.push("当前运动量虽未达到 WHO 推荐标准，但保持活跃的习惯已经是非常好的起点");
  }

  // Trend
  if (trend === "improving" && delta.exerciseMinutes !== null) {
    parts.push(`近期日均运动比基线期增加了约 ${Math.abs(delta.exerciseMinutes)} 分钟，运动习惯正在改善`);
  } else if (trend === "declining" && delta.exerciseMinutes !== null) {
    parts.push(`近期日均运动比基线期减少了约 ${Math.abs(delta.exerciseMinutes)} 分钟，如果非有意为之，建议关注是否有时间或动力方面的障碍`);
  } else if (trend === "stable") {
    parts.push("运动量保持稳定，一致性是长期获益的关键");
  }

  // Stand hours context
  if (recent.standHours !== null && recent.standHours < 8) {
    parts.push("久坐时间偏长，独立于运动量之外，长时间不间断久坐本身也是心血管和代谢健康的风险因素");
  }

  return parts.length > 0 ? parts.join("。") + "。" : "";
}

function buildActionableAdvice(
  recent: ActivityWindowSummary,
  delta: ActivityAnalysis["delta"],
  trend: ActivityHealthInsights["activityTrend"],
): string[] {
  const advice: string[] = [];

  const weeklyMin = recent.exerciseMinutes !== null ? (round(recent.exerciseMinutes * 7) ?? 0) : 0;
  if (weeklyMin < 150) {
    const gap = 150 - weeklyMin;
    const dailyGap = round(gap / 7);
    advice.push(`距离 WHO 推荐标准还差约 ${gap} 分钟/周。尝试每天增加 ${dailyGap} 分钟活动，比如饭后散步或选择楼梯代替电梯。`);
  }

  if (recent.standHours !== null && recent.standHours < 8) {
    advice.push("设置每小时一次的站立提醒，起身活动 1-2 分钟——打断久坐比集中运动对代谢的持续影响更大。");
  }

  if (trend === "declining") {
    advice.push("运动量呈下降趋势，建议找一个运动伙伴或设定具体的运动日程表，外部约束比意志力更可靠。");
  }

  if (recent.topWorkoutTypes.length === 1) {
    advice.push("尝试每周加入一次不同类型的运动（如有氧运动者加入力量训练），交叉训练能降低损伤风险并提升整体体能。");
  }

  if (weeklyMin > 300) {
    advice.push("运动量充足，确保安排足够的恢复日（每周至少 1-2 天轻量或休息），避免过度训练导致的免疫抑制或运动损伤。");
  }

  if (advice.length === 0) {
    advice.push("你的运动习惯良好，继续保持规律运动和多样化的训练类型。");
  }
  advice.push("记录每次训练有助于追踪进步和调整计划，坚持使用 Apple Watch 自动记录运动数据。");

  return advice;
}

function buildDoctorTalkingPoints(recent: ActivityWindowSummary): string[] {
  const points: string[] = [];
  const weeklyMin = recent.exerciseMinutes !== null ? (round(recent.exerciseMinutes * 7) ?? 0) : 0;

  if (weeklyMin < 75) {
    points.push(`"我目前每周运动约 ${weeklyMin} 分钟，有没有适合我的安全起步运动方案？"`);
  }

  if (weeklyMin > 400) {
    points.push(`"我每周运动约 ${weeklyMin} 分钟，运动量较大，需要注意什么？是否需要定期做运动心电图？"`);
  }

  if (recent.standHours !== null && recent.standHours < 6) {
    points.push(`"我的工作需要长时间久坐（日均站立仅 ${recent.standHours} 小时），这会增加哪些健康风险？"`);
  }

  if (points.length === 0) {
    points.push(`"基于我的年龄和当前运动量（周均 ${weeklyMin} 分钟），有没有更优化的运动组合建议？"`);
  }

  return points;
}
