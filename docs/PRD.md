# WorkTetris - Product Requirements Document

## 1. Executive Summary

### Product Name
**WorkTetris** - A visual capacity planning tool where teams fit work items into their available capacity, just like pieces in Tetris.

### Tagline
*"Fit your work perfectly into your team's capacity"*

### Product Vision
WorkTetris enables product and engineering teams to effectively plan multiple quarters of work based on team capacity, prioritize epics, and dynamically adjust plans as work progresses. The tool provides a Jira-sprint-like interface for managing quarters, making it familiar and intuitive for development teams.

### Problem Statement
Teams currently use disconnected spreadsheets and visual boards to plan capacity, leading to:
- High friction when updating priorities mid-quarter
- Difficulty visualizing remaining capacity across multiple quarters
- Manual calculations prone to errors
- Poor visibility into capacity constraints when prioritizing work
- Inability to easily plan beyond the current quarter

### Success Metrics
1. Enable data-driven project prioritization based on actual team capacity
2. Reduce friction in replanning by 80% (measured by time to update quarterly plan)
3. Increase accuracy of quarterly planning (measured by planned vs. delivered work)
4. Enable multi-quarter roadmap planning with capacity validation

## 2. User Personas

### Primary Users
- **Product Managers**: Need to prioritize features and understand what fits across multiple quarters
- **Engineering Managers**: Need to allocate team capacity and manage constraints over time
- **Engineers**: Need visibility into planned work and capacity allocation for upcoming quarters

## 3. Core Features

### 3.1 Capacity Management

#### Team Capacity Configuration
- **Global team settings**:
  - Working days per quarter (configurable per quarter, e.g., 65 days for Q1 2025)
  - Buffer percentage (default: 20%)
  - Oncall allocation per sprint (default: 1 person)

- **Input fields per team member**:
  - Name
  - Vacation days (for the quarter)
  - Special skills (optional)
  
- **Automatic calculations**:
  - Individual capacity = Quarter working days - Vacation days
  - Team total capacity = Sum of all individual capacities
  - Oncall deduction = (Number of sprints × 10 working days)
  - Final capacity = (Team total - Oncall) × (1 - Buffer%)
  - Display: Total Capacity, Oncall Subtraction, Final Capacity After Buffer

#### Capacity Drains
- Configurable recurring drains (meetings, maintenance, tech debt)
- Default oncall: 1 person per 2-week sprint
- Adjustable buffer percentage (default 20%)

#### Example Capacity Calculation
For Q2 2025 with 4 team members:
```
Quarter Working Days: 65 days (configured for Q2)
Team Members:
  - Alice: 5 vacation days → 60 days available
  - Bob: 10 vacation days → 55 days available  
  - Carol: 3 vacation days → 62 days available
  - Dan: 8 vacation days → 57 days available

Total Team Capacity: 60 + 55 + 62 + 57 = 234 days
Oncall Deduction: 6 sprints × 10 days = 60 days
Capacity after Oncall: 234 - 60 = 174 days
Final Capacity (20% buffer): 174 × 0.8 = 139 days

Quarter displays: "139 days available (0/139 days used, 0%)"
```

### 3.2 Epic Management

#### Epic Properties
- **Required fields**:
  - Title
  - T-shirt size (XS, S, M, L, XL)
  - Priority level (P0, P1, P2, P3) or rank order
  
- **Optional fields**:
  - Quarter assignment (automatic when dragged to quarter)
  - Required skills/expertise
  - Dependencies on other epics
  - Description
  - Owner/Lead

#### T-Shirt Size Definitions
- **XS**: 1 dev week (5 person-days)
- **S**: 2 dev weeks (10 person-days)
- **M**: 4 dev weeks (20 person-days)
- **L**: 8 dev weeks (40 person-days)
- **XL**: 12+ dev weeks (60+ person-days)

### 3.3 Planning Board

#### Visual Layout
- **Two-panel view**:
  1. **Backlog** (left): Prioritized list of epics not yet scheduled
  2. **Quarters Panel** (right): Vertically stacked quarters with collapsible views

#### Quarter Display
- **Collapsed Quarter View**:
  - Quarter name (e.g., "Q2 2025")
  - Status indicator (Planning/Active/Completed)
  - Capacity summary (e.g., "40/139 days, 29%")
  - Epic count (e.g., "3 epics")
  - Expand/collapse chevron icon

- **Expanded Quarter View**:
  - All assigned epics displayed as cards
  - Drop zone for dragging epics from backlog
  - Real-time capacity updates
  - Action buttons (Start/Complete quarter)

#### Drag-and-Drop Functionality
- Drag epics from backlog to any quarter
- Reorder epics within a quarter
- Move epics between quarters
- Automatic capacity calculation on drop
- Visual warnings when approaching capacity limits
- Prevent over-allocation with clear error messages

