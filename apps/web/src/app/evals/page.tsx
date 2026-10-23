import { SectionHead, Tick } from '@/components/audit';
import { Country } from '@/components/status';
import { Badge } from '@/components/ui/badge';
import { TBody, TD, TH, THead, TR, Table } from '@/components/ui/table';
import { getI18n } from '@/lib/i18n/server';
import { loadEvals, type Metric, type MetricKind } from '@/lib/server/evals';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';


/** Metrics shown first; the rest follow in report order. */
const KEY_METRICS = [
  'Documents 100 % correct (final)',
  'Final status correct',
  'Unfair claims (false positives on clean docs)',
  'Discrepancy recall',
  'Reconciliation status correct',
  'Claim judge score (1-5)',
  'Cost / doc',
  'Latency p95',
];

export default async function EvalsPage() {
  const [{ latest, byModel, runs, baseline }, { t, intl }] = await Promise.all([loadEvals(), getI18n()]);
  const e = t.evals;
  const LABELS = e.labels;
  const nf = (value: number, digits: number) => value.toLocaleString(intl, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const fmt = (value: number | null | undefined, kind: MetricKind) =>
    value === null || value === undefined
      ? '—'
      : kind === 'pct'
        ? `${nf(value * 100, 1)} %`
        : kind === 'usd'
          ? `${nf(value, 4)} $`
          : kind === 'ms'
            ? `${nf(value / 1000, 1)} s`
            : nf(value, 2);
  if (!latest?.byCountry) {
    return (
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-xl font-bold tracking-tight">Evals</h1>
        <p className="mt-3 border-y py-8 text-center text-muted-foreground">
          {e.noReports(<code className="font-mono text-foreground">npm run evals</code>)}
        </p>
      </div>
    );
  }
  const countries = Object.keys(latest.byCountry).sort();
  const names = new Set(countries.flatMap((c) => Object.keys(latest.byCountry![c]!.headline)));
  const metricNames = [...KEY_METRICS.filter((m) => names.has(m)), ...[...names].filter((m) => !KEY_METRICS.includes(m))];
  const checks = latest.checks ?? [];
  const failed = checks.filter((c) => !c.passed);

  return (
    <div className="flex flex-col gap-6 px-4 py-5 sm:px-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight">Evals</h1>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          {e.lastRun} <span className="font-mono text-foreground">{latest.runName}</span> · {t.common.docs(latest.summary.docs)} · {e.model}{' '}
          <span className="font-mono text-foreground">{latest.config.model}</span> · {e.prompt} <span className="font-mono text-foreground">{latest.config.promptVersion}</span>
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-y py-2.5">
        <p className={cn('flex items-center gap-1.5 text-[15px] font-bold', failed.length ? 'text-danger' : 'text-ok')}>
          <Tick kind={failed.length ? 'no' : 'ok'} className="text-inherit" />
          {failed.length ? e.gateFails(failed.length, checks.length) : e.gatePasses(checks.length)}
        </p>
        {['Documents 100 % correct (final)', 'Final status correct', 'Unfair claims (false positives on clean docs)'].map((key) => (
          <p key={key} className="text-muted-foreground">
            {LABELS[key]} <span className="font-bold text-foreground">{fmt(latest.summary.headline[key]?.value, 'pct')}</span>
          </p>
        ))}
      </div>
      {failed.length > 0 && (
        <ul className="-mt-4 text-xs text-danger">
          {failed.map((c) => (
            <li key={`${c.country}-${c.metric}`}>
              <Tick kind="no" /> {c.country} · {LABELS[c.metric] ?? c.metric}
            </li>
          ))}
        </ul>
      )}

      <section aria-labelledby="pais-metrica" className="max-w-5xl">
        <SectionHead id="pais-metrica" note={e.byCountryNote(baseline?.runName ?? null)}>
          {e.byCountry}
        </SectionHead>
        <Table>
          <THead>
            <tr>
              <TH>{e.metric}</TH>
              {countries.map((c) => (
                <TH key={c} className="text-right">
                  <Country code={c} className="text-inherit" />
                </TH>
              ))}
            </tr>
          </THead>
          <TBody>
            {metricNames.map((name) => (
              <TR key={name} className={cn(KEY_METRICS.includes(name) && 'font-semibold')}>
                <TD className="whitespace-nowrap">{LABELS[name] ?? name}</TD>
                {countries.map((c) => {
                  const m: Metric | undefined = latest.byCountry![c]!.headline[name];
                  const base = baseline?.countries[c]?.[name];
                  const fail = checks.some((x) => x.country === c && x.metric === name && !x.passed);
                  return (
                    <TD key={c} className={cn('text-right whitespace-nowrap', fail && 'bg-danger-soft text-danger')}>
                      {fail && <Tick kind="no" className="text-inherit" />}
                      {fmt(m?.value, m?.kind ?? 'num')}
                      {base !== undefined && base !== null && <span className="ml-1 text-[11px] font-normal text-muted-foreground">({fmt(base, m?.kind ?? 'num')})</span>}
                    </TD>
                  );
                })}
              </TR>
            ))}
          </TBody>
        </Table>
      </section>

      <section aria-labelledby="por-modelo">
        <SectionHead id="por-modelo" note={e.byModelNote}>
          {e.byModel}
        </SectionHead>
        <Table>
          <THead>
            <tr>
              <TH>{e.modelCol}</TH>
              <TH>{e.cascade}</TH>
              <TH>{e.promptCol}</TH>
              <TH>{e.docsCol}</TH>
              <TH className="text-right">{e.correct100}</TH>
              <TH className="text-right">{e.statusCorrect}</TH>
              <TH className="text-right">{e.unfair}</TH>
              <TH className="text-right">{e.costDoc}</TH>
              <TH className="text-right">p95</TH>
            </tr>
          </THead>
          <TBody>
            {byModel.map((run) => {
              // Only the same prompt over the same documents can be read against the latest run.
              const comparable = run.config.promptVersion === latest.config.promptVersion && run.summary.docs === latest.summary.docs;
              return (
              <TR key={run.file} className={cn(!comparable && 'text-muted-foreground')}>
                <TD className="font-mono text-xs">
                  {run.config.model}
                  {!comparable && (
                    <Badge tone="outline" className="ml-2 font-sans">
                      {e.notComparable}
                    </Badge>
                  )}
                </TD>
                <TD className="font-mono text-xs">{run.config.escalation ?? e.noEscalation}</TD>
                <TD className="font-mono text-xs">{run.config.promptVersion.replace(/^local:/, '')}</TD>
                <TD className="text-xs whitespace-nowrap">
                  {run.summary.docs} · {Object.keys(run.byCountry ?? {}).join('/')}
                </TD>
                <TD className="text-right">{fmt(run.summary.headline['Documents 100 % correct (final)']?.value, 'pct')}</TD>
                <TD className="text-right">{fmt(run.summary.headline['Final status correct']?.value, 'pct')}</TD>
                <TD className="text-right">{fmt(run.summary.headline['Unfair claims (false positives on clean docs)']?.value, 'pct')}</TD>
                <TD className="text-right">{fmt(run.summary.headline['Cost / doc']?.value, 'usd')}</TD>
                <TD className="text-right">{fmt(run.summary.headline['Latency p95']?.value, 'ms')}</TD>
              </TR>
              );
            })}
          </TBody>
        </Table>
        {byModel.some((run) => run.config.promptVersion !== latest.config.promptVersion || run.summary.docs !== latest.summary.docs) && (
          <p className="mt-1.5 text-xs text-muted-foreground">{e.notComparableNote}</p>
        )}
      </section>

      <section aria-labelledby="ejecuciones">
        <SectionHead id="ejecuciones" note={e.runsNote}>
          {e.runs}
        </SectionHead>
        <ul className="border-t border-foreground">
          {runs.map((run) => {
            const runFailed = (run.checks ?? []).filter((c) => !c.passed).length;
            // Why a run is not comparable: no retries or no cascade (ablation), documents that crashed, or fewer countries.
            const ablation = run.config.maxRetries < 1 || run.runName.endsWith('-nocascade');
            const crashed = (run.summary.headline['Failed runs']?.value ?? 0) > 0;
            return (
              <li key={run.file} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-rule py-1.5">
                <span className={cn('inline-flex w-28 items-center gap-1 text-xs font-semibold', runFailed ? 'text-danger' : 'text-ok')}>
                  <Tick kind={runFailed ? 'no' : 'ok'} className="text-inherit" />
                  {runFailed ? e.gateFailsShort(runFailed) : e.gatePassesShort}
                </span>
                <span className="font-mono text-xs">{run.runName}</span>
                {run.config.smoke && <Badge tone="outline">smoke</Badge>}
                {!run.config.smoke && ablation && <Badge tone="outline">{e.ablation}</Badge>}
                {!run.config.smoke && !ablation && crashed && <Badge tone="danger">{e.withErrors}</Badge>}
                {!run.comparable && !run.config.smoke && !ablation && !crashed && <Badge tone="outline">{e.partial}</Badge>}
                <span className="ml-auto text-xs text-muted-foreground">
                  {run.summary.docs} docs · {new Date(run.modifiedAt).toLocaleString(intl)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
