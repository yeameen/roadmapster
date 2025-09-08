# Roadmapster V2 Implementation Specification

## Document Purpose
This document serves as the implementation guide and progress tracker for Roadmapster V2. It details the technical specifications, implementation plan, and tracks completion status for each feature.

**Document Status**: Living Document  
**Last Updated**: January 2025  
**Version**: 2.0.0

---

## 1. Executive Summary

### Current State (V1 - Completed)
Roadmapster V1 is a fully functional MVP with:
- ✅ React/Next.js single-page application
- ✅ LocalStorage persistence
- ✅ Drag-and-drop epic management
- ✅ Multi-quarter planning with collapsible views
- ✅ Real-time capacity calculations
- ✅ Export/import functionality

### Target State (V2)
Transform Roadmapster into a multi-user, collaborative platform with:
- Cloud-based persistence via Supabase
- Google Workspace authentication
- Multi-team support with isolation
- Historical tracking and audit logs
- Advanced epic management features
- Real-time collaboration

---

## 2. Technology Stack

### Frontend (Existing)
- **Framework**: Next.js 15.5.0 with App Router
- **UI Library**: React 19.1.1 with TypeScript
- **Drag & Drop**: @dnd-kit/core and @dnd-kit/sortable
- **Icons**: Lucide React
- **Styling**: CSS3 with modern layouts

### Backend (New for V2)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Real-time**: Supabase Realtime subscriptions
- **File Storage**: Supabase Storage
- **API**: Next.js Route Handlers with Supabase Client

### Infrastructure
- **Hosting**: Vercel (Frontend + API)
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics

---

## 3. Database Schema

### 3.1 Core Tables

