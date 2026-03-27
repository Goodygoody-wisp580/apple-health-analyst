import type { AnalysisSummary, NumericComparison } from "../types.js";

function statusLabel(status: string): string {
  return status === "ok" ? "正常" : "数据不足";
}

function warningModuleLabel(module: string): string {
  const labels: Record<string, string> = {
    sleep: "睡眠",
    recovery: "恢复",
    activity: "活动",
    bodyComposition: "身体成分",
    overview: "概览",
  };
  return labels[module] ?? module;
}

function metricKeyLabel(metric: string): string {
  const labels: Record<string, string> = {
    restingHeartRate: "静息心率",
    hrv: "HRV",
    oxygenSaturation: "血氧",
    respiratoryRate: "呼吸频率",
    vo2Max: "最大摄氧量",
    bodyMass: "体重",
    bodyFatPercentage: "体脂率",
  };
  return labels[metric] ?? metric;
}

function fmt(value: number | null, suffix = ""): string {
  return value === null ? "数据不足" : `${value}${suffix}`;
}

function metricLine(label: string, metric: NumericComparison | undefined): string {
  if (!metric) {
    return `- ${label}：数据不足`;
  }
  return `- ${label}：近 30 天 ${fmt(metric.recent30d.average, metric.unit ? ` ${metric.unit}` : "")}，基线 90 天 ${fmt(metric.baseline90d.average, metric.unit ? ` ${metric.unit}` : "")}，变化 ${fmt(metric.delta, metric.unit ? ` ${metric.unit}` : "")}，最新值 ${metric.latest ? `${metric.latest.value} ${metric.unit} @ ${metric.latest.timestamp}` : "数据不足"}`;
}

export function renderReportMarkdown(summary: AnalysisSummary): string {
  const warningLines =
    summary.warnings.length > 0
      ? summary.warnings.map((warning) => `- [${warningModuleLabel(warning.module)}] ${warning.message}`).join("\n")
      : "- 无";

  const sleep = summary.sleep;
  const sleepSource = sleep.source ?? "数据不足";

  return `# Apple Health 分析报告

## 数据范围
- 导出日期：${summary.input.exportDate ?? "未知"}
- 分析窗口：${summary.coverage.windowStart ?? "起始"} -> ${summary.coverage.windowEnd}
- 记录数：${summary.coverage.recordCount}
- 训练数：${summary.coverage.workoutCount}
- 活动摘要数：${summary.coverage.activitySummaryCount}

## 主数据源
- 睡眠：${summary.sources.primary.sleep ?? "数据不足"}
- 恢复：${Object.entries(summary.sources.primary.recovery)
    .map(([metric, source]) => `${metricKeyLabel(metric)}=${source}`)
    .join("，") || "数据不足"}
- 身体成分：${Object.entries(summary.sources.primary.bodyComposition)
    .map(([metric, source]) => `${metricKeyLabel(metric)}=${source}`)
    .join("，") || "数据不足"}
- 活动：${summary.sources.primary.activity}

## 警告
${warningLines}

## 睡眠
- 状态：${statusLabel(sleep.status)}
- 数据源：${sleepSource}
- 覆盖夜数：${sleep.coverageDays}
- 近 30 天睡眠时长：${fmt(sleep.recent30d.avgSleepHours, " 小时")}
- 基线 90 天睡眠时长：${fmt(sleep.baseline90d.avgSleepHours, " 小时")}
- 近 30 天清醒时长：${fmt(sleep.recent30d.avgAwakeHours, " 小时")}
- 基线 90 天清醒时长：${fmt(sleep.baseline90d.avgAwakeHours, " 小时")}
- 近 30 天中位入睡 / 起床时间：${sleep.recent30d.medianBedtime ?? "数据不足"} / ${sleep.recent30d.medianWakeTime ?? "数据不足"}
- 基线 90 天中位入睡 / 起床时间：${sleep.baseline90d.medianBedtime ?? "数据不足"} / ${sleep.baseline90d.medianWakeTime ?? "数据不足"}
- 近 30 天睡眠阶段占比：核心 ${fmt(sleep.recent30d.stagePct.core, "%")}，REM ${fmt(sleep.recent30d.stagePct.rem, "%")}，深度 ${fmt(sleep.recent30d.stagePct.deep, "%")}
- 已排除的不完整夜晚：${sleep.partialNights.length > 0 ? sleep.partialNights.map((night) => `${night.date} (${night.totalSleepHours}h)`).join("，") : "无"}

## 恢复
- 状态：${statusLabel(summary.recovery.status)}
${metricLine("静息心率", summary.recovery.metrics.restingHeartRate)}
${metricLine("HRV", summary.recovery.metrics.hrv)}
${metricLine("血氧", summary.recovery.metrics.oxygenSaturation)}
${metricLine("呼吸频率", summary.recovery.metrics.respiratoryRate)}
${metricLine("最大摄氧量", summary.recovery.metrics.vo2Max)}

## 活动
- 状态：${statusLabel(summary.activity.status)}
- 近 30 天活动能量：${fmt(summary.activity.recent30d.activeEnergyBurnedKcal, " kcal")}
- 基线 90 天活动能量：${fmt(summary.activity.baseline90d.activeEnergyBurnedKcal, " kcal")}
- 近 30 天锻炼分钟：${fmt(summary.activity.recent30d.exerciseMinutes, " 分钟")}
- 基线 90 天锻炼分钟：${fmt(summary.activity.baseline90d.exerciseMinutes, " 分钟")}
- 近 30 天站立小时：${fmt(summary.activity.recent30d.standHours, " 小时")}
- 基线 90 天站立小时：${fmt(summary.activity.baseline90d.standHours, " 小时")}
- 近 30 天训练次数：${summary.activity.recent30d.workouts}
- 基线 90 天训练次数：${summary.activity.baseline90d.workouts}
- 近 30 天最高频训练类型：${summary.activity.recent30d.topWorkoutTypes.map((item) => `${item.type} (${item.count})`).join("，") || "无"}

## 身体成分
- 状态：${statusLabel(summary.bodyComposition.status)}
${metricLine("体重", summary.bodyComposition.metrics.bodyMass)}
${metricLine("体脂率", summary.bodyComposition.metrics.bodyFatPercentage)}

## 附件
- ECG 文件数：${summary.attachments.ecgFiles}
- 训练路线文件数：${summary.attachments.workoutRouteFiles}
- 图片附件数：${summary.attachments.imageAttachments}
- 其他文件数：${summary.attachments.otherFiles}
`;
}
