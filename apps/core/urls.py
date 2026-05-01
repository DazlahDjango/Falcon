"""
Custom health check URLs for structure monitoring
"""
from django.urls import path
from ..structure.api.v1.views.health_views import StructureHealthViewSet
from ..structure.api.v1.views.dashboard_views import StructureDashboardViewSet

# Create view instances for URL patterns
health_view = StructureHealthViewSet.as_view({
    'get': 'database_health'
})

cache_view = StructureHealthViewSet.as_view({
    'get': 'cache_health'
})

services_view = StructureHealthViewSet.as_view({
    'get': 'services_health'
})

admin_health_view = StructureHealthViewSet.as_view({
    'get': 'admin_health'
})

metrics_view = StructureHealthViewSet.as_view({
    'get': 'get_metrics'
})

overview_view = StructureDashboardViewSet.as_view({
    'get': 'get_overview'
})

hierarchy_health_view = StructureDashboardViewSet.as_view({
    'get': 'get_hierarchy_health'
})

urlpatterns = [
    path('database/', health_view, name='health-database'),
    path('cache/', cache_view, name='health-cache'),
    path('services/', services_view, name='health-services'),
    path('admin/', admin_health_view, name='health-admin'),
    path('metrics/', metrics_view, name='health-metrics'),
    path('overview/', overview_view, name='health-overview'),
    path('hierarchy/', hierarchy_health_view, name='health-hierarchy'),
]