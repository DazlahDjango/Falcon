import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchHealth,
  fetchOrganizationsHealth,
  clearHealth,
  clearErrors,
} from '../../store/tenant/slice/health.slice';

import {
  selectHealth,
  selectOrganizationsHealth,
  selectHealthLoading,
  selectHealthError,
  selectHealthLastChecked,
  selectDatabaseHealth,
  selectSchemaHealth,
  selectOrganizationHealth,
  selectIsDatabaseHealthy,
  selectIsSchemaHealthy,
  selectIsOrganizationHealthy,
  selectIsOverallHealthy,
  selectOrganizationsHealthList,
  selectTotalOrganizationsHealth,
  selectHealthyOrganizationsCount,
  selectUnhealthyOrganizationsCount,
  selectUnhealthyOrganizations,
  selectHealthyOrganizations,
  selectHasHealthData,
  selectHasOrganizationsHealthData,
  selectHealthIsStale,
  selectHealthSummary,
} from '../../store/tenant/selectors/health.selectors';

export const useHealth = (options = {}) => {
  const { autoFetch = true, refreshInterval = 0 } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);
  const intervalRef = useRef(null);

  const health = useSelector(selectHealth);
  const loading = useSelector(selectHealthLoading);
  const error = useSelector(selectHealthError);
  const lastChecked = useSelector(selectHealthLastChecked);
  const database = useSelector(selectDatabaseHealth);
  const schema = useSelector(selectSchemaHealth);
  const organization = useSelector(selectOrganizationHealth);
  const isDatabaseHealthy = useSelector(selectIsDatabaseHealthy);
  const isSchemaHealthy = useSelector(selectIsSchemaHealthy);
  const isOrganizationHealthy = useSelector(selectIsOrganizationHealthy);
  const isOverallHealthy = useSelector(selectIsOverallHealthy);
  const hasHealthData = useSelector(selectHasHealthData);
  const isStale = useSelector(selectHealthIsStale);
  const summary = useSelector(selectHealthSummary);

  const fetchHealthData = useCallback(() => {
    return dispatch(fetchHealth()).unwrap();
  }, [dispatch]);

  const refresh = useCallback(() => {
    return fetchHealthData();
  }, [fetchHealthData]);

  const clearAll = useCallback(() => {
    dispatch(clearHealth());
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchHealthData();
    }
  }, [autoFetch, fetchHealthData]);

  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchHealthData();
      }, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, fetchHealthData]);

  return useMemo(() => ({
    health,
    loading,
    error,
    lastChecked,
    database,
    schema,
    organization,
    isDatabaseHealthy,
    isSchemaHealthy,
    isOrganizationHealthy,
    isOverallHealthy,
    hasHealthData,
    isStale,
    summary,
    fetchHealth: fetchHealthData,
    refresh,
    clearAll,
    clearAllErrors,
  }), [
    health,
    loading,
    error,
    lastChecked,
    database,
    schema,
    organization,
    isDatabaseHealthy,
    isSchemaHealthy,
    isOrganizationHealthy,
    isOverallHealthy,
    hasHealthData,
    isStale,
    summary,
    fetchHealthData,
    refresh,
    clearAll,
    clearAllErrors,
  ]);
};

export const useOrganizationsHealth = (options = {}) => {
  const { autoFetch = true, refreshInterval = 0 } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);
  const intervalRef = useRef(null);

  const organizationsHealth = useSelector(selectOrganizationsHealth);
  const loading = useSelector(selectHealthLoading);
  const error = useSelector(selectHealthError);
  const lastChecked = useSelector(selectHealthLastChecked);
  const list = useSelector(selectOrganizationsHealthList);
  const total = useSelector(selectTotalOrganizationsHealth);
  const healthyCount = useSelector(selectHealthyOrganizationsCount);
  const unhealthyCount = useSelector(selectUnhealthyOrganizationsCount);
  const unhealthy = useSelector(selectUnhealthyOrganizations);
  const healthy = useSelector(selectHealthyOrganizations);
  const hasData = useSelector(selectHasOrganizationsHealthData);
  const isStale = useSelector(selectHealthIsStale);

  const fetchHealthData = useCallback(() => {
    return dispatch(fetchOrganizationsHealth()).unwrap();
  }, [dispatch]);

  const refresh = useCallback(() => {
    return fetchHealthData();
  }, [fetchHealthData]);

  const clearAll = useCallback(() => {
    dispatch(clearHealth());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchHealthData();
    }
  }, [autoFetch, fetchHealthData]);

  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchHealthData();
      }, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, fetchHealthData]);

  return useMemo(() => ({
    organizationsHealth,
    loading,
    error,
    lastChecked,
    list,
    total,
    healthyCount,
    unhealthyCount,
    unhealthy,
    healthy,
    hasData,
    isStale,
    fetchHealth: fetchHealthData,
    refresh,
    clearAll,
  }), [
    organizationsHealth,
    loading,
    error,
    lastChecked,
    list,
    total,
    healthyCount,
    unhealthyCount,
    unhealthy,
    healthy,
    hasData,
    isStale,
    fetchHealthData,
    refresh,
    clearAll,
  ]);
};