import type { TrainingRenderT } from "../i18n/zh/trainingRender.js";
import type {
  InsightBundle,
  TrainingLoadStatus,
  TrainingNarrativeReport,
  TrainingReadiness,
  TrainingSportInsight,
  TrainingState,
  WorkoutTypeWindowSummary,
} from "../types.js";

type SportWindowId = "recent30d" | "baseline90d" | "trailing180d" | "trailing365d" | "allTime";

const DISTANCE_WORKOUT_TYPES = new Set([
  "HKWorkoutActivityTypeRunning",
  "HKWorkoutActivityTypeWalking",
  "HKWorkoutActivityTypeCycling",
  "HKWorkoutActivityTypeHiking",
]);

function fmt(value: number | null, suffix: string, insufficient: string): string {
  return value === null ? insufficient : `${value}${suffix}`;
}

function section(title: string, values: string[]): string {
  return `## ${title}\n${values.map((value) => `- ${value}`).join("\n")}`;
}

function subsection(title: string, values: string[]): string[] {
  return [`#### ${title}`, ...values.map((value) => `- ${value}`)];
}

function stateLabel(state: TrainingState, t: TrainingRenderT): string {
  switch (state) {
    case "building":
      return t.stateBuilding;
    case "maintaining":
      return t.stateMaintaining;
    case "recovering":
      return t.stateRecovering;
    case "strained":
      return t.stateStrained;
    case "detraining":
      return t.stateDetraining;
    case "mixed":
      return t.stateMixed;
    default:
      return t.stateInsufficient;
  }
}

function readinessLabel(readiness: TrainingReadiness, t: TrainingRenderT): string {
  switch (readiness) {
    case "good":
      return t.readinessGood;
    case "moderate":
      return t.readinessModerate;
    case "low":
      return t.readinessLow;
    default:
      return t.readinessInsufficient;
  }
}

function trendLabel(
  value: InsightBundle["training"]["sports"][number]["consistency"]["frequencyTrend"],
  t: TrainingRenderT,
): string {
  if (value === "denser") return t.frequencyTrendDenser;
  if (value === "sparser") return t.frequencyTrendSparser;
  if (value === "stable") return t.frequencyTrendStable;
  return t.frequencyTrendUnknown;
}

function tagLabel(
  value: InsightBundle["training"]["sports"][number]["statusTags"][number],
  t: TrainingRenderT,
): string {
  if (value === "load rising") return t.tagLoadRising;
  if (value === "load stable") return t.tagLoadStable;
  if (value === "load falling") return t.tagLoadFalling;
  if (value === "recovery supported") return t.tagRecoverySupported;
  if (value === "recovery unsupported") return t.tagRecoveryUnsupported;
  if (value === "consistency good") return t.tagConsistencyGood;
  return t.tagConsistencyUneven;
}

function windowLabel(id: SportWindowId, t: TrainingRenderT): string {
  switch (id) {
    case "recent30d":
      return t.recent30dLabel;
    case "baseline90d":
      return t.baseline90dLabel;
    case "trailing180d":
      return t.trailing180dLabel;
    case "trailing365d":
      return t.trailing365dLabel;
    default:
      return t.allTimeLabel;
  }
}

function getSportWindow(
  sport: TrainingSportInsight,
  id: SportWindowId,
): WorkoutTypeWindowSummary {
  if (id === "recent30d") return sport.recent30d;
  if (id === "baseline90d") return sport.baseline90d;
  if (id === "trailing180d") return sport.trailing180d;
  if (id === "trailing365d") return sport.trailing365d;
  return sport.allTime;
}

function focusWindowId(sport: TrainingSportInsight): SportWindowId {
  if (sport.recent30d.workouts >= 2 || (sport.recent30d.totalDurationMinutes ?? 0) >= 120) {
    return "recent30d";
  }
  if (sport.trailing180d.workouts >= 3 || (sport.trailing180d.totalDurationMinutes ?? 0) >= 180) {
    return "trailing180d";
  }
  if (sport.trailing365d.workouts >= 4 || sport.consistency.activeMonthsLast12 >= 2) {
    return "trailing365d";
  }
  return "allTime";
}

