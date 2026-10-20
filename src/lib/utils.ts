import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

/** Whole days from `from` until the start of the ISO date `to`, in local time. */
export function daysUntil(to: string, from = new Date()) {
  const [y, m, d] = to.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', opts);
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Marks with GATE's thirds shown as 0.33 / 0.67 rather than long floats. */
export const formatMarks = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** A stopwatch reading: 65 → "1:05", 3725 → "1:02:05". */
export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}
