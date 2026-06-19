// src/hooks/reviews/usePromotions.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllPromotions,
  selectPromotionsLoading,
  selectPromotionsError,
  selectSelectedPromotion,
  selectPromotionStats,
  selectGeneratedPromotion,
  selectPendingPromotions,
  selectApprovedPromotions,
  selectCompletedPromotions,
  selectRejectedPromotions,
  selectPromotionsPagination,
  selectPromotionsFilters,
} from '../../store/reviews/selectors';
import {
  fetchPromotions,
  fetchPromotion,
  createPromotion,
  updatePromotion,
  patchPromotion,
  deletePromotion,
  approvePromotion,
  rejectPromotion,
  completePromotion,
  holdPromotion,
  fetchPendingPromotions,
  fetchApprovedPromotions,
  fetchCompletedPromotions,
  fetchPromotionStats,
  generatePromotionFromRating,
  resetPromotionState,
  setPromotionFilters,
  clearPromotionFilters,
  setPromotionPagination,
} from '../../store/reviews/slices/promotion.slice';
import { useReviewsPermissions } from './';

const usePromotions = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllPromotions);
  const loading = useSelector(selectPromotionsLoading);
  const error = useSelector(selectPromotionsError);
  const selected = useSelector(selectSelectedPromotion);
  const stats = useSelector(selectPromotionStats);
  const pendingPromotions = useSelector(selectPendingPromotions);
  const approvedPromotions = useSelector(selectApprovedPromotions);
  const completedPromotions = useSelector(selectCompletedPromotions);
  const rejectedPromotions = useSelector(selectRejectedPromotions);
  const generatedPromotion = useSelector(selectGeneratedPromotion);
  const pagination = useSelector(selectPromotionsPagination);
  const filters = useSelector(selectPromotionsFilters);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchPromotions(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchPromotion(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canCreatePromotion) {
        throw new Error('You do not have permission to create promotions');
      }
      return dispatch(createPromotion(data));
    },
    [dispatch, permissions.canCreatePromotion]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdatePromotion) {
        throw new Error('You do not have permission to update promotions');
      }
      return dispatch(updatePromotion({ id, data }));
    },
    [dispatch, permissions.canUpdatePromotion]
  );

  const patch = useCallback(
    (id, data) => {
      if (!permissions.canUpdatePromotion) {
        throw new Error('You do not have permission to update promotions');
      }
      return dispatch(patchPromotion({ id, data }));
    },
    [dispatch, permissions.canUpdatePromotion]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeletePromotion) {
        throw new Error('You do not have permission to delete promotions');
      }
      return dispatch(deletePromotion(id));
    },
    [dispatch, permissions.canDeletePromotion]
  );

  const approve = useCallback(
    (id, notes, targetDate) => {
      if (!permissions.canApprovePromotion) {
        throw new Error('You do not have permission to approve promotions');
      }
      return dispatch(approvePromotion({ id, notes, targetDate }));
    },
    [dispatch, permissions.canApprovePromotion]
  );

  const reject = useCallback(
    (id, reason) => {
      if (!permissions.canRejectPromotion) {
        throw new Error('You do not have permission to reject promotions');
      }
      return dispatch(rejectPromotion({ id, reason }));
    },
    [dispatch, permissions.canRejectPromotion]
  );

  const complete = useCallback(
    (id, actualDate, newSalary) => {
      if (!permissions.canCompletePromotion) {
        throw new Error('You do not have permission to complete promotions');
      }
      return dispatch(completePromotion({ id, actualDate, newSalary }));
    },
    [dispatch, permissions.canCompletePromotion]
  );

  const hold = useCallback(
    (id, reason) => {
      if (!permissions.canHoldPromotion) {
        throw new Error('You do not have permission to hold promotions');
      }
      return dispatch(holdPromotion({ id, reason }));
    },
    [dispatch, permissions.canHoldPromotion]
  );

  const getPending = useCallback(
    () => dispatch(fetchPendingPromotions()),
    [dispatch]
  );

  const getApproved = useCallback(
    () => dispatch(fetchApprovedPromotions()),
    [dispatch]
  );

  const getCompleted = useCallback(
    () => dispatch(fetchCompletedPromotions()),
    [dispatch]
  );

  const getStats = useCallback(
    (year) => dispatch(fetchPromotionStats(year)),
    [dispatch]
  );

  const generateFromRating = useCallback(
    (ratingId) => {
      if (!permissions.canGeneratePromotionFromRating) {
        throw new Error('You do not have permission to generate promotion from rating');
      }
      return dispatch(generatePromotionFromRating(ratingId));
    },
    [dispatch, permissions.canGeneratePromotionFromRating]
  );

  const reset = useCallback(
    () => dispatch(resetPromotionState()),
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => dispatch(setPromotionFilters(newFilters)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(clearPromotionFilters()),
    [dispatch]
  );

  const setPagination = useCallback(
    (newPagination) => dispatch(setPromotionPagination(newPagination)),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canManagePromotions,
    [permissions.canManagePromotions]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    stats,
    pendingPromotions,
    approvedPromotions,
    completedPromotions,
    rejectedPromotions,
    generatedPromotion,
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
    approve,
    reject,
    complete,
    hold,
    getPending,
    getApproved,
    getCompleted,
    getStats,
    generateFromRating,
    reset,
    setFilters,
    clearFilters,
    setPagination,

    // Permissions
    canManage,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => item.id === id),
    hasPending: pendingPromotions.length > 0,
    pendingCount: pendingPromotions.length,
    successRate: stats?.success_rate || 0,
  };
};

export default usePromotions;