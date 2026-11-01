import type { TracingContext } from '@mastra/core/observability';
import { cached, cacheKey } from '../llmCache';
import { getTriageAgent, resolveTriage, TriageOutputSchema, TRIAGE_PROMPT_VERSION, type ResolvedTriage } from '../mastra/agents/triageAgent';
import { costUsd, type ModelSpec, type TokenUsage } from '../models';
import { callWithFallback } from '../resilience';
import { fileHash, type DocumentFile } from './extract';

export interface TriageCallResult {
  triage: ResolvedTriage;
  issuerTaxId: string | null;
  usage: TokenUsage;
  costUsd: number | null;
  latencyMs: number;
  cached: boolean;
  /** The model that actually answered. */
  model: string;
  fallbackReason: string | null;
}

export async function triageDocument(opts: { file: DocumentFile; model: ModelSpec; fallback?: ModelSpec | null; tracingContext?: TracingContext }): Promise<TriageCallResult> {
  const call = await callWithFallback(opts.model, opts.fallback ?? null, (model, abortSignal) => cached(cacheKey('triage', fileHash(opts.file), model.key, TRIAGE_PROMPT_VERSION), async () => {
    const filePart =
      opts.file.mediaType === 'application/pdf'
        ? { type: 'file' as const, data: opts.file.base64, mediaType: 'application/pdf' }
        : { type: 'image' as const, image: opts.file.base64, mediaType: opts.file.mediaType };
    const started = performance.now();
    const result = await getTriageAgent(model).generate(
      [{ role: 'user' as const, content: [filePart, { type: 'text' as const, text: 'Classify this document.' }] }],
      { structuredOutput: { schema: TriageOutputSchema }, modelSettings: { maxOutputTokens: 1000 }, abortSignal, tracingContext: opts.tracingContext },
    );
    const out = TriageOutputSchema.parse(result.object);
    const usage = { inputTokens: result.totalUsage?.inputTokens ?? 0, outputTokens: result.totalUsage?.outputTokens ?? 0 };
    return { out, usage, latencyMs: Math.round(performance.now() - started) };
  }));
  const { value, hit } = call.value;
  // Resolution is deterministic and cheap: always recompute so pack changes apply to cached calls.
  return {
    triage: resolveTriage(value.out),
    issuerTaxId: value.out.issuerTaxId,
    usage: value.usage,
    costUsd: costUsd(call.model, value.usage),
    latencyMs: value.latencyMs,
    cached: hit,
    model: call.model.key,
    fallbackReason: call.fallbackReason,
  };
}
