// src/hooks/reviews/index.js

// Permission Hook
export { default as useReviewsPermissions } from './useReviewsPermissions';

// Core Feature Hooks
export { default as useRatingScales } from './useRatingScales';
export { default as useCompetencies } from './useCompetencies';
export { default as useCompetencyCategories } from './useCompetencyCategories';
export { default as useCycles } from './useCycles';
export { default as useSelfAssessment } from './useSelfAssessment';
export { default as useSupervisorReview } from './useSupervisorReview';
export { default as useFinalRating } from './useFinalRating';
export { default as usePIP } from './usePIP';
export { default as usePIPActions } from './usePIPActions';
export { default as useFeedback } from './useFeedback';
export { default as useCalibration } from './useCalibration';
export { default as useCoefficients } from './useCoefficients';
export { default as useComments } from './useComments';
export { default as usePromotions } from './usePromotions';
export { default as useTemplates } from './useTemplates';

// Dashboard & Reports
export { default as useReviewsDashboard } from './useReviewsDashboard';
export { default as useReviewsReports } from './useReviewsReports';

// System & Utilities
export { default as useReviewsSystemSettings } from './useReviewsSystemSettings';
export { default as useReviewsReferenceData } from './useReviewsReferenceData';
export { default as useReviewsAuditLogs } from './useReviewsAuditLogs';
export { default as useReviewsNotifications } from './useReviewsNotifications';
export { default as useReviewsWebSocket } from './useReviewsWebSocket';
export { default as useReviewsCache } from './useReviewsCache';

// Combined/Composite Hooks
export { default as useEmployeeReviewStatus } from './useEmployeeReviewStatus';
export { default as usePerformanceMetrics } from './usePerformanceMetrics';
export { default as useCycleCompletion } from './useCycleCompletion';