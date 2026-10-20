import type MiniSearch from 'minisearch';
import {
  BadgeCheck,
  BookOpen,
  CircleHelp,
  CornerDownLeft,
  FileText,
  Lightbulb,
  ListOrdered,
  LoaderCircle,
  type LucideIcon,
  Pi,
  Search,
  SquareFunction,
} from 'lucide-react';
import { Dialog } from 'radix-ui';
import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { getChapter, subjectPath, subjects } from '@/content/catalog';
import type { SearchDoc, SearchKind } from '@/content/types';
import { type Hit, hitPath, KIND_LABEL, KIND_ORDER, search, searchIndex } from '@/features/search/search-index';
import { cn } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { MathText } from '@/ui/math';
import { Kbd } from '@/ui/primitives';
import { PRIMARY_NAV, SUBJECT_ICON } from './nav';

const KIND_ICON: Record<SearchKind, LucideIcon> = {
  chapter: BookOpen,
  topic: Lightbulb,
  formula: SquareFunction,
  derivation: Pi,
  problem: ListOrdered,
  pyq: BadgeCheck,
  question: CircleHelp,
  syllabus: FileText,
};

interface Item {
  key: string;
  title: string;
  hint?: string;
  badge?: string;
  to: string;
  icon: LucideIcon;
}

interface Group {
  label: string;
  items: Item[];
}

const JUMP_TO: Group[] = [
  { label: 'Go to', items: PRIMARY_NAV.map((n) => ({ key: `nav:${n.to}`, title: n.label, to: n.to, icon: n.icon })) },
  {
    label: 'Subjects',
    items: subjects.map((s) => ({
      key: `subject:${s.id}`,
      title: s.title,
      hint: `${s.stats.ready} of ${s.stats.chapters} chapters ready`,
      badge: s.code,
      to: subjectPath(s.id),
      icon: SUBJECT_ICON[s.code] ?? BookOpen,
    })),
  },
];

function toItem(hit: Hit): Item {
  const chapter = getChapter(hit.chapter);
  const where = hit.kind === 'chapter' ? chapter?.subject.title : chapter?.title;
  return {
    key: hit.id,
    title: hit.title,
    hint: [hit.label, where].filter(Boolean).join(' · '),
    badge: hit.qtype ? `${hit.qtype.toUpperCase()} · ${hit.marks}M` : undefined,
    to: hitPath(hit),
    icon: KIND_ICON[hit.kind],
  };
}

/** Groups follow the best hit inside each, so the strongest match always leads. */
function groupHits(hits: Hit[]): Group[] {
  const groups = new Map<SearchKind, Hit[]>();
  for (const h of hits) {
    const g = groups.get(h.kind);
    if (g) g.push(h);
    else groups.set(h.kind, [h]);
  }
  return [...groups.entries()].map(([kind, list]) => ({ label: KIND_LABEL[kind], items: list.map(toItem) }));
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState<MiniSearch<SearchDoc> | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [kinds, setKinds] = useState<ReadonlySet<SearchKind>>(new Set());
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (open && !index) searchIndex().then(setIndex, () => setFailed(true));
  }, [open, index]);

  const q = query.trim();
  const groups = useMemo(() => (q && index ? groupHits(search(index, q, kinds)) : q ? [] : JUMP_TO), [q, index, kinds]);
  const items = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const optionId = (i: number) => `${listId}-${i}`;

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [listId, active, items]);

  const close = () => {
    onOpenChange(false);
    setQuery('');
    setKinds(new Set());
    setActive(0);
  };

  const go = (item: Item | undefined) => {
    if (!item) return;
    close();
    navigate(item.to);
  };

  const toggleKind = (k: SearchKind) => {
    const next = new Set(kinds);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setKinds(next);
    setActive(0);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((a) => (a + step + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(items[active]);
    }
  };

  let n = -1;
  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-40 bg-canvas/70 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            input.current?.focus();
          }}
          className="palette-panel glass-strong fixed left-1/2 top-[9vh] z-50 flex max-h-[78vh] w-[min(700px,calc(100vw-1.5rem))] -translate-x-1/2 flex-col overflow-hidden rounded-[16px] outline-none"
        >
          <Dialog.Title className="sr-only">Search GATE Atlas</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search className="size-4 shrink-0 text-faint" aria-hidden />
            <input
              ref={input}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search topics, formulas, derivations, PYQs…"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={items.length ? optionId(active) : undefined}
              className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
            />
            {q && !index && !failed && <LoaderCircle className="size-4 animate-spin text-faint" aria-label="Loading the search index" />}
            <Kbd>Esc</Kbd>
          </div>
          <div role="group" aria-label="Search only in" className="flex gap-1.5 overflow-x-auto border-b border-line px-4 py-2.5">
            {KIND_ORDER.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kinds.has(k)}
                onClick={() => toggleKind(k)}
                className={cn(
                  'shrink-0 rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors',
                  kinds.has(k) ? 'border-accent/50 bg-accent/12 text-accent' : 'border-line text-muted hover:text-ink',
                )}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
          <div id={listId} role="listbox" aria-label="Results" className="min-h-0 flex-1 overflow-y-auto p-2">
            {failed && <p className="px-3 py-8 text-center text-sm text-coral">The search index failed to load. Reload the page to try again.</p>}
            {q && index && !items.length && (
              <p className="px-3 py-8 text-center text-sm text-muted">
                Nothing matches “{q}”{kinds.size ? ' in the selected kinds' : ''}.
              </p>
            )}
            {groups.map((g) => (
              <div key={g.label} role="group" aria-label={g.label} className="mb-1">
                <p aria-hidden className="eyebrow px-3 pb-1 pt-2">
                  {g.label}
                </p>
                {g.items.map((item) => {
                  const i = ++n;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      id={optionId(i)}
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => i !== active && setActive(i)}
                      onClick={() => go(item)}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5',
                        i === active ? 'bg-accent/10 text-ink shadow-[inset_2px_0_0_var(--accent)]' : 'text-muted',
                      )}
                    >
                      <Icon className={cn('size-4 shrink-0', i === active ? 'text-accent' : 'text-faint')} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <MathText text={item.title} className="line-clamp-2 text-[13.5px] text-ink" />
                        {item.hint && <span className="mt-0.5 block truncate text-[11.5px] text-faint">{item.hint}</span>}
                      </span>
                      {item.badge && <Badge>{item.badge}</Badge>}
                      {i === active && <CornerDownLeft className="size-3.5 shrink-0 text-accent" aria-hidden />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <footer className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11.5px] text-faint">
            <span>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
            </span>
            <span>
              <Kbd>Enter</Kbd> open
            </span>
            <span className="ml-auto hidden sm:inline">Solutions are never searched, so a PYQ result does not give its answer away.</span>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
