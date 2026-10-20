import { ChevronDown, Command, Layers } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useMatch } from 'react-router';
import { chapterPath, getChapter, subjectPath, subjects } from '@/content/catalog';
import type { Subject } from '@/content/types';
import { masteryPercent } from '@/features/progress/metrics';
import { useProgress } from '@/features/progress/store';
import { cn } from '@/lib/utils';
import { Kbd } from '@/ui/primitives';
import { PRIMARY_NAV, SUBJECT_ICON, useUi } from './nav';

function useActiveSubject() {
  const chapterMatch = useMatch('/chapter/:chapterId/*');
  const subjectMatch = useMatch('/subject/:subjectId');
  const chapter = getChapter(chapterMatch?.params.chapterId);
  return { subjectId: chapter?.subject.id ?? subjectMatch?.params.subjectId, chapterId: chapter?.id };
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { subjectId, chapterId } = useActiveSubject();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(subjectId ? [subjectId] : []));
  const [lastActive, setLastActive] = useState(subjectId);
  // Opening a chapter from anywhere (search, a link) unfolds its subject.
  if (subjectId !== lastActive) {
    setLastActive(subjectId);
    if (subjectId && !expanded.has(subjectId)) setExpanded(new Set(expanded).add(subjectId));
  }
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const openPalette = useUi((s) => s.setPalette);

  return (
    <nav aria-label="Site" className="flex h-full flex-col">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3 px-5 pb-4 pt-5">
        <span className="grid size-10 place-items-center rounded-xl border border-accent/40 bg-accent/10 shadow-[0_0_24px_-8px_var(--accent)]">
          <span className="size-3 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-display text-[17px] font-bold text-accent">
            GATE Atlas
            <span className="rounded-md border border-accent/40 px-1.5 py-0.5 font-mono text-[10px] font-medium text-accent">2027</span>
          </span>
          <span className="block font-mono text-[11px] text-muted">CS 2027 aspirant portal</span>
        </span>
      </Link>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-0.5">
          {PRIMARY_NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13.5px] font-medium transition-colors',
                    isActive ? 'bg-accent/10 text-accent shadow-[inset_2px_0_0_var(--accent)]' : 'text-muted hover:bg-surface-3/50 hover:text-ink',
                  )
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="eyebrow mb-2 mt-6 px-3">Syllabus architecture</p>
        <ul className="space-y-0.5">
          {subjects.map((s) => (
            <SubjectEntry
              key={s.id}
              subject={s}
              open={expanded.has(s.id)}
              active={s.id === subjectId}
              activeChapter={chapterId}
              onToggle={() => toggle(s.id)}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>

      <div className="border-t border-line p-3">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            openPalette(true);
          }}
          className="flex w-full items-center gap-3 rounded-[10px] border border-line bg-surface-2/60 px-3 py-2.5 text-[13px] text-muted transition-colors hover:text-ink"
        >
          <Command className="size-4" aria-hidden />
          Command palette
          <Kbd className="ml-auto">⌘K</Kbd>
        </button>
      </div>
    </nav>
  );
}

function SubjectEntry({
  subject,
  open,
  active,
  activeChapter,
  onToggle,
  onNavigate,
}: {
  subject: Subject;
  open: boolean;
  active: boolean;
  activeChapter?: string;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const mastery = useProgress((s) => s.mastery);
  const Icon = SUBJECT_ICON[subject.code] ?? Layers;
  const listId = `nav-${subject.id}`;
  return (
    <li className={cn('rounded-[12px]', open && 'border border-line bg-surface-2/40')}>
      <div className="flex items-center">
        <NavLink
          to={subjectPath(subject.id)}
          onClick={onNavigate}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-3 rounded-[10px] px-3 py-2 text-[13.5px] transition-colors',
            active ? 'font-semibold text-accent' : 'text-muted hover:text-ink',
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{subject.title}</span>
          <span className="ml-auto font-mono text-[10.5px] text-faint">{subject.code}</span>
        </NavLink>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`${open ? 'Hide' : 'Show'} ${subject.title} chapters`}
          className="mr-1 grid size-7 shrink-0 place-items-center rounded-md text-faint hover:bg-surface-3/60 hover:text-ink"
        >
          <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <ul id={listId} className="space-y-px px-2 pb-2">
          {subject.chapters.map((c) => {
            const ready = c.status === 'ready';
            const pct = masteryPercent(c.topicIndex, mastery);
            return (
              <li key={c.id}>
                <NavLink
                  to={chapterPath(c.id)}
                  onClick={onNavigate}
                  aria-current={c.id === activeChapter ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] transition-colors',
                    c.id === activeChapter ? 'bg-accent/10 text-accent' : ready ? 'text-muted hover:text-ink' : 'text-faint hover:text-muted',
                  )}
                >
                  <span className="truncate">{c.title}</span>
                  <span className={cn('ml-auto font-mono text-[10.5px]', ready ? (pct ? 'text-accent' : 'text-faint') : 'text-faint/70')}>
                    {ready ? `${pct}%` : 'soon'}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
