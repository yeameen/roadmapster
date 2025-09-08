import { createClient } from '@/app/lib/supabase/client';
import { DatabaseTeam, DatabaseTeamMember } from './types';
import { Team, TeamMember } from '@/app/types';

export class TeamService {
  private supabase = createClient();

  async getTeam(teamId: string): Promise<Team | null> {
    const { data: teamData, error: teamError } = await this.supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError || !teamData) {
      console.error('Error fetching team:', teamError);
      return null;
    }

    // Get members from settings (MVP approach - no need for separate query)
    const members = teamData.settings?.members || [];

    // Transform database format to app format
    const team: Team = {
      id: teamData.id,
      name: teamData.name,
      quarterWorkingDays: teamData.settings?.defaultWorkingDays || 65,
      bufferPercentage: teamData.settings?.bufferPercentage || 0.2,
      oncallPerSprint: teamData.settings?.oncallPerSprint || 1,
      sprintsInQuarter: teamData.settings?.sprintsPerQuarter || 6,
      members: members.map((member: any) => ({
        id: member.id,
        name: member.name,
        vacationDays: member.vacationDays || 0,
        skills: member.skills || []
      }))
    };

    return team;
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    console.log('Fetching teams for user:', userId);
    
    // First get user's organization
    const { data: userProfile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
      
    if (profileError || !userProfile?.organization_id) {
      console.error('Error fetching user profile or no organization:', profileError);
      return [];
    }
    
    // Then get all teams in that organization
    const { data, error } = await this.supabase
      .from('teams')
      .select('*')
      .eq('organization_id', userProfile.organization_id);

    if (error) {
      console.error('Error fetching teams:', error.message || error);
      return [];
    }
    
    console.log('Teams data:', data);

    // Map the database format to our Team type
    const teams = (data || []).map((teamData: any) => ({
      id: teamData.id,
      name: teamData.name,
      quarterWorkingDays: teamData.settings?.defaultWorkingDays || 65,
      bufferPercentage: teamData.settings?.bufferPercentage || 0.2,
      oncallPerSprint: teamData.settings?.oncallPerSprint || 1,
      sprintsInQuarter: teamData.settings?.sprintsInQuarter || 6,
      members: teamData.settings?.members?.map((member: any) => ({
        id: member.id,
        name: member.name,
        vacationDays: member.vacationDays || 0,
        skills: member.skills || []
      })) || []
    }));

    return teams;
  }

  async createTeam(team: Omit<Team, 'id'>, userId: string): Promise<Team | null> {
    console.log('TeamService.createTeam called with:', { team, userId });
    
    // First, get user's organization
    const { data: userData, error: userError } = await this.supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
      return null;
    }
    
    if (!userData?.organization_id) {
      console.error('User must belong to an organization. User data:', userData);
      return null;
    }
    
    console.log('User organization_id:', userData.organization_id);

    // Prepare members data for storage in settings
    const membersData = team.members ? team.members.map(member => ({
      id: member.id,
      name: member.name,
      vacationDays: member.vacationDays || 0,
      skills: member.skills || []
    })) : [];

    // Create the team
    const { data: teamData, error: teamError } = await this.supabase
      .from('teams')
      .insert({
        name: team.name,
        organization_id: userData.organization_id,
        settings: {
          bufferPercentage: team.bufferPercentage,
          oncallPerSprint: team.oncallPerSprint,
          sprintsPerQuarter: team.sprintsInQuarter,
          defaultWorkingDays: team.quarterWorkingDays,
          members: membersData
        },
        created_by: userId
      })
      .select()
      .single();

    if (teamError || !teamData) {
      console.error('Error creating team:', teamError);
      // Check for duplicate team name error
      if (teamError && teamError.code === '23505' && teamError.message?.includes('teams_organization_id_name_key')) {
        throw new Error('A team with this name already exists in your organization. Please choose a different name.');
      }
      if (teamError) throw teamError;
      return null;
    }

    // Add creator as team owner
    const { error: memberError } = await this.supabase
      .from('team_members')
      .insert({
        team_id: teamData.id,
        user_id: userId,
        role: 'owner',
        vacation_days: 0,
        skills: []
      });

    if (memberError) {
      console.error('Error adding team owner:', JSON.stringify(memberError, null, 2));
      console.error('Team ID:', teamData.id);
      console.error('User ID:', userId);
      // Rollback team creation
      await this.supabase.from('teams').delete().eq('id', teamData.id);
      return null;
    }

    return this.getTeam(teamData.id);
  }

  async updateTeam(teamId: string, updates: Partial<Team>): Promise<Team | null> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) updateData.name = updates.name;
    
    if (updates.bufferPercentage !== undefined || 
        updates.oncallPerSprint !== undefined ||
        updates.sprintsInQuarter !== undefined ||
        updates.quarterWorkingDays !== undefined) {
      updateData.settings = {
        bufferPercentage: updates.bufferPercentage,
        oncallPerSprint: updates.oncallPerSprint,
        sprintsPerQuarter: updates.sprintsInQuarter,
        defaultWorkingDays: updates.quarterWorkingDays
      };
    }

    const { error } = await this.supabase
      .from('teams')
      .update(updateData)
      .eq('id', teamId);

    if (error) {
      console.error('Error updating team:', error);
      return null;
    }

    // Handle team members update if provided
    // For MVP, we store members as part of team settings
    if (updates.members) {
      const membersData = updates.members.map(member => ({
        id: member.id,
        name: member.name,
        vacationDays: member.vacationDays || 0,
        skills: member.skills || []
      }));

      // Get current settings to merge
      const { data: currentTeam } = await this.supabase
        .from('teams')
        .select('settings')
        .eq('id', teamId)
        .single();

      const mergedSettings = {
        ...(currentTeam?.settings || {}),
        ...(updateData.settings || {}),
        members: membersData
      };

      const { error: memberUpdateError } = await this.supabase
        .from('teams')
        .update({
          settings: mergedSettings
        })
        .eq('id', teamId);

      if (memberUpdateError) {
        console.error('Error updating team members:', memberUpdateError);
      }
    }

    return this.getTeam(teamId);
  }

  async updateTeamMember(
    teamId: string, 
    userId: string, 
    updates: Partial<TeamMember>
  ): Promise<boolean> {
    const updateData: any = {};
    
    if (updates.vacationDays !== undefined) {
      updateData.vacation_days = updates.vacationDays;
    }
    
    if (updates.skills !== undefined) {
      updateData.skills = updates.skills;
    }

    const { error } = await this.supabase
      .from('team_members')
      .update(updateData)
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating team member:', error);
      return false;
    }

    return true;
  }

  async addTeamMember(
    teamId: string, 
    userEmail: string, 
    role: 'admin' | 'member' | 'viewer' = 'member'
  ): Promise<boolean> {
    // Find user by email
    const { data: userData, error: userError } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      console.error('User not found:', userEmail);
      return false;
    }

    const { error } = await this.supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userData.id,
        role,
        vacation_days: 0,
        skills: []
      });

    if (error) {
      console.error('Error adding team member:', error);
      return false;
    }

    return true;
  }

  async removeTeamMember(teamId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing team member:', error);
      return false;
    }

    return true;
  }
}