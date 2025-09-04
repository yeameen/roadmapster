/**
 * Test data factory for generating consistent test data
 * Following Playwright 1.55.0 best practices for test data management
 */

export const testData = {
  /**
   * Generate epic test data
   */
  generateEpic: (overrides?: Partial<Epic>) => {
    const id = `epic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      id,
      title: `Test Epic ${id.substr(-6)}`,
      description: 'This is a test epic for automated testing',
      size: 'M' as EpicSize,
      priority: 'P1' as Priority,
      owner: 'Test Owner',
      status: 'backlog' as EpicStatus,
      ...overrides
    };
  },

  /**
   * Generate quarter test data
   */
  generateQuarter: (overrides?: Partial<Quarter>) => {
    const id = `quarter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      id,
      name: `Q${Math.floor(Math.random() * 4) + 1} 2025`,
      status: 'planning' as QuarterStatus,
      workingDays: 65,
      teamId: 'test-team-1',
      isCollapsed: false,
      ...overrides
    };
  },

  /**
   * Generate team member test data
   */
  generateTeamMember: (overrides?: Partial<TeamMember>) => {
    const names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    return {
      name: `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      vacationDays: Math.floor(Math.random() * 15),
      ...overrides
    };
  },

  /**
   * Generate team test data
   */
  generateTeam: (memberCount: number = 5, overrides?: Partial<Team>) => {
    const id = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const members = Array.from({ length: memberCount }, () => testData.generateTeamMember());
    
    return {
      id,
      name: `Team ${id.substr(-6)}`,
      members,
      oncallRotation: 10,
      bufferPercentage: 20,
      ...overrides
    };
  },

  /**
   * Predefined epic sets for different test scenarios
   */
  epicSets: {
    small: [
      { title: 'Small Feature 1', size: 'XS', priority: 'P2' },
      { title: 'Small Feature 2', size: 'S', priority: 'P2' },
      { title: 'Small Feature 3', size: 'XS', priority: 'P3' }
    ],
    
    mixed: [
      { title: 'Critical Feature', size: 'L', priority: 'P0' },
      { title: 'Important Feature', size: 'M', priority: 'P1' },
      { title: 'Nice to Have', size: 'S', priority: 'P2' },
      { title: 'Tech Debt', size: 'M', priority: 'P3' }
    ],
    
    large: [
      { title: 'Major Initiative 1', size: 'XL', priority: 'P0' },
      { title: 'Major Initiative 2', size: 'L', priority: 'P0' },
      { title: 'Major Initiative 3', size: 'L', priority: 'P1' }
    ],
    
    capacityTest: [
      { title: 'Epic 1 - 5 days', size: 'XS', priority: 'P1' },
      { title: 'Epic 2 - 10 days', size: 'S', priority: 'P1' },
      { title: 'Epic 3 - 20 days', size: 'M', priority: 'P2' },
      { title: 'Epic 4 - 40 days', size: 'L', priority: 'P2' },
      { title: 'Epic 5 - 60 days', size: 'XL', priority: 'P3' }
    ]
  },

  /**
   * Predefined team configurations
   */
  teamConfigs: {
    small: {
      name: 'Small Team',
      members: [
        { name: 'Developer 1', vacationDays: 5 },
        { name: 'Developer 2', vacationDays: 3 }
      ],
      oncallRotation: 5,
      bufferPercentage: 20
    },
    
    medium: {
      name: 'Medium Team',
      members: [
        { name: 'Senior Dev 1', vacationDays: 10 },
        { name: 'Senior Dev 2', vacationDays: 7 },
        { name: 'Mid Dev 1', vacationDays: 5 },
        { name: 'Mid Dev 2', vacationDays: 8 },
        { name: 'Junior Dev', vacationDays: 3 }
      ],
      oncallRotation: 10,
      bufferPercentage: 20
    },
    
    large: {
      name: 'Large Team',
      members: Array.from({ length: 10 }, (_, i) => ({
        name: `Developer ${i + 1}`,
        vacationDays: Math.floor(Math.random() * 10) + 3
      })),
      oncallRotation: 15,
      bufferPercentage: 25
    }
  },

  /**
   * Generate a complete project setup
   */
  generateProjectSetup: () => {
    return {
      team: testData.generateTeam(5),
      quarters: [
        testData.generateQuarter({ name: 'Q1 2025', id: 'q1-2025' }),
        testData.generateQuarter({ name: 'Q2 2025', id: 'q2-2025' }),
        testData.generateQuarter({ name: 'Q3 2025', id: 'q3-2025' }),
        testData.generateQuarter({ name: 'Q4 2025', id: 'q4-2025' })
      ],
      epics: [
        ...testData.epicSets.mixed.map(e => testData.generateEpic(e as any)),
        ...testData.epicSets.small.map(e => testData.generateEpic(e as any))
      ]
    };
  },

  /**
   * Calculate expected capacity
   */
  calculateExpectedCapacity: (team: Team, workingDays: number = 65) => {
    const totalVacationDays = team.members.reduce((sum, m) => sum + m.vacationDays, 0);
    const baseCapacity = team.members.length * workingDays;
    const oncallDays = team.oncallRotation * (workingDays / 65);
    const bufferDays = (baseCapacity - totalVacationDays - oncallDays) * (team.bufferPercentage / 100);
    
    return {
      baseCapacity,
      vacationDays: totalVacationDays,
      oncallDays,
      bufferDays: Math.round(bufferDays),
      availableCapacity: Math.round(baseCapacity - totalVacationDays - oncallDays - bufferDays)
    };
  },

  /**
   * Get size in days
   */
  getSizeInDays: (size: EpicSize): number => {
    const sizeMap: Record<EpicSize, number> = {
      'XS': 5,
      'S': 10,
      'M': 20,
      'L': 40,
      'XL': 60
    };
    return sizeMap[size];
  }
};

// Type definitions to match the application
type EpicSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
type Priority = 'P0' | 'P1' | 'P2' | 'P3';
type EpicStatus = 'backlog' | 'planned' | 'in-progress' | 'completed';
type QuarterStatus = 'planning' | 'active' | 'completed';

interface Epic {
  id: string;
  title: string;
  description?: string;
  size: EpicSize;
  priority: Priority;
  owner?: string;
  status: EpicStatus;
  quarterId?: string;
  requiredSkills?: string[];
  position?: number;
}

interface Quarter {
  id: string;
  name: string;
  status: QuarterStatus;
  workingDays: number;
  teamId: string;
  startDate?: Date;
  endDate?: Date;
  isCollapsed: boolean;
}

interface TeamMember {
  name: string;
  vacationDays: number;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  oncallRotation: number;
  bufferPercentage: number;
}