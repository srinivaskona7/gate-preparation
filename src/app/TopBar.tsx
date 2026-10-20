import { CalendarClock, Menu, Moon, Search, Sun } from 'lucide-react';
import { NavLink } from 'react-router';
import { catalog } from '@/content/catalog';
import { usePrefs } from '@/features/progress/store';
import { cn, daysUntil, formatDate, plural } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Kbd } from '@/ui/primitives';
import { useUi } from './nav';

const QUICK_LINKS = [
  { to: '/syllabus', label: 'Syllabus map' },
  { to: '/revision', label: 'Daily revision' },
  { to: '/pyqs', label: 'Question bank' },
];

export function ExamCountdown({ className }: { className?: string }) {
  const first = catalog.exam.dates.exam[0];
  const days = daysUntil(first);
  const label = days > 0 ? `${plural(days, 'day')} to GATE` : days === 0 ? 'GATE starts today' : 'GATE 2027 under way';
  return (
    <p
      className={cn('flex items-center gap-2 rounded-full border border-accent/35 bg-accent/[0.07] px-3 py-1.5 font-mono text-[11.5px] text-accent', className)}
      title={`Exam sessions: ${catalog.exam.dates.exam.map((d) => formatDate(d, { day: 'numeric', month: 'short' })).join(', ')}. ${catalog.exam.dates.note}`}
    >
      <CalendarClock className="size-3.5" aria-hidden />
      <span>{label}</span>
      <span className="hidden text-accent/70 sm:inline">· {formatDate(first)}</span>
    </p>
  );
}

export function TopBar() {
  const { theme, toggleTheme } = usePrefs();
  const { setPalette, setNav } = useUi();
  return (
    <header data-print="hide" className="glass-strong sticky top-0 z-30 flex h-16 items-center gap-3 border-x-0 border-t-0 px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setNav(true)}>
        <Menu />
      </Button>
      <button
        type="button"
        onClick={() => setPalette(true)}
        className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-[10px] border border-line bg-surface-2/70 px-3 text-left text-[13px] text-faint transition-colors hover:border-line-strong hover:text-muted md:max-w-md"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="truncate">Search topics, formulas, PYQs, derivations…</span>
        <Kbd className="ml-auto hidden sm:inline">⌘K</Kbd>
      </button>
      <nav aria-label="Quick links" className="hidden items-center gap-1 xl:flex">
        {QUICK_LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              cn('rounded-lg px-3 py-2 text-[13px] font-medium transition-colors', isActive ? 'text-accent' : 'text-muted hover:text-ink')
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <ExamCountdown className="ml-auto hidden md:flex" />
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
        {theme === 'dark' ? <Sun /> : <Moon />}
      </Button>
    </header>
  );
}
