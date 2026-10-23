import Link from 'next/link';
import type { FinalStatus } from '@sentinel/core';
import { SectionHead, StatusMark, Tick } from '@/components/audit';
import { FilterGroup, withParam, type Params } from '@/components/filters';
import { Country } from '@/components/status';
import { TBody, TD, TH, THead, TR, Table } from '@/components/ui/table';
import type { Dict } from '@/lib/i18n/dict';
import { getI18n } from '@/lib/i18n/server';
import { listSamples } from '@/lib/server/data';
import { loadEvals, loadRunResults, resultOk, type DocResult } from '@/lib/server/evals';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const FILTERS = [
  { value: 'falla', label: (t: Dict) => t.results.failing, test: (r: DocResult) => !resultOk(r) },
  { value: 'inexacta', label: (t: Dict) => t.common.flawedRead, test: (r: DocResult) => Boolean(r.comparison && !r.comparison.exact) },
  { value: 'reclamacion', label: (t: Dict) => t.results.withClaim, test: (r: DocResult) => Boolean(r.claim) },
  { value: 'releida', label: (t: Dict) => t.results.reread, test: (r: DocResult) => (r.attempts?.length ?? 0) > 1 },
];

export default async function ResultsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const [{ runs }, data, samples, { t, intl }] = await Promise.all([loadEvals(), loadRunResults(params.run), listSamples(), getI18n()]);
  const nf = (n: number, d = 1) => n.toLocaleString(intl, { minimumFractionDigits: d, maximumFractionDigits: d });
  const pctOf = (part: number, total: number) => (total ? `${nf((part / total) * 100)} %` : '—');
  if (!data) {
    return (
      <div className="px-4 py-10 text-center sm:px-6">
        <p className="font-semibold">{t.results.noRuns}</p>
        <p className="mt-1 text-muted-foreground">{t.results.runHint(<code className="font-mono">npm run evals</code>)}</p>
      </div>
    );
  }
  const { run, results } = data;
  const supplier = new Map(samples.map((s) => [s.id, s]));
  const countries = [...new Set(results.map((r) => r.country))].sort();
  const byCountry = params.pais ? results.filter((r) => r.country === params.pais) : results;
  const rule = FILTERS.find((f) => f.value === params.ver);
  const shown = (rule ? byCountry.filter(rule.test) : byCountry).sort((a, b) => Number(resultOk(a)) - Number(resultOk(b)) || a.id.localeCompare(b.id));
  const count = (list: DocResult[], f: (r: DocResult) => boolean) => list.filter(f).length;
  const cost = (list: DocResult[]) => list.reduce((s, r) => s + (r.costUsd ?? 0), 0);
  const claims = byCountry.filter((r) => r.claim);

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="text-xl font-bold tracking-tight">{t.results.title}</h1>
        <p className="font-mono text-xs text-muted-foreground">{run.runName}</p>
      </div>

      {runs.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="w-16 shrink-0 font-semibold text-muted-foreground">{t.results.run}</span>
          {runs.slice(0, 6).map((r) => (
            <Link
              key={r.file}
              href={withParam('/resultados', params, 'run', r.file)}
              aria-current={r.file === run.file ? 'true' : undefined}
              className={cn(
                'rounded-sm border px-1.5 py-0.5 font-mono',
                r.file === run.file ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
              )}
            >
              {r.runName.replace(/-anthropic_/, ' ')}
              {r.comparable ? '' : t.results.partial}
            </Link>
          ))}
        </div>
      )}

      <dl className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 border-y py-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          [t.common.documents, String(byCountry.length)],
          [t.results.right, pctOf(count(byCountry, resultOk), byCountry.length)],
          [t.results.exactRead, pctOf(count(byCountry, (r) => Boolean(r.comparison?.exact)), count(byCountry, (r) => Boolean(r.comparison)))],
          [t.results.rereadStat, String(count(byCountry, (r) => (r.attempts?.length ?? 0) > 1))],
          [t.results.claims, `${claims.length}${claims.length ? ` · ${t.common.judge} ${nf(claims.reduce((s, r) => s + r.claim!.judge, 0) / claims.length, 2)}` : ''}`],
          [t.results.totalCost, `${nf(cost(byCountry), 3)} $`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[11.5px] font-bold tracking-[0.07em] text-muted-foreground uppercase">{k}</dt>
            <dd className="text-lg font-bold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mb-4 flex flex-col gap-1.5">
        <FilterGroup label={t.common.country} allLabel={t.common.all} param="pais" base="/resultados" params={params} options={countries.map((c) => ({ value: c, label: c, count: count(results, (r) => r.country === c) }))} />
        <FilterGroup label={t.results.show} allLabel={t.common.all} param="ver" base="/resultados" params={params} options={FILTERS.map((f) => ({ value: f.value, label: f.label(t), count: count(byCountry, f.test) }))} />
      </div>

      <section aria-labelledby="tabla">
        <SectionHead id="tabla" note={t.results.tableNote}>
          {t.common.docs(shown.length)}
        </SectionHead>
        <Table>
          <THead>
            <TR>
              <TH>{t.common.document}</TH>
              <TH>{t.common.country}</TH>
              <TH>{t.common.expected}</TH>
              <TH>{t.results.got}</TH>
              <TH>{t.results.read}</TH>
              <TH className="text-right">{t.results.reads}</TH>
              <TH className="text-right">{t.results.claimed}</TH>
              <TH className="text-right">{t.results.judge}</TH>
              <TH className="text-right">{t.results.cost}</TH>
            </TR>
          </THead>
          <TBody>
            {shown.map((r) => {
              const ok = resultOk(r);
              const s = supplier.get(r.id);
              const amountOff = r.claim && r.claim.expectedAmount !== null && Math.abs(r.claim.amount - r.claim.expectedAmount) > 0.02;
              return (
                <TR key={r.id} className={cn('relative hover:bg-hover', !ok && 'bg-danger-soft')}>
                  <TD className="max-w-[22rem]">
                    <Link href={`/muestras/${r.id}`} className="block truncate font-semibold after:absolute after:inset-0 hover:underline">
                      {s?.supplier ?? r.id}
                    </Link>
                    <span className="block truncate text-xs text-muted-foreground">
                      <span className="font-mono">{r.id}</span>
                      {r.planted ? ` · ${t.planted[r.planted] ?? r.planted}` : ''}
                    </span>
                  </TD>
                  <TD>
                    <Country code={r.country} />
                  </TD>
                  <TD className="whitespace-nowrap">
                    <StatusMark status={r.expectedStatus as FinalStatus} className="font-normal" />
                  </TD>
                  <TD className="whitespace-nowrap">
                    {r.error ? <span className="font-semibold text-danger">{t.results.error}</span> : <StatusMark status={r.status as FinalStatus} className={ok ? 'font-normal' : ''} />}
                  </TD>
                  <TD className="max-w-[18rem]">
                    {!r.comparison ? (
                      <span className="text-faint">—</span>
                    ) : r.comparison.exact ? (
                      <span className="text-muted-foreground">
                        <Tick kind="ok" /> {t.results.exact}
                      </span>
                    ) : (
                      <span className="block truncate text-xs text-info" title={r.comparison.mismatches.join('\n')}>
                        ? {t.results.fields(r.comparison.mismatches.length)}: {r.comparison.mismatches[0]?.split(':')[0]}
                      </span>
                    )}
                  </TD>
                  <TD className="text-right tabular-nums">{r.attempts?.length ?? '—'}</TD>
                  <TD className={cn('text-right whitespace-nowrap tabular-nums', amountOff && 'font-semibold text-danger')}>
                    {r.claim ? nf(r.claim.amount, 2) : <span className="text-faint">—</span>}
                    {amountOff && <span className="block text-xs">{t.results.expected(nf(r.claim!.expectedAmount!, 2))}</span>}
                  </TD>
                  <TD className="text-right tabular-nums">{r.claim ? `${r.claim.judge}/5` : <span className="text-faint">—</span>}</TD>
                  <TD className="text-right whitespace-nowrap text-muted-foreground tabular-nums">{r.costUsd !== null && r.costUsd !== undefined ? nf(r.costUsd, 4) : '—'}</TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
