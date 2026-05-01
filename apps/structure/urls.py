"""
Structure app URL configuration
Includes WebSocket routing for real-time updates
"""
from django.urls import path, include

app_name = 'structure'

urlpatterns = [
    # REST API v1
    path('api/v1/', include('apps.structure.api.v1.urls')),
]
# WebSocket URL patterns (used by channels routing)
websocket_urlpatterns = [
    path('ws/structure/<uuid:tenant_id>/events/', 'apps.structure.consumers.OrgEventsConsumer.as_asgi()'),
    path('ws/structure/<uuid:tenant_id>/reporting/', 'apps.structure.consumers.ReportingChainConsumer.as_asgi()'),
    path('ws/structure/<uuid:tenant_id>/permissions/', 'apps.structure.consumers.PermissionsSyncConsumer.as_asgi()'),
]