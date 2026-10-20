import { cn } from '@/lib/utils';

/**
 * HTML rendered at build time by scripts/emit-site-data.mjs (markdown + KaTeX).
 * The markdown comes from validated repo files that may not contain raw HTML.
 */
export function RenderedHtml({ html, className }: { html: string; className?: string }) {
  return <div className={cn('prose-rendered', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
