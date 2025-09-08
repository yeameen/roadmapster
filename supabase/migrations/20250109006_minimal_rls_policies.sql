-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;

DROP POLICY IF EXISTS "organizations_insert_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_update_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_delete_policy" ON organizations;

DROP POLICY IF EXISTS "teams_insert_policy" ON teams;
DROP POLICY IF EXISTS "teams_select_policy" ON teams;
DROP POLICY IF EXISTS "teams_update_policy" ON teams;
DROP POLICY IF EXISTS "teams_delete_policy" ON teams;

DROP POLICY IF EXISTS "team_members_insert_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_select_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_update_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_delete_policy" ON team_members;

-- Create minimal policies - authenticated users can do everything

-- User profiles - users can only manage their own profile
CREATE POLICY "user_profiles_policy" ON user_profiles
FOR ALL USING (auth.uid() = id);

-- Organizations - authenticated users can do everything
CREATE POLICY "organizations_policy" ON organizations
FOR ALL USING (auth.uid() IS NOT NULL);

-- Teams - authenticated users can do everything
CREATE POLICY "teams_policy" ON teams
FOR ALL USING (auth.uid() IS NOT NULL);

-- Team members - authenticated users can do everything
CREATE POLICY "team_members_policy" ON team_members
FOR ALL USING (auth.uid() IS NOT NULL);