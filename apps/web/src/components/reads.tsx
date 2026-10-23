import { errorSignature, type ProcessDocumentResult } from '@sentinel/core';
import { Fragment } from 'react';
import { SectionHead, Tick } from '@/components/audit';
import { modelName } from '@/components/status';
import { TBody, TD, TH, THead, TR, Table } from '@/components/ui/table';
import type { Dict } from '@/lib/i18n/dict';
import { cn } from '@/lib/utils';

type Attempt = ProcessDocumentResult['attempts'][number];

const errorCodes = (a: Attempt) => [...new Set(a.report.issues.filter((i) => i.severity === 'error').map((i) => i.code))];

/**
 * The two reads that agree on the same errors, recomputed with the core's own signature, so the
 * page cannot tell a different story from `decideFinalStatus` (the result does not store the pair).
 */
function agreeingPair(attempts: Attempt[]): [number, number] | null {
  const last = attempts.at(-1);
  if (!last || last.report.passed) return null;
  const sig = errorSignature(last.report);
  const earlier = sig ? attempts.slice(0, -1).find((a) => errorSignature(a.report) === sig) : undefined;
  return earlier ? [earlier.index, last.index] : null;
}

/** "Blame the read before the supplier", made visible: each read, what the code found, and why that verdict. */
export function ReadTrail({ r, t }: { r: ProcessDocumentResult; t: Dict }) {
  const attempts = r.attempts;
  if (attempts.length === 0) return null;
  const tr = t.trail;
  const last = attempts.at(-1)!;
  const pair = agreeingPair(attempts);

  let why: string;
  if (last.report.passed) why = attempts.length === 1 ? tr.firstPass : tr.selfCorrected(attempts.at(-2)!.index);
  else if (pair) why = r.status === 'EXTRACTION_UNCERTAIN' ? tr.extraction(...pair) : tr.confirmed(...pair);
  else if (attempts.at(-2)?.report.passed) why = tr.unverified(attempts.at(-2)!.index);
  else why = tr.exhausted(attempts.length);
  const delivery = r.reconciliation?.result.status === 'DISCREPANCIA' ? tr.delivery(t.doc.verify[r.reconciliation.verification] ?? '') : null;

  return (
    <section aria-labelledby="lecturas">
      <SectionHead id="lecturas" note={tr.note}>
        {tr.title}
      </SectionHead>
      <ol className="flex flex-wrap items-stretch gap-x-1 gap-y-2 border-t border-rule pt-2.5">
        {attempts.map((a, k) => {
          const codes = errorCodes(a);
          const agrees = pair?.includes(a.index);
          const tags = [a.role === 'escalation' && tr.escalated, a.withFeedback && tr.withFeedback, a.blind && tr.blind].filter(Boolean);
          return (
            <Fragment key={a.index}>
              {k > 0 && (
                <li aria-hidden className="self-center px-0.5 text-faint">
                  →
                </li>
              )}
              <li className={cn('min-w-[10rem] max-w-[17rem] rounded-sm border bg-sheet px-2.5 py-1.5', agrees && 'border-info')}>
                <p className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{tr.read(a.index)}</span>
                  <span className="truncate font-mono text-[10.5px] text-muted-foreground">{modelName(a.model)}</span>
                </p>
                {tags.length > 0 && <p className="text-[11.5px] text-muted-foreground">{tags.join(' · ')}</p>}
                {codes.length === 0 ? (
                  <p className="mt-0.5 text-ok">
                    <Tick kind="ok" className="text-inherit" /> {tr.adds}
                  </p>
                ) : (
                  <ul className="mt-0.5 text-[12px] text-danger">
                    {codes.map((c) => (
                      <li key={c} className="flex gap-1">
                        <Tick kind="no" className="shrink-0 text-inherit" />
                        <span>{t.codes[c] ?? c}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {agrees && a.index === pair![1] && (
                  <p className="mt-0.5 text-[11.5px] text-info">
                    <Tick kind="two" className="text-inherit" /> {tr.agrees(pair![0])}
                  </p>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
      <p className="mt-2 max-w-3xl text-[13px]">
        {why}
        {delivery && <> {delivery}</>}
      </p>
    </section>
  );
}

/**
 * For a doubtful read: the fields on which the reads copied different values, side by side,
 * so the person checks those against the original instead of the whole document.
 */
export function ReadDiff({ attempts, t, num, pct }: { attempts: Attempt[]; t: Dict; num: (n: number | null | undefined) => string; pct: (n: number) => string }) {
  const dt = t.diff;
  const labels = new Map<string, string>();
  const reads = attempts.map((a) => {
    const d = a.document;
    const v = new Map<string, string>();
    const put = (key: string, label: string, value: string | null | undefined) => {
      if (!labels.has(key)) labels.set(key, label);
      v.set(key, value === null || value === undefined || value === '' ? '—' : value);
    };
    put('number', dt.number, d.documentNumber);
    put('date', dt.date, d.issueDate);
    put('taxId', dt.taxId, d.issuer.taxId);
    put('currency', dt.currency, d.currency);
    put('lines', dt.lineCount, String(d.lines.length));
    d.lines.forEach((l, i) => {
      put(`l${i}q`, dt.lineQty(i + 1, l.description), String(l.quantity));
      put(`l${i}a`, dt.lineAmount(i + 1, l.description), num(l.lineAmount));
    });
    for (const b of d.printedTaxBreakdown) {
      put(`b${b.rate}`, dt.base(pct(b.rate)), num(b.base));
      put(`t${b.rate}`, dt.tax(pct(b.rate)), num(b.tax));
    }
    (d.printedCharges ?? []).forEach((c, i) => put(`c${i}`, dt.charge(c.label), num(c.amount)));
    put('total', dt.total, num(d.printedTotal));
    return v;
  });
  const rows = [...labels.keys()].filter((key) => new Set(reads.map((v) => v.get(key) ?? '—')).size > 1);

  return (
    <section aria-labelledby="diferencias">
      <SectionHead id="diferencias" note={dt.note}>
        {dt.title}
      </SectionHead>
      {rows.length === 0 ? (
        <p className="border-t border-rule pt-2 text-muted-foreground">{dt.none}</p>
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>{dt.field}</TH>
              {attempts.map((a) => (
                <TH key={a.index} className="text-right">
                  {t.trail.read(a.index)}
                </TH>
              ))}
            </tr>
          </THead>
          <TBody>
            {rows.map((key) => (
              <TR key={key} className="bg-info/5">
                <TD className="max-w-80 truncate" title={labels.get(key)}>
                  {labels.get(key)}
                </TD>
                {reads.map((v, k) => {
                  const value = v.get(key) ?? '—';
                  return (
                    <TD key={k} className={cn('text-right whitespace-nowrap', value === '—' ? 'text-faint' : 'font-semibold')}>
                      {value}
                    </TD>
                  );
                })}
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </section>
  );
}
