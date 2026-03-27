import type { ChartSeries } from "../types.js";

interface ChartSize {
  width: number;
  height: number;
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

  return `<svg viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="${escapeAttribute(
    series.label,
  )} 迷你趋势图" xmlns="http://www.w3.org/2000/svg">
  <polyline fill="none" stroke="${escapeAttribute(color)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${polyline}" />
</svg>`;
}

// ─── Bar Chart ─────────────────────────────────────────────────────

export function renderBarChart(
  series: ChartSeries,
  color: string,
  size: ChartSize = { width: 640, height: 180 },
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
      const title = `${point.label}: ${point.value}${series.unit ? ` ${series.unit}` : ""}`;
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

  return `<svg viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="${escapeAttribute(
    series.label,
  )} 柱状图" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  ${bars}
  ${xLabels}
</svg>`;
}

// ─── Multi-Series Line Chart ───────────────────────────────────────

export function renderMultiSeriesLineChart(
  seriesList: ChartSeries[],
  colors: string[],
  size: ChartSize = { width: 720, height: 220 },
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

        const title = `${series.label} ${point.label}: ${point.value}${series.unit ? ` ${series.unit}` : ""}`;
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

  return `<svg viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="趋势图" xmlns="http://www.w3.org/2000/svg" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  ${gridLines}
  ${xLabels}
  ${paths}
</svg>`;
}
