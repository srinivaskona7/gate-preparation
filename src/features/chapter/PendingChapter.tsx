import { BookOpenText, FileText } from 'lucide-react';
import { Link } from 'react-router';
import type { ChapterEntry } from '@/content/catalog';
import type { SyllabusItem } from '@/content/types';
import { MappedQuestions } from '@/features/pyq/MappedQuestions';
import { SyllabusStatusBadge } from '@/features/syllabus/status';
import { VisualFrame } from '@/features/visuals/VisualFrame';
import { visualsFor } from '@/features/visuals/registry';
import { plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card } from '@/ui/primitives';

const pageRange = ([from, to]: [number, number]) => (from === to ? `page ${from}` : `pages ${from}–${to}`);

/** A chapter whose content is not written yet: what it will cover, and what can be used today. */
export function PendingChapter({ chapter: c, syllabus }: { chapter: ChapterEntry; syllabus: SyllabusItem[] }) {
  const visuals = visualsFor(c.id);
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-6">
        <Card className="p-6">
          <p className="eyebrow mb-2 flex items-center gap-2 text-amber">
            <BookOpenText className="size-3.5" aria-hidden /> In the writing queue
          </p>
          <h2 className="text-[19px] font-semibold text-ink">Topics, formulas and practice for this chapter are being written</h2>
          <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-muted">
            The study notes cover it on {pageRange(c.notesPages)} (syllabus summary on {pageRange(c.syllabusPages)}). Each topic is checked
            against the 2027 syllabus items listed here, and anything the notes skip is curated, before the chapter opens with its
            derivations and solved PYQs.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 font-mono text-[11.5px] text-faint">
            <li className="rounded-md border border-line px-2 py-1">{plural(syllabus.length, 'syllabus item')}</li>
            {c.memory.mapped > 0 && <li className="rounded-md border border-line px-2 py-1">{plural(c.memory.mapped, 'official PYQ')} mapped</li>}
            {visuals.length > 0 && <li className="rounded-md border border-line px-2 py-1">{plural(visuals.length, 'visual')} ready</li>}
          </ul>
        </Card>

        {visuals.map((v) => (
          <VisualFrame key={v.id} visual={v} />
        ))}

        <MappedQuestions chapterId={c.id} title="Official questions mapped to this chapter" />
      </div>

      <aside>
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
            <FileText className="size-4 text-accent" aria-hidden /> What the 2027 syllabus names
          </h2>
          {syllabus.length ? (
            <ul className="space-y-3">
              {syllabus.map((i) => (
                <li key={i.id} className="text-[13px] leading-relaxed">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/syllabus/${i.id}`} className="text-ink/90 hover:text-accent">
                      {i.text}
                    </Link>
                    <SyllabusStatusBadge status={i.status} />
                  </div>
                  {i.new2027 && (
                    <Badge tone="accent" className="mt-1">
                      New in 2027
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted">No 2027 syllabus item maps to this chapter.</p>
          )}
        </Card>
      </aside>
    </div>
  );
}
