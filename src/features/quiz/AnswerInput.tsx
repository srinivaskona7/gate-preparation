import { CircleCheck, CircleX } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/utils';
import { MathText } from '@/ui/math';
import { answerKey, type Gradable, keyLabel, optionLetter, parseNat, type Response } from './scoring';

export interface AnswerInputProps {
  question: Gradable;
  response: Response | undefined;
  onChange: (r: Response) => void;
  /** No more changes: the answer was checked or the quiz submitted. */
  locked?: boolean;
  /** Mark options against the key. */
  reveal?: boolean;
  /** The trap text for a wrong option, shown under it once revealed. */
  trapFor?: (option: number) => string | undefined;
}

export function AnswerInput(props: AnswerInputProps) {
  return props.question.type === 'nat' ? <NatInput {...props} /> : <OptionList {...props} />;
}

function OptionList({ question: q, response, onChange, locked, reveal, trapFor }: AnswerInputProps) {
  const name = useId();
  if (q.type === 'nat') return null;
  const key = answerKey(q);
  const multi = q.type === 'msq';
  const chosen = (i: number) =>
    response?.type === 'mcq' ? response.choice === i : response?.type === 'msq' ? response.choices.includes(i) : false;
  const isKey = (i: number) => (key.kind === 'mcq' ? key.accepted.includes(i) : key.kind === 'msq' ? key.sets.some((set) => set.includes(i)) : false);

  const pick = (i: number) => {
    if (locked) return;
    if (!multi) return onChange({ type: 'mcq', choice: i });
    const current = response?.type === 'msq' ? response.choices : [];
    const next = current.includes(i) ? current.filter((c) => c !== i) : [...current, i].sort((a, b) => a - b);
    onChange({ type: 'msq', choices: next });
  };

  return (
    <fieldset className="space-y-2.5">
      <legend className="eyebrow mb-2">{multi ? 'Select every correct option' : 'Select one option'}</legend>
      {q.options.map((opt, i) => {
        const selected = chosen(i);
        const right = reveal && isKey(i);
        const wrong = reveal && selected && !isKey(i);
        const trap = reveal && !isKey(i) ? trapFor?.(i) : undefined;
        return (
          <label
            key={i}
            className={cn(
              'flex gap-3 rounded-[12px] border px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
              locked ? 'cursor-default' : 'cursor-pointer hover:border-line-strong',
              right ? 'border-emerald/55 bg-emerald/[0.08]' : wrong ? 'border-coral/55 bg-coral/[0.08]' : selected ? 'border-accent/60 bg-accent/[0.08]' : 'border-line bg-surface-2/50',
            )}
          >
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={name}
              className="sr-only"
              checked={selected}
              disabled={locked}
              onChange={() => pick(i)}
            />
            <span
              aria-hidden
              className={cn(
                'grid size-7 shrink-0 place-items-center border font-mono text-[12px] font-semibold',
                multi ? 'rounded-md' : 'rounded-full',
                selected ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong text-muted',
              )}
            >
              {optionLetter(i)}
            </span>
            <span className="min-w-0 flex-1 pt-0.5 text-[14.5px] leading-relaxed text-ink">
              <MathText text={opt} />
              {trap && (
                <span className="mt-1.5 block text-[12.5px] leading-relaxed text-coral">
                  <MathText text={trap} />
                </span>
              )}
            </span>
            {right && <CircleCheck className="mt-1 size-4 shrink-0 text-emerald" aria-label="Correct option" />}
            {wrong && <CircleX className="mt-1 size-4 shrink-0 text-coral" aria-label="Your wrong choice" />}
          </label>
        );
      })}
    </fieldset>
  );
}

function NatInput({ question: q, response, onChange, locked, reveal }: AnswerInputProps) {
  const id = useId();
  const value = response?.type === 'nat' ? response.value : '';
  const invalid = value.trim() !== '' && parseNat(value) === null;
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block">
        Numerical answer
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          disabled={locked}
          onChange={(e) => onChange({ type: 'nat', value: e.target.value })}
          aria-invalid={invalid}
          aria-describedby={`${id}-hint`}
          placeholder="e.g. 4.5"
          className={cn(
            'h-11 w-48 rounded-[10px] border bg-surface-2 px-3 font-mono text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent disabled:opacity-80',
            invalid ? 'border-coral' : 'border-line-strong/70',
          )}
        />
        {reveal && (
          <span className="font-mono text-[13px] text-emerald">Accepted: {keyLabel(answerKey(q))}</span>
        )}
      </div>
      <p id={`${id}-hint`} className={cn('mt-1.5 text-[12px]', invalid ? 'text-coral' : 'text-faint')}>
        {invalid ? 'Type a plain number such as 12, -3 or 0.25: the exam keypad accepts nothing else.' : 'As on the exam keypad: digits, one decimal point and an optional sign.'}
      </p>
    </div>
  );
}
