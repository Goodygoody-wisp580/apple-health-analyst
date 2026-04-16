import type { Translations } from "../index.js";
import { activityEn } from "./activity.js";
import { bodyCompositionEn } from "./bodyComposition.js";
import { commonEn } from "./common.js";
import { crossMetricEn } from "./crossMetric.js";
import { insightsEn } from "./insights.js";
import { menstrualCycleEn } from "./menstrualCycle.js";
import { recoveryEn } from "./recovery.js";
import { renderEn } from "./render.js";
import { sleepEn } from "./sleep.js";
import { trainingInsightsEn } from "./trainingInsights.js";
import { trainingRenderEn } from "./trainingRender.js";

export const enTranslations: Translations = {
  common: commonEn,
  sleep: sleepEn,
  recovery: recoveryEn,
  activity: activityEn,
  bodyComposition: bodyCompositionEn,
  crossMetric: crossMetricEn,
  menstrualCycle: menstrualCycleEn,
  insights: insightsEn,
  render: renderEn,
  trainingInsights: trainingInsightsEn,
  trainingRender: trainingRenderEn,
};
