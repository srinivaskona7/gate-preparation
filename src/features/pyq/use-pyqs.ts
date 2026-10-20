import { loadPyqs } from '@/content/catalog';
import { useAsync } from '@/lib/use-async';

/** A chapter's solved PYQs, newest paper first. */
export const useChapterPyqs = (chapterId: string) => useAsync(() => loadPyqs(chapterId), `pyqs:${chapterId}`);
