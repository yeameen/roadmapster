import { test, expect } from '../../fixtures/test-base';

/**
 * Integration tests for capacity calculation functionality
 * Following Playwright 1.55.0 best practices
 */

test.describe('Capacity Calculations', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all localStorage data before each test for isolation
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should calculate capacity correctly based on team size', async ({ 
    page, 
    teamConfigPage, 
    quartersPage
  }) => {
    // Setup: Configure team with known parameters
    const teamConfig = {
      name: 'Capacity Test Team',
      members: [
        { name: 'Dev 1', vacationDays: 5 },
        { name: 'Dev 2', vacationDays: 10 },
        { name: 'Dev 3', vacationDays: 3 }
      ],
      oncallRotation: 10,
      bufferPercentage: 20
    };
    
    await teamConfigPage.configureTeam(teamConfig);
    
    // Create quarter
    await quartersPage.addQuarter('Q1 2025', 65);
    
    // Calculate expected capacity using the same formula as the app/UI
    const expectedCapacity = await teamConfigPage.getTeamCapacity(65);
    
    // Get actual capacity
    const actualCapacity = await quartersPage.getQuarterCapacity('Q1 2025');
    
    // Assertion: Total capacity should match calculation
    expect(actualCapacity.total).toBeCloseTo(expectedCapacity.availableCapacity, 0);
  });

  test('should update capacity when adding epics', async ({ 
    page, 
    backlogPage, 
    quartersPage,
    teamConfigPage,
    testDataFactory 
  }) => {
    // Setup: Configure team
    await teamConfigPage.configureTeam(testDataFactory.teamConfigs.medium);
    
    // Create quarter
    await quartersPage.addQuarter('Q2 2025', 65);
    
    // Get initial capacity
    const initialCapacity = await quartersPage.getQuarterCapacity('Q2 2025');
    expect(initialCapacity.used).toBe(0);
    
    // Add small epic (10 days)
    const smallEpic = testDataFactory.generateEpic({
      title: 'Small Epic',
      size: 'S',
      priority: 'P2'
    });
    
    await backlogPage.addEpic(smallEpic);
    await quartersPage.dragEpicToQuarter('Small Epic', 'Q2 2025');
    
    // Check capacity after small epic
    const capacityAfterSmall = await quartersPage.getQuarterCapacity('Q2 2025');
    expect(capacityAfterSmall.used).toBe(10);
    
    // Add medium epic (20 days)
    const mediumEpic = testDataFactory.generateEpic({
      title: 'Medium Epic',
      size: 'M',
      priority: 'P1'
    });
    
    await backlogPage.addEpic(mediumEpic);
    await quartersPage.dragEpicToQuarter('Medium Epic', 'Q2 2025');
    
    // Check capacity after medium epic
    const capacityAfterMedium = await quartersPage.getQuarterCapacity('Q2 2025');
    expect(capacityAfterMedium.used).toBe(30); // 10 + 20
  });

  test('should show capacity warnings at different thresholds', async ({ 
    page, 
    backlogPage, 
    quartersPage,
    teamConfigPage,
    testDataFactory 
  }) => {
    // Setup: Small team for easier capacity testing
    const smallTeam = {
      name: 'Small Test Team',
      members: [
        { name: 'Solo Dev', vacationDays: 0 }
      ],
      oncallRotation: 0,
      bufferPercentage: 0
    };
    
    await teamConfigPage.configureTeam(smallTeam);
    await quartersPage.addQuarter('Q3 2025', 65);
    
    // Initial state: should be safe (green)
    let capacity = await quartersPage.getQuarterCapacity('Q3 2025');
    expect(capacity.status).toBe('safe');
    expect(capacity.percentage).toBe(0);
    
    // Add epics to reach ~50% capacity
    const epic1 = testDataFactory.generateEpic({
      title: 'Epic 30 days',
      size: 'M',
      priority: 'P1'
    });
    
    await backlogPage.addEpic(epic1);
    await quartersPage.dragEpicToQuarter('Epic 30 days', 'Q3 2025');
    
    await backlogPage.addEpic({
      title: 'Epic 10 days',
      size: 'S',
      priority: 'P2'
    });
    await quartersPage.dragEpicToQuarter('Epic 10 days', 'Q3 2025');
    
    // Check: should still be safe at ~61%
    capacity = await quartersPage.getQuarterCapacity('Q3 2025');
    expect(capacity.percentage).toBeGreaterThan(50);
    expect(capacity.percentage).toBeLessThan(75);
    expect(capacity.status).toBe('safe');
    
    // Add more to reach warning threshold (75-90%)
    await backlogPage.addEpic({
      title: 'Epic 15 days',
      size: 'S',
      priority: 'P2'
    });
    await quartersPage.dragEpicToQuarter('Epic 15 days', 'Q3 2025');
    
    // Check: should be warning (orange)
    capacity = await quartersPage.getQuarterCapacity('Q3 2025');
    expect(capacity.percentage).toBeGreaterThan(75);
    expect(capacity.percentage).toBeLessThan(90);
    expect(['warning', 'orange']).toContain(capacity.status);
  });

  test('should recalculate capacity when team configuration changes', async ({ 
    page, 
    teamConfigPage, 
    quartersPage,
    backlogPage,
    testDataFactory 
  }) => {
    // Start with small team
    await teamConfigPage.configureTeam(testDataFactory.teamConfigs.small);
    await quartersPage.addQuarter('Q4 2025', 65);
    
    // Add some epics
    const epics = [
      { title: 'Epic A', size: 'M' as const, priority: 'P1' as const },
      { title: 'Epic B', size: 'L' as const, priority: 'P1' as const }
    ];
    
    for (const epicData of epics) {
      const epic = testDataFactory.generateEpic(epicData);
      await backlogPage.addEpic(epic);
      await quartersPage.dragEpicToQuarter(epic.title, 'Q4 2025');
    }
    
    // Get capacity with small team
    const smallTeamCapacity = await quartersPage.getQuarterCapacity('Q4 2025');
    const smallTeamPercentage = smallTeamCapacity.percentage;
    
    // Update to large team
    await teamConfigPage.configureTeam(testDataFactory.teamConfigs.large);
    
    // Capacity should increase (percentage should decrease)
    const largeTeamCapacity = await quartersPage.getQuarterCapacity('Q4 2025');
    expect(largeTeamCapacity.total).toBeGreaterThan(smallTeamCapacity.total);
    expect(largeTeamCapacity.percentage).toBeLessThan(smallTeamPercentage);
    
    // Used capacity should remain the same
    expect(largeTeamCapacity.used).toBe(smallTeamCapacity.used);
  });

  test('should handle vacation days in capacity calculation', async ({ 
    page, 
    teamConfigPage, 
    quartersPage 
  }) => {
    // Team without vacation
    const noVacationTeam = {
      name: 'No Vacation Team',
      members: [
        { name: 'Worker 1', vacationDays: 0 },
        { name: 'Worker 2', vacationDays: 0 }
      ],
      oncallRotation: 0,
      bufferPercentage: 0
    };
    
    await teamConfigPage.configureTeam(noVacationTeam);
    await quartersPage.addQuarter('Q1 No Vacation', 65);
    
    const noVacationCapacity = await quartersPage.getQuarterCapacity('Q1 No Vacation');
    
    // Team with vacation
    const vacationTeam = {
      name: 'Vacation Team',
      members: [
        { name: 'Worker 1', vacationDays: 10 },
        { name: 'Worker 2', vacationDays: 10 }
      ],
      oncallRotation: 0,
      bufferPercentage: 0
    };
    
    await teamConfigPage.configureTeam(vacationTeam);
    await quartersPage.addQuarter('Q2 Vacation', 65);
    
    const vacationCapacity = await quartersPage.getQuarterCapacity('Q2 Vacation');
    
    // Capacity should be reduced by vacation days
    expect(vacationCapacity.total).toBe(noVacationCapacity.total - 20);
  });

  test('should display capacity bar with correct visual indicators', async ({ 
    page, 
    quartersPage,
    teamConfigPage,
    testDataFactory 
  }) => {
    await teamConfigPage.configureTeam(testDataFactory.teamConfigs.medium);
    await quartersPage.addQuarter('Visual Test Q', 65);
    
    // Get the quarter element
    const quarter = quartersPage.getQuarterByName('Visual Test Q');
    
    // Check for capacity bar presence
    const capacityBar = quarter.locator('.capacity-bar');
    await expect(capacityBar).toBeVisible();
    
    // Check for capacity text
    const capacityText = quarter.locator('.capacity-text, [class*="capacity"]');
    await expect(capacityText).toBeVisible();
    
    const text = await capacityText.textContent();
    expect(text).toMatch(/\d+\s*\/\s*\d+/); // Should match pattern like "0 / 150"
    
    // Verify bar color changes (initially should be safe/green)
    const initialClass = await capacityBar.getAttribute('class');
    expect(initialClass).toMatch(/safe|green/i);
  });
});
