-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

-- Organizations policies (simple, no recursion)
CREATE POLICY "Users can view organizations"
  ON organizations FOR SELECT
  USING (true);  -- Allow all users to view organizations for now

CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);  -- Allow all authenticated users to create orgs

CREATE POLICY "Users can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

-- User profiles policies (avoid self-reference)
CREATE POLICY "Users can view any profile"
  ON user_profiles FOR SELECT
  USING (true);  -- Temporarily allow viewing all profiles to avoid recursion

CREATE POLICY "Users can create their profile"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());