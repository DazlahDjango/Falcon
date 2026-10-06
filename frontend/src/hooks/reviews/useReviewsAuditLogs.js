// src/hooks/reviews/useReviewsAuditLogs.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllAuditLogs,
  selectAuditLogsLoading,
  selectAuditLogsError,
  selectSelectedAuditLog,
  selectAuditLogsPagination,
  selectAuditLogsFilters,
  selectAuditLogsForObject,
  selectAuditLogsForUser,
} from '../../store/reviews/selectors';
import {
  fetchAuditLogs,
  fetchAuditLog,
  fetchAuditLogsForObject,
  fetchAuditLogsForUser,
  resetAuditLogState,
  auditLogActions,
} from '../../store/reviews/slices/auditLog.slice';
import { useReviewsPermissions } from './';

const DEFAULT_PAGINATION = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 0,
};

const useReviewsAuditLogs = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllAuditLogs) || [];
  const loading = useSelector(selectAuditLogsLoading);
  const error = useSelector(selectAuditLogsError);
  const selected = useSelector(selectSelectedAuditLog);
  const rawPagination = useSelector(selectAuditLogsPagination);
  const filters = useSelector(selectAuditLogsFilters) || {};
  const objectLogs = useSelector(selectAuditLogsForObject) || [];
  const userLogs = useSelector(selectAuditLogsForUser) || [];

  const pagination = useMemo(() => {
    return rawPagination ?? DEFAULT_PAGINATION;
  }, [rawPagination]);

  // Actions
  const fetchAll = useCallback(
    (params) => {
      if (!permissions.canViewAuditLogs) {
        throw new Error('You do not have permission to view audit logs');
      }
      return dispatch(fetchAuditLogs(params));
    },
    [dispatch, permissions.canViewAuditLogs]
  );

  const fetchOne = useCallback(
    (id) => {
      if (!permissions.canViewAuditLogs) {
        throw new Error('You do not have permission to view audit logs');
      }
      return dispatch(fetchAuditLog(id));
    },
    [dispatch, permissions.canViewAuditLogs]
  );

  const getForObject = useCallback(
    (modelName, objectId) => {
      if (!permissions.canViewAuditLogs) {
        throw new Error('You do not have permission to view audit logs');
      }
      return dispatch(fetchAuditLogsForObject({ modelName, objectId }));
    },
    [dispatch, permissions.canViewAuditLogs]
  );

  const getForUser = useCallback(
    (userId) => {
      if (!permissions.canViewAuditLogs) {
        throw new Error('You do not have permission to view audit logs');
      }
      return dispatch(fetchAuditLogsForUser(userId));
    },
    [dispatch, permissions.canViewAuditLogs]
  );

  const setPagination = useCallback(
    (payload) => dispatch(auditLogActions.setPagination(payload)),
    [dispatch]
  );

  const setFilters = useCallback(
    (payload) => dispatch(auditLogActions.setFilters(payload)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(auditLogActions.clearFilters()),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetAuditLogState()),
    [dispatch]
  );

  // Computed
  const canView = useMemo(
    () => permissions.canViewAuditLogs,
    [permissions.canViewAuditLogs]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    pagination,
    filters,
    objectLogs,
    userLogs,

    // Actions
    fetchAll,
    fetchOne,
    getForObject,
    getForUser,
    setPagination,
    setFilters,
    clearFilters,
    reset,

    // Permissions
    canView,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => item.id === id),
    hasObjectLogs: objectLogs.length > 0,
    hasUserLogs: userLogs.length > 0,
  };
};

export default useReviewsAuditLogs;