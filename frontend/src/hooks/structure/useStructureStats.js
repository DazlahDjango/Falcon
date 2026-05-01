import { useQuery } from '@tanstack/react-query';
import { structureAdminService } from '../../services/structure/structureAdmin.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';

export const useStructureStats = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.STRUCTURE_STATS],
    queryFn: () => structureAdminService.getMetrics(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useStructureCounts = () => {
  const { data, isLoading } = useStructureStats();
  return {
    counts: {
      departments: data?.data?.counts?.departments || 0,
      teams: data?.data?.counts?.teams || 0,
      employments: data?.data?.counts?.employments || 0,
      currentEmployments: data?.data?.counts?.current_employments || 0,
      positions: data?.data?.counts?.positions || 0,
      reportingLines: data?.data?.counts?.reporting_lines || 0,
      costCenters: data?.data?.counts?.cost_centers || 0,
      locations: data?.data?.counts?.locations || 0,
    },
    isLoading,
  };
};

export const useStructureRatios = () => {
  const { data, isLoading } = useStructureStats();
  return {
    ratios: {
      avgTeamsPerDepartment: data?.data?.ratios?.avg_teams_per_department || 0,
      avgEmployeesPerTeam: data?.data?.ratios?.avg_employees_per_team || 0,
      reportingLineActivationRate: data?.data?.ratios?.reporting_line_activation_rate || 0,
    },
    isLoading,
  };
};