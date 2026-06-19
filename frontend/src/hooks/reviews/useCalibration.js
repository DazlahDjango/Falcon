// src/hooks/reviews/useCalibration.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllCalibrationSessions,
  selectCalibrationSessionsLoading,
  selectCalibrationSessionsError,
  selectSelectedCalibrationSession,
  selectCalibrationReport,
  selectCalibrationOutliers,
  selectCalibrationRecommendations,
  selectMyCalibrationSessions,
  selectUpcomingCalibrationSessions,
  selectCompletedCalibrationSessions,
  selectInProgressCalibrationSessions,
  selectCalibrationSessionsPagination,
  selectCalibrationSessionsFilters,
} from '../../store/reviews/selectors';
import {
  fetchCalibrationSessions,
  fetchCalibrationSession,
  createCalibrationSession,
  updateCalibrationSession,
  deleteCalibrationSession,
  startCalibrationSession,
  completeCalibrationSession,
  cancelCalibrationSession,
  addCalibrationRating,
  addCalibrationComment,
  fetchCalibrationReport,
  fetchMyCalibrationSessions,
  fetchCalibrationOutliers,
  fetchCalibrationRecommendations,
  resetSessionState,
  setSessionFilters,
  clearSessionFilters,
  setSessionPagination,
} from '../../store/reviews/slices/calibrationSession.slice';
import {
  fetchCalibrationRatings,
  fetchCalibrationRating,
  fetchCalibrationRatingsForSession,
  resetRatingState,
} from '../../store/reviews/slices/calibrationRating.slice';
import { useReviewsPermissions } from './';

