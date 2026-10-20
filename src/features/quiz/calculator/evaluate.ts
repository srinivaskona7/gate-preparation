/**
 * The GATE virtual calculator's arithmetic: a recursive-descent parser over the expression the
 * keypad builds, so nothing reaches eval. Precedence, lowest first: + −, × ÷ mod, unary −, ^
 * (right-associative), postfix !. Functions take a parenthesised argument.
 */

export type AngleMode = 'deg' | 'rad';

const FUNCTIONS: Record<string, (x: number, angle: AngleMode) => number> = {
  sin: (x, a) => Math.sin(toRad(x, a)),
  cos: (x, a) => Math.cos(toRad(x, a)),
  tan: (x, a) => {
    // tan 90° is undefined; floating point would otherwise return 1.6e16.
    if (a === 'deg' && Math.abs(((x % 180) + 180) % 180 - 90) < 1e-12) return Number.NaN;
    return Math.tan(toRad(x, a));
  },
  asin: (x, a) => fromRad(Math.asin(x), a),
  acos: (x, a) => fromRad(Math.acos(x), a),
  atan: (x, a) => fromRad(Math.atan(x), a),
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  asinh: Math.asinh,
  acosh: Math.acosh,
  atanh: Math.atanh,
  log: Math.log10,
  ln: Math.log,
  log2: Math.log2,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  exp: Math.exp,
  abs: Math.abs,
};

const CONSTANTS: Record<string, number> = { pi: Math.PI, π: Math.PI, e: Math.E };

const toRad = (x: number, a: AngleMode) => (a === 'deg' ? (x * Math.PI) / 180 : x);
const fromRad = (x: number, a: AngleMode) => (a === 'deg' ? (x * 180) / Math.PI : x);

export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) return Number.NaN;
  if (n > 170) return Number.POSITIVE_INFINITY;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

type Token = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') {
      i++;
    } else if (/[\d.]/.test(c)) {
      const m = /^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/i.exec(s.slice(i));
      if (!m) throw new SyntaxError(`bad number at ${i}`);
      out.push({ t: 'num', v: Number(m[0]) });
      i += m[0].length;
    } else if (/[a-zπ]/i.test(c)) {
      const m = /^([a-z][a-z0-9]*|π)/i.exec(s.slice(i));
      if (!m) throw new SyntaxError(`bad name at ${i}`);
      out.push({ t: 'id', v: m[0].toLowerCase() });
      i += m[0].length;
    } else if ('+-*/^()!%'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
    } else throw new SyntaxError(`unexpected "${c}"`);
  }
  return out;
}

export function evaluate(src: string, angle: AngleMode = 'deg'): number {
  const tokens = tokenize(src);
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (v: string) => peek()?.t === 'op' && peek()?.v === v;
  const isId = (v: string) => peek()?.t === 'id' && peek()?.v === v;
  const expect = (v: string) => {
    if (!isOp(v)) throw new SyntaxError(`expected "${v}"`);
    pos++;
  };

  function sum(): number {
    let v = product();
    while (isOp('+') || isOp('-')) v = tokens[pos++].v === '+' ? v + product() : v - product();
    return v;
  }
  function product(): number {
    let v = unary();
    for (;;) {
      if (isOp('*')) (pos++, (v *= unary()));
      else if (isOp('/')) (pos++, (v /= unary()));
      else if (isId('mod')) {
        pos++;
        const d = unary();
        // GATE's mod follows the dividend's sign, as JavaScript's % does.
        v %= d;
      } else return v;
    }
  }
  function unary(): number {
    if (isOp('-')) return (pos++, -unary());
    if (isOp('+')) return (pos++, unary());
    return power();
  }
  function power(): number {
    const base = postfix();
    // −2^2 is −4: unary minus binds looser than ^, and the exponent may carry its own sign.
    return isOp('^') ? (pos++, base ** unary()) : base;
  }
  function postfix(): number {
    let v = atom();
    for (;;) {
      if (isOp('!')) (pos++, (v = factorial(v)));
      else if (isOp('%')) (pos++, (v /= 100));
      else return v;
    }
  }
  function atom(): number {
    const tok = peek();
    if (!tok) throw new SyntaxError('unexpected end');
    if (tok.t === 'num') return (pos++, tok.v);
    if (tok.t === 'op' && tok.v === '(') {
      pos++;
      const v = sum();
      expect(')');
      return v;
    }
    if (tok.t === 'id') {
      pos++;
      if (tok.v in CONSTANTS) return CONSTANTS[tok.v];
      const fn = FUNCTIONS[tok.v];
      if (!fn) throw new SyntaxError(`unknown function ${tok.v}`);
      expect('(');
      const v = sum();
      expect(')');
      return fn(v, angle);
    }
    throw new SyntaxError(`unexpected "${tok.v}"`);
  }

  const v = sum();
  if (pos !== tokens.length) throw new SyntaxError(`unexpected "${tokens[pos].v}"`);
  return v;
}

/** The display string: up to 10 significant digits, as the GATE calculator shows, and no −0. */
export function formatResult(v: number): string {
  if (Number.isNaN(v)) return 'Math error';
  if (!Number.isFinite(v)) return v > 0 ? 'Infinity' : '-Infinity';
  if (Object.is(v, -0) || Math.abs(v) < 1e-12) return '0';
  const abs = Math.abs(v);
  if (abs >= 1e10 || abs < 1e-6) return v.toExponential(6).replace(/\.?0+e/, 'e');
  return String(Number(v.toPrecision(10)));
}
