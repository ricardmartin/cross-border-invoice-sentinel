import Link from 'next/link';
import { listCountryPacks, type CountryPack } from '@sentinel/core';
import { SectionHead } from '@/components/audit';
import { Country } from '@/components/status';
import { TBody, TD, TH, THead, TR, Table } from '@/components/ui/table';
import type { Dict } from '@/lib/i18n/dict';
import { getI18n } from '@/lib/i18n/server';
import { listSamples } from '@/lib/server/data';
import { loadEvals, type Metric } from '@/lib/server/evals';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Nf = (n: number, d?: number) => string;
const rates = (nf: Nf, list: number[]) => `${list.map((r) => nf(r, Number.isInteger(r) ? 0 : r * 10 === Math.round(r * 10) ? 1 : 2)).join(' · ')} %`;
const metric = (nf: Nf, m: Metric | undefined) =>
  !m || m.value === null ? '—' : m.kind === 'pct' ? `${nf(m.value * 100)} %` : m.kind === 'usd' ? `${nf(m.value, 4)} $` : nf(m.value, 2);

/** Headline metrics compared per country (keys as the eval report names them). */
const COLUMNS = [
  'Documents 100 % correct (final)',
  'Final status correct',
  'Unfair claims (false positives on clean docs)',
  'Discrepancy recall',
  'Claim judge score (1-5)',
  'Cost / doc',
];

function Rules({ pack, t, nf }: { pack: CountryPack; t: Dict; nf: Nf }) {
  const c = pack.charges;
  const k = t.countries;
  const rows: [string, React.ReactNode][] = [
    [k.currency, `${pack.currency} · ${pack.locale}`],
    [k.taxRates, rates(nf, pack.allowedTaxRates)],
    ...(pack.regions ?? []).map((r): [string, React.ReactNode] => [k.region(r.name), `${rates(nf, r.allowedTaxRates)}${r.vatIncludedLabel ? ` · «${r.vatIncludedLabel}»` : ''}`]),
    [k.taxId, pack.fieldNames.taxId.join(', ')],
    [t.common.deliveryNote, pack.deliveryNoteName],
    ...(c?.surcharge ? [[k.surcharge, `${c.surcharge.name}: ${Object.entries(c.surcharge.rateByTaxRate).map(([v, s]) => `${v} % → ${nf(s, 2)} %`).join(' · ')}`] as [string, string]] : []),
    ...(c?.withholding ? [[k.withholding, `${c.withholding.name}: ${rates(nf, c.withholding.rates)}`] as [string, string]] : []),
    ...(c?.stampDuty ? [[k.stampDuty, k.stampRule(c.stampDuty.name, nf(c.stampDuty.amount, 2), pack.currency, nf(c.stampDuty.dueAboveUntaxed, 2))] as [string, string]] : []),
    [k.extraRules, k.validators(pack.extraValidators?.length ?? 0)],
  ];
  return (
    <dl className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] gap-x-3 border-t border-rule text-[12.5px] [&>*]:border-b [&>*]:border-rule [&>*]:py-1">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="min-w-0 break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function CountriesPage() {
  const [packs, samples, { latest, baseline }, { t, intl }] = await Promise.all([listCountryPacks(), listSamples(), loadEvals(), getI18n()]);
  const nf: Nf = (n, d = 1) => n.toLocaleString(intl, { minimumFractionDigits: d, maximumFractionDigits: d });
  const docs = (code: string) => samples.filter((s) => s.country === code);

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="text-xl font-bold tracking-tight">{t.countries.title}</h1>
        <p className="text-muted-foreground">{t.countries.subtitle(packs.length)}</p>
      </div>

      <section aria-labelledby="comparativa" className="mb-6">
        <SectionHead id="comparativa" note={latest ? <span className="font-mono">{latest.runName}</span> : t.countries.noEvals}>
          {t.countries.comparison}
        </SectionHead>
        <Table>
          <THead>
            <TR>
              <TH>{t.common.country}</TH>
              <TH>{t.countries.pack}</TH>
              <TH className="text-right">{t.common.documents}</TH>
              <TH className="text-right">{t.countries.withError}</TH>
              {COLUMNS.map((key) => (
                <TH key={key} className="text-right">
                  {t.countries.columns[key]}
                </TH>
              ))}
            </TR>
          </THead>
          <TBody>
            {packs.map((p) => {
              const h = latest?.byCountry?.[p.code]?.headline;
              const base = baseline?.countries[p.code];
              return (
                <TR key={p.code} className="relative hover:bg-hover">
                  <TD className="whitespace-nowrap">
                    <Link href={`/muestras?pais=${p.code}`} className="font-semibold after:absolute after:inset-0 hover:underline">
                      {p.name}
                    </Link>{' '}
                    <Country code={p.code} />
                  </TD>
                  <TD className="font-mono text-xs text-muted-foreground">{p.version}</TD>
                  <TD className="text-right tabular-nums">{docs(p.code).length}</TD>
                  <TD className="text-right tabular-nums">{docs(p.code).filter((s) => s.planted).length}</TD>
                  {COLUMNS.map((key) => {
                    const m = h?.[key];
                    const b = base?.[key];
                    // Worse than the baseline: by more than 0,5 points on rates, by more than 0,25 on the 1–5 judge
                    // (higher is better except unfair claims). Cost is not judged here.
                    const lowerBetter = key.startsWith('Unfair');
                    const tolerance = m?.kind === 'pct' ? 0.005 : 0.25;
                    const worse = m?.value !== null && m?.value !== undefined && b !== null && b !== undefined && (lowerBetter ? m.value - b > tolerance : b - m.value > tolerance);
                    return (
                      <TD key={key} className={cn('text-right whitespace-nowrap tabular-nums', worse && !key.startsWith('Cost') && 'font-semibold text-danger')} title={b !== null && b !== undefined ? `${t.common.baseline}: ${metric(nf, { value: b, kind: m?.kind ?? 'num' })}` : undefined}>
                        {metric(nf, m)}
                      </TD>
                    );
                  })}
                </TR>
              );
            })}
          </TBody>
        </Table>
        <p className="mt-1.5 text-xs text-muted-foreground">{t.countries.footnote}</p>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
        {packs.map((p) => (
          <section key={p.code} aria-labelledby={`pais-${p.code}`}>
            <SectionHead id={`pais-${p.code}`} note={<span className="font-mono">v{p.version}</span>}>
              <span>
                {p.name} <Country code={p.code} className="ml-1" />
              </span>
            </SectionHead>
            <Rules pack={p} t={t} nf={nf} />
          </section>
        ))}
      </div>
    </div>
  );
}
