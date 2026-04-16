export const trainingInsightsZh = {
  trainingLoadChartTitle: "训练负荷曲线（日常训练量 · 累积疲劳 · 新鲜度）",
  trainingLoadChartSubtitle:
    "CTL = 42 天 EWMA 日常训练量；ATL = 7 天 EWMA 累积疲劳；TSB = CTL − ATL，代表新鲜度。TSB 越正越新鲜，越负越疲劳。",
  ctlSeriesLabel: "日常训练量 (CTL)",
  atlSeriesLabel: "最近一周疲劳 (ATL)",
  tsbSeriesLabel: "新鲜度 (TSB)",
  trainingRecoveryChartTitle: "训练量与恢复支持指数",
  trainingRecoveryChartSubtitle:
    "各序列统一换算为指数，100 代表近 12 个月均值，高于 100 表示高于个人常态。",
  trainingLoadIndexLabel: "训练量指数",
  sleepSupportIndexLabel: "睡眠支持指数",
  hrvSupportIndexLabel: "HRV 支持指数",
  restingHeartRateSupportIndexLabel: "静息心率支持指数",
  sportTrendChartTitle: (sport: string) => `${sport} 月度节奏`,
  sportTrendChartSubtitle: "柱状 = 每月训练次数（左轴）；折线 = 每次平均时长（右轴）。次数反映频率，平均时长反映课容量，两个维度组合起来比单看一个更能判断节奏变化。",
  workoutCountLabel: "月度训练次数",
  avgWorkoutDurationLabel: "平均单次时长",
  chartUnitSessions: "次",
  chartUnitMinutes: "分钟",
  chartUnitIndex: "指数",
  chartUnitMetMinutes: "MET·分钟",
  metadataLanguage: "zh-CN",
  outputSchemaVersion: "1.0.0",
  narrativeAudience: "普通用户",
  narrativeGoal:
    "基于 Apple Health 中的训练记录、睡眠和恢复数据，输出中文训练状态报告，帮助用户判断专项节奏、恢复支持和潜在过载风险。",
  narrativeBoundaries: [
    "只能引用 summary.json 和 insights.json 中的事实",
    "优先判断训练节奏、恢复支持、专项状态与健康风险",
    "可以给出训练调整和健康管理建议，但不能生成竞技处方或医学诊断",
    "对 Apple Health 无法稳健还原的 Garmin 专有指标，不要伪造具体分数",
    "明显异常时可以给出保守的复查或就医提醒",
  ],
};

export type TrainingInsightsT = typeof trainingInsightsZh;
