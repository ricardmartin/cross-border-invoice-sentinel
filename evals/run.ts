/**
 * Eval runner: every dataset document goes through the real Mastra workflow
 * (triage → extraction with self-correction and cascade → validation → reconciliation → decision → claim).
 *   npm run evals -- [--country=es,fr,it|all] [--model=anthropic:claude-haiku-5-5] [--escalation=anthropic:claude-sonnet-5-5]
 *                    [--no-cascade] [--retries=2] [--limit=5] [--ids=es-001,es-002] [--concurrency=4] [--no-cache]
 *                    [--smoke] [--update-baseline]
 * Writes reports/runs/<runName>.{json,md} and reports/latest.md, then applies the gate
 * (thresholds.json + baseline.json) and exits 1 if any check fails.
 */
import { config as loadEnv } from 'dotenv';
import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ExtractedDocument, FinalStatus, ProcessDocumentResult } from '@sentinel/core';
import { evaluateGate, loadBaseline, loadThresholds, type GateCheck, type Metrics } from './gate';
import type { DatasetEntry, DatasetManifest } from './generator/types';
import { linkRunItem, syncDatasets } from './langfuseDatasets';
import { HEADER_FIELDS, LINE_FIELDS, compareDocuments, f1, percentile, type DocComparison } from './metrics';

const ROOT = import.meta.dirname;
loadEnv({ path: join(ROOT, '..', '.env'), quiet: true });
// Suspended claim reviews only need to live for the run.
process.env.MASTRA_DB_URL ??= ':memory:';
// Imported after the env is loaded: core wires Langfuse at module load.
const core = await import('@sentinel/core');
const { judgeClaim } = await import('./judge');

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const flag = (name: string) => process.argv.includes(`--${name}`);

const model = arg('model') ? core.parseModelSpec(arg('model')!) : core.defaultExtractionModel();
const escalation = arg('escalation') ? core.parseModelSpec(arg('escalation')!) : core.defaultEscalationModel();
const cascade = !flag('no-cascade');
const maxRetries = Number(arg('retries') ?? 2);
const countryArg = (arg('country') ?? 'all').toLowerCase();
// "all" = every dataset folder with a manifest, so a new country needs no change here.
const countries =
  countryArg === 'all'
    ? readdirSync(join(ROOT, 'datasets'))
        .filter((c) => existsSync(join(ROOT, 'datasets', c, 'manifest.json')))
        .sort()
    : countryArg.split(',');
const limit = arg('limit') ? Number(arg('limit')) : Infinity;
const smoke = flag('smoke');
const thresholds = loadThresholds();
const ids = smoke ? thresholds.smoke.ids : arg('ids')?.split(',');
const concurrency = Number(arg('concurrency') ?? 4);
const updateBaseline = flag('update-baseline');
const baseline = loadBaseline();
if (updateBaseline && (smoke || ids || limit !== Infinity)) throw new Error('--update-baseline needs a full run (no --smoke, --ids or --limit)');

const gitSha = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'nogit';
  }
})();
const prompt = await core.getExtractionPrompt();
const promptTag = prompt.langfuse ? `lf${prompt.langfuse.version}` : core.EXTRACTION_PROMPT_VERSION;
const runName = `${gitSha}-${model.key.replace(/[:/]/g, '_')}-${promptTag}${cascade ? '' : '-nocascade'}${smoke ? '-smoke' : ''}`;

// File-based LLM cache: re-running unchanged inputs costs nothing.
if (!flag('no-cache')) {
  const dir = join(ROOT, 'reports', 'cache', 'llm');
  await mkdir(dir, { recursive: true });
  core.setLlmCache({
    get: async (key) => (existsSync(join(dir, `${key}.json`)) ? JSON.parse(await readFile(join(dir, `${key}.json`), 'utf8')) : undefined),
    set: async (key, value) => writeFile(join(dir, `${key}.json`), JSON.stringify(value)),
  });
}

