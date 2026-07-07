import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSuperAdminDashboard,
  fetchClientAdminDashboard,
  fetchOrganizationStats,
  clearDashboard,
  clearErrors,
  clearOrganizationStats,
} from '../../store/tenant/slice/dashboard.slice';

import {
  selectSuperAdminDashboard,
  selectClientAdminDashboard,
  selectOrganizationStats,
  selectDashboardLoading,
  selectDashboardError,
  selectDashboardLastFetched,
  selectSuperAdminOrganizationsStats,
  selectSuperAdminDomainStats,
  selectSuperAdminResourceStats,
  selectSuperAdminTotalUsers,
  selectSuperAdminSystemHealth,
  selectSuperAdminRecentOrganizations,
  selectClientAdminOrganization,
  selectClientAdminTotalUsers,
  selectClientAdminTotalDomains,
  selectClientAdminDomainStatus,
  selectClientAdminResourceUsage,
  selectClientAdminRecentActivity,
  selectOrganizationStatsData,
  selectIsDashboardLoading,
  selectHasDashboardError,
  selectDashboardIsStale,
} from '../../store/tenant/selectors/dashboard.selectors';

export const useSuperAdminDashboard = (options = {}) => {
  const { autoFetch = true, refreshInterval = 0 } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);
  const intervalRef = useRef(null);

  const dashboard = useSelector(selectSuperAdminDashboard);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastFetched = useSelector(selectDashboardLastFetched);
  const orgStats = useSelector(selectSuperAdminOrganizationsStats);
  const domainStats = useSelector(selectSuperAdminDomainStats);
  const resourceStats = useSelector(selectSuperAdminResourceStats);
  const totalUsers = useSelector(selectSuperAdminTotalUsers);
  const systemHealth = useSelector(selectSuperAdminSystemHealth);
  const recentOrgs = useSelector(selectSuperAdminRecentOrganizations);
  const isStale = useSelector(selectDashboardIsStale);

  const fetchDashboard = useCallback(() => {
    return dispatch(fetchSuperAdminDashboard()).unwrap();
  }, [dispatch]);

  const refresh = useCallback(() => {
    return fetchDashboard();
  }, [fetchDashboard]);

  const clearAll = useCallback(() => {
    dispatch(clearDashboard());
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchDashboard();
    }
  }, [autoFetch, fetchDashboard]);

  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchDashboard();
      }, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, fetchDashboard]);

  return useMemo(() => ({
    dashboard,
    loading,
    error,
    lastFetched,
    orgStats,
    domainStats,
    resourceStats,
    totalUsers,
    systemHealth,
    recentOrgs,
    isStale,
    fetchDashboard,
    refresh,
    clearAll,
    clearAllErrors,
  }), [
    dashboard,
    loading,
    error,
    lastFetched,
    orgStats,
    domainStats,
    resourceStats,
    totalUsers,
    systemHealth,
    recentOrgs,
    isStale,
    fetchDashboard,
    refresh,
    clearAll,
    clearAllErrors,
  ]);
};

export const useClientAdminDashboard = (options = {}) => {
  const { autoFetch = true, refreshInterval = 0 } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);
  const intervalRef = useRef(null);

  const dashboard = useSelector(selectClientAdminDashboard);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastFetched = useSelector(selectDashboardLastFetched);
  const organization = useSelector(selectClientAdminOrganization);
  const totalUsers = useSelector(selectClientAdminTotalUsers);
  const totalDomains = useSelector(selectClientAdminTotalDomains);
  const domainStatus = useSelector(selectClientAdminDomainStatus);
  const resourceUsage = useSelector(selectClientAdminResourceUsage);
  const recentActivity = useSelector(selectClientAdminRecentActivity);
  const isStale = useSelector(selectDashboardIsStale);

  const fetchDashboard = useCallback(() => {
    return dispatch(fetchClientAdminDashboard()).unwrap();
  }, [dispatch]);

  const refresh = useCallback(() => {
    return fetchDashboard();
  }, [fetchDashboard]);

  const clearAll = useCallback(() => {
    dispatch(clearDashboard());
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchDashboard();
    }
  }, [autoFetch, fetchDashboard]);

  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchDashboard();
      }, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, fetchDashboard]);

  return useMemo(() => ({
    dashboard,
    loading,
    error,
    lastFetched,
    organization,
    totalUsers,
    totalDomains,
    domainStatus,
    resourceUsage,
    recentActivity,
    isStale,
    fetchDashboard,
    refresh,
    clearAll,
    clearAllErrors,
  }), [
    dashboard,
    loading,
    error,
    lastFetched,
    organization,
    totalUsers,
    totalDomains,
    domainStatus,
    resourceUsage,
    recentActivity,
    isStale,
    fetchDashboard,
    refresh,
    clearAll,
    clearAllErrors,
  ]);
};

export const useOrganizationStats = (organizationId, options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const stats = useSelector(selectOrganizationStats);
  const data = useSelector(selectOrganizationStatsData);
  const loading = useSelector(selectIsDashboardLoading);
  const error = useSelector(selectDashboardError);

  const fetchStats = useCallback((orgId) => {
    if (!orgId) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(fetchOrganizationStats(orgId)).unwrap();
  }, [dispatch]);

  const clearStats = useCallback(() => {
    dispatch(clearOrganizationStats());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && organizationId && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchStats(organizationId);
    }
  }, [autoFetch, organizationId, fetchStats]);

  return useMemo(() => ({
    stats,
    data,
    loading,
    error,
    fetchStats,
    clearStats,
  }), [
    stats,
    data,
    loading,
    error,
    fetchStats,
    clearStats,
  ]);
};