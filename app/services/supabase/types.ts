// Database types that extend the existing app types with Supabase fields
import { Team, Epic, Quarter, TeamMember } from '@/app/types';

export interface DatabaseTeam extends Omit<Team, 'members'> {
  organization_id: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  settings: {
    bufferPercentage: number;
    oncallPerSprint: number;
    sprintsInQuarter: number;
    defaultWorkingDays: number;
  };
}

export interface DatabaseTeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  vacation_days: number;
  skills: string[];
  joined_at?: string;
}

export interface DatabaseEpic extends Epic {
  team_id: string;
  owner_id?: string;
  estimated_days?: number;
  actual_days?: number;
  parent_epic_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseQuarter extends Quarter {
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  display_order: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  organization_id?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}