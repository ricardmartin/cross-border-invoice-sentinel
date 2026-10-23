import 'server-only';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ExtractedDocument, ProcessDocumentResult } from '@sentinel/core';
import { DEMO } from '@/lib/demo';

/** Filesystem layout: the evals datasets (read-only samples) and the app's own .data folder. */
const WEB_DIR = process.env.SENTINEL_WEB_DIR ?? process.cwd();
export const REPO_ROOT = join(WEB_DIR, '..', '..');
export const DATASETS_DIR = join(REPO_ROOT, 'evals', 'datasets');
export const REPORTS_DIR = join(REPO_ROOT, 'evals', 'reports');
export const DATA_DIR = join(WEB_DIR, '.data');
// The read-only demo shows the records committed with the app instead of the local ones.
const RECORDS_DIR = DEMO ? join(WEB_DIR, 'demo', 'records') : join(DATA_DIR, 'records');
export const UPLOADS_DIR = join(DATA_DIR, 'uploads');

// ---------------------------------------------------------------------------
// Dataset samples
// ---------------------------------------------------------------------------

export interface Sample {
  id: string;
  country: string;
  file: string;
  mediaType: string;
  template: string;
  mode: string;
  supplier: string;
  docType: ExtractedDocument['docType'];
  documentNumber: string;
  planted: string | null;
  deliveryNoteFor: string | null;
  expectedStatus: string;
  issueDate: string;
  recipient: string;
  printedTotal: number | null;
  currency: string;
  /** Surcharges, withholdings or stamp duty printed on the document. */
  hasCharges: boolean;
}

export interface DatasetEntryJson {
  id: string;
  country: string;
  file: string;
  mediaType: string;
  template: string;
  variant: { mode: string };
  groundTruth: ExtractedDocument;
  planted: { type: string; description: string } | null;
  expected: { finalStatus: string; issueCodes: string[]; reconciliation?: string; claimAmount?: number };
  deliveryNoteFor?: string;
}

export async function readEntry(id: string): Promise<DatasetEntryJson | null> {
  const country = id.slice(0, 2);
  if (!/^[a-z]{2}-\d{3}$/.test(id)) return null;
  const path = join(DATASETS_DIR, country, `${id}.json`);
  return existsSync(path) ? (JSON.parse(await readFile(path, 'utf8')) as DatasetEntryJson) : null;
}

export async function listSamples(): Promise<Sample[]> {
  if (!existsSync(DATASETS_DIR)) return [];
  const out: Sample[] = [];
  for (const country of await readdir(DATASETS_DIR)) {
    const dir = join(DATASETS_DIR, country);
    for (const f of (await readdir(dir)).filter((x) => /^[a-z]{2}-\d{3}\.json$/.test(x)).sort()) {
      const e = JSON.parse(await readFile(join(dir, f), 'utf8')) as DatasetEntryJson;
      out.push({
        id: e.id,
        country: e.country,
        file: e.file,
        mediaType: e.mediaType,
        template: e.template,
        mode: e.variant.mode,
        supplier: e.groundTruth.issuer.name,
        docType: e.groundTruth.docType,
        documentNumber: e.groundTruth.documentNumber,
        planted: e.planted?.type ?? null,
        deliveryNoteFor: e.deliveryNoteFor ?? null,
        expectedStatus: e.expected.finalStatus,
        issueDate: e.groundTruth.issueDate,
        recipient: e.groundTruth.recipient.name,
        printedTotal: e.groundTruth.printedTotal,
        currency: e.groundTruth.currency,
        hasCharges: (e.groundTruth.printedCharges ?? []).length > 0,
      });
    }
  }
  return out;
}

export const samplePath = (s: { id: string; file: string }) => join(DATASETS_DIR, s.id.slice(0, 2), s.file);

// ---------------------------------------------------------------------------
// Processed documents
// ---------------------------------------------------------------------------

export interface DocumentRecord {
  id: string;
  createdAt: string;
  source: { kind: 'sample'; sampleId: string } | { kind: 'upload'; fileName: string };
  file: { url: string; mediaType: string };
  state: 'completed' | 'awaiting_review';
  result: ProcessDocumentResult;
  /** Delivery notes loaded from the dataset as "already received" before processing this invoice. */
  seededDeliveryNotes: string[];
}

export async function saveRecord(record: DocumentRecord): Promise<void> {
  await mkdir(RECORDS_DIR, { recursive: true });
  await writeFile(join(RECORDS_DIR, `${record.id}.json`), JSON.stringify(record));
}

export async function getRecord(id: string): Promise<DocumentRecord | null> {
  if (!/^[\w-]+$/.test(id)) return null;
  const path = join(RECORDS_DIR, `${id}.json`);
  return existsSync(path) ? (JSON.parse(await readFile(path, 'utf8')) as DocumentRecord) : null;
}

export async function listRecords(): Promise<DocumentRecord[]> {
  if (!existsSync(RECORDS_DIR)) return [];
  const records = await Promise.all((await readdir(RECORDS_DIR)).map(async (f) => JSON.parse(await readFile(join(RECORDS_DIR, f), 'utf8')) as DocumentRecord));
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