#### Capacity Visualization (Per Quarter)
- **Progress bar**: Shows used vs. available capacity for each quarter
- **Color coding**: 
  - Green: 0-75% capacity used
  - Orange: 75-90% capacity used  
  - Red: 90-100% capacity used
- **Numeric display**: "X/Y days (Z%)"

### 3.4 Quarter Lifecycle Management

#### Quarter States
- **Planning**: Quarter being prepared, can be edited freely
- **Active**: Current working quarter, highlighted with green indicator
- **Completed**: Finished quarter, shown with gray badge

#### Quarter Actions
- **Create Quarter**: Add new quarters for future planning
- **Start Quarter**: Transition from Planning to Active state
- **Complete Quarter**: Mark quarter as finished
- **Edit Quarter**: Modify quarter settings (name, working days)
- **Delete Quarter**: Remove quarter (moves epics back to backlog)

#### Quarter Configuration
- Quarter name (e.g., "Q2 2025")
- Working days for the quarter
- Start/end dates (optional)
- Team assignment (for multi-team support in V2)

### 3.5 Priority Management

#### Backlog Organization
- Sort by priority (P0 > P1 > P2 > P3)
- Visual grouping by priority level
- Filter by required skills
- Search functionality

#### Priority Groups
- Critical (Must Do) - P0
- High Priority - P1
- Medium Priority - P2
- Low Priority - P3

## 4. Technical Requirements

### 4.1 Version 1 (MVP) - Current Implementation

#### Architecture
- **Frontend**: React with TypeScript single-page application
- **State Management**: React hooks with localStorage persistence
- **Drag & Drop**: @dnd-kit library for smooth interactions
- **Styling**: CSS3 with modern flexbox/grid layouts
- **Icons**: Lucide React icons
- **Build Tool**: Create React App with Webpack

#### Core Functionality
- Multiple quarter management with Jira-sprint-style interface
- Collapsible/expandable quarters
- Basic CRUD for epics and team members
- Drag-and-drop epic scheduling across quarters
- Real-time capacity calculations per quarter
- Quarter lifecycle management (Planning/Active/Completed)
- Export/Import to JSON
- localStorage persistence

### 4.2 Version 2

#### Enhanced Architecture
- **Database**: PostgreSQL for persistent storage
- **Backend**: Node.js/Express API
- **Authentication**: OAuth 2.0 (Google/Microsoft)
- **Multi-tenancy**: Team/organization isolation

#### New Features
- Multiple team support
- User accounts and authentication
- Historical tracking and audit log
- Epic splitting (when epic exceeds quarter capacity)
- Dependency visualization
- Skill-based capacity matching
- Undo/redo functionality
- Comments and notes on epics
- Quarter templates

### 4.3 Version 3

#### Integrations
- **Jira Integration**:
  - Selective import with preview
  - Bi-directional sync for epic status
  - Custom field mapping
  
- **HR Systems**:
  - Automatic vacation day sync
  - Team roster updates
  
- **Calendar Integration**:
  - Sprint/quarter boundaries
  - Holiday calendars

#### Advanced Features
- Velocity tracking across quarters
- Scenario planning (what-if analysis)
- Capacity forecasting based on historical data
- API for external tool integration
- Advanced reporting and analytics
- Quarter comparison views

## 5. User Interface Specifications

### 5.1 Main Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  WorkTetris                    [Settings] [Export] [Import]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Backlog              │     Quarters                        │
│  ─────────            │     ─────────                       │
│                       │                                      │
│  [+ Add Epic]         │     ▼ Q2 2025 [Start]              │
│                       │     ████████░░░░ 40/139 days (29%)  │
│  Critical (P0):       │     ┌─────────┐                     │
│  ┌─────────┐          │     │Epic D(S)│                     │
│  │Epic A(M)│          │     └─────────┘                     │
│  └─────────┘          │     ┌─────────┐                     │
│                       │     │Epic F(M)│                     │
│  High (P1):           │     └─────────┘                     │
│  ┌─────────┐          │                                      │
│  │Epic B(L)│          │     ▶ Q3 2025  15/139 days (11%)    │
│  └─────────┘          │                                      │
│  ┌─────────┐          │     ▼ Q4 2025 [Start]              │
│  │Epic C(S)│          │     ░░░░░░░░░░ 0/139 days (0%)     │
│  └─────────┘          │     [Drop epics here]               │
│                       │                                      │
│  Medium (P2):         │     [+ Create Quarter]              │
│  (empty)              │                                      │
│                       │                                      │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Team Configuration Modal

