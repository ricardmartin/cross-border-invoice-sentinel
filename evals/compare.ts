/**
 * Compares two eval runs (baseline vs candidate).
 *   npm run evals:compare -- <baselineRunName> <candidateRunName>
 * Writes reports/compare/<baseline>__vs__<candidate>.md
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = import.meta.dirname;

interface RunFile {
  runName: string;
  summary: {
    docs: number;
    failed: number;
    exactRate: number | null;
    lineF1: number;
    headerAcc: Record<string, number | null>;
    lineAcc: Record<string, number | null>;
    validator: { cleanFlagRate: number | null; catchRateOnWrongExtractions: number | null; plantedRecall: number | null };
    latencyMs: { p50: number | null; p95: number | null };
    costUsd: { perDoc: number | null; total: number };
  };
  results: { id: string; error?: string; comparison?: { exact: boolean; mismatches: string[] }; validatorErrors: string[] }[];
}

const load = async (name: string) => JSON.parse(await readFile(join(ROOT, 'reports', 'runs', `${name}.json`), 'utf8')) as RunFile;
const pct = (x: number | null) => (x === null ? '—' : `${(x * 100).toFixed(1)} %`);
const pts = (a: number | null, b: number | null) => (a === null || b === null ? '—' : `${((b - a) * 100 >= 0 ? '+' : '')}${((b - a) * 100).toFixed(1)} pts`);
const usd = (x: number | null) => (x === null ? '—' : `$${x.toFixed(5)}`);

async function main() {
  const [baseName, candName] = process.argv.slice(2);
  if (!baseName || !candName) throw new Error('Usage: compare.ts <baselineRunName> <candidateRunName>');
  const [a, b] = await Promise.all([load(baseName), load(candName)]);
  const A = a.summary;
  const B = b.summary;

  const rows: [string, string, string, string][] = [
    ['Documents 100 % correct', pct(A.exactRate), pct(B.exactRate), pts(A.exactRate, B.exactRate)],
    ['Line F1', pct(A.lineF1), pct(B.lineF1), pts(A.lineF1, B.lineF1)],
    ['Validator flags clean docs', pct(A.validator.cleanFlagRate), pct(B.validator.cleanFlagRate), pts(A.validator.cleanFlagRate, B.validator.cleanFlagRate)],
    ['Planted errors detected', pct(A.validator.plantedRecall), pct(B.validator.plantedRecall), pts(A.validator.plantedRecall, B.validator.plantedRecall)],
    ['Cost / doc', usd(A.costUsd.perDoc), usd(B.costUsd.perDoc), A.costUsd.perDoc && B.costUsd.perDoc ? `${(((B.costUsd.perDoc - A.costUsd.perDoc) / A.costUsd.perDoc) * 100).toFixed(0)} %` : '—'],
    ['Latency p50', `${A.latencyMs.p50} ms`, `${B.latencyMs.p50} ms`, A.latencyMs.p50 && B.latencyMs.p50 ? `${B.latencyMs.p50 - A.latencyMs.p50} ms` : '—'],
    ['Latency p95', `${A.latencyMs.p95} ms`, `${B.latencyMs.p95} ms`, A.latencyMs.p95 && B.latencyMs.p95 ? `${B.latencyMs.p95 - A.latencyMs.p95} ms` : '—'],
    ['Failed calls', String(A.failed), String(B.failed), String(B.failed - A.failed)],
  ];
  const fieldRows = [...Object.keys(A.headerAcc).map((f) => [f, A.headerAcc[f]!, B.headerAcc[f]!] as const), ...Object.keys(A.lineAcc).map((f) => [`lines.${f}`, A.lineAcc[f]!, B.lineAcc[f]!] as const)]
    .filter(([, x, y]) => x !== y)
    .map(([f, x, y]) => `| ${f} | ${pct(x)} | ${pct(y)} | ${pts(x, y)} |`);

  const byId = new Map(a.results.map((r) => [r.id, r]));
  const flips = b.results
    .map((r) => ({ id: r.id, before: byId.get(r.id)?.comparison?.exact ?? false, after: r.comparison?.exact ?? false, r }))
    .filter((x) => x.before !== x.after);

  const md = [
    `# \`${a.runName}\` → \`${b.runName}\``,
    '',
    '| Metric | Baseline | Candidate | Δ |',
    '| --- | --- | --- | --- |',
    ...rows.map((r) => `| ${r.join(' | ')} |`),
    '',
    '## Fields that changed',
    '',
    ...(fieldRows.length ? ['| Field | Baseline | Candidate | Δ |', '| --- | --- | --- | --- |', ...fieldRows] : ['None.']),
    '',
    '## Documents that changed',
    '',
    ...(flips.length
      ? flips.map((x) => `- ${x.after ? '✔ fixed' : '✖ regressed'} **${x.id}**${x.after ? '' : `: ${x.r.comparison?.mismatches.slice(0, 3).join('; ') ?? x.r.error}`}`)
      : ['None.']),
    '',
  ].join('\n');

  await mkdir(join(ROOT, 'reports', 'compare'), { recursive: true });
  await writeFile(join(ROOT, 'reports', 'compare', `${a.runName}__vs__${b.runName}.md`), md);
  console.log(md);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
