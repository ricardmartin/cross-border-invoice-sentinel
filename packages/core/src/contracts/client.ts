import { ContractMatchResponseSchema, type ContractMatchResponse } from '../schemas/contracts';
import type { ExtractedDocument } from '../schemas/extracted';

/**
 * HTTP client for the contracts service. A timeout or a malformed answer is an error the
 * workflow records; it never becomes a claim (the invoice is decided without the contract check).
 */

export interface ContractLookup {
  match(invoice: ExtractedDocument, restaurantId: string): Promise<ContractMatchResponse>;
}

export class HttpContractLookup implements ContractLookup {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs = Number(process.env.CONTRACTS_TIMEOUT_MS ?? 15000),
  ) {}

  async match(invoice: ExtractedDocument, restaurantId: string): Promise<ContractMatchResponse> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, '')}/v1/match`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        supplierTaxId: invoice.issuer.taxId,
        // The restaurant we process for is known (its tax id); the recipient printed on the invoice is a read and can be
        // misread (de-027: two digits swapped), which would hide a restaurant-only deal.
        restaurantTaxId: restaurantId,
        country: invoice.country,
        invoiceDate: invoice.issueDate,
        lines: invoice.lines.map((l, index) => ({ index, description: l.description, unit: l.unit })),
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) throw new Error(`contracts service ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return ContractMatchResponseSchema.parse(await res.json());
  }
}

let override: ContractLookup | null | undefined;
/** Tests inject a fake; null disables the check. */
export const setContractLookup = (lookup: ContractLookup | null | undefined) => (override = lookup);

export function getContractLookup(url: string | null): ContractLookup | null {
  if (override !== undefined) return override;
  return url ? new HttpContractLookup(url) : null;
}