```
Team Settings
─────────────────
Buffer: [20]%
Oncall per Sprint: [1] person
Sprints per Quarter: [6]

Team Members
─────────────────
Name         Vacation Days    Skills
Alice        [5]             [React, Node.js ▼]
Bob          [10]            [Python, AWS ▼]
Carol        [3]             [React, CSS ▼]
Dan          [8]             [Node.js, K8s ▼]

[+ Add Member] [Save] [Cancel]
```

### 5.3 Quarter Configuration Modal

```
Quarter Settings
─────────────────
Quarter Name: [Q2 2025]
Working Days: [65]
Status: [Planning ▼]

Optional:
Start Date: [____-__-__]
End Date: [____-__-__]

[Delete Quarter] [Save] [Cancel]
```

## 6. Data Model

### 6.1 Core Entities

```yaml
Team:
  - id: UUID
  - name: string
  - quarterWorkingDays: integer (default per quarter)
  - bufferPercentage: float (e.g., 0.20)
  - oncallPerSprint: integer (e.g., 1)
  - sprintsInQuarter: integer (e.g., 6)
  - created_at: timestamp

Quarter:
  - id: UUID
  - name: string (e.g., "Q2 2025")
  - status: enum(planning, active, completed)
  - workingDays: integer (e.g., 65)
  - teamId: UUID
  - isCollapsed: boolean
  - startDate: date (optional)
  - endDate: date (optional)
  - created_at: timestamp

TeamMember:
  - id: UUID
  - teamId: UUID
  - name: string
  - vacationDays: integer
  - skills: array[string]

Epic:
  - id: UUID
  - title: string
  - size: enum(XS, S, M, L, XL)
  - priority: enum(P0, P1, P2, P3)
  - status: enum(backlog, planned, in_progress, completed)
  - quarterId: UUID (nullable - null when in backlog)
  - position: integer (order within quarter)
  - description: string (optional)
  - owner: string (optional)
  - requiredSkills: array[string]
  - dependencies: array[UUID]

CapacityLog:
  - id: UUID
  - quarterId: UUID
  - totalCapacity: integer
  - usedCapacity: integer
  - timestamp: timestamp
```

## 7. API Specification (V2+)

### 7.1 Endpoints

```
# Quarters
GET    /api/quarters
POST   /api/quarters
PUT    /api/quarters/{quarterId}
DELETE /api/quarters/{quarterId}
POST   /api/quarters/{quarterId}/start
POST   /api/quarters/{quarterId}/complete

# Team & Capacity
GET    /api/teams/{teamId}/capacity
POST   /api/teams/{teamId}/members
PUT    /api/teams/{teamId}/members/{memberId}
DELETE /api/teams/{teamId}/members/{memberId}

# Epics
GET    /api/epics
POST   /api/epics
PUT    /api/epics/{epicId}
DELETE /api/epics/{epicId}
POST   /api/epics/{epicId}/move

# Data Management
GET    /api/export
POST   /api/import
GET    /api/history
```

## 8. Non-Functional Requirements

### Performance
- Page load time < 2 seconds
- Drag-and-drop response < 100ms
- Support 100+ epics across multiple quarters
- Smooth expand/collapse animations

### Reliability
- 99.9% uptime
- localStorage persistence for offline capability
- Automatic save on every change (V1)
- Server sync every 30 seconds (V2+)

### Security
- HTTPS only
- Authentication required (V2+)
- Team-level data isolation (V2+)
- Secure export/import validation

### Usability
- Mobile-responsive design
- Keyboard shortcuts for common actions
- Accessible (WCAG 2.1 AA compliant)
- Familiar Jira-like interface for easy adoption

## 9. Implementation Phases

### Phase 1: MVP (Completed)
- ✅ Multiple quarter management
- ✅ Collapsible/expandable quarters
- ✅ Quarter lifecycle states
- ✅ Basic capacity calculation
- ✅ Drag-and-drop between quarters
- ✅ Team configuration
- ✅ Local storage persistence
- ✅ Export/Import functionality

### Phase 2: Multi-User (6 weeks)
- User authentication
- Backend API development
- Database persistence
- Multiple teams
- Historical tracking
- Real-time collaboration

### Phase 3: Integrations (8 weeks)
- Jira integration
- Advanced features
- External API
- HR system integration
- Analytics dashboard

## 10. Open Questions & Future Considerations

1. Should we support cross-team resource sharing?
2. How to handle partial epic completion when replanning?
3. Should we add Monte Carlo simulation for capacity planning?
4. Integration with OKR planning tools?
5. Mobile native apps needed?
6. Should quarters auto-transition states based on dates?
7. How to handle epic dependencies across quarters?

## Appendix A: User Stories

### MVP User Stories (Implemented)