function metricWindowOrder(focusWindow: SportWindowId): SportWindowId[] {
  const order: SportWindowId[] = [];
  for (const windowId of [focusWindow, "recent30d", "trailing180d", "trailing365d", "allTime"] as SportWindowId[]) {
    if (!order.includes(windowId)) {
      order.push(windowId);
    }
  }
  return order;
}

function pickMetricWindow(
  sport: TrainingSportInsight,
  focusWindow: SportWindowId,
  predicate: (summary: WorkoutTypeWindowSummary) => boolean,
): { windowId: SportWindowId; summary: WorkoutTypeWindowSummary } | null {
  for (const windowId of metricWindowOrder(focusWindow)) {
    const summary = getSportWindow(sport, windowId);
    if (predicate(summary)) {
      return { windowId, summary };
    }
  }
  return null;
}

function sportSupportsDistance(sport: TrainingSportInsight): boolean {
  return DISTANCE_WORKOUT_TYPES.has(sport.type);
}

function metricLine(label: string, value: number | null, suffix: string, windowId: SportWindowId, t: TrainingRenderT): string {
  return `- ${label}：${fmt(value, suffix, t.insufficientData)}（${windowLabel(windowId, t)}）`;
}

function fmtSignedPct(value: number | null, insufficient: string): string {
  if (value === null) {
    return insufficient;
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

function tsbLabel(tsb: number, t: TrainingRenderT): string {
  if (tsb <= -30) return t.tsbStrained;
  if (tsb <= -10) return t.tsbBuilding;
  if (tsb <= 5) return t.tsbNeutral;
  if (tsb <= 25) return t.tsbFresh;
  return t.tsbVeryFresh;
}

function renderTrainingLoadMarkdownLines(load: TrainingLoadStatus | null, t: TrainingRenderT): string[] {
  if (!load) {
    return [`- ${t.cardCtl}：${t.insufficientData}`];
  }
  const tsbSign = load.tsb > 0 ? "+" : "";
  const lines = [
    `- ${t.cardCtl}：${load.ctl} ${t.cardCtlUnit}`,
    `- ${t.ctlDelta30dLabel}：${fmtSignedPct(load.ctlDelta30dPct, t.insufficientData)}`,
    `- ${t.ctlDelta90dLabel}：${fmtSignedPct(load.ctlDelta90dPct, t.insufficientData)}`,
    `- ${t.cardTsb}：${tsbSign}${load.tsb} · ${tsbLabel(load.tsb, t)}`,
    `- ${t.cardAtl}：${load.atl} ${t.cardCtlUnit}`,
  ];
  if (load.warmupDays < 42) {
    lines.push(`- ${t.ctlWarmupNote(load.warmupDays)}`);
  }
  return lines;
}

function sportLoadWindowIds(sport: TrainingSportInsight): SportWindowId[] {
  const order: SportWindowId[] = [];
  for (const windowId of [
    focusWindowId(sport),
    "recent30d",
    "baseline90d",
    "trailing180d",
    "trailing365d",
    "allTime",
  ] as SportWindowId[]) {
    if (order.includes(windowId)) {
      continue;
    }
    const summary = getSportWindow(sport, windowId);
    if (windowId !== "allTime" && summary.workouts === 0 && summary.totalDurationMinutes === null) {
      continue;
    }
    order.push(windowId);
  }
  return order;
}

export function renderTrainingReportMarkdown(
  insights: InsightBundle,
  narrative: TrainingNarrativeReport,
  t: TrainingRenderT,
): string {
  const callouts = new Map(narrative.chart_callouts.map((item) => [item.chart_id, item]));
  const lines = [
    `# ${t.reportTitle}`,
    "",
    `## ${t.assessmentTitle}`,
    narrative.training_assessment,
    "",
    `- ${t.cardTrainingState}：${stateLabel(insights.training.summary.trainingState, t)}`,
    `- ${t.cardReadiness}：${readinessLabel(insights.training.summary.readiness, t)}`,
    `- ${t.cardRecentLoad}：${t.cardRecentLoadSub(
      insights.training.summary.recent30dWorkouts,
      fmt(insights.training.summary.recent30dDurationMinutes, t.unitMinutes, t.insufficientData),
    )}`,
    `- ${t.cardPrimarySport}：${insights.training.summary.primarySportLabel ?? t.insufficientData}`,
    "",
    section(t.overallFindingsTitle, narrative.overall_findings),
    "",
    `## ${t.loadRecoveryTitle}`,
    ...renderTrainingLoadMarkdownLines(insights.training.summary.trainingLoad, t),
    `- ${t.workoutsLabel} ${t.vsBaseline}：${fmt(insights.training.summary.loadTrend.recentVsBaseline90d.workoutsPer30d, "", t.insufficientData)}`,
    `- ${t.durationLabel} ${t.vsBaseline}：${fmt(insights.training.summary.loadTrend.recentVsBaseline90d.durationMinutesPer30d, t.unitMinutes, t.insufficientData)}`,
    `- ${t.activeEnergyLabel} ${t.vsBaseline}：${fmt(insights.training.summary.loadTrend.recentVsBaseline90d.activeEnergyBurnedKcalPer30d, t.unitKcal, t.insufficientData)}`,
    `- ${t.varietyLabel}：${insights.training.summary.loadTrend.recentWorkoutVariety}（${t.vsBaseline} ${insights.training.summary.loadTrend.recentVsBaselineVariety > 0 ? "+" : ""}${insights.training.summary.loadTrend.recentVsBaselineVariety}）`,
    `- ${t.recoverySupportTitle}：${insights.training.summary.recoverySupport.adequate === true ? t.supportAdequate : insights.training.summary.recoverySupport.adequate === false ? t.supportInadequate : t.supportUnknown}`,
    `- ${t.sleepVsBaselineLabel}：${fmt(insights.training.summary.recoverySupport.sleepDeltaHours, t.unitHours, t.insufficientData)}`,
    `- ${t.hrvVsBaselineLabel}：${fmt(insights.training.summary.recoverySupport.hrvDeltaPct, "%", t.insufficientData)}`,
    `- ${t.restingHeartRateVsBaselineLabel}：${fmt(insights.training.summary.recoverySupport.restingHeartRateDeltaBpm, t.unitBpm, t.insufficientData)}`,
    "",
    `## ${t.sportsTitle}`,
  ];

  if (insights.training.sports.length === 0) {
    lines.push(`- ${t.noSportData}`);
  } else {
    for (const sport of insights.training.sports) {
      const sectionNarrative = narrative.sport_sections.find((entry) => entry.sport_id === sport.id);
      const focusWindow = focusWindowId(sport);
      const focusSummary = getSportWindow(sport, focusWindow);
      const loadWindows = sportLoadWindowIds(sport);
      const heartRateMetric = pickMetricWindow(
        sport,
        focusWindow,
        (summary) =>
          summary.averageHeartRateBpm !== null &&
          (summary.heartRateCoveragePct ?? 0) >= 60 &&
          summary.workouts >= 3,
      );
      const distanceMetric = sportSupportsDistance(sport)
        ? pickMetricWindow(
            sport,
            focusWindow,
            (summary) =>
              summary.totalDistanceKm !== null &&
              (summary.distanceCoveragePct ?? 0) >= 60 &&
              summary.workouts >= 1,
          )
        : null;
      const metsMetric = pickMetricWindow(
        sport,
        focusWindow,
        (summary) =>
          summary.averageMETs !== null &&
          (summary.metsCoveragePct ?? 0) >= 60 &&
          summary.workouts >= 1,
      );

      lines.push(`### ${sport.label}`);
      lines.push(`- ${t.focusWindowLabel}：${windowLabel(focusWindow, t)}`);
      for (const windowId of loadWindows) {
        const summary = getSportWindow(sport, windowId);
        lines.push(`- ${windowLabel(windowId, t)}：${summary.workouts} / ${fmt(summary.totalDurationMinutes, t.unitMinutes, t.insufficientData)}`);
      }
      lines.push(`- ${t.activeEnergyLabel}：${fmt(focusSummary.totalActiveEnergyBurnedKcal, t.unitKcal, t.insufficientData)}（${windowLabel(focusWindow, t)}）`);
      if (heartRateMetric) {
        lines.push(metricLine(t.avgHeartRateLabel, heartRateMetric.summary.averageHeartRateBpm, t.unitBpm, heartRateMetric.windowId, t));
      }
      if (distanceMetric) {
        lines.push(metricLine(t.distanceLabel, distanceMetric.summary.totalDistanceKm, t.unitKm, distanceMetric.windowId, t));
      }
      if (metsMetric) {
        lines.push(metricLine(t.avgMetsLabel, metsMetric.summary.averageMETs, "", metsMetric.windowId, t));
      }
      if (sport.recoveryAfterWorkout.sampleCount > 0) {
        lines.push(`- ${t.recoverySampleCountLabel}：${fmt(sport.recoveryAfterWorkout.sampleCount, "", t.insufficientData)}`);
        lines.push(`- ${t.nextDaySleepDeltaLabel}：${fmt(sport.recoveryAfterWorkout.nextDaySleepHoursDelta, t.unitHours, t.insufficientData)}`);
        lines.push(`- ${t.nextDayHrvDeltaLabel}：${fmt(sport.recoveryAfterWorkout.nextDayHrvDelta, "", t.insufficientData)}`);
        lines.push(`- ${t.nextDayRestingHrDeltaLabel}：${fmt(sport.recoveryAfterWorkout.nextDayRestingHeartRateDelta, t.unitBpm, t.insufficientData)}`);
      }
      lines.push(`- ${t.longestGapLabel}：${fmt(sport.consistency.longestGapDays, t.unitDays, t.insufficientData)}`);
      lines.push(`- ${t.activeMonthsLast12Label}：${fmt(sport.consistency.activeMonthsLast12, "", t.insufficientData)}`);
      lines.push(`- ${t.statusTagsLabel}：${sport.statusTags.map((tag) => tagLabel(tag, t)).join(" | ")}`);
      lines.push(`- ${t.consistencyTrendLabel}：${trendLabel(sport.consistency.frequencyTrend, t)}`);
      if (sectionNarrative) {
        lines.push(sectionNarrative.assessment);
        lines.push(...subsection(sectionNarrative.title, sectionNarrative.key_signals));
        lines.push(...subsection(t.sportRecommendationsTitle, sectionNarrative.recommendations));
      }
      lines.push("");
    }
  }

  lines.push(section(t.watchoutsTitle, narrative.watchouts));
  lines.push("");
  lines.push(section(t.actionsTitle, narrative.actions_next_2_weeks));
  lines.push("");
  lines.push(section(t.doctorQuestionsTitle, narrative.questions_for_doctor));
  lines.push("");
  lines.push(`## ${t.chartSectionTitle}`);
  lines.push(
    ...insights.training.charts.map((chart) => `- ${chart.title}：${callouts.get(chart.id)?.summary ?? t.chartCalloutFallback}`),
  );
  lines.push("");
  lines.push(section(t.appendixTitle, narrative.data_limitations));
  lines.push("");
  lines.push(`## ${t.disclaimerTitle}`);
  lines.push(narrative.disclaimer);
  lines.push("");

  return `${lines.join("\n")}\n`;
}
