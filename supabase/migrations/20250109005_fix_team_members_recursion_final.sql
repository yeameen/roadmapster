-- Drop all existing policies on team_members to start fresh
DROP POLICY IF EXISTS "team_members_insert_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_select_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_update_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_delete_policy" ON team_members;

-- Create new non-recursive policies for team_members

-- Users can view team members if they belong to the same organization
CREATE POLICY "team_members_select_policy" ON team_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = team_members.team_id
    AND t.organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Users can insert team members if they are an owner/admin of a team in their organization
CREATE POLICY "team_members_insert_policy" ON team_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = team_members.team_id
    AND t.organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Users can update team members if they belong to the same organization
CREATE POLICY "team_members_update_policy" ON team_members
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = team_members.team_id
    AND t.organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Users can delete team members if they belong to the same organization
CREATE POLICY "team_members_delete_policy" ON team_members
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = team_members.team_id
    AND t.organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  )
);