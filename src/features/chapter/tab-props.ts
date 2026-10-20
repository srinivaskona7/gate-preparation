import type { ChapterEntry } from '@/content/catalog';
import type { ChapterBody } from '@/content/types';

/** What every chapter tab receives: the chapter, its loaded body and the deep-linked item id. */
export interface TabProps {
  chapter: ChapterEntry;
  body: ChapterBody;
  item?: string;
}
