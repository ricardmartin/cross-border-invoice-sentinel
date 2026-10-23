import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = ({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn('h-8 w-full rounded-md border bg-sheet px-2.5 text-[13px] focus-visible:border-info', className)} {...p} />
);
export const Textarea = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn('field-sizing-content w-full rounded-md border bg-sheet px-2.5 py-2 text-[13px] leading-relaxed focus-visible:border-info', className)} {...p} />
);
