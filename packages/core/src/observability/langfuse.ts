import { LangfuseClient } from '@langfuse/client';
import { LangfuseExporter } from '@mastra/langfuse';
import { Observability } from '@mastra/observability';
import { EXTRACTION_INSTRUCTIONS, EXTRACTION_PROMPT_VERSION } from '../mastra/agents/extractionAgent';

/**
 * Langfuse wiring. Traces go through Mastra's official exporter; the Langfuse
 * client is used only for scores and prompt management. Without keys every
 * helper is a no-op, so the pipeline and the evals run unchanged offline.
 */

export const isLangfuseConfigured = () => Boolean(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);

export function createObservability(): Observability | undefined {
  if (!isLangfuseConfigured()) return undefined;
  return new Observability({
    configs: {
      langfuse: {
        serviceName: 'cross-border-invoice-sentinel',
        exporters: [new LangfuseExporter({ environment: process.env.LANGFUSE_TRACING_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development' })],
      },
    },
  });
}

let client: LangfuseClient | null = null;
export function getLangfuseClient(): LangfuseClient | null {
  if (!isLangfuseConfigured()) return null;
  client ??= new LangfuseClient();
  return client;
}

// ---------------------------------------------------------------------------
// Prompt management
// ---------------------------------------------------------------------------

export const EXTRACTION_PROMPT_NAME = 'invoice-extraction';

export interface ResolvedPrompt {
  text: string;
  /** "langfuse:invoice-extraction@3" or "local:extract-v2". Recorded in traces and eval runs. */
  version: string;
  /** Present when served by Langfuse, used to link generations to the prompt version. */
  langfuse?: { name: string; version: number };
}

const LOCAL_PROMPT: ResolvedPrompt = { text: EXTRACTION_INSTRUCTIONS, version: `local:${EXTRACTION_PROMPT_VERSION}` };

/**
 * The extraction instructions, from Langfuse (label "production") when
 * configured and reachable, otherwise the version-controlled local copy.
 * Set PROMPT_SOURCE=local to pin the local copy (e.g. reproducible CI evals).
 */
export async function getExtractionPrompt(): Promise<ResolvedPrompt> {
  const lf = getLangfuseClient();
  if (!lf || process.env.PROMPT_SOURCE === 'local') return LOCAL_PROMPT;
  try {
    const prompt = await lf.prompt.get(EXTRACTION_PROMPT_NAME, { label: 'production', cacheTtlSeconds: 300, fallback: EXTRACTION_INSTRUCTIONS });
    if (prompt.isFallback) return LOCAL_PROMPT;
    return { text: prompt.prompt, version: `langfuse:${prompt.name}@${prompt.version}`, langfuse: { name: prompt.name, version: prompt.version } };
  } catch {
    return LOCAL_PROMPT;
  }
}

// ---------------------------------------------------------------------------
// Scores
// ---------------------------------------------------------------------------

export type ScoreValue = number | string | boolean;

export function recordScores(traceId: string | undefined, scores: Record<string, ScoreValue>, comment?: Record<string, string>): void {
  const lf = getLangfuseClient();
  if (!lf || !traceId) return;
  for (const [name, value] of Object.entries(scores)) {
    if (typeof value === 'boolean') lf.score.create({ traceId, name, value: value ? 1 : 0, dataType: 'BOOLEAN', comment: comment?.[name] });
    else if (typeof value === 'string') lf.score.create({ traceId, name, value, dataType: 'CATEGORICAL', comment: comment?.[name] });
    else lf.score.create({ traceId, name, value, dataType: 'NUMERIC', comment: comment?.[name] });
  }
}

export async function flushLangfuse(observability?: Observability): Promise<void> {
  await Promise.all([getLangfuseClient()?.score.flush(), observability?.getDefaultInstance()?.flush?.()]);
}
