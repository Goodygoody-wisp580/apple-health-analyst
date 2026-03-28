export const crossMetricZh = {
  // ── Separators ──
  partSep: "；",
  partEnd: "。",
  sentSep: "。",

  // ── Sleep-Recovery Link ──────────────────────────────────────────

  sleepRecoveryNoShortNights:
    "近期没有睡眠不足 6 小时的夜晚，睡眠时长保障较好。",

  sleepRecoveryHrvDrop: (
    shortDays: number,
    hrvDrop: number,
    shortHRV: number,
    normalHRV: number,
  ) =>
    `睡眠不足 6 小时的 ${shortDays} 个夜晚，次日 HRV 平均下降 ${Math.abs(hrvDrop)}%（${shortHRV} vs ${normalHRV} ms），说明短睡对自主神经恢复有明确影响。`,

  sleepRecoveryNoHrvData: (shortDays: number) =>
    `有 ${shortDays} 个夜晚睡眠不足 6 小时，但缺少足够的次日 HRV 数据来判断恢复影响。`,

  sleepRecoveryTolerable: (shortDays: number) =>
    `有 ${shortDays} 个夜晚睡眠不足 6 小时，次日 HRV 未出现显著下降，身体对短睡的耐受尚可。`,

  // ── Sleep Consistency ────────────────────────────────────────────

  sleepConsistencyInsufficient: "作息规律性数据不足，无法评估。",

  sleepConsistencyHigh: (bedStd: number, wakeStd: number) =>
    `入睡时间标准差约 ${bedStd} 分钟，起床标准差约 ${wakeStd} 分钟，作息节律非常稳定。研究表明规律作息比延长睡眠时间对健康的贡献更大。`,

  sleepConsistencyModerate: (bedStd: number, wakeStd: number) =>
    `入睡时间标准差约 ${bedStd} 分钟，起床标准差约 ${wakeStd} 分钟，作息有一定波动。建议优先固定起床时间，入睡时间会自然趋于稳定。`,

  sleepConsistencyLow: (bedStd: number, wakeStd: number) =>
    `入睡时间标准差约 ${bedStd} 分钟，起床标准差约 ${wakeStd} 分钟，作息波动较大。不规律的作息会削弱昼夜节律，影响深睡质量和激素分泌。`,

  // ── Activity-Recovery Balance ────────────────────────────────────

  activityRecoveryNoHighStrain:
    "近期没有高运动量天（≥60 分钟），无法评估训练-恢复平衡。",

  activityRecoveryInsufficientHrv: (highStrainDays: number) =>
    `有 ${highStrainDays} 天运动量较高，但 HRV 数据不足以判断恢复充分性。`,

  activityRecoveryAdequate: (
    highStrainDays: number,
    highHRV: number,
    restHRV: number,
  ) =>
    `有 ${highStrainDays} 天高运动量，次日 HRV 均值 ${highHRV} ms 接近休息日的 ${restHRV} ms，说明身体对当前训练负荷恢复良好。`,

  activityRecoveryInadequate: (
    highStrainDays: number,
    highHRV: number,
    restHRV: number,
  ) =>
    `有 ${highStrainDays} 天高运动量，次日 HRV 均值 ${highHRV} ms 明显低于休息日的 ${restHRV} ms，提示训练负荷可能超出恢复能力，建议适当降低强度或增加恢复日。`,

  // ── Recovery Coherence ───────────────────────────────────────────

  recoveryCoherenceInsufficient: "恢复指标数据不足，无法判断趋势一致性。",

  recoveryCoherenceAligned: (
    rhrTrend: string,
    hrvTrend: string,
  ) =>
    `静息心率${rhrTrend === "improving" ? "下降" : "稳定"}，HRV ${hrvTrend === "improving" ? "上升" : "稳定"}，两项恢复指标方向一致，交感/副交感平衡状态良好。`,

  recoveryCoherenceBothWorsening:
    "静息心率上升且 HRV 下降，双重信号提示自主神经恢复能力下降，需要关注压力、睡眠和训练负荷。",

  recoveryCoherenceMixed: (rhrTrend: string, hrvTrend: string) =>
    `静息心率趋势为"${rhrTrend}"，HRV 趋势为"${hrvTrend}"，两项指标方向不完全一致，建议观察是否存在混合压力源（如训练增加但睡眠改善）。`,

  // Recovery trend labels (used inside recoveryCoherenceMixed)
  trendImproving: "improving",
  trendWorsening: "worsening",
  trendStable: "stable",

  // ── Composite Assessment ─────────────────────────────────────────

  readinessGood: "良好",
  readinessModerate: "中等",
  readinessLow: "偏低",
  readinessInsufficientData: "数据不足",

  compositeSleep: (score: number) => `睡眠 ${score}/100`,
  compositeRecovery: (score: number) => `恢复 ${score}/100`,
  compositeActivity: (score: number) => `活动 ${score}/100`,

  compositeSummary: (
    scoresPart: string,
    readinessLabel: string,
  ) =>
    `综合评分：${scoresPart}。整体状态${readinessLabel}。`,

  compositeScoreSeparator: "、",

  compositeLowAdvice: "建议优先改善睡眠和恢复，暂缓增加训练强度。",
  compositeModerateAdvice: "有改善空间，重点关注评分最低的维度。",
  compositeGoodAdvice: "各维度状态较好，可以维持或适当推进训练目标。",

  compositeInsufficientDimensions: "数据维度不足，无法生成综合评分。",

  // ── Pattern Detection ────────────────────────────────────────────

  patternWeekendWarrior: (
    weekendAvg: number,
    weekdayAvg: number,
    ratio: number,
  ) =>
    `周末战士模式：周末平均运动 ${weekendAvg} 分钟，是工作日 ${weekdayAvg} 分钟的 ${ratio} 倍。集中运动的受伤风险高于均匀分布，建议在工作日增加轻量活动。`,

  patternNightOwlDrift: (driftMin: number) =>
    `夜猫子漂移：入睡时间在分析期内平均后移了约 ${driftMin} 分钟。昼夜节律后移会降低深睡比例和 HRV，建议在早晨增加光照暴露来锚定节律。`,

  patternSleepDebtCompensation: (weekdayAvg: string, weekendAvg: string) =>
    `睡眠补偿模式：工作日平均睡 ${weekdayAvg} 小时，周末 ${weekendAvg} 小时。周末补觉只能部分偿还睡眠债，无法完全恢复认知功能和代谢损失。建议工作日至少保证 7 小时。`,

  patternRecoveryDeficit: (maxConsecutive: number) =>
    `恢复不足风险：出现连续 ${maxConsecutive} 天高运动量（≥45 分钟），缺少恢复日。连续高负荷会累积微损伤并压制 HRV，建议每 2-3 天安排一个轻量恢复日。`,

  // ── Notable Days ─────────────────────────────────────────────────

  notableSleepDuration: "睡眠时长",
  notableHRV: "HRV",
  notableRHR: "静息心率",
  notableExercise: "锻炼时长",

  notableUnitHours: "小时",
  notableUnitMs: "ms",
  notableUnitBpm: "bpm",
  notableUnitMinutes: "分钟",

  notableDayContext: (avg: number, unit: string) => `均值 ${avg} ${unit}`,
};

export type CrossMetricT = typeof crossMetricZh;
