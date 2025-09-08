import { test, expect, testWithFullSetup } from '../../fixtures/test-base';

/**
 * Integration tests for epic drag and drop functionality
 * Following Playwright 1.55.0 best practices with POM and fixtures
 */

test.describe('Epic Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all localStorage data before each test for isolation
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should drag epic from backlog to quarter', async ({ page, backlogPage, quartersPage, testDataFactory }) => {
    // Setup: Create an epic in backlog
    const epicData = testDataFactory.generateEpic({
      title: 'Test Drag Epic',
      size: 'M',
      priority: 'P1'
    });
    
    await backlogPage.addEpic(epicData);
    
    // Setup: Create a quarter
    await quartersPage.addQuarter('Q1 2025', 65);
    
    // Action: Drag epic to quarter
    await quartersPage.dragEpicToQuarter('Test Drag Epic', 'Q1 2025');
    
    // Assertion: Epic should be in quarter
    const epicsInQuarter = await quartersPage.getEpicsInQuarter('Q1 2025');
    expect(epicsInQuarter).toContain('Test Drag Epic');
    
    // Assertion: Epic should not be in backlog
    const backlogCount = await backlogPage.getEpicCount();
    expect(backlogCount).toBe(0);
  });

  test('should prevent dropping epic when capacity exceeded', async ({ page, backlogPage, quartersPage, testDataFactory, teamConfigPage }) => {
    // Setup: Configure small team
    await teamConfigPage.configureTeam(testDataFactory.teamConfigs.small);
    
    // Setup: Create quarter with limited capacity
    await quartersPage.addQuarter('Q1 2025', 65);
    
    // Setup: Add large epics to exceed capacity
    const largeEpic1 = testDataFactory.generateEpic({
      title: 'Large Epic 1',
      size: 'L',
      priority: 'P0'
    });
    
    const largeEpic2 = testDataFactory.generateEpic({
      title: 'Large Epic 2',
      size: 'L',
      priority: 'P0'
    });
    
    await backlogPage.addEpic(largeEpic1);
    await backlogPage.addEpic(largeEpic2);
    
    // Action: Drag first epic (should succeed)
    await quartersPage.dragEpicToQuarter('Large Epic 1', 'Q1 2025');
    
    // Action: Try to drag second epic (should fail due to capacity)
    await quartersPage.dragEpicToQuarter('Large Epic 2', 'Q1 2025');
    
    // Assertion: Only first epic should be in quarter
    const epicsInQuarter = await quartersPage.getEpicsInQuarter('Q1 2025');
    expect(epicsInQuarter).toContain('Large Epic 1');
    expect(epicsInQuarter).not.toContain('Large Epic 2');
    
    // Assertion: Second epic should still be in backlog
    const backlogTitles = await backlogPage.getAllEpicTitles();
    expect(backlogTitles).toContain('Large Epic 2');
    
    // Assertion: Capacity should show warning or danger
    const capacity = await quartersPage.getQuarterCapacity('Q1 2025');
    expect(capacity.percentage).toBeGreaterThan(75);
    expect(['warning', 'danger']).toContain(capacity.status);
  });

  test('should support drag and drop between quarters', async ({ page, quartersPage, backlogPage, testDataFactory }) => {
    // Setup: Create two quarters
    await quartersPage.addQuarter('Q1 2025', 65);
    await quartersPage.addQuarter('Q2 2025', 65);
    
    // Setup: Add epic to Q1
    const epic = testDataFactory.generateEpic({
      title: 'Mobile Epic',
      size: 'S',
      priority: 'P2'
    });
    
    await backlogPage.addEpic(epic);
    await quartersPage.dragEpicToQuarter('Mobile Epic', 'Q1 2025');
    
    // Action: Drag epic from Q1 to Q2
    await quartersPage.dragEpicToQuarter('Mobile Epic', 'Q2 2025');
    
    // Assertion: Epic should be in Q2
    const epicsInQ2 = await quartersPage.getEpicsInQuarter('Q2 2025');
    expect(epicsInQ2).toContain('Mobile Epic');
    
    // Assertion: Epic should not be in Q1
    const epicsInQ1 = await quartersPage.getEpicsInQuarter('Q1 2025');
    expect(epicsInQ1).not.toContain('Mobile Epic');
  });

  test('should handle multiple epic drag operations', async ({ page, backlogPage, quartersPage, testDataFactory }) => {
    // Setup: Create quarter
    await quartersPage.addQuarter('Q1 2025', 65);
    
    // Setup: Add multiple epics
    const epics = testDataFactory.epicSets.small.map(e => 
      testDataFactory.generateEpic(e as any)
    );
    
    for (const epic of epics) {
      await backlogPage.addEpic(epic);
    }
    
    // Action: Drag all epics to quarter
    for (const epic of epics) {
      await quartersPage.dragEpicToQuarter(epic.title, 'Q1 2025');
    }
    
    // Assertion: All epics should be in quarter
    const epicsInQuarter = await quartersPage.getEpicsInQuarter('Q1 2025');
    expect(epicsInQuarter.length).toBe(epics.length);
    
    for (const epic of epics) {
      expect(epicsInQuarter).toContain(epic.title);
    }
    
    // Assertion: Backlog should be empty
    const backlogEmpty = await backlogPage.isEmpty();
    expect(backlogEmpty).toBeTruthy();
  });
});

testWithFullSetup.describe('Epic Drag and Drop with Pre-configured Setup', () => {
  testWithFullSetup.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  testWithFullSetup('should work with pre-existing quarters and team', async ({ 
    page, 
    backlogPage, 
    quartersPage,
    testDataFactory 
  }) => {
    // The test automatically has default team and quarters from fixtures
    
    // Add an epic
    const epic = testDataFactory.generateEpic({
      title: 'Pre-configured Test Epic',
      size: 'M',
      priority: 'P1'
    });
    
    await backlogPage.addEpic(epic);
    
    // Drag to existing quarter
    await quartersPage.dragEpicToQuarter('Pre-configured Test Epic', 'Q1 2025');
    
    // Verify
    const epicsInQuarter = await quartersPage.getEpicsInQuarter('Q1 2025');
    expect(epicsInQuarter).toContain('Pre-configured Test Epic');
  });
});