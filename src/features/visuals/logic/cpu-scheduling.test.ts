import { describe, expect, it } from 'vitest';
import { type Proc, schedule } from './cpu-scheduling';

const procs = (rows: [number, number, number?][]): Proc[] =>
  rows.map(([arrival, burst, priority = 0], i) => ({ id: `P${i + 1}`, arrival, burst, priority }));

const waits = (s: ReturnType<typeof schedule>) => s.rows.map((r) => r.waiting);

describe('schedule', () => {
  it('FCFS serves in arrival order (convoy effect example)', () => {
    const s = schedule(procs([[0, 24], [0, 3], [0, 3]]), 'fcfs');
    expect(waits(s)).toEqual([0, 24, 27]);
    expect(s.avgWaiting).toBe(17);
  });

  it('SJF picks the shortest burst among arrived processes', () => {
    const s = schedule(procs([[0, 6], [0, 8], [0, 7], [0, 3]]), 'sjf');
    expect(waits(s)).toEqual([3, 16, 9, 0]);
    expect(s.avgWaiting).toBe(7);
  });

  it('SRTF matches the textbook example: average wait 6.5', () => {
    const s = schedule(procs([[0, 8], [1, 4], [2, 9], [3, 5]]), 'srtf');
    expect(s.slices.map((x) => [x.pid, x.start, x.end])).toEqual([
      ['P1', 0, 1],
      ['P2', 1, 5],
      ['P4', 5, 10],
      ['P1', 10, 17],
      ['P3', 17, 26],
    ]);
    expect(s.avgWaiting).toBe(6.5);
  });

  it('SRTF keeps the running process when a newcomer ties its remaining time', () => {
    const s = schedule(procs([[0, 4], [2, 2]]), 'srtf');
    expect(s.slices.map((x) => x.pid)).toEqual(['P1', 'P2']);
  });

  it('round robin with quantum 4', () => {
    const s = schedule(procs([[0, 24], [0, 3], [0, 3]]), 'rr', 4);
    expect(waits(s)).toEqual([6, 4, 7]);
  });

  it('round robin queues an arrival ahead of the process whose quantum just ended', () => {
    // At t = 2, P1's quantum ends exactly as P2 arrives: P2 runs next.
    const s = schedule(procs([[0, 4], [2, 2]]), 'rr', 2);
    expect(s.slices.map((x) => [x.pid, x.start, x.end])).toEqual([
      ['P1', 0, 2],
      ['P2', 2, 4],
      ['P1', 4, 6],
    ]);
  });

  it('non-preemptive priority, lower number first', () => {
    const s = schedule(procs([[0, 10, 3], [0, 1, 1], [0, 2, 4], [0, 1, 5], [0, 5, 2]]), 'priority');
    expect(s.slices.map((x) => x.pid)).toEqual(['P2', 'P5', 'P1', 'P3', 'P4']);
    expect(s.avgWaiting).toBeCloseTo(8.2, 9);
  });

  it('HRRN favours a long wait over a short burst once the ratio says so', () => {
    const s = schedule(procs([[0, 3], [2, 6], [4, 4], [6, 5], [8, 2]]), 'hrrn');
    expect(s.slices.map((x) => x.pid)).toEqual(['P1', 'P2', 'P3', 'P5', 'P4']);
    expect(s.rows.map((r) => r.completion)).toEqual([3, 9, 13, 20, 15]);
  });

  it('idles until the first arrival and reports utilisation over the busy span', () => {
    const s = schedule(procs([[2, 3], [10, 1]]), 'fcfs');
    expect(s.slices.map((x) => [x.pid, x.start, x.end])).toEqual([
      [null, 0, 2],
      ['P1', 2, 5],
      [null, 5, 10],
      ['P2', 10, 11],
    ]);
    expect(s.utilisation).toBeCloseTo(4 / 9, 9);
  });

  it('terminates on a zero burst and a zero quantum', () => {
    expect(schedule(procs([[0, 0], [1, 2]]), 'srtf').rows.map((r) => r.completion)).toEqual([0, 3]);
    expect(schedule(procs([[0, 2]]), 'rr', 0).rows[0].completion).toBe(2);
  });
});
