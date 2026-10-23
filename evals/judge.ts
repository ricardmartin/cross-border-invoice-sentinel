import { Agent } from '@mastra/core/agent';
import { cached, cacheKey, costUsd, parseModelSpec, resolveModel, type ClaimDraft } from '@sentinel/core';
import { z } from 'zod';

/**
 * LLM-as-judge for claim e-mails. Deterministic checks (invoice number, exact
 * amount) already run as guardrails in the workflow; the judge scores what code
 * cannot: language, tone, completeness and whether anything was invented.
 */

export const JUDGE_VERSION = 'claim-judge-v1';

export const JudgeVerdictSchema = z.object({
  citesInvoice: z.boolean().describe('Mentions the invoice number and date'),
  citesLines: z.boolean().describe('Mentions every affected line or issue listed in the facts'),
  citesAmount: z.boolean().describe('States the claimed amount exactly as in the facts (or asks for a correction without an amount when none is given)'),
  correctLanguage: z.boolean().describe('Written entirely in the requested language'),
  professionalTone: z.boolean().describe('Formal, courteous, concise, no threats'),
  inventedData: z.boolean().describe('Contains any number, date, line, name or promise NOT present in the facts'),
  score: z.number().describe('Overall 1-5: 5 ready to send as is, 4 minor style edits, 3 needs fixes, 2 major problems, 1 unusable'),
  justification: z.string().describe('Two or three sentences explaining the score'),
});
export type JudgeVerdict = z.infer<typeof JudgeVerdictSchema>;

const RUBRIC = `You are a strict reviewer of supplier claim e-mails written for a restaurant's purchasing department.
You get the FACTS (ground truth computed by an accounting engine) and the E-MAIL. Grade the e-mail against the facts only.
Rubric:
- cites the invoice number and date; cites every affected line/issue; states the amount exactly as in the facts (no amount → asks for a corrective invoice without inventing one);
- written in the requested language; formal and professional tone;
- invents nothing: any figure, date, product, name or commitment absent from the facts is invented data and caps the score at 2.
Score 1-5: 5 ready to send unchanged, 4 minor style edits, 3 needs fixes before sending, 2 major problems, 1 unusable.`;

const judgeModel = () => parseModelSpec(process.env.JUDGE_MODEL ?? 'anthropic:claude-sonnet-5-5');
let agent: Agent | null = null;

export async function judgeClaim(draft: ClaimDraft): Promise<JudgeVerdict & { costUsd: number | null }> {
  const model = judgeModel();
  agent ??= new Agent({ id: 'claim-judge', name: 'Claim Judge', instructions: RUBRIC, model: resolveModel(model) });
  const key = cacheKey('judge', JUDGE_VERSION, model.key, JSON.stringify(draft.facts), draft.subject, draft.body);
  const { value } = await cached(key, async () => {
    const res = await agent!.generate(
      [{ role: 'user' as const, content: `FACTS:\n${JSON.stringify(draft.facts, null, 2)}\n\nE-MAIL\nSubject: ${draft.subject}\n\n${draft.body}` }],
      { structuredOutput: { schema: JudgeVerdictSchema }, modelSettings: { maxOutputTokens: 1500 } },
    );
    return { verdict: JudgeVerdictSchema.parse(res.object), usage: { inputTokens: res.totalUsage?.inputTokens ?? 0, outputTokens: res.totalUsage?.outputTokens ?? 0 } };
  });
  const score = Math.min(5, Math.max(1, Math.round(value.verdict.score)));
  return { ...value.verdict, score: value.verdict.inventedData ? Math.min(score, 2) : score, costUsd: costUsd(model, value.usage) };
}
