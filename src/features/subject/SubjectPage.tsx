import { ArrowRight, BadgeCheck, BookOpen, Play } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { catalog, chapterPath, getSubject } from '@/content/catalog';
import type { ChapterMeta } from '@/content/types';
import { NotFound } from '@/app/RouteStates';
import { SUBJECT_ICON } from '@/app/nav';
import { masteryCounts, masteryPercent } from '@/features/progress/metrics';
import { useProgress } from '@/features/progress/store';
import { cn, plural } from '@/lib/utils';
import { Badge, FrequencyBadge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { MathText } from '@/ui/math';
import { PageHeader } from '@/ui/page-header';
import { ProgressBar, ProgressRing, SectionHeading } from '@/ui/primitives';
import { SyllabusStatusBadge } from '@/features/syllabus/status';

export function SubjectPage() {
  const subject = getSubject(useParams().subjectId);
  const mastery = useProgress((s) => s.mastery);
  if (!subject) return <NotFound />;

  const Icon = SUBJECT_ICON[subject.code] ?? BookOpen;
  const topics = subject.chapters.flatMap((c) => c.topicIndex);
  const value = masteryPercent(topics, mastery);
  const counts = masteryCounts(topics, mastery);
  const chapterIds = new Set(subject.chapters.map((c) => c.id));
  const items = catalog.syllabus.items.filter((i) => chapterIds.has(i.chapter));
  const ready = subject.chapters.filter((c) => c.status === 'ready');
  const quiz = `/practice/quiz?${new URLSearchParams({ chapters: ready.map((c) => c.id).join(','), mode: 'practice' })}`;

  return (
    <div>
      <PageHeader
        eyebrow={
          <>
            <span>Section {subject.section}</span>
            <span aria-hidden>·</span>
            <span>{subject.weight}</span>
          </>
        }
        title={
          <span className="flex items-center gap-3">
            <Icon className="size-7 text-accent" aria-hidden />
            {subject.title}
          </span>
        }
        docTitle={subject.title}
        description={`${plural(subject.stats.chapters, 'chapter')}, ${subject.stats.ready} ready. ${plural(topics.filter((t) => !t.beyondSyllabus).length, 'syllabus topic')}, ${counts.mastered} mastered.`}
        actions={
          <>
            <ProgressRing value={value} size={64} label={`${value}% of ${subject.title} mastered`} />
            {ready.length > 0 && (
              <Button variant="primary" asChild>
                <Link to={quiz}>
                  <Play /> Practice {subject.code}
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to={`/pyqs?subject=${subject.id}`}>
                <BadgeCheck /> {subject.code} PYQs
              </Link>
            </Button>
          </>
        }
      />

      <ul className="grid gap-4 md:grid-cols-2">
        {subject.chapters.map((c) => (
          <ChapterCard key={c.id} chapter={c} mastery={masteryPercent(c.topicIndex, mastery)} />
        ))}
      </ul>

      <section className="mt-10" aria-labelledby="syllabus-title">
        <SectionHeading id="syllabus-title" eyebrow="Official GATE 2027 syllabus" title={`What the syllabus names for ${subject.code}`} />
        <ul className="glass divide-y divide-line">
          {items.map((i) => (
            <li key={i.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
              <p className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-ink">{i.text}</p>
              {i.new2027 && <Badge tone="accent">New in 2027</Badge>}
              <SyllabusStatusBadge status={i.status} />
              <Link to={chapterPath(i.chapter)} className="font-mono text-[11.5px] text-muted hover:text-accent">
                {subject.chapters.find((c) => c.id === i.chapter)?.ref}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ChapterCard({ chapter: c, mastery }: { chapter: ChapterMeta; mastery: number }) {
  const ready = c.status === 'ready';
  const facts = ready && c.stats
    ? [
        plural(c.stats.topics, 'topic'),
        plural(c.stats.formulas, 'formula'),
        plural(c.stats.questions, 'practice question'),
        c.memory.pyqs ? plural(c.memory.pyqs, 'solved PYQ') : null,
        c.memory.derivations ? plural(c.memory.derivations, 'derivation') : null,
      ].filter(Boolean)
    : [];
  return (
    <li>
      <Link
        to={chapterPath(c.id)}
        className={cn('glass group flex h-full flex-col p-5 transition-colors', ready ? 'hover:border-accent/40' : 'opacity-80 hover:opacity-100')}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-accent">{c.ref}</span>
          <FrequencyBadge frequency={c.frequency} />
          <span className="font-mono text-[11px] text-faint">{c.weight}</span>
          {!ready && (
            <Badge tone="neutral" className="ml-auto">
              In progress
            </Badge>
          )}
        </div>
        <h3 className="mt-2 text-[17px] font-semibold text-ink group-hover:text-accent">{c.title}</h3>
        {c.summary && <MathText text={c.summary} className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-muted" />}
        {facts.length > 0 && <p className="mt-3 font-mono text-[11.5px] text-faint">{facts.join(' · ')}</p>}
        {!ready && c.memory.mapped > 0 && (
          <p className="mt-3 font-mono text-[11.5px] text-faint">{plural(c.memory.mapped, 'official PYQ')} mapped so far</p>
        )}
        <div className="mt-auto pt-4">
          {ready ? (
            <>
              <div className="mb-1.5 flex justify-between font-mono text-[11.5px]">
                <span className="text-muted">Mastery</span>
                <span className="text-accent">{mastery}%</span>
              </div>
              <ProgressBar value={mastery} />
            </>
          ) : (
            <span className="inline-flex items-center gap-1 text-[12.5px] text-muted group-hover:text-accent">
              Syllabus and mapped PYQs <ArrowRight className="size-3.5" />
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}
