import { Search, Star, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { chapterPath, getChapter, loadFormulas, subjects } from '@/content/catalog';
import type { LocatedFormula } from '@/content/types';
import { FormulaCard, formulasAsLatex } from '@/features/formulas/FormulaCard';
import { useProgress } from '@/features/progress/store';
import { useAsync } from '@/lib/use-async';
import { cn, plural } from '@/lib/utils';
import { Button } from '@/ui/button';
import { CopyTextButton } from '@/ui/copy-text-button';
import { PageHeader } from '@/ui/page-header';
import { EmptyState, Skeleton } from '@/ui/primitives';
import { Select } from '@/ui/select';

const haystack = (f: LocatedFormula) => [f.name, f.text, f.tex, f.note ?? '', ...(f.where ?? []).flat()].join(' ').toLowerCase();

export function FormulasPage() {
  const [params, setParams] = useSearchParams();
  const formulas = useAsync(loadFormulas, 'formulas');
  const starred = useProgress((s) => s.starred);
  const q = params.get('q') ?? '';
  const subject = params.get('subject') ?? 'all';
  const starredOnly = params.get('starred') === '1';
  const set = (key: string, value: string | null) =>
    setParams(
      (p) => {
        if (value) p.set(key, value);
        else p.delete(key);
        return p;
      },
      { replace: true },
    );

  const all = formulas.status === 'ready' ? formulas.data : [];
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = all.filter(
    (f) => (subject === 'all' || f.subject === subject) && (!starredOnly || starred[f.id]) && words.every((w) => haystack(f).includes(w)),
  );
  const starCount = all.filter((f) => starred[f.id]).length;
  const filtered = Boolean(q || subject !== 'all' || starredOnly);

  return (
    <div>
      <PageHeader
        eyebrow="Instant reference"
        title="Formula cards"
        description="Every formula from the ready chapters, each with what its symbols mean and the note that keeps it from being misapplied. Star the ones to revise last; copy any card or a whole filtered set as LaTeX."
        actions={
          shown.length > 0 && (
            <CopyTextButton variant="outline" size="sm" text={formulasAsLatex(starredOnly ? 'Starred formulas' : 'GATE CS formulas', shown)}>
              {`Copy ${filtered ? 'these' : 'all'} as LaTeX`}
            </CopyTextButton>
          )
        }
      />

      <div className="glass mb-6 flex flex-wrap items-center gap-3 p-4" role="search" aria-label="Filter formulas">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search formulas</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <input
            value={q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Filter by name or symbol, e.g. EMAT or hit ratio"
            className="h-9 w-full rounded-[10px] border border-line bg-surface-2/70 pl-9 pr-3 text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent"
          />
        </label>
        <Select
          label="Subject"
          value={subject}
          onChange={(v) => set('subject', v === 'all' ? null : v)}
          options={[['all', 'All subjects'], ...subjects.filter((s) => all.some((f) => f.subject === s.id)).map((s) => [s.id, s.title] as [string, string])]}
        />
        <Button variant={starredOnly ? 'secondary' : 'ghost'} size="sm" aria-pressed={starredOnly} onClick={() => set('starred', starredOnly ? null : '1')}>
          <Star className={cn(starredOnly && 'fill-amber text-amber')} /> Starred {starCount}
        </Button>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            <X /> Clear
          </Button>
        )}
      </div>

      {formulas.status === 'loading' && <Skeleton className="h-96" />}
      {formulas.status === 'error' && <EmptyState title="The formulas failed to load">{formulas.error.message}</EmptyState>}
      {formulas.status === 'ready' && (
        <>
          <p className="mb-4 font-mono text-[12px] text-faint" aria-live="polite">
            {shown.length === all.length ? plural(all.length, 'formula') : `${shown.length} of ${plural(all.length, 'formula')}`}
          </p>
          {shown.length ? (
            <Grouped formulas={shown} />
          ) : starredOnly && !starCount ? (
            <EmptyState title="Nothing starred yet">Star a formula card and it collects here, for the last pass before a mock or the exam.</EmptyState>
          ) : (
            <EmptyState title="No formula matches">Try fewer words, or clear the filters.</EmptyState>
          )}
        </>
      )}
    </div>
  );
}

function Grouped({ formulas }: { formulas: LocatedFormula[] }) {
  return (
    <div className="space-y-10">
      {subjects.map((s) => {
        const inSubject = formulas.filter((f) => f.subject === s.id);
        if (!inSubject.length) return null;
        const byChapter = new Map<string, LocatedFormula[]>();
        for (const f of inSubject) byChapter.set(f.chapter, [...(byChapter.get(f.chapter) ?? []), f]);
        return (
          <section key={s.id} aria-labelledby={`formulas-${s.id}`}>
            <h2 id={`formulas-${s.id}`} className="mb-4 flex items-baseline gap-2 text-lg font-semibold text-ink">
              <span className="font-mono text-[12px] text-accent">{s.code}</span> {s.title}
            </h2>
            <div className="space-y-6">
              {[...byChapter].map(([chapterId, list]) => (
                <div key={chapterId}>
                  <Link to={chapterPath(chapterId, 'formulas')} className="eyebrow mb-3 inline-block hover:text-accent">
                    {getChapter(chapterId)?.title ?? chapterId} · {list.length}
                  </Link>
                  <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                    {list.map((f) => (
                      <FormulaCard key={f.id} formula={f} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
