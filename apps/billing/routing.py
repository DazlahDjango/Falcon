"""
Billing WebSocket Routing
Routes WebSocket connections to appropriate consumers.
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Tenant billing WebSocket (real-time updates for tenant users)
    re_path(
        r'ws/billing/(?P<tenant_id>[0-9a-f-]+)/$',
        consumers.BillingConsumer.as_asgi(),
        name='billing_websocket'
    ),
    
    # Admin billing WebSocket (system monitoring)
    re_path(
        r'ws/admin/billing/$',
        consumers.AdminBillingConsumer.as_asgi(),
        name='admin_billing_websocket'
    ),
]