import type { ChartSeries } from "../types.js";

interface ChartSize {
  width: number;
  height: number;
}

/**
 * Minimal i18n surface the chart renderer depends on.
 * Both `RenderT` (health report) and `TrainingRenderT` (training report)
 * satisfy this shape structurally, so either may be passed in.
 */
export interface ChartLabelsT {
  sparklineAriaLabel: (label: string) => string;
  barChartAriaLabel: (label: string) => string;
  lineChartAriaLabel: string;
}

/** Format a tooltip numeric value: trim trailing zeros, cap at 2 decimals. */
function formatTooltipValue(value: number): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  // Round to 2 decimals, then strip trailing zeros.
  const rounded = Math.round(value * 100) / 100;
  return rounded
    .toFixed(2)
    .replace(/\.?0+$/, "");
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function numericPoints(series: ChartSeries): number[] {
  return series.points
    .map((point) => point.value)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function extent(values: number[]): { min: number; max: number } {
  if (values.length === 0) {
    return { min: 0, max: 1 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }
  const padding = (max - min) * 0.1;
  return { min: min - padding, max: max + padding };
}

function xPosition(index: number, total: number, left: number, right: number): number {
  if (total <= 1) {
    return (left + right) / 2;
  }
  return left + (index / (total - 1)) * (right - left);
}

function yPosition(value: number, min: number, max: number, top: number, bottom: number): number {
  const normalized = (value - min) / (max - min);
  return bottom - normalized * (bottom - top);
}

function formatAxisValue(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${Math.round(value)}`;
  }
  if (Math.abs(value) >= 100) {
    return `${Math.round(value)}`;
  }
  if (Number.isInteger(value)) {
    return `${value}`;
  }
  return value.toFixed(1);
}

/** Shorten a chart point label for X-axis display */
function shortenLabel(label: string): string {
  // "2026-03-15" → "03-15"
  const dateMatch = label.match(/^\d{4}-(\d{2}-\d{2})$/);
  if (dateMatch) {
    return dateMatch[1];
  }
  // "2026-03-10 ~ 2026-03-16" → "03-10~03-16"
  const rangeMatch = label.match(/^\d{4}-(\d{2}-\d{2}) ~ \d{4}-(\d{2}-\d{2})$/);
  if (rangeMatch) {
    return `${rangeMatch[1]}~${rangeMatch[2]}`;
  }
  // "2026-03" → "2026-03"
  return label;
}

/** Pick evenly-spaced indices for axis labels */
function pickLabelIndices(total: number, maxLabels: number): number[] {
  if (total <= maxLabels) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const indices: number[] = [0];
  const step = (total - 1) / (maxLabels - 1);
  for (let i = 1; i < maxLabels - 1; i++) {
    indices.push(Math.round(step * i));
  }
  indices.push(total - 1);
  return [...new Set(indices)];
}

// ─── Sparkline (compact, no axes) ──────────────────────────────────

export function renderLineSparkline(
  series: ChartSeries,
  color: string,
  size: ChartSize = { width: 180, height: 56 },
  t?: ChartLabelsT,
): string {
  const values = numericPoints(series);
  const { min, max } = extent(values);
  const pad = 6;
  const points = series.points
    .map((point, index) => {
      if (point.value === null) {
        return null;
      }
      return `${xPosition(index, series.points.length, pad, size.width - pad)},${yPosition(
        point.value,
        min,
        max,
        pad,
        size.height - pad,
      )}`;
    })
    .filter((point): point is string => Boolean(point));

  const polyline = points.length > 0 ? points.join(" ") : `${pad},${size.height / 2}`;

  const ariaLabel = t ? t.sparklineAriaLabel(series.label) : `${series.label} sparkline`;

  return `<svg viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="${escapeAttribute(
    ariaLabel,
  )}" xmlns="http://www.w3.org/2000/svg">
  <polyline fill="none" stroke="${escapeAttribute(color)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${polyline}" />
</svg>`;
}

// ─── Bar Chart ─────────────────────────────────────────────────────

export function renderBarChart(
  series: ChartSeries,
  color: string,
  size: ChartSize = { width: 640, height: 180 },
  t?: ChartLabelsT,
): string {
  const values = numericPoints(series);
  const { max } = extent(values);
  const margin = { top: 24, right: 18, bottom: 36, left: 18 };
  const plotW = size.width - margin.left - margin.right;
  const plotH = size.height - margin.top - margin.bottom;
  const barWidth = Math.max(6, plotW / Math.max(series.points.length, 1) - 4);

  const bars = series.points
    .map((point, index) => {
      if (point.value === null) {
        return "";
      }
      const height = (point.value / max) * plotH;
      const x = margin.left + index * (barWidth + 4);
      const y = margin.top + plotH - height;
      const unitSuffix = series.unit ? ` ${series.unit.trim()}` : "";
      const title = `${point.label}: ${formatTooltipValue(point.value)}${unitSuffix}`;
      return `<g><title>${escapeAttribute(title)}</title><rect x="${x}" y="${y}" width="${barWidth}" height="${Math.max(
        height,
        1,
      )}" rx="4" fill="${escapeAttribute(color)}" opacity="0.85" /><text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="10" fill="#64748B">${Math.round(point.value)}</text></g>`;
    })
    .join("");

  // X-axis labels
  const labelIndices = pickLabelIndices(series.points.length, 6);
  const xLabels = labelIndices
    .map((i) => {
      const point = series.points[i];
      if (!point) return "";
      const x = margin.left + i * (barWidth + 4) + barWidth / 2;
      const y = margin.top + plotH + 16;
      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="#94A3B8">${escapeAttribute(shortenLabel(point.label))}</text>`;
    })
    .join("");

  const ariaLabel = t ? t.barChartAriaLabel(series.label) : `${series.label} bar chart`;

  return `<svg viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="${escapeAttribute(
    ariaLabel,
  )}" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  ${bars}
  ${xLabels}
