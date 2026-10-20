import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CircleCheck,
  Flame,
  Library,
  Pi,
  Play,
  Star,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { catalog, chapterPath, chapters, subjectPath, subjects } from '@/content/catalog';
import type { Frequency } from '@/content/types';
import { ExamCountdown } from '@/app/TopBar';
import { masteryCounts, masteryPercent, streak, MASTERY_LABEL } from '@/features/progress/metrics';
import { useProgress } from '@/features/progress/store';
import { cn, formatDate, formatMarks, pct, plural } from '@/lib/utils';
import { Badge, FrequencyBadge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { DocTitle } from '@/ui/page-header';
import { Card, ProgressBar, ProgressRing, SectionHeading } from '@/ui/primitives';
import { attemptStats, greeting, inDays, registrationWindow, reviseToday } from './insights';
import { OfflineCard } from '@/features/offline/OfflineCard';

const allTopics = chapters.flatMap((c) => c.topicIndex);
const tierOf = new Map(catalog.studyPlan.priorityMatrix.flatMap((t) => t.subjects.map((s) => [s, t.tier] as const)));

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <DocTitle>Dashboard</DocTitle>
      <RegistrationAlert />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Hero />
        <MasteryCard />
      </div>
      <StatTiles />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SubjectMatrix />
        <aside className="space-y-6">
          <ReviseToday />
          <CoverageCard />
          <MemoryCard />
          <OfflineCard />
        </aside>
      </div>
      <RecentQuizzes />
    </div>
  );
}

function RegistrationAlert() {
  const w = registrationWindow(catalog.exam.dates);
  if (!w) return null;
  const urgent = w.days <= 2;
  return (
    <div
      role="status"
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[14px] border px-4 py-3',
        urgent ? 'border-coral/45 bg-coral/[0.08]' : 'border-amber/40 bg-amber/[0.07]',
      )}
    >
      <TriangleAlert className={cn('size-4 shrink-0', urgent ? 'text-coral' : 'text-amber')} aria-hidden />
      <p className="min-w-0 flex-1 text-[13.5px] text-ink">
        <strong className="font-semibold">
          {w.stage === 'regular' ? 'Regular registration' : 'Late-fee registration'} closes {inDays(w.days)}
        </strong>{' '}
        ({formatDate(w.closes)}).{' '}
        {w.stage === 'regular'
          ? `After that the late fee applies until ${formatDate(catalog.exam.dates.registrationLateFeeCloses)}.`
          : 'This is the last registration window for GATE 2027.'}{' '}
        <span className="text-muted">{catalog.exam.dates.note}</span>
      </p>
      <Button size="sm" variant={urgent ? 'danger' : 'outline'} asChild>
        <a href={catalog.exam.website} target="_blank" rel="noreferrer">
          Official site <ArrowRight />
        </a>
      </Button>
    </div>
  );
}

function Hero() {
  const mastery = useProgress((s) => s.mastery);
  const focus = useMemo(() => reviseToday(chapters, mastery, 2), [mastery]);
  const { pattern } = catalog.exam;
  return (
    <section className="glass relative overflow-hidden p-6 sm:p-7" aria-labelledby="hero-title">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,var(--glow-1),transparent_65%)]"
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-accent/45 bg-accent/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-accent">
          GATE CS 2027 · {catalog.exam.organizer}
        </span>
        <ExamCountdown className="md:hidden" />
      </div>
      <h1 id="hero-title" className="text-[28px] font-bold leading-tight text-ink sm:text-[32px]">
        {greeting()}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
        {focus.length ? (
          <>
            Today's focus:{' '}
            {focus.map((f, i) => (
              <span key={f.topic.id}>
                {i > 0 && ' and '}
                <Link
                  to={chapterPath(f.chapter.id, 'learn', f.topic.id)}
                  className={cn('font-semibold underline decoration-current/30 underline-offset-4 hover:decoration-current', i ? 'text-amber' : 'text-accent')}
                >
                  {f.topic.title}
                </Link>
              </span>
            ))}
            . {focus[0].level === 'new' ? 'Both are asked often and you have not started them yet.' : 'Finish what you started before opening new topics.'}
          </>
        ) : (
          'Every available topic is marked mastered. Keep it fresh with timed PYQ sets.'
        )}
      </p>
      <dl className="mt-6 grid gap-x-8 gap-y-3 border-t border-line pt-5 text-[13px] sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-faint">Paper:</dt>
          <dd className="text-ink">
            {pattern.questions} questions · {pattern.marks.total} marks · {pattern.durationHours} h
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-faint">Pacing:</dt>
          <dd className="text-ink">{catalog.studyPlan.timeSplit.map((t) => `${t.minutes}m`).join(' / ')}</dd>
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <dt className="text-faint">Target:</dt>
          <dd className="text-accent">{catalog.studyPlan.targetScore.text}</dd>
        </div>
      </dl>
    </section>
  );
}