const POSITIVE: FinalStatus[] = ['SUPPLIER_DISCREPANCY', 'INVALID_TAX_ID'];

interface DocResult {
  id: string;
  country: string;
  template: string;
  mode: string;
  planted: string | null;
  expectedStatus: FinalStatus;
  error?: string;
  status?: FinalStatus;
  reason?: string;
  traceId?: string | null;
  triageCountryOk?: boolean;
  triageDocTypeOk?: boolean;
  attempts?: { index: number; role: string; model: string; blind?: boolean; passed: boolean; exact: boolean; errors: string[]; cached: boolean }[];
  firstExact?: boolean;
  comparison?: DocComparison;
  costUsd?: number | null;
  latencyMs?: number;
  allCached?: boolean;
  reconciliation?: string | null;
  expectedReconciliation?: string;
  claim?: {
    mode: string;
    amount: number;
    expectedAmount: number | null;
    judge: number;
    justification: string;
    invented: boolean;
    approved: boolean;
    subject: string;
  } | null;
}

async function loadEntries(country: string): Promise<DatasetEntry[]> {
  const dir = join(ROOT, 'datasets', country);
  const manifest = JSON.parse(await readFile(join(dir, 'manifest.json'), 'utf8')) as DatasetManifest;
  const entries = await Promise.all(manifest.entries.map(async (e) => JSON.parse(await readFile(join(dir, `${e.id}.json`), 'utf8')) as DatasetEntry));
  return entries.filter((e) => !ids || ids.includes(e.id)).slice(0, limit);
}

async function runOne(entry: DatasetEntry): Promise<DocResult> {
  const base: DocResult = { id: entry.id, country: entry.country, template: entry.template, mode: entry.variant.mode, planted: entry.planted?.type ?? null, expectedStatus: entry.expected.finalStatus };
  try {
    const bytes = await readFile(join(ROOT, 'datasets', entry.country.toLowerCase(), entry.file));
    const outcome = await core.processDocument(
      {
        file: { base64: bytes.toString('base64'), mediaType: entry.mediaType, name: entry.file },
        restaurantId: entry.groundTruth.recipient.taxId ?? 'eval-restaurant',
        config: { primaryModel: model.key, escalationModel: escalation.key, maxRetries, cascade },
      },
      { tags: ['eval', `eval-run:${runName}`, `fixture:${entry.id}`], metadata: { datasetItem: entry.id } },
    );
    let res: ProcessDocumentResult = outcome.result;
    let claim: DocResult['claim'] = null;
    if (outcome.state === 'awaiting_review' && res.claim) {
      // Judge the draft, then play the human: approve as is (exercises suspend → resume → simulated send).
      const draft = res.claim.draft;
      const verdict = await judgeClaim(draft);
      core.recordScores(res.traceId ?? undefined, { claim_judge: verdict.score }, { claim_judge: verdict.justification });
      res = await core.resumeClaimReview(outcome.runId, { action: 'approve', reviewer: 'eval-bot' });
      const expectedAmount =
        entry.expected.claimAmount ?? (entry.expected.finalStatus === 'SUPPLIER_DISCREPANCY' ? core.computeClaimAmount(entry.groundTruth, null, core.validateDocument(entry.groundTruth, core.getCountryPack(entry.country)).computed.charges).total : null);
      claim = {
        mode: draft.mode,
        amount: draft.amountClaimed,
        expectedAmount,
        judge: verdict.score,
        justification: verdict.justification,
        invented: verdict.inventedData,
        approved: res.claim?.review?.action === 'approve',
        subject: draft.subject,
      };
    }
    const pack = core.getCountryPack(entry.country);
    const attempts = res.attempts.map((a) => ({
      index: a.index,
      role: a.role,
      model: a.model,
      blind: a.blind,
      passed: a.report.passed,
      exact: compareDocuments(entry.groundTruth, a.document as ExtractedDocument, pack).exact,
      errors: a.report.issues.filter((i) => i.severity === 'error').map((i) => i.code),
      cached: a.cached,
    }));
    return {
      ...base,
      status: res.status,
      reason: res.reason,
      traceId: res.traceId,
      triageCountryOk: res.triage.country === entry.country,
      triageDocTypeOk: res.triage.docType === entry.groundTruth.docType,
      attempts,
      firstExact: attempts[0]?.exact ?? false,
      comparison: res.document ? compareDocuments(entry.groundTruth, res.document as ExtractedDocument, pack) : undefined,
      costUsd: res.totals.costUsd,
      latencyMs: res.totals.latencyMs,
      allCached: res.triage.cached && res.attempts.every((a) => a.cached),
      reconciliation: res.reconciliation?.result.status ?? null,
      expectedReconciliation: entry.expected.reconciliation,
      claim,
    };
  } catch (e) {
    return { ...base, error: e instanceof Error ? e.message : String(e) };
  }
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>, onDone: (r: R) => void): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]!);
        onDone(out[i]!);
      }
    }),
  );
  return out;
}

