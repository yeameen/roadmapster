
# Migration Guide: From Create React App to Next.js

**Author:** Gemini Agent
**Date:** 2025-08-25
**Status:** Final

## 1. Background & Goals

### 1.1. Why Migrate?

The Roadmapster application is currently built using Create React App (CRA), which is no longer the recommended standard for new React projects. Migrating to Next.js will align our project with modern best practices. The primary motivation is to create a more **simple, maintainable, and vendor-independent** application.

**Immediate Benefits:**
- **Modern Stack:** Align with the official React team recommendation.
- **Better Performance:** Gain performance improvements from automatic code splitting and optimized builds.
- **Simplified Structure:** Adopt a clear, file-based routing system and project structure.
- **Future-Proofing:** Lay the foundation for future backend capabilities without needing a separate server.

### 1.2. Goals

- Successfully migrate the entire application from Create React App to Next.js.
- Maintain 100% of existing functionality with no regressions.
- Improve the application's initial load performance.
- Ensure the final codebase is vendor-independent, easy to understand, and maintainable.

## 2. Scope

### In Scope

- **Project Restructuring:** Reorganize the project to follow the Next.js `app` directory structure.
- **Routing:** Replace any client-side routing with Next.js's file-based routing.
- **Dependency Update:** Update all dependencies and remove CRA-specific packages (`react-scripts`).
- **Component Migration:** Move all existing React components, hooks, types, and utilities.
- **Build Process:** Update all scripts (`start`, `build`, `test`) to use Next.js commands.

### Out of Scope

- **New Features:** No new user-facing features will be added.
- **Major Refactoring:** Components will only be refactored if necessary for the migration.
- **Vendor-Specific Services:** The migration will not use any proprietary, vendor-specific services for hosting or backend.

## 3. Step-by-Step In-Place Migration

**Important:** Before starting, please ensure your current project is fully committed to Git so you have a clean state to revert to if needed.

### 3.1. Dependency Overhaul (in `/app` directory)

1.  **Remove Create React App:**
    ```bash
    npm uninstall react-scripts
    ```

2.  **Install Next.js:**
    ```bash
    npm install next@latest react@latest react-dom@latest
    ```

3.  **Update `package.json` Scripts:** Replace the `scripts` section with the following:
    ```json
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    },
    ```

### 3.2. Project Restructuring

1.  **Create `next.config.mjs`:** In the root of the `/app` directory, create a new file named `next.config.mjs`:
    ```javascript
    /** @type {import('next').NextConfig} */
    const nextConfig = {};

    export default nextConfig;
    ```

2.  **Reorganize `src` into `app`:**
    *   Rename the `src` folder to `app`.
    *   Move all content from the old `public` folder (like `favicon.ico`, `logo192.png`, etc.) into the `app` folder. The `public` folder can be deleted.

3.  **Create Root Layout (`app/layout.tsx`):** Inside the new `app` folder, create `layout.tsx`. This is a mandatory file that replaces `index.html`.
    ```typescript
    import './styles/index.css'; // Assuming your CSS is now in app/styles
    import './styles/App.css';

    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
        <html lang="en">
          <body>{children}</body>
        </html>
      );
    }
    ```

4.  **Create Home Page (`app/page.tsx`):** Create `page.tsx` inside the `app` folder. Copy the main logic from your old `App.tsx` file here.

5.  **Update Components with `'use client'`:**
    *   Add the directive `'use client'` to the top of any file that uses React hooks (`useState`, `useEffect`, etc.) or has event listeners (`onClick`, `onChange`).

6.  **Cleanup:**
    *   Delete the old `App.tsx`, `index.tsx`, and `reportWebVitals.ts` files.
    *   Move your `components`, `types`, `utils`, `hooks`, and `styles` folders into the `app` directory if they aren't already.

### 3.3. Verification & Testing

1.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` and verify that the application runs correctly.

2.  **Run Tests:** Configure Jest for Next.js and run the test suite to ensure all existing tests pass.

## 4. Common Issues & Solutions

-   **Issue:** `localStorage is not defined`
    -   **Solution:** Wrap browser-specific code in a `typeof window !== 'undefined'` check.

-   **Issue:** Drag-and-drop not working.
    -   **Solution:** Ensure the component containing the `<DndContext>` provider has the `'use client'` directive.

-   **Issue:** Styles look different.
    -   **Solution:** Make sure your global CSS files are imported into the root `app/layout.tsx` file.

## 5. Deployment (Vendor-Independent)

The primary deployment strategy is to use Docker to create a portable container that can run on any cloud provider or on-premise server.

1.  **Create a `Dockerfile`** in the project root.
2.  **Build the Docker image:**
    ```bash
    docker build -t roadmapster .
    ```
3.  **Run the container:**
    ```bash
    docker run -p 3000:3000 roadmapster
    ```
This approach gives you full control and avoids vendor lock-in.

## 6. Migration Checklist

### Phase 1: Basic Migration
- [ ] Ensure git history is clean.
- [ ] Uninstall `react-scripts` and install `next`.
- [ ] Update `package.json` scripts.
- [ ] Restructure `src` to `app` directory.
- [ ] Create `layout.tsx` and `page.tsx`.
- [ ] Add `'use client'` to all interactive components.
- [ ] Test that the application runs and all functionality works.
- [ ] Configure and pass all existing tests.
- [ ] Set up Dockerfile for deployment.

### Phase 2: Enhancements (Optional)
- [ ] Optimize images using the Next.js `<Image>` component.
- [ ] Add page metadata for better SEO.
- [ ] Refactor data fetching to use Server Components where applicable.

## 7. Future Roadmap (Post-Migration)

This migration enables a clear path for future backend development.

### V2: Backend Setup
-   **Database:** Integrate a PostgreSQL database using Prisma as the ORM.
-   **Authentication:** Implement authentication using the open-source NextAuth.js library.
-   **API Routes:** Create API endpoints within Next.js to handle data persistence.

### V3: Integrations
-   **Jira Integration:** Build API routes to import epics from Jira.
-   **Calendar Integration:** Sync with calendars to calculate team capacity accurately.
