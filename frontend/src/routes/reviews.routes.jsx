// src/routes/reviews.routes.jsx
import React from "react";

// Lazy load pages for code splitting
const ReviewsDashboard = React.lazy(() => import('../pages/reviews/DashboardPage'));
const RatingScalesList = React.lazy(() => import('../pages/reviews/RatingScalesPage'));
const RatingScaleDetail = React.lazy(() => import('../pages/reviews/RatingScaleDetailPage'));
const RatingScaleForm = React.lazy(() => import('../pages/reviews/RatingScalesPage'));
const CompetenciesList = React.lazy(() => import('../pages/reviews/CompetenciesPage'));
const CompetencyForm = React.lazy(() => import('../pages/reviews/CompetenciesPage'));

const CyclesList = React.lazy(() => import('../pages/reviews/CyclesPage'));
const CycleDetail = React.lazy(() => import('../pages/reviews/CycleDetailPage'));
const CycleForm = React.lazy(() => import('../pages/reviews/CyclesPage'));

const SelfAssessment = React.lazy(() => import('../pages/reviews/SelfAssessmentPage'));
const SupervisorReview = React.lazy(() => import('../pages/reviews/SupervisorReviewPage'));
const ReviewQueue = React.lazy(() => import('../pages/reviews/ReviewQueuePage'));

const FinalRatingsList = React.lazy(() => import('../pages/reviews/FinalRatingsPage'));
const FinalRatingDetail = React.lazy(() => import('../pages/reviews/FinalRatingDetailPage'));

const PIPsList = React.lazy(() => import('../pages/reviews/PIPsPage'));
const PIPDetail = React.lazy(() => import('../pages/reviews/PIPDetailPage'));
const PIPForm = React.lazy(() => import('../pages/reviews/CreatePIPPage'));

const Feedback = React.lazy(() => import('../pages/reviews/FeedbackPage'));
const FeedbackResponse = React.lazy(() => import('../pages/reviews/FeedbackResponsePage'));

const CalibrationSessions = React.lazy(() => import('../pages/reviews/CalibrationPage'));
const CalibrationSessionDetail = React.lazy(() => import('../pages/reviews/CalibrationSessionDetailPage'));
const CalibrationSessionForm = React.lazy(() => import('../pages/reviews/CalibrationSessionPage'));

const Reports = React.lazy(() => import('../pages/reviews/ReportsPage'));
const Settings = React.lazy(() => import('../pages/reviews/SettingsPage'));

