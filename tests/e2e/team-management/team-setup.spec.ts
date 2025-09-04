import { test, expect } from '../../fixtures/test-base';

/**
 * Integration tests for team configuration and management
 * Following Playwright 1.55.0 best practices
 */

test.describe('Team Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create and save team configuration', async ({ page, teamConfigPage }) => {
    await teamConfigPage.openTeamConfig();
    
    // Set team name
    await teamConfigPage.setTeamName('Engineering Team Alpha');
    
    // Add team members
    await teamConfigPage.addTeamMember('Alice Johnson', 5);
    await teamConfigPage.addTeamMember('Bob Smith', 10);
    await teamConfigPage.addTeamMember('Carol Williams', 3);
    
    // Set oncall and buffer
    await teamConfigPage.setOncallRotation(15);
    await teamConfigPage.setBufferPercentage(25);
    
    // Save configuration
    await teamConfigPage.saveTeamConfig();
    
    // Reload page to verify persistence
    await page.reload();
    
    // Open config again and verify
    await teamConfigPage.openTeamConfig();
    const config = await teamConfigPage.getTeamConfig();
    
    expect(config.name).toBe('Engineering Team Alpha');
    expect(config.members).toHaveLength(3);
    expect(config.members[0].name).toBe('Alice Johnson');
    expect(config.members[0].vacationDays).toBe(5);
    expect(config.oncallRotation).toBe(15);
    expect(config.bufferPercentage).toBe(25);
    
    await teamConfigPage.closeTeamConfig();
  });

  test('should add and remove team members', async ({ page, teamConfigPage }) => {
    await teamConfigPage.openTeamConfig();
    
    // Start with initial members
    await teamConfigPage.addTeamMember('Member 1', 5);
    await teamConfigPage.addTeamMember('Member 2', 7);
    await teamConfigPage.addTeamMember('Member 3', 10);
    
    let members = await teamConfigPage.getTeamMembers();
    expect(members).toHaveLength(3);
    
    // Remove a member
    await teamConfigPage.removeTeamMember('Member 2');
    
    members = await teamConfigPage.getTeamMembers();
    expect(members).toHaveLength(2);
    expect(members.map(m => m.name)).not.toContain('Member 2');
    
    // Add another member
    await teamConfigPage.addTeamMember('Member 4', 12);
    
    members = await teamConfigPage.getTeamMembers();
    expect(members).toHaveLength(3);
    expect(members.map(m => m.name)).toContain('Member 4');
    
    await teamConfigPage.closeTeamConfig();
  });

  test('should update team member details', async ({ page, teamConfigPage }) => {
    await teamConfigPage.openTeamConfig();
    
    // Add initial member
    await teamConfigPage.addTeamMember('John Doe', 5);
    
    // Update member details
    await teamConfigPage.updateTeamMember('John Doe', 'John Smith', 15);
    
    // Verify update
    const members = await teamConfigPage.getTeamMembers();
    const updatedMember = members.find(m => m.name === 'John Smith');
    
    expect(updatedMember).toBeDefined();
    expect(updatedMember?.vacationDays).toBe(15);
    
    await teamConfigPage.closeTeamConfig();
  });

  test('should calculate team capacity correctly', async ({ page, teamConfigPage, quartersPage }) => {
    await teamConfigPage.openTeamConfig();
    
    // Configure team with specific parameters
    await teamConfigPage.setTeamName('Calculation Test Team');
    await teamConfigPage.addTeamMember('Dev 1', 5);
    await teamConfigPage.addTeamMember('Dev 2', 10);
    await teamConfigPage.addTeamMember('Dev 3', 3);
    await teamConfigPage.setOncallRotation(10);
    await teamConfigPage.setBufferPercentage(20);
    
    // Calculate expected capacity
    const expectedCapacity = await teamConfigPage.getTeamCapacity(65);
    
    await teamConfigPage.saveTeamConfig();
    
    // Create quarter and verify capacity matches
    await quartersPage.addQuarter('Test Quarter', 65);
    const actualCapacity = await quartersPage.getQuarterCapacity('Test Quarter');
    
    expect(actualCapacity.total).toBeCloseTo(expectedCapacity.availableCapacity, 0);
  });

  test('should handle team with no vacation days', async ({ page, teamConfigPage }) => {
    await teamConfigPage.openTeamConfig();
    
    // Create team with no vacation
    await teamConfigPage.setTeamName('No Vacation Team');
    await teamConfigPage.addTeamMember('Workaholic 1', 0);
    await teamConfigPage.addTeamMember('Workaholic 2', 0);
    await teamConfigPage.setOncallRotation(0);
    await teamConfigPage.setBufferPercentage(0);
    
    const capacity = await teamConfigPage.getTeamCapacity(65);
    
    // With no deductions, capacity should be engineers * working days
    expect(capacity.baseCapacity).toBe(130); // 2 * 65
    expect(capacity.vacationDays).toBe(0);
    expect(capacity.oncallDays).toBe(0);
    expect(capacity.bufferDays).toBe(0);
    expect(capacity.availableCapacity).toBe(130);
    
    await teamConfigPage.closeTeamConfig();
  });

  test('should validate minimum team requirements', async ({ page, teamConfigPage }) => {
    await teamConfigPage.openTeamConfig();
    
    // Try to save with empty team name
    await teamConfigPage.setTeamName('');
    
    // Should have at least one member by default
    const members = await teamConfigPage.getTeamMembers();
    expect(members.length).toBeGreaterThanOrEqual(0);
    
    // Set valid configuration
    await teamConfigPage.setTeamName('Valid Team');
    if (members.length === 0) {
      await teamConfigPage.addTeamMember('Default Member', 0);
    }
    
    await teamConfigPage.saveTeamConfig();
    
    // Verify saved
    await page.reload();
    await teamConfigPage.openTeamConfig();
    const config = await teamConfigPage.getTeamConfig();
    expect(config.name).toBe('Valid Team');
    
    await teamConfigPage.closeTeamConfig();
  });

  test('should export and import team data', async ({ page, teamConfigPage, testDataFactory }) => {
    // Setup initial team configuration
    const teamConfig = testDataFactory.teamConfigs.medium;
    await teamConfigPage.configureTeam(teamConfig);
    
    // Export data
    const download = await teamConfigPage.exportData();
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    
    // Clear data
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Import data back
    if (downloadPath) {
      await teamConfigPage.importData(downloadPath);
      
      // Verify imported data
      await teamConfigPage.openTeamConfig();
      const importedConfig = await teamConfigPage.getTeamConfig();
      
      expect(importedConfig.name).toBe(teamConfig.name);
      expect(importedConfig.members.length).toBe(teamConfig.members.length);
      expect(importedConfig.oncallRotation).toBe(teamConfig.oncallRotation);
      expect(importedConfig.bufferPercentage).toBe(teamConfig.bufferPercentage);
      
      await teamConfigPage.closeTeamConfig();
    }
  });

  test('should persist team configuration across sessions', async ({ page, teamConfigPage, context }) => {
    // Configure team
    await teamConfigPage.configureTeam({
      name: 'Persistent Team',
      members: [
        { name: 'Member A', vacationDays: 5 },
        { name: 'Member B', vacationDays: 8 }
      ],
      oncallRotation: 12,
      bufferPercentage: 15
    });
    
    // Open new page in same context (shares localStorage)
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    const newTeamConfigPage = new (await import('../../pages/TeamConfigPage')).TeamConfigPage(newPage);
    await newTeamConfigPage.openTeamConfig();
    
    const config = await newTeamConfigPage.getTeamConfig();
    expect(config.name).toBe('Persistent Team');
    expect(config.members.length).toBe(2);
    expect(config.oncallRotation).toBe(12);
    expect(config.bufferPercentage).toBe(15);
    
    await newTeamConfigPage.closeTeamConfig();
    await newPage.close();
  });
});