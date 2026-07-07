from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    OrganizationViewSet,
    DomainViewSet,
    SchemaViewSet,
    ResourceViewSet,
    ConnectionViewSet,
    MigrationViewSet,
    SettingsViewSet,
    DashboardViewSet,
    AdminOrganizationViewSet,
    SectorViewSet,
    ProvisioningViewSet,
)
from .views.settings_views import SettingsViewSet as SystemSettingsView
from .views.health_views import HealthCheckView, OrganizationsHealthView

app_name = 'organization'

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'domains', DomainViewSet, basename='domain')
router.register(r'schemas', SchemaViewSet, basename='schema')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'connections', ConnectionViewSet, basename='connection')
router.register(r'migrations', MigrationViewSet, basename='migration')
router.register(r'settings', SettingsViewSet, basename='settings')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'admin/organizations', AdminOrganizationViewSet, basename='admin-organization')
router.register(r'sectors', SectorViewSet, basename='sector')
router.register(r'provisioning', ProvisioningViewSet, basename='provisioning')

org_router = routers.NestedDefaultRouter(router, r'organizations', lookup='organization')
org_router.register(r'domains', DomainViewSet, basename='organization-domains')
org_router.register(r'schemas', SchemaViewSet, basename='organization-schemas')
org_router.register(r'resources', ResourceViewSet, basename='organization-resources')
org_router.register(r'connections', ConnectionViewSet, basename='organization-connections')
org_router.register(r'migrations', MigrationViewSet, basename='organization-migrations')

urlpatterns = [
    path('system-settings/', SystemSettingsView.as_view({'get': 'list', 'post': 'update'}), name='system-settings'),
    path('system-settings/reset/', SystemSettingsView.as_view({'post': 'reset'}), name='system-settings-reset'),
    path('', include(router.urls)),
    path('', include(org_router.urls)),
    path('health/', HealthCheckView.as_view(), name='health'),
    path('health/organizations/', OrganizationsHealthView.as_view(), name='organizations-health'),
]