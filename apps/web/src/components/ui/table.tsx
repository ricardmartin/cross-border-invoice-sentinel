import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Table = ({ className, ...p }: HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto">
    <table className={cn('w-full border-collapse text-[13px]', className)} {...p} />
  </div>
);
export const THead = (p: HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} />;
export const TBody = (p: HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;
export const TFoot = (p: HTMLAttributes<HTMLTableSectionElement>) => <tfoot {...p} />;
export const TR = ({ className, ...p }: HTMLAttributes<HTMLTableRowElement>) => <tr className={cn('border-b border-rule', className)} {...p} />;
export const TH = ({ className, ...p }: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('border-b border-foreground px-1.5 py-1.5 text-left align-bottom text-[11.5px] font-semibold whitespace-nowrap text-muted-foreground', className)} {...p} />
);
export const TD = ({ className, ...p }: TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn('px-1.5 py-1.5 align-top', className)} {...p} />;
/** Narrow column for tickmarks, set right after the figure it marks. */
export const TK = ({ className, ...p }: TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn('w-8 py-1.5 pr-1 pl-0.5 align-top whitespace-nowrap', className)} {...p} />;
