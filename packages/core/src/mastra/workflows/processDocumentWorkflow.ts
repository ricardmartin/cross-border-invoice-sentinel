import type { AnySpan } from '@mastra/core/observability';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { ClaimDraftSchema, buildClaimFacts, draftClaim } from '../../claims/draft';
import { sendClaim } from '../../claims/outbox';
import { getCountryPack } from '../../countries/registry';
import { decideFinalStatus, nextAction, type AttemptSummary, type NextAction } from '../../decision/decide';
import { getDeliveryNoteRepository, type DeliveryNoteRecord } from '../../delivery/repository';
import { extractDocument, StoredExtractionSchema } from '../../extraction/extract';
import { triageDocument } from '../../extraction/triage';
import { defaultEscalationModel, defaultExtractionModel, parseModelSpec } from '../../models';
import { getExtractionPrompt, recordScores } from '../../observability/langfuse';
import { reconcile, reconciliationSignature } from '../../reconciliation/reconcile';
import { TriageResultSchema, type ExtractedDocument } from '../../schemas/extracted';
import { ReconciliationResultSchema } from '../../schemas/reconciliation';
import { FinalStatusSchema } from '../../schemas/status';
import { ValidationReportSchema } from '../../schemas/validated';
import { validateDocument } from '../../validation/engine';
import { buildRetryFeedback } from '../../validation/feedback';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const UsageSchema = z.object({ inputTokens: z.number(), outputTokens: z.number() });
const CallSchema = z.object({ usage: UsageSchema, costUsd: z.number().nullable(), latencyMs: z.number() });

export const ProcessDocumentInputSchema = z.object({
  file: z.object({ base64: z.string().min(1), mediaType: z.string(), name: z.string().optional() }),
  restaurantId: z.string(),
  config: z
    .object({
      primaryModel: z.string().optional(),
      escalationModel: z.string().optional(),
      claimModel: z.string().optional(),
      maxRetries: z.number().int().min(0).max(5).optional(),
      cascade: z.boolean().optional(),
    })
    .optional(),
});
export type ProcessDocumentInput = z.infer<typeof ProcessDocumentInputSchema>;

const ResolvedConfigSchema = z.object({
  primaryModel: z.string(),
  escalationModel: z.string(),
  claimModel: z.string(),
  maxRetries: z.number(),
  cascade: z.boolean(),
});

const AttemptSchema = z.object({
  index: z.number(),
  role: z.enum(['primary', 'escalation']),
  model: z.string(),
  promptVersion: z.string(),
  /** Saw the previous attempt and the validator's errors. */
  withFeedback: z.boolean(),
  /** Verification read of an attempt that passed after feedback: no feedback, no previous attempt. */
  blind: z.boolean(),
  document: StoredExtractionSchema,
  report: ValidationReportSchema,
  usage: UsageSchema,
  costUsd: z.number().nullable(),
  latencyMs: z.number(),
  cached: z.boolean(),
});
export type Attempt = z.infer<typeof AttemptSchema>;

const StopSchema = z.object({
  kind: z.literal('stop'),
  reason: z.enum(['passed', 'confirmed', 'exhausted', 'unverified']),
  agreeingAttempts: z.tuple([z.number(), z.number()]).optional(),
});

const TriageStepResultSchema = TriageResultSchema.extend({ supported: z.boolean(), cached: z.boolean() }).merge(CallSchema);

const LoopStateSchema = z.object({
  file: ProcessDocumentInputSchema.shape.file,
  restaurantId: z.string(),
  config: ResolvedConfigSchema,
  triage: TriageStepResultSchema,
  attempts: z.array(AttemptSchema),
  stop: StopSchema.nullable(),
});
type LoopState = z.infer<typeof LoopStateSchema>;

export const ReconciliationOutcomeSchema = z.object({
  result: ReconciliationResultSchema,
  /** confirmed: a re-read of the delivery note agrees; resolved: the re-read removed the mismatch; uncertain: reads disagree. */
  verification: z.enum(['not_needed', 'confirmed', 'resolved', 'uncertain']),
  firstRead: ReconciliationResultSchema.nullable(),
  /** References found only by a near match on the number (the invoice's reference was probably misread). */
  nearMatches: z.array(z.object({ referenced: z.string(), matched: z.string() })).default([]),
});

