from django.urls import re_path, path
from channels.routing import URLRouter
from channels.auth import AuthMiddlewareStack
from .middleware import WebSocketAuthMiddleware
from apps.accounts.consumers import AuthConsumer, NotificationConsumer, PresenceConsumer

websocket_urlpatterns = [
    re_path(r'ws/auth/$', AuthConsumer.as_asgi(), name='websocket-auth'),
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi(), name='websocet-notifications'),
    re_path(r'ws/presence/$', PresenceConsumer.as_asgi(), name='websocket-presence'),
    re_path(r'ws/presence/(?P<tenant_id>[0-9a-f-]+)/$', PresenceConsumer.as_asgi(), name='websocket-presence-tenant'),
    re_path(r'ws/notifications/(?P<user_id>[0-9a-f-]+)/$', NotificationConsumer.as_asgi(), name='websocket-notifications-user')
]
websocket_application = WebSocketAuthMiddleware(AuthMiddlewareStack(URLRouter(websocket_urlpatterns)))