</svg>`;
}

// ─── Multi-Series Line Chart ───────────────────────────────────────

export function renderMultiSeriesLineChart(
  seriesList: ChartSeries[],
  colors: string[],
  size: ChartSize = { width: 720, height: 220 },
  t?: ChartLabelsT,
): string {
  const values = seriesList.flatMap((series) => numericPoints(series));
  const { min, max } = extent(values);

  const margin = { top: 16, right: 16, bottom: 36, left: 48 };
  const plotLeft = margin.left;
  const plotRight = size.width - margin.right;
  const plotTop = margin.top;
  const plotBottom = size.height - margin.bottom;

  // Y-axis grid lines & labels (5 lines)
  const ySteps = [0, 0.25, 0.5, 0.75, 1];
  const gridLines = ySteps
    .map((step) => {
      const yVal = max - step * (max - min);
      const y = plotTop + step * (plotBottom - plotTop);
      return `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="4,3" /><text x="${plotLeft - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94A3B8">${escapeAttribute(formatAxisValue(yVal))}</text>`;
    })
    .join("");

  // X-axis labels from the longest series
  const longestSeries = seriesList.reduce(
    (best, series) => (series.points.length > best.points.length ? series : best),
    seriesList[0],
  );
  const maxXLabels = Math.min(7, Math.floor((plotRight - plotLeft) / 70));
  const xLabelIndices = longestSeries ? pickLabelIndices(longestSeries.points.length, maxXLabels) : [];
  const xLabels = longestSeries
    ? xLabelIndices
        .map((i) => {
          const point = longestSeries.points[i];
          if (!point) return "";
          const x = xPosition(i, longestSeries.points.length, plotLeft, plotRight);
          return `<text x="${x}" y="${plotBottom + 16}" text-anchor="middle" font-size="10" fill="#94A3B8">${escapeAttribute(shortenLabel(point.label))}</text>`;
        })
        .join("")
    : "";

  // Data paths + dots + hover titles
  const paths = seriesList
    .map((series, seriesIndex) => {
      const color = colors[seriesIndex % colors.length];
      const segments: string[] = [];
      let current = "";

      const dots: string[] = [];

      series.points.forEach((point, pointIndex) => {
        if (point.value === null) {
          if (current) {
            segments.push(current);
            current = "";
          }
          return;
        }
        const x = xPosition(pointIndex, series.points.length, plotLeft, plotRight);
        const y = yPosition(point.value, min, max, plotTop, plotBottom);
        current += `${current ? " L" : "M"} ${x} ${y}`;

        const unitSuffix = series.unit ? ` ${series.unit.trim()}` : "";
        const title = `${series.label} ${point.label}: ${formatTooltipValue(point.value)}${unitSuffix}`;
        dots.push(
          `<circle cx="${x}" cy="${y}" r="3" fill="${escapeAttribute(color)}" stroke="#fff" stroke-width="1.5"><title>${escapeAttribute(title)}</title></circle>`,
        );
      });
      if (current) {
        segments.push(current);
      }

      const pathEls = segments
        .map(
          (segment) =>
            `<path d="${segment}" fill="none" stroke="${escapeAttribute(
              color,
            )}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />`,
        )
        .join("");

      return pathEls + dots.join("");
    })
    .join("");

  const ariaLabel = t ? t.lineChartAriaLabel : "Trend chart";

  return `<svg viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="${escapeAttribute(ariaLabel)}" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  ${gridLines}
  ${xLabels}
  ${paths}
