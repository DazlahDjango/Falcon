import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/config';
import { CONFIG_QUERY_KEYS } from '../../config/constants/configApiConstants';

export const useConfigDashboard = () => {
  const useOverview = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_OVERVIEW],
      queryFn: () => dashboardService.getOverview(),
      staleTime: 30000,
      refetchInterval: 60000,
      ...options
    });
  };

  const useBackupDashboard = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_BACKUP],
      queryFn: () => dashboardService.getBackupDashboard(),
      staleTime: 30000,
      refetchInterval: 30000,
      ...options
    });
  };

  const useMaintenanceDashboard = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_MAINTENANCE],
      queryFn: () => dashboardService.getMaintenanceDashboard(),
      staleTime: 30000,
      refetchInterval: 30000,
      ...options
    });
  };

  const useHealthDashboard = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_HEALTH],
      queryFn: () => dashboardService.getHealthDashboard(),
      staleTime: 30000,
      refetchInterval: 60000,
      ...options
    });
  };

  const useDRDashboard = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_DR],
      queryFn: () => dashboardService.getDRDashboard(),
      staleTime: 60000,
      ...options
    });
  };

  const useSchedulingDashboard = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_SCHEDULING],
      queryFn: () => dashboardService.getSchedulingDashboard(),
      staleTime: 60000,
      ...options
    });
  };

  const useSecurityDashboard = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_SECURITY],
      queryFn: () => dashboardService.getSecurityDashboard(),
      staleTime: 120000,
      ...options
    });
  };

  const useRecentActivity = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_RECENT],
      queryFn: () => dashboardService.getRecentActivity(),
      staleTime: 15000,
      refetchInterval: 30000,
      ...options
    });
  };

  const useSystemStatus = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_STATUS],
      queryFn: () => dashboardService.getSystemStatus(),
      staleTime: 10000,
      refetchInterval: 30000,
      ...options
    });
  };

  const useAllDashboardData = (options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_OVERVIEW, 'all'],
      queryFn: () => dashboardService.getAllDashboardData(),
      staleTime: 30000,
      ...options
    });
  };

  return {
    useOverview,
    useBackupDashboard,
    useMaintenanceDashboard,
    useHealthDashboard,
    useDRDashboard,
    useSchedulingDashboard,
    useSecurityDashboard,
    useRecentActivity,
    useSystemStatus,
    useAllDashboardData
  };
};