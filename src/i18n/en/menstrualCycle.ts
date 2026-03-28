import type { MenstrualCycleT } from "../zh/menstrualCycle.js";

export const menstrualCycleEn: MenstrualCycleT = {
  // ── Separators ──
  partSep: "; ",
  partEnd: ".",
  sentSep: ". ",

  // ── Notes ────────────────────────────────────────────────────────

  noteFewPeriods: "Limited menstrual cycle records; regularity assessment has reduced confidence.",

  noteContraceptiveUse: (contraceptiveUse: string) =>
    `Contraceptive use detected (${contraceptiveUse}), which may affect cycle regularity.`,

  noteIntermenstrualBleeding: (count: number) =>
    `${count} intermenstrual bleeding event(s) detected.`,

  // ── Warnings ─────────────────────────────────────────────────────

  warningIrregular: (cycleLengthStd: number) =>
    `Menstrual cycle is irregular, with a cycle length standard deviation of ${cycleLengthStd} days.`,

  warningCycleLengthOutOfRange: (avgCycleLength: number) =>
    `Average cycle length is ${avgCycleLength} days, outside the normal range (21\u201338 days).`,

  // ── Flow Pattern Description ─────────────────────────────────────

  flowPatternHeavy: (heavyPct: number) =>
    `Menstrual bleeding is predominantly moderate-to-heavy (heavy flow accounts for ${heavyPct}%); an elevated proportion of heavy bleeding may be associated with endometrial thickening, hormonal fluctuations, or uterine fibroids`,

  flowPatternLight: (lightPct: number) =>
    `Menstrual bleeding is predominantly light (light flow accounts for ${lightPct}%), which typically suggests a thin endometrium or relatively low hormone levels`,

  flowPatternBalanced: (lightPct: number, mediumPct: number, heavyPct: number) =>
    `Menstrual bleeding distribution is relatively even (light ${lightPct}%, medium ${mediumPct}%, heavy ${heavyPct}%), overall within normal range`,

  flowDurationLengthening:
    "Recent period duration shows a lengthening trend; if accompanied by increased bleeding, watch for signs of anemia (fatigue, dizziness)",

  flowDurationShortening:
    "Recent period duration shows a shortening trend; if accompanied by decreased bleeding, it may be related to stress, weight changes, or hormonal regulation",

  // ── Normal Range Assessment ──────────────────────────────────────

  normalRangeInsufficient: "Insufficient data for assessment.",

  cycleLengthIdeal: (avgCycle: number) =>
    `Average cycle length is ${avgCycle} days, within the ideal range (24\u201335 days)`,

  cycleLengthNormalButEdge: (avgCycle: number, direction: string) =>
    `Average cycle length is ${avgCycle} days, within the clinical normal range (21\u201338 days), but on the ${direction} side — worth continued monitoring`,

  cycleLengthDirectionShort: "short",
  cycleLengthDirectionLong: "long",

  cycleLengthOutOfRange: (avgCycle: number) =>
    `Average cycle length is ${avgCycle} days, outside the clinical normal range (21\u201338 days); consulting a gynecologist is recommended to investigate the cause`,

  periodDurationNormal: (avgDuration: number) =>
    `Average period duration is ${avgDuration} days, within normal range`,

  periodDurationShort: (avgDuration: number) =>
    `Average period duration is only ${avgDuration} days, which is short and may warrant attention to ovulatory function or endometrial health`,

  periodDurationLong: (avgDuration: number) =>
    `Average period duration is ${avgDuration} days, which is long (normal is 3\u20137 days); prolonged periods may increase the risk of anemia`,

  regularityGood:
    "Cycle regularity is good, which typically reflects well-coordinated hypothalamic-pituitary-ovarian (HPO) axis function",

  regularitySomewhatIrregular:
    "Cycle shows some variability but remains within an acceptable range; stress, sleep changes, and cross-timezone travel can all cause short-term fluctuations",

  regularityIrregular:
    "Cycle variability is significant, potentially associated with polycystic ovary syndrome (PCOS), thyroid dysfunction, excessive exercise, or drastic weight changes",

  // ── Interpretation ───────────────────────────────────────────────

  interpretationInsufficient:
    "Insufficient records for a comprehensive interpretation. Continue tracking for at least 3 complete cycles.",

  interpretationHealthyOverall:
    "Your menstrual cycle is overall healthy: regular and of normal length \u2014 a positive sign of well-functioning endocrine system",

  interpretationRegularButEdge:
    "Your cycle is regular, but the length falls outside the ideal range; consider having your hormone levels evaluated at your next check-up",

  interpretationSomeVariation:
    "Your cycle shows some variability, which does not necessarily indicate an abnormality, but is worth evaluating in the context of your lifestyle",

  interpretationCycleLengthening: (delta: number) =>
    `Recent cycles have lengthened by approximately ${Math.abs(delta)} days compared to your historical average. Progressively longer cycles may be related to increased stress, weight changes, disrupted sleep patterns, or approaching perimenopause`,

  interpretationCycleShortening: (delta: number) =>
    `Recent cycles have shortened by approximately ${Math.abs(delta)} days compared to your historical average. Cycle shortening is sometimes associated with a shortened luteal phase, which is particularly worth monitoring if you are trying to conceive`,

  interpretationCycleStable:
    "Recent cycles are consistent with your historical average, with no significant trend changes",

  interpretationFrequentIntermenstrual:
    "Intermenstrual bleeding occurs frequently. Occasional ovulatory bleeding is normal, but if it occurs every cycle, investigation for cervical polyps, endometrial abnormalities, or hormonal imbalance is recommended",

  interpretationMinorIntermenstrual:
    "Some intermenstrual bleeding has been recorded; if it consists of light spotting around ovulation, this is a normal physiological occurrence",

  interpretationContraceptive:
    "Oral contraceptive use is recorded in your data. Hormonal contraceptives directly regulate the cycle, so cycle data during use reflects a medication-regulated pattern rather than your natural cycle",

  // ── Actionable Advice ────────────────────────────────────────────

  adviceRegularSleep:
    "Maintain a consistent sleep schedule \u2014 circadian rhythm disruption is a significant factor affecting menstrual cycles. Fixing your wake time is more important than fixing your bedtime.",

  adviceCycleLengthening:
    "Your cycles have been getting longer recently. Focus on stress management and balanced nutrition, and monitor for 2\u20133 cycles to see if it resolves on its own.",

  adviceCycleShortening:
    "Your cycles have been getting shorter recently. Watch whether menstrual flow decreases in parallel; if shortening persists, a luteal function evaluation is recommended.",

  advicePeriodLengthening:
    "Period duration is trending longer. Watch for signs of anemia such as fatigue or pallor, and consider a complete blood count if needed.",

  adviceFrequentIntermenstrual:
    "Intermenstrual bleeding is occurring frequently. Schedule a gynecological exam to evaluate cervical and endometrial health.",

  adviceAbnormalCycleLength:
    "Cycle length is outside the normal range. A hormone panel (FSH, LH, E2, P, T, PRL) is recommended to clarify your endocrine status.",

  adviceAllGood:
    "Your cycle is in good shape. Continue maintaining a regular lifestyle and moderate exercise.",

  adviceKeepTracking:
    "Keep recording the start/end dates and flow of each period \u2014 consistent data helps detect potential changes earlier.",

  // ── Doctor Talking Points ────────────────────────────────────────

  doctorAbnormalCycleLength: (avgCycle: number) =>
    `"My menstrual cycle averages ${avgCycle} days, which is outside the normal range \u2014 should I have my hormones tested?"`,

  doctorIrregular: (std: number) =>
    `"My cycle varies quite a bit (standard deviation of ${std} days) \u2014 what factors could be causing this? Should I be screened for PCOS?"`,

  doctorCycleLengthening: (delta: number) =>
    `"I've noticed my cycles have been getting longer recently (by about ${Math.abs(delta)} days) \u2014 is this something I should be concerned about?"`,

  doctorCycleShortening: (delta: number) =>
    `"My cycles have been getting shorter recently (by about ${Math.abs(delta)} days) \u2014 should I have my luteal function checked?"`,

  doctorFrequentIntermenstrual:
    `"I often have spotting between periods \u2014 what tests should I have done?"`,

  doctorLongPeriod: (avgDuration: number) =>
    `"My period lasts an average of ${avgDuration} days, which seems long \u2014 should I have my endometrium checked or be screened for fibroids?"`,

  doctorPeriodLengthening:
    `"I feel like my recent periods have been longer than usual, and the flow may be increasing \u2014 should I have a complete blood count done?"`,

  doctorAllNormal:
    `"My menstrual cycle data looks normal overall \u2014 are there any preventive screenings you'd recommend?"`,
};
