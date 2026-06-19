// src/hooks/reviews/useCoefficients.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllCoefficients,
  selectCoefficientsLoading,
  selectCoefficientsError,
  selectSelectedCoefficient,
  selectActiveCoefficientsList,
  selectApplyResult,
  selectCoefficientsPagination,
  selectCoefficientsFilters,
} from '../../store/reviews/selectors';
import {
  fetchCoefficients,
  fetchCoefficient,
  createCoefficient,
  updateCoefficient,
  patchCoefficient,
  deleteCoefficient,
  activateCoefficient,
  deactivateCoefficient,
  fetchActiveCoefficients,
  applyCoefficient,
  resetCoefficientState,
  setCoefficientFilters,
  clearCoefficientFilters,
  setCoefficientPagination,
} from '../../store/reviews/slices/coefficient.slice';
import { useReviewsPermissions } from './';

const useCoefficients = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();
  
  // Debug logs
  console.log('[useCoefficients] permissions:', {
    isSuperAdmin: permissions.isSuperAdmin,
    canCreateCoefficient: permissions.canCreateCoefficient,
    permissions: permissions.permissions
  });

  // Debug entire Redux state!
  const entireReviewsState = useSelector((state) => state.reviews);
  console.log('[useCoefficients] entireReviewsState:', entireReviewsState);
  const coefficientsState = useSelector((state) => state.reviews?.coefficients);
  console.log('[useCoefficients] coefficientsState:', coefficientsState);
  
  // Selectors
  const data = useSelector(selectAllCoefficients);
  console.log('[useCoefficients] selectAllCoefficients returned:', data);
  console.log('[useCoefficients] data length:', data?.length || 0);
  console.log('[useCoefficients] data is array?:', Array.isArray(data));
  
  const loading = useSelector(selectCoefficientsLoading);
  const error = useSelector(selectCoefficientsError);
  const selected = useSelector(selectSelectedCoefficient);
  const activeCoefficients = useSelector(selectActiveCoefficientsList);
  const applyResult = useSelector(selectApplyResult);
  const pagination = useSelector(selectCoefficientsPagination);
  const filters = useSelector(selectCoefficientsFilters);

  // Actions
  const fetchAll = useCallback(
    async (params) => {
      console.log('[useCoefficients] fetchAll called with params:', params);
      try {
        const result = await dispatch(fetchCoefficients(params)).unwrap();
        console.log('[useCoefficients] fetchAll successful:', result);
        return result;
      } catch (error) {
        console.error('[useCoefficients] fetchAll failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const fetchOne = useCallback(
    async (id) => {
      console.log('[useCoefficients] fetchOne called with id:', id);
      try {
        const result = await dispatch(fetchCoefficient(id)).unwrap();
        console.log('[useCoefficients] fetchOne successful:', result);
        return result;
      } catch (error) {
        console.error('[useCoefficients] fetchOne failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const create = useCallback(
    async (data) => {
      console.log('[useCoefficients] create called with data:', data);
      if (!permissions.canCreateCoefficient) {
        const err = new Error('You do not have permission to create coefficients');
        console.error('[useCoefficients] create permission denied:', err);
        throw err;
      }
      try {
        const result = await dispatch(createCoefficient(data)).unwrap();
        console.log('[useCoefficients] create successful:', result);
        return result;
      } catch (error) {
        console.error('[useCoefficients] create failed:', error);
        throw error;
      }
    },
    [dispatch, permissions.canCreateCoefficient]
  );

  const update = useCallback(
    async (id, data) => {
      console.log('[useCoefficients] update called with id:', id, 'data:', data);
      if (!permissions.canUpdateCoefficient) {
        const err = new Error('You do not have permission to update coefficients');
        console.error('[useCoefficients] update permission denied:', err);
        throw err;
      }
      try {
        const result = await dispatch(updateCoefficient({ id, data })).unwrap();
        console.log('[useCoefficients] update successful:', result);
        return result;
      } catch (error) {
        console.error('[useCoefficients] update failed:', error);
        throw error;
      }
    },
    [dispatch, permissions.canUpdateCoefficient]
  );

  const patch = useCallback(
    async (id, data) => {
      console.log('[useCoefficients] patch called with id:', id, 'data:', data);
      if (!permissions.canUpdateCoefficient) {
        const err = new Error('You do not have permission to update coefficients');
        console.error('[useCoefficients] patch permission denied:', err);
        throw err;
      }
      try {
        const result = await dispatch(patchCoefficient({ id, data })).unwrap();
        console.log('[useCoefficients] patch successful:', result);
        return result;
      } catch (error) {
        console.error('[useCoefficients] patch failed:', error);
        throw error;
      }
    },
    [dispatch, permissions.canUpdateCoefficient]
  );

  const remove = useCallback(
    async (id) => {
      console.log('[useCoefficients] remove called with id:', id);
      if (!permissions.canDeleteCoefficient) {
        const err = new Error('You do not have permission to delete coefficients');
        console.error('[useCoefficients] remove permission denied:', err);
        throw err;
      }
      try {
        const result = await dispatch(deleteCoefficient(id)).unwrap();
        console.log('[useCoefficients] remove successful:', result);
        return result;
      } catch (error) {
        console.error('[useCoefficients] remove failed:', error);
        throw error;
      }
    },
    [dispatch, permissions.canDeleteCoefficient]
  );

  const activate = useCallback(
    async (id) => {
      console.log('[useCoefficients] activate called with id:', id);
      if (!permissions.canCreateCoefficient) {
        const err = new Error('You do not have permission to activate coefficients');
        console.error('[useCoefficients] activate permission denied:', err);
        throw err;
      }
      try {
        const result = await dispatch(activateCoefficient(id)).unwrap();
        console.log('[useCoefficients] activate successful:', result);
        return result;
      } catch (error) {
        console.error('[useCoefficients] activate failed:', error);
        throw error;
      }
    },
    [dispatch, permissions.canCreateCoefficient]
  );

  const deactivate = useCallback(
    async (id) => {
      console.log('[useCoefficients] deactivate called with id:', id);
      if (!permissions.canCreateCoefficient) {
        const err = new Error('You do not have permission to deactivate coefficients');
        console.error('[useCoefficients] deactivate permission denied:', err);
        throw err;
      }
      try {
        const result = await dispatch(deactivateCoefficient(id)).unwrap();
        console.log('[useCoefficients] deactivate successful:', result);
        return result;
      } catch (error) {
        console.error('[useCoefficients] deactivate failed:', error);
        throw error;
      }
    },
    [dispatch, permissions.canCreateCoefficient]
  );

  const getActive = useCallback(
    async () => {
      console.log('[useCoefficients] getActive called');
      try {
        const result = await dispatch(fetchActiveCoefficients()).unwrap();
        console.log('[useCoefficients] getActive successful:', result);
        return result;
      } catch (error) {
        console.error('[useCoefficients] getActive failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const apply = useCallback(
    async (score, coefficientValue) => {
      console.log('[useCoefficients] apply called with score:', score, 'coefficientValue:', coefficientValue);
      try {
        const result = await dispatch(applyCoefficient({ score, coefficientValue })).unwrap();
        console.log('[useCoefficients] apply successful:', result);
        return result;
      } catch (error) {
        console.error('[useCoefficients] apply failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const reset = useCallback(
    () => {
      console.log('[useCoefficients] reset called');
      dispatch(resetCoefficientState());
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => dispatch(setCoefficientFilters(newFilters)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(clearCoefficientFilters()),
    [dispatch]
  );

  const setPagination = useCallback(
    (newPagination) => dispatch(setCoefficientPagination(newPagination)),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canManageCoefficients,
    [permissions.canManageCoefficients]
  );

  const canView = useMemo(
    () => permissions.canViewCoefficients,
    [permissions.canViewCoefficients]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    activeCoefficients,
    applyResult,
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
    getActive,
    apply,
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

export default useCoefficients;