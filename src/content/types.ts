// Shapes of the generated site data (scripts/emit-site-data.mjs).
// scripts/check-manifest.mjs is the authority on every field; these types mirror it.

export type Frequency = 'high' | 'medium' | 'low';
export type Origin = 'source' | 'curated';
export type QuestionType = 'mcq' | 'msq' | 'nat';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type CoverageStatus = 'covered' | 'partial' | 'curated';

export interface Provenance {
  origin: Origin;
  pages: number[];
}

export interface Topic extends Provenance {
  id: string;
  title: string;
  frequency: Frequency;
  points: string[];
  keyTerms?: string[];
  beyondSyllabus?: true;
  /** A beginner lesson written by us; the example and practice question are not exam questions. */
  lesson?: TopicLesson;
}

export interface TopicLesson {
  why: string;
  intro: string;
  prerequisites?: string[];
  analogy?: { text: string; breaksWhen: string };
  definitions?: { term: string; meaning: string }[];
  principle: { text: string; tex?: string };
  limits: string;
  example: { problem: string; steps: string[]; result: string };
  misconceptions: string[];
  recall: { q: string; a: string }[];
  practice:
    | { type: 'mcq'; stem: string; options: [string, string, string, string]; answer: number; explanation: string }
    | { type: 'nat'; stem: string; answer: number; explanation: string };
  summary: string;
}

export interface Formula extends Provenance {
  id: string;
  name: string;
  tex: string;
  text: string;
  where?: [string, string][];
  note?: string;
  topic: string;
}

export interface ComplexityRow extends Provenance {
  id: string;
  name: string;
  best?: string;
  average?: string;
  worst?: string;
  space?: string;
  notes?: string;
  topic: string;
}

export interface ProblemType extends Provenance {
  id: string;
  title: string;
  frequency: Frequency;
  marks: 1 | 2;
  format: 'MCQ' | 'MSQ' | 'NAT';
  recipe: string[];
  trap?: string;
  topic: string;
}

interface QuestionBase extends Provenance {
  id: string;
  marks: 1 | 2;
  stem: string;
  explanation: string;
  difficulty: Difficulty;
  topic: string;
  sourceLabel?: string;
}

export interface McqQuestion extends QuestionBase {
  type: 'mcq';
  options: [string, string, string, string];
  answer: number;
}

export interface MsqQuestion extends QuestionBase {
  type: 'msq';
  options: [string, string, string, string];
  answer: number[];
}

export interface NatQuestion extends QuestionBase {
  type: 'nat';
  answer: number;
  tolerance?: number;
}

export type Question = McqQuestion | MsqQuestion | NatQuestion;

export interface Pitfall extends Provenance {
  text: string;
}

export interface RevisionBlock extends Provenance {
  heading: string;
  lines: string[];
}

export interface Erratum {
  page: number;
  claim: string;
  correction: string;
}

export interface Coverage {
  item: string;
  status: CoverageStatus;
  topics: string[];
}

export interface Reference {
  group: string;
  title: string;
  url: string;
  page: number;
}

export interface ChapterBody {
  summary: string;
  highYield: string[];
  topics: Topic[];
  formulas: Formula[];
  complexity: ComplexityRow[];
  problemTypes: ProblemType[];
  questions: Question[];
  pitfalls: Pitfall[];
  revisionCard: RevisionBlock[];
  errata: Erratum[];
  syllabusCoverage: Coverage[];
  references: Reference[];
}

export interface TopicRef {
  id: string;
  title: string;
  frequency: Frequency;
  origin: Origin;
  beyondSyllabus?: true;
  lesson?: true;
}

export interface ChapterStats {
  topics: number;
  curatedTopics: number;
  beyondSyllabusTopics: number;
  formulas: number;
  complexity: number;
  problemTypes: number;
  questions: number;
  mcq: number;
  msq: number;
  nat: number;
  pitfalls: number;
  errata: number;
  references: number;
}

export interface ChapterMeta {
  id: string;
  title: string;
  ref: string;
  frequency: Frequency;
  weight: string;
  syllabusPages: [number, number];
  notesPages: [number, number];
  status: 'ready' | 'pending';
  summary?: string;
  stats?: ChapterStats;
  topicIndex: TopicRef[];
  memory: ChapterMemory;
}

