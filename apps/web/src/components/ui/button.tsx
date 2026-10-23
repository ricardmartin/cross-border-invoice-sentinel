import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-primary-foreground hover:opacity-90',
        outline: 'border-border bg-transparent text-foreground hover:bg-hover',
        ghost: 'border-transparent text-muted-foreground hover:bg-hover hover:text-foreground',
        danger: 'border-danger bg-danger text-sheet hover:opacity-90',
      },
      size: { default: 'h-8 px-3.5 text-[13px]', sm: 'h-7 px-2.5 text-xs', lg: 'h-9 px-4 text-sm' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export function Button({ className, variant, size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
export { buttonVariants };
