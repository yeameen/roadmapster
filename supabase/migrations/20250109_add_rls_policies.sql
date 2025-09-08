-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE epic_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE epic_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sprint_templates ENABLE ROW LEVEL SECURITY; -- Table doesn't exist yet
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations policies (check if they don't exist first)
-- Note: These might have been created by earlier migrations

-- User profiles policies (these are likely created by earlier migrations)
-- Skip if already exist

-- Teams policies
CREATE POLICY "Users can view teams in their organization"
  ON teams FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams in their organization"
  ON teams FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team members can update their team"
  ON teams FOR UPDATE
  USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can delete their team"
  ON teams FOR DELETE
  USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Team members policies
CREATE POLICY "Users can view team members of teams they belong to"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage team members"
  ON team_members FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Quarters policies
CREATE POLICY "Team members can view quarters"
  ON quarters FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create quarters"
  ON quarters FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update quarters"
  ON quarters FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can delete quarters"
  ON quarters FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Epics policies
CREATE POLICY "Team members can view epics"
  ON epics FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create epics"
  ON epics FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update epics"
  ON epics FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can delete epics"
  ON epics FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Epic dependencies policies
CREATE POLICY "Team members can view epic dependencies"
  ON epic_dependencies FOR SELECT
  USING (
    epic_id IN (
      SELECT id FROM epics WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Team members can manage epic dependencies"
  ON epic_dependencies FOR ALL
  USING (
    epic_id IN (
      SELECT id FROM epics WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Epic comments policies
CREATE POLICY "Team members can view epic comments"
  ON epic_comments FOR SELECT
  USING (
    epic_id IN (
      SELECT id FROM epics WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create epic comments"
  ON epic_comments FOR INSERT
  WITH CHECK (
    epic_id IN (
      SELECT id FROM epics WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON epic_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON epic_comments FOR DELETE
  USING (user_id = auth.uid());

-- Sprint templates policies (table doesn't exist yet)
-- Commented out until sprint_templates table is created

-- Audit logs policies
CREATE POLICY "Team members can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);