const ClaimReviewSchema = z.object({
  action: z.enum(['approve', 'discard']),
  edited: z.boolean(),
  reviewer: z.string().nullable(),
  decidedAt: z.string(),
  subject: z.string(),
  body: z.string(),
  messageId: z.string().nullable(),
});

export const ProcessDocumentResultSchema = z.object({
  status: FinalStatusSchema,
  reason: z.string(),
  traceId: z.string().nullable(),
  restaurantId: z.string(),
  country: z.string(),
  packVersion: z.string().nullable(),
  triage: TriageStepResultSchema,
  document: StoredExtractionSchema.nullable(),
  report: ValidationReportSchema.nullable(),
  attempts: z.array(AttemptSchema),
  reconciliation: ReconciliationOutcomeSchema.nullable(),
  deliveryNoteSaved: z.boolean(),
  claim: z.object({ draft: ClaimDraftSchema, review: ClaimReviewSchema.nullable() }).nullable(),
  config: ResolvedConfigSchema,
  /** Extra LLM calls outside triage/extraction: delivery-note re-reads, claim drafting. */
  extraCalls: z.array(CallSchema.extend({ purpose: z.string() })),
  totals: z.object({ usage: UsageSchema, costUsd: z.number().nullable(), latencyMs: z.number() }),
});
export type ProcessDocumentResult = z.infer<typeof ProcessDocumentResultSchema>;

export const ClaimReviewResumeSchema = z.object({
  action: z.enum(['approve', 'discard']),
  subject: z.string().optional(),
  body: z.string().optional(),
  reviewer: z.string().optional(),
});
export type ClaimReviewDecision = z.infer<typeof ClaimReviewResumeSchema>;

export const ClaimReviewSuspendSchema = z.object({ result: ProcessDocumentResultSchema });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const summaries = (attempts: Attempt[]): AttemptSummary[] => attempts.map((a) => ({ index: a.index, role: a.role, report: a.report, withFeedback: a.withFeedback }));

function computeTotals(calls: z.infer<typeof CallSchema>[]) {
  const costs = calls.map((c) => c.costUsd);
  return {
    usage: {
      inputTokens: calls.reduce((s, c) => s + c.usage.inputTokens, 0),
      outputTokens: calls.reduce((s, c) => s + c.usage.outputTokens, 0),
    },
    costUsd: costs.some((c) => c === null) ? null : costs.reduce<number>((s, c) => s + c!, 0),
    latencyMs: calls.reduce((s, c) => s + c.latencyMs, 0),
  };
}
const totalsOf = (r: Pick<ProcessDocumentResult, 'triage' | 'attempts' | 'extraCalls'>) => computeTotals([r.triage, ...r.attempts, ...r.extraCalls]);

const rootSpan = (span: AnySpan | undefined): AnySpan | undefined => {
  let s = span;
  while (s?.parent) s = s.parent;
  return s;
};

