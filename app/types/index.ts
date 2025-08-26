export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type EpicStatus = 'backlog' | 'planned' | 'in_progress' | 'completed';
export type QuarterStatus = 'planning' | 'active' | 'completed';

export interface TeamMember {
  id: string;
  name: string;
  vacationDays: number;
  skills?: string[];
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  quarterWorkingDays: number;
  bufferPercentage: number;
  oncallPerSprint: number;
  sprintsInQuarter: number;
}

export interface Epic {
  id: string;
  title: string;
  size: TShirtSize;
  priority: Priority;
  status: EpicStatus;
  description?: string;
  requiredSkills?: string[];
  dependencies?: string[];
  owner?: string;
  quarterId?: string; // ID of the quarter this epic is assigned to
  position?: number; // Position within the quarter for ordering
}

export interface Quarter {
  id: string;
  name: string;
  status: QuarterStatus;
  workingDays: number;
  startDate?: Date;
  endDate?: Date;
  teamId: string;
  isCollapsed?: boolean; // UI state for collapse/expand
}

export interface CapacityCalculation {
  individualCapacities: { memberId: string; capacity: number }[];
  totalTeamCapacity: number;
  oncallDeduction: number;
  capacityAfterOncall: number;
  bufferAmount: number;
  finalCapacity: number;
  usedCapacity: number;
  remainingCapacity: number;
  utilizationPercentage: number;
}

export const TSHIRT_SIZE_DAYS: Record<TShirtSize, number> = {
  XS: 5,
  S: 10,
  M: 20,
  L: 40,
  XL: 60,
};

export const TSHIRT_SIZE_COLORS: Record<TShirtSize, string> = {
  XS: '#60A5FA', // light blue
  S: '#FDE047', // yellow
  M: '#FB923C', // orange
  L: '#67E8F9', // cyan
  XL: '#C084FC', // purple
};