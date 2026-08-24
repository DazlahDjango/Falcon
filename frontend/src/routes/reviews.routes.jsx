// src/routes/reviews.routes.jsx
import React from "react";
import { REVIEW_ROUTES } from "../config/constants/reviewRouteConstants";

// LAZY LOAD REVIEWS PAGES
// ============================================

// Dashboard Pages
const ReviewsDashboardRedirect = React.lazy(() => import('../pages/reviews/dashboard/ReviewsDashboardRedirect'));
const StaffDashboardPage = React.lazy(() => import('../pages/reviews/dashboard/StaffDashboardPage'));
const SupervisorDashboardPage = React.lazy(() => import('../pages/reviews/dashboard/SupervisorDashboardPage'));
const ExecutiveDashboardPage = React.lazy(() => import('../pages/reviews/dashboard/ExecutiveDashboardPage'));
const AdminDashboardPage = React.lazy(() => import('../pages/reviews/dashboard/AdminDashboardPage'));

// Rating Scale Pages
const RatingScalesPage = React.lazy(() => import('../pages/reviews/rating-scales/RatingScalesPage'));
const RatingScaleDetailPage = React.lazy(() => import('../pages/reviews/rating-scales/RatingScaleDetailPage'));
const RatingScaleCreatePage = React.lazy(() => import('../pages/reviews/rating-scales/RatingScaleCreatePage'));
const RatingScaleEditPage = React.lazy(() => import('../pages/reviews/rating-scales/RatingScaleEditPage'));

// Competency Pages
const CompetenciesPage = React.lazy(() => import('../pages/reviews/competencies/CompetenciesPage'));
const CompetencyDetailPage = React.lazy(() => import('../pages/reviews/competencies/CompetencyDetailPage'));
const CompetencyCreatePage = React.lazy(() => import('../pages/reviews/competencies/CompetencyCreatePage'));
const CompetencyEditPage = React.lazy(() => import('../pages/reviews/competencies/CompetencyEditPage'));

// Competency Category Pages
const CategoriesPage = React.lazy(() => import('../pages/reviews/competency-categories/CategoriesPage'));
const CategoryCreatePage = React.lazy(() => import('../pages/reviews/competency-categories/CategoryCreatePage'));
const CategoryEditPage = React.lazy(() => import('../pages/reviews/competency-categories/CategoryEditPage'));
const CategoryDetailPage = React.lazy(() => import('../pages/reviews/competency-categories/CategoryDetailPage'));

// Review Cycle Pages
const CyclesPage = React.lazy(() => import('../pages/reviews/cycles/CyclesPage'));
const CycleDetailPage = React.lazy(() => import('../pages/reviews/cycles/CycleDetailPage'));
const CycleCreatePage = React.lazy(() => import('../pages/reviews/cycles/CycleCreatePage'));
const CycleEditPage = React.lazy(() => import('../pages/reviews/cycles/CycleEditPage'));

// Self Assessment Pages
const SelfAssessmentPage = React.lazy(() => import('../pages/reviews/self-assessments/SelfAssessmentPage'));
const SelfAssessmentViewPage = React.lazy(() => import('../pages/reviews/self-assessments/SelfAssessmentViewPage'));
const SelfAssessmentListPage = React.lazy(() => import('../pages/reviews/self-assessments/SelfAssessmentListPage'));

// Supervisor Review Pages
const ReviewQueuePage = React.lazy(() => import('../pages/reviews/supervisor-reviews/ReviewQueuePage'));
const SupervisorReviewFormPage = React.lazy(() => import('../pages/reviews/supervisor-reviews/SupervisorReviewFormPage'));
const SupervisorReviewDetailPage = React.lazy(() => import('../pages/reviews/supervisor-reviews/SupervisorReviewDetailPage'));
const PendingApprovalsPage = React.lazy(() => import('../pages/reviews/supervisor-reviews/PendingApprovalsPage'));
const SupervisorReviewListPage = React.lazy(() => import('../pages/reviews/supervisor-reviews/SupervisorReviewListPage'));