/** What memory/ holds for a chapter; `mapped` counts the ledger questions that belong to it. */
export interface ChapterMemory {
  derivations: number;
  pyqs: number;
  skipped: number;
  papers: number;
  mapped: number;
}

export interface Subject {
  id: string;
  code: string;
  section: number;
  title: string;
  weight: string;
  chapters: ChapterMeta[];
  stats: Partial<ChapterStats> & { chapters: number; ready: number };
}

export interface SyllabusItem {
  id: string;
  section: string;
  chapter: string;
  text: string;
  new2027?: true;
  status: CoverageStatus | 'pending';
  topics: string[];
}

export interface StudyPlanPhase extends Provenance {
  id: string;
  title: string;
  span: string;
  share: number;
  goal: string;
  subjects: string[];
  weeks?: Record<string, string>;
  activities: string[];
}

export interface StudyPlan {
  phases: StudyPlanPhase[];
  priorityMatrix: (Provenance & { tier: Frequency; label: string; subjects: string[]; targetMarks: string })[];
  targetScore: Provenance & { text: string };
  timeSplit: { section: string; minutes: number }[];
  strategy: (Provenance & { text: string })[];
  traps: (Provenance & { text: string })[];
  textbooks: { subject: string; topic: string; book: string }[];
  resources: { title: string; url: string; note: string }[];
  errata: Erratum[];
}

export interface Exam {
  name: string;
  organizer: string;
  website: string;
  documents: Record<string, string>;
  syllabusPublished: string;
  syllabusAccessed: string;
  pattern: {
    durationHours: number;
    questions: number;
    marks: { total: number; generalAptitude: number; engineeringMathematics: number; core: number };
    generalAptitude: string;
    subjectQuestions: string;
    questionTypes: { type: string; rule: string }[];
    calculator: string;
    mode: string;
  };
  dates: {
    note: string;
    registrationRegularCloses: string;
    registrationLateFeeCloses: string;
    exam: string[];
    results: string;
  };
  changesFrom2026: string;
}

export interface CatalogErratum extends Erratum {
  subject: string | null;
  chapter: string | null;
}

export interface Catalog {
  title: string;
  source: { title: string; file: string; pages: number; target: string };
  exam: Exam;
  syllabus: { items: SyllabusItem[]; dropped: { chapter: string; text: string }[] };
  studyPlan: StudyPlan;
  stats: Record<string, number>;
  memory: MemoryStats;
  subjects: Subject[];
  errata: CatalogErratum[];
}

export interface MemoryStats {
  papers: number;
  /** All official papers the ledger will cover, oldest first. */
  paperIds: string[];
  ledgerQuestions: number;
  mapped: number;
  solved: number;
  derivations: number;
}

export interface Located {
  subject: string;
  chapter: string;
}

export type LocatedFormula = Formula & Located;
export type LocatedQuestion = Question & Located;

export interface RevisionSheet extends Located {
  title: string;
  highYield: string[];
  revisionCard: RevisionBlock[];
  pitfalls: Pitfall[];
  formulas: Pick<Formula, 'id' | 'name' | 'tex'>[];
  complexity: ComplexityRow[];
}

export type SearchKind = 'chapter' | 'topic' | 'formula' | 'problem' | 'question' | 'syllabus' | 'pyq' | 'derivation';

export interface SearchDoc {
  id: string;
  kind: SearchKind;
  title: string;
  text: string;
  subject: string | null;
  chapter: string;
  frequency?: Frequency;
  qtype?: QuestionType;
  marks?: 1 | 2;
  /** Where a PYQ was asked, e.g. "GATE CSE 2024 Set 1 · Q30". */
  label?: string;
  year?: number;
}

// ---------------------------------------------------------------- study memory (memory/)

export interface DerivationSection {
  id: string;
  title: string;
  topics: string[];
  /** Markdown with KaTeX, rendered at build time. */
  html: string;
}

export interface Derivations {
  title: string;
  intro: string;
  sections: DerivationSection[];
}

