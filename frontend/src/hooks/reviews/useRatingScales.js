// src/hooks/reviews/useRatingScales.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllRatingScales,
  selectRatingScalesLoading,
  selectRatingScalesError,
  selectActiveRatingScales,
  selectDefaultRatingScale,
  selectSelectedRatingScale,
  selectRatingScalesPagination,
  selectRatingScalesFilters,
} from '../../store/reviews/selectors';
import {
  fetchRatingScales,
  fetchRatingScale,
  createRatingScale,
  updateRatingScale,
  patchRatingScale,
  deleteRatingScale,
  activateRatingScale,
  deactivateRatingScale,
  setDefaultRatingScale,
  resetRatingScaleState,
  setRatingScaleFilters,
  clearRatingScaleFilters,
  setRatingScalePagination,
} from '../../store/reviews/slices/ratingScale.slice';
import { useReviewsPermissions } from './';

const useRatingScales = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllRatingScales);
  const loading = useSelector(selectRatingScalesLoading);
  const error = useSelector(selectRatingScalesError);
  const activeScales = useSelector(selectActiveRatingScales);
  const defaultScale = useSelector(selectDefaultRatingScale);
  const selected = useSelector(selectSelectedRatingScale);
  const pagination = useSelector(selectRatingScalesPagination);
  const filters = useSelector(selectRatingScalesFilters);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchRatingScales(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchRatingScale(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canCreateRatingScale) {
        throw new Error('You do not have permission to create rating scales');
      }
      return dispatch(createRatingScale(data));
    },
    [dispatch, permissions.canCreateRatingScale]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdateRatingScale) {
        throw new Error('You do not have permission to update rating scales');
      }
      return dispatch(updateRatingScale({ id, data }));
    },
    [dispatch, permissions.canUpdateRatingScale]
  );

  const patch = useCallback(
    (id, data) => {
      if (!permissions.canUpdateRatingScale) {
        throw new Error('You do not have permission to update rating scales');
      }
      return dispatch(patchRatingScale({ id, data }));
    },
    [dispatch, permissions.canUpdateRatingScale]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeleteRatingScale) {
        throw new Error('You do not have permission to delete rating scales');
      }
      return dispatch(deleteRatingScale(id));
    },
    [dispatch, permissions.canDeleteRatingScale]
  );

  const activate = useCallback(
    (id) => {
      if (!permissions.canCreateRatingScale) {
        throw new Error('You do not have permission to activate rating scales');
      }
      return dispatch(activateRatingScale(id));
    },
    [dispatch, permissions.canCreateRatingScale]
  );

  const deactivate = useCallback(
    (id) => {
      if (!permissions.canCreateRatingScale) {
        throw new Error('You do not have permission to deactivate rating scales');
      }
      return dispatch(deactivateRatingScale(id));
    },
    [dispatch, permissions.canCreateRatingScale]
  );

  const setDefault = useCallback(
    (id) => {
      if (!permissions.canCreateRatingScale) {
        throw new Error('You do not have permission to set default rating scale');
      }
      return dispatch(setDefaultRatingScale(id));
    },
    [dispatch, permissions.canCreateRatingScale]
  );

  const reset = useCallback(
    () => dispatch(resetRatingScaleState()),
    [dispatch]
  );

  const setFilters = useCallback(
    (payload) => dispatch(setRatingScaleFilters(payload)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(clearRatingScaleFilters()),
    [dispatch]
  );

  const setPagination = useCallback(
    (payload) => dispatch(setRatingScalePagination(payload)),
    [dispatch]
  );

  // Computed values
  const canManage = useMemo(
    () => permissions.canManageRatingScales,
    [permissions.canManageRatingScales]
  );

  const canView = useMemo(
    () => permissions.canViewRatingScales,
    [permissions.canViewRatingScales]
  );

  return {
    // Data
    data,
    loading,
    error,
    activeScales,
    defaultScale,
    selected,
    pagination,
    filters,

    // CRUD Operations
    fetchAll,
    fetchOne,
    create,
    update,
    patch,
    remove,

    // Actions
    activate,
    deactivate,
    setDefault,
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
    getById: (id) => data.find((item) => item.id === id),
  };
};

export default useRatingScales;