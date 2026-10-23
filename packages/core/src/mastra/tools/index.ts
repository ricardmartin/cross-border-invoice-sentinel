import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { matchSku } from '../../catalog/catalogMatcher';
import { getDeliveryNoteRepository } from '../../delivery/repository';
import { ExtractedDocumentSchema } from '../../schemas/extracted';

/**
 * Mastra tools. The workflow calls them deterministically from its steps
 * (no LLM decides when); exposing them as tools also makes them available to
 * agents and to the Mastra playground.
 */

export const catalogMatcherTool = createTool({
  id: 'catalog-matcher',
  description: "Maps a supplier line description to the restaurant's catalog SKU.",
  inputSchema: z.object({ descriptions: z.array(z.string()) }),
  outputSchema: z.object({
    matches: z.array(z.object({ description: z.string(), sku: z.string().nullable(), name: z.string().nullable(), confidence: z.number() })),
  }),
  execute: async ({ descriptions }) => ({
    matches: descriptions.map((description) => {
      const m = matchSku(description);
      return { description, sku: m?.sku ?? null, name: m?.name ?? null, confidence: m?.confidence ?? 0 };
    }),
  }),
});

export const getDeliveryNoteTool = createTool({
  id: 'get-delivery-note',
  description: 'Looks up a previously processed delivery note by restaurant, supplier tax id and delivery-note number.',
  inputSchema: z.object({ restaurantId: z.string(), supplierTaxId: z.string(), number: z.string() }),
  outputSchema: z.object({ found: z.boolean(), number: z.string(), document: ExtractedDocumentSchema.nullable(), traceId: z.string().nullable() }),
  execute: async ({ restaurantId, supplierTaxId, number }) => {
    const rec = await getDeliveryNoteRepository().find(restaurantId, supplierTaxId, number);
    return { found: Boolean(rec), number, document: rec?.document ?? null, traceId: rec?.traceId ?? null };
  },
});
