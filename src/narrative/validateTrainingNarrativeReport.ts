import {
  TRAINING_NARRATIVE_REPORT_SCHEMA_VERSION,
  type NarrativeChartCallout,
  type TrainingNarrativeReport,
  type TrainingSportNarrativeSection,
} from "../types.js";

function ensureString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`training.report.llm.json field ${field} must be a non-empty string.`);
  }
  return value.trim();
}

function ensureStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`training.report.llm.json field ${field} must be a string array.`);
  }
  return value.map((entry, index) => ensureString(entry, `${field}[${index}]`));
}

function ensureChartCallouts(
  value: unknown,
  availableChartIds: string[],
): NarrativeChartCallout[] {
  if (!Array.isArray(value)) {
    throw new Error("training.report.llm.json field chart_callouts must be an array.");
  }

  return value.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`training.report.llm.json field chart_callouts[${index}] must be an object.`);
    }

    const candidate = entry as Record<string, unknown>;
    const chartId = ensureString(candidate.chart_id, `chart_callouts[${index}].chart_id`);
    if (!availableChartIds.includes(chartId)) {
      throw new Error(`training.report.llm.json references unknown chart ${chartId}.`);
    }

    return {
      chart_id: chartId,
      title: ensureString(candidate.title, `chart_callouts[${index}].title`),
      summary: ensureString(candidate.summary, `chart_callouts[${index}].summary`),
    };
  });
}

function ensureSportSections(
  value: unknown,
  availableSportIds: string[],
): TrainingSportNarrativeSection[] {
  if (!Array.isArray(value)) {
    throw new Error("training.report.llm.json field sport_sections must be an array.");
  }

  return value.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`training.report.llm.json field sport_sections[${index}] must be an object.`);
    }

    const candidate = entry as Record<string, unknown>;
    const sportId = ensureString(candidate.sport_id, `sport_sections[${index}].sport_id`);
    if (!availableSportIds.includes(sportId)) {
      throw new Error(`training.report.llm.json references unknown sport ${sportId}.`);
    }

    return {
      sport_id: sportId,
      title: ensureString(candidate.title, `sport_sections[${index}].title`),
      assessment: ensureString(candidate.assessment, `sport_sections[${index}].assessment`),
      key_signals: ensureStringArray(candidate.key_signals, `sport_sections[${index}].key_signals`),
      recommendations: ensureStringArray(
        candidate.recommendations,
        `sport_sections[${index}].recommendations`,
      ),
    };
  });
}

export function validateTrainingNarrativeReport(
  value: unknown,
  availableChartIds: string[],
  availableSportIds: string[],
): TrainingNarrativeReport {
  if (!value || typeof value !== "object") {
    throw new Error("training.report.llm.json must be an object.");
  }

  const candidate = value as Record<string, unknown>;
  const schemaVersion = ensureString(candidate.schema_version, "schema_version");
  if (schemaVersion !== TRAINING_NARRATIVE_REPORT_SCHEMA_VERSION) {
    throw new Error(
      `training.report.llm.json schema_version must be ${TRAINING_NARRATIVE_REPORT_SCHEMA_VERSION}, got ${schemaVersion}.`,
    );
  }

  return {
    schema_version: schemaVersion,
    training_assessment: ensureString(candidate.training_assessment, "training_assessment"),
    overall_findings: ensureStringArray(candidate.overall_findings, "overall_findings"),
    sport_sections: ensureSportSections(candidate.sport_sections, availableSportIds),
    watchouts: ensureStringArray(candidate.watchouts, "watchouts"),
    actions_next_2_weeks: ensureStringArray(candidate.actions_next_2_weeks, "actions_next_2_weeks"),
    questions_for_doctor: ensureStringArray(candidate.questions_for_doctor, "questions_for_doctor"),
    data_limitations: ensureStringArray(candidate.data_limitations, "data_limitations"),
    chart_callouts: ensureChartCallouts(candidate.chart_callouts, availableChartIds),
    disclaimer: ensureString(candidate.disclaimer, "disclaimer"),
  };
}
