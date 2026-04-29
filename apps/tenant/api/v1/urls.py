# apps/tenant/api/v1/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import tenant_admin, domain_views, backup_views, schema_views, migration_views, health_views

app_name = 'tenant-api-v1'

router = DefaultRouter()
router.register(r'tenants', tenant_admin.TenantViewSet, basename='tenant')
router.register(r'domains', domain_views.DomainViewSet, basename='domain')
router.register(r'backups', backup_views.BackupViewSet, basename='backup')
router.register(r'schemas', schema_views.SchemaViewSet, basename='schema')
router.register(r'migrations', migration_views.MigrationViewSet,
                basename='migration')

urlpatterns = [
    path('', include(router.urls)),

    # Health check
    path('health/', health_views.HealthCheckView.as_view(), name='health'),
    path('health/tenants/', health_views.TenantsHealthView.as_view(),
         name='tenants-health'),

    # Tenant specific actions
    path('tenants/<uuid:pk>/suspend/',
         tenant_admin.TenantSuspendView.as_view(), name='tenant-suspend'),
    path('tenants/<uuid:pk>/activate/',
         tenant_admin.TenantActivateView.as_view(), name='tenant-activate'),
    path('tenants/<uuid:pk>/provisioning-status/',
         tenant_admin.TenantProvisioningStatusView.as_view(), name='tenant-provisioning-status'),
    path('tenants/<uuid:pk>/usage/',
         tenant_admin.TenantUsageView.as_view(), name='tenant-usage'),

    # Domain specific actions
    path('domains/<uuid:pk>/verify/',
         domain_views.DomainVerifyView.as_view(), name='domain-verify'),
    path('domains/<uuid:pk>/set-primary/',
         domain_views.DomainSetPrimaryView.as_view(), name='domain-set-primary'),

    # Backup specific actions
    path('backups/<uuid:pk>/restore/',
         backup_views.BackupRestoreView.as_view(), name='backup-restore'),
    path('backups/<uuid:pk>/download/',
         backup_views.BackupDownloadView.as_view(), name='backup-download'),

    # Resource endpoints
    path('resources/tenant/<uuid:tenant_id>/',
         tenant_admin.TenantResourcesView.as_view(), name='tenant-resources'),
]
