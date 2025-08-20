import { Team, TeamMember, Epic, CapacityCalculation, TSHIRT_SIZE_DAYS } from '../types';

export function calculateTeamCapacity(team: Team, epics: Epic[]): CapacityCalculation {
  // Calculate individual capacities
  const individualCapacities = team.members.map(member => ({
    memberId: member.id,
    capacity: team.quarterWorkingDays - member.vacationDays,
  }));

  // Calculate total team capacity
  const totalTeamCapacity = individualCapacities.reduce(
    (sum, individual) => sum + individual.capacity,
    0
  );

  // Calculate oncall deduction
  const oncallDeduction = team.sprintsInQuarter * team.oncallPerSprint * 10; // 10 days per oncall person

  // Capacity after oncall
  const capacityAfterOncall = totalTeamCapacity - oncallDeduction;

  // Calculate buffer
  const bufferAmount = Math.round(capacityAfterOncall * team.bufferPercentage);

  // Final capacity
  const finalCapacity = capacityAfterOncall - bufferAmount;

  // Calculate used capacity from planned epics
  const usedCapacity = epics
    .filter(epic => epic.status === 'planned')
    .reduce((sum, epic) => sum + TSHIRT_SIZE_DAYS[epic.size], 0);

  // Remaining capacity
  const remainingCapacity = Math.max(0, finalCapacity - usedCapacity);

  // Utilization percentage
  const utilizationPercentage = finalCapacity > 0 
    ? Math.round((usedCapacity / finalCapacity) * 100)
    : 0;

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