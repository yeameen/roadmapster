import { test as base, expect } from '@playwright/test';
import { BacklogPage } from '../pages/BacklogPage';
import { QuartersPage } from '../pages/QuartersPage';
import { TeamConfigPage } from '../pages/TeamConfigPage';
import { testData } from '../data/test-data-factory';

/**
 * Custom test fixture with page objects and common setup
 * Following Playwright 1.55.0 best practices for test isolation
 */
type TestFixtures = {
  backlogPage: BacklogPage;
  quartersPage: QuartersPage;
  teamConfigPage: TeamConfigPage;
  setupDefaultTeam: void;
  setupDefaultQuarters: void;
  clearAllData: void;
  testDataFactory: typeof testData;
};

export const test = base.extend<TestFixtures>({
  /**
   * Page object fixtures - automatically initialized for each test
   */
  backlogPage: async ({ page }, use) => {
    const backlogPage = new BacklogPage(page);
    await use(backlogPage);
  },

  quartersPage: async ({ page }, use) => {
    const quartersPage = new QuartersPage(page);
    await use(quartersPage);
  },

  teamConfigPage: async ({ page }, use) => {
    const teamConfigPage = new TeamConfigPage(page);
    await use(teamConfigPage);
  },

  /**
   * Setup default team configuration
   * Uses auto fixture to run before test
   */
  setupDefaultTeam: [async ({ page }, use) => {
    // Set up default team in localStorage
    await page.addInitScript(() => {
      const defaultTeam = {
        id: 'test-team-1',
        name: 'Test Engineering Team',
        members: [
          { name: 'Alice Johnson', vacationDays: 5 },
          { name: 'Bob Smith', vacationDays: 3 },
          { name: 'Carol Davis', vacationDays: 7 }
        ],
        oncallRotation: 10,
        bufferPercentage: 20
      };
      localStorage.setItem('roadmapster-team', JSON.stringify(defaultTeam));
    });
    await use();
  }, { auto: false }],

  /**
   * Setup default quarters
   */
  setupDefaultQuarters: [async ({ page }, use) => {
    await page.addInitScript(() => {
      const defaultQuarters = [
        {
          id: 'q1-2025',
          name: 'Q1 2025',
          status: 'planning',
          workingDays: 65,
          teamId: 'test-team-1',
          isCollapsed: false
        },
        {
          id: 'q2-2025',
          name: 'Q2 2025',
          status: 'planning',
          workingDays: 65,
          teamId: 'test-team-1',
          isCollapsed: false
        }
      ];
      localStorage.setItem('roadmapster-quarters', JSON.stringify(defaultQuarters));
    });
    await use();
  }, { auto: false }],

  /**
   * Clear all application data
   */
  clearAllData: [async ({ page }, use) => {
    await page.addInitScript(() => {
      // Clear all roadmapster-related localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('roadmapster-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    });
    await use();
  }, { auto: false }],

  /**
   * Test data factory for generating test data
   */
  testDataFactory: async ({}, use) => {
    await use(testData);
  }
});

export { expect };

/**
 * Test configuration for different test scenarios
 */
export const testWithTeam = test.extend<{ useDefaultTeam: void }>({
  useDefaultTeam: [async ({ setupDefaultTeam }, use) => {
    await use(setupDefaultTeam);
  }, { auto: true }]
});

export const testWithFullSetup = test.extend<{ useFullSetup: void }>({
  useFullSetup: [async ({ setupDefaultTeam, setupDefaultQuarters }, use) => {
    await use();
  }, { auto: true }]
});

/**
 * Custom assertions for common test scenarios
 */
export const customExpect = {
  /**
   * Assert capacity is within safe range
   */
  async toHaveSafeCapacity(page: any, quarterName: string) {
    const quartersPage = new QuartersPage(page);
    const capacity = await quartersPage.getQuarterCapacity(quarterName);
    expect(capacity.percentage).toBeLessThan(75);
    expect(capacity.status).toBe('safe');
  },

  /**
   * Assert epic exists in quarter
   */
  async toHaveEpicInQuarter(page: any, epicTitle: string, quarterName: string) {
    const quartersPage = new QuartersPage(page);
    const epics = await quartersPage.getEpicsInQuarter(quarterName);
    expect(epics).toContain(epicTitle);
  },

  /**
   * Assert team has minimum members
   */
  async toHaveMinimumTeamMembers(page: any, minMembers: number) {
    const teamConfigPage = new TeamConfigPage(page);
    await teamConfigPage.openTeamConfig();
    const members = await teamConfigPage.getTeamMembers();
    expect(members.length).toBeGreaterThanOrEqual(minMembers);
    await teamConfigPage.closeTeamConfig();
  }
};