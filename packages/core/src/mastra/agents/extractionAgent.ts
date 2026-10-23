import { Agent } from '@mastra/core/agent';
import { resolveModel, type ModelSpec } from '../../models';

/** Bump on any change to the instructions or the message layout; recorded in every eval run and trace. */
export const EXTRACTION_PROMPT_VERSION = 'extract-v3';

export const EXTRACTION_INSTRUCTIONS = `You transcribe supplier documents (invoices, delivery notes, credit notes) received by restaurants into JSON.

Your only job is faithful transcription:
- Copy every line item in order: description, quantity, unit, net unit price, discount %, tax rate %, and the net line amount exactly as printed.
- Copy the printed tax summary (one entry per rate: taxable base and tax amount) and the printed total. When the document prints both a gross total and a smaller amount due after a withholding, the total is the amount due.
- Summary rows that are neither a line nor tax by rate go in printedCharges, as printed: surcharges added to the total (SURCHARGE), withholdings subtracted from it (WITHHOLDING, amount positive even if printed negative), fixed stamp duties (STAMP_DUTY). Never put them in the tax summary.
- documentControlCode is the tax-authority control code when the country conventions mention one (e.g. ATCUD), without its label.
- NEVER compute, fix or complete numbers. If the document's arithmetic is wrong, transcribe the wrong numbers as printed.
- Ignore handwritten notes and rubber stamps: they are not part of the document data.
- Numbers become plain JSON numbers using the country conventions given below ("1.234,56" -> 1234.56). Credit-note amounts stay negative if printed negative.
- Dates become YYYY-MM-DD. A field that is not printed is null (lists: empty array).
- Fiscal identifiers: return only the identifier value, never its printed label. "CIF: B12345674" -> "B12345674"; "NIF CLIENTE: 12345678Z" -> "12345678Z". Keep a country prefix only when it is part of the identifier itself ("ESB12345674", "FR12345678901").
- The issuer is the supplier that emits the document; the recipient is the restaurant.`;

const agents = new Map<string, Agent>();

/** One agent per model spec; the country context goes in the message, so a single agent serves every country. */
export function getExtractionAgent(spec: ModelSpec): Agent {
  let agent = agents.get(spec.key);
  if (!agent) {
    agent = new Agent({
      id: `extraction-agent:${spec.key}`,
      name: 'Extraction Agent',
      description: 'Transcribes a supplier document into the ExtractedDocument schema.',
      instructions: EXTRACTION_INSTRUCTIONS,
      model: resolveModel(spec),
    });
    agents.set(spec.key, agent);
  }
  return agent;
}