```sql
-- Organizations (for multi-tenancy)
organizations (
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name: text NOT NULL,
  domain: text UNIQUE, -- e.g., 'company.com'
  settings: jsonb DEFAULT '{}',
  created_at: timestamptz DEFAULT now(),
  updated_at: timestamptz DEFAULT now()
)

-- Users (from Supabase Auth, extended profile)
user_profiles (
  id: uuid PRIMARY KEY REFERENCES auth.users(id),
  email: text UNIQUE NOT NULL,
  full_name: text,
  avatar_url: text,
  organization_id: uuid REFERENCES organizations(id),
  preferences: jsonb DEFAULT '{}',
  created_at: timestamptz DEFAULT now(),
  updated_at: timestamptz DEFAULT now()
)

-- Teams
teams (
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id: uuid REFERENCES organizations(id) NOT NULL,
  name: text NOT NULL,
  description: text,
  settings: jsonb DEFAULT '{
    "bufferPercentage": 0.2,
    "oncallPerSprint": 1,
    "sprintsPerQuarter": 6,
    "defaultWorkingDays": 65
  }',
  created_by: uuid REFERENCES user_profiles(id),
  created_at: timestamptz DEFAULT now(),
  updated_at: timestamptz DEFAULT now(),
  UNIQUE(organization_id, name)
)

-- Team Members
team_members (
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id: uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id: uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  role: text CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  vacation_days: integer DEFAULT 0,
  skills: text[] DEFAULT '{}',
  joined_at: timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
)

-- Quarters
quarters (
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id: uuid REFERENCES teams(id) ON DELETE CASCADE,
  name: text NOT NULL,
  status: text CHECK (status IN ('planning', 'active', 'completed')) DEFAULT 'planning',
  working_days: integer NOT NULL DEFAULT 65,
  start_date: date,
  end_date: date,
  is_collapsed: boolean DEFAULT false,
  display_order: integer NOT NULL DEFAULT 0,
  created_by: uuid REFERENCES user_profiles(id),
  created_at: timestamptz DEFAULT now(),
  updated_at: timestamptz DEFAULT now(),
  UNIQUE(team_id, name)
)

-- Epics
epics (
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id: uuid REFERENCES teams(id) ON DELETE CASCADE,
  title: text NOT NULL,
  description: text,
  size: text CHECK (size IN ('XS', 'S', 'M', 'L', 'XL')) NOT NULL,
  priority: text CHECK (priority IN ('P0', 'P1', 'P2', 'P3')) NOT NULL,
  status: text CHECK (status IN ('backlog', 'planned', 'in_progress', 'completed')) DEFAULT 'backlog',
  quarter_id: uuid REFERENCES quarters(id) ON DELETE SET NULL,
  position: integer DEFAULT 0,
  owner_id: uuid REFERENCES user_profiles(id),
  required_skills: text[] DEFAULT '{}',
  estimated_days: integer,
  actual_days: integer,
  parent_epic_id: uuid REFERENCES epics(id), -- For split epics
  created_by: uuid REFERENCES user_profiles(id),
  created_at: timestamptz DEFAULT now(),
  updated_at: timestamptz DEFAULT now()
)

-- Epic Dependencies
epic_dependencies (
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id: uuid REFERENCES epics(id) ON DELETE CASCADE,
  depends_on_epic_id: uuid REFERENCES epics(id) ON DELETE CASCADE,
  dependency_type: text CHECK (dependency_type IN ('blocks', 'relates_to', 'duplicates')),
  created_by: uuid REFERENCES user_profiles(id),
  created_at: timestamptz DEFAULT now(),
  UNIQUE(epic_id, depends_on_epic_id)
)

-- Epic Comments
epic_comments (
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id: uuid REFERENCES epics(id) ON DELETE CASCADE,
  user_id: uuid REFERENCES user_profiles(id),
  content: text NOT NULL,
  edited_at: timestamptz,
  created_at: timestamptz DEFAULT now()
)

-- Quarter Templates
quarter_templates (
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id: uuid REFERENCES teams(id) ON DELETE CASCADE,
  name: text NOT NULL,
  description: text,
  template_data: jsonb NOT NULL, -- Stores epic templates, settings, etc.
  is_shared: boolean DEFAULT false,
  created_by: uuid REFERENCES user_profiles(id),
  created_at: timestamptz DEFAULT now(),
  updated_at: timestamptz DEFAULT now()
)

-- Audit Log
audit_logs (
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id: uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id: uuid REFERENCES user_profiles(id),
  action: text NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'MOVE', etc.
  entity_type: text NOT NULL, -- 'epic', 'quarter', 'team', etc.
  entity_id: uuid,
  old_values: jsonb,
  new_values: jsonb,
  metadata: jsonb, -- Additional context
  created_at: timestamptz DEFAULT now()
)

-- Indexes for performance
CREATE INDEX idx_epics_team_quarter ON epics(team_id, quarter_id);
CREATE INDEX idx_epics_status ON epics(status);
CREATE INDEX idx_audit_logs_team_entity ON audit_logs(team_id, entity_type, entity_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
```

### 3.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE epic_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Example RLS policies for teams table
CREATE POLICY "Users can view teams they belong to"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update their teams"
  ON teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );
