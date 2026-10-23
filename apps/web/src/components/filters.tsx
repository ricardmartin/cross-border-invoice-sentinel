import Link from 'next/link';
import { cn } from '@/lib/utils';

export type Params = Record<string, string | undefined>;

/** Same page with one parameter changed (undefined removes it). */
export function withParam(base: string, params: Params, key: string, value: string | undefined) {
  const q = new URLSearchParams(Object.entries({ ...params, [key]: value }).filter((e): e is [string, string] => Boolean(e[1])));
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

/** One row of filter links: plain navigation, so filters work without client JavaScript and can be bookmarked. */
export function FilterGroup({
  label,
  param,
  options,
  params,
  base,
  allLabel,
}: {
  label: string;
  param: string;
  options: { value: string; label: string; count?: number }[];
  params: Params;
  base: string;
  /** "All" in the page's language (a server component: no dictionary hook here). */
  allLabel: string;
}) {
  const current = params[param];
  const item = (value: string | undefined, text: string, count?: number) => {
    const active = current === value;
    return (
      <Link
        key={value ?? 'all'}
        href={withParam(base, params, param, value)}
        aria-current={active ? 'true' : undefined}
        className={cn(
          'rounded-sm border px-1.5 py-0.5 whitespace-nowrap',
          active ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
        )}
      >
        {text}
        {count !== undefined && <span className={cn('ml-1 tabular-nums', active ? 'opacity-80' : 'text-faint')}>{count}</span>}
      </Link>
    );
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="w-16 shrink-0 font-semibold text-muted-foreground">{label}</span>
      {item(undefined, allLabel)}
      {options.map((o) => item(o.value, o.label, o.count))}
    </div>
  );
}
