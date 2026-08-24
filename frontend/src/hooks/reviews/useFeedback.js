// src/hooks/reviews/useFeedback.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllFeedbackRequests,
  selectFeedbackRequestsLoading,
  selectFeedbackRequestsError,
  selectFeedbackRequestsPagination,
  selectFeedbackRequestsFilters,
  selectSelectedFeedbackRequest,
  selectPendingFeedbackRequestsList,
  selectOverdueFeedbackRequestsList,
  selectAllFeedbackResponses,
  selectFeedbackResponsesLoading,
  selectSelectedFeedbackResponse,
  selectAllFeedbackSummaries,
  selectFeedbackSummariesLoading,
  selectSelectedFeedbackSummary,
  selectMyFeedbackSummary,
} from '../../store/reviews/selectors';
import {
  fetchFeedbackRequests,
  fetchFeedbackRequest,
  createFeedbackRequest,
  updateFeedbackRequest,
  deleteFeedbackRequest,
  remindFeedbackRequest,
  cancelFeedbackRequest,
  bulkCreateFeedbackRequests,
  fetchPendingFeedbackRequests,
  fetchOverdueFeedbackRequests,
  resetRequestState,
  setRequestFilters,
  clearRequestFilters,
  setRequestPagination,
} from '../../store/reviews/slices/feedbackRequest.slice';
import {
  fetchFeedbackResponses,
  fetchFeedbackResponse,
  submitFeedbackResponse,
  fetchFeedbackResponseForRequest,
  resetResponseState,
} from '../../store/reviews/slices/feedbackResponse.slice';
import {
  fetchFeedbackSummaries,
  fetchFeedbackSummary,
  shareFeedbackSummary,
  regenerateFeedbackSummary,
  fetchMyFeedbackSummary,
  resetSummaryState,
} from '../../store/reviews/slices/feedbackSummary.slice';
import { useReviewsPermissions } from './';

