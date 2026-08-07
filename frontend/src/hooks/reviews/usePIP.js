// src/hooks/reviews/usePIP.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllPIPs,
  selectPIPsLoading,
  selectPIPsError,
  selectSelectedPIP,
  selectPIPProgress,
  selectPIPStats,
  selectPIPTrends,
  selectPIPsPagination,
  selectPIPsFilters,
  selectMyPIPs,
  selectManagingPIPs,
  selectActivePIPs,
  selectOverduePIPs,
  selectCompletedPIPs,
  selectSuccessfulPIPs,
  selectFailedPIPs,
} from '../../store/reviews/selectors';
import {
  fetchPIPs,
  fetchPIP,
  createPIP,
  updatePIP,
  patchPIP,
  deletePIP,
  approvePIP,
  startPIP,
  extendPIP,
  completePIP,
  cancelPIP,
  fetchPIPProgress,
  addPIPAction,
  addPIPReview,
  fetchPIPFullReport,
  fetchMyPIPs,
  fetchManagingPIPs,
  fetchActivePIPs,
  fetchOverduePIPs,
  fetchPIPReport,
  fetchPIPTrends,
  generatePIPFromRating,
  resetPIPState,
  setPIPFilters,
  clearPIPFilters,
  setPIPPagination,
} from '../../store/reviews/slices/pip.slice';
import { useReviewsPermissions } from './';

