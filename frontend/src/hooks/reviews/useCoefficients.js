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
} from '../../store/reviews/slices/coefficient.slice';
import { useReviewsPermissions } from './';

const useCoefficients = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllCoefficients);
  const loading = useSelector(selectCoefficientsLoading);
  const error = useSelector(selectCoefficientsError);
  const selected = useSelector(selectSelectedCoefficient);
  const activeCoefficients = useSelector(selectActiveCoefficientsList);
  const applyResult = useSelector(selectApplyResult);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchCoefficients(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchCoefficient(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canCreateCoefficient) {
        throw new Error('You do not have permission to create coefficients');
      }
      return dispatch(createCoefficient(data));
    },
    [dispatch, permissions.canCreateCoefficient]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdateCoefficient) {
        throw new Error('You do not have permission to update coefficients');
      }
      return dispatch(updateCoefficient({ id, data }));
    },
    [dispatch, permissions.canUpdateCoefficient]
  );

  const patch = useCallback(
    (id, data) => {
      if (!permissions.canUpdateCoefficient) {
        throw new Error('You do not have permission to update coefficients');
      }
      return dispatch(patchCoefficient({ id, data }));
    },
    [dispatch, permissions.canUpdateCoefficient]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeleteCoefficient) {
        throw new Error('You do not have permission to delete coefficients');
      }
      return dispatch(deleteCoefficient(id));
    },
    [dispatch, permissions.canDeleteCoefficient]
  );

  const activate = useCallback(
    (id) => {
      if (!permissions.canCreateCoefficient) {
        throw new Error('You do not have permission to activate coefficients');
      }
      return dispatch(activateCoefficient(id));
    },
    [dispatch, permissions.canCreateCoefficient]
  );

  const deactivate = useCallback(
    (id) => {
      if (!permissions.canCreateCoefficient) {
        throw new Error('You do not have permission to deactivate coefficients');
      }
      return dispatch(deactivateCoefficient(id));
    },
    [dispatch, permissions.canCreateCoefficient]
  );

  const getActive = useCallback(
    () => dispatch(fetchActiveCoefficients()),
    [dispatch]
  );

  const apply = useCallback(
    (score, coefficientValue) => dispatch(applyCoefficient({ score, coefficientValue })),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetCoefficientState()),
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