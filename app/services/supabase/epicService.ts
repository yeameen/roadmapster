import { createClient } from '@/app/lib/supabase/client';
import { Epic, TSHIRT_SIZE_DAYS } from '@/app/types';
import { DatabaseEpic } from './types';

export class EpicService {
  private supabase = createClient();

  async getEpics(teamId: string): Promise<Epic[]> {
    const { data, error } = await this.supabase
      .from('epics')
      .select('*')
      .eq('team_id', teamId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching epics:', error);
      return [];
    }

    // Transform database format to app format
    return data.map(this.transformEpic);
  }

  async getEpicsByQuarter(quarterId: string): Promise<Epic[]> {
    const { data, error } = await this.supabase
      .from('epics')
      .select('*')
      .eq('quarter_id', quarterId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching epics by quarter:', error);
      return [];
    }

    return data.map(this.transformEpic);
  }

  async createEpic(epic: Omit<Epic, 'id'>, teamId: string, userId: string): Promise<Epic | null> {
    const epicData = {
      title: epic.title,
      size: epic.size,
      priority: epic.priority,
      status: epic.status,
      description: epic.description,
      required_skills: epic.requiredSkills || [],
      quarter_id: epic.quarterId,
      position: epic.position,
      team_id: teamId,
      created_by: userId,
      estimated_days: epic.size ? TSHIRT_SIZE_DAYS[epic.size] : undefined
    };

    const { data, error } = await this.supabase
      .from('epics')
      .insert(epicData)
      .select()
      .single();

    if (error) {
      console.error('Error creating epic:', error);
      return null;
    }

    // Log to audit trail
    await this.logAudit(teamId, userId, 'CREATE', 'epic', data.id, null, data);

    return this.transformEpic(data);
  }

  async updateEpic(epicId: string, updates: Partial<Epic>, userId: string): Promise<Epic | null> {
    // Get current epic for audit log
    const { data: currentEpic } = await this.supabase
      .from('epics')
      .select('*')
      .eq('id', epicId)
      .single();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map fields to snake_case
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.size !== undefined) updateData.size = updates.size;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.requiredSkills !== undefined) updateData.required_skills = updates.requiredSkills;
    if (updates.quarterId !== undefined) updateData.quarter_id = updates.quarterId;
    if (updates.position !== undefined) updateData.position = updates.position;
    if (updates.owner !== undefined) updateData.owner_id = updates.owner;

    if (updates.size) {
      updateData.estimated_days = TSHIRT_SIZE_DAYS[updates.size];
    }

    const { data, error } = await this.supabase
      .from('epics')
      .update(updateData)
      .eq('id', epicId)
      .select()
      .single();

    if (error) {
      console.error('Error updating epic:', error);
      return null;
    }

    // Log to audit trail
    if (currentEpic) {
      await this.logAudit(data.team_id, userId, 'UPDATE', 'epic', epicId, currentEpic, data);
    }

    return this.transformEpic(data);
  }

  async moveEpic(
    epicId: string, 
    targetQuarterId: string | null, 
    position: number,
    userId: string
  ): Promise<Epic | null> {
    // Get current epic for audit log
    const { data: currentEpic } = await this.supabase
      .from('epics')
      .select('*')
      .eq('id', epicId)
      .single();

    const updates = {
      quarter_id: targetQuarterId,
      position,
      status: targetQuarterId ? 'planned' : 'backlog',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('epics')
      .update(updates)
      .eq('id', epicId)
      .select()
      .single();

    if (error) {
      console.error('Error moving epic:', error);
      return null;
    }

    // Log to audit trail
    if (currentEpic) {
      await this.logAudit(
        data.team_id, 
        userId, 
        'MOVE', 
        'epic', 
        epicId, 
        { quarter_id: currentEpic.quarter_id, position: currentEpic.position },
        { quarter_id: targetQuarterId, position }
      );
    }

    return this.transformEpic(data);
  }

  async deleteEpic(epicId: string, userId: string): Promise<boolean> {
    // Get epic for audit log
    const { data: epic } = await this.supabase
      .from('epics')
      .select('*')
      .eq('id', epicId)
      .single();

    const { error } = await this.supabase
      .from('epics')
      .delete()
      .eq('id', epicId);

    if (error) {
      console.error('Error deleting epic:', error);
      return false;
    }

    // Log to audit trail
    if (epic) {
      await this.logAudit(epic.team_id, userId, 'DELETE', 'epic', epicId, epic, null);
    }

    return true;
  }

  async splitEpic(
    epicId: string, 
    splitData: { title: string; size: Epic['size']; quarterId?: string }[],
    userId: string
  ): Promise<Epic[]> {
    // Get parent epic
    const { data: parentEpic, error: parentError } = await this.supabase
      .from('epics')
      .select('*')
      .eq('id', epicId)
      .single();

    if (parentError || !parentEpic) {
      console.error('Parent epic not found');
      return [];
    }

    // Create child epics
    const childEpics = splitData.map(split => ({
      ...parentEpic,
      id: undefined,
      title: split.title,
      size: split.size,
      quarter_id: split.quarterId || null,
      parent_epic_id: epicId,
      estimated_days: TSHIRT_SIZE_DAYS[split.size],
      created_by: userId,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await this.supabase
      .from('epics')
      .insert(childEpics)
      .select();

    if (error) {
      console.error('Error splitting epic:', error);
      return [];
    }

    // Log to audit trail
    await this.logAudit(
      parentEpic.team_id, 
      userId, 
      'SPLIT', 
      'epic', 
      epicId, 
      null, 
      { parent_id: epicId, children: data.map(e => e.id) }
    );

    return data.map(this.transformEpic);
  }

  private transformEpic(dbEpic: any): Epic {
    return {
      id: dbEpic.id,
      title: dbEpic.title,
      size: dbEpic.size,
      priority: dbEpic.priority,
      status: dbEpic.status,
      description: dbEpic.description,
      requiredSkills: dbEpic.required_skills || [],
      dependencies: [], // Will be populated from epic_dependencies table
      owner: dbEpic.owner_id,
      quarterId: dbEpic.quarter_id,
      position: dbEpic.position
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