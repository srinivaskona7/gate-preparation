import { X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'left' | 'right';
  title: ReactNode;
  description?: ReactNode;
  /** Rendered in the header row, before the close button. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A modal panel that slides in from one edge; Radix handles focus trapping, Escape and scroll lock. */
export function Drawer({ open, onOpenChange, side = 'right', title, description, actions, children, className }: DrawerProps) {
  // Without a description, an explicit undefined tells Radix the title alone labels the dialog.
  const describedBy = description ? {} : { 'aria-describedby': undefined };
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-40 bg-canvas/75 backdrop-blur-[6px]" />
        <Dialog.Content
          {...describedBy}
          data-side={side}
          className={cn(
            'drawer-panel glass-strong fixed inset-y-0 z-50 flex w-full flex-col outline-none',
            side === 'right' ? 'right-0 border-l border-line' : 'left-0 max-w-[300px] border-r border-line',
            className,
          )}
        >
          <header className="flex items-start gap-3 border-b border-line px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="font-display text-[15px] font-semibold leading-snug text-ink">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-0.5 text-[12.5px] text-muted">{description}</Dialog.Description>}
            </div>
            {actions}
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X />
              </Button>
            </Dialog.Close>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
