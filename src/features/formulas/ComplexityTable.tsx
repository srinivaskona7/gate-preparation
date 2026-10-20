import type { ComplexityRow } from '@/content/types';
import { cn } from '@/lib/utils';
import { MathText } from '@/ui/math';
import { SectionHeading } from '@/ui/primitives';

/** Best, average, worst and space costs; columns no row fills are left out. */
export function ComplexityTable({ rows, compact = false }: { rows: ComplexityRow[]; compact?: boolean }) {
  const cols = (['best', 'average', 'worst', 'space'] as const).filter((c) => rows.some((r) => r[c]));
  return (
    <section aria-labelledby={compact ? undefined : 'complexity-title'} aria-label={compact ? 'Complexity table' : undefined}>
      {!compact && <SectionHeading id="complexity-title" eyebrow="Costs at a glance" title="Complexity table" />}
      <div className="glass overflow-x-auto p-0">
        <table className={cn('w-full text-left', compact ? 'min-w-[480px] text-[12px]' : 'min-w-[640px] text-[13px]')}>
          <thead className="border-b border-line font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
            <tr>
              <th className={cn('font-medium', compact ? 'px-3 py-2' : 'px-4 py-3')}>Algorithm or structure</th>
              {cols.map((c) => (
                <th key={c} className={cn('font-medium', compact ? 'px-3 py-2' : 'px-4 py-3')}>
                  {c}
                </th>
              ))}
              {!compact && <th className="px-4 py-3 font-medium">Notes</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} id={compact ? undefined : r.id} className="scroll-mt-36 align-top">
                <th scope="row" className={cn('font-medium text-ink', compact ? 'px-3 py-2' : 'px-4 py-3')}>
                  {r.name}
                </th>
                {cols.map((c) => (
                  <td key={c} className={cn('font-mono leading-relaxed text-ink', compact ? 'px-3 py-2 text-[11.5px]' : 'px-4 py-3 text-[12px]')}>
                    {r[c] ? <MathText text={r[c]} /> : <span className="text-faint">–</span>}
                  </td>
                ))}
                {!compact && (
                  <td className="px-4 py-3 text-[12.5px] leading-relaxed text-muted">{r.notes && <MathText text={r.notes} />}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
