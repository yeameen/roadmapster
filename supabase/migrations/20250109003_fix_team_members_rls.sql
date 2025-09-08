-- Drop existing team_members policies that cause recursion
DROP POLICY IF EXISTS "Users can view team members of teams they belong to" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage team members" ON team_members;

-- Create simpler team_members policies without recursion
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  USING (true);  -- Temporarily allow viewing all team members

CREATE POLICY "Team owners can insert team members"
  ON team_members FOR INSERT
  WITH CHECK (
    -- Allow if user is owner of the team
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
    OR
    -- Allow if this is the first member (team creation)
    NOT EXISTS (
      SELECT 1 FROM team_members tm2
      WHERE tm2.team_id = team_members.team_id
    )
  );

CREATE POLICY "Team owners can update team members"
  ON team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
  );

CREATE POLICY "Team owners can delete team members"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
  );