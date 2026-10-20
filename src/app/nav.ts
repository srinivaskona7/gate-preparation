import {
  Binary,
  BookOpen,
  CalendarRange,
  ChartColumn,
  CircleAlert,
  CodeXml,
  Cpu,
  Database,
  FileCode,
  FileText,
  Layers,
  LayoutDashboard,
  Library,
  ListChecks,
  type LucideIcon,
  Network,
  Puzzle,
  Repeat,
  ScrollText,
  Shapes,
  Sigma,
  Timer,
  SquareFunction,
  Waypoints,
  Workflow,
} from 'lucide-react';
import { create } from 'zustand';

/** Shell state that several distant components open and close. */
interface UiState {
  paletteOpen: boolean;
  navOpen: boolean;
  setPalette: (open: boolean) => void;
  setNav: (open: boolean) => void;
}

export const useUi = create<UiState>()((set) => ({
  paletteOpen: false,
  navOpen: false,
  setPalette: (paletteOpen) => set({ paletteOpen }),
  setNav: (navOpen) => set({ navOpen }),
}));

export const SUBJECT_ICON: Record<string, LucideIcon> = {
  GA: Puzzle,
  EM: Sigma,
  DL: Binary,
  COA: Cpu,
  PDS: CodeXml,
  ALGO: Workflow,
  TOC: Waypoints,
  CD: FileCode,
  OS: Layers,
  DBMS: Database,
  CN: Network,
};

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/pyqs', label: 'PYQ solver', icon: ListChecks },
  { to: '/papers', label: 'Official papers', icon: Library },
  { to: '/practice', label: 'Practice & mocks', icon: BookOpen },
  { to: '/mock', label: 'Full mock paper', icon: Timer },
  { to: '/review', label: 'Review deck', icon: Repeat },
  { to: '/errors', label: 'Error log', icon: CircleAlert },
  { to: '/coverage', label: 'Coverage ledger', icon: ListChecks },
  { to: '/decade', label: 'Decade view', icon: CalendarRange },
  { to: '/insights', label: 'Insights', icon: ChartColumn },
  { to: '/formulas', label: 'Formula cards', icon: SquareFunction },
  { to: '/revision', label: 'Cheat sheets', icon: ScrollText },
  { to: '/syllabus', label: '2027 syllabus', icon: FileText },
  { to: '/visuals', label: 'Visual lab', icon: Shapes },
];
