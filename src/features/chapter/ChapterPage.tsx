import {
  BadgeCheck,
  GraduationCap,
  ListOrdered,
  type LucideIcon,
  Pi,
  ScrollText,
  Shapes,
  SquareFunction,
  Timer,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router';
import { catalog, type ChapterEntry, chapterPath, getChapter, loadChapter, subjectPath } from '@/content/catalog';
import type { ChapterBody, SyllabusItem } from '@/content/types';
import { NotFound } from '@/app/RouteStates';
import { masteryCounts, masteryPercent } from '@/features/progress/metrics';
import { useProgress } from '@/features/progress/store';
import { SyllabusStatusBadge, type SyllabusStatus } from '@/features/syllabus/status';
import { visualsFor } from '@/features/visuals/registry';
import { useAsync } from '@/lib/use-async';
import { cn, plural } from '@/lib/utils';
import { Badge, FrequencyBadge } from '@/ui/badge';
import { MathText } from '@/ui/math';
import { DocTitle } from '@/ui/page-header';
import { EmptyState, ProgressRing, Skeleton } from '@/ui/primitives';
import { CheatSheetTab } from './CheatSheetTab';
import { DerivationsTab } from './DerivationsTab';
import { FormulasTab } from './FormulasTab';
import { LearnTab } from './LearnTab';
import { PendingChapter } from './PendingChapter';
import { PracticeTab } from './PracticeTab';
import { ProblemsTab } from './ProblemsTab';
import { PyqsTab } from './PyqsTab';
import { VisualsTab } from './VisualsTab';

export const CHAPTER_TABS = ['learn', 'formulas', 'problems', 'derivations', 'pyqs', 'practice', 'cheatsheet', 'visuals'] as const;
export type ChapterTab = (typeof CHAPTER_TABS)[number];

const isTab = (t: string | undefined): t is ChapterTab => CHAPTER_TABS.includes(t as ChapterTab);

interface TabSpec {
  id: ChapterTab;
  label: string;
  icon: LucideIcon;
  count?: number;
}

function tabsFor(c: ChapterEntry): TabSpec[] {
  const s = c.stats;
  return [
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'formulas', label: 'Formulas', icon: SquareFunction, count: s?.formulas },
    { id: 'problems', label: 'Problem types', icon: ListOrdered, count: s?.problemTypes },
    { id: 'derivations', label: 'Derivations', icon: Pi, count: c.memory.derivations },
    { id: 'pyqs', label: 'PYQ solver', icon: BadgeCheck, count: c.memory.pyqs },
    { id: 'practice', label: 'Practice', icon: Timer, count: s?.questions },
    { id: 'cheatsheet', label: 'Cheat sheet', icon: ScrollText },
    { id: 'visuals', label: 'Visuals', icon: Shapes, count: visualsFor(c.id).length },
  ];
}

/** The weakest status among the chapter's syllabus items: one gap makes the chapter partial. */
export function chapterCoverage(items: SyllabusItem[]): SyllabusStatus {
  if (!items.length || items.some((i) => i.status === 'pending')) return 'pending';
  if (items.every((i) => i.status === 'covered')) return 'covered';
  if (items.every((i) => i.status === 'curated')) return 'curated';
  return 'partial';
}

export function ChapterPage() {
  const { chapterId, tab, item } = useParams();
  const chapter = getChapter(chapterId);
  if (!chapter) return <NotFound />;
  if (tab !== undefined && !isTab(tab)) return <Navigate replace to={chapterPath(chapter.id)} />;
  return <Chapter key={chapter.id} chapter={chapter} tab={tab ?? 'learn'} item={item} />;
}

