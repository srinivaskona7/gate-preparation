import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** React 19 hoists <title> into <head>, so a page names its tab where it renders. */
export function DocTitle({ children }: { children: string }) {
  return <title>{`${children} · GATE Atlas`}</title>;
}

export function PageHeader({
  eyebrow,
  title,
  docTitle,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** The tab title; required when `title` is not plain text. */
  docTitle?: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const tab = docTitle ?? (typeof title === 'string' ? title : undefined);
  return (
    <header className={cn('mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4', className)}>
      {tab && <DocTitle>{tab}</DocTitle>}
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <div className="eyebrow mb-2 flex flex-wrap items-center gap-2">{eyebrow}</div>}
        <h1 className="text-[26px] font-bold leading-tight text-ink sm:text-[30px]">{title}</h1>
        {description && <div className="mt-2 text-[14.5px] leading-relaxed text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
