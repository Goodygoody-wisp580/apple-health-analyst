import type { ActivityT } from "./zh/activity.js";
import type { BodyCompositionT } from "./zh/bodyComposition.js";
import type { CommonT } from "./zh/common.js";
import type { CrossMetricT } from "./zh/crossMetric.js";
import type { InsightsT } from "./zh/insights.js";
import type { MenstrualCycleT } from "./zh/menstrualCycle.js";
import type { RecoveryT } from "./zh/recovery.js";
import type { RenderT } from "./zh/render.js";
import type { SleepT } from "./zh/sleep.js";
import type { TrainingInsightsT } from "./zh/trainingInsights.js";
import type { TrainingRenderT } from "./zh/trainingRender.js";

export type Locale = "zh" | "en";

export interface Translations {
  common: CommonT;
  sleep: SleepT;
  recovery: RecoveryT;
  activity: ActivityT;
  bodyComposition: BodyCompositionT;
  crossMetric: CrossMetricT;
  menstrualCycle: MenstrualCycleT;
  insights: InsightsT;
  render: RenderT;
  trainingInsights: TrainingInsightsT;
  trainingRender: TrainingRenderT;
}

let zhCache: Translations | null = null;
let enCache: Translations | null = null;

export async function getTranslations(locale: Locale): Promise<Translations> {
  if (locale === "zh") {
    if (!zhCache) {
      const { zhTranslations } = await import("./zh/index.js");
      zhCache = zhTranslations;
    }
    return zhCache;
  }
  if (!enCache) {
    const { enTranslations } = await import("./en/index.js");
    enCache = enTranslations;
  }
  return enCache;
}
