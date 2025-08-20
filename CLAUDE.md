# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Roadmapster is a visual capacity planning tool for software development teams, currently in the pre-implementation phase. The project aims to transform quarterly planning from spreadsheet-based processes into an engaging, Tetris-inspired visual experience.

## Current Status

This repository contains a comprehensive Product Requirements Document (PRD) but no implementation yet. The project is ready for development to begin.

## Planned Technology Stack

### MVP (Version 1)
- Frontend: React or Vue.js single-page application
- Backend: Node.js or Python lightweight API  
- Storage: Local storage or session storage
- Deployment: Single web container (Docker)

### Future Versions
- Database: PostgreSQL (V2)
- Authentication: OAuth 2.0 - Google/Microsoft (V2)
- Integrations: Jira, HR Systems, Calendar Integration (V3)

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

## Development Commands

**Note**: No development environment is currently set up. When implementing, consider:

For React setup:
```bash
npx create-react-app roadmapster --template typescript
npm install
npm start
```

For Vue.js setup:
```bash
npm create vue@latest roadmapster
npm install
npm run dev
```

## Architecture Decisions

### Data Model (from PRD)
- **Epic**: Work items with id, name, size, priority, owner, status, quarter
- **Team**: Groups with capacity calculations
- **Quarter**: Time periods for planning

### UI Components to Implement
1. **Grid View**: Visual capacity grid showing team members and time blocks
2. **Backlog Panel**: Draggable epics with priority sorting
3. **Capacity Meter**: Real-time utilization visualization
4. **Controls**: Quarter selection, view modes, filters

## Implementation Priorities

1. **MVP Focus**: Single team, single quarter planning with drag-and-drop
2. **Core Features**: Epic management, capacity visualization, basic persistence
3. **User Experience**: Smooth animations, intuitive drag-and-drop, visual feedback

## Important Files

- `PRD.md`: Complete product requirements and specifications

## Next Steps for Development

1. Initialize git repository
2. Choose frontend framework (React or Vue.js)
3. Set up development environment
4. Create initial project structure following PRD specifications
5. Implement MVP features in phases as outlined in PRD