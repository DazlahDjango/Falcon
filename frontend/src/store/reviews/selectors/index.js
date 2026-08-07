// src/store/reviews/selectors/index.js
import { createSelector } from '@reduxjs/toolkit';

// ========== Constants for default values (to preserve references) ==========
const DEFAULT_EMPTY_ARRAY = [];
const DEFAULT_EMPTY_OBJECT = {};
const DEFAULT_PAGINATION = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 0
};

// ========== Base Selectors ==========
// These are the foundation - keep them simple and direct

// ========== Rating Scale Selectors ==========
export const selectRatingScalesState = (state) => state.reviews?.ratingScales;
export const selectAllRatingScales = (state) => selectRatingScalesState(state)?.items ?? [];
export const selectRatingScaleById = (state, id) =>
  selectAllRatingScales(state).find((item) => item.id === id);
export const selectSelectedRatingScale = (state) => selectRatingScalesState(state)?.selectedItem;
export const selectRatingScalesLoading = (state) => selectRatingScalesState(state)?.loading;
export const selectRatingScalesError = (state) => selectRatingScalesState(state)?.error;
export const selectRatingScalesPagination = (state) => selectRatingScalesState(state)?.pagination ?? DEFAULT_PAGINATION;
export const selectRatingScalesFilters = (state) => selectRatingScalesState(state)?.filters ?? {};

// Memoized Rating Scale Selectors
export const selectActiveRatingScales = createSelector(
  [selectAllRatingScales],
  (scales) => scales.filter((item) => item.is_active)
);

export const selectDefaultRatingScale = createSelector(
  [selectAllRatingScales],
  (scales) => scales.find((item) => item.is_default)
);

export const selectRatingScalesByType = createSelector(
  [selectAllRatingScales, (state, type) => type],
  (scales, type) => scales.filter((item) => item.type === type)
);

// ========== Competency Selectors ==========
export const selectCompetenciesState = (state) => state.reviews?.competencies;
export const selectAllCompetencies = (state) => selectCompetenciesState(state)?.items ?? [];
export const selectCompetencyById = (state, id) =>
  selectAllCompetencies(state).find((item) => item.id === id);
export const selectSelectedCompetency = (state) => selectCompetenciesState(state)?.selectedItem;
export const selectCompetenciesLoading = (state) => selectCompetenciesState(state)?.loading;
export const selectCompetenciesError = (state) => selectCompetenciesState(state)?.error;
export const selectCompetenciesPagination = (state) => selectCompetenciesState(state)?.pagination ?? DEFAULT_PAGINATION;
export const selectCompetenciesFilters = (state) => selectCompetenciesState(state)?.filters ?? DEFAULT_EMPTY_OBJECT;
export const selectCompetencyUsageStats = (state) => selectCompetenciesState(state)?.usageStats;
export const selectActiveCompetenciesList = (state) => selectCompetenciesState(state)?.activeCompetencies;
export const selectRequiredCompetenciesList = (state) => selectCompetenciesState(state)?.requiredCompetencies;

// Memoized Competency Selectors
export const selectActiveCompetencies = createSelector(
  [selectAllCompetencies],
  (competencies) => competencies.filter((item) => item.is_active)
);

export const selectRequiredCompetencies = createSelector(
  [selectAllCompetencies],
  (competencies) => competencies.filter((item) => item.is_required)
);

export const selectCompetenciesByType = createSelector(
  [selectAllCompetencies, (state, type) => type],
  (competencies, type) => competencies.filter((item) => item.competency_type === type)
);

export const selectCompetenciesByCategory = createSelector(
  [selectAllCompetencies, (state, categoryId) => categoryId],
  (competencies, categoryId) => competencies.filter((item) => item.category === categoryId)
);

// ========== Competency Category Selectors ==========
export const selectCompetencyCategoriesState = (state) => state.reviews?.competencyCategories;
export const selectAllCompetencyCategories = (state) => selectCompetencyCategoriesState(state)?.items ?? [];
export const selectCompetencyCategoryById = (state, id) =>
  selectAllCompetencyCategories(state).find((item) => item.id === id);
export const selectSelectedCompetencyCategory = (state) => selectCompetencyCategoriesState(state)?.selectedItem;
export const selectCompetencyCategoriesLoading = (state) => selectCompetencyCategoriesState(state)?.loading;
export const selectCompetencyCategoryError = (state) => selectCompetencyCategoriesState(state)?.error;
export const selectCompetencyCategoryPagination = (state) => selectCompetencyCategoriesState(state)?.pagination ?? DEFAULT_PAGINATION;
export const selectCompetencyCategoryFilters = (state) => selectCompetencyCategoriesState(state)?.filters ?? DEFAULT_EMPTY_OBJECT;
export const selectCategoryCompetencies = (state) => selectCompetencyCategoriesState(state)?.categoryCompetencies;

// Memoized Category Selectors
export const selectActiveCompetencyCategories = createSelector(
  [selectAllCompetencyCategories],
  (categories) => categories.filter((item) => item.is_active)
);

// ========== Competency Rating Selectors ==========
export const selectCompetencyRatingsState = (state) => state.reviews?.competencyRatings;
export const selectAllCompetencyRatings = (state) => selectCompetencyRatingsState(state)?.items ?? [];
export const selectCompetencyRatingById = (state, id) =>
  selectAllCompetencyRatings(state).find((item) => item.id === id);
