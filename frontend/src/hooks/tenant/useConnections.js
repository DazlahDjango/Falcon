import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchConnections,
  fetchConnection,
  createConnection,
  updateConnection,
  deleteConnection,
  closeConnection,
  fetchConnectionStatus,
  executeConnectionAction,
  fetchConnectionMetrics,
  runHealthCheck,
  fetchTenantConnections,
  closeTenantConnection,
  fetchTenantConnectionStatus,
  clearCurrentConnection,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  clearMetrics,
  clearTenantConnections,
  clearAllConnections,
  pauseConnection,
  resumeConnection,
  fetchDebugTraces,
} from '../../store/tenant/slice/connection.slice';

import {
  selectConnections,
  selectCurrentConnection,
  selectConnectionLoading,
  selectConnectionDetailsLoading,
  selectConnectionSubmitting,
  selectConnectionError,
  selectConnectionPagination,
  selectConnectionPage,
  selectConnectionTotal,
  selectConnectionTotalPages,
  selectConnectionFilters,
  selectConnectionMetrics,
  selectHealthStatus,
  selectActionResult,
  selectTenantConnections,
  selectConnectionById,
  selectActiveConnections,
  selectIdleConnections,
  selectErrorConnections,
  selectClosedConnections,
  selectConnectionsByOrganization,
  selectConnectionCount,
  selectActiveConnectionCount,
  selectIdleConnectionCount,
  selectErrorConnectionCount,
  selectHasConnections,
  selectHasTenantConnections,
  selectConnectionMetricsSummary,
  selectConnectionHealth,
  selectDebugTraces,
  selectDebugLoading,
} from '../../store/tenant/selectors/connection.selectors';

