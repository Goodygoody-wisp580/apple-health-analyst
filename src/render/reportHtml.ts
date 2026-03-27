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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(value: number | null, suffix = ""): string {
  return value === null ? "数据不足" : `${value}${suffix}`;
}

function metricRow(label: string, metric: NumericComparison | undefined): string {
  if (!metric) {
    return `<tr><th>${escapeHtml(label)}</th><td colspan="4">数据不足</td></tr>`;
  }
  return `<tr><th>${escapeHtml(label)}</th><td>${fmt(metric.recent30d.average, ` ${metric.unit}`)}</td><td>${fmt(metric.baseline90d.average, ` ${metric.unit}`)}</td><td>${fmt(metric.delta, ` ${metric.unit}`)}</td><td>${metric.latest ? `${metric.latest.value} ${metric.unit} @ ${escapeHtml(metric.latest.timestamp)}` : "数据不足"}</td></tr>`;
}

export function renderReportHtml(summary: AnalysisSummary): string {
  const warnings =
    summary.warnings.length > 0
      ? `<ul>${summary.warnings
          .map((warning) => `<li>[${escapeHtml(warningModuleLabel(warning.module))}] ${escapeHtml(warning.message)}</li>`)
          .join("")}</ul>`
      : "<p>无</p>";

  const workoutTypes =
    summary.activity.recent30d.topWorkoutTypes.length > 0
      ? summary.activity.recent30d.topWorkoutTypes
          .map((item) => `${escapeHtml(item.type)} (${item.count})`)
          .join(", ")
      : "无";

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Apple Health 分析报告</title>
    <style>
      :root { color-scheme: light; font-family: ui-sans-serif, system-ui, sans-serif; }
      body { margin: 2rem auto; max-width: 960px; padding: 0 1rem; line-height: 1.5; color: #111827; }
      h1, h2 { margin-top: 2rem; }
      table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; }
      th, td { border: 1px solid #d1d5db; padding: 0.5rem; text-align: left; vertical-align: top; }
      th { background: #f3f4f6; }
      code { background: #f3f4f6; padding: 0.1rem 0.25rem; border-radius: 4px; }
    </style>
  </head>
  <body>
    <h1>Apple Health 分析报告</h1>
    <h2>数据范围</h2>
    <p>导出日期：${escapeHtml(summary.input.exportDate ?? "未知")}</p>
    <p>分析窗口：${escapeHtml(summary.coverage.windowStart ?? "起始")} -> ${escapeHtml(summary.coverage.windowEnd)}</p>
    <p>记录数：${summary.coverage.recordCount}，训练数：${summary.coverage.workoutCount}，活动摘要数：${summary.coverage.activitySummaryCount}</p>

    <h2>警告</h2>
    ${warnings}

    <h2>睡眠</h2>
    <p>状态：${escapeHtml(statusLabel(summary.sleep.status))}。数据源：${escapeHtml(summary.sleep.source ?? "数据不足")}。覆盖夜数：${summary.sleep.coverageDays}</p>
    <p>近 30 天睡眠时长：${fmt(summary.sleep.recent30d.avgSleepHours, " 小时")}，基线 90 天睡眠时长：${fmt(summary.sleep.baseline90d.avgSleepHours, " 小时")}</p>
    <p>近 30 天中位入睡 / 起床时间：${escapeHtml(summary.sleep.recent30d.medianBedtime ?? "数据不足")} / ${escapeHtml(summary.sleep.recent30d.medianWakeTime ?? "数据不足")}</p>

    <h2>恢复</h2>
    <table>
      <thead>
        <tr><th>指标</th><th>近 30 天</th><th>基线 90 天</th><th>变化</th><th>最新值</th></tr>
      </thead>
      <tbody>
        ${metricRow("静息心率", summary.recovery.metrics.restingHeartRate)}
        ${metricRow("HRV", summary.recovery.metrics.hrv)}
        ${metricRow("血氧", summary.recovery.metrics.oxygenSaturation)}
        ${metricRow("呼吸频率", summary.recovery.metrics.respiratoryRate)}
        ${metricRow("最大摄氧量", summary.recovery.metrics.vo2Max)}
      </tbody>
    </table>

    <h2>活动</h2>
    <p>状态：${escapeHtml(statusLabel(summary.activity.status))}</p>
    <p>近 30 天活动能量：${fmt(summary.activity.recent30d.activeEnergyBurnedKcal, " kcal")}，基线 90 天活动能量：${fmt(summary.activity.baseline90d.activeEnergyBurnedKcal, " kcal")}</p>
    <p>近 30 天锻炼分钟：${fmt(summary.activity.recent30d.exerciseMinutes, " 分钟")}，基线 90 天锻炼分钟：${fmt(summary.activity.baseline90d.exerciseMinutes, " 分钟")}</p>
    <p>近 30 天最高频训练类型：${workoutTypes}</p>

    <h2>身体成分</h2>
    <table>
      <thead>
        <tr><th>指标</th><th>近 30 天</th><th>基线 90 天</th><th>变化</th><th>最新值</th></tr>
      </thead>
      <tbody>
        ${metricRow("体重", summary.bodyComposition.metrics.bodyMass)}
        ${metricRow("体脂率", summary.bodyComposition.metrics.bodyFatPercentage)}
      </tbody>
    </table>

    <h2>附件</h2>
    <p>ECG 文件数：${summary.attachments.ecgFiles}，训练路线文件数：${summary.attachments.workoutRouteFiles}，图片附件数：${summary.attachments.imageAttachments}，其他文件数：${summary.attachments.otherFiles}</p>
  </body>
</html>
`;
}
