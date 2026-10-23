import { issue } from '../../validation/issue';
import type { TaxIdCheck, Validator } from '../types';

/**
 * Portuguese NIF / NIPC: 9 digits, the last one a mod-11 control
 * (weights 9..2 on the first 8 digits; remainder 0 or 1 → control 0).
 * An optional "PT" VAT prefix and separators are ignored.
 */

/** First digit(s) in use: 1-3 persons, 5 companies, 6 public bodies, 8 sole traders, 9 irregular entities, 45 non-residents, 7x funds/estates. */
const NIF_START = /^(?:[1235689]|45|7[0-49])/;

export function nifControl(first8: string): string {
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number(first8[i]) * (9 - i);
  const r = sum % 11;
  return String(r < 2 ? 0 : 11 - r);
}

export function normalizePortugueseTaxId(raw: string): string {
  const id = raw.toUpperCase().replace(/[\s  .\-/]/g, '');
  return id.startsWith('PT') && id.length === 11 ? id.slice(2) : id;
}

export function validatePortugueseTaxId(raw: string): TaxIdCheck {
  const id = normalizePortugueseTaxId(raw);
  const fail = (type: string, reason: string): TaxIdCheck => ({ valid: false, type, normalized: id, reason });

  if (!id) return fail('UNKNOWN', 'Empty tax id');
  if (!/^\d{9}$/.test(id)) return fail('UNKNOWN', 'Expected NIF / NIPC (9 digits, optionally PT-prefixed)');
  if (!NIF_START.test(id)) return fail('NIF_PT', `NIF cannot start with ${id[0]}`);
  return nifControl(id.slice(0, 8)) === id[8] ? { valid: true, type: 'NIF_PT', normalized: id } : fail('NIF_PT', 'NIF control digit mismatch');
}

/**
 * ATCUD (Portaria 195/2020, mandatory since 2023): "<validation code>-<sequence number>", where the validation
 * code (8+ characters) is assigned by the AT to the document series and the sequence number is the document's
 * number within it. Warnings only: a missing or inconsistent ATCUD is a compliance problem for the supplier,
 * not an amount to claim.
 */
export const atcudValidator: Validator = (doc) => {
  if (doc.docType !== 'INVOICE' && doc.docType !== 'CREDIT_NOTE') return [];
  const code = (doc.documentControlCode ?? '').replace(/^ATCUD\s*:?\s*/i, '').trim();
  if (!code) return [issue('CONTROL_CODE', 'warning', 'ATCUD is missing (mandatory on Portuguese invoices since 2023)', { path: 'documentControlCode' })];
  const m = /^([A-Z0-9]{8,})-(\d+)$/i.exec(code);
  if (!m) {
    return [issue('CONTROL_CODE', 'warning', `ATCUD "${code}" is not <validation code>-<sequence number>`, { path: 'documentControlCode' })];
  }
  const sequence = /(\d+)\s*$/.exec(doc.documentNumber)?.[1];
  if (sequence && Number(sequence) !== Number(m[2])) {
    return [
      issue('CONTROL_CODE', 'warning', `ATCUD sequence number ${m[2]} does not match document number ${doc.documentNumber}`, {
        path: 'documentControlCode',
      }),
    ];
  }
  return [];
};
