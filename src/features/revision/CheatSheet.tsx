import { CircleAlert, Printer } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { chapterPath } from '@/content/catalog';
import type { RevisionSheet } from '@/content/types';
import { ComplexityTable } from '@/features/formulas/ComplexityTable';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { MathText, Tex } from '@/ui/math';

export type SheetContent = Pick<RevisionSheet, 'title' | 'highYield' | 'revisionCard' | 'pitfalls' | 'formulas' | 'complexity'>;

/**
 * A one-chapter revision sheet: dense, column-flowed and print-ready, for the last pass before
 * a mock or the exam. Every line is the chapter's own content; nothing here is new material.
 */
export function CheatSheet({ sheet, chapterId, heading = true }: { sheet: SheetContent; chapterId: string; heading?: boolean }) {
  return (
    <article aria-labelledby={`sheet-${chapterId}`} className="space-y-5">
      <header className={heading ? 'flex flex-wrap items-end justify-between gap-3' : 'sr-only'}>
        <div>
          <p className="eyebrow mb-1">Cheat sheet</p>
          <h2 id={`sheet-${chapterId}`} className="text-[20px] font-bold text-ink">
            {sheet.title}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} data-print="hide">
          <Printer /> Print or save as PDF
        </Button>
      </header>

      <div className="gap-4 [column-fill:balance] md:columns-2 2xl:columns-3">
        {sheet.highYield.length > 0 && (
          <Block title="High yield">
            <ol className="space-y-1.5">
              {sheet.highYield.map((h, i) => (
                <li key={h} className="flex gap-2">
                  <span className="font-mono text-[11px] font-semibold text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <MathText text={h} />
                </li>
              ))}
            </ol>
          </Block>
        )}

        {sheet.revisionCard.map((b) => (
          <Block key={b.heading} title={b.heading}>
            <ul className="prose-points list-disc space-y-1 pl-4">
              {b.lines.map((l) => (
                <li key={l}>
                  <MathText text={l} />
                </li>
              ))}
            </ul>
          </Block>
        ))}

        {sheet.formulas.length > 0 && (
          <Block title="Formulas">
            <ul className="space-y-2.5">
              {sheet.formulas.map((f) => (
                <li key={f.id}>
                  <Link to={chapterPath(chapterId, 'formulas', f.id)} className="text-[12px] font-medium text-muted hover:text-accent">
                    {f.name}
                  </Link>
                  <Tex tex={f.tex} className="text-[13.5px] text-accent" />
                </li>
              ))}
            </ul>
          </Block>
        )}

        {sheet.pitfalls.length > 0 && (
          <Block title="Pitfalls" tone="coral">
            <ul className="space-y-1.5">
              {sheet.pitfalls.map((p) => (
                <li key={p.text} className="flex gap-2">
                  <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-coral" aria-hidden />
                  <MathText text={p.text} />
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>

      {sheet.complexity.length > 0 && <ComplexityTable rows={sheet.complexity} compact />}
    </article>
  );
}

function Block({ title, tone = 'accent', children }: { title: string; tone?: 'accent' | 'coral'; children: ReactNode }) {
  return (
    <section className="glass mb-4 break-inside-avoid p-4 text-[12.5px] leading-relaxed text-ink/90">
      <h3 className={cn('mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em]', tone === 'coral' ? 'text-coral' : 'text-accent')}>
        {title}
      </h3>
      {children}
    </section>
  );
}
