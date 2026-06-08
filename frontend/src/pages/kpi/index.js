/**
 * KPI Pages Index
 * Main export file for all KPI pages
 */

// Dashboard Pages
export { default as IndividualDashboardPage } from './dashboard/IndividualDashboardPage';
export { default as ManagerDashboardPage } from './dashboard/ManagerDashboardPage';
export { default as ExecutiveDashboardPage } from './dashboard/ExecutiveDashboardPage';
export { default as ChampionDashboardPage } from './dashboard/ChampionDashboardPage';
export { default as AdminDashboardPage } from './dashboard/AdminDashboardPage';

// KPI Pages
export { default as KPIsPage } from './kpis/KPIsPage';
export { default as KPIDetailPage } from './kpis/KPIDetailPage';
export { default as KPIEditPage } from './kpis/KPIEditPage';

// Target Pages
export { default as TargetsPage } from './targets/TargetsPage';
export { default as TargetPhasingPage } from './targets/TargetPhasingPage';

// Actual Pages
export { default as ActualsPage } from './actuals/ActualsPage';

// Validation Pages
export { default as ValidationsPage } from './validations/ValidationsPage';

// Analytics Pages
export { default as AnalyticsPage } from './analytics/AnalyticsPage';
export { default as ReportsPage } from './analytics/ReportsPage';
export { default as OrganizationHealthPage } from './analytics/OrganizationHealthPage';

// Settings Pages
export { default as SystemSettingsPage } from './settings/SystemSettingsPage';
export { default as ReferenceDataPage } from './settings/ReferenceDataPage';
export { default as NotificationPreferencesPage } from './settings/NotificationPreferencesPage';

// Audit Pages
export { default as AuditLogsPage } from './audit/AuditLogsPage';

// Bulk Pages
export { default as BulkUploadPage } from './bulk/BulkUploadPage';

// User Pages
export { default as UserKPIPage } from './users/UserKPIPage';