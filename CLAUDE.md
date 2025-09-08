# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Roadmapster is a visual capacity planning tool for software development teams that transforms quarterly planning from spreadsheet-based processes into an engaging, Tetris-inspired visual experience. The application provides drag-and-drop functionality for managing epics across quarters with real-time capacity tracking.

## Current Status

**✅ MVP Implemented and Functional**

The application is fully implemented with core features working:
- Drag-and-drop epic management between backlog and quarters
- Real-time capacity calculations and visualization
- Team configuration and management
- Multiple quarter support with collapsible views
- Data persistence via localStorage
- Export/Import functionality

### Recent Updates
- Fixed Q3 2025 drag-and-drop issue (sequential ID generation)
- Restructured project to eliminate duplicate app/app folder
- Migrated from Create React App to Next.js 15.5.0
- Updated to React 19.1.1 with TypeScript

## Technology Stack

### Current Implementation
- **Framework**: Next.js 15.5.0 with App Router
- **Frontend**: React 19.1.1 with TypeScript
- **Drag & Drop**: @dnd-kit/core and @dnd-kit/sortable
- **Icons**: Lucide React
- **Styling**: CSS3 with modern flexbox/grid layouts
- **State Management**: React hooks with localStorage persistence
- **Testing**: Playwright for E2E testing

### Future Enhancements (V2+)
- Backend API: Node.js/Express or Python FastAPI
- Database: PostgreSQL
- Authentication: OAuth 2.0 - Google/Microsoft
- Integrations: Jira, HR Systems, Calendar Integration

## Project Structure

```
roadmapster/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Main application page
│   ├── components/          # React components
│   │   ├── Backlog.tsx      # Backlog panel with draggable epics
│   │   ├── EpicCard.tsx     # Epic card display component
│   │   ├── EpicForm.tsx     # Epic creation/edit form
│   │   ├── QuarterForm.tsx  # Quarter creation/edit form
│   │   ├── QuarterView.tsx  # Quarter display with drop zones
│   │   ├── QuartersPanel.tsx # Quarters container
│   │   └── TeamConfiguration.tsx # Team settings modal
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # Epic, Quarter, Team interfaces
│   ├── utils/               # Utility functions
│   │   └── capacityCalculations.ts # Capacity calculation logic
│   └── styles/              # CSS styles
├── docs/                    # Documentation
│   ├── PRD.md              # Product Requirements Document
│   └── MIGRATION_GUIDE.md  # CRA to Next.js migration guide
├── images/                  # Screenshots and documentation images
├── tests/                   # Playwright E2E tests
├── package.json            # Node.js dependencies
├── next.config.mjs         # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Key Concepts

### Work Item Sizing
- XS = 5 days
- S = 10 days
- M = 20 days
- L = 40 days
- XL = 60+ days

### Capacity Calculations
- Available capacity = (engineers × 65 days) - oncall days - buffer
- Default buffer: 20% for unknowns
- Visual indicators: Green (<75%), Orange (75-90%), Red (>90%)

## Data Model

### Epic
```typescript
interface Epic {
  id: string;
  title: string;
  description?: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  owner?: string;
  status: 'backlog' | 'planned' | 'in-progress' | 'completed';
  quarterId?: string;
  requiredSkills?: string[];
  position?: number;
}
```

### Quarter
```typescript
interface Quarter {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed';
  workingDays: number;
  teamId: string;
  startDate?: Date;
  endDate?: Date;
  isCollapsed: boolean;
}
```

### Team
```typescript
interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  oncallRotation: number;
  bufferPercentage: number;
}
```

## Important Features

### Drag and Drop
- Uses @dnd-kit for smooth drag operations
- Epics can be dragged between backlog and quarters
- Automatic capacity validation prevents over-allocation
- Visual feedback during drag operations

### Capacity Management
- Real-time capacity calculations
- Visual capacity bars with color coding
- Considers vacation days and oncall rotation
- Prevents dropping epics when capacity exceeded

### Data Persistence
- localStorage for offline capability
- Auto-save on every change
- Export/Import via JSON files

## Testing Guidelines

- **UAT Testing**: Use the UAT Tester agent for comprehensive testing
- **Drag-and-Drop**: Test epic movement between all quarters
- **Data Persistence**: Verify data survives page refresh
- **Edge Cases**: Test capacity limits, empty states, multiple quarters
- **Code Changes**: Whenever making code changes, ALWAYS update associated unit tests and Playwright E2E tests
- **UI Impact**: If code changes affect UI components or logic, find relevant Playwright tests, update them, and run tests to verify
- **Test After Changes**: After any code modification, run related tests with `npx playwright test` to ensure no regressions

## Known Issues & Solutions

### Fixed Issues
1. **Q3 2025 Drag-and-Drop**: Resolved by implementing sequential ID generation
2. **Folder Structure**: Fixed duplicate app/app structure from Next.js migration

### Current Limitations
1. Single team support only (multi-team planned for V2)
2. No backend persistence (localStorage only)
3. No real-time collaboration features

## Development Best Practices

1. **Component Structure**: Keep components small and focused
2. **Type Safety**: Use TypeScript interfaces for all data structures
3. **State Management**: Use React hooks and avoid prop drilling
4. **Performance**: Implement React.memo for expensive components
5. **Testing**: Run UAT tests after significant changes
6. **Code Style**: Follow existing patterns and conventions

## Deployment

The application is ready for deployment to:
- Vercel (recommended for Next.js)
- Netlify
- Any Node.js hosting platform

## Support & Documentation

- Main README: `/README.md`
- Product Requirements: `/docs/PRD.md`
- Migration Guide: `/docs/MIGRATION_GUIDE.md`

## Next Development Priorities

1. **Backend API**: Implement REST API for data persistence
2. **Authentication**: Add user authentication and authorization
3. **Multi-team Support**: Enable planning across multiple teams
4. **Jira Integration**: Sync epics with Jira tickets
5. **Advanced Analytics**: Add reporting and capacity insights

---

**Note**: When making changes that impact functionality, always test using the UAT Tester agent to ensure quality and prevent regressions.