const ratio = (num: number, den: number) => (den ? num / den : null);

export type Metric = { value: number | null; kind: 'pct' | 'usd' | 'ms' | 'num' };

function summarize(results: DocResult[]) {
  const ok = results.filter((r) => r.status);
  const withDoc = ok.filter((r) => r.comparison);
  const tp = withDoc.reduce((s, r) => s + r.comparison!.lines.tp, 0);
  const fp = withDoc.reduce((s, r) => s + r.comparison!.lines.fp, 0);
  const fn = withDoc.reduce((s, r) => s + r.comparison!.lines.fn, 0);
  const gtLines = withDoc.reduce((s, r) => s + r.comparison!.lines.gtLines, 0);

  const expectedPos = ok.filter((r) => POSITIVE.includes(r.expectedStatus));
  const predictedPos = ok.filter((r) => POSITIVE.includes(r.status!));
  const truePos = predictedPos.filter((r) => POSITIVE.includes(r.expectedStatus));
  const clean = ok.filter((r) => r.expectedStatus === 'VALID');

  const lat = ok.map((r) => r.latencyMs!);
  const costs = ok.map((r) => r.costUsd).filter((c): c is number => c !== null && c !== undefined);
  const attempts = ok.map((r) => r.attempts!.length);
  const claims = ok.filter((r) => r.claim);
  const withRec = ok.filter((r) => r.expectedReconciliation);

  const headline: Record<string, Metric> = {
    'Documents 100 % correct (final)': { value: ratio(withDoc.filter((r) => r.comparison!.exact).length, ok.length), kind: 'pct' },
    'Documents 100 % correct (first read)': { value: ratio(ok.filter((r) => r.firstExact).length, ok.length), kind: 'pct' },
    'Line F1': { value: f1(tp, fp, fn), kind: 'pct' },
    'Final status correct': { value: ratio(ok.filter((r) => r.status === r.expectedStatus).length, ok.length), kind: 'pct' },
    'Discrepancy precision': { value: ratio(truePos.length, predictedPos.length), kind: 'pct' },
    'Discrepancy recall': { value: ratio(truePos.length, expectedPos.length), kind: 'pct' },
    'Unfair claims (false positives on clean docs)': { value: ratio(clean.filter((r) => POSITIVE.includes(r.status!)).length, clean.length), kind: 'pct' },
    'EXTRACTION_UNCERTAIN rate': { value: ratio(ok.filter((r) => r.status === 'EXTRACTION_UNCERTAIN').length, ok.length), kind: 'pct' },
    'Mean extraction attempts': { value: attempts.length ? attempts.reduce((a, b) => a + b, 0) / attempts.length : null, kind: 'num' },
    'Escalated to stronger model': { value: ratio(ok.filter((r) => r.attempts!.some((a) => a.role === 'escalation')).length, ok.length), kind: 'pct' },
    'Triage country accuracy': { value: ratio(ok.filter((r) => r.triageCountryOk).length, ok.length), kind: 'pct' },
    'Triage doc-type accuracy': { value: ratio(ok.filter((r) => r.triageDocTypeOk).length, ok.length), kind: 'pct' },
    'Reconciliation status correct': { value: ratio(withRec.filter((r) => r.reconciliation === r.expectedReconciliation).length, withRec.length), kind: 'pct' },
    'Claims drafted for SUPPLIER_DISCREPANCY': { value: ratio(claims.length, ok.filter((r) => r.status === 'SUPPLIER_DISCREPANCY').length), kind: 'pct' },
    'Claim amount correct': {
      value: ratio(claims.filter((r) => r.claim!.expectedAmount !== null && Math.abs(r.claim!.amount - r.claim!.expectedAmount) <= 0.011).length, claims.length),
      kind: 'pct',
    },
    'Claim drafts passing guardrails': { value: ratio(claims.filter((r) => r.claim!.mode === 'llm').length, claims.length), kind: 'pct' },
    'Claim judge score (1-5)': { value: claims.length ? claims.reduce((s, r) => s + r.claim!.judge, 0) / claims.length : null, kind: 'num' },
    'Claims with invented data': { value: ratio(claims.filter((r) => r.claim!.invented).length, claims.length), kind: 'pct' },
    'Cost / doc': { value: costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : null, kind: 'usd' },
    'Latency p50': { value: percentile(lat, 50), kind: 'ms' },
    'Latency p95': { value: percentile(lat, 95), kind: 'ms' },
    'Failed runs': { value: results.length - ok.length, kind: 'num' },
  };

  const headerAcc = Object.fromEntries(HEADER_FIELDS.map((f) => [f, ratio(withDoc.filter((r) => r.comparison!.header.find((h) => h.field === f)!.ok).length, withDoc.length)]));
  const lineAcc = Object.fromEntries(LINE_FIELDS.map((f) => [f, ratio(withDoc.reduce((s, r) => s + r.comparison!.lines.fieldHits[f], 0), gtLines)]));

  const statuses: FinalStatus[] = ['VALID', 'SUPPLIER_DISCREPANCY', 'INVALID_TAX_ID', 'EXTRACTION_UNCERTAIN'];
  const confusion = statuses.map((exp) => ({ expected: exp, ...Object.fromEntries(statuses.map((got) => [got, ok.filter((r) => r.expectedStatus === exp && r.status === got).length])) }));

  return { docs: results.length, headline, headerAcc, lineAcc, confusion };
}

