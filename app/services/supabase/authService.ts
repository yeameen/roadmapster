import { createClient } from '@/app/lib/supabase/client';
import { UserProfile, Organization } from './types';

export class AuthService {
  private supabase;

  constructor() {
    try {
      this.supabase = createClient();
      console.log('Supabase client created successfully');
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      throw err;
    }
  }

  async signInWithGoogle() {
    try {
      console.log('Starting Google OAuth sign-in...');
      console.log('Redirect URL:', `${window.location.origin}/auth/callback`);
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        return { error };
      }

      console.log('Google OAuth initiated successfully');
      return { data };
    } catch (err) {
      console.error('Unexpected error in signInWithGoogle:', err);
      return { error: err as Error };
    }
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return { error };
    }
    return { error: null };
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in with email:', error);
      return { error };
    }

    if (data?.user) {
      // Check if user profile exists
      const profile = await this.getUserProfile(data.user.id);
      if (!profile) {
        // Create profile for email/password users
        await this.createUserProfile(data.user, null);
      }
    }

    return { data };
  }

  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error signing up with email:', error);
      return { error };
    }

    if (data?.user) {
      // Create profile for new user
      await this.createUserProfile(data.user, null);
    }

    return { data };
  }

  async getUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    
    if (error || !user) {
      return { user: null, error };
    }

    // Get or create user profile
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Create user profile if it doesn't exist
      await this.createUserProfile(user);
    }

    return { user, error: null };
  }

  async createUserProfile(user: any, providedOrgId?: string | null): Promise<UserProfile | null> {
    // Extract domain from email for organization matching
    const emailDomain = user.email?.split('@')[1];
    
    // Use provided organization ID or try to find/create one
    let organizationId = providedOrgId || null;
    if (!organizationId && emailDomain) {
      const { data: org } = await this.supabase
        .from('organizations')
        .select('id')
        .eq('domain', emailDomain)
        .single();
      
      if (org) {
        organizationId = org.id;
      } else {
        // Create new organization for this domain
        const { data: newOrg } = await this.supabase
          .from('organizations')
          .insert({
            name: emailDomain,
            domain: emailDomain,
            settings: {}
          })
          .select()
          .single();
        
        if (newOrg) {
          organizationId = newOrg.id;
        }
      }
    }

    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        organization_id: organizationId,
        preferences: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*, organizations(*)')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  async updateUserProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}