import type { ActivityAnalysis, ActivitySummarySample, TimeWindow, WorkoutSample } from "../types.js";

function round(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) {
    return null;
  }
  return Math.round(value * 100) / 100;
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function summarizeActivityWindow(activitySummaries: ActivitySummarySample[], workouts: WorkoutSample[]) {
  const workoutCounts = new Map<string, number>();
  for (const workout of workouts) {
    workoutCounts.set(workout.workoutActivityType, (workoutCounts.get(workout.workoutActivityType) ?? 0) + 1);
  }

  return {
    dayCount: activitySummaries.length,
    activeEnergyBurnedKcal: round(
      average(activitySummaries.map((sample) => sample.activeEnergyBurned).filter((value): value is number => value !== null)),
    ),
    exerciseMinutes: round(
      average(activitySummaries.map((sample) => sample.appleExerciseTime).filter((value): value is number => value !== null)),
    ),
    standHours: round(
      average(activitySummaries.map((sample) => sample.appleStandHours).filter((value): value is number => value !== null)),
    ),
    workouts: workouts.length,
    topWorkoutTypes: [...workoutCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count })),
  };
}

function subtract(left: number | null, right: number | null): number | null {
  if (left === null || right === null) {
    return null;
  }
  return round(left - right);
}

export function analyzeActivity(
  activitySummaries: ActivitySummarySample[],
  workouts: WorkoutSample[],
  window: TimeWindow,
): ActivityAnalysis {
  const withinRequestedWindow = <T extends { date?: Date; startDate?: Date }>(value: T) => {
    const date = value.date ?? value.startDate;
    if (!date) {
      return false;
    }
    if (window.effectiveStart && date < window.effectiveStart) {
      return false;
    }
    return date <= window.effectiveEnd;
  };

  const filteredSummaries = activitySummaries.filter(withinRequestedWindow);
  const filteredWorkouts = workouts.filter(withinRequestedWindow);

  const recentSummaries = filteredSummaries.filter(
    (summary) => summary.date >= window.recentStart && summary.date <= window.effectiveEnd,
  );
  const baselineSummaries = filteredSummaries.filter(
    (summary) => summary.date >= window.baselineStart && summary.date < window.recentStart,
  );

  const recentWorkouts = filteredWorkouts.filter(
    (workout) => workout.startDate >= window.recentStart && workout.startDate <= window.effectiveEnd,
  );
  const baselineWorkouts = filteredWorkouts.filter(
    (workout) => workout.startDate >= window.baselineStart && workout.startDate < window.recentStart,
  );

  const recent30d = summarizeActivityWindow(recentSummaries, recentWorkouts);
  const baseline90d = summarizeActivityWindow(baselineSummaries, baselineWorkouts);

  return {
    status: filteredSummaries.length > 0 || filteredWorkouts.length > 0 ? "ok" : "insufficient_data",
    source: "活动摘要 + 训练记录",
    coverageDays: filteredSummaries.length,
    recent30d,
    baseline90d,
    delta: {
      activeEnergyBurnedKcal: subtract(recent30d.activeEnergyBurnedKcal, baseline90d.activeEnergyBurnedKcal),
      exerciseMinutes: subtract(recent30d.exerciseMinutes, baseline90d.exerciseMinutes),
      standHours: subtract(recent30d.standHours, baseline90d.standHours),
      workouts:
        recent30d.workouts || baseline90d.workouts
          ? recent30d.workouts - baseline90d.workouts
          : null,
    },
    notes:
      filteredSummaries.length > 0 || filteredWorkouts.length > 0
        ? ["日常活动趋势来自活动摘要，训练类型单独统计。"]
        : ["所选时间窗口内没有可用的活动摘要或训练记录。"],
  };
}