const fmt = (m: Metric) =>
  m.value === null ? '—' : m.kind === 'pct' ? `${(m.value * 100).toFixed(1)} %` : m.kind === 'usd' ? `$${m.value.toFixed(5)}` : m.kind === 'ms' ? `${Math.round(m.value)} ms` : m.value.toFixed(2);

function markdown(results: DocResult[], s: ReturnType<typeof summarize>, byCountry: Record<string, ReturnType<typeof summarize>>, checks: GateCheck[]): string {
  const pct = (x: number | null) => (x === null ? '—' : `${(x * 100).toFixed(1)} %`);
  const row = (c: Record<string, unknown>) => `| ${c.expected} | ${c.VALID} | ${c.SUPPLIER_DISCREPANCY} | ${c.INVALID_TAX_ID} | ${c.EXTRACTION_UNCERTAIN} |`;
  return [
    `# Eval run \`${runName}\``,
    '',
    `Primary \`${model.key}\` · escalation ${cascade ? `\`${escalation.key}\`` : 'off'} · retries ${maxRetries} · prompt \`${prompt.version}\` · ${countries.join(', ').toUpperCase()} · ${s.docs} docs · ${new Date().toISOString()}`,
    '',
    '## Headline',
    '',
    '| Metric | Value |',
    '| --- | --- |',
    ...Object.entries(s.headline).map(([k, m]) => `| ${k} | ${fmt(m)} |`),
    '',
    '## By country',
    '',
    `| Metric | ${Object.keys(byCountry).join(' | ')} | Baseline |`,
    `| --- | ${Object.keys(byCountry).map(() => '---').join(' | ')} | --- |`,
    ...Object.keys(s.headline).map((k) => {
      const base = baseline ? Object.keys(byCountry).map((c) => baseline!.countries[c]?.[k]).map((v) => (v === undefined || v === null ? '—' : fmt({ value: v, kind: s.headline[k]!.kind }))).join(' / ') : '—';
      return `| ${k} | ${Object.values(byCountry).map((cs) => fmt(cs.headline[k]!)).join(' | ')} | ${base} |`;
    }),
    '',
    `## Gate (${checks.every((c) => c.passed) ? 'PASSED' : 'FAILED'})`,
    '',
    '| Country | Check | Metric | Value | Limit | |',
    '| --- | --- | --- | --- | --- | --- |',
    ...checks.map((c) => `| ${c.country} | ${c.kind} | ${c.metric} | ${c.value === null ? '—' : Number(c.value.toFixed(4))} | ${c.limit} | ${c.passed ? '✔' : '✖'} |`),
    '',
    '## Final status (rows: expected, columns: predicted)',
    '',
    '| Expected | VALID | SUPPLIER_DISCREPANCY | INVALID_TAX_ID | EXTRACTION_UNCERTAIN |',
    '| --- | --- | --- | --- | --- |',
    ...s.confusion.map(row),
    '',
    '## Claims (judged by LLM, then approved by eval-bot)',
    '',
    '| Doc | Amount | Expected | Draft | Judge | Justification |',
    '| --- | --- | --- | --- | --- | --- |',
    ...results
      .filter((r) => r.claim)
      .map((r) => {
        const c = r.claim!;
        const why = c.justification.replace(/\|/g, '/').replace(/\n/g, ' ');
        return `| ${r.id} | ${c.amount.toFixed(2)} | ${c.expectedAmount?.toFixed(2) ?? '—'} | ${c.mode} | ${c.judge}/5${c.invented ? ' ⚠ invented data' : ''} | ${why} |`;
      }),
    '',
    '## Field accuracy (final read)',
    '',
    '| Field | Accuracy |',
    '| --- | --- |',
    ...Object.entries(s.headerAcc).map(([f, v]) => `| ${f} | ${pct(v)} |`),
    ...Object.entries(s.lineAcc).map(([f, v]) => `| lines.${f} | ${pct(v)} |`),
    '',
    '## Documents worth a look',
    '',
    ...results
      .filter(
        (r) =>
          r.error ||
          r.status !== r.expectedStatus ||
          (r.comparison && !r.comparison.exact) ||
          (r.attempts?.length ?? 0) > 1 ||
          (r.expectedReconciliation !== undefined && r.reconciliation !== r.expectedReconciliation),
      )
      .flatMap((r) => [
        `- **${r.id}** (${r.template}, ${r.mode}${r.planted ? `, planted ${r.planted}` : ''}) expected ${r.expectedStatus} → **${r.status ?? 'ERROR'}**${r.error ? `: ${r.error}` : ` — ${r.reason}`}${
          r.expectedReconciliation ? ` · reconciliation ${r.reconciliation ?? '—'} (expected ${r.expectedReconciliation})` : ''
        }${r.traceId ? ` · trace \`${r.traceId}\`` : ''}`,
        ...(r.attempts ?? []).map((a) => `  - #${a.index} ${a.role}${a.blind ? ' (blind)' : ''} ${a.model}:${a.passed ? 'pass' : a.errors.join(', ')}${a.exact ? ' · exact' : ''}`),
        ...(r.comparison?.mismatches.slice(0, 4).map((m) => `  - ≠ ${m}`) ?? []),
      ]),
    '',
  ].join('\n');
}

