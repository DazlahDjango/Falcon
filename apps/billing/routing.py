"""
WebSocket routing for billing module.
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Main billing WebSocket for all billing events
    re_path(r'ws/billing/$', consumers.BillingConsumer.as_asgi()),
    
    # Invoice-specific WebSocket
    re_path(r'ws/billing/invoices/$', consumers.InvoiceConsumer.as_asgi()),
    
    # Payment-specific WebSocket
    re_path(r'ws/billing/payments/$', consumers.PaymentConsumer.as_asgi()),
]