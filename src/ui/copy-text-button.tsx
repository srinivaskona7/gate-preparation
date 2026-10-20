import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, type ButtonProps } from './button';

const CONFIRM_MS = 1500;

/** A labelled button that copies text and confirms in place. */
export function CopyTextButton({ text, children, ...props }: { text: string; children: string } & Omit<ButtonProps, 'onClick' | 'children'>) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), CONFIRM_MS);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <Button {...props} onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true), () => setCopied(false))}>
      {copied ? <Check className="text-emerald" /> : <Copy />}
      <span aria-live="polite">{copied ? 'Copied' : children}</span>
    </Button>
  );
}
