// frontend/src/routes/config.routes.jsx
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { ConfigGuard } from '../components/config/common/ConfigGuard';
import { ConfigLayout } from '../components/config/common/ConfigLayout';

// Lazy load config pages
const ConfigDashboardPage = lazy(() => import('../pages/config/ConfigDashboardPage'));
const BackupPage = lazy(() => import('../pages/config/BackupPage'));
const BackupDetailsPage = lazy(() => import('../pages/config/BackupDetailsPage'));
const MaintenancePage = lazy(() => import('../pages/config/MaintenancePage'));
const MaintenanceDetailsPage = lazy(() => import('../pages/config/MaintenanceDetailsPage'));
const DisasterRecoveryPage = lazy(() => import('../pages/config/DisasterRecoveryPage'));
const DRPlanDetailsPage = lazy(() => import('../pages/config/DRPlanDetailsPage'));
const HealthCheckPage = lazy(() => import('../pages/config/HealthCheckPage'));
const SchedulePage = lazy(() => import('../pages/config/SchedulePage'));
const QuotaPage = lazy(() => import('../pages/config/QuotaPage'));
const EncryptionPage = lazy(() => import('../pages/config/EncryptionPage'));
const AuditLogPage = lazy(() => import('../pages/config/AuditLogPage'));
const ConfigSettingsPage = lazy(() => import('../pages/config/ConfigSettingsPage'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
);

const configRoutes = [
    {
        path: 'config',
        element: <ConfigGuard />,
        children: [
            {
                element: <ConfigLayout />,
                children: [
                    { index: true, element: <Navigate to="/config/dashboard" replace /> },
                    { path: 'dashboard', element: <Suspense fallback={<LoadingFallback />}><ConfigDashboardPage /></Suspense> },
                    { path: 'backups', element: <Suspense fallback={<LoadingFallback />}><BackupPage /></Suspense> },
                    { path: 'backups/:id', element: <Suspense fallback={<LoadingFallback />}><BackupDetailsPage /></Suspense> },
                    { path: 'maintenance', element: <Suspense fallback={<LoadingFallback />}><MaintenancePage /></Suspense> },
                    { path: 'maintenance/:id', element: <Suspense fallback={<LoadingFallback />}><MaintenanceDetailsPage /></Suspense> },
                    { path: 'disaster-recovery', element: <Suspense fallback={<LoadingFallback />}><DisasterRecoveryPage /></Suspense> },
                    { path: 'disaster-recovery/:id', element: <Suspense fallback={<LoadingFallback />}><DRPlanDetailsPage /></Suspense> },
                    { path: 'health', element: <Suspense fallback={<LoadingFallback />}><HealthCheckPage /></Suspense> },
                    { path: 'schedules', element: <Suspense fallback={<LoadingFallback />}><SchedulePage /></Suspense> },
                    { path: 'quotas', element: <Suspense fallback={<LoadingFallback />}><QuotaPage /></Suspense> },
                    { path: 'encryption', element: <Suspense fallback={<LoadingFallback />}><EncryptionPage /></Suspense> },
                    { path: 'audit-logs', element: <Suspense fallback={<LoadingFallback />}><AuditLogPage /></Suspense> },
                    { path: 'settings', element: <Suspense fallback={<LoadingFallback />}><ConfigSettingsPage /></Suspense> }
                ]
            }
        ]
    }
];

export default configRoutes;