/** Puts the document-level facts on the trace (metadata, tags) and records the scores. */
function annotateTrace(span: AnySpan | undefined, result: ProcessDocumentResult): string | null {
  const root = rootSpan(span);
  const last = result.attempts.at(-1);
  root?.update({
    metadata: {
      restaurantId: result.restaurantId,
      country: result.country,
      docType: result.triage.docType,
      model: result.config.primaryModel,
      escalated: result.attempts.some((a) => a.role === 'escalation'),
      promptVersion: last?.promptVersion ?? null,
      countryPackVersion: result.packVersion,
      finalStatus: result.status,
      extractionAttempts: result.attempts.length,
      reconciliation: result.reconciliation?.result.status ?? null,
      costUsd: result.totals.costUsd,
    },
  });
  // Tags are read from the root span when it ends; the country is only known after triage.
  if (root) root.tags = [...new Set([...(root.tags ?? []), `country:${result.country}`, `docType:${result.triage.docType}`, `status:${result.status}`])];

  const traceId = span?.traceId ?? null;
  recordScores(
    traceId ?? undefined,
    {
      tax_math_passed: result.report?.taxMathPassed ?? false,
      tax_id_valid: result.report?.taxIdValid ?? false,
      extraction_attempts: result.attempts.length,
      final_status: result.status,
      ...(result.reconciliation ? { reconciliation_status: result.reconciliation.result.status } : {}),
      ...(result.totals.costUsd !== null ? { cost_usd: result.totals.costUsd } : {}),
    },
    { final_status: result.reason },
  );
  return traceId;
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const triageStep = createStep({
  id: 'triage',
  description: 'Document type and issuer country (LLM guess verified against tax-id checksums).',
  inputSchema: ProcessDocumentInputSchema,
  outputSchema: LoopStateSchema,
  execute: async ({ inputData, tracingContext, bail }) => {
    const config = {
      primaryModel: inputData.config?.primaryModel ?? defaultExtractionModel().key,
      escalationModel: inputData.config?.escalationModel ?? defaultEscalationModel().key,
      claimModel: inputData.config?.claimModel ?? process.env.CLAIM_MODEL ?? inputData.config?.primaryModel ?? defaultExtractionModel().key,
      maxRetries: inputData.config?.maxRetries ?? 2,
      cascade: inputData.config?.cascade ?? true,
    };
    const call = await triageDocument({ file: inputData.file, model: parseModelSpec(config.primaryModel), tracingContext });
    const triage = { ...call.triage, usage: call.usage, costUsd: call.costUsd, latencyMs: call.latencyMs, cached: call.cached };
    tracingContext?.currentSpan?.update({ output: { ...call.triage, issuerTaxId: call.issuerTaxId } });

    if (!triage.supported || triage.docType === 'OTHER') {
      const result: ProcessDocumentResult = {
        status: 'EXTRACTION_UNCERTAIN',
        reason: triage.supported ? 'Not an invoice, delivery note or credit note' : `No country pack for ${triage.country}`,
        traceId: null,
        restaurantId: inputData.restaurantId,
        country: triage.country,
        packVersion: null,
        triage,
        document: null,
        report: null,
        attempts: [],
        reconciliation: null,
        deliveryNoteSaved: false,
        claim: null,
        config,
        extraCalls: [],
        totals: computeTotals([triage]),
      };
      result.traceId = annotateTrace(tracingContext?.currentSpan, result);
      return bail(result);
    }
    return { file: inputData.file, restaurantId: inputData.restaurantId, config, triage, attempts: [], stop: null };
  },
});

const extractionAttemptStep = createStep({
  id: 'extraction-attempt',
  description: 'One extraction read, validated; on failure the next iteration retries with the concrete errors.',
  inputSchema: LoopStateSchema,
  outputSchema: LoopStateSchema,
  execute: async ({ inputData, tracingContext }) => {
    const pack = getCountryPack(inputData.triage.country);
    const action: NextAction = inputData.attempts.length ? nextAction(summaries(inputData.attempts), inputData.config) : { kind: 'retry', role: 'primary' };
    if (action.kind === 'stop') return { ...inputData, stop: action };

    const index = inputData.attempts.length + 1;
    const model = parseModelSpec(action.role === 'primary' ? inputData.config.primaryModel : inputData.config.escalationModel);
    const blind = action.blind === true;
    const previous = blind ? undefined : inputData.attempts.at(-1);
    const feedback = previous ? (buildRetryFeedback(previous.report) ?? undefined) : undefined;
    tracingContext?.currentSpan?.update({
      name: `extraction attempt #${index} (${action.role}${blind ? ', blind' : ''})`,
      metadata: { model: model.key, role: action.role, withFeedback: Boolean(feedback), blind },
    });

    const prompt = await getExtractionPrompt();
    const res = await extractDocument({
      file: inputData.file,
      pack,
      model,
      prompt,
      feedback,
      previous: previous?.document as ExtractedDocument | undefined,
      sample: blind ? index : undefined,
      tracingContext,
    });
    const report = validateDocument(res.document, pack);
    const attempt: Attempt = {
      index,
      role: action.role,
      model: model.key,
      promptVersion: res.promptVersion,
      withFeedback: Boolean(feedback),
      blind,
      document: StoredExtractionSchema.parse(res.document),
      report,
      usage: res.usage,
      costUsd: res.costUsd,
      latencyMs: res.latencyMs,
      cached: res.cached,
    };
    const attempts = [...inputData.attempts, attempt];
    const after: NextAction = nextAction(summaries(attempts), inputData.config);
    tracingContext?.currentSpan?.update({
      output: { passed: report.passed, errors: report.issues.filter((i) => i.severity === 'error').map((i) => i.message), next: after },
    });
    return { ...inputData, attempts, stop: after.kind === 'stop' ? after : null };
  },
});

const ValidatedStateSchema = LoopStateSchema.extend({ report: ValidationReportSchema });

const validationStep = createStep({
  id: 'validation',
  description: 'Deterministic validation of the final read with the country pack (pure TypeScript).',
  inputSchema: LoopStateSchema,
  outputSchema: ValidatedStateSchema,
  execute: async ({ inputData }) => {
    const final = inputData.attempts.at(-1)!;
    const report = validateDocument(final.document as ExtractedDocument, getCountryPack(inputData.triage.country));
    return { ...inputData, report };
  },
});

const ReconciledStateSchema = ValidatedStateSchema.extend({
  reconciliation: ReconciliationOutcomeSchema.nullable(),
  deliveryNoteSaved: z.boolean(),
  extraCalls: z.array(CallSchema.extend({ purpose: z.string() })),
});

const reconciliationStep = createStep({
  id: 'reconciliation',
  description:
    'Delivery notes are stored for later; invoices are matched line by line against the delivery notes they reference. A mismatch is re-read on the delivery note before it counts.',
  inputSchema: ValidatedStateSchema,
  outputSchema: ReconciledStateSchema,
  execute: async ({ inputData, tracingContext }) => {
    const doc = inputData.attempts.at(-1)!.document as ExtractedDocument;
    const trusted = inputData.stop?.reason === 'passed' || inputData.stop?.reason === 'confirmed';
    const repo = getDeliveryNoteRepository();
    const base = { ...inputData, reconciliation: null, deliveryNoteSaved: false, extraCalls: [] as ProcessDocumentResult['extraCalls'] };

    if (doc.docType === 'DELIVERY_NOTE') {
      if (!inputData.report.passed || !doc.issuer.taxId) return base;
      await repo.save({
        restaurantId: inputData.restaurantId,
        supplierTaxId: doc.issuer.taxId,
        number: doc.documentNumber,
        country: inputData.triage.country,
        document: doc,
        file: inputData.file,
        traceId: tracingContext?.currentSpan?.traceId ?? null,
        savedAt: new Date().toISOString(),
      });
      return { ...base, deliveryNoteSaved: true };
    }
    if (doc.docType !== 'INVOICE' || !trusted || !doc.deliveryNoteRefs.length || !doc.issuer.taxId) return base;

    const found: DeliveryNoteRecord[] = [];
    const missing: string[] = [];
    const nearMatches: { referenced: string; matched: string }[] = [];
    for (const ref of doc.deliveryNoteRefs) {
      let rec = await repo.find(inputData.restaurantId, doc.issuer.taxId, ref);
      if (!rec && repo.findNear) {
        rec = await repo.findNear(inputData.restaurantId, doc.issuer.taxId, ref);
        if (rec && found.some((f) => f.number === rec!.number)) rec = null; // already matched by another reference
        if (rec) nearMatches.push({ referenced: ref, matched: rec.number });
      }
      if (rec) found.push(rec);
      else missing.push(ref);
    }
    if (nearMatches.length) tracingContext?.currentSpan?.update({ metadata: { nearMatches } });
    const first = reconcile(doc, found.map((r) => ({ number: r.number, document: r.document })), missing);
    if (first.status !== 'DISCREPANCIA' || first.amountAtStake <= 0) {
      return { ...base, reconciliation: { result: first, verification: 'not_needed' as const, firstRead: null, nearMatches } };
    }

    // Same rule as the invoice: a disputed delivered quantity must survive a second, independent read.
    const disputed = first.lines.filter((l) => l.kind !== 'MATCH' && l.invoiceLineIndex !== null).map((l) => doc.lines[l.invoiceLineIndex!]!.description);
    const extraCalls: ProcessDocumentResult['extraCalls'] = [];
    const reread: DeliveryNoteRecord[] = [];
    for (const rec of found) {
      const res = await extractDocument({
        file: rec.file,
        pack: getCountryPack(rec.country),
        model: parseModelSpec(inputData.config.primaryModel),
        previous: rec.document,
        feedback: `Verification read. Re-check, line by line, which products this delivery note lists and their exact delivered quantities, in particular: ${disputed
          .map((d) => `"${d}"`)
          .join(', ')}. Transcribe exactly what is printed.`,
        tracingContext,
      });
      extraCalls.push({ purpose: 'delivery-note-verification', usage: res.usage, costUsd: res.costUsd, latencyMs: res.latencyMs });
      reread.push({ ...rec, document: res.document });
    }
    const second = reconcile(doc, reread.map((r) => ({ number: r.number, document: r.document })), missing);
    const verification =
      reconciliationSignature(second) === reconciliationSignature(first)
        ? ('confirmed' as const)
        : second.status === 'SIN_DISCREPANCIA' || second.amountAtStake <= 0
          ? ('resolved' as const)
          : ('uncertain' as const);
    if (verification === 'resolved') for (const r of reread) await repo.save(r); // keep the corrected read
    tracingContext?.currentSpan?.update({ output: { first: first.status, second: second.status, verification, amountAtStake: second.amountAtStake } });
    return { ...base, extraCalls, reconciliation: { result: verification === 'confirmed' ? first : second, verification, firstRead: first, nearMatches } };
  },
});

const decisionStep = createStep({
  id: 'decision',
  description: 'VALID / EXTRACTION_UNCERTAIN / SUPPLIER_DISCREPANCY / INVALID_TAX_ID from the attempts and the reconciliation.',
  inputSchema: ReconciledStateSchema,
  outputSchema: ProcessDocumentResultSchema,
  execute: async ({ inputData, tracingContext }) => {
    let { status, reason } = decideFinalStatus(summaries(inputData.attempts), inputData.stop!);
    const rec = inputData.reconciliation;
    if (rec && (status === 'VALID' || status === 'SUPPLIER_DISCREPANCY')) {
      if (rec.verification === 'uncertain') {
        status = 'EXTRACTION_UNCERTAIN';
        reason = 'Delivery-note reads disagree on the disputed lines: needs human review';
      } else if (rec.result.status === 'DISCREPANCIA' && rec.result.amountAtStake > 0) {
        const invoiceReason = status === 'SUPPLIER_DISCREPANCY' ? `${reason}; ` : '';
        status = 'SUPPLIER_DISCREPANCY';
        reason = `${invoiceReason}billed goods not delivered (${rec.result.amountAtStake.toFixed(2)} incl. VAT, confirmed by a re-read of the delivery note)`;
      } else if (rec.result.status === 'FALTAN_DOCUMENTOS') {
        reason += `; delivery note(s) not received yet: ${rec.result.deliveryNoteNumbers.join(', ')}`;
      }
      if (rec.nearMatches.length) {
        reason += `; delivery note matched by a near number (${rec.nearMatches.map((m) => `invoice reads "${m.referenced}" → "${m.matched}"`).join(', ')})`;
      }
    }
    const pack = getCountryPack(inputData.triage.country);
    const result: ProcessDocumentResult = {
      status,
      reason,
      traceId: null,
      restaurantId: inputData.restaurantId,
      country: pack.code,
      packVersion: pack.version,
      triage: inputData.triage,
      document: inputData.attempts.at(-1)!.document,
      report: inputData.report,
      attempts: inputData.attempts,
      reconciliation: inputData.reconciliation,
      deliveryNoteSaved: inputData.deliveryNoteSaved,
      claim: null,
      config: inputData.config,
      extraCalls: inputData.extraCalls,
      totals: { usage: { inputTokens: 0, outputTokens: 0 }, costUsd: null, latencyMs: 0 },
    };
    result.totals = totalsOf(result);
    result.traceId = annotateTrace(tracingContext?.currentSpan, result);
    return result;
  },
});

const claimDraftStep = createStep({
  id: 'claim-draft',
  description: "Only for SUPPLIER_DISCREPANCY: drafts the claim in the supplier's language from deterministic facts.",
  inputSchema: ProcessDocumentResultSchema,
  outputSchema: ProcessDocumentResultSchema,
  execute: async ({ inputData, tracingContext }) => {
    if (inputData.status !== 'SUPPLIER_DISCREPANCY' || !inputData.document || !inputData.report) return inputData;
    const pack = getCountryPack(inputData.country);
    const facts = buildClaimFacts(inputData.document as ExtractedDocument, inputData.report, inputData.reconciliation?.result ?? null, pack);
    const draft = await draftClaim({ facts, model: parseModelSpec(inputData.config.claimModel), tracingContext });
    tracingContext?.currentSpan?.update({ output: { subject: draft.subject, mode: draft.mode, amountClaimed: draft.amountClaimed } });
    const result = {
      ...inputData,
      claim: { draft, review: null },
      extraCalls: [...inputData.extraCalls, { purpose: 'claim-draft', usage: draft.usage, costUsd: draft.costUsd, latencyMs: draft.latencyMs }],
    };
    return { ...result, totals: totalsOf(result) };
  },
});

const humanReviewStep = createStep({
  id: 'human-review',
  description: 'Suspends until a person approves (optionally edited) or discards the claim. Nothing is sent without approval.',
  inputSchema: ProcessDocumentResultSchema,
  outputSchema: ProcessDocumentResultSchema,
  resumeSchema: ClaimReviewResumeSchema,
  suspendSchema: ClaimReviewSuspendSchema,
  execute: async ({ inputData, resumeData, suspend }) => {
    const claim = inputData.claim;
    if (!claim) return inputData;
    if (!resumeData) return await suspend({ result: inputData });

    const subject = resumeData.subject ?? claim.draft.subject;
    const body = resumeData.body ?? claim.draft.body;
    const edited = resumeData.action === 'approve' && (subject !== claim.draft.subject || body !== claim.draft.body);
    const message =
      resumeData.action === 'approve'
        ? sendClaim({
            to: inputData.document?.issuer.name ?? 'supplier',
            subject,
            body,
            invoiceNumber: inputData.document?.documentNumber ?? '',
            restaurantId: inputData.restaurantId,
            traceId: inputData.traceId,
          })
        : null;
    // Human feedback goes onto the original document trace.
    recordScores(inputData.traceId ?? undefined, { human_approved: resumeData.action === 'approve', human_edited: edited }, {
      human_approved: resumeData.reviewer ? `by ${resumeData.reviewer}` : '',
    });
    return {
      ...inputData,
      claim: {
        draft: claim.draft,
        review: {
          action: resumeData.action,
          edited,
          reviewer: resumeData.reviewer ?? null,
          decidedAt: new Date().toISOString(),
          subject,
          body,
          messageId: message?.id ?? null,
        },
      },
    };
  },
});

export const processDocumentWorkflow = createWorkflow({
  id: 'process-document',
  description: 'Triage → extraction with self-correction and model cascade → validation → reconciliation → decision → claim draft → human review.',
  inputSchema: ProcessDocumentInputSchema,
  outputSchema: ProcessDocumentResultSchema,
})
  .then(triageStep)
  .dountil(extractionAttemptStep, async ({ inputData }) => inputData.stop !== null)
  .then(validationStep)
  .then(reconciliationStep)
  .then(decisionStep)
  .then(claimDraftStep)
  .then(humanReviewStep)
  .commit();
