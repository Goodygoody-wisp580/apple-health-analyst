export const menstrualCycleZh = {
  // ── Separators ──
  partSep: "；",
  partEnd: "。",
  sentSep: "。",

  // ── Notes ────────────────────────────────────────────────────────

  noteFewPeriods: "生理周期记录较少，周期规律性评估可信度有限。",

  noteContraceptiveUse: (contraceptiveUse: string) =>
    `检测到避孕药使用记录（${contraceptiveUse}），可能影响周期规律性。`,

  noteIntermenstrualBleeding: (count: number) =>
    `检测到 ${count} 次经间期出血记录。`,

  // ── Warnings ─────────────────────────────────────────────────────

  warningIrregular: (cycleLengthStd: number) =>
    `生理周期不规律，周期标准差 ${cycleLengthStd} 天。`,

  warningCycleLengthOutOfRange: (avgCycleLength: number) =>
    `平均周期 ${avgCycleLength} 天，偏离正常范围（21-38 天）。`,

  // ── Flow Pattern Description ─────────────────────────────────────

  flowPatternHeavy: (heavyPct: number) =>
    `经期出血以中重量为主（重度占 ${heavyPct}%），重度出血比例偏高可能与子宫内膜增厚、激素波动或子宫肌瘤等因素有关`,

  flowPatternLight: (lightPct: number) =>
    `经期出血以轻量为主（轻度占 ${lightPct}%），通常提示子宫内膜较薄或激素水平偏低`,

  flowPatternBalanced: (lightPct: number, mediumPct: number, heavyPct: number) =>
    `经期出血量分布较均匀（轻度 ${lightPct}%、中度 ${mediumPct}%、重度 ${heavyPct}%），整体在正常范围内`,

  flowDurationLengthening:
    "近期经期天数呈延长趋势，如果伴随出血量增加，建议留意是否有贫血症状（疲劳、头晕）",

  flowDurationShortening:
    "近期经期天数有缩短趋势，如果同时出血量减少，可能与压力、体重变化或激素调节有关",

  // ── Normal Range Assessment ──────────────────────────────────────

  normalRangeInsufficient: "数据不足，无法评估。",

  cycleLengthIdeal: (avgCycle: number) =>
    `平均周期 ${avgCycle} 天，处于理想范围（24-35 天）`,

  cycleLengthNormalButEdge: (avgCycle: number, direction: string) =>
    `平均周期 ${avgCycle} 天，在临床正常范围（21-38 天）内，但偏${direction}，值得持续观察`,

  cycleLengthDirectionShort: "短",
  cycleLengthDirectionLong: "长",

  cycleLengthOutOfRange: (avgCycle: number) =>
    `平均周期 ${avgCycle} 天，已超出临床正常范围（21-38 天），建议咨询妇科医生排查原因`,

  periodDurationNormal: (avgDuration: number) =>
    `经期平均 ${avgDuration} 天，在正常范围内`,

  periodDurationShort: (avgDuration: number) =>
    `经期平均仅 ${avgDuration} 天，偏短，可能提示排卵功能或子宫内膜状况需要关注`,

  periodDurationLong: (avgDuration: number) =>
    `经期平均 ${avgDuration} 天，偏长（正常为 3-7 天），长期偏长的经期可能增加贫血风险`,

  regularityGood:
    "周期规律性良好，这通常反映下丘脑-垂体-卵巢轴（HPO 轴）功能协调",

  regularitySomewhatIrregular:
    "周期有一定波动但仍在可接受范围，压力、睡眠变化、跨时区旅行等都可能引起短期波动",

  regularityIrregular:
    "周期波动较大，可能与多囊卵巢综合征（PCOS）、甲状腺功能异常、过度运动或体重剧烈变化有关",

  // ── Interpretation ───────────────────────────────────────────────

  interpretationInsufficient:
    "记录不足，暂时无法给出综合解读。建议持续记录至少 3 个完整周期。",

  interpretationHealthyOverall:
    "你的生理周期整体健康：周期规律、长度正常，这是内分泌系统运转良好的积极信号",

  interpretationRegularButEdge:
    "周期虽然规律，但长度偏离理想范围，建议下次体检时让医生评估一下激素水平",

  interpretationSomeVariation:
    "周期存在一定波动，不一定代表异常，但值得结合生活方式综合判断",

  interpretationCycleLengthening: (delta: number) =>
    `近期周期比历史平均延长了约 ${Math.abs(delta)} 天。周期逐渐变长可能与压力增加、体重变化、睡眠节律紊乱或接近围绝经期有关`,

  interpretationCycleShortening: (delta: number) =>
    `近期周期比历史平均缩短了约 ${Math.abs(delta)} 天。周期缩短有时与黄体期缩短有关，如果在备孕期间尤其值得关注`,

  interpretationCycleStable:
    "近期周期与历史平均保持一致，没有明显的趋势性变化",

  interpretationFrequentIntermenstrual:
    "经间期出血较频繁。偶尔的排卵期出血属于正常现象，但如果每个周期都出现，建议排查宫颈息肉、内膜异常或激素失衡",

  interpretationMinorIntermenstrual:
    "有少量经间期出血记录，如果为排卵期少量点滴出血属于正常生理现象",

  interpretationContraceptive:
    "数据中有口服避孕药使用记录。激素类避孕药会直接调节周期，使用期间的周期数据反映的是药物调控后的模式而非自然周期",

  // ── Actionable Advice ────────────────────────────────────────────

  adviceRegularSleep:
    "保持规律的作息时间——昼夜节律紊乱是影响生理周期的重要因素，固定起床时间比固定入睡时间更关键。",

  adviceCycleLengthening:
    "近期周期在变长，建议关注压力管理和营养均衡，持续观察 2-3 个周期看是否自行恢复。",

  adviceCycleShortening:
    "近期周期在缩短，注意观察经期出血量是否同步减少，如果连续缩短建议检查黄体功能。",

  advicePeriodLengthening:
    "经期天数呈延长趋势，留意是否有疲劳、面色苍白等贫血迹象，必要时检查血常规。",

  adviceFrequentIntermenstrual:
    "经间期出血频繁出现，建议预约妇科检查，排查宫颈和子宫内膜情况。",

  adviceAbnormalCycleLength:
    "周期长度偏离正常范围，建议进行激素六项检查（FSH、LH、E2、P、T、PRL），明确内分泌状态。",

  adviceAllGood:
    "你的周期状态良好，继续保持规律的生活节奏和适度运动。",

  adviceKeepTracking:
    "坚持记录每次经期的起止日期和出血量，持续的数据积累能帮助更早发现潜在变化。",

  // ── Doctor Talking Points ────────────────────────────────────────

  doctorAbnormalCycleLength: (avgCycle: number) =>
    `"我的生理周期平均 ${avgCycle} 天，偏离正常范围，是否需要做激素检查？"`,

  doctorIrregular: (std: number) =>
    `"我的周期波动比较大（标准差 ${std} 天），这可能和哪些因素有关？需要排查 PCOS 吗？"`,

  doctorCycleLengthening: (delta: number) =>
    `"我注意到近几个月周期在变长（延长了约 ${Math.abs(delta)} 天），这是需要关注的信号吗？"`,

  doctorCycleShortening: (delta: number) =>
    `"我的周期近期在缩短（缩短了约 ${Math.abs(delta)} 天），是否需要检查黄体功能？"`,

  doctorFrequentIntermenstrual:
    `"我经常在两次经期之间有少量出血，这种情况需要做什么检查？"`,

  doctorLongPeriod: (avgDuration: number) =>
    `"我的经期平均持续 ${avgDuration} 天，偏长，是否需要检查子宫内膜或排查肌瘤？"`,

  doctorPeriodLengthening:
    `"我感觉最近几次经期比以前长，出血量也可能在增加，需要查一下血常规吗？"`,

  doctorAllNormal:
    `"我的生理周期数据整体看起来正常，有没有什么预防性的检查建议？"`,
};

export type MenstrualCycleT = typeof menstrualCycleZh;
