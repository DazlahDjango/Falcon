// frontend/src/pages/dashboard/index.js

// ==================== EXECUTIVE DASHBOARD ====================
export { default as ExecutiveDashboard, default as ExecutiveOverview } from './ExecutiveDashboard/ExecutiveDashboard';

// ==================== CLIENT ADMIN DASHBOARD ====================
export { default as ClientAdminDashboard, default as ClientAdminOverview } from './ClientAdminDashboard/ClientAdminDashboard';

// ==================== SUPER ADMIN DASHBOARD ====================
export { default as SuperAdminDashboard, default as SuperAdminOverview } from './SuperAdminDashboard/SuperAdminDashboard';

// ==================== MANAGER DASHBOARD ====================
export { default as ManagerDashboard, default as ManagerOverview } from './ManagerDashboard/ManagerDashboard';

// ==================== STAFF DASHBOARD ====================
export { default as StaffDashboard, default as StaffOverview } from './StaffDashboard/StaffDashboard';

// ==================== CHAMPION DASHBOARD ====================
export { default as ChampionDashboard, default as ChampionOverview } from './ChampionDashboard/ChampionDashboard';
export { default as ChampionDashboardHeader } from './ChampionDashboard/ChampionDashboardHeader';
export { default as DashboardConfigPanel } from './ChampionDashboard/DashboardConfigPanel';
export { default as KPIAssignmentPanel } from './ChampionDashboard/KPIAssignmentPanel';
export { default as TargetSettingsPanel } from './ChampionDashboard/TargetSettingsPanel';
export { default as TemplateLibrary } from './ChampionDashboard/TemplateLibrary';
export { default as BulkAssignPanel } from './ChampionDashboard/BulkAssignPanel';

// ==================== READ-ONLY DASHBOARD ====================
export { default as ReadOnlyDashboard, default as ReadOnlyOverview } from './ReadOnlyDashboard/ReadOnlyDashboard';