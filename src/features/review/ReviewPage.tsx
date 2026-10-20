import { Eye, Layers, RotateCcw, SkipForward, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { chapterPath, getChapter, topicTitles } from '@/content/catalog';
import type { LocatedFormula } from '@/content/types';
import { useProgress } from '@/features/progress/store';
import { AnswerInput } from '@/features/quiz/AnswerInput';
import { Explanation } from '@/features/quiz/Explanation';
import { isPyq, type QuizItem } from '@/features/quiz/pool';
import { QuestionStem } from '@/features/quiz/QuestionStem';
import { ResultBanner } from '@/features/quiz/ResultBanner';
import { isCorrect, type Response } from '@/features/quiz/scoring';
import { useAsync } from '@/lib/use-async';
import { cn, plural } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { MathText, Tex } from '@/ui/math';
import { PageHeader } from '@/ui/page-header';
import { Card, EmptyState, SectionHeading, Skeleton } from '@/ui/primitives';
import { type DeckItem, deckStats, formulaCardId, loadDeckItems } from './deck';
import { dueIds, forecast, formatInterval, GRADES, type Grade, newCard, previewIntervals } from './srs';

const GRADE_LABEL: Record<Grade, string> = { again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy' };
const DAY_LABELS = ['Today', 'Tomorrow'];

export function ReviewPage() {
  const cards = useProgress((s) => s.cards);
  const starred = useProgress((s) => s.starred);
  const addCard = useProgress((s) => s.addCard);
  const [now, setNow] = useState(Date.now);
  // The queue is fixed when a sitting starts, so grading a card never reorders what is on screen.
  const [queue, setQueue] = useState<string[] | null>(null);
  const stats = deckStats(cards, now);
  const unstarredInDeck = Object.keys(starred).filter((id) => !cards[formulaCardId(id)]);

  const start = () => {
    const t = Date.now();
    setNow(t);
    setQueue(dueIds(cards, t));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Spaced repetition"
        title="Review"
        description="Every question you miss joins this deck and comes back after 10 minutes, then 1 day, 6 days and longer each time you get it right. A miss starts it over. Starred formulas can join too."
        actions={
          unstarredInDeck.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => unstarredInDeck.forEach((id) => addCard(formulaCardId(id)))}>
              <Layers /> Add {plural(unstarredInDeck.length, 'starred formula')}
            </Button>
          )
        }
      />
      {queue ? (
        <Sitting queue={queue} onDone={start} onExit={() => setQueue(null)} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="space-y-4">
            <SectionHeading eyebrow="Today" title={stats.due ? `${plural(stats.due, 'card')} due` : 'Nothing due'} />
            {stats.total === 0 ? (
              <p className="text-sm text-muted">
                The deck is empty. Answer questions in <Link className="text-accent hover:underline" to="/practice">practice</Link> or the{' '}
                <Link className="text-accent hover:underline" to="/pyqs">PYQ solver</Link>; each miss lands here.
              </p>
            ) : (
              <p className="text-sm text-muted">
                {stats.due ? 'Work through them now; each answer schedules the next review.' : 'Come back when the forecast shows cards due.'}
              </p>
            )}
            <Button variant="primary" onClick={start} disabled={!stats.due}>
              <RotateCcw /> Start review
            </Button>
          </Card>
          <Card className="space-y-4">
            <SectionHeading eyebrow="Deck" title={plural(stats.total, 'card')} />
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Learning" value={stats.learning} />
              <Stat label="Young" value={stats.young} />
              <Stat label="Mature (21 d+)" value={stats.mature} />
              <Stat label="Formulas" value={stats.formulas} />
            </dl>
            <Forecast counts={forecast(cards, now)} />
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[12px] text-faint">{label}</dt>
      <dd className="font-mono text-lg font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Forecast({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);
  return (
    <figure>
      <figcaption className="eyebrow mb-2">Due over the next 7 days</figcaption>
      <ol className="flex h-24 items-end gap-1.5" aria-label="Cards due per day">
        {counts.map((n, i) => (
          <li key={i} className="flex flex-1 flex-col items-center gap-1" aria-label={`${DAY_LABELS[i] ?? `Day ${i + 1}`}: ${n}`}>
            <span className="font-mono text-[10px] text-faint">{n || ''}</span>
            <span className="w-full rounded-t bg-accent/70" style={{ height: `${(n / max) * 64}px` }} />
            <span className="font-mono text-[10px] text-faint">{i === 0 ? 'T' : `+${i}`}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

function Sitting({ queue, onDone, onExit }: { queue: string[]; onDone: () => void; onExit: () => void }) {
  const items = useAsync(() => loadDeckItems(queue), `review:${queue.join(',')}`);
  const [index, setIndex] = useState(0);
  const cards = useProgress((s) => s.cards);

  if (items.status === 'loading') return <Skeleton className="h-96" />;
  if (items.status === 'error') return <EmptyState title="The deck failed to load">{items.error.message}</EmptyState>;
  const list = items.data;
  if (index >= list.length) {
    const again = dueIds(cards, Date.now()).length;
    return (
      <EmptyState title={list.length ? `Sitting done: ${plural(list.length, 'card')} reviewed` : 'Nothing to review'}>
        <p>{again ? `${plural(again, 'card')} came due again, misses among them.` : 'Every card is scheduled ahead.'}</p>
        <div className="mt-4 flex justify-center gap-2">
          {again > 0 && (
            <Button variant="primary" size="sm" onClick={onDone}>
              Review {again} more
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onExit}>
            Back to the deck
          </Button>
        </div>
      </EmptyState>
    );
  }
  const item = list[index];
  const next = () => setIndex((i) => i + 1);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[12px] text-faint">
          Card {index + 1} of {list.length}
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full bg-accent transition-[width]" style={{ width: `${(index / list.length) * 100}%` }} />
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          End sitting
        </Button>
      </div>
      <ReviewItem key={item.id} item={item} onNext={next} />
    </div>
  );
}

function ReviewItem({ item, onNext }: { item: DeckItem; onNext: () => void }) {
  return item.kind === 'question' ? <ReviewQuestion q={item.question} onNext={onNext} /> : <ReviewFormula id={item.id} f={item.formula} onNext={onNext} />;
}

function Where({ chapter, topic }: { chapter: string; topic: string }) {
  return (
    <Link to={chapterPath(chapter, 'learn', topic)} className="truncate font-mono text-[11px] text-faint hover:text-accent">
      {getChapter(chapter)?.title} · {topicTitles.get(topic) ?? topic}
    </Link>
  );
}

function RemoveButton({ id, onRemoved }: { id: string; onRemoved: () => void }) {
  const remove = useProgress((s) => s.removeCard);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        remove(id);
        onRemoved();
      }}
    >
      <Trash2 /> Remove from deck
    </Button>
  );
}

function ReviewQuestion({ q, onNext }: { q: QuizItem; onNext: () => void }) {
  const record = useProgress((s) => s.recordAttempts);
  const [response, setResponse] = useState<Response | undefined>();
  const [checked, setChecked] = useState(false);
  const [shownAt] = useState(Date.now);
  const pyq = isPyq(q) ? q : undefined;

  const check = () => {
    setChecked(true);
    // Recording the answer is the review: a miss resets the card, a hit schedules it further out.
    record([{ id: q.id, correct: isCorrect(q, response), seconds: Math.round((Date.now() - shownAt) / 1000) }]);
  };

  return (
    <article aria-label="Review question" className="glass space-y-5 p-5 sm:p-7">
      <header className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{q.type}</Badge>
        <Badge tone="neutral">{plural(q.marks, 'mark')}</Badge>
        {pyq && <span className="font-mono text-[11px] text-faint">{pyq.paperTitle}</span>}
        <span className="ml-auto">
          <Where chapter={q.chapter} topic={q.topic} />
        </span>
      </header>
      <QuestionStem id={pyq?.id} stem={q.stem} code={pyq?.code} table={pyq?.table} figure={pyq?.figure} diagram={pyq?.diagram} />
      <AnswerInput question={q} response={response} onChange={setResponse} locked={checked} reveal={checked} />
      {checked && (
        <div className="reveal space-y-3">
          <ResultBanner question={q} response={response} />
          <Explanation question={q} />
        </div>
      )}
      <footer className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {checked ? (
          <Button variant="primary" onClick={onNext}>
            Next card
          </Button>
        ) : (
          <>
            <Button variant="primary" onClick={check}>
              Check answer
            </Button>
            <Button variant="ghost" size="sm" onClick={onNext}>
              <SkipForward /> Skip
            </Button>
          </>
        )}
        <span className="ml-auto">
          <RemoveButton id={q.id} onRemoved={onNext} />
        </span>
      </footer>
    </article>
  );
}

function ReviewFormula({ id, f, onNext }: { id: string; f: LocatedFormula; onNext: () => void }) {
  const card = useProgress((s) => s.cards[id]);
  const grade = useProgress((s) => s.reviewCard);
  const [shown, setShown] = useState(false);
  const [now] = useState(Date.now);
  const hints = previewIntervals(card ?? newCard(now), now);

  return (
    <article aria-label="Review formula" className="glass space-y-5 p-5 sm:p-7">
      <header className="flex flex-wrap items-center gap-2">
        <Badge tone="violet">Formula</Badge>
        <span className="ml-auto">
          <Where chapter={f.chapter} topic={f.topic} />
        </span>
      </header>
      <h2 className="text-xl font-semibold text-ink">{f.name}</h2>
      <p className="text-sm text-muted">Write the formula and its conditions from memory, then reveal it.</p>
      {shown ? (
        <div className="reveal space-y-3">
          <Tex tex={f.tex} className="overflow-x-auto" />
          {f.note && <MathText text={f.note} className="block text-sm text-muted" />}
          <div className="flex flex-wrap gap-2" role="group" aria-label="How well did you recall it?">
            {GRADES.map((g) => (
              <Button
                key={g}
                variant={g === 'good' ? 'primary' : 'outline'}
                size="sm"
                className={cn(g === 'again' && 'text-coral')}
                onClick={() => {
                  grade(id, g);
                  onNext();
                }}
              >
                {GRADE_LABEL[g]} <span className="font-mono text-[10.5px] opacity-70">{formatInterval(hints[g])}</span>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <Button variant="primary" onClick={() => setShown(true)}>
          <Eye /> Show formula
        </Button>
      )}
      <footer className="flex justify-end border-t border-line pt-4">
        <RemoveButton id={id} onRemoved={onNext} />
      </footer>
    </article>
  );
}
