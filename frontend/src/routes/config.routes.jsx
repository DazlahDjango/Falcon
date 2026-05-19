// frontend/src/routes/config.routes.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// Lazy load pages
const ConfigDashboardPage = React.lazy(() => import('../pages/config/ConfigDashboardPage').then(module => ({ default: module.ConfigDashboardPage })));
const BackupPage = React.lazy(() => import('../pages/config/BackupPage').then(module => ({ default: module.BackupPage })));
const BackupDetailsPage = React.lazy(() => import('../pages/config/BackupDetailsPage').then(module => ({ default: module.BackupDetailsPage })));
const MaintenancePage = React.lazy(() => import('../pages/config/MaintenancePage').then(module => ({ default: module.MaintenancePage })));
const MaintenanceDetailsPage = React.lazy(() => import('../pages/config/MaintenanceDetailsPage').then(module => ({ default: module.MaintenanceDetailsPage })));
const DisasterRecoveryPage = React.lazy(() => import('../pages/config/DisasterRecoveryPage').then(module => ({ default: module.DisasterRecoveryPage })));
const DRPlanDetailsPage = React.lazy(() => import('../pages/config/DRPlanDetailsPage').then(module => ({ default: module.DRPlanDetailsPage })));
const HealthCheckPage = React.lazy(() => import('../pages/config/HealthCheckPage').then(module => ({ default: module.HealthCheckPage })));
const SchedulePage = React.lazy(() => import('../pages/config/SchedulePage').then(module => ({ default: module.SchedulePage })));
const QuotaPage = React.lazy(() => import('../pages/config/QuotaPage').then(module => ({ default: module.QuotaPage })));
const EncryptionPage = React.lazy(() => import('../pages/config/EncryptionPage').then(module => ({ default: module.EncryptionPage })));
const AuditLogPage = React.lazy(() => import('../pages/config/AuditLogPage').then(module => ({ default: module.AuditLogPage })));
const ConfigSettingsPage = React.lazy(() => import('../pages/config/ConfigSettingsPage').then(module => ({ default: module.ConfigSettingsPage })));

// Loading component
const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '16rem' 
    }}>
        <div>Loading Config...</div>
    </div>
);

const withSuspense = (Component) => (
    <React.Suspense fallback={<LoadingFallback />}>
        <Component />
    </React.Suspense>
);

// Export route constants for navigation
export const CONFIG_ROUTES = {
    DASHBOARD: '/config/dashboard',
    BACKUPS: '/config/backups',
    BACKUP_DETAIL: (id = ':id') => `/config/backups/${id}`,
    MAINTENANCE: '/config/maintenance',
    MAINTENANCE_DETAIL: (id = ':id') => `/config/maintenance/${id}`,
    DISASTER_RECOVERY: '/config/disaster-recovery',
    DR_PLAN_DETAIL: (id = ':id') => `/config/disaster-recovery/${id}`,
    HEALTH: '/config/health',
    SCHEDULES: '/config/schedules',
    QUOTAS: '/config/quotas',
    ENCRYPTION: '/config/encryption',
    AUDIT_LOGS: '/config/audit-logs',
    SETTINGS: '/config/settings',
};

// Simple flat routes array - follows your pattern
const configRoutes = [
    // Dashboard
    { path: CONFIG_ROUTES.DASHBOARD, element: withSuspense(ConfigDashboardPage) },
    { path: '/config', element: <Navigate to={CONFIG_ROUTES.DASHBOARD} replace /> },
    
    // Backup
    { path: CONFIG_ROUTES.BACKUPS, element: withSuspense(BackupPage) },
    { path: CONFIG_ROUTES.BACKUP_DETAIL(), element: withSuspense(BackupDetailsPage) },
    
    // Maintenance
    { path: CONFIG_ROUTES.MAINTENANCE, element: withSuspense(MaintenancePage) },
    { path: CONFIG_ROUTES.MAINTENANCE_DETAIL(), element: withSuspense(MaintenanceDetailsPage) },
    
    // Disaster Recovery
    { path: CONFIG_ROUTES.DISASTER_RECOVERY, element: withSuspense(DisasterRecoveryPage) },
    { path: CONFIG_ROUTES.DR_PLAN_DETAIL(), element: withSuspense(DRPlanDetailsPage) },
    
    // Health
    { path: CONFIG_ROUTES.HEALTH, element: withSuspense(HealthCheckPage) },
    
    // Schedules
    { path: CONFIG_ROUTES.SCHEDULES, element: withSuspense(SchedulePage) },
    
    // Quotas
    { path: CONFIG_ROUTES.QUOTAS, element: withSuspense(QuotaPage) },
    
    // Encryption
    { path: CONFIG_ROUTES.ENCRYPTION, element: withSuspense(EncryptionPage) },
    
    // Audit Logs
    { path: CONFIG_ROUTES.AUDIT_LOGS, element: withSuspense(AuditLogPage) },
    
    // Settings
    { path: CONFIG_ROUTES.SETTINGS, element: withSuspense(ConfigSettingsPage) },
];

export default configRoutes;