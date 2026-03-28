import type { Translations } from "../index.js";
import { activityZh } from "./activity.js";
import { bodyCompositionZh } from "./bodyComposition.js";
import { commonZh } from "./common.js";
import { crossMetricZh } from "./crossMetric.js";
import { insightsZh } from "./insights.js";
import { menstrualCycleZh } from "./menstrualCycle.js";
import { recoveryZh } from "./recovery.js";
import { renderZh } from "./render.js";
import { sleepZh } from "./sleep.js";

export const zhTranslations: Translations = {
  common: commonZh,
  sleep: sleepZh,
  recovery: recoveryZh,
  activity: activityZh,
  bodyComposition: bodyCompositionZh,
  crossMetric: crossMetricZh,
  menstrualCycle: menstrualCycleZh,
  insights: insightsZh,
  render: renderZh,
};