function MasteryCard() {
  const mastery = useProgress((s) => s.mastery);
  const counts = masteryCounts(allTopics, mastery);
  const counted = allTopics.filter((t) => !t.beyondSyllabus).length;
  const overall = masteryPercent(allTopics, mastery);
  return (
    <Card className="flex flex-col justify-between gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Overall mastery</p>
          <p className="mt-2 font-display text-[40px] font-bold leading-none text-accent">
            {overall}
            <span className="text-[22px]">%</span>
          </p>
          <p className="mt-2 font-mono text-[12.5px] text-muted">
            {counts.mastered} of {plural(counted, 'topic')} mastered
          </p>
        </div>
        <ProgressRing value={overall} size={96} stroke={7} label={`${overall}% of syllabus topics mastered`} />
      </div>
      <ul className="grid grid-cols-3 gap-2 font-mono text-[11.5px]">
        {(['mastered', 'review', 'learning'] as const).map((level) => (
          <li key={level} className="rounded-[10px] border border-line bg-surface-2/60 px-3 py-2">
            <span className={cn('block text-[17px] font-semibold', level === 'mastered' ? 'text-accent' : level === 'review' ? 'text-violet' : 'text-amber')}>
              {counts[level]}
            </span>
            <span className="text-faint">{MASTERY_LABEL[level]}</span>
          </li>
        ))}
      </ul>
      <p className="text-[12px] text-faint">
        Mark a topic on its chapter page. Mastery weights each topic 0, ⅓, ⅔ or 1 by level; topics the 2027 syllabus dropped do not count.
      </p>
    </Card>
  );
}

