-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table (for multi-tenancy)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  organization_id UUID REFERENCES organizations(id),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{
    "bufferPercentage": 0.2,
    "oncallPerSprint": 1,
    "sprintsPerQuarter": 6,
    "defaultWorkingDays": 65
  }',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  vacation_days INTEGER DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Quarters
CREATE TABLE quarters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('planning', 'active', 'completed')) DEFAULT 'planning',
  working_days INTEGER NOT NULL DEFAULT 65,
  start_date DATE,
  end_date DATE,
  is_collapsed BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- Epics
CREATE TABLE epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  size TEXT CHECK (size IN ('XS', 'S', 'M', 'L', 'XL')) NOT NULL,
  priority TEXT CHECK (priority IN ('P0', 'P1', 'P2', 'P3')) NOT NULL,
  status TEXT CHECK (status IN ('backlog', 'planned', 'in_progress', 'completed')) DEFAULT 'backlog',
  quarter_id UUID REFERENCES quarters(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  owner_id UUID REFERENCES user_profiles(id),
  required_skills TEXT[] DEFAULT '{}',
  estimated_days INTEGER,
  actual_days INTEGER,
  parent_epic_id UUID REFERENCES epics(id),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Epic Dependencies
CREATE TABLE epic_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID REFERENCES epics(id) ON DELETE CASCADE,
  depends_on_epic_id UUID REFERENCES epics(id) ON DELETE CASCADE,
  dependency_type TEXT CHECK (dependency_type IN ('blocks', 'relates_to', 'duplicates')) DEFAULT 'blocks',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(epic_id, depends_on_epic_id)
);

-- Epic Comments
CREATE TABLE epic_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID REFERENCES epics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  content TEXT NOT NULL,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quarter Templates
CREATE TABLE quarter_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_epics_team_quarter ON epics(team_id, quarter_id);
CREATE INDEX idx_epics_status ON epics(status);
CREATE INDEX idx_audit_logs_team_entity ON audit_logs(team_id, entity_type, entity_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_quarters_team ON quarters(team_id);
CREATE INDEX idx_epic_comments_epic ON epic_comments(epic_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quarters_updated_at BEFORE UPDATE ON quarters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_epics_updated_at BEFORE UPDATE ON epics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quarter_templates_updated_at BEFORE UPDATE ON quarter_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();