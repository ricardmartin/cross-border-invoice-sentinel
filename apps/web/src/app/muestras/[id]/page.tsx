import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCountryPack, hasCountryPack, reconcile, validateDocument, type ExtractedDocument, type FinalStatus } from '@sentinel/core';
import { SectionHead, StatusMark, Tick, type TickKind } from '@/components/audit';
import { DocumentViewer, MarkRef } from '@/components/document-viewer';
import { ProcessSampleButton } from '@/components/process-sample-button';
import { modelName } from '@/components/status';
import { TBody, TD, TH, THead, TK, TR, Table } from '@/components/ui/table';
import { DEMO } from '@/lib/demo';
import { getI18n } from '@/lib/i18n/server';
import { listSamples, readEntry } from '@/lib/server/data';
import { loadRunResults, resultOk } from '@/lib/server/evals';
import { planHighlights } from '@/lib/highlights';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function SamplePage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const entry = await readEntry(id);
  if (!entry) notFound();
  const [samples, run, { t, intl }] = await Promise.all([listSamples(), loadRunResults(), getI18n()]);
  const m = t.sample;
  const doc = entry.groundTruth as ExtractedDocument;
  const pack = hasCountryPack(entry.country) ? getCountryPack(entry.country) : null;
  // The engine on the ground truth: pure, free, the same checks a perfect read would get.
  const report = pack ? validateDocument(doc, pack) : null;
  const result = run?.results.find((r) => r.id === id) ?? null;
  // Its delivery notes as the dataset prints them, through the same pure reconciliation the pipeline runs:
  // a short or missing delivery is marked here too, not only arithmetic errors.
  const notes = (await Promise.all(samples.filter((s) => s.deliveryNoteFor === id).map((s) => readEntry(s.id)))).filter((n) => n !== null);
  const recon = notes.length ? reconcile(doc, notes.map((n) => ({ number: n.groundTruth.documentNumber, document: n.groundTruth }))) : null;
  const recLines = new Map((recon?.lines ?? []).filter((l) => l.kind !== 'MATCH' && l.invoiceLineIndex !== null).map((l) => [l.invoiceLineIndex!, l]));
  const marks = planHighlights(doc, report?.issues ?? [], pack, recon?.lines, t.viewer.deliveryMismatch);

  const locale = pack?.locale ?? 'es-ES';
  const num = (n: number | null | undefined) => (n === null || n === undefined ? '—' : pack ? pack.formatAmount(n) : n.toFixed(2));
  const pct = (n: number | null | undefined) => (n === null || n === undefined ? '—' : `${n.toLocaleString(locale)} %`);
  const qty = (n: number) => n.toLocaleString(locale, { maximumFractionDigits: 3 });
  const usd = (n: number | null | undefined) => (n === null || n === undefined ? '—' : `${n.toLocaleString(intl, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} $`);
  const differs = (a: number | null | undefined, b: number | null | undefined) => a !== null && a !== undefined && b !== null && b !== undefined && Math.abs(a - b) > 0.02;
  const check = (computed: number | null | undefined, printed: number | null | undefined): TickKind | null =>
    computed === null || computed === undefined || printed === null || printed === undefined ? null : differs(computed, printed) ? 'no' : 'ok';

  const computedLines = new Map((report?.computed.lines ?? []).map((l) => [l.index, l.expectedAmount]));
  const lineIssues = new Map<number, string[]>();
  for (const i of report?.issues ?? []) if (i.lineIndex !== null) lineIssues.set(i.lineIndex, [...(lineIssues.get(i.lineIndex) ?? []), i.message]);
  const charges = doc.printedCharges ?? [];
  const related = entry.deliveryNoteFor
    ? { id: entry.deliveryNoteFor, label: m.citingInvoice }
    : (() => {
        const note = samples.find((s) => s.deliveryNoteFor === id);
        return note ? { id: note.id, label: m.itsNote } : null;
      })();
  const expectedStatus = entry.expected.finalStatus as FinalStatus;
  const ok = result ? resultOk(result) : null;
  const amountDue = report?.computed.amountDue;
  const withheld = (report?.computed.charges.withholdings ?? 0) > 0;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <section aria-label={t.common.original} className="flex flex-col gap-2 border-b bg-scan px-4 py-3 lg:sticky lg:top-12 lg:h-[calc(100dvh-3rem)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <Link href="/muestras" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3.5" aria-hidden /> {t.common.documents}
          </Link>
          <span className="truncate">
            <span className="font-mono font-semibold text-foreground">{id}</span> · {t.mode[entry.variant.mode] ?? entry.variant.mode} · {m.template(entry.template)}
          </span>
        </div>
        <DocumentViewer src={`/api/files/sample/${id}`} mediaType={entry.mediaType} highlights={marks.highlights} alt={t.common.original} />
      </section>

      <div className="flex min-w-0 flex-col gap-5 px-4 py-4 sm:px-7">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight">{doc.issuer.name}</h1>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              {t.docType[doc.docType]} <b className="font-semibold text-foreground">{doc.documentNumber}</b> · <b className="font-semibold text-foreground">{doc.issueDate}</b> · {t.common.taxId}{' '}
              <b className="font-mono font-semibold text-foreground">{doc.issuer.taxId ?? '—'}</b>
              {report && (
                <>
                  {' '}
                  <Tick kind={report.taxIdValid ? 'ok' : 'no'} />
                  {report.taxIdValid ? t.common.taxIdValid(report.taxIdType ?? '') : t.common.taxIdInvalid}
                </>
              )}{' '}
              · {t.common.to} <b className="font-semibold text-foreground">{doc.recipient.name}</b>
              {doc.recipient.address ? ` (${doc.recipient.address})` : ''}
              {doc.deliveryNoteRefs.length > 0 && (
                <>
                  {' '}
                  · {t.common.deliveryNote} <b className="font-mono font-semibold text-foreground">{doc.deliveryNoteRefs.join(', ')}</b>
                </>
              )}
              {doc.documentControlCode && (
                <>
                  {' '}
                  · ATCUD <b className="font-mono font-semibold text-foreground">{doc.documentControlCode}</b>
                </>
              )}
            </p>
          </div>
          {doc.docType !== 'DELIVERY_NOTE' && <ProcessSampleButton sampleId={id} llmReady={!DEMO && Boolean(process.env.ANTHROPIC_API_KEY)} />}
        </header>

        <section aria-labelledby="caso">
          <SectionHead id="caso" note={m.whatNote}>
            {m.whatTitle}
          </SectionHead>
          <dl className="grid gap-x-6 gap-y-1 border-t border-rule pt-2 sm:grid-cols-[auto_1fr]">
            <dt className="text-muted-foreground">{m.planted}</dt>
            <dd>{entry.planted ? <span className="font-semibold text-danger">{t.planted[entry.planted.type] ?? entry.planted.type}: {entry.planted.description}</span> : m.noPlanted}</dd>
            <dt className="text-muted-foreground">{m.expected}</dt>
            <dd>
              <StatusMark status={expectedStatus} />
              {entry.expected.issueCodes.length > 0 && <span className="ml-2 font-mono text-[11px] text-muted-foreground">{entry.expected.issueCodes.join(', ')}</span>}
            </dd>
            {entry.expected.reconciliation && (
              <>
                <dt className="text-muted-foreground">{m.expectedRecon}</dt>
                <dd>
                  {t.recon[entry.expected.reconciliation] ?? entry.expected.reconciliation}
                  {entry.expected.claimAmount ? m.claimed(num(entry.expected.claimAmount), doc.currency) : ''}
                </dd>
              </>
            )}
            {report?.taxRegime && report.taxRegime !== entry.country && (
              <>
                <dt className="text-muted-foreground">{m.taxRegion}</dt>
                <dd className="font-mono">{report.taxRegime}</dd>
              </>
            )}
            {related && (
              <>
                <dt className="text-muted-foreground">{related.label}</dt>
                <dd>
                  <Link href={`/muestras/${related.id}`} className="font-mono font-semibold underline">
                    {related.id}
                  </Link>
                </dd>
              </>
            )}
          </dl>
        </section>

        {result && (
          <section aria-labelledby="evaluacion">
            <SectionHead id="evaluacion" note={<span className="font-mono">{run!.run.runName}</span>}>
              {m.lastRun}
            </SectionHead>
            <div className={cn('flex items-start gap-3 border-y py-2.5', ok === false && 'bg-danger-soft')}>
              <Tick kind={ok ? 'ok' : 'no'} className="mt-0.5" />
              <div className="min-w-0 flex-1">
                {result.error ? (
                  <p className="font-semibold text-danger">{m.runError(result.error)}</p>
                ) : (
                  <>
                    <p className="font-semibold">
                      {m.got(Boolean(ok))}
                      <StatusMark status={result.status as FinalStatus} className="font-semibold" />
                      {result.reconciliation && <span className="font-normal text-muted-foreground">{m.recon(t.recon[result.reconciliation] ?? result.reconciliation)}</span>}
                    </p>
                    <p className="text-[12.5px] text-muted-foreground">{result.reason}</p>
                  </>
                )}
              </div>
            </div>
            {result.comparison && (
              <div className="mt-2">
                {result.comparison.exact ? (
                  <p className="text-muted-foreground">
                    <Tick kind="ok" /> {m.exact}
                  </p>
                ) : (
                  <>
                    <p className="text-info">{m.differs}</p>
                    <ul className="mt-1 border-t border-rule font-mono text-[11.5px]">
                      {result.comparison.mismatches.map((x) => (
                        <li key={x} className="border-b border-rule py-1 break-words">
                          {x}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-[12.5px] sm:grid-cols-[auto_1fr]">
              <dt className="text-muted-foreground">{m.reads}</dt>
              <dd>
                {(result.attempts ?? []).map((a) => (
                  <span key={a.index} className="mr-3 inline-block">
                    <span className="font-mono">#{a.index}</span> {modelName(a.model)}
                    {a.blind ? ` ${t.common.blind}` : ''} ·{' '}
                    <span className={a.errors.length ? 'text-danger' : 'text-ok'}>{a.errors.length ? [...new Set(a.errors)].join(', ') : t.common.passes}</span>
                  </span>
                ))}
              </dd>
              {result.claim && (
                <>
                  <dt className="text-muted-foreground">{m.claim}</dt>
                  <dd>
                    {num(result.claim.amount)} {doc.currency}
                    {result.claim.expectedAmount !== null && (
                      <span className={cn('ml-1', differs(result.claim.amount, result.claim.expectedAmount) ? 'font-semibold text-danger' : 'text-muted-foreground')}>
                        {m.expectedAmount(num(result.claim.expectedAmount))}
                      </span>
                    )}{' '}
                    · {t.common.judge} {result.claim.judge}/5 · «{result.claim.subject}»
                    <span className="mt-0.5 block text-muted-foreground">{result.claim.justification}</span>
                  </dd>
                </>
              )}
              <dt className="text-muted-foreground">{m.costTime}</dt>
              <dd>
                {usd(result.costUsd)} · {result.latencyMs !== undefined ? `${(result.latencyMs / 1000).toLocaleString(intl, { maximumFractionDigits: 1 })} s` : '—'}
              </dd>
            </dl>
          </section>
        )}

        <section aria-labelledby="lineas">
          <SectionHead id="lineas" note={m.linesNote(doc.lines.length, doc.currency)}>
            {t.common.lines}
          </SectionHead>
          <Table>
            <THead>
              <tr>
                <TH>{t.common.description}</TH>
                <TH className="text-right">{t.common.qty}</TH>
                <TH className="text-right">{t.common.price}</TH>
                <TH className="text-right">{m.rate}</TH>
                <TH className="text-right">{t.common.printed}</TH>
                <TH className="text-right">{t.common.computed}</TH>
                <TH className="px-0" aria-label={t.ticks.legend} />
              </tr>
            </THead>
            <TBody>
              {doc.lines.map((l, i) => {
                const expected = computedLines.get(i);
                const lineCheck = check(expected, l.lineAmount);
                const rec = recLines.get(i);
                const recNote = !rec
                  ? null
                  : rec.kind === 'MISSING_IN_DELIVERY_NOTE'
                    ? t.doc.notInNote
                    : rec.kind === 'QUANTITY_DIFF'
                      ? t.doc.qtyDiff(qty(rec.invoiceQuantity ?? l.quantity), `${qty(rec.deliveredQuantity ?? 0)}${l.unit ? ` ${l.unit}` : ''}`)
                      : t.doc.priceDiff;
                return (
                  <TR key={i} className={cn((lineIssues.has(i) || lineCheck === 'no' || rec) && 'bg-danger-soft')}>
                    <TD className="max-w-80">
                      {l.description}
                      {[...(lineIssues.get(i) ?? []), ...(recNote ? [recNote] : [])].map((x) => (
                        <span key={x} className="block text-xs font-semibold text-danger">
                          ⊗ {x}
                        </span>
                      ))}
                      {rec && (
                        <span className="mt-0.5 inline-block">
                          <MarkRef n={marks.byLine.get(i)} />
                        </span>
                      )}
                    </TD>
                    <TD className="text-right whitespace-nowrap">
                      {qty(l.quantity)} <span className="text-xs text-muted-foreground">{l.unit ?? ''}</span>
                    </TD>
                    <TD className="text-right whitespace-nowrap">{num(l.unitPrice)}</TD>
                    <TD className="text-right whitespace-nowrap">{pct(l.taxRate)}</TD>
                    <TD className="text-right whitespace-nowrap">{num(l.lineAmount)}</TD>
                    <TD className={cn('text-right whitespace-nowrap', lineCheck === 'no' && 'font-bold text-danger')}>{num(expected)}</TD>
                    <TK>{lineCheck && <Tick kind={lineCheck} />}</TK>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </section>

        {report && doc.printedTotal !== null && (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
            <section aria-labelledby="impuestos">
              <SectionHead id="impuestos">{m.taxesCharges}</SectionHead>
              <Table>
                <THead>
                  <tr>
                    <TH>{m.concept}</TH>
                    <TH className="text-right">{m.base}</TH>
                    <TH className="text-right">{t.common.computed}</TH>
                    <TH className="text-right">{t.common.printed}</TH>
                    <TH className="px-0" aria-label={t.ticks.legend} />
                  </tr>
                </THead>
                <TBody>
                  {doc.printedTaxBreakdown.map((p) => {
                    const c = report.computed.brackets.find((b) => b.rate === p.rate);
                    const mark = check(c?.tax, p.tax) ?? 'no';
                    return (
                      <TR key={p.rate}>
                        <TD className="whitespace-nowrap">{m.tax(pct(p.rate))}</TD>
                        <TD className="text-right">{num(p.base)}</TD>
                        <TD className="text-right">{num(c?.tax)}</TD>
                        <TD className={cn('text-right', mark === 'no' && 'font-bold text-danger')}>{num(p.tax)}</TD>
                        <TK>
                          <Tick kind={mark} />
                        </TK>
                      </TR>
                    );
                  })}
                  {charges.map((c, k) => (
                    <TR key={`c${k}`}>
                      <TD>
                        {c.label} <span className="text-xs text-muted-foreground">({t.chargeKind[c.kind]})</span>
                      </TD>
                      <TD className="text-right">{num(c.base)}</TD>
                      <TD className="text-right text-muted-foreground">—</TD>
                      <TD className="text-right">
                        {c.kind === 'WITHHOLDING' ? '−' : ''}
                        {num(c.amount)}
                      </TD>
                      <TK />
                    </TR>
                  ))}
                </TBody>
              </Table>
            </section>
            <section aria-labelledby="totales">
              <SectionHead id="totales" note={doc.currency}>
                {t.common.totals}
              </SectionHead>
              <dl className="grid grid-cols-[1fr_auto_auto] gap-x-2 border-t border-rule text-[13px] [&>*]:border-b [&>*]:border-rule [&>*]:py-1.5">
                <dt>{t.common.computedTotal}</dt>
                <dd className="text-right font-semibold">{num(report.computed.total)}</dd>
                <dd>
                  <Tick kind="sum" />
                </dd>
                {withheld && (
                  <>
                    <dt>{m.dueAfterWithholding}</dt>
                    <dd className="text-right font-semibold">{num(amountDue)}</dd>
                    <dd>
                      <Tick kind="sum" />
                    </dd>
                  </>
                )}
                <dt>{t.common.printedTotal}</dt>
                <dd className={cn('text-right font-semibold', (report.delta ?? 0) > 0.02 && 'text-danger')}>{num(doc.printedTotal)}</dd>
                <dd>
                  <Tick kind={(report.delta ?? 0) > 0.02 ? 'no' : 'ok'} />
                </dd>
              </dl>
            </section>
          </div>
        )}

        {report && (
          <section aria-labelledby="validacion">
            <SectionHead id="validacion" note={m.checksNote(report.packCode, report.packVersion)}>
              {t.common.checks}
            </SectionHead>
            {report.issues.length === 0 ? (
              <p className="border-t border-rule pt-2 text-muted-foreground">
                <Tick kind="ok" /> {m.allPass(t.status.VALID.help.toLowerCase())}
              </p>
            ) : (
              <ul className="border-t border-rule">
                {report.issues.map((i, k) => (
                  <li key={k} className="flex items-start gap-3 border-b border-rule py-1.5">
                    <Tick kind={i.severity === 'error' ? 'no' : 'doubt'} />
                    <MarkRef n={marks.byIssue.get(k)} />
                    <span className="min-w-0 flex-1">
                      {i.message}
                      {i.severity === 'warning' && <span className="text-muted-foreground">{m.warning}</span>}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">{i.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
