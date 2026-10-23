import type { TracingContext } from '@mastra/core/observability';
import { cached, cacheKey } from '../llmCache';
import { getTriageAgent, resolveTriage, TriageOutputSchema, TRIAGE_PROMPT_VERSION, type ResolvedTriage } from '../mastra/agents/triageAgent';
import { costUsd, type ModelSpec, type TokenUsage } from '../models';
import { fileHash, type DocumentFile } from './extract';

export interface TriageCallResult {
  triage: ResolvedTriage;
  issuerTaxId: string | null;
  usage: TokenUsage;
  costUsd: number | null;
  latencyMs: number;
  cached: boolean;
}

export async function triageDocument(opts: { file: DocumentFile; model: ModelSpec; tracingContext?: TracingContext }): Promise<TriageCallResult> {
  const key = cacheKey('triage', fileHash(opts.file), opts.model.key, TRIAGE_PROMPT_VERSION);
  const { value, hit } = await cached(key, async () => {
    const filePart =
      opts.file.mediaType === 'application/pdf'
        ? { type: 'file' as const, data: opts.file.base64, mediaType: 'application/pdf' }
        : { type: 'image' as const, image: opts.file.base64, mediaType: opts.file.mediaType };
    const started = performance.now();
    const result = await getTriageAgent(opts.model).generate(
      [{ role: 'user' as const, content: [filePart, { type: 'text' as const, text: 'Classify this document.' }] }],
      { structuredOutput: { schema: TriageOutputSchema }, modelSettings: { maxOutputTokens: 1000 }, tracingContext: opts.tracingContext },
    );
    const out = TriageOutputSchema.parse(result.object);
    const usage = { inputTokens: result.totalUsage?.inputTokens ?? 0, outputTokens: result.totalUsage?.outputTokens ?? 0 };
    return { out, usage, latencyMs: Math.round(performance.now() - started) };
  });
  // Resolution is deterministic and cheap: always recompute so pack changes apply to cached calls.
  return {
    triage: resolveTriage(value.out),
    issuerTaxId: value.out.issuerTaxId,
    usage: value.usage,
    costUsd: costUsd(opts.model, value.usage),
    latencyMs: value.latencyMs,
    cached: hit,
  };
}