/** An official answer key (scripts/lib/pyq.mjs), tagged by how it is marked. */
export type AnswerKey =
  | { kind: 'mcq'; accepted: number[] }
  /** Each entry is one option set that scores; an official key can accept more than one. */
  | { kind: 'msq'; sets: number[][] }
  | { kind: 'nat'; ranges: [number, number][] }
  | { kind: 'mta' };

export type PaperSection = 'GA' | 'CS';

export interface SourceLink {
  label: string;
  url: string;
}

export interface PyqStep {
  title: string;
  body: string;
  tex?: string;
}

export interface PyqTrap {
  /** The wrong option this trap explains, when it explains one. */
  option?: number;
  text: string;
}

export const HINT_KINDS = ['guide', 'concept', 'principle', 'setup', 'partial'] as const;
export type HintKind = (typeof HINT_KINDS)[number];

/** One rung of the hint ladder; the kinds climb in order and never state the answer. */
export interface PyqHint {
  kind: HintKind;
  text: string;
  tex?: string;
}

/** A practice variation we generated: the same method on new numbers. Never an official question. */
export interface PyqVariation {
  stem: string;
  options?: [string, string, string, string];
  answer: number | number[];
  explanation: string;
}

export interface PyqSolution {
  steps: PyqStep[];
  /** Which concept applies, the clues that point to it, and the look-alike it is not. */
  recognize?: { concept: string; clues: string; contrast?: string };
  /** A check on the result: substitution, a boundary case or a second route. */
  check?: { body: string; tex?: string };
  shortcut: { body: string; tex?: string };
  traps: PyqTrap[];
}

interface PyqBase extends Located {
  id: string;
  paper: string;
  paperTitle: string;
  year: number;
  section: PaperSection;
  n: number;
  marks: 1 | 2;
  key: AnswerKey;
  topic: string;
  difficulty: Difficulty;
  stem: string;
  code?: { lang: string; text: string };
  table?: { headers: string[]; rows: string[][] };
  figure?: string;
  /** The paper's figure drawn as public/diagrams/pyq/<id>.svg. */
  diagram?: PyqDiagram;
  /** The worked picture behind the solution, public/diagrams/pyq/<id>-solution.svg. */
  solutionDiagram?: PyqDiagram;
  /** Why our answer differs from the official key, or why the key is marks-to-all. */
  keyNote?: string;
  hints?: PyqHint[];
  variation?: PyqVariation;
  solution: PyqSolution;
  sources: SourceLink[];
  /** The question's GATE Overflow page. */
  url: string;
}

export interface PyqDiagram {
  alt: string;
}

export interface McqPyq extends PyqBase {
  type: 'mcq';
  options: [string, string, string, string];
  answer: number;
}

export interface MsqPyq extends PyqBase {
  type: 'msq';
  options: [string, string, string, string];
  answer: number[];
}

export interface NatPyq extends PyqBase {
  type: 'nat';
  answer: number;
}

export type Pyq = McqPyq | MsqPyq | NatPyq;

export interface PyqIndexEntry extends Located {
  id: string;
  paper: string;
  year: number;
  section: PaperSection;
  n: number;
  type: QuestionType;
  marks: 1 | 2;
  topic: string;
  difficulty: Difficulty;
  /** The stem's opening, cut outside any $…$ span. */
  preview: string;
  disputed: boolean;
  mta: boolean;
  aids: { hints: boolean; recognize: boolean; check: boolean; variation: boolean; diagram: boolean };
}

export type PaperQuestionStatus = 'solved' | 'skipped' | 'open';

export interface PaperQuestion {
  id: string;
  paper: string;
  section: PaperSection;
  n: number;
  type: QuestionType;
  marks: 1 | 2;
  key: AnswerKey;
  chapter: string | null;
  subject: string | null;
  /** Why the question has no chapter, or which other chapter it touches. */
  note?: string;
  url: string;
  status: PaperQuestionStatus;
}

export interface Paper {
  id: string;
  title: string;
  year: number;
  set: number | null;
  sources: { key: SourceLink; paper?: SourceLink; index?: SourceLink };
  questions: PaperQuestion[];
}
