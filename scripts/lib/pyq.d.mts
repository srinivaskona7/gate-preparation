export type ParsedKey = { mta: true } | { accepted: number[] } | { sets: number[][] } | { ranges: [number, number][] };
export const PAPERS: string[];
export function questionId(paper: string, section: 'GA' | 'CS', n: number): string;
export function parseKey(raw: unknown, type: 'mcq' | 'msq' | 'nat'): ParsedKey | null;
export function keyAccepts(key: ParsedKey, type: 'mcq' | 'msq' | 'nat', answer: number | number[]): boolean;
