'use client';

import { useEffect, useState } from 'react';
import { EpicService } from '@/app/services/supabase';
import { Epic } from '@/app/types';
import { createClient } from '@/app/lib/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export function useEpics(teamId: string | null) {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const epicService = new EpicService();
    const supabase = createClient();

    // Fetch initial epics
    const fetchEpics = async () => {
      try {
        const epicsData = await epicService.getEpics(teamId);
        setEpics(epicsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEpics();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`epics:${teamId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'epics', filter: `team_id=eq.${teamId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEpics(prev => [...prev, payload.new as Epic]);
          } else if (payload.eventType === 'UPDATE') {
            setEpics(prev => prev.map(e => 
              e.id === payload.new.id ? payload.new as Epic : e
            ));
          } else if (payload.eventType === 'DELETE') {
            setEpics(prev => prev.filter(e => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [teamId]);

  const createEpic = async (epic: Omit<Epic, 'id'>) => {
    if (!teamId || !user) return null;
    
    const epicService = new EpicService();
    try {
      const newEpic = await epicService.createEpic(epic, teamId, user.id);
      if (newEpic) {
        setEpics(prev => [...prev, newEpic]);
      }
      return newEpic;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateEpic = async (epicId: string, updates: Partial<Epic>) => {
    if (!user) return null;
    
    const epicService = new EpicService();
    try {
      const updatedEpic = await epicService.updateEpic(epicId, updates, user.id);
      if (updatedEpic) {
        setEpics(prev => prev.map(e => 
          e.id === epicId ? updatedEpic : e
        ));
      }
      return updatedEpic;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const moveEpic = async (epicId: string, targetQuarterId: string | null, position: number) => {
    if (!user) return null;
    
    const epicService = new EpicService();
    try {
      const movedEpic = await epicService.moveEpic(epicId, targetQuarterId, position, user.id);
      if (movedEpic) {
        setEpics(prev => prev.map(e => 
          e.id === epicId ? movedEpic : e
        ));
      }
      return movedEpic;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteEpic = async (epicId: string) => {
    if (!user) return false;
    
    const epicService = new EpicService();
    try {
      const success = await epicService.deleteEpic(epicId, user.id);
      if (success) {
        setEpics(prev => prev.filter(e => e.id !== epicId));
      }
      return success;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return { 
    epics, 
    loading, 
    error, 
    createEpic, 
    updateEpic, 
    moveEpic, 
    deleteEpic 
  };
}