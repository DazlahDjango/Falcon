import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAuditLogs,
  fetchAuditLog,
  fetchUserActivity,
  fetchUserActivitySummary,
  fetchTenantActivitySummary,
  fetchSecurityEvents,
  fetchAnomalyDetection,
  fetchComplianceReport,
  fetchObjectHistory,
  exportAuditLogs,
  setAuditFilters,
  setAuditPage,
  clearSelectedLog,
  clearAuditError,
} from '../../store/accounts/slice/auditSlice';
import {
  selectAuditLogs,
  selectSelectedAuditLog,
  selectUserActivity,
  selectUserActivitySummary,
  selectTenantActivitySummary,
  selectSecurityEvents,
  selectAnomalyDetection,
  selectComplianceReport,
  selectObjectHistory,
  selectAuditLoading,
  selectAuditExporting,
  selectAuditError,
  selectAuditPagination,
  selectAuditFilters,
  selectAuditLogById,
} from '../../store/accounts/selectors/auditSelectors';

export const useAudit = () => {
  const dispatch = useDispatch();
  const logs = useSelector(selectAuditLogs);
  const selectedLog = useSelector(selectSelectedAuditLog);
  const userActivity = useSelector(selectUserActivity);
  const userActivitySummary = useSelector(selectUserActivitySummary);
  const tenantActivitySummary = useSelector(selectTenantActivitySummary);
  const securityEvents = useSelector(selectSecurityEvents);
  const anomalyDetection = useSelector(selectAnomalyDetection);
  const complianceReport = useSelector(selectComplianceReport);
  const objectHistory = useSelector(selectObjectHistory);
  const isLoading = useSelector(selectAuditLoading);
  const isExporting = useSelector(selectAuditExporting);
  const error = useSelector(selectAuditError);
  const pagination = useSelector(selectAuditPagination);
  const filters = useSelector(selectAuditFilters);

  const getLogs = useCallback(
    async (params) => {
      const result = await dispatch(fetchAuditLogs(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getLog = useCallback(
    async (id) => {
      const result = await dispatch(fetchAuditLog(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getUserActivity = useCallback(
    async (userId, params) => {
      const result = await dispatch(fetchUserActivity({ userId, params })).unwrap();
      return result;
    },
    [dispatch]
  );

  const getUserSummary = useCallback(
    async (params) => {
      const result = await dispatch(fetchUserActivitySummary(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getTenantSummary = useCallback(
    async (params) => {
      const result = await dispatch(fetchTenantActivitySummary(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getSecurityEvents = useCallback(
    async (params) => {
      const result = await dispatch(fetchSecurityEvents(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getAnomalyDetection = useCallback(
    async (params) => {
      const result = await dispatch(fetchAnomalyDetection(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getComplianceReport = useCallback(
    async (params) => {
      const result = await dispatch(fetchComplianceReport(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getObjectHistory = useCallback(
    async (params) => {
      const result = await dispatch(fetchObjectHistory(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const exportLogs = useCallback(
    async (data) => {
      const result = await dispatch(exportAuditLogs(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setAuditFilters(newFilters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page) => {
      dispatch(setAuditPage(page));
    },
    [dispatch]
  );

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedLog());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAuditError());
  }, [dispatch]);

  const getLogById = useCallback(
    (id) => {
      return selectAuditLogById({ auditLogs: { logs } }, id);
    },
    [logs]
  );

  return useMemo(
    () => ({
      logs,
      selectedLog,
      userActivity,
      userActivitySummary,
      tenantActivitySummary,
      securityEvents,
      anomalyDetection,
      complianceReport,
      objectHistory,
      isLoading,
      isExporting,
      error,
      pagination,
      filters,
      getLogs,
      getLog,
      getUserActivity,
      getUserSummary,
      getTenantSummary,
      getSecurityEvents,
      getAnomalyDetection,
      getComplianceReport,
      getObjectHistory,
      exportLogs,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getLogById,
    }),
    [
      logs,
      selectedLog,
      userActivity,
      userActivitySummary,
      tenantActivitySummary,
      securityEvents,
      anomalyDetection,
      complianceReport,
      objectHistory,
      isLoading,
      isExporting,
      error,
      pagination,
      filters,
      getLogs,
      getLog,
      getUserActivity,
      getUserSummary,
      getTenantSummary,
      getSecurityEvents,
      getAnomalyDetection,
      getComplianceReport,
      getObjectHistory,
      exportLogs,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getLogById,
    ]
  );
};