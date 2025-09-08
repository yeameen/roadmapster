'use client';

import { useEffect, useState } from 'react';
import { TeamService } from '@/app/services/supabase';
import { Team } from '@/app/types';
import { createClient } from '@/app/lib/supabase/client';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const teamService = new TeamService();
    const supabase = createClient();

    // Fetch user's teams
    const fetchTeams = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const userTeams = await teamService.getUserTeams(user.id);
        setTeams(userTeams);
        
        // Select first team by default
        if (userTeams.length > 0 && !selectedTeam) {
          setSelectedTeam(userTeams[0]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('teams')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'teams' },
        () => {
          fetchTeams(); // Refetch on changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const createTeam = async (team: Partial<Team>) => {
    console.log('Creating team:', team);
    const teamService = new TeamService();
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, check if user has an organization
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      let organizationId = userProfile?.organization_id;

      // If no organization, create one
      if (!organizationId) {
        console.log('Creating organization for user');
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: `${user.email?.split('@')[0]}'s Organization`,
            settings: {}
          })
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          throw orgError;
        }
        console.log('Created organization:', org);
        organizationId = org.id;

        // Update user profile with organization
        await supabase
          .from('user_profiles')
          .update({ organization_id: organizationId })
          .eq('id', user.id);
      }

      // Create the team
      console.log('Creating team with organization_id:', organizationId);
      const newTeam = await teamService.createTeam({
        ...team,
        organization_id: organizationId,
      } as Omit<Team, 'id'>, user.id);

      console.log('Team created:', newTeam);
      if (newTeam) {
        setTeams([...teams, newTeam]);
        setSelectedTeam(newTeam);
      }

      return newTeam;
    } catch (err: any) {
      console.error('Error in createTeam:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    const teamService = new TeamService();
    try {
      const updatedTeam = await teamService.updateTeam(teamId, updates);
      if (updatedTeam) {
        setTeams(teams.map(t => t.id === teamId ? updatedTeam : t));
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(updatedTeam);
        }
      }
      return updatedTeam;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const selectTeam = (team: Team) => {
    setSelectedTeam(team);
  };

  return { 
    teams, 
    selectedTeam, 
    loading, 
    error, 
    createTeam, 
    updateTeam,
    selectTeam 
  };
}