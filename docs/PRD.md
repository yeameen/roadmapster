# WorkTetris - Product Requirements Document

## 1. Executive Summary

### Product Name
**WorkTetris** - A visual capacity planning tool where teams fit work items into their available capacity, just like pieces in Tetris.

### Tagline
*"Fit your work perfectly into your team's capacity"*

### Product Vision
WorkTetris enables product and engineering teams to effectively plan quarterly work based on team capacity, prioritize epics, and dynamically adjust plans as work progresses.

### Problem Statement
Teams currently use disconnected spreadsheets and visual boards to plan capacity, leading to:
- High friction when updating priorities mid-quarter
- Difficulty visualizing remaining capacity
- Manual calculations prone to errors
- Poor visibility into capacity constraints when prioritizing work

### Success Metrics
1. Enable data-driven project prioritization based on actual team capacity
2. Reduce friction in replanning by 80% (measured by time to update quarterly plan)
3. Increase accuracy of quarterly planning (measured by planned vs. delivered work)

## 2. User Personas

### Primary Users
- **Product Managers**: Need to prioritize features and understand what fits in a quarter
- **Engineering Managers**: Need to allocate team capacity and manage constraints
- **Engineers**: Need visibility into planned work and capacity allocation

## 3. Core Features

### 3.1 Capacity Management

#### Team Capacity Configuration
- **Global team settings**:
  - Working days per quarter (fixed for all members, e.g., 65 days for Q1 2025)
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
Quarter Working Days: 65 days (fixed for all)
Team Members:
  - Alice: 5 vacation days → 60 days available
  - Bob: 10 vacation days → 55 days available  
  - Carol: 3 vacation days → 62 days available
  - Dan: 8 vacation days → 57 days available

Total Team Capacity: 60 + 55 + 62 + 57 = 234 days
Oncall Deduction: 6 sprints × 10 days = 60 days
Capacity after Oncall: 234 - 60 = 174 days
Final Capacity (20% buffer): 174 × 0.8 = 139 days

WorkTetris displays: "139 days available for epics"
```

### 3.2 Epic Management

#### Epic Properties
- **Required fields**:
  - Title
  - T-shirt size (XS, S, M, L, XL)
  - Priority level (P0, P1, P2, P3) or rank order
  - Quarter assignment
  
- **Optional fields**:
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
- **Three-column view**:
  1. **Backlog** (left): Prioritized list of epics not yet scheduled
  2. **Quarterly Plan** (center): Current quarter divided into months/sprints
  3. **Capacity Indicator** (top/side): Real-time capacity remaining

#### Drag-and-Drop Functionality
- Drag epics from backlog to quarter
- Automatic capacity calculation on drop
- Visual warnings when approaching capacity limits
- Prevent over-allocation with clear error messages

#### Capacity Visualization
- **Progress bar**: Shows used vs. available capacity
- **Color coding**: 
  - Green: 0-70% capacity used
  - Yellow: 70-90% capacity used  
  - Red: 90-100% capacity used
- **Numeric display**: "X days remaining of Y total"

### 3.4 Priority Management

#### Backlog Organization
- Sort by priority (P0 > P1 > P2 > P3)
- Or manual rank ordering
- Filter by required skills
- Search functionality

#### Priority Buckets
- High Priority (Must Do)
- Medium Priority (Should Do)
- Low Priority (Nice to Have)
- Future/Parking Lot

## 4. Technical Requirements

### 4.1 Version 1 (MVP)

#### Architecture
- **Frontend**: React/Vue.js single-page application
- **Backend**: Node.js/Python lightweight API
- **Storage**: Local storage or session storage (minimal persistence)
- **Deployment**: Single web container (Docker)

#### Core Functionality
- Single team view
- Basic CRUD for epics and team members
- Drag-and-drop epic scheduling
- Real-time capacity calculations
- Export to JSON/CSV

### 4.2 Version 2

#### Enhanced Architecture
- **Database**: PostgreSQL for persistent storage
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
- Multi-quarter planning
- Scenario planning (what-if analysis)
- Capacity forecasting based on historical data
- API for external tool integration
- Advanced reporting and analytics

## 5. User Interface Specifications

### 5.1 Main Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  WorkTetris                                    Q2 2025      │
│  65 working days/person | 4 team members                    │
│  Team Capacity: 139 days (after oncall & buffer)            │
│  [████████████░░░░░░░] 35% utilized (49/139 days)          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Backlog          │     Q2 2025 Plan                        │
│  ─────────        │     ──────────────                      │
│  P0 Items:        │     April    May     June               │
│  ┌─────────┐      │     ┌──────┐                            │
│  │Epic A(M)│      │     │Epic D│ ┌──────┐                   │
│  └─────────┘      │     │ (S)  │ │Epic F│                   │
│  ┌─────────┐      │     └──────┘ │ (M)  │                   │
│  │Epic B(L)│      │               └──────┘                   │
│  └─────────┘      │     ┌──────┐                            │
│                   │     │Epic E│                             │
│  P1 Items:        │     │ (XS) │                             │
│  ┌─────────┐      │     └──────┘                            │
│  │Epic C(S)│      │                                          │
│  └─────────┘      │                                          │
│                   │                                          │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Team Configuration Modal

```
Team Settings
─────────────────
Quarter: Q2 2025
Working Days This Quarter: 65 (fixed)
Buffer: [20]%
Oncall per Sprint: [1] person