// Final Rating Pages
const FinalRatingsPage = React.lazy(() => import('../pages/reviews/final-ratings/FinalRatingsPage'));
const FinalRatingDetailPage = React.lazy(() => import('../pages/reviews/final-ratings/FinalRatingDetailPage'));
const RatingDistributionPage = React.lazy(() => import('../pages/reviews/final-ratings/RatingDistributionPage'));
const FinalRatingStatsPage = React.lazy(() => import('../pages/reviews/final-ratings/FinalRatingStatsPage'));

// PIP Pages
const PIPsPage = React.lazy(() => import('../pages/reviews/pips/PIPsPage'));
const PIPDetailPage = React.lazy(() => import('../pages/reviews/pips/PIPDetailPage'));
const PIPCreatePage = React.lazy(() => import('../pages/reviews/pips/PIPCreatePage'));
const PIPEditPage = React.lazy(() => import('../pages/reviews/pips/PIPEditPage'));

// PIP Action Pages
const PIPActionsPage = React.lazy(() => import('../pages/reviews/pip-actions/PIPActionsPage'));
const PIPActionDetailPage = React.lazy(() => import('../pages/reviews/pip-actions/PIPActionDetailPage'));

// Feedback Pages
const FeedbackRequestsPage = React.lazy(() => import('../pages/reviews/feedback/FeedbackRequestsPage'));
const FeedbackRequestDetailPage = React.lazy(() => import('../pages/reviews/feedback/FeedbackRequestDetailPage'));
const FeedbackRequestCreatePage = React.lazy(() => import('../pages/reviews/feedback/FeedbackRequestCreatePage'));
const FeedbackResponsePage = React.lazy(() => import('../pages/reviews/feedback/FeedbackResponsePage'));
const FeedbackSummaryPage = React.lazy(() => import('../pages/reviews/feedback/FeedbackSummaryPage'));

// Calibration Pages
const CalibrationSessionsPage = React.lazy(() => import('../pages/reviews/calibration/CalibrationSessionsPage'));
const CalibrationSessionDetailPage = React.lazy(() => import('../pages/reviews/calibration/CalibrationSessionDetailPage'));
const CalibrationSessionCreatePage = React.lazy(() => import('../pages/reviews/calibration/CalibrationSessionCreatePage'));
const CalibrationSessionEditPage = React.lazy(() => import('../pages/reviews/calibration/CalibrationSessionEditPage'));
const CalibrationOutliersPage = React.lazy(() => import('../pages/reviews/calibration/CalibrationOutliersPage'));

// Coefficient Pages
const CoefficientsPage = React.lazy(() => import('../pages/reviews/coefficients/CoefficientsPage'));
const CoefficientCreatePage = React.lazy(() => import('../pages/reviews/coefficients/CoefficientCreatePage'));
const CoefficientEditPage = React.lazy(() => import('../pages/reviews/coefficients/CoefficientEditPage'));
const CoefficientApplyPage = React.lazy(() => import('../pages/reviews/coefficients/CoefficientApplyPage'));

// Promotion Pages
const PromotionsPage = React.lazy(() => import('../pages/reviews/promotions/PromotionsPage'));
const PromotionDetailPage = React.lazy(() => import('../pages/reviews/promotions/PromotionDetailPage'));
const PromotionCreatePage = React.lazy(() => import('../pages/reviews/promotions/PromotionCreatePage'));
const PromotionStatsPage = React.lazy(() => import('../pages/reviews/promotions/PromotionStatsPage'));

// Template Pages
const TemplatesPage = React.lazy(() => import('../pages/reviews/templates/TemplatesPage'));
const TemplateDetailPage = React.lazy(() => import('../pages/reviews/templates/TemplateDetailPage'));
const TemplateCreatePage = React.lazy(() => import('../pages/reviews/templates/TemplateCreatePage'));
const TemplateEditPage = React.lazy(() => import('../pages/reviews/templates/TemplateEditPage'));

