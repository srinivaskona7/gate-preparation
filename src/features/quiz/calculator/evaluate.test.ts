import { describe, expect, it } from 'vitest';
import { evaluate, factorial, formatResult } from './evaluate';

const ev = (s: string, a: 'deg' | 'rad' = 'deg') => formatResult(evaluate(s, a));

describe('evaluate', () => {
  it('follows precedence and associativity', () => {
    expect(ev('2+3×4')).toBe('14');
    expect(ev('(2+3)×4')).toBe('20');
    expect(ev('2^3^2')).toBe('512');
    expect(ev('-2^2')).toBe('-4');
    expect(ev('2^-1')).toBe('0.5');
    expect(ev('10÷4')).toBe('2.5');
    expect(ev('7 mod 3')).toBe('1');
    expect(ev('-7 mod 3')).toBe('-1');
    expect(ev('3!+1')).toBe('7');
    expect(ev('50%×80')).toBe('40');
  });

  it('handles degrees and radians', () => {
    expect(ev('sin(30)')).toBe('0.5');
    expect(ev('cos(60)')).toBe('0.5');
    expect(ev('sin(pi/2)', 'rad')).toBe('1');
    expect(ev('atan(1)')).toBe('45');
    expect(ev('tan(90)')).toBe('Math error');
    expect(ev('sin(180)')).toBe('0');
  });

  it('computes logs, roots and exponents used in GATE NATs', () => {
    expect(ev('log(1000)')).toBe('3');
    expect(ev('ln(e)')).toBe('1');
    expect(ev('log2(1024)')).toBe('10');
    expect(ev('sqrt(2)')).toBe('1.414213562');
    expect(ev('cbrt(27)')).toBe('3');
    expect(ev('1-(1-0.1)^10')).toBe('0.6513215599');
    expect(ev('2.5E3')).toBe('2500');
  });

  it('reports bad input as an error, not a number', () => {
    for (const bad of ['2+', '(1', 'foo(2)', '2 3', '1/', 'sin 30']) expect(() => evaluate(bad)).toThrow(SyntaxError);
    expect(ev('1/0')).toBe('Infinity');
    expect(ev('sqrt(-1)')).toBe('Math error');
  });
});

describe('factorial and formatting', () => {
  it('defines n! for whole n only', () => {
    expect([factorial(0), factorial(5), factorial(2.5), factorial(-1)]).toEqual([1, 120, Number.NaN, Number.NaN]);
  });

  it('switches to exponent form for very large and very small values', () => {
    expect(formatResult(123456789012)).toBe('1.234568e+11');
    expect(formatResult(0.00000012)).toBe('1.2e-7');
    expect(formatResult(-0)).toBe('0');
  });
});
