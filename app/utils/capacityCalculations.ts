import { Team, TeamMember, Epic, CapacityCalculation, TSHIRT_SIZE_DAYS } from '../types';

export function calculateTeamCapacity(team: Team, epics: Epic[]): CapacityCalculation {
  // Calculate individual capacities (ensure non-negative)
  const individualCapacities = team.members.map(member => ({
    memberId: member.id,
    capacity: Math.max(0, team.quarterWorkingDays - member.vacationDays),
  }));

  // Calculate total team capacity
  const totalTeamCapacity = individualCapacities.reduce(
    (sum, individual) => sum + individual.capacity,
    0
  );

  // Calculate oncall deduction (cap at total capacity to prevent negative)
  const oncallDeduction = Math.min(
    totalTeamCapacity,
    team.sprintsInQuarter * team.oncallPerSprint * 10 // 10 days per oncall person
  );

  // Capacity after oncall (ensure non-negative)
  const capacityAfterOncall = Math.max(0, totalTeamCapacity - oncallDeduction);

  // Calculate buffer (ensure buffer percentage is between 0 and 1)
  const bufferPercentage = Math.min(1, Math.max(0, team.bufferPercentage));
  const bufferAmount = Math.round(capacityAfterOncall * bufferPercentage);

  // Final capacity (ensure non-negative)
  const finalCapacity = Math.max(0, capacityAfterOncall - bufferAmount);

  // Calculate used capacity from planned epics
  const usedCapacity = epics
    .filter(epic => epic.status === 'planned')
    .reduce((sum, epic) => sum + TSHIRT_SIZE_DAYS[epic.size], 0);

  // Remaining capacity (ensure non-negative)
  const remainingCapacity = Math.max(0, finalCapacity - usedCapacity);

  // Utilization percentage (handle edge cases)
  const utilizationPercentage = finalCapacity > 0 
    ? Math.min(100, Math.round((usedCapacity / finalCapacity) * 100))
    : usedCapacity > 0 ? 100 : 0;

  return {
    individualCapacities,
    totalTeamCapacity,
    oncallDeduction,
    capacityAfterOncall,
    bufferAmount,
    finalCapacity,
    usedCapacity,
    remainingCapacity,
    utilizationPercentage,
  };
}

export function getCapacityStatusColor(utilizationPercentage: number): string {
  if (utilizationPercentage <= 70) return '#10B981'; // green
  if (utilizationPercentage <= 90) return '#F59E0B'; // yellow
  return '#EF4444'; // red
}

export function canAddEpic(
  epic: Epic,
  currentCapacity: CapacityCalculation
): boolean {
  const epicSize = TSHIRT_SIZE_DAYS[epic.size];
  return epicSize <= currentCapacity.remainingCapacity;
}