// Report Pages
const ReportsPage = React.lazy(() => import('../pages/reviews/reports/ReportsPage'));
const EmployeeReportPage = React.lazy(() => import('../pages/reviews/reports/EmployeeReportPage'));
const TeamReportPage = React.lazy(() => import('../pages/reviews/reports/TeamReportPage'));
const CycleReportPage = React.lazy(() => import('../pages/reviews/reports/CycleReportPage'));
const PIPReportPage = React.lazy(() => import('../pages/reviews/reports/PIPReportPage'));
const CalibrationReportPage = React.lazy(() => import('../pages/reviews/reports/CalibrationReportPage'));
const ReportExportPage = React.lazy(() => import('../pages/reviews/reports/ReportExportPage'));

// Settings Pages
const SystemSettingsPage = React.lazy(() => import('../pages/reviews/settings/SystemSettingsPage'));
const NotificationPreferencesPage = React.lazy(() => import('../pages/reviews/settings/NotificationPreferencesPage'));
const AuditSettingsPage = React.lazy(() => import('../pages/reviews/settings/AuditSettingsPage'));

// Audit Pages
const AuditLogsPage = React.lazy(() => import('../pages/reviews/audit/AuditLogsPage'));

// Notification Pages
const NotificationsPage = React.lazy(() => import('../pages/reviews/notifications/NotificationsPage'));

// REVIEWS ROUTES CONFIGURATION
// ============================================