export const selectSelectedCompetencyRating = (state) => selectCompetencyRatingsState(state)?.selectedItem;
export const selectCompetencyRatingsLoading = (state) => selectCompetencyRatingsState(state)?.loading;

// ========== Review Cycle Selectors ==========
export const selectCyclesState = (state) => state.reviews?.cycles;
export const selectAllCycles = (state) => selectCyclesState(state)?.items ?? [];
export const selectCycleById = (state, id) =>
  selectAllCycles(state).find((item) => item.id === id);
export const selectSelectedCycle = (state) => selectCyclesState(state)?.selectedItem;
export const selectCyclesLoading = (state) => selectCyclesState(state)?.loading;
export const selectCyclesError = (state) => selectCyclesState(state)?.error;
export const selectCyclesPagination = (state) => selectCyclesState(state)?.pagination ?? { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 };
export const selectCyclesFilters = (state) => selectCyclesState(state)?.filters ?? {};
export const selectActiveCycle = (state) => selectCyclesState(state)?.activeCycle;
export const selectCycleProgress = (state) => selectCyclesState(state)?.progress;
export const selectCycleParticipants = (state) => selectCyclesState(state)?.participants;
export const selectCycleSummary = (state) => selectCyclesState(state)?.summary;

// Memoized Cycle Selectors
export const selectActiveCycles = createSelector(
  [selectAllCycles],
  (cycles) => cycles.filter((item) => item.status === 'active' || item.status === 'submitted')
);

export const selectCompletedCycles = createSelector(
  [selectAllCycles],
  (cycles) => cycles.filter((item) => item.status === 'completed')
);

export const selectArchivedCycles = createSelector(
  [selectAllCycles],
  (cycles) => cycles.filter((item) => item.status === 'archived')
);

export const selectUpcomingCycles = createSelector(
  [selectAllCycles],
  (cycles) => cycles.filter((item) => item.status === 'draft' || item.status === 'upcoming')
);

export const selectCyclesByType = createSelector(
  [selectAllCycles, (state, type) => type],
  (cycles, type) => cycles.filter((item) => item.cycle_type === type)
);

export const selectCyclesByYear = createSelector(
  [selectAllCycles, (state, year) => year],
  (cycles, year) => cycles.filter((item) => new Date(item.start_date).getFullYear() === year)
);

// ========== Self Assessment Selectors ==========
export const selectSelfAssessmentsState = (state) => state.reviews?.selfAssessments;
export const selectAllSelfAssessments = (state) => selectSelfAssessmentsState(state)?.items ?? [];
export const selectSelfAssessmentById = (state, id) =>
  selectAllSelfAssessments(state).find((item) => item.id === id);
export const selectSelectedSelfAssessment = (state) => selectSelfAssessmentsState(state)?.selectedItem;
export const selectSelfAssessmentsLoading = (state) => selectSelfAssessmentsState(state)?.loading;
export const selectSelfAssessmentsError = (state) => selectSelfAssessmentsState(state)?.error;
export const selectSelfAssessmentStats = (state) => selectSelfAssessmentsState(state)?.stats;

export const selectMySelfAssessment = createSelector(
  [selectAllSelfAssessments, (state) => state.auth?.user?.id],
  (assessments, userId) => assessments.find((item) => item.employee === userId)
);

export const selectPendingSelfAssessments = createSelector(
  [selectAllSelfAssessments],
  (assessments) => assessments.filter((item) => item.status === 'draft')
);

export const selectSubmittedSelfAssessments = createSelector(
  [selectAllSelfAssessments],
  (assessments) => assessments.filter((item) => item.status === 'submitted')
);

export const selectLateSelfAssessments = createSelector(
  [selectAllSelfAssessments],
  (assessments) => assessments.filter((item) => item.is_late)
);

// ========== Supervisor Review Selectors ==========
export const selectSupervisorReviewsState = (state) => state.reviews?.supervisorReviews;
export const selectAllSupervisorReviews = (state) => selectSupervisorReviewsState(state)?.items ?? [];
export const selectSupervisorReviewById = (state, id) =>
  selectAllSupervisorReviews(state).find((item) => item.id === id);
export const selectSelectedSupervisorReview = (state) => selectSupervisorReviewsState(state)?.selectedItem;
export const selectSupervisorReviewsLoading = (state) => selectSupervisorReviewsState(state)?.loading;
export const selectSupervisorReviewsError = (state) => selectSupervisorReviewsState(state)?.error;
export const selectSupervisorReviewComparison = (state) => selectSupervisorReviewsState(state)?.comparison;
export const selectSupervisorReviewStats = (state) => selectSupervisorReviewsState(state)?.stats;

export const selectMyReviewQueue = createSelector(
  [selectAllSupervisorReviews, (state) => state.auth?.user?.id],
  (reviews, userId) => reviews.filter((item) => 
    item.supervisor === userId && item.status === 'submitted'
  )
);

export const selectPendingApprovals = createSelector(
  [selectAllSupervisorReviews],
  (reviews) => reviews.filter((item) => item.status === 'pending_approval' || item.status === 'submitted')
);

export const selectApprovedReviews = createSelector(
  [selectAllSupervisorReviews],
  (reviews) => reviews.filter((item) => item.status === 'approved')
);

export const selectRejectedReviews = createSelector(
  [selectAllSupervisorReviews],
  (reviews) => reviews.filter((item) => item.status === 'rejected')
);

export const selectReviewsByEmployee = createSelector(
  [selectAllSupervisorReviews, (state, employeeId) => employeeId],
  (reviews, employeeId) => reviews.filter((item) => item.employee === employeeId)
);

