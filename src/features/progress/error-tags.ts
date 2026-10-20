/** Why an answer went wrong, as the learner tags it in the error log. Kept apart from the store so pure analytics can import it. */
export const ERROR_TAGS = ['prerequisite', 'concept', 'method', 'calculation', 'misread', 'units', 'time', 'guess'] as const;
export type ErrorTag = (typeof ERROR_TAGS)[number];

export const TAG_LABEL: Record<ErrorTag, string> = {
  prerequisite: 'Missing prerequisite',
  concept: 'Concept misunderstanding',
  method: 'Wrong method',
  calculation: 'Calculation or algebra',
  misread: 'Misread the question',
  units: 'Units or notation',
  time: 'Time management',
  guess: 'Guessing',
};
