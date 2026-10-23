import type { ExtractedDocument } from '../schemas/extracted';
import type { CountryPack, TaxRegime, TaxRateHint } from './types';

/**
 * Which tax rates apply to a document. Goods are taxed where they are delivered,
 * so the region is the one of the recipient (the restaurant), found by postal code
 * in its address. Many invoices print only the client's name and tax id: then the
 * supplier's address decides (a local supplier). Neither matches → the pack's own rates.
 * Pure: the same document and pack always give the same regime.
 */
export function taxRegimeFor(doc: Pick<ExtractedDocument, 'recipient' | 'issuer'>, pack: CountryPack): TaxRegime {
  const regionOf = (address: string | null) => (address ? ((pack.regions ?? []).find((r) => r.postalCode.test(address)) ?? null) : null);
  // A printed client address wins, even when it is on the mainland.
  const region = doc.recipient.address ? regionOf(doc.recipient.address) : regionOf(doc.issuer.address);
  if (!region) {
    return {
      id: pack.code,
      label: pack.code,
      region: null,
      allowedTaxRates: pack.allowedTaxRates,
      taxRateHints: pack.taxRateHints ?? [],
      vatIncludedLabel: pack.vatIncludedLabel,
    };
  }
  return {
    id: `${pack.code}-${region.id}`,
    label: `${pack.code} (${region.name})`,
    region,
    allowedTaxRates: region.allowedTaxRates,
    taxRateHints: region.taxRateHints ?? [],
    vatIncludedLabel: region.vatIncludedLabel ?? pack.vatIncludedLabel,
  };
}

/** A region's hints from the mainland ones, when each mainland rate has a regional counterpart (PT: 23 % → 16 % in the Azores). */
export const mapRateHints = (hints: TaxRateHint[], rateMap: Record<number, number>): TaxRateHint[] =>
  hints.filter((h) => rateMap[h.rate] !== undefined).map((h) => ({ rate: rateMap[h.rate]!, keywords: h.keywords }));
