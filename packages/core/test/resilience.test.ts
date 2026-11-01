import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { callWithFallback, isTransient, parseModelSpec, resetCircuits, type CallPolicy } from '../src';

const primary = parseModelSpec('anthropic:claude-haiku-5-5');
const fallback = parseModelSpec('openai:gpt-test');
const policy: CallPolicy = { timeoutMs: 1000, retries: 1, baseDelayMs: 10 };
const http = (statusCode: number) => Object.assign(new Error(`HTTP ${statusCode}`), { statusCode });

/** Scripted model calls: each provider answers or fails in order. */
function script(outcomes: Record<string, (Error | string)[]>) {
  const calls: string[] = [];
  const fn = async (m: { key: string }) => {
    calls.push(m.key);
    const next = outcomes[m.key]?.shift();
    if (next === undefined) throw new Error(`unexpected call to ${m.key}`);
    if (next instanceof Error) throw next;
    return next;
  };
  return { fn, calls };
}

const sleeps: number[] = [];
const deps = { sleep: async (ms: number) => void sleeps.push(ms), now: () => 0 };

beforeEach(() => {
  resetCircuits();
  sleeps.length = 0;
});
afterEach(() => delete process.env.SIMULATE_PROVIDER_OUTAGE);

describe('isTransient', () => {
  it('retries timeouts, rate limits and 5xx, not client errors', () => {
    expect(isTransient(Object.assign(new Error('x'), { name: 'TimeoutError' }))).toBe(true);
    expect(isTransient(http(429))).toBe(true);
    expect(isTransient(http(529))).toBe(true);
    expect(isTransient(http(400))).toBe(false);
    expect(isTransient(new Error('Overloaded'))).toBe(true);
    expect(isTransient(new Error('No object generated: response did not match schema'))).toBe(false);
  });
});

describe('callWithFallback', () => {
  it('uses the primary when it answers', async () => {
    const s = script({ [primary.key]: ['ok'] });
    expect(await callWithFallback(primary, fallback, s.fn, policy, deps)).toEqual({ value: 'ok', model: primary, fallbackReason: null });
  });

  it('retries a transient failure with backoff before giving up on the primary', async () => {
    const s = script({ [primary.key]: [http(529), 'ok'] });
    const r = await callWithFallback(primary, fallback, s.fn, policy, deps);
    expect(r.model).toBe(primary);
    expect(sleeps).toEqual([10]);
  });

  it('falls back to the other provider when the primary keeps failing, and says why', async () => {
    const s = script({ [primary.key]: [http(503), http(503)], [fallback.key]: ['from fallback'] });
    const r = await callWithFallback(primary, fallback, s.fn, policy, deps);
    expect(r).toMatchObject({ value: 'from fallback', model: fallback });
    expect(r.fallbackReason).toMatch(/anthropic:claude-haiku-5-5 failed: HTTP 503/);
    expect(s.calls).toEqual([primary.key, primary.key, fallback.key]);
  });

  it('does not fall back on a non-transient error (it would hide a bug)', async () => {
    const s = script({ [primary.key]: [http(400)] });
    await expect(callWithFallback(primary, fallback, s.fn, policy, deps)).rejects.toThrow('HTTP 400');
    expect(s.calls).toEqual([primary.key]);
  });

  it('opens the circuit after repeated failures and skips the primary while it is open', async () => {
    const s = script({ [primary.key]: [http(503), http(503), http(503)], [fallback.key]: ['a', 'b'] });
    await callWithFallback(primary, fallback, s.fn, policy, deps); // 2 failures
    await callWithFallback(primary, fallback, s.fn, { ...policy, retries: 0 }, deps); // 3rd failure opens the circuit
    s.calls.length = 0;
    const s2 = script({ [fallback.key]: ['c'] });
    const r = await callWithFallback(primary, fallback, s2.fn, policy, deps);
    expect(r.fallbackReason).toBe('circuit open for anthropic:claude-haiku-5-5');
    expect(s2.calls).toEqual([fallback.key]);
  });

  it('without a fallback the error surfaces', async () => {
    const s = script({ [primary.key]: [http(503), http(503)] });
    await expect(callWithFallback(primary, null, s.fn, policy, deps)).rejects.toThrow('HTTP 503');
  });

  it('SIMULATE_PROVIDER_OUTAGE takes a provider down for drills', async () => {
    process.env.SIMULATE_PROVIDER_OUTAGE = 'anthropic';
    const s = script({ [fallback.key]: ['ok'] });
    const r = await callWithFallback(primary, fallback, s.fn, policy, deps);
    expect(r.model).toBe(fallback);
    expect(s.calls).toEqual([fallback.key]);
  });
});
