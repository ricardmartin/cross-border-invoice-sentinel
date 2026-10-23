import { ArrowLeft, ChevronRight, ExternalLink, Truck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCountryPack, hasCountryPack, type ExtractedDocument } from '@sentinel/core';
import { SectionHead, Tick, TickLegend, Ticks, type TickKind } from '@/components/audit';
import { ClaimReview } from '@/components/claim-review';
import { DocumentViewer, MarkRef } from '@/components/document-viewer';
import { ReadDiff, ReadTrail } from '@/components/reads';
import { modelName, STATUS } from '@/components/status';
import { TBody, TD, TH, THead, TK, TR, Table } from '@/components/ui/table';
import { getI18n } from '@/lib/i18n/server';
import { getRecord } from '@/lib/server/data';
import { traceUrl } from '@/lib/server/langfuse';
import { planHighlights } from '@/lib/highlights';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const [record, { t, intl }] = await Promise.all([getRecord((await params).id), getI18n()]);
  const d = t.doc;
  if (!record) notFound();
  const r = record.result;
  const doc = r.document as ExtractedDocument | null;
  const pack = hasCountryPack(r.country) ? getCountryPack(r.country) : null;
  const locale = pack?.locale ?? 'es-ES';
  const num = (n: number | null | undefined) => (n === null || n === undefined ? '—' : pack ? pack.formatAmount(n) : n.toFixed(2));
  const pct = (n: number | null | undefined) => (n === null || n === undefined ? '—' : `${n.toLocaleString(locale)} %`);
  const qty = (n: number) => n.toLocaleString(locale, { maximumFractionDigits: 3 });
  const secs = (ms: number) => `${(ms / 1000).toLocaleString(intl, { maximumFractionDigits: 1 })} s`;
  const usd = (n: number | null) => (n === null ? '—' : `${n.toLocaleString(intl, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} $`);
  const currency = doc?.currency ?? '';
  const status = { ...STATUS[r.status], ...t.status[r.status] };
  const link = traceUrl(r.traceId);
  const issues = r.report?.issues ?? [];
  const marks = planHighlights(doc, issues, pack, r.reconciliation?.result.lines, t.viewer.deliveryMismatch);
  const lineIssues = new Map<number, string[]>();
  for (const i of issues) if (i.lineIndex !== null) lineIssues.set(i.lineIndex, [...(lineIssues.get(i.lineIndex) ?? []), i.message]);
  const recLines = new Map((r.reconciliation?.result.lines ?? []).filter((l) => l.invoiceLineIndex !== null).map((l) => [l.invoiceLineIndex!, l]));
  const computedLines = new Map((r.report?.computed.lines ?? []).map((l) => [l.index, l.expectedAmount]));
  const rates = [...new Set([...(r.report?.computed.brackets ?? []).map((b) => b.rate), ...(doc?.printedTaxBreakdown ?? []).map((b) => b.rate)])].sort((a, b) => a - b);
  const differs = (a: number | null | undefined, b: number | null | undefined) => a !== null && a !== undefined && b !== null && b !== undefined && Math.abs(a - b) > 0.02;
  const check = (computed: number | null | undefined, printed: number | null | undefined): TickKind | null =>
    computed === null || computed === undefined || printed === null || printed === undefined ? null : differs(computed, printed) ? 'no' : 'ok';

  // A printed figure only earns the "two reads" mark when the verdict really rests on two agreeing reads.
  const twoReads = r.attempts.length >= 2 && (r.status === 'SUPPLIER_DISCREPANCY' || r.status === 'INVALID_TAX_ID');
  const legend: TickKind[] = ['ok', 'no', 'sum', ...(twoReads ? (['two'] as const) : []), ...(r.reconciliation ? (['alb'] as const) : []), ...(r.status === 'EXTRACTION_UNCERTAIN' ? (['doubt'] as const) : [])];
  const totalDelta = r.report && doc && differs(r.report.computed.total, doc.printedTotal) ? r.report.delta : null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* The document as received */}
      <section aria-label={t.common.original} className="flex flex-col gap-2 border-b bg-scan px-4 py-3 lg:sticky lg:top-12 lg:h-[calc(100dvh-3rem)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3.5" aria-hidden /> {d.back}
          </Link>
          <span className="truncate">
            <span className="font-semibold text-foreground">{record.source.kind === 'upload' ? record.source.fileName : t.common.sample(record.source.sampleId)}</span> · {d.original}
          </span>
        </div>
        <DocumentViewer src={record.file.url} mediaType={record.file.mediaType} highlights={marks.highlights} alt={t.common.original} />
        {record.seededDeliveryNotes.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Truck className="size-3.5" aria-hidden /> {d.seeded(record.seededDeliveryNotes.join(', '))}
          </p>
        )}
      </section>

      {/* The working paper */}
      <div className="flex min-w-0 flex-col gap-5 px-4 py-4 sm:px-7">
        <TickLegend kinds={legend} />

        <header>
          <h1 className="text-xl font-bold tracking-tight">{doc?.issuer.name ?? d.unread}</h1>
          {doc && (
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              {t.docType[doc.docType] ?? d.document} <b className="font-semibold text-foreground">{doc.documentNumber}</b> · <b className="font-semibold text-foreground">{doc.issueDate}</b> · {t.common.taxId}{' '}
              <b className="font-mono font-semibold text-foreground">{doc.issuer.taxId ?? '—'}</b>
              {r.report && (
                <>
                  {' '}
                  <Tick kind={r.report.taxIdValid ? 'ok' : 'no'} />
                  {r.report.taxIdValid ? t.common.taxIdValid(r.report.taxIdType ?? '') : t.common.taxIdInvalid}
                </>
              )}{' '}
              · {t.common.to} <b className="font-semibold text-foreground">{doc.recipient.name}</b>
              {doc.deliveryNoteRefs.length > 0 && (
                <>
                  {' '}
                  · {t.common.deliveryNote} <b className="font-mono font-semibold text-foreground">{doc.deliveryNoteRefs.join(', ')}</b>
                </>
              )}
            </p>
          )}
        </header>

        <div className="flex items-start gap-3 border-y py-2.5">
          <span aria-hidden className={cn('grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] text-[13px] font-bold', status.text, 'border-current')}>
            {r.status === 'VALID' ? '✓' : r.status === 'EXTRACTION_UNCERTAIN' ? '?' : '⊗'}
          </span>
          <div>
            <p className={cn('text-[15px] font-bold', status.text)}>{status.label}</p>
            <p className="text-[13px]">{status.help}</p>
          </div>
        </div>

        <ReadTrail r={r} t={t} />
        {r.status === 'EXTRACTION_UNCERTAIN' && r.attempts.length > 1 && <ReadDiff attempts={r.attempts} t={t} num={num} pct={pct} />}

        {r.claim && (
          <ClaimReview
            id={record.id}
            pending={record.state === 'awaiting_review'}
            subject={r.claim.draft.subject}
            body={r.claim.draft.body}
            language={t.language[r.claim.draft.language] ?? r.claim.draft.language}
            amount={r.claim.draft.facts.amountClaimed}
            mode={r.claim.draft.mode}
            supplier={doc?.issuer.name ?? t.claim.theSupplier}
            review={r.claim.review}
          />
        )}

        {doc && (
          <section aria-labelledby="lineas">
            <SectionHead id="lineas" note={d.linesNote(doc.lines.length, currency)}>
              {t.common.lines}
            </SectionHead>
            <Table>
              <THead>
                <tr>
                  <TH>{t.common.description}</TH>
                  <TH className="text-right">{t.common.qty}</TH>
                  <TH className="text-right">{t.common.price}</TH>
                  <TH className="text-right">{d.vat}</TH>
                  <TH className="text-right">{t.common.printed}</TH>
                  <TH className="px-0" aria-label={t.ticks.legend} />
                  <TH className="text-right">{t.common.computed}</TH>
                  <TH className="px-0" aria-label={t.ticks.legend} />
                  {r.reconciliation && (
                    <>
                      <TH className="text-right">{d.delivered}</TH>
                      <TH className="px-0" aria-label={t.ticks.legend} />
                    </>
                  )}
                </tr>
              </THead>
              <TBody>
                {doc.lines.map((l, i) => {
                  const rec = recLines.get(i);
                  const recIssue = rec && rec.kind !== 'MATCH';
                  const expected = computedLines.get(i);
                  const lineCheck = check(expected, l.lineAmount);
                  const flagged = lineIssues.has(i) || recIssue || lineCheck === 'no';
                  const recNote = !recIssue
                    ? null
                    : rec.kind === 'MISSING_IN_DELIVERY_NOTE'
                      ? d.notInNote
                      : rec.kind === 'QUANTITY_DIFF'
                        ? d.qtyDiff(qty(rec.invoiceQuantity ?? l.quantity), `${qty(rec.deliveredQuantity ?? 0)}${l.unit ? ` ${l.unit}` : ''}`)
                        : d.priceDiff;
                  return (
                    <TR key={i} className={cn(flagged && 'bg-danger-soft')}>
                      <TD className="max-w-80">
                        <span className="block" title={l.description}>
                          {l.description}
                        </span>
                        {[...(lineIssues.get(i) ?? []), ...(recNote ? [recNote] : [])].map((m) => (
                          <span key={m} className="flex items-center gap-1.5 text-xs font-semibold text-danger">
                            ⊗ {m}
                          </span>
                        ))}
                        {flagged && (
                          <span className="mt-0.5 inline-block">
                            <MarkRef n={marks.byLine.get(i) ?? [...marks.byIssue].find(([k]) => issues[k]?.lineIndex === i)?.[1]} />
                          </span>
                        )}
                      </TD>
                      <TD className="text-right whitespace-nowrap">
                        {qty(l.quantity)} <span className="text-xs text-muted-foreground">{l.unit ?? ''}</span>
                      </TD>
                      <TD className="text-right whitespace-nowrap">{num(l.unitPrice)}</TD>
                      <TD className="text-right whitespace-nowrap">{pct(l.taxRate)}</TD>
                      <TD className="text-right whitespace-nowrap">{num(l.lineAmount)}</TD>
                      <TK>
                        <Ticks kinds={[twoReads && 'two']} />
                      </TK>
                      <TD className={cn('text-right whitespace-nowrap', lineCheck === 'no' && 'font-bold text-danger')}>{num(expected)}</TD>
                      <TK>
                        <Ticks kinds={[lineCheck]} />
                      </TK>
                      {r.reconciliation && (
                        <>
                          <TD className={cn('text-right whitespace-nowrap', recIssue && 'font-bold text-danger')}>
                            {rec ? (rec.kind === 'MISSING_IN_DELIVERY_NOTE' ? d.notDelivered : qty(rec.deliveredQuantity ?? 0)) : '—'}
                          </TD>
                          <TK>{rec && <Ticks kinds={['alb', recIssue ? 'no' : 'ok']} />}</TK>
                        </>
                      )}
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </section>
        )}

        {doc && r.report && rates.length > 0 && (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
            <section aria-labelledby="impuestos">
              <SectionHead id="impuestos" note={d.taxesNote}>
                {d.taxes}
              </SectionHead>
              <Table>
                <THead>
                  <tr>
                    <TH>{d.rate}</TH>
                    <TH className="text-right">{d.baseCalc}</TH>
                    <TH className="px-0" aria-label={t.ticks.legend} />
                    <TH className="text-right">{d.basePrinted}</TH>
                    <TH className="px-0" aria-label={t.ticks.legend} />
                    <TH className="text-right">{d.taxCalc}</TH>
                    <TH className="px-0" aria-label={t.ticks.legend} />
                    <TH className="text-right">{d.taxPrinted}</TH>
                    <TH className="px-0" aria-label={t.ticks.legend} />
                  </tr>
                </THead>
                <TBody>
                  {rates.map((rate) => {
                    const c = r.report!.computed.brackets.find((b) => b.rate === rate);
                    const p = doc.printedTaxBreakdown.find((b) => b.rate === rate);
                    const baseCheck: TickKind = !c ? 'no' : (check(c.base, p?.base) ?? 'ok');
                    const taxCheck: TickKind = !c ? 'no' : (check(c.tax, p?.tax) ?? 'ok');
                    return (
                      <TR key={rate}>
                        <TD className="whitespace-nowrap">
                          {d.vat} {pct(rate)}
                        </TD>
                        <TD className="text-right">{num(c?.base)}</TD>
                        <TK>{c && <Tick kind="sum" />}</TK>
                        <TD className={cn('text-right', baseCheck === 'no' && 'font-bold text-danger')}>{num(p?.base)}</TD>
                        <TK>{p && <Ticks kinds={[twoReads && 'two', baseCheck]} />}</TK>
                        <TD className="text-right">{num(c?.tax)}</TD>
                        <TK>{c && <Tick kind="sum" />}</TK>
                        <TD className={cn('text-right', taxCheck === 'no' && 'font-bold text-danger')}>{num(p?.tax)}</TD>
                        <TK>{p && <Ticks kinds={[twoReads && 'two', taxCheck]} />}</TK>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </section>

            <section aria-labelledby="totales">
              <SectionHead id="totales" note={currency}>
                {t.common.totals}
              </SectionHead>
              <table className="w-full border-collapse text-[13px]">
                <tbody>
                  <tr className="border-b border-rule">
                    <th scope="row" className="py-1.5 text-left font-normal">
                      {t.common.computedTotal}
                    </th>
                    <td className="py-1.5 text-right font-semibold">{num(r.report.computed.total)}</td>
                    <TK>
                      <Tick kind="sum" />
                    </TK>
                  </tr>
                  <tr className={cn('border-b', totalDelta === null && 'border-b-[3px] border-double border-foreground')}>
                    <th scope="row" className="py-1.5 text-left font-normal">
                      {t.common.printedTotal}
                    </th>
                    <td className={cn('py-1.5 text-right font-semibold', totalDelta !== null && 'text-danger')}>{num(doc.printedTotal)}</td>
                    <TK>
                      <Ticks kinds={[twoReads && 'two', check(r.report.computed.total, doc.printedTotal)]} />
                    </TK>
                  </tr>
                  {totalDelta !== null && (
                    <tr className="border-b-[3px] border-double border-foreground text-danger">
                      <th scope="row" className="py-1.5 text-left font-bold">
                        {d.delta}
                      </th>
                      <td className="py-1.5 text-right font-bold">{num(totalDelta)}</td>
                      <TK>
                        <Tick kind="no" />
                      </TK>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {r.reconciliation && (
          <section aria-labelledby="conciliacion">
            <SectionHead id="conciliacion">{d.reconTitle}</SectionHead>
            <dl className="grid gap-x-6 gap-y-1 border-t border-rule pt-2 sm:grid-cols-[auto_1fr]">
              <dt className="text-muted-foreground">{d.result}</dt>
              <dd className={cn('font-semibold', r.reconciliation.result.status === 'DISCREPANCIA' && 'text-danger')}>
                {t.recon[r.reconciliation.result.status] ?? r.reconciliation.result.status}, {d.verify[r.reconciliation.verification]}
              </dd>
              <dt className="text-muted-foreground">{d.notes}</dt>
              <dd className="font-mono">{r.reconciliation.result.deliveryNoteNumbers.join(', ') || '—'}</dd>
              {r.reconciliation.result.amountAtStake > 0 && (
                <>
                  <dt className="text-muted-foreground">{d.atStake}</dt>
                  <dd className="font-semibold">
                    {num(r.reconciliation.result.amountAtStake)} {currency} <span className="font-normal text-muted-foreground">{d.vatIncluded}</span>
                  </dd>
                </>
              )}
            </dl>
          </section>
        )}

        <section aria-labelledby="validacion">
          <SectionHead
            id="validacion"
            note={d.checksNote(r.country, r.report?.taxRegime && r.report.taxRegime !== r.country ? r.report.taxRegime : null)}
          >
            {t.common.checks}
          </SectionHead>
          {issues.length === 0 ? (
            <p className="border-t border-rule pt-2 text-muted-foreground">
              <Tick kind="ok" /> {t.common.allChecksPass}
            </p>
          ) : (
            <ul className="border-t border-rule">
              {issues.map((i, k) => (
                <li key={k} className="flex items-start gap-3 border-b border-rule py-1.5">
                  <Tick kind={i.severity === 'error' ? 'no' : 'doubt'} />
                  <MarkRef n={marks.byIssue.get(k)} />
                  <span className="min-w-0 flex-1">{i.message}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{i.code}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <details className="group border-y py-2">
          <summary className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" aria-hidden />
            <span className="font-semibold">{t.common.technicalDetails}</span>
            <span className="text-muted-foreground">
              {d.reads(r.attempts.length)} · {modelName(r.config.primaryModel)} · {usd(r.totals.costUsd)} · {secs(r.totals.latencyMs)}
            </span>
          </summary>
          <div className="mt-3 grid gap-x-8 gap-y-4 text-xs md:grid-cols-2">
            <dl className="grid grid-cols-[auto_1fr] content-start gap-x-4 gap-y-1">
              <dt className="text-muted-foreground">{d.engineReason}</dt>
              <dd className="font-mono break-words">{r.reason}</dd>
              <dt className="text-muted-foreground">{d.pack}</dt>
              <dd>
                {r.country} · {d.version(r.packVersion ?? '—')}
              </dd>
              <dt className="text-muted-foreground">Triage</dt>
              <dd>
                {t.docType[r.triage.docType]} · {d.confidence(Math.round(r.triage.confidence * 100))} · {usd(r.triage.costUsd ?? null)}
              </dd>
              <dt className="text-muted-foreground">{d.trace}</dt>
              <dd>
                {link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold underline">
                    {d.openLangfuse} <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : (
                  <span className="text-muted-foreground" title={d.langfuseHint}>
                    {d.langfuseOff}
                    {r.traceId ? ` · ${r.traceId.slice(0, 8)}…` : ''}
                  </span>
                )}
              </dd>
            </dl>
            <div>
              <p className="mb-1 text-muted-foreground">
                {d.readsHelp}
              </p>
              <ol className="border-t border-rule">
                {r.attempts.map((a) => {
                  const errors = [...new Set(a.report.issues.filter((i) => i.severity === 'error').map((i) => i.code))];
                  return (
                    <li key={a.index} className="flex flex-wrap items-baseline gap-x-2 border-b border-rule py-1">
                      <span className="font-mono">#{a.index}</span>
                      <span className="font-semibold">{modelName(a.model)}</span>
                      {a.role === 'escalation' && <span>{d.escalated}</span>}
                      {a.withFeedback && <span>{d.withFeedback}</span>}
                      {a.blind && <span>{t.common.blind}</span>}
                      <span className={errors.length ? 'text-danger' : 'text-ok'}>{errors.length ? errors.join(', ') : t.common.passes}</span>
                      <span className="ml-auto text-muted-foreground">
                        {secs(a.latencyMs)}
                        {a.costUsd !== null ? ` · ${usd(a.costUsd)}` : ''}
                        {a.cached ? d.cached : ''}
                      </span>
                    </li>
                  );
                })}
                {r.attempts.length === 0 && <li className="py-1 text-muted-foreground">{d.noExtraction}</li>}
                {r.extraCalls.map((c, k) => (
                  <li key={`x${k}`} className="flex flex-wrap items-baseline gap-x-2 border-b border-rule py-1">
                    <span className="font-mono">+</span>
                    <span>{c.purpose === 'claim-draft' ? d.claimDraft : c.purpose === 'delivery-note-verification' ? d.noteReread : c.purpose}</span>
                    <span className="ml-auto text-muted-foreground">
                      {secs(c.latencyMs)}
                      {c.costUsd !== null ? ` · ${usd(c.costUsd)}` : ''}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