export const useConnections = (options = {}) => {
  const {
    autoFetch = true,
    filters: initialFilters = {},
    page = 1,
    pageSize = 20,
  } = options;

  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const connections = useSelector(selectConnections);
  const currentConnection = useSelector(selectCurrentConnection);
  const loading = useSelector(selectConnectionLoading);
  const loadingDetails = useSelector(selectConnectionDetailsLoading);
  const submitting = useSelector(selectConnectionSubmitting);
  const error = useSelector(selectConnectionError);
  const pagination = useSelector(selectConnectionPagination);
  const pageNum = useSelector(selectConnectionPage);
  const total = useSelector(selectConnectionTotal);
  const totalPages = useSelector(selectConnectionTotalPages);
  const filters = useSelector(selectConnectionFilters);
  const metrics = useSelector(selectConnectionMetrics);
  const healthStatus = useSelector(selectHealthStatus);
  const actionResult = useSelector(selectActionResult);
  const count = useSelector(selectConnectionCount);
  const activeCount = useSelector(selectActiveConnectionCount);
  const idleCount = useSelector(selectIdleConnectionCount);
  const errorCount = useSelector(selectErrorConnectionCount);
  const hasConnections = useSelector(selectHasConnections);
  const metricsSummary = useSelector(selectConnectionMetricsSummary);
  const connectionHealth = useSelector(selectConnectionHealth);
  const debugTraces = useSelector(selectDebugTraces);
  const debugLoading = useSelector(selectDebugLoading);

  const fetchList = useCallback((params = {}) => {
    const mergedParams = {
      ...filters,
      page: pageNum,
      pageSize,
      ...params,
    };
    return dispatch(fetchConnections(mergedParams)).unwrap();
  }, [dispatch, filters, pageNum, pageSize]);

  const fetchOne = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Connection ID is required'));
    return dispatch(fetchConnection(id)).unwrap();
  }, [dispatch]);

  const create = useCallback((data) => {
    if (!data) return Promise.reject(new Error('Connection data is required'));
    if (!data.organization_id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(createConnection(data)).unwrap();
  }, [dispatch]);

  const update = useCallback((id, data) => {
    if (!id) return Promise.reject(new Error('Connection ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateConnection({ id, data })).unwrap();
  }, [dispatch]);

  const remove = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Connection ID is required'));
    return dispatch(deleteConnection(id)).unwrap();
  }, [dispatch]);

  const close = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Connection ID is required'));
    return dispatch(closeConnection(id)).unwrap();
  }, [dispatch]);

  const fetchStatus = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Connection ID is required'));
    return dispatch(fetchConnectionStatus(id)).unwrap();
  }, [dispatch]);

  const executeAction = useCallback((data) => {
    if (!data) return Promise.reject(new Error('Action data is required'));
    if (!data.action) return Promise.reject(new Error('Action is required'));
    return dispatch(executeConnectionAction(data)).unwrap();
  }, [dispatch]);

  const fetchMetrics = useCallback((params = {}) => {
    return dispatch(fetchConnectionMetrics(params)).unwrap();
  }, [dispatch]);

  const healthCheck = useCallback((data = {}) => {
    return dispatch(runHealthCheck(data)).unwrap();
  }, [dispatch]);

  const fetchTenant = useCallback((tenantId, params = {}) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    return dispatch(fetchTenantConnections({ tenantId, params })).unwrap();
  }, [dispatch]);

  const closeTenant = useCallback((tenantId, connectionId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    if (!connectionId) return Promise.reject(new Error('Connection ID is required'));
    return dispatch(closeTenantConnection({ tenantId, connectionId })).unwrap();
  }, [dispatch]);

  const fetchTenantStatus = useCallback((tenantId, connectionId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    if (!connectionId) return Promise.reject(new Error('Connection ID is required'));
    return dispatch(fetchTenantConnectionStatus({ tenantId, connectionId })).unwrap();
  }, [dispatch]);

  const pause = useCallback((organizationId) => {
    if (!organizationId) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(pauseConnection(organizationId)).unwrap();
  }, [dispatch]);

  const resume = useCallback((organizationId) => {
    if (!organizationId) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(resumeConnection(organizationId)).unwrap();
  }, [dispatch]);

  const fetchDebug = useCallback(() => {
    return dispatch(fetchDebugTraces()).unwrap();
  }, [dispatch]);

  const updateFilters = useCallback((newFilters) => {
    const nf = { ...newFilters };
    if (nf.status && typeof nf.status === 'string') nf.status = nf.status.toUpperCase();
    dispatch(setFilters(nf));
  }, [dispatch]);

  const resetAllFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const updatePagination = useCallback((newPagination) => {
    dispatch(setPagination(newPagination));
  }, [dispatch]);

  const setPage = useCallback((page) => {
    dispatch(setPagination({ page }));
    dispatch(fetchConnections({ page }));
  }, [dispatch]);

  const setPageSize = useCallback((pageSize) => {
    dispatch(setPagination({ pageSize, page: 1 }));
    dispatch(fetchConnections({ pageSize, page: 1 }));
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentConnection());
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearAllMetrics = useCallback(() => {
    dispatch(clearMetrics());
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(clearAllConnections());
  }, [dispatch]);

  const getById = useCallback((id) => {
    return useSelector((state) => selectConnectionById(state, id));
  }, []);

  const getActive = useCallback(() => {
    return useSelector(selectActiveConnections);
  }, []);

  const getIdle = useCallback(() => {
    return useSelector(selectIdleConnections);
  }, []);

  const getError = useCallback(() => {
    return useSelector(selectErrorConnections);
  }, []);

  const getClosed = useCallback(() => {
    return useSelector(selectClosedConnections);
  }, []);

  const getByOrg = useCallback((orgId) => {
    return useSelector((state) => selectConnectionsByOrganization(state, orgId));
  }, []);

  const getTenantConnections = useCallback((tenantId) => {
    return useSelector((state) => selectTenantConnections(state, tenantId));
  }, []);

  const hasTenantConnections = useCallback((tenantId) => {
    return useSelector((state) => selectHasTenantConnections(state, tenantId));
  }, []);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchList(initialFilters);
    }
  }, [autoFetch, initialFilters, fetchList]);

  return useMemo(() => ({
    connections,
    currentConnection,
    loading,
    loadingDetails,
    submitting,
    error,
    pagination,
    page: pageNum,
    pageSize,
    total,
    totalPages,
    filters,
    metrics,
    healthStatus,
    actionResult,
    count,
    activeCount,
    idleCount,
    errorCount,
    hasConnections,
    metricsSummary,
    connectionHealth,
    debugTraces,
    debugLoading,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    close,
    fetchStatus,
    executeAction,
    fetchMetrics,
    healthCheck,
    fetchTenant,
    closeTenant,
    fetchTenantStatus,
    pause,
    resume,
    fetchDebug,
    updateFilters,
    resetAllFilters,
    updatePagination,
    setPage,
    setPageSize,
    clearCurrent,
    clearAllErrors,
    clearAllMetrics,
    clearAll,
    getById,
    getActive,
    getIdle,
    getError,
    getClosed,
    getByOrg,
    getTenantConnections,
    hasTenantConnections,
  }), [
    connections,
    currentConnection,
    loading,
    loadingDetails,
    submitting,
    error,
    pagination,
    pageNum,
    pageSize,
    total,
    totalPages,
    filters,
    metrics,
    healthStatus,
    actionResult,
    count,
    activeCount,
    idleCount,
    errorCount,
    hasConnections,
    metricsSummary,
    connectionHealth,
    debugTraces,
    debugLoading,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    close,
    fetchStatus,
    executeAction,
    fetchMetrics,
    healthCheck,
    fetchTenant,
    closeTenant,
    fetchTenantStatus,
    pause,
    resume,
    fetchDebug,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearCurrent,
    clearAllErrors,
    clearAllMetrics,
    clearAll,
    getById,
    getActive,
    getIdle,
    getError,
    getClosed,
    getByOrg,
    getTenantConnections,
    hasTenantConnections,
  ]);
};

