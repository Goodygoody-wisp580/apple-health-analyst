export const recoveryZh = {
  // ── Separators ──
  partSep: "；",
  partEnd: "。",
  sentSep: "。",

  // ── Direction words ──
  directionLow: "低",
  directionHigh: "高",

  // ── analyzeRecovery ──
  activeNote: "恢复指标按各自的主数据源汇报，不会跨设备合并。",
  noDataNote: "所选时间窗口内没有可用的恢复指标。",

  // ── buildSpo2Assessment ──
  spo2NoData: "无血氧数据。",
  spo2Normal: (avg: number) =>
    `近期平均血氧 ${avg}%，处于正常范围（≥95%）。这表明肺部气体交换功能正常。`,
  spo2Low: (avg: number) =>
    `近期平均血氧 ${avg}%，处于偏低水平（正常 ≥95%）。间歇性低血氧可能与睡眠呼吸暂停、高海拔环境或呼吸系统问题有关，建议持续监测并关注是否伴随白天嗜睡或晨起头痛。`,
  spo2Critical: (avg: number) =>
    `近期平均血氧 ${avg}%，低于临床关注阈值（93%）。持续偏低的血氧可能提示呼吸系统问题、心肺功能异常或睡眠呼吸暂停，建议尽快咨询医生。`,

  // ── buildNormalRangeAssessment ──
  rhrExcellent: (avg: number) =>
    `静息心率 ${avg} bpm，处于运动人群的优秀范围（40-60 bpm）`,
  rhrNormal: (avg: number) =>
    `静息心率 ${avg} bpm，处于正常范围（60-100 bpm）`,
  rhrHigh: (avg: number) =>
    `静息心率 ${avg} bpm，高于正常上限（100 bpm），可能与压力、脱水、咖啡因或甲状腺问题有关`,
  rhrLow: (avg: number) =>
    `静息心率 ${avg} bpm，偏低，如果没有长期运动习惯，建议排查心脏传导系统`,

  hrvNote: (avg: number) =>
    `HRV 均值 ${avg} ms——HRV 个体差异大，绝对值的参考意义有限，更重要的是观察趋势变化`,

  spo2InRangeNormal: (avg: number) =>
    `血氧 ${avg}%，正常`,
  spo2InRangeLow: (avg: number) =>
    `血氧 ${avg}%，偏低（正常 ≥95%），需关注`,

  rrNormal: (avg: number) =>
    `呼吸频率 ${avg} 次/分，正常`,
  rrLow: (avg: number) =>
    `呼吸频率 ${avg} 次/分，偏低（正常 12-20）`,
  rrHigh: (avg: number) =>
    `呼吸频率 ${avg} 次/分，偏高（正常 12-20）`,

  vo2Good: (avg: number) =>
    `VO2 Max ${avg} mL/min·kg，心肺耐力良好`,
  vo2Moderate: (avg: number) =>
    `VO2 Max ${avg} mL/min·kg，心肺耐力中等，有提升空间`,
  vo2Low: (avg: number) =>
    `VO2 Max ${avg} mL/min·kg，心肺耐力偏低，建议逐步增加有氧运动`,

  normalRangeInsufficientData: "恢复指标数据不足，无法评估。",

  // ── buildInterpretation ──
  interpretationInsufficientData: "记录不足，暂时无法给出综合解读。",

  coherencePositive: "恢复指标呈现积极趋势：静息心率下降 + HRV 上升，这是自主神经系统恢复良好、身体适应性增强的典型信号",
  coherenceNegative: "恢复指标同步走弱：静息心率上升 + HRV 下降，这是身体承受较大压力的信号，可能与过度训练、睡眠不足、精神压力或正在对抗感染有关",
  coherencePartialDecline: "恢复指标出现部分退化信号，建议结合近期的睡眠质量和训练强度综合判断",
  coherenceStable: "恢复指标保持稳定，没有明显的趋势性变化",
  coherenceAccumulating: "恢复指标可用，基线数据正在积累中，后续趋势判断会更可靠",

  spo2LowContext: (avg: number) =>
    `血氧偏低（${avg}%）值得关注，特别是如果伴随白天嗜睡或晨起头痛，应排查睡眠呼吸暂停`,

  rhrHighContext: "静息心率偏高，如果排除近期运动或咖啡因影响，建议检查是否存在甲状腺功能亢进或贫血",

  // ── buildActionableAdvice ──
  adviceBothWorsening: "恢复指标同步走弱，建议在接下来 1-2 周降低训练强度，优先保证睡眠和压力管理。",
  adviceRhrWorsening: "静息心率呈上升趋势，关注近期是否有压力增加、睡眠变差或过度训练，确保充分的恢复时间。",
  adviceHrvWorsening: "HRV 呈下降趋势，这是身体恢复能力下降的早期信号。增加恢复日安排，尝试冥想或深呼吸练习（每天 5-10 分钟）。",
  adviceSpo2Low: "血氧偏低，建议留意是否有打鼾、夜间憋醒等睡眠呼吸暂停的症状，必要时做多导睡眠监测。",
  adviceRhrHigh: "静息心率偏高，规律的有氧运动（如快走、游泳，每周 3-5 次，每次 30 分钟）可以有效降低静息心率。",
  adviceVo2Low: "VO2 Max 偏低，建议从低强度有氧开始，逐步增加运动量以提升心肺耐力。",
  adviceGood: "你的恢复指标整体良好，继续保持当前的运动和生活节奏。",
  adviceConsistentMeasurement: "保持测量时间的一致性（如每天早起后测量），这能让趋势对比更可靠。",

  // ── buildDoctorTalkingPoints ──
  doctorRhrHigh: (avg: number) =>
    `"我的静息心率最近平均 ${avg} bpm，偏高，需要检查甲状腺或做心电图吗？"`,
  doctorRhrRising: (delta: number) =>
    `"我的静息心率近期上升了 ${delta} bpm，这种变化是否需要关注？"`,
  doctorSpo2Low: (avg: number) =>
    `"我的血氧平均 ${avg}%，偏低，是否需要做睡眠呼吸暂停筛查或肺功能检查？"`,
  doctorHrvDrop: (delta: number) =>
    `"我的 HRV 近期下降了 ${delta} ms，这是否反映自主神经功能的变化？"`,
  doctorRrAbnormal: (avg: number, direction: string) =>
    `"我的呼吸频率平均 ${avg} 次/分，偏${direction}，需要进一步检查吗？"`,
  doctorNormal: `"我的恢复指标数据整体看起来正常，有没有什么预防性的心血管检查建议？"`,
};
export type RecoveryT = typeof recoveryZh;
