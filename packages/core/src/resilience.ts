import type { ModelSpec } from './models';

/**
 * Provider resilience for model calls: a timeout per call, retries with exponential backoff on
 * transient errors only, a circuit breaker per model, and a fallback model on another provider.
 *
 * A fallback model is a different reader: it must pass its own eval run before it is configured
 * (npm run evals -- --model=<fallback>). Every attempt records which model actually answered.
 */

export interface CallPolicy {
  timeoutMs: number;
  /** Extra tries on the same model after a transient failure. */
  retries: number;
  baseDelayMs: number;
}

export const defaultCallPolicy = (): CallPolicy => ({
  timeoutMs: Number(process.env.MODEL_TIMEOUT_MS ?? 60_000),
  retries: Number(process.env.MODEL_RETRIES ?? 1),
  baseDelayMs: 500,
});

/** Timeouts, rate limits, overload and 5xx are worth retrying; a 400 or a schema error is not (it would fail again). */
export function isTransient(e: unknown): boolean {
  const err = e as { name?: string; statusCode?: number; status?: number; isRetryable?: boolean; message?: string; cause?: unknown } | null;
  if (!err) return false;
  if (err.name === 'AbortError' || err.name === 'TimeoutError') return true;
  if (err.isRetryable === true) return true;
  const status = err.statusCode ?? err.status;
  if (status !== undefined) return status === 408 || status === 409 || status === 429 || status >= 500;
  if (/timeout|timed out|overloaded|rate limit|ECONNRESET|ETIMEDOUT|fetch failed|socket hang up/i.test(err.message ?? '')) return true;
  return err.cause !== undefined && err.cause !== e && isTransient(err.cause);
}

// ---------------------------------------------------------------------------
// Circuit breaker: after THRESHOLD consecutive transient failures a model is skipped for COOLDOWN.
// ---------------------------------------------------------------------------

const THRESHOLD = 3;
const COOLDOWN_MS = 30_000;
const circuits = new Map<string, { failures: number; openUntil: number }>();

export const resetCircuits = () => circuits.clear();
const isOpen = (key: string, now: number) => (circuits.get(key)?.openUntil ?? 0) > now;
function recordFailure(key: string, now: number) {
  const c = circuits.get(key) ?? { failures: 0, openUntil: 0 };
  c.failures++;
  if (c.failures >= THRESHOLD) c.openUntil = now + COOLDOWN_MS;
  circuits.set(key, c);
}
const recordSuccess = (key: string) => circuits.delete(key);

/** Chaos switch for drills and evals: SIMULATE_PROVIDER_OUTAGE=anthropic makes that provider fail as if it were down. */
const simulatedOutage = (spec: ModelSpec) =>
  (process.env.SIMULATE_PROVIDER_OUTAGE ?? '')
    .split(',')
    .map((s) => s.trim())
    .includes(spec.provider);

export class ProviderOutageError extends Error {
  readonly isRetryable = true;
  constructor(spec: ModelSpec) {
    super(`simulated outage of ${spec.provider}`);
    this.name = 'ProviderOutageError';
  }
}

export interface FallbackResult<T> {
  value: T;
  model: ModelSpec;
  /** Why the fallback answered instead of the primary; null when the primary did. */
  fallbackReason: string | null;
}

export interface FallbackDeps {
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

async function tryModel<T>(spec: ModelSpec, fn: (m: ModelSpec, signal: AbortSignal) => Promise<T>, policy: CallPolicy, deps: Required<FallbackDeps>): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt <= policy.retries; attempt++) {
    if (attempt > 0) await deps.sleep(policy.baseDelayMs * 2 ** (attempt - 1));
    try {
      if (simulatedOutage(spec)) throw new ProviderOutageError(spec);
      const value = await fn(spec, AbortSignal.timeout(policy.timeoutMs));
      recordSuccess(spec.key);
      return value;
    } catch (e) {
      last = e;
      if (!isTransient(e)) throw e;
      recordFailure(spec.key, deps.now());
      if (isOpen(spec.key, deps.now())) break;
    }
  }
  throw last;
}

export async function callWithFallback<T>(
  primary: ModelSpec,
  fallback: ModelSpec | null,
  fn: (m: ModelSpec, signal: AbortSignal) => Promise<T>,
  policy: CallPolicy = defaultCallPolicy(),
  deps: FallbackDeps = {},
): Promise<FallbackResult<T>> {
  const d = { now: deps.now ?? Date.now, sleep: deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms))) };
  const usable = fallback && fallback.key !== primary.key ? fallback : null;
  let reason: string;
  if (usable && isOpen(primary.key, d.now())) {
    reason = `circuit open for ${primary.key}`;
  } else {
    try {
      return { value: await tryModel(primary, fn, policy, d), model: primary, fallbackReason: null };
    } catch (e) {
      if (!usable || !isTransient(e)) throw e;
      reason = `${primary.key} failed: ${e instanceof Error ? e.message.slice(0, 200) : String(e)}`;
    }
  }
  return { value: await tryModel(usable!, fn, policy, d), model: usable!, fallbackReason: reason };
}
