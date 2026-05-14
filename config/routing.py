"""
Channel routing configuration for Falcon PMS.
Central routing for all apps.
"""

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

# Import WebSocket patterns from all apps
from apps.accounts.routing import websocket_urlpatterns as accounts_websocket
from apps.structure.routing import websocket_urlpatterns as structure_websocket
from apps.kpi.routing import websocket_urlpatterns as kpi_websocket
from apps.reviews.routing import websocket_urlpatterns as reviews_websocket  # ADDED - Reviews app WebSockets

# Combined WebSocket URL Patterns
# ===============================
websocket_urlpatterns = []
websocket_urlpatterns.extend(accounts_websocket)
websocket_urlpatterns.extend(structure_websocket)
websocket_urlpatterns.extend(kpi_websocket)
websocket_urlpatterns.extend(reviews_websocket)  # ADDED - Include Reviews WebSocket patterns


# Main Application Router
# ========================
application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})