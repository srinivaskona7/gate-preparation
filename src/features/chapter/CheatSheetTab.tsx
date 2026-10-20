import { CheatSheet } from '@/features/revision/CheatSheet';
import type { TabProps } from './tab-props';

export function CheatSheetTab({ chapter, body }: TabProps) {
  return <CheatSheet sheet={{ ...body, title: chapter.title }} chapterId={chapter.id} />;
}
