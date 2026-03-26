import type { AnalysisSummary, NumericComparison } from "../types.js";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(value: number | null, suffix = ""): string {
  return value === null ? "insufficient_data" : `${value}${suffix}`;
}

function metricRow(label: string, metric: NumericComparison | undefined): string {
  if (!metric) {
    return `<tr><th>${escapeHtml(label)}</th><td colspan="4">insufficient_data</td></tr>`;
  }
  return `<tr><th>${escapeHtml(label)}</th><td>${fmt(metric.recent30d.average, ` ${metric.unit}`)}</td><td>${fmt(metric.baseline90d.average, ` ${metric.unit}`)}</td><td>${fmt(metric.delta, ` ${metric.unit}`)}</td><td>${metric.latest ? `${metric.latest.value} ${metric.unit} @ ${escapeHtml(metric.latest.timestamp)}` : "insufficient_data"}</td></tr>`;
}

export function renderReportHtml(summary: AnalysisSummary): string {
  const warnings =
    summary.warnings.length > 0
      ? `<ul>${summary.warnings
          .map((warning) => `<li>[${escapeHtml(warning.module)}] ${escapeHtml(warning.message)}</li>`)
          .join("")}</ul>`
      : "<p>None</p>";

  const workoutTypes =
    summary.activity.recent30d.topWorkoutTypes.length > 0
      ? summary.activity.recent30d.topWorkoutTypes
          .map((item) => `${escapeHtml(item.type)} (${item.count})`)
          .join(", ")
      : "none";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Apple Health Analysis</title>
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
    <h1>Apple Health Analysis</h1>
    <h2>Data Coverage</h2>
    <p>Export date: ${escapeHtml(summary.input.exportDate ?? "unknown")}</p>
    <p>Window: ${escapeHtml(summary.coverage.windowStart ?? "start")} -> ${escapeHtml(summary.coverage.windowEnd)}</p>
    <p>Records: ${summary.coverage.recordCount}, Workouts: ${summary.coverage.workoutCount}, Activity summaries: ${summary.coverage.activitySummaryCount}</p>

    <h2>Warnings</h2>
    ${warnings}

    <h2>Sleep</h2>
    <p>Status: ${escapeHtml(summary.sleep.status)}. Source: ${escapeHtml(summary.sleep.source ?? "insufficient_data")}. Coverage nights: ${summary.sleep.coverageDays}</p>
    <p>Recent30d sleep: ${fmt(summary.sleep.recent30d.avgSleepHours, " h")}, baseline90d sleep: ${fmt(summary.sleep.baseline90d.avgSleepHours, " h")}</p>
    <p>Recent30d bedtime/wake: ${escapeHtml(summary.sleep.recent30d.medianBedtime ?? "insufficient_data")} / ${escapeHtml(summary.sleep.recent30d.medianWakeTime ?? "insufficient_data")}</p>

    <h2>Recovery</h2>
    <table>
      <thead>
        <tr><th>Metric</th><th>Recent30d</th><th>Baseline90d</th><th>Delta</th><th>Latest</th></tr>
      </thead>
      <tbody>
        ${metricRow("Resting heart rate", summary.recovery.metrics.restingHeartRate)}
        ${metricRow("HRV", summary.recovery.metrics.hrv)}
        ${metricRow("Blood oxygen", summary.recovery.metrics.oxygenSaturation)}
        ${metricRow("Respiratory rate", summary.recovery.metrics.respiratoryRate)}
        ${metricRow("VO2 max", summary.recovery.metrics.vo2Max)}
      </tbody>
    </table>

    <h2>Activity</h2>
    <p>Status: ${escapeHtml(summary.activity.status)}</p>
    <p>Recent30d active energy: ${fmt(summary.activity.recent30d.activeEnergyBurnedKcal, " kcal")}, baseline90d active energy: ${fmt(summary.activity.baseline90d.activeEnergyBurnedKcal, " kcal")}</p>
    <p>Recent30d exercise minutes: ${fmt(summary.activity.recent30d.exerciseMinutes, " min")}, baseline90d exercise minutes: ${fmt(summary.activity.baseline90d.exerciseMinutes, " min")}</p>
    <p>Top workout types recent30d: ${workoutTypes}</p>

    <h2>Body Composition</h2>
    <table>
      <thead>
        <tr><th>Metric</th><th>Recent30d</th><th>Baseline90d</th><th>Delta</th><th>Latest</th></tr>
      </thead>
      <tbody>
        ${metricRow("Body mass", summary.bodyComposition.metrics.bodyMass)}
        ${metricRow("Body fat percentage", summary.bodyComposition.metrics.bodyFatPercentage)}
      </tbody>
    </table>

    <h2>Attachments</h2>
    <p>ECG files: ${summary.attachments.ecgFiles}, workout route files: ${summary.attachments.workoutRouteFiles}, image attachments: ${summary.attachments.imageAttachments}, other files: ${summary.attachments.otherFiles}</p>
  </body>
</html>
`;
}
