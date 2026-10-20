import { useEffect } from 'react';

const HIGHLIGHT_MS = 2200;

/**
 * Scrolls a deep-linked item (a topic, formula or question id from the URL) into view once
 * it has rendered, and outlines it briefly so the eye finds it. `ready` re-runs the search
 * after asynchronously loaded content arrives.
 */
export function useScrollToItem(item: string | undefined, ready = true) {
  useEffect(() => {
    if (!item || !ready) return;
    const el = document.getElementById(item);
    if (!el) return;
    el.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    el.dataset.highlight = 'true';
    const t = setTimeout(() => delete el.dataset.highlight, HIGHLIGHT_MS);
    return () => {
      clearTimeout(t);
      delete el.dataset.highlight;
    };
  }, [item, ready]);
}
