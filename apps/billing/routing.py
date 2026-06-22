from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/billing/(?P<tenant_id>[0-9a-f-]+)/$', consumers.BillingConsumer.as_asgi(), name='billing_websocket'),
    re_path(r'ws/admin/billing/$', consumers.AdminBillingConsumer.as_asgi(), name='admin_billing_websocket'),
]