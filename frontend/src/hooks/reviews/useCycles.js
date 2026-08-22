// src/hooks/reviews/useCycles.js
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback, useMemo } from 'react';
import {
  selectAllCycles,
  selectCyclesLoading,
  selectCyclesError,
  selectActiveCycle,
  selectSelectedCycle,
  selectCycleProgress,
  selectCycleParticipants,
  selectCycleSummary,
  selectCyclesPagination,
  selectCyclesFilters,
  selectActiveCycles,
  selectCompletedCycles,
  selectUpcomingCycles,
} from '../../store/reviews/selectors';
import {
  
  fetchCycles,
  fetchCycle,
  createCycle,
  updateCycle,
  patchCycle,
  deleteCycle,
  activateCycle,
  freezeCycle,
  completeCycle,
  forceCompleteCycle,
  archiveCycle,
  sendCycleReminders,
  unarchiveCycle,
  extendCycle,
  fetchCycleProgress,
  fetchCycleParticipants,
  fetchCycleSummary,
  fetchActiveCycle,
  resetCycleState,
  setCycleFilters,
  clearCycleFilters,
  setCyclePagination,
} from '../../store/reviews/slices/cycle.slice';
import useReviewsPermissions from './useReviewsPermissions';

const useCycles = (options = {}) => {
  const { autoFetch = false } = typeof options === 'boolean' ? { autoFetch: options } : options;
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllCycles);
  const loading = useSelector(selectCyclesLoading);
  const error = useSelector(selectCyclesError);
  const selected = useSelector(selectSelectedCycle);
  const activeCycle = useSelector(selectActiveCycle);
  const progress = useSelector(selectCycleProgress);
  const participants = useSelector(selectCycleParticipants);
  const summary = useSelector(selectCycleSummary);
  const pagination = useSelector(selectCyclesPagination);
  const filters = useSelector(selectCyclesFilters);
  const activeCycles = useSelector(selectActiveCycles);
  const completedCycles = useSelector(selectCompletedCycles);
  const upcomingCycles = useSelector(selectUpcomingCycles);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchCycles(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchCycle(id)),
    [dispatch]
  );

  const create = useCallback(
    async (data) => {
      if (!permissions.canCreateCycle) {
        throw new Error('You do not have permission to create review cycles');
      }
      return await dispatch(createCycle(data)).unwrap();
    },
    [dispatch, permissions.canCreateCycle]
  );

  const update = useCallback(
    async (id, data) => {
      if (!permissions.canUpdateCycle) {
        throw new Error('You do not have permission to update review cycles');
      }
      return await dispatch(updateCycle({ id, data })).unwrap();
    },
    [dispatch, permissions.canUpdateCycle]
  );

  const patch = useCallback(
    async (id, data) => {
      if (!permissions.canUpdateCycle) {
        throw new Error('You do not have permission to update review cycles');
      }
      return await dispatch(patchCycle({ id, data })).unwrap();
    },
    [dispatch, permissions.canUpdateCycle]
  );

  const remove = useCallback(
    async (id) => {
      if (!permissions.canDeleteCycle) {
        throw new Error('You do not have permission to delete review cycles');
      }
      return await dispatch(deleteCycle(id)).unwrap();
    },
    [dispatch, permissions.canDeleteCycle]
  );

  const activate = useCallback(
    (id) => {
      if (!permissions.canActivateCycle) {
        throw new Error('You do not have permission to activate review cycles');
      }
      return dispatch(activateCycle(id));
    },
    [dispatch, permissions.canActivateCycle]
  );

  const freeze = useCallback(
    (id) => {
      if (!permissions.canUpdateCycle) {
        throw new Error('You do not have permission to freeze review cycles');
      }
      return dispatch(freezeCycle(id));
    },
    [dispatch, permissions.canUpdateCycle]
  );

  const complete = useCallback(
    (id) => {
      if (!permissions.canCompleteCycle) {
        throw new Error('You do not have permission to complete review cycles');
      }
      return dispatch(completeCycle(id));
    },
    [dispatch, permissions.canCompleteCycle]
  );

  const forceComplete = useCallback(
    (id) => {
      if (!permissions.canCompleteCycle) {
        throw new Error('You do not have permission to force complete review cycles');
      }
      return dispatch(forceCompleteCycle(id));
    },
    [dispatch, permissions.canCompleteCycle]
  );

  const archive = useCallback(
    (id) => {
      if (!permissions.canArchiveCycle) {
        throw new Error('You do not have permission to archive review cycles');
      }
      return dispatch(archiveCycle(id));
    },
    [dispatch, permissions.canArchiveCycle]
  );

  const unarchive = useCallback(
    (id) => {
      if (!permissions.canArchiveCycle) {
        throw new Error('You do not have permission to unarchive review cycles');
      }
      return dispatch(unarchiveCycle(id));
    },
    [dispatch, permissions.canArchiveCycle]
  );

  const extend = useCallback(
    (id, newEndDate, reason) => {
      if (!permissions.canExtendCycle) {
        throw new Error('You do not have permission to extend review cycles');
      }
      return dispatch(extendCycle({ id, newEndDate, reason }));
    },
    [dispatch, permissions.canExtendCycle]
  );

  const getProgress = useCallback(
    (id) => dispatch(fetchCycleProgress(id)),
    [dispatch]
  );

  const getParticipants = useCallback(
    (id) => dispatch(fetchCycleParticipants(id)),
    [dispatch]
  );

  const getSummary = useCallback(
    (id) => dispatch(fetchCycleSummary(id)),
    [dispatch]
  );

  const getActive = useCallback(
    () => dispatch(fetchActiveCycle()),
    [dispatch]
  );

  const sendReminders = useCallback(
    (id) => dispatch(sendCycleReminders(id)),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetCycleState()),
    [dispatch]
  );

  const setFilters = useCallback(
    (payload) => dispatch(setCycleFilters(payload)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(clearCycleFilters()),
    [dispatch]
  );

  const setPagination = useCallback(
    (payload) => dispatch(setCyclePagination(payload)),
    [dispatch]
  );

  // Auto-fetch if requested
  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch, fetchAll]);

  // Computed
  const canManage = useMemo(
    () => permissions.canManageCycles,
    [permissions.canManageCycles]
  );

  const canView = useMemo(
    () => permissions.canViewCycles,
    [permissions.canViewCycles]
  );

  return {
    // Data
    data,
    cycles: data,
    items: data,
    loading,
    error,
    selected,
    activeCycle,
    progress,
    participants,
    summary,
    pagination,
    filters,
    activeCycles,
    completedCycles,
    upcomingCycles,

    // CRUD Operations
    fetchAll,
    fetchCycles: fetchAll,
    fetchOne,
    fetchCycle: fetchOne,
    getCycle: fetchOne,
    create,
    update,
    patch,
    remove,
    createCycle: create,
    updateCycle: update,
    deleteCycle: remove,
    extendCycle: extend,

    // Actions
    activate,
    activateCycle: activate,
    freeze,
    freezeCycle: freeze,
    complete,
    completeCycle: complete,
    closeCycle: complete,
    forceComplete,
    forceCompleteCycle: forceComplete,
    archive,
    archiveCycle: archive,
    unarchive,
    unarchiveCycle: unarchive,
    extend,
    getProgress,
    fetchCycleProgress: getProgress,
    getParticipants,
    fetchCycleParticipants: getParticipants,
    getSummary,
    fetchCycleSummary: getSummary,
    getActive,
    fetchActiveCycle: getActive,
    sendReminders,
    sendCycleReminders: sendReminders,
    reset,
    setFilters,
    clearFilters,
    setPagination,

    // Permissions
    canManage,
    canView,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => String(item.id) === String(id)),
    getByType: (type) => data.filter((item) => item.cycle_type === type),
  };
};

export default useCycles;