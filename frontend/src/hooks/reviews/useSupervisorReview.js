// src/hooks/reviews/useSupervisorReview.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllSupervisorReviews,
  selectSupervisorReviewsLoading,
  selectSupervisorReviewsError,
  selectSelectedSupervisorReview,
  selectSupervisorReviewComparison,
  selectSupervisorReviewStats,
  selectMyReviewQueue,
  selectPendingApprovals,
} from '../../store/reviews/selectors';
import {
  fetchSupervisorReviews,
  fetchSupervisorReview,
  createSupervisorReview,
  updateSupervisorReview,
  patchSupervisorReview,
  deleteSupervisorReview,
  submitSupervisorReview,
  saveSupervisorReviewDraft,
  approveSupervisorReview,
  rejectSupervisorReview,
  requestChangesSupervisorReview,
  resetSupervisorReviewToDraft,
  compareSupervisorWithSelf,
  fetchMyReviewQueue,
  fetchPendingApprovals as fetchPendingApprovalsThunk,
  fetchSupervisorReviewStats,
  resetSupervisorReviewState,
} from '../../store/reviews/slices/supervisorReview.slice';
import { useReviewsPermissions } from './';

const useSupervisorReview = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllSupervisorReviews);
  const loading = useSelector(selectSupervisorReviewsLoading);
  const error = useSelector(selectSupervisorReviewsError);
  const selected = useSelector(selectSelectedSupervisorReview);
  const comparison = useSelector(selectSupervisorReviewComparison);
  const stats = useSelector(selectSupervisorReviewStats);
  const myQueue = useSelector(selectMyReviewQueue);
  const pendingApprovals = useSelector(selectPendingApprovals);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchSupervisorReviews(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchSupervisorReview(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canCreateSupervisorReview) {
        throw new Error('You do not have permission to create supervisor reviews');
      }
      return dispatch(createSupervisorReview(data));
    },
    [dispatch, permissions.canCreateSupervisorReview]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdateSupervisorReview) {
        throw new Error('You do not have permission to update supervisor reviews');
      }
      return dispatch(updateSupervisorReview({ id, data }));
    },
    [dispatch, permissions.canUpdateSupervisorReview]
  );

  const patch = useCallback(
    (id, data) => {
      if (!permissions.canUpdateSupervisorReview) {
        throw new Error('You do not have permission to update supervisor reviews');
      }
      return dispatch(patchSupervisorReview({ id, data }));
    },
    [dispatch, permissions.canUpdateSupervisorReview]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeleteSupervisorReview) {
        throw new Error('You do not have permission to delete supervisor reviews');
      }
      return dispatch(deleteSupervisorReview(id));
    },
    [dispatch, permissions.canDeleteSupervisorReview]
  );

  const submit = useCallback(
    (id) => {
      if (!permissions.canSubmitSupervisorReview) {
        throw new Error('You do not have permission to submit supervisor reviews');
      }
      return dispatch(submitSupervisorReview(id));
    },
    [dispatch, permissions.canSubmitSupervisorReview]
  );

  const saveDraft = useCallback(
    (id, data) => {
      if (!permissions.canUpdateSupervisorReview) {
        throw new Error('You do not have permission to save supervisor review drafts');
      }
      return dispatch(saveSupervisorReviewDraft({ id, data }));
    },
    [dispatch, permissions.canUpdateSupervisorReview]
  );

  const approve = useCallback(
    (id, notes) => {
      if (!permissions.canApproveSupervisorReview) {
        throw new Error('You do not have permission to approve supervisor reviews');
      }
      return dispatch(approveSupervisorReview({ id, comments: notes }));
    },
    [dispatch, permissions.canApproveSupervisorReview]
  );

  const reject = useCallback(
    (id, reason) => {
      if (!permissions.canRejectSupervisorReview) {
        throw new Error('You do not have permission to reject supervisor reviews');
      }
      return dispatch(rejectSupervisorReview({ id, reason }));
    },
    [dispatch, permissions.canRejectSupervisorReview]
  );

  const requestChanges = useCallback(
    (id, feedback) => {
      if (!permissions.canRejectSupervisorReview) {
        throw new Error('You do not have permission to request changes');
      }
      return dispatch(requestChangesSupervisorReview({ id, feedback }));
    },
    [dispatch, permissions.canRejectSupervisorReview]
  );

  const resetToDraft = useCallback(
    (id) => {
      if (!permissions.canUpdateSupervisorReview) {
        throw new Error('You do not have permission to reset supervisor reviews');
      }
      return dispatch(resetSupervisorReviewToDraft(id));
    },
    [dispatch, permissions.canUpdateSupervisorReview]
  );

  const compare = useCallback(
    (id) => dispatch(compareSupervisorWithSelf(id)),
    [dispatch]
  );

  const fetchQueue = useCallback(
    () => dispatch(fetchMyReviewQueue()),
    [dispatch]
  );

  const fetchApprovals = useCallback(
    () => dispatch(fetchPendingApprovalsThunk()),
    [dispatch]
  );

  const fetchPendingApprovals = fetchApprovals;

  const getStats = useCallback(
    (cycleId) => dispatch(fetchSupervisorReviewStats(cycleId)),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetSupervisorReviewState()),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canCreateSupervisorReview,
    [permissions.canCreateSupervisorReview]
  );

  const canApprove = useMemo(
    () => permissions.canApproveSupervisorReview,
    [permissions.canApproveSupervisorReview]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    comparison,
    stats,
    myQueue,
    pendingApprovals,

    // CRUD Operations
    fetchAll,
    fetchOne,
    create,
    update,
    patch,
    remove,

    // Actions
    submit,
    saveDraft,
    approve,
    reject,
    requestChanges,
    resetToDraft,
    compare,
    fetchQueue,
    fetchApprovals,
    fetchPendingApprovals,
    getStats,
    reset,

    // Permissions
    canManage,
    canApprove,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => item.id === id),
    hasPendingReviews: myQueue.length > 0,
    hasPendingApprovals: pendingApprovals.length > 0,
  };
};

export default useSupervisorReview;