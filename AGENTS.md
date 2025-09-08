# Repository Guidelines

## Project Structure & Module Organization
- `app/` – Next.js App Router source (components/, hooks/, styles/, utils/, page.tsx, layout.tsx).
- `tests/` – Playwright E2E suite (e2e/*.spec.ts, pages/ page-objects, fixtures/, config/ setup/teardown, utils/, data/).
- `docs/` and `README.md` – product and usage docs; keep in sync with changes.
- `images/`, `screenshots/` – static assets and visual references.
- `.next/`, `test-results/`, `playwright-report/` – build and test artifacts (do not commit generated content).

## Build, Test, and Development Commands
- `npm run dev` – start the dev server at `http://localhost:3000`.
- `npm run build` – production build with Next.js.
- `npm start` – run the production build locally.
- `npm run lint` – run Next.js/ESLint checks.
- `npm run test:e2e` – run Playwright tests (auto-starts `dev`; ensure port 3000 is free).
- Useful variants: `test:e2e:ui`, `test:e2e:debug`, `test:e2e:headed`, `test:e2e:report`, and per‑project runs like `test:e2e:chrome`.

## Coding Style & Naming Conventions
- Language: TypeScript (TSX for React UI). Indentation: 2 spaces.
- Components: PascalCase in `app/components/` (e.g., `RoadmapBoard.tsx`).
- Utilities, hooks, and types live in `app/utils/`, `app/hooks/`, `app/types/` (camelCase files).
- Type safety: define/extend interfaces in `app/types/index.ts`; avoid `any`.
- Architecture: prefer functional components and hooks; avoid prop drilling; memoize expensive UI with `React.memo`.
- Keep components small, cohesive; colocate styles; run `npm run lint` before pushing.

## Formatting & Linting Tools
- Prettier: configured via `.prettierrc.json` (single quotes, semicolons, trailing commas, 100 cols).
- ESLint: minimal config in `.eslintrc.json` (extends `next/core-web-vitals`).
- Commands: `npm run format`, `npm run format:check`, `npm run lint`, `npm run lint:fix`.

## Testing Guidelines
- Framework: Playwright. Specs under `tests/e2e/**/*.spec.ts`.
- Page Objects in `tests/pages/*.ts`; reuse fixtures from `tests/fixtures/`.
- Run UAT flows after significant changes: `tests/e2e/uat-manual-test.spec.ts`.
- Traces/screenshots/videos saved to `test-results/`; HTML report in `playwright-report/`.
- No strict coverage gate; prioritize critical flows (drag/drop, capacity, persistence).

## Commit & Pull Request Guidelines
- Commits: imperative, concise subjects (e.g., "Fix drag-and-drop jitter"); scope optional.
- PRs: clear description, linked issues, reproduction steps, and screenshots for UI changes.
- Before opening: run `npm run lint`, `npm run test:e2e`, and UAT spec; update `docs/`/`README.md` if behavior changes.

## Security & Environment
- Do not commit secrets. Use env vars via Next conventions when introduced.
- Recommended Node: Active LTS (v18+). Clean artifacts with `rm -rf .next test-results playwright-report` if needed.

## Agent-Specific Notes
- Follow this file’s conventions. Prefer minimal diffs, keep changes scoped, and update tests alongside code.
