import { z } from 'zod';

/**
 * Contract price check. The contracts service (services/contracts) says which clause applies
 * to each invoice line and what price it agrees; comparing prices and any amount at stake is
 * computed here, in integer cents.
 */

/** What the service returns for one invoice line. */
export const ContractLineMatchSchema = z.object({
  index: z.number().int(),
  outcome: z.enum(['MATCHED', 'NO_CONTRACT', 'AMBIGUOUS']),
  clause: z
    .object({
      id: z.string(),
      contractId: z.string(),
      clause: z.string(),
      title: z.string(),
      contractKind: z.string(),
      validFrom: z.string(),
      validTo: z.string(),
      restaurantTaxId: z.string().nullable(),
      price: z.object({ amount: z.number(), currency: z.string(), unit: z.string().nullable() }),
    })
    .nullable(),
  reason: z.string(),
  decidedBy: z.string(),
  llmCalls: z.number().int(),
  inputTokens: z.number().int(),
  outputTokens: z.number().int(),
  costUsd: z.number().nullable(),
  latencyMs: z.number(),
  threadId: z.string(),
});
export type ContractLineMatch = z.infer<typeof ContractLineMatchSchema>;

export const ContractMatchResponseSchema = z.object({
  requestId: z.string(),
  selectModel: z.string().nullable(),
  promptVersion: z.string(),
  lines: z.array(ContractLineMatchSchema.passthrough()),
});
export type ContractMatchResponse = z.infer<typeof ContractMatchResponseSchema>;

export const ContractLineKindSchema = z.enum([
  'AT_CONTRACT',
  'ABOVE_CONTRACT',
  /** Supplier billed less than agreed: its loss, nothing to claim. */
  'BELOW_CONTRACT',
  'NO_CONTRACT',
  /** A clause could not be settled (ambiguous, other currency or unit, no price): no claim, a person looks. */
  'UNVERIFIED',
]);
export type ContractLineKind = z.infer<typeof ContractLineKindSchema>;

export const ContractCheckLineSchema = z.object({
  invoiceLineIndex: z.number().int(),
  kind: ContractLineKindSchema,
  clauseId: z.string().nullable(),
  clauseTitle: z.string().nullable(),
  contractKind: z.string().nullable(),
  invoiceUnitPrice: z.number().nullable(),
  agreedUnitPrice: z.number().nullable(),
  /** Quantity the overcharge applies to: the delivered quantity when the delivery note shows less. */
  quantity: z.number().nullable(),
  /** Amount billed above the agreed price, VAT included, in currency units. */
  amountAtStake: z.number(),
  note: z.string(),
});
export type ContractCheckLine = z.infer<typeof ContractCheckLineSchema>;

export const ContractCheckResultSchema = z.object({
  lines: z.array(ContractCheckLineSchema),
  amountAtStake: z.number(),
});
export type ContractCheckResult = z.infer<typeof ContractCheckResultSchema>;