```

---

## 4. Implementation Phases

### Phase 1: Foundation Setup ⏳
**Status**: Not Started  
**Estimated Duration**: 1 week

#### 1.1 Supabase Project Setup
- [ ] Create Supabase project
- [ ] Configure environment variables
- [ ] Install Supabase client packages
- [ ] Set up Supabase client singleton

#### 1.2 Authentication Setup
- [ ] Configure Google OAuth in Supabase dashboard
- [ ] Set up Google Workspace domain restrictions
- [ ] Implement auth pages (login, callback, logout)
- [ ] Add auth middleware for protected routes
- [ ] Create user profile management

#### 1.3 Database Schema Creation
- [ ] Create all tables via Supabase migrations
- [ ] Set up RLS policies
- [ ] Create database functions and triggers
- [ ] Add indexes for performance
- [ ] Create seed data for development

---

### Phase 2: Core Migration ⏳
**Status**: Not Started  
**Estimated Duration**: 2 weeks

#### 2.1 Data Layer Migration
- [ ] Create Supabase service layer
- [ ] Replace localStorage with Supabase queries
- [ ] Implement data caching strategy
- [ ] Add optimistic updates

#### 2.2 API Routes Implementation
- [ ] `/api/teams` - CRUD operations
- [ ] `/api/quarters` - CRUD + state transitions
- [ ] `/api/epics` - CRUD + move operations
- [ ] `/api/team-members` - Management endpoints
- [ ] `/api/capacity` - Calculation endpoints

#### 2.3 Frontend Integration
- [ ] Add authentication wrapper
- [ ] Update components to use Supabase
- [ ] Implement loading and error states
- [ ] Add data synchronization

---

### Phase 3: Multi-Team Support ⏳
**Status**: Not Started  
**Estimated Duration**: 1 week

#### 3.1 Team Management
- [ ] Team creation flow
- [ ] Team switcher component
- [ ] Team settings page
- [ ] Member invitation system

#### 3.2 Permissions System
- [ ] Role-based access control
- [ ] Permission checks in UI
- [ ] API authorization middleware
- [ ] Team isolation verification

---

### Phase 4: V2 Features - Part 1 ⏳
**Status**: Not Started  
**Estimated Duration**: 2 weeks

#### 4.1 Historical Tracking
- [ ] Audit log implementation
- [ ] Activity feed component
- [ ] Change history viewer
- [ ] Undo/redo system

#### 4.2 Epic Enhancements
- [ ] Epic splitting UI and logic
- [ ] Dependency management
- [ ] Dependency visualization
- [ ] Skill-based capacity matching

---

### Phase 5: V2 Features - Part 2 ⏳
**Status**: Not Started  
**Estimated Duration**: 2 weeks

#### 5.1 Collaboration Features
- [ ] Comments system on epics
- [ ] Real-time updates via Supabase
- [ ] Presence indicators
- [ ] Conflict resolution

#### 5.2 Templates System
- [ ] Quarter template creation
- [ ] Template library UI
- [ ] Template sharing
- [ ] Quick-apply functionality

---

### Phase 6: Polish & Deployment ⏳
**Status**: Not Started  
**Estimated Duration**: 1 week

#### 6.1 Migration Tools
- [ ] LocalStorage to Supabase migrator
- [ ] Bulk data import/export
- [ ] Data validation tools

#### 6.2 Production Readiness
- [ ] Performance optimization
- [ ] Error tracking setup
- [ ] Monitoring and analytics
- [ ] Documentation updates

#### 6.3 Testing
- [ ] Update Playwright E2E tests
- [ ] Add integration tests
- [ ] Performance testing
- [ ] Security audit

---

## 5. API Specification

### 5.1 Authentication Endpoints

```typescript
// Auth handled by Supabase Auth UI or custom pages
POST   /auth/callback        // OAuth callback handler
GET    /api/auth/session     // Get current session
POST   /api/auth/logout      // Logout user
```

### 5.2 Team Management

```typescript
GET    /api/teams            // List user's teams
POST   /api/teams            // Create new team
GET    /api/teams/:id        // Get team details
PUT    /api/teams/:id        // Update team
DELETE /api/teams/:id        // Delete team

