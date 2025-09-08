'use client';

import { useEffect, useState } from 'react';
import { TeamService } from '@/app/services/supabase';
import { Team } from '@/app/types';
import { createClient } from '@/app/lib/supabase/client';

export function useTeam(teamId: string | null) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const teamService = new TeamService();
    const supabase = createClient();

    // Fetch initial team data
    const fetchTeam = async () => {
      try {
        const teamData = await teamService.getTeam(teamId);
        setTeam(teamData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`team:${teamId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'teams', filter: `id=eq.${teamId}` },
        () => {
          fetchTeam(); // Refetch on changes
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'team_members', filter: `team_id=eq.${teamId}` },
        () => {
          fetchTeam(); // Refetch on member changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [teamId]);

  const updateTeam = async (updates: Partial<Team>) => {
    if (!teamId) return;
    
    const teamService = new TeamService();
    try {
      const updatedTeam = await teamService.updateTeam(teamId, updates);
      if (updatedTeam) {
        setTeam(updatedTeam);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { team, loading, error, updateTeam };
}