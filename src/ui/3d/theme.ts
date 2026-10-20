import { Color, SRGBColorSpace } from 'three';
import { useEffect, useState } from 'react';

// The site's theme tokens, resolved for WebGL materials and canvas-drawn labels. Scenes rebuild
// from a fresh palette whenever data-theme flips, so a 3D model never keeps the other theme's colours.

const TOKENS = ['accent', 'amber', 'violet', 'coral', 'emerald', 'ink', 'muted', 'faint', 'canvas', 'surface', 'surface-2', 'surface-3', 'line-strong'] as const;
export type Token = (typeof TOKENS)[number];

export interface Swatch {
  /** In three.js's linear working space, ready for a material. */
  color: Color;
  alpha: number;
  /** An opaque or rgba() string a 2D canvas understands. */
  css: string;
}

export interface Palette {
  dark: boolean;
  swatch: Record<Token, Swatch>;
  mono: string;
  sans: string;
}

let probe: CanvasRenderingContext2D | null | undefined;

/** sRGB channels of any CSS colour, parsed by a 2D canvas, which accepts every syntax the stylesheet may use. */
function channels(value: string): [number, number, number, number] {
  probe ??= document.createElement('canvas').getContext('2d');
  if (!probe) return [0, 0, 0, 1];
  probe.fillStyle = '#000';
  probe.fillStyle = value;
  const v = probe.fillStyle;
  if (v.startsWith('#')) return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16), 1];
  const [r = 0, g = 0, b = 0, a = 1] = (v.match(/[\d.]+/g) ?? []).map(Number);
  return [r, g, b, a];
}

export function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const swatch = {} as Record<Token, Swatch>;
  for (const t of TOKENS) {
    const [r, g, b, a] = channels(style.getPropertyValue(`--${t}`).trim());
    swatch[t] = { color: new Color().setRGB(r / 255, g / 255, b / 255, SRGBColorSpace), alpha: a, css: a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})` };
  }
  return {
    dark: document.documentElement.dataset.theme !== 'light',
    swatch,
    mono: style.getPropertyValue('--font-mono').trim() || 'monospace',
    sans: style.getPropertyValue('--font-sans').trim() || 'sans-serif',
  };
}

/** The current palette, re-read when the theme flips and once the web fonts have loaded. */
export function usePalette(): Palette {
  const [palette, setPalette] = useState(readPalette);
  useEffect(() => {
    let live = true;
    const reread = () => {
      if (live) setPalette(readPalette());
    };
    const observer = new MutationObserver(reread);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    // Labels drawn before a web font arrives would keep the fallback face.
    const { mono, sans } = readPalette();
    const missing = [mono, sans].map((family) => `600 32px ${family}`).filter((font) => !document.fonts.check(font));
    if (missing.length) void Promise.all(missing.map((font) => document.fonts.load(font))).then(reread);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, []);
  return palette;
}