// ========== Final Rating Selectors ==========
export const selectFinalRatingsState = (state) => state.reviews?.finalRatings;
export const selectAllFinalRatings = (state) => selectFinalRatingsState(state)?.items ?? [];
export const selectFinalRatingById = (state, id) =>
  selectAllFinalRatings(state).find((item) => item.id === id);
export const selectSelectedFinalRating = (state) => selectFinalRatingsState(state)?.selectedItem;
export const selectFinalRatingsLoading = (state) => selectFinalRatingsState(state)?.loading;
export const selectFinalRatingsError = (state) => selectFinalRatingsState(state)?.error;
export const selectRatingDistribution = (state) => selectFinalRatingsState(state)?.distribution;
export const selectFinalRatingStats = (state) => selectFinalRatingsState(state)?.stats;
export const selectFinalRatingsPagination = (state) =>
  selectFinalRatingsState(state)?.pagination ?? {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  };
export const selectFinalRatingsFilters = (state) => selectFinalRatingsState(state)?.filters ?? {};
export const selectFinalRatingsSort = (state) => selectFinalRatingsState(state)?.sort;

export const selectMyFinalRating = createSelector(
  [selectAllFinalRatings, (state) => state.auth?.user?.id],
  (ratings, userId) => ratings.find((item) => item.employee === userId)
);

export const selectLockedFinalRatings = createSelector(
  [selectAllFinalRatings],
  (ratings) => ratings.filter((item) => item.status === 'locked')
);

export const selectCalibratedFinalRatings = createSelector(
  [selectAllFinalRatings],
  (ratings) => ratings.filter((item) => item.status === 'calibrated')
);

export const selectApprovedFinalRatings = createSelector(
  [selectAllFinalRatings],
  (ratings) => ratings.filter((item) => item.status === 'approved')
);

export const selectPendingFinalRatings = createSelector(
  [selectAllFinalRatings],
  (ratings) => ratings.filter((item) => item.status === 'pending')
);

export const selectRatingsByCycle = createSelector(
  [selectAllFinalRatings, (state, cycleId) => cycleId],
  (ratings, cycleId) => ratings.filter((item) => item.review_cycle === cycleId)
);

export const selectRatingsWithPromotion = createSelector(
  [selectAllFinalRatings],
  (ratings) => ratings.filter((item) => item.promotion_recommended)
);

export const selectRatingsWithPIP = createSelector(
  [selectAllFinalRatings],
  (ratings) => ratings.filter((item) => item.pip_recommended)
);

export const selectAverageFinalScore = createSelector(
  [selectAllFinalRatings],
  (ratings) => {
    const scores = ratings.filter(r => r.final_score !== null).map(r => r.final_score);
    if (scores.length === 0) return null;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }
);

// ========== PIP Selectors ==========
export const selectPIPsState = (state) => state.reviews?.pips;
export const selectAllPIPs = (state) => selectPIPsState(state)?.items ?? [];
export const selectPIPById = (state, id) =>
  selectAllPIPs(state).find((item) => item.id === id);
export const selectSelectedPIP = (state) => selectPIPsState(state)?.selectedItem;
export const selectPIPsLoading = (state) => selectPIPsState(state)?.loading;
export const selectPIPsError = (state) => selectPIPsState(state)?.error;
export const selectPIPsPagination = (state) =>
  selectPIPsState(state)?.pagination ?? {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  };
export const selectPIPsFilters = (state) => selectPIPsState(state)?.filters ?? {};
export const selectPIPProgress = (state) => selectPIPsState(state)?.progress;
export const selectPIPStats = (state) => selectPIPsState(state)?.stats;
export const selectPIPTrends = (state) => selectPIPsState(state)?.trends;

export const selectMyPIPs = createSelector(
  [selectAllPIPs, (state) => state.auth?.user?.id],
  (pips, userId) => pips.filter((item) => item.employee === userId)
);

export const selectManagingPIPs = createSelector(
  [selectAllPIPs, (state) => state.auth?.user?.id],
  (pips, userId) => pips.filter((item) => item.owner === userId)
);

export const selectActivePIPs = createSelector(
  [selectAllPIPs],
  (pips) => pips.filter((item) => item.status === 'active' || item.status === 'draft' || item.status === 'submitted')
);

export const selectOverduePIPs = createSelector(
  [selectAllPIPs],
  (pips) => pips.filter((item) => item.is_overdue)
);

export const selectCompletedPIPs = createSelector(
  [selectAllPIPs],
  (pips) => pips.filter((item) => item.status === 'completed')
);

export const selectSuccessfulPIPs = createSelector(
  [selectAllPIPs],
  (pips) => pips.filter((item) => item.outcome === 'successful')
);

export const selectFailedPIPs = createSelector(
  [selectAllPIPs],
  (pips) => pips.filter((item) => item.outcome === 'failed')
);

export const selectPIPsBySeverity = createSelector(
  [selectAllPIPs, (state, severity) => severity],
  (pips, severity) => pips.filter((item) => item.severity === severity)
);

export const selectPIPsByEmployee = createSelector(
  [selectAllPIPs, (state, employeeId) => employeeId],
  (pips, employeeId) => pips.filter((item) => item.employee === employeeId)
);

// ========== PIP Action Selectors ==========
export const selectPIPActionsState = (state) => state.reviews?.pipActions;
export const selectAllPIPActions = (state) => selectPIPActionsState(state)?.items ?? [];
export const selectPIPActionById = (state, id) =>
  selectAllPIPActions(state).find((item) => item.id === id);
