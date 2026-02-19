import type { PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn('rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm', className)}>{children}</section>;
}
