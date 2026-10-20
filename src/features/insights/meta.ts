import { loadPyqIndex, loadQuestions } from '@/content/catalog';
import type { QuestionMeta } from './analytics';

/** Chapter and topic for every practice question and solved PYQ, the join key for the learner's history. */
export async function loadQuestionMeta(): Promise<QuestionMeta[]> {
  const [practice, pyqs] = await Promise.all([loadQuestions(), loadPyqIndex()]);
  return [...practice, ...pyqs].map(({ id, chapter, topic }) => ({ id, chapter, topic }));
}
