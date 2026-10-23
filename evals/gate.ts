import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Regression gate: absolute thresholds per country plus "no metric drops more
 * than N points vs the stored baseline". Pure functions over metric maps so
 * the runner, CI and tests share one implementation.
 */

export type Metrics = Record<string, number | null>;
type Bound = { min?: number; max?: number };

export interface ThresholdsFile {
  default: Record<string, Bound>;
  countries: Record<string, Record<string, Bound>>;
  regression: { maxDropPts: number; metrics: string[] };
  smoke: { thresholds: Record<string, Bound>; ids: string[] };
}

export interface BaselineFile {
  runName: string;
  createdAt: string;
  config: Record<string, unknown>;
  countries: Record<string, Metrics>;
}

export interface GateCheck {
  country: string;
  metric: string;
  kind: 'threshold' | 'regression';
  value: number | null;
  limit: string;
  passed: boolean;
}

const ROOT = import.meta.dirname;
export const loadThresholds = (path = join(ROOT, 'thresholds.json')) => JSON.parse(readFileSync(path, 'utf8')) as ThresholdsFile;
export const loadBaseline = (path = join(ROOT, 'baseline.json')): BaselineFile | null => (existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as BaselineFile) : null);

export function evaluateGate(
  perCountry: Record<string, Metrics>,
  thresholds: ThresholdsFile,
  baseline: BaselineFile | null,
  opts: { smoke?: boolean } = {},
): GateCheck[] {
  const checks: GateCheck[] = [];
  for (const [country, metrics] of Object.entries(perCountry)) {
    const bounds = opts.smoke ? thresholds.smoke.thresholds : { ...thresholds.default, ...(thresholds.countries[country] ?? {}) };
    for (const [metric, b] of Object.entries(bounds)) {
      const value = metrics[metric] ?? null;
      if (value === null) continue; // metric not applicable (e.g. no claims in a subset)
      const passed = (b.min === undefined || value >= b.min - 1e-9) && (b.max === undefined || value <= b.max + 1e-9);
      checks.push({ country, metric, kind: 'threshold', value, limit: [b.min !== undefined ? `≥ ${b.min}` : '', b.max !== undefined ? `≤ ${b.max}` : ''].filter(Boolean).join(' '), passed });
    }
    // Regressions only make sense on the full dataset the baseline was measured on.
    const base = baseline?.countries[country];
    if (opts.smoke || !base) continue;
    for (const metric of thresholds.regression.metrics) {
      const value = metrics[metric] ?? null;
      const ref = base[metric] ?? null;
      if (value === null || ref === null) continue;
      const dropPts = (ref - value) * 100;
      checks.push({
        country,
        metric,
        kind: 'regression',
        value,
        limit: `≥ ${(ref * 100 - thresholds.regression.maxDropPts).toFixed(1)} % (baseline ${(ref * 100).toFixed(1)} %)`,
        passed: dropPts <= thresholds.regression.maxDropPts + 1e-9,
      });
    }
  }
  return checks;
}
