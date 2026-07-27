"""
Channel routing configuration for Falcon PMS.
Central routing for all apps.
"""

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

# IMPORTANT: Call get_asgi_application FIRST before importing any app modules
# This initializes Django and makes apps ready
django_asgi_app = get_asgi_application()

# Now import WebSocket patterns from all apps (AFTER Django is ready)
from apps.accounts.routing import websocket_urlpatterns as accounts_websocket
from apps.structure.routing import websocket_urlpatterns as structure_websocket
from apps.kpi.routing import websocket_urlpatterns as kpi_websocket
from apps.reviews.routing import websocket_urlpatterns as reviews_websocket
from apps.billing.routing import websocket_urlpatterns as billing_websocket
from apps.configs.routing import websocket_urlpatterns as config_websocket
from apps.dashboard.routing import websocket_urlpatterns as dashboard_websocket
from apps.tenant.routing import websocket_urlpatterns as tenant_websocket
from apps.reportplt.routing import websocket_urlpatterns as reportplt_websocket
from apps.accounts.routing.middleware import WebSocketAuthMiddleware

# Combined WebSocket URL Patterns
websocket_urlpatterns = []
websocket_urlpatterns.extend(accounts_websocket)
websocket_urlpatterns.extend(structure_websocket)
websocket_urlpatterns.extend(kpi_websocket)
websocket_urlpatterns.extend(reviews_websocket)
websocket_urlpatterns.extend(billing_websocket)
websocket_urlpatterns.extend(config_websocket)
websocket_urlpatterns.extend(dashboard_websocket)
websocket_urlpatterns.extend(tenant_websocket)
websocket_urlpatterns.extend(reportplt_websocket)

# Main Application Router
application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        WebSocketAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        )
    ),
})