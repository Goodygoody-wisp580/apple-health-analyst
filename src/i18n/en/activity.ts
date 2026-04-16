import type { ActivityT } from "../zh/activity.js";

export const activityEn: ActivityT = {
  workoutLabelLocale: "en",
  // ── Separators ──
  partSep: "; ",
  partEnd: ".",
  sentSep: ". ",

  source: "Activity Summaries + Workout Records",
  activeNote: "Daily activity trends come from activity summaries; workout types are counted separately.",
  noDataNote: "No activity summaries or workout records available in the selected time window.",

  whoNoData: "Insufficient exercise data to compare against WHO guidelines.",
  whoExceeds: (weeklyMinutes) =>
    `Weekly exercise ~${weeklyMinutes} minutes, exceeding the WHO upper recommendation of 300 minutes, yielding additional health benefits. However, high exercise volume also requires adequate recovery.`,
  whoMeets: (weeklyMinutes) =>
    `Weekly exercise ~${weeklyMinutes} minutes, meeting the WHO moderate-intensity aerobic standard (150-300 min/week). This level effectively reduces risk of cardiovascular disease, type 2 diabetes, and certain cancers.`,
  whoPartial: (weeklyMinutes, gap) =>
    `Weekly exercise ~${weeklyMinutes} minutes, below the WHO minimum of 150 min/week, but already accumulating health benefits. Adding ${gap} more minutes per week would reach the target.`,
  whoFarBelow: (weeklyMinutes) =>
    `Weekly exercise ~${weeklyMinutes} minutes, significantly below the WHO minimum of 150 min/week. Any exercise is better than none — starting with 10 extra minutes of brisk walking per day is a practical first step.`,

  varietyNone: "No workout types recorded recently.",
  varietySingle: (type) =>
    `Workout variety is limited (only ${type}). Consider mixing exercise types — e.g., cardio + strength + flexibility — for more comprehensive health benefits.`,
  varietyBalanced: (types) =>
    `Workout variety is balanced (${types}), covering a reasonable range that supports overall fitness and reduces injury risk.`,
  varietyRich: (types, count) =>
    `Workout variety is excellent (${types} and ${count} types total). A diverse exercise mix better develops cardiorespiratory endurance, muscular strength, and joint flexibility.`,

  exerciseMeetsWho: (dailyMin, weeklyMin) =>
    `Daily exercise ${dailyMin} min (weekly ${weeklyMin} min), meeting WHO recommendation`,
  exerciseBelowWho: (dailyMin, weeklyMin) =>
    `Daily exercise ${dailyMin} min (weekly ${weeklyMin} min), below WHO 150 min/week standard`,

  standMeetsGoal: (hours) =>
    `Daily standing ${hours} hours, meeting the Apple default goal (12 hours)`,
  standReasonable: (hours) =>
    `Daily standing ${hours} hours, below the 12-hour target but at a reasonable level`,
  standLow: (hours) =>
    `Daily standing only ${hours} hours, sedentary time is high — consider getting up for 1-2 minutes every hour`,

  activeEnergyBurned: (kcal) =>
    `Daily active energy ${kcal} kcal`,

  normalRangeInsufficientData: "Insufficient activity data for assessment.",

  interpretationInsufficientData: "Insufficient records for a comprehensive interpretation.",

  whoComplianceMet: "Your exercise volume meets the WHO recommendation, providing significant protective benefits for cardiovascular health, metabolic regulation, and mental well-being",
  whoCompliancePartial: "While your current exercise volume hasn't reached the WHO recommendation, maintaining an active habit is an excellent starting point",

  trendImproving: (delta) =>
    `Recent daily exercise increased by ~${delta} minutes compared to baseline, indicating improving exercise habits`,
  trendDeclining: (delta) =>
    `Recent daily exercise decreased by ~${delta} minutes compared to baseline. If unintentional, consider whether time or motivation barriers have emerged`,
  trendStable: "Exercise volume remains stable — consistency is key to long-term benefits",

  sedentaryWarning: "Prolonged sedentary time, independent of exercise volume, is itself a risk factor for cardiovascular and metabolic health",

  adviceWhoGap: (gap, dailyGap) =>
    `You're ~${gap} minutes/week short of the WHO recommendation. Try adding ${dailyGap} minutes daily — e.g., post-meal walks or taking stairs instead of elevators.`,
  adviceStandMore: "Set an hourly standing reminder and move for 1-2 minutes — breaking up sedentary time has a greater sustained metabolic impact than concentrated exercise.",
  adviceDeclining: "Exercise volume is trending down. Consider finding a workout partner or setting a specific exercise schedule — external accountability is more reliable than willpower.",
  adviceCrossTrain: "Try adding one different workout type per week (e.g., add strength training if you mainly do cardio). Cross-training reduces injury risk and improves overall fitness.",
  adviceRecovery: "Exercise volume is sufficient. Ensure adequate recovery days (at least 1-2 light or rest days per week) to prevent overtraining-related immune suppression or injury.",
  adviceGood: "Your exercise habits are solid — keep up the regular workouts and diverse training types.",
  adviceTrack: "Tracking each workout helps monitor progress and adjust plans. Keep using Apple Watch to automatically log exercise data.",

  doctorLowActivity: (weeklyMin) =>
    `"I currently exercise about ${weeklyMin} minutes per week. Can you suggest a safe beginner exercise program for me?"`,
  doctorHighActivity: (weeklyMin) =>
    `"I exercise about ${weeklyMin} minutes per week, which is quite high. What should I watch out for? Should I get periodic exercise ECGs?"`,
  doctorSedentary: (hours) =>
    `"My job requires prolonged sitting (daily standing only ${hours} hours). What health risks does this increase?"`,
  doctorOptimize: (weeklyMin) =>
    `"Given my age and current exercise volume (~${weeklyMin} min/week), do you have suggestions for a more optimal exercise mix?"`,
};