export const selectSelectedPIPAction = (state) => selectPIPActionsState(state)?.selectedItem;
export const selectPIPActionsLoading = (state) => selectPIPActionsState(state)?.loading;
export const selectPIPActionsForPIP = (state) => selectPIPActionsState(state)?.pipActions;

export const selectCompletedPIPActions = createSelector(
  [selectAllPIPActions],
  (actions) => actions.filter((item) => item.status === 'completed')
);

export const selectPendingPIPActions = createSelector(
  [selectAllPIPActions],
  (actions) => actions.filter((item) => item.status === 'pending')
);

export const selectMissedPIPActions = createSelector(
  [selectAllPIPActions],
  (actions) => actions.filter((item) => item.status === 'missed')
);

// ========== PIP Review Selectors ==========
export const selectPIPReviewsState = (state) => state.reviews?.pipReviews;
export const selectAllPIPReviews = (state) => selectPIPReviewsState(state)?.items ?? [];
export const selectPIPReviewById = (state, id) =>
  selectAllPIPReviews(state).find((item) => item.id === id);
export const selectSelectedPIPReview = (state) => selectPIPReviewsState(state)?.selectedItem;
export const selectPIPReviewsLoading = (state) => selectPIPReviewsState(state)?.loading;
export const selectPIPReviewsForPIP = (state) => selectPIPReviewsState(state)?.pipReviews;

// ========== Feedback Selectors ==========
export const selectFeedbackRequestsState = (state) => state.reviews?.feedbackRequests;
export const selectAllFeedbackRequests = (state) => selectFeedbackRequestsState(state)?.items ?? [];
export const selectFeedbackRequestById = (state, id) =>
  selectAllFeedbackRequests(state).find((item) => item.id === id);
export const selectSelectedFeedbackRequest = (state) => selectFeedbackRequestsState(state)?.selectedItem;
export const selectFeedbackRequestsLoading = (state) => selectFeedbackRequestsState(state)?.loading;
export const selectFeedbackRequestsError = (state) => selectFeedbackRequestsState(state)?.error;
export const selectFeedbackRequestsPagination = (state) =>
  selectFeedbackRequestsState(state)?.pagination ?? {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  };
export const selectFeedbackRequestsFilters = (state) => selectFeedbackRequestsState(state)?.filters ?? {};
export const selectPendingFeedbackRequestsList = (state) => selectFeedbackRequestsState(state)?.pendingRequests ?? [];
export const selectOverdueFeedbackRequestsList = (state) => selectFeedbackRequestsState(state)?.overdueRequests ?? [];

export const selectFeedbackResponsesState = (state) => state.reviews?.feedbackResponses;
export const selectAllFeedbackResponses = (state) => selectFeedbackResponsesState(state)?.items ?? [];
export const selectSelectedFeedbackResponse = (state) => selectFeedbackResponsesState(state)?.selectedItem;
export const selectFeedbackResponsesLoading = (state) => selectFeedbackResponsesState(state)?.loading;

export const selectFeedbackSummariesState = (state) => state.reviews?.feedbackSummaries;
export const selectAllFeedbackSummaries = (state) => selectFeedbackSummariesState(state)?.items ?? [];
export const selectSelectedFeedbackSummary = (state) => selectFeedbackSummariesState(state)?.selectedItem;
export const selectFeedbackSummariesLoading = (state) => selectFeedbackSummariesState(state)?.loading;
export const selectMyFeedbackSummary = (state) => selectFeedbackSummariesState(state)?.mySummary;

export const selectPendingFeedbackRequests = createSelector(
  [selectAllFeedbackRequests],
  (requests) => requests.filter((item) => item.status === 'pending' || item.status === 'draft')
);

export const selectOverdueFeedbackRequests = createSelector(
  [selectAllFeedbackRequests],
  (requests) => requests.filter((item) => item.is_overdue)
);

export const selectCompletedFeedbackRequests = createSelector(
  [selectAllFeedbackRequests],
  (requests) => requests.filter((item) => item.status === 'completed')
);

export const selectFeedbackBySubject = createSelector(
  [selectAllFeedbackRequests, (state, subjectId) => subjectId],
  (requests, subjectId) => requests.filter((item) => item.subject === subjectId)
);

export const selectFeedbackByReviewer = createSelector(
  [selectAllFeedbackRequests, (state, reviewerId) => reviewerId],
  (requests, reviewerId) => requests.filter((item) => item.reviewer === reviewerId)
);

// ========== Calibration Selectors ==========
export const selectCalibrationSessionsState = (state) => state.reviews?.calibrationSessions;
export const selectAllCalibrationSessions = (state) => selectCalibrationSessionsState(state)?.items ?? [];
export const selectCalibrationSessionById = (state, id) =>
  selectAllCalibrationSessions(state).find((item) => item.id === id);
export const selectSelectedCalibrationSession = (state) => selectCalibrationSessionsState(state)?.selectedItem;
export const selectCalibrationSessionsLoading = (state) => selectCalibrationSessionsState(state)?.loading;
export const selectCalibrationSessionsError = (state) => selectCalibrationSessionsState(state)?.error;
export const selectCalibrationReport = (state) => selectCalibrationSessionsState(state)?.report;
export const selectCalibrationOutliers = (state) => selectCalibrationSessionsState(state)?.outliers;
export const selectCalibrationRecommendations = (state) => selectCalibrationSessionsState(state)?.recommendations;
export const selectMyCalibrationSessions = (state) => selectCalibrationSessionsState(state)?.mySessions;
export const selectCalibrationSessionsPagination = (state) => selectCalibrationSessionsState(state)?.pagination ?? { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 };
export const selectCalibrationSessionsFilters = (state) => selectCalibrationSessionsState(state)?.filters ?? {};

