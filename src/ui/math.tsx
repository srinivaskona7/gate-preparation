import katex from 'katex';
import { memo } from 'react';
import { cn } from '@/lib/utils';

const cache = new Map<string, string>();

function render(tex: string, displayMode: boolean) {
  const key = `${displayMode ? 'D' : 'I'}${tex}`;
  let html = cache.get(key);
  if (html === undefined) {
    // Content is validated at build time, so throwOnError: false only guards against surprises.
    html = katex.renderToString(tex, { displayMode, throwOnError: false, strict: 'ignore' });
    cache.set(key, html);
  }
  return html;
}

export interface Segment {
  math: boolean;
  value: string;
}

/** Splits prose on $…$ the way scripts/check-manifest.mjs does; `\$` is a literal dollar. */
export function splitMath(text: string): Segment[] {
  const parts: Segment[] = [];
  let buf = '';
  let inMath = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\' && text[i + 1] === '$') {
      buf += inMath ? '\\$' : '$';
      i++;
    } else if (ch === '$') {
      if (buf) parts.push({ math: inMath, value: buf });
      buf = '';
      inMath = !inMath;
    } else {
      buf += ch;
    }
  }
  if (buf) parts.push({ math: inMath, value: buf });
  return parts;
}

/** Prose with inline math. */
export const MathText = memo(function MathText({ text, className }: { text: string; className?: string }) {
  if (!text.includes('$')) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {splitMath(text).map((s, i) =>
        s.math ? <span key={i} dangerouslySetInnerHTML={{ __html: render(s.value, false) }} /> : <span key={i}>{s.value}</span>,
      )}
    </span>
  );
});

/** Display math, scrolling horizontally when it is wider than its container. */
export const Tex = memo(function Tex({ tex, className, inline = false }: { tex: string; className?: string; inline?: boolean }) {
  return <span className={cn(inline ? '' : 'block', className)} dangerouslySetInnerHTML={{ __html: render(tex, !inline) }} />;
});
