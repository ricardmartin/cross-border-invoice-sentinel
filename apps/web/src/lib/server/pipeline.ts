import 'server-only';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  flushObservability,
  getDeliveryNoteRepository,
  JsonFileDeliveryNoteRepository,
  processDocument,
  resumeClaimReview,
  setDeliveryNoteRepository,
  type ClaimReviewDecision,
  type DocumentFile,
} from '@sentinel/core';
import { DATA_DIR, getRecord, listSamples, readEntry, samplePath, saveRecord, UPLOADS_DIR, type DocumentRecord } from './data';

// Delivery notes must outlive a request: persist them next to the other app data.
const g = globalThis as { __sentinelRepoReady?: boolean };
if (!g.__sentinelRepoReady) {
  setDeliveryNoteRepository(new JsonFileDeliveryNoteRepository(join(DATA_DIR, 'delivery-notes.json')));
  g.__sentinelRepoReady = true;
}

const DEMO_RESTAURANT = 'demo-restaurant';

async function run(input: { file: DocumentFile & { name: string }; restaurantId: string }, source: DocumentRecord['source'], fileUrl: string, seeded: string[]) {
  const outcome = await processDocument(
    { file: input.file, restaurantId: input.restaurantId },
    { tags: ['web', source.kind === 'sample' ? `sample:${source.sampleId}` : 'upload'] },
  );
  await flushObservability();
  const record: DocumentRecord = {
    id: outcome.runId,
    createdAt: new Date().toISOString(),
    source,
    file: { url: fileUrl, mediaType: input.file.mediaType },
    state: outcome.state,
    result: outcome.result,
    seededDeliveryNotes: seeded,
  };
  await saveRecord(record);
  return record;
}

/**
 * Processes a dataset sample. If it is an invoice whose delivery notes exist in
 * the dataset, they are registered first as "already received" (their ground
 * truth and file), exactly as if they had been processed when the goods arrived.
 */
export async function processSample(sampleId: string): Promise<DocumentRecord> {
  const entry = await readEntry(sampleId);
  if (!entry) throw new Error(`Unknown sample ${sampleId}`);
  const restaurantId = entry.groundTruth.recipient.taxId ?? DEMO_RESTAURANT;

  const seeded: string[] = [];
  const notes = (await listSamples()).filter((s) => s.deliveryNoteFor === sampleId);
  for (const note of notes) {
    const noteEntry = (await readEntry(note.id))!;
    const repo = getDeliveryNoteRepository();
    const supplierTaxId = noteEntry.groundTruth.issuer.taxId!;
    if (await repo.find(restaurantId, supplierTaxId, noteEntry.groundTruth.documentNumber)) continue;
    await repo.save({
      restaurantId,
      supplierTaxId,
      number: noteEntry.groundTruth.documentNumber,
      country: noteEntry.country,
      document: noteEntry.groundTruth,
      file: { base64: (await readFile(samplePath(noteEntry))).toString('base64'), mediaType: noteEntry.mediaType },
      traceId: null,
      savedAt: new Date().toISOString(),
    });
    seeded.push(note.id);
  }

  const bytes = await readFile(samplePath(entry));
  return run(
    { file: { base64: bytes.toString('base64'), mediaType: entry.mediaType, name: entry.file }, restaurantId },
    { kind: 'sample', sampleId },
    `/api/files/sample/${sampleId}`,
    seeded,
  );
}

const ALLOWED = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

export async function processUpload(file: File): Promise<DocumentRecord> {
  if (!ALLOWED.has(file.type)) throw new Error(`Unsupported file type ${file.type || 'unknown'} (PDF, JPEG, PNG or WebP)`);
  if (file.size > 15 * 1024 * 1024) throw new Error('File larger than 15 MB');
  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadId = randomUUID();
  const ext = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1]!;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(join(UPLOADS_DIR, `${uploadId}.${ext}`), bytes);
  return run(
    { file: { base64: bytes.toString('base64'), mediaType: file.type, name: file.name }, restaurantId: DEMO_RESTAURANT },
    { kind: 'upload', fileName: file.name },
    `/api/files/upload/${uploadId}.${ext}`,
    [],
  );
}

export async function reviewClaim(id: string, decision: ClaimReviewDecision): Promise<DocumentRecord> {
  const record = await getRecord(id);
  if (!record) throw new Error(`Unknown document ${id}`);
  if (record.state !== 'awaiting_review') throw new Error('This claim was already decided');
  const result = await resumeClaimReview(id, decision);
  await flushObservability();
  const updated: DocumentRecord = { ...record, state: 'completed', result };
  await saveRecord(updated);
  return updated;
}