function Chapter({ chapter, tab, item }: { chapter: ChapterEntry; tab: ChapterTab; item?: string }) {
  const syllabus = catalog.syllabus.items.filter((i) => i.chapter === chapter.id);
  const tabs = tabsFor(chapter);
  const label = tabs.find((t) => t.id === tab)?.label ?? 'Learn';
  // A question sends the learner here with ?from=<its path>; only an in-app hash path is honoured.
  const from = useSearchParams()[0].get('from');
  const back = from?.startsWith('/') && !from.startsWith('//') ? from : undefined;
  return (
    <div>
      {back && (
        <Link to={back} className="mb-4 inline-flex items-center gap-2 rounded-[10px] border border-line bg-surface-2/60 px-3 py-1.5 text-[13px] font-medium text-accent hover:bg-surface-3/60">
          ← Back to your question (your answer and hints are kept)
        </Link>
      )}
      <DocTitle>{tab === 'learn' ? chapter.title : `${label} · ${chapter.title}`}</DocTitle>
      <ChapterHeader chapter={chapter} coverage={chapterCoverage(syllabus)} />
      {chapter.status === 'pending' ? (
        <PendingChapter chapter={chapter} syllabus={syllabus} />
      ) : (
        <>
          <nav aria-label="Chapter sections" data-print="hide" className="glass sticky top-[72px] z-20 mb-6 flex gap-1 overflow-x-auto p-1.5">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.id}
                  to={chapterPath(chapter.id, t.id === 'learn' ? undefined : t.id)}
                  preventScrollReset
                  aria-current={t.id === tab ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-[10px] px-3.5 py-2 text-[13px] font-medium transition-colors',
                    t.id === tab ? 'bg-accent text-accent-ink' : 'text-muted hover:bg-surface-3/60 hover:text-ink',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-px font-mono text-[10.5px]',
                        t.id === tab ? 'bg-accent-ink/15 text-accent-ink' : 'bg-surface-3 text-muted',
                      )}
                    >
                      {t.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <ChapterBodyView chapter={chapter} tab={tab} item={item} />
        </>
      )}
    </div>
  );
}

function ChapterBodyView({ chapter, tab, item }: { chapter: ChapterEntry; tab: ChapterTab; item?: string }) {
  const body = useAsync(() => loadChapter(chapter.id), chapter.id);
  if (body.status === 'loading') return <TabSkeleton />;
  if (body.status === 'error') return <EmptyState title="This chapter failed to load">{body.error.message}</EmptyState>;
  return <TabContent chapter={chapter} body={body.data} tab={tab} item={item} />;
}

function TabContent({ chapter, body, tab, item }: { chapter: ChapterEntry; body: ChapterBody; tab: ChapterTab; item?: string }) {
  const props = { chapter, body, item };
  const views: Record<ChapterTab, ReactNode> = {
    learn: <LearnTab {...props} />,
    formulas: <FormulasTab {...props} />,
    problems: <ProblemsTab {...props} />,
    derivations: <DerivationsTab {...props} />,
    pyqs: <PyqsTab {...props} />,
    practice: <PracticeTab {...props} />,
    cheatsheet: <CheatSheetTab {...props} />,
    visuals: <VisualsTab {...props} />,
  };
  return views[tab];
}

function TabSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading the chapter">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-56" />
      ))}
    </div>
  );
}

function ChapterHeader({ chapter: c, coverage }: { chapter: ChapterEntry; coverage: SyllabusStatus }) {
  const mastery = useProgress((s) => s.mastery);
  const counted = c.topicIndex.filter((t) => !t.beyondSyllabus);
  const counts = masteryCounts(c.topicIndex, mastery);
  const value = masteryPercent(c.topicIndex, mastery);
  const remaining = counted.length - counts.mastered;
  return (
    <header className="glass relative mb-6 grid gap-6 overflow-hidden p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="mb-2 font-mono text-[12.5px] text-muted">
          <Link to={subjectPath(c.subject.id)} className="hover:text-accent">
            {c.subject.title}
          </Link>
          <span className="mx-2 text-faint" aria-hidden>
            /
          </span>
          <span className="text-accent">{c.ref}</span>
        </nav>
        <h1 className="text-[28px] font-bold leading-tight text-ink sm:text-[34px]">{c.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FrequencyBadge frequency={c.frequency} />
          <Badge tone="neutral">{c.weight}</Badge>
          <span className="inline-flex items-center gap-1.5">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-faint">2027 syllabus</span>
            <SyllabusStatusBadge status={coverage} />
          </span>
          {c.memory.pyqs > 0 && <Badge tone="violet">{plural(c.memory.pyqs, 'solved PYQ')}</Badge>}
        </div>
        {c.summary && <MathText text={c.summary} className="mt-4 block max-w-3xl text-[14.5px] leading-relaxed text-muted" />}
      </div>
      {c.status === 'ready' && (
        <div className="flex items-center gap-4 self-center rounded-[14px] border border-line bg-surface-2/60 px-5 py-4">
          <ProgressRing value={value} size={84} stroke={7} label={`${value}% of this chapter mastered`} />
          <div>
            <p className="eyebrow text-accent">Topic mastery</p>
            <p className="mt-1 text-[15px] font-semibold text-ink">
              {counts.mastered} of {plural(counted.length, 'topic')} mastered
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted">
              <span className="size-1.5 rounded-full bg-amber" aria-hidden />
              {remaining ? `${plural(remaining, 'topic')} left to master` : 'Every topic mastered'}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