const reviewsRoutes = [
    // ============ Dashboard Routes ============
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD, element: <ReviewsDashboardRedirect /> },
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_STAFF, element: <StaffDashboardPage /> },
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_SUPERVISOR, element: <SupervisorDashboardPage /> },
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_EXECUTIVE, element: <ExecutiveDashboardPage /> },
    { path: REVIEW_ROUTES.REVIEW_DASHBOARD_ADMIN, element: <AdminDashboardPage /> },

    // ============ Rating Scale Routes ============
    { path: REVIEW_ROUTES.RATING_SCALES_LIST, element: <RatingScalesPage /> },
    { path: REVIEW_ROUTES.RATING_SCALES_CREATE, element: <RatingScaleCreatePage /> },
    { path: REVIEW_ROUTES.RATING_SCALES_DETAIL(':id'), element: <RatingScaleDetailPage /> },
    { path: REVIEW_ROUTES.RATING_SCALES_EDIT(':id'), element: <RatingScaleEditPage /> },

    // ============ Competency Routes ============
    { path: REVIEW_ROUTES.COMPETENCIES_LIST, element: <CompetenciesPage /> },
    { path: REVIEW_ROUTES.COMPETENCIES_CREATE, element: <CompetencyCreatePage /> },
    { path: REVIEW_ROUTES.COMPETENCIES_DETAIL(':id'), element: <CompetencyDetailPage /> },
    { path: REVIEW_ROUTES.COMPETENCIES_EDIT(':id'), element: <CompetencyEditPage /> },

    // ============ Competency Category Routes ============
    { path: REVIEW_ROUTES.COMPETENCY_CATEGORIES, element: <CategoriesPage /> },
    { path: REVIEW_ROUTES.COMPETENCY_CATEGORIES_CREATE, element: <CategoryCreatePage /> },
    { path: REVIEW_ROUTES.COMPETENCY_CATEGORIES_EDIT(':id'), element: <CategoryEditPage /> },
    { path: REVIEW_ROUTES.COMPETENCY_CATEGORIES_DETAIL(':id'), element: <CategoryDetailPage /> },

    // ============ Review Cycle Routes ============
    { path: REVIEW_ROUTES.REVIEW_CYCLES_LIST, element: <CyclesPage /> },
    { path: REVIEW_ROUTES.REVIEW_CYCLES_CREATE, element: <CycleCreatePage /> },
    { path: REVIEW_ROUTES.REVIEW_CYCLES_DETAIL(':id'), element: <CycleDetailPage /> },
    { path: REVIEW_ROUTES.REVIEW_CYCLES_EDIT(':id'), element: <CycleEditPage /> },

    // ============ Self Assessment Routes ============
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_FORM, element: <SelfAssessmentPage /> },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_VIEW(':id'), element: <SelfAssessmentViewPage /> },
    { path: REVIEW_ROUTES.SELF_ASSESSMENT_LIST, element: <SelfAssessmentListPage /> },

    // ============ Supervisor Review Routes ============
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_QUEUE, element: <ReviewQueuePage /> },
    { path: '/reviews/supervisor-reviews/queue', element: <ReviewQueuePage /> },
    { path: '/reviews/review-queue', element: <ReviewQueuePage /> },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_FORM(':employeeId'), element: <SupervisorReviewFormPage /> },
    { path: '/reviews/supervisor-reviews/:employeeId/form', element: <SupervisorReviewFormPage /> },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_VIEW(':id'), element: <SupervisorReviewDetailPage /> },
    { path: '/reviews/supervisor-reviews/:id', element: <SupervisorReviewDetailPage /> },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_PENDING_APPROVALS, element: <PendingApprovalsPage /> },
    { path: '/reviews/supervisor-reviews/pending-approvals', element: <PendingApprovalsPage /> },
    { path: REVIEW_ROUTES.SUPERVISOR_REVIEW_LIST, element: <SupervisorReviewListPage /> },
    { path: '/reviews/supervisor-reviews', element: <SupervisorReviewListPage /> },

    // ============ Final Rating Routes ============
    { path: REVIEW_ROUTES.FINAL_RATINGS_LIST, element: <FinalRatingsPage /> },
    { path: REVIEW_ROUTES.FINAL_RATINGS_DETAIL(':id'), element: <FinalRatingDetailPage /> },
    { path: REVIEW_ROUTES.RATING_DISTRIBUTION, element: <RatingDistributionPage /> },
    { path: REVIEW_ROUTES.FINAL_RATINGS_STATS, element: <FinalRatingStatsPage /> },

    // ============ PIP Routes ============
    { path: REVIEW_ROUTES.PIPS_LIST, element: <PIPsPage /> },
    { path: REVIEW_ROUTES.PIPS_CREATE, element: <PIPCreatePage /> },
    { path: REVIEW_ROUTES.PIPS_DETAIL(':id'), element: <PIPDetailPage /> },
    { path: REVIEW_ROUTES.PIPS_EDIT(':id'), element: <PIPEditPage /> },
    { path: REVIEW_ROUTES.PIPS_REPORT, element: <PIPReportPage /> },

    // ============ PIP Action Routes ============
    { path: REVIEW_ROUTES.PIP_ACTIONS(':pipId'), element: <PIPActionsPage /> },
    { path: REVIEW_ROUTES.PIP_ACTION_DETAIL(':pipId', ':actionId'), element: <PIPActionDetailPage /> },

    // ============ Feedback Routes ============
    { path: REVIEW_ROUTES.FEEDBACK, element: <FeedbackRequestsPage /> },
    { path: REVIEW_ROUTES.FEEDBACK_REQUESTS, element: <FeedbackRequestsPage /> },
    { path: REVIEW_ROUTES.FEEDBACK_REQUEST_DETAIL(':id'), element: <FeedbackRequestDetailPage /> },
    { path: '/reviews/feedback/requests/:id', element: <FeedbackRequestDetailPage /> },
    { path: '/reviews/feedback/:id', element: <FeedbackRequestDetailPage /> },
    { path: REVIEW_ROUTES.FEEDBACK_REQUEST_CREATE, element: <FeedbackRequestCreatePage /> },
    { path: REVIEW_ROUTES.FEEDBACK_RESPOND(':requestId'), element: <FeedbackResponsePage /> },
    { path: REVIEW_ROUTES.FEEDBACK_SUMMARY, element: <FeedbackSummaryPage /> },

    // ============ Calibration Routes ============
    { path: REVIEW_ROUTES.CALIBRATION, element: <CalibrationSessionsPage /> },
    { path: REVIEW_ROUTES.CALIBRATION_SESSIONS, element: <CalibrationSessionsPage /> },
    { path: REVIEW_ROUTES.CALIBRATION_SESSION_DETAIL(':id'), element: <CalibrationSessionDetailPage /> },
    { path: '/reviews/calibration/sessions/:id', element: <CalibrationSessionDetailPage /> },
    { path: '/reviews/calibration/:id', element: <CalibrationSessionDetailPage /> },
    { path: REVIEW_ROUTES.CALIBRATION_SESSION_CREATE, element: <CalibrationSessionCreatePage /> },
    { path: REVIEW_ROUTES.CALIBRATION_SESSION_EDIT(':id'), element: <CalibrationSessionEditPage /> },
    { path: REVIEW_ROUTES.CALIBRATION_REPORT, element: <CalibrationReportPage /> },
    { path: REVIEW_ROUTES.CALIBRATION_OUTLIERS, element: <CalibrationOutliersPage /> },

    // ============ Coefficient Routes ============
    { path: REVIEW_ROUTES.COEFFICIENTS_LIST, element: <CoefficientsPage /> },
    { path: REVIEW_ROUTES.COEFFICIENTS_CREATE, element: <CoefficientCreatePage /> },
    { path: REVIEW_ROUTES.COEFFICIENTS_EDIT(':id'), element: <CoefficientEditPage /> },
    { path: REVIEW_ROUTES.COEFFICIENT_APPLY, element: <CoefficientApplyPage /> },

    // ============ Promotion Routes ============
    { path: REVIEW_ROUTES.PROMOTIONS_LIST, element: <PromotionsPage /> },
    { path: REVIEW_ROUTES.PROMOTIONS_DETAIL(':id'), element: <PromotionDetailPage /> },
    { path: REVIEW_ROUTES.PROMOTIONS_CREATE, element: <PromotionCreatePage /> },
    { path: REVIEW_ROUTES.PROMOTIONS_STATS, element: <PromotionStatsPage /> },

    // ============ Template Routes ============
    { path: REVIEW_ROUTES.REVIEW_TEMPLATES_LIST, element: <TemplatesPage /> },
    { path: REVIEW_ROUTES.REVIEW_TEMPLATES_DETAIL(':id'), element: <TemplateDetailPage /> },
    { path: REVIEW_ROUTES.REVIEW_TEMPLATES_CREATE, element: <TemplateCreatePage /> },
    { path: REVIEW_ROUTES.REVIEW_TEMPLATES_EDIT(':id'), element: <TemplateEditPage /> },

    // ============ Report Routes ============
    { path: REVIEW_ROUTES.REPORTS, element: <ReportsPage /> },
    { path: REVIEW_ROUTES.REPORTS_EMPLOYEE, element: <EmployeeReportPage /> },
    { path: REVIEW_ROUTES.REPORTS_TEAM, element: <TeamReportPage /> },
    { path: REVIEW_ROUTES.REPORTS_CYCLE, element: <CycleReportPage /> },
    { path: REVIEW_ROUTES.REPORTS_PIP, element: <PIPReportPage /> },
    { path: REVIEW_ROUTES.REPORTS_CALIBRATION, element: <CalibrationReportPage /> },
    { path: REVIEW_ROUTES.REPORTS_EXPORT, element: <ReportExportPage /> },

    // ============ Settings Routes ============
    { path: REVIEW_ROUTES.SYSTEM_SETTINGS, element: <SystemSettingsPage /> },
    { path: REVIEW_ROUTES.NOTIFICATION_PREFERENCES, element: <NotificationPreferencesPage /> },
    { path: REVIEW_ROUTES.AUDIT_SETTINGS, element: <AuditSettingsPage /> },

    // ============ Audit Routes ============
    { path: REVIEW_ROUTES.AUDIT_LOGS, element: <AuditLogsPage /> },

    // ============ Notification Routes ============
    { path: REVIEW_ROUTES.NOTIFICATIONS, element: <NotificationsPage /> },
];

