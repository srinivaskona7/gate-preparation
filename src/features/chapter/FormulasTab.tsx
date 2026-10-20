import { ComplexityTable } from '@/features/formulas/ComplexityTable';
import { FormulaCard, formulasAsLatex } from '@/features/formulas/FormulaCard';
import { useScrollToItem } from '@/lib/use-scroll-to-item';
import { plural } from '@/lib/utils';
import { CopyTextButton } from '@/ui/copy-text-button';
import { EmptyState, SectionHeading } from '@/ui/primitives';
import type { TabProps } from './tab-props';

export function FormulasTab({ chapter, body, item }: TabProps) {
  useScrollToItem(item);
  const topicTitle = new Map(body.topics.map((t) => [t.id, t.title]));
  const byTopic = new Map<string, typeof body.formulas>();
  for (const f of body.formulas) byTopic.set(f.topic, [...(byTopic.get(f.topic) ?? []), f]);

  if (!body.formulas.length) return <EmptyState title="No formulas in this chapter" />;
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Instant reference"
        title={`Formula cards · ${plural(body.formulas.length, 'formula')}`}
        action={
          <CopyTextButton variant="outline" size="sm" text={formulasAsLatex(chapter.title, body.formulas)}>
            Copy all as LaTeX
          </CopyTextButton>
        }
      />
      {[...byTopic].map(([topic, formulas]) => (
        <section key={topic} aria-label={topicTitle.get(topic) ?? topic}>
          <p className="eyebrow mb-3">{topicTitle.get(topic) ?? topic}</p>
          <div className="grid gap-4 lg:grid-cols-2">
            {formulas.map((f) => (
              <FormulaCard key={f.id} formula={f} />
            ))}
          </div>
        </section>
      ))}
      {body.complexity.length > 0 && <ComplexityTable rows={body.complexity} />}
    </div>
  );
}
