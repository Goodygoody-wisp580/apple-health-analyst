import {
  NARRATIVE_REPORT_SCHEMA_VERSION,
  type InsightBundle,
  type NarrativeReport,
} from "../types.js";

function pickFirstLines(values: string[], fallback: string): string[] {
  const filtered = values.map((value) => value.trim()).filter(Boolean);
  return filtered.length > 0 ? filtered : [fallback];
}

function fmt(value: number | null, suffix = ""): string {
  return value === null ? "数据不足" : `${value}${suffix}`;
}

export function createFallbackNarrative(insights: InsightBundle): NarrativeReport {
  const strongestRisk = insights.riskFlags[0];
  const leadingPositive = insights.notableChanges.find((change) => change.direction === "improving");
  const lowConfidence = insights.sourceConfidence.filter((entry) => entry.level === "low");
  const historyHints = insights.historicalContext.interpretationHints;
  const sleepHistory = insights.historicalContext.sleep;
  const activityHistory = insights.historicalContext.activity;
  const bodyMassHistory = insights.historicalContext.bodyComposition.bodyMass;
  const spanDays = insights.historicalContext.scope.totalSpanDays;
  const sleepLongitudinalLine =
    sleepHistory.allTime.avgSleepHours !== null
      ? `最近 30 天平均睡眠 ${fmt(sleepHistory.recent30d.avgSleepHours, " 小时")}，过去 180 天 ${fmt(sleepHistory.trailing180d.avgSleepHours, " 小时")}，整个可用历史 ${fmt(sleepHistory.allTime.avgSleepHours, " 小时")}。`
      : "";
  const activityLongitudinalLine =
    activityHistory.allTime.exerciseMinutes !== null
      ? `最近 30 天平均锻炼 ${fmt(activityHistory.recent30d.exerciseMinutes, " 分钟")}，过去 180 天 ${fmt(activityHistory.trailing180d.exerciseMinutes, " 分钟")}，整个可用历史 ${fmt(activityHistory.allTime.exerciseMinutes, " 分钟")}。`
      : "";
  const bodyLongitudinalLine =
    bodyMassHistory?.allTime.average !== null && bodyMassHistory?.allTime.average !== undefined
      ? `最近 30 天平均体重 ${fmt(bodyMassHistory.recent30d.average, ` ${bodyMassHistory.unit}`)}，整个可用历史平均 ${fmt(bodyMassHistory.allTime.average, ` ${bodyMassHistory.unit}`)}。`
      : "";

  const overviewParts = [
    spanDays > 0 ? `本次判断同时参考了最近 30 天、过去 180 天和约 ${spanDays} 天的可用历史。` : "",
    strongestRisk
      ? `当前最需要优先关注的是“${strongestRisk.title}”，建议先从可执行的生活与恢复习惯调整入手。`
      : "当前数据没有显示出需要立刻升级处理的明显风险，更适合围绕稳定习惯继续优化。",
    historyHints[0] ?? "",
    leadingPositive
      ? `同时，“${leadingPositive.title}”说明你已经有一部分趋势在朝更好的方向发展。`
      : "如果接下来能保持更稳定的记录密度，后续趋势判断会更可靠。",
  ].filter(Boolean);

  return {
    schema_version: NARRATIVE_REPORT_SCHEMA_VERSION,
    overview: overviewParts.join(" "),
    key_findings: pickFirstLines(
      [
        ...historyHints.slice(0, 2),
        ...insights.riskFlags.slice(0, 3).map((flag) => `${flag.title}：${flag.summary}`),
        ...insights.notableChanges
          .filter((change) => change.direction === "improving")
          .slice(0, 2)
          .map((change) => `${change.title}：${change.summary}`),
        ...[sleepLongitudinalLine, activityLongitudinalLine].filter(Boolean),
      ],
      "当前可读样本有限，建议先延长记录周期，再看更稳定的趋势结论。",
    ),
    strengths: pickFirstLines(
      [
        ...insights.notableChanges
          .filter((change) => change.direction === "improving")
          .map((change) => `${change.title}：${change.summary}`),
        ...historyHints.filter((hint) => /更充足|更从容|方向较一致/.test(hint)),
      ],
      "当前没有明显的高风险信号，基础健康管理仍有较大优化空间。",
    ),
    watchouts: pickFirstLines(
      [
        ...insights.riskFlags.map((flag) => `${flag.title}：${flag.recommendationFocus}`),
        ...historyHints.filter((hint) => /优先|留意|偏高|偏低/.test(hint)),
        bodyLongitudinalLine,
      ].filter(Boolean) as string[],
      "没有发现需要立即放大的风险信号，但仍建议关注睡眠、恢复和活动的一致性。",
    ),
    actions_next_2_weeks: pickFirstLines(
      [
        ...insights.riskFlags.slice(0, 2).map((flag) => flag.recommendationFocus),
        ...historyHints
          .filter((hint) => /优先|适合先/.test(hint))
          .map((hint) => hint.replace(/，/g, "，并 ").replace(/。$/, "。")),
        "固定起床时间和主要训练日，尽量避免让睡眠与训练节奏频繁漂移。",
        "优先保证记录连续性，让下一轮分析能看到更稳定的近期趋势。",
      ],
      "保持连续记录 2 周，再复盘睡眠、恢复和活动的变化方向。",
    ).slice(0, 4),
    when_to_seek_care: pickFirstLines(
      [
        ...insights.riskFlags
          .filter((flag) => flag.seekCare)
          .map((flag) => `${flag.title}：如果同类异常持续存在，或伴随明显不适，建议尽快复查并咨询医生。`),
        "如果近期持续出现明显疲劳、胸闷、呼吸不适、头晕或运动耐受明显下降，即使设备数据不完整，也建议尽快就医。",
      ],
      "如果出现持续恶化的异常数据并伴随明显不适，应及时寻求专业医生帮助。",
    ).slice(0, 3),
    data_limitations: pickFirstLines(
      [
        ...insights.dataGaps.map((gap) => gap.summary),
        ...lowConfidence.map((entry) => `${entry.summary} 这会降低相关结论的稳定性。`),
        spanDays >= 180 && insights.dataGaps.length > 0
          ? "虽然可用历史已经较长，但如果最近记录变稀疏，近期判断仍然需要保守。"
          : "",
      ],
      "当前数据覆盖尚可，但仍应把结论理解为趋势参考，而不是精确诊断。",
    ).slice(0, 4),
    chart_callouts: insights.charts.map((chart) => {
      const relatedRisk = insights.riskFlags.find((flag) => flag.module === chart.id);
      const relatedChange = insights.notableChanges.find((change) => change.module === chart.id);
      const relatedHistoryHint = historyHints.find((hint) => {
        if (chart.id === "sleep") {
          return /睡眠/.test(hint);
        }
        if (chart.id === "recovery") {
          return /静息心率|HRV|恢复/.test(hint);
        }
        if (chart.id === "activity") {
          return /活动量|锻炼|训练/.test(hint);
        }
        return /体重|体脂|摄入/.test(hint);
      });
      return {
        chart_id: chart.id,
        title: chart.title,
        summary:
          relatedRisk?.summary ??
          relatedChange?.summary ??
          relatedHistoryHint ??
          chart.subtitle,
      };
    }),
    disclaimer:
      "本报告仅用于健康管理和生活方式调整参考，不构成医疗诊断、治疗建议或替代专业医生意见。",
  };
}
