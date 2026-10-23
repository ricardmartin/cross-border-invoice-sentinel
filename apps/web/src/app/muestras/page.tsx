import Link from 'next/link';
import { getCountryPack, hasCountryPack } from '@sentinel/core';
import { StatusMark, Tick } from '@/components/audit';
import { FilterGroup, type Params } from '@/components/filters';
import { Country } from '@/components/status';
import { TBody, TD, TH, THead, TR, Table } from '@/components/ui/table';
import type { Dict } from '@/lib/i18n/dict';
import { getI18n } from '@/lib/i18n/server';
import { listSamples, type Sample } from '@/lib/server/data';
import { loadRunResults, resultOk, type DocResult } from '@/lib/server/evals';
import type { FinalStatus } from '@sentinel/core';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const amount = (s: Sample) =>
  s.printedTotal === null ? '—' : `${hasCountryPack(s.country) ? getCountryPack(s.country).formatAmount(s.printedTotal) : s.printedTotal.toFixed(2)} ${s.currency}`;

const CASES = [
  { value: 'limpio', label: (t: Dict) => t.samples.clean, test: (s: Sample) => !s.planted },
  { value: 'sembrado', label: (t: Dict) => t.samples.planted, test: (s: Sample) => Boolean(s.planted) },
  { value: 'cargos', label: (t: Dict) => t.samples.charges, test: (s: Sample) => s.hasCharges },
];
const OUTCOMES = [
  { value: 'acierta', label: (t: Dict) => t.samples.right, test: (r?: DocResult) => Boolean(r && resultOk(r)) },
  { value: 'falla', label: (t: Dict) => t.samples.wrong, test: (r?: DocResult) => Boolean(r && !resultOk(r)) },
  { value: 'inexacta', label: (t: Dict) => t.common.flawedRead, test: (r?: DocResult) => Boolean(r?.comparison && !r.comparison.exact) },
];

export default async function SamplesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const [samples, run, { t }] = await Promise.all([listSamples(), loadRunResults(), getI18n()]);
  const results = new Map((run?.results ?? []).map((r) => [r.id, r]));

  const countries = [...new Set(samples.map((s) => s.country))].sort();
  const byCountry = params.pais ? samples.filter((s) => s.country === params.pais) : samples;
  const byType = params.tipo ? byCountry.filter((s) => s.docType === params.tipo) : byCountry;
  const caseRule = CASES.find((c) => c.value === params.caso);
  const byCase = caseRule ? byType.filter(caseRule.test) : byType;
  const outcomeRule = OUTCOMES.find((o) => o.value === params.eval);
  const shown = outcomeRule ? byCase.filter((s) => outcomeRule.test(results.get(s.id))) : byCase;

  const count = <T,>(list: T[], f: (x: T) => boolean) => list.filter(f).length;

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="text-xl font-bold tracking-tight">{t.common.documents}</h1>
        <p className="text-muted-foreground">
          {t.samples.subtitle(samples.length, countries.length, count(samples, (s) => Boolean(s.planted)))}
          {run && (
            <>
              {` · ${t.samples.run} `}
              <span className="font-mono text-xs">{run.run.runName}</span>
            </>
          )}
        </p>
      </div>
      <p className="mb-4 max-w-3xl text-muted-foreground">
        {t.samples.intro}
      </p>

      <div className="mb-4 flex flex-col gap-1.5 border-y border-rule py-2.5">
        <FilterGroup label={t.common.country} allLabel={t.common.all} param="pais" base="/muestras" params={params} options={countries.map((c) => ({ value: c, label: c, count: count(samples, (s) => s.country === c) }))} />
        <FilterGroup
          label={t.samples.type}
          allLabel={t.common.all}
          param="tipo"
          base="/muestras"
          params={params}
          options={['INVOICE', 'CREDIT_NOTE', 'DELIVERY_NOTE'].map((type) => ({ value: type, label: t.docType[type]!, count: count(byCountry, (s) => s.docType === type) }))}
        />
        <FilterGroup label={t.samples.case} allLabel={t.common.all} param="caso" base="/muestras" params={params} options={CASES.map((c) => ({ value: c.value, label: c.label(t), count: count(byType, c.test) }))} />
        {run && (
          <FilterGroup
            label={t.samples.evaluation}
            allLabel={t.common.all}
            param="eval"
            base="/muestras"
            params={params}
            options={OUTCOMES.map((o) => ({ value: o.value, label: o.label(t), count: count(byCase, (s) => o.test(results.get(s.id))) }))}
          />
        )}
      </div>

      {shown.length === 0 ? (
        <p className="border-y py-10 text-center text-muted-foreground">{t.samples.none}</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>{t.common.document}</TH>
              <TH>{t.common.country}</TH>
              <TH>{t.samples.date}</TH>
              <TH>{t.samples.format}</TH>
              <TH className="text-right">{t.common.printedTotal}</TH>
              <TH>{t.samples.planted}</TH>
              <TH>{t.common.expected}</TH>
              <TH>{t.samples.lastRun}</TH>
            </TR>
          </THead>
          <TBody>
            {shown.map((s) => {
              const r = results.get(s.id);
              const ok = r ? resultOk(r) : null;
              return (
                <TR key={s.id} className={cn('relative hover:bg-hover', ok === false && 'bg-danger-soft')}>
                  <TD className="max-w-[26rem]">
                    <Link href={`/muestras/${s.id}`} className="block truncate font-semibold after:absolute after:inset-0 hover:underline">
                      {s.supplier}
                    </Link>
                    <span className="block truncate text-xs text-muted-foreground">
                      <span className="font-mono">{s.id}</span> · {t.docType[s.docType]} {s.documentNumber}
                      {s.deliveryNoteFor ? t.samples.noteOf(s.deliveryNoteFor) : ''}
                    </span>
                  </TD>
                  <TD>
                    <Country code={s.country} />
                  </TD>
                  <TD className="whitespace-nowrap text-muted-foreground">{s.issueDate}</TD>
                  <TD className="whitespace-nowrap text-muted-foreground">{t.mode[s.mode] ?? s.mode}</TD>
                  <TD className="text-right whitespace-nowrap">{amount(s)}</TD>
                  <TD className="whitespace-nowrap">{s.planted ? <span className="font-semibold text-danger">{t.planted[s.planted] ?? s.planted}</span> : <span className="text-faint">—</span>}</TD>
                  <TD className="whitespace-nowrap">
                    <StatusMark status={s.expectedStatus as FinalStatus} className="font-normal" />
                  </TD>
                  <TD className="whitespace-nowrap">
                    {!r ? (
                      <span className="text-faint">—</span>
                    ) : r.error ? (
                      <span className="font-semibold text-danger">{t.common.runError}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Tick kind={ok ? 'ok' : 'no'} />
                        <span className={cn(ok ? 'text-muted-foreground' : 'font-semibold text-danger')}>{ok ? t.common.right : t.common.wrong}</span>
                        {r.comparison && !r.comparison.exact && <span className="text-xs text-info">{t.samples.flawedRead}</span>}
                      </span>
                    )}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
