import type { RenderT } from "../i18n/zh/render.js";
import type { InsightBundle, NarrativeReport } from "../types.js";

function makeFmt(insufficientLabel: string) {
  return function fmt(value: number | null, suffix = ""): string {
    return value === null ? insufficientLabel : `${value}${suffix}`;
  };
}

function section(title: string, values: string[]): string {
  return `## ${title}\n${values.map((value) => `- ${value}`).join("\n")}`;
}

export function renderReportMarkdown(insights: InsightBundle, narrative: NarrativeReport, t: RenderT): string {
  const fmt = makeFmt(t.insufficientData);
  const callouts = new Map(narrative.chart_callouts.map((item) => [item.chart_id, item]));
  const cm = insights.crossMetric;
  const scoresParts: string[] = [];
  if (cm.compositeAssessment.sleepScore !== null) scoresParts.push(t.mdScoreSleep(cm.compositeAssessment.sleepScore));
  if (cm.compositeAssessment.recoveryScore !== null) scoresParts.push(t.mdScoreRecovery(cm.compositeAssessment.recoveryScore));
  if (cm.compositeAssessment.activityScore !== null) scoresParts.push(t.mdScoreActivity(cm.compositeAssessment.activityScore));

  const lines = [
    `# ${t.mdReportTitle}`,
    "",
    `## ${t.mdAssessmentTitle}`,
    narrative.health_assessment,
    "",
    scoresParts.length > 0 ? `**${t.mdCompositeScore}**：${scoresParts.join(" | ")}` : "",
    cm.compositeAssessment.overallReadiness ? `**${t.mdOverallStatus}**：${cm.compositeAssessment.overallReadiness === "good" ? t.readinessGood : cm.compositeAssessment.overallReadiness === "moderate" ? t.readinessModerate : t.readinessLow}` : "",
    "",
    section(t.mdCrossMetricTitle, narrative.cross_metric_insights),
    "",
    section(t.mdBehavioralPatterns, narrative.behavioral_patterns),
    "",
    `## ${t.mdOverviewTitle}`,
    narrative.overview,
    "",
    section(t.mdKeyFindings, narrative.key_findings),
    "",
    section(t.mdStrengths, narrative.strengths),
    "",
    section(t.mdWatchouts, narrative.watchouts),
    "",
    section(t.mdActionsNext2Weeks, narrative.actions_next_2_weeks),
    "",
    section(t.mdSeekCare, narrative.when_to_seek_care),
    "",
    section(t.mdDoctorQuestions, narrative.questions_for_doctor),
    "",
    section(t.mdDataLimitations, narrative.data_limitations),
    "",
    `## ${t.mdDataRangeTitle}`,
    `- ${t.mdExportDate}：${insights.input.exportDate ?? t.mdExportDateUnknown}`,
    `- ${t.mdAnalysisWindow}：${insights.coverage.windowStart ?? t.windowStart} -> ${insights.coverage.windowEnd}`,
    `- ${t.mdRecordCount}：${insights.coverage.recordCount}`,
    `- ${t.mdWorkoutCount}：${insights.coverage.workoutCount}`,
    `- ${t.mdActivitySummaryCount}：${insights.coverage.activitySummaryCount}`,
    "",
    `## ${t.mdPrimarySourcesTitle}`,
    `- ${t.mdPrimarySleep}：${insights.primarySources.sleep ?? t.insufficientData}`,
    `- ${t.mdPrimaryRecovery}：${Object.entries(insights.primarySources.recovery)
      .map(([metric, source]) => `${metric}=${source}`)
      .join(t.mdPrimarySeparator) || t.insufficientData}`,
    `- ${t.mdPrimaryBody}：${Object.entries(insights.primarySources.bodyComposition)
      .map(([metric, source]) => `${metric}=${source}`)
      .join(t.mdPrimarySeparator) || t.insufficientData}`,
    `- ${t.mdPrimaryActivity}：${insights.primarySources.activity}`,
    "",
    `## ${t.mdRiskSignalsTitle}`,
    ...insights.riskFlags.map(
      (flag) => `- [${flag.severity.toUpperCase()}] ${flag.title}：${flag.summary}（${flag.evidence.join("；")}）`,
    ),
    ...insights.notableChanges.map(
      (change) => `- [${change.direction}] ${change.title}：${change.summary}（${change.evidence.join("；")}）`,
    ),
    "",
    `## ${t.mdChartInterpretationTitle}`,
    ...insights.charts.map((chart) => {
      const callout = callouts.get(chart.id);
      const primarySeries = chart.series[0];
      const lastValue = primarySeries?.points.at(-1)?.value ?? null;
      return `- ${chart.title}：${callout?.summary ?? chart.subtitle} ${t.mdChartCurrentValue(fmt(
        lastValue,
        primarySeries?.unit ? ` ${primarySeries.unit}` : "",
      ))}`;
    }),
    "",
    `## ${t.mdHistoricalTitle}`,
    `- ${t.mdHistoricalSpan(insights.historicalContext.scope.totalSpanDays, insights.historicalContext.scope.earliestSeen ?? t.mdExportDateUnknown, insights.historicalContext.scope.latestSeen ?? t.mdExportDateUnknown)}`,
    `- ${t.mdHistoricalSleep(fmt(insights.historicalContext.sleep.recent30d.avgSleepHours, t.unitHours), fmt(insights.historicalContext.sleep.trailing180d.avgSleepHours, t.unitHours), fmt(insights.historicalContext.sleep.allTime.avgSleepHours, t.unitHours))}`,
    `- ${t.mdHistoricalRecovery(fmt(insights.historicalContext.recovery.restingHeartRate?.recent30d.average ?? null, ` ${insights.historicalContext.recovery.restingHeartRate?.unit ?? ""}`), fmt(insights.historicalContext.recovery.restingHeartRate?.allTime.average ?? null, ` ${insights.historicalContext.recovery.restingHeartRate?.unit ?? ""}`), fmt(insights.historicalContext.recovery.hrv?.recent30d.average ?? null, ` ${insights.historicalContext.recovery.hrv?.unit ?? ""}`), fmt(insights.historicalContext.recovery.hrv?.allTime.average ?? null, ` ${insights.historicalContext.recovery.hrv?.unit ?? ""}`))}`,
    `- ${t.mdHistoricalActivity(fmt(insights.historicalContext.activity.recent30d.exerciseMinutes, t.unitMinutes), fmt(insights.historicalContext.activity.trailing180d.exerciseMinutes, t.unitMinutes), fmt(insights.historicalContext.activity.allTime.exerciseMinutes, t.unitMinutes))}`,
    `- ${t.mdHistoricalBody(fmt(insights.historicalContext.bodyComposition.bodyMass?.recent30d.average ?? null, ` ${insights.historicalContext.bodyComposition.bodyMass?.unit ?? ""}`), fmt(insights.historicalContext.bodyComposition.bodyMass?.allTime.average ?? null, ` ${insights.historicalContext.bodyComposition.bodyMass?.unit ?? ""}`), fmt(insights.historicalContext.bodyComposition.bodyFatPercentage?.recent30d.average ?? null, ` ${insights.historicalContext.bodyComposition.bodyFatPercentage?.unit ?? ""}`), fmt(insights.historicalContext.bodyComposition.bodyFatPercentage?.allTime.average ?? null, ` ${insights.historicalContext.bodyComposition.bodyFatPercentage?.unit ?? ""}`))}`,
    ...insights.historicalContext.interpretationHints.map((hint) => `- ${t.mdInterpretationHintPrefix}${hint}`),
    "",
    `## ${t.mdStructuredFactsTitle}`,
    `- ${t.mdFactSleep(fmt(insights.analysis.sleep.recent30d.avgSleepHours, t.unitHours), fmt(insights.analysis.sleep.baseline90d.avgSleepHours, t.unitHours), fmt(insights.analysis.sleep.delta.sleepHours, t.unitHours))}`,
    `- ${t.mdFactRecovery(fmt(insights.analysis.recovery.metrics.restingHeartRate?.recent30d.average ?? null, ` ${insights.analysis.recovery.metrics.restingHeartRate?.unit ?? ""}`), fmt(insights.analysis.recovery.metrics.hrv?.recent30d.average ?? null, ` ${insights.analysis.recovery.metrics.hrv?.unit ?? ""}`))}`,
    `- ${t.mdFactActivity(fmt(insights.analysis.activity.recent30d.exerciseMinutes, t.unitMinutes), insights.analysis.activity.recent30d.workouts)}`,
    `- ${t.mdFactBody(fmt(insights.analysis.bodyComposition.metrics.bodyMass?.recent30d.average ?? null, ` ${insights.analysis.bodyComposition.metrics.bodyMass?.unit ?? ""}`), fmt(insights.analysis.bodyComposition.metrics.bodyFatPercentage?.recent30d.average ?? null, ` ${insights.analysis.bodyComposition.metrics.bodyFatPercentage?.unit ?? ""}`))}`,
    `- ${t.mdFactSleepInterpretation}${insights.analysis.sleep.healthInsights.interpretation}`,
    `- ${t.mdFactSleepNormalRange}${insights.analysis.sleep.healthInsights.normalRangeAssessment}`,
    `- ${t.mdFactRecoveryInterpretation}${insights.analysis.recovery.healthInsights.interpretation}`,
    `- ${t.mdFactRecoveryNormalRange}${insights.analysis.recovery.healthInsights.normalRangeAssessment}`,
    `- ${t.mdFactActivityInterpretation}${insights.analysis.activity.healthInsights.interpretation}`,
    `- ${t.mdFactActivityNormalRange}${insights.analysis.activity.healthInsights.normalRangeAssessment}`,
    ...(insights.analysis.menstrualCycle
      ? [
          `- ${t.mdFactMenstrualCycle(fmt(insights.analysis.menstrualCycle.avgCycleLengthDays, t.unitDays), fmt(insights.analysis.menstrualCycle.avgPeriodDurationDays, t.unitDays), insights.analysis.menstrualCycle.totalPeriods)}`,
          `- ${t.mdFactMenstrualInterpretation}${insights.analysis.menstrualCycle.healthInsights.interpretation}`,
          `- ${t.mdFactMenstrualNormalRange}${insights.analysis.menstrualCycle.healthInsights.normalRangeAssessment}`,
        ]
      : []),
    "",
    `## ${t.mdDisclaimerTitle}`,
    narrative.disclaimer,
    "",
  ];

  return `${lines.join("\n")}\n`;
}
