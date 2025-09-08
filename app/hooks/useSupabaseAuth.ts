'use client';

import { useEffect, useState } from 'react';
import { AuthService } from '@/app/services/supabase';
import { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authService = new AuthService();

    // Get initial user
    const getUser = async () => {
      try {
        const { user, error } = await authService.getUser();
        if (error) {
          setError(error.message);
        } else {
          setUser(user);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const authService = new AuthService();
    const { error } = await authService.signOut();
    if (error) {
      setError(error.message);
    }
  };

  return { user, loading, error, signOut };
}