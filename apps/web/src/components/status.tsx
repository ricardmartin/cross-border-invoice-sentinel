import type { FinalStatus } from '@sentinel/core';
import type { TickKind } from '@/components/audit';
import { cn } from '@/lib/utils';

/** How each final status is marked; its words are in the dictionary (`t.status`). */
export const STATUS: Record<FinalStatus, { tick: TickKind; text: string }> = {
  VALID: { tick: 'ok', text: 'text-ok' },
  SUPPLIER_DISCREPANCY: { tick: 'no', text: 'text-danger' },
  EXTRACTION_UNCERTAIN: { tick: 'doubt', text: 'text-info' },
  INVALID_TAX_ID: { tick: 'no', text: 'text-danger' },
};

/** Country code set in small caps (emoji flags do not render on Windows, so no flags). */
export function Country({ code, className }: { code: string; className?: string }) {
  return <span className={cn('font-mono text-[11px] font-semibold tracking-wide text-muted-foreground', className)}>{code}</span>;
}

/** Model id without its provider prefix ("anthropic:claude-haiku-5-5" → "claude-haiku-5-5"). */
export const modelName = (id: string) => id.slice(id.indexOf(':') + 1);
