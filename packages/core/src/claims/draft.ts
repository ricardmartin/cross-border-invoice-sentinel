import type { TracingContext } from '@mastra/core/observability';
import { z } from 'zod';
import { taxRegimeFor } from '../countries/regions';
import type { CountryPack } from '../countries/types';
import { cached, cacheKey } from '../llmCache';
import { CLAIM_PROMPT_VERSION, ClaimEmailSchema, getClaimAgent } from '../mastra/agents/claimAgent';
import { costUsd, type ModelSpec } from '../models';
import type { ExtractedDocument } from '../schemas/extracted';
import type { ReconciliationResult } from '../schemas/reconciliation';
import type { ValidationReport } from '../schemas/validated';
import { computeClaimAmount } from './amount';

const LANGUAGE: Record<string, string> = { es: 'Spanish', fr: 'French', it: 'Italian', en: 'English', de: 'German', pt: 'Portuguese', da: 'Danish' };

export const ClaimFactsSchema = z.object({
  language: z.string(),
  restaurant: z.string(),
  supplier: z.string(),
  invoiceNumber: z.string(),
  invoiceDate: z.string(),
  documentIssues: z.array(z.string()),
  deliveryIssues: z.array(z.string()),
  amountClaimed: z.string().nullable(),
  amountClaimedValue: z.number(),
  /** The claimed amount is gross (net difference + VAT), unlike the net figures in documentIssues. */
  amountIncludesVat: z.boolean(),
  /** From the country pack ("TTC", "IVA inclusa"…), so the model does not have to translate it. */
  vatIncludedLabel: z.string().nullable().default(null),
});
export type ClaimFacts = z.infer<typeof ClaimFactsSchema>;

export const ClaimDraftSchema = z.object({
  subject: z.string(),
  body: z.string(),
  language: z.string(),
  amountClaimed: z.number(),
  facts: ClaimFactsSchema,
  mode: z.enum(['llm', 'template']),
  model: z.string().nullable(),
  promptVersion: z.string(),
  usage: z.object({ inputTokens: z.number(), outputTokens: z.number() }),
  costUsd: z.number().nullable(),
  latencyMs: z.number(),
});
export type ClaimDraft = z.infer<typeof ClaimDraftSchema>;

/** Everything the e-mail may say, decided in code. */
export function buildClaimFacts(doc: ExtractedDocument, report: ValidationReport, reconciliation: ReconciliationResult | null, pack: CountryPack): ClaimFacts {
  const money = (n: number) => `${pack.formatAmount(n)} ${doc.currency}`;
  const amount = computeClaimAmount(doc, reconciliation, report.computed.charges);
  const deliveryIssues = (reconciliation?.lines ?? [])
    .filter((l) => l.kind === 'QUANTITY_DIFF' || l.kind === 'PRICE_DIFF' || l.kind === 'MISSING_IN_DELIVERY_NOTE')
    .map((l) => {
      const line = doc.lines[l.invoiceLineIndex!]!;
      const unit = line.unit ? ` ${line.unit}` : '';
      if (l.kind === 'MISSING_IN_DELIVERY_NOTE') return `"${line.description}": invoiced ${l.invoiceQuantity}${unit}, not on the ${pack.deliveryNoteName} (${money(l.amountAtStake)} incl. VAT)`;
      if (l.kind === 'QUANTITY_DIFF') return `"${line.description}": invoiced ${l.invoiceQuantity}${unit}, delivered ${l.deliveredQuantity}${unit} (${money(l.amountAtStake)} incl. VAT)`;
      return `"${line.description}": invoiced at ${money(l.invoiceUnitPrice!)}, ${pack.deliveryNoteName} price ${money(l.deliveryNoteUnitPrice!)} (${money(l.amountAtStake)} incl. VAT)`;
    });
  const [y, m, d] = doc.issueDate.split('-');
  return {
    language: LANGUAGE[pack.locale.slice(0, 2)] ?? pack.locale,
    restaurant: doc.recipient.name,
    supplier: doc.issuer.name,
    invoiceNumber: doc.documentNumber,
    invoiceDate: `${d}/${m}/${y}`,
    documentIssues: report.issues.filter((i) => i.severity === 'error').map((i) => i.message),
    deliveryIssues,
    amountClaimed: amount.total > 0 ? money(amount.total) : null,
    amountClaimedValue: amount.total,
    amountIncludesVat: amount.total > 0,
    vatIncludedLabel: amount.total > 0 ? taxRegimeFor(doc, pack).vatIncludedLabel : null,
  };
}

/** Deterministic fallback (Spanish house template) when the LLM draft fails its guardrails. */
function templateEmail(f: ClaimFacts) {
  const issues = [...f.documentIssues, ...f.deliveryIssues].map((i) => `- ${i}`).join('\n');
  return {
    subject: `Reclamación factura ${f.invoiceNumber} (${f.invoiceDate})`,
    body: `Estimados señores de ${f.supplier}:\n\nAl revisar su factura ${f.invoiceNumber} de fecha ${f.invoiceDate} hemos detectado lo siguiente:\n\n${issues}\n\n${
      f.amountClaimed ? `Les rogamos emitan una factura rectificativa o un abono por importe de ${f.amountClaimed} (IVA incluido).` : 'Les rogamos emitan una factura rectificativa.'
    }\n\nAtentamente,\nDepartamento de Compras\n${f.restaurant}`,
  };
}

/** Guardrails: the draft must cite the invoice number and, if there is one, the exact amount. */
export const claimPassesGuardrails = (email: { subject: string; body: string }, f: ClaimFacts) => {
  const text = `${email.subject}\n${email.body}`;
  const amountNumber = f.amountClaimed?.split(' ')[0];
  return text.includes(f.invoiceNumber) && (!amountNumber || text.includes(amountNumber));
};

export async function draftClaim(opts: { facts: ClaimFacts; model: ModelSpec; tracingContext?: TracingContext }): Promise<ClaimDraft> {
  const { facts, model } = opts;
  const key = cacheKey('claim', model.key, CLAIM_PROMPT_VERSION, JSON.stringify(facts));
  const { value } = await cached(key, async () => {
    const started = performance.now();
    const result = await getClaimAgent(model).generate(
      [{ role: 'user' as const, content: `Write the claim e-mail in ${facts.language}.\n\nfacts = ${JSON.stringify(facts, null, 2)}` }],
      { structuredOutput: { schema: ClaimEmailSchema }, modelSettings: { maxOutputTokens: 2000 }, tracingContext: opts.tracingContext },
    );
    return {
      email: ClaimEmailSchema.parse(result.object),
      usage: { inputTokens: result.totalUsage?.inputTokens ?? 0, outputTokens: result.totalUsage?.outputTokens ?? 0 },
      latencyMs: Math.round(performance.now() - started),
    };
  });
  const ok = claimPassesGuardrails(value.email, facts);
  const email = ok ? value.email : templateEmail(facts);
  return {
    ...email,
    language: facts.language,
    amountClaimed: facts.amountClaimedValue,
    facts,
    mode: ok ? 'llm' : 'template',
    model: model.key,
    promptVersion: CLAIM_PROMPT_VERSION,
    usage: value.usage,
    costUsd: costUsd(model, value.usage),
    latencyMs: value.latencyMs,
  };
}