const metricValues = (s: ReturnType<typeof summarize>): Metrics => Object.fromEntries(Object.entries(s.headline).map(([k, m]) => [k, m.value]));

async function main() {
  const entries = (await Promise.all(countries.map(loadEntries))).flat();
  console.log(`▶ ${runName} — ${entries.length} docs (${countries.join(', ').toUpperCase()}) — prompt ${prompt.version} — Langfuse ${core.isLangfuseConfigured() ? 'on' : 'off'}`);
  const lf = core.getLangfuseClient();
  if (lf) await syncDatasets(lf, entries);

  let done = 0;
  const log = (r: DocResult) => {
    done++;
    const mark = r.error ? '✖' : r.status === r.expectedStatus ? '✔' : '≠';
    const tries = r.attempts ? ` ${r.attempts.length} read(s)` : '';
    const rec = r.reconciliation ? ` · ${r.reconciliation}` : '';
    const claim = r.claim ? ` · claim ${r.claim.amount.toFixed(2)} judge ${r.claim.judge}/5` : '';
    process.stdout.write(`  ${mark} ${r.id} ${r.status ?? ''}${tries}${rec}${claim}${r.allCached ? ' (cached)' : ''}${r.error ? ` ${r.error.slice(0, 160)}` : ''}  [${done}/${entries.length}]\n`);
  };
  // Delivery notes first: invoices look them up when they are reconciled.
  const isNote = (e: DatasetEntry) => e.groundTruth.docType === 'DELIVERY_NOTE';
  const results = [
    ...(await pool(entries.filter(isNote), concurrency, runOne, log)),
    ...(await pool(entries.filter((e) => !isNote(e)), concurrency, runOne, log)),
  ].sort((a, b) => a.id.localeCompare(b.id));

  // Experiment run in Langfuse: every trace linked to its dataset item under this run name.
  if (lf) for (const r of results) if (r.traceId) await linkRunItem(lf, runName, r.id, r.traceId, { status: r.status, expected: r.expectedStatus });
  await core.flushObservability();

  const summary = summarize(results);
  const byCountry = Object.fromEntries([...new Set(results.map((r) => r.country))].sort().map((c) => [c, summarize(results.filter((r) => r.country === c))]));
  const perCountryValues = Object.fromEntries(Object.entries(byCountry).map(([c, cs]) => [c, metricValues(cs)]));
  const checks = evaluateGate(perCountryValues, thresholds, baseline, { smoke });

  await mkdir(join(ROOT, 'reports', 'runs'), { recursive: true });
  const md = markdown(results, summary, byCountry, checks);
  const config = { model: model.key, escalation: cascade ? escalation.key : null, maxRetries, promptVersion: prompt.version, smoke };
  await writeFile(join(ROOT, 'reports', 'runs', `${runName}.json`), JSON.stringify({ runName, createdAt: new Date().toISOString(), config, summary, byCountry, checks, results }, null, 2));
  await writeFile(join(ROOT, 'reports', 'runs', `${runName}.md`), md);
  await writeFile(join(ROOT, 'reports', 'latest.md'), md);
  console.log('\n' + md.split('## Final status')[0]);

  if (updateBaseline) {
    await writeFile(
      join(ROOT, 'baseline.json'),
      JSON.stringify({ runName, createdAt: new Date().toISOString(), config, countries: perCountryValues }, null, 2) + '\n',
    );
    console.log(`✔ baseline.json updated from ${runName}`);
    return;
  }
  const failed = checks.filter((c) => !c.passed);
  if (failed.length) {
    console.error(`✖ GATE FAILED: ${failed.map((c) => `${c.country} ${c.metric} = ${c.value} (${c.limit})`).join('; ')}`);
    process.exit(1);
  }
  console.log('✔ GATE PASSED');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
