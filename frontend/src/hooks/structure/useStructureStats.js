import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/structure/dashboard.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';

export const useStructureStats = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.STRUCTURE_STATS],
    queryFn: () => dashboardService.getMetrics(),
    select: (r) => (r && typeof r === 'object' && 'data' in r ? r.data : r),
    staleTime: 10 * 60 * 1000,
  });
};

export const useStructureCounts = () => {
  const { data, isLoading } = useStructureStats();
  return {
    counts: {
      departments: data?.counts?.departments || 0,
      teams: data?.counts?.teams || 0,
      employments: data?.counts?.employments || 0,
      currentEmployments: data?.counts?.current_employments || 0,
      positions: data?.counts?.positions || 0,
      reportingLines: data?.counts?.reporting_lines || 0,
      costCenters: data?.counts?.cost_centers || 0,
      locations: data?.counts?.locations || 0,
    },
    isLoading,
  };
};

export const useStructureRatios = () => {
  const { data, isLoading } = useStructureStats();
  return {
    ratios: {
      avgTeamsPerDepartment: data?.ratios?.avg_teams_per_department || 0,
      avgEmployeesPerTeam: data?.ratios?.avg_employees_per_team || 0,
      reportingLineActivationRate: data?.ratios?.reporting_line_activation_rate || 0,
    },
    isLoading,
  };
};