// ============================================
// EXPORT REVIEWS_ROUTES CONSTANTS
// ============================================
export const REVIEWS_ROUTES = {
    // Dashboard
    DASHBOARD: '/reviews/dashboard',
    
    // Rating Scales
    RATING_SCALES: '/reviews/rating-scales',
    RATING_SCALES_CREATE: '/reviews/rating-scales/create',
    RATING_SCALES_DETAIL: (id = ':id') => `/reviews/rating-scales/${id}`,
    RATING_SCALES_EDIT: (id = ':id') => `/reviews/rating-scales/${id}/edit`,
    
    // Competencies
    COMPETENCIES: '/reviews/competencies',
    COMPETENCIES_CREATE: '/reviews/competencies/create',
    COMPETENCIES_EDIT: (id = ':id') => `/reviews/competencies/${id}/edit`,
    COMPETENCY_CATEGORIES: '/reviews/competency-categories',
    
    // Review Cycles
    CYCLES: '/reviews/cycles',
    CYCLES_CREATE: '/reviews/cycles/create',
    CYCLES_DETAIL: (id = ':id') => `/reviews/cycles/${id}`,
    CYCLES_EDIT: (id = ':id') => `/reviews/cycles/${id}/edit`,
    CYCLES_PROGRESS: (id = ':id') => `/reviews/cycles/${id}/progress`,
    
    // Self Assessment
    SELF_ASSESSMENT: '/reviews/self-assessment',
    SELF_ASSESSMENT_FORM: '/reviews/self-assessment/form',
    SELF_ASSESSMENT_VIEW: (id = ':id') => `/reviews/self-assessment/${id}`,
    SELF_ASSESSMENT_TEAM: '/reviews/self-assessment/team',
    
    // Supervisor Review
    SUPERVISOR_REVIEW: '/reviews/supervisor-review',
    SUPERVISOR_REVIEW_VIEW: (id = ':id') => `/reviews/supervisor-review/${id}`,
    SUPERVISOR_REVIEW_FORM: (employeeId = ':employeeId') => `/reviews/supervisor-review/${employeeId}/form`,
    REVIEW_QUEUE: '/reviews/review-queue',
    
    // Final Ratings
    FINAL_RATINGS: '/reviews/final-ratings',
    FINAL_RATINGS_DETAIL: (id = ':id') => `/reviews/final-ratings/${id}`,
    FINAL_RATINGS_TEAM: '/reviews/final-ratings/team',
    RATING_DISTRIBUTION: '/reviews/rating-distribution',
    
    // PIPs
    PIPS: '/reviews/pips',
    PIPS_CREATE: '/reviews/pips/create',
    PIPS_DETAIL: (id = ':id') => `/reviews/pips/${id}`,
    PIPS_EDIT: (id = ':id') => `/reviews/pips/${id}/edit`,
    PIPS_MY: '/reviews/pips/my',
    PIPS_TEAM: '/reviews/pips/team',
    
    // Feedback
    FEEDBACK: '/reviews/feedback',
    FEEDBACK_REQUESTS: '/reviews/feedback/requests',
    FEEDBACK_RESPOND: (id = ':id') => `/reviews/feedback/respond/${id}`,
    FEEDBACK_SUMMARY: '/reviews/feedback/summary',
    
    // Calibration
    CALIBRATION: '/reviews/calibration',
    CALIBRATION_SESSIONS: '/reviews/calibration/sessions',
    CALIBRATION_SESSION_CREATE: '/reviews/calibration/sessions/create',
    CALIBRATION_SESSION_DETAIL: (id = ':id') => `/reviews/calibration/sessions/${id}`,
    CALIBRATION_OUTLIERS: '/reviews/calibration/outliers',
    
    // Reports
    REPORTS: '/reviews/reports',
    EMPLOYEE_REPORT: '/reviews/reports/employee',
    TEAM_REPORT: '/reviews/reports/team',
    CYCLE_REPORT: '/reviews/reports/cycle',
    PIP_REPORT: '/reviews/reports/pip',
    CALIBRATION_REPORT: '/reviews/reports/calibration',
    
    // Settings
    SETTINGS: '/reviews/settings',
};