Team Members
─────────────────
Name: [___________]
Vacation Days: [___]
Skills: [dropdown multiselect]

[+ Add Member] [Save]
```

## 6. Data Model

### 6.1 Core Entities

```yaml
Team:
  - id: UUID
  - name: string
  - created_at: timestamp
  - settings: JSON

Quarter:
  - id: UUID
  - team_id: UUID
  - quarter_name: string (e.g., "Q2 2025")
  - working_days: integer (e.g., 65)
  - buffer_percentage: float (e.g., 0.20)
  - oncall_per_sprint: integer (e.g., 1)

TeamMember:
  - id: UUID
  - team_id: UUID
  - name: string
  - vacation_days: integer
  - skills: array[string]

Epic:
  - id: UUID
  - title: string
  - size: enum(XS, S, M, L, XL)
  - priority: enum(P0, P1, P2, P3)
  - required_skills: array[string]
  - dependencies: array[UUID]
  - quarter: string
  - status: enum(backlog, planned, in_progress, completed)
  - position: integer

CapacityLog:
  - id: UUID
  - team_id: UUID
  - quarter: string
  - total_capacity: integer
  - used_capacity: integer
  - timestamp: timestamp
```

## 7. API Specification (V2+)

### 7.1 Endpoints

```
GET    /api/teams/{teamId}/quarters/{quarter}
PUT    /api/teams/{teamId}/quarters/{quarter}

GET    /api/teams/{teamId}/capacity
POST   /api/teams/{teamId}/members
PUT    /api/teams/{teamId}/members/{memberId}
DELETE /api/teams/{teamId}/members/{memberId}

GET    /api/teams/{teamId}/epics
POST   /api/teams/{teamId}/epics
PUT    /api/teams/{teamId}/epics/{epicId}
DELETE /api/teams/{teamId}/epics/{epicId}