export const selectUpcomingCalibrationSessions = createSelector(
  [selectAllCalibrationSessions],
  (sessions) => sessions.filter((item) => item.is_upcoming)
);

export const selectCompletedCalibrationSessions = createSelector(
  [selectAllCalibrationSessions],
  (sessions) => sessions.filter((item) => item.status === 'completed')
);

export const selectInProgressCalibrationSessions = createSelector(
  [selectAllCalibrationSessions],
  (sessions) => sessions.filter((item) => item.status === 'under_review')
);

export const selectCalibrationSessionsByCycle = createSelector(
  [selectAllCalibrationSessions, (state, cycleId) => cycleId],
  (sessions, cycleId) => sessions.filter((item) => item.review_cycle === cycleId)
);

// ========== Calibration Rating Selectors ==========
export const selectCalibrationRatingsState = (state) => state.reviews?.calibrationRatings;
export const selectAllCalibrationRatings = (state) => selectCalibrationRatingsState(state)?.items ?? [];
export const selectCalibrationRatingById = (state, id) =>
  selectAllCalibrationRatings(state).find((item) => item.id === id);
export const selectSelectedCalibrationRating = (state) => selectCalibrationRatingsState(state)?.selectedItem;
export const selectCalibrationRatingsLoading = (state) => selectCalibrationRatingsState(state)?.loading;

// ============ Coefficient Selectors ============
export const selectCoefficientsState = (state) => {
  console.log('[selectors] selectCoefficientsState called, state.reviews:', state.reviews);
  console.log('[selectors] selectCoefficientsState returning:', state.reviews?.coefficients);
  return state.reviews?.coefficients;
};

export const selectAllCoefficients = createSelector(
  [selectCoefficientsState],
  (state) => {
    console.log('[selectors] selectAllCoefficients called, state:', state);
    console.log('[selectors] selectAllCoefficients state.items:', state?.items);
    const result = state?.items ?? DEFAULT_EMPTY_ARRAY;
    console.log('[selectors] selectAllCoefficients returning:', result);
    return result;
  }
);

export const selectCoefficientById = createSelector(
  [selectAllCoefficients, (state, id) => id],
  (items, id) => items.find((item) => item.id === id)
);

export const selectSelectedCoefficient = createSelector(
  [selectCoefficientsState],
  (state) => state?.selectedItem ?? null
);

export const selectCoefficientsLoading = createSelector(
  [selectCoefficientsState],
  (state) => state?.loading ?? false
);

export const selectCoefficientsError = createSelector(
  [selectCoefficientsState],
  (state) => state?.error ?? null
);

export const selectActiveCoefficientsList = createSelector(
  [selectCoefficientsState],
  (state) => state?.activeCoefficients ?? DEFAULT_EMPTY_ARRAY
);

export const selectApplyResult = createSelector(
  [selectCoefficientsState],
  (state) => state?.applyResult ?? null
);

export const selectCoefficientsPagination = createSelector(
  [selectCoefficientsState],
  (state) => state?.pagination ?? DEFAULT_PAGINATION
);

export const selectCoefficientsFilters = createSelector(
  [selectCoefficientsState],
  (state) => state?.filters ?? DEFAULT_EMPTY_OBJECT
);

export const selectActiveCoefficients = createSelector(
  [selectAllCoefficients],
  (coefficients) => coefficients.filter((item) => item.is_active)
);

export const selectCoefficientsByType = createSelector(
  [selectAllCoefficients, (state, type) => type],
  (coefficients, type) => coefficients.filter((item) => item.coefficient_type === type)
);

export const selectCoefficientsByDepartment = createSelector(
  [selectAllCoefficients, (state, deptId) => deptId],
  (coefficients, deptId) => coefficients.filter((item) => item.department === deptId)
);

// ========== Comment Selectors ==========
export const selectCommentsState = (state) => state.reviews?.comments;
export const selectAllComments = (state) => selectCommentsState(state)?.items ?? [];
export const selectCommentById = (state, id) =>
  selectAllComments(state).find((item) => item.id === id);
export const selectSelectedComment = (state) => selectCommentsState(state)?.selectedItem;
export const selectCommentsLoading = (state) => selectCommentsState(state)?.loading;
export const selectCommentsError = (state) => selectCommentsState(state)?.error;
export const selectCommentReplies = (state) => selectCommentsState(state)?.replies;
export const selectCommentsByObject = (state) => selectCommentsState(state)?.commentsByObject;

export const selectCommentsForObject = createSelector(
  [selectCommentsByObject, (state, contentType, objectId) => ({ contentType, objectId })],
  (commentsByObject, { contentType, objectId }) => {
    const key = `${contentType}_${objectId}`;
    return commentsByObject?.[key] || [];
  }
);

export const selectResolvedComments = createSelector(
  [selectAllComments],
  (comments) => comments.filter((item) => item.is_resolved)
);

export const selectUnresolvedComments = createSelector(
  [selectAllComments],
  (comments) => comments.filter((item) => !item.is_resolved)
);

