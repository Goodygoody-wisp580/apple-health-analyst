import type { AnalysisSummary, NumericComparison } from "../types.js";

function fmt(value: number | null, suffix = ""): string {
  return value === null ? "insufficient_data" : `${value}${suffix}`;
}

function metricLine(label: string, metric: NumericComparison | undefined): string {
  if (!metric) {
    return `- ${label}: insufficient_data`;
  }
  return `- ${label}: recent30d ${fmt(metric.recent30d.average, metric.unit ? ` ${metric.unit}` : "")}, baseline90d ${fmt(metric.baseline90d.average, metric.unit ? ` ${metric.unit}` : "")}, delta ${fmt(metric.delta, metric.unit ? ` ${metric.unit}` : "")}, latest ${metric.latest ? `${metric.latest.value} ${metric.unit} @ ${metric.latest.timestamp}` : "insufficient_data"}`;
}

export function renderReportMarkdown(summary: AnalysisSummary): string {
  const warningLines =
    summary.warnings.length > 0 ? summary.warnings.map((warning) => `- [${warning.module}] ${warning.message}`).join("\n") : "- None";

  const sleep = summary.sleep;
  const sleepSource = sleep.source ?? "insufficient_data";

  return `# Apple Health Analysis

## Data Coverage
- Export date: ${summary.input.exportDate ?? "unknown"}
- Window: ${summary.coverage.windowStart ?? "start"} -> ${summary.coverage.windowEnd}
- Records: ${summary.coverage.recordCount}
- Workouts: ${summary.coverage.workoutCount}
- Activity summaries: ${summary.coverage.activitySummaryCount}

## Primary Sources
- Sleep: ${summary.sources.primary.sleep ?? "insufficient_data"}
- Recovery: ${Object.entries(summary.sources.primary.recovery)
    .map(([metric, source]) => `${metric}=${source}`)
    .join(", ") || "insufficient_data"}
- Body composition: ${Object.entries(summary.sources.primary.bodyComposition)
    .map(([metric, source]) => `${metric}=${source}`)
    .join(", ") || "insufficient_data"}
- Activity: ${summary.sources.primary.activity}

## Warnings
${warningLines}

## Sleep
- Status: ${sleep.status}
- Source: ${sleepSource}
- Coverage nights: ${sleep.coverageDays}
- Recent30d sleep: ${fmt(sleep.recent30d.avgSleepHours, " h")}
- Baseline90d sleep: ${fmt(sleep.baseline90d.avgSleepHours, " h")}
- Recent30d awake: ${fmt(sleep.recent30d.avgAwakeHours, " h")}
- Baseline90d awake: ${fmt(sleep.baseline90d.avgAwakeHours, " h")}
- Recent30d bedtime / wake: ${sleep.recent30d.medianBedtime ?? "insufficient_data"} / ${sleep.recent30d.medianWakeTime ?? "insufficient_data"}
- Baseline90d bedtime / wake: ${sleep.baseline90d.medianBedtime ?? "insufficient_data"} / ${sleep.baseline90d.medianWakeTime ?? "insufficient_data"}
- Stage pct recent30d: core ${fmt(sleep.recent30d.stagePct.core, "%")}, rem ${fmt(sleep.recent30d.stagePct.rem, "%")}, deep ${fmt(sleep.recent30d.stagePct.deep, "%")}
- Partial nights excluded: ${sleep.partialNights.length > 0 ? sleep.partialNights.map((night) => `${night.date} (${night.totalSleepHours}h)`).join(", ") : "none"}

## Recovery
- Status: ${summary.recovery.status}
${metricLine("Resting heart rate", summary.recovery.metrics.restingHeartRate)}
${metricLine("HRV", summary.recovery.metrics.hrv)}
${metricLine("Blood oxygen", summary.recovery.metrics.oxygenSaturation)}
${metricLine("Respiratory rate", summary.recovery.metrics.respiratoryRate)}
${metricLine("VO2 max", summary.recovery.metrics.vo2Max)}

## Activity
- Status: ${summary.activity.status}
- Recent30d active energy: ${fmt(summary.activity.recent30d.activeEnergyBurnedKcal, " kcal")}
- Baseline90d active energy: ${fmt(summary.activity.baseline90d.activeEnergyBurnedKcal, " kcal")}
- Recent30d exercise minutes: ${fmt(summary.activity.recent30d.exerciseMinutes, " min")}
- Baseline90d exercise minutes: ${fmt(summary.activity.baseline90d.exerciseMinutes, " min")}
- Recent30d stand hours: ${fmt(summary.activity.recent30d.standHours, " h")}
- Baseline90d stand hours: ${fmt(summary.activity.baseline90d.standHours, " h")}
- Recent workouts: ${summary.activity.recent30d.workouts}
- Baseline workouts: ${summary.activity.baseline90d.workouts}
- Top workout types recent30d: ${summary.activity.recent30d.topWorkoutTypes.map((item) => `${item.type} (${item.count})`).join(", ") || "none"}

## Body Composition
- Status: ${summary.bodyComposition.status}
${metricLine("Body mass", summary.bodyComposition.metrics.bodyMass)}
${metricLine("Body fat percentage", summary.bodyComposition.metrics.bodyFatPercentage)}

## Attachments
- ECG files: ${summary.attachments.ecgFiles}
- Workout route files: ${summary.attachments.workoutRouteFiles}
- Image attachments: ${summary.attachments.imageAttachments}
- Other files: ${summary.attachments.otherFiles}
`;
}
