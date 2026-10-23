/**
 * Synthetic dataset generator.
 *   npm run gen:dataset -- --country=es|fr|it|all [--seed=42] [--append]   ("all" = ES + every entry in COUNTRY_CONFIGS)
 *   --append keeps the files of documents that did not change and renders only new or changed ones.
 * Writes evals/datasets/<country>/<id>.{pdf,jpg} + <id>.json (ground truth) + manifest.json.
 * Generation is deterministic: same seed → same documents, byte for byte.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { buildChargeDocs, buildCountryDataset, buildRegionalDocs } from './build';
import { ES_REGIONAL_CONFIG } from './locales-more';
import { buildEsDeliveryScenarios, buildEsDocuments, type BuiltDoc } from './es/build';
import { ES_TEMPLATES, type Paper } from './es/templates';
import { COUNTRY_CONFIGS } from './locales';
import { renderDocument } from './render';
import { renderLocalized } from './templates';
import type { DatasetEntry, DatasetManifest } from './types';

const arg = (name: string, fallback: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;

const seed = Number(arg('seed', '42'));
const requested = arg('country', 'all').toLowerCase();
const countries = requested === 'all' ? ['es', ...Object.keys(COUNTRY_CONFIGS)] : requested.split(',');
const append = process.argv.includes('--append');
const GENERATOR_VERSION = 'gen@2.0.0';

const readEntry = async (path: string): Promise<DatasetEntry | null> => {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as DatasetEntry;
  } catch {
    return null;
  }
};
const ES_BASE_COUNT = 30;

interface Planned extends BuiltDoc {
  render: () => Paper;
  reconciliation?: DatasetEntry['expected']['reconciliation'];
  claimAmount?: number;
  deliveryNoteFor?: string;
}

function planEs(): Planned[] {
  const out: Planned[] = buildEsDocuments(seed, ES_BASE_COUNT).map((d) => ({ ...d, render: () => ES_TEMPLATES[d.supplier.template as keyof typeof ES_TEMPLATES](d) }));
  // Delivery-note scenarios: own RNG stream, appended after the base documents (keeps es-001..es-030 stable).
  for (const sc of buildEsDeliveryScenarios(seed + 1000, ES_BASE_COUNT + 1)) {
    out.push({ ...sc.invoice, render: () => ES_TEMPLATES[sc.invoice.supplier.template as keyof typeof ES_TEMPLATES](sc.invoice), reconciliation: sc.expectedReconciliation, claimAmount: sc.claimAmount });
    if (sc.deliveryNote) out.push({ ...sc.deliveryNote, render: () => ES_TEMPLATES.albaran(sc.deliveryNote!), deliveryNoteFor: sc.invoice.id });
  }
  // Canarias (IGIC): generic templates with Spanish labels, appended after everything else.
  const cfg = ES_REGIONAL_CONFIG;
  for (const d of buildRegionalDocs(cfg, seed + 500, out.length + 1).docs) {
    out.push({ ...d, render: () => renderLocalized(d, { ...cfg.labels, ...d.labels }, cfg.pack, d.refDate) });
  }
  // Recargo de equivalencia and retención IRPF: after the regions, own RNG stream.
  for (const d of buildChargeDocs(cfg, seed + 700, out.length + 1).docs) {
    out.push({ ...d, render: () => renderLocalized(d, { ...cfg.labels, ...d.labels }, cfg.pack, d.refDate) });
  }
  return out;
}

function planCountry(code: string): Planned[] {
  const cfg = COUNTRY_CONFIGS[code];
  if (!cfg) throw new Error(`No generator config for "${code}": add one to COUNTRY_CONFIGS in generator/locales.ts`);
  return buildCountryDataset(cfg, seed + cfg.seedOffset, cfg.baseCount).docs.map((d) => ({
    ...d,
    render: () => renderLocalized(d, { ...cfg.labels, ...d.labels }, cfg.pack, d.refDate),
    reconciliation: d.expectedReconciliation,
    claimAmount: d.claimAmount,
    deliveryNoteFor: d.deliveryNoteFor,
  }));
}

async function generate(browser: Browser, country: string) {
  const outDir = join(import.meta.dirname, '..', 'datasets', country);
  await mkdir(outDir, { recursive: true });
  // Keep hand-added real documents (real-*); regenerate synthetic ones (or, with --append, only the new ones).
  if (!append) for (const f of await readdir(outDir)) if (f.startsWith(`${country}-`)) await rm(join(outDir, f));

  const plan = country === 'es' ? planEs() : planCountry(country);
  const entries: DatasetEntry[] = [];
  for (const doc of plan) {
    const prev = append ? await readEntry(join(outDir, `${doc.id}.json`)) : null;
    if (prev && JSON.stringify(prev.groundTruth) === JSON.stringify(doc.groundTruth) && JSON.stringify(prev.variant) === JSON.stringify(doc.variant)) {
      // Same document as before: keep its rendered bytes (a re-render changes them, which invalidates the LLM cache).
      entries.push(prev);
      continue;
    }
    const { data, ext } = await renderDocument(browser, doc.render(), doc.variant);
    const file = `${doc.id}.${ext}`;
    await writeFile(join(outDir, file), data);
    const isNote = doc.groundTruth.docType === 'DELIVERY_NOTE';
    const entry: DatasetEntry = {
      id: doc.id,
      country: country.toUpperCase(),
      source: 'synthetic',
      file,
      mediaType: ext === 'pdf' ? 'application/pdf' : 'image/jpeg',
      supplierId: doc.supplier.id,
      template: isNote ? (country === 'es' ? 'albaran' : 'delivery-note') : doc.supplier.template,
      variant: doc.variant,
      groundTruth: doc.groundTruth,
      planted: doc.planted,
      expected: {
        issueCodes: doc.expectedCodes,
        finalStatus: !doc.planted ? 'VALID' : doc.planted.type === 'TAX_ID_CHECKSUM' ? 'INVALID_TAX_ID' : 'SUPPLIER_DISCREPANCY',
        ...(doc.reconciliation ? { reconciliation: doc.reconciliation, claimAmount: doc.claimAmount ?? 0 } : {}),
      },
      ...(doc.deliveryNoteFor ? { deliveryNoteFor: doc.deliveryNoteFor } : {}),
    };
    await writeFile(join(outDir, `${doc.id}.json`), JSON.stringify(entry, null, 2) + '\n');
    entries.push(entry);
    process.stdout.write('.');
  }

  // Hand-added real documents (real-<n>.json + its file) stay in the manifest so the runner evaluates them.
  for (const f of (await readdir(outDir)).filter((f) => f.startsWith('real-') && f.endsWith('.json')).sort()) {
    entries.push(JSON.parse(await readFile(join(outDir, f), 'utf8')) as DatasetEntry);
  }

  const manifest: DatasetManifest = {
    country: country.toUpperCase(),
    generator: GENERATOR_VERSION,
    seed,
    generatedAt: '2026-10-18', // fixed: the manifest must not change when the documents don't
    entries: entries.map(({ groundTruth: _gt, ...rest }) => rest),
  };
  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const by = (f: (e: DatasetEntry) => string) => entries.reduce<Record<string, number>>((acc, e) => ((acc[f(e)] = (acc[f(e)] ?? 0) + 1), acc), {});
  console.log(`\n✔ ${entries.length} ${country.toUpperCase()} documents`);
  console.log('  types   ', by((e) => e.groundTruth.docType));
  console.log('  planted ', by((e) => e.planted?.type ?? 'none'));
  console.log('  modes   ', by((e) => e.variant.mode));
}

async function main() {
  const browser = await chromium.launch();
  try {
    for (const c of countries) await generate(browser, c);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
