import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSuperAdminDashboard,
  fetchClientAdminDashboard,
  clearDashboard,
  clearSuperAdminDashboard,
  clearClientAdminDashboard,
  clearErrors,
} from '../../store/tenant/slice/dashboard.slice';

import {
  selectSuperAdminDashboard,
  selectClientAdminDashboard,
  selectDashboardLoading,
  selectDashboardError,
  selectSuperAdminDashboardLoading,
  selectClientAdminDashboardLoading,
  selectSuperAdminLastFetched,
  selectClientAdminLastFetched,
  selectSuperAdminDashboardIsStale,
  selectClientAdminDashboardIsStale,
  selectSuperAdminOrganizations,
  selectSuperAdminUsers,
  selectSuperAdminProvisioning,
  selectSuperAdminTenantIsolation,
  selectSuperAdminDomains,
  selectSuperAdminConnections,
  selectSuperAdminResources,
  selectSuperAdminMigrations,
  selectSuperAdminHealth,
  selectSuperAdminRecentOrganizations,
  selectSuperAdminStatusDistribution,
  selectSuperAdminSectorDistribution,
  selectSuperAdminSubscriptionDistribution,
  selectClientAdminOrganization,
  selectClientAdminUsers,
  selectClientAdminDomains,
  selectClientAdminResources,
  selectClientAdminTenantIsolation,
  selectClientAdminConnections,
  selectClientAdminProvisioning,
  selectClientAdminMigrations,
  selectClientAdminHealth,
} from '../../store/tenant/selectors/dashboard.selectors';

// ============================================================
// SUPER ADMIN DASHBOARD HOOK
// ============================================================

export const useSuperAdminDashboard = (options = {}) => {
  const { autoFetch = true, refreshInterval = 10000 } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);
  const intervalRef = useRef(null);

  const dashboard = useSelector(selectSuperAdminDashboard);
  const loading = useSelector(selectSuperAdminDashboardLoading) || useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastFetched = useSelector(selectSuperAdminLastFetched);
  const isStale = useSelector(selectSuperAdminDashboardIsStale);

  // Sub-state selectors matching Django SuperAdminDashboardViewSet payload
  const organizations = useSelector(selectSuperAdminOrganizations);
  const statusDistribution = useSelector(selectSuperAdminStatusDistribution);
  const sectorDistribution = useSelector(selectSuperAdminSectorDistribution);
  const subscriptionDistribution = useSelector(selectSuperAdminSubscriptionDistribution);
  const users = useSelector(selectSuperAdminUsers);
  const provisioning = useSelector(selectSuperAdminProvisioning);
  const tenantIsolation = useSelector(selectSuperAdminTenantIsolation);
  const domains = useSelector(selectSuperAdminDomains);
  const connections = useSelector(selectSuperAdminConnections);
  const resources = useSelector(selectSuperAdminResources);
  const migrations = useSelector(selectSuperAdminMigrations);
  const health = useSelector(selectSuperAdminHealth);
  const recentOrganizations = useSelector(selectSuperAdminRecentOrganizations);

  const fetchDashboard = useCallback(() => {
    return dispatch(fetchSuperAdminDashboard()).unwrap();
  }, [dispatch]);

  const refresh = useCallback(() => {
    return fetchDashboard();
  }, [fetchDashboard]);

  const clear = useCallback(() => {
    dispatch(clearSuperAdminDashboard());
  }, [dispatch]);

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
    isStale,

    // Sub-data sections
    organizations,
    statusDistribution,
    sectorDistribution,
    subscriptionDistribution,
    users,
    provisioning,
    tenantIsolation,
    domains,
    connections,
    resources,
    migrations,
    health,
    recentOrganizations,

    // Actions
    fetchDashboard,
    refresh,
    clear,
    clearAll,
    clearAllErrors,
  }), [
    dashboard,
    loading,
    error,
    lastFetched,
    isStale,
    organizations,
    statusDistribution,
    sectorDistribution,
    subscriptionDistribution,
    users,
    provisioning,
    tenantIsolation,
    domains,
    connections,
    resources,
    migrations,
    health,
    recentOrganizations,
    fetchDashboard,
    refresh,
    clear,
    clearAll,
    clearAllErrors,
  ]);
};

// ============================================================
// CLIENT ADMIN DASHBOARD HOOK
// ============================================================

export const useClientAdminDashboard = (options = {}) => {
  const { autoFetch = true, refreshInterval = 10000 } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);
  const intervalRef = useRef(null);

  const dashboard = useSelector(selectClientAdminDashboard);
  const loading = useSelector(selectClientAdminDashboardLoading) || useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastFetched = useSelector(selectClientAdminLastFetched);
  const isStale = useSelector(selectClientAdminDashboardIsStale);

  // Sub-state selectors matching Django ClientAdminDashboardViewSet payload
  const organization = useSelector(selectClientAdminOrganization);
  const users = useSelector(selectClientAdminUsers);
  const domains = useSelector(selectClientAdminDomains);
  const resources = useSelector(selectClientAdminResources);
  const tenantIsolation = useSelector(selectClientAdminTenantIsolation);
  const connections = useSelector(selectClientAdminConnections);
  const provisioning = useSelector(selectClientAdminProvisioning);
  const migrations = useSelector(selectClientAdminMigrations);
  const health = useSelector(selectClientAdminHealth);

  const fetchDashboard = useCallback(() => {
    return dispatch(fetchClientAdminDashboard()).unwrap();
  }, [dispatch]);

  const refresh = useCallback(() => {
    return fetchDashboard();
  }, [fetchDashboard]);

  const clear = useCallback(() => {
    dispatch(clearClientAdminDashboard());
  }, [dispatch]);

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
    isStale,

    // Sub-data sections
    organization,
    users,
    domains,
    resources,
    tenantIsolation,
    connections,
    provisioning,
    migrations,
    health,

    // Actions
    fetchDashboard,
    refresh,
    clear,
    clearAll,
    clearAllErrors,
  }), [
    dashboard,
    loading,
    error,
    lastFetched,
    isStale,
    organization,
    users,
    domains,
    resources,
    tenantIsolation,
    connections,
    provisioning,
    migrations,
    health,
    fetchDashboard,
    refresh,
    clear,
    clearAll,
    clearAllErrors,
  ]);
};