// Simple flat routes array
const reviewsRoutes = [
    // Dashboard
    { path: REVIEWS_ROUTES.DASHBOARD, element: <ReviewsDashboard /> },
    
    // Rating Scales
    { path: REVIEWS_ROUTES.RATING_SCALES, element: <RatingScalesList /> },
    { path: REVIEWS_ROUTES.RATING_SCALES_CREATE, element: <RatingScaleForm /> },
    { path: REVIEWS_ROUTES.RATING_SCALES_DETAIL(), element: <RatingScaleDetail /> },
    { path: REVIEWS_ROUTES.RATING_SCALES_EDIT(), element: <RatingScaleForm /> },
    
    // Competencies
    { path: REVIEWS_ROUTES.COMPETENCIES, element: <CompetenciesList /> },
    { path: REVIEWS_ROUTES.COMPETENCIES_CREATE, element: <CompetencyForm /> },
    { path: REVIEWS_ROUTES.COMPETENCIES_EDIT(), element: <CompetencyForm /> },
    { path: REVIEWS_ROUTES.COMPETENCY_CATEGORIES, element: <CompetenciesList /> },
    
    // Review Cycles
    { path: REVIEWS_ROUTES.CYCLES, element: <CyclesList /> },
    { path: REVIEWS_ROUTES.CYCLES_CREATE, element: <CycleForm /> },
    { path: REVIEWS_ROUTES.CYCLES_DETAIL(), element: <CycleDetail /> },
    { path: REVIEWS_ROUTES.CYCLES_EDIT(), element: <CycleForm /> },
    { path: REVIEWS_ROUTES.CYCLES_PROGRESS(), element: <CycleDetail /> },
    
    // Self Assessment
    { path: REVIEWS_ROUTES.SELF_ASSESSMENT, element: <SelfAssessment /> },
    { path: REVIEWS_ROUTES.SELF_ASSESSMENT_FORM, element: <SelfAssessment /> },
    { path: REVIEWS_ROUTES.SELF_ASSESSMENT_VIEW(), element: <SelfAssessment /> },
    { path: REVIEWS_ROUTES.SELF_ASSESSMENT_TEAM, element: <SelfAssessment /> },
    
    // Supervisor Review
    { path: REVIEWS_ROUTES.SUPERVISOR_REVIEW, element: <SupervisorReview /> },
    { path: REVIEWS_ROUTES.SUPERVISOR_REVIEW_VIEW(), element: <SupervisorReview /> },
    { path: REVIEWS_ROUTES.SUPERVISOR_REVIEW_FORM(), element: <SupervisorReview /> },
    { path: REVIEWS_ROUTES.REVIEW_QUEUE, element: <ReviewQueue /> },
    
    // Final Ratings
    { path: REVIEWS_ROUTES.FINAL_RATINGS, element: <FinalRatingsList /> },
    { path: REVIEWS_ROUTES.FINAL_RATINGS_DETAIL(), element: <FinalRatingDetail /> },
    { path: REVIEWS_ROUTES.FINAL_RATINGS_TEAM, element: <FinalRatingsList /> },
    { path: REVIEWS_ROUTES.RATING_DISTRIBUTION, element: <FinalRatingsList /> },
    
    // PIPs
    { path: REVIEWS_ROUTES.PIPS, element: <PIPsList /> },
    { path: REVIEWS_ROUTES.PIPS_CREATE, element: <PIPForm /> },
    { path: REVIEWS_ROUTES.PIPS_DETAIL(), element: <PIPDetail /> },
    { path: REVIEWS_ROUTES.PIPS_EDIT(), element: <PIPForm /> },
    { path: REVIEWS_ROUTES.PIPS_MY, element: <PIPsList /> },
    { path: REVIEWS_ROUTES.PIPS_TEAM, element: <PIPsList /> },
    
    // Feedback
    { path: REVIEWS_ROUTES.FEEDBACK, element: <Feedback /> },
    { path: REVIEWS_ROUTES.FEEDBACK_REQUESTS, element: <Feedback /> },
    { path: REVIEWS_ROUTES.FEEDBACK_RESPOND(), element: <FeedbackResponse /> },
    { path: REVIEWS_ROUTES.FEEDBACK_SUMMARY, element: <Feedback /> },
    
    // Calibration
    { path: REVIEWS_ROUTES.CALIBRATION, element: <CalibrationSessions /> },
    { path: REVIEWS_ROUTES.CALIBRATION_SESSIONS, element: <CalibrationSessions /> },
    { path: REVIEWS_ROUTES.CALIBRATION_SESSION_CREATE, element: <CalibrationSessionForm /> },
    { path: REVIEWS_ROUTES.CALIBRATION_SESSION_DETAIL(), element: <CalibrationSessionDetail /> },
    { path: REVIEWS_ROUTES.CALIBRATION_OUTLIERS, element: <CalibrationSessions /> },
    
    // Reports
    { path: REVIEWS_ROUTES.REPORTS, element: <Reports /> },
    { path: REVIEWS_ROUTES.EMPLOYEE_REPORT, element: <Reports /> },
    { path: REVIEWS_ROUTES.TEAM_REPORT, element: <Reports /> },
    { path: REVIEWS_ROUTES.CYCLE_REPORT, element: <Reports /> },
    { path: REVIEWS_ROUTES.PIP_REPORT, element: <Reports /> },
    { path: REVIEWS_ROUTES.CALIBRATION_REPORT, element: <Reports /> },
    
    // Settings
    { path: REVIEWS_ROUTES.SETTINGS, element: <Settings /> },
];

// Helper function to build dynamic paths (for use in components)
export const buildReviewsPath = (path, params = {}) => {
    let result = path;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
    });
    return result;
};

export default reviewsRoutes;