export const useConnection = (id, options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const connection = useSelector((state) => selectConnectionById(state, id));
  const currentConnection = useSelector(selectCurrentConnection);
  const loading = useSelector(selectConnectionDetailsLoading);
  const error = useSelector(selectConnectionError);

  const fetchOne = useCallback((connectionId) => {
    if (!connectionId) return Promise.reject(new Error('Connection ID is required'));
    return dispatch(fetchConnection(connectionId)).unwrap();
  }, [dispatch]);

  const updateOne = useCallback((connectionId, data) => {
    if (!connectionId) return Promise.reject(new Error('Connection ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateConnection({ id: connectionId, data })).unwrap();
  }, [dispatch]);

  const removeOne = useCallback((connectionId) => {
    if (!connectionId) return Promise.reject(new Error('Connection ID is required'));
    return dispatch(deleteConnection(connectionId)).unwrap();
  }, [dispatch]);

  const closeOne = useCallback((connectionId) => {
    if (!connectionId) return Promise.reject(new Error('Connection ID is required'));
    return dispatch(closeConnection(connectionId)).unwrap();
  }, [dispatch]);

  const fetchStatusOne = useCallback((connectionId) => {
    if (!connectionId) return Promise.reject(new Error('Connection ID is required'));
    return dispatch(fetchConnectionStatus(connectionId)).unwrap();
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentConnection());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && id && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchOne(id);
    }
    return () => {
      clearCurrent();
    };
  }, [autoFetch, id, fetchOne, clearCurrent]);

  return useMemo(() => ({
    connection: connection || currentConnection,
    loading,
    error,
    fetchOne,
    update: updateOne,
    remove: removeOne,
    close: closeOne,
    fetchStatus: fetchStatusOne,
    clearCurrent,
  }), [
    connection,
    currentConnection,
    loading,
    error,
    fetchOne,
    updateOne,
    removeOne,
    closeOne,
    fetchStatusOne,
    clearCurrent,
  ]);
};