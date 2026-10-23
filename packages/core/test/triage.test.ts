import { describe, expect, it } from 'vitest';
import { resolveTriage, type TriageOutput } from '../src';

const out = (o: Partial<TriageOutput>): TriageOutput => ({
  docType: 'INVOICE',
  country: 'ES',
  confidence: 0.7,
  signals: ['language: Spanish'],
  issuerTaxId: null,
  ...o,
});

describe('resolveTriage', () => {
  it('raises confidence when the tax id checksum confirms the model', () => {
    const r = resolveTriage(out({ issuerTaxId: 'A28015865' }));
    expect(r).toMatchObject({ country: 'ES', supported: true });
    expect(r.confidence).toBeGreaterThanOrEqual(0.95);
    expect(r.signals.at(-1)).toMatch(/checksum/);
  });

  it('lets the checksum win over a wrong model guess, with lower confidence', () => {
    const r = resolveTriage(out({ country: 'PT', confidence: 0.9, issuerTaxId: 'A28015865' }));
    expect(r).toMatchObject({ country: 'ES', supported: true, confidence: 0.6 });
  });

  it('keeps the model guess when no pack validates the id (e.g. bad checksum)', () => {
    expect(resolveTriage(out({ issuerTaxId: 'A28015866' }))).toMatchObject({ country: 'ES', confidence: 0.7 });
  });

  it('flags countries without a pack as unsupported', () => {
    expect(resolveTriage(out({ country: 'nl' }))).toMatchObject({ country: 'NL', supported: false });
  });
});
