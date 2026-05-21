# apps/tenant/api/v1/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    TenantViewSet, DomainViewSet, BackupViewSet, MigrationViewSet,
    SchemaViewSet, ConnectionPoolViewSet,
    HealthCheckView, TenantsHealthView,
)
from .views.system_settings_views import (
    TenantSystemSettingsView,
    TenantSystemSettingsResetView,
)
from .views.reference_data import TenantReferenceDataView

app_name = 'tenant_app'

# Main router
router = DefaultRouter()
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'domains', DomainViewSet, basename='domain')
router.register(r'backups', BackupViewSet, basename='backup')
router.register(r'migrations', MigrationViewSet, basename='migration')
router.register(r'schemas', SchemaViewSet, basename='schema')
router.register(r'connections', ConnectionPoolViewSet, basename='connection')

# Nested router - provides /tenants/{tenant_pk}/domains/ etc.
tenant_router = routers.NestedDefaultRouter(router, r'tenants', lookup='tenant')
tenant_router.register(r'domains', DomainViewSet, basename='tenant-domains')
tenant_router.register(r'backups', BackupViewSet, basename='tenant-backups')
tenant_router.register(r'migrations', MigrationViewSet, basename='tenant-migrations')
tenant_router.register(r'schemas', SchemaViewSet, basename='tenant-schemas')

urlpatterns = [
    path('system-settings/', TenantSystemSettingsView.as_view(), name='tenant-system-settings'),
    path('system-settings/reset/', TenantSystemSettingsResetView.as_view(), name='tenant-system-settings-reset'),
    path('reference-data/', TenantReferenceDataView.as_view(), name='tenant-reference-data'),
    # All CRUD + @action endpoints
    path('', include(router.urls)),
    path('', include(tenant_router.urls)),
    
    # Standalone health endpoints
    path('health/', HealthCheckView.as_view(), name='health'),
    path('health/tenants/', TenantsHealthView.as_view(), name='tenants-health'),
]