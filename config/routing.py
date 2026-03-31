"""
Channel routing configuration for Falcon PMS.
Central routing for all apps.
"""
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from apps.accounts.routing import websocket_urlpatterns as accounts_websocket
# Future apps will add their WebSocket patterns here
# Combined WebSocket URL Patterns
# ===============================

websocket_urlpatterns = []
websocket_urlpatterns.extend(accounts_websocket)
# websocket_urlpatterns.extend(other_apps_websocket)

# Main Application Router
# ========================

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})