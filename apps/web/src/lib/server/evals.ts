import 'server-only';
import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { REPO_ROOT, REPORTS_DIR } from './data';

export type MetricKind = 'pct' | 'usd' | 'ms' | 'num';
export interface Metric {
  value: number | null;
  kind: MetricKind;
}
export interface GateCheck {
  country: string;
  metric: string;
  kind: 'threshold' | 'regression';
  value: number | null;
  limit: string;
  passed: boolean;
}

interface RunFile {
  runName: string;
  /** When the run finished. Older reports lack it; file dates are no substitute (git rewrites them on checkout). */
  createdAt?: string;
  config: { model: string; escalation: string | null; maxRetries: number; promptVersion: string; smoke?: boolean };
  summary: { docs: number; headline: Record<string, Metric> };
  byCountry?: Record<string, { docs: number; headline: Record<string, Metric> }>;
  checks?: GateCheck[];
}

export interface RunInfo extends RunFile {
  file: string;
  modifiedAt: string;
  /** Full runs over every country are comparable; smoke and ablation runs are not. */
  comparable: boolean;
}

export interface EvalsView {
  latest: RunInfo | null;
  /** Latest comparable run per model, for the model comparison table. */
  byModel: RunInfo[];
  runs: RunInfo[];
  baseline: { runName: string; createdAt: string; countries: Record<string, Record<string, number | null>> } | null;
}

export async function loadEvals(): Promise<EvalsView> {
  const dir = join(REPORTS_DIR, 'runs');
  const runs: RunInfo[] = [];
  if (existsSync(dir)) {
    for (const f of (await readdir(dir)).filter((x) => x.endsWith('.json'))) {
      const run = JSON.parse(await readFile(join(dir, f), 'utf8')) as RunFile;
      if (!run.byCountry) continue; // pre-phase-5 runs had no per-country breakdown
      const comparable = !run.config.smoke && run.config.maxRetries >= 1 && Object.keys(run.byCountry).length > 1;
      runs.push({ ...run, file: f, modifiedAt: run.createdAt ? new Date(run.createdAt).toISOString() : (await stat(join(dir, f))).mtime.toISOString(), comparable });
    }
  }
  runs.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  const comparable = runs.filter((r) => r.comparable);
  const byModel = [...new Map(comparable.map((r) => [r.config.model, r])).values()]; // first = latest per model
  const baselinePath = join(REPO_ROOT, 'evals', 'baseline.json');
  const baseline = existsSync(baselinePath) ? JSON.parse(await readFile(baselinePath, 'utf8')) : null;
  return { latest: comparable[0] ?? runs[0] ?? null, byModel, runs, baseline };
}

// ---------------------------------------------------------------------------
// Per-document results of one run
// ---------------------------------------------------------------------------

/** One document of an eval run, as evals/run.ts writes it (subset the app reads). */
export interface DocResult {
  id: string;
  country: string;
  template: string;
  mode: string;
  planted: string | null;
  expectedStatus: string;
  error?: string;
  status?: string;
  reason?: string;
  attempts?: { index: number; role: string; model: string; blind?: boolean; passed: boolean; exact: boolean; errors: string[]; cached: boolean }[];
  comparison?: { exact: boolean; mismatches: string[] };
  costUsd?: number | null;
  latencyMs?: number;
  reconciliation?: string | null;
  expectedReconciliation?: string;
  claim?: { mode: string; amount: number; expectedAmount: number | null; judge: number; justification: string; invented: boolean; subject: string } | null;
}

export interface RunResults {
  run: RunInfo;
  results: DocResult[];
}

/** Results of `file` (one of the listed runs), or of the latest comparable run. */
export async function loadRunResults(file?: string): Promise<RunResults | null> {
  const { latest, runs } = await loadEvals();
  const run = (file && runs.find((r) => r.file === file)) || latest;
  if (!run) return null;
  const json = JSON.parse(await readFile(join(REPORTS_DIR, 'runs', run.file), 'utf8')) as { results?: DocResult[] };
  return { run, results: json.results ?? [] };
}

/** The document passed when its final status is the expected one (and so is its reconciliation, if any). */
export const resultOk = (r: DocResult) =>
  !r.error && r.status === r.expectedStatus && (!r.expectedReconciliation || r.reconciliation === r.expectedReconciliation);