const useCalibration = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Session Selectors
  const sessionData = useSelector(selectAllCalibrationSessions);
  const sessionLoading = useSelector(selectCalibrationSessionsLoading);
  const sessionError = useSelector(selectCalibrationSessionsError);
  const selectedSession = useSelector(selectSelectedCalibrationSession);
  const report = useSelector(selectCalibrationReport);
  const outliers = useSelector(selectCalibrationOutliers);
  const recommendations = useSelector(selectCalibrationRecommendations);
  const mySessions = useSelector(selectMyCalibrationSessions);
  const upcomingSessions = useSelector(selectUpcomingCalibrationSessions);
  const completedSessions = useSelector(selectCompletedCalibrationSessions);
  const inProgressSessions = useSelector(selectInProgressCalibrationSessions);
  const pagination = useSelector(selectCalibrationSessionsPagination);
  const filters = useSelector(selectCalibrationSessionsFilters);

  // Rating Selectors
  const ratingData = useSelector((state) => state.reviews?.calibrationRatings?.items ?? []);
  const ratingLoading = useSelector((state) => state.reviews?.calibrationRatings?.loading);

  // ===== Session Actions =====
  const fetchSessions = useCallback(
    (params) => dispatch(fetchCalibrationSessions(params)),
    [dispatch]
  );

  const fetchSession = useCallback(
    (id) => dispatch(fetchCalibrationSession(id)),
    [dispatch]
  );

  const createSession = useCallback(
    (data) => {
      if (!permissions.canCreateCalibrationSession) {
        throw new Error('You do not have permission to create calibration sessions');
      }
      return dispatch(createCalibrationSession(data));
    },
    [dispatch, permissions.canCreateCalibrationSession]
  );

  const updateSession = useCallback(
    (id, data) => {
      if (!permissions.canUpdateCalibrationSession) {
        throw new Error('You do not have permission to update calibration sessions');
      }
      return dispatch(updateCalibrationSession({ id, data }));
    },
    [dispatch, permissions.canUpdateCalibrationSession]
  );

  const deleteSession = useCallback(
    (id) => {
      if (!permissions.canDeleteCalibrationSession) {
        throw new Error('You do not have permission to delete calibration sessions');
      }
      return dispatch(deleteCalibrationSession(id));
    },
    [dispatch, permissions.canDeleteCalibrationSession]
  );

  const startSession = useCallback(
    (id) => {
      if (!permissions.canStartCalibration) {
        throw new Error('You do not have permission to start calibration sessions');
      }
      return dispatch(startCalibrationSession(id));
    },
    [dispatch, permissions.canStartCalibration]
  );

  const completeSession = useCallback(
    (id, decisions, notes) => {
      if (!permissions.canCompleteCalibration) {
        throw new Error('You do not have permission to complete calibration sessions');
      }
      return dispatch(completeCalibrationSession({ id, decisions, notes }));
    },
    [dispatch, permissions.canCompleteCalibration]
  );

  const cancelSession = useCallback(
    (id) => {
      if (!permissions.canCancelCalibration) {
        throw new Error('You do not have permission to cancel calibration sessions');
      }
      return dispatch(cancelCalibrationSession(id));
    },
    [dispatch, permissions.canCancelCalibration]
  );

  const addRating = useCallback(
    (sessionId, finalRatingId, beforeScore, afterScore, reason) => {
      if (!permissions.canCalibrateFinalRating) {
        throw new Error('You do not have permission to add calibration ratings');
      }
      return dispatch(addCalibrationRating({
        sessionId,
        finalRatingId,
        beforeScore,
        afterScore,
        reason,
      }));
    },
    [dispatch, permissions.canCalibrateFinalRating]
  );

  const addComment = useCallback(
    (sessionId, comment, parentCommentId) => {
      if (!permissions.canCreateComment) {
        throw new Error('You do not have permission to add calibration comments');
      }
      return dispatch(addCalibrationComment({ sessionId, comment, parentCommentId }));
    },
    [dispatch, permissions.canCreateComment]
  );

  const getReport = useCallback(
    (id) => dispatch(fetchCalibrationReport(id)),
    [dispatch]
  );

  const getMySessions = useCallback(
    () => dispatch(fetchMyCalibrationSessions()),
    [dispatch]
  );

  const getOutliers = useCallback(
    (cycleId) => dispatch(fetchCalibrationOutliers(cycleId)),
    [dispatch]
  );

  const getRecommendations = useCallback(
    (cycleId) => dispatch(fetchCalibrationRecommendations(cycleId)),
    [dispatch]
  );

  const resetSessions = useCallback(
    () => dispatch(resetSessionState()),
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => dispatch(setSessionFilters(newFilters)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(clearSessionFilters()),
    [dispatch]
  );

  const setPagination = useCallback(
    (newPagination) => dispatch(setSessionPagination(newPagination)),
    [dispatch]
  );

  // ===== Rating Actions =====
  const fetchRatings = useCallback(
    (params) => dispatch(fetchCalibrationRatings(params)),
    [dispatch]
  );

  const fetchRating = useCallback(
    (id) => dispatch(fetchCalibrationRating(id)),
    [dispatch]
  );

  const fetchRatingsForSession = useCallback(
    (sessionId) => dispatch(fetchCalibrationRatingsForSession(sessionId)),
    [dispatch]
  );

  const resetRatings = useCallback(
    () => dispatch(resetRatingState()),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canManageCalibration,
    [permissions.canManageCalibration]
  );

  const canView = useMemo(
    () => permissions.canViewCalibration,
    [permissions.canViewCalibration]
  );

  return {
    // Session Data
    sessionData,
    sessionLoading,
    sessionError,
    selectedSession,
    report,
    outliers,
    recommendations,
    mySessions,
    upcomingSessions,
    completedSessions,
    inProgressSessions,
    pagination,
    filters,

    // Rating Data
    ratingData,
    ratingLoading,

    // Session Actions
    fetchSessions,
    fetchSession,
    createSession,
    updateSession,
    deleteSession,
    startSession,
    completeSession,
    cancelSession,
    addRating,
    addComment,
    getReport,
    getMySessions,
    getOutliers,
    getRecommendations,
    resetSessions,
    setFilters,
    clearFilters,
    setPagination,

    // Rating Actions
    fetchRatings,
    fetchRating,
    fetchRatingsForSession,
    resetRatings,

    // Permissions
    canManage,
    canView,

    // Utilities
    isEmpty: sessionData.length === 0,
    totalCount: sessionData.length,
    getSessionById: (id) => sessionData.find((item) => item.id === id),
    hasUpcomingSessions: upcomingSessions.length > 0,
    hasInProgressSessions: inProgressSessions.length > 0,
  };
};

export default useCalibration;