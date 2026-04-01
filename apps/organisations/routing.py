"""
WebSocket routing for organisations app
"""

from django.urls import re_path
from .consumers import OrganisationUpdateConsumer, SubscriptionAlertConsumer

websocket_urlpatterns = [
    # Organisation updates
    re_path(
        r'ws/organisations/(?P<organisation_id>[^/]+)/updates/$',
        OrganisationUpdateConsumer.as_asgi(),
        name='organisation_updates'
    ),
    
    # Subscription alerts
    re_path(
        r'ws/organisations/(?P<organisation_id>[^/]+)/subscription/$',
        SubscriptionAlertConsumer.as_asgi(),
        name='subscription_alerts'
    ),
]