import type { ComponentType } from 'react';
import { createHashRouter } from 'react-router';
import { AppShell } from './AppShell';
import { NotFound, PageLoading, RouteError } from './RouteStates';

/** Each page is its own chunk; `pick` names the component the module exports. */
const page =
  <M,>(load: () => Promise<M>, pick: (m: M) => ComponentType) =>
  async () => ({ Component: pick(await load()) });

// Hash routing: GitHub Pages serves one index.html and cannot rewrite deep links.
export const router = createHashRouter([
  {
    path: '/',
    Component: AppShell,
    ErrorBoundary: RouteError,
    HydrateFallback: PageLoading,
    children: [
      {
        // A failing page keeps the sidebar and top bar around it.
        ErrorBoundary: RouteError,
        children: [
          { index: true, lazy: page(() => import('@/features/dashboard/DashboardPage'), (m) => m.DashboardPage) },
          { path: 'subject/:subjectId', lazy: page(() => import('@/features/subject/SubjectPage'), (m) => m.SubjectPage) },
          { path: 'chapter/:chapterId/:tab?/:item?', lazy: page(() => import('@/features/chapter/ChapterPage'), (m) => m.ChapterPage) },
          { path: 'pyqs/:pyqId?', lazy: page(() => import('@/features/pyq/PyqsPage'), (m) => m.PyqsPage) },
          { path: 'papers', lazy: page(() => import('@/features/papers/PapersPage'), (m) => m.PapersPage) },
          { path: 'papers/:paperId/:pyqId?', lazy: page(() => import('@/features/papers/PaperPage'), (m) => m.PaperPage) },
          { path: 'practice', lazy: page(() => import('@/features/quiz/PracticePage'), (m) => m.PracticePage) },
          { path: 'practice/quiz', lazy: page(() => import('@/features/quiz/QuizPage'), (m) => m.QuizPage) },
          { path: 'review', lazy: page(() => import('@/features/review/ReviewPage'), (m) => m.ReviewPage) },
          { path: 'mock', lazy: page(() => import('@/features/mock/MockPage'), (m) => m.MockPage) },
          { path: 'coverage', lazy: page(() => import('@/features/coverage/CoveragePage'), (m) => m.CoveragePage) },
          { path: 'decade', lazy: page(() => import('@/features/decade/DecadePage'), (m) => m.DecadePage) },
          { path: 'insights', lazy: page(() => import('@/features/insights/InsightsPage'), (m) => m.InsightsPage) },
          { path: 'errors', lazy: page(() => import('@/features/insights/ErrorLogPage'), (m) => m.ErrorLogPage) },
          { path: 'formulas', lazy: page(() => import('@/features/formulas/FormulasPage'), (m) => m.FormulasPage) },
          { path: 'revision', lazy: page(() => import('@/features/revision/RevisionPage'), (m) => m.RevisionPage) },
          { path: 'syllabus/:itemId?', lazy: page(() => import('@/features/syllabus/SyllabusPage'), (m) => m.SyllabusPage) },
          { path: 'visuals/:visualId?', lazy: page(() => import('@/features/visuals/VisualsPage'), (m) => m.VisualsPage) },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
]);
