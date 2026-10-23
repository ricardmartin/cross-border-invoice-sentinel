import { createHash } from 'node:crypto';

/**
 * Optional response cache for LLM calls, injected by the eval runner so that
 * re-running evals on unchanged inputs (same file, model, prompt, pack and
 * feedback) costs nothing. Production code leaves it unset.
 */
export interface LlmCache {
  get(key: string): Promise<unknown | undefined>;
  set(key: string, value: unknown): Promise<void>;
}

let cache: LlmCache | null = null;

export const setLlmCache = (c: LlmCache | null) => {
  cache = c;
};

export const cacheKey = (...parts: (string | number | undefined | null)[]) =>
  createHash('sha256').update(parts.map((p) => String(p ?? '')).join('\u0000')).digest('hex').slice(0, 32);

export async function cached<T>(key: string, compute: () => Promise<T>): Promise<{ value: T; hit: boolean }> {
  if (cache) {
    const hit = (await cache.get(key)) as T | undefined;
    if (hit !== undefined) return { value: hit, hit: true };
  }
  const value = await compute();
  if (cache) await cache.set(key, value);
  return { value, hit: false };
}
