// src/hooks/reviews/useFinalRating.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllFinalRatings,
  selectFinalRatingsLoading,
  selectFinalRatingsError,
  selectSelectedFinalRating,
  selectMyFinalRating,
  selectRatingDistribution,
  selectFinalRatingStats,
  selectLockedFinalRatings,
  selectCalibratedFinalRatings,
  selectApprovedFinalRatings,
  selectPendingFinalRatings,
  selectAverageFinalScore,
} from '../../store/reviews/selectors';
import {
  fetchFinalRatings,
  fetchFinalRating,
  approveFinalRating,
  lockFinalRating,
  forceLockFinalRating,
  calibrateFinalRating,
  recalibrateFinalRating,
  recalculateFinalRating,
  generatePIPFromRating,
  generatePromotionFromRating,
  fetchMyFinalRating,
  fetchFinalRatingDistribution,
  fetchFinalRatingStats,
  resetFinalRatingState,
} from '../../store/reviews/slices/finalRating.slice';
import { useReviewsPermissions } from './';

const useFinalRating = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllFinalRatings);
  const loading = useSelector(selectFinalRatingsLoading);
  const error = useSelector(selectFinalRatingsError);
  const selected = useSelector(selectSelectedFinalRating);
  const myFinalRating = useSelector(selectMyFinalRating);
  const distribution = useSelector(selectRatingDistribution);
  const stats = useSelector(selectFinalRatingStats);
  const lockedRatings = useSelector(selectLockedFinalRatings);
  const calibratedRatings = useSelector(selectCalibratedFinalRatings);
  const approvedRatings = useSelector(selectApprovedFinalRatings);
  const pendingRatings = useSelector(selectPendingFinalRatings);
  const averageScore = useSelector(selectAverageFinalScore);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchFinalRatings(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchFinalRating(id)),
    [dispatch]
  );

  const approve = useCallback(
    (id, notes) => {
      if (!permissions.canApproveFinalRating) {
        throw new Error('You do not have permission to approve final ratings');
      }
      return dispatch(approveFinalRating({ id, notes }));
    },
    [dispatch, permissions.canApproveFinalRating]
  );

  const lock = useCallback(
    (id) => {
      if (!permissions.canLockFinalRating) {
        throw new Error('You do not have permission to lock final ratings');
      }
      return dispatch(lockFinalRating(id));
    },
    [dispatch, permissions.canLockFinalRating]
  );

  const forceLock = useCallback(
    (id) => {
      if (!permissions.canLockFinalRating) {
        throw new Error('You do not have permission to force lock final ratings');
      }
      return dispatch(forceLockFinalRating(id));
    },
    [dispatch, permissions.canLockFinalRating]
  );

  const calibrate = useCallback(
    (id, adjustedScore, reason) => {
      if (!permissions.canCalibrateFinalRating) {
        throw new Error('You do not have permission to calibrate final ratings');
      }
      return dispatch(calibrateFinalRating({ id, adjustedScore, reason }));
    },
    [dispatch, permissions.canCalibrateFinalRating]
  );

  const recalibrate = useCallback(
    (id) => {
      if (!permissions.canCalibrateFinalRating) {
        throw new Error('You do not have permission to recalibrate final ratings');
      }
      return dispatch(recalibrateFinalRating(id));
    },
    [dispatch, permissions.canCalibrateFinalRating]
  );

  const recalculate = useCallback(
    (id) => {
      if (!permissions.canLockFinalRating) {
        throw new Error('You do not have permission to recalculate final ratings');
      }
      return dispatch(recalculateFinalRating(id));
    },
    [dispatch, permissions.canLockFinalRating]
  );

  const generatePIP = useCallback(
    (id) => {
      if (!permissions.canGeneratePIPFromRating) {
        throw new Error('You do not have permission to generate PIP from rating');
      }
      return dispatch(generatePIPFromRating(id));
    },
    [dispatch, permissions.canGeneratePIPFromRating]
  );

  const generatePromotion = useCallback(
    (id) => {
      if (!permissions.canGeneratePromotionFromRating) {
        throw new Error('You do not have permission to generate promotion from rating');
      }
      return dispatch(generatePromotionFromRating(id));
    },
    [dispatch, permissions.canGeneratePromotionFromRating]
  );

  const fetchMy = useCallback(
    () => dispatch(fetchMyFinalRating()),
    [dispatch]
  );

  const getDistribution = useCallback(
    (cycleId) => dispatch(fetchFinalRatingDistribution(cycleId)),
    [dispatch]
  );

  const getStats = useCallback(
    (cycleId) => dispatch(fetchFinalRatingStats(cycleId)),
    [dispatch]
  );

  const reset = useCallback(
    () => dispatch(resetFinalRatingState()),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canLockFinalRating,
    [permissions.canLockFinalRating]
  );

  const canApprove = useMemo(
    () => permissions.canApproveFinalRating,
    [permissions.canApproveFinalRating]
  );

  const canCalibrate = useMemo(
    () => permissions.canCalibrateFinalRating,
    [permissions.canCalibrateFinalRating]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    myFinalRating,
    distribution,
    stats,
    lockedRatings,
    calibratedRatings,
    approvedRatings,
    pendingRatings,
    averageScore,

    // Actions
    fetchAll,
    fetchOne,
    approve,
    lock,
    forceLock,
    calibrate,
    recalibrate,
    recalculate,
    generatePIP,
    generatePromotion,
    fetchMy,
    getDistribution,
    getStats,
    reset,

    // Permissions
    canManage,
    canApprove,
    canCalibrate,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => item.id === id),
    hasFinalRating: !!myFinalRating,
    isLocked: myFinalRating?.status === 'locked',
    isCalibrated: myFinalRating?.status === 'calibrated',
  };
};

export default useFinalRating;