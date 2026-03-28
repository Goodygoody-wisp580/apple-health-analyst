export const activityZh = {
  // ── Separators ──
  partSep: "；",
  partEnd: "。",
  sentSep: "。",

  // ── analyzeActivity ──
  source: "活动摘要 + 训练记录",
  activeNote: "日常活动趋势来自活动摘要，训练类型单独统计。",
  noDataNote: "所选时间窗口内没有可用的活动摘要或训练记录。",

  // ── buildWhoGuidelineAssessment ──
  whoNoData: "运动数据不足，无法对标 WHO 指南。",
  whoExceeds: (weeklyMinutes: number) =>
    `周均运动约 ${weeklyMinutes} 分钟，超过 WHO 推荐的 300 分钟上限，可获得额外的健康收益。不过高运动量同时需要关注恢复是否跟得上。`,
  whoMeets: (weeklyMinutes: number) =>
    `周均运动约 ${weeklyMinutes} 分钟，达到 WHO 推荐的中等强度有氧运动标准（150-300 分钟/周）。这个运动量能有效降低心血管疾病、2 型糖尿病和部分癌症的风险。`,
  whoPartial: (weeklyMinutes: number, gap: number) =>
    `周均运动约 ${weeklyMinutes} 分钟，低于 WHO 推荐的 150 分钟/周最低标准，但已经在积累健康收益。每周再增加 ${gap} 分钟就能达标。`,
  whoFarBelow: (weeklyMinutes: number) =>
    `周均运动约 ${weeklyMinutes} 分钟，明显低于 WHO 推荐的 150 分钟/周最低标准。任何运动都比完全不动好——从每天增加 10 分钟快走开始是一个可行的起点。`,

  // ── buildWorkoutVariety ──
  varietyNone: "近期没有记录训练类型。",
  varietySingle: (type: string) =>
    `运动类型较单一（仅 ${type}），建议搭配不同类型的运动，如有氧 + 力量 + 柔韧性训练，以获得更全面的健康收益。`,
  varietyBalanced: (types: string) =>
    `运动类型较均衡（${types}），涵盖了一定的多样性，这有助于全面发展体能并降低运动损伤风险。`,
  varietyRich: (types: string, count: number) =>
    `运动类型丰富（${types} 等 ${count} 种），多样化的运动组合能更好地发展心肺耐力、肌肉力量和关节灵活性。`,

  // ── buildNormalRangeAssessment ──
  exerciseMeetsWho: (dailyMin: number, weeklyMin: number) =>
    `日均运动 ${dailyMin} 分钟（周均 ${weeklyMin} 分钟），达到 WHO 推荐标准`,
  exerciseBelowWho: (dailyMin: number, weeklyMin: number) =>
    `日均运动 ${dailyMin} 分钟（周均 ${weeklyMin} 分钟），未达 WHO 150 分钟/周标准`,

  standMeetsGoal: (hours: number) =>
    `日均站立 ${hours} 小时，达到 Apple 默认目标（12 小时）`,
  standReasonable: (hours: number) =>
    `日均站立 ${hours} 小时，虽未达 12 小时目标但处于合理水平`,
  standLow: (hours: number) =>
    `日均站立仅 ${hours} 小时，久坐时间偏长，建议每小时起身活动 1-2 分钟`,

  activeEnergyBurned: (kcal: number) =>
    `日均活动消耗 ${kcal} kcal`,

  normalRangeInsufficientData: "活动数据不足，无法评估。",

  // ── buildInterpretation ──
  interpretationInsufficientData: "记录不足，暂时无法给出综合解读。",

  whoComplianceMet: "你的运动量达到 WHO 推荐标准，这对心血管健康、代谢调节和心理健康都有显著的保护作用",
  whoCompliancePartial: "当前运动量虽未达到 WHO 推荐标准，但保持活跃的习惯已经是非常好的起点",

  trendImproving: (delta: number) =>
    `近期日均运动比基线期增加了约 ${delta} 分钟，运动习惯正在改善`,
  trendDeclining: (delta: number) =>
    `近期日均运动比基线期减少了约 ${delta} 分钟，如果非有意为之，建议关注是否有时间或动力方面的障碍`,
  trendStable: "运动量保持稳定，一致性是长期获益的关键",

  sedentaryWarning: "久坐时间偏长，独立于运动量之外，长时间不间断久坐本身也是心血管和代谢健康的风险因素",

  // ── buildActionableAdvice ──
  adviceWhoGap: (gap: number, dailyGap: number | null) =>
    `距离 WHO 推荐标准还差约 ${gap} 分钟/周。尝试每天增加 ${dailyGap} 分钟活动，比如饭后散步或选择楼梯代替电梯。`,
  adviceStandMore: "设置每小时一次的站立提醒，起身活动 1-2 分钟——打断久坐比集中运动对代谢的持续影响更大。",
  adviceDeclining: "运动量呈下降趋势，建议找一个运动伙伴或设定具体的运动日程表，外部约束比意志力更可靠。",
  adviceCrossTrain: "尝试每周加入一次不同类型的运动（如有氧运动者加入力量训练），交叉训练能降低损伤风险并提升整体体能。",
  adviceRecovery: "运动量充足，确保安排足够的恢复日（每周至少 1-2 天轻量或休息），避免过度训练导致的免疫抑制或运动损伤。",
  adviceGood: "你的运动习惯良好，继续保持规律运动和多样化的训练类型。",
  adviceTrack: "记录每次训练有助于追踪进步和调整计划，坚持使用 Apple Watch 自动记录运动数据。",

  // ── buildDoctorTalkingPoints ──
  doctorLowActivity: (weeklyMin: number) =>
    `"我目前每周运动约 ${weeklyMin} 分钟，有没有适合我的安全起步运动方案？"`,
  doctorHighActivity: (weeklyMin: number) =>
    `"我每周运动约 ${weeklyMin} 分钟，运动量较大，需要注意什么？是否需要定期做运动心电图？"`,
  doctorSedentary: (hours: number) =>
    `"我的工作需要长时间久坐（日均站立仅 ${hours} 小时），这会增加哪些健康风险？"`,
  doctorOptimize: (weeklyMin: number) =>
    `"基于我的年龄和当前运动量（周均 ${weeklyMin} 分钟），有没有更优化的运动组合建议？"`,
};
export type ActivityT = typeof activityZh;