// HELPER FUNCTION TO BUILD PATHS WITH PARAMS
export const buildReviewPath = (path, params = {}) => {
    if (typeof path === 'function') {
        const firstVal = Object.values(params)[0];
        return firstVal !== undefined ? path(firstVal) : path(':id');
    }
    let result = String(path || '');
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, String(value ?? ''));
    });
    return result;
};

// EXPORT ROUTES
export default reviewsRoutes;

// NAMED EXPORTS FOR COMMON PATHS
export const ReviewPaths = {
    // Dashboards
    StaffDashboard: REVIEW_ROUTES.REVIEW_DASHBOARD_STAFF,
    SupervisorDashboard: REVIEW_ROUTES.REVIEW_DASHBOARD_SUPERVISOR,
    ExecutiveDashboard: REVIEW_ROUTES.REVIEW_DASHBOARD_EXECUTIVE,
    AdminDashboard: REVIEW_ROUTES.REVIEW_DASHBOARD_ADMIN,

    // Rating Scales
    RatingScales: REVIEW_ROUTES.RATING_SCALES_LIST,
    RatingScaleDetail: (id) => buildReviewPath(REVIEW_ROUTES.RATING_SCALES_DETAIL(':id'), { id }),
    RatingScaleCreate: REVIEW_ROUTES.RATING_SCALES_CREATE,
    RatingScaleEdit: (id) => buildReviewPath(REVIEW_ROUTES.RATING_SCALES_EDIT(':id'), { id }),

    // Competencies
    Competencies: REVIEW_ROUTES.COMPETENCIES_LIST,
    CompetencyDetail: (id) => buildReviewPath(REVIEW_ROUTES.COMPETENCIES_DETAIL(':id'), { id }),
    CompetencyCreate: REVIEW_ROUTES.COMPETENCIES_CREATE,
    CompetencyEdit: (id) => buildReviewPath(REVIEW_ROUTES.COMPETENCIES_EDIT(':id'), { id }),

    // Competency Categories
    CompetencyCategories: REVIEW_ROUTES.COMPETENCY_CATEGORIES,
    CategoryCreate: REVIEW_ROUTES.COMPETENCY_CATEGORIES_CREATE,
    CategoryEdit: (id) => buildReviewPath(REVIEW_ROUTES.COMPETENCY_CATEGORIES_EDIT(':id'), { id }),

    // Review Cycles
    Cycles: REVIEW_ROUTES.REVIEW_CYCLES_LIST,
    CycleDetail: (id) => buildReviewPath(REVIEW_ROUTES.REVIEW_CYCLES_DETAIL(':id'), { id }),
    CycleCreate: REVIEW_ROUTES.REVIEW_CYCLES_CREATE,
    CycleEdit: (id) => buildReviewPath(REVIEW_ROUTES.REVIEW_CYCLES_EDIT(':id'), { id }),

    // Self Assessments
    SelfAssessment: REVIEW_ROUTES.SELF_ASSESSMENT_FORM,
    SelfAssessmentView: (id) => buildReviewPath(REVIEW_ROUTES.SELF_ASSESSMENT_VIEW(':id'), { id }),
    SelfAssessmentList: REVIEW_ROUTES.SELF_ASSESSMENT_LIST,

    // Supervisor Reviews
    ReviewQueue: REVIEW_ROUTES.SUPERVISOR_REVIEW_QUEUE,
    SupervisorReviewForm: (employeeId) => buildReviewPath(REVIEW_ROUTES.SUPERVISOR_REVIEW_FORM(':employeeId'), { employeeId }),
    SupervisorReviewView: (id) => buildReviewPath(REVIEW_ROUTES.SUPERVISOR_REVIEW_VIEW(':id'), { id }),
    PendingApprovals: REVIEW_ROUTES.SUPERVISOR_REVIEW_PENDING_APPROVALS,
    SupervisorReviewList: REVIEW_ROUTES.SUPERVISOR_REVIEW_LIST,

    // Final Ratings
    FinalRatings: REVIEW_ROUTES.FINAL_RATINGS_LIST,
    FinalRatingDetail: (id) => buildReviewPath(REVIEW_ROUTES.FINAL_RATINGS_DETAIL(':id'), { id }),
    RatingDistribution: REVIEW_ROUTES.RATING_DISTRIBUTION,
    FinalRatingStats: REVIEW_ROUTES.FINAL_RATINGS_STATS,

    // PIPs
    PIPs: REVIEW_ROUTES.PIPS_LIST,
    PIPDetail: (id) => buildReviewPath(REVIEW_ROUTES.PIPS_DETAIL(':id'), { id }),
    PIPCreate: REVIEW_ROUTES.PIPS_CREATE,
    PIPEdit: (id) => buildReviewPath(REVIEW_ROUTES.PIPS_EDIT(':id'), { id }),
    PIPReport: REVIEW_ROUTES.PIPS_REPORT,

    // Feedback
    FeedbackRequests: REVIEW_ROUTES.FEEDBACK_REQUESTS,
    FeedbackRequestCreate: REVIEW_ROUTES.FEEDBACK_REQUEST_CREATE,
    FeedbackRespond: (requestId) => buildReviewPath(REVIEW_ROUTES.FEEDBACK_RESPOND(':requestId'), { requestId }),
    FeedbackSummary: REVIEW_ROUTES.FEEDBACK_SUMMARY,

    // Calibration
    CalibrationSessions: REVIEW_ROUTES.CALIBRATION_SESSIONS,
    CalibrationSessionDetail: (id) => buildReviewPath(REVIEW_ROUTES.CALIBRATION_SESSION_DETAIL(':id'), { id }),
    CalibrationSessionCreate: REVIEW_ROUTES.CALIBRATION_SESSION_CREATE,
    CalibrationSessionEdit: (id) => buildReviewPath(REVIEW_ROUTES.CALIBRATION_SESSION_EDIT(':id'), { id }),
    CalibrationReport: REVIEW_ROUTES.CALIBRATION_REPORT,
    CalibrationOutliers: REVIEW_ROUTES.CALIBRATION_OUTLIERS,

    // Coefficients
    Coefficients: REVIEW_ROUTES.COEFFICIENTS_LIST,
    CoefficientCreate: REVIEW_ROUTES.COEFFICIENTS_CREATE,
    CoefficientApply: REVIEW_ROUTES.COEFFICIENT_APPLY,

    // Promotions
    Promotions: REVIEW_ROUTES.PROMOTIONS_LIST,
    PromotionDetail: (id) => buildReviewPath(REVIEW_ROUTES.PROMOTIONS_DETAIL(':id'), { id }),
    PromotionCreate: REVIEW_ROUTES.PROMOTIONS_CREATE,
    PromotionStats: REVIEW_ROUTES.PROMOTIONS_STATS,

    // Templates
    Templates: REVIEW_ROUTES.REVIEW_TEMPLATES_LIST,
    TemplateDetail: (id) => buildReviewPath(REVIEW_ROUTES.REVIEW_TEMPLATES_DETAIL(':id'), { id }),
    TemplateCreate: REVIEW_ROUTES.REVIEW_TEMPLATES_CREATE,
    TemplateEdit: (id) => buildReviewPath(REVIEW_ROUTES.REVIEW_TEMPLATES_EDIT(':id'), { id }),

    // Reports
    Reports: REVIEW_ROUTES.REPORTS,
    EmployeeReport: REVIEW_ROUTES.REPORTS_EMPLOYEE,
    TeamReport: REVIEW_ROUTES.REPORTS_TEAM,
    CycleReport: REVIEW_ROUTES.REPORTS_CYCLE,
    PIPReportGlobal: REVIEW_ROUTES.REPORTS_PIP,
    CalibrationReportGlobal: REVIEW_ROUTES.REPORTS_CALIBRATION,
    ReportExport: REVIEW_ROUTES.REPORTS_EXPORT,

    // Settings
    SystemSettings: REVIEW_ROUTES.SYSTEM_SETTINGS,
    NotificationPreferences: REVIEW_ROUTES.NOTIFICATION_PREFERENCES,
    AuditSettings: REVIEW_ROUTES.AUDIT_SETTINGS,

    // Audit
    AuditLogs: REVIEW_ROUTES.AUDIT_LOGS,

    // Notifications
    Notifications: REVIEW_ROUTES.NOTIFICATIONS,
};