POST   /api/teams/:id/invite     // Invite member
DELETE /api/teams/:id/members/:userId  // Remove member
PUT    /api/teams/:id/members/:userId  // Update member role
```

### 5.3 Quarter Management

```typescript
GET    /api/teams/:teamId/quarters     // List quarters
POST   /api/teams/:teamId/quarters     // Create quarter
PUT    /api/quarters/:id              // Update quarter
DELETE /api/quarters/:id              // Delete quarter
POST   /api/quarters/:id/start        // Start quarter
POST   /api/quarters/:id/complete     // Complete quarter
```

### 5.4 Epic Management

```typescript
GET    /api/teams/:teamId/epics       // List epics
POST   /api/teams/:teamId/epics       // Create epic
PUT    /api/epics/:id                 // Update epic
DELETE /api/epics/:id                 // Delete epic
POST   /api/epics/:id/move           // Move to quarter
POST   /api/epics/:id/split          // Split epic
POST   /api/epics/:id/comments       // Add comment
```

### 5.5 Capacity & Analytics

```typescript
GET    /api/teams/:teamId/capacity    // Calculate capacity
GET    /api/quarters/:id/capacity     // Quarter capacity
GET    /api/teams/:teamId/velocity    // Historical velocity
GET    /api/teams/:teamId/audit-log   // Audit trail
```

---

## 6. Component Architecture

### 6.1 New Components for V2

```
app/
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx         // Google OAuth login
│   │   ├── AuthGuard.tsx         // Route protection
│   │   └── UserMenu.tsx          // Profile dropdown
│   ├── teams/
│   │   ├── TeamSwitcher.tsx      // Team selection
│   │   ├── TeamSettings.tsx      // Team configuration
│   │   ├── MemberList.tsx        // Member management
│   │   └── InviteModal.tsx       // Invite members
│   ├── epics/
│   │   ├── EpicSplitter.tsx      // Split epic UI
│   │   ├── DependencyGraph.tsx   // Visualize dependencies
│   │   ├── CommentThread.tsx     // Epic comments
│   │   └── SkillMatcher.tsx      // Skill-based filtering
│   ├── history/
│   │   ├── AuditLog.tsx          // Activity feed
│   │   ├── ChangeHistory.tsx     // Version history
│   │   └── UndoRedoControls.tsx  // Undo/redo buttons
│   └── templates/
│       ├── TemplateLibrary.tsx   // Browse templates
│       ├── TemplateCreator.tsx   // Create template
│       └── TemplateApplier.tsx   // Apply template
```

### 6.2 Updated Context Providers

```typescript
// app/providers/
├── SupabaseProvider.tsx      // Supabase client
├── AuthProvider.tsx          // Authentication state
├── TeamProvider.tsx          // Current team context
├── RealtimeProvider.tsx      // Real-time subscriptions
└── UndoRedoProvider.tsx      // Action history
```

---

## 7. Security Considerations

### 7.1 Authentication & Authorization
- Google Workspace OAuth only
- Domain restrictions for enterprise
- JWT tokens with short expiry
- Refresh token rotation

### 7.2 Data Protection
- Row Level Security (RLS) on all tables
- Team-based data isolation
- Encrypted data at rest (Supabase)
- TLS for data in transit

### 7.3 API Security
- Rate limiting on API routes
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (React default escaping)

---

## 8. Performance Targets

### 8.1 Frontend Performance
- Initial page load: < 2s
- Time to interactive: < 3s
- Drag operation latency: < 100ms
- API response time: < 500ms

### 8.2 Scalability Targets
- Support 100+ concurrent users per team
- Handle 1000+ epics per team
- Real-time sync latency: < 1s
- Database query time: < 100ms

### 8.3 Optimization Strategies
- Database query optimization with indexes
- Implement pagination for large datasets
- Use React Server Components where applicable
- Cache frequently accessed data
- Lazy load heavy components

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Utility functions
- Capacity calculations
- Data transformations
- API route handlers

### 9.2 Integration Tests
- Database operations
- Authentication flows
- API endpoints
- Real-time subscriptions

### 9.3 E2E Tests (Playwright)
- User authentication flow
- Team creation and management
- Epic drag-and-drop operations
- Multi-quarter planning
- Real-time collaboration

### 9.4 Performance Tests
- Load testing with k6
- Database query performance
- Real-time sync under load
- API rate limit testing

---

## 10. Deployment Plan

### 10.1 Environment Setup
```
Development:
- Local Supabase instance
- Test Google OAuth app
- Seeded test data

Staging:
- Supabase staging project
- Vercel preview deployments
- Production-like data

