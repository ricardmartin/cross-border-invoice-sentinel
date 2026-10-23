import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Small rectangular tag, the way a reviewer would box a note in the margin. */
const badgeVariants = cva('inline-flex items-center gap-1 rounded-sm border px-1.5 py-px text-[11.5px] font-semibold whitespace-nowrap', {
  variants: {
    tone: {
      default: 'border-border text-foreground',
      outline: 'border-border font-medium text-muted-foreground',
      ok: 'border-ok/50 text-ok',
      danger: 'border-danger/50 text-danger',
      info: 'border-info/50 text-info',
    },
  },
  defaultVariants: { tone: 'default' },
});

export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
