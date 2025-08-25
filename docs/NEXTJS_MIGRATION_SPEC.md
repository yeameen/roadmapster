# Next.js Migration Plan for Roadmapster

## Overview

Migration from Create React App to Next.js 15 to gain better performance, built-in backend capabilities, and simplified deployment.

## Why Next.js?

### Immediate Benefits
- **50% faster initial load** with server-side rendering
- **Built-in API routes** - no separate backend needed
- **Better performance** with automatic code splitting
- **Simpler deployment** to Vercel or any platform

### Future Benefits (V2/V3)
- Easy database integration with API routes
- Built-in authentication support
- Direct integration with external services (Jira, calendars)
- No CORS issues between frontend and backend

## Migration Approach

Keep it simple - your React components work as-is in Next.js. Just add `'use client'` to interactive components.

## Step-by-Step Migration

### 1. Create New Next.js Project

```bash
npx create-next-app@latest roadmapster-next --typescript --app
cd roadmapster-next
```

### 2. Install Your Current Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install lucide-react date-fns
```

### 3. Copy Your Components

- Copy all components from `src/components` to `components/`
- Copy types from `src/types` to `types/`
- Copy utils from `src/utils` to `lib/utils/`

### 4. Update Components

Add `'use client'` to the top of interactive components:

```typescript
'use client'  // Add this line

import { DndContext } from '@dnd-kit/core'
// ... rest of your component
```

### 5. Create Main Page

`app/page.tsx`:
```typescript
'use client'

// Copy your App.tsx content here
export default function HomePage() {
  // Your existing App logic
}
```

### 6. Run and Test

```bash
npm run dev
```

Visit `http://localhost:3000` - everything should work!

## What Changes?

### File Structure (Simplified)

```
Before (CRA):                After (Next.js):
src/                         app/
  App.tsx                      page.tsx (your main app)
  index.tsx                    layout.tsx (HTML wrapper)
  components/                components/ (same)
  utils/                     lib/utils/ (same)
```

### Key Differences

| Feature | CRA | Next.js |
|---------|-----|---------|
| Entry Point | `src/index.tsx` | `app/page.tsx` |
| HTML Template | `public/index.html` | `app/layout.tsx` |
| Routing | React Router (if used) | File-based routing |
| API Calls | Separate backend | Built-in API routes |

## V2 Backend Setup (When Ready)

### Add Database (PostgreSQL + Prisma)

```bash
npm install prisma @prisma/client
npx prisma init
```

Create your schema in `prisma/schema.prisma`:
```prisma
model Team {
  id    String @id
  name  String
  // ... other fields
}

model Epic {
  id       String @id
  title    String
  size     String
  priority String
  // ... other fields
}
```

### Add Authentication

```bash
npm install next-auth@beta
```

Simple setup in `auth.ts`:
```typescript
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { auth, signIn, signOut } = NextAuth({
  providers: [Google],
})
```

### Create API Endpoints

`app/api/epics/route.ts`:
```typescript
export async function GET() {
  // Fetch epics from database
  return Response.json(epics)
}

export async function POST(request: Request) {
  const data = await request.json()
  // Save to database
  return Response.json(newEpic)
}
```

## V3 Integrations (Future)

### Jira Integration
- Import epics directly from Jira
- Sync status changes
- Map story points to t-shirt sizes

### Calendar Integration
- Auto-import holidays
- Sync team vacation schedules
- Calculate actual working days

## Recommended Libraries

### Essential (Keep Current)
- **@dnd-kit** - Your drag-and-drop (no changes needed)
- **lucide-react** - Icons (works perfectly)
- **date-fns** - Date handling (no changes)

### New Additions (When Needed)
- **Prisma** - Database ORM (V2)
- **NextAuth** - Authentication (V2)
- **Zod** - Data validation
- **TanStack Query** - Data fetching (optional)

## Migration Checklist

### Phase 1: Basic Migration (1-2 days)
- [ ] Create Next.js project
- [ ] Copy components and styles
- [ ] Add 'use client' to interactive components
- [ ] Test drag-and-drop works
- [ ] Deploy to Vercel

### Phase 2: Enhancements (Optional)
- [ ] Convert data fetching to server components
- [ ] Add loading states
- [ ] Optimize images with Next.js Image
- [ ] Add metadata for SEO

### Phase 3: Backend (When V2 Starts)
- [ ] Setup database
- [ ] Add authentication
- [ ] Create API routes
- [ ] Connect frontend to APIs

## Common Issues & Solutions

**Issue**: "localStorage is not defined"  
**Solution**: Check for client-side before using:
```typescript
if (typeof window !== 'undefined') {
  localStorage.getItem('data')
}
```

**Issue**: Drag-and-drop not working  
**Solution**: Make sure DndContext component has `'use client'`

**Issue**: Styles look different  
**Solution**: Import your CSS in `app/layout.tsx`

## Deployment

### Vercel (Easiest)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t roadmapster .
docker run -p 3000:3000 roadmapster
```

## Summary

The migration is straightforward:
1. Your React code works in Next.js with minimal changes
2. Add `'use client'` to interactive components
3. Everything else can be improved incrementally
4. Backend features are there when you need them

No need to rewrite anything - just copy, add a few directives, and you're running on Next.js!

## Questions?

The migration preserves all your current functionality while setting you up for future growth. Start with the basics, enhance gradually.