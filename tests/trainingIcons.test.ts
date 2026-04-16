import { describe, expect, it } from "vitest";

import { iconForWorkoutType } from "../src/analyzers/training.js";
import { formatWorkoutType } from "../src/analyzers/workoutTypes.js";
import { renderTrainingIcon } from "../src/render/trainingIcons.js";

describe("training icon mapping", () => {
  it("maps common Apple workout types to stable icon categories", () => {
    expect(iconForWorkoutType("HKWorkoutActivityTypeSwimming")).toBe("swimming");
    expect(iconForWorkoutType("HKWorkoutActivityTypePickleball")).toBe("tennis");
    expect(iconForWorkoutType("HKWorkoutActivityTypeSoccer")).toBe("soccer");
    expect(iconForWorkoutType("HKWorkoutActivityTypeTraditionalStrengthTraining")).toBe("strength");
    expect(iconForWorkoutType("HKWorkoutActivityTypeYoga")).toBe("mind-body");
    expect(iconForWorkoutType("HKWorkoutActivityTypeWheelchairRunPace")).toBe("running");
    expect(iconForWorkoutType("HKWorkoutActivityTypeUnknownFutureSport")).toBe("generic");
  });

  it("renders emoji with a generic fallback", () => {
    expect(renderTrainingIcon("swimming")).toContain("🏊");
    expect(renderTrainingIcon("soccer")).toContain("⚽");
    expect(renderTrainingIcon("mind-body")).toContain("🧘");
    expect(renderTrainingIcon("not-mapped")).toContain("🏅");
  });

  it("localizes common workout labels", () => {
    expect(formatWorkoutType("HKWorkoutActivityTypeSwimming", "zh")).toBe("游泳");
    expect(formatWorkoutType("HKWorkoutActivityTypePickleball", "zh")).toBe("匹克球");
    expect(formatWorkoutType("HKWorkoutActivityTypeSoccer", "en")).toBe("Soccer");
    expect(formatWorkoutType("HKWorkoutActivityTypeYoga", "zh")).toBe("瑜伽");
  });
});
