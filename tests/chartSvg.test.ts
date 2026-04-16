import { describe, expect, it } from "vitest";

import { renderPmcChart } from "../src/render/chartSvg.js";
import type { ChartSeries } from "../src/types.js";

function zeroSeries(id: string, label: string, unit: string): ChartSeries {
  // 52 weekly points, all at 0 — the legitimate shape for an export with no
  // workouts in window.
  return {
    id,
    label,
    unit,
    visual: "line",
    points: Array.from({ length: 52 }, (_, i) => ({
      start: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
      end: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
      granularity: "week" as const,
      label: `2026-W${String(i + 1).padStart(2, "0")}`,
      value: 0,
      sampleCount: 0,
    })),
  };
}

describe("renderPmcChart", () => {
  it("emits a finite SVG when CTL/ATL/TSB are all zero", () => {
    // Regression: clipAxisMax used to return 0 for a zero-load history,
    // which propagated `NaN` through yPosition and produced an invalid path.
    const ctl = zeroSeries("training_load_ctl", "Fitness (CTL)", "MET·min");
    const atl = zeroSeries("training_load_atl", "Fatigue (ATL)", "MET·min");
    const tsb = { ...zeroSeries("training_load_tsb", "Form (TSB)", "MET·min"), visual: "area" as const };

    const svg = renderPmcChart(ctl, atl, tsb, {
      ctl: "#F97316",
      atl: "#0EA5E9",
      tsbPositive: "#22C55E",
      tsbNegative: "#EF4444",
    });

    expect(svg).toContain("<svg");
    expect(svg).not.toContain("NaN");
    // Axis labels should render numeric values, never "NaN".
    expect(svg).toMatch(/<text[^>]*>[-+\d.]+<\/text>/);
  });

  it("emits an empty but valid SVG when all series are empty", () => {
    const empty: ChartSeries = {
      id: "x",
      label: "x",
      unit: "",
      visual: "line",
      points: [],
    };
    const svg = renderPmcChart(empty, empty, { ...empty, visual: "area" }, {
      ctl: "#F97316",
      atl: "#0EA5E9",
      tsbPositive: "#22C55E",
      tsbNegative: "#EF4444",
    });
    expect(svg).toContain("<svg");
    expect(svg).not.toContain("NaN");
  });
});
