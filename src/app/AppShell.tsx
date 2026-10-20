import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useNavigation } from 'react-router';
import { usePrefs } from '@/features/progress/store';
import { Drawer } from '@/ui/drawer';
import { CommandPalette } from './CommandPalette';
import { useUi } from './nav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

export function AppShell() {
  const theme = usePrefs((s) => s.theme);
  const { navOpen, setNav, paletteOpen, setPalette } = useUi();
  const busy = useNavigation().state !== 'idle';
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette(!useUi.getState().paletteOpen);
      } else if (e.key === '/' && !e.metaKey && !e.ctrlKey && !isTyping(e.target)) {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPalette]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[288px_minmax(0,1fr)]">
      {/* An #anchor would be read as a route under hash routing, so the skip link moves focus itself. */}
      <button
        type="button"
        onClick={() => main.current?.focus()}
        className="sr-only z-[60] rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </button>
      <div
        aria-hidden
        className={`fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-accent transition-transform duration-500 ${busy ? 'scale-x-75' : 'scale-x-0'}`}
      />
      <aside data-print="hide" className="glass-strong sticky top-0 hidden h-dvh rounded-none border-y-0 border-l-0 lg:block">
        <Sidebar />
      </aside>
      <Drawer open={navOpen} onOpenChange={setNav} side="left" title={<span className="sr-only">Site navigation</span>} className="lg:hidden">
        <Sidebar onNavigate={() => setNav(false)} />
      </Drawer>
      <div className="min-w-0">
        <TopBar />
        <main ref={main} tabIndex={-1} className="mx-auto w-full max-w-[1320px] px-4 pb-20 pt-6 outline-none sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPalette} />
      <ScrollRestoration />
    </div>
  );
}
