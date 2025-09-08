-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view all user profiles in their organization" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their own organization" ON organizations;

-- Create fixed policies without recursion

-- Organizations policies (simplified to avoid recursion)
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.organization_id = organizations.id
    )
  );

CREATE POLICY "Users can update their organization"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.organization_id = organizations.id
    )
  );

-- User profiles policies (simplified to avoid recursion)
CREATE POLICY "Users can view profiles in their organization"
  ON user_profiles FOR SELECT
  USING (
    id = auth.uid() OR
    organization_id = (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid() LIMIT 1
    )
  );