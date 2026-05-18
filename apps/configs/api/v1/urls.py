from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisteredAppViewSet, AppDependencyViewSet,
    BackupPolicyViewSet, BackupJobViewSet, BackupArtifactViewSet,
    MaintenanceWindowViewSet, MaintenanceLogViewSet,
    DisasterRecoveryPlanViewSet, DisasterRecoveryExecutionViewSet,
    HealthCheckViewSet, HealthCheckHistoryViewSet,
    RiskAssessmentViewSet, ScheduleViewSet,
    BackupQuotaViewSet, EncryptionKeyViewSet, ConfigAuditLogViewSet,
)
from .views.dashboard_views import (
    ConfigDashboardOverview, ConfigBackupDashboard, ConfigMaintenanceDashboard,
    ConfigHealthDashboard, ConfigDRDashboard, ConfigSchedulingDashboard,
    ConfigSecurityDashboard, ConfigRecentActivityDashboard, ConfigSystemStatus
)

router = DefaultRouter()
router.register(r'registered-apps', RegisteredAppViewSet)
router.register(r'app-dependencies', AppDependencyViewSet)
router.register(r'backup-policies', BackupPolicyViewSet)
router.register(r'backup-jobs', BackupJobViewSet)
router.register(r'backup-artifacts', BackupArtifactViewSet)
router.register(r'maintenance-windows', MaintenanceWindowViewSet)
router.register(r'maintenance-logs', MaintenanceLogViewSet)
router.register(r'dr-plans', DisasterRecoveryPlanViewSet)
router.register(r'dr-executions', DisasterRecoveryExecutionViewSet)
router.register(r'health-checks', HealthCheckViewSet)
router.register(r'health-history', HealthCheckHistoryViewSet)
router.register(r'risk-assessments', RiskAssessmentViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'quotas', BackupQuotaViewSet)
router.register(r'encryption-keys', EncryptionKeyViewSet)
router.register(r'audit-logs', ConfigAuditLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/overview/', ConfigDashboardOverview.as_view(), name='config-dashboard-overview'),
    path('dashboard/backup/', ConfigBackupDashboard.as_view(), name='config-dashboard-backup'),
    path('dashboard/maintenance/', ConfigMaintenanceDashboard.as_view(), name='config-dashboard-maintenance'),
    path('dashboard/health/', ConfigHealthDashboard.as_view(), name='config-dashboard-health'),
    path('dashboard/dr/', ConfigDRDashboard.as_view(), name='config-dashboard-dr'),
    path('dashboard/scheduling/', ConfigSchedulingDashboard.as_view(), name='config-dashboard-scheduling'),
    path('dashboard/security/', ConfigSecurityDashboard.as_view(), name='config-dashboard-security'),
    path('dashboard/recent/', ConfigRecentActivityDashboard.as_view(), name='config-dashboard-recent'),
    path('dashboard/status/', ConfigSystemStatus.as_view(), name='config-dashboard-status'),
]