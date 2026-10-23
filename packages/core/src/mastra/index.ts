import { LibSQLStore } from '@mastra/libsql';
import { Mastra } from '@mastra/core/mastra';
import { createObservability, flushLangfuse } from '../observability/langfuse';
import { catalogMatcherTool, getDeliveryNoteTool } from './tools';
import {
  ClaimReviewResumeSchema,
  ClaimReviewSuspendSchema,
  processDocumentWorkflow,
  ProcessDocumentInputSchema,
  type ClaimReviewDecision,
  type ProcessDocumentInput,
  type ProcessDocumentResult,
} from './workflows/processDocumentWorkflow';

const observability = createObservability();

export const mastra = new Mastra({
  workflows: { processDocumentWorkflow },
  tools: { catalogMatcherTool, getDeliveryNoteTool },
  // Suspended runs (claims awaiting approval) must survive restarts and be resumable from another request.
  storage: new LibSQLStore({ id: 'sentinel-store', url: process.env.MASTRA_DB_URL ?? 'file:./mastra.db' }),
  ...(observability ? { observability } : {}),
});

export interface ProcessOptions {
  /** Extra trace tags, e.g. ["eval", "run:abc123"]. */
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export type ProcessOutcome =
  | { state: 'completed'; runId: string; result: ProcessDocumentResult }
  /** A claim draft waits for a human: call resumeClaimReview(runId, decision). */
  | { state: 'awaiting_review'; runId: string; result: ProcessDocumentResult };

const workflow = () => mastra.getWorkflow('processDocumentWorkflow');

function toOutcome(runId: string, res: Awaited<ReturnType<Awaited<ReturnType<ReturnType<typeof workflow>['createRun']>>['start']>>): ProcessOutcome {
  if (res.status === 'success') return { state: 'completed', runId, result: { ...res.result, traceId: res.result.traceId ?? res.traceId ?? null } };
  if (res.status === 'suspended') {
    const step = (res.steps as Record<string, { suspendPayload?: unknown }>)['human-review'];
    const candidates = [step?.suspendPayload, res.suspendPayload, ...Object.values((res.suspendPayload as object | null) ?? {})];
    const payload = candidates.map((c) => ClaimReviewSuspendSchema.safeParse(c)).find((p) => p.success)?.data;
    if (!payload) throw new Error(`Run ${runId} suspended without a claim payload`);
    return { state: 'awaiting_review', runId, result: payload.result };
  }
  const error = res.status === 'failed' ? res.error : undefined;
  const detail = error instanceof Error ? error.message : error === undefined ? '' : JSON.stringify(error).slice(0, 2000);
  throw new Error(`process-document ${res.status}: ${detail}`);
}

/** Runs the document workflow. One Langfuse trace per document. */
export async function processDocument(input: ProcessDocumentInput, opts: ProcessOptions = {}): Promise<ProcessOutcome> {
  const inputData = ProcessDocumentInputSchema.parse(input);
  const run = await workflow().createRun();
  const res = await run.start({
    inputData,
    tracingOptions: {
      rootSpanName: 'process-document',
      tags: [`restaurant:${inputData.restaurantId}`, ...(opts.tags ?? [])],
      metadata: { restaurantId: inputData.restaurantId, fileName: inputData.file.name, ...opts.metadata },
      hideInput: true, // the document is a large base64 blob; the extracted data is on the spans
    },
  });
  return toOutcome(run.runId, res);
}

/** Approve (optionally with an edited text) or discard a suspended claim. Approving "sends" it. */
export async function resumeClaimReview(runId: string, decision: ClaimReviewDecision): Promise<ProcessDocumentResult> {
  const run = await workflow().createRun({ runId });
  const res = await run.resume({ step: 'human-review', resumeData: ClaimReviewResumeSchema.parse(decision) });
  const outcome = toOutcome(runId, res);
  if (outcome.state !== 'completed') throw new Error(`Run ${runId} is still ${outcome.state}`);
  return outcome.result;
}

export const flushObservability = () => flushLangfuse(observability);
