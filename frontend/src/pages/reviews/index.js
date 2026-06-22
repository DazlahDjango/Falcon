// src/pages/reviews/index.js
// Main exports for all Reviews pages

// ============ Dashboard Pages ============
export {
  StaffDashboardPage,
  SupervisorDashboardPage,
  ExecutiveDashboardPage,
  AdminDashboardPage,
} from './dashboard';

// ============ Rating Scale Pages ============
export {
  RatingScalesPage,
  RatingScaleDetailPage,
  RatingScaleCreatePage,
  RatingScaleEditPage,
} from './rating-scales';

// ============ Competency Pages ============
export {
  CompetenciesPage,
  CompetencyDetailPage,
  CompetencyCreatePage,
  CompetencyEditPage,
} from './competencies';

// ============ Competency Category Pages ============
export {
  CategoriesPage,
  CategoryCreatePage,
  CategoryEditPage,
} from './competency-categories';

// ============ Review Cycle Pages ============
export {
  CyclesPage,
  CycleDetailPage,
  CycleCreatePage,
  CycleEditPage,
} from './cycles';

// ============ Self Assessment Pages ============
export {
  SelfAssessmentPage,
  SelfAssessmentViewPage,
  SelfAssessmentListPage,
} from './self-assessments';

// ============ Supervisor Review Pages ============
export {
  ReviewQueuePage,
  SupervisorReviewFormPage,
  SupervisorReviewDetailPage,
  PendingApprovalsPage,
  SupervisorReviewListPage,
} from './supervisor-reviews';

// ============ Final Rating Pages ============
export {
  FinalRatingsPage,
  FinalRatingDetailPage,
  RatingDistributionPage,
  FinalRatingStatsPage,
} from './final-ratings';

// ============ PIP Pages ============
export {
  PIPsPage,
  PIPDetailPage,
  PIPCreatePage,
  PIPEditPage,
  PIPReportPage,
} from './pips';

// ============ PIP Action Pages ============
export {
  PIPActionsPage,
  PIPActionDetailPage,
} from './pip-actions';

// ============ Feedback Pages ============
export {
  FeedbackRequestsPage,
  FeedbackRequestCreatePage,
  FeedbackResponsePage,
  FeedbackSummaryPage,
} from './feedback';

// ============ Calibration Pages ============
export {
  CalibrationSessionsPage,
  CalibrationSessionDetailPage,
  CalibrationSessionCreatePage,
  CalibrationSessionEditPage,
  CalibrationReportPage,
  CalibrationOutliersPage,
} from './calibration';

// ============ Coefficient Pages ============
export {
  CoefficientsPage,
  CoefficientCreatePage,
  CoefficientApplyPage,
} from './coefficients';

// ============ Promotion Pages ============
export {
  PromotionsPage,
  PromotionDetailPage,
  PromotionCreatePage,
  PromotionStatsPage,
} from './promotions';

// ============ Template Pages ============
export {
  TemplatesPage,
  TemplateDetailPage,
  TemplateCreatePage,
  TemplateEditPage,
} from './templates';

// ============ Report Pages ============
export {
  ReportsPage,
  EmployeeReportPage,
  TeamReportPage,
  CycleReportPage,
  PIPReportPage,
  CalibrationReportPage,
  ReportExportPage,
} from './reports';

// ============ Settings Pages ============
export {
  SystemSettingsPage,
  NotificationPreferencesPage,
  AuditSettingsPage,
} from './settings';

// ============ Audit Pages ============
export { AuditLogsPage } from './audit';

// ============ Notification Pages ============
export { NotificationsPage } from './notifications';