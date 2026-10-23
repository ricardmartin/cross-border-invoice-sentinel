import { createHash } from 'node:crypto';
import type { TracingContext } from '@mastra/core/observability';
import { withLangfusePrompt } from '@mastra/langfuse';
import { buildTracingOptions } from '@mastra/observability';
import { z } from 'zod';
import type { CountryPack } from '../countries/types';
import { cached, cacheKey } from '../llmCache';
import { getExtractionAgent } from '../mastra/agents/extractionAgent';
import { costUsd, type ModelSpec, type TokenUsage } from '../models';
import { getExtractionPrompt, type ResolvedPrompt } from '../observability/langfuse';
import { ExtractedDocumentSchema, type ExtractedDocument } from '../schemas/extracted';

/**
 * Schema handed to the model. Same shape as ExtractedDocumentSchema but
 * without numeric/regex constraints, which provider structured-output modes
 * reject or enforce inconsistently. The strict schema is applied afterwards,
 * and its failures become validation issues (→ retry), not crashes.
 */
const nullableNumber = z.number().nullable();
const LooseParty = z.object({ name: z.string(), taxId: z.string().nullable(), address: z.string().nullable() });
export const ExtractionOutputSchema = z.object({
  docType: z.enum(['INVOICE', 'DELIVERY_NOTE', 'CREDIT_NOTE', 'OTHER']),
  country: z.string().describe('ISO 3166-1 alpha-2 country of the issuer, e.g. ES'),
  documentNumber: z.string(),
  issueDate: z.string().describe('YYYY-MM-DD'),
  currency: z.string().describe('ISO 4217, e.g. EUR'),
  issuer: LooseParty,
  recipient: LooseParty,
  lines: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unit: z.string().nullable(),
      unitPrice: nullableNumber.describe('Net unit price before tax'),
      discountPct: nullableNumber.describe('Line discount in percent, null if none'),
      taxRate: nullableNumber.describe('Tax rate in percent: 10 for 10%'),
      lineAmount: nullableNumber.describe('Net line amount before tax, as printed'),
    }),
  ),
  printedTaxBreakdown: z.array(z.object({ rate: z.number(), base: z.number(), tax: z.number() })),
  printedCharges: z
    .array(
      z.object({
        kind: z.enum(['SURCHARGE', 'WITHHOLDING', 'STAMP_DUTY']),
        label: z.string(),
        rate: nullableNumber.describe('Percent as printed; null for a fixed amount'),
        base: nullableNumber.describe('Base as printed; null if not printed'),
        amount: z.number().describe('As printed, always positive'),
      }),
    )
    .describe('Summary rows that are neither a line nor VAT: surcharges, withholdings, stamp duty; empty if none'),
  printedTotal: nullableNumber.describe('Amount due as printed (after withholdings when printed)'),
  deliveryNoteRefs: z.array(z.string()),
  documentControlCode: z.string().nullable().describe('Tax-authority control code (PT: ATCUD) exactly as printed, without its label; null if none'),
});

/**
 * A read as stored in workflow state. Fields added to the model schema after a run was suspended
 * (printedCharges, documentControlCode in extract-v3) are absent from its snapshot: resuming it must
 * still validate, so they default to "none" here while the model is always asked for them.
 */
export const StoredExtractionSchema = ExtractionOutputSchema.extend({
  printedCharges: ExtractionOutputSchema.shape.printedCharges.default([]),
  documentControlCode: ExtractionOutputSchema.shape.documentControlCode.default(null),
});

export interface DocumentFile {
  /** Base64 without data-URL prefix. */
  base64: string;
  mediaType: string;
}

export interface ExtractOptions {
  file: DocumentFile;
  pack: CountryPack;
  model: ModelSpec;
  /** Concrete validator errors from the previous attempt (self-correction). */
  feedback?: string;
  previous?: ExtractedDocument;
  /**
   * Cache key only: tells apart independent reads of an identical request
   * (a blind verification read would otherwise hit the first read's cache entry).
   */
  sample?: number;
  /** Defaults to the Langfuse-managed prompt (local fallback). */
  prompt?: ResolvedPrompt;
  /** Parent span (workflow step) so the generation nests under it. */
  tracingContext?: TracingContext;
}

export interface ExtractionResult {
  document: ExtractedDocument;
  /** Strict-schema failure messages; empty when the output is well-formed. */
  schemaErrors: string[];
  usage: TokenUsage;
  costUsd: number | null;
  latencyMs: number;
  model: string;
  promptVersion: string;
  cached: boolean;
}

function buildMessage({ file, pack, feedback, previous }: ExtractOptions) {
  const text = [
    `Country conventions for this document (${pack.name}, ${pack.code}):`,
    pack.promptContext,
    ...(feedback && previous
      ? ['', 'PREVIOUS ATTEMPT (JSON):', JSON.stringify(previous), '', feedback]
      : []),
    '',
    'Transcribe the attached document.',
  ].join('\n');

  const filePart =
    file.mediaType === 'application/pdf'
      ? { type: 'file' as const, data: file.base64, mediaType: 'application/pdf' }
      : { type: 'image' as const, image: file.base64, mediaType: file.mediaType };

  return { role: 'user' as const, content: [filePart, { type: 'text' as const, text }] };
}

export const fileHash = (file: DocumentFile) => createHash('sha256').update(file.base64).digest('hex');

export async function extractDocument(opts: ExtractOptions): Promise<ExtractionResult> {
  const prompt = opts.prompt ?? (await getExtractionPrompt());
  const key = cacheKey('extract', fileHash(opts.file), opts.model.key, prompt.version, opts.pack.code, opts.pack.version, opts.feedback, JSON.stringify(opts.previous ?? null), ...(opts.sample ? [`sample:${opts.sample}`] : []));

  const { value, hit } = await cached(key, async () => {
    const agent = getExtractionAgent(opts.model);
    const started = performance.now();
    // No temperature: current Claude models reject non-default sampling parameters.
    const result = await agent.generate([buildMessage(opts)], {
      instructions: prompt.text,
      structuredOutput: { schema: ExtractionOutputSchema },
      modelSettings: { maxOutputTokens: 8000 },
      tracingContext: opts.tracingContext,
      tracingOptions: prompt.langfuse ? buildTracingOptions(withLangfusePrompt(prompt.langfuse)) : undefined,
    });
    const latencyMs = Math.round(performance.now() - started);

    const raw = ExtractionOutputSchema.parse(result.object);
    const strict = ExtractedDocumentSchema.safeParse(raw);
    const usage: TokenUsage = {
      inputTokens: result.totalUsage?.inputTokens ?? 0,
      outputTokens: result.totalUsage?.outputTokens ?? 0,
    };
    return {
      // Keep the raw transcription even when the strict schema fails: the validator reports why.
      document: (strict.success ? strict.data : raw) as ExtractedDocument,
      schemaErrors: strict.success ? [] : strict.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      usage,
      costUsd: costUsd(opts.model, usage),
      latencyMs,
      model: opts.model.key,
      promptVersion: prompt.version,
    };
  });
  return { ...value, cached: hit };
}
