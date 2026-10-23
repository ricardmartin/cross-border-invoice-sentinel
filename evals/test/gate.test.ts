import { describe, expect, it } from 'vitest';
import { evaluateGate, loadThresholds, type BaselineFile, type Metrics } from '../gate';

const thresholds = loadThresholds();
const good: Metrics = {
  'Documents 100 % correct (final)': 0.93,
  'Final status correct': 1,
  'Discrepancy recall': 1,
  'Unfair claims (false positives on clean docs)': 0,
  'Reconciliation status correct': 1,
  'Claim judge score (1-5)': 4.6,
  'Claims with invented data': 0,
  'Cost / doc': 0.0018,
  'Latency p95': 20000,
  'Failed runs': 0,
  'Line F1': 0.99,
};
const baseline: BaselineFile = { runName: 'base', createdAt: '', config: {}, countries: { FR: good } };
const failures = (metrics: Metrics, opts: { smoke?: boolean } = {}) =>
  evaluateGate({ FR: metrics }, thresholds, baseline, opts)
    .filter((c) => !c.passed)
    .map((c) => `${c.kind}:${c.metric}`);

describe('evaluateGate', () => {
  it('passes a run that matches the baseline', () => {
    expect(failures(good)).toEqual([]);
  });

  it('fails on a single unfair claim, whatever the rest looks like', () => {
    expect(failures({ ...good, 'Unfair claims (false positives on clean docs)': 0.04 })).toEqual(['threshold:Unfair claims (false positives on clean docs)']);
  });

  it('fails when a metric drops more than the allowed points vs baseline, even above its floor', () => {
    // 93 % → 86 % is still above the 80 % floor, but a 7-point regression.
    expect(failures({ ...good, 'Documents 100 % correct (final)': 0.86 })).toEqual(['regression:Documents 100 % correct (final)']);
    expect(failures({ ...good, 'Documents 100 % correct (final)': 0.89 })).toEqual([]); // −4 pts: tolerated
  });

  it('checks cost and latency ceilings', () => {
    expect(failures({ ...good, 'Cost / doc': 0.009, 'Latency p95': 45000 }).sort()).toEqual(['threshold:Cost / doc', 'threshold:Latency p95']);
  });

  it('ignores metrics that do not apply (no claims in a subset)', () => {
    expect(failures({ ...good, 'Claim judge score (1-5)': null })).toEqual([]);
  });

  it('uses the smoke profile and skips regressions on the smoke subset', () => {
    expect(failures({ ...good, 'Documents 100 % correct (final)': 0.5 }, { smoke: true })).toEqual([]);
    expect(failures({ ...good, 'Final status correct': 0.9 }, { smoke: true })).toEqual(['threshold:Final status correct']);
  });

  it('applies country overrides on top of the defaults', () => {
    const es = evaluateGate({ ES: { ...good, 'Final status correct': 0.92 } }, thresholds, null);
    expect(es.find((c) => c.metric === 'Final status correct')).toMatchObject({ passed: false, limit: '≥ 0.95' });
  });
});