POST   /api/teams/{teamId}/epics/{epicId}/move
GET    /api/teams/{teamId}/history
```

## 8. Non-Functional Requirements

### Performance
- Page load time < 2 seconds
- Drag-and-drop response < 100ms
- Support 100+ epics per view

### Reliability
- 99.9% uptime
- Automatic save every 30 seconds (V2+)
- Offline capability with sync on reconnect (V3)

### Security
- HTTPS only
- Authentication required (V2+)
- Team-level data isolation (V2+)

### Usability
- Mobile-responsive design
- Keyboard shortcuts for common actions
- Accessible (WCAG 2.1 AA compliant)

## 9. Implementation Phases

### Phase 1: MVP (4 weeks)
- Basic capacity calculation
- Simple drag-and-drop board
- Single team support
- Local storage

### Phase 2: Multi-User (6 weeks)
- User authentication
- Persistent storage
- Multiple teams
- Historical tracking

### Phase 3: Integrations (8 weeks)
- Jira integration
- Advanced features
- API development
- HR system integration

## 10. Open Questions & Future Considerations

1. Should we support cross-team resource sharing?
2. How to handle partial epic completion when replanning?
3. Should we add Monte Carlo simulation for capacity planning?
4. Integration with OKR planning tools?
5. Mobile native apps needed?

## Appendix A: User Stories

### MVP User Stories

#### As a Product Manager:
1. I want to see my team's total capacity for the quarter so I can understand our constraints
2. I want to drag epics from backlog to the quarter plan so I can quickly test different scenarios
3. I want to see remaining capacity in real-time so I know when we're at limit
4. I want to organize epics by priority so I can ensure important work gets scheduled first

#### As an Engineering Manager:
1. I want to set the quarter's working days once for the whole team so setup is simple
2. I want to input each team member's vacation days so capacity is accurate
3. I want to account for oncall and other recurring work so it doesn't get forgotten
4. I want to apply a safety buffer to capacity so we don't overcommit
5. I want to see when specific skills are required so I can plan assignments

#### As an Engineer:
1. I want to see what work is planned for the quarter so I know what's coming
2. I want to understand dependencies between epics so I can sequence work properly
3. I want to track changes to the plan so I understand what changed and why

### V2 User Stories

#### As a Team Lead:
1. I want multiple teams to share the same tool so we can coordinate cross-team work
2. I want to track historical plans so we can improve estimation over time
3. I want to split large epics that don't fit so we can make progress each quarter
4. I want to add comments to epics so context isn't lost

#### As a Stakeholder:
1. I want read-only access to view plans so I can stay informed without risk of changes
2. I want to see audit logs of changes so I understand how plans evolved
3. I want to export plans to share with leadership so reporting is easy

## Appendix B: Glossary

- **Epic**: A large work item that delivers significant user value
- **T-shirt Size**: Relative estimation technique using clothing sizes (XS, S, M, L, XL)
- **Capacity**: Available person-days of work in a given time period
- **Working Days**: Fixed number of business days in a quarter (typically 60-65 days)
- **Buffer**: Safety margin applied to capacity to account for unknowns
- **Oncall**: Rotating responsibility for production support
- **Sprint**: Fixed time period for iterative development (typically 2 weeks)
- **Quarter**: Three-month planning period (Q1, Q2, Q3, Q4)
- **Backlog**: Prioritized list of work not yet scheduled
- **Dependency**: Relationship where one epic must complete before another can start

## Appendix C: Acceptance Criteria

### MVP Acceptance Criteria

1. **Capacity Calculation**
   - System uses fixed quarterly working days for all team members
   - Individual capacity = Quarter working days - Vacation days
   - Team capacity correctly sums individual capacities
   - Oncall deduction applied at team level
   - 20% buffer is applied by default
   - Capacity updates immediately when vacation days change

2. **Drag and Drop**
   - Epics can be dragged from backlog to quarter plan
   - Epics can be reordered within backlog
   - Epics can be moved back to backlog from plan
   - Visual feedback during drag operation

3. **Capacity Warnings**
   - Yellow warning appears at 70% capacity
   - Red warning appears at 90% capacity
   - Cannot exceed 100% capacity

4. **Data Persistence**
   - Changes persist during browser session
   - Option to export current state as JSON
   - Option to import previously exported state

## Appendix D: Branding & UI Theme

### WorkTetris Visual Identity

The WorkTetris name should be reflected in the UI through subtle Tetris-inspired elements:

1. **Epic Cards**: Styled as "pieces" with distinct colors per size
   - XS: Single square (light blue)
   - S: Two squares (yellow)
   - M: L-shaped piece (orange)
   - L: Long piece (cyan)
   - XL: Large square (purple)

2. **Fit Feedback**: 
   - Satisfying "snap" animation when epic fits into capacity
   - Gentle shake animation if epic doesn't fit
   - "Line clear" effect when quarter is perfectly filled

3. **Capacity Meter**: 
   - Styled like a Tetris playing field filling up
   - Shows "ghost" placement while dragging

4. **Sound Effects** (optional, with mute):
   - Soft "click" when placing epic
   - Pleasant "complete" sound when reaching optimal capacity
   - Warning sound when approaching overflow

### Marketing Positioning

**WorkTetris** - Where planning meets play. Transform quarterly planning from a spreadsheet slog into an engaging visual experience. Just like Tetris, you'll find the perfect fit for every piece of work.

---

*This PRD is designed to be consumed by an LLM agent for implementation. Each section provides specific, actionable requirements that can be translated directly into code.*

*WorkTetris - Fit your work perfectly into your team's capacity.*