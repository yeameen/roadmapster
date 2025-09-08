-- Drop ALL existing team_members policies to start fresh
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of teams they belong to" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Team owners can insert team members" ON team_members;
DROP POLICY IF EXISTS "Team owners can update team members" ON team_members;
DROP POLICY IF EXISTS "Team owners can delete team members" ON team_members;

-- Create clean, non-recursive policies for team_members

-- SELECT: Allow users to view team members of teams in their organization
CREATE POLICY "Users can view team members in their org"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT t.id FROM teams t
      WHERE t.organization_id IN (
        SELECT organization_id FROM user_profiles
        WHERE id = auth.uid()
      )
    )
  );

-- INSERT: Team owners can add members, or allow first member (team creation)
CREATE POLICY "Team owners can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    -- Allow if user is owner of the team (check existing records)
    EXISTS (
      SELECT 1 FROM team_members existing
      WHERE existing.team_id = team_members.team_id
      AND existing.user_id = auth.uid()
      AND existing.role = 'owner'
    )
    OR
    -- Allow if this is the first member (team creation)
    NOT EXISTS (
      SELECT 1 FROM team_members existing
      WHERE existing.team_id = team_members.team_id
    )
  );

-- UPDATE: Team owners can update team members
CREATE POLICY "Team owners can update members"
  ON team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
  );

-- DELETE: Team owners can remove team members
CREATE POLICY "Team owners can remove members"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
  );