import { createClient } from '@/app/lib/supabase/client';
import { Quarter } from '@/app/types';
import { DatabaseQuarter } from './types';

export class QuarterService {
  private supabase = createClient();

  async getQuarters(teamId: string): Promise<Quarter[]> {
    const { data, error } = await this.supabase
      .from('quarters')
      .select('*')
      .eq('team_id', teamId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching quarters:', error);
      return [];
    }

    return data.map(this.transformQuarter);
  }

  async createQuarter(
    quarter: Omit<Quarter, 'id'>, 
    teamId: string, 
    userId: string
  ): Promise<Quarter | null> {
    // Get the max display order
    const { data: existingQuarters } = await this.supabase
      .from('quarters')
      .select('display_order')
      .eq('team_id', teamId)
      .order('display_order', { ascending: false })
      .limit(1);

    const maxOrder = existingQuarters?.[0]?.display_order ?? -1;

    const quarterData = {
      name: quarter.name,
      status: quarter.status,
      working_days: quarter.workingDays,
      start_date: quarter.startDate,
      end_date: quarter.endDate,
      team_id: teamId,
      is_collapsed: quarter.isCollapsed || false,
      display_order: maxOrder + 1,
      created_by: userId
    };

    const { data, error } = await this.supabase
      .from('quarters')
      .insert(quarterData)
      .select()
      .single();

    if (error) {
      console.error('Error creating quarter:', error);
      return null;
    }

    // Log to audit trail
    await this.logAudit(teamId, userId, 'CREATE', 'quarter', data.id, null, data);

    return this.transformQuarter(data);
  }

  async updateQuarter(
    quarterId: string, 
    updates: Partial<Quarter>, 
    userId: string
  ): Promise<Quarter | null> {
    // Get current quarter for audit log
    const { data: currentQuarter } = await this.supabase
      .from('quarters')
      .select('*')
      .eq('id', quarterId)
      .single();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map fields to snake_case
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.workingDays !== undefined) updateData.working_days = updates.workingDays;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.isCollapsed !== undefined) updateData.is_collapsed = updates.isCollapsed;

    const { data, error } = await this.supabase
      .from('quarters')
      .update(updateData)
      .eq('id', quarterId)
      .select()
      .single();

    if (error) {
      console.error('Error updating quarter:', error);
      return null;
    }

    // Log to audit trail
    if (currentQuarter) {
      await this.logAudit(data.team_id, userId, 'UPDATE', 'quarter', quarterId, currentQuarter, data);
    }

    return this.transformQuarter(data);
  }

  async deleteQuarter(quarterId: string, userId: string): Promise<boolean> {
    // Get quarter for audit log
    const { data: quarter } = await this.supabase
      .from('quarters')
      .select('*')
      .eq('id', quarterId)
      .single();

    // First, move all epics back to backlog
    await this.supabase
      .from('epics')
      .update({ 
        quarter_id: null, 
        status: 'backlog',
        position: null 
      })
      .eq('quarter_id', quarterId);

    const { error } = await this.supabase
      .from('quarters')
      .delete()
      .eq('id', quarterId);

    if (error) {
      console.error('Error deleting quarter:', error);
      return false;
    }

    // Log to audit trail
    if (quarter) {
      await this.logAudit(quarter.team_id, userId, 'DELETE', 'quarter', quarterId, quarter, null);
    }

    return true;
  }

  async startQuarter(quarterId: string, userId: string): Promise<Quarter | null> {
    // First, set any other active quarters to planning
    const { data: teamQuarter } = await this.supabase
      .from('quarters')
      .select('team_id')
      .eq('id', quarterId)
      .single();

    if (teamQuarter) {
      await this.supabase
        .from('quarters')
        .update({ status: 'planning' })
        .eq('team_id', teamQuarter.team_id)
        .eq('status', 'active');
    }

    return this.updateQuarter(quarterId, { status: 'active' }, userId);
  }

  async completeQuarter(quarterId: string, userId: string): Promise<Quarter | null> {
    // Update all planned epics to in_progress
    await this.supabase
      .from('epics')
      .update({ status: 'in_progress' })
      .eq('quarter_id', quarterId)
      .eq('status', 'planned');

    return this.updateQuarter(quarterId, { status: 'completed' }, userId);
  }

  private transformQuarter(dbQuarter: any): Quarter {
    return {
      id: dbQuarter.id,
      name: dbQuarter.name,
      status: dbQuarter.status,
      workingDays: dbQuarter.working_days,
      startDate: dbQuarter.start_date ? new Date(dbQuarter.start_date) : undefined,
      endDate: dbQuarter.end_date ? new Date(dbQuarter.end_date) : undefined,
      teamId: dbQuarter.team_id,
      isCollapsed: dbQuarter.is_collapsed || false
    };
  }

  private async logAudit(
    teamId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValues: any,
    newValues: any
  ): Promise<void> {
    await this.supabase
      .from('audit_logs')
      .insert({
        team_id: teamId,
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues
      });
  }
}