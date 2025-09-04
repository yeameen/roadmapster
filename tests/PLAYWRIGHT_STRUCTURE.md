# Playwright Integration Test Structure for Roadmapster

## Recommended Folder Structure

```
roadmapster/
├── tests/                          # All test-related files
│   ├── e2e/                       # End-to-end tests organized by feature
│   │   ├── capacity-planning/     # Capacity planning feature tests
│   │   │   ├── drag-drop-epics.spec.ts
│   │   │   ├── capacity-calculations.spec.ts
│   │   │   └── quarter-management.spec.ts
│   │   ├── team-management/       # Team configuration tests
│   │   │   ├── team-setup.spec.ts
│   │   │   └── member-management.spec.ts
│   │   ├── data-persistence/      # Data storage tests
│   │   │   ├── local-storage.spec.ts
│   │   │   └── import-export.spec.ts
│   │   └── backlog/              # Backlog management tests
│   │       ├── epic-creation.spec.ts
│   │       └── epic-editing.spec.ts
│   ├── integration/               # API integration tests (future)
│   │   └── jira/
│   │       └── jira-sync.spec.ts
│   ├── pages/                    # Page Object Model (POM)
│   │   ├── BacklogPage.ts
│   │   ├── QuartersPage.ts
│   │   ├── TeamConfigPage.ts
│   │   └── BasePage.ts
│   ├── fixtures/                 # Test fixtures and setup
│   │   ├── auth.ts              # Authentication setup (future)
│   │   ├── test-base.ts         # Base test with common setup
│   │   └── data-fixtures.ts     # Test data factories
│   ├── utils/                    # Test utilities
│   │   ├── helpers.ts           # Common helper functions
│   │   ├── test-data.ts         # Test data generators
│   │   └── assertions.ts        # Custom assertions
│   ├── data/                     # Static test data
│   │   ├── epics.json
│   │   ├── teams.json
│   │   └── quarters.json
│   └── config/                   # Test configuration
│       ├── global-setup.ts      # Global test setup
│       └── global-teardown.ts   # Global test teardown
├── playwright.config.ts          # Main Playwright configuration
├── playwright-ct.config.ts       # Component testing config (optional)
├── .env.test                     # Test environment variables
├── test-results/                 # Test execution results (gitignored)
└── playwright-report/            # HTML reports (gitignored)
```

## File Structure Guidelines

### 1. Test Files (`*.spec.ts`)
```typescript
// tests/e2e/capacity-planning/drag-drop-epics.spec.ts
import { test, expect } from '@playwright/test';
import { QuartersPage } from '../../pages/QuartersPage';
import { BacklogPage } from '../../pages/BacklogPage';

test.describe('Epic Drag and Drop', () => {
  let quartersPage: QuartersPage;
  let backlogPage: BacklogPage;

  test.beforeEach(async ({ page }) => {
    quartersPage = new QuartersPage(page);
    backlogPage = new BacklogPage(page);
    await page.goto('/');
  });

  test('should drag epic from backlog to quarter', async () => {
    // Test implementation
  });
});
```

### 2. Page Object Model (`pages/`)
```typescript
// tests/pages/BacklogPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class BacklogPage extends BasePage {
  private readonly addEpicButton: Locator;
  private readonly epicCards: Locator;

  constructor(page: Page) {
    super(page);
    this.addEpicButton = page.getByRole('button', { name: 'Add Epic' });
    this.epicCards = page.locator('[data-testid="epic-card"]');
  }

  async addEpic(title: string, size: string) {
    await this.addEpicButton.click();
    // Implementation
  }

  async getEpicCount() {
    return await this.epicCards.count();
  }
}
```

### 3. Test Fixtures (`fixtures/`)
```typescript
// tests/fixtures/test-base.ts
import { test as base } from '@playwright/test';
import { TestData } from '../utils/test-data';

type TestFixtures = {
  testData: TestData;
  setupTeam: void;
};

export const test = base.extend<TestFixtures>({
  testData: async ({}, use) => {
    const data = new TestData();
    await use(data);
  },

  setupTeam: async ({ page }, use) => {
    // Set up default team before tests
    await page.evaluate(() => {
      localStorage.setItem('roadmapster-team', JSON.stringify({
        id: 'test-team',
        name: 'Test Team',
        members: [{ name: 'Developer 1', vacationDays: 0 }],
        oncallRotation: 5,
        bufferPercentage: 20
      }));
    });
    await use();
  }
});
```

### 4. Test Data (`data/`)
```json
// tests/data/epics.json
{
  "smallEpic": {
    "title": "Small Feature",
    "size": "S",
    "priority": "P1",
    "description": "A small feature implementation"
  },
  "largeEpic": {
    "title": "Large Initiative",
    "size": "L",
    "priority": "P0",
    "description": "A major platform enhancement"
  }
}
```

## Best Practices Implementation

### 1. Naming Conventions
- Test files: `feature-action.spec.ts` (e.g., `drag-drop-epics.spec.ts`)
- Page objects: `FeaturePage.ts` (PascalCase)
- Utils/helpers: `camelCase.ts`
- Test data: `kebab-case.json`

### 2. Test Organization
- Group by feature/module, not by test type
- Keep related tests together
- Use descriptive test names that explain the scenario

### 3. Data Management
- Use fixtures for complex setup
- Store reusable test data in JSON files
- Generate dynamic data when needed

### 4. Parallelization
```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

### 5. CI/CD Integration
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Migration Plan for Existing Tests

1. **Phase 1**: Create folder structure
2. **Phase 2**: Move existing tests to appropriate feature folders
3. **Phase 3**: Extract common patterns into Page Objects
4. **Phase 4**: Create shared fixtures and utilities
5. **Phase 5**: Add component tests alongside E2E tests

## Commands

```json
// package.json additions
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

## Environment-Specific Configuration

```typescript
// tests/config/environments.ts
export const environments = {
  local: {
    baseURL: 'http://localhost:3000',
    apiURL: 'http://localhost:3001',
  },
  staging: {
    baseURL: 'https://staging.roadmapster.com',
    apiURL: 'https://api-staging.roadmapster.com',
  },
  production: {
    baseURL: 'https://roadmapster.com',
    apiURL: 'https://api.roadmapster.com',
  }
};
```

This structure provides:
- Clear separation of concerns
- Easy navigation and maintenance
- Scalability for future growth
- Support for both E2E and component tests
- CI/CD readiness
- Parallel execution capabilities