function StatTiles() {
  const { attempts, starred, days } = useProgress();
  const a = attemptStats(attempts);
  const run = streak(days);
  const tiles = [
    {
      label: 'Questions attempted',
      value: String(a.total),
      sub: a.thisWeek ? `+${a.thisWeek} this week` : 'None this week yet',
      icon: CircleCheck,
      tone: 'text-accent',
    },
    {
      label: 'Accuracy',
      value: a.accuracy === null ? '–' : `${(a.accuracy * 100).toFixed(1)}%`,
      sub: a.total ? `${a.correct} of ${a.total} correct` : 'Answer a question to start',
      icon: Target,
      tone: 'text-accent',
    },
    {
      label: 'Formulas starred',
      value: String(Object.keys(starred).length),
      sub: 'Starred formulas lead the formula page',
      icon: Star,
      tone: 'text-violet',
      to: '/formulas?starred=1',
    },
    {
      label: 'Study streak',
      value: plural(run, 'day'),
      sub: run ? 'Study today to extend it' : 'Answer or mark a topic to begin',
      icon: Flame,
      tone: 'text-amber',
    },
  ];
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((t) => {
        const Icon = t.icon;
        const body = (
          <>
            <div className="min-w-0">
              <p className="eyebrow">{t.label}</p>
              <p className={cn('mt-2 font-display text-[28px] font-bold leading-none', t.tone === 'text-accent' ? 'text-ink' : t.tone)}>{t.value}</p>
              <p className="mt-2 truncate font-mono text-[11.5px] text-faint">{t.sub}</p>
            </div>
            <span className={cn('grid size-11 shrink-0 place-items-center rounded-[12px] border border-line bg-surface-2', t.tone)}>
              <Icon className="size-5" aria-hidden />
            </span>
          </>
        );
        return (
          <li key={t.label}>
            {t.to ? (
              <Link to={t.to} className="glass flex items-center justify-between gap-3 p-5 transition-colors hover:border-line-strong">
                {body}
              </Link>
            ) : (
              <div className="glass flex items-center justify-between gap-3 p-5">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const TIER_DOT: Record<Frequency, string> = { high: 'bg-coral', medium: 'bg-amber', low: 'bg-emerald' };

function SubjectMatrix() {
  const mastery = useProgress((s) => s.mastery);
  return (
    <section aria-labelledby="matrix-title">
      <SectionHeading
        id="matrix-title"
        eyebrow="Syllabus architecture"
        title="Subjects matrix"
        action={
          <ul className="hidden flex-wrap gap-3 font-mono text-[11px] text-muted md:flex">
            {catalog.studyPlan.priorityMatrix.map((t) => (
              <li key={t.tier} className="flex items-center gap-1.5" title={`${t.label}: ${t.targetMarks} marks of the paper`}>
                <span className={cn('size-2 rounded-full', TIER_DOT[t.tier])} aria-hidden />
                {t.label} ({t.targetMarks})
              </li>
            ))}
          </ul>
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {subjects.map((s) => {
          const topics = s.chapters.flatMap((c) => c.topicIndex);
          const value = masteryPercent(topics, mastery);
          const tier = tierOf.get(s.id) ?? 'medium';
          return (
            <li key={s.id}>
              <Link
                to={subjectPath(s.id)}
                className="glass group flex h-full flex-col p-5 transition-colors hover:border-accent/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md border border-line-strong/70 bg-surface-2 px-2 py-1 font-mono text-[11px] font-semibold text-ink">
                    {s.code}
                  </span>
                  <FrequencyBadge frequency={tier} />
                </div>
                <h3 className="mt-3 text-[16px] font-semibold text-ink group-hover:text-accent">{s.title}</h3>
                <p className="mt-1 font-mono text-[11.5px] text-muted">
                  {s.weight} · {plural(s.stats.chapters, 'chapter')}
                </p>
                <p className="mt-1 font-mono text-[11px] text-faint">
                  {s.stats.ready === s.stats.chapters ? 'All chapters ready' : `${s.stats.ready} of ${s.stats.chapters} chapters ready`}
                </p>
                <div className="mt-auto border-t border-line pt-3">
                  <div className="mb-1.5 mt-1 flex justify-between font-mono text-[11.5px]">
                    <span className="text-muted">Mastery</span>
                    <span className="text-accent">{value}%</span>
                  </div>
                  <ProgressBar value={value} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ReviseToday() {
  const mastery = useProgress((s) => s.mastery);
  const list = useMemo(() => reviseToday(chapters, mastery, 5), [mastery]);
  const quizHref = `/practice/quiz?${new URLSearchParams({ topics: list.map((f) => f.topic.id).join(','), mode: 'practice' })}`;
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink">
          <CalendarClock className="size-4 text-amber" aria-hidden /> Revise today
        </h2>
        <Badge tone="amber">{list.length} due</Badge>
      </div>
      {list.length ? (
        <ol className="space-y-2.5">
          {list.map((f) => (
            <li key={f.topic.id}>
              <Link
                to={chapterPath(f.chapter.id, 'learn', f.topic.id)}
                className="flex gap-3 rounded-[12px] border border-line bg-surface-2/50 px-3.5 py-3 transition-colors hover:border-line-strong"
              >
                <span className="pt-0.5 font-mono text-[11.5px] text-amber">{f.chapter.ref}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium leading-snug text-ink">{f.topic.title}</span>
                  <span className="mt-0.5 block truncate font-mono text-[11px] text-faint">
                    {f.chapter.subject.title} · {f.level === 'new' ? 'not started' : MASTERY_LABEL[f.level].toLowerCase()}
                  </span>
                </span>
                <FrequencyBadge frequency={f.topic.frequency} className="self-start" />
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted">Nothing due: every available topic is mastered.</p>
      )}
      {list.length > 0 && (
        <Button variant="outline" className="mt-4 w-full border-accent/40 text-accent hover:bg-accent/10" asChild>
          <Link to={quizHref}>
            <Play /> Quiz me on these topics
          </Link>
        </Button>
      )}
    </Card>
  );
}

function CoverageCard() {
  const { stats } = catalog;
  const total = stats.syllabusItems;
  const parts = [
    { label: 'Covered', value: stats.syllabusCovered, bar: 'bg-accent', dot: 'bg-accent' },
    { label: 'Partial', value: stats.syllabusPartial, bar: 'bg-amber', dot: 'bg-amber' },
    { label: 'Curated', value: stats.syllabusCurated, bar: 'bg-violet', dot: 'bg-violet' },
    { label: 'In progress', value: stats.syllabusPending, bar: 'bg-surface-3', dot: 'bg-line-strong' },
  ];
  const fresh = catalog.syllabus.items.filter((i) => i.new2027).length;
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink">
          <BadgeCheck className="size-4 text-accent" aria-hidden /> 2027 syllabus coverage
        </h2>
        <Badge tone="accent">{fresh} new in 2027</Badge>
      </div>
      <p className="mb-2 font-mono text-[12px] text-muted">
        {total} official syllabus items · {pct(stats.syllabusCovered + stats.syllabusPartial + stats.syllabusCurated, total)}% mapped to content
      </p>
      <div className="flex h-2 overflow-hidden rounded-full bg-surface-3" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(', ')}>
        {parts.map((p) => (
          <span key={p.label} className={p.bar} style={{ width: `${(p.value / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11.5px] text-muted">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', p.dot)} aria-hidden />
            {p.label} {p.value}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-[10px] border border-line bg-surface-2/50 px-3 py-2.5 text-[12.5px] leading-relaxed text-muted">{catalog.exam.changesFrom2026}</p>
      <Button variant="ghost" size="sm" className="mt-3 px-0 text-accent hover:bg-transparent" asChild>
        <Link to="/syllabus">
          Open the 2027 syllabus map <ArrowRight />
        </Link>
      </Button>
    </Card>
  );
}

function MemoryCard() {
  const m = catalog.memory;
  const total = m.paperIds.length;
  return (
    <Card className="p-5">
      <h2 className="mb-1 flex items-center gap-2 text-[16px] font-semibold text-ink">
        <Library className="size-4 text-violet" aria-hidden /> Official PYQ archive
      </h2>
      <p className="mb-4 text-[12.5px] text-muted">GATE CSE 2011–2026, solved from the official papers and final answer keys.</p>
      <dl className="grid grid-cols-2 gap-2 font-mono">
        {[
          { k: 'Papers indexed', v: `${m.papers}/${total}` },
          { k: 'Questions mapped', v: String(m.mapped) },
          { k: 'Solved with traps', v: String(m.solved) },
          { k: 'Derivation sets', v: String(m.derivations) },
        ].map((d) => (
          <div key={d.k} className="flex flex-col-reverse rounded-[10px] border border-line bg-surface-2/60 px-3 py-2">
            <dt className="text-[11px] text-faint">{d.k}</dt>
            <dd className="text-[17px] font-semibold text-ink">{d.v}</dd>
          </div>
        ))}
      </dl>
      <ProgressBar value={pct(m.papers, total)} tone="violet" className="mt-4" />
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="secondary" asChild className="flex-1">
          <Link to="/pyqs">
            <BadgeCheck /> PYQ solver
          </Link>
        </Button>
        <Button size="sm" variant="secondary" asChild className="flex-1">
          <Link to="/papers">
            <Pi /> Papers
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function RecentQuizzes() {
  const quizzes = useProgress((s) => s.quizzes).slice(0, 4);
  if (!quizzes.length) return null;
  return (
    <section aria-labelledby="recent-title">
      <SectionHeading id="recent-title" eyebrow="History" title="Recent quizzes" action={<Link className="text-[13px] text-accent hover:underline" to="/practice">All quizzes</Link>} />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quizzes.map((q) => (
          <li key={q.id}>
            <Link to={q.href} className="glass block p-4 transition-colors hover:border-line-strong">
              <p className="truncate text-[13.5px] font-medium text-ink">{q.title}</p>
              <p className="mt-1 font-mono text-[11px] text-faint">
                {q.mode === 'exam' ? 'Timed' : 'Practice'} · {new Date(q.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
              <p className="mt-3 font-display text-[22px] font-bold text-ink">
                {formatMarks(q.net)}
                <span className="text-[14px] text-faint"> / {q.max}</span>
              </p>
              <p className="font-mono text-[11px] text-muted">
                {q.correct} right · {q.wrong} wrong · {q.unanswered} blank
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
