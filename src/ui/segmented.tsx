import { ToggleGroup } from 'radix-ui';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  title?: string;
}

/** A single-choice segmented control: arrow keys move between options, as in a radio group. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  size = 'sm',
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  label: string;
  className?: string;
  size?: 'xs' | 'sm';
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      // Radix reports "" when the active item is clicked again; a segmented control keeps its value.
      onValueChange={(v) => v && onChange(v as T)}
      aria-label={label}
      className={cn('inline-flex rounded-[10px] border border-line bg-surface-2/70 p-0.5', className)}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          title={o.title}
          className={cn(
            'rounded-[8px] font-medium text-muted transition-colors hover:text-ink data-[state=on]:bg-surface-3 data-[state=on]:text-ink data-[state=on]:shadow-[inset_0_0_0_1px_var(--line-strong)]',
            size === 'xs' ? 'px-2 py-1 text-[11.5px]' : 'px-2.5 py-1.5 text-[12.5px]',
          )}
        >
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