// ========== Promotion Selectors ==========
export const selectPromotionsState = (state) => state.reviews?.promotions;
export const selectAllPromotions = (state) => selectPromotionsState(state)?.items ?? [];
export const selectPromotionById = (state, id) =>
  selectAllPromotions(state).find((item) => item.id === id);
export const selectSelectedPromotion = (state) => selectPromotionsState(state)?.selectedItem;
export const selectPromotionsLoading = (state) => selectPromotionsState(state)?.loading;
export const selectPromotionsError = (state) => selectPromotionsState(state)?.error;
export const selectPromotionsPagination = (state) => selectPromotionsState(state)?.pagination ?? { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 };
export const selectPromotionsFilters = (state) => selectPromotionsState(state)?.filters ?? {};
export const selectPendingPromotionsList = (state) => selectPromotionsState(state)?.pending;
export const selectApprovedPromotionsList = (state) => selectPromotionsState(state)?.approved;
export const selectCompletedPromotionsList = (state) => selectPromotionsState(state)?.completed;
export const selectPromotionStats = (state) => selectPromotionsState(state)?.stats;
export const selectGeneratedPromotion = (state) => selectPromotionsState(state)?.generatedPromotion;

export const selectPendingPromotions = createSelector(
  [selectAllPromotions],
  (promotions) => promotions.filter((item) => item.status === 'pending')
);

export const selectApprovedPromotions = createSelector(
  [selectAllPromotions],
  (promotions) => promotions.filter((item) => item.status === 'approved')
);

export const selectCompletedPromotions = createSelector(
  [selectAllPromotions],
  (promotions) => promotions.filter((item) => item.status === 'completed')
);

export const selectRejectedPromotions = createSelector(
  [selectAllPromotions],
  (promotions) => promotions.filter((item) => item.status === 'rejected')
);

export const selectPromotionsByEmployee = createSelector(
  [selectAllPromotions, (state, employeeId) => employeeId],
  (promotions, employeeId) => promotions.filter((item) => item.employee === employeeId)
);

export const selectPromotionsByPriority = createSelector(
  [selectAllPromotions, (state, priority) => priority],
  (promotions, priority) => promotions.filter((item) => item.priority === priority)
);

// ========== Template Selectors ==========
export const selectTemplatesState = (state) => state.reviews?.templates;
export const selectAllTemplates = (state) => selectTemplatesState(state)?.items ?? [];
export const selectTemplateById = (state, id) =>
  selectAllTemplates(state).find((item) => item.id === id);
export const selectSelectedTemplate = (state) => selectTemplatesState(state)?.selectedItem;
export const selectTemplatesLoading = (state) => selectTemplatesState(state)?.loading;
export const selectTemplatesError = (state) => selectTemplatesState(state)?.error;
export const selectTemplatesPagination = (state) => selectTemplatesState(state)?.pagination ?? { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 };
export const selectTemplatesFilters = (state) => selectTemplatesState(state)?.filters ?? {};
export const selectDefaultTemplate = (state) => selectTemplatesState(state)?.defaultTemplate;
export const selectActiveTemplatesList = (state) => selectTemplatesState(state)?.activeTemplates;
export const selectDuplicatedTemplate = (state) => selectTemplatesState(state)?.duplicatedTemplate;

export const selectActiveTemplates = createSelector(
  [selectAllTemplates],
  (templates) => templates.filter((item) => item.is_active)
);

// ========== Dashboard Selectors ==========
export const selectDashboardState = (state) => state.reviews?.dashboard;
export const selectStaffDashboard = (state) => selectDashboardState(state)?.staff;
export const selectSupervisorDashboard = (state) => selectDashboardState(state)?.supervisor;
export const selectExecutiveDashboard = (state) => selectDashboardState(state)?.executive;
export const selectAdminDashboard = (state) => selectDashboardState(state)?.admin;
export const selectDashboardMetrics = (state) => selectDashboardState(state)?.metrics;
export const selectDashboardLoading = (state) => selectDashboardState(state)?.loading;
export const selectDashboardError = (state) => selectDashboardState(state)?.error;
export const selectSelectedDashboard = (state) => selectDashboardState(state)?.selectedDashboard;

// ========== Report Selectors ==========
export const selectReportsState = (state) => state.reviews?.reports;
export const selectEmployeeSummary = (state) => selectReportsState(state)?.employeeSummary;
export const selectTeamSummary = (state) => selectReportsState(state)?.teamSummary;
export const selectCycleStatsReport = (state) => selectReportsState(state)?.cycleStats;
export const selectPIPSummaryReport = (state) => selectReportsState(state)?.pipSummary;
export const selectCalibrationSummaryReport = (state) => selectReportsState(state)?.calibrationSummary;
export const selectRatingDistributionReport = (state) => selectReportsState(state)?.ratingDistribution;
export const selectReportExportData = (state) => selectReportsState(state)?.exportData;
export const selectReportsLoading = (state) => selectReportsState(state)?.loading;
export const selectReportsError = (state) => selectReportsState(state)?.error;
export const selectReportsLastFetched = (state) => selectReportsState(state)?.lastFetched;

// ========== Health Selectors ==========
export const selectHealthState = (state) => state.reviews?.health;
export const selectHealthStatus = (state) => selectHealthState(state)?.status;
export const selectHealthChecks = (state) => selectHealthState(state)?.checks;
export const selectHealthMetrics = (state) => selectHealthState(state)?.metrics;
export const selectHealthLoading = (state) => selectHealthState(state)?.loading;
export const selectHealthError = (state) => selectHealthState(state)?.error;
export const selectHealthLastChecked = (state) => selectHealthState(state)?.lastChecked;

