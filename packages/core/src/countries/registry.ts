import { z } from 'zod';
import type { CountryPack } from './types';
import { esPack } from './es';
import { frPack } from './fr';
import { itPack } from './it';
import { ptPack } from './pt';
import { iePack } from './ie';
import { dkPack } from './dk';
import { dePack } from './de';
import { gbPack } from './gb';

/** Static part of the contract, checked when a pack is registered (fail fast on a bad pack). */
const PackShapeSchema = z.object({
  code: z.string().regex(/^[A-Z]{2}$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  name: z.string().min(1),
  currency: z.string().regex(/^[A-Z]{3}$/),
  locale: z.string().min(2),
  allowedTaxRates: z.array(z.number().min(0).max(100)).min(1),
  deliveryNoteName: z.string().min(1),
  vatIncludedLabel: z.string().min(1),
});

export class UnknownCountryError extends Error {
  constructor(readonly code: string) {
    super(`No country pack registered for "${code}"`);
    this.name = 'UnknownCountryError';
  }
}

const packs = new Map<string, CountryPack>();

export function registerCountryPack(pack: CountryPack): void {
  PackShapeSchema.parse(pack);
  if (packs.has(pack.code)) throw new Error(`Country pack ${pack.code} is already registered`);
  packs.set(pack.code, pack);
}

export function getCountryPack(code: string): CountryPack {
  const pack = packs.get(code.toUpperCase());
  if (!pack) throw new UnknownCountryError(code);
  return pack;
}

export const hasCountryPack = (code: string) => packs.has(code.toUpperCase());
export const listCountryPacks = (): CountryPack[] => [...packs.values()];

/**
 * Deterministic triage signal: which registered packs accept this tax id.
 * A matching country prefix (e.g. "FR…", "IT…", "ES…") is listed first.
 */
export function countriesForTaxId(raw: string): string[] {
  const prefix = raw.trim().toUpperCase().slice(0, 2);
  return listCountryPacks()
    .filter((p) => p.validateTaxId(raw).valid)
    .map((p) => p.code)
    .sort((a, b) => Number(b === prefix) - Number(a === prefix));
}

// Built-in packs. Adding a country = one folder + one line here.
for (const pack of [esPack, frPack, itPack, ptPack, iePack, dkPack, dePack, gbPack]) registerCountryPack(pack);