</svg>`;
}

// ─── PMC Chart (CTL + ATL lines + TSB area) ────────────────────────

/**
 * Robust upper bound for an axis that should clip long-tail outliers without
 * hiding meaningful peaks. Uses the 97.5th percentile plus a 15% headroom,
 * falling back to the raw max for small samples. Always returns a strictly
 * positive value so downstream `yPosition` math never divides by zero
 * (a zero-load or empty series would otherwise yield `NaN` coordinates).
 */
function clipAxisMax(values: number[]): number {
  const sorted = values.slice().sort((a, b) => a - b);
  if (sorted.length === 0) return 1;
  const max = sorted[sorted.length - 1];
  if (max <= 0) return 1;
  if (sorted.length < 8) return max * 1.1;
  const idx = Math.floor(sorted.length * 0.975);
  const p975 = sorted[idx];
  // If the true max is only mildly above p975, keep the true max to avoid
  // clipping a legitimate peak. Otherwise clip to p975 + headroom.
  const computed = max <= p975 * 1.25 ? max * 1.05 : p975 * 1.15;
  return computed > 0 ? computed : 1;
}

/**
 * Symmetric TSB axis bound using the 97.5th percentile of |TSB|.
 */
function clipSymmetricMax(values: number[]): number {
  const abs = values.map(Math.abs);
  return Math.max(20, clipAxisMax(abs));
}

/**
 * Performance-Management-Chart rendered as two stacked panels sharing one
 * x-axis:
 *
 *   • Top panel (~65% of the plot area): CTL (thick orange) + ATL (thin blue)
 *     on a single linear y-axis, 0-rooted so the relative magnitudes are
 *     immediately comparable.
 *   • Bottom panel (~30%): TSB area with a zero baseline — positive region
 *     filled green (fresh), negative region filled red (carrying fatigue).
 *
 * Extreme ATL or TSB spikes are clipped to the 97.5th percentile so a single
 * outlier session can't flatten the rest of the curve.
 */
export function renderPmcChart(
  ctl: ChartSeries,
  atl: ChartSeries,
  tsb: ChartSeries,
  colors: { ctl: string; atl: string; tsbPositive: string; tsbNegative: string },
  size: ChartSize = { width: 720, height: 280 },
  t?: ChartLabelsT,
): string {
  const margin = { top: 18, right: 16, bottom: 30, left: 52 };
  const plotLeft = margin.left;
  const plotRight = size.width - margin.right;
  const plotTop = margin.top;
  const plotBottom = size.height - margin.bottom;

  const pointCount = Math.max(ctl.points.length, atl.points.length, tsb.points.length);
  const ariaLabel = t ? t.lineChartAriaLabel : "Trend chart";
  if (pointCount === 0) {
    return `<svg viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="${escapeAttribute(ariaLabel)}" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  // Split the plot area vertically: top panel for CTL/ATL, bottom for TSB.
  const totalPlotHeight = plotBottom - plotTop;
  const gapBetweenPanels = 14;
  const topPanelRatio = 0.66;
  const topPlotTop = plotTop;
  const topPlotBottom = plotTop + totalPlotHeight * topPanelRatio - gapBetweenPanels / 2;
  const bottomPlotTop = plotTop + totalPlotHeight * topPanelRatio + gapBetweenPanels / 2;
  const bottomPlotBottom = plotBottom;

  // ── Top panel: CTL/ATL ────────────────────────────────────────────
  const ctlAtlValues = [...numericPoints(ctl), ...numericPoints(atl)];
  const topMin = 0;
  const topMax = clipAxisMax(ctlAtlValues);

  const topGridSteps = [0, 0.5, 1];
  const topGrid = topGridSteps
    .map((step) => {
      const val = topMax - step * (topMax - topMin);
      const y = topPlotTop + step * (topPlotBottom - topPlotTop);
      return (
        `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="4,3" />` +
        `<text x="${plotLeft - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#64748B">${escapeAttribute(formatAxisValue(val))}</text>`
      );
    })
    .join("");

  // ── Bottom panel: TSB area ────────────────────────────────────────
  const tsbValues = numericPoints(tsb);
  const tsbAbsMax = clipSymmetricMax(tsbValues);
  const tsbAxisMin = -tsbAbsMax;
  const tsbAxisMax = tsbAbsMax;
  const tsbZeroY =
    bottomPlotTop + ((tsbAxisMax - 0) / (tsbAxisMax - tsbAxisMin)) * (bottomPlotBottom - bottomPlotTop);

  // Axis labels for the bottom panel (top / zero / bottom).
  const tsbGridSteps = [0, 0.5, 1];
  const tsbGrid = tsbGridSteps
    .map((step) => {
      const val = tsbAxisMax - step * (tsbAxisMax - tsbAxisMin);
      const y = bottomPlotTop + step * (bottomPlotBottom - bottomPlotTop);
      return (
        `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="4,3" />` +
        `<text x="${plotLeft - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#64748B">${escapeAttribute((val > 0 ? "+" : "") + formatAxisValue(val))}</text>`
      );
    })
    .join("");

  // Vertical separator line between the two panels.
  const separator = `<line x1="${plotLeft}" y1="${topPlotBottom + gapBetweenPanels / 2}" x2="${plotRight}" y2="${topPlotBottom + gapBetweenPanels / 2}" stroke="#E5E7EB" stroke-width="1" />`;

  // ── X-axis labels (shared) ────────────────────────────────────────
  const longest =
    ctl.points.length >= atl.points.length && ctl.points.length >= tsb.points.length
      ? ctl
      : atl.points.length >= tsb.points.length
        ? atl
        : tsb;
  const maxXLabels = Math.min(8, Math.floor((plotRight - plotLeft) / 80));
  const xLabelIndices = pickLabelIndices(longest.points.length, maxXLabels);
  const xLabels = xLabelIndices
    .map((i) => {
      const point = longest.points[i];
      if (!point) return "";
      const x = xPosition(i, longest.points.length, plotLeft, plotRight);
      return `<text x="${x}" y="${plotBottom + 16}" text-anchor="middle" font-size="10" fill="#94A3B8">${escapeAttribute(shortenLabel(point.label))}</text>`;
    })
    .join("");

  // ── Top-panel line helpers ────────────────────────────────────────
  const drawClippedLine = (series: ChartSeries, color: string, strokeWidth: number): string => {
    const segments: string[] = [];
    let current = "";
    const dots: string[] = [];
    series.points.forEach((point, index) => {
      if (point.value === null) {
        if (current) {
          segments.push(current);
          current = "";
        }
        return;
      }
      const clipped = Math.min(point.value, topMax);
      const x = xPosition(index, series.points.length, plotLeft, plotRight);
      const y = yPosition(clipped, topMin, topMax, topPlotTop, topPlotBottom);
      current += `${current ? " L" : "M"} ${x} ${y}`;
      const unit = series.unit ? ` ${series.unit.trim()}` : "";
      // Show the *real* (un-clipped) value in the tooltip.
      const title = `${series.label} ${point.label}: ${formatTooltipValue(point.value)}${unit}`;
      dots.push(
        `<circle cx="${x}" cy="${y}" r="2.5" fill="${escapeAttribute(color)}" stroke="#fff" stroke-width="1"><title>${escapeAttribute(title)}</title></circle>`,
      );
    });
    if (current) segments.push(current);
    const paths = segments
      .map(
        (d) =>
          `<path d="${d}" fill="none" stroke="${escapeAttribute(color)}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`,
      )
      .join("");
    return paths + dots.join("");
  };
  const ctlLayer = drawClippedLine(ctl, colors.ctl, 2.8);
  const atlLayer = drawClippedLine(atl, colors.atl, 1.6);

  // ── Bottom-panel TSB area ─────────────────────────────────────────
  const tsbAreaPaths: string[] = [];
  let segment: Array<{ x: number; y: number; value: number }> = [];
  let segmentSign: 1 | -1 | 0 = 0;
  const flushSegment = () => {
    if (segment.length === 0) return;
    const color = segmentSign >= 0 ? colors.tsbPositive : colors.tsbNegative;
    const startX = segment[0].x;
    const endX = segment[segment.length - 1].x;
    const curve = segment.map((p) => `${p.x} ${p.y}`).join(" L ");
    const d = `M ${startX} ${tsbZeroY} L ${curve} L ${endX} ${tsbZeroY} Z`;
    tsbAreaPaths.push(
      `<path d="${d}" fill="${escapeAttribute(color)}" fill-opacity="0.35" stroke="none" />`,
    );
    segment = [];
    segmentSign = 0;
  };
  tsb.points.forEach((point, index) => {
    if (point.value === null) {
      flushSegment();
      return;
    }
    const clipped = Math.max(Math.min(point.value, tsbAxisMax), tsbAxisMin);
    const x = xPosition(index, tsb.points.length, plotLeft, plotRight);
    const y = yPosition(clipped, tsbAxisMin, tsbAxisMax, bottomPlotTop, bottomPlotBottom);
    const sign: 1 | -1 = point.value >= 0 ? 1 : -1;
    if (segment.length > 0 && sign !== segmentSign) {
      const prev = segment[segment.length - 1];
      const denom = point.value - prev.value;
      const t0 = denom === 0 ? 0 : Math.max(0, Math.min(1, (0 - prev.value) / denom));
      const crossX = prev.x + (x - prev.x) * t0;
      segment.push({ x: crossX, y: tsbZeroY, value: 0 });
      flushSegment();
      segment.push({ x: crossX, y: tsbZeroY, value: 0 });
    }
    segment.push({ x, y, value: point.value });
    segmentSign = sign;
  });
  flushSegment();

  // TSB outline + invisible tooltip targets.
  const tsbStrokeSegments: string[] = [];
  let cur = "";
  const tsbDots: string[] = [];
  tsb.points.forEach((point, index) => {
    if (point.value === null) {
      if (cur) {
        tsbStrokeSegments.push(cur);
        cur = "";
      }
      return;
    }
    const clipped = Math.max(Math.min(point.value, tsbAxisMax), tsbAxisMin);
    const x = xPosition(index, tsb.points.length, plotLeft, plotRight);
    const y = yPosition(clipped, tsbAxisMin, tsbAxisMax, bottomPlotTop, bottomPlotBottom);
    cur += `${cur ? " L" : "M"} ${x} ${y}`;
    const unit = tsb.unit ? ` ${tsb.unit.trim()}` : "";
    const title = `${tsb.label} ${point.label}: ${formatTooltipValue(point.value)}${unit}`;
    tsbDots.push(
      `<circle cx="${x}" cy="${y}" r="3" fill="${escapeAttribute(point.value >= 0 ? colors.tsbPositive : colors.tsbNegative)}" opacity="0.0001"><title>${escapeAttribute(title)}</title></circle>`,
    );
  });
  if (cur) tsbStrokeSegments.push(cur);
  const tsbStroke = tsbStrokeSegments
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="#6B7280" stroke-opacity="0.45" stroke-width="1" stroke-linejoin="round" />`,
    )
    .join("");

  return `<svg viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="${escapeAttribute(ariaLabel)}" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  ${topGrid}
  ${tsbGrid}
  ${separator}
  ${xLabels}
  ${atlLayer}
  ${ctlLayer}
  ${tsbAreaPaths.join("")}
  ${tsbStroke}
  ${tsbDots.join("")}