Production:
- Supabase production project
- Vercel production deployment
- Monitoring and alerting
```

### 10.2 Migration Strategy
1. Deploy V2 to staging
2. Test with subset of users
3. Provide migration tool for V1 users
4. Gradual rollout with feature flags
5. Full migration with data preservation

### 10.3 Rollback Plan
- Database backups before migration
- Feature flags for gradual rollout
- V1 codebase preserved in branch
- Ability to export data from V2

---

## 11. Success Metrics

### 11.1 Technical Metrics
- [ ] Zero data loss during migration
- [ ] 99.9% uptime SLA
- [ ] < 2s page load time
- [ ] < 500ms API response time

### 11.2 User Adoption Metrics
- [ ] 80% of V1 users migrate to V2
- [ ] 50% of teams use multi-quarter planning
- [ ] 30% adoption of new features (comments, dependencies)
- [ ] 90% user satisfaction score

### 11.3 Business Metrics
- [ ] 3x increase in planning efficiency
- [ ] 50% reduction in planning meetings
- [ ] 80% accuracy in capacity predictions
- [ ] 40% improvement in delivery predictability

---

## 12. Risks and Mitigations

### 12.1 Technical Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Data migration failure | High | Comprehensive testing, rollback plan |
| Performance degradation | Medium | Query optimization, caching |
| Real-time sync issues | Medium | Fallback to polling, conflict resolution |
| Security vulnerabilities | High | Security audit, penetration testing |

### 12.2 User Adoption Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Complex migration process | High | Automated migration tool, documentation |
| Learning curve for new features | Medium | In-app tutorials, help documentation |
| Resistance to authentication | Low | SSO with Google Workspace |

---

## 13. Timeline

### Overall Timeline: 8-10 weeks

```
Week 1-2:  Foundation Setup (Supabase, Auth, Schema)
Week 3-4:  Core Migration (Data layer, API, Frontend)
Week 5:    Multi-Team Support
Week 6-7:  V2 Features Part 1 (History, Epic enhancements)
Week 8-9:  V2 Features Part 2 (Collaboration, Templates)
Week 10:   Polish, Testing, and Deployment
```

---

## 14. Next Steps

### Immediate Actions (Week 1)
1. Create Supabase project
2. Set up development environment
3. Configure Google OAuth
4. Create database schema
5. Begin auth implementation

### Prerequisites
- [ ] Supabase account created
- [ ] Google Cloud Console project for OAuth
- [ ] Vercel project configured
- [ ] Development team briefed

---

## Appendix A: Configuration Examples

### Supabase Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_KEY]
```

### Google OAuth Configuration
```javascript
// Supabase Dashboard > Authentication > Providers
{
  enabled: true,
  client_id: "[GOOGLE_CLIENT_ID]",
  secret: "[GOOGLE_CLIENT_SECRET]",
  authorized_domains: ["company.com"],
  redirect_uri: "https://[PROJECT_ID].supabase.co/auth/v1/callback"
}
```

---

## Appendix B: Migration Scripts

### LocalStorage to Supabase Migration
```typescript
// Pseudo-code for migration tool
async function migrateToSupabase() {
  // 1. Get localStorage data
  const localData = {
    team: JSON.parse(localStorage.getItem('team')),
    quarters: JSON.parse(localStorage.getItem('quarters')),
    epics: JSON.parse(localStorage.getItem('epics'))
  };
  
  // 2. Authenticate user
  const { user } = await supabase.auth.signIn();
  
  // 3. Create organization and team
  const { data: org } = await supabase
    .from('organizations')
    .insert({ name: 'Migrated Org' });
    
  const { data: team } = await supabase
    .from('teams')
    .insert({ 
      ...localData.team, 
      organization_id: org.id 
    });
  
  // 4. Migrate quarters and epics
  // ... migration logic
  
  // 5. Verify migration
  // ... verification logic
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | Jan 2025 | System | Initial V2 specification |

---

**Note**: This is a living document. Update the completion checkboxes and status indicators as implementation progresses. Each completed item should be marked with ✅ and include the completion date in the commit message.