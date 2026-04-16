/**
 * Shared CSS tokens and layout primitives for both the health report
 * and the training report. Each renderer inlines BASE_CSS and then adds
 * its own module-specific extension (reportHtml.ts / trainingReportHtml.ts).
 *
 * Keep this file synchronized with the CSS blocks both renderers embed.
 */

/**
 * Root design tokens + page reset + topbar + layout + summary cards +
 * overview + pills + badges + module frame + legend + footer + common
 * responsive / print rules.
 *
 * NOTE: `.module__body` layout is intentionally left to each report's
 * extension CSS so the two reports can choose grid vs. block bodies.
 */
export const BASE_CSS = `:root {
  --bg: #F2F2F7;
  --surface: #FFFFFF;
  --ink: #1C1C1E;
  --ink-secondary: #3A3A3C;
  --muted: #8E8E93;
  --faint: #AEAEB2;
  --border: #E5E5EA;
  --border-light: #F2F2F7;
  --sleep: #6366F1;
  --sleep-bg: #EEF2FF;
  --recovery: #10B981;
  --recovery-bg: #ECFDF5;
  --activity: #F97316;
  --activity-bg: #FFF7ED;
  --body: #6B7280;
  --body-bg: #F3F4F6;
  --menstrual: #EC4899;
  --menstrual-bg: #FDF2F8;
  --risk: #EF4444;
  --risk-bg: #FEF2F2;
  --positive: #22C55E;
  --positive-bg: #F0FDF4;
  --fs-xs: 11px;
  --fs-sm: 13px;
  --fs-base: 15px;
  --fs-lg: 18px;
  --fs-xl: 22px;
  --fs-2xl: 28px;
  --radius: 10px;
  --radius-sm: 6px;
  --shadow: none;
  --shadow-md: none;
}
* { box-sizing: border-box; margin: 0; }
html {
  scroll-behavior: smooth;
  background: var(--bg);
}
body {
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: var(--fs-base);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ─── Topbar ─── */
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  height: 52px;
}
.topbar__title {
  font-weight: 600;
  font-size: var(--fs-base);
  white-space: nowrap;
}
.topbar__date {
  color: var(--muted);
  font-size: var(--fs-sm);
  white-space: nowrap;
}
.topbar__nav {
  display: flex;
  gap: 2px;
  margin-left: auto;
}
.topbar__nav a {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.topbar__nav a:hover {
  background: var(--border-light);
  color: var(--ink);
}
.topbar__github {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 50%;
  color: var(--muted);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
  margin-left: 6px;
}
.topbar__github:hover {
  background: var(--border-light);
  color: var(--ink);
}
.topbar__github svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  display: block;
}

/* ─── Layout ─── */
main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 0;
}
section {
  scroll-margin-top: 64px;
}

/* ─── Summary Cards ─── */
.summary-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
}
.metric-card {
  flex: 1 1 0;
  min-width: 0;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px 22px;
  box-shadow: var(--shadow);
}
.metric-card__label {
  font-size: var(--fs-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  margin-bottom: 6px;
}
.metric-card__value {
  font-size: var(--fs-2xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.metric-card__sub {
  font-size: var(--fs-sm);
  color: var(--faint);
  margin-top: 4px;
}

/* ─── Overview ─── */
.overview {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 28px;
  margin-bottom: 28px;
}
.overview__title {
  font-size: var(--fs-lg);
  font-weight: 700;
  margin-bottom: 12px;
}
.overview__text {
  font-size: var(--fs-base);
  line-height: 1.75;
  color: var(--ink-secondary);
  max-width: 72ch;
}
.overview__findings {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.overview__findings h3 {
  font-size: var(--fs-base);
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--ink);
}
.overview__findings ol,
.overview__findings ul,
.plain-list {
  padding-left: 20px;
  display: grid;
  gap: 8px;
}
.overview__findings li,
.plain-list li {
  font-size: var(--fs-base);
  line-height: 1.65;
  color: var(--ink-secondary);
}

/* ─── Pills & Badges ─── */
.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: var(--fs-sm);
  font-weight: 500;
}
.pill--risk {
  background: var(--risk-bg);
  color: var(--risk);
}
.pill--info {
  background: var(--border-light);
  color: var(--muted);
}
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.03em;
}
.badge--ok { background: var(--positive-bg); color: var(--positive); }
.badge--warn { background: #FFF7ED; color: #D97706; }
.badge--low { background: var(--risk-bg); color: var(--risk); }
.badge--info { background: var(--border-light); color: var(--muted); }

/* ─── Module frame (body layout is extended per-report) ─── */
.module {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  margin-bottom: 36px;
  overflow: hidden;
}
.module__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
}
.module__index {
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--faint);
  min-width: 28px;
}
.module__title {
  font-size: var(--fs-lg);
  font-weight: 700;
}
.module__callout {
  margin-left: auto;
  font-size: var(--fs-sm);
  color: var(--muted);
  max-width: 40ch;
  text-align: right;
}
.module--sleep { border-left: 4px solid var(--sleep); }
.module--sleep .module__index { color: var(--sleep); }
.module--recovery { border-left: 4px solid var(--recovery); }
.module--recovery .module__index { color: var(--recovery); }
.module--activity { border-left: 4px solid var(--activity); }
.module--activity .module__index { color: var(--activity); }
.module--body { border-left: 4px solid var(--body); }
.module--body .module__index { color: var(--body); }
.module--menstrual { border-left: 4px solid var(--menstrual); }
.module--menstrual .module__index { color: var(--menstrual); }
.module--recovery-support { border-left: 4px solid var(--sleep); }
.module--recovery-support .module__index { color: var(--sleep); }

/* ─── Chart wrappers & legend ─── */
.chart-wrap {
  padding: 8px 0 4px;
}
.chart-wrap svg {
  width: 100%;
  height: auto;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 8px;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-sm);
  color: var(--muted);
}
.legend-item i {
  display: inline-block;
  width: 14px;
  height: 3px;
  border-radius: 999px;
}

/* ─── Inline glossary tooltip (CSS-only) ─── */
.term-hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 6px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  color: var(--muted);
  cursor: help;
  position: relative;
  user-select: none;
  vertical-align: middle;
  background: var(--surface);
}
.term-hint:hover,
.term-hint:focus {
  color: var(--ink);
  border-color: var(--faint);
}
.term-hint::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 200px;
  max-width: 280px;
  padding: 10px 12px;
  background: var(--ink);
  color: #FFFFFF;
  font-size: var(--fs-xs);
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
  border-radius: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
  white-space: normal;
  text-align: left;
  z-index: 200;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
}
.term-hint::before {
  content: "";
  position: absolute;
  bottom: calc(100% + 3px);
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: var(--ink);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
  z-index: 199;
}
.term-hint:hover::after,
.term-hint:focus::after,
.term-hint:hover::before,
.term-hint:focus::before {
  opacity: 1;
}

/* ─── Glossary card (used in Load & Recovery module) ─── */
.glossary-card {
  background: var(--border-light);
  border-radius: 10px;
  padding: 14px 18px;
  margin-top: 16px;
}
.glossary-card > summary {
  cursor: pointer;
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--ink-secondary);
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
}
.glossary-card > summary::-webkit-details-marker {
  display: none;
}
.glossary-card > summary::before {
  content: "▸";
  transition: transform 0.15s;
  color: var(--faint);
  font-size: 10px;
}
.glossary-card[open] > summary::before {
  transform: rotate(90deg);
}
.glossary-card__body {
  margin-top: 12px;
  display: grid;
  gap: 10px;
  font-size: var(--fs-sm);
  line-height: 1.65;
  color: var(--ink-secondary);
}
.glossary-card__body dt {
  font-weight: 600;
  color: var(--ink);
}
.glossary-card__body dd {
  margin: 2px 0 0 0;
}

/* ─── Site Footer (shared between health + training reports) ─── */
.site-footer {
  margin-top: 0;
  padding: 24px 20px 32px;
  text-align: center;
  color: var(--muted);
  font-size: var(--fs-sm);
  line-height: 1.6;
}
.site-footer__brand {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--ink-secondary);
  text-decoration: none;
}
.site-footer__brand:hover {
  color: var(--ink);
}
.site-footer__tagline {
  margin-top: 4px;
  color: var(--faint);
  font-size: var(--fs-xs);
}
.site-footer__links {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  margin-top: 14px;
  flex-wrap: wrap;
  justify-content: center;
}
.site-footer__links a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  text-decoration: none;
  font-size: var(--fs-sm);
  transition: color 0.15s;
}
.site-footer__links a:hover {
  color: var(--ink);
}
.site-footer__links svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}

/* ─── Cross-report jump link (topbar + footer) ─── */
.topbar__cross-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--ink);
  text-decoration: none;
  background: var(--border-light);
  border: 1px solid var(--border);
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
  white-space: nowrap;
  margin-left: 6px;
}
.topbar__cross-link:hover {
  background: var(--surface);
  color: var(--ink);
}
.topbar__cross-link svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
  flex-shrink: 0;
}

/* ─── Responsive (shared) ─── */
@media (max-width: 860px) {
  .summary-cards {
    display: grid;
    grid-template-columns: 1fr;
  }
  .topbar {
    padding: 0 12px;
    gap: 12px;
  }
  .topbar__nav {
    display: none;
  }
  .overview {
    padding-left: 18px;
    padding-right: 18px;
  }
  .topbar__date {
    display: none;
  }
}

/* ─── Print (shared) ─── */
@media print {
  .topbar, .site-footer { display: none; }
  main { padding: 0; max-width: none; }
  .module, .overview, .metric-card {
    box-shadow: none;
    break-inside: avoid;
  }
  body { font-size: var(--fs-sm); }
  html { background: white; }
}`;

