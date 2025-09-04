# Playwright Integration Tests

This directory contains the Playwright integration test suite for the Roadmapster application, following 2025 best practices for test organization and execution.

## 📁 Directory Structure

```
tests/
├── e2e/                          # End-to-end tests by feature
│   ├── capacity-planning/        # Capacity and planning tests
│   ├── team-management/          # Team configuration tests
│   ├── data-persistence/         # Data storage tests
│   └── backlog/                  # Backlog management tests
├── pages/                        # Page Object Model classes
│   ├── BasePage.ts              # Base page with common methods
│   ├── BacklogPage.ts           # Backlog page interactions
│   ├── QuartersPage.ts          # Quarters page interactions
│   └── TeamConfigPage.ts        # Team config page interactions
├── fixtures/                     # Test fixtures and setup
│   └── test-base.ts             # Custom test fixtures
├── data/                         # Test data and factories
│   └── test-data-factory.ts     # Test data generation
├── config/                       # Test configuration
│   ├── global-setup.ts          # Runs before all tests
│   └── global-teardown.ts       # Runs after all tests
└── PLAYWRIGHT_STRUCTURE.md       # Detailed structure documentation
```

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
npx playwright install
```

### Run Tests
```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/capacity-planning/drag-drop-epics.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Run tests with specific project
npx playwright test --project="Desktop Chrome"
```

### Debug Tests
```bash
# Debug mode
npx playwright test --debug

# Generate trace
npx playwright test --trace on

# View test report
npx playwright show-report
```

## 📝 Writing Tests

### Using Page Object Model
```typescript
import { test, expect } from '../fixtures/test-base';

test('example test', async ({ page, backlogPage, quartersPage }) => {
  await page.goto('/');
  
  // Use page objects for interactions
  await backlogPage.addEpic({
    title: 'New Epic',
    size: 'M',
    priority: 'P1'
  });
  
  await quartersPage.dragEpicToQuarter('New Epic', 'Q1 2025');
  
  // Assertions
  const epics = await quartersPage.getEpicsInQuarter('Q1 2025');
  expect(epics).toContain('New Epic');
});
```

### Using Test Fixtures
```typescript
import { testWithFullSetup } from '../fixtures/test-base';

// This test automatically has default team and quarters
testWithFullSetup('test with setup', async ({ page }) => {
  // Test implementation
});
```

### Using Test Data Factory
```typescript
import { test } from '../fixtures/test-base';

test('test with generated data', async ({ testDataFactory }) => {
  const epic = testDataFactory.generateEpic({
    title: 'Custom Epic',
    size: 'L'
  });
  
  const team = testDataFactory.generateTeam(5);
  // Use generated data in test
});
```

## 🎯 Test Categories

### Capacity Planning Tests
- Drag and drop epics between backlog and quarters
- Capacity calculations and warnings
- Quarter management operations
- Multi-quarter planning scenarios

### Team Management Tests
- Team creation and configuration
- Member management (add, remove, update)
- Vacation and oncall settings
- Capacity impact of team changes

### Data Persistence Tests
- localStorage operations
- Import/export functionality
- Session persistence
- Data recovery scenarios

### Backlog Management Tests
- Epic creation and editing
- Epic prioritization
- Search and filter operations
- Bulk operations

## 🔧 Configuration

### Environment Variables
```bash
# Test environment
TEST_ENV=local|staging|production

# Base URL
BASE_URL=http://localhost:3000

# CI/CD
CI=true

# Slow motion for debugging (milliseconds)
SLOW_MO=100

# Storage state for auth
STORAGE_STATE_PATH=./auth-state.json
```

### Playwright Config
The main configuration is in `playwright.config.ts`:
- Multiple browser projects (Chrome, Firefox, Safari, Mobile)
- Parallel execution with 4 workers locally
- Automatic retries on failure
- Screenshots and videos on failure
- HTML and JSON reporters

## 📊 Test Reports

### HTML Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### JSON Report
JSON results are saved to `test-results/results.json`

### Trace Viewer
View test traces for debugging:
```bash
npx playwright show-trace trace.zip
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

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

## 🏗️ Best Practices

1. **Test Isolation**: Each test runs in isolation with its own browser context
2. **Page Object Model**: Use page objects for maintainable tests
3. **Test Data Factory**: Generate consistent test data
4. **Parallel Execution**: Tests run in parallel for speed
5. **Auto-waiting**: Leverage Playwright's auto-wait features
6. **Descriptive Names**: Use clear, descriptive test names
7. **Feature Organization**: Group tests by feature, not type
8. **Custom Fixtures**: Create reusable test setups
9. **Visual Testing**: Use screenshots for visual regression
10. **Cross-browser**: Test across multiple browsers

## 🐛 Debugging Tips

1. Use `--debug` flag for step-by-step debugging
2. Add `await page.pause()` to pause execution
3. Use `--headed` to see the browser
4. Enable `--trace on` for detailed traces
5. Check `test-results/` for screenshots and videos
6. Use `console.log()` in tests for debugging
7. Leverage VS Code Playwright extension

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## 🤝 Contributing

1. Follow the existing test structure
2. Use Page Object Model for new pages
3. Add test data to the factory
4. Write descriptive test names
5. Group related tests in describes
6. Keep tests focused and independent
7. Add appropriate assertions
8. Document complex test scenarios