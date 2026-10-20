import { cn } from '@/lib/utils';

/** A compact native select for filter bars; it outlines itself while it narrows the list. */
export function Select({
  label,
  value,
  onChange,
  options,
  idle = 'all',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  /** The value that filters nothing. */
  idle?: string;
}) {
  return (
    <label className="flex items-center gap-2 text-[12px] text-faint">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 max-w-[220px] rounded-[10px] border bg-surface-2/70 px-2.5 text-[13px] outline-none focus:border-accent',
          value === idle ? 'border-line text-muted' : 'border-accent/50 text-ink',
        )}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
