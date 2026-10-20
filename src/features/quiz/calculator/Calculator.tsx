import { Calculator as CalcIcon, X } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { type AngleMode, evaluate, formatResult } from './evaluate';

/** A key either appends text to the expression or runs a command on the calculator state. */
type Key = { label: string; insert: string; title?: string } | { label: string; run: Command; title?: string };
type Command = 'clear' | 'back' | 'equals' | 'negate' | 'mc' | 'mr' | 'ms' | 'mplus' | 'mminus';

const ins = (label: string, insert = label, title?: string): Key => ({ label, insert, title });
const cmd = (label: string, run: Command, title?: string): Key => ({ label, run, title });

// Laid out after the GATE virtual calculator, five keys a row.
const ROWS: Key[][] = [
  [cmd('MC', 'mc', 'Clear memory'), cmd('MR', 'mr', 'Recall memory'), cmd('MS', 'ms', 'Store in memory'), cmd('M+', 'mplus', 'Add to memory'), cmd('M−', 'mminus', 'Subtract from memory')],
  [ins('sin', 'sin('), ins('cos', 'cos('), ins('tan', 'tan('), ins('log', 'log(', 'Log base 10'), ins('ln', 'ln(', 'Natural log')],
  [ins('sin⁻¹', 'asin('), ins('cos⁻¹', 'acos('), ins('tan⁻¹', 'atan('), ins('log₂', 'log2(', 'Log base 2'), ins('eˣ', 'exp(')],
  [ins('sinh', 'sinh('), ins('cosh', 'cosh('), ins('tanh', 'tanh('), ins('10ˣ', '10^('), ins('n!', '!', 'Factorial')],
  [ins('x²', '^2'), ins('x³', '^3'), ins('xʸ', '^'), ins('√', 'sqrt('), ins('∛', 'cbrt(')],
  [ins('('), ins(')'), ins('π', 'pi'), ins('e'), ins('mod', ' mod ')],
  [ins('7'), ins('8'), ins('9'), ins('÷'), cmd('←', 'back', 'Backspace')],
  [ins('4'), ins('5'), ins('6'), ins('×'), cmd('C', 'clear', 'Clear')],
  [ins('1'), ins('2'), ins('3'), ins('−'), ins('1/x', '^-1', 'Reciprocal')],
  [ins('0'), ins('.'), cmd('±', 'negate', 'Change sign'), ins('+'), cmd('=', 'equals')],
];

export function Calculator({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('0');
  const [angle, setAngle] = useState<AngleMode>('deg');
  const [memory, setMemory] = useState(0);

  const value = () => {
    try {
      return evaluate(expr || result, angle);
    } catch {
      return Number.NaN;
    }
  };
  const equals = () => {
    if (!expr.trim()) return;
    try {
      setResult(formatResult(evaluate(expr, angle)));
    } catch {
      setResult('Syntax error');
    }
  };
  const run = (c: Command) => {
    const v = value();
    if (c === 'clear') return (setExpr(''), setResult('0'));
    if (c === 'back') return setExpr((e) => e.slice(0, -1));
    if (c === 'equals') return equals();
    if (c === 'negate') return setExpr((e) => (e ? `-(${e})` : e));
    if (c === 'mc') return setMemory(0);
    if (c === 'mr') return setExpr((e) => e + formatResult(memory).replace('e', 'E'));
    if (Number.isFinite(v)) setMemory((m) => (c === 'ms' ? v : c === 'mplus' ? m + v : m - v));
  };
  const press = (k: Key) => ('insert' in k ? setExpr((e) => e + k.insert) : run(k.run));
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      equals();
    } else if (e.key === 'Escape') onClose();
  };

  return (
    <section
      aria-label="Virtual calculator"
      className="glass-strong fixed bottom-4 right-4 z-50 w-[min(360px,calc(100vw-2rem))] space-y-3 p-3 shadow-2xl"
    >
      <header className="flex items-center gap-2">
        <CalcIcon className="size-4 text-accent" aria-hidden />
        <h2 className="text-[13px] font-semibold text-ink">Calculator</h2>
        <div role="radiogroup" aria-label="Angle unit" className="ml-auto flex rounded-md border border-line p-0.5 text-[11px]">
          {(['deg', 'rad'] as const).map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={angle === a}
              onClick={() => setAngle(a)}
              className={cn('rounded px-2 py-0.5 font-mono uppercase', angle === a ? 'bg-surface-3 text-ink' : 'text-muted')}
            >
              {a}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="icon" className="size-7" aria-label="Close calculator" onClick={onClose}>
          <X />
        </Button>
      </header>
      <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
        <input
          aria-label="Expression"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-transparent text-right font-mono text-[13px] text-muted outline-none"
        />
        <output aria-live="polite" aria-label="Result" className="block truncate text-right font-mono text-xl font-semibold text-ink">
          {result}
        </output>
        {memory !== 0 && <span className="font-mono text-[10px] text-faint">M = {formatResult(memory)}</span>}
      </div>
      <div className="grid grid-cols-5 gap-1">
        {ROWS.flat().map((k) => (
          <button
            key={k.label}
            type="button"
            title={k.title}
            aria-label={k.title ?? k.label}
            onClick={() => press(k)}
            className={cn(
              'h-8 rounded-md border border-line font-mono text-[12px] transition-colors hover:border-accent/60 hover:text-ink',
              'run' in k && k.run === 'equals' ? 'bg-accent text-accent-ink' : /^[\d.]$/.test(k.label) ? 'bg-surface-3 text-ink' : 'bg-surface-2 text-muted',
            )}
          >
            {k.label}
          </button>
        ))}
      </div>
    </section>
  );
}

/** The exam screen's calculator toggle; GATE gives one on screen and no physical calculator. */
export function CalculatorToggle() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" aria-pressed={open} onClick={() => setOpen((o) => !o)}>
        <CalcIcon /> Calculator
      </Button>
      {open && <Calculator onClose={() => setOpen(false)} />}
    </>
  );
}
