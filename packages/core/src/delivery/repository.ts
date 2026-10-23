import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { DocumentFile } from '../extraction/extract';
import type { ExtractedDocument } from '../schemas/extracted';

/**
 * Delivery notes arrive with the goods, days before the invoice. The workflow
 * stores each processed delivery note here; invoices look them up by the
 * numbers they reference. The file is kept so a disputed line can be re-read.
 */
export interface DeliveryNoteRecord {
  restaurantId: string;
  supplierTaxId: string;
  number: string;
  country: string;
  document: ExtractedDocument;
  file: DocumentFile;
  traceId: string | null;
  savedAt: string;
}

export interface DeliveryNoteRepository {
  save(record: DeliveryNoteRecord): Promise<void>;
  find(restaurantId: string, supplierTaxId: string, number: string): Promise<DeliveryNoteRecord | null>;
  /**
   * Fallback for a reference the invoice read slightly wrong ("A18-2603387" for "ALB-2603387"):
   * the only stored note of the same restaurant and supplier whose number is within a few edits.
   * Null when there is none or more than one (ambiguous).
   */
  findNear?(restaurantId: string, supplierTaxId: string, number: string): Promise<DeliveryNoteRecord | null>;
}

/** "Albarán nº ALB-4512" and "alb 4512" → "ALB4512"; ids lose separators and an optional country prefix. */
export const normalizeDocNumber = (s: string) => s.toUpperCase().replace(/^((ALBAR[AÁ]N|N[ºO°.]+)\s*)+/, '').replace(/[^A-Z0-9]/g, '');
export const normalizeTaxIdKey = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^ES(?=[A-Z0-9]{9}$)/, '');

const keyOf = (restaurantId: string, supplierTaxId: string, number: string) =>
  `${restaurantId}|${normalizeTaxIdKey(supplierTaxId)}|${normalizeDocNumber(number)}`;

/** Levenshtein distance. */
export function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length]!;
}

/** Edits tolerated between a referenced and a stored number: none below 4 characters, at most 2. */
export const maxNumberEdits = (normalized: string) => Math.min(2, Math.floor(normalized.length / 4));

export class InMemoryDeliveryNoteRepository implements DeliveryNoteRepository {
  protected readonly records = new Map<string, DeliveryNoteRecord>();

  async save(record: DeliveryNoteRecord) {
    this.records.set(keyOf(record.restaurantId, record.supplierTaxId, record.number), record);
  }

  async find(restaurantId: string, supplierTaxId: string, number: string) {
    return this.records.get(keyOf(restaurantId, supplierTaxId, number)) ?? null;
  }

  async findNear(restaurantId: string, supplierTaxId: string, number: string) {
    const prefix = keyOf(restaurantId, supplierTaxId, '');
    const target = normalizeDocNumber(number);
    const max = maxNumberEdits(target);
    if (!max) return null;
    const near = [...this.records.entries()].filter(([k]) => k.startsWith(prefix) && editDistance(k.slice(prefix.length), target) <= max);
    return near.length === 1 ? near[0]![1] : null;
  }
}

/** Survives restarts (local dev, the web app). Not for concurrent writers. */
export class JsonFileDeliveryNoteRepository extends InMemoryDeliveryNoteRepository {
  constructor(private readonly path: string) {
    super();
    if (existsSync(path)) for (const [k, v] of Object.entries(JSON.parse(readFileSync(path, 'utf8')))) this.records.set(k, v as DeliveryNoteRecord);
  }

  override async save(record: DeliveryNoteRecord) {
    await super.save(record);
    writeFileSync(this.path, JSON.stringify(Object.fromEntries(this.records)));
  }
}

let repository: DeliveryNoteRepository = new InMemoryDeliveryNoteRepository();
export const setDeliveryNoteRepository = (r: DeliveryNoteRepository) => {
  repository = r;
};
export const getDeliveryNoteRepository = () => repository;