/**
 * CSS extension used only by the training report. Assumes BASE_CSS has
 * already been injected, so it only defines training-specific pieces
 * (sport module header, card grid, assessment hero, etc.).
 */
export const TRAINING_CSS = `.module__body {
  padding: 0 28px 28px;
}
.summary-cards--sport {
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.summary-cards--sport .metric-card {
  min-width: 210px;
}

/* ─── Sport module header (emoji + title + pills) ─── */
.module__header--sport {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 28px 18px;
  border-bottom: none;
}
.module__header--sport h2 {
  font-size: var(--fs-lg);
  font-weight: 700;
  margin-bottom: 6px;
}
.module__header--sport p {
  max-width: 72ch;
  color: var(--ink-secondary);
}
.module__title-wrap {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.module__icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--activity-bg);
  flex-shrink: 0;
}
.module__icon--emoji {
  font-size: 22px;
  line-height: 1;
}

/* ─── Nested card grid inside a training module body ─── */
.module-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.module-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px;
  margin-top: 16px;
}
.module-card__header h3,
.module-card h3 {
  font-size: var(--fs-base);
  margin-bottom: 8px;
}
.module-card p {
  color: var(--ink-secondary);
}

/* ─── Training overview / assessment hero ─── */
.assessment-hero {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  margin-bottom: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
}
.assessment-hero__main {
  padding: 28px 32px;
}
.assessment-hero__main h1 {
  font-size: var(--fs-xl);
  font-weight: 700;
  margin-bottom: 14px;
}
.assessment-hero__text {
  font-size: var(--fs-base);
  line-height: 1.8;
  color: var(--ink-secondary);
}
.assessment-hero__aside {
  padding: 28px;
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.assessment-hero__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.assessment-hero__stat:first-child {
  border-top: none;
  padding-top: 0;
}
.assessment-hero__stat-label {
  font-size: var(--fs-sm);
  color: var(--muted);
}
.assessment-hero__stat-value {
  font-size: var(--fs-xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.assessment-hero__readiness-good { color: var(--positive); }
.assessment-hero__readiness-moderate { color: #D97706; }
.assessment-hero__readiness-low { color: var(--risk); }

/* ─── PMC chart two-panel legend ─── */
.pmc-legend {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 24px;
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--border-light);
  border-radius: 8px;
}
.pmc-legend__panel {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  align-items: center;
  font-size: var(--fs-sm);
}
.pmc-legend__panel-title {
  font-weight: 600;
  color: var(--ink-secondary);
  font-size: var(--fs-xs);
  width: 100%;
}
.legend-item__swatch {
  width: 14px;
  height: 12px !important;
  border-radius: 3px !important;
}
@media (max-width: 700px) {
  .pmc-legend {
    grid-template-columns: 1fr;
  }
}

/* ─── Training calendar heatmap ─── */
.heatmap-card {
  margin-top: 16px;
}
.heatmap-card__header h3 {
  font-size: var(--fs-base);
  margin-bottom: 8px;
}
.heatmap-card__header p {
  color: var(--ink-secondary);
  font-size: var(--fs-sm);
  line-height: 1.65;
}
.heatmap-wrap {
  margin-top: 16px;
  width: 100%;
}
.heatmap-wrap svg {
  display: block;
  width: 100%;
  height: auto;
}
.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-size: var(--fs-xs);
  color: var(--muted);
}
.heatmap-legend__swatches {
  display: inline-flex;
  gap: 3px;
}
.heatmap-legend__swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid var(--border);
}

/* ─── Training-specific responsive ─── */
@media (max-width: 860px) {
  .module-card-grid {
    display: grid;
    grid-template-columns: 1fr;
  }
  .module__header--sport,
  .module__body {
    padding-left: 18px;
    padding-right: 18px;
  }
  .assessment-hero {
    grid-template-columns: 1fr;
  }
  .assessment-hero__aside {
    border-left: none;
    border-top: 1px solid var(--border);
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
  }
  .assessment-hero__stat {
    flex: 1 1 40%;
    border-top: none;
    padding-top: 0;
  }
}`;

