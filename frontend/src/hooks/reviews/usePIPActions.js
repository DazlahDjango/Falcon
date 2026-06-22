// src/hooks/reviews/usePIPActions.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllPIPActions,
  selectPIPActionsLoading,
  selectSelectedPIPAction,
  selectPIPActionsForPIP,
  selectCompletedPIPActions,
  selectPendingPIPActions,
  selectMissedPIPActions,
} from '../../store/reviews/selectors';
import {
  fetchPIPActions,
  fetchPIPAction,
  createPIPAction,
  updatePIPAction,
  deletePIPAction,
  completePIPAction,
  verifyPIPAction,
  reopenPIPAction,
  fetchPIPActionsForPIP,
  resetPIPActionState,
} from '../../store/reviews/slices/pipAction.slice';
import { useReviewsPermissions } from './';

const usePIPActions = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllPIPActions);
  const loading = useSelector(selectPIPActionsLoading);
  const selected = useSelector(selectSelectedPIPAction);
  const pipActions = useSelector(selectPIPActionsForPIP);
  const completedActions = useSelector(selectCompletedPIPActions);
  const pendingActions = useSelector(selectPendingPIPActions);
  const missedActions = useSelector(selectMissedPIPActions);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchPIPActions(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchPIPAction(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canUpdatePIP) {
        throw new Error('You do not have permission to create PIP actions');
      }
      return dispatch(createPIPAction(data));
    },
    [dispatch, permissions.canUpdatePIP]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdatePIP) {
        throw new Error('You do not have permission to update PIP actions');
      }
      return dispatch(updatePIPAction({ id, data }));
    },
    [dispatch, permissions.canUpdatePIP]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeletePIP) {
        throw new Error('You do not have permission to delete PIP actions');
      }
      return dispatch(deletePIPAction(id));
    },
    [dispatch, permissions.canDeletePIP]
  );

  const complete = useCallback(
    (id, notes, evidence) => {
      if (!permissions.canUpdatePIP) {
        throw new Error('You do not have permission to complete PIP actions');
      }
      return dispatch(completePIPAction({ id, notes, evidence }));
    },
    [dispatch, permissions.canUpdatePIP]
  );

  const verify = useCallback(
    (id) => {
      if (!permissions.canUpdatePIP) {
        throw new Error('You do not have permission to verify PIP actions');
      }
      return dispatch(verifyPIPAction(id));
    },
    [dispatch, permissions.canUpdatePIP]
  );

  const reopen = useCallback(
    (id) => {
      if (!permissions.canUpdatePIP) {
        throw new Error('You do not have permission to reopen PIP actions');
      }
      return dispatch(reopenPIPAction(id));
    },
    [dispatch, permissions.canUpdatePIP]
  );

  const getForPIP = useCallback(
    (pipId) => dispatch(fetchPIPActionsForPIP(pipId)),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetPIPActionState()),
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
    selected,
    pipActions,
    completedActions,
    pendingActions,
    missedActions,

    // CRUD Operations
    fetchAll,
    fetchOne,
    create,
    update,
    remove,

    // Actions
    complete,
    verify,
    reopen,
    getForPIP,
    reset,

    // Permissions
    canManage,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => item.id === id),
    completionRate: data.length > 0
      ? (completedActions.length / data.length) * 100
      : 0,
  };
};

export default usePIPActions;