const usePIP = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllPIPs);
  const loading = useSelector(selectPIPsLoading);
  const error = useSelector(selectPIPsError);
  const selected = useSelector(selectSelectedPIP);
  const progress = useSelector(selectPIPProgress);
  const stats = useSelector(selectPIPStats);
  const trends = useSelector(selectPIPTrends);
  const pagination = useSelector(selectPIPsPagination);
  const filters = useSelector(selectPIPsFilters);
  const myPIPs = useSelector(selectMyPIPs);
  const normalizedPagination = pagination ?? {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  };
  const normalizedFilters = filters ?? {};
  const managingPIPs = useSelector(selectManagingPIPs);
  const activePIPs = useSelector(selectActivePIPs);
  const overduePIPs = useSelector(selectOverduePIPs);
  const completedPIPs = useSelector(selectCompletedPIPs);
  const successfulPIPs = useSelector(selectSuccessfulPIPs);
  const failedPIPs = useSelector(selectFailedPIPs);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchPIPs(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchPIP(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canCreatePIP) {
        throw new Error('You do not have permission to create PIPs');
      }
      return dispatch(createPIP(data));
    },
    [dispatch, permissions.canCreatePIP]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdatePIP) {
        throw new Error('You do not have permission to update PIPs');
      }
      return dispatch(updatePIP({ id, data }));
    },
    [dispatch, permissions.canUpdatePIP]
  );

  const patch = useCallback(
    (id, data) => {
      if (!permissions.canUpdatePIP) {
        throw new Error('You do not have permission to update PIPs');
      }
      return dispatch(patchPIP({ id, data }));
    },
    [dispatch, permissions.canUpdatePIP]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeletePIP) {
        throw new Error('You do not have permission to delete PIPs');
      }
      return dispatch(deletePIP(id));
    },
    [dispatch, permissions.canDeletePIP]
  );

  const approve = useCallback(
    (id) => {
      if (!permissions.canApprovePIP) {
        throw new Error('You do not have permission to approve PIPs');
      }
      return dispatch(approvePIP(id));
    },
    [dispatch, permissions.canApprovePIP]
  );

  const start = useCallback(
    (id) => {
      if (!permissions.canStartPIP) {
        throw new Error('You do not have permission to start PIPs');
      }
      return dispatch(startPIP(id));
    },
    [dispatch, permissions.canStartPIP]
  );

  const extend = useCallback(
    (id, newEndDate, reason) => {
      if (!permissions.canExtendPIP) {
        throw new Error('You do not have permission to extend PIPs');
      }
      return dispatch(extendPIP({ id, newEndDate, reason }));
    },
    [dispatch, permissions.canExtendPIP]
  );

  const complete = useCallback(
    (id, outcome, notes) => {
      if (!permissions.canCompletePIP) {
        throw new Error('You do not have permission to complete PIPs');
      }
      return dispatch(completePIP({ id, outcome, notes }));
    },
    [dispatch, permissions.canCompletePIP]
  );

  const cancel = useCallback(
    (id) => {
      if (!permissions.canCompletePIP) {
        throw new Error('You do not have permission to cancel PIPs');
      }
      return dispatch(cancelPIP(id));
    },
    [dispatch, permissions.canCompletePIP]
  );

  const getProgress = useCallback(
    (id) => dispatch(fetchPIPProgress(id)),
    [dispatch]
  );

  const addAction = useCallback(
    (id, actionData) => {
      if (!permissions.canUpdatePIP) {
        throw new Error('You do not have permission to add PIP actions');
      }
      return dispatch(addPIPAction({ id, actionData }));
    },
    [dispatch, permissions.canUpdatePIP]
  );

  const addReview = useCallback(
    (id, reviewData) => {
      if (!permissions.canUpdatePIP) {
        throw new Error('You do not have permission to add PIP reviews');
      }
      return dispatch(addPIPReview({ id, reviewData }));
    },
    [dispatch, permissions.canUpdatePIP]
  );

  const getFullReport = useCallback(
    (id) => dispatch(fetchPIPFullReport(id)),
    [dispatch]
  );

  const getMy = useCallback(
    () => dispatch(fetchMyPIPs()),
    [dispatch]
  );

  const getManaging = useCallback(
    () => dispatch(fetchManagingPIPs()),
    [dispatch]
  );

  const getActive = useCallback(
    () => dispatch(fetchActivePIPs()),
    [dispatch]
  );

  const getOverdue = useCallback(
    () => dispatch(fetchOverduePIPs()),
    [dispatch]
  );

  const getReport = useCallback(
    () => dispatch(fetchPIPReport()),
    [dispatch]
  );

  const getTrends = useCallback(
    (months) => dispatch(fetchPIPTrends(months)),
    [dispatch]
  );

  const generateFromRating = useCallback(
    (ratingId, customData) => {
      if (!permissions.canGeneratePIPFromRating) {
        throw new Error('You do not have permission to generate PIP from rating');
      }
      return dispatch(generatePIPFromRating({ ratingId, customData }));
    },
    [dispatch, permissions.canGeneratePIPFromRating]
  );

  const setFilters = useCallback(
    (payload) => dispatch(setPIPFilters(payload)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(clearPIPFilters()),
    [dispatch]
  );

  const setPagination = useCallback(
    (payload) => dispatch(setPIPPagination(payload)),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetPIPState()),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canManagePIPs,
    [permissions.canManagePIPs]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    progress,
    stats,
    trends,
    myPIPs,
    managingPIPs,
    activePIPs,
    overduePIPs,
    completedPIPs,
    successfulPIPs,
    failedPIPs,
    pagination: normalizedPagination,
    filters: normalizedFilters,

    // CRUD Operations
    fetchAll,
    fetchOne,
    create,
    createPIP: create,
    update,
    updatePIP: update,
    patch,
    remove,
    deletePIP: remove,

    // Actions
    approve,
    start,
    extend,
    complete,
    cancel,
    getProgress,
    addAction,
    addReview,
    getFullReport,
    getMy,
    getManaging,
    getActive,
    getOverdue,
    getReport,
    getTrends,
    generateFromRating,
    setFilters,
    clearFilters,
    setPagination,
    reset,

    // Permissions
    canManage,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => item.id === id),
    hasActivePIPs: activePIPs.length > 0,
    hasOverduePIPs: overduePIPs.length > 0,
    successRate: stats?.success_rate || 0,
  };
};

export default usePIP;