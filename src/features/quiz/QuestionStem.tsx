import { ImageOff } from 'lucide-react';
import type { Pyq } from '@/content/types';
import { PyqDiagram } from '@/features/pyq/PyqDiagram';
import { CopyButton } from '@/ui/copy-button';
import { MathText } from '@/ui/math';

type StemParts = Pick<Pyq, 'stem'> & Partial<Pick<Pyq, 'id' | 'code' | 'table' | 'figure' | 'diagram'>>;

/** Paragraphs split on blank lines; single line breaks inside a paragraph are kept. */
function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          <MathText text={p} />
        </p>
      ))}
    </>
  );
}

export function QuestionStem({ id, stem, code, table, figure, diagram }: StemParts) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-ink">
      <Paragraphs text={stem} />
      {code && (
        <figure className="overflow-hidden rounded-[12px] border border-line bg-surface-2">
          <figcaption className="flex items-center justify-between border-b border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
            {code.lang}
            <CopyButton text={code.text} label="Copy the code" className="size-7" />
          </figcaption>
          <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-[1.6] text-ink">
            <code>{code.text}</code>
          </pre>
        </figure>
      )}
      {table && (
        <div className="overflow-x-auto rounded-[12px] border border-line">
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-surface-2 font-mono text-[12px] text-muted">
              <tr>
                {table.headers.map((h, i) => (
                  <th key={i} className="border-b border-line px-3 py-2 font-medium">
                    <MathText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {table.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="px-3 py-2 font-mono text-[13px]">
                      <MathText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {id && diagram && <PyqDiagram id={id} part="stem" diagram={diagram} caption="The paper's figure" />}
      {figure && !diagram && (
        <figure className="rounded-[12px] border border-dashed border-line-strong bg-surface-2/60 px-4 py-3">
          <figcaption className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
            <ImageOff className="size-3.5" aria-hidden /> The paper's figure, described
          </figcaption>
          <div className="text-[14px] leading-relaxed text-ink/90">
            <Paragraphs text={figure} />
          </div>
        </figure>
      )}
    </div>
  );
}
