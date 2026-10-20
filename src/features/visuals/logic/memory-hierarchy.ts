// Effective memory access time over a hierarchy of levels, and a seeded run of requests for the
// 3D model. Hit ratios are local, as in GATE questions: the fraction of the requests reaching a
// level that hit there. The last level holds everything, so its hit ratio is 1 whatever is set.

import { random } from '@/lib/random';

export interface Level {
  name: string;
  /** Access time, ns. */
  time: number;
  /** Local hit ratio, 0 to 1. */
  hit: number;
}

/**
 * Hierarchical (look-through): a request probes one level at a time, so a miss pays for every
 * level it passed. Simultaneous (look-aside): every level is probed at once and the request pays
 * only for the level that answers.
 */
export type Access = 'hierarchical' | 'simultaneous';

const localHit = (levels: readonly Level[], i: number) => (i === levels.length - 1 ? 1 : levels[i].hit);

/** The probability that a request gets as far as each level: (1 − h₁)⋯(1 − hᵢ₋₁). */
export function reachShare(levels: readonly Level[]): number[] {
  let reach = 1;
  return levels.map((_, i) => {
    const here = reach;
    reach *= 1 - localHit(levels, i);
    return here;
  });
}

/** The probability that each level is the one that serves a request; the shares sum to 1. */
export const servedShare = (levels: readonly Level[]) => reachShare(levels).map((r, i) => r * localHit(levels, i));

/** Each level's coefficient in the access-time sum, so the sum can be shown term by term. */
export const coefficients = (levels: readonly Level[], access: Access) => (access === 'hierarchical' ? reachShare(levels) : servedShare(levels));

/** Hierarchical T = Σ reachᵢ · tᵢ; simultaneous T = Σ reachᵢ · hᵢ · tᵢ. */
export const emat = (levels: readonly Level[], access: Access) =>
  coefficients(levels, access).reduce((sum, c, i) => sum + c * levels[i].time, 0);

/** What one request served at `level` costs. */
export function requestTime(levels: readonly Level[], level: number, access: Access) {
  if (access === 'simultaneous') return levels[level].time;
  return levels.slice(0, level + 1).reduce((sum, l) => sum + l.time, 0);
}

/** The level that serves each of `n` requests, drawn level by level with the local hit ratios. */
export function simulate(levels: readonly Level[], n: number, seed: number): number[] {
  const next = random(seed);
  return Array.from({ length: n }, () => {
    let i = 0;
    while (i < levels.length - 1 && next() >= levels[i].hit) i++;
    return i;
  });
}