#### As a Product Manager:
1. ✅ I want to see multiple quarters at once so I can plan long-term roadmaps
2. ✅ I want to collapse/expand quarters so I can focus on specific planning periods
3. ✅ I want to drag epics between quarters so I can easily rebalance work
4. ✅ I want to see each quarter's capacity so I know utilization at a glance
5. ✅ I want to create new quarters so I can extend planning horizons

#### As an Engineering Manager:
1. ✅ I want to configure working days per quarter so capacity reflects reality
2. ✅ I want to mark quarters as active/completed so team knows current focus
3. ✅ I want to see capacity bars per quarter so I can prevent overcommitment
4. ✅ I want to export/import plans so I can share with stakeholders
5. ✅ I want to input vacation days so capacity calculations are accurate

#### As an Engineer:
1. ✅ I want to see all planned quarters so I understand long-term commitments
2. ✅ I want collapsed quarters to reduce clutter so I can focus on current work
3. ✅ I want to see epic priorities so I know what's most important

### V2 User Stories

#### As a Team Lead:
1. I want multiple teams in the same instance so we can coordinate
2. I want to track velocity across quarters so estimates improve
3. I want to split large epics across quarters so work progresses steadily
4. I want audit logs so I can track plan changes

#### As a Stakeholder:
1. I want read-only access so I can view without changing
2. I want quarterly reports so I can track progress
3. I want capacity forecasts so I can plan hiring

## Appendix B: Glossary

- **Epic**: A large work item that delivers significant user value
- **T-shirt Size**: Relative estimation technique using clothing sizes (XS, S, M, L, XL)
- **Capacity**: Available person-days of work in a given time period
- **Quarter**: Three-month planning period (Q1, Q2, Q3, Q4)
- **Quarter State**: Lifecycle phase of a quarter (Planning, Active, Completed)
- **Working Days**: Configurable business days per quarter (typically 60-65 days)
- **Buffer**: Safety margin applied to capacity to account for unknowns
- **Oncall**: Rotating responsibility for production support
- **Sprint**: Fixed time period for iterative development (typically 2 weeks)
- **Backlog**: Prioritized list of work not yet scheduled
- **Dependency**: Relationship where one epic must complete before another can start

## Appendix C: Acceptance Criteria

### MVP Acceptance Criteria (All Met)

1. **Quarter Management**
   - ✅ Can create multiple quarters
   - ✅ Can edit quarter settings
   - ✅ Can delete quarters (epics return to backlog)
   - ✅ Can collapse/expand quarters
   - ✅ Can transition quarter states

2. **Capacity Calculation**
   - ✅ Each quarter shows individual capacity
   - ✅ Capacity = (Working days - Vacation) - Oncall - Buffer
   - ✅ Real-time capacity updates
   - ✅ Color-coded capacity warnings

3. **Drag and Drop**
   - ✅ Drag from backlog to any quarter
   - ✅ Drag between quarters
   - ✅ Reorder within quarters
   - ✅ Visual feedback during drag
   - ✅ Capacity validation on drop

4. **Data Persistence**
   - ✅ localStorage saves all changes
   - ✅ Export to JSON with all data
   - ✅ Import from JSON restores state
   - ✅ Survives browser refresh

## Appendix D: Visual Design System

### WorkTetris Design Language

The current implementation uses a clean, professional design inspired by Jira:

1. **Color Palette**:
   - Background: #f5f7fa (light gray)
   - Panels: White with subtle borders
   - Primary Action: #3b82f6 (blue)
   - Success: #10b981 (green)
   - Warning: #f59e0b (orange)
   - Danger: #ef4444 (red)

2. **Epic Cards**:
   - Clean white cards with subtle shadows
   - T-shirt size badges with color coding
   - Priority indicators (P0-P3)
   - Drag handle icon for affordance

3. **Quarter States**:
   - Planning: Blue left border
   - Active: Green left border + Start button
   - Completed: Gray styling + badge

4. **Interactions**:
   - Smooth expand/collapse animations
   - Drag preview with opacity
   - Hover states on all interactive elements
   - Clear drop zones when dragging

5. **Typography**:
   - System fonts for performance
   - Clear hierarchy with size and weight
   - Consistent spacing throughout

### User Experience Principles

1. **Familiarity**: Jira-like patterns for easy adoption
2. **Clarity**: Clear visual hierarchy and states
3. **Efficiency**: Minimal clicks to accomplish tasks
4. **Feedback**: Immediate visual response to actions
5. **Flexibility**: Support various planning workflows

---

*This PRD reflects the current implementation of WorkTetris with Jira-sprint-style quarter management. The system provides an intuitive, scalable solution for multi-quarter capacity planning.*

*Last Updated: August 2024*
*Version: 1.1 - Updated to reflect implemented features*

*WorkTetris - Fit your work perfectly into your team's capacity.*