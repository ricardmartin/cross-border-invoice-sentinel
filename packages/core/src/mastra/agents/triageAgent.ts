import { Agent } from '@mastra/core/agent';
import { z } from 'zod';
import { countriesForTaxId, hasCountryPack, listCountryPacks } from '../../countries/registry';
import { resolveModel, type ModelSpec } from '../../models';
import type { TriageResult } from '../../schemas/extracted';

export const TRIAGE_PROMPT_VERSION = 'triage-v2';

/** What the model returns: its guess plus the raw issuer tax id, which code then verifies. */
export const TriageOutputSchema = z.object({
  docType: z.enum(['INVOICE', 'DELIVERY_NOTE', 'CREDIT_NOTE', 'OTHER']),
  country: z.string().describe('ISO 3166-1 alpha-2 code of the ISSUER (supplier)'),
  confidence: z.number().describe('0 to 1'),
  signals: z.array(z.string()).describe('Short evidence list: tax id format, currency, language, address, document title'),
  issuerTaxId: z.string().nullable().describe('Issuer fiscal id as printed, without its label; null if not visible'),
});
export type TriageOutput = z.infer<typeof TriageOutputSchema>;

const instructions = () => `You classify supplier documents received by restaurants.
Return the document type and the country of the ISSUER (the supplier), not of the restaurant.
Use: the issuer's fiscal identifier format, currency, language, address and document title.
Document types: INVOICE (factura, facture, fattura, fatura, invoice, faktura, Rechnung, ticket/factura simplificada), DELIVERY_NOTE (albarán, bon de livraison, DDT, guia de remessa, delivery note/docket, følgeseddel, Lieferschein), CREDIT_NOTE (abono, factura rectificativa, avoir, nota di credito, nota de crédito, credit note, kreditnota, Gutschrift), OTHER.
Supported countries: ${listCountryPacks().map((p) => `${p.code} (${p.name}, ${p.currency}, ids: ${p.fieldNames.taxId.join('/')})`).join('; ')}. Other countries are possible: report them honestly.`;

const agents = new Map<string, Agent>();
export function getTriageAgent(spec: ModelSpec): Agent {
  let agent = agents.get(spec.key);
  if (!agent) {
    agent = new Agent({ id: `triage-agent:${spec.key}`, name: 'Triage Agent', instructions: instructions(), model: resolveModel(spec) });
    agents.set(spec.key, agent);
  }
  return agent;
}

export interface ResolvedTriage extends TriageResult {
  /** True when a registered country pack will handle the document. */
  supported: boolean;
}

/**
 * Combines the model's guess with a deterministic check: a tax id that passes a
 * pack's checksum is strong evidence. Agreement raises confidence; on conflict
 * the checksum wins.
 */
export function resolveTriage(out: TriageOutput): ResolvedTriage {
  const llmCountry = out.country.trim().toUpperCase();
  const candidates = out.issuerTaxId ? countriesForTaxId(out.issuerTaxId) : [];
  let country = llmCountry;
  let confidence = Math.min(Math.max(out.confidence, 0), 1);
  const signals = [...out.signals];

  if (candidates.includes(llmCountry)) {
    confidence = Math.max(confidence, 0.95);
    signals.push(`tax id ${out.issuerTaxId} passes the ${llmCountry} checksum`);
  } else if (candidates.length) {
    country = candidates[0]!;
    confidence = Math.min(confidence, 0.6);
    signals.push(`model said ${llmCountry}, but tax id ${out.issuerTaxId} only validates for ${candidates.join('/')}`);
  }

  return { docType: out.docType, country, confidence, signals, supported: hasCountryPack(country) };
}