</svg>`;
}

// ─── Dual-Axis Chart: bar series + overlay line ────────────────────

/**
 * Renders a bar series against a left y-axis plus a line series against an
 * independent right y-axis. Used for sport trend charts where "frequency"
 * (count of workouts) and "avg duration per workout" share an x-axis but
 * different magnitudes. Both series are drawn in the same color family so
 * they read as two angles on the same sport.
 */
export function renderDualAxisChart(
  bars: ChartSeries,
  line: ChartSeries,
  colors: { bar: string; line: string },
  size: ChartSize = { width: 720, height: 240 },
  t?: ChartLabelsT,
): string {
  const margin = { top: 20, right: 52, bottom: 36, left: 52 };
  const plotLeft = margin.left;
  const plotRight = size.width - margin.right;
  const plotTop = margin.top;
  const plotBottom = size.height - margin.bottom;

  const barValues = numericPoints(bars);
  const lineValues = numericPoints(line);
  const barMax = barValues.length > 0 ? Math.max(...barValues) : 1;
  const lineRange = extent(lineValues);

  // Ensure bar axis has a sensible minimum of 0.
  const barAxisTop = barMax > 0 ? barMax * 1.15 : 1;
  // Line axis always has ≥10% headroom.
  const lineAxisMin = lineRange.min;
  const lineAxisMax = lineRange.max;

  // Left axis grid + labels (bar scale, 5 ticks).
  const ySteps = [0, 0.25, 0.5, 0.75, 1];
  const gridAndLeftLabels = ySteps
    .map((step) => {
      const barVal = barAxisTop * (1 - step);
      const lineVal = lineAxisMax - step * (lineAxisMax - lineAxisMin);
      const y = plotTop + step * (plotBottom - plotTop);
      return `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="4,3" />`
        + `<text x="${plotLeft - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="${escapeAttribute(colors.bar)}">${escapeAttribute(formatAxisValue(barVal))}</text>`
        + `<text x="${plotRight + 6}" y="${y + 4}" text-anchor="start" font-size="10" fill="${escapeAttribute(colors.line)}">${escapeAttribute(formatAxisValue(lineVal))}</text>`;
    })
    .join("");

  const pointCount = Math.max(bars.points.length, line.points.length);
  if (pointCount === 0) {
    const ariaLabel = t ? t.lineChartAriaLabel : "Trend chart";
    return `<svg viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="${escapeAttribute(ariaLabel)}" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  // Bar width & inner padding: keep first/last bars from overflowing the Y-axis label columns.
  const barWidth = Math.max(6, ((plotRight - plotLeft) / pointCount) * 0.55);
  const barXPadding = barWidth / 2 + 4;
  const chartLeft = plotLeft + barXPadding;
  const chartRight = plotRight - barXPadding;

  // X-axis labels (take from the longer series).
  const longest = bars.points.length >= line.points.length ? bars : line;
  const maxXLabels = Math.min(7, Math.max(2, Math.floor((chartRight - chartLeft) / 70)));
  const xLabelIndices = pickLabelIndices(longest.points.length, maxXLabels);
  const xLabels = xLabelIndices
    .map((i) => {
      const point = longest.points[i];
      if (!point) return "";
      const x = xPosition(i, longest.points.length, chartLeft, chartRight);
      return `<text x="${x}" y="${plotBottom + 16}" text-anchor="middle" font-size="10" fill="#94A3B8">${escapeAttribute(shortenLabel(point.label))}</text>`;
    })
    .join("");

  // Bars: scale to bar-axis (zero baseline).
  const barElements = bars.points
    .map((point, index) => {
      if (point.value === null) {
        return "";
      }
      const x = xPosition(index, bars.points.length, chartLeft, chartRight) - barWidth / 2;
      const heightRatio = barAxisTop > 0 ? point.value / barAxisTop : 0;
      const height = Math.max(heightRatio * (plotBottom - plotTop), 0.5);
      const y = plotBottom - height;
      const unitSuffix = bars.unit ? ` ${bars.unit.trim()}` : "";
      const title = `${bars.label} ${point.label}: ${formatTooltipValue(point.value)}${unitSuffix}`;
      return `<g><title>${escapeAttribute(title)}</title><rect x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="3" fill="${escapeAttribute(colors.bar)}" opacity="0.75" /></g>`;
    })
    .join("");

  // Line: scale to line-axis.
  const segments: string[] = [];
  let current = "";
  const dots: string[] = [];
  line.points.forEach((point, index) => {
    if (point.value === null) {
      if (current) {
        segments.push(current);
        current = "";
      }
      return;
    }
    const x = xPosition(index, line.points.length, chartLeft, chartRight);
    const y = yPosition(point.value, lineAxisMin, lineAxisMax, plotTop, plotBottom);
    current += `${current ? " L" : "M"} ${x} ${y}`;
    const unitSuffix = line.unit ? ` ${line.unit.trim()}` : "";
    const title = `${line.label} ${point.label}: ${formatTooltipValue(point.value)}${unitSuffix}`;
    dots.push(
      `<circle cx="${x}" cy="${y}" r="3" fill="${escapeAttribute(colors.line)}" stroke="#fff" stroke-width="1.5"><title>${escapeAttribute(title)}</title></circle>`,
    );
  });
  if (current) segments.push(current);
  const linePath = segments
    .map(
      (segment) =>
        `<path d="${segment}" fill="none" stroke="${escapeAttribute(colors.line)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" />`,
    )
    .join("");

  const ariaLabel = t ? t.lineChartAriaLabel : "Trend chart";
  return `<svg viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="${escapeAttribute(ariaLabel)}" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  ${gridAndLeftLabels}
  ${xLabels}
  ${barElements}
  ${linePath}${dots.join("")}
</svg>`;
}
