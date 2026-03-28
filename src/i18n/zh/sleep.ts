export const sleepZh = {
  // ── Separators ──
  partSep: "；",
  partEnd: "。",
  sentSep: "。",

  // ── analyzeSleep ──
  noSleepRecords: "所选时间窗口内没有可用的睡眠记录。",
  stagedNote: "睡眠阶段占比仅基于选定的主睡眠数据源计算。",
  unstagedNote: "选定的睡眠数据源不提供分阶段睡眠数据。",
  partialNightWarning: (nightKey: string, hours: number) =>
    `已将 ${nightKey} 排除在睡眠趋势之外，因为该夜晚仅包含 ${hours} 小时睡眠。`,

  // ── buildDeepSleepAssessment ──
  deepSleepNoData: "当前数据源不提供睡眠阶段数据，无法评估深度睡眠占比。",
  deepSleepNormal: (deep: number) =>
    `深度睡眠占比 ${deep}%，处于正常范围（13-23%）。深度睡眠是身体分泌生长激素、修复组织和巩固免疫系统的关键阶段。`,
  deepSleepLow: (deep: number) =>
    `深度睡眠占比 ${deep}%，低于正常范围（13-23%）。深睡不足可能与酒精摄入、咖啡因、入睡前屏幕使用、睡眠环境（温度/噪音）或年龄增长有关。深度睡眠对身体恢复和免疫功能至关重要。`,
  deepSleepHigh: (deep: number) =>
    `深度睡眠占比 ${deep}%，高于典型范围（13-23%）。这可能反映前一阶段睡眠不足后的补偿性恢复，或设备测量偏差。如果近期有增加运动量或经历疲劳期，这种暂时性深睡增加属于正常的生理调节。`,

  // ── buildRemSleepAssessment ──
  remSleepNoData: "当前数据源不提供睡眠阶段数据，无法评估 REM 睡眠占比。",
  remSleepNormal: (rem: number) =>
    `REM 睡眠占比 ${rem}%，处于正常范围（20-25%）。REM 阶段对情绪调节、记忆巩固和学习能力至关重要。`,
  remSleepLow: (rem: number) =>
    `REM 睡眠占比 ${rem}%，低于正常范围（20-25%）。REM 不足可能与压力、抗抑郁药物、酒精、或总睡眠时间不够（REM 集中在后半夜）有关。这可能影响情绪调节和认知功能。`,
  remSleepHigh: (rem: number) =>
    `REM 睡眠占比 ${rem}%，高于典型范围（20-25%）。REM 偏高有时与睡眠债恢复、停用影响 REM 的药物、或设备测量偏差有关。`,

  // ── buildNormalRangeAssessment ──
  normalRangeInsufficientData: "数据不足，无法评估。",

  // Total sleep
  avgSleepNormal: (avg: number) =>
    `平均睡眠 ${avg} 小时，处于推荐范围（7-9 小时）`,
  avgSleepSlightlyLow: (avg: number) =>
    `平均睡眠 ${avg} 小时，略低于推荐范围（7-9 小时），长期不足可能影响注意力、免疫力和代谢健康`,
  avgSleepVeryLow: (avg: number) =>
    `平均睡眠仅 ${avg} 小时，明显低于推荐范围（7-9 小时），长期睡眠不足与心血管风险、免疫抑制和认知下降显著相关`,
  avgSleepHigh: (avg: number) =>
    `平均睡眠 ${avg} 小时，超过推荐范围上限（9 小时），过长的睡眠有时与睡眠质量低下或潜在健康问题有关`,

  // Deep sleep in normal range
  deepSleepInRange: (deep: number) =>
    `深度睡眠 ${deep}%，在正常范围内`,
  deepSleepOutOfRangeLow: (deep: number) =>
    `深度睡眠 ${deep}%，偏低（正常 13-23%）`,
  deepSleepOutOfRangeHigh: (deep: number) =>
    `深度睡眠 ${deep}%，偏高（正常 13-23%）`,

  // REM in normal range
  remSleepInRange: (rem: number) =>
    `REM 睡眠 ${rem}%，在正常范围内`,
  remSleepOutOfRangeLow: (rem: number) =>
    `REM 睡眠 ${rem}%，偏低（正常 20-25%）`,
  remSleepOutOfRangeHigh: (rem: number) =>
    `REM 睡眠 ${rem}%，偏高（正常 20-25%）`,

  // Bedtime
  bedtimeIdeal: (bedtime: string) =>
    `中位入睡时间 ${bedtime}，符合理想的昼夜节律窗口`,
  bedtimeLate: (bedtime: string) =>
    `中位入睡时间 ${bedtime}，入睡偏晚，可能影响深度睡眠比例和次日精力`,

  // ── buildInterpretation ──
  interpretationInsufficientData: "记录不足，暂时无法给出综合解读。建议持续记录至少 7 个夜晚。",

  // Overall signal
  overallHealthyWithDeep: "你的睡眠整体健康：时长充足且深度睡眠在正常范围内，这对身体恢复和认知表现非常有利",
  overallDurationOk: "你的睡眠时长达标，这是保持日间精力和免疫功能的基础",
  overallDurationLow: "你的睡眠时间低于推荐水平，这可能正在悄然影响你的注意力、情绪稳定性和身体恢复能力",
  overallDurationHigh: "你的睡眠时间偏长，如果仍感疲倦，可能需要关注睡眠效率而非单纯时长",

  // Trend
  trendImproving: (delta: number) =>
    `近期睡眠比基线期增加了约 ${delta} 小时，正在朝更好的方向发展`,
  trendDeclining: (delta: number) =>
    `近期睡眠比基线期减少了约 ${delta} 小时，如果感到白天困倦或注意力下降，这可能是主要原因`,
  trendStable: "近期睡眠时长与基线期保持稳定，没有明显波动",

  // Stage composition
  stagesBothLow: "深度睡眠和 REM 均偏低，睡眠结构可能需要优化——这两个阶段分别负责身体恢复和认知/情绪调节",
  stagesDeepLow: "深度睡眠占比偏低，而深睡是生长激素分泌和免疫修复的核心阶段，值得重点改善",
  stagesRemLow: "REM 睡眠偏低，REM 不足可能影响白天的情绪韧性和创造性思维",

  // ── buildActionableAdvice ──
  adviceSleepMore: "尝试将就寝时间提前 15-30 分钟，逐步增加总睡眠时长——急剧改变作息反而难以坚持。",
  adviceDeepSleep: "改善深度睡眠：睡前 4 小时避免酒精和咖啡因，保持卧室温度在 18-20°C，入睡前 1 小时减少蓝光暴露。",
  adviceRemSleep: "REM 偏低可能与压力或入睡时间过晚有关（REM 集中在后半夜）。规律作息和压力管理有助于改善 REM 比例。",
  adviceDeclining: "近期睡眠呈下降趋势，建议排查影响因素：工作压力、屏幕时间、咖啡因摄入或运动时间是否有变化。",
  adviceBedtimeLate: "入睡时间偏晚，尽量在 23:00 前入睡以获得更多深度睡眠——深睡集中在前半夜。",
  adviceGood: "你的睡眠状态良好，继续保持规律的作息和良好的睡眠环境。",
  adviceConsistentWake: "坚持每天在相同时间起床（包括周末），稳定的昼夜节律是高质量睡眠的基石。",

  // ── buildDoctorTalkingPoints ──
  doctorLowSleep: (avg: number) =>
    `"我的平均睡眠只有 ${avg} 小时，长期如此是否需要做睡眠质量评估？"`,
  doctorLowDeep: (deep: number) =>
    `"我的深度睡眠占比只有 ${deep}%，是否需要排查睡眠呼吸暂停或其他睡眠障碍？"`,
  doctorDeclining: (delta: number) =>
    `"我的睡眠时长近期下降了约 ${delta} 小时，这种变化需要关注吗？"`,
  doctorLongSleep: (avg: number) =>
    `"我每晚睡 ${avg} 小时仍感疲倦，是否需要检查甲状腺功能或其他潜在原因？"`,
  doctorLateBedtime: (bedtime: string) =>
    `"我通常凌晨 ${bedtime} 才入睡，这种晚睡模式会对健康产生什么具体影响？"`,
  doctorNormal: `"我的睡眠数据整体看起来正常，有没有什么预防性的建议？"`,
};
export type SleepT = typeof sleepZh;