// ========== System Settings Selectors ==========
export const selectSystemSettingsState = (state) => state.reviews?.systemSettings;
export const selectSystemSettings = (state) => selectSystemSettingsState(state)?.settings;
export const selectSystemSettingsLoading = (state) => selectSystemSettingsState(state)?.loading;
export const selectSystemSettingsError = (state) => selectSystemSettingsState(state)?.error;
export const selectSystemSettingsIsUpdating = (state) => selectSystemSettingsState(state)?.isUpdating;
export const selectSystemSettingsLastUpdated = (state) => selectSystemSettingsState(state)?.lastUpdated;

// ========== Reference Data Selectors ==========
export const selectReferenceDataState = (state) => state.reviews?.referenceData;
export const selectReferenceData = (state) => selectReferenceDataState(state)?.data;
export const selectReferenceDataUsers = (state) => selectReferenceDataState(state)?.users;
export const selectReferenceDataDepartments = (state) => selectReferenceDataState(state)?.departments;
export const selectReferenceDataTeams = (state) => selectReferenceDataState(state)?.teams;
export const selectReferenceDataPositions = (state) => selectReferenceDataState(state)?.positions;
export const selectReferenceDataMetrics = (state) => selectReferenceDataState(state)?.metrics;
export const selectReferenceDataLoading = (state) => selectReferenceDataState(state)?.loading;
export const selectReferenceDataError = (state) => selectReferenceDataState(state)?.error;
export const selectReferenceDataLastFetched = (state) => selectReferenceDataState(state)?.lastFetched;

// ========== Audit Log Selectors ==========
export const selectAuditLogsState = (state) => state.reviews?.auditLogs;
export const selectAllAuditLogs = (state) => selectAuditLogsState(state)?.items ?? [];
export const selectAuditLogById = (state, id) =>
  selectAllAuditLogs(state).find((item) => item.id === id);
export const selectSelectedAuditLog = (state) => selectAuditLogsState(state)?.selectedItem;
export const selectAuditLogsLoading = (state) => selectAuditLogsState(state)?.loading;
export const selectAuditLogsError = (state) => selectAuditLogsState(state)?.error;
export const selectAuditLogsPagination = (state) => selectAuditLogsState(state)?.pagination;
export const selectAuditLogsForObject = (state) => selectAuditLogsState(state)?.objectLogs;
export const selectAuditLogsForUser = (state) => selectAuditLogsState(state)?.userLogs;

// ========== Notification Selectors ==========
export const selectNotificationsState = (state) => state.reviews?.notifications;
export const selectAllNotifications = (state) => selectNotificationsState(state)?.items ?? [];
export const selectNotificationById = (state, id) =>
  selectAllNotifications(state).find((item) => item.id === id);
export const selectSelectedNotification = (state) => selectNotificationsState(state)?.selectedItem;
export const selectNotificationsLoading = (state) => selectNotificationsState(state)?.loading;
export const selectNotificationsError = (state) => selectNotificationsState(state)?.error;
export const selectUnreadNotificationCount = (state) => selectNotificationsState(state)?.unreadCount;

export const selectUnreadNotifications = createSelector(
  [selectAllNotifications],
  (notifications) => notifications.filter((item) => !item.is_read)
);

export const selectReadNotifications = createSelector(
  [selectAllNotifications],
  (notifications) => notifications.filter((item) => item.is_read)
);

// ========== Advanced Combined Selectors ==========

export const selectCycleWithProgress = createSelector(
  [selectCycleById, selectCycleProgress],
  (cycle, progress) => cycle ? { ...cycle, progress } : null
);

export const selectEmployeeReviewStatus = createSelector(
  [
    selectAllSelfAssessments,
    selectAllSupervisorReviews,
    selectAllFinalRatings,
    (state, employeeId) => employeeId,
    (state, employeeId, cycleId) => cycleId,
  ],
  (selfAssessments, supervisorReviews, finalRatings, employeeId, cycleId) => {
    const selfAssessment = selfAssessments.find(
      (item) => item.employee === employeeId && item.review_cycle === cycleId
    );
    const supervisorReview = supervisorReviews.find(
      (item) => item.employee === employeeId && item.review_cycle === cycleId
    );
    const finalRating = finalRatings.find(
      (item) => item.employee === employeeId && item.review_cycle === cycleId
    );
    return {
      selfAssessment,
      supervisorReview,
      finalRating,
      hasSelfAssessment: !!selfAssessment,
      hasSupervisorReview: !!supervisorReview,
      hasFinalRating: !!finalRating,
      isComplete: !!(selfAssessment && supervisorReview && finalRating),
    };
  }
);

export const selectPerformanceMetrics = createSelector(
  [
    selectAllFinalRatings,
    selectAllPIPs,
    selectAllPromotions,
    (state, employeeId) => employeeId,
  ],
  (ratings, pips, promotions, employeeId) => {
    const employeeRatings = ratings.filter((item) => item.employee === employeeId);
    const employeePIPs = pips.filter((item) => item.employee === employeeId);
    const employeePromotions = promotions.filter((item) => item.employee === employeeId);
    
    const scores = employeeRatings.filter(r => r.final_score !== null).map(r => r.final_score);
    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;
    
    return {
      ratings: employeeRatings,
      pips: employeePIPs,
      promotions: employeePromotions,
      averageScore,
      totalRatings: employeeRatings.length,
      totalPIPs: employeePIPs.length,
      totalPromotions: employeePromotions.length,
      latestRating: employeeRatings.length > 0 ? employeeRatings[employeeRatings.length - 1] : null,
      latestPIP: employeePIPs.length > 0 ? employeePIPs[employeePIPs.length - 1] : null,
      latestPromotion: employeePromotions.length > 0 ? employeePromotions[employeePromotions.length - 1] : null,
    };
  }
);

