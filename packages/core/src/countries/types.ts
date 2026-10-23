import type { ExtractedDocument } from '../schemas/extracted';
import type { ComputedTotals, ValidationIssue } from '../schemas/validated';

export interface TaxIdCheck {
  valid: boolean;
  /** Scheme recognised, e.g. "NIF", "CIF", "SIRET", "PARTITA_IVA". "UNKNOWN" when no pattern matched. */
  type: string;
  /** Upper-cased id without separators or country prefix. */
  normalized: string;
  reason?: string;
}

export interface ValidatorContext {
  pack: CountryPack;
  computed: ComputedTotals;
  /** Rates that apply to this document (the pack's or its region's). */
  regime: TaxRegime;
}

/** Country-specific rule. Must be pure and never throw. */
export type Validator = (doc: ExtractedDocument, ctx: ValidatorContext) => ValidationIssue[];

export interface TaxRateHint {
  rate: number;
  /** Lower-case keywords (word-boundary matched) of products that normally carry this rate. */
  keywords: string[];
}

/** Local labels the extractor should look for. */
export interface LocalFieldNames {
  invoice: string[];
  deliveryNote: string[];
  creditNote: string[];
  taxId: string[];
  taxBase: string[];
  taxAmount: string[];
  total: string[];
}

/**
 * Part of a country with its own indirect-tax rates (Azores, Madeira, Canarias…).
 * The region is the one of the delivery address (the restaurant), read from the
 * recipient's postal code; documents outside every region use the pack's own rates.
 */
export interface TaxRegion {
  /** Stable id for traces and reports, e.g. "AZORES". */
  id: string;
  /** As printed in messages, e.g. "Açores". */
  name: string;
  /** Matches a postal code of the region inside the recipient address. */
  postalCode: RegExp;
  allowedTaxRates: number[];
  taxRateHints?: TaxRateHint[];
  /** When the region uses another tax (Canarias: IGIC), how a gross amount is qualified. */
  vatIncludedLabel?: string;
}

/**
 * Summary rows other than VAT that a country allows (see PrintedCharge). A kind the pack
 * does not declare is treated as a misread: no country prints a withholding that does not exist there.
 */
export interface ChargeRules {
  /** Added to the total, rate tied to the VAT rate of the base it applies to (ES recargo de equivalencia: 21 % → 5,2 %). */
  surcharge?: {
    name: string;
    rateByTaxRate: Record<number, number>;
    /** Warning shown whenever it appears, e.g. a regime restaurants are normally not in. */
    notice?: string;
  };
  /** Subtracted from the amount due, on the taxable base (ES IRPF, IT ritenuta d'acconto). */
  withholding?: { name: string; rates: number[] };
  /** Fixed amount added to the total, only due when the amount without VAT exceeds a threshold (IT bollo). */
  stampDuty?: { name: string; amount: number; dueAboveUntaxed: number };
}

/**
 * The contract that makes adding a country cheap: everything country-specific
 * lives behind this interface, the core never branches on country codes.
 */
export interface CountryPack {
  code: string;
  /** Semver; bump on any rule change so traces and eval runs record which rules applied. */
  version: string;
  name: string;
  currency: string;
  /** BCP 47 locale for formats and the claim e-mail, e.g. "es-ES". */
  locale: string;
  allowedTaxRates: number[];
  validateTaxId(id: string): TaxIdCheck;
  /** Strict: throws FormatError on input that is not an amount. */
  parseAmount(raw: string): number;
  /** Returns ISO YYYY-MM-DD or null when not a real calendar date. */
  parseDate(raw: string): string | null;
  formatAmount(amount: number): string;
  extraValidators?: Validator[];
  /** Extraction hints (local field names, typical layouts). Local fallback of the Langfuse-managed prompt. */
  promptContext: string;
  /** "albarán", "bon de livraison", "DDT". */
  deliveryNoteName: string;
  /** How a gross amount is qualified in a claim e-mail: "IVA incluido", "TTC", "IVA inclusa". */
  vatIncludedLabel: string;
  fieldNames: LocalFieldNames;
  taxRateHints?: TaxRateHint[];
  /** Regions with their own rates; `allowedTaxRates` / `taxRateHints` above are the rest of the country. */
  regions?: TaxRegion[];
  /** Surcharges, withholdings and stamp duties this country allows; none when absent. */
  charges?: ChargeRules;
}

/** The rates that apply to one document: the pack's, or its region's. */
export interface TaxRegime {
  /** "PT" or "PT-AZORES". */
  id: string;
  /** For messages: "PT" or "PT (Açores)". */
  label: string;
  region: TaxRegion | null;
  allowedTaxRates: number[];
  taxRateHints: TaxRateHint[];
  vatIncludedLabel: string;
}

export class FormatError extends Error {
  constructor(
    message: string,
    readonly raw: string,
  ) {
    super(message);
    this.name = 'FormatError';
  }
}
