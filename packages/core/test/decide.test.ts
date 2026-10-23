import { describe, expect, it } from 'vitest';
import { decideFinalStatus, esPack, nextAction, validateDocument, type AttemptSummary, type ExtractedDocument } from '../src';
import { validEsInvoice } from './fixtures';

const report = (doc: ExtractedDocument) => validateDocument(doc, esPack);
const attempt = (index: number, doc: ExtractedDocument, role: AttemptSummary['role'] = 'primary', withFeedback = index > 1): AttemptSummary => ({
  index,
  role,
  report: report(doc),
  withFeedback,
});
const blindRead = (index: number, doc: ExtractedDocument, role: AttemptSummary['role'] = 'primary') => attempt(index, doc, role, false);

const totalOff = (total: number) => ({ ...validEsInvoice(), printedTotal: total });
const badTaxId = () => {
  const d = validEsInvoice();
  d.issuer.taxId = 'A28015866';
  return d;
};

describe('nextAction', () => {
  it('stops on the first read when it passes', () => {
    const attempts = [attempt(1, validEsInvoice())];
    expect(nextAction(attempts)).toEqual({ kind: 'stop', reason: 'passed' });
    expect(decideFinalStatus(attempts, { kind: 'stop', reason: 'passed' })).toMatchObject({ status: 'VALID' });
  });

  it('retries a failed read first (assume extraction error)', () => {
    expect(nextAction([attempt(1, totalOff(292.01))])).toEqual({ kind: 'retry', role: 'primary' });
  });

  it('does not trust a read that passes only after feedback: asks for a blind read', () => {
    expect(nextAction([attempt(1, totalOff(299.51)), attempt(2, validEsInvoice())])).toEqual({ kind: 'retry', role: 'primary', blind: true });
    expect(nextAction([attempt(1, totalOff(292.01)), attempt(2, totalOff(293.01)), attempt(3, totalOff(294.01)), attempt(4, validEsInvoice(), 'escalation')])).toEqual({
      kind: 'retry',
      role: 'escalation',
      blind: true,
    });
  });

  it('accepts a self-corrected read once a blind read also passes', () => {
    const attempts = [attempt(1, totalOff(299.51)), attempt(2, validEsInvoice()), blindRead(3, validEsInvoice())];
    const action = nextAction(attempts);
    expect(action).toEqual({ kind: 'stop', reason: 'passed' });
    expect(decideFinalStatus(attempts, action as never)).toMatchObject({ status: 'VALID', reason: expect.stringMatching(/self-corrected/) });
  });

  it('a "repaired" tax id: the blind read reproduces the printed error, so it is confirmed', () => {
    // es-018 with Sonnet: read #2 recomputed the control character after being told it was wrong.
    const attempts = [attempt(1, badTaxId()), attempt(2, validEsInvoice()), blindRead(3, badTaxId())];
    const action = nextAction(attempts);
    expect(action).toEqual({ kind: 'stop', reason: 'confirmed', agreeingAttempts: [1, 3] });
    expect(decideFinalStatus(attempts, action as never)).toMatchObject({ status: 'INVALID_TAX_ID' });
  });

  it('sends to human review when the blind read neither passes nor agrees', () => {
    const attempts = [attempt(1, totalOff(292.01)), attempt(2, validEsInvoice()), blindRead(3, totalOff(293.01))];
    const action = nextAction(attempts);
    expect(action).toEqual({ kind: 'stop', reason: 'unverified' });
    expect(decideFinalStatus(attempts, action as never)).toMatchObject({ status: 'EXTRACTION_UNCERTAIN' });
  });

  it('confirms a supplier error when two reads agree on the same printed values', () => {
    const attempts = [attempt(1, totalOff(292.01)), attempt(2, totalOff(292.01))];
    const action = nextAction(attempts);
    expect(action).toEqual({ kind: 'stop', reason: 'confirmed', agreeingAttempts: [1, 2] });
    expect(decideFinalStatus(attempts, action as never)).toMatchObject({ status: 'SUPPLIER_DISCREPANCY' });
  });

  it('does not confirm when reads disagree on the printed value', () => {
    expect(nextAction([attempt(1, totalOff(292.01)), attempt(2, totalOff(293.01))])).toEqual({ kind: 'retry', role: 'primary' });
  });

  it('escalates once to the stronger model after the primary retries, then gives up', () => {
    const three = [attempt(1, totalOff(292.01)), attempt(2, totalOff(293.01)), attempt(3, totalOff(294.01))];
    expect(nextAction(three)).toEqual({ kind: 'retry', role: 'escalation' });
    expect(nextAction(three, { maxRetries: 2, cascade: false })).toEqual({ kind: 'stop', reason: 'exhausted' });

    const four = [...three, attempt(4, totalOff(295.01), 'escalation')];
    const action = nextAction(four);
    expect(action).toEqual({ kind: 'stop', reason: 'exhausted' });
    expect(decideFinalStatus(four, action as never)).toMatchObject({ status: 'EXTRACTION_UNCERTAIN' });
  });

  it('confirms when the escalation read agrees with any earlier read', () => {
    const attempts = [attempt(1, totalOff(292.01)), attempt(2, totalOff(293.01)), attempt(3, totalOff(294.01)), attempt(4, totalOff(292.01), 'escalation')];
    expect(nextAction(attempts)).toEqual({ kind: 'stop', reason: 'confirmed', agreeingAttempts: [1, 4] });
  });

  it('classifies a confirmed bad checksum as INVALID_TAX_ID', () => {
    const attempts = [attempt(1, badTaxId()), attempt(2, badTaxId())];
    expect(decideFinalStatus(attempts, nextAction(attempts) as never)).toMatchObject({ status: 'INVALID_TAX_ID' });
  });

  it('never turns agreed extraction-level problems into a supplier claim', () => {
    const noTotal = { ...validEsInvoice(), printedTotal: null };
    const attempts = [attempt(1, noTotal), attempt(2, noTotal)];
    expect(decideFinalStatus(attempts, nextAction(attempts) as never)).toMatchObject({ status: 'EXTRACTION_UNCERTAIN' });
  });
});