/**
 * CSS extension used only by the health report. Everything shared with the
 * training report (topbar, summary cards, overview, pills, badges, module
 * frame, legend, footer, cross-link, responsive/print basics) lives in
 * BASE_CSS. This block only carries the health-specific layouts.
 */
export const HEALTH_CSS = `
/* ─── Health module body: chart on the left, aside on the right ─── */
.module__body {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
  gap: 0;
}
.module__chart {
  padding: 20px 24px;
  overflow: hidden;
  min-width: 0;
}
.module__aside {
  padding: 20px 24px;
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ─── Metric Rail (right-side key numbers in each module) ─── */
.metric-rail {
  display: grid;
  gap: 14px;
}
.metric-rail__item {
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.metric-rail__label {
  font-size: var(--fs-sm);
  color: var(--muted);
  margin-bottom: 4px;
}
.metric-rail__value {
  font-size: var(--fs-xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.metric-rail__note {
  font-size: var(--fs-xs);
  color: var(--faint);
  margin-top: 2px;
}
.metric-rail__item:first-child {
  border-top: none;
  padding-top: 0;
}

/* ─── Note Block (inline callouts under charts) ─── */
.note-block {
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.note-block h4 {
  font-size: var(--fs-sm);
  font-weight: 600;
  margin-bottom: 6px;
}
.note-block p,
.note-block li {
  font-size: var(--fs-sm);
  line-height: 1.65;
  color: var(--ink-secondary);
}
.note-block ul {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 6px;
}
.note-block li::before {
  content: "\\2022\\00a0";
  color: var(--faint);
}
.module__aside > :first-child {
  border-top: none;
  padding-top: 0;
}

/* ─── Ledger (recovery-metrics table) ─── */
.ledger {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: var(--fs-sm);
}
.ledger th {
  text-align: left;
  font-size: var(--fs-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--faint);
  padding: 0 8px 10px;
  white-space: nowrap;
}
.ledger__row td {
  padding: 12px 8px;
  border-top: 1px solid var(--border);
  vertical-align: middle;
}
.ledger__row--empty td {
  color: var(--faint);
}
.ledger__name {
  white-space: nowrap;
}
.ledger__name strong {
  display: block;
  font-size: var(--fs-base);
}
.ledger__name small {
  display: block;
  margin-top: 2px;
  color: var(--faint);
  font-size: var(--fs-xs);
}
.ledger__val {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ledger__empty {
  color: var(--faint);
  font-style: italic;
}
.delta--up { color: var(--activity); }
.delta--down { color: var(--recovery); }
.ledger__spark {
  width: 120px;
  max-width: 120px;
  overflow: hidden;
}
.ledger__spark svg {
  display: block;
  width: 100%;
  height: auto;
}

/* ─── Activity Summary (3 stat tiles) ─── */
.activity-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 14px;
}
.activity-stats__item {
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.activity-stats__item span {
  font-size: var(--fs-sm);
  color: var(--muted);
}
.activity-stats__item strong {
  display: block;
  margin-top: 4px;
  font-size: var(--fs-xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ─── Body Composition (two cards with sparklines) ─── */
.body-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px 24px;
}
.body-card {
  border-top: 1px solid var(--border);
  padding-top: 14px;
}
.body-card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}
.body-card__label {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--muted);
}
.body-card__value {
  font-size: var(--fs-xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.body-card__chart {
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 8px;
}
.body-card__chart svg {
  width: 100%;
  height: auto;
}

/* ─── Actions (two-up advice cards) ─── */
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}
.actions__card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
}
.actions__card h3 {
  font-size: var(--fs-base);
  font-weight: 700;
  margin-bottom: 14px;
}
.actions__card ol,
.actions__card ul {
  padding-left: 18px;
  display: grid;
  gap: 8px;
}
.actions__card li {
  font-size: var(--fs-base);
  line-height: 1.65;
  color: var(--ink-secondary);
}
.actions__card--warn {
  border-left: 3px solid var(--risk);
}
.actions--single {
  grid-template-columns: 1fr;
}

/* ─── Appendix (data boundaries + source confidence) ─── */
.appendix {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 28px;
  margin-bottom: 24px;
}
.appendix__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  margin-top: 20px;
}
.appendix h3 {
  font-size: var(--fs-base);
  font-weight: 700;
  margin-bottom: 12px;
}
.appendix__title {
  font-size: var(--fs-lg);
  font-weight: 700;
}
.appendix__list {
  padding-left: 18px;
  display: grid;
  gap: 6px;
}
.appendix__list li {
  font-size: var(--fs-sm);
  line-height: 1.65;
  color: var(--ink-secondary);
}
.confidence-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 10px;
}
.confidence-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid var(--border);
}
.confidence-list li div {
  display: grid;
  gap: 2px;
}
.confidence-list li strong {
  font-size: var(--fs-base);
}
.confidence-list li small {
  font-size: var(--fs-sm);
  color: var(--muted);
}
.disclaimer {
  margin-top: 24px;
  font-size: var(--fs-sm);
  line-height: 1.65;
  color: var(--faint);
}

/* ─── Assessment hero (visually matches .assessment-hero in BASE/TRAINING) ─── */
.assessment {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  margin-bottom: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
}
.assessment__main {
  padding: 28px 32px;
}
.assessment__main h1 {
  font-size: var(--fs-xl);
  font-weight: 700;
  margin-bottom: 14px;
}
.assessment__text {
  font-size: var(--fs-base);
  line-height: 1.8;
  color: var(--ink-secondary);
}
.assessment__aside {
  padding: 28px;
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
.scores {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}
.score-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 0;
  border-top: 1px solid var(--border);
}
.score-ring:first-child {
  border-top: none;
  padding-top: 0;
}
.score-ring__value {
  font-size: var(--fs-2xl);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.score-ring__label {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--muted);
}
.readiness-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: var(--fs-base);
  font-weight: 600;
}
.readiness--good { background: var(--positive-bg); color: var(--positive); }
.readiness--moderate { background: #FFF7ED; color: #D97706; }
.readiness--low { background: var(--risk-bg); color: var(--risk); }

/* ─── Insights section (cross-metric + behavioral cards) ─── */
.insights-section {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 28px;
  margin-bottom: 28px;
}
.insights-section h2 {
  font-size: var(--fs-lg);
  font-weight: 700;
  margin-bottom: 16px;
}
.insight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.insight-grid__title {
  font-size: var(--fs-base);
  font-weight: 600;
  margin-bottom: 12px;
}
.insight-card {
  padding: 14px 16px;
  background: var(--border-light);
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
}
.insight-card:last-child {
  margin-bottom: 0;
}
.insight-card p {
  font-size: var(--fs-base);
  line-height: 1.7;
  color: var(--ink-secondary);
}

/* ─── Utility ─── */
.section-intro {
  font-size: var(--fs-sm);
  line-height: 1.65;
  color: var(--ink-secondary);
  margin-bottom: 14px;
}

/* ─── Health-specific responsive rules ─── */
@media (max-width: 900px) {
  .assessment {
    grid-template-columns: 1fr;
  }
  .assessment__aside {
    border-left: 0;
    border-top: 1px solid var(--border);
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  .scores {
    flex-direction: row;
    justify-content: center;
  }
  .score-ring {
    border-top: none;
    padding-top: 0;
  }
  .module__body {
    grid-template-columns: 1fr;
  }
  .module__aside {
    border-left: 0;
    border-top: 1px solid var(--border);
  }
  .actions,
  .appendix__grid,
  .body-grid,
  .insight-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  :root {
    --fs-2xl: 24px;
    --fs-xl: 18px;
  }
  main {
    padding: 16px 12px 48px;
  }
  .assessment__main {
    padding: 20px 16px;
  }
  .assessment__aside {
    padding: 16px;
  }
  .module__header {
    padding: 14px 16px;
  }
  .module__chart,
  .module__aside {
    padding: 16px;
  }
  .insights-section,
  .appendix {
    padding: 20px 16px;
  }
  .actions__card {
    padding: 20px 16px;
  }
  .body-grid {
    padding: 16px;
  }
  /* Ledger on small screens: hide everything except name + latest + delta */
  .ledger th:nth-child(n+3),
  .ledger__row td:nth-child(n+4) {
    display: none;
  }
  .ledger__spark {
    display: none;
  }
  .activity-stats {
    grid-template-columns: 1fr;
  }
}

/* ─── Health print overrides (BASE_CSS already hides topbar/footer) ─── */
@media print {
  .actions__card,
  .appendix {
    box-shadow: none;
    break-inside: avoid;
  }
}
`;