export const selectCycleCompletionStatus = createSelector(
  [
    selectCycleById,
    selectAllSelfAssessments,
    selectAllSupervisorReviews,
    selectAllFinalRatings,
    (state, cycleId) => cycleId,
  ],
  (cycle, selfAssessments, supervisorReviews, finalRatings, cycleId) => {
    if (!cycle) return null;
    
    const cycleSelfAssessments = selfAssessments.filter((item) => item.review_cycle === cycleId);
    const cycleSupervisorReviews = supervisorReviews.filter((item) => item.review_cycle === cycleId);
    const cycleFinalRatings = finalRatings.filter((item) => item.review_cycle === cycleId);
    
    const total = cycle.participants_count || cycleSelfAssessments.length || 1;
    const submittedSA = cycleSelfAssessments.filter((item) => item.status === 'submitted').length;
    const approvedSR = cycleSupervisorReviews.filter((item) => item.status === 'approved').length;
    const lockedFR = cycleFinalRatings.filter((item) => item.status === 'locked').length;
    
    return {
      total,
      selfAssessment: {
        submitted: submittedSA,
        pending: total - submittedSA,
        percentage: total > 0 ? (submittedSA / total) * 100 : 0,
      },
      supervisorReview: {
        approved: approvedSR,
        pending: total - approvedSR,
        percentage: total > 0 ? (approvedSR / total) * 100 : 0,
      },
      finalRating: {
        locked: lockedFR,
        pending: total - lockedFR,
        percentage: total > 0 ? (lockedFR / total) * 100 : 0,
      },
      overall: {
        completed: lockedFR,
        pending: total - lockedFR,
        percentage: total > 0 ? (lockedFR / total) * 100 : 0,
      },
    };
  }
);

export const selectCalibrationReadiness = createSelector(
  [
    selectCycleById,
    selectAllFinalRatings,
    selectAllCalibrationSessions,
    (state, cycleId) => cycleId,
  ],
  (cycle, finalRatings, calibrationSessions, cycleId) => {
    if (!cycle) return null;
    
    const cycleRatings = finalRatings.filter((item) => item.review_cycle === cycleId);
    const cycleSessions = calibrationSessions.filter((item) => item.review_cycle === cycleId);
    
    const lockedRatings = cycleRatings.filter((item) => item.status === 'locked');
    const calibratedRatings = cycleRatings.filter((item) => item.status === 'calibrated');
    const pendingCalibration = cycleRatings.filter((item) => item.status === 'pending');
    
    return {
      totalRatings: cycleRatings.length,
      locked: lockedRatings.length,
      calibrated: calibratedRatings.length,
      pendingCalibration: pendingCalibration.length,
      sessions: cycleSessions.length,
      completedSessions: cycleSessions.filter((s) => s.status === 'completed').length,
      readiness: {
        isReady: lockedRatings.length > 0,
        percentage: cycleRatings.length > 0 
          ? (lockedRatings.length / cycleRatings.length) * 100 
          : 0,
        needsCalibration: pendingCalibration.length > 0,
      },
    };
  }
);

// ========== Selector Factories for Memoization ==========
export const createCompetencySelector = (competencyId) => 
  createSelector(
    [selectAllCompetencies],
    (competencies) => competencies.find((item) => item.id === competencyId)
  );

export const createCycleSelector = (cycleId) =>
  createSelector(
    [selectAllCycles],
    (cycles) => cycles.find((item) => item.id === cycleId)
  );

export const createPIPSelector = (pipId) =>
  createSelector(
    [selectAllPIPs],
    (pips) => pips.find((item) => item.id === pipId)
  );

export const createRatingDistributionSelector = (cycleId) =>
  createSelector(
    [selectRatingDistribution],
    (distribution) => distribution?.filter((item) => item.cycle_id === cycleId) || []
  );

export const createFinalRatingSelector = (ratingId) =>
  createSelector(
    [selectAllFinalRatings],
    (ratings) => ratings.find((item) => item.id === ratingId)
  );

export const createFeedbackSummarySelector = (subjectId, cycleId) =>
  createSelector(
    [selectAllFeedbackSummaries],
    (summaries) => summaries.find(
      (item) => item.subject === subjectId && item.review_cycle === cycleId
    )
  );

export const createEmployeeReviewStatusSelector = (employeeId, cycleId) =>
  createSelector(
    [selectAllSelfAssessments, selectAllSupervisorReviews, selectAllFinalRatings],
    (selfAssessments, supervisorReviews, finalRatings) => {
      const selfAssessment = selfAssessments.find(
        (item) => item.employee === employeeId && item.review_cycle === cycleId
      );
      const supervisorReview = supervisorReviews.find(
        (item) => item.employee === employeeId && item.review_cycle === cycleId
      );
      const finalRating = finalRatings.find(
        (item) => item.employee === employeeId && item.review_cycle === cycleId
      );
      return { selfAssessment, supervisorReview, finalRating };
    }
  );