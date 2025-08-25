
# PRD: Migration from Create React App to Next.js

**Author:** Gemini Agent
**Date:** 2025-08-25
**Status:** Proposed

## 1. Background

The Work Tetris application is currently built using Create React App (CRA). The React team has officially deprecated CRA for new projects and recommends using a full-featured framework like Next.js. Migrating to Next.js will align our project with modern web development standards, improve performance, and enhance the developer experience. This move is aimed at ensuring the application remains simple and maintainable in the long run.

## 2. Goals

*   Successfully migrate the entire application from Create React App to Next.js.
*   Maintain 100% of the existing functionality with no regressions.
*   Simplify the project structure and routing logic by adopting Next.js conventions.
*   Improve the application's initial load performance.
*   Ensure the codebase is easy to understand and maintain.

## 3. Scope

### In Scope

*   **Project Restructuring:** Reorganize the project to follow the Next.js `app` directory structure.
*   **Routing:** Replace the current routing mechanism with Next.js's file-based routing.
*   **Dependency Update:** Install and configure all necessary dependencies in the new Next.js project and remove CRA-specific packages like `react-scripts`.
*   **Component Migration:** Move all existing React components, hooks, types, and utility functions to the new structure.
*   **Static Assets:** Migrate all files from the `public` directory.
*   **Build Process:** Update all scripts (`start`, `build`, `test`) to use Next.js commands.

### Out of Scope

*   **New Features:** No new user-facing features will be added during this migration.
*   **Major Refactoring:** Components will be moved and updated to work with Next.js, but will not undergo significant refactoring unless necessary for the migration.
*   **Server-Side Rendering (SSR):** The initial migration will focus on client-side rendering to match the current architecture. SSR can be implemented later as an optimization.

## 4. Requirements & Implementation Plan

This section outlines the step-by-step plan for the migration.

### 4.1. Project Setup

1.  **Initialize Next.js Project:** Create a new Next.js application in the `app` directory.
2.  **Dependency Migration:**
    *   Review the existing `package.json`.
    *   Install all production dependencies (e.g., `@dnd-kit`, `date-fns`, `lucide-react`).
    *   Install all development dependencies (e.g., `@testing-library`, `@types/*`).
    *   Do **not** install `react-scripts`.

### 4.2. Code Migration

1.  **Copy Source Code:**
    *   Copy the contents of `app/src/components` to `app/components`.
    *   Copy the contents of `app/src/types` to `app/types`.
    *   Copy the contents of `app/src/utils` to `app/utils`.
    *   Copy the contents of `app/src/hooks` to `app/hooks`.
2.  **Migrate Styles:**
    *   Copy `app/src/App.css` and `app/src/index.css` to a new `app/styles` directory.
    *   Import these global styles into the root `app/layout.tsx` file.
3.  **Migrate Public Assets:**
    *   Copy all files from `app/public` to the `public` directory in the new Next.js project root.

### 4.3. Routing & Layout

1.  **Create Root Layout:**
    *   Create `app/layout.tsx`. This file will replace `public/index.html` and will define the root HTML structure.
    *   Import global stylesheets here.
2.  **Create Home Page:**
    *   The main application logic, currently in `App.tsx`, should be moved to `app/page.tsx`. This will be the main entry point of the application.
3.  **Update Imports:**
    *   Next.js supports absolute imports from the root directory. Update all import paths in the migrated components to be cleaner (e.g., `import { MyComponent } from '@/components/MyComponent';`).

### 4.4. Verification

1.  **Run Development Server:** Start the Next.js development server (`npm run dev`) and verify that the application runs without errors.
2.  **Testing:**
    *   Configure Jest to work with Next.js.
    *   Run all existing tests and ensure they pass.
3.  **Build and Serve:**
    *   Run `npm run build` to create a production build.
    *   Run `npm run start` to serve the production build locally and verify its functionality.

## 5. Success Metrics

*   The application is fully functional and passes all tests in the new Next.js environment.
*   The Lighthouse performance score for the main page is equal to or greater than the score before the migration.
*   The project structure is simplified and follows Next.js conventions.
*   The development, build, and test scripts are updated and working correctly.
