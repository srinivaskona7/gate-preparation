import { Star } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router';
import { chapterPath, getChapter } from '@/content/catalog';
import type { Formula } from '@/content/types';
import { useProgress } from '@/features/progress/store';
import { cn } from '@/lib/utils';
import { OriginBadge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { CopyButton } from '@/ui/copy-button';
import { MathText, Tex } from '@/ui/math';

/** Content writes symbols as plain text with `x_i`-style subscripts; show those as real subscripts. */
function SymbolText({ text }: { text: string }) {
  const parts = text.split(/_(\{[^}]*\}|[\p{L}\p{N}]+)/u);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <sub key={i}>{p.replace(/^\{|\}$/g, '')}</sub> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

export function StarButton({ id, name }: { id: string; name: string }) {
  const starred = useProgress((s) => Boolean(s.starred[id]));
  const toggle = useProgress((s) => s.toggleStar);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      aria-pressed={starred}
      aria-label={starred ? `Unstar ${name}` : `Star ${name}`}
      title={starred ? 'Starred' : 'Star for quick revision'}
      onClick={() => toggle(id)}
    >
      <Star className={cn(starred && 'fill-amber text-amber')} />
    </Button>
  );
}

export function FormulaCard({ formula: f, showChapter = false }: { formula: Formula & { chapter?: string }; showChapter?: boolean }) {
  const chapter = showChapter && f.chapter ? getChapter(f.chapter) : undefined;
  return (
    <article id={f.id} className="glass flex scroll-mt-36 flex-col p-5" aria-labelledby={`${f.id}-name`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`${f.id}-name`} className="text-[14.5px] font-semibold leading-snug text-ink">
            {f.name}
          </h3>
          {chapter && (
            <Link to={chapterPath(chapter.id, 'formulas', f.id)} className="font-mono text-[11px] text-faint hover:text-accent">
              {chapter.subject.code} · {chapter.title}
            </Link>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <OriginBadge origin={f.origin} pages={f.pages} />
          <CopyButton text={f.tex} label={`Copy the LaTeX for ${f.name}`} />
          <StarButton id={f.id} name={f.name} />
        </div>
      </header>
      <Tex tex={f.tex} className="mt-3 text-[16px] text-accent" />
      {f.where && f.where.length > 0 && (
        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-line pt-3 text-[12px]">
          {f.where.map(([sym, desc]) => (
            <Fragment key={sym}>
              <dt className="font-mono text-ink">
                <SymbolText text={sym} />
              </dt>
              <dd className="text-muted">
                <MathText text={desc} />
              </dd>
            </Fragment>
          ))}
        </dl>
      )}
      {f.note && <MathText text={f.note} className="mt-3 block text-[12.5px] leading-relaxed text-muted" />}
    </article>
  );
}

/** A LaTeX block of every formula, for pasting into notes. */
export const formulasAsLatex = (title: string, formulas: Formula[]) =>
  [`% ${title}`, ...formulas.map((f) => `% ${f.name}\n\\[ ${f.tex} \\]`)].join('\n\n');
