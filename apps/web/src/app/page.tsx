import Link from 'next/link';
import { getCountryPack, hasCountryPack } from '@sentinel/core';
import { ProcessPanel } from '@/components/process-panel';
import { StatusMark } from '@/components/audit';
import { Country } from '@/components/status';
import { TBody, TD, TH, THead, TR, Table } from '@/components/ui/table';
import type { Dict } from '@/lib/i18n/dict';
import { DEMO } from '@/lib/demo';
import { getI18n } from '@/lib/i18n/server';
import { listRecords, listSamples, type DocumentRecord } from '@/lib/server/data';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** Work-queue order: claims waiting for a decision, then reads a person must check, then the rest. */
const priority = (r: DocumentRecord) => (r.state === 'awaiting_review' ? 0 : r.result.status === 'EXTRACTION_UNCERTAIN' ? 1 : 2);

function total(r: DocumentRecord) {
  const d = r.result.document;
  if (!d || d.printedTotal === null || d.printedTotal === undefined) return '—';
  const amount = hasCountryPack(r.result.country) ? getCountryPack(r.result.country).formatAmount(d.printedTotal) : d.printedTotal.toFixed(2);
  return `${amount} ${d.currency ?? ''}`.trim();
}

function ClaimCell({ r, t }: { r: DocumentRecord; t: Dict['inbox'] }) {
  const claim = r.result.claim;
  if (!claim) return <span className="text-faint">—</span>;
  const amount = claim.draft.facts.amountClaimed;
  if (r.state === 'awaiting_review') return <span className="font-semibold">{t.toApprove}{amount ? ` · ${amount}` : ''}</span>;
  if (claim.review?.action === 'approve') return <span className="text-muted-foreground">{t.sent}{amount ? ` · ${amount}` : ''}</span>;
  return <span className="text-muted-foreground">{t.discarded}</span>;
}

export default async function InboxPage() {
  const [samples, records, { t, intl }] = await Promise.all([listSamples(), listRecords(), getI18n()]);
  const when = (iso: string) => new Intl.DateTimeFormat(intl, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  const queue = [...records].sort((a, b) => priority(a) - priority(b) || b.createdAt.localeCompare(a.createdAt));
  const pending = records.filter((r) => r.state === 'awaiting_review').length;
  const doubtful = records.filter((r) => r.result.status === 'EXTRACTION_UNCERTAIN').length;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section aria-labelledby="bandeja" className="min-w-0">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h1 id="bandeja" className="text-xl font-bold tracking-tight">
            {t.inbox.title}
          </h1>
          <p className="text-muted-foreground">
            {t.common.docs(records.length)}
            {pending > 0 && (
              <>
                {' · '}
                <span className="font-semibold text-foreground">
                  {t.inbox.pending(pending)}
                </span>
              </>
            )}
            {doubtful > 0 && ` · ${t.inbox.doubtful(doubtful)}`}
          </p>
        </div>

        {queue.length === 0 ? (
          <div className="border-y py-10 text-center">
            <p className="font-semibold">{t.inbox.emptyTitle}</p>
            <p className="mt-1 text-muted-foreground">{t.inbox.emptyHelp}</p>
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t.inbox.status}</TH>
                <TH>{t.inbox.supplierAndDoc}</TH>
                <TH>{t.common.country}</TH>
                <TH>{t.inbox.processed}</TH>
                <TH className="text-right">{t.common.printedTotal}</TH>
                <TH>{t.inbox.claim}</TH>
              </TR>
            </THead>
            <TBody>
              {queue.map((r) => {
                const d = r.result.document;
                const name = d?.issuer.name ?? (r.source.kind === 'upload' ? r.source.fileName : r.source.sampleId);
                return (
                  <TR key={r.id} className={cn('relative hover:bg-hover', r.state === 'awaiting_review' && 'bg-sheet')}>
                    <TD className="whitespace-nowrap">
                      <StatusMark status={r.result.status} />
                    </TD>
                    <TD className="max-w-[28rem]">
                      <Link href={`/documents/${r.id}`} className="block truncate font-semibold after:absolute after:inset-0 hover:underline">
                        {name}
                      </Link>
                      <span className="block truncate text-xs text-muted-foreground">
                        {t.docType[r.result.triage.docType]} {d?.documentNumber ?? ''}
                        {r.source.kind === 'sample' ? ` · ${t.common.sample(r.source.sampleId)}` : ''}
                      </span>
                    </TD>
                    <TD>
                      <Country code={r.result.country} />
                    </TD>
                    <TD className="whitespace-nowrap text-muted-foreground">{when(r.createdAt)}</TD>
                    <TD className="text-right whitespace-nowrap">{total(r)}</TD>
                    <TD className="whitespace-nowrap">
                      <ClaimCell r={r} t={t.inbox} />
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </section>

      <ProcessPanel samples={samples} llmReady={!DEMO && Boolean(process.env.ANTHROPIC_API_KEY)} />
    </div>
  );
}
