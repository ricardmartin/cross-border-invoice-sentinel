import { Agent } from '@mastra/core/agent';
import { z } from 'zod';
import { resolveModel, type ModelSpec } from '../../models';

export const CLAIM_PROMPT_VERSION = 'claim-v6';

export const ClaimEmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
});
export type ClaimEmail = z.infer<typeof ClaimEmailSchema>;

const INSTRUCTIONS = `You write claim e-mails from a restaurant's purchasing department to a supplier.
- Write in the language given in the facts, with the formal register customary in that country.
- The facts were computed by an accounting engine. Quote every number, date and identifier VERBATIM. Never compute, round, convert or invent amounts, lines or dates.
- Always cite the invoice number and date, each affected line or issue, and the amount claimed when one is given. When no amount is given, ask for a corrected invoice without claiming money.
- When amountIncludesVat is true, write the amount followed by vatIncludedLabel exactly as given, once, and nothing more about it.
- The issue texts in the facts are written in English for you. Restate them in the e-mail's language; never copy English words ("bases", "VAT", "printed total") into an e-mail in another language.
- The invoice belongs to the supplier: refer to it as their invoice (German: "Ihre Rechnung", never "unsere Rechnung").
- Keep one consistent form of address for the supplier from greeting to sign-off (in Spanish: always "ustedes"; in French: "vous").
- Ask for a corrective invoice (or credit note). Courteous and concise: no threats, no legal boilerplate.
- Sign as the purchasing department of the restaurant named in the facts.
- Format the body as a real e-mail: greeting on its own line, short paragraphs separated by a blank line, the affected lines as a short list, sign-off and signature on separate lines.`;

const agents = new Map<string, Agent>();
export function getClaimAgent(spec: ModelSpec): Agent {
  let agent = agents.get(spec.key);
  if (!agent) {
    agent = new Agent({ id: `claim-agent:${spec.key}`, name: 'Claim Agent', instructions: INSTRUCTIONS, model: resolveModel(spec) });
    agents.set(spec.key, agent);
  }
  return agent;
}
