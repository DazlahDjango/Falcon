# apps/tenant/api/v1/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    TenantViewSet, TenantSuspendView, TenantActivateView, TenantProvisioningStatusView,
    TenantUsageView, TenantResourcesView, DomainViewSet, DomainVerifyView, DomainSetPrimaryView,
    TenantDomainsView, BackupViewSet, BackupRestoreView, BackupDownloadView, TenantBackupsView,
    MigrationViewSet, TenantMigrationsView, HealthCheckView, TenantsHealthView, DatabaseHealthView,
    CacheHealthView, SystemHealthView, SchemaViewSet, TenantSchemaView
)

app_name = 'tenant_app'

router = DefaultRouter()
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'domains', DomainViewSet, basename='domain')
router.register(r'backups', BackupViewSet, basename='backup')
router.register(r'schemas', SchemaViewSet, basename='schema')
router.register(r'migrations', MigrationViewSet, basename='migration')

# Tenants base nested routers
tenant_router = routers.NestedDefaultRouter(
    router, r'tenants', lookup='tenant')
tenant_router.register(r'domains', DomainViewSet, basename='tenant-domains')
tenant_router.register(r'backups', BackupViewSet, basename='tenant-backups')
tenant_router.register(r'migrations', MigrationViewSet,
                       basename='tenant-migrations')
tenant_router.register(r'schemas', SchemaViewSet, basename='tenant-schemas')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(tenant_router.urls)),
    # Health check
    path('health/', HealthCheckView.as_view(), name='health'),
    path('health/tenants/', TenantsHealthView.as_view(), name='tenants-health'),
    # Tenant specific actions
    path('tenants/<uuid:pk>/suspend/',
         TenantSuspendView.as_view(), name='tenant-suspend'),
    path('tenants/<uuid:pk>/activate/',
         TenantActivateView.as_view(), name='tenant-activate'),
    path('tenants/<uuid:pk>/provisioning-status/',
         TenantProvisioningStatusView.as_view(), name='tenant-provisioning-status'),
    path('tenants/<uuid:pk>/usage-summary/',
         TenantUsageView.as_view(), name='tenant-usage-summary'),
    path('tenants/<uuid:tenant_id>/resources/',
         TenantResourcesView.as_view(), name='tenant-resources'),
    # Domain specific actions
    path('domains/<uuid:pk>/verify/',
         DomainVerifyView.as_view(), name='domain-verify'),
    path('domains/<uuid:pk>/set-primary/',
         DomainSetPrimaryView.as_view(), name='domain-set-primary'),
    path('tenants/<uuid:tenant_id>/domains/',
         TenantDomainsView.as_view(), name='tenant-domains-list'),
    # Backup specific actions
    path('backups/<uuid:pk>/restore/',
         BackupRestoreView.as_view(), name='backup-restore'),
    path('backups/<uuid:pk>/download/',
         BackupDownloadView.as_view(), name='backup-download'),
    path('tenants/<uuid:tenant_id>/backups/',
         TenantBackupsView.as_view(), name='tenant-backups-list'),
    # Migration specific actions
    path('tenants/<uuid:tenant_id>/migrations/',
         TenantMigrationsView.as_view(), name='tenant-migrations-list'),
    # Schema
    path('tenants/<uuid:tenant_id>/schema/',
         TenantSchemaView.as_view(), name='tenant-schema'),
]
