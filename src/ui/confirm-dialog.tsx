import { AlertDialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { Button } from './button';

/**
 * A blocking yes-or-no question; Radix keeps focus inside and returns it on close. Confirming does
 * not close it: the owner does, by changing `open`, so a confirm that navigates away is never
 * followed by a cancel.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  children,
  confirm,
  cancel = 'Cancel',
  onConfirm,
  tone = 'primary',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children?: ReactNode;
  confirm: string;
  cancel?: string;
  onConfirm: () => void;
  tone?: 'primary' | 'danger';
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="drawer-overlay fixed inset-0 z-40 bg-canvas/70 backdrop-blur-[2px]" />
        <AlertDialog.Content className="palette-panel glass-strong fixed left-1/2 top-[18vh] z-50 w-[min(460px,calc(100vw-1.5rem))] -translate-x-1/2 rounded-[16px] p-6 outline-none">
          <AlertDialog.Title className="font-display text-[17px] font-semibold text-ink">{title}</AlertDialog.Title>
          <AlertDialog.Description asChild>
            <div className="mt-2 text-[13.5px] leading-relaxed text-muted">{children}</div>
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="ghost">{cancel}</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant={tone}
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                }}
              >
                {confirm}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
