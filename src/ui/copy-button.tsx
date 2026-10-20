import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

const CONFIRM_MS = 1500;

export function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), CONFIRM_MS);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('size-8', className)}
      aria-label={copied ? 'Copied' : label}
      title={label}
      onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true), () => setCopied(false))}
    >
      {copied ? <Check className="text-emerald" /> : <Copy />}
    </Button>
  );
}
