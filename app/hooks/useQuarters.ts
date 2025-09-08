'use client';

import { useEffect, useState } from 'react';
import { QuarterService } from '@/app/services/supabase';
import { Quarter } from '@/app/types';
import { createClient } from '@/app/lib/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export function useQuarters(teamId: string | null) {
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const quarterService = new QuarterService();
    const supabase = createClient();

    // Fetch initial quarters
    const fetchQuarters = async () => {
      try {
        const quartersData = await quarterService.getQuarters(teamId);
        setQuarters(quartersData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuarters();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`quarters:${teamId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quarters', filter: `team_id=eq.${teamId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setQuarters(prev => [...prev, payload.new as Quarter]);
          } else if (payload.eventType === 'UPDATE') {
            setQuarters(prev => prev.map(q => 
              q.id === payload.new.id ? payload.new as Quarter : q
            ));
          } else if (payload.eventType === 'DELETE') {
            setQuarters(prev => prev.filter(q => q.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [teamId]);

  const createQuarter = async (quarter: Omit<Quarter, 'id'>) => {
    if (!teamId || !user) return null;
    
    const quarterService = new QuarterService();
    try {
      const newQuarter = await quarterService.createQuarter(quarter, teamId, user.id);
      if (newQuarter) {
        setQuarters(prev => [...prev, newQuarter]);
      }
      return newQuarter;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateQuarter = async (quarterId: string, updates: Partial<Quarter>) => {
    if (!user) return null;
    
    const quarterService = new QuarterService();
    try {
      const updatedQuarter = await quarterService.updateQuarter(quarterId, updates, user.id);
      if (updatedQuarter) {
        setQuarters(prev => prev.map(q => 
          q.id === quarterId ? updatedQuarter : q
        ));
      }
      return updatedQuarter;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteQuarter = async (quarterId: string) => {
    if (!user) return false;
    
    const quarterService = new QuarterService();
    try {
      const success = await quarterService.deleteQuarter(quarterId, user.id);
      if (success) {
        setQuarters(prev => prev.filter(q => q.id !== quarterId));
      }
      return success;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const startQuarter = async (quarterId: string) => {
    if (!user) return null;
    
    const quarterService = new QuarterService();
    try {
      const updatedQuarter = await quarterService.startQuarter(quarterId, user.id);
      if (updatedQuarter) {
        // Update all quarters since starting one affects others
        const quartersData = await quarterService.getQuarters(teamId!);
        setQuarters(quartersData);
      }
      return updatedQuarter;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const completeQuarter = async (quarterId: string) => {
    if (!user) return null;
    
    const quarterService = new QuarterService();
    try {
      const updatedQuarter = await quarterService.completeQuarter(quarterId, user.id);
      if (updatedQuarter) {
        setQuarters(prev => prev.map(q => 
          q.id === quarterId ? updatedQuarter : q
        ));
      }
      return updatedQuarter;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  return { 
    quarters, 
    loading, 
    error, 
    createQuarter, 
    updateQuarter, 
    deleteQuarter,
    startQuarter,
    completeQuarter
  };
}