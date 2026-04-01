"""
Channel routing configuration for Falcon PMS.
Central routing for all apps.
"""

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

# Import WebSocket patterns from all apps
from apps.accounts.routing import websocket_urlpatterns as accounts_websocket
from apps.organisations.routing import websocket_urlpatterns as organisations_websocket

# Combined WebSocket URL Patterns
# ===============================

websocket_urlpatterns = []
websocket_urlpatterns.extend(accounts_websocket)
websocket_urlpatterns.extend(organisations_websocket)

# Future apps will add their WebSocket patterns here
# websocket_urlpatterns.extend(kpi_websocket)
# websocket_urlpatterns.extend(dashboard_websocket)
# websocket_urlpatterns.extend(reviews_websocket)

# Main Application Router
# ========================

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})