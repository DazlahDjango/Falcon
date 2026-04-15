import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs, fetchAuditStats, clearAuditError } from '../../store/organisation/slice/auditSlice';

/**
 * Custom hook for managing audit logs within the organisation module.
 * Provides access to log entries, statistics, and loading states.
 */
export const useAuditLogs = (params = {}) => {
  const dispatch = useDispatch();
  const { logs, stats, loading, error } = useSelector((state) => state.audit);

  const loadLogs = useCallback((extraParams = {}) => {
    dispatch(fetchAuditLogs({ ...params, ...extraParams }));
  }, [dispatch, params]);

  const loadStats = useCallback(() => {
    dispatch(fetchAuditStats());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAuditError());
  }, [dispatch]);

  useEffect(() => {
    if (params.autoFetch !== false) {
      loadLogs();
    }
  }, [loadLogs, params.autoFetch]);

  return {
    logs,
    stats,
    loading,
    error,
    loadLogs,
    loadStats,
    clearError,
  };
};
