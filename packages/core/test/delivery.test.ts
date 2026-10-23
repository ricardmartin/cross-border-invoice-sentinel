import { describe, expect, it } from 'vitest';
import { editDistance, InMemoryDeliveryNoteRepository, maxNumberEdits, type DeliveryNoteRecord } from '../src';
import { validEsInvoice } from './fixtures';

const SUPPLIER = 'B12345674';

const note = (number: string, supplierTaxId = SUPPLIER, restaurantId = 'r1'): DeliveryNoteRecord => ({
  restaurantId,
  supplierTaxId,
  number,
  country: 'ES',
  document: { ...validEsInvoice(), docType: 'DELIVERY_NOTE', documentNumber: number },
  file: { base64: 'eA==', mediaType: 'image/jpeg' },
  traceId: null,
  savedAt: '2026-10-01T00:00:00.000Z',
});

const repoWith = async (...notes: DeliveryNoteRecord[]) => {
  const repo = new InMemoryDeliveryNoteRepository();
  for (const n of notes) await repo.save(n);
  return repo;
};

describe('edit distance', () => {
  it('counts substitutions, insertions and deletions', () => {
    expect(editDistance('ALB2603387', 'A182603387')).toBe(2);
    expect(editDistance('4512', '4512')).toBe(0);
    expect(editDistance('4512', '45123')).toBe(1);
    expect(editDistance('', 'AB')).toBe(2);
  });

  it('tolerates more edits only on longer numbers', () => {
    expect(maxNumberEdits('45')).toBe(0);
    expect(maxNumberEdits('4512')).toBe(1);
    expect(maxNumberEdits('ALB2603387')).toBe(2);
  });
});

describe('findNear (misread delivery-note references)', () => {
  it('finds the note when the invoice misread its reference (es-041: "A18-2603387" for "ALB-2603387")', async () => {
    const repo = await repoWith(note('ALB-2603387'));
    expect(await repo.find('r1', SUPPLIER, 'A18-2603387')).toBeNull();
    expect((await repo.findNear('r1', SUPPLIER, 'A18-2603387'))?.number).toBe('ALB-2603387');
  });

  it('returns nothing when two stored notes are equally plausible', async () => {
    const repo = await repoWith(note('ALB-2603387'), note('ALB-2603381'));
    expect(await repo.findNear('r1', SUPPLIER, 'ALB-2603384')).toBeNull();
  });

  it('never crosses supplier or restaurant', async () => {
    const repo = await repoWith(note('ALB-2603387', 'A28015865'), note('ALB-2603387', SUPPLIER, 'r2'));
    expect(await repo.findNear('r1', SUPPLIER, 'A18-2603387')).toBeNull();
  });

  it('does not guess on short numbers', async () => {
    const repo = await repoWith(note('45'));
    expect(await repo.findNear('r1', SUPPLIER, '46')).toBeNull();
  });

  it('rejects numbers that are too different', async () => {
    const repo = await repoWith(note('ALB-2603387'));
    expect(await repo.findNear('r1', SUPPLIER, 'ALB-2619999')).toBeNull();
  });
});
