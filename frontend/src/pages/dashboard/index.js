// frontend/src/pages/dashboard/index.js

// ==================== EXECUTIVE DASHBOARD ====================
export { default as ExecutiveDashboard } from './ExecutiveDashboard/ExecutiveDashboard';
export { ExecutiveDashboardHeader } from './ExecutiveDashboard/ExecutiveDashboardHeader';
export { ExecutiveOverview } from './ExecutiveDashboard/ExecutiveOverview';
export { ExecutiveDepartments } from './ExecutiveDashboard/ExecutiveDepartments';
export { ExecutiveTrends } from './ExecutiveDashboard/ExecutiveTrends';
export { ExecutiveAlerts } from './ExecutiveDashboard/ExecutiveAlerts';
export { ExecutiveReports } from './ExecutiveDashboard/ExecutiveReports';

// ==================== CLIENT ADMIN DASHBOARD ====================
export { default as ClientAdminDashboard } from './ClientAdminDashboard/ClientAdminDashboard';
export { TenantOverview } from './ClientAdminDashboard/TenantOverview';
export { CompliancePanel } from './ClientAdminDashboard/CompliancePanel';
export { PendingApprovalsPanel } from './ClientAdminDashboard/PendingApprovalsPanel';
export { MissingDataPanel } from './ClientAdminDashboard/MissingDataPanel';
export { KpiBreakdownPanel } from './ClientAdminDashboard/KpiBreakdownPanel';
export { UserActivityPanel } from './ClientAdminDashboard/UserActivityPanel';
export { SettingsPanel } from './ClientAdminDashboard/SettingsPanel';

// ==================== SUPER ADMIN DASHBOARD ====================
export { default as SuperAdminDashboard } from './SuperAdminDashboard/SuperAdminDashboard';
export { PlatformOverview } from './SuperAdminDashboard/PlatformOverview';
export { TenantsTable } from './SuperAdminDashboard/TenantsTable';
export { TenantDetailModal } from './SuperAdminDashboard/TenantDetailModal';
export { SystemHealthPanel } from './SuperAdminDashboard/SystemHealthPanel';
export { SubscriptionAlerts } from './SuperAdminDashboard/SubscriptionAlerts';
export { PlatformMetrics } from './SuperAdminDashboard/PlatformMetrics';
export { BillingOverview } from './SuperAdminDashboard/BillingOverview';

// ==================== MANAGER DASHBOARD ====================
export { default as ManagerDashboard } from './ManagerDashboard/ManagerDashboard';
export { ManagerDashboardHeader } from './ManagerDashboard/ManagerDashboardHeader';
export { TeamOverview } from './ManagerDashboard/TeamOverview';
export { TeamMembersTable } from './ManagerDashboard/TeamMembersTable';
export { PendingApprovalsPanel as ManagerPendingApprovalsPanel } from './ManagerDashboard/PendingApprovalsPanel';
export { TeamPerformanceChart } from './ManagerDashboard/TeamPerformanceChart';
export { ApprovalsHistory } from './ManagerDashboard/ApprovalsHistory';

// ==================== STAFF DASHBOARD ====================
export { default as StaffDashboard } from './StaffDashboard/StaffDashboard';
export { StaffDashboardHeader } from './StaffDashboard/StaffDashboardHeader';
export { MyKPIsPanel } from './StaffDashboard/MyKPIsPanel';
export { MissionStatusPanel } from './StaffDashboard/MissionStatusPanel';
export { PendingTasksPanel } from './StaffDashboard/PendingTasksPanel';
export { SubmissionHistory } from './StaffDashboard/SubmissionHistory';
export { PerformanceTrends } from './StaffDashboard/PerformanceTrends';

// ==================== CHAMPION DASHBOARD ====================
export { default as ChampionDashboard } from './ChampionDashboard/ChampionDashboard';
export { ChampionDashboardHeader } from './ChampionDashboard/ChampionDashboardHeader';
export { DashboardConfigPanel } from './ChampionDashboard/DashboardConfigPanel';
export { KPIAssignmentPanel } from './ChampionDashboard/KPIAssignmentPanel';
export { TargetSettingsPanel } from './ChampionDashboard/TargetSettingsPanel';
export { TemplateLibrary } from './ChampionDashboard/TemplateLibrary';
export { BulkAssignPanel } from './ChampionDashboard/BulkAssignPanel';

// ==================== READ-ONLY DASHBOARD ====================
export { default as ReadOnlyDashboard } from './ReadOnlyDashboard/ReadOnlyDashboard';
export { ReadOnlyDashboardHeader } from './ReadOnlyDashboard/ReadOnlyDashboardHeader';
export { ViewSelector } from './ReadOnlyDashboard/ViewSelector';
export { ExecutiveViewPanel } from './ReadOnlyDashboard/ExecutiveViewPanel';
export { ManagerViewPanel } from './ReadOnlyDashboard/ManagerViewPanel';
export { StaffViewPanel } from './ReadOnlyDashboard/StaffViewPanel';
export { ExportPanel } from './ReadOnlyDashboard/ExportPanel';