const useFeedback = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Request Selectors
  const requestData = useSelector(selectAllFeedbackRequests);
  const requestLoading = useSelector(selectFeedbackRequestsLoading);
  const requestError = useSelector(selectFeedbackRequestsError);
  const pagination = useSelector(selectFeedbackRequestsPagination);
  const filters = useSelector(selectFeedbackRequestsFilters);
  const selectedRequest = useSelector(selectSelectedFeedbackRequest);
  const pendingRequests = useSelector(selectPendingFeedbackRequestsList);
  const overdueRequests = useSelector(selectOverdueFeedbackRequestsList);

  // Response Selectors
  const responseData = useSelector(selectAllFeedbackResponses);
  const responseLoading = useSelector(selectFeedbackResponsesLoading);
  const selectedResponse = useSelector(selectSelectedFeedbackResponse);

  // Summary Selectors
  const summaryData = useSelector(selectAllFeedbackSummaries);
  const summaryLoading = useSelector(selectFeedbackSummariesLoading);
  const selectedSummary = useSelector(selectSelectedFeedbackSummary);
  const mySummary = useSelector(selectMyFeedbackSummary);

  // ===== Request Actions =====
  const fetchRequests = useCallback(
    (params) => dispatch(fetchFeedbackRequests(params)),
    [dispatch]
  );

  const fetchRequest = useCallback(
    (id) => dispatch(fetchFeedbackRequest(id)),
    [dispatch]
  );

  const createRequest = useCallback(
    (data) => {
      if (!permissions.canCreateFeedbackRequest) {
        throw new Error('You do not have permission to create feedback requests');
      }
      return dispatch(createFeedbackRequest(data));
    },
    [dispatch, permissions.canCreateFeedbackRequest]
  );

  const updateRequest = useCallback(
    (id, data) => {
      if (!permissions.canUpdateFeedbackRequest) {
        throw new Error('You do not have permission to update feedback requests');
      }
      return dispatch(updateFeedbackRequest({ id, data }));
    },
    [dispatch, permissions.canUpdateFeedbackRequest]
  );

  const deleteRequest = useCallback(
    (id) => {
      if (!permissions.canDeleteFeedbackRequest) {
        throw new Error('You do not have permission to delete feedback requests');
      }
      return dispatch(deleteFeedbackRequest(id));
    },
    [dispatch, permissions.canDeleteFeedbackRequest]
  );

  const remind = useCallback(
    (id) => {
      if (!permissions.canUpdateFeedbackRequest) {
        throw new Error('You do not have permission to remind feedback requests');
      }
      return dispatch(remindFeedbackRequest(id));
    },
    [dispatch, permissions.canUpdateFeedbackRequest]
  );

  const cancelRequest = useCallback(
    (id) => {
      if (!permissions.canDeleteFeedbackRequest) {
        throw new Error('You do not have permission to cancel feedback requests');
      }
      return dispatch(cancelFeedbackRequest(id));
    },
    [dispatch, permissions.canDeleteFeedbackRequest]
  );

  const bulkCreate = useCallback(
    (reviewers, subjectId, cycleId, reviewerType, dueDate) => {
      if (!permissions.canCreateFeedbackRequest) {
        throw new Error('You do not have permission to create feedback requests');
      }
      return dispatch(bulkCreateFeedbackRequests({
        reviewers,
        subjectId,
        cycleId,
        reviewerType,
        dueDate,
      }));
    },
    [dispatch, permissions.canCreateFeedbackRequest]
  );

  const fetchPending = useCallback(
    () => dispatch(fetchPendingFeedbackRequests()),
    [dispatch]
  );

  const fetchOverdue = useCallback(
    () => dispatch(fetchOverdueFeedbackRequests()),
    [dispatch]
  );

  const resetRequests = useCallback(
    () => dispatch(resetRequestState()),
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => dispatch(setRequestFilters(newFilters)),
    [dispatch]
  );

  const clearFilters = useCallback(
    () => dispatch(clearRequestFilters()),
    [dispatch]
  );

  const setPagination = useCallback(
    (newPagination) => dispatch(setRequestPagination(newPagination)),
    [dispatch]
  );

  // ===== Response Actions =====
  const fetchResponses = useCallback(
    (params) => dispatch(fetchFeedbackResponses(params)),
    [dispatch]
  );

  const fetchResponse = useCallback(
    (id) => dispatch(fetchFeedbackResponse(id)),
    [dispatch]
  );

  const submitResponse = useCallback(
    (requestId, data) => {
      if (!permissions.canCreateComment) {
        throw new Error('You do not have permission to submit feedback responses');
      }
      return dispatch(submitFeedbackResponse({ requestId, data }));
    },
    [dispatch, permissions.canCreateComment]
  );

  const fetchResponseForRequest = useCallback(
    (requestId) => dispatch(fetchFeedbackResponseForRequest(requestId)),
    [dispatch]
  );

  const resetResponses = useCallback(
    () => dispatch(resetResponseState()),
    [dispatch]
  );

  // ===== Summary Actions =====
  const fetchSummaries = useCallback(
    (params) => dispatch(fetchFeedbackSummaries(params)),
    [dispatch]
  );

  const fetchSummary = useCallback(
    (id) => dispatch(fetchFeedbackSummary(id)),
    [dispatch]
  );

  const shareSummary = useCallback(
    (id) => {
      if (!permissions.canShareFeedbackSummary) {
        throw new Error('You do not have permission to share feedback summaries');
      }
      return dispatch(shareFeedbackSummary(id));
    },
    [dispatch, permissions.canShareFeedbackSummary]
  );

  const regenerateSummary = useCallback(
    (id) => {
      if (!permissions.canManageFeedback) {
        throw new Error('You do not have permission to regenerate feedback summaries');
      }
      return dispatch(regenerateFeedbackSummary(id));
    },
    [dispatch, permissions.canManageFeedback]
  );

  const fetchMySummary = useCallback(
    () => dispatch(fetchMyFeedbackSummary()),
    [dispatch]
  );

  const resetSummaries = useCallback(
    () => dispatch(resetSummaryState()),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canManageFeedback,
    [permissions.canManageFeedback]
  );

  return {
    // Request Data
    requestData,
    requestLoading,
    requestError,
    pagination,
    filters,
    selectedRequest,
    pendingRequests,
    overdueRequests,

    // Response Data
    responseData,
    responseLoading,
    selectedResponse,

    // Summary Data
    summaryData,
    summaryLoading,
    selectedSummary,
    mySummary,

    // Request Actions
    fetchRequests,
    fetchRequest,
    createRequest,
    updateRequest,
    deleteRequest,
    remind,
    cancel: cancelRequest,
    cancelRequest,
    bulkCreate,
    fetchPending,
    fetchOverdue,
    resetRequests,
    setFilters,
    clearFilters,
    setPagination,

    // Response Actions
    fetchResponses,
    fetchResponse,
    submitResponse,
    fetchResponseForRequest,
    resetResponses,

    // Summary Actions
    fetchSummaries,
    fetchSummary,
    shareSummary,
    regenerateSummary,
    fetchMySummary,
    resetSummaries,

    // Permissions
    canManage,

    // Utilities
    hasPendingRequests: pendingRequests.length > 0,
    hasOverdueRequests: overdueRequests.length > 0,
    hasSummary: !!mySummary,
  };
};

export default useFeedback;