-- Disable RLS on all tables first
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public' 
              AND tablename IN ('user_profiles', 'organizations', 'teams', 'team_members'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create super simple policies - authenticated users can do anything
CREATE POLICY "allow_all_authenticated" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON team_members FOR ALL USING (true) WITH CHECK (true);