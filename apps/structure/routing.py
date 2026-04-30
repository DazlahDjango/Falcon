"""
WebSocket routing for structure app
Used by Django Channels for real-time updates
"""
from django.urls import re_path, path
from . import consumers

websocket_urlpatterns = [
    re_path(
        r'^ws/structure/(?P<tenant_id>[0-9a-f-]+)/events/$',
        consumers.OrgEventsConsumer.as_asgi(),
        name='structure-events'
    ),
    re_path(
        r'^ws/structure/(?P<tenant_id>[0-9a-f-]+)/reporting/$',
        consumers.ReportingChainConsumer.as_asgi(),
        name='structure-reporting'
    ),
    re_path(
        r'^ws/structure/(?P<tenant_id>[0-9a-f-]+)/permissions/$',
        consumers.PermissionsSyncConsumer.as_asgi(),
        name='structure-permissions'
    ),
    re_path(
        r'^ws/structure/(?P<tenant_id>[0-9a-f-]+)/departments/(?P<department_id>[0-9a-f-]+)/$',
        consumers.OrgEventsConsumer.as_asgi(),
        name='structure-department-events'
    ),
    re_path(
        r'^ws/structure/(?P<tenant_id>[0a-f-]+)/teams/(?P<team_id>[0-9a-f-]+)/$',
        consumers.OrgEventsConsumer.as_asgi(),
        name='structure-team-events'
    ),
]
__all__ = ['websocket_urlpatterns']