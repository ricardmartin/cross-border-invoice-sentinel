import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

/**
 * Model selection by configuration. A spec is "<provider>:<model id>", e.g.
 * "anthropic:claude-haiku-5-5". Swapping models never touches code, so every
 * model is compared on the same evals.
 */

export const PROVIDERS = ['anthropic', 'google'] as const;
export type Provider = (typeof PROVIDERS)[number];

export interface ModelSpec {
  provider: Provider;
  modelId: string;
  /** Canonical "<provider>:<model id>" string, used as a key in traces, caches and reports. */
  key: string;
}

export function parseModelSpec(raw: string): ModelSpec {
  const [provider, ...rest] = raw.trim().split(':');
  const modelId = rest.join(':');
  if (!PROVIDERS.includes(provider as Provider) || !modelId) {
    throw new Error(`Invalid model spec "${raw}". Use "<provider>:<model id>" with provider in ${PROVIDERS.join(', ')}`);
  }
  return { provider: provider as Provider, modelId, key: `${provider}:${modelId}` };
}

export function resolveModel(spec: ModelSpec) {
  switch (spec.provider) {
    case 'anthropic':
      return anthropic(spec.modelId);
    case 'google':
      return google(spec.modelId);
  }
}

export const defaultExtractionModel = (): ModelSpec => parseModelSpec(process.env.EXTRACTION_MODEL ?? 'anthropic:claude-haiku-5-5');
export const defaultEscalationModel = (): ModelSpec => parseModelSpec(process.env.ESCALATION_MODEL ?? 'anthropic:claude-sonnet-5-5');

// ---------------------------------------------------------------------------
// Pricing (USD per 1M tokens). Anthropic list prices as of 2026-10; other
// providers are added through MODEL_PRICING_JSON rather than guessed.
// ---------------------------------------------------------------------------

export interface Pricing {
  input: number;
  output: number;
}

const BUILTIN_PRICING: Record<string, Pricing> = {
  'anthropic:claude-haiku-5-5': { input: 0.1, output: 0.5 },
  'anthropic:claude-sonnet-5-5': { input: 2, output: 10 },
  'anthropic:claude-opus-5-5': { input: 4, output: 20 },
};

export function pricingFor(spec: ModelSpec): Pricing | null {
  let overrides: Record<string, Pricing> = {};
  try {
    overrides = JSON.parse(process.env.MODEL_PRICING_JSON ?? '{}') as Record<string, Pricing>;
  } catch {
    // ignore malformed override, fall back to built-ins
  }
  return overrides[spec.key] ?? BUILTIN_PRICING[spec.key] ?? null;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

/** Cost in USD, or null when the model has no known price. */
export function costUsd(spec: ModelSpec, usage: TokenUsage): number | null {
  const p = pricingFor(spec);
  if (!p) return null;
  return (usage.inputTokens * p.input + usage.outputTokens * p.output) / 1_000_000;
}
