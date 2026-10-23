import type { LangfuseClient } from '@langfuse/client';
import type { DatasetEntry } from './generator/types';

/**
 * Mirrors the local datasets in Langfuse (one dataset per country) and links
 * every eval trace to its item as an experiment run, so runs can be compared
 * side by side in the Langfuse UI. No-op without Langfuse keys.
 */

export const datasetName = (country: string) => `invoice-sentinel-${country.toLowerCase()}`;

export async function syncDatasets(lf: LangfuseClient, entries: DatasetEntry[]): Promise<void> {
  for (const country of [...new Set(entries.map((e) => e.country))]) {
    await lf.api.datasets.create({ name: datasetName(country), description: `Synthetic ${country} supplier documents with exact ground truth`, metadata: { country } });
  }
  for (const e of entries) {
    await lf.api.datasetItems.create({
      datasetName: datasetName(e.country),
      id: e.id,
      input: { file: e.file, mediaType: e.mediaType, template: e.template, variant: e.variant },
      expectedOutput: { document: e.groundTruth, expected: e.expected },
      metadata: { source: e.source, planted: e.planted?.type ?? null, deliveryNoteFor: e.deliveryNoteFor ?? null },
    });
  }
}

export async function linkRunItem(lf: LangfuseClient, runName: string, itemId: string, traceId: string, metadata: Record<string, unknown>): Promise<void> {
  await lf.api.datasetRunItems.create({ runName, datasetItemId: itemId